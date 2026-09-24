// Lua 类型工程中的轻量入口；作者仍从 runtime/core 导入 g。
export { defineSignal } from './lua-signals.js'
import { clientControlScript } from './lua.js'
export const g = { clientControlScript }
