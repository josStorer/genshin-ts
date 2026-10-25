## Optional client Lua / 可选客户端 Lua

- Keep `g` imported from `genshin-ts/runtime/core`. Put executable entry code inside `g.clientControlScript(lua => { ...; return { onStart() {}, methods: {} } })`.
- `src/lua/tsconfig.json` enables Lua types. The root tsconfig excludes this directory. Default `full.mjs` ESLint selects Lua rules automatically.
- `self` means the mounted host: a control in Lua, an entity in nodegraphs. Keep `self`, `send`, `console` and timers as globals. Host APIs are under `lua.script`, `lua.game`, `lua.Enum`, `lua.Color`, `lua.helper`.
- Callbacks and class `this` are compiled with the correct receiver convention. For native `.lua` imports, provide a matching `.d.ts`; use `this: void` for plain functions and `LuaMultiReturn` for multiple results.
- Entry locals belong to one mount; ordinary imported modules share state through `require`. Shared graph/Lua modules should contain neutral types, constants, pure functions and `defineSignal`. Write shared integer constants as numbers; use `int()` at the nodegraph call site.
- Send with `send(Signal.X, ...)`, receive with `lua.onSignal(Signal.X, evt => evt.params.x)`. Listeners pause on Disable and release on Destroy. Timers use milliseconds and default to level time; Disable/Destroy clears them.
- No browser/Node APIs, promises or bigint in Lua. Use explicit boolean conditions and `undefined`; prefer dense arrays. Follow editor and build diagnostics rather than suppressing unsupported operations.

Run `npm run typecheck` (it also runs `gsts lua check`: full types and every Lua rule, including native `.d.ts`), `npm run lint`, then `npm run build` or `npm run dev`.

Build output: `dist/lua/src/lua/hud.lua`. In the editor, add the output folder and mount **`src/lua/hud`** on a client control container. With map injection configured, files are copied into `external_lua_file`; **mounting remains manual**. Edit TS, wait for dev output, then run the game again in the editor.

中文操作：`npm run typecheck` 同时检查节点图和 Lua（Lua 部分由 `gsts lua check` 完成，含原生 `.d.ts` 检查）。编辑器批量导入生成的 Lua 文件夹，给客户端容器挂载 `src/lua/hud`。配置地图后“注入”只复制文件，不自动挂载。源码保存编译后，在编辑器重新运行游戏即可。Lua 的 `self` 是当前控件，不是节点图实体。

Reference / 完整说明：[English](https://gsts.moe/en/doc/lua) · [中文](https://gsts.moe/zh/doc/lua)
