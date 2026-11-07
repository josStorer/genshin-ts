import assert from 'node:assert/strict'
import fs from 'node:fs'

import { irToGia } from '../../src/compiler/ir_to_gia_transform/index.js'
import { initCliI18n } from '../../src/i18n/index.js'
import { g, MetaCallRegistry } from '../../src/runtime/core.js'
import { buildIRDocument } from '../../src/runtime/ir_builder.js'
import { configId, entity, type EntityValue } from '../../src/runtime/value.js'
import { decode_gia_file } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/decode.js'

const protoPath =
  'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto'
const manualDir = process.argv[2] ?? 'dist/tests/manual/graph-features'
const read = (file: string) =>
  decode_gia_file(`${manualDir}/${file}`, protoPath).graph.graph!.inner.graph
const variables = read('exposed-variables.gia').graphValues
assert.equal(variables.filter((v) => v.exposed).length, 29)
assert.ok(variables.filter((v) => v.name.startsWith('__gsts')).length > 0)
for (const variable of variables) {
  assert.equal(
    variable.exposed,
    !['counter', 'privateText'].includes(variable.name) && !variable.name.startsWith('__gsts'),
    variable.name
  )
}

initCliI18n('en-US')
const registry = new MetaCallRegistry()
let shared = 0n
registry.runServerHandler('whenEntityIsCreated', (_evt, f) => {
  shared = f.queryGameTimeElapsed()
  f.printString(f.dataTypeConversion(shared, 'str'))
})
assert.throws(
  () =>
    registry.runServerHandler('whenCharacterRevives', (_evt, f) => {
      f.printString(f.dataTypeConversion(shared, 'str'))
    }),
  (error: unknown) =>
    error instanceof Error &&
    /whenEntityIsCreated/.test(error.message) &&
    /whenCharacterRevives/.test(error.message) &&
    /query_game_time_elapsed/.test(error.message) &&
    /f\.set \/ f\.get/.test(error.message)
)
assert.throws(
  () =>
    registry.runServerHandler('whenEntityIsCreated', (_evt, f) => {
      f.printString(f.dataTypeConversion(shared, 'str'))
    }),
  /crosses event handlers/
)

const other = new MetaCallRegistry()
assert.throws(
  () =>
    other.runServerHandler('whenEntityIsCreated', (_evt, f) => {
      f.printString(f.dataTypeConversion(shared, 'str'))
    }),
  /crosses event handlers/
)
initCliI18n('zh-CN')
assert.throws(
  () =>
    other.runServerHandler('whenCharacterRevives', (_evt, f) => {
      f.printString(f.dataTypeConversion(shared, 'str'))
    }),
  /数据连线跨越了事件处理函数/
)
initCliI18n('en-US')

let clientShared: EntityValue = new entity()
const client = g.creationStatus({ id: 1082131998 }).on('start1', (_evt, f) => {
  clientShared = f.getSelfEntity()
  f.whetherTheEntityHasTheSpecifiedUnitStatus(clientShared, new configId(1))
})
assert.throws(
  () =>
    client.on('start2', (_evt, f) => {
      f.whetherTheEntityHasTheSpecifiedUnitStatus(clientShared, new configId(1))
    }),
  /start1.*start2/
)

const legal = new MetaCallRegistry()
legal.runServerHandler('whenEntityIsCreated', (_evt, f) => {
  f.setNodeGraphVariable('shared', f.queryGameTimeElapsed(), false)
})
legal.runServerHandler('whenCharacterRevives', (_evt, f) => {
  f.printString(f.dataTypeConversion(f.getNodeGraphVariable('shared').asType('int'), 'str'))
})
legal.ensureServerEventPrelude('whenEntityIsCreated', 'graph-features', (f) => {
  f.printString(f.dataTypeConversion(f.getSelfEntity(), 'str'))
})
legal.finalizeServerFlows()
legal.finalizeServerFlows()
assert.ok(
  irToGia(buildIRDocument({ flows: legal.getFlows(), variables: [] }), { protoPath }).length
)

const timerNames: Set<string>[] = []
for (const [index, id] of [1073741921, 1073741922].entries()) {
  const graph = read(`timer-names_${index}.gia`)
  const names = new Set<string>()
  const visit = (value: unknown): void => {
    if (typeof value === 'string' && /^__gsts_(timeout|interval)_\d+_\d+_\d{5}$/.test(value))
      names.add(value)
    else if (value && typeof value === 'object') Object.values(value).forEach(visit)
  }
  visit(graph)
  assert.ok(names.size >= 6, 'interval plus timeout pool')
  for (const name of names) assert.ok(name.endsWith(`_${String(id).slice(-5)}`), name)
  const documents = JSON.parse(fs.readFileSync(`${manualDir}/timer-names.json`, 'utf8')) as Array<{
    nodes: Array<{ type: string; args?: Array<{ type: string; value: unknown }> }>
  }>
  const ir = documents[index]
  const starts = ir.nodes.filter((n) => n.type === 'start_timer')
  const dispatch = ir.nodes.filter((n) => ['equal', 'multiple_branches'].includes(n.type))
  const literals = (nodes: typeof ir.nodes) =>
    new Set(nodes.flatMap((n) => n.args?.filter((a) => a.type === 'str').map((a) => a.value) ?? []))
  const dispatchNames = literals(dispatch)
  for (const name of names) assert.ok(dispatchNames.has(name), `${name} dispatches`)
  for (const name of literals(starts)) {
    if (typeof name === 'string' && names.has(name)) assert.ok(dispatchNames.has(name))
  }
  if (index === 0) {
    assert.ok(literals(starts).has('manual_timer'))
    assert.ok(literals(starts).has('__gsts_timeout_999_0'))
  }
  timerNames.push(names)
}
assert.equal([...timerNames[0]].filter((name) => timerNames[1].has(name)).length, 0)
console.log(
  '[ok] Exposed variables, server/client event ownership, preludes and graph-specific timers'
)
