# g.server Options and Entry

Common options:
- `id` / `name` / `prefix` / `type` / `mode`
- `variables`
- `lang`

## `mode` (graph mode)

- Default is Beyond Mode: omitting `mode` is equivalent to `mode: 'beyond'`.
- You can explicitly use Classic Mode: `g.server({ id: 1073741825, mode: 'classic' })`.
- Classic Mode does not allow `type: 'class'` and throws an error.
- Node availability is mode-aware; calling a mode-specific node in the wrong mode throws (for example `... is classic mode only` / `... is beyond mode only`).

## `type` (server graph subtype)

- Allowed values: `'entity' | 'status' | 'class' | 'item'`.
- Default value: `'entity'`.
- When `mode: 'classic'`, `type` must be `'entity' | 'status' | 'item'`.

## `variables` (graph variable definitions)

- Each field in `variables` becomes a graph variable and gets typed `f.get('name')` / `f.set('name', value)`.
- Supports primitives, lists, and dictionaries.
- For complex dictionary key/value shapes, prefer explicit `dict(...)` declarations.
- Common dictionary key types: `str` / `int` / `entity` / `guid` / `faction` / `config_id` / `prefab_id`.
- Dictionary value types support scalar values and list values; complex shapes such as `int -> config_id_list` and `int -> float_list_list` are supported.
- A graph can have at most 100 node graph variables (the editor limit, including the `__gsts` variables gsts generates for timers and similar); more is a compile error.

Example (excerpt):

```ts
g.server({
  id: 1073741867,
  variables: {
    d_str_entity_list: dict([{ k: 'elist', v: list('entity', new Array(3)) }]),
    d_int_config_list: dict([
      { k: 123, v: [configId(1), configId(2)] },
      { k: 345, v: [configId(3), configId(4)] }
    ]),
    d_int_float_2d: dict([
      {
        k: 123,
        v: [
          [1, 2, 3],
          [4, 5, 6]
        ]
      },
      {
        k: 345,
        v: [
          [7, 8, 9],
          [10, 11, 12]
        ]
      }
    ])
  }
})
```

For the full runnable cases:
- https://github.com/josStorer/genshin-ts/blob/master/tests/variables_definition_test.ts

### Exposing to the stage: exposed

Wrap an initial value in `exposed(...)` to expose the variable to the stage: every entity that hosts the graph can fill in its own value in the entity's node graph settings ("edit variables"). `f.get` / `f.set` stay the same.

```ts
g.server({
  id: 1073741825,
  variables: {
    damage: exposed(100n), // each entity can set its own damage
    targetGuid: exposed(guid(0)), // each entity fills in the GUID of its scene entity
    hits: 0n // internal state, not exposed
  }
}).on('whenEntityIsCreated', (_evt, f) => {
  print(str(f.get('damage')))
  print(str(entity(f.get('targetGuid'))))
})
```

- Use it when one graph is mounted on several entities that need different settings, for example two explosive barrels that share a graph but deal different damage.
- The value in code is what entities without their own value use.
- Code decides what is exposed: every injection writes the exposure settings from code, so ticking or unticking "expose" by hand in the editor is reset on the next injection.
- Re-injecting keeps the values already filled in on entities. Renaming an exposed variable or changing its type breaks the link to those values.
- The editor cannot fill in exposed entities, entity lists or dictionaries with entities, so the build warns about them. To point each entity at its own scene entity, expose a GUID variable and get the entity with `entity(guid)`.
- Since 7.2 the multilingual text tool also collects the text filled in on entities. Initial values in the graph were always collected, so exposure is not needed just for translation.

## Injection requirements

- Target graph must exist and be empty or start with `_GSTS`.
- New graphs must be saved before injection can detect them.
