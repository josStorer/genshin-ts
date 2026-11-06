import assert from 'node:assert'
import fs from 'node:fs'

import { CLIENT_ENTITY_HELPER_BINDINGS_BY_SUB_TYPE_AND_MODE } from '../../src/definitions/client_entity_helpers.js'
import { CLIENT_LITERAL_ARGUMENT_INDEXES_BY_SUB_TYPE } from '../../src/definitions/client_method_modes.js'
import {
  CLIENT_NODE_METADATA,
  type ClientPinMetadata
} from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.js'
import {
  CLIENT_CUSTOM_VARIABLE_FAMILY_BY_SUB_TYPE,
  CLIENT_CUSTOM_VARIABLE_TYPE_OFFSET_BY_IR_TYPE
} from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_variable_specialization.js'
import { ClientVarType } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto.js'

type StaticPin = {
  kind: ClientPinMetadata['kind']
  index: number
  i2Index?: number
  name?: string
  clientVarType?: number
  connectable?: boolean
  connectionType?: number
  variants?: Array<{ clientVarType?: number; connectionType?: number }>
  defaultValue?: number | string | boolean | [number, number, number]
}

type StaticMetadata = {
  formatVersion: 2
  source: { aggregateSha256: string }
  summary: {
    inputPins: number
    connectableInputs: number
    literalOnlyInputs: number
    reflectiveInputs: number
    pinsWithExplicitDefaults: number
    namedPins: number
    concreteVariantGroups: number
    concreteVariants: number
    concreteVariantBindings: number
  }
  nodes: Array<{ genericId: number; pins: StaticPin[] }>
}

type ConcreteVariants = {
  formatVersion: 1
  sourceAggregateSha256: string
  nodes: Array<{
    genericId: number
    groups: Array<{
      graphType: number
      variants: Array<{ concreteId: number; bindings: number[][] }>
    }>
  }>
}

type FlowMetadataEntry = {
  nodeType: string
  subTypes: string[]
  params: Array<{ docZh: string }>
}

const staticMetadata = JSON.parse(
  fs.readFileSync('resources/client_node_static_metadata.json', 'utf8')
) as StaticMetadata
const concreteVariants = JSON.parse(
  fs.readFileSync('resources/client_node_concrete_variants.json', 'utf8')
) as ConcreteVariants
const flowMetadata = JSON.parse(
  fs.readFileSync('resources/client_execution_flow_metadata.json', 'utf8')
) as FlowMetadataEntry[]
const staticByGenericId = new Map(
  staticMetadata.nodes.map((node) => [node.genericId, node] as const)
)
const flowBySubTypeAndNodeType = new Map(
  flowMetadata.flatMap((entry) =>
    entry.subTypes.map((subType) => [`${subType}.${entry.nodeType}`, entry] as const)
  )
)

assert.strictEqual(staticMetadata.formatVersion, 2)
assert.strictEqual(concreteVariants.formatVersion, 1)
assert.strictEqual(concreteVariants.sourceAggregateSha256, staticMetadata.source.aggregateSha256)
assert.strictEqual(staticMetadata.nodes.length, 306)
assert.deepStrictEqual(staticMetadata.summary, {
  inputPins: 1297,
  connectableInputs: 932,
  literalOnlyInputs: 365,
  reflectiveInputs: 309,
  pinsWithExplicitDefaults: 140,
  namedPins: 1581,
  concreteVariantGroups: 88,
  concreteVariants: 4259,
  concreteVariantBindings: 53934
})
assert.strictEqual(concreteVariants.nodes.length, 60)
assert.strictEqual(
  concreteVariants.nodes.reduce((count, node) => count + node.groups.length, 0),
  88
)
assert.strictEqual(
  concreteVariants.nodes.reduce(
    (count, node) =>
      count + node.groups.reduce((groupCount, group) => groupCount + group.variants.length, 0),
    0
  ),
  4259
)
assert.strictEqual(
  concreteVariants.nodes.reduce(
    (count, node) =>
      count +
      node.groups.reduce(
        (groupCount, group) =>
          groupCount +
          group.variants.reduce(
            (variantCount, variant) => variantCount + variant.bindings.length,
            0
          ),
        0
      ),
    0
  ),
  53934
)

assert.deepStrictEqual(
  {
    structure: ClientVarType.Structure_,
    structureList: ClientVarType.StructureList_,
    dictionary: ClientVarType.Dictionary_,
    factionList: ClientVarType.FactionList_
  },
  { structure: 22, structureList: 23, dictionary: 24, factionList: 25 }
)

assert.strictEqual(
  staticMetadata.nodes.flatMap((node) => node.pins).filter((pin) => pin.defaultValue === false)
    .length,
  18,
  'protobuf-omitted boolean zero values must remain explicit false defaults'
)

function concreteGroup(genericId: number, graphType: number) {
  const group = concreteVariants.nodes
    .find((node) => node.genericId === genericId)
    ?.groups.find((candidate) => candidate.graphType === graphType)
  assert.ok(group, `missing static concrete group ${genericId}/${graphType}`)
  return group
}

function bindingClientVarType(genericId: number, binding: number[]) {
  const [encodedKind, index, indexOfConcrete] = binding
  const kindByEncoded = {
    1: 'in_flow',
    2: 'out_flow',
    3: 'input',
    4: 'output',
    5: 'client_exec',
    6: 'client_signal'
  } as const
  const pin = staticByGenericId
    .get(genericId)
    ?.pins.find(
      (candidate) =>
        candidate.kind === kindByEncoded[encodedKind as keyof typeof kindByEncoded] &&
        candidate.index === index
    )
  assert.ok(pin, `${genericId}: missing bound pin ${encodedKind}/${index}`)
  return pin.variants?.[indexOfConcrete]?.clientVarType ?? pin.clientVarType
}

const clientVarTypeByIrType: Record<string, number> = {
  bool: ClientVarType.Boolean_,
  int: ClientVarType.Integer_,
  float: ClientVarType.Float_,
  str: ClientVarType.String_,
  guid: ClientVarType.GUID_,
  entity: ClientVarType.Entity_,
  vec3: ClientVarType.Vector_,
  int_list: ClientVarType.IntegerList_,
  str_list: ClientVarType.StringList_,
  entity_list: ClientVarType.EntityList_,
  guid_list: ClientVarType.GUIDList_,
  float_list: ClientVarType.FloatList_,
  vec3_list: ClientVarType.VectorList_,
  bool_list: ClientVarType.BooleanList_,
  config_id: ClientVarType.Configuration_,
  prefab_id: ClientVarType.Prefab_,
  config_id_list: ClientVarType.ConfigurationList_,
  prefab_id_list: ClientVarType.PrefabList_,
  faction: ClientVarType.Faction_,
  faction_list: ClientVarType.FactionList_
}

function validateCustomVariableTable(
  genericId: number,
  graphType: number,
  subType: keyof typeof CLIENT_CUSTOM_VARIABLE_FAMILY_BY_SUB_TYPE
) {
  const group = concreteGroup(genericId, graphType)
  const family = CLIENT_CUSTOM_VARIABLE_FAMILY_BY_SUB_TYPE[subType]
  assert.ok(family, `missing generated custom-variable family ${subType}`)
  for (const [irType, offset] of Object.entries(CLIENT_CUSTOM_VARIABLE_TYPE_OFFSET_BY_IR_TYPE)) {
    const expectedClientVarType = clientVarTypeByIrType[irType]
    assert.ok(expectedClientVarType, `missing test ClientVarType for ${irType}`)
    const variant = group.variants.find(
      (candidate) =>
        candidate.concreteId === family.cidBase + offset &&
        candidate.bindings.some(
          (binding) =>
            binding[0] === 4 && bindingClientVarType(genericId, binding) === expectedClientVarType
        )
    )
    assert.ok(variant, `${subType}.get_custom_variable misses static ${irType} variant`)
  }
  assert.ok(
    group.variants.some(
      (variant) =>
        variant.concreteId === family.dictCid &&
        variant.bindings.some(
          (binding) => binding[0] === 4 && bindingClientVarType(genericId, binding) === 24
        )
    ),
    `${subType}.get_custom_variable misses static dictionary variant`
  )
}

validateCustomVariableTable(200016, 20001, 'character_skill')
validateCustomVariableTable(200016, 20002, 'bool_filter')
validateCustomVariableTable(200173, 20007, 'creation_status')
for (const graphType of [20001, 20002]) {
  const conversion = concreteGroup(200022, graphType)
  assert.strictEqual(conversion.variants.length, 11)
  assert.deepStrictEqual(
    [...new Set(conversion.variants.map((variant) => variant.concreteId))],
    [130]
  )
  const assemblyDictionary = concreteGroup(200152, graphType)
  assert.strictEqual(assemblyDictionary.variants.length, 154)
  assert.deepStrictEqual(
    [...new Set(assemblyDictionary.variants.map((variant) => variant.concreteId))],
    [1048]
  )
}
assert.deepStrictEqual(
  [...new Set(concreteGroup(200081, 20002).variants.map((variant) => variant.concreteId))],
  [2000]
)
assert.deepStrictEqual(
  [...new Set(concreteGroup(200082, 20002).variants.map((variant) => variant.concreteId))],
  [1036]
)

const basePinsByGenericId = new Map<number, Set<string>>()
let publicParams = 0
let literalOnlyPublicParams = 0
let nameCheckedPublicParams = 0

for (const record of CLIENT_NODE_METADATA) {
  const staticNode = staticByGenericId.get(record.genericId)
  assert.ok(staticNode, `${record.subType}.${record.nodeType}: missing static Node metadata`)
  const basePins = basePinsByGenericId.get(record.genericId) ?? new Set<string>()

  for (const pin of [...record.inputs, ...record.outputs, ...(record.flows ?? [])]) {
    const staticPin: StaticPin | undefined = staticNode.pins.find(
      (candidate) => candidate.kind === pin.kind && candidate.index === pin.index
    )
    assert.ok(staticPin, `${record.genericId}: static metadata misses ${pin.kind} #${pin.index}`)
    assert.strictEqual(pin.i2Index ?? pin.index, staticPin.i2Index ?? pin.index)
    if (
      !pin.reflective &&
      pin.clientVarType !== undefined &&
      staticPin.clientVarType !== undefined
    ) {
      assert.strictEqual(pin.clientVarType, staticPin.clientVarType)
    }
    if (pin.kind === 'input') assert.strictEqual(pin.connectable, staticPin.connectable)
    basePins.add(`${pin.kind}:${pin.index}`)
  }
  basePinsByGenericId.set(record.genericId, basePins)

  const argPins = record.argPins ?? record.inputs.map((pin) => pin.index)
  const flow = flowBySubTypeAndNodeType.get(`${record.subType}.${record.nodeType}`)
  const nameCheckArgPins = record.argPins ?? flow?.params.map((_, index) => index)
  if (flow && nameCheckArgPins?.length === flow.params.length) {
    for (const [argIndex, pinIndex] of nameCheckArgPins.entries()) {
      const docName: string | undefined = flow.params[argIndex]?.docZh.trim()
      if (!docName) continue
      const mappedName: string | undefined = staticNode.pins.find(
        (pin) => pin.kind === 'input' && pin.index === pinIndex
      )?.name
      const exactAlternatives: ClientPinMetadata[] = record.inputs.filter(
        (input) =>
          staticNode.pins.find((pin) => pin.kind === 'input' && pin.index === input.index)?.name ===
          docName
      )
      assert.ok(
        exactAlternatives.length,
        `${record.subType}.${record.nodeType} arg #${argIndex} "${docName}" has no ` +
          'exact-name static input pin'
      )
      nameCheckedPublicParams += 1
      assert.ok(
        exactAlternatives.some((pin) => pin.index === pinIndex),
        `${record.subType}.${record.nodeType} arg #${argIndex} "${docName}" maps to ` +
          `pin #${pinIndex} "${mappedName ?? ''}" instead of exact-name pin ` +
          `${exactAlternatives.map((pin) => `#${pin.index}`).join('/')}`
      )
    }
  }
  for (const pinIndex of argPins) {
    publicParams += 1
    const input = record.inputs.find((pin) => pin.index === pinIndex)
    assert.ok(input, `${record.subType}.${record.nodeType}: missing public input pin #${pinIndex}`)
    if (input.connectable === false) literalOnlyPublicParams += 1
  }
}

const pinsAbsentFromBaseMetadata = staticMetadata.nodes.flatMap((node) => {
  const basePins = basePinsByGenericId.get(node.genericId) ?? new Set<string>()
  return node.pins.filter((pin) => !basePins.has(`${pin.kind}:${pin.index}`))
})
assert.strictEqual(CLIENT_NODE_METADATA.length, 920)
assert.strictEqual(publicParams, 3206)
assert.strictEqual(literalOnlyPublicParams, 791)
assert.ok(nameCheckedPublicParams > 0, 'public argument mappings must be checked against pin names')
assert.strictEqual(pinsAbsentFromBaseMetadata.length, 15)
assert.ok(
  pinsAbsentFromBaseMetadata.every((pin) => pin.kind === 'client_signal'),
  'only editor-internal client signal pins may remain outside generated metadata'
)

const eslintLiteralArgumentCount = Object.values(
  CLIENT_LITERAL_ARGUMENT_INDEXES_BY_SUB_TYPE
).reduce(
  (total, methods) =>
    total + Object.values(methods).reduce((count, indexes) => count + indexes.length, 0),
  0
)
assert.strictEqual(
  eslintLiteralArgumentCount,
  731,
  'ESLint literal indexes must cover every public literal-only argument plus the three dynamic client signal-name arguments; each ray-filter array collapses ten fixed slots into one method argument'
)
for (const subType of ['creation_status', 'creation_status_decision'] as const) {
  assert.deepStrictEqual(CLIENT_LITERAL_ARGUMENT_INDEXES_BY_SUB_TYPE[subType].getCustomVariable, [
    0
  ])
  for (const mode of ['beyond', 'classic'] as const) {
    const bindings = CLIENT_ENTITY_HELPER_BINDINGS_BY_SUB_TYPE_AND_MODE[subType][mode]
    assert.strictEqual(
      'get' in bindings || 'getCustomVariable' in bindings,
      false,
      `${subType}.${mode} must not bind an entity receiver to TargetEntity getCustomVariable`
    )
  }
}
for (const subType of ['character_skill', 'character_control_skill', 'creation_skill'] as const) {
  assert.deepStrictEqual(CLIENT_LITERAL_ARGUMENT_INDEXES_BY_SUB_TYPE[subType].getLocalVariable, [0])
  assert.deepStrictEqual(CLIENT_LITERAL_ARGUMENT_INDEXES_BY_SUB_TYPE[subType].setLocalVariable, [0])
  assert.deepStrictEqual(
    CLIENT_LITERAL_ARGUMENT_INDEXES_BY_SUB_TYPE[subType].sendSignalToServerNodeGraph,
    [0]
  )
}

const orderedEntry = staticByGenericId.get(200126)
assert.ok(orderedEntry)
assert.deepStrictEqual(
  orderedEntry.pins
    .filter((pin) => pin.kind === 'out_flow')
    .map((pin) => pin.index)
    .sort((a, b) => a - b),
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  'Creation Status and Status Decision entry must expose ordered output pins 1...10'
)
const continuePreviousFrame = staticByGenericId.get(200253)
assert.ok(continuePreviousFrame)
assert.deepStrictEqual(
  continuePreviousFrame.pins.filter((pin) => pin.kind === 'in_flow').map((pin) => pin.index),
  [0]
)
assert.deepStrictEqual(
  continuePreviousFrame.pins.filter((pin) => pin.kind === 'out_flow'),
  [],
  'continue-previous-frame must remain a terminal execution node'
)

const notify = staticByGenericId.get(200039)
assert.ok(notify)
assert.deepStrictEqual(
  notify.pins.filter((pin) => pin.kind === 'input').map((pin) => pin.connectable),
  [false, false, false]
)

const hitbox = CLIENT_NODE_METADATA.find(
  (record) =>
    record.subType === 'character_skill' &&
    record.nodeType === 'trigger_sector_hitbox_at_specified_attachment_point'
)
assert.ok(hitbox)
const hitboxPublicPins = hitbox.argPins ?? hitbox.inputs.map((pin) => pin.index)
assert.deepStrictEqual(
  hitboxPublicPins.filter((index) => hitbox.inputs.find((pin) => pin.index === index)?.connectable),
  [2, 3, 4, 5, 6, 42, 43, 45],
  'public hit-level input must use the connectable duplicate pin #45, not hidden pin #27'
)

const recoverCreationHp = CLIENT_NODE_METADATA.find(
  (record) => record.subType === 'creation_skill' && record.nodeType === 'recover_creation_s_hp'
)

for (const subType of ['character_skill', 'character_control_skill'] as const) {
  const recoverCharacterHp = CLIENT_NODE_METADATA.find(
    (record) => record.subType === subType && record.nodeType === 'recover_character_s_hp'
  )
  assert.deepStrictEqual(
    recoverCharacterHp?.argPins,
    [0, 1, 7, 9, 10],
    `${subType}.recover_character_s_hp must skip the hidden bool pin #6`
  )
}
assert.strictEqual(
  recoverCreationHp?.inputs.find((pin) => pin.index === 9)?.defaultValue,
  1,
  'editor default must replace the literal value observed in the sample'
)

const statusBranches = CLIENT_NODE_METADATA.find(
  (record) => record.subType === 'creation_status' && record.nodeType === 'multiple_branches'
)
assert.deepStrictEqual(
  statusBranches?.reflectMap?.map((variant) => ({
    concreteId: variant.concreteId,
    key: variant.variantKey,
    ioc: variant.pins?.map((pin) => pin.indexOfConcrete)
  })),
  [
    { concreteId: 4002, key: '3,4', ioc: [0, 0] },
    { concreteId: 4002, key: '9,10', ioc: [1, 1] }
  ],
  'same-CID variants must retain their distinct pin specializations'
)

const statusListLength = CLIENT_NODE_METADATA.find(
  (record) => record.subType === 'creation_status' && record.nodeType === 'get_list_length'
)
assert.strictEqual(statusListLength?.reflectMap?.length, 11)

const statusAssemblyList = CLIENT_NODE_METADATA.find(
  (record) => record.subType === 'creation_status' && record.nodeType === 'assembly_list'
)
assert.ok(
  statusAssemblyList?.reflectMap?.some((variant) =>
    variant.pins?.some((pin) => pin.clientVarType === 22 && pin.type === 'structure')
  ),
  'client type 22 must be decoded as structure rather than local_variable'
)

console.log(
  `[ok] static client metadata: ${staticMetadata.nodes.length} nodes, ` +
    `${staticMetadata.summary.inputPins} physical inputs ` +
    `(${staticMetadata.summary.literalOnlyInputs} literal-only), ` +
    `${staticMetadata.summary.concreteVariants} concrete variants, ` +
    `${publicParams} generated parameters (${literalOnlyPublicParams} literal-only)`
)
