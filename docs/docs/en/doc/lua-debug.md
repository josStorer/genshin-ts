# Lua debugging

When a script fails in game, the log reports a line in the compiled Lua file. Builds also produce source maps (`.lua.map`), and `gsts lua locate` uses them to translate Lua lines back to your TS source. Source maps are on by default, stay in the local output directory, and are never copied into the game directory.

## From a game error to your source

1. Build as usual. Each `.lua` in the output directory gets a matching `.lua.map`.
2. In the editor log, enable "Client Script" and run the map. When an error appears, double-click the entry to see the full location.
3. Pass the Lua file and line to `gsts lua locate`. For many errors, save the log as a text file and parse it in one go.
4. Fix the reported TS file, line and column, rebuild, and run the map again in the editor.

```sh
gsts --noinject --lang en                           # build
gsts lua locate dist/lua/lua/hud.lua:42             # translate one location
gsts lua locate --log game-error.txt                # parse a whole log
```

This assumes compileRoot is `src` and the entry is `src/lua/hud.ts`. A path that exists locally is used as is; a log location such as `lua/hud.lua:42` is looked up under the `lua` subdirectory of the output directory. The output directory defaults to `outDir` in `gsts.config.ts` in the current directory; pass `--outDir` when running elsewhere.

`locate` recognizes the two forms below. The exact format of real game logs is still being confirmed; if it does not recognize a location in your log, pass the "file:line" to it by hand.

```text
lua/hud.lua:42: error message
[string "lua/hud.lua"]:42: error message
```

### Special cases

- **Hand-edited Lua**: a source map only matches the Lua it was built with, so it is rejected after manual edits. Rebuild.
- **Framework-generated code**: some lines, such as lifecycle wrappers, have no TS location; the command says so.
- **Entry-file top-level code**: it is compiled into a shared module under `__gsts_shared`, so use that file's path:

```sh
gsts lua locate dist/lua/__gsts_shared/lua/hud.lua:20
```

You can turn source maps off; this does not change the generated Lua:

```ts
// gsts.config.ts
lua: {
  sourceMap: false
}
```

## Why translation is not automatic

Translating errors to TS lines automatically at runtime would need `debug.getinfo` to read the call stack, which the Genshin script environment does not provide, so the workflow is "record the Lua location in game, translate it locally".

```ts
try {
  throw new Error('HUD failed')
} catch (error) {
  console.error(error) // the log line includes the Lua location for locate
}
```

What each `console` method writes:

| Call                           | Result                                                              |
| ------------------------------ | ------------------------------------------------------------------- |
| `console.log` / `console.info` | Normal log line                                                     |
| `console.warn`                 | Normal log line with a `[warn]` prefix                              |
| `console.error`                | Error-level log line (official `printerr`)                          |
| `console.assert`               | Logs an error when the condition fails; does **not** stop execution |
| `console.trace`                | Prints the call stack                                               |

Use `throw` or `lua.error` to stop execution.

## When level loading hangs

Official guidance: if a script problem such as an infinite loop makes level loading slow or hang, the normal log may not get a chance to report it. Check `ErrorLog.txt` in the client script directory (it is only created in this situation).

```sh
gsts lua locate --log path/to/client-scripts/ErrorLog.txt
```

## Telling whether two objects are the same

In game, `tostring(table)` prints only `<table>` without an address, so printed output cannot tell you whether two variables hold the same table. Compare them with `===`, or give the objects you want to track your own ID.

```ts
const left = { count: 0 }
const same = left
const other = { count: 0 }
console.log(left === same, left === other) // true, false
```

Lifecycle order, teleport behavior and other facts confirmed in game are documented in [Client Lua](./lua.md).
