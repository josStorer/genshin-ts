import type {
  Argument,
  CommonLiteralValueListTypeMap,
  ConnectionArgument,
  LiteralValueType,
  ValueType,
  Variable
} from './IR.js'
import {
  bool,
  configId,
  dict,
  dictLiteral,
  entity,
  entityLiteral,
  faction,
  float,
  generic,
  guid,
  int,
  list,
  listLiteral,
  prefabId,
  ReadonlyDict,
  RuntimeParameterValueTypeMap,
  RuntimeReturnValueTypeMap,
  str,
  vec3,
  type BoolValue,
  type ConfigIdValue,
  type DictKeyType,
  type DictValueType,
  type EntityValue,
  type FactionValue,
  type FloatValue,
  type GuidValue,
  type IntValue,
  type PrefabIdValue,
  type StrValue,
  type value,
  type Vec3Value
} from './value.js'

export type VariablesDefinition = Record<string, unknown>

export class ExposedVariable<T> {
  declare private readonly __exposedVariable: true
  constructor(readonly value: T) {}
}

export type NodeGraphVariableMeta = {
  type: LiteralValueType
  dict?: { k: DictKeyType; v: DictValueType }
}

export type ListValueInfo = {
  type: keyof CommonLiteralValueListTypeMap
  length: number
  // values无用, 暂留
  values?: CommonLiteralValueListTypeMap[keyof CommonLiteralValueListTypeMap]
}

export function isListValueInfo(v: unknown): v is ListValueInfo {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  const info = v as { type?: unknown; length?: unknown; values?: unknown }
  if (typeof info.type !== 'string' || !info.type.endsWith('_list')) return false
  if (info.length !== undefined && typeof info.length !== 'number') return false
  if (info.values !== undefined && !Array.isArray(info.values)) return false
  return info.length !== undefined || info.values !== undefined
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

type ListType = `${ScalarType}_list`

type ParsedVar = {
  variable: Variable
  meta: NodeGraphVariableMeta
}

type ScalarLiteral = {
  type: ScalarType
  value?: unknown
}

type ParsedList = {
  listType: ListType
  value?: unknown[]
  length?: number
}

type ParsedDictValue =
  | { valueType: DictValueType; value?: unknown; length?: number }
  | { valueType: DictValueType; value?: ListValueInfo }

type ParsedDict = {
  keyType: DictKeyType
  valueType: DictValueType
  pairs: { k: unknown; v: unknown }[]
  typeOnly: boolean
}

function isRecord(v: unknown): v is Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  const proto = Object.getPrototypeOf(v) as object | null
  return proto === Object.prototype || proto === null
}

function getDeclaredEntityGuid(v: entity): bigint | number | null {
  if (v instanceof entityLiteral) return v.getDeclaredGuid()
  return null
}

type LiteralArgument = Exclude<Argument, ConnectionArgument | null>

function isLiteralArgument(arg: Argument): arg is LiteralArgument {
  return !!arg && arg.type !== 'conn'
}

function ensureLiteralValue<T extends ValueType>(input: value, expected: T, label: string) {
  const literal = input.toIRLiteral()
  if (!isLiteralArgument(literal) || literal.type !== expected) {
    throw new Error(`[error] ${label} must be a literal ${expected}`)
  }
  return literal.value as never
}

function parseScalarLiteral(name: string, raw: unknown): ScalarLiteral | null {
  if (raw instanceof bool) return { type: 'bool', value: ensureLiteralValue(raw, 'bool', name) }
  if (typeof raw === 'boolean') return { type: 'bool', value: raw }
  if (raw instanceof int) return { type: 'int', value: ensureLiteralValue(raw, 'int', name) }
  if (typeof raw === 'bigint') return { type: 'int', value: Number(raw) }
  if (raw instanceof float) return { type: 'float', value: ensureLiteralValue(raw, 'float', name) }
  if (typeof raw === 'number') return { type: 'float', value: raw }
  if (raw instanceof str) return { type: 'str', value: ensureLiteralValue(raw, 'str', name) }
  if (typeof raw === 'string') return { type: 'str', value: raw }
  if (raw instanceof vec3) return { type: 'vec3', value: ensureLiteralValue(raw, 'vec3', name) }
  if (Array.isArray(raw) && raw.length === 3 && raw.every((item) => typeof item === 'number')) {
    return { type: 'vec3', value: raw as [number, number, number] }
  }
  if (raw instanceof guid) return { type: 'guid', value: ensureLiteralValue(raw, 'guid', name) }
  if (raw instanceof prefabId)
    return { type: 'prefab_id', value: ensureLiteralValue(raw, 'prefab_id', name) }
  if (raw instanceof configId)
    return { type: 'config_id', value: ensureLiteralValue(raw, 'config_id', name) }
  if (raw instanceof faction)
    return { type: 'faction', value: ensureLiteralValue(raw, 'faction', name) }
  if (raw instanceof entity) {
    const guid = getDeclaredEntityGuid(raw)
    if (guid === null) {
      throw new Error(
        `[error] ${name}: entity literal must be created by entity(0)/entity(null) and is type-only`
      )
    }
    if (Number(guid) !== 0) {
      throw new Error(
        `[error] ${name}: entity literal must be entity(0)/entity(null) (type-only, no initial value)`
      )
    }
    return { type: 'entity' }
  }
  return null
}

function parseListItems(raw: unknown): { items: unknown[]; explicitType?: ScalarType } | null {
  if (raw instanceof listLiteral) {
    const items = raw.getItems()
    return {
      items: (items ?? []) as unknown[],
      explicitType: raw.getConcreteType() as ScalarType
    }
  }
  if (raw instanceof list) {
    return { items: [], explicitType: raw.getConcreteType() as ScalarType }
  }
  if (Array.isArray(raw)) {
    return { items: raw }
  }
  return null
}

function inspectArray(items: unknown[]) {
  const defined: unknown[] = []
  let holes = 0
  for (let i = 0; i < items.length; i += 1) {
    if (Object.prototype.hasOwnProperty.call(items, i)) {
      defined.push(items[i])
    } else {
      holes += 1
    }
  }
  return { defined, holes, length: items.length }
}

function toListType(type: ScalarType): ListType {
  return `${type}_list`
}

function inferScalarTypeForList(name: string, raw: unknown): ScalarLiteral {
  const scalar = parseScalarLiteral(name, raw)
  if (!scalar) {
    throw new Error(`[error] ${name}: unsupported list element type`)
  }
  return scalar
}

function parseListValue(name: string, raw: unknown): ParsedList | null {
  const listInfo = parseListItems(raw)
  if (!listInfo) return null

  const { items, explicitType } = listInfo
  const { defined, holes, length } = inspectArray(items)
  if (defined.length > 0 && holes > 0) {
    throw new Error(`[error] ${name}: list cannot mix holes with defined values`)
  }

  if (defined.length === 0) {
    if (!explicitType) {
      throw new Error(`[error] ${name}: empty list cannot infer type, use list(type, [])`)
    }
    const listType = toListType(explicitType)
    if (explicitType === 'entity') {
      return { listType, length }
    }
    if (length > 0) {
      return { listType, length }
    }
    return { listType, value: [] }
  }

  const first = inferScalarTypeForList(name, defined[0])
  const baseType = explicitType ?? first.type
  if (baseType !== first.type) {
    throw new Error(`[error] ${name}: list element type mismatch`)
  }

  const listType = toListType(baseType)
  if (baseType === 'entity') {
    defined.forEach((item) => inferScalarTypeForList(name, item))
    return { listType, length }
  }

  const values = defined.map((item, idx) => {
    const parsed = inferScalarTypeForList(name, item)
    if (parsed.type !== baseType) {
      throw new Error(`[error] ${name}: list element type mismatch at index ${idx}`)
    }
    return parsed.value
  })
  return { listType, value: values }
}

function parseDictKey(name: string, raw: unknown): { type: DictKeyType; value: unknown } {
  if (raw instanceof int) return { type: 'int', value: ensureLiteralValue(raw, 'int', name) }
  if (typeof raw === 'bigint') return { type: 'int', value: Number(raw) }
  if (typeof raw === 'number') {
    if (!Number.isInteger(raw)) {
      throw new Error(`[error] ${name}: dict key number must be an integer`)
    }
    return { type: 'int', value: raw }
  }
  if (raw instanceof str) return { type: 'str', value: ensureLiteralValue(raw, 'str', name) }
  if (typeof raw === 'string') return { type: 'str', value: raw }
  if (raw instanceof entity) {
    const guid = getDeclaredEntityGuid(raw)
    if (guid === null || Number(guid) !== 0) {
      throw new Error(
        `[error] ${name}: dict entity key must be entity(0)/entity(null) (type-only, no initial value)`
      )
    }
    return { type: 'entity', value: raw }
  }
  if (raw instanceof guid) return { type: 'guid', value: ensureLiteralValue(raw, 'guid', name) }
  if (raw instanceof faction)
    return { type: 'faction', value: ensureLiteralValue(raw, 'faction', name) }
  if (raw instanceof configId)
    return { type: 'config_id', value: ensureLiteralValue(raw, 'config_id', name) }
  if (raw instanceof prefabId)
    return { type: 'prefab_id', value: ensureLiteralValue(raw, 'prefab_id', name) }
  throw new Error(`[error] ${name}: unsupported dict key type`)
}

function parseDictValue(name: string, raw: unknown): ParsedDictValue {
  const listParsed = parseListValue(name, raw)
  if (listParsed) {
    const listType = listParsed.listType as DictValueType
    if (listType === 'entity_list') {
      if (listParsed.value && listParsed.value.length) {
        throw new Error(`[error] ${name}: entity_list cannot set initial values, use length only`)
      }
      return {
        valueType: listType,
        value: {
          type: listType as keyof CommonLiteralValueListTypeMap,
          length: listParsed.length ?? 0
        } satisfies ListValueInfo
      }
    }
    if (listParsed.value) {
      return { valueType: listType, value: listParsed.value }
    }
    return {
      valueType: listType,
      value: {
        type: listType as keyof CommonLiteralValueListTypeMap,
        length: listParsed.length ?? 0
      } satisfies ListValueInfo
    }
  }

  const scalar = parseScalarLiteral(name, raw)
  if (!scalar) {
    throw new Error(`[error] ${name}: unsupported dict value type`)
  }
  if (scalar.type === 'entity') {
    return { valueType: 'entity', value: undefined }
  }
  return { valueType: scalar.type as DictValueType, value: scalar.value }
}

function parseDictVariable(name: string, raw: unknown): ParsedDict | null {
  if (raw instanceof dictLiteral) {
    const pairs = raw.getPairs()
    return parseDictPairs(name, pairs)
  }
  if (raw instanceof dict) {
    return {
      keyType: raw.getKeyType() as DictKeyType,
      valueType: raw.getValueType() as DictValueType,
      pairs: [],
      typeOnly: true
    }
  }
  if (isRecord(raw)) {
    const keys = Object.keys(raw)
    if (!keys.length) throw new Error(`[error] ${name}: dict cannot be empty`)
    const pairs = keys.map((k) => ({ k, v: raw[k] }))
    return parseDictPairs(name, pairs)
  }
  return null
}

function parseDictPairs(name: string, pairs: { k: unknown; v: unknown }[]): ParsedDict {
  if (!pairs.length) {
    throw new Error(`[error] ${name}: dict requires at least one pair`)
  }
  const firstKey = parseDictKey(name, pairs[0].k)
  const firstValue = parseDictValue(name, pairs[0].v)
  const keyType = firstKey.type
  const valueType = firstValue.valueType

  const parsedPairs = pairs.map((pair, idx) => {
    const key = parseDictKey(name, pair.k)
    if (key.type !== keyType) {
      throw new Error(`[error] ${name}: dict key type mismatch at index ${idx}`)
    }
    const val = parseDictValue(name, pair.v)
    if (val.valueType !== valueType) {
      throw new Error(`[error] ${name}: dict value type mismatch at index ${idx}`)
    }
    return { k: key.value, v: val.value }
  })

  if (keyType === 'entity') {
    if (pairs.length !== 1) {
      throw new Error(
        `[error] ${name}: dict with entity key cannot set initial values (use a single pair for type declaration)`
      )
    }
    return { keyType, valueType, pairs: parsedPairs, typeOnly: true }
  }

  return { keyType, valueType, pairs: parsedPairs, typeOnly: false }
}

function parseScalarVariable(name: string, raw: unknown): ParsedVar {
  const scalar = parseScalarLiteral(name, raw)
  if (!scalar) {
    throw new Error(`[error] ${name}: unsupported variable type`)
  }
  if (scalar.type === 'entity') {
    return {
      variable: { name, type: 'entity' },
      meta: { type: 'entity' }
    }
  }
  return {
    variable: { name, type: scalar.type, value: scalar.value },
    meta: { type: scalar.type }
  }
}

function parseListVariable(name: string, listParsed: ParsedList): ParsedVar {
  const variable: Variable = {
    name,
    type: listParsed.listType
  }
  if (listParsed.value !== undefined) variable.value = listParsed.value as never
  if (listParsed.length !== undefined) variable.length = listParsed.length
  return {
    variable,
    meta: { type: listParsed.listType }
  }
}

function parseDictVar(name: string, dictParsed: ParsedDict): ParsedVar {
  const variable: Variable = {
    name,
    type: 'dict',
    dict: { k: dictParsed.keyType, v: dictParsed.valueType }
  }
  if (!dictParsed.typeOnly) {
    variable.value = dictParsed.pairs as never
  }
  return {
    variable,
    meta: { type: 'dict', dict: { k: dictParsed.keyType, v: dictParsed.valueType } }
  }
}

function parseVariable(name: string, raw: unknown) {
  if (raw === undefined) {
    throw new Error(`[error] ${name}: variable value is required`)
  }
  const dictParsed = parseDictVariable(name, raw)
  if (dictParsed) return parseDictVar(name, dictParsed)
  const listParsed = parseListValue(name, raw)
  if (listParsed) return parseListVariable(name, listParsed)
  return parseScalarVariable(name, raw)
}

export function parseVariableDefinitions(vars?: VariablesDefinition): {
  variables: Variable[]
  metaByName: Map<string, NodeGraphVariableMeta>
} {
  if (!vars) return { variables: [], metaByName: new Map() }
  if (!isRecord(vars)) {
    throw new Error('[error] variables must be an object')
  }

  const variables: Variable[] = []
  const metaByName = new Map<string, NodeGraphVariableMeta>()

  for (const [name, definition] of Object.entries(vars)) {
    const exposed = definition instanceof ExposedVariable
    const parsed = parseVariable(name, exposed ? definition.value : definition)
    if (exposed) parsed.variable.exposed = true
    variables.push(parsed.variable)
    metaByName.set(name, parsed.meta)
  }

  return { variables, metaByName }
}

type VarSpec =
  | { type: ValueType; dict?: { k: DictKeyType; v: DictValueType } }
  | { type: 'generic' }

type ScalarVarTypeFromValue<V> = V extends BoolValue
  ? 'bool'
  : V extends FloatValue
    ? 'float'
    : V extends IntValue
      ? 'int'
      : V extends StrValue
        ? 'str'
        : V extends Vec3Value
          ? 'vec3'
          : V extends GuidValue
            ? 'guid'
            : V extends EntityValue
              ? 'entity'
              : V extends PrefabIdValue
                ? 'prefab_id'
                : V extends ConfigIdValue
                  ? 'config_id'
                  : V extends FactionValue
                    ? 'faction'
                    : never

type ListTypeFromScalar<T> = T extends ScalarType ? `${T}_list` : never

type ListVarTypeFromValue<V> = V extends (infer E)[]
  ? ListTypeFromScalar<ScalarVarTypeFromValue<E>>
  : never

type DictValueTypeFromValue<V> = [ListVarTypeFromValue<V>] extends [never]
  ? ScalarVarTypeFromValue<V> extends infer S
    ? S extends DictValueType
      ? S
      : never
    : never
  : ListVarTypeFromValue<V> extends infer L
    ? L extends DictValueType
      ? L
      : never
    : never

type VarSpecFromValue<V> =
  V extends ReadonlyDict<infer K, infer V2>
    ? { type: 'dict'; dict: { k: K; v: V2 } }
    : V extends dict<infer K, infer V2>
      ? { type: 'dict'; dict: { k: K; v: V2 } }
      : ListVarTypeFromValue<V> extends never
        ? V extends Record<string, infer V2>
          ? DictValueTypeFromValue<V2> extends infer D
            ? D extends DictValueType
              ? { type: 'dict'; dict: { k: 'str'; v: D } }
              : { type: 'generic' }
            : { type: 'generic' }
          : ScalarVarTypeFromValue<V> extends never
            ? { type: 'generic' }
            : { type: ScalarVarTypeFromValue<V> }
        : { type: ListVarTypeFromValue<V> }

/** Variable spec of a definition; exposed(...) only marks the variable, so unwrap it first. */
type VarSpecOf<V> = VarSpecFromValue<V extends ExposedVariable<infer T> ? T : V>

type VarReturnType<S extends VarSpec> = S extends { type: 'dict'; dict: infer D }
  ? D extends { k: infer K; v: infer V }
    ? dict<K & DictKeyType, V & DictValueType>
    : dict
  : S extends { type: 'generic' }
    ? generic
    : S extends { type: infer T }
      ? T extends keyof RuntimeReturnValueTypeMap
        ? RuntimeReturnValueTypeMap[T]
        : generic
      : generic

type VarParamType<S extends VarSpec> = S extends { type: 'dict'; dict: infer D }
  ? D extends { k: infer K; v: infer V }
    ? dict<K & DictKeyType, V & DictValueType>
    : dict
  : S extends { type: 'generic' }
    ? RuntimeParameterValueTypeMap[keyof RuntimeParameterValueTypeMap]
    : S extends { type: infer T }
      ? T extends keyof RuntimeParameterValueTypeMap
        ? RuntimeParameterValueTypeMap[T]
        : RuntimeParameterValueTypeMap[keyof RuntimeParameterValueTypeMap]
      : RuntimeParameterValueTypeMap[keyof RuntimeParameterValueTypeMap]

export type NodeGraphVarApi<Vars extends VariablesDefinition> = {
  /**
   * Alias for getNodeGraphVariable with variable type inference.
   *
   * 获取节点图变量（自动类型推断）: 作为 getNodeGraphVariable 的别名，自动推断已注册变量的类型
   *
   * Returns the value of the specified Node Graph Variable from the current Node Graph; If the variable does not exist, returns the type's default value
   *
   * 获取节点图变量: 获取当前节点图的指定节点图变量的值; 如果变量不存在，则返回类型的默认值
   *
   * @param variableName
   *
   * 变量名
   *
   * @returns
   *
   * 变量值
   */
  get<K extends keyof Vars>(name: K): VarReturnType<VarSpecOf<Vars[K]>>
  /**
   * Alias for getNodeGraphVariable with variable type inference.
   *
   * 获取节点图变量（自动类型推断）: 作为 getNodeGraphVariable 的别名，自动推断已注册变量的类型
   *
   * Returns the value of the specified Node Graph Variable from the current Node Graph; If the variable does not exist, returns the type's default value
   *
   * 获取节点图变量: 获取当前节点图的指定节点图变量的值; 如果变量不存在，则返回类型的默认值
   *
   * @param variableName
   *
   * 变量名
   *
   * @returns
   *
   * 变量值
   */
  get(name: StrValue): generic
  /**
   * Alias for setNodeGraphVariable with variable type inference.
   *
   * 设置节点图变量（自动类型推断）: 作为 setNodeGraphVariable 的别名，自动推断已注册变量的类型
   *
   * Set the value of the specified Node Graph Variable in the current Node Graph
   *
   * 设置节点图变量: 为当前节点图内的指定节点图变量设置值
   *
   * @param variableName Name of the Node Graph Variable. Must be unique within the same Node Graph
   *
   * 变量名: 节点图变量的命名，同节点图内不可重复
   * @param variableValue Value assigned to this variable
   *
   * 变量值: 赋予该变量的值
   * @param triggerEvent Default: False. If set to False, this Node Graph Variable editing will not trigger the Variable Change Event
   *
   * 是否触发事件: 默认为否。选为否时，这次节点图变量修改不会触发节点图变量变化时事件
   */
  set<K extends keyof Vars>(
    name: K,
    value: VarParamType<VarSpecOf<Vars[K]>>,
    triggerEvent?: BoolValue
  ): void
  /**
   * Alias for setNodeGraphVariable with variable type inference.
   *
   * 设置节点图变量（自动类型推断）: 作为 setNodeGraphVariable 的别名，自动推断已注册变量的类型
   *
   * Set the value of the specified Node Graph Variable in the current Node Graph
   *
   * 设置节点图变量: 为当前节点图内的指定节点图变量设置值
   *
   * @param variableName Name of the Node Graph Variable. Must be unique within the same Node Graph
   *
   * 变量名: 节点图变量的命名，同节点图内不可重复
   * @param variableValue Value assigned to this variable
   *
   * 变量值: 赋予该变量的值
   * @param triggerEvent Default: False. If set to False, this Node Graph Variable editing will not trigger the Variable Change Event
   *
   * 是否触发事件: 默认为否。选为否时，这次节点图变量修改不会触发节点图变量变化时事件
   */
  set<T extends NodeGraphVariableValueType>(
    name: StrValue,
    value: RuntimeParameterValueTypeMap[T],
    triggerEvent?: BoolValue
  ): void
}

type NodeGraphVariableValueType =
  | 'bool'
  | 'config_id'
  | 'entity'
  | 'faction'
  | 'float'
  | 'guid'
  | 'int'
  | 'prefab_id'
  | 'str'
  | 'vec3'
  | 'bool_list'
  | 'config_id_list'
  | 'entity_list'
  | 'faction_list'
  | 'float_list'
  | 'guid_list'
  | 'int_list'
  | 'prefab_id_list'
  | 'str_list'
  | 'vec3_list'
  | 'dict'
