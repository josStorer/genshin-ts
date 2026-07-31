import assert from 'node:assert/strict'
import fs from 'node:fs'

import { decodeUtf8, parseGilPayloadFields } from '../../src/cli/gil_extract_utils.js'
import { parseCustomPrefabs, type CustomPrefabEntry } from '../../src/cli/gil_resources.js'
import {
  buildFile,
  encodeVarint,
  findAncestorFields,
  readVarint
} from '../../src/injector/binary.js'
import type { LenField, ParsedGilPayload } from '../../src/injector/types.js'

function concat(...parts: Uint8Array[]): Uint8Array {
  return Buffer.concat(parts.map((part) => Buffer.from(part)))
}

function varintField(field: number, value: number): Uint8Array {
  return concat(encodeVarint(field << 3), encodeVarint(value))
}

function bytesField(field: number, value: Uint8Array): Uint8Array {
  return concat(encodeVarint((field << 3) | 2), encodeVarint(value.length), value)
}

function customPrefab(params: {
  customId?: number
  basePrefabId?: number
  names?: string[]
}): Uint8Array {
  const names = params.names ?? []
  return bytesField(
    4,
    bytesField(
      1,
      concat(
        ...(params.customId === undefined ? [] : [varintField(1, params.customId)]),
        ...(params.basePrefabId === undefined ? [] : [varintField(2, params.basePrefabId)]),
        ...(names.length === 0
          ? []
          : [
              bytesField(
                6,
                bytesField(
                  11,
                  concat(...names.map((name) => bytesField(1, Buffer.from(name, 'utf8'))))
                )
              )
            ])
      )
    )
  )
}

function isCustomPrefabEntryField(field: LenField): boolean {
  return field.depth === 2 && field.p0 === 4 && field.p1 === 1
}

function isCustomPrefabNameField(field: LenField): boolean {
  return (
    field.depth === 5 &&
    field.p0 === 4 &&
    field.p1 === 1 &&
    field.p2 === 6 &&
    field.p3 === 11 &&
    field.p4 === 1 &&
    field.field === 1
  )
}

function readEntryIds(payload: Uint8Array, start: number, end: number) {
  let offset = start
  let customId: number | undefined
  let basePrefabId: number | undefined
  while (offset < end) {
    const key = readVarint(payload, offset)
    if (!key) break
    offset = key.next
    const field = key.value >> 3
    const wire = key.value & 7
    if (wire === 0) {
      const value = readVarint(payload, offset)
      if (!value) break
      offset = value.next
      if (field === 1) customId = value.value
      else if (field === 2) basePrefabId = value.value
    } else if (wire === 1) {
      offset += 8
    } else if (wire === 2) {
      const length = readVarint(payload, offset)
      if (!length) break
      offset = length.next + length.value
    } else if (wire === 5) {
      offset += 4
    } else {
      break
    }
  }
  return { customId, basePrefabId }
}

function parseCustomPrefabsReference({ payload, fields }: ParsedGilPayload): CustomPrefabEntry[] {
  const entryInfoByRange = new Map<string, { customId?: number; basePrefabId?: number }>()
  for (const field of fields) {
    if (!isCustomPrefabEntryField(field)) continue
    entryInfoByRange.set(
      `${field.dataStart}:${field.dataEnd}`,
      readEntryIds(payload, field.dataStart, field.dataEnd)
    )
  }

  const entries: CustomPrefabEntry[] = []
  const seenEntry = new Set<string>()
  for (const field of fields) {
    if (!isCustomPrefabNameField(field)) continue
    const entryField = findAncestorFields(fields, field).find(isCustomPrefabEntryField)
    if (!entryField) continue
    const entryKey = `${entryField.dataStart}:${entryField.dataEnd}`
    if (seenEntry.has(entryKey)) continue
    const ids = entryInfoByRange.get(entryKey)
    if (!ids?.customId) continue
    const name = decodeUtf8(payload, field.dataStart, field.dataEnd)
    if (!name) continue
    entries.push({ name, id: ids.customId, basePrefabId: ids.basePrefabId })
    seenEntry.add(entryKey)
  }
  return entries
}

function assertEquivalent(parsed: ParsedGilPayload, label: string) {
  const expected = parseCustomPrefabsReference(parsed)
  const actual = parseCustomPrefabs(parsed.payload, parsed.fields)
  assert.deepEqual(actual, expected, `${label}: optimized prefab scan differs from reference`)
  return actual.length
}

const fixtureBytes = buildFile(
  concat(
    customPrefab({ customId: 9001, basePrefabId: 1001, names: ['Same Name', 'Ignored Name'] }),
    bytesField(9, bytesField(3, Buffer.from('unrelated'))),
    customPrefab({ customId: 9002, basePrefabId: 1002, names: ['Same Name'] }),
    customPrefab({ customId: 0, basePrefabId: 1003, names: ['Ignored Zero Id'] }),
    customPrefab({ customId: 9004, basePrefabId: 1004 })
  ),
  {
    schema: 1,
    headTag: 0x0326,
    fileType: 0,
    tailTag: 0x0679
  }
)
assert.equal(assertEquivalent(parseGilPayloadFields(fixtureBytes), 'generated fixture'), 2)

for (const gilPath of process.argv.slice(2)) {
  const count = assertEquivalent(parseGilPayloadFields(fs.readFileSync(gilPath)), gilPath)
  console.log(`[ok] ${gilPath}: ${count} custom prefabs match the reference scanner`)
}

console.log('[ok] optimized custom prefab scan matches the previous reference algorithm')
