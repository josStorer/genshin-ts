import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('.tmp/lua-cli')
fs.mkdirSync(root, { recursive: true })
fs.writeFileSync(
  path.join(root, 'gsts.config.ts'),
  `export default {compileRoot:'.',entries:['main.ts'],outDir:'out'}`
)
fs.writeFileSync(
  path.join(root, 'main.ts'),
  `import {g} from 'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{let t=0;return {onStart(){lua.script.EnableUpdate(true)},onUpdate(dt){t+=dt;lua.print(t)}}})`
)
const cli = path.resolve('bin/gsts.mjs')
function run(args) {
  const res = spawnSync(process.execPath, [cli, ...args, '--lang', 'zh'], {
    cwd: path.resolve('.'),
    encoding: 'utf8',
    timeout: 120000
  })
  assert.equal(res.status, 0, res.stdout + '\n' + res.stderr)
  return res.stdout
}
const out = run(['-c', path.join(root, 'gsts.config.ts'), '--noinject'])
assert.match(out, /本地产物/)
assert.match(fs.readFileSync(path.join(root, 'out/lua/main.lua'), 'utf8'), /^-- @gsts:lua/)
assert.equal(fs.existsSync(path.join(root, 'out/main.gs.ts')), false)
run([path.join(root, 'main.ts'), '-c', path.join(root, 'gsts.config.ts'), '--noinject'])
const profiled = run(['-c', path.join(root, 'gsts.config.ts'), '--noinject', '--inject-profile'])
const profileLines = profiled.split(/\r?\n/)
const profiles = profileLines
  .filter((line) => line.startsWith('[pipeline-profile] '))
  .map((line) => JSON.parse(line.slice('[pipeline-profile] '.length)))
const luaProfile = profiles.find((p) => p.lua?.phase === 'build').lua
assert.equal(luaProfile.compiler.stats.sourceFiles, 1)
assert.ok(luaProfile.compiler.timingsMs.transpile >= 0)
const pipelineProfile = profiles.find((p) => p.batch)
assert.doesNotMatch(profiled, /\[lua-(?:profile|prepared|watch-profile)\]/)
assert.ok(pipelineProfile.batch.timingsMs.lua >= luaProfile.timingsMs.total)

const conflict = path.join(root, 'out/lua/main.lua')
fs.writeFileSync(conflict, '-- mine\nreturn 1')
const bad = spawnSync(
  process.execPath,
  [cli, '-c', path.join(root, 'gsts.config.ts'), '--noinject', '--lang', 'zh'],
  { encoding: 'utf8', timeout: 120000 }
)
assert.notEqual(bad.status, 0)
assert.match(bad.stdout + bad.stderr, /-- @gsts:lua/)
assert.equal(fs.readFileSync(conflict, 'utf8'), '-- mine\nreturn 1')
// Restore only this fixture's file so the test can be repeated.
fs.writeFileSync(conflict, '-- @gsts:lua\nreturn 1')
console.log('Existing CLI batch, single-file and conflict reporting: PASS')
