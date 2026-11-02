-- A native Lua module, copied to the output as is. banner.d.ts next to it gives TS its types.
-- 原生 Lua 模块，原样复制到输出目录；旁边的 banner.d.ts 为 TS 提供类型。
local M = {}

function M.banner(text)
  return '[ ' .. text .. ' ]'
end

return M
