import * as E from 'genshin-ts/definitions/enum'
import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'

// AUTO-GENERATED: classic (literal)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741849, mode: 'classic' }).on('whenEntityIsCreated', (_evt, f) => {
  f.teleportPlayer(f.getSelfEntity(), [2, 3, 4], [3, 4, 5])
  f.reviveActiveCharacter(f.getSelfEntity())
  f.setCharacterSElementalEnergy(f.getSelfEntity(), 2.25)
  f.increasesCharacterSElementalEnergy(f.getSelfEntity(), 2.25)
  const classicCharacterMatches = f.checkClassicModeCharacterId(f.getSelfEntity())
  const classicCharacterMatchesText = f.dataTypeConversion(classicCharacterMatches, 'str')
  f.printString(classicCharacterMatchesText)
  const activeCharacter = f.getActiveCharacterOfSpecifiedPlayer(f.getSelfEntity())
  const activeCharacterText = f.dataTypeConversion(activeCharacter, 'str')
  f.printString(activeCharacterText)
})
