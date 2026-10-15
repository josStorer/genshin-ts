import type { LuaIterable, LuaMultiReturn } from './lua_primitives.js'

export type { LuaIterable } from './lua_primitives.js'
type ProtectedResult<R> = LuaMultiReturn<
  [true, ...(R extends LuaMultiReturn<infer Values> ? Values : [R])] | [false, unknown]
>
export interface LuaDate {
  year: number
  month: number
  day: number
  hour?: number
  min?: number
  sec?: number
  wday?: number
  yday?: number
  isdst?: boolean
}
/** 元表属于原生 Lua 互操作。回调使用箭头函数，参数在边界先检查类型。 */
export interface LuaMetatable {
  __index?: object | ((this: void, table: unknown, key: unknown) => unknown)
  __newindex?: object | ((this: void, table: unknown, key: unknown, value: unknown) => void)
  __call?: (this: void, ...args: unknown[]) => unknown
  __tostring?: (this: void, value: unknown) => string
  __len?: (this: void, value: unknown) => number
  __eq?: (this: void, a: unknown, b: unknown) => boolean
  __metatable?: unknown
  __mode?: 'k' | 'v' | 'kv'
}
/** 官方沙箱可用的原生基础 API；io、coroutine、string.dump 和 debug.getinfo 不在其中。 */
export interface LuaStandardGlobals {
  print(this: void, ...values: unknown[]): void
  printerr(this: void, ...values: unknown[]): void
  typeof(this: void, value: unknown): string
  tostring(this: void, value: unknown): string
  tonumber(this: void, value: unknown, base?: number): number | undefined
  /** 加载原生模块。未知导出需先检查类型，常用模块建议添加同名 .d.ts 后用 import。 */
  require(this: void, name: string): unknown
  type(
    this: void,
    value: unknown
  ): 'nil' | 'boolean' | 'number' | 'string' | 'table' | 'function' | 'thread' | 'userdata'
  /** 捕获原生 Lua 错误；回调不接收隐式 self。 */
  pcall<A extends unknown[], R>(
    this: void,
    fn: (this: void, ...args: A) => R,
    ...args: A
  ): ProtectedResult<R>
  xpcall<A extends unknown[], R>(
    this: void,
    fn: (this: void, ...args: A) => R,
    handler: (this: void, error: unknown) => unknown,
    ...args: A
  ): ProtectedResult<R>
  error(this: void, message: unknown, level?: number): never
  assert<T>(this: void, value: T, message?: string): NonNullable<T>
  /** 原生 Lua 数学库；与 TS Math 并存。 */
  readonly math: {
    abs(this: void, x: number): number
    acos(this: void, x: number): number
    asin(this: void, x: number): number
    atan(this: void, y: number, x?: number): number
    ceil(this: void, x: number): number
    cos(this: void, x: number): number
    deg(this: void, radians: number): number
    exp(this: void, x: number): number
    floor(this: void, x: number): number
    fmod(this: void, x: number, y: number): number
    log(this: void, x: number, base?: number): number
    min(this: void, ...values: number[]): number
    max(this: void, ...values: number[]): number
    modf(this: void, x: number): LuaMultiReturn<[number, number]>
    rad(this: void, degrees: number): number
    random(this: void, max?: number): number
    random(this: void, min: number, max: number): number
    randomseed(this: void, seed: number): void
    sin(this: void, x: number): number
    sqrt(this: void, x: number): number
    tan(this: void, x: number): number
    tointeger(this: void, x: unknown): number | undefined
    type(this: void, x: unknown): 'integer' | 'float' | undefined
    ult(this: void, x: number, y: number): boolean
    isnan(this: void, x: number): boolean
    isinf(this: void, x: number): boolean
    readonly pi: number
    readonly huge: number
    readonly maxinteger: number
    readonly mininteger: number
  }
  readonly string: {
    byte(this: void, value: string, start?: number, end?: number): LuaMultiReturn<number[]>
    char(this: void, ...bytes: number[]): string
    reverse(this: void, value: string): string
    gmatch(this: void, value: string, pattern: string): LuaIterable<LuaMultiReturn<string[]>>
    pack(this: void, format: string, ...values: (string | number)[]): string
    packsize(this: void, format: string): number
    unpack(
      this: void,
      format: string,
      value: string,
      position?: number
    ): LuaMultiReturn<(string | number)[]>
    /** Lua 从 1 开始；这里保留原生索引规则。普通 TS 字符串方法仍使用 TS 的索引。 */
    sub(this: void, value: string, start: number, end?: number): string
    len(this: void, value: string): number
    lower(this: void, value: string): string
    upper(this: void, value: string): string
    rep(this: void, value: string, count: number, separator?: string): string
    format(this: void, format: string, ...values: unknown[]): string
    match(
      this: void,
      value: string,
      pattern: string,
      start?: number
    ): LuaMultiReturn<(string | undefined)[]>
    find(
      this: void,
      value: string,
      pattern: string,
      start?: number,
      plain?: boolean
    ): LuaMultiReturn<[number | undefined, number | undefined, ...string[]]>
    gsub(
      this: void,
      value: string,
      pattern: string,
      replacement: string,
      max?: number
    ): LuaMultiReturn<[string, number]>
  }
  readonly table: {
    move<T>(
      this: void,
      source: T[],
      first: number,
      last: number,
      target: number,
      destination?: T[]
    ): T[]
    pack<T>(this: void, ...values: T[]): T[] & { n: number }
    insert<T>(this: void, list: T[], value: T): void
    insert<T>(this: void, list: T[], position: number, value: T): void
    remove<T>(this: void, list: T[], position?: number): T | undefined
    concat(
      this: void,
      list: (string | number)[],
      separator?: string,
      start?: number,
      end?: number
    ): string
    sort<T>(this: void, list: T[], less?: (this: void, a: T, b: T) => boolean): void
    unpack<T>(this: void, list: T[], start?: number, end?: number): LuaMultiReturn<T[]>
  }
  readonly os: {
    clock(this: void): number
    time(this: void, date?: LuaDate): number
    difftime(this: void, newer: number, older: number): number
    date(this: void, format: '*t' | '!*t', time?: number): LuaDate
    date(this: void, format?: string, time?: number): string
  }
  readonly utf8: {
    char(this: void, ...codepoints: number[]): string
    readonly charpattern: string
    codes(this: void, value: string): LuaIterable<LuaMultiReturn<[number, number]>>
    codepoint(this: void, value: string, start?: number, end?: number): LuaMultiReturn<number[]>
    len(
      this: void,
      value: string,
      start?: number,
      end?: number
    ): LuaMultiReturn<[number | undefined, number | undefined]>
    offset(this: void, value: string, count: number, position?: number): number | undefined
  }
  readonly debug: { traceback(this: void, message?: string, level?: number): string }
  readonly _VERSION: string
  /** 原生 Lua 索引从 1 开始；普通 TS 数组仍从 0 开始。 */
  ipairs<T>(this: void, list: T[]): LuaIterable<LuaMultiReturn<[number, T]>>
  pairs<T extends object>(this: void, value: T): LuaIterable<LuaMultiReturn<[keyof T, T[keyof T]]>>
  next<T extends object>(
    this: void,
    value: T,
    key?: keyof T
  ): LuaMultiReturn<[keyof T | undefined, T[keyof T] | undefined]>
  rawequal(this: void, a: unknown, b: unknown): boolean
  rawlen(this: void, value: object | string): number
  rawget<T extends object, K extends keyof T>(this: void, value: T, key: K): T[K] | undefined
  rawset<T extends object, K extends keyof T>(this: void, value: T, key: K, item: T[K]): T
  getmetatable(this: void, value: unknown): unknown
  setmetatable<T extends object>(this: void, value: T, metatable: LuaMetatable | undefined): T
  select(this: void, index: '#', ...values: unknown[]): number
  select(this: void, index: number, ...values: unknown[]): LuaMultiReturn<unknown[]>
}
