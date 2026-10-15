# Client controls: TypeScript to Lua

Use `g.clientControlScript` for scripts mounted on client UI controls. Ordinary TS modules and native Lua modules remain separate files, loaded through the host's `require`. The toolchain pins TypeScript 5.9.3 and TSTL 1.34.0, targets Lua 5.3, and does not fork TSTL.

## Project layout and types

Put Lua sources in a separate directory, for example `src/lua`, with this `tsconfig.json`:

```json
{
  "extends": "genshin-ts/tsconfig/lua.json",
  "include": ["**/*.ts"],
  "exclude": ["dist"]
}
```

Exclude that directory from the node graph tsconfig. Each environment has its own globals. The public import remains `genshin-ts/runtime/core`; the Lua tsconfig redirects its types to the Lua declarations. Preserve the inherited core mapping if you add `paths`. The CLI reads baseUrl/paths from the nearest tsconfig of the first Lua entry; all entries should use the same mappings and dependencies must remain under compileRoot.

```text
src/
  server.ts
  client.ts
  shared/constants.ts
  lua/
    tsconfig.json
    hud.ts
    easing.lua
    easing.d.ts
```

Shared files should contain plain data, types and portable functions. Do not import a node graph entry or a mounted Lua entry as a value module. Use `import type` to reference an entry's public method types.

## Entry and lifecycle

```ts
import { g } from 'genshin-ts/runtime/core'

export default g.clientControlScript((lua) => {
  let elapsed = 0
  const speed = 20

  return {
    onStart() {
      lua.script.EnableUpdate(true)
    },
    onUpdate(dt) {
      elapsed += dt
      console.log(elapsed * speed)
    }
  }
})
```

The callback body becomes Lua file-level code. Its locals belong to each mounted instance; hooks become the host's `OnStart`, `OnUpdate`, etc. There is no runtime script factory. Functions, classes, objects and arrays can be declared inside the callback; ordinary class `this` works normally. Private #fields are rewritten to collision-free Lua fields; Lua does not enforce access control. Private brand checks with in are unsupported.

The parameter may be named `lua`, `env`, `global` or another name. `g.clientControlScript({}, callback)` is also accepted; the options accept timerClock: 'level' | 'real', defaulting to 'level'. `_ENV` is reserved. Outside the callback, an entry may contain imports, types and declarations. End the callback with a literal `return { ... }`; computed/spread hook objects and early returns are not supported. Ordinary modules may execute code at the top level.

Hooks: `onInit`, `onStart`, `onEnable`, `onDisable`, `onUpdate`, `onLevelUpdate`, `onDestroy`. Both update hooks receive seconds. Scheduling and pause behavior belong to the game host; strict transition ordering is not assumed.

## Host API and controls

`lua.script`, `lua.game`, `lua.Enum`, `lua.Color` expose official APIs with signatures and hover documentation. `lua.helper` exposes GSTS utilities. Global `self` means the current script host: a control here (script.object), an entity in node graphs. send, console and the four timer functions also remain globals. Host APIs stay under lua.script/game/Enum/Color/helper.

```ts
const control = lua.game.GetClientUIControl(self.id)
if (lua.helper.isControl(control, 'ClientUITextBoxControl')) {
  control.text = 'Typed text control'
  control.fontSize = 24
}
```

`id` is a runtime ID. `prefabIndex` is an editor control/template index, used for template creation. Known prefabIndex values cannot be passed to GetClientUIControl by type; plain numbers are accepted, so their meaning is your responsibility. Use `InstantiateClientUIControl` for a template. Failed lookup does not silently become a tree search.

Official methods already carry the correct Lua receiver types. Write `control.SetVisible(true)`; do not pass `self` manually. `GameObject`, `stage`, `level`, node graph `f`, Node and DOM globals are not part of this environment.

## Utilities and script variables

Use utilities via `lua.helper` or import them from `genshin-ts/runtime/lua`. Both forms use the same implementation. `helper` is a compiler member, not properties inserted into the game's environment table. Direct access, local aliases and named destructuring such as `const { helper } = lua` work; spreading the entire environment does not.

| Task                 | Utility                                                      |
| -------------------- | ------------------------------------------------------------ |
| Numbers              | `clamp`, `lerp`, `moveTowards`                               |
| Narrow a control     | `isControl(control, 'ClientUITextBoxControl')`               |
| Find by path         | `findControl(root, 'Panel/Title', 'ClientUITextBoxControl')` |
| Require a control    | `requireControl(root, path, kind)`                           |
| Key listener         | `const off = listenKey(control, event, callback)`            |
| Script variables     | `readParams(script, schema)`                                 |
| Multiple Lua returns | `multi(a, b)`                                                |
| Typed public methods | `scriptHandle<typeof OtherEntry>(otherScript)`               |

findControl returns undefined when missing and throws for ambiguous names or the wrong type. requireControl also throws when missing. Entry-owned listenKey and onSignal subscriptions activate on Start/Enable, unregister on Disable, and restore uncancelled subscriptions on Enable. Destroy releases them permanently. Calling the returned cancellation function repeatedly is safe. Raw host listeners remain your responsibility; borrowed controls are never automatically destroyed.

The scope has four states: `idle`, `active`, `inactive`, and `destroyed`. Start/Enable activates it before user code. Disable/Destroy runs user code first, then cleans up subscriptions and timers, including when user code throws. A timer created during onDisable is accepted and then cleared by that cleanup. Repeating a transition is harmless. State changes after destruction are ignored; adding a new subscription or timer after destruction throws. The generated Lua shows these lifecycle calls explicitly.

```ts
const params = lua.helper.readParams(lua.script, {
  Speed: { type: 'number', default: 20 },
  Caption: { type: 'string', default: 'Speed' }
})
console.log(params.Speed, params.Caption)
```

The schema validates values but does not create editor variables. Missing values can use defaults; missing required values and wrong types report the variable name. Raw `GetParam` returns unknown. A control parameter only accepts an actual control object, not a number assumed to be a control. Prefer explicit path lookup when you only have editor indices.

## Signals and logs

Use the existing extracted signal definitions:

```ts
import { Signal } from '../definitions/signals'

// Inside a script callback or an ordinary Lua TS module
send(Signal['操作输入'], 20, true)
```

`defineSignal` metadata determines types and parameter order. Static definitions compile directly to AddFloat/AddBool/etc.; dynamic definitions use the same writer mapping through a helper. Each send creates a new signal, evaluates arguments once in source order and rejects unsupported signal types. A number alone cannot tell the compiler whether the host expects an integer or a float.

Receive with `lua.onSignal(Signal.Input, evt => console.log(evt.params.speed))`. The return value cancels that subscription idempotently. One host listener per instance/name dispatches multiple subscriptions in order. New subscriptions start with the next message; cancelled ones are skipped. A failing subscriber is logged without stopping the others. Do not mix raw Register/Unregister calls with managed subscriptions for the same script/name. Payload counts, scalar types, integer ranges, list items and vectors are checked before delivery. Invalid messages are logged and discarded. LuaEntityValue/LuaGuidValue represent host values, not node graph entity wrappers. Actual host payloads still require game acceptance.

`console.log/info` print normal logs; warn adds a warning prefix; error uses printerr. assert logs when false without throwing, and trace prints a stack. Multiple arguments and `%` in text are safe. Use `throw new Error(...)` or `lua.error` to interrupt execution.

## Public methods

```ts
// counter.ts; import g as in the entry example
export default g.clientControlScript((lua) => {
  let value = 0
  return {
    methods: {
      add(amount: number) {
        value += amount
        return value
      }
    }
  }
})
```

```ts
// Another entry: import type Counter from './counter'
const other = self.GetScriptByPath('counter')
if (other) {
  const typed = lua.helper.scriptHandle<typeof Counter>(other)
  const [value] = typed.Invoke('add', 2)
}
```

methods become global Lua functions callable through the host's Invoke. Parameters and return values have types; use multi for several returns. You must obtain the correct script handle: the compiler does not yet read editor mount mappings to prove that it matches Counter. Public methods capture local state; they do not need class `this`. Callback-local functions also work as `methods: { summary }` or `methods: { summary: summary }`. Object/class method references and non-function values produce diagnostics.

## Modules and native Lua

Each ordinary module has one shared module state. Mounted entry locals remain private to their instance. Named imports, default imports, namespace imports and re-exports read current exports. `const snapshot = count` deliberately saves a value; `const old = state` preserves the old object even if the exporter later replaces state. Shallow copies still share nested objects, as in JS.

Relative TS imports compile to root-relative dotted require paths, such as `ui.counter`, without `./`. Use one spelling in native Lua too; cache identity across alternate spellings is not guaranteed. A module must not assume its global script is the calling entry's script. Pass the relevant script or control explicitly.

```lua
-- easing.lua
return { double = function(value) return value * 2 end }
```

```ts
// easing.d.ts
export function double(this: void, value: number): number
```

```ts
import { double } from './easing'
```

Native plain functions use `this: void`; native methods use `this: ReceiverType` in their declarations. This only concerns authoring external Lua types. For a module returning an entire object/function, declare `export = api` and use a default import. Undeclared native modules can be default-imported as unknown; add types or narrow the value. Native code is copied with the generated marker.

Static `lua.require('vendor/module')` and native Lua require dependencies are collected automatically. Top-level require cycles, including mixed TS/Lua cycles, are rejected before output. Deferred loads inside functions are not automatically treated as top-level cycles. List possible dynamic dependencies explicitly:

```ts
// gsts.config.ts; paths relative to compileRoot
lua: {
  include: ['vendor/**/*.lua', 'shared/dynamically-loaded.ts']
}
```

This is a build list, not a replacement loader. Runtime paths and deferred cycles remain your responsibility. Include TS modules referenced only from native Lua as well.

## Standard library support

The following 128 members have fengari execution cases. This covers common operations, not every ECMAScript edge case or overload. New members need execution tests before admission. Other standard members produce an explanatory diagnostic. Host APIs are separate and still need game acceptance.

| Type (Constructor means static members) | Covered members                                                                                                                                                                                                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Math                                    | `E`, `LN10`, `LN2`, `LOG10E`, `LOG2E`, `PI`, `SQRT1_2`, `SQRT2`, `abs`, `acos`, `asin`, `atan`, `atan2`, `ceil`, `cos`, `exp`, `floor`, `log`, `log10`, `log2`, `log1p`, `max`, `min`, `pow`, `random`, `round`, `sign`, `sin`, `sqrt`, `tan`, `trunc`                                           |
| NumberConstructor                       | `MAX_SAFE_INTEGER`, `MIN_SAFE_INTEGER`, `MAX_VALUE`, `MIN_VALUE`, `EPSILON`, `POSITIVE_INFINITY`, `NEGATIVE_INFINITY`, `NaN`, `isInteger`, `isNaN`, `isFinite`, `parseInt`, `parseFloat`                                                                                                         |
| Number                                  | `toString`, `toFixed`                                                                                                                                                                                                                                                                            |
| StringConstructor                       | `fromCharCode`                                                                                                                                                                                                                                                                                   |
| String                                  | `length`, `replace`, `replaceAll`, `concat`, `indexOf`, `substr`, `substring`, `slice`, `toLowerCase`, `toUpperCase`, `trim`, `trimEnd`, `trimRight`, `trimStart`, `trimLeft`, `split`, `charAt`, `charCodeAt`, `startsWith`, `endsWith`, `includes`, `repeat`, `padStart`, `padEnd`, `toString` |
| ArrayConstructor                        | `from`, `isArray`, `of`                                                                                                                                                                                                                                                                          |
| Array                                   | `length`, `at`, `concat`, `entries`, `fill`, `push`, `reverse`, `shift`, `unshift`, `sort`, `pop`, `forEach`, `find`, `findIndex`, `includes`, `indexOf`, `map`, `filter`, `reduce`, `reduceRight`, `some`, `every`, `slice`, `splice`, `join`, `flat`, `flatMap`                                |
| ObjectConstructor                       | `assign`, `defineProperty`, `entries`, `fromEntries`, `keys`, `values`                                                                                                                                                                                                                           |
| Object                                  | `hasOwnProperty`                                                                                                                                                                                                                                                                                 |
| Map                                     | `size`, `clear`, `delete`, `entries`, `forEach`, `get`, `has`, `keys`, `set`, `values`                                                                                                                                                                                                           |
| Set                                     | `size`, `add`, `clear`, `delete`, `entries`, `forEach`, `has`, `keys`, `values`                                                                                                                                                                                                                  |

Ordinary objects, arrays, classes, Map/Set construction, Number/String conversions, Error and try/catch are available. Standard methods cannot be extracted or destructured as values: write `values.map(value => Math.abs(value))`. Dynamic method-name access is unsupported; numeric string/array indexing remains supported.

`Boolean(value)` explicitly follows JS truthiness and evaluates its argument once. 0, empty string, NaN, undefined/nil and false produce false; objects and arrays produce true. No argument produces false. Function aliases and `filter(Boolean)` work; `new Boolean()` is rejected. Direct numeric/string conditions still need explicit comparisons.

setTimeout/setInterval and their clear functions are supported; see Timers below. requestAnimationFrame and queueMicrotask remain unavailable. Promise, Date, RegExp, JSON, WeakMap/WeakSet and browser/Node globals are unavailable. Compiler, editor plugin and ESLint share the explanatory diagnostics. A user-defined local function with the same name remains allowed.

### Package data

The `genshin-ts/definitions/` allowlist is prefabs, zh_aliases, node_modes, node_graph_entries, server_node_metadata and client_scoped_globals. Lua modules are generated from the same literal TS data and emitted only when used. English names, Chinese names and dynamic keys remain available:

```ts
import { CharacterPrefab } from 'genshin-ts/definitions/prefabs'
```

enum/client_enums contain node graph runtime classes and are not pure data. For host enums use `lua.Enum`. Other package JS and npm modules are rejected with a reason; they cannot automatically execute in Lua.

### Semantic differences

- TS arrays keep zero-based source indexing; the compiler handles Lua's one-based tables. Native API calls follow their declarations.
- `{ a: undefined }` has no a field in Lua. Undefined or holes in arrays can stop iteration; `delete items[i]` leaves a hole. Use splice to remove an element.
- JS `-5 % 3` is -2; Lua's result is 1. For nonnegative wrapping use `((n % size) + size) % size`. For JS remainder, compute from a quotient truncated toward zero.
- Assignment shares objects; spread/Object.assign are shallow copies. Nested references remain shared, just as in JS. There is no implicit deep copy.

## Editor checks and ESLint

The template's `export { default } from 'genshin-ts/configs/eslint/full.mjs'` automatically enables Lua rules when a file's owning tsconfig includes lua_globals. Directory names do not matter. Graph-only rules remain off for those files. For a custom config:

```js
import tseslint from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'
import gsts from 'genshin-ts/eslint'

export default [
  {
    files: ['src/lua/**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: { project: './src/lua/tsconfig.json' }
    },
    plugins: { gsts, '@typescript-eslint': tseslint },
    rules: gsts.configs.lua.rules
  }
]
```

The preset disables graph-only restrictions and enables individually configurable `gsts/lua-*` rules. eqeqeq requires strict equality. strict-boolean-expressions disallows numeric/string conditions. no-restricted-syntax recommends undefined instead of null. Lua rules include lua-no-undefined-field, lua-no-array-hole, lua-no-array-delete and lua-no-bigint. Negative remainder is documented rather than linted.

TypeScript checks API signatures, read-only properties, enums, callbacks and ordinary syntax. The editor plugin reuses Lua diagnostics; TSTL-specific restrictions are also checked during builds. Builds do not run full-project typecheck by default. They do reject unresolved names, imports and members (for example TS2304, TS2339 and TS2551), checking only affected files in incremental builds. Enable `lua: { typeCheck: true }` when needed; disabling this does not hide editor errors.

## Build, dev and injection

Use the existing single-file, batch and `gsts dev` commands. Lua files go to `<outDir>/lua/`, or `dist/lua/` for an unconfigured single-file build. Outputs include entries, dependencies, native Lua, helpers and required lualib functions.

With inject.mapId configured and without --noinject, files are copied to that map's `external_lua_file`. **Lua injection only copies files. You must still import the folder and mount entry scripts manually in the editor.** It does not modify mount mappings in GIL. Local dist outputs are retained.

The first nonempty line is `-- @gsts:lua`. Existing files without the marker are not overwritten; the entire pending batch is blocked and reports the conflicting paths. To authorize replacing your own file, add that marker as its first nonempty line. Old three-line generated headers remain accepted. skipSafeCheck cannot disable Lua protection.

Unchanged content is not rewritten. Files use temporary-file replacement, not a game-level atomic transaction. Project manifests control cleanup: only owned, still-marked obsolete files are removed. Single-file builds do not clean other entries; other projects' referenced files are kept. Path escapes, symlinks/junctions and conflicting names are rejected. Use separate module subdirectories for independent projects. Partial failures report completed and pending changes.

dev watches TS, native Lua and declarations, preserves previous outputs after failure, and recompiles changed Lua modules and their dependents using one persistent worker. It can run alongside node graph compilation. Declaration/global/config changes may need a full Lua rebuild. Restart dev after changing build configuration. Only changed outputs are prechecked during ordinary saves; a fresh build checks all outputs and restores files modified externally.

After importing and mounting the generated folder, edit code and rerun the game in the editor. There is no additional script-refresh operation.

Node graph and Lua builds/injections are independent; failure on one side does not block the other. Final summaries show node graphs first, then Lua. Failure still produces a failure exit code. Pure graph projects do not start a Lua worker/Program or run TSTL, and do not show an empty Lua summary.

Entry discovery is automatic. entries exclusions affect entry discovery only; imported dependencies remain compiled and watched. dev can start from an empty directory and discover either kind of entry later, provided the new file matches entries. A .d.ts is never an entry. In a pure graph project, .lua/.d.ts changes do not create empty build rounds.

Set `GSTS_INJECT_PROFILE=1` or --inject-profile for unified `[pipeline-profile]` JSON. The lua field records discovery, Program, transpilation, output and watch work. Ordinary builds do not print this detail. Injection duration excludes earlier compilation/GIA work; save-to-output time also includes debounce.

## Validation boundary

Automated tests execute generated code in fengari, simulate controls and maps, and check editor completions and diagnostics. The SDK generator checks 640 host API/enum members against cached official documentation. These checks do **not** establish in-game correctness. Generated lifecycle behavior, two mounts, keys, grids, Tween, signals, Invoke and editor reruns still await the game's acceptance results. Optional source maps and offline lookup are available below; they do not capture game logs automatically.

## Shared modules and integers

Modules actually imported by both targets must stay neutral: types, constants, portable functions and defineSignal. Builds, default ESLint and the TS editor plugin check these files across both tsconfigs. Runtime-specific globals/imports and shared bigint literals or BigInt() are rejected. Write shared constants as numbers, then convert at the graph boundary:

```ts
// shared/rules.ts
export const INITIAL_SCORE = 10
// server.ts: node graph int uses bigint
const score = int(INITIAL_SCORE)
// Lua uses INITIAL_SCORE directly: Lua integers are numbers
```

Signal contracts and writer metadata now share one neutral source; each target maps the same contract to its own value types.

## Timers

```ts
export default g.clientControlScript({ timerClock: 'level' }, (lua) => ({
  onEnable() {
    const repeat = setInterval(() => console.log(self.name), 1000)
    setTimeout(() => clearInterval(repeat), 5000)
  }
}))
```

Delays are milliseconds. The default level clock accumulates OnLevelUpdate dt; real accumulates OnUpdate dt. Neither is a wall clock: host scheduling controls progress. Pending tasks enable updates; manually calling EnableUpdate(false) pauses tasks driven by that update stream.

Disable/Destroy clears every task. Enable does not resume old tasks; create fresh tasks in onEnable when needed. Both clear functions are idempotent. Zero/negative delays wait until the next update. Intervals run at most once per update after a stall, without replaying every missed tick. A throwing task is logged and removed while others continue. Tasks created during a callback wait for the next update.

Timers belong to the entry instance. Ordinary modules should receive a scheduling function from the entry rather than assuming their global script is the caller's script. requestAnimationFrame and queueMicrotask remain unavailable.

## Data imports, error locations and mounting

Static accesses such as CharacterPrefab.Amber or CharacterPrefabZh.丽莎 inline numeric constants without a data module. Dynamic keys include only the accessed export table; using a whole namespace as a value requires its full module.

Source maps are off by default. Enable `lua: { sourceMap: true }` in gsts.config.ts to write .lua.map next to local outputs. Maps are not injected into the game. Native Lua maps account for the generated header too.

```sh
gsts lua locate dist/lua/hud.lua:42
gsts lua locate --log game-error.log --outDir dist
```

The command reports the corresponding source file/line/column, recognizes common file.lua:line and [string "..."]:line forms, and rejects stale maps when Lua content changed. Generated framework code may have no source location. Keep matching Lua and map files; this is offline lookup, not a game debugger.

Builds list entry mount paths. When a map is configured, recognized GIL records are inspected read-only. A matching candidate is not proof of successful in-game mounting; no match is not proof of absence. GIL is never modified by this check. Control trees, script-variable extraction and precise mount typing await differential map samples.

## Optional Lua scaffold

```sh
npm create genshin-ts@latest my-project -- --with-lua
```

This adds src/lua, its tsconfig, a minimal example, typecheck:lua and Lua guidance in AGENTS.md/CLAUDE.md. The default template remains graph-only.
