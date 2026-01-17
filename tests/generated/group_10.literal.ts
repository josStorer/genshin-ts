import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_10 (literal)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741839 }).on('whenEntityIsCreated', (_evt, f) => {
  // setPlayerSettlementScoreboardDataDisplay :: float
  f.setPlayerSettlementScoreboardDataDisplay(f.getListOfPlayerEntitiesOnTheField()[0], 2n, "3", 4.25)
  // setPlayerSettlementScoreboardDataDisplay :: int
  f.setPlayerSettlementScoreboardDataDisplay(f.getListOfPlayerEntitiesOnTheField()[0], 6n, "7", 8n)
  // setPlayerSettlementScoreboardDataDisplay :: str
  f.setPlayerSettlementScoreboardDataDisplay(f.getListOfPlayerEntitiesOnTheField()[0], 10n, "11", "12")
})

