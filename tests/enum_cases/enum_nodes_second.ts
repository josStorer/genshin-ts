import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// Enum param test: all enum arguments use the 2nd value.

g.server({ id: 1073741862 }).on('whenEntityIsCreated', (_evt, f) => {
  // sortDictionaryByKey :: dict<int, bool>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: 2n, v: true }, { k: 4n, v: true }]), E.SortBy.Descending)
  // sortDictionaryByValue :: dict<configId, float>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: new configId(2n), v: 3.25 }, { k: new configId(4n), v: 5.25 }]), E.SortBy.Descending)
  // listSorting :: float
  f.listSorting(f.assemblyList([1.25, 2.25, 3.25], "float"), E.SortBy.Descending)
  f.hpLoss(f.getSelfEntity(), 2.25, true, false, true, E.DamagePopUpType.NormalPopUp)
  f.activateFixedPointMotionDevice(f.getSelfEntity(), "2", E.MovementMode.UniformLinearMotion, 3.25, [4, 5, 6], [5, 6, 7], false, E.FixedMotionParameterType.FixedTime, 7.25)
  f.switchFollowMotionDeviceTargetByGuid(f.getSelfEntity(), new guid(2n), "3", [4, 5, 6], [5, 6, 7], E.FollowCoordinateSystem.WorldCoordinateSystem, E.FollowLocationType.FollowLocation)
  f.switchFollowMotionDeviceTargetByEntity(f.getSelfEntity(), f.getSelfEntity(), "3", [4, 5, 6], [5, 6, 7], E.FollowCoordinateSystem.WorldCoordinateSystem, E.FollowLocationType.FollowLocation)
  f.removeUnitStatus(f.getSelfEntity(), new configId(2n), E.RemovalMethod.StatusWithFastestStackLoss, f.getSelfEntity())
  f.modifyUiControlStatusWithinTheInterfaceLayout(f.getSelfEntity(), 2n, E.UIControlGroupStatus.On)
  f.modifySkillCdPercentageBasedOnMaxCd(f.getSelfEntity(), E.CharacterSkillSlot.Skill1E, 2.25, true)
  f.initializeCharacterSkill(f.getSelfEntity(), E.CharacterSkillSlot.Skill1E)
  f.setCharacterSkillCd(f.getSelfEntity(), E.CharacterSkillSlot.Skill1E, 2.25, true)
  f.addCharacterSkill(
    f.getSelfEntity(),
    new configId(2n),
    E.CharacterSkillSlot.Skill1E,
    E.OriginalSlotSkillHandling.Destroy
  )
  f.modifyCharacterSkillCd(f.getSelfEntity(), E.CharacterSkillSlot.Skill1E, 2.25, true)
  f.deleteCharacterSkillBySlot(f.getSelfEntity(), E.CharacterSkillSlot.Skill1E)
  f.addSoundEffectPlayer(f.getSelfEntity(), 2n, 3n, 4.25, true, 6.25, true, 8.25, E.SoundAttenuationMode.FastThenSlow, "9", [10, 11, 12])
  f.invokeDeckSelector(f.getSelfEntity(), 2n, 3.25, f.assemblyList([4n, 5n, 6n], "int"), f.assemblyList([5n, 6n, 7n], "int"), 6n, 7n, E.DecisionRefreshMode.PartialRefresh, 8n, 9n, f.assemblyList([10n, 11n, 12n], "int"))
  f.setPlayerSettlementSuccessStatus(f.getSelfEntity(), E.SettlementStatus.Victory)
  f.setFactionSettlementSuccessStatus(new faction(1n), E.SettlementStatus.Victory)
  f.setInventoryItemDropContents(f.getSelfEntity(), f.assemblyDictionary([{ k: new configId(3n), v: 4n }, { k: new configId(5n), v: 6n }]), E.ItemLootType.IndividualizedReward)
  f.setInventoryDropItemsCurrencyAmount(f.getSelfEntity(), new configId(2n), 3n, E.ItemLootType.IndividualizedReward)
  f.triggerLootDrop(f.getSelfEntity(), E.ItemLootType.IndividualizedReward)
  f.setScanTagRules(f.getSelfEntity(), E.ScanRuleType.PrioritizeDistance)
  f.setPlayerRankScoreChange(f.getSelfEntity(), E.SettlementStatus.Victory, 2n)
  f.roundToIntegerOperation(1.25, E.RoundingMode.RoundUp)
  f.getSpecifiedTypeOfEntitiesOnTheField(E.EntityType.Object)
  f.getEntityListBySpecifiedType(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), E.EntityType.Object)
  f.queryCharacterSkill(f.getSelfEntity(), E.CharacterSkillSlot.Skill1E)
  f.getPlayerRankScoreChange(f.getSelfEntity(), E.SettlementStatus.Victory)
})
