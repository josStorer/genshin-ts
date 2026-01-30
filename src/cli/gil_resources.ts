import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import {
  CreationPrefab,
  CreationPrefabZh,
  DynamicPrefab,
  DynamicPrefabZh,
  StaticPrefab,
  StaticPrefabZh
} from '../definitions/prefabs.js'
import { detectLang, initCliI18n } from '../i18n/index.js'
import { findAncestorFields, parseMessage, readUint32BE, readVarint } from '../injector/binary.js'
import type { LenField } from '../injector/types.js'

export const RESOURCES_HEADER = '// @gsts:resources'
export const DEFAULT_RESOURCES_PATH = 'src/resources/prefabs.ts'

type CustomPrefabEntry = {
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

function decodeUtf8(buf: Uint8Array, start: number, end: number): string {
  return Buffer.from(buf.subarray(start, end)).toString('utf8')
}

function buildPrefabNameMap(lang: string): Map<number, string> {
  const useZh = lang.toLowerCase().startsWith('zh')
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
  return map
}

function hasResourcesHeader(text: string): boolean {
  const lines = text.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    return trimmed === RESOURCES_HEADER
  }
  return false
}

function tryFormatWithPrettier(filePath: string) {
  try {
    const require = createRequire(import.meta.url)
    let prettierBin: string | undefined
    try {
      prettierBin = require.resolve('prettier/bin-prettier.cjs')
    } catch {
      try {
        prettierBin = require.resolve('prettier/bin/prettier.cjs')
      } catch {
        return
      }
    }
    const res = spawnSync(process.execPath, [prettierBin, '--write', filePath], {
      encoding: 'utf8',
      windowsHide: true
    })
    if (res.error || res.status !== 0) {
      // best-effort formatting; ignore failures
    }
  } catch {
    // prettier not installed; ignore
  }
}

function parseCustomPrefabs(payload: Uint8Array, fields: LenField[]): CustomPrefabEntry[] {
  const entryInfoByRange = new Map<string, { customId?: number; basePrefabId?: number }>()
  for (const f of fields) {
    if (!isCustomPrefabEntryField(f)) continue
    const ids = readEntryIds(payload, f.dataStart, f.dataEnd)
    entryInfoByRange.set(`${f.dataStart}:${f.dataEnd}`, ids)
  }

  const entries: CustomPrefabEntry[] = []
  const seenEntry = new Set<string>()
  for (const f of fields) {
    if (!isCustomPrefabNameField(f)) continue
    const ancestors = findAncestorFields(fields, f)
    const entryField = ancestors.find(isCustomPrefabEntryField)
    if (!entryField) continue
    const entryKey = `${entryField.dataStart}:${entryField.dataEnd}`
    if (seenEntry.has(entryKey)) continue
    const ids = entryInfoByRange.get(entryKey)
    if (!ids?.customId) continue
    const name = decodeUtf8(payload, f.dataStart, f.dataEnd)
    if (!name) continue
    entries.push({ name, id: ids.customId, basePrefabId: ids.basePrefabId })
    seenEntry.add(entryKey)
  }
  return entries
}

export function extractCustomResourcesFromGil(params: {
  gilPath: string
  outPath: string
  lang?: string
}): ExtractCustomResourcesOutcome {
  const resolvedLang = detectLang(params.lang)
  const { t } = initCliI18n(resolvedLang)

  if (fs.existsSync(params.outPath)) {
    try {
      const existing = fs.readFileSync(params.outPath, 'utf8')
      if (!hasResourcesHeader(existing)) {
        return { status: 'skipped-existing', outPath: params.outPath }
      }
    } catch (e) {
      return {
        status: 'failed',
        outPath: params.outPath,
        error: e instanceof Error ? e.message : String(e)
      }
    }
  }

  try {
    const bytes = new Uint8Array(fs.readFileSync(params.gilPath))
    if (bytes.length < 24) {
      throw new Error('[error] invalid gil size')
    }
    const headTag = readUint32BE(bytes, 8)
    const tailTag = readUint32BE(bytes, bytes.length - 4)
    if (headTag !== 0x0326 || tailTag !== 0x0679) {
      throw new Error('[error] invalid gil header tags')
    }

    const payload = bytes.slice(20, -4)
    const fields: LenField[] = []
    parseMessage(payload, 0, payload.length, 0, 0, 0, 0, 0, 0, 0, fields)
    const entries = parseCustomPrefabs(payload, fields)
    const baseNameMap = buildPrefabNameMap(resolvedLang)
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

    fs.mkdirSync(path.dirname(params.outPath), { recursive: true })
    fs.writeFileSync(params.outPath, lines.join('\n'))
    tryFormatWithPrettier(params.outPath)
    return { status: 'ok', outPath: params.outPath, count: entries.length }
  } catch (e) {
    return {
      status: 'failed',
      outPath: params.outPath,
      error: e instanceof Error ? e.message : String(e)
    }
  }
}
