# Lua debugging

Builds generate source maps by default. Use offline lookup to translate Lua error locations back to TS; maps stay local and are not injected into the game.

## From a game error to source code

1. Build normally and retain matching .lua and .lua.map files in the output directory.
2. Enable “Client Script” in the editor log filter, then double-click an entry for its full location.
3. Pass the Lua file and line to locate, or save a log for batch parsing.
4. Edit the reported TS file/line/column, rebuild and rerun the game in the editor.

```sh
gsts --noinject --lang en
gsts lua locate dist/lua/lua/hud.lua:42
gsts lua locate --log game-error.txt --outDir dist
```

This assumes compileRoot=src and src/lua/hud.ts. Direct locations use local file paths. For a log location such as lua/hud.lua:42, --outDir dist resolves under dist/lua. The parser also accepts [string "lua/hud.lua"]:42.

**The complete real game log format has not yet been confirmed; screenshots are pending.** These illustrate supported parser input, not captured game logs:

```text
lua/hud.lua:42: example failure
[string "lua/hud.lua"]:42: example failure
```

Maps validate the compiled Lua content. Manual Lua edits make an old map stale and require rebuilding. Generated framework statements may have no TS location; the command reports that. For shared top-level code, use the actual \_\_gsts_shared file:

```sh
gsts lua locate dist/lua/__gsts_shared/lua/hud.lua:20
```

Disable maps if needed; this does not change Lua code:

```ts
// gsts.config.ts
lua: {
  sourceMap: false
}
```

## Why stack translation is offline

The host sandbox lacks debug.getinfo, so the call stack cannot be read and translated automatically at runtime. The workflow is “record Lua location → local locate”; it does not collect game logs automatically.

```ts
try {
  throw new Error('HUD failed')
} catch (error) {
  console.error(error) // Save the Lua location for locate.
}
```

console.log/info log normally, warn adds a prefix, and error uses printerr. assert only logs failure; throw/lua.error interrupts execution. console.trace can show the call chain; the completeness of host log output must be checked in actual logs.

## Stuck level loading and object identity

Official guidance for problems such as stuck level loading is to check ErrorLog.txt in the client script directory. Preserve the full log before locating errors.

```sh
gsts lua locate --log path/to/client-scripts/ErrorLog.txt --outDir dist
```

In the game, tostring(table) prints only `<table>`, so printed addresses cannot identify shared objects. Compare references directly, or assign your own debug IDs.

```ts
const left = { count: 0 }
const same = left
const other = { count: 0 }
console.log(left === same, left === other) // true, false
```

The commands and mappings have automated tests. Game screenshots, complete log format and this revision's generated-script acceptance are still pending. Confirmed host lifecycle facts are documented in [Client Lua](./lua.md).
