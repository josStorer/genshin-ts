import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { irToGia } from '../../src/compiler/ir_to_gia_transform/index.js'
import {
  getNodeIdLowerMap,
  SPECIAL_NODE_MAPPINGS
} from '../../src/compiler/ir_to_gia_transform/mappings.js'
import type { PlayerEntity } from '../../src/definitions/entity_helpers.js'
import { ServerEventMetadata } from '../../src/definitions/events.js'
import { NODE_TYPE_BY_METHOD } from '../../src/definitions/node_modes.js'
import { ServerExecutionFlowFunctions } from '../../src/definitions/nodes.js'
import {
  SERVER_LITERAL_ARGUMENT_INDEXES_BY_METHOD,
  SERVER_LITERAL_ARGUMENT_INDEXES_BY_NODE_TYPE
} from '../../src/definitions/server_node_metadata.js'
import { MetaCallRegistry } from '../../src/runtime/core.js'
import { SERVER_DEFAULT_GRAPH_ID } from '../../src/runtime/graph_defaults.js'
import type { IRDocument } from '../../src/runtime/IR.js'
import { assertServerLiteralValue, entity, int } from '../../src/runtime/value.js'
import {
  ENUM_ID,
  ENUM_VALUE
} from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/enum_id.js'
import { NODE_ID } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_id.js'
import { NODE_PIN_RECORDS } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_pin_records.js'
import { decode_gia_file } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/decode.js'
import type {
  GraphNode,
  NodePin
} from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto.js'

type StaticMetadata = {
  summary: {
    literalOnlyInputs: number
    pinsWithUnsupportedDefaults: number
  }
  nodes: Array<{
    genericId: number
    pins: Array<{
      kind: string
      index: number
      connectable?: boolean
      name?: string
      defaultValue?: unknown
      unsupportedDefaultPayload?: string
    }>
  }>
}

const repoRoot = process.cwd()
const protoPath = path.join(
  repoRoot,
  'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto'
)
const beyondGiaPath = path.join(repoRoot, 'dist/tests/manual_verify_2026_07_server_nodes_0.gia')
const secondBeyondGiaPath = path.join(
  repoRoot,
  'dist/tests/manual_verify_2026_07_server_nodes_1.gia'
)
const irPath = path.join(repoRoot, 'dist/tests/manual_verify_2026_07_server_nodes.json')
const serverDefinitionsSource = fs.readFileSync(
  path.join(repoRoot, 'src/definitions/nodes.ts'),
  'utf8'
)

for (const [method, descriptionEn, descriptionZh] of [
  [
    'getModelColorAndMaterial',
    'The current model color and material configuration.',
    '返回当前的模型颜色和材质配置'
  ],
  [
    'queryControlMotorSCurrentMovementParameters',
    "The Control Motion Device's current movement parameters.",
    '返回操控运动器当前的运动参数'
  ]
] as const) {
  const methodIndex = serverDefinitionsSource.indexOf(`\n  ${method}(`)
  assert.notEqual(methodIndex, -1, `missing server method ${method}`)
  const jsDoc = serverDefinitionsSource.slice(
    serverDefinitionsSource.lastIndexOf('/**', methodIndex),
    methodIndex
  )
  assert.ok(
    jsDoc.includes(`@returns ${descriptionEn}`) && jsDoc.includes(descriptionZh),
    `${method} must retain its overall bilingual @returns description`
  )
}

const expectedPins = new Map<number, string>([
  [835, '3:0,3:1,3:2,3:3,3:4,3:5,3:6,3:7,3:8,2:0'],
  [836, '3:0,4:0,4:1,4:2,4:3,4:4,4:5'],
  [837, '3:0,3:1,2:0'],
  [838, '3:0,2:0'],
  [839, '3:0,3:1,2:0'],
  [840, '3:0,4:0'],
  [841, '3:0,4:0'],
  [842, '4:0,4:1,4:2,4:3,2:0'],
  [843, '4:0,4:1,4:2,2:0'],
  [844, '4:0,4:1,4:2,2:0'],
  [845, '3:0,4:0,4:1,4:2,4:3,4:4,4:5,4:6'],
  [846, '3:0,3:1,2:0'],
  [847, '3:0,3:1,3:2,2:0'],
  [848, '3:0,3:1,2:0'],
  [849, '3:0,4:0'],
  [854, '3:1,3:2,3:3,2:0'],
  [855, '3:0,4:0']
])

const nodeIdByKey = {
  Modify_Model_Color_and_Material: 835,
  Get_Model_Color_and_Material: 836,
  Set_Player_to_Follow_Control_Motor: 837,
  Set_Player_to_Leave_Control_Motor: 838,
  Set_Player_Active_Control_Motors: 839,
  Query_Player_s_Current_Active_Control_Motor_List: 840,
  Query_Player_s_Current_Following_Control_Motor: 841,
  When_Player_s_Active_Control_Motor_List_Changes: 842,
  When_Player_Follows_Control_Motor: 843,
  When_Player_Leaves_Control_Motor: 844,
  Query_Control_Motor_s_Current_Movement_Parameters: 845,
  Set_Whether_Player_s_Cursor_Is_Persistent: 846,
  Set_Player_s_Cursor_Click_Selectable_Targets: 847,
  Set_Whether_Player_s_Cursor_Click_Penetrates_UI_Controls: 848,
  Query_Whether_Player_s_Cursor_Is_Active: 849,
  Activate_Disable_Cursor_Collision_Box: 854,
  Query_Whether_Player_Is_Subscribed: 855
} as const

const expectedRecords = new Map<number, { inputs: string[]; outputs: string[] }>([
  [
    835,
    {
      inputs: ['Ety', 'Bol', 'Bol', 'Int', 'Flt', 'E<42>', 'Bol', 'Bol', 'E<43>'],
      outputs: []
    }
  ],
  [836, { inputs: ['Ety'], outputs: ['Bol', 'E<42>', 'Int', 'Flt', 'Bol', 'E<43>'] }],
  [837, { inputs: ['Ety', 'Ety'], outputs: [] }],
  [838, { inputs: ['Ety'], outputs: [] }],
  [839, { inputs: ['Ety', 'L<Ety>'], outputs: [] }],
  [840, { inputs: ['Ety'], outputs: ['L<Ety>'] }],
  [841, { inputs: ['Ety'], outputs: ['Ety'] }],
  [842, { inputs: [], outputs: ['Ety', 'Gid', 'L<Ety>', 'L<Ety>'] }],
  [843, { inputs: [], outputs: ['Ety', 'Gid', 'Ety'] }],
  [844, { inputs: [], outputs: ['Ety', 'Gid', 'Ety'] }],
  [845, { inputs: ['Ety'], outputs: ['Flt', 'Flt', 'Flt', 'Flt', 'Flt', 'Flt', 'Flt'] }],
  [846, { inputs: ['Ety', 'Bol'], outputs: [] }],
  [847, { inputs: ['Ety', 'Int', 'Int'], outputs: [] }],
  [848, { inputs: ['Ety', 'Bol'], outputs: [] }],
  [849, { inputs: ['Ety'], outputs: ['Bol'] }],
  [854, { inputs: ['Unk', 'Ety', 'Int', 'Bol'], outputs: [] }],
  [855, { inputs: ['Ety'], outputs: ['Bol'] }]
])

const beyondOnlyNames = [
  'activateDisableCursorCollisionBox',
  'queryControlMotorSCurrentMovementParameters',
  'queryPlayerSCurrentActiveControlMotorList',
  'queryPlayerSCurrentFollowingControlMotor',
  'queryWhetherPlayerSCursorIsActive',
  'setPlayerActiveControlMotors',
  'setPlayerSCursorClickSelectableTargets',
  'setPlayerToFollowControlMotor',
  'setPlayerToLeaveControlMotor',
  'setWhetherPlayerSCursorClickPenetratesUiControls',
  'setWhetherPlayerSCursorIsPersistent',
  'whenPlayerFollowsControlMotor',
  'whenPlayerLeavesControlMotor',
  'whenPlayerSActiveControlMotorListChanges'
] as const

const dualModeNames = [
  'getModelColorAndMaterial',
  'modifyModelColorAndMaterial',
  'queryWhetherPlayerIsSubscribed'
] as const

function nodeId(node: GraphNode): number | undefined {
  return node.concreteId?.nodeId ?? node.genericId?.nodeId
}

function pinSignature(node: GraphNode): string {
  return (node.pins ?? []).map((pin) => `${pin.i1.kind}:${pin.i1.index}`).join(',')
}

function inputPin(node: GraphNode, index: number): NodePin {
  const pin = (node.pins ?? []).find(
    (candidate) => candidate.i1.kind === 3 && candidate.i1.index === index
  )
  assert.ok(pin, `node ${nodeId(node)} is missing input pin ${index}`)
  return pin
}

function decodeNodes(filePath: string): GraphNode[] {
  assert.ok(fs.existsSync(filePath), `missing generated GIA: ${filePath}`)
  const root = decode_gia_file(filePath, protoPath)
  return root.graph?.graph?.inner?.graph?.nodes ?? []
}

function assertAllParametersAndOutputsUsed(
  nodes: GraphNode[],
  allNodes: GraphNode[],
  label: string
): void {
  const connectedOutputs = new Set<string>()
  for (const node of allNodes) {
    for (const pin of node.pins ?? []) {
      for (const connection of pin.connects) {
        if (connection.connect.kind === 4) {
          connectedOutputs.add(`${connection.id}:${connection.connect.index}`)
        }
      }
    }
  }

  for (const node of nodes) {
    const id = nodeId(node)
    for (const pin of node.pins ?? []) {
      if (pin.i1.kind === 3) {
        assert.ok(
          pin.connects.length > 0 || pin.value?.alreadySetVal,
          `${label} node ${id} input ${pin.i1.index} is neither wired nor set to a literal`
        )
      }
      if (pin.i1.kind === 4) {
        assert.ok(
          connectedOutputs.has(`${node.nodeIndex}:${pin.i1.index}`),
          `${label} node ${id} output ${pin.i1.index} is not connected to a consumer`
        )
      }
    }
  }
}

for (const [key, expectedId] of Object.entries(nodeIdByKey)) {
  assert.equal(NODE_ID[key as keyof typeof NODE_ID], expectedId, `${key} id`)
}

assert.equal(ENUM_ID.Color_Overlay_Type, 42)
assert.equal(ENUM_ID.Color_Blend_Type, 42)
assert.equal(ENUM_ID.Fill_Material, 43)
assert.equal(ENUM_ID.Movement_Mode, 1042)
assert.equal(ENUM_ID.Fixed_Motion_Parameter_Type, 1043)
assert.equal(ENUM_VALUE.ColorOverlayType_Overwrite, 6700)
assert.equal(ENUM_VALUE.ColorOverlayType_Multiply, 6701)
assert.equal(ENUM_VALUE.FillMaterial_Frozen, 6710)
assert.equal(ENUM_VALUE.FillMaterial_Petrified, 6711)
assert.equal(ENUM_VALUE.ColorBlendType_Override, 6700)
assert.equal(ENUM_VALUE.ColorBlendType_Multiply, 6701)
assert.equal(ENUM_VALUE.FillMaterial_Freeze, 6710)
assert.equal(ENUM_VALUE.FillMaterial_Petrification, 6711)

for (const [id, expected] of expectedRecords) {
  const record = NODE_PIN_RECORDS.find((candidate) => candidate.id === id)
  assert.ok(record, `missing node pin record ${id}`)
  assert.deepEqual(record.inputs, expected.inputs, `node ${id} inputs`)
  assert.deepEqual(record.outputs, expected.outputs, `node ${id} outputs`)
}

for (const name of beyondOnlyNames) {
  assert.equal(NODE_TYPE_BY_METHOD[name], 'beyond', `${name} mode`)
}
for (const name of dualModeNames) {
  assert.equal(
    Object.hasOwn(NODE_TYPE_BY_METHOD, name),
    false,
    `${name} must remain available in both modes`
  )
}

for (const eventName of [
  'whenPlayerSActiveControlMotorListChanges',
  'whenPlayerFollowsControlMotor',
  'whenPlayerLeavesControlMotor'
] as const) {
  assert.ok(ServerEventMetadata[eventName], `missing event metadata ${eventName}`)
}

const nodeDefinitionsSource = fs.readFileSync(
  path.join(repoRoot, 'src/definitions/nodes.ts'),
  'utf8'
)
const entityHelpersSource = fs.readFileSync(
  path.join(repoRoot, 'src/definitions/entity_helpers.ts'),
  'utf8'
)
const eventPayloadSource = fs.readFileSync(
  path.join(repoRoot, 'src/definitions/events-payload.ts'),
  'utf8'
)
const differingServerNodeNames = [
  'Edit Model Color & Material',
  'Set Player to Follow Control Motion Device',
  'Set Player to Leave Control Motion Device',
  'Set Player to Activate Control Motion Device',
  "Query Player's Currently Activated Control Motion Device List",
  "Query Player's Followed Control Motion Device",
  "Query Control Motion Device's Current Movement Parameters",
  "Set Player's Cursor to Always Visible",
  "Enable Player's Cursor to Click Selectable Targets",
  "Set Player's Cursor to Click Through UI Controls",
  'Check Whether Player Cursor Is Active',
  'Check Whether Player Has Subscribed'
]
for (const editorName of differingServerNodeNames) {
  assert.ok(
    nodeDefinitionsSource.includes(`* ${editorName}`),
    `nodes.ts is missing differing editor name in JSDoc: ${editorName}`
  )
  assert.ok(
    entityHelpersSource.includes(`* ${editorName}`),
    `entity_helpers.ts is missing differing editor name in JSDoc: ${editorName}`
  )
}
for (const officialLabel of [
  'Target Entity',
  'Overwrite Color Configurations',
  'Enable Custom Color?',
  'Fill Color',
  'Color Opacity',
  'Color Blend Type',
  'Overwrite Material Configurations',
  'Enable Custom Material?',
  'Fill Material Type',
  'Color Blend Mode',
  'Control Motion Device Entity',
  'Control Motion Device Entity List',
  'Control Motion Device',
  'Forward Acceleration',
  'Reverse Acceleration',
  'Turn Speed',
  'Base Resistance',
  'Resistance Coefficient',
  'Max Forward Speed',
  'Max Reverse Speed',
  'Always Show Cursor?',
  'Cursor Clickable Layer Filter ID',
  'Max Selectable Targets',
  'Click Through UI Controls?',
  'Activate',
  'Collision Box ID',
  'Subscribed'
]) {
  assert.ok(
    nodeDefinitionsSource.includes(officialLabel),
    `nodes.ts is missing pin JSDoc for ${officialLabel}`
  )
}
assert.ok(!nodeDefinitionsSource.includes('activationStaet'))
assert.ok(!entityHelpersSource.includes('activationStaet'))
assert.ok(nodeDefinitionsSource.includes('activationStatus: boolean'))
assert.ok(entityHelpersSource.includes('activationStatus: boolean'))
assert.ok(nodeDefinitionsSource.includes('colorBlendType: ColorBlendType'))
assert.ok(nodeDefinitionsSource.includes('colorBlendMode: ColorBlendType'))
for (const officialEventName of [
  "When Player's Activated Control Motion Device List Changes",
  'When Player Follows Control Motion Device',
  'When Player Leaves Control Motion Device'
]) {
  assert.ok(
    eventPayloadSource.includes(`* ${officialEventName}`),
    `events-payload.ts is missing differing editor name in JSDoc: ${officialEventName}`
  )
}
for (const officialEventLabel of [
  'Event Source Entity',
  'Event Source GUID',
  'Old Control Motion Device Entity List',
  'Current Activated Control Motion Device Entity List',
  'Follow Control Motion Device Entity',
  'Leave Control Motion Device Entity'
]) {
  assert.ok(
    eventPayloadSource.includes(`* ${officialEventLabel}`),
    `events-payload.ts is missing output JSDoc for ${officialEventLabel}`
  )
}
for (const source of [nodeDefinitionsSource, entityHelpersSource, eventPayloadSource]) {
  assert.doesNotMatch(source, /Official editor|官方编辑器|compatibility alias|兼容别名/)
}
for (const source of [nodeDefinitionsSource, entityHelpersSource]) {
  for (const note of [
    'GSTS Note: This value is a four-bit mask, not a single layer ID.',
    'Scene = 1 (bit 0), Hurtbox = 2 (bit 1),',
    'Object Collision = 4 (bit 2), Cursor Collision = 8 (bit 3).',
    'GSTS 注: 该值是四位位掩码，并非单个层级ID。',
    '场景 = 1（第0位）、受击盒 = 2（第1位）、物件碰撞 = 4（第2位）、光标碰撞 = 8（第3位）。'
  ]) {
    assert.ok(source.includes(note), `cursor layer-mask JSDoc is missing: ${note}`)
  }
}

assert.deepEqual(SERVER_LITERAL_ARGUMENT_INDEXES_BY_METHOD.setPlayerSCursorClickSelectableTargets, [
  1
])
assert.deepEqual(
  SERVER_LITERAL_ARGUMENT_INDEXES_BY_NODE_TYPE.set_player_s_cursor_click_selectable_targets,
  [1]
)
assert.doesNotThrow(() => assertServerLiteralValue(new int(10n)))
const wiredInt = new int()
wiredInt.markPin({ id: 1, type: 'data', nodeType: 'addition', args: [] }, 'result', 0)
assert.throws(() => assertServerLiteralValue(wiredInt), /only accepts a literal value/)
const cursorRangeFunctions = new ServerExecutionFlowFunctions(new MetaCallRegistry())
const cursorRangePlayer = new entity() as unknown as PlayerEntity
for (const invalidMask of [-1n, 16n]) {
  assert.throws(
    () =>
      cursorRangeFunctions.setPlayerSCursorClickSelectableTargets(
        cursorRangePlayer,
        invalidMask,
        1n
      ),
    new RegExp(`must be an integer literal between 0 and 15.*received ${invalidMask}`)
  )
}
assert.throws(
  () =>
    cursorRangeFunctions.setPlayerSCursorClickSelectableTargets(cursorRangePlayer, new int(), 1n),
  /must be an integer literal between 0 and 15.*received undefined/
)

const staticMetadata = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'resources/server_node_static_metadata.json'), 'utf8')
) as StaticMetadata
assert.equal(staticMetadata.summary.literalOnlyInputs, 1)
assert.equal(staticMetadata.summary.pinsWithUnsupportedDefaults, 1)
assert.deepEqual(
  staticMetadata.nodes.flatMap((node) =>
    node.pins
      .filter((pin) => pin.unsupportedDefaultPayload !== undefined)
      .map((pin) => [node.genericId, pin.index])
  ),
  [[835, 1]]
)
const cursorStaticNode = staticMetadata.nodes.find((node) => node.genericId === 847)
assert.ok(cursorStaticNode)
assert.deepEqual(
  cursorStaticNode.pins
    .filter((pin) => pin.kind === 'input' && pin.connectable === false)
    .map((pin) => pin.index),
  [1]
)
const collisionStaticNode = staticMetadata.nodes.find((node) => node.genericId === 854)
assert.ok(collisionStaticNode)
assert.deepEqual(
  collisionStaticNode.pins
    .filter((pin) => pin.kind === 'input')
    .map((pin) => [pin.index, pin.name, pin.defaultValue]),
  [
    [0, '组件（不可见）', 45],
    [1, '目标实体', undefined],
    [2, '碰撞盒序号', undefined],
    [3, '是否激活', undefined]
  ]
)

const beyondNodes = decodeNodes(beyondGiaPath)
const beyondTargetNodes = beyondNodes.filter((node) => expectedPins.has(nodeId(node) ?? -1))
assert.deepEqual(
  [...new Set(beyondTargetNodes.map(nodeId))].sort((a, b) => (a ?? 0) - (b ?? 0)),
  [...expectedPins.keys()]
)
for (const node of beyondTargetNodes) {
  const id = nodeId(node)!
  assert.equal(pinSignature(node), expectedPins.get(id), `node ${id} emitted pins`)
}
assertAllParametersAndOutputsUsed(beyondTargetNodes, beyondNodes, 'beyond')

const cursorNodes = beyondTargetNodes.filter((node) => nodeId(node) === 847)
assert.equal(cursorNodes.length, 2, 'direct and entity-helper cursor calls must both be emitted')
assert.deepEqual(
  cursorNodes.map((node) => inputPin(node, 1).value?.bInt?.val).sort((a, b) => (a ?? 0) - (b ?? 0)),
  [10, 11]
)
for (const cursorNode of cursorNodes) {
  const literalLayerPin = inputPin(cursorNode, 1)
  assert.equal(literalLayerPin.connects.length, 0)
  assert.equal(literalLayerPin.value?.alreadySetVal, true)
  const wiredMaximumTargetsPin = inputPin(cursorNode, 2)
  assert.ok(wiredMaximumTargetsPin.connects.length > 0)
  assert.equal(wiredMaximumTargetsPin.value?.alreadySetVal, false)
}

const collisionNode = beyondTargetNodes.find((node) => nodeId(node) === 854)
assert.ok(collisionNode)
assert.equal(
  collisionNode.pins.some((pin) => pin.i1.kind === 3 && pin.i1.index === 0),
  false,
  'hidden collision-box component pin must not be emitted'
)
assert.ok(inputPin(collisionNode, 1).connects.length > 0)
assert.ok(inputPin(collisionNode, 2).connects.length > 0)
assert.equal(inputPin(collisionNode, 3).value?.alreadySetVal, true)

const literalModelNode = beyondTargetNodes.find(
  (node) =>
    nodeId(node) === 835 &&
    inputPin(node, 5).value?.alreadySetVal &&
    inputPin(node, 8).value?.alreadySetVal
)
assert.ok(literalModelNode)
assert.equal(inputPin(literalModelNode, 5).value?.bEnum?.val, 6701)
assert.equal(inputPin(literalModelNode, 8).value?.bEnum?.val, 6711)
for (const index of [0, 2, 3, 4]) {
  assert.ok(inputPin(literalModelNode, index).connects.length > 0)
}
for (const index of [1, 5, 6, 7, 8]) {
  assert.equal(inputPin(literalModelNode, index).value?.alreadySetVal, true)
}

const wiredModelNode = beyondTargetNodes.find(
  (node) =>
    nodeId(node) === 835 &&
    inputPin(node, 5).connects.length > 0 &&
    inputPin(node, 8).connects.length > 0
)
assert.ok(wiredModelNode)
for (let index = 0; index <= 8; index++) {
  assert.ok(inputPin(wiredModelNode, index).connects.length > 0)
}

const persistentCursorNode = beyondTargetNodes.find((node) => nodeId(node) === 846)
assert.ok(persistentCursorNode)
assert.ok(inputPin(persistentCursorNode, 1).connects.length > 0)
const penetratingCursorNode = beyondTargetNodes.find((node) => nodeId(node) === 848)
assert.ok(penetratingCursorNode)
assert.ok(inputPin(penetratingCursorNode, 1).connects.length > 0)

const secondBeyondNodes = decodeNodes(secondBeyondGiaPath)
const secondBeyondTargetNodes = secondBeyondNodes.filter((node) =>
  expectedPins.has(nodeId(node) ?? -1)
)
assert.deepEqual(
  [...new Set(secondBeyondTargetNodes.map(nodeId))].sort((a, b) => (a ?? 0) - (b ?? 0)),
  [835, 836, 847, 855]
)
for (const node of secondBeyondTargetNodes) {
  const id = nodeId(node)!
  assert.equal(pinSignature(node), expectedPins.get(id), `second beyond node ${id} emitted pins`)
}
assertAllParametersAndOutputsUsed(secondBeyondTargetNodes, secondBeyondNodes, 'second beyond')

const secondBeyondCursorNodes = secondBeyondTargetNodes.filter((node) => nodeId(node) === 847)
assert.equal(secondBeyondCursorNodes.length, 16, 'all four-bit cursor layer masks must be emitted')
assert.deepEqual(
  secondBeyondCursorNodes
    .map((node) => inputPin(node, 1).value?.bInt?.val)
    .sort((a, b) => (a ?? 0) - (b ?? 0)),
  Array.from({ length: 16 }, (_, value) => value)
)
for (const cursorNode of secondBeyondCursorNodes) {
  assert.equal(inputPin(cursorNode, 1).connects.length, 0)
  assert.equal(inputPin(cursorNode, 2).value?.bInt?.val, 1)
}

const secondBeyondLiteralModelNode = secondBeyondTargetNodes.find(
  (node) =>
    nodeId(node) === 835 &&
    inputPin(node, 5).value?.alreadySetVal &&
    inputPin(node, 8).value?.alreadySetVal
)
assert.ok(secondBeyondLiteralModelNode)
assert.equal(inputPin(secondBeyondLiteralModelNode, 5).value?.bEnum?.val, 6701)
assert.equal(inputPin(secondBeyondLiteralModelNode, 8).value?.bEnum?.val, 6711)

const secondBeyondWiredModelNode = secondBeyondTargetNodes.find(
  (node) =>
    nodeId(node) === 835 &&
    inputPin(node, 5).connects.length > 0 &&
    inputPin(node, 8).connects.length > 0
)
assert.ok(secondBeyondWiredModelNode)
for (const index of [0, 1, 2, 3, 4, 5, 7, 8]) {
  assert.ok(inputPin(secondBeyondWiredModelNode, index).connects.length > 0)
}
assert.equal(inputPin(secondBeyondWiredModelNode, 6).value?.alreadySetVal, true)

const documents = JSON.parse(fs.readFileSync(irPath, 'utf8')) as IRDocument[]
assert.deepEqual(
  documents.map((document) => document.graph.id),
  [SERVER_DEFAULT_GRAPH_ID, SERVER_DEFAULT_GRAPH_ID + 1]
)
assert.deepEqual(
  documents.map((document) => document.graph.mode),
  ['beyond', 'beyond']
)
const invalidLiteralDocument = globalThis.structuredClone(documents[0])
const invalidLiteralNodes = invalidLiteralDocument.nodes
assert.ok(invalidLiteralNodes)
const invalidLiteralNode = invalidLiteralNodes.find(
  (node) => node.type === 'set_player_s_cursor_click_selectable_targets'
)
assert.ok(invalidLiteralNode?.args)
invalidLiteralNode.args[1] = invalidLiteralNode.args[2]!
assert.throws(
  () => irToGia(invalidLiteralDocument, { protoPath }),
  /set_player_s_cursor_click_selectable_targets input #1 only accepts a literal value/
)

// A renamed-node alias must never redirect a node type that exists under its own name.
const nodeIdLower = getNodeIdLowerMap()
for (const alias of Object.keys(SPECIAL_NODE_MAPPINGS)) {
  assert.ok(
    !nodeIdLower.has(alias) && !nodeIdLower.has(`${alias}__generic`),
    `${alias} is a node of its own and must not be redirected`
  )
}

console.log(
  `[ok] verified ${expectedPins.size} latest server node/event ids, pin layouts, modes, ` +
    'all parameters/outputs, concise editor-name JSDoc, enum values, literal-only input, ' +
    'mixed connections, entity helpers, and hidden-pin remapping'
)
