import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  compileLua,
  createLuaCompileCache,
  formatLuaDiagnostics
} from '../../src/compiler/lua/ts_to_lua_pipeline.ts'
import { buildFixture, successful } from './support.mjs'

const entry = (body) =>
  `import {g} from 'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return{onStart(){${body}}}})`
for (const body of [
  'lua.onSignl()',
  'missingName()',
  'lua.game.GetUICanvasSiz()',
  'const { missing } = lua.game'
]) {
  const result = buildFixture({ 'main.ts': entry(body) }, false)
  const diagnostic = result.diagnostics.find((d) => [2304, 2339, 2551, 2552].includes(d.code))
  assert(diagnostic, formatLuaDiagnostics(result.diagnostics))
  assert(diagnostic.file && diagnostic.start !== undefined)
  assert.equal(result.files.size, 0)
}
successful(
  buildFixture({ 'main.ts': entry('const value:number="not a number";lua.print(value)') }, false)
)

fs.mkdirSync(path.resolve('.tmp/lua-tests'), { recursive: true })
const root = fs.mkdtempSync(path.resolve('.tmp/lua-tests/names-'))
const main = path.join(root, 'main.ts'),
  helper = path.join(root, 'helper.ts'),
  other = path.join(root, 'other.ts')
fs.writeFileSync(main, `import {value} from './helper';${entry('lua.print(value)')}`)
fs.writeFileSync(helper, 'export const value=1')
fs.writeFileSync(other, entry('lua.print(2)'))
const input = {
  entries: [main, other],
  rootDir: root,
  outDir: path.join(root, 'out'),
  profile: true
}
const cache = createLuaCompileCache()
assert.equal(successful(compileLua(input, cache)).profile.stats.nameCheckedFiles, 3)
assert.equal(
  successful(compileLua({ ...input, changedFiles: [] }, cache)).profile.stats.nameCheckedFiles,
  0
)
fs.writeFileSync(helper, 'export const renamed=1')
const broken = compileLua({ ...input, changedFiles: [helper] }, cache)
assert.equal(broken.profile.stats.nameCheckedFiles, 2)
assert(broken.diagnostics.some((d) => d.code === 2305))
fs.writeFileSync(helper, 'export const value=2')
assert.equal(
  successful(compileLua({ ...input, changedFiles: [helper] }, cache)).profile.stats
    .nameCheckedFiles,
  2
)
console.log(
  'Default builds reject unresolved names/members with locations; only affected files are checked, ordinary type mismatches remain editor checks: PASS'
)
