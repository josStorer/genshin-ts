import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED enum coverage for FixedMotionParameterType
// Run: npx tsx scripts/generate-enum-gia-tests.ts

g.server({ id: 1073741851 }).on('whenEntityIsCreated', (_evt, f) => {
  const e = f.getSelfEntity()
  const pe = f.getListOfPlayerEntitiesOnTheField()[0]
  const ce = f.getAllCharacterEntitiesOfSpecifiedPlayer(pe)[0]
  f.activateFixedPointMotionDevice(e, "s", E.MovementMode.InstantMovement, 1.25, [1,2,3], [1,2,3], true, E.FixedMotionParameterType.FixedSpeed, 1.25)
  f.activateFixedPointMotionDevice(e, "s", E.MovementMode.InstantMovement, 1.25, [1,2,3], [1,2,3], true, E.FixedMotionParameterType.FixedTime, 1.25)
})
