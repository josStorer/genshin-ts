import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { analyzeGraphDocuments } from '../src/compiler/graph_analysis.js'
import { irToGia } from '../src/compiler/ir_to_gia_transform/index.js'
import { buildExecutionGraph, layoutPositions } from '../src/compiler/ir_to_gia_transform/layout.js'
import { initCliI18n } from '../src/i18n/index.js'
import { DEFAULT_GIA_PROTO } from '../src/injector/proto.js'
import {
  buildServerGraphRegistriesIRDocuments,
  g,
  type ServerExecutionFlowFunctionsWithVars
} from '../src/runtime/core.js'
import type { ExecutionFlow } from '../src/runtime/execution_flow_types.js'
import { foldLiteralBranches } from '../src/runtime/fold_literal_branches.js'
import type { IRDocument, ServerNode } from '../src/runtime/IR.js'
import { setRuntimeOptions } from '../src/runtime/runtime_config.js'
import { bool } from '../src/runtime/value.js'
import { decode_gia_file } from '../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/decode.js'

initCliI18n('en-US')
const base = 1073742600
const definitions: Array<{ name: string; expected: string[] }> = []
function define(
  name: string,
  expected: string[],
  handler: (
    evt: unknown,
    f: ServerExecutionFlowFunctionsWithVars<{ dynamic: boolean }, 'beyond'>
  ) => void
) {
  const id = base + definitions.length
  definitions.push({ name, expected })
  g.server({ id, name, variables: { dynamic: true } }).on('whenEntityIsCreated', handler)
}

define('false', ['live'], (_evt, f) => {
  f.doubleBranch(
    false,
    () => f.printString('dead'),
    () => f.printString('live')
  )
})
define('nested-join', ['nested', 'tail'], (_evt, f) => {
  f.doubleBranch(
    true,
    () => {
      f.doubleBranch(
        false,
        () => f.printString('dead'),
        () => f.printString('nested')
      )
    },
    () => f.printString('dead')
  )
  f.printString('tail')
})
define('empty-join', ['tail'], (_evt, f) => {
  f.doubleBranch(
    false,
    () => f.printString('dead'),
    () => {}
  )
  f.printString('tail')
})
define('loop-pins', ['body', 'body', 'body', 'done'], (_evt, f) => {
  f.finiteLoop(0n, 2n, () => {
    f.doubleBranch(
      true,
      () => f.printString('body'),
      () => f.printString('dead')
    )
  })
  f.doubleBranch(
    false,
    () => f.printString('dead'),
    () => f.printString('done')
  )
})
define('loop-break', ['done'], (_evt, f) => {
  f.finiteLoop(0n, 2n, (_value, stop) => {
    f.doubleBranch(true, stop, () => f.printString('dead'))
  })
  f.printString('done')
})
define('dynamic', ['yes', 'tail'], (_evt, f) => {
  f.doubleBranch(
    f.get('dynamic'),
    () => f.printString('yes'),
    () => f.printString('no')
  )
  f.printString('tail')
})
define('dead-data', ['live'], (_evt, f) => {
  f.doubleBranch(
    false,
    () => f.printString(f.getCustomVariable(f.getSelfEntity(), 'dead').asType('str')),
    () => f.printString('live')
  )
})

const options = (precompileExpression: boolean, removeUnusedNodes = true) =>
  setRuntimeOptions({ optimize: { precompileExpression, removeUnusedNodes } })
options(false)
const before = buildServerGraphRegistriesIRDocuments()
options(true)
const after = buildServerGraphRegistriesIRDocuments()
options(false)
assert.deepEqual(
  buildServerGraphRegistriesIRDocuments(),
  before,
  'optimization must not mutate registries'
)
options(true, false)
assert.deepEqual(
  buildServerGraphRegistriesIRDocuments(),
  before,
  'removeUnusedNodes=false preserves branches'
)
options(true)

// A small trace interpreter checks control-flow semantics, including the loop-complete output.
function trace(ir: IRDocument, dynamic = true) {
  const nodes = new Map((ir.nodes ?? []).map((node) => [node.id, node]))
  const output: string[] = []
  let budget = 200
  const follow = (node: ServerNode, outputIndex: number): boolean => {
    for (const edge of node.next ?? []) {
      if ((typeof edge === 'number' ? 0 : (edge.source_index ?? 0)) !== outputIndex) continue
      if (visit(typeof edge === 'number' ? edge : edge.node_id)) return true
    }
    return false
  }
  const visit = (id: number): boolean => {
    assert.ok(--budget > 0, 'unexpected execution cycle')
    const node = nodes.get(id)!
    assert.ok(node, `dangling execution target ${id}`)
    if (node.type === 'break_loop') return true
    if (node.type === 'print_string') {
      const arg = node.args?.[0]
      assert.equal(arg?.type, 'str')
      output.push(String(arg && 'value' in arg ? arg.value : ''))
    } else if (node.type === 'double_branch') {
      const condition = node.args?.[0]
      const value = condition?.type === 'bool' ? condition.value : dynamic
      return follow(node, value ? 0 : 1)
    } else if (node.type === 'finite_loop') {
      const [start, end] = node.args ?? []
      assert.equal(start?.type, 'int')
      assert.equal(end?.type, 'int')
      for (
        let i = Number((start as { value: unknown }).value);
        i <= Number((end as { value: unknown }).value);
        i++
      ) {
        if (follow(node, 0)) break
      }
      return follow(node, 1)
    }
    return follow(node, 0)
  }
  for (const node of nodes.values()) if (node.type === 'when_entity_is_created') visit(node.id)
  return output
}

for (let i = 0; i < definitions.length; i++) {
  const { name, expected } = definitions[i]
  assert.deepEqual(trace(before[i]), expected, `${name}: baseline`)
  assert.deepEqual(trace(after[i]), expected, `${name}: optimized`)
  if (name !== 'dynamic')
    assert.ok(!after[i].nodes?.some((node) => node.type === 'double_branch'), name)
}
assert.deepEqual(trace(after[5], false), ['no', 'tail'])
assert.deepEqual(after[5], before[5], 'runtime-dependent conditions must not be folded')
assert.equal(before[0].nodes?.length, 4)
assert.equal(after[0].nodes?.length, 2)
assert.ok(!after[6].nodes?.some((node) => node.type === 'get_custom_variable'))

// Custom input/output indices survive bypassing; constant-only cycles are preserved.
const branch = (id: number) => ({
  id,
  type: 'exec' as const,
  nodeType: 'double_branch',
  args: [new bool(true)]
})
const customFlow: ExecutionFlow = {
  eventNode: { id: 1, type: 'event', nodeType: 'when_entity_is_created', args: [] },
  eventArgs: [],
  dataNodes: [],
  execContextStack: [],
  execNodes: [branch(2), branch(3)],
  edges: {
    1: [{ node_id: 2, source_index: 1, source_sub_index: 2 }],
    2: [3],
    3: [{ node_id: 4, target_index: 2, target_sub_index: 3 }]
  }
}
const originalEdges = globalThis.structuredClone(customFlow.edges)
assert.deepEqual(foldLiteralBranches(customFlow).edges[1], [
  {
    node_id: 4,
    source_index: 1,
    source_sub_index: 2,
    target_index: 2,
    target_sub_index: 3
  }
])
assert.deepEqual(customFlow.edges, originalEdges)
const cycle = { ...customFlow, edges: { 1: [2], 2: [3], 3: [2] } }
assert.deepEqual(foldLiteralBranches(cycle).edges, cycle.edges)

// Shared data trees, explicit anchors and tall dynamic nodes need a common occupancy map.
const conn = (id: number) => ({
  type: 'conn' as const,
  value: { node_id: id, index: 0, type: 'int' as const }
})
const layoutNodes: ServerNode[] = [
  { id: 1, type: 'event', next: [2, 3] },
  { id: 2, type: 'exec', args: [conn(4), conn(5)], next: [7] },
  { id: 3, type: 'exec', args: [conn(5)], next: [7] },
  { id: 4, type: 'data', args: Array.from({ length: 12 }, () => conn(6)) },
  { id: 5, type: 'data', args: [conn(6)] },
  { id: 6, type: 'data' },
  { id: 7, type: 'exec' },
  { id: 8, type: 'detached', position: [0, 0] },
  { id: 9, type: 'event', position: [2400, 5000], next: [10] },
  { id: 10, type: 'exec' }
]
const savedNodes = globalThis.structuredClone(layoutNodes)
const positions = layoutPositions(layoutNodes, buildExecutionGraph(layoutNodes))
assert.equal(positions.size, layoutNodes.length)
assert.deepEqual(layoutNodes, savedNodes, 'layout does not modify IR')
assert.deepEqual(positions.get(8), [0, 0])
assert.deepEqual(positions.get(9), [2400, 5000])
assert.deepEqual(layoutPositions(layoutNodes, buildExecutionGraph(layoutNodes)), positions)
for (let i = 0; i < layoutNodes.length; i++) {
  const a = layoutNodes[i]
  const [ax, ay] = positions.get(a.id)!
  for (const b of layoutNodes.slice(i + 1)) {
    const [bx, by] = positions.get(b.id)!
    assert.ok(
      !(
        ax < bx + 300 &&
        ax + 300 > bx &&
        ay < by + 200 + (b.args?.length ?? 0) * 40 &&
        ay + 200 + (a.args?.length ?? 0) * 40 > by
      ),
      `overlapping footprints: ${a.id}, ${b.id}`
    )
  }
}

const report = analyzeGraphDocuments(after)
assert.equal(report.graphs[0].totals.nodes, 2)
assert.equal(report.graphs[0].totals.flowConnections, 1)
assert.equal(report.graphs[0].review.branches.length, 0)
assert.equal(report.graphs[5].review.branches.length, 1)
const sharedReport = analyzeGraphDocuments({ ...after[0], nodes: layoutNodes }).graphs[0]
assert.deepEqual(sharedReport.review.sharedDataOutputs, [
  { nodeId: 5, outputIndex: 0, outputSubIndex: 0, consumerNodeIds: [2, 3] },
  { nodeId: 6, outputIndex: 0, outputSubIndex: 0, consumerNodeIds: [4, 5] }
])
const inventory: ServerNode[] = [
  { id: 0, type: 'get_local_variable' },
  { id: 1, type: 'finite_loop', next: [0] },
  { id: 2, type: 'list_iteration_loop' },
  { id: 3, type: 'set_local_variable', args: [null, { type: 'int_list', value: [1, 2] }] },
  {
    id: 4,
    type: 'set_local_variable',
    args: [null, { type: 'conn', value: { node_id: 0, index: 1, type: 'int_list' } }]
  },
  { id: 5, type: 'assembly_list', args: [conn(0)] },
  { id: 6, type: 'start_timer' }
]
const inventoryReport = analyzeGraphDocuments({ ...after[0], nodes: inventory }).graphs[0]
assert.deepEqual(inventoryReport.review.loops, [1, 2])
assert.deepEqual(inventoryReport.review.collectionLocalWrites, [3, 4])
assert.deepEqual(inventoryReport.review.localVariableReads, [0])
assert.deepEqual(inventoryReport.review.listAssembly, [5])
assert.deepEqual(inventoryReport.review.timerStarts, [6])
assert.deepEqual(
  inventoryReport.review.sharedDataOutputs,
  [],
  'different output pins are not shared evaluations'
)
for (const invalid of [
  null,
  [],
  {},
  { ...after[0], nodes: [layoutNodes[0]] },
  { ...after[0], nodes: [layoutNodes[0], layoutNodes[0]] }
]) {
  assert.throws(() => analyzeGraphDocuments(invalid))
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsts-graph-output-'))
try {
  for (let i = 0; i < after.length; i++) {
    const file = path.join(tempDir, `${i}.gia`)
    fs.writeFileSync(file, irToGia(after[i], { protoPath: DEFAULT_GIA_PROTO }))
    const decoded = decode_gia_file(file, undefined, true)
    assert.equal(decoded.graph.graph?.inner.graph.nodes?.length, after[i].nodes?.length)
  }
  const irPath = path.join(tempDir, 'input.json')
  fs.writeFileSync(irPath, JSON.stringify(after))
  const cli = spawnSync(process.execPath, ['bin/gsts.mjs', '--lang', 'en-US', 'analyze', irPath], {
    cwd: process.cwd(),
    encoding: 'utf8'
  })
  assert.equal(cli.status, 0, cli.stderr + cli.stdout)
  assert.deepEqual(JSON.parse(cli.stdout), report)
  assert.equal(fs.readdirSync(tempDir).filter((file) => file.endsWith('.gia')).length, after.length)
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true })
}
console.log(
  '[ok] literal branches 4 -> 2 nodes; trace equivalence, loop pins, GIA round trips, layout anchors/footprints and analysis CLI'
)
