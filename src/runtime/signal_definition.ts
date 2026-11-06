/** 校验类别只描述宿主值的形状；实体/GUID 的 TS 类型仍各自保留。 */
type SignalValidation = 'integer' | 'float' | 'string' | 'boolean' | 'vec3'
type SignalKind =
  | { writer: string; validation: SignalValidation }
  | { writer: undefined; validation: undefined }

/** 唯一的信号种类表。list 从标量派生；faction 目前仅节点图支持。 */
export const signalKinds = {
  int: { writer: 'AddInt', validation: 'integer' },
  float: { writer: 'AddFloat', validation: 'float' },
  str: { writer: 'AddString', validation: 'string' },
  bool: { writer: 'AddBool', validation: 'boolean' },
  vec3: { writer: 'AddVector3', validation: 'vec3' },
  guid: { writer: 'AddGuid', validation: 'integer' },
  entity: { writer: 'AddEntity', validation: 'integer' },
  prefab_id: { writer: 'AddPrefabId', validation: 'integer' },
  config_id: { writer: 'AddConfigId', validation: 'integer' },
  faction: { writer: undefined, validation: undefined }
} as const satisfies Record<string, SignalKind>
type SignalScalarType = keyof typeof signalKinds
export type LuaSignalKind = {
  [K in SignalScalarType]: (typeof signalKinds)[K]['writer'] extends string ? K : never
}[SignalScalarType]
export type SignalParamType = SignalScalarType | `${SignalScalarType}_list` | 'unknown'
export type SignalParamEntry = readonly [name: string, type: SignalParamType]
export type SignalParamEntries = readonly SignalParamEntry[]
export interface SignalDefinition<
  Name extends string = string,
  Params extends SignalParamEntries = SignalParamEntries
> {
  readonly __gstsSignal: true
  readonly name: Name
  readonly params: Params
}
/**
 * Signal definitions whose scalar and list parameters can be received by Lua.
 *
 * Lua 信号定义: 参数仅包含 Lua 支持的标量和列表类型。
 */
export type LuaSignalDefinition = SignalDefinition<
  string,
  readonly (readonly [string, LuaSignalKind | `${LuaSignalKind}_list`])[]
>
export function defineSignal<const Name extends string, const Params extends SignalParamEntries>(
  this: void,
  name: Name,
  params: Params
): SignalDefinition<Name, Params> {
  return { __gstsSignal: true, name, params }
}
