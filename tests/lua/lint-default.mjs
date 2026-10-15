import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { ESLint } from 'eslint'

const root = fs.mkdtempSync(path.resolve('.tmp/lua-lint/default-'))
fs.mkdirSync(path.join(root, 'ordinary-name'))
fs.writeFileSync(
  path.join(root, 'tsconfig.json'),
  JSON.stringify({ extends: path.resolve('configs/tsconfig/base.json'), include: ['*.ts'] })
)
fs.writeFileSync(
  path.join(root, 'ordinary-name/tsconfig.json'),
  JSON.stringify({ extends: path.resolve('configs/tsconfig/lua.json'), include: ['*.ts'] })
)
const code = `import {g} from 'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{let count=0; if(count)lua.print(count); const huge=1n;return{onStart(){lua.print(huge)}}})`
const filename = path.join(root, 'ordinary-name/main.ts')
fs.writeFileSync(filename, code)
fs.writeFileSync(path.join(root, 'graph.ts'), "import {g} from 'genshin-ts/runtime/core'\n")
const lint = new ESLint({ cwd: root, overrideConfigFile: path.resolve('configs/eslint/full.mjs') })
const [result] = await lint.lintFiles([filename])
assert(
  result.messages.some((m) => m.ruleId === 'gsts/lua-no-bigint'),
  JSON.stringify(result.messages)
)
assert(
  result.messages.some((m) => m.ruleId === '@typescript-eslint/strict-boolean-expressions'),
  JSON.stringify(result.messages)
)
const graph = await lint.calculateConfigForFile(path.join(root, 'graph.ts'))
const lua = await lint.calculateConfigForFile(filename)
assert.equal(lua.rules['gsts/lua-no-bigint'][0], 2)
assert.equal(graph.rules['gsts/lua-no-bigint']?.[0] ?? 0, 0)
for (const [name, rule] of Object.entries(graph.rules))
  if (name.startsWith('gsts/') && !name.startsWith('gsts/lua-') && rule[0] > 0)
    assert.equal(lua.rules[name][0], 0, name)
console.log(
  'Default full.mjs discovers Lua by tsconfig, rejects numeric conditions and bigint, and preserves nodegraph rules: PASS'
)
