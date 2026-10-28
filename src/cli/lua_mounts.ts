import {
  decodeUtf8,
  readFieldBytes,
  readFieldMessages,
  readFieldVarint
} from '../injector/binary.js'
import type { ParsedGilPayload } from '../injector/types.js'

type MountRecord = { path: string; controlIndex?: number; controlName?: string }
const scriptPath = (value: string) => value.replaceAll('\\', '/').replace(/\.lua$/i, '')
const descendants = (records: Uint8Array[], fields: number[]) =>
  fields.reduce((items, field) => items.flatMap((item) => readFieldMessages(item, field)), records)

/** 仅核对已观察到的记录路径。未知格式、没有记录都不能据此断言“未挂载”。 */
export function inspectLuaMounts(parsed: ParsedGilPayload): MountRecord[] {
  const scripts = new Map<number, string>()
  for (const record of descendants([parsed.payload], [50, 1])) {
    const id = readFieldVarint(record, 1),
      name = readFieldBytes(record, 3)
    const decoded = name && decodeUtf8(name)
    if (id !== undefined && decoded) scripts.set(id, scriptPath(decoded))
  }
  const records: MountRecord[] = []
  for (const control of descendants([parsed.payload], [9, 502])) {
    const controlIndex = readFieldVarint(control, 501)
    const name = descendants([control], [505, 12])
      .map((item) => readFieldBytes(item, 501))
      .find((item) => item !== undefined)
    for (const mount of descendants([control], [505, 503, 74, 502])) {
      const id = readFieldVarint(mount, 1),
        namePath = id === undefined ? undefined : scripts.get(id)
      if (namePath)
        records.push({
          path: namePath,
          controlIndex,
          controlName: name ? decodeUtf8(name) : undefined
        })
    }
  }
  return records
}
