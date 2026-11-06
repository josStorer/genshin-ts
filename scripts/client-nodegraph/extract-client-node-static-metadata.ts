import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { NODE_PIN_RECORDS } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_pin_records.js'

type WireField =
  | { field: number; wire: 0; value: bigint }
  | { field: number; wire: 1; bytes: Uint8Array }
  | { field: number; wire: 2; bytes: Uint8Array }
  | { field: number; wire: 5; bytes: Uint8Array }

type StaticTypeVariant = {
  valueClass?: number
  clientVarType?: number
  connectionType?: number
}

type StaticLiteral = number | string | boolean | [number, number, number]

type StaticPin = StaticTypeVariant & {
  kind: 'input' | 'output' | 'in_flow' | 'out_flow' | 'client_exec' | 'client_signal'
  index: number
  i2Index?: number
  connectable?: boolean
  variants?: StaticTypeVariant[]
  nameHash?: number
  name?: string
  defaultValue?: StaticLiteral
  unsupportedDefaultPayload?: string
}

/** [encodedKind, pinIndex, indexOfConcrete, role?, keyClientVarType?, valueClientVarType?] */
type StaticVariantBinding = [number, number, number, number?, number?, number?]

type StaticConcreteVariantGroup = {
  graphType: number
  variants: Array<{
    concreteId: number
    bindings: StaticVariantBinding[]
  }>
}

type ClientNodeModeData = {
  graphs: Record<
    string,
    {
      entryGenericId: number
      beyond: { genericIds: number[] }
      classic: { genericIds: number[] }
    }
  >
}

const DEFAULT_NODE_ROOT =
  'D:\\Genshin Impact\\Genshin Impact Game\\BeyondAssets\\BeyondAssistEditor\\Resource\\Json\\Beyond\\Node'
const CHS_TEXT_MAP_FILE = '17720714722766726369.mihoyobin'
const MODE_DATA_PATH = 'resources/client_node_modes.json'
const CLIENT_OUTPUT_PATH = 'resources/client_node_static_metadata.json'
const CLIENT_VARIANT_OUTPUT_PATH = 'resources/client_node_concrete_variants.json'
const SERVER_OUTPUT_PATH = 'resources/server_node_static_metadata.json'
const XOR_KEY = 0xe5

const PIN_GROUPS = [
  { field: 100, kind: 'in_flow', encodedKind: 1 },
  { field: 101, kind: 'out_flow', encodedKind: 2 },
  { field: 102, kind: 'input', encodedKind: 3 },
  { field: 103, kind: 'output', encodedKind: 4 },
  { field: 106, kind: 'client_exec', encodedKind: 5 },
  { field: 107, kind: 'client_signal', encodedKind: 6 }
] as const

function readVarint(buffer: Uint8Array, start: number) {
  let value = 0n
  let shift = 0n
  let offset = start
  while (offset < buffer.length && shift < 70n) {
    const byte = buffer[offset++]
    value |= BigInt(byte & 0x7f) << shift
    if ((byte & 0x80) === 0) return { value, offset }
    shift += 7n
  }
  throw new Error(`[error] invalid protobuf varint at offset ${start}`)
}

function parseMessage(buffer: Uint8Array): WireField[] {
  const fields: WireField[] = []
  let offset = 0
  while (offset < buffer.length) {
    const key = readVarint(buffer, offset)
    offset = key.offset
    const field = Number(key.value >> 3n)
    const wire = Number(key.value & 7n)
    if (wire === 0) {
      const result = readVarint(buffer, offset)
      offset = result.offset
      fields.push({ field, wire, value: result.value })
      continue
    }
    if (wire === 1 || wire === 5) {
      const length = wire === 1 ? 8 : 4
      const end = offset + length
      if (end > buffer.length) throw new Error(`[error] truncated protobuf field ${field}`)
      fields.push({ field, wire, bytes: buffer.slice(offset, end) })
      offset = end
      continue
    }
    if (wire !== 2) throw new Error(`[error] unsupported protobuf wire type ${wire}`)
    const length = readVarint(buffer, offset)
    offset = length.offset
    const end = offset + Number(length.value)
    if (end > buffer.length) throw new Error(`[error] truncated protobuf field ${field}`)
    fields.push({ field, wire, bytes: buffer.slice(offset, end) })
    offset = end
  }
  return fields
}

function numberField(fields: WireField[], field: number): number | undefined {
  const value = fields.find(
    (item): item is Extract<WireField, { wire: 0 }> => item.field === field && item.wire === 0
  )?.value
  if (value === undefined) return undefined
  const number = Number(value)
  if (!Number.isSafeInteger(number)) throw new Error(`[error] field ${field} exceeds safe integer`)
  return number
}

function signedInt32Field(fields: WireField[], field: number): number | undefined {
  const value = fields.find(
    (item): item is Extract<WireField, { wire: 0 }> => item.field === field && item.wire === 0
  )?.value
  return value === undefined ? undefined : Number(BigInt.asIntN(32, value))
}

function bytesField(fields: WireField[], field: number): Uint8Array | undefined {
  return fields.find(
    (item): item is Extract<WireField, { wire: 2 }> => item.field === field && item.wire === 2
  )?.bytes
}

function messageField(fields: WireField[], field: number): WireField[] {
  const bytes = bytesField(fields, field)
  return bytes ? parseMessage(bytes) : []
}

function repeatedMessages(fields: WireField[], field: number): WireField[][] {
  return fields
    .filter(
      (item): item is Extract<WireField, { wire: 2 }> => item.field === field && item.wire === 2
    )
    .map((item) => parseMessage(item.bytes))
}

function typeVariant(fields: WireField[]): StaticTypeVariant {
  const valueClass = numberField(fields, 1)
  const clientVarType = numberField(fields, 4)
  const connectionType = numberField(fields, 3)
  return {
    ...(valueClass !== undefined ? { valueClass } : {}),
    ...(clientVarType !== undefined ? { clientVarType } : {}),
    ...(connectionType !== undefined ? { connectionType } : {})
  }
}

function float32Field(fields: WireField[], field: number): number | undefined {
  const bytes = fields.find(
    (item): item is Extract<WireField, { wire: 5 }> => item.field === field && item.wire === 5
  )?.bytes
  if (!bytes) return undefined
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getFloat32(0, true)
}

function stringField(fields: WireField[], field: number): string | undefined {
  const bytes = bytesField(fields, field)
  return bytes ? new TextDecoder().decode(bytes) : undefined
}

function readLocalizedTextByHash(textMapPath: string) {
  const raw = fs.readFileSync(textMapPath)
  const decoded = Uint8Array.from(raw, (byte) => byte ^ XOR_KEY)
  const byHash = new Map<number, string | undefined>()

  for (const entry of repeatedMessages(parseMessage(decoded), 2)) {
    const hash = numberField(entry, 2)
    if (hash === undefined) throw new Error('[error] CHS TextMap entry has no hash')
    const text = stringField(entry, 3)
    if (byHash.has(hash)) throw new Error(`[error] duplicate CHS TextMap hash ${hash}`)
    byHash.set(hash, text)
  }

  return { byHash, sha256: sha256(raw) }
}

/** The embedded default uses the same VarBase wire layout as gia.proto. */
function explicitDefaultFromVarBase(
  fields: WireField[],
  clientVarType?: number
): StaticLiteral | undefined {
  if (bytesField(fields, 101)) return signedInt32Field(messageField(fields, 101), 1) ?? 0
  if (bytesField(fields, 102)) return signedInt32Field(messageField(fields, 102), 1) ?? 0
  if (bytesField(fields, 104)) return float32Field(messageField(fields, 104), 1) ?? 0
  if (bytesField(fields, 105)) return stringField(messageField(fields, 105), 1) ?? ''
  if (bytesField(fields, 106)) {
    const enumValue = signedInt32Field(messageField(fields, 106), 1) ?? 0
    return clientVarType === 5 ? enumValue !== 0 : enumValue
  }
  if (bytesField(fields, 107)) {
    const vector = messageField(messageField(fields, 107), 1)
    return [
      float32Field(vector, 1) ?? 0,
      float32Field(vector, 2) ?? 0,
      float32Field(vector, 3) ?? 0
    ]
  }
  const concrete = bytesField(fields, 110)
  if (concrete) {
    const inner = bytesField(parseMessage(concrete), 2)
    return inner ? explicitDefaultFromVarBase(parseMessage(inner), clientVarType) : undefined
  }

  const unsupportedValueFields = fields.filter((field) => field.field >= 101)
  if (!unsupportedValueFields.length) return undefined
  const shape = unsupportedValueFields
    .map((field) => `${field.field}:${field.wire}`)
    .sort()
    .join(',')
  throw new Error(
    `[error] unsupported non-empty client pin default payload ` +
      `(clientVarType=${clientVarType ?? 'unknown'}, fields=${shape})`
  )
}

function explicitDefault(
  typeFields: WireField[],
  clientVarType?: number
): StaticLiteral | undefined {
  const fields = messageField(typeFields, 2)
  return fields.length ? explicitDefaultFromVarBase(fields, clientVarType) : undefined
}

function parsePin(
  descriptor: WireField[],
  kind: StaticPin['kind'],
  index: number,
  recordUnsupportedDefault = false
): StaticPin {
  const indexFields = messageField(descriptor, 3)
  const encodedKind = numberField(indexFields, 1)
  const expectedKind = PIN_GROUPS.find((group) => group.kind === kind)!.encodedKind
  if (encodedKind !== undefined && encodedKind !== expectedKind) {
    throw new Error(
      `[error] static ${kind} pin #${index} encodes unexpected pin kind ${encodedKind}`
    )
  }

  const i2Index = numberField(indexFields, 2) ?? 0
  const typeFields = messageField(descriptor, 4)
  const base = typeVariant(typeFields)
  const reflectiveFields = bytesField(typeFields, 103)
  const variants = reflectiveFields
    ? repeatedMessages(parseMessage(reflectiveFields), 1).map(typeVariant)
    : []
  const connectable =
    base.connectionType !== undefined ||
    variants.some((variant) => variant.connectionType !== undefined)
  if (variants.length) {
    const states = new Set(variants.map((variant) => variant.connectionType !== undefined))
    if (states.size > 1) {
      throw new Error(`[error] reflective ${kind} pin #${index} mixes connectable variants`)
    }
  }
  const nameHash = numberField(descriptor, 7)
  let defaultValue: StaticLiteral | undefined
  let unsupportedDefaultPayload: string | undefined
  try {
    defaultValue = explicitDefault(typeFields, base.clientVarType)
  } catch (error) {
    if (!recordUnsupportedDefault) throw error
    unsupportedDefaultPayload = error instanceof Error ? error.message : String(error)
  }

  return {
    kind,
    index,
    ...(i2Index !== index ? { i2Index } : {}),
    ...base,
    ...(kind === 'input' ? { connectable } : {}),
    ...(variants.length ? { variants } : {}),
    ...(nameHash !== undefined ? { nameHash } : {}),
    ...(defaultValue !== undefined ? { defaultValue } : {}),
    ...(unsupportedDefaultPayload !== undefined ? { unsupportedDefaultPayload } : {})
  }
}

function genericIdFromNode(fields: WireField[]): number {
  const idWrapper = messageField(fields, 4)
  const genericIdWrapper = messageField(idWrapper, 1)
  const genericId = numberField(genericIdWrapper, 5)
  if (genericId === undefined) throw new Error('[error] Node metadata has no generic id')
  return genericId
}

function parseConcreteVariantGroups(
  fields: WireField[],
  genericId: number,
  pinByEncodedIndex: Map<string, StaticPin>
): StaticConcreteVariantGroup[] {
  return repeatedMessages(fields, 4).map((group) => {
    const id = messageField(group, 1)
    const groupGenericId = numberField(id, 5)
    const graphType = numberField(id, 2)
    if (groupGenericId !== genericId || graphType === undefined) {
      throw new Error(
        `[error] static Node ${genericId} has invalid concrete group ` +
          `(genericId=${groupGenericId}, graphType=${graphType})`
      )
    }
    const variants = repeatedMessages(group, 3).map((variant) => {
      const concreteId = numberField(messageField(variant, 1), 5)
      if (concreteId === undefined) {
        throw new Error(`[error] static Node ${genericId} has a concrete variant without id`)
      }
      const bindings = repeatedMessages(variant, 2).map((binding): StaticVariantBinding => {
        const indexFields = messageField(binding, 1)
        const encodedKind = numberField(indexFields, 1)
        const pinGroup = PIN_GROUPS.find((candidate) => candidate.encodedKind === encodedKind)
        if (!pinGroup) {
          throw new Error(
            `[error] static Node ${genericId} variant ${concreteId} has pin kind ${encodedKind}`
          )
        }
        const index = numberField(indexFields, 2) ?? 0
        const indexOfConcrete = numberField(binding, 2) ?? 0
        const pin = pinByEncodedIndex.get(`${encodedKind}:${index}`)
        if (!pin) {
          throw new Error(
            `[error] static Node ${genericId} variant ${concreteId} references ` +
              `missing ${pinGroup.kind} pin #${index}`
          )
        }
        const role = numberField(binding, 3)
        const selectorFields = messageField(binding, 100)
        const keyClientVarType = numberField(selectorFields, 1)
        const valueClientVarType = numberField(selectorFields, 2)
        if (keyClientVarType !== undefined || valueClientVarType !== undefined) {
          return [
            encodedKind!,
            index,
            indexOfConcrete,
            role ?? 0,
            keyClientVarType ?? 0,
            valueClientVarType ?? 0
          ]
        }
        if (role !== undefined && role !== 0) {
          return [encodedKind!, index, indexOfConcrete, role]
        }
        return [encodedKind!, index, indexOfConcrete]
      })
      return { concreteId, bindings }
    })
    return { graphType, variants }
  })
}

function sha256(bytes: Uint8Array | string): string {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

function main() {
  const serverMode = process.argv.includes('--server')
  const positionalArgs = process.argv.slice(2).filter((arg) => arg !== '--server')
  const nodeRoot = path.resolve(
    positionalArgs[0] ?? process.env.BEYOND_EDITOR_NODE_ROOT ?? DEFAULT_NODE_ROOT
  )
  if (!fs.existsSync(nodeRoot)) {
    throw new Error(
      `[error] BeyondEditor Node directory not found: ${nodeRoot}\n` +
        'Pass it as the first argument or set BEYOND_EDITOR_NODE_ROOT.'
    )
  }
  const textMapPath = path.resolve(
    positionalArgs[1] ??
      process.env.BEYOND_EDITOR_CHS_TEXT_MAP ??
      path.join(nodeRoot, '..', '..', 'TextMap', 'CHS', CHS_TEXT_MAP_FILE)
  )
  if (!fs.existsSync(textMapPath)) {
    throw new Error(
      `[error] BeyondEditor CHS TextMap not found: ${textMapPath}\n` +
        'Pass it as the second argument or set BEYOND_EDITOR_CHS_TEXT_MAP.'
    )
  }
  const localizedText = readLocalizedTextByHash(textMapPath)

  const modeData = JSON.parse(fs.readFileSync(MODE_DATA_PATH, 'utf8')) as ClientNodeModeData
  const clientIds = new Set<number>()
  for (const graph of Object.values(modeData.graphs)) {
    clientIds.add(graph.entryGenericId)
    graph.beyond.genericIds.forEach((id) => clientIds.add(id))
    graph.classic.genericIds.forEach((id) => clientIds.add(id))
  }
  const selectedIds = new Set<number>()
  if (serverMode) {
    for (const record of NODE_PIN_RECORDS) {
      if (record.id < 200000 || record.id === 300005) selectedIds.add(record.id)
    }
  } else {
    clientIds.forEach((id) => selectedIds.add(id))
  }

  const files = fs
    .readdirSync(nodeRoot)
    .filter((name) => name.toLowerCase().endsWith('.mihoyobin'))
    .sort()
  const sourceHashes: string[] = []
  const nodes = [] as Array<{
    genericId: number
    sourceFile: string
    sha256: string
    pins: StaticPin[]
    concreteVariants: StaticConcreteVariantGroup[]
  }>
  const seenIds = new Set<number>()
  const scannedIds = new Set<number>()

  for (const name of files) {
    const raw = fs.readFileSync(path.join(nodeRoot, name))
    const fileHash = sha256(raw)
    sourceHashes.push(`${name}:${fileHash}`)
    const decoded = Uint8Array.from(raw, (byte) => byte ^ XOR_KEY)
    const fields = parseMessage(decoded)
    const genericId = genericIdFromNode(fields)
    scannedIds.add(genericId)
    const isUnmappedServerNode = serverMode && genericId < 200000 && !clientIds.has(genericId)
    if (!selectedIds.has(genericId) && !isUnmappedServerNode) continue
    if (seenIds.has(genericId))
      throw new Error(`[error] duplicate static Node generic id ${genericId}`)
    seenIds.add(genericId)

    const pins = PIN_GROUPS.flatMap((group) =>
      repeatedMessages(fields, group.field).map((descriptor, index) =>
        parsePin(descriptor, group.kind, index, serverMode)
      )
    )
    for (const pin of pins) {
      if (pin.nameHash === undefined) continue
      if (!localizedText.byHash.has(pin.nameHash)) {
        throw new Error(
          `[error] static Node ${genericId} ${pin.kind} pin #${pin.index} ` +
            `has unknown CHS TextMap hash ${pin.nameHash}`
        )
      }
      const name = localizedText.byHash.get(pin.nameHash)
      if (name !== undefined) pin.name = name
    }
    const pinByEncodedIndex = new Map(
      pins.map((pin) => {
        const encodedKind = PIN_GROUPS.find((group) => group.kind === pin.kind)!.encodedKind
        return [`${encodedKind}:${pin.index}`, pin] as const
      })
    )
    // Most server Node group payloads are unrelated to concrete variants. Enumerations Equal
    // (475) uses this shape and is retained so its official concrete ids/selectors can be audited.
    const concreteVariants =
      serverMode && genericId !== 475
        ? []
        : parseConcreteVariantGroups(fields, genericId, pinByEncodedIndex)
    nodes.push({
      genericId,
      sourceFile: `Node/${name}`,
      sha256: fileHash,
      pins,
      concreteVariants
    })
  }

  const missing = [...selectedIds].filter((id) => !seenIds.has(id)).sort((a, b) => a - b)
  if (missing.length) {
    throw new Error(
      `[error] no static ${serverMode ? 'server ' : ''}Node metadata for: ${missing.join(', ')}`
    )
  }
  nodes.sort((a, b) => a.genericId - b.genericId)
  if (serverMode) {
    const unmappedIds = [...scannedIds]
      .filter((id) => !selectedIds.has(id) && !clientIds.has(id))
      .sort((a, b) => a - b)
    console.log(
      `[note] ${unmappedIds.length} static Node ids are in neither server vendor records nor client pools: ` +
        (unmappedIds.join(', ') || '(none)')
    )
  }

  const outputPath = serverMode ? SERVER_OUTPUT_PATH : CLIENT_OUTPUT_PATH
  const inputPins = nodes.flatMap((node) => node.pins.filter((pin) => pin.kind === 'input'))
  const concreteVariantGroups = nodes.flatMap((node) => node.concreteVariants)
  const concreteVariants = concreteVariantGroups.flatMap((group) => group.variants)
  const output = {
    formatVersion: 2,
    source: {
      encoding: 'xor-0xe5 protobuf wire format',
      scannedNodeFiles: files.length,
      ...(serverMode
        ? { selectedServerNodes: nodes.length }
        : { selectedClientNodes: nodes.length }),
      aggregateSha256: sha256(sourceHashes.join('\n')),
      chsTextMapSha256: localizedText.sha256
    },
    summary: {
      inputPins: inputPins.length,
      connectableInputs: inputPins.filter((pin) => pin.connectable).length,
      literalOnlyInputs: inputPins.filter((pin) => !pin.connectable).length,
      reflectiveInputs: inputPins.filter((pin) => pin.variants?.length).length,
      pinsWithExplicitDefaults: nodes
        .flatMap((node) => node.pins)
        .filter((pin) => pin.defaultValue !== undefined).length,
      ...(serverMode
        ? {
            pinsWithUnsupportedDefaults: nodes
              .flatMap((node) => node.pins)
              .filter((pin) => pin.unsupportedDefaultPayload !== undefined).length
          }
        : {}),
      namedPins: nodes.flatMap((node) => node.pins).filter((pin) => pin.name !== undefined).length,
      concreteVariantGroups: concreteVariantGroups.filter((group) => group.variants.length).length,
      concreteVariants: concreteVariants.length,
      concreteVariantBindings: concreteVariants.reduce(
        (count, variant) => count + variant.bindings.length,
        0
      )
    },
    ...(serverMode
      ? {
          concreteVariantNodes: nodes
            .filter((node) => node.concreteVariants.length)
            .map((node) => ({ genericId: node.genericId, groups: node.concreteVariants }))
        }
      : {}),
    nodes: nodes.map(({ concreteVariants: _concreteVariants, ...node }) => node)
  }
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  if (!serverMode) {
    const variantOutput = {
      formatVersion: 1,
      sourceAggregateSha256: output.source.aggregateSha256,
      bindingTuple: [
        'encodedKind',
        'pinIndex',
        'indexOfConcrete',
        'role?',
        'keyClientVarType?',
        'valueClientVarType?'
      ],
      nodes: nodes
        .filter((node) => node.concreteVariants.some((group) => group.variants.length))
        .map((node) => ({ genericId: node.genericId, groups: node.concreteVariants }))
    }
    fs.writeFileSync(CLIENT_VARIANT_OUTPUT_PATH, `${JSON.stringify(variantOutput)}\n`, 'utf8')
  }
  console.log(
    `[ok] wrote ${outputPath}: ${nodes.length} nodes, ${inputPins.length} inputs, ` +
      `${output.summary.literalOnlyInputs} literal-only, ${output.summary.namedPins} named pins` +
      (serverMode
        ? ''
        : `; ${CLIENT_VARIANT_OUTPUT_PATH}: ${concreteVariants.length} concrete variants`)
  )
}

main()
