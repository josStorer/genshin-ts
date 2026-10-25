import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

// 同一个共享计算模块被节点图和 Lua 同时使用：
// 普通函数传字面量在编译期算好；gstsServer 函数和"普通函数接收 f、包一层节点调用"都编译成节点；
// 普通函数拿运行时的值做 JS 运算时，报出说明（而不是后面节点里的 Generic parameter not matched）；
// 包在普通函数里的节点调用自己出错时，保留原来的节点报错，不误报成改名提示。
const repo = path.resolve('.')
const base = fs.mkdtempSync(path.resolve('.tmp/lua-tests/shared-runtime-'))
function project(name, serverBody) {
  const dir = path.join(base, name)
  fs.mkdirSync(path.join(dir, 'src/shared'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'src/lua'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'node_modules'))
  fs.symlinkSync(repo, path.join(dir, 'node_modules/genshin-ts'), 'junction')
  const write = (file, text) => fs.writeFileSync(path.join(dir, file), text)
  write(
    'src/shared/calc.ts',
    `export const BONUS = 3
export function score(combo: number, perfect: boolean) {
  const base = combo * 10 + BONUS
  return perfect ? base * 2 : base
}
export function gstsServerScore(combo: number, perfect: boolean) {
  return perfect ? (combo * 10 + BONUS) * 2 : combo * 10 + BONUS
}
`
  )
  write(
    'src/shared/signals.ts',
    `import { defineSignal } from 'genshin-ts/runtime/core'\nexport const Hit = defineSignal('Hit', [['combo', 'float']])\n`
  )
  write(
    'src/server.ts',
    `import type { ServerExecutionFlowFunctions } from 'genshin-ts/definitions/nodes'
import { g } from 'genshin-ts/runtime/core'
import { gstsServerScore, score } from './shared/calc'
import { Hit } from './shared/signals'
type Combo = Parameters<ServerExecutionFlowFunctions['multiplication']>[0]
function doubled(f: ServerExecutionFlowFunctions, combo: Combo) {
  return f.multiplication(combo, 2)
}
function broken(f: ServerExecutionFlowFunctions) {
  f.printString('broken')
  return str(Number.NaN)
}
g.server({ id: 1073741999 }).onSignal(Hit, (evt, f) => {
${serverBody}
})
`
  )
  write(
    'src/lua/tsconfig.json',
    JSON.stringify({ extends: 'genshin-ts/tsconfig/lua.json', include: ['.', '../shared'] })
  )
  write(
    'src/lua/hud.ts',
    `import { g } from 'genshin-ts/runtime/core'
import { gstsServerScore, score } from '../shared/calc'
export default g.clientControlScript((lua) => {
  lua.print(score(4, true), gstsServerScore(4, false))
  return {}
})
`
  )
  write(
    'gsts.config.mjs',
    "export default { compileRoot: 'src', entries: ['**/*.ts'], outDir: 'dist' }"
  )
  const result = spawnSync(
    process.execPath,
    [path.join(repo, 'bin/gsts.mjs'), '-c', 'gsts.config.mjs', '--noinject', '--lang', 'en'],
    { cwd: dir, encoding: 'utf8', timeout: 180000 }
  )
  fs.rmSync(path.join(dir, 'node_modules/genshin-ts'))
  return { dir, output: result.stdout + result.stderr }
}

const good = project(
  'good',
  `  f.printString(str(score(2, false)))
  f.printString(str(gstsServerScore(evt.params.combo, true)))
  f.printString(str(doubled(f, evt.params.combo)))`
)
assert(fs.existsSync(path.join(good.dir, 'dist/server.gia')), good.output)
assert(fs.existsSync(path.join(good.dir, 'dist/lua/lua/hud.lua')), good.output)
assert(!good.output.includes('runtime value'), good.output)

const bad = project('bad', `  f.printString(str(score(evt.params.combo, true)))`)
assert(!fs.existsSync(path.join(bad.dir, 'dist/server.gia')), bad.output)
assert.match(bad.output, /node graph runtime value \(\w+\) was used in a plain JS operation/)
assert.match(bad.output, /gstsServer/)
assert(!bad.output.includes('Generic parameter not matched'), bad.output)

const nodeError = project('node-error', `  f.printString(broken(f))`)
assert.match(nodeError.output, /Generic parameter not matched/)
assert(!nodeError.output.includes('runtime value'), nodeError.output)
console.log(
  'Shared runtime values: literals precompute, gstsServer functions and plain helpers taking f compile to nodes, plain JS math on a runtime value explains the gstsServer rename, node errors inside helpers keep their own message: PASS'
)
