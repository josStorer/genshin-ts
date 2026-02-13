# Type Mapping

- `number` -> float
- `bigint` -> int
- list/dict elements must be consistent

Common errors:
- `invalid value type`
- `Generic parameter not matched`

Use type helpers to make types explicit.

## Global helpers

### Raw and conversions
- `raw(expr)` keeps JS semantics; compiler skips node-graph translation.
- `bool/int/float/str` convert values for pins that require specific types.
- `int(123)` can declare an integer literal, though `123n` is still preferred.
- `idx(...)` helps `bigint` / `IntValue` index expressions pass TypeScript type-checking (type-check only; node-graph int semantics stay unchanged); you can apply this directly with ESLint auto-fix.
- If this is shown as a warning (not an error), the project TypeScript plugin is usually active and already treats `bigint` as a valid index value; you may disable `gsts/bigint-index-in-server` if preferred.
- If `TS2538` still appears as an error in VSCode/Cursor, set `"typescript.tsdk": "node_modules/typescript/lib"` and `"typescript.enablePromptUseWorkspaceTsdk": true` (the genshin-ts project template already includes these settings), then switch to the workspace TypeScript version.
- `str(...)` converts to string and is mainly used for logs.
- `vec3([x, y, z])` builds a vec3 literal; usually `[x, y, z]` is inferred automatically, but `vec3(...)` helps disambiguate list contexts.

### IDs and entities
- `guid/prefabId/configId/faction` declare typed literals for generic pins (e.g. set custom variable); no runtime conversion.
- `entity(guid | entity | 0 | null)` supports placeholders (`entity(0)` / `entity(null)`, pin stays unconnected), GUID lookup, or widening a subtype to a generic entity.
- `stage` / `level` / `self` are the current graph's stage/entity handles.

### Collections
- `list(t, items)` creates a typed list; use `list(t, [])` for empty lists.
- `list(t, 0)` / `list(t, null)` are typed placeholders (pin stays unconnected); use `list(0)` / `list(null)` only when the target pin can infer the type.
- `dict(...)` creates a read-only dict; use `dict(k, v, 0)` for typed placeholders (pin stays unconnected); use `dict(0)` / `dict(null)` only when the target pin can infer the type.

### Runtime helpers
- `print(str)` logs to the server console.
- `send('signal')` triggers a custom stage signal (register it in the editor first).
- `player(id)` returns a player entity by index (1-based).
- `setTimeout/setInterval` compile to graph timers in server scope; outside graph scope they fall back to JS timers.
- `clearTimeout/clearInterval` clear graph timers by handle.
