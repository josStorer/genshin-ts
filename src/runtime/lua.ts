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

/** 官方按名称调用这些函数；不需要全部填写。 */
export interface ClientScriptHooks {
  /** 根部执行之后初始化；首次顺序为 Init → Enable → Start，根部已可查找子控件。 */
  onInit?(this: void): void
  /** 每个挂载开始时执行一次；首次 Enable 已执行。 */
  onStart?(this: void): void
  /** 每次启用都执行，包括首次 Start 之前。 */
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
/**
 * 脚本回调参数 lua：这个脚本的运行环境，编译后就是 Lua 的 _ENV，lua.xxx 直接对应 Lua 全局 xxx。
 * 常用的是官方 API（script、game、Enum、Color）和 gsts 工具（helper、onSignal）；
 * 其余是 Lua 标准库（print、math、string 等），和原生 Lua 代码互相调用时才需要，平时用 TS 自带的写法即可。
 */
export interface ClientGlobals extends LuaStandardGlobals {
  /** 当前脚本挂载的客户端控件，等价于 lua.script.object；回调里也可以直接写 self。 */
  readonly self: ClientUIBaseControl
  /**
   * 当前脚本（官方 Script）：EnableUpdate 开关逐帧更新，GetParam 读取脚本变量，
   * object 是挂载的控件；Invoke 和信号、变量监听等官方接口也在这里。
   */
  readonly script: Script
  /**
   * 官方全局对象 game：查找、创建、销毁客户端控件，Tween 补间动画，ServerSignal 构造服务器信号，
   * 读取关卡变量、语言、画布大小、光标位置等。
   */
  readonly game: HostGame
  /** 官方枚举，例如 lua.Enum.KeyEventType.KeyboardJumpKeyDown、lua.Enum.EaseType.OutQuad。 */
  readonly Enum: HostEnums
  /** 创建颜色：lua.Color(r, g, b, a?)，各分量 0–255，a 省略时不透明；也有 FromRGB、ToRGBA 等。 */
  readonly Color: HostColor
  /** gsts 常用工具：查找控件、按键监听、定时器、读脚本变量、数值插值等，和 genshin-ts/runtime/lua 的同名导出相同。 */
  readonly helper: ClientHelpers
  /** 接收服务器发来的信号，回调里用 evt.params.参数名 读取参数。写在回调根部即可：脚本停用时暂停、重新启用后恢复、销毁时释放。返回取消函数，重复调用无害。 */
  readonly onSignal: LuaOnSignal
}
export interface ClientControlScriptOptions {
  /** 本脚本的 setTimeout / setInterval 用哪种时间计时。'level'（默认）：关卡时停时一起暂停；'real'：不受时停影响。个别定时器要用另一种，用 lua.helper.setTimeout / setInterval 单独指定。 */
  timerClock?: 'level' | 'real'
}
declare const scriptDefinition: unique symbol
export type ClientMethods = Record<string, (this: void, ...args: never[]) => unknown>
/** 仅用于类型推断；入口在编译时展开，不会创建这个对象。 */
export interface ClientScriptDefinition<M extends ClientMethods = ClientMethods> {
  readonly [scriptDefinition]: M
}
export type ClientScriptSetup<M extends ClientMethods = ClientMethods> = (
  this: void,
  lua: ClientGlobals
) => ClientScriptHooks & {
  /**
   * 公开给其他脚本的方法，按挂载实例执行，操作那个实例自己的状态。
   * 对方先用 control.GetScriptByPath('lua/board') 取得某一个挂载 s，
   * 再用 scriptHandle<typeof Board>(s).Invoke('push', ...) 调用。
   * 想获得方法名和参数提示，入口需写 export default g.clientControlScript(...)，
   * 对方用 import type Board from './board' 引用类型。
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
export type TypedScript<D extends ClientScriptDefinition> =
  D extends ClientScriptDefinition<infer M>
    ? Omit<Script, 'Invoke'> & {
        Invoke<K extends keyof M & string>(
          this: Script,
          name: K,
          ...args: Parameters<M[K]>
        ): MethodReturns<ReturnType<M[K]>>
      }
    : never
/** 为已取得的脚本句柄补充公开方法提示；由你确认这个句柄挂载的确实是 D 对应的入口。 */
export declare function scriptHandle<D extends ClientScriptDefinition>(
  this: void,
  script: Script
): TypedScript<D>
/** 读取编辑器脚本变量并检查类型。编辑器里没有这个变量时用 default；变量建了但留空，字符串会读到空串，不会用 default。控件请用 findControl/requireControl 按名称路径查找。 */
export declare function readParams<const S extends Record<string, LuaParam>>(
  this: void,
  script: Script,
  schema: S
): LuaParamValues<S>
/** 让函数一次返回多个 Lua 值（Lua 的多返回值），用于和原生 Lua 互相调用，以及 methods 里的公开方法。 */
export declare const multi: LuaMulti
/** 将数值限制在 min 到 max 之间。 */
export declare function clamp(this: void, value: number, min: number, max: number): number
/** 按进度插值；t 为 0 时返回 from，为 1 时返回 to，不自动限制 t。 */
export declare function lerp(this: void, from: number, to: number, t: number): number
/** 向目标移动最多 maxDelta，抵达后不越过目标；maxDelta 应非负。 */
export declare function moveTowards(
  this: void,
  value: number,
  target: number,
  maxDelta: number
): number
/** 检查真实控件类型，成功后可补全该控件的专属属性。 */
export declare function isControl<K extends keyof ControlTypes>(
  this: void,
  control: unknown,
  kind: K
): control is ControlTypes[K]
/** 从 root 开始按路径查找子控件，路径用 / 分隔，如 'Header/Title'。找不到返回 undefined；路径上有重名或类型不符时报错。 */
export declare function findControl<K extends keyof ControlTypes>(
  this: void,
  root: ClientUIBaseControl,
  path: string,
  kind: K
): ControlTypes[K] | undefined
/** 和 findControl 相同，但控件必须存在：找不到时直接报错，错误信息带完整路径。 */
export declare function requireControl<K extends keyof ControlTypes>(
  this: void,
  root: ClientUIBaseControl,
  path: string,
  kind: K
): ControlTypes[K]
/** 监听控件上的一种按键事件。写在回调根部即可：脚本停用时暂停、重新启用后恢复、销毁时释放。返回取消函数，重复调用无害。 */
export declare function listenKey(
  this: void,
  control: ClientUIBaseControl,
  event: HostEnums['KeyEventType'][keyof HostEnums['KeyEventType']],
  callback: (this: void) => boolean
): (this: void) => void
/** 和全局 setTimeout 相同，但可以单独指定这个定时器的计时方式：'real' 不受关卡时停影响，'level' 随时停暂停。用全局 clearTimeout 取消。 */
export declare function setTimeout<A extends unknown[]>(
  this: void,
  callback: (this: void, ...args: A) => void,
  delayMs: number,
  clock: 'real' | 'level',
  ...args: A
): LuaTimerHandle
/** 和全局 setInterval 相同，但可以单独指定这个定时器的计时方式：'real' 不受关卡时停影响，'level' 随时停暂停。用全局 clearInterval 取消。 */
export declare function setInterval<A extends unknown[]>(
  this: void,
  callback: (this: void, ...args: A) => void,
  delayMs: number,
  clock: 'real' | 'level',
  ...args: A
): LuaTimerHandle
/** lua.helper 上的工具，就是本模块的同名导出；取自模块本身，补全时能看到每个函数的说明。 */
export type ClientHelpers = Pick<
  typeof import('./lua.js'),
  | 'setTimeout'
  | 'setInterval'
  | 'multi'
  | 'scriptHandle'
  | 'readParams'
  | 'clamp'
  | 'lerp'
  | 'moveTowards'
  | 'isControl'
  | 'findControl'
  | 'requireControl'
  | 'listenKey'
>
