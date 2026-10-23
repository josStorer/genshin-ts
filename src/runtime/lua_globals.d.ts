import type { ClientUIBaseControl } from './lua_host.js'
import type { LuaSignalDefinition, LuaSignalParams, LuaSignalValues } from './lua_signals.js'

/** 属于当前挂载实例的定时器句柄；不能当作数字或跨实例取消。 */
export interface LuaTimerHandle {
  readonly __gstsTimer: unique symbol
}

declare global {
  /** 延迟单位为毫秒；默认按关卡时间推进。停用时暂停，启用后继续，销毁时清空；零延迟在下次更新执行。 */
  function setTimeout<A extends unknown[]>(
    this: void,
    callback: (this: void, ...args: A) => void,
    delay?: number,
    ...args: A
  ): LuaTimerHandle
  /** 卡顿后每次更新最多执行一次；停用时暂停、启用后继续；在 onEnable 中重复创建会累积任务，请保存并取消句柄。 */
  function setInterval<A extends unknown[]>(
    this: void,
    callback: (this: void, ...args: A) => void,
    delay?: number,
    ...args: A
  ): LuaTimerHandle
  /** 取消未开始的执行；可重复调用，不会打断正在运行的回调。 */
  function clearTimeout(this: void, handle: LuaTimerHandle | undefined): void
  /** 与 clearTimeout 相同，只接受当前实例的句柄。 */
  function clearInterval(this: void, handle: LuaTimerHandle | undefined): void
  /** 当前脚本挂载的客户端控件，等价于 lua.script.object。 */
  const self: ClientUIBaseControl
  /** 按提取的信号契约向服务器发送参数。 */
  function send<N extends string, P extends LuaSignalParams>(
    this: void,
    signal: LuaSignalDefinition<N, P>,
    ...values: LuaSignalValues<P>
  ): void
  const console: {
    log(this: void, ...values: unknown[]): void
    info(this: void, ...values: unknown[]): void
    warn(this: void, ...values: unknown[]): void
    error(this: void, ...values: unknown[]): void
    assert(this: void, condition: boolean, ...values: unknown[]): void
    trace(this: void, ...values: unknown[]): void
  }
}
export {}
