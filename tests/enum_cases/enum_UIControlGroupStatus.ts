import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED enum coverage for UIControlGroupStatus
// Run: npx tsx scripts/generate-enum-gia-tests.ts

g.server({ id: 1073741853 }).on('whenEntityIsCreated', (_evt, f) => {
  const e = f.getSelfEntity()
  const pe = f.getListOfPlayerEntitiesOnTheField()[0]
  const ce = f.getAllCharacterEntitiesOfSpecifiedPlayer(pe)[0]
  f.modifyUiControlStatusWithinTheInterfaceLayout(pe, 1n, E.UIControlGroupStatus.Off)
  f.modifyUiControlStatusWithinTheInterfaceLayout(pe, 1n, E.UIControlGroupStatus.On)
  f.modifyUiControlStatusWithinTheInterfaceLayout(pe, 1n, E.UIControlGroupStatus.Hidden)
})
