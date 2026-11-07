import assert from 'node:assert/strict'
import fs from 'node:fs'

import { irToGia } from '../../src/compiler/ir_to_gia_transform/index.js'
import type { CharacterEntity, CreationEntity } from '../../src/definitions/entity_helpers.js'
import { ServerExecutionFlowFunctions } from '../../src/definitions/nodes.js'
import {
  buildServerGraphRegistriesIRDocuments,
  defineSignal,
  g,
  MetaCallRegistry
} from '../../src/runtime/core.js'
import { entity, faction, listLiteral } from '../../src/runtime/value.js'
import { decode_gia_file } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/decode.js'

const protoPath =
  'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto'
const Signal = defineSignal('GSTS_NOV_EQ', [
  ['value', 'int'],
  ['names', 'str_list']
])
// The compiler normally lowers source arrays to these runtime list values.
const names = new listLiteral('str', ['a']) as unknown as string[]
const emptyNames = new listLiteral('str', []) as unknown as string[]

// Exercise runtime dispatch as well as encoding: each variant must produce identical bytes.
for (const variant of ['f', 'helpers', 'aliases'] as const) {
  g.server({ id: 1073741909, name: 'NovemberEquivalence', mode: 'beyond', lang: 'en' }).on(
    'whenEntityIsCreated',
    (_evt, f) => {
      const player = f.getCorrespondingValueFromList(f.getListOfPlayerEntitiesOnTheField(), 0n)
      const character = f.getSelfEntity() as CharacterEntity
      const creation = f.getSelfEntity() as CreationEntity
      if (variant === 'helpers') {
        player.openGiftBoxInterface(1n)
        character.setCdForSpecifiedSkillInstance(2n, 3, true)
        character.increaseCdForSpecifiedSkillInstance(2n, -1, false)
        creation.setCreationDisruptorDevice(3n)
        creation.activateDisableNativePushCollision(4n, true)
        creation.activateDisableExtraPushCollision(5n, false)
        player.switchCombatTextFilterTemplate(6n)
        player.sendLua(Signal, 7n, names)
        player.sendClientScriptedServerSignal(Signal, 8n, emptyNames)
        sendLua(player, Signal, 9n, names)
        sendLuaAll(Signal, 10n, names)
      } else if (variant === 'aliases') {
        player.openGiftBoxUi(1n)
        character.setSkillInstanceCd(2n, 3, true)
        character.addSkillInstanceCd(2n, -1, false)
        creation.setCreationDisruptorDevice(3n)
        creation.activateDisableNativePushCollision(4n, true)
        creation.activateDisableExtraPushCollision(5n, false)
        player.switchCombatTextTemplate(6n)
        player.sendLua(Signal, 7n, names)
        player.sendLua(Signal, 8n, emptyNames)
        sendLua(player, Signal, 9n, names)
        sendLuaAll(Signal, 10n, names)
      } else {
        f.openGiftBoxInterface(player, 1n)
        f.setCdForSpecifiedSkillInstance(character, 2n, 3, true)
        f.increaseCdForSpecifiedSkillInstance(character, 2n, -1, false)
        f.setCreationDisruptorDevice(creation, 3n)
        f.activateDisableNativePushCollision(creation, 4n, true)
        f.activateDisableExtraPushCollision(creation, 5n, false)
        f.switchCombatTextFilterTemplate(player, 6n)
        f.sendClientScriptedServerSignal(player, Signal, 7n, names)
        f.sendClientScriptedServerSignal(player, Signal, 8n, emptyNames)
        f.sendClientScriptedServerSignal(player, Signal, 9n, names)
        f.listIterationLoop(f.getListOfPlayerEntitiesOnTheField(), (target) => {
          f.sendClientScriptedServerSignal(target, Signal, 10n, names)
        })
      }
    }
  )
}
const docs = buildServerGraphRegistriesIRDocuments()
const originalNow = Date.now
const originalRandom = Math.random
try {
  Date.now = () => 1790000000000
  Math.random = () => 0.3141592653589793
  // irToGia rewrites the document it gets, so keep an untouched copy for the limit checks.
  const pristine = structuredClone(docs[0])
  const direct = irToGia(docs[0], { protoPath })
  assert.deepEqual(direct, irToGia(docs[1], { protoPath }))
  assert.deepEqual(direct, irToGia(docs[2], { protoPath }))

  // Editor limit: at most 100 node graph variables per graph.
  const withVariables = (count: number) => ({
    ...structuredClone(pristine),
    variables: Array.from({ length: count }, (_, i) => ({
      name: `v${i}`,
      type: 'int' as const,
      value: 0
    }))
  })
  assert.doesNotThrow(() => irToGia(withVariables(100), { protoPath }))
  assert.throws(() => irToGia(withVariables(101), { protoPath }), /101[^0-9]+100/)
} finally {
  Date.now = originalNow
  Math.random = originalRandom
}

const decode = (name: string) => {
  const file = `dist/tests/${name}.gia`
  assert.ok(fs.existsSync(file), `Compile ${name}.ts with --noinject first`)
  return decode_gia_file(file, protoPath).graph.graph?.inner.graph.nodes ?? []
}
const nodes = decode('manual_verify_2026_11_server_nodes')
const expectedInputs = new Map([
  [856, [0, 1]],
  [857, [0, 1, 2, 3]],
  [858, [0, 1, 2, 3]],
  [859, [0, 1]],
  [860, [0, 1, 2]],
  [861, [0, 1, 2]],
  [3800, [0, 1]],
  [303, [0, 1, 2, 3, 4, 5, 6, 7, 8]],
  [697, [0, 1, 2, 3, 4, 5, 6]]
])
for (const [id, expected] of expectedInputs) {
  const matches = nodes.filter((node) => node.genericId.nodeId === id)
  assert.ok(matches.length, `Missing node ${id}`)
  for (const node of matches) {
    assert.deepEqual(
      node.pins.filter((pin) => pin.i1.kind === 3).map((pin) => pin.i1.index),
      expected,
      `node ${id} inputs/holes`
    )
  }
}
for (const [id, indexes] of [
  [304, [0, 1, 2, 3, 4, 5, 6, 7, 8]],
  [305, [0, 1, 2, 3, 4, 5, 6, 7]],
  [381, [0, 1, 2, 3, 4, 5, 6, 7, 8]]
] as const) {
  const node = nodes.find((candidate) => candidate.genericId.nodeId === id)
  assert.ok(node, `Missing changed node ${id}`)
  for (const index of indexes) {
    assert.ok(
      node.pins.some((pin) => pin.i1.kind === 4 && pin.i1.index === index),
      `${id} output ${index}`
    )
    assert.ok(
      nodes.some((consumer) =>
        consumer.pins.some((pin) =>
          pin.connects.some(
            (connection) =>
              connection.id === node.nodeIndex &&
              connection.connect.kind === 4 &&
              connection.connect.index === index
          )
        )
      ),
      `${id} output ${index} must be consumed`
    )
  }
}
const lua = decode('manual_verify_2026_11_lua_signals')
const downlinks = lua.filter((node) => node.genericId.nodeId === 300005)
assert.equal(downlinks.length, 5)
for (const node of downlinks) {
  assert.equal(node.signalVersion, 1)
  const selector = node.pins.find((pin) => pin.i1.kind === 5)
  assert.ok(selector)
  assert.equal(selector.i1.index, 0)
  assert.equal(selector.clientExecNode?.kind, 6)
  assert.equal(selector.clientExecNode?.index, 1)
  const inputs = node.pins.filter((pin) => pin.i1.kind === 3)
  assert.deepEqual(
    inputs.map((pin) => pin.i1.index),
    inputs.map((_, index) => index)
  )
  assert.equal(inputs[0].type, 1, 'target is one Entity, not EntityList')
  assert.ok(inputs[0].connects.length, 'player target is wired')
  if (inputs.length === 10) {
    assert.deepEqual(
      inputs.slice(1).map((pin) => pin.type),
      inputs[1].type === 3 ? [3, 5, 6, 4, 12, 2, 1, 21, 20] : [8, 10, 11, 9, 15, 7, 13, 23, 22]
    )
  }
}
assert.ok(
  lua.some((node) => node.genericId.nodeId === 300000),
  'old graph broadcast stays separate'
)
const functions = new ServerExecutionFlowFunctions(new MetaCallRegistry())
for (const type of ['faction', 'faction_list', 'unknown'] as const) {
  assert.throws(
    () =>
      Reflect.apply(functions.sendClientScriptedServerSignal, functions, [
        new entity(),
        defineSignal('InvalidLua', [['bad', type]])
      ]),
    /Lua/
  )
}
assert.throws(
  () =>
    Reflect.apply(functions.sendClientScriptedServerSignal, functions, [
      new entity(),
      'InvalidLuaByName',
      new faction(1)
    ]),
  /Lua/
)
console.log('[ok] November server pins, Lua selectors and helper/global byte equivalence')
