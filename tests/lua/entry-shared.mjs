import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { compileLua, createLuaCompileCache } from '../../src/compiler/lua/build.ts'
import { buildFixture, execute, successful } from './support.mjs'

const entry = `import {g} from 'genshin-ts/runtime/core'
import {record} from './record'
record()
export let total = 0
let hidden = 3
export {hidden as current}
export function bump() { hidden++; return ++total }
export class Counter { #value = 7; read() { return this.#value } }
const [step] = [2]
export default g.clientControlScript(lua => {
 let own = 0
 return {
  onStart() { total += step; hidden++; own++; },
  methods: { read() { return [total, hidden, own, new Counter().read()] }, increase() { return bump() } }
 }
})`
const result = successful(
  buildFixture({
    'main.ts': entry,
    'record.d.ts': 'export function record(this:void):void',
    'record.lua': 'return { record=function() topExecutions = (topExecutions or 0) + 1 end }'
  })
)
assert(result.files.has('__gsts_shared/main.lua'))
assert.doesNotMatch(result.files.get('main.lua'), /____exports/)
const mount = `function mount()
 local env = setmetatable({}, {__index=_G})
 env._ENV=env
 assert(load(${JSON.stringify(result.files.get('main.lua'))}, 'main.lua', 't', env))()
 return env
end`
execute(
  result.files,
  mount +
    `
local left,right=mount(),mount()
left.OnStart();right.OnStart()
assert(topExecutions==1)
assert(left.read()[1]==4 and right.read()[1]==4)
assert(left.read()[2]==5 and right.read()[2]==5)
assert(left.read()[3]==1 and right.read()[3]==1)
assert(left.read()[4]==7)
left.OnStart()
assert(left.read()[3]==2 and right.read()[3]==1)
-- Destroy and reload the mount, without clearing require's cache (teleport model).
left=nil
local replacement=mount();replacement.OnStart()
assert(topExecutions==1 and replacement.read()[1]==8 and replacement.read()[3]==1)
local shared=require('__gsts_shared.main').exports
assert(shared.current==7)
assert(replacement.increase()==9 and shared.current==8)
replacement.OnStart()
assert(shared.current==9 and shared.total==11)
`
)
const named = successful(
  buildFixture({
    'board.ts': entry.replace("import {record} from './record'\nrecord()", ''),
    'bridge.ts': `export {total,current,bump,Counter} from './board'`,
    'main.ts': `import {g} from 'genshin-ts/runtime/core';import type Board from './board';import {total,current,bump,Counter} from './bridge';g.clientControlScript(lua=>{return{onStart(){lua.assert(total===0);bump();lua.assert(total===1 && current===4);lua.assert(new Counter().read()===7)}}})`
  })
)
execute(named.files, `require('main');OnStart()`)
assert(named.entries.includes('main.lua'))
for (const body of ['self', 'setTimeout(()=>{},1)', 'send({name:"x",params:[]})']) {
  const bad = buildFixture(
    {
      'main.ts': `import {g} from 'genshin-ts/runtime/core';const value=${body};g.clientControlScript(lua=>{return{}})`
    },
    false
  )
  assert(
    bad.diagnostics.some((d) => d.source === 'lua-instance-scope'),
    body
  )
  assert.equal(bad.files.size, 0)
}
for (const use of [
  'import Board from "./board";console.log(Board)',
  'import * as Board from "./board";console.log(Board.default)'
]) {
  const bad = buildFixture(
    {
      'board.ts': entry.replace("import {record} from './record'\nrecord()", ''),
      'main.ts': `import{g}from'genshin-ts/runtime/core';${use};g.clientControlScript(lua=>{return{}})`
    },
    false
  )
  assert(
    bad.diagnostics.some((d) => d.source === 'lua-entry-default-value'),
    use
  )
  assert.equal(bad.files.size, 0)
}
const simple = `import{g}from'genshin-ts/runtime/core';export type T=number;g.clientControlScript(lua=>{return{onStart(){lua.print(1)}}})`
assert(
  ![...successful(buildFixture({ 'main.ts': simple })).files.keys()].some((name) =>
    name.startsWith('__gsts_shared/')
  )
)
const twice = buildFixture({ 'main.ts': simple + ';g.clientControlScript(lua=>{return{}})' }, false)
assert(twice.diagnostics.some((d) => d.source === 'lua-entry-declaration'))
// A shared output must be reused, rebuilt or removed with its original entry in dev.
const root = fs.mkdtempSync(path.resolve('.tmp/lua-tests/shared-incremental-'))
const filename = path.join(root, 'main.ts')
const input = { entries: [filename], rootDir: root, outDir: path.join(root, 'out') }
const cache = createLuaCompileCache()
for (const source of [
  entry.replace("import {record} from './record'\nrecord()", ''),
  simple,
  entry.replace("import {record} from './record'\nrecord()", '').replace('total = 0', 'total = 9')
]) {
  fs.writeFileSync(filename, source)
  const warm = successful(compileLua({ ...input, changedFiles: [filename] }, cache))
  const cold = successful(compileLua(input))
  assert.deepEqual([...warm.files].sort(), [...cold.files].sort())
  assert.deepEqual(
    [...successful(compileLua({ ...input, changedFiles: [] }, cache)).files].sort(),
    [...cold.files].sort()
  )
}
console.log(
  'Shared entry: two mounts, teleport model, live named exports, private classes, scope/default diagnostics, shorthand entry and incremental output: PASS'
)

const empty = successful(
  buildFixture({
    'board.ts': simple,
    'main.ts': `import{g}from'genshin-ts/runtime/core';import * as board from './board';g.clientControlScript(lua=>{return{onStart(){lua.assert(Object.keys(board).length===0)}}})`
  })
)
assert(![...empty.files.keys()].some((name) => name.startsWith('__gsts_shared/')))
execute(empty.files, `require('main');OnStart()`)

const optional = successful(
  buildFixture({
    'main.ts': `import{g}from'genshin-ts/runtime/core';let optional:number|undefined;export{optional};g.clientControlScript(lua=>{return{onStart(){lua.assert(optional===undefined);optional=2;lua.assert(optional===2)}}})`
  })
)
execute(optional.files, `require('main');OnStart()`)
