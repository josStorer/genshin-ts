# Repository Guidelines

This template bootstraps a Genshin-TS project. Maintain it with user workflow and compile outputs in mind.

## Read First
- `README.md`: full usage flow, constraints, and global function cheat sheet.
- `README_ZH.md`: Chinese template guide and terminology reference when working in Chinese.
- `docs/EDITOR_BOUNDARIES.md`: English decision rules for code-vs-editor responsibilities.
- `docs/EDITOR_BOUNDARIES_ZH.md`: Chinese boundary rules and preferred editor terminology.

## Layout
- `src/main.ts`: default entry example
- `gsts.config.ts`: compile config (entries/outDir/inject)
- `dist/`: build outputs (generated)
- `README.md`: user guide
- `CLAUDE.md`: AI rules

## Typical Workflow
1. Update the NodeGraph ID in `src/main.ts`
2. Add `inject` in `gsts.config.ts` when needed
3. Run `npm run dev` for incremental compile

## Hard Rules
- Prefer implementing gameplay logic in code, but do not assume editor-authored resources already exist.
- Separate every substantial feature into `code changes` and `editor setup required`.
- Call out blockers clearly when a requested feature needs editor work first.
- When responding in Chinese, prefer the wording and domain terms from `README_ZH.md` and `docs/EDITOR_BOUNDARIES_ZH.md`.
- Update `entries` when adding new entry files.
- Entry events use `g.server({ id }).on(...)`; same ID entries merge automatically.
- `gstsServer*` must be top-level and only allow a single trailing `return`.
- Avoid Promise/async/recursion/JSON/Object in graph scope.
- Conditions must be `boolean`; use `bool(...)` when needed.
- Use `bigint` for integer ops; avoid modulo/bitwise on `number`.
- `while(true)` is capped; use timers or explicit counters.
- Empty arrays must have inferable element types.
- Logging: use `print(str(...))` or `console.log(x)` (single argument).
- Use type helpers when needed: `int/float/str/bool/vec3/configId/prefabId/entity`.

## Node Graph Variables
- Declare with `g.server({ variables: { ... } })`.
- Read/write via `f.get` / `f.set`, keep types aligned.

## Debugging Outputs
- `.gs.ts`: verify compiled node calls
- `.json`: verify connections and types
- `.gia`: final injectable output

## Common Scripts
- `npm run dev`
- `npm run build`
- `npm run maps`
- `npm run backup`

## Reference Definitions
- Search function/event comments in `node_modules/genshin-ts/dist/src/definitions/`.
