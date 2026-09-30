import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  emitIrJsonForEntries,
  resolveIrOutputPath
} from '../dist/src/compiler/gs_to_ir_json_transform/index.js'
import { writeGiaFromIrJsonFile } from '../dist/src/compiler/ir_to_gia_pipeline.js'
import { compileTsToGs } from '../dist/src/compiler/ts_to_gs_pipeline.js'
import { initCliI18n } from '../dist/src/i18n/index.js'

initCliI18n('en-US')
const tempDir = fs.mkdtempSync(path.join(import.meta.dirname, '..', '.gsts-graph-output-'))
try {
  fs.writeFileSync(
    path.join(tempDir, 'entry.ts'),
    `
import { g } from 'genshin-ts/runtime/core'
g.server({ id: 1073742799, variables: { dynamic: true } }).on('whenEntityIsCreated', (_evt, f) => {
  if (false) { f.printString('dead') } else { f.printString('live') }
  for (let i = 0n; i < 3n; i++) {
    if (true) { f.printString('loop') } else { f.printString('dead-loop') }
  }
  if (f.get('dynamic')) { f.printString('dynamic-yes') } else { f.printString('dynamic-no') }
  f.printString('tail')
})
`
  )
  const result = await compileTsToGs({
    cfgDir: tempDir,
    cfg: { compileRoot: '.', entries: ['entry.ts'], outDir: './out' }
  })
  const irPath = resolveIrOutputPath(result.entryOutFiles[0])
  const compile = async (enabled) => {
    await emitIrJsonForEntries(result.entryOutFiles, {
      cwd: tempDir,
      lang: 'en-US',
      moduleFiles: result.moduleOutFiles,
      moduleRoot: result.outDir,
      runtimeOptions: { precompileExpression: enabled, removeUnusedNodes: true }
    })
    return JSON.parse(fs.readFileSync(irPath, 'utf8'))[0]
  }
  const baseline = await compile(false)
  const optimized = await compile(true)
  assert.equal(baseline.nodes.filter((node) => node.type === 'double_branch').length, 3)
  assert.equal(optimized.nodes.filter((node) => node.type === 'double_branch').length, 1)
  const text = optimized.nodes
    .filter((node) => node.type === 'print_string')
    .map((node) => node.args[0].value)
  assert.deepEqual(text, ['live', 'loop', 'dynamic-yes', 'dynamic-no', 'tail'])
  const loop = optimized.nodes.find((node) => node.type === 'finite_loop')
  assert.deepEqual(loop.next.map((edge) => edge.source_index ?? 0).sort(), [0, 1])
  const ids = new Set(optimized.nodes.map((node) => node.id))
  for (const node of optimized.nodes) {
    for (const edge of node.next ?? [])
      assert.ok(ids.has(typeof edge === 'number' ? edge : edge.node_id))
    for (const arg of node.args ?? [])
      if (arg?.type === 'conn') assert.ok(ids.has(arg.value.node_id))
  }
  const outputs = writeGiaFromIrJsonFile(irPath)
  assert.equal(outputs.length, 1)
  assert.ok(fs.statSync(outputs[0].giaPath).size > 0)
  console.log(
    `[ok] TS -> IR -> GIA: ${baseline.nodes.length} -> ${optimized.nodes.length} nodes; runtime branch and loop exits retained`
  )
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true })
}
