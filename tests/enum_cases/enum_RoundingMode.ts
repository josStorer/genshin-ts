import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED enum coverage for RoundingMode
// Run: npx tsx scripts/generate-enum-gia-tests.ts

g.server({ id: 1073741857 }).on('whenEntityIsCreated', (_evt, f) => {
  const e = f.getSelfEntity()
  const pe = f.getListOfPlayerEntitiesOnTheField()[0]
  const ce = f.getAllCharacterEntitiesOfSpecifiedPlayer(pe)[0]
  f.roundToIntegerOperation(1.25, E.RoundingMode.RoundToNearest)
  f.roundToIntegerOperation(1.25, E.RoundingMode.RoundUp)
  f.roundToIntegerOperation(1.25, E.RoundingMode.RoundDown)
  f.roundToIntegerOperation(1.25, E.RoundingMode.Truncate)
})
