import { loadGiaProto } from '../../injector/proto.js'
import type {
  Argument,
  ConnectionArgument,
  IRDocument,
  ServerGraphMode as ServerGraphRuntimeMode,
  ServerGraphSubType,
  ValueType,
  Variable
} from '../../runtime/IR.js'
import type { DictKeyType, DictValueType } from '../../runtime/value.js'
import { isListValueInfo, type ListValueInfo } from '../../runtime/variables.js'
import type { NodeType } from '../../thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/gia_gen/nodes.js'
import { Graph, Node, NodeIdFor, Pin, wrap_gia, type Root as GiaRoot } from '../gia_vendor.js'
import { buildExecutionGraph, layoutPositions } from './layout.js'
import { buildConnTypeIndex, resolveGiaNodeId } from './node_id.js'
import { optimizeTimerDispatchAggregate } from './optimize_timer_dispatch.js'
import { setClientExecLiteralArgValue, setEnumArgValue, setLiteralArgValue } from './pins.js'
import { expandListLiterals } from './preprocess.js'
import type { IRNode, NodeId } from './types.js'

type IrToGiaOptimizeOptions = {
  timerDispatchAggregate?: boolean
}

export interface IrToGiaOptions {
  graphId?: number
  uid?: number
  name?: string
  protoPath: string
  optimize?: IrToGiaOptimizeOptions
}

function buildVarsByName(ir: IRDocument): Map<string, Variable> {
  return new Map<string, Variable>((ir.variables ?? []).map((v) => [v.name, v]))
}

type ScalarType =
  | 'bool'
  | 'int'
  | 'float'
  | 'str'
  | 'vec3'
  | 'guid'
  | 'entity'
  | 'prefab_id'
  | 'config_id'
  | 'faction'

function baseNodeType(type: ScalarType): NodeType {
  switch (type) {
    case 'bool':
      return { t: 'b', b: 'Bol' }
    case 'int':
      return { t: 'b', b: 'Int' }
    case 'float':
      return { t: 'b', b: 'Flt' }
    case 'str':
      return { t: 'b', b: 'Str' }
    case 'vec3':
      return { t: 'b', b: 'Vec' }
    case 'guid':
      return { t: 'b', b: 'Gid' }
    case 'entity':
      return { t: 'b', b: 'Ety' }
    case 'prefab_id':
      return { t: 'b', b: 'Pfb' }
    case 'config_id':
      return { t: 'b', b: 'Cfg' }
    case 'faction':
      return { t: 'b', b: 'Fct' }
  }
}

function valueTypeToNodeType(type: ValueType | DictKeyType | DictValueType): NodeType {
  if (type.endsWith('_list')) {
    const base = type.slice(0, -5) as ScalarType
    return { t: 'l', i: baseNodeType(base) }
  }
  if (type === 'dict') {
    throw new Error('[error] dict type requires key/value types')
  }
  return baseNodeType(type as ScalarType)
}

function dictNodeType(k: DictKeyType, v: DictValueType): NodeType {
  return { t: 'd', k: valueTypeToNodeType(k), v: valueTypeToNodeType(v) }
}

function expandListValueInfo(info: ListValueInfo): unknown[] {
  // 这行目前永远不会触发, 暂留
  if (info.values) return info.values
  // 总是执行这行
  return new Array(info.length)
}

function buildListValue(variable: Variable): unknown[] {
  if (variable.value !== undefined && Array.isArray(variable.value)) {
    return variable.value as unknown[]
  }
  if ('length' in variable && typeof variable.length === 'number') {
    return new Array(variable.length)
  }
  return []
}

function buildDictValue(variable: Variable): unknown[] {
  if (!Array.isArray(variable.value)) return []
  const out: unknown[] = []
  for (const pair of variable.value as unknown[]) {
    if (!pair || typeof pair !== 'object') continue
    const k = (pair as { k?: unknown }).k
    const rawV = (pair as { v?: unknown }).v
    const v = isListValueInfo(rawV) ? expandListValueInfo(rawV) : rawV
    out.push([k, v])
  }
  return out
}

function applyGraphVariables(graph: GiaGraph, variables: Variable[]) {
  for (const v of variables) {
    let nodeType: NodeType
    let value: unknown
    if (v.type === 'dict') {
      if (!v.dict) {
        throw new Error(`[error] dict variable "${v.name}" missing key/value types`)
      }
      nodeType = dictNodeType(v.dict.k, v.dict.v)
      value = buildDictValue(v)
    } else if (v.type.endsWith('_list')) {
      nodeType = valueTypeToNodeType(v.type)
      value = buildListValue(v)
    } else {
      nodeType = valueTypeToNodeType(v.type)
      value = v.value
    }
    const graphVar = graph.add_graph_var(v.name, nodeType, false, value as never)
    if (graphVar && value === undefined) {
      graphVar.val = undefined as never
    }
  }
}

export type ServerGraphMode = 'server' | 'status' | 'class' | 'item'
export type GiaGraph = Graph<ServerGraphMode>
export type GiaNode = Node<ServerGraphMode>

function resolveServerGraphMode(graphType: ServerGraphSubType | undefined): ServerGraphMode {
  switch (graphType) {
    case 'status':
      return 'status'
    case 'class':
      return 'class'
    case 'item':
      return 'item'
    case 'entity':
    default:
      return 'server'
  }
}

const SERVER_GRAPH_RUNTIME_MODES = new Set<ServerGraphRuntimeMode>(['beyond', 'classic'])

function resolveServerGraphRuntimeMode(
  mode: ServerGraphRuntimeMode | undefined
): ServerGraphRuntimeMode {
  const resolved = mode ?? 'beyond'
  if (!SERVER_GRAPH_RUNTIME_MODES.has(resolved)) {
    throw new Error(`[error] invalid server graph mode: ${String(mode)}`)
  }
  return resolved
}

function assertServerGraphRuntimeModeCompatible(
  mode: ServerGraphRuntimeMode,
  subType: ServerGraphSubType | undefined
) {
  const resolvedSubType = subType ?? 'entity'
  if (mode === 'classic' && resolvedSubType === 'class') {
    throw new Error('[error] classic mode does not allow class graph type')
  }
}

export function irToGia(ir: IRDocument, opts: IrToGiaOptions): Uint8Array {
  const graphId = opts.graphId ?? ir.graph?.id ?? 1073741825
  const name = opts.name ?? ir.graph?.name ?? '_GSTS_Generated_Graph'
  const uid = opts.uid ?? 100000001

  if (!ir.nodes || ir.nodes.length === 0) {
    throw new Error('IR document must have at least one node')
  }

  const expanded = expandListLiterals(ir)
  ir = expanded.ir
  const timerDispatchAggregate =
    opts.optimize?.timerDispatchAggregate ?? process.env.GSTS_OPT_TIMER_DISPATCH === '1'
  ir = optimizeTimerDispatchAggregate(ir, timerDispatchAggregate)

  const graphInfo = buildExecutionGraph(ir.nodes!)
  const serverSubType = ir.graph.type === 'server' ? ir.graph.sub_type : undefined
  const serverMode = resolveServerGraphMode(serverSubType)
  const graphRuntimeMode = ir.graph.type === 'server' ? ir.graph.mode : undefined
  const resolvedRuntimeMode = resolveServerGraphRuntimeMode(graphRuntimeMode)
  assertServerGraphRuntimeModeCompatible(resolvedRuntimeMode, serverSubType)
  const graph: GiaGraph = new Graph<ServerGraphMode>(serverMode, uid, name, graphId)
  if (resolvedRuntimeMode === 'classic') {
    graph.rootModeFlag = 1
  }
  const nodesById = new Map<NodeId, GiaNode>()
  const positions = layoutPositions(ir.nodes!, graphInfo)
  const connIndex = buildConnTypeIndex(ir)
  const varsByName = buildVarsByName(ir)
  applyGraphVariables(graph, ir.variables ?? [])

  // 以下为引脚设置逻辑
  type ValueArgument = Exclude<Argument, ConnectionArgument | null>
  const isValueArg = (a: Argument | undefined): a is ValueArgument => !!a && a.type !== 'conn'

  const setArgValue = (
    giaNode: GiaNode,
    pinIndex: number,
    argIndex: number,
    nodeType: string,
    arg: ValueArgument
  ) => {
    try {
      if (arg.type === 'enum' || arg.type === 'enumeration') {
        setEnumArgValue(giaNode, pinIndex, argIndex, nodeType, arg.value)
      } else {
        setLiteralArgValue(giaNode, pinIndex, argIndex, nodeType, arg.type, arg.value)
      }
    } catch (e) {
      console.error(
        `[error] failed to set value for pin ${pinIndex} of node ${nodeType} (id=${giaNode.NodeIndex})\n`
      )
      throw e
    }
  }

  const filterUnkPins = (giaNode: GiaNode) => {
    giaNode.pins = (giaNode.pins ?? []).filter(
      // @ts-ignore thirdparty Pin shape
      (p) => !((p?.kind === 3 || p?.kind === 4) && p?.type?.t === 'b' && p?.type?.b === 'Unk')
    )
  }

  const applyArgsWithNullHole = (
    nodeType: string,
    giaNode: GiaNode,
    irNode: IRNode,
    argsLength: number,
    holeIndex: number
  ): boolean => {
    const args = irNode.args ?? []
    if (args.length !== argsLength) return false
    const patched: Argument[] = [...args]
    patched.splice(holeIndex, 0, null)
    for (let i = 0; i < patched.length; i++) {
      const a = patched[i]
      if (isValueArg(a)) setArgValue(giaNode, i, i, nodeType, a)
    }
    return true
  }

  const applyGetNodeGraphVariableNamePin = (nodeType: string, giaNode: GiaNode, irNode: IRNode) => {
    if (nodeType !== 'get_node_graph_variable') return
    const nameArg = irNode.args?.[0]
    if (!nameArg || nameArg.type !== 'str') return
    const p = new Pin(giaNode.ConcreteId!, 3, 0)
    p.setType({ t: 'b', b: 'Str' })
    p.setVal(nameArg.value)
    giaNode.pins.unshift(p)
  }

  const applySpecialArgs = (nodeType: string, giaNode: GiaNode, irNode: IRNode): boolean => {
    // 存在疑似弃用的参数, 需要占位空值
    if (nodeType === 'create_prefab') {
      if (applyArgsWithNullHole(nodeType, giaNode, irNode, 7, 4)) return true
    }

    // 存在疑似弃用的参数, 需要占位空值
    if (nodeType === 'create_prefab_group') {
      if (applyArgsWithNullHole(nodeType, giaNode, irNode, 7, 4)) return true
    }

    // vendor 节点定义存在隐藏的 Unk 输入 pin，但实际的 GIA 通常不会写入该 pin
    // nodes.ts 侧只暴露 (Ety, Bol) 两参，这里补一个 null 占位，避免 Bol 错位写入 Unk 导致 thirdparty 警告
    if (
      nodeType === 'activate_disable_follow_motion_device' ||
      nodeType === 'activate_disable_collision_trigger_source' ||
      nodeType === 'activate_disable_character_disruptor_device'
    ) {
      if (applyArgsWithNullHole(nodeType, giaNode, irNode, 2, 1)) return true
    }

    if (nodeType === 'activate_disable_pathfinding_obstacle_feature') {
      if (applyArgsWithNullHole(nodeType, giaNode, irNode, 2, 1)) return true
    }
    if (nodeType === 'activate_disable_pathfinding_obstacle') {
      if (applyArgsWithNullHole(nodeType, giaNode, irNode, 3, 0)) return true
    }

    // vendor 实测：Remove Unit Status 的 removerEntity 写在 pinIndex=4（pinIndex=3 为隐藏/空 pin）
    // nodes.ts 侧暴露 4 个参数，这里补一个 null 占位，避免 removerEntity 写入错误的 pin。
    if (nodeType === 'remove_unit_status') {
      if (applyArgsWithNullHole(nodeType, giaNode, irNode, 4, 3)) return true
    }

    // 实测：Set Custom Variable 的 triggerEvent 实际写在 pinIndex=4（中间 pinIndex=3 为隐藏/空 pin）
    // nodes.ts 侧只有 4 个参数，这里补一个 null 占位，避免 triggerEvent 写入错误的 pin。
    if (nodeType === 'set_custom_variable') {
      if (applyArgsWithNullHole(nodeType, giaNode, irNode, 4, 3)) return true
    }

    // vendor 实测：Set Chat Channel Switch 的 textSwitch 写在 pinIndex=2（pinIndex=1 为隐藏/空 pin）
    // nodes.ts 侧只有 2 个参数，这里补一个 null 占位，避免 textSwitch 写入错误的 pin。
    if (nodeType === 'set_chat_channel_switch') {
      if (applyArgsWithNullHole(nodeType, giaNode, irNode, 2, 1)) return true
    }

    if (nodeType === 'send_signal' || nodeType === 'monitor_signal') {
      const nameArg = irNode.args?.[0]
      if (nameArg && nameArg.type === 'conn') {
        throw new Error(`[error] ${nodeType} does not accept wired signal name`)
      }
      if (nameArg && !isValueArg(nameArg)) {
        throw new Error(`[error] ${nodeType} expects a literal string signal name`)
      }
      giaNode.pins = []
      if (nameArg) {
        setClientExecLiteralArgValue(giaNode, 0, 0, nodeType, nameArg.type, nameArg.value)
      }
      return true
    }

    if (nodeType === 'assembly_list' || nodeType === 'assembly_dictionary') {
      // GIA: pin0 为元素数量；IR: args 为元素列表
      giaNode.setVal(0, irNode.args?.length ?? 0)
      irNode.args?.forEach((arg, idx) => {
        if (!isValueArg(arg)) return
        setArgValue(giaNode, idx + 1, idx, nodeType, arg)
      })
      return true
    }

    if (nodeType === 'multiple_branches') {
      const args = irNode.args ?? []

      // control expression
      const controlArg = args[0]
      if (isValueArg(controlArg)) setArgValue(giaNode, 0, 0, nodeType, controlArg)

      // cases
      const caseValues: unknown[] = []
      let caseValueType: string | undefined
      for (let i = 1; i < args.length; i++) {
        const a = args[i]
        if (!a || a.type === 'conn') continue
        if (caseValueType === undefined) caseValueType = a.type
        caseValues.push(a.value)
      }

      if (caseValues.length > 0 && caseValueType) {
        try {
          setLiteralArgValue(giaNode, 1, 1, nodeType, `${caseValueType}_list`, caseValues)
        } catch (e) {
          console.error(
            `[error] failed to set value for pin 1 of node ${nodeType} (id=${irNode.id})\n`
          )
          throw e
        }
      }

      return true
    }

    return false
  }

  const applyGenericArgs = (nodeType: string, giaNode: GiaNode, irNode: IRNode) => {
    irNode.args?.forEach((arg, idx) => {
      if (isValueArg(arg)) setArgValue(giaNode, idx, idx, nodeType, arg)
    })
  }

  const remapInputIndexForHiddenPin = (nodeType: string, idx: number): number => {
    // 注意：applySpecialArgs 里对这些节点做了“插入 null 占位”来适配 vendor 的 pinIndex 空洞，
    // 那么 dataConnections 里的 toIndex（仍按 IR 的原始参数顺序）也必须同步 remap。
    switch (nodeType) {
      case 'activate_disable_follow_motion_device':
      case 'activate_disable_collision_trigger_source':
      case 'activate_disable_character_disruptor_device':
        return idx >= 1 ? idx + 1 : idx // hole at 1
      case 'activate_disable_pathfinding_obstacle_feature':
        return idx >= 1 ? idx + 1 : idx // hole at 1
      case 'activate_disable_pathfinding_obstacle':
        return idx + 1 // hole at 0
      case 'set_chat_channel_switch':
        return idx >= 1 ? idx + 1 : idx // hole at 1
      case 'set_custom_variable':
      case 'remove_unit_status':
        return idx >= 3 ? idx + 1 : idx // hole at 3
      case 'create_prefab':
      case 'create_prefab_group':
        return idx >= 4 ? idx + 1 : idx // hole at 4
      default:
        return idx
    }
  }

  const remapOutputIndexForHiddenPin = (nodeType: string, idx: number): number => {
    switch (nodeType) {
      case 'when_path_reaches_waypoint':
        return idx >= 3 ? idx + 1 : idx // hole at 3
      default:
        return idx
    }
  }

  const irNodeTypeById = new Map<NodeId, string>()
  const assemblyDictMeta = new Map<NodeId, { keyConn: boolean[] }>()
  ir.nodes!.forEach((irNode) => {
    const nodeType = irNode.type
    const nodeId = resolveGiaNodeId(irNode, connIndex, varsByName, resolvedRuntimeMode)

    irNodeTypeById.set(irNode.id, nodeType)
    if (nodeType === 'assembly_dictionary') {
      const args = irNode.args ?? []
      const keyConn: boolean[] = []
      for (let i = 0; i < args.length; i += 2) {
        const key = args[i]
        const keyIsConn = !!key && key.type === 'conn'
        keyConn.push(keyIsConn)
      }
      assemblyDictMeta.set(irNode.id, { keyConn })
    }
    const giaNode: GiaNode = new Node<ServerGraphMode>(
      irNode.id,
      serverMode,
      nodeId as NodeIdFor<ServerGraphMode>
    )
    const layoutPos = positions.get(irNode.id)!
    giaNode.setPos(layoutPos[0] / 300, layoutPos[1] / 200)

    applyGetNodeGraphVariableNamePin(nodeType, giaNode, irNode)

    if (!applySpecialArgs(nodeType, giaNode, irNode)) {
      applyGenericArgs(nodeType, giaNode, irNode)
    }

    filterUnkPins(giaNode)

    nodesById.set(irNode.id, giaNode)
    graph.add_node(giaNode)
  })

  for (const { fromId, toId, fromIndex, toIndex } of graphInfo.flowConnections) {
    const from = nodesById.get(fromId)
    const to = nodesById.get(toId)
    if (!from || !to) {
      throw new Error(
        `[error] bad flow connection ${fromId}->${toId}, index=${fromIndex}->${toIndex}`
      )
    }
    graph.flow(from, to, fromIndex, toIndex)
  }

  for (const { fromId, toId, fromIndex, toIndex } of graphInfo.dataConnections) {
    const from = nodesById.get(fromId)
    const to = nodesById.get(toId)
    if (!from || !to) {
      throw new Error(
        `[error] bad data connection ${fromId}->${toId}, index=${fromIndex}->${toIndex}`
      )
    }
    const fromType = irNodeTypeById.get(fromId) ?? ''
    const toType = irNodeTypeById.get(toId) ?? ''
    const mappedFromIndex = remapOutputIndexForHiddenPin(fromType, fromIndex)
    const mappedToIndex = remapInputIndexForHiddenPin(toType, toIndex)
    graph.connect(from, to, mappedFromIndex, mappedToIndex)
  }

  let root: GiaRoot
  try {
    root = graph.encode()
  } catch (e) {
    for (const n of graph.get_nodes()) {
      for (const p of n.pins ?? []) {
        // only check input pins with a resolved type
        if (!p || p.kind !== 3 || !p.type) continue
        // base string pin
        if (p.type.t === 'b' && p.type.b === 'Str') {
          const v = p.value
          if (v !== null && v !== undefined && typeof v !== 'string') {
            console.error(
              `[debug] bad Str pin value: nodeIndex=${n.NodeIndex} concreteId=${String(n.ConcreteId)} genericId=${n.GenericId} pin=${p.index} value=${JSON.stringify(v)}`
            )
          }
        }
      }
    }
    throw e
  }

  if (assemblyDictMeta.size > 0) {
    const setNestedAlreadySetValFalse = (pin: { value?: unknown }) => {
      const value = (pin.value as { bConcreteValue?: { value?: { alreadySetVal?: boolean } } })
        ?.bConcreteValue?.value
      if (value && typeof value === 'object' && 'alreadySetVal' in value) {
        ;(value as { alreadySetVal: boolean }).alreadySetVal = false
      }
    }

    const nodes = root.graph?.graph?.inner?.graph?.nodes ?? []
    for (const node of nodes) {
      const meta = assemblyDictMeta.get(node.nodeIndex)
      if (!meta) continue
      const { keyConn } = meta
      const isValueList = (pin: { value?: unknown }): boolean => {
        const value = (pin.value as { bConcreteValue?: { value?: Record<string, unknown> } })
          ?.bConcreteValue?.value
        if (!value || typeof value !== 'object') return false
        return 'bArray' in value || 'bDict' in value
      }
      for (const pin of node.pins ?? []) {
        if (!pin || pin.i1?.kind !== 3) continue
        const isConnected = !!pin.connects && pin.connects.length > 0
        const pinIndex = pin.i1.index ?? 0
        if (pinIndex === 0) continue
        const pairIndex = Math.floor((pinIndex - 1) / 2)
        const isKeyPin = (pinIndex - 1) % 2 === 0
        if (isKeyPin) {
          if (isConnected && keyConn[pairIndex]) setNestedAlreadySetValFalse(pin)
          continue
        }
        if (isValueList(pin)) {
          setNestedAlreadySetValFalse(pin)
          continue
        }
        if (!isConnected) continue
        setNestedAlreadySetValFalse(pin)
      }
    }
  }

  const protoPath = opts.protoPath
  const { rootMessage } = loadGiaProto(protoPath)
  const buffer = wrap_gia(rootMessage, root)
  const bytes = new Uint8Array(buffer)

  return bytes
}
