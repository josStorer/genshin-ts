import {
  CreationPrefab,
  CreationPrefabZh,
  DynamicPrefab,
  DynamicPrefabZh,
  StaticPrefab,
  StaticPrefabZh
} from '../definitions/prefabs.js'
import { detectLang, initCliI18n } from '../i18n/index.js'
import { readVarint } from '../injector/binary.js'
import type { LenField, ParsedGilPayload } from '../injector/types.js'
import {
  checkExistingGeneratedFile,
  decodeUtf8,
  readGilPayloadFields,
  writeGeneratedFile
} from './gil_extract_utils.js'

export const RESOURCES_HEADER = '// @gsts:resources'
export const DEFAULT_RESOURCES_PATH = 'src/resources/prefabs.ts'

export type CustomPrefabEntry = {
  name: string
  id: number
  basePrefabId?: number
}

export type ExtractCustomResourcesOutcome =
  | { status: 'ok'; outPath: string; count: number }
  | { status: 'skipped-existing'; outPath: string }
  | { status: 'failed'; outPath: string; error: string }

function isCustomPrefabEntryField(f: LenField): boolean {
  return f.depth === 2 && f.p0 === 4 && f.p1 === 1
}

function isCustomPrefabNameField(f: LenField): boolean {
  return (
    f.depth === 5 &&
    f.p0 === 4 &&
    f.p1 === 1 &&
    f.p2 === 6 &&
    f.p3 === 11 &&
    f.p4 === 1 &&
    f.field === 1
  )
}

function readEntryIds(buf: Uint8Array, start: number, end: number) {
  let offset = start
  let customId: number | undefined
  let basePrefabId: number | undefined
  while (offset < end) {
    const key = readVarint(buf, offset)
    if (!key) break
    offset = key.next
    const field = key.value >> 3
    const wire = key.value & 7
    if (wire === 0) {
      const v = readVarint(buf, offset)
      if (!v) break
      offset = v.next
      if (field === 1) customId = v.value
      else if (field === 2) basePrefabId = v.value
    } else if (wire === 1) {
      offset += 8
    } else if (wire === 2) {
      const lenVar = readVarint(buf, offset)
      if (!lenVar) break
      offset = lenVar.next + lenVar.value
    } else if (wire === 5) {
      offset += 4
    } else {
      break
    }
  }
  return { customId, basePrefabId }
}

const prefabNameMapCache = new Map<'zh' | 'en', Map<number, string>>()

function getPrefabNameMap(lang: string): Map<number, string> {
  const useZh = lang.toLowerCase().startsWith('zh')
  const cacheKey = useZh ? 'zh' : 'en'
  const cached = prefabNameMapCache.get(cacheKey)
  if (cached) return cached

  const sources = useZh
    ? [DynamicPrefabZh, StaticPrefabZh, CreationPrefabZh]
    : [DynamicPrefab, StaticPrefab, CreationPrefab]
  const map = new Map<number, string>()
  for (const group of sources) {
    for (const [name, id] of Object.entries(group)) {
      if (typeof id === 'number' && Number.isFinite(id) && !map.has(id)) {
        map.set(id, name)
      }
    }
  }
  prefabNameMapCache.set(cacheKey, map)
  return map
}

export function parseCustomPrefabs(payload: Uint8Array, fields: LenField[]): CustomPrefabEntry[] {
  const entries: CustomPrefabEntry[] = []
  const entryStack: Array<{
    field: LenField
    customId?: number
    basePrefabId?: number
    hasName: boolean
  }> = []

  for (const f of fields) {
    while (entryStack.length > 0) {
      const current = entryStack[entryStack.length - 1].field
      if (current.dataStart <= f.lenOffset && current.dataEnd >= f.dataEnd) break
      entryStack.pop()
    }

    if (isCustomPrefabEntryField(f)) {
      entryStack.push({
        field: f,
        ...readEntryIds(payload, f.dataStart, f.dataEnd),
        hasName: false
      })
      continue
    }
    if (!isCustomPrefabNameField(f)) continue
    const entry = entryStack[entryStack.length - 1]
    if (!entry?.customId || entry.hasName) continue
    const name = decodeUtf8(payload, f.dataStart, f.dataEnd)
    if (!name) continue
    entries.push({ name, id: entry.customId, basePrefabId: entry.basePrefabId })
    entry.hasName = true
  }
  return entries
}

export function extractCustomResourcesFromGil(params: {
  gilPath: string
  outPath: string
  lang?: string
}): ExtractCustomResourcesOutcome {
  const existingCheck = checkExistingGeneratedFile(params.outPath, RESOURCES_HEADER)
  if (existingCheck) return existingCheck

  try {
    return extractCustomResourcesFromParsedGil({
      parsed: readGilPayloadFields(params.gilPath),
      outPath: params.outPath,
      lang: params.lang
    })
  } catch (e) {
    return {
      status: 'failed',
      outPath: params.outPath,
      error: e instanceof Error ? e.message : String(e)
    }
  }
}

export function extractCustomResourcesFromParsedGil(params: {
  parsed: ParsedGilPayload
  outPath: string
  lang?: string
  format?: boolean
}): ExtractCustomResourcesOutcome {
  const resolvedLang = detectLang(params.lang)
  const { t } = initCliI18n(resolvedLang)

  try {
    const entries = parseCustomPrefabs(params.parsed.payload, params.parsed.fields)
    const baseNameMap = getPrefabNameMap(resolvedLang)
    const nameCounts = new Map<string, number>()

    const lines: string[] = []
    lines.push(RESOURCES_HEADER, '', 'export const CustomPrefab = {')
    entries.forEach((entry, idx) => {
      if (idx > 0) lines.push('')
      const prev = nameCounts.get(entry.name) ?? 0
      const next = prev + 1
      nameCounts.set(entry.name, next)
      const displayName = prev === 0 ? entry.name : `${entry.name}_${next}`
      const baseName =
        typeof entry.basePrefabId === 'number' ? baseNameMap.get(entry.basePrefabId) : undefined
      const comment = baseName
        ? t('resourcesBasedOn', { name: baseName })
        : t('resourcesBasedOnId', { id: entry.basePrefabId ?? 'unknown' })
      lines.push('  /**')
      lines.push(`   * ${comment}`)
      lines.push('   */')
      lines.push(`  ${JSON.stringify(displayName)}: ${entry.id},`)
    })
    lines.push('}', '')

    writeGeneratedFile(params.outPath, lines.join('\n'), { format: params.format })
    return { status: 'ok', outPath: params.outPath, count: entries.length }
  } catch (e) {
    return {
      status: 'failed',
      outPath: params.outPath,
      error: e instanceof Error ? e.message : String(e)
    }
  }
}
