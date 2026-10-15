import type { Vector3Value } from './lua_host.js'
import { luaSignalWriters, type SignalDefinition } from './signal_definition.js'

export { defineSignal, luaSignalWriters } from './signal_definition.js'

export type LuaSignalParamType = keyof typeof luaSignalWriters
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
type Value<T extends LuaSignalType> = T extends `${infer E extends LuaSignalParamType}_list`
  ? Value<E>[]
  : T extends 'bool'
    ? boolean
    : T extends 'str'
      ? string
      : T extends 'vec3'
        ? Vector3Value
        : T extends 'entity'
          ? LuaEntityValue
          : T extends 'guid'
            ? LuaGuidValue
            : number
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
