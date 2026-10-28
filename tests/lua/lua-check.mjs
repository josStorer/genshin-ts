import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

// gsts lua check：完整类型检查加全部 Lua 规则（含原生 .d.ts），不写文件；有错误时退出码为 1
const repo = path.resolve('.')
const project = fs.mkdtempSync(path.resolve('.tmp/lua-tests/check-'))
fs.mkdirSync(path.join(project, 'src/lua'), { recursive: true })
fs.mkdirSync(path.join(project, 'node_modules'))
fs.symlinkSync(repo, path.join(project, 'node_modules/genshin-ts'), 'junction')
const write = (name, text) => fs.writeFileSync(path.join(project, name), text)
write(
  'gsts.config.mjs',
  "export default { compileRoot: 'src', entries: ['lua/main.ts'], outDir: 'dist' }"
)
// 自定义基础配置再继承 Lua 配置，也要认出是 Lua 子项目
write('src/lua/base.json', JSON.stringify({ extends: 'genshin-ts/tsconfig/lua.json' }))
write('src/lua/tsconfig.json', JSON.stringify({ extends: './base.json', include: ['.'] }))
write('src/lua/native.lua', 'return { divmod = function(a, b) return a // b, a % b end }')
const check = () =>
  spawnSync(
    process.execPath,
    [path.join(repo, 'bin/gsts.mjs'), 'lua', 'check', '-c', 'gsts.config.mjs', '--lang', 'en'],
    {
      cwd: project,
      env: { ...process.env, NO_COLOR: '1' },
      encoding: 'utf8',
      timeout: 120000
    }
  )
const entry = (body) =>
  `import { g } from 'genshin-ts/runtime/core'\nimport { divmod } from './native'\nexport default g.clientControlScript((lua) => {\n${body}\n  return {}\n})\n`

write(
  'src/lua/native.d.ts',
  'export function divmod(this: void, a: number, b: number): [number, number]\n'
)
write(
  'src/lua/main.ts',
  entry("  const [q] = divmod(7, 2)\n  const n: number = 'text'\n  lua.print(q, n)")
)
const failed = check()
assert.equal(failed.status, 1, failed.stdout + failed.stderr)
assert.match(failed.stdout, /TS2322/)
assert.match(failed.stdout, /native\.d\.ts.*TS97001/s)
assert(!fs.existsSync(path.join(project, 'dist')), 'check must not write output')

write(
  'src/lua/native.d.ts',
  'export function divmod(this: void, a: number, b: number): LuaMultiReturn<[number, number]>\n'
)
write('src/lua/main.ts', entry('  const [q, r] = divmod(7, 2)\n  lua.print(q, r)'))
const passed = check()
assert.equal(passed.status, 0, passed.stdout + passed.stderr)
assert.match(passed.stdout, /\[ok\] Lua check passed: 1 entries/)
fs.rmSync(path.join(project, 'node_modules/genshin-ts'))
console.log(
  'Lua check: type errors and native .d.ts rules fail with exit code 1, nothing is written, a tsconfig extending a custom Lua base is found, clean projects pass: PASS'
)
