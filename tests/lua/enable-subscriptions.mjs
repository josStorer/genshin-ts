import assert from 'node:assert/strict'

import { buildFixture, successful } from './support.mjs'

const fixture = `import{g,defineSignal}from'genshin-ts/runtime/core';g.clientControlScript(lua=>{
 const signal=defineSignal('X',[] as const);
 const subscribe=lua.onSignal;
 const rootOff=lua.onSignal(signal,()=>{});
 let off:(()=>void)|undefined;
 return{
  onStart(){lua.onSignal(signal,()=>{})},
  onEnable(){
   lua.onSignal(signal,()=>{});
   lua.helper.listenKey(self,lua.Enum.KeyEventType.KeyboardJumpKeyDown,()=>false);
   subscribe(signal,()=>{});
   off=lua.onSignal(signal,()=>{});
   const saved=lua.helper.listenKey(self,lua.Enum.KeyEventType.KeyboardJumpKeyDown,()=>false); saved();
  },
  onDisable(){off?.();rootOff()}
 }
})`
const result = successful(buildFixture({ 'main.ts': fixture }))
const warnings = result.diagnostics.filter((d) => d.source === 'lua-on-enable-subscription')
assert.equal(warnings.length, 3)
assert(warnings.every((d) => d.category === 0))
const lines = warnings.map((d) => d.file.getLineAndCharacterOfPosition(d.start).line + 1)
assert.deepEqual(lines, [9, 10, 11])
console.log(
  'Enable subscriptions: three discarded results warned; saved callbacks, setup and start remain clean: PASS'
)
