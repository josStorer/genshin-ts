import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { decode_gia_file } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/decode.js'

const dir = `.tmp/graph-features-cli-${process.pid}`
const config = `gsts.graph-features-cli-${process.pid}.config.ts`
fs.mkdirSync(dir, { recursive: true })
const run = (args: string[]) => {
  const result = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 120_000 })
  if (result.error) throw result.error
  return { code: result.status, output: result.stdout + result.stderr }
}
const compile = (entries: string[], out: string, aggregate = true) => {
  fs.writeFileSync(
    config,
    `export default ${JSON.stringify({
      compileRoot: '.',
      entries,
      outDir: out,
      options: {
        optimize: {
          precompileExpression: false,
          removeUnusedNodes: false,
          timerDispatchAggregate: aggregate
        }
      }
    })}`
  )
  const result = run(['bin/gsts.mjs', '-c', config, '--noinject', '--lang', 'en'])
  fs.writeFileSync(`${out}.log`, result.output)
  return result
}
const proto =
  'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto'
try {
  for (const aggregate of [true, false]) {
    const out = `${dir}/${aggregate ? 'aggregate' : 'separate'}`
    const result = compile(
      [
        'tests/manual/graph-features/exposed-variables.ts',
        'tests/manual/graph-features/timer-names.ts'
      ],
      out,
      aggregate
    )
    assert.equal(result.code, 0, result.output)
    const checks = run([
      '--import',
      'tsx',
      'scripts/nodegraph/assert-graph-features.ts',
      `${out}/tests/manual/graph-features`
    ])
    assert.equal(checks.code, 0, checks.output)
  }
  const negative = `${dir}/cross-event.ts`
  fs.writeFileSync(
    negative,
    `import { g } from 'genshin-ts/runtime/core'
let shared = 0n
g.server({ id: 1073741930 })
  .on('whenEntityIsCreated', (_evt, f) => { shared = f.queryGameTimeElapsed() })
  .on('whenCharacterRevives', () => { console.log(str(shared)) })
`
  )
  const rejected = compile([negative], `${dir}/negative`)
  assert.notEqual(rejected.code, 0)
  assert.match(rejected.output, /data connection crosses event handlers/)
  assert.match(rejected.output, /whenEntityIsCreated.*whenCharacterRevives/)
  assert.match(rejected.output, /cross-event.*:\d+:\d+/)
  // A module variable read in a timer callback is not captured; only locals go through capture dictionaries.
  const negativeTimer = `${dir}/cross-event-timer.ts`
  fs.writeFileSync(
    negativeTimer,
    `import { g } from 'genshin-ts/runtime/core'
let shared = 0n
g.server({ id: 1073741932 }).on('whenEntityIsCreated', (_evt, f) => {
  shared = f.queryGameTimeElapsed()
  setTimeout(() => { console.log(str(shared)) }, 200)
})
`
  )
  const rejectedTimer = compile([negativeTimer], `${dir}/negative-timer`)
  assert.notEqual(rejectedTimer.code, 0)
  assert.match(rejectedTimer.output, /whenEntityIsCreated.*whenTimerIsTriggered/)
  assert.match(rejectedTimer.output, /data connection crosses event handlers/)
  const merged = [0, 1].map((index) => {
    const file = `${dir}/merged-${index}.ts`
    fs.writeFileSync(
      file,
      `import { g } from 'genshin-ts/runtime/core'
g.server({ id: 1073741931 }).on('whenEntityIsCreated', () => {
  setTimeout(() => print('merged ${index}'), 1000)
})
`
    )
    return file
  })
  const mergedResult = compile(merged, `${dir}/merged`)
  assert.equal(mergedResult.code, 0, mergedResult.output)
  const mergedFiles = fs
    .readdirSync(`${dir}/merged`, { recursive: true })
    .filter((name) => String(name).endsWith('.gia'))
  assert.equal(mergedFiles.length, 1, 'Files with the same graph ID merge into one GIA')
  const names = new Set<string>()
  for (const file of mergedFiles) {
    const graph = decode_gia_file(path.join(dir, 'merged', String(file)), proto)
    const text = JSON.stringify(graph)
    for (const name of text.match(/__gsts_timeout_\d+_\d+_\d{5}/g) ?? []) names.add(name)
  }
  assert.equal(names.size, 2, 'Merged files keep distinct call-site numbers')
  for (const name of names) assert.ok(name.endsWith('_41931'), name)

  // Merged files share gsts' own variables (stage entity, timer state); user variables still clash.
  fs.writeFileSync(
    `${dir}/shared-helper.ts`,
    `export function gstsServerPing(value: bigint) {
  setTimeout(() => print(str(value)), 1000)
}
`
  )
  const shared = [0, 1].map((index) => {
    const file = `${dir}/shared-${index}.ts`
    fs.writeFileSync(
      file,
      `import { g } from 'genshin-ts/runtime/core'
import { gstsServerPing } from './shared-helper'
g.server({ id: 1073741933 }).on('whenEntityIsCreated', (_evt, f) => {
  stage.set('probe_${index}', 1n)
  gstsServerPing(f.queryGameTimeElapsed())
})
`
    )
    return file
  })
  const sharedResult = compile(shared, `${dir}/shared`)
  assert.equal(sharedResult.code, 0, sharedResult.output)
  const sharedGia = fs
    .readdirSync(`${dir}/shared`, { recursive: true })
    .filter((name) => String(name).endsWith('.gia'))
  assert.equal(sharedGia.length, 1, 'Files with the same graph ID merge into one GIA')
  const sharedVariables = decode_gia_file(
    path.join(dir, 'shared', String(sharedGia[0])),
    proto
  ).graph.graph!.inner.graph.graphValues.map((v) => v.name)
  assert.equal(sharedVariables.filter((name) => name === '__gsts_stage').length, 1)
  const clash = [0, 1].map((index) => {
    const file = `${dir}/clash-${index}.ts`
    fs.writeFileSync(
      file,
      `import { g } from 'genshin-ts/runtime/core'
g.server({ id: 1073741934, variables: { score: 0n } }).on('whenEntityIsCreated', (_evt, f) => {
  f.set('score', ${index}n)
})
`
    )
    return file
  })
  const clashResult = compile(clash, `${dir}/clash`)
  assert.notEqual(clashResult.code, 0)
  assert.match(clashResult.output, /duplicate variables by name after merge \(1\)\.\r?\n- score: /)

  // g is recognised by what it is, not by its name.
  const entries = {
    alias: `import { g as graph } from 'genshin-ts/runtime/core'
graph.server({ id: 1073741935 }).on('whenEntityIsCreated', () => { print('alias') })
`,
    namespace: `import * as core from 'genshin-ts/runtime/core'
core.g.server({ id: 1073741936 }).on('whenEntityIsCreated', () => { print('namespace') })
`,
    lookalike: `const g = { server: (_: { id: number }) => ({ on: (_name: string, _fn: () => void) => 0 }) }
export const notAGraph = g.server({ id: 1073741937 }).on('whenEntityIsCreated', () => {})
`
  }
  const importForms = Object.entries(entries).map(([name, code]) => {
    fs.writeFileSync(`${dir}/${name}.ts`, code)
    return `${dir}/${name}.ts`
  })
  const importResult = compile(importForms, `${dir}/imports`)
  assert.equal(importResult.code, 0, importResult.output)
  const importGia = fs
    .readdirSync(`${dir}/imports`, { recursive: true })
    .map(String)
    .filter((name) => name.endsWith('.gia'))
    .map((name) => path.basename(name))
    .sort()
  assert.deepEqual(importGia, ['alias.gia', 'namespace.gia'])
  const defaultEntry = `${dir}/default.ts`
  fs.writeFileSync(
    defaultEntry,
    `import { g } from 'genshin-ts/runtime/core'
g.server().on('whenEntityIsCreated', () => { setTimeout(() => print('default'), 1000) })
`
  )
  const defaultResult = compile([defaultEntry], `${dir}/default`)
  assert.equal(defaultResult.code, 0, defaultResult.output)
  const defaultFiles = fs
    .readdirSync(`${dir}/default`, { recursive: true })
    .filter((name) => String(name).endsWith('.gia'))
  assert.equal(defaultFiles.length, 1)
  assert.match(
    JSON.stringify(decode_gia_file(path.join(dir, 'default', String(defaultFiles[0])), proto)),
    /__gsts_timeout_0_0_41825/
  )
  console.log(
    '[ok] Graph features CLI: exposed types, both timer dispatch modes, cross-event rejection, merged files, shared gsts variables, import forms of g and default graph ID'
  )
} finally {
  fs.rmSync(config, { force: true })
  // Keep outputs and diagnostics available for inspection; never inject into a save.
}
