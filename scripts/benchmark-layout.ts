import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { pathToFileURL } from 'node:url'

import { buildExecutionGraph, layoutPositions } from '../src/compiler/ir_to_gia_transform/layout.js'
import type { IRNode } from '../src/compiler/ir_to_gia_transform/types.js'
import type { Argument } from '../src/runtime/IR.js'

function syntheticGraph(events: number, chain: number, inputs: number) {
  const nodes: IRNode[] = []
  let id = 1
  const connection = (nodeId: number): Argument => ({
    type: 'conn',
    value: { node_id: nodeId, index: 0, type: 'int' }
  })
  for (let event = 0; event < events; event++) {
    let last: IRNode = { id: id++, type: 'when_entity_is_created', next: [], args: [] }
    nodes.push(last)
    for (let index = 0; index < chain; index++) {
      const node: IRNode = { id: id++, type: 'print_string', args: [], next: [] }
      last.next = [node.id]
      nodes.push(node)
      last = node
      for (let input = 0; input < inputs; input++) {
        const middle: IRNode = { id: id++, type: 'addition', args: [] }
        const leaf: IRNode = {
          id: id++,
          type: 'addition',
          args: [
            { type: 'int', value: 1 },
            { type: 'int', value: 2 }
          ]
        }
        middle.args = [connection(leaf.id), connection(leaf.id)]
        node.args!.push(connection(middle.id))
        nodes.push(middle, leaf)
      }
    }
  }
  return nodes
}

// An optional old layout module also verifies every coordinate, not just the elapsed time.
const baseline = process.argv[2]
  ? (
      (await import(pathToFileURL(path.resolve(process.argv[2])).href)) as {
        layoutPositions: typeof layoutPositions
      }
    ).layoutPositions
  : undefined
const warmup = syntheticGraph(1, 30, 2)
layoutPositions(warmup, buildExecutionGraph(warmup))
for (const [events, chain, inputs] of [
  [20, 30, 2],
  [60, 30, 2],
  [120, 30, 2],
  [40, 120, 3]
]) {
  const nodes = syntheticGraph(events, chain, inputs)
  const graph = buildExecutionGraph(nodes)
  let baselineMs: number | undefined
  let expected: ReturnType<typeof layoutPositions> | undefined
  if (baseline) {
    const started = performance.now()
    expected = baseline(nodes, graph)
    baselineMs = performance.now() - started
  }
  const samples: number[] = []
  let coordinateHash = ''
  for (let run = 0; run < 3; run++) {
    const started = performance.now()
    const positions = layoutPositions(nodes, graph)
    samples.push(performance.now() - started)
    if (expected) assert.deepEqual(positions, expected)
    coordinateHash = createHash('sha256')
      .update(JSON.stringify([...positions]))
      .digest('hex')
  }
  console.log(
    JSON.stringify({
      nodes: nodes.length,
      events,
      chain,
      inputs,
      baselineMs,
      medianMs: [...samples].sort((a, b) => a - b)[1],
      samples,
      coordinateHash
    })
  )
}
