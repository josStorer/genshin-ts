import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { writeLuaFiles } from '../../src/compiler/lua/output.ts'

const base = path.resolve('.tmp/lua-output-incremental')
fs.mkdirSync(base, { recursive: true })
const root = fs.mkdtempSync(path.join(base, 'run-'))
const cache = {}
const text = (n) => `-- @gsts:lua\nreturn ${n}`
const files = new Map([
  ['a.lua', text(1)],
  ['b.lua', text(1)]
])
const write = () => writeLuaFiles(root, files, true, 'default', cache)
assert.equal(write().written.length, 2)
const readFile = fs.readFileSync,
  lstat = fs.lstatSync
const touched = []
try {
  fs.readFileSync = (file, ...args) => {
    touched.push(String(file))
    return readFile(file, ...args)
  }
  fs.lstatSync = (file, ...args) => {
    touched.push(String(file))
    return lstat(file, ...args)
  }
  files.set('a.lua', text(2))
  assert.deepEqual(write().written, ['a.lua'])
} finally {
  fs.readFileSync = readFile
  fs.lstatSync = lstat
}
assert.ok(
  !touched.some((file) => file.endsWith('b.lua')),
  'unchanged output has no disk reads or path probes'
)
// 未变化目标被用户编辑时保留原样；轮到它更新时检查权限标记。
fs.writeFileSync(path.join(root, 'b.lua'), '-- user file')
files.set('a.lua', text(3))
assert.deepEqual(write().written, ['a.lua'])
assert.equal(fs.readFileSync(path.join(root, 'b.lua'), 'utf8'), '-- user file')
files.set('b.lua', text(2))
assert.deepEqual(write().conflicts, ['b.lua'])
assert.equal(cache.files, undefined)
fs.writeFileSync(path.join(root, 'b.lua'), text(1))
assert.deepEqual(write().written, ['b.lua'])
// 删除仍检查标记；失败后不推进清单或缓存。
fs.writeFileSync(path.join(root, 'b.lua'), '-- user file')
files.delete('b.lua')
assert.deepEqual(write().conflicts, ['b.lua'])
fs.writeFileSync(path.join(root, 'b.lua'), text(2))
assert.deepEqual(write().removed, ['b.lua'])
// 部分写入失败，随后源码撤回，必须恢复已被写出的那个文件。
files.set('b.lua', text(1))
write()
const rename = fs.renameSync
try {
  fs.renameSync = (from, to) => {
    if (String(to).endsWith('b.lua')) throw new Error('simulated disk failure')
    return rename(from, to)
  }
  files.set('a.lua', text(4))
  files.set('b.lua', text(4))
  assert.throws(write, /simulated disk failure/)
} finally {
  fs.renameSync = rename
}
files.set('a.lua', text(3))
files.set('b.lua', text(1))
write()
assert.equal(fs.readFileSync(path.join(root, 'a.lua'), 'utf8'), text(3))
// 主动完整构建不传缓存，发现外部修改，并补回缺失的产物。
fs.unlinkSync(path.join(root, 'a.lua'))
assert.deepEqual(writeLuaFiles(root, files, true).written, ['a.lua'])
fs.writeFileSync(path.join(root, 'a.lua'), '-- user file')
assert.deepEqual(writeLuaFiles(root, files, true).conflicts, ['a.lua'])
console.log('Incremental output, protected edits, removal and partial-failure recovery: PASS')
