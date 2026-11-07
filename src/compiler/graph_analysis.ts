import type { IRDocument } from '../runtime/IR.js'

/** Static IR inventory only: node counts are not execution counts or timing estimates. */
export function analyzeGraph(ir: IRDocument) {
  const nodes = ir.nodes ?? []
  const typeCounts = new Map<string, number>()
  const consumers = new Map<
    string,
    {
      nodeId: number
      outputIndex: number
      outputSubIndex: number
      targets: Set<number>
    }
  >()
  let flowConnections = 0
  let dataConnections = 0
  for (const node of nodes) {
    typeCounts.set(node.type, (typeCounts.get(node.type) ?? 0) + 1)
    flowConnections += node.next?.length ?? 0
    for (const arg of node.args ?? []) {
      if (arg?.type !== 'conn') continue
      dataConnections++
      const { node_id: nodeId, index: outputIndex, sub_index: outputSubIndex = 0 } = arg.value
      const key = `${nodeId}:${outputIndex}:${outputSubIndex}`
      const output = consumers.get(key) ?? {
        nodeId,
        outputIndex,
        outputSubIndex,
        targets: new Set<number>()
      }
      output.targets.add(node.id)
      consumers.set(key, output)
    }
  }
  const idsOf = (...types: string[]) =>
    nodes.filter((node) => types.includes(node.type)).map((node) => node.id)
  return {
    graph: ir.graph,
    totals: {
      nodes: nodes.length,
      variables: ir.variables?.length ?? 0,
      flowConnections,
      dataConnections
    },
    nodesByType: Object.fromEntries([...typeCounts].sort(([a], [b]) => a.localeCompare(b))),
    review: {
      branches: idsOf('double_branch', 'multiple_branches'),
      loops: idsOf('finite_loop', 'list_iteration_loop'),
      localVariableReads: idsOf('get_local_variable'),
      localVariableWrites: idsOf('set_local_variable'),
      timerStarts: idsOf('start_timer'),
      listAssembly: idsOf('assembly_list'),
      // copyList is lowered to a local-variable snapshot, not a copy_list node.
      // These writes are review candidates, not a claim that every write copies a collection.
      collectionLocalWrites: nodes
        .filter((node) => {
          const arg = node.args?.[1]
          const type = arg?.type === 'conn' ? arg.value.type : arg?.type
          return node.type === 'set_local_variable' && (type?.endsWith('_list') || type === 'dict')
        })
        .map((node) => node.id),
      sharedDataOutputs: [...consumers.values()]
        .filter(({ targets }) => targets.size > 1)
        .sort(
          (a, b) =>
            a.nodeId - b.nodeId ||
            a.outputIndex - b.outputIndex ||
            a.outputSubIndex - b.outputSubIndex
        )
        .map(({ nodeId, outputIndex, outputSubIndex, targets }) => ({
          nodeId,
          outputIndex,
          outputSubIndex,
          consumerNodeIds: [...targets].sort((a, b) => a - b)
        }))
    }
  }
}

/** Reject malformed input rather than printing plausible but incomplete statistics. */
export function analyzeGraphDocuments(raw: unknown) {
  const documents = Array.isArray(raw) ? raw : [raw]
  if (!documents.length) throw new Error('Expected at least one node-graph IR document')
  const reports = documents.map((item, index) => {
    const invalid = () => new Error(`Invalid node-graph IR document at index ${index}`)
    if (!item || typeof item !== 'object') throw invalid()
    const ir = item as IRDocument
    if (
      ir.ir_version !== 1 ||
      ir.ir_type !== 'node_graph' ||
      !ir.graph ||
      !['server', 'client'].includes(ir.graph.type) ||
      (ir.nodes !== undefined && !Array.isArray(ir.nodes)) ||
      (ir.variables !== undefined && !Array.isArray(ir.variables))
    )
      throw invalid()
    const ids = new Set<number>()
    for (const node of ir.nodes ?? []) {
      if (
        !node ||
        !Number.isSafeInteger(node.id) ||
        ids.has(node.id) ||
        typeof node.type !== 'string' ||
        (node.args !== undefined && !Array.isArray(node.args)) ||
        (node.next !== undefined && !Array.isArray(node.next))
      )
        throw invalid()
      ids.add(node.id)
    }
    for (const node of ir.nodes ?? []) {
      for (const edge of node.next ?? []) {
        if (edge == null || !ids.has(typeof edge === 'number' ? edge : edge.node_id))
          throw invalid()
      }
      for (const arg of node.args ?? []) {
        if (arg?.type === 'conn' && (!arg.value || !ids.has(arg.value.node_id))) throw invalid()
      }
    }
    return analyzeGraph(ir)
  })
  return {
    kind: 'gsts-graph-analysis',
    version: 1,
    scope: 'input-ir',
    note: 'Static structure only. Counts are not runtime cost; shared data outputs may be evaluated repeatedly. Later GIA transforms may change node counts.',
    graphs: reports
  }
}
