import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import parser from '@typescript-eslint/parser'
import { ESLint } from 'eslint'
import ts from 'typescript'

import gsts from '../../src/eslint/index.ts'
import { buildFixture, execute, successful } from './support.mjs'

const bad = `export function pair(): [number,number]
export interface Vec { add(x:number): number; scale: (factor:number)=>number }
export const vec: Vec`
const good = `import type {LuaMultiReturn} from 'genshin-ts/runtime/lua'
export function pair(): LuaMultiReturn<[number,number]>
export interface Vec {add(this:void,x:number):number; scale:(this:Vec,factor:number)=>number}
export const vec: Vec`
const main = `import{g}from'genshin-ts/runtime/core';import{pair,vec}from'./raw';export default g.clientControlScript(lua=>{return{onStart(){const[a,b]=pair();lua.print(a,b,vec.add(2),vec.scale(3))}}})`
const raw =
  'return {pair=function()return 4,5 end,vec={n=7,add=function(x)return x+1 end,scale=function(self,n)return self.n*n end}}'
const invalid = buildFixture({ 'main.ts': main, 'raw.d.ts': bad, 'raw.lua': raw }, false)
assert.equal(invalid.diagnostics.filter((d) => d.source === 'lua-native-this').length, 2)
assert.equal(invalid.diagnostics.filter((d) => d.source === 'lua-native-multi-return').length, 1)
assert.equal(invalid.files.size, 0)
const valid = successful(buildFixture({ 'main.ts': main, 'raw.d.ts': good, 'raw.lua': raw }))
execute(
  valid.files,
  "print=function(a,b,c,d)assert(a==4 and b==5 and c==3 and d==21)end;require('main');OnStart()"
)

fs.mkdirSync(path.resolve('.tmp/lua-tests'), { recursive: true })
const root = fs.mkdtempSync(path.resolve('.tmp/lua-tests/native-types-'))
fs.mkdirSync(path.join(root, 'node_modules'))
fs.symlinkSync(path.resolve('.'), path.join(root, 'node_modules/genshin-ts'), 'junction')
const config = path.join(root, 'tsconfig.json')
fs.writeFileSync(
  config,
  JSON.stringify({ extends: path.resolve('configs/tsconfig/lua.json'), include: ['*.ts'] })
)
for (const [name, code] of Object.entries({
  'bad.d.ts': bad,
  'good.d.ts': good,
  'ordinary.d.ts': bad,
  'bad.lua': raw,
  'good.lua': raw
}))
  fs.writeFileSync(path.join(root, name), code)
const parsed = ts.getParsedCommandLineOfConfigFile(
  config,
  {},
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic(d) {
      throw Error(String(d.messageText))
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
const proxy = createRequire(import.meta.url)('../../configs/ts-plugin/index.cjs')({
  typescript: ts
}).create({ languageService: service })
const lint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: ['**/*.ts'],
      languageOptions: { parser, parserOptions: { project: config } },
      plugins: { gsts },
      rules: { 'gsts/lua-native-this': 'error', 'gsts/lua-native-multi-return': 'error' }
    }
  ]
})
for (const name of ['bad', 'good', 'ordinary']) {
  const file = path.join(root, name + '.d.ts')
  const diagnostics = proxy
    .getSemanticDiagnostics(file)
    .filter((d) => d.source?.startsWith('lua-native-'))
  const [result] = await lint.lintText(fs.readFileSync(file, 'utf8'), { filePath: file })
  assert.equal(diagnostics.length, name === 'bad' ? 3 : 0)
  assert.equal(result.messages.length, name === 'bad' ? 3 : 0, JSON.stringify(result.messages))
  for (const diagnostic of diagnostics) {
    const p = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
    console.log(
      `ts-plugin ${name}.d.ts:${p.line + 1}:${p.character + 1}: ${diagnostic.messageText}`
    )
  }
  for (const m of result.messages)
    console.log(`ESLint ${name}.d.ts:${m.line}:${m.column}: ${m.ruleId} ${m.message}`)
}
service.dispose()
console.log(
  'Native declarations: compiler, editor and ESLint detect tuple/self mistakes; explicit receivers and multi-return execute; unrelated declarations unaffected: PASS'
)
