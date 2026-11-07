import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

import { buildClientEnumBinding, type ClientEnumBinding } from './client_enum_binding.js'
import {
  generateClientNodes,
  snakeToCamel,
  type FlowMetadataEntry,
  type MetaRecord
} from './client_nodes_codegen.js'
import { buildDocNameAlignment } from './doc_name_alignment.js'

type ClientGraphSubType =
  | 'character_skill'
  | 'character_control_skill'
  | 'creation_skill'
  | 'creation_status'
  | 'creation_status_decision'
  | 'bool_filter'
  | 'int_filter'

type ClientGraphMode = 'beyond' | 'classic'

type ClientCustomVariableFamilySeed = {
  appliesTo: ClientGraphSubType[]
  cidBase: number
  dictCid: number
}

type ClientVariableSpecializationSeed = {
  typeOffsets: Array<{
    offset: number
    type: string
    clientVarType: number
  }>
  getCustomVariable: {
    characterSkillFamilies: ClientCustomVariableFamilySeed
    creationStatusFamilies: ClientCustomVariableFamilySeed
  }
}

type ClientGraphCapability = Record<
  ClientGraphSubType,
  {
    beyond: { status: string; reason: string }
    classic: { status: string; reason: string }
  }
>

type ClientNodeModeData = {
  graphs: Record<
    ClientGraphSubType,
    {
      entryGenericId: number
      beyond: { status: string; reason: string; genericIds: number[] }
      classic: { status: string; reason: string; genericIds: number[] }
    }
  >
}

type MihoyoEditorNames = {
  nodes: Array<{
    genericId: number
    nameEn?: string
    pins: Array<{
      kind: MetaRecord['editorPins'][number]['kind']
      index: number
      nameZh?: string
      nameEn?: string
    }>
  }>
}

const SUB_TYPES: readonly ClientGraphSubType[] = [
  'character_skill',
  'character_control_skill',
  'creation_skill',
  'creation_status',
  'creation_status_decision',
  'bool_filter',
  'int_filter'
]

const CLIENT_ZH_COMPAT_ALIASES_BY_SUB_TYPE: Partial<
  Record<ClientGraphSubType, Readonly<Record<string, string>>>
> = {
  character_skill: {
    恢复生命值: 'recoverCharacterSHp'
  },
  creation_skill: {
    获取复杂造物当前释放的技能: 'getTheComplexCreationSCurrentUsingSkill'
  },
  creation_status: {
    查询字典中值组成的列表: 'getListOfValuesFromDictionary',
    查询字典中键组成的列表: 'getListOfKeysFromDictionary'
  },
  creation_status_decision: {
    查询字典中值组成的列表: 'getListOfValuesFromDictionary',
    查询字典中键组成的列表: 'getListOfKeysFromDictionary'
  }
}

const CLIENT_CLASS_NAME_BY_SUB_TYPE: Record<ClientGraphSubType, string> = {
  character_skill: 'ClientCharacterSkillExecutionFlowFunctions',
  character_control_skill: 'ClientCharacterControlSkillExecutionFlowFunctions',
  creation_skill: 'ClientCreationSkillExecutionFlowFunctions',
  creation_status: 'ClientCreationStatusExecutionFlowFunctions',
  creation_status_decision: 'ClientCreationStatusDecisionExecutionFlowFunctions',
  bool_filter: 'ClientBoolFilterExecutionFlowFunctions',
  int_filter: 'ClientIntFilterExecutionFlowFunctions'
}

type ClientEntityHelperBinding = {
  kind: 'method' | 'getter'
  methodName: string
  insertIndex: number | null
}

type ClientEntityHelperBindings = Record<
  ClientGraphSubType,
  Record<ClientGraphMode, Record<string, ClientEntityHelperBinding>>
>

const CLIENT_ENTITY_METHOD_ALIAS_SOURCE_OVERRIDES: Readonly<Record<string, string>> = {
  unitTags: 'getEntitySUnitTagList',
  // Same short name as the server helper (queryIfEntityHasUnitStatus).
  hasUnitStatus: 'whetherTheEntityHasTheSpecifiedUnitStatus'
}

const CLIENT_HAND_ENTITY_METHOD_INSERT_INDEX: Readonly<Record<string, number>> = {
  // getCustomVariable is emitted from a hand-written node template, so it is absent from flowMetadata.
  getCustomVariable: 0
}

const CLIENT_ENTITY_GETTER_SOURCE_OVERRIDES: Readonly<
  Record<string, { methodName: string; insertIndex?: number | null }>
> = {
  pos: { methodName: 'getEntityLocation' },
  rotation: { methodName: 'getEntityRotation' },
  forward: { methodName: 'getControlMotorForwardDirection' },
  type: { methodName: 'getEntitySType' },
  characters: { methodName: 'getPlayerSCharacterList' },
  character: { methodName: 'getCharacterEntityOfSpecifiedPlayer' },
  inputDevice: { methodName: 'getPlayerClientInputDeviceType', insertIndex: null }
}

const GRAPH_ENCODING_BY_SUB_TYPE: Record<
  ClientGraphSubType,
  { graphType: number; graphWhich: number }
> = {
  bool_filter: { graphType: 20001, graphWhich: 10 },
  int_filter: { graphType: 20006, graphWhich: 47 },
  character_skill: { graphType: 20002, graphWhich: 11 },
  character_control_skill: { graphType: 20010, graphWhich: 64 },
  creation_skill: { graphType: 20008, graphWhich: 52 },
  creation_status_decision: { graphType: 20007, graphWhich: 51 },
  creation_status: { graphType: 20009, graphWhich: 53 }
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function write(file: string, body: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, body.endsWith('\n') ? body : `${body}\n`, 'utf8')
}

function assertCompleteCapability(capability: Partial<ClientGraphCapability>) {
  const missing = SUB_TYPES.filter((subType) => !capability[subType])
  if (missing.length) {
    throw new Error(`client graph capability missing sub types: ${missing.join(', ')}`)
  }
}

function getClientNodeModes(
  modeData: ClientNodeModeData,
  subType: ClientGraphSubType,
  genericId: number
): ClientGraphMode[] {
  const graph = modeData.graphs[subType]
  const modes = (['beyond', 'classic'] as const).filter((mode) => {
    const capability = graph[mode]
    return (
      capability.status === 'available' &&
      (genericId === graph.entryGenericId || capability.genericIds.includes(genericId))
    )
  })
  if (!modes.length) {
    throw new Error(`${subType}:${genericId} is absent from all extracted client node pools`)
  }
  return modes
}

function generatedHeader() {
  return '// This file is generated by scripts/client-nodegraph/generate-client-nodegraph-modules.ts.\n'
}

function jsonConst(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function emitClientGraphEncoding() {
  write(
    'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_graph_encoding.ts',
    `${generatedHeader()}import type { ClientGraphSubType } from './client_node_metadata.js'

export type ClientGraphEncoding = {
  graphType: number
  graphWhich: number
}

export const CLIENT_GRAPH_ENCODING_BY_SUB_TYPE: Record<
  ClientGraphSubType,
  ClientGraphEncoding
> = ${jsonConst(GRAPH_ENCODING_BY_SUB_TYPE)}

export function getClientGraphEncoding(subType: ClientGraphSubType): ClientGraphEncoding {
  return CLIENT_GRAPH_ENCODING_BY_SUB_TYPE[subType]
}
`
  )
}

function emitClientVariableSpecialization(seed: ClientVariableSpecializationSeed) {
  const seedTypeToIr: Record<string, string> = {
    configId: 'config_id',
    prefabId: 'prefab_id',
    configId_list: 'config_id_list',
    prefabId_list: 'prefab_id_list'
  }
  const typeOffsetByIrType: Record<string, number> = {}
  for (const entry of seed.typeOffsets) {
    const irType = seedTypeToIr[entry.type] ?? entry.type
    if (Object.hasOwn(typeOffsetByIrType, irType)) {
      throw new Error(`duplicate client custom-variable type offset: ${irType}`)
    }
    typeOffsetByIrType[irType] = entry.offset
  }

  const familyBySubType: Partial<Record<ClientGraphSubType, { cidBase: number; dictCid: number }>> =
    {}
  const families = [
    seed.getCustomVariable.characterSkillFamilies,
    seed.getCustomVariable.creationStatusFamilies
  ]
  for (const family of families) {
    for (const subType of family.appliesTo) {
      if (!SUB_TYPES.includes(subType)) {
        throw new Error(`unknown client custom-variable graph sub type: ${subType}`)
      }
      if (familyBySubType[subType]) {
        throw new Error(`duplicate client custom-variable family: ${subType}`)
      }
      familyBySubType[subType] = { cidBase: family.cidBase, dictCid: family.dictCid }
    }
  }

  write(
    'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_variable_specialization.ts',
    `${generatedHeader()}// Runtime-only subset derived from resources/client_variable_specialization_seed.json.
import type { ClientGraphSubType } from './client_node_metadata.js'

export type ClientCustomVariableFamily = Readonly<{
  cidBase: number
  dictCid: number
}>

export const CLIENT_CUSTOM_VARIABLE_TYPE_OFFSET_BY_IR_TYPE: Readonly<Record<string, number>> = ${jsonConst(typeOffsetByIrType)}

export const CLIENT_CUSTOM_VARIABLE_FAMILY_BY_SUB_TYPE: Readonly<
  Partial<Record<ClientGraphSubType, ClientCustomVariableFamily>>
> = ${jsonConst(familyBySubType)}
`
  )
}

function emitClientGraphModes(capability: ClientGraphCapability, modeData: ClientNodeModeData) {
  const availableModes = Object.fromEntries(
    SUB_TYPES.map((subType) => [
      subType,
      (['beyond', 'classic'] as const).filter(
        (mode) => modeData.graphs[subType][mode].status === 'available'
      )
    ])
  )
  write(
    'src/definitions/client_graph_modes.ts',
    `${generatedHeader()}import type { ClientGraphSubType } from '../thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.js'

export const CLIENT_GRAPH_SUB_TYPES = ${jsonConst(SUB_TYPES)} as const

export const CLIENT_GRAPH_AVAILABLE_MODES_BY_SUB_TYPE = ${jsonConst(availableModes)} as const

export type ClientGraphAvailableMode<T extends ClientGraphSubType> =
  (typeof CLIENT_GRAPH_AVAILABLE_MODES_BY_SUB_TYPE)[T][number]

export function isClientGraphModeAvailable(
  subType: ClientGraphSubType,
  mode: 'beyond' | 'classic'
): boolean {
  return (CLIENT_GRAPH_AVAILABLE_MODES_BY_SUB_TYPE[subType] as readonly string[]).includes(mode)
}

export const CLIENT_GRAPH_METHOD_BY_SUB_TYPE: Record<ClientGraphSubType, string> = {
  character_skill: 'characterSkill',
  character_control_skill: 'characterControlSkill',
  creation_skill: 'creationSkill',
  creation_status: 'creationStatus',
  creation_status_decision: 'creationStatusDecision',
  bool_filter: 'boolFilter',
  int_filter: 'intFilter'
}

export const CLIENT_GRAPH_SUB_TYPE_BY_METHOD = Object.fromEntries(
  Object.entries(CLIENT_GRAPH_METHOD_BY_SUB_TYPE).map(([subType, method]) => [method, subType])
) as Record<string, ClientGraphSubType>

export const CLIENT_GSTS_FUNCTION_PREFIXES_BY_SUB_TYPE = {
  character_skill: ['gstsClientCharacterSkill', 'gstsCharacterSkill'],
  character_control_skill: ['gstsClientCharacterControlSkill', 'gstsCharacterControlSkill'],
  creation_skill: ['gstsClientCreationSkill', 'gstsCreationSkill'],
  creation_status: ['gstsClientCreationStatus', 'gstsCreationStatus'],
  creation_status_decision: [
    'gstsClientCreationStatusDecision',
    'gstsCreationStatusDecision'
  ],
  bool_filter: ['gstsClientBoolFilter', 'gstsBoolFilter'],
  int_filter: ['gstsClientIntFilter', 'gstsIntFilter']
} as const satisfies Record<ClientGraphSubType, readonly [string, string]>

export const CLIENT_GSTS_FUNCTION_PREFIX_ENTRIES = Object.entries(
  CLIENT_GSTS_FUNCTION_PREFIXES_BY_SUB_TYPE
)
  .flatMap(([subType, prefixes]) =>
    prefixes.map((prefix) => ({ prefix, subType: subType as ClientGraphSubType }))
  )
  .sort((a, b) => b.prefix.length - a.prefix.length)

export const CLIENT_GSTS_FUNCTION_PREFIXES = CLIENT_GSTS_FUNCTION_PREFIX_ENTRIES.map(
  (entry) => entry.prefix
)

export function getClientGraphSubTypeForGstsFunctionName(
  name: string | undefined
): ClientGraphSubType | undefined {
  if (!name) return undefined
  return CLIENT_GSTS_FUNCTION_PREFIX_ENTRIES.find((entry) => name.startsWith(entry.prefix))
    ?.subType
}

export const CLIENT_F_GLOBAL_NAME_BY_SUB_TYPE = {
  character_skill: 'fCharacterSkill',
  character_control_skill: 'fCharacterControlSkill',
  creation_skill: 'fCreationSkill',
  creation_status: 'fCreationStatus',
  creation_status_decision: 'fCreationStatusDecision',
  bool_filter: 'fBoolFilter',
  int_filter: 'fIntFilter'
} as const satisfies Record<ClientGraphSubType, string>

export const CLIENT_GRAPH_SUB_TYPE_BY_F_GLOBAL_NAME = Object.fromEntries(
  Object.entries(CLIENT_F_GLOBAL_NAME_BY_SUB_TYPE).map(([subType, name]) => [name, subType])
) as Record<string, ClientGraphSubType>

export const CLIENT_GRAPH_CAPABILITY_BY_SUB_TYPE = ${jsonConst(capability)} as const

export const CLIENT_GRAPH_ENTRY_SPEC_BY_SUB_TYPE = {
  character_skill: {
    event: 'start',
    startNodeType: 'node_graph_begins',
    handler: { params: [], shape: 'start', returnType: 'void' }
  },
  character_control_skill: {
    event: 'start',
    startNodeType: 'node_graph_begins',
    handler: { params: [], shape: 'start', returnType: 'void' }
  },
  creation_skill: {
    event: 'start',
    startNodeType: 'node_graph_begins',
    handler: { params: [], shape: 'start', returnType: 'void' }
  },
  creation_status: {
    event: 'start',
    startNodeType: 'node_graph_begins',
    handler: { params: [], shape: 'start', returnType: 'void' }
  },
  creation_status_decision: {
    event: 'start',
    startNodeType: 'node_graph_begins',
    handler: { params: [], shape: 'start', returnType: 'void' }
  },
  bool_filter: {
    event: 'start',
    startNodeType: 'node_graph_begins',
    handler: { params: [], shape: 'filter', returnType: 'bool' }
  },
  int_filter: {
    event: 'start',
    startNodeType: 'node_graph_begins',
    handler: { params: [], shape: 'filter', returnType: 'int' }
  }
} as const
`
  )
}

// ---------------------------------------------------------------------------
// Scoped helper globals capability (evidence: resources/client_node_metadata.json)
// ---------------------------------------------------------------------------

type MetadataRecord = {
  subType: ClientGraphSubType
  nodeType: string
  methodName: string
  genericId: number
  sampleFile: string
}

type HelperMemberSpec = {
  helper: string
  member?: string
  /** public client method names that must exist as evidence */
  requiredMethods?: string[]
  /** if set, member is needs_developer_confirmation and never implemented */
  confirm?: string
  /** if set, member is a decided gap (developer decision, blocked like timer) */
  blocked?: string
  note?: string
}

type ClientScopedGlobalCapability = {
  helper: string
  member?: string
  subTypes: ClientGraphSubType[]
  modes: ClientGraphMode[]
  availability: Array<{ subType: ClientGraphSubType; modes: ClientGraphMode[] }>
  backedBy: Array<{
    subType: ClientGraphSubType
    nodeType: string
    methodName: string
    sampleFile: string
  }>
  status: 'supported' | 'partial' | 'needs_developer_confirmation' | 'gap'
  note?: string
}

const HELPER_MEMBER_SPECS: HelperMemberSpec[] = [
  {
    helper: 'send',
    requiredMethods: ['sendSignalToServerNodeGraph'],
    note: 'maps to 向服务器节点图发送信号 (skill families only); signal node id is patched from the level signal definition at injection time'
  },
  {
    helper: 'player',
    blocked:
      'client graphs have no node to look up a player entity by id; use self / getSelfEntity instead'
  },
  {
    helper: 'print',
    blocked: 'client graphs have no node that prints a string to the server log'
  },
  { helper: 'self', requiredMethods: ['getSelfEntity'] },
  {
    helper: 'stage',
    requiredMethods: ['getStageEntity'],
    note: 'maps to getStageEntity in creation_status families only'
  },
  {
    helper: 'level',
    requiredMethods: ['getStageEntity'],
    note: 'same mapping as stage'
  },
  { helper: 'Mathf', member: 'Abs', requiredMethods: ['absoluteValueOperation'] },
  {
    helper: 'Mathf',
    member: 'FloorToInt',
    requiredMethods: [
      'dataTypeConversion',
      'getLocalVariable',
      'setLocalVariable',
      'lessThan',
      'subtraction',
      'doubleBranch'
    ],
    note: 'composed from truncating conversion plus a negative-fraction correction branch'
  },
  {
    helper: 'Mathf',
    member: 'CeilToInt',
    requiredMethods: [
      'dataTypeConversion',
      'getLocalVariable',
      'setLocalVariable',
      'greaterThan',
      'addition',
      'doubleBranch'
    ],
    note: 'composed from truncating conversion plus a positive-fraction correction branch'
  },
  { helper: 'Mathf', member: 'RoundToInt', requiredMethods: ['roundToIntegerOperation'] },
  { helper: 'Mathf', member: 'Sqrt', requiredMethods: ['arithmeticSquareRootOperation'] },
  { helper: 'Mathf', member: 'Pow', requiredMethods: ['exponentiation'] },
  { helper: 'Mathf', member: 'Log', requiredMethods: ['logarithmOperation'] },
  { helper: 'Mathf', member: 'Sin', requiredMethods: ['sineFunction'] },
  { helper: 'Mathf', member: 'Cos', requiredMethods: ['cosineFunction'] },
  { helper: 'Mathf', member: 'Tan', requiredMethods: ['tangentFunction'] },
  {
    helper: 'Random',
    member: 'Range',
    requiredMethods: ['getRandomNumber']
  },
  {
    helper: 'Random',
    member: 'value',
    requiredMethods: ['getRandomNumber']
  },
  ...['zero', 'one', 'up', 'down', 'left', 'right', 'forward', 'back'].map((member) => ({
    helper: 'Vector3',
    member,
    requiredMethods: ['create3dVector'],
    note: 'constant vector built via client create3d_vector node'
  })),
  { helper: 'Vector3', member: 'Dot', requiredMethods: ['_3dVectorDotProduct'] },
  { helper: 'Vector3', member: 'Cross', requiredMethods: ['_3dVectorCrossProduct'] },
  {
    helper: 'Vector3',
    member: 'Distance',
    requiredMethods: ['_3dVectorSubtraction', '_3dVectorModuloOperation'],
    note: 'composed from vector subtraction and magnitude nodes'
  },
  { helper: 'Vector3', member: 'Angle', requiredMethods: ['_3dVectorAngle'] },
  { helper: 'Vector3', member: 'Normalize', requiredMethods: ['_3dVectorNormalization'] },
  { helper: 'Vector3', member: 'Magnitude', requiredMethods: ['_3dVectorModuloOperation'] },
  { helper: 'Vector3', member: 'Add', requiredMethods: ['_3dVectorAddition'] },
  { helper: 'Vector3', member: 'Sub', requiredMethods: ['_3dVectorSubtraction'] },
  { helper: 'Vector3', member: 'Scale', requiredMethods: ['_3dVectorZoom'] },
  { helper: 'Vector3', member: 'Rotation', requiredMethods: ['_3dVectorRotation'] },
  {
    helper: 'Vector3',
    member: 'Lerp',
    requiredMethods: ['_3dVectorSubtraction', '_3dVectorZoom', '_3dVectorAddition']
  },
  {
    helper: 'Vector3',
    member: 'ClampMagnitude',
    requiredMethods: [
      '_3dVectorModuloOperation',
      '_3dVectorNormalization',
      '_3dVectorZoom',
      'assemblyList',
      'getMinimumValueFromList'
    ],
    note: 'composed as Normalize(v) * min(Magnitude(v), max)'
  },
  { helper: 'GameObject', member: 'Find', requiredMethods: ['queryEntityByGuid'] },
  {
    helper: 'GameObject',
    member: 'FindWithTag',
    requiredMethods: ['getEntityListByUnitTag', 'getCorrespondingValueFromList']
  },
  {
    helper: 'GameObject',
    member: 'FindGameObjectsWithTag',
    requiredMethods: ['getEntityListByUnitTag']
  },
  {
    helper: 'GameObject',
    member: 'FindByPrefabId',
    requiredMethods: ['getEntitiesWithSpecifiedPrefabOnTheField']
  },
  ...['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'].map((helper) => ({
    helper,
    confirm:
      'no client timer feature proven by resource JSON; server timer globals must not leak into client handlers'
  }))
]

function applyOfficialClientNames(
  metadata: Array<Omit<MetaRecord, 'methodName' | 'editorNameEn' | 'editorPins'>>,
  names: MihoyoEditorNames
): MetaRecord[] {
  const officialByGenericId = new Map(names.nodes.map((node) => [node.genericId, node]))
  return metadata.map((record) => {
    const official = officialByGenericId.get(record.genericId)
    if (!official?.nameEn) {
      throw new Error(`${record.subType}:${record.genericId} has no official English editor name`)
    }
    return {
      ...record,
      methodName: snakeToCamel(record.nodeType),
      editorNameEn: official.nameEn,
      editorPins: official.pins.map(({ kind, index, nameZh, nameEn }) => ({
        kind,
        index,
        ...(nameZh ? { nameZh } : {}),
        ...(nameEn ? { nameEn } : {})
      }))
    }
  })
}

function clientZhAlias(displayName: string): string {
  let alias = displayName.normalize('NFKC').replace(/[^$_\p{ID_Continue}]/gu, '')
  if (!alias) throw new Error(`client node has no usable Chinese alias: ${displayName}`)
  if (!/^[$_\p{ID_Start}]/u.test(alias)) alias = `_${alias}`
  return alias
}

function emitClientZhAliases(methodsBySubType: Record<string, string[]>, metadata: MetaRecord[]) {
  const recordBySubTypeAndMethodName = new Map(
    metadata.map((record) => [`${record.subType}:${record.methodName}`, record])
  )
  const aliasesBySubType = Object.fromEntries(
    SUB_TYPES.map((subType) => {
      const aliases = new Map<string, string>()
      for (const method of methodsBySubType[subType] ?? []) {
        const record = recordBySubTypeAndMethodName.get(`${subType}:${method}`)
        if (!record) throw new Error(`${subType}.${method}: missing node metadata for zh alias`)
        const alias = clientZhAlias(record.displayName)
        const existing = aliases.get(alias)
        if (existing && existing !== method) {
          throw new Error(
            `${subType}: client zh alias ${alias} maps to both ${existing} and ${method}`
          )
        }
        aliases.set(alias, method)
      }
      for (const [legacyAlias, method] of Object.entries(
        CLIENT_ZH_COMPAT_ALIASES_BY_SUB_TYPE[subType] ?? {}
      )) {
        if (!(methodsBySubType[subType] ?? []).includes(method)) {
          throw new Error(
            `${subType}: legacy client zh alias ${legacyAlias} targets ${method}, which is unavailable`
          )
        }
        const alias = clientZhAlias(legacyAlias)
        const existing = aliases.get(alias)
        if (existing && existing !== method) {
          throw new Error(
            `${subType}: legacy client zh alias ${alias} maps to both ${existing} and ${method}`
          )
        }
        aliases.set(alias, method)
      }
      return [
        subType,
        Object.fromEntries([...aliases].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      ]
    })
  )

  write(
    'src/definitions/client_zh_aliases.ts',
    `${generatedHeader()}import type { ClientGraphSubType } from '../runtime/IR.js'

export const CLIENT_F_ZH_TO_EN_BY_SUB_TYPE = ${jsonConst(aliasesBySubType)} as const

export function getClientFMethodNameFromAlias(
  subType: ClientGraphSubType,
  method: string
): string {
  const aliases = CLIENT_F_ZH_TO_EN_BY_SUB_TYPE[subType] as Readonly<Record<string, string>>
  return aliases[method] ?? method
}
`
  )
}

function unwrapConstExpression(expr: ts.Expression): ts.Expression {
  let current = expr
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression
  }
  return current
}

function propertyNameText(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text
  }
  return undefined
}

function readEntityHelperMetadata() {
  const source = fs.readFileSync('src/definitions/entity_helpers.ts', 'utf8')
  const file = ts.createSourceFile('entity_helpers.ts', source, ts.ScriptTarget.Latest, true)
  const initializers = new Map<string, ts.Expression>()
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        initializers.set(declaration.name.text, unwrapConstExpression(declaration.initializer))
      }
    }
  }

  const readStringArray = (name: string) => {
    const initializer = initializers.get(name)
    if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
      throw new Error(`failed to read ${name} from entity_helpers.ts`)
    }
    return initializer.elements.map((element) => {
      if (!ts.isStringLiteral(element)) throw new Error(`${name} must contain string literals`)
      return element.text
    })
  }
  const readObject = (name: string) => {
    const initializer = initializers.get(name)
    if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
      throw new Error(`failed to read ${name} from entity_helpers.ts`)
    }
    return initializer
  }
  const readStringMap = (name: string) =>
    Object.fromEntries(
      readObject(name).properties.map((property) => {
        if (!ts.isPropertyAssignment(property) || !ts.isStringLiteral(property.initializer)) {
          throw new Error(`${name} must contain string property assignments`)
        }
        const key = propertyNameText(property.name)
        if (!key) throw new Error(`${name} contains an unsupported property name`)
        return [key, property.initializer.text]
      })
    )
  const readNumberMap = (name: string) =>
    Object.fromEntries(
      readObject(name).properties.map((property) => {
        if (!ts.isPropertyAssignment(property) || !ts.isNumericLiteral(property.initializer)) {
          throw new Error(`${name} must contain numeric property assignments`)
        }
        const key = propertyNameText(property.name)
        if (!key) throw new Error(`${name} contains an unsupported property name`)
        return [key, Number(property.initializer.text)]
      })
    )

  const methods = readStringArray('ENTITY_HELPER_METHODS')
  const overrides = readNumberMap('ENTITY_HELPER_OVERRIDE_INDEX')
  const methodAliases = readStringMap('ENTITY_HELPER_METHOD_ALIAS_SOURCES')
  const getterAliases = readStringMap('ENTITY_HELPER_ALIAS_SOURCES')
  return {
    existingNames: new Set([
      ...methods,
      ...Object.keys(overrides),
      ...Object.keys(methodAliases),
      ...Object.keys(getterAliases)
    ]),
    methodAliases,
    getterAliases
  }
}

function deriveClientEntityHelpers(
  flowMetadata: FlowMetadataEntry[],
  methodsBySubType: Record<string, string[]>,
  metadata: MetaRecord[],
  modeData: ClientNodeModeData
) {
  const entityMetadata = readEntityHelperMetadata()
  const bindings = Object.fromEntries(
    SUB_TYPES.map((subType) => [subType, { beyond: {}, classic: {} }])
  ) as ClientEntityHelperBindings
  const directMethodNames = new Set<string>()
  const recordBySubTypeAndMethodName = new Map(
    metadata.map((record) => [`${record.subType}:${record.methodName}`, record])
  )
  const methodSetBySubType = Object.fromEntries(
    SUB_TYPES.map((subType) => [subType, new Set(methodsBySubType[subType] ?? [])])
  ) as unknown as Record<ClientGraphSubType, ReadonlySet<string>>

  const setBinding = (
    subType: ClientGraphSubType,
    mode: ClientGraphMode,
    helperName: string,
    binding: ClientEntityHelperBinding
  ) => {
    const previous = bindings[subType][mode][helperName]
    if (previous && JSON.stringify(previous) !== JSON.stringify(binding)) {
      throw new Error(`${subType}.${mode}.${helperName}: conflicting client entity helper bindings`)
    }
    bindings[subType][mode][helperName] = binding
  }

  const modesForMethod = (subType: ClientGraphSubType, methodName: string) => {
    if (!methodSetBySubType[subType].has(methodName)) return []
    const record = recordBySubTypeAndMethodName.get(`${subType}:${methodName}`)
    if (!record) throw new Error(`${subType}.${methodName}: missing entity helper node metadata`)
    return getClientNodeModes(modeData, subType, record.genericId)
  }
  for (const subType of SUB_TYPES) {
    for (const [methodName, insertIndex] of Object.entries(
      CLIENT_HAND_ENTITY_METHOD_INSERT_INDEX
    )) {
      if (
        methodName === 'getCustomVariable' &&
        (subType === 'creation_status' || subType === 'creation_status_decision')
      ) {
        continue
      }
      for (const mode of modesForMethod(subType, methodName)) {
        directMethodNames.add(methodName)
        setBinding(subType, mode, methodName, {
          kind: 'method',
          methodName,
          insertIndex
        })
      }
    }
  }

  for (const entry of flowMetadata) {
    const insertIndex = entry.params.findIndex((param) => param.irType === 'entity')
    if (insertIndex < 0) continue
    directMethodNames.add(entry.methodName)
    for (const rawSubType of entry.subTypes) {
      const subType = rawSubType as ClientGraphSubType
      for (const mode of modesForMethod(subType, entry.methodName)) {
        setBinding(subType, mode, entry.methodName, {
          kind: 'method',
          methodName: entry.methodName,
          insertIndex
        })
      }
    }
  }

  for (const subType of SUB_TYPES) {
    for (const mode of ['beyond', 'classic'] as const) {
      const modeBindings = bindings[subType][mode]
      for (const [alias, originalSource] of Object.entries(entityMetadata.methodAliases)) {
        const source = CLIENT_ENTITY_METHOD_ALIAS_SOURCE_OVERRIDES[alias] ?? originalSource
        const sourceBinding = modeBindings[source]
        if (!sourceBinding || sourceBinding.kind !== 'method') continue
        setBinding(subType, mode, alias, { ...sourceBinding, kind: 'method' })
      }
      for (const [alias, originalSource] of Object.entries(entityMetadata.getterAliases)) {
        const override = CLIENT_ENTITY_GETTER_SOURCE_OVERRIDES[alias]
        const source = override?.methodName ?? originalSource
        const sourceBinding = modeBindings[source]
        if (sourceBinding?.kind === 'method') {
          setBinding(subType, mode, alias, { ...sourceBinding, kind: 'getter' })
          continue
        }
        if (override?.insertIndex !== null) continue
        if (!modesForMethod(subType, source).includes(mode)) continue
        setBinding(subType, mode, alias, {
          kind: 'getter',
          methodName: source,
          insertIndex: null
        })
      }
    }
  }

  const sortedBindings = Object.fromEntries(
    SUB_TYPES.map((subType) => [
      subType,
      Object.fromEntries(
        (['beyond', 'classic'] as const).map((mode) => [
          mode,
          Object.fromEntries(
            Object.entries(bindings[subType][mode]).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
          )
        ])
      )
    ])
  ) as ClientEntityHelperBindings

  const knownNames = new Set([...entityMetadata.existingNames, ...directMethodNames])
  for (const modes of Object.values(sortedBindings)) {
    for (const modeBindings of Object.values(modes)) {
      const missing = Object.keys(modeBindings).filter((name) => !knownNames.has(name))
      if (missing.length)
        throw new Error(`unknown client entity helper types: ${missing.join(', ')}`)
    }
  }

  return {
    bindings: sortedBindings,
    directMethodNames: [...directMethodNames].sort(),
    existingNames: entityMetadata.existingNames
  }
}

function readMemberJsDoc(source: ts.SourceFile, members: readonly ts.MethodDeclaration[]) {
  for (const member of members) {
    const jsDoc = ts
      .getJSDocCommentsAndTags(member)
      .find((node) => node.kind === ts.SyntaxKind.JSDocComment)
    if (jsDoc) return source.text.slice(jsDoc.pos, jsDoc.end)
  }
  return undefined
}

function omitJsDocParameter(jsDoc: string, parameterName: string | undefined) {
  if (!parameterName) return jsDoc

  const lines = jsDoc.split('\n')
  const escapedName = parameterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const target = new RegExp(`^\\s*\\*\\s*@param\\s+${escapedName}(?:\\s|$)`)
  const nextTag = /^\s*\*\s*@\w+\b/
  const kept: string[] = []
  let omitting = false

  for (const line of lines) {
    if (!omitting && target.test(line)) {
      omitting = true
      continue
    }
    if (omitting) {
      if (!nextTag.test(line) && !/^\s*\*\/$/.test(line)) continue
      omitting = false
    }
    kept.push(line)
  }

  return kept.join('\n').replace(/(\n\s*\*){3,}/g, '\n *\n *')
}

function appendClientEntityHelperTypes(
  classFileBody: string,
  bindings: ClientEntityHelperBindings
) {
  const source = ts.createSourceFile(
    'client_nodes.ts',
    classFileBody,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  const subTypeByClassName = new Map(
    Object.entries(CLIENT_CLASS_NAME_BY_SUB_TYPE).map(([subType, className]) => [
      className,
      subType as ClientGraphSubType
    ])
  )
  const methodSignaturesByName = new Map<string, Set<string>>()
  const getterTypesByName = new Map<string, Set<string>>()
  const jsDocByName = new Map<string, string>()
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  const normalizeTypeText = (text: string) =>
    text
      .replace(/(?:ClientEntityFor|clientEntity)<['"][^'"]+['"], Mode>/g, 'clientEntity<T, Mode>')
      .trim()

  for (const statement of source.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) continue
    const subType = subTypeByClassName.get(statement.name.text)
    if (!subType) continue
    const membersByName = new Map<string, ts.MethodDeclaration[]>()
    for (const member of statement.members) {
      if (!ts.isMethodDeclaration(member) || !ts.isIdentifier(member.name)) continue
      const members = membersByName.get(member.name.text) ?? []
      members.push(member)
      membersByName.set(member.name.text, members)
    }
    for (const mode of ['beyond', 'classic'] as const) {
      for (const [helperName, binding] of Object.entries(bindings[subType][mode])) {
        const members = membersByName.get(binding.methodName)
        if (!members) {
          throw new Error(
            `${subType}.${mode}.${helperName}: missing source method ${binding.methodName}`
          )
        }
        const overloads = members.filter((member) => !member.body)
        const selected = overloads.length ? overloads : members
        const sourceMember = members.find((member) => member.body) ?? selected[0]
        const entityParameter =
          binding.insertIndex === null ? undefined : sourceMember.parameters[binding.insertIndex]
        if (entityParameter && !ts.isIdentifier(entityParameter.name)) {
          throw new Error(
            `${subType}.${binding.methodName}: entity helper parameter must be an identifier`
          )
        }
        const sourceJsDoc = readMemberJsDoc(source, members)
        if (!sourceJsDoc) {
          throw new Error(`${subType}.${binding.methodName}: missing entity helper JSDoc`)
        }
        const helperJsDoc = omitJsDocParameter(
          sourceJsDoc,
          entityParameter && ts.isIdentifier(entityParameter.name)
            ? entityParameter.name.text
            : undefined
        )
        const existingJsDoc = jsDocByName.get(helperName)
        if (!existingJsDoc || helperJsDoc.length > existingJsDoc.length) {
          jsDocByName.set(helperName, helperJsDoc)
        }
        for (const member of selected) {
          if (!member.type) {
            throw new Error(`${subType}.${binding.methodName}: missing return type`)
          }
          if (binding.insertIndex !== null && binding.insertIndex >= member.parameters.length) {
            throw new Error(
              `${subType}.${mode}.${helperName}: entity parameter index ${binding.insertIndex} is out of range`
            )
          }
          const parameters = member.parameters.filter((_, index) => index !== binding.insertIndex)
          if (binding.kind === 'getter') {
            if (parameters.length) {
              throw new Error(
                `${subType}.${mode}.${helperName}: getter source ${binding.methodName} still requires parameters`
              )
            }
            const typeText = normalizeTypeText(
              printer.printNode(ts.EmitHint.Unspecified, member.type, source)
            )
            const types = getterTypesByName.get(helperName) ?? new Set<string>()
            types.add(typeText)
            getterTypesByName.set(helperName, types)
            continue
          }

          const signature = ts.factory.createMethodSignature(
            undefined,
            ts.factory.createIdentifier(helperName),
            member.questionToken,
            member.typeParameters,
            parameters,
            member.type
          )
          const text = normalizeTypeText(
            printer.printNode(ts.EmitHint.Unspecified, signature, source)
          )
          const values = methodSignaturesByName.get(helperName) ?? new Set<string>()
          values.add(text)
          methodSignaturesByName.set(helperName, values)
        }
      }
    }
  }

  const helperNames = new Set(
    Object.values(bindings).flatMap((modes) =>
      Object.values(modes).flatMap((modeBindings) => Object.keys(modeBindings))
    )
  )
  const conflicting = [...helperNames].filter(
    (name) => methodSignaturesByName.has(name) && getterTypesByName.has(name)
  )
  if (conflicting.length) {
    throw new Error(`client entity helpers conflict as methods/getters: ${conflicting.join(', ')}`)
  }
  const missing = [...helperNames].filter(
    (name) => !methodSignaturesByName.has(name) && !getterTypesByName.has(name)
  )
  if (missing.length) {
    throw new Error(`missing generated client entity helper signatures: ${missing.join(', ')}`)
  }
  const signatures = [...helperNames]
    .sort()
    .map((name) => {
      const jsDoc = jsDocByName.get(name)
      if (!jsDoc) throw new Error(`missing generated client entity helper JSDoc: ${name}`)
      const comment = jsDoc
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n')
      const methodSignatures = methodSignaturesByName.get(name)
      if (methodSignatures) {
        const declarations = [...methodSignatures]
          .sort()
          .map((signature) =>
            signature
              .split('\n')
              .map((line) => `  ${line}`)
              .join('\n')
          )
          .join('\n')
        return `${comment}\n${declarations}`
      }
      const getterTypes = [...(getterTypesByName.get(name) ?? [])].sort()
      return `${comment}\n  readonly ${name}: ${getterTypes.join(' | ')}`
    })
    .join('\n\n')

  return `${classFileBody.trimEnd()}

export interface ClientEntityHelperMethods<
  T extends ClientGraphSubType,
  Mode extends ClientGraphMode
> {
${signatures}
}
`
}

function emitClientEntityHelpers(
  classFileBody: string,
  flowMetadata: FlowMetadataEntry[],
  methodsBySubType: Record<string, string[]>,
  metadata: MetaRecord[],
  modeData: ClientNodeModeData
) {
  const { bindings, directMethodNames } = deriveClientEntityHelpers(
    flowMetadata,
    methodsBySubType,
    metadata,
    modeData
  )
  write(
    'src/definitions/client_entity_helpers.ts',
    `${generatedHeader()}import type { ClientGraphMode, ClientGraphSubType } from '../runtime/IR.js'
import type { RuntimeReturnValueTypeMap } from '../runtime/value.js'
import type { EntityBase, EntityHelperAll } from './entity_helpers.js'
import type { ClientEntityHelperMethods } from './client_nodes.js'

export type ClientEntityHelperBinding = {
  kind: 'method' | 'getter'
  methodName: string
  insertIndex: number | null
}

export const CLIENT_ENTITY_HELPER_BINDINGS_BY_SUB_TYPE_AND_MODE = ${jsonConst(bindings)} as const

export const CLIENT_ENTITY_HELPER_METHOD_NAMES = ${jsonConst(directMethodNames)} as const

type ClientEntityHelperSurface<
  T extends ClientGraphSubType,
  Mode extends ClientGraphMode
> = Omit<EntityHelperAll, keyof ClientEntityHelperMethods<T, Mode>> &
  ClientEntityHelperMethods<T, Mode>

type ClientEntityHelperName<
  T extends ClientGraphSubType,
  Mode extends ClientGraphMode
> = T extends ClientGraphSubType
  ? Mode extends ClientGraphMode
    ? keyof (typeof CLIENT_ENTITY_HELPER_BINDINGS_BY_SUB_TYPE_AND_MODE)[T][Mode]
    : never
  : never

export type clientEntity<
  T extends ClientGraphSubType = ClientGraphSubType,
  Mode extends ClientGraphMode = ClientGraphMode
> = EntityBase &
  Pick<
    ClientEntityHelperSurface<T, Mode>,
    Extract<ClientEntityHelperName<T, Mode>, keyof ClientEntityHelperSurface<T, Mode>>
  >

export type ClientEntity<
  T extends ClientGraphSubType = ClientGraphSubType,
  Mode extends ClientGraphMode = ClientGraphMode
> = clientEntity<T, Mode>

/** @deprecated Use clientEntity<T, Mode>. */
export type ClientEntityFor<
  T extends ClientGraphSubType,
  Mode extends ClientGraphMode
> = clientEntity<T, Mode>

export type ClientRuntimeReturnValueTypeMap<
  T extends ClientGraphSubType,
  Mode extends ClientGraphMode
> = Omit<RuntimeReturnValueTypeMap, 'entity' | 'entity_list'> & {
  entity: clientEntity<T, Mode>
  entity_list: clientEntity<T, Mode>[]
}
`
  )
  return appendClientEntityHelperTypes(classFileBody, bindings)
}

function deriveScopedGlobalsCapability(
  metadata: MetadataRecord[],
  modeData: ClientNodeModeData
): ClientScopedGlobalCapability[] {
  const bySubType = new Map<ClientGraphSubType, Map<string, MetadataRecord>>()
  for (const record of metadata) {
    const map = bySubType.get(record.subType) ?? new Map<string, MetadataRecord>()
    bySubType.set(record.subType, map)
    if (!map.has(record.methodName)) map.set(record.methodName, record)
  }

  return HELPER_MEMBER_SPECS.map((spec) => {
    if (spec.confirm || spec.blocked) {
      return {
        helper: spec.helper,
        ...(spec.member ? { member: spec.member } : {}),
        subTypes: [],
        modes: [],
        availability: [],
        backedBy: [],
        status: spec.confirm ? ('needs_developer_confirmation' as const) : ('gap' as const),
        note: (spec.confirm ?? spec.blocked)!
      }
    }
    const required = spec.requiredMethods ?? []
    const subTypes: ClientGraphSubType[] = []
    const availability: ClientScopedGlobalCapability['availability'] = []
    const backedBy: ClientScopedGlobalCapability['backedBy'] = []
    for (const subType of SUB_TYPES) {
      const methods = bySubType.get(subType)
      if (!methods) continue
      const records = required.map((method) => methods.get(method))
      if (records.some((r) => !r)) continue
      const modes = (['beyond', 'classic'] as const).filter((mode) =>
        records.every((record) =>
          getClientNodeModes(modeData, subType, record!.genericId).includes(mode)
        )
      )
      if (!modes.length) continue
      subTypes.push(subType)
      availability.push({ subType, modes: [...modes] })
      required.forEach((method, i) => {
        backedBy.push({
          subType,
          nodeType: records[i]!.nodeType,
          methodName: method,
          sampleFile: records[i]!.sampleFile
        })
      })
    }
    const status =
      subTypes.length === 0 ? 'gap' : subTypes.length === SUB_TYPES.length ? 'supported' : 'partial'
    return {
      helper: spec.helper,
      ...(spec.member ? { member: spec.member } : {}),
      subTypes,
      modes: [...new Set(availability.flatMap((entry) => entry.modes))],
      availability,
      backedBy,
      status,
      ...(spec.note ? { note: spec.note } : {})
    }
  })
}

function emitClientScopedGlobals(capability: ClientScopedGlobalCapability[]) {
  const membersBySubType: Record<string, Record<string, string[]>> = {}
  const membersBySubTypeAndMode: Record<
    string,
    Record<ClientGraphMode, Record<string, string[]>>
  > = {}
  for (const subType of SUB_TYPES) membersBySubType[subType] = {}
  for (const subType of SUB_TYPES) {
    membersBySubTypeAndMode[subType] = { beyond: {}, classic: {} }
  }
  for (const entry of capability) {
    if (entry.status !== 'supported' && entry.status !== 'partial') continue
    for (const subType of entry.subTypes) {
      const helpers = membersBySubType[subType]
      const members = (helpers[entry.helper] ??= [])
      if (entry.member) members.push(entry.member)
    }
    for (const availability of entry.availability) {
      for (const mode of availability.modes) {
        const helpers = membersBySubTypeAndMode[availability.subType][mode]
        const members = (helpers[entry.helper] ??= [])
        if (entry.member) members.push(entry.member)
      }
    }
  }

  write('resources/client_scoped_globals_capability.json', JSON.stringify(capability, null, 2))
  write(
    'src/definitions/client_scoped_globals.ts',
    `${generatedHeader()}import type { ClientGraphSubType } from '../thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.js'

export type ClientScopedGlobalStatus =
  | 'supported'
  | 'partial'
  | 'needs_developer_confirmation'
  | 'gap'

export type ClientScopedGlobalCapability = {
  helper: string
  member?: string
  subTypes: ClientGraphSubType[]
  modes: ('beyond' | 'classic')[]
  availability: Array<{
    subType: ClientGraphSubType
    modes: ('beyond' | 'classic')[]
  }>
  backedBy: Array<{
    subType: ClientGraphSubType
    nodeType: string
    methodName: string
    sampleFile: string
  }>
  status: ClientScopedGlobalStatus
  note?: string
}

export const CLIENT_SCOPED_GLOBALS_CAPABILITY: readonly ClientScopedGlobalCapability[] = ${jsonConst(capability)}

/**
 * helper -> supported member names per sub type (empty array marks a bare
 * helper like \`self\` that is itself supported).
 */
export const CLIENT_SCOPED_GLOBAL_MEMBERS_BY_SUB_TYPE: Record<
  ClientGraphSubType,
  Readonly<Record<string, readonly string[]>>
> = ${jsonConst(membersBySubType)}

export const CLIENT_SCOPED_GLOBAL_MEMBERS_BY_SUB_TYPE_AND_MODE: Record<
  ClientGraphSubType,
  Readonly<Record<'beyond' | 'classic', Readonly<Record<string, readonly string[]>>>>
> = ${jsonConst(membersBySubTypeAndMode)}

/** helper names that must never resolve to server implementations in client handlers */
export const CLIENT_BLOCKED_SERVER_HELPERS = [
  'print',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval'
] as const
`
  )
}

// ---------------------------------------------------------------------------
// Client method modes and execution flow metadata (Task 15)
// ---------------------------------------------------------------------------

type ServerMethodSignature = {
  methodName: string
  params: string[]
  returnType: string
  typeParams: string[]
  docs: string
}

function extractServerMethodSignatures(): Map<string, ServerMethodSignature> {
  const filePath = 'src/definitions/nodes.ts'
  const source = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  )
  const result = new Map<string, ServerMethodSignature>()

  const serverClass = source.statements.find(
    (stmt): stmt is ts.ClassDeclaration =>
      ts.isClassDeclaration(stmt) && stmt.name?.text === 'ServerExecutionFlowFunctions'
  )
  if (!serverClass) throw new Error('ServerExecutionFlowFunctions class not found in nodes.ts')

  for (const member of serverClass.members) {
    if (!ts.isMethodDeclaration(member) || !ts.isIdentifier(member.name)) continue
    const methodName = member.name.text
    if (methodName.startsWith('__')) continue
    const jsDocs = ts.getJSDocCommentsAndTags(member)
    const docs = jsDocs
      .map((doc) => doc.getText())
      .join('\n')
      .trim()
    const signature: ServerMethodSignature = {
      methodName,
      params: member.parameters.map((p) => p.getText().replace(/\s+/g, ' ')),
      returnType: member.type ? member.type.getText().replace(/\s+/g, ' ') : 'void',
      typeParams: (member.typeParameters ?? []).map((tp) => tp.getText().replace(/\s+/g, ' ')),
      docs
    }
    // keep the first overload/implementation only
    if (!result.has(methodName)) result.set(methodName, signature)
  }
  return result
}

function emitClientMethodModes(
  flowMetadata: FlowMetadataEntry[],
  methodsBySubType: Record<string, string[]>,
  literalArgumentIndexesBySubType: Record<string, Record<string, number[]>>,
  metadata: MetaRecord[],
  modeData: ClientNodeModeData
) {
  const recordBySubTypeAndNodeType = new Map(
    metadata.map((record) => [`${record.subType}:${record.nodeType}`, record])
  )
  const recordBySubTypeAndMethodName = new Map(
    metadata.map((record) => [`${record.subType}:${record.methodName}`, record])
  )

  const nodeTypesBySubTypeAndMode: Record<
    ClientGraphSubType,
    Record<ClientGraphMode, string[]>
  > = Object.fromEntries(
    SUB_TYPES.map((subType) => [subType, { beyond: [], classic: [] }])
  ) as unknown as Record<ClientGraphSubType, Record<ClientGraphMode, string[]>>
  for (const record of metadata) {
    const subType = record.subType as ClientGraphSubType
    for (const mode of getClientNodeModes(modeData, subType, record.genericId)) {
      nodeTypesBySubTypeAndMode[subType][mode].push(record.nodeType)
    }
  }
  for (const modes of Object.values(nodeTypesBySubTypeAndMode)) {
    modes.beyond = [...new Set(modes.beyond)].sort()
    modes.classic = [...new Set(modes.classic)].sort()
  }

  const methodsBySubTypeAndMode: Record<
    ClientGraphSubType,
    Record<ClientGraphMode, string[]>
  > = Object.fromEntries(
    SUB_TYPES.map((subType) => [subType, { beyond: [], classic: [] }])
  ) as unknown as Record<ClientGraphSubType, Record<ClientGraphMode, string[]>>
  for (const subType of SUB_TYPES) {
    for (const method of methodsBySubType[subType] ?? []) {
      const record = recordBySubTypeAndMethodName.get(`${subType}:${method}`)
      if (!record) throw new Error(`${subType}.${method}: missing node metadata`)
      for (const mode of getClientNodeModes(modeData, subType, record.genericId)) {
        methodsBySubTypeAndMode[subType][mode].push(method)
      }
    }
  }

  const enrichedFlowMetadata = flowMetadata.map((entry) => {
    const availability = entry.subTypes.map((subType) => {
      const record = recordBySubTypeAndNodeType.get(`${subType}:${entry.nodeType}`)
      if (!record) throw new Error(`${subType}.${entry.methodName}: missing node metadata`)
      return {
        subType,
        modes: getClientNodeModes(modeData, subType as ClientGraphSubType, record.genericId)
      }
    })
    return {
      ...entry,
      modes: [...new Set(availability.flatMap((item) => item.modes))],
      availability
    }
  })

  write(
    'resources/client_execution_flow_metadata.json',
    JSON.stringify(enrichedFlowMetadata, null, 2)
  )
  write(
    'src/definitions/client_method_modes.ts',
    `${generatedHeader()}import type { ClientGraphSubType } from '../thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.js'
import type { ClientGraphMode } from '../runtime/IR.js'

export const CLIENT_NODE_METHODS_BY_SUB_TYPE = ${jsonConst(methodsBySubType)} as const

export const CLIENT_LITERAL_ARGUMENT_INDEXES_BY_SUB_TYPE = ${jsonConst(literalArgumentIndexesBySubType)} as const

export const CLIENT_NODE_METHODS_BY_SUB_TYPE_AND_MODE = ${jsonConst(methodsBySubTypeAndMode)} as const

export const CLIENT_NODE_TYPES_BY_SUB_TYPE_AND_MODE = ${jsonConst(nodeTypesBySubTypeAndMode)} as const

const CLIENT_NODE_TYPE_SETS = Object.fromEntries(
  Object.entries(CLIENT_NODE_TYPES_BY_SUB_TYPE_AND_MODE).map(([subType, modes]) => [
    subType,
    Object.fromEntries(
      Object.entries(modes).map(([mode, nodeTypes]) => [mode, new Set<string>(nodeTypes)])
    )
  ])
) as unknown as Record<ClientGraphSubType, Record<ClientGraphMode, ReadonlySet<string>>>

export function isClientNodeTypeAvailable(
  subType: ClientGraphSubType,
  mode: ClientGraphMode,
  nodeType: string
): boolean {
  const lookupType = nodeType.startsWith('data_type_conversion_')
    ? 'data_type_conversion'
    : nodeType
  return CLIENT_NODE_TYPE_SETS[subType][mode].has(lookupType)
}

export type ClientNodeMethodBySubType = typeof CLIENT_NODE_METHODS_BY_SUB_TYPE
export type ClientNodeMethodBySubTypeAndMode =
  typeof CLIENT_NODE_METHODS_BY_SUB_TYPE_AND_MODE
export type ClientNodeMethodForMode<
  T extends keyof ClientNodeMethodBySubTypeAndMode,
  M extends keyof ClientNodeMethodBySubTypeAndMode[T]
> = ClientNodeMethodBySubTypeAndMode[T][M] extends readonly (
  infer Method extends string
)[]
  ? Method
  : never
`
  )
}

/**
 * Cross-check generated client signatures against same-named server methods.
 * Pure report: differences are expected (client pins differ), but every drift
 * should be explainable from metadata/doc evidence.
 */
function deriveServerSignatureDrift(
  flowMetadata: FlowMetadataEntry[],
  signatures: Map<string, ServerMethodSignature>
) {
  const drift: Array<{
    methodName: string
    nodeType: string
    server: { params: string[]; returnType: string }
    client: { params: string[]; returns: string[] | null }
    notes: string[]
  }> = []
  let shared = 0
  for (const entry of flowMetadata) {
    const server = signatures.get(entry.methodName)
    if (!server) continue
    shared += 1
    const clientParams = entry.params.map((p) => `${p.name}: ${p.irType}`)
    const clientReturns = entry.returns?.map((r) => `${r.name}: ${r.irType}`) ?? null
    const notes: string[] = []
    // callbacks (control flow) are part of the server param list; compare counts loosely
    const serverValueParams = server.params.filter((p) => !/=>/.test(p))
    if (serverValueParams.length !== entry.params.length) notes.push('param_count_mismatch')
    const serverVoid = server.returnType === 'void'
    if (serverVoid !== (clientReturns === null)) notes.push('return_shape_mismatch')
    if (!notes.length) continue
    drift.push({
      methodName: entry.methodName,
      nodeType: entry.nodeType,
      server: { params: server.params, returnType: server.returnType },
      client: { params: clientParams, returns: clientReturns },
      notes
    })
  }
  return { shared, drift }
}

// ---------------------------------------------------------------------------
// Client-only enum classes (task 四.1, seeds: resources/client_enum_seed.*.json)
// ---------------------------------------------------------------------------

function emitClientEnums(binding: ClientEnumBinding) {
  const classes = binding.clientOnlyClasses
    .map((cls) => {
      const interfaces = (cls.typeInterfaces ?? [])
        .map(
          (type) => `/** ${type.zhName} */
export interface ${type.name} extends ${cls.className} {
  readonly __brand${type.name}: '${type.name}'
}`
        )
        .join('\n\n')
      const members = cls.members
        .map(
          (m) => `  /**
   * ${m.name}
   *
   * ${m.zhName}
   */
  static readonly ${m.name} = new enumeration('${cls.className}', '${m.key}') as ${
    m.typeName ?? cls.className
  }`
        )
        .join('\n')
      return `${interfaces ? `${interfaces}\n\n` : ''}/** ${cls.zhName} */
export class ${cls.className} extends enumeration {
  declare private readonly __brand${cls.className}: '${cls.className}'
  private constructor() {
    super('')
    // 防止用户通过字符串传参构造枚举导致的意外行为
    throw new Error('you should not create an enum instance')
  }

${members}
}`
    })
    .join('\n\n')

  write(
    'src/definitions/client_enums.ts',
    `${generatedHeader()}// Client-only enum classes derived from resources/client_enum_seed.*.json
// (枚举匹配 dropdown census + node param samples). Server-shared classes live
// in ./enum.ts; encoder values for these classes come from client_enum_values.ts.
import { enumeration } from '../runtime/value.js'

export type ClientEnumerationTypeMap = {
${binding.clientOnlyClasses.map((c) => `  ${c.className}: ${c.className}`).join('\n')}
}

${classes}
`
  )
  write(
    'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_enum_values.ts',
    `${generatedHeader()}/** enumeration value string -> gia numeric value (client-only values/classes) */
export const CLIENT_ENUM_VALUES: Record<string, number> = ${jsonConst(binding.valueByKey)}

/**
 * 枚举匹配 census：generic id -> 类名（ir conn.enum 同款 snake）
 * -> 下拉行（ioc 升序）。
 * 双引脚 indexOfConcrete = 类所在下拉行号；同一运行时枚举类的分组行
 * （状态添加结果 14/15、数字运算 2/25）按字面量值定行，连线在没有
 * 字面量辅助时取首行。
 */
export const ENUM_MATCH_ROWS_BY_GENERIC_ID: Record<
  number,
  Record<string, Array<{ ioc: number; values: number[] }>>
> = ${jsonConst(binding.matchRowsByGenericId)}

/** 枚举匹配 generic id -> 当前节点族下拉中可选择的 IR 枚举类名 */
export const ENUM_MATCH_CLASS_KEYS_BY_GENERIC_ID: Record<number, readonly string[]> = ${jsonConst(
      Object.fromEntries(
        Object.entries(binding.enumMatchByGenericId).map(([genericId, value]) => [
          genericId,
          value.classKeys
        ])
      )
    )}
`
  )
}

function emitClientNodeMetadata(
  metadata: readonly unknown[],
  argPinsBySubType: Record<string, Record<string, number[]>>
) {
  type MetadataPin = Record<string, unknown> & { name?: string }
  type MetadataRecord = Record<string, unknown> & {
    subType: string
    nodeType: string
    methodName?: string
    editorPins?: unknown
    inputs: MetadataPin[]
    outputs: MetadataPin[]
    flows?: MetadataPin[]
    reflectMap?: Array<Record<string, unknown> & { pins?: MetadataPin[] }>
  }
  const stripPinNames = (pins: MetadataPin[] | undefined) =>
    pins?.map(({ name: _name, ...pin }) => pin)

  // enrich extractor records with the codegen-derived arg->pin mapping so the
  // IR->GIA transform can fill hidden pins while IR args stay signature-ordered
  const enriched = (metadata as MetadataRecord[]).map((record) => {
    const {
      methodName: _methodName,
      editorNameEn: _editorNameEn,
      editorPins: _editorPins,
      ...metadataRecord
    } = record
    const argPins = argPinsBySubType[record.subType]?.[record.nodeType]
    const runtimeRecord = {
      ...metadataRecord,
      inputs: stripPinNames(record.inputs),
      outputs: stripPinNames(record.outputs),
      ...(record.flows ? { flows: stripPinNames(record.flows) } : {}),
      ...(record.reflectMap
        ? {
            reflectMap: record.reflectMap.map((variant) => ({
              ...variant,
              ...(variant.pins ? { pins: stripPinNames(variant.pins) } : {})
            }))
          }
        : {})
    }
    return argPins ? { ...runtimeRecord, argPins } : runtimeRecord
  })
  const metadataPath =
    'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.ts'
  const metadataBody = fs.readFileSync(metadataPath, 'utf8')
  const marker = 'export const CLIENT_NODE_METADATA: readonly ClientNodeMetadata[] ='
  const markerIndex = metadataBody.indexOf(marker)
  if (markerIndex < 0) {
    throw new Error(`failed to replace CLIENT_NODE_METADATA in ${metadataPath}`)
  }
  const nextMetadataBody = `${metadataBody.slice(
    0,
    markerIndex
  )}${marker} ${jsonConst(enriched)} as const`
  write(metadataPath, nextMetadataBody)
}

function main() {
  const capability = readJson<Partial<ClientGraphCapability>>(
    'resources/client_graph_capability.json'
  )
  const metadata = applyOfficialClientNames(
    readJson<Array<Omit<MetaRecord, 'methodName' | 'editorNameEn' | 'editorPins'>>>(
      'resources/client_node_metadata.json'
    ),
    readJson<MihoyoEditorNames>('resources/mihoyo_editor_names.json')
  )
  const modeData = readJson<ClientNodeModeData>('resources/client_node_modes.json')
  const variableSpecialization = readJson<ClientVariableSpecializationSeed>(
    'resources/client_variable_specialization_seed.json'
  )

  assertCompleteCapability(capability)
  emitClientGraphEncoding()
  emitClientVariableSpecialization(variableSpecialization)
  emitClientGraphModes(capability as ClientGraphCapability, modeData)
  emitClientScopedGlobals(deriveScopedGlobalsCapability(metadata as MetadataRecord[], modeData))

  const alignment = buildDocNameAlignment()
  const enumBinding = buildClientEnumBinding()
  emitClientEnums(enumBinding)
  const generated = generateClientNodes(metadata, alignment, enumBinding)
  emitClientNodeMetadata(metadata, generated.argPinsBySubType)
  const classFileBody = emitClientEntityHelpers(
    generated.classFileBody,
    generated.flowMetadata,
    generated.methodsBySubType,
    metadata,
    modeData
  )
  write('src/definitions/client_nodes.ts', classFileBody)
  emitClientZhAliases(generated.methodsBySubType, metadata)
  emitClientMethodModes(
    generated.flowMetadata,
    generated.methodsBySubType,
    generated.literalArgumentIndexesBySubType,
    metadata,
    modeData
  )
  write('tests/client_generated/_generation_gaps.json', JSON.stringify(generated.gaps, null, 2))

  const { shared, drift } = deriveServerSignatureDrift(
    generated.flowMetadata,
    extractServerMethodSignatures()
  )
  write('tests/client_generated/_server_drift.json', JSON.stringify({ shared, drift }, null, 2))

  const methodCount = Object.values(generated.methodsBySubType).reduce((n, m) => n + m.length, 0)
  console.log(
    `[ok] generated client nodegraph modules (${methodCount} methods, ` +
      `${generated.gaps.length} gaps, ${drift.length}/${shared} drifted shared methods)`
  )
}

main()
