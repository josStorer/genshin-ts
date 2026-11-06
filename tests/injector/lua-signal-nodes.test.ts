import assert from 'node:assert/strict'

import { encodeVarint, parseMessage } from '../../src/injector/binary.js'
import {
  buildSignalNodeIdMapFromFields,
  patchSignalNodeIdsFromMap,
  type SignalPatchGraph
} from '../../src/injector/signal_nodes.js'
import type { LenField } from '../../src/injector/types.js'

const field = (id: number, value: number | Uint8Array) =>
  typeof value === 'number'
    ? Buffer.concat([encodeVarint(id << 3), encodeVarint(value)])
    : Buffer.concat([encodeVarint((id << 3) | 2), encodeVarint(value.length), value])

// Recreate the relevant fields observed in the copied editor save, without
// committing any save content. One name has both a graph and a Lua signal node.
const definition = (kind: number, nodeId: number) =>
  field(
    1,
    Buffer.concat([
      field(
        4,
        field(
          1,
          Buffer.concat([field(1, 10001), field(2, 20000), field(3, 22001), field(5, nodeId)])
        )
      ),
      field(107, Buffer.concat([field(1, kind), field(101, field(1, Buffer.from('LuaProbe')))]))
    ])
  )
const payload = Buffer.concat([definition(1001, 1610612700), definition(1006, 1610612701)])
const fields: LenField[] = []
parseMessage(payload, 0, payload.length, 0, 0, 0, 0, 0, 0, 0, fields)
const map = buildSignalNodeIdMapFromFields(payload, fields)
assert.equal(map.get('LuaProbe')?.send?.nodeId, 1610612700)
assert.equal(map.get('LuaProbe')?.sendLua?.nodeId, 1610612701)
const graph: SignalPatchGraph = {
  nodes: [300000, 300005].map((nodeId) => ({
    genericId: { nodeId },
    concreteId: { nodeId },
    pins: [{ i1: { kind: 5 }, value: { bString: { val: 'LuaProbe' } } }]
  }))
}
patchSignalNodeIdsFromMap(graph, map)
assert.deepEqual(
  graph.nodes?.map((node) => node.genericId?.nodeId),
  [1610612700, 1610612701]
)
assert.deepEqual(
  graph.nodes?.map((node) => node.concreteId?.nodeId),
  [1610612700, 1610612701]
)
assert.equal(graph.nodes?.[1].genericId?.kind, 22001)
assert.throws(
  () => patchSignalNodeIdsFromMap({ nodes: [{ genericId: { nodeId: 300005 } }] }, map),
  /signal is not defined/
)
console.log('[ok] Lua downlink definitions and graph broadcasts patch independently')
