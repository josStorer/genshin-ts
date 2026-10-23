import assert from 'node:assert/strict'

import { buildFixture, execute, successful } from './support.mjs'

const result = successful(
  buildFixture({
    'main.ts': `import{g}from'genshin-ts/runtime/core';import{setTimeout as wait}from'genshin-ts/runtime/lua';
g.clientControlScript(lua=>{
 let real=0, level=0, defaults=0;
 const {setTimeout: later}=lua.helper;
 lua.helper.setTimeout(()=>real++,100,'real');
 lua.helper.setTimeout(()=>level++,100,'level');
 setTimeout(()=>defaults++,100);
 const interval=lua.helper.setInterval(()=>real+=10,200,'real');
 const cancelled=wait(()=>level+=999,1,'level');clearTimeout(cancelled);
 later(()=>defaults+=10,300,'level');
 return {methods:{values(){return [real,level,defaults]},stop(){clearInterval(interval)},inactive(){lua.helper['setTimeout'](()=>real+=100,50,'real')}}}
})`
  })
)
execute(
  result.files,
  `
local function mount()
 local script={};function script:EnableUpdate(value)self.enabled=value end
 local env=setmetatable({script=script,printerr=error},{__index=_G})
 assert(load(${JSON.stringify(result.files.get('main.lua'))},'main.lua','t',env))();return env
end
local a,b=mount(),mount();a.OnEnable();b.OnEnable()
a.OnUpdate(0.11);assert(a.values()[1]==1 and a.values()[2]==0 and a.values()[3]==0)
a.OnLevelUpdate(0.04);a.OnDisable();a.inactive()
a.OnUpdate(10);a.OnLevelUpdate(10);assert(a.values()[1]==1)
a.OnEnable();a.OnUpdate(0.051);assert(a.values()[1]==101)
a.OnLevelUpdate(0.061);assert(a.values()[2]==1 and a.values()[3]==1)
a.OnUpdate(0.04);assert(a.values()[1]==111)
a.stop();a.OnLevelUpdate(0.2);assert(a.values()[3]==11 and not a.script.enabled)
assert(b.values()[1]==0 and b.values()[2]==0)
a.OnDestroy();assert(not pcall(a.inactive));b.OnDestroy()
`
)
for (const clock of ['level', 'real']) {
  const single = successful(
    buildFixture({
      'main.ts': `import{g}from'genshin-ts/runtime/core';g.clientControlScript(lua=>{lua.helper.setTimeout(()=>{},100,'${clock}');return{}})`
    })
  )
  const text = single.files.get('main.lua')
  assert(text.includes(clock === 'real' ? 'OnUpdate' : 'OnLevelUpdate'))
  assert(!text.includes(clock === 'real' ? 'OnLevelUpdate' : 'OnUpdate'))
}
const top = buildFixture(
  {
    'main.ts': `import{g}from'genshin-ts/runtime/core';import{setTimeout as later}from'genshin-ts/runtime/lua';later(()=>{},1,'real');g.clientControlScript(lua=>{return{}})`
  },
  false
)
assert(top.diagnostics.some((d) => d.source === 'lua-instance-scope'))
const invalid = buildFixture({
  'main.ts': `import{g}from'genshin-ts/runtime/core';g.clientControlScript(lua=>{lua.helper.setTimeout(()=>{},1,'other');return{}})`
})
assert(invalid.diagnostics.some((d) => d.category === 1))
console.log(
  'Helper timers: independent clocks, level pause, inactive scheduling, resume, global cancellation, imports/destructuring and hook selection: PASS'
)
