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
const source = `import {g} from 'genshin-ts/runtime/core';
export default g.clientControlScript(lua=>{
 if (0) {}
 const n=lua.tonumber("0") ?? 0; const negated=!n; const fallback=n || 1;
 const unavailable=setTimeout; new Boolean(0); Math.cosh(1);
 lua./*env*/;
 lua.game./*game*/;
 if(lua.helper.isControl(self,'ClientUITextBoxControl')) {self./*control*/;}
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
for (const name of ['GameObject', 'stage', 'level', 'setTimeout', 'process', 'document'])
  assert.ok(!global.includes(name), name)
const require = createRequire(import.meta.url)
const plugin = require('../../configs/ts-plugin/index.cjs')({ typescript: ts })
const proxy = plugin.create({ languageService: service })
assert.ok(
  proxy.getSemanticDiagnostics(file).some((d) => d.code === 97001),
  'Lua diagnostics must also reach tsserver'
)
const semanticDiagnostics = proxy.getSemanticDiagnostics(file)
assert.ok(semanticDiagnostics.some((d) => d.source === 'lua-unavailable-global'))
assert.ok(semanticDiagnostics.some((d) => d.source === 'lua-standard-library'))
for (const start of [source.indexOf('!n') + 1, source.indexOf('n ||')])
  assert.ok(
    semanticDiagnostics.some((d) => d.code === 97001 && d.start === start),
    'truthiness warning must reach the editor at the tested operand'
  )
service.dispose()
console.log('Lua language service: globals, hooks, dt and narrowed controls: PASS')
