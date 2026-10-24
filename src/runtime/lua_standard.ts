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
/**
 * 官方沙箱可用的原生基础 API。官方文档列出不可用：string.dump、io、coroutine、
 * 除 time/date/clock/difftime 外的 os、除 traceback 外的 debug；2026-10-24 实机另外确认没有
 * _VERSION、string.pack/unpack/packsize、load/loadstring/dofile/loadfile、collectgarbage、package。
 * 这些都是 Lua 标准库，主要用于和原生 Lua 代码互相调用；平时用 TS 自带的写法即可。
 */
export interface LuaStandardGlobals {
  /** 官方：写一条普通级别日志，不阻断运行。TS 里一般用 console.log。 */
  print(this: void, ...values: unknown[]): void
  /** 官方：写一条错误级别日志，不抛错、不阻断运行。TS 里一般用 console.error。 */
  printerr(this: void, ...values: unknown[]): void
  /** 官方：返回运行时类型名，用于识别宿主对象（控件会返回具体控件类型）；判断控件类型更推荐 lua.helper.isControl。 */
  typeof(this: void, value: unknown): string
  /** Lua 标准库：转成字符串，会调用 __tostring。官方沙箱里普通表转出来是 `<table>`。TS 里可写 String(x)。 */
  tostring(this: void, value: unknown): string
  /** Lua 标准库：转成数字，转不了返回 undefined；base 指定进制。TS 里可写 Number(x)。 */
  tonumber(this: void, value: unknown, base?: number): number | undefined
  /** 加载原生模块。未知导出需先检查类型，常用模块建议添加同名 .d.ts 后用 import。 */
  require(this: void, name: string): unknown
  /** Lua 标准库：返回 Lua 类型名（'nil'、'number'、'table' 等）。TS 里一般用 typeof。 */
  type(
    this: void,
    value: unknown
  ): 'nil' | 'boolean' | 'number' | 'string' | 'table' | 'function' | 'thread' | 'userdata'
  /** 捕获原生 Lua 错误；回调不接收隐式 self。官方沙箱会把抛出的值转成字符串，失败时第二个返回值总是文字。 */
  pcall<A extends unknown[], R>(
    this: void,
    fn: (this: void, ...args: A) => R,
    ...args: A
  ): ProtectedResult<R>
  /** 同 pcall，出错时先把错误交给 handler 处理（例如 debug.traceback 加上调用栈）。handler 收到的也是字符串。 */
  xpcall<A extends unknown[], R>(
    this: void,
    fn: (this: void, ...args: A) => R,
    handler: (this: void, error: unknown) => unknown,
    ...args: A
  ): ProtectedResult<R>
  /** Lua 标准库：抛出错误，中断执行。官方沙箱会把 message 转成字符串；TS 里一般用 throw new Error(...)。 */
  error(this: void, message: unknown, level?: number): never
  /** Lua 标准库：value 为 false 或 nil 时抛错，否则原样返回 value。 */
  assert<T>(this: void, value: T, message?: string): NonNullable<T>
  /** 原生 Lua 数学库；与 TS Math 并存。常用的有 fmod（与 JS % 一致的取余）、tointeger、type。 */
  readonly math: {
    /** 绝对值。 */
    abs(this: void, x: number): number
    /** 反余弦，返回弧度。 */
    acos(this: void, x: number): number
    /** 反正弦，返回弧度。 */
    asin(this: void, x: number): number
    /** 反正切，返回弧度；传 x 时等同 atan2(y, x)。 */
    atan(this: void, y: number, x?: number): number
    /** 向上取整，返回整数。 */
    ceil(this: void, x: number): number
    /** 余弦，参数为弧度。 */
    cos(this: void, x: number): number
    /** 弧度转角度。 */
    deg(this: void, radians: number): number
    /** e 的 x 次方。 */
    exp(this: void, x: number): number
    /** 向下取整，返回整数。 */
    floor(this: void, x: number): number
    /** 取余，符号跟随被除数，与 JS 的 % 一致（Lua 的 % 符号跟随除数）。 */
    fmod(this: void, x: number, y: number): number
    /** 对数，默认自然对数；base 指定底数。 */
    log(this: void, x: number, base?: number): number
    /** 最小值。 */
    min(this: void, ...values: number[]): number
    /** 最大值。 */
    max(this: void, ...values: number[]): number
    /** 拆成整数部分和小数部分，两个返回值。 */
    modf(this: void, x: number): LuaMultiReturn<[number, number]>
    /** 角度转弧度。 */
    rad(this: void, degrees: number): number
    /** 不传参数返回 [0, 1) 的小数；传 max 返回 1 到 max 的整数。 */
    random(this: void, max?: number): number
    /** 返回 min 到 max 的整数（含两端）。 */
    random(this: void, min: number, max: number): number
    /** 设置随机数种子。 */
    randomseed(this: void, seed: number): void
    /** 正弦，参数为弧度。 */
    sin(this: void, x: number): number
    /** 平方根。 */
    sqrt(this: void, x: number): number
    /** 正切，参数为弧度。 */
    tan(this: void, x: number): number
    /** 能精确表示为整数时返回 Lua 整数，否则返回 undefined。 */
    tointeger(this: void, x: unknown): number | undefined
    /** 'integer' 或 'float'（Lua 5.3 区分整数和浮点，4 / 2 是浮点 2.0）；不是数字时返回 undefined。 */
    type(this: void, x: unknown): 'integer' | 'float' | undefined
    /** 按无符号整数比较 x < y。 */
    ult(this: void, x: number, y: number): boolean
    /** 官方补充：是否为 NaN。 */
    isnan(this: void, x: number): boolean
    /** 官方补充：是否为正负无穷。 */
    isinf(this: void, x: number): boolean
    /** 圆周率。 */
    readonly pi: number
    /** 正无穷。 */
    readonly huge: number
    /** 最大的 Lua 整数（2^63 - 1）。 */
    readonly maxinteger: number
    /** 最小的 Lua 整数（-2^63）。 */
    readonly mininteger: number
  }
  /** 原生 Lua 字符串库，按字节处理、索引从 1 开始；find、match、gsub、gmatch 用的是 Lua 模式，不是正则。 */
  readonly string: {
    /** 取出 start 到 end 的字节值（默认第 1 个）。 */
    byte(this: void, value: string, start?: number, end?: number): LuaMultiReturn<number[]>
    /** 用字节值拼出字符串。 */
    char(this: void, ...bytes: number[]): string
    /** 按字节反转；含中文时会被拆坏。 */
    reverse(this: void, value: string): string
    /** 逐个返回 Lua 模式的匹配结果，用于 for...of。 */
    gmatch(this: void, value: string, pattern: string): LuaIterable<LuaMultiReturn<string[]>>
    /** Lua 从 1 开始；这里保留原生索引规则。普通 TS 字符串方法仍使用 TS 的索引。 */
    sub(this: void, value: string, start: number, end?: number): string
    /** 字节长度（一个中文字占 3 字节）。 */
    len(this: void, value: string): number
    /** 转小写。 */
    lower(this: void, value: string): string
    /** 转大写。 */
    upper(this: void, value: string): string
    /** 重复 count 次，可指定分隔符。 */
    rep(this: void, value: string, count: number, separator?: string): string
    /** 按 C 风格格式化，例如 string.format('%.2f', x)。 */
    format(this: void, format: string, ...values: unknown[]): string
    /** 返回 Lua 模式的第一个匹配（有捕获时返回各捕获），没有匹配返回 undefined。 */
    match(
      this: void,
      value: string,
      pattern: string,
      start?: number
    ): LuaMultiReturn<(string | undefined)[]>
    /** 查找起止位置（从 1 开始）；plain 为 true 时按普通文字查找。 */
    find(
      this: void,
      value: string,
      pattern: string,
      start?: number,
      plain?: boolean
    ): LuaMultiReturn<[number | undefined, number | undefined, ...string[]]>
    /** 按 Lua 模式替换，返回新字符串和替换次数。 */
    gsub(
      this: void,
      value: string,
      pattern: string,
      replacement: string,
      max?: number
    ): LuaMultiReturn<[string, number]>
  }
  /** 原生 Lua 表库，索引从 1 开始；处理 TS 数组时一般用数组自带的方法。 */
  readonly table: {
    /** 把 source 的 first..last 复制到 destination（默认 source）的 target 起。 */
    move<T>(
      this: void,
      source: T[],
      first: number,
      last: number,
      target: number,
      destination?: T[]
    ): T[]
    /** 把参数打包成表，n 记录个数（含 nil）。 */
    pack<T>(this: void, ...values: T[]): T[] & { n: number }
    /** 追加到末尾。 */
    insert<T>(this: void, list: T[], value: T): void
    /** 插入到 position（从 1 开始）。 */
    insert<T>(this: void, list: T[], position: number, value: T): void
    /** 删除并返回 position（默认最后一个）的元素。 */
    remove<T>(this: void, list: T[], position?: number): T | undefined
    /** 用分隔符拼接成字符串。 */
    concat(
      this: void,
      list: (string | number)[],
      separator?: string,
      start?: number,
      end?: number
    ): string
    /** 原地排序；less(a, b) 返回 a 是否排在 b 前面。 */
    sort<T>(this: void, list: T[], less?: (this: void, a: T, b: T) => boolean): void
    /** 把表展开成多个返回值。 */
    unpack<T>(this: void, list: T[], start?: number, end?: number): LuaMultiReturn<T[]>
  }
  /** 官方沙箱只保留 clock、time、date、difftime。 */
  readonly os: {
    /** 程序使用的 CPU 时间，单位秒。 */
    clock(this: void): number
    /** 当前时间戳（秒）；传 date 表时把它换算成时间戳。 */
    time(this: void, date?: LuaDate): number
    /** 两个时间戳相差的秒数。 */
    difftime(this: void, newer: number, older: number): number
    /** '*t' 返回日期表（'!*t' 为 UTC）。 */
    date(this: void, format: '*t' | '!*t', time?: number): LuaDate
    /** 按格式返回日期文字，例如 os.date('%H:%M')。 */
    date(this: void, format?: string, time?: number): string
  }
  /** 原生 UTF-8 工具，按字符（而不是字节）处理中文等多字节文字。 */
  readonly utf8: {
    /** 用码点拼出字符串。 */
    char(this: void, ...codepoints: number[]): string
    /** 匹配一个 UTF-8 字符的 Lua 模式。 */
    readonly charpattern: string
    /** 逐个返回字节位置和码点，用于 for...of。 */
    codes(this: void, value: string): LuaIterable<LuaMultiReturn<[number, number]>>
    /** 取出 start 到 end 字节范围内各字符的码点。 */
    codepoint(this: void, value: string, start?: number, end?: number): LuaMultiReturn<number[]>
    /** 字符数；遇到无效编码时返回 undefined 和出错位置。 */
    len(
      this: void,
      value: string,
      start?: number,
      end?: number
    ): LuaMultiReturn<[number | undefined, number | undefined]>
    /** 第 count 个字符的起始字节位置。 */
    offset(this: void, value: string, count: number, position?: number): number | undefined
  }
  /** 官方沙箱只保留 traceback。 */
  readonly debug: {
    /** 返回调用栈文字（不会自动写日志）；message 加在开头，level 指定从哪一层开始。 */
    traceback(this: void, message?: string, level?: number): string
  }
  /** 原生 Lua 索引从 1 开始；普通 TS 数组仍从 0 开始。 */
  ipairs<T>(this: void, list: T[]): LuaIterable<LuaMultiReturn<[number, T]>>
  /** Lua 标准库：遍历表的所有键值，顺序不固定。TS 里一般用 Object.entries 或 for...in。 */
  pairs<T extends object>(this: void, value: T): LuaIterable<LuaMultiReturn<[keyof T, T[keyof T]]>>
  /** Lua 标准库：返回 key 之后的下一个键值；不传 key 时返回第一个。 */
  next<T extends object>(
    this: void,
    value: T,
    key?: keyof T
  ): LuaMultiReturn<[keyof T | undefined, T[keyof T] | undefined]>
  /** Lua 标准库：比较是否同一个值，不触发 __eq。 */
  rawequal(this: void, a: unknown, b: unknown): boolean
  /** Lua 标准库：取长度，不触发 __len。 */
  rawlen(this: void, value: object | string): number
  /** Lua 标准库：读取字段，不触发 __index。 */
  rawget<T extends object, K extends keyof T>(this: void, value: T, key: K): T[K] | undefined
  /** Lua 标准库：写入字段，不触发 __newindex。 */
  rawset<T extends object, K extends keyof T>(this: void, value: T, key: K, item: T[K]): T
  /** Lua 标准库：取元表。 */
  getmetatable(this: void, value: unknown): unknown
  /** Lua 标准库：设置元表，返回原表。 */
  setmetatable<T extends object>(this: void, value: T, metatable: LuaMetatable | undefined): T
  /** Lua 标准库：select('#', ...) 返回参数个数（含 nil）。 */
  select(this: void, index: '#', ...values: unknown[]): number
  /** Lua 标准库：返回第 index 个及之后的参数。 */
  select(this: void, index: number, ...values: unknown[]): LuaMultiReturn<unknown[]>
}
