import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  compileLua,
  createLuaCompileCache,
  formatLuaDiagnostics
} from '../../src/compiler/lua/build.ts'

const base = path.resolve('.tmp/lua-incremental')
fs.mkdirSync(base, { recursive: true })
const root = fs.mkdtempSync(path.join(base, 'run-'))
const write = (name, text) => fs.writeFileSync(path.join(root, name), text)
const cache = createLuaCompileCache()
const input = {
  entries: [path.join(root, 'main.ts')],
  rootDir: root,
  outDir: path.join(root, 'out'),
  profile: true,
  typeCheck: true
}
write('tsconfig.json', '{}')
write('raw.d.ts', 'export function value(this:void):number')
write('raw.lua', 'return {value=function() return 1 end}')
write('shared.ts', 'export let value=1; export function increment(){value++}')
const main = `import {g} from 'genshin-ts/runtime/core';import {value} from './raw';import {increment,value as count} from './shared';export default g.clientControlScript(lua=>{class Counter{n=0;next(){return ++this.n}}const counter=new Counter();return{onStart(){increment();lua.print(value(),count,counter.next())}}})`
write('main.ts', main)
function check(label, error = false) {
  const warm = compileLua(input, cache),
    fresh = compileLua(input)
  assert.equal(
    warm.diagnostics.some((d) => d.category === 1),
    error,
    label + ' ' + formatLuaDiagnostics(warm.diagnostics)
  )
  assert.deepEqual(
    [...warm.files].sort(),
    [...fresh.files].sort(),
    label + ' output must match fresh build'
  )
  assert.deepEqual(
    warm.diagnostics.map((d) => [d.code, d.messageText]),
    fresh.diagnostics.map((d) => [d.code, d.messageText]),
    label + ' diagnostics'
  )
  assert.deepEqual(
    [...warm.dependencies].sort(),
    [...fresh.dependencies].sort(),
    label + ' dependencies'
  )
  return warm
}
check('first')
const firstSource = cache.sources.get(input.entries[0])
assert.equal(check('unchanged').profile.stats.parsedLuaFiles, 0)
assert.equal(cache.sources.get(input.entries[0]), firstSource)
write('raw.lua', 'return {value=function() return 2 end}')
assert.equal(check('native edit').profile.stats.parsedLuaFiles, 2)
write('raw.lua', 'local other=require("other"); return {value=other.value}')
write('other.lua', 'return {value=function() return 3 end}')
check('new native dependency')
write('other.lua', 'local raw=require("raw"); return raw')
check('new native cycle', true)
write('other.lua', 'return {value=function() return 4 end}')
check('cycle recovery')
fs.unlinkSync(path.join(root, 'other.lua'))
check('missing native dependency', true)
write('raw.lua', 'return {value=function() return 5 end}')
check('removed dependency recovery')
write('raw.d.ts', 'export function value(this:void,n:number):number')
check('declaration error', true)
write('raw.d.ts', 'export function value(this:void):number')
check('declaration recovery')
write('shared.ts', 'export let value=8; export function increment(){value+=2}')
check('TS edit')
check('repeat TS edit')
write(
  'main.ts',
  main.replace(
    'lua.print(value(),count,counter.next())',
    'lua.print(value(),count,counter.next(),Math.abs(-2))'
  )
)
check('entry edit')
write('raw.ts', 'export function value(){return 12}')
check('new TS shadows native declaration')
fs.unlinkSync(path.join(root, 'raw.ts'))
check('restore native resolution')
write('tsconfig.json', '{oops')
check('invalid config', true)
write('tsconfig.json', '{}')
check('config recovery')
console.log('Incremental outputs, diagnostics and dependencies match fresh builds: PASS')

write('main.ts', main.replace('class Counter', 'const mismatch: string = 1; class Counter'))
input.typeCheck = false
check('default build skips ordinary type errors')
input.typeCheck = true
check('explicit typecheck catches ordinary type errors', true)
input.typeCheck = false
write('main.ts', main.replace('class Counter', 'const invalid = ; class Counter'))
check('syntax errors still block compilation', true)
