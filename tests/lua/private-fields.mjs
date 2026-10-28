import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import * as tstl from 'typescript-to-lua'

import { formatLuaDiagnostics } from '../../src/compiler/lua/ts_to_lua_pipeline.ts'
import { LocatedLuaError, withLuaErrorLocations } from '../../src/compiler/lua/ts_to_lua_transform/tstl_compat.ts'
import { buildFixture, execute, successful } from './support.mjs'

const result = successful(
  buildFixture({
    'base.ts': `export class Base { #value=2; get base(){return this.#value} bump(){this.#value++} }`,
    'main.ts': `import {g} from 'genshin-ts/runtime/core';import {Base} from './base';
export default g.clientControlScript(lua=>{
 class Counter extends Base {#value=0;value=50;static #total=0; constructor(readonly step:number){super()} get count(){return this.#value} next(){this.#value+=this.step;Counter.#total++;return this} static total(){return Counter.#total}}
 const a=new Counter(3), b=new Counter(1);
 return{onStart(){a.next().next();b.next();a.bump();lua.assert(a.count===6&&b.count===1&&a.base===3&&b.base===2&&a.value===50&&Counter.total()===3)}}
})`
  })
)
execute(result.files, "require('main');OnStart()")
assert(!result.files.get('main.lua').includes('["#value"]'))
// Names are readable and independent of where the class sits in the file.
assert(result.files.get('main.lua').includes('__private_Counter_value'))
assert(result.files.get('main.lua').includes('__private_Counter_total'))
assert(result.files.get('base.lua').includes('__private_Base_value'))

// Same-named classes on one prototype chain must not share a private field.
const chain = successful(
  buildFixture({
    'counter.ts': `export class Counter { #value=1; get inner(){return this.#value} }`,
    'main.ts': `import {g} from 'genshin-ts/runtime/core';import * as base from './counter';
export default g.clientControlScript(lua=>{
 class Counter extends base.Counter {#value=2; get outer(){return this.#value}}
 const c=new Counter()
 return{onStart(){lua.assert(c.inner===1&&c.outer===2)}}
})`
  })
)
execute(chain.files, "require('main');OnStart()")
assert(chain.files.get('counter.lua').includes('__private_Counter_value'))
assert(chain.files.get('main.lua').includes('__private_Counter_value_1'))

const unsupported = buildFixture(
  {
    'main.ts': `import {g} from 'genshin-ts/runtime/core';
export default g.clientControlScript(lua=>{
  return {onStart(){const value = /unsupported/;lua.print(value)}}
})`
  },
  false
)
assert(
  unsupported.diagnostics.some((d) => d.category === 1 && d.file && d.start !== undefined),
  formatLuaDiagnostics(unsupported.diagnostics)
)
assert.equal(unsupported.files.size, 0)
// An actual thrown visitor error must retain its innermost source location as it unwinds.
fs.mkdirSync(path.resolve('.tmp/lua-tests'), { recursive: true })
const root = fs.mkdtempSync(path.resolve('.tmp/lua-tests/visitor-error-'))
const file = path.join(root, 'fail.ts')
fs.writeFileSync(file, 'function boom() { return 1 }\n\nboom()\n')
const program = ts.createProgram([file], { target: ts.ScriptTarget.ES2022, types: [] })
const throwing = {
  visitors: {
    [ts.SyntaxKind.CallExpression]: () => {
      throw new Error('unsupported test operation')
    }
  }
}
assert.throws(
  () =>
    new tstl.Transpiler().emit({
      program,
      sourceFiles: [program.getSourceFile(file)],
      plugins: [throwing, withLuaErrorLocations(throwing)],
      writeFile: () => {}
    }),
  (error) => {
    assert(error instanceof LocatedLuaError)
    assert.equal(path.resolve(error.node.getSourceFile().fileName), file)
    assert.equal(
      error.node.getSourceFile().getLineAndCharacterOfPosition(error.node.getStart()).line,
      2
    )
    return true
  }
)
console.log(
  'Private fields, inheritance, same-named class chains, static fields and accessors execute with readable names; unsupported syntax has source locations: PASS'
)
