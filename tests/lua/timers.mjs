import assert from 'node:assert/strict'

import { buildFixture, execute, successful } from './support.mjs'

for (const clock of ['level', 'real']) {
  const result = successful(
    buildFixture({
      'main.ts': `import{g}from'genshin-ts/runtime/core';export default g.clientControlScript({timerClock:'${clock}'},lua=>{
let count=0, intervalCount=0, ticks=0;
setTimeout((value:number)=>{count+=value;setTimeout(()=>{count+=100},0)},100,3);
const cancel=setTimeout(()=>{count+=999},0);clearTimeout(cancel);clearTimeout(cancel);
const repeat=setInterval(()=>{intervalCount++},100);
setTimeout(()=>{throw new Error('timer failure')},50);
return{onUpdate(){ticks++},onLevelUpdate(){ticks++},methods:{count(){return count},interval(){return intervalCount},ticks(){return ticks},stop(){clearInterval(repeat)},restart(){setTimeout(()=>{count+=7},1)}}}
})`
    })
  )
  execute(
    result.files,
    `
local text=${JSON.stringify(result.files.get('main.lua'))}
local function mount()
 local errors={}
 local script={object={},enables=0}
 function script:EnableUpdate(value) self.updates=value;self.enables=self.enables+1 end
 local env=setmetatable({script=script,printerr=function(msg)errors[#errors+1]=msg end},{__index=_G})
 assert(load(text,'timer.lua','t',env))();return env,errors
end
local a,errors=mount();local b=mount();a.OnStart();a.OnEnable();b.OnStart()
local tick=a.${clock === 'level' ? 'OnLevelUpdate' : 'OnUpdate'}
a.${clock === 'level' ? 'OnUpdate' : 'OnLevelUpdate'}(20);assert(a.count()==0)
tick(0.1);assert(a.count()==3 and a.interval()==1 and #errors==1)
tick(0);assert(a.count()==103 and a.interval()==1)
tick(2);assert(a.interval()==2);a.stop();tick(2);assert(a.interval()==2)
assert(b.count()==0);b.${clock === 'level' ? 'OnLevelUpdate' : 'OnUpdate'}(0.1);assert(b.count()==3)
a.restart();a.OnDisable();tick(9);assert(a.count()==103);a.restart();a.OnEnable();tick(0.0005);assert(a.count()==103);tick(0.0006);assert(a.count()==117)
a.restart();tick(0.0011);assert(a.count()==124);a.OnDestroy();tick(1);assert(a.count()==124)
assert(not pcall(a.restart));b.OnDestroy()
local c=mount();c.OnEnable()
local ctick=c.${clock === 'level' ? 'OnLevelUpdate' : 'OnUpdate'}
ctick(0.04);c.OnDisable();ctick(99);c.OnEnable();ctick(0.059)
assert(c.count()==0 and c.interval()==0)
ctick(0.002);assert(c.count()==3 and c.interval()==1)
c.OnDestroy();ctick(1);assert(c.count()==3)
`
  )
}
const invalid = buildFixture(
  {
    'main.ts':
      "import{g}from'genshin-ts/runtime/core';export default g.clientControlScript({timerClock:'other'},()=>{return{}})"
  },
  false
)
assert(invalid.diagnostics.some((d) => d.source === 'lua-entry-options'))
const external = buildFixture(
  {
    'main.ts':
      "import{g}from'genshin-ts/runtime/core';import{start}from'./module';export default g.clientControlScript(()=>{start();return{}})",
    'module.ts': 'export function start(){setTimeout(()=>{},1)}'
  },
  false
)
assert(external.diagnostics.some((d) => d.source === 'lua-instance-scope'))
console.log(
  'Timers: both clocks, cancellation, repeat catch-up, errors, deferred tasks, isolated mounts and pause/resume, inactive scheduling and destruction: PASS'
)

const finiteDelay = successful(
  buildFixture({
    'main.ts':
      "import{g}from'genshin-ts/runtime/core';g.clientControlScript(()=>{let count=0;return{methods:{schedule(delay:number,repeat:boolean){if(repeat)setInterval(()=>count++,delay);else setTimeout(()=>count++,delay)},count(){return count}}}})"
  })
)
execute(
  finiteDelay.files,
  String.raw`
script={EnableUpdate=function() end}
require('main');OnStart()
for _, repeatTimer in ipairs({false,true}) do
 for _, delay in ipairs({0/0,math.huge,-math.huge}) do
  local ok,message=pcall(schedule,delay,repeatTimer)
  assert(not ok and tostring(message):find('Timer delay must be a finite number of milliseconds',1,true),tostring(message))
 end
end
OnLevelUpdate(1);assert(count()==0,'invalid delays must not leave tasks behind')
schedule(-1,false);OnLevelUpdate(0);assert(count()==1)
schedule(25,false);OnLevelUpdate(0.024);assert(count()==1)
OnLevelUpdate(0.002);assert(count()==2)
OnDestroy()
`
)
console.log(
  'Timer delays: NaN and both infinities report a readable error; negative and finite delays retain their behavior: PASS'
)
