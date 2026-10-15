import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { inspectLuaMounts, luaMountMessages } from '../../src/cli/lua_mounts.ts'
import { encodeVarint } from '../../src/injector/binary.ts'

const v = (field, value) => Buffer.concat([encodeVarint(field * 8), encodeVarint(value)])
const b = (field, value) =>
  Buffer.concat([encodeVarint(field * 8 + 2), encodeVarint(value.length), value])
const nest = (fields, body) => fields.reduceRight((value, field) => b(field, value), body)
const control = Buffer.concat([
  v(501, 456),
  nest([505, 12, 501], Buffer.from('HUD')),
  nest([505, 503, 74, 502], v(1, 123))
])
const payload = Buffer.concat([
  nest([50, 1], Buffer.concat([v(1, 123), b(3, Buffer.from('lua/hud.lua'))])),
  nest([9, 502], control)
])
assert.deepEqual(inspectLuaMounts({ payload, fields: [] }), [
  { path: 'lua/hud', controlIndex: 456, controlName: 'HUD' }
])
const root = fs.mkdtempSync(path.resolve('.tmp/lua-tests/mounts-')),
  file = path.join(root, 'fixture.gil')
const header = Buffer.alloc(20),
  tail = Buffer.alloc(4)
header.writeUInt32BE(0x0326, 8)
tail.writeUInt32BE(0x0679)
const bytes = Buffer.concat([header, payload, tail])
fs.writeFileSync(file, bytes)
const messages = luaMountMessages(['lua/hud.lua', 'lua/board.lua'], file)
assert(messages.some((text) => text.includes('HUD (456)')))
assert(messages.some((text) => text.includes('lua/board')))
assert(fs.readFileSync(file).equals(bytes), 'mount inspection must never write the map')
assert.deepEqual(luaMountMessages([], file), [])
assert(
  luaMountMessages(['lua/hud.lua'], path.join(root, 'missing.gil')).some((text) =>
    text.includes('lua/hud')
  )
)
console.log(
  'Mount inspection: known field paths, unknown mounts, read failure and byte-unchanged GIL: PASS'
)
