import fs from 'node:fs'

import ts from 'typescript'

import { CLIENT_NODE_METHODS_BY_SUB_TYPE } from '../../src/definitions/client_method_modes.js'
import {
  CharacterSkillSlot,
  ClassSwitchSkillHandling,
  ColorBlendType,
  ColorOverlayType,
  ExistingSkillHandling,
  FillMaterial,
  FixedMotionParameterType,
  FixedPointMotionDeviceMotionType,
  FixedPointMotionDeviceParameterConversionType,
  GameplayMode,
  MovementMode,
  OriginalSlotSkillHandling,
  ScanRuleType,
  ScanScoringRules,
  SettlementStatus,
  TopOfStackSkillDestructionType
} from '../../src/definitions/enum.js'
import { CLIENT_ENUM_VALUES } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_enum_values.js'
import { CLIENT_NODE_METADATA } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.js'
import {
  ENUM_ID,
  ENUM_ID_CLIENT,
  ENUM_VALUE
} from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/enum_id.js'
import { NODE_ID } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_id.js'
import { NODE_PIN_RECORDS } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_pin_records.js'
import { LEGACY_CLIENT_ELEMENTAL_REACTION_VALUES } from '../client-nodegraph/client_enum_binding.js'
import { editorNameToMethodName, snakeToCamel } from '../client-nodegraph/client_nodes_codegen.js'

type OfficialNode = {
  genericId: number
  nameZh?: string
  nameEn?: string
  pins: Array<{
    kind: string
    index: number
    nameEn?: string
  }>
}

type OfficialEnum = {
  id: number
  nameZh?: string
  nameEn?: string
  values: Array<{
    value: number
    nameZh?: string
    nameEn?: string
  }>
}

type OfficialNames = {
  summary: {
    nodes: number
    enums: number
    enumValues: number
    unknownZh: number
    unknownEn: number
  }
  nodes: OfficialNode[]
  enums: OfficialEnum[]
}

type ClientFlowMetadata = {
  methodName: string
  nodeType: string
  subTypes: string[]
  params: Array<{ name: string }>
  returns: Array<{ name: string }> | null
}

const NAMES_PATH = 'resources/mihoyo_editor_names.json'
const CLIENT_FLOW_METADATA_PATH = 'resources/client_execution_flow_metadata.json'
const CLIENT_NODES_PATH = 'src/definitions/client_nodes.ts'
const CLIENT_CLASS_NAME_BY_SUB_TYPE: Record<string, string> = {
  character_skill: 'ClientCharacterSkillExecutionFlowFunctions',
  character_control_skill: 'ClientCharacterControlSkillExecutionFlowFunctions',
  creation_skill: 'ClientCreationSkillExecutionFlowFunctions',
  creation_status: 'ClientCreationStatusExecutionFlowFunctions',
  creation_status_decision: 'ClientCreationStatusDecisionExecutionFlowFunctions',
  bool_filter: 'ClientBoolFilterExecutionFlowFunctions',
  int_filter: 'ClientIntFilterExecutionFlowFunctions'
}
const HIDDEN_SERVER_NODE_IDS_WITHOUT_VENDOR_KEY = new Set([100000])
const NON_EDITOR_ENUM_ID_KEYS = new Set([
  'Generic',
  'LocalVariable',
  'VariableSnapshot',
  'Scan_Rule_Type',
  'Rank_Settlement_Status',
  'Damage_Pop_Up_Type',
  'Original_Slot_Skill_Handling',
  'Existing_Skill_Handling'
])
const NON_EDITOR_CLIENT_ENUM_ID_KEYS = new Set(['Generic', 'Trigger_Restriction'])

function normalizedIdentifier(value: string) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function normalizedEnumValueLabel(value: string) {
  const separator = value.lastIndexOf('_')
  return normalizedIdentifier(separator >= 0 ? value.slice(separator + 1) : value)
}

function officialClientNodeType(name: string) {
  const snake = name
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
  return /^\d/.test(snake) ? `_${snake}` : snake
}

function assertNoErrors(errors: string[]) {
  if (!errors.length) return
  throw new Error(`[error] mihoyo editor name audit failed:\n- ${errors.join('\n- ')}`)
}

function escapedRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hasEditorLabel(source: string, label: string) {
  return new RegExp(`^\\s*\\*\\s+${escapedRegExp(label)}(?::|\\s*$)`, 'm').test(source)
}

function jsDocTagSection(source: string, marker: string) {
  const start = source.indexOf(marker)
  if (start < 0) return ''
  const rest = source.slice(start + marker.length)
  const next = rest.search(/\r?\n\s*\*\s+@(?:param|returns)\b|\r?\n\s*\*\//)
  return source.slice(start, next < 0 ? source.length : start + marker.length + next)
}

function main() {
  const names = JSON.parse(fs.readFileSync(NAMES_PATH, 'utf8')) as OfficialNames
  const errors: string[] = []
  const officialNodeById = new Map(names.nodes.map((node) => [node.genericId, node]))

  if (names.summary.unknownZh || names.summary.unknownEn) {
    errors.push(
      `unknown TextMap hashes: zh=${names.summary.unknownZh}, en=${names.summary.unknownEn}`
    )
  }

  let serverNodes = 0
  const serverIdsWithoutVendorKey: number[] = []
  const serverLegacyIdentifiers: Array<{ id: number; name: string }> = []
  const vendorKeysById = new Map<number, string[]>()
  for (const [key, id] of Object.entries(NODE_ID)) {
    const keys = vendorKeysById.get(id) ?? []
    keys.push(key)
    vendorKeysById.set(id, keys)
  }

  for (const record of NODE_PIN_RECORDS) {
    if (record.id >= 200000) continue
    serverNodes += 1
    const official = officialNodeById.get(record.id)
    if (!official?.nameEn) {
      errors.push(`server node ${record.id} has no extracted English name`)
      continue
    }
    if (record.name !== official.nameEn) {
      errors.push(
        `server node ${record.id} display name ${JSON.stringify(record.name)} != ` +
          JSON.stringify(official.nameEn)
      )
    }

    const keys = vendorKeysById.get(record.id) ?? []
    if (!keys.length && !HIDDEN_SERVER_NODE_IDS_WITHOUT_VENDOR_KEY.has(record.id)) {
      serverIdsWithoutVendorKey.push(record.id)
    }
    const officialKey = normalizedIdentifier(official.nameEn)
    if (!keys.some((key) => normalizedIdentifier(key.split('__')[0]) === officialKey)) {
      serverLegacyIdentifiers.push({ id: record.id, name: official.nameEn })
    }
  }
  if (serverIdsWithoutVendorKey.length) {
    errors.push(`server nodes without NODE_ID keys: ${serverIdsWithoutVendorKey.join(', ')}`)
  }

  const clientLegacyIdentifiers = new Map<number, { name: string; current: Set<string> }>()
  const stableClientMethodsBySubType = new Map<string, Set<string>>()
  for (const metadata of CLIENT_NODE_METADATA) {
    const official = officialNodeById.get(metadata.genericId)
    if (!official?.nameZh || !official.nameEn) {
      errors.push(`client node ${metadata.genericId} has incomplete extracted names`)
      continue
    }
    if (metadata.displayName !== official.nameZh) {
      errors.push(
        `client node ${metadata.genericId} display name ${JSON.stringify(metadata.displayName)} != ` +
          JSON.stringify(official.nameZh)
      )
    }
    if (metadata.nodeType !== officialClientNodeType(official.nameEn)) {
      const existing = clientLegacyIdentifiers.get(metadata.genericId) ?? {
        name: official.nameEn,
        current: new Set<string>()
      }
      existing.current.add(metadata.nodeType)
      clientLegacyIdentifiers.set(metadata.genericId, existing)
    }
    const methods = stableClientMethodsBySubType.get(metadata.subType) ?? new Set<string>()
    methods.add(snakeToCamel(metadata.nodeType))
    stableClientMethodsBySubType.set(metadata.subType, methods)
  }

  let clientMethodEntries = 0
  for (const [subType, methods] of Object.entries(CLIENT_NODE_METHODS_BY_SUB_TYPE)) {
    const stableMethods = stableClientMethodsBySubType.get(subType) ?? new Set<string>()
    for (const method of methods as readonly string[]) {
      clientMethodEntries += 1
      if (!stableMethods.has(method)) {
        errors.push(`${subType}.${method} does not match any stable client nodeType`)
      }
    }
  }

  const clientFlowMetadata = JSON.parse(
    fs.readFileSync(CLIENT_FLOW_METADATA_PATH, 'utf8')
  ) as ClientFlowMetadata[]
  const clientMetadataByKey = new Map(
    CLIENT_NODE_METADATA.map((metadata) => [`${metadata.subType}:${metadata.nodeType}`, metadata])
  )
  const clientNodesSource = fs.readFileSync(CLIENT_NODES_PATH, 'utf8')
  const clientNodesSourceFile = ts.createSourceFile(
    CLIENT_NODES_PATH,
    clientNodesSource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  const subTypeByClientClassName = new Map(
    Object.entries(CLIENT_CLASS_NAME_BY_SUB_TYPE).map(([subType, className]) => [
      className,
      subType
    ])
  )
  const clientMethodSourceByKey = new Map<
    string,
    { source: string; returnFields: Map<string, string> }
  >()
  for (const statement of clientNodesSourceFile.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) continue
    const subType = subTypeByClientClassName.get(statement.name.text)
    if (!subType) continue
    for (const member of statement.members) {
      if (!ts.isMethodDeclaration(member) || !ts.isIdentifier(member.name)) continue
      const key = `${subType}:${member.name.text}`
      const current = clientMethodSourceByKey.get(key) ?? {
        source: '',
        returnFields: new Map<string, string>()
      }
      current.source += member.getFullText(clientNodesSourceFile)
      if (member.type && ts.isTypeLiteralNode(member.type)) {
        for (const field of member.type.members) {
          if (!ts.isPropertySignature(field) || !field.name) continue
          current.returnFields.set(
            field.name.getText(clientNodesSourceFile),
            field.getFullText(clientNodesSourceFile)
          )
        }
      }
      clientMethodSourceByKey.set(key, current)
    }
  }
  let checkedClientPinNames = 0
  let alignedClientPinNames = 0
  let clientPinCompatibilityComments = 0
  let clientOfficialTitleComments = 0
  const clientPinAliases: Array<{
    subType: string
    methodName: string
    kind: 'parameter' | 'return'
    apiName: string
    officialName: string
    nodeId: number
    pinIndex: number
  }> = []
  for (const flow of clientFlowMetadata) {
    const stableMethodName = snakeToCamel(flow.nodeType)
    if (flow.methodName !== stableMethodName) {
      errors.push(
        `client ${flow.subTypes.join('/')}.${flow.methodName} must retain stable method name ` +
          stableMethodName
      )
    }
    for (const subType of flow.subTypes) {
      const metadata = clientMetadataByKey.get(`${subType}:${flow.nodeType}`)
      if (!metadata) continue
      const official = officialNodeById.get(metadata.genericId)
      if (!official) continue
      const methodSource = clientMethodSourceByKey.get(`${subType}:${flow.methodName}`)
      if (!methodSource) {
        errors.push(`missing generated client method source: ${subType}.${flow.methodName}`)
        continue
      }
      if (
        official.nameEn &&
        official.nameZh &&
        editorNameToMethodName(official.nameEn) !== flow.methodName
      ) {
        clientOfficialTitleComments += 1
        const comment = new RegExp(
          `\\* ${escapedRegExp(official.nameEn)}\\r?\\n` +
            `   \\*\\r?\\n` +
            `   \\* ${escapedRegExp(official.nameZh)}(?::|\\r?\\n)`
        )
        if (!comment.test(methodSource.source)) {
          errors.push(
            `client ${subType}.${flow.methodName} is missing official title comment ` +
              JSON.stringify(official.nameEn)
          )
        }
      }
      const argumentPins = metadata.argPins ?? flow.params.map((_, index) => index)
      flow.params.forEach((param, argumentIndex) => {
        const pinIndex = argumentPins[argumentIndex]
        const officialName = official.pins.find(
          (pin) => pin.kind === 'input' && pin.index === pinIndex
        )?.nameEn
        if (!officialName) return
        checkedClientPinNames += 1
        if (normalizedIdentifier(param.name) === normalizedIdentifier(officialName)) {
          alignedClientPinNames += 1
          return
        }
        clientPinCompatibilityComments += 1
        clientPinAliases.push({
          subType,
          methodName: flow.methodName,
          kind: 'parameter',
          apiName: param.name,
          officialName,
          nodeId: metadata.genericId,
          pinIndex
        })
        const section = jsDocTagSection(methodSource.source, `@param ${param.name}`)
        if (!hasEditorLabel(section, officialName)) {
          errors.push(
            `client ${subType}.${flow.methodName} parameter ${param.name} is missing ` +
              `${JSON.stringify(officialName)} in JSDoc (node ${metadata.genericId} input ${pinIndex})`
          )
        }
      })
      flow.returns?.forEach((value, outputIndex) => {
        const officialName = official.pins.find(
          (pin) => pin.kind === 'output' && pin.index === outputIndex
        )?.nameEn
        if (!officialName) return
        checkedClientPinNames += 1
        if (normalizedIdentifier(value.name) === normalizedIdentifier(officialName)) {
          alignedClientPinNames += 1
        } else {
          clientPinCompatibilityComments += 1
          clientPinAliases.push({
            subType,
            methodName: flow.methodName,
            kind: 'return',
            apiName: value.name,
            officialName,
            nodeId: metadata.genericId,
            pinIndex: outputIndex
          })
        }
        const section =
          (flow.returns?.length ?? 0) > 1
            ? (methodSource.returnFields.get(value.name) ?? '')
            : jsDocTagSection(methodSource.source, '@returns')
        if (
          ((flow.returns?.length ?? 0) > 1 ||
            normalizedIdentifier(value.name) !== normalizedIdentifier(officialName)) &&
          !hasEditorLabel(section, officialName)
        ) {
          errors.push(
            `client ${subType}.${flow.methodName} return ${value.name} is missing ` +
              `${JSON.stringify(officialName)} in JSDoc (node ${metadata.genericId} output ${outputIndex})`
          )
        }
      })
    }
  }

  const allOfficialEnumValues = new Set(
    names.enums.flatMap((enumRecord) => enumRecord.values.map((value) => value.value))
  )
  const missingServerEnumValues = Object.entries(ENUM_VALUE).filter(
    ([, value]) => !allOfficialEnumValues.has(value)
  )
  if (missingServerEnumValues.length) {
    errors.push(
      `ENUM_VALUE entries absent from BeyondGlobal: ` +
        missingServerEnumValues.map(([key, value]) => `${key}=${value}`).join(', ')
    )
  }

  const officialEnumLabelsByValue = new Map<number, string[]>()
  for (const enumRecord of names.enums) {
    for (const value of enumRecord.values) {
      if (!value.nameEn) continue
      const labels = officialEnumLabelsByValue.get(value.value) ?? []
      labels.push(value.nameEn)
      officialEnumLabelsByValue.set(value.value, labels)
    }
  }
  const enumKeysByValue = new Map<number, string[]>()
  for (const [key, value] of Object.entries(ENUM_VALUE)) {
    const keys = enumKeysByValue.get(value) ?? []
    keys.push(key)
    enumKeysByValue.set(value, keys)
  }
  const enumValuesWithoutOfficialLabelAlias = [...enumKeysByValue]
    .filter(([value]) => value !== 0 && value !== 1)
    .filter(([value, keys]) => {
      const labels = officialEnumLabelsByValue.get(value) ?? []
      return !keys.some((key) =>
        labels.some((label) => normalizedEnumValueLabel(key) === normalizedEnumValueLabel(label))
      )
    })
  if (enumValuesWithoutOfficialLabelAlias.length) {
    errors.push(
      `ENUM_VALUE values without a current official English label alias: ` +
        enumValuesWithoutOfficialLabelAlias
          .map(([value, keys]) => `${value} (${keys.join('/')})`)
          .join(', ')
    )
  }

  const officialClientEnumValues = new Set(
    names.enums
      .filter((enumRecord) => enumRecord.id >= 200000)
      .flatMap((enumRecord) => enumRecord.values.map((value) => value.value))
  )
  const missingClientEnumValues = Object.entries(CLIENT_ENUM_VALUES).filter(
    ([key, value]) =>
      !officialClientEnumValues.has(value) &&
      !(
        key.startsWith('elemental_reaction_type_') &&
        LEGACY_CLIENT_ELEMENTAL_REACTION_VALUES.has(value)
      )
  )
  if (missingClientEnumValues.length) {
    errors.push(
      `CLIENT_ENUM_VALUES entries absent from BeyondGlobal client enums: ` +
        missingClientEnumValues.map(([key, value]) => `${key}=${value}`).join(', ')
    )
  }

  const officialNameEnumIdAliases = {
    Fixed_Point_Motion_Device_Motion_Type: 1042,
    Fixed_Point_Motion_Device_Parameter_Conversion_Type: 1043,
    Color_Blend_Type: 42,
    Fill_Material: 43,
    Top_of_Stack_Skill_Destruction_Type: 52,
    Class_Switch_Skill_Handling: 53,
    Scan_Scoring_Rules: 50,
    Random_Order: 54
  } as const
  for (const [key, value] of Object.entries(officialNameEnumIdAliases)) {
    if (ENUM_ID[key as keyof typeof ENUM_ID] !== value) {
      errors.push(`official-name ENUM_ID alias ${key} != ${value}`)
    }
  }

  const officialNameEnumValueAliases = {
    SkillSlot_SprintSkill: 3102,
    TopOfStackSkillDestructionType_PreserveSlotBinding: 2811,
    TopOfStackSkillDestructionType_RemoveSlotBinding: 2812,
    ClassSwitchSkillHandling_PreserveUnrelatedSkills: 2821,
    ColorBlendType_Override: 6700,
    ColorBlendType_Multiply: 6701,
    FillMaterial_Freeze: 6710,
    FillMaterial_Petrification: 6711,
    RandomOrder_Random: 602,
    RankSettlementStatus_Escape: 4103
  } as const
  for (const [key, value] of Object.entries(officialNameEnumValueAliases)) {
    if (ENUM_VALUE[key as keyof typeof ENUM_VALUE] !== value) {
      errors.push(`official-name ENUM_VALUE alias ${key} != ${value}`)
    }
  }

  if (
    ColorBlendType !== ColorOverlayType ||
    ColorBlendType.Override !== ColorOverlayType.Overwrite ||
    FillMaterial.Freeze !== FillMaterial.Frozen ||
    FillMaterial.Petrification !== FillMaterial.Petrified ||
    FixedPointMotionDeviceMotionType !== MovementMode ||
    FixedPointMotionDeviceParameterConversionType !== FixedMotionParameterType ||
    TopOfStackSkillDestructionType !== OriginalSlotSkillHandling ||
    ClassSwitchSkillHandling !== ExistingSkillHandling ||
    ScanScoringRules !== ScanRuleType
  ) {
    errors.push('public authoritative enum aliases are not preserving legacy enum instances')
  }
  if (
    CharacterSkillSlot.SprintSkill !== CharacterSkillSlot.DashSkill ||
    TopOfStackSkillDestructionType.PreserveSlotBinding !==
      OriginalSlotSkillHandling.KeepSlotRelation ||
    TopOfStackSkillDestructionType.RemoveSlotBinding !==
      OriginalSlotSkillHandling.DetachFromSlotRelation ||
    ClassSwitchSkillHandling.PreserveUnrelatedSkills !==
      ExistingSkillHandling.KeepIrrelevantSkills ||
    SettlementStatus.TBC !== SettlementStatus.Undefined ||
    SettlementStatus.Failed !== SettlementStatus.Defeat ||
    GameplayMode.TestPlay !== GameplayMode.Play
  ) {
    errors.push('public authoritative enum value aliases are not preserving legacy values')
  }

  const officialServerEnumNames = new Set(
    names.enums
      .filter((enumRecord) => enumRecord.id < 200000 && enumRecord.nameEn)
      .map((enumRecord) => normalizedIdentifier(enumRecord.nameEn!))
  )
  const serverLegacyEnumNames = Object.keys(ENUM_ID).filter(
    (key) =>
      !NON_EDITOR_ENUM_ID_KEYS.has(key) && !officialServerEnumNames.has(normalizedIdentifier(key))
  )

  const officialClientEnumNames = new Set(
    names.enums
      .filter((enumRecord) => enumRecord.id >= 200000 && enumRecord.nameEn)
      .map((enumRecord) => normalizedIdentifier(enumRecord.nameEn!))
  )
  const clientLegacyEnumNames = Object.keys(ENUM_ID_CLIENT).filter(
    (key) =>
      !NON_EDITOR_CLIENT_ENUM_ID_KEYS.has(key) &&
      !officialClientEnumNames.has(normalizedIdentifier(key))
  )
  const uniqueClientPinAliases = new Map<
    string,
    (typeof clientPinAliases)[number] & { subTypes: string[] }
  >()
  for (const entry of clientPinAliases) {
    const key = [
      entry.nodeId,
      entry.pinIndex,
      entry.methodName,
      entry.kind,
      entry.apiName,
      entry.officialName
    ].join(':')
    const existing = uniqueClientPinAliases.get(key)
    if (existing) {
      if (!existing.subTypes.includes(entry.subType)) existing.subTypes.push(entry.subType)
    } else {
      uniqueClientPinAliases.set(key, { ...entry, subTypes: [entry.subType] })
    }
  }

  console.log(
    `[source] ${names.summary.nodes} nodes, ${names.summary.enums} enum families, ` +
      `${names.summary.enumValues} enum values`
  )
  console.log(
    `[server] checked ${serverNodes} display names; ` +
      `${serverLegacyIdentifiers.length} ids retain legacy NODE_ID identifiers`
  )
  console.log(
    `[client] checked ${CLIENT_NODE_METADATA.length} metadata records; ` +
      `${clientMethodEntries} public method entries retain stable names; ` +
      `${clientOfficialTitleComments} differing official titles are documented; ` +
      `${checkedClientPinNames} named public pins checked ` +
      `(${alignedClientPinNames} identifiers align, ` +
      `${clientPinCompatibilityComments} expanded differences / ` +
      `${uniqueClientPinAliases.size} unique differences are documented); ` +
      `${clientLegacyIdentifiers.size} ids retain internal legacy nodeType identifiers`
  )
  console.log(
    `[enum] checked ${Object.keys(ENUM_VALUE).length} shared/server and ` +
      `${Object.keys(CLIENT_ENUM_VALUES).length} client value keys`
  )
  console.log(
    `[compat] legacy enum family identifiers: ` +
      `server=${serverLegacyEnumNames.length}, client=${clientLegacyEnumNames.length}`
  )

  if (process.argv.includes('--verbose')) {
    for (const entry of serverLegacyIdentifiers) {
      console.log(`[compat server ${entry.id}] authoritative=${JSON.stringify(entry.name)}`)
    }
    for (const [id, entry] of clientLegacyIdentifiers) {
      console.log(
        `[internal client ${id}] authoritative=${JSON.stringify(entry.name)}, ` +
          `nodeType=${[...entry.current].join(',')}`
      )
    }
    for (const entry of uniqueClientPinAliases.values()) {
      console.log(
        `[compat client pin ${entry.nodeId}:${entry.pinIndex}] ` +
          `${entry.subTypes.join('/')}.${entry.methodName} ${entry.kind} ` +
          `${entry.apiName} -> ${JSON.stringify(entry.officialName)}`
      )
    }
    if (serverLegacyEnumNames.length) {
      console.log(`[compat server enums] ${serverLegacyEnumNames.join(', ')}`)
    }
    if (clientLegacyEnumNames.length) {
      console.log(`[compat client enums] ${clientLegacyEnumNames.join(', ')}`)
    }
  }

  assertNoErrors(errors)
  console.log('[ok] extracted names and supported enum values match current node metadata')
}

main()
