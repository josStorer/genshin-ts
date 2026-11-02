## 客户端 Lua

这个项目只有节点图。之后要加入客户端控件脚本（Lua），按文档[在已有项目中加入 Lua](https://gsts.moe/zh/doc/lua#add-lua)操作：新建 `src/lua/tsconfig.json`，在根目录的 `tsconfig.json` 里排除 `src/lua`，再写第一个 `g.clientControlScript` 入口。用"节点图 + Lua"模板新建的项目可以作为完整结构的参照。
