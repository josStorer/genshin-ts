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
  NO_COLOR: '1',
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

// 整体结果行的几种写法
const graphInjected = '节点图 1 个 GIA 已注入'
const luaUpdated = String.raw`\d+ 个 Lua 文件已覆盖更新`
const luaFailedRound = new RegExp(String.raw`\[error\] 未全部完成：${graphInjected}，Lua 编译失败`)
const graphFailedRound = new RegExp(String.raw`\[error\] 未全部完成：节点图失败，${luaUpdated}`)
const luaInjectedLine = /\[ok\] 已注入 Lua：\d+ 个文件（更新 \d+）-> .*external_lua_file/
const graphOnlyDone = '注入全部完成（成功 1，'

// 节点图输出全部结束后才输出 Lua，整体结果在最后一行
function ordered(log) {
  const lines = log.trim().split(/\r?\n/)
  assert.match(lines.at(-1), /^\[(?:ok|error)\] (?:全部完成|未全部完成)：/, log)
  graphBeforeLua(lines.slice(0, -1), log)
}
function graphBeforeLua(body, log) {
  const lastGraph = body.findLastIndex((line) => /\.gia\b|missingMethod/.test(line))
  const firstLua = body.findIndex((line) => /Lua|\.lua\b|hud\.ts|value\.ts/.test(line))
  assert(firstLua >= 0 && lastGraph < firstLua, log)
}
function batch(label, expectedCode) {
  // stdout 和 stderr 写进同一个文件，保留真实顺序
  const file = path.join(root, label + '.log')
  const fd = fs.openSync(file, 'w')
  const p = spawnSync(process.execPath, [cli, '-c', 'gsts.config.mjs', '--lang', 'zh'], {
    cwd: root,
    env,
    stdio: ['ignore', fd, fd],
    timeout: 90000
  })
  fs.closeSync(fd)
  const log = fs.readFileSync(file, 'utf8')
  assert.equal(p.status, expectedCode, log)
  ordered(log)
  return log
}
write('server.ts', server('graph-despite-lua-error'))
write('hud.ts', badLua)
fs.writeFileSync(gil, map())
let log = batch('lua-compile-failure', 1)
assert(!fs.readFileSync(gil).equals(map()), log)
assert.match(log, luaFailedRound)
// Lua 编译失败只在结果行说明一次
assert.equal(log.match(/Lua 编译失败/g).length, 1, log)

write('server.ts', server('broken').replace('f.printString', 'f.missingMethod'))
write('hud.ts', lua(2))
log = batch('graph-compile-failure', 1)
assert.match(fs.readFileSync(path.join(luaDir, 'hud.lua'), 'utf8'), /2/)
assert.match(log, graphFailedRound)
assert.match(log, luaInjectedLine)
assert.doesNotMatch(log, /\[error\] \[error\]/)

write('server.ts', server('graph-despite-lua-conflict'))
write('hud.ts', lua(3))
fs.writeFileSync(path.join(luaDir, 'hud.lua'), '-- user file')
fs.writeFileSync(gil, map())
log = batch('lua-injection-skipped', 0)
assert(!fs.readFileSync(gil).equals(map()), log)
assert.equal(fs.readFileSync(path.join(luaDir, 'hud.lua'), 'utf8'), '-- user file')
assert.match(log, /-- @gsts:lua/)
assert.match(log, /跳过 1，失败 0/)
assert.match(
  log,
  new RegExp(`\\[ok\\] 全部完成：${graphInjected}，Lua 覆盖更新 0 个文件、跳过 1 个`)
)
fs.writeFileSync(path.join(luaDir, 'hud.lua'), '-- @gsts:lua\nreturn {}')

// Block only nodegraph injection with an invalid GIL; the Lua directory is still resolvable.
fs.writeFileSync(gil, 'invalid-gil')
write('hud.ts', lua(4))
log = batch('graph-injection-failure', 1)
assert.match(fs.readFileSync(path.join(luaDir, 'hud.lua'), 'utf8'), /4/)
assert.match(
  log,
  new RegExp(
    String.raw`\[error\] 未全部完成：节点图(?:失败|注入成功 0、跳过 0、失败 [1-9])，${luaUpdated}`
  )
)

// 删掉最后一个 Lua 入口：旧文件被清理，整体结果说删除了几个，而不是"没有变化"
fs.writeFileSync(gil, map())
fs.unlinkSync(path.join(src, 'hud.ts'))
log = batch('lua-entry-removed', 0)
assert(!fs.existsSync(path.join(luaDir, 'hud.lua')), log)
assert.match(log, /\[ok\] 已注入 Lua：0 个文件（删除 \d+）/)
assert.match(
  log,
  new RegExp(String.raw`\[ok\] 全部完成：${graphInjected}，已删除 \d+ 个旧 Lua 文件`)
)

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
  stdout = '',
  exited = false
for (const stream of [child.stdout, child.stderr]) stream.on('data', (d) => (output += d))
child.stdout.on('data', (d) => (stdout += d))
child.on('exit', () => (exited = true))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function wait(check) {
  const end = Date.now() + 45000
  while (!check()) {
    assert(!exited && Date.now() < end, output)
    await sleep(40)
  }
}
let start = 0,
  stdoutStart = 0
const round = () => output.slice(start)
// dev 的两路输出分开到达，先后只核对标准输出（Lua 的诊断和结果行都在标准输出）
const orderedRound = () => {
  const text = stdout.slice(stdoutStart)
  graphBeforeLua(text.trim().split(/\r?\n/), text)
}
const nextRound = () => {
  start = output.length
  stdoutStart = stdout.length
}
try {
  await wait(() => output.includes('未全部完成'))
  assert.match(output, luaFailedRound)
  await sleep(600)
  nextRound()
  write('private/value.ts', 'export const value=5')
  await wait(() => round().includes('[ok] 已注入 Lua：'))
  // 只改了 Lua 依赖：没有节点图输出，也没有整体结果行
  await sleep(300)
  assert.doesNotMatch(round(), /\.gia\b|全部完成：/)
  nextRound()
  write('private/value.ts', 'export const value=missingName')
  write('server.ts', server('dev-lua-failed'))
  await wait(() => round().includes('未全部完成'))
  assert.match(round(), luaFailedRound)
  assert(fs.readFileSync(path.join(root, 'out/server.json'), 'utf8').includes('dev-lua-failed'))
  orderedRound()
  await sleep(300)
  nextRound()
  write('server.ts', server('dev-lua-still-failed'))
  await wait(() => round().includes('未全部完成'))
  assert.match(round(), luaFailedRound)
  await sleep(300)
  nextRound()
  write('private/value.ts', 'export const value=6')
  await wait(() => round().includes('[ok] 已注入 Lua：'))
  assert.match(fs.readFileSync(path.join(luaDir, 'private/value.lua'), 'utf8'), /6/)
  await sleep(300)
  nextRound()
  write('server.ts', server('broken').replace('f.printString', 'f.missingMethod'))
  write('private/value.ts', 'export const value=7')
  await wait(() => round().includes('未全部完成'))
  assert.match(round(), graphFailedRound)
  assert.match(fs.readFileSync(path.join(luaDir, 'private/value.lua'), 'utf8'), /7/)
  orderedRound()
  await sleep(300)
  nextRound()
  write('server.ts', server('dev-recovered'))
  await wait(() => round().includes(graphOnlyDone))
  assert(fs.readFileSync(path.join(root, 'out/server.json'), 'utf8').includes('dev-recovered'))
  // 超过 20 个文件走完整构建；节点图失败不能丢掉新 Lua 依赖的监听。
  await sleep(300)
  nextRound()
  write('private/new.ts', 'export const value=8')
  write('hud.ts', `import{value}from'./private/new';${lua('value')}`)
  write('server.ts', server('broken-batch').replace('f.printString', 'f.missingMethod'))
  for (let i = 0; i < 21; i++) write(`extra${i}.ts`, `export const n=${i}`)
  await wait(() => round().includes('未全部完成'))
  assert.match(round(), graphFailedRound)
  await sleep(300)
  nextRound()
  write('private/new.ts', 'export const value=9')
  await wait(() => round().includes('[ok] 已注入 Lua：'))
  assert.match(fs.readFileSync(path.join(luaDir, 'private/new.lua'), 'utf8'), /9/)
  await sleep(300)
  nextRound()
  write('server.ts', server('full-batch-recovered'))
  await wait(() => round().includes(graphOnlyDone))
  // 删除 Lua 入口后，同样验证纯节点图的负向入口规则不会屏蔽依赖。
  await sleep(300)
  nextRound()
  fs.unlinkSync(path.join(src, 'hud.ts'))
  await wait(() => round().includes('Lua 编译完成：0 个入口'))
  await sleep(300)
  write('private/graph.ts', "export const message='private-before'")
  nextRound()
  write(
    'server.ts',
    `import{message}from'./private/graph';${server('placeholder').replace("'placeholder'", 'message')}`
  )
  await wait(() => round().includes(graphOnlyDone))
  await sleep(300)
  nextRound()
  write('private/graph.ts', "export const message='private-after'")
  await wait(() => round().includes(graphOnlyDone))
  assert(fs.readFileSync(path.join(root, 'out/server.json'), 'utf8').includes('private-after'))
  await sleep(300)
  assert.doesNotMatch(round(), /Lua|全部完成：/)
} finally {
  fs.writeFileSync(path.join(root, 'dev.log'), output)
  if (!exited) {
    const stopped = new Promise((r) => child.once('exit', r))
    child.send('stop-test')
    await stopped
  }
}
console.log(
  'Mixed batch/dev: independent compile and injection failures, recovery, ordered output and one-line results: PASS'
)
