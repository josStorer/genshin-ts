import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED enum coverage for SettlementStatus
// Run: npx tsx scripts/generate-enum-gia-tests.ts

g.server({ id: 1073741855 }).on('whenEntityIsCreated', (_evt, f) => {
  const e = f.getSelfEntity()
  const pe = f.getListOfPlayerEntitiesOnTheField()[0]
  const ce = f.getAllCharacterEntitiesOfSpecifiedPlayer(pe)[0]
  f.setPlayerSettlementSuccessStatus(pe, E.SettlementStatus.Undefined)
  f.setPlayerSettlementSuccessStatus(pe, E.SettlementStatus.Victory)
  f.setPlayerSettlementSuccessStatus(pe, E.SettlementStatus.Defeat)
})
