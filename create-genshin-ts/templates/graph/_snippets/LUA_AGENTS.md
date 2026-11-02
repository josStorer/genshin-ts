## Client Lua
- This project has no Lua yet. When the user asks for client control scripts, first add `src/lua` with its own tsconfig as described in https://gsts.moe/doc/lua#add-lua (Chinese: https://gsts.moe/zh/doc/lua#add-lua), then write `g.clientControlScript` entries there.
- Never put Lua code in node graph files: node graphs and Lua use separate type environments.
