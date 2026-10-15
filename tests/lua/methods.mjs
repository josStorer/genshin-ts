import assert from 'node:assert/strict'

import { buildFixture, execute, successful } from './support.mjs'

const prefix =
  "import {g} from 'genshin-ts/runtime/core'; import {multi} from 'genshin-ts/runtime/lua'; export default g.clientControlScript(lua=>{"
const built = successful(
  buildFixture({
    'main.ts':
      prefix +
      `let count=0;
function summary(prefix:string){return prefix + count}
const increment=(amount:number)=>{count+=amount;return count};
function snapshot(){return multi(count, 'ready')}
return{methods:{summary, alias:summary, increment, snapshot, inline(){return count}}}})`
  })
)
execute(
  built.files,
  `require('main'); assert(increment(3)==3); assert(summary('n=')=='n=3'); assert(alias('x')=='x3'); assert(inline()==3);local n,s=snapshot();assert(n==3 and s=='ready')`
)
for (const value of ['42', 'counter.summary', 'Counter.summary']) {
  const result = buildFixture(
    {
      'main.ts':
        prefix +
        `class Counter{static summary(){return 1}};const counter={summary(){return 2}};return{methods:{summary:${value}}}})`
    },
    false
  )
  assert(
    result.diagnostics.some(
      (d) => d.source === 'lua-public-methods' && d.file && d.start !== undefined
    )
  )
  assert.equal(result.files.size, 0)
}
console.log(
  'Public methods: shorthand, function references, arrows and multiple returns execute; class/object methods and non-functions rejected: PASS'
)
