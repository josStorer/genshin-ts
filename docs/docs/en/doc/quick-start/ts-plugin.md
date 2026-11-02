# TypeScript Plugin

genshin-ts ships a TypeScript language service plugin (`genshin-ts/configs/ts-plugin`). It runs inside the editor's TypeScript server, which provides completions, hovers and errors; it is not an extension for one particular editor.

## Principle: nothing is missing without it

The plugin only improves the editing experience. Compilation, runtime behavior, type checking and every gsts rule work without it:

- builds (`gsts`, `gsts dev`) and `npm run typecheck` (including `gsts lua check`) check as usual;
- every gsts rule also exists as an ESLint rule, so with the ESLint extension you see it in the editor;
- each improvement the plugin adds is listed on this page, together with what happens without the plugin.

## What the plugin improves

| Area                                 | With the plugin                                                                                                                                                                                                                           | Without the plugin                                                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Node graphs: bigint indexes          | Indexing with bigint / int values inside `g.server().on(...)` callbacks and `gstsServer*` functions does not report TS2538                                                                                                                | The editor shows TS2538; wrap the index in `idx(...)` (ESLint can fix it automatically); compilation is unaffected |
| Node graphs: modules shared with Lua | The editor flags what shared modules cannot contain (bigint, APIs exclusive to one side)                                                                                                                                                  | ESLint `gsts/lua-shared-module` and the build report the same                                                      |
| Lua: gsts errors                     | Shown as TypeScript errors, no ESLint extension needed                                                                                                                                                                                    | The ESLint extension, the build and `gsts lua check` report the same content                                       |
| Lua: duplicate "Cannot find name"    | Where gsts already explains a name (for example `stage` written out of node-graph habit), TypeScript's "Cannot find name" is not shown again                                                                                              | Both are shown; no information is missing                                                                          |
| Lua: `lua.` completions              | Ordered by typical use: game, helper, script, self, onSignal, onVariable, onKey, onCursor, Color, Enum; the Lua standard library (print, pairs, math and so on) comes last, labelled "Lua standard library" (follows the system language) | Mixed in alphabetical order                                                                                        |
| Lua: `lua.helper.` completions       | findControl, findScript, readParams, readVariable, setTimeout, setInterval first, then requireControl, isControl, requireScript, scriptHandle, then multi and the math tools                                                              | Alphabetical                                                                                                       |
| Lua: `lua.Color.` completions        | Function members such as apply and bind are hidden                                                                                                                                                                                        | These members appear                                                                                               |

## Enabling and checking

- **Configuration:** `genshin-ts/tsconfig/base.json` and `genshin-ts/tsconfig/lua.json`, which template projects extend, already list the plugin; no tsconfig change is needed.
- **VS Code / Cursor:** the plugin needs the workspace TypeScript. The template ships `.vscode/settings.json` with both setting names, `"typescript.tsdk"` and `"js/ts.tsdk.path"` (used by newer VS Code / Cursor), pointing to `node_modules/typescript/lib`. Accept the "use the workspace TypeScript version" prompt, or run `TypeScript: Select TypeScript Version` → `Use Workspace Version`.
- **JetBrains IDEs:** usually work out of the box.
- **After upgrading genshin-ts:** run `TypeScript: Restart TS Server`. The TypeScript server loads plugins when it starts and keeps the old version until restarted.
- **Checking that it is active:** type `lua.Color.` in a Lua file; if apply and bind are not listed, the plugin is loaded. You can also look for `Plugin validation succeeded` in the TypeScript server log.

## Troubleshooting: the plugin is not loaded

The TypeScript server looks for plugins only in the `node_modules` next to the TypeScript it runs. With a normal `npm install`, `genshin-ts` and `typescript` share one `node_modules`, so this just works.

If `genshin-ts` is added with `npm link` or a manual link, or the editor uses a TypeScript from elsewhere, the log shows `Failed to load module 'genshin-ts/configs/ts-plugin'`. Point the server at the project's `node_modules` in the workspace settings, then restart the TypeScript server:

```json
{
  "typescript.tsserver.pluginPaths": ["./node_modules"]
}
```

Newer VS Code / Cursor versions name this setting `js/ts.tsserver.pluginPaths`. Relative paths are resolved against the workspace folder.
