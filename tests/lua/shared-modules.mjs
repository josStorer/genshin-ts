import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import parser from '@typescript-eslint/parser'
import { ESLint } from 'eslint'
import ts from 'typescript'

import { compileLua } from '../../src/compiler/lua/build.ts'
import {
  getSharedModuleDiagnostics,
  resolveSharedProject
} from '../../src/compiler/lua/shared_modules.ts'
import gsts from '../../src/eslint/index.ts'

const root = fs.mkdtempSync(path.resolve('.tmp/lua-tests/shared-'))
fs.writeFileSync(path.join(root, 'gsts.config.ts'), "export default {compileRoot:'.'}")
fs.writeFileSync(
  path.join(root, 'graph.ts'),
  "import{g}from'genshin-ts/runtime/core';import{value}from'./bridge';g.server({id:1073741901}).on('whenEntityIsCreated',()=>{console.log(value)})"
)
fs.writeFileSync(
  path.join(root, 'hud.ts'),
  "import{g}from'genshin-ts/runtime/core';import{value}from'./shared';export default g.clientControlScript(lua=>{return{onStart(){lua.print(value)}}})"
)
fs.writeFileSync(path.join(root, 'bridge.ts'), "export{value}from'./shared'")
const shared = path.join(root, 'shared.ts')
const options = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  types: [],
  rootDir: root
}
for (const globals of ['lua_globals.d.ts', 'server_globals.global.d.ts']) {
  fs.writeFileSync(shared, 'export const value=1n')
  const program = ts.createProgram(
    [
      path.join(root, globals.startsWith('lua') ? 'hud.ts' : 'graph.ts'),
      path.resolve('dist/src/runtime', globals)
    ],
    options
  )
  const source = program.getSourceFile(shared)
  const context = { program, project: resolveSharedProject(source, program) }
  const isolatedContext = { program, project: { root, files: [path.join(root, 'hud.ts')] } }
  assert.deepEqual(getSharedModuleDiagnostics(source, isolatedContext), [])
  const found = getSharedModuleDiagnostics(source, context)
  assert.deepEqual(
    getSharedModuleDiagnostics(source, isolatedContext),
    [],
    'same Program cannot leak another project context'
  )
  assert(
    found.some((d) => d.source === 'lua-shared-module' && String(d.messageText).includes('int()')),
    globals
  )
  const plugin = createRequire(import.meta.url)('../../configs/ts-plugin/index.cjs')({
    typescript: ts
  })
  const proxy = plugin.create({
    languageService: { getSemanticDiagnostics: () => [], getProgram: () => program }
  })
  assert(
    proxy.getSemanticDiagnostics(shared).some((d) => d.source === 'lua-shared-module'),
    'tsserver ' + globals
  )
}
const config = path.join(root, 'tsconfig.json')
fs.writeFileSync(
  config,
  JSON.stringify({
    compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', types: [] },
    include: ['*.ts']
  })
)
const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: ['**/*.ts'],
      languageOptions: { parser, parserOptions: { project: config } },
      plugins: { gsts },
      rules: { 'gsts/lua-shared-module': 'error' }
    }
  ]
})
const [linted] = await eslint.lintText(fs.readFileSync(shared, 'utf8'), { filePath: shared })
assert(
  linted.messages.some((m) => m.ruleId === 'gsts/lua-shared-module'),
  'ESLint outside Lua tsconfig ' + JSON.stringify(linted.messages)
)
fs.writeFileSync(shared, 'export const value=self')
const result = compileLua({
  entries: [path.join(root, 'hud.ts')],
  rootDir: root,
  outDir: path.join(root, 'out')
})
assert(result.diagnostics.some((d) => d.source === 'lua-shared-module'))
fs.writeFileSync(shared, 'export const value=1;export function double(n:number){return n*2}')
const good = compileLua({
  entries: [path.join(root, 'hud.ts')],
  rootDir: root,
  outDir: path.join(root, 'out')
})
assert(!good.diagnostics.some((d) => d.source === 'lua-shared-module'))
fs.writeFileSync(
  path.join(root, 'graph.ts'),
  "import{g}from'genshin-ts/runtime/core';g.server({id:1073741901})"
)
fs.writeFileSync(shared, 'export const value=1n')
const removed = ts.createProgram([path.join(root, 'hud.ts')], options)
assert.deepEqual(
  getSharedModuleDiagnostics(removed.getSourceFile(shared), {
    program: removed,
    project: resolveSharedProject(removed.getSourceFile(shared), removed)
  }),
  []
)
// An explicit standalone compilation root must not scan the parent project's entries.
const isolated = path.join(root, 'isolated')
fs.mkdirSync(isolated)
fs.writeFileSync(path.join(isolated, 'shared.ts'), 'export const value=self')
fs.writeFileSync(path.join(isolated, 'hud.ts'), fs.readFileSync(path.join(root, 'hud.ts')))
fs.writeFileSync(
  path.join(root, 'graph.ts'),
  "import{g}from'genshin-ts/runtime/core';import{value}from'./isolated/shared';g.server({id:1073741901})"
)
const isolatedBuild = compileLua({
  entries: [path.join(isolated, 'hud.ts')],
  rootDir: isolated,
  outDir: path.join(isolated, 'out')
})
assert(!isolatedBuild.diagnostics.some((d) => d.source === 'lua-shared-module'))
console.log(
  'Shared modules: actual imports and reexports, cross-tsconfig diagnostics, neutral numbers and import removal: PASS'
)
