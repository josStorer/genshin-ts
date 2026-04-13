import * as E from 'genshin-ts/definitions/enum'
import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'

// AUTO-GENERATED: mismatch_only (wire)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741861 }).on('whenEntityIsCreated', (_evt, f) => {
  const e = f.getSelfEntity()
  const vInt = f.addition(1n, 2n)
  const vFloat = f.pi()
  const vBool = f.equal(1n, 1n)
  const vGuid = f.queryGuidByEntity(e)
  const vFaction = f.queryEntityFaction(e)
  const vVec3 = f.create3dVector(1, 2, 3)
  const vStr = f.dataTypeConversion(1n, 'str')
  const vConfig = f.queryPlayerClass(e)
  // setCustomVariable :: bool
  f.setCustomVariable(e, vStr, vBool, vBool)
  // getCustomVariable :: bool
  f.getCustomVariable(e, vStr)
  // getNodeGraphVariable :: bool
  f.getNodeGraphVariable(vStr)
  // sortDictionaryByKey :: dict<int, bool>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vBool }]), E.SortBy.Descending)
  // sortDictionaryByValue :: dict<configId, float>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: vConfig, v: vFloat }]), E.SortBy.Descending)
  // listSorting :: float
  f.listSorting(f.assemblyList([vFloat, vFloat, vFloat], 'float'), E.SortBy.Descending)
  f.settleStage()
  f.hpLoss(e, vFloat, vBool, vBool, vBool, E.DamagePopUpType.NormalPopUp)
  f.switchFollowMotionDeviceTargetByGuid(
    e,
    vGuid,
    vStr,
    vVec3,
    vVec3,
    E.FollowCoordinateSystem.WorldCoordinateSystem,
    E.FollowLocationType.FollowLocation
  )
  f.switchFollowMotionDeviceTargetByEntity(
    e,
    e,
    vStr,
    vVec3,
    vVec3,
    E.FollowCoordinateSystem.WorldCoordinateSystem,
    E.FollowLocationType.FollowLocation
  )
  f.mountLoopingSpecialEffect(vConfig, e, vStr, vBool, vBool, vVec3, vVec3, vFloat, vBool)
  f.startTimer(e, vStr, vBool, f.assemblyList([vFloat, vFloat, vFloat], 'float'))
  f.removeUnitStatus(e, vConfig, E.RemovalMethod.StatusWithFastestStackLoss, e)
  f.modifyUiControlStatusWithinTheInterfaceLayout(e, vInt, E.UIControlGroupStatus.On)
  f.initializeCharacterSkill(e, E.CharacterSkillSlot.Skill1E)
  f.addCharacterSkill(e, vConfig, E.CharacterSkillSlot.Skill1E, E.OriginalSlotSkillHandling.Destroy)
  f.deleteCharacterSkillBySlot(e, E.CharacterSkillSlot.Skill1E)
  f.setPlayerSettlementSuccessStatus(e, E.SettlementStatus.Victory)
  f.setFactionSettlementSuccessStatus(vFaction, E.SettlementStatus.Victory)
  f.setInventoryDropItemsCurrencyAmount(e, vConfig, vInt, E.ItemLootType.IndividualizedReward)
  f.setLootDropContent(e, f.assemblyDictionary([{ k: vConfig, v: vInt }]))
  f.setScanTagRules(e, E.ScanRuleType.PrioritizeDistance)
  f.setChatChannelSwitch(vInt, vBool, vBool)
  f.logicalNotOperation(vBool)
  f.roundToIntegerOperation(vFloat, E.RoundingMode.RoundUp)
  f._3dVectorBackward()
  f._3dVectorZeroVector()
  f._3dVectorForward()
  f._3dVectorUp()
  f._3dVectorDown()
  f._3dVectorRight()
  f._3dVectorLeft()
  f.pi()
  // getCorrespondingValueFromList :: bool
  f.getCorrespondingValueFromList(f.assemblyList([vBool, vBool, vBool], 'bool'), vInt)
  f.getSpecifiedTypeOfEntitiesOnTheField(E.EntityType.Object)
  f.getEntityListBySpecifiedType(f.assemblyList([e, e, e], 'entity'), E.EntityType.Object)
  f.queryCharacterSkill(e, E.CharacterSkillSlot.Skill1E)
  f.getPlayerRankScoreChange(e, E.SettlementStatus.Victory)
  f.queryCorrespondingGiftBoxQuantity(e, vInt)
  f.queryCorrespondingGiftBoxConsumption(e, vInt)
})
