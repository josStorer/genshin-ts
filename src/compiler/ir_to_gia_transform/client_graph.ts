import {
  CLIENT_GRAPH_CAPABILITY_BY_SUB_TYPE,
  isClientGraphModeAvailable
} from '../../definitions/client_graph_modes.js'
import { loadGiaProto } from '../../injector/proto.js'
import {
  CLIENT_FILTER_DEFAULT_EVALUATION_INTERVAL,
  resolveGraphIdForGraph
} from '../../runtime/graph_defaults.js'
import type { ClientIRDocument } from '../../runtime/IR.js'
import type { DictKeyType, DictValueType } from '../../runtime/value.js'
import { CLIENT_ERROR_CODES, clientNodegraphError } from '../../shared/client_capability_errors.js'
import {
  CLIENT_ENUM_VALUES,
  ENUM_MATCH_CLASS_KEYS_BY_GENERIC_ID,
  ENUM_MATCH_ROWS_BY_GENERIC_ID
} from '../../thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_enum_values.js'
import type {
  ClientNodeMetadata,
  ClientPinMetadata
} from '../../thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.js'
import {
  NodePin_Index_Kind,
  VarBase_Class
} from '../../thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto.js'
import {
  client_dictionary_wrapped_value,
  client_graph_body,
  client_inline_var_value,
  client_list_literal_value,
  client_literal_value,
  client_node_body,
  client_node_connect_from,
  client_node_connect_to,
  CLIENT_REFLECT_IOC_BY_TYPE,
  client_signal_name_value,
  client_value_base,
  client_wrapped_value,
  getClientGraphEncoding,
  wrap_gia,
  type Root as GiaRoot
} from '../gia_vendor.js'
import {
  CLIENT_VAR_TYPE_BY_IR_TYPE,
  customVariableTypeOffset,
  DICT_REFLECT_NODE_TYPES,
  LOCAL_VARIABLE_NODE_TYPES,
  resolveClientConcreteVariant,
  resolveClientNodeMetadata,
  resolveClientReflectVariant,
  type ClientReflectVariant
} from './client_nodes.js'
import { wrapGiaLowMemory } from './encode_gia.js'
import type { IrToGiaOptions } from './index.js'
import { buildExecutionGraph, layoutPositions } from './layout.js'
import { parseEnumValue } from './mappings.js'
import { buildConnTypeIndex, type ConnTypeIndex } from './node_id.js'
import type { IRNode, NodeId } from './types.js'

const PIN_KIND_OUT_FLOW = NodePin_Index_Kind.OutFlow
const PIN_KIND_IN_PARAM = NodePin_Index_Kind.InParam
const PIN_KIND_CLIENT_EXEC = NodePin_Index_Kind.ClientExecNode
const CLIENT_VAR_TYPE_ENUM = 13
const CLIENT_SEND_SIGNAL_PLACEHOLDER_GID = 300002

type ClientGiaNode = ReturnType<typeof client_node_body>
type ResolvedClientPinMetadata = ClientPinMetadata & {
  clientVarType: number
  indexOfConcrete: number
}
type IrArg = NonNullable<IRNode['args']>[number]
type ValueArg = Exclude<IrArg, null | { type: 'conn' }>
type ClientValueTypeInfo = {
  type: string
  dict?: {
    k: DictKeyType
    v: DictValueType
  }
}

function isValueArg(arg: IrArg | null | undefined): arg is ValueArg {
  return arg != null && arg.type !== 'conn'
}

function toPinLiteral(clientVarType: number, value: unknown, argIndex: number, nodeType: string) {
  if (clientVarType === CLIENT_VAR_TYPE_ENUM && typeof value === 'string') {
    return CLIENT_ENUM_VALUES[value] ?? parseEnumValue(value, argIndex, nodeType).enumValue
  }
  return value
}

export function argPinIndex(metadata: ClientNodeMetadata, argIndex: number): number {
  return metadata.argPins?.[argIndex] ?? argIndex
}

/**
 * 客户端专属节点的连线入参索引修正（服务器管线的对应物是 index.ts
 * remapInputIndexForHiddenPin；双端共享的 assembly_list/assembly_dictionary
 * 修正在 layout.ts toIndexPatched）：
 * - data_type_conversion: IR 与服务器同形（省略转换枚举参数），输入参数对应 GIA pin 1
 * - get_entity_type_list / get_ray_filter_type_list: GIA pin0 为数量，
 *   枚举槽从 pin1 开始（编辑器隐藏引脚）
 * - send_signal_to_server_node_graph: args[0]=信号名（kind5 exec 字面量，
 *   非数据引脚），信号参数 args[1..] 对应数据引脚 0..（服务器 send_signal 同款）
 */
function remapClientInputIndex(metadata: ClientNodeMetadata, argIndex: number): number {
  switch (metadata.nodeType) {
    case 'data_type_conversion':
    case 'get_entity_type_list':
    case 'get_ray_filter_type_list':
      return argIndex + 1
    case 'send_signal_to_server_node_graph':
      return argIndex - 1
    default:
      return argPinIndex(metadata, argIndex)
  }
}

function pinI2Index(
  metadata: ClientNodeMetadata,
  kind: 'output' | 'in_flow' | 'out_flow',
  index: number
): number {
  const pins = kind === 'output' ? metadata.outputs : (metadata.flows ?? [])
  const pin = pins.find((p) => p.kind === kind && p.index === index)
  return pin?.i2Index ?? index
}

function findInPin(node: ClientGiaNode, pinIndex: number) {
  return node.pins.find((p) => p.i1?.kind === PIN_KIND_IN_PARAM && p.i1.index === pinIndex)
}

function setInPinValue(
  node: ClientGiaNode,
  pinIndex: number,
  clientVarType: number,
  value: ReturnType<typeof client_literal_value>,
  ioc = 0
) {
  const pin = findInPin(node, pinIndex)
  if (!pin) throw new Error(`[error] missing input pin index ${pinIndex}`)
  pin.type = clientVarType
  pin.value = client_wrapped_value(ioc, value)
}

function irTypeOfArg(arg: IrArg | undefined): string | undefined {
  if (arg == null) return undefined
  return arg.type === 'conn' ? arg.value.type : arg.type
}

function irTypeInfoOfArg(arg: IrArg | undefined): ClientValueTypeInfo | undefined {
  const type = irTypeOfArg(arg)
  if (!type) return undefined
  if (type !== 'dict') return { type }
  const dict = arg?.type === 'conn' ? arg.value.dict : arg?.type === 'dict' ? arg.dict : undefined
  return dict ? { type, dict } : { type }
}

/** 输出类型由连线推断的反射节点（变量读取 + 字典取值/取键/取值列表） */
const OUTPUT_INFERRED_NODE_TYPES = new Set([
  'get_custom_variable',
  'get_local_variable',
  'get_list_of_values_from_dictionary',
  'get_list_of_keys_from_dictionary',
  'query_dictionary_value_by_key'
])

/**
 * 反射输出类型由输出连线推断（与服务器 inferTypedNodeIdFromOutputs 同思路）。
 * 关闭未使用节点优化时，编译器生成的局部变量 getter 可能没有消费者；此时
 * 使用同名 setter 的值类型作为可靠后备。
 */
function inferredOutputTypeInfo(
  irNode: IRNode,
  connIndex: ConnTypeIndex,
  localVariableTypes: ReadonlyMap<string, ClientValueTypeInfo>
): ClientValueTypeInfo | undefined {
  if (!OUTPUT_INFERRED_NODE_TYPES.has(irNode.type)) return undefined
  const outputs = connIndex.get(irNode.id)
  if (outputs) {
    for (const info of outputs.values()) {
      return info.type === 'dict' ? { type: info.type, dict: info.dict } : { type: info.type }
    }
  }
  if (irNode.type === 'get_local_variable') {
    const nameArg = irNode.args?.[0]
    if (isValueArg(nameArg) && nameArg.type === 'str') {
      return localVariableTypes.get(String(nameArg.value))
    }
  }
  return undefined
}

function buildLocalVariableTypeIndex(nodes: readonly IRNode[]): Map<string, ClientValueTypeInfo> {
  const types = new Map<string, ClientValueTypeInfo>()
  for (const node of nodes) {
    if (node.type !== 'set_local_variable') continue
    const nameArg = node.args?.[0]
    const valueType = irTypeInfoOfArg(node.args?.[1])
    if (!isValueArg(nameArg) || nameArg.type !== 'str' || !valueType) continue
    const name = String(nameArg.value)
    const existing = types.get(name)
    if (existing && JSON.stringify(existing) !== JSON.stringify(valueType)) {
      throw clientNodegraphError(
        CLIENT_ERROR_CODES.VALUE_TYPE_UNAVAILABLE,
        `local variable "${name}" has conflicting setter types ` +
          `"${JSON.stringify(existing)}" and "${JSON.stringify(valueType)}"`
      )
    }
    types.set(name, valueType)
  }
  return types
}

function resolvedVariantPin(
  metadata: ClientNodeMetadata,
  variant: ClientReflectVariant | undefined,
  kind: 'input' | 'output',
  index: number
): ResolvedClientPinMetadata {
  const pin = variant?.pins?.find(
    (candidate) => candidate.kind === kind && candidate.index === index
  )
  if (!pin?.clientVarType || pin.indexOfConcrete === undefined) {
    throw clientNodegraphError(
      CLIENT_ERROR_CODES.NODE_UNAVAILABLE,
      `${metadata.subType}.${metadata.nodeType} (genericId ${metadata.genericId}, ` +
        `concreteId ${variant?.concreteId ?? 'unresolved'}) has no confirmed ` +
        `${kind} pin #${index} specialization`
    )
  }
  return pin as ResolvedClientPinMetadata
}

function findOutPin(node: ClientGiaNode, pinIndex: number) {
  return node.pins.find(
    (p) => p.i1?.kind === NodePin_Index_Kind.OutParam && p.i1.index === pinIndex
  )
}

/** Apply the editor-observed type and dropdown row to every reflective pin. */
function applyResolvedReflectivePins(
  node: ClientGiaNode,
  metadata: ClientNodeMetadata,
  variant: ClientReflectVariant | undefined
) {
  // enumeration_match uses the enum class, not ClientVarType, to select its row.
  if (metadata.nodeType === 'enumeration_match') return
  if (!variant) return
  for (const pinMeta of variant.pins ?? []) {
    if (pinMeta.kind !== 'input' && pinMeta.kind !== 'output') continue
    const basePin = (pinMeta.kind === 'input' ? metadata.inputs : metadata.outputs).find(
      (pin) => pin.index === pinMeta.index
    )
    if (!basePin?.reflective) continue
    const resolved = resolvedVariantPin(metadata, variant, pinMeta.kind, pinMeta.index)
    const pin =
      pinMeta.kind === 'input' ? findInPin(node, pinMeta.index) : findOutPin(node, pinMeta.index)
    if (!pin) {
      throw new Error(`[error] missing ${pinMeta.kind} pin index ${pinMeta.index}`)
    }
    pin.type = resolved.clientVarType
    pin.value = client_wrapped_value(
      resolved.indexOfConcrete,
      client_value_base(resolved.clientVarType)
    )
  }
}

function setCountPin(node: ClientGiaNode, metadata: ClientNodeMetadata, count: number) {
  const countPin = findInPin(node, 0)
  if (!countPin) return
  const defaultCount = Number(metadata.inputs.find((pin) => pin.index === 0)?.defaultValue ?? 0)
  countPin.value =
    count === defaultCount ? client_value_base(3, count) : client_literal_value(3, count)
}

function applyAssemblyList(
  node: ClientGiaNode,
  irNode: IRNode,
  metadata: ClientNodeMetadata,
  variant: ClientReflectVariant
) {
  const elements = irNode.args ?? []
  setCountPin(node, metadata, elements.length)
  elements.forEach((arg, idx) => {
    const pinIndex = idx + 1
    const variantPin = resolvedVariantPin(metadata, variant, 'input', pinIndex)
    const clientVarType = variantPin.clientVarType
    if (!isValueArg(arg)) return
    setInPinValue(
      node,
      pinIndex,
      clientVarType,
      client_literal_value(clientVarType, toPinLiteral(clientVarType, arg.value, idx, irNode.type)),
      variantPin.indexOfConcrete
    )
  })
  const outVariantPin = resolvedVariantPin(metadata, variant, 'output', 0)
  const outPin = findOutPin(node, 0)
  if (outPin) {
    outPin.type = outVariantPin.clientVarType
    outPin.value = client_wrapped_value(
      outVariantPin.indexOfConcrete,
      client_value_base(outVariantPin.clientVarType)
    )
  }
}

function applyMultipleBranches(
  node: ClientGiaNode,
  irNode: IRNode,
  metadata: ClientNodeMetadata,
  variant: ClientReflectVariant
) {
  const args = irNode.args ?? []
  const controlArg = args[0]
  const controlPin = resolvedVariantPin(metadata, variant, 'input', 0)
  if (isValueArg(controlArg)) {
    setInPinValue(
      node,
      0,
      controlPin.clientVarType,
      client_literal_value(
        controlPin.clientVarType,
        toPinLiteral(controlPin.clientVarType, controlArg.value, 0, irNode.type)
      ),
      controlPin.indexOfConcrete
    )
  }
  const caseValues: unknown[] = []
  for (let i = 1; i < args.length; i++) {
    const a = args[i]
    if (!a || a.type === 'conn') continue
    caseValues.push(a.value)
  }
  if (caseValues.length) {
    const casesPin = resolvedVariantPin(metadata, variant, 'input', 1)
    setInPinValue(
      node,
      1,
      casesPin.clientVarType,
      client_list_literal_value(casesPin.clientVarType, caseValues),
      casesPin.indexOfConcrete
    )
  }
}

/** in->out -> TypeConversion 枚举名；枚举值 800..810 由共享枚举表（parseEnumValue）解析 */
const DATA_TYPE_CONVERSION_ENUM_NAME: Record<string, string> = {
  'int->bool': 'type_conversion_integer_to_boolean',
  'int->float': 'type_conversion_integer_to_floating_point',
  'int->str': 'type_conversion_integer_to_string',
  'entity->str': 'type_conversion_entity_to_string',
  'guid->str': 'type_conversion_guid_to_string',
  'bool->int': 'type_conversion_boolean_to_integer',
  'bool->str': 'type_conversion_boolean_to_string',
  'float->int': 'type_conversion_floating_point_to_integer',
  'float->str': 'type_conversion_floating_point_to_string',
  'vec3->str': 'type_conversion_vector_3_to_string',
  'faction->str': 'type_conversion_faction_to_string'
}

function applyDataTypeConversion(
  node: ClientGiaNode,
  irNode: IRNode,
  metadata: ClientNodeMetadata
) {
  // IR 与服务器同形：data_type_conversion_<out> + 单输入参数；枚举引脚由 in->out 反推
  const inputArg = irNode.args?.[0]
  const outIrType = irNode.type.slice('data_type_conversion_'.length)
  const inIrType = irTypeOfArg(inputArg ?? undefined)
  const enumName = inIrType
    ? DATA_TYPE_CONVERSION_ENUM_NAME[`${inIrType}->${outIrType}`]
    : undefined
  if (!enumName) {
    throw clientNodegraphError(
      CLIENT_ERROR_CODES.NODE_UNAVAILABLE,
      `${metadata.subType}.${irNode.type} unsupported conversion ${inIrType ?? 'missing'}->${outIrType}`
    )
  }
  const inClientType = CLIENT_VAR_TYPE_BY_IR_TYPE[inIrType!] ?? 0
  const outClientType = CLIENT_VAR_TYPE_BY_IR_TYPE[outIrType] ?? 0
  const inIoc = CLIENT_REFLECT_IOC_BY_TYPE[inClientType] ?? 0
  const outIoc = CLIENT_REFLECT_IOC_BY_TYPE[outClientType] ?? 0
  setInPinValue(
    node,
    0,
    13,
    client_literal_value(13, toPinLiteral(13, enumName, 0, irNode.type)),
    -1
  )
  setInPinValue(
    node,
    1,
    inClientType,
    isValueArg(inputArg)
      ? client_literal_value(
          inClientType,
          toPinLiteral(inClientType, inputArg.value, 1, irNode.type)
        )
      : client_value_base(inClientType),
    inIoc
  )
  const outPin = findOutPin(node, 0)
  if (outPin) {
    outPin.type = outClientType
    outPin.value = client_wrapped_value(outIoc, client_value_base(outClientType))
  }
}

function requireClientDictionaryTypes(
  typeInfo: ClientValueTypeInfo | undefined,
  fail: (message: string) => Error
) {
  if (typeInfo?.type !== 'dict' || !typeInfo.dict) {
    throw fail('cannot resolve dictionary key/value types')
  }
  const keyClientVarType = CLIENT_VAR_TYPE_BY_IR_TYPE[typeInfo.dict.k]
  const valueClientVarType = CLIENT_VAR_TYPE_BY_IR_TYPE[typeInfo.dict.v]
  if (keyClientVarType === undefined || valueClientVarType === undefined) {
    throw fail(`unsupported dictionary type "${typeInfo.dict.k}" -> "${typeInfo.dict.v}"`)
  }
  return { keyClientVarType, valueClientVarType }
}

/**
 * get_custom_variable resolves its output pin from the wired output type (the
 * cid table already fixed the variant). Dictionary outputs additionally carry
 * the editor's MapBase key/value metadata.
 */
function applyCustomVariableOutPin(
  node: ClientGiaNode,
  metadata: ClientNodeMetadata,
  outTypeInfo: ClientValueTypeInfo | undefined
) {
  const outIrType = outTypeInfo?.type
  if (!outIrType) return
  const outPin = findOutPin(node, 0)
  if (!outPin) return
  if (outIrType === 'dict') {
    const { keyClientVarType, valueClientVarType } = requireClientDictionaryTypes(
      outTypeInfo,
      (message) =>
        clientNodegraphError(
          CLIENT_ERROR_CODES.VALUE_TYPE_UNAVAILABLE,
          `${metadata.subType}.get_custom_variable ${message}`
        )
    )
    outPin.type = 24
    outPin.value = client_dictionary_wrapped_value(20, keyClientVarType, valueClientVarType, true)
    return
  }
  const clientVarType = CLIENT_VAR_TYPE_BY_IR_TYPE[outIrType]
  const offset = customVariableTypeOffset(outIrType)
  if (!clientVarType || offset === undefined) return
  outPin.type = clientVarType
  outPin.value = client_wrapped_value(offset, client_value_base(clientVarType))
}

/**
 * 局部变量值/输出引脚 indexOfConcrete 表（get 200082 / set 200081 全语料普查）：
 * 标量头按列表块同款类型序 int/str/entity/guid/float/vec3/bool 排列，
 * 列表块 7..13 与配置/元件/阵营/字典 14..20 与自定义变量类型序表一致。
 * 21 项全部语料实测（2026-07-11 客户端信号_局部变量类型补充.gia 补齐
 * guid/float/bool 与全部列表/配置/元件条目，推断值 13/13 命中）。
 */
const LOCAL_VAR_IOC_BY_IR: Record<string, number> = {
  int: 0,
  str: 1,
  entity: 2,
  guid: 3,
  float: 4,
  vec3: 5,
  bool: 6,
  int_list: 7,
  str_list: 8,
  entity_list: 9,
  guid_list: 10,
  float_list: 11,
  vec3_list: 12,
  bool_list: 13,
  config_id: 14,
  prefab_id: 15,
  config_id_list: 16,
  prefab_id_list: 17,
  faction: 18,
  faction_list: 19,
  dict: 20
}

/**
 * 局部变量节点：cid 恒定（设置 2000 / 获取 1036），变量类型只体现在值引脚
 * type + ConcreteBase.ioc 上。变量名(t9)引脚为普通字符串字面量（无 ioc 包裹）；
 * 设置节点值引脚按参数 IR 类型定型，获取节点出参按输出连线类型定型
 * （与自定义变量同思路）。空变量名保持编辑器默认占位（语料未命名节点同形）。
 */
function applyLocalVariableNode(
  node: ClientGiaNode,
  irNode: IRNode,
  metadata: ClientNodeMetadata,
  outTypeInfo: ClientValueTypeInfo | undefined
) {
  const fail = (msg: string) =>
    clientNodegraphError(
      CLIENT_ERROR_CODES.VALUE_TYPE_UNAVAILABLE,
      `${metadata.subType}.${irNode.type} ${msg}`
    )

  const nameArg = irNode.args?.[0]
  if (isValueArg(nameArg) && String(nameArg.value) !== '') {
    const namePin = findInPin(node, 0)
    if (namePin) {
      namePin.type = 9
      namePin.value = client_literal_value(9, String(nameArg.value))
    }
  }

  const typedPin = (typeInfo: ClientValueTypeInfo, arg: IrArg | undefined) => {
    const irType = typeInfo.type
    const clientVarType = CLIENT_VAR_TYPE_BY_IR_TYPE[irType]
    const ioc = LOCAL_VAR_IOC_BY_IR[irType]
    if (clientVarType === undefined || ioc === undefined) {
      throw fail(`unsupported variable type "${irType}"`)
    }
    if (irType === 'dict') {
      const { keyClientVarType, valueClientVarType } = requireClientDictionaryTypes(typeInfo, fail)
      return {
        clientVarType,
        value: client_dictionary_wrapped_value(ioc, keyClientVarType, valueClientVarType, true)
      }
    }
    const inner =
      isValueArg(arg) && Array.isArray(arg.value) && irType.endsWith('_list')
        ? client_list_literal_value(
            clientVarType,
            arg.value.map((v) => toPinLiteral(clientVarType, v, 1, irNode.type))
          )
        : isValueArg(arg)
          ? client_literal_value(
              clientVarType,
              toPinLiteral(clientVarType, arg.value, 1, irNode.type)
            )
          : client_value_base(clientVarType)
    return { clientVarType, value: client_wrapped_value(ioc, inner) }
  }

  if (irNode.type === 'set_local_variable') {
    const valueArg = irNode.args?.[1]
    const typeInfo = irTypeInfoOfArg(valueArg ?? undefined)
    if (!typeInfo) throw fail('cannot resolve value type from args')
    const pin = findInPin(node, 1)
    if (pin) {
      const typed = typedPin(typeInfo, valueArg ?? undefined)
      pin.type = typed.clientVarType
      pin.value = typed.value
    }
    return
  }

  // get_local_variable：优先从输出连线定型；无消费者时从同名 setter 回推。
  if (!outTypeInfo) throw fail('cannot infer output type from connections')
  const outPin = findOutPin(node, 0)
  if (outPin) {
    const typed = typedPin(outTypeInfo, undefined)
    outPin.type = typed.clientVarType
    outPin.value = typed.value
  }
}

/**
 * 字典反射引脚 indexOfConcrete 表（字典节点全语料普查）：
 * 键槽 ioc = 键类型序 entity/guid/int/str/faction/config_id（prefab_id 按表序推断）；
 * 值槽 ioc = 值类型序 entity/guid/int/bool/float/str/faction/vec3/config_id/prefab_id，
 * 列表值 ioc = 11 + 元素类型序（观测 t2→11、t4→13、t6→14、t8→15、t10→16、t12→18、t21→20）。
 */
const DICT_KEY_IOC_BY_IR: Record<string, number> = {
  entity: 0,
  guid: 1,
  int: 2,
  str: 3,
  faction: 4,
  config_id: 5,
  prefab_id: 6
}

const DICT_VALUE_IOC_BY_IR: Record<string, number> = {
  entity: 0,
  guid: 1,
  int: 2,
  bool: 3,
  float: 4,
  str: 5,
  faction: 6,
  vec3: 7,
  config_id: 8,
  prefab_id: 9
}

const DICT_VALUE_LIST_IOC_BASE = 11

function dictValueIoc(irType: string): number | undefined {
  if (irType.endsWith('_list')) {
    const base = DICT_VALUE_IOC_BY_IR[irType.slice(0, -'_list'.length)]
    return base === undefined ? undefined : DICT_VALUE_LIST_IOC_BASE + base
  }
  return DICT_VALUE_IOC_BY_IR[irType]
}

const DICT_SECOND_PIN_SLOT: Record<string, 'key' | 'value'> = {
  query_dictionary_value_by_key: 'key',
  query_if_dictionary_contains_specific_key: 'key',
  query_if_dictionary_contains_specific_value: 'value'
}

const DICT_OUT_IOC_BY_NODE_TYPE: Record<string, (irType: string) => number | undefined> = {
  get_list_of_keys_from_dictionary: (t) =>
    t.endsWith('_list') ? DICT_KEY_IOC_BY_IR[t.slice(0, -'_list'.length)] : undefined,
  get_list_of_values_from_dictionary: (t) =>
    t.endsWith('_list') ? DICT_VALUE_IOC_BY_IR[t.slice(0, -'_list'.length)] : undefined,
  query_dictionary_value_by_key: dictValueIoc
}

/**
 * 字典节点 cid 恒定，键/值类型只体现在引脚 type + ConcreteBase.ioc 上：
 * 键/值输入引脚按参数 IR 类型定型，出参按输出连线类型定型（与自定义变量同思路）。
 */
function applyDictReflectNode(
  node: ClientGiaNode,
  irNode: IRNode,
  metadata: ClientNodeMetadata,
  outTypeInfo: ClientValueTypeInfo | undefined
) {
  const fail = (msg: string) =>
    clientNodegraphError(
      CLIENT_ERROR_CODES.NODE_UNAVAILABLE,
      `${metadata.subType}.${irNode.type} ${msg}`
    )

  const dictPin = findInPin(node, 0)
  if (dictPin) {
    const { keyClientVarType, valueClientVarType } = requireClientDictionaryTypes(
      irTypeInfoOfArg(irNode.args?.[0]),
      fail
    )
    dictPin.type = 24
    dictPin.value = client_dictionary_wrapped_value(0, keyClientVarType, valueClientVarType)
  }

  const slot = DICT_SECOND_PIN_SLOT[irNode.type]
  if (slot) {
    const arg = irNode.args?.[1]
    const irType = irTypeOfArg(arg ?? undefined)
    const clientVarType = irType ? CLIENT_VAR_TYPE_BY_IR_TYPE[irType] : undefined
    const ioc =
      irType === undefined
        ? undefined
        : slot === 'key'
          ? DICT_KEY_IOC_BY_IR[irType]
          : dictValueIoc(irType)
    if (!clientVarType || ioc === undefined) {
      throw fail(`cannot resolve ${slot} pin type from "${irType ?? 'missing'}"`)
    }
    const pin = findInPin(node, 1)
    if (pin) {
      pin.type = clientVarType
      pin.value = client_wrapped_value(
        ioc,
        isValueArg(arg)
          ? client_literal_value(
              clientVarType,
              toPinLiteral(clientVarType, arg.value, 1, irNode.type)
            )
          : client_value_base(clientVarType)
      )
    }
  }

  const outIocOf = DICT_OUT_IOC_BY_NODE_TYPE[irNode.type]
  if (!outIocOf) return
  const outIrType = outTypeInfo?.type
  if (!outIrType) throw fail('cannot infer output type from connections')
  const outClientType = CLIENT_VAR_TYPE_BY_IR_TYPE[outIrType]
  const outIoc = outIocOf(outIrType)
  if (!outClientType || outIoc === undefined) {
    throw fail(`unsupported output type "${outIrType}"`)
  }
  const outPin = findOutPin(node, 0)
  if (outPin) {
    outPin.type = outClientType
    outPin.value = client_wrapped_value(outIoc, client_value_base(outClientType))
  }
}

/** 键/值槽定型 + ioc；字面量带 payload（innerSet=true），连线/空槽保持 unset */
function dictSlotValue(
  clientVarType: number,
  ioc: number,
  arg: IrArg | undefined,
  nodeType: string
) {
  if (isValueArg(arg)) {
    const literal =
      Array.isArray(arg.value) && arg.type.endsWith('_list')
        ? client_list_literal_value(clientVarType, arg.value)
        : client_literal_value(clientVarType, toPinLiteral(clientVarType, arg.value, 0, nodeType))
    return client_wrapped_value(ioc, literal)
  }
  return client_wrapped_value(ioc, client_value_base(clientVarType))
}

/**
 * 拼装字典：cid 恒定 1048，in#0 = kv 参数总数（plain int，与 assembly_list 同款），
 * in#1..#100 键/值槽交替（奇=键、偶=值），未用槽位也按键/值类型定型（全语料一致）。
 */
function applyAssemblyDictionary(
  node: ClientGiaNode,
  irNode: IRNode,
  metadata: ClientNodeMetadata
) {
  const fail = (msg: string) =>
    clientNodegraphError(
      CLIENT_ERROR_CODES.NODE_UNAVAILABLE,
      `${metadata.subType}.${irNode.type} ${msg}`
    )
  const args = irNode.args ?? []
  if (args.length === 0 || args.length % 2 !== 0 || args.length > 100) {
    throw fail(`expects 1-50 key/value pairs, got ${args.length} args`)
  }
  const keyIr = irTypeOfArg(args[0] ?? undefined)
  const valueIr = irTypeOfArg(args[1] ?? undefined)
  const keyType = keyIr ? CLIENT_VAR_TYPE_BY_IR_TYPE[keyIr] : undefined
  const valueType = valueIr ? CLIENT_VAR_TYPE_BY_IR_TYPE[valueIr] : undefined
  const keyIoc = keyIr ? DICT_KEY_IOC_BY_IR[keyIr] : undefined
  const valueIoc = valueIr ? dictValueIoc(valueIr) : undefined
  if (!keyType || keyIoc === undefined) throw fail(`unsupported key type "${keyIr ?? 'missing'}"`)
  if (!valueType || valueIoc === undefined) {
    throw fail(`unsupported value type "${valueIr ?? 'missing'}"`)
  }

  setCountPin(node, metadata, args.length)
  for (let pinIndex = 1; pinIndex <= 100; pinIndex++) {
    const pin = findInPin(node, pinIndex)
    if (!pin) continue
    const isKeySlot = (pinIndex - 1) % 2 === 0
    const arg = pinIndex - 1 < args.length ? args[pinIndex - 1] : undefined
    pin.type = isKeySlot ? keyType : valueType
    pin.value = isKeySlot
      ? dictSlotValue(keyType, keyIoc, arg, irNode.type)
      : dictSlotValue(valueType, valueIoc, arg, irNode.type)
  }
  const outPin = findOutPin(node, 0)
  if (outPin) {
    outPin.type = 24
    outPin.value = client_dictionary_wrapped_value(0, keyType, valueType)
  }
}

/**
 * 建立字典：cid 恒定 1049，in#0 键列表 / in#1 值列表按元素类型定型
 * （键槽 ioc 用键表、值槽 ioc 用值表），出参 t24 ioc0。
 */
function applyCreateDictionary(node: ClientGiaNode, irNode: IRNode, metadata: ClientNodeMetadata) {
  const fail = (msg: string) =>
    clientNodegraphError(
      CLIENT_ERROR_CODES.NODE_UNAVAILABLE,
      `${metadata.subType}.${irNode.type} ${msg}`
    )
  const pins: Array<{ index: number; iocOfElem: (elem: string) => number | undefined }> = [
    { index: 0, iocOfElem: (elem) => DICT_KEY_IOC_BY_IR[elem] },
    { index: 1, iocOfElem: (elem) => DICT_VALUE_IOC_BY_IR[elem] }
  ]
  const elementClientTypes: number[] = []
  for (const { index, iocOfElem } of pins) {
    const arg = irNode.args?.[index]
    const irType = irTypeOfArg(arg ?? undefined)
    const elem = irType?.endsWith('_list') ? irType.slice(0, -'_list'.length) : undefined
    const clientVarType = irType ? CLIENT_VAR_TYPE_BY_IR_TYPE[irType] : undefined
    const ioc = elem ? iocOfElem(elem) : undefined
    if (!clientVarType || ioc === undefined) {
      throw fail(
        `cannot resolve ${index === 0 ? 'key' : 'value'} list type from "${irType ?? 'missing'}"`
      )
    }
    const elementClientType = elem ? CLIENT_VAR_TYPE_BY_IR_TYPE[elem] : undefined
    if (elementClientType === undefined) {
      throw fail(`cannot resolve ${index === 0 ? 'key' : 'value'} element type from "${elem}"`)
    }
    elementClientTypes[index] = elementClientType
    const pin = findInPin(node, index)
    if (pin) {
      pin.type = clientVarType
      pin.value = dictSlotValue(clientVarType, ioc, arg, irNode.type)
    }
  }
  const outPin = findOutPin(node, 0)
  if (outPin) {
    outPin.type = 24
    outPin.value = client_dictionary_wrapped_value(0, elementClientTypes[0], elementClientTypes[1])
  }
}

/** 类型列表构造节点：pin0 数量 + pin1..10 枚举槽（编辑器隐藏引脚） */
const TYPE_LIST_BUILDER_NODE_TYPES = new Set(['get_entity_type_list', 'get_ray_filter_type_list'])

/** enum_list 字面量可展开的构造节点，按枚举值 key 前缀识别类 */
const TYPE_LIST_BUILDER_BY_ENUM_PREFIX = [
  { prefix: 'entity_type_', nodeType: 'get_entity_type_list' },
  { prefix: 'ray_filter_type_', nodeType: 'get_ray_filter_type_list' },
  { prefix: 'ray_hit_filter_type_', nodeType: 'get_ray_filter_type_list' }
] as const

/**
 * enum_list 字面量语法糖（服务器 expandListLiterals 同思路）：编辑器不提供
 * enum_list 字面量勾选（语料全部为空占位+连线），字面量枚举数组自动展开为
 * 获取实体类型列表 / 获取射线筛选类型列表 节点并建立连线。
 */
function expandEnumListLiterals(nodes: IRNode[], subType: string): IRNode[] {
  const out = [...nodes]
  let nextId = Math.max(...nodes.map((n) => n.id)) + 1
  for (const node of nodes) {
    for (const [idx, arg] of (node.args ?? []).entries()) {
      if (!isValueArg(arg) || arg.type !== 'enum_list' || !Array.isArray(arg.value)) continue
      const keys = arg.value as unknown[]
      const builder = TYPE_LIST_BUILDER_BY_ENUM_PREFIX.find((b) =>
        keys.every((k) => typeof k === 'string' && k.startsWith(b.prefix))
      )
      if (!keys.length || keys.length > 10 || !builder) {
        throw clientNodegraphError(
          CLIENT_ERROR_CODES.VALUE_TYPE_UNAVAILABLE,
          `${subType}.${node.type} arg #${idx}: enum list literals must be 1-10 values of ` +
            `EntityType, RayFilterType or RayHitFilterType (the editor only wires these pins from type list ` +
            `builder nodes), got ${JSON.stringify(arg.value)}`
        )
      }
      const newId = nextId++
      out.push({
        id: newId,
        type: builder.nodeType,
        args: keys.map((k) => ({ type: 'enum', value: k }))
      } as IRNode)
      node.args![idx] = {
        type: 'conn',
        value: { node_id: newId, index: 0, type: 'enum_list' }
      } as IrArg
    }
  }
  return out
}

/**
 * 类型列表构造：数量与引脚默认值不同（实体默认 1、射线默认 0）时按字面量
 * 置位（语料：数量=默认时 alreadySetVal=false）；字面量枚举槽写 plain t13
 * 字面量，连线槽由数据连线阶段补 connects、槽值保持定型 unset（语料同形）。
 */
function applyTypeListBuilder(node: ClientGiaNode, irNode: IRNode, metadata: ClientNodeMetadata) {
  const args = irNode.args ?? []
  if (args.length > 10) {
    throw clientNodegraphError(
      CLIENT_ERROR_CODES.NODE_UNAVAILABLE,
      `${metadata.subType}.${irNode.type} expects at most 10 types, got ${args.length}`
    )
  }
  if (args.length === 0) return
  const defaultCount = Number(metadata.inputs.find((p) => p.index === 0)?.defaultValue ?? 0)
  if (args.length !== defaultCount) {
    const countPin = findInPin(node, 0)
    if (countPin) countPin.value = client_literal_value(3, args.length)
  }
  args.forEach((arg, idx) => {
    if (!isValueArg(arg)) return
    const pin = findInPin(node, idx + 1)
    if (!pin) return
    pin.value = client_literal_value(13, toPinLiteral(13, arg.value, idx, irNode.type))
  })
}

/**
 * 枚举匹配字面量的类反推：值 key 以类名 snake 前缀开头（如
 * scan_status_candidate_target）；折叠下划线比较以磨平 conn.enum 逐字母
 * snake（u_i_control_group_status）与值 key（ui_control_group_status_*）的差异，
 * 键按长度降序保证取最长匹配（如 hit_performance_level 优先于 hit_type）。
 */
const ENUM_MATCH_CLASS_KEYS = [
  ...new Set(Object.values(ENUM_MATCH_ROWS_BY_GENERIC_ID).flatMap((rows) => Object.keys(rows)))
].sort((a, b) => b.length - a.length)

function enumMatchClassOfLiteral(valueKey: string): string | undefined {
  const collapsed = valueKey.replace(/_/g, '')
  return ENUM_MATCH_CLASS_KEYS.find((cls) => collapsed.startsWith(cls.replace(/_/g, '')))
}

/**
 * 枚举匹配（cid 恒定 10）：双枚举引脚 indexOfConcrete = 枚举类在编辑器下拉
 * 中的行号（两族 census，见 ENUM_MATCH_ROWS_BY_GENERIC_ID）。字面量由值命中的行
 * 定行（区分 状态添加结果 14/15 两半），连线由 conn.enum 类名取该类首行；
 * 两引脚共享同一行号（编辑器下拉是节点级单选）。
 */
function applyEnumerationMatch(node: ClientGiaNode, irNode: IRNode, metadata: ClientNodeMetadata) {
  const fail = (msg: string) =>
    clientNodegraphError(
      CLIENT_ERROR_CODES.VALUE_TYPE_UNAVAILABLE,
      `${metadata.subType}.${irNode.type} ${msg}`
    )
  const allowedClasses = ENUM_MATCH_CLASS_KEYS_BY_GENERIC_ID[metadata.genericId]
  const rowsByClass = ENUM_MATCH_ROWS_BY_GENERIC_ID[metadata.genericId]
  if (!allowedClasses) {
    throw fail(`generic ${metadata.genericId} has no enum census`)
  }
  if (!rowsByClass) {
    throw fail(`generic ${metadata.genericId} has no enum row table`)
  }
  const args = [irNode.args?.[0], irNode.args?.[1]]
  const infos = args.map((arg, i) => {
    if (isValueArg(arg)) {
      const key = String(arg.value)
      const cls = enumMatchClassOfLiteral(key)
      if (!cls) throw fail(`enum value "${key}" (arg #${i}) is not selectable in this node`)
      if (!allowedClasses.includes(cls)) {
        throw fail(`enum class "${cls}" (arg #${i}) is unavailable in this graph family`)
      }
      const rows = rowsByClass[cls]
      if (!rows) {
        throw fail(`enum class "${cls}" (arg #${i}) is unavailable in this graph family`)
      }
      const numeric = Number(toPinLiteral(13, key, i, irNode.type))
      const row = rows.find((candidate) => candidate.values.includes(numeric))
      if (!row) {
        throw fail(`enum value "${key}" (arg #${i}) is not selectable in this node`)
      }
      return { cls, literalIoc: row.ioc }
    }
    if (arg?.type === 'conn') {
      const cls = arg.value.enum
      if (!cls) return undefined
      if (!rowsByClass[cls]) {
        throw fail(`enum class "${cls}" (arg #${i}) is not selectable in this node`)
      }
      if (!allowedClasses.includes(cls)) {
        throw fail(`enum class "${cls}" (arg #${i}) is unavailable in this graph family`)
      }
      return { cls, literalIoc: undefined }
    }
    return undefined
  })

  const resolved = infos.filter((info) => info !== undefined)
  if (resolved.length === 0) {
    throw fail('cannot resolve the enum class from either pin')
  }
  if (resolved.length === 2 && resolved[0].cls !== resolved[1].cls) {
    throw fail(`enum classes differ between pins ("${resolved[0].cls}" vs "${resolved[1].cls}")`)
  }
  const literalIocs = [...new Set(resolved.flatMap((r) => r.literalIoc ?? []))]
  if (literalIocs.length > 1) {
    throw fail(
      `enum values map to different editor dropdown rows (ioc ${literalIocs[0]} vs ${literalIocs[1]})`
    )
  }
  const ioc = literalIocs[0] ?? rowsByClass[resolved[0].cls][0].ioc

  args.forEach((arg, i) => {
    const pin = findInPin(node, argPinIndex(metadata, i))
    if (!pin) return
    pin.type = 13
    pin.value = client_wrapped_value(
      ioc,
      isValueArg(arg)
        ? client_literal_value(13, toPinLiteral(13, arg.value, i, irNode.type))
        : client_value_base(13)
    )
  })
}

/**
 * 信号参数连线引脚的未填充默认载荷（客户端信号_局部变量类型补充.gia 实测：
 * t18/t19 带 bId 0、t1 无载荷、列表 bArray[]；其余标量与 vendor 未填引脚
 * defaultValue 普查一致：int/float/bool/guid/faction 0、str ''、vec3 [0,0,0]）
 */
const SIGNAL_PARAM_DEFAULT_BY_TYPE: Record<number, unknown> = {
  3: 0,
  5: 0,
  7: 0,
  9: '',
  11: [0, 0, 0],
  14: 0,
  16: 0,
  18: 0,
  19: 0
}

function applySendSignalToServer(
  node: ClientGiaNode,
  irNode: IRNode,
  metadata: ClientNodeMetadata
) {
  const nameArg = irNode.args?.[0]
  if (nameArg?.type === 'conn') {
    throw clientNodegraphError(
      CLIENT_ERROR_CODES.VALUE_TYPE_UNAVAILABLE,
      `${metadata.subType}.send_signal_to_server_node_graph does not accept wired signal name`
    )
  }
  if (!isValueArg(nameArg)) {
    throw clientNodegraphError(
      CLIENT_ERROR_CODES.VALUE_TYPE_UNAVAILABLE,
      `${metadata.subType}.send_signal_to_server_node_graph expects a literal signal name`
    )
  }
  node.genericId!.nodeId = CLIENT_SEND_SIGNAL_PLACEHOLDER_GID
  // corpus: signal name lives on the client_exec (kind 5) str pin
  const signalPin = node.pins.find((p) => p.i1?.kind === PIN_KIND_CLIENT_EXEC && p.type === 9)
  if (signalPin) signalPin.value = client_signal_name_value(String(nameArg.value))

  // 参数引脚：kind 3、按信号参数顺序（args[1..] -> pin 0..），类型为普通
  // 客户端类型（无 ConcreteBase 包裹）——客户端信号_局部变量类型补充.gia 实证
  const args = irNode.args ?? []
  const paramPins: ClientGiaNode['pins'] = []
  for (let i = 1; i < args.length; i++) {
    const arg = args[i]
    if (arg == null) continue
    const irType = irTypeOfArg(arg)
    const clientVarType = irType ? CLIENT_VAR_TYPE_BY_IR_TYPE[irType] : undefined
    if (clientVarType === undefined) {
      throw clientNodegraphError(
        CLIENT_ERROR_CODES.VALUE_TYPE_UNAVAILABLE,
        `${metadata.subType}.send_signal_to_server_node_graph param #${i - 1}: ` +
          `unsupported signal parameter type "${irType ?? 'unknown'}"`
      )
    }
    const pinIndex = i - 1
    const value = isValueArg(arg)
      ? Array.isArray(arg.value) && irType!.endsWith('_list')
        ? client_list_literal_value(
            clientVarType,
            arg.value.map((v) => toPinLiteral(clientVarType, v, i, irNode.type))
          )
        : client_literal_value(
            clientVarType,
            toPinLiteral(clientVarType, arg.value, i, irNode.type)
          )
      : client_value_base(clientVarType, SIGNAL_PARAM_DEFAULT_BY_TYPE[clientVarType])
    paramPins.push({
      i1: { kind: PIN_KIND_IN_PARAM, index: pinIndex },
      i2: { kind: PIN_KIND_IN_PARAM, index: pinIndex },
      type: clientVarType,
      value,
      connects: []
    } as ClientGiaNode['pins'][number])
  }
  // 样本引脚顺序：参数（kind3）在前，exec/信号名（kind5）与流出在后
  node.pins.unshift(...paramPins)
}

function applySpecialArgs(
  node: ClientGiaNode,
  irNode: IRNode,
  metadata: ClientNodeMetadata,
  concreteId: number | string,
  variant: ClientReflectVariant | undefined,
  inferredOutTypeInfo: ClientValueTypeInfo | undefined
): boolean {
  if (irNode.type === 'assembly_list') {
    if (!variant) throw new Error('[error] assembly_list reflect variant was not resolved')
    applyAssemblyList(node, irNode, metadata, variant)
    return true
  }
  if (irNode.type === 'multiple_branches') {
    if (!variant) throw new Error('[error] multiple_branches reflect variant was not resolved')
    applyMultipleBranches(node, irNode, metadata, variant)
    return true
  }
  if (metadata.nodeType === 'data_type_conversion') {
    applyDataTypeConversion(node, irNode, metadata)
    return true
  }
  if (irNode.type === 'get_custom_variable') {
    applyLiteralArgs(node, irNode, metadata, variant)
    applyCustomVariableOutPin(node, metadata, inferredOutTypeInfo)
    return true
  }
  if (DICT_REFLECT_NODE_TYPES.has(irNode.type)) {
    applyDictReflectNode(node, irNode, metadata, inferredOutTypeInfo)
    return true
  }
  if (LOCAL_VARIABLE_NODE_TYPES.has(irNode.type)) {
    applyLocalVariableNode(node, irNode, metadata, inferredOutTypeInfo)
    return true
  }
  if (irNode.type === 'assembly_dictionary') {
    applyAssemblyDictionary(node, irNode, metadata)
    return true
  }
  if (irNode.type === 'create_dictionary') {
    applyCreateDictionary(node, irNode, metadata)
    return true
  }
  if (TYPE_LIST_BUILDER_NODE_TYPES.has(irNode.type)) {
    applyTypeListBuilder(node, irNode, metadata)
    return true
  }
  if (irNode.type === 'enumeration_match') {
    applyEnumerationMatch(node, irNode, metadata)
    return true
  }
  if (irNode.type === 'send_signal_to_server_node_graph') {
    applySendSignalToServer(node, irNode, metadata)
    return true
  }
  return false
}

function applyLiteralArgs(
  node: ClientGiaNode,
  irNode: IRNode,
  metadata: ClientNodeMetadata,
  variant: ClientReflectVariant | undefined
) {
  for (const [argIndex, arg] of (irNode.args ?? []).entries()) {
    if (arg == null || arg.type === 'conn') continue
    const pinIndex = argPinIndex(metadata, argIndex)
    const pinMeta = metadata.inputs.find((p) => p.index === pinIndex)
    if (!pinMeta) continue
    if (Array.isArray(arg.value) && arg.type.endsWith('_list')) {
      const pin = findInPin(node, pinIndex)
      if (!pin) continue
      const variantPin = pinMeta.reflective
        ? resolvedVariantPin(metadata, variant, 'input', pinIndex)
        : undefined
      const clientVarType =
        variantPin?.clientVarType ??
        pinMeta.clientVarType ??
        CLIENT_VAR_TYPE_BY_IR_TYPE[arg.type] ??
        0
      const elements =
        clientVarType === 17
          ? arg.value.map((v) => toPinLiteral(13, v, argIndex, irNode.type))
          : arg.value
      const inner =
        elements.length === 0
          ? client_value_base(clientVarType)
          : client_list_literal_value(clientVarType, elements)
      pin.type = clientVarType
      pin.value = variantPin ? client_wrapped_value(variantPin.indexOfConcrete, inner) : inner
      continue
    }
    const pin = findInPin(node, pinIndex)
    if (!pin) continue
    if (
      metadata.specialKind === 'inline_var_type_hint' &&
      (pinMeta.clientVarType === 18 || pinMeta.clientVarType === 19)
    ) {
      // Only 200052/200128 carry fixed editor-selector metadata in field #3.
      // The selected prefab/config ID itself is still stored in bId.
      pin.type = pinMeta.clientVarType
      pin.value = client_inline_var_value(pinMeta.clientVarType as 18 | 19, Number(arg.value))
      continue
    }
    if (pinMeta.reflective) {
      const variantPin = resolvedVariantPin(metadata, variant, 'input', pinIndex)
      pin.type = variantPin.clientVarType
      pin.value = client_wrapped_value(
        variantPin.indexOfConcrete,
        client_literal_value(
          variantPin.clientVarType,
          toPinLiteral(variantPin.clientVarType, arg.value, argIndex, irNode.type)
        )
      )
    } else {
      const clientVarType = pinMeta.clientVarType ?? 0
      pin.type = clientVarType
      pin.value = client_literal_value(
        clientVarType,
        toPinLiteral(clientVarType, arg.value, argIndex, irNode.type)
      )
    }
  }
}

export function clientIrToGia(ir: ClientIRDocument, opts: IrToGiaOptions): Uint8Array {
  const graphId = opts.graphId ?? resolveGraphIdForGraph(ir.graph)
  const name = opts.name ?? ir.graph.name ?? '_GSTS_Generated_Client_Graph'
  const uid = opts.uid ?? 100000001
  const mode = ir.graph.mode ?? 'beyond'
  if (!isClientGraphModeAvailable(ir.graph.sub_type, mode)) {
    const reason = CLIENT_GRAPH_CAPABILITY_BY_SUB_TYPE[ir.graph.sub_type][mode].reason
    throw clientNodegraphError(
      CLIENT_ERROR_CODES.MODE_UNAVAILABLE,
      `${ir.graph.sub_type} is not available in ${mode} mode${reason ? `: ${reason}` : ''}`
    )
  }
  if (!ir.nodes?.length) throw new Error('IR document must have at least one node')
  const nodes = expandEnumListLiterals(ir.nodes, ir.graph.sub_type)
  ir = { ...ir, nodes }
  const isFilter = ir.graph.sub_type === 'bool_filter' || ir.graph.sub_type === 'int_filter'

  const graphInfo = buildExecutionGraph(nodes)
  const positions = layoutPositions(nodes, graphInfo)
  const connIndex = buildConnTypeIndex(ir)
  const localVariableTypes = buildLocalVariableTypeIndex(nodes)
  const builtById = new Map<NodeId, ClientGiaNode>()
  const metadataById = new Map<NodeId, ClientNodeMetadata>()
  const variantById = new Map<NodeId, ClientReflectVariant | undefined>()

  for (const irNode of nodes) {
    const metadata = resolveClientNodeMetadata(ir.graph.sub_type, mode, irNode)
    metadataById.set(irNode.id, metadata)
    const inferredOutTypeInfo = inferredOutputTypeInfo(irNode, connIndex, localVariableTypes)
    const inferredOutType = inferredOutTypeInfo?.type
    const variant = resolveClientReflectVariant(metadata, irNode)
    variantById.set(irNode.id, variant)
    const concreteId = resolveClientConcreteVariant(metadata, irNode, inferredOutType)
    const pos = positions.get(irNode.id) ?? [0, 0]
    const isFilterResult =
      irNode.type === 'node_graph_end_boolean' || irNode.type === 'node_graph_end_integer'
    const node = client_node_body({
      metadata,
      unique_index: isFilterResult ? 1 : irNode.id,
      x: pos[0] / 300,
      y: pos[1] / 200,
      concrete_id: concreteId
    })
    if (metadata.specialKind === 'start' && metadata.subType.startsWith('creation_status')) {
      const outputCount = Math.max(
        1,
        ...(irNode.next ?? []).map((next) =>
          typeof next === 'number' ? 1 : (next.source_index ?? 0) + 1
        )
      )
      node.statusNodeExtension = { type: 1, inner: { value: outputCount } }
      node.pins = node.pins.filter(
        (pin) => pin.i1?.kind !== PIN_KIND_OUT_FLOW || Number(pin.i1.index) < outputCount
      )
    }
    applyResolvedReflectivePins(node, metadata, variant)
    if (!applySpecialArgs(node, irNode, metadata, concreteId, variant, inferredOutTypeInfo)) {
      applyLiteralArgs(node, irNode, metadata, variant)
    }
    builtById.set(irNode.id, node)
  }

  for (const { fromId, toId, fromIndex, toIndex } of graphInfo.flowConnections) {
    const from = builtById.get(fromId)
    const to = builtById.get(toId)
    if (!from || !to) throw new Error(`[error] bad client flow connection ${fromId}->${toId}`)
    const toIndex2 = pinI2Index(metadataById.get(toId)!, 'in_flow', toIndex)
    const connect = client_node_connect_to(to.nodeIndex, toIndex, toIndex2)
    const existing = from.pins.find(
      (p) => p.i1?.kind === PIN_KIND_OUT_FLOW && p.i1.index === fromIndex
    )
    if (existing) existing.connects.push(connect)
    else {
      const fromIndex2 = pinI2Index(metadataById.get(fromId)!, 'out_flow', fromIndex)
      from.pins.push({
        i1: { kind: PIN_KIND_OUT_FLOW, index: fromIndex },
        i2: { kind: PIN_KIND_OUT_FLOW, index: fromIndex2 },
        connects: [connect]
      } as (typeof from.pins)[number])
    }
  }

  for (const { fromId, toId, fromIndex, toIndex } of graphInfo.dataConnections) {
    const from = builtById.get(fromId)
    const to = builtById.get(toId)
    if (!from || !to) throw new Error(`[error] bad client data connection ${fromId}->${toId}`)
    const toMeta = metadataById.get(toId)!
    const toPinIndex = remapClientInputIndex(toMeta, toIndex)
    const pin = findInPin(to, toPinIndex)
    if (!pin) throw new Error(`[error] missing client input pin ${toId}.${toPinIndex}`)
    const pinMeta = toMeta.inputs.find((candidate) => candidate.index === toPinIndex)
    if (pinMeta?.connectable === false) {
      throw clientNodegraphError(
        CLIENT_ERROR_CODES.LITERAL_REQUIRED,
        `${toMeta.subType}.${toMeta.nodeType} input pin #${toPinIndex} only accepts a literal value; ` +
          'the editor exposes no connection socket'
      )
    }
    const fromIndex2 = pinI2Index(metadataById.get(fromId)!, 'output', fromIndex)
    pin.connects = [client_node_connect_from(from.nodeIndex, fromIndex, fromIndex2)]
    // Special handlers may leave a connected reflective pin unresolved; use
    // the exact per-pin specialization captured from editor samples.
    if (
      pinMeta?.reflective &&
      pin.value?.class === VarBase_Class.ConcreteBase &&
      pin.value.bConcreteValue?.indexOfConcrete === -1
    ) {
      const variantPin = resolvedVariantPin(toMeta, variantById.get(toId), 'input', toPinIndex)
      pin.type = variantPin.clientVarType
      pin.value = client_wrapped_value(
        variantPin.indexOfConcrete,
        client_value_base(variantPin.clientVarType)
      )
    }
  }

  const encoding = getClientGraphEncoding(ir.graph.sub_type)
  const relatedStatusGraphIds = [
    ...new Set(
      nodes.flatMap((node) => {
        if (node.type !== 'switch_to_self_execution_status') return []
        const statusGraphId = node.args?.[1]
        if (!isValueArg(statusGraphId) || statusGraphId.type !== 'config_id') return []
        const id = Number(statusGraphId.value)
        return Number.isSafeInteger(id) && id > 0 ? [id] : []
      })
    )
  ]
  const root: GiaRoot = client_graph_body({
    uid,
    graph_id: graphId,
    graph_name: name,
    graphType: encoding.graphType,
    graphWhich: encoding.graphWhich,
    modeFlag: mode === 'classic' ? 1 : undefined,
    evaluation_interval: isFilter
      ? (ir.graph.evaluation_interval ?? CLIENT_FILTER_DEFAULT_EVALUATION_INTERVAL)
      : undefined,
    related_graph_ids: relatedStatusGraphIds,
    nodes: [...builtById.values()]
  })

  const { rootMessage } = loadGiaProto(opts.protoPath)
  return new Uint8Array(
    opts.lowMemoryEncoding ? wrapGiaLowMemory(rootMessage, root) : wrap_gia(rootMessage, root)
  )
}
