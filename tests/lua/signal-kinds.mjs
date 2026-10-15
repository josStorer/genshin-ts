import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

const definition = path.resolve('src/runtime/signal_definition.ts')
const values = path.resolve('src/runtime/lua_signals.ts')
const definitionText = fs.readFileSync(definition, 'utf8')
const valuesText = fs.readFileSync(values, 'utf8')
const options = {
  strict: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  types: []
}
function diagnostics(metadata, types = valuesText) {
  const host = ts.createCompilerHost(options)
  const read = host.readFile
  host.readFile = (name) => {
    if (path.resolve(name) === definition) return metadata
    if (path.resolve(name) === values) return types
    return read(name)
  }
  return ts.getPreEmitDiagnostics(ts.createProgram([definition, values], options, host))
}
const added = definitionText.replace(
  'export const signalKinds = {',
  "export const signalKinds = { pretend: { writer: 'AddPretend', validation: 'integer' },"
)
assert.equal(diagnostics(definitionText).length, 0)
assert(
  diagnostics(added).some((d) =>
    ts.flattenDiagnosticMessageText(d.messageText, ' ').includes('pretend')
  )
)
assert.equal(
  diagnostics(
    added,
    valuesText.replace(
      'export interface LuaKindValues {',
      'export interface LuaKindValues { pretend: number'
    )
  ).length,
  0
)
for (const incomplete of [
  added.replace("writer: 'AddPretend', ", ''),
  added.replace(", validation: 'integer' },", ' },')
])
  assert(diagnostics(incomplete).some((d) => d.file && path.resolve(d.file.fileName) === definition))
assert(
  diagnostics(
    definitionText,
    valuesText.replace(
      'export interface LuaKindValues {',
      'export interface LuaKindValues { obsolete: number'
    )
  ).length > 0
)
console.log(
  'Signal kinds: missing writer, validator or TS value and orphan TS kinds fail type checking; complete additions pass'
)
