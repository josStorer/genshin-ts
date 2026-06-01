import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const args = new Set(process.argv.slice(2))
const full = !args.has('--changed-only')
const stdoutOnly = args.has('--stdout')
const ignoreGsts = !args.has('--include-gsts')

const rawDefPath = path.join(ROOT, 'resources', 'node_definitions.json')
const nodesPath = path.join(ROOT, 'src', 'definitions', 'nodes.ts')
const eventsPath = path.join(ROOT, 'src', 'definitions', 'events.ts')
const zhAliasesPath = path.join(ROOT, 'src', 'definitions', 'zh_aliases.ts')
const outPath = path.join(
  ROOT,
  'resources',
  full ? 'node_definitions_diff_full.json' : 'node_definitions_diff.json'
)
const mdOutPath = outPath.replace(/\.json$/, '.md')

const rawDef = JSON.parse(fs.readFileSync(rawDefPath, 'utf8'))
const nodesText = fs.readFileSync(nodesPath, 'utf8')
const eventsText = fs.readFileSync(eventsPath, 'utf8')
const zhAliasesText = fs.existsSync(zhAliasesPath) ? fs.readFileSync(zhAliasesPath, 'utf8') : ''

const TYPE_MAP = {
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
  'config id list': 'configId_list',
  faction: 'faction',
  'faction list': 'faction_list',
  entity: 'entity',
  emtity: 'entity',
  'entity list': 'entity_list',
  enumeration: 'enumeration',
  dictionary: 'dict',
  'generic dictionary': 'dict',
  'custom variable snapshot': 'customVariableSnapshot',
  generic: 'generic',
  'generic list': 'generic_list',
  '3d vector': 'vec3',
  vector: 'vec3',
  'local variable': 'localVariable',
  '': 'struct'
}

function toIdentifier(name) {
  const parts = name
    .split(/[^a-zA-Z0-9]+/g)
    .map((part) => part.toLowerCase())
    .filter((part) => /^[a-z0-9]+$/.test(part))
  const [head, ...rest] = parts
  let id =
    head[0].toLowerCase() +
    head.slice(1) +
    rest.map((p) => p[0].toUpperCase() + p.slice(1)).join('')
  if (/^[0-9]/.test(id)) id = `_${id}`
  return id
}

function mapType(type) {
  const t = type.trim().toLowerCase()
  return TYPE_MAP[t] ?? 'unknown'
}

function readExistingEnToZhMap(exportName) {
  if (!zhAliasesText) return new Map()
  const startMarker = `export const ${exportName} = {`
  const start = zhAliasesText.indexOf(startMarker)
  if (start === -1) return new Map()
  const bodyStart = start + startMarker.length
  const end = zhAliasesText.indexOf('\n} as const', bodyStart)
  if (end === -1) return new Map()

  const map = new Map()
  for (const line of zhAliasesText.slice(bodyStart, end).split('\n')) {
    const item = line.match(/^\s*([A-Za-z0-9_$]+):\s*'([^']*)',?\s*$/)
    if (item) map.set(item[1], item[2])
  }
  return map
}

const existingServerEventEnToZh = readExistingEnToZhMap('SERVER_EVENT_EN_TO_ZH')
const existingServerFunctionEnToZh = readExistingEnToZhMap('SERVER_F_EN_TO_ZH')

const reportNodeZhOverrides = {
  setListValue: '对列表设置值',
  reviveTheActiveCharacter: '复苏当前场上角色',
  refreshNotificationQueue: '更新消息队列',
  switchCustomMaps: '切换自定义地图',
  increaseAchievementProgressTally: '增加成就进度计数',
  noOfTasksConfigured: '设置任务计数',
  increaseTaskCount: '增加任务计数',
  querySpecifiedTaskCount: '查询指定任务计数',
  queryIfSpecifiedTaskIsCompleted: '查询指定任务是否完成'
}

const reportEventZhOverrides = {
  whenEntityIsRemovedDestroyed: '实体移除/销毁时'
}

function normalizeTypeText(typeText, enumNames, mode) {
  if (!typeText) return mode === 'return' ? 'void' : 'unknown'
  let t = typeText.replace(/\s+/g, '')
  if (!t) return mode === 'return' ? 'void' : 'unknown'
  if (t === 'void') return 'void'

  const listSuffix = t.endsWith('[]')
  if (listSuffix) {
    const inner = normalizeTypeText(t.slice(0, -2), enumNames, mode)
    return inner === 'unknown' ? 'unknown_list' : `${inner}_list`
  }

  if (t.startsWith('RuntimeParameterValueTypeMap') || t.startsWith('RuntimeReturnValueTypeMap')) {
    if (t.includes('_list') || t.includes('list')) return 'generic_list'
    return 'generic'
  }

  if (
    t.startsWith('dict<') ||
    t === 'DictValue' ||
    t === 'DictValueType' ||
    t === 'DictValueTypeMap'
  ) {
    return 'dict'
  }

  if (enumNames.has(t)) return 'enumeration'

  if (/EntityOf<|Entity$/.test(t) || /Entity\b/.test(t)) return 'entity'

  const valueMap = {
    BoolValue: 'bool',
    IntValue: 'int',
    FloatValue: 'float',
    StrValue: 'str',
    Vec3Value: 'vec3',
    GuidValue: 'guid',
    PrefabIdValue: 'prefabId',
    ConfigIdValue: 'configId',
    FactionValue: 'faction',
    EntityValue: 'entity',
    CustomVariableSnapshotValue: 'customVariableSnapshot',
    LocalVariableValue: 'localVariable',
    EnumerationValue: 'enumeration',
    GenericValue: 'generic'
  }
  if (valueMap[t]) return valueMap[t]

  if (t === 'boolean') return 'bool'
  if (t === 'bigint') return 'int'
  if (t === 'number') return 'float'
  if (t === 'string') return 'str'
  if (t === 'vec3') return 'vec3'
  if (t === 'guid') return 'guid'
  if (t === 'entity') return 'entity'
  if (t === 'prefabId') return 'prefabId'
  if (t === 'configId') return 'configId'
  if (t === 'customVariableSnapshot') return 'customVariableSnapshot'
  if (t === 'localVariable') return 'localVariable'
  if (t === 'faction') return 'faction'
  if (t.startsWith('list<')) {
    const inner = t.slice(5, -1).replace(/['"]/g, '')
    const base = normalizeTypeText(inner, enumNames, mode)
    return base === 'unknown' ? 'unknown_list' : `${base}_list`
  }
  return 'unknown'
}

function buildNodesFromJson() {
  const nodeKeys = [
    'server_exec_en-us',
    'server_flow_en-us',
    'server_calc_en-us',
    'server_query_en-us'
  ]
  const nodes = new Map()

  for (const key of nodeKeys) {
    const nodeDef = rawDef[key]
    const nodeDefZh = rawDef[key.replace('en-us', 'zh-cn')]
    nodeDef.sections.forEach((section, sIndex) => {
      section.nodes.forEach((node, nIndex) => {
        const nodeName = toIdentifier(node.name)
        const nodeZh = nodeDefZh?.sections?.[sIndex]?.nodes?.[nIndex]
        const zhName =
          reportNodeZhOverrides[nodeName] ?? existingServerFunctionEnToZh.get(nodeName) ?? ''

        let inputParamCounter = 0
        const params = !('parameters' in node)
          ? []
          : (node.parameters || [])
              .map((p) => {
                const isInput = p.io.toLowerCase().includes('input')
                let paramName = p.name
                if (!paramName && isInput) {
                  inputParamCounter++
                  paramName = `input${inputParamCounter}`
                }
                if (!paramName) return null
                const rawName = toIdentifier(paramName)
                const adjustedName =
                  nodeName === 'equal' && /^enumeration\d+$/.test(rawName)
                    ? rawName.replace('enumeration', 'input')
                    : rawName
                return {
                  name: adjustedName,
                  type: mapType(p.data_type),
                  input: isInput
                }
              })
              .filter(Boolean)

        const inputs = params.filter((p) => p.input)
        const outputs = params.filter((p) => !p.input)

        nodes.set(nodeName, {
          name: nodeName,
          rawName: node.name,
          zhName,
          zhNameSource: zhName ? 'alias-or-override' : 'unverified',
          zhNameFallback: nodeZh?.name || '',
          section: section.title || '',
          inputs,
          outputs
        })
      })
    })
  }
  return nodes
}

function buildEventsFromJson() {
  const eventDef = rawDef['server_event_en-us']
  const eventDefZh = rawDef['server_event_zh-cn']
  const events = new Map()

  eventDef.sections.forEach((section, sIndex) => {
    section.nodes.forEach((node, nIndex) => {
      const eventName = toIdentifier(node.name)
      const nodeZh = eventDefZh?.sections?.[sIndex]?.nodes?.[nIndex]
      const zhName =
        reportEventZhOverrides[eventName] ?? existingServerEventEnToZh.get(eventName) ?? ''
      const params = (node.parameters || [])
        .map((p) => {
          if (!p.name) return null
          return {
            name: toIdentifier(p.name),
            type: mapType(p.data_type),
            input: false
          }
        })
        .filter(Boolean)

      events.set(eventName, {
        name: eventName,
        rawName: node.name,
        zhName,
        zhNameSource: zhName ? 'alias-or-override' : 'unverified',
        zhNameFallback: nodeZh?.name || '',
        section: section.title || '',
        inputs: params,
        outputs: []
      })
    })
  })

  return events
}

function parseNodesTs() {
  const source = ts.createSourceFile(nodesPath, nodesText, ts.ScriptTarget.Latest, true)
  const startMarker = nodesText.indexOf('// === AUTO-GENERATED START ===')
  const endMarker = nodesText.indexOf('// === AUTO-GENERATED END ===')

  const enumNames = new Set()
  for (const stmt of source.statements) {
    if (!ts.isImportDeclaration(stmt)) continue
    const moduleName = stmt.moduleSpecifier.text
    if (moduleName !== './enum.js') continue
    const bindings = stmt.importClause?.namedBindings
    if (!bindings || !ts.isNamedImports(bindings)) continue
    for (const el of bindings.elements) enumNames.add(el.name.text)
  }

  const gstsMethods = new Set()
  for (const stmt of source.statements) {
    if (!ts.isClassDeclaration(stmt)) continue
    if (stmt.name?.text !== 'ServerExecutionFlowFunctions') continue
    for (const member of stmt.members) {
      if (!ts.isMethodDeclaration(member)) continue
      const name = member.name && ts.isIdentifier(member.name) ? member.name.text : null
      if (!name) continue
      const tags = ts.getJSDocTags(member)
      if (tags.some((tag) => tag.tagName.getText(source) === 'gsts')) {
        gstsMethods.add(name)
      }
    }
  }

  const nodes = new Map()
  for (const stmt of source.statements) {
    if (!ts.isClassDeclaration(stmt)) continue
    if (stmt.name?.text !== 'ServerExecutionFlowFunctions') continue
    for (const member of stmt.members) {
      if (!ts.isMethodDeclaration(member)) continue
      if (!member.body) continue
      const modifiers = ts.getCombinedModifierFlags(member)
      if (modifiers & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) continue
      const start = member.getStart(source)
      const end = member.getEnd()
      if (!full && (start < startMarker || end > endMarker)) continue

      const name = member.name && ts.isIdentifier(member.name) ? member.name.text : null
      if (!name) continue

      if (ignoreGsts && gstsMethods.has(name)) continue

      const params = member.parameters.map((p) => {
        const paramName = p.name.getText(source)
        const typeText = p.type?.getText(source) ?? ''
        const typeBase = normalizeTypeText(typeText, enumNames, 'param')
        return { name: paramName, type: typeBase }
      })

      const outputs = []
      if (member.type && ts.isTypeLiteralNode(member.type)) {
        for (const m of member.type.members) {
          if (!ts.isPropertySignature(m) || !m.name) continue
          const propName = m.name.getText(source)
          const propTypeText = m.type?.getText(source) ?? ''
          const propTypeBase = normalizeTypeText(propTypeText, enumNames, 'return')
          outputs.push({ name: propName, type: propTypeBase })
        }
      } else {
        const returnTypeText = member.type?.getText(source) ?? 'void'
        const base = normalizeTypeText(returnTypeText, enumNames, 'return')
        if (base !== 'void') outputs.push({ name: null, type: base })
      }

      nodes.set(name, { name, inputs: params, outputs })
    }
  }

  return nodes
}

function normalizeMetadataBase(typeBase) {
  const map = {
    bool: 'bool',
    int: 'int',
    float: 'float',
    str: 'str',
    vec3: 'vec3',
    guid: 'guid',
    entity: 'entity',
    faction: 'faction',
    configId: 'configId',
    prefabId: 'prefabId',
    customVariableSnapshot: 'customVariableSnapshot',
    localVariable: 'localVariable',
    generic: 'generic',
    dict: 'dict',
    enumeration: 'enumeration'
  }
  return map[typeBase] || typeBase || 'unknown'
}

function parseEventsTs() {
  const startMarker = eventsText.indexOf('// === AUTO-GENERATED START ===')
  const endMarker = eventsText.indexOf('// === AUTO-GENERATED END ===')
  const body =
    startMarker >= 0 && endMarker > startMarker
      ? eventsText.slice(startMarker, endMarker)
      : eventsText
  const events = new Map()

  const eventRe = /^\s{2}([A-Za-z_$][\w$]*):\s*\[([\s\S]*?)\n\s{2}\],?/gm
  for (const eventMatch of body.matchAll(eventRe)) {
    const name = eventMatch[1]
    const block = eventMatch[2]
    const params = []
    const paramRe =
      /name:\s*'([^']+)'\s*,\s*typeBase:\s*([A-Za-z_$][\w$]*)\s*,\s*typeName:\s*'([^']+)'\s*,\s*isArray:\s*(true|false)/g
    for (const paramMatch of block.matchAll(paramRe)) {
      const base = normalizeMetadataBase(paramMatch[2])
      params.push({
        name: paramMatch[1],
        type: paramMatch[4] === 'true' ? `${base}_list` : base,
        input: false
      })
    }
    events.set(name, { name, inputs: params, outputs: [] })
  }

  return events
}

function signature(node) {
  const inSig = node.inputs.map((p) => p.type).join(',')
  const outSig = node.outputs.map((p) => p.type).join(',')
  return `in(${inSig})|out(${outSig})`
}

const manualRenames = [
  ['modifyValueInList', 'setListValue'],
  ['modifyEntityFaction', 'setEntityFaction'],
  ['reviveActiveCharacter', 'reviveTheActiveCharacter'],
  ['modifySkillCdPercentageBasedOnMaxCd', 'setSkillCdBasedOnMaximumCdPercentage'],
  ['modifyCharacterSkillCd', 'increaseCharacterSkillCd'],
  ['modifyInventoryItemQuantity', 'increaseInventoryItemQuantity'],
  ['modifyInventoryCurrencyQuantity', 'increaseInventoryCurrencyQuantity'],
  ['modifyLootItemComponentQuantity', 'increaseLootComponentItemQuantity'],
  ['modifyLootComponentCurrencyAmount', 'increaseLootComponentCurrencyQuantity'],
  ['modifyPlayerListForVisibleMiniMapMarkers', 'setPlayerListForVisibleMiniMapMarkers'],
  ['modifyPlayerListForTrackingMiniMapMarkers', 'setPlayerListForTrackingMiniMapMarkers'],
  ['changeAchievementProgressTally', 'increaseAchievementProgressTally']
]

const manualSignatureNodes = new Set([
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
  'doubleBranch',
  'modifyStructure',
  'assembleStructure',
  'splitStructure',
  'refreshNotificationQueue'
])

const manualSignatureEvents = new Set([
  // Editor truth: the current implementation still has these output parameters.
  'whenTheActiveCharacterChanges'
])

function compareCollections(expected, current, manualRenamePairs = [], options = {}) {
  const added = []
  const removed = []
  for (const [name] of expected) if (!current.has(name)) added.push(name)
  for (const [name] of current) if (!expected.has(name)) removed.push(name)

  const addedBySig = new Map()
  for (const name of added) {
    const node = expected.get(name)
    const sig = signature(node)
    if (!addedBySig.has(sig)) addedBySig.set(sig, [])
    addedBySig.get(sig).push(name)
  }

  const renamePairs = []
  const renamedAdded = new Set()
  const renamedRemoved = new Set()

  for (const name of removed) {
    const node = current.get(name)
    const sig = signature(node)
    const candidates = addedBySig.get(sig) || []
    if (candidates.length === 1) {
      const newName = candidates[0]
      renamePairs.push({ from: name, to: newName, signature: sig })
      renamedAdded.add(newName)
      renamedRemoved.add(name)
    }
  }

  for (const [from, to] of manualRenamePairs) {
    if (renamedRemoved.has(from) || renamedAdded.has(to)) continue
    if (!removed.includes(from) || !added.includes(to)) continue
    const node = current.get(from) || expected.get(to)
    const sig = node ? signature(node) : ''
    renamePairs.push({ from, to, signature: sig, manual: true })
    renamedAdded.add(to)
    renamedRemoved.add(from)
  }

  const signatureChanges = []
  for (const [name, expectedNode] of expected) {
    if (!current.has(name)) continue
    if (options.ignoreSignatureNames?.has(name)) continue
    const currentNode = current.get(name)
    const expectedSignature = signature(expectedNode)
    const currentSignature = signature(currentNode)
    if (expectedSignature !== currentSignature) {
      signatureChanges.push({
        name,
        rawName: expectedNode.rawName,
        zhName: expectedNode.zhName,
        section: expectedNode.section,
        current: currentSignature,
        resource: expectedSignature,
        currentInputs: currentNode.inputs,
        resourceInputs: expectedNode.inputs,
        currentOutputs: currentNode.outputs,
        resourceOutputs: expectedNode.outputs
      })
    }
  }

  const filteredAdded = added.filter((n) => !renamedAdded.has(n))
  const filteredRemoved = removed.filter((n) => !renamedRemoved.has(n))

  return {
    counts: {
      expected: expected.size,
      current: current.size,
      added: added.length,
      removed: removed.length,
      renamePairs: renamePairs.length,
      signatureChanges: signatureChanges.length,
      filteredAdded: filteredAdded.length,
      filteredRemoved: filteredRemoved.length
    },
    renamePairs,
    signatureChanges,
    filteredAdded: filteredAdded.map((name) => expected.get(name)),
    filteredRemoved: filteredRemoved.map((name) => current.get(name)),
    added,
    removed
  }
}

const nodeExpected = buildNodesFromJson()
const nodeCurrent = parseNodesTs()
const eventExpected = buildEventsFromJson()
const eventCurrent = parseEventsTs()

// Resource lists this as a classic display variant, but the TypeScript API uses
// teleportPlayer for both modes and resolves the vendor ID by graph mode.
nodeExpected.delete('teleportPlayerClassicMode')

const nodeDiff = compareCollections(nodeExpected, nodeCurrent, manualRenames, {
  ignoreSignatureNames: manualSignatureNodes
})
const eventDiff = compareCollections(eventExpected, eventCurrent, [], {
  ignoreSignatureNames: manualSignatureEvents
})
const result = {
  counts: {
    nodes: nodeDiff.counts,
    events: eventDiff.counts
  },
  nodes: nodeDiff,
  events: eventDiff,
  // Backward-compatible top-level fields for older ad-hoc consumers.
  renamePairs: nodeDiff.renamePairs,
  filteredAdded: nodeDiff.filteredAdded.map((item) => item.name),
  filteredRemoved: nodeDiff.filteredRemoved.map((item) => item.name),
  added: nodeDiff.added,
  removed: nodeDiff.removed
}

function formatParamList(params) {
  if (!params || params.length === 0) return '(none)'
  return params.map((p) => `${p.name || '?'}:${p.type}`).join(', ')
}

function appendItemList(lines, title, items) {
  lines.push(`### ${title}`)
  if (!items.length) {
    lines.push('')
    lines.push('- None')
    lines.push('')
    return
  }
  lines.push('')
  for (const item of items) {
    const label = item.rawName
      ? `${item.name} (${item.rawName}${item.zhName ? ` / ${item.zhName}` : ''})`
      : item.name
    lines.push(`- \`${label}\``)
    if (item.section) lines.push(`  - Section: ${item.section}`)
    if (item.inputs?.length) lines.push(`  - Params: ${formatParamList(item.inputs)}`)
    if (item.outputs?.length) lines.push(`  - Returns: ${formatParamList(item.outputs)}`)
  }
  lines.push('')
}

function appendSignatureChanges(lines, title, changes) {
  lines.push(`### ${title}`)
  if (!changes.length) {
    lines.push('')
    lines.push('- None')
    lines.push('')
    return
  }
  lines.push('')
  for (const item of changes) {
    const label = item.rawName
      ? `${item.name} (${item.rawName}${item.zhName ? ` / ${item.zhName}` : ''})`
      : item.name
    lines.push(`- \`${label}\``)
    if (item.section) lines.push(`  - Section: ${item.section}`)
    lines.push(`  - Current params: ${formatParamList(item.currentInputs)}`)
    lines.push(`  - Resource params: ${formatParamList(item.resourceInputs)}`)
    lines.push(`  - Current returns: ${formatParamList(item.currentOutputs)}`)
    lines.push(`  - Resource returns: ${formatParamList(item.resourceOutputs)}`)
  }
  lines.push('')
}

function appendRenamePairs(lines, title, pairs) {
  lines.push(`### ${title}`)
  if (!pairs.length) {
    lines.push('')
    lines.push('- None')
    lines.push('')
    return
  }
  lines.push('')
  for (const pair of pairs) {
    lines.push(`- \`${pair.from}\` -> \`${pair.to}\`${pair.manual ? ' (manual candidate)' : ''}`)
    lines.push(`  - Signature: \`${pair.signature}\``)
  }
  lines.push('')
}

function toMarkdown(diff) {
  const lines = [
    '# Node Definitions Diff Report',
    '',
    'This report is read-only guidance for manual maintenance. Do not apply it as a full generated replacement for definition files.',
    '',
    '## Counts',
    '',
    '| Area | Resource | Current | Added | Removed | Rename candidates | Signature changes | Added after renames | Removed after renames |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'
  ]
  for (const [area, counts] of [
    ['Nodes', diff.counts.nodes],
    ['Events', diff.counts.events]
  ]) {
    lines.push(
      `| ${area} | ${counts.expected} | ${counts.current} | ${counts.added} | ${counts.removed} | ${counts.renamePairs} | ${counts.signatureChanges} | ${counts.filteredAdded} | ${counts.filteredRemoved} |`
    )
  }
  lines.push('')
  lines.push('## Nodes')
  lines.push('')
  appendRenamePairs(lines, 'Rename Candidates', diff.nodes.renamePairs)
  appendItemList(lines, 'New Node Candidates', diff.nodes.filteredAdded)
  appendItemList(lines, 'Removed Node Candidates', diff.nodes.filteredRemoved)
  appendSignatureChanges(lines, 'Node Signature Changes', diff.nodes.signatureChanges)
  lines.push('## Events')
  lines.push('')
  appendRenamePairs(lines, 'Rename Candidates', diff.events.renamePairs)
  appendItemList(lines, 'New Event Candidates', diff.events.filteredAdded)
  appendItemList(lines, 'Removed Event Candidates', diff.events.filteredRemoved)
  appendSignatureChanges(lines, 'Event Signature Changes', diff.events.signatureChanges)
  return `${lines.join('\n')}\n`
}

const markdown = toMarkdown(result)

if (!stdoutOnly) {
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2))
  fs.writeFileSync(mdOutPath, markdown)
  console.log(`Wrote ${outPath}`)
  console.log(`Wrote ${mdOutPath}`)
}
if (stdoutOnly) {
  console.log(markdown)
} else {
  console.log(JSON.stringify({ counts: result.counts }, null, 2))
}
