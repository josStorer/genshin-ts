import { isConnectionArgument } from './node_id.js'
import { IRNode, NodeId, Position } from './types.js'

type LayoutConfig = {
  columnWidth: number
  rowHeight: number
  maxColumns: number
  wrapHeight: number
  eventGap: number
  maxEventGap: number
}

const asArray = <T>(value: T | T[] | undefined): T[] => {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

export function buildExecutionGraph(irNodes: IRNode[]) {
  const execEdges: Array<[NodeId, NodeId]> = []
  // 节点ID -> 指向该节点的边数量（用于找出根节点，没有入边的节点是根节点）
  const incoming = new Map<NodeId, number>()
  // 节点ID -> 执行子节点ID列表（用于快速查找执行流的下游节点）
  const execChildrenMap = new Map<NodeId, NodeId[]>()
  // 节点ID -> 数据消费者节点ID列表（用于快速查找数据节点的消费者）
  const dataConsumersMap = new Map<NodeId, NodeId[]>()
  // 执行连接信息
  const flowConnections: Array<{
    fromId: NodeId
    toId: NodeId
    fromIndex: number
    toIndex: number
  }> = []
  // 数据连接信息
  const dataConnections: Array<{
    fromId: NodeId
    toId: NodeId
    fromIndex: number
    toIndex: number
  }> = []

  for (const node of irNodes) {
    const children: NodeId[] = []
    for (const next of asArray(node.next)) {
      const targetId = typeof next === 'number' ? next : next.node_id
      const fromIndex = typeof next === 'number' ? 0 : (next.source_index ?? 0)
      const toIndex = typeof next === 'number' ? 0 : (next.target_index ?? 0)
      execEdges.push([node.id, targetId])
      incoming.set(targetId, (incoming.get(targetId) ?? 0) + 1)
      children.push(targetId)
      flowConnections.push({ fromId: node.id, toId: targetId, fromIndex, toIndex })
    }
    if (children.length > 0) {
      execChildrenMap.set(node.id, children)
    }

    // 构建消费者索引和数据连接信息：遍历节点的参数，找出数据连接
    for (const [toIndex, arg] of (node.args ?? []).entries()) {
      if (isConnectionArgument(arg)) {
        const dataNodeId = arg.value.node_id
        const fromIndex = arg.value.index
        const consumers = dataConsumersMap.get(dataNodeId) ?? []
        if (!consumers.includes(node.id)) {
          consumers.push(node.id)
          dataConsumersMap.set(dataNodeId, consumers)
        }
        // 双端共享节点的 GIA pin 布局与 IR args 索引不一致时在此统一修正；
        // 单端专属节点的修正放各自管线（服务器 index.ts remapInputIndexForHiddenPin /
        // 客户端 client_graph.ts remapClientInputIndex）：
        // - assembly_list: GIA pin0 为元素数量，元素从 pin1 开始
        // - assembly_dictionary: GIA pin0 为 kv 参数数量（k/v 总数），k/v 从 pin1 开始
        const toIndexPatched =
          node.type === 'assembly_list' || node.type === 'assembly_dictionary'
            ? toIndex + 1
            : toIndex
        dataConnections.push({
          fromId: dataNodeId,
          toId: node.id,
          fromIndex,
          toIndex: toIndexPatched
        })
      }
    }
  }

  const execNodes = new Set<NodeId>()
  execEdges.forEach(([from, to]) => {
    execNodes.add(from)
    execNodes.add(to)
  })

  let roots = irNodes
    .filter((n) => (incoming.get(n.id) ?? 0) === 0 && asArray(n.next).length > 0)
    .sort((a, b) => a.id - b.id)

  if (roots.length === 0 && execEdges.length > 0) {
    const candidates = irNodes.filter((n) => asArray(n.next).length > 0).sort((a, b) => a.id - b.id)
    if (candidates.length > 0) {
      roots = [candidates[0]]
    }
  }

  return {
    execEdges,
    execNodes,
    roots,
    execChildrenMap,
    dataConsumersMap,
    flowConnections,
    dataConnections
  }
}

type OccupiedBox = Readonly<{ x: number; y: number; width: number; height: number }>
type OccupancyIndex = {
  readonly cells: ReadonlyMap<string, readonly OccupiedBox[]>
  readonly count: number
  readonly base?: OccupancyIndex
}
type Occupancy = { cells: Map<string, OccupiedBox[]>; count: number; base?: OccupancyIndex }
type DataPlacementState = Pick<
  ReturnType<typeof createLayoutState>,
  | 'occupied'
  | 'positions'
  | 'unplacedNodes'
  | 'consumerStackCount'
  | 'nodeToEventIndex'
  | 'eventMaxYCoord'
> & { nodesById: ReadonlyMap<NodeId, IRNode> }
// A cell is close to one node footprint; rectangles spanning cells reserve every touched cell.
const CELL_SIZE = 400
function cellsFor(box: OccupiedBox) {
  const cells: string[] = []
  for (
    let x = Math.floor(box.x / CELL_SIZE);
    x <= Math.floor((box.x + box.width + 40) / CELL_SIZE);
    x++
  ) {
    for (
      let y = Math.floor(box.y / CELL_SIZE);
      y <= Math.floor((box.y + box.height + 40) / CELL_SIZE);
      y++
    ) {
      cells.push(`${x},${y}`)
    }
  }
  return cells
}
function occupy(index: Occupancy, box: OccupiedBox) {
  index.count++
  for (const key of cellsFor(box)) {
    let bucket = index.cells.get(key)
    if (!bucket) index.cells.set(key, (bucket = []))
    bucket.push(box)
  }
}
function nearby(index: OccupancyIndex, box: OccupiedBox) {
  const boxes = new Set<OccupiedBox>()
  const keys = cellsFor(box)
  for (let current: OccupancyIndex | undefined = index; current; current = current.base) {
    for (const key of keys) {
      for (const item of current.cells.get(key) ?? []) {
        boxes.add(item)
      }
    }
  }
  return boxes
}

function createLayoutState(irNodes: IRNode[]) {
  // 未放置位置的节点集合（初始包含所有节点，放置后从中删除）
  const unplacedNodes = new Map<NodeId, IRNode>()
  irNodes.forEach((n) => unplacedNodes.set(n.id, n))

  const state = {
    // Conservative IR-space footprints, shared by execution, data and detached nodes.
    occupied: { cells: new Map(), count: 0 } as Occupancy,
    nodesById: new Map(irNodes.map((node) => [node.id, node])),
    nodeOrder: new Map(irNodes.map((node, index) => [node.id, index])),
    visitedExec: new Set<NodeId>(),
    // 节点ID -> [x, y] 坐标位置（最终布局结果）
    positions: new Map<NodeId, Position>(),
    // 节点ID -> 事件索引（用于区分不同的执行流，控制垂直分组）
    nodeToEventIndex: new Map<NodeId, number>(),
    // 未放置位置的节点集合
    unplacedNodes,
    // 消费者节点ID -> 已堆叠的数据节点数量（用于垂直堆叠多个数据节点，避免重叠）
    consumerStackCount: new Map<NodeId, number>(),
    // 事件索引 -> 该事件中所有节点的最大Y坐标（用于计算下一个事件的基础位置）
    eventMaxYCoord: new Map<number, number>()
  }
  // Reserve explicit positions before auto placement, rather than moving nodes over them later.
  for (const node of irNodes) {
    if (!node.position) continue
    state.positions.set(node.id, node.position)
    state.unplacedNodes.delete(node.id)
    occupy(state.occupied, { x: node.position[0], y: node.position[1], ...nodeFootprint(node) })
  }
  return state
}

function nodeFootprint(node: IRNode) {
  // IR does not contain rendered dimensions. Allow extra height for dynamic input pins.
  return { width: 300, height: 200 + (node.args?.length ?? 0) * 40 }
}

function occupyNextFreeY(
  state: Pick<DataPlacementState, 'occupied' | 'nodesById'>,
  nodeId: NodeId,
  x: number,
  y: number,
  stepY: number
): number {
  let yy = y
  const size = nodeFootprint(state.nodesById.get(nodeId)!)
  // Each collision moves below at least one occupied rectangle; no fixed graph-size limit.
  for (let i = 0; i <= state.occupied.count; i++) {
    const collisions = [...nearby(state.occupied, { x, y: yy, ...size })].filter(
      (box) =>
        x < box.x + box.width + 40 &&
        x + size.width + 40 > box.x &&
        yy < box.y + box.height + 40 &&
        yy + size.height + 40 > box.y
    )
    if (!collisions.length) {
      occupy(state.occupied, { x, y: yy, ...size })
      return yy
    }
    yy = Math.max(yy + stepY, ...collisions.map((box) => box.y + box.height + 40))
  }
  throw new Error(`[error] layout collision overflow at x=${x}, y=${y}`)
}

function updateEventHeight(
  state: Pick<DataPlacementState, 'eventMaxYCoord'>,
  eventIndex: number,
  y: number
) {
  const current = state.eventMaxYCoord.get(eventIndex)
  if (current === undefined || y > current) {
    state.eventMaxYCoord.set(eventIndex, y)
  }
}

function layoutExecutionChain(
  nodeId: NodeId,
  depth: number,
  baseY: number,
  eventIndex: number,
  laneOffset: number,
  execChildrenMap: Map<NodeId, NodeId[]>,
  state: ReturnType<typeof createLayoutState>,
  config: LayoutConfig
) {
  if (state.visitedExec.has(nodeId)) return
  state.visitedExec.add(nodeId)

  const row = Math.floor(depth / config.maxColumns)
  const column = depth % config.maxColumns
  const pinned = state.positions.get(nodeId)
  const x = pinned?.[0] ?? column * config.columnWidth
  const y0 = baseY + row * config.wrapHeight + laneOffset
  // 若同位置有节点碰撞，自动下移一行，并把偏移传递给后续节点保持对齐
  const y = pinned?.[1] ?? occupyNextFreeY(state, nodeId, x, y0, config.rowHeight)
  const actualLaneOffset = y - (baseY + row * config.wrapHeight)

  state.positions.set(nodeId, [x, y])
  state.nodeToEventIndex.set(nodeId, eventIndex)
  updateEventHeight(state, eventIndex, y + nodeFootprint(state.nodesById.get(nodeId)!).height)

  state.unplacedNodes.delete(nodeId)

  const children = execChildrenMap.get(nodeId) ?? []
  const branchGap = Math.trunc(config.rowHeight * 0.6)
  children.forEach((child, idx) =>
    layoutExecutionChain(
      child,
      depth + 1,
      baseY,
      eventIndex,
      actualLaneOffset + idx * branchGap,
      execChildrenMap,
      state,
      config
    )
  )
}

function placeDataNearConsumers(
  dataConsumersMap: Map<NodeId, NodeId[]>,
  execNodes: Set<NodeId>,
  state: DataPlacementState
): boolean {
  let placedAny = false
  const toDelete: NodeId[] = []

  state.unplacedNodes.forEach((_node, nodeId) => {
    const consumers = dataConsumersMap.get(nodeId)
    if (!consumers || consumers.length === 0) return

    // 查找已放置的消费者
    const placedConsumer = consumers.find((c) => state.positions.has(c))
    if (placedConsumer === undefined) return

    const position = state.positions.get(placedConsumer)!
    const [cx, cy] = position
    const stackCount = state.consumerStackCount.get(placedConsumer) ?? 0
    const isExecConsumer = execNodes.has(placedConsumer)
    const desiredY = isExecConsumer ? cy + (stackCount + 1) * 250 : cy + stackCount * 250
    const x = cx - 400
    const y = occupyNextFreeY(state, nodeId, x, desiredY, 250)

    state.positions.set(nodeId, [x, y])
    state.consumerStackCount.set(placedConsumer, stackCount + 1)

    const eventIndex = state.nodeToEventIndex.get(placedConsumer) ?? 0
    state.nodeToEventIndex.set(nodeId, eventIndex)
    updateEventHeight(state, eventIndex, y + nodeFootprint(state.nodesById.get(nodeId)!).height)

    toDelete.push(nodeId)
    placedAny = true
  })

  toDelete.forEach((id) => state.unplacedNodes.delete(id))
  return placedAny
}

function placeDetachedGrid(state: ReturnType<typeof createLayoutState>, config: LayoutConfig) {
  if (state.unplacedNodes.size === 0) return

  const count = state.unplacedNodes.size
  const maxCols = 50
  const cols = Math.min(count, maxCols)
  const rows = Math.ceil(count / maxCols)

  // 以左上角为起点，向右、向下排布；整体放在已放置区域的左上方，避免接触
  const left = -cols * config.columnWidth
  const top = -rows * config.rowHeight

  let idx = 0
  for (const nodeId of state.unplacedNodes.keys()) {
    const col = idx % cols
    const row = Math.floor(idx / cols)
    const x = left + col * config.columnWidth
    const y = occupyNextFreeY(state, nodeId, x, top + row * config.rowHeight, config.rowHeight)

    state.positions.set(nodeId, [x, y])
    idx += 1
  }

  state.unplacedNodes.clear()
}

function createPreviewState(
  state: ReturnType<typeof createLayoutState>,
  eventIndex: number,
  dataConsumersMap: Map<NodeId, NodeId[]>
): DataPlacementState {
  // Only this event's inputs and their placed consumers are visible, in final placement order.
  // Writable placement maps and position tuples are owned by the preview; node metadata and
  // base occupancy are shared read-only so pinned and already placed nodes remain reserved.
  const candidates = new Set<NodeId>()
  const pending: NodeId[] = []
  for (const [id, owner] of state.nodeToEventIndex) {
    if (owner === eventIndex) pending.push(id)
  }
  while (pending.length) {
    const id = pending.pop()!
    for (const arg of state.nodesById.get(id)?.args ?? []) {
      if (!isConnectionArgument(arg)) continue
      const source = arg.value.node_id
      if (state.positions.has(source) || candidates.has(source)) continue
      candidates.add(source)
      pending.push(source)
    }
  }
  const positions = new Map<NodeId, Position>()
  const nodeToEventIndex = new Map<NodeId, number>()
  for (const id of candidates) {
    for (const consumer of dataConsumersMap.get(id) ?? []) {
      const position = state.positions.get(consumer)
      if (!position) continue
      positions.set(consumer, [position[0], position[1]])
      const owner = state.nodeToEventIndex.get(consumer)
      if (owner !== undefined) nodeToEventIndex.set(consumer, owner)
    }
  }
  return {
    nodesById: state.nodesById,
    occupied: { cells: new Map(), count: state.occupied.count, base: state.occupied },
    positions,
    unplacedNodes: new Map(
      [...candidates]
        .sort((a, b) => state.nodeOrder.get(a)! - state.nodeOrder.get(b)!)
        .map((id) => [id, state.nodesById.get(id)!])
    ),
    consumerStackCount: new Map<NodeId, number>(),
    nodeToEventIndex,
    eventMaxYCoord: new Map([[eventIndex, state.eventMaxYCoord.get(eventIndex)!]])
  }
}

function measureEventBottom(
  state: ReturnType<typeof createLayoutState>,
  eventIndex: number,
  dataConsumersMap: Map<NodeId, NodeId[]>,
  execNodes: Set<NodeId>,
  maxBottom: number
) {
  const preview = createPreviewState(state, eventIndex, dataConsumersMap)
  while (
    preview.eventMaxYCoord.get(eventIndex)! < maxBottom &&
    placeDataNearConsumers(dataConsumersMap, execNodes, preview)
  ) {
    // 已达到间距上限后，无需继续试排更深的数据依赖。
  }
  return preview.eventMaxYCoord.get(eventIndex)!
}

export function layoutPositions(
  irNodes: IRNode[],
  graphInfo: ReturnType<typeof buildExecutionGraph>
): Map<NodeId, Position> {
  const config: LayoutConfig = {
    columnWidth: 800,
    rowHeight: 600,
    maxColumns: 50,
    wrapHeight: 600,
    eventGap: 600,
    maxEventGap: 1800
  }

  const { execNodes, roots, execChildrenMap, dataConsumersMap } = graphInfo
  const state = createLayoutState(irNodes)

  let currentBaseY = 0
  roots.forEach((root, eventIndex) => {
    layoutExecutionChain(root.id, 0, currentBaseY, eventIndex, 0, execChildrenMap, state, config)
    if (eventIndex === roots.length - 1) return

    const executionBottom = state.eventMaxYCoord.get(eventIndex)!
    const dataBottom = measureEventBottom(
      state,
      eventIndex,
      dataConsumersMap,
      execNodes,
      executionBottom + config.maxEventGap - config.eventGap
    )
    const neededGap = dataBottom - executionBottom + config.eventGap
    const gap = Math.min(neededGap, config.maxEventGap)
    currentBaseY = Math.max(currentBaseY, executionBottom + gap)
  })

  // 先保留全部执行流的位置，避免数据依赖的高度把后续事件不断向下推。
  // 数据节点仍按占用矩形避让，可能延伸到其他事件旁边或执行流下方。
  while (placeDataNearConsumers(dataConsumersMap, execNodes, state)) {
    // 继续迭代直到无法放置更多节点
  }

  // 剩余游离节点（无消费者或无关联）统一放到左上角网格
  placeDetachedGrid(state, config)

  // 如有指定位置，则使用指定位置
  for (const node of irNodes) {
    if (node.position) {
      state.positions.set(node.id, node.position)
    }
  }

  return state.positions
}
