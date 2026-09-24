import type { ClientUIBaseControl } from './lua-host.js'
import type { LuaSignalDefinition, LuaSignalParams, LuaSignalValues } from './lua-signals.js'

declare global {
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
