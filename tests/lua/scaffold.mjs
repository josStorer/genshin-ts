import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

// 用打包后的 bin（npm run build 生成）以非交互方式创建两个模板，再分别做类型检查、Lua 检查、构建和 lint。
fs.mkdirSync(path.resolve('.tmp/lua-tests'), { recursive: true })
const repo = path.resolve('.'),
  root = fs.mkdtempSync(path.resolve('.tmp/lua-tests/scaffold-'))
const bin = path.join(repo, 'create-genshin-ts/bin/create-genshin-ts.mjs')
assert(fs.existsSync(bin), 'run npm run build first: it bundles create-genshin-ts')

// 本机存档用临时目录模拟：LocalLow 是 LOCALAPPDATA 的同级目录
const appData = path.join(root, 'AppData')
const saveDir = (region, player) =>
  path.join(
    appData,
    'LocalLow/miHoYo',
    region,
    'BeyondLocal',
    String(player),
    'Beyond_Local_Save_Level'
  )
const addMap = (region, player, map) => {
  fs.mkdirSync(path.join(saveDir(region, player), String(map)), { recursive: true })
  fs.writeFileSync(path.join(saveDir(region, player), String(map), `${map}.gil`), 'gil')
}
addMap('原神', 100000001, 1073741849)
const env = { ...process.env, LOCALAPPDATA: path.join(appData, 'Local'), npm_config_user_agent: '' }

function create(...args) {
  return spawnSync(process.execPath, [bin, ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout: 30000,
    env
  })
}
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8')

// 帮助与语言
assert.match(create('--help', '--lang', 'zh').stdout, /用法：npm create genshin-ts@latest/)
assert.match(create('--help', '--lang', 'en').stdout, /Usage: npm create genshin-ts@latest/)
assert.equal(create('--template', 'nope', 'x').status, 1)
assert.equal(create('--yes', '--lang', 'en').status, 1, 'non-interactive runs need a project name')

// 默认模板：节点图 + Lua
let result = create('lua-demo', '--yes', '--lang', 'zh')
assert.equal(result.status, 0, result.stderr)
assert.match(result.stdout, /已创建 lua-demo/)
assert.match(result.stdout, /"首次运行前"/, 'the Lua template reminds the editor setup')
for (const file of [
  'src/graphs/main.ts',
  'src/lua/hud.ts',
  'src/lua/lib/format.ts',
  'src/lua/tsconfig.json',
  '.gitignore'
])
  assert(fs.existsSync(path.join(root, 'lua-demo', file)), file)
for (const dir of ['src/main.ts', 'src/shared', 'src/lua/native', 'src/lua/counter.ts'])
  assert(!fs.existsSync(path.join(root, 'lua-demo', dir)), dir)
assert(read('lua-demo/src/resources/signals.ts').startsWith('// @gsts:signals'))
assert.match(read('lua-demo/src/resources/signals.ts'), /JumpPressed/)
assert.deepEqual(JSON.parse(read('lua-demo/tsconfig.json')).exclude, ['src/lua'])
assert.equal(JSON.parse(read('lua-demo/package.json')).name, 'lua-demo')
assert.doesNotMatch(
  read('lua-demo/gsts.config.ts'),
  /inject/,
  '--yes without --map leaves inject out'
)
for (const file of ['README.md', 'README_ZH.md', 'AGENTS.md', 'CLAUDE.md']) {
  const text = read('lua-demo', file)
  assert.doesNotMatch(text, /snippet|__[A-Z_]+__|\r\n/, file)
}
assert.match(read('lua-demo/README_ZH.md'), /### 首次运行前/)
assert.match(read('lua-demo/AGENTS.md'), /src\/lua\/hud\.ts/)

// 仅节点图：保持 v0.2.3 的 src/main.ts，Lua 指引只指向迁移说明
result = create('graph-demo', '--template', 'graph', '--yes', '--lang', 'en')
assert.equal(result.status, 0, result.stderr)
assert.doesNotMatch(result.stdout, /Before the first run/)
assert(fs.existsSync(path.join(root, 'graph-demo/src/main.ts')))
for (const dir of ['src/graphs', 'src/shared', 'src/lua', 'src/resources'])
  assert(!fs.existsSync(path.join(root, 'graph-demo', dir)), dir)
assert.equal(JSON.parse(read('graph-demo/tsconfig.json')).exclude, undefined)
assert.match(read('graph-demo/README_ZH.md'), /- `src\/main\.ts`：入口示例/)
assert.match(read('graph-demo/AGENTS.md'), /- `src\/main\.ts`: default entry example/)
assert.match(read('graph-demo/AGENTS.md'), /Update the NodeGraph ID in `src\/main\.ts`/)
for (const file of ['README.md', 'README_ZH.md', 'AGENTS.md', 'CLAUDE.md'])
  assert.doesNotMatch(read('graph-demo', file), /src\/graphs|src\/shared|snippet/, file)
assert.match(read('graph-demo/README.md'), /gsts\.moe\/doc\/lua#add-lua/)
assert.match(read('graph-demo/README_ZH.md'), /gsts\.moe\/zh\/doc\/lua#add-lua/)
assert.doesNotMatch(read('graph-demo/AGENTS.md'), /src\/lua\/hud\.ts/)
assert.match(read('graph-demo/AGENTS.md'), /#add-lua/)

// 目标目录不为空
assert.equal(create('graph-demo', '--template', 'graph', '--yes').status, 1)
assert.equal(create('graph-demo', '--template', 'graph', '--yes', '--force').status, 0)

// 注入参数：只有一个区服和账号时自动补全，多个账号时要求写明
result = create('inject-demo', '--yes', '--map', '1073741849')
assert.equal(result.status, 0, result.stderr)
assert.match(
  read('inject-demo/gsts.config.ts'),
  /inject: \{\n {4}gameRegion: 'China',\n {4}playerId: 100000001,\n {4}mapId: 1073741849\n {2}\}/
)
addMap('原神', 100000002, 1073741850)
assert.equal(create('inject-two', '--yes', '--map', '1073741850').status, 1)
result = create('inject-two', '--yes', '--map', '1073741850', '--player', '100000002')
assert.equal(result.status, 0, result.stderr)
assert.match(read('inject-two/gsts.config.ts'), /playerId: 100000002/)
assert.equal(create('inject-bad', '--yes', '--map', 'abc').status, 1)

// 两个模板都能通过类型检查、Lua 检查、构建和 lint
for (const name of ['lua-demo', 'graph-demo']) {
  const project = path.join(root, name)
  fs.mkdirSync(path.join(project, 'node_modules'))
  fs.symlinkSync(repo, path.join(project, 'node_modules/genshin-ts'), 'junction')
  fs.symlinkSync(
    path.join(repo, 'node_modules/@types'),
    path.join(project, 'node_modules/@types'),
    'junction'
  )
  // 两个模板的节点图入口都沿用 v0.2.3 的 (_evt, f)，未使用的参数 f 有一个 lint 警告
  const checks = [
    ['node_modules/typescript/bin/tsc', ['-p', 'tsconfig.json', '--noEmit']],
    ['bin/gsts.mjs', ['lua', 'check', '--lang', 'zh']],
    ['bin/gsts.mjs', ['--noinject', '--lang', 'zh']],
    ['node_modules/eslint/bin/eslint.js', ['src', '--max-warnings', '1']]
  ]
  if (name === 'lua-demo')
    checks.push(['node_modules/typescript/bin/tsc', ['-p', 'src/lua/tsconfig.json', '--noEmit']])
  for (const [command, args] of checks) {
    const run = spawnSync(process.execPath, [path.join(repo, command), ...args], {
      cwd: project,
      encoding: 'utf8',
      timeout: 120000,
      maxBuffer: 8 * 1024 * 1024
    })
    assert.equal(run.status, 0, `${name}: ${command} ${args.join(' ')}\n${run.stdout}${run.stderr}`)
    // 只有节点图的项目里 gsts lua check 直接结束、不输出
    if (name === 'graph-demo' && args[0] === 'lua') assert.equal(run.stdout + run.stderr, '')
  }
  const gia = name === 'lua-demo' ? 'dist/graphs/main.gia' : 'dist/main.gia'
  assert(fs.existsSync(path.join(project, gia)), `${name}: ${gia}`)
  assert.equal(fs.existsSync(path.join(project, 'dist/lua/lua/hud.lua')), name === 'lua-demo', name)
  for (const link of ['genshin-ts', '@types']) fs.rmSync(path.join(project, 'node_modules', link))
}
console.log(
  'Scaffold: zh/en help, both templates, non-empty guard, inject from local saves, and each template passes typecheck, gsts lua check, build and lint: PASS'
)
