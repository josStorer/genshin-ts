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
/**
 * Entity identifier value passed by the host; not a node-graph entity object.
 *
 * 官方传递的实体标识值，不是节点图的实体对象。
 */
export type LuaEntityValue = number & { readonly __gstsHostEntity?: unique symbol }
/**
 * GUID number passed by the host; not converted to a node-graph value wrapper.
 *
 * 官方传递的 GUID 数值；不转换成节点图的值封装。
 */
export type LuaGuidValue = number & { readonly __gstsHostGuid?: unique symbol }
/**
 * TS value of each Lua kind. Adding or removing a kind makes the completeness check below fail.
 *
 * 每个 Lua 种类的 TS 值。新增或删除种类时，下方的完整性约束会报错。
 */
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
  /**
   * Signal name.
   *
   * 信号名。
   */
  readonly name: S['name']
  /**
   * Parameters by name, typed from the signal definition.
   *
   * 按参数名读取的参数，类型来自信号定义。
   */
  readonly params: { [P in S['params'][number] as P[0]]: Value<P[1]> }
  /**
   * The same parameters in definition order, e.g. const [text, count] = evt.values.
   *
   * 按定义顺序排列的同一组参数，例如 const [text, count] = evt.values。
   */
  readonly values: Readonly<LuaSignalValues<S['params']>>
}
/**
 * Event of a signal listened to by name only: there is no definition, so parameters are neither named nor checked.
 *
 * 只按信号名监听时收到的事件：没有信号定义，参数没有名字，也不做检查。
 */
export type LuaNamedSignalEvent<N extends string = string> = {
  /**
   * Signal name.
   *
   * 信号名。
   */
  readonly name: N
  /**
   * Parameter values in the order the server sent them; check each value's type before use.
   *
   * 按服务器发送顺序排列的参数值；使用前请自行判断类型。
   */
  readonly values: readonly unknown[]
}
/**
 * Declare listeners at the root: registered on Start/Enable, paused on Disable, released on Destroy. The cancel function is safe to call more than once.
 *
 * 根级声明监听；Start/Enable 注册，Disable 暂停，Destroy 释放。取消函数可重复调用。
 */
export interface LuaOnSignal {
  /**
   * Receives a signal from the server by its definition (Signal.X or defineSignal): read parameters by name with
   * evt.params.name or in order with evt.values; both are typed and checked. Write it at the callback root: it
   * pauses while the script is disabled, resumes when enabled and is released on destroy. Returns a cancel
   * function that is safe to call more than once.
   *
   * 按信号定义（Signal.X 或 defineSignal）接收服务器信号：用 evt.params.参数名 按名字读取，或用 evt.values 按顺序读取，都有类型并经过检查。
   * 写在回调根部即可：脚本停用时暂停、重新启用后恢复、销毁时释放。返回取消函数，重复调用无害。
   */
  <S extends LuaSignalDefinition>(
    this: void,
    signal: S,
    callback: (this: void, evt: LuaSignalEvent<S>) => void
  ): (this: void) => void
  /**
   * Receives a signal by name only, as in node graphs. There is no definition, so evt.values holds the raw values
   * in the order the server sent them (unknown, not checked) and there is no evt.params. Lifecycle and cancel
   * function work as with a definition.
   *
   * 只按信号名接收，和节点图的字符串写法一样。没有信号定义，所以 evt.values 是按服务器发送顺序排列的原始值（unknown，不做检查），也没有 evt.params。
   * 启停管理和取消函数与传信号定义时相同。
   */
  <N extends string>(
    this: void,
    signalName: N,
    callback: (this: void, evt: LuaNamedSignalEvent<N>) => void
  ): (this: void) => void
}
