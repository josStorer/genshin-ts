import assert from 'node:assert/strict'
import { fork, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { buildFile, encodeVarint } from '../../dist/src/injector/binary.js'
import { loadGiaProto } from '../../dist/src/injector/proto.js'

const base = path.resolve('.tmp/lua-mixed-failures')
fs.mkdirSync(base, { recursive: true })
const root = fs.mkdtempSync(path.join(base, 'run-'))
const src = path.join(root, 'src')
const app = path.join(root, 'AppData')
const gil = path.join(
  app,
  'LocalLow/miHoYo/原神/BeyondLocal/100431567/Beyond_Local_Save_Level/1073741851.gil'
)
const luaDir = path.join(path.dirname(gil), '1073741851/external_lua_file')
const cli = path.resolve('dist/src/cli/gsts.js')
const hook = path.join(root, 'stop.mjs')
fs.mkdirSync(src)
fs.mkdirSync(path.dirname(gil), { recursive: true })
fs.mkdirSync(path.join(app, 'Roaming/genshin-ts'), { recursive: true })
fs.writeFileSync(
  path.join(app, 'Roaming/genshin-ts/state.json'),
  JSON.stringify({ updateCheck: { lastAt: Date.now() }, noticeCheck: { lastAt: Date.now() } })
)
fs.writeFileSync(hook, `process.on('message', m => { if(m === 'stop-test') process.exit(0) })`)
const env = {
  ...process.env,
  APPDATA: path.join(app, 'Roaming'),
  LOCALAPPDATA: path.join(app, 'Local'),
  NODE_OPTIONS: `--import=${pathToFileURL(hook).href}`
}
const proto = loadGiaProto()
const cat = (...parts) => Buffer.concat(parts.map((p) => Buffer.from(p)))
const bf = (n, v) => cat(encodeVarint((n << 3) | 2), encodeVarint(v.length), v)
const map = () =>
  buildFile(
    bf(
      10,
      bf(
        1,
        bf(
          1,
          proto.nodeGraphMessage
            .encode({
              id: { class: 10000, type: 20000, kind: 21001, id: 1073742901 },
              name: 'empty',
              nodes: []
            })
            .finish()
        )
      )
    ),
    { schema: 1, headTag: 0x0326, fileType: 0, tailTag: 0x0679 }
  )
const cfg = {
  compileRoot: 'src',
  entries: ['*.ts', '!private/**'],
  outDir: 'out',
  lang: 'zh',
  lua: { typeCheck: true },
  inject: { gameRegion: 'China', playerId: 100431567, mapId: 1073741851 }
}
fs.writeFileSync(path.join(root, 'gsts.config.mjs'), `export default ${JSON.stringify(cfg)}`)
const write = (name, text) => fs.writeFileSync(path.join(src, name), text)
const server = (value) =>
  `import{g}from'genshin-ts/runtime/core';g.server({id:1073742901,name:'Mixed'}).on('whenEntityIsCreated',(_evt,f)=>{f.printString('${value}')})`
const lua = (value) =>
  `import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return{onStart(){lua.print(${value})}}})`
const badLua = lua(1).replace('return{', 'const bad = ;return{')
function ordered(log) {
  const lines = log.trim().split(/\r?\n/)
  assert.match(lines.at(-1), /^\[TS→Lua\]/, log)
  assert(log.indexOf('[TS→节点图]') < log.indexOf('[Lua]'), log)
}
function batch(label, expectedCode) {
  const p = spawnSync(process.execPath, [cli, '-c', 'gsts.config.mjs', '--lang', 'zh'], {
    cwd: root,
    env,
    encoding: 'utf8',
    timeout: 90000
  })
  const log = p.stdout + p.stderr
  fs.writeFileSync(path.join(root, label + '.log'), log)
  assert.equal(p.status, expectedCode, log)
  ordered(p.stdout)
  return log
}
write('server.ts', server('graph-despite-lua-error'))
write('hud.ts', badLua)
fs.writeFileSync(gil, map())
let log = batch('lua-compile-failure', 1)
assert(!fs.readFileSync(gil).equals(map()), log)
assert.match(log, /\[TS→节点图\] 编译：成功.*注入：成功 1/)
assert.match(log, /\[TS→Lua\] 编译：失败.*注入：未执行/)

write('server.ts', server('broken').replace('f.printString', 'f.missingMethod'))
write('hud.ts', lua(2))
log = batch('graph-compile-failure', 1)
assert.match(fs.readFileSync(path.join(luaDir, 'hud.lua'), 'utf8'), /2/)
assert.match(log, /\[TS→节点图\] 编译：失败/)
assert.match(log, /\[TS→Lua\] 编译：成功.*注入：成功/)

write('server.ts', server('graph-despite-lua-conflict'))
write('hud.ts', lua(3))
fs.writeFileSync(path.join(luaDir, 'hud.lua'), '-- user file')
fs.writeFileSync(gil, map())
log = batch('lua-injection-failure', 1)
assert(!fs.readFileSync(gil).equals(map()), log)
assert.equal(fs.readFileSync(path.join(luaDir, 'hud.lua'), 'utf8'), '-- user file')
assert.match(log, /-- @gsts:lua/)
assert.match(log, /\[TS→Lua\] 编译：成功.*注入：失败/)
fs.writeFileSync(path.join(luaDir, 'hud.lua'), '-- @gsts:lua\nreturn {}')

// Block only nodegraph injection with an invalid GIL; the Lua directory is still resolvable.
fs.writeFileSync(gil, 'invalid-gil')
write('hud.ts', lua(4))
log = batch('graph-injection-failure', 1)
assert.match(fs.readFileSync(path.join(luaDir, 'hud.lua'), 'utf8'), /4/)
assert.match(log, /\[TS→节点图\] 编译：成功.*(?:注入：失败|失败 [1-9])/)
assert.match(log, /\[TS→Lua\] 编译：成功.*注入：成功/)

fs.mkdirSync(path.join(src, 'private'))
write('private/value.ts', 'export const value=missingAtStartup')
write('hud.ts', `import{value}from'./private/value';${lua('value')}`)
write('server.ts', server('dev-start'))
fs.writeFileSync(gil, map())
const child = fork(cli, ['dev', '-c', 'gsts.config.mjs', '--lang', 'zh'], {
  cwd: root,
  env,
  execArgv: [],
  stdio: ['ignore', 'pipe', 'pipe', 'ipc']
})
let output = '',
  exited = false
for (const stream of [child.stdout, child.stderr]) stream.on('data', (d) => (output += d))
child.on('exit', () => (exited = true))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function wait(check) {
  const end = Date.now() + 45000
  while (!check()) {
    assert(!exited && Date.now() < end, output)
    await sleep(40)
  }
}
let start = 0
const round = () => output.slice(start)
try {
  await wait(() => output.includes('[TS→Lua]'))
  assert.match(output, /\[TS→Lua\] 编译：失败/)
  assert.match(output, /\[TS→节点图\] 编译：成功.*注入：成功 1/)
  await sleep(600)
  start = output.length
  write('private/value.ts', 'export const value=5')
  await wait(() => /\[TS→Lua\] 编译：成功.*注入：成功/.test(round()))
  await sleep(300)
  start = output.length
  write('private/value.ts', 'export const value=missingName')
  write('server.ts', server('dev-lua-failed'))
  await wait(() => /\[TS→Lua\] 编译：失败/.test(round()))
  assert.match(round(), /\[TS→节点图\] 编译：成功.*注入：成功 1/)
  assert(fs.readFileSync(path.join(root, 'out/server.json'), 'utf8').includes('dev-lua-failed'))
  ordered(round())
  await sleep(300)
  start = output.length
  write('server.ts', server('dev-lua-still-failed'))
  await wait(() => /\[TS→Lua\] 编译：失败/.test(round()))
  assert.match(round(), /\[TS→节点图\] 编译：成功.*注入：成功 1/)
  await sleep(300)
  start = output.length
  write('private/value.ts', 'export const value=6')
  await wait(() => /\[TS→Lua\] 编译：成功.*注入：成功/.test(round()))
  assert.match(fs.readFileSync(path.join(luaDir, 'private/value.lua'), 'utf8'), /6/)
  await sleep(300)
  start = output.length
  write('server.ts', server('broken').replace('f.printString', 'f.missingMethod'))
  write('private/value.ts', 'export const value=7')
  await wait(() => /\[TS→Lua\] 编译：成功.*注入：成功/.test(round()))
  assert.match(round(), /\[TS→节点图\] 编译：失败/)
  assert.match(fs.readFileSync(path.join(luaDir, 'private/value.lua'), 'utf8'), /7/)
  ordered(round())
  await sleep(300)
  start = output.length
  write('server.ts', server('dev-recovered'))
  await wait(() => /\[TS→节点图\] 编译：成功.*注入：成功 1/.test(round()))
  assert(fs.readFileSync(path.join(root, 'out/server.json'), 'utf8').includes('dev-recovered'))
  // 超过 20 个文件走完整构建；节点图失败不能丢掉新 Lua 依赖的监听。
  await sleep(300)
  start = output.length
  write('private/new.ts', 'export const value=8')
  write('hud.ts', `import{value}from'./private/new';${lua('value')}`)
  write('server.ts', server('broken-batch').replace('f.printString', 'f.missingMethod'))
  for (let i = 0; i < 21; i++) write(`extra${i}.ts`, `export const n=${i}`)
  await wait(() => /\[TS→Lua\] 编译：成功.*注入：成功/.test(round()))
  assert.match(round(), /\[TS→节点图\] 编译：失败/)
  await sleep(300)
  start = output.length
  write('private/new.ts', 'export const value=9')
  await wait(() => /\[TS→Lua\] 编译：成功.*注入：成功/.test(round()))
  assert.match(fs.readFileSync(path.join(luaDir, 'private/new.lua'), 'utf8'), /9/)
  await sleep(300)
  start = output.length
  write('server.ts', server('full-batch-recovered'))
  await wait(() => /\[TS→节点图\] 编译：成功.*注入：成功 1/.test(round()))
  // 删除 Lua 入口后，同样验证纯节点图的负向入口规则不会屏蔽依赖。
  await sleep(300)
  start = output.length
  fs.unlinkSync(path.join(src, 'hud.ts'))
  await wait(() => /\[TS→Lua\] 编译：成功/.test(round()))
  await sleep(300)
  write('private/graph.ts', "export const message='private-before'")
  start = output.length
  write(
    'server.ts',
    `import{message}from'./private/graph';${server('placeholder').replace("'placeholder'", 'message')}`
  )
  await wait(() => /\[TS→节点图\] 编译：成功.*注入：成功 1/.test(round()))
  await sleep(300)
  start = output.length
  write('private/graph.ts', "export const message='private-after'")
  await wait(() => /\[TS→节点图\] 编译：成功.*注入：成功 1/.test(round()))
  assert(fs.readFileSync(path.join(root, 'out/server.json'), 'utf8').includes('private-after'))
  assert(!round().includes('[TS→Lua]'), round())
} finally {
  fs.writeFileSync(path.join(root, 'dev.log'), output)
  if (!exited) {
    const stopped = new Promise((r) => child.once('exit', r))
    child.send('stop-test')
    await stopped
  }
}
console.log(
  'Mixed batch/dev: independent compile and injection failures, recovery, and ordered summaries: PASS'
)
