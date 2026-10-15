import assert from 'node:assert/strict'

import { buildFixture, execute, successful } from './support.mjs'

for (const name of ['lua', 'lua_core', 'lua_entry']) {
  const result = successful(
    buildFixture({
      [`${name}.d.ts`]: 'export function value(this:void):number',
      [`${name}.lua`]: 'return { value = function() return 37 end }',
      'main.ts': `import{g}from'genshin-ts/runtime/core';import{value}from'./${name}';export default g.clientControlScript(lua=>{return{onStart(){lua.assert(value()===37)}}})`
    })
  )
  assert(result.files.has(`${name}.lua`))
  execute(result.files, "require('main');OnStart()")
}
console.log('Native declarations named lua, lua_core and lua_entry remain user modules: PASS')
