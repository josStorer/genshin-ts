import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  compileLua,
  createLuaCompileCache,
  formatLuaDiagnostics
} from '../../src/compiler/lua/ts_to_lua_pipeline.ts'

const base = path.resolve('.tmp/lua-affected')
fs.mkdirSync(base, { recursive: true })
for (const typeCheck of [false, true]) {
  const root = fs.mkdtempSync(path.join(base, 'run-'))
  const changes = new Set()
  const write = (name, text) => {
    fs.writeFileSync(path.join(root, name), text)
    changes.add(path.join(root, name))
  }
  const cache = createLuaCompileCache()
  const input = {
    entries: ['a.ts', 'b.ts'].map((n) => path.join(root, n)),
    rootDir: root,
    outDir: path.join(root, 'out'),
    typeCheck,
    profile: true
  }
  const entry = (body) => `import {g} from 'genshin-ts/runtime/core';${body}`
  const a = entry(
    `import {value} from './bridge';import {read} from './raw';export default g.clientControlScript(lua=>{return{onStart(){lua.print(value,read())}}})`
  )
  const b = entry(`export default g.clientControlScript(lua=>{return{onStart(){lua.print(2)}}})`)
  write('a.ts', a)
  write('b.ts', b)
  write('base.ts', 'export let value=1')
  write('bridge.ts', 'export {value} from "./base"')
  write('types.ts', 'export type Fn=(this:void)=>number')
  write('raw.d.ts', 'import type {Fn} from "./types";export const read:Fn')
  write('raw.lua', 'return {read=function() return 4 end}')
  function check(label, expected, error = false) {
    const warm = compileLua({ ...input, changedFiles: [...changes] }, cache),
      cold = compileLua(input)
    assert.equal(
      warm.diagnostics.some((d) => d.category === 1),
      error,
      label + ' ' + formatLuaDiagnostics(warm.diagnostics)
    )
    assert.deepEqual(
      [...warm.files.keys()].sort(),
      [...cold.files.keys()].sort(),
      label + ' file set'
    )
    for (const [name, text] of warm.files)
      assert.equal(text, cold.files.get(name), label + ' output: ' + name)
    const diagnostics = (r) => r.diagnostics.map((d) => [d.code, d.start, d.messageText])
    assert.deepEqual(diagnostics(warm), diagnostics(cold), label + ' diagnostics')
    assert.deepEqual(
      [...warm.dependencies].sort(),
      [...cold.dependencies].sort(),
      label + ' dependencies'
    )
    if (expected !== undefined && !error)
      assert.equal(warm.profile.stats.transpiledFiles, expected, label + ' affected file count')
    changes.clear()
    return warm
  }
  check('initial', 5)
  check('unchanged', 0)
  write('b.ts', b.replace('lua.print(2)', 'lua.print(3)'))
  const isolated = check('isolated entry', 1)
  assert.equal(isolated.profile.stats.sourceReads, 1)
  assert.equal(isolated.profile.stats.resolvedDependencyFiles, 1)
  assert.equal(isolated.profile.stats.cycleChecks, 0)
  write('base.ts', 'export let value=8')
  check('transitive re-export', 3)
  write('types.ts', 'export type Fn=(this:unknown)=>number')
  check('type import through declaration', 2)
  write('types.ts', 'export type Fn=(this:void)=>number')
  check('restore native receiver', 2)
  write('b.ts', b.replace('lua.print(2)', 'class Counter {value=1};lua.print(new Counter().value)'))
  check('add class runtime', 1)
  write('b.ts', b)
  check('remove unused class runtime', 1)
  write(
    'a.ts',
    a.replace('lua.print(value,read())', 'lua.print(value,read(), new Map<string,number>().size)')
  )
  check('runtime feature in other entry', 1)
  write('b.ts', b.replace('lua.print(2)', 'lua.print([1,2].map(n=>n*2)[0])'))
  check('merge different runtime features', 1)
  write('a.ts', a.replace("import {read} from './raw';", '').replace('value,read()', 'value'))
  assert.equal(check('remove native import', 4).files.has('raw.lua'), false)
  write('next.ts', 'export let value=9')
  write('bridge.ts', 'export {value} from "./next"')
  fs.unlinkSync(path.join(root, 'base.ts'))
  changes.add(path.join(root, 'base.ts'))
  check('rename dependency', 3)
  write('next.ts', 'export let value = ;')
  check('syntax failure', undefined, true)
  write('next.ts', 'export let value=10')
  check('failure recovery', 3)
  write('raw.d.ts', 'export function read(this:void):number')
  write('a.ts', a)
  check('declaration change is conservative', 4)
  write('extra.d.ts', 'declare global {interface String {extra?:number}}; export {}')
  write('a.ts', a.replace('import {value}', "import type {} from './extra';import {value}"))
  check('new declaration', 4)
  console.log(
    'Affected modules, type imports, declarations, native imports and lualib match cold builds: PASS (' +
      typeCheck +
      ')'
  )
}
