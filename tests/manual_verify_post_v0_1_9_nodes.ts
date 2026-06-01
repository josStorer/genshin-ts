import type { CharacterEntity, PlayerEntity } from 'genshin-ts/definitions/entity_helpers'
import { g } from 'genshin-ts/runtime/core'

// Manual import/export verification for nodes resolved after v0.1.9.

g.server({
  id: 1073742301,
  lang: 'en',
  mode: 'beyond'
}).on('whenEntityIsCreated', (_evt, f) => {
  const player = f.getSelfEntity() as unknown as PlayerEntity

  f.refreshNotificationQueue(player, 101n, 202n)
  f.switchCustomMaps(player, configId(303n), true)
  f.noOfTasksConfigured(player, 404n, 505n)
  f.increaseTaskCount(player, 404n, -6n)

  const taskCount = f.querySpecifiedTaskCount(player, 404n)
  const taskCompleted = f.queryIfSpecifiedTaskIsCompleted(player, 404n)

  f.printString(str(taskCount))
  f.printString(str(taskCompleted))
})

g.server({
  id: 1073742302,
  lang: 'en',
  mode: 'classic'
})
  .on('whenEntityIsCreated', (_evt, f) => {
    const player = f.getSelfEntity() as unknown as PlayerEntity
    const character = f.getSelfEntity() as unknown as CharacterEntity

    f.teleportPlayer(player, [1, 2, 3], [0, 90, 0])
    f.reviveActiveCharacter(player)
    f.setCharacterSElementalEnergy(character, 25)
    f.increasesCharacterSElementalEnergy(character, 5)
    f.checkClassicModeCharacterId(character)
    f.getActiveCharacterOfSpecifiedPlayer(player)
  })
  .on('whenTheActiveCharacterChanges', (evt, f) => {
    f.printString(f.dataTypeConversion(evt.playerEntity as unknown as PlayerEntity, 'str'))
    f.printString(
      f.dataTypeConversion(evt.previousActiveCharacterEntity as unknown as CharacterEntity, 'str')
    )
    f.printString(
      f.dataTypeConversion(evt.currentActiveCharacterEntity as unknown as CharacterEntity, 'str')
    )
  })
