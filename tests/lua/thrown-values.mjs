import assert from 'node:assert/strict'

import { buildFixture, successful } from './support.mjs'

// 2026-10-24 实机：宿主把抛出的任何值都转成文字，catch 拿到的总是字符串。
const fixture = `import{g}from'genshin-ts/runtime/core'
class GameError extends Error{}
export default g.clientControlScript(lua=>{return{onStart(){
 try{lua.print(1)}catch(e){if(e instanceof Error)lua.print(1)}
 try{lua.print(1)}catch(e){lua.print((e as Error).message)}
 try{lua.print(1)}catch({message}:any){lua.print(message)}
 try{lua.print(1)}catch(e:any){lua.print(e.message)}
 if(lua.math.random()>2)throw {code:7}
 if(lua.math.random()>2)throw 42
 try{lua.print(1)}catch(e){lua.print(String(e))}
 try{lua.print(1)}catch(e){if(typeof e==='string')lua.print(e.length,e.toUpperCase())}
 try{lua.print(1)}catch(e:any){lua.print(e.length)}
 try{lua.print(1)}catch(e){const text=e as string;lua.print(text)}
 try{lua.print(1)}catch(e){throw e}
 try{lua.print(1)}catch{lua.print(2)}
 if(lua.math.random()>2)throw new Error('x')
 if(lua.math.random()>2)throw new GameError('x')
 if(lua.math.random()>2)throw 'text'
}}})`
const result = successful(buildFixture({ 'main.ts': fixture }))
const warnings = result.diagnostics.filter((d) => d.source === 'lua-thrown-value')
assert(warnings.every((d) => d.category === 0))
const lines = warnings.map((d) => d.file.getLineAndCharacterOfPosition(d.start).line + 1)
assert.deepEqual(lines, [4, 5, 6, 7, 8, 9], JSON.stringify(warnings.map((d) => d.messageText)))
console.log(
  'Thrown values: instanceof, casts, destructuring, object fields and non-Error throws warn; String(e), narrowed strings, rethrow and Error throws stay clean: PASS'
)
