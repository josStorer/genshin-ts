import { clientControlScript } from './lua_entry.js'

// Lua 类型工程中的轻量入口；作者仍从 runtime/core 导入 g。
export { defineSignal } from './lua_signals.js'

export const g = {
  /**
   * 定义一个客户端控件脚本：编译成 Lua，在编辑器里挂到客户端控件上，控件激活且可见时运行。
   * 回调里的 `lua` 是脚本的运行环境（官方 API、gsts 工具和 Lua 标准库）；回调里的变量属于当前挂载实例，
   * 同一个脚本挂在多个控件上时各自独立。返回的对象写生命周期（onStart、onUpdate 等）和公开给其他脚本的 methods。
   * 官方说明：[客户端控件和客户端脚本](https://act.mihoyo.com/ys/ugc/tutorial/detail/mhbgxf0nynww)
   */
  clientControlScript
}
