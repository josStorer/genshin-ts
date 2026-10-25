import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import ts from 'typescript'

const dir = path.resolve('.tmp/lua-editor')
fs.mkdirSync(dir, { recursive: true })
fs.mkdirSync(path.join(dir, 'node_modules'), { recursive: true })
const installed = path.join(dir, 'node_modules/genshin-ts')
if (!fs.existsSync(installed)) fs.symlinkSync(path.resolve('.'), installed, 'junction')
const file = path.join(dir, 'main.ts')
const config = path.join(dir, 'tsconfig.json')
fs.writeFileSync(
  config,
  JSON.stringify({ extends: 'genshin-ts/tsconfig/lua.json', include: ['*.ts'] })
)
const source = `import {g, defineSignal} from 'genshin-ts/runtime/core';
import type {LuaTimerHandle} from 'genshin-ts/runtime/lua';
export default g.clientControlScript(lua=>{
 const timer: LuaTimerHandle = setTimeout(() => {}, 100); clearTimeout(timer);
 if (0) {}
 const n=lua.tonumber("0") ?? 0; const negated=!n; const fallback=n || 1;
 lua.helper.readParams(lua.script,{Board:{type:'control',kind:'ClientUIContainerControl'}});
 const unavailable=queueMicrotask; new Boolean(0); Math.cosh(1);
 lua./*env*/;
 lua.game./*game*/;
 lua.Color./*color*/;
 lua.helper./*helper*/;
 console./*console*/;
 lua.math./*math*/;
 if(lua.helper.isControl(self,'ClientUITextBoxControl')) {self./*control*/;}
 lua.onSignal(defineSignal('Typed',[['n','int']] as const), (evt) => { const [n] = evt.values; lua.print(n + evt.params.n) });
 lua.onSignal('Named', (evt) => { lua.print(evt.name, evt.values.length) });
 lua.print(stage);
 return { /*hooks*/ onUpdate(dt){dt./*delta*/;} }
})`
fs.writeFileSync(file, source)
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
const host = {
  ...ts.sys,
  getCompilationSettings: () => parsed.options,
  getScriptFileNames: () => parsed.fileNames,
  getScriptVersion: () => '1',
  getScriptSnapshot: (name) =>
    fs.existsSync(name) ? ts.ScriptSnapshot.fromString(fs.readFileSync(name, 'utf8')) : undefined,
  getCurrentDirectory: () => dir,
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options)
}
const service = ts.createLanguageService(host)
function names(marker) {
  const result = service.getCompletionsAtPosition(file, source.indexOf(`/*${marker}*/`), {
    includeCompletionsForModuleExports: false
  })
  assert.ok(result, marker)
  return new Set(result.entries.map((x) => x.name))
}
for (const name of ['script', 'game', 'helper', 'Color', 'Enum'])
  assert.ok(names('env').has(name), name)
assert.ok(names('game').has('InstantiateClientUIControl'))
assert.ok(names('control').has('text'))
assert.ok(names('hooks').has('onStart'))
assert.ok(names('hooks').has('onLevelUpdate'))
assert.ok(names('delta').has('toFixed'))
const global =
  service
    .getCompletionsAtPosition(file, source.indexOf(' return'), {})
    ?.entries.map((x) => x.name) ?? []
for (const name of ['GameObject', 'stage', 'level', 'process', 'document'])
  assert.ok(!global.includes(name), name)
for (const name of ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'])
  assert.ok(global.includes(name), name)
const require = createRequire(import.meta.url)
const plugin = require('../../configs/ts-plugin/index.cjs')({ typescript: ts })
const proxy = plugin.create({ languageService: service })
// lua. 补全：官方 API 和 gsts 工具排在 Lua 标准库前面，标准库标注来源；lua.Color 不带函数自身的成员。
const completions = (marker) =>
  proxy.getCompletionsAtPosition(file, source.indexOf(`/*${marker}*/`), {}).entries
const bySortText = (entries) => entries.sort((a, b) => a.sortText.localeCompare(b.sortText))
const sorted = bySortText(completions('env'))
// 按常用程度：game、helper、script 在前，监听其次，Color、Enum 再后；lua.helper. 最常用的工具在前
assert.deepEqual(
  sorted.slice(0, 10).map((x) => x.name),
  [
    'game',
    'helper',
    'script',
    'self',
    'onSignal',
    'onVariable',
    'onKey',
    'onCursor',
    'Color',
    'Enum'
  ]
)
assert.deepEqual(
  bySortText(completions('helper'))
    .slice(0, 6)
    .map((x) => x.name),
  ['findControl', 'findScript', 'readParams', 'readVariable', 'setTimeout', 'setInterval']
)
const firstStandard = sorted.findIndex((x) => x.name === 'print')
for (const name of [
  'self',
  'script',
  'game',
  'Enum',
  'Color',
  'helper',
  'onSignal',
  'onVariable',
  'onKey',
  'onCursor'
])
  assert(sorted.findIndex((x) => x.name === name) < firstStandard, name)
assert.equal(
  sorted.find((x) => x.name === 'print').labelDetails?.description,
  'Lua standard library'
)
assert.equal(sorted.find((x) => x.name === 'script').labelDetails?.description, undefined)
const colors = completions('color').map((x) => x.name)
assert(colors.includes('FromRGB') && !colors.includes('apply') && !colors.includes('prototype'))
// 用户最常接触的成员，补全时都要有说明
const documented = (marker, name) =>
  service.getCompletionEntryDetails(
    file,
    source.indexOf(`/*${marker}*/`),
    name,
    {},
    undefined,
    undefined,
    undefined
  )?.documentation?.length > 0
for (const [marker, name] of [
  ['env', 'script'],
  ['env', 'game'],
  ['env', 'Enum'],
  ['env', 'Color'],
  ['env', 'print'],
  ['env', 'tostring'],
  ['helper', 'findControl'],
  ['env', 'onKey'],
  ['env', 'onCursor'],
  ['helper', 'readParams'],
  ['console', 'log'],
  ['math', 'fmod']
])
  assert(documented(marker, name), `${marker}: ${name} has no doc`)
assert.ok(
  proxy.getSemanticDiagnostics(file).some((d) => d.code === 97001),
  'Lua diagnostics must also reach tsserver'
)
const semanticDiagnostics = proxy.getSemanticDiagnostics(file)
assert(
  !semanticDiagnostics.some(
    (d) => d.start >= source.indexOf('import type') && d.start < source.indexOf(' if (0)')
  ),
  'public LuaTimerHandle import and use must typecheck'
)
assert(
  semanticDiagnostics.some((d) => d.code === 2322 && d.start === source.indexOf("type:'control'")),
  'removed control param gets an ordinary TS type error'
)
assert.ok(semanticDiagnostics.some((d) => d.source === 'lua-unavailable-global'))
assert.ok(semanticDiagnostics.some((d) => d.source === 'lua-standard-library'))
for (const start of [source.indexOf('!n') + 1, source.indexOf('n ||')])
  assert.ok(
    semanticDiagnostics.some((d) => d.code === 97001 && d.category === 1 && d.start === start),
    'truthiness error must reach the editor at the tested operand'
  )
// 两种 lua.onSignal 写法在调用处悬停都有说明（重载各自带注释）
for (const call of ['onSignal(defineSignal', "onSignal('Named'"]) {
  const info = service.getQuickInfoAtPosition(file, source.indexOf(call) + 2)
  assert(ts.displayPartsToString(info?.documentation).length > 0, call + ' hover has no doc')
}
const stageAt = source.indexOf('stage);')
assert(
  semanticDiagnostics.some((d) => d.source === 'lua-graph-api' && d.start === stageAt),
  'node-graph global gets the Lua hint'
)
assert(
  !semanticDiagnostics.some((d) => d.code === 2304 && d.start === stageAt),
  'the explained name is not reported twice'
)
service.dispose()
console.log(
  'Lua language service: globals, hooks, dt, narrowed controls, lua. completion order, member docs and onSignal call hovers: PASS'
)
