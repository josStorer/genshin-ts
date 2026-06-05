import type { LenField } from '../injector/types.js'
import { readVarint } from '../injector/binary.js'
import type { SignalParamType } from '../runtime/core.js'
import {
  checkExistingGeneratedFile,
  decodeUtf8,
  readFieldBytes,
  readFieldMessages,
  readFieldVarint,
  readGilPayloadFields,
  writeGeneratedFile
} from './gil_extract_utils.js'

export const SIGNALS_HEADER = '// @gsts:signals'
export const DEFAULT_SIGNALS_PATH = 'src/resources/signals.ts'

type NodeGraphIdInfo = {
  type?: number
  nodeId?: number
}

type SignalEntry = {
  name: string
  params: { name: string; type: SignalParamType }[]
}

export type ExtractSignalsOutcome =
  | { status: 'ok'; outPath: string; count: number }
  | { status: 'skipped-existing'; outPath: string }
  | { status: 'failed'; outPath: string; error: string }

const SIGNAL_NODE_TYPE_SKILLS = 20002

function parseNodeGraphId(buf: Uint8Array): NodeGraphIdInfo {
  const out: NodeGraphIdInfo = {}
  let offset = 0
  while (offset < buf.length) {
    const key = readVarint(buf, offset)
    if (!key) break
    offset = key.next
    const field = key.value >> 3
    const wire = key.value & 7
    if (wire === 0) {
      const v = readVarint(buf, offset)
      if (!v) break
      offset = v.next
      if (field === 2) out.type = v.value
      if (field === 5) out.nodeId = v.value
      continue
    }
    if (wire === 2) {
      const lenVar = readVarint(buf, offset)
      if (!lenVar) break
      offset = lenVar.next + lenVar.value
      continue
    }
    if (wire === 1) {
      offset += 8
      continue
    }
    if (wire === 5) {
      offset += 4
      continue
    }
    break
  }
  return out
}

function parseCompositeDefId(buf: Uint8Array): NodeGraphIdInfo | undefined {
  const genericBytes = readFieldBytes(buf, 1)
  if (genericBytes) return parseNodeGraphId(genericBytes)
  const concreteBytes = readFieldBytes(buf, 2)
  if (concreteBytes) return parseNodeGraphId(concreteBytes)
  return undefined
}

function parseSignalName(buf: Uint8Array): string | undefined {
  const defBytes = readFieldBytes(buf, 101) ?? readFieldBytes(buf, 102)
  if (!defBytes) return undefined
  const nameBytes = readFieldBytes(defBytes, 1)
  if (!nameBytes) return undefined
  return decodeUtf8(nameBytes)
}

function mapSignalParamType(typeCode: number | undefined): SignalParamType {
  switch (typeCode) {
    case 1:
      return 'entity'
    case 2:
      return 'guid'
    case 3:
      return 'int'
    case 4:
      return 'bool'
    case 5:
      return 'float'
    case 6:
      return 'str'
    case 7:
      return 'guid_list'
    case 8:
      return 'int_list'
    case 9:
      return 'bool_list'
    case 10:
      return 'float_list'
    case 11:
      return 'str_list'
    case 12:
      return 'vec3'
    case 17:
      return 'faction'
    case 13:
      return 'entity_list'
    case 15:
      return 'vec3_list'
    case 20:
      return 'config_id'
    case 21:
      return 'prefab_id'
    case 22:
      return 'config_id_list'
    case 23:
      return 'prefab_id_list'
    case 24:
      return 'faction_list'
    default:
      return 'unknown'
  }
}

function parseSignalParam(buf: Uint8Array): { name: string; type: SignalParamType } | undefined {
  const nameBytes = readFieldBytes(buf, 1)
  const name = nameBytes ? decodeUtf8(nameBytes) : undefined
  if (!name) return undefined

  const typeBytes = readFieldBytes(buf, 4)
  const typeCode = typeBytes
    ? (readFieldVarint(typeBytes, 4) ?? readFieldVarint(typeBytes, 3))
    : undefined
  return { name, type: mapSignalParamType(typeCode) }
}

function parseSignalEntries(payload: Uint8Array, fields: LenField[]): SignalEntry[] {
  const byName = new Map<string, SignalEntry>()
  const maxContainerBytes = 4096

  for (const f of fields) {
    const len = f.dataEnd - f.dataStart
    if (len <= 0 || len > maxContainerBytes) continue
    const containerBytes = payload.subarray(f.dataStart, f.dataEnd)

    const signalDefBytes = readFieldBytes(containerBytes, 107)
    if (!signalDefBytes) continue
    const signalName = parseSignalName(signalDefBytes)
    if (!signalName || byName.has(signalName)) continue

    const idBytes = readFieldBytes(containerBytes, 4)
    const nodeId = idBytes ? parseCompositeDefId(idBytes) : undefined
    const outputs = readFieldMessages(containerBytes, 103).length
    const isSendSignal =
      !!nodeId?.nodeId && nodeId.type !== SIGNAL_NODE_TYPE_SKILLS && outputs < 3
    if (!isSendSignal) continue

    const params = readFieldMessages(containerBytes, 102)
      .map(parseSignalParam)
      .filter((param): param is { name: string; type: SignalParamType } => !!param)
    byName.set(signalName, { name: signalName, params })
  }

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
}

function buildSignalsSource(entries: SignalEntry[]): string {
  const lines: string[] = []
  lines.push(SIGNALS_HEADER)
  lines.push('', "import { defineSignal } from 'genshin-ts/runtime/core'", '')
  lines.push('export const Signal = {')
  for (const entry of entries) {
    lines.push(`  ${JSON.stringify(entry.name)}: defineSignal(${JSON.stringify(entry.name)}, [`)
    for (const param of entry.params) {
      lines.push(`    [${JSON.stringify(param.name)}, ${JSON.stringify(param.type)}],`)
    }
    lines.push('  ]),')
  }
  lines.push('} as const', '')
  return lines.join('\n')
}

export function extractSignalsFromGil(params: {
  gilPath: string
  outPath: string
}): ExtractSignalsOutcome {
  const existingCheck = checkExistingGeneratedFile(params.outPath, SIGNALS_HEADER)
  if (existingCheck) return existingCheck

  try {
    const { payload, fields } = readGilPayloadFields(params.gilPath)
    const entries = parseSignalEntries(payload, fields)

    writeGeneratedFile(params.outPath, buildSignalsSource(entries))
    return { status: 'ok', outPath: params.outPath, count: entries.length }
  } catch (e) {
    return {
      status: 'failed',
      outPath: params.outPath,
      error: e instanceof Error ? e.message : String(e)
    }
  }
}
