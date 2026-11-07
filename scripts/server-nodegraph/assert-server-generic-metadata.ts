import assert from 'node:assert/strict'
import fs from 'node:fs'

import ts from 'typescript'

import { ENUM_ID } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/enum_id.js'
import { NODE_ID } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_id.js'
import { NODE_PIN_RECORDS } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_pin_records.js'
import { SERVER_ENUM_TYPES_WITHOUT_EQUALITY_NODE } from '../testgen/server_enum_capabilities.js'

type GenericRule = {
  functionName: string
  genericParameters: string[]
  availableTypes: string[]
}

type GenericSummary = {
  id: number
  functionCount: number
  typeCount: number
  functions: string[]
  types: string[]
}

type StaticPin = {
  kind: string
  index: number
  valueClass?: number
  connectionType?: number
  variants?: Array<{ connectionType?: number }>
}

type StaticMetadata = {
  concreteVariantNodes?: Array<{
    genericId: number
    groups: Array<{
      graphType: number
      variants: Array<{ concreteId: number; bindings: number[][] }>
    }>
  }>
  nodes: Array<{ genericId: number; pins: StaticPin[] }>
}

type EditorEnumNames = {
  enums: Array<{ id: number; nameEn: string }>
}

const SERVER_EQUALITY_TYPES_BY_ENUM_ID = [
  [1, 'ComparisonOperator'],
  [2, 'LogicalOperator'],
  [3, 'MathematicalOperator'],
  [4, 'AttackShape'],
  [5, 'SurvivalStatus'],
  [6, 'SortBy'],
  [7, 'RoundingMode'],
  [8, 'TypeConversion'],
  [9, 'MotionPathPointType'],
  [10, 'MotionType'],
  [11, 'FollowLocationType'],
  [12, 'FollowCoordinateSystem'],
  [13, 'ElementalType'],
  [14, 'EntityType'],
  [16, 'UnitStatusAdditionResult'],
  [17, 'UnitStatusRemovalReason'],
  [18, 'UnitStatusRemovalStrategy'],
  [19, 'RevivePointSelectionStrategy'],
  [20, 'CauseOfBeingDown'],
  [21, 'TrigonometricFunction'],
  [22, 'DisruptorDeviceType'],
  [23, 'DisruptorDeviceOrientation'],
  [24, 'UIControlGroupStatus'],
  [25, 'TargetType'],
  [26, 'TriggerRestriction'],
  [27, 'HitType'],
  [28, 'AttackType'],
  [29, 'HitPerformanceLevel'],
  [30, 'CharacterSkillSlot'],
  [31, 'SoundAttenuationMode'],
  [32, 'SelectCompletionReason'],
  [33, 'SettlementStatus'],
  [35, 'ReasonForItemChange'],
  [36, 'ItemLootType'],
  [37, 'DecisionRefreshMode'],
  [38, 'ElementalReactionType'],
  [39, 'InterruptStatus'],
  [40, 'GameplayMode'],
  [41, 'InputDeviceType'],
  [42, 'ColorBlendType'],
  [43, 'FillMaterial'],
  [44, 'HitLevel']
] as const

const TYPE_BY_VENDOR_TAG: Record<string, string> = {
  Bol: 'bool',
  Cfg: 'configId',
  Ety: 'entity',
  Fct: 'faction',
  Flt: 'float',
  Gid: 'guid',
  Int: 'int',
  Pfb: 'prefabId',
  Str: 'str',
  Vec: 'vec3'
}

const SERVER_ENUM_RECORD_ID_BY_CONNECTION_TYPE = new Map<number, number>([
  [10002, ENUM_ID.Comparison_Operators],
  [10003, ENUM_ID.Logical_Operators],
  [10004, ENUM_ID.Mathematical_Operators],
  [10007, ENUM_ID.Sorting_Rules],
  [10008, ENUM_ID.Rounding_Logic],
  [10012, ENUM_ID.Follow_Location_Type],
  [10013, ENUM_ID.Coordinate_System_Type],
  [10014, ENUM_ID.Elemental_Type],
  [10015, ENUM_ID.Entity_Type],
  [10017, ENUM_ID.Unit_Status_Addition_Result],
  [10018, ENUM_ID.Unit_Status_Removal_Reason],
  [10019, ENUM_ID.Unit_Status_Removal_Strategy],
  [10021, ENUM_ID.Cause_Of_Being_Down],
  [10022, ENUM_ID.Trigonometric_Functions],
  [10025, ENUM_ID.UI_Control_Group_Status],
  [10031, ENUM_ID.Skill_Slot],
  [10032, ENUM_ID.Sound_Attenuation_Mode],
  [10033, ENUM_ID.Select_Completion_Reason],
  [10034, ENUM_ID.Settlement_Status],
  [10035, ENUM_ID.Rank_Settlement_Status],
  [10036, ENUM_ID.Reason_For_Item_Change],
  [10037, ENUM_ID.Item_Loot_Type],
  [10038, ENUM_ID.Decision_Refresh_Mode],
  [10039, ENUM_ID.Elemental_Reaction_Type],
  [10040, ENUM_ID.Scan_Scoring_Rules],
  [10041, ENUM_ID.Random_Order],
  [10042, ENUM_ID.Gameplay_Mode],
  [10043, ENUM_ID.Input_Device_Type],
  [10044, ENUM_ID.Fixed_Point_Motion_Device_Motion_Type],
  [10045, ENUM_ID.Fixed_Point_Motion_Device_Parameter_Conversion_Type],
  [10046, ENUM_ID.Top_of_Stack_Skill_Destruction_Type],
  [10047, ENUM_ID.Class_Switch_Skill_Handling],
  [10048, ENUM_ID.Color_Blend_Type],
  [10049, ENUM_ID.Fill_Material],
  [210043, ENUM_ID.Interrupt_Status],
  [210038, ENUM_ID.Hit_Level],
  [210045, ENUM_ID.Damage_Pop_Up_Type]
])

const IMPLICIT_ENUM_SELECTOR_NODE_IDS = new Set([
  200, 202, 204, 206, 208, 211, 213, 215, 216, 218, 221, 222, 226, 227, 228, 229, 230, 231, 232,
  233, 291, 292, 293, 294, 295, 296, 321, 322
])

const FUNCTION_NAME_BY_GENERIC_ID: Record<number, string> = {
  160: 'modifyValueInList',
  445: 'nativeSettingCustomValue',
  948: 'setOrAddKeyValuePairsToDictionary',
  1648: "queryDictionary'sLength"
}

function splitTopLevel(value: string) {
  const parts: string[] = []
  let depth = 0
  let start = 0

  for (let index = 0; index < value.length; index++) {
    const char = value[index]
    if (char === '<') depth++
    if (char === '>') depth--
    if (char === ',' && depth === 0) {
      parts.push(value.slice(start, index))
      start = index + 1
    }
  }
  parts.push(value.slice(start))
  return parts.map((part) => part.trim())
}

function decodeVendorType(value: string): string {
  const baseType = TYPE_BY_VENDOR_TAG[value]
  if (baseType) return baseType

  const enumMatch = /^E<(\d+)>$/.exec(value)
  if (enumMatch) return `e<${enumMatch[1]}>`

  if (value.startsWith('L<') && value.endsWith('>')) {
    return `list<${decodeVendorType(value.slice(2, -1))}>`
  }

  if (value.startsWith('D<') && value.endsWith('>')) {
    const types = splitTopLevel(value.slice(2, -1))
    assert.equal(types.length, 2, `invalid vendor dictionary type: ${value}`)
    return `dict<${decodeVendorType(types[0])}, ${decodeVendorType(types[1])}>`
  }

  throw new Error(`unsupported vendor generic type: ${value}`)
}

function decodeReflectType(value: string): string {
  assert.ok(value.startsWith('S<') && value.endsWith('>'), `invalid reflect type: ${value}`)
  const parameters = new Map(
    splitTopLevel(value.slice(2, -1)).map((parameter) => {
      const separator = parameter.indexOf(':')
      assert.notEqual(separator, -1, `invalid reflect parameter: ${parameter}`)
      return [parameter.slice(0, separator), parameter.slice(separator + 1)]
    })
  )

  const type = parameters.get('T')
  if (type) return decodeVendorType(type)

  const key = parameters.get('K')
  const dictionaryValue = parameters.get('V')
  assert.ok(key && dictionaryValue, `unsupported reflect parameters: ${value}`)
  return `dict<${decodeVendorType(key)}, ${decodeVendorType(dictionaryValue)}>`
}

function toFunctionName(displayName: string) {
  const words = displayName
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
  return words
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('')
}

function normalizeFunctionName(functionName: string) {
  return functionName.replace(/[^A-Za-z0-9]/g, '').toLowerCase()
}

function assertSameTypes(label: string, actual: string[], expected: string[]) {
  const actualSet = new Set(actual)
  const expectedSet = new Set(expected)
  const missing = [...expectedSet].filter((type) => !actualSet.has(type))
  const extra = [...actualSet].filter((type) => !expectedSet.has(type))

  assert.deepEqual(
    { missing, extra },
    { missing: [], extra: [] },
    `${label} generic types do not match the vendor reflect map`
  )
  assert.equal(actual.length, actualSet.size, `${label} contains duplicate generic types`)
}

const rules = JSON.parse(fs.readFileSync('resources/node_generics.json', 'utf8')) as GenericRule[]
const summaries = JSON.parse(
  fs.readFileSync('resources/node_generics_summary.json', 'utf8')
) as GenericSummary[]
const staticMetadata = JSON.parse(
  fs.readFileSync('resources/server_node_static_metadata.json', 'utf8')
) as StaticMetadata
const editorEnumNames = JSON.parse(
  fs.readFileSync('resources/mihoyo_editor_names.json', 'utf8')
) as EditorEnumNames
const officialEnumById = new Map(editorEnumNames.enums.map((entry) => [entry.id, entry]))
const ruleByName = new Map(rules.map((rule) => [rule.functionName, rule]))
const ruleByNormalizedName = new Map(
  rules.map((rule) => [normalizeFunctionName(rule.functionName), rule])
)
const matchedRules = new Set<string>()

for (const node of NODE_PIN_RECORDS) {
  if (!('reflectMap' in node) || !node.reflectMap) continue

  const functionName = FUNCTION_NAME_BY_GENERIC_ID[node.id] ?? toFunctionName(node.name ?? '')
  const rule =
    ruleByName.get(functionName) ?? ruleByNormalizedName.get(normalizeFunctionName(functionName))
  assert.ok(rule, `missing generic metadata for ${node.name} (${node.id}) as ${functionName}`)
  matchedRules.add(rule.functionName)

  const reflectedTypes = [...new Set(node.reflectMap.map(([, type]) => decodeReflectType(type)))]
  assertSameTypes(rule.functionName, rule.availableTypes, reflectedTypes)
}

assert.deepEqual(
  rules.map((rule) => rule.functionName).filter((name) => !matchedRules.has(name)),
  [],
  'generic metadata contains functions without a vendor reflect map'
)

for (const summary of summaries) {
  assert.equal(
    summary.functionCount,
    summary.functions.length,
    `generic summary ${summary.id} functionCount is stale`
  )
  assert.equal(
    summary.typeCount,
    summary.types.length,
    `generic summary ${summary.id} typeCount is stale`
  )
  for (const functionName of summary.functions) {
    const rule = ruleByName.get(functionName)
    assert.ok(rule, `generic summary ${summary.id} references unknown function ${functionName}`)
    assertSameTypes(
      `generic summary ${summary.id}/${functionName}`,
      summary.types,
      rule.availableTypes
    )
  }
}

const enumEqualRecord = NODE_PIN_RECORDS.find((node) => node.id === 475)
assert.ok(
  enumEqualRecord && 'reflectMap' in enumEqualRecord && enumEqualRecord.reflectMap,
  'missing server Enumerations Equal reflect map'
)
const enumEqualReflectMap = enumEqualRecord.reflectMap
const reflectedEnumIds = enumEqualReflectMap.map(([, reflectType]) => {
  const match = /^S<T:E<(\d+)>>$/.exec(reflectType)
  assert.ok(match, `invalid Enumerations Equal reflect type: ${reflectType}`)
  return Number(match[1])
})
assert.deepEqual(
  reflectedEnumIds,
  SERVER_EQUALITY_TYPES_BY_ENUM_ID.map(([enumId]) => enumId),
  'server Enumerations Equal enum ids differ from the public type mapping'
)

const enumEqualStaticNode = staticMetadata.nodes.find((node) => node.genericId === 475)
assert.ok(enumEqualStaticNode, 'missing official static metadata for Enumerations Equal (475)')
const enumEqualStaticInputs = [0, 1].map((index) => {
  const pin = enumEqualStaticNode.pins.find(
    (candidate) => candidate.kind === 'input' && candidate.index === index
  )
  assert.ok(pin?.variants, `Enumerations Equal input ${index} has no static variants`)
  return pin.variants
})
const enumEqualConnectionTypes = enumEqualStaticInputs[0].map((variant) => variant.connectionType)
assert.deepEqual(
  enumEqualStaticInputs[1].map((variant) => variant.connectionType),
  enumEqualConnectionTypes,
  'Enumerations Equal input variant lists differ'
)
assert.equal(
  enumEqualConnectionTypes.length,
  SERVER_EQUALITY_TYPES_BY_ENUM_ID.length,
  'Enumerations Equal static variant count differs from its reflect map'
)

const enumEqualConcreteNode = staticMetadata.concreteVariantNodes?.find(
  (node) => node.genericId === 475
)
assert.ok(enumEqualConcreteNode, 'missing official concrete variants for Enumerations Equal (475)')
assert.equal(enumEqualConcreteNode.groups.length, 1)
const enumEqualConcreteGroup = enumEqualConcreteNode.groups[0]
assert.equal(enumEqualConcreteGroup.graphType, 20000)
assert.equal(enumEqualConcreteGroup.variants.length, enumEqualReflectMap.length)
for (const [index, variant] of enumEqualConcreteGroup.variants.entries()) {
  const [concreteId] = enumEqualReflectMap[index]
  const [enumId] = SERVER_EQUALITY_TYPES_BY_ENUM_ID[index]
  assert.equal(variant.concreteId, concreteId, `Enumerations Equal concrete id at ${index}`)
  assert.deepEqual(
    variant.bindings,
    [
      [3, 0, enumId],
      [3, 1, enumId]
    ],
    `Enumerations Equal concrete bindings for ${concreteId}`
  )
}
const equalityNodePrefix = 'Enumerations_Equal__'
const normalizeName = (value: string) => value.replace(/[^A-Za-z0-9]/g, '').toLowerCase()
const namesMatch = (left: string, right: string) => {
  const normalizedLeft = normalizeName(left)
  const normalizedRight = normalizeName(right)
  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.replace(/s$/, '') === normalizedRight.replace(/s$/, '')
  )
}
for (const [index, [concreteId]] of enumEqualReflectMap.entries()) {
  const connectionType = enumEqualConnectionTypes[index]
  if (connectionType === undefined) {
    throw new Error(`Enumerations Equal ${concreteId} has no connection type`)
  }
  const officialEnum = officialEnumById.get(connectionType - 10000)
  assert.ok(
    officialEnum,
    `Enumerations Equal ${concreteId} has no official enum for connection type ${connectionType}`
  )
  const matchingNodeIdKeys = Object.entries(NODE_ID)
    .filter(([key, nodeId]) => key.startsWith(equalityNodePrefix) && nodeId === concreteId)
    .map(([key]) => key.slice(equalityNodePrefix.length))
  assert.ok(
    matchingNodeIdKeys.some((key) => namesMatch(key, officialEnum.nameEn)),
    `Enumerations Equal ${concreteId} is ${officialEnum.nameEn}, not ` +
      `${matchingNodeIdKeys.join('/') || '(unnamed)'}`
  )
}

function staticPinConnectionType(genericId: number, kind: 'input' | 'output', pinIndex: number) {
  const node = staticMetadata.nodes.find((candidate) => candidate.genericId === genericId)
  assert.ok(node, `missing static server node ${genericId}`)
  const pin = node.pins.find((candidate) => candidate.kind === kind && candidate.index === pinIndex)
  assert.ok(pin?.connectionType, `missing static server node ${genericId} ${kind} ${pinIndex}`)
  return pin.connectionType
}

const staticInputConnectionType = (genericId: number, pinIndex: number) =>
  staticPinConnectionType(genericId, 'input', pinIndex)

const serverPinRecordById = new Map<number, (typeof NODE_PIN_RECORDS)[number]>(
  NODE_PIN_RECORDS.map((record) => [record.id, record])
)
const HIDDEN_SERVER_PIN_KEYS = new Set(['301:input:3'])
for (const node of staticMetadata.nodes) {
  for (const pin of node.pins) {
    if (
      (pin.kind !== 'input' && pin.kind !== 'output') ||
      pin.connectionType === undefined ||
      IMPLICIT_ENUM_SELECTOR_NODE_IDS.has(node.genericId) ||
      HIDDEN_SERVER_PIN_KEYS.has(`${node.genericId}:${pin.kind}:${pin.index}`)
    ) {
      continue
    }
    const enumId = SERVER_ENUM_RECORD_ID_BY_CONNECTION_TYPE.get(pin.connectionType)
    if (enumId === undefined) continue

    const record = serverPinRecordById.get(node.genericId)
    assert.ok(record, `missing node pin record for enum consumer ${node.genericId}`)
    const actual = (pin.kind === 'input' ? record.inputs : record.outputs)[pin.index]
    assert.equal(
      actual,
      `E<${enumId}>`,
      `enum consumer ${node.genericId} ${pin.kind} ${pin.index} is not explicitly typed`
    )
  }
}

for (const [genericId, kind, pinIndex, connectionType] of [
  [224, 'input', 1, 10008],
  [260, 'output', 0, 10015],
  [284, 'output', 1, 10021],
  [297, 'output', 0, 10017],
  [299, 'output', 8, 10018],
  [301, 'input', 2, 10019],
  [301, 'input', 3, 10018],
  [381, 'output', 7, 210043],
  [389, 'input', 2, 10047],
  [395, 'input', 2, 10031],
  [395, 'input', 3, 10046],
  [642, 'output', 2, 10039],
  [653, 'output', 0, 10034],
  [657, 'output', 0, 10034],
  [659, 'input', 1, 10035],
  [660, 'input', 1, 10035],
  [683, 'output', 5, 10036],
  [735, 'input', 1, 10040],
  [738, 'output', 9, 210043],
  [743, 'input', 1, 10041],
  [766, 'output', 1, 10042],
  [768, 'output', 0, 10043],
  [806, 'input', 3, 10046],
  [835, 'input', 5, 10048],
  [835, 'input', 8, 10049],
  [836, 'output', 1, 10048],
  [836, 'output', 5, 10049]
] as const) {
  assert.equal(
    staticPinConnectionType(genericId, kind, pinIndex),
    connectionType,
    `server enum consumer ${genericId} ${kind} ${pinIndex}`
  )
}

const colorBlendConnectionType = staticInputConnectionType(835, 5)
const fillMaterialConnectionType = staticInputConnectionType(835, 8)
assert.deepEqual(
  enumEqualConnectionTypes.slice(-3),
  [colorBlendConnectionType, fillMaterialConnectionType, 210038],
  'Enumerations Equal final variants must retain color/fill-material and append Hit Level'
)
assert.equal(enumEqualConnectionTypes.includes(staticInputConnectionType(775, 2)), false)
assert.equal(enumEqualConnectionTypes.includes(staticInputConnectionType(775, 7)), false)

assert.equal(ENUM_ID.Color_Overlay_Type, 42)
assert.equal(ENUM_ID.Color_Blend_Type, 42)
assert.equal(ENUM_ID.Fill_Material, 43)
assert.equal(ENUM_ID.Movement_Mode, 1042)
assert.equal(ENUM_ID.Fixed_Point_Motion_Device_Motion_Type, 1042)
assert.equal(ENUM_ID.Fixed_Motion_Parameter_Type, 1043)
assert.equal(ENUM_ID.Fixed_Point_Motion_Device_Parameter_Conversion_Type, 1043)
assert.equal(ENUM_ID.Rank_Settlement_Status, 34)
assert.equal(ENUM_ID.Scan_Scoring_Rules, 50)
assert.equal(ENUM_ID.Top_of_Stack_Skill_Destruction_Type, 52)
assert.equal(ENUM_ID.Class_Switch_Skill_Handling, 53)
assert.equal(ENUM_ID.Random_Order, 54)
assert.equal(NODE_ID.Enumerations_Equal__Color_Overlay_Type, 851)
assert.equal(NODE_ID.Enumerations_Equal__Color_Blend_Type, 851)
assert.equal(NODE_ID.Enumerations_Equal__Fill_Material, 852)
assert.equal('Enumerations_Equal__Movement_Mode' in NODE_ID, false)
assert.equal('Enumerations_Equal__Fixed_Motion_Parameter_Type' in NODE_ID, false)

const fixedMotionRecord = NODE_PIN_RECORDS.find((node) => node.id === 775)
const removeUnitStatusRecord = NODE_PIN_RECORDS.find((node) => node.id === 301)
const changePlayerClassRecord = NODE_PIN_RECORDS.find((node) => node.id === 389)
const addCharacterSkillRecord = NODE_PIN_RECORDS.find((node) => node.id === 395)
const setPlayerRankScoreRecord = NODE_PIN_RECORDS.find((node) => node.id === 659)
const getPlayerRankScoreRecord = NODE_PIN_RECORDS.find((node) => node.id === 660)
const randomDeckSelectorRecord = NODE_PIN_RECORDS.find((node) => node.id === 743)
const bindCustomSkillRecord = NODE_PIN_RECORDS.find((node) => node.id === 806)
const editModelRecord = NODE_PIN_RECORDS.find((node) => node.id === 835)
const getModelRecord = NODE_PIN_RECORDS.find((node) => node.id === 836)
assert.deepEqual(fixedMotionRecord?.inputs, [
  'Ety',
  'Str',
  'E<1042>',
  'Flt',
  'Vec',
  'Vec',
  'Bol',
  'E<1043>',
  'Flt'
])
assert.deepEqual(removeUnitStatusRecord?.inputs, ['Ety', 'Cfg', 'E<18>', 'Unk', 'Ety'])
assert.deepEqual(changePlayerClassRecord?.inputs, ['Ety', 'Cfg', 'E<53>'])
assert.deepEqual(addCharacterSkillRecord?.inputs, ['Ety', 'Cfg', 'E<30>', 'E<52>'])
assert.deepEqual(setPlayerRankScoreRecord?.inputs, ['Ety', 'E<34>', 'Int'])
assert.deepEqual(getPlayerRankScoreRecord?.inputs, ['Ety', 'E<34>'])
assert.deepEqual(randomDeckSelectorRecord?.inputs, ['L<Int>', 'E<54>'])
assert.deepEqual(bindCustomSkillRecord?.inputs, ['Ety', 'Int', 'E<30>', 'E<52>'])
assert.deepEqual(editModelRecord?.inputs, [
  'Ety',
  'Bol',
  'Bol',
  'Int',
  'Flt',
  'E<42>',
  'Bol',
  'Bol',
  'E<43>'
])
assert.deepEqual(getModelRecord?.outputs, ['Bol', 'E<42>', 'Int', 'Flt', 'Bol', 'E<43>'])

const nodesSource = fs.readFileSync('src/definitions/nodes.ts', 'utf8')
const nodesSourceFile = ts.createSourceFile(
  'nodes.ts',
  nodesSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS
)
const serverFunctionsClass = nodesSourceFile.statements.find(
  (statement): statement is ts.ClassDeclaration =>
    ts.isClassDeclaration(statement) && statement.name?.text === 'ServerExecutionFlowFunctions'
)
assert.ok(serverFunctionsClass, 'missing ServerExecutionFlowFunctions')
const equalityOverloadTypes = serverFunctionsClass.members
  .filter(
    (member): member is ts.MethodDeclaration =>
      ts.isMethodDeclaration(member) &&
      ts.isIdentifier(member.name) &&
      member.name.text === 'enumerationsEqual' &&
      !member.body
  )
  .map((member) => member.parameters[0]?.type?.getText(nodesSourceFile))
assert.deepEqual(
  equalityOverloadTypes,
  SERVER_EQUALITY_TYPES_BY_ENUM_ID.map(([, typeName]) => typeName),
  'server enumerationsEqual overloads differ from the official concrete variants'
)

for (const [methodName, parameterIndex, expectedType] of [
  ['activateFixedPointMotionDevice', 2, 'FixedPointMotionDeviceMotionType'],
  ['activateFixedPointMotionDevice', 7, 'FixedPointMotionDeviceParameterConversionType'],
  ['switchFollowMotionDeviceTargetByGuid', 5, 'CoordinateSystemType'],
  ['switchFollowMotionDeviceTargetByEntity', 5, 'CoordinateSystemType'],
  ['changePlayerClass', 2, 'ClassSwitchSkillHandling'],
  ['addCharacterSkill', 3, 'TopOfStackSkillDestructionType'],
  ['bindCustomSkillInstanceToSpecifiedSlot', 3, 'TopOfStackSkillDestructionType'],
  ['setScanTagRules', 1, 'ScanScoringRules'],
  ['randomDeckSelectorSelectionList', 1, 'RandomOrder']
] as const) {
  const method: ts.MethodDeclaration | undefined = serverFunctionsClass.members.find(
    (member): member is ts.MethodDeclaration =>
      ts.isMethodDeclaration(member) &&
      ts.isIdentifier(member.name) &&
      member.name.text === methodName &&
      !!member.body
  )
  assert.ok(method, `missing server method implementation ${methodName}`)
  assert.equal(
    method.parameters[parameterIndex]?.type?.getText(nodesSourceFile),
    expectedType,
    `${methodName} parameter ${parameterIndex} does not use its official enum type`
  )
}

const randomDeckSelectorOverloads = serverFunctionsClass.members.filter(
  (member): member is ts.MethodDeclaration =>
    ts.isMethodDeclaration(member) &&
    ts.isIdentifier(member.name) &&
    member.name.text === 'randomDeckSelectorSelectionList' &&
    !member.body
)
assert.deepEqual(
  randomDeckSelectorOverloads.map((member) =>
    member.parameters.map((parameter) => parameter.type?.getText(nodesSourceFile))
  ),
  [['IntValue[]', 'RandomOrder'], ['IntValue[]']],
  'randomDeckSelectorSelectionList must expose Sort By and preserve its legacy call'
)

for (const [methodName, expectedParameters] of [
  ['setPlayerRankScoreChange', ["EntityOf<'player'>", 'RankSettlementStatus', 'IntValue']],
  ['getPlayerRankScoreChange', ["EntityOf<'player'>", 'RankSettlementStatus']]
] as const) {
  const overloads: ts.MethodDeclaration[] = serverFunctionsClass.members.filter(
    (member): member is ts.MethodDeclaration =>
      ts.isMethodDeclaration(member) &&
      ts.isIdentifier(member.name) &&
      member.name.text === methodName &&
      !member.body
  )
  assert.equal(
    overloads.length,
    0,
    `${methodName} must not accept the incompatible SettlementStatus type`
  )
  const implementation: ts.MethodDeclaration | undefined = serverFunctionsClass.members.find(
    (member): member is ts.MethodDeclaration =>
      ts.isMethodDeclaration(member) &&
      ts.isIdentifier(member.name) &&
      member.name.text === methodName &&
      !!member.body
  )
  assert.deepEqual(
    implementation?.parameters.map((parameter) => parameter.type?.getText(nodesSourceFile)),
    expectedParameters,
    `${methodName} must use RankSettlementStatus exclusively`
  )
}

const removeUnitStatusOverloads = serverFunctionsClass.members.filter(
  (member): member is ts.MethodDeclaration =>
    ts.isMethodDeclaration(member) &&
    ts.isIdentifier(member.name) &&
    member.name.text === 'removeUnitStatus' &&
    !member.body
)
assert.deepEqual(
  removeUnitStatusOverloads,
  [],
  'removeUnitStatus must remain a direct four-input API'
)
const removeUnitStatusMethod = serverFunctionsClass.members.find(
  (member): member is ts.MethodDeclaration =>
    ts.isMethodDeclaration(member) &&
    ts.isIdentifier(member.name) &&
    member.name.text === 'removeUnitStatus' &&
    !!member.body
)
assert.deepEqual(
  removeUnitStatusMethod?.parameters.map((parameter) => parameter.type?.getText(nodesSourceFile)),
  ['EntityValue', 'ConfigIdValue', 'RemovalMethod', 'EntityValue'],
  'removeUnitStatus must expose four public inputs and keep the hidden physical pin internal'
)
assert.deepEqual(
  [...SERVER_ENUM_TYPES_WITHOUT_EQUALITY_NODE].sort(),
  [
    'DamagePopUpType',
    'ExistingSkillHandling',
    'FixedMotionParameterType',
    'MovementMode',
    'OriginalSlotSkillHandling',
    'RandomOrder',
    'RankSettlementStatus',
    'ScanRuleType'
  ],
  'server non-comparable enum capability list is stale'
)

console.log(
  `[ok] ${matchedRules.size} server generic rules and ${enumEqualReflectMap.length} ` +
    `Enumerations Equal variants match vendor and official mihoyobin metadata`
)
