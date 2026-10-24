import assert from 'node:assert/strict'

import { buildFixture, execute, successful } from './support.mjs'

const result = successful(
  buildFixture({
    'main.ts': `import {g,defineSignal} from 'genshin-ts/runtime/core';
 export default g.clientControlScript(lua=>{
  const signal=defineSignal('Scope',[['n','int']] as const);
  let count=0;
  lua.onSignal(signal,evt=>{count+=evt.params.n});
  const off=lua.onKey(self,lua.Enum.KeyEventType.KeyboardJumpKeyDown,()=>{count++;return false});
  return {
   onStart(){lua.print('start')},
   onDisable(){setTimeout(()=>{count+=1000},0);off();lua.print('disable');if(count===9)throw new Error('disable failure')},
   onDestroy(){setTimeout(()=>{count+=1000},0);lua.print('destroy');lua.error('destroy failure')},
   methods:{count(){return count}}
  }
 })`
  })
)
const text = result.files.get('main.lua')
assert.match(text, /function _ENV.OnEnable\(\)[\s\S]*?\.activate\(\)/)
assert.match(text, /function _ENV.OnDisable\(\)[\s\S]*?\.deactivate\(\)/)
assert.match(text, /function _ENV.OnDestroy\(\)[\s\S]*?\.dispose\(\)/)
assert(!result.files.get('__gsts_helpers.lua').includes('scope.install'))
execute(
  result.files,
  `
 local text=${JSON.stringify(text)}
 local handlers, keys, messages={}, {}, {}
 local control={alive=true}
 function control:AddKeyEventListener(event,fn)keys[fn]=true end
 function control:RemoveKeyEventListener(event,fn)keys[fn]=nil end
 local script={object=control}
 function script:EnableUpdate(value)end
 function script:RegisterServerSignalHandler(name,fn)assert(not handlers[name]);handlers[name]=fn end
 function script:UnregisterServerSignalHandler(name)handlers[name]=nil end
 local env=setmetatable({script=script,Enum={KeyEventType={KeyboardJumpKeyDown=1}},
   printerr=function(message)error(message)end,
   print=function(message)
     if message=='start' or message=='disable' or message=='destroy' then assert(handlers.Scope,'user hook must run while scope is active') end
     messages[#messages+1]=message
   end},{__index=_G})
 assert(load(text,'scope.lua','t',env))()
 env.OnStart(); env.OnEnable(); handlers.Scope('Scope',{9})
 assert(env.count()==9 and next(keys))
 local ok,err=pcall(env.OnDisable)
 assert(not ok and type(err)=='table' and tostring(err):find('disable failure',1,true),'Error objects pass through unchanged')
 assert(not next(keys) and not next(handlers))
 env.OnLevelUpdate(10); assert(env.count()==9)
 env.OnEnable(); assert(handlers.Scope and not next(keys))
 env.OnLevelUpdate(10); assert(env.count()==1009,'enable must resume the timer scheduled in the user disable hook')
 ok,err=pcall(env.OnDestroy)
 assert(not ok and tostring(err):find('destroy failure',1,true))
 assert(tostring(err):find('stack traceback',1,true),'string errors keep the stack where they were raised')
 assert(not next(handlers)); env.OnEnable(); assert(not next(handlers))
 env.OnLevelUpdate(10);assert(env.count()==1009)
`
)
console.log(
  'Scope lifecycle: visible wrappers, active stop hooks, cleanup after errors with preserved stacks, timer pause/resume and terminal destruction: PASS'
)
