# CLAUDE.md

This file guides AI to write/modify code and docs in this template. Focus on a compileable, injectable, and verifiable user workflow.

## Read First
- `README.md`: complete usage flow, constraints, and global function cheat sheet.
- `README_ZH.md`: Chinese template guide and terminology reference when working in Chinese.
- `docs/EDITOR_BOUNDARIES.md`: English decision rules for code-vs-editor responsibilities.
- `docs/EDITOR_BOUNDARIES_ZH.md`: Chinese decision rules and preferred editor terminology.

## Compilation Flow (Debugging)
1. TS -> `.gs.ts` (node function call form)
2. `.gs.ts` -> IR `.json` (nodes and connections)
3. IR -> `.gia` (injectable output)

If something is wrong, compare `.gs.ts` and `.json` first.

## Scope and Principles
- Focus on user-facing steps; explain why when needed.
- Provide alternatives for edge semantics (e.g., explicit conversions).
- Do not edit `dist/` outputs by hand.
- Prefer code for runtime logic, but explicitly list editor-authored prerequisites whenever a feature depends on them.
- Do not infer editor capabilities from API names alone when local editor references are available.

## Scope Rules (Critical)
- Top-level scope: OK to use npm/local files for precompute; do not call `g.server` or `gsts` runtime APIs here.
- Node graph scope (`g.server().on(...)` / `gstsServer*`): only a supported TS subset.
  - Common APIs have type hints (events, entities, Math/Vector3, etc).
  - If string concat/native objects fail, move to top-level precompute.

## gstsServer Constraints
- Only top-level `gstsServer*` functions are recognized.
- Params must be identifiers (no destructuring/default/rest).
- Only a single trailing `return <expr>` is allowed.
- Calls only inside `g.server().on(...)` or another `gstsServer*`.

## Syntax and Type Guidance
- Conditions must be `boolean`; use `bool(...)` if needed.
- `number` is float, `bigint` is int; use `bigint` for integer ops.
- Lists/dicts must be homogeneous; mixed types will fail.
- Empty arrays may not infer a type; add a typed placeholder.
- `dict(...)` is read-only; use graph variables for mutable dicts (`f.get` / `f.set`).
- `Object.*` / `JSON.*` are usually unsupported in graph scope; precompute or use `raw(...)` (compiler ignores, JS semantics).
- No Promise/async/await or recursion (errors or ESLint warnings).
- `while(true)` is capped; use timers or explicit counters.

## Timers
- Use `setTimeout` / `setInterval` (milliseconds).
- Compiler builds timer pools; override with `// @gsts:timerPool=4`.
- `setInterval` <= 100ms triggers a performance warning.
- Timer callbacks support by-value captures; dict captures are not supported.

## Global Function Preferences
- Logging: prefer `print(str(...))` or `console.log(x)` (single argument only).
- Type helpers: `int/float/str/bool/vec3/configId/prefabId/guid/faction/entity`.
- Collections: `list('int', [...])`, `dict(...)` (read-only).
- Unity-style APIs: `Math` / `Mathf` / `Vector3` / `Random` / `GameObject`.
- Global entities: `player(1)` / `stage` / `level` / `self`.

## Variables and Language Hints
- `g.server({ variables: { ... } })` declares graph variables with typed `f.get` / `f.set`.
- `g.server({ lang: 'zh' })` enables Chinese event names and function aliases.

## Hard Rules
- For any non-trivial feature, state:
  - what can be implemented in code now
  - what still requires manual editor setup
- Components are editor-authored unless verified otherwise.
- Normal timers can be created in node graphs; global timers must be defined in the editor first.
- Prefab creation uses existing authored prefab resources; it does not replace asset authoring.
- Shop, currency, backpack, UI layout/control groups, signal definitions, text bubbles, minimap markers, and ability units usually require editor setup first.
- When responding in Chinese, prefer the terminology used in `README_ZH.md` and `docs/EDITOR_BOUNDARIES_ZH.md`.

## Common Commands
- `npm run dev`: incremental compile (auto inject if configured)
- `npm run build`: full compile
- `npm run maps`: list maps

## Look Up Function/Event Notes
- Search `node_modules/genshin-ts/dist/src/definitions/` with keywords.
- Chinese and English alias keywords are supported.
- If local editor reference docs are available in the workspace, use them as the preferred source for editor-side behavior.
