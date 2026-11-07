import assert from 'node:assert/strict'
import fs from 'node:fs'

import { irToGia } from '../../src/compiler/ir_to_gia_transform/index.js'
import { buildClientGraphRegistriesIRDocuments, g } from '../../src/runtime/core.js'
import { configId } from '../../src/runtime/value.js'
import { counter_dynamic_id } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/gia_gen/utils.js'
import { decode_gia_file } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/decode.js'

const protoPath =
  'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto'
const range = (count: number) => Array.from({ length: count }, (_, index) => index)
const expected = new Map([
  [200301, { concrete: 3014, inputs: range(7), literals: [0] }],
  [200302, { concrete: 3015, inputs: range(11), literals: range(10).map((i) => i + 1) }],
  [200303, { concrete: 4029, inputs: range(10), literals: [1] }],
  [200307, { concrete: 4227, inputs: range(2), literals: [] }],
  [200308, { concrete: 4025, inputs: range(15), literals: [1] }],
  [200309, { concrete: 4026, inputs: range(20), literals: [1] }],
  [200310, { concrete: 4027, inputs: range(28), literals: [1] }],
  [200311, { concrete: 4028, inputs: range(14), literals: [1] }],
  [200312, { concrete: 1031, inputs: range(11), literals: [] }]
])
const found = new Set<number>()
for (const mode of ['beyond', 'classic']) {
  const dir = 'dist/tests/manual/nodes-2026-11'
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.startsWith(`${mode}_`) && file.endsWith('.gia'))
  assert.equal(files.length, mode === 'beyond' ? 7 : 5)
  for (const file of files) {
    const nodes = decode_gia_file(`${dir}/${file}`, protoPath).graph.graph?.inner.graph.nodes ?? []
    for (const node of nodes) {
      const id = node.genericId.nodeId
      const pins = node.pins.filter((pin) => pin.i1.kind === 3)
      const spec = expected.get(id)
      if (spec) {
        found.add(id)
        assert.equal(node.concreteId?.nodeId, spec.concrete, `${file}: ${id} concrete ID`)
        assert.deepEqual(
          pins.map((pin) => pin.i1.index),
          spec.inputs,
          `${file}: ${id} inputs/holes`
        )
        for (const index of spec.literals) {
          const pin = pins.find((candidate) => candidate.i1.index === index)!
          assert.equal(pin.connects.length, 0, `${id}:${index} is literal-only`)
          // Fixed-slot enum-list builders retain unused slots with editor defaults.
          if (id !== 200302)
            assert.ok(pin.value.alreadySetVal, `${id}:${index} has a literal value`)
          else if (pin.value.alreadySetVal)
            assert.ok([2601, 2602, 2605].includes(pin.value.bEnum?.val ?? -1))
        }
      }
      if ([200276, 200277, 200278, 200280, 200281, 200282].includes(id)) {
        assert.deepEqual(
          pins.map((pin) => pin.i1.index),
          [0, 1]
        )
        assert.equal(pins[1].value.bEnum?.val, 6811, `${id} uses the non-default Current option`)
      }
      if ([200051, 200059, 200112, 200115].includes(id)) {
        const index = id === 200051 || id === 200112 ? 9 : 10
        assert.equal(pins.find((pin) => pin.i1.index === index)?.connects.length, 0)
      }
    }
  }
}
assert.deepEqual([...found].sort(), [...expected.keys()].sort())

for (const [index, variant] of (['f', 'helper', 'alias'] as const).entries()) {
  g.creationStatusDecision({
    id: 1082131990 + index,
    name: 'NovemberHelper',
    mode: 'beyond'
  }).on('start1', (_evt, f) => {
    const target = f.getSelfEntity()
    const active =
      variant === 'helper'
        ? target.whetherTheEntityHasTheSpecifiedUnitStatus(new configId(1))
        : variant === 'alias'
          ? target.hasUnitStatus(new configId(1))
          : f.whetherTheEntityHasTheSpecifiedUnitStatus(target, new configId(1))
    f.switchToSelfExecutionStatus(active, new configId(2), 1n)
  })
}
const docs = buildClientGraphRegistriesIRDocuments()
docs[1].graph.id = docs[0].graph.id
docs[2].graph.id = docs[0].graph.id
const originalNow = Date.now
const originalRandom = Math.random
try {
  Date.now = () => 1790000000000
  Math.random = () => 0.3141592653589793
  counter_dynamic_id.reset()
  const direct = irToGia(docs[0], { protoPath })
  counter_dynamic_id.reset()
  assert.deepEqual(direct, irToGia(docs[1], { protoPath }))
  counter_dynamic_id.reset()
  assert.deepEqual(direct, irToGia(docs[2], { protoPath }))
} finally {
  Date.now = originalNow
  Math.random = originalRandom
}
console.log(
  '[ok] November client IDs, pins, holes, literals, defaults and entity-helper byte equivalence'
)
