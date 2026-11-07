import fs from 'node:fs'
import path from 'node:path'

import { t } from '../i18n/index.js'
import { resolveGraphIdForGraph } from '../runtime/graph_defaults.js'
import type {
  Argument,
  ClientIRDocument,
  ClientNode,
  ConnectionArgument,
  IRDocument,
  NextConnection,
  ServerIRDocument,
  ServerNode,
  Variable
} from '../runtime/IR.js'

type IrSource = {
  doc: IRDocument
  sourceJsonPath: string
  sourceIndex: number
}

type AnyIRDocument = ServerIRDocument | ClientIRDocument
type AnyIRNode = ServerNode | ClientNode
type AnyGraphInfo = IRDocument['graph']

type GstsMergeMeta = {
  merged: true
  graphId: number
  sources: string[]
}

type IrWithGstsMeta = IRDocument & { __gsts?: GstsMergeMeta }

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function isMergedMarker(v: unknown): boolean {
  if (!isRecord(v)) return false
  const meta = v.__gsts
  if (!isRecord(meta)) return false
  return meta.merged === true
}

function sanitizeFileName(name: string): string {
  return name.trim().replace(/[<>:"/\\|?*]+/g, '_')
}

function isExplicitGraphNameForSource(name: unknown, sourceJsonPath: string): name is string {
  if (typeof name !== 'string') return false
  const s = name
  if (!s.length) return false
  // runner 默认 name 通常为 `_GSTS_<entryBaseName>`，这里用 json 文件名反推默认名，区分“默认命名”与“显式命名”
  const base = path.basename(sourceJsonPath, '.json')
  let stripped = s
  if (stripped.startsWith('_GSTS_')) stripped = stripped.slice('_GSTS_'.length)
  if (stripped.toLowerCase() === base.toLowerCase()) return false
  return true
}

function isIrDocumentLike(doc: unknown): doc is IRDocument {
  if (!isRecord(doc)) return false
  if (doc.ir_version !== 1 || doc.ir_type !== 'node_graph') return false
  if (!isRecord(doc.graph)) return false
  const gt = doc.graph.type
  if (gt !== 'server' && gt !== 'client') return false
  return true
}

function isInternalGstsVarName(name: string): boolean {
  return /^_gsts/i.test(name)
}

/** The stage entity variable is the same in every file, so merged files share one. */
const STAGE_VAR_NAME = '__gsts_stage'

/** Timer names gsts generates: `__gsts_<kind>_<call site>_<pool slot>_<graph id suffix>`. */
const GENERATED_TIMER_NAME = /^__gsts_(timeout|interval)_(\d+)_\d+_\d+$/

function buildSourceTag(outDirAbs: string, sourceJsonPath: string, sourceIndex: number): string {
  const rel = path.relative(outDirAbs, sourceJsonPath)
  const noExt = rel.replace(/\.json$/i, '')
  const flattened = noExt.replace(/[\\/]/g, '_')
  return sanitizeFileName(`${flattened}_${sourceIndex}`)
}

function getNodes(doc: AnyIRDocument): AnyIRNode[] {
  const nodes = doc.nodes
  return Array.isArray(nodes) ? (nodes as AnyIRNode[]) : []
}

function rewriteNodeGraphVariableRefsInPlace(doc: AnyIRDocument, rename: Map<string, string>) {
  for (const n of getNodes(doc)) {
    const type = n.type
    if (type !== 'get_node_graph_variable' && type !== 'set_node_graph_variable') continue
    const a0 = n.args?.[0]
    if (!a0 || a0.type !== 'str') continue
    const next = rename.get(a0.value)
    if (next) a0.value = next
  }
}

function rewriteVariablesInPlace(doc: AnyIRDocument, rename: Map<string, string>) {
  const vars = doc.variables
  if (!Array.isArray(vars)) return
  for (const v of vars) {
    const next = rename.get(v.name)
    if (next) v.name = next
  }
}

function collectInternalVarNames(doc: AnyIRDocument): Set<string> {
  const out = new Set<string>()
  for (const v of doc.variables ?? []) {
    if (isInternalGstsVarName(v.name)) out.add(v.name)
  }
  for (const n of getNodes(doc)) {
    const type = n.type
    if (type !== 'get_node_graph_variable' && type !== 'set_node_graph_variable') continue
    const a0 = n.args?.[0]
    if (!a0 || a0.type !== 'str') continue
    if (isInternalGstsVarName(a0.value)) out.add(a0.value)
  }
  return out
}

/**
 * A timer started inside a gstsServer function called from several of the merged files: each file
 * brings its own handler for the same timer names, so the merged graph would run the callback once per file.
 */
function assertNoSharedTimers(outDirAbs: string, graphId: number, items: IrSource[]) {
  const filesByTimer = new Map<string, string[]>()
  for (const it of items) {
    const timers = new Set<string>()
    for (const n of getNodes(it.doc as AnyIRDocument)) {
      for (const arg of n.args ?? []) {
        const match = arg?.type === 'str' ? GENERATED_TIMER_NAME.exec(arg.value) : null
        if (match) timers.add(`__gsts_${match[1]}_${match[2]}`)
      }
    }
    const file = path.relative(outDirAbs, it.sourceJsonPath).replace(/\.json$/i, '.ts')
    for (const timer of timers) filesByTimer.set(timer, [...(filesByTimer.get(timer) ?? []), file])
  }
  for (const [timer, files] of filesByTimer) {
    if (files.length < 2) continue
    throw new Error(
      t('err_mergeSharedTimer', {
        id: String(graphId),
        files: [...new Set(files)].join(', '),
        call: timer.startsWith('__gsts_timeout_') ? 'setTimeout' : 'setInterval',
        timer
      })
    )
  }
}

function pickTopmostDir(outDirAbs: string, paths: string[]): string {
  const scored = paths
    .map((p) => {
      const rel = path.relative(outDirAbs, p)
      const segs = rel.split(path.sep).filter(Boolean)
      const depth = Math.max(0, segs.length - 1) // dir depth
      return { p, depth, rel }
    })
    .sort((a, b) => a.depth - b.depth || a.rel.localeCompare(b.rel))
  return path.dirname(scored[0]?.p ?? outDirAbs)
}

function mergeVariablesOrThrowByName(
  items: { source: string; vars: Variable[] | undefined }[]
): Variable[] | undefined {
  const all: Variable[] = []
  const byName = new Map<string, Set<string>>()
  for (const it of items) {
    for (const v of it.vars ?? []) {
      if (v.name === STAGE_VAR_NAME && byName.has(v.name)) continue
      all.push(v)
      const s = byName.get(v.name) ?? new Set<string>()
      s.add(it.source)
      byName.set(v.name, s)
    }
  }
  if (!all.length) return undefined

  const duplicates: { name: string; sources: string[] }[] = []
  for (const [name, sources] of byName) {
    if (sources.size > 1) {
      duplicates.push({ name, sources: [...sources].sort((a, b) => a.localeCompare(b)) })
    }
  }
  if (duplicates.length) {
    const lines = duplicates
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 50)
      .map((d) => `- ${d.name}: ${d.sources.join(', ')}`)
      .join('\n')
    throw new Error(
      t('err_mergeDuplicateVarsByName', {
        count: duplicates.length,
        lines,
        truncated: duplicates.length > 50 ? t('err_mergeTruncated') : '',
        hint: t('err_mergeDuplicateVarsHint')
      })
    )
  }

  return all
}

function remapNextConn(conn: NextConnection, map: Map<number, number>): NextConnection {
  if (typeof conn === 'number') {
    return map.get(conn) ?? conn
  }
  return { ...conn, node_id: map.get(conn.node_id) ?? conn.node_id }
}

function remapArg(arg: Argument, map: Map<number, number>): Argument {
  if (!arg || arg.type !== 'conn') return arg
  const conn = arg
  return {
    ...conn,
    value: { ...conn.value, node_id: map.get(conn.value.node_id) ?? conn.value.node_id }
  } satisfies ConnectionArgument
}

function remapNodeIdsInNode(node: AnyIRNode, map: Map<number, number>) {
  node.id = map.get(node.id) ?? node.id
  if (node.args?.length) node.args = node.args.map((a) => remapArg(a, map))
  if (node.next?.length) node.next = node.next.map((n) => remapNextConn(n, map))
}

function normalizeGraphModeCompatibility(a: AnyGraphInfo, b: AnyGraphInfo) {
  const ma = a.mode
  const mb = b.mode
  if (ma && mb && ma !== mb) {
    throw new Error(
      t(a.type === 'server' ? 'err_mergeServerModeMismatch' : 'err_mergeClientModeMismatch', {
        id: String(a.id),
        a: String(ma),
        b: String(mb)
      })
    )
  }
  if (!ma && mb) {
    a.mode = mb
  }
}

function normalizeGraphCompatibility(base: IRDocument, next: IRDocument, _sourceJsonPath: string) {
  const a = base.graph
  const b = next.graph
  if (a.type !== b.type) {
    throw new Error(
      t('err_mergeGraphIdTypeCollision', {
        id: String(resolveGraphIdForGraph(a)),
        a: String(a.type),
        b: String(b.type)
      })
    )
  }
  // server/client 都遵守同一条 mode 规则：
  // - 双方都有 mode 时必须一致
  // - 只有一方有 mode 时，用显式填写的一方补齐合并结果
  normalizeGraphModeCompatibility(a, b)

  if (a.type === 'server' && b.type === 'server') {
    // 规则：
    // - 若只有一个显式填写 sub_type：用填写的那个
    // - 若多个显式填写且不一致：报错
    const sa = a.sub_type
    const sb = b.sub_type
    if (sa && sb && sa !== sb) {
      throw new Error(
        t('err_mergeServerSubTypeMismatch', {
          id: String(a.id),
          a: String(sa),
          b: String(sb)
        })
      )
    }
    if (!sa && sb) {
      a.sub_type = sb
    }
    return
  }
  if (a.type === 'client' && b.type === 'client') {
    const sa = a.sub_type
    const sb = b.sub_type
    if (sa !== sb) {
      throw new Error(
        t('err_mergeClientSubTypeMismatch', {
          id: String(a.id),
          a: String(sa),
          b: String(sb)
        })
      )
    }
  }
}

export type MergeGroupResult = {
  graphId: number
  outJsonPath: string
  merged: IRDocument
  sourceJsonPaths: string[]
  sourceIndex?: number
  mergedOutput?: boolean
}

type MergeParams = {
  outDirAbs: string
  irJsonPaths: string[]
}

function appendIrSources(items: IrSource[], source: string, sourceJsonPath: string) {
  const raw: unknown = JSON.parse(source)
  if (isMergedMarker(raw)) return
  const list = Array.isArray(raw) ? raw : [raw]
  list.forEach((doc, sourceIndex) => {
    if (isMergedMarker(doc) || !isIrDocumentLike(doc)) return
    items.push({ doc, sourceJsonPath, sourceIndex })
  })
}

export function mergeIrJsonFilesByGraphId(params: MergeParams): MergeGroupResult[] {
  const items: IrSource[] = []
  for (const p of params.irJsonPaths) {
    appendIrSources(items, fs.readFileSync(p, 'utf8'), p)
  }
  return mergeIrSources(params.outDirAbs, items)
}

/** Prefetch a bounded window; parse and report failures in the original input order. */
export async function mergeIrJsonFilesByGraphIdAsync(
  params: MergeParams
): Promise<MergeGroupResult[]> {
  type ReadResult = { ok: true; source: string } | { ok: false; error: unknown }
  const pending: Promise<ReadResult>[] = []
  const items: IrSource[] = []
  let readFailed = false
  const read = (file: string): Promise<ReadResult> =>
    fs.promises.readFile(file, 'utf8').then(
      (source) => ({ ok: true, source }),
      (error: unknown) => {
        readFailed = true
        return { ok: false, error }
      }
    )
  let next = 0
  while (next < Math.min(8, params.irJsonPaths.length)) {
    pending.push(read(params.irJsonPaths[next++]))
  }
  try {
    for (const file of params.irJsonPaths) {
      const result = await pending.shift()!
      if (!result.ok) throw result.error
      appendIrSources(items, result.source, file)
      if (!readFailed && next < params.irJsonPaths.length) {
        pending.push(read(params.irJsonPaths[next++]))
      }
    }
  } finally {
    // No new reads after the first ordered failure, no unhandled rejections or pending I/O
    // when this invocation settles. Like the sync API, merge writes start only after all reads.
    await Promise.all(pending)
  }
  return mergeIrSources(params.outDirAbs, items)
}

function mergeIrSources(outDirAbs: string, items: IrSource[]): MergeGroupResult[] {
  const groups = new Map<number, IrSource[]>()
  for (const it of items) {
    // 用户未指定 id 时，按节点图类型使用默认 id；合并也按同样规则分组。
    const gid = resolveGraphIdForGraph(it.doc.graph)
    const arr = groups.get(gid) ?? []
    arr.push(it)
    groups.set(gid, arr)
  }

  const results: MergeGroupResult[] = []

  for (const [graphId, list] of groups) {
    if (!list.length) continue
    const ordered = [...list].sort(
      (a, b) => a.sourceJsonPath.localeCompare(b.sourceJsonPath) || a.sourceIndex - b.sourceIndex
    )

    // 若 graphId 不重复，则不生成合并文件，直接沿用原 json
    if (ordered.length === 1) {
      results.push({
        graphId,
        outJsonPath: ordered[0].sourceJsonPath,
        merged: ordered[0].doc,
        sourceJsonPaths: [ordered[0].sourceJsonPath],
        sourceIndex: ordered[0].sourceIndex,
        mergedOutput: false
      })
      continue
    }

    // Every document above comes from this invocation's JSON.parse and belongs exclusively to
    // one graph-id group, so the merge can safely consume it in place.
    const base = ordered[0].doc as AnyIRDocument
    for (const it of ordered.slice(1)) {
      normalizeGraphCompatibility(base, it.doc, it.sourceJsonPath)
    }
    if (base.graph.type === 'client') {
      throw new Error(
        t('err_mergeDuplicateClientGraphId', {
          id: String(graphId)
        })
      )
    }

    assertNoSharedTimers(outDirAbs, graphId, ordered)

    const topDir = pickTopmostDir(
      outDirAbs,
      ordered.map((x) => x.sourceJsonPath)
    )
    const dirName = path.basename(topDir)
    let explicitName: string | undefined
    for (const it of ordered) {
      const name = it.doc.graph.name
      if (isExplicitGraphNameForSource(name, it.sourceJsonPath)) {
        explicitName = name
        break
      }
    }

    const nameForFile = (() => {
      if (explicitName) {
        return explicitName.startsWith('_GSTS_')
          ? explicitName.slice('_GSTS_'.length)
          : explicitName
      }
      return dirName
    })()
    const fileBaseName = sanitizeFileName(`${nameForFile}_${graphId}`)
    base.graph.id = graphId
    base.graph.name = explicitName ?? `_GSTS_${dirName}`

    const mergedNodes: AnyIRNode[] = []
    let nextId = 1
    const varsAfterRename: { source: string; vars: Variable[] | undefined }[] = []
    for (const it of ordered) {
      const sourceDoc = it.doc as AnyIRDocument

      // 变量重命名：把所有 _gsts* 变量按源文件打 tag，避免合并后同名互相覆盖
      const tag = buildSourceTag(outDirAbs, it.sourceJsonPath, it.sourceIndex)
      const internalNames = collectInternalVarNames(sourceDoc)
      const rename = new Map<string, string>()
      for (const name of internalNames) {
        rename.set(name, `${name}__${tag}`)
      }
      if (rename.size) {
        rewriteVariablesInPlace(sourceDoc, rename)
        rewriteNodeGraphVariableRefsInPlace(sourceDoc, rename)
      }

      varsAfterRename.push({ source: it.sourceJsonPath, vars: sourceDoc.variables })

      const nodes = getNodes(sourceDoc)
      if (!nodes.length) continue

      const map = new Map<number, number>()
      for (const n of nodes) {
        map.set(n.id, nextId++)
      }

      nodes.forEach((n) => remapNodeIdsInNode(n, map))
      mergedNodes.push(...nodes)
    }

    const mergedVars = mergeVariablesOrThrowByName(varsAfterRename)
    if (mergedVars?.length) base.variables = mergedVars
    base.nodes = mergedNodes

    const outJsonPath = path.join(topDir, `${fileBaseName}.json`)
    const sourceJsonPaths = [...new Set(ordered.map((x) => x.sourceJsonPath))]
    ;(base as IrWithGstsMeta).__gsts = { merged: true, graphId, sources: sourceJsonPaths }
    fs.mkdirSync(path.dirname(outJsonPath), { recursive: true })
    fs.writeFileSync(outJsonPath, JSON.stringify(base, null, 2) + '\n', 'utf8')

    results.push({
      graphId,
      outJsonPath,
      merged: base,
      sourceJsonPaths,
      mergedOutput: true
    })
  }

  return results.sort((a, b) => a.graphId - b.graphId)
}
