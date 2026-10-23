import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { lauxlib, lua, lualib, to_jsstring, to_luastring } from 'fengari'

import { compileLua, formatLuaDiagnostics } from '../../src/compiler/lua/build.ts'
import { describeLuaConflicts, hasLuaMarker, writeLuaFiles } from '../../src/compiler/lua/output.ts'

const root = path.resolve('.tmp/lua-tests')
fs.mkdirSync(root, { recursive: true })
function build(sources, entry = 'main.ts', include = []) {
  const dir = fs.mkdtempSync(path.join(root, 'case-'))
  for (const [name, text] of Object.entries(sources)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true })
    fs.writeFileSync(path.join(dir, name), text)
  }
  return {
    dir,
    ...compileLua({
      typeCheck: true,
      entries: [path.join(dir, entry)],
      rootDir: dir,
      outDir: path.join(dir, 'out'),
      additionalFiles: include.map((name) => path.join(dir, name))
    })
  }
}
function success(result) {
  assert.equal(
    result.diagnostics.some((d) => d.category === 1),
    false,
    formatLuaDiagnostics(result.diagnostics)
  )
  assert.ok(result.files.size > 0)
  return result
}
function execute(files, test) {
  const L = lauxlib.luaL_newstate()
  lualib.luaL_openlibs(L)
  const run = (code) => {
    const status = lauxlib.luaL_dostring(L, to_luastring(code))
    assert.equal(
      status,
      0,
      lua.lua_isstring(L, -1) ? to_jsstring(lua.lua_tostring(L, -1)) : 'Lua failed'
    )
  }
  for (const [name, text] of files) {
    if (!name.endsWith('.lua')) continue
    const module = name.replace(/\.lua$/, '')
    // Both spellings resolve in the game. Cache identity across spellings is not assumed here.
    for (const key of new Set([module, module.replaceAll('/', '.')])) {
      run(`package.preload[${JSON.stringify(key)}] = function(...)\n${text}\nend`)
    }
  }
  run(test)
  lua.lua_close(L)
}
const result = success(
  build({
    'counter.ts': `export let count=0; export let state={count:0}; export function inc(){count++;state={count}}`,
    'bridge.ts': `export {count, state, inc} from './counter'`,
    'native.d.ts': `import type {LuaMultiReturn} from 'genshin-ts/runtime/lua_primitives'; export function pair(this:void): LuaMultiReturn<[number,number]>`,
    'native.lua': `return {pair=function() return 4, 5 end}`,
    'main.ts': `import {g} from 'genshin-ts/runtime/core'; import {count,state,inc} from './bridge'; import {pair} from './native';
  export default g.clientControlScript(lua=>{ let elapsed=0; const before=count; class Counter {value=0; add(n:number){this.value+=n;return this.value}}; const c=new Counter();
  return {onStart(){inc(); const [x,y]=pair(); lua.print(count,state.count,before,x,y); lua.script.EnableUpdate(true)},onUpdate(dt){elapsed+=dt;lua.print(elapsed,c.add(2),lua.helper.clamp(9,0,5));console.log('100% literal')}} })`
  })
)
fs.writeFileSync(path.join(root, 'main.lua'), result.files.get('main.lua'))
assert.equal((result.files.get('main.lua').match(/require\("__gsts_helpers"\)/g) ?? []).length, 1)
assert.match(result.files.get('main.lua'), /local \w+ = require\("__gsts_helpers"\)/)
const noHelpers = success(
  build({
    'main.ts':
      "import {g} from 'genshin-ts/runtime/core'; export default g.clientControlScript(lua=>{return {onUpdate(dt){lua.print(dt)}}})"
  })
)
assert.equal(noHelpers.files.get('main.lua').includes('require("__gsts_helpers")'), false)
execute(
  result.files,
  `local calls={}; print=function(...) calls[#calls+1]=table.pack(...) end
script={EnableUpdate=function(self,enabled) assert(self==script and enabled) end}
require('main'); OnStart(); OnUpdate(0.5); OnUpdate(0.5)
assert(calls[1][1]==1 and calls[1][2]==1 and calls[1][3]==0 and calls[1][4]==4 and calls[1][5]==5)
assert(calls[2][1]==0.5 and calls[2][2]==2 and calls[2][3]==5)
assert(calls[3][1]=='100% literal'); assert(calls[4][1]==1 and calls[4][2]==4)`
)

const advanced = success(
  build({
    'state.ts': `let n=0; export {n as value, n as default}; export function add(){n++}; export const object={nested:{count:0}}`,
    'reexport.ts': `export * from './state'; export {default} from './state'`,
    'raw.lua': `local nested = require('native/child'); return {value=nested.value}`,
    'native/child.lua': `return {value=12}`,
    'main.ts': `import {g,defineSignal} from 'genshin-ts/runtime/core'; import current,{value,add,object} from './reexport'; import raw from './raw.lua';
  export default g.clientControlScript({}, env=>{let ticks=0; const old=object; const shallow={...object}; const signal=defineSignal('Input',[['speed','float'],['fire','bool']] as const);
  return {methods:{twice(n:number){return n*2}},onInit(){env.print(typeof raw)},onStart(){add();old.nested.count++;env.print(current,value,shallow.nested.count,self===env.script.object); const conf=env.helper.readParams(env.script,{speed:{type:'number',default:20}}); env.print(conf.speed); let n=1; send(signal,n++,n===2); console.assert(false,'test'); try{throw new Error('caught')}catch(e){console.error('caught')} env.print(Number.MAX_SAFE_INTEGER,Number.MIN_VALUE);},onUpdate(dt){ticks+=dt;env.print(ticks)}}})`
  })
)
execute(
  advanced.files,
  `local printed={}; print=function(...) printed[#printed+1]=table.pack(...) end; printerr=print
local traceback=debug.traceback; debug={traceback=traceback}
local captured={}; game={ServerSignal=function(name) assert(name=='Input');return {AddFloat=function(self,v) captured[1]=v end,AddBool=function(self,v) captured[2]=v end,SendSignal=function() captured.sent=true end} end}
script={object={},GetParam=function(self,name) assert(name=='speed');return nil end}
require('main');OnStart();assert(twice(7)==14)
assert(printed[1][1]==1 and printed[1][2]==1 and printed[1][3]==1 and printed[1][4]==true)
assert(printed[2][1]==20); assert(captured[1]==1 and captured[2]==true and captured.sent)
assert(printed[3][1]=='Assertion failed'); assert(printed[4][1]=='caught');assert(printed[5][1]==9007199254740991 and printed[5][2]>0)
`
)
// Loading the same entry twice must create private locals while require keeps module state shared.
let delimiter = '==='
execute(
  result.files,
  `local printed={}; print=function(...) printed[#printed+1]=table.pack(...) end
local function mount()
 local env=setmetatable({script={EnableUpdate=function() end}},{__index=_G})
 assert(load([${delimiter}[${result.files.get('main.lua')} ]${delimiter}], 'entry', 't', env))()
 return env
end
local a,b=mount(),mount();a.OnStart();b.OnStart();a.OnUpdate(1);b.OnUpdate(2)
assert(printed[1][1]==1 and printed[2][1]==2);assert(printed[3][1]==1 and printed[5][1]==2)
`
)

const primitives = success(
  build({
    'main.ts': `import {g} from 'genshin-ts/runtime/core';import {multi} from 'genshin-ts/runtime/lua';export default g.clientControlScript(lua=>{function plus(n:number){return n+1};return {methods:{pair(){return multi(7,9)}},onStart(){for(const [i,v] of lua.ipairs([10,20]))lua.print(i,v);const[ok,n]=lua.pcall(plus,2);lua.print(ok,n);const mapped=[2,3].map(plus);lua.print(mapped[0],mapped[1]);const another=lua;const{helper,self:host}=another;lua.print(helper.clamp(7,0,3),host===self)}}})`
  })
)
execute(
  primitives.files,
  `script={object={}};local values={};print=function(...)values[#values+1]=table.pack(...)end;require('main');OnStart();local a,b=pair();assert(a==7 and b==9);assert(values[1][1]==1 and values[1][2]==10 and values[2][1]==2);assert(values[3][1]==true and values[3][2]==3);assert(values[4][1]==3 and values[4][2]==4);assert(values[5][1]==3 and values[5][2]==true)`
)

const optional = success(
  build({
    'main.ts':
      "import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{let value:{alive:boolean}|undefined;return {onStart(){lua.print(value?.alive);value={alive:true};if(value?.alive)lua.print('alive')}}})"
  })
)
const shadowedBuiltins = success(
  build({
    'main.ts': `import {g} from 'genshin-ts/runtime/core'; export default g.clientControlScript(lua=>{
    interface ClientGlobals { self:number; helper:{value:number} }
    const fake:ClientGlobals={self:7,helper:{value:8}};
    const send=(n:number)=>n+1; const Number={MAX_SAFE_INTEGER:9};
    const console={log(n:number){lua.print(n)}};
    return {onStart(){const {self:own,helper}=fake;console.log(send(own)+helper.value+Number.MAX_SAFE_INTEGER)}}
  })`
  })
)
execute(
  shadowedBuiltins.files,
  "local result;print=function(n) result=n end;require('main');OnStart();assert(result==25)"
)
execute(
  optional.files,
  "local n=0;print=function(value)n=n+1;if n==1 then assert(value==nil)else assert(value=='alive')end end;require('main');OnStart();assert(n==2)"
)
const namespaces = success(
  build({
    'value.ts': 'export const own=9; export let value=1;export function change(){value=2}',
    'reexport.ts': "export const own=undefined;export * from './value'",
    'main.ts':
      "import{g}from'genshin-ts/runtime/core';import * as ns from './reexport';export default g.clientControlScript(lua=>{return {onStart(){ns.change();lua.print(ns.own,ns.value,Object.keys(ns).sort().join(','))}}})"
  })
)
execute(
  namespaces.files,
  `print=function(own,value,keys)assert(own==nil and value==2 and keys=='change,value')end;require('main');OnStart()`
)
execute(
  primitives.files,
  `typeof=function(control)return control.kind end
local h=require('__gsts_helpers');local label={name='Title',kind='ClientUITextBoxControl'}
local panel={name='Panel',GetChildren=function()return {label}end};local root={GetChildren=function()return {panel}end}
assert(h.isControl(label,'ClientUIBaseControl'))
assert(not h.isControl({kind='Script'},'ClientUIBaseControl'))
assert(h.findControl(root,'Panel/Title','ClientUITextBoxControl')==label)
assert(h.findControl(root,'Missing','ClientUITextBoxControl')==nil)
assert(not pcall(h.requireControl,root,'Missing','ClientUITextBoxControl'))
assert(not pcall(h.findControl,root,'Panel/Title','ClientUIImageControl'))
root.GetChildren=function()return {panel,panel}end;assert(not pcall(h.findControl,root,'Panel/Title','ClientUITextBoxControl'))
local saved,count=nil,0;local control={alive=true,AddKeyEventListener=function(self,event,cb)saved=cb end,RemoveKeyEventListener=function(self,event,cb)assert(cb==saved);count=count+1 end}
local callback=function()return false end;local off=h.listenKey(control,'event',callback);off();off();assert(count==1)
`
)
const alias = success(
  build({
    'tsconfig.json': JSON.stringify({
      compilerOptions: { baseUrl: '.', paths: { '@shared/*': ['shared/*'] } }
    }),
    'shared/value.ts': 'export const value=7',
    'main.ts':
      "import{g}from'genshin-ts/runtime/core';import{value}from'@shared/value';export default g.clientControlScript(lua=>{return {onStart(){lua.print(value)}}})"
  })
)
execute(alias.files, "print=function(value)assert(value==7)end;require('main');OnStart()")
const mixedCycle = build({
  'main.ts': "import './a';export const n=1",
  'a.ts': "import './bridge';export const value=1",
  'bridge.d.ts': 'export const n:number',
  'bridge.lua': "require('a');return {}"
})
assert.ok(mixedCycle.diagnostics.some((d) => String(d.messageText).includes('循环 require')))
const rawRequire = success(
  build({
    'module.lua': 'return {value=7}',
    'main.ts':
      "import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return {onStart(){lua.require('module')}}})"
  })
)
assert.ok(rawRequire.files.has('module.lua'))
execute(rawRequire.files, "require('main');OnStart();assert(package.loaded.module.value==7)")
const dynamicSources = {
  'main.ts':
    "import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return {onStart(){const name='value';lua.require(name)}}})",
  'value.lua': 'return {loaded=true}'
}
assert.ok(
  build(dynamicSources).diagnostics.some((d) => String(d.messageText).includes('lua.include'))
)
const dynamic = success(build(dynamicSources, 'main.ts', ['value.lua']))
execute(dynamic.files, "require('main');OnStart();assert(package.loaded.value.loaded)")
const deferred = success(
  build({
    'main.ts':
      "import{g}from'genshin-ts/runtime/core';import * as raw from './raw';export default g.clientControlScript(lua=>{return {onStart(){lua.print(raw.read())}}})",
    'raw.d.ts': 'export function read(this:void): number',
    'raw.lua': "return {value=7,read=function()return require('later').value end}",
    'later.lua': "return {value=require('raw').value}"
  })
)
execute(deferred.files, "print=function(value)assert(value==7)end;require('main');OnStart()")
const truthiness = build({
  'main.ts': `import {g} from 'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{
    function check(n:number,s:string){
      const negated = !n;
      const fallback = s || 'fallback';
      const both = n && s;
      for(;n;){break}
      do {break} while(s);
      const nullable = n ?? 20;
      const explicit = n !== 0 && s !== '';
      const known='known nonempty';if(known){};
      return [negated,fallback,both,nullable,explicit]
    }
    return {onStart(){lua.print(check(0,''))}}
  })`
})
const truthWarnings = truthiness.diagnostics.filter((d) =>
  String(d.messageText).includes('Lua 中 0')
)
assert(truthWarnings.every((d) => d.category === 1 && d.code === 97001))
assert.equal(truthiness.files.size, 0)
assert(!truthiness.diagnostics.some((d) => d.code === 100037))
assert.equal(truthWarnings.length, 5, formatLuaDiagnostics(truthiness.diagnostics))
assert.deepEqual(
  truthWarnings.map((d) => d.file.text.slice(d.start, d.start + d.length)),
  ['n', 's', 'n', 'n', 's']
)
const wrongId = build({
  'main.ts': `import {g} from 'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{lua.game.GetClientUIControl(lua.self.prefabIndex);return {}})`
})
assert.ok(wrongId.diagnostics.some((d) => d.code === 2345))
const methodTypes = build({
  'main.ts': `import {g} from 'genshin-ts/runtime/core';import type {TypedScript,ClientScriptDefinition} from 'genshin-ts/runtime/lua';declare const handle:TypedScript<ClientScriptDefinition<{twice:(this:void,n:number)=>number}>>;export default g.clientControlScript(lua=>{handle.Invoke('missing',1);return {}})`
})
assert.ok(methodTypes.diagnostics.some((d) => d.category === 1))
const inferredMethods = build({
  'other.ts':
    "import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return {methods:{twice(n:number){return n*2}}}})",
  'main.ts':
    "import{g}from'genshin-ts/runtime/core';import type Other from './other';export default g.clientControlScript(lua=>{const handle=lua.helper.scriptHandle<typeof Other>(lua.script);const [n]=handle.Invoke('twice',3);const value:number=n;handle.Invoke('absent');handle.Invoke('twice','wrong');return {}})"
})
assert.equal(
  inferredMethods.diagnostics.filter((d) => d.category === 1).length,
  2,
  formatLuaDiagnostics(inferredMethods.diagnostics)
)
const nativeCycle = build({
  'main.ts': `import './raw';export const n=1`,
  'raw.d.ts': 'export const value:number',
  'raw.lua': `require('nested');return {}`,
  'nested.lua': `require('raw');return {}`
})
assert.ok(nativeCycle.diagnostics.some((d) => String(d.messageText).includes('循环 require')))
const circular = build({
  'main.ts': `import './a';export default 0`,
  'a.ts': `import './b'`,
  'b.ts': `import './a'`
})
assert.ok(circular.diagnostics.some((d) => String(d.messageText).includes('循环 require')))
const invalid = build({
  'main.ts': `import {g} from 'genshin-ts/runtime/core'; export default g.clientControlScript(lua=>({onUpdate(dt){GameObject.foo();lua.game.NotReal();}}))`
})
assert.ok(invalid.diagnostics.some((d) => d.category === 1))
assert.equal(invalid.files.size, 0)
const target = fs.mkdtempSync(path.join(root, 'output-'))
const files = new Map([['main.lua', '-- @gsts:lua\nreturn 1\n']])
assert.equal(writeLuaFiles(target, files, true).written.length, 1)
assert.equal(writeLuaFiles(target, files, true).unchanged.length, 1)
fs.writeFileSync(path.join(target, 'user.lua'), 'print("mine")')
const conflict = writeLuaFiles(
  target,
  new Map([...files, ['user.lua', '-- @gsts:lua\nreturn 2']]),
  true
)
assert.deepEqual(conflict.conflicts, ['user.lua'])
assert.match(describeLuaConflicts(conflict, false), /已跳过写入 user.lua/)
assert.match(describeLuaConflicts(conflict, true), /已跳过注入 user.lua/)
assert.equal(fs.readFileSync(path.join(target, 'user.lua'), 'utf8'), 'print("mine")')
assert.throws(
  () => writeLuaFiles(target, new Map([['../outside.lua', '-- @gsts:lua\n']])),
  /不安全/
)
assert.equal(hasLuaMarker('\uFEFF\n-- @gsts:lua\nprint(1)'), true)
assert.equal(hasLuaMarker('-- user\n-- @gsts:lua'), false)
const oldHeader =
  '-- @gsts:lua\n-- 此文件由 GSTS 生成，请修改源文件后重新编译。\n-- 来源：old.ts\nreturn 0'
assert.equal(hasLuaMarker(oldHeader), true)
fs.writeFileSync(path.join(target, 'main.lua'), oldHeader)
assert.deepEqual(writeLuaFiles(target, files).written, ['main.lua'])
assert.equal(fs.readFileSync(path.join(target, 'main.lua'), 'utf8'), files.get('main.lua'))
for (const [name, text] of result.files) {
  if (!name.endsWith('.lua')) continue
  assert.equal(text.split('\n')[0], '-- @gsts:lua')
  assert.equal(text.includes('-- 此文件由 GSTS 生成'), false)
  assert.equal(text.includes('-- 来源：'), false)
}
assert.deepEqual(writeLuaFiles(target, new Map(), true).removed, ['main.lua'])
assert.equal(fs.existsSync(path.join(target, 'user.lua')), true)
console.log('Lua compiler, native module, live bindings, class, hooks and safe output: PASS')
