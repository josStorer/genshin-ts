import type { PlayerEntity } from 'genshin-ts/definitions/entity_helpers'
import { g } from 'genshin-ts/runtime/core'

// Manual import/export verification for nodes whose signatures changed in the
// refreshed node definitions.

g.server({
  id: 1073742310,
  lang: 'en',
  mode: 'beyond'
}).on('whenEntityIsCreated', (_evt, f) => {
  const player = f.getSelfEntity() as unknown as PlayerEntity

  const consumed = f.consumeGiftBox(player, 1n, 1n)
  const advancedAttr = f.getEntityAdvancedAttribute(player)

  f.printString(f.dataTypeConversion(consumed, 'str'))
  f.printString(f.dataTypeConversion(advancedAttr.beyondModeShieldStrength, 'str'))
  f.printString(f.dataTypeConversion(advancedAttr.classicModeShieldStrength, 'str'))
})
