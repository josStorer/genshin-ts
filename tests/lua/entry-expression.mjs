import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { buildFixture, execute, successful } from './support.mjs'

const object = `{
 onStart() { lua.print('Ready') },
 onUpdate: (dt: number) => { lua.print(dt) },
 methods: { summary() { return 'summary' }, add: (value: number) => value + 1 }
}`
const imports = `import {g} from 'genshin-ts/runtime/core'; import type {ClientScriptHooks} from 'genshin-ts/runtime/lua';`
const luaFiles = (result) => [...result.files].filter(([name]) => name.endsWith('.lua')).sort()
const saved = path.resolve('.tmp/lua-refinement/expression')
fs.mkdirSync(saved, { recursive: true })
for (const exported of ['', 'export default ']) {
  const block = successful(
    buildFixture({
      'main.ts': `${imports}${exported}g.clientControlScript(lua => {return ${object}})`
    })
  )
  for (const expression of [
    `(${object})`,
    `((${object}))`,
    `(${object} as ClientScriptHooks & {methods: {summary():string;add:(value:number)=>number}})`,
    `(${object} satisfies ClientScriptHooks & {methods: {summary():string;add:(value:number)=>number}})`
  ]) {
    const concise = successful(
      buildFixture({
        'main.ts': `${imports}${exported}g.clientControlScript(lua => ${expression})`
      })
    )
    assert.deepEqual(luaFiles(concise), luaFiles(block), expression)
    execute(
      concise.files,
      `local output={};print=function(value)output[#output+1]=value end;require('main');OnStart();OnUpdate(0.5);assert(output[1]=='Ready' and output[2]==0.5);assert(summary()=='summary' and add(4)==5)`
    )
    if (!exported && expression === `(${object})`)
      fs.writeFileSync(path.join(saved, 'expression.lua'), concise.files.get('main.lua'))
  }
  if (!exported) fs.writeFileSync(path.join(saved, 'block.lua'), block.files.get('main.lua'))
}
for (const [body, rule] of [
  ['makeHooks()', 'lua-entry-callback'],
  ['({onStart:123})', 'lua-hook-function'],
  ['({methods:{value:123}})', 'lua-public-methods'],
  ['({methods:{summary}})', 'lua-public-methods'],
  ['({...makeHooks()})', 'lua-entry-return']
]) {
  const bad = buildFixture(
    {
      'main.ts': `${imports}function makeHooks(){return {}};function summary(){return 'x'};g.clientControlScript(lua => ${body})`
    },
    false
  )
  assert(
    bad.diagnostics.some((d) => d.source === rule),
    body
  )
  assert.equal(bad.files.size, 0)
}
console.log(
  'Expression entry: exported/bare, parentheses/as/satisfies, methods and arrow hooks execute; block/expression Lua bytes match; invalid forms rejected: PASS'
)
