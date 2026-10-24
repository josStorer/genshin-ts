/**
 * Native Lua multiple return values; use T[] for ordinary arrays.
 *
 * 原生 Lua 多返回值；普通数组请使用 T[]。
 */
export type LuaMultiReturn<T extends unknown[]> = T & { readonly __tstlMultiReturn: unknown }

/**
 * Native iterator; TSTL turns for...of over it into Lua for...in.
 *
 * 原生迭代器；用于 for...of 时由 TSTL 转成 Lua 的 for...in。
 */
export type LuaIterable<T> = Iterable<T> & { readonly __tstlIterable: 'Iterable' }
/**
 * Returns several Lua values explicitly; an ordinary TS array still returns one table.
 *
 * 显式返回多个 Lua 值；普通 TS 数组仍返回一个 table。
 */
export type LuaMulti = (<T extends unknown[]>(this: void, ...values: T) => LuaMultiReturn<T>) & {
  readonly __tstlExtension: 'MultiFunction'
}

/**
 * Timer handle owned by the current mount; it is not a number and cannot be cancelled from another mount.
 *
 * 属于当前挂载实例的定时器句柄；不能当作数字或跨实例取消。
 */
export interface LuaTimerHandle {
  readonly __gstsTimer: unique symbol
}
