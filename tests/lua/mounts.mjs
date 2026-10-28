import './locale.mjs'

import assert from 'node:assert/strict'

import { inspectLuaMounts } from '../../src/cli/lua_mounts.ts'
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
// 没有挂载记录的脚本不出现在结果里
const orphan = nest([50, 1], Buffer.concat([v(1, 124), b(3, Buffer.from('lua/board.lua'))]))
assert.deepEqual(inspectLuaMounts({ payload: Buffer.concat([payload, orphan]), fields: [] }), [
  { path: 'lua/hud', controlIndex: 456, controlName: 'HUD' }
])
console.log('Mount inspection: known field paths and scripts without mounts: PASS')
