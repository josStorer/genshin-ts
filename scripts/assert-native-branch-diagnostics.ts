import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { buildServerGraphRegistriesIRDocuments } from 'genshin-ts/runtime/core'

import { irToGia } from '../src/compiler/ir_to_gia_transform/index.js'
import { compileTsToGs, createTsToGsProgramCache } from '../src/compiler/ts_to_gs_pipeline.js'
import { initCliI18n } from '../src/i18n/index.js'

const root = process.cwd()
const dir = path.join(root, '.tmp/native-branch-diagnostics')
fs.mkdirSync(dir, { recursive: true })
const cache = createTsToGsProgramCache()
const query = 'const targets = f.getEntityListByUnitTag(1073741825n);'
const invalid = [
  `${query} f.doubleBranch(true, () => { f.destroyEntity(targets[0]) }, () => {})`,
  `${query} f.doubleBranch(true, () => { f.printString(str(targets.length)) }, () => {})`,
  'f.doubleBranch(true, () => { f.destroyEntity(f.getEntityListByUnitTag(1073741825n)[0]) }, () => {})',
  `${query} f.doubleBranch(true, () => { const alias = targets; f.destroyEntity(alias[0]) }, () => {})`,
  `${query} f.doubleBranch(true, () => {}, () => { f.destroyEntity(targets[0]) })`,
  `${query} const stored = f.initLocalVariable('entity_list', targets);
   f.doubleBranch(true, () => { f.destroyEntity(stored.value[0]) }, () => {})`,
  `const values = list('int', [1n]);
   f.doubleBranch(true, () => { f.printString(str(values[0])) }, () => {})`,
  `let values = [1n]; values[0] = 2n;
   f.doubleBranch(true, () => { f.printString(str(values[0])) }, () => {})`,
  `const values = [1n, 2n];
   f.doubleBranch(true, () => { f.printString(str(values[0])) }, () => {})`
]
const valid = [
  `f.doubleBranch(true, () => { const values = [1n, 2n]; f.printString(str(values[0])); f.printString(str(values.length)); return }, () => {});
   f.printString('tail')`,
  `${query} f.doubleBranch(true, () => {
     f.destroyEntity(f.getCorrespondingValueFromList(targets, 0n));
     f.printString(str(f.getListLength(targets)))
   }, () => {})`,
  `${query} if (true) { f.destroyEntity(targets[0]); f.printString(str(targets.length)) }`,
  `${query} f.doubleBranch(true, () => f.destroyEntity(targets[0]), () => {})`,
  `${query} f.doubleBranch(true, () => { const targets = [1n]; f.printString(str(targets[0])) }, () => {})`,
  `f.doubleBranch(true, () => {
     const values = (() => [1n, 2n])(); f.printString(str(values[0]))
   }, () => {})`
]

function compile(name: string, body: string, id = 1073742450) {
  const file = path.join(dir, `${name}.ts`)
  fs.writeFileSync(
    file,
    `import { g } from 'genshin-ts/runtime/core';
     g.server({id:${id}}).on('whenEntityIsCreated', (_evt,f) => { ${body} })`
  )
  return compileTsToGs({
    cfgDir: root,
    cfg: { compileRoot: '.', entries: [file], outDir: path.join(dir, 'out') },
    programCache: cache
  })
}

for (const lang of ['en-US', 'zh-CN'] as const) {
  initCliI18n(lang)
  for (const [index, body] of invalid.entries()) {
    await assert.rejects(
      compile(`invalid-${lang}-${index}`, body),
      lang === 'en-US' ? /f\.doubleBranch.*regular if\/else/ : /f\.doubleBranch.*普通 if\/else/
    )
  }
}
initCliI18n('en-US')
for (const [index, body] of valid.entries()) {
  const result = await compile(`valid-${index}`, body, 1073742450 + index)
  assert.doesNotMatch(fs.readFileSync(result.entryOutFiles[0], 'utf8'), /gsts\.f\.return\(/)
  await import(pathToFileURL(result.entryOutFiles[0]).href)
}
const documents = buildServerGraphRegistriesIRDocuments()
assert.equal(documents.length, valid.length)
const protoPath = path.join(
  root,
  'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto'
)
for (const document of documents) {
  assert.ok(irToGia(document, { protoPath }).length > 0)
}
console.log('[ok] native branch list reads fail during TS compilation with actionable diagnostics')
console.log('[ok] native API, plain arrays, expression callbacks, shadowing and if/else emit GIA')
