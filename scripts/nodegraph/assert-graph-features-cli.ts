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
    // The editor cannot fill in exposed variables that hold entities, so the build warns about them.
    assert.match(
      result.output,
      /node graph 1073741920 exposes target, targets, entities, prefabKeys, entityLists, which hold entities/
    )
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

  // Merged files share the stage entity variable; a timer in a shared function and user variables clash.
  const shared = [0, 1].map((index) => {
    const file = `${dir}/shared-${index}.ts`
    fs.writeFileSync(
      file,
      `import { g } from 'genshin-ts/runtime/core'
g.server({ id: 1073741933 }).on('whenEntityIsCreated', () => {
  stage.set('probe_${index}', 1n)
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
  fs.writeFileSync(
    `${dir}/shared-timer.ts`,
    `export function gstsServerTick() {
  setInterval(() => print('tick'), 1000)
}
`
  )
  const sharedTimer = [0, 1].map((index) => {
    const file = `${dir}/shared-timer-${index}.ts`
    fs.writeFileSync(
      file,
      `import { g } from 'genshin-ts/runtime/core'
import { gstsServerTick } from './shared-timer'
g.server({ id: 1073741938 }).on('whenEntityIsCreated', () => {
  gstsServerTick()
})
`
    )
    return file
  })
  const sharedTimerResult = compile(sharedTimer, `${dir}/shared-timer`)
  assert.notEqual(sharedTimerResult.code, 0)
  assert.match(
    sharedTimerResult.output,
    /shared-timer-0\.ts, \S*shared-timer-1\.ts all start the same setInterval \(__gsts_interval_\d+,/
  )
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
  // A 0-second timer never fires in game: a missing or literal delay below 10ms becomes 10ms,
  // while a delay computed at run time stays as it is.
  const delayEntry = `${dir}/delay.ts`
  fs.writeFileSync(
    delayEntry,
    `import { g } from 'genshin-ts/runtime/core'
g.server({ id: 1073741932 }).on('whenEntityIsCreated', (_evt, f) => {
  setTimeout(() => print('none'))
  setTimeout(() => print('zero'), 0)
  setInterval(() => print('tick'), 5)
  setTimeout(() => print('thirty'), 30)
  setTimeout(() => print('computed'), f.addition(1.5, 2.5))
})
`
  )
  const delayResult = compile([delayEntry], `${dir}/delay`)
  assert.equal(delayResult.code, 0, delayResult.output)
  const [delayIr] = JSON.parse(fs.readFileSync(`${dir}/delay/${dir}/delay.json`, 'utf8')) as Array<{
    nodes: { type: string; args?: { type: string; value: unknown }[] }[]
  }>
  assert.deepEqual(
    delayIr.nodes
      .filter((node) => node.type === 'division')
      .map((node) => (node.args?.[0].type === 'conn' ? 'computed' : node.args?.[0].value)),
    [10, 10, 10, 30, 'computed']
  )
  // A pooled timer name is read from the pool list after the index has moved on, so a kept
  // handle must come from a local variable set before that; otherwise clearTimeout stops the next slot.
  const handleEntry = `${dir}/pooled-handle.ts`
  fs.writeFileSync(
    handleEntry,
    `import { g } from 'genshin-ts/runtime/core'
g.server({ id: 1073741933 }).on('whenCharacterRevives', () => {
  const h = setTimeout(() => print('cancelled'), 1000)
  clearTimeout(h)
})
`
  )
  const handleResult = compile([handleEntry], `${dir}/pooled-handle`)
  assert.equal(handleResult.code, 0, handleResult.output)
  const [handleIr] = JSON.parse(
    fs.readFileSync(`${dir}/pooled-handle/${dir}/pooled-handle.json`, 'utf8')
  ) as Array<{ nodes: { id: number; type: string; args?: { type: string; value: unknown }[] }[] }>
  const stopName = handleIr.nodes.find((node) => node.type === 'stop_timer')?.args?.[1]
  assert.equal(stopName?.type, 'conn')
  assert.equal(
    handleIr.nodes.find((node) => node.id === (stopName?.value as { node_id: number }).node_id)
      ?.type,
    'get_local_variable'
  )
  console.log(
    '[ok] Graph features CLI: exposed types and the entity warning, both timer dispatch modes, cross-event rejection, merged files, shared stage variable, shared timer rejection, import forms of g, default graph ID, the minimum literal timer delay and pooled timer handles'
  )
} finally {
  fs.rmSync(config, { force: true })
  // Keep outputs and diagnostics available for inspection; never inject into a save.
}
