import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import rawDef from '../resources/node_definitions.json'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const TYPE_MAP: Record<string, string> = {
  boolean: 'bool',
  'boolean value': 'bool',
  bool: 'bool',
  integer: 'int',
  int: 'int',
  'integer list': 'int_list',
  float: 'float',
  'floating point numbers': 'float',
  'floating-point numbers': 'float',
  'floating point number list': 'float_list',
  string: 'str',
  text: 'str',
  'string list': 'str_list',
  guid: 'guid',
  'prefab id': 'prefabId',
  'config id': 'configId',
  'configuration id': 'configId',
  'config id list': 'configId_list',
  'configuration id list': 'configId_list',
  faction: 'faction',
  'faction list': 'faction_list',
  entity: 'entity',
  'entity list': 'entity_list',
  enumeration: 'enumeration',
  dictionary: 'dict',
  'generic dictionary': 'dict',
  'custom variable snapshot': 'customVariableSnapshot',
  generic: 'generic',
  'generic list': 'generic_list',
  '3d vector': 'vec3',
  vector: 'vec3',
  'local variable': 'localVariable'
}

type GenericRule = {
  functionName: string
  genericParameters: string[]
  availableTypes: string[]
}

type GenericSummary = {
  id: number
  types: string[]
  functions: string[]
}

type NormalizedGenericType =
  | {
      base: string
      variant: 'scalar'
    }
  | {
      base: string
      variant: 'list'
    }

type GenericContext = {
  typeParam: string
  runtimeTypeMap: string
  typeArrayLiteral: string
  matchArgs: string[]
  genericInputNames: Set<string>
  genericOutputIndices: Set<number>
  rawGenericOutputIndices: Set<number>
}

function normalizeGenericTypeName(type: string): NormalizedGenericType | null {
  const trimmed = type.trim()
  if (trimmed.startsWith('dict<')) return null

  if (trimmed.startsWith('list<') && trimmed.endsWith('>')) {
    const inner = normalizeGenericTypeName(trimmed.slice(5, -1))
    if (!inner) return null
    return { base: inner.base, variant: 'list' }
  }

  const snake = camelToSnake(trimmed).replace(/__/g, '_')
  return { base: snake, variant: 'scalar' }
}

function extractTypesFromArrayLiteral(lit: string): string[] {
  try {
    return lit
      .replace(/[\\[\\]\\s'"]/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

function buildGenericRuleMap() {
  const genericPath = path.join(ROOT, 'resources', 'node_generics.json')
  const rules = JSON.parse(fs.readFileSync(genericPath, 'utf-8')) as GenericRule[]
  const map = new Map<string, GenericRule>()
  const normalizeName = (fn: string) => {
    const spaced = fn.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    return toIdentifier(spaced)
  }
  for (const rule of rules) {
    if (!Array.isArray(rule.genericParameters) || rule.genericParameters.length === 0) continue
    map.set(rule.functionName, rule)
    map.set(normalizeName(rule.functionName), rule)
  }
  return map
}

function getGenericTypeLiteralsBySummaryId(id: number) {
  const summaryPath = path.join(ROOT, 'resources', 'node_generics_summary.json')
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8')) as GenericSummary[]
  const group = summary.find((item) => item.id === id)
  if (!group) return null

  const normalized = group.types
    .map((t) => normalizeGenericTypeName(t))
    .filter((t): t is NormalizedGenericType => !!t)
    .map((t) => (t.variant === 'list' ? `${t.base}_list` : t.base))

  if (normalized.length === 0) return null

  const baseTypes = prioritizeBaseTypes([
    ...new Set(normalized.map((t) => t.replace(/_list$/, '')))
  ])

  return {
    unionLiteral: normalized.map((t) => `'${t}'`).join(' | '),
    baseArrayLiteral: `[${baseTypes.map((t) => `'${t}'`).join(', ')}]`
  }
}

function buildSummaryFunctionTypeMap() {
  const summaryPath = path.join(ROOT, 'resources', 'node_generics_summary.json')
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8')) as GenericSummary[]
  const map = new Map<string, { unionLiteral: string; baseArrayLiteral: string }>()
  const normalizeName = (fn: string) => {
    const spaced = fn.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    return toIdentifier(spaced)
  }
  for (const item of summary) {
    const info = getGenericTypeLiteralsBySummaryId(item.id)
    if (!info) continue
    for (const fn of item.functions) {
      map.set(fn, info)
      map.set(fn.toLowerCase(), info)
      map.set(normalizeName(fn), info)
    }
  }
  return map
}

const genericRuleMap = buildGenericRuleMap()
const summaryFunctionTypeMap = buildSummaryFunctionTypeMap()
const getNodeFunctions = (node: { functions?: string[]; overview?: string[] }) =>
  node.functions ?? node.overview ?? []
function getSummaryTypeInfo(name: string) {
  const direct = summaryFunctionTypeMap.get(name)
  if (direct) return direct
  const lower = summaryFunctionTypeMap.get(name.toLowerCase())
  if (lower) return lower
  for (const [k, v] of summaryFunctionTypeMap) {
    if (k.toLowerCase() === name.toLowerCase()) return v
  }
  return null
}

function mapType(type: string) {
  const t = type.trim().toLowerCase()
  if (TYPE_MAP[t]) return TYPE_MAP[t]
  console.warn(`Unknown type: ${type}`)
  return 'unknown'
}

function literalToParameterValueType(literal: string, isList: boolean) {
  const base = literal.replace(/_list$/, '')
  const pascal = base
    .split('_')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
  const typeName = `${pascal}Value`
  return isList || literal.endsWith('_list') ? `${typeName}[]` : typeName
}

function literalToReturnValueType(literal: string, isList: boolean) {
  const base = literal.replace(/_list$/, '')
  const baseMap: Record<string, string> = {
    bool: 'boolean',
    int: 'bigint',
    float: 'number',
    str: 'string',
    vec3: 'vec3',
    guid: 'guid',
    entity: 'entity',
    // snake
    prefab_id: 'prefabId',
    config_id: 'configId',
    custom_variable_snapshot: 'customVariableSnapshot',
    local_variable: 'localVariable',
    // camel (部分资源可能直接用 camel 命名)
    prefabId: 'prefabId',
    configId: 'configId',
    customVariableSnapshot: 'customVariableSnapshot',
    localVariable: 'localVariable',
    faction: 'faction',
    struct: 'struct',
    dict: 'dict',
    enum: 'enumeration',
    enumeration: 'enumeration',
    generic: 'generic'
  }
  const mapped = baseMap[base] ?? 'unknown'
  if (isList || literal.endsWith('_list')) return `${mapped}[]`
  return mapped
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function prioritizeBaseTypes(types: string[]): string[] {
  const preferred = ['float', 'int']
  const seen = new Set<string>()
  const result: string[] = []

  for (const t of preferred) {
    if (types.includes(t)) {
      result.push(t)
      seen.add(t)
    }
  }

  for (const t of types) {
    if (!seen.has(t)) {
      result.push(t)
      seen.add(t)
    }
  }

  return result
}

function toIdentifier(name: string) {
  try {
    const parts = name
      .split(/[^a-zA-Z0-9]+/g)
      .map((part) => part.toLowerCase())
      .filter((part) => {
        // 丢弃纯符号或空项
        const isValid = /^[a-z0-9]+$/.test(part)
        if (!isValid && part) {
          console.warn(`toIdentifier: invalid part: ${part}`)
        }
        return isValid
      })
    const [head, ...rest] = parts
    let id =
      head[0].toLowerCase() +
      head.slice(1) +
      rest.map((p) => p[0].toUpperCase() + p.slice(1)).join('')
    if (/^[0-9]/.test(id)) {
      id = `_${id}`
      console.warn(`Identifier ${name} starts with a number, converted to ${id}`)
    }
    return id
  } catch (e) {
    console.error(`Error converting "${name}" to identifier`)
    throw e
  }
}

function replaceBetweenMarkers(
  content: string,
  startMarker: string,
  endMarker: string,
  replacement: string
) {
  const start = content.indexOf(startMarker)
  const end = content.indexOf(endMarker)
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Markers not found for ${startMarker}`)
  }
  const before = content.slice(0, start + startMarker.length)
  const after = content.slice(end)
  return `${before}\n${replacement}\n${after}`
}

function buildGenericContext(
  rule: GenericRule | undefined,
  inputParams: { name: string; type: string }[],
  outputParams: { name: string; type: string }[],
  summaryTypes?: { unionLiteral: string; baseArrayLiteral: string }
): GenericContext | null {
  if (!rule || rule.genericParameters.length === 0) return null

  const normalizedTypes = summaryTypes
    ? summaryTypes.unionLiteral
        .split('|')
        .map((s) => s.trim().replace(/^'|'$/g, ''))
        .map((t) => normalizeGenericTypeName(t.replace(/_list$/, '')))
        .filter((t): t is NormalizedGenericType => !!t)
    : rule.availableTypes
        .map((t) => normalizeGenericTypeName(t))
        .filter((t): t is NormalizedGenericType => !!t)
  if (!summaryTypes && normalizedTypes.length !== rule.availableTypes.length) return null

  const baseListRaw = summaryTypes
    ? summaryTypes.baseArrayLiteral
        .replace(/[[\]']/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : normalizedTypes.map((t) => t.base)
  const baseList = prioritizeBaseTypes(baseListRaw)
  const baseSet = new Set(baseList)
  if (baseSet.size === 0) return null

  const genericInputNames = new Set<string>()
  const genericOutputIndices = new Set<number>()
  const rawGenericOutputIndices = new Set<number>()
  const matchArgs: string[] = []
  const baseSetArr = [...baseSet]
  const isBaseMatch = (t: string) => {
    const base = t.replace(/_list$/, '')
    if (base === 'generic') return true
    return baseSetArr.includes(base)
  }

  for (const item of rule.genericParameters) {
    const match = item.match(/(input|output)\[(\d+)\]/)
    if (!match) continue
    const index = Number(match[2])
    if (match[1] === 'input') {
      const param = inputParams[index]
      if (param) {
        genericInputNames.add(param.name)
        matchArgs.push(param.name)
      }
    } else {
      const out = outputParams[index]
      rawGenericOutputIndices.add(index)
      if (out && isBaseMatch(out.type)) {
        genericOutputIndices.add(index)
      }
    }
  }

  if (matchArgs.length === 0) return null

  const baseUnionLiteral = summaryTypes
    ? summaryTypes.unionLiteral
    : [...baseSet].map((t) => `'${t}'`).join(' | ')
  const typeParam = `T extends ${baseUnionLiteral}`
  const runtimeTypeMap = 'RuntimeParameterValueTypeMap'
  const typeArrayLiteral = summaryTypes
    ? summaryTypes.baseArrayLiteral
    : `[${baseList.map((t) => `'${t}'`).join(', ')}]`

  return {
    typeParam,
    runtimeTypeMap,
    typeArrayLiteral,
    matchArgs,
    genericInputNames,
    genericOutputIndices,
    rawGenericOutputIndices
  }
}

function buildEvents() {
  const eventDef = rawDef['server_event_en-us']
  const eventDefZh = rawDef['server_event_zh-cn']
  const events: {
    name: string
    nameZh: string
    desc: string
    descZh: string
    params: {
      name: string
      nameZh: string
      type: string
      desc: string
      descZh: string
      input: boolean
    }[]
  }[] = []
  eventDef.sections.forEach((section, sIndex) => {
    section.nodes.forEach((node, nIndex) => {
      const nodeZh = eventDefZh.sections[sIndex].nodes[nIndex]
      const params = (node.parameters ?? []).map((p, pIndex) => ({
        name: toIdentifier(p.name),
        nameZh: nodeZh.parameters?.[pIndex]?.name || '',
        type: mapType(p.data_type),
        desc: p.description,
        descZh: nodeZh.parameters?.[pIndex]?.description || '',
        input: p.io.toLowerCase().includes('input')
      }))
      events.push({
        name: toIdentifier(node.name),
        nameZh: nodeZh.name,
        desc: getNodeFunctions(node).join('; '),
        descZh: getNodeFunctions(nodeZh).join('; '),
        params
      })
    })
  })

  const eventsPath = path.join(ROOT, 'src', 'definitions', 'events.ts')
  const eventsContent = fs.readFileSync(eventsPath, 'utf-8')

  const lines: string[] = []
  for (const e of events) {
    const paramLines: string[] = []
    for (const p of e.params) {
      const enumType = p.type === 'enumeration' ? getEventEnumType(e.name, p.name) : null
      if (enumType) {
        paramLines.push(
          `{ name: "${p.name}", typeBase: enumeration, typeName: "${enumType}", isArray: false},`
        )
      } else {
        const baseName = p.type.replace('_list', '')
        const isArray = p.type.includes('_list')
        paramLines.push(
          `{ name: "${p.name}", typeBase: ${baseName}, typeName: "${baseName}", isArray: ${isArray}},`
        )
      }
    }

    lines.push(`${e.name}: [`)
    lines.push(...paramLines)
    lines.push('],')
  }

  const newEventsContent = replaceBetweenMarkers(
    eventsContent,
    '// === AUTO-GENERATED START ===',
    '// === AUTO-GENERATED END ===',
    lines.join('\n')
  )
  fs.writeFileSync(eventsPath, newEventsContent)

  const eventsPayloadPath = path.join(ROOT, 'src', 'definitions', 'events-payload.ts')
  const eventsPayloadContent = fs.readFileSync(eventsPayloadPath, 'utf-8')

  const payloadLines: string[] = []
  for (const e of events) {
    const paramLines: string[] = []
    for (const p of e.params) {
      const enumType = p.type === 'enumeration' ? getEventEnumType(e.name, p.name) : null
      paramLines.push(`/**`)
      if (p.desc) {
        paramLines.push(` * ${p.desc}`)
      }
      if (p.nameZh || p.descZh) {
        paramLines.push(` *`)
        const zhPart = [p.nameZh, p.descZh].filter(Boolean).join(': ')
        paramLines.push(` * ${zhPart}`)
      }
      paramLines.push(` */`)
      paramLines.push(
        `${p.name}: ${
          enumType
            ? enumType
            : p.type.includes('_list')
              ? `${p.type.replace('_list', '')}[]`
              : p.type
        }`
      )
    }

    payloadLines.push(`/**`)
    payloadLines.push(` * ${e.desc}`)
    payloadLines.push(` *`)
    payloadLines.push(` * ${e.nameZh}: ${e.descZh}`)
    payloadLines.push(` */`)
    payloadLines.push(`${e.name}: {`)
    payloadLines.push(...paramLines)
    payloadLines.push('},')
  }

  const newEventsPayloadContent = replaceBetweenMarkers(
    eventsPayloadContent,
    '// === AUTO-GENERATED START ===',
    '// === AUTO-GENERATED END ===',
    payloadLines.join('\n')
  )
  fs.writeFileSync(eventsPayloadPath, newEventsPayloadContent)
}

const skipNodes: string[] = [
  'assemblyList',
  'assemblyDictionary',
  'setCustomVariable',
  'getCustomVariable',
  'setNodeGraphVariable',
  'getNodeGraphVariable',
  'setLocalVariable',
  'getLocalVariable',
  'queryCustomVariableSnapshot',
  'queryDictionaryValueByKey',
  'createDictionary',
  'queryIfDictionaryContainsSpecificValue',
  'getListOfValuesFromDictionary',
  'dataTypeConversion',
  'enumerationsEqual',
  'sortDictionaryByKey',
  'sortDictionaryByValue',
  'equal',
  'breakLoop',
  'finiteLoop',
  'listIterationLoop',
  'multipleBranches',
  'doubleBranch'
]

type DictTypeOverride = {
  key: string
  value: string
}

/**
 * 针对特定函数/参数的字典键值类型覆盖表
 * key/ value 使用 snake_case 的运行时基础类型名称（如 'int'、'str'、'config_id' 等）
 *
 * 例:
 * {
 *   queryInventoryShopItemSalesInfo: {
 *     sellCurrencyDictionary: { key: 'int', value: 'int' }
 *   }
 * }
 */
const dictTypeOverrides: Record<string, Record<string, DictTypeOverride>> = {
  queryInventoryShopItemSalesInfo: {
    sellCurrencyDictionary: { key: 'config_id', value: 'int' }
  },
  queryShopItemPurchaseInfo: {
    purchaseCurrencyDictionary: { key: 'config_id', value: 'int' }
  },
  queryCustomShopItemSalesInfo: {
    sellCurrencyDictionary: { key: 'config_id', value: 'int' }
  },
  getAllCurrencyFromInventory: {
    currencyDictionary: { key: 'config_id', value: 'int' }
  },
  getAllBasicItemsFromInventory: {
    basicItemDictionary: { key: 'config_id', value: 'int' }
  },
  getAllItemsFromLootComponent: {
    itemDictionary: { key: 'config_id', value: 'int' }
  },
  getAllCurrencyFromLootComponent: {
    currencyDictionary: { key: 'config_id', value: 'int' }
  }
}

function getDictTypeOverride(fnName: string, paramName: string): DictTypeOverride | null {
  const fnOverrides = dictTypeOverrides[fnName]
  if (!fnOverrides) return null
  return fnOverrides[paramName] ?? null
}

const eventEnumTypeOverrides: Record<string, Record<string, string>> = {
  whenCharacterMovementSpdMeetsCondition: { conditionComparisonType: 'ComparisonOperator' },
  whenEntityIsDestroyed: { entityType: 'EntityType' },
  whenTheCharacterIsDown: { reason: 'CauseOfBeingDown' },
  whenAllPlayerSCharactersAreDown: { reason: 'CauseOfBeingDown' },
  whenAttackHits: { elementalType: 'ElementalType' },
  whenAttacked: { elementalType: 'ElementalType' },
  whenUnitStatusEnds: { removalReason: 'UnitStatusRemovalReason' },
  whenElementalReactionEventOccurs: { elementalReactionType: 'ElementalReactionType' },
  whenDeckSelectorIsComplete: { completionReason: 'SelectCompletionReason' },
  whenTheQuantityOfInventoryItemChanges: { reasonForChange: 'ReasonForItemChange' }
}

function getEventEnumType(eventName: string, paramName: string): string | null {
  const overrides = eventEnumTypeOverrides[eventName]
  if (!overrides) return null
  return overrides[paramName] ?? null
}

function getEnumTypeForParam(paramName: string): string | null {
  const name = paramName.toLowerCase()

  const nameMap: Record<string, string> = {
    applicationresult: 'UnitStatusAdditionResult',
    playmode: 'GameplayMode',
    currentinterruptstatus: 'InterruptStatus',
    sortby: 'SortBy',
    damagepopuptype: 'DamagePopUpType',
    movementmode: 'MovementMode',
    parametertype: 'FixedMotionParameterType',
    followcoordinatesystem: 'FollowCoordinateSystem',
    followtype: 'FollowLocationType',
    removalmethod: 'RemovalMethod',
    displaystatus: 'UIControlGroupStatus',
    characterskillslot: 'CharacterSkillSlot',
    skillslot: 'CharacterSkillSlot',
    attenuationmode: 'SoundAttenuationMode',
    refreshmode: 'DecisionRefreshMode',
    settlementstatus: 'SettlementStatus',
    loottype: 'ItemLootType',
    ruletype: 'ScanRuleType',
    roundingmode: 'RoundingMode',
    entitytype: 'EntityType',
    inputdevicetype: 'InputDeviceType'
  }

  return nameMap[name] || null
}

function buildNodes() {
  const dictFunctionNames = new Set([
    'setOrAddKeyValuePairsToDictionary',
    'queryDictionaryValueByKey',
    'removeKeyValuePairsFromDictionaryByKey',
    'queryIfDictionaryContainsSpecificKey',
    'getListOfKeysFromDictionary',
    'getListOfValuesFromDictionary',
    'queryDictionarySLength',
    'clearDictionary'
  ])
  const nodeKeys = [
    'server_exec_en-us',
    'server_flow_en-us',
    'server_calc_en-us',
    'server_query_en-us'
  ] as const satisfies Array<keyof typeof rawDef>
  const nodes: {
    name: string
    nameZh: string
    desc: string
    descZh: string
    nodeKind: 'exec' | 'data'
    params:
      | {
          name: string
          nameZh: string
          type: string
          desc: string
          descZh: string
          input: boolean
        }[]
      | undefined
  }[] = []
  nodeKeys.forEach((key) => {
    const nodeDef = rawDef[key]
    // Determine node type based on key
    const nodeKind = key.includes('exec') || key.includes('flow') ? 'exec' : 'data'

    nodeDef.sections.forEach((section, sIndex) => {
      section.nodes.forEach((node, nIndex) => {
        try {
          const nodeName = toIdentifier(node.name)
          if (skipNodes.includes(nodeName)) return

          // @ts-ignore 获取中文节点定义, 必然成功
          const nodeDefZh = rawDef[
            key.replace('en-us', 'zh-cn')
          ] as (typeof rawDef)['server_exec_zh-cn']
          const nodeZh = nodeDefZh.sections[sIndex].nodes[nIndex]

          let inputParamCounter = 0
          const params = !('parameters' in node)
            ? undefined
            : node.parameters
                ?.map((p, pIndex) => {
                  const isInput = p.io.toLowerCase().includes('input')
                  let paramName = p.name

                  // Generate default name for input parameters without names
                  if (!paramName && isInput) {
                    inputParamCounter++
                    paramName = `input${inputParamCounter}`
                    console.warn(
                      `buildNodes: node "${node.name}" has input parameter without name, generated name: "${paramName}"`
                    )
                  }

                  return {
                    paramName,
                    nameZh: nodeZh.parameters?.[pIndex]?.name || '',
                    type: mapType(p.data_type),
                    desc: p.description,
                    descZh: nodeZh.parameters?.[pIndex]?.description || '',
                    input: isInput
                  }
                })
                .filter((p) => {
                  const isValid = !!p.paramName
                  if (!isValid) {
                    console.warn(`buildNodes: skip node: ${node.name}, parameter desc: ${p.desc}`)
                  }
                  return isValid
                })
                .map((p) => {
                  const rawName = toIdentifier(p.paramName)
                  const adjustedName =
                    nodeName === 'equal' && /^enumeration\d+$/.test(rawName)
                      ? rawName.replace('enumeration', 'input')
                      : rawName
                  return {
                    name: adjustedName,
                    nameZh: p.nameZh,
                    type: p.type,
                    desc: p.desc,
                    descZh: p.descZh,
                    input: p.input
                  }
                })
          nodes.push({
            name: nodeName,
            nameZh: nodeZh.name,
            desc: getNodeFunctions(node).join('; '),
            descZh: getNodeFunctions(nodeZh).join('; '),
            nodeKind,
            params
          })
        } catch (e) {
          console.error(`Error processing node: ${node.name}`)
          throw e
        }
      })
    })
  })

  const nodesPath = path.join(ROOT, 'src', 'definitions', 'nodes.ts')
  const nodesContent = fs.readFileSync(nodesPath, 'utf-8')

  const lines: string[] = []
  for (const n of nodes) {
    const inputParams = n.params?.filter((p) => p.input) || []
    const outputParams = n.params?.filter((p) => !p.input) || []

    lines.push(`\n/**`)
    lines.push(` * ${n.desc}`)
    lines.push(' *')
    lines.push(` * ${n.nameZh}: ${n.descZh}`)

    // Add @param for each input parameter
    if (inputParams.length > 0) {
      lines.push(' *')
      for (const p of inputParams) {
        const paramDesc = p.desc ? ` ${p.desc}` : ''
        lines.push(` * @param ${p.name}${paramDesc}`)
        if (p.nameZh || p.descZh) {
          lines.push(' *')
          const zhPart = [p.nameZh, p.descZh].filter(Boolean).join(': ')
          lines.push(` * ${zhPart}`)
        }
      }
    }

    // Add @returns (only for single return value)
    if (outputParams.length === 1) {
      lines.push(' *')
      const outParam = outputParams[0]
      const returnDesc = outParam.desc ? ` ${outParam.desc}` : ''
      lines.push(` * @returns${returnDesc}`)
      if (outParam.nameZh || outParam.descZh) {
        lines.push(' *')
        const zhPart = [outParam.nameZh, outParam.descZh].filter(Boolean).join(': ')
        lines.push(` * ${zhPart}`)
      }
    }

    lines.push(` */`)

    // Build function definition
    const summaryTypeInfo = getSummaryTypeInfo(n.name)
    const ruleForNode = genericRuleMap.get(n.name)

    const normalizedAvailableForRule = (ruleForNode?.availableTypes || [])
      .map((t) => normalizeGenericTypeName(t))
      .filter((t): t is NormalizedGenericType => !!t)
      .map((t) => t.base)
    let genericCtx = buildGenericContext(
      ruleForNode,
      inputParams,
      outputParams,
      summaryTypeInfo || undefined
    )
    if (summaryTypeInfo) {
      if (!genericCtx) {
        genericCtx = {
          typeParam: `T extends ${summaryTypeInfo.unionLiteral}`,
          runtimeTypeMap: 'RuntimeParameterValueTypeMap',
          typeArrayLiteral: summaryTypeInfo.baseArrayLiteral,
          matchArgs: inputParams.map((p) => p.name),
          genericInputNames: new Set(inputParams.map((p) => p.name)),
          genericOutputIndices: new Set<number>(),
          rawGenericOutputIndices: new Set<number>()
        }
      } else {
        genericCtx = {
          ...genericCtx,
          typeParam: `T extends ${summaryTypeInfo.unionLiteral}`,
          runtimeTypeMap: 'RuntimeParameterValueTypeMap',
          typeArrayLiteral: summaryTypeInfo.baseArrayLiteral,
          rawGenericOutputIndices: genericCtx.rawGenericOutputIndices
        }
      }
    } else if (!genericCtx && ruleForNode) {
      const normalized = ruleForNode.availableTypes
        .map((t) => normalizeGenericTypeName(t))
        .filter((t): t is NormalizedGenericType => !!t)
      if (normalized.length > 0) {
        const prioritizedBases = prioritizeBaseTypes([...new Set(normalized.map((t) => t.base))])
        const unionLiteral = normalized
          .map((t) => (t.variant === 'list' ? `${t.base}_list` : t.base))
          .map((t) => `'${t}'`)
          .join(' | ')
        const baseArray = `[${prioritizedBases.map((t) => `'${t}'`).join(', ')}]`
        genericCtx = {
          typeParam: `T extends ${unionLiteral}`,
          runtimeTypeMap: 'RuntimeParameterValueTypeMap',
          typeArrayLiteral: baseArray,
          matchArgs: inputParams.map((p) => p.name),
          genericInputNames: new Set(inputParams.map((p) => p.name)),
          genericOutputIndices: new Set<number>(),
          rawGenericOutputIndices: new Set<number>()
        }
      }
    }
    const runtimeParamTypeMapRef = genericCtx?.runtimeTypeMap ?? 'CommonRuntimeLiteralValueTypeMap'
    const runtimeReturnTypeMapRef = 'RuntimeReturnValueTypeMap'
    const allowedBaseTypesGlobal =
      genericCtx?.typeArrayLiteral && genericCtx.typeArrayLiteral.length > 0
        ? extractTypesFromArrayLiteral(genericCtx.typeArrayLiteral).map((t) =>
            t.replace(/_list$/, '')
          )
        : normalizedAvailableForRule || []
    if (genericCtx && !allowedBaseTypesGlobal.includes('generic')) {
      allowedBaseTypesGlobal.push('generic')
    }

    // Special handling for dictionary-related functions
    if (dictFunctionNames.has(n.name)) {
      switch (n.name) {
        case 'setOrAddKeyValuePairsToDictionary': {
          lines.push(
            `setOrAddKeyValuePairsToDictionary<K extends DictKeyType, V extends DictValueType>(dictionary: dict<K, V>, key: RuntimeParameterValueTypeMap[K], value: RuntimeParameterValueTypeMap[V]) {`,
            `  const dictionaryObj = parseValue(dictionary, 'dict')`,
            `  const keyObj = parseValue(key, dictionaryObj.getKeyType())`,
            `  const valueObj = parseValue(value, dictionaryObj.getValueType())`,
            `  this.registry.registerNode({`,
            `    id: 0,`,
            `    type: '${n.nodeKind}',`,
            `    nodeType: '${camelToSnake(n.name)}',`,
            `    args: [dictionaryObj, keyObj, valueObj]`,
            `  })`,
            `}`
          )
          continue
        }
        case 'queryDictionaryValueByKey': {
          lines.push(
            `queryDictionaryValueByKey<K extends DictKeyType, V extends DictValueType>(dictionary: dict<K, V>, key: RuntimeParameterValueTypeMap[K]): RuntimeReturnValueTypeMap[V] {`,
            `  const dictionaryObj = parseValue(dictionary, 'dict')`,
            `  const valueType = dictionaryObj.getValueType()`,
            `  const keyObj = parseValue(key, dictionaryObj.getKeyType())`,
            `  const ref = this.registry.registerNode({`,
            `    id: 0,`,
            `    type: '${n.nodeKind}',`,
            `    nodeType: '${camelToSnake(n.name)}',`,
            `    args: [dictionaryObj, keyObj]`,
            `  })`,
            `  if (valueType.endsWith('_list')) {`,
            `    const base = valueType.replace('_list', '')`,
            `    const ret = new list(base)`,
            `    ret.markPin(ref, 'value', 0)`,
            `    return ret as unknown as RuntimeReturnValueTypeMap[V]`,
            `  }`,
            `  const ret = new ValueClassMap[valueType]()`,
            `  ret.markPin(ref, 'value', 0)`,
            `  return ret as unknown as RuntimeReturnValueTypeMap[V]`,
            `}`
          )
          continue
        }
        case 'removeKeyValuePairsFromDictionaryByKey': {
          lines.push(
            `removeKeyValuePairsFromDictionaryByKey<K extends DictKeyType, V extends DictValueType>(dictionary: dict<K, V>, key: RuntimeParameterValueTypeMap[K]) {`,
            `  const dictionaryObj = parseValue(dictionary, 'dict')`,
            `  const keyObj = parseValue(key, dictionaryObj.getKeyType())`,
            `  this.registry.registerNode({`,
            `    id: 0,`,
            `    type: '${n.nodeKind}',`,
            `    nodeType: '${camelToSnake(n.name)}',`,
            `    args: [dictionaryObj, keyObj]`,
            `  })`,
            `}`
          )
          continue
        }
        case 'queryIfDictionaryContainsSpecificKey': {
          lines.push(
            `queryIfDictionaryContainsSpecificKey<K extends DictKeyType, V extends DictValueType>(dictionary: dict<K, V>, key: RuntimeParameterValueTypeMap[K]): boolean {`,
            `  const dictionaryObj = parseValue(dictionary, 'dict')`,
            `  const keyObj = parseValue(key, dictionaryObj.getKeyType())`,
            `  const ref = this.registry.registerNode({`,
            `    id: 0,`,
            `    type: '${n.nodeKind}',`,
            `    nodeType: '${camelToSnake(n.name)}',`,
            `    args: [dictionaryObj, keyObj]`,
            `  })`,
            `  const ret = new bool()`,
            `  ret.markPin(ref, 'include', 0)`,
            `  return ret as unknown as boolean`,
            `}`
          )
          continue
        }
        case 'getListOfKeysFromDictionary': {
          lines.push(
            `getListOfKeysFromDictionary<K extends DictKeyType, V extends DictValueType>(dictionary: dict<K, V>): RuntimeReturnValueTypeMap[\`\${K}_list\`] {`,
            `  const dictionaryObj = parseValue(dictionary, 'dict')`,
            `  const ref = this.registry.registerNode({`,
            `    id: 0,`,
            `    type: '${n.nodeKind}',`,
            `    nodeType: '${camelToSnake(n.name)}',`,
            `    args: [dictionaryObj]`,
            `  })`,
            `  const ret = new list(dictionaryObj.getKeyType())`,
            `  ret.markPin(ref, 'keyList', 0)`,
            `  return ret as unknown as RuntimeReturnValueTypeMap[\`\${K}_list\`]`,
            `}`
          )
          continue
        }
        case 'getListOfValuesFromDictionary': {
          lines.push(
            `getListOfValuesFromDictionary<K extends DictKeyType, V extends DictValueType>(dictionary: dict<K, V>): RuntimeReturnValueTypeMap[\`\${V}_list\`] {`,
            `  const dictionaryObj = parseValue(dictionary, 'dict')`,
            `  const valueType = dictionaryObj.getValueType()`,
            `  const ref = this.registry.registerNode({`,
            `    id: 0,`,
            `    type: '${n.nodeKind}',`,
            `    nodeType: '${camelToSnake(n.name)}',`,
            `    args: [dictionaryObj]`,
            `  })`,
            `  const baseValueType = valueType.endsWith('_list') ? valueType.replace('_list', '') : valueType`,
            `  const ret = new list(baseValueType)`,
            `  ret.markPin(ref, 'valueList', 0)`,
            `  return ret as unknown as RuntimeReturnValueTypeMap[\`\${V}_list\`]`,
            `}`
          )
          continue
        }
        case 'queryDictionarySLength': {
          lines.push(
            `queryDictionarySLength<K extends DictKeyType, V extends DictValueType>(dictionary: dict<K, V>): bigint {`,
            `  const dictionaryObj = parseValue(dictionary, 'dict')`,
            `  const ref = this.registry.registerNode({`,
            `    id: 0,`,
            `    type: '${n.nodeKind}',`,
            `    nodeType: '${camelToSnake(n.name)}',`,
            `    args: [dictionaryObj]`,
            `  })`,
            `  const ret = new int()`,
            `  ret.markPin(ref, 'length', 0)`,
            `  return ret as unknown as bigint`,
            `}`
          )
          continue
        }
        case 'clearDictionary': {
          lines.push(
            `clearDictionary<K extends DictKeyType, V extends DictValueType>(dictionary: dict<K, V>) {`,
            `  const dictionaryObj = parseValue(dictionary, 'dict')`,
            `  this.registry.registerNode({`,
            `    id: 0,`,
            `    type: '${n.nodeKind}',`,
            `    nodeType: '${camelToSnake(n.name)}',`,
            `    args: [dictionaryObj]`,
            `  })`,
            `}`
          )
          continue
        }
      }
    }

    const buildFunctionSignature = (typeLiteral?: string, withBody = false) => {
      const normalizeTypeLiteral = (lit: string) => {
        const trimmed = lit.trim()
        const withoutQuotes = trimmed.replace(/^['"`]+|['"`]+$/g, '')
        return withoutQuotes.replace(/^\[+|\]+$/g, '')
      }
      const normalizedLiteral = typeLiteral ? normalizeTypeLiteral(typeLiteral) : ''
      const isOverload = !!(normalizedLiteral && !withBody)
      const typeParamExtends =
        genericCtx && normalizedLiteral
          ? `'${normalizedLiteral}'`
          : genericCtx
            ? genericCtx.typeParam.replace(/^T extends\s+/, '')
            : ''
      const typeParamDecl = genericCtx && !isOverload ? `<T extends ${typeParamExtends}>` : ''
      const typeToken = isOverload ? `'${normalizedLiteral}'` : 'T'
      const useConcreteTypeForLiteral = isOverload && !!normalizedLiteral
      let funcDef = n.name + typeParamDecl + '('
      for (const p of inputParams) {
        const paramName = p.name
        const isGenericInput = genericCtx?.genericInputNames.has(paramName)
        const treatAsList =
          isGenericInput &&
          (p.type.includes('_list') || (p.type === 'generic' && /list/i.test(p.name)))
        let paramType: string

        if (isGenericInput) {
          if (useConcreteTypeForLiteral) {
            paramType = literalToParameterValueType(
              normalizedLiteral,
              treatAsList || normalizedLiteral.endsWith('_list')
            )
          } else {
            paramType = treatAsList
              ? `(${runtimeParamTypeMapRef})[${typeToken}][]`
              : `(${runtimeParamTypeMapRef})[${typeToken}]`
          }
        } else if (p.type === 'dict') {
          const override = getDictTypeOverride(n.name, paramName)
          paramType = override ? `dict<'${override.key}', '${override.value}'>` : 'DictValue'
        } else if (p.type === 'enumeration') {
          const enumType = getEnumTypeForParam(paramName)
          if (enumType) {
            paramType = enumType
          } else {
            console.warn(
              `No enum mapping found for parameter "${paramName}" in function "${n.name}", using EnumerationValue`
            )
            paramType = 'EnumerationValue'
          }
        } else {
          paramType = p.type[0].toUpperCase() + p.type.slice(1) + 'Value'
          paramType = paramType.includes('_list')
            ? paramType.replace('_list', '') + '[]'
            : paramType
        }
        funcDef += paramName + ': ' + paramType + ', '
      }
      funcDef += ')'

      // Add return type
      if (outputParams.length === 0) {
        funcDef += ': void'
      } else if (outputParams.length === 1) {
        // Single return value
        const outParam = outputParams[0]
        const allowedBaseTypes = allowedBaseTypesGlobal.map((t) => t.replace(/_list$/, ''))
        const outBase = outParam.type.replace(/_list$/, '')
        const dictOverrideSingle =
          outParam.type === 'dict' ? getDictTypeOverride(n.name, outParam.name) : null
        const enumReturnType =
          outParam.type === 'enumeration' ? getEnumTypeForParam(outParam.name) : null
        const isGenericOutput =
          genericCtx && allowedBaseTypes.includes(outBase) && genericCtx.genericOutputIndices.has(0)
        if (genericCtx && genericCtx.rawGenericOutputIndices.has(0) && outBase !== 'generic') {
          console.warn(
            `generic output type mismatch: ${n.name} output[0] actual=${outParam.type} allowed=${allowedBaseTypes.join(',')}`
          )
        }
        if (isGenericOutput) {
          const concreteReturn =
            useConcreteTypeForLiteral &&
            literalToReturnValueType(
              normalizedLiteral,
              outParam.type.includes('_list') || normalizedLiteral.endsWith('_list')
            )
          const returnType = concreteReturn
            ? concreteReturn
            : outParam.type.includes('_list')
              ? isOverload
                ? `RuntimeReturnValueTypeMap['${normalizedLiteral}_list']`
                : `RuntimeReturnValueTypeMap[\`\${T}_list\`]`
              : `(${runtimeReturnTypeMapRef})[${typeToken}]`
          funcDef += ': ' + returnType
        } else {
          const concreteReturn = enumReturnType
            ? outParam.type.includes('_list')
              ? `${enumReturnType}[]`
              : enumReturnType
            : literalToReturnValueType(outParam.type, outParam.type.includes('_list'))
          const returnType = dictOverrideSingle
            ? `dict<'${dictOverrideSingle.key}', '${dictOverrideSingle.value}'>`
            : concreteReturn
          funcDef += ': ' + returnType
        }
      } else if (outputParams.length > 1) {
        // Multiple return values - return object type
        funcDef += ': {\n'
        for (let i = 0; i < outputParams.length; i++) {
          const p = outputParams[i]
          const allowedBaseTypes = allowedBaseTypesGlobal
          const outBase = p.type.replace(/_list$/, '')
          const dictOverride = p.type === 'dict' ? getDictTypeOverride(n.name, p.name) : null
          const enumReturnType = p.type === 'enumeration' ? getEnumTypeForParam(p.name) : null
          const isGenericOutput =
            genericCtx &&
            allowedBaseTypes.includes(outBase) &&
            (genericCtx.genericOutputIndices.has(i) ?? false)
          if (
            genericCtx &&
            (genericCtx.rawGenericOutputIndices.has(i) ?? false) &&
            outBase !== 'generic'
          ) {
            console.warn(
              `generic output type mismatch: ${n.name} output[${i}] actual=${p.type} allowed=${allowedBaseTypes.join(',')}`
            )
          }
          const genericConcreteReturn =
            isGenericOutput &&
            useConcreteTypeForLiteral &&
            literalToReturnValueType(
              normalizedLiteral,
              p.type.includes('_list') || normalizedLiteral.endsWith('_list')
            )
          const concreteReturn = enumReturnType
            ? p.type.includes('_list')
              ? `${enumReturnType}[]`
              : enumReturnType
            : (genericConcreteReturn ?? literalToReturnValueType(p.type, p.type.includes('_list')))

          const returnType = isGenericOutput
            ? concreteReturn
              ? concreteReturn
              : p.type.includes('_list')
                ? isOverload
                  ? `RuntimeReturnValueTypeMap['${normalizedLiteral}_list']`
                  : `RuntimeReturnValueTypeMap[\`\${T}_list\`]`
                : `(${runtimeReturnTypeMapRef})[${typeToken}]`
            : dictOverride
              ? `dict<'${dictOverride.key}', '${dictOverride.value}'>`
              : concreteReturn
          funcDef += `/**\n`
          if (p.desc) {
            funcDef += ` * ${p.desc}\n`
          }
          if (p.nameZh || p.descZh) {
            funcDef += ` *\n`
            const zhPart = [p.nameZh, p.descZh].filter(Boolean).join(': ')
            funcDef += ` * ${zhPart}\n`
          }
          funcDef += ` */\n`
          funcDef += `${p.name}: ${returnType}\n`
        }
        funcDef += '}'
      }

      if (outputParams.length === 0 && !/:\s*void\s*$/.test(funcDef)) {
        funcDef += ': void'
      }
      if (withBody) funcDef += ' {'
      return funcDef
    }

    // 为泛型函数生成单一类型的重载签名
    const overloadTypes =
      genericCtx?.typeArrayLiteral && genericCtx.typeArrayLiteral.length > 0
        ? [...new Set(extractTypesFromArrayLiteral(genericCtx.typeArrayLiteral))]
        : []
    if (genericCtx && overloadTypes.length > 0) {
      for (const t of overloadTypes) {
        const trimmed = t.trim()
        const normalized = trimmed.replace(/^['"`]+|['"`]+$/g, '').replace(/^\[+|\]+$/g, '')
        if (!normalized) continue
        let sig = buildFunctionSignature(normalized, false)
        if (outputParams.length === 0) {
          sig = sig.replace(/\)\s*$/, '): void')
          if (!sig.includes(': void')) sig += ': void'
        }
        lines.push(sig + ';')
      }
    }

    lines.push(buildFunctionSignature(undefined, true))

    // Build function body implementation
    const bodyLines: string[] = []

    // Parse input parameters
    if (genericCtx) {
      bodyLines.push(
        `const genericType = matchTypes(${genericCtx.typeArrayLiteral}, ${genericCtx.matchArgs.join(', ')})`
      )
    }

    for (const p of inputParams) {
      const baseType = p.type.replace('_list', '')
      const snakeBaseType = camelToSnake(baseType)
      const treatAsList =
        genericCtx?.genericInputNames.has(p.name) &&
        (p.type.includes('_list') || (p.type === 'generic' && /list/i.test(p.name)))
      if (genericCtx?.genericInputNames.has(p.name)) {
        if (p.type.includes('_list') || treatAsList) {
          bodyLines.push(`const ${p.name}Obj = parseValue(${p.name}, \`${'$'}{genericType}_list\`)`)
        } else {
          bodyLines.push(`const ${p.name}Obj = parseValue(${p.name}, genericType)`)
        }
      } else if (p.type.includes('_list')) {
        // Array parameter
        bodyLines.push(`const ${p.name}Obj = parseValue(${p.name}, '${snakeBaseType}_list')`)
      } else {
        // Single parameter
        bodyLines.push(`const ${p.name}Obj = parseValue(${p.name}, '${snakeBaseType}')`)
      }
    }

    // Collect all args for registerNode
    const argsArray =
      inputParams.length > 0 ? inputParams.map((p) => `${p.name}Obj`).join(', ') : ''

    if (outputParams.length === 0) {
      // No return value - simple exec node
      bodyLines.push('this.registry.registerNode({')
      bodyLines.push('  id: 0,')
      bodyLines.push(`  type: '${n.nodeKind}',`)
      bodyLines.push(`  nodeType: '${camelToSnake(n.name)}',`)
      bodyLines.push(`  args: [${argsArray}]`)
      bodyLines.push('})')
    } else if (outputParams.length === 1) {
      // Single return value
      const outParam = outputParams[0]
      const allowedBaseTypes = allowedBaseTypesGlobal
      const outBase = outParam.type.replace(/_list$/, '')
      const dictOverrideSingle =
        outParam.type === 'dict' ? getDictTypeOverride(n.name, outParam.name) : null
      const isGenericOutput =
        genericCtx && allowedBaseTypes.includes(outBase) && genericCtx.genericOutputIndices.has(0)

      bodyLines.push('const ref = this.registry.registerNode({')
      bodyLines.push('  id: 0,')
      bodyLines.push(`  type: '${n.nodeKind}',`)
      bodyLines.push(`  nodeType: '${camelToSnake(n.name)}',`)
      bodyLines.push(`  args: [${argsArray}]`)
      bodyLines.push('})')

      if (isGenericOutput) {
        if (outParam.type.includes('_list')) {
          bodyLines.push(`const ret = new list(genericType)`)
          bodyLines.push(`ret.markPin(ref, '${outParam.name}', 0)`)
          bodyLines.push(`return ret as unknown as (${runtimeReturnTypeMapRef})[\`\\\${T}_list\`]`)
        } else {
          bodyLines.push(`const ret = new ValueClassMap[genericType]()`)
          bodyLines.push(`ret.markPin(ref, '${outParam.name}', 0)`)
          bodyLines.push(`return ret as unknown as (${runtimeReturnTypeMapRef})[T]`)
        }
      } else {
        const returnType = outParam.type.replace('_list', '')
        const enumReturnTypeName =
          outParam.type === 'enumeration' ? getEnumTypeForParam(outParam.name) : null
        const resolvedReturnType = enumReturnTypeName ?? returnType
        const snakeReturnType = camelToSnake(resolvedReturnType)

        if (outParam.type.includes('_list')) {
          bodyLines.push(`const ret = new list('${snakeReturnType}')`)
          bodyLines.push(`ret.markPin(ref, '${outParam.name}', 0)`)
          bodyLines.push(
            `return ret as unknown as ${literalToReturnValueType(outParam.type, true)}`
          )
        } else {
          if (dictOverrideSingle) {
            bodyLines.push(
              `const ret = new dict('${dictOverrideSingle.key}', '${dictOverrideSingle.value}')`
            )
          } else if (enumReturnTypeName) {
            bodyLines.push(`const ret = new enumeration('${enumReturnTypeName}')`)
          } else {
            bodyLines.push(`const ret = new ${resolvedReturnType}()`)
          }
          bodyLines.push(`ret.markPin(ref, '${outParam.name}', 0)`)
          const singleReturnType = dictOverrideSingle
            ? `dict<'${dictOverrideSingle.key}', '${dictOverrideSingle.value}'>`
            : (enumReturnTypeName ?? literalToReturnValueType(outParam.type, false))
          bodyLines.push(`return ret as unknown as ${singleReturnType}`)
        }
      }
    } else {
      // Multiple return values - return object
      bodyLines.push('const ref = this.registry.registerNode({')
      bodyLines.push('  id: 0,')
      bodyLines.push(`  type: '${n.nodeKind}',`)
      bodyLines.push(`  nodeType: '${camelToSnake(n.name)}',`)
      bodyLines.push(`  args: [${argsArray}]`)
      bodyLines.push('})')

      bodyLines.push('return {')
      for (let i = 0; i < outputParams.length; i++) {
        const outParam = outputParams[i]
        const allowedBaseTypes = allowedBaseTypesGlobal
        const outBase = outParam.type.replace(/_list$/, '')
        const dictOverride =
          outParam.type === 'dict' ? getDictTypeOverride(n.name, outParam.name) : null
        const isGenericOutput =
          genericCtx && allowedBaseTypes.includes(outBase) && genericCtx.genericOutputIndices.has(i)
        if (isGenericOutput) {
          if (outParam.type.includes('_list')) {
            bodyLines.push(`  ${outParam.name}: (() => {`)
            bodyLines.push(`    const ret = new list(genericType)`)
            bodyLines.push(`    ret.markPin(ref, '${outParam.name}', ${i})`)
            bodyLines.push(`    return ret as unknown as (${runtimeReturnTypeMapRef})[T]`)
            bodyLines.push(`  })(),`)
          } else {
            bodyLines.push(`  ${outParam.name}: (() => {`)
            bodyLines.push(`    const ret = new ValueClassMap[genericType]()`)
            bodyLines.push(`    ret.markPin(ref, '${outParam.name}', ${i})`)
            bodyLines.push(`    return ret as unknown as (${runtimeReturnTypeMapRef})[T]`)
            bodyLines.push(`  })(),`)
          }
        } else {
          const returnType = outParam.type.replace('_list', '')
          const enumReturnTypeName =
            outParam.type === 'enumeration' ? getEnumTypeForParam(outParam.name) : null
          const resolvedReturnType = enumReturnTypeName ?? returnType

          if (outParam.type.includes('_list')) {
            bodyLines.push(`  ${outParam.name}: (() => {`)
            bodyLines.push(`    const ret = new list('${camelToSnake(resolvedReturnType)}')`)
            bodyLines.push(`    ret.markPin(ref, '${outParam.name}', ${i})`)
            bodyLines.push(
              `    return ret as unknown as ${literalToReturnValueType(outParam.type, true)}`
            )
            bodyLines.push(`  })(),`)
          } else {
            bodyLines.push(`  ${outParam.name}: (() => {`)
            if (dictOverride) {
              bodyLines.push(
                `    const ret = new dict('${dictOverride.key}', '${dictOverride.value}')`
              )
            } else if (enumReturnTypeName) {
              bodyLines.push(`    const ret = new enumeration('${enumReturnTypeName}')`)
            } else {
              bodyLines.push(`    const ret = new ${resolvedReturnType}()`)
            }
            bodyLines.push(`    ret.markPin(ref, '${outParam.name}', ${i})`)
            const multiReturnType = dictOverride
              ? `dict<'${dictOverride.key}', '${dictOverride.value}'>`
              : (enumReturnTypeName ?? literalToReturnValueType(outParam.type, false))
            bodyLines.push(`    return ret as unknown as ${multiReturnType}`)
            bodyLines.push(`  })(),`)
          }
        }
      }
      bodyLines.push('}')
    }

    lines.push(bodyLines.join('\n'))
    lines.push('}')
  }

  const newNodesContent = replaceBetweenMarkers(
    nodesContent,
    '// === AUTO-GENERATED START ===',
    '// === AUTO-GENERATED END ===',
    lines.join('\n')
  )
  fs.writeFileSync(nodesPath, newNodesContent)
}

function main() {
  buildEvents()
  buildNodes()
}

main()
