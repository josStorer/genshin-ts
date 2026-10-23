import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import parser from '@typescript-eslint/parser'
import { ESLint } from 'eslint'
import ts from 'typescript'

import { analyzeLuaEntry } from '../../src/compiler/lua/analysis/entry_analysis.ts'
import gsts from '../../src/eslint/index.ts'

const root = path.resolve('.tmp/lua-entry-model')
fs.mkdirSync(root, { recursive: true })
fs.mkdirSync(path.join(root, 'node_modules'), { recursive: true })
const installed = path.join(root, 'node_modules/genshin-ts')
if (!fs.existsSync(installed)) fs.symlinkSync(path.resolve('.'), installed, 'junction')
const config = path.join(root, 'tsconfig.json')
fs.writeFileSync(
  config,
  JSON.stringify({ extends: path.resolve('configs/tsconfig/lua.json'), include: ['*.ts'] })
)
const cases = [
  [
    'shared-export',
    `import{g}from'genshin-ts/runtime/core';let value=1;export{value as current};g.clientControlScript(lua=>({onStart(){value++}}))`,
    'lua-shared-mutable-export'
  ],
  [
    'shared-export-again',
    `import{g}from'genshin-ts/runtime/core';export let value=1;export{value as current};g.clientControlScript(lua=>({onStart(){lua.print(value)}}))`,
    'lua-shared-mutable-export'
  ],
  [
    'expression-return',
    `import {g} from 'genshin-ts/runtime/core';const makeHooks=()=>({});g.clientControlScript(lua=>makeHooks())`,
    'lua-entry-callback'
  ],
  [
    'expression-hook',
    `import {g} from 'genshin-ts/runtime/core';g.clientControlScript(lua=>({onStart:3}))`,
    'lua-hook-function'
  ],
  [
    'expression-method',
    `import {g} from 'genshin-ts/runtime/core';g.clientControlScript(lua=>({methods:{value:3}}))`,
    'lua-public-methods'
  ],
  [
    'enable-listener',
    `import{g}from'genshin-ts/runtime/core';g.clientControlScript(lua=>{return{onEnable(){lua.onSignal({__gstsSignal:true,name:'X',params:[]},()=>{})}}})`,
    'lua-on-enable-subscription',
    0
  ],
  [
    'graph',
    `import {GameObject} from 'genshin-ts/runtime/core'; export const value = GameObject;`,
    'lua-graph-api'
  ],
  [
    'hook',
    `import {g} from 'genshin-ts/runtime/core'; export default g.clientControlScript(lua=>{return {onStart:3}})`,
    'lua-hook-function'
  ],
  [
    'return',
    `import {g} from 'genshin-ts/runtime/core'; export default g.clientControlScript(lua=>{const hooks={}; return hooks})`,
    'lua-entry-return'
  ],
  ['scope', `export const timer = setTimeout(()=>{}, 1)`, 'lua-instance-scope'],
  [
    'top-scope',
    `import{g}from'genshin-ts/runtime/core'; const host=self; g.clientControlScript(lua=>{return{}})`,
    'lua-instance-scope'
  ],
  [
    'default-value',
    `import Entry from './valid'; export const value=Entry;`,
    'lua-entry-default-value'
  ]
]
const expressionFile = path.join(root, 'expression-valid.ts')
const expressionCode = `import{g}from'genshin-ts/runtime/core';g.clientControlScript(lua=>({onStart(){lua.print('ready')},onUpdate:(dt)=>{lua.print(dt)},methods:{answer(){return 42}}}))`
fs.writeFileSync(expressionFile, expressionCode)
const modelFile = path.join(root, 'valid.ts')
fs.writeFileSync(
  modelFile,
  `import {g} from 'genshin-ts/runtime/core';
export default g.clientControlScript({timerClock:'real'}, env=>{
 let count=0; function summary(){return count}
 env.onSignal({name:'changed',params:[]},()=>{});
 env.helper.listenKey(self, env.Enum.KeyEventType.KeyboardMoveForwardKeyDown,()=>false);
 setTimeout(()=>{count++},1);
 return {onStart(){env.print(count)},methods:{summary,increment(){return ++count}}}
})`
)
for (const [name, code] of cases) fs.writeFileSync(path.join(root, name + '.ts'), code)
const parsed = ts.getParsedCommandLineOfConfigFile(
  config,
  {},
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic(d) {
      throw new Error(ts.flattenDiagnosticMessageText(d.messageText, '\n'))
    }
  }
)
const service = ts.createLanguageService({
  ...ts.sys,
  getCompilationSettings: () => parsed.options,
  getScriptFileNames: () => parsed.fileNames,
  getScriptVersion: () => '1',
  getScriptSnapshot: (name) => {
    const text = ts.sys.readFile(name)
    return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text)
  },
  getCurrentDirectory: () => root,
  getDefaultLibFileName: ts.getDefaultLibFilePath
})
const program = service.getProgram()
const source = program.getSourceFile(modelFile)
const analysis = analyzeLuaEntry(source, program)
assert.strictEqual(
  analysis,
  analyzeLuaEntry(source, program),
  'same Program and source reuse the model'
)
assert.deepEqual(analysis.diagnostics, [])
assert.equal(analysis.model.environment.text, 'env')
assert.equal(analysis.model.options.timerClock, 'real')
assert.deepEqual([...analysis.model.hooks.keys()], ['onStart'])
assert.deepEqual([...analysis.model.methods.keys()], ['summary', 'increment'])
assert.deepEqual(analysis.model.scope, { signals: true, keys: true, timers: true })
assert(ts.isFunctionDeclaration(analysis.model.methods.get('summary').definition))
const require = createRequire(import.meta.url)
const proxy = require('../../configs/ts-plugin/index.cjs')({ typescript: ts }).create({
  languageService: service
})
const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: ['**/*.ts'],
      languageOptions: { parser, parserOptions: { project: config } },
      plugins: { gsts },
      rules: Object.fromEntries(
        cases.map(([, , rule, category]) => ['gsts/' + rule, category === 0 ? 'warn' : 'error'])
      )
    }
  ]
})
for (const [name, code, rule, category = 1] of cases) {
  const file = path.join(root, name + '.ts')
  const diagnostics = proxy.getSemanticDiagnostics(file)
  const diagnostic = diagnostics.find((d) => d.source === rule)
  assert(
    diagnostic,
    `${name}: missing editor diagnostic; ${JSON.stringify(diagnostics.map((d) => d.messageText))}`
  )
  const [result] = await eslint.lintText(code, { filePath: file })
  const message = result.messages.find((m) => m.ruleId === 'gsts/' + rule)
  assert(message, `${name}: missing ESLint diagnostic; ${JSON.stringify(result.messages)}`)
  assert.equal(diagnostic.category, category)
  assert.equal(message.severity, category === 0 ? 1 : 2)
  const pos = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
  console.log(
    `ts-plugin ${name}.ts:${pos.line + 1}:${pos.character + 1} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`
  )
  console.log(
    `ESLint ${name}.ts:${message.line}:${message.column} ${message.ruleId} ${message.message}`
  )
}
const expressionModel = analyzeLuaEntry(program.getSourceFile(expressionFile), program)
assert.deepEqual(expressionModel.diagnostics, [])
assert.equal(expressionModel.model.statements.length, 0)
assert.deepEqual([...expressionModel.model.hooks.keys()], ['onStart', 'onUpdate'])
assert(
  !proxy
    .getSemanticDiagnostics(expressionFile)
    .some((d) => d.category === ts.DiagnosticCategory.Error)
)
assert.equal((await eslint.lintText(expressionCode, { filePath: expressionFile }))[0].errorCount, 0)
service.dispose()
console.log(
  'Lua entry model: cached analysis, lifecycle/method/scope facts and all four editor/ESLint errors: PASS'
)
