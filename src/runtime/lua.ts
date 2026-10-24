import type {
  ClientUIBaseControl,
  ControlTypes,
  HostColor,
  HostEnums,
  HostGame,
  Script
} from './lua_host.js'
import type { LuaParam, LuaParamValues } from './lua_params.js'
import type { LuaMulti, LuaMultiReturn, LuaTimerHandle } from './lua_primitives.js'
import type { LuaOnSignal } from './lua_signals.js'
import type { LuaStandardGlobals } from './lua_standard.js'

export type * from './lua_standard.js'

export type * from './lua_host.js'
export type { LuaMultiReturn, LuaTimerHandle } from './lua_primitives.js'

/**
 * Lifecycle functions the host calls by name; write only the ones you need.
 *
 * 官方按名称调用这些函数；不需要全部填写。
 */
export interface ClientScriptHooks {
  /**
   * Runs after the callback root. The first order is Init → Enable → Start; child controls can already be found at the root.
   *
   * 根部执行之后初始化；首次顺序为 Init → Enable → Start，根部已可查找子控件。
   */
  onInit?(this: void): void
  /**
   * Runs once when each mount starts, after the first Enable.
   *
   * 每个挂载开始时执行一次；首次 Enable 已执行。
   */
  onStart?(this: void): void
  /**
   * Runs every time the script is enabled, including once before the first Start.
   *
   * 每次启用都执行，包括首次 Start 之前。
   */
  onEnable?(this: void): void
  /**
   * Runs when the script is disabled; cancel listeners here if needed.
   *
   * 脚本停用，可在这里取消监听。
   */
  onDisable?(this: void): void
  /**
   * Runs every frame, dt in seconds; not affected by level time pauses. Call EnableUpdate(true) first.
   *
   * 每帧更新，dt 单位为秒；不受关卡时停影响。需先 EnableUpdate(true)。
   */
  onUpdate?(this: void, dt: number): void
  /**
   * Runs every level frame, dt in seconds; pauses while level time is paused.
   *
   * 关卡更新，dt 单位为秒；受关卡时停影响。
   */
  onLevelUpdate?(this: void, dt: number): void
  /**
   * Runs when the script is destroyed; release resources you created.
   *
   * 脚本销毁，释放自己创建的资源。
   */
  onDestroy?(this: void): void
}
/**
 * The callback parameter lua: this script's environment. It compiles to Lua's _ENV, so lua.xxx is the Lua global xxx.
 * Most code uses the official API (script, game, Enum, Color) and gsts tools (helper, onSignal); the rest is the
 * Lua standard library (print, math, string and so on), needed mainly to work with native Lua code.
 *
 * 脚本回调参数 lua：这个脚本的运行环境，编译后就是 Lua 的 _ENV，lua.xxx 直接对应 Lua 全局 xxx。
 * 常用的是官方 API（script、game、Enum、Color）和 gsts 工具（helper、onSignal）；
 * 其余是 Lua 标准库（print、math、string 等），和原生 Lua 代码互相调用时才需要，平时用 TS 自带的写法即可。
 */
export interface ClientGlobals extends LuaStandardGlobals {
  /**
   * The client control this script is mounted on, same as lua.script.object; you can also write self directly.
   *
   * 当前脚本挂载的客户端控件，等价于 lua.script.object；回调里也可以直接写 self。
   */
  readonly self: ClientUIBaseControl
  /**
   * The current script (official Script): EnableUpdate switches per-frame updates, GetParam reads script
   * variables, object is the mounted control; Invoke, signal and variable listeners are here too.
   *
   * 当前脚本（官方 Script）：EnableUpdate 开关逐帧更新，GetParam 读取脚本变量，
   * object 是挂载的控件；Invoke 和信号、变量监听等官方接口也在这里。
   */
  readonly script: Script
  /**
   * The official game object: find, create and destroy client controls, tweens, ServerSignal to build server
   * signals, and reading level variables, language, canvas size, cursor position and more.
   *
   * 官方全局对象 game：查找、创建、销毁客户端控件，Tween 补间动画，ServerSignal 构造服务器信号，
   * 读取关卡变量、语言、画布大小、光标位置等。
   */
  readonly game: HostGame
  /**
   * Official enums, e.g. lua.Enum.KeyEventType.KeyboardJumpKeyDown or lua.Enum.EaseType.OutQuad.
   *
   * 官方枚举，例如 lua.Enum.KeyEventType.KeyboardJumpKeyDown、lua.Enum.EaseType.OutQuad。
   */
  readonly Enum: HostEnums
  /**
   * Creates a color: lua.Color(r, g, b, a?), each 0–255, opaque when a is omitted; FromRGB, ToRGBA and others too.
   *
   * 创建颜色：lua.Color(r, g, b, a?)，各分量 0–255，a 省略时不透明；也有 FromRGB、ToRGBA 等。
   */
  readonly Color: HostColor
  /**
   * gsts tools: finding controls, key listeners, timers, reading script variables, interpolation and more;
   * the same as the exports of genshin-ts/runtime/lua.
   *
   * gsts 常用工具：查找控件、按键监听、定时器、读脚本变量、数值插值等，和 genshin-ts/runtime/lua 的同名导出相同。
   */
  readonly helper: ClientHelpers
  /**
   * Receives a signal from the server; read parameters with evt.params.name. Write it at the callback root: it
   * pauses while the script is disabled, resumes when enabled and is released on destroy. Returns a cancel
   * function that is safe to call more than once.
   *
   * 接收服务器发来的信号，回调里用 evt.params.参数名 读取参数。写在回调根部即可：脚本停用时暂停、重新启用后恢复、销毁时释放。返回取消函数，重复调用无害。
   */
  readonly onSignal: LuaOnSignal
}
export interface ClientControlScriptOptions {
  /**
   * Which clock this script's setTimeout / setInterval use. 'level' (default) pauses with level time; 'real'
   * ignores level pauses. Use lua.helper.setTimeout / setInterval to pick the other clock for a single timer.
   *
   * 本脚本的 setTimeout / setInterval 用哪种时间计时。'level'（默认）：关卡时停时一起暂停；'real'：不受时停影响。个别定时器要用另一种，用 lua.helper.setTimeout / setInterval 单独指定。
   */
  timerClock?: 'level' | 'real'
}
declare const scriptDefinition: unique symbol
export type ClientMethods = Record<string, (this: void, ...args: never[]) => unknown>
/**
 * For type inference only; the entry is expanded at compile time and this object is never created.
 *
 * 仅用于类型推断；入口在编译时展开，不会创建这个对象。
 */
export interface ClientScriptDefinition<M extends ClientMethods = ClientMethods> {
  readonly [scriptDefinition]: M
}
export type ClientScriptSetup<M extends ClientMethods = ClientMethods> = (
  this: void,
  lua: ClientGlobals
) => ClientScriptHooks & {
  /**
   * Methods other scripts can call. They run per mount and work on that mount's own state.
   * The caller finds the mount and calls a method like an ordinary function:
   * `const board = lua.helper.findScript<typeof Board>(control)`, then `board?.methods.push('x')`.
   * This entry must be export default g.clientControlScript(...), and the caller imports its type with
   * import type Board from './board'. Use top-level exports for functions and data shared by all mounts;
   * put only per-mount calls in methods.
   *
   * 公开给其他脚本的方法，按挂载实例执行，操作那个实例自己的状态。
   * 对方先找到挂载，再像普通函数一样调用：
   * `const board = lua.helper.findScript<typeof Board>(control)`，然后 `board?.methods.push('x')`。
   * 本入口需写 export default g.clientControlScript(...)，对方用 import type Board from './board' 引用类型。
   * 全体共享的函数和数据用顶层 export；按实例调用才放在 methods。
   */
  methods?: M
}
type MethodReturns<R> =
  R extends LuaMultiReturn<infer V>
    ? LuaMultiReturn<V>
    : R extends void
      ? LuaMultiReturn<[]>
      : LuaMultiReturn<[R]>
type MethodResult<R> = R extends LuaMultiReturn<infer V> ? LuaMultiReturn<V> : R
/** 入口定义里的 methods 类型。 */
export type MethodsOf<D extends ClientScriptDefinition> =
  D extends ClientScriptDefinition<infer M> ? M : never
/**
 * Typed handle for another mount's script. Call its public methods with handle.methods.name(...) or
 * handle.Invoke('name', ...); both use the official Invoke.
 *
 * 另一个挂载的脚本句柄。用 handle.methods.方法名(...) 或 handle.Invoke('方法名', ...) 调用它的公开方法，两种写法都走官方 Invoke。
 */
export interface ScriptHandle<M extends ClientMethods = ClientMethods> {
  /**
   * The other entry's public methods, called like ordinary functions: board.methods.push('x').
   * Returns the method's return value; a method that returns multi(...) gives multiple values.
   *
   * 对方入口的公开方法，像普通函数一样调用：board.methods.push('x')。返回方法的返回值；用 multi(...) 返回多个值的方法得到多返回值。
   */
  readonly methods: {
    readonly [K in keyof M]: (
      this: void,
      ...args: Parameters<M[K]>
    ) => MethodResult<ReturnType<M[K]>>
  }
  /**
   * Same as the official Script:Invoke, with typed method names and arguments; returns all return values.
   *
   * 与官方 Script:Invoke 相同，方法名和参数带类型；返回全部返回值。
   */
  Invoke<K extends keyof M & string>(
    this: ScriptHandle<M>,
    name: K,
    ...args: Parameters<M[K]>
  ): MethodReturns<ReturnType<M[K]>>
  /**
   * The official Script object itself, for fields such as enabled or path.
   *
   * 官方 Script 对象本身，需要 enabled、path 等字段时用。
   */
  readonly script: Script
}
/**
 * Finds the script of entry D mounted on a control and returns a typed handle, or undefined when there is
 * none. Write the type argument as typeof Entry (imported with import type); the compiler derives the script
 * path from it, so no 'lua/board' string is needed. With path, the control is first looked up by that name
 * path under control, as in findControl.
 *
 * 找到某个控件上挂载的入口 D 的脚本，返回带类型的句柄；没有时返回 undefined。类型参数写 typeof 入口（用 import type 导入），
 * 编译器据此确定脚本路径，不用手写 'lua/board'。写了 path 时先在 control 下按名称路径找到控件（同 findControl）。
 *
 * @example
 * import type Board from './board'
 * const board = lua.helper.findScript<typeof Board>(self.parent, 'Board')
 * board?.methods.push('jump +10')
 */
export declare function findScript<D extends ClientScriptDefinition = never>(
  this: void,
  control: ClientUIBaseControl | undefined,
  path?: string
): ScriptHandle<MethodsOf<D>> | undefined
/**
 * Usually you want findScript instead: it finds the mount and checks the entry for you.
 * Use scriptHandle only when you already hold an official Script (for example from GetScript or GetScripts)
 * and want the same typed handle; you confirm that it really mounts entry D.
 *
 * 通常请用 findScript：它会找到挂载，并替你核对入口。
 * 只有手里已经有官方 Script（例如来自 GetScript、GetScripts）、想得到同样的带类型句柄时才用 scriptHandle；由你确认它挂载的确实是入口 D。
 */
export declare function scriptHandle<D extends ClientScriptDefinition>(
  this: void,
  script: Script
): ScriptHandle<MethodsOf<D>>
/**
 * Reads the editor's script variables and checks their types. default is used when the editor has no such
 * variable; a variable that exists but is left blank is not missing (a string reads as an empty string). Find
 * controls by name path with findControl / requireControl instead.
 *
 * 读取编辑器脚本变量并检查类型。编辑器里没有这个变量时用 default；变量建了但留空，字符串会读到空串，不会用 default。控件请用 findControl/requireControl 按名称路径查找。
 */
export declare function readParams<const S extends Record<string, LuaParam>>(
  this: void,
  script: Script,
  schema: S
): LuaParamValues<S>
/**
 * Returns several Lua values at once (Lua multiple returns), for working with native Lua and for methods.
 *
 * 让函数一次返回多个 Lua 值（Lua 的多返回值），用于和原生 Lua 互相调用，以及 methods 里的公开方法。
 */
export declare const multi: LuaMulti
/**
 * Limits value to the range min to max.
 *
 * 将数值限制在 min 到 max 之间。
 */
export declare function clamp(this: void, value: number, min: number, max: number): number
/**
 * Interpolates by progress: from at t = 0, to at t = 1; t is not clamped.
 *
 * 按进度插值；t 为 0 时返回 from，为 1 时返回 to，不自动限制 t。
 */
export declare function lerp(this: void, from: number, to: number, t: number): number
/**
 * Moves value towards target by at most maxDelta without passing it; maxDelta should not be negative.
 *
 * 向目标移动最多 maxDelta，抵达后不越过目标；maxDelta 应非负。
 */
export declare function moveTowards(
  this: void,
  value: number,
  target: number,
  maxDelta: number
): number
/**
 * Checks the real control type; when it passes, the control's own properties are offered in completions.
 *
 * 检查真实控件类型，成功后可补全该控件的专属属性。
 */
export declare function isControl<K extends keyof ControlTypes>(
  this: void,
  control: unknown,
  kind: K
): control is ControlTypes[K]
/**
 * Finds a child control from root by path, separated by /, e.g. 'Header/Title'. Returns undefined when not
 * found; throws when a name on the path is duplicated or the type does not match.
 *
 * 从 root 开始按路径查找子控件，路径用 / 分隔，如 'Header/Title'。找不到返回 undefined；路径上有重名或类型不符时报错。
 */
export declare function findControl<K extends keyof ControlTypes>(
  this: void,
  root: ClientUIBaseControl,
  path: string,
  kind: K
): ControlTypes[K] | undefined
/**
 * Same as findControl, but the control must exist: throws with the full path when it is not found.
 *
 * 和 findControl 相同，但控件必须存在：找不到时直接报错，错误信息带完整路径。
 */
export declare function requireControl<K extends keyof ControlTypes>(
  this: void,
  root: ClientUIBaseControl,
  path: string,
  kind: K
): ControlTypes[K]
/**
 * Listens for one key event on a control. Write it at the callback root: it pauses while the script is
 * disabled, resumes when enabled and is released on destroy. Returns a cancel function that is safe to call
 * more than once.
 *
 * 监听控件上的一种按键事件。写在回调根部即可：脚本停用时暂停、重新启用后恢复、销毁时释放。返回取消函数，重复调用无害。
 */
export declare function listenKey(
  this: void,
  control: ClientUIBaseControl,
  event: HostEnums['KeyEventType'][keyof HostEnums['KeyEventType']],
  callback: (this: void) => boolean
): (this: void) => void
/**
 * Like the global setTimeout, but picks this timer's clock: 'real' ignores level pauses, 'level' pauses with
 * them. Cancel it with the global clearTimeout.
 *
 * 和全局 setTimeout 相同，但可以单独指定这个定时器的计时方式：'real' 不受关卡时停影响，'level' 随时停暂停。用全局 clearTimeout 取消。
 */
export declare function setTimeout<A extends unknown[]>(
  this: void,
  callback: (this: void, ...args: A) => void,
  delayMs: number,
  clock: 'real' | 'level',
  ...args: A
): LuaTimerHandle
/**
 * Like the global setInterval, but picks this timer's clock: 'real' ignores level pauses, 'level' pauses with
 * them. Cancel it with the global clearInterval.
 *
 * 和全局 setInterval 相同，但可以单独指定这个定时器的计时方式：'real' 不受关卡时停影响，'level' 随时停暂停。用全局 clearInterval 取消。
 */
export declare function setInterval<A extends unknown[]>(
  this: void,
  callback: (this: void, ...args: A) => void,
  delayMs: number,
  clock: 'real' | 'level',
  ...args: A
): LuaTimerHandle
/**
 * Tools on lua.helper: this module's exports of the same names, taken from the module itself so completions show each function's doc.
 *
 * lua.helper 上的工具，就是本模块的同名导出；取自模块本身，补全时能看到每个函数的说明。
 */
export type ClientHelpers = Pick<
  typeof import('./lua.js'),
  | 'setTimeout'
  | 'setInterval'
  | 'multi'
  | 'scriptHandle'
  | 'findScript'
  | 'readParams'
  | 'clamp'
  | 'lerp'
  | 'moveTowards'
  | 'isControl'
  | 'findControl'
  | 'requireControl'
  | 'listenKey'
>
