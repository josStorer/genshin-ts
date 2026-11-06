import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

import {
  CLIENT_NODE_METHODS_BY_SUB_TYPE_AND_MODE,
  CLIENT_NODE_TYPES_BY_SUB_TYPE_AND_MODE
} from '../../src/definitions/client_method_modes.js'
import type { ClientGraphMode, ClientGraphSubType } from '../../src/runtime/IR.js'
import { snakeToCamel } from './client_nodes_codegen.js'

type GraphSpec = {
  mode: ClientGraphMode
  subType: ClientGraphSubType
  registerMethod: string
  id: number
  name: string
  event: 'start' | 'start1'
  filterReturn?: 'bool' | 'int'
}

type MethodParam = {
  name: string
  typeText: string
  optional: boolean
  rest: boolean
}

type MethodInfo = {
  name: string
  params: MethodParam[]
  returnTypeNode?: ts.TypeNode
  returnText: string
  bodyText: string
}

type MetadataRecord = {
  subType: ClientGraphSubType
  nodeType: string
  genericId: number
  inputs?: Array<{ index: number; connectable?: boolean }>
  outputs?: Array<{ index: number }>
  flows?: Array<{ index: number; kind: string }>
}

type GapRecord = {
  subType: ClientGraphSubType
  nodeType: string
  displayName: string
  reason: string
  detail: string
}

type EnumPick = {
  namespace: 'E' | 'CE'
  member: string
}

type EmitState = {
  graph: GraphSpec
  methodNames: ReadonlySet<string>
  enumPicks: ReadonlyMap<string, EnumPick>
  serial: number
  literalArgs: number
  wiredArgs: number
  filterChecks: string[]
}

const november = process.argv.includes('--november')
const OUT_DIR = november ? 'tests/manual/nodes-2026-11' : 'tests/manual/client-nodes'
const NOVEMBER_IDS = new Set([
  200050, 200051, 200059, 200112, 200115, 200252, 200276, 200277, 200278, 200280, 200281, 200282,
  200301, 200302, 200303, 200307, 200308, 200309, 200310, 200311, 200312
])
const SOURCE_FILE = 'src/definitions/client_nodes.ts'
const RANDOM_SEED = 0x6d696c69

const GRAPH_SPECS: readonly GraphSpec[] = [
  {
    mode: 'beyond',
    subType: 'character_skill',
    registerMethod: 'characterSkill',
    id: 1082130435,
    name: 'AllClientNodesCharacterSkillBeyond',
    event: 'start'
  },
  {
    mode: 'beyond',
    subType: 'character_control_skill',
    registerMethod: 'characterControlSkill',
    id: 1082130436,
    name: 'AllClientNodesCharacterControlSkillBeyond',
    event: 'start'
  },
  {
    mode: 'beyond',
    subType: 'creation_skill',
    registerMethod: 'creationSkill',
    id: 1082130437,
    name: 'AllClientNodesCreationSkillBeyond',
    event: 'start'
  },
  {
    mode: 'beyond',
    subType: 'creation_status',
    registerMethod: 'creationStatus',
    id: 1082130438,
    name: 'AllClientNodesCreationStatusBeyond',
    event: 'start1'
  },
  {
    mode: 'beyond',
    subType: 'creation_status_decision',
    registerMethod: 'creationStatusDecision',
    id: 1082130439,
    name: 'AllClientNodesCreationStatusDecisionBeyond',
    event: 'start1'
  },
  {
    mode: 'beyond',
    subType: 'bool_filter',
    registerMethod: 'boolFilter',
    id: 1082130440,
    name: 'AllClientNodesBoolFilterBeyond',
    event: 'start',
    filterReturn: 'bool'
  },
  {
    mode: 'beyond',
    subType: 'int_filter',
    registerMethod: 'intFilter',
    id: 1082130441,
    name: 'AllClientNodesIntFilterBeyond',
    event: 'start',
    filterReturn: 'int'
  },
  {
    mode: 'classic',
    subType: 'creation_skill',
    registerMethod: 'creationSkill',
    id: 1082130444,
    name: 'AllClientNodesCreationSkillClassic',
    event: 'start'
  },
  {
    mode: 'classic',
    subType: 'creation_status',
    registerMethod: 'creationStatus',
    id: 1082130445,
    name: 'AllClientNodesCreationStatusClassic',
    event: 'start1'
  },
  {
    mode: 'classic',
    subType: 'creation_status_decision',
    registerMethod: 'creationStatusDecision',
    id: 1082130446,
    name: 'AllClientNodesCreationStatusDecisionClassic',
    event: 'start1'
  },
  {
    mode: 'classic',
    subType: 'bool_filter',
    registerMethod: 'boolFilter',
    id: 1082130449,
    name: 'AllClientNodesBoolFilterClassic',
    event: 'start',
    filterReturn: 'bool'
  },
  {
    mode: 'classic',
    subType: 'int_filter',
    registerMethod: 'intFilter',
    id: 1082130448,
    name: 'AllClientNodesIntFilterClassic',
    event: 'start',
    filterReturn: 'int'
  }
]

const STATUS_GRAPH_IDS: Record<ClientGraphMode, number> = {
  beyond: 1082130438,
  classic: 1082130445
}

const CLASS_BY_SUB_TYPE: Record<ClientGraphSubType, string> = {
  character_skill: 'ClientCharacterSkillExecutionFlowFunctions',
  character_control_skill: 'ClientCharacterControlSkillExecutionFlowFunctions',
  creation_skill: 'ClientCreationSkillExecutionFlowFunctions',
  creation_status: 'ClientCreationStatusExecutionFlowFunctions',
  creation_status_decision: 'ClientCreationStatusDecisionExecutionFlowFunctions',
  bool_filter: 'ClientBoolFilterExecutionFlowFunctions',
  int_filter: 'ClientIntFilterExecutionFlowFunctions'
}

function normalizeType(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/^\|\s*/, '')
    .trim()
}

function hash(text: string): number {
  let value = RANDOM_SEED
  for (const char of text) {
    value ^= char.charCodeAt(0)
    value = Math.imul(value, 0x01000193)
  }
  return value >>> 0
}

function nextSerial(state: EmitState): number {
  state.serial += 1
  return state.serial
}

function pickWire(
  state: EmitState,
  method: MethodInfo,
  param: MethodParam,
  index: number
): boolean {
  return (
    hash(`${state.graph.mode}.${state.graph.subType}.${method.name}.${param.name}.${index}`) % 2 ===
    0
  )
}

function extractMethods(): Map<ClientGraphSubType, Map<string, MethodInfo>> {
  const sourceText = fs.readFileSync(SOURCE_FILE, 'utf8')
  const source = ts.createSourceFile(
    SOURCE_FILE,
    sourceText,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS
  )
  const byClass = new Map<string, ClientGraphSubType>(
    Object.entries(CLASS_BY_SUB_TYPE).map(([subType, className]) => [
      className,
      subType as ClientGraphSubType
    ])
  )
  const result = new Map<ClientGraphSubType, Map<string, MethodInfo>>()

  for (const statement of source.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) continue
    const subType = byClass.get(statement.name.text)
    if (!subType) continue

    const methods = new Map<string, MethodInfo>()
    for (const member of statement.members) {
      if (
        !ts.isMethodDeclaration(member) ||
        !member.body ||
        !member.name ||
        !ts.isIdentifier(member.name)
      ) {
        continue
      }
      methods.set(member.name.text, {
        name: member.name.text,
        params: member.parameters.map((param) => ({
          name: ts.isIdentifier(param.name) ? param.name.text : param.name.getText(source),
          typeText: param.type?.getText(source) ?? 'unknown',
          optional: !!param.questionToken || !!param.initializer,
          rest: !!param.dotDotDotToken
        })),
        returnTypeNode: member.type,
        returnText: member.type?.getText(source) ?? 'void',
        bodyText: member.body.getText(source)
      })
    }
    result.set(subType, methods)
  }

  return result
}

function extractEnumPicks(file: string, namespace: EnumPick['namespace']): Map<string, EnumPick> {
  const sourceText = fs.readFileSync(file, 'utf8')
  const source = ts.createSourceFile(
    file,
    sourceText,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS
  )
  const result = new Map<string, EnumPick>()

  for (const statement of source.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) continue
    const members = statement.members.filter(
      (candidate): candidate is ts.PropertyDeclaration =>
        ts.isPropertyDeclaration(candidate) &&
        candidate.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword) ===
          true &&
        ts.isIdentifier(candidate.name)
    )
    const member = members[november ? 1 : 0] ?? members[0]
    if (member && ts.isIdentifier(member.name)) {
      result.set(statement.name.text, { namespace, member: member.name.text })
    }
  }
  return result
}

function enumExpression(state: EmitState, typeName: string): string {
  const pick = state.enumPicks.get(typeName)
  if (!pick) throw new Error(`missing enum pick for ${typeName}`)
  return `${pick.namespace}.${typeName}.${pick.member}`
}

function isLiteralOnly(method: MethodInfo, param: MethodParam): boolean {
  if (method.name === 'sendSignalToServerNodeGraph' && param.name === 'signalName') return true
  return method.bodyText.includes(`${method.name}.${param.name}`)
}

function emitEnumArray(state: EmitState, typeName: string, size: number): string {
  const enumSource = fs.readFileSync(
    state.enumPicks.get(typeName)?.namespace === 'CE'
      ? 'src/definitions/client_enums.ts'
      : 'src/definitions/enum.ts',
    'utf8'
  )
  const pattern = new RegExp(`export class ${typeName}\\b[\\s\\S]*?(?=\\nexport class |$)`)
  const classSource = pattern.exec(enumSource)?.[0] ?? ''
  const members = [...classSource.matchAll(/static readonly ([A-Za-z0-9_]+)\s*=/g)].map(
    (match) => match[1]!
  )
  if (!members.length) return `[${enumExpression(state, typeName)}]`
  const namespace = state.enumPicks.get(typeName)!.namespace
  return `[${Array.from({ length: size }, (_, index) => {
    const member = members[index % members.length]!
    return `${namespace}.${typeName}.${member}`
  }).join(', ')}]`
}

function recordArg(state: EmitState, kind: 'literal' | 'wire'): void {
  if (kind === 'wire') state.wiredArgs += 1
  else state.literalArgs += 1
}

function emitArg(
  state: EmitState,
  method: MethodInfo,
  param: MethodParam,
  paramIndex: number
): string {
  const type = normalizeType(param.typeText)
  const literalOnly = isLiteralOnly(method, param)
  const useWire = !literalOnly && pickWire(state, method, param, paramIndex)
  const kind = useWire ? 'wire' : 'literal'

  if (type.includes('breakLoop: () => void')) {
    if (type.includes('currentEntity:')) {
      return `(currentEntity, breakLoop) => { f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', f.equal(currentEntity, wireEntity)); breakLoop() }`
    }
    return `(loopValue, breakLoop) => { f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', f.equal(loopValue, 0n)); breakLoop() }`
  }
  if (/^\(\)\s*=>\s*void$/.test(type)) return '() => {}'
  if (type.startsWith('Record<')) {
    return `({ ${Array.from({ length: 10 }, (_, index) => `${index + 1}: () => {}`).join(
      ', '
    )}, default: () => {} })`
  }
  if (method.name === 'assemblyDictionary' && param.name === 'pairs') {
    recordArg(state, kind)
    const key = useWire ? 'wireInt' : `${nextSerial(state)}n`
    const value = useWire ? 'wireInt' : `${nextSerial(state)}n`
    return `[${Array.from({ length: 10 }, () => `{ k: ${key}, v: ${value} }`).join(', ')}]`
  }
  if (method.name === 'assemblyList' && param.name === '_0to9') {
    recordArg(state, kind)
    const value = useWire ? 'wireInt' : `${nextSerial(state)}n`
    return `[${Array.from({ length: 10 }, () => value).join(', ')}]`
  }
  if (method.name === 'assemblyList' && param.name === 'type') {
    recordArg(state, 'literal')
    return `'int'`
  }
  if (method.name === 'dataTypeConversion' && param.name === 'input') {
    recordArg(state, kind)
    return useWire ? 'wireInt' : `${nextSerial(state)}n`
  }
  if (method.name === 'dataTypeConversion' && param.name === 'type') {
    recordArg(state, 'literal')
    return `'str'`
  }
  if (method.name === 'enumerationMatch') {
    recordArg(state, 'literal')
    return enumExpression(state, 'SortBy')
  }
  if (method.name === 'getEntityTypeList' && param.name === 'types') {
    recordArg(state, 'literal')
    return emitEnumArray(state, 'EntityType', 10)
  }
  if (method.name === 'getRayFilterTypeList' && param.name === 'types') {
    recordArg(state, 'literal')
    return emitEnumArray(
      state,
      type === 'RayHitFilterType[]' ? 'RayHitFilterType' : 'RayFilterType',
      10
    )
  }

  if (type === 'FloatValue') {
    recordArg(state, kind)
    return useWire ? 'wireFloat' : `${nextSerial(state)}.25`
  }
  if (type === 'IntValue') {
    recordArg(state, kind)
    return useWire ? 'wireInt' : `${nextSerial(state)}n`
  }
  if (type === 'BoolValue') {
    recordArg(state, kind)
    return useWire ? 'wireBool' : nextSerial(state) % 2 ? 'true' : 'false'
  }
  if (type === 'StrValue') {
    recordArg(state, kind)
    return useWire ? 'wireStr' : JSON.stringify(`literal-${nextSerial(state)}`)
  }
  if (type === 'Vec3Value') {
    recordArg(state, kind)
    const n = nextSerial(state)
    return useWire ? 'wireVec3' : `[${n}, ${n + 1}, ${n + 2}]`
  }
  if (type === 'GuidValue') {
    recordArg(state, kind)
    return useWire ? 'wireGuid' : `guid(${nextSerial(state)}n)`
  }
  if (type === 'EntityValue') {
    recordArg(state, kind)
    return useWire ? 'wireEntity' : 'self'
  }
  if (type === 'ConfigIdValue') {
    recordArg(state, kind)
    return useWire ? 'wireConfig' : `configId(${nextSerial(state)}n)`
  }
  if (type === 'PrefabIdValue') {
    recordArg(state, kind)
    return useWire ? 'wirePrefab' : `prefabId(${nextSerial(state)}n)`
  }
  if (type === 'FactionValue') {
    recordArg(state, kind)
    return useWire ? 'wireFaction' : `faction(${nextSerial(state)}n)`
  }
  if (type === 'FloatValue | IntValue' || type === 'IntValue | StrValue') {
    recordArg(state, kind)
    return useWire ? 'wireInt' : `${nextSerial(state)}n`
  }
  if (
    type.includes('FloatValue') &&
    type.includes('IntValue') &&
    !type.includes('[]') &&
    !type.includes('=>')
  ) {
    recordArg(state, kind)
    return useWire ? 'wireInt' : `${nextSerial(state)}n`
  }
  if (type === 'FloatValue[] | IntValue[]') {
    recordArg(state, literalOnly ? 'literal' : 'wire')
    return literalOnly ? 'list(0)' : wireListExpression('wireInt', 'int')
  }
  if (type === 'IntValue[]') {
    recordArg(state, literalOnly ? 'literal' : 'wire')
    return literalOnly ? 'list(0)' : wireListExpression('wireInt', 'int')
  }
  if (type === 'EntityValue[]') {
    recordArg(state, 'wire')
    return wireListExpression('wireEntity', 'entity')
  }
  if (type === 'StrValue[]') {
    recordArg(state, literalOnly ? 'literal' : 'wire')
    return literalOnly ? 'list(0)' : wireListExpression('wireStr', 'str')
  }
  if (type === 'EntityType[]') {
    recordArg(state, kind)
    return useWire && state.methodNames.has('getEntityTypeList')
      ? `f.getEntityTypeList(${emitEnumArray(state, 'EntityType', 10)})`
      : emitEnumArray(state, 'EntityType', 3)
  }
  if (type === 'RayFilterType[]' || type === 'RayHitFilterType[]') {
    const enumType = type.slice(0, -2)
    recordArg(state, kind)
    return useWire && state.methodNames.has('getRayFilterTypeList')
      ? `f.getRayFilterTypeList(${emitEnumArray(state, enumType, 10)})`
      : emitEnumArray(state, enumType, 3)
  }
  if (type.includes('[]') && type.includes('RuntimeParameterValueTypeMap')) {
    recordArg(state, literalOnly ? 'literal' : 'wire')
    return literalOnly ? 'list(0)' : wireListExpression('wireInt', 'int')
  }
  if (type.includes('[]') && type.includes('Value')) {
    recordArg(state, literalOnly ? 'literal' : 'wire')
    return literalOnly ? 'list(0)' : wireListExpression('wireInt', 'int')
  }
  if (type.startsWith('dict<') || type === 'DictValue') {
    recordArg(state, 'wire')
    return wireDictExpression()
  }
  if (type.startsWith('RuntimeParameterValueTypeMap[')) {
    recordArg(state, kind)
    return useWire ? 'wireInt' : `${nextSerial(state)}n`
  }
  if (type === 'T' || type === 'U') {
    recordArg(state, 'literal')
    return `'int'`
  }
  if (type === 'unknown') {
    recordArg(state, 'wire')
    return 'wireInt'
  }

  const enumPick = state.enumPicks.get(type)
  if (enumPick) {
    recordArg(state, 'literal')
    return enumExpression(state, type)
  }
  if (type.startsWith('EnumerationTypeMap[')) {
    recordArg(state, 'literal')
    return enumExpression(state, 'SortBy')
  }

  throw new Error(
    `unsupported parameter type ${state.graph.subType}.${method.name}.${param.name}: ${type}`
  )
}

function isListReturn(type: string): boolean {
  return (
    type.endsWith('[]') ||
    type.includes('_list`]') ||
    type.includes('_list"]') ||
    type.includes('`${T}_list`') ||
    type.includes('`${K}_list`') ||
    type.includes('`${V}_list`')
  )
}

function emitValueConsumer(
  lines: string[],
  state: EmitState,
  expression: string,
  rawType: string
): void {
  const type = normalizeType(rawType)
  if (type === 'generic') {
    const narrowed = `narrowed${nextSerial(state)}`
    lines.push(`const ${narrowed} = ${expression}.asType('int')`)
    emitBooleanAnchor(lines, state, `f.equal(${narrowed}, 0n)`)
    return
  }
  if (type.startsWith('ReadonlyDict<') || type === 'dict') {
    emitBooleanAnchor(
      lines,
      state,
      `f.greaterThanOrEqualTo(f.queryDictionarySLength(${expression}), 0n)`
    )
    return
  }
  if (isListReturn(type)) {
    if (type === 'EntityType[]') {
      const status = state.graph.subType.startsWith('creation_status')
      const probe = `enumListProbe${nextSerial(state)}`
      lines.push(
        `const ${probe} = f.getRayDetectionResult(${status ? enumExpression(state, 'TargetEntity') : 'wireEntity'}, wireVec3, wireVec3, wireFloat, ${enumExpression(
          state,
          'TargetType'
        )}, ${expression}, f.getRayFilterTypeList(${emitEnumArray(state, status ? 'RayHitFilterType' : 'RayFilterType', 10)}))`
      )
      emitBooleanAnchor(lines, state, `f.equal(${probe}.onHitLocation, [0, 0, 0])`)
      if (november)
        emitBooleanAnchor(
          lines,
          state,
          status ? `${probe}.onHitEntity` : `f.equal(${probe}.onHitEntity, wireEntity)`
        )
      return
    }
    if (type === 'RayFilterType[]' || type === 'RayHitFilterType[]') {
      const status = state.graph.subType.startsWith('creation_status')
      const probe = `enumListProbe${nextSerial(state)}`
      lines.push(
        `const ${probe} = f.getRayDetectionResult(${status ? enumExpression(state, 'TargetEntity') : 'wireEntity'}, wireVec3, wireVec3, wireFloat, ${enumExpression(
          state,
          'TargetType'
        )}, f.getEntityTypeList(${emitEnumArray(state, 'EntityType', 10)}), ${expression})`
      )
      emitBooleanAnchor(lines, state, `f.equal(${probe}.onHitLocation, [0, 0, 0])`)
      if (november)
        emitBooleanAnchor(
          lines,
          state,
          status ? `${probe}.onHitEntity` : `f.equal(${probe}.onHitEntity, wireEntity)`
        )
      return
    }
    emitBooleanAnchor(lines, state, `f.greaterThanOrEqualTo(f.getListLength(${expression}), 0n)`)
    return
  }
  if (state.enumPicks.has(type)) {
    emitBooleanAnchor(
      lines,
      state,
      `f.enumerationMatch(${expression}, ${enumExpression(state, type)})`
    )
    return
  }
  emitBooleanAnchor(lines, state, `f.equal(${expression}, ${comparisonLiteral(state, type)})`)
}

function emitBooleanAnchor(lines: string[], state: EmitState, expression: string): void {
  const check = `pinCheck${nextSerial(state)}`
  lines.push(`const ${check} = ${expression}`)
  if (state.graph.filterReturn) {
    state.filterChecks.push(check)
    return
  }
  if (
    state.graph.subType === 'character_skill' ||
    state.graph.subType === 'character_control_skill' ||
    state.graph.subType === 'creation_skill'
  ) {
    lines.push(`f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', ${check})`)
    return
  }
  if (state.graph.subType === 'creation_status') {
    lines.push(`f.executeSkill(${check}, 1n)`)
    return
  }
  lines.push(
    `f.switchToSelfExecutionStatus(${check}, configId(${STATUS_GRAPH_IDS[state.graph.mode]}), 1n)`
  )
}

function comparisonLiteral(state: EmitState, type: string): string {
  if (type === 'boolean') return 'false'
  if (type === 'number') return '0'
  if (type === 'string') return `''`
  if (type === 'vec3') return '[0, 0, 0]'
  if (type === 'guid') return 'guid(0n)'
  if (type === 'configId') return 'configId(0n)'
  if (type === 'prefabId') return 'prefabId(0n)'
  if (type === 'faction') return 'faction(0n)'
  if (type.startsWith('RuntimeReturnValueTypeMap[')) return `''`
  if (type.startsWith('ClientRuntimeReturnValueTypeMap[')) return '0n'
  if (type.includes('number') || type.includes('bigint') || type === 'bigint') return '0n'
  if (type.includes('clientEntity') || type === 'entity') return 'wireEntity'
  if (state.enumPicks.has(type)) return enumExpression(state, type)
  return '0n'
}

function emitOutputConsumer(
  lines: string[],
  state: EmitState,
  resultName: string,
  method: MethodInfo
): void {
  const typeNode = method.returnTypeNode
  if (!typeNode) return
  if (ts.isTypeLiteralNode(typeNode)) {
    for (const member of typeNode.members) {
      if (!ts.isPropertySignature(member) || !member.type || !member.name) continue
      const propertyName = member.name.getText().replace(/^['"]|['"]$/g, '')
      emitValueConsumer(lines, state, `${resultName}.${propertyName}`, member.type.getText())
    }
    return
  }
  emitValueConsumer(lines, state, resultName, method.returnText)
}

function emitWirePool(state: EmitState): string[] {
  const statusTarget =
    state.graph.subType === 'creation_status' || state.graph.subType === 'creation_status_decision'
  const customTarget = statusTarget ? `${enumExpression(state, 'TargetEntity')}` : 'wireEntity'
  const factionTarget = customTarget
  if (!state.methodNames.has('queryEntityFaction')) {
    throw new Error(`${state.graph.subType}.${state.graph.mode}: missing entity faction query`)
  }
  const lines = [
    `const wireEntity = f.getSelfEntity()`,
    `const wireBool = f.equal(101n, 101n)`,
    `const wireInt = f.addition(101n, 202n)`,
    `const wireFloat = f.addition(1.25, 2.5)`,
    `const wireVec3 = f.create3dVector(1, 2, 3)`,
    `const wireFaction = f.queryEntityFaction(${factionTarget})`,
    `const wireStr = f.getCustomVariable(${customTarget}, 'gsts_manual_wire_str').asType('str')`,
    `const wireGuid = f.getCustomVariable(${customTarget}, 'gsts_manual_wire_guid').asType('guid')`,
    `const wireConfig = f.getCustomVariable(${customTarget}, 'gsts_manual_wire_config').asType('config_id')`,
    `const wirePrefab = f.getCustomVariable(${customTarget}, 'gsts_manual_wire_prefab').asType('prefab_id')`
  ]
  emitValueConsumer(lines, state, 'wireStr', 'string')
  emitValueConsumer(lines, state, 'wireGuid', 'guid')
  emitValueConsumer(lines, state, 'wireConfig', 'configId')
  emitValueConsumer(lines, state, 'wirePrefab', 'prefabId')
  return lines
}

function repeat(value: string): string {
  return `[${Array.from({ length: 10 }, () => value).join(', ')}]`
}

function repeatPair(key: string, value: string): string {
  return `[${Array.from({ length: 10 }, () => `{ k: ${key}, v: ${value} }`).join(', ')}]`
}

function wireListExpression(value: string, type: string): string {
  return `f.assemblyList(${repeat(value)}, ${JSON.stringify(type)})`
}

function wireDictExpression(): string {
  return `f.assemblyDictionary(${repeatPair('wireInt', 'wireInt')})`
}

function emitSignalCall(): string {
  return [
    `f.sendSignalToServerNodeGraph(`,
    `  ManualClientPinSignal,`,
    `  wireBool,`,
    `  wireInt,`,
    `  wireFloat,`,
    `  wireStr,`,
    `  wireVec3,`,
    `  wireGuid,`,
    `  wireEntity,`,
    `  wirePrefab,`,
    `  wireConfig`,
    `)`
  ].join('\n')
}

function emitMethod(state: EmitState, method: MethodInfo, metadata: MetadataRecord): string[] {
  if (method.name === 'breakLoop') {
    return ['// breakLoop is emitted by finiteLoop/traverseEntityList callbacks below.']
  }

  const beforeLiteral = state.literalArgs
  const beforeWire = state.wiredArgs
  const call =
    method.name === 'sendSignalToServerNodeGraph'
      ? emitSignalCall()
      : `f.${method.name}(${method.params
          .map((param, index) => emitArg(state, method, param, index))
          .join(', ')})`
  if (method.name === 'sendSignalToServerNodeGraph') {
    state.literalArgs += 1
    state.wiredArgs += 9
  }

  const inputSummary = `literal=${state.literalArgs - beforeLiteral}, wire=${
    state.wiredArgs - beforeWire
  }`
  const lines = [
    `// ${method.name} / ${metadata.nodeType} / genericId=${metadata.genericId} / ${inputSummary}`
  ]
  const isVoid = normalizeType(method.returnText) === 'void'
  const hasInputFlow = metadata.flows?.some((flow) => flow.kind === 'in_flow') ?? false
  const outFlowCount = metadata.flows?.filter((flow) => flow.kind === 'out_flow').length ?? 0

  if (isVoid) {
    if (hasInputFlow && outFlowCount === 0 && method.name !== 'breakLoop') {
      lines.push(`f.doubleBranch(false, () => {`)
      lines.push(...call.split('\n').map((line) => `  ${line}`))
      lines.push(`}, () => {})`)
    } else {
      lines.push(call)
    }
    return lines
  }

  const resultName = `result${nextSerial(state)}`
  const returnType = normalizeType(method.returnText)
  if (
    returnType === 'EntityType[]' ||
    returnType === 'RayFilterType[]' ||
    returnType === 'RayHitFilterType[]'
  ) {
    const status = state.graph.subType.startsWith('creation_status')
    const otherList =
      returnType === 'EntityType[]'
        ? `f.getRayFilterTypeList(${emitEnumArray(state, status ? 'RayHitFilterType' : 'RayFilterType', 10)})`
        : `f.getEntityTypeList(${emitEnumArray(state, 'EntityType', 10)})`
    const entityTypes = returnType === 'EntityType[]' ? call : otherList
    const rayFilters = returnType !== 'EntityType[]' ? call : otherList
    const probe = `enumListProbe${nextSerial(state)}`
    lines.push(
      `const ${probe} = f.getRayDetectionResult(${status ? enumExpression(state, 'TargetEntity') : 'wireEntity'}, wireVec3, wireVec3, wireFloat, ${enumExpression(
        state,
        'TargetType'
      )}, ${entityTypes}, ${rayFilters})`
    )
    emitBooleanAnchor(lines, state, `f.equal(${probe}.onHitLocation, [0, 0, 0])`)
    if (november)
      emitBooleanAnchor(
        lines,
        state,
        status ? `${probe}.onHitEntity` : `f.equal(${probe}.onHitEntity, wireEntity)`
      )
    return lines
  }
  if (returnType.startsWith('ReadonlyDict<') || returnType === 'dict') {
    emitValueConsumer(lines, state, call, returnType)
    return lines
  }
  if (isListReturn(returnType)) {
    emitValueConsumer(lines, state, call, returnType)
    return lines
  }
  lines.push(`const ${resultName} = ${call}`)
  emitOutputConsumer(lines, state, resultName, method)
  return lines
}

function emitGraph(
  graph: GraphSpec,
  methodsBySubType: Map<ClientGraphSubType, Map<string, MethodInfo>>,
  metadataByMethodKey: ReadonlyMap<string, MetadataRecord>,
  enumPicks: ReadonlyMap<string, EnumPick>
): { source: string; report: Record<string, unknown> } {
  const availableMethods = CLIENT_NODE_METHODS_BY_SUB_TYPE_AND_MODE[graph.subType][
    graph.mode
  ] as readonly string[]
  const methodNames = availableMethods.filter(
    (name) =>
      !november || NOVEMBER_IDS.has(metadataByMethodKey.get(`${graph.subType}.${name}`)!.genericId)
  )
  const methods = methodsBySubType.get(graph.subType)
  if (!methods) throw new Error(`missing generated class for ${graph.subType}`)

  const state: EmitState = {
    graph,
    methodNames: new Set(availableMethods),
    enumPicks,
    serial: 0,
    literalArgs: 0,
    wiredArgs: 0,
    filterChecks: []
  }
  const dataCalls: string[][] = []
  const execCalls: string[][] = []
  const coveredNodeTypes = new Set<string>()

  for (const methodName of methodNames) {
    const method = methods.get(methodName)
    if (!method) throw new Error(`missing method implementation ${graph.subType}.${methodName}`)
    const metadata = metadataByMethodKey.get(`${graph.subType}.${methodName}`)
    if (!metadata) throw new Error(`missing metadata ${graph.subType}.${methodName}`)
    coveredNodeTypes.add(metadata.nodeType)
    const emitted = emitMethod(state, method, metadata)
    const hasInputFlow = metadata.flows?.some((flow) => flow.kind === 'in_flow') ?? false
    ;(hasInputFlow ? execCalls : dataCalls).push(emitted)
  }

  const lines = [
    `g.${graph.registerMethod}({`,
    `  id: ${graph.id},`,
    `  name: ${JSON.stringify(graph.name)},`,
    `  prefix: true,`,
    `  mode: ${JSON.stringify(graph.mode)}`,
    `}).on(${JSON.stringify(graph.event)}, (_evt, f) => {`,
    ...emitWirePool(state).map((line) => `  ${line}`),
    ``
  ]

  for (const emitted of [...dataCalls, ...execCalls]) {
    lines.push(...emitted.map((line) => (line ? `  ${line}` : '')))
    lines.push('')
  }
  if (graph.filterReturn) {
    const filterResult = emitFilterResult(lines, state)
    lines.push(
      graph.filterReturn === 'bool'
        ? `  return ${filterResult}`
        : `  return f.dataTypeConversion(${filterResult}, 'int')`
    )
  }
  lines.push(`})`)

  const expectedNodeTypes = CLIENT_NODE_TYPES_BY_SUB_TYPE_AND_MODE[graph.subType][
    graph.mode
  ] as readonly string[]
  const selectedExpectedNodeTypes = expectedNodeTypes.filter(
    (nodeType) =>
      !november ||
      NOVEMBER_IDS.has(
        metadataByMethodKey.get(`${graph.subType}.${snakeToCamel(nodeType)}`)?.genericId ?? -1
      )
  )
  const uncoveredNodeTypes = selectedExpectedNodeTypes.filter(
    (nodeType) =>
      !coveredNodeTypes.has(nodeType) &&
      nodeType !== 'node_graph_begins' &&
      nodeType !== 'node_graph_end_boolean' &&
      nodeType !== 'node_graph_end_integer'
  )

  return {
    source: lines.join('\n'),
    report: {
      mode: graph.mode,
      subType: graph.subType,
      registerMethod: graph.registerMethod,
      id: graph.id,
      name: graph.name,
      methodCount: methodNames.length,
      expectedNodeTypeCount: selectedExpectedNodeTypes.length,
      literalArgs: state.literalArgs,
      wiredArgs: state.wiredArgs,
      uncoveredNodeTypes
    }
  }
}

function emitFilterResult(lines: string[], state: EmitState): string {
  let current = [...state.filterChecks]
  if (!current.length) return 'wireBool'
  while (current.length > 1) {
    const next: string[] = []
    for (let index = 0; index < current.length; index += 2) {
      const left = current[index]!
      const right = current[index + 1]
      if (!right) {
        next.push(left)
        continue
      }
      const combined = `combinedCheck${nextSerial(state)}`
      lines.push(`  const ${combined} = f.logicalAndOperation(${left}, ${right})`)
      next.push(combined)
    }
    current = next
  }
  return current[0]!
}

function emitModeFile(mode: ClientGraphMode, graphs: readonly string[]): string {
  const graphSpecs = GRAPH_SPECS.filter((graph) => graph.mode === mode)
  const idRows = graphSpecs.map(
    (graph) =>
      ` *   ${graph.id + (november ? 1000 : 0)}  ${november ? 'November_' : ''}${graph.name} (${graph.subType})`
  )
  return [
    `/**`,
    ` * AUTO-GENERATED exhaustive client-node import fixture (${mode}).`,
    ` *`,
    ` * Regenerate: npm run gen:client:${november ? 'november' : 'manual'}`,
    ` * Build GIA: node ./bin/gsts.mjs ${OUT_DIR}/${mode}.ts -c ./gsts.test.config.ts --noinject`,
    ` *`,
    ` * Graph IDs:`,
    ...idRows,
    ` */`,
    ``,
    `import * as CE from 'genshin-ts/definitions/client_enums'`,
    `import * as E from 'genshin-ts/definitions/enum'`,
    `import { defineSignal, g } from 'genshin-ts/runtime/core'`,
    ``,
    `const ManualClientPinSignal = defineSignal('gsts_all_client_pin_probe', [`,
    `  ['boolValue', 'bool'],`,
    `  ['intValue', 'int'],`,
    `  ['floatValue', 'float'],`,
    `  ['stringValue', 'str'],`,
    `  ['vectorValue', 'vec3'],`,
    `  ['guidValue', 'guid'],`,
    `  ['entityValue', 'entity'],`,
    `  ['prefabValue', 'prefab_id'],`,
    `  ['configValue', 'config_id']`,
    `])`,
    ``,
    ...graphs.flatMap((graph, index) => (index ? ['', graph] : [graph])),
    ``
  ].join('\n')
}

function main(): void {
  const methodsBySubType = extractMethods()
  const enumPicks = new Map<string, EnumPick>([
    ...extractEnumPicks('src/definitions/enum.ts', 'E'),
    ...extractEnumPicks('src/definitions/client_enums.ts', 'CE')
  ])
  const metadata = JSON.parse(
    fs.readFileSync('resources/client_node_metadata.json', 'utf8')
  ) as MetadataRecord[]
  const metadataByMethodKey = new Map(
    metadata.map(
      (record) => [`${record.subType}.${snakeToCamel(record.nodeType)}`, record] as const
    )
  )
  const gaps = JSON.parse(
    fs.readFileSync('tests/client_generated/_generation_gaps.json', 'utf8')
  ) as GapRecord[]

  fs.mkdirSync(OUT_DIR, { recursive: true })

  const reports: Record<string, unknown>[] = []
  for (const mode of ['beyond', 'classic'] as const) {
    const graphs = GRAPH_SPECS.filter((graph) => graph.mode === mode).map((graph) => {
      if (november) graph = { ...graph, id: graph.id + 1000, name: `November_${graph.name}` }
      const result = emitGraph(graph, methodsBySubType, metadataByMethodKey, enumPicks)
      reports.push(result.report)
      return result.source
    })
    fs.writeFileSync(path.join(OUT_DIR, `${mode}.ts`), emitModeFile(mode, graphs))
  }

  const reportPath = november
    ? '.tmp/nodes-2026-11-work/client-manual-coverage.json'
    : path.join(OUT_DIR, '_coverage.json')
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        format: 1,
        seed: RANDOM_SEED,
        graphs: reports,
        knownGenerationGaps: gaps
      },
      null,
      2
    )}\n`
  )

  console.log(`[ok] generated ${GRAPH_SPECS.length} exhaustive client graphs in ${OUT_DIR}`)
}

main()
