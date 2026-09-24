import type { readParams } from './lua-params.js'
export { readParams } from './lua-params.js'
import type { ClientUIBaseControl, ControlTypes, HostColor, HostEnums, HostGame, Script } from './lua-host.js'
export type * from './lua-host.js'
export type { LuaMultiReturn } from './lua-primitives.js'
import type { LuaMultiReturn } from './lua-primitives.js'

/** 官方按名称调用这些函数；不需要全部填写。 */
export interface ClientScriptHooks {
  /** 脚本初始化。 */
  onInit?(this: void): void
  /** 脚本开始运行。 */
  onStart?(this: void): void
  /** 脚本启用。 */
  onEnable?(this: void): void
  /** 脚本停用，可在这里取消监听。 */
  onDisable?(this: void): void
  /** 每帧更新，dt 单位为秒；不受关卡时停影响。需先 EnableUpdate(true)。 */
  onUpdate?(this: void, dt: number): void
  /** 关卡更新，dt 单位为秒；受关卡时停影响。 */
  onLevelUpdate?(this: void, dt: number): void
  /** 脚本销毁，释放自己创建的资源。 */
  onDestroy?(this: void): void
}
export interface ClientGlobals {
  /** 当前挂载控件；等价于 script.object。 */
  readonly self: ClientUIBaseControl
  readonly script: Script
  readonly game: HostGame
  readonly Enum: HostEnums
  readonly Color: HostColor
  /** 常用工具，与 genshin-ts/runtime/lua 的导出相同。 */
  readonly helper: ClientHelpers
  print(this: void, ...values: unknown[]): void
  printerr(this: void, ...values: unknown[]): void
  typeof(this: void, value: unknown): string
  tostring(this: void, value: unknown): string
  tonumber(this: void, value: unknown, base?: number): number | undefined
  /** 加载原生模块。未知导出需先检查类型，常用模块建议添加同名 .d.ts 后用 import。 */
  require(this: void, name: string): unknown
  type(this: void, value: unknown): 'nil' | 'boolean' | 'number' | 'string' | 'table' | 'function' | 'thread' | 'userdata'
  /** 捕获原生 Lua 错误；回调不接收隐式 self。 */
  pcall<A extends unknown[], R>(this: void, fn: (this: void, ...args: A) => R, ...args: A): LuaMultiReturn<[true, R] | [false, unknown]>
  xpcall<A extends unknown[], R>(this: void, fn: (this: void, ...args: A) => R, handler: (this: void, error: unknown) => unknown, ...args: A): LuaMultiReturn<[true, R] | [false, unknown]>
  error(this: void, message: unknown, level?: number): never
  assert<T>(this: void, value: T, message?: string): NonNullable<T>
  readonly math: { abs(this: void, x: number): number; min(this: void, ...values: number[]): number; max(this: void, ...values: number[]): number; sin(this: void, x: number): number; cos(this: void, x: number): number; floor(this: void, x: number): number; ceil(this: void, x: number): number; sqrt(this: void, x: number): number; isnan(this: void, x: number): boolean; isinf(this: void, x: number): boolean; random(this: void, min?: number, max?: number): number; readonly pi: number }
  readonly string: {
    /** Lua 从 1 开始；这里保留原生索引规则。普通 TS 字符串方法仍使用 TS 的索引。 */
    sub(this: void, value: string, start: number, end?: number): string
    len(this: void, value: string): number
    lower(this: void, value: string): string
    upper(this: void, value: string): string
    rep(this: void, value: string, count: number, separator?: string): string
    format(this: void, format: string, ...values: unknown[]): string
    match(this: void, value: string, pattern: string, start?: number): LuaMultiReturn<(string | undefined)[]>
    find(this: void, value: string, pattern: string, start?: number, plain?: boolean): LuaMultiReturn<[number | undefined, number | undefined, ...string[]]>
    gsub(this: void, value: string, pattern: string, replacement: string, max?: number): LuaMultiReturn<[string, number]>
  }
  readonly table: {
    insert<T>(this: void, list: T[], value: T): void
    insert<T>(this: void, list: T[], position: number, value: T): void
    remove<T>(this: void, list: T[], position?: number): T | undefined
    concat(this: void, list: (string | number)[], separator?: string, start?: number, end?: number): string
    sort<T>(this: void, list: T[], less?: (this: void, a: T, b: T) => boolean): void
    unpack<T>(this: void, list: T[], start?: number, end?: number): LuaMultiReturn<T[]>
  }
  readonly os: { clock(this: void): number; time(this: void): number; difftime(this: void, newer: number, older: number): number; date(this: void, format?: string, time?: number): string }
  readonly debug: { traceback(this: void, message?: string, level?: number): string }
}
export type ClientControlScriptOptions = Record<string, never>
declare const scriptDefinition: unique symbol
export interface ClientScriptDefinition { readonly [scriptDefinition]: true }
export type ClientScriptSetup = (this: void, lua: ClientGlobals) => ClientScriptHooks
/** 声明一个客户端控件脚本，回调中的变量属于当前挂载实例。 */
export function clientControlScript(setup: ClientScriptSetup): ClientScriptDefinition
export function clientControlScript(options: ClientControlScriptOptions, setup: ClientScriptSetup): ClientScriptDefinition
export function clientControlScript(..._args: [ClientScriptSetup] | [ClientControlScriptOptions, ClientScriptSetup]): ClientScriptDefinition {
  throw new Error('clientControlScript 需要使用 GSTS 编译为 Lua，不能作为 JavaScript 执行。')
}
/** 将数值限制在 min 到 max 之间。 */
export declare function clamp(this: void, value: number, min: number, max: number): number
/** 按进度插值；t 为 0 时返回 from，为 1 时返回 to，不自动限制 t。 */
export declare function lerp(this: void, from: number, to: number, t: number): number
/** 向目标移动最多 maxDelta，抵达后不越过目标；maxDelta 应非负。 */
export declare function moveTowards(this: void, value: number, target: number, maxDelta: number): number
/** 检查真实控件类型，成功后可补全该控件的专属属性。 */
export declare function isControl<K extends keyof ControlTypes>(this: void, control: unknown, kind: K): control is ControlTypes[K]
/** 从指定父控件逐级查找；不存在时返回 undefined，重名或类型不符时报错。 */
export declare function findControl<K extends keyof ControlTypes>(this: void, root: ClientUIBaseControl, path: string, kind: K): ControlTypes[K] | undefined
/** 查找必须存在的控件；找不到时报告完整路径。 */
export declare function requireControl<K extends keyof ControlTypes>(this: void, root: ClientUIBaseControl, path: string, kind: K): ControlTypes[K]
/** 注册一次按键监听，返回可重复调用的取消函数。 */
export declare function listenKey(this: void, control: ClientUIBaseControl, event: HostEnums['KeyEventType'][keyof HostEnums['KeyEventType']], callback: (this: void) => boolean): (this: void) => void
export interface ClientHelpers { readParams: typeof readParams; clamp: typeof clamp; lerp: typeof lerp; moveTowards: typeof moveTowards; isControl: typeof isControl; findControl: typeof findControl; requireControl: typeof requireControl; listenKey: typeof listenKey }
