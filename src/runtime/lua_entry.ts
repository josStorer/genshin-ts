import type {
  ClientControlScriptOptions,
  ClientMethods,
  ClientScriptDefinition,
  ClientScriptSetup
} from './lua.js'

/**
 * 定义一个客户端控件脚本：编译成 Lua，在编辑器里挂到客户端控件上，控件激活且可见时运行。
 * 回调里的 `lua` 是脚本的运行环境（官方 API、gsts 工具和 Lua 标准库）；回调里的变量属于当前挂载实例，
 * 同一个脚本挂在多个控件上时各自独立。返回的对象写生命周期（onStart、onUpdate 等）和公开给其他脚本的 methods。
 * 官方说明：[客户端控件和客户端脚本](https://act.mihoyo.com/ys/ugc/tutorial/detail/mhbgxf0nynww)
 */
export function clientControlScript<M extends ClientMethods>(
  setup: ClientScriptSetup<M>
): ClientScriptDefinition<M>
/**
 * 定义一个客户端控件脚本：编译成 Lua，在编辑器里挂到客户端控件上，控件激活且可见时运行。
 * 回调里的 `lua` 是脚本的运行环境（官方 API、gsts 工具和 Lua 标准库）；回调里的变量属于当前挂载实例，
 * 同一个脚本挂在多个控件上时各自独立。返回的对象写生命周期（onStart、onUpdate 等）和公开给其他脚本的 methods。
 * 官方说明：[客户端控件和客户端脚本](https://act.mihoyo.com/ys/ugc/tutorial/detail/mhbgxf0nynww)
 */
export function clientControlScript<M extends ClientMethods>(
  options: ClientControlScriptOptions,
  setup: ClientScriptSetup<M>
): ClientScriptDefinition<M>
export function clientControlScript(
  ..._args: [ClientScriptSetup] | [ClientControlScriptOptions, ClientScriptSetup]
): ClientScriptDefinition {
  throw new Error('clientControlScript 需要使用 GSTS 编译为 Lua，不能作为 JavaScript 执行。')
}
