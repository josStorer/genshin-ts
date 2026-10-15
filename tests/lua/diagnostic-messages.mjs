import assert from 'node:assert/strict'

import ts from 'typescript'

import {
  localizeLuaTranspileDiagnostic,
  localizeLuaTranspileError
} from '../../src/compiler/lua/diagnostic_messages.ts'
import { LocatedLuaError } from '../../src/compiler/lua/tstl_compat.ts'
import { initCliI18n } from '../../src/i18n/index.ts'
import { buildFixture } from './support.mjs'

for (const language of ['zh-CN', 'en-US']) {
  initCliI18n(language)
  const source = `import{g}from'genshin-ts/runtime/core';
export default g.clientControlScript(lua=>{
 const pattern = /foo/;
 function* values(){yield 1}
 return {onStart(){lua.print(pattern)}}
})`
  const result = buildFixture({ 'main.ts': source }, false)
  const regex = result.diagnostics.find((d) => d.start === source.indexOf('/foo/'))
  assert(regex && regex.source === 'lua-unsupported-syntax')
  assert(String(regex.messageText).includes('lua.string.match'))
  const generator = result.diagnostics.find((d) => d.start === source.indexOf('function*'))
  assert(
    generator &&
      String(generator.messageText).includes(language === 'zh-CN' ? '生命周期' : 'lifecycle')
  )
  assert.equal(result.files.size, 0)
  for (const diagnostic of [regex, generator]) {
    const pos = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
    console.log(
      `${language} main.ts:${pos.line + 1}:${pos.character + 1}: ${diagnostic.messageText}`
    )
  }
  const original = {
    file: regex.file,
    start: regex.start,
    length: regex.length,
    category: 1,
    code: 1000,
    messageText: 'Unsupported node kind RegularExpressionLiteral'
  }
  const mapped = localizeLuaTranspileDiagnostic(original)
  assert.equal(mapped.file, original.file)
  assert.equal(mapped.start, original.start)
  assert.equal(mapped.length, original.length)
  assert.equal(mapped.messageText, regex.messageText)
  let node
  const visit = (n) => {
    if (n.kind === ts.SyntaxKind.RegularExpressionLiteral) node = n
    ts.forEachChild(n, visit)
  }
  visit(regex.file)
  const error = new LocatedLuaError(node, new Error(original.messageText))
  assert.equal(error.node, node)
  assert.equal(error.message, regex.messageText)
  assert(localizeLuaTranspileError('Unsupported node kind WithStatement').includes('WithStatement'))
}
initCliI18n('zh-CN')
const sharedSource = 'export const value=1n;export const more=BigInt(2)'
const shared = buildFixture(
  {
    'main.ts': `import{g}from'genshin-ts/runtime/core';import{value,more}from'./shared';export default g.clientControlScript(lua=>{return{onStart(){lua.print(value,more)}}})`,
    'graph.ts': `import{g}from'genshin-ts/runtime/core';import{value,more}from'./shared';g.server({id:1073741901}).on('whenEntityIsCreated',()=>console.log(value,more))`,
    'shared.ts': sharedSource
  },
  false
)
for (const start of [sharedSource.indexOf('1n'), sharedSource.indexOf('BigInt')]) {
  const at = shared.diagnostics.filter(
    (d) => d.file?.fileName.endsWith('shared.ts') && d.start === start
  )
  assert.equal(at.length, 1, JSON.stringify(at.map((d) => d.messageText)))
  assert.equal(at[0].source, 'lua-shared-module')
  assert(String(at[0].messageText).includes('int()'))
  console.log(`shared.ts:1:${start + 1}: ${at[0].messageText}`)
}
console.log(
  'Localized syntax alternatives retain source locations; shared bigint emits one specific diagnostic per site: PASS'
)
