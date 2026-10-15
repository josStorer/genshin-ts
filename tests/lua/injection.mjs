import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { buildClientLua } from '../../src/cli/lua.ts'
import { writeLuaFiles } from '../../src/compiler/lua/output.ts'

const base = path.resolve('.tmp/lua-injection')
fs.mkdirSync(base, { recursive: true })
const dir = fs.mkdtempSync(path.join(base, 'run-'))
const app = path.join(dir, 'AppData')
const local = path.join(app, 'Local')
fs.mkdirSync(local, { recursive: true })
const map = path.join(app, 'LocalLow/miHoYo/原神/BeyondLocal/1/Beyond_Local_Save_Level/123')
fs.mkdirSync(map, { recursive: true })
fs.writeFileSync(path.join(map, '123.gil'), 'fixture: path resolution only')
const prior = process.env.LOCALAPPDATA
process.env.LOCALAPPDATA = local
const entry = `import {g} from 'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return {onStart(){lua.print('VERSION')}}})`
fs.writeFileSync(path.join(dir, 'main.ts'), entry.replace('VERSION', 'v1'))
const cfg = {
  compileRoot: '.',
  entries: ['main.ts'],
  outDir: 'dist',
  inject: { mapId: 123, playerId: 1, gameRegion: 'China' }
}
const session = {}
try {
  await buildClientLua({ cfgDir: dir, cfg, noinject: true })
  assert.equal(fs.existsSync(path.join(map, 'external_lua_file')), false)
  await buildClientLua({
    cfgDir: dir,
    cfg,
    noinject: false,
    complete: true,
    profile: false,
    session,
    changedFiles: [path.join(dir, 'main.ts')]
  })
  const destination = path.join(map, 'external_lua_file/main.lua')
  assert.match(fs.readFileSync(destination, 'utf8'), /v1/)
  fs.writeFileSync(destination, '-- user file\nreturn 9')
  fs.writeFileSync(path.join(dir, 'main.ts'), entry.replace('VERSION', 'v2'))
  await assert.rejects(
    buildClientLua({
      cfgDir: dir,
      cfg,
      noinject: false,
      complete: true,
      profile: false,
      session,
      changedFiles: [path.join(dir, 'main.ts')]
    }),
    /Lua 注入未完成[\s\S]*-- @gsts:lua/
  )
  assert.equal(fs.readFileSync(destination, 'utf8'), '-- user file\nreturn 9')
  assert.match(fs.readFileSync(path.join(dir, 'dist/lua/main.lua'), 'utf8'), /v2/)
  fs.writeFileSync(destination, '-- @gsts:lua\nreturn 9')
  await buildClientLua({
    cfgDir: dir,
    cfg,
    noinject: false,
    complete: true,
    profile: false,
    session,
    changedFiles: [path.join(dir, 'main.ts')]
  })
  assert.match(fs.readFileSync(destination, 'utf8'), /v2/)
  const target = path.join(dir, 'owners')
  const a = new Map([['a.lua', '-- @gsts:lua\nreturn 1']]),
    b = new Map([['b.lua', '-- @gsts:lua\nreturn 2']])
  a.set('shared.lua', '-- @gsts:lua\nreturn 3')
  b.set('shared.lua', '-- @gsts:lua\nreturn 3')
  writeLuaFiles(target, a, true, 'aaaaaaaaaaaa')
  writeLuaFiles(target, b, true, 'bbbbbbbbbbbb')
  writeLuaFiles(target, new Map(), true, 'aaaaaaaaaaaa')
  assert.equal(fs.existsSync(path.join(target, 'a.lua')), false)
  assert.equal(fs.existsSync(path.join(target, 'b.lua')), true)
  assert.equal(fs.existsSync(path.join(target, 'shared.lua')), true)
  writeLuaFiles(target, new Map(), true, 'bbbbbbbbbbbb')
  assert.equal(fs.existsSync(path.join(target, 'shared.lua')), false)
  const interrupted = path.join(dir, 'interrupted')
  const batch = new Map([
    ['first.lua', '-- @gsts:lua\nreturn 1'],
    ['second.lua', '-- @gsts:lua\nreturn 2']
  ])
  const rename = fs.renameSync
  try {
    fs.renameSync = (from, to) => {
      if (String(to).endsWith('second.lua')) throw new Error('simulated disk failure')
      return rename(from, to)
    }
    assert.throws(
      () => writeLuaFiles(interrupted, batch),
      /已更新：first.lua[\s\S]*尚未更新：second.lua/
    )
    assert.equal(fs.existsSync(path.join(interrupted, 'first.lua')), true)
    assert.equal(fs.existsSync(path.join(interrupted, 'second.lua')), false)
  } finally {
    fs.renameSync = rename
  }
  writeLuaFiles(interrupted, batch)
  const write = fs.writeFileSync
  try {
    fs.writeFileSync = (filename, ...args) => {
      const result = write(filename, ...args)
      if (String(filename).endsWith('.tmp') && String(filename).includes('first.lua.'))
        write(path.join(interrupted, 'first.lua'), '-- concurrent user save')
      return result
    }
    assert.throws(
      () => writeLuaFiles(interrupted, new Map([['first.lua', '-- @gsts:lua\nreturn 9']])),
      /文件已变更[\s\S]*-- @gsts:lua/
    )
    assert.equal(
      fs.readFileSync(path.join(interrupted, 'first.lua'), 'utf8'),
      '-- concurrent user save'
    )
  } finally {
    fs.writeFileSync = write
  }
  const link = path.join(dir, 'linked')
  fs.symlinkSync(target, link, 'junction')
  assert.throws(() => writeLuaFiles(link, a), /junction/)
} finally {
  if (prior === undefined) delete process.env.LOCALAPPDATA
  else process.env.LOCALAPPDATA = prior
}
console.log('Map path, noinject, conflict recovery, ownership and junction protection: PASS')
