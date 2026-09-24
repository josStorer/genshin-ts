import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { lua, lauxlib, lualib, to_luastring, to_jsstring } from 'fengari'
import { compileLua, formatLuaDiagnostics } from '../../src/compiler/lua/build.ts'
import { writeLuaFiles, hasLuaMarker, describeLuaConflicts } from '../../src/compiler/lua/output.ts'

const root = path.resolve('.tmp/lua-tests')
fs.mkdirSync(root, {recursive:true})
function build(sources, entry = 'main.ts') {
  const dir = fs.mkdtempSync(path.join(root, 'case-'))
  for (const [name, text] of Object.entries(sources)) { fs.mkdirSync(path.dirname(path.join(dir,name)),{recursive:true}); fs.writeFileSync(path.join(dir,name),text) }
  return { dir, ...compileLua({entries:[path.join(dir,entry)],rootDir:dir,outDir:path.join(dir,'out')}) }
}
function success(result) {
  assert.equal(result.diagnostics.some(d=>d.category===1),false,formatLuaDiagnostics(result.diagnostics))
  assert.ok(result.files.size > 0)
  return result
}
function execute(files, test) {
  const L = lauxlib.luaL_newstate(); lualib.luaL_openlibs(L)
  const run = code => { const status = lauxlib.luaL_dostring(L,to_luastring(code)); assert.equal(status,0,lua.lua_isstring(L,-1) ? to_jsstring(lua.lua_tostring(L,-1)) : 'Lua failed') }
  for (const [name, text] of files) {
    run(`package.preload[${JSON.stringify(name.replace(/\.lua$/,''))}] = function(...)\n${text}\nend`)
  }
  run(test); lua.lua_close(L)
}
const result=success(build({
  'counter.ts':`export let count=0; export let state={count:0}; export function inc(){count++;state={count}}`,
  'bridge.ts':`export {count, state, inc} from './counter'`,
  'native.d.ts':`import type {LuaMultiReturn} from 'genshin-ts/runtime/lua-primitives'; export function pair(this:void): LuaMultiReturn<[number,number]>`,
  'native.lua':`return {pair=function() return 4, 5 end}`,
  'main.ts':`import {g} from 'genshin-ts/runtime/core'; import {count,state,inc} from './bridge'; import {pair} from './native';
  export default g.clientControlScript(lua=>{ let elapsed=0; const before=count; class Counter {value=0; add(n:number){this.value+=n;return this.value}}; const c=new Counter();
  return {onStart(){inc(); const [x,y]=pair(); lua.print(count,state.count,before,x,y); lua.script.EnableUpdate(true)},onUpdate(dt){elapsed+=dt;lua.print(elapsed,c.add(2),lua.helper.clamp(9,0,5));console.log('100% literal')}} })`
}))
fs.writeFileSync(path.join(root,'main.lua'),result.files.get('main.lua'))
execute(result.files,`local calls={}; print=function(...) calls[#calls+1]=table.pack(...) end
script={EnableUpdate=function(self,enabled) assert(self==script and enabled) end}
require('main'); OnStart(); OnUpdate(0.5); OnUpdate(0.5)
assert(calls[1][1]==1 and calls[1][2]==1 and calls[1][3]==0 and calls[1][4]==4 and calls[1][5]==5)
assert(calls[2][1]==0.5 and calls[2][2]==2 and calls[2][3]==5)
assert(calls[3][1]=='100% literal'); assert(calls[4][1]==1 and calls[4][2]==4)`)
const circular=build({'main.ts':`import './a';export default 0`, 'a.ts':`import './b'`, 'b.ts':`import './a'`})
assert.ok(circular.diagnostics.some(d=>String(d.messageText).includes('循环加载')))
const invalid=build({'main.ts':`import {g} from 'genshin-ts/runtime/core'; export default g.clientControlScript(lua=>({onUpdate(dt){GameObject.foo();lua.game.NotReal();}}))`})
assert.ok(invalid.diagnostics.some(d=>d.category===1));assert.equal(invalid.files.size,0)
const target=fs.mkdtempSync(path.join(root,'output-'))
const files=new Map([['main.lua','-- @gsts:lua\nreturn 1\n']])
assert.equal(writeLuaFiles(target,files,true).written.length,1)
assert.equal(writeLuaFiles(target,files,true).unchanged.length,1)
fs.writeFileSync(path.join(target,'user.lua'),'print("mine")')
const conflict=writeLuaFiles(target,new Map([...files,['user.lua','-- @gsts:lua\nreturn 2']]),true)
assert.deepEqual(conflict.conflicts,['user.lua']);assert.match(describeLuaConflicts(conflict,true),/Lua 注入未完成/)
assert.equal(fs.readFileSync(path.join(target,'user.lua'),'utf8'),'print("mine")')
assert.throws(()=>writeLuaFiles(target,new Map([['../outside.lua','-- @gsts:lua\n']])) ,/不安全/)
assert.equal(hasLuaMarker('\uFEFF\n-- @gsts:lua\nprint(1)'),true)
assert.equal(hasLuaMarker('-- user\n-- @gsts:lua'),false)
assert.deepEqual(writeLuaFiles(target,new Map(),true).removed,['main.lua'])
assert.equal(fs.existsSync(path.join(target,'user.lua')),true)
console.log('Lua compiler, native module, live bindings, class, hooks and safe output: PASS')
