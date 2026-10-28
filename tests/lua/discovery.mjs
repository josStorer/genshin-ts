import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { buildClientLua } from '../../src/cli/lua.ts'

const base = path.resolve('.tmp/lua-discovery')
fs.mkdirSync(base, { recursive: true })
const root = fs.mkdtempSync(path.join(base, 'run-')),
  session = {}
const cfg = {
  compileRoot: '.',
  entries: ['*.ts', '!excluded.ts'],
  outDir: 'out',
  lua: { include: ['extra/*.lua'] }
}
const write = (name, text) => fs.writeFileSync(path.join(root, name), text)
const entry = (n) =>
  `import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return{onStart(){lua.print(${n})}}})`
write('a.ts', entry(1))
write('ordinary.ts', 'export const n=1')
write('excluded.ts', entry(99))
fs.mkdirSync(path.join(root, 'extra'))
const logs = [],
  log = console.log
console.log = (...args) => {
  if (args[0] === '[pipeline-profile]') {
    const profile = JSON.parse(args[1]).lua
    if (profile?.phase === 'build') logs.push(profile)
  }
}
async function build(names) {
  await buildClientLua({
    cfgDir: root,
    cfg,
    noinject: true,
    complete: true,
    profile: true,
    session,
    changedFiles: names?.map((n) => path.join(root, n))
  })
  return logs.at(-1)
}
try {
  assert.equal((await build()).discoveryReads, 2)
  write('a.ts', entry(2))
  let p = await build(['a.ts'])
  assert.equal(p.discoveryReads, 1)
  assert.equal(p.discoveryRescanned, false)
  write('ordinary.ts', 'export const n=2')
  p = await build(['ordinary.ts'])
  assert.equal(p.skipped, true)
  assert.equal(p.discoveryReads, 1)
  write('b.ts', entry(3))
  p = await build(['b.ts'])
  assert.equal(p.discoveryReads, 1)
  assert.equal(p.discoveryRescanned, true)
  assert.ok(fs.existsSync(path.join(root, 'out/lua/b.lua')))
  fs.unlinkSync(path.join(root, 'b.ts'))
  p = await build(['b.ts'])
  assert.equal(p.discoveryReads, 0)
  assert.equal(p.discoveryRescanned, true)
  assert.equal(fs.existsSync(path.join(root, 'out/lua/b.lua')), false)
  write('ordinary.ts', entry(4))
  p = await build(['ordinary.ts'])
  assert.equal(p.discoveryReads, 1)
  assert.ok(fs.existsSync(path.join(root, 'out/lua/ordinary.lua')))
  write('ordinary.ts', 'export const n=3')
  await build(['ordinary.ts'])
  assert.equal(fs.existsSync(path.join(root, 'out/lua/ordinary.lua')), false)
  write('extra/added.lua', 'return 1')
  p = await build(['extra/added.lua'])
  assert.equal(p.discoveryReads, 0)
  assert.ok(fs.existsSync(path.join(root, 'out/lua/extra/added.lua')))
  write('extra/added.lua', 'return 2')
  p = await build(['extra/added.lua'])
  assert.equal(p.discoveryRescanned, false)
  fs.unlinkSync(path.join(root, 'extra/added.lua'))
  await build(['extra/added.lua'])
  assert.equal(fs.existsSync(path.join(root, 'out/lua/extra/added.lua')), false)
  cfg.entries = ['*.ts']
  p = await build([])
  assert.equal(p.discoveryRescanned, true)
  assert.equal(p.discoveryReads, 3)
  assert.ok(fs.existsSync(path.join(root, 'out/lua/excluded.lua')))
  write('a.ts', entry(5))
  p = await build()
  assert.equal(p.discoveryReads, 3)
  assert.match(fs.readFileSync(path.join(root, 'out/lua/a.lua'), 'utf8'), /5/)

  // 纯节点图阶段只读文本、不解析；出现 Lua 入口后，之前只筛查过的文件补上解析
  const pure = fs.mkdtempSync(path.join(base, 'pure-')),
    pureSession = {}
  const pureCfg = { compileRoot: '.', entries: ['*.ts'], outDir: 'out' }
  const writePure = (name, text) => fs.writeFileSync(path.join(pure, name), text)
  writePure(
    'graph.ts',
    `import{g}from'genshin-ts/runtime/core';g.server({id:1073742911,name:'G'}).on('whenEntityIsCreated',(_evt,f)=>{f.printString('x')})`
  )
  writePure('helper.ts', 'export const n=1')
  const buildPure = (names) =>
    buildClientLua({
      cfgDir: pure,
      cfg: pureCfg,
      noinject: true,
      complete: true,
      session: pureSession,
      changedFiles: names?.map((n) => path.join(pure, n))
    })
  await buildPure()
  const screened = [...pureSession.discovery.candidates.values()]
  assert(screened.length === 2 && screened.every((item) => !item.parsed && !item.entry))
  writePure('hud.ts', entry(6))
  await buildPure(['hud.ts'])
  const record = (name) =>
    [...pureSession.discovery.candidates.values()].find((item) => path.basename(item.file) === name)
  assert(record('hud.ts').entry && record('hud.ts').parsed)
  assert(record('graph.ts').parsed && record('graph.ts').graph, JSON.stringify(record('graph.ts')))
  assert(record('helper.ts').parsed && !record('helper.ts').graph)
  assert.ok(fs.existsSync(path.join(pure, 'out/lua/hud.lua')))
} finally {
  console.log = log
}
console.log(
  'Lua entry discovery: changed-only reads, entry migration, add/remove, include and config; graph-only projects are screened without parsing until a Lua entry appears: PASS'
)
