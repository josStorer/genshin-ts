import type { SimplifyDeep } from 'type-fest'

import type { DictKeyType, DictValueType } from './value.js'

/**
 * IR类型定义
 */
export type IRDocument = ServerIRDocument | ClientIRDocument

export type BaseIRDocument = {
  // IR版本号
  ir_version: 1
  // IR类型标识
  ir_type: 'node_graph'
  // 节点图变量定义
  variables?: Variable[]
}

export type ServerIRDocument = SimplifyDeep<
  BaseIRDocument & {
    graph: ServerGraphInfo
    nodes?: ServerNode[]
  }
>

export type ClientIRDocument = SimplifyDeep<
  BaseIRDocument & {
    graph: ClientGraphInfo
    nodes?: ClientNode[]
  }
>

export type ServerGraphSubType = 'entity' | 'status' | 'class' | 'item'
export type GraphMode = 'beyond' | 'classic'
export type ServerGraphMode = GraphMode
export type ClientGraphMode = GraphMode
export type ClientGraphSubType =
  | 'character_skill'
  | 'character_control_skill'
  | 'creation_skill'
  | 'creation_status'
  | 'creation_status_decision'
  | 'bool_filter'
  | 'int_filter'

export interface ServerGraphInfo {
  // 默认基于脚本文件名
  name?: string
  id?: number
  type: 'server'
  // 节点图模式（默认超限模式）
  mode?: ServerGraphMode
  sub_type?: ServerGraphSubType
}

export interface ClientGraphInfo {
  name?: string
  id?: number
  type: 'client'
  mode?: ClientGraphMode
  sub_type: ClientGraphSubType
  /** Filter-only evaluation interval in seconds. Defaults to 0.3. */
  evaluation_interval?: number
}

export type Variable =
  | {
      name: string
      exposed?: boolean
      type: Exclude<keyof LiteralValueTypeMap, 'dict'>
      value?: LiteralValueTypeMap[Exclude<keyof LiteralValueTypeMap, 'dict'>]
      length?: number
    }
  | {
      name: string
      exposed?: boolean
      type: 'dict'
      dict: { k: DictKeyType; v: DictValueType }
      value?: any
    }

export interface Node {
  id: number
  position?: [number, number]
  args?: Argument[]
  next?: NextConnection[]
}

export type ServerNode = SimplifyDeep<
  Node & {
    type: string
  }
>

export type ClientNode = SimplifyDeep<
  Node & {
    type: string
  }
>

export type Argument =
  | ConnectionArgument
  | {
      [K in Exclude<keyof ValueTypeMap, 'dict'>]: {
        type: K
        value: ValueTypeMap[K]
      }
    }[Exclude<keyof ValueTypeMap, 'dict'>]
  | {
      type: 'dict'
      value: ValueTypeMap['dict']
      dict?: {
        k: DictKeyType
        v: DictValueType
      }
    }
  | null

export interface ConnectionArgument {
  type: 'conn'
  value: ConnectionArgumentValue
}

export interface ConnectionArgumentValue {
  node_id: number
  index: number
  /**
   * Data value type carried by this connection.
   */
  type: ValueType
  /**
   * Extra type info for enum/enumeration connections.
   * Required when `type === 'enum'` or `type === 'enumeration'`.
   */
  enum?: string
  /**
   * Extra type info for dict connections.
   * Required when `type === 'dict'`.
   */
  dict?: {
    k: DictKeyType
    v: DictValueType
  }
  sub_index?: number
}

export type NextConnection = number | NextConnectionDetailed

export interface NextConnectionDetailed {
  // 目标节点ID
  node_id: number
  // 源节点的执行输出索引（可选）
  source_index?: number
  // 源节点的执行输出分支索引（可选）
  source_sub_index?: number
  // 目标节点的执行输入索引（可选）
  target_index?: number
  // 目标节点的执行输入分支索引（可选）
  target_sub_index?: number
}

export type ValueTypeMap = SimplifyDeep<LiteralValueTypeMap & SpecialValueTypeMap>

export type LiteralValueTypeMap = SimplifyDeep<
  LiteralValueTypeMapWithoutList & LiteralValueListTypeMap
>

export type LiteralValueTypeMapWithoutList = SimplifyDeep<
  LiteralValueTypeMapWithoutListAndDict & DictValueTypeMap
>

export type ListableValueTypeMap = LiteralValueTypeMapWithoutListAndDict
export type LiteralValueTypeMapWithoutListAndDict = SimplifyDeep<
  LiteralValueTypeMapWithoutStructAndListAndDict & StructValueTypeMap
>

export type CommonLiteralValueTypeMap = LiteralValueTypeMapWithoutStructAndListAndDict
export type LiteralValueTypeMapWithoutStructAndListAndDict = SimplifyDeep<
  BaseValueTypeMap & AdvancedValueTypeMap
>

export type CommonLiteralValueListTypeMap = {
  [K in keyof CommonLiteralValueTypeMap as `${K}_list`]: CommonLiteralValueTypeMap[K][]
}

export type LiteralValueListTypeMap = {
  [K in keyof LiteralValueTypeMapWithoutListAndDict as `${K}_list`]: LiteralValueTypeMapWithoutListAndDict[K][]
}

export interface BaseValueTypeMap {
  bool: boolean
  int: number
  float: number
  str: string
  vec3: [number, number, number]
}

export interface AdvancedValueTypeMap {
  guid: number
  entity: any
  prefab_id: number
  config_id: number
  faction: number
}

export type SpecialValueTypeMap = SimplifyDeep<
  StructValueTypeMap &
    DictValueTypeMap &
    GenericValueTypeMap &
    EnumValueTypeMap &
    LocalVariableValueTypeMap &
    CustomVariableSnapshotValueTypeMap
>

export interface StructValueTypeMap {
  struct: any
}

export interface DictValueTypeMap {
  dict: any
}

export interface GenericValueTypeMap {
  generic: any
}

export interface EnumValueTypeMap {
  enum: string
  enumeration: string
  enum_list: string[]
}

export interface LocalVariableValueTypeMap {
  local_variable: any
}

export interface CustomVariableSnapshotValueTypeMap {
  custom_variable_snapshot: any
}

export type ValueType = SimplifyDeep<keyof ValueTypeMap>

export type LiteralValueType = SimplifyDeep<keyof LiteralValueTypeMap>

export type LiteralValueTypeWithoutList = SimplifyDeep<keyof LiteralValueTypeMapWithoutList>

export type LiteralValueTypeWithoutListAndDict = SimplifyDeep<
  keyof LiteralValueTypeMapWithoutListAndDict
>
