import type { FieldReplacement, LenField, Patch } from './types.js'

export function readVarint(
  buf: Uint8Array,
  offset: number
): { value: number; next: number } | null {
  let val = 0
  let shift = 0
  let cur = offset
  while (cur < buf.length && shift < 64) {
    const byte = buf[cur++]
    val |= (byte & 0x7f) << shift
    if ((byte & 0x80) === 0) return { value: val, next: cur }
    shift += 7
  }
  return null
}

export function encodeVarint(value: number): Uint8Array {
  const bytes: number[] = []
  let v = value >>> 0
  while (v >= 0x80) {
    bytes.push((v & 0x7f) | 0x80)
    v >>>= 7
  }
  bytes.push(v)
  return Uint8Array.from(bytes)
}

export function decodeUtf8(
  buf: Uint8Array,
  start: number = 0,
  end: number = buf.length
): string | undefined {
  try {
    return Buffer.from(buf.subarray(start, end)).toString('utf8')
  } catch {
    return undefined
  }
}

export function readFieldBytes(buf: Uint8Array, targetField: number): Uint8Array | undefined {
  let offset = 0
  while (offset < buf.length) {
    const key = readVarint(buf, offset)
    if (!key) break
    offset = key.next
    const field = key.value >> 3
    const wire = key.value & 7
    if (wire === 2) {
      const lenVar = readVarint(buf, offset)
      if (!lenVar) break
      const len = lenVar.value
      const dataStart = lenVar.next
      const dataEnd = dataStart + len
      if (dataEnd > buf.length) break
      const data = buf.subarray(dataStart, dataEnd)
      if (field === targetField) return data
      offset = dataEnd
      continue
    }
    if (wire === 0) {
      const v = readVarint(buf, offset)
      if (!v) break
      offset = v.next
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
  return undefined
}

export function readFieldMessages(buf: Uint8Array, targetField: number): Uint8Array[] {
  const list: Uint8Array[] = []
  let offset = 0
  while (offset < buf.length) {
    const key = readVarint(buf, offset)
    if (!key) break
    offset = key.next
    const field = key.value >> 3
    const wire = key.value & 7
    if (wire === 2) {
      const lenVar = readVarint(buf, offset)
      if (!lenVar) break
      const len = lenVar.value
      const dataStart = lenVar.next
      const dataEnd = dataStart + len
      if (dataEnd > buf.length) break
      const data = buf.subarray(dataStart, dataEnd)
      if (field === targetField) list.push(data)
      offset = dataEnd
      continue
    }
    if (wire === 0) {
      const v = readVarint(buf, offset)
      if (!v) break
      offset = v.next
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
  return list
}

export function readFieldVarint(buf: Uint8Array, targetField: number): number | undefined {
  let offset = 0
  while (offset < buf.length) {
    const key = readVarint(buf, offset)
    if (!key) break
    offset = key.next
    const field = key.value >> 3
    const wire = key.value & 7
    if (wire === 0) {
      const value = readVarint(buf, offset)
      if (!value) break
      offset = value.next
      if (field === targetField) return value.value
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
  return undefined
}

export type ParseCollectors = {
  nodeGraphBlobFields?: LenField[]
}

export function parseMessage(
  buf: Uint8Array,
  start: number,
  end: number,
  depth: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  p5: number,
  out: LenField[],
  collectors?: ParseCollectors
) {
  let offset = start
  while (offset < end) {
    const key = readVarint(buf, offset)
    if (!key) return
    offset = key.next
    const field = key.value >> 3
    const wire = key.value & 7
    if (wire === 0) {
      const v = readVarint(buf, offset)
      if (!v) return
      offset = v.next
    } else if (wire === 1) {
      offset += 8
    } else if (wire === 2) {
      const lenVar = readVarint(buf, offset)
      if (!lenVar) return
      const len = lenVar.value
      const dataStart = lenVar.next
      const dataEnd = dataStart + len
      if (dataEnd > end || len < 0) return
      const nextDepth = depth + 1
      let np0 = p0,
        np1 = p1,
        np2 = p2,
        np3 = p3,
        np4 = p4,
        np5 = p5
      if (depth === 0) np0 = field
      else if (depth === 1) np1 = field
      else if (depth === 2) np2 = field
      else if (depth === 3) np3 = field
      else if (depth === 4) np4 = field
      else if (depth === 5) np5 = field
      out.push({
        field,
        depth: nextDepth,
        p0: np0,
        p1: np1,
        p2: np2,
        p3: np3,
        p4: np4,
        p5: np5,
        lenOffset: offset,
        lenSize: dataStart - offset,
        dataStart,
        dataEnd
      })
      // 收集 NodeGraph blob 字段（10.1.1）
      if (
        collectors?.nodeGraphBlobFields &&
        nextDepth === 3 &&
        np0 === 10 &&
        np1 === 1 &&
        np2 === 1
      ) {
        collectors.nodeGraphBlobFields.push(out[out.length - 1])
      }
      if (len > 0 && depth < 6) {
        parseMessage(
          buf,
          dataStart,
          dataEnd,
          nextDepth,
          np0,
          np1,
          np2,
          np3,
          np4,
          np5,
          out,
          collectors
        )
      }
      offset = dataEnd
    } else if (wire === 5) {
      offset += 4
    } else {
      return
    }
  }
}

export function readUint32BE(buf: Uint8Array, offset: number): number {
  return (
    ((buf[offset] << 24) | (buf[offset + 1] << 16) | (buf[offset + 2] << 8) | buf[offset + 3]) >>> 0
  )
}

export function applyPatches(buf: Uint8Array, patches: Patch[]): Uint8Array {
  if (patches.length === 0) return buf

  const sorted = [...patches].sort((a, b) => b.start - a.start)
  // 性能：收集切片后只做一次 Buffer.concat，避免每个 patch 都复制整段数据。
  const parts: Buffer[] = []
  const src = Buffer.isBuffer(buf) ? buf : Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength)
  let lastEnd = src.length
  for (const patch of sorted) {
    if (patch.start < 0 || patch.end < patch.start || patch.end > src.length) {
      throw new Error('[error] patch range is invalid')
    }
    if (patch.end > lastEnd) {
      throw new Error('[error] patch ranges overlap')
    }
    if (patch.end < lastEnd) parts.push(src.subarray(patch.end, lastEnd))
    parts.push(
      Buffer.isBuffer(patch.replacement)
        ? patch.replacement
        : Buffer.from(
            patch.replacement.buffer,
            patch.replacement.byteOffset,
            patch.replacement.byteLength
          )
    )
    lastEnd = patch.start
  }
  if (lastEnd > 0) parts.push(src.subarray(0, lastEnd))
  parts.reverse()
  return Buffer.concat(parts)
}

export function findAncestorFields(fields: LenField[], target: LenField): LenField[] {
  return fields
    .filter((f) => f.dataStart <= target.lenOffset && f.dataEnd >= target.dataEnd && f !== target)
    .sort((a, b) => a.dataEnd - a.dataStart - (b.dataEnd - b.dataStart))
}

export function applyReplacement(
  payload: Uint8Array,
  fields: LenField[],
  target: LenField,
  newData: Uint8Array
): Uint8Array {
  return applyReplacements(payload, fields, [{ field: target, data: newData }])
}

export function applyReplacements(
  payload: Uint8Array,
  fields: LenField[],
  replacements: FieldReplacement[]
): Uint8Array {
  if (replacements.length === 0) return payload

  const replacementByField = new Map<LenField, Uint8Array>()
  for (const replacement of replacements) {
    if (replacementByField.has(replacement.field)) {
      throw new Error('[error] duplicate replacement field')
    }
    replacementByField.set(replacement.field, replacement.data)
  }

  const targets = [...replacementByField.keys()].sort((a, b) => a.lenOffset - b.lenOffset)
  for (let i = 1; i < targets.length; i++) {
    if (targets[i].lenOffset < targets[i - 1].dataEnd) {
      throw new Error('[error] replacement fields overlap')
    }
  }

  const targetSet = new Set(targets)
  const ancestorChains = new Map<LenField, LenField[]>()
  const stack: LenField[] = []
  for (const field of fields) {
    while (stack.length > 0) {
      const parent = stack[stack.length - 1]
      if (parent.dataStart <= field.lenOffset && parent.dataEnd >= field.dataEnd) break
      stack.pop()
    }
    if (targetSet.has(field)) {
      ancestorChains.set(field, [...stack])
    }
    stack.push(field)
  }

  const affected = new Set<LenField>()
  const parentByField = new Map<LenField, LenField>()
  for (const target of targets) {
    const ancestors = ancestorChains.get(target)
    if (!ancestors) {
      throw new Error('[error] replacement field is not part of parsed fields')
    }
    const chain = [...ancestors, target]
    chain.forEach((field) => affected.add(field))
    for (let i = 1; i < chain.length; i++) {
      parentByField.set(chain[i], chain[i - 1])
    }
  }

  const childrenByField = new Map<LenField, LenField[]>()
  for (const [child, parent] of parentByField) {
    const children = childrenByField.get(parent) ?? []
    children.push(child)
    childrenByField.set(parent, children)
  }

  const patches: Patch[] = []
  const segmentDeltaByField = new Map<LenField, number>()
  const deepestFirst = [...affected].sort((a, b) => b.depth - a.depth)
  for (const field of deepestFirst) {
    const oldDataLength = field.dataEnd - field.dataStart
    const replacement = replacementByField.get(field)
    const newDataLength = replacement
      ? replacement.length
      : oldDataLength +
        (childrenByField.get(field) ?? []).reduce(
          (sum, child) => sum + (segmentDeltaByField.get(child) ?? 0),
          0
        )
    if (newDataLength < 0) {
      throw new Error('[error] ancestor length underflow')
    }
    const newLengthBytes = encodeVarint(newDataLength)
    segmentDeltaByField.set(
      field,
      newDataLength - oldDataLength + (newLengthBytes.length - field.lenSize)
    )

    if (replacement) {
      patches.push({
        start: field.lenOffset,
        end: field.dataEnd,
        replacement: Buffer.concat([
          Buffer.from(newLengthBytes),
          Buffer.isBuffer(replacement)
            ? replacement
            : Buffer.from(replacement.buffer, replacement.byteOffset, replacement.byteLength)
        ])
      })
    } else if (newDataLength !== oldDataLength) {
      patches.push({
        start: field.lenOffset,
        end: field.dataStart,
        replacement: newLengthBytes
      })
    }
  }

  return applyPatches(payload, patches)
}

export function buildFile(
  payload: Uint8Array,
  header: { schema: number; headTag: number; fileType: number; tailTag: number }
) {
  const buffer = Buffer.alloc(payload.length + 24)
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  view.setUint32(0, payload.length + 20, false)
  view.setUint32(4, header.schema, false)
  view.setUint32(8, header.headTag, false)
  view.setUint32(12, header.fileType, false)
  view.setUint32(16, payload.length, false)
  const src = Buffer.isBuffer(payload)
    ? payload
    : Buffer.from(payload.buffer, payload.byteOffset, payload.byteLength)
  src.copy(buffer, 20)
  view.setUint32(buffer.length - 4, header.tailTag, false)
  return buffer
}
