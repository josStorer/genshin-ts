import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const base = path.resolve('.tmp/lua-cli-language')
fs.mkdirSync(base, { recursive: true })
const root = fs.mkdtempSync(path.join(base, 'run-'))
const app = path.join(root, 'app/genshin-ts')
fs.mkdirSync(app, { recursive: true })
fs.writeFileSync(
  path.join(app, 'state.json'),
  JSON.stringify({
    updateCheck: { lastAt: Date.now() },
    noticeCheck: { lastAt: Date.now() }
  })
)
fs.mkdirSync(path.join(root, 'src'))
fs.writeFileSync(
  path.join(root, 'gsts.config.mjs'),
  "export default {compileRoot:'src',entries:['*.ts'],outDir:'out'}"
)
fs.writeFileSync(
  path.join(root, 'src/graph.ts'),
  "import {g} from 'genshin-ts/runtime/core';export const GREETING='hi';g.server({id:1073742901,name:'Mixed'}).on('whenEntityIsCreated',(_evt,f)=>{f.printString(GREETING)})"
)
const good =
  "import {g} from 'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return{onStart(){lua.print('hello')}}})"
const cli = path.resolve('dist/src/cli/gsts.js')
function run(name, code) {
  const result = spawnSync(
    process.execPath,
    [cli, '-c', 'gsts.config.mjs', '--noinject', '--lang', 'en'],
    {
      cwd: root,
      env: { ...process.env, APPDATA: path.dirname(app) },
      encoding: 'utf8',
      timeout: 90000
    }
  )
  const log = result.stdout + result.stderr
  fs.writeFileSync(path.join(root, name + '.log'), log)
  assert.equal(result.status, code, log)
  assert.doesNotMatch(log, /\p{Script=Han}/u, log)
  assert.match(log, /\[TS→NodeGraph\] Compilation:/)
  return log
}
assert.doesNotMatch(run('pure', 0), /\[TS→Lua\]/)
fs.writeFileSync(path.join(root, 'src/hud.ts'), good)
assert.match(run('mixed', 0), /\[TS→Lua\] Compilation: Succeeded/)
fs.writeFileSync(
  path.join(root, 'src/hud.ts'),
  "import {GREETING} from './graph';" + good.replace("'hello'", 'GREETING')
)
assert.match(run('failed', 1), /Node graph entries cannot be imported as Lua modules/)
fs.writeFileSync(path.join(root, 'src/hud.ts'), good.replace('hello', 'changed'))
fs.writeFileSync(path.join(root, 'out/lua/hud.lua'), '-- user owned file\n')
assert.match(run('conflict', 1), /add -- @gsts:lua/)
console.log('PASS: --lang en has no Chinese in pure TS, mixed, Lua errors or output conflicts')
