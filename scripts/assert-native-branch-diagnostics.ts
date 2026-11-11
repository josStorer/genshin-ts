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
const graphValues = `${query} const n = f.getListLength(targets); const cond = f.greaterThan(n, 0n);`
type Probe = { body: string; event?: string; prelude?: string }
const invalid: (string | Probe)[] = [
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
   f.doubleBranch(true, () => { f.printString(str(values[0])) }, () => {})`,
  {
    event: 'whenHpIsRecovered',
    body: 'f.doubleBranch(true, () => { f.printString(str(_evt.recoverTagList.length)) }, () => {})'
  },
  {
    event: 'whenHpIsRecovered',
    body: 'f.doubleBranch(true, () => { f.printString(_evt.recoverTagList[0]) }, () => {})'
  },
  {
    prelude: `function gstsServerProbe(xs: entity[]) {
      gsts.f.doubleBranch(true, () => { gsts.f.destroyEntity(xs[0]) }, () => {})
    }`,
    body: `${query} gstsServerProbe(targets)`
  },
  `${query} const n = f.getListLength(targets);
   f.doubleBranch(true, () => { f.printString(str(n + 1n)) }, () => {})`,
  `${query} const n = f.getListLength(targets);
   f.doubleBranch(true, () => { f.printString(str(n > 0n)) }, () => {})`,
  `${query} f.doubleBranch(true, () => {
     const k = f.getListLength(targets); f.printString(str(k + 1n))
   }, () => {})`,
  `${query} const n = f.getListLength(targets);
   f.doubleBranch(true, () => { f.printString(str(-n)) }, () => {})`,
  `${query} let n = f.getListLength(targets);
   f.doubleBranch(true, () => { n += 1n }, () => {})`,
  `${query} let n = f.getListLength(targets);
   f.doubleBranch(true, () => { n++ }, () => {})`,
  `${query} f.doubleBranch(true, () => {
     let k = 0n; k = f.getListLength(targets); f.printString(str(k + 1n))
   }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => { if (cond) f.printString('yes') }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => { f.printString(cond ? 'a' : 'b') }, () => {})`,
  graphValues + 'f.doubleBranch(true, () => { f.printString(`n=${n}`) }, () => {})',
  `${graphValues} f.doubleBranch(true, () => { for (const t of targets) f.destroyEntity(t) }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => { targets.forEach((t) => f.destroyEntity(t)) }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => {
     f.doubleBranch(true, () => { f.destroyEntity(targets[0]) }, () => {})
   }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => { while (cond) f.printString('yes') }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => { if (f.greaterThan(n, 0n)) f.printString('yes') }, () => {})`,
  `${query} f.doubleBranch(true, () => {
     const k = f.getListLength(targets);
     f.doubleBranch(true, () => { if (k) f.printString('yes') }, () => {})
   }, () => {})`,
  `${query} const n = f.getCorrespondingValueFromList(targets, 0n);
   f.doubleBranch(true, () => { const xs = [n]; f.destroyEntity(xs[0]) }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => {
     const obj = { value: n }; f.printString(str(obj.value + 1n))
   }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => {
     const obj = { n }; f.printString(str(obj.n + 1n))
   }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => {
     const obj = { nested: { values: [n] } }; f.printString(str(obj.nested.values[0]))
   }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => { f.printString(String(n)) }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => { f.printString(str(Number(n))) }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => { f.printString(JSON.stringify({ n })) }, () => {})`,
  `${graphValues} f.doubleBranch(true, () => { f.printString(str(Math.abs(float(n)))) }, () => {})`,
  {
    prelude: 'const stringify = JSON.stringify;',
    body: `${graphValues} f.doubleBranch(true, () => { f.printString(stringify(n)) }, () => {})`
  }
]
const valid: (string | Probe)[] = [
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
   }, () => {})`,
  {
    prelude: 'const OFFSET = 2n; const VALUES = [1n, 2n];',
    body: `f.doubleBranch(true, () => {
      f.printString(str(OFFSET + 1n)); f.printString(str(VALUES[0]));
      f.printString(str(VALUES.length))
    }, () => {})`
  },
  `${query} const n = f.getListLength(targets);
   f.doubleBranch(true, () => { const n = 2n; f.printString(str(n + 1n)) }, () => {})`,
  `f.doubleBranch(true, () => {
     let n = 2n; n += 1n; n++; f.printString(str(-n)); f.printString(str(n > 0n))
   }, () => {})`,
  `${query} f.multipleBranches(1n, { 1: () => {
     f.destroyEntity(targets[0]); f.printString(str(targets.length + 1n))
   } })`,
  `${query} const n = f.getListLength(targets);
   f.doubleBranch(true, () => f.printString(str(n + 1n)), () => {})`,
  `${graphValues} f.doubleBranch(true, () => { f.printString(raw(cond ? 'a' : 'b')) }, () => {})`,
  `${query} f.doubleBranch(true, () => {
     const values = [1n];
     f.doubleBranch(true, () => {
       f.printString(str(values[0]));
       f.destroyEntity(f.getCorrespondingValueFromList(targets, 0n))
     }, () => {})
   }, () => {})`,
  {
    event: 'whenHpIsRecovered',
    body: `f.doubleBranch(true, () => {
      const tags = (_evt.recoverTagList);
      let count = f.getListLength(tags);
      f.printString(str(count))
    }, () => {})`
  },
  `${graphValues} f.doubleBranch(cond, () => {
     f.printString(str(f.getListLength(f.assemblyList([n, n]))))
   }, () => {})`,
  `${graphValues} f.doubleBranch(cond, () => {
     const xs = [n, n]; f.printString(str(f.getListLength(f.assemblyList(xs))))
   }, () => {})`,
  {
    prelude: 'function readValue(input: { value: bigint }) { return input.value }',
    body: `${graphValues} f.doubleBranch(cond, () => { f.printString(str(readValue({ value: n }))) }, () => {})`
  },
  `${graphValues} f.doubleBranch(cond, () => {
     const obj = { n }; f.printString(str(obj.n));
     f.printString(str(f.getListLength(list('int', [n, n]))))
   }, () => {})`,
  {
    prelude: 'function String(value: bigint) { return str(value) }',
    body: `${graphValues} f.doubleBranch(cond, () => { f.printString(String(n)) }, () => {})`
  },
  {
    prelude:
      'function readValues(input: { nested: { values: bigint[] } }) { return input.nested.values }',
    body: `${graphValues} f.doubleBranch(cond, () => {
      f.printString(str(f.getListLength(f.assemblyList(readValues({ nested: { values: [n, n] } })))))
    }, () => {})`
  },
  {
    prelude: 'function gstsServerIdentity(value: bigint) { return value }',
    body: `${graphValues} f.doubleBranch(cond, () => { print(str(gstsServerIdentity(n))) }, () => {})`
  },
  {
    prelude: 'const Math = { abs: (value: bigint) => value };',
    body: `${graphValues} f.doubleBranch(cond, () => { f.printString(str(Math.abs(n))) }, () => {})`
  }
]

function compile(name: string, input: string | Probe, id = 1073742450) {
  const {
    body,
    event = 'whenEntityIsCreated',
    prelude = ''
  } = typeof input === 'string' ? { body: input } : input
  const file = path.join(dir, `${name}.ts`)
  fs.writeFileSync(
    file,
    `import { g } from 'genshin-ts/runtime/core';
     ${prelude}
     g.server({id:${id}}).on('${event}', (_evt,f) => { ${body} })`
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
    await assert.rejects(compile(`invalid-${lang}-${index}`, body), (error: unknown) => {
      assert.ok(error instanceof Error)
      assert.match(
        error.message,
        lang === 'en-US'
          ? /f\.doubleBranch block callback.*regular if\/else/
          : /f\.doubleBranch.*块回调.*普通 if\/else/
      )
      assert.match(
        error.message,
        /at invalid-.*\.ts:\d+:\d+ \((ElementAccessExpression|PropertyAccessExpression|BinaryExpression|PrefixUnaryExpression|PostfixUnaryExpression|IfStatement|ConditionalExpression|TemplateSpan|ForOfStatement|CallExpression|WhileStatement)\)/
      )
      return true
    })
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
console.log(
  '[ok] native branch graph operations fail during TS compilation with actionable diagnostics'
)
console.log('[ok] native API, plain arrays, expression callbacks, shadowing and if/else emit GIA')
