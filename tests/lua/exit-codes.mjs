import assert from 'node:assert/strict'
import { fork } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const base = path.resolve('.tmp/lua-exit-codes')
fs.mkdirSync(base, { recursive: true })
const root = fs.mkdtempSync(path.join(base, 'run-'))
const cli = path.resolve('dist/src/cli/gsts.js')
const hook = path.join(root, 'stop.mjs')
// 只在测试 fork 的 gsts 进程里监听；钩子经 NODE_OPTIONS 也会进入编译子进程，在 Node 20 上会抢走发给子进程的请求
fs.writeFileSync(
  hook,
  `if (process.argv[1] === ${JSON.stringify(cli)}) process.on('message', m => { if(m === 'stop-test') process.exit(process.exitCode ?? 0) })`
)
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
write('graph.ts', graph)
write('unused.d.ts', 'export declare const value: number')
write('unused.lua', 'return 1')
const child = fork(cli, ['dev', '-c', 'gsts.config.mjs', '--noinject', '--lang', 'zh'], {
  cwd: root,
  env,
  execArgv: [],
  stdio: ['ignore', 'pipe', 'pipe', 'ipc']
})
let log = '',
  exited = false
for (const stream of [child.stdout, child.stderr])
  stream.on('data', (data) => {
    log += data
  })
child.on('exit', () => {
  exited = true
})
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const wait = async (check) => {
  const end = Date.now() + 45000
  while (!check()) {
    assert(!exited && Date.now() < end, log)
    await delay(40)
  }
}
let exitCode
child.on('exit', (code) => {
  exitCode = code
})
try {
  await wait(() => log.includes('--noinject 已启用'))
  await delay(800)
  const gia = path.join(root, 'out/graph.gia')
  fs.unlinkSync(gia)
  fs.mkdirSync(gia)
  const start = log.length
  write('graph.ts', graph.replace("'hi'", "'blocked-output'"))
  await wait(() => log.slice(start).includes('[error]'))
  await delay(400)
  fs.rmdirSync(gia)
  const recovery = log.length
  write('graph.ts', graph.replace("'hi'", "'recovered'"))
  await wait(() => /graph.gia/.test(log.slice(recovery)))
  assert(fs.statSync(gia).isFile(), log)
} finally {
  fs.writeFileSync(path.join(root, 'dev.log'), log)
  if (!exited) {
    const stopped = new Promise((resolve) => child.once('exit', resolve))
    child.send('stop-test')
    await stopped
  }
}
assert.equal(
  exitCode,
  1,
  'dev GIA failure must set exit code 1 and successful recovery must preserve it'
)
console.log('PASS: dev GIA failure sets exit code 1; successful recovery keeps it')
