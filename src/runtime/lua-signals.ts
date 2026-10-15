import type { Vector3Value } from './lua-host.js'

/** 类型声明、静态发送代码及动态发送辅助库共用这张表。 */
export const luaSignalWriters = {
  int: 'AddInt',
  float: 'AddFloat',
  str: 'AddString',
  bool: 'AddBool',
  vec3: 'AddVector3',
  guid: 'AddGuid',
  entity: 'AddEntity',
  prefab_id: 'AddPrefabId',
  config_id: 'AddConfigId'
} as const
export type LuaSignalParamType = keyof typeof luaSignalWriters
export type LuaSignalType = LuaSignalParamType | `${LuaSignalParamType}_list`
export type LuaSignalParams = readonly (readonly [name: string, type: LuaSignalType])[]
export interface LuaSignalDefinition<
  N extends string = string,
  P extends LuaSignalParams = LuaSignalParams
> {
  readonly __gstsSignal: true
  readonly name: N
  readonly params: P
}
type Value<T extends LuaSignalType> = T extends `${infer E extends LuaSignalParamType}_list`
  ? Value<E>[]
  : T extends 'bool'
    ? boolean
    : T extends 'str'
      ? string
      : T extends 'vec3'
        ? Vector3Value
        : number
export type LuaSignalValues<P extends LuaSignalParams> = {
  -readonly [K in keyof P]: P[K] extends readonly [string, infer T extends LuaSignalType]
    ? Value<T>
    : never
}
/** 信号顺序及类型来自编辑器提取；Lua 与节点图共享同一份定义数据。 */
export function defineSignal<const N extends string, const P extends LuaSignalParams>(
  this: void,
  name: N,
  params: P
): LuaSignalDefinition<N, P> {
  return { __gstsSignal: true, name, params }
}
