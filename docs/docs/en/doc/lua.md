# Client control scripts: TypeScript → Lua

Write mounted scripts with `g.clientControlScript`. TS modules and native Lua remain separate files, loaded by the host's `require`. The compiler uses TypeScript 5.9.3 and TSTL 1.34.0, targets Lua 5.3, and does not fork TSTL.

## Project structure and completions

Lua and node graphs share a project but use separate tsconfigs to keep their global types apart.

```text
src/
  graphs/main.ts
  resources/signals.ts
  lua/
    tsconfig.json
    hud.ts
    lib/format.ts
```

In `src/lua/tsconfig.json`:

```json
{
  "extends": "genshin-ts/tsconfig/lua.json",
  "include": ["**/*.ts"],
  "exclude": ["dist"]
}
```

Exclude src/lua from the root graph tsconfig. Keep importing g from genshin-ts/runtime/core: the inherited paths mapping selects Lua declarations without loading the graph runtime. Preserve that mapping when adding aliases. The CLI reads baseUrl/paths from the nearest tsconfig of the first entry; entries should share the same mappings, and dependencies must remain inside compileRoot.

`npm create genshin-ts@latest` uses the "Node graphs + Lua" template by default, which creates the layout above; its `npm run typecheck` also runs `gsts lua check`.

## Adding Lua to an existing project {#add-lua}

For a project created with the "Node graphs only" template or an older version:

1. Create `src/lua/tsconfig.json` with the content above.
2. Add `"exclude": ["src/lua"]` to the root `tsconfig.json` so the node graph project does not pick up Lua globals.
3. Write your first `g.clientControlScript` entry under `src/lua` (see "Entries and where code belongs" below). The build finds Lua entries by itself; as long as the file is covered by `entries` in `gsts.config.ts`, no config change is needed.
4. The default `full.mjs` ESLint selects the Lua rules for `src/lua` from its tsconfig; append `&& gsts lua check` to the `typecheck` script in `package.json`.
5. Run `npm run dev`, then add the Lua output folder in the editor and mount the entries (see "Build, paths and injection" below).

A new project created with the "Node graphs + Lua" template shows the complete layout.

## Entries and where code belongs

The setup callback is flattened into the Lua file root, and hooks become official lifecycle functions; there is no runtime script factory.

```ts
import { g } from 'genshin-ts/runtime/core'

export let visits = 0 // Shared across mounts; retained after teleportation

g.clientControlScript((lua) => {
  visits += 1
  let elapsed = 0 // Private to this mount
  const title = lua.helper.requireControl(self, 'Title', 'ClientUITextBoxControl')
  return {
    onStart() {
      title.text = `Mount ${visits}`
      lua.script.EnableUpdate(true)
    },
    onUpdate(dt) {
      elapsed += dt
      title.text = `${elapsed.toFixed(1)} seconds`
    }
  }
})
```

When there is no setup code, return the object directly without a block or `return`. Both forms produce the same Lua:

```ts
export default g.clientControlScript((lua) => ({
  onStart() {
    lua.print('Ready')
  },
  onUpdate(dt) {
    lua.print(dt)
  }
}))
```

Parentheses, `as`, and `satisfies` may wrap the object. Write the hook object directly; `(lua) => makeHooks()` is still unsupported.

These are framework recommendations, not official guidance about code placement:

| Location             | Runs                                                                     | Suitable contents                                         |
| -------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| Entry file top level | Once per current client module environment; retained after teleportation | Shared data, utilities, state to restore later            |
| Callback root        | Once per mount; reruns after teleportation                               | Find controls, instance state, signal/key subscriptions   |
| onStart              | Once per instance                                                        | Initial display, user update switch, one-time timer setup |
| onEnable             | On every enable                                                          | Work that must repeat on each activation                  |

The initial order is **root → OnInit → OnEnable → OnStart**. OnEnable precedes OnStart, and child controls already exist at the root (confirmed in game). Initialization can normally go at the root without onInit.

The callback parameter can be named lua, env, or another identifier; \_ENV is reserved. One file has one entry. Functions, classes, objects, arrays and ordinary TS expressions work inside the callback, which returns a literal hook object in either form above. Dynamically assembled/spread hook objects and early returns are unsupported. Class this works normally; #value becomes a distinct ordinary Lua field, without Lua access control. Private-field in brand checks are unsupported.

The file top level accepts imports, types, const/let, functions, classes and named exports. Instance capabilities such as self, script, timers and subscriptions belong inside the callback, not the shared top level or ordinary modules. Import/type-only top levels produce no extra shared file.

If the entry callback directly uses a mutable top-level variable, export it with `export let value = 0`. Do not also export it through `export { value }` or `export { value as other }`, even after an `export let` declaration. `const`, functions, classes, and variables not directly used by the callback can still use export lists.

Hooks are onInit, onStart, onEnable, onDisable, onUpdate, onLevelUpdate and onDestroy. Both update dt values are seconds.

## Host APIs, controls and script parameters

Official APIs live under lua.script, lua.game, lua.Enum and lua.Color. Tools live under lua.helper and are also exported from genshin-ts/runtime/lua. Listeners for signals, custom variables, keys and the cursor are on lua itself: lua.onSignal, lua.onVariable, lua.onKey and lua.onCursor (see Signals and subscriptions).

```ts
// Inside clientControlScript
const title = lua.helper.requireControl(self, 'Panel/Title', 'ClientUITextBoxControl')
title.text = 'Ready' // Narrowing exposes text-control properties
const candidate = lua.game.GetClientUIControl(self.id)
if (lua.helper.isControl(candidate, 'ClientUITextBoxControl')) {
  candidate.fontSize = 24
}
```

The global self means the current script host: a control (`script.object`) in Lua, an entity in node graphs. send, console and the four timer functions remain globals. Lua does not expose graph f, GameObject, stage, level, Vector3 or value constructors such as int/str, nor Node/DOM globals. Writing them out of node-graph habit reports `gsts/lua-graph-api` with the client way to do it:

| Node graph                       | Client Lua                                                                                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GameObject, player, entity       | No entity API on the client; find UI controls with lua.helper.findControl / requireControl                                                                      |
| stage, level                     | Read only: lua.helper.readVariable(lua.Enum.CustomVariableEntityType.Level, name, type); lua.onVariable for changes; send a signal to have the server change it |
| Vector3, vec3                    | A `{ x, y, z }` table                                                                                                                                           |
| Mathf, Random                    | Math.\*, Math.random(), and lua.helper.clamp / lerp / moveTowards                                                                                               |
| int, float, str, bool, guid etc. | Not needed: numbers are plain numbers (no int/float distinction); convert with String(x), Boolean(x)                                                            |
| list, dict                       | Arrays as `[...]`, key-value data as plain objects or a Map                                                                                                     |

control.SetVisible(true) automatically emits control:SetVisible(true). Host declarations already handle self; callers do not pass it manually. Only authors of native Lua declarations need to distinguish this:void from receiver methods.

| Tool                                 | Purpose                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| findControl(root, path, kind)        | Name/path lookup; undefined if absent, error on ambiguous names or wrong type           |
| requireControl(root, path, kind)     | Required lookup; reports the missing path                                               |
| isControl(control, kind)             | Type guard exposing control.xxx completions                                             |
| clamp / lerp / moveTowards           | Numeric limits, interpolation and movement                                              |
| readParams(schema)                   | Checks the current script's variables and returns typed fields                          |
| readVariable(entityType, name, type) | Reads a global custom variable now and checks its type; undefined when it has no value  |
| multi                                | Multiple returns                                                                        |
| findScript / requireScript           | Find another mount and call its public methods; the require version throws when missing |
| scriptHandle(script)                 | Wrap an official Script you already have as the same handle                             |

Script parameters support number/string/boolean. The schema does not create editor variables; a variable missing from the editor uses its default, or reports the variable name when there is none. A variable that exists but is left blank is not missing: a string reads as an empty string (confirmed in game).

```ts
const params = lua.helper.readParams({
  Speed: { type: 'number', default: 20 },
  Caption: { type: 'string', default: 'Speed' },
  Enabled: { type: 'boolean', default: true }
})
console.log(params.Speed, params.Caption, params.Enabled)
```

**Confirmed in game:** a Client Control ID variable returns the entered editor index (prefabIndex), not a control or runtime ID. Integer/GUID variables and hardcoded numbers do not convert it either. GetClientUIControl accepts runtime IDs only; there is no official API to find an existing control by editor index. Officially recommended name/hierarchy lookup works in the tested game. Use it instead of a control parameter schema. prefabIndex is for template creation such as InstantiateClientUIControl; self.id is a runtime lookup value.

## Modules, teleportation and restoring state

File top levels and ordinary modules share state; callback variables belong to individual mounts. Named imports read live bindings; explicitly storing a value still takes a snapshot.

```ts
// In the root, find the new control and restore its display from score.
// title.text = `${score}`

// Another entry file

import { addScore, score } from './hud'

// hud.ts top level
export let score = 0
export function addScore(amount: number) {
  score += amount
}

// Inside its callback: addScore(1); console.log(score)
```

Teleporting in game showed old instances receiving Disable/Destroy, new controls and roots being created, followed by Init → Enable → Start. Required modules were retained. The root must rebuild a complete UI and restore its display from shared data. Do not retain control objects in long-lived shared state; find them again after teleportation. Shared state belongs to all mounts, so use stable application keys when panels/players need separate stored values.

Reconnection provisionally uses the same recovery model, **but has not been tested**. Retention across teleportation does not imply persistence after the client exits.

```ts
// A shared module: data only, no control references
export const scores: Record<string, number> = {}
// Inside an entry callback:
// const title = lua.helper.requireControl(self, 'Title', 'ClientUITextBoxControl')
// title.text = `${scores.left ?? 0}`
```

Relative TS imports become require paths rooted at compileRoot, without ./ prefixes. Top-level require cycles, including TS/Lua cycles, are rejected before output; deferred function calls are not automatically classified as top-level cycles. Keep native require spellings consistent with the generated paths.

const saved = score saves a number. const old = state keeps an object reference; reassigning the exported state does not replace old. Spread/Object.assign make shallow copies whose nested objects remain shared, as in JS.

## methods: invoke one mount

For two scoreboards on the screen, a top-level export is shared by both; methods invoked through Invoke run in one particular mount and change its own score.

```ts
// board.ts

import { g } from 'genshin-ts/runtime/core'

export default g.clientControlScript(() => {
  let score = 0
  function push(amount: number) {
    score += amount
    return score
  }
  return { methods: { push } }
})
```

```ts
// hud.ts top level

import type Board from './board'

// Inside hud: Left and Right each mount board
const left = lua.helper.findScript<typeof Board>(self, 'Left')
const score = left?.methods.push(2) // Changes Left only, not Right
left?.Invoke('push', 2) // The official Invoke style works too and returns all values
```

`findScript<typeof Board>(control, path?)` finds the board script mounted on control (or on the child at path), or returns undefined. The script path comes from the entry file that `typeof Board` points to (here `lua/board`), so you never write it by hand; a type argument that is not an entry reports `gsts/lua-find-script` in the editor, ESLint and builds. On the handle, `methods.name(...)` is called like an ordinary function and returns the method's result; `Invoke('name', ...)` matches the official call; `script` is the official Script itself. To wrap a Script you already have (for example from `GetScript`), use `lua.helper.scriptHandle<typeof Board>(script)`.

export default is optional. Keep it for import type Board / typeof Board method-name, argument and return hints. The default cannot be imported as a runtime value; named exports can.

Methods accept inline functions, references to callback-local functions and shorthand properties. Class/object methods, non-functions and outside functions are rejected. Use lua.helper.multi(a,b) for multiple returns; ordinary TS arrays return one table.

## Signals and subscriptions {#signals}

Use extracted signal definitions or a shared defineSignal contract; argument order, receiver fields and types come from that contract.

```ts
// shared/signals.ts

import { defineSignal } from 'genshin-ts/runtime/core'

export const Signal = {
  Input: defineSignal('Input', [
    ['speed', 'float'],
    ['fire', 'bool']
  ])
}
// Entry file: import { Signal } from '../shared/signals'
// Callback root:
const off = lua.onSignal(Signal.Input, (evt) => {
  console.log(evt.params.speed, evt.params.fire)
})
send(Signal.Input, 20, true)
// off() cancels early; repeated calls are harmless
```

Server node graphs reach Lua with Send Client Scripted Server Signal (`sendLua` / `sendLuaAll`); a plain `send` / `f.sendSignal` only reaches node graphs. The signal goes to every Lua script mounted on the target player, and each mounted instance receives it once. For the server side, see [Signals: sending to client Lua scripts](./events/signals.md#to-lua).

`evt.params` reads parameters by name and `evt.values` reads the same parameters in definition order; both are typed and checked:

```ts
lua.onSignal(Signal.Input, (evt) => {
  const [speed, fire] = evt.values // speed: number, fire: boolean
})
```

As in node graphs, you can also write just the signal name. There is no definition then: the callback gets only `evt.name` and `evt.values` (the raw values in the order the server sent them, typed as unknown, so check them before use), and parameters are not checked. Sending by name only works for signals without parameters:

```ts
lua.onSignal('GameStart', (evt) => {
  const [round] = evt.values
  if (typeof round === 'number') console.log('round', round)
})
send('Ready') // no parameters
```

A signal with parameters must be sent with its definition (`Signal.X` or `defineSignal(...)`). Node graphs tell int (bigint) from float (number) by the value, but a Lua number has no such distinction, and entities and GUIDs are numbers too, so the type to write cannot be inferred. `send('Name', value)` reports `gsts/lua-signal-argument`. Within one script, once any listener of a signal uses its definition, listeners by name also receive only payloads that pass the check.

Prefer subscribing at the root. The root and onStart run once per instance, and the framework pauses/resumes subscriptions. onEnable adds a new subscription every time; discarding its cancel function produces gsts/lua-on-enable-subscription in the editor, ESLint and builds. When repeated registration is intentional, store and cancel it in onDisable:

```ts
let off: (() => void) | undefined
return {
  onEnable() {
    off = lua.onSignal(Signal.Input, (evt) => console.log(evt.params.speed))
  },
  onDisable() {
    off?.()
    off = undefined
  }
}
```

Key, cursor and custom variable listeners are on lua too and work like lua.onSignal: write them at the root and they follow the mount's enable/disable/destroy:

```ts
// Callback root
lua.onKey(self, lua.Enum.KeyEventType.KeyboardJumpKeyDown, () => {
  jump() // No return value: other controls in the container still respond; return true to mark it handled
})
lua.onCursor(button, lua.Enum.CursorEventType.CursorClick, (event) => {
  console.log(event.GetUIPos())
})
render(lua.helper.readVariable(lua.Enum.CustomVariableEntityType.Level, 'Stage', 'number') ?? 0) // Read the current value at start
lua.onVariable(lua.Enum.CustomVariableEntityType.Level, 'Stage', 'number', (stage) => {
  render(stage) // Called with the new value each time it is set, even if unchanged; a value that is not a number is logged and skipped
})
```

lua.onCursor accepts preset buttons and cursor event areas. All four listeners return a cancel function and can also be destructured first: `const { onKey, onSignal } = lua`.

lua.onVariable fires each time the variable is set: even when the value is unchanged, and regardless of the Trigger Event option on the server Set Custom Variable node (that option only controls the server On Custom Variable Change event). Compare with the previous value yourself if only real changes matter. It does not fire at start; read the current value with `lua.helper.readVariable` (same arguments as onVariable; undefined when the variable has no value, an error when it holds another type). Only variables configured in the Custom Variable component are synced to the client: a variable the server creates at run time with Set Custom Variable cannot be read or watched from Lua, while changes the server makes to configured variables arrive without any signal, so readVariable sees the new value and onVariable fires (both checked in game). The client can only read variables; send a signal to have the server change one. Do not also use the official RegisterCustomVariableChangedHandler for the same variable (reported as `gsts/lua-listener-ownership`). Each instance has one host handler per signal; subscribers run in registration order. Additions during dispatch start on the next message, cancelled subscriptions are skipped, and one throwing callback does not stop the others. Do not mix raw Register/Unregister with framework subscriptions for the same signal. Raw host listeners, Tween and control ownership remain the caller's responsibility; borrowed controls are not destroyed by the framework.

### Signal boundary checks

Lua sends and receives share validation; server graphs do not perform these client-side checks. Invalid sends throw. Invalid receives log an error and are discarded without invoking callbacks.

```text
[GSTS] Invalid signal payload: Input.speed
```

```ts
// Validation still applies when native callers bypass TS types.
send(Signal.Input, 20, true) // Contract selects AddFloat and AddBool
```

Each valid send creates a new host signal. Arguments evaluate once in source order. Checks cover counts, types, finite numbers, safe integer range, list shape and vec3. Lua TS int is a number; Lua 5.3 distinguishes integer/float, and 4 / 2 is floating-point 2.0. **Confirmed in game:** when the official AddInt gets 2.0, the server receives 2; when it gets 1.5, there is no error, but the server receives 0. So send accepts integral floats such as 2.0 and rejects values with a fractional part; round explicitly when needed, e.g. `Math.floor(total / 2)`. Entities/GUIDs remain official raw values (LuaEntityValue/LuaGuidValue), not graph entity wrappers.

Each parameter takes a few comparisons; list checks scale with length. Measured with wasmoon (Lua 5.4) on a PC, a 100,000-int list takes about 20 ms; the usual tens to hundreds of elements are negligible.

Files reachable from both targets must stay neutral: types, constants, portable functions and defineSignal. Builds, default ESLint and the TS plugin check actual cross-tsconfig dependencies. Write shared constants as number, convert with int() at the graph boundary; shared bigint is rejected.

A shared function runs differently on each side: in Lua it is an ordinary function called at run time, while in a node graph an ordinary function runs at **compile time**. Called with literals (such as `score(2, false)`), a graph computes it into a constant during compilation. To compute with values that exist only in the game (such as `evt.params.combo`), name the function with the `gstsServer` prefix: it is compiled into nodes, and Lua still sees an ordinary function:

```ts
// shared/calc.ts, callable at run time from node graphs and Lua
export function gstsServerScore(combo: number, perfect: boolean) {
  return perfect ? combo * 20 : combo * 10
}
```

When an ordinary function applies a JS operation (`*`, `+`, `<`, `Number()` and so on) to a runtime value, the build stops with an error that suggests this fix. Ordinary helpers that receive `f` and only call node functions are not affected.

```ts
// shared/rules.ts
export const INITIAL_SCORE = 10
// server.ts
const score = int(INITIAL_SCORE)
// Lua uses INITIAL_SCORE directly
```

## Disable, timers and level time stops

Disabling pauses listeners and timers; enabling resumes the remaining delay; destruction clears them. Re-enabling script.enabled or reactivating the control makes the host call OnEnable again.

```ts
import type { LuaTimerHandle } from 'genshin-ts/runtime/lua'

// Inside the callback
const pending: LuaTimerHandle = setTimeout(() => console.log('ready'), 3000)
// Run 1 second → disable for 5 seconds → enable → run 2 more seconds to fire.
// clearTimeout(pending) cancels early.
```

Inactive mounts can schedule tasks, which start counting when enabled. Scheduling after destruction throws. Start/Enable activates the scope before user code; Disable/Destroy runs user code before pausing/disposing resources, even if user code throws. A timer scheduled in onDisable is paused immediately afterward and may later resume.

Global delays are milliseconds and use level time by default. Change the entire entry to real, or choose a clock per helper timer.

```ts
g.clientControlScript({ timerClock: 'real' }, (lua) => {
  const real = setTimeout(() => console.log('entry uses real'), 1000)
  const level = lua.helper.setInterval(() => console.log('level tick'), 1000, 'level')
  const prompt = lua.helper.setTimeout(() => console.log('ignores level pause'), 1000, 'real')
  return {
    methods: {
      cancel() {
        clearTimeout(real)
        clearInterval(level)
        clearTimeout(prompt)
      }
    }
  }
})
```

real advances through OnUpdate and ignores level time stops; level advances through OnLevelUpdate and pauses with the level. Both pause when the script is disabled, and neither is a wall clock. Global clear functions work with helper handles too and are idempotent. Zero/negative delays wait for the next update. Intervals run at most once per update after a stall; missed ticks are not replayed. Newly scheduled callbacks wait until the next update; throwing tasks are logged and removed.

### Update ownership

In entries using managed listeners/timers, lua.script.EnableUpdate(x) records whether the user's onUpdate should run. Pending timers independently keep the host update switch enabled.

| Last EnableUpdate | Timers pending | Host switch while active | User onUpdate |
| ----------------- | -------------- | ------------------------ | ------------- |
| true              | Either         | On                       | Runs          |
| false             | Yes            | On, for timers           | Does not run  |
| false             | No             | Off                      | Does not run  |

```ts
let elapsed = 0
return {
  onStart() {
    lua.script.EnableUpdate(true)
    setTimeout(() => console.log('3 seconds finished'), 3000)
  },
  onUpdate(dt) {
    elapsed += dt
    if (elapsed >= 1) lua.script.EnableUpdate(false) // Animation ends; countdown continues
  }
}
```

The real host call occurs only when the final switch value changes. Keep the current instance's update calls inside the entry; calls to other scripts remain raw host calls. Confirmed in game: official EnableUpdate(false) stops both update hooks, so level timers need that switch too.

## Native Lua interoperability

Give native modules matching .d.ts files. Use LuaMultiReturn for multiple return values and this:void for plain functions.

```lua
-- vector.lua
return { split = function(value) return value, value * 2 end }
```

```ts
// vector.d.ts

import type { LuaMultiReturn } from 'genshin-ts/runtime/lua'

export function split(this: void, value: number): LuaMultiReturn<[number, number]>
// Usage: import { split } from './vector'
// const [x, y] = split(3)
```

A plain [number,number] return means one array and receives a diagnostic suggesting LuaMultiReturn. Object/interface function members also need explicit this: void for plain dot calls, or the receiver type for colon methods. Top-level export function declarations are not warned merely for lacking this.

```ts
export interface VectorApi {
  add(this: void, a: number, b: number): number
}
```

Use export = for a whole returned object/function, then a default import. Undeclared .lua default imports are unknown and need narrowing. Native code is copied with a generated marker. Static lua.require('vendor/module') and native requires are collected automatically; dynamic paths need candidates in include:

```ts
// gsts.config.ts; relative to compileRoot
lua: {
  include: ['vendor/**/*.lua', 'shared/dynamically-loaded.ts']
}
```

include adds build inputs; it does not replace host require or guarantee dynamic calls are acyclic. A native module cannot assume its script global is the calling mount; pass instance objects explicitly.

## Semantic differences and checks

Numeric/string conditions are errors in the editor, ESLint and builds; use explicit comparisons or Boolean conversion.

```ts
if (count !== 0) {
  /* … */
}
if (name !== '') {
  /* … */
}
const selected = [0, 1, 2].filter(Boolean) // [1, 2]
```

Boolean(x) follows JS conversion and emits \_\_gsts_helpers.toBoolean(nil,x). The nil receiver placeholder supports filter(Boolean). Zero, empty string, NaN, undefined/nil and false become false; other values become true. Arguments evaluate once; no argument returns false; aliases work; new Boolean() is unsupported.

### Arrays and nil

Write zero-based TS arrays normally: TSTL converts them to one-based contiguous Lua tables and length to #arr.

```ts
const values = [10, 20, 30]
console.log(values[0]) // Lua: values[1]
const copy = values.slice(1) // New contiguous [20, 30]
values.splice(1, 1) // Remove and compact; do not delete values[1]
```

undefined removes object fields. Array holes, [1,undefined,3], assigning undefined to a middle element, and delete can break continuity. ESLint warns about statically recognizable cases; signal boundaries reject holes, extra keys and noncontiguous tables, including native zero-based tables. This is not a general runtime check of every array assignment.

### Equality and remainder

==/!= are allowed and compile like ===/!== to Lua ==/~=. Lua does not coerce types, so string '1' is not number 1.

```ts
const a: unknown = '1'
const b: unknown = 1
console.log(a == b, a === b) // false, false
```

| Operands | JS % | Lua % | lua.math.fmod |
| -------- | ---- | ----- | ------------- |
| 5, 3     | 2    | 2     | 2             |
| -5, 3    | -2   | 1     | -2            |
| 5, -3    | 2    | -1    | 2             |

The ESLint-only gsts/lua-modulo warning covers % and %=. Ignore it for nonnegative operands, or use lua.math.fmod for JS remainder. It is not a TS-plugin/build diagnostic and can be disabled independently.

```ts
const remainder = lua.math.fmod(-5, 3) // -2
```

```js
// Append to eslint.config.mjs
{ files: ['src/lua/**/*.ts'], rules: { 'gsts/lua-modulo': 'off' } }
```

The template's `export { default } from 'genshin-ts/configs/eslint/full.mjs'` detects lua_globals in the owning tsconfig, independent of folder names, and excludes graph-only rules from Lua files. Custom configs may use gsts.configs.lua.rules with the typescript-eslint parser/project setup.

In the editor, Lua errors come from the ESLint extension or the TypeScript plugin with the same content, so nothing is missed without the plugin; the plugin adds conveniences such as `lua.` completion order and the "Lua standard library" label, see [TypeScript Plugin](./quick-start/ts-plugin.md).

strict-boolean-expressions is an error; null, undefined fields, array holes/deletions have separate guidance; bigint is unsupported. Default builds check unresolved names/members in affected files without full typecheck. Editors still check ordinary TS types. Enable lua: { typeCheck: true } for complete build-time type checking.

`gsts lua check` only checks and writes nothing: a full TS type check plus every Lua rule, including the checks on native `.d.ts` files (plain `tsc` does not know these rules). It first looks for a Lua tsconfig in the project and exits at once when there is none, so the template chains it after `typecheck` at almost no cost for graph-only projects.

## Standard library and package data

The table lists the 128 standard library members you can use; each has automated tests, but they are not guaranteed to match every JavaScript detail or overload. Members outside the table produce a diagnostic.

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

Ordinary classes, arrays/objects, Map/Set, Number/String and Error/throw/try/catch work (catch always receives a string; see [Lua debugging](./lua-debug.md)). Standard methods cannot be extracted as values or dynamically indexed by method name: use values.map(value => Math.abs(value)). Numeric indexing remains available. Promise, Date, RegExp, JSON, WeakMap/WeakSet, requestAnimationFrame and queueMicrotask are unavailable; same-named user-local functions are not falsely rejected. Consider Lua string.match/gsub instead of regular expressions.

The package data allowlist contains only prefabs. Static accesses inline numbers; dynamic keys emit only the accessed table, retaining Chinese/English completions.

```ts
import { CharacterPrefab, CharacterPrefabZh } from 'genshin-ts/definitions/prefabs'

const amber = CharacterPrefab.Amber
const lisa = CharacterPrefabZh.丽莎
function getCharacter(key: keyof typeof CharacterPrefab) {
  return CharacterPrefab[key]
}
```

Other package JS/npm modules cannot run directly as Lua. Use lua.Enum for official host enums. Passing the whole prefab namespace as a value requires its full data module.

console.log/info log normally; warn adds a prefix; error uses printerr; assert logs without throwing; trace emits a stack. Use throw or lua.error to interrupt execution. See [Lua debugging](./lua-debug.md) for source locations.

## Build, paths and injection

Single-file, batch and dev commands support Lua. These examples assume compileRoot=src and outDir=dist.

```ts
// gsts.config.ts options
compileRoot: 'src',
entries: ['**/*.ts'],
outDir: 'dist',
lua: { sourceMap: true } // Already the default; maps stay local
```

| Source/purpose             | Local output                                                 | Editor mount path                   |
| -------------------------- | ------------------------------------------------------------ | ----------------------------------- |
| src/lua/hud.ts entry       | dist/lua/lua/hud.lua                                         | lua/hud                             |
| Its runtime top-level code | dist/lua/\_\_gsts_shared/lua/hud.lua                         | Do not mount; required by the entry |
| Ordinary TS/native modules | Matching paths under dist/lua                                | Do not mount                        |
| Runtime/standard library   | **gsts_helpers.lua, **gsts_signal_kinds.lua, required lualib | Do not mount                        |
| Source maps                | Adjacent .lua.map files                                      | Not copied to the game              |

\_\_gsts_shared is reserved for compiler output, not source module names. Unconfigured single-file builds default to dist/lua.

Injection only copies .lua files into external_lua_file; **it does not mount entries**. Import the entire output folder and mount entries manually in the editor. Preserve relative directories when adding files manually: require resolves disk paths, not editor mapping names (confirmed in game). Automatic injection preserves this layout.

```text
external_lua_file/
  lua/hud.lua
  lua/board.lua
  __gsts_shared/lua/hud.lua
  __gsts_helpers.lua
  …other dependencies
```

With inject.mapId configured, omit --noinject to copy files to the map; local dist remains. After editing Lua, rerun the game in the editor; no separate script-refresh step is needed. For TS, wait for dev compilation/copying first. After injecting, the CLI prints `[ok] Lua injected: … -> …external_lua_file`, the folder the files were copied to; the CLI does not check mounts, so confirm them in the editor.

### Protection, manifests and obsolete files

Only files whose first nonempty line is -- @gsts:lua may be overwritten; old three-line headers remain valid. Conflicts are skipped individually while other writes/cleanup continue, and logs show paths and skipped counts. Rename/move conflicting handwritten files; add the marker only when overwriting is intended. skipSafeCheck does not bypass this protection.

```text
hud.ts → panel.ts
Manifest from the previous build: lua/hud.lua
Output of this build: lua/panel.lua
Write panel.lua; remove the owned, still-marked obsolete hud.lua.
```

`.gsts-lua-<owner>.json` tracks project ownership for cleanup; old files without the marker are retained. Writing a temporary file then renaming prevents interrupted partial writes, a separate concern from obsolete-file cleanup. A whole batch is not a game-level atomic transaction. Single-file builds do not clean other entries; files still referenced by other owners remain. Escaping paths, symlinks/junctions and conflicting names are checked; real I/O errors still fail.

### dev and mixed projects

Lua uses one persistent worker and can overlap graph compilation. Edits rebuild affected modules and users; native Lua and declaration changes are watched too. Declarations/config changes may cause a full rebuild; restart dev after configuration changes. Pure graph projects create no Lua Program/worker, and .lua/.d.ts edits do not trigger empty rounds.

```sh
gsts dev --noinject --lang en
# Edit src/lua/hud.ts → wait for success → rerun the game in the editor.
```

entries exclusions affect entry discovery only; imported dependencies still compile and are watched. dev discovers new matching entries even from an initially empty directory. One target's failure does not block the other target's outputs, and final summaries report both; actual failures still produce failure status. Failed builds retain previous outputs. Ordinary saves precheck changed outputs only; run a normal build to restore all externally edited outputs.

For timing use GSTS_INJECT_PROFILE=1 or --inject-profile and the unified [pipeline-profile] lua fields. Injection time excludes earlier compilation/GIA work; save-to-output includes debounce, so compare matching scopes.

## Tests and known limits

Automated tests run the generated Lua in a simulated runtime (fengari), covering types, ESLint, module state and output protection; the SDK check covers 640 official API and enum members. Host behavior this page describes as confirmed in game was tested in the game.

Not supported yet: extracting control trees, script variables and mount locations from map files.

Load optimization (view detection) unloads entities far from the character on the local client; while an entity is not loaded locally, some purely local logic, such as playing effects, may not run.
