import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const base = path.resolve('.tmp/lua-watch-routing')
fs.mkdirSync(base, { recursive: true })
const root = fs.mkdtempSync(path.join(base, 'run-'))
fs.mkdirSync(path.join(root, 'private'))
const write = (name, text) => fs.writeFileSync(path.join(root, name), text)
write(
  'gsts.config.ts',
  `export default{compileRoot:'.',entries:['main.ts','server.ts','!shared.ts','!private/**'],outDir:'out',lang:'zh',lua:{typeCheck:true}}`
)
const lua = `import{g}from'genshin-ts/runtime/core';import{message}from'./shared';export default g.clientControlScript(lua=>{return{onStart(){lua.print(message,1)}}})`
const server = `import{g}from'genshin-ts/runtime/core';import{message}from'./shared';g.server({id:1073741901,name:'Routing',mode:'beyond'}).on('whenEntityIsCreated',(evt,f)=>{f.printString(message)})`
write('main.ts', lua)
write('server.ts', server)
write('shared.ts', `export const message='shared-one'`)
const child = spawn(
  process.execPath,
  [
    path.resolve('bin/gsts.mjs'),
    'dev',
    '-c',
    path.join(root, 'gsts.config.ts'),
    '--noinject',
    '--lang',
    'zh',
    '--inject-profile'
  ],
  { stdio: ['ignore', 'pipe', 'pipe'] }
)
let log = '',
  exited = false
for (const s of [child.stdout, child.stderr]) s.on('data', (d) => (log = (log + d).slice(-120000)))
child.on('exit', () => (exited = true))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function wait(check) {
  const end = Date.now() + 40000
  while (!check()) {
    assert(!exited && Date.now() < end, log)
    await sleep(30)
  }
}
const output = (name) => path.join(root, 'out', name)
const read = (name) => fs.readFileSync(output(name), 'utf8')
const has = (name) => fs.existsSync(output(name))
const profile = () =>
  log
    .split(/\r?\n/)
    .filter((x) => x.startsWith('[pipeline-profile] '))
    .map((x) => JSON.parse(x.slice('[pipeline-profile] '.length)).lua)
    .filter((x) => x?.phase === 'build')
    .at(-1)
try {
  await wait(() => has('server.gia'))
  await sleep(700)
  let offset = log.length
  write('main.ts', lua.replace('message,1', 'message,2'))
  await wait(
    () => read('lua/main.lua').includes('(message, 2)') || read('lua/main.lua').includes(', 2)')
  )
  await sleep(250)
  assert(!log.slice(offset).includes('开始编译'), log.slice(offset))
  assert.equal(profile().discoveryReads, 1)
  // 此模块由 Lua 和节点图共同使用，两种产物都必须更新。
  const giaTime = fs.statSync(output('server.gia')).mtimeMs
  write('shared.ts', `export const message='shared-two'`)
  await wait(
    () =>
      read('lua/shared.lua').includes('shared-two') &&
      has('server.gia') &&
      fs.statSync(output('server.gia')).mtimeMs !== giaTime
  )
  assert(read('server.json').includes('shared-two'))
  await sleep(250)
  // 不匹配入口 glob 的新依赖，成功登记后仍应监视其变化。
  write('private/dep.ts', `export const extra='extra-one'`)
  const withDep = `import{extra}from'./private/dep';${lua.replace('message,1', 'message,extra')}`
  write('main.ts', withDep)
  await wait(() => has('lua/private/dep.lua'))
  await sleep(250)
  offset = log.length
  write('private/dep.ts', `export const extra='extra-two'`)
  await wait(() => read('lua/private/dep.lua').includes('extra-two'))
  await sleep(250)
  assert(!log.slice(offset).includes('开始编译'), log.slice(offset))
  // 仅修改节点图的 import，也必须重新判断原 Lua 专用模块是否变成共享模块。
  // 普通模块不能读取 self；纯 Lua helper 合法，但被节点图同时引用后必须报共享 API 错误。
  write(
    'private/shared-check.ts',
    `import{clamp}from'genshin-ts/runtime/lua'; export const extra='extra-two'; export const readHost=()=>clamp(1,0,2)`
  )
  write('main.ts', withDep.replace('./private/dep', './private/shared-check'))
  await wait(() => has('lua/private/shared-check.lua'))
  await sleep(250)
  offset = log.length
  write(
    'server.ts',
    `import{extra}from'./private/shared-check';${server.replace('f.printString(message)', 'f.printString(message);f.printString(extra)')}`
  )
  await wait(() => log.slice(offset).includes('Lua 编译失败'))
  assert(log.slice(offset).includes('只能放两边都能用的内容'), log.slice(offset))
  assert(
    read('lua/private/shared-check.lua').includes('readHost'),
    'failed build preserves prior output'
  )
  write('private/shared-check.ts', `export const extra='shared-fixed'`)
  await wait(() => read('lua/private/shared-check.lua').includes('shared-fixed'))
  write('server.ts', server)
  write('main.ts', withDep)
  await sleep(700)
  // 负向入口规则不能阻止原生 Lua 和声明依赖的更新。
  write('private/native.d.ts', 'export function value(this:void):number')
  write('private/native.lua', 'return {value=function() return 41 end}')
  write(
    'main.ts',
    `import{value}from'./private/native';${lua.replace('message,1', 'message,value()')}`
  )
  await wait(() => has('lua/private/native.lua'))
  await sleep(250)
  write('private/native.lua', 'return {value=function() return 42 end}')
  await wait(() => read('lua/private/native.lua').includes('42'))
  write('private/native.d.ts', 'export function value(this:void, required:number):number')
  await wait(() => log.includes('Lua 编译失败'))
  write('private/native.d.ts', 'export function value(this:void):number')
  await sleep(500)
  write('main.ts', withDep)
  await wait(() => !has('lua/private/native.lua'))
  // 先解析出新依赖但编译失败，也应补上监听，使只修复该依赖即可恢复。
  log = ''
  write('private/bad.ts', 'export const broken = ;')
  write(
    'main.ts',
    `import{broken}from'./private/bad';${lua.replace('message,1', 'message,broken')}`
  )
  await wait(() => log.includes('Lua 编译失败'))
  await sleep(200)
  write('private/bad.ts', 'export const broken=7')
  await wait(() => has('lua/private/bad.lua') && read('lua/private/bad.lua').includes('7'))
  write('main.ts', lua)
  await wait(() => !has('lua/private/bad.lua') && !has('lua/private/dep.lua'))
  await sleep(400)
  const builds = (log.match(/Lua 编译完成/g) ?? []).length
  write('private/dep.ts', `export const extra='no-longer-used'`)
  await sleep(450)
  assert.equal(
    (log.match(/Lua 编译完成/g) ?? []).length,
    builds,
    'removed private dependency is no longer watched'
  )
  // 同一路径在 Lua / 节点图入口之间转换，不能误跳过，也要清理旧产物。
  write('main.ts', server.replace('1073741901', '1073741902'))
  await wait(() => has('main.gia') && !has('lua/main.lua'))
  await sleep(250)
  write('main.ts', lua)
  await wait(() => has('lua/main.lua') && !has('main.gia'))
  await sleep(250)
  console.log(
    'Dev Lua routing: no empty graph builds, shared modules, dependency watches, recovery and entry migration: PASS'
  )
} catch (e) {
  fs.writeFileSync(path.join(root, 'failure.log'), log)
  throw e
} finally {
  if (!exited) {
    const stopped = new Promise((r) => child.once('exit', r))
    child.kill()
    await stopped
  }
}
