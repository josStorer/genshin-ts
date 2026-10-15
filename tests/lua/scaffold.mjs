import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const repo = path.resolve('.'),
  root = fs.mkdtempSync(path.resolve('.tmp/lua-tests/scaffold-'))
function create(name, ...args) {
  return spawnSync(
    process.execPath,
    [path.join(repo, 'create-genshin-ts/bin/create-genshin-ts.mjs'), name, ...args],
    { cwd: root, encoding: 'utf8', timeout: 30000 }
  )
}
assert.equal(create('plain').status, 0)
const template = path.join(repo, 'create-genshin-ts/templates/start')
for (const file of fs.readdirSync(template, { recursive: true })) {
  if (!fs.statSync(path.join(template, file)).isFile()) continue
  const expected = fs
    .readFileSync(path.join(template, file), 'utf8')
    .replaceAll('__PROJECT_NAME__', 'plain')
    .replaceAll('__PACKAGE_NAME__', 'plain')
  assert.equal(
    fs.readFileSync(path.join(root, 'plain', file === '_gitignore' ? '.gitignore' : file), 'utf8'),
    expected,
    file
  )
}
assert(!fs.existsSync(path.join(root, 'plain/src/lua')))
assert.equal(create('mixed', '--with-lua').status, 0)
assert.equal(create('mixed', '--with-lua').status, 1)
assert.equal(create('mixed', '--with-lua', '--force').status, 0)
const project = path.join(root, 'mixed')
fs.mkdirSync(path.join(project, 'node_modules'))
fs.symlinkSync(repo, path.join(project, 'node_modules/genshin-ts'), 'junction')
fs.symlinkSync(
  path.join(repo, 'node_modules/@types'),
  path.join(project, 'node_modules/@types'),
  'junction'
)
for (const name of ['AGENTS.md', 'CLAUDE.md'])
  assert(fs.readFileSync(path.join(project, name), 'utf8').includes('lua.onSignal'))
for (const [command, args] of [
  ['node_modules/typescript/bin/tsc', ['-p', 'tsconfig.json', '--noEmit']],
  ['node_modules/typescript/bin/tsc', ['-p', 'src/lua/tsconfig.json', '--noEmit']],
  ['bin/gsts.mjs', ['--noinject', '--lang', 'zh']],
  ['node_modules/eslint/bin/eslint.js', ['src']]
]) {
  const result = spawnSync(process.execPath, [path.join(repo, command), ...args], {
    cwd: project,
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 8 * 1024 * 1024
  })
  assert.equal(result.status, 0, result.stdout + result.stderr)
}
assert(fs.existsSync(path.join(project, 'dist/lua/src/lua/hud.lua')))
console.log(
  'Scaffold: default template bytes unchanged; optional Lua template passes both typechecks, build, lint and force checks: PASS'
)
