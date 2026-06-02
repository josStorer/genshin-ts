import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

import { NODE_ID } from '../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_id.js'
import { NODE_PIN_RECORDS } from '../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_pin_records.js'
import { SPECIAL_NODE_IDS, SPECIAL_NODE_MAPPINGS } from '../src/compiler/ir_to_gia_transform/mappings.js'

type FindingKind =
  | 'missing_node_id'
  | 'missing_pin_record'
  | 'args_count_mismatch_nodes_more'
  | 'args_count_mismatch_thirdparty_more'
  | 'dynamic_node_type'

type Finding = {
  kind: FindingKind
  nodeType: string
  nodeId?: number
  expectedInputs?: number
  observedArgs?: number[]
  locations?: Array<{ file: string; line: number; col: number }>
  note?: string
}

const ROOT = process.cwd()
const NODES_TS = path.join(ROOT, 'src/definitions/nodes.ts')
const OUT_DIR = path.join(ROOT, 'tests/generated')
const OUT_JSON = path.join(OUT_DIR, '_node_def_consistency.json')
const OUT_MD = path.join(OUT_DIR, '_node_def_consistency.md')

// 已知：这些节点在 IR->GIA 阶段会做“补空 pin / 删除隐藏 pin”等特殊处理，
// nodes.ts 的 args 数量与 thirdparty pin record 可能不一致，暂时不作为错误输出。
const ARG_MISMATCH_ALLOWLIST = new Set<string>([
  'create_prefab',
  'create_prefab_group',
  'activate_disable_follow_motion_device',
  'activate_disable_collision_trigger_source',
  'activate_disable_character_disruptor_device',
  // Editor export verification: 2026-06-01-verify1.gia.
  // These nodes keep hidden/hole input pin indices in exported GIA, so nodes.ts intentionally
  // exposes only the logical arguments.
  'set_custom_variable',
  'activate_disable_pathfinding_obstacle',
  'activate_disable_pathfinding_obstacle_feature',
  'remove_unit_status',
  'exponentiation'
])

function posOf(sf: ts.SourceFile, n: ts.Node) {
  const p = sf.getLineAndCharacterOfPosition(n.getStart(sf, false))
  return { file: NODES_TS, line: p.line + 1, col: p.character + 1 }
}

function tryEvalStringLiteral(expr: ts.Expression): string | null {
  if (ts.isStringLiteral(expr)) return expr.text
  if (ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text
  // 简单支持 `a + 'b' + 'c'` 形式
  if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const l = tryEvalStringLiteral(expr.left)
    const r = tryEvalStringLiteral(expr.right)
    if (l !== null && r !== null) return l + r
  }
  return null
}

function extractRegisterNodes(): Map<
  string,
  { argCounts: Set<number>; locations: Array<{ file: string; line: number; col: number }>; dynamic: boolean }
> {
  const code = fs.readFileSync(NODES_TS, 'utf8')
  const sf = ts.createSourceFile(NODES_TS, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

  const out = new Map<
    string,
    { argCounts: Set<number>; locations: Array<{ file: string; line: number; col: number }>; dynamic: boolean }
  >()

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'registerNode'
    ) {
      const arg0 = node.arguments[0]
      if (arg0 && ts.isObjectLiteralExpression(arg0)) {
        const nodeTypeProp = arg0.properties.find(
          (p) =>
            ts.isPropertyAssignment(p) &&
            ((ts.isIdentifier(p.name) && p.name.text === 'nodeType') ||
              (ts.isStringLiteral(p.name) && p.name.text === 'nodeType'))
        ) as ts.PropertyAssignment | undefined

        const argsProp = arg0.properties.find(
          (p) =>
            ts.isPropertyAssignment(p) &&
            ((ts.isIdentifier(p.name) && p.name.text === 'args') ||
              (ts.isStringLiteral(p.name) && p.name.text === 'args'))
        ) as ts.PropertyAssignment | undefined

        if (nodeTypeProp && argsProp) {
          const nodeType = tryEvalStringLiteral(nodeTypeProp.initializer)
          const argsInit = argsProp.initializer
          const argCount = ts.isArrayLiteralExpression(argsInit) ? argsInit.elements.length : null

          const dynamic = nodeType === null
          const key = nodeType ?? '<dynamic>'

          const record = out.get(key) ?? {
            argCounts: new Set<number>(),
            locations: [],
            dynamic
          }
          record.dynamic = record.dynamic || dynamic
          record.locations.push(posOf(sf, nodeTypeProp.initializer))
          if (argCount !== null) record.argCounts.add(argCount)
          out.set(key, record)
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return out
}

function buildNodeIdLower(): Map<string, number> {
  return new Map<string, number>(Object.entries(NODE_ID).map(([k, v]) => [k.toLowerCase(), v]))
}

function findPinRecordByNodeId(nodeId: number) {
  // 注意：NODE_ID 数值在 thirdparty 里可能“复用”（不同节点/不同泛型实例共享同一个数字，或 reflectMap 里出现与其它节点 id 相同的值）。
  // 因此必须优先匹配 r.id === nodeId；只有找不到时才 fallback 到 reflectMap。
  const direct = NODE_PIN_RECORDS.find((r) => r.id === nodeId)
  if (direct) return direct
  return NODE_PIN_RECORDS.find(
    (r) => Array.isArray((r as any).reflectMap) && (r as any).reflectMap.some((pair: any) => pair?.[0] === nodeId)
  )
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const nodes = extractRegisterNodes()
  const nodeIdLower = buildNodeIdLower()

  const findings: Finding[] = []

  for (const [nodeTypeKey, info] of nodes) {
    if (nodeTypeKey === '<dynamic>') {
      findings.push({
        kind: 'dynamic_node_type',
        nodeType: nodeTypeKey,
        locations: info.locations,
        note: 'nodeType 不是静态字符串（模板/变量/复杂表达式），跳过精确对账'
      })
      continue
    }

    const nodeType = nodeTypeKey
    if (ARG_MISMATCH_ALLOWLIST.has(nodeType)) continue

    // 与 IR->GIA 的 resolveGiaNodeId 对齐：先做特殊映射
    const mappedType = SPECIAL_NODE_MAPPINGS[nodeType] ?? nodeType
    const specialId = SPECIAL_NODE_IDS[mappedType]

    const direct = nodeIdLower.get(mappedType.toLowerCase())
    const generic = nodeIdLower.get(`${mappedType.toLowerCase()}__generic`)
    const nodeId = specialId ?? direct ?? generic

    if (!nodeId) {
      findings.push({
        kind: 'missing_node_id',
        nodeType,
        observedArgs: [...info.argCounts].sort((a, b) => a - b),
        locations: info.locations,
        note: 'thirdparty NODE_ID 中找不到该 nodeType（经过 SPECIAL_NODE_MAPPINGS 映射后的 direct 或 __generic）'
      })
      continue
    }

    const pinRecord = findPinRecordByNodeId(nodeId)
    if (!pinRecord) {
      findings.push({
        kind: 'missing_pin_record',
        nodeType,
        nodeId,
        observedArgs: [...info.argCounts].sort((a, b) => a - b),
        locations: info.locations,
        note: specialId
          ? '该节点为 SPECIAL_NODE_IDS（可能是编辑器“信号/结构体”类特殊节点），thirdparty pin records 未覆盖'
          : 'thirdparty NODE_PIN_RECORDS 中找不到该 nodeId（含 reflectMap）'
      })
      continue
    }

    const expectedInputs = pinRecord.inputs?.length ?? 0
    const observed = [...info.argCounts].sort((a, b) => a - b)
    if (observed.length > 0 && !observed.includes(expectedInputs)) {
      // 多数情况下 observed 只有一个值；若存在多个值，按“最接近 expectedInputs 的那个”来判断方向
      const closest = observed.reduce((best, cur) => {
        const db = Math.abs(best - expectedInputs)
        const dc = Math.abs(cur - expectedInputs)
        if (dc < db) return cur
        return best
      }, observed[0]!)
      const kind: FindingKind =
        closest > expectedInputs ? 'args_count_mismatch_nodes_more' : 'args_count_mismatch_thirdparty_more'
      findings.push({
        kind,
        nodeType,
        nodeId,
        expectedInputs,
        observedArgs: observed,
        locations: info.locations,
        note: `thirdparty pin inputs=${expectedInputs}，nodes.ts registerNode(args)=${observed.join(',')}`
      })
    }
  }

  const summary = findings.reduce<Record<FindingKind, number>>((acc, f) => {
    acc[f.kind] = (acc[f.kind] ?? 0) + 1
    return acc
  }, {} as Record<FindingKind, number>)

  const payload = {
    generatedAt: new Date().toISOString(),
    nodesTs: path.relative(ROOT, NODES_TS),
    totals: {
      registerNodeCalls: [...nodes.values()].reduce((n, v) => n + v.locations.length, 0),
      uniqueNodeTypes: [...nodes.keys()].length
    },
    summary,
    findings
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), 'utf8')

  const lines: string[] = []
  lines.push(`# Node Def Consistency Report`)
  lines.push(`- generatedAt: ${payload.generatedAt}`)
  lines.push(`- nodes.ts: ${payload.nodesTs}`)
  lines.push(`- registerNodeCalls: ${payload.totals.registerNodeCalls}`)
  lines.push(`- uniqueNodeTypes: ${payload.totals.uniqueNodeTypes}`)
  lines.push(``)
  lines.push(`## Summary`)
  for (const k of Object.keys(summary).sort()) {
    lines.push(`- ${k}: ${summary[k as FindingKind]}`)
  }
  lines.push(``)
  lines.push(`## Findings`)
  for (const f of findings) {
    lines.push(`- kind=${f.kind} nodeType=${f.nodeType} nodeId=${f.nodeId ?? ''}`.trim())
    if (f.expectedInputs !== undefined) lines.push(`  - expectedInputs: ${f.expectedInputs}`)
    if (f.observedArgs?.length) lines.push(`  - observedArgs: ${f.observedArgs.join(', ')}`)
    if (f.note) lines.push(`  - note: ${f.note}`)
    if (f.locations?.length) {
      for (const loc of f.locations.slice(0, 5)) {
        lines.push(`  - at: ${path.relative(ROOT, loc.file)}:${loc.line}:${loc.col}`)
      }
      if (f.locations.length > 5) lines.push(`  - ... (${f.locations.length - 5} more)`)
    }
  }
  fs.writeFileSync(OUT_MD, lines.join('\n') + '\n', 'utf8')

  // concise console output
  // eslint-disable-next-line no-console
  console.log(`[ok] wrote ${path.relative(ROOT, OUT_JSON)}`)
  // eslint-disable-next-line no-console
  console.log(`[ok] wrote ${path.relative(ROOT, OUT_MD)}`)
  // eslint-disable-next-line no-console
  console.log(`[ok] findings: ${findings.length}`)
}

main()

