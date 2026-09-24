/** 原生 Lua 多返回值；普通数组请使用 T[]。 */
export type LuaMultiReturn<T extends unknown[]> = T & { readonly __tstlMultiReturn: unknown }
