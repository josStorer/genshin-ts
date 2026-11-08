# Signals

Signals are custom stage-wide events. Define the signal in the editor signal manager before using it; injection fails when a generated graph references a signal that does not exist in the map.

## Basic Usage

String-based usage is still supported. It is useful for no-parameter signals or code that does not need type hints:

```ts
import { g } from 'genshin-ts/runtime/core'

g.server({ id: 1073741825 }).on('whenEntityIsCreated', (_evt, f) => {
  f.sendSignal('ready')
})

g.server({ id: 1073741826 }).onSignal('ready', (_evt, f) => {
  f.printString('ready')
})
```

The global helper can also send a signal:

```ts
send('ready')
```

## Using Extracted Signal Definitions

When `inject` is configured, the compiler extracts signal definitions from the map into `src/resources/signals.ts`. Import `Signal` from that file to get typed parameters for both `sendSignal` and `onSignal`.

```ts
import { g } from 'genshin-ts/runtime/core'
import { Signal } from './resources/signals'

g.server({ id: 1073741825 }).on('whenEntityIsCreated', (_evt, f) => {
  f.sendSignal(Signal.signal_param_literal, 7n, 'ready', true)
})

g.server({ id: 1073741826 }).onSignal(Signal.signal_param_literal, (evt, f) => {
  const amount = evt.params.参数_1
  const label = evt.params.参数_2
  const enabled = evt.params.参数_3

  f.printString(f.dataTypeConversion(amount, 'str'))
  f.printString(label)
  f.printString(f.dataTypeConversion(enabled, 'str'))
})
```

`Signal.xxx` carries the signal name, parameter names, and parameter types. TypeScript checks the argument count and types when sending, and `evt.params.<paramName>` exposes typed parameters when listening.

## Literal and Wired Parameters

Signal parameters can mix literal values and wired node outputs:

```ts
g.server({ id: 1073741825 }).on('whenEntityIsCreated', (_evt, f) => {
  const amount = f.addition(2n, 3n)
  f.sendSignal(Signal.signal_param_literal, amount, 'ready', true)
})
```

In this example, the first parameter is a node output and the other two are literals. The compiler writes all of them to the corresponding parameter pins on the same send-signal node.

## Sending to client Lua scripts {#to-lua}

`f.sendSignal` and `send` only reach node graphs; client Lua scripts never receive them. To reach Lua, use the Send Client Scripted Server Signal node added in 7.2:

```ts
g.server({ id: 1073741825 }).onSignal(Signal.PlayerAction, (evt, f) => {
  // Send to player 1
  sendLua(player(1), Signal.ScoreChanged, 20n, true)
  // Send to every player on the field
  sendLuaAll(Signal.ScoreChanged, 20n, true)
})
```

- `sendLua(player, signal, ...params)` sends to one player, and every client Lua script mounted on that player receives it. You can also write `player.sendLua(signal, ...params)` or `f.sendClientScriptedServerSignal(...)`.
- `sendLuaAll(signal, ...params)` loops over Get List of Player Entities on the Field and sends to each player.
- Register the signal in the signal manager first, as usual. Parameters must use types that Lua can receive; faction is not supported.
- The target must be a player entity, such as `player(index)` or an element of the on-field player list. The Signal Source Entity of a signal sent from Lua cannot be used as the target (nothing arrives); to reply to the sender, have the client include something that identifies it in the parameters.
- Lua receives it with `lua.onSignal`; see [Client Lua: signals and subscriptions](../lua.md#signals).

## Notes

- A stage can have at most 99 signals.
- `Signal.xxx` comes from the extracted map data; after editing signals in the editor, save the map first, then rerun compilation to extract the updated signal information.
- String-based usage does not provide parameter names or parameter type hints.
