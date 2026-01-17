import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED enum coverage for FollowLocationType
// Run: npx tsx scripts/generate-enum-gia-tests.ts

g.server({ id: 1073741852 }).on('whenEntityIsCreated', (_evt, f) => {
  const e = f.getSelfEntity()
  const pe = f.getListOfPlayerEntitiesOnTheField()[0]
  const ce = f.getAllCharacterEntitiesOfSpecifiedPlayer(pe)[0]
  f.switchFollowMotionDeviceTargetByGuid(e, new guid(1n), "s", [1,2,3], [1,2,3], E.FollowCoordinateSystem.RelativeCoordinateSystem, E.FollowLocationType.CompletelyFollow)
  f.switchFollowMotionDeviceTargetByGuid(e, new guid(1n), "s", [1,2,3], [1,2,3], E.FollowCoordinateSystem.RelativeCoordinateSystem, E.FollowLocationType.FollowLocation)
  f.switchFollowMotionDeviceTargetByGuid(e, new guid(1n), "s", [1,2,3], [1,2,3], E.FollowCoordinateSystem.RelativeCoordinateSystem, E.FollowLocationType.FollowRotation)
})
