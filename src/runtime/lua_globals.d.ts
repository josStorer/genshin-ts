import type { ClientUIBaseControl } from './lua_host.js'
import type { LuaTimerHandle } from './lua_primitives.js'
import type { LuaSignalDefinition, LuaSignalParams, LuaSignalValues } from './lua_signals.js'

export type { LuaTimerHandle } from './lua_primitives.js'

declare global {
  /** delay 毫秒后执行一次 callback（delay 为 0 时在下一帧执行）。默认按关卡时间计时，时停时暂停；脚本停用时暂停、重新启用后接着计时，销毁时取消。返回的句柄用 clearTimeout 取消。 */
  function setTimeout<A extends unknown[]>(
    this: void,
    callback: (this: void, ...args: A) => void,
    delay?: number,
    ...args: A
  ): LuaTimerHandle
  /** 每隔 delay 毫秒执行一次 callback，计时规则同 setTimeout。卡顿时不会连续补执行，每帧最多一次。写在 onEnable 里会每次启用多一个，记得在 onDisable 里 clearInterval。 */
  function setInterval<A extends unknown[]>(
    this: void,
    callback: (this: void, ...args: A) => void,
    delay?: number,
    ...args: A
  ): LuaTimerHandle
  /** 取消 setTimeout 创建的定时器。句柄已取消或为 undefined 时什么也不做；不会打断正在执行的回调。 */
  function clearTimeout(this: void, handle: LuaTimerHandle | undefined): void
  /** 取消 setInterval 创建的定时器，规则同 clearTimeout。其他挂载创建的句柄会被忽略。 */
  function clearInterval(this: void, handle: LuaTimerHandle | undefined): void
  /** 当前脚本挂载的客户端控件，等价于 lua.script.object。 */
  const self: ClientUIBaseControl
  /** 向服务器发送信号，参数按信号定义的顺序填写。编辑器检查参数个数和类型；运行时还会检查 int 是否为整数、列表是否连续，不合格时报错并指出是哪个参数。 */
  function send<N extends string, P extends LuaSignalParams>(
    this: void,
    signal: LuaSignalDefinition<N, P>,
    ...values: LuaSignalValues<P>
  ): void
  /** 写日志：在编辑器日志里勾选"客户端脚本"后可见。多个值之间用制表符分隔；普通表显示为 `<table>`。 */
  const console: {
    /** 普通日志（官方 print）。 */
    log(this: void, ...values: unknown[]): void
    /** 同 console.log。 */
    info(this: void, ...values: unknown[]): void
    /** 普通日志，开头带 `[warn]`。 */
    warn(this: void, ...values: unknown[]): void
    /** 错误级别日志（官方 printerr），不会中断执行；要中断请用 throw。 */
    error(this: void, ...values: unknown[]): void
    /** condition 为 false 时写一条错误日志，不会中断执行。 */
    assert(this: void, condition: boolean, ...values: unknown[]): void
    /** 写日志并附上当前调用栈。 */
    trace(this: void, ...values: unknown[]): void
  }
}
export {}
