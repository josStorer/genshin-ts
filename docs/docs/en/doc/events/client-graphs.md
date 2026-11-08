# Client Node Graphs

Genshin-TS supports writing seven client node graph types directly in TypeScript. Before injection, create and save a client graph of the matching type in the editor, then use its NodeGraph ID as `id`.

## Seven entry APIs

| Graph type               | TypeScript entry                | Event / result                              | Modes           | Typical use                                                                                  |
| ------------------------ | ------------------------------- | ------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------- |
| Character Skill          | `g.characterSkill(...)`         | `start`                                     | Beyond only     | Character-skill movement, projectiles, attack hitboxes, pre-aiming, and related client logic |
| Character Control Skill  | `g.characterControlSkill(...)`  | `start`                                     | Beyond only     | Control-motor, movement, turning, and pre-aiming logic                                       |
| Creation Skill           | `g.creationSkill(...)`          | `start`                                     | Beyond, Classic | Client execution and presentation logic for Creation skills                                  |
| Creation Status          | `g.creationStatus(...)`         | `start1`–`start10`                          | Beyond, Classic | Continuously evaluate and run Creation actions such as attacking, targeting, and moving      |
| Creation Status Decision | `g.creationStatusDecision(...)` | `start1`–`start10`                          | Beyond, Classic | Select the Creation Status graph that should run                                             |
| Boolean Filter           | `g.boolFilter(...)`             | `start`; return `boolean` / `bool`          | Beyond, Classic | Return a final Boolean result to the feature that references the filter                      |
| Integer Filter           | `g.intFilter(...)`              | `start`; return `bigint` / `number` / `int` | Beyond, Classic | Return a final integer result to the feature that references the filter                      |

Every entry accepts `id`, `name`, `prefix`, `mode`, and `lang`. Beyond is the default mode. Setting `lang: 'zh'` adds Chinese aliases to the current graph's `f` methods. Boolean and integer filters also accept `evaluationInterval` in seconds, which defaults to `0.3`.

The available `f` methods are narrowed by graph type and mode. A server global or node is not automatically available in a client graph; use the TypeScript hints and ESLint diagnostics as the source of truth.

Common arithmetic and comparison operators can be written directly. For example, `value > 5` compiles to the current client graph's `greaterThan` node.

## Basic usage

The IDs below are placeholders. Replace them with IDs of matching graph types from your map.

```ts
import { g } from 'genshin-ts/runtime/core'

g.characterSkill({ id: CHARACTER_SKILL_ID }).on('start', (_evt, f) => {
  // Use Character Skill nodes such as displacement, projectiles, or hitboxes.
})

g.characterControlSkill({ id: CHARACTER_CONTROL_SKILL_ID }).on('start', (_evt, f) => {
  // Use Character Control Skill nodes such as control motors or pre-aiming.
})

g.creationSkill({ id: CREATION_SKILL_ID, mode: 'classic' }).on('start', (_evt, f) => {
  // Use Creation Skill nodes.
})

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

In Creation Status and Creation Status Decision graphs, `start1`–`start10` map to the editor's ordered-exclusive output pins 1–10 and are tried in pin order. They split and organize code; they are not ten independently switchable states.

These two graph types also have special flow semantics: sequential action statements are connected through the preceding action's **Failure** output. The next statement runs only when the previous action fails, rather than unconditionally as ordinary sequential TypeScript would.

## The `clientEntity` helper

`clientEntity(...)` is available only inside client graph handlers. It exposes the client entity shortcuts supported by the current graph type and mode:

- `clientEntity(0)` / `clientEntity(null)` creates an entity placeholder and leaves the entity input pin unconnected.
- `clientEntity(10001)` resolves an entity through the current client graph's `queryEntityByGuid` node. It fails when that node is unavailable in the current graph.
- `clientEntity(otherEntity)` preserves the same runtime entity while narrowing its type to the client shortcuts available in the current graph. This is useful for generic entities returned by `self` or `GameObject.Find(...)`.

```ts
g.characterSkill({ id: CHARACTER_SKILL_ID }).on('start', (_evt, f) => {
  const byGuid = clientEntity(10001)
  const fromGameObject = clientEntity(GameObject.Find(10002))
  const placeholder = clientEntity(0)

  // Entities returned by client f methods are already typed as clientEntity.
  const typedTarget = f.queryEntityByGuid(10003)

  const targetPosition = fromGameObject.pos
})
```

`clientEntity` does not copy or replace an existing entity; with an entity argument, it primarily narrows the TypeScript surface. Ordinary entity parameters on client nodes generally still accept `entity`, so explicit wrapping is needed only when calling client entity shortcuts.

The handler's `f` parameter is the preferred API. Reusable top-level client functions can also use the dedicated namespaces `gsts.fCharacterSkill`, `gsts.fCharacterControlSkill`, `gsts.fCreationSkill`, `gsts.fCreationStatus`, `gsts.fCreationStatusDecision`, `gsts.fBoolFilter`, and `gsts.fIntFilter`. `gsts.f` / `gsts.fServer` remain server-only.

## Runtime notes

- Only variables configured in the entity's Custom Variable component are synced to the client. A variable the server creates at run time with Set Custom Variable cannot be read by client node graphs or Lua.
- Load optimization (view detection) unloads entities far from the character on the local client; while an entity is not loaded locally, some purely local logic, such as playing effects, may not run. A creation beyond a certain range from the character runs at a reduced rate on that character's client (the creation's "reduced frequency out of range" option, on by default).

For complete feature examples, see [`tests/manual/features/beyond.ts`](https://github.com/josStorer/genshin-ts/blob/master/tests/manual/features/beyond.ts) and [`tests/manual/features/classic.ts`](https://github.com/josStorer/genshin-ts/blob/master/tests/manual/features/classic.ts).
