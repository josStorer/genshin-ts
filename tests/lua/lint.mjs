import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import tseslint from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'
import { ESLint } from 'eslint'

import gsts from '../../src/eslint/index.ts'

const root = path.resolve('.tmp/lua-lint')
fs.mkdirSync(root, { recursive: true })
const file = path.join(root, 'main.ts'),
  config = path.join(root, 'tsconfig.json')
fs.writeFileSync(
  config,
  JSON.stringify({ extends: path.resolve('configs/tsconfig/lua.json'), include: ['*.ts'] })
)
function lint(code, rules = {}) {
  fs.writeFileSync(file, code)
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ['**/*.ts'],
        languageOptions: { parser, parserOptions: { project: config } },
        plugins: { gsts, '@typescript-eslint': tseslint },
        rules: { ...gsts.configs.lua.rules, ...rules }
      }
    ]
  }).lintText(code, { filePath: file })
}
const entry = (body) =>
  `import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{${body};return{onStart(){lua.print('test')}}})`
const bad = entry(
  `const missing=undefined;const obj={missing};const arr=[1,undefined,,2];delete arr[0];const n=1n;const b=BigInt(1);if(0){};if(''){};const nil=null;if(1==1){};queueMicrotask(()=>{});Math.cosh(1)`
)
const [result] = await lint(bad)
for (const name of [
  'gsts/lua-no-undefined-field',
  'gsts/lua-no-array-hole',
  'gsts/lua-no-array-delete',
  'gsts/lua-no-bigint',
  'gsts/lua-unavailable-global',
  'gsts/lua-standard-library',
  'eqeqeq',
  '@typescript-eslint/strict-boolean-expressions',
  'no-restricted-syntax'
])
  assert(
    result.messages.some((m) => m.ruleId === name),
    name + ' ' + JSON.stringify(result.messages)
  )
const [disabled] = await lint(bad, { 'gsts/lua-no-array-hole': 'off' })
assert(!disabled.messages.some((m) => m.ruleId === 'gsts/lua-no-array-hole'))
assert(disabled.messages.some((m) => m.ruleId === 'gsts/lua-no-array-delete'))
const [good] = await lint(
  entry(
    `function BigInt(n:number){return n}function setTimeout(n:number){return n}const a=[1,2];a.splice(0,1);const o={value:BigInt(setTimeout(2))};if(o.value>0)lua.print(o.value);const ok=Boolean(0)`
  )
)
assert.deepEqual(good.messages, [])
assert(!('lua-syntax' in gsts.rules) && !('lua-semantics' in gsts.rules))
console.log(
  'Lua ESLint: independent rules, standard semantic rules, disabling one rule and local shadows: PASS'
)
