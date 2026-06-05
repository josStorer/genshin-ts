# Global Cheat Sheet

## Logging
- `print(str(...))`
- `console.log(x)` (single arg)
- `f.printString(...)`

## Type helpers
- `raw(...)` (skip compiler translation)
- `bool/int/float/str` (`int(123)` allowed, `123n` preferred)
- `vec3/guid/prefabId/configId/faction/entity` (typed literals; `entity(0)` / `entity(null)` placeholders)

## Collections
- `list(t, items)` / `list(t, 0)` placeholder
- `dict(k, v, 0)` placeholder

## Scene and entities
- `player(1)` / `stage` / `level` / `self`
- `GameObject.Find(...)`

## Other
- `Math` / `Mathf` / `Vector3` / `Random`
- `send('signal')` / `send(Signal.xxx, ...)` + `onSignal(Signal.xxx, ...)`
- `setTimeout` / `setInterval` / `clearTimeout` / `clearInterval`
