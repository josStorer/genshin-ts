// An ordinary TS module: compiled to its own Lua file and loaded with require by the entries that import it.
// 普通 TS 模块：单独编译成一个 Lua 文件，被导入它的入口用 require 加载。
export function formatClicks(clicks: number) {
  return `clicks: ${clicks}`
}
