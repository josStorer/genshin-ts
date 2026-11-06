import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import {
  parseMessage,
  readFieldBytes,
  readFieldMessages,
  readFieldVarint
} from '../../src/injector/binary.js'
import type { LenField } from '../../src/injector/types.js'

const root =
  process.argv[2] ??
  process.env.BEYOND_EDITOR_JSON_ROOT ??
  'D:\\Genshin Impact\\Genshin Impact Game\\BeyondAssets\\BeyondAssistEditor\\Resource\\Json'
const globalPath = 'Beyond/BeyondGlobal/18125831855067188558.mihoyobin'
const textPath = 'TextMap/CHS/17720714722766726369.mihoyobin'
const globalRaw = fs.readFileSync(path.join(root, globalPath))
const decoded = Uint8Array.from(globalRaw, (byte) => byte ^ 0xe5)
const names = JSON.parse(fs.readFileSync('resources/mihoyo_editor_names.json', 'utf8')) as {
  nodes: Array<{ genericId: number; nameZh: string }>
}
const byId = new Map(names.nodes.map((node) => [node.genericId, node.nameZh]))
const previous = JSON.parse(
  fs.readFileSync('resources/client_node_pools_extracted.json', 'utf8')
) as {
  groups: Array<{ key: number; mode: string; family: string; name: string; subTypes: string[] }>
}
const groupLabels = new Map(
  previous.groups.map(({ key, mode, family, name, subTypes }) => [
    key,
    { key, mode, family, name, subTypes }
  ])
)
const groups = readFieldMessages(decoded, 3).map((raw) => {
  const key = readFieldVarint(raw, 1)!
  const label = groupLabels.get(key)
  if (!label) throw new Error(`Unknown editor node pool ${key}; add its graph classification`)
  const contents = readFieldBytes(raw, 2)!
  const fields: LenField[] = []
  parseMessage(contents, 0, contents.length, 0, 0, 0, 0, 0, 0, 0, fields)
  const nodes = fields.flatMap((field) => {
    const id = contents.subarray(field.dataStart, field.dataEnd)
    if (readFieldVarint(id, 1) !== 10001) return []
    const genericId = readFieldVarint(id, 5)
    if (genericId === undefined) return []
    const name = byId.get(genericId)
    if (!name) throw new Error(`Unknown node ${genericId} in pool ${key}`)
    return [{ genericType: readFieldVarint(id, 2)!, genericId, name }]
  })
  if (new Set(nodes.map((node) => node.genericId)).size !== nodes.length) {
    throw new Error(`Duplicate node in pool ${key}`)
  }
  return { ...label, count: nodes.length, nodes }
})
const source = {
  beyondGlobal: {
    relativePath: `Resource/Json/${globalPath}`,
    sha256: crypto.createHash('sha256').update(globalRaw).digest('hex')
  },
  chsTextMap: {
    relativePath: `Resource/Json/${textPath}`,
    sha256: crypto
      .createHash('sha256')
      .update(fs.readFileSync(path.join(root, textPath)))
      .digest('hex')
  }
}
fs.writeFileSync(
  'resources/client_node_pools_extracted.json',
  JSON.stringify({ source, groups }, null, 2) + '\n'
)
console.log(`[ok] extracted ${groups.length} editor node pools`)
