import type {
  ClientControlScriptOptions,
  ClientMethods,
  ClientScriptDefinition,
  ClientScriptSetup
} from './lua.js'

/** 声明一个客户端控件脚本，回调中的变量属于当前挂载实例。methods 中的函数可由官方 Invoke 调用。 */
export function clientControlScript<M extends ClientMethods>(
  setup: ClientScriptSetup<M>
): ClientScriptDefinition<M>
export function clientControlScript<M extends ClientMethods>(
  options: ClientControlScriptOptions,
  setup: ClientScriptSetup<M>
): ClientScriptDefinition<M>
export function clientControlScript(
  ..._args: [ClientScriptSetup] | [ClientControlScriptOptions, ClientScriptSetup]
): ClientScriptDefinition {
  throw new Error('clientControlScript 需要使用 GSTS 编译为 Lua，不能作为 JavaScript 执行。')
}
