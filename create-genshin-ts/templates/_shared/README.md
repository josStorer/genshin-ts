# __PROJECT_NAME__

This is a Genshin-TS project template. You can write logic in TypeScript, compile it into a node graph, and inject it into a map.

## Quick Start

```bash
npm install
npm run dev
```

Docs: `https://gsts.moe`

## Project Layout

<!-- snippet:LAYOUT -->
- `src/graphs/main.ts`: server node graph; receives the `JumpPressed` signal sent from Lua
- `src/lua/hud.ts`: client control script (Lua entry) for the HUD container
- `src/lua/lib/`: ordinary TS modules used by Lua entries
- `src/lua/tsconfig.json`: Lua type environment (the root `tsconfig.json` excludes `src/lua`)
- `src/resources/signals.ts`: signal definitions shared by node graphs and Lua; regenerated from the map's signal manager when `inject` runs
<!-- /snippet -->
- `gsts.config.ts`: compile/output configuration
- `dist/`: build outputs (`.gs.ts` / `.json` / `.gia`)
- `docs/EDITOR_BOUNDARIES.md`: English code-vs-editor responsibility guide
- `docs/EDITOR_BOUNDARIES_ZH.md`: Chinese code-vs-editor responsibility guide and terminology reference
- `CLAUDE.md` / `AGENTS.md`: AI collaboration notes (read first)

## Injection Config Example (Optional)

```ts
import type { GstsConfig } from 'genshin-ts'

const config: GstsConfig = {
  compileRoot: './src',
  entries: ['.'],
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
- If you picked a map while creating the project, `inject` is already filled in.
- `npm run maps` lists recently saved maps to help locate `mapId`.
- Fill `gameRegion` / `playerId` when you have multiple regions/accounts.
- Injection automatically creates backups for rollback.

<!-- snippet:LUA_README -->
## Client Lua

### Before the first run

Do these once in the editor, then save the map:

1. Create a server node graph. The first one in a new map gets ID `1073741825`, which `src/graphs/main.ts` uses; otherwise change the ID there. Leave it empty or give it a name starting with `_GSTS`.
2. In the signal manager, add a signal named `JumpPressed` with one integer parameter `count`. `src/resources/signals.ts` already contains this definition; injection regenerates that file from the map, so the name and parameter must match.
3. Create a container for the HUD with a text box named `Title`.

Then run `npm run dev`. With `inject` configured, the Lua files are copied into the map's `external_lua_file` folder; without it they stay in `dist/lua/`. Injection only copies files. In the editor, add the whole Lua output folder once, then mount `lua/hud` on the HUD container. From then on, edit TS, wait for the build, and rerun the map in the editor. Each jump updates the count in `Title` and sends `JumpPressed` to the server graph.

### Checks

`npm run typecheck` checks node graphs and Lua (`gsts lua check` runs the full Lua checks). `npm run lint` applies the Lua ESLint rules to `src/lua` automatically.

Full guide: https://gsts.moe/doc/lua
<!-- /snippet -->

## Editor Boundary

This template is intentionally code-first, but many capabilities in Miliastra / Genshin UGC still require editor-authored setup.

Language entry:
- Use this file together with `docs/EDITOR_BOUNDARIES.md` when working in English.
- When working in Chinese, switch to `README_ZH.md` and `docs/EDITOR_BOUNDARIES_ZH.md` so terminology stays consistent.

- Use code for runtime rules: gameplay flow, state machines, wave logic, economy, validation, spawning, settlement, and signal orchestration.
- Use the editor for authored resources and configuration: prefabs, components, paths, UI layouts/control groups, signals, global timers, shops, currencies, ability units, text bubbles, minimap markers, and audio assets.
- Before proposing or implementing a feature, check `docs/EDITOR_BOUNDARIES.md` and explicitly separate:
  - code changes
  - editor setup still required
- If local editor reference docs are available in the workspace, prefer them as the local source of truth for editor-side behavior.
- When working in Chinese, prefer `README_ZH.md` and `docs/EDITOR_BOUNDARIES_ZH.md` so domain terms stay idiomatic.

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

## Client Node Graphs

Client graphs use the same `g.<type>({ id }).on(...)` registration style. Before injection, create and save a client graph of the matching type in the editor, then use its real NodeGraph ID.

| Graph type               | Entry                           | Event / result          | Modes           | Typical use                                                          |
| ------------------------ | ------------------------------- | ----------------------- | --------------- | -------------------------------------------------------------------- |
| Character Skill          | `g.characterSkill(...)`         | `start`                 | Beyond only     | Character-skill movement, projectiles, hitboxes, and pre-aiming      |
| Character Control Skill  | `g.characterControlSkill(...)`  | `start`                 | Beyond only     | Control motors, movement, turning, and pre-aiming                    |
| Creation Skill           | `g.creationSkill(...)`          | `start`                 | Beyond, Classic | Client execution and presentation for Creation skills                |
| Creation Status          | `g.creationStatus(...)`         | `start1`–`start10`      | Beyond, Classic | Continuous Creation actions such as attacking, targeting, and moving |
| Creation Status Decision | `g.creationStatusDecision(...)` | `start1`–`start10`      | Beyond, Classic | Select the Creation Status graph to execute                          |
| Boolean Filter           | `g.boolFilter(...)`             | `start`; return Boolean | Beyond, Classic | Return a final Boolean result to the referencing feature             |
| Integer Filter           | `g.intFilter(...)`              | `start`; return integer | Beyond, Classic | Return a final integer result to the referencing feature             |

```ts
g.characterSkill({ id: CHARACTER_SKILL_ID }).on('start', (_evt, f) => {})
g.characterControlSkill({ id: CHARACTER_CONTROL_SKILL_ID }).on('start', (_evt, f) => {})
g.creationSkill({ id: CREATION_SKILL_ID, mode: 'classic' }).on('start', (_evt, f) => {})

g.creationStatus({ id: CREATION_STATUS_ID }).on('start1', (_evt, f) => {
  f.executeSkill(true, 1)
})

g.creationStatusDecision({ id: CREATION_STATUS_DECISION_ID }).on('start1', (_evt, f) => {
  f.switchToSelfExecutionStatus(true, CREATION_STATUS_ID, 1)
})

g.boolFilter({
  id: BOOL_FILTER_ID,
  evaluationInterval: 0.5
}).on('start', (_evt, f) => {
  return f.getRandomNumber(1, 10) > 5
})

g.intFilter({ id: INT_FILTER_ID }).on('start', (_evt, f) => {
  return f.getRandomNumber(1, 10)
})
```

Key points:

- Every client entry accepts `id`, `name`, `prefix`, `mode`, and `lang`; `lang: 'zh'` enables Chinese aliases on the current graph's `f`.
- Filters also accept `evaluationInterval` in seconds, defaulting to `0.3`.
- `start1`–`start10` on Creation Status and Creation Status Decision graphs map to ordered-exclusive pins. They organize code, not ten independent states.
- Sequential actions in those two status graph types connect through the preceding action's **Failure** output. The next statement runs only if the previous action fails.
- The available `f` methods depend on client graph type and mode. Server graph functions are not automatically available; follow TypeScript hints and ESLint diagnostics.
- Common arithmetic and comparison operators can be written directly. For example, `value > 5` compiles to the current client graph's `greaterThan` node.

### `clientEntity(...)`

This global helper is available only inside client graph handlers:

- `clientEntity(0)` / `clientEntity(null)`: entity placeholder that leaves the input pin unconnected.
- `clientEntity(10001)`: resolve through the current client graph's GUID query node; it fails if that node is unavailable.
- `clientEntity(otherEntity)`: preserve the same entity value while narrowing its type to the shortcuts available in the current client graph. This is useful for `self` or `GameObject.Find(...)` results.

```ts
g.characterSkill({ id: CHARACTER_SKILL_ID }).on('start', (_evt, f) => {
  const byGuid = clientEntity(10001)
  const found = clientEntity(GameObject.Find(10002))
  const placeholder = clientEntity(0)

  // Entities returned by client f methods already have the correct clientEntity type.
  const typedTarget = f.queryEntityByGuid(10003)
  const targetPosition = found.pos
})
```

In reusable top-level client functions, use the graph-specific namespace `gsts.fCharacterSkill`, `gsts.fCharacterControlSkill`, `gsts.fCreationSkill`, `gsts.fCreationStatus`, `gsts.fCreationStatusDecision`, `gsts.fBoolFilter`, or `gsts.fIntFilter`. `gsts.f` / `gsts.fServer` remain server-only.

For complete notes and examples, see `https://gsts.moe/doc/events/client-graphs`.

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
- When list indexing uses `bigint` / `IntValue`, wrap with `idx(...)`, e.g. `arr[idx(i)]` (you can apply this via ESLint auto-fix).
- If this is shown as a warning (not an error), the TypeScript plugin is usually active and already treats `bigint` as a valid index value; you may disable `gsts/require-bigint-index-wrapper`.
- If `TS2538` still appears as an error in VSCode/Cursor, configure `"typescript.tsdk": "node_modules/typescript/lib"` and `"typescript.enablePromptUseWorkspaceTsdk": true` (the genshin-ts project template already includes these settings), then switch to the workspace TypeScript version.
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
- `idx(...)`: helps `bigint` / `IntValue` index expressions pass TypeScript type-checking (type-check only; node-graph int semantics stay unchanged).
- `vec3(...)` / `guid(...)` / `prefabId(...)` / `configId(...)` / `faction(...)` / `entity(...)`
- `clientEntity(...)`: client graphs only; resolve or narrow an entity and expose shortcuts supported by the current client graph.
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
- String usage works: `send('signalName')` with `g.server().onSignal('signalName', ...)`.
- Prefer extracted definitions: `send(Signal.xxx, ...)` and `g.server().onSignal(Signal.xxx, ...)`.
- `Signal.xxx` comes from `src/resources/signals.ts` and enables parameter type checks.

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
- `npm run typecheck`: TypeScript type check; also checks client Lua with `gsts lua check` when the project has it (skipped at once otherwise)
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
