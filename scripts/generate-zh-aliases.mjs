import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as ts from 'typescript'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const NODES_PATH = path.join(ROOT, 'src', 'definitions', 'nodes.ts')
const OVERLOADS_PATH = path.join(ROOT, 'src', 'definitions', 'server_on_overloads.d.ts')
const OUTPUT_PATH = path.join(ROOT, 'src', 'definitions', 'zh_aliases.ts')
const REPORT_PATH = path.join(ROOT, 'reports', 'zh-aliases.md')

const IDENTIFIER_RE = /^[$_\p{ID_Start}][$_\p{ID_Continue}]*$/u
const IDENTIFIER_START_RE = /^[$_\p{ID_Start}]$/u
const IDENTIFIER_CONTINUE_RE = /^[$_\p{ID_Continue}]$/u

function readSource(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function getLeadingCommentText(sourceText, node) {
  const ranges = ts.getLeadingCommentRanges(sourceText, node.pos) ?? []
  if (!ranges.length) return ''
  const last = ranges[ranges.length - 1]
  return sourceText.slice(last.pos, last.end)
}

function cleanCommentLines(raw) {
  if (!raw) return []
  let text = raw
  if (text.startsWith('/*')) {
    text = text.replace(/^\/\*+/, '').replace(/\*+\/$/, '')
  } else if (text.startsWith('//')) {
    text = text.replace(/^\/\/+/, '')
  }
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\*\s?/, '').replace(/^\s*\/\//, '').trimEnd())
}

const SKIP_TITLE_PREFIX = [
  '注意',
  '提示',
  '说明',
  '参数',
  '输入',
  '输出',
  '返回',
  '备注',
  'GSTS'
]

// 旧版中文名兼容别名（旧名 -> en 方法名）。官方文档改名后仍保留旧名调用；
// 仅写入 SERVER_F_ZH_TO_EN，SERVER_F_EN_TO_ZH 维持最新中文名。
const ZH_COMPAT_ALIASES = {
  查询对应礼盒消耗数量: 'queryCorrespondingGiftBoxConsumption',
  模运算: 'moduloOperation'
}

function extractZhTitle(lines) {
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('@')) continue
    if (trimmed.startsWith('GSTS')) continue
    if (!/[\u4e00-\u9fff]/.test(trimmed)) continue
    const idxAscii = trimmed.indexOf(':')
    const idxFull = trimmed.indexOf('：')
    const idx = idxAscii !== -1 ? idxAscii : idxFull
    if (idx === -1) continue
    const title = trimmed.slice(0, idx).trim()
    if (!/[\u4e00-\u9fff]/.test(title)) continue
    if (SKIP_TITLE_PREFIX.some((prefix) => title.startsWith(prefix))) continue
    return title
  }
  return null
}

function normalizeZhName(name) {
  const stripped = name.replace(/[\/]/g, '')
  let cleaned = ''
  for (const ch of stripped) {
    if (IDENTIFIER_CONTINUE_RE.test(ch)) cleaned += ch
  }
  while (cleaned && !IDENTIFIER_START_RE.test(cleaned[0])) {
    cleaned = cleaned.slice(1)
  }
  return cleaned
}

function isValidIdentifier(name) {
  return IDENTIFIER_RE.test(name)
}

function parseNodes() {
  const sourceText = readSource(NODES_PATH)
  const sourceFile = ts.createSourceFile(NODES_PATH, sourceText, ts.ScriptTarget.Latest, true)
  const entries = []
  const missing = []
  const zhByName = new Map()
  const implNames = new Set()

  function visit(node) {
    if (ts.isClassDeclaration(node) && node.name?.text === 'ServerExecutionFlowFunctions') {
      for (const member of node.members) {
        if (!ts.isMethodDeclaration(member)) continue
        const nameNode = member.name
        const enName = ts.isIdentifier(nameNode) ? nameNode.text : nameNode.getText(sourceFile)
        if (member.body) implNames.add(enName)
        const comment = getLeadingCommentText(sourceText, member)
        const lines = cleanCommentLines(comment)
        const zhTitle = extractZhTitle(lines)
        if (zhTitle && !zhByName.has(enName)) {
          zhByName.set(enName, zhTitle)
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  for (const enName of implNames) {
    const zhTitle = zhByName.get(enName)
    if (!zhTitle) {
      missing.push(enName)
      continue
    }
    const zhNormalized = normalizeZhName(zhTitle)
    entries.push({
      en: enName,
      zh: zhTitle,
      zhNormalized
    })
  }
  return { entries, missing }
}

function parseEvents() {
  const sourceText = readSource(OVERLOADS_PATH)
  const sourceFile = ts.createSourceFile(OVERLOADS_PATH, sourceText, ts.ScriptTarget.Latest, true)
  const entries = []
  const missing = []

  function eventNameFromType(typeNode) {
    if (ts.isLiteralTypeNode(typeNode) && ts.isStringLiteral(typeNode.literal)) {
      return typeNode.literal.text
    }
    if (
      ts.isTypeReferenceNode(typeNode) &&
      ts.isIdentifier(typeNode.typeName) &&
      typeNode.typeName.text === 'EventNameByLang'
    ) {
      const eventType = typeNode.typeArguments?.[1]
      if (eventType && ts.isLiteralTypeNode(eventType) && ts.isStringLiteral(eventType.literal)) {
        return eventType.literal.text
      }
    }
    return null
  }

  function visit(node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'ServerOnOverloads') {
      for (const member of node.members) {
        if (!ts.isMethodSignature(member)) continue
        if (!ts.isIdentifier(member.name) || member.name.text !== 'on') continue
        const eventParam = member.parameters[0]
        if (!eventParam || !eventParam.type) continue
        const enName = eventNameFromType(eventParam.type)
        if (!enName) continue
        const comment = getLeadingCommentText(sourceText, member)
        const lines = cleanCommentLines(comment)
        const zhTitle = extractZhTitle(lines)
        if (!zhTitle) {
          missing.push(enName)
          continue
        }
        const zhNormalized = normalizeZhName(zhTitle)
        entries.push({
          en: enName,
          zh: zhTitle,
          zhNormalized
        })
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return { entries, missing }
}

function buildMaps(entries, kind) {
  const zhToEn = new Map()
  const enToZh = new Map()
  const duplicates = []
  const invalidIdentifiers = []

  for (const entry of entries) {
    const { en, zh, zhNormalized } = entry
    if (zhToEn.has(zhNormalized)) {
      duplicates.push({ zhNormalized, en, prev: zhToEn.get(zhNormalized) })
      continue
    }
    zhToEn.set(zhNormalized, en)
    enToZh.set(en, zhNormalized)
    if (!isValidIdentifier(zhNormalized)) {
      invalidIdentifiers.push({ zh: zh, normalized: zhNormalized, en })
    }
  }

  if (duplicates.length) {
    const detail = duplicates
      .map((d) => `${d.zhNormalized} -> ${d.prev} / ${d.en}`)
      .join('\n')
    throw new Error(`[${kind}] duplicate zh aliases after normalization:\n${detail}`)
  }

  return { zhToEn, enToZh, invalidIdentifiers }
}

function serializeRecord(entries) {
  return entries
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    .join('\n')
}

function writeOutput(eventMaps, nodeMaps) {
  const eventEntries = Array.from(eventMaps.zhToEn.entries()).sort((a, b) =>
    a[1].localeCompare(b[1])
  )
  const nodeEntries = Array.from(nodeMaps.zhToEn.entries()).sort((a, b) =>
    a[1].localeCompare(b[1])
  )
  const eventEnEntries = Array.from(eventMaps.enToZh.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  )
  const nodeEnEntries = Array.from(nodeMaps.enToZh.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  )

  const lines = []
  lines.push('// AUTO-GENERATED by scripts/generate-zh-aliases.mjs')
  lines.push(`// Sources: ${path.relative(ROOT, NODES_PATH)}, ${path.relative(ROOT, OVERLOADS_PATH)}`)
  lines.push('')
  lines.push("import type { ServerExecutionFlowFunctions } from './nodes.js'")
  lines.push('')
  lines.push('export const SERVER_EVENT_ZH_TO_EN = {')
  lines.push(serializeRecord(eventEntries))
  lines.push('} as const')
  lines.push('')
  lines.push('export const SERVER_EVENT_EN_TO_ZH = {')
  lines.push(serializeRecord(eventEnEntries))
  lines.push('} as const')
  lines.push('')
  lines.push('export const SERVER_F_ZH_TO_EN = {')
  lines.push(serializeRecord(nodeEntries))
  lines.push('} as const')
  lines.push('')
  lines.push('export const SERVER_F_EN_TO_ZH = {')
  lines.push(serializeRecord(nodeEnEntries))
  lines.push('} as const')
  lines.push('')
  lines.push('export type ServerEventNameZh = keyof typeof SERVER_EVENT_ZH_TO_EN')
  lines.push('')
  lines.push('export type ServerExecutionFlowFunctionsZh = {')
  lines.push(
    '  [K in keyof typeof SERVER_F_ZH_TO_EN]: ServerExecutionFlowFunctions[(typeof SERVER_F_ZH_TO_EN)[K]]'
  )
  lines.push('}')
  lines.push('')

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, lines.join('\n'), 'utf8')
}

function writeReport(eventInfo, nodeInfo, eventMissing, nodeMissing) {
  const lines = []
  lines.push('# zh alias extraction report')
  lines.push('')
  lines.push(`- nodes source: ${path.relative(ROOT, NODES_PATH)}`)
  lines.push(`- events source: ${path.relative(ROOT, OVERLOADS_PATH)}`)
  lines.push('')
  lines.push(`## Missing zh titles`)
  lines.push('')
  lines.push(`- ServerExecutionFlowFunctions: ${nodeMissing.length}`)
  nodeMissing.sort().forEach((name) => lines.push(`  - ${name}`))
  lines.push('')
  lines.push(`- ServerOnOverloads events: ${eventMissing.length}`)
  eventMissing.sort().forEach((name) => lines.push(`  - ${name}`))
  lines.push('')
  lines.push('## Invalid identifiers after normalization')
  lines.push('')
  lines.push(`- nodes: ${nodeInfo.invalidIdentifiers.length}`)
  nodeInfo.invalidIdentifiers.forEach((entry) => {
    lines.push(`  - ${entry.normalized} (en: ${entry.en}, zh: ${entry.zh})`)
  })
  lines.push('')
  lines.push(`- events: ${eventInfo.invalidIdentifiers.length}`)
  eventInfo.invalidIdentifiers.forEach((entry) => {
    lines.push(`  - ${entry.normalized} (en: ${entry.en}, zh: ${entry.zh})`)
  })
  lines.push('')

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8')
}

function applyCompatAliases(nodeMaps) {
  for (const [zh, en] of Object.entries(ZH_COMPAT_ALIASES)) {
    if (!nodeMaps.enToZh.has(en)) {
      throw new Error(`compat alias target not found: ${zh} -> ${en}`)
    }
    if (nodeMaps.zhToEn.has(zh)) {
      throw new Error(`compat alias conflicts with generated zh name: ${zh}`)
    }
    nodeMaps.zhToEn.set(zh, en)
  }
}

function main() {
  const nodes = parseNodes()
  const events = parseEvents()

  const nodeMaps = buildMaps(nodes.entries, 'nodes')
  applyCompatAliases(nodeMaps)
  const eventMaps = buildMaps(events.entries, 'events')

  writeOutput(eventMaps, nodeMaps)
  writeReport(eventMaps, nodeMaps, events.missing, nodes.missing)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_PATH)}`)
  console.log(`Wrote ${path.relative(ROOT, REPORT_PATH)}`)
}

main()
