import type {
  ClientUIBaseControl,
  ControlTypes,
  HostColor,
  HostEnums,
  HostGame,
  Script
} from './lua_host.js'
import type { readParams } from './lua_params.js'
import type { LuaMulti, LuaMultiReturn, LuaTimerHandle } from './lua_primitives.js'
import type { LuaOnSignal } from './lua_signals.js'
import type { LuaStandardGlobals } from './lua_standard.js'

export type * from './lua_standard.js'

export { readParams } from './lua_params.js'

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
export interface ClientGlobals extends LuaStandardGlobals {
  /** 当前挂载控件；等价于 script.object。 */
  readonly self: ClientUIBaseControl
  readonly script: Script
  readonly game: HostGame
  readonly Enum: HostEnums
  readonly Color: HostColor
  /** 常用工具，与 genshin-ts/runtime/lua 的导出相同。 */
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
export interface ClientHelpers {
  setTimeout: typeof setTimeout
  setInterval: typeof setInterval
  multi: LuaMulti
  scriptHandle: typeof scriptHandle
  readParams: typeof readParams
  clamp: typeof clamp
  lerp: typeof lerp
  moveTowards: typeof moveTowards
  isControl: typeof isControl
  findControl: typeof findControl
  requireControl: typeof requireControl
  listenKey: typeof listenKey
}
