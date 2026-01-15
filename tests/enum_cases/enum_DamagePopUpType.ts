import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED enum coverage for DamagePopUpType
// Run: npx tsx scripts/generate-enum-gia-tests.ts

g.server({ id: 1073741850 }).on('whenEntityIsCreated', (_evt, f) => {
  const e = f.getSelfEntity()
  const pe = f.getListOfPlayerEntitiesOnTheField()[0]
  const ce = f.getAllCharacterEntitiesOfSpecifiedPlayer(pe)[0]
  f.hpLoss(e, 1.25, true, true, true, E.DamagePopUpType.NoPopUp)
  f.hpLoss(e, 1.25, true, true, true, E.DamagePopUpType.NormalPopUp)
  f.hpLoss(e, 1.25, true, true, true, E.DamagePopUpType.CritHitPopUp)
})
