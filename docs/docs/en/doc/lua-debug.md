# Lua debugging

When a script fails in game, the log reports a line in the compiled Lua file. Builds also produce source maps (`.lua.map`), and `gsts lua locate` uses them to translate Lua lines back to your TS source. Source maps are on by default, stay in the local output directory, and are never copied into the game directory.

## From a game error to your source

1. Build as usual. Each `.lua` in the output directory gets a matching `.lua.map`.
2. In the editor log, enable "Client Script" and run the map. When an error appears, copy that log entry.
3. Run `gsts lua locate` in the project directory (where `gsts.config.ts` is). With no arguments it reads the clipboard; you can also pass the error text or a log file path.
4. Fix the reported TS file, line and column, rebuild, and run the map again in the editor.

```sh
gsts lua locate                          # read the error from the clipboard
gsts lua locate game-error.txt           # parse a whole log file
gsts lua locate dist/lua/lua/hud.lua:42  # translate one local location
```

Game logs name modules without the `.lua` extension (confirmed in game, 2026-10-24). For example:

```text
lua/hud:299: attempt to index a nil value (local 'item')
stack traceback:
	__gsts_helpers:120: in function 'findControl'
	lua/hud:299: in function 'OnStart'
```

`locate` translates `lua/hud:299` to a TS location. Runtime locations such as `lualib_bundle` and `__gsts_helpers` have no TS source, so it only reports how many were skipped. An error repeated many times in a log is reported once. Forms such as `lua/hud.lua:42` and `[string "lua/hud.lua"]:42` are recognized too.

Log locations are looked up under the `lua` subdirectory of the output directory. The output directory defaults to `outDir` in `gsts.config.ts` in the current directory; pass `--outDir` when running elsewhere. The examples assume compileRoot is `src` and the entry is `src/lua/hud.ts`.

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

### catch always receives a string

The host converts every thrown value to text (confirmed in game, 2026-10-24): `throw new Error('x')` arrives in catch as a string such as `"Error: x
stack traceback: ..."`, and `throw { code: 7 }` arrives as `"<table>"`. So `e instanceof Error` is always false, and `e.message`, custom error classes and object fields cannot be read.

```ts
try {
  risky()
} catch (e) {
  console.error(String(e)) // use this when you need the error text
}
```

Put any extra details in the Error message. Using `instanceof` or `as` other types on a catch variable, reading its fields, and throwing objects or numbers that are not Errors all raise the `gsts/lua-thrown-value` warning (consistently in the editor, ESLint and builds).

## When level loading hangs

Official guidance: if a script problem such as an infinite loop makes level loading slow or hang, the normal log may not get a chance to report it. Check `ErrorLog.txt` in the client script directory (it is only created in this situation).

```sh
gsts lua locate path/to/client-scripts/ErrorLog.txt
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
