import type { Vector3Value } from './lua_host.js'
import type { LuaSignalKind, SignalDefinition } from './signal_definition.js'

export { defineSignal } from './signal_definition.js'

export type LuaSignalParamType = LuaSignalKind
export type LuaSignalType = LuaSignalParamType | `${LuaSignalParamType}_list`
export type LuaSignalParams = readonly (readonly [name: string, type: LuaSignalType])[]
export type LuaSignalDefinition<
  N extends string = string,
  P extends LuaSignalParams = LuaSignalParams
> = SignalDefinition<N, P>
/** 官方传递的实体标识值，不是节点图的实体对象。 */
export type LuaEntityValue = number & { readonly __gstsHostEntity?: unique symbol }
/** 官方传递的 GUID 数值；不转换成节点图的值封装。 */
export type LuaGuidValue = number & { readonly __gstsHostGuid?: unique symbol }
/** 每个 Lua 种类的 TS 值。新增或删除种类时，下方的完整性约束会报错。 */
export interface LuaKindValues {
  int: number
  float: number
  str: string
  bool: boolean
  vec3: Vector3Value
  guid: LuaGuidValue
  entity: LuaEntityValue
  prefab_id: number
  config_id: number
}
type CompleteKinds<
  T extends Record<LuaSignalKind, unknown> & Record<Exclude<keyof T, LuaSignalKind>, never>
> = T
type KindValues = CompleteKinds<LuaKindValues>
type Value<T extends LuaSignalType> = T extends LuaSignalKind
  ? KindValues[T]
  : T extends `${infer K extends LuaSignalKind}_list`
    ? KindValues[K][]
    : never
export type LuaSignalValues<P extends LuaSignalParams> = {
  -readonly [K in keyof P]: P[K] extends readonly [string, infer T extends LuaSignalType]
    ? Value<T>
    : never
}
export type LuaSignalEvent<S extends LuaSignalDefinition> = {
  readonly name: S['name']
  readonly params: { [P in S['params'][number] as P[0]]: Value<P[1]> }
}
/** 根级声明监听；Start/Enable 注册，Disable 暂停，Destroy 释放。取消函数可重复调用。 */
export type LuaOnSignal = <S extends LuaSignalDefinition>(
  this: void,
  signal: S,
  callback: (this: void, evt: LuaSignalEvent<S>) => void
) => (this: void) => void
