# Repository Guidelines

This template bootstraps a Genshin-TS project. Maintain it with user workflow and compile outputs in mind.

## Read First
- `README.md`: full usage flow, constraints, and global function cheat sheet.
- `README_ZH.md`: Chinese template guide and terminology reference when working in Chinese.
- `docs/EDITOR_BOUNDARIES.md`: English decision rules for code-vs-editor responsibilities.
- `docs/EDITOR_BOUNDARIES_ZH.md`: Chinese boundary rules and preferred editor terminology.

## Layout
<!-- snippet:AGENTS_LAYOUT -->
- `src/graphs/main.ts`: server node graph; receives the `JumpPressed` signal sent from Lua
- `src/lua/hud.ts`: client control script (Lua entry) for the HUD container
- `src/lua/lib/`: ordinary TS modules used by Lua entries
- `src/lua/tsconfig.json`: Lua type environment (the root `tsconfig.json` excludes `src/lua`)
- `src/resources/signals.ts`: signal definitions shared by node graphs and Lua; regenerated from the map's signal manager when `inject` runs
<!-- /snippet -->
- `gsts.config.ts`: compile config (entries/outDir/inject)
- `dist/`: build outputs (generated)
- `README.md`: user guide
- `CLAUDE.md`: AI rules

## Typical Workflow
<!-- snippet:WORKFLOW -->
1. Update the NodeGraph ID in `src/graphs/main.ts`
2. Add `inject` in `gsts.config.ts` when needed
3. Run `npm run dev` for incremental compile
<!-- /snippet -->

## Hard Rules
- Prefer implementing gameplay logic in code, but do not assume editor-authored resources already exist.
- Separate every substantial feature into `code changes` and `editor setup required`.
- Call out blockers clearly when a requested feature needs editor work first.
- When responding in Chinese, prefer the wording and domain terms from `README_ZH.md` and `docs/EDITOR_BOUNDARIES_ZH.md`.
- Update `entries` when adding new entry files.
- Entry events use `g.server({ id }).on(...)`; same ID entries merge automatically.
- `gstsServer*` must be top-level and only allow a single trailing `return`.
- Avoid Promise/async/recursion/JSON/Object in graph scope.
- Conditions must be `boolean`; use `bool(...)` when needed.
- Use `bigint` for integer ops; avoid modulo/bitwise on `number`.
- `while(true)` is capped; use timers or explicit counters.
- Empty arrays must have inferable element types.
- Logging: use `print(str(...))` or `console.log(x)` (single argument).
- Use type helpers when needed: `int/float/str/bool/vec3/configId/prefabId/entity`.

## Node Graph Variables
- Declare with `g.server({ variables: { ... } })`.
- Read/write via `f.get` / `f.set`, keep types aligned.

## Debugging Outputs
- `.gs.ts`: verify compiled node calls
- `.json`: verify connections and types
- `.gia`: final injectable output

## Common Scripts
- `npm run dev`
- `npm run build`
- `npm run maps`
- `npm run backup`

## Reference Definitions
- Search function/event comments in `node_modules/genshin-ts/dist/src/definitions/`.

<!-- snippet:LUA_AGENTS -->
## Client Lua
- Lua code lives in `src/lua` with its own tsconfig; the root tsconfig excludes it and the default `full.mjs` ESLint selects the Lua rules there automatically. Never mix Lua code into node graph files.
- Keep `g` imported from `genshin-ts/runtime/core`. Entry code goes inside `g.clientControlScript(lua => { ...; return { onStart() {}, methods: {} } })`; listeners (`lua.onSignal`, `lua.onVariable`, `lua.onKey`, `lua.onCursor`) are written at the callback root.
- `self` is the mounted control in Lua (an entity in node graphs). Keep `self`, `send`, `console` and the timer functions as globals. Host APIs are under `lua.script`, `lua.game`, `lua.Enum`, `lua.Color`, `lua.helper`; find controls with `lua.helper.findControl` / `requireControl` and other mounts with `lua.helper.findScript<typeof Entry>(...)`.
- Signals come from `src/resources/signals.ts`, regenerated from the map's signal manager on injection; add new signals in the editor rather than only in that file. Send with `send(Signal.X, ...)`, receive in node graphs with `g.server(...).onSignal(Signal.X, ...)`. Signals sent by node graphs with `send` / `f.sendSignal` do not reach Lua; send to Lua scripts with `sendLua(player, Signal.X, ...)` or `sendLuaAll(Signal.X, ...)`.
- Modules imported by both node graphs and Lua hold neutral types, constants and pure functions only; write shared integer constants as numbers and use `int()` at the node graph call site.
- For native `.lua` modules, keep a matching `.d.ts`; use `this: void` for plain functions and `LuaMultiReturn` for multiple results.
- No browser/Node APIs, promises or bigint in Lua. Use explicit boolean conditions and `undefined`; prefer dense arrays. Follow the editor and build diagnostics instead of suppressing them.
- Editor setup the code depends on (the control, the signal, mounting `lua/hud`) is listed under "Before the first run" in `README.md`. Injection copies Lua files into `external_lua_file` but never mounts them.
- Check with `npm run typecheck` (includes `gsts lua check`) and `npm run lint`. Full guide: https://gsts.moe/doc/lua (Chinese: https://gsts.moe/zh/doc/lua).
<!-- /snippet -->
