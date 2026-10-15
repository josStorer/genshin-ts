import type {
  ClientUIBaseControl,
  ControlTypes,
  HostColor,
  HostEnums,
  HostGame,
  Script
} from './lua_host.js'
import type { readParams } from './lua_params.js'
import type { LuaMulti, LuaMultiReturn } from './lua_primitives.js'
import type { LuaOnSignal } from './lua_signals.js'
import type { LuaStandardGlobals } from './lua_standard.js'

export type * from './lua_standard.js'

export { readParams } from './lua_params.js'

export type * from './lua_host.js'
export type { LuaMultiReturn } from './lua_primitives.js'

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
export interface ClientGlobals extends LuaStandardGlobals {
  /** 当前挂载控件；等价于 script.object。 */
  readonly self: ClientUIBaseControl
  readonly script: Script
  readonly game: HostGame
  readonly Enum: HostEnums
  readonly Color: HostColor
  /** 常用工具，与 genshin-ts/runtime/lua 的导出相同。 */
  readonly helper: ClientHelpers
  /** 按信号契约接收具名参数；监听由当前脚本实例管理，取消函数可重复调用。 */
  readonly onSignal: LuaOnSignal
}
export interface ClientControlScriptOptions {
  /** level（默认）随关卡时间，real 使用 OnUpdate；当前脚本关闭用户更新不会暂停框架定时器。 */
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
) => ClientScriptHooks & { methods?: M }
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
/** 显式返回多个 Lua 值；常用于原生互操作和公开方法。 */
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
/** 从指定父控件逐级查找；不存在时返回 undefined，重名或类型不符时报错。 */
export declare function findControl<K extends keyof ControlTypes>(
  this: void,
  root: ClientUIBaseControl,
  path: string,
  kind: K
): ControlTypes[K] | undefined
/** 查找必须存在的控件；找不到时报告完整路径。 */
export declare function requireControl<K extends keyof ControlTypes>(
  this: void,
  root: ClientUIBaseControl,
  path: string,
  kind: K
): ControlTypes[K]
/** 注册一次按键监听，返回可重复调用的取消函数。 */
export declare function listenKey(
  this: void,
  control: ClientUIBaseControl,
  event: HostEnums['KeyEventType'][keyof HostEnums['KeyEventType']],
  callback: (this: void) => boolean
): (this: void) => void
export interface ClientHelpers {
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
