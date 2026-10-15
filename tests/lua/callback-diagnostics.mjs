import assert from 'node:assert/strict'

import { buildFixture } from './support.mjs'

const result = buildFixture(
  {
    'main.ts': `
declare function read(this:void,value:number):number;
declare function consume(callback:(this:{value:number},value:number)=>number):void;
const adapted=[1,2].map(read);
consume(read);
export {adapted}
`
  },
  false
)
const errors = result.diagnostics.filter((d) => d.code === 100016)
assert.equal(errors.length, 1, JSON.stringify(result.diagnostics.map((d) => d.messageText)))
const source = errors[0].file
assert.equal(source.text.slice(errors[0].start, errors[0].start + errors[0].length), 'read')
assert.equal(source.getLineAndCharacterOfPosition(errors[0].start).line, 4)
console.log(
  'Callback adaptation: standard-library callback diagnostic removed; unrelated same-symbol conversion error retained: PASS'
)
