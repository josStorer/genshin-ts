import * as E from 'genshin-ts/definitions/enum'
import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'

// AUTO-GENERATED: mismatch_only (literal)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741860 }).on('whenEntityIsCreated', (_evt, f) => {
  // setCustomVariable :: bool
  f.setCustomVariable(f.getSelfEntity(), '2', true, false)
  // getCustomVariable :: bool
  f.getCustomVariable(f.getSelfEntity(), '2')
  // getNodeGraphVariable :: bool
  f.getNodeGraphVariable('1')
  // sortDictionaryByKey :: dict<int, bool>
  f.sortDictionaryByKey(
    f.assemblyDictionary([
      { k: 2n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true },
      { k: 4n, v: true }
    ]),
    E.SortBy.Descending
  )
  // sortDictionaryByValue :: dict<configId, float>
  f.sortDictionaryByValue(
    f.assemblyDictionary([
      { k: new configId(2n), v: 3.25 },
      { k: new configId(4n), v: 5.25 }
    ]),
    E.SortBy.Descending
  )
  // listSorting :: float
  f.listSorting(f.assemblyList([1.25, 2.25, 3.25], 'float'), E.SortBy.Descending)
  f.settleStage()
  f.hpLoss(f.getSelfEntity(), 2.25, true, false, true, E.DamagePopUpType.NormalPopUp)
  f.switchFollowMotionDeviceTargetByGuid(
    f.getSelfEntity(),
    new guid(2n),
    '3',
    [4, 5, 6],
    [5, 6, 7],
    E.FollowCoordinateSystem.WorldCoordinateSystem,
    E.FollowLocationType.FollowLocation
  )
  f.switchFollowMotionDeviceTargetByEntity(
    f.getSelfEntity(),
    f.getSelfEntity(),
    '3',
    [4, 5, 6],
    [5, 6, 7],
    E.FollowCoordinateSystem.WorldCoordinateSystem,
    E.FollowLocationType.FollowLocation
  )
  f.mountLoopingSpecialEffect(
    new configId(1n),
    f.getSelfEntity(),
    '3',
    false,
    true,
    [6, 7, 8],
    [7, 8, 9],
    8.25,
    false
  )
  f.startTimer(f.getSelfEntity(), '2', true, f.assemblyList([4.25, 5.25, 6.25], 'float'))
  f.removeUnitStatus(
    f.getSelfEntity(),
    new configId(2n),
    E.RemovalMethod.StatusWithFastestStackLoss,
    f.getSelfEntity()
  )
  f.modifyUiControlStatusWithinTheInterfaceLayout(f.getSelfEntity(), 2n, E.UIControlGroupStatus.On)
  f.initializeCharacterSkill(f.getSelfEntity(), E.CharacterSkillSlot.Skill1E)
  f.addCharacterSkill(
    f.getSelfEntity(),
    new configId(2n),
    E.CharacterSkillSlot.Skill1E,
    E.OriginalSlotSkillHandling.Destroy
  )
  f.deleteCharacterSkillBySlot(f.getSelfEntity(), E.CharacterSkillSlot.Skill1E)
  f.setPlayerSettlementSuccessStatus(f.getSelfEntity(), E.SettlementStatus.Victory)
  f.setFactionSettlementSuccessStatus(new faction(1n), E.SettlementStatus.Victory)
  f.setInventoryDropItemsCurrencyAmount(
    f.getSelfEntity(),
    new configId(2n),
    3n,
    E.ItemLootType.IndividualizedReward
  )
  f.setLootDropContent(
    f.getSelfEntity(),
    f.assemblyDictionary([
      { k: new configId(3n), v: 4n },
      { k: new configId(5n), v: 6n }
    ])
  )
  f.setScanTagRules(f.getSelfEntity(), E.ScanRuleType.PrioritizeDistance)
  f.setChatChannelSwitch(1n, false, false)
  f.logicalNotOperation(true)
  f.roundToIntegerOperation(1.25, E.RoundingMode.RoundUp)
  f._3dVectorBackward()
  f._3dVectorZeroVector()
  f._3dVectorForward()
  f._3dVectorUp()
  f._3dVectorDown()
  f._3dVectorRight()
  f._3dVectorLeft()
  f.pi()
  // getCorrespondingValueFromList :: bool
  f.getCorrespondingValueFromList(f.assemblyList([true, false, true], 'bool'), 2n)
  f.getSpecifiedTypeOfEntitiesOnTheField(E.EntityType.Object)
  f.getEntityListBySpecifiedType(
    f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], 'entity'),
    E.EntityType.Object
  )
  f.queryCharacterSkill(f.getSelfEntity(), E.CharacterSkillSlot.Skill1E)
  f.getPlayerRankScoreChange(f.getSelfEntity(), E.SettlementStatus.Victory)
  f.queryCorrespondingGiftBoxQuantity(f.getSelfEntity(), 1n)
  f.queryCorrespondingGiftBoxConsumption(f.getSelfEntity(), 1n)
})
