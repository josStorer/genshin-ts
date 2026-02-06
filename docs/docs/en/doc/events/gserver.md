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

Injection requirements:
- Target graph must exist and be empty or start with `_GSTS`.
- New graphs must be saved before injection can detect them.
