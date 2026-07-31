import protobuf from 'protobufjs'

import { readVarint } from './binary.js'
import type { LenField } from './types.js'

export type NodeGraphObj = Record<string, unknown>
export type NodeGraphFieldInfo = {
  field: LenField
  type?: number
}

function isNodeGraphBlobField(f: LenField): boolean {
  // 只匹配 NodeGraph “原始 bytes”字段本身，避免扫描 10.1.1 子树内部的海量嵌套字段
  return f.depth === 3 && f.p0 === 10 && f.p1 === 1 && f.p2 === 1
}

function tryReadNodeGraphIdAndType(bytes: Uint8Array): { id: number; type?: number } | null {
  // Ultra-fast signature:
  // NodeGraph starts with: field 1 (id message), wire type 2 => key varint == 10
  const key = readVarint(bytes, 0)
  if (!key || key.value !== 10) return null
  const lenVar = readVarint(bytes, key.next)
  if (!lenVar) return null
  const len = lenVar.value
  const start = lenVar.next
  const end = start + len
  if (len <= 0 || end > bytes.length) return null

  let id: number | undefined
  let type: number | undefined

  let off = start
  while (off < end) {
    const k = readVarint(bytes, off)
    if (!k) break
    off = k.next
    const field = k.value >> 3
    const wire = k.value & 7

    if (wire === 0) {
      const v = readVarint(bytes, off)
      if (!v) break
      off = v.next
      // NodeGraph.Id.type = 2; NodeGraph.Id.id = 5
      if (field === 2) type = v.value
      if (field === 5) {
        id = v.value
        // id 已经足够用于快速匹配
        break
      }
      continue
    }
    if (wire === 1) {
      off += 8
      continue
    }
    if (wire === 2) {
      const lv = readVarint(bytes, off)
      if (!lv) break
      off = lv.next + lv.value
      continue
    }
    if (wire === 5) {
      off += 4
      continue
    }
    break
  }

  if (typeof id === 'number') return { id, type }
  return null
}

export function unwrapGia(bytes: Uint8Array): Uint8Array {
  return bytes.subarray(20, bytes.length - 4)
}

function toNumberIfLongLike(v: unknown): number | undefined {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined
  if (typeof v === 'bigint') return Number(v)
  if (v && typeof v === 'object') {
    // protobufjs Long
    const anyV = v as { toNumber?: () => number; low?: unknown; high?: unknown }
    if (typeof anyV.toNumber === 'function') {
      const n = anyV.toNumber()
      return Number.isFinite(n) ? n : undefined
    }
  }
  return undefined
}

export function getGraphId(obj: unknown): number | undefined {
  const raw = (obj as { id?: { id?: unknown } } | undefined)?.id?.id
  return toNumberIfLongLike(raw)
}

export function setGraphId(obj: unknown, id: number) {
  const target = obj as { id?: { id?: number } }
  if (!target.id) target.id = {}
  target.id.id = id
}

export function extractGraphType(obj: unknown): number | undefined {
  const type = (obj as { id?: { type?: unknown } } | undefined)?.id?.type
  return toNumberIfLongLike(type)
}

const CLIENT_ENTRY_GENERIC_ID_BY_GRAPH_TYPE = new Map<number, number>([
  [20001, 200000],
  [20002, 200042],
  [20006, 200122],
  [20007, 200126],
  [20008, 200042],
  [20009, 200126],
  [20010, 200042]
])

export function isClientGraphType(type: number | undefined): type is number {
  return typeof type === 'number' && CLIENT_ENTRY_GENERIC_ID_BY_GRAPH_TYPE.has(type)
}

export function isNodeGraphEmptyForInjection(obj: unknown): boolean {
  const nodes = (obj as { nodes?: unknown } | undefined)?.nodes
  if (!Array.isArray(nodes) || nodes.length === 0) return true
  if (nodes.length !== 1) return false

  const entryGenericId = CLIENT_ENTRY_GENERIC_ID_BY_GRAPH_TYPE.get(extractGraphType(obj) ?? -1)
  if (entryGenericId === undefined) return false

  const genericId = (nodes[0] as { genericId?: { nodeId?: unknown } } | undefined)?.genericId
    ?.nodeId
  return toNumberIfLongLike(genericId) === entryGenericId
}

export function setGraphType(obj: unknown, type: number) {
  const target = obj as { id?: { type?: number } }
  if (!target.id) target.id = {}
  target.id.type = type
}

export function loadGiaGraph(
  giaBytes: Uint8Array,
  rootMessage: protobuf.Type,
  _nodeGraphMessage: protobuf.Type,
  targetId?: number
): NodeGraphObj {
  const payload = unwrapGia(giaBytes)
  // 性能：避免 rootMessage.toObject 的巨大开销，直接操作 protobufjs Message
  const rootMsg = rootMessage.decode(payload) as unknown as {
    graph?: { graph?: { inner?: { graph?: NodeGraphObj } } }
  }
  const graph = rootMsg?.graph?.graph?.inner?.graph
  if (!graph) {
    throw new Error('[error] gia does not contain NodeGraph data')
  }
  // verify 代价很高且 encode 前会再验证一次；这里跳过（输入来自我们自己的编译产物）
  const existingId = getGraphId(graph)
  if (typeof targetId === 'number' && existingId !== targetId) {
    setGraphId(graph, targetId)
  }
  return graph
}

export function findNodeGraphTargets(
  payload: Uint8Array,
  fields: LenField[],
  nodeGraphMessage: protobuf.Type,
  targetId: number
): { field: LenField; obj: NodeGraphObj }[] {
  const matches: { field: LenField; obj: NodeGraphObj }[] = []

  // 性能：在当前项目里 targetId 恒 >= 1e9，且我们通常只传入 `10.1.1` 的 NodeGraph blob 字段列表，
  // 因此这里直接线性扫 fields，命中才 decode；不再做多层 prefix/回退扫描。
  for (const f of fields) {
    // 若调用方传的是全量 fields，则这里仍做一次快速过滤
    if (!isNodeGraphBlobField(f)) continue
    const slice = payload.subarray(f.dataStart, f.dataEnd)
    const fast = tryReadNodeGraphIdAndType(slice)
    if (!fast || fast.id !== targetId) continue
    // only decode when matched (very rare)
    const obj = nodeGraphMessage.decode(slice) as unknown as NodeGraphObj
    matches.push({ field: f, obj })
    if (matches.length > 1) break
  }

  return matches
}

export function buildNodeGraphFieldIndex(
  payload: Uint8Array,
  fields: LenField[]
): Map<number, NodeGraphFieldInfo[]> {
  const index = new Map<number, NodeGraphFieldInfo[]>()
  for (const field of fields) {
    if (!isNodeGraphBlobField(field)) continue
    const info = tryReadNodeGraphIdAndType(payload.subarray(field.dataStart, field.dataEnd))
    if (!info) continue
    const list = index.get(info.id) ?? []
    list.push({ field, type: info.type })
    index.set(info.id, list)
  }
  return index
}

export function buildGraphTypeMap(
  payload: Uint8Array,
  fields: LenField[],
  _nodeGraphMessage: protobuf.Type
): Map<number, number> {
  const idToType = new Map<number, number>()
  for (const f of fields) {
    if (!isNodeGraphBlobField(f)) continue
    const slice = payload.subarray(f.dataStart, f.dataEnd)
    const fast = tryReadNodeGraphIdAndType(slice)
    if (!fast) continue
    const id = fast.id
    const type = fast.type
    if (typeof type === 'number') idToType.set(id, type)
  }
  return idToType
}
