import assert from 'node:assert/strict'
import { fork, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const base = path.resolve('.tmp/lua-graph-imports')
fs.mkdirSync(base, { recursive: true })
const root = fs.mkdtempSync(path.join(base, 'run-'))
const cli = path.resolve('dist/src/cli/gsts.js')
const hook = path.join(root, 'stop.mjs')
fs.writeFileSync(hook, "process.on('message', m => { if(m === 'stop-test') process.exit(0) })")
const app = path.join(root, 'app/genshin-ts')
fs.mkdirSync(app, { recursive: true })
fs.writeFileSync(
  path.join(app, 'state.json'),
  JSON.stringify({ updateCheck: { lastAt: Date.now() }, noticeCheck: { lastAt: Date.now() } })
)
const env = {
  ...process.env,
  APPDATA: path.dirname(app),
  NODE_OPTIONS: '--import=' + pathToFileURL(hook).href
}
fs.mkdirSync(path.join(root, 'src'))
fs.writeFileSync(
  path.join(root, 'gsts.config.mjs'),
  "export default {compileRoot:'src',entries:['*.ts'],outDir:'out'}"
)
const write = (file, text) => fs.writeFileSync(path.join(root, 'src', file), text)
const graph =
  "import {g} from 'genshin-ts/runtime/core';export const GREETING='hi';g.server({id:1073742901,name:'Mixed'}).on('whenEntityIsCreated',(_evt,f)=>{f.printString(GREETING)})"
const good =
  "import {g} from 'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return{onStart(){lua.print('ok')}}})"
const bad = "import {GREETING} from './graph';" + good.replace("'ok'", 'GREETING')
write('graph.ts', graph)
write('hud.ts', bad)
const args = ['-c', 'gsts.config.mjs', '--noinject', '--lang', 'zh']
const batch = spawnSync(process.execPath, [cli, ...args], {
  cwd: root,
  env,
  encoding: 'utf8',
  timeout: 90000
})
const batchLog = batch.stdout + batch.stderr
fs.writeFileSync(path.join(root, 'batch.log'), batchLog)
assert.equal(batch.status, 1, batchLog)
assert(fs.existsSync(path.join(root, 'out/graph.gia')), batchLog)
assert.match(batchLog, /节点图入口不能作为 Lua 模块导入/)
assert(!fs.existsSync(path.join(root, 'out/lua/graph.lua')))
for (const initiallyBad of [true, false]) {
  write('hud.ts', initiallyBad ? bad : good)
  const child = fork(cli, ['dev', ...args], {
    cwd: root,
    env,
    execArgv: [],
    stdio: ['ignore', 'pipe', 'pipe', 'ipc']
  })
  let log = '',
    exited = false
  for (const stream of [child.stdout, child.stderr]) stream.on('data', (d) => (log += d))
  child.on('exit', () => (exited = true))
  const delay = (ms) => new Promise((r) => setTimeout(r, ms))
  const wait = async (check) => {
    const until = Date.now() + 45000
    while (!check()) {
      assert(!exited && Date.now() < until, log)
      await delay(30)
    }
  }
  try {
    // 节点图和 Lua 都参与时，整体结果行（全部完成/未全部完成）标记一轮结束
    await wait(() => log.includes('全部完成：'))
    assert(fs.existsSync(path.join(root, 'out/graph.gia')), log)
    if (initiallyBad) assert.match(log, /节点图入口不能作为 Lua 模块导入/)
    else {
      await delay(700)
      const start = log.length
      write('hud.ts', bad)
      await wait(() => log.slice(start).includes('Lua 编译失败'))
      assert.match(log.slice(start), /节点图入口不能作为 Lua 模块导入/)
      assert.doesNotMatch(log.slice(start), /全部完成：/)
    }
    assert(!fs.existsSync(path.join(root, 'out/lua/graph.lua')), log)
    await delay(400)
    const start = log.length
    write('graph.ts', graph.replace("'hi'", "'changed'"))
    await wait(() => log.slice(start).includes('未全部完成：'))
    assert.match(log.slice(start), /节点图入口不能作为 Lua 模块导入/)
    assert.match(fs.readFileSync(path.join(root, 'out/graph.json'), 'utf8'), /changed/)
    assert(fs.statSync(path.join(root, 'out/graph.gia')).size > 0)
  } finally {
    fs.writeFileSync(path.join(root, 'dev-' + initiallyBad + '.log'), log)
    if (!exited) {
      const stopped = new Promise((r) => child.once('exit', r))
      child.send('stop-test')
      await stopped
    }
  }
}
console.log(
  'PASS: graph entry remains compiled in batch/dev; Lua rejects graph imports, including imports added after startup'
)
