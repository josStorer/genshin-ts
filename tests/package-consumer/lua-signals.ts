import type { CharacterEntity, PlayerEntity } from 'genshin-ts/definitions/entity_helpers'
import type { ServerExecutionFlowFunctions } from 'genshin-ts/definitions/nodes'
import { defineSignal } from 'genshin-ts/runtime/core'

const valid = defineSignal('LuaTyped', [
  ['count', 'int'],
  ['names', 'str_list']
])
const faction = defineSignal('GraphOnly', [['team', 'faction']])
const unknown = defineSignal('Unknown', [['value', 'unknown']])

export function checkLuaSignals(
  f: ServerExecutionFlowFunctions,
  player: PlayerEntity,
  character: CharacterEntity
) {
  f.sendClientScriptedServerSignal(player, valid, 1n, ['a'])
  player.sendLua(valid, 1n, [])
  player.sendClientScriptedServerSignal(valid, 1n, [])
  // @ts-expect-error Lua cannot receive faction parameters.
  f.sendClientScriptedServerSignal(player, faction, 1n)
  // @ts-expect-error Lua definitions must declare concrete supported types.
  player.sendLua(unknown, 1n)
  // @ts-expect-error Parameters retain the signal definition's types.
  player.sendLua(valid, 'wrong', [])
  // @ts-expect-error Signal parameter count is checked.
  player.sendLua(valid, 1n)
  // @ts-expect-error Lua downlink targets players, not characters.
  character.sendLua(valid, 1n, [])
}
