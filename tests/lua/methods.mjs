import assert from 'node:assert/strict'

import { buildFixture, execute, successful } from './support.mjs'

const prefix =
  "import {g} from 'genshin-ts/runtime/core'; import {multi} from 'genshin-ts/runtime/lua'; export default g.clientControlScript(lua=>{"
const built = successful(
  buildFixture({
    'main.ts':
      prefix +
      `let count=0;
function summary(prefix:string){return prefix + count}
const increment=(amount:number)=>{count+=amount;return count};
function snapshot(){return multi(count, 'ready')}
return{methods:{summary, alias:summary, increment, snapshot, inline(){return count}}}})`
  })
)
execute(
  built.files,
  `require('main'); assert(increment(3)==3); assert(summary('n=')=='n=3'); assert(alias('x')=='x3'); assert(inline()==3);local n,s=snapshot();assert(n==3 and s=='ready')`
)
for (const value of ['42', 'counter.summary', 'Counter.summary']) {
  const result = buildFixture(
    {
      'main.ts':
        prefix +
        `class Counter{static summary(){return 1}};const counter={summary(){return 2}};return{methods:{summary:${value}}}})`
    },
    false
  )
  assert(
    result.diagnostics.some(
      (d) => d.source === 'lua-public-methods' && d.file && d.start !== undefined
    )
  )
  assert.equal(result.files.size, 0)
}
// findScript<typeof Entry>：脚本路径由入口文件推出；methods.x(...) 与 Invoke 都走官方 Invoke。
const board =
  "import{g}from'genshin-ts/runtime/core';import{multi}from'genshin-ts/runtime/lua';export default g.clientControlScript(lua=>{let lines:string[]=[];return{methods:{push(line:string){lines=[line,...lines];return lines.length},pair(){return multi(1,2)}}}})"
const caller = successful(
  buildFixture({
    'lua/board.ts': board,
    'main.ts':
      "import{g}from'genshin-ts/runtime/core';import type Board from './lua/board';export default g.clientControlScript(lua=>{const board=lua.helper.findScript<typeof Board>(self.parent,'Board');const direct=lua.helper.findScript<typeof Board>(self);return{onStart(){const n:number|undefined=board?.methods.push('a');const [x,y]=board!.methods.pair();lua.print(n,board?.Invoke('push','b'),x,y,direct===undefined)}}})"
  })
)
assert(
  caller.files.get('main.lua').includes('findScript("lua/board"'),
  caller.files.get('main.lua')
)
execute(
  caller.files,
  `typeof = function() return 'ClientUIContainerControl' end
local calls, printed = {}, {}
local remote = {Invoke = function(_, name, ...) calls[#calls + 1] = name; if name == 'pair' then return 1, 2 end; return 7 end}
local boardControl = {name = 'Board', GetChildren = function() return {} end,
  GetScriptByPath = function(_, path) assert(path == 'lua/board', path); return remote end}
script = {object = {parent = {GetChildren = function() return {boardControl} end},
  GetChildren = function() return {} end, GetScriptByPath = function() return nil end}}
print = function(...) printed[#printed + 1] = table.pack(...) end
require('main'); OnStart()
local p = printed[1]
assert(p[1] == 7 and p[2] == 7 and p[3] == 1 and p[4] == 2 and p[5] == true)
assert(calls[1] == 'push' and calls[2] == 'pair' and calls[3] == 'push')`
)
for (const body of [
  'lua.helper.findScript(self)',
  'const value=1;lua.helper.findScript<typeof value>(self)'
]) {
  const result = buildFixture({ 'main.ts': prefix + `${body};return{}})` }, false)
  assert(
    result.diagnostics.some((d) => d.source === 'lua-find-script'),
    body + ': ' + result.diagnostics.map((d) => d.messageText).join(' | ')
  )
}
console.log(
  'Public methods: shorthand, function references, arrows and multiple returns execute; class/object methods and non-functions rejected; findScript derives the script path, methods.x and Invoke both call Invoke: PASS'
)
