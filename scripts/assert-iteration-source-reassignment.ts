import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { compileTsToGs, createTsToGsProgramCache } from '../src/compiler/ts_to_gs_pipeline.js'
import { initCliI18n } from '../src/i18n/index.js'

const root = process.cwd()
const dir = path.join(root, '.tmp/iteration-source-reassignment')
fs.mkdirSync(dir, { recursive: true })
const cache = createTsToGsProgramCache()
const invalid = [
  'for (const value of values) { values = [9n] }',
  'for (const value of values) { if (value === 1n) values = [9n] }',
  'values.forEach(() => { values = [9n] })',
  'for (const value of values) { f.doubleBranch(true, () => { values = [9n] }, () => {}) }',
  'for (const value of values) { f.multipleBranches(1n, { 1: () => { values = [9n] } }) }',
  'values.forEach(() => { f.doubleBranch(true, () => { values = [9n] }, () => {}) })',
  'setTimeout(() => { let values = [1n]; values.forEach(() => { values = [9n] }) }, 100)'
]
const valid = [
  'for (const value of values) { values[0] = value; values.push(3n); values.pop() }',
  'for (const value of values) { print(str(value)) }; values = [9n]',
  'for (const value of values) { let values = [value]; values = [9n] }',
  'for (const value of values) { setTimeout(() => { values = [9n] }, 100) }'
]
for (const lang of ['en-US', 'zh-CN'] as const) {
  initCliI18n(lang)
  for (const [index, body] of [...invalid, ...valid].entries()) {
    const file = path.join(dir, `${lang}-${index}.ts`)
    fs.writeFileSync(
      file,
      `import { g } from 'genshin-ts/runtime/core';
      g.server({id:1073742420}).on('whenEntityIsCreated', (_evt,f) => {
        let values = [1n, 2n]; ${body}
      })`
    )
    const compile = () =>
      compileTsToGs({
        cfgDir: root,
        cfg: { compileRoot: '.', entries: [file], outDir: path.join(dir, 'out') },
        programCache: cache
      })
    if (index < invalid.length) {
      await assert.rejects(
        compile,
        lang === 'en-US'
          ? /Do not reassign values.*while iterating/
          : /遍历“values”时不要给它重新赋值/
      )
    } else await compile()
  }
}
console.log(
  '[ok] iteration rebind diagnostics: branches, callbacks, shadowing, timers and both languages'
)
