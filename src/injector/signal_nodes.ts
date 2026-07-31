import {
  decodeUtf8,
  parseMessage,
  readFieldBytes,
  readFieldMessages,
  readVarint
} from './binary.js'
import type { LenField } from './types.js'

type SignalNodeKind = 'send' | 'monitor' | 'sendServer'

type NodeGraphIdInfo = {
  class?: number
  type?: number
  kind?: number
  nodeId?: number
}

type SignalNodeIds = {
  send?: NodeGraphIdInfo
  monitor?: NodeGraphIdInfo
  sendServer?: NodeGraphIdInfo
}

export type SignalNodeIdMap = Map<string, SignalNodeIds>

export type SignalPatchGraph = {
  nodes?: Array<{
    genericId?: NodeGraphIdInfo
    concreteId?: NodeGraphIdInfo
    pins?: Array<{ i1?: { kind?: number }; value?: unknown }>
  }>
}

type SignalParseContext = {
  payload: Uint8Array
  fields: LenField[]
}

type TFunc = (key: string, options?: Record<string, unknown>) => string

const SIGNAL_NODE_TYPE_SKILLS = 20002

const SIGNAL_NODE_ID_PLACEHOLDERS = new Map<number, SignalNodeKind>([
  [300000, 'send'],
  [300001, 'monitor'],
  [300002, 'sendServer']
])

function parseNodeGraphId(buf: Uint8Array): NodeGraphIdInfo {
  const out: NodeGraphIdInfo = {}
  let offset = 0
  while (offset < buf.length) {
    const key = readVarint(buf, offset)
    if (!key) break
    offset = key.next
    const field = key.value >> 3
    const wire = key.value & 7
    if (wire === 0) {
      const v = readVarint(buf, offset)
      if (!v) break
      offset = v.next
      if (field === 1) out.class = v.value
      if (field === 2) out.type = v.value
      if (field === 3) out.kind = v.value
      if (field === 5) out.nodeId = v.value
      continue
    }
    if (wire === 2) {
      const lenVar = readVarint(buf, offset)
      if (!lenVar) break
      offset = lenVar.next + lenVar.value
      continue
    }
    if (wire === 1) {
      offset += 8
      continue
    }
    if (wire === 5) {
      offset += 4
      continue
    }
    break
  }
  return out
}

function parseCompositeDefId(buf: Uint8Array): NodeGraphIdInfo | undefined {
  const genericBytes = readFieldBytes(buf, 1)
  if (genericBytes) return parseNodeGraphId(genericBytes)
  const concreteBytes = readFieldBytes(buf, 2)
  if (concreteBytes) return parseNodeGraphId(concreteBytes)
  return undefined
}

function parseSignalName(buf: Uint8Array): string | undefined {
  const defBytes = readFieldBytes(buf, 101) ?? readFieldBytes(buf, 102)
  if (!defBytes) return undefined
  const nameBytes = readFieldBytes(defBytes, 1)
  if (!nameBytes) return undefined
  return decodeUtf8(nameBytes)
}

function extractSignalNameFromNode(node: {
  pins?: Array<{ i1?: { kind?: number }; value?: unknown }>
}): string | undefined {
  const pins = node.pins ?? []
  for (const pin of pins) {
    if (pin?.i1?.kind !== 5) continue
    const s = extractStringFromVarBase(pin?.value as Record<string, unknown> | undefined)
    if (s) return s
  }
  return undefined
}

function extractStringFromVarBase(val?: Record<string, unknown>): string | undefined {
  if (!val) return undefined
  const bString = val.bString as { val?: unknown } | undefined
  if (typeof bString?.val === 'string') return bString.val
  const bConcrete = val.bConcreteValue as { value?: Record<string, unknown> } | undefined
  if (bConcrete?.value) return extractStringFromVarBase(bConcrete.value)
  return undefined
}

export function buildSignalNodeIdMapFromFields(
  payload: Uint8Array,
  fields: LenField[],
  t?: TFunc
): SignalNodeIdMap {
  const result = new Map<string, SignalNodeIds>()
  const maxContainerBytes = 4096

  for (const f of fields) {
    const len = f.dataEnd - f.dataStart
    if (len <= 0 || len > maxContainerBytes) continue
    const containerBytes = payload.subarray(f.dataStart, f.dataEnd)

    const signalDefBytes = readFieldBytes(containerBytes, 107)
    if (!signalDefBytes) continue
    const signalName = parseSignalName(signalDefBytes)
    if (!signalName) continue

    const idBytes = readFieldBytes(containerBytes, 4)
    const nodeId = idBytes ? parseCompositeDefId(idBytes) : undefined
    if (!nodeId?.nodeId) continue

    const outputs = readFieldMessages(containerBytes, 103).length
    const kind: SignalNodeKind | undefined =
      nodeId.type === SIGNAL_NODE_TYPE_SKILLS ? 'sendServer' : outputs >= 3 ? 'monitor' : 'send'

    const entry = result.get(signalName) ?? {}
    const existing = entry[kind]
    if (existing && existing.nodeId !== nodeId.nodeId) {
      const msg = t
        ? t('injector_signalConflict', {
            signal: signalName,
            kind,
            first: existing.nodeId,
            second: nodeId.nodeId
          })
        : `[error] signal "${signalName}" has multiple node ids for "${kind}": ${existing.nodeId} vs ${nodeId.nodeId}`
      throw new Error(msg)
    }
    if (!existing) entry[kind] = nodeId
    result.set(signalName, entry)
  }

  return result
}

function buildSignalParseContext(
  gilBytes: Uint8Array,
  parsed?: SignalParseContext
): SignalParseContext {
  if (parsed) return parsed
  const payload = gilBytes.subarray(20, gilBytes.length - 4)
  const fields: LenField[] = []
  parseMessage(payload, 0, payload.length, 0, 0, 0, 0, 0, 0, 0, fields)
  return { payload, fields }
}

function setNodeGraphIdFields(target: NodeGraphIdInfo, info: NodeGraphIdInfo) {
  if (typeof info.class === 'number') target.class = info.class
  if (typeof info.type === 'number') target.type = info.type
  if (typeof info.kind === 'number') target.kind = info.kind
  if (typeof info.nodeId === 'number') target.nodeId = info.nodeId
}

/**
 * Placeholder kind carried by a node's ids. Server signal nodes hold the
 * placeholder in both genericId and concreteId; the client send-to-server node
 * holds it only in genericId (concreteId stays 2000, matching vendor samples).
 * 300002 doubles as the server assemble_structure id, so the sendServer kind
 * additionally requires the client skill graph type (20002) on the id.
 */
function placeholderKindOfNode(node: {
  genericId?: NodeGraphIdInfo
  concreteId?: NodeGraphIdInfo
}): { kind: SignalNodeKind; targets: NodeGraphIdInfo[] } | undefined {
  const targets: NodeGraphIdInfo[] = []
  let kind: SignalNodeKind | undefined
  for (const id of [node.genericId, node.concreteId]) {
    const k =
      typeof id?.nodeId === 'number' ? SIGNAL_NODE_ID_PLACEHOLDERS.get(id.nodeId) : undefined
    if (!k) continue
    if (k === 'sendServer' && id?.type !== SIGNAL_NODE_TYPE_SKILLS) continue
    kind = k
    targets.push(id!)
  }
  return kind ? { kind, targets } : undefined
}

export function hasSignalNodePlaceholders(graph: SignalPatchGraph): boolean {
  const nodes = graph.nodes ?? []
  return nodes.some((node) => placeholderKindOfNode(node) !== undefined)
}

export function patchSignalNodeIdsFromMap(
  graph: SignalPatchGraph,
  signalMap: SignalNodeIdMap,
  t?: TFunc
) {
  for (const node of graph.nodes ?? []) {
    const placeholder = placeholderKindOfNode(node)
    if (!placeholder) continue
    const signalName = extractSignalNameFromNode(node)
    const missingMsg = t
      ? t('injector_signalMissing', { signal: signalName ?? 'unknown' })
      : '[error] signal is not defined; injection failed'
    if (!signalName) {
      throw new Error(missingMsg)
    }
    const entry = signalMap.get(signalName)
    const target = entry?.[placeholder.kind]
    if (!target?.nodeId) {
      throw new Error(missingMsg)
    }
    for (const idTarget of placeholder.targets) {
      setNodeGraphIdFields(idTarget, target)
    }
  }
}

export function patchSignalNodeIds(
  graph: SignalPatchGraph,
  gilBytes: Uint8Array,
  parsed?: SignalParseContext,
  t?: TFunc
) {
  if (!hasSignalNodePlaceholders(graph)) return

  const ctx = buildSignalParseContext(gilBytes, parsed)
  const signalMap = buildSignalNodeIdMapFromFields(ctx.payload, ctx.fields, t)
  patchSignalNodeIdsFromMap(graph, signalMap, t)
}
