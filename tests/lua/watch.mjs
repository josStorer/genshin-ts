import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const base = path.resolve('.tmp/lua-watch')
fs.mkdirSync(base, { recursive: true })
const dir = fs.mkdtempSync(path.join(base, 'run-'))
const source = path.join(dir, 'src')
fs.mkdirSync(source)
const config = path.join(dir, 'gsts.config.ts')
fs.writeFileSync(
  config,
  `export default {compileRoot:'src',entries:['*.ts'],outDir:'src/build',lang:'zh',lua:{typeCheck:true}}`
)
fs.writeFileSync(
  path.join(source, 'main.ts'),
  `import {g} from 'genshin-ts/runtime/core';import {double} from './raw';export default g.clientControlScript(lua=>{return{onStart(){lua.print(double(2))}}})`
)
fs.writeFileSync(path.join(source, 'raw.d.ts'), 'export function double(this:void,n:number):number')
fs.writeFileSync(path.join(source, 'raw.lua'), 'return {double=function(n)return n*2 end}')
fs.writeFileSync(path.join(source, 'unrelated.ts'), 'export const value = 1')
const child = spawn(
  process.execPath,
  [
    path.resolve('bin/gsts.mjs'),
    'dev',
    '-c',
    config,
    '--noinject',
    '--lang',
    'zh',
    '--inject-profile'
  ],
  { stdio: ['ignore', 'pipe', 'pipe'] }
)
let log = '',
  exited = false
child.on('exit', () => {
  exited = true
})
child.stdout.on('data', (data) => {
  log = (log + data).slice(-30000)
})
child.stderr.on('data', (data) => {
  log = (log + data).slice(-30000)
})
async function wait(check) {
  const limit = Date.now() + 30000
  while (!check()) {
    assert.equal(exited, false, log)
    assert.ok(Date.now() < limit, log)
    await new Promise((r) => setTimeout(r, 80))
  }
}
const output = path.join(source, 'build/lua/raw.lua')
try {
  await wait(() => fs.existsSync(output))
  // Wait until initial compilation has installed dependency watchers.
  await new Promise((r) => setTimeout(r, 800))
  const initialRuns = (log.match(/\[Lua\] 本地产物/g) ?? []).length
  fs.writeFileSync(path.join(source, 'unrelated.ts'), 'export const value = 2')
  await wait(() => log.includes('unrelated-change'))
  assert.equal((log.match(/\[Lua\] 本地产物/g) ?? []).length, initialRuns)
  fs.writeFileSync(path.join(source, 'raw.lua'), 'return {double=function(n)return n*3 end}')
  await wait(() => fs.readFileSync(output, 'utf8').includes('n*3'))
  const before = fs.readFileSync(path.join(source, 'build/lua/main.lua'), 'utf8')
  fs.writeFileSync(
    path.join(source, 'raw.d.ts'),
    'export function double(this:void,n:string):number'
  )
  await wait(() => log.includes('Lua 编译失败'))
  assert.equal(fs.readFileSync(path.join(source, 'build/lua/main.lua'), 'utf8'), before)
  fs.writeFileSync(
    path.join(source, 'raw.d.ts'),
    'export function double(this:void,n:number):number'
  )
  fs.writeFileSync(path.join(source, 'raw.lua'), 'return {double=function(n)return n*4 end}')
  await wait(() => fs.readFileSync(output, 'utf8').includes('n*4'))
  // 新 TS 文件会改变同名 Lua 的导入解析，不能被当成无关文件跳过。
  fs.writeFileSync(path.join(source, 'raw.ts'), 'export function double(n:number){return n*99}')
  await wait(() => fs.readFileSync(output, 'utf8').includes('n * 99'))
  fs.unlinkSync(path.join(source, 'raw.ts'))
  await wait(() => fs.readFileSync(output, 'utf8').includes('n*4'))
  // 分组完成后再保存一次，验证正在编译时的新事件不会被本轮清空。
  await new Promise((r) => setTimeout(r, 250))
  const runsBefore = (log.match(/\[Lua\] 本地产物/g) ?? []).length
  const main = path.join(source, 'main.ts')
  const text = fs.readFileSync(main, 'utf8')
  const preparedCount = (log.match(/\[lua-prepared\]/g) ?? []).length
  fs.writeFileSync(main, text.replace('double(2)', 'double(21)'))
  await wait(() => (log.match(/\[lua-prepared\]/g) ?? []).length > preparedCount)
  fs.writeFileSync(main, text.replace('double(2)', 'double(22)'))
  await wait(() =>
    fs.readFileSync(path.join(source, 'build/lua/main.lua'), 'utf8').includes('(22)')
  )
  // 文件先写出，末尾日志随后到达；等两次保存各自完成再检查是否有额外构建。
  await wait(() => (log.match(/\[Lua\] 本地产物/g) ?? []).length >= runsBefore + 2)
  await new Promise((r) => setTimeout(r, 800))
  assert.equal(
    (log.match(/\[Lua\] 本地产物/g) ?? []).length,
    runsBefore + 2,
    'generated Lua must not trigger another build'
  )
  fs.unlinkSync(path.join(source, 'main.ts'))
  await wait(() => !fs.existsSync(path.join(source, 'build/lua/main.lua')))
  console.log(
    'Dev watch: native Lua, declarations, failure recovery, deletion and no output loop: PASS'
  )
} finally {
  fs.writeFileSync(path.join(dir, 'dev.log'), log)
  if (!exited) {
    const stopped = new Promise((resolve) => child.once('exit', resolve))
    child.kill()
    await stopped
  }
}
