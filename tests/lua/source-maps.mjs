import './locale.mjs'

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import {
  compileLua,
  createLuaCompileCache,
  formatLuaDiagnostics
} from '../../src/compiler/lua/build.ts'
import { writeLuaFiles } from '../../src/compiler/lua/output.ts'
import { locateLua } from '../../src/compiler/lua/source_maps.ts'

const root = fs.mkdtempSync(path.resolve('.tmp/lua-tests/maps-'))
const entry = path.join(root, 'main.ts'),
  outDir = path.join(root, 'out')
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
  'Source maps: TS/native locations, incremental reuse, CLI, generated lines, stale hashes and protected map ownership: PASS'
)
