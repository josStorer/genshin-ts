import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED enum coverage for DecisionRefreshMode
// Run: npx tsx scripts/generate-enum-gia-tests.ts

g.server({ id: 1073741855 }).on('whenEntityIsCreated', (_evt, f) => {
  const e = f.getSelfEntity()
  const pe = f.getListOfPlayerEntitiesOnTheField()[0]
  const ce = f.getAllCharacterEntitiesOfSpecifiedPlayer(pe)[0]
  f.invokeDeckSelector(pe, 1n, 1.25, [1n, 2n, 3n], [1n, 2n, 3n], 1n, 1n, E.DecisionRefreshMode.CannotRefresh, 1n, 1n, [1n, 2n, 3n])
  f.invokeDeckSelector(pe, 1n, 1.25, [1n, 2n, 3n], [1n, 2n, 3n], 1n, 1n, E.DecisionRefreshMode.PartialRefresh, 1n, 1n, [1n, 2n, 3n])
  f.invokeDeckSelector(pe, 1n, 1.25, [1n, 2n, 3n], [1n, 2n, 3n], 1n, 1n, E.DecisionRefreshMode.RefreshAll, 1n, 1n, [1n, 2n, 3n])
})
