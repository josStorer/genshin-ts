# __PROJECT_NAME__

This is a Genshin-TS project template. You can write logic in TypeScript, compile it into a node graph, and inject it into a map.

## Quick Start

```bash
npm install
npm run dev
```

Docs: `https://gsts.moe`

## Project Layout

- `src/main.ts`: entry example (`g.server(...).on(...)`)
- `gsts.config.ts`: compile/output configuration
- `dist/`: build outputs (`.gs.ts` / `.json` / `.gia`)
- `CLAUDE.md` / `AGENTS.md`: AI collaboration notes (read first)

## Injection Config Example (Optional)

```ts
import type { GstsConfig } from 'genshin-ts'

const config: GstsConfig = {
  compileRoot: '.',
  entries: ['./src'],
  outDir: './dist',
  inject: {
    gameRegion: 'China',
    playerId: 1,
    mapId: 1073741849,
    nodeGraphId: 1073741825
  }
}

export default config
```

Notes:
- `npm run maps` lists recently saved maps to help locate `mapId`.
- Fill `gameRegion` / `playerId` when you have multiple regions/accounts.
- Injection automatically creates backups for rollback.

## Entry and Event Style

```ts
import { g } from 'genshin-ts/runtime/core'

g.server({ id: 1073741825 }).on('whenEntityIsCreated', (evt, f) => {
  const p = player(1)
  f.printString(str(p.guid))
})
```

Key points:
- `id` is the target NodeGraph ID; entries with the same ID are merged.
- Event names use string literals (Chinese aliases are supported).
- `f` is the node graph function entry; use it for output and variables.
- You can chain multiple events: `g.server(...).on(...).onSignal(...)`.

## g.server Options (Injection Safety)

Common options:
- `id`: target NodeGraph ID (injection must match this ID).
- `name`: graph display name; defaults to entry filename.
- `prefix`: auto add `_GSTS_` prefix (default true).
- `mode`: graph mode, `'beyond' | 'classic'` (default `'beyond'`).
- `type`: graph type (default server/entity).
- `variables`: declare graph variables and enable `f.get` / `f.set`.
- `lang`: set `'zh'` to enable Chinese event names and function aliases.

Mode notes:
- Default is Beyond mode (`mode: 'beyond'`) with fuller node capability.
- Use `mode: 'classic'` when you need classic behavior.
- In classic mode, `type: 'class'` is not allowed and available node capability is narrower than Beyond mode.

Classic mode example:

```ts
g.server({
  id: 1073741825,
  mode: 'classic'
}).on('whenEntityIsCreated', (evt, f) => {
  f.printString('classic mode')
})
```

Injection safety rules:
- The target `id` must exist in the map.
- The target graph must be empty or its name must start with `_GSTS`, otherwise injection is blocked.
- If you know what you are doing, set `inject.skipSafeCheck = true` in `gsts.config.ts`.
- After creating a new graph, you must save the map for the injector to detect the `id`.
- Recommended: create and save a batch of graphs first, then compile/inject once.

## gsts.config Optimize Options (Enabled by Default)

`gsts.config.ts` uses `options.optimize` with all defaults on:
- `precompileExpression`: precompute literal-only expressions.
- `removeUnusedNodes`: remove unused exec/data nodes.
- `timerPool`: name pool size for `setTimeout` / `setInterval`.
- `timerDispatchAggregate`: aggregate timer dispatch to reduce complexity.

Disable an option temporarily if you need to debug or compare graphs.

## Typical Usage and Constraints (AI Must Read)

### Scope Split

- **Top-level scope (compile-time)**: OK to read files, use npm libs, precompute data; do not call `g.server` or `gsts` runtime APIs here.
- **Node graph scope (runtime)**: only a supported TS subset; logic is compiled into node graphs.

### Control Flow and Returns

- `if/while/switch` conditions must be `boolean`; use `bool(...)` if needed.
- `gstsServer*` functions allow only a **single trailing `return <expr>`**.
- Recursion, `async/await`, and Promise are not supported in node graph scope.
- `while(true)` is limited by a loop cap; use timers or explicit counters instead.
- `!` and ternary require boolean conditions.

### Numbers and Types

- `number` is **float**; `bigint` is **int**.
- Use `bigint` for modulo/bitwise operations.
- Lists/dicts must be homogeneous; mixed types will fail.
- Empty arrays may not infer a type; add a typed placeholder or use `list(...)`.
- Prefer explicit helpers: `int`, `float`, `vec3`, `configId`, `prefabId`, `entity`, etc.
- `dict(...)` creates a read-only dict; use graph variables for mutable dicts.
- Use `let` to force a local variable node; `const` may be optimized into direct wiring.

### Global Functions and Variables Cheat Sheet (Preferred for AI)

Logging and debug:
- `print(str(...))`: most stable logging.
- `console.log(x)`: **single argument only**, auto-rewritten to `print(str(...))`.
- `f.printString(...)`: explicit node call for strict graph alignment.

Type helpers:
- `bool(...)` / `int(...)` / `float(...)` / `str(...)`
- `vec3(...)` / `guid(...)` / `prefabId(...)` / `configId(...)` / `faction(...)` / `entity(...)`
- `list('int', items)`: explicit list typing (critical for empty arrays).
- `dict(...)`: read-only dict.
- `raw(...)`: compiler ignores it; JS native semantics apply.

Entities and scene:
- `player(1)`: player entity (starts from 1).
- `stage` / `level`: stage entity aliases.
- `self`: current graph entity.
- `GameObject.Find(...)` / `FindWithTag(...)` / `FindByPrefabId(...)`

Math and vectors:
- `Math.*`: compiled to node graph equivalents in server scope.
- `Mathf.*` / `Vector3.*` / `Random.*`: Unity-style APIs.

Signals and events:
- `send('signalName')` with `g.server().onSignal(...)`.

Timers:
- `setTimeout` / `setInterval` / `clearTimeout` / `clearInterval`.

Common methods:
- Many array/string methods (`map`/`filter`/`find`/`length`) are supported; rely on type hints.

### Node Graph Variables (Writable)

```ts
g.server({
  id: 1073741825,
  variables: { counter: 0n },
  lang: 'zh'
}).on('whenEntityIsCreated', (evt, f) => {
  const v = f.get('counter')
  f.set('counter', v + 1n)
})
```

Notes:
- `variables` defines graph variables and enables typed `f.get` / `f.set`.
- Entity variables are type declarations only (use `entity(0)`).
- `entity(0)` can also be used as a placeholder to keep entity params empty in the editor.

### Timers

- Use `setTimeout` / `setInterval` (milliseconds).
- The compiler builds timer name pools to avoid name collisions.
- Use `// @gsts:timerPool=4` to override pool size (advanced).
- `setInterval` <= 100ms triggers a performance warning.
- Timer callbacks support value-based captures; dict captures are not supported.

### Native JS Object Limits

- `Object.*` and `JSON.*` are typically not supported in node graph scope.
- Move them to top-level precompute, or use `raw(...)`.
- If string concatenation fails, precompute at top-level or use `str(...)`.

## Reusable Functions (gstsServer)

```ts
function gstsServerSum(a: bigint, b: bigint) {
  const total = a + b
  return total
}

g.server({ id: 1073741825 }).on('whenEntityIsCreated', (evt, f) => {
  const v = gstsServerSum(1n, 2n)
  f.printString(str(v))
})
```

Rules:
- Must be top-level; params must be identifiers (no destructuring/default/rest).
- Only a trailing single `return` is allowed.
- Calls only allowed inside `g.server().on(...)` or another `gstsServer*`.
- Inside `gstsServer*`, you can use `gsts.f` directly (no need to pass `f`).

## Multi-Entry and Merging

- `entries` in `gsts.config.ts` determines which files compile.
- Each entry builds a graph; same ID entries are merged.
- In dev mode, dependency changes recompile affected entries.

## Outputs and Debugging

- `.gs.ts`: expanded node function calls for semantic checking.
- `.json`: IR for node connections and type checks.
- `.gia`: final graph output for inject/import.

## Compile-Time Execution Notes

- The compiler scans all entries and compiles `g.server().on(...)` points.
- Top-level code may execute once or multiple times (incremental builds, multi-entry).
- Be careful with file I/O or randomness in top-level scope.
- To temporarily disable a graph injection, set `id` to a non-existent value.
- Top-level scope is suitable for file loading, precompute, or procedural generation.
- `stage.set` can be used as a global variable (runtime).

## Scripts

- `npm run build`: full compile
- `npm run dev`: incremental compile (auto inject if configured)
- `npm run maps`: list recent maps
- `npm run backup`: open backup directory
- `npm run typecheck`: TypeScript type check
- `npm run lint`: ESLint

Notes:
- The project includes custom ESLint rules; run `npm run lint` often to catch hidden constraints.
- `npm run typecheck` helps catch type issues before compile errors.
- `npm run dev` runs `gsts dev` watch mode only.
- After injection, reload the map to see changes.
- Use a temporary empty map to quickly swap and reload.
- Saving the map before reload can overwrite injected content; re-inject if needed.

## FAQ

- `npm run maps` is empty: save the map in the editor once, then retry.
- Injection failed: verify `mapId` / `nodeGraphId` and graph type.
- Type errors: check `.value` usage and pin type alignment first.

## Looking Up Function Notes (AI Friendly)

When type hints are not enough, search in `node_modules/genshin-ts`:
- Node functions and event definitions: `node_modules/genshin-ts/dist/src/definitions/`
- Use keywords (event name, function name, Chinese alias) to locate comments and params.
