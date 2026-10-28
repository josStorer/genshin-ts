import './locale.mjs'

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { writeLuaFiles } from '../../src/compiler/lua/output/output.ts'
import { locateLua } from '../../src/compiler/lua/output/source_maps.ts'
import {
  compileLua,
  createLuaCompileCache,
  formatLuaDiagnostics
} from '../../src/compiler/lua/ts_to_lua_pipeline.ts'

fs.mkdirSync(path.resolve('.tmp/lua-tests'), { recursive: true })
const root = fs.mkdtempSync(path.resolve('.tmp/lua-tests/maps-'))
const entry = path.join(root, 'main.ts'),
  outDir = path.join(root, 'dist', 'lua')
const source = `import{g}from'genshin-ts/runtime/core'
import{value}from'./raw'
export default g.clientControlScript(lua=>{
 const message='source-map-target'
 return{onStart(){
   lua.print(message,value())
 },methods:{read(){
   return message
 }}}
})
`
fs.writeFileSync(entry, source)
fs.writeFileSync(path.join(root, 'raw.d.ts'), 'export function value(this:void):number')
fs.writeFileSync(
  path.join(root, 'raw.lua'),
  'local value=1\nreturn {value=function()return value end}\n'
)
const input = { entries: [entry], rootDir: root, outDir }
const cache = createLuaCompileCache()
function build(changed) {
  const result = compileLua({ ...input, changedFiles: changed }, cache)
  assert(
    !result.diagnostics.some((d) => d.category === 1),
    formatLuaDiagnostics(result.diagnostics)
  )
  const written = writeLuaFiles(outDir, result.files, true)
  assert.deepEqual(written.conflicts, [])
  return result
}
const first = build()
assert(first.files.has('main.lua.map') && first.files.has('raw.lua.map'))
assert.deepEqual(compileLua({ ...input, sourceMap: true }).files, first.files)
const withoutMaps = compileLua({ ...input, sourceMap: false })
for (const [name, code] of withoutMaps.files)
  assert.equal(first.files.get(name), code, name + ' unchanged Lua bytes')
assert.deepEqual(build([]).files, first.files)
const code = first.files.get('main.lua')
const line = code.split('\n').findIndex((line) => line.includes('lua.print')) + 1
const located = await locateLua(path.join(outDir, 'main.lua'), line)
assert(located, code)
assert.equal(located.line, 6)
assert.equal(path.resolve(located.file), entry)
const native = await locateLua(path.join(outDir, 'raw.lua'), 3)
assert.equal(native.line, 2)
assert.equal(native.file, path.join(root, 'raw.lua'))
assert.equal(await locateLua(path.join(outDir, 'main.lua'), 1), undefined)
const cli = spawnSync(
  process.execPath,
  ['bin/gsts.mjs', 'lua', 'locate', `${path.join(outDir, 'main.lua')}:${line}`, '--lang', 'en'],
  { encoding: 'utf8', timeout: 30000 }
)
assert.equal(cli.status, 0, cli.stdout + cli.stderr)
assert(cli.stdout.includes('main.ts:6:'), cli.stdout)
// 游戏日志里的位置写模块名、不带 .lua；运行库位置只计数，重复的错误只输出一次。
fs.writeFileSync(path.join(outDir, 'lualib_bundle.lua'), 'return {}\n')
const gameError = [
  "lualib_bundle:682: bad argument #1 to 'find' (string expected, got nil)",
  'stack traceback:',
  "\tlualib_bundle:682: in function '__TS__StringIncludes'",
  `\tmain:${line}: in function 'OnStart'`
].join('\n')
// 宿主自己的报错开头是 "main: 6: in function <main:3>: …"；<main:3> 是函数定义处，不算出错位置。
const hostError = `main: ${line}: in function <main:3>: boom`
// 日志条目标题随界面语言变化，按时间戳切分；标题里的时间不能当成位置。
const logFile = path.join(root, 'game log.txt')
fs.writeFileSync(
  logFile,
  [
    '报错脚本日志 日志_2026/10/24_12:04:30_玩家_测试',
    gameError,
    '',
    'Standard Script Logs log_2026/10/24_12:43:10_player_test',
    'board: refresh\t1',
    '',
    // 时间戳格式可能随版本或地区变化
    'Error Script Logs 2026-10-24 12:43:11',
    gameError
  ].join('\n')
)
const locate = (...args) =>
  spawnSync(
    process.execPath,
    [path.resolve('bin/gsts.mjs'), 'lua', 'locate', ...args, '--lang', 'en'],
    { cwd: root, encoding: 'utf8', timeout: 30000 }
  )
fs.writeFileSync(
  path.join(root, 'gsts.config.ts'),
  "export default { compileRoot: '.', entries: ['.'], outDir: './dist' }\n"
)
for (const args of [
  [gameError],
  [logFile],
  [hostError],
  [`main:${line}:`, 'in', 'function', 'OnStart']
]) {
  const result = locate(...args)
  assert.equal(result.status, 0, result.stdout + result.stderr)
  assert.equal(result.stdout.split('main.ts:6:').length, 2, result.stdout)
}
assert.match(locate(logFile).stdout, /Skipped 1 location/)
assert.match(locate('lualib_bundle:682').stdout, /generated framework code/)
const missing = locate('other:3', '--outDir', path.join(root, 'nowhere'))
assert.notEqual(missing.status, 0)
assert.match(missing.stdout + missing.stderr, /project directory/)
// 报错来自没经过 gsts 构建的 .lua 时，说清楚找到了什么
const unbuilt = locate('err_probe: 35: in function <err_probe:35>: lvl1')
assert.notEqual(unbuilt.status, 0)
assert.match(unbuilt.stdout + unbuilt.stderr, /err_probe:35, but .* has no such files/)
fs.writeFileSync(path.join(outDir, 'main.lua'), code + '-- edited\n')
await assert.rejects(() => locateLua(path.join(outDir, 'main.lua'), line), /映射|map/)
fs.writeFileSync(path.join(outDir, 'main.lua'), code)
fs.writeFileSync(entry, source.replace('message=', 'message ='))
build([entry])
assert.equal((await locateLua(path.join(outDir, 'main.lua'), line)).line, 6)
const disabled = compileLua({ ...input, sourceMap: false }, cache)
assert(![...disabled.files.keys()].some((name) => name.endsWith('.map')))
writeLuaFiles(outDir, disabled.files, true)
assert(!fs.existsSync(path.join(outDir, 'main.lua.map')))
fs.writeFileSync(path.join(outDir, 'main.lua.map'), '{}')
assert.deepEqual(writeLuaFiles(outDir, first.files, true).conflicts, ['main.lua.map'])
console.log(
  'Source maps: TS/native locations, incremental reuse, CLI (paths, game logs, log files, config outDir), generated lines, stale hashes and protected map ownership: PASS'
)
