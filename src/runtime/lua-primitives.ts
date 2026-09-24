/** 原生 Lua 多返回值；普通数组请使用 T[]。 */
export type LuaMultiReturn<T extends unknown[]> = T & { readonly __tstlMultiReturn: unknown }

/** 原生迭代器；用于 for...of 时由 TSTL 转成 Lua 的 for...in。 */
export type LuaIterable<T> = Iterable<T> & { readonly __tstlIterable: 'Iterable' }
/** 显式返回多个 Lua 值；普通 TS 数组仍返回一个 table。 */
export type LuaMulti = (<T extends unknown[]>(this: void, ...values: T) => LuaMultiReturn<T>) & {
  readonly __tstlExtension: 'MultiFunction'
}
