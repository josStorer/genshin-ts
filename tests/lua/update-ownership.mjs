import assert from 'node:assert/strict'

import { buildFixture, execute, successful } from './support.mjs'

const result = successful(
  buildFixture({
    'main.ts': `import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{
 const script=lua.script;const {script:alias}=lua;let ticks=0,timers=0;
 const other=self.GetScriptByPath('other');
 setTimeout(()=>{timers++},100);
 return {onStart(){script.EnableUpdate(true);other?.EnableUpdate(true)},
 onUpdate(){ticks++;alias.EnableUpdate(false)},
 methods:{ticks(){return ticks},timers(){return timers},restart(){lua.script['EnableUpdate'](true)}}}
})`
  })
)
execute(
  result.files,
  `
 local updates,foreign={},{}
 local other={EnableUpdate=function(self,enabled)foreign[#foreign+1]=enabled end}
 local script={object={GetScriptByPath=function()return other end}}
 function script:EnableUpdate(enabled)updates[#updates+1]=enabled end
 local env=setmetatable({script=script,printerr=function(message)error(message)end},{__index=_G})
 assert(load(${JSON.stringify(result.files.get('main.lua'))},'updates.lua','t',env))()
 env.OnStart();assert(updates[1]==true and foreign[1]==true)
 env.OnUpdate(0.05);env.OnUpdate(0.05);assert(env.ticks()==1 and #updates==1)
 env.OnLevelUpdate(0.11);assert(env.timers()==1 and updates[2]==false)
 env.restart();env.OnUpdate(0.1);assert(env.ticks()==2 and updates[3]==true and updates[4]==false)
 env.OnDisable();env.OnDestroy()
`
)
const plain = successful(
  buildFixture({
    'main.ts': `import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return{onStart(){lua.script.EnableUpdate(true)}}})`
  })
)
assert.match(plain.files.get('main.lua'), /:EnableUpdate\(true\)/)
assert(!plain.files.get('main.lua').includes('createScope'))
console.log(
  'Update ownership: current script and aliases route through scope; foreign and unscoped script calls remain native: PASS'
)
