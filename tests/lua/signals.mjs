import assert from 'node:assert/strict'

import { buildFixture, execute, successful } from './support.mjs'

const result = successful(
  buildFixture({
    'main.ts': `import{g,defineSignal}from'genshin-ts/runtime/core';
export default g.clientControlScript(lua=>{
const Signal=defineSignal('Test',[['value','int'],['tags','str_list']] as const);
let total=0, calls=0;
const off=lua.onSignal(Signal,evt=>{total+=evt.params.value;calls++;});
lua.onSignal(Signal,evt=>{if(evt.params.tags[0]==='throw')throw new Error('listener failed')});
lua.onSignal(Signal,()=>{calls++});
lua.onKey(self,lua.Enum.KeyEventType.KeyboardJumpKeyDown,()=>{calls+=10;return false});
return{onDisable(){lua.print('disabled')}, methods:{total(){return total},calls(){return calls},stop(){off();off()}}}
})`
  })
)
execute(
  result.files,
  `
local text=${JSON.stringify(result.files.get('main.lua'))}
local function mount()
 local handlers, logs, keyListeners = {}, {}, {}
 local host={alive=true}
 function host:AddKeyEventListener(event,fn) keyListeners[fn]=true end
 function host:RemoveKeyEventListener(event,fn) keyListeners[fn]=nil end
 local script={object=host,alive=true,registrations=0,removals=0}
 function script:RegisterServerSignalHandler(name,fn) assert(handlers[name]==nil);handlers[name]=fn;self.registrations=self.registrations+1 end
 function script:UnregisterServerSignalHandler(name) assert(handlers[name]);handlers[name]=nil;self.removals=self.removals+1 end
 local env=setmetatable({script=script,Enum={KeyEventType={KeyboardJumpKeyDown=1}},printerr=function(message)logs[#logs+1]=message end,print=function()end},{__index=_G})
 assert(load(text,'hud.lua','t',env))()
 return env,handlers,logs,keyListeners
end
local a,handlers,logs,keys=mount()
assert(next(handlers)==nil and next(keys)==nil)
a.OnEnable();a.OnStart();assert(a.script.registrations==1)
handlers.Test('Test',{3,{'ok'}});assert(a.total()==3 and a.calls()==2)
for fn in pairs(keys)do fn()end;assert(a.calls()==12)
handlers.Test('Test',{4,{'throw'}});assert(a.total()==7 and a.calls()==14 and #logs==1)
handlers.Test('Test',{1.5,{'ok'}});handlers.Test('Test',{5,{true}});handlers.Test('Test',{8});handlers.Test('Test',{8,{},'extra'})
assert(a.total()==7 and #logs==5)
a.OnDisable();a.OnDisable();assert(next(handlers)==nil and next(keys)==nil and a.script.removals==1)
a.OnEnable();assert(a.script.registrations==2);a.stop();handlers.Test('Test',{9,{'ok'}});assert(a.total()==7 and a.calls()==15)
local b,bh=mount();b.OnStart();bh.Test('Test',{2,{'ok'}});assert(b.total()==2 and a.total()==7)
a.OnDestroy();assert(next(handlers)==nil and next(keys)==nil);a.OnEnable();assert(next(handlers)==nil)
b.OnDestroy();assert(next(bh)==nil)
`
)
const bad = buildFixture(
  {
    'main.ts': `import{g,defineSignal}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{const S=defineSignal('S',[['n','int']] as const);lua.onSignal(S,evt=>lua.print(evt.params.missing));return{}})`
  },
  false
)
assert(bad.diagnostics.some((d) => d.code === 2339))
console.log(
  'Typed signals: isolated mounts, dispatch, cancellation, malformed payloads, listener errors and lifecycle cleanup: PASS'
)
