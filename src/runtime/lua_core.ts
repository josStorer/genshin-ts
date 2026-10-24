import { clientControlScript } from './lua_entry.js'

// Lua 类型工程中的轻量入口；作者仍从 runtime/core 导入 g。
export { defineSignal } from './lua_signals.js'

export const g = {
  /**
   * Defines a client control script: compiled to Lua and attached to a client control in the editor; it runs while
   * the control is active and visible. `lua` in the callback is the script environment (official API, gsts tools and
   * the Lua standard library). Variables in the callback belong to the current mount, so each control running the
   * same script has its own. The returned object holds lifecycle functions (onStart, onUpdate and so on) and the
   * methods other scripts can call.
   *
   * 定义一个客户端控件脚本：编译成 Lua，在编辑器里挂到客户端控件上，控件激活且可见时运行。
   * 回调里的 `lua` 是脚本的运行环境（官方 API、gsts 工具和 Lua 标准库）；回调里的变量属于当前挂载实例，
   * 同一个脚本挂在多个控件上时各自独立。返回的对象写生命周期（onStart、onUpdate 等）和公开给其他脚本的 methods。
   * 官方说明：[客户端控件和客户端脚本](https://act.mihoyo.com/ys/ugc/tutorial/detail/mhbgxf0nynww)
   */
  clientControlScript
}
