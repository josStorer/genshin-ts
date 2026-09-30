import type { ExecutionFlow } from './execution_flow_types.js'
import type { NextConnection } from './IR.js'
import { bool } from './value.js'

const targetId = (edge: NextConnection) => (typeof edge === 'number' ? edge : edge.node_id)

/** Fold only literal server conditions, after both callbacks have finished building the flow. */
export function foldLiteralBranches(flow: ExecutionFlow): ExecutionFlow {
  const selected = new Map<number, NextConnection | undefined>()
  for (const node of flow.execNodes) {
    const condition = node.args[0]
    if (
      node.nodeType !== 'double_branch' ||
      !(condition instanceof bool) ||
      condition.getMetadata()?.kind !== 'literal' ||
      typeof condition.value !== 'boolean'
    )
      continue
    const edges = flow.edges[node.id] ?? []
    // Do not reinterpret custom/dynamic execution pins or fan-out ordering.
    if (
      edges.some(
        (edge) =>
          typeof edge !== 'number' &&
          (![0, 1].includes(edge.source_index ?? 0) || (edge.source_sub_index ?? 0) !== 0)
      )
    )
      continue
    const active = edges.filter(
      (edge) =>
        (typeof edge === 'number' ? 0 : (edge.source_index ?? 0)) === (condition.value ? 0 : 1)
    )
    if (active.length <= 1) selected.set(node.id, active[0])
  }
  if (!selected.size) return flow

  // null means a constant-only cycle or a nonstandard branch input: leave it intact.
  const resolve = (edge: NextConnection): NextConnection | undefined | null => {
    let current: NextConnection | undefined = edge
    const visited = new Set<number>()
    while (current !== undefined && selected.has(targetId(current))) {
      const id = targetId(current)
      if (
        visited.has(id) ||
        (typeof current !== 'number' &&
          ((current.target_index ?? 0) !== 0 || (current.target_sub_index ?? 0) !== 0))
      )
        return null
      visited.add(id)
      current = selected.get(id)
    }
    return current
  }

  const edges: ExecutionFlow['edges'] = {}
  for (const [id, outgoing] of Object.entries(flow.edges)) {
    edges[Number(id)] = outgoing.flatMap((incoming): NextConnection[] => {
      if (!selected.has(targetId(incoming))) return [incoming]
      const destination = resolve(incoming)
      if (destination === null) return [incoming]
      if (destination === undefined) return []
      // Keep the predecessor's output pin and the successor's input pin.
      return [
        {
          node_id: targetId(destination),
          source_index: typeof incoming === 'number' ? 0 : (incoming.source_index ?? 0),
          source_sub_index: typeof incoming === 'number' ? 0 : (incoming.source_sub_index ?? 0),
          target_index: typeof destination === 'number' ? 0 : (destination.target_index ?? 0),
          target_sub_index:
            typeof destination === 'number' ? 0 : (destination.target_sub_index ?? 0)
        }
      ]
    })
  }
  // The existing reachability pass removes bypassed branches and their unused data.
  // Original records/callbacks are retained, so repeated IR builds remain independent.
  return { ...flow, edges }
}
