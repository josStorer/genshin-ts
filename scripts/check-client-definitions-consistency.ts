import fs from 'node:fs'

import ts from 'typescript'

import { CLIENT_ENTITY_HELPER_BINDINGS_BY_SUB_TYPE_AND_MODE } from '../src/definitions/client_entity_helpers.js'
import {
  CLIENT_NODE_METHODS_BY_SUB_TYPE,
  CLIENT_NODE_METHODS_BY_SUB_TYPE_AND_MODE,
  CLIENT_NODE_TYPES_BY_SUB_TYPE_AND_MODE
} from '../src/definitions/client_method_modes.js'
import { CLIENT_F_ZH_TO_EN_BY_SUB_TYPE } from '../src/definitions/client_zh_aliases.js'
import {
  ENUM_MATCH_CLASS_KEYS_BY_GENERIC_ID,
  ENUM_MATCH_ROWS_BY_GENERIC_ID
} from '../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_enum_values.js'
import { CLIENT_NODE_METADATA } from '../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.js'
import {
  buildClientEnumBinding,
  LEGACY_CLIENT_ELEMENTAL_REACTION_VALUES
} from './client-nodegraph/client_enum_binding.js'
import { snakeToCamel } from './client-nodegraph/client_nodes_codegen.js'

/** graph entry/exit nodes handled by the runtime, never exposed as methods */
const RUNTIME_INTERNAL_NODE_TYPES = new Set([
  'node_graph_begins',
  'node_graph_end_boolean',
  'node_graph_end_integer'
])

type GapEntry = { subType: string; nodeType: string; reason: string }
type ModeData = {
  graphs: Record<
    string,
    Record<'beyond' | 'classic', { status: string; genericIds: number[] }> & {
      entryGenericId: number
    }
  >
}
type FlowMetadata = {
  subTypes: string[]
  returns: Array<{ name: string }> | null
}
type StaticEnumMatchNode = {
  genericId: number
  pins: Array<{
    kind: string
    index: number
    variants?: Array<{ connectionType?: number }>
  }>
}
type ConcreteVariantNode = {
  genericId: number
  groups: Array<{
    graphType: number
    variants: Array<{ concreteId: number; bindings: number[][] }>
  }>
}
type EnumMatchSeed = {
  enumMatchCensus: {
    rows: Array<{ ioc: number; values: number[] }>
  }
}
type EditorEnumNames = {
  enums: Array<{
    id: number
    nameEn: string
    values: Array<{ value: number }>
  }>
}
const gaps: GapEntry[] = JSON.parse(
  fs.readFileSync('tests/client_generated/_generation_gaps.json', 'utf8')
)
const modeData = JSON.parse(fs.readFileSync('resources/client_node_modes.json', 'utf8')) as ModeData
const flowMetadata = JSON.parse(
  fs.readFileSync('resources/client_execution_flow_metadata.json', 'utf8')
) as FlowMetadata[]
const gapKeys = new Set(gaps.map((g) => `${g.subType}.${g.nodeType}`))
const methodNodeTypeBySubType = new Map<string, string>()
const methodNameBySubTypeAndNodeType = new Map<string, string>()
for (const item of CLIENT_NODE_METADATA) {
  const methodName = snakeToCamel(item.nodeType)
  methodNodeTypeBySubType.set(`${item.subType}.${methodName}`, item.nodeType)
  methodNameBySubTypeAndNodeType.set(`${item.subType}.${item.nodeType}`, methodName)
}

const metadataTypesBySubType = new Map<string, Set<string>>()
for (const item of CLIENT_NODE_METADATA) {
  const set = metadataTypesBySubType.get(item.subType) ?? new Set<string>()
  metadataTypesBySubType.set(item.subType, set)
  set.add(item.nodeType)
}

const errors: string[] = []
const expectedEntityHelperNames = new Set<string>()

const expectedZhAliases = {
  character_skill: {
    恢复生命值: 'recoverCharacterSHp',
    角色恢复生命值: 'recoverCharacterSHp'
  },
  creation_skill: {
    获取复杂造物当前释放的技能: 'getTheComplexCreationSCurrentUsingSkill',
    获取复杂造物当前施放的技能: 'getTheComplexCreationSCurrentUsingSkill'
  },
  creation_status: {
    查询字典中值组成的列表: 'getListOfValuesFromDictionary',
    获取字典中值组成的列表: 'getListOfValuesFromDictionary',
    查询字典中键组成的列表: 'getListOfKeysFromDictionary',
    获取字典中键组成的列表: 'getListOfKeysFromDictionary'
  },
  creation_status_decision: {
    查询字典中值组成的列表: 'getListOfValuesFromDictionary',
    获取字典中值组成的列表: 'getListOfValuesFromDictionary',
    查询字典中键组成的列表: 'getListOfKeysFromDictionary',
    获取字典中键组成的列表: 'getListOfKeysFromDictionary'
  }
} as const
for (const [subType, aliases] of Object.entries(expectedZhAliases)) {
  const generated = CLIENT_F_ZH_TO_EN_BY_SUB_TYPE[
    subType as keyof typeof CLIENT_F_ZH_TO_EN_BY_SUB_TYPE
  ] as Readonly<Record<string, string>>
  for (const [alias, method] of Object.entries(aliases)) {
    if (generated[alias] !== method) {
      errors.push(`missing client zh compatibility alias: ${subType}.${alias} -> ${method}`)
    }
  }
}

for (const [subType, bindingsByMode] of Object.entries(
  CLIENT_ENTITY_HELPER_BINDINGS_BY_SUB_TYPE_AND_MODE
)) {
  for (const mode of ['beyond', 'classic'] as const) {
    const availableMethods = CLIENT_NODE_METHODS_BY_SUB_TYPE_AND_MODE[
      subType as keyof typeof CLIENT_NODE_METHODS_BY_SUB_TYPE_AND_MODE
    ][mode] as readonly string[]
    const bindings = bindingsByMode[mode] as Record<
      string,
      { kind: 'method' | 'getter'; methodName: string; insertIndex: number | null }
    >
    for (const [helperName, binding] of Object.entries(bindings)) {
      expectedEntityHelperNames.add(helperName)
      if (!availableMethods.includes(binding.methodName)) {
        errors.push(
          `entity helper mode mismatch: ${subType}.${mode}.${helperName} -> ${binding.methodName}`
        )
      }
      if (helperName === 'set') {
        errors.push(`unsupported client entity set helper exposed: ${subType}.${mode}`)
      }
    }
    const customVariableUsesEntityReceiver =
      subType !== 'creation_status' && subType !== 'creation_status_decision'
    if (availableMethods.includes('getCustomVariable') && customVariableUsesEntityReceiver) {
      if (bindings.get?.methodName !== 'getCustomVariable') {
        errors.push(`missing client entity get alias: ${subType}.${mode}`)
      }
      if (bindings.getCustomVariable?.methodName !== 'getCustomVariable') {
        errors.push(`missing client entity getCustomVariable helper: ${subType}.${mode}`)
      }
    } else if (!customVariableUsesEntityReceiver) {
      if ('get' in bindings || 'getCustomVariable' in bindings) {
        errors.push(
          `TargetEntity custom variable must not become entity helper: ${subType}.${mode}`
        )
      }
    }
  }
}

const clientNodesSourceText = fs.readFileSync('src/definitions/client_nodes.ts', 'utf8')
const clientNodesSource = ts.createSourceFile(
  'client_nodes.ts',
  clientNodesSourceText,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS
)

const enumBinding = buildClientEnumBinding()
const staticMetadata = JSON.parse(
  fs.readFileSync('resources/client_node_static_metadata.json', 'utf8')
) as { nodes: StaticEnumMatchNode[] }
const concreteMetadata = JSON.parse(
  fs.readFileSync('resources/client_node_concrete_variants.json', 'utf8')
) as { nodes: ConcreteVariantNode[] }
const editorEnumNames = JSON.parse(
  fs.readFileSync('resources/mihoyo_editor_names.json', 'utf8')
) as EditorEnumNames
const officialEnumById = new Map(editorEnumNames.enums.map((entry) => [entry.id, entry]))
const enumMatchExpectations = [
  {
    genericId: 200005,
    graphTypes: [20001, 20002],
    seedPath: 'resources/client_enum_seed.character_skill.json',
    row42Class: 'PreAimingEndReason',
    row42ConnectionType: 210052
  },
  {
    genericId: 200178,
    graphTypes: [20007],
    seedPath: 'resources/client_enum_seed.creation_status.json',
    row42Class: 'TacticType',
    row42ConnectionType: 210051
  }
] as const

for (const expectation of enumMatchExpectations) {
  const node = staticMetadata.nodes.find(
    (candidate) => candidate.genericId === expectation.genericId
  )
  if (!node) {
    errors.push(`missing client enumeration_match static node ${expectation.genericId}`)
    continue
  }
  const inputVariants = [0, 1].map(
    (index) => node.pins.find((pin) => pin.kind === 'input' && pin.index === index)?.variants ?? []
  )
  for (const [index, variants] of inputVariants.entries()) {
    if (variants.length !== 43) {
      errors.push(
        `client enumeration_match ${expectation.genericId} input ${index} has ` +
          `${variants.length} variants instead of 43`
      )
    }
  }
  const connectionTypes = inputVariants.map((variants) =>
    variants.map((variant) => variant.connectionType)
  )
  if (JSON.stringify(connectionTypes[0]) !== JSON.stringify(connectionTypes[1])) {
    errors.push(`client enumeration_match ${expectation.genericId} input variants differ`)
  }
  if (connectionTypes[0]?.[42] !== expectation.row42ConnectionType) {
    errors.push(
      `client enumeration_match ${expectation.genericId} row 42 connection type is ` +
        `${connectionTypes[0]?.[42]} instead of ${expectation.row42ConnectionType}`
    )
  }

  const seed = JSON.parse(fs.readFileSync(expectation.seedPath, 'utf8')) as EnumMatchSeed
  const seedIocs = seed.enumMatchCensus.rows.map((row) => row.ioc)
  const expectedIocs = Array.from({ length: 43 }, (_, index) => index)
  if (JSON.stringify(seedIocs) !== JSON.stringify(expectedIocs)) {
    errors.push(`client enumeration_match seed IOC coverage is stale: ${expectation.seedPath}`)
  }
  for (const row of seed.enumMatchCensus.rows) {
    const connectionType = connectionTypes[0]?.[row.ioc]
    const officialEnum =
      connectionType === undefined ? undefined : officialEnumById.get(connectionType - 10000)
    if (!officialEnum) {
      errors.push(
        `client enumeration_match ${expectation.genericId} IOC ${row.ioc} ` +
          `has no official enum for connection type ${connectionType}`
      )
      continue
    }
    const officialValues = new Set(officialEnum.values.map((value) => value.value))
    const missingValues = row.values.filter(
      (value) =>
        !officialValues.has(value) &&
        !(row.ioc === 37 && LEGACY_CLIENT_ELEMENTAL_REACTION_VALUES.has(value))
    )
    if (missingValues.length) {
      errors.push(
        `client enumeration_match ${expectation.genericId} IOC ${row.ioc} ` +
          `does not match official ${officialEnum.nameEn}: ${missingValues.join(',')}`
      )
    }
  }

  const concreteNode = concreteMetadata.nodes.find(
    (candidate) => candidate.genericId === expectation.genericId
  )
  if (!concreteNode) {
    errors.push(`missing client enumeration_match concrete node ${expectation.genericId}`)
    continue
  }
  if (
    JSON.stringify(concreteNode.groups.map((group) => group.graphType).sort()) !==
    JSON.stringify([...expectation.graphTypes].sort())
  ) {
    errors.push(`client enumeration_match ${expectation.genericId} graph types differ`)
  }
  for (const group of concreteNode.groups) {
    if (group.variants.length !== 43) {
      errors.push(
        `client enumeration_match ${expectation.genericId}/${group.graphType} has ` +
          `${group.variants.length} concrete variants instead of 43`
      )
    }
    for (const [ioc, variant] of group.variants.entries()) {
      if (
        variant.concreteId !== 10 ||
        JSON.stringify(variant.bindings) !==
          JSON.stringify([
            [3, 0, ioc],
            [3, 1, ioc]
          ])
      ) {
        errors.push(
          `client enumeration_match ${expectation.genericId}/${group.graphType} ` +
            `has invalid concrete variant at IOC ${ioc}`
        )
      }
    }
  }

  const familyBinding = enumBinding.enumMatchByGenericId[expectation.genericId]
  if (!familyBinding?.classes.includes(expectation.row42Class)) {
    errors.push(
      `client enumeration_match ${expectation.genericId} misses ${expectation.row42Class}`
    )
  }
  const generatedClassKeys = ENUM_MATCH_CLASS_KEYS_BY_GENERIC_ID[expectation.genericId]
  if (
    !generatedClassKeys ||
    JSON.stringify([...generatedClassKeys].sort()) !==
      JSON.stringify([...familyBinding.classKeys].sort())
  ) {
    errors.push(`generated enum-match class keys are stale for generic ${expectation.genericId}`)
  }
}

const characterMatchClasses = enumBinding.enumMatchByGenericId[200005]?.classes ?? []
const statusMatchClasses = enumBinding.enumMatchByGenericId[200178]?.classes ?? []
const characterOnlyClasses = characterMatchClasses.filter(
  (className) => !statusMatchClasses.includes(className)
)
const statusOnlyClasses = statusMatchClasses.filter(
  (className) => !characterMatchClasses.includes(className)
)
if (
  JSON.stringify(characterOnlyClasses) !==
    JSON.stringify(['PreAimingEndReason', 'TypeConversionSame']) ||
  JSON.stringify(statusOnlyClasses) !==
    JSON.stringify(['CreationStatusTypeConversionSame', 'TacticType'])
) {
  errors.push(
    `client enumeration_match family difference is stale: ` +
      `200005-only=${characterOnlyClasses.join(',')}, 200178-only=${statusOnlyClasses.join(',')}`
  )
}
for (const [genericId, rowsByClass] of Object.entries(ENUM_MATCH_ROWS_BY_GENERIC_ID)) {
  for (const [classKey, rows] of Object.entries(rowsByClass)) {
    if (rows.some((row) => row.ioc < 0 || row.ioc > 42)) {
      errors.push(`generated enum-match rows out of range for ${genericId}/${classKey}`)
    }
  }
}

let enumMatchImplementationCount = 0
for (const statement of clientNodesSource.statements) {
  if (!ts.isClassDeclaration(statement) || !statement.name) continue
  const members = statement.members.filter(
    (member): member is ts.MethodDeclaration =>
      ts.isMethodDeclaration(member) &&
      ts.isIdentifier(member.name) &&
      member.name.text === 'enumerationMatch'
  )
  if (!members.length) continue
  const implementation = members.find((member) => member.body)
  if (!implementation) {
    errors.push(`client ${statement.name.text}.enumerationMatch has no implementation`)
    continue
  }
  enumMatchImplementationCount += 1
  const genericId = statement.name.text.includes('CreationStatus') ? 200178 : 200005
  const actualTypes = members
    .filter((member) => !member.body)
    .map((member) => member.parameters[0]?.type?.getText(clientNodesSource) ?? '<missing>')
    .sort()
  const expectedTypes = [...(enumBinding.enumMatchByGenericId[genericId]?.classes ?? [])].sort()
  if (JSON.stringify(actualTypes) !== JSON.stringify(expectedTypes)) {
    errors.push(
      `client ${statement.name.text}.enumerationMatch overloads differ from generic ${genericId}`
    )
  }
}
if (enumMatchImplementationCount !== 7) {
  errors.push(
    `expected 7 client enumerationMatch implementations, got ${enumMatchImplementationCount}`
  )
}

let tacticalContextMethodCount = 0
let tacticGroundPursuitMethodCount = 0
function checkTacticalContextDocs(node: ts.Node): void {
  if (
    ts.isMethodDeclaration(node) &&
    ts.isIdentifier(node.name) &&
    node.name.text === 'tacticGroundPursuit'
  ) {
    tacticGroundPursuitMethodCount += 1
    const actual = node.parameters.map((parameter) => parameter.name.getText(clientNodesSource))
    const expected = [
      'execute',
      'minimumPursuitTriggerDistance',
      'maximumPursuitTriggerDistance',
      'stopPursuitDistance',
      'outerRingPursuitSpeed',
      'innerRingRadius',
      'innerRingPursuitSpeed',
      'singlePursuitDuration',
      'tacticalInstanceCD',
      'tacticalContext',
      'canSkillBeInterrupted'
    ]
    if (actual.join(',') !== expected.join(',')) {
      errors.push(
        `tacticGroundPursuit parameter names mismatch: actual=${actual.join(',')} expected=${expected.join(',')}`
      )
    }
  }

  if (
    (ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) &&
    ((ts.isIdentifier(node.name) && node.name.text === 'tacticGroundPursuit') ||
      node.parameters.some(
        (parameter) => ts.isIdentifier(parameter.name) && parameter.name.text === 'tacticalContext'
      ))
  ) {
    tacticalContextMethodCount += 1
    const source = node.getFullText(clientNodesSource)
    if (
      !source.includes('GSTS Note: Tactical Context is only text used as an identifier') ||
      !source.includes('GSTS 注: 【战术上下文】只是一段用于标识并随战术传递的数据文本') ||
      !source.includes('可以留空') ||
      !source.includes('When Execute is false, this tactic is treated as failed') ||
      !source.includes('当【是否执行】为 false 时，该战术等同于执行失败')
    ) {
      errors.push(`tacticalContext JSDoc incomplete: ${node.name.getText(clientNodesSource)}`)
    }
  }
  ts.forEachChild(node, checkTacticalContextDocs)
}
checkTacticalContextDocs(clientNodesSource)
if (tacticalContextMethodCount === 0) {
  errors.push('no generated tacticalContext parameters found')
}
if (tacticGroundPursuitMethodCount !== 1) {
  errors.push(`expected one tacticGroundPursuit method, got ${tacticGroundPursuitMethodCount}`)
}

function checkMultiReturnFieldDocs(
  member: ts.MethodDeclaration | ts.MethodSignature,
  source: ts.SourceFile,
  label: string
): number {
  if (!member.type || !ts.isTypeLiteralNode(member.type)) return 0
  const fields = member.type.members.filter(ts.isPropertySignature)
  if (fields.length < 2) return 0
  for (const field of fields) {
    const name = field.name?.getText(source) ?? '<unknown>'
    const jsDoc = ts
      .getJSDocCommentsAndTags(field)
      .find((node): node is ts.JSDoc => node.kind === ts.SyntaxKind.JSDocComment)
    if (!jsDoc) {
      errors.push(`client multi-return field missing JSDoc: ${label}.${name}`)
      continue
    }
    if (!/[\u3400-\u9fff]/u.test(jsDoc.getFullText(source))) {
      errors.push(`client multi-return field missing Chinese JSDoc: ${label}.${name}`)
    }
  }
  const methodJsDoc = ts
    .getJSDocCommentsAndTags(member)
    .find((node): node is ts.JSDoc => node.kind === ts.SyntaxKind.JSDocComment)
  const returnTag = methodJsDoc?.tags?.find(
    (tag): tag is ts.JSDocReturnTag => tag.kind === ts.SyntaxKind.JSDocReturnTag
  )
  const returnComment =
    typeof returnTag?.comment === 'string' ? returnTag.comment.trim() : undefined
  const firstFieldName = fields[0]?.name?.getText(source)
  if (returnComment && firstFieldName && returnComment.startsWith(firstFieldName)) {
    errors.push(`client multi-return method has a redundant field-list @returns: ${label}`)
  }
  return fields.length
}

const publicClientMethodNames = new Set(
  Object.values(CLIENT_NODE_METHODS_BY_SUB_TYPE).flatMap((methods) => methods as readonly string[])
)
let generatedMultiReturnMethodCount = 0
let generatedMultiReturnFieldCount = 0
for (const statement of clientNodesSource.statements) {
  if (!ts.isClassDeclaration(statement) || !statement.name) continue
  for (const member of statement.members) {
    if (
      ts.isMethodDeclaration(member) &&
      ts.isIdentifier(member.name) &&
      publicClientMethodNames.has(member.name.text)
    ) {
      const fieldCount = checkMultiReturnFieldDocs(
        member,
        clientNodesSource,
        `${statement.name.text}.${member.name.text}`
      )
      if (member.body && fieldCount) {
        generatedMultiReturnMethodCount += 1
        generatedMultiReturnFieldCount += fieldCount
      }
    }
  }
}
const expectedMultiReturnMethodCount = flowMetadata
  .filter((entry) => (entry.returns?.length ?? 0) > 1)
  .reduce((count, entry) => count + entry.subTypes.length, 0)
if (generatedMultiReturnMethodCount !== expectedMultiReturnMethodCount) {
  errors.push(
    `client multi-return method coverage mismatch: actual=${generatedMultiReturnMethodCount} ` +
      `expected=${expectedMultiReturnMethodCount}`
  )
}

const statusClassNames = {
  creation_status: 'ClientCreationStatusExecutionFlowFunctions',
  creation_status_decision: 'ClientCreationStatusDecisionExecutionFlowFunctions'
} as const
for (const [subType, className] of Object.entries(statusClassNames)) {
  const classDeclaration = clientNodesSource.statements.find(
    (statement): statement is ts.ClassDeclaration =>
      ts.isClassDeclaration(statement) && statement.name?.text === className
  )
  if (!classDeclaration) {
    errors.push(`missing generated status class: ${className}`)
    continue
  }

  for (const item of CLIENT_NODE_METADATA) {
    if (item.subType !== subType) continue
    const outFlowCount = item.flows?.filter((pin) => pin.kind === 'out_flow').length ?? 0
    const requiresFailureNote = outFlowCount === 1
    const requiresTerminalNote = item.nodeType === 'continue_executing_previous_frame_behavior'
    if (!requiresFailureNote && !requiresTerminalNote) continue

    const methodName = methodNameBySubTypeAndNodeType.get(`${subType}.${item.nodeType}`)
    if (!methodName) {
      errors.push(`missing generated status method mapping: ${subType}.${item.nodeType}`)
      continue
    }
    const member = classDeclaration.members.find(
      (candidate) =>
        ts.isMethodDeclaration(candidate) &&
        ts.isIdentifier(candidate.name) &&
        candidate.name.text === methodName
    )
    if (!member) {
      errors.push(`missing generated status method for JSDoc check: ${subType}.${methodName}`)
      continue
    }
    const source = member.getFullText(clientNodesSource)
    if (
      requiresFailureNote &&
      (!source.includes('GSTS Note: This is intentionally different') ||
        !source.includes('GSTS 注: 这是一个容易误解的特殊行为') ||
        !source.includes('只有前面的行为执行失败，才会执行后面的语句'))
    ) {
      errors.push(`status failure-flow JSDoc incomplete: ${subType}.${methodName}`)
    }
    if (
      requiresTerminalNote &&
      (!source.includes('GSTS Note: This node has no successor execution output') ||
        !source.includes('If used, it must be the final statement') ||
        !source.includes('若使用本节点，它必须作为当前执行分支的最后一条语句'))
    ) {
      errors.push(`status terminal-flow JSDoc incomplete: ${subType}.${methodName}`)
    }
    if (
      item.nodeType === 'switch_to_self_execution_status' &&
      (!source.includes('Autonomous Logic Parameter ID is used only') ||
        !source.includes('Creation Properties panel') ||
        !source.includes('connect conditions to the [Execute] inputs') ||
        !source.includes('select different Status Node Graph Configuration IDs') ||
        !source.includes('仅用于切换造物属性面板中配置的自主逻辑') ||
        !source.includes('将不同条件连接到各行为节点的') ||
        !source.includes('选择不同的【状态节点图配置ID】'))
    ) {
      errors.push(`status-switch autonomous-logic JSDoc incomplete: ${subType}.${methodName}`)
    }
  }
}

const entityHelperInterface = clientNodesSource.statements.find(
  (statement): statement is ts.InterfaceDeclaration =>
    ts.isInterfaceDeclaration(statement) && statement.name.text === 'ClientEntityHelperMethods'
)
if (!entityHelperInterface) {
  errors.push('missing ClientEntityHelperMethods interface')
} else {
  const documentedNames = new Set<string>()
  for (const member of entityHelperInterface.members) {
    if (!member.name || !ts.isIdentifier(member.name)) {
      errors.push('client entity helper has an unsupported member name')
      continue
    }
    const helperName = member.name.text
    documentedNames.add(helperName)
    const jsDoc = ts
      .getJSDocCommentsAndTags(member)
      .find((node): node is ts.JSDoc => node.kind === ts.SyntaxKind.JSDocComment)
    if (!jsDoc) {
      errors.push(`client entity helper missing JSDoc: ${helperName}`)
      continue
    }
    if (ts.isMethodSignature(member)) {
      checkMultiReturnFieldDocs(
        member,
        clientNodesSource,
        `ClientEntityHelperMethods.${helperName}`
      )
      const actualParams = member.parameters.map((parameter) =>
        parameter.name.getText(clientNodesSource)
      )
      const documentedParams: string[] = []
      for (const tag of jsDoc.tags ?? []) {
        if (tag.kind === ts.SyntaxKind.JSDocParameterTag) {
          documentedParams.push((tag as ts.JSDocParameterTag).name.getText(clientNodesSource))
        }
      }
      if (actualParams.join('|') !== documentedParams.join('|')) {
        errors.push(
          `client entity helper JSDoc params mismatch: ${helperName} ` +
            `(${documentedParams.join(', ') || 'none'} vs ${actualParams.join(', ') || 'none'})`
        )
      }
    }
    const returnsValue =
      ts.isPropertySignature(member) ||
      (ts.isMethodSignature(member) && member.type?.kind !== ts.SyntaxKind.VoidKeyword)
    const hasReturnDoc = (jsDoc.tags ?? []).some((tag) => tag.kind === ts.SyntaxKind.JSDocReturnTag)
    const hasDocumentedReturnFields =
      ts.isMethodSignature(member) &&
      member.type !== undefined &&
      ts.isTypeLiteralNode(member.type) &&
      member.type.members.filter(ts.isPropertySignature).length > 1
    if (returnsValue && !hasReturnDoc && !hasDocumentedReturnFields) {
      errors.push(`client entity helper missing @returns JSDoc: ${helperName}`)
    }
  }
  for (const helperName of expectedEntityHelperNames) {
    if (!documentedNames.has(helperName)) {
      errors.push(`client entity helper missing documented signature: ${helperName}`)
    }
  }
  for (const helperName of documentedNames) {
    if (!expectedEntityHelperNames.has(helperName)) {
      errors.push(`client entity helper documented but not bound: ${helperName}`)
    }
  }
}

let methodCount = 0

for (const item of CLIENT_NODE_METADATA) {
  const graph = modeData.graphs[item.subType]
  for (const mode of ['beyond', 'classic'] as const) {
    const expected =
      graph[mode].status === 'available' &&
      (item.genericId === graph.entryGenericId || graph[mode].genericIds.includes(item.genericId))
    const actual = (
      CLIENT_NODE_TYPES_BY_SUB_TYPE_AND_MODE[item.subType][mode] as readonly string[]
    ).includes(item.nodeType)
    if (actual !== expected) {
      errors.push(
        `node mode mismatch: ${item.subType}.${item.nodeType} (${item.genericId}) ${mode}`
      )
    }
  }
}

// 1. every generated method maps to a metadata record within its subType, and
// 3. no Chinese-typed record is exposed as a method
const methodNodeTypesBySubType = new Map<string, Set<string>>()
for (const [subType, methods] of Object.entries(CLIENT_NODE_METHODS_BY_SUB_TYPE)) {
  const nodeTypes = metadataTypesBySubType.get(subType)
  const exposed = new Set<string>()
  methodNodeTypesBySubType.set(subType, exposed)
  for (const method of methods as readonly string[]) {
    methodCount += 1
    const nodeType = methodNodeTypeBySubType.get(`${subType}.${method}`)
    if (!nodeType) {
      errors.push(`missing stable method mapping: ${subType}.${method}`)
      continue
    }
    exposed.add(nodeType)
    if (!nodeTypes?.has(nodeType))
      errors.push(`missing metadata: ${subType}.${method} -> ${nodeType}`)
    if (/[\u3400-\u9fff]/.test(nodeType))
      errors.push(`chinese nodeType exposed: ${subType}.${method}`)
    const expectedMethod = snakeToCamel(nodeType)
    if (method !== expectedMethod) {
      errors.push(
        `client method does not retain stable nodeType name: ${subType}.${method} != ${expectedMethod}`
      )
    }
    for (const mode of ['beyond', 'classic'] as const) {
      const methodAvailable = (
        CLIENT_NODE_METHODS_BY_SUB_TYPE_AND_MODE[
          subType as keyof typeof CLIENT_NODE_METHODS_BY_SUB_TYPE_AND_MODE
        ][mode] as readonly string[]
      ).includes(method)
      const nodeAvailable = (
        CLIENT_NODE_TYPES_BY_SUB_TYPE_AND_MODE[
          subType as keyof typeof CLIENT_NODE_TYPES_BY_SUB_TYPE_AND_MODE
        ][mode] as readonly string[]
      ).includes(nodeType)
      if (methodAvailable !== nodeAvailable) {
        errors.push(`method mode mismatch: ${subType}.${method} ${mode}`)
      }
    }
  }
}

// 2. every non-start, non-internal metadata record is either generated or a reported gap
for (const item of CLIENT_NODE_METADATA) {
  if (item.isStart || RUNTIME_INTERNAL_NODE_TYPES.has(item.nodeType)) continue
  if (/[\u3400-\u9fff]/.test(item.nodeType)) continue // unresolved zh names never generate
  if (methodNodeTypesBySubType.get(item.subType)?.has(item.nodeType)) continue
  if (gapKeys.has(`${item.subType}.${item.nodeType}`)) continue
  errors.push(`record neither generated nor gap-reported: ${item.subType}.${item.nodeType}`)
}

if (errors.length) {
  throw new Error(`client definitions inconsistent:\n${errors.join('\n')}`)
}

console.log(
  `[ok] client definitions consistency (${methodCount} method entries across ` +
    `${metadataTypesBySubType.size} sub types, ${generatedMultiReturnMethodCount} multi-return ` +
    `methods / ${generatedMultiReturnFieldCount} documented fields, ${gapKeys.size} reported gaps)`
)
