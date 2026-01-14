import * as z from 'zod'

import { t } from '../i18n/index.js'
import type { MetaCallRegistry } from '../runtime/core.js'
import {
  CommonLiteralValueListTypeMap,
  CommonLiteralValueTypeMap,
  ListableValueTypeMap,
  LiteralValueListTypeMap,
  LiteralValueType,
  SpecialValueTypeMap,
  ValueType,
  Variable
} from '../runtime/IR.js'
import { getRuntimeOptions } from '../runtime/runtime_config.js'
import {
  bool,
  BoolValue,
  configId,
  ConfigIdValue,
  customVariableSnapshot,
  CustomVariableSnapshotValue,
  dict,
  DictKeyType,
  DictValue,
  DictValueType,
  ensureLiteralStr,
  entity,
  EntityValue,
  enumeration,
  faction,
  FactionValue,
  float,
  FloatValue,
  generic,
  guid,
  GuidValue,
  int,
  IntValue,
  list,
  listLiteral,
  localVariable,
  LocalVariableValue,
  prefabId,
  PrefabIdValue,
  ReadonlyDict,
  RuntimeParameterValueTypeMap,
  RuntimeReturnValueTypeMap,
  str,
  struct,
  StrValue,
  value,
  ValueClassMap,
  vec3,
  Vec3Value
} from '../runtime/value.js'
import type {
  CharacterEntity,
  CreationEntity,
  EntityOf,
  ObjectEntity,
  PlayerEntity,
  StageEntity
} from './entity_helpers.js'
import {
  AttackShape,
  AttackType,
  CauseOfBeingDown,
  CharacterSkillSlot,
  ComparisonOperator,
  DamagePopUpType,
  DecisionRefreshMode,
  DisruptorDeviceOrientation,
  DisruptorDeviceType,
  ElementalReactionType,
  ElementalType,
  EntityType,
  EnumerationType,
  EnumerationTypeMap,
  FixedMotionParameterType,
  FollowCoordinateSystem,
  FollowLocationType,
  GameplayMode,
  HitPerformanceLevel,
  HitType,
  InputDeviceType,
  InterruptStatus,
  ItemLootType,
  LogicalOperator,
  MathematicalOperator,
  MotionPathPointType,
  MotionType,
  MovementMode,
  ReasonForItemChange,
  RemovalMethod,
  RevivePointSelectionStrategy,
  RoundingMode,
  ScanRuleType,
  SelectCompletionReason,
  SettlementStatus,
  SortBy,
  SoundAttenuationMode,
  SurvivalStatus,
  TargetType,
  TriggerRestriction,
  TrigonometricFunction,
  TypeConversion,
  UIControlGroupStatus,
  UnitStatusAdditionResult,
  UnitStatusRemovalReason,
  UnitStatusRemovalStrategy
} from './enum.js'
import type { ServerEventPayloads } from './events-payload.js'

export type {
  CharacterEntity,
  CreationEntity,
  EntityKind,
  EntityOf,
  ObjectEntity,
  PlayerEntity,
  StageEntity
} from './entity_helpers.js'

export function parseValue(v: any, type: 'bool'): bool
export function parseValue(v: any, type: 'int'): int
export function parseValue(v: any, type: 'float'): float
export function parseValue(v: any, type: 'str'): str
export function parseValue(v: any, type: 'vec3'): vec3
export function parseValue(v: any, type: 'guid'): guid
export function parseValue(v: any, type: 'entity'): entity
export function parseValue(v: any, type: 'prefab_id'): prefabId
export function parseValue(v: any, type: 'config_id'): configId
export function parseValue(v: any, type: 'faction'): faction
export function parseValue(v: any, type: 'struct'): struct
export function parseValue(v: any, type: 'dict'): dict
export function parseValue(v: any, type: 'enum'): enumeration
export function parseValue(v: any, type: 'enumeration'): enumeration
export function parseValue(v: any, type: 'generic'): generic
export function parseValue(v: any, type: 'custom_variable_snapshot'): customVariableSnapshot
export function parseValue(v: any, type: 'local_variable'): localVariable
export function parseValue(v: any, type: 'bool_list'): list<'bool'>
export function parseValue(v: any, type: 'int_list'): list<'int'>
export function parseValue(v: any, type: 'float_list'): list<'float'>
export function parseValue(v: any, type: 'str_list'): list<'str'>
export function parseValue(v: any, type: 'vec3_list'): list<'vec3'>
export function parseValue(v: any, type: 'guid_list'): list<'guid'>
export function parseValue(v: any, type: 'entity_list'): list<'entity'>
export function parseValue(v: any, type: 'prefab_id_list'): list<'prefab_id'>
export function parseValue(v: any, type: 'config_id_list'): list<'config_id'>
export function parseValue(v: any, type: 'faction_list'): list<'faction'>
export function parseValue(v: any, type: 'struct_list'): list<'struct'>
export function parseValue(v: any, type: DictValueType): value
export function parseValue(v: any, type: keyof (ListableValueTypeMap & SpecialValueTypeMap)): value
// @ts-ignore allow
export function parseValue(v: any, type: keyof LiteralValueListTypeMap): list
export function parseValue(v: any, type: ValueType) {
  switch (type) {
    case 'bool': {
      if (z.instanceof(bool).safeParse(v).success) {
        return v as bool
      }
      const result = z.boolean().safeParse(v)
      if (result.success) {
        return new bool(result.data)
      }
      break
    }
    case 'float': {
      if (z.instanceof(float).safeParse(v).success) {
        return v as float
      }
      const result = z.number().safeParse(v)
      if (result.success) {
        return new float(result.data)
      }
      break
    }
    // 必须将int放置于float之后, 这样允许字面量传值时强制传bigint指定为int类型
    // 否则如果希望是浮点类型, 但具体值都为整数浮点时, 会导致永远被推测为int, 而无法被解析为float
    case 'int': {
      if (z.instanceof(int).safeParse(v).success) {
        return v as int
      }
      const result = z.union([z.int(), z.bigint()]).safeParse(v)
      if (result.success) {
        return new int(result.data)
      }
      break
    }
    case 'str': {
      if (z.instanceof(str).safeParse(v).success) {
        return v as str
      }
      const result = z.string().safeParse(v)
      if (result.success) {
        return new str(result.data)
      }
      break
    }
    case 'vec3': {
      if (z.instanceof(vec3).safeParse(v).success) {
        return v as vec3
      }
      const tuple3 = z.tuple([z.number(), z.number(), z.number()])
      if (z.instanceof(list).safeParse(v).success) {
        const vec3Value = (v as list).getVec3Value()
        const result = tuple3.safeParse(vec3Value)
        if (result.success) return new vec3(result.data)
        throw new Error(`Invalid vec3 value: ${JSON.stringify(v)}`)
      }
      const result = tuple3.safeParse(v)
      if (result.success) {
        return new vec3(result.data)
      }
      break
    }
    case 'guid': {
      if (z.instanceof(guid).safeParse(v).success) {
        return v as guid
      }
      const result = z.union([z.int(), z.bigint()]).safeParse(v)
      if (result.success) {
        return new guid(result.data)
      }
      break
    }
    case 'entity': {
      if (z.instanceof(entity).safeParse(v).success) {
        return v as entity
      }
      break
    }
    case 'prefab_id': {
      if (z.instanceof(prefabId).safeParse(v).success) {
        return v as prefabId
      }
      const result = z.union([z.int(), z.bigint()]).safeParse(v)
      if (result.success) {
        return new prefabId(result.data)
      }
      break
    }
    case 'config_id': {
      if (z.instanceof(configId).safeParse(v).success) {
        return v as configId
      }
      const result = z.union([z.int(), z.bigint()]).safeParse(v)
      if (result.success) {
        return new configId(result.data)
      }
      break
    }
    case 'faction': {
      if (z.instanceof(faction).safeParse(v).success) {
        return v as faction
      }
      const result = z.union([z.int(), z.bigint()]).safeParse(v)
      if (result.success) {
        return new faction(result.data)
      }
      break
    }
    case 'struct': {
      if (z.instanceof(struct).safeParse(v).success) {
        return v as struct
      }
      break
    }
    case 'dict': {
      if (z.instanceof(dict).safeParse(v).success) {
        return v as dict
      }
      break
    }
    case 'enum':
    case 'enumeration': {
      if (z.instanceof(enumeration).safeParse(v).success) {
        return v as enumeration
      }
      break
    }
    case 'generic': {
      if (z.instanceof(generic).safeParse(v).success) {
        return v as generic
      }
      break
    }
    case 'custom_variable_snapshot': {
      if (z.instanceof(customVariableSnapshot).safeParse(v).success) {
        return v as customVariableSnapshot
      }
      break
    }
    case 'local_variable': {
      if (z.instanceof(localVariable).safeParse(v).success) {
        return v as localVariable
      }
      break
    }
    case 'bool_list': {
      if (z.instanceof(list).safeParse(v).success && (v as list).getConcreteType() === 'bool') {
        return v as list<'bool'>
      }
      break
    }
    // 理论上可以通过Array.isArray → gsts.f.assemblyList处理, 避免编译器阶段包装assemblyList处理
    // 但会引入隐式副作用, 目前暂时维持现状
    case 'int_list': {
      if (z.instanceof(list).safeParse(v).success && (v as list).getConcreteType() === 'int') {
        return v as list<'int'>
      }
      break
    }
    case 'float_list': {
      if (z.instanceof(list).safeParse(v).success && (v as list).getConcreteType() === 'float') {
        return v as list<'float'>
      }
      break
    }
    case 'str_list': {
      if (z.instanceof(list).safeParse(v).success && (v as list).getConcreteType() === 'str') {
        return v as list<'str'>
      }
      break
    }
    case 'vec3_list': {
      if (z.instanceof(list).safeParse(v).success) {
        const concreteType = (v as list).getConcreteType()
        if (concreteType === 'vec3') {
          return v as list<'vec3'>
        } else if (concreteType === 'float') {
          const vec3Value = (v as list).getVec3Value()
          if (vec3Value) {
            return new vec3(vec3Value)
          }
        }
      }
      break
    }
    case 'guid_list': {
      if (z.instanceof(list).safeParse(v).success && (v as list).getConcreteType() === 'guid') {
        return v as list<'guid'>
      }
      break
    }
    case 'entity_list': {
      if (z.instanceof(list).safeParse(v).success && (v as list).getConcreteType() === 'entity') {
        return v as list<'entity'>
      }
      break
    }
    case 'prefab_id_list': {
      if (
        z.instanceof(list).safeParse(v).success &&
        (v as list).getConcreteType() === 'prefab_id'
      ) {
        return v as list<'prefab_id'>
      }
      break
    }
    case 'config_id_list': {
      if (
        z.instanceof(list).safeParse(v).success &&
        (v as list).getConcreteType() === 'config_id'
      ) {
        return v as list<'config_id'>
      }
      break
    }
    case 'faction_list': {
      if (z.instanceof(list).safeParse(v).success && (v as list).getConcreteType() === 'faction') {
        return v as list<'faction'>
      }
      break
    }
    case 'struct_list': {
      if (z.instanceof(list).safeParse(v).success && (v as list).getConcreteType() === 'struct') {
        return v as list<'struct'>
      }
      break
    }
  }
  if (type === 'int_list') {
    if (z.instanceof(list).safeParse(v).success) {
      const concreteType = (v as list).getConcreteType()
      if (concreteType === 'float') {
        throw new Error(t('err_intListLikelyFloatList', { actual: 'float_list' }))
      }
    }
  }
  throw new Error(t('err_invalidValueType', { type }))
}

const noListType: Set<string> = new Set([
  'dict',
  'generic',
  'enum',
  'enumeration',
  'local_variable',
  'custom_variable_snapshot'
]) satisfies Set<keyof SpecialValueTypeMap>

function isListableType(
  type: keyof (ListableValueTypeMap & SpecialValueTypeMap)
): type is keyof ListableValueTypeMap {
  return !noListType.has(type)
}

function isListType(type: DictValueType): type is keyof CommonLiteralValueListTypeMap {
  return type.endsWith('_list')
}

function getBaseValueType(
  type: keyof CommonLiteralValueListTypeMap
): keyof CommonLiteralValueTypeMap {
  return type.replace('_list', '') as keyof CommonLiteralValueTypeMap
}

function matchType(
  type: keyof (ListableValueTypeMap & SpecialValueTypeMap),
  ...values: readonly unknown[]
) {
  for (const v of values) {
    if (z.instanceof(list).safeParse(v).success) {
      if (!isListableType(type)) {
        throw new Error(`Invalid value type: ${type}_list`)
      }
      parseValue(v, `${type}_list`)
    } else {
      parseValue(v, type)
    }
  }
}

function matchTypes<T extends keyof (ListableValueTypeMap & SpecialValueTypeMap)>(
  types: T[],
  ...values: readonly unknown[]
): T {
  for (const type of types) {
    try {
      matchType(type, ...values)
      return type
    } catch {
      // ignore
    }
  }
  throw new Error(
    `Generic parameter not matched: ${values
      .map((v) => {
        if (z.instanceof(value).safeParse(v).success) {
          const metadata = (v as value).getMetadata()
          if (!metadata) return JSON.stringify(v)

          if (metadata.kind === 'literal') {
            return JSON.stringify((v as value).toIRLiteral())
          }
          return JSON.stringify({
            ...metadata,
            record: {
              ...metadata.record,
              args: undefined
            }
          })
        }
        return JSON.stringify(v)
      })
      .join(', ')}`
  )
}

function isPrecomputeEnabled(): boolean {
  return getRuntimeOptions().optimize.precompileExpression === true
}

function isLiteralValue(v: value): boolean {
  return v.getMetadata()?.kind === 'literal'
}

function readLiteralBool(v: value): boolean | null {
  if (!isLiteralValue(v) || !(v instanceof bool)) return null
  return v.value ?? null
}

function readLiteralInt(v: value): bigint | null {
  if (!isLiteralValue(v) || !(v instanceof int)) return null
  return v.value ?? null
}

function readLiteralFloat(v: value): number | null {
  if (!isLiteralValue(v) || !(v instanceof float)) return null
  const value = v.value
  if (value === undefined) return null
  return Number.isFinite(value) ? value : null
}

function readLiteralStr(v: value): string | null {
  if (!isLiteralValue(v) || !(v instanceof str)) return null
  return v.value ?? null
}

function readLiteralVec3(v: value): [number, number, number] | null {
  if (!isLiteralValue(v) || !(v instanceof vec3)) return null
  const value = v.value
  if (!value || value.length !== 3) return null
  if (!value.every((n) => Number.isFinite(n))) return null
  return value
}

function tryPrecomputeFloatUnary(v: value, op: (a: number) => number): float | null {
  if (!isPrecomputeEnabled()) return null
  const raw = readLiteralFloat(v)
  if (raw === null) return null
  const result = op(raw)
  if (!Number.isFinite(result)) return null
  return new float(result)
}

function tryPrecomputeFloatBinary(
  a: value,
  b: value,
  op: (x: number, y: number) => number
): float | null {
  if (!isPrecomputeEnabled()) return null
  const av = readLiteralFloat(a)
  const bv = readLiteralFloat(b)
  if (av === null || bv === null) return null
  const result = op(av, bv)
  if (!Number.isFinite(result)) return null
  return new float(result)
}

function tryPrecomputeIntUnary(v: value, op: (a: bigint) => bigint): int | null {
  if (!isPrecomputeEnabled()) return null
  const raw = readLiteralInt(v)
  if (raw === null) return null
  return new int(op(raw))
}

function tryPrecomputeIntBinary(
  a: value,
  b: value,
  op: (x: bigint, y: bigint) => bigint
): int | null {
  if (!isPrecomputeEnabled()) return null
  const av = readLiteralInt(a)
  const bv = readLiteralInt(b)
  if (av === null || bv === null) return null
  return new int(op(av, bv))
}

function tryPrecomputeBoolUnary(v: value, op: (a: boolean) => boolean): bool | null {
  if (!isPrecomputeEnabled()) return null
  const raw = readLiteralBool(v)
  if (raw === null) return null
  return new bool(op(raw))
}

function tryPrecomputeBoolBinary(
  a: value,
  b: value,
  op: (x: boolean, y: boolean) => boolean
): bool | null {
  if (!isPrecomputeEnabled()) return null
  const av = readLiteralBool(a)
  const bv = readLiteralBool(b)
  if (av === null || bv === null) return null
  return new bool(op(av, bv))
}

function tryPrecomputeCompare(
  type: 'float' | 'int',
  a: value,
  b: value,
  op: (x: number | bigint, y: number | bigint) => boolean
): bool | null {
  if (!isPrecomputeEnabled()) return null
  if (type === 'float') {
    const av = readLiteralFloat(a)
    const bv = readLiteralFloat(b)
    if (av === null || bv === null) return null
    return new bool(op(av, bv))
  }
  const av = readLiteralInt(a)
  const bv = readLiteralInt(b)
  if (av === null || bv === null) return null
  return new bool(op(av, bv))
}

function tryPrecomputeEquality(a: value, b: value): bool | null {
  if (!isPrecomputeEnabled()) return null
  const boolA = readLiteralBool(a)
  const boolB = readLiteralBool(b)
  if (boolA !== null && boolB !== null) return new bool(boolA === boolB)

  const intA = readLiteralInt(a)
  const intB = readLiteralInt(b)
  if (intA !== null && intB !== null) return new bool(intA === intB)

  const floatA = readLiteralFloat(a)
  const floatB = readLiteralFloat(b)
  if (floatA !== null && floatB !== null) return new bool(floatA === floatB)

  const strA = readLiteralStr(a)
  const strB = readLiteralStr(b)
  if (strA !== null && strB !== null) return new bool(strA === strB)

  const vecA = readLiteralVec3(a)
  const vecB = readLiteralVec3(b)
  if (vecA && vecB) {
    return new bool(vecA[0] === vecB[0] && vecA[1] === vecB[1] && vecA[2] === vecB[2])
  }
  return null
}

function tryPrecomputeVec3Binary(
  a: value,
  b: value,
  op: (x: [number, number, number], y: [number, number, number]) => [number, number, number]
): vec3 | null {
  if (!isPrecomputeEnabled()) return null
  const av = readLiteralVec3(a)
  const bv = readLiteralVec3(b)
  if (!av || !bv) return null
  const result = op(av, bv)
  if (!result.every((n) => Number.isFinite(n))) return null
  return new vec3(result)
}

function tryPrecomputeVec3ToFloat(
  v: value,
  op: (a: [number, number, number]) => number
): float | null {
  if (!isPrecomputeEnabled()) return null
  const raw = readLiteralVec3(v)
  if (!raw) return null
  const result = op(raw)
  if (!Number.isFinite(result)) return null
  return new float(result)
}

function tryPrecomputeVec3BinaryToFloat(
  a: value,
  b: value,
  op: (x: [number, number, number], y: [number, number, number]) => number
): float | null {
  if (!isPrecomputeEnabled()) return null
  const av = readLiteralVec3(a)
  const bv = readLiteralVec3(b)
  if (!av || !bv) return null
  const result = op(av, bv)
  if (!Number.isFinite(result)) return null
  return new float(result)
}

export type DataTypeConversionMap = {
  bool: 'int' | 'str'
  entity: 'str'
  faction: 'str'
  float: 'int' | 'str'
  guid: 'str'
  int: 'bool' | 'float' | 'str'
  vec3: 'str'
}

export class ServerExecutionFlowFunctions {
  constructor(private registry: MetaCallRegistry) {}

  private resolveLiteralVarName(input: StrValue): string | null {
    if (typeof input === 'string') return input
    if (input instanceof str) {
      const meta = input.getMetadata()
      if (meta?.kind === 'literal') return input.value ?? null
    }
    return null
  }

  /**
   * @gsts
   *
   * Return from the current execution path
   *
   * Note: Does not correspond to some node, just prevents the current branch from connecting to subsequent nodes
   *
   * 终止当前分支的后续执行（return 语义）
   *
   * 注意：不对应到具体节点，只是让当前分支不再连线到后续节点
   */
  return(): void {
    const { localVariable } = this.registry.getOrCreateReturnGateLocalVariable()
    // 运行时标记 return 已发生
    this.setLocalVariable(localVariable, true)
    // 如处在循环体中，逐层 break（支持嵌套循环）
    const loops = this.registry.getActiveLoopNodeIds()
    if (loops.length) this.breakLoop(...loops.slice().reverse())
    this.registry.returnFromCurrentExecPath()
  }

  /**
   * @gsts
   *
   * Continue the current loop iteration
   *
   * Note: Does not correspond to some node, just prevents the current branch from connecting to subsequent nodes
   *
   * 跳过当前循环体剩余逻辑，继续下一次迭代
   *
   * 注意：不对应到具体节点，只是让当前分支不再连线到后续节点
   */
  continue(): void {
    if (!this.registry.getActiveLoopNodeIds().length) {
      throw new Error('continue is only supported inside loop bodies')
    }
    this.registry.returnFromCurrentExecPath({ countReturn: false })
  }

  /**
   * Converts input parameter types to another type for output. For specific rules, see Basic Concepts - [Conversion Rules Between Basic Data Types]
   *
   * 数据类型转换: 将输入的参数类型转换为另一种类型输出。具体规则见基础概念-【基础数据类型之间的转换规则】
   *
   * @param input
   *
   * 输入
   *
   * @returns
   *
   * 输出
   */
  dataTypeConversion<T extends keyof DataTypeConversionMap, U extends DataTypeConversionMap[T]>(
    input: RuntimeParameterValueTypeMap[T],
    type: U
  ): RuntimeReturnValueTypeMap[U] {
    const inputType = matchTypes(
      [
        'float',
        'int',
        // 以上浮点和整数必须前置, 以便字面量匹配到正确类型
        'bool',
        'entity',
        'faction',
        'guid',
        'vec3'
      ],
      input
    )
    const inputObj = parseValue(input, inputType)
    if (inputType === 'faction') {
      const metadata = inputObj.getMetadata()
      if (!metadata || metadata.kind !== 'pin') {
        throw new Error(t('err_dataTypeConversionFactionMustBeWired'))
      }
    }
    if (isPrecomputeEnabled()) {
      if (type === 'str') {
        if (inputType === 'int') {
          const raw = readLiteralInt(inputObj)
          if (raw !== null)
            return new str(raw.toString()) as unknown as RuntimeReturnValueTypeMap[U]
        }
        if (inputType === 'float') {
          const raw = readLiteralFloat(inputObj)
          if (raw !== null) return new str(String(raw)) as unknown as RuntimeReturnValueTypeMap[U]
        }
      }
      if (type === 'float' && inputType === 'int') {
        const raw = readLiteralInt(inputObj)
        if (raw !== null) return new float(Number(raw)) as unknown as RuntimeReturnValueTypeMap[U]
      }
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: `data_type_conversion_${String(type)}`,
      args: [inputObj]
    })
    const ret = new ValueClassMap[type]()
    ret.markPin(ref, 'output', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[U]
  }

  /**
   * Determines whether two inputs are equal; Some Parameter Types have special comparison rules:; Floating Point Numbers: Floating Point Numbers are compared using approximate equality. When the difference between two Floating Point Numbers is less than an extremely small value, the two numbers are considered equal. For example: 2.0000001 and 2.0 are considered equal; 3D Vector: The x, y, and z components of a 3D Vector are compared using Floating Point approximate equality
   *
   * 是否相等: 判断两个输入是否相等; 部分参数类型有较为特殊的判定规则：; 浮点数：浮点数采用近似相等进行比较，当两个浮点数小于一个极小值时，这两个浮点数认为相等。例如：2.0000001与2.0认为相等; 三维向量：三维向量的x、y、z分别采用浮点数近似相等比较
   *
   * @param input1
   *
   * 输入1
   * @param input2
   *
   * 输入2
   *
   * @returns Output True if equal, False if not equal
   *
   * 结果: 相等输出“是”，不相等输出“否”
   */
  equal(input1: FloatValue, input2: FloatValue): boolean
  equal(input1: IntValue, input2: IntValue): boolean
  equal(input1: BoolValue, input2: BoolValue): boolean
  equal(input1: ConfigIdValue, input2: ConfigIdValue): boolean
  equal(input1: EntityValue, input2: EntityValue): boolean
  equal(input1: FactionValue, input2: FactionValue): boolean
  equal(input1: GuidValue, input2: GuidValue): boolean
  equal(input1: PrefabIdValue, input2: PrefabIdValue): boolean
  equal(input1: StrValue, input2: StrValue): boolean
  equal(input1: Vec3Value, input2: Vec3Value): boolean
  equal<
    T extends
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
  >(input1: RuntimeParameterValueTypeMap[T], input2: RuntimeParameterValueTypeMap[T]): boolean {
    let genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      input1,
      input2
    )

    // 预处理器可能意外包裹三维向量为列表, 此处特殊处理
    if (
      z.instanceof(list).safeParse(input1).success &&
      z.instanceof(list).safeParse(input2).success
    ) {
      const concreteType1 = (input1 as unknown as list).getConcreteType()
      const concreteType2 = (input2 as unknown as list).getConcreteType()
      if (concreteType1 === 'float' && concreteType2 === 'float') {
        genericType = 'vec3'
      }
    }

    const input1Obj = parseValue(input1, genericType)
    const input2Obj = parseValue(input2, genericType)
    const pre = tryPrecomputeEquality(input1Obj, input2Obj)
    if (pre) return pre as unknown as boolean
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'equal',
      args: [input1Obj, input2Obj]
    })
    const ret = new bool()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as boolean
  }

  /**
   * After confirming the Enumeration type, determines whether the two input values are equal
   *
   * 枚举是否相等: 确认枚举的类型后，判断两个输入的值是否相等
   *
   * @param enumeration1
   *
   * 枚举1
   * @param enumeration2
   *
   * 枚举2
   *
   * @returns Output True if equal, False if not equal
   *
   * 结果: 相等输出“是”，不相等输出“否”
   */
  enumerationsEqual(enumeration1: ComparisonOperator, enumeration2: ComparisonOperator): boolean
  enumerationsEqual(enumeration1: LogicalOperator, enumeration2: LogicalOperator): boolean
  enumerationsEqual(enumeration1: MathematicalOperator, enumeration2: MathematicalOperator): boolean
  enumerationsEqual(enumeration1: AttackShape, enumeration2: AttackShape): boolean
  enumerationsEqual(enumeration1: SurvivalStatus, enumeration2: SurvivalStatus): boolean
  enumerationsEqual(enumeration1: SortBy, enumeration2: SortBy): boolean
  enumerationsEqual(enumeration1: RoundingMode, enumeration2: RoundingMode): boolean
  enumerationsEqual(enumeration1: TypeConversion, enumeration2: TypeConversion): boolean
  enumerationsEqual(enumeration1: MotionPathPointType, enumeration2: MotionPathPointType): boolean
  enumerationsEqual(enumeration1: MotionType, enumeration2: MotionType): boolean
  enumerationsEqual(enumeration1: FollowLocationType, enumeration2: FollowLocationType): boolean
  enumerationsEqual(
    enumeration1: FollowCoordinateSystem,
    enumeration2: FollowCoordinateSystem
  ): boolean
  enumerationsEqual(enumeration1: ElementalType, enumeration2: ElementalType): boolean
  enumerationsEqual(enumeration1: EntityType, enumeration2: EntityType): boolean
  enumerationsEqual(
    enumeration1: UnitStatusAdditionResult,
    enumeration2: UnitStatusAdditionResult
  ): boolean
  enumerationsEqual(
    enumeration1: UnitStatusRemovalReason,
    enumeration2: UnitStatusRemovalReason
  ): boolean
  enumerationsEqual(
    enumeration1: UnitStatusRemovalStrategy,
    enumeration2: UnitStatusRemovalStrategy
  ): boolean
  enumerationsEqual(
    enumeration1: RevivePointSelectionStrategy,
    enumeration2: RevivePointSelectionStrategy
  ): boolean
  enumerationsEqual(enumeration1: CauseOfBeingDown, enumeration2: CauseOfBeingDown): boolean
  enumerationsEqual(
    enumeration1: TrigonometricFunction,
    enumeration2: TrigonometricFunction
  ): boolean
  enumerationsEqual(enumeration1: DisruptorDeviceType, enumeration2: DisruptorDeviceType): boolean
  enumerationsEqual(
    enumeration1: DisruptorDeviceOrientation,
    enumeration2: DisruptorDeviceOrientation
  ): boolean
  enumerationsEqual(enumeration1: UIControlGroupStatus, enumeration2: UIControlGroupStatus): boolean
  enumerationsEqual(enumeration1: TargetType, enumeration2: TargetType): boolean
  enumerationsEqual(enumeration1: TriggerRestriction, enumeration2: TriggerRestriction): boolean
  enumerationsEqual(enumeration1: HitType, enumeration2: HitType): boolean
  enumerationsEqual(enumeration1: AttackType, enumeration2: AttackType): boolean
  enumerationsEqual(enumeration1: HitPerformanceLevel, enumeration2: HitPerformanceLevel): boolean
  enumerationsEqual(enumeration1: CharacterSkillSlot, enumeration2: CharacterSkillSlot): boolean
  enumerationsEqual(enumeration1: SoundAttenuationMode, enumeration2: SoundAttenuationMode): boolean
  enumerationsEqual(
    enumeration1: SelectCompletionReason,
    enumeration2: SelectCompletionReason
  ): boolean
  enumerationsEqual(enumeration1: SettlementStatus, enumeration2: SettlementStatus): boolean
  enumerationsEqual(enumeration1: ReasonForItemChange, enumeration2: ReasonForItemChange): boolean
  enumerationsEqual(enumeration1: ItemLootType, enumeration2: ItemLootType): boolean
  enumerationsEqual(enumeration1: DecisionRefreshMode, enumeration2: DecisionRefreshMode): boolean
  enumerationsEqual(
    enumeration1: ElementalReactionType,
    enumeration2: ElementalReactionType
  ): boolean
  enumerationsEqual(enumeration1: InterruptStatus, enumeration2: InterruptStatus): boolean
  enumerationsEqual(enumeration1: GameplayMode, enumeration2: GameplayMode): boolean
  enumerationsEqual(enumeration1: InputDeviceType, enumeration2: InputDeviceType): boolean
  enumerationsEqual<T extends EnumerationType>(
    enumeration1: EnumerationTypeMap[T],
    enumeration2: EnumerationTypeMap[T]
  ): boolean {
    const enumeration1Obj = parseValue(enumeration1, 'enum')
    const enumeration2Obj = parseValue(enumeration2, 'enum')

    if (enumeration1Obj.getClassName() !== enumeration2Obj.getClassName()) {
      throw new Error('enumeration type mismatch')
    }

    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'enumerations_equal',
      args: [enumeration1Obj, enumeration2Obj]
    })
    const ret = new bool()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as boolean
  }

  /**
   * Assembles multiple Input Parameters of the same type (up to 100) into a single List
   *
   * 拼装列表: 将多个类型相同的入参(至多100个)拼装为一个列表
   *
   * @param _0to99 Assembles up to 100 parameters into a list
   *
   * 0~99: 将至多100个参数拼装为一个列表
   *
   * @returns The assembled list
   *
   * 列表: 拼装成的列表
   */
  assemblyList(_0to99: FloatValue[]): number[]
  assemblyList(_0to99: FloatValue[], type: 'float'): number[]
  assemblyList(_0to99: IntValue[]): bigint[]
  assemblyList(_0to99: IntValue[], type: 'int'): bigint[]
  assemblyList(_0to99: BoolValue[]): boolean[]
  assemblyList(_0to99: BoolValue[], type: 'bool'): boolean[]
  assemblyList(_0to99: ConfigIdValue[], type: 'config_id'): configId[]
  assemblyList(_0to99: EntityValue[]): entity[]
  assemblyList(_0to99: EntityValue[], type: 'entity'): entity[]
  assemblyList(_0to99: FactionValue[], type: 'faction'): faction[]
  assemblyList(_0to99: GuidValue[], type: 'guid'): guid[]
  assemblyList(_0to99: PrefabIdValue[], type: 'prefab_id'): prefabId[]
  assemblyList(_0to99: StrValue[]): string[]
  assemblyList(_0to99: StrValue[], type: 'str'): string[]
  assemblyList(_0to99: Vec3Value[]): vec3[]
  assemblyList(_0to99: Vec3Value[], type: 'vec3'): vec3[]
  assemblyList<
    T extends
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
  >(_0to99: RuntimeParameterValueTypeMap[T][], type?: T): RuntimeReturnValueTypeMap[`${T}_list`] {
    // 支持无限嵌套, 以便预处理器处理
    if (z.instanceof(list).safeParse(_0to99).success) {
      return _0to99 as unknown as RuntimeReturnValueTypeMap[`${T}_list`]
    }

    if (_0to99.length === 0) throw new Error('Parameters cannot be empty')

    // @ts-ignore 针对 assemblyDictionary 的特殊处理
    if (typeof _0to99[0] === 'object' && 'k' in _0to99[0] && 'v' in _0to99[0])
      return _0to99 as unknown as RuntimeReturnValueTypeMap[`${T}_list`]

    if (_0to99.length > 100) throw new Error('Parameters cannot be more than 100')

    const isValueTypeList = z.instanceof(list).safeParse(_0to99[0]).success
    if (isValueTypeList) {
      // 列表嵌套只可能是三维向量列表
      _0to99 = _0to99.map((item) =>
        (item as unknown as list).getVec3Value()
      ) as RuntimeParameterValueTypeMap[T][]
    }

    let genericType = matchTypes(
      [
        'float',
        'int',
        // 以上浮点和整数必须前置, 以便字面量匹配到正确类型
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      ..._0to99
    )
    if (type) genericType = type
    const _0to99Obj = _0to99.map((v) => parseValue(v, genericType))
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'assembly_list',
      args: _0to99Obj
    })
    const ret = new list(genericType)
    ret.markPin(ref, 'list', 0)

    // 预处理自动包裹列表可能误将三维向量处理为列表, 此处保留原值以便还原
    // 当后续被用作三维向量时, 先前注册的assembly_list节点由于未被引用, 会被自动剔除
    // 此处特殊处理以便复杂情况下的参数传递更加可靠, 避免过度依赖编译器检测类型
    if (_0to99.length === 3 && genericType === 'float') {
      ret.setVec3Value([..._0to99] as unknown as [number, number, number])
    }

    return ret as unknown as RuntimeReturnValueTypeMap[`${T}_list`]
  }

  /**
   * @gsts
   *
   * Create an empty List of the specified type.
   *
   * 创建空列表: 仅指定类型创建一个真正的空列表。
   */
  emptyList(type: 'bool'): boolean[]
  emptyList(type: 'int'): bigint[]
  emptyList(type: 'float'): number[]
  emptyList(type: 'str'): string[]
  emptyList(type: 'vec3'): vec3[]
  emptyList(type: 'guid'): guid[]
  emptyList(type: 'entity'): entity[]
  emptyList(type: 'prefab_id'): prefabId[]
  emptyList(type: 'config_id'): configId[]
  emptyList(type: 'faction'): faction[]
  emptyList(
    type:
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
  ):
    | boolean[]
    | bigint[]
    | number[]
    | string[]
    | vec3[]
    | guid[]
    | entity[]
    | prefabId[]
    | configId[]
    | faction[] {
    // @ts-ignore 针对 emptyList 的特殊处理
    return this.emptyLocalVariableList(type).value
  }

  /**
   * @gsts
   *
   * Declare an empty list local variable and return both localVariable/value.
   *
   * 创建“空列表”的局部变量，并返回 localVariable/value 两个输出。
   */
  emptyLocalVariableList(type: 'bool'): { localVariable: localVariable; value: boolean[] }
  emptyLocalVariableList(type: 'int'): { localVariable: localVariable; value: bigint[] }
  emptyLocalVariableList(type: 'float'): { localVariable: localVariable; value: number[] }
  emptyLocalVariableList(type: 'str'): { localVariable: localVariable; value: string[] }
  emptyLocalVariableList(type: 'vec3'): { localVariable: localVariable; value: vec3[] }
  emptyLocalVariableList(type: 'guid'): { localVariable: localVariable; value: guid[] }
  emptyLocalVariableList(type: 'entity'): { localVariable: localVariable; value: entity[] }
  emptyLocalVariableList(type: 'prefab_id'): { localVariable: localVariable; value: prefabId[] }
  emptyLocalVariableList(type: 'config_id'): { localVariable: localVariable; value: configId[] }
  emptyLocalVariableList(type: 'faction'): { localVariable: localVariable; value: faction[] }
  emptyLocalVariableList(
    type:
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
  ) {
    const init = new listLiteral(type)
    // @ts-ignore allow
    return this.getLocalVariable(init) as {
      localVariable: localVariable
      value: RuntimeReturnValueTypeMap[`${typeof type}_list`]
    }
  }

  /**
   * Combines up to 50 Key-Value Pairs into one Dictionary
   *
   * 拼装字典: 将至多50个键值对拼合为一个字典
   *
   * GSTS Note: The dictionary declared by this method cannot be modified, and a node graph variable dictionary must be declared if modification is required.
   *
   * GSTS 注: 该方法声明的字典无法进行修改, 需要修改时必须声明节点图变量字典
   *
   * @returns
   *
   * 字典
   */
  assemblyDictionary(pairs: { k: IntValue; v: FloatValue }[]): ReadonlyDict<'int', 'float'>
  assemblyDictionary(pairs: { k: IntValue; v: IntValue }[]): ReadonlyDict<'int', 'int'>
  assemblyDictionary(pairs: { k: IntValue; v: BoolValue }[]): ReadonlyDict<'int', 'bool'>
  assemblyDictionary(pairs: { k: IntValue; v: ConfigIdValue }[]): ReadonlyDict<'int', 'config_id'>
  assemblyDictionary(pairs: { k: IntValue; v: EntityValue }[]): ReadonlyDict<'int', 'entity'>
  assemblyDictionary(pairs: { k: IntValue; v: FactionValue }[]): ReadonlyDict<'int', 'faction'>
  assemblyDictionary(pairs: { k: IntValue; v: GuidValue }[]): ReadonlyDict<'int', 'guid'>
  assemblyDictionary(pairs: { k: IntValue; v: PrefabIdValue }[]): ReadonlyDict<'int', 'prefab_id'>
  assemblyDictionary(pairs: { k: IntValue; v: StrValue }[]): ReadonlyDict<'int', 'str'>
  assemblyDictionary(pairs: { k: IntValue; v: vec3 }[]): ReadonlyDict<'int', 'vec3'>
  assemblyDictionary(pairs: { k: IntValue; v: FloatValue[] }[]): ReadonlyDict<'int', 'float_list'>
  assemblyDictionary(pairs: { k: IntValue; v: IntValue[] }[]): ReadonlyDict<'int', 'int_list'>
  assemblyDictionary(pairs: { k: IntValue; v: BoolValue[] }[]): ReadonlyDict<'int', 'bool_list'>
  assemblyDictionary(
    pairs: { k: IntValue; v: ConfigIdValue[] }[]
  ): ReadonlyDict<'int', 'config_id_list'>
  assemblyDictionary(pairs: { k: IntValue; v: EntityValue[] }[]): ReadonlyDict<'int', 'entity_list'>
  assemblyDictionary(
    pairs: { k: IntValue; v: FactionValue[] }[]
  ): ReadonlyDict<'int', 'faction_list'>
  assemblyDictionary(pairs: { k: IntValue; v: GuidValue[] }[]): ReadonlyDict<'int', 'guid_list'>
  assemblyDictionary(
    pairs: { k: IntValue; v: PrefabIdValue[] }[]
  ): ReadonlyDict<'int', 'prefab_id_list'>
  assemblyDictionary(pairs: { k: IntValue; v: StrValue[] }[]): ReadonlyDict<'int', 'str_list'>
  assemblyDictionary(pairs: { k: IntValue; v: Vec3Value[] }[]): ReadonlyDict<'int', 'vec3_list'>
  assemblyDictionary(pairs: { k: StrValue; v: FloatValue }[]): ReadonlyDict<'str', 'float'>
  assemblyDictionary(pairs: { k: StrValue; v: IntValue }[]): ReadonlyDict<'str', 'int'>
  assemblyDictionary(pairs: { k: StrValue; v: BoolValue }[]): ReadonlyDict<'str', 'bool'>
  assemblyDictionary(pairs: { k: StrValue; v: ConfigIdValue }[]): ReadonlyDict<'str', 'config_id'>
  assemblyDictionary(pairs: { k: StrValue; v: EntityValue }[]): ReadonlyDict<'str', 'entity'>
  assemblyDictionary(pairs: { k: StrValue; v: FactionValue }[]): ReadonlyDict<'str', 'faction'>
  assemblyDictionary(pairs: { k: StrValue; v: GuidValue }[]): ReadonlyDict<'str', 'guid'>
  assemblyDictionary(pairs: { k: StrValue; v: PrefabIdValue }[]): ReadonlyDict<'str', 'prefab_id'>
  assemblyDictionary(pairs: { k: StrValue; v: StrValue }[]): ReadonlyDict<'str', 'str'>
  assemblyDictionary(pairs: { k: StrValue; v: vec3 }[]): ReadonlyDict<'str', 'vec3'>
  assemblyDictionary(pairs: { k: StrValue; v: FloatValue[] }[]): ReadonlyDict<'str', 'float_list'>
  assemblyDictionary(pairs: { k: StrValue; v: IntValue[] }[]): ReadonlyDict<'str', 'int_list'>
  assemblyDictionary(pairs: { k: StrValue; v: BoolValue[] }[]): ReadonlyDict<'str', 'bool_list'>
  assemblyDictionary(
    pairs: { k: StrValue; v: ConfigIdValue[] }[]
  ): ReadonlyDict<'str', 'config_id_list'>
  assemblyDictionary(pairs: { k: StrValue; v: EntityValue[] }[]): ReadonlyDict<'str', 'entity_list'>
  assemblyDictionary(
    pairs: { k: StrValue; v: FactionValue[] }[]
  ): ReadonlyDict<'str', 'faction_list'>
  assemblyDictionary(pairs: { k: StrValue; v: GuidValue[] }[]): ReadonlyDict<'str', 'guid_list'>
  assemblyDictionary(
    pairs: { k: StrValue; v: PrefabIdValue[] }[]
  ): ReadonlyDict<'str', 'prefab_id_list'>
  assemblyDictionary(pairs: { k: StrValue; v: StrValue[] }[]): ReadonlyDict<'str', 'str_list'>
  assemblyDictionary(pairs: { k: StrValue; v: Vec3Value[] }[]): ReadonlyDict<'str', 'vec3_list'>
  assemblyDictionary(pairs: { k: EntityValue; v: FloatValue }[]): ReadonlyDict<'entity', 'float'>
  assemblyDictionary(pairs: { k: EntityValue; v: IntValue }[]): ReadonlyDict<'entity', 'int'>
  assemblyDictionary(pairs: { k: EntityValue; v: BoolValue }[]): ReadonlyDict<'entity', 'bool'>
  assemblyDictionary(
    pairs: { k: EntityValue; v: ConfigIdValue }[]
  ): ReadonlyDict<'entity', 'config_id'>
  assemblyDictionary(pairs: { k: EntityValue; v: EntityValue }[]): ReadonlyDict<'entity', 'entity'>
  assemblyDictionary(
    pairs: { k: EntityValue; v: FactionValue }[]
  ): ReadonlyDict<'entity', 'faction'>
  assemblyDictionary(pairs: { k: EntityValue; v: GuidValue }[]): ReadonlyDict<'entity', 'guid'>
  assemblyDictionary(
    pairs: { k: EntityValue; v: PrefabIdValue }[]
  ): ReadonlyDict<'entity', 'prefab_id'>
  assemblyDictionary(pairs: { k: EntityValue; v: StrValue }[]): ReadonlyDict<'entity', 'str'>
  assemblyDictionary(pairs: { k: EntityValue; v: vec3 }[]): ReadonlyDict<'entity', 'vec3'>
  assemblyDictionary(
    pairs: { k: EntityValue; v: FloatValue[] }[]
  ): ReadonlyDict<'entity', 'float_list'>
  assemblyDictionary(pairs: { k: EntityValue; v: IntValue[] }[]): ReadonlyDict<'entity', 'int_list'>
  assemblyDictionary(
    pairs: { k: EntityValue; v: BoolValue[] }[]
  ): ReadonlyDict<'entity', 'bool_list'>
  assemblyDictionary(
    pairs: { k: EntityValue; v: ConfigIdValue[] }[]
  ): ReadonlyDict<'entity', 'config_id_list'>
  assemblyDictionary(
    pairs: { k: EntityValue; v: EntityValue[] }[]
  ): ReadonlyDict<'entity', 'entity_list'>
  assemblyDictionary(
    pairs: { k: EntityValue; v: FactionValue[] }[]
  ): ReadonlyDict<'entity', 'faction_list'>
  assemblyDictionary(
    pairs: { k: EntityValue; v: GuidValue[] }[]
  ): ReadonlyDict<'entity', 'guid_list'>
  assemblyDictionary(
    pairs: { k: EntityValue; v: PrefabIdValue[] }[]
  ): ReadonlyDict<'entity', 'prefab_id_list'>
  assemblyDictionary(pairs: { k: EntityValue; v: StrValue[] }[]): ReadonlyDict<'entity', 'str_list'>
  assemblyDictionary(
    pairs: { k: EntityValue; v: Vec3Value[] }[]
  ): ReadonlyDict<'entity', 'vec3_list'>
  assemblyDictionary(pairs: { k: GuidValue; v: FloatValue }[]): ReadonlyDict<'guid', 'float'>
  assemblyDictionary(pairs: { k: GuidValue; v: IntValue }[]): ReadonlyDict<'guid', 'int'>
  assemblyDictionary(pairs: { k: GuidValue; v: BoolValue }[]): ReadonlyDict<'guid', 'bool'>
  assemblyDictionary(pairs: { k: GuidValue; v: ConfigIdValue }[]): ReadonlyDict<'guid', 'config_id'>
  assemblyDictionary(pairs: { k: GuidValue; v: EntityValue }[]): ReadonlyDict<'guid', 'entity'>
  assemblyDictionary(pairs: { k: GuidValue; v: FactionValue }[]): ReadonlyDict<'guid', 'faction'>
  assemblyDictionary(pairs: { k: GuidValue; v: GuidValue }[]): ReadonlyDict<'guid', 'guid'>
  assemblyDictionary(pairs: { k: GuidValue; v: PrefabIdValue }[]): ReadonlyDict<'guid', 'prefab_id'>
  assemblyDictionary(pairs: { k: GuidValue; v: StrValue }[]): ReadonlyDict<'guid', 'str'>
  assemblyDictionary(pairs: { k: GuidValue; v: vec3 }[]): ReadonlyDict<'guid', 'vec3'>
  assemblyDictionary(pairs: { k: GuidValue; v: FloatValue[] }[]): ReadonlyDict<'guid', 'float_list'>
  assemblyDictionary(pairs: { k: GuidValue; v: IntValue[] }[]): ReadonlyDict<'guid', 'int_list'>
  assemblyDictionary(pairs: { k: GuidValue; v: BoolValue[] }[]): ReadonlyDict<'guid', 'bool_list'>
  assemblyDictionary(
    pairs: { k: GuidValue; v: ConfigIdValue[] }[]
  ): ReadonlyDict<'guid', 'config_id_list'>
  assemblyDictionary(
    pairs: { k: GuidValue; v: EntityValue[] }[]
  ): ReadonlyDict<'guid', 'entity_list'>
  assemblyDictionary(
    pairs: { k: GuidValue; v: FactionValue[] }[]
  ): ReadonlyDict<'guid', 'faction_list'>
  assemblyDictionary(pairs: { k: GuidValue; v: GuidValue[] }[]): ReadonlyDict<'guid', 'guid_list'>
  assemblyDictionary(
    pairs: { k: GuidValue; v: PrefabIdValue[] }[]
  ): ReadonlyDict<'guid', 'prefab_id_list'>
  assemblyDictionary(pairs: { k: GuidValue; v: StrValue[] }[]): ReadonlyDict<'guid', 'str_list'>
  assemblyDictionary(pairs: { k: GuidValue; v: Vec3Value[] }[]): ReadonlyDict<'guid', 'vec3_list'>
  assemblyDictionary(pairs: { k: FactionValue; v: FloatValue }[]): ReadonlyDict<'faction', 'float'>
  assemblyDictionary(pairs: { k: FactionValue; v: IntValue }[]): ReadonlyDict<'faction', 'int'>
  assemblyDictionary(pairs: { k: FactionValue; v: BoolValue }[]): ReadonlyDict<'faction', 'bool'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: ConfigIdValue }[]
  ): ReadonlyDict<'faction', 'config_id'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: EntityValue }[]
  ): ReadonlyDict<'faction', 'entity'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: FactionValue }[]
  ): ReadonlyDict<'faction', 'faction'>
  assemblyDictionary(pairs: { k: FactionValue; v: GuidValue }[]): ReadonlyDict<'faction', 'guid'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: PrefabIdValue }[]
  ): ReadonlyDict<'faction', 'prefab_id'>
  assemblyDictionary(pairs: { k: FactionValue; v: StrValue }[]): ReadonlyDict<'faction', 'str'>
  assemblyDictionary(pairs: { k: FactionValue; v: vec3 }[]): ReadonlyDict<'faction', 'vec3'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: FloatValue[] }[]
  ): ReadonlyDict<'faction', 'float_list'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: IntValue[] }[]
  ): ReadonlyDict<'faction', 'int_list'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: BoolValue[] }[]
  ): ReadonlyDict<'faction', 'bool_list'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: ConfigIdValue[] }[]
  ): ReadonlyDict<'faction', 'config_id_list'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: EntityValue[] }[]
  ): ReadonlyDict<'faction', 'entity_list'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: FactionValue[] }[]
  ): ReadonlyDict<'faction', 'faction_list'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: GuidValue[] }[]
  ): ReadonlyDict<'faction', 'guid_list'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: PrefabIdValue[] }[]
  ): ReadonlyDict<'faction', 'prefab_id_list'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: StrValue[] }[]
  ): ReadonlyDict<'faction', 'str_list'>
  assemblyDictionary(
    pairs: { k: FactionValue; v: Vec3Value[] }[]
  ): ReadonlyDict<'faction', 'vec3_list'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: FloatValue }[]
  ): ReadonlyDict<'config_id', 'float'>
  assemblyDictionary(pairs: { k: ConfigIdValue; v: IntValue }[]): ReadonlyDict<'config_id', 'int'>
  assemblyDictionary(pairs: { k: ConfigIdValue; v: BoolValue }[]): ReadonlyDict<'config_id', 'bool'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: ConfigIdValue }[]
  ): ReadonlyDict<'config_id', 'config_id'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: EntityValue }[]
  ): ReadonlyDict<'config_id', 'entity'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: FactionValue }[]
  ): ReadonlyDict<'config_id', 'faction'>
  assemblyDictionary(pairs: { k: ConfigIdValue; v: GuidValue }[]): ReadonlyDict<'config_id', 'guid'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: PrefabIdValue }[]
  ): ReadonlyDict<'config_id', 'prefab_id'>
  assemblyDictionary(pairs: { k: ConfigIdValue; v: StrValue }[]): ReadonlyDict<'config_id', 'str'>
  assemblyDictionary(pairs: { k: ConfigIdValue; v: vec3 }[]): ReadonlyDict<'config_id', 'vec3'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: FloatValue[] }[]
  ): ReadonlyDict<'config_id', 'float_list'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: IntValue[] }[]
  ): ReadonlyDict<'config_id', 'int_list'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: BoolValue[] }[]
  ): ReadonlyDict<'config_id', 'bool_list'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: ConfigIdValue[] }[]
  ): ReadonlyDict<'config_id', 'config_id_list'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: EntityValue[] }[]
  ): ReadonlyDict<'config_id', 'entity_list'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: FactionValue[] }[]
  ): ReadonlyDict<'config_id', 'faction_list'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: GuidValue[] }[]
  ): ReadonlyDict<'config_id', 'guid_list'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: PrefabIdValue[] }[]
  ): ReadonlyDict<'config_id', 'prefab_id_list'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: StrValue[] }[]
  ): ReadonlyDict<'config_id', 'str_list'>
  assemblyDictionary(
    pairs: { k: ConfigIdValue; v: Vec3Value[] }[]
  ): ReadonlyDict<'config_id', 'vec3_list'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: FloatValue }[]
  ): ReadonlyDict<'prefab_id', 'float'>
  assemblyDictionary(pairs: { k: PrefabIdValue; v: IntValue }[]): ReadonlyDict<'prefab_id', 'int'>
  assemblyDictionary(pairs: { k: PrefabIdValue; v: BoolValue }[]): ReadonlyDict<'prefab_id', 'bool'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: ConfigIdValue }[]
  ): ReadonlyDict<'prefab_id', 'config_id'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: EntityValue }[]
  ): ReadonlyDict<'prefab_id', 'entity'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: FactionValue }[]
  ): ReadonlyDict<'prefab_id', 'faction'>
  assemblyDictionary(pairs: { k: PrefabIdValue; v: GuidValue }[]): ReadonlyDict<'prefab_id', 'guid'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: PrefabIdValue }[]
  ): ReadonlyDict<'prefab_id', 'prefab_id'>
  assemblyDictionary(pairs: { k: PrefabIdValue; v: StrValue }[]): ReadonlyDict<'prefab_id', 'str'>
  assemblyDictionary(pairs: { k: PrefabIdValue; v: vec3 }[]): ReadonlyDict<'prefab_id', 'vec3'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: FloatValue[] }[]
  ): ReadonlyDict<'prefab_id', 'float_list'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: IntValue[] }[]
  ): ReadonlyDict<'prefab_id', 'int_list'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: BoolValue[] }[]
  ): ReadonlyDict<'prefab_id', 'bool_list'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: ConfigIdValue[] }[]
  ): ReadonlyDict<'prefab_id', 'config_id_list'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: EntityValue[] }[]
  ): ReadonlyDict<'prefab_id', 'entity_list'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: FactionValue[] }[]
  ): ReadonlyDict<'prefab_id', 'faction_list'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: GuidValue[] }[]
  ): ReadonlyDict<'prefab_id', 'guid_list'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: PrefabIdValue[] }[]
  ): ReadonlyDict<'prefab_id', 'prefab_id_list'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: StrValue[] }[]
  ): ReadonlyDict<'prefab_id', 'str_list'>
  assemblyDictionary(
    pairs: { k: PrefabIdValue; v: Vec3Value[] }[]
  ): ReadonlyDict<'prefab_id', 'vec3_list'>
  assemblyDictionary<K extends DictKeyType, V extends DictValueType>(
    pairs: {
      k: RuntimeParameterValueTypeMap[K]
      v: RuntimeParameterValueTypeMap[V]
    }[]
  ): ReadonlyDict<K, V> {
    if (pairs.length === 0) throw new Error('Pairs cannot be empty')

    if (pairs.length > 50) throw new Error('Pairs cannot be more than 50')

    const keys = pairs.map((p) => p.k)
    const keyType = matchTypes(
      ['int', 'str', 'entity', 'guid', 'faction', 'config_id', 'prefab_id'],
      ...keys
    )
    const values = pairs.map((p) => p.v)
    const valueType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      ...values
    )

    const key0to49Obj = keys.map((k) => parseValue(k, keyType))

    const isValueTypeList = z.instanceof(list).safeParse(values[0]).success
    const value0to49Obj = isValueTypeList
      ? values.map((v) => parseValue(v, (valueType + '_list') as keyof LiteralValueListTypeMap))
      : values.map((v) => parseValue(v, valueType))

    const kv0to49Args = key0to49Obj.flatMap((k, i) => [k, value0to49Obj[i]])

    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'assembly_dictionary',
      args: kv0to49Args
    })
    const retValueType = isValueTypeList ? ((valueType + '_list') as DictValueType) : valueType
    const ret = new dict(keyType, retValueType) as dict<K, V>
    ret.markPin(ref, 'dictionary', 0)
    return ret
  }

  /**
   * Set the value of the specified Custom Variable on the Target Entity
   *
   * 设置自定义变量: 为目标实体上的指定自定义变量设置值
   *
   * @param targetEntity The variable is mounted on this entity
   *
   * 目标实体: 该变量挂载在该实体上
   * @param variableName Custom variable name. Must be unique
   *
   * 变量名: 自定义变量的命名，不可重复
   * @param variableValue Value assigned to this variable
   *
   * 变量值: 赋予该变量的值
   * @param triggerEvent Default: False. When set to False, this custom variable editing will not trigger the On Custom Variable Change event
   *
   * 是否触发事件: 默认为否。选为否时，这次自定义变量修改不会触发自定义变量变化时事件
   */
  setCustomVariable<
    T extends
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
  >(
    targetEntity: EntityValue,
    variableName: StrValue,
    variableValue: RuntimeParameterValueTypeMap[T],
    triggerEvent: BoolValue = false
  ) {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3',
        'dict'
      ],
      variableValue
    )
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const variableNameObj = parseValue(variableName, 'str')
    const isVariableValueList = z.instanceof(list).safeParse(variableValue).success
    let variableValueObj: value
    if (isVariableValueList) {
      variableValueObj = parseValue(
        variableValue,
        (genericType + '_list') as keyof LiteralValueListTypeMap
      )
    } else {
      variableValueObj = parseValue(variableValue, genericType)
    }
    const triggerEventObj = parseValue(triggerEvent, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_custom_variable',
      args: [targetEntityObj, variableNameObj, variableValueObj, triggerEventObj]
    })
  }

  /**
   * Returns the value of the specified Custom Variable from the Target Entity; If the variable does not exist, returns the type's default value
   *
   * 获取自定义变量: 获取目标实体的指定自定义变量的值; 如果变量不存在，则返回类型的默认值
   *
   * @param targetEntity
   *
   * 目标实体
   * @param variableName
   *
   * 变量名
   *
   * @returns
   *
   * 变量值
   */
  getCustomVariable(targetEntity: EntityValue, variableName: StrValue): generic {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const variableNameObj = parseValue(variableName, 'str')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_custom_variable',
      args: [targetEntityObj, variableNameObj]
    })
    const ret = new generic()
    ret.markPin(ref, 'variableValue', 0)
    return ret as unknown as generic
  }

  /**
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
  setNodeGraphVariable<
    T extends
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
  >(
    variableName: StrValue,
    variableValue: RuntimeParameterValueTypeMap[T],
    triggerEvent: BoolValue = false
  ) {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3',
        'dict'
      ],
      variableValue
    )
    const variableNameObj = parseValue(variableName, 'str')
    const isVariableValueList = z.instanceof(list).safeParse(variableValue).success
    let variableValueObj: value
    if (isVariableValueList) {
      variableValueObj = parseValue(
        variableValue,
        (genericType + '_list') as keyof LiteralValueListTypeMap
      )
    } else {
      variableValueObj = parseValue(variableValue, genericType)
    }
    const triggerEventObj = parseValue(triggerEvent, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_node_graph_variable',
      args: [variableNameObj, variableValueObj, triggerEventObj]
    })
  }

  /**
   * @gsts
   *
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
  get(variableName: StrValue): generic {
    const name = this.resolveLiteralVarName(variableName)
    const meta = name ? this.registry.getVariableMeta(name) : undefined
    const ret = this.getNodeGraphVariable(variableName)
    if (!meta) return ret
    if (meta.type === 'dict') {
      if (!meta.dict) return ret
      return ret.asDict(meta.dict.k, meta.dict.v) as unknown as generic
    }
    return ret.asType(meta.type as never) as unknown as generic
  }

  /**
   * @gsts
   *
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
  set<
    T extends
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
  >(
    variableName: StrValue,
    variableValue: RuntimeParameterValueTypeMap[T],
    triggerEvent: BoolValue = false
  ) {
    const name = this.resolveLiteralVarName(variableName)
    const meta = name ? this.registry.getVariableMeta(name) : undefined
    if (!meta) {
      this.setNodeGraphVariable(variableName, variableValue as never, triggerEvent)
      return
    }

    const variableNameObj = parseValue(variableName, 'str')
    const triggerEventObj = parseValue(triggerEvent, 'bool')
    let variableValueObj: value

    if (meta.type === 'dict') {
      if (!meta.dict) {
        throw new Error(`[error] dict variable "${name}" missing key/value types`)
      }
      const dictValue = parseValue(variableValue, 'dict')
      if (dictValue.getKeyType() !== meta.dict.k || dictValue.getValueType() !== meta.dict.v) {
        throw new Error(`[error] dict value type mismatch for "${name}"`)
      }
      variableValueObj = dictValue
    } else {
      variableValueObj = parseValue(variableValue, meta.type as never)
    }

    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_node_graph_variable',
      args: [variableNameObj, variableValueObj, triggerEventObj]
    })
  }

  /**
   * @gsts internal
   *
   * Ensure a node graph variable exists (used by internal runtime helpers).
   */
  __gstsEnsureVariable(
    name: string,
    type: LiteralValueType,
    opts?: { dict?: { k: DictKeyType; v: DictValueType }; value?: unknown; length?: number }
  ) {
    if (type === 'dict' && !opts?.dict) {
      throw new Error(`[error] dict variable "${name}" missing key/value types`)
    }
    const variable: Variable =
      type === 'dict'
        ? {
            name,
            type: 'dict',
            dict: opts?.dict as { k: DictKeyType; v: DictValueType }
          }
        : {
            name,
            type
          }
    if (opts?.value !== undefined) {
      variable.value = opts.value as never
    }
    if (opts?.length !== undefined && type !== 'dict') {
      ;(variable as Extract<Variable, { type: Exclude<LiteralValueType, 'dict'> }>).length =
        opts.length
    }
    this.registry.ensureVariable(variable, {
      type,
      dict: opts?.dict
    })
  }

  /**
   * @gsts internal
   *
   * Register a capture dictionary for timers.
   */
  __gstsRegisterTimerCaptureDict(name: string, valueType: DictValueType) {
    this.registry.registerTimerCaptureDict(name, valueType)
  }

  /**
   * @gsts internal
   *
   * Attach timer capture metadata to a handle.
   */
  __gstsAttachTimerHandle(
    timerName: StrValue,
    dicts: { name: string; valueType: DictValueType }[]
  ): string {
    const handle = typeof timerName === 'string' ? new str(timerName) : timerName
    ;(handle as unknown as Record<string, unknown>).__gstsTimerCaptureDicts = dicts
    return handle as unknown as string
  }

  /**
   * @gsts internal
   *
   * Clear timer capture entries by timer name across all registered capture dicts.
   */
  __gstsClearTimerCaptures(
    timerName: StrValue,
    dicts: { name: string; valueType: DictValueType }[]
  ) {
    if (!dicts.length) return
    const nameObj = parseValue(timerName, 'str')
    for (const dictInfo of dicts) {
      const dictObj = this.getNodeGraphVariable(dictInfo.name).asDict('str', dictInfo.valueType)
      this.removeKeyValuePairsFromDictionaryByKey(dictObj, nameObj)
    }
  }

  /**
   * @gsts internal
   *
   * Register a handler for timer trigger events.
   */
  __gstsRegisterTimerHandler(
    handler: (
      evt: ServerEventPayloads['whenTimerIsTriggered'],
      f: ServerExecutionFlowFunctions
    ) => void
  ) {
    this.registry.runServerHandler('whenTimerIsTriggered', handler as never)
  }

  /**
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
  getNodeGraphVariable(variableName: StrValue): generic {
    const variableNameObj = parseValue(variableName, 'str')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_node_graph_variable',
      args: [variableNameObj]
    })
    const ret = new generic()
    ret.markPin(ref, 'variableValue', 0)
    return ret as unknown as generic
  }

  /**
   * When connected to the Query Node [Get Local Variable], this overwrites the value of that Local Variable
   *
   * 设置局部变量: 与查询节点【获取局部变量】连接后可以覆写该局部变量的值
   *
   * @param localVariable Container for data storage
   *
   * 局部变量: 存储数据的载体
   * @param value Value used to overwrite this local variable
   *
   * 值: 所要覆写该局部变量的值
   */
  setLocalVariable<
    T extends
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
  >(localVariable: LocalVariableValue, value: RuntimeParameterValueTypeMap[T]) {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      value
    )
    const localVariableObj = parseValue(localVariable, 'local_variable')
    const isValueObjList = z.instanceof(list).safeParse(value).success
    let valueObj: value
    if (isValueObjList) {
      valueObj = parseValue(value, (genericType + '_list') as keyof LiteralValueListTypeMap)
    } else {
      valueObj = parseValue(value, genericType)
    }
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_local_variable',
      args: [localVariableObj, valueObj]
    })
  }

  /**
   * @gsts
   *
   * Declares a local variable with an "empty" default value, and optionally assigns an initial value via Set Local Variable.
   *
   * Target: Avoid repeating the initial value evaluation in the node graph (node graph will repeat evaluation)
   *
   * 用空值声明局部变量，并可选地通过 Set Local Variable 设置初始值。
   *
   * 目的：避免把 init 直接作为 Get Local Variable 的 initialValue（节点图会重复求值），
   * 统一采用 get(empty) + set(init) 的高性能等价 JS 语义。
   */
  initLocalVariable(
    type: 'bool',
    init?: BoolValue
  ): { localVariable: localVariable; value: boolean }
  initLocalVariable(type: 'int', init?: IntValue): { localVariable: localVariable; value: bigint }
  initLocalVariable(
    type: 'float',
    init?: FloatValue
  ): { localVariable: localVariable; value: number }
  initLocalVariable(type: 'str', init?: StrValue): { localVariable: localVariable; value: string }
  // @ts-ignore allow
  initLocalVariable(type: 'vec3', init?: Vec3Value): { localVariable: localVariable; value: vec3 }
  initLocalVariable(type: 'guid', init?: GuidValue): { localVariable: localVariable; value: guid }
  initLocalVariable(
    type: 'entity',
    init?: EntityValue
  ): { localVariable: localVariable; value: entity }
  initLocalVariable(
    type: 'prefab_id',
    init?: PrefabIdValue
  ): { localVariable: localVariable; value: prefabId }
  initLocalVariable(
    type: 'config_id',
    init?: ConfigIdValue
  ): { localVariable: localVariable; value: configId }
  initLocalVariable(
    type: 'faction',
    init?: FactionValue
  ): { localVariable: localVariable; value: faction }
  initLocalVariable(
    type: 'bool_list',
    init?: BoolValue[]
  ): { localVariable: localVariable; value: boolean[] }
  initLocalVariable(
    type: 'int_list',
    init?: IntValue[]
  ): { localVariable: localVariable; value: bigint[] }
  initLocalVariable(
    type: 'float_list',
    init?: FloatValue[]
  ): { localVariable: localVariable; value: number[] }
  initLocalVariable(
    type: 'str_list',
    init?: StrValue[]
  ): { localVariable: localVariable; value: string[] }
  initLocalVariable(
    type: 'vec3_list',
    init?: Vec3Value[]
  ): { localVariable: localVariable; value: vec3[] }
  initLocalVariable(
    type: 'guid_list',
    init?: GuidValue[]
  ): { localVariable: localVariable; value: guid[] }
  initLocalVariable(
    type: 'entity_list',
    init?: EntityValue[]
  ): { localVariable: localVariable; value: entity[] }
  initLocalVariable(
    type: 'prefab_id_list',
    init?: PrefabIdValue[]
  ): { localVariable: localVariable; value: prefabId[] }
  initLocalVariable(
    type: 'config_id_list',
    init?: ConfigIdValue[]
  ): { localVariable: localVariable; value: configId[] }
  initLocalVariable(
    type: 'faction_list',
    init?: FactionValue[]
  ): { localVariable: localVariable; value: faction[] }
  initLocalVariable<
    T extends
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
  >(type: T, init?: RuntimeParameterValueTypeMap[T]) {
    switch (type) {
      case 'bool': {
        const v = this.getLocalVariable(false)
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'int': {
        const v = this.getLocalVariable(0n)
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'float': {
        const v = this.getLocalVariable(0)
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'str': {
        const v = this.getLocalVariable('')
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'vec3': {
        const v = this.getLocalVariable([0, 0, 0])
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'guid': {
        const v = this.getLocalVariable(new guid(0))
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'entity': {
        const e = new entity()
        e.markLiteral()
        const v = this.getLocalVariable(e)
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'prefab_id': {
        const v = this.getLocalVariable(new prefabId(0))
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'config_id': {
        const v = this.getLocalVariable(new configId(0))
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'faction': {
        const v = this.getLocalVariable(new faction(0))
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'bool_list': {
        const v = this.emptyLocalVariableList('bool')
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'int_list': {
        const v = this.emptyLocalVariableList('int')
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'float_list': {
        const v = this.emptyLocalVariableList('float')
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'str_list': {
        const v = this.emptyLocalVariableList('str')
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'vec3_list': {
        const v = this.emptyLocalVariableList('vec3')
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'guid_list': {
        const v = this.emptyLocalVariableList('guid')
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'entity_list': {
        const v = this.emptyLocalVariableList('entity')
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'prefab_id_list': {
        const v = this.emptyLocalVariableList('prefab_id')
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'config_id_list': {
        const v = this.emptyLocalVariableList('config_id')
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
      case 'faction_list': {
        const v = this.emptyLocalVariableList('faction')
        if (init !== undefined) this.setLocalVariable(v.localVariable, init)
        return v
      }
    }
  }

  /**
   * Retrieves a Local Variable and optionally sets its [Initial Value]; After setting the [Initial Value], the [Value] output parameter will be equal to the input [Initial Value]; When the output [Local Variable] is connected to the [Set Local Variable] Execution Node's input [Local Variable], the input [Value] of [Set Local Variable] overwrites this Search Node's output [Value]. The next time you use [Get Local Variable], the output [Value] is the overwritten value
   *
   * 获取局部变量: 可以获取局部变量，也可以设置该局部变量的【初始值】; 设置【初始值】以后，出参的【值】输出即为输入的【初始值】; 当出参【局部变量】与执行节点【设置局部变量】的入参【局部变量】连接后，执行节点【设置局部变量】的入参【值】会覆写该查询节点的出参【值】，再次使用【获取局部变量】节点时，出参【值】为覆写后的值
   *
   * @param initialValue Allows you to set the default initial value for local variables
   *
   * 初始值: 可以设置局部变量的初始默认值
   */
  getLocalVariable(initialValue: FloatValue): { localVariable: localVariable; value: number }
  getLocalVariable(initialValue: IntValue): { localVariable: localVariable; value: bigint }
  getLocalVariable(initialValue: BoolValue): { localVariable: localVariable; value: boolean }
  getLocalVariable(initialValue: ConfigIdValue): { localVariable: localVariable; value: configId }
  getLocalVariable(initialValue: EntityValue): { localVariable: localVariable; value: entity }
  getLocalVariable(initialValue: FactionValue): { localVariable: localVariable; value: faction }
  getLocalVariable(initialValue: GuidValue): { localVariable: localVariable; value: guid }
  getLocalVariable(initialValue: PrefabIdValue): { localVariable: localVariable; value: prefabId }
  getLocalVariable(initialValue: StrValue): { localVariable: localVariable; value: string }
  getLocalVariable(initialValue: vec3): {
    localVariable: localVariable
    value: vec3
  }
  getLocalVariable(initialValue: FloatValue[]): { localVariable: localVariable; value: number[] }
  getLocalVariable(initialValue: IntValue[]): { localVariable: localVariable; value: bigint[] }
  getLocalVariable(initialValue: BoolValue[]): { localVariable: localVariable; value: boolean[] }
  getLocalVariable(initialValue: ConfigIdValue[]): {
    localVariable: localVariable
    value: configId[]
  }
  getLocalVariable(initialValue: EntityValue[]): { localVariable: localVariable; value: entity[] }
  getLocalVariable(initialValue: FactionValue[]): {
    localVariable: localVariable
    value: faction[]
  }
  getLocalVariable(initialValue: GuidValue[]): { localVariable: localVariable; value: guid[] }
  getLocalVariable(initialValue: PrefabIdValue[]): {
    localVariable: localVariable
    value: prefabId[]
  }
  getLocalVariable(initialValue: StrValue[]): { localVariable: localVariable; value: string[] }
  getLocalVariable(initialValue: Vec3Value[]): {
    localVariable: localVariable
    value: vec3[]
  }
  getLocalVariable<
    T extends
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
  >(
    initialValue: RuntimeParameterValueTypeMap[T]
  ): {
    localVariable: localVariable
    value: RuntimeReturnValueTypeMap[T]
  } {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      initialValue
    )
    const isInitialValueList = z.instanceof(list).safeParse(initialValue).success
    let initialValueObj: value
    if (isInitialValueList) {
      initialValueObj = parseValue(
        initialValue,
        (genericType + '_list') as keyof LiteralValueListTypeMap
      )
    } else {
      initialValueObj = parseValue(initialValue, genericType)
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_local_variable',
      args: [initialValueObj]
    })
    return {
      localVariable: (() => {
        const ret = new localVariable()
        ret.markPin(ref, 'localVariable', 0)
        return ret
      })(),
      value: (() => {
        if (isInitialValueList) {
          const ret = new list(genericType)
          ret.markPin(ref, 'value', 1)
          return ret as unknown as RuntimeReturnValueTypeMap[T]
        }
        const ret = new ValueClassMap[genericType]()
        ret.markPin(ref, 'value', 1)
        return ret as unknown as RuntimeReturnValueTypeMap[T]
      })()
    }
  }

  /**
   * Searches the value of the specified Variable Name from the Custom Variable Component snapshot; Only available for the [On Entity Destroyed] event
   *
   * 查询自定义变量快照: 从自定义变量组件快照中，查询指定变量名的值; 仅可用于【实体销毁时】事件
   *
   * @param customVariableComponentSnapshot
   *
   * 自定义变量组件快照
   * @param variableName
   *
   * 变量名
   *
   * @returns
   *
   * 变量值
   */
  queryCustomVariableSnapshot(
    customVariableComponentSnapshot: CustomVariableSnapshotValue,
    variableName: StrValue
  ): generic {
    const customVariableComponentSnapshotObj = parseValue(
      customVariableComponentSnapshot,
      'custom_variable_snapshot'
    )
    const variableNameObj = parseValue(variableName, 'str')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_custom_variable_snapshot',
      args: [customVariableComponentSnapshotObj, variableNameObj]
    })
    const ret = new generic()
    ret.markPin(ref, 'variableValue', 0)
    return ret as unknown as generic
  }

  /**
   * Searches the corresponding Value in the Dictionary by Key. If the Key does not exist, returns the type's default value
   *
   * 以键查询字典值: 根据键查询字典中对应的值，如果键不存在，则返回类型默认值
   *
   * @param dictionary
   *
   * 字典
   * @param key
   *
   * 键
   *
   * @returns
   *
   * 值
   */
  queryDictionaryValueByKey<K extends DictKeyType, V extends DictValueType>(
    dictionary: dict<K, V>,
    key: RuntimeParameterValueTypeMap[K]
  ): RuntimeReturnValueTypeMap[V] {
    const dictionaryObj = parseValue(dictionary, 'dict')
    const keyObj = parseValue(key, dictionaryObj.getKeyType())
    const valueType = dictionaryObj.getValueType()
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_dictionary_value_by_key',
      args: [dictionaryObj, keyObj]
    })
    if (isListType(valueType)) {
      const base = getBaseValueType(valueType)
      const ret = new list(base)
      ret.markPin(ref, 'value', 0)
      return ret as unknown as RuntimeReturnValueTypeMap[V]
    }
    const ret = new ValueClassMap[valueType]()
    ret.markPin(ref, 'value', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[V]
  }

  /**
   * Creates Key-Value Pairs sequentially from the input key and value lists; This node builds the Dictionary using the shorter of the key and value lists; extra items are truncated; If duplicate keys are found in the key list, creation fails and returns an empty Dictionary
   *
   * 建立字典: 根据输入的键和值列表的顺序依次建立键值对。; 此节点会按照键和值列表中较短的一个进行字典创建，多余的部分会被截断; 如果键列表中存在重复值，则会创建失败，返回空字典
   *
   * GSTS Note: The dictionary declared by this method cannot be modified, and a node graph variable dictionary must be declared if modification is required.
   *
   * GSTS 注: 该方法声明的字典无法进行修改, 需要修改时必须声明节点图变量字典
   *
   * @param keyList
   *
   * 键列表
   * @param valueList
   *
   * 值列表
   *
   * @returns
   *
   * 字典
   */
  createDictionary(keyList: IntValue[], valueList: FloatValue[]): ReadonlyDict<'int', 'float'>
  createDictionary(keyList: IntValue[], valueList: IntValue[]): ReadonlyDict<'int', 'int'>
  createDictionary(keyList: IntValue[], valueList: BoolValue[]): ReadonlyDict<'int', 'bool'>
  createDictionary(
    keyList: IntValue[],
    valueList: ConfigIdValue[]
  ): ReadonlyDict<'int', 'config_id'>
  createDictionary(keyList: IntValue[], valueList: EntityValue[]): ReadonlyDict<'int', 'entity'>
  createDictionary(keyList: IntValue[], valueList: FactionValue[]): ReadonlyDict<'int', 'faction'>
  createDictionary(keyList: IntValue[], valueList: GuidValue[]): ReadonlyDict<'int', 'guid'>
  createDictionary(
    keyList: IntValue[],
    valueList: PrefabIdValue[]
  ): ReadonlyDict<'int', 'prefab_id'>
  createDictionary(keyList: IntValue[], valueList: StrValue[]): ReadonlyDict<'int', 'str'>
  createDictionary(keyList: IntValue[], valueList: Vec3Value[]): ReadonlyDict<'int', 'vec3'>
  createDictionary(keyList: StrValue[], valueList: FloatValue[]): ReadonlyDict<'str', 'float'>
  createDictionary(keyList: StrValue[], valueList: IntValue[]): ReadonlyDict<'str', 'int'>
  createDictionary(keyList: StrValue[], valueList: BoolValue[]): ReadonlyDict<'str', 'bool'>
  createDictionary(
    keyList: StrValue[],
    valueList: ConfigIdValue[]
  ): ReadonlyDict<'str', 'config_id'>
  createDictionary(keyList: StrValue[], valueList: EntityValue[]): ReadonlyDict<'str', 'entity'>
  createDictionary(keyList: StrValue[], valueList: FactionValue[]): ReadonlyDict<'str', 'faction'>
  createDictionary(keyList: StrValue[], valueList: GuidValue[]): ReadonlyDict<'str', 'guid'>
  createDictionary(
    keyList: StrValue[],
    valueList: PrefabIdValue[]
  ): ReadonlyDict<'str', 'prefab_id'>
  createDictionary(keyList: StrValue[], valueList: StrValue[]): ReadonlyDict<'str', 'str'>
  createDictionary(keyList: StrValue[], valueList: Vec3Value[]): ReadonlyDict<'str', 'vec3'>
  createDictionary(keyList: EntityValue[], valueList: FloatValue[]): ReadonlyDict<'entity', 'float'>
  createDictionary(keyList: EntityValue[], valueList: IntValue[]): ReadonlyDict<'entity', 'int'>
  createDictionary(keyList: EntityValue[], valueList: BoolValue[]): ReadonlyDict<'entity', 'bool'>
  createDictionary(
    keyList: EntityValue[],
    valueList: ConfigIdValue[]
  ): ReadonlyDict<'entity', 'config_id'>
  createDictionary(
    keyList: EntityValue[],
    valueList: EntityValue[]
  ): ReadonlyDict<'entity', 'entity'>
  createDictionary(
    keyList: EntityValue[],
    valueList: FactionValue[]
  ): ReadonlyDict<'entity', 'faction'>
  createDictionary(keyList: EntityValue[], valueList: GuidValue[]): ReadonlyDict<'entity', 'guid'>
  createDictionary(
    keyList: EntityValue[],
    valueList: PrefabIdValue[]
  ): ReadonlyDict<'entity', 'prefab_id'>
  createDictionary(keyList: EntityValue[], valueList: StrValue[]): ReadonlyDict<'entity', 'str'>
  createDictionary(keyList: EntityValue[], valueList: Vec3Value[]): ReadonlyDict<'entity', 'vec3'>
  createDictionary(keyList: GuidValue[], valueList: FloatValue[]): ReadonlyDict<'guid', 'float'>
  createDictionary(keyList: GuidValue[], valueList: IntValue[]): ReadonlyDict<'guid', 'int'>
  createDictionary(keyList: GuidValue[], valueList: BoolValue[]): ReadonlyDict<'guid', 'bool'>
  createDictionary(
    keyList: GuidValue[],
    valueList: ConfigIdValue[]
  ): ReadonlyDict<'guid', 'config_id'>
  createDictionary(keyList: GuidValue[], valueList: EntityValue[]): ReadonlyDict<'guid', 'entity'>
  createDictionary(keyList: GuidValue[], valueList: FactionValue[]): ReadonlyDict<'guid', 'faction'>
  createDictionary(keyList: GuidValue[], valueList: GuidValue[]): ReadonlyDict<'guid', 'guid'>
  createDictionary(
    keyList: GuidValue[],
    valueList: PrefabIdValue[]
  ): ReadonlyDict<'guid', 'prefab_id'>
  createDictionary(keyList: GuidValue[], valueList: StrValue[]): ReadonlyDict<'guid', 'str'>
  createDictionary(keyList: GuidValue[], valueList: Vec3Value[]): ReadonlyDict<'guid', 'vec3'>
  createDictionary(
    keyList: FactionValue[],
    valueList: FloatValue[]
  ): ReadonlyDict<'faction', 'float'>
  createDictionary(keyList: FactionValue[], valueList: IntValue[]): ReadonlyDict<'faction', 'int'>
  createDictionary(keyList: FactionValue[], valueList: BoolValue[]): ReadonlyDict<'faction', 'bool'>
  createDictionary(
    keyList: FactionValue[],
    valueList: ConfigIdValue[]
  ): ReadonlyDict<'faction', 'config_id'>
  createDictionary(
    keyList: FactionValue[],
    valueList: EntityValue[]
  ): ReadonlyDict<'faction', 'entity'>
  createDictionary(
    keyList: FactionValue[],
    valueList: FactionValue[]
  ): ReadonlyDict<'faction', 'faction'>
  createDictionary(keyList: FactionValue[], valueList: GuidValue[]): ReadonlyDict<'faction', 'guid'>
  createDictionary(
    keyList: FactionValue[],
    valueList: PrefabIdValue[]
  ): ReadonlyDict<'faction', 'prefab_id'>
  createDictionary(keyList: FactionValue[], valueList: StrValue[]): ReadonlyDict<'faction', 'str'>
  createDictionary(keyList: FactionValue[], valueList: Vec3Value[]): ReadonlyDict<'faction', 'vec3'>
  createDictionary(
    keyList: ConfigIdValue[],
    valueList: FloatValue[]
  ): ReadonlyDict<'config_id', 'float'>
  createDictionary(
    keyList: ConfigIdValue[],
    valueList: IntValue[]
  ): ReadonlyDict<'config_id', 'int'>
  createDictionary(
    keyList: ConfigIdValue[],
    valueList: BoolValue[]
  ): ReadonlyDict<'config_id', 'bool'>
  createDictionary(
    keyList: ConfigIdValue[],
    valueList: ConfigIdValue[]
  ): ReadonlyDict<'config_id', 'config_id'>
  createDictionary(
    keyList: ConfigIdValue[],
    valueList: EntityValue[]
  ): ReadonlyDict<'config_id', 'entity'>
  createDictionary(
    keyList: ConfigIdValue[],
    valueList: FactionValue[]
  ): ReadonlyDict<'config_id', 'faction'>
  createDictionary(
    keyList: ConfigIdValue[],
    valueList: GuidValue[]
  ): ReadonlyDict<'config_id', 'guid'>
  createDictionary(
    keyList: ConfigIdValue[],
    valueList: PrefabIdValue[]
  ): ReadonlyDict<'config_id', 'prefab_id'>
  createDictionary(
    keyList: ConfigIdValue[],
    valueList: StrValue[]
  ): ReadonlyDict<'config_id', 'str'>
  createDictionary(
    keyList: ConfigIdValue[],
    valueList: Vec3Value[]
  ): ReadonlyDict<'config_id', 'vec3'>
  createDictionary(
    keyList: PrefabIdValue[],
    valueList: FloatValue[]
  ): ReadonlyDict<'prefab_id', 'float'>
  createDictionary(
    keyList: PrefabIdValue[],
    valueList: IntValue[]
  ): ReadonlyDict<'prefab_id', 'int'>
  createDictionary(
    keyList: PrefabIdValue[],
    valueList: BoolValue[]
  ): ReadonlyDict<'prefab_id', 'bool'>
  createDictionary(
    keyList: PrefabIdValue[],
    valueList: ConfigIdValue[]
  ): ReadonlyDict<'prefab_id', 'config_id'>
  createDictionary(
    keyList: PrefabIdValue[],
    valueList: EntityValue[]
  ): ReadonlyDict<'prefab_id', 'entity'>
  createDictionary(
    keyList: PrefabIdValue[],
    valueList: FactionValue[]
  ): ReadonlyDict<'prefab_id', 'faction'>
  createDictionary(
    keyList: PrefabIdValue[],
    valueList: GuidValue[]
  ): ReadonlyDict<'prefab_id', 'guid'>
  createDictionary(
    keyList: PrefabIdValue[],
    valueList: PrefabIdValue[]
  ): ReadonlyDict<'prefab_id', 'prefab_id'>
  createDictionary(
    keyList: PrefabIdValue[],
    valueList: StrValue[]
  ): ReadonlyDict<'prefab_id', 'str'>
  createDictionary(
    keyList: PrefabIdValue[],
    valueList: Vec3Value[]
  ): ReadonlyDict<'prefab_id', 'vec3'>
  createDictionary<K extends DictKeyType, V extends keyof CommonLiteralValueTypeMap>(
    keyList: RuntimeParameterValueTypeMap[K][],
    valueList: RuntimeParameterValueTypeMap[V][]
  ): ReadonlyDict<K, V> {
    const keyListConcreteType = (keyList as unknown as list<K>).getConcreteType()
    const keyListObj = parseValue(
      keyList,
      (keyListConcreteType + '_list') as keyof LiteralValueListTypeMap
    )
    const valueListConcreteType = (valueList as unknown as list<V>).getConcreteType()
    const valueListObj = parseValue(
      valueList,
      (valueListConcreteType + '_list') as keyof LiteralValueListTypeMap
    )
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'create_dictionary',
      args: [keyListObj, valueListObj]
    })
    const ret = new dict(keyListConcreteType, valueListConcreteType)
    ret.markPin(ref, 'dictionary', 0)
    return ret
  }

  /**
   * Searches whether the specified Dictionary contains the specified Value
   *
   * 查询字典是否包含特定值: 查询指定字典是否包含特定的值
   *
   * @param dictionary
   *
   * 字典
   * @param value
   *
   * 值
   *
   * @returns
   *
   * 是否包含
   */
  queryIfDictionaryContainsSpecificValue<
    K extends DictKeyType,
    V extends keyof CommonLiteralValueTypeMap
  >(dictionary: dict<K, V>, value: RuntimeParameterValueTypeMap[V]): boolean {
    const dictionaryObj = parseValue(dictionary, 'dict')
    const valueObj = parseValue(value, dictionaryObj.getValueType())
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_if_dictionary_contains_specific_value',
      args: [dictionaryObj, valueObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'include', 0)
    return ret as unknown as boolean
  }

  /**
   * Returns a list of all Values in the Dictionary. Because Key-Value Pairs are unordered, the Values may not be returned in insertion order
   *
   * 获取字典中值组成的列表: 获取字典中所有值组成的列表。由于字典中键值对是无序排列的，所以取出的值列表也不一定按照其插入顺序排列
   *
   * @param dictionary
   *
   * 字典
   *
   * @returns
   *
   * 值列表
   */
  getListOfValuesFromDictionary<K extends DictKeyType, V extends keyof CommonLiteralValueTypeMap>(
    dictionary: dict<K, V>
  ): RuntimeReturnValueTypeMap[`${V}_list`] {
    const dictionaryObj = parseValue(dictionary, 'dict')
    const valueType = dictionaryObj.getValueType() as V
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_list_of_values_from_dictionary',
      args: [dictionaryObj]
    })
    const ret = new list(valueType)
    ret.markPin(ref, 'valueList', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[`${V}_list`]
  }

  /**
   * Sort and output the specified Dictionary by keys in ascending or descending order
   *
   * 对字典按键排序: 将指定字典按键进行顺序或逆序排序后输出
   *
   * @param dictionary
   *
   * 字典
   * @param sortBy
   *
   * 排序方式
   */
  sortDictionaryByKey<V extends keyof CommonLiteralValueTypeMap>(
    dictionary: dict<'int', V>,
    sortBy: SortBy
  ): {
    /**
     *
     * 键列表
     */
    keyList: RuntimeReturnValueTypeMap['int_list']
    /**
     *
     * 值列表
     */
    valueList: RuntimeReturnValueTypeMap[`${V}_list`]
  } {
    const dictionaryObj = parseValue(dictionary, 'dict')
    const sortByObj = parseValue(sortBy, 'enumeration')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'sort_dictionary_by_key',
      args: [dictionaryObj, sortByObj]
    })
    return {
      keyList: (() => {
        const ret = new list('int')
        ret.markPin(ref, 'keyList', 0)
        return ret as unknown as RuntimeReturnValueTypeMap['int_list']
      })(),
      valueList: (() => {
        const ret = new list(dictionaryObj.getValueType() as V)
        ret.markPin(ref, 'valueList', 1)
        return ret as unknown as RuntimeReturnValueTypeMap[`${V}_list`]
      })()
    }
  }

  /**
   * Sort and output the specified Dictionary by values in ascending or descending order
   *
   * 对字典按值排序: 将指定字典按值进行顺序或逆序排序后输出
   *
   * @param dictionary
   *
   * 字典
   * @param sortBy
   *
   * 排序方式
   */
  sortDictionaryByValue<K extends DictKeyType, V extends 'int' | 'float'>(
    dictionary: dict<K, V>,
    sortBy: SortBy
  ): {
    /**
     *
     * 键列表
     */
    keyList: RuntimeReturnValueTypeMap[`${K}_list`]
    /**
     *
     * 值列表
     */
    valueList: RuntimeReturnValueTypeMap[`${V}_list`]
  } {
    const dictionaryObj = parseValue(dictionary, 'dict')
    const sortByObj = parseValue(sortBy, 'enumeration')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'sort_dictionary_by_value',
      args: [dictionaryObj, sortByObj]
    })
    return {
      keyList: (() => {
        const ret = new list(dictionaryObj.getKeyType() as K)
        ret.markPin(ref, 'keyList', 0)
        return ret as unknown as RuntimeReturnValueTypeMap[`${K}_list`]
      })(),
      valueList: (() => {
        const ret = new list(dictionaryObj.getValueType() as V)
        ret.markPin(ref, 'valueList', 1)
        return ret as unknown as RuntimeReturnValueTypeMap[`${V}_list`]
      })()
    }
  }

  /**
   * Break out of a Finite Loop. The output pin must connect to the [Break Loop] input parameter of the [Finite Loop] Node
   *
   * 跳出循环: 从有限循环中跳出。出引脚需要与节点【有限循环】的【跳出循环】入参相连
   */
  breakLoop(...loopNodeIds: IntValue[]): void {
    const loopNodeIdObjs = loopNodeIds.map((id) => parseValue(id, 'int'))
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'break_loop',
      args: loopNodeIdObjs
    })
    // break_loop has no exec output; terminate the current path to avoid invalid chaining.
    this.registry.returnFromCurrentExecPath({ countReturn: false })
  }

  /**
   * From the [Loop Start Value] to the [Loop End Value], the loop iterates, incrementing the Integer by 1 each time. On each iteration, it executes the Nodes connected to [Loop Body]. After a full iteration, it executes the Nodes connected to [Loop Complete].; Use [Break Loop] to end the iteration early. After exiting the loop, the logic connected to the [Loop Complete] node will also be executed.
   *
   * 有限循环: 从【循环起始值】开始到【循环终止值】结束，会遍历其中的循环值，每次整数加一。每次循环会执行一次【循环体】后连接的节点逻辑。完成一次完整遍历后，会执行【循环完成】后连接的节点逻辑; 可以使用【跳出循环】来提前结束该循环值遍历，跳出循环后也会执行【循环完成】后连接的节点逻辑
   *
   * @param loopStartValue Starting integer value for iteration
   *
   * 循环起始值: 遍历开始的整数值
   * @param loopEndValue Integer value at which the iteration ends
   *
   * 循环终止值: 遍历结束的整数值
   *
   * @returns Integer value of the current execution logic
   *
   * 当前循环值: 当次执行逻辑的整数值
   */
  finiteLoop(
    loopStartValue: IntValue,
    loopEndValue: IntValue,
    loopBody: (loopValue: bigint, breakLoop: () => void) => void
  ): void {
    const LOOP_BODY_SOURCE_INDEX = 0
    const LOOP_COMPLETE_SOURCE_INDEX = 1

    const loopStartValueObj = parseValue(loopStartValue, 'int')
    const loopEndValueObj = parseValue(loopEndValue, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'finite_loop',
      args: [loopStartValueObj, loopEndValueObj]
    })
    const ret = new int()
    ret.markPin(ref, 'currentLoopValue', 0)

    const returnMarkBefore = this.registry.getReturnCallCounter()
    this.registry.withExecBranch(ref.id, LOOP_BODY_SOURCE_INDEX, () => {
      this.registry.withLoop(ref.id, () => {
        globalThis.gsts.ctx.withCtx('server_loop', () =>
          loopBody(ret as unknown as bigint, () => this.breakLoop(ref.id))
        )
      })
    })
    const hasReturnInBody = this.registry.getReturnCallCounter() !== returnMarkBefore

    if (!hasReturnInBody) {
      this.registry.markLinkNextExecFrom(ref.id, LOOP_COMPLETE_SOURCE_INDEX)
      return
    }

    // loop body 存在 return（可能是运行时条件触发）：在 loop complete 处插入 return gate
    this.registry.setCurrentExecTailEndpoints([
      { nodeId: ref.id, sourceIndex: LOOP_COMPLETE_SOURCE_INDEX }
    ])
    const returned = this.registry.getOrCreateReturnGateLocalVariable().value
    const returnedObj = parseValue(returned, 'bool')
    const gate = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'double_branch',
      args: [returnedObj]
    })
    // false 分支（未 return）才继续
    this.registry.setCurrentExecTailEndpoints([{ nodeId: gate.id, sourceIndex: 1 }])
  }

  /**
   * Iterate through the specified List in sequential order
   *
   * 列表迭代循环: 按照列表顺序遍历循环指定列表
   *
   * @param iterationList List to iterate through
   *
   * 迭代列表: 被遍历循环的列表
   *
   * @returns Each value in the list
   *
   * 迭代值: 列表中的每个值
   */
  listIterationLoop(
    iterationList: FloatValue[],
    loopBody: (iterationValue: number, breakLoop: () => void) => void
  ): void
  listIterationLoop(
    iterationList: IntValue[],
    loopBody: (iterationValue: bigint, breakLoop: () => void) => void
  ): void
  listIterationLoop(
    iterationList: BoolValue[],
    loopBody: (iterationValue: boolean, breakLoop: () => void) => void
  ): void
  listIterationLoop(
    iterationList: ConfigIdValue[],
    loopBody: (iterationValue: configId, breakLoop: () => void) => void
  ): void
  listIterationLoop(
    iterationList: EntityValue[],
    loopBody: (iterationValue: entity, breakLoop: () => void) => void
  ): void
  listIterationLoop(
    iterationList: FactionValue[],
    loopBody: (iterationValue: faction, breakLoop: () => void) => void
  ): void
  listIterationLoop(
    iterationList: GuidValue[],
    loopBody: (iterationValue: guid, breakLoop: () => void) => void
  ): void
  listIterationLoop(
    iterationList: PrefabIdValue[],
    loopBody: (iterationValue: prefabId, breakLoop: () => void) => void
  ): void
  listIterationLoop(
    iterationList: StrValue[],
    loopBody: (iterationValue: string, breakLoop: () => void) => void
  ): void
  listIterationLoop(
    iterationList: Vec3Value[],
    loopBody: (iterationValue: vec3, breakLoop: () => void) => void
  ): void
  listIterationLoop<
    T extends
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
  >(
    iterationList: RuntimeParameterValueTypeMap[T][],
    loopBody: (iterationValue: RuntimeReturnValueTypeMap[T], breakLoop: () => void) => void
  ): void {
    const LOOP_BODY_SOURCE_INDEX = 0
    const LOOP_COMPLETE_SOURCE_INDEX = 1

    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      iterationList
    )
    const iterationListObj = parseValue(iterationList, `${genericType}_list`)
    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'list_iteration_loop',
      args: [iterationListObj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'iterationValue', 0)

    const returnMarkBefore = this.registry.getReturnCallCounter()
    this.registry.withExecBranch(ref.id, LOOP_BODY_SOURCE_INDEX, () => {
      this.registry.withLoop(ref.id, () => {
        globalThis.gsts.ctx.withCtx('server_loop', () =>
          loopBody(ret as unknown as RuntimeReturnValueTypeMap[T], () => this.breakLoop(ref.id))
        )
      })
    })
    const hasReturnInBody = this.registry.getReturnCallCounter() !== returnMarkBefore

    if (!hasReturnInBody) {
      this.registry.markLinkNextExecFrom(ref.id, LOOP_COMPLETE_SOURCE_INDEX)
      return
    }

    // loop body 存在 return（可能是运行时条件触发）：在 loop complete 处插入 return gate
    this.registry.setCurrentExecTailEndpoints([
      { nodeId: ref.id, sourceIndex: LOOP_COMPLETE_SOURCE_INDEX }
    ])
    const returned = this.registry.getOrCreateReturnGateLocalVariable().value
    const returnedObj = parseValue(returned, 'bool')
    const gate = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'double_branch',
      args: [returnedObj]
    })
    // false 分支（未 return）才继续
    this.registry.setCurrentExecTailEndpoints([{ nodeId: gate.id, sourceIndex: 1 }])
  }

  /**
   * Accepts one input parameter as the control expression (supports Integer or String). Branches into multiple paths based on its value; When the value on an Output Pin equals the control expression, execution continues along that Output Pin. If no pin matches, the [Default] pin is taken
   *
   * 多分支: 接受一个输入参数作为控制表达式(支持整数或字符串)，根据控制表达式的值可以分出多个不同的分支; 当出引脚上的值与控制表达式的值相等时，会沿该出引脚向后执行逻辑。如果没有找到匹配的引脚，则会走【默认】引脚
   *
   * @param controlExpression Only supports Integers or Strings
   *
   * 控制表达式: 仅支持整数或字符串
   */
  multipleBranches(
    controlExpression: IntValue,
    branches: Record<number, (() => void) | number> & { default?: (() => void) | number }
  ): void
  multipleBranches(
    controlExpression: StrValue,
    branches: Record<string, (() => void) | string> & { default?: (() => void) | string }
  ): void
  multipleBranches<T extends 'int' | 'str'>(
    controlExpression: RuntimeParameterValueTypeMap[T],
    branches:
      | (Record<number, (() => void) | number> & { default?: (() => void) | number })
      | (Record<string, (() => void) | string> & { default?: (() => void) | string })
  ): void {
    const genericType = matchTypes(['int', 'str'], controlExpression)
    const controlExpressionObj = parseValue(controlExpression, genericType)

    const rawBranches = branches as Record<string, unknown>
    const caseKeys = Object.keys(rawBranches).filter((k) => k !== 'default')
    const caseArgs: value[] =
      genericType === 'int'
        ? caseKeys.map((k) => new int(Number(k)))
        : caseKeys.map((k) => new str(String(k)))

    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'multiple_branches',
      args: [controlExpressionObj, ...caseArgs]
    })

    // 分支执行：按约定 default 的 source_index 固定为 0；其它分支按顺序从 1 开始递增
    const branchResults: Array<{
      sourceIndex: number
      terminatedByReturn?: boolean
      tailEndpoints: Array<{ nodeId: number; sourceIndex?: number }>
      headNodeId?: number
    }> = []

    const defaultVal = rawBranches.default
    let defaultResult:
      | {
          terminatedByReturn?: boolean
          tailEndpoints: Array<{ nodeId: number; sourceIndex?: number }>
          headNodeId?: number
        }
      | undefined

    const emptyDefault = {
      terminatedByReturn: false,
      tailEndpoints: [],
      headNodeId: undefined
    }

    if (typeof defaultVal === 'function') {
      const r = this.registry.withExecBranch(ref.id, 0, () =>
        globalThis.gsts.ctx.withCtx('server_switch', defaultVal as () => void)
      )
      defaultResult = r
      branchResults.push({ sourceIndex: 0, ...r })
    } else if (defaultVal === undefined) {
      // 空默认分支视为“未 return 且无节点”，join 时需要从分支节点对应输出直接连出
      branchResults.push({ sourceIndex: 0, ...emptyDefault })
    }

    const branchResultsByKey = new Map<
      string,
      {
        terminatedByReturn?: boolean
        tailEndpoints: Array<{ nodeId: number; sourceIndex?: number }>
        headNodeId?: number
      }
    >()

    caseKeys.forEach((k, i) => {
      const v = rawBranches[k]
      if (typeof v !== 'function') return
      const sourceIndex = i + 1
      const r = this.registry.withExecBranch(ref.id, sourceIndex, () =>
        globalThis.gsts.ctx.withCtx('server_switch', v as () => void)
      )
      branchResultsByKey.set(k, r)
      branchResults.push({ sourceIndex, ...r })
    })

    const resolveAliasKey = (input: unknown): string | null => {
      if (typeof input === 'string') return input
      if (typeof input === 'number') return String(input)
      return null
    }

    const ensureCaseKey = (key: string, origin: string) => {
      if (!caseKeys.includes(key)) {
        throw new Error(`[error] multipleBranches: "${origin}" refers to missing case "${key}"`)
      }
    }

    const resolveTarget = (
      key: string,
      stack: string[]
    ): { kind: 'case'; key: string } | { kind: 'default' } => {
      if (stack.includes(key)) {
        throw new Error(
          `[error] multipleBranches: circular case alias "${stack.join(' -> ')} -> ${key}"`
        )
      }
      const value = rawBranches[key]
      if (typeof value === 'function') return { kind: 'case', key }
      const alias = resolveAliasKey(value)
      if (!alias) {
        throw new Error(`[error] multipleBranches: "${key}" must be a function or case alias`)
      }
      if (alias === 'default') return { kind: 'default' }
      ensureCaseKey(alias, key)
      return resolveTarget(alias, [...stack, key])
    }

    const resolveDefault = (): { kind: 'case'; key: string } | { kind: 'default' } => {
      if (typeof defaultVal === 'function') return { kind: 'default' }
      const alias = resolveAliasKey(defaultVal)
      if (!alias) {
        throw new Error('[error] multipleBranches: default must be a function or case alias')
      }
      if (alias === 'default') {
        throw new Error('[error] multipleBranches: default alias cannot refer to itself')
      }
      ensureCaseKey(alias, 'default')
      return resolveTarget(alias, ['default'])
    }

    const attachAlias = (
      sourceIndex: number,
      target:
        | {
            terminatedByReturn?: boolean
            tailEndpoints: Array<{ nodeId: number; sourceIndex?: number }>
            headNodeId?: number
          }
        | undefined
    ) => {
      const resolved = target ?? emptyDefault
      if (resolved.headNodeId !== undefined) {
        this.registry.connectExecBranchOutput(ref.id, sourceIndex, resolved.headNodeId)
        return
      }
      branchResults.push({ sourceIndex, ...resolved })
    }

    caseKeys.forEach((k, i) => {
      const v = rawBranches[k]
      if (typeof v === 'function') return
      const target = resolveTarget(k, [])
      if (target.kind === 'default') {
        attachAlias(i + 1, defaultResult)
      } else {
        attachAlias(i + 1, branchResultsByKey.get(target.key))
      }
    })

    if (defaultVal !== undefined && typeof defaultVal !== 'function') {
      const target = resolveDefault()
      if (target.kind === 'default') {
        attachAlias(0, defaultResult)
      } else {
        attachAlias(0, branchResultsByKey.get(target.key))
      }
    }

    // 启用 join：后续顺序代码连接到所有未 return 的分支尾部（空分支则从分支节点输出直接连出）
    const joinEndpoints: Array<{ nodeId: number; sourceIndex?: number }> = []
    branchResults.forEach((r) => {
      if (r.terminatedByReturn) return
      if (r.tailEndpoints.length) {
        joinEndpoints.push(...r.tailEndpoints)
      } else {
        joinEndpoints.push({ nodeId: ref.id, sourceIndex: r.sourceIndex })
      }
    })
    this.registry.setCurrentExecTailEndpoints(joinEndpoints)
  }

  /**
   * Branches into True or False based on the evaluated condition; When the Boolean is True, the [True] execution flow runs; when it is False, the [False] execution flow runs
   *
   * 双分支: 根据输入条件的判断结果可以分出“是”与“否”两个不同的分支; 当布尔值为“是”时，后续会执行【是】对应的执行流；布尔值为“否”时，会执行【否】对应的执行流
   *
   * @param condition
   *
   * 条件
   */
  doubleBranch(condition: BoolValue, trueBranch: () => void, falseBranch: () => void): void {
    const TRUE_SOURCE_INDEX = 0
    const FALSE_SOURCE_INDEX = 1

    const conditionObj = parseValue(condition, 'bool')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'double_branch',
      args: [conditionObj]
    })

    const t = this.registry.withExecBranch(ref.id, TRUE_SOURCE_INDEX, () =>
      globalThis.gsts.ctx.withCtx('server_if', trueBranch)
    )
    const f = this.registry.withExecBranch(ref.id, FALSE_SOURCE_INDEX, () =>
      globalThis.gsts.ctx.withCtx('server_if', falseBranch)
    )

    // 启用 join：未 return 的分支尾部连到后续；空分支从分支节点输出直接连出
    const joinEndpoints: Array<{ nodeId: number; sourceIndex?: number }> = []
    ;[
      { sourceIndex: TRUE_SOURCE_INDEX, ...t },
      { sourceIndex: FALSE_SOURCE_INDEX, ...f }
    ].forEach((r) => {
      if (r.terminatedByReturn) return
      if (r.tailEndpoints.length) joinEndpoints.push(...r.tailEndpoints)
      else joinEndpoints.push({ nodeId: ref.id, sourceIndex: r.sourceIndex })
    })
    this.registry.setCurrentExecTailEndpoints(joinEndpoints)
  }

  // === AUTO-GENERATED START ===

  /**
   * Outputs a string to the log, generally used for logic checks and debugging; In the log, this string prints whenever the logic runs successfully, regardless of whether this Node Graph is toggled
   *
   * 打印字符串: 可以在日志中输出一条字符串，一般用于逻辑检测和调试; 在日志中，无论是否勾选了该节点图，逻辑成功运行时该字符串都会打印
   *
   * @param string The string to be printed
   *
   * 字符串: 所要打印的字符串
   */
  printString(string: StrValue): void {
    const stringObj = parseValue(string, 'str')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'print_string',
      args: [stringObj]
    })
  }

  /**
   * Forwards the source event of this Node's Execution Flow to the specified Target Entity. The event with the same name on the Target Entity's Node Graph will be triggered
   *
   * 转发事件: 向指定目标实体转发此节点所在的执行流的源头事件。被转发的目标实体上的节点图上的同名事件会被触发
   *
   * @param targetEntity Target entity being forwarded
   *
   * 目标实体: 被转发的目标实体
   */
  forwardingEvent(targetEntity: EntityValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'forwarding_event',
      args: [targetEntityObj]
    })
  }

  /**
   * Insert a value at the specified ID Location in the specified List. The inserted value appears at that ID after insertion; For example: Inserting 5 at ID 2 in the List [1, 2, 3, 4] results in [1, 2, 5, 3, 4] (5 appears at ID 2)
   *
   * 对列表插入值: 向指定列表的指定序号位置插入值。被插入的值在插入后会出现在列表的插入序号位置; 例如：向列表[1，2，3，4]的序号2插入值5，插入后的列表为[1，2，5，3，4]（5出现在序号2的位置）
   *
   * @param list Reference to the list being inserted
   *
   * 列表: 被插入的列表引用
   * @param insertId ID of the inserted value (after insertion)
   *
   * 插入序号: 插入值在插入后所在的序号
   * @param insertValue Value to be inserted
   *
   * 插入值: 被插入的值
   */
  insertValueIntoList(list: FloatValue[], insertId: IntValue, insertValue: FloatValue): void
  insertValueIntoList(list: IntValue[], insertId: IntValue, insertValue: IntValue): void
  insertValueIntoList(list: BoolValue[], insertId: IntValue, insertValue: BoolValue): void
  insertValueIntoList(list: ConfigIdValue[], insertId: IntValue, insertValue: ConfigIdValue): void
  insertValueIntoList(list: EntityValue[], insertId: IntValue, insertValue: EntityValue): void
  insertValueIntoList(list: FactionValue[], insertId: IntValue, insertValue: FactionValue): void
  insertValueIntoList(list: GuidValue[], insertId: IntValue, insertValue: GuidValue): void
  insertValueIntoList(list: PrefabIdValue[], insertId: IntValue, insertValue: PrefabIdValue): void
  insertValueIntoList(list: StrValue[], insertId: IntValue, insertValue: StrValue): void
  insertValueIntoList(list: Vec3Value[], insertId: IntValue, insertValue: Vec3Value): void
  insertValueIntoList<
    T extends
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
  >(
    list: RuntimeParameterValueTypeMap[T][],
    insertId: IntValue,
    insertValue: RuntimeParameterValueTypeMap[T]
  ): void {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      list,
      insertValue
    )
    const listObj = parseValue(list, `${genericType}_list`)
    const insertIdObj = parseValue(insertId, 'int')
    const insertValueObj = parseValue(insertValue, genericType)
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'insert_value_into_list',
      args: [listObj, insertIdObj, insertValueObj]
    })
  }

  /**
   * Edit the value at the specified ID Location in the specified List
   *
   * 对列表修改值: 修改指定列表的指定序号位置的值
   *
   * @param list Edited list reference
   *
   * 列表: 被修改的列表引用
   * @param id ID of edited value
   *
   * 序号: 修改的值的序号
   * @param value Edited Value
   *
   * 值: 修改的值
   */
  modifyValueInList(list: FloatValue[], id: IntValue, value: FloatValue): void
  modifyValueInList(list: IntValue[], id: IntValue, value: IntValue): void
  modifyValueInList(list: BoolValue[], id: IntValue, value: BoolValue): void
  modifyValueInList(list: ConfigIdValue[], id: IntValue, value: ConfigIdValue): void
  modifyValueInList(list: EntityValue[], id: IntValue, value: EntityValue): void
  modifyValueInList(list: FactionValue[], id: IntValue, value: FactionValue): void
  modifyValueInList(list: GuidValue[], id: IntValue, value: GuidValue): void
  modifyValueInList(list: PrefabIdValue[], id: IntValue, value: PrefabIdValue): void
  modifyValueInList(list: StrValue[], id: IntValue, value: StrValue): void
  modifyValueInList(list: Vec3Value[], id: IntValue, value: Vec3Value): void
  modifyValueInList<
    T extends
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
  >(
    list: RuntimeParameterValueTypeMap[T][],
    id: IntValue,
    value: RuntimeParameterValueTypeMap[T]
  ): void {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      list,
      value
    )
    const listObj = parseValue(list, `${genericType}_list`)
    const idObj = parseValue(id, 'int')
    const valueObj = parseValue(value, genericType)
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_value_in_list',
      args: [listObj, idObj, valueObj]
    })
  }

  /**
   * Remove the value at the specified ID Location from the specified List. All subsequent values shift forward by one position
   *
   * 对列表移除值: 移除指定列表的指定序号位置的值。这会导致该序号后的所有值向前移动一位
   *
   * @param list Reference to the list of values to remove
   *
   * 列表: 被移除值的列表引用
   * @param removeId ID to remove
   *
   * 移除序号: 需要移除的序号
   */
  removeValueFromList(list: FloatValue[], removeId: IntValue): void
  removeValueFromList(list: IntValue[], removeId: IntValue): void
  removeValueFromList(list: BoolValue[], removeId: IntValue): void
  removeValueFromList(list: ConfigIdValue[], removeId: IntValue): void
  removeValueFromList(list: EntityValue[], removeId: IntValue): void
  removeValueFromList(list: FactionValue[], removeId: IntValue): void
  removeValueFromList(list: GuidValue[], removeId: IntValue): void
  removeValueFromList(list: PrefabIdValue[], removeId: IntValue): void
  removeValueFromList(list: StrValue[], removeId: IntValue): void
  removeValueFromList(list: Vec3Value[], removeId: IntValue): void
  removeValueFromList<
    T extends
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
  >(list: RuntimeParameterValueTypeMap[T][], removeId: IntValue): void {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      list
    )
    const listObj = parseValue(list, `${genericType}_list`)
    const removeIdObj = parseValue(removeId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'remove_value_from_list',
      args: [listObj, removeIdObj]
    })
  }

  /**
   * Sort the specified List according to the chosen sort method
   *
   * 列表排序: 将指定列表按照排序方式进行排序
   *
   * @param list Integer List or Floating Point Number List
   *
   * 列表: 整数列表或浮点数列表
   * @param sortBy Ascending or Descending
   *
   * 排序方式: 顺序（从小到大）或逆序（从大到小）排序
   */
  listSorting(list: FloatValue[], sortBy: SortBy): void
  listSorting(list: IntValue[], sortBy: SortBy): void
  listSorting<T extends 'float' | 'int'>(
    list: RuntimeParameterValueTypeMap[T][],
    sortBy: SortBy
  ): void {
    const genericType = matchTypes(['float', 'int'], list)
    const listObj = parseValue(list, `${genericType}_list`)
    const sortByObj = parseValue(sortBy, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'list_sorting',
      args: [listObj, sortByObj]
    })
  }

  /**
   * Append the input List to the end of the Target List. For example, Target List [1, 2, 3] with input [4, 5] becomes [1, 2, 3, 4, 5] after execution
   *
   * 拼接列表: 将接入列表拼接在目标列表后。例如：目标列表为[1,2,3]，接入的列表为[4,5]，在执行该节点后，目标列表会变为[1，2，3，4，5]
   *
   * @param targetList List being input
   *
   * 目标列表: 被接入的列表
   * @param inputList The input list will be added to the end of the Target list
   *
   * 接入的列表: 接入的列表会接在目标列表的尾部
   */
  concatenateList(targetList: FloatValue[], inputList: FloatValue[]): void
  concatenateList(targetList: IntValue[], inputList: IntValue[]): void
  concatenateList(targetList: BoolValue[], inputList: BoolValue[]): void
  concatenateList(targetList: ConfigIdValue[], inputList: ConfigIdValue[]): void
  concatenateList(targetList: EntityValue[], inputList: EntityValue[]): void
  concatenateList(targetList: FactionValue[], inputList: FactionValue[]): void
  concatenateList(targetList: GuidValue[], inputList: GuidValue[]): void
  concatenateList(targetList: PrefabIdValue[], inputList: PrefabIdValue[]): void
  concatenateList(targetList: StrValue[], inputList: StrValue[]): void
  concatenateList(targetList: Vec3Value[], inputList: Vec3Value[]): void
  concatenateList<
    T extends
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
  >(
    targetList: RuntimeParameterValueTypeMap[T][],
    inputList: RuntimeParameterValueTypeMap[T][]
  ): void {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      targetList,
      inputList
    )
    const targetListObj = parseValue(targetList, `${genericType}_list`)
    const inputListObj = parseValue(inputList, `${genericType}_list`)
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'concatenate_list',
      args: [targetListObj, inputListObj]
    })
  }

  /**
   * Clear the specified List
   *
   * 清除列表: 清空指定列表
   *
   * @param list List to be cleared
   *
   * 列表: 所要清除的列表
   */
  clearList(list: FloatValue[]): void
  clearList(list: IntValue[]): void
  clearList(list: BoolValue[]): void
  clearList(list: ConfigIdValue[]): void
  clearList(list: EntityValue[]): void
  clearList(list: FactionValue[]): void
  clearList(list: GuidValue[]): void
  clearList(list: PrefabIdValue[]): void
  clearList(list: StrValue[]): void
  clearList(list: Vec3Value[]): void
  clearList<
    T extends
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
  >(list: RuntimeParameterValueTypeMap[T][]): void {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      list
    )
    const listObj = parseValue(list, `${genericType}_list`)
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'clear_list',
      args: [listObj]
    })
  }

  /**
   * Set the Preset Status of the specified Target Entity
   *
   * 设置预设状态: 设置指定目标实体的预设状态
   *
   * @param targetEntity Preset Status set for the entity
   *
   * 目标实体: 所要设置预设状态的实体
   * @param presetStatusIndex The unique identifier for the Preset Status
   *
   * 预设状态索引: 预设状态的唯一标识
   * @param presetStatusValue Generally "0" for off, "1" for on
   *
   * 预设状态值: 一般“0”为关闭，“1”为开启
   */
  setPresetStatus(
    targetEntity: EntityValue,
    presetStatusIndex: IntValue,
    presetStatusValue: IntValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const presetStatusIndexObj = parseValue(presetStatusIndex, 'int')
    const presetStatusValueObj = parseValue(presetStatusValue, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_preset_status',
      args: [targetEntityObj, presetStatusIndexObj, presetStatusValueObj]
    })
  }

  /**
   * You can set the preset state value for a specified preset state index of a complex creation
   *
   * 设置复杂造物预设状态值: 设置复杂造物指定预设状态索引的值
   *
   * @param targetEntity Only applies to complex creations
   *
   * 目标实体: 仅对复杂造物生效
   * @param presetStatusIndex
   *
   * 预设状态索引
   * @param presetStatusValue
   *
   * 预设状态值
   */
  setThePresetStatusValueOfTheComplexCreation(
    targetEntity: CreationEntity,
    presetStatusIndex: IntValue,
    presetStatusValue: IntValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const presetStatusIndexObj = parseValue(presetStatusIndex, 'int')
    const presetStatusValueObj = parseValue(presetStatusValue, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_the_preset_status_value_of_the_complex_creation',
      args: [targetEntityObj, presetStatusIndexObj, presetStatusValueObj]
    })
  }

  /**
   * Create an Entity by GUID. The Entity must be pre-placed in the Scene
   *
   * 创建实体: 根据GUID创建实体。要求预先将其布设在场景内
   *
   * @param targetGuid Identifier for this entity
   *
   * 目标GUID: 该实体的标识
   * @param unitTagIndexList Determines the Unit Tags carried when this entity is created
   *
   * 单位标签索引列表: 可决定该实体创建时携带的单位标签
   */
  createEntity(targetGuid: GuidValue, unitTagIndexList: IntValue[]): void {
    const targetGuidObj = parseValue(targetGuid, 'guid')
    const unitTagIndexListObj = parseValue(unitTagIndexList, 'int_list')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'create_entity',
      args: [targetGuidObj, unitTagIndexListObj]
    })
  }

  /**
   * Create an Entity by Prefab ID
   *
   * 创建元件: 根据元件ID创建一个实体
   *
   * @param prefabId Identifier for this Prefab
   *
   * 元件ID: 该元件的标识
   * @param location Absolute Location
   *
   * 位置: 绝对位置
   * @param rotate Absolute Rotation
   *
   * 旋转: 绝对旋转
   * @param ownerEntity Determines whether the created entity belongs to another entity
   *
   * 拥有者实体: 可决定该创建后实体是否归属于某个实体
   * @param overwriteLevel When set to False, the [Level] parameter has no effect
   *
   * 是否覆写等级: 为否时，【等级】参数不生效
   * @param level Determines the Level when the entity is created
   *
   * 等级: 决定该实体创建时的等级
   * @param unitTagIndexList Determines the Unit Tags carried when this entity is created
   *
   * 单位标签索引列表: 可决定该实体创建时携带的单位标签
   *
   * @returns Entities created in this way do not have a GUID
   *
   * 创建后实体: 以该方式创建的实体没有GUID
   */
  createPrefab(
    prefabId: PrefabIdValue,
    location: Vec3Value,
    rotate: Vec3Value,
    ownerEntity: EntityValue,
    overwriteLevel: BoolValue,
    level: IntValue,
    unitTagIndexList: IntValue[]
  ): entity {
    const prefabIdObj = parseValue(prefabId, 'prefab_id')
    const locationObj = parseValue(location, 'vec3')
    const rotateObj = parseValue(rotate, 'vec3')
    const ownerEntityObj = parseValue(ownerEntity, 'entity')
    const overwriteLevelObj = parseValue(overwriteLevel, 'bool')
    const levelObj = parseValue(level, 'int')
    const unitTagIndexListObj = parseValue(unitTagIndexList, 'int_list')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'create_prefab',
      args: [
        prefabIdObj,
        locationObj,
        rotateObj,
        ownerEntityObj,
        overwriteLevelObj,
        levelObj,
        unitTagIndexListObj
      ]
    })
    const ret = new entity()
    ret.markPin(ref, 'createdEntity', 0)
    return ret as unknown as entity
  }

  /**
   * Create the Entities contained in the Prefab Group by Prefab Group ID
   *
   * 创建元件组: 根据元件组索引创建该元件组内包含的实体
   *
   * @param prefabGroupId Identifier for this Prefab Group
   *
   * 元件组索引: 该元件组的标识
   * @param location Absolute Location of the Prefab Group center
   *
   * 位置: 元件组中心的绝对位置
   * @param rotate Absolute Rotation of the Prefab Group center
   *
   * 旋转: 元件组中心的绝对旋转
   * @param ownerEntity Determines whether the entity belongs to another entity after creation
   *
   * 归属者实体: 可决定创建后实体是否归属于某个实体
   * @param level Determines the Level when the entity is created
   *
   * 等级: 决定实体创建时的等级
   * @param unitTagIndexList Determines the Unit Tags carried when the entity is created
   *
   * 单位标签索引列表: 可决定实体创建时携带的单位标签
   * @param overwriteLevel When set to False, the [Level] parameter has no effect
   *
   * 是否覆写等级: 为否时，【等级】参数不生效
   *
   * @returns Entities created in this way do not have a GUID
   *
   * 创建后实体列表: 以该方式创建的实体没有GUID
   */
  createPrefabGroup(
    prefabGroupId: IntValue,
    location: Vec3Value,
    rotate: Vec3Value,
    ownerEntity: EntityValue,
    level: IntValue,
    unitTagIndexList: IntValue[],
    overwriteLevel: BoolValue
  ): entity[] {
    const prefabGroupIdObj = parseValue(prefabGroupId, 'int')
    const locationObj = parseValue(location, 'vec3')
    const rotateObj = parseValue(rotate, 'vec3')
    const ownerEntityObj = parseValue(ownerEntity, 'entity')
    const levelObj = parseValue(level, 'int')
    const unitTagIndexListObj = parseValue(unitTagIndexList, 'int_list')
    const overwriteLevelObj = parseValue(overwriteLevel, 'bool')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'create_prefab_group',
      args: [
        prefabGroupIdObj,
        locationObj,
        rotateObj,
        ownerEntityObj,
        levelObj,
        unitTagIndexListObj,
        overwriteLevelObj
      ]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'createdEntityList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Edit the Entity's Model Visibility attribute to make its Model visible or hidden
   *
   * 激活/关闭模型显示: 更改实体的模型可见性属性设置，从而使实体的模型可见/不可见
   *
   * @param targetEntity The entity to be edited
   *
   * 目标实体: 所要修改的实体
   * @param activate Set to True to make the model visible
   *
   * 是否激活: “是”为使模型可见
   */
  activateDisableModelDisplay(targetEntity: EntityValue, activate: BoolValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const activateObj = parseValue(activate, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_disable_model_display',
      args: [targetEntityObj, activateObj]
    })
  }

  /**
   * Destroy the specified Entity with a destruction effect. This can trigger logic that runs only after destruction, such as end-of-lifecycle behaviors for Local Projectiles; The [When Entity Is Destroyed] and [When Entity Is Removed/Destroyed] events can be monitored on Stage Entities
   *
   * 销毁实体: 销毁指定实体，会有销毁表现，也可以触发一些销毁后才会触发的逻辑，比如本地投射物中的生命周期结束时行为; 在关卡实体上可以监听到【实体销毁时】以及【实体移除/销毁时】事件
   *
   * @param targetEntity The entity to be destroyed
   *
   * 目标实体: 所要销毁的实体
   */
  destroyEntity(targetEntity: EntityValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'destroy_entity',
      args: [targetEntityObj]
    })
  }

  /**
   * Remove the specified Entity. Unlike destroying an Entity, this has no destruction effect and does not trigger logic that runs only after destruction; Removing an Entity does not trigger the [On Entity Destroyed] event, but it can trigger the [On Entity Removed/Destroyed] event
   *
   * 移除实体: 移除指定实体，与销毁实体不同的是，不会有销毁表现，也不会触发销毁后才会触发的逻辑; 移除实体不会触发【实体销毁时】事件，但可以触发【实体移除/销毁时】事件
   *
   * @param targetEntity The entity to be removed
   *
   * 目标实体: 所要移除的实体
   */
  removeEntity(targetEntity: EntityValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'remove_entity',
      args: [targetEntityObj]
    })
  }

  /**
   * Triggers the Stage Settlement process, which executes out-of-stage logic as defined in Stage Settlement
   *
   * 结算关卡: 触发关卡结算流程，会按照关卡结算内的逻辑进行局外的逻辑结算
   */
  settleStage(): void {
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'settle_stage',
      args: []
    })
  }

  /**
   * Instantly switch Environment Time to the specified hour. The parameter must be a Floating Point Number between 0 and 24; If the target hour is earlier than the current hour, it is treated as the next day (+1 day)
   *
   * 设置当前环境时间: 立即切换环境时间到指定小时，参数需要是0~24之间的浮点数值; 若目标小时数小于当前时间，视为天数+1
   *
   * @param environmentTime Must be a floating point value between 0–24; this Node will not take effect if the value is outside this range
   *
   * 环境时间: 需要是0~24浮点数值，超出范围外时节点不生效
   */
  setCurrentEnvironmentTime(environmentTime: FloatValue): void {
    const environmentTimeObj = parseValue(environmentTime, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_current_environment_time',
      args: [environmentTimeObj]
    })
  }

  /**
   * Minutes elapsed per second, limited to 0 - 60 (Teyvat speed is 1)
   *
   * 设置环境时间流逝速度: 每秒流逝分钟数，会被限制在0~60之间（提瓦特速度为1）
   *
   * @param environmentTimePassageSpeed Clamped to the range 0–60. Values outside this range are automatically set to 0 or 60
   *
   * 环境时间流逝速度: 会被限制在0~60之间，超出范围外时会按0或60生效
   */
  setEnvironmentTimePassageSpeed(environmentTimePassageSpeed: FloatValue): void {
    const environmentTimePassageSpeedObj = parseValue(environmentTimePassageSpeed, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_environment_time_passage_speed',
      args: [environmentTimePassageSpeedObj]
    })
  }

  /**
   * Edit the Faction of the specified Target Entity
   *
   * 修改实体阵营: 修改指定目标实体的阵营
   *
   * @param targetEntity Entity whose faction is to be edited
   *
   * 目标实体: 所要修改阵营的实体
   * @param faction Edited Faction
   *
   * 阵营: 修改后的阵营
   */
  modifyEntityFaction(targetEntity: EntityValue, faction: FactionValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const factionObj = parseValue(faction, 'faction')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_entity_faction',
      args: [targetEntityObj, factionObj]
    })
  }

  /**
   * Teleport the specified Player Entity. A loading interface may appear depending on teleport distance
   *
   * 传送玩家: 传送指定玩家实体。会根据传送距离的远近决定是否有加载界面
   *
   * GSTS Note: There is an internal cd, and it cannot be used for frequent coordinate movement
   *
   * GSTS 注: 有内置cd, 不可用于高频设置坐标移动
   *
   * @param playerEntity Active Player
   *
   * 玩家实体: 生效的玩家
   * @param targetLocation Absolute Location
   *
   * 目标位置: 绝对位置
   * @param targetRotation Absolute Rotation
   *
   * 目标旋转: 绝对旋转
   */
  teleportPlayer(
    playerEntity: PlayerEntity,
    targetLocation: Vec3Value,
    targetRotation: Vec3Value
  ): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const targetLocationObj = parseValue(targetLocation, 'vec3')
    const targetRotationObj = parseValue(targetRotation, 'vec3')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'teleport_player',
      args: [playerEntityObj, targetLocationObj, targetRotationObj]
    })
  }

  /**
   * Revive the specified Character Entity
   *
   * 复苏角色: 复苏指定的角色实体
   *
   * @param characterEntity The Character Entity to be revived
   *
   * 角色实体: 会被复苏的角色实体
   */
  reviveCharacter(characterEntity: CharacterEntity): void {
    const characterEntityObj = parseValue(characterEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'revive_character',
      args: [characterEntityObj]
    })
  }

  /**
   * Revive all Character Entities of the specified player. In Beyond Mode, since each player has only one character, this is equivalent to [Revive Character]
   *
   * 复苏玩家所有角色: 复苏指定玩家的所有角色实体。在超限模式中，由于每个玩家只有一个角色，与【复苏角色】的效果相同
   *
   * @param playerEntity The Player Entity that owns the Character
   *
   * 玩家实体: 角色归属的玩家实体
   * @param deductRevives If set to False, the Revive Count will not be deducted
   *
   * 是否扣除复苏次数: 为否时，不会扣除复苏次数
   */
  reviveAllPlayerSCharacters(playerEntity: PlayerEntity, deductRevives: BoolValue): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const deductRevivesObj = parseValue(deductRevives, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'revive_all_player_s_characters',
      args: [playerEntityObj, deductRevivesObj]
    })
  }

  /**
   * Knock down all characters of the specified player, causing the player to enter When All Player's Characters Are Down state.
   *
   * 击倒玩家所有角色: 击倒指定玩家的所有角色，会导致该玩家进入玩家所有角色倒下状态
   *
   * @param playerEntity The Player Entity that owns the Character
   *
   * 玩家实体: 角色归属的玩家实体
   */
  defeatAllPlayerSCharacters(playerEntity: PlayerEntity): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'defeat_all_player_s_characters',
      args: [playerEntityObj]
    })
  }

  /**
   * Activate the specified Revive Point ID for the player. When the player later triggers Revive logic, they can revive at this Revive Point
   *
   * 激活复苏点: 为该玩家激活指定序号的复苏点，此玩家后续触发复苏逻辑时，可以从该复苏点复苏
   *
   * @param playerEntity Active Player
   *
   * 玩家实体: 生效的玩家
   * @param revivePointId Identifier for this Revive Point
   *
   * 复苏点序号: 该复苏点的标识
   */
  activateRevivePoint(playerEntity: PlayerEntity, revivePointId: IntValue): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const revivePointIdObj = parseValue(revivePointId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_revive_point',
      args: [playerEntityObj, revivePointIdObj]
    })
  }

  /**
   * Set the duration for the Player's next revive. If the Player is currently reviving, this does not affect the ongoing revive process
   *
   * 设置玩家复苏耗时: 设置指定玩家的下一次复苏的时长。如果玩家当前正处于复苏中，不会影响该次复苏的耗时
   *
   * @param playerEntity Active Player
   *
   * 玩家实体: 生效的玩家
   * @param duration Unit in seconds
   *
   * 时长: 单位为秒
   */
  setPlayerReviveTime(playerEntity: PlayerEntity, duration: IntValue): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const durationObj = parseValue(duration, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_player_revive_time',
      args: [playerEntityObj, durationObj]
    })
  }

  /**
   * Set the remaining number of revives for the specified Player. When set to 0, the Player cannot revive
   *
   * 设置玩家剩余复苏次数: 设置指定玩家剩余复苏次数。设置为0时，该玩家无法复苏
   *
   * @param playerEntity Active Player
   *
   * 玩家实体: 生效的玩家
   * @param remainingTimes When set to 0, the player will not be revived
   *
   * 剩余次数: 设置为0时，该玩家无法复苏
   */
  setPlayerRemainingRevives(playerEntity: PlayerEntity, remainingTimes: IntValue): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const remainingTimesObj = parseValue(remainingTimes, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_player_remaining_revives',
      args: [playerEntityObj, remainingTimesObj]
    })
  }

  /**
   * Apply the specified Environment Configuration to the designated player. Takes effect immediately upon execution
   *
   * 修改环境配置: 使指定玩家应用指定的环境配置，运行后会立即生效
   *
   * @param environmentConfigIndex Identifier for this Environment Configuration
   *
   * 环境配置索引: 环境配置的标识
   * @param targetPlayerList Applies only to Players in the specified list
   *
   * 目标玩家列表: 只对指定玩家列表中的玩家生效
   * @param enableWeatherConfig Set to True to enable
   *
   * 是否启用天气配置: “是”为启用
   * @param weatherConfigIndex The Weather Configuration matching this ID will take effect. If the ID does not exist, nothing happens
   *
   * 天气配置序号: 会生效该序号对应的天气配置，不存在该序号则不生效
   */
  modifyEnvironmentSettings(
    environmentConfigIndex: IntValue,
    targetPlayerList: PlayerEntity[],
    enableWeatherConfig: BoolValue,
    weatherConfigIndex: IntValue
  ): void {
    const environmentConfigIndexObj = parseValue(environmentConfigIndex, 'int')
    const targetPlayerListObj = parseValue(targetPlayerList, 'entity_list')
    const enableWeatherConfigObj = parseValue(enableWeatherConfig, 'bool')
    const weatherConfigIndexObj = parseValue(weatherConfigIndex, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_environment_settings',
      args: [
        environmentConfigIndexObj,
        targetPlayerListObj,
        enableWeatherConfigObj,
        weatherConfigIndexObj
      ]
    })
  }

  /**
   * Set whether the specified player is allowed to revive
   *
   * 允许/禁止玩家复苏: 设置指定玩家是否允许复苏
   *
   * @param playerEntity Active Player
   *
   * 玩家实体: 生效的玩家
   * @param allow If set to True, reviving is allowed
   *
   * 是否允许: “是”则允许复苏
   */
  allowForbidPlayerToRevive(playerEntity: PlayerEntity, allow: BoolValue): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const allowObj = parseValue(allow, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'allow_forbid_player_to_revive',
      args: [playerEntityObj, allowObj]
    })
  }

  /**
   * Unregister the specified Revive Point ID for the player. The layer will not revive at this Revive Point next time
   *
   * 注销复苏点: 为该玩家注销指定序号的复苏点。该玩家下次复苏时不会从该复苏点复苏
   *
   * @param playerEntity Active Player
   *
   * 玩家实体: 生效的玩家
   * @param revivePointId Identifier for this Revive Point
   *
   * 复苏点序号: 该复苏点的标识
   */
  deactivateRevivePoint(playerEntity: PlayerEntity, revivePointId: IntValue): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const revivePointIdObj = parseValue(revivePointId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'deactivate_revive_point',
      args: [playerEntityObj, revivePointIdObj]
    })
  }

  /**
   * Edit data in the Entity's Extra Collision Component to enable/disable Extra Collision
   *
   * 激活/关闭额外碰撞: 修改实体额外碰撞组件内的数据，使额外碰撞开启/关闭
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param extraCollisionId Identifier for this Extra Collision
   *
   * 额外碰撞序号: 该额外碰撞的标识
   * @param activate Set to True to activate
   *
   * 是否激活: “是”为激活
   */
  activateDisableExtraCollision(
    targetEntity: EntityValue,
    extraCollisionId: IntValue,
    activate: BoolValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const extraCollisionIdObj = parseValue(extraCollisionId, 'int')
    const activateObj = parseValue(activate, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_disable_extra_collision',
      args: [targetEntityObj, extraCollisionIdObj, activateObj]
    })
  }

  /**
   * Edit the Climbability of the Entity's Extra Collision Component
   *
   * 激活/关闭额外碰撞可攀爬性: 修改实体额外碰撞组件的碰撞的可攀爬性
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param extraCollisionId Identifier for this Extra Collision
   *
   * 额外碰撞序号: 该额外碰撞的标识
   * @param activate Set to True to activate
   *
   * 是否激活: “是”为激活
   */
  activateDisableExtraCollisionClimbability(
    targetEntity: EntityValue,
    extraCollisionId: IntValue,
    activate: BoolValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const extraCollisionIdObj = parseValue(extraCollisionId, 'int')
    const activateObj = parseValue(activate, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_disable_extra_collision_climbability',
      args: [targetEntityObj, extraCollisionIdObj, activateObj]
    })
  }

  /**
   * Edit the Entity's Native Collision
   *
   * 激活/关闭原生碰撞: 修改实体自带的碰撞
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param activate Set to True to activate
   *
   * 是否激活: “是”为激活
   */
  activateDisableNativeCollision(targetEntity: EntityValue, activate: BoolValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const activateObj = parseValue(activate, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_disable_native_collision',
      args: [targetEntityObj, activateObj]
    })
  }

  /**
   * Edit the Climbability of the Entity's Native Collision
   *
   * 激活/关闭原生碰撞可攀爬性: 修改实体自带的碰撞的可攀爬性
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param activate Set to True to activate
   *
   * 是否激活: “是”为激活
   */
  activateDisableNativeCollisionClimbability(targetEntity: EntityValue, activate: BoolValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const activateObj = parseValue(activate, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_disable_native_collision_climbability',
      args: [targetEntityObj, activateObj]
    })
  }

  /**
   * Edit the Collision Trigger Component data to Activate/Disable the Trigger at the specified ID
   *
   * 激活/关闭碰撞触发器: 修改碰撞触发器组件的数据，使某一个序号的触发器激活/关闭
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param triggerId Identifier for this Collision Trigger
   *
   * 触发器序号: 该碰撞触发器的标识
   * @param activate Set to True to activate
   *
   * 是否激活: “是”为激活
   */
  activateDisableCollisionTrigger(
    targetEntity: EntityValue,
    triggerId: IntValue,
    activate: BoolValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const triggerIdObj = parseValue(triggerId, 'int')
    const activateObj = parseValue(activate, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_disable_collision_trigger',
      args: [targetEntityObj, triggerIdObj, activateObj]
    })
  }

  /**
   * You can modify whether the pathfinding obstacle component of the target entity, corresponding to the specified
   * index, is active
   *
   * 激活/关闭寻路阻挡: 修改目标实体的寻路阻挡组件中指定序号的激活状态
   *
   * @param targetEntity Only applies to objects
   *
   * 目标实体: 仅对物件生效
   * @param pathfindingObstacleId Identifier for this Pathfinding Obstacle
   *
   * 寻路阻挡序号: 该寻路阻挡的标识
   * @param activate
   *
   * 是否激活
   */
  activateDisablePathfindingObstacle(
    targetEntity: EntityValue,
    pathfindingObstacleId: IntValue,
    activate: BoolValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const pathfindingObstacleIdObj = parseValue(pathfindingObstacleId, 'int')
    const activateObj = parseValue(activate, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_disable_pathfinding_obstacle',
      args: [targetEntityObj, pathfindingObstacleIdObj, activateObj]
    })
  }

  /**
   * You can modify whether the pathfinding obstacle feature of the target entity is activated
   *
   * 激活/关闭寻路阻挡功能: 修改目标实体的寻路阻挡功能是否启用
   *
   * @param targetEntity Only applies to objects
   *
   * 目标实体: 仅对物件生效
   * @param activate
   *
   * 是否激活
   */
  activateDisablePathfindingObstacleFeature(targetEntity: EntityValue, activate: BoolValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const activateObj = parseValue(activate, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_disable_pathfinding_obstacle_feature',
      args: [targetEntityObj, activateObj]
    })
  }

  /**
   * Make the specified Entity initiate an attack. The Entity that uses this node must have the corresponding Ability Unit configured.; There are two usage modes:; When the Ability Unit is [Hitbox Attack], it executes a hitbox attack centered on the Target Entity's Location; When the Ability Unit is [Direct Attack], it directly attacks the Target Entity
   *
   * 发起攻击: 使指定实体发起攻击。使用该节点的实体上需要有对应的能力单元配置。; 分为两种使用方式：; 当能力单元为【攻击盒攻击】时，会以目标实体的位置为基准，打出一次攻击盒攻击; 当能力单元为【直接攻击】时，会直接攻击目标实体
   *
   * @param targetEntity Depending on the Ability Unit, this can be treated either as the reference target for the Hitbox Location or as the attack target
   *
   * 目标实体: 根据能力单元不同，可以视为攻击盒位置的基准目标或攻击对象
   * @param damageCoefficient The coefficient applied to the damage dealt by this attack
   *
   * 伤害系数: 该次攻击造成伤害的系数
   * @param damageIncrement The incremental damage applied by this attack
   *
   * 伤害增量: 该次攻击造成伤害的增量
   * @param locationOffset When using Hitbox Attack, determines the Hitbox offset When using Direct Attack, determines the hit-detection location for the attack and thus where on-hit special effects are created
   *
   * 位置偏移: 使用【攻击盒攻击】时，决定了攻击盒的偏移 使用【直接攻击】时，决定了该次攻击的判定位置，影响受击特效等的创建位置
   * @param rotationOffset When using Hitbox Attack, determines the Hitbox rotation When using Direct Attack, determines the hit-detection location for the attack and thus the rotation used for on-hit effects
   *
   * 旋转偏移: 使用【攻击盒攻击】时，决定了攻击盒的旋转 使用【直接攻击】时，决定了该次攻击的判定位置，影响受击特效等的旋转
   * @param abilityUnit Referenced Ability Unit. Must be configured on the entity associated with this Node Graph
   *
   * 能力单元: 引用的能力单元，需要配置在此节点图所关联的实体上
   * @param overwriteAbilityUnitConfig When set to True, the four parameters — Damage Coefficient, Damage Increment, Location Offset, and Rotation Offset — overwrite parameters of the same name in the Ability Unit. When set to False, the Ability Unit's original configuration is used
   *
   * 是否覆写能力单元配置: 为“是”时，伤害系数、伤害增量、位置偏移、旋转偏移这四个系数会覆写能力单元中的同名配置。为“否”时，则使用能力单元中的配置
   * @param initiatorEntity Determines the Initiator Entity for this attack. Defaults to the Entity associated with this Node Graph. Affects which attacker is identified in events such as On Hit and When Attacked
   *
   * 发起者实体: 决定了该次攻击的发起者实体，默认为该节点图所关联的实体。影响【攻击命中时】、【受到攻击时】等事件中判定的攻击者
   */
  initiateAttack(
    targetEntity: EntityValue,
    damageCoefficient: FloatValue,
    damageIncrement: FloatValue,
    locationOffset: Vec3Value,
    rotationOffset: Vec3Value,
    abilityUnit: StrValue,
    overwriteAbilityUnitConfig: BoolValue,
    initiatorEntity: EntityValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const damageCoefficientObj = parseValue(damageCoefficient, 'float')
    const damageIncrementObj = parseValue(damageIncrement, 'float')
    const locationOffsetObj = parseValue(locationOffset, 'vec3')
    const rotationOffsetObj = parseValue(rotationOffset, 'vec3')
    const abilityUnitObj = parseValue(abilityUnit, 'str')
    const overwriteAbilityUnitConfigObj = parseValue(overwriteAbilityUnitConfig, 'bool')
    const initiatorEntityObj = parseValue(initiatorEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'initiate_attack',
      args: [
        targetEntityObj,
        damageCoefficientObj,
        damageIncrementObj,
        locationOffsetObj,
        rotationOffsetObj,
        abilityUnitObj,
        overwriteAbilityUnitConfigObj,
        initiatorEntityObj
      ]
    })
  }

  /**
   * Restore HP to the specified Target Entity via an Ability Unit
   *
   * 恢复生命: 通过能力单元为指定目标实体恢复生命
   *
   * @param targetEntity Target of HP restoration
   *
   * 目标实体: 恢复生命的目标
   * @param recoveryAmount The amount of HP restored in this healing instance
   *
   * 恢复量: 该次恢复生命的恢复量
   * @param abilityUnit Referenced Ability Unit. Must be configured on the entity associated with this Node Graph
   *
   * 能力单元: 引用的能力单元。需要配置在此节点图所关联的实体上
   * @param overwriteAbilityUnitConfig When set to True, the Recovery Amount overwrites the parameter of the same name in the Ability Unit. When set to False, the Ability Unit's original configuration is used
   *
   * 是否覆写能力单元配置: 为“是”时，恢复量会覆盖能力单元中的同名配置。为“否”时，使用能力单元中的配置
   * @param recoverInitiatorEntity Determines the Initiator Entity of this healing action. Defaults to the Entity associated with this Node Graph. Affects healer identification in events such as When HP Is Recovered and When Initiating HP Recovery
   *
   * 恢复发起者实体: 决定了该次恢复行为的发起者实体，默认为该节点图所关联的实体。影响【被恢复生命值时】、【发起恢复生命值时】等事件中判定的恢复者
   */
  recoverHp(
    targetEntity: EntityValue,
    recoveryAmount: FloatValue,
    abilityUnit: StrValue,
    overwriteAbilityUnitConfig: BoolValue,
    recoverInitiatorEntity: EntityValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const recoveryAmountObj = parseValue(recoveryAmount, 'float')
    const abilityUnitObj = parseValue(abilityUnit, 'str')
    const overwriteAbilityUnitConfigObj = parseValue(overwriteAbilityUnitConfig, 'bool')
    const recoverInitiatorEntityObj = parseValue(recoverInitiatorEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'recover_hp',
      args: [
        targetEntityObj,
        recoveryAmountObj,
        abilityUnitObj,
        overwriteAbilityUnitConfigObj,
        recoverInitiatorEntityObj
      ]
    })
  }

  /**
   * Directly cause the specified target to lose HP. Losing HP is not an attack, so it does not trigger attack-related events
   *
   * 损失生命: 使指定目标直接损失生命。损失生命不是攻击，因此不会触发攻击相关的事件
   *
   * @param targetEntity Target that loses HP
   *
   * 目标实体: 损失生命的目标
   * @param hpLoss The amount of HP lost in this instance
   *
   * 生命损失量: 该次损失生命值的损失量
   * @param lethal If set to False, this HP loss will leave the Target with at least 1 HP remaining
   *
   * 是否致命: 为“否”时，该次损失生命最多使目标生命扣为1点
   * @param canBeBlockedByInvincibility If set to True, and the Target is set to Invincible via Unit Status, HP loss has no effect
   *
   * 是否可被无敌抵挡: 为“是”时，如果目标已经通过单位状态设置为了无敌，则损失生命不生效
   * @param canBeBlockedByLockedHp If set to True, and the Target's HP is locked via Unit Status, HP loss has no effect
   *
   * 是否可被锁定生命值抵挡: 为“是”时，如果目标已经通过单位状态设置为了锁定生命值，则损失生命不生效
   * @param damagePopUpType No Pop-UpNormal Pop-UpCRIT Hit Pop-Up
   *
   * 伤害跳字类型: 无跳字普通跳字暴击跳字
   */
  hpLoss(
    targetEntity: EntityValue,
    hpLoss: FloatValue,
    lethal: BoolValue,
    canBeBlockedByInvincibility: BoolValue,
    canBeBlockedByLockedHp: BoolValue,
    damagePopUpType: DamagePopUpType
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const hpLossObj = parseValue(hpLoss, 'float')
    const lethalObj = parseValue(lethal, 'bool')
    const canBeBlockedByInvincibilityObj = parseValue(canBeBlockedByInvincibility, 'bool')
    const canBeBlockedByLockedHpObj = parseValue(canBeBlockedByLockedHp, 'bool')
    const damagePopUpTypeObj = parseValue(damagePopUpType, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'hp_loss',
      args: [
        targetEntityObj,
        hpLossObj,
        lethalObj,
        canBeBlockedByInvincibilityObj,
        canBeBlockedByLockedHpObj,
        damagePopUpTypeObj
      ]
    })
  }

  /**
   * Directly restore HP to the specified Target Entity. Unlike [Recover HP], this node does not require an Ability Unit
   *
   * 直接恢复生命: 直接恢复指定实体目标的生命。与【恢复生命】不同的是，此节点不需要使用能力单元
   *
   * @param recoverInitiatorEntity The Entity that initiates healing
   *
   * 恢复发起实体: 发起恢复的实体
   * @param recoverTargetEntity The Target Entity to be healed
   *
   * 恢复目标实体: 恢复的目标实体
   * @param recoveryAmount The amount of HP restored in this healing instance
   *
   * 恢复量: 该次恢复生命的恢复量
   * @param ignoreRecoveryAmountAdjustment If set to True, this healing amount is not affected by the Target's Unit Status effects that adjust healing
   *
   * 是否忽略恢复量调整: 为“是”时，该次恢复量不受目标的恢复量调整类的单位状态的影响
   * @param aggroGenerationMultiplier The Aggro generated by this healing, expressed as a multiplier. Only applicable when using Custom Aggro Mode
   *
   * 产生仇恨的倍率: 此次恢复产生的仇恨倍率。仅使用自定义仇恨模式时有意义
   * @param aggroGenerationIncrement The Aggro generated by this healing, expressed as an incremental value. Only applicable when using Custom Aggro Mode
   *
   * 产生仇恨的增量: 此次恢复产生的仇恨增量。仅使用自定义仇恨模式时有意义
   * @param healingTagList The list of tags associated with this healing action. These can be accessed in the When HP Is Recovered and When Initiating HP Recovery events to identify a specific healing action
   *
   * 治疗标签列表: 此次恢复行为的标签列表。在【发起恢复生命值】时以及【被恢复生命值时】事件中可以取出，用于判定一次特定的恢复行为
   */
  recoverHpDirectly(
    recoverInitiatorEntity: EntityValue,
    recoverTargetEntity: EntityValue,
    recoveryAmount: FloatValue,
    ignoreRecoveryAmountAdjustment: BoolValue,
    aggroGenerationMultiplier: FloatValue,
    aggroGenerationIncrement: FloatValue,
    healingTagList: StrValue[]
  ): void {
    const recoverInitiatorEntityObj = parseValue(recoverInitiatorEntity, 'entity')
    const recoverTargetEntityObj = parseValue(recoverTargetEntity, 'entity')
    const recoveryAmountObj = parseValue(recoveryAmount, 'float')
    const ignoreRecoveryAmountAdjustmentObj = parseValue(ignoreRecoveryAmountAdjustment, 'bool')
    const aggroGenerationMultiplierObj = parseValue(aggroGenerationMultiplier, 'float')
    const aggroGenerationIncrementObj = parseValue(aggroGenerationIncrement, 'float')
    const healingTagListObj = parseValue(healingTagList, 'str_list')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'recover_hp_directly',
      args: [
        recoverInitiatorEntityObj,
        recoverTargetEntityObj,
        recoveryAmountObj,
        ignoreRecoveryAmountAdjustmentObj,
        aggroGenerationMultiplierObj,
        aggroGenerationIncrementObj,
        healingTagListObj
      ]
    })
  }

  /**
   * Resume a paused Basic Motion Device on the Target Entity. The Target Entity must have the Basic Motion Device Component
   *
   * 恢复基础运动器: 使目标实体上一个处于暂停状态的基础运动器恢复运动，需要目标实体持有基础运动器组件
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   */
  recoverBasicMotionDevice(targetEntity: EntityValue, motionDeviceName: StrValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const motionDeviceNameObj = parseValue(motionDeviceName, 'str')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'recover_basic_motion_device',
      args: [targetEntityObj, motionDeviceNameObj]
    })
  }

  /**
   * Dynamically add a Fixed-Point Basic Motion Device to the Target Entity during Stage runtime
   *
   * 开启定点运动器: 在关卡运行时为目标实体动态添加一个定点运动型基础运动器
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   * @param movementMode
   *
   * 移动方式
   * @param movementSpd
   *
   * 移动速度
   * @param targetLocation Absolute Location
   *
   * 目标位置: 绝对位置
   * @param targetRotation Absolute Rotation
   *
   * 目标旋转: 绝对旋转
   * @param lockRotation
   *
   * 是否锁定旋转
   * @param parameterType Options: Fixed Speed or Fixed Time
   *
   * 参数类型: 分为固定速度、固定时间
   * @param movementTime
   *
   * 移动时间
   */
  activateFixedPointMotionDevice(
    targetEntity: EntityValue,
    motionDeviceName: StrValue,
    movementMode: MovementMode,
    movementSpd: FloatValue,
    targetLocation: Vec3Value,
    targetRotation: Vec3Value,
    lockRotation: BoolValue,
    parameterType: FixedMotionParameterType,
    movementTime: FloatValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const motionDeviceNameObj = parseValue(motionDeviceName, 'str')
    const movementModeObj = parseValue(movementMode, 'enumeration')
    const movementSpdObj = parseValue(movementSpd, 'float')
    const targetLocationObj = parseValue(targetLocation, 'vec3')
    const targetRotationObj = parseValue(targetRotation, 'vec3')
    const lockRotationObj = parseValue(lockRotation, 'bool')
    const parameterTypeObj = parseValue(parameterType, 'enumeration')
    const movementTimeObj = parseValue(movementTime, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_fixed_point_motion_device',
      args: [
        targetEntityObj,
        motionDeviceNameObj,
        movementModeObj,
        movementSpdObj,
        targetLocationObj,
        targetRotationObj,
        lockRotationObj,
        parameterTypeObj,
        movementTimeObj
      ]
    })
  }

  /**
   * Activate a Basic Motion Device configured within the Target Entity's Basic Motion Device Component
   *
   * 激活基础运动器: 激活一个配置在目标实体基础运动器组件上的运动器
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   */
  activateBasicMotionDevice(targetEntity: EntityValue, motionDeviceName: StrValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const motionDeviceNameObj = parseValue(motionDeviceName, 'str')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_basic_motion_device',
      args: [targetEntityObj, motionDeviceNameObj]
    })
  }

  /**
   * Dynamically add a Basic Motion Device with Target-Oriented Rotation to the Target Entity during Stage runtime
   *
   * 添加朝向目标旋转型基础运动器: 在关卡运行时为目标实体动态添加一个朝向目标旋转型基础运动器
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   * @param motionDeviceDuration The duration for which this motion device remains active
   *
   * 运动器时长: 该运动器生效的时长
   * @param targetAngle Absolute Angle
   *
   * 目标角度: 绝对角度
   */
  addTargetOrientedRotationBasedMotionDevice(
    targetEntity: EntityValue,
    motionDeviceName: StrValue,
    motionDeviceDuration: FloatValue,
    targetAngle: Vec3Value
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const motionDeviceNameObj = parseValue(motionDeviceName, 'str')
    const motionDeviceDurationObj = parseValue(motionDeviceDuration, 'float')
    const targetAngleObj = parseValue(targetAngle, 'vec3')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'add_target_oriented_rotation_based_motion_device',
      args: [targetEntityObj, motionDeviceNameObj, motionDeviceDurationObj, targetAngleObj]
    })
  }

  /**
   * Dynamically add a Basic Motion Device with Uniform Linear Motion at runtime
   *
   * 添加匀速直线型基础运动器: 在运行时动态添加一个匀速直线型基础运动器
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   * @param motionDeviceDuration The duration for which this motion device remains active
   *
   * 运动器时长: 该运动器生效的时长
   * @param velocityVector Determines the magnitude and direction of the velocity
   *
   * 速度向量: 决定了速度大小和方向
   */
  addUniformBasicLinearMotionDevice(
    targetEntity: EntityValue,
    motionDeviceName: StrValue,
    motionDeviceDuration: FloatValue,
    velocityVector: Vec3Value
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const motionDeviceNameObj = parseValue(motionDeviceName, 'str')
    const motionDeviceDurationObj = parseValue(motionDeviceDuration, 'float')
    const velocityVectorObj = parseValue(velocityVector, 'vec3')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'add_uniform_basic_linear_motion_device',
      args: [targetEntityObj, motionDeviceNameObj, motionDeviceDurationObj, velocityVectorObj]
    })
  }

  /**
   * Dynamically add a Basic Motion Device with Uniform Rotation at runtime
   *
   * 添加匀速旋转型基础运动器: 在运行时动态添加一个匀速旋转型基础运动器
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   * @param motionDeviceDuration The duration for which this motion device remains active
   *
   * 运动器时长: 该运动器生效的时长
   * @param angularVelocityS Angular Velocity Magnitude
   *
   * 角速度(角度/秒): 角速度大小
   * @param rotationAxisOrientation Relative Orientation
   *
   * 旋转轴朝向: 相对朝向
   */
  addUniformBasicRotationBasedMotionDevice(
    targetEntity: EntityValue,
    motionDeviceName: StrValue,
    motionDeviceDuration: FloatValue,
    angularVelocityS: FloatValue,
    rotationAxisOrientation: Vec3Value
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const motionDeviceNameObj = parseValue(motionDeviceName, 'str')
    const motionDeviceDurationObj = parseValue(motionDeviceDuration, 'float')
    const angularVelocitySObj = parseValue(angularVelocityS, 'float')
    const rotationAxisOrientationObj = parseValue(rotationAxisOrientation, 'vec3')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'add_uniform_basic_rotation_based_motion_device',
      args: [
        targetEntityObj,
        motionDeviceNameObj,
        motionDeviceDurationObj,
        angularVelocitySObj,
        rotationAxisOrientationObj
      ]
    })
  }

  /**
   * Stop and delete a running Motion Device
   *
   * 停止并删除基础运动器: 停止并删除一个运行中的运动器
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   * @param stopAllBasicMotionDevices If set to True, stops all Basic Motion Devices on this Entity. If set to False, stops only the Motion Device whose name matches the specified Motion Device
   *
   * 是否停止所有基础运动器: “是”则停止该实体上的所有基础运动器，“否”则只停止与运动器名称对应的运动器
   */
  stopAndDeleteBasicMotionDevice(
    targetEntity: EntityValue,
    motionDeviceName: StrValue,
    stopAllBasicMotionDevices: BoolValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const motionDeviceNameObj = parseValue(motionDeviceName, 'str')
    const stopAllBasicMotionDevicesObj = parseValue(stopAllBasicMotionDevices, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'stop_and_delete_basic_motion_device',
      args: [targetEntityObj, motionDeviceNameObj, stopAllBasicMotionDevicesObj]
    })
  }

  /**
   * Pause a running Motion Device. The Resume Motion Device node can then be used to resume it
   *
   * 暂停基础运动器: 暂停一个运行中的运动器，之后可使用恢复运动器节点使其恢复运动
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   */
  pauseBasicMotionDevice(targetEntity: EntityValue, motionDeviceName: StrValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const motionDeviceNameObj = parseValue(motionDeviceName, 'str')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'pause_basic_motion_device',
      args: [targetEntityObj, motionDeviceNameObj]
    })
  }

  /**
   * Enable/Disable the Follow Motion Device logic on the Target Entity
   *
   * 激活/关闭跟随运动器: 使目标实体上的跟随运动器组件逻辑激活/关闭
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param activate Set to True to activate
   *
   * 是否激活: “是”为激活
   */
  activateDisableFollowMotionDevice(targetEntity: EntityValue, activate: BoolValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const activateObj = parseValue(activate, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_disable_follow_motion_device',
      args: [targetEntityObj, activateObj]
    })
  }

  /**
   * Switch the Follow Target of the Follow Motion Device by GUID
   *
   * 以GUID切换跟随运动器的目标: 以GUID切换跟随运动器的跟随目标
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param followTargetGuid Identifier for the Follow Target
   *
   * 跟随目标GUID: 跟随目标的标识
   * @param followTargetAttachmentPointName Name of the Attachment Point to follow
   *
   * 跟随目标挂接点名称: 跟随的挂接点名称
   * @param locationOffset Location Offset based on the Follow Coordinate System
   *
   * 位置偏移: 以【跟随坐标系】为基准产生的位置偏移
   * @param rotationOffset Rotation Offset based on the Follow Coordinate System
   *
   * 旋转偏移: 以【跟随坐标系】为基准产生的旋转偏移
   * @param followCoordinateSystem Options: Relative Coordinate System or World Coordinate System
   *
   * 跟随坐标系: 可选”相对坐标系“、”世界坐标系“
   * @param followType Options: Completely Follow, Follow Location, Follow Rotation
   *
   * 跟随类型: 可选”完全跟随“、”跟随位置“、”跟随旋转”
   */
  switchFollowMotionDeviceTargetByGuid(
    targetEntity: EntityValue,
    followTargetGuid: GuidValue,
    followTargetAttachmentPointName: StrValue,
    locationOffset: Vec3Value,
    rotationOffset: Vec3Value,
    followCoordinateSystem: FollowCoordinateSystem,
    followType: FollowLocationType
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const followTargetGuidObj = parseValue(followTargetGuid, 'guid')
    const followTargetAttachmentPointNameObj = parseValue(followTargetAttachmentPointName, 'str')
    const locationOffsetObj = parseValue(locationOffset, 'vec3')
    const rotationOffsetObj = parseValue(rotationOffset, 'vec3')
    const followCoordinateSystemObj = parseValue(followCoordinateSystem, 'enumeration')
    const followTypeObj = parseValue(followType, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'switch_follow_motion_device_target_by_guid',
      args: [
        targetEntityObj,
        followTargetGuidObj,
        followTargetAttachmentPointNameObj,
        locationOffsetObj,
        rotationOffsetObj,
        followCoordinateSystemObj,
        followTypeObj
      ]
    })
  }

  /**
   * Switch the Follow Target of the Follow Motion Device by Entity
   *
   * 以实体切换跟随运动器的目标: 以实体切换跟随运动器的跟随目标
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param followTargetEntity The Entity that follows the Target
   *
   * 跟随目标实体: 跟随目标的实体
   * @param followTargetAttachmentPointName Name of the Attachment Point to follow
   *
   * 跟随目标挂接点名称: 跟随的挂接点名称
   * @param locationOffset Location Offset based on the Follow Coordinate System
   *
   * 位置偏移: 以【跟随坐标系】为基准产生的位置偏移
   * @param rotationOffset Rotation Offset based on the Follow Coordinate System
   *
   * 旋转偏移: 以【跟随坐标系】为基准产生的旋转偏移
   * @param followCoordinateSystem Options: Relative Coordinate System or World Coordinate System
   *
   * 跟随坐标系: 可选”相对坐标系“、”世界坐标系“
   * @param followType Options: Completely Follow, Follow Location, Follow Rotation
   *
   * 跟随类型: 可选”完全跟随“、”跟随位置“、”跟随旋转”
   */
  switchFollowMotionDeviceTargetByEntity(
    targetEntity: EntityValue,
    followTargetEntity: EntityValue,
    followTargetAttachmentPointName: StrValue,
    locationOffset: Vec3Value,
    rotationOffset: Vec3Value,
    followCoordinateSystem: FollowCoordinateSystem,
    followType: FollowLocationType
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const followTargetEntityObj = parseValue(followTargetEntity, 'entity')
    const followTargetAttachmentPointNameObj = parseValue(followTargetAttachmentPointName, 'str')
    const locationOffsetObj = parseValue(locationOffset, 'vec3')
    const rotationOffsetObj = parseValue(rotationOffset, 'vec3')
    const followCoordinateSystemObj = parseValue(followCoordinateSystem, 'enumeration')
    const followTypeObj = parseValue(followType, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'switch_follow_motion_device_target_by_entity',
      args: [
        targetEntityObj,
        followTargetEntityObj,
        followTargetAttachmentPointNameObj,
        locationOffsetObj,
        rotationOffsetObj,
        followCoordinateSystemObj,
        followTypeObj
      ]
    })
  }

  /**
   * Create a Projectile Entity using the Prefab ID. This function is similar to [Create Prefab], but includes an additional [Track Target] parameter, which sets the tracking target for projectiles of the Tracking type in the Projectile Motion Device Component of the created Entity
   *
   * 创建投射物: 根据元件ID创建一个投射物实体。与【创建元件】功能类似，但多一个【追踪目标】参数，可以为创建的投射物实体的投射运动器组件中追踪投射类型设置追踪目标
   *
   * @param prefabId Identifier for this Projectile Prefab
   *
   * 元件ID: 该投射物元件的标识
   * @param location Absolute Location
   *
   * 位置: 绝对位置
   * @param rotate Absolute Rotation
   *
   * 旋转: 绝对旋转
   * @param ownerEntity Determines whether the created entity belongs to another entity
   *
   * 拥有者实体: 可决定该创建后实体是否归属于某个实体
   * @param trackTarget The Tracking Target set by the Tracking Projectile type in the Projectile Motion Device component
   *
   * 追踪目标: 投射运动器组件中追踪投射类型设置的追踪目标
   * @param overwriteLevel When set to False, the [Level] parameter has no effect
   *
   * 是否覆写等级: 为否时，【等级】参数不生效
   * @param level Determines the Level when the entity is created
   *
   * 等级: 决定该实体创建时的等级
   * @param unitTagIndexList Determines the Unit Tags carried when this entity is created
   *
   * 单位标签索引列表: 可决定该实体创建时携带的单位标签
   *
   * @returns This Entity inherits the attributes of the Projectile Prefab
   *
   * 创建出的实体: 该实体继承该投射物元件的属性
   */
  createProjectile(
    prefabId: PrefabIdValue,
    location: Vec3Value,
    rotate: Vec3Value,
    ownerEntity: EntityValue,
    trackTarget: EntityValue,
    overwriteLevel: BoolValue,
    level: IntValue,
    unitTagIndexList: IntValue[]
  ): entity {
    const prefabIdObj = parseValue(prefabId, 'prefab_id')
    const locationObj = parseValue(location, 'vec3')
    const rotateObj = parseValue(rotate, 'vec3')
    const ownerEntityObj = parseValue(ownerEntity, 'entity')
    const trackTargetObj = parseValue(trackTarget, 'entity')
    const overwriteLevelObj = parseValue(overwriteLevel, 'bool')
    const levelObj = parseValue(level, 'int')
    const unitTagIndexListObj = parseValue(unitTagIndexList, 'int_list')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'create_projectile',
      args: [
        prefabIdObj,
        locationObj,
        rotateObj,
        ownerEntityObj,
        trackTargetObj,
        overwriteLevelObj,
        levelObj,
        unitTagIndexListObj
      ]
    })
    const ret = new entity()
    ret.markPin(ref, 'createdEntity', 0)
    return ret as unknown as entity
  }

  /**
   * Play a Timed Effect relative to the Target Entity. A valid Target Entity and Attachment Point are required
   *
   * 播放限时特效: 以目标实体为基准，播放一个限时特效。需要有合法的目标实体以及挂接点
   *
   * @param specialEffectsAsset Identifier for this Effect
   *
   * 特效资产: 该特效的标识
   * @param targetEntity If the Entity does not exist, the Effect will not play
   *
   * 目标实体: 实体不存在会导致特效无法播放
   * @param attachmentPointName If the Attachment Point Name does not exist, the Special Effect will not play
   *
   * 挂接点名称: 挂接点名称不存在会导致特效无法播放
   * @param moveWithTheTarget If set to True, follows the Target Entity's Motion
   *
   * 是否跟随目标运动: “是”会跟随目标实体运动
   * @param rotateWithTheTarget If set to True, follows the Target Entity's Rotation
   *
   * 是否跟随目标旋转: “是”会跟随目标实体旋转
   * @param locationOffset Location Offset relative to the Target Entity's specified Attachment Point
   *
   * 位置偏移: 相对于目标实体指定挂接点的位置偏移
   * @param rotationOffset Rotation offset relative to the Target Entity's specified Attachment Point
   *
   * 旋转偏移: 相对于目标实体指定挂接点的旋转偏移
   * @param zoomMultiplier The Zoom Multiplier of this Effect
   *
   * 缩放倍率: 该特效的缩放倍率
   * @param playBuiltInSoundEffect If set to True, plays the built-in Sound Effect as well
   *
   * 是否播放自带的音效: “是”则会同时播放自带的音效
   */
  playTimedEffects(
    specialEffectsAsset: ConfigIdValue,
    targetEntity: EntityValue,
    attachmentPointName: StrValue,
    moveWithTheTarget: BoolValue,
    rotateWithTheTarget: BoolValue,
    locationOffset: Vec3Value,
    rotationOffset: Vec3Value,
    zoomMultiplier: FloatValue,
    playBuiltInSoundEffect: BoolValue
  ): void {
    const specialEffectsAssetObj = parseValue(specialEffectsAsset, 'config_id')
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const attachmentPointNameObj = parseValue(attachmentPointName, 'str')
    const moveWithTheTargetObj = parseValue(moveWithTheTarget, 'bool')
    const rotateWithTheTargetObj = parseValue(rotateWithTheTarget, 'bool')
    const locationOffsetObj = parseValue(locationOffset, 'vec3')
    const rotationOffsetObj = parseValue(rotationOffset, 'vec3')
    const zoomMultiplierObj = parseValue(zoomMultiplier, 'float')
    const playBuiltInSoundEffectObj = parseValue(playBuiltInSoundEffect, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'play_timed_effects',
      args: [
        specialEffectsAssetObj,
        targetEntityObj,
        attachmentPointNameObj,
        moveWithTheTargetObj,
        rotateWithTheTargetObj,
        locationOffsetObj,
        rotationOffsetObj,
        zoomMultiplierObj,
        playBuiltInSoundEffectObj
      ]
    })
  }

  /**
   * Clear all Effects on the specified Target Entity that use the given Effect Asset. Applies to Looping Effects only
   *
   * 根据特效资产清除特效: 清除指定目标实体上所有使用该特效资产的特效。仅限循环特效
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param specialEffectsAsset Identifier for this Effect
   *
   * 特效资产: 该特效的标识
   */
  clearSpecialEffectsBasedOnSpecialEffectAssets(
    targetEntity: EntityValue,
    specialEffectsAsset: ConfigIdValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const specialEffectsAssetObj = parseValue(specialEffectsAsset, 'config_id')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'clear_special_effects_based_on_special_effect_assets',
      args: [targetEntityObj, specialEffectsAssetObj]
    })
  }

  /**
   * Mount a Looping Effect relative to the Target Entity. A valid Target Entity and Attachment Point are required; This node returns an Effect Instance ID that can be stored. When using the [Clear Looping Effects] node later, use this Effect Instance ID to clear the specified Looping Effect
   *
   * 挂载循环特效: 以目标实体为基准，挂载一个循环特效。需要有合法的目标实体以及挂接点; 该节点会返回一个特效实例ID，可以将其存下。后续使用【清除循环特效】节点时，用这个特效实例ID来清除指定的循环特效
   *
   * @param specialEffectsAsset Identifier for this Effect
   *
   * 特效资产: 该特效的标识
   * @param targetEntity If the Entity does not exist, the Effect will not play
   *
   * 目标实体: 实体不存在会导致特效无法播放
   * @param attachmentPointName If the Attachment Point Name does not exist, the Special Effect will not play
   *
   * 挂接点名称: 挂接点名称不存在会导致特效无法播放
   * @param moveWithTheTarget If set to True, follows the Target Entity's Motion
   *
   * 是否跟随目标运动: “是”会跟随目标实体运动
   * @param rotateWithTheTarget If set to True, follows the Target Entity's Rotation
   *
   * 是否跟随目标旋转: “是”会跟随目标实体旋转
   * @param locationOffset Location Offset relative to the Target Entity's specified Attachment Point
   *
   * 位置偏移: 相对于目标实体指定挂接点的位置偏移
   * @param rotationOffset Rotation offset relative to the Target Entity's specified Attachment Point
   *
   * 旋转偏移: 相对于目标实体指定挂接点的旋转偏移
   * @param zoomMultiplier The Zoom Multiplier of this Effect
   *
   * 缩放倍率: 该特效的缩放倍率
   *
   * @param playBuiltInSoundEffect If set to True, plays the built-in Sound Effect as well
   *
   * 是否播放自带的音效: “是”则会同时播放自带的音效
   * @returns The Instance ID automatically generated when mounting this Effect
   *
   * 特效实例ID: 挂载该特效时自动生成的实例ID
   */
  mountLoopingSpecialEffect(
    specialEffectsAsset: ConfigIdValue,
    targetEntity: EntityValue,
    attachmentPointName: StrValue,
    moveWithTheTarget: BoolValue,
    rotateWithTheTarget: BoolValue,
    locationOffset: Vec3Value,
    rotationOffset: Vec3Value,
    zoomMultiplier: FloatValue,
    playBuiltInSoundEffect: BoolValue
  ): bigint {
    const specialEffectsAssetObj = parseValue(specialEffectsAsset, 'config_id')
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const attachmentPointNameObj = parseValue(attachmentPointName, 'str')
    const moveWithTheTargetObj = parseValue(moveWithTheTarget, 'bool')
    const rotateWithTheTargetObj = parseValue(rotateWithTheTarget, 'bool')
    const locationOffsetObj = parseValue(locationOffset, 'vec3')
    const rotationOffsetObj = parseValue(rotationOffset, 'vec3')
    const zoomMultiplierObj = parseValue(zoomMultiplier, 'float')
    const playBuiltInSoundEffectObj = parseValue(playBuiltInSoundEffect, 'bool')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'mount_looping_special_effect',
      args: [
        specialEffectsAssetObj,
        targetEntityObj,
        attachmentPointNameObj,
        moveWithTheTargetObj,
        rotateWithTheTargetObj,
        locationOffsetObj,
        rotationOffsetObj,
        zoomMultiplierObj,
        playBuiltInSoundEffectObj
      ]
    })
    const ret = new int()
    ret.markPin(ref, 'specialEffectInstanceId', 0)
    return ret as unknown as bigint
  }

  /**
   * Clear the specified Looping Effect on the Target Entity by Effect Instance ID. After a successful mount, the [Mount Looping Effect] node generates an Effect Instance ID
   *
   * 清除循环特效: 根据特效实例ID清除目标实体上的指定循环特效。【挂载循环特效】节点在成功挂载后，会生成一个特效实例ID
   *
   * @param specialEffectInstanceId Instance ID automatically generated by the Mount Looping Special Effect node
   *
   * 特效实例ID: 【挂载循环特效】节点中自动生成的实例ID
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   */
  clearLoopingSpecialEffect(specialEffectInstanceId: IntValue, targetEntity: EntityValue): void {
    const specialEffectInstanceIdObj = parseValue(specialEffectInstanceId, 'int')
    const targetEntityObj = parseValue(targetEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'clear_looping_special_effect',
      args: [specialEffectInstanceIdObj, targetEntityObj]
    })
  }

  /**
   * Resume a paused Timer on the Target Entity
   *
   * 恢复定时器: 使目标实体上一个处于暂停状态的定时器恢复运行
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param timerName Timer Identifier
   *
   * 定时器名称: 该定时器的标识
   */
  resumeTimer(targetEntity: EntityValue, timerName: StrValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const timerNameObj = parseValue(timerName, 'str')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'resume_timer',
      args: [targetEntityObj, timerNameObj]
    })
  }

  /**
   * Start a Timer on the Target Entity; The Timer is uniquely identified by its name; A Timer consists of a looping or non-looping Timer Sequence. The Timer Sequence is a set of time points in seconds arranged in ascending order; when the Timer reaches these points, it triggers the [On Timer Triggered] event. The maximum length of a Timer Sequence is 100; For example, if you input the Timer Sequence [1, 3, 5, 7], the [On Timer Triggered] event fires at 1s, 3s, 5s, and 7s; When Loop is set to "Yes," the Timer restarts from 0s after reaching the last time point. For [1, 3, 5, 7], it restarts from 0s after reaching 7s
   *
   * 启动定时器: 在目标实体上启动一个定时器; 定时器通过定时器名称进行唯一标识; 定时器由一个循环或不循环的定时器序列组成。定时器序列应是一组从小到大排列的，以秒为单位的时间点，在定时器运行到这些时间点时，会触发【定时器触发时】事件。该定时器序列最大限制为100; 例如：[1,3,5,7]，如果传入这样的定时器序列，那么分别在第1、3、5、7秒，会触发【定时器触发时】事件; 当是否循环为“是”时，在定时器到达最后一个时间点后，会从0秒开始进行循环计时。以[1,3,5,7]这样的定时器为例，则在运行到7秒后，再从0秒开始计时
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param timerName Timer Identifier
   *
   * 定时器名称: 该定时器的标识
   * @param loop If set to True, the Timer Sequence executes in a loop
   *
   * 是否循环: “是”则会循环执行定时器序列
   * @param timerSequence Provide a list sorted in ascending order. If the list is invalid (not strictly ascending, contains negatives, etc.), the Timer will not run
   *
   * 定时器序列: 需要传入一个从小到大排列的列表。如果传入的列表不合法（不是严格按照从小到大排列、存在负数等），定时器不会运行
   */
  startTimer(
    targetEntity: EntityValue,
    timerName: StrValue,
    loop: BoolValue,
    timerSequence: FloatValue[]
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const timerNameObj = parseValue(timerName, 'str')
    const loopObj = parseValue(loop, 'bool')
    const timerSequenceObj = parseValue(timerSequence, 'float_list')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'start_timer',
      args: [targetEntityObj, timerNameObj, loopObj, timerSequenceObj]
    })
  }

  /**
   * Pauses the specified Timer on the Target Entity. The [Resume Timer] node can then be used to resume its countdown
   *
   * 暂停定时器: 暂停指定目标实体上的指定定时器。之后可以使用【恢复定时器】节点恢复该定时器的计时
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param timerName Timer Identifier
   *
   * 定时器名称: 该定时器的标识
   */
  pauseTimer(targetEntity: EntityValue, timerName: StrValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const timerNameObj = parseValue(timerName, 'str')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'pause_timer',
      args: [targetEntityObj, timerNameObj]
    })
  }

  /**
   * Completely terminate the specified Timer on the Target Entity; it cannot be resumed
   *
   * 终止定时器: 完全终止目标实体上的指定定时器，不可恢复
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param timerName Timer Identifier
   *
   * 定时器名称: 该定时器的标识
   */
  stopTimer(targetEntity: EntityValue, timerName: StrValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const timerNameObj = parseValue(timerName, 'str')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'stop_timer',
      args: [targetEntityObj, timerNameObj]
    })
  }

  /**
   * Resume a paused Global Timer on the Target Entity
   *
   * 恢复全局计时器: 使目标实体上一个处于暂停状态的计时器恢复运行
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param timerName Identifier for the Timer. Only Timer Names configured in Timer Management can be referenced
   *
   * 计时器名称: 该计时器的标识，只能引用在计时器管理中已经配置好的计时器名称
   */
  recoverGlobalTimer(targetEntity: EntityValue, timerName: StrValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const timerNameObj = parseValue(timerName, 'str')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'recover_global_timer',
      args: [targetEntityObj, timerNameObj]
    })
  }

  /**
   * Start a Global Timer on the Target Entity; The Timer on the Target Entity is uniquely identified by its name; Based on Timer Management settings, Countdown and Stopwatch Timers are created accordingly
   *
   * 启动全局计时器: 在目标实体上启动一个全局计时器; 目标实体上的计时器，通过计时器名称进行唯一标识; 计时器根据计时器管理中的配置，会对应创生倒计时、正计时的计时器
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param timerName Identifier for the Timer. Only Timer Names configured in Timer Management can be referenced
   *
   * 计时器名称: 该计时器的标识，只能引用在计时器管理中已经配置好的计时器名称
   */
  startGlobalTimer(targetEntity: EntityValue, timerName: StrValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const timerNameObj = parseValue(timerName, 'str')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'start_global_timer',
      args: [targetEntityObj, timerNameObj]
    })
  }

  /**
   * Adjust the time of a running Global Timer via the Node Graph; If the timer is paused first and then modified to reduce the time, the modified time will be at least 0 seconds.; For countdown timers, pausing followed by modifying the time to 0s will trigger the [When the Global Timer Is Triggered] event upon resuming the timer.; If the timer is paused first, then modified to 0s, followed by modifying the time to increase it, and finally resumed, the [When the Global Timer Is Triggered] event will not be triggered.
   *
   * 修改全局计时器: 通过节点图，可以将运行中的全局计时器时间进行调整; 若计时器先暂停，后修改减少时间，则修改后时间最少为0s; 若为倒计时，则暂停后修改时间为0s且恢复计时器后，会触发【全局计时器触发时】事件; 若计时器先暂停，后修改时间到0s，再修改增加时间，再恢复计时器，则不会触发【全局计时器触发时】事件; 若有界面控件引用对应计时器，则界面控件的计时表现会同步修改
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param timerName Identifier for the Timer. Only Timer Names configured in Timer Management can be referenced
   *
   * 计时器名称: 该计时器的标识，只能引用在计时器管理中已经配置好的计时器名称
   * @param changeValue For a Countdown Timer, a positive value increases the remaining time; a negative value decreases the remaining timeIf the timer is set to Stopwatch, a positive value increases the accumulated time, while a negative value decreases it
   *
   * 变化值: 若计时器为倒计时，则正数为增加倒计时剩余时间，负数为减少剩余时间若计时器为正计时，则正数为增加正计时累计时间，负数为减少累计时间
   */
  modifyGlobalTimer(targetEntity: EntityValue, timerName: StrValue, changeValue: FloatValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const timerNameObj = parseValue(timerName, 'str')
    const changeValueObj = parseValue(changeValue, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_global_timer',
      args: [targetEntityObj, timerNameObj, changeValueObj]
    })
  }

  /**
   * Pause a running Global Timer via the Node Graph; When paused, the UI controls linked to the timer will also pause their display
   *
   * 暂停全局计时器: 通过节点图，可以暂停运行中的全局计时器; 暂停时，若有界面控件引用对应计时器，则其显示时间也会暂停
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param timerName Identifier for the Timer. Only Timer Names configured in Timer Management can be referenced
   *
   * 计时器名称: 该计时器的标识，只能引用在计时器管理中已经配置好的计时器名称
   */
  pauseGlobalTimer(targetEntity: EntityValue, timerName: StrValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const timerNameObj = parseValue(timerName, 'str')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'pause_global_timer',
      args: [targetEntityObj, timerNameObj]
    })
  }

  /**
   * Use the node graph to stop running a global timer early
   *
   * 终止全局计时器: 通过节点图，提前结束运行中的全局计时器
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param timerName Identifier for the Timer. Only Timer Names configured in Timer Management can be referenced
   *
   * 计时器名称: 该计时器的标识，只能引用在计时器管理中已经配置好的计时器名称
   */
  stopGlobalTimer(targetEntity: EntityValue, timerName: StrValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const timerNameObj = parseValue(timerName, 'str')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'stop_global_timer',
      args: [targetEntityObj, timerNameObj]
    })
  }

  /**
   * Switch the Main Camera Template for the target Player List to the specified Template
   *
   * 切换主镜头模板: 使目标玩家列表的镜头模板切换至指定模板
   *
   * @param targetPlayerList Active Player List
   *
   * 目标玩家列表: 生效的玩家列表
   * @param cameraTemplateName Camera Template Identifier
   *
   * 镜头模板名称: 镜头模板的标识
   */
  switchMainCameraTemplate(targetPlayerList: PlayerEntity[], cameraTemplateName: StrValue): void {
    const targetPlayerListObj = parseValue(targetPlayerList, 'entity_list')
    const cameraTemplateNameObj = parseValue(cameraTemplateName, 'str')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'switch_main_camera_template',
      args: [targetPlayerListObj, cameraTemplateNameObj]
    })
  }

  /**
   * Edit the Character Disruptor Device active on the Target Entity by ID; if the ID does not exist, the change has no effect
   *
   * 修改角色扰动装置: 通过序号修改目标实体上生效的角色扰动装置，若序号不存在则此次修改不生效
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param deviceId Identifier for the Character Disruptor Device
   *
   * 装置序号: 角色扰动装置的标识
   */
  modifyingCharacterDisruptorDevice(targetEntity: EntityValue, deviceId: IntValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const deviceIdObj = parseValue(deviceId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modifying_character_disruptor_device',
      args: [targetEntityObj, deviceIdObj]
    })
  }

  /**
   * Add a specified Stack Count of Unit Status to the Target Entity
   *
   * 添加单位状态: 向指定目标实体添加一定层数的单位状态
   *
   * @param applierEntity Determines the Applier Entity for this action. Defaults to the Entity associated with this Node Graph
   *
   * 施加者实体: 决定了该次行为的施加者实体，默认为该节点图所关联的实体
   * @param applicationTargetEntity The Entity that actually receives this Unit Status
   *
   * 施加目标实体: 实际被添加该单位状态的实体
   * @param unitStatusConfigId Identifier for this Unit Status
   *
   * 单位状态配置ID: 该单位状态的标识
   * @param appliedStacks The Stack Count for this Unit Status
   *
   * 施加层数: 该单位状态的层数
   * @param unitStatusParameterDictionary Can carry a set of parameters to overwrite parameters defined in the Unit Status. Currently, only parameters within shield templates can be overwritten.
   *
   * 单位状态参数字典: 可以携带一组参数，用于覆写单位状态中的参数，目前仅支持对护盾中护盾模板的参数覆写
   */
  addUnitStatus(
    applierEntity: EntityValue,
    applicationTargetEntity: EntityValue,
    unitStatusConfigId: ConfigIdValue,
    appliedStacks: IntValue,
    unitStatusParameterDictionary: dict<'str', 'float'>
  ): {
    /**
     * Failed, other exceptionsFailed: Yielded to another status. A yielding relationship exists between the Target's current Unit Status and the one being appliedFailed: Maximum coexistence limit reached. The specified Unit Status on the Target Entity has reached its Coexistence LimitFailed: Unable to add additional stack. Stack addition failedSuccess: New status applied. Successfully applied new Unit StatusSuccess: Slot stacking. Target already has this Unit Status, stacking applied
     *
     * 施加结果: 失败，其他异常失败，让位于其他状态：目标上已有的单位状态与尝试施加的状态之间有让位关系失败，超出并存上限：超出目标实体上的指定单位状态的并存上限失败，附加叠层未成功：叠层失败成功，施加新状态：成功附加新状态成功，槽位叠层：目标上已有该单位状态，叠层
     */
    applicationResult: UnitStatusAdditionResult
    /**
     * If application succeeds, returns the Unit Status Slot ID containing the instance
     *
     * 槽位序号: 如果施加成功，则返回一个该单位状态实例所在的单位状态槽位序号
     */
    slotId: bigint
  } {
    const applierEntityObj = parseValue(applierEntity, 'entity')
    const applicationTargetEntityObj = parseValue(applicationTargetEntity, 'entity')
    const unitStatusConfigIdObj = parseValue(unitStatusConfigId, 'config_id')
    const appliedStacksObj = parseValue(appliedStacks, 'int')
    const unitStatusParameterDictionaryObj = parseValue(unitStatusParameterDictionary, 'dict')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'add_unit_status',
      args: [
        applierEntityObj,
        applicationTargetEntityObj,
        unitStatusConfigIdObj,
        appliedStacksObj,
        unitStatusParameterDictionaryObj
      ]
    })
    return {
      applicationResult: (() => {
        const ret = new enumeration('UnitStatusAdditionResult')
        ret.markPin(ref, 'applicationResult', 0)
        return ret as unknown as UnitStatusAdditionResult
      })(),
      slotId: (() => {
        const ret = new int()
        ret.markPin(ref, 'slotId', 1)
        return ret as unknown as bigint
      })()
    }
  }

  /**
   * Remove a specified Unit Status from the Target Entity. Either all stacks or a single stack can be removed
   *
   * 移除单位状态: 从目标实体上移除指定单位状态。可以选择全部移除，或移除其中一层
   *
   * @param removeTargetEntity The Entity from which the Unit Status will be removed
   *
   * 移除目标实体: 被移除该单位状态的实体
   * @param unitStatusConfigId Identifier for this Unit Status
   *
   * 单位状态配置ID: 该单位状态的标识
   * @param removalMethod All Coexisting Statuses with the Same Name: Removes all statuses applied with this Config ID that share the same nameStatus With Fastest Stack Loss: Removes one stack from the status that loses stacks the fastest
   *
   * 移除方式: 所有同名并存状态：移除以该配置ID施加的所有同名状态最快丢失叠加层数的状态：移除最快丢失叠加层数的一层状态
   * @param removerEntity Determines the Remover Entity for this action. Defaults to the Entity associated with this Node Graph
   *
   * 移除者实体: 决定了该次行为的移除者实体，默认为该节点图所关联的实体
   */
  removeUnitStatus(
    removeTargetEntity: EntityValue,
    unitStatusConfigId: ConfigIdValue,
    removalMethod: RemovalMethod,
    removerEntity: EntityValue
  ): void {
    const removeTargetEntityObj = parseValue(removeTargetEntity, 'entity')
    const unitStatusConfigIdObj = parseValue(unitStatusConfigId, 'config_id')
    const removalMethodObj = parseValue(removalMethod, 'enumeration')
    const removerEntityObj = parseValue(removerEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'remove_unit_status',
      args: [removeTargetEntityObj, unitStatusConfigIdObj, removalMethodObj, removerEntityObj]
    })
  }

  /**
   * Edit the Tab state by ID in the Target Entity's Tab Component
   *
   * 激活/关闭选项卡: 可以修改目标实体的选项卡组件中对应序号的选项卡状态
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param tabId Identifier for the Tab
   *
   * 选项卡序号: 选项卡的标识
   * @param activate If set to True, it is active and can be selected
   *
   * 是否激活: 为“是”则激活，可以被选取
   */
  activateDisableTab(targetEntity: EntityValue, tabId: IntValue, activate: BoolValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const tabIdObj = parseValue(tabId, 'int')
    const activateObj = parseValue(activate, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_disable_tab',
      args: [targetEntityObj, tabIdObj, activateObj]
    })
  }

  /**
   * Edit the state of the Collision Trigger Source Component on the Target Entity
   *
   * 激活/关闭碰撞触发源: 可以修改目标实体的碰撞触发源组件状态
   *
   * @param targetEntity Active Entity
   *
   * 目标实体: 生效的实体
   * @param activate If set to True, activates collision with Entities that carry Collision Trigger Components
   *
   * 是否激活: 为“是”则激活，可以与携带碰撞触发器组件的实体产生碰撞
   */
  activateDisableCollisionTriggerSource(targetEntity: EntityValue, activate: BoolValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const activateObj = parseValue(activate, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_disable_collision_trigger_source',
      args: [targetEntityObj, activateObj]
    })
  }

  /**
   * Set the Player's current Class Level. If it exceeds the defined range, the change will not take effect
   *
   * 更改玩家当前职业等级: 修改玩家当前职业等级，若超出定义的等级范围则会失效
   *
   * @param targetPlayer Active Player Entity
   *
   * 目标玩家: 生效的玩家实体
   * @param level Edited Level
   *
   * 等级: 修改后的等级
   */
  changePlayerSCurrentClassLevel(targetPlayer: PlayerEntity, level: IntValue): void {
    const targetPlayerObj = parseValue(targetPlayer, 'entity')
    const levelObj = parseValue(level, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'change_player_s_current_class_level',
      args: [targetPlayerObj, levelObj]
    })
  }

  /**
   * Set the Player's current Class to the Class referenced by the Config ID
   *
   * 更改玩家职业: 修改玩家的当前职业为配置ID对应的职业
   *
   * @param targetPlayer Active Player Entity
   *
   * 目标玩家: 生效的玩家实体
   * @param classConfigId Class Identifier
   *
   * 职业配置ID: 该职业的标识
   */
  changePlayerClass(targetPlayer: PlayerEntity, classConfigId: ConfigIdValue): void {
    const targetPlayerObj = parseValue(targetPlayer, 'entity')
    const classConfigIdObj = parseValue(classConfigId, 'config_id')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'change_player_class',
      args: [targetPlayerObj, classConfigIdObj]
    })
  }

  /**
   * Increase the Player's current Class EXP. Any excess beyond the maximum Level will not take effect
   *
   * 提升玩家当前职业经验: 提升玩家当前职业经验，超出最大等级的部分会无效
   *
   * @param targetPlayer Active Player Entity
   *
   * 目标玩家: 生效的玩家实体
   * @param exp Amount of EXP to be increased
   *
   * 经验值: 所要提升的经验值
   */
  increasePlayerSCurrentClassExp(targetPlayer: PlayerEntity, exp: IntValue): void {
    const targetPlayerObj = parseValue(targetPlayer, 'entity')
    const expObj = parseValue(exp, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'increase_player_s_current_class_exp',
      args: [targetPlayerObj, expObj]
    })
  }

  /**
   * Activate the UI Control Groups stored as Custom Templates in the UI Control Group Library within the Target Player's Interface Layout
   *
   * 激活控件组库内界面控件组: 可以在目标玩家的界面布局上激活处于界面控件组库内的以自定义模板形式存在的界面控件组
   *
   * @param targetPlayer Active Player Entity
   *
   * 目标玩家: 生效的玩家实体
   * @param uiControlGroupIndex Identifier for the UI Control Group
   *
   * 界面控件组索引: 界面控件组的标识
   */
  activateUiControlGroupInControlGroupLibrary(
    targetPlayer: PlayerEntity,
    uiControlGroupIndex: IntValue
  ): void {
    const targetPlayerObj = parseValue(targetPlayer, 'entity')
    const uiControlGroupIndexObj = parseValue(uiControlGroupIndex, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_ui_control_group_in_control_group_library',
      args: [targetPlayerObj, uiControlGroupIndexObj]
    })
  }

  /**
   * Switch the Target Player's current Interface Layout via Layout ID
   *
   * 切换当前界面布局: 可以通过布局索引来切换目标玩家当前的界面布局
   *
   * @param targetPlayer Active Player Entity
   *
   * 目标玩家: 生效的玩家实体
   * @param layoutIndex Identifier for the UI Layout
   *
   * 布局索引: 界面布局的标识
   */
  switchCurrentInterfaceLayout(targetPlayer: PlayerEntity, layoutIndex: IntValue): void {
    const targetPlayerObj = parseValue(targetPlayer, 'entity')
    const layoutIndexObj = parseValue(layoutIndex, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'switch_current_interface_layout',
      args: [targetPlayerObj, layoutIndexObj]
    })
  }

  /**
   * Edit the state of the UI Control in the Target Player's Interface Layout by its UI Control ID
   *
   * 修改界面布局内界面控件状态: 通过界面控件索引来修改目标玩家界面布局内对应界面控件的状态
   *
   * @param targetPlayer Active Player Entity
   *
   * 目标玩家: 生效的玩家实体
   * @param uiControlIndex Identifier for the UI Control
   *
   * 界面控件索引: 界面控件的标识
   * @param displayStatus Off: Invisible and logic not runningOn: Visible and logic running normallyHidden: Invisible and logic running normally
   *
   * 显示状态: 关闭：不可见且逻辑不运行开启：可见+逻辑正常运行隐藏：不可见+逻辑正常运行
   */
  modifyUiControlStatusWithinTheInterfaceLayout(
    targetPlayer: PlayerEntity,
    uiControlIndex: IntValue,
    displayStatus: UIControlGroupStatus
  ): void {
    const targetPlayerObj = parseValue(targetPlayer, 'entity')
    const uiControlIndexObj = parseValue(uiControlIndex, 'int')
    const displayStatusObj = parseValue(displayStatus, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_ui_control_status_within_the_interface_layout',
      args: [targetPlayerObj, uiControlIndexObj, displayStatusObj]
    })
  }

  /**
   * Remove the UI Control Groups activated via [Activate UI Control Group in Control Group Library] from the Target Player's Interface Layout
   *
   * 移除控件组库内界面控件组: 可以在目标玩家的界面布局上移除已通过节点【激活控件组库内界面控件组】激活的界面控件组
   *
   * @param targetPlayer Active Player Entity
   *
   * 目标玩家: 生效的玩家实体
   * @param uiControlGroupIndex Identifier for the UI Control Group
   *
   * 界面控件组索引: 界面控件组的标识
   */
  removeInterfaceControlGroupFromControlGroupLibrary(
    targetPlayer: PlayerEntity,
    uiControlGroupIndex: IntValue
  ): void {
    const targetPlayerObj = parseValue(targetPlayer, 'entity')
    const uiControlGroupIndexObj = parseValue(uiControlGroupIndex, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'remove_interface_control_group_from_control_group_library',
      args: [targetPlayerObj, uiControlGroupIndexObj]
    })
  }

  /**
   * Edit the cooldown percentage of a skill in a Character's Skill Slot based on its maximum cooldown
   *
   * 按最大冷却时间修改技能冷却百分比: 通过技能最大冷却时间的百分比来修改角色某个技能槽位内的技能
   *
   * @param targetEntity Active Character Entity
   *
   * 目标实体: 生效的角色实体
   * @param characterSkillSlot The Skill Slot to edited: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要修改的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   * @param cooldownRatioModifier Actual Cooldown after Editing = Original Cooldown × Cooldown Ratio Edit Value
   *
   * 冷却比例修改值: 修改后的实际冷却时间为：原冷却时间*冷却比例修改值
   * @param limitMaximumCdTime If set to True, the edited Cooldown cannot be less than the specified minimum value
   *
   * 是否限制最大冷却时间: 为“是”可以限制修改后的冷却时间不小于所限制的值
   */
  modifySkillCdPercentageBasedOnMaxCd(
    targetEntity: CharacterEntity,
    characterSkillSlot: CharacterSkillSlot,
    cooldownRatioModifier: FloatValue,
    limitMaximumCdTime: BoolValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const characterSkillSlotObj = parseValue(characterSkillSlot, 'enumeration')
    const cooldownRatioModifierObj = parseValue(cooldownRatioModifier, 'float')
    const limitMaximumCdTimeObj = parseValue(limitMaximumCdTime, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_skill_cd_percentage_based_on_max_cd',
      args: [
        targetEntityObj,
        characterSkillSlotObj,
        cooldownRatioModifierObj,
        limitMaximumCdTimeObj
      ]
    })
  }

  /**
   * Reset the Target Character's skills to those defined in the Class Template
   *
   * 初始化角色技能: 使目标角色的技能重置为职业模板上配置的技能
   *
   * @param targetEntity Active Character Entity
   *
   * 目标实体: 生效的角色实体
   * @param characterSkillSlot The Skill Slot to initialize: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要初始化的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   */
  initializeCharacterSkill(
    targetEntity: CharacterEntity,
    characterSkillSlot: CharacterSkillSlot
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const characterSkillSlotObj = parseValue(characterSkillSlot, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'initialize_character_skill',
      args: [targetEntityObj, characterSkillSlotObj]
    })
  }

  /**
   * Edit the Character's skill resource amount
   *
   * 设置技能资源量: 修改角色的技能资源量
   *
   * @param targetEntity Active Character Entity
   *
   * 目标实体: 生效的角色实体
   * @param skillResourceConfigId Skill Resource Identifier
   *
   * 技能资源配置ID: 技能资源的标识
   * @param targetValue Edited value will be set to this input value
   *
   * 目标值: 修改后的值为该输入值
   */
  setSkillResourceAmount(
    targetEntity: CharacterEntity,
    skillResourceConfigId: ConfigIdValue,
    targetValue: FloatValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const skillResourceConfigIdObj = parseValue(skillResourceConfigId, 'config_id')
    const targetValueObj = parseValue(targetValue, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_skill_resource_amount',
      args: [targetEntityObj, skillResourceConfigIdObj, targetValueObj]
    })
  }

  /**
   * Directly set the cooldown of a specific Skill Slot on the Target Character to a specified value
   *
   * 设置角色技能冷却: 直接设置目标角色某个技能槽位的冷却为指定值
   *
   * @param targetEntity Active Character Entity
   *
   * 目标实体: 生效的角色实体
   * @param characterSkillSlot The Skill Slot to edited: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要修改的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   * @param remainingCdTime Edited Cooldown will be set to this input value
   *
   * 冷却剩余时间: 修改后的冷却时间为该输入值
   * @param limitMaximumCdTime If set to True, the edited Cooldown cannot be less than the specified minimum value
   *
   * 是否限制最大冷却时间: 为“是”可以限制修改后的冷却时间不小于所限制的值
   */
  setCharacterSkillCd(
    targetEntity: CharacterEntity,
    characterSkillSlot: CharacterSkillSlot,
    remainingCdTime: FloatValue,
    limitMaximumCdTime: BoolValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const characterSkillSlotObj = parseValue(characterSkillSlot, 'enumeration')
    const remainingCdTimeObj = parseValue(remainingCdTime, 'float')
    const limitMaximumCdTimeObj = parseValue(limitMaximumCdTime, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_character_skill_cd',
      args: [targetEntityObj, characterSkillSlotObj, remainingCdTimeObj, limitMaximumCdTimeObj]
    })
  }

  /**
   * Add a skill to the specified Target Character's Skill Slot
   *
   * 添加角色技能: 为指定目标角色的某个技能槽位添加技能
   *
   * @param targetEntity Active Character Entity
   *
   * 目标实体: 生效的角色实体
   * @param skillConfigId Skill Identifier
   *
   * 技能配置ID: 技能的标识
   * @param skillSlot The Skill Slot to be added: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 技能槽位: 要添加的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   */
  addCharacterSkill(
    targetEntity: CharacterEntity,
    skillConfigId: ConfigIdValue,
    skillSlot: CharacterSkillSlot
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const skillConfigIdObj = parseValue(skillConfigId, 'config_id')
    const skillSlotObj = parseValue(skillSlot, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'add_character_skill',
      args: [targetEntityObj, skillConfigIdObj, skillSlotObj]
    })
  }

  /**
   * Edit the skill's resource amount by adding the change value to the current value. The change value can be negative
   *
   * 修改技能资源量: 修改技能的资源量，会在当前值上加上变更值，变更值可以为负数
   *
   * @param targetEntity Active Character Entity
   *
   * 目标实体: 生效的角色实体
   * @param skillResourceConfigId Skill Resource Identifier
   *
   * 技能资源配置ID: 技能资源的标识
   * @param changeValue New Value = Original Value + Change Value
   *
   * 变更值: 修改后的值为：原值+变更值
   */
  modifySkillResourceAmount(
    targetEntity: CharacterEntity,
    skillResourceConfigId: ConfigIdValue,
    changeValue: FloatValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const skillResourceConfigIdObj = parseValue(skillResourceConfigId, 'config_id')
    const changeValueObj = parseValue(changeValue, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_skill_resource_amount',
      args: [targetEntityObj, skillResourceConfigIdObj, changeValueObj]
    })
  }

  /**
   * Available only in Classic Mode, sets the elemental energy for a specific character
   *
   * 设置角色元素能量: 仅经典模式可用，设置指定角色的元素能量
   *
   * @param targetEntity Active Character Entity
   *
   * 目标实体: 生效的角色实体
   * @param elementalEnergy
   *
   * 元素能量
   */
  setCharacterSElementalEnergy(targetEntity: CharacterEntity, elementalEnergy: FloatValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const elementalEnergyObj = parseValue(elementalEnergy, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_character_s_elemental_energy',
      args: [targetEntityObj, elementalEnergyObj]
    })
  }

  /**
   * Available only in Classic Mode, increases the elemental energy for a specific character
   *
   * 增加角色元素能量: 仅经典模式可用，增加指定角色的元素能量
   *
   * @param targetEntity Active Character Entity
   *
   * 目标实体: 生效的角色实体
   * @param increaseValue
   *
   * 增加值
   */
  increasesCharacterSElementalEnergy(
    targetEntity: CharacterEntity,
    increaseValue: FloatValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const increaseValueObj = parseValue(increaseValue, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'increases_character_s_elemental_energy',
      args: [targetEntityObj, increaseValueObj]
    })
  }

  /**
   * Edit the cooldown of the specified Skill Slot on the Target Character. The edit value is added to the current cooldown and can be negative
   *
   * 修改角色技能冷却: 修改目标角色某个技能槽位的冷却，会在当前冷却时间上加修改值，修改值可以为负数
   *
   * @param targetEntity Active Character Entity
   *
   * 目标实体: 生效的角色实体
   * @param characterSkillSlot The Skill Slot to edited: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要修改的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   * @param cdModifier New Value = Original Value + Edit Value
   *
   * 冷却时间修改值: 修改后的值为：原值+修改值
   * @param limitMaximumCdTime If set to True, the edited Cooldown cannot be less than the specified minimum value
   *
   * 是否限制最大冷却时间: 为“是”可以限制修改后的冷却时间不小于所限制的值
   */
  modifyCharacterSkillCd(
    targetEntity: CharacterEntity,
    characterSkillSlot: CharacterSkillSlot,
    cdModifier: FloatValue,
    limitMaximumCdTime: BoolValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const characterSkillSlotObj = parseValue(characterSkillSlot, 'enumeration')
    const cdModifierObj = parseValue(cdModifier, 'float')
    const limitMaximumCdTimeObj = parseValue(limitMaximumCdTime, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_character_skill_cd',
      args: [targetEntityObj, characterSkillSlotObj, cdModifierObj, limitMaximumCdTimeObj]
    })
  }

  /**
   * Delete the skill in the specified slot of the Target Character
   *
   * 以槽位删除角色技能: 删除目标角色指定槽位的技能
   *
   * @param targetEntity Active Character Entity
   *
   * 目标实体: 生效的角色实体
   * @param characterSkillSlot The Skill Slot to be deleted: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要删除的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   */
  deleteCharacterSkillBySlot(
    targetEntity: CharacterEntity,
    characterSkillSlot: CharacterSkillSlot
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const characterSkillSlotObj = parseValue(characterSkillSlot, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'delete_character_skill_by_slot',
      args: [targetEntityObj, characterSkillSlotObj]
    })
  }

  /**
   * Iterate through and delete all skills with the specified Config ID across all of the Character's slots
   *
   * 以ID删除角色技能: 遍历角色的所有槽位，删除所有指定配置ID的技能
   *
   * @param targetEntity Active Character Entity
   *
   * 目标实体: 生效的角色实体
   * @param skillConfigId Skill Identifier
   *
   * 技能配置ID: 技能的标识
   */
  deleteCharacterSkillById(targetEntity: CharacterEntity, skillConfigId: ConfigIdValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const skillConfigIdObj = parseValue(skillConfigId, 'config_id')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'delete_character_skill_by_id',
      args: [targetEntityObj, skillConfigIdObj]
    })
  }

  /**
   * Adjust Player Background Music Volume
   *
   * 调整玩家背景音乐音量: 调整玩家背景音乐音量
   *
   * @param targetEntity Active Player Entity
   *
   * 目标实体: 生效的玩家实体
   * @param volume
   *
   * 音量
   */
  adjustPlayerBackgroundMusicVolume(targetEntity: PlayerEntity, volume: IntValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const volumeObj = parseValue(volume, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'adjust_player_background_music_volume',
      args: [targetEntityObj, volumeObj]
    })
  }

  /**
   * Adjust the volume and playback speed of the Sound Effect Player with the specified ID in the Sound Effect Player Component on the Target Entity
   *
   * 调整指定音效播放器: 可以调整指定目标实体上的音效播放器组件对应序号的音效播放器的音量和播放速度
   *
   * @param targetEntity
   *
   * 目标实体
   * @param sfxPlayerId
   *
   * 音效播放器序号
   * @param volume
   *
   * 音量
   * @param playbackSpeed
   *
   * 播放速度
   */
  adjustSpecifiedSoundEffectPlayer(
    targetEntity: EntityValue,
    sfxPlayerId: IntValue,
    volume: IntValue,
    playbackSpeed: FloatValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const sfxPlayerIdObj = parseValue(sfxPlayerId, 'int')
    const volumeObj = parseValue(volume, 'int')
    const playbackSpeedObj = parseValue(playbackSpeed, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'adjust_specified_sound_effect_player',
      args: [targetEntityObj, sfxPlayerIdObj, volumeObj, playbackSpeedObj]
    })
  }

  /**
   * Disable the Sound Effect Player with the specified ID in the Sound Effect Player Component on the specified Target Entity
   *
   * 关闭指定音效播放器: 关闭指定目标实体上的音效播放器组件对应序号的音效播放器
   *
   * @param targetEntity
   *
   * 目标实体
   * @param sfxPlayerId
   *
   * 音效播放器序号
   */
  closeSpecifiedSoundEffectPlayer(targetEntity: EntityValue, sfxPlayerId: IntValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const sfxPlayerIdObj = parseValue(sfxPlayerId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'close_specified_sound_effect_player',
      args: [targetEntityObj, sfxPlayerIdObj]
    })
  }

  /**
   * Edit the background music state for the specified Player
   *
   * 启动/暂停玩家背景音乐: 修改对应玩家的背景音乐状态
   *
   * @param targetEntity Active Player Entity
   *
   * 目标实体: 生效的玩家实体
   * @param recover
   *
   * 是否恢复
   */
  startPausePlayerBackgroundMusic(targetEntity: PlayerEntity, recover: BoolValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const recoverObj = parseValue(recover, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'start_pause_player_background_music',
      args: [targetEntityObj, recoverObj]
    })
  }

  /**
   * Edit the state of the Sound Effect Player with the specified ID in the Sound Effect Player Component on the Target Entity. This node is only active when the sound effect is set to loop playback. It does not take effect for sound effects configured for single-playback.
   *
   * 启动/暂停指定音效播放器: 可以修改指定目标实体上的音效播放器组件对应序号的音效播放器状态，仅当该音效被设置为循环播放时有效，单次播放的音效该节点不生效
   *
   * @param targetEntity
   *
   * 目标实体
   * @param sfxPlayerId
   *
   * 音效播放器序号
   * @param recover
   *
   * 是否恢复
   */
  startPauseSpecifiedSoundEffectPlayer(
    targetEntity: EntityValue,
    sfxPlayerId: IntValue,
    recover: BoolValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const sfxPlayerIdObj = parseValue(sfxPlayerId, 'int')
    const recoverObj = parseValue(recover, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'start_pause_specified_sound_effect_player',
      args: [targetEntityObj, sfxPlayerIdObj, recoverObj]
    })
  }

  /**
   * Dynamically add a Sound Effect Player. The Unit must have a Sound Effect Player Component
   *
   * 添加音效播放器: 动态添加一个音效播放器，需要单位持有音效播放器组件
   *
   * @param targetEntity
   *
   * 目标实体
   * @param soundEffectAssetIndex
   *
   * 音效资产索引
   * @param volume
   *
   * 音量
   * @param playbackSpeed
   *
   * 播放速度
   * @param loopPlayback
   *
   * 是否循环播放
   * @param loopIntervalTime
   *
   * 循环间隔时间
   * @param _3dSoundEffect
   *
   * 是否为3D音效
   * @param rangeRadius
   *
   * 范围半径
   * @param attenuationMode
   *
   * 衰减方式
   * @param attachmentPointName
   *
   * 挂接点名称
   * @param attachmentPointOffset
   *
   * 挂接点偏移
   *
   * @returns
   *
   * 音效播放器序号
   */
  addSoundEffectPlayer(
    targetEntity: EntityValue,
    soundEffectAssetIndex: IntValue,
    volume: IntValue,
    playbackSpeed: FloatValue,
    loopPlayback: BoolValue,
    loopIntervalTime: FloatValue,
    _3dSoundEffect: BoolValue,
    rangeRadius: FloatValue,
    attenuationMode: SoundAttenuationMode,
    attachmentPointName: StrValue,
    attachmentPointOffset: Vec3Value
  ): bigint {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const soundEffectAssetIndexObj = parseValue(soundEffectAssetIndex, 'int')
    const volumeObj = parseValue(volume, 'int')
    const playbackSpeedObj = parseValue(playbackSpeed, 'float')
    const loopPlaybackObj = parseValue(loopPlayback, 'bool')
    const loopIntervalTimeObj = parseValue(loopIntervalTime, 'float')
    const _3dSoundEffectObj = parseValue(_3dSoundEffect, 'bool')
    const rangeRadiusObj = parseValue(rangeRadius, 'float')
    const attenuationModeObj = parseValue(attenuationMode, 'enumeration')
    const attachmentPointNameObj = parseValue(attachmentPointName, 'str')
    const attachmentPointOffsetObj = parseValue(attachmentPointOffset, 'vec3')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'add_sound_effect_player',
      args: [
        targetEntityObj,
        soundEffectAssetIndexObj,
        volumeObj,
        playbackSpeedObj,
        loopPlaybackObj,
        loopIntervalTimeObj,
        _3dSoundEffectObj,
        rangeRadiusObj,
        attenuationModeObj,
        attachmentPointNameObj,
        attachmentPointOffsetObj
      ]
    })
    const ret = new int()
    ret.markPin(ref, 'sfxPlayerId', 0)
    return ret as unknown as bigint
  }

  /**
   * Player plays a one-shot 2D Sound Effect
   *
   * 玩家播放单次2D音效: 玩家播放单次2D音效
   *
   * @param targetEntity Active Player Entity
   *
   * 目标实体: 生效的玩家实体
   * @param soundEffectAssetIndex
   *
   * 音效资产索引
   * @param volume
   *
   * 音量
   * @param playbackSpeed
   *
   * 播放速度
   */
  playerPlaysOneShot2dSoundEffect(
    targetEntity: PlayerEntity,
    soundEffectAssetIndex: IntValue,
    volume: IntValue,
    playbackSpeed: FloatValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const soundEffectAssetIndexObj = parseValue(soundEffectAssetIndex, 'int')
    const volumeObj = parseValue(volume, 'int')
    const playbackSpeedObj = parseValue(playbackSpeed, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'player_plays_one_shot2d_sound_effect',
      args: [targetEntityObj, soundEffectAssetIndexObj, volumeObj, playbackSpeedObj]
    })
  }

  /**
   * Edit background music parameters for the Player
   *
   * 修改玩家背景音乐: 修改玩家背景音乐相关参数
   *
   * @param targetEntity Active Player Entity
   *
   * 目标实体: 生效的玩家实体
   * @param backgroundMusicIndex
   *
   * 背景音乐索引
   * @param startTime
   *
   * 开始时间
   * @param endTime
   *
   * 结束时间
   * @param volume
   *
   * 音量
   * @param loopPlayback
   *
   * 是否循环播放
   * @param loopInterval
   *
   * 循环播放间隔
   * @param playbackSpeed
   *
   * 播放速度
   * @param enableFadeInOut
   *
   * 是否允许渐入渐出
   */
  modifyPlayerBackgroundMusic(
    targetEntity: PlayerEntity,
    backgroundMusicIndex: IntValue,
    startTime: FloatValue,
    endTime: FloatValue,
    volume: IntValue,
    loopPlayback: BoolValue,
    loopInterval: FloatValue,
    playbackSpeed: FloatValue,
    enableFadeInOut: BoolValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const backgroundMusicIndexObj = parseValue(backgroundMusicIndex, 'int')
    const startTimeObj = parseValue(startTime, 'float')
    const endTimeObj = parseValue(endTime, 'float')
    const volumeObj = parseValue(volume, 'int')
    const loopPlaybackObj = parseValue(loopPlayback, 'bool')
    const loopIntervalObj = parseValue(loopInterval, 'float')
    const playbackSpeedObj = parseValue(playbackSpeed, 'float')
    const enableFadeInOutObj = parseValue(enableFadeInOut, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_player_background_music',
      args: [
        targetEntityObj,
        backgroundMusicIndexObj,
        startTimeObj,
        endTimeObj,
        volumeObj,
        loopPlaybackObj,
        loopIntervalObj,
        playbackSpeedObj,
        enableFadeInOutObj
      ]
    })
  }

  /**
   * Clear Unit Tags for the specified Entity
   *
   * 实体清空单位标签: 对指定实体清空单位标签
   *
   * @param targetEntity
   *
   * 目标实体
   */
  clearUnitTagsFromEntity(targetEntity: EntityValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'clear_unit_tags_from_entity',
      args: [targetEntityObj]
    })
  }

  /**
   * Add Unit Tags to the specified Entity
   *
   * 实体添加单位标签: 对指定实体添加单位标签
   *
   * @param targetEntity
   *
   * 目标实体
   * @param unitTagIndex
   *
   * 单位标签索引
   */
  addUnitTagToEntity(targetEntity: EntityValue, unitTagIndex: IntValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const unitTagIndexObj = parseValue(unitTagIndex, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'add_unit_tag_to_entity',
      args: [targetEntityObj, unitTagIndexObj]
    })
  }

  /**
   * Remove Unit Tags from the specified Entity
   *
   * 实体移除单位标签: 对指定实体移除单位标签
   *
   * @param targetEntity
   *
   * 目标实体
   * @param unitTagIndex
   *
   * 单位标签索引
   */
  removeUnitTagFromEntity(targetEntity: EntityValue, unitTagIndex: IntValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const unitTagIndexObj = parseValue(unitTagIndex, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'remove_unit_tag_from_entity',
      args: [targetEntityObj, unitTagIndexObj]
    })
  }

  /**
   * Available only in Custom Aggro Mode; Make the Taunter Entity taunt the specified Target Entity
   *
   * 嘲讽目标: 仅自定义仇恨模式可用; 使嘲讽者实体嘲讽指定目标实体
   *
   * @param taunterEntity
   *
   * 嘲讽者实体
   * @param targetEntity
   *
   * 目标实体
   */
  tauntTarget(taunterEntity: EntityValue, targetEntity: EntityValue): void {
    const taunterEntityObj = parseValue(taunterEntity, 'entity')
    const targetEntityObj = parseValue(targetEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'taunt_target',
      args: [taunterEntityObj, targetEntityObj]
    })
  }

  /**
   * Available only in Custom Aggro Mode; Remove the Target Entity from the Aggro Owner's Aggro List; this may cause the target to leave battle
   *
   * 将目标实体移除出仇恨列表: 仅自定义仇恨模式可用; 将目标实体从仇恨拥有者的仇恨列表中移除，可能会导致目标实体脱战
   *
   * @param targetEntity
   *
   * 目标实体
   * @param aggroOwnerEntity
   *
   * 仇恨拥有者实体
   */
  removeTargetEntityFromAggroList(targetEntity: EntityValue, aggroOwnerEntity: EntityValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const aggroOwnerEntityObj = parseValue(aggroOwnerEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'remove_target_entity_from_aggro_list',
      args: [targetEntityObj, aggroOwnerEntityObj]
    })
  }

  /**
   * Available only in Custom Aggro Mode; Clear the Aggro Owner's Aggro List. This may cause them to leave battle
   *
   * 清空指定目标的仇恨列表: 仅自定义仇恨模式可用; 清空仇恨拥有者的仇恨列表。可能会导致其脱战
   *
   * @param aggroOwner
   *
   * 仇恨拥有者
   */
  clearSpecifiedTargetSAggroList(aggroOwner: EntityValue): void {
    const aggroOwnerObj = parseValue(aggroOwner, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'clear_specified_target_s_aggro_list',
      args: [aggroOwnerObj]
    })
  }

  /**
   * Available only in Custom Aggro Mode; Set the Aggro Value of the specified Target Entity on the specified Aggro Owner
   *
   * 设置指定实体的仇恨值: 仅自定义仇恨模式可用; 设置指定目标实体在指定仇恨拥有者上的仇恨值
   *
   * @param targetEntity
   *
   * 目标实体
   * @param aggroOwnerEntity
   *
   * 仇恨拥有者实体
   * @param aggroValue
   *
   * 仇恨值
   */
  setTheAggroValueOfSpecifiedEntity(
    targetEntity: EntityValue,
    aggroOwnerEntity: EntityValue,
    aggroValue: IntValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const aggroOwnerEntityObj = parseValue(aggroOwnerEntity, 'entity')
    const aggroValueObj = parseValue(aggroValue, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_the_aggro_value_of_specified_entity',
      args: [targetEntityObj, aggroOwnerEntityObj, aggroValueObj]
    })
  }

  /**
   * Send a custom Signal to the global Stage. Before use, select the corresponding Signal name to ensure correct parameter usage
   *
   * 发送信号: 向关卡全局发送一个自定义信号，使用前需要先选择对应的信号名，然后才能正确的使用该信号的参数
   *
   * GSTS Note: You still need to register the signal in the signal manager in the editor; Using signal distribution can avoid some large loop triggering load limits, which can be used for performance optimization
   *
   * GSTS 注: 你仍然需要在编辑器内的信号管理器注册信号; 使用信号分发能够避免一些大循环触发负载限制, 可用于性能优化
   *
   * @param signalName Only literal string is supported
   *
   * 信号名（仅支持字面量字符串）
   */
  sendSignal(signalName: StrValue): void {
    const signalNameObj = ensureLiteralStr(signalName, 'signalName')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'send_signal',
      args: [signalNameObj]
    })
  }

  /**
   * Set the active Nameplate list for the specified target. Nameplates included in the input list are enabled, while those not included are disabled
   *
   * 设置实体生效铭牌: 直接设置指定目标的生效铭牌列表，在入参列表中的铭牌配置会生效，不在列表中的会失效
   *
   * @param targetEntity
   *
   * 目标实体
   * @param nameplateConfigIdList
   *
   * 铭牌配置ID列表
   */
  setEntityActiveNameplate(
    targetEntity: EntityValue,
    nameplateConfigIdList: ConfigIdValue[]
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const nameplateConfigIdListObj = parseValue(nameplateConfigIdList, 'config_id_list')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_entity_active_nameplate',
      args: [targetEntityObj, nameplateConfigIdListObj]
    })
  }

  /**
   * In the Target Entity's Text Bubble Component, replace the current active Text Bubble with the one corresponding to the Config ID
   *
   * 切换生效的文本气泡: 目标实体的文本气泡组件中，会以配置ID对应的文本气泡替换当前生效的文本气泡
   *
   * @param targetEntity
   *
   * 目标实体
   * @param textBubbleConfigurationId
   *
   * 文本气泡配置ID
   */
  switchActiveTextBubble(
    targetEntity: EntityValue,
    textBubbleConfigurationId: ConfigIdValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const textBubbleConfigurationIdObj = parseValue(textBubbleConfigurationId, 'config_id')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'switch_active_text_bubble',
      args: [targetEntityObj, textBubbleConfigurationIdObj]
    })
  }

  /**
   * Close the currently active Deck Selector for the specified Player
   *
   * 关闭卡牌选择器: 关闭指定玩家当前生效的卡牌选择器
   *
   * @param targetPlayer Active Player Entity
   *
   * 目标玩家: 生效的玩家实体
   * @param deckSelectorIndex
   *
   * 卡牌选择器索引
   */
  closeDeckSelector(targetPlayer: PlayerEntity, deckSelectorIndex: IntValue): void {
    const targetPlayerObj = parseValue(targetPlayer, 'entity')
    const deckSelectorIndexObj = parseValue(deckSelectorIndex, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'close_deck_selector',
      args: [targetPlayerObj, deckSelectorIndexObj]
    })
  }

  /**
   * Open the pre-made Deck Selector for the Target Player
   *
   * 唤起卡牌选择器: 对目标玩家打开提前制作好的卡牌选择器
   *
   * @param targetPlayer Specify the runtime Player to invoke the Deck Selector
   *
   * 目标玩家: 指定运行时玩家，唤起卡牌选择器
   * @param deckSelectorId Referenced UI Control Group ID
   *
   * 卡牌选择器索引: 引用的界面控件组索引
   * @param selectDuration If empty, uses the Deck Selector's default configuration; otherwise, this time value is used as the effective durationUnit in seconds
   *
   * 选择时长: 若为空，则读取卡牌选择器默认配置；若不为空，以此处时间参数为实际生效时长单位为秒
   * @param selectResultCorrespondingList One-to-one with display items: the Deck Selector returns the result value corresponding to each display itemRecommended configuration: 1 to X
   *
   * 选择结果对应列表: 和显示项一一对应，卡牌选择器返回的实际结果是显示项对应的结果值推荐配置1至X
   * @param selectDisplayCorrespondingList Deck Library Configuration Reference
   *
   * 选择显示对应列表: 卡牌库中的配置引用
   * @param selectMinimumQuantity The minimum number of cards that must be selected for a valid interaction
   *
   * 选择数量下限: 选择卡牌数量下限，满足数量才可进行合法的选择交互
   * @param selectMaximumQuantity The maximum number of cards that can be selected for a valid interaction
   *
   * 选择数量上限: 选择卡牌数量上限，满足数量才可进行合法的选择交互
   * @param refreshMode No Refresh
   *
   * 刷新方式: 不可刷新
   * @param refreshMinimumQuantity The minimum number of cards that must be selected for a valid refresh interaction.
   *
   * 刷新数量下限: 选择卡牌数量下限，满足数量才可进行合法的刷新交互
   * @param refreshMaximumQuantity The maximum number of cards that can be selected for a valid refresh interaction
   *
   * 刷新数量上限: 选择卡牌数量上限，满足数量才可进行合法的刷新交互
   * @param defaultReturnSelection If the Deck Selector times out, has no interaction, or closes abnormally, force-assign this configured resultThe length of this Result List must match the valid card selection count
   *
   * 默认返回选择: 如果卡牌选择器超时/未交互/卡牌选择器异常关闭等情况，支持强制赋予配置的该结果该结果的列表长度，需要和合法选择卡牌数量一致
   */
  invokeDeckSelector(
    targetPlayer: PlayerEntity,
    deckSelectorId: IntValue,
    selectDuration: FloatValue,
    selectResultCorrespondingList: IntValue[],
    selectDisplayCorrespondingList: IntValue[],
    selectMinimumQuantity: IntValue,
    selectMaximumQuantity: IntValue,
    refreshMode: DecisionRefreshMode,
    refreshMinimumQuantity: IntValue,
    refreshMaximumQuantity: IntValue,
    defaultReturnSelection: IntValue[]
  ): void {
    const targetPlayerObj = parseValue(targetPlayer, 'entity')
    const deckSelectorIdObj = parseValue(deckSelectorId, 'int')
    const selectDurationObj = parseValue(selectDuration, 'float')
    const selectResultCorrespondingListObj = parseValue(selectResultCorrespondingList, 'int_list')
    const selectDisplayCorrespondingListObj = parseValue(selectDisplayCorrespondingList, 'int_list')
    const selectMinimumQuantityObj = parseValue(selectMinimumQuantity, 'int')
    const selectMaximumQuantityObj = parseValue(selectMaximumQuantity, 'int')
    const refreshModeObj = parseValue(refreshMode, 'enumeration')
    const refreshMinimumQuantityObj = parseValue(refreshMinimumQuantity, 'int')
    const refreshMaximumQuantityObj = parseValue(refreshMaximumQuantity, 'int')
    const defaultReturnSelectionObj = parseValue(defaultReturnSelection, 'int_list')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'invoke_deck_selector',
      args: [
        targetPlayerObj,
        deckSelectorIdObj,
        selectDurationObj,
        selectResultCorrespondingListObj,
        selectDisplayCorrespondingListObj,
        selectMinimumQuantityObj,
        selectMaximumQuantityObj,
        refreshModeObj,
        refreshMinimumQuantityObj,
        refreshMaximumQuantityObj,
        defaultReturnSelectionObj
      ]
    })
  }

  /**
   * Randomly sort the input List
   *
   * 随机卡牌选择器选择列表: 将输入的列表进行随机排序
   *
   * @param list
   *
   * 列表
   */
  randomDeckSelectorSelectionList(list: IntValue[]): void {
    const listObj = parseValue(list, 'int_list')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'random_deck_selector_selection_list',
      args: [listObj]
    })
  }

  /**
   * Set Player Settlement Success Status
   *
   * 设置玩家结算成功状态: 设置玩家结算成功状态
   *
   * @param playerEntity
   *
   * 玩家实体
   * @param settlementStatus Three types: Undefined, Victory, Defeat
   *
   * 结算状态: 分为未定、胜利、失败三种
   */
  setPlayerSettlementSuccessStatus(
    playerEntity: PlayerEntity,
    settlementStatus: SettlementStatus
  ): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const settlementStatusObj = parseValue(settlementStatus, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_player_settlement_success_status',
      args: [playerEntityObj, settlementStatusObj]
    })
  }

  /**
   * Set the Player's Scoreboard display data, which is shown on the Scoreboard after Stage Settlement. Since this node involves the display of external functions, [Data Value] and [Data Name] currently support multilingual translation only when manually entering text. If entered via connection input, multilingual translation is not supported.
   *
   * 设置玩家结算计分板展示数据: 设置玩家结算计分板展示数据，显示在关卡结算后弹出的计分板内。由于该节点涉及了局外功能的显示，故【数据值】和【数据名称】目前仅在手动输入文本的时候支持多语言翻译，若为连线输入，则不支持多语言翻译
   *
   * @param setEntity Active Player Entity
   *
   * 设置实体: 生效的玩家实体
   * @param dataOrder The sort order of this data
   *
   * 数据顺序: 该数据的排序
   * @param dataName The name of this data
   *
   * 数据名称: 该数据的名称
   * @param dataValue The value of this data. Supports Integer, Floating Point Number, and String
   *
   * 数据值: 该数据的值，支持整数、浮点数、字符串
   */
  setPlayerSettlementScoreboardDataDisplay(
    setEntity: PlayerEntity,
    dataOrder: IntValue,
    dataName: StrValue,
    dataValue: FloatValue
  ): void
  setPlayerSettlementScoreboardDataDisplay(
    setEntity: PlayerEntity,
    dataOrder: IntValue,
    dataName: StrValue,
    dataValue: IntValue
  ): void
  setPlayerSettlementScoreboardDataDisplay(
    setEntity: PlayerEntity,
    dataOrder: IntValue,
    dataName: StrValue,
    dataValue: StrValue
  ): void
  setPlayerSettlementScoreboardDataDisplay<T extends 'float' | 'int' | 'str'>(
    setEntity: PlayerEntity,
    dataOrder: IntValue,
    dataName: StrValue,
    dataValue: RuntimeParameterValueTypeMap[T]
  ): void {
    const genericType = matchTypes(['float', 'int', 'str'], dataValue)
    const setEntityObj = parseValue(setEntity, 'entity')
    const dataOrderObj = parseValue(dataOrder, 'int')
    const dataNameObj = parseValue(dataName, 'str')
    const dataValueObj = parseValue(dataValue, genericType)
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_player_settlement_scoreboard_data_display',
      args: [setEntityObj, dataOrderObj, dataNameObj, dataValueObj]
    })
  }

  /**
   * Set the Player's ranking value after Settlement, then determine the final ranking order according to [Ranking Value Comparison Order] in [Stage Settings] – [Settlement]
   *
   * 设置玩家结算排名数值: 设置玩家结算后的排名数值，再按照【关卡设置】-【结算】中的【排名数值比较顺序】的设置来决定最终的排名顺序
   *
   * @param playerEntity
   *
   * 玩家实体
   * @param rankingValue
   *
   * 排名数值
   */
  setPlayerSettlementRankingValue(playerEntity: PlayerEntity, rankingValue: IntValue): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const rankingValueObj = parseValue(rankingValue, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_player_settlement_ranking_value',
      args: [playerEntityObj, rankingValueObj]
    })
  }

  /**
   * Set Faction Settlement Success Status
   *
   * 设置阵营结算成功状态: 设置阵营结算成功状态
   *
   * @param faction Active Faction Entity
   *
   * 阵营: 生效的阵营实体
   * @param settlementStatus Three types: Undefined, Victory, Defeat
   *
   * 结算状态: 分为未定、胜利、失败三种
   */
  setFactionSettlementSuccessStatus(
    faction: FactionValue,
    settlementStatus: SettlementStatus
  ): void {
    const factionObj = parseValue(faction, 'faction')
    const settlementStatusObj = parseValue(settlementStatus, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_faction_settlement_success_status',
      args: [factionObj, settlementStatusObj]
    })
  }

  /**
   * Set the faction's ranking value after Settlement, then determine the final ranking order according to [Ranking Value Comparison Order] in [Stage Settings] – [Settlement]
   *
   * 设置阵营结算排名数值: 设置阵营结算后的排名数值，再按照【关卡设置】-【结算】中的【排名数值比较顺序】的设置来决定最终的排名顺序
   *
   * @param faction Active Faction Entity
   *
   * 阵营: 生效的阵营实体
   * @param rankingValue
   *
   * 排名数值
   */
  setFactionSettlementRankingValue(faction: FactionValue, rankingValue: IntValue): void {
    const factionObj = parseValue(faction, 'faction')
    const rankingValueObj = parseValue(rankingValue, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_faction_settlement_ranking_value',
      args: [factionObj, rankingValueObj]
    })
  }

  /**
   * Adjust the Light Source state at the specified ID in the Light Source Component on the Target Entity
   *
   * 开关实体光源: 调整指定目标实体上的光源组件对应序号的光源状态
   *
   * @param targetEntity
   *
   * 目标实体
   * @param lightSourceId
   *
   * 光源序号
   * @param enableOrDisable If set to True, turns On
   *
   * 打开或关闭: “是”为打开
   */
  toggleEntityLightSource(
    targetEntity: EntityValue,
    lightSourceId: IntValue,
    enableOrDisable: BoolValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const lightSourceIdObj = parseValue(lightSourceId, 'int')
    const enableOrDisableObj = parseValue(enableOrDisable, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'toggle_entity_light_source',
      args: [targetEntityObj, lightSourceIdObj, enableOrDisableObj]
    })
  }

  /**
   * Add a Key-Value Pair to the specified Dictionary
   *
   * 对字典设置或新增键值对: 为指定字典新增一个键值对
   *
   * @param dictionary
   *
   * 字典
   * @param key
   *
   * 键
   * @param value
   *
   * 值
   */
  setOrAddKeyValuePairsToDictionary<K extends DictKeyType, V extends DictValueType>(
    dictionary: dict<K, V>,
    key: RuntimeParameterValueTypeMap[K],
    value: RuntimeParameterValueTypeMap[V]
  ) {
    const dictionaryObj = parseValue(dictionary, 'dict')
    const keyObj = parseValue(key, dictionaryObj.getKeyType())
    const valueObj = parseValue(value, dictionaryObj.getValueType())
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_or_add_key_value_pairs_to_dictionary',
      args: [dictionaryObj, keyObj, valueObj]
    })
  }

  /**
   * Clear all Key-Value Pairs from the specified Dictionary
   *
   * 清空字典: 清空指定字典的键值对
   *
   * @param dictionary
   *
   * 字典
   */
  clearDictionary<K extends DictKeyType, V extends DictValueType>(dictionary: dict<K, V>) {
    const dictionaryObj = parseValue(dictionary, 'dict')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'clear_dictionary',
      args: [dictionaryObj]
    })
  }

  /**
   * Remove Key-Value Pairs from the specified Dictionary by key
   *
   * 以键对字典移除键值对: 以键移除指定字典中的键值对
   *
   * @param dictionary
   *
   * 字典
   * @param key
   *
   * 键
   */
  removeKeyValuePairsFromDictionaryByKey<K extends DictKeyType, V extends DictValueType>(
    dictionary: dict<K, V>,
    key: RuntimeParameterValueTypeMap[K]
  ) {
    const dictionaryObj = parseValue(dictionary, 'dict')
    const keyObj = parseValue(key, dictionaryObj.getKeyType())
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'remove_key_value_pairs_from_dictionary_by_key',
      args: [dictionaryObj, keyObj]
    })
  }

  /**
   * After selecting a Structure, you can edit each parameter of that Structure
   *
   * 修改结构体: 在选定结构体后，可以修改该结构体的每个参数
   */
  modifyStructure(): void {
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_structure',
      args: []
    })
  }

  /**
   * Remove items from the inventory shop's sales list
   *
   * 从背包商店出售表中移除商品: 从背包商店出售表中移除商品
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param itemConfigId
   *
   * 道具配置ID
   */
  removeItemFromInventoryShopSalesList(
    shopOwnerEntity: EntityValue,
    shopId: IntValue,
    itemConfigId: ConfigIdValue
  ): void {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const itemConfigIdObj = parseValue(itemConfigId, 'config_id')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'remove_item_from_inventory_shop_sales_list',
      args: [shopOwnerEntityObj, shopIdObj, itemConfigIdObj]
    })
  }

  /**
   * Remove items from the purchase list
   *
   * 从物品收购表中移除物品: 从物品收购表中移除物品
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemConfigId
   *
   * 商品道具配置ID
   */
  removeItemFromPurchaseList(
    shopOwnerEntity: EntityValue,
    shopId: IntValue,
    shopItemConfigId: ConfigIdValue
  ): void {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const shopItemConfigIdObj = parseValue(shopItemConfigId, 'config_id')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'remove_item_from_purchase_list',
      args: [shopOwnerEntityObj, shopIdObj, shopItemConfigIdObj]
    })
  }

  /**
   * Remove items from the custom shop's sales list
   *
   * 从自定义商店出售表中移除商品: 从自定义商店出售表中移除商品
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemId
   *
   * 商品序号
   */
  removeItemFromCustomShopSalesList(
    shopOwnerEntity: EntityValue,
    shopId: IntValue,
    shopItemId: IntValue
  ): void {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const shopItemIdObj = parseValue(shopItemId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'remove_item_from_custom_shop_sales_list',
      args: [shopOwnerEntityObj, shopIdObj, shopItemIdObj]
    })
  }

  /**
   * Open the Shop from the Player Entity's perspective during gameplay
   *
   * 打开商店: 在游戏运行过程中以玩家实体的视角打开商店
   *
   * @param playerEntity
   *
   * 玩家实体
   * @param shopOwnerEntity The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店归属者实体: 商店归属者实体的商店组件对应的商店序号
   * @param shopId
   *
   * 商店序号
   */
  openShop(playerEntity: PlayerEntity, shopOwnerEntity: EntityValue, shopId: IntValue): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'open_shop',
      args: [playerEntityObj, shopOwnerEntityObj, shopIdObj]
    })
  }

  /**
   * Close all open Shops from the Player Entity's perspective during gameplay
   *
   * 关闭商店: 在游戏运行过程中以玩家实体的视角关闭所有已打开的商店
   *
   * @param playerEntity
   *
   * 玩家实体
   */
  closeShop(playerEntity: PlayerEntity): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'close_shop',
      args: [playerEntityObj]
    })
  }

  /**
   * Add new items to the inventory shop's sales list
   *
   * 向背包商店出售表中新增商品: 向背包商店出售表中新增商品
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemConfigId
   *
   * 商品道具配置ID
   * @param sellCurrencyDictionary
   *
   * 出售货币字典
   * @param affiliatedTabId 1 Equipment, 2 Consumables, 3 Materials, 4 Valuables
   *
   * 所属页签序号: 1装备、2消耗品、3材料、4贵重物品
   * @param sortPriority
   *
   * 排序优先级
   * @param canBeSold
   *
   * 是否可出售
   */
  addNewItemToInventoryShopSalesList(
    shopOwnerEntity: EntityValue,
    shopId: IntValue,
    shopItemConfigId: ConfigIdValue,
    sellCurrencyDictionary: dict<'config_id', 'int'>,
    affiliatedTabId: IntValue,
    sortPriority: IntValue,
    canBeSold: BoolValue
  ): void {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const shopItemConfigIdObj = parseValue(shopItemConfigId, 'config_id')
    const sellCurrencyDictionaryObj = parseValue(sellCurrencyDictionary, 'dict')
    const affiliatedTabIdObj = parseValue(affiliatedTabId, 'int')
    const sortPriorityObj = parseValue(sortPriority, 'int')
    const canBeSoldObj = parseValue(canBeSold, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'add_new_item_to_inventory_shop_sales_list',
      args: [
        shopOwnerEntityObj,
        shopIdObj,
        shopItemConfigIdObj,
        sellCurrencyDictionaryObj,
        affiliatedTabIdObj,
        sortPriorityObj,
        canBeSoldObj
      ]
    })
  }

  /**
   * Add New Items to the Item Purchase List
   *
   * 向物品收购表中新增物品: 向物品收购表中新增物品
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemConfigId
   *
   * 商品道具配置ID
   * @param purchaseCurrencyDictionary
   *
   * 收购货币字典
   * @param purchasable
   *
   * 是否可收购
   */
  addItemsToThePurchaseList(
    shopOwnerEntity: EntityValue,
    shopId: IntValue,
    shopItemConfigId: ConfigIdValue,
    purchaseCurrencyDictionary: dict<'config_id', 'int'>,
    purchasable: BoolValue
  ): void {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const shopItemConfigIdObj = parseValue(shopItemConfigId, 'config_id')
    const purchaseCurrencyDictionaryObj = parseValue(purchaseCurrencyDictionary, 'dict')
    const purchasableObj = parseValue(purchasable, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'add_items_to_the_purchase_list',
      args: [
        shopOwnerEntityObj,
        shopIdObj,
        shopItemConfigIdObj,
        purchaseCurrencyDictionaryObj,
        purchasableObj
      ]
    })
  }

  /**
   * Add items to the Custom Shop Sales List. Upon success, an Integer ID is generated in the Output Parameter as the item identifier
   *
   * 向自定义商店出售表中新增商品: 向自定义商店出售表中新增商品，新增成功后出参会生成一个整数型索引作为该商品的标识
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemConfigId
   *
   * 商品道具配置ID
   * @param sellCurrencyDictionary
   *
   * 出售货币字典
   * @param affiliatedTabId 1 Equipment, 2 Consumables, 3 Materials, 4 Valuables
   *
   * 所属页签序号: 1装备、2消耗品、3材料、4贵重物品
   * @param limitPurchase
   *
   * 是否限购
   * @param purchaseLimit
   *
   * 限购数量
   * @param sortPriority
   *
   * 排序优先级
   * @param canBeSold
   *
   * 是否可出售
   *
   * @returns
   *
   * 商品索引
   */
  addNewItemToCustomShopSalesList(
    shopOwnerEntity: EntityValue,
    shopId: IntValue,
    shopItemConfigId: ConfigIdValue,
    sellCurrencyDictionary: dict<'config_id', 'int'>,
    affiliatedTabId: IntValue,
    limitPurchase: BoolValue,
    purchaseLimit: IntValue,
    sortPriority: IntValue,
    canBeSold: BoolValue
  ): bigint {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const shopItemConfigIdObj = parseValue(shopItemConfigId, 'config_id')
    const sellCurrencyDictionaryObj = parseValue(sellCurrencyDictionary, 'dict')
    const affiliatedTabIdObj = parseValue(affiliatedTabId, 'int')
    const limitPurchaseObj = parseValue(limitPurchase, 'bool')
    const purchaseLimitObj = parseValue(purchaseLimit, 'int')
    const sortPriorityObj = parseValue(sortPriority, 'int')
    const canBeSoldObj = parseValue(canBeSold, 'bool')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'add_new_item_to_custom_shop_sales_list',
      args: [
        shopOwnerEntityObj,
        shopIdObj,
        shopItemConfigIdObj,
        sellCurrencyDictionaryObj,
        affiliatedTabIdObj,
        limitPurchaseObj,
        purchaseLimitObj,
        sortPriorityObj,
        canBeSoldObj
      ]
    })
    const ret = new int()
    ret.markPin(ref, 'itemIndex', 0)
    return ret as unknown as bigint
  }

  /**
   * Edit sale info for inventory shop items
   *
   * 修改背包商店商品出售信息: 修改背包商店商品出售信息
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param itemConfigId
   *
   * 道具配置ID
   * @param sellCurrencyDictionary
   *
   * 出售货币字典
   * @param affiliatedTabId
   *
   * 所属页签序号
   * @param sortPriority
   *
   * 排序优先级
   * @param canBeSold
   *
   * 是否可出售
   */
  modifyInventoryShopItemSalesInfo(
    shopOwnerEntity: EntityValue,
    shopId: IntValue,
    itemConfigId: ConfigIdValue,
    sellCurrencyDictionary: dict<'config_id', 'int'>,
    affiliatedTabId: IntValue,
    sortPriority: IntValue,
    canBeSold: BoolValue
  ): void {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const itemConfigIdObj = parseValue(itemConfigId, 'config_id')
    const sellCurrencyDictionaryObj = parseValue(sellCurrencyDictionary, 'dict')
    const affiliatedTabIdObj = parseValue(affiliatedTabId, 'int')
    const sortPriorityObj = parseValue(sortPriority, 'int')
    const canBeSoldObj = parseValue(canBeSold, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_inventory_shop_item_sales_info',
      args: [
        shopOwnerEntityObj,
        shopIdObj,
        itemConfigIdObj,
        sellCurrencyDictionaryObj,
        affiliatedTabIdObj,
        sortPriorityObj,
        canBeSoldObj
      ]
    })
  }

  /**
   * Edit Item Purchase Information in the Item Purchase List
   *
   * 修改物品收购表中道具收购信息: 修改物品收购表中道具收购信息
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemConfigId
   *
   * 商品道具配置ID
   * @param purchaseCurrencyDictionary
   *
   * 收购货币字典
   * @param purchasable
   *
   * 是否可收购
   */
  modifyItemPurchaseInfoInThePurchaseList(
    shopOwnerEntity: EntityValue,
    shopId: IntValue,
    shopItemConfigId: ConfigIdValue,
    purchaseCurrencyDictionary: dict<'config_id', 'int'>,
    purchasable: BoolValue
  ): void {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const shopItemConfigIdObj = parseValue(shopItemConfigId, 'config_id')
    const purchaseCurrencyDictionaryObj = parseValue(purchaseCurrencyDictionary, 'dict')
    const purchasableObj = parseValue(purchasable, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_item_purchase_info_in_the_purchase_list',
      args: [
        shopOwnerEntityObj,
        shopIdObj,
        shopItemConfigIdObj,
        purchaseCurrencyDictionaryObj,
        purchasableObj
      ]
    })
  }

  /**
   * Edit sale info for custom shop items
   *
   * 修改自定义商店商品出售信息: 修改自定义商店商品出售信息
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemId
   *
   * 商品序号
   * @param itemConfigId
   *
   * 道具配置ID
   * @param sellCurrencyDictionary
   *
   * 出售货币字典
   * @param affiliatedTabId 1 Equipment, 2 Consumables, 3 Materials, 4 Valuables
   *
   * 所属页签序号: 1装备、2消耗品、3材料、4贵重物品
   * @param limitPurchase
   *
   * 是否限购
   * @param purchaseLimit
   *
   * 限购数量
   * @param sortPriority
   *
   * 排序优先级
   * @param canBeSold
   *
   * 是否可出售
   */
  modifyCustomShopItemSalesInfo(
    shopOwnerEntity: EntityValue,
    shopId: IntValue,
    shopItemId: IntValue,
    itemConfigId: ConfigIdValue,
    sellCurrencyDictionary: dict<'config_id', 'int'>,
    affiliatedTabId: IntValue,
    limitPurchase: BoolValue,
    purchaseLimit: IntValue,
    sortPriority: IntValue,
    canBeSold: BoolValue
  ): void {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const shopItemIdObj = parseValue(shopItemId, 'int')
    const itemConfigIdObj = parseValue(itemConfigId, 'config_id')
    const sellCurrencyDictionaryObj = parseValue(sellCurrencyDictionary, 'dict')
    const affiliatedTabIdObj = parseValue(affiliatedTabId, 'int')
    const limitPurchaseObj = parseValue(limitPurchase, 'bool')
    const purchaseLimitObj = parseValue(purchaseLimit, 'int')
    const sortPriorityObj = parseValue(sortPriority, 'int')
    const canBeSoldObj = parseValue(canBeSold, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_custom_shop_item_sales_info',
      args: [
        shopOwnerEntityObj,
        shopIdObj,
        shopItemIdObj,
        itemConfigIdObj,
        sellCurrencyDictionaryObj,
        affiliatedTabIdObj,
        limitPurchaseObj,
        purchaseLimitObj,
        sortPriorityObj,
        canBeSoldObj
      ]
    })
  }

  /**
   * Edit the value of the specified Affix on the Equipment instance
   *
   * 修改装备词条值: 修改指定装备实例对应词条上的值
   *
   * @param equipmentIndex Integer ID generated during Equipment Initialization to identify the equipment instance
   *
   * 装备索引: 【装备初始化】时生成的整数型索引来标识该装备实例
   * @param affixId
   *
   * 词条序号
   * @param affixValue
   *
   * 词条数值
   */
  modifyEquipmentAffixValue(
    equipmentIndex: IntValue,
    affixId: IntValue,
    affixValue: FloatValue
  ): void {
    const equipmentIndexObj = parseValue(equipmentIndex, 'int')
    const affixIdObj = parseValue(affixId, 'int')
    const affixValueObj = parseValue(affixValue, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_equipment_affix_value',
      args: [equipmentIndexObj, affixIdObj, affixValueObj]
    })
  }

  /**
   * Remove the specified Affix from the Equipment instance
   *
   * 移除装备词条: 移除指定装备实例的对应词条
   *
   * @param equipmentId Integer ID generated during Equipment Initialization to identify the equipment instance
   *
   * 装备索引: 【装备初始化】时生成的整数型索引来标识该装备实例
   * @param affixId
   *
   * 词条序号
   */
  removeEquipmentAffix(equipmentId: IntValue, affixId: IntValue): void {
    const equipmentIdObj = parseValue(equipmentId, 'int')
    const affixIdObj = parseValue(affixId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'remove_equipment_affix',
      args: [equipmentIdObj, affixIdObj]
    })
  }

  /**
   * Add a preconfigured Affix to the specified Equipment instance, with the option to overwrite the Affix value
   *
   * 装备添加词条: 对指定装备实例添加一条预先配置好的词条，可以覆写词条的数值
   *
   * @param equipmentId Integer ID generated during Equipment Initialization to identify the equipment instance
   *
   * 装备索引: 【装备初始化】时生成的整数型索引来标识该装备实例
   * @param affixConfigId The Config ID of the preconfigured Affix defined in Equipment Data Management
   *
   * 词条配置ID: 装备数据管理中预先配置好的词条的对应配置ID
   * @param overwriteAffixValue
   *
   * 是否覆写词条值
   * @param affixValue Can overwrite the value on a pre-configured Affix
   *
   * 词条数值: 可以覆写预先配置好的词条上的数值
   */
  addAffixToEquipment(
    equipmentId: IntValue,
    affixConfigId: ConfigIdValue,
    overwriteAffixValue: BoolValue,
    affixValue: FloatValue
  ): void {
    const equipmentIdObj = parseValue(equipmentId, 'int')
    const affixConfigIdObj = parseValue(affixConfigId, 'config_id')
    const overwriteAffixValueObj = parseValue(overwriteAffixValue, 'bool')
    const affixValueObj = parseValue(affixValue, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'add_affix_to_equipment',
      args: [equipmentIdObj, affixConfigIdObj, overwriteAffixValueObj, affixValueObj]
    })
  }

  /**
   * Add a preconfigured Affix at the specified Affix ID on the Equipment instance, with the option to overwrite the Affix value
   *
   * 装备指定序号添加词条: 对指定装备实例的指定词条序号位置添加预先配置好的词条，可以覆写词条的数值
   *
   * @param equipmentId Integer ID generated during Equipment Initialization to identify the equipment instance
   *
   * 装备索引: 【装备初始化】时生成的整数型索引来标识该装备实例
   * @param affixConfigId The Config ID of the preconfigured Affix defined in Equipment Data Management
   *
   * 词条配置ID: 装备数据管理中预先配置好的词条的对应配置ID
   * @param insertId
   *
   * 插入序号
   * @param overwriteAffixValue
   *
   * 是否覆写词条值
   * @param affixValue Can overwrite the value on a pre-configured Affix
   *
   * 词条数值: 可以覆写预先配置好的词条上的数值
   */
  addAffixToEquipmentAtSpecifiedId(
    equipmentId: IntValue,
    affixConfigId: ConfigIdValue,
    insertId: IntValue,
    overwriteAffixValue: BoolValue,
    affixValue: FloatValue
  ): void {
    const equipmentIdObj = parseValue(equipmentId, 'int')
    const affixConfigIdObj = parseValue(affixConfigId, 'config_id')
    const insertIdObj = parseValue(insertId, 'int')
    const overwriteAffixValueObj = parseValue(overwriteAffixValue, 'bool')
    const affixValueObj = parseValue(affixValue, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'add_affix_to_equipment_at_specified_id',
      args: [equipmentIdObj, affixConfigIdObj, insertIdObj, overwriteAffixValueObj, affixValueObj]
    })
  }

  /**
   * Replaces the specified equipment in the corresponding equipment slot of the target entity. If the equipment is
   * already equipped in the equipment slot, the replacement will not take effect. If the target slot already
   * contains an equipped item, that item will be replaced.
   *
   * 替换装备到指定栏位: 将指定装备替换到目标实体的指定装备栏位。若该装备已在该栏位，则不生效；若该栏位已有装备，则会被替换
   *
   * @param targetEntity
   *
   * 目标实体
   * @param equipmentRow
   *
   * 装备栏位行
   * @param equipmentColumn
   *
   * 装备栏位列
   * @param equipmentIndex The equipment instance is identified by an integer index generated during equipment initialization
   *
   * 装备索引: 通过装备初始化时生成的整数索引标识装备实例
   */
  replaceEquipmentToTheSpecifiedSlot(
    targetEntity: EntityValue,
    equipmentRow: IntValue,
    equipmentColumn: IntValue,
    equipmentIndex: IntValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const equipmentRowObj = parseValue(equipmentRow, 'int')
    const equipmentColumnObj = parseValue(equipmentColumn, 'int')
    const equipmentIndexObj = parseValue(equipmentIndex, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'replace_equipment_to_the_specified_slot',
      args: [targetEntityObj, equipmentRowObj, equipmentColumnObj, equipmentIndexObj]
    })
  }

  /**
   * Configure the Inventory Item drop data in Dictionary format, and specify the Drop Type
   *
   * 设置背包道具掉落内容: 以字典形式设置背包道具掉落内容，并可以设置掉落类型
   *
   * @param inventoryOwnerEntity
   *
   * 背包持有者实体
   * @param itemDropDictionary
   *
   * 道具掉落字典
   * @param lootType Types: Shared Reward (one share for all), Individualized Reward (one share per person)
   *
   * 掉落类型: 分为全员一份、每人一份
   */
  setInventoryItemDropContents(
    inventoryOwnerEntity: EntityValue,
    itemDropDictionary: dict<'config_id', 'int'>,
    lootType: ItemLootType
  ): void {
    const inventoryOwnerEntityObj = parseValue(inventoryOwnerEntity, 'entity')
    const itemDropDictionaryObj = parseValue(itemDropDictionary, 'dict')
    const lootTypeObj = parseValue(lootType, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_inventory_item_drop_contents',
      args: [inventoryOwnerEntityObj, itemDropDictionaryObj, lootTypeObj]
    })
  }

  /**
   * Set the type and quantity of Items or Currency for the Inventory drop
   *
   * 设置背包掉落道具/货币数量: 设置背包掉落道具/货币的类型和数量
   *
   * @param inventoryOwnerEntity
   *
   * 背包持有者实体
   * @param itemCurrencyConfigId
   *
   * 道具/货币配置ID
   * @param quantityDropped
   *
   * 掉落数量
   * @param lootType Types: Shared Reward (one share for all), Individualized Reward (one share per person)
   *
   * 掉落类型: 分为全员一份、每人一份
   */
  setInventoryDropItemsCurrencyAmount(
    inventoryOwnerEntity: EntityValue,
    itemCurrencyConfigId: ConfigIdValue,
    quantityDropped: IntValue,
    lootType: ItemLootType
  ): void {
    const inventoryOwnerEntityObj = parseValue(inventoryOwnerEntity, 'entity')
    const itemCurrencyConfigIdObj = parseValue(itemCurrencyConfigId, 'config_id')
    const quantityDroppedObj = parseValue(quantityDropped, 'int')
    const lootTypeObj = parseValue(lootType, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_inventory_drop_items_currency_amount',
      args: [inventoryOwnerEntityObj, itemCurrencyConfigIdObj, quantityDroppedObj, lootTypeObj]
    })
  }

  /**
   * Triggers a loot drop for the dropper entity, with configurable loot type.
   *
   * 触发战利品掉落: 对掉落者实体触发一次战利品掉落，可设置其掉落类型
   *
   * @param dropperEntity
   *
   * 掉落者实体
   * @param lootType Types: Shared Reward (one share for all), Individualized Reward (one share per person)
   *
   * 掉落类型: 分为全员一份、每人一份
   */
  triggerLootDrop(dropperEntity: EntityValue, lootType: ItemLootType): void {
    const dropperEntityObj = parseValue(dropperEntity, 'entity')
    const lootTypeObj = parseValue(lootType, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'trigger_loot_drop',
      args: [dropperEntityObj, lootTypeObj]
    })
  }

  /**
   * Configure the Loot drop data in the Loot Component on the Dropper Entity in Dictionary format
   *
   * 设置战利品掉落内容: 以字典形式设置掉落者实体上战利品组件中战利品的掉落内容
   *
   * @param dropperEntity
   *
   * 掉落者实体
   * @param lootDropDictionary
   *
   * 战利品掉落字典
   */
  setLootDropContent(
    dropperEntity: EntityValue,
    lootDropDictionary: dict<'config_id', 'int'>
  ): void {
    const dropperEntityObj = parseValue(dropperEntity, 'entity')
    const lootDropDictionaryObj = parseValue(lootDropDictionary, 'dict')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_loot_drop_content',
      args: [dropperEntityObj, lootDropDictionaryObj]
    })
  }

  /**
   * Edit the quantity of the specified Item in the Inventory
   *
   * 修改背包道具数量: 修改背包内指定道具的数量
   *
   * @param inventoryOwnerEntity
   *
   * 背包持有者实体
   * @param itemConfigId
   *
   * 道具配置ID
   * @param changeValue New Value = Original Value + Change Value
   *
   * 变更值: 变更后的值=变更前的值+变更值
   */
  modifyInventoryItemQuantity(
    inventoryOwnerEntity: EntityValue,
    itemConfigId: ConfigIdValue,
    changeValue: IntValue
  ): void {
    const inventoryOwnerEntityObj = parseValue(inventoryOwnerEntity, 'entity')
    const itemConfigIdObj = parseValue(itemConfigId, 'config_id')
    const changeValueObj = parseValue(changeValue, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_inventory_item_quantity',
      args: [inventoryOwnerEntityObj, itemConfigIdObj, changeValueObj]
    })
  }

  /**
   * Edit the amount of the specified Currency in the Inventory
   *
   * 修改背包货币数量: 修改背包内指定货币的数量
   *
   * @param inventoryOwnerEntity
   *
   * 背包持有者实体
   * @param currencyConfigId
   *
   * 货币配置ID
   * @param changeValue New Value = Original Value + Change Value
   *
   * 变更值: 变更后的值=变更前的值+变更值
   */
  modifyInventoryCurrencyQuantity(
    inventoryOwnerEntity: EntityValue,
    currencyConfigId: ConfigIdValue,
    changeValue: IntValue
  ): void {
    const inventoryOwnerEntityObj = parseValue(inventoryOwnerEntity, 'entity')
    const currencyConfigIdObj = parseValue(currencyConfigId, 'config_id')
    const changeValueObj = parseValue(changeValue, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_inventory_currency_quantity',
      args: [inventoryOwnerEntityObj, currencyConfigIdObj, changeValueObj]
    })
  }

  /**
   * Edit the quantity of the specified Item in the Loot Component on the Loot Prefab
   *
   * 修改掉落物组件道具数量: 修改掉落物元件上掉落物组件内指定道具的数量
   *
   * @param lootEntity
   *
   * 掉落物实体
   * @param itemConfigId
   *
   * 道具配置ID
   * @param changeValue New Value = Original Value + Change Value
   *
   * 变更值: 变更后的值=变更前的值+变更值
   */
  modifyLootItemComponentQuantity(
    lootEntity: EntityValue,
    itemConfigId: ConfigIdValue,
    changeValue: IntValue
  ): void {
    const lootEntityObj = parseValue(lootEntity, 'entity')
    const itemConfigIdObj = parseValue(itemConfigId, 'config_id')
    const changeValueObj = parseValue(changeValue, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_loot_item_component_quantity',
      args: [lootEntityObj, itemConfigIdObj, changeValueObj]
    })
  }

  /**
   * Edit the amount of the specified Currency in the Loot Component on the Loot Prefab
   *
   * 修改掉落物组件货币数量: 修改掉落物元件上掉落物组件内指定货币的数量
   *
   * @param lootEntity
   *
   * 掉落物实体
   * @param currencyConfigId
   *
   * 货币配置ID
   * @param changeValue New Value = Original Value + Change Value
   *
   * 变更值: 变更后的值=变更前的值+变更值
   */
  modifyLootComponentCurrencyAmount(
    lootEntity: EntityValue,
    currencyConfigId: ConfigIdValue,
    changeValue: IntValue
  ): void {
    const lootEntityObj = parseValue(lootEntity, 'entity')
    const currencyConfigIdObj = parseValue(currencyConfigId, 'config_id')
    const changeValueObj = parseValue(changeValue, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_loot_component_currency_amount',
      args: [lootEntityObj, currencyConfigIdObj, changeValueObj]
    })
  }

  /**
   * Increase the maximum Inventory capacity of the specified Inventory Owner
   *
   * 增加背包最大容量: 增加指定背包持有者的背包最大容量
   *
   * @param inventoryOwnerEntity
   *
   * 背包持有者实体
   * @param increaseCapacity
   *
   * 增加容量
   */
  increaseMaximumInventoryCapacity(
    inventoryOwnerEntity: EntityValue,
    increaseCapacity: IntValue
  ): void {
    const inventoryOwnerEntityObj = parseValue(inventoryOwnerEntity, 'entity')
    const increaseCapacityObj = parseValue(increaseCapacity, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'increase_maximum_inventory_capacity',
      args: [inventoryOwnerEntityObj, increaseCapacityObj]
    })
  }

  /**
   * The mini-map marker at the specified ID in the Target Entity's Mini-map Marker Component is visible to all Players in the Player List
   *
   * 修改可见小地图标识的玩家列表: 目标实体的小地图标识组件上对应序号的小地图标识对玩家列表中的玩家可见
   *
   * @param targetEntity Entity that owns the Mini-map Marker component to be edited
   *
   * 目标实体: 要修改的小地图标识组件归属的实体
   * @param miniMapMarkerId ID of the specified Mini-map Marker to be edited
   *
   * 小地图标识序号: 要修改的指定小地图标识的序号
   * @param playerList The specified Mini-map ID on the Target Entity, visible only to the Player providing input
   *
   * 玩家列表: 目标实体的指定小地图序号，只有输入玩家可见
   */
  modifyPlayerListForVisibleMiniMapMarkers(
    targetEntity: EntityValue,
    miniMapMarkerId: IntValue,
    playerList: PlayerEntity[]
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const miniMapMarkerIdObj = parseValue(miniMapMarkerId, 'int')
    const playerListObj = parseValue(playerList, 'entity_list')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_player_list_for_visible_mini_map_markers',
      args: [targetEntityObj, miniMapMarkerIdObj, playerListObj]
    })
  }

  /**
   * When the Player Marker option is selected and a corresponding Player Entity is linked in the Node Graph, the Target Entity's display on the mini-map changes to that Player's avatar
   *
   * 修改小地图标识的玩家标记: 若小地图标识选择了玩家标记，在节点图输入对应玩家实体后，目标实体在小地图上的显示会变成输入玩家实体的头像
   *
   * @param targetEntity Entity that owns the Mini-map Marker component to be edited
   *
   * 目标实体: 要修改的小地图标识组件归属的实体
   * @param miniMapMarkerId ID of the specified Mini-map Marker to be edited
   *
   * 小地图标识序号: 要修改的指定小地图标识的序号
   * @param correspondingPlayerEntity Changes the avatar of the corresponding Player Entity
   *
   * 对应玩家实体: 修改后为对应玩家实体的头像
   */
  modifyPlayerMarkersOnTheMiniMap(
    targetEntity: EntityValue,
    miniMapMarkerId: IntValue,
    correspondingPlayerEntity: PlayerEntity
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const miniMapMarkerIdObj = parseValue(miniMapMarkerId, 'int')
    const correspondingPlayerEntityObj = parseValue(correspondingPlayerEntity, 'entity')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_player_markers_on_the_mini_map',
      args: [targetEntityObj, miniMapMarkerIdObj, correspondingPlayerEntityObj]
    })
  }

  /**
   * Edit the active state of mini-map markers on the Target Entity in batches using the input list of Mini-map Marker IDs
   *
   * 修改小地图标识生效状态: 通过节点输入的小地图标识序号列表，批量修改目标实体的小地图标识生效状态
   *
   * @param targetEntity Entity that owns the Mini-map Marker component to be edited
   *
   * 目标实体: 要修改的小地图标识组件归属的实体
   * @param miniMapMarkerIdList List of Mini-map Marker IDs to be set to the specified statusUnconfigured Mini-map Markers will be set to the opposite status
   *
   * 小地图标识序号列表: 需要指定状态的小地图标识序号列表未配置的小地图标识会改为相反状态
   * @param active If input is True,the Mini-map Markers corresponding to the specified ID numbers in the input list will be set to EnabledFor IDs not in the input list, the corresponding Mini-map Markers will be set to Disabled
   *
   * 是否生效: 若输入为“是”，输入序号列表指定的序号，对应小地图标识状态改为生效状态不在序号列表中的序号，对应小地图标识状态改为不生效状态
   */
  modifyMiniMapMarkerActivationStatus(
    targetEntity: EntityValue,
    miniMapMarkerIdList: IntValue[],
    active: BoolValue
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const miniMapMarkerIdListObj = parseValue(miniMapMarkerIdList, 'int_list')
    const activeObj = parseValue(active, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_mini_map_marker_activation_status',
      args: [targetEntityObj, miniMapMarkerIdListObj, activeObj]
    })
  }

  /**
   * Edit the map scale of the Target Player's mini-map UI control
   *
   * 修改小地图缩放: 修改目标玩家的小地图界面控件的地图比例
   *
   * @param targetPlayer
   *
   * 目标玩家
   * @param zoomDimensions
   *
   * 缩放尺寸
   */
  modifyMiniMapZoom(targetPlayer: PlayerEntity, zoomDimensions: FloatValue): void {
    const targetPlayerObj = parseValue(targetPlayer, 'entity')
    const zoomDimensionsObj = parseValue(zoomDimensions, 'float')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_mini_map_zoom',
      args: [targetPlayerObj, zoomDimensionsObj]
    })
  }

  /**
   * Set the mini-map marker at the specified ID on the Target Entity to Tracking Display for the input Player
   *
   * 修改追踪小地图标识的玩家列表: 将目标实体的对应序号的小地图标识对入参玩家修改为追踪表现
   *
   * @param targetEntity
   *
   * 目标实体
   * @param miniMapMarkerId
   *
   * 小地图标识序号
   * @param playerList
   *
   * 玩家列表
   */
  modifyPlayerListForTrackingMiniMapMarkers(
    targetEntity: EntityValue,
    miniMapMarkerId: IntValue,
    playerList: PlayerEntity[]
  ): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const miniMapMarkerIdObj = parseValue(miniMapMarkerId, 'int')
    const playerListObj = parseValue(playerList, 'entity_list')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_player_list_for_tracking_mini_map_markers',
      args: [targetEntityObj, miniMapMarkerIdObj, playerListObj]
    })
  }

  /**
   * Immediately switch the patrol template for the Creation and move according to the new template
   *
   * 切换造物巡逻模板: 造物切换的巡逻模板即刻切换，并按照新的巡逻模板进行移动
   *
   * @param creationEntity
   *
   * 造物实体
   * @param patrolTemplateId
   *
   * 巡逻模板序号
   */
  switchCreationPatrolTemplate(creationEntity: CreationEntity, patrolTemplateId: IntValue): void {
    const creationEntityObj = parseValue(creationEntity, 'entity')
    const patrolTemplateIdObj = parseValue(patrolTemplateId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'switch_creation_patrol_template',
      args: [creationEntityObj, patrolTemplateIdObj]
    })
  }

  /**
   * Set Player Leaderboard Score (Float)
   *
   * 以浮点数设置玩家排行榜分数: 以浮点数设置玩家排行榜分数
   *
   * @param playerIdList
   *
   * 玩家序号列表
   * @param leaderboardScore
   *
   * 排行榜分数
   * @param leaderboardId The ID corresponding to the specified Leaderboard in Peripheral System management
   *
   * 排行榜序号: 外围系统管理中指定排行榜对应的序号
   */
  setPlayerLeaderboardScoreAsAFloat(
    playerIdList: IntValue[],
    leaderboardScore: FloatValue,
    leaderboardId: IntValue
  ): void {
    const playerIdListObj = parseValue(playerIdList, 'int_list')
    const leaderboardScoreObj = parseValue(leaderboardScore, 'float')
    const leaderboardIdObj = parseValue(leaderboardId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_player_leaderboard_score_as_a_float',
      args: [playerIdListObj, leaderboardScoreObj, leaderboardIdObj]
    })
  }

  /**
   * Set Player Leaderboard Score (Integer)
   *
   * 以整数设置玩家排行榜分数: 以整数设置玩家排行榜分数
   *
   * @param playerIdList
   *
   * 玩家序号列表
   * @param leaderboardScore
   *
   * 排行榜分数
   * @param leaderboardId The ID corresponding to the specified Leaderboard in Peripheral System management
   *
   * 排行榜序号: 外围系统管理中指定排行榜对应的序号
   */
  setPlayerLeaderboardScoreAsAnInteger(
    playerIdList: IntValue[],
    leaderboardScore: IntValue,
    leaderboardId: IntValue
  ): void {
    const playerIdListObj = parseValue(playerIdList, 'int_list')
    const leaderboardScoreObj = parseValue(leaderboardScore, 'int')
    const leaderboardIdObj = parseValue(leaderboardId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_player_leaderboard_score_as_an_integer',
      args: [playerIdListObj, leaderboardScoreObj, leaderboardIdObj]
    })
  }

  /**
   * Change the progress counter for the specified Achievement ID on the Target Entity
   *
   * 变更成就进度计数: 变更指定实体上对应成就序号的成就进度计数
   *
   * @param changeEntity
   *
   * 变更实体
   * @param achievementId
   *
   * 成就序号
   * @param progressTallyChangeValue New Value = Previous Value + Change Value
   *
   * 进度计数变更值: 变更后值=变更前值+变更值
   */
  changeAchievementProgressTally(
    changeEntity: EntityValue,
    achievementId: IntValue,
    progressTallyChangeValue: IntValue
  ): void {
    const changeEntityObj = parseValue(changeEntity, 'entity')
    const achievementIdObj = parseValue(achievementId, 'int')
    const progressTallyChangeValueObj = parseValue(progressTallyChangeValue, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'change_achievement_progress_tally',
      args: [changeEntityObj, achievementIdObj, progressTallyChangeValueObj]
    })
  }

  /**
   * Set the progress counter for the specified Achievement ID on the Target Entity
   *
   * 设置成就进度计数: 设置指定实体上对应成就序号的成就进度计数
   *
   * @param setEntity
   *
   * 设置实体
   * @param achievementId
   *
   * 成就序号
   * @param progressTally Sets the Progress Count to the input value
   *
   * 进度计数: 修改后的进度计数为输入的值
   */
  setAchievementProgressTally(
    setEntity: EntityValue,
    achievementId: IntValue,
    progressTally: IntValue
  ): void {
    const setEntityObj = parseValue(setEntity, 'entity')
    const achievementIdObj = parseValue(achievementId, 'int')
    const progressTallyObj = parseValue(progressTally, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_achievement_progress_tally',
      args: [setEntityObj, achievementIdObj, progressTallyObj]
    })
  }

  /**
   * Configure rules for Scan Tags. The scanning logic is executed based on the configured rules
   *
   * 设置扫描标签的规则: 设置扫描标签的规则，会以设置好的规则执行扫描标签的逻辑
   *
   * @param targetEntity
   *
   * 目标实体
   * @param ruleType Options: Prioritize View or Prioritize Distance
   *
   * 规则类型: 分为视野优先、距离优先
   */
  setScanTagRules(targetEntity: EntityValue, ruleType: ScanRuleType): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ruleTypeObj = parseValue(ruleType, 'enumeration')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_scan_tag_rules',
      args: [targetEntityObj, ruleTypeObj]
    })
  }

  /**
   * Set the Scan Tag with the specified ID in the Target Entity's Scan Tag Component to the active state
   *
   * 设置扫描组件的生效扫描标签序号: 将目标实体的扫描标签组件中对应序号的扫描标签设置为生效
   *
   * @param targetEntity
   *
   * 目标实体
   * @param scanTagId
   *
   * 扫描标签序号
   */
  setScanComponentSActiveScanTagId(targetEntity: EntityValue, scanTagId: IntValue): void {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const scanTagIdObj = parseValue(scanTagId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_scan_component_s_active_scan_tag_id',
      args: [targetEntityObj, scanTagIdObj]
    })
  }

  /**
   * Switch the active Scoring Group of the specified Player's Ranking by Scoring Group ID
   *
   * 切换玩家竞技段位生效的计分组: 以计分组的序号切换指定玩家竞技段位生效的计分组
   *
   * @param playerEntity
   *
   * 玩家实体
   * @param scoreGroupId The ID corresponding to the specified Score Group in Peripheral System management
   *
   * 计分组序号: 外围系统管理中指定计分组对应的序号
   */
  switchTheScoringGroupThatAffectsPlayerSCompetitiveRank(
    playerEntity: PlayerEntity,
    scoreGroupId: IntValue
  ): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const scoreGroupIdObj = parseValue(scoreGroupId, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'switch_the_scoring_group_that_affects_player_s_competitive_rank',
      args: [playerEntityObj, scoreGroupIdObj]
    })
  }

  /**
   * Set the Player's rank score change based on the settlement status
   *
   * 设置玩家段位变化分数: 根据结算状态设置玩家的段位变化分数
   *
   * @param playerEntity
   *
   * 玩家实体
   * @param settlementStatus Includes: Undefined, Victory, Defeat, Escape
   *
   * 结算状态: 分为未定、胜利、失败、逃跑
   * @param scoreChange
   *
   * 变化分数
   */
  setPlayerRankScoreChange(
    playerEntity: PlayerEntity,
    settlementStatus: SettlementStatus,
    scoreChange: IntValue
  ): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const settlementStatusObj = parseValue(settlementStatus, 'enumeration')
    const scoreChangeObj = parseValue(scoreChange, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_player_rank_score_change',
      args: [playerEntityObj, settlementStatusObj, scoreChangeObj]
    })
  }

  /**
   * Set whether escaping is permitted for the specified Player
   *
   * 设置玩家逃跑合法性: 设置指定玩家逃跑的合法性
   *
   * @param playerEntity
   *
   * 玩家实体
   * @param valid
   *
   * 是否合法
   */
  setPlayerEscapeValidity(playerEntity: PlayerEntity, valid: BoolValue): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const validObj = parseValue(valid, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_player_escape_validity',
      args: [playerEntityObj, validObj]
    })
  }

  /**
   * Edit the Initial Creation Switch state of the Entity Layout Group
   *
   * 激活/关闭实体布设组: 修改实体布设组初始创建开关的状态
   *
   * @param entityDeploymentGroupIndex
   *
   * 实体布设组索引
   * @param activate If set to True, the Entity Layout Group's Initial Creation switch is enabled
   *
   * 是否激活: “是”则该实体布设组初始创建开关状态为开启
   */
  activateDisableEntityDeploymentGroup(
    entityDeploymentGroupIndex: IntValue,
    activate: BoolValue
  ): void {
    const entityDeploymentGroupIndexObj = parseValue(entityDeploymentGroupIndex, 'int')
    const activateObj = parseValue(activate, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'activate_disable_entity_deployment_group',
      args: [entityDeploymentGroupIndexObj, activateObj]
    })
  }

  /**
   * Set the Chat Channel switch
   *
   * 设置聊天频道开关: 设置聊天频道的开关
   *
   * @param channelIndex
   *
   * 频道索引
   * @param textSwitch
   *
   * 文字开关
   */
  setChatChannelSwitch(channelIndex: IntValue, textSwitch: BoolValue): void {
    const channelIndexObj = parseValue(channelIndex, 'int')
    const textSwitchObj = parseValue(textSwitch, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_chat_channel_switch',
      args: [channelIndexObj, textSwitchObj]
    })
  }

  /**
   * Set the Player's currently available channels. Channels in the list are available to the Player, and channels not in the list are unavailable
   *
   * 设置玩家当前频道: 设置玩家当前可用的频道，在列表中的频道该玩家可用，不在的该玩家不可用
   *
   * @param playerGuid
   *
   * 玩家GUID
   * @param channelIndexList
   *
   * 频道索引列表
   */
  setPlayerSCurrentChannel(playerGuid: GuidValue, channelIndexList: IntValue[]): void {
    const playerGuidObj = parseValue(playerGuid, 'guid')
    const channelIndexListObj = parseValue(channelIndexList, 'int_list')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'set_player_s_current_channel',
      args: [playerGuidObj, channelIndexListObj]
    })
  }

  /**
   * Edit Player Channel Permissions
   *
   * 修改玩家频道权限: 修改玩家频道权限
   *
   * @param playerGuid
   *
   * 玩家GUID
   * @param channelIndex
   *
   * 频道索引
   * @param join If set to True, the channel is available to the specified Player
   *
   * 是否加入: “是”则该频道指定玩家可用
   */
  modifyPlayerChannelPermission(
    playerGuid: GuidValue,
    channelIndex: IntValue,
    join: BoolValue
  ): void {
    const playerGuidObj = parseValue(playerGuid, 'guid')
    const channelIndexObj = parseValue(channelIndex, 'int')
    const joinObj = parseValue(join, 'bool')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'modify_player_channel_permission',
      args: [playerGuidObj, channelIndexObj, joinObj]
    })
  }

  /**
   * Consume the specified Player's Wonderland Gift Box
   *
   * 消耗礼盒: 可以消耗指定玩家的奇域礼盒
   *
   * @param playerEntity
   *
   * 玩家实体
   * @param giftBoxIndex
   *
   * 礼盒索引
   * @param consumptionQuantity
   *
   * 消耗数量
   */
  consumeGiftBox(
    playerEntity: PlayerEntity,
    giftBoxIndex: IntValue,
    consumptionQuantity: IntValue
  ): void {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const giftBoxIndexObj = parseValue(giftBoxIndex, 'int')
    const consumptionQuantityObj = parseValue(consumptionQuantity, 'int')
    this.registry.registerNode({
      id: 0,
      type: 'exec',
      nodeType: 'consume_gift_box',
      args: [playerEntityObj, giftBoxIndexObj, consumptionQuantityObj]
    })
  }

  /**
   * Outputs the x, y, and z components of a 3D Vector as three Floating Point Numbers
   *
   * 拆分三维向量: 将三维向量的x、y、z分量输出为三个浮点数
   *
   * @param _3dVector
   *
   * 三维向量
   */
  split3dVector(_3dVector: Vec3Value): {
    /**
     *
     * X分量
     */
    xComponent: number
    /**
     *
     * Y分量
     */
    yComponent: number
    /**
     *
     * Z分量
     */
    zComponent: number
  } {
    const _3dVectorObj = parseValue(_3dVector, 'vec3')
    if (isPrecomputeEnabled()) {
      const raw = readLiteralVec3(_3dVectorObj)
      if (raw) {
        return {
          xComponent: new float(raw[0]) as unknown as number,
          yComponent: new float(raw[1]) as unknown as number,
          zComponent: new float(raw[2]) as unknown as number
        }
      }
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'split3d_vector',
      args: [_3dVectorObj]
    })
    return {
      xComponent: (() => {
        const ret = new float()
        ret.markPin(ref, 'xComponent', 0)
        return ret as unknown as number
      })(),
      yComponent: (() => {
        const ret = new float()
        ret.markPin(ref, 'yComponent', 1)
        return ret as unknown as number
      })(),
      zComponent: (() => {
        const ret = new float()
        ret.markPin(ref, 'zComponent', 2)
        return ret as unknown as number
      })()
    }
  }

  /**
   * Performs multiplication, supporting Floating Point and Integer multiplication
   *
   * 乘法运算: 乘法运算，支持浮点数乘法和整数乘法
   *
   * @param input1
   * @param input2
   *
   * @returns
   *
   * 结果
   */
  multiplication(input1: FloatValue, input2: FloatValue): number
  multiplication(input1: IntValue, input2: IntValue): bigint
  multiplication<T extends 'float' | 'int'>(
    input1: RuntimeParameterValueTypeMap[T],
    input2: RuntimeParameterValueTypeMap[T]
  ): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(['float', 'int'], input1, input2)
    const input1Obj = parseValue(input1, genericType)
    const input2Obj = parseValue(input2, genericType)
    const pre =
      genericType === 'float'
        ? tryPrecomputeFloatBinary(input1Obj, input2Obj, (a, b) => a * b)
        : tryPrecomputeIntBinary(input1Obj, input2Obj, (a, b) => a * b)
    if (pre) return pre as unknown as RuntimeReturnValueTypeMap[T]
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'multiplication',
      args: [input1Obj, input2Obj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Performs division, supporting Floating Point division and Integer division. Integer division returns the quotient result; The divisor should not be 0, otherwise it may return an illegal value
   *
   * 除法运算: 除法运算，支持浮点数除法和整数除法。整数除法返回整除结果; 除数不应为0，否则可能返回非法值
   *
   * @param input1
   * @param input2
   *
   * @returns
   *
   * 结果
   */
  division(input1: FloatValue, input2: FloatValue): number
  division(input1: IntValue, input2: IntValue): bigint
  division<T extends 'float' | 'int'>(
    input1: RuntimeParameterValueTypeMap[T],
    input2: RuntimeParameterValueTypeMap[T]
  ): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(['float', 'int'], input1, input2)
    const input1Obj = parseValue(input1, genericType)
    const input2Obj = parseValue(input2, genericType)
    if (genericType === 'float') {
      if (isPrecomputeEnabled()) {
        const a = readLiteralFloat(input1Obj)
        const b = readLiteralFloat(input2Obj)
        if (a !== null && b !== null && b !== 0) {
          const result = a / b
          if (Number.isFinite(result)) {
            return new float(result) as unknown as RuntimeReturnValueTypeMap[T]
          }
        }
      }
    } else {
      if (isPrecomputeEnabled()) {
        const a = readLiteralInt(input1Obj)
        const b = readLiteralInt(input2Obj)
        if (a !== null && b !== null && b !== 0n) {
          return new int(a / b) as unknown as RuntimeReturnValueTypeMap[T]
        }
      }
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'division',
      args: [input1Obj, input2Obj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Creates a 3D Vector from x, y, and z components
   *
   * 创建三维向量: 根据x、y、z分量创建一个三维向量
   *
   * @param xComponent
   *
   * X分量
   * @param yComponent
   *
   * Y分量
   * @param zComponent
   *
   * Z分量
   *
   * @returns
   *
   * 三维向量
   */
  create3dVector(xComponent: FloatValue, yComponent: FloatValue, zComponent: FloatValue): vec3 {
    const xComponentObj = parseValue(xComponent, 'float')
    const yComponentObj = parseValue(yComponent, 'float')
    const zComponentObj = parseValue(zComponent, 'float')
    if (isPrecomputeEnabled()) {
      const x = readLiteralFloat(xComponentObj)
      const y = readLiteralFloat(yComponentObj)
      const z = readLiteralFloat(zComponentObj)
      if (x !== null && y !== null && z !== null) {
        return new vec3([x, y, z]) as unknown as vec3
      }
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'create3d_vector',
      args: [xComponentObj, yComponentObj, zComponentObj]
    })
    const ret = new vec3()
    ret.markPin(ref, '_3dVector', 0)
    return ret as unknown as vec3
  }

  /**
   * Calculates the logarithm of the argument with the specified base; The base should not be negative or equal to 1, and the argument should not be negative, otherwise illegal values may be generated
   *
   * 对数运算: 计算以底数为底真数的对数; 底数不应为负数或等于1、真数不应为负数，否则可能产生非法值
   *
   * @param realNumber
   *
   * 真数
   * @param base
   *
   * 底数
   *
   * @returns
   *
   * 结果
   */
  logarithmOperation(realNumber: FloatValue, base: FloatValue): number {
    const realNumberObj = parseValue(realNumber, 'float')
    const baseObj = parseValue(base, 'float')
    if (isPrecomputeEnabled()) {
      const real = readLiteralFloat(realNumberObj)
      const b = readLiteralFloat(baseObj)
      if (real !== null && b !== null && real > 0 && b > 0 && b !== 1) {
        const result = Math.log(real) / Math.log(b)
        if (Number.isFinite(result)) {
          return new float(result) as unknown as number
        }
      }
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'logarithm_operation',
      args: [realNumberObj, baseObj]
    })
    const ret = new float()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as number
  }

  /**
   * Calculates the arccosine of the input and returns the value in radians
   *
   * 反余弦函数: 计算输入的反余弦值，返回为弧度值
   *
   * @param input
   *
   * 输入
   *
   * @returns
   *
   * 弧度
   */
  arccosineFunction(input: FloatValue): number {
    const inputObj = parseValue(input, 'float')
    const pre = tryPrecomputeFloatUnary(inputObj, (a) => Math.acos(a))
    if (pre) return pre as unknown as number
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'arccosine_function',
      args: [inputObj]
    })
    const ret = new float()
    ret.markPin(ref, 'radian', 0)
    return ret as unknown as number
  }

  /**
   * Calculates the arctangent of the input and returns the value in radians
   *
   * 反正切函数: 计算输入的反正切值，返回为弧度值
   *
   * @param input
   *
   * 输入
   *
   * @returns
   *
   * 弧度
   */
  arctangentFunction(input: FloatValue): number {
    const inputObj = parseValue(input, 'float')
    const pre = tryPrecomputeFloatUnary(inputObj, (a) => Math.atan(a))
    if (pre) return pre as unknown as number
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'arctangent_function',
      args: [inputObj]
    })
    const ret = new float()
    ret.markPin(ref, 'radian', 0)
    return ret as unknown as number
  }

  /**
   * Calculates the arcsine of the input and returns the value in radians
   *
   * 反正弦函数: 计算输入的反正弦值，返回为弧度值
   *
   * @param input
   *
   * 输入
   *
   * @returns
   *
   * 弧度
   */
  arcsineFunction(input: FloatValue): number {
    const inputObj = parseValue(input, 'float')
    const pre = tryPrecomputeFloatUnary(inputObj, (a) => Math.asin(a))
    if (pre) return pre as unknown as number
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'arcsine_function',
      args: [inputObj]
    })
    const ret = new float()
    ret.markPin(ref, 'radian', 0)
    return ret as unknown as number
  }

  /**
   * Clamps the input value to the range [lower limit, upper limit] (both bounds inclusive) and outputs the result
   *
   * 范围限制运算: 将输入值限制在[下限,上限]（上下限均包含）后输出。
   *
   * @param input
   *
   * 输入
   * @param lowerLimit
   *
   * 下限
   * @param upperLimit
   *
   * 上限
   *
   * @returns
   *
   * 结果
   */
  rangeLimitingOperation(input: FloatValue, lowerLimit: FloatValue, upperLimit: FloatValue): number
  rangeLimitingOperation(input: IntValue, lowerLimit: IntValue, upperLimit: IntValue): bigint
  rangeLimitingOperation<T extends 'float' | 'int'>(
    input: RuntimeParameterValueTypeMap[T],
    lowerLimit: RuntimeParameterValueTypeMap[T],
    upperLimit: RuntimeParameterValueTypeMap[T]
  ): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(['float', 'int'], input, lowerLimit, upperLimit)
    const inputObj = parseValue(input, genericType)
    const lowerLimitObj = parseValue(lowerLimit, genericType)
    const upperLimitObj = parseValue(upperLimit, genericType)
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'range_limiting_operation',
      args: [inputObj, lowerLimitObj, upperLimitObj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Converts the Forward Vector and Upward Vector to Euler Angles
   *
   * 方向向量转旋转: 给定向前向量和向上向量，转化为欧拉角
   *
   * @param forwardVector Represents the desired Orientation of the Unit
   *
   * 向前向量: 表示单位期望的朝向
   * @param upwardVector Defines the Unit's Up direction (used to determine the rotation angle). Default is the positive Y-axis of the World Coordinate System
   *
   * 向上向量: 定义单位的上方向（用于确定旋转的旋转角度），默认值为世界坐标系Y轴正方向
   *
   * @returns
   *
   * 旋转
   */
  directionVectorToRotation(forwardVector: Vec3Value, upwardVector: Vec3Value): vec3 {
    const forwardVectorObj = parseValue(forwardVector, 'vec3')
    const upwardVectorObj = parseValue(upwardVector, 'vec3')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'direction_vector_to_rotation',
      args: [forwardVectorObj, upwardVectorObj]
    })
    const ret = new vec3()
    ret.markPin(ref, 'rotate', 0)
    return ret as unknown as vec3
  }

  /**
   * Converts a formatted time to a timestamp
   *
   * 根据格式化时间计算时间戳: 根据输入的格式化时间将其转化为时间戳
   *
   * @param year
   *
   * 年
   * @param month
   *
   * 月
   * @param day
   *
   * 日
   * @param hour
   *
   * 时
   * @param minute
   *
   * 分
   * @param second
   *
   * 秒
   *
   * @returns
   *
   * 时间戳
   */
  calculateTimestampFromFormattedTime(
    year: IntValue,
    month: IntValue,
    day: IntValue,
    hour: IntValue,
    minute: IntValue,
    second: IntValue
  ): bigint {
    const yearObj = parseValue(year, 'int')
    const monthObj = parseValue(month, 'int')
    const dayObj = parseValue(day, 'int')
    const hourObj = parseValue(hour, 'int')
    const minuteObj = parseValue(minute, 'int')
    const secondObj = parseValue(second, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'calculate_timestamp_from_formatted_time',
      args: [yearObj, monthObj, dayObj, hourObj, minuteObj, secondObj]
    })
    const ret = new int()
    ret.markPin(ref, 'timestamp', 0)
    return ret as unknown as bigint
  }

  /**
   * Converts a timestamp to formatted time
   *
   * 根据时间戳计算格式化时间: 根据输入的时间戳将其转化为格式化时间
   *
   * @param timestamp
   *
   * 时间戳
   */
  calculateFormattedTimeFromTimestamp(timestamp: IntValue): {
    /**
     *
     * 年
     */
    year: bigint
    /**
     *
     * 月
     */
    month: bigint
    /**
     *
     * 日
     */
    day: bigint
    /**
     *
     * 时
     */
    hour: bigint
    /**
     *
     * 分
     */
    minute: bigint
    /**
     *
     * 秒
     */
    second: bigint
  } {
    const timestampObj = parseValue(timestamp, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'calculate_formatted_time_from_timestamp',
      args: [timestampObj]
    })
    return {
      year: (() => {
        const ret = new int()
        ret.markPin(ref, 'year', 0)
        return ret as unknown as bigint
      })(),
      month: (() => {
        const ret = new int()
        ret.markPin(ref, 'month', 1)
        return ret as unknown as bigint
      })(),
      day: (() => {
        const ret = new int()
        ret.markPin(ref, 'day', 2)
        return ret as unknown as bigint
      })(),
      hour: (() => {
        const ret = new int()
        ret.markPin(ref, 'hour', 3)
        return ret as unknown as bigint
      })(),
      minute: (() => {
        const ret = new int()
        ret.markPin(ref, 'minute', 4)
        return ret as unknown as bigint
      })(),
      second: (() => {
        const ret = new int()
        ret.markPin(ref, 'second', 5)
        return ret as unknown as bigint
      })()
    }
  }

  /**
   * Converts a timestamp to the day of the week
   *
   * 根据时间戳计算星期几: 根据输入的时间戳将其转化为星期几
   *
   * @param timestamp
   *
   * 时间戳
   *
   * @returns
   *
   * 星期
   */
  calculateDayOfTheWeekFromTimestamp(timestamp: IntValue): bigint {
    const timestampObj = parseValue(timestamp, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'calculate_day_of_the_week_from_timestamp',
      args: [timestampObj]
    })
    const ret = new int()
    ret.markPin(ref, 'weekday', 0)
    return ret as unknown as bigint
  }

  /**
   * Converts radians to degrees
   *
   * 弧度转角度: 将弧度值转为角度值
   *
   * @param radianValue
   *
   * 弧度值
   *
   * @returns
   *
   * 角度值
   */
  radiansToDegrees(radianValue: FloatValue): number {
    const radianValueObj = parseValue(radianValue, 'float')
    const pre = tryPrecomputeFloatUnary(radianValueObj, (a) => (a * 180) / Math.PI)
    if (pre) return pre as unknown as number
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'radians_to_degrees',
      args: [radianValueObj]
    })
    const ret = new float()
    ret.markPin(ref, 'angleValue', 0)
    return ret as unknown as number
  }

  /**
   * Adds two Floating Point Numbers or Integers
   *
   * 加法运算: 计算两个浮点数或整数的加法
   *
   * @param input1
   * @param input2
   *
   * @returns
   *
   * 结果
   */
  addition(input1: FloatValue, input2: FloatValue): number
  addition(input1: IntValue, input2: IntValue): bigint
  addition<T extends 'float' | 'int'>(
    input1: RuntimeParameterValueTypeMap[T],
    input2: RuntimeParameterValueTypeMap[T]
  ): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(['float', 'int'], input1, input2)
    const input1Obj = parseValue(input1, genericType)
    const input2Obj = parseValue(input2, genericType)
    const pre =
      genericType === 'float'
        ? tryPrecomputeFloatBinary(input1Obj, input2Obj, (a, b) => a + b)
        : tryPrecomputeIntBinary(input1Obj, input2Obj, (a, b) => a + b)
    if (pre) return pre as unknown as RuntimeReturnValueTypeMap[T]
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'addition',
      args: [input1Obj, input2Obj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Subtracts two Floating Point Numbers or Integers
   *
   * 减法运算: 计算两个浮点数或整数的减法
   *
   * @param input1
   * @param input2
   *
   * @returns
   *
   * 结果
   */
  subtraction(input1: FloatValue, input2: FloatValue): number
  subtraction(input1: IntValue, input2: IntValue): bigint
  subtraction<T extends 'float' | 'int'>(
    input1: RuntimeParameterValueTypeMap[T],
    input2: RuntimeParameterValueTypeMap[T]
  ): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(['float', 'int'], input1, input2)
    const input1Obj = parseValue(input1, genericType)
    const input2Obj = parseValue(input2, genericType)
    const pre =
      genericType === 'float'
        ? tryPrecomputeFloatBinary(input1Obj, input2Obj, (a, b) => a - b)
        : tryPrecomputeIntBinary(input1Obj, input2Obj, (a, b) => a - b)
    if (pre) return pre as unknown as RuntimeReturnValueTypeMap[T]
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'subtraction',
      args: [input1Obj, input2Obj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Converts degrees to radians
   *
   * 角度转弧度: 将角度值转为弧度值
   *
   * @param angleValue
   *
   * 角度值
   *
   * @returns
   *
   * 弧度值
   */
  degreesToRadians(angleValue: FloatValue): number {
    const angleValueObj = parseValue(angleValue, 'float')
    const pre = tryPrecomputeFloatUnary(angleValueObj, (a) => (a * Math.PI) / 180)
    if (pre) return pre as unknown as number
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'degrees_to_radians',
      args: [angleValueObj]
    })
    const ret = new float()
    ret.markPin(ref, 'radianValue', 0)
    return ret as unknown as number
  }

  /**
   * Returns the larger of two inputs
   *
   * 取较大值: 取出两个输入中较大的一个
   *
   * @param input1
   *
   * 输入1
   * @param input2
   *
   * 输入2
   *
   * @returns
   *
   * 较大值
   */
  takeLargerValue(input1: FloatValue, input2: FloatValue): number
  takeLargerValue(input1: IntValue, input2: IntValue): bigint
  takeLargerValue<T extends 'float' | 'int'>(
    input1: RuntimeParameterValueTypeMap[T],
    input2: RuntimeParameterValueTypeMap[T]
  ): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(['float', 'int'], input1, input2)
    const input1Obj = parseValue(input1, genericType)
    const input2Obj = parseValue(input2, genericType)
    const pre =
      genericType === 'float'
        ? tryPrecomputeFloatBinary(input1Obj, input2Obj, (a, b) => Math.max(a, b))
        : tryPrecomputeIntBinary(input1Obj, input2Obj, (a, b) => (a > b ? a : b))
    if (pre) return pre as unknown as RuntimeReturnValueTypeMap[T]
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'take_larger_value',
      args: [input1Obj, input2Obj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'largerValue', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Returns the smaller of two inputs
   *
   * 取较小值: 取出两个输入中较小的一个
   *
   * @param input1
   *
   * 输入1
   * @param input2
   *
   * 输入2
   *
   * @returns
   *
   * 较小值
   */
  takeSmallerValue(input1: FloatValue, input2: FloatValue): number
  takeSmallerValue(input1: IntValue, input2: IntValue): bigint
  takeSmallerValue<T extends 'float' | 'int'>(
    input1: RuntimeParameterValueTypeMap[T],
    input2: RuntimeParameterValueTypeMap[T]
  ): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(['float', 'int'], input1, input2)
    const input1Obj = parseValue(input1, genericType)
    const input2Obj = parseValue(input2, genericType)
    const pre =
      genericType === 'float'
        ? tryPrecomputeFloatBinary(input1Obj, input2Obj, (a, b) => Math.min(a, b))
        : tryPrecomputeIntBinary(input1Obj, input2Obj, (a, b) => (a < b ? a : b))
    if (pre) return pre as unknown as RuntimeReturnValueTypeMap[T]
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'take_smaller_value',
      args: [input1Obj, input2Obj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'smallerValue', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Returns the absolute value of the input
   *
   * 绝对值运算: 返回输入的绝对值
   *
   * @param input
   *
   * 输入
   *
   * @returns
   *
   * 结果
   */
  absoluteValueOperation(input: FloatValue): number
  absoluteValueOperation(input: IntValue): bigint
  absoluteValueOperation<T extends 'float' | 'int'>(
    input: RuntimeParameterValueTypeMap[T]
  ): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(['float', 'int'], input)
    const inputObj = parseValue(input, genericType)
    if (genericType === 'float') {
      const pre = tryPrecomputeFloatUnary(inputObj, (a) => Math.abs(a))
      if (pre) return pre as unknown as RuntimeReturnValueTypeMap[T]
    } else {
      const pre = tryPrecomputeIntUnary(inputObj, (a) => (a < 0n ? -a : a))
      if (pre) return pre as unknown as RuntimeReturnValueTypeMap[T]
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'absolute_value_operation',
      args: [inputObj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Calculates the Euclidean distance between two coordinates
   *
   * 两坐标点距离: 计算两个坐标点之间的欧式距离
   *
   * @param coordinatePoint1
   *
   * 坐标点1
   * @param coordinatePoint2
   *
   * 坐标点2
   *
   * @returns
   *
   * 距离
   */
  distanceBetweenTwoCoordinatePoints(
    coordinatePoint1: Vec3Value,
    coordinatePoint2: Vec3Value
  ): number {
    const coordinatePoint1Obj = parseValue(coordinatePoint1, 'vec3')
    const coordinatePoint2Obj = parseValue(coordinatePoint2, 'vec3')
    const pre = tryPrecomputeVec3BinaryToFloat(coordinatePoint1Obj, coordinatePoint2Obj, (a, b) => {
      const dx = a[0] - b[0]
      const dy = a[1] - b[1]
      const dz = a[2] - b[2]
      return Math.sqrt(dx * dx + dy * dy + dz * dz)
    })
    if (pre) return pre as unknown as number
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'distance_between_two_coordinate_points',
      args: [coordinatePoint1Obj, coordinatePoint2Obj]
    })
    const ret = new float()
    ret.markPin(ref, 'distance', 0)
    return ret as unknown as number
  }

  /**
   * Performs a logical NOT operation on the input Boolean value and returns the result
   *
   * 逻辑非运算: 对输入的布尔值进行非运算后输出
   *
   * @param input
   *
   * 输入
   *
   * @returns
   *
   * 结果
   */
  logicalNotOperation(input: BoolValue): boolean {
    const inputObj = parseValue(input, 'bool')
    const pre = tryPrecomputeBoolUnary(inputObj, (a) => !a)
    if (pre) return pre as unknown as boolean
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'logical_not_operation',
      args: [inputObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as boolean
  }

  /**
   * Performs a logical OR operation on the two input Boolean values and returns the result
   *
   * 逻辑或运算: 对输入的两个布尔值进行或运算后输出
   *
   * @param input1
   *
   * 输入1
   * @param input2
   *
   * 输入2
   *
   * @returns
   *
   * 结果
   */
  logicalOrOperation(input1: BoolValue, input2: BoolValue): boolean {
    const input1Obj = parseValue(input1, 'bool')
    const input2Obj = parseValue(input2, 'bool')
    const pre = tryPrecomputeBoolBinary(input1Obj, input2Obj, (a, b) => a || b)
    if (pre) return pre as unknown as boolean
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'logical_or_operation',
      args: [input1Obj, input2Obj]
    })
    const ret = new bool()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as boolean
  }

  /**
   * Performs a logical XOR operation on the two input Boolean values and returns the result
   *
   * 逻辑异或运算: 对输入的两个布尔值进行异或运算后输出
   *
   * @param input1
   *
   * 输入1
   * @param input2
   *
   * 输入2
   *
   * @returns
   *
   * 结果
   */
  logicalXorOperation(input1: BoolValue, input2: BoolValue): boolean {
    const input1Obj = parseValue(input1, 'bool')
    const input2Obj = parseValue(input2, 'bool')
    const pre = tryPrecomputeBoolBinary(input1Obj, input2Obj, (a, b) => a !== b)
    if (pre) return pre as unknown as boolean
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'logical_xor_operation',
      args: [input1Obj, input2Obj]
    })
    const ret = new bool()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as boolean
  }

  /**
   * Performs a logical AND operation on the two input Boolean values and returns the result
   *
   * 逻辑与运算: 对输入的两个布尔值进行与运算后输出
   *
   * @param input1
   *
   * 输入1
   * @param input2
   *
   * 输入2
   *
   * @returns
   *
   * 结果
   */
  logicalAndOperation(input1: BoolValue, input2: BoolValue): boolean {
    const input1Obj = parseValue(input1, 'bool')
    const input2Obj = parseValue(input2, 'bool')
    const pre = tryPrecomputeBoolBinary(input1Obj, input2Obj, (a, b) => a && b)
    if (pre) return pre as unknown as boolean
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'logical_and_operation',
      args: [input1Obj, input2Obj]
    })
    const ret = new bool()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as boolean
  }

  /**
   * Raises the base to the given exponent and returns the result
   *
   * 幂运算: 计算底数的指数次幂
   *
   * @param base
   *
   * 底数
   * @param exponent
   *
   * 指数
   *
   * @returns
   *
   * 结果
   */
  exponentiation(base: FloatValue, exponent: FloatValue): number
  exponentiation(base: IntValue, exponent: IntValue): bigint
  exponentiation<T extends 'float' | 'int'>(
    base: RuntimeParameterValueTypeMap[T],
    exponent: RuntimeParameterValueTypeMap[T]
  ): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(['float', 'int'], base, exponent)
    const baseObj = parseValue(base, genericType)
    const exponentObj = parseValue(exponent, genericType)
    if (genericType === 'float') {
      const pre = tryPrecomputeFloatBinary(baseObj, exponentObj, (a, b) => Math.pow(a, b))
      if (pre) return pre as unknown as RuntimeReturnValueTypeMap[T]
    } else {
      if (isPrecomputeEnabled()) {
        const a = readLiteralInt(baseObj)
        const b = readLiteralInt(exponentObj)
        if (a !== null && b !== null && b >= 0n) {
          return new int(a ** b) as unknown as RuntimeReturnValueTypeMap[T]
        }
      }
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'exponentiation',
      args: [baseObj, exponentObj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Returns the modulus of Input 2 and Input 1
   *
   * 模运算: 返回输入2对输入1的取模运算
   *
   * @param input1
   * @param input2
   *
   * @returns
   *
   * 结果
   */
  moduloOperation(input1: IntValue, input2: IntValue): bigint {
    const input1Obj = parseValue(input1, 'int')
    const input2Obj = parseValue(input2, 'int')
    if (isPrecomputeEnabled()) {
      const a = readLiteralInt(input1Obj)
      const b = readLiteralInt(input2Obj)
      if (a !== null && b !== null && b !== 0n) {
        return new int(a % b) as unknown as bigint
      }
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'modulo_operation',
      args: [input1Obj, input2Obj]
    })
    const ret = new int()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns the arithmetic square root of the input value
   *
   * 算术平方根运算: 返回输入值的算术平方根
   *
   * @param input
   *
   * 输入
   *
   * @returns
   *
   * 结果
   */
  arithmeticSquareRootOperation(input: FloatValue): number {
    const inputObj = parseValue(input, 'float')
    const pre = tryPrecomputeFloatUnary(inputObj, (a) => Math.sqrt(a))
    if (pre) return pre as unknown as number
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'arithmetic_square_root_operation',
      args: [inputObj]
    })
    const ret = new float()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as number
  }

  /**
   * When the input is positive, returns 1; When the input is negative, returns -1; When the input is 0, returns 0
   *
   * 取符号运算: 输入为正数时，返回1; 输入为负数时，返回-1; 输入为0时，返回0
   *
   * @param input
   *
   * 输入
   *
   * @returns
   *
   * 结果
   */
  signOperation(input: FloatValue): number
  signOperation(input: IntValue): bigint
  signOperation<T extends 'float' | 'int'>(
    input: RuntimeParameterValueTypeMap[T]
  ): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(['float', 'int'], input)
    const inputObj = parseValue(input, genericType)
    if (genericType === 'float') {
      const pre = tryPrecomputeFloatUnary(inputObj, (a) => {
        const result = Math.sign(a)
        return Object.is(result, -0) ? 0 : result
      })
      if (pre) return pre as unknown as RuntimeReturnValueTypeMap[T]
    } else {
      const pre = tryPrecomputeIntUnary(inputObj, (a) => (a > 0n ? 1n : a < 0n ? -1n : 0n))
      if (pre) return pre as unknown as RuntimeReturnValueTypeMap[T]
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'sign_operation',
      args: [inputObj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Performs a rounding operation based on the rounding method and returns the rounded positive number
   *
   * 取整数运算: 根据取整方式进行一次取整运算，返回取整后的正数
   *
   * @param input
   *
   * 输入
   * @param roundingMode Round: Rounds to the nearest integer according to standard rulesRound Up: Returns the smallest integer greater than the input value. For example: input 1.2 → 2; input −2.3 → −2 Round Down: Returns the largest integer smaller than the input value. For example: input 1.2 → 1; input −2.3 → −3 Truncate: Removes the decimal part of the floating point number (rounds toward zero). For example: input 1.2 → 1; input −2.3 → −2
   *
   * 取整方式: 四舍五入：按照四舍五入规则进行取整向上取整：返回大于输入且离输入值最近的一个整数，例如：输入为1.2时，返回2；输入为-2.3时，返回-2向下取整：返回小于输入且离输入值最近的一个整数。例如：输入为1.2时，返回1；输入为-2.3时，返回-3截尾取整：截去浮点数尾部的小数部分，也相当于向0方向取整。例如：输入为1.2时，返回1；输入为-2.3时，返回-2
   *
   * @returns
   *
   * 结果
   */
  roundToIntegerOperation(input: FloatValue, roundingMode: RoundingMode): bigint {
    const inputObj = parseValue(input, 'float')
    const roundingModeObj = parseValue(roundingMode, 'enumeration')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'round_to_integer_operation',
      args: [inputObj, roundingModeObj]
    })
    const ret = new int()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as bigint
  }

  /**
   * Normalizes the length of a 3D Vector and outputs the result
   *
   * 三维向量归一化: 将三维向量的长度归一化后输出
   *
   * @param _3dVector
   *
   * 三维向量
   *
   * @returns
   *
   * 结果
   */
  _3dVectorNormalization(_3dVector: Vec3Value): vec3 {
    const _3dVectorObj = parseValue(_3dVector, 'vec3')
    if (isPrecomputeEnabled()) {
      const raw = readLiteralVec3(_3dVectorObj)
      if (raw) {
        const mag = Math.sqrt(raw[0] * raw[0] + raw[1] * raw[1] + raw[2] * raw[2])
        if (Number.isFinite(mag) && mag !== 0) {
          return new vec3([raw[0] / mag, raw[1] / mag, raw[2] / mag]) as unknown as vec3
        }
      }
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_normalization',
      args: [_3dVectorObj]
    })
    const ret = new vec3()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as vec3
  }

  /**
   * Calculates the sum of two 3D Vectors
   *
   * 三维向量加法: 计算两个三维向量的加法
   *
   * @param _3dVector1
   *
   * 三维向量1
   * @param _3dVector2
   *
   * 三维向量2
   *
   * @returns
   *
   * 结果
   */
  _3dVectorAddition(_3dVector1: Vec3Value, _3dVector2: Vec3Value): vec3 {
    const _3dVector1Obj = parseValue(_3dVector1, 'vec3')
    const _3dVector2Obj = parseValue(_3dVector2, 'vec3')
    const pre = tryPrecomputeVec3Binary(_3dVector1Obj, _3dVector2Obj, (a, b) => [
      a[0] + b[0],
      a[1] + b[1],
      a[2] + b[2]
    ])
    if (pre) return pre as unknown as vec3
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_addition',
      args: [_3dVector1Obj, _3dVector2Obj]
    })
    const ret = new vec3()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as vec3
  }

  /**
   * Calculates the angle between two 3D Vectors and outputs it in radians
   *
   * 三维向量夹角: 计算两个三维向量之间的夹角，以弧度输出
   *
   * @param _3dVector1
   *
   * 三维向量1
   * @param _3dVector2
   *
   * 三维向量2
   *
   * @returns
   *
   * 夹角(弧度)
   */
  _3dVectorAngle(_3dVector1: Vec3Value, _3dVector2: Vec3Value): number {
    const _3dVector1Obj = parseValue(_3dVector1, 'vec3')
    const _3dVector2Obj = parseValue(_3dVector2, 'vec3')
    if (isPrecomputeEnabled()) {
      const a = readLiteralVec3(_3dVector1Obj)
      const b = readLiteralVec3(_3dVector2Obj)
      if (a && b) {
        const magA = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2])
        const magB = Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2])
        if (Number.isFinite(magA) && Number.isFinite(magB) && magA !== 0 && magB !== 0) {
          const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
          const angle = Math.acos(dot / (magA * magB))
          if (Number.isFinite(angle)) {
            return new float(angle) as unknown as number
          }
        }
      }
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_angle',
      args: [_3dVector1Obj, _3dVector2Obj]
    })
    const ret = new float()
    ret.markPin(ref, 'angleRadians', 0)
    return ret as unknown as number
  }

  /**
   * Calculates the difference of two 3D Vectors
   *
   * 三维向量减法: 计算两个三维向量的减法
   *
   * @param _3dVector1
   *
   * 三维向量1
   * @param _3dVector2
   *
   * 三维向量2
   *
   * @returns
   *
   * 结果
   */
  _3dVectorSubtraction(_3dVector1: Vec3Value, _3dVector2: Vec3Value): vec3 {
    const _3dVector1Obj = parseValue(_3dVector1, 'vec3')
    const _3dVector2Obj = parseValue(_3dVector2, 'vec3')
    const pre = tryPrecomputeVec3Binary(_3dVector1Obj, _3dVector2Obj, (a, b) => [
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2]
    ])
    if (pre) return pre as unknown as vec3
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_subtraction',
      args: [_3dVector1Obj, _3dVector2Obj]
    })
    const ret = new vec3()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as vec3
  }

  /**
   * Calculates the magnitude of the input 3D Vector
   *
   * 三维向量模运算: 计算输入的三维向量的模
   *
   * @param _3dVector
   *
   * 三维向量
   *
   * @returns
   *
   * 结果
   */
  _3dVectorModuloOperation(_3dVector: Vec3Value): number {
    const _3dVectorObj = parseValue(_3dVector, 'vec3')
    const pre = tryPrecomputeVec3ToFloat(_3dVectorObj, (a) =>
      Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2])
    )
    if (pre) return pre as unknown as number
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_modulo_operation',
      args: [_3dVectorObj]
    })
    const ret = new float()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as number
  }

  /**
   * Calculates the dot product of two input 3D Vectors
   *
   * 三维向量内积: 计算两个输入三维向量的内积（点乘）
   *
   * @param _3dVector1
   *
   * 三维向量1
   * @param _3dVector2
   *
   * 三维向量2
   *
   * @returns
   *
   * 结果
   */
  _3dVectorDotProduct(_3dVector1: Vec3Value, _3dVector2: Vec3Value): number {
    const _3dVector1Obj = parseValue(_3dVector1, 'vec3')
    const _3dVector2Obj = parseValue(_3dVector2, 'vec3')
    const pre = tryPrecomputeVec3BinaryToFloat(
      _3dVector1Obj,
      _3dVector2Obj,
      (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
    )
    if (pre) return pre as unknown as number
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_dot_product',
      args: [_3dVector1Obj, _3dVector2Obj]
    })
    const ret = new float()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as number
  }

  /**
   * Scales the input 3D Vector (scalar multiplication) and outputs the result
   *
   * 三维向量缩放: 将输入的三维向量缩放后输出（三维向量数乘）
   *
   * @param _3dVector
   *
   * 三维向量
   * @param zoomMultiplier
   *
   * 缩放倍率
   *
   * @returns
   *
   * 结果
   */
  _3dVectorZoom(_3dVector: Vec3Value, zoomMultiplier: FloatValue): vec3 {
    const _3dVectorObj = parseValue(_3dVector, 'vec3')
    const zoomMultiplierObj = parseValue(zoomMultiplier, 'float')
    if (isPrecomputeEnabled()) {
      const v = readLiteralVec3(_3dVectorObj)
      const scale = readLiteralFloat(zoomMultiplierObj)
      if (v && scale !== null) {
        return new vec3([v[0] * scale, v[1] * scale, v[2] * scale]) as unknown as vec3
      }
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_zoom',
      args: [_3dVectorObj, zoomMultiplierObj]
    })
    const ret = new vec3()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as vec3
  }

  /**
   * Calculates the cross product of two 3D Vectors
   *
   * 三维向量外积: 计算两个三维向量的外积（叉乘）
   *
   * @param _3dVector1
   *
   * 三维向量1
   * @param _3dVector2
   *
   * 三维向量2
   *
   * @returns
   *
   * 结果
   */
  _3dVectorCrossProduct(_3dVector1: Vec3Value, _3dVector2: Vec3Value): vec3 {
    const _3dVector1Obj = parseValue(_3dVector1, 'vec3')
    const _3dVector2Obj = parseValue(_3dVector2, 'vec3')
    const pre = tryPrecomputeVec3Binary(_3dVector1Obj, _3dVector2Obj, (a, b) => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ])
    if (pre) return pre as unknown as vec3
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_cross_product',
      args: [_3dVector1Obj, _3dVector2Obj]
    })
    const ret = new vec3()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as vec3
  }

  /**
   * Rotates the input 3D Vector by the Euler Angles specified by the rotation and returns the result
   *
   * 三维向量旋转: 将被旋转的三维向量，按照旋转所表示的欧拉角进行旋转后返回结果
   *
   * @param rotate This 3D input vector represents a specific rotation in Euler angles
   *
   * 旋转: 该输入的三维向量指代一个特定的旋转欧拉角
   * @param rotated3dVector
   *
   * 被旋转的三维向量
   *
   * @returns
   *
   * 结果
   */
  _3dVectorRotation(rotate: Vec3Value, rotated3dVector: Vec3Value): vec3 {
    const rotateObj = parseValue(rotate, 'vec3')
    const rotated3dVectorObj = parseValue(rotated3dVector, 'vec3')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_rotation',
      args: [rotateObj, rotated3dVectorObj]
    })
    const ret = new vec3()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as vec3
  }

  /**
   * Returns whether the left value is greater than the right value
   *
   * 数值大于: 返回左值是否大于右值
   *
   * @param leftValue
   *
   * 左值
   * @param rightValue
   *
   * 右值
   *
   * @returns
   *
   * 结果
   */
  greaterThan(leftValue: FloatValue, rightValue: FloatValue): boolean
  greaterThan(leftValue: IntValue, rightValue: IntValue): boolean
  greaterThan<T extends 'float' | 'int'>(
    leftValue: RuntimeParameterValueTypeMap[T],
    rightValue: RuntimeParameterValueTypeMap[T]
  ): boolean {
    const genericType = matchTypes(['float', 'int'], leftValue, rightValue)
    const leftValueObj = parseValue(leftValue, genericType)
    const rightValueObj = parseValue(rightValue, genericType)
    const pre = tryPrecomputeCompare(genericType, leftValueObj, rightValueObj, (a, b) => a > b)
    if (pre) return pre as unknown as boolean
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'greater_than',
      args: [leftValueObj, rightValueObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as boolean
  }

  /**
   * Returns whether the left value is greater than or equal to the right value
   *
   * 数值大于等于: 返回左值是否大于等于右值
   *
   * @param leftValue
   *
   * 左值
   * @param rightValue
   *
   * 右值
   *
   * @returns
   *
   * 结果
   */
  greaterThanOrEqualTo(leftValue: FloatValue, rightValue: FloatValue): boolean
  greaterThanOrEqualTo(leftValue: IntValue, rightValue: IntValue): boolean
  greaterThanOrEqualTo<T extends 'float' | 'int'>(
    leftValue: RuntimeParameterValueTypeMap[T],
    rightValue: RuntimeParameterValueTypeMap[T]
  ): boolean {
    const genericType = matchTypes(['float', 'int'], leftValue, rightValue)
    const leftValueObj = parseValue(leftValue, genericType)
    const rightValueObj = parseValue(rightValue, genericType)
    const pre = tryPrecomputeCompare(genericType, leftValueObj, rightValueObj, (a, b) => a >= b)
    if (pre) return pre as unknown as boolean
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'greater_than_or_equal_to',
      args: [leftValueObj, rightValueObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as boolean
  }

  /**
   * Returns whether the left value is less than the right value
   *
   * 数值小于: 返回左值是否小于右值
   *
   * @param leftValue
   *
   * 左值
   * @param rightValue
   *
   * 右值
   *
   * @returns
   *
   * 结果
   */
  lessThan(leftValue: FloatValue, rightValue: FloatValue): boolean
  lessThan(leftValue: IntValue, rightValue: IntValue): boolean
  lessThan<T extends 'float' | 'int'>(
    leftValue: RuntimeParameterValueTypeMap[T],
    rightValue: RuntimeParameterValueTypeMap[T]
  ): boolean {
    const genericType = matchTypes(['float', 'int'], leftValue, rightValue)
    const leftValueObj = parseValue(leftValue, genericType)
    const rightValueObj = parseValue(rightValue, genericType)
    const pre = tryPrecomputeCompare(genericType, leftValueObj, rightValueObj, (a, b) => a < b)
    if (pre) return pre as unknown as boolean
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'less_than',
      args: [leftValueObj, rightValueObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as boolean
  }

  /**
   * Returns whether the left value is less than or equal to the right value
   *
   * 数值小于等于: 返回左值是否小于等于右值
   *
   * @param leftValue
   *
   * 左值
   * @param rightValue
   *
   * 右值
   *
   * @returns
   *
   * 结果
   */
  lessThanOrEqualTo(leftValue: FloatValue, rightValue: FloatValue): boolean
  lessThanOrEqualTo(leftValue: IntValue, rightValue: IntValue): boolean
  lessThanOrEqualTo<T extends 'float' | 'int'>(
    leftValue: RuntimeParameterValueTypeMap[T],
    rightValue: RuntimeParameterValueTypeMap[T]
  ): boolean {
    const genericType = matchTypes(['float', 'int'], leftValue, rightValue)
    const leftValueObj = parseValue(leftValue, genericType)
    const rightValueObj = parseValue(rightValue, genericType)
    const pre = tryPrecomputeCompare(genericType, leftValueObj, rightValueObj, (a, b) => a <= b)
    if (pre) return pre as unknown as boolean
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'less_than_or_equal_to',
      args: [leftValueObj, rightValueObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as boolean
  }

  /**
   * Calculates the cosine of the input in radians
   *
   * 余弦函数: 计算输入弧度的余弦
   *
   * @param radian
   *
   * 弧度
   *
   * @returns
   *
   * 结果
   */
  cosineFunction(radian: FloatValue): number {
    const radianObj = parseValue(radian, 'float')
    const pre = tryPrecomputeFloatUnary(radianObj, (a) => Math.cos(a))
    if (pre) return pre as unknown as number
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'cosine_function',
      args: [radianObj]
    })
    const ret = new float()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as number
  }

  /**
   * Calculates the tangent of the input in radians
   *
   * 正切函数: 计算输入弧度的正切
   *
   * @param radian
   *
   * 弧度
   *
   * @returns
   *
   * 结果
   */
  tangentFunction(radian: FloatValue): number {
    const radianObj = parseValue(radian, 'float')
    const pre = tryPrecomputeFloatUnary(radianObj, (a) => Math.tan(a))
    if (pre) return pre as unknown as number
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'tangent_function',
      args: [radianObj]
    })
    const ret = new float()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as number
  }

  /**
   * Calculates the sine of the input in radians
   *
   * 正弦函数: 计算输入弧度的正弦
   *
   * @param radian
   *
   * 弧度
   *
   * @returns
   *
   * 结果
   */
  sineFunction(radian: FloatValue): number {
    const radianObj = parseValue(radian, 'float')
    const pre = tryPrecomputeFloatUnary(radianObj, (a) => Math.sin(a))
    if (pre) return pre as unknown as number
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'sine_function',
      args: [radianObj]
    })
    const ret = new float()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as number
  }

  /**
   * Performs a logical left shift on the input by the specified bit count and outputs the result
   *
   * 左移运算: 将输入值作为二进制数逻辑左移一定位数后输出
   *
   * @param value
   *
   * 值
   * @param leftShiftCount
   *
   * 左移位数
   *
   * @returns
   *
   * 结果
   */
  leftShiftOperation(value: IntValue, leftShiftCount: IntValue): bigint {
    const valueObj = parseValue(value, 'int')
    const leftShiftCountObj = parseValue(leftShiftCount, 'int')
    if (isPrecomputeEnabled()) {
      const v = readLiteralInt(valueObj)
      const c = readLiteralInt(leftShiftCountObj)
      if (v !== null && c !== null && c >= 0n) {
        return new int(v << c) as unknown as bigint
      }
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'left_shift_operation',
      args: [valueObj, leftShiftCountObj]
    })
    const ret = new int()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as bigint
  }

  /**
   * Performs a logical right shift on the input by the specified bit count and outputs the result; Performs an arithmetic right shift, preserving the sign bit
   *
   * 右移运算: 将输入值作为二进制数逻辑右移一定位数后输出
   *
   * @param value
   *
   * 值
   * @param rightShiftCount
   *
   * 右移位数
   *
   * @returns
   *
   * 结果
   */
  rightShiftOperation(value: IntValue, rightShiftCount: IntValue): bigint {
    const valueObj = parseValue(value, 'int')
    const rightShiftCountObj = parseValue(rightShiftCount, 'int')
    if (isPrecomputeEnabled()) {
      const v = readLiteralInt(valueObj)
      const c = readLiteralInt(rightShiftCountObj)
      if (v !== null && c !== null && c >= 0n) {
        return new int(v >> c) as unknown as bigint
      }
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'right_shift_operation',
      args: [valueObj, rightShiftCountObj]
    })
    const ret = new int()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as bigint
  }

  /**
   * Performs a bitwise AND operation on the two inputs and returns the result
   *
   * 按位与: 将输入的两个值作为二进制进行按位与运算后返回结果
   *
   * @param value1
   *
   * 值1
   * @param value2
   *
   * 值2
   *
   * @returns
   *
   * 结果
   */
  bitwiseAnd(value1: IntValue, value2: IntValue): bigint {
    const value1Obj = parseValue(value1, 'int')
    const value2Obj = parseValue(value2, 'int')
    const pre = tryPrecomputeIntBinary(value1Obj, value2Obj, (a, b) => a & b)
    if (pre) return pre as unknown as bigint
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'bitwise_and',
      args: [value1Obj, value2Obj]
    })
    const ret = new int()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as bigint
  }

  /**
   * Performs a bitwise OR operation on the two inputs and returns the result
   *
   * 按位或: 将输入的两个值作为二进制进行按位或运算后返回结果
   *
   * @param value1
   *
   * 值1
   * @param value2
   *
   * 值2
   *
   * @returns
   *
   * 结果
   */
  bitwiseOr(value1: IntValue, value2: IntValue): bigint {
    const value1Obj = parseValue(value1, 'int')
    const value2Obj = parseValue(value2, 'int')
    const pre = tryPrecomputeIntBinary(value1Obj, value2Obj, (a, b) => a | b)
    if (pre) return pre as unknown as bigint
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'bitwise_or',
      args: [value1Obj, value2Obj]
    })
    const ret = new int()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as bigint
  }

  /**
   * Performs a bitwise XOR operation on the two inputs and returns the result
   *
   * 按位异或: 将输入的两个值作为二进制进行按位异或运算后返回结果
   *
   * @param value1
   *
   * 值1
   * @param value2
   *
   * 值2
   *
   * @returns
   *
   * 结果
   */
  xorExclusiveOr(value1: IntValue, value2: IntValue): bigint {
    const value1Obj = parseValue(value1, 'int')
    const value2Obj = parseValue(value2, 'int')
    const pre = tryPrecomputeIntBinary(value1Obj, value2Obj, (a, b) => a ^ b)
    if (pre) return pre as unknown as bigint
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'xor_exclusive_or',
      args: [value1Obj, value2Obj]
    })
    const ret = new int()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as bigint
  }

  /**
   * Performs a bitwise complement operation on the input and returns the result
   *
   * 按位取补运算: 将输入值作为二进制进行按位取补运算后返回结果
   *
   * @param value
   *
   * 值
   *
   * @returns
   *
   * 结果
   */
  bitwiseComplement(value: IntValue): bigint {
    const valueObj = parseValue(value, 'int')
    const pre = tryPrecomputeIntUnary(valueObj, (a) => ~a)
    if (pre) return pre as unknown as bigint
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'bitwise_complement',
      args: [valueObj]
    })
    const ret = new int()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as bigint
  }

  /**
   * Writes the write value as a binary number to the [start bit, end bit] of the target value (also a binary number). The start bit is indexed from 0, and the write length includes both the start and end bits; If the binary significant length of the write value (counted from the first 1 from the left) exceeds the write length, the write fails and returns the original value; If the write value is negative, it also fails due to exceeding the write length (the first bit of a negative number's binary representation is the sign bit 1)
   *
   * 按位写入: 将写入值作为二进制数，写入被写入值（同样作为二进制数）的【起始位，结束位】。起始位从0开始算，写入的值长度包含起始位和结束位; 如果写入值的二进制有效数字长度（从左起第一个1开始计算）超过写入的长度，则写入失败，返回被写入值; 如果写入值是负数，也会因为写入值超出长度而写入失败（负数的二进制首位为符号位1）
   *
   * @param writtenValue
   *
   * 被写入值
   * @param writeValue
   *
   * 写入值
   * @param writeStartingPosition
   *
   * 写入起始位
   * @param writeEndPosition
   *
   * 写入结束位
   *
   * @returns
   *
   * 结果
   */
  writeByBit(
    writtenValue: IntValue,
    writeValue: IntValue,
    writeStartingPosition: IntValue,
    writeEndPosition: IntValue
  ): bigint {
    const writtenValueObj = parseValue(writtenValue, 'int')
    const writeValueObj = parseValue(writeValue, 'int')
    const writeStartingPositionObj = parseValue(writeStartingPosition, 'int')
    const writeEndPositionObj = parseValue(writeEndPosition, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'write_by_bit',
      args: [writtenValueObj, writeValueObj, writeStartingPositionObj, writeEndPositionObj]
    })
    const ret = new int()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as bigint
  }

  /**
   * Reads the value from [start bit, end bit] of the value (in binary representation)
   *
   * 按位读出: 从值（以二进制表示）的【起始位，结束位】读出值
   *
   * @param value
   *
   * 值
   * @param readStartingPosition
   *
   * 读出起始位
   * @param readEndPosition
   *
   * 读出结束位
   *
   * @returns
   *
   * 结果
   */
  readByBit(value: IntValue, readStartingPosition: IntValue, readEndPosition: IntValue): bigint {
    const valueObj = parseValue(value, 'int')
    const readStartingPositionObj = parseValue(readStartingPosition, 'int')
    const readEndPositionObj = parseValue(readEndPosition, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'read_by_bit',
      args: [valueObj, readStartingPositionObj, readEndPositionObj]
    })
    const ret = new int()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns all parameters of the specified Structure
   *
   * 拆分结构体: 获取指定结构体的所有参数
   */
  splitStructure(): void {
    this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'split_structure',
      args: []
    })
  }

  /**
   * Combines multiple parameters into a single Structure-type value
   *
   * 拼装结构体: 将多个参数拼合为一个结构体类型的值
   */
  assembleStructure(): void {
    this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'assemble_structure',
      args: []
    })
  }

  /**
   * Searches the theoretical number of players entering the match, including players via Matchmaking or Room creation, and the method of entry
   *
   * 查询对局游玩方式及人数: 查询进入对局的理论人数，即参与匹配或开房间的人数和进入对局的方式
   */
  queryGameModeAndPlayerNumber(): {
    /**
     *
     * 游玩人数
     */
    playerCount: bigint
    /**
     * Trial, Room, or Matchmaking
     *
     * 游玩方式: 分为试玩、房间游玩、匹配游玩
     */
    playMode: GameplayMode
  } {
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_game_mode_and_player_number',
      args: []
    })
    return {
      playerCount: (() => {
        const ret = new int()
        ret.markPin(ref, 'playerCount', 0)
        return ret as unknown as bigint
      })(),
      playMode: (() => {
        const ret = new enumeration('GameplayMode')
        ret.markPin(ref, 'playMode', 1)
        return ret as unknown as GameplayMode
      })()
    }
  }

  /**
   * Searches the Server's timezone
   *
   * 查询服务器时区: 可以查询服务器的时区
   *
   * @returns
   *
   * 时区
   */
  queryServerTimeZone(): bigint {
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_server_time_zone',
      args: []
    })
    const ret = new int()
    ret.markPin(ref, 'timeZone', 0)
    return ret as unknown as bigint
  }

  /**
   * Searches the current timestamp
   *
   * 查询时间戳（UTC+0时区）: 可以查询当前的时间戳
   *
   * @returns
   *
   * 时间戳
   */
  queryTimestampUtc0(): bigint {
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_timestamp_utc0',
      args: []
    })
    const ret = new int()
    ret.markPin(ref, 'timestamp', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns a random Floating Point Number that is ≥ the lower limit and ≤ the upper limit. The range is inclusive
   *
   * 获取随机浮点数: 获取一个大于等于下限，小于等于上限的随机浮点数。注意该节点生成的随机数包含上下限
   *
   * @param lowerLimit
   *
   * 下限
   * @param upperLimit
   *
   * 上限
   *
   * @returns
   *
   * 结果
   */
  getRandomFloatingPointNumber(lowerLimit: FloatValue, upperLimit: FloatValue): number {
    const lowerLimitObj = parseValue(lowerLimit, 'float')
    const upperLimitObj = parseValue(upperLimit, 'float')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_random_floating_point_number',
      args: [lowerLimitObj, upperLimitObj]
    })
    const ret = new float()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as number
  }

  /**
   * Returns a random Integer that is ≥ the lower limit and ≤ the upper limit. The range is inclusive
   *
   * 获取随机整数: 获取一个大于等于下限，小于等于上限的随机整数。注意该节点生成的随机数包含上下限
   *
   * @param lowerLimit
   *
   * 下限
   * @param upperLimit
   *
   * 上限
   *
   * @returns
   *
   * 结果
   */
  getRandomInteger(lowerLimit: IntValue, upperLimit: IntValue): bigint {
    const lowerLimitObj = parseValue(lowerLimit, 'int')
    const upperLimitObj = parseValue(upperLimit, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_random_integer',
      args: [lowerLimitObj, upperLimitObj]
    })
    const ret = new int()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as bigint
  }

  /**
   * Takes a list of weights and randomly selects an ID based on the weight distribution; For example, with a weight list {10, 20, 66, 4}, this node outputs 0, 1, 2, or 3 with probabilities 10%, 20%, 66%, and 4% respectively
   *
   * 权重随机: 输入一组权重组成的权重列表，按照权重随机选择其中的一个序号; 例如：权重列表为{10，20，66，4}，那么此节点分别由10%、20%、66%、4%的概率输出0、1、2、3
   *
   * @param weightList
   *
   * 权重列表
   *
   * @returns
   *
   * 权重序号
   */
  weightedRandom(weightList: IntValue[]): bigint {
    const weightListObj = parseValue(weightList, 'int_list')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'weighted_random',
      args: [weightListObj]
    })
    const ret = new int()
    ret.markPin(ref, 'weightId', 0)
    return ret as unknown as bigint
  }

  /**
   * Return (0,0,-1)
   *
   * 三维向量：后方: 返回(0,0,-1)
   *
   * @returns
   *
   * (0,0,-1)
   */
  _3dVectorBackward(): vec3 {
    if (isPrecomputeEnabled()) {
      return new vec3([0, 0, -1]) as unknown as vec3
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_backward',
      args: []
    })
    const ret = new vec3()
    ret.markPin(ref, '_001', 0)
    return ret as unknown as vec3
  }

  /**
   * Return (0,0,0)
   *
   * 三维向量：零向量: 返回(0,0,0)
   *
   * @returns
   *
   * (0,0,0)
   */
  _3dVectorZeroVector(): vec3 {
    if (isPrecomputeEnabled()) {
      return new vec3([0, 0, 0]) as unknown as vec3
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_zero_vector',
      args: []
    })
    const ret = new vec3()
    ret.markPin(ref, '_000', 0)
    return ret as unknown as vec3
  }

  /**
   * Return (0,0,1)
   *
   * 三维向量：前方: 返回(0,0,1)
   *
   * @returns
   *
   * (0,0,1)
   */
  _3dVectorForward(): vec3 {
    if (isPrecomputeEnabled()) {
      return new vec3([0, 0, 1]) as unknown as vec3
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_forward',
      args: []
    })
    const ret = new vec3()
    ret.markPin(ref, '_001', 0)
    return ret as unknown as vec3
  }

  /**
   * Return (0,1,0)
   *
   * 三维向量：上方: 返回(0,1,0)
   *
   * @returns
   *
   * (0,1,0)
   */
  _3dVectorUp(): vec3 {
    if (isPrecomputeEnabled()) {
      return new vec3([0, 1, 0]) as unknown as vec3
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_up',
      args: []
    })
    const ret = new vec3()
    ret.markPin(ref, '_010', 0)
    return ret as unknown as vec3
  }

  /**
   * Return (0,-1,0)
   *
   * 三维向量：下方: 返回(0,-1,0)
   *
   * @returns
   *
   * (0,-1,0)
   */
  _3dVectorDown(): vec3 {
    if (isPrecomputeEnabled()) {
      return new vec3([0, -1, 0]) as unknown as vec3
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_down',
      args: []
    })
    const ret = new vec3()
    ret.markPin(ref, '_010', 0)
    return ret as unknown as vec3
  }

  /**
   * Return (1,0,0)
   *
   * 三维向量：右侧: 返回(1,0,0)
   *
   * @returns
   *
   * (1,0,0)
   */
  _3dVectorRight(): vec3 {
    if (isPrecomputeEnabled()) {
      return new vec3([1, 0, 0]) as unknown as vec3
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_right',
      args: []
    })
    const ret = new vec3()
    ret.markPin(ref, '_100', 0)
    return ret as unknown as vec3
  }

  /**
   * Return (-1,0,0)
   *
   * 三维向量：左侧: 返回(-1,0,0)
   *
   * @returns
   *
   * (-1,0,0)
   */
  _3dVectorLeft(): vec3 {
    if (isPrecomputeEnabled()) {
      return new vec3([-1, 0, 0]) as unknown as vec3
    }
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: '_3d_vector_left',
      args: []
    })
    const ret = new vec3()
    ret.markPin(ref, '_100', 0)
    return ret as unknown as vec3
  }

  /**
   * Returns the approximate value of π (≈ 3.142)
   *
   * 圆周率: 返回圆周率π的近似值，约为3.142
   *
   * @returns
   *
   * 圆周率
   */
  pi(): number {
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'pi',
      args: []
    })
    const ret = new float()
    ret.markPin(ref, 'pi', 0)
    return ret as unknown as number
  }

  /**
   * Find the specified value in the list and return a list of IDs where it appears; For example, if the target list is {1,2,3,2,1} and the value is 1, the returned ID list is {0,4}, meaning 1 appears at IDs 0 and 4 in the target list
   *
   * 查找列表并返回值的序号: 从列表中查找指定值，并返回列表中该值出现的序号列表; 例如：目标列表为{1,2,3,2,1}，值为1，返回的序号列表为{0，4}，即1出现在目标列表的序号0和4
   *
   * @param targetList
   *
   * 目标列表
   * @param value
   *
   * 值
   *
   * @returns Returns an empty list if not found
   *
   * 序号列表: 未找到则返回空列表
   */
  searchListAndReturnValueId(targetList: FloatValue[], value: FloatValue): bigint[]
  searchListAndReturnValueId(targetList: IntValue[], value: IntValue): bigint[]
  searchListAndReturnValueId(targetList: BoolValue[], value: BoolValue): bigint[]
  searchListAndReturnValueId(targetList: ConfigIdValue[], value: ConfigIdValue): bigint[]
  searchListAndReturnValueId(targetList: EntityValue[], value: EntityValue): bigint[]
  searchListAndReturnValueId(targetList: FactionValue[], value: FactionValue): bigint[]
  searchListAndReturnValueId(targetList: GuidValue[], value: GuidValue): bigint[]
  searchListAndReturnValueId(targetList: PrefabIdValue[], value: PrefabIdValue): bigint[]
  searchListAndReturnValueId(targetList: StrValue[], value: StrValue): bigint[]
  searchListAndReturnValueId(targetList: Vec3Value[], value: Vec3Value): bigint[]
  searchListAndReturnValueId<
    T extends
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
  >(
    targetList: RuntimeParameterValueTypeMap[T][],
    value: RuntimeParameterValueTypeMap[T]
  ): bigint[] {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      targetList,
      value
    )
    const targetListObj = parseValue(targetList, `${genericType}_list`)
    const valueObj = parseValue(value, genericType)
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'search_list_and_return_value_id',
      args: [targetListObj, valueObj]
    })
    const ret = new list('int')
    ret.markPin(ref, 'idList', 0)
    return ret as unknown as bigint[]
  }

  /**
   * Returns the value at the specified ID in the list (0-based)
   *
   * 获取列表对应值: 返回列表中指定序号对应的值，序号从0开始
   *
   * @param list
   *
   * 列表
   * @param id
   *
   * 序号
   *
   * @returns
   *
   * 值
   */
  getCorrespondingValueFromList(list: FloatValue[], id: IntValue): number
  getCorrespondingValueFromList(list: IntValue[], id: IntValue): bigint
  getCorrespondingValueFromList(list: BoolValue[], id: IntValue): boolean
  getCorrespondingValueFromList(list: ConfigIdValue[], id: IntValue): configId
  getCorrespondingValueFromList(list: EntityValue[], id: IntValue): entity
  getCorrespondingValueFromList(list: FactionValue[], id: IntValue): faction
  getCorrespondingValueFromList(list: GuidValue[], id: IntValue): guid
  getCorrespondingValueFromList(list: PrefabIdValue[], id: IntValue): prefabId
  getCorrespondingValueFromList(list: StrValue[], id: IntValue): string
  getCorrespondingValueFromList(list: Vec3Value[], id: IntValue): vec3
  getCorrespondingValueFromList<
    T extends
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
  >(list: RuntimeParameterValueTypeMap[T][], id: IntValue): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      list
    )
    const listObj = parseValue(list, `${genericType}_list`)
    const idObj = parseValue(id, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_corresponding_value_from_list',
      args: [listObj, idObj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'value', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Returns the length of the list (number of elements)
   *
   * 获取列表长度: 获取列表长度（列表中的元素个数）
   *
   * @param list
   *
   * 列表
   *
   * @returns
   *
   * 长度
   */
  getListLength(list: FloatValue[]): bigint
  getListLength(list: IntValue[]): bigint
  getListLength(list: BoolValue[]): bigint
  getListLength(list: ConfigIdValue[]): bigint
  getListLength(list: EntityValue[]): bigint
  getListLength(list: FactionValue[]): bigint
  getListLength(list: GuidValue[]): bigint
  getListLength(list: PrefabIdValue[]): bigint
  getListLength(list: StrValue[]): bigint
  getListLength(list: Vec3Value[]): bigint
  getListLength<
    T extends
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
  >(list: RuntimeParameterValueTypeMap[T][]): bigint {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      list
    )
    const listObj = parseValue(list, `${genericType}_list`)
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_list_length',
      args: [listObj]
    })
    const ret = new int()
    ret.markPin(ref, 'length', 0)
    return ret as unknown as bigint
  }

  /**
   * Applies only to Floating Point Number or Integer lists; returns the maximum value
   *
   * 获取列表最大值: 仅对浮点数列表和整数列表有意义，返回列表中的最大值
   *
   * @param list
   *
   * 列表
   *
   * @returns
   *
   * 最大值
   */
  getMaximumValueFromList(list: FloatValue[]): number
  getMaximumValueFromList(list: IntValue[]): bigint
  getMaximumValueFromList<T extends 'float' | 'int'>(
    list: RuntimeParameterValueTypeMap[T][]
  ): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(['float', 'int'], list)
    const listObj = parseValue(list, `${genericType}_list`)
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_maximum_value_from_list',
      args: [listObj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'maximumValue', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Applies only to Floating Point Number or Integer lists; returns the minimum value
   *
   * 获取列表最小值: 仅对浮点数列表和整数列表有意义，返回列表中的最小值
   *
   * @param list
   *
   * 列表
   *
   * @returns
   *
   * 最小值
   */
  getMinimumValueFromList(list: FloatValue[]): number
  getMinimumValueFromList(list: IntValue[]): bigint
  getMinimumValueFromList<T extends 'float' | 'int'>(
    list: RuntimeParameterValueTypeMap[T][]
  ): RuntimeReturnValueTypeMap[T] {
    const genericType = matchTypes(['float', 'int'], list)
    const listObj = parseValue(list, `${genericType}_list`)
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_minimum_value_from_list',
      args: [listObj]
    })
    const ret = new ValueClassMap[genericType]()
    ret.markPin(ref, 'minimumValue', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[T]
  }

  /**
   * Returns whether the list contains the specified value
   *
   * 列表是否包含该值: 返回列表中是否包含指定值
   *
   * @param list
   *
   * 列表
   * @param value
   *
   * 值
   *
   * @returns
   *
   * 是否包含
   */
  listIncludesThisValue(list: FloatValue[], value: FloatValue): boolean
  listIncludesThisValue(list: IntValue[], value: IntValue): boolean
  listIncludesThisValue(list: BoolValue[], value: BoolValue): boolean
  listIncludesThisValue(list: ConfigIdValue[], value: ConfigIdValue): boolean
  listIncludesThisValue(list: EntityValue[], value: EntityValue): boolean
  listIncludesThisValue(list: FactionValue[], value: FactionValue): boolean
  listIncludesThisValue(list: GuidValue[], value: GuidValue): boolean
  listIncludesThisValue(list: PrefabIdValue[], value: PrefabIdValue): boolean
  listIncludesThisValue(list: StrValue[], value: StrValue): boolean
  listIncludesThisValue(list: Vec3Value[], value: Vec3Value): boolean
  listIncludesThisValue<
    T extends
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
  >(list: RuntimeParameterValueTypeMap[T][], value: RuntimeParameterValueTypeMap[T]): boolean {
    const genericType = matchTypes(
      [
        'float',
        'int',
        'bool',
        'config_id',
        'entity',
        'faction',
        'guid',
        'prefab_id',
        'str',
        'vec3'
      ],
      list,
      value
    )
    const listObj = parseValue(list, `${genericType}_list`)
    const valueObj = parseValue(value, genericType)
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'list_includes_this_value',
      args: [listObj, valueObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'include', 0)
    return ret as unknown as boolean
  }

  /**
   * Returns the value of the specified Preset Status for the Target Entity. Returns 0 if the Entity does not have that Preset Status
   *
   * 获取预设状态: 获取目标实体的指定预设状态的预设状态值。如果该实体没有指定的预设状态，则返回0
   *
   * @param targetEntity
   *
   * 目标实体
   * @param presetStatusIndex
   *
   * 预设状态索引
   *
   * @returns
   *
   * 预设状态值
   */
  getPresetStatus(targetEntity: EntityValue, presetStatusIndex: IntValue): bigint {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const presetStatusIndexObj = parseValue(presetStatusIndex, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_preset_status',
      args: [targetEntityObj, presetStatusIndexObj]
    })
    const ret = new int()
    ret.markPin(ref, 'presetStatusValue', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns the preset status value of the specified complex creation
   *
   * 获取复杂造物的预设状态值: 查询指定复杂造物的预设状态值
   *
   * @param targetEntity
   *
   * 目标实体
   * @param presetStatusIndex
   *
   * 预设状态索引
   *
   * @returns
   *
   * 预设状态值
   */
  getThePresetStatusValueOfTheComplexCreation(
    targetEntity: CreationEntity,
    presetStatusIndex: IntValue
  ): bigint {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const presetStatusIndexObj = parseValue(presetStatusIndex, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_the_preset_status_value_of_the_complex_creation',
      args: [targetEntityObj, presetStatusIndexObj]
    })
    const ret = new int()
    ret.markPin(ref, 'presetStatusValue', 0)
    return ret as unknown as bigint
  }

  /**
   * Can only be searched when the Character has the [Monitor Movement Speed] Unit Status effect
   *
   * 查询角色当前移动速度: 仅当角色拥有【监听移动速率】的单位状态效果时，才能查询
   *
   * GSTS Note: The speed obtained is the actual movement speed, not the expected speed, and will be 0 when actually blocked, even when in motion
   *
   * GSTS 注: 获取到的速度是真实的运动速度, 而非期望速度, 被实际阻挡时速度将为0, 即使在运动
   *
   * @param characterEntity
   *
   * 角色实体
   */
  queryCharacterSCurrentMovementSpd(characterEntity: CharacterEntity): {
    /**
     *
     * 当前速度
     */
    currentSpeed: number
    /**
     *
     * 速度向量
     */
    velocityVector: vec3
  } {
    const characterEntityObj = parseValue(characterEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_character_s_current_movement_spd',
      args: [characterEntityObj]
    })
    return {
      currentSpeed: (() => {
        const ret = new float()
        ret.markPin(ref, 'currentSpeed', 0)
        return ret as unknown as number
      })(),
      velocityVector: (() => {
        const ret = new vec3()
        ret.markPin(ref, 'velocityVector', 1)
        return ret as unknown as vec3
      })()
    }
  }

  /**
   * Searches whether the specified Entity is present; Note that Character Entities are still considered present even when Downed
   *
   * 查询实体是否在场: 查询指定实体是否在场; 注意角色实体即使处于倒下状态，仍然认为在场
   *
   * @param targetEntity
   *
   * 目标实体
   *
   * @returns
   *
   * 是否在场
   */
  queryIfEntityIsOnTheField(targetEntity: EntityValue): boolean {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_if_entity_is_on_the_field',
      args: [targetEntityObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'onTheField', 0)
    return ret as unknown as boolean
  }

  /**
   * Returns all Entities currently present in the scene. The number of Entities in this List may be large
   *
   * 获取场上所有实体: 获取当前场上所有在场的实体，该实体列表的数量可能会较大
   *
   * @returns
   *
   * 实体列表
   */
  getAllEntitiesOnTheField(): entity[] {
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_all_entities_on_the_field',
      args: []
    })
    const ret = new list('entity')
    ret.markPin(ref, 'entityList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Returns all Entities of the specified type currently in the scene. The number of Entities in this list may be large
   *
   * 获取场上指定类型实体: 获取当前场上指定类型的所有实体，该实体列表的数量可能会较大
   *
   * @param entityType Includes Stage, Object, Player, Character, Creation
   *
   * 实体类型: 分为关卡、物件、玩家、角色、造物
   *
   * @returns
   *
   * 实体列表
   */
  getSpecifiedTypeOfEntitiesOnTheField(entityType: EntityType): entity[] {
    const entityTypeObj = parseValue(entityType, 'enumeration')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_specified_type_of_entities_on_the_field',
      args: [entityTypeObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'entityList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Returns all Entities currently in the scene that were created by the specified Prefab ID
   *
   * 获取场上指定元件ID的实体: 获取当前场上通过指定元件ID创建的所有实体
   *
   * @param prefabId
   *
   * 元件ID
   *
   * @returns
   *
   * 实体列表
   */
  getEntitiesWithSpecifiedPrefabOnTheField(prefabId: PrefabIdValue): entity[] {
    const prefabIdObj = parseValue(prefabId, 'prefab_id')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entities_with_specified_prefab_on_the_field',
      args: [prefabIdObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'entityList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Returns the Base Attributes of the Character Entity
   *
   * 获取角色属性: 获取角色实体的基础属性
   *
   * @param targetEntity
   *
   * 目标实体
   */
  getCharacterAttribute(targetEntity: CharacterEntity): {
    /**
     *
     * 等级
     */
    level: bigint
    /**
     *
     * 当前生命值
     */
    currentHp: number
    /**
     *
     * 上限生命值
     */
    maxHp: number
    /**
     *
     * 当前攻击力
     */
    currentAtk: number
    /**
     *
     * 基础攻击力
     */
    baseAtk: number
    /**
     *
     * 当前防御力
     */
    currentDef: number
    /**
     *
     * 基础防御力
     */
    baseDef: number
    /**
     *
     * 受打断值上限
     */
    interruptValueThreshold: number
    /**
     *
     * 当前受打断值
     */
    currentInterruptValue: number
    /**
     *
     * 当前受打断状态
     */
    currentInterruptStatus: InterruptStatus
  } {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_character_attribute',
      args: [targetEntityObj]
    })
    return {
      level: (() => {
        const ret = new int()
        ret.markPin(ref, 'level', 0)
        return ret as unknown as bigint
      })(),
      currentHp: (() => {
        const ret = new float()
        ret.markPin(ref, 'currentHp', 1)
        return ret as unknown as number
      })(),
      maxHp: (() => {
        const ret = new float()
        ret.markPin(ref, 'maxHp', 2)
        return ret as unknown as number
      })(),
      currentAtk: (() => {
        const ret = new float()
        ret.markPin(ref, 'currentAtk', 3)
        return ret as unknown as number
      })(),
      baseAtk: (() => {
        const ret = new float()
        ret.markPin(ref, 'baseAtk', 4)
        return ret as unknown as number
      })(),
      currentDef: (() => {
        const ret = new float()
        ret.markPin(ref, 'currentDef', 5)
        return ret as unknown as number
      })(),
      baseDef: (() => {
        const ret = new float()
        ret.markPin(ref, 'baseDef', 6)
        return ret as unknown as number
      })(),
      interruptValueThreshold: (() => {
        const ret = new float()
        ret.markPin(ref, 'interruptValueThreshold', 7)
        return ret as unknown as number
      })(),
      currentInterruptValue: (() => {
        const ret = new float()
        ret.markPin(ref, 'currentInterruptValue', 8)
        return ret as unknown as number
      })(),
      currentInterruptStatus: (() => {
        const ret = new enumeration('InterruptStatus')
        ret.markPin(ref, 'currentInterruptStatus', 9)
        return ret as unknown as InterruptStatus
      })()
    }
  }

  /**
   * Returns the Advanced Attributes of the Entity
   *
   * 获取实体进阶属性: 获取实体的进阶属性
   *
   * @param targetEntity
   *
   * 目标实体
   */
  getEntityAdvancedAttribute(targetEntity: EntityValue): {
    /**
     *
     * 暴击率
     */
    critRate: number
    /**
     *
     * 暴击伤害
     */
    critDmg: number
    /**
     *
     * 治疗加成
     */
    healingBonus: number
    /**
     *
     * 受治疗加成
     */
    incomingHealingBonus: number
    /**
     *
     * 元素充能效率
     */
    energyRecharge: number
    /**
     *
     * 冷却缩减
     */
    cdReduction: number
    /**
     *
     * 护盾强效
     */
    shieldStrength: number
  } {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_advanced_attribute',
      args: [targetEntityObj]
    })
    return {
      critRate: (() => {
        const ret = new float()
        ret.markPin(ref, 'critRate', 0)
        return ret as unknown as number
      })(),
      critDmg: (() => {
        const ret = new float()
        ret.markPin(ref, 'critDmg', 1)
        return ret as unknown as number
      })(),
      healingBonus: (() => {
        const ret = new float()
        ret.markPin(ref, 'healingBonus', 2)
        return ret as unknown as number
      })(),
      incomingHealingBonus: (() => {
        const ret = new float()
        ret.markPin(ref, 'incomingHealingBonus', 3)
        return ret as unknown as number
      })(),
      energyRecharge: (() => {
        const ret = new float()
        ret.markPin(ref, 'energyRecharge', 4)
        return ret as unknown as number
      })(),
      cdReduction: (() => {
        const ret = new float()
        ret.markPin(ref, 'cdReduction', 5)
        return ret as unknown as number
      })(),
      shieldStrength: (() => {
        const ret = new float()
        ret.markPin(ref, 'shieldStrength', 6)
        return ret as unknown as number
      })()
    }
  }

  /**
   * Returns the Entity Type of the Target Entity
   *
   * 获取实体类型: 获取目标实体的实体类型
   *
   * @param targetEntity
   *
   * 目标实体
   *
   * @returns Includes Player, Character, Stage, Object, Creation.
   *
   * 实体类型: 分为玩家、角色、关卡、物件、造物
   */
  getEntityType(targetEntity: EntityValue): EntityType {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_type',
      args: [targetEntityObj]
    })
    const ret = new enumeration('EntityType')
    ret.markPin(ref, 'entityType', 0)
    return ret as unknown as EntityType
  }

  /**
   * Returns the Location and Rotation of the Target Entity; Not applicable to Player Entities or Stage Entities
   *
   * 获取实体位置与旋转: 获取目标实体的位置和旋转; 对玩家实体和关卡实体无意义
   *
   * @param targetEntity
   *
   * 目标实体
   */
  getEntityLocationAndRotation(targetEntity: EntityOf<'character' | 'object' | 'creation'>): {
    /**
     *
     * 位置
     */
    location: vec3
    /**
     *
     * 旋转
     */
    rotate: vec3
  } {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_location_and_rotation',
      args: [targetEntityObj]
    })
    return {
      location: (() => {
        const ret = new vec3()
        ret.markPin(ref, 'location', 0)
        return ret as unknown as vec3
      })(),
      rotate: (() => {
        const ret = new vec3()
        ret.markPin(ref, 'rotate', 1)
        return ret as unknown as vec3
      })()
    }
  }

  /**
   * Returns the Forward Vector of the specified Entity (the positive Z-axis direction in the Entity's relative coordinate system)
   *
   * 获取实体向前向量: 获取指定实体的向前向量（即该实体本地坐标系下的z轴正方向朝向）
   *
   * @param targetEntity
   *
   * 目标实体
   *
   * @returns
   *
   * 向前向量
   */
  getEntityForwardVector(targetEntity: EntityValue): vec3 {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_forward_vector',
      args: [targetEntityObj]
    })
    const ret = new vec3()
    ret.markPin(ref, 'forwardVector', 0)
    return ret as unknown as vec3
  }

  /**
   * Returns the Upward Vector of the specified Entity (the positive Y-axis direction in the Entity's relative coordinate system)
   *
   * 获取实体向上向量: 获取指定实体的向上向量（即该实体本地坐标系下的y轴正方向朝向）
   *
   * @param targetEntity
   *
   * 目标实体
   *
   * @returns
   *
   * 向上向量
   */
  getEntityUpwardVector(targetEntity: EntityValue): vec3 {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_upward_vector',
      args: [targetEntityObj]
    })
    const ret = new vec3()
    ret.markPin(ref, 'upwardVector', 0)
    return ret as unknown as vec3
  }

  /**
   * Returns the Right Vector of the specified Entity (the positive X-axis direction in the Entity's relative coordinate system)
   *
   * 获取实体向右向量: 获取指定实体的向右向量（即该实体本地坐标系下的x轴正方向朝向）
   *
   * @param targetEntity
   *
   * 目标实体
   *
   * @returns
   *
   * 向右向量
   */
  getEntityRightVector(targetEntity: EntityValue): vec3 {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_right_vector',
      args: [targetEntityObj]
    })
    const ret = new vec3()
    ret.markPin(ref, 'rightVector', 0)
    return ret as unknown as vec3
  }

  /**
   * Returns a list of all Entities owned by the Target Entity
   *
   * 获取实体拥有的实体列表: 获取所有以目标实体为拥有者的实体组成的列表
   *
   * @param targetEntity
   *
   * 目标实体
   *
   * @returns
   *
   * 实体列表
   */
  getListOfEntitiesOwnedByTheEntity(targetEntity: EntityValue): entity[] {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_list_of_entities_owned_by_the_entity',
      args: [targetEntityObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'entityList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Returns the Element Attributes of the Target Entity
   *
   * 获取实体元素属性: 获取目标实体的元素相关属性
   *
   * @param targetEntity
   *
   * 目标实体
   */
  getEntityElementalAttribute(targetEntity: EntityValue): {
    /**
     *
     * 火元素伤害加成
     */
    pyroDmgBonus: number
    /**
     *
     * 火元素抗性
     */
    pyroRes: number
    /**
     *
     * 水元素伤害加成
     */
    hydroDmgBonus: number
    /**
     *
     * 水元素抗性
     */
    hydroRes: number
    /**
     *
     * 草元素伤害加成
     */
    dendroDmgBonus: number
    /**
     *
     * 草元素抗性
     */
    dendroRes: number
    /**
     *
     * 雷元素伤害加成
     */
    electroDmgBonus: number
    /**
     *
     * 雷元素抗性
     */
    electroRes: number
    /**
     *
     * 风元素伤害加成
     */
    anemoDmgBonus: number
    /**
     *
     * 风元素抗性
     */
    anemoRes: number
    /**
     *
     * 冰元素伤害加成
     */
    cryoDmgBonus: number
    /**
     *
     * 冰元素抗性
     */
    cryoRes: number
    /**
     *
     * 岩元素伤害加成
     */
    geoDmgBonus: number
    /**
     *
     * 岩元素抗性
     */
    geoRes: number
    /**
     *
     * 物理伤害加成
     */
    physicalDmgBonus: number
    /**
     *
     * 物理抗性
     */
    physicalRes: number
  } {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_elemental_attribute',
      args: [targetEntityObj]
    })
    return {
      pyroDmgBonus: (() => {
        const ret = new float()
        ret.markPin(ref, 'pyroDmgBonus', 0)
        return ret as unknown as number
      })(),
      pyroRes: (() => {
        const ret = new float()
        ret.markPin(ref, 'pyroRes', 1)
        return ret as unknown as number
      })(),
      hydroDmgBonus: (() => {
        const ret = new float()
        ret.markPin(ref, 'hydroDmgBonus', 2)
        return ret as unknown as number
      })(),
      hydroRes: (() => {
        const ret = new float()
        ret.markPin(ref, 'hydroRes', 3)
        return ret as unknown as number
      })(),
      dendroDmgBonus: (() => {
        const ret = new float()
        ret.markPin(ref, 'dendroDmgBonus', 4)
        return ret as unknown as number
      })(),
      dendroRes: (() => {
        const ret = new float()
        ret.markPin(ref, 'dendroRes', 5)
        return ret as unknown as number
      })(),
      electroDmgBonus: (() => {
        const ret = new float()
        ret.markPin(ref, 'electroDmgBonus', 6)
        return ret as unknown as number
      })(),
      electroRes: (() => {
        const ret = new float()
        ret.markPin(ref, 'electroRes', 7)
        return ret as unknown as number
      })(),
      anemoDmgBonus: (() => {
        const ret = new float()
        ret.markPin(ref, 'anemoDmgBonus', 8)
        return ret as unknown as number
      })(),
      anemoRes: (() => {
        const ret = new float()
        ret.markPin(ref, 'anemoRes', 9)
        return ret as unknown as number
      })(),
      cryoDmgBonus: (() => {
        const ret = new float()
        ret.markPin(ref, 'cryoDmgBonus', 10)
        return ret as unknown as number
      })(),
      cryoRes: (() => {
        const ret = new float()
        ret.markPin(ref, 'cryoRes', 11)
        return ret as unknown as number
      })(),
      geoDmgBonus: (() => {
        const ret = new float()
        ret.markPin(ref, 'geoDmgBonus', 12)
        return ret as unknown as number
      })(),
      geoRes: (() => {
        const ret = new float()
        ret.markPin(ref, 'geoRes', 13)
        return ret as unknown as number
      })(),
      physicalDmgBonus: (() => {
        const ret = new float()
        ret.markPin(ref, 'physicalDmgBonus', 14)
        return ret as unknown as number
      })(),
      physicalRes: (() => {
        const ret = new float()
        ret.markPin(ref, 'physicalRes', 15)
        return ret as unknown as number
      })()
    }
  }

  /**
   * Check entity's elemental effect status
   *
   * 查询实体的元素附着状态
   *
   * @param targetEntity
   *
   * 目标实体
   */
  checkEntitySElementalEffectStatus(targetEntity: EntityValue): {
    /**
     *
     * 是否附着水元素
     */
    affectedByHydro: boolean
    /**
     *
     * 是否附着冰元素
     */
    affectedByCryo: boolean
    /**
     *
     * 是否附着雷元素
     */
    affectedByElectro: boolean
    /**
     *
     * 是否附着火元素
     */
    affectedByPyro: boolean
    /**
     *
     * 是否附着草元素
     */
    affectedByDendro: boolean
    /**
     *
     * 是否附着风元素
     */
    affectedByAnemo: boolean
    /**
     *
     * 是否附着岩元素
     */
    affectedByGeo: boolean
    /**
     *
     * 是否处于冻结
     */
    affectedByFrozen: boolean
    /**
     *
     * 是否处于感电（不包含月感电）
     */
    affectedByElectroCharged: boolean
    /**
     *
     * 是否处于燃烧
     */
    affectedByBurning: boolean
    /**
     *
     * 是否处于石化
     */
    affectedByPetrification: boolean
    /**
     *
     * 是否处于激化
     */
    affectedByCatalyze: boolean
  } {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'check_entity_s_elemental_effect_status',
      args: [targetEntityObj]
    })
    return {
      affectedByHydro: (() => {
        const ret = new bool()
        ret.markPin(ref, 'affectedByHydro', 0)
        return ret as unknown as boolean
      })(),
      affectedByCryo: (() => {
        const ret = new bool()
        ret.markPin(ref, 'affectedByCryo', 1)
        return ret as unknown as boolean
      })(),
      affectedByElectro: (() => {
        const ret = new bool()
        ret.markPin(ref, 'affectedByElectro', 2)
        return ret as unknown as boolean
      })(),
      affectedByPyro: (() => {
        const ret = new bool()
        ret.markPin(ref, 'affectedByPyro', 3)
        return ret as unknown as boolean
      })(),
      affectedByDendro: (() => {
        const ret = new bool()
        ret.markPin(ref, 'affectedByDendro', 4)
        return ret as unknown as boolean
      })(),
      affectedByAnemo: (() => {
        const ret = new bool()
        ret.markPin(ref, 'affectedByAnemo', 5)
        return ret as unknown as boolean
      })(),
      affectedByGeo: (() => {
        const ret = new bool()
        ret.markPin(ref, 'affectedByGeo', 6)
        return ret as unknown as boolean
      })(),
      affectedByFrozen: (() => {
        const ret = new bool()
        ret.markPin(ref, 'affectedByFrozen', 7)
        return ret as unknown as boolean
      })(),
      affectedByElectroCharged: (() => {
        const ret = new bool()
        ret.markPin(ref, 'affectedByElectroCharged', 8)
        return ret as unknown as boolean
      })(),
      affectedByBurning: (() => {
        const ret = new bool()
        ret.markPin(ref, 'affectedByBurning', 9)
        return ret as unknown as boolean
      })(),
      affectedByPetrification: (() => {
        const ret = new bool()
        ret.markPin(ref, 'affectedByPetrification', 10)
        return ret as unknown as boolean
      })(),
      affectedByCatalyze: (() => {
        const ret = new bool()
        ret.markPin(ref, 'affectedByCatalyze', 11)
        return ret as unknown as boolean
      })()
    }
  }

  /**
   * Returns the Base Attributes of the Object
   *
   * 获取物件属性: 获取物件的相关基础属性
   *
   * @param objectEntity
   *
   * 物件实体
   */
  getObjectAttribute(objectEntity: ObjectEntity): {
    /**
     *
     * 等级
     */
    level: bigint
    /**
     *
     * 当前生命值
     */
    currentHp: number
    /**
     *
     * 上限生命值
     */
    maxHp: number
    /**
     *
     * 当前攻击力
     */
    currentAtk: number
    /**
     *
     * 基础攻击力
     */
    baseAtk: number
    /**
     *
     * 当前防御力
     */
    currentDef: number
    /**
     *
     * 基础防御力
     */
    baseDef: number
  } {
    const objectEntityObj = parseValue(objectEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_object_attribute',
      args: [objectEntityObj]
    })
    return {
      level: (() => {
        const ret = new int()
        ret.markPin(ref, 'level', 0)
        return ret as unknown as bigint
      })(),
      currentHp: (() => {
        const ret = new float()
        ret.markPin(ref, 'currentHp', 1)
        return ret as unknown as number
      })(),
      maxHp: (() => {
        const ret = new float()
        ret.markPin(ref, 'maxHp', 2)
        return ret as unknown as number
      })(),
      currentAtk: (() => {
        const ret = new float()
        ret.markPin(ref, 'currentAtk', 3)
        return ret as unknown as number
      })(),
      baseAtk: (() => {
        const ret = new float()
        ret.markPin(ref, 'baseAtk', 4)
        return ret as unknown as number
      })(),
      currentDef: (() => {
        const ret = new float()
        ret.markPin(ref, 'currentDef', 5)
        return ret as unknown as number
      })(),
      baseDef: (() => {
        const ret = new float()
        ret.markPin(ref, 'baseDef', 6)
        return ret as unknown as number
      })()
    }
  }

  /**
   * Returns the Owner Entity of the specified Target Entity
   *
   * 获取拥有者实体: 获取指定目标实体的拥有者实体
   *
   * @param targetEntity
   *
   * 目标实体
   *
   * @returns
   *
   * 拥有者实体
   */
  getOwnerEntity(targetEntity: EntityValue): entity {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_owner_entity',
      args: [targetEntityObj]
    })
    const ret = new entity()
    ret.markPin(ref, 'ownerEntity', 0)
    return ret as unknown as entity
  }

  /**
   * Returns a list of Entities within a specified spherical range from the Target Entity List
   *
   * 获取指定范围的实体列表: 在目标实体列表中获取指定球形范围内的实体列表
   *
   * @param targetEntityList
   *
   * 目标实体列表
   * @param centerPoint
   *
   * 中心点
   * @param radius
   *
   * 半径
   *
   * @returns
   *
   * 结果列表
   */
  getEntityListBySpecifiedRange(
    targetEntityList: EntityValue[],
    centerPoint: Vec3Value,
    radius: FloatValue
  ): entity[] {
    const targetEntityListObj = parseValue(targetEntityList, 'entity_list')
    const centerPointObj = parseValue(centerPoint, 'vec3')
    const radiusObj = parseValue(radius, 'float')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_list_by_specified_range',
      args: [targetEntityListObj, centerPointObj, radiusObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'resultList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Returns a list of specified Entity types from the Target Entity List
   *
   * 获取指定类型的实体列表: 在目标实体列表中获取指定类型的实体列表
   *
   * @param targetEntityList
   *
   * 目标实体列表
   * @param entityType Includes Player, Character, Stage, Object, Creation.
   *
   * 实体类型: 分为玩家、角色、关卡、物件、造物
   *
   * @returns
   *
   * 结果列表
   */
  getEntityListBySpecifiedType(targetEntityList: EntityValue[], entityType: EntityType): entity[] {
    const targetEntityListObj = parseValue(targetEntityList, 'entity_list')
    const entityTypeObj = parseValue(entityType, 'enumeration')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_list_by_specified_type',
      args: [targetEntityListObj, entityTypeObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'resultList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Returns a list of Entities created with the specified Prefab ID from the Target Entity List
   *
   * 获取指定元件ID的实体列表: 在目标实体列表中获取以指定元件ID创建的实体列表
   *
   * @param targetEntityList
   *
   * 目标实体列表
   * @param prefabId
   *
   * 元件ID
   *
   * @returns
   *
   * 结果列表
   */
  getEntityListBySpecifiedPrefabId(
    targetEntityList: EntityValue[],
    prefabId: PrefabIdValue
  ): entity[] {
    const targetEntityListObj = parseValue(targetEntityList, 'entity_list')
    const prefabIdObj = parseValue(prefabId, 'prefab_id')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_list_by_specified_prefab_id',
      args: [targetEntityListObj, prefabIdObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'resultList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Returns the list of Entities belonging to a specific Faction from the Target Entity List
   *
   * 获取指定阵营的实体列表: 在目标实体列表中获取归属于某个阵营的实体列表
   *
   * @param targetEntityList
   *
   * 目标实体列表
   * @param faction
   *
   * 阵营
   *
   * @returns
   *
   * 结果列表
   */
  getEntityListBySpecifiedFaction(
    targetEntityList: EntityValue[],
    faction: FactionValue
  ): entity[] {
    const targetEntityListObj = parseValue(targetEntityList, 'entity_list')
    const factionObj = parseValue(faction, 'faction')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_list_by_specified_faction',
      args: [targetEntityListObj, factionObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'resultList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Returns the Entity associated with this Node Graph
   *
   * 获取自身实体: 返回该节点图所关联的实体
   *
   * @returns
   *
   * 自身实体
   */
  getSelfEntity(): entity {
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_self_entity',
      args: []
    })
    const ret = new entity()
    ret.markPin(ref, 'selfEntity', 0)
    return ret as unknown as entity
  }

  /**
   * Searches for the GUID of the specified Entity
   *
   * 以实体查询GUID: 查询指定实体的GUID
   *
   * @param entity
   *
   * 实体
   *
   * @returns
   *
   * GUID
   */
  queryGuidByEntity(entity: EntityValue): guid {
    const entityObj = parseValue(entity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_guid_by_entity',
      args: [entityObj]
    })
    const ret = new guid()
    ret.markPin(ref, 'guid', 0)
    return ret as unknown as guid
  }

  /**
   * Searches for an Entity by GUID
   *
   * 以GUID查询实体: 根据GUID查询实体
   *
   * @param guid
   *
   * GUID
   *
   * @returns
   *
   * 实体
   */
  queryEntityByGuid(guid: GuidValue): entity {
    const guidObj = parseValue(guid, 'guid')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_entity_by_guid',
      args: [guidObj]
    })
    const ret = new entity()
    ret.markPin(ref, 'entity', 0)
    return ret as unknown as entity
  }

  /**
   * Searches the current Environment Time, in the range [0, 24)
   *
   * 查询当前环境时间: 查询当前的环境时间，范围为[0,24)
   */
  queryCurrentEnvironmentTime(): {
    /**
     * The value range is [0, 24)
     *
     * 当前环境时间: 获取到的值范围为[0,24)
     */
    currentEnvironmentTime: number
    /**
     * Number of Loop Days elapsed
     *
     * 当前循环天数: 当前已经循环了多少天
     */
    currentLoopDay: bigint
  } {
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_current_environment_time',
      args: []
    })
    return {
      currentEnvironmentTime: (() => {
        const ret = new float()
        ret.markPin(ref, 'currentEnvironmentTime', 0)
        return ret as unknown as number
      })(),
      currentLoopDay: (() => {
        const ret = new int()
        ret.markPin(ref, 'currentLoopDay', 1)
        return ret as unknown as bigint
      })()
    }
  }

  /**
   * Searches how long the game has been running, in seconds
   *
   * 查询游戏已进行时间: 查询游戏已进行了多长时间，单位秒
   *
   * @returns
   *
   * 游戏已进行时间
   */
  queryGameTimeElapsed(): bigint {
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_game_time_elapsed',
      args: []
    })
    const ret = new int()
    ret.markPin(ref, 'gameTimeElapsed', 0)
    return ret as unknown as bigint
  }

  /**
   * Searches the Faction of the specified Entity
   *
   * 查询实体阵营: 查询指定实体的阵营
   *
   * @param targetEntity
   *
   * 目标实体
   *
   * @returns
   *
   * 阵营
   */
  queryEntityFaction(targetEntity: EntityValue): faction {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_entity_faction',
      args: [targetEntityObj]
    })
    const ret = new faction()
    ret.markPin(ref, 'faction', 0)
    return ret as unknown as faction
  }

  /**
   * Searches whether two Factions are hostile to each other
   *
   * 查询阵营是否敌对: 查询两个阵营是否敌对
   *
   * @param faction1
   *
   * 阵营1
   * @param faction2
   *
   * 阵营2
   *
   * @returns
   *
   * 是否敌对
   */
  queryIfFactionIsHostile(faction1: FactionValue, faction2: FactionValue): boolean {
    const faction1Obj = parseValue(faction1, 'faction')
    const faction2Obj = parseValue(faction2, 'faction')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_if_faction_is_hostile',
      args: [faction1Obj, faction2Obj]
    })
    const ret = new bool()
    ret.markPin(ref, 'hostile', 0)
    return ret as unknown as boolean
  }

  /**
   * Check if all of the player's characters are downed
   *
   * 查询玩家角色是否全部倒下: 查询玩家的所有角色是否已全部倒下
   *
   * @param playerEntity
   *
   * 玩家实体
   *
   * @returns
   *
   * 结果
   */
  queryIfAllPlayerCharactersAreDown(playerEntity: PlayerEntity): boolean {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_if_all_player_characters_are_down',
      args: [playerEntityObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'result', 0)
    return ret as unknown as boolean
  }

  /**
   * Returns the Player GUID based on Player ID, where the ID indicates which Player they are
   *
   * 根据玩家序号获取玩家GUID: 根据玩家序号获取玩家GUID，玩家序号即该玩家为玩家几
   *
   * GSTS Note: The ID starts from 1
   *
   * GSTS 注: 从1开始
   *
   * @param playerId
   *
   * 玩家序号
   *
   * @returns
   *
   * 玩家GUID
   */
  getPlayerGuidByPlayerId(playerId: IntValue): guid {
    const playerIdObj = parseValue(playerId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_guid_by_player_id',
      args: [playerIdObj]
    })
    const ret = new guid()
    ret.markPin(ref, 'playerGuid', 0)
    return ret as unknown as guid
  }

  /**
   * Returns the Player ID based on Player GUID, where the ID indicates which Player they are
   *
   * 根据玩家GUID获取玩家序号: 根据玩家GUID获取玩家序号，玩家序号即该玩家为玩家几
   *
   * @param playerGuid
   *
   * 玩家GUID
   *
   * @returns
   *
   * 玩家序号
   */
  getPlayerIdByPlayerGuid(playerGuid: GuidValue): bigint {
    const playerGuidObj = parseValue(playerGuid, 'guid')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_id_by_player_guid',
      args: [playerGuidObj]
    })
    const ret = new int()
    ret.markPin(ref, 'playerId', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns the Player's local input device type, as determined by the Interface mapping method
   *
   * 获得玩家客户端输入设备类型: 获得玩家的客户端输入设备类型，根据用户界面的映射方式决定
   *
   * @param playerEntity
   *
   * 玩家实体
   *
   * @returns Includes keyboard/mouse, gamepad, touchscreen
   *
   * 输入设备类型: 分为键盘鼠标、手柄、触屏
   */
  getPlayerClientInputDeviceType(playerEntity: PlayerEntity): InputDeviceType {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_client_input_device_type',
      args: [playerEntityObj]
    })
    const ret = new enumeration('InputDeviceType')
    ret.markPin(ref, 'inputDeviceType', 0)
    return ret as unknown as InputDeviceType
  }

  /**
   * Returns the Player Entity that owns the Character Entity
   *
   * 获取角色归属的玩家实体: 获取角色实体所归属的玩家实体
   *
   * @param characterEntity
   *
   * 角色实体
   *
   * @returns
   *
   * 所属玩家实体
   */
  getPlayerEntityToWhichTheCharacterBelongs(characterEntity: CharacterEntity): PlayerEntity {
    const characterEntityObj = parseValue(characterEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_entity_to_which_the_character_belongs',
      args: [characterEntityObj]
    })
    const ret = new entity()
    ret.markPin(ref, 'affiliatedPlayerEntity', 0)
    return ret as unknown as PlayerEntity
  }

  /**
   * Returns the revive duration of the specified Player Entity, in seconds
   *
   * 获取玩家复苏耗时: 获取指定玩家实体的复苏耗时，单位秒
   *
   * @param playerEntity
   *
   * 玩家实体
   *
   * @returns
   *
   * 时长
   */
  getPlayerReviveTime(playerEntity: PlayerEntity): bigint {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_revive_time',
      args: [playerEntityObj]
    })
    const ret = new int()
    ret.markPin(ref, 'duration', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns the Player's nickname
   *
   * 获取玩家昵称: 获取玩家的昵称
   *
   * @param playerEntity
   *
   * 玩家实体
   *
   * @returns
   *
   * 玩家昵称
   */
  getPlayerNickname(playerEntity: PlayerEntity): string {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_nickname',
      args: [playerEntityObj]
    })
    const ret = new str()
    ret.markPin(ref, 'playerNickname', 0)
    return ret as unknown as string
  }

  /**
   * Returns the remaining number of revives for the specified Player Entity
   *
   * 获取玩家剩余复苏次数: 获取指定玩家实体的剩余复苏次数
   *
   * @param playerEntity
   *
   * 玩家实体
   *
   * @returns
   *
   * 剩余次数
   */
  getPlayerRemainingRevives(playerEntity: PlayerEntity): bigint {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_remaining_revives',
      args: [playerEntityObj]
    })
    const ret = new int()
    ret.markPin(ref, 'remainingTimes', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns a list of all Player Entities present in the scene
   *
   * 获取在场玩家实体列表: 获取在场所有玩家实体组成的列表
   *
   * @returns
   *
   * 玩家实体列表
   */
  getListOfPlayerEntitiesOnTheField(): PlayerEntity[] {
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_list_of_player_entities_on_the_field',
      args: []
    })
    const ret = new list('entity')
    ret.markPin(ref, 'playerEntityList', 0)
    return ret as unknown as PlayerEntity[]
  }

  /**
   * Returns a list of all Character Entities for the specified Player Entity
   *
   * 获取指定玩家所有角色实体: 获取指定玩家实体的所有角色实体列表
   *
   * @param playerEntity
   *
   * 玩家实体
   *
   * @returns
   *
   * 角色实体列表
   */
  getAllCharacterEntitiesOfSpecifiedPlayer(playerEntity: PlayerEntity): CharacterEntity[] {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_all_character_entities_of_specified_player',
      args: [playerEntityObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'characterEntityList', 0)
    return ret as unknown as CharacterEntity[]
  }

  /**
   * Available only in Classic Mode. Returns the Character ID for the target character
   *
   * 查询经典模式角色编号: 仅经典模式可用，查询指定角色的角色编号
   *
   * @param targetCharacter
   *
   * 目标角色
   *
   * @returns
   *
   * 角色编号
   */
  checkClassicModeCharacterId(targetCharacter: CharacterEntity): bigint {
    const targetCharacterObj = parseValue(targetCharacter, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'check_classic_mode_character_id',
      args: [targetCharacterObj]
    })
    const ret = new int()
    ret.markPin(ref, 'characterId', 0)
    return ret as unknown as bigint
  }

  /**
   * Available only in Classic Mode, get the active character in the player's party
   *
   * 获取指定玩家的前台角色: 仅经典模式可用，获取玩家队伍内的前台角色
   *
   * @param playerEntity
   *
   * 玩家实体
   *
   * @returns
   *
   * 前台角色实体
   */
  getActiveCharacterOfSpecifiedPlayer(playerEntity: PlayerEntity): CharacterEntity {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_active_character_of_specified_player',
      args: [playerEntityObj]
    })
    const ret = new entity()
    ret.markPin(ref, 'activeCharacterEntity', 0)
    return ret as unknown as CharacterEntity
  }

  /**
   * Returns the Target of the Follow Motion Device, including the Target Entity and its GUID
   *
   * 获取跟随运动器的目标: 获取跟随运动器的目标，可以获取目标实体和实体的GUID
   *
   * @param targetEntity
   *
   * 目标实体
   */
  getFollowMotionDeviceTarget(targetEntity: EntityValue): {
    /**
     *
     * 跟随目标实体
     */
    followTargetEntity: entity
    /**
     *
     * 跟随目标GUID
     */
    followTargetGuid: guid
  } {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_follow_motion_device_target',
      args: [targetEntityObj]
    })
    return {
      followTargetEntity: (() => {
        const ret = new entity()
        ret.markPin(ref, 'followTargetEntity', 0)
        return ret as unknown as entity
      })(),
      followTargetGuid: (() => {
        const ret = new guid()
        ret.markPin(ref, 'followTargetGuid', 1)
        return ret as unknown as guid
      })()
    }
  }

  /**
   * Returns the current time of the specified Global Timer on the Target Entity
   *
   * 获取全局计时器当前时间: 获取目标实体上指定全局计时器的当前时间
   *
   * @param targetEntity
   *
   * 目标实体
   * @param timerName
   *
   * 计时器名称
   *
   * @returns
   *
   * 当前时间
   */
  getCurrentGlobalTimerTime(targetEntity: EntityValue, timerName: StrValue): number {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const timerNameObj = parseValue(timerName, 'str')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_current_global_timer_time',
      args: [targetEntityObj, timerNameObj]
    })
    const ret = new float()
    ret.markPin(ref, 'currentTime', 0)
    return ret as unknown as number
  }

  /**
   * Returns the ID of the currently active Interface Layout on the specified Player Entity
   *
   * 获取玩家当前界面布局: 获取指定玩家实体上当前生效的界面布局的索引
   *
   * @param playerEntity
   *
   * 玩家实体
   *
   * @returns
   *
   * 布局索引
   */
  getPlayerSCurrentUiLayout(playerEntity: PlayerEntity): bigint {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_s_current_ui_layout',
      args: [playerEntityObj]
    })
    const ret = new int()
    ret.markPin(ref, 'layoutIndex', 0)
    return ret as unknown as bigint
  }

  /**
   * The Target Entity varies with the Creation's current behavior; For example, when a Creation is attacking, its Target is the specified enemy Entity; For example, when a Creation is healing allies, its Target is the specified allied Entity
   *
   * 获取造物当前目标: 根据造物当前行为的不同，目标实体也不尽相同。; 例如当造物在攻击敌方时，造物的目标为敌方指定实体。; 例如当造物在对友方进行治疗时，造物的目标为友方指定实体。
   *
   * @param creationEntity Runtime Creation Entity
   *
   * 造物实体: 运行时的造物实体
   *
   * @returns Current intelligently selected Target Entity of the Creation
   *
   * 目标实体: 造物当前的智能选取目标实体
   */
  getCreationSCurrentTarget(creationEntity: CreationEntity): entity {
    const creationEntityObj = parseValue(creationEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_creation_s_current_target',
      args: [creationEntityObj]
    })
    const ret = new entity()
    ret.markPin(ref, 'targetEntity', 0)
    return ret as unknown as entity
  }

  /**
   * Returns the Aggro List in Classic Mode. This Node only outputs a valid list when the Aggro Configuration is set to [Default Type]
   *
   * 获取造物的经典模式仇恨列表: 获取造物的经典仇恨模式的仇恨列表，即仅仇恨配置为【默认类型】时，该节点才会有正确的输出列表
   *
   * @param creationEntity Runtime Creation Entity
   *
   * 造物实体: 运行时的造物实体
   *
   * @returns Unordered list of Entities this Creation currently has Aggro against
   *
   * 仇恨列表: 造物当前对哪些实体有仇恨，该列表是无序的
   */
  getAggroListOfCreationInDefaultMode(creationEntity: CreationEntity): entity[] {
    const creationEntityObj = parseValue(creationEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_aggro_list_of_creation_in_default_mode',
      args: [creationEntityObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'aggroList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Returns the Attributes of the specified Creation
   *
   * 获取造物属性: 获取指定造物的属性
   *
   * @param creationEntity
   *
   * 造物实体
   */
  getCreationAttribute(creationEntity: CreationEntity): {
    /**
     *
     * 等级
     */
    level: bigint
    /**
     *
     * 当前生命值
     */
    currentHp: number
    /**
     *
     * 上限生命值
     */
    maxHp: number
    /**
     *
     * 当前攻击力
     */
    currentAtk: number
    /**
     *
     * 基础攻击力
     */
    baseAtk: number
    /**
     *
     * 受打断值上限
     */
    interruptValueThreshold: number
    /**
     *
     * 当前受打断值
     */
    currentInterruptValue: number
    /**
     *
     * 当前受打断状态
     */
    currentInterruptStatus: InterruptStatus
  } {
    const creationEntityObj = parseValue(creationEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_creation_attribute',
      args: [creationEntityObj]
    })
    return {
      level: (() => {
        const ret = new int()
        ret.markPin(ref, 'level', 0)
        return ret as unknown as bigint
      })(),
      currentHp: (() => {
        const ret = new float()
        ret.markPin(ref, 'currentHp', 1)
        return ret as unknown as number
      })(),
      maxHp: (() => {
        const ret = new float()
        ret.markPin(ref, 'maxHp', 2)
        return ret as unknown as number
      })(),
      currentAtk: (() => {
        const ret = new float()
        ret.markPin(ref, 'currentAtk', 3)
        return ret as unknown as number
      })(),
      baseAtk: (() => {
        const ret = new float()
        ret.markPin(ref, 'baseAtk', 4)
        return ret as unknown as number
      })(),
      interruptValueThreshold: (() => {
        const ret = new float()
        ret.markPin(ref, 'interruptValueThreshold', 5)
        return ret as unknown as number
      })(),
      currentInterruptValue: (() => {
        const ret = new float()
        ret.markPin(ref, 'currentInterruptValue', 6)
        return ret as unknown as number
      })(),
      currentInterruptStatus: (() => {
        const ret = new enumeration('InterruptStatus')
        ret.markPin(ref, 'currentInterruptStatus', 7)
        return ret as unknown as InterruptStatus
      })()
    }
  }

  /**
   * Searches the Player's Level of the specified Class
   *
   * 查询玩家职业的等级: 查询玩家指定职业的等级
   *
   * @param playerEntity
   *
   * 玩家实体
   * @param classConfigId
   *
   * 职业配置ID
   *
   * @returns
   *
   * 等级
   */
  queryPlayerClassLevel(playerEntity: PlayerEntity, classConfigId: ConfigIdValue): bigint {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const classConfigIdObj = parseValue(classConfigId, 'config_id')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_player_class_level',
      args: [playerEntityObj, classConfigIdObj]
    })
    const ret = new int()
    ret.markPin(ref, 'level', 0)
    return ret as unknown as bigint
  }

  /**
   * Searches the Player's current Class; outputs the Config ID of that Class
   *
   * 查询玩家职业: 查询玩家当前的职业，会输出该职业的配置ID
   *
   * @param playerEntity
   *
   * 玩家实体
   *
   * @returns
   *
   * 职业配置ID
   */
  queryPlayerClass(playerEntity: PlayerEntity): configId {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_player_class',
      args: [playerEntityObj]
    })
    const ret = new configId()
    ret.markPin(ref, 'classConfigId', 0)
    return ret as unknown as configId
  }

  /**
   * Searches the Skill in the specified slot of a Character; outputs that Skill's Config ID
   *
   * 查询角色技能: 查询角色指定槽位的技能，会输出该技能的配置ID
   *
   * @param characterEntity
   *
   * 角色实体
   * @param characterSkillSlot
   *
   * 角色技能槽位
   *
   * @returns
   *
   * 技能配置ID
   */
  queryCharacterSkill(
    characterEntity: CharacterEntity,
    characterSkillSlot: CharacterSkillSlot
  ): configId {
    const characterEntityObj = parseValue(characterEntity, 'entity')
    const characterSkillSlotObj = parseValue(characterSkillSlot, 'enumeration')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_character_skill',
      args: [characterEntityObj, characterSkillSlotObj]
    })
    const ret = new configId()
    ret.markPin(ref, 'skillConfigId', 0)
    return ret as unknown as configId
  }

  /**
   * Searches the list of all Slot IDs for the Unit Status with the specified Config ID on the Target Entity
   *
   * 查询单位状态的槽位序号列表: 查询指定目标实体上特定配置ID的单位状态的所有槽位序号列表
   *
   * @param targetEntity
   *
   * 查询目标实体
   * @param unitStatusConfigId
   *
   * 单位状态配置ID
   *
   * @returns
   *
   * 槽位序号列表
   */
  listOfSlotIdsQueryingUnitStatus(
    targetEntity: EntityValue,
    unitStatusConfigId: ConfigIdValue
  ): bigint[] {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const unitStatusConfigIdObj = parseValue(unitStatusConfigId, 'config_id')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'list_of_slot_ids_querying_unit_status',
      args: [targetEntityObj, unitStatusConfigIdObj]
    })
    const ret = new list('int')
    ret.markPin(ref, 'slotIndexList', 0)
    return ret as unknown as bigint[]
  }

  /**
   * Searches whether the specified Entity has a Unit Status with the given Config ID
   *
   * 查询实体是否具有单位状态: 查询指定实体是否具有特定配置ID的单位状态
   *
   * @param targetEntity
   *
   * 目标实体
   * @param unitStatusConfigId
   *
   * 单位状态配置ID
   *
   * @returns
   *
   * 是否具有
   */
  queryIfEntityHasUnitStatus(
    targetEntity: EntityValue,
    unitStatusConfigId: ConfigIdValue
  ): boolean {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const unitStatusConfigIdObj = parseValue(unitStatusConfigId, 'config_id')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_if_entity_has_unit_status',
      args: [targetEntityObj, unitStatusConfigIdObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'has', 0)
    return ret as unknown as boolean
  }

  /**
   * Searches the Stack Count of the specified Unit Status on the Target Entity's designated Slot
   *
   * 根据槽位序号查询单位状态层数: 查询目标实体指定槽位上的特定单位状态的层数
   *
   * @param queryTargetEntity
   *
   * 查询目标实体
   * @param unitStatusConfigId
   *
   * 单位状态配置ID
   * @param slotId
   *
   * 槽位序号
   *
   * @returns
   *
   * 层数
   */
  queryUnitStatusStacksBySlotId(
    queryTargetEntity: EntityValue,
    unitStatusConfigId: ConfigIdValue,
    slotId: IntValue
  ): bigint {
    const queryTargetEntityObj = parseValue(queryTargetEntity, 'entity')
    const unitStatusConfigIdObj = parseValue(unitStatusConfigId, 'config_id')
    const slotIdObj = parseValue(slotId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_unit_status_stacks_by_slot_id',
      args: [queryTargetEntityObj, unitStatusConfigIdObj, slotIdObj]
    })
    const ret = new int()
    ret.markPin(ref, 'stacks', 0)
    return ret as unknown as bigint
  }

  /**
   * Searches the Applier of the specified Unit Status on the Target Entity's designated Slot
   *
   * 根据槽位序号查询单位状态施加者: 查询目标实体指定槽位上的特定单位状态的施加者
   *
   * @param queryTargetEntity
   *
   * 查询目标实体
   * @param unitStatusConfigId
   *
   * 单位状态配置ID
   * @param slotId
   *
   * 槽位序号
   *
   * @returns
   *
   * 施加者实体
   */
  queryUnitStatusApplierBySlotId(
    queryTargetEntity: EntityValue,
    unitStatusConfigId: ConfigIdValue,
    slotId: IntValue
  ): entity {
    const queryTargetEntityObj = parseValue(queryTargetEntity, 'entity')
    const unitStatusConfigIdObj = parseValue(unitStatusConfigId, 'config_id')
    const slotIdObj = parseValue(slotId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_unit_status_applier_by_slot_id',
      args: [queryTargetEntityObj, unitStatusConfigIdObj, slotIdObj]
    })
    const ret = new entity()
    ret.markPin(ref, 'applierEntity', 0)
    return ret as unknown as entity
  }

  /**
   * Returns a list of all Entities in the scene that carry this Unit Tag
   *
   * 获取单位标签的实体列表: 获取在场所有携带该单位标签的实体列表
   *
   * @param unitTagIndex
   *
   * 单位标签索引
   *
   * @returns
   *
   * 实体列表
   */
  getEntityListByUnitTag(unitTagIndex: IntValue): entity[] {
    const unitTagIndexObj = parseValue(unitTagIndex, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_list_by_unit_tag',
      args: [unitTagIndexObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'entityList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Returns a list of all Unit Tags carried by the Target Entity
   *
   * 获取实体单位标签列表: 获取目标实体上携带的所有单位标签组成的列表
   *
   * @param targetEntity
   *
   * 目标实体
   *
   * @returns
   *
   * 单位标签列表
   */
  getEntityUnitTagList(targetEntity: EntityValue): bigint[] {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_unit_tag_list',
      args: [targetEntityObj]
    })
    const ret = new list('int')
    ret.markPin(ref, 'unitTagList', 0)
    return ret as unknown as bigint[]
  }

  /**
   * Searches the Global Aggro Transfer Multiplier; it can be configured in [Stage Settings]
   *
   * 查询全局仇恨转移倍率: 查询全局仇恨转移倍率，在【关卡设置】中可以配置
   *
   * @returns
   *
   * 全局仇恨转移倍率
   */
  queryGlobalAggroTransferMultiplier(): number {
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_global_aggro_transfer_multiplier',
      args: []
    })
    const ret = new float()
    ret.markPin(ref, 'globalAggroTransferMultiplier', 0)
    return ret as unknown as number
  }

  /**
   * Query Aggro Multiplier of Specific Entity
   *
   * 查询指定实体的仇恨倍率: 查询指定实体的仇恨倍率
   *
   * @param queryTarget
   *
   * 查询目标
   *
   * @returns
   *
   * 仇恨倍率
   */
  queryTheAggroMultiplierOfTheSpecifiedEntity(queryTarget: EntityValue): number {
    const queryTargetObj = parseValue(queryTarget, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_the_aggro_multiplier_of_the_specified_entity',
      args: [queryTargetObj]
    })
    const ret = new float()
    ret.markPin(ref, 'aggroMultiplier', 0)
    return ret as unknown as number
  }

  /**
   * Searches the Aggro Value of the Target Entity on its Aggro Owners
   *
   * 查询指定实体的仇恨值: 查询目标实体在仇恨拥有者上的仇恨值
   *
   * @param queryTarget
   *
   * 查询目标
   * @param aggroOwner
   *
   * 仇恨拥有者
   *
   * @returns
   *
   * 仇恨值
   */
  queryTheAggroValueOfTheSpecifiedEntity(
    queryTarget: EntityValue,
    aggroOwner: EntityValue
  ): bigint {
    const queryTargetObj = parseValue(queryTarget, 'entity')
    const aggroOwnerObj = parseValue(aggroOwner, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_the_aggro_value_of_the_specified_entity',
      args: [queryTargetObj, aggroOwnerObj]
    })
    const ret = new int()
    ret.markPin(ref, 'aggroValue', 0)
    return ret as unknown as bigint
  }

  /**
   * Searches whether the specified Entity has entered battle
   *
   * 查询指定实体是否已入战: 查询指定实体是否已经入战
   *
   * @param queryTarget
   *
   * 查询目标
   *
   * @returns
   *
   * 是否入战
   */
  queryIfSpecifiedEntityIsInCombat(queryTarget: EntityValue): boolean {
    const queryTargetObj = parseValue(queryTarget, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_if_specified_entity_is_in_combat',
      args: [queryTargetObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'inCombat', 0)
    return ret as unknown as boolean
  }

  /**
   * Searches which Entities' Aggro Lists include the specified Target Entity
   *
   * 获取目标所在仇恨列表的拥有者列表: 查询指定目标实体在哪些实体的仇恨列表中
   *
   * @param queryTarget
   *
   * 查询目标
   *
   * @returns
   *
   * 仇恨拥有者列表
   */
  getListOfOwnersWhoHaveTheTargetInTheirAggroList(queryTarget: EntityValue): entity[] {
    const queryTargetObj = parseValue(queryTarget, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_list_of_owners_who_have_the_target_in_their_aggro_list',
      args: [queryTargetObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'aggroOwnerList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Searches which Entities have the Target Entity as their Aggro Target
   *
   * 获取以目标为仇恨目标的拥有者列表: 查询哪些实体以目标实体为仇恨目标
   *
   * @param targetEntity
   *
   * 目标实体
   *
   * @returns
   *
   * 仇恨拥有者列表
   */
  getListOfOwnersThatHaveTheTargetAsTheirAggroTarget(targetEntity: EntityValue): entity[] {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_list_of_owners_that_have_the_target_as_their_aggro_target',
      args: [targetEntityObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'aggroOwnerList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Get Specific Entity's Aggro List
   *
   * 获取指定实体的仇恨列表: 获取指定实体的仇恨列表
   *
   * @param targetEntity
   *
   * 目标实体
   *
   * @returns
   *
   * 仇恨列表
   */
  getTheAggroListOfTheSpecifiedEntity(targetEntity: EntityValue): entity[] {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_the_aggro_list_of_the_specified_entity',
      args: [targetEntityObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'aggroList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Get Aggro Target of Specific Entity
   *
   * 获取指定实体的仇恨目标: 获取指定实体的仇恨目标
   *
   * @param aggroOwner
   *
   * 仇恨拥有者
   *
   * @returns
   *
   * 仇恨目标
   */
  getTheAggroTargetOfTheSpecifiedEntity(aggroOwner: EntityValue): entity {
    const aggroOwnerObj = parseValue(aggroOwner, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_the_aggro_target_of_the_specified_entity',
      args: [aggroOwnerObj]
    })
    const ret = new entity()
    ret.markPin(ref, 'aggroTarget', 0)
    return ret as unknown as entity
  }

  /**
   * Get the number of Waypoints in the Global Path
   *
   * 获得全局路径的路点个数
   *
   * @param pathIndex
   *
   * 路径索引
   *
   * @returns
   *
   * 路点数量
   */
  getTheNumberOfWaypointsInTheGlobalPath(pathIndex: IntValue): bigint {
    const pathIndexObj = parseValue(pathIndex, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_the_number_of_waypoints_in_the_global_path',
      args: [pathIndexObj]
    })
    const ret = new int()
    ret.markPin(ref, 'numberOfWaypoints', 0)
    return ret as unknown as bigint
  }

  /**
   * Searches the specified Waypoint information for the given Path
   *
   * 获取指定路径点信息: 查询指定路径的特定路点信息
   *
   * @param pathIndex
   *
   * 路径索引
   * @param pathWaypointId
   *
   * 路径路点序号
   */
  getSpecifiedWaypointInfo(
    pathIndex: IntValue,
    pathWaypointId: IntValue
  ): {
    /**
     *
     * 路点位置
     */
    waypointLocation: vec3
    /**
     *
     * 路点朝向
     */
    waypointOrientation: vec3
  } {
    const pathIndexObj = parseValue(pathIndex, 'int')
    const pathWaypointIdObj = parseValue(pathWaypointId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_specified_waypoint_info',
      args: [pathIndexObj, pathWaypointIdObj]
    })
    return {
      waypointLocation: (() => {
        const ret = new vec3()
        ret.markPin(ref, 'waypointLocation', 0)
        return ret as unknown as vec3
      })(),
      waypointOrientation: (() => {
        const ret = new vec3()
        ret.markPin(ref, 'waypointOrientation', 1)
        return ret as unknown as vec3
      })()
    }
  }

  /**
   * Searches all Preset Points that carry the Unit Tag by its ID; outputs each Preset Point's ID
   *
   * 以单位标签获取预设点位列表: 根据单位标签索引查询所有携带该单位标签的预设点位列表，输出值为该预设点位的索引
   *
   * @param unitTagId
   *
   * 单位标签索引
   *
   * @returns
   *
   * 点位索引列表
   */
  getPresetPointListByUnitTag(unitTagId: IntValue): bigint[] {
    const unitTagIdObj = parseValue(unitTagId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_preset_point_list_by_unit_tag',
      args: [unitTagIdObj]
    })
    const ret = new list('int')
    ret.markPin(ref, 'pointIndexList', 0)
    return ret as unknown as bigint[]
  }

  /**
   * Searches the Location and Rotation of the specified Preset Point
   *
   * 查询预设点位置旋转: 查询指定预设点的位置和旋转
   *
   * @param pointIndex
   *
   * 点位索引
   */
  queryPresetPointPositionRotation(pointIndex: IntValue): {
    /**
     *
     * 位置
     */
    location: vec3
    /**
     *
     * 旋转
     */
    rotate: vec3
  } {
    const pointIndexObj = parseValue(pointIndex, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_preset_point_position_rotation',
      args: [pointIndexObj]
    })
    return {
      location: (() => {
        const ret = new vec3()
        ret.markPin(ref, 'location', 0)
        return ret as unknown as vec3
      })(),
      rotate: (() => {
        const ret = new vec3()
        ret.markPin(ref, 'rotate', 1)
        return ret as unknown as vec3
      })()
    }
  }

  /**
   * Get Player Settlement Success Status
   *
   * 获取玩家结算成功状态: 获取玩家结算成功状态
   *
   * @param playerEntity
   *
   * 玩家实体
   *
   * @returns Includes: Undetermined, Victory, Defeat
   *
   * 结算状态: 分为未定、胜利、失败
   */
  getPlayerSettlementSuccessStatus(playerEntity: PlayerEntity): SettlementStatus {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_settlement_success_status',
      args: [playerEntityObj]
    })
    const ret = new enumeration('SettlementStatus')
    ret.markPin(ref, 'settlementStatus', 0)
    return ret as unknown as SettlementStatus
  }

  /**
   * Returns the Settlement ranking value for the specified Player Entity
   *
   * 获取玩家结算排名数值: 获取指定玩家实体结算的排名数值
   *
   * @param playerEntity
   *
   * 玩家实体
   *
   * @returns
   *
   * 排名数值
   */
  getPlayerSettlementRankingValue(playerEntity: PlayerEntity): bigint {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_settlement_ranking_value',
      args: [playerEntityObj]
    })
    const ret = new int()
    ret.markPin(ref, 'rankingValue', 0)
    return ret as unknown as bigint
  }

  /**
   * Get Faction Settlement Success Status
   *
   * 获取阵营结算成功状态: 获取阵营结算成功状态
   *
   * @param faction
   *
   * 阵营
   *
   * @returns Includes: Undetermined, Victory, Defeat
   *
   * 结算状态: 分为未定、胜利、失败
   */
  getFactionSettlementSuccessStatus(faction: FactionValue): SettlementStatus {
    const factionObj = parseValue(faction, 'faction')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_faction_settlement_success_status',
      args: [factionObj]
    })
    const ret = new enumeration('SettlementStatus')
    ret.markPin(ref, 'settlementStatus', 0)
    return ret as unknown as SettlementStatus
  }

  /**
   * Returns the Settlement ranking value for the specified Faction
   *
   * 获取阵营结算排名数值: 获取指定阵营结算的排名数值
   *
   * @param faction
   *
   * 阵营
   *
   * @returns
   *
   * 排名数值
   */
  getFactionSettlementRankingValue(faction: FactionValue): bigint {
    const factionObj = parseValue(faction, 'faction')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_faction_settlement_ranking_value',
      args: [factionObj]
    })
    const ret = new int()
    ret.markPin(ref, 'rankingValue', 0)
    return ret as unknown as bigint
  }

  /**
   * Searches whether the specified Dictionary contains the specified Key
   *
   * 查询字典是否包含特定键: 查询指定字典是否包含特定的键
   *
   * @param dictionary
   *
   * 字典
   * @param key
   *
   * 键
   *
   * @returns
   *
   * 是否包含
   */
  queryIfDictionaryContainsSpecificKey<K extends DictKeyType, V extends DictValueType>(
    dictionary: dict<K, V>,
    key: RuntimeParameterValueTypeMap[K]
  ): boolean {
    const dictionaryObj = parseValue(dictionary, 'dict')
    const keyObj = parseValue(key, dictionaryObj.getKeyType())
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_if_dictionary_contains_specific_key',
      args: [dictionaryObj, keyObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'include', 0)
    return ret as unknown as boolean
  }

  /**
   * Searches the number of Key-Value Pairs in the Dictionary
   *
   * 查询字典长度: 查询字典中键值对的数量
   *
   * @param dictionary
   *
   * 字典
   *
   * @returns
   *
   * 长度
   */
  queryDictionarySLength<K extends DictKeyType, V extends DictValueType>(
    dictionary: dict<K, V>
  ): bigint {
    const dictionaryObj = parseValue(dictionary, 'dict')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_dictionary_s_length',
      args: [dictionaryObj]
    })
    const ret = new int()
    ret.markPin(ref, 'length', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns a list of all Keys in the Dictionary. Because Key-Value Pairs are unordered, the Keys may not be returned in insertion order
   *
   * 获取字典中键组成的列表: 获取字典中所有键组成的列表。由于字典中键值对是无序排列的，所以取出的键列表也不一定按照其插入顺序排列
   *
   * @param dictionary
   *
   * 字典
   *
   * @returns
   *
   * 键列表
   */
  getListOfKeysFromDictionary<K extends DictKeyType, V extends DictValueType>(
    dictionary: dict<K, V>
  ): RuntimeReturnValueTypeMap[`${K}_list`] {
    const dictionaryObj = parseValue(dictionary, 'dict')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_list_of_keys_from_dictionary',
      args: [dictionaryObj]
    })
    const ret = new list(dictionaryObj.getKeyType())
    ret.markPin(ref, 'keyList', 0)
    return ret as unknown as RuntimeReturnValueTypeMap[`${K}_list`]
  }

  /**
   * Searches sale information for a specified Item in the Inventory Shop
   *
   * 查询背包商店商品出售信息: 查询背包商店种特定商品的出售信息
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId
   *
   * 商店序号
   * @param itemConfigId
   *
   * 道具配置ID
   */
  queryInventoryShopItemSalesInfo(
    shopOwnerEntity: EntityValue,
    shopId: IntValue,
    itemConfigId: ConfigIdValue
  ): {
    /**
     *
     * 出售货币字典
     */
    sellCurrencyDictionary: dict<'config_id', 'int'>
    /**
     *
     * 排序优先级
     */
    sortPriority: bigint
    /**
     *
     * 是否可出售
     */
    canBeSold: boolean
  } {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const itemConfigIdObj = parseValue(itemConfigId, 'config_id')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_inventory_shop_item_sales_info',
      args: [shopOwnerEntityObj, shopIdObj, itemConfigIdObj]
    })
    return {
      sellCurrencyDictionary: (() => {
        const ret = new dict('config_id', 'int')
        ret.markPin(ref, 'sellCurrencyDictionary', 0)
        return ret as unknown as dict<'config_id', 'int'>
      })(),
      sortPriority: (() => {
        const ret = new int()
        ret.markPin(ref, 'sortPriority', 1)
        return ret as unknown as bigint
      })(),
      canBeSold: (() => {
        const ret = new bool()
        ret.markPin(ref, 'canBeSold', 2)
        return ret as unknown as boolean
      })()
    }
  }

  /**
   * Search the inventory shop's sales list
   *
   * 查询背包商店物品出售列表: 查询背包商店物品出售列表
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId
   *
   * 商店序号
   *
   * @returns
   *
   * 道具配置ID列表
   */
  queryInventoryShopItemSalesList(shopOwnerEntity: EntityValue, shopId: IntValue): configId[] {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_inventory_shop_item_sales_list',
      args: [shopOwnerEntityObj, shopIdObj]
    })
    const ret = new list('config_id')
    ret.markPin(ref, 'itemConfigIdList', 0)
    return ret as unknown as configId[]
  }

  /**
   * Search the shop's purchase list
   *
   * 查询商店收购物品列表: 查询商店收购物品列表
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId
   *
   * 商店序号
   *
   * @returns
   *
   * 道具配置ID列表
   */
  queryShopPurchaseItemList(shopOwnerEntity: EntityValue, shopId: IntValue): configId[] {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_shop_purchase_item_list',
      args: [shopOwnerEntityObj, shopIdObj]
    })
    const ret = new list('config_id')
    ret.markPin(ref, 'itemConfigIdList', 0)
    return ret as unknown as configId[]
  }

  /**
   * Searches purchase information for a specified Item in the Shop
   *
   * 查询商店物品收购信息: 查询商店特定物品的收购信息
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId
   *
   * 商店序号
   * @param itemConfigId
   *
   * 道具配置ID
   */
  queryShopItemPurchaseInfo(
    shopOwnerEntity: EntityValue,
    shopId: IntValue,
    itemConfigId: ConfigIdValue
  ): {
    /**
     *
     * 收购货币字典
     */
    purchaseCurrencyDictionary: dict<'config_id', 'int'>
    /**
     *
     * 是否可收购
     */
    purchasable: boolean
  } {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const itemConfigIdObj = parseValue(itemConfigId, 'config_id')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_shop_item_purchase_info',
      args: [shopOwnerEntityObj, shopIdObj, itemConfigIdObj]
    })
    return {
      purchaseCurrencyDictionary: (() => {
        const ret = new dict('config_id', 'int')
        ret.markPin(ref, 'purchaseCurrencyDictionary', 0)
        return ret as unknown as dict<'config_id', 'int'>
      })(),
      purchasable: (() => {
        const ret = new bool()
        ret.markPin(ref, 'purchasable', 1)
        return ret as unknown as boolean
      })()
    }
  }

  /**
   * Searches the Custom Shop sale list; the output parameter is a list of Item IDs
   *
   * 查询自定义商店商品出售列表: 查询自定义商店商品出售列表，出参为商品序号组成的列表
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId
   *
   * 商店序号
   *
   * @returns
   *
   * 商品序号列表
   */
  queryCustomShopItemSalesList(shopOwnerEntity: EntityValue, shopId: IntValue): bigint[] {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_custom_shop_item_sales_list',
      args: [shopOwnerEntityObj, shopIdObj]
    })
    const ret = new list('int')
    ret.markPin(ref, 'shopItemIdList', 0)
    return ret as unknown as bigint[]
  }

  /**
   * Searches sale information for a specified Item in the Custom Shop
   *
   * 查询自定义商店商品出售信息: 查询自定义商店特定商品的出售信息
   *
   * @param shopOwnerEntity
   *
   * 商店归属者实体
   * @param shopId
   *
   * 商店序号
   * @param shopItemId
   *
   * 商品序号
   */
  queryCustomShopItemSalesInfo(
    shopOwnerEntity: EntityValue,
    shopId: IntValue,
    shopItemId: IntValue
  ): {
    /**
     *
     * 道具配置ID
     */
    itemConfigId: configId
    /**
     *
     * 出售货币字典
     */
    sellCurrencyDictionary: dict<'config_id', 'int'>
    /**
     *
     * 所属页签序号
     */
    affiliatedTabId: bigint
    /**
     *
     * 是否限购
     */
    limitPurchase: boolean
    /**
     *
     * 限购数量
     */
    purchaseLimit: bigint
    /**
     *
     * 排序优先级
     */
    sortPriority: bigint
    /**
     *
     * 是否可出售
     */
    canBeSold: boolean
  } {
    const shopOwnerEntityObj = parseValue(shopOwnerEntity, 'entity')
    const shopIdObj = parseValue(shopId, 'int')
    const shopItemIdObj = parseValue(shopItemId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_custom_shop_item_sales_info',
      args: [shopOwnerEntityObj, shopIdObj, shopItemIdObj]
    })
    return {
      itemConfigId: (() => {
        const ret = new configId()
        ret.markPin(ref, 'itemConfigId', 0)
        return ret as unknown as configId
      })(),
      sellCurrencyDictionary: (() => {
        const ret = new dict('config_id', 'int')
        ret.markPin(ref, 'sellCurrencyDictionary', 1)
        return ret as unknown as dict<'config_id', 'int'>
      })(),
      affiliatedTabId: (() => {
        const ret = new int()
        ret.markPin(ref, 'affiliatedTabId', 2)
        return ret as unknown as bigint
      })(),
      limitPurchase: (() => {
        const ret = new bool()
        ret.markPin(ref, 'limitPurchase', 3)
        return ret as unknown as boolean
      })(),
      purchaseLimit: (() => {
        const ret = new int()
        ret.markPin(ref, 'purchaseLimit', 4)
        return ret as unknown as bigint
      })(),
      sortPriority: (() => {
        const ret = new int()
        ret.markPin(ref, 'sortPriority', 5)
        return ret as unknown as bigint
      })(),
      canBeSold: (() => {
        const ret = new bool()
        ret.markPin(ref, 'canBeSold', 6)
        return ret as unknown as boolean
      })()
    }
  }

  /**
   * Get the equipment index of the specified equipment slot
   *
   * 获取指定装备栏位的装备索引
   *
   * @param targetEntity
   *
   * 目标实体
   * @param row
   *
   * 装备栏位行
   * @param column
   *
   * 装备栏位列
   *
   * @returns
   *
   * 装备索引
   */
  getTheEquipmentIndexOfTheSpecifiedEquipmentSlot(
    targetEntity: EntityValue,
    row: IntValue,
    column: IntValue
  ): bigint {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const rowObj = parseValue(row, 'int')
    const columnObj = parseValue(column, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_the_equipment_index_of_the_specified_equipment_slot',
      args: [targetEntityObj, rowObj, columnObj]
    })
    const ret = new int()
    ret.markPin(ref, 'equipmentIndex', 0)
    return ret as unknown as bigint
  }

  /**
   * Searches the list of all Tags on this Equipment instance
   *
   * 查询装备标签列表: 查询该装备实例的所有标签组成的列表
   *
   * @param equipmentIndex
   *
   * 装备索引
   *
   * @returns
   *
   * 标签列表
   */
  queryEquipmentTagList(equipmentIndex: IntValue): configId[] {
    const equipmentIndexObj = parseValue(equipmentIndex, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_equipment_tag_list',
      args: [equipmentIndexObj]
    })
    const ret = new list('config_id')
    ret.markPin(ref, 'tagList', 0)
    return ret as unknown as configId[]
  }

  /**
   * Searches the Equipment Config ID by Equipment ID. The Equipment Instance ID can be obtained in the [Equipment Initialization] event
   *
   * 根据装备索引查询装备配置ID: 根据装备索引查询装备配置ID，装备实例的索引可以在【装备初始化】事件中获取到
   *
   * @param equipmentIndex
   *
   * 装备索引
   *
   * @returns
   *
   * 装备配置ID
   */
  queryEquipmentConfigIdByEquipmentId(equipmentIndex: IntValue): configId {
    const equipmentIndexObj = parseValue(equipmentIndex, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_equipment_config_id_by_equipment_id',
      args: [equipmentIndexObj]
    })
    const ret = new configId()
    ret.markPin(ref, 'equipmentConfigId', 0)
    return ret as unknown as configId
  }

  /**
   * Returns a list of all Affixes on this Equipment instance; When Equipment is initialized, Affix values are randomized, so the Equipment Affixes on the Equipment instance also generate corresponding instances. Therefore, the data type is Integer rather than Config ID
   *
   * 获取装备词条列表: 获取该装备实例的所有词条组成的列表; 装备初始化时，词条的数值会发生随机，所以装备实例上的装备词条也会生成对应的实例，故数据类型为整数而不是配置ID
   *
   * @param equipmentIndex
   *
   * 装备索引
   *
   * @returns
   *
   * 装备词条列表
   */
  getEquipmentAffixList(equipmentIndex: IntValue): bigint[] {
    const equipmentIndexObj = parseValue(equipmentIndex, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_equipment_affix_list',
      args: [equipmentIndexObj]
    })
    const ret = new list('int')
    ret.markPin(ref, 'equipmentAffixList', 0)
    return ret as unknown as bigint[]
  }

  /**
   * Returns the Config ID of an Equipment Affix by its ID on the Equipment instance
   *
   * 获取装备词条配置ID: 根据装备实例上装备词条的序号获取该词条的配置ID
   *
   * @param equipmentIndex
   *
   * 装备索引
   * @param affixId
   *
   * 词条序号
   *
   * @returns
   *
   * 词条配置ID
   */
  getEquipmentAffixConfigId(equipmentIndex: IntValue, affixId: IntValue): configId {
    const equipmentIndexObj = parseValue(equipmentIndex, 'int')
    const affixIdObj = parseValue(affixId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_equipment_affix_config_id',
      args: [equipmentIndexObj, affixIdObj]
    })
    const ret = new configId()
    ret.markPin(ref, 'affixConfigId', 0)
    return ret as unknown as configId
  }

  /**
   * Returns the value of the Affix at the specified ID on the Equipment instance
   *
   * 获取装备词条数值: 获取装备实例上对应序号词条的数值
   *
   * @param equipmentIndex
   *
   * 装备索引
   * @param affixId
   *
   * 词条序号
   *
   * @returns
   *
   * 装备数值
   */
  getEquipmentAffixValue(equipmentIndex: IntValue, affixId: IntValue): number {
    const equipmentIndexObj = parseValue(equipmentIndex, 'int')
    const affixIdObj = parseValue(affixId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_equipment_affix_value',
      args: [equipmentIndexObj, affixIdObj]
    })
    const ret = new float()
    ret.markPin(ref, 'affixValue', 0)
    return ret as unknown as number
  }

  /**
   * Returns the quantity of the Item with the specified Config ID in the Inventory
   *
   * 获取背包道具数量: 获取背包内特定配置ID的道具数量
   *
   * @param inventoryOwnerEntity
   *
   * 背包持有者实体
   * @param itemConfigId
   *
   * 道具配置ID
   *
   * @returns
   *
   * 道具数量
   */
  getInventoryItemQuantity(inventoryOwnerEntity: EntityValue, itemConfigId: ConfigIdValue): bigint {
    const inventoryOwnerEntityObj = parseValue(inventoryOwnerEntity, 'entity')
    const itemConfigIdObj = parseValue(itemConfigId, 'config_id')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_inventory_item_quantity',
      args: [inventoryOwnerEntityObj, itemConfigIdObj]
    })
    const ret = new int()
    ret.markPin(ref, 'itemQuantity', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns the amount of Currency with the specified Config ID in the Inventory
   *
   * 获取背包货币数量: 获取背包内特定配置ID的货币数量
   *
   * @param inventoryOwnerEntity
   *
   * 背包持有者实体
   * @param currencyConfigId
   *
   * 货币配置ID
   *
   * @returns
   *
   * 资源数量
   */
  getInventoryCurrencyQuantity(
    inventoryOwnerEntity: EntityValue,
    currencyConfigId: ConfigIdValue
  ): bigint {
    const inventoryOwnerEntityObj = parseValue(inventoryOwnerEntity, 'entity')
    const currencyConfigIdObj = parseValue(currencyConfigId, 'config_id')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_inventory_currency_quantity',
      args: [inventoryOwnerEntityObj, currencyConfigIdObj]
    })
    const ret = new int()
    ret.markPin(ref, 'resourceQuantity', 0)
    return ret as unknown as bigint
  }

  /**
   * Get Inventory Capacity
   *
   * 获取背包容量: 获取背包容量
   *
   * @param inventoryOwnerEntity
   *
   * 背包持有者实体
   *
   * @returns
   *
   * 背包容量
   */
  getInventoryCapacity(inventoryOwnerEntity: EntityValue): bigint {
    const inventoryOwnerEntityObj = parseValue(inventoryOwnerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_inventory_capacity',
      args: [inventoryOwnerEntityObj]
    })
    const ret = new int()
    ret.markPin(ref, 'inventoryCapacity', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns all Currencies in the Inventory, including types and corresponding amounts
   *
   * 获取背包所有货币: 获取背包所有货币，包括货币类型和对应的数量
   *
   * @param inventoryOwnerEntity
   *
   * 背包持有者实体
   *
   * @returns
   *
   * 货币字典
   */
  getAllCurrencyFromInventory(inventoryOwnerEntity: EntityValue): dict<'config_id', 'int'> {
    const inventoryOwnerEntityObj = parseValue(inventoryOwnerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_all_currency_from_inventory',
      args: [inventoryOwnerEntityObj]
    })
    const ret = new dict('config_id', 'int')
    ret.markPin(ref, 'currencyDictionary', 0)
    return ret as unknown as dict<'config_id', 'int'>
  }

  /**
   * Returns all Basic Items in the Inventory, including Item types and their quantities
   *
   * 获取背包所有基础道具: 获取背包所有基础道具，包括道具类型和对应的数量
   *
   * @param inventoryOwnerEntity
   *
   * 背包持有者实体
   *
   * @returns
   *
   * 基础道具字典
   */
  getAllBasicItemsFromInventory(inventoryOwnerEntity: EntityValue): dict<'config_id', 'int'> {
    const inventoryOwnerEntityObj = parseValue(inventoryOwnerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_all_basic_items_from_inventory',
      args: [inventoryOwnerEntityObj]
    })
    const ret = new dict('config_id', 'int')
    ret.markPin(ref, 'basicItemDictionary', 0)
    return ret as unknown as dict<'config_id', 'int'>
  }

  /**
   * Returns all Equipment in the Inventory; the output parameter is a list of all Equipment IDs
   *
   * 获取背包所有装备: 获取背包所有装备，出参为所有装备索引组成的列表
   *
   * @param inventoryOwnerEntity
   *
   * 背包持有者实体
   *
   * @returns
   *
   * 装备索引列表
   */
  getAllEquipmentFromInventory(inventoryOwnerEntity: EntityValue): bigint[] {
    const inventoryOwnerEntityObj = parseValue(inventoryOwnerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_all_equipment_from_inventory',
      args: [inventoryOwnerEntityObj]
    })
    const ret = new list('int')
    ret.markPin(ref, 'equipmentIndexList', 0)
    return ret as unknown as bigint[]
  }

  /**
   * Returns the quantity of Items with the specified Config ID from the Loot Component on the Loot Prefab
   *
   * 获取掉落物组件道具数量: 获取掉落物元件上掉落物组件中特定配置ID的道具数量
   *
   * @param lootEntity
   *
   * 掉落物实体
   * @param itemConfigId
   *
   * 道具配置ID
   *
   * @returns
   *
   * 道具数量
   */
  getLootComponentItemQuantity(lootEntity: EntityValue, itemConfigId: ConfigIdValue): bigint {
    const lootEntityObj = parseValue(lootEntity, 'entity')
    const itemConfigIdObj = parseValue(itemConfigId, 'config_id')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_loot_component_item_quantity',
      args: [lootEntityObj, itemConfigIdObj]
    })
    const ret = new int()
    ret.markPin(ref, 'itemQuantity', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns the amount of Currency with the specified Config ID from the Loot Component on the Loot Prefab
   *
   * 获取掉落物组件货币数量: 获取掉落物元件上掉落物组件中特定配置ID的货币数量
   *
   * @param lootEntity
   *
   * 掉落物实体
   * @param currencyConfigId
   *
   * 货币配置ID
   *
   * @returns
   *
   * 货币数量
   */
  getLootComponentCurrencyQuantity(
    lootEntity: EntityValue,
    currencyConfigId: ConfigIdValue
  ): bigint {
    const lootEntityObj = parseValue(lootEntity, 'entity')
    const currencyConfigIdObj = parseValue(currencyConfigId, 'config_id')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_loot_component_currency_quantity',
      args: [lootEntityObj, currencyConfigIdObj]
    })
    const ret = new int()
    ret.markPin(ref, 'currencyAmount', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns all Equipment from the Loot Component on the Loot Prefab
   *
   * 获取掉落物组件所有装备: 获取掉落物元件上掉落物组件中的所有装备
   *
   * @param lootEntity
   *
   * 掉落物实体
   *
   * @returns
   *
   * 装备索引列表
   */
  getAllEquipmentFromLootComponent(lootEntity: EntityValue): bigint[] {
    const lootEntityObj = parseValue(lootEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_all_equipment_from_loot_component',
      args: [lootEntityObj]
    })
    const ret = new list('int')
    ret.markPin(ref, 'equipmentIndexList', 0)
    return ret as unknown as bigint[]
  }

  /**
   * Returns all Items from the Loot Component on the Loot Prefab
   *
   * 获取掉落物组件所有道具: 获取掉落物元件上掉落物组件中的所有道具
   *
   * @param dropperEntity
   *
   * 掉落者实体
   *
   * @returns
   *
   * 道具字典
   */
  getAllItemsFromLootComponent(dropperEntity: EntityValue): dict<'config_id', 'int'> {
    const dropperEntityObj = parseValue(dropperEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_all_items_from_loot_component',
      args: [dropperEntityObj]
    })
    const ret = new dict('config_id', 'int')
    ret.markPin(ref, 'itemDictionary', 0)
    return ret as unknown as dict<'config_id', 'int'>
  }

  /**
   * Returns all Currencies from the Loot Component on the Loot Prefab
   *
   * 获取掉落物组件所有货币: 获取掉落物元件上掉落物组件中的所有货币
   *
   * @param dropperEntity
   *
   * 掉落者实体
   *
   * @returns
   *
   * 货币字典
   */
  getAllCurrencyFromLootComponent(dropperEntity: EntityValue): dict<'config_id', 'int'> {
    const dropperEntityObj = parseValue(dropperEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_all_currency_from_loot_component',
      args: [dropperEntityObj]
    })
    const ret = new dict('config_id', 'int')
    ret.markPin(ref, 'currencyDictionary', 0)
    return ret as unknown as dict<'config_id', 'int'>
  }

  /**
   * Returns all Entities within the Collision Trigger corresponding to a specific ID in the Collision Trigger Component on the Target Entity
   *
   * 获取碰撞触发器内所有实体: 获取目标实体上碰撞触发器组件中特定序号对应的碰撞触发器内的所有实体
   *
   * @param targetEntity
   *
   * 目标实体
   * @param triggerId
   *
   * 触发器序号
   *
   * @returns
   *
   * 实体列表
   */
  getAllEntitiesWithinTheCollisionTrigger(
    targetEntity: EntityValue,
    triggerId: IntValue
  ): entity[] {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const triggerIdObj = parseValue(triggerId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_all_entities_within_the_collision_trigger',
      args: [targetEntityObj, triggerIdObj]
    })
    const ret = new list('entity')
    ret.markPin(ref, 'entityList', 0)
    return ret as unknown as entity[]
  }

  /**
   * Searches the information of the Mini-map Marker with the specified ID in the Mini-map Marker Component on the Target Entity
   *
   * 查询指定小地图标识信息: 查询目标实体上小地图标识组件中特定序号对应的小地图标识的信息
   *
   * @param targetEntity Runtime Entity
   *
   * 目标实体: 运行时的实体
   * @param miniMapMarkerId The Mini-map Marker ID to search
   *
   * 小地图标识序号: 要查询的指定小地图标识的序号
   */
  querySpecifiedMiniMapMarkerInformation(
    targetEntity: EntityValue,
    miniMapMarkerId: IntValue
  ): {
    /**
     * The active state of the searched Mini-map Marker
     *
     * 生效状态: 查询的小地图标识的生效状态
     */
    activationStaet: boolean
    /**
     * Returns the list of Players who can see this Marker
     *
     * 可见标识的玩家列表: 返回可见该标识的玩家列表
     */
    listOfPlayersWithVisibleMarkers: PlayerEntity[]
    /**
     * Returns the list of Players tracking this Marker
     *
     * 追踪标识的玩家列表: 返回追踪该标识的玩家列表
     */
    listOfPlayersTrackingMarkers: PlayerEntity[]
  } {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const miniMapMarkerIdObj = parseValue(miniMapMarkerId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_specified_mini_map_marker_information',
      args: [targetEntityObj, miniMapMarkerIdObj]
    })
    return {
      activationStaet: (() => {
        const ret = new bool()
        ret.markPin(ref, 'activationStaet', 0)
        return ret as unknown as boolean
      })(),
      listOfPlayersWithVisibleMarkers: (() => {
        const ret = new list('entity')
        ret.markPin(ref, 'listOfPlayersWithVisibleMarkers', 1)
        return ret as unknown as PlayerEntity[]
      })(),
      listOfPlayersTrackingMarkers: (() => {
        const ret = new list('entity')
        ret.markPin(ref, 'listOfPlayersTrackingMarkers', 2)
        return ret as unknown as PlayerEntity[]
      })()
    }
  }

  /**
   * Searches the configuration and activation status of the Entity's current Mini-map Marker
   *
   * 获取实体的小地图标识状态: 查询实体当前小地图标识的配置及生效情况
   *
   * @param targetEntity Runtime Entity
   *
   * 目标实体: 运行时的实体
   */
  getEntitySMiniMapMarkerStatus(targetEntity: EntityValue): {
    /**
     * Complete list of Mini-map Marker IDs for this Entity
     *
     * 全量小地图标识序号列表: 该实体的所有小地图标识枚举列表
     */
    fullMiniMapMarkerIdList: bigint[]
    /**
     * Complete list of active Mini-map Marker IDs for this Entity
     *
     * 生效的小地图标识序号列表: 该实体的所有生效小地图标识枚举列表
     */
    activeMiniMapMarkerIdList: bigint[]
    /**
     * Complete list of inactive Mini-map Marker IDs for this Entity
     *
     * 未生效的小地图标识序号列表: 该实体的所有未生效小地图标识枚举列表
     */
    inactiveMiniMapMarkerIdList: bigint[]
  } {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_entity_s_mini_map_marker_status',
      args: [targetEntityObj]
    })
    return {
      fullMiniMapMarkerIdList: (() => {
        const ret = new list('int')
        ret.markPin(ref, 'fullMiniMapMarkerIdList', 0)
        return ret as unknown as bigint[]
      })(),
      activeMiniMapMarkerIdList: (() => {
        const ret = new list('int')
        ret.markPin(ref, 'activeMiniMapMarkerIdList', 1)
        return ret as unknown as bigint[]
      })(),
      inactiveMiniMapMarkerIdList: (() => {
        const ret = new list('int')
        ret.markPin(ref, 'inactiveMiniMapMarkerIdList', 2)
        return ret as unknown as bigint[]
      })()
    }
  }

  /**
   * Returns the Patrol Template information of the specified Creation Entity
   *
   * 获取当前造物的巡逻模板: 获取指定造物实体的巡逻模板信息
   *
   * @param creationEntity Runtime Creation Entity
   *
   * 造物实体: 运行时的造物实体
   */
  getCurrentCreationSPatrolTemplate(creationEntity: CreationEntity): {
    /**
     * The Patrol Template ID currently active on this Creation
     *
     * 巡逻模板序号: 造物当前生效的巡逻模板序号
     */
    patrolTemplateId: bigint
    /**
     * The Path ID referenced by the Creation's currently active Patrol Template
     *
     * 路径索引: 造物当前生效的巡逻模板引用的路径索引
     */
    pathIndex: bigint
    /**
     * The Waypoint ID the Creation will move to next
     *
     * 目标路点序号: 造物即将前往的路点序号
     */
    targetWaypointIndex: bigint
  } {
    const creationEntityObj = parseValue(creationEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_current_creation_s_patrol_template',
      args: [creationEntityObj]
    })
    return {
      patrolTemplateId: (() => {
        const ret = new int()
        ret.markPin(ref, 'patrolTemplateId', 0)
        return ret as unknown as bigint
      })(),
      pathIndex: (() => {
        const ret = new int()
        ret.markPin(ref, 'pathIndex', 1)
        return ret as unknown as bigint
      })(),
      targetWaypointIndex: (() => {
        const ret = new int()
        ret.markPin(ref, 'targetWaypointIndex', 2)
        return ret as unknown as bigint
      })()
    }
  }

  /**
   * Searches whether the Achievement corresponding to a specific ID on the Target Entity is complete
   *
   * 查询成就是否完成: 查询目标实体上特定序号对应的成就是否完成
   *
   * @param targetEntity
   *
   * 目标实体
   * @param achievementId
   *
   * 成就序号
   *
   * @returns
   *
   * 是否完成
   */
  queryIfAchievementIsCompleted(targetEntity: EntityValue, achievementId: IntValue): boolean {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const achievementIdObj = parseValue(achievementId, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_if_achievement_is_completed',
      args: [targetEntityObj, achievementIdObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'completed', 0)
    return ret as unknown as boolean
  }

  /**
   * Returns the Configuration ID of the currently active Scan Tags on the Target Entity
   *
   * 获取当前生效的扫描标签配置ID: 获取目标实体上当前生效的扫描标签的配置ID
   *
   * @param targetEntity
   *
   * 目标实体
   *
   * @returns
   *
   * 扫描标签配置ID
   */
  getTheCurrentlyActiveScanTagConfigId(targetEntity: EntityValue): configId {
    const targetEntityObj = parseValue(targetEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_the_currently_active_scan_tag_config_id',
      args: [targetEntityObj]
    })
    const ret = new configId()
    ret.markPin(ref, 'scanTagConfigId', 0)
    return ret as unknown as configId
  }

  /**
   * Returns the Rank change score for the Player Entity under different Settlement states
   *
   * 获取玩家段位变化分数: 获取玩家实体在不同结算状态下段位的变化分数
   *
   * @param playerEntity
   *
   * 玩家实体
   * @param settlementStatus
   *
   * 结算状态
   *
   * @returns
   *
   * 分数
   */
  getPlayerRankScoreChange(playerEntity: PlayerEntity, settlementStatus: SettlementStatus): bigint {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const settlementStatusObj = parseValue(settlementStatus, 'enumeration')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_rank_score_change',
      args: [playerEntityObj, settlementStatusObj]
    })
    const ret = new int()
    ret.markPin(ref, 'score', 0)
    return ret as unknown as bigint
  }

  /**
   * Returns the Player's Rank-related information
   *
   * 获取玩家段位信息: 获取玩家段位相关信息
   *
   * @param playerEntity
   *
   * 玩家实体
   */
  getPlayerRankingInfo(playerEntity: PlayerEntity): {
    /**
     *
     * 玩家段位总分
     */
    playerRankTotalScore: bigint
    /**
     *
     * 玩家连胜次数
     */
    playerWinStreak: bigint
    /**
     *
     * 玩家连败次数
     */
    playerLoseStreak: bigint
    /**
     *
     * 玩家连续逃跑次数
     */
    playerConsecutiveEscapes: bigint
  } {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_ranking_info',
      args: [playerEntityObj]
    })
    return {
      playerRankTotalScore: (() => {
        const ret = new int()
        ret.markPin(ref, 'playerRankTotalScore', 0)
        return ret as unknown as bigint
      })(),
      playerWinStreak: (() => {
        const ret = new int()
        ret.markPin(ref, 'playerWinStreak', 1)
        return ret as unknown as bigint
      })(),
      playerLoseStreak: (() => {
        const ret = new int()
        ret.markPin(ref, 'playerLoseStreak', 2)
        return ret as unknown as bigint
      })(),
      playerConsecutiveEscapes: (() => {
        const ret = new int()
        ret.markPin(ref, 'playerConsecutiveEscapes', 3)
        return ret as unknown as bigint
      })()
    }
  }

  /**
   * Get Player Escape Permission
   *
   * 获取玩家逃跑合法性: 获取玩家逃跑合法性
   *
   * @param playerEntity
   *
   * 玩家实体
   *
   * @returns
   *
   * 是否合法
   */
  getPlayerEscapeValidity(playerEntity: PlayerEntity): boolean {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_player_escape_validity',
      args: [playerEntityObj]
    })
    const ret = new bool()
    ret.markPin(ref, 'valid', 0)
    return ret as unknown as boolean
  }

  /**
   * Searches the list of Entity Layout Groups currently active in the Stage
   *
   * 查询当前激活的实体布设组列表: 查询当前关卡激活的实体布设组组成的列表
   *
   * @returns
   *
   * 实体布设组索引列表
   */
  getCurrentlyActiveEntityDeploymentGroups(): bigint[] {
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_currently_active_entity_deployment_groups',
      args: []
    })
    const ret = new list('int')
    ret.markPin(ref, 'entityDeploymentGroupIndexList', 0)
    return ret as unknown as bigint[]
  }

  /**
   * Searches the quantity of the specified Gift Box on the Player Entity
   *
   * 查询对应礼盒数量: 查询玩家实体上指定礼盒的数量
   *
   * @param playerEntity
   *
   * 玩家实体
   * @param giftBoxIndex
   *
   * 礼盒索引
   *
   * @returns
   *
   * 数量
   */
  queryCorrespondingGiftBoxQuantity(playerEntity: PlayerEntity, giftBoxIndex: IntValue): bigint {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const giftBoxIndexObj = parseValue(giftBoxIndex, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_corresponding_gift_box_quantity',
      args: [playerEntityObj, giftBoxIndexObj]
    })
    const ret = new int()
    ret.markPin(ref, 'quantity', 0)
    return ret as unknown as bigint
  }

  /**
   * Searches the consumed quantity of the specified Gift Box on the Player Entity
   *
   * 查询对应礼盒消耗数量: 查询玩家实体上指定礼盒的消耗数量
   *
   * @param playerEntity
   *
   * 玩家实体
   * @param giftBoxIndex
   *
   * 礼盒索引
   *
   * @returns
   *
   * 数量
   */
  queryCorrespondingGiftBoxConsumption(playerEntity: PlayerEntity, giftBoxIndex: IntValue): bigint {
    const playerEntityObj = parseValue(playerEntity, 'entity')
    const giftBoxIndexObj = parseValue(giftBoxIndex, 'int')
    const ref = this.registry.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'query_corresponding_gift_box_consumption',
      args: [playerEntityObj, giftBoxIndexObj]
    })
    const ret = new int()
    ret.markPin(ref, 'quantity', 0)
    return ret as unknown as bigint
  }
  // === AUTO-GENERATED END ===
}
