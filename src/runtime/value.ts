import type { SimplifyDeep } from 'type-fest'

import type {
  CharacterEntity,
  CreationEntity,
  ObjectEntity,
  PlayerEntity,
  StageEntity
} from '../definitions/entity_helpers.js'
import { EnumerationType } from '../definitions/enum.js'
import { CLIENT_ERROR_CODES, clientNodegraphError } from '../shared/client_capability_errors.js'
import { callActiveGraphFunction } from './active_graph_functions.js'
import {
  Argument,
  CommonLiteralValueListTypeMap,
  CommonLiteralValueTypeMap,
  ListableValueTypeMap,
  LiteralValueType,
  LiteralValueTypeMapWithoutList,
  LiteralValueTypeMapWithoutStructAndListAndDict
} from './IR.js'
import type { MetaCallRecordRef } from './meta_call_types.js'

export type RuntimeValueTypeMap = {
  bool: bool
  int: int
  float: float
  str: str
  vec3: vec3
  guid: guid
  entity: entity
  prefab_id: prefabId
  config_id: configId
  faction: faction
  struct: struct
  dict: dict
  enum: enumeration
  enumeration: enumeration
  generic: generic
  custom_variable_snapshot: customVariableSnapshot
  local_variable: localVariable
  bool_list: list<'bool'>
  int_list: list<'int'>
  float_list: list<'float'>
  str_list: list<'str'>
  vec3_list: list<'vec3'>
  guid_list: list<'guid'>
  entity_list: list<'entity'>
  prefab_id_list: list<'prefab_id'>
  config_id_list: list<'config_id'>
  faction_list: list<'faction'>
  struct_list: list<'struct'>
}

export type RuntimeParameterValueTypeMap = {
  bool: BoolValue
  int: IntValue
  float: FloatValue
  str: StrValue
  vec3: Vec3Value
  guid: GuidValue
  entity: EntityValue
  prefab_id: PrefabIdValue
  config_id: ConfigIdValue
  faction: FactionValue
  struct: StructValue
  dict: DictValue
  enum: EnumerationValue
  enumeration: EnumerationValue
  generic: GenericValue
  custom_variable_snapshot: CustomVariableSnapshotValue
  local_variable: LocalVariableValue
  bool_list: BoolValue[]
  int_list: IntValue[]
  float_list: FloatValue[]
  str_list: StrValue[]
  vec3_list: Vec3Value[]
  guid_list: GuidValue[]
  entity_list: EntityValue[]
  prefab_id_list: PrefabIdValue[]
  config_id_list: ConfigIdValue[]
  faction_list: FactionValue[]
  enum_list: EnumerationValue[]
  struct_list: StructValue[]
}

export type RuntimeReturnValueTypeMap = {
  bool: boolean
  int: bigint
  float: number
  str: string
  vec3: vec3
  guid: guid
  entity: entity
  prefab_id: prefabId
  config_id: configId
  faction: faction
  struct: struct
  dict: dict
  enum: enumeration
  enumeration: enumeration
  generic: generic
  custom_variable_snapshot: customVariableSnapshot
  local_variable: localVariable
  bool_list: boolean[]
  int_list: bigint[]
  float_list: number[]
  str_list: string[]
  vec3_list: vec3[]
  guid_list: guid[]
  entity_list: entity[]
  prefab_id_list: prefabId[]
  config_id_list: configId[]
  faction_list: faction[]
  enum_list: enumeration[]
  struct_list: struct[]
}

export type RuntimeLiteralValueTypeMapWithoutList = Pick<
  RuntimeValueTypeMap,
  keyof LiteralValueTypeMapWithoutList
>

export type RuntimeListableValueTypeMap = Pick<RuntimeValueTypeMap, keyof ListableValueTypeMap>

export type CommonRuntimeLiteralValueTypeMap = RuntimeLiteralValueTypeMapWithoutStructAndListAndDict
export type RuntimeLiteralValueTypeMapWithoutStructAndListAndDict = Pick<
  RuntimeValueTypeMap,
  keyof LiteralValueTypeMapWithoutStructAndListAndDict
>

export type ValueLiteralMeta = { kind: 'literal' }
export type ValuePinMeta = {
  kind: 'pin'
  record: MetaCallRecordRef
  pinName: string
  pinIndex: number
}

export type ValueMetadata = ValueLiteralMeta | ValuePinMeta

export abstract class value {
  protected metadata?: ValueMetadata

  constructor(value?: unknown) {
    if (value !== undefined) {
      this.markLiteral()
    }
  }

  markLiteral() {
    this.metadata = { kind: 'literal' }
  }

  markPin(record: MetaCallRecordRef, pinName: string, pinIndex: number) {
    this.metadata = {
      kind: 'pin',
      record,
      pinName,
      pinIndex
    }
  }

  getMetadata() {
    return this.metadata
  }

  abstract toIRLiteral(): Argument
}

export interface EntityRuntimeBase extends value {
  readonly __entityRuntimeBrand: 'entity'
}

export type BoolValue = bool | boolean
export class bool extends value {
  declare private readonly __brandBool: 'bool'
  value?: boolean

  constructor(value?: boolean) {
    super(value)
    this.value = value
  }

  override toIRLiteral(): Argument {
    if (this.value === undefined) return null
    return { type: 'bool', value: this.value }
  }
}

export type IntValue = int | bigint | number
export class int extends value {
  declare private readonly __brandInt: 'int'
  value?: bigint

  constructor(value?: bigint | number) {
    super(value)
    if (value !== undefined) {
      this.value = BigInt(value)
    }
  }

  override toIRLiteral(): Argument {
    if (this.value === undefined) return null
    return { type: 'int', value: Number(this.value) }
  }
}

export type FloatValue = float | number
export class float extends value {
  declare private readonly __brandFloat: 'float'
  value?: number

  constructor(value?: number) {
    super(value)
    this.value = value
  }

  override toIRLiteral(): Argument {
    if (this.value === undefined) return null
    return { type: 'float', value: this.value }
  }
}

export type StrValue = str | string
export class str extends value {
  declare private readonly __brandStr: 'str'
  value?: string

  constructor(value?: string) {
    super(value)
    this.value = value
  }

  override toIRLiteral(): Argument {
    if (this.value === undefined) return null
    return { type: 'str', value: this.value }
  }
}

export function ensureLiteralStr(input: StrValue, label = 'value'): str {
  if (typeof input === 'string') {
    return new str(input)
  }
  if (input instanceof str) {
    const meta = input.getMetadata()
    if (meta?.kind === 'literal') return input
  }
  throw new Error(`[error] ${label} must be a literal string (no wired connection)`)
}

export function assertClientLiteralValue(input: value, label = 'value'): void {
  const metadata = input.getMetadata()
  if (metadata?.kind !== 'pin') return
  throw clientNodegraphError(
    CLIENT_ERROR_CODES.LITERAL_REQUIRED,
    `${label} only accepts a literal value; received ${metadata.record.nodeType}.${metadata.pinName} ` +
      'but the editor exposes no connection socket'
  )
}

export function assertServerLiteralValue(input: value, label = 'value'): void {
  const metadata = input.getMetadata()
  if (metadata?.kind !== 'pin') return
  throw new Error(
    `[error] ${label} only accepts a literal value; received ` +
      `${metadata.record.nodeType}.${metadata.pinName}, but the editor exposes no connection socket`
  )
}

export function assertClientFixedSlotArray(
  input: unknown,
  label = 'value'
): asserts input is unknown[] | undefined {
  if (input === undefined || Array.isArray(input)) return
  throw clientNodegraphError(
    CLIENT_ERROR_CODES.LITERAL_REQUIRED,
    `${label} must be a source-level array; a wired list cannot determine the fixed input slots`
  )
}

export type Vec3Value = vec3 | [number, number, number]
export class vec3 extends value {
  declare private readonly __brandVec3: 'vec3'
  value?: [number, number, number]

  constructor(value?: [number, number, number]) {
    super(value)
    this.value = value
  }

  override toIRLiteral(): Argument {
    if (this.value === undefined) return null
    return { type: 'vec3', value: this.value }
  }

  get x(): number {
    return callActiveGraphFunction<{ xComponent: number }>('vec3.x', 'split3dVector', [this])
      .xComponent
  }

  get y(): number {
    return callActiveGraphFunction<{ yComponent: number }>('vec3.y', 'split3dVector', [this])
      .yComponent
  }

  get z(): number {
    return callActiveGraphFunction<{ zComponent: number }>('vec3.z', 'split3dVector', [this])
      .zComponent
  }
}

export type GuidValue = guid | bigint | number
export class guid extends value {
  declare private readonly __brandGuid: 'guid'
  value?: int

  constructor(value?: bigint | number) {
    super(value)
    if (value !== undefined) {
      this.value = new int(value)
    }
  }

  override toIRLiteral(): Argument {
    const raw = this.value?.value
    if (raw === undefined) return null
    return { type: 'guid', value: Number(raw) }
  }
}

export type EntityValue =
  | entity
  | EntityRuntimeBase
  | PlayerEntity
  | CharacterEntity
  | StageEntity
  | ObjectEntity
  | CreationEntity
export class entity extends value implements EntityRuntimeBase {
  declare private readonly __brandEntity: 'entity'
  declare readonly __entityRuntimeBrand: 'entity'
  constructor() {
    super()
  }

  override toIRLiteral(): Argument {
    return { type: 'entity', value: null }
  }
}

export class entityLiteral extends entity {
  private declaredGuid: bigint | number

  constructor(guid: bigint | number = 0) {
    super()
    this.declaredGuid = guid
    this.markLiteral()
  }

  getDeclaredGuid(): bigint | number {
    return this.declaredGuid
  }
}

export type PrefabIdValue = prefabId | bigint | number
export class prefabId extends value {
  declare private readonly __brandPrefabId: 'prefabId'
  value?: int

  constructor(value?: bigint | number) {
    super(value)
    if (value !== undefined) {
      this.value = new int(value)
    }
  }

  override toIRLiteral(): Argument {
    const raw = this.value?.value
    if (raw === undefined) return null
    return { type: 'prefab_id', value: Number(raw) }
  }
}

export type ConfigIdValue = configId | bigint | number
export class configId extends value {
  declare private readonly __brandConfigId: 'configId'
  value?: int

  constructor(value?: bigint | number) {
    super(value)
    if (value !== undefined) {
      this.value = new int(value)
    }
  }

  override toIRLiteral(): Argument {
    const raw = this.value?.value
    if (raw === undefined) return null
    return { type: 'config_id', value: Number(raw) }
  }
}

export type FactionValue = faction | bigint | number
export class faction extends value {
  declare private readonly __brandFaction: 'faction'
  value?: int

  constructor(value?: bigint | number) {
    super(value)
    if (value !== undefined) {
      this.value = new int(value)
    }
  }

  override toIRLiteral(): Argument {
    const raw = this.value?.value
    if (raw === undefined) return null
    return { type: 'faction', value: Number(raw) }
  }
}

export type StructValue = struct
export class struct extends value {
  declare private readonly __brandStruct: 'struct'
  constructor() {
    super()
  }

  override toIRLiteral(): Argument {
    return { type: 'struct', value: null }
  }
}

export type EnumerationValue = enumeration
export class enumeration<T extends EnumerationType | '' = ''> extends value {
  declare private readonly __brandEnumeration: 'enumeration'
  private className: T | ''
  private value: string

  constructor(className?: T, value?: string) {
    super()
    this.className = className ?? ''
    this.value = value ?? ''
    if (className && value) {
      this.markLiteral()
    }
  }

  getClassName(): string {
    return this.className
  }

  override toIRLiteral(): Argument {
    return { type: 'enum', value: this.value }
  }
}

export type LocalVariableValue = localVariable
export class localVariable extends value {
  declare private readonly __brandLocalVariable: 'localVariable'
  constructor() {
    super()
  }

  override toIRLiteral(): Argument {
    return { type: 'local_variable', value: null }
  }
}

export type CustomVariableSnapshotValue = customVariableSnapshot
export class customVariableSnapshot extends value {
  declare private readonly __brandCustomVariableSnapshot: 'customVariableSnapshot'
  constructor() {
    super()
  }

  override toIRLiteral(): Argument {
    return { type: 'custom_variable_snapshot', value: null }
  }
}

export type GenericValue = value
export class generic extends value {
  declare private readonly __brandGeneric: 'generic'
  private concreteType?: LiteralValueType
  private dictKeyType?: DictKeyType
  private dictValueType?: DictValueType
  private typeSet: boolean = false

  constructor() {
    super()
  }

  asType(type: 'bool'): boolean
  asType(type: 'int'): bigint
  asType(type: 'float'): number
  asType(type: 'str'): string
  asType(type: 'vec3'): vec3
  asType(type: 'guid'): guid
  asType(type: 'entity'): entity
  asType(type: 'prefab_id'): prefabId
  asType(type: 'config_id'): configId
  asType(type: 'faction'): faction
  asType(type: 'struct'): struct
  asType(type: 'dict'): dict
  asType(type: 'bool_list'): boolean[]
  asType(type: 'int_list'): bigint[]
  asType(type: 'float_list'): number[]
  asType(type: 'str_list'): string[]
  asType(type: 'vec3_list'): vec3[]
  asType(type: 'guid_list'): guid[]
  asType(type: 'entity_list'): entity[]
  asType(type: 'prefab_id_list'): prefabId[]
  asType(type: 'config_id_list'): configId[]
  asType(type: 'faction_list'): faction[]
  asType(type: 'struct_list'): struct[]
  asType<T extends LiteralValueType>(type: T): RuntimeReturnValueTypeMap[T]
  asType(type: LiteralValueType): RuntimeReturnValueTypeMap[LiteralValueType] {
    if (this.typeSet) {
      throw new Error('Generic type has already been set and cannot be changed')
    }
    this.concreteType = type
    this.typeSet = true

    let ret: value
    switch (type) {
      case 'bool':
        ret = new bool()
        break
      case 'int':
        ret = new int()
        break
      case 'float':
        ret = new float()
        break
      case 'str':
        ret = new str()
        break
      case 'vec3':
        ret = new vec3()
        break
      case 'guid':
        ret = new guid()
        break
      case 'entity':
        ret = new entity()
        break
      case 'prefab_id':
        ret = new prefabId()
        break
      case 'config_id':
        ret = new configId()
        break
      case 'faction':
        ret = new faction()
        break
      case 'struct':
        throw new Error('struct is not supported yet')
      case 'dict':
        throw new Error('use asDict() instead')
      case 'bool_list':
        ret = new list('bool')
        break
      case 'int_list':
        ret = new list('int')
        break
      case 'float_list':
        ret = new list('float')
        break
      case 'str_list':
        ret = new list('str')
        break
      case 'vec3_list':
        ret = new list('vec3')
        break
      case 'guid_list':
        ret = new list('guid')
        break
      case 'entity_list':
        ret = new list('entity')
        break
      case 'prefab_id_list':
        ret = new list('prefab_id')
        break
      case 'config_id_list':
        ret = new list('config_id')
        break
      case 'faction_list':
        ret = new list('faction')
        break
      case 'struct_list':
        ret = new list('struct')
        break
    }
    if (this.metadata && this.metadata.kind === 'pin')
      ret.markPin(this.metadata.record, this.metadata.pinName, this.metadata.pinIndex)
    return ret as RuntimeReturnValueTypeMap[LiteralValueType]
  }

  asDict<K extends DictKeyType, V extends DictValueType>(keyType: K, valueType: V): dict<K, V> {
    if (this.typeSet) {
      throw new Error('Generic type has already been set and cannot be changed')
    }
    this.concreteType = 'dict'
    this.dictKeyType = keyType
    this.dictValueType = valueType
    this.typeSet = true

    const ret = new dict(keyType, valueType)
    if (this.metadata && this.metadata.kind === 'pin') {
      ret.markPin(this.metadata.record, this.metadata.pinName, this.metadata.pinIndex)
    }
    return ret
  }

  override toIRLiteral(): Argument {
    if (!this.typeSet) return null
    return { type: 'generic', value: null }
  }

  getConcreteType(): LiteralValueType | undefined {
    return this.concreteType
  }

  getDictKeyType(): DictKeyType | undefined {
    return this.dictKeyType
  }

  getDictValueType(): DictValueType | undefined {
    return this.dictValueType
  }

  // generic dict伪类型使用
  getKeyType(): DictKeyType {
    if (!this.dictKeyType) {
      throw new Error('[error] dict(): use dict(keyType, valueType, 0) for typed dict placeholder')
    }
    return this.dictKeyType
  }

  // generic dict伪类型使用
  getValueType(): DictValueType {
    if (!this.dictValueType) {
      throw new Error('[error] dict(): use dict(keyType, valueType, 0) for typed dict placeholder')
    }
    return this.dictValueType
  }
}

// list在实际使用中会被伪装成T[], 由编译器处理, 通常用户不会直接接触list类型
// 目前不使用extends Array方案, 虽然很多语义和方法这样做会更好
// 但是许多细节的复杂度会上升, 并且这个方案依然无法摆脱编译器处理, 比如下标相关, 编译成快速路径, 等等
// 因此目前用数组伪装方案, 方便维护和简化开发
export type ListConcreteType = keyof ListableValueTypeMap | 'enum' | 'enumeration'

export class list<K extends ListConcreteType = ListConcreteType> extends value {
  declare private readonly __brandList: 'list'
  private concreteType: K
  /**
   * 预处理自动包裹列表可能误将三维向量处理为列表, 此处保留原值以便还原
   */
  private vec3Value?: [number, number, number]

  constructor(type: K) {
    super()
    this.concreteType = type
  }

  getConcreteType(): K {
    return this.concreteType
  }

  setVec3Value(value: [number, number, number]) {
    this.vec3Value = value
  }

  getVec3Value(): [number, number, number] | undefined {
    return this.vec3Value
  }

  override toIRLiteral(): Argument {
    return null
  }
}

/**
 * List literal value for IR JSON sugar (e.g. { type: 'int_list', value: [] }).
 *
 * 用于在 IR JSON 中直接表达 `*_list` 字面量（包括空列表），后续可在 IR->GIA 阶段展开为 assembly_list 并连线。
 */
export class listLiteral<K extends ListConcreteType = ListConcreteType> extends list<K> {
  private items: RuntimeReturnValueTypeMap[K][] | null

  constructor(type: K, items: RuntimeReturnValueTypeMap[K][] | null = []) {
    super(type)
    this.items = items
    this.markLiteral()
  }

  getItems(): RuntimeReturnValueTypeMap[K][] | null {
    return this.items
  }

  override toIRLiteral(): Argument {
    const t = `${this.getConcreteType()}_list` as keyof CommonLiteralValueListTypeMap
    // IR 的 enum_list 是 string[]：枚举项序列化为值名
    const items =
      this.items && this.getConcreteType() === 'enum'
        ? this.items.map(
            (item) => ((item as unknown as enumeration).toIRLiteral() as { value: string }).value
          )
        : this.items
    return { type: t, value: items as CommonLiteralValueListTypeMap[typeof t] } as Argument
  }
}

/**
 * Fold a pure client `assembly_list` output back into an inline List literal.
 *
 * Client arrays are normally lowered to `assembly_list` so they can carry dynamic values.
 * Literal-only input pins cannot connect that node, but they can store the same literal items
 * directly. Keep dynamic/mixed lists untouched so the existing literal-only check still rejects
 * them.
 */
export function foldClientLiteralList<K extends ListConcreteType>(input: list<K>): list<K> {
  const metadata = input.getMetadata()
  if (
    metadata?.kind !== 'pin' ||
    metadata.record.nodeType !== 'assembly_list' ||
    metadata.pinIndex !== 0
  ) {
    return input
  }

  const concreteType = input.getConcreteType()
  const elementType = concreteType === 'enumeration' ? 'enum' : concreteType
  const items: unknown[] = []

  for (const item of metadata.record.args) {
    if (item.getMetadata()?.kind !== 'literal') return input
    const literal = item.toIRLiteral()
    if (!literal || literal.type === 'conn') return input

    const literalType = literal.type === 'enumeration' ? 'enum' : literal.type
    if (literalType !== elementType) return input
    items.push(elementType === 'enum' ? item : literal.value)
  }

  return new listLiteral(elementType as K, items as RuntimeReturnValueTypeMap[K][]) as list<K>
}

export type DictLiteralPair = { k: unknown; v: unknown }

export class dictLiteral {
  private pairs: DictLiteralPair[]

  constructor(pairs: DictLiteralPair[]) {
    this.pairs = pairs
  }

  getPairs(): DictLiteralPair[] {
    return this.pairs
  }
}

export type DictKeyType = 'str' | 'int' | 'entity' | 'guid' | 'faction' | 'config_id' | 'prefab_id'

export type DictValueType = SimplifyDeep<
  keyof CommonLiteralValueTypeMap | keyof CommonLiteralValueListTypeMap
>

export type DictValue = dict
export class dict<
  K extends DictKeyType = DictKeyType,
  V extends DictValueType = DictValueType
> extends value {
  declare private readonly __brandDict: 'dict'
  private keyType: K
  private valueType: V

  constructor(keyType: K, valueType: V) {
    super()
    this.keyType = keyType
    this.valueType = valueType
  }

  getKeyType(): K {
    return this.keyType
  }

  getValueType(): V {
    return this.valueType
  }

  /**
   * Clear all Key-Value Pairs from the specified Dictionary
   *
   * 清空字典: 清空指定字典的键值对
   */
  clear(): void {
    callActiveGraphFunction<void>('dict.clear()', 'clearDictionary', [this])
  }

  /**
   * Remove Key-Value Pairs from the specified Dictionary by key
   *
   * 以键对字典移除键值对: 以键移除指定字典中的键值对
   *
   * @param key
   *
   * 键
   */
  delete(key: RuntimeParameterValueTypeMap[K]): void {
    callActiveGraphFunction<void>('dict.delete()', 'removeKeyValuePairsFromDictionaryByKey', [
      this,
      key
    ])
  }

  /**
   * Iterate through the specified dictionary, callback parameter is value, key, dictionary itself
   *
   * 字典迭代循环: 回调参数为值, 键, 字典本身
   */
  forEach(
    callback: (
      value: RuntimeReturnValueTypeMap[V],
      key: RuntimeReturnValueTypeMap[K],
      dict: dict<K, V>
    ) => void
  ): void {
    const keys = callActiveGraphFunction<RuntimeReturnValueTypeMap[`${K}_list`]>(
      'dict.forEach()',
      'getListOfKeysFromDictionary',
      [this]
    )
    callActiveGraphFunction<void>('dict.forEach()', 'listIterationLoop', [
      keys,
      (key: unknown) => {
        const value = callActiveGraphFunction<RuntimeReturnValueTypeMap[V]>(
          'dict.forEach()',
          'queryDictionaryValueByKey',
          [this, key]
        )
        callback(value, key as never, this)
      }
    ])
  }

  /**
   * Searches the corresponding Value in the Dictionary by Key. If the Key does not exist, returns the type's default value
   *
   * 以键查询字典值: 根据键查询字典中对应的值，如果键不存在，则返回类型默认值
   *
   * @param key
   *
   * 键
   *
   * @returns
   *
   * 值
   */
  get(key: RuntimeParameterValueTypeMap[K]): RuntimeReturnValueTypeMap[V] {
    return callActiveGraphFunction<RuntimeReturnValueTypeMap[V]>(
      'dict.get()',
      'queryDictionaryValueByKey',
      [this, key]
    )
  }

  /**
   * Searches whether the specified Dictionary contains the specified Key
   *
   * 查询字典是否包含特定键: 查询指定字典是否包含特定的键
   *
   * @param key
   *
   * 键
   *
   * @returns
   *
   * 是否包含
   */
  has(key: RuntimeParameterValueTypeMap[K]): boolean {
    return callActiveGraphFunction<boolean>('dict.has()', 'queryIfDictionaryContainsSpecificKey', [
      this,
      key
    ])
  }

  /**
   * Returns a list of all Keys in the Dictionary. Because Key-Value Pairs are unordered, the Keys may not be returned in insertion order
   *
   * 获取字典中键组成的列表: 获取字典中所有键组成的列表。由于字典中键值对是无序排列的，所以取出的键列表也不一定按照其插入顺序排列
   *
   * @returns
   *
   * 键列表
   */
  keys(): RuntimeReturnValueTypeMap[`${K}_list`] {
    return callActiveGraphFunction<RuntimeReturnValueTypeMap[`${K}_list`]>(
      'dict.keys()',
      'getListOfKeysFromDictionary',
      [this]
    )
  }

  /**
   * Add a Key-Value Pair to the specified Dictionary
   *
   * 对字典设置或新增键值对: 为指定字典新增一个键值对
   *
   * @param key
   *
   * 键
   * @param value
   *
   * 值
   */
  set(key: RuntimeParameterValueTypeMap[K], value: RuntimeParameterValueTypeMap[V]): void {
    callActiveGraphFunction<void>('dict.set()', 'setOrAddKeyValuePairsToDictionary', [
      this,
      key,
      value
    ])
  }

  /**
   * Returns a list of all Values in the Dictionary. Because Key-Value Pairs are unordered, the Values may not be returned in insertion order
   *
   * 获取字典中值组成的列表: 获取字典中所有值组成的列表。由于字典中键值对是无序排列的，所以取出的值列表也不一定按照其插入顺序排列
   *
   * @returns
   *
   * 值列表
   */
  values(): RuntimeReturnValueTypeMap[`${Extract<V, keyof CommonLiteralValueTypeMap>}_list`] {
    return callActiveGraphFunction<
      RuntimeReturnValueTypeMap[`${Extract<V, keyof CommonLiteralValueTypeMap>}_list`]
    >('dict.values()', 'getListOfValuesFromDictionary', [
      this as unknown as dict<K, Extract<V, keyof CommonLiteralValueTypeMap>>
    ])
  }

  /**
   * Searches the number of Key-Value Pairs in the Dictionary
   *
   * 查询字典长度: 查询字典中键值对的数量
   *
   * @returns
   *
   * 长度
   */
  get size(): bigint {
    return callActiveGraphFunction<bigint>('dict.size', 'queryDictionarySLength', [this])
  }

  override toIRLiteral(): Argument {
    return {
      type: 'dict',
      value: null,
      dict: { k: this.keyType, v: this.valueType }
    }
  }
}

export class ReadonlyDict<
  K extends DictKeyType = DictKeyType,
  V extends DictValueType = DictValueType
> extends dict<K, V> {
  constructor(keyType: K, valueType: V) {
    super(keyType, valueType)
  }
}

export const ValueClassMap = {
  bool: bool,
  int: int,
  float: float,
  str: str,
  vec3: vec3,
  guid: guid,
  entity: entity,
  prefab_id: prefabId,
  config_id: configId,
  faction: faction,
  struct: struct,
  dict: dict,
  enum: enumeration,
  enumeration: enumeration,
  generic: generic,
  custom_variable_snapshot: customVariableSnapshot,
  local_variable: localVariable
}
