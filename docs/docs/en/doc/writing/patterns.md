# Common Patterns

## Conditions and types
- Use `bool(...)` for conditions.
- `number` -> float, `bigint` -> int.

## Lists and dicts
- Use `list(t, [])` for empty lists.
- Use `list(t, 0)` / `list(t, null)` or `dict(k, v, 0)` as typed placeholders that keep pins unconnected.
- Use `list(0)` / `list(null)` / `dict(0)` / `dict(null)` only when the target pin can infer the type.
- `dict(...)` is read-only; use graph variables for writable dicts.

## Custom variables {#custom-variables}
- Only variables configured in the entity's Custom Variable component are synced to the client (official docs). A variable created at run time with `setCustomVariable` is not synced and Lua cannot read it, while changes to configured variables reach Lua without any signal (both checked in game).
- Editing a list or dictionary held in a custom variable in place (for example `push`) changes the variable directly but does not trigger On Custom Variable Change; when the event is needed, write it back afterwards with `f.setCustomVariable(entity, name, list, true)`.
- Float custom variables keep a precision of 0.0001.
- When `setCustomVariable` is called without Trigger Event, gsts passes False, while the editor default is True.

## Entity placeholders
- `entity(0)` / `entity(null)` keeps entity pins unconnected (empty).

## Debug output
- Prefer `print(str(...))` or `console.log(x)` (single arg).
