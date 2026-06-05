import * as E from 'genshin-ts/definitions/enum'
import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'

// AUTO-GENERATED: final all nodes/events
// Run: npx tsx scripts/generate-final-gia-test.ts

g.server({ id: 1073741866, name: 'my_final_test' }).on('whenEntityIsCreated', (evt, f) => {
  const evtS1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(evtS1)
  const evtS2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(evtS2)
  // dataTypeConversion :: dict<bool, int>
  const ret2 = f.dataTypeConversion(true, 'int')
  const s3 = f.dataTypeConversion(ret2, 'str')
  f.printString(s3)
  // equal :: bool
  const ret6 = f.equal(false, true)
  const s7 = f.dataTypeConversion(ret6, 'str')
  f.printString(s7)
  // enumerationsEqual :: e<10>
  const ret8 = f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  const s9 = f.dataTypeConversion(ret8, 'str')
  f.printString(s9)
  // assemblyList :: bool
  const ret11 = f.assemblyList(f.assemblyList([false, true, false], 'bool'), 'bool')
  const len12 = f.getListLength(ret11)
  const s13 = f.dataTypeConversion(len12, 'str')
  f.printString(s13)
  const ret14 = f.emptyList('int')
  const len15 = f.getListLength(ret14)
  const s16 = f.dataTypeConversion(len15, 'str')
  f.printString(s16)
  const ret17 = f.emptyLocalVariableList('int')
  f.setLocalVariable(ret17.localVariable, ret17.value)
  // assemblyDictionary :: dict<configId, bool>
  const ret22 = f.assemblyDictionary([
    { k: new configId(18n), v: true },
    { k: new configId(20n), v: true }
  ])
  const len23 = f.queryDictionarySLength(ret22)
  const s24 = f.dataTypeConversion(len23, 'str')
  f.printString(s24)
  // setCustomVariable :: bool
  f.setCustomVariable(f.getSelfEntity(), '26', true, false)
  // getCustomVariable :: bool
  const ret31 = f.getCustomVariable(f.getSelfEntity(), '30')
  const gen32 = ret31.asType('int')
  const s33 = f.dataTypeConversion(gen32, 'str')
  f.printString(s33)
  // setNodeGraphVariable :: bool
  f.setNodeGraphVariable('34', true, false)
  // getNodeGraphVariable :: bool
  const ret38 = f.getNodeGraphVariable('37')
  const gen39 = ret38.asType('int')
  const s40 = f.dataTypeConversion(gen39, 'str')
  f.printString(s40)
  const lv41 = f.getLocalVariable(1n)
  const s42 = f.dataTypeConversion(lv41.value, 'str')
  f.printString(s42)
  // setLocalVariable :: bool
  f.setLocalVariable(lv41.localVariable, true)
  const ret46 = f.initLocalVariable('float', 45)
  f.setLocalVariable(ret46.localVariable, ret46.value)
  // getLocalVariable :: bool
  const ret48 = f.getLocalVariable(true)
  f.setLocalVariable(ret48.localVariable, ret48.value)
  // queryDictionaryValueByKey :: dict<configId, bool>
  const ret55 = f.queryDictionaryValueByKey(
    f.assemblyDictionary([
      { k: new configId(50n), v: true },
      { k: new configId(52n), v: true }
    ]),
    new configId(54n)
  )
  const s56 = f.dataTypeConversion(ret55, 'str')
  f.printString(s56)
  // createDictionary :: dict<configId, bool>
  const ret59 = f.createDictionary(
    f.assemblyList([57n, 58n, 59n], 'config_id'),
    f.assemblyList([false, true, false], 'bool')
  )
  const len60 = f.queryDictionarySLength(ret59)
  const s61 = f.dataTypeConversion(len60, 'str')
  f.printString(s61)
  // queryIfDictionaryContainsSpecificValue :: dict<configId, bool>
  const ret68 = f.queryIfDictionaryContainsSpecificValue(
    f.assemblyDictionary([
      { k: new configId(63n), v: false },
      { k: new configId(65n), v: false }
    ]),
    true
  )
  const s69 = f.dataTypeConversion(ret68, 'str')
  f.printString(s69)
  // getListOfValuesFromDictionary :: dict<configId, bool>
  const ret75 = f.getListOfValuesFromDictionary(
    f.assemblyDictionary([
      { k: new configId(71n), v: false },
      { k: new configId(73n), v: false }
    ])
  )
  const len76 = f.getListLength(ret75)
  const s77 = f.dataTypeConversion(len76, 'str')
  f.printString(s77)
  // sortDictionaryByKey :: dict<int, bool>
  const ret83 = f.sortDictionaryByKey(
    f.assemblyDictionary([
      { k: 79n, v: false },
      { k: 81n, v: false }
    ]),
    E.SortBy.Ascending
  )
  const len84 = f.getListLength(ret83.keyList)
  const s85 = f.dataTypeConversion(len84, 'str')
  f.printString(s85)
  const len86 = f.getListLength(ret83.valueList)
  const s87 = f.dataTypeConversion(len86, 'str')
  f.printString(s87)
  // sortDictionaryByValue :: dict<configId, float>
  const ret93 = f.sortDictionaryByValue(
    f.assemblyDictionary([
      { k: new configId(89n), v: 90.25 },
      { k: new configId(91n), v: 92.25 }
    ]),
    E.SortBy.Ascending
  )
  const len94 = f.getListLength(ret93.keyList)
  const s95 = f.dataTypeConversion(len94, 'str')
  f.printString(s95)
  const len96 = f.getListLength(ret93.valueList)
  const s97 = f.dataTypeConversion(len96, 'str')
  f.printString(s97)
  // f.breakLoop(98n, 99n, 100n)
  f.finiteLoop(101n, 102n, () => {
    f.printString('literal_cb_finiteLoop_2')
  })
  // listIterationLoop :: bool
  f.listIterationLoop(f.assemblyList([true, false, true], 'bool'), () => {
    f.printString('literal_cb_listIterationLoop_1')
  })
  // multipleBranches :: int
  f.multipleBranches(104n, {
    1: () => {
      f.printString('literal_b1_multipleBranches_1')
    },
    default: () => {
      f.printString('literal_bd_multipleBranches_1')
    }
  })
  f.doubleBranch(
    true,
    () => {
      f.printString('literal_cb_doubleBranch_1')
    },
    () => {
      f.printString('literal_cb_doubleBranch_2')
    }
  )
  f.printString('106')
  f.forwardingEvent(f.getSelfEntity())
  // insertValueIntoList :: bool
  f.insertValueIntoList(f.assemblyList([false, true, false], 'bool'), 109n, false)
  // modifyValueInList :: bool
  f.modifyValueInList(f.assemblyList([true, false, true], 'bool'), 112n, true)
  // removeValueFromList :: bool
  f.removeValueFromList(f.assemblyList([false, true, false], 'bool'), 115n)
  // listSorting :: float
  f.listSorting(f.assemblyList([116.25, 117.25, 118.25], 'float'), E.SortBy.Ascending)
  // concatenateList :: bool
  f.concatenateList(
    f.assemblyList([true, false, true], 'bool'),
    f.assemblyList([false, true, false], 'bool')
  )
  // clearList :: bool
  f.clearList(f.assemblyList([true, false, true], 'bool'))
  f.setPresetStatus(f.getSelfEntity(), 121n, 122n)
  f.createEntity(new guid(123n), f.assemblyList([124n, 125n, 126n], 'int'))
  const ret132 = f.createPrefab(
    new prefabId(125n),
    [126, 127, 128],
    [127, 128, 129],
    f.getSelfEntity(),
    true,
    130n,
    f.assemblyList([131n, 132n, 133n], 'int')
  )
  const s133 = f.dataTypeConversion(ret132, 'str')
  f.printString(s133)
  const ret141 = f.createPrefabGroup(
    134n,
    [135, 136, 137],
    [136, 137, 138],
    f.getSelfEntity(),
    138n,
    f.assemblyList([139n, 140n, 141n], 'int'),
    false
  )
  const len142 = f.getListLength(ret141)
  const s143 = f.dataTypeConversion(len142, 'str')
  f.printString(s143)
  f.activateDisableModelDisplay(f.getSelfEntity(), true)
  f.destroyEntity(f.getSelfEntity())
  f.removeEntity(f.getSelfEntity())
  f.settleStage()
  f.setCurrentEnvironmentTime(148.25)
  f.setEnvironmentTimePassageSpeed(149.25)
  f.modifyEntityFaction(f.getSelfEntity(), new faction(151n))
  f.teleportPlayer(f.getSelfEntity(), [153, 154, 155], [154, 155, 156])
  f.reviveCharacter(f.getSelfEntity())
  f.reviveAllPlayerSCharacters(f.getSelfEntity(), true)
  f.defeatAllPlayerSCharacters(f.getSelfEntity())
  f.activateRevivePoint(f.getSelfEntity(), 160n)
  f.setPlayerReviveTime(f.getSelfEntity(), 162n)
  f.setPlayerRemainingRevives(f.getSelfEntity(), 164n)
  f.modifyEnvironmentSettings(
    165n,
    f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], 'entity'),
    false,
    169n
  )
  f.allowForbidPlayerToRevive(f.getSelfEntity(), true)
  f.deactivateRevivePoint(f.getSelfEntity(), 173n)
  f.activateDisableExtraCollision(f.getSelfEntity(), 175n, false)
  f.activateDisableExtraCollisionClimbability(f.getSelfEntity(), 178n, true)
  f.activateDisableNativeCollision(f.getSelfEntity(), true)
  f.activateDisableNativeCollisionClimbability(f.getSelfEntity(), true)
  f.activateDisableCollisionTrigger(f.getSelfEntity(), 185n, false)
  f.initiateAttack(
    f.getSelfEntity(),
    188.25,
    189.25,
    [190, 191, 192],
    [191, 192, 193],
    '192',
    true,
    f.getSelfEntity()
  )
  f.recoverHp(f.getSelfEntity(), 196.25, '197', false, f.getSelfEntity())
  f.hpLoss(f.getSelfEntity(), 201.25, false, true, false, E.DamagePopUpType.NoPopUp)
  f.recoverHpDirectly(
    f.getSelfEntity(),
    f.getSelfEntity(),
    207.25,
    false,
    209.25,
    210.25,
    f.assemblyList(['211', '212', '213'], 'str')
  )
  f.recoverBasicMotionDevice(f.getSelfEntity(), '213')
  f.activateFixedPointMotionDevice(
    f.getSelfEntity(),
    '215',
    E.MovementMode.InstantMovement,
    216.25,
    [217, 218, 219],
    [218, 219, 220],
    true,
    E.FixedMotionParameterType.FixedSpeed,
    220.25
  )
  f.activateBasicMotionDevice(f.getSelfEntity(), '222')
  f.addTargetOrientedRotationBasedMotionDevice(f.getSelfEntity(), '224', 225.25, [226, 227, 228])
  f.addUniformBasicLinearMotionDevice(f.getSelfEntity(), '228', 229.25, [230, 231, 232])
  f.addUniformBasicRotationBasedMotionDevice(
    f.getSelfEntity(),
    '232',
    233.25,
    234.25,
    [235, 236, 237]
  )
  f.stopAndDeleteBasicMotionDevice(f.getSelfEntity(), '237', false)
  f.pauseBasicMotionDevice(f.getSelfEntity(), '240')
  f.activateDisableFollowMotionDevice(f.getSelfEntity(), false)
  f.switchFollowMotionDeviceTargetByGuid(
    f.getSelfEntity(),
    new guid(244n),
    '245',
    [246, 247, 248],
    [247, 248, 249],
    E.FollowCoordinateSystem.RelativeCoordinateSystem,
    E.FollowLocationType.CompletelyFollow
  )
  f.switchFollowMotionDeviceTargetByEntity(
    f.getSelfEntity(),
    f.getSelfEntity(),
    '250',
    [251, 252, 253],
    [252, 253, 254],
    E.FollowCoordinateSystem.RelativeCoordinateSystem,
    E.FollowLocationType.CompletelyFollow
  )
  const ret261 = f.createProjectile(
    new prefabId(253n),
    [254, 255, 256],
    [255, 256, 257],
    f.getSelfEntity(),
    f.getSelfEntity(),
    false,
    259n,
    f.assemblyList([260n, 261n, 262n], 'int')
  )
  const s262 = f.dataTypeConversion(ret261, 'str')
  f.printString(s262)
  f.playTimedEffects(
    new configId(263n),
    f.getSelfEntity(),
    '265',
    false,
    true,
    [268, 269, 270],
    [269, 270, 271],
    270.25,
    true
  )
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(f.getSelfEntity(), new configId(273n))
  const ret283 = f.mountLoopingSpecialEffect(
    new configId(274n),
    f.getSelfEntity(),
    '276',
    true,
    false,
    [279, 280, 281],
    [280, 281, 282],
    281.25,
    false
  )
  const s284 = f.dataTypeConversion(ret283, 'str')
  f.printString(s284)
  f.clearLoopingSpecialEffect(285n, f.getSelfEntity())
  f.resumeTimer(f.getSelfEntity(), '288')
  f.startTimer(f.getSelfEntity(), '290', true, f.assemblyList([292.25, 293.25, 294.25], 'float'))
  f.pauseTimer(f.getSelfEntity(), '294')
  f.stopTimer(f.getSelfEntity(), '296')
  f.recoverGlobalTimer(f.getSelfEntity(), '298')
  f.startGlobalTimer(f.getSelfEntity(), '300')
  f.modifyGlobalTimer(f.getSelfEntity(), '302', 303.25)
  f.pauseGlobalTimer(f.getSelfEntity(), '305')
  f.stopGlobalTimer(f.getSelfEntity(), '307')
  f.switchMainCameraTemplate(
    f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], 'entity'),
    '310'
  )
  f.modifyingCharacterDisruptorDevice(f.getSelfEntity(), 312n)
  const ret322 = f.addUnitStatus(
    f.getSelfEntity(),
    f.getSelfEntity(),
    new configId(315n),
    316n,
    f.assemblyDictionary([
      { k: '318', v: 319.25 },
      { k: '320', v: 321.25 }
    ])
  )
  const enumEq323 = f.enumerationsEqual(ret322.applicationResult, ret322.applicationResult)
  const s324 = f.dataTypeConversion(enumEq323, 'str')
  f.printString(s324)
  const s325 = f.dataTypeConversion(ret322.slotId, 'str')
  f.printString(s325)
  f.removeUnitStatus(
    f.getSelfEntity(),
    new configId(327n),
    E.RemovalMethod.AllCoexistingStatusesWithTheSameName,
    f.getSelfEntity()
  )
  f.activateDisableTab(f.getSelfEntity(), 330n, true)
  f.activateDisableCollisionTriggerSource(f.getSelfEntity(), true)
  f.changePlayerSCurrentClassLevel(f.getSelfEntity(), 335n)
  f.changePlayerClass(f.getSelfEntity(), new configId(337n), E.ExistingSkillHandling.ClearAll)
  f.increasePlayerSCurrentClassExp(f.getSelfEntity(), 339n)
  f.activateUiControlGroupInControlGroupLibrary(f.getSelfEntity(), 341n)
  f.switchCurrentInterfaceLayout(f.getSelfEntity(), 343n)
  f.modifyUiControlStatusWithinTheInterfaceLayout(
    f.getSelfEntity(),
    345n,
    E.UIControlGroupStatus.Off
  )
  f.removeInterfaceControlGroupFromControlGroupLibrary(f.getSelfEntity(), 347n)
  f.modifySkillCdPercentageBasedOnMaxCd(
    f.getSelfEntity(),
    E.CharacterSkillSlot.NormalAttack,
    349.25,
    false
  )
  f.initializeCharacterSkill(f.getSelfEntity(), E.CharacterSkillSlot.NormalAttack)
  f.setSkillResourceAmount(f.getSelfEntity(), new configId(353n), 354.25)
  f.setCharacterSkillCd(f.getSelfEntity(), E.CharacterSkillSlot.NormalAttack, 356.25, true)
  f.addCharacterSkill(
    f.getSelfEntity(),
    new configId(359n),
    E.CharacterSkillSlot.NormalAttack,
    E.OriginalSlotSkillHandling.Destroy
  )
  f.modifySkillResourceAmount(f.getSelfEntity(), new configId(361n), 362.25)
  f.modifyCharacterSkillCd(f.getSelfEntity(), E.CharacterSkillSlot.NormalAttack, 364.25, true)
  f.deleteCharacterSkillBySlot(f.getSelfEntity(), E.CharacterSkillSlot.NormalAttack)
  f.deleteCharacterSkillById(f.getSelfEntity(), new configId(368n))
  f.adjustPlayerBackgroundMusicVolume(f.getSelfEntity(), 370n)
  f.adjustSpecifiedSoundEffectPlayer(f.getSelfEntity(), 372n, 373n, 374.25)
  f.closeSpecifiedSoundEffectPlayer(f.getSelfEntity(), 376n)
  f.startPausePlayerBackgroundMusic(f.getSelfEntity(), false)
  f.startPauseSpecifiedSoundEffectPlayer(f.getSelfEntity(), 380n, true)
  const ret392 = f.addSoundEffectPlayer(
    f.getSelfEntity(),
    383n,
    384n,
    385.25,
    false,
    387.25,
    false,
    389.25,
    E.SoundAttenuationMode.LinearAttenuation,
    '390',
    [391, 392, 393]
  )
  const s393 = f.dataTypeConversion(ret392, 'str')
  f.printString(s393)
  f.playerPlaysOneShot2dSoundEffect(f.getSelfEntity(), 395n, 396n, 397.25)
  f.modifyPlayerBackgroundMusic(
    f.getSelfEntity(),
    399n,
    400.25,
    401.25,
    402n,
    true,
    404.25,
    405.25,
    false
  )
  f.clearUnitTagsFromEntity(f.getSelfEntity())
  f.addUnitTagToEntity(f.getSelfEntity(), 409n)
  f.removeUnitTagFromEntity(f.getSelfEntity(), 411n)
  f.tauntTarget(f.getSelfEntity(), f.getSelfEntity())
  f.removeTargetEntityFromAggroList(f.getSelfEntity(), f.getSelfEntity())
  f.clearSpecifiedTargetSAggroList(f.getSelfEntity())
  f.setTheAggroValueOfSpecifiedEntity(f.getSelfEntity(), f.getSelfEntity(), 419n)
  f.sendSignal('literal_signal')
  f.setEntityActiveNameplate(f.getSelfEntity(), f.assemblyList([421n, 422n, 423n], 'config_id'))
  f.switchActiveTextBubble(f.getSelfEntity(), new configId(423n))
  f.closeDeckSelector(f.getSelfEntity(), 425n)
  f.invokeDeckSelector(
    f.getSelfEntity(),
    427n,
    428.25,
    f.assemblyList([429n, 430n, 431n], 'int'),
    f.assemblyList([430n, 431n, 432n], 'int'),
    431n,
    432n,
    E.DecisionRefreshMode.CannotRefresh,
    433n,
    434n,
    f.assemblyList([435n, 436n, 437n], 'int')
  )
  f.randomDeckSelectorSelectionList(f.assemblyList([436n, 437n, 438n], 'int'))
  f.setPlayerSettlementSuccessStatus(f.getSelfEntity(), E.SettlementStatus.Undefined)
  // setPlayerSettlementScoreboardDataDisplay :: float
  f.setPlayerSettlementScoreboardDataDisplay(f.getSelfEntity(), 439n, '440', 441.25)
  f.setPlayerSettlementRankingValue(f.getSelfEntity(), 443n)
  f.setFactionSettlementSuccessStatus(new faction(444n), E.SettlementStatus.Undefined)
  f.setFactionSettlementRankingValue(new faction(445n), 446n)
  f.toggleEntityLightSource(f.getSelfEntity(), 448n, true)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, bool>
  f.setOrAddKeyValuePairsToDictionary(
    f.assemblyDictionary([
      { k: new configId(451n), v: false },
      { k: new configId(453n), v: false }
    ]),
    new configId(455n),
    false
  )
  // clearDictionary :: dict<configId, bool>
  f.clearDictionary(
    f.assemblyDictionary([
      { k: new configId(458n), v: true },
      { k: new configId(460n), v: true }
    ])
  )
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, bool>
  f.removeKeyValuePairsFromDictionaryByKey(
    f.assemblyDictionary([
      { k: new configId(463n), v: false },
      { k: new configId(465n), v: false }
    ]),
    new configId(467n)
  )
  f.removeItemFromInventoryShopSalesList(f.getSelfEntity(), 469n, new configId(470n))
  f.removeItemFromPurchaseList(f.getSelfEntity(), 472n, new configId(473n))
  f.removeItemFromCustomShopSalesList(f.getSelfEntity(), 475n, 476n)
  f.openShop(f.getSelfEntity(), f.getSelfEntity(), 479n)
  f.closeShop(f.getSelfEntity())
  f.addNewItemToInventoryShopSalesList(
    f.getSelfEntity(),
    482n,
    new configId(483n),
    f.assemblyDictionary([
      { k: new configId(485n), v: 486n },
      { k: new configId(487n), v: 488n }
    ]),
    489n,
    490n,
    true
  )
  f.addItemsToThePurchaseList(
    f.getSelfEntity(),
    493n,
    new configId(494n),
    f.assemblyDictionary([
      { k: new configId(496n), v: 497n },
      { k: new configId(498n), v: 499n }
    ]),
    false
  )
  const ret514 = f.addNewItemToCustomShopSalesList(
    f.getSelfEntity(),
    502n,
    new configId(503n),
    f.assemblyDictionary([
      { k: new configId(505n), v: 506n },
      { k: new configId(507n), v: 508n }
    ]),
    509n,
    false,
    511n,
    512n,
    true
  )
  const s515 = f.dataTypeConversion(ret514, 'str')
  f.printString(s515)
  f.modifyInventoryShopItemSalesInfo(
    f.getSelfEntity(),
    517n,
    new configId(518n),
    f.assemblyDictionary([
      { k: new configId(520n), v: 521n },
      { k: new configId(522n), v: 523n }
    ]),
    524n,
    525n,
    false
  )
  f.modifyItemPurchaseInfoInThePurchaseList(
    f.getSelfEntity(),
    528n,
    new configId(529n),
    f.assemblyDictionary([
      { k: new configId(531n), v: 532n },
      { k: new configId(533n), v: 534n }
    ]),
    true
  )
  f.modifyCustomShopItemSalesInfo(
    f.getSelfEntity(),
    537n,
    538n,
    new configId(539n),
    f.assemblyDictionary([
      { k: new configId(541n), v: 542n },
      { k: new configId(543n), v: 544n }
    ]),
    545n,
    false,
    547n,
    548n,
    true
  )
  f.modifyEquipmentAffixValue(550n, 551n, 552.25)
  f.removeEquipmentAffix(553n, 554n)
  f.addAffixToEquipment(555n, new configId(556n), true, 558.25)
  f.addAffixToEquipmentAtSpecifiedId(559n, new configId(560n), 561n, false, 563.25)
  f.setInventoryItemDropContents(
    f.getSelfEntity(),
    f.assemblyDictionary([
      { k: new configId(566n), v: 567n },
      { k: new configId(568n), v: 569n }
    ]),
    E.ItemLootType.SharedReward
  )
  f.setInventoryDropItemsCurrencyAmount(
    f.getSelfEntity(),
    new configId(571n),
    572n,
    E.ItemLootType.SharedReward
  )
  f.triggerLootDrop(f.getSelfEntity(), E.ItemLootType.SharedReward)
  f.setLootDropContent(
    f.getSelfEntity(),
    f.assemblyDictionary([
      { k: new configId(576n), v: 577n },
      { k: new configId(578n), v: 579n }
    ])
  )
  f.modifyInventoryItemQuantity(f.getSelfEntity(), new configId(581n), 582n)
  f.modifyInventoryCurrencyQuantity(f.getSelfEntity(), new configId(584n), 585n)
  f.modifyLootItemComponentQuantity(f.getSelfEntity(), new configId(587n), 588n)
  f.modifyLootComponentCurrencyAmount(f.getSelfEntity(), new configId(590n), 591n)
  f.increaseMaximumInventoryCapacity(f.getSelfEntity(), 593n)
  f.modifyPlayerListForVisibleMiniMapMarkers(
    f.getSelfEntity(),
    595n,
    f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], 'entity')
  )
  f.modifyPlayerMarkersOnTheMiniMap(f.getSelfEntity(), 599n, f.getSelfEntity())
  f.modifyMiniMapMarkerActivationStatus(
    f.getSelfEntity(),
    f.assemblyList([602n, 603n, 604n], 'int'),
    true
  )
  f.modifyMiniMapZoom(f.getSelfEntity(), 605.25)
  f.modifyPlayerListForTrackingMiniMapMarkers(
    f.getSelfEntity(),
    607n,
    f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], 'entity')
  )
  f.switchCreationPatrolTemplate(f.getSelfEntity(), 611n)
  f.setPlayerLeaderboardScoreAsAFloat(f.assemblyList([612n, 613n, 614n], 'int'), 613.25, 614n)
  f.setPlayerLeaderboardScoreAsAnInteger(f.assemblyList([615n, 616n, 617n], 'int'), 616n, 617n)
  f.changeAchievementProgressTally(f.getSelfEntity(), 619n, 620n)
  f.setAchievementProgressTally(f.getSelfEntity(), 622n, 623n)
  f.setScanTagRules(f.getSelfEntity(), E.ScanRuleType.PrioritizeView)
  f.setScanComponentSActiveScanTagId(f.getSelfEntity(), 626n)
  f.switchTheScoringGroupThatAffectsPlayerSCompetitiveRank(f.getSelfEntity(), 628n)
  f.setPlayerRankScoreChange(f.getSelfEntity(), E.SettlementStatus.Undefined, 630n)
  f.setPlayerEscapeValidity(f.getSelfEntity(), false)
  f.activateDisableEntityDeploymentGroup(633n, false)
  f.setChatChannelSwitch(635n, false, false)
  f.setPlayerSCurrentChannel(new guid(637n), f.assemblyList([638n, 639n, 640n], 'int'))
  f.modifyPlayerChannelPermission(new guid(639n), 640n, true)
  f.consumeGiftBox(f.getSelfEntity(), 643n, 644n)
  const ret646 = f.split3dVector([645, 646, 647])
  const s647 = f.dataTypeConversion(ret646.xComponent, 'str')
  f.printString(s647)
  const s648 = f.dataTypeConversion(ret646.yComponent, 'str')
  f.printString(s648)
  const s649 = f.dataTypeConversion(ret646.zComponent, 'str')
  f.printString(s649)
  // multiplication :: float
  const ret652 = f.multiplication(650.25, 651.25)
  const s653 = f.dataTypeConversion(ret652, 'str')
  f.printString(s653)
  // division :: float
  const ret656 = f.division(654.25, 655.25)
  const s657 = f.dataTypeConversion(ret656, 'str')
  f.printString(s657)
  const ret661 = f.create3dVector(658.25, 659.25, 660.25)
  const s662 = f.dataTypeConversion(ret661, 'str')
  f.printString(s662)
  const ret665 = f.logarithmOperation(663.25, 664.25)
  const s666 = f.dataTypeConversion(ret665, 'str')
  f.printString(s666)
  const ret668 = f.arccosineFunction(667.25)
  const s669 = f.dataTypeConversion(ret668, 'str')
  f.printString(s669)
  const ret671 = f.arctangentFunction(670.25)
  const s672 = f.dataTypeConversion(ret671, 'str')
  f.printString(s672)
  const ret674 = f.arcsineFunction(673.25)
  const s675 = f.dataTypeConversion(ret674, 'str')
  f.printString(s675)
  // rangeLimitingOperation :: float
  const ret679 = f.rangeLimitingOperation(676.25, 677.25, 678.25)
  const s680 = f.dataTypeConversion(ret679, 'str')
  f.printString(s680)
  const ret683 = f.directionVectorToRotation([681, 682, 683], [682, 683, 684])
  const s684 = f.dataTypeConversion(ret683, 'str')
  f.printString(s684)
  const ret691 = f.calculateTimestampFromFormattedTime(685n, 686n, 687n, 688n, 689n, 690n)
  const s692 = f.dataTypeConversion(ret691, 'str')
  f.printString(s692)
  const ret694 = f.calculateFormattedTimeFromTimestamp(693n)
  const s695 = f.dataTypeConversion(ret694.year, 'str')
  f.printString(s695)
  const s696 = f.dataTypeConversion(ret694.month, 'str')
  f.printString(s696)
  const s697 = f.dataTypeConversion(ret694.day, 'str')
  f.printString(s697)
  const s698 = f.dataTypeConversion(ret694.hour, 'str')
  f.printString(s698)
  const s699 = f.dataTypeConversion(ret694.minute, 'str')
  f.printString(s699)
  const s700 = f.dataTypeConversion(ret694.second, 'str')
  f.printString(s700)
  const ret702 = f.calculateDayOfTheWeekFromTimestamp(701n)
  const s703 = f.dataTypeConversion(ret702, 'str')
  f.printString(s703)
  const ret705 = f.radiansToDegrees(704.25)
  const s706 = f.dataTypeConversion(ret705, 'str')
  f.printString(s706)
  // addition :: float
  const ret709 = f.addition(707.25, 708.25)
  const s710 = f.dataTypeConversion(ret709, 'str')
  f.printString(s710)
  // subtraction :: float
  const ret713 = f.subtraction(711.25, 712.25)
  const s714 = f.dataTypeConversion(ret713, 'str')
  f.printString(s714)
  const ret716 = f.degreesToRadians(715.25)
  const s717 = f.dataTypeConversion(ret716, 'str')
  f.printString(s717)
  // takeLargerValue :: float
  const ret720 = f.takeLargerValue(718.25, 719.25)
  const s721 = f.dataTypeConversion(ret720, 'str')
  f.printString(s721)
  // takeSmallerValue :: float
  const ret724 = f.takeSmallerValue(722.25, 723.25)
  const s725 = f.dataTypeConversion(ret724, 'str')
  f.printString(s725)
  // absoluteValueOperation :: float
  const ret727 = f.absoluteValueOperation(726.25)
  const s728 = f.dataTypeConversion(ret727, 'str')
  f.printString(s728)
  const ret731 = f.distanceBetweenTwoCoordinatePoints([729, 730, 731], [730, 731, 732])
  const s732 = f.dataTypeConversion(ret731, 'str')
  f.printString(s732)
  const ret734 = f.logicalNotOperation(true)
  const s735 = f.dataTypeConversion(ret734, 'str')
  f.printString(s735)
  const ret738 = f.logicalOrOperation(false, true)
  const s739 = f.dataTypeConversion(ret738, 'str')
  f.printString(s739)
  const ret742 = f.logicalXorOperation(false, true)
  const s743 = f.dataTypeConversion(ret742, 'str')
  f.printString(s743)
  const ret746 = f.logicalAndOperation(false, true)
  const s747 = f.dataTypeConversion(ret746, 'str')
  f.printString(s747)
  // exponentiation :: float
  const ret750 = f.exponentiation(748.25, 749.25)
  const s751 = f.dataTypeConversion(ret750, 'str')
  f.printString(s751)
  const ret754 = f.moduloOperation(752n, 753n)
  const s755 = f.dataTypeConversion(ret754, 'str')
  f.printString(s755)
  const ret757 = f.arithmeticSquareRootOperation(756.25)
  const s758 = f.dataTypeConversion(ret757, 'str')
  f.printString(s758)
  // signOperation :: float
  const ret760 = f.signOperation(759.25)
  const s761 = f.dataTypeConversion(ret760, 'str')
  f.printString(s761)
  const ret763 = f.roundToIntegerOperation(762.25, E.RoundingMode.RoundToNearest)
  const s764 = f.dataTypeConversion(ret763, 'str')
  f.printString(s764)
  const ret766 = f._3dVectorNormalization([765, 766, 767])
  const s767 = f.dataTypeConversion(ret766, 'str')
  f.printString(s767)
  const ret770 = f._3dVectorAddition([768, 769, 770], [769, 770, 771])
  const s771 = f.dataTypeConversion(ret770, 'str')
  f.printString(s771)
  const ret774 = f._3dVectorAngle([772, 773, 774], [773, 774, 775])
  const s775 = f.dataTypeConversion(ret774, 'str')
  f.printString(s775)
  const ret778 = f._3dVectorSubtraction([776, 777, 778], [777, 778, 779])
  const s779 = f.dataTypeConversion(ret778, 'str')
  f.printString(s779)
  const ret781 = f._3dVectorModuloOperation([780, 781, 782])
  const s782 = f.dataTypeConversion(ret781, 'str')
  f.printString(s782)
  const ret785 = f._3dVectorDotProduct([783, 784, 785], [784, 785, 786])
  const s786 = f.dataTypeConversion(ret785, 'str')
  f.printString(s786)
  const ret789 = f._3dVectorZoom([787, 788, 789], 788.25)
  const s790 = f.dataTypeConversion(ret789, 'str')
  f.printString(s790)
  const ret793 = f._3dVectorCrossProduct([791, 792, 793], [792, 793, 794])
  const s794 = f.dataTypeConversion(ret793, 'str')
  f.printString(s794)
  const ret797 = f._3dVectorRotation([795, 796, 797], [796, 797, 798])
  const s798 = f.dataTypeConversion(ret797, 'str')
  f.printString(s798)
  // greaterThan :: float
  const ret801 = f.greaterThan(799.25, 800.25)
  const s802 = f.dataTypeConversion(ret801, 'str')
  f.printString(s802)
  // greaterThanOrEqualTo :: float
  const ret805 = f.greaterThanOrEqualTo(803.25, 804.25)
  const s806 = f.dataTypeConversion(ret805, 'str')
  f.printString(s806)
  // lessThan :: float
  const ret809 = f.lessThan(807.25, 808.25)
  const s810 = f.dataTypeConversion(ret809, 'str')
  f.printString(s810)
  // lessThanOrEqualTo :: float
  const ret813 = f.lessThanOrEqualTo(811.25, 812.25)
  const s814 = f.dataTypeConversion(ret813, 'str')
  f.printString(s814)
  const ret816 = f.cosineFunction(815.25)
  const s817 = f.dataTypeConversion(ret816, 'str')
  f.printString(s817)
  const ret819 = f.tangentFunction(818.25)
  const s820 = f.dataTypeConversion(ret819, 'str')
  f.printString(s820)
  const ret822 = f.sineFunction(821.25)
  const s823 = f.dataTypeConversion(ret822, 'str')
  f.printString(s823)
  const ret826 = f.leftShiftOperation(824n, 825n)
  const s827 = f.dataTypeConversion(ret826, 'str')
  f.printString(s827)
  const ret830 = f.rightShiftOperation(828n, 829n)
  const s831 = f.dataTypeConversion(ret830, 'str')
  f.printString(s831)
  const ret834 = f.bitwiseAnd(832n, 833n)
  const s835 = f.dataTypeConversion(ret834, 'str')
  f.printString(s835)
  const ret838 = f.bitwiseOr(836n, 837n)
  const s839 = f.dataTypeConversion(ret838, 'str')
  f.printString(s839)
  const ret842 = f.xorExclusiveOr(840n, 841n)
  const s843 = f.dataTypeConversion(ret842, 'str')
  f.printString(s843)
  const ret845 = f.bitwiseComplement(844n)
  const s846 = f.dataTypeConversion(ret845, 'str')
  f.printString(s846)
  const ret851 = f.writeByBit(847n, 848n, 849n, 850n)
  const s852 = f.dataTypeConversion(ret851, 'str')
  f.printString(s852)
  const ret856 = f.readByBit(853n, 854n, 855n)
  const s857 = f.dataTypeConversion(ret856, 'str')
  f.printString(s857)
  f.splitStructure()
  f.assembleStructure()
  const ret858 = f.queryGameModeAndPlayerNumber()
  const s859 = f.dataTypeConversion(ret858.playerCount, 'str')
  f.printString(s859)
  const enumEq860 = f.enumerationsEqual(ret858.playMode, ret858.playMode)
  const s861 = f.dataTypeConversion(enumEq860, 'str')
  f.printString(s861)
  const ret862 = f.queryServerTimeZone()
  const s863 = f.dataTypeConversion(ret862, 'str')
  f.printString(s863)
  const ret864 = f.queryTimestampUtc0()
  const s865 = f.dataTypeConversion(ret864, 'str')
  f.printString(s865)
  const ret868 = f.getRandomFloatingPointNumber(866.25, 867.25)
  const s869 = f.dataTypeConversion(ret868, 'str')
  f.printString(s869)
  const ret872 = f.getRandomInteger(870n, 871n)
  const s873 = f.dataTypeConversion(ret872, 'str')
  f.printString(s873)
  const ret875 = f.weightedRandom(f.assemblyList([874n, 875n, 876n], 'int'))
  const s876 = f.dataTypeConversion(ret875, 'str')
  f.printString(s876)
  const ret877 = f._3dVectorBackward()
  const s878 = f.dataTypeConversion(ret877, 'str')
  f.printString(s878)
  const ret879 = f._3dVectorZeroVector()
  const s880 = f.dataTypeConversion(ret879, 'str')
  f.printString(s880)
  const ret881 = f._3dVectorForward()
  const s882 = f.dataTypeConversion(ret881, 'str')
  f.printString(s882)
  const ret883 = f._3dVectorUp()
  const s884 = f.dataTypeConversion(ret883, 'str')
  f.printString(s884)
  const ret885 = f._3dVectorDown()
  const s886 = f.dataTypeConversion(ret885, 'str')
  f.printString(s886)
  const ret887 = f._3dVectorRight()
  const s888 = f.dataTypeConversion(ret887, 'str')
  f.printString(s888)
  const ret889 = f._3dVectorLeft()
  const s890 = f.dataTypeConversion(ret889, 'str')
  f.printString(s890)
  const ret891 = f.pi()
  const s892 = f.dataTypeConversion(ret891, 'str')
  f.printString(s892)
  // searchListAndReturnValueId :: bool
  const ret895 = f.searchListAndReturnValueId(f.assemblyList([true, false, true], 'bool'), false)
  const len896 = f.getListLength(ret895)
  const s897 = f.dataTypeConversion(len896, 'str')
  f.printString(s897)
  // getCorrespondingValueFromList :: bool
  const ret900 = f.getCorrespondingValueFromList(f.assemblyList([false, true, false], 'bool'), 899n)
  const s901 = f.dataTypeConversion(ret900, 'str')
  f.printString(s901)
  // getListLength :: bool
  const ret903 = f.getListLength(f.assemblyList([false, true, false], 'bool'))
  const s904 = f.dataTypeConversion(ret903, 'str')
  f.printString(s904)
  // getMaximumValueFromList :: float
  const ret906 = f.getMaximumValueFromList(f.assemblyList([905.25, 906.25, 907.25], 'float'))
  const s907 = f.dataTypeConversion(ret906, 'str')
  f.printString(s907)
  // getMinimumValueFromList :: float
  const ret909 = f.getMinimumValueFromList(f.assemblyList([908.25, 909.25, 910.25], 'float'))
  const s910 = f.dataTypeConversion(ret909, 'str')
  f.printString(s910)
  // listIncludesThisValue :: bool
  const ret913 = f.listIncludesThisValue(f.assemblyList([true, false, true], 'bool'), false)
  const s914 = f.dataTypeConversion(ret913, 'str')
  f.printString(s914)
  const ret917 = f.getPresetStatus(f.getSelfEntity(), 916n)
  const s918 = f.dataTypeConversion(ret917, 'str')
  f.printString(s918)
  const ret920 = f.queryCharacterSCurrentMovementSpd(f.getSelfEntity())
  const s921 = f.dataTypeConversion(ret920.currentSpeed, 'str')
  f.printString(s921)
  const s922 = f.dataTypeConversion(ret920.velocityVector, 'str')
  f.printString(s922)
  const ret924 = f.queryIfEntityIsOnTheField(f.getSelfEntity())
  const s925 = f.dataTypeConversion(ret924, 'str')
  f.printString(s925)
  const ret926 = f.getAllEntitiesOnTheField()
  const len927 = f.getListLength(ret926)
  const s928 = f.dataTypeConversion(len927, 'str')
  f.printString(s928)
  const ret929 = f.getSpecifiedTypeOfEntitiesOnTheField(E.EntityType.Stage)
  const len930 = f.getListLength(ret929)
  const s931 = f.dataTypeConversion(len930, 'str')
  f.printString(s931)
  const ret933 = f.getEntitiesWithSpecifiedPrefabOnTheField(new prefabId(932n))
  const len934 = f.getListLength(ret933)
  const s935 = f.dataTypeConversion(len934, 'str')
  f.printString(s935)
  const ret937 = f.getCharacterAttribute(f.getSelfEntity())
  const s938 = f.dataTypeConversion(ret937.level, 'str')
  f.printString(s938)
  const s939 = f.dataTypeConversion(ret937.currentHp, 'str')
  f.printString(s939)
  const s940 = f.dataTypeConversion(ret937.maxHp, 'str')
  f.printString(s940)
  const s941 = f.dataTypeConversion(ret937.currentAtk, 'str')
  f.printString(s941)
  const s942 = f.dataTypeConversion(ret937.baseAtk, 'str')
  f.printString(s942)
  const s943 = f.dataTypeConversion(ret937.currentDef, 'str')
  f.printString(s943)
  const s944 = f.dataTypeConversion(ret937.baseDef, 'str')
  f.printString(s944)
  const s945 = f.dataTypeConversion(ret937.interruptValueThreshold, 'str')
  f.printString(s945)
  const s946 = f.dataTypeConversion(ret937.currentInterruptValue, 'str')
  f.printString(s946)
  const enumEq947 = f.enumerationsEqual(
    ret937.currentInterruptStatus,
    ret937.currentInterruptStatus
  )
  const s948 = f.dataTypeConversion(enumEq947, 'str')
  f.printString(s948)
  const ret950 = f.getEntityAdvancedAttribute(f.getSelfEntity())
  const s951 = f.dataTypeConversion(ret950.critRate, 'str')
  f.printString(s951)
  const s952 = f.dataTypeConversion(ret950.critDmg, 'str')
  f.printString(s952)
  const s953 = f.dataTypeConversion(ret950.healingBonus, 'str')
  f.printString(s953)
  const s954 = f.dataTypeConversion(ret950.incomingHealingBonus, 'str')
  f.printString(s954)
  const s955 = f.dataTypeConversion(ret950.energyRecharge, 'str')
  f.printString(s955)
  const s956 = f.dataTypeConversion(ret950.cdReduction, 'str')
  f.printString(s956)
  const s957 = f.dataTypeConversion(ret950.beyondModeShieldStrength, 'str')
  f.printString(s957)
  const s958 = f.dataTypeConversion(ret950.classicModeShieldStrength, 'str')
  f.printString(s958)
  const ret959 = f.getEntityType(f.getSelfEntity())
  const enumEq960 = f.enumerationsEqual(ret959, ret959)
  const s961 = f.dataTypeConversion(enumEq960, 'str')
  f.printString(s961)
  const ret963 = f.getEntityLocationAndRotation(f.getSelfEntity())
  const s964 = f.dataTypeConversion(ret963.location, 'str')
  f.printString(s964)
  const s965 = f.dataTypeConversion(ret963.rotate, 'str')
  f.printString(s965)
  const ret967 = f.getEntityForwardVector(f.getSelfEntity())
  const s968 = f.dataTypeConversion(ret967, 'str')
  f.printString(s968)
  const ret970 = f.getEntityUpwardVector(f.getSelfEntity())
  const s971 = f.dataTypeConversion(ret970, 'str')
  f.printString(s971)
  const ret973 = f.getEntityRightVector(f.getSelfEntity())
  const s974 = f.dataTypeConversion(ret973, 'str')
  f.printString(s974)
  const ret976 = f.getListOfEntitiesOwnedByTheEntity(f.getSelfEntity())
  const len977 = f.getListLength(ret976)
  const s978 = f.dataTypeConversion(len977, 'str')
  f.printString(s978)
  const ret980 = f.getEntityElementalAttribute(f.getSelfEntity())
  const s981 = f.dataTypeConversion(ret980.pyroDmgBonus, 'str')
  f.printString(s981)
  const s982 = f.dataTypeConversion(ret980.pyroRes, 'str')
  f.printString(s982)
  const s983 = f.dataTypeConversion(ret980.hydroDmgBonus, 'str')
  f.printString(s983)
  const s984 = f.dataTypeConversion(ret980.hydroRes, 'str')
  f.printString(s984)
  const s985 = f.dataTypeConversion(ret980.dendroDmgBonus, 'str')
  f.printString(s985)
  const s986 = f.dataTypeConversion(ret980.dendroRes, 'str')
  f.printString(s986)
  const s987 = f.dataTypeConversion(ret980.electroDmgBonus, 'str')
  f.printString(s987)
  const s988 = f.dataTypeConversion(ret980.electroRes, 'str')
  f.printString(s988)
  const s989 = f.dataTypeConversion(ret980.anemoDmgBonus, 'str')
  f.printString(s989)
  const s990 = f.dataTypeConversion(ret980.anemoRes, 'str')
  f.printString(s990)
  const s991 = f.dataTypeConversion(ret980.cryoDmgBonus, 'str')
  f.printString(s991)
  const s992 = f.dataTypeConversion(ret980.cryoRes, 'str')
  f.printString(s992)
  const s993 = f.dataTypeConversion(ret980.geoDmgBonus, 'str')
  f.printString(s993)
  const s994 = f.dataTypeConversion(ret980.geoRes, 'str')
  f.printString(s994)
  const s995 = f.dataTypeConversion(ret980.physicalDmgBonus, 'str')
  f.printString(s995)
  const s996 = f.dataTypeConversion(ret980.physicalRes, 'str')
  f.printString(s996)
  const ret998 = f.getObjectAttribute(f.getSelfEntity())
  const s999 = f.dataTypeConversion(ret998.level, 'str')
  f.printString(s999)
  const s1000 = f.dataTypeConversion(ret998.currentHp, 'str')
  f.printString(s1000)
  const s1001 = f.dataTypeConversion(ret998.maxHp, 'str')
  f.printString(s1001)
  const s1002 = f.dataTypeConversion(ret998.currentAtk, 'str')
  f.printString(s1002)
  const s1003 = f.dataTypeConversion(ret998.baseAtk, 'str')
  f.printString(s1003)
  const s1004 = f.dataTypeConversion(ret998.currentDef, 'str')
  f.printString(s1004)
  const s1005 = f.dataTypeConversion(ret998.baseDef, 'str')
  f.printString(s1005)
  const ret1007 = f.getOwnerEntity(f.getSelfEntity())
  const s1008 = f.dataTypeConversion(ret1007, 'str')
  f.printString(s1008)
  const ret1013 = f.getEntityListBySpecifiedRange(
    f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], 'entity'),
    [1011, 1012, 1013],
    1012.25
  )
  const len1014 = f.getListLength(ret1013)
  const s1015 = f.dataTypeConversion(len1014, 'str')
  f.printString(s1015)
  const ret1018 = f.getEntityListBySpecifiedType(
    f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], 'entity'),
    E.EntityType.Stage
  )
  const len1019 = f.getListLength(ret1018)
  const s1020 = f.dataTypeConversion(len1019, 'str')
  f.printString(s1020)
  const ret1024 = f.getEntityListBySpecifiedPrefabId(
    f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], 'entity'),
    new prefabId(1023n)
  )
  const len1025 = f.getListLength(ret1024)
  const s1026 = f.dataTypeConversion(len1025, 'str')
  f.printString(s1026)
  const ret1030 = f.getEntityListBySpecifiedFaction(
    f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], 'entity'),
    new faction(1029n)
  )
  const len1031 = f.getListLength(ret1030)
  const s1032 = f.dataTypeConversion(len1031, 'str')
  f.printString(s1032)
  const ret1033 = f.getSelfEntity()
  const s1034 = f.dataTypeConversion(ret1033, 'str')
  f.printString(s1034)
  const ret1036 = f.queryGuidByEntity(f.getSelfEntity())
  const s1037 = f.dataTypeConversion(ret1036, 'str')
  f.printString(s1037)
  const ret1039 = f.queryEntityByGuid(new guid(1038n))
  const s1040 = f.dataTypeConversion(ret1039, 'str')
  f.printString(s1040)
  const ret1041 = f.queryCurrentEnvironmentTime()
  const s1042 = f.dataTypeConversion(ret1041.currentEnvironmentTime, 'str')
  f.printString(s1042)
  const s1043 = f.dataTypeConversion(ret1041.currentLoopDay, 'str')
  f.printString(s1043)
  const ret1044 = f.queryGameTimeElapsed()
  const s1045 = f.dataTypeConversion(ret1044, 'str')
  f.printString(s1045)
  const ret1047 = f.queryEntityFaction(f.getSelfEntity())
  const s1048 = f.dataTypeConversion(ret1047, 'str')
  f.printString(s1048)
  const ret1051 = f.queryIfFactionIsHostile(new faction(1049n), new faction(1050n))
  const s1052 = f.dataTypeConversion(ret1051, 'str')
  f.printString(s1052)
  const ret1054 = f.queryIfAllPlayerCharactersAreDown(f.getSelfEntity())
  const s1055 = f.dataTypeConversion(ret1054, 'str')
  f.printString(s1055)
  const ret1057 = f.getPlayerGuidByPlayerId(1056n)
  const s1058 = f.dataTypeConversion(ret1057, 'str')
  f.printString(s1058)
  const ret1060 = f.getPlayerIdByPlayerGuid(new guid(1059n))
  const s1061 = f.dataTypeConversion(ret1060, 'str')
  f.printString(s1061)
  const ret1063 = f.getPlayerClientInputDeviceType(f.getSelfEntity())
  const enumEq1064 = f.enumerationsEqual(ret1063, ret1063)
  const s1065 = f.dataTypeConversion(enumEq1064, 'str')
  f.printString(s1065)
  const ret1067 = f.getPlayerEntityToWhichTheCharacterBelongs(f.getSelfEntity())
  const s1068 = f.dataTypeConversion(ret1067, 'str')
  f.printString(s1068)
  const ret1070 = f.getPlayerReviveTime(f.getSelfEntity())
  const s1071 = f.dataTypeConversion(ret1070, 'str')
  f.printString(s1071)
  const ret1073 = f.getPlayerNickname(f.getSelfEntity())
  f.printString(ret1073)
  const ret1075 = f.getPlayerRemainingRevives(f.getSelfEntity())
  const s1076 = f.dataTypeConversion(ret1075, 'str')
  f.printString(s1076)
  const ret1077 = f.getListOfPlayerEntitiesOnTheField()
  const len1078 = f.getListLength(ret1077)
  const s1079 = f.dataTypeConversion(len1078, 'str')
  f.printString(s1079)
  const ret1081 = f.getAllCharacterEntitiesOfSpecifiedPlayer(f.getSelfEntity())
  const len1082 = f.getListLength(ret1081)
  const s1083 = f.dataTypeConversion(len1082, 'str')
  f.printString(s1083)
  const ret1085 = f.getFollowMotionDeviceTarget(f.getSelfEntity())
  const s1086 = f.dataTypeConversion(ret1085.followTargetEntity, 'str')
  f.printString(s1086)
  const s1087 = f.dataTypeConversion(ret1085.followTargetGuid, 'str')
  f.printString(s1087)
  const ret1090 = f.getCurrentGlobalTimerTime(f.getSelfEntity(), '1089')
  const s1091 = f.dataTypeConversion(ret1090, 'str')
  f.printString(s1091)
  const ret1093 = f.getPlayerSCurrentUiLayout(f.getSelfEntity())
  const s1094 = f.dataTypeConversion(ret1093, 'str')
  f.printString(s1094)
  const ret1096 = f.getCreationSCurrentTarget(f.getSelfEntity())
  const s1097 = f.dataTypeConversion(ret1096, 'str')
  f.printString(s1097)
  const ret1099 = f.getAggroListOfCreationInDefaultMode(f.getSelfEntity())
  const len1100 = f.getListLength(ret1099)
  const s1101 = f.dataTypeConversion(len1100, 'str')
  f.printString(s1101)
  const ret1103 = f.getCreationAttribute(f.getSelfEntity())
  const s1104 = f.dataTypeConversion(ret1103.level, 'str')
  f.printString(s1104)
  const s1105 = f.dataTypeConversion(ret1103.currentHp, 'str')
  f.printString(s1105)
  const s1106 = f.dataTypeConversion(ret1103.maxHp, 'str')
  f.printString(s1106)
  const s1107 = f.dataTypeConversion(ret1103.currentAtk, 'str')
  f.printString(s1107)
  const s1108 = f.dataTypeConversion(ret1103.baseAtk, 'str')
  f.printString(s1108)
  const s1109 = f.dataTypeConversion(ret1103.interruptValueThreshold, 'str')
  f.printString(s1109)
  const s1110 = f.dataTypeConversion(ret1103.currentInterruptValue, 'str')
  f.printString(s1110)
  const enumEq1111 = f.enumerationsEqual(
    ret1103.currentInterruptStatus,
    ret1103.currentInterruptStatus
  )
  const s1112 = f.dataTypeConversion(enumEq1111, 'str')
  f.printString(s1112)
  const ret1115 = f.queryPlayerClassLevel(f.getSelfEntity(), new configId(1114n))
  const s1116 = f.dataTypeConversion(ret1115, 'str')
  f.printString(s1116)
  const ret1118 = f.queryPlayerClass(f.getSelfEntity())
  const eq1119 = f.equal(ret1118, ret1118)
  const s1120 = f.dataTypeConversion(eq1119, 'str')
  f.printString(s1120)
  const ret1122 = f.queryCharacterSkill(f.getSelfEntity(), E.CharacterSkillSlot.NormalAttack)
  const eq1123 = f.equal(ret1122, ret1122)
  const s1124 = f.dataTypeConversion(eq1123, 'str')
  f.printString(s1124)
  const ret1127 = f.listOfSlotIdsQueryingUnitStatus(f.getSelfEntity(), new configId(1126n))
  const len1128 = f.getListLength(ret1127)
  const s1129 = f.dataTypeConversion(len1128, 'str')
  f.printString(s1129)
  const ret1132 = f.queryIfEntityHasUnitStatus(f.getSelfEntity(), new configId(1131n))
  const s1133 = f.dataTypeConversion(ret1132, 'str')
  f.printString(s1133)
  const ret1137 = f.queryUnitStatusStacksBySlotId(f.getSelfEntity(), new configId(1135n), 1136n)
  const s1138 = f.dataTypeConversion(ret1137, 'str')
  f.printString(s1138)
  const ret1142 = f.queryUnitStatusApplierBySlotId(f.getSelfEntity(), new configId(1140n), 1141n)
  const s1143 = f.dataTypeConversion(ret1142, 'str')
  f.printString(s1143)
  const ret1145 = f.getEntityListByUnitTag(1144n)
  const len1146 = f.getListLength(ret1145)
  const s1147 = f.dataTypeConversion(len1146, 'str')
  f.printString(s1147)
  const ret1149 = f.getEntityUnitTagList(f.getSelfEntity())
  const len1150 = f.getListLength(ret1149)
  const s1151 = f.dataTypeConversion(len1150, 'str')
  f.printString(s1151)
  const ret1152 = f.queryGlobalAggroTransferMultiplier()
  const s1153 = f.dataTypeConversion(ret1152, 'str')
  f.printString(s1153)
  const ret1155 = f.queryTheAggroMultiplierOfTheSpecifiedEntity(f.getSelfEntity())
  const s1156 = f.dataTypeConversion(ret1155, 'str')
  f.printString(s1156)
  const ret1159 = f.queryTheAggroValueOfTheSpecifiedEntity(f.getSelfEntity(), f.getSelfEntity())
  const s1160 = f.dataTypeConversion(ret1159, 'str')
  f.printString(s1160)
  const ret1162 = f.queryIfSpecifiedEntityIsInCombat(f.getSelfEntity())
  const s1163 = f.dataTypeConversion(ret1162, 'str')
  f.printString(s1163)
  const ret1165 = f.getListOfOwnersWhoHaveTheTargetInTheirAggroList(f.getSelfEntity())
  const len1166 = f.getListLength(ret1165)
  const s1167 = f.dataTypeConversion(len1166, 'str')
  f.printString(s1167)
  const ret1169 = f.getListOfOwnersThatHaveTheTargetAsTheirAggroTarget(f.getSelfEntity())
  const len1170 = f.getListLength(ret1169)
  const s1171 = f.dataTypeConversion(len1170, 'str')
  f.printString(s1171)
  const ret1173 = f.getTheAggroListOfTheSpecifiedEntity(f.getSelfEntity())
  const len1174 = f.getListLength(ret1173)
  const s1175 = f.dataTypeConversion(len1174, 'str')
  f.printString(s1175)
  const ret1177 = f.getTheAggroTargetOfTheSpecifiedEntity(f.getSelfEntity())
  const s1178 = f.dataTypeConversion(ret1177, 'str')
  f.printString(s1178)
  const ret1181 = f.getSpecifiedWaypointInfo(1179n, 1180n)
  const s1182 = f.dataTypeConversion(ret1181.waypointLocation, 'str')
  f.printString(s1182)
  const s1183 = f.dataTypeConversion(ret1181.waypointOrientation, 'str')
  f.printString(s1183)
  const ret1185 = f.getPresetPointListByUnitTag(1184n)
  const len1186 = f.getListLength(ret1185)
  const s1187 = f.dataTypeConversion(len1186, 'str')
  f.printString(s1187)
  const ret1189 = f.queryPresetPointPositionRotation(1188n)
  const s1190 = f.dataTypeConversion(ret1189.location, 'str')
  f.printString(s1190)
  const s1191 = f.dataTypeConversion(ret1189.rotate, 'str')
  f.printString(s1191)
  const ret1193 = f.getPlayerSettlementSuccessStatus(f.getSelfEntity())
  const enumEq1194 = f.enumerationsEqual(ret1193, ret1193)
  const s1195 = f.dataTypeConversion(enumEq1194, 'str')
  f.printString(s1195)
  const ret1197 = f.getPlayerSettlementRankingValue(f.getSelfEntity())
  const s1198 = f.dataTypeConversion(ret1197, 'str')
  f.printString(s1198)
  const ret1200 = f.getFactionSettlementSuccessStatus(new faction(1199n))
  const enumEq1201 = f.enumerationsEqual(ret1200, ret1200)
  const s1202 = f.dataTypeConversion(enumEq1201, 'str')
  f.printString(s1202)
  const ret1204 = f.getFactionSettlementRankingValue(new faction(1203n))
  const s1205 = f.dataTypeConversion(ret1204, 'str')
  f.printString(s1205)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, bool>
  const ret1212 = f.queryIfDictionaryContainsSpecificKey(
    f.assemblyDictionary([
      { k: new configId(1207n), v: false },
      { k: new configId(1209n), v: false }
    ]),
    new configId(1211n)
  )
  const s1213 = f.dataTypeConversion(ret1212, 'str')
  f.printString(s1213)
  const ret1219 = f.queryDictionarySLength(
    f.assemblyDictionary([
      { k: 1215, v: 1216 },
      { k: 1217, v: 1218 }
    ])
  )
  const s1220 = f.dataTypeConversion(ret1219, 'str')
  f.printString(s1220)
  // getListOfKeysFromDictionary :: dict<configId, bool>
  const ret1226 = f.getListOfKeysFromDictionary(
    f.assemblyDictionary([
      { k: new configId(1222n), v: true },
      { k: new configId(1224n), v: true }
    ])
  )
  const len1227 = f.getListLength(ret1226)
  const s1228 = f.dataTypeConversion(len1227, 'str')
  f.printString(s1228)
  const ret1232 = f.queryInventoryShopItemSalesInfo(f.getSelfEntity(), 1230n, new configId(1231n))
  const len1233 = f.queryDictionarySLength(ret1232.sellCurrencyDictionary)
  const s1234 = f.dataTypeConversion(len1233, 'str')
  f.printString(s1234)
  const s1235 = f.dataTypeConversion(ret1232.sortPriority, 'str')
  f.printString(s1235)
  const s1236 = f.dataTypeConversion(ret1232.canBeSold, 'str')
  f.printString(s1236)
  const ret1239 = f.queryInventoryShopItemSalesList(f.getSelfEntity(), 1238n)
  const len1240 = f.getListLength(ret1239)
  const s1241 = f.dataTypeConversion(len1240, 'str')
  f.printString(s1241)
  const ret1244 = f.queryShopPurchaseItemList(f.getSelfEntity(), 1243n)
  const len1245 = f.getListLength(ret1244)
  const s1246 = f.dataTypeConversion(len1245, 'str')
  f.printString(s1246)
  const ret1250 = f.queryShopItemPurchaseInfo(f.getSelfEntity(), 1248n, new configId(1249n))
  const len1251 = f.queryDictionarySLength(ret1250.purchaseCurrencyDictionary)
  const s1252 = f.dataTypeConversion(len1251, 'str')
  f.printString(s1252)
  const s1253 = f.dataTypeConversion(ret1250.purchasable, 'str')
  f.printString(s1253)
  const ret1256 = f.queryCustomShopItemSalesList(f.getSelfEntity(), 1255n)
  const len1257 = f.getListLength(ret1256)
  const s1258 = f.dataTypeConversion(len1257, 'str')
  f.printString(s1258)
  const ret1262 = f.queryCustomShopItemSalesInfo(f.getSelfEntity(), 1260n, 1261n)
  const eq1263 = f.equal(ret1262.itemConfigId, ret1262.itemConfigId)
  const s1264 = f.dataTypeConversion(eq1263, 'str')
  f.printString(s1264)
  const len1265 = f.queryDictionarySLength(ret1262.sellCurrencyDictionary)
  const s1266 = f.dataTypeConversion(len1265, 'str')
  f.printString(s1266)
  const s1267 = f.dataTypeConversion(ret1262.affiliatedTabId, 'str')
  f.printString(s1267)
  const s1268 = f.dataTypeConversion(ret1262.limitPurchase, 'str')
  f.printString(s1268)
  const s1269 = f.dataTypeConversion(ret1262.purchaseLimit, 'str')
  f.printString(s1269)
  const s1270 = f.dataTypeConversion(ret1262.sortPriority, 'str')
  f.printString(s1270)
  const s1271 = f.dataTypeConversion(ret1262.canBeSold, 'str')
  f.printString(s1271)
  const ret1273 = f.queryEquipmentTagList(1272n)
  const len1274 = f.getListLength(ret1273)
  const s1275 = f.dataTypeConversion(len1274, 'str')
  f.printString(s1275)
  const ret1277 = f.queryEquipmentConfigIdByEquipmentId(1276n)
  const eq1278 = f.equal(ret1277, ret1277)
  const s1279 = f.dataTypeConversion(eq1278, 'str')
  f.printString(s1279)
  const ret1281 = f.getEquipmentAffixList(1280n)
  const len1282 = f.getListLength(ret1281)
  const s1283 = f.dataTypeConversion(len1282, 'str')
  f.printString(s1283)
  const ret1286 = f.getEquipmentAffixConfigId(1284n, 1285n)
  const eq1287 = f.equal(ret1286, ret1286)
  const s1288 = f.dataTypeConversion(eq1287, 'str')
  f.printString(s1288)
  const ret1291 = f.getEquipmentAffixValue(1289n, 1290n)
  const s1292 = f.dataTypeConversion(ret1291, 'str')
  f.printString(s1292)
  const ret1295 = f.getInventoryItemQuantity(f.getSelfEntity(), new configId(1294n))
  const s1296 = f.dataTypeConversion(ret1295, 'str')
  f.printString(s1296)
  const ret1299 = f.getInventoryCurrencyQuantity(f.getSelfEntity(), new configId(1298n))
  const s1300 = f.dataTypeConversion(ret1299, 'str')
  f.printString(s1300)
  const ret1302 = f.getInventoryCapacity(f.getSelfEntity())
  const s1303 = f.dataTypeConversion(ret1302, 'str')
  f.printString(s1303)
  const ret1305 = f.getAllCurrencyFromInventory(f.getSelfEntity())
  const len1306 = f.queryDictionarySLength(ret1305)
  const s1307 = f.dataTypeConversion(len1306, 'str')
  f.printString(s1307)
  const ret1309 = f.getAllBasicItemsFromInventory(f.getSelfEntity())
  const len1310 = f.queryDictionarySLength(ret1309)
  const s1311 = f.dataTypeConversion(len1310, 'str')
  f.printString(s1311)
  const ret1313 = f.getAllEquipmentFromInventory(f.getSelfEntity())
  const len1314 = f.getListLength(ret1313)
  const s1315 = f.dataTypeConversion(len1314, 'str')
  f.printString(s1315)
  const ret1318 = f.getLootComponentItemQuantity(f.getSelfEntity(), new configId(1317n))
  const s1319 = f.dataTypeConversion(ret1318, 'str')
  f.printString(s1319)
  const ret1322 = f.getLootComponentCurrencyQuantity(f.getSelfEntity(), new configId(1321n))
  const s1323 = f.dataTypeConversion(ret1322, 'str')
  f.printString(s1323)
  const ret1325 = f.getAllEquipmentFromLootComponent(f.getSelfEntity())
  const len1326 = f.getListLength(ret1325)
  const s1327 = f.dataTypeConversion(len1326, 'str')
  f.printString(s1327)
  const ret1329 = f.getAllItemsFromLootComponent(f.getSelfEntity())
  const len1330 = f.queryDictionarySLength(ret1329)
  const s1331 = f.dataTypeConversion(len1330, 'str')
  f.printString(s1331)
  const ret1333 = f.getAllCurrencyFromLootComponent(f.getSelfEntity())
  const len1334 = f.queryDictionarySLength(ret1333)
  const s1335 = f.dataTypeConversion(len1334, 'str')
  f.printString(s1335)
  const ret1338 = f.getAllEntitiesWithinTheCollisionTrigger(f.getSelfEntity(), 1337n)
  const len1339 = f.getListLength(ret1338)
  const s1340 = f.dataTypeConversion(len1339, 'str')
  f.printString(s1340)
  const ret1343 = f.querySpecifiedMiniMapMarkerInformation(f.getSelfEntity(), 1342n)
  const s1344 = f.dataTypeConversion(ret1343.activationStaet, 'str')
  f.printString(s1344)
  const len1345 = f.getListLength(ret1343.listOfPlayersWithVisibleMarkers)
  const s1346 = f.dataTypeConversion(len1345, 'str')
  f.printString(s1346)
  const len1347 = f.getListLength(ret1343.listOfPlayersTrackingMarkers)
  const s1348 = f.dataTypeConversion(len1347, 'str')
  f.printString(s1348)
  const ret1350 = f.getEntitySMiniMapMarkerStatus(f.getSelfEntity())
  const len1351 = f.getListLength(ret1350.fullMiniMapMarkerIdList)
  const s1352 = f.dataTypeConversion(len1351, 'str')
  f.printString(s1352)
  const len1353 = f.getListLength(ret1350.activeMiniMapMarkerIdList)
  const s1354 = f.dataTypeConversion(len1353, 'str')
  f.printString(s1354)
  const len1355 = f.getListLength(ret1350.inactiveMiniMapMarkerIdList)
  const s1356 = f.dataTypeConversion(len1355, 'str')
  f.printString(s1356)
  const ret1358 = f.getCurrentCreationSPatrolTemplate(f.getSelfEntity())
  const s1359 = f.dataTypeConversion(ret1358.patrolTemplateId, 'str')
  f.printString(s1359)
  const s1360 = f.dataTypeConversion(ret1358.pathIndex, 'str')
  f.printString(s1360)
  const s1361 = f.dataTypeConversion(ret1358.targetWaypointIndex, 'str')
  f.printString(s1361)
  const ret1364 = f.queryIfAchievementIsCompleted(f.getSelfEntity(), 1363n)
  const s1365 = f.dataTypeConversion(ret1364, 'str')
  f.printString(s1365)
  const ret1367 = f.getTheCurrentlyActiveScanTagConfigId(f.getSelfEntity())
  const eq1368 = f.equal(ret1367, ret1367)
  const s1369 = f.dataTypeConversion(eq1368, 'str')
  f.printString(s1369)
  const ret1371 = f.getPlayerRankScoreChange(f.getSelfEntity(), E.SettlementStatus.Undefined)
  const s1372 = f.dataTypeConversion(ret1371, 'str')
  f.printString(s1372)
  const ret1374 = f.getPlayerRankingInfo(f.getSelfEntity())
  const s1375 = f.dataTypeConversion(ret1374.playerRankTotalScore, 'str')
  f.printString(s1375)
  const s1376 = f.dataTypeConversion(ret1374.playerWinStreak, 'str')
  f.printString(s1376)
  const s1377 = f.dataTypeConversion(ret1374.playerLoseStreak, 'str')
  f.printString(s1377)
  const s1378 = f.dataTypeConversion(ret1374.playerConsecutiveEscapes, 'str')
  f.printString(s1378)
  const ret1380 = f.getPlayerEscapeValidity(f.getSelfEntity())
  const s1381 = f.dataTypeConversion(ret1380, 'str')
  f.printString(s1381)
  const ret1382 = f.getCurrentlyActiveEntityDeploymentGroups()
  const len1383 = f.getListLength(ret1382)
  const s1384 = f.dataTypeConversion(len1383, 'str')
  f.printString(s1384)
  const ret1387 = f.queryCorrespondingGiftBoxQuantity(f.getSelfEntity(), 1386n)
  const s1388 = f.dataTypeConversion(ret1387, 'str')
  f.printString(s1388)
  const ret1391 = f.queryCorrespondingGiftBoxConsumption(f.getSelfEntity(), 1390n)
  const s1392 = f.dataTypeConversion(ret1391, 'str')
  f.printString(s1392)
  f.return()
})

g.server({ id: 1073741866 }).onSignal('monitor_signal', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.signalSourceEntity, 'str')
  f.printString(s3)
})

g.server({ id: 1073741866 }).on('whenAggroTargetChanges', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.preChangeAggroTarget, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.postChangeAggroTarget, 'str')
  f.printString(s4)
})

g.server({ id: 1073741866 }).on('whenAllPlayerSCharactersAreDown', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.playerEntity, 'str')
  f.printString(s1)
  const enumEq2 = f.enumerationsEqual(evt.reason, evt.reason)
  const s3 = f.dataTypeConversion(enumEq2, 'str')
  f.printString(s3)
})

g.server({ id: 1073741866 }).on('whenAllPlayerSCharactersAreRevived', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.playerEntity, 'str')
  f.printString(s1)
})

g.server({ id: 1073741866 }).on('whenAttackHits', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.hitTargetEntity, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.damage, 'str')
  f.printString(s4)
  const len5 = f.getListLength(evt.attackTagList)
  const s6 = f.dataTypeConversion(len5, 'str')
  f.printString(s6)
  const enumEq7 = f.enumerationsEqual(evt.elementalType, evt.elementalType)
  const s8 = f.dataTypeConversion(enumEq7, 'str')
  f.printString(s8)
  const s9 = f.dataTypeConversion(evt.elementalAttackPotency, 'str')
  f.printString(s9)
})

g.server({ id: 1073741866 }).on('whenAttacked', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.attackerEntity, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.damage, 'str')
  f.printString(s4)
  const len5 = f.getListLength(evt.attackTagList)
  const s6 = f.dataTypeConversion(len5, 'str')
  f.printString(s6)
  const enumEq7 = f.enumerationsEqual(evt.elementalType, evt.elementalType)
  const s8 = f.dataTypeConversion(enumEq7, 'str')
  f.printString(s8)
  const s9 = f.dataTypeConversion(evt.elementalAttackPotency, 'str')
  f.printString(s9)
})

g.server({ id: 1073741866 }).on('whenBasicMotionDeviceStops', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  f.printString(evt.motionDeviceName)
})

g.server({ id: 1073741866 }).on('whenCharacterMovementSpdMeetsCondition', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const eq3 = f.equal(evt.unitStatusConfigId, evt.unitStatusConfigId)
  const s4 = f.dataTypeConversion(eq3, 'str')
  f.printString(s4)
  const enumEq5 = f.enumerationsEqual(evt.conditionComparisonType, evt.conditionComparisonType)
  const s6 = f.dataTypeConversion(enumEq5, 'str')
  f.printString(s6)
  const s7 = f.dataTypeConversion(evt.conditionComparisonValue, 'str')
  f.printString(s7)
  const s8 = f.dataTypeConversion(evt.currentMovementSpd, 'str')
  f.printString(s8)
})

g.server({ id: 1073741866 }).on('whenCharacterRevives', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.characterEntity, 'str')
  f.printString(s1)
})

g.server({ id: 1073741866 }).on('whenCreationEntersCombat', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
})

g.server({ id: 1073741866 }).on('whenCreationLeavesCombat', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
})

g.server({ id: 1073741866 }).on('whenCreationReachesPatrolWaypoint', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.creationEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.creationGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.currentPatrolTemplateId, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.currentPathIndex, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.currentReachedWaypointId, 'str')
  f.printString(s5)
  const s6 = f.dataTypeConversion(evt.nextWaypointId, 'str')
  f.printString(s6)
})

g.server({ id: 1073741866 }).on('whenCustomShopItemIsSold', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.shopOwner, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.shopOwnerGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.buyerEntity, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.shopId, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.shopItemId, 'str')
  f.printString(s5)
  const s6 = f.dataTypeConversion(evt.purchaseQuantity, 'str')
  f.printString(s6)
})

g.server({ id: 1073741866 }).on('whenCustomVariableChanges', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  f.printString(evt.variableName)
  const gen3 = evt.preChangeValue.asType('int')
  const s4 = f.dataTypeConversion(gen3, 'str')
  f.printString(s4)
  const gen5 = evt.postChangeValue.asType('int')
  const s6 = f.dataTypeConversion(gen5, 'str')
  f.printString(s6)
})

g.server({ id: 1073741866 }).on('whenDeckSelectorIsComplete', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.targetPlayer, 'str')
  f.printString(s1)
  const len2 = f.getListLength(evt.selectionResultList)
  const s3 = f.dataTypeConversion(len2, 'str')
  f.printString(s3)
  const enumEq4 = f.enumerationsEqual(evt.completionReason, evt.completionReason)
  const s5 = f.dataTypeConversion(enumEq4, 'str')
  f.printString(s5)
  const s6 = f.dataTypeConversion(evt.deckSelectorIndex, 'str')
  f.printString(s6)
})

g.server({ id: 1073741866 }).on('whenElementalReactionEventOccurs', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const enumEq3 = f.enumerationsEqual(evt.elementalReactionType, evt.elementalReactionType)
  const s4 = f.dataTypeConversion(enumEq3, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.triggererEntity, 'str')
  f.printString(s5)
  const s6 = f.dataTypeConversion(evt.triggererEntityGuid, 'str')
  f.printString(s6)
})

g.server({ id: 1073741866 }).on('whenEnteringAnInterruptibleState', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.attacker, 'str')
  f.printString(s3)
})

g.server({ id: 1073741866 }).on('whenEnteringCollisionTrigger', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.enteringEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.enteringEntityGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.triggerEntity, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.triggerEntityGuid, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.triggerId, 'str')
  f.printString(s5)
})

g.server({ id: 1073741866 }).on('whenEntityFactionChanges', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.preChangeFaction, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.postChangeFaction, 'str')
  f.printString(s4)
})

g.server({ id: 1073741866 }).on('whenEntityIsCreated', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
})

g.server({ id: 1073741866 }).on('whenEntityIsDestroyed', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.location, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.orientation, 'str')
  f.printString(s4)
  const enumEq5 = f.enumerationsEqual(evt.entityType, evt.entityType)
  const s6 = f.dataTypeConversion(enumEq5, 'str')
  f.printString(s6)
  const s7 = f.dataTypeConversion(evt.faction, 'str')
  f.printString(s7)
  const s8 = f.dataTypeConversion(evt.damageSource, 'str')
  f.printString(s8)
  const s9 = f.dataTypeConversion(evt.ownerEntity, 'str')
  f.printString(s9)
  const snap10 = f.queryCustomVariableSnapshot(evt.customVariableComponentSnapshot, 'snapshot_var')
  const snapVal11 = snap10.asType('int')
  const s12 = f.dataTypeConversion(snapVal11, 'str')
  f.printString(s12)
})

g.server({ id: 1073741866 }).on('whenEntityIsRemovedDestroyed', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s1)
})

g.server({ id: 1073741866 }).on('whenEquipmentAffixValueChanges', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.equipmentOwner, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.equipmentOwnerGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.equipmentIndex, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.affixId, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.preChangeValue, 'str')
  f.printString(s5)
  const s6 = f.dataTypeConversion(evt.postChangeValue, 'str')
  f.printString(s6)
})

g.server({ id: 1073741866 }).on('whenEquipmentIsEquipped', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.equipmentHolderEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.equipmentHolderGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.equipmentIndex, 'str')
  f.printString(s3)
})

g.server({ id: 1073741866 }).on('whenEquipmentIsInitialized', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.equipmentOwner, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.equipmentOwnerGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.equipmentIndex, 'str')
  f.printString(s3)
})

g.server({ id: 1073741866 }).on('whenEquipmentIsUnequipped', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.equipmentOwnerEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.equipmentOwnerGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.equipmentIndex, 'str')
  f.printString(s3)
})

g.server({ id: 1073741866 }).on('whenExitingCollisionTrigger', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.exitingEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.exitingEntityGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.triggerEntity, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.triggerEntityGuid, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.triggerId, 'str')
  f.printString(s5)
})

g.server({ id: 1073741866 }).on('whenGlobalTimerIsTriggered', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  f.printString(evt.timerName)
})

g.server({ id: 1073741866 }).on('whenHpIsRecovered', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.healerEntity, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.recoveryAmount, 'str')
  f.printString(s4)
  const len5 = f.getListLength(evt.recoverTagList)
  const s6 = f.dataTypeConversion(len5, 'str')
  f.printString(s6)
})

g.server({ id: 1073741866 }).on('whenInitiatingHpRecovery', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.recoverTargetEntity, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.recoveryAmount, 'str')
  f.printString(s4)
  const len5 = f.getListLength(evt.recoverTagList)
  const s6 = f.dataTypeConversion(len5, 'str')
  f.printString(s6)
})

g.server({ id: 1073741866 }).on('whenItemIsAddedToInventory', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.itemOwnerEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.itemOwnerGuid, 'str')
  f.printString(s2)
  const eq3 = f.equal(evt.itemConfigId, evt.itemConfigId)
  const s4 = f.dataTypeConversion(eq3, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.quantityObtained, 'str')
  f.printString(s5)
})

g.server({ id: 1073741866 }).on('whenItemIsLostFromInventory', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.itemOwnerEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.itemOwnerGuid, 'str')
  f.printString(s2)
  const eq3 = f.equal(evt.itemConfigId, evt.itemConfigId)
  const s4 = f.dataTypeConversion(eq3, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.quantityLost, 'str')
  f.printString(s5)
})

g.server({ id: 1073741866 }).on('whenItemsInTheInventoryAreUsed', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.itemOwnerEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.itemOwnerGuid, 'str')
  f.printString(s2)
  const eq3 = f.equal(evt.itemConfigId, evt.itemConfigId)
  const s4 = f.dataTypeConversion(eq3, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.amountToUse, 'str')
  f.printString(s5)
})

g.server({ id: 1073741866 }).on('whenNodeGraphVariableChanges', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  f.printString(evt.variableName)
  const gen3 = evt.preChangeValue.asType('int')
  const s4 = f.dataTypeConversion(gen3, 'str')
  f.printString(s4)
  const gen5 = evt.postChangeValue.asType('int')
  const s6 = f.dataTypeConversion(gen5, 'str')
  f.printString(s6)
})

g.server({ id: 1073741866 }).on('whenOnHitDetectionIsTriggered', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.onHitHurtbox, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.onHitEntity, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.onHitLocation, 'str')
  f.printString(s5)
})

g.server({ id: 1073741866 }).on('whenPathReachesWaypoint', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  f.printString(evt.motionDeviceName)
  const s3 = f.dataTypeConversion(evt.pathPointId, 'str')
  f.printString(s3)
})

g.server({ id: 1073741866 }).on('whenPlayerClassChanges', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const eq3 = f.equal(evt.preModificationClassConfigId, evt.preModificationClassConfigId)
  const s4 = f.dataTypeConversion(eq3, 'str')
  f.printString(s4)
  const eq5 = f.equal(evt.postModificationConfigId, evt.postModificationConfigId)
  const s6 = f.dataTypeConversion(eq5, 'str')
  f.printString(s6)
})

g.server({ id: 1073741866 }).on('whenPlayerClassIsRemoved', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const eq3 = f.equal(evt.preModificationClassConfigId, evt.preModificationClassConfigId)
  const s4 = f.dataTypeConversion(eq3, 'str')
  f.printString(s4)
  const eq5 = f.equal(evt.postModificationConfigId, evt.postModificationConfigId)
  const s6 = f.dataTypeConversion(eq5, 'str')
  f.printString(s6)
})

g.server({ id: 1073741866 }).on('whenPlayerClassLevelChanges', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.preChangeLevel, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.postChangeLevel, 'str')
  f.printString(s4)
})

g.server({ id: 1073741866 }).on('whenPlayerIsAbnormallyDownedAndRevives', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.playerEntity, 'str')
  f.printString(s1)
})

g.server({ id: 1073741866 }).on('whenPlayerTeleportCompletes', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.playerEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.playerGuid, 'str')
  f.printString(s2)
})

g.server({ id: 1073741866 }).on('whenPresetStatusChanges', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.presetStatusId, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.preChangeValue, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.postChangeValue, 'str')
  f.printString(s5)
})

g.server({ id: 1073741866 }).on('whenSelfEntersCombat', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
})

g.server({ id: 1073741866 }).on('whenSelfLeavesCombat', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
})

g.server({ id: 1073741866 }).on('whenSellingInventoryItemsInTheShop', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.shopOwner, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.shopOwnerGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.buyerEntity, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.shopId, 'str')
  f.printString(s4)
  const eq5 = f.equal(evt.itemConfigId, evt.itemConfigId)
  const s6 = f.dataTypeConversion(eq5, 'str')
  f.printString(s6)
  const s7 = f.dataTypeConversion(evt.purchaseQuantity, 'str')
  f.printString(s7)
})

g.server({ id: 1073741866 }).on('whenSellingItemsToTheShop', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.shopOwner, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.shopOwnerGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.sellerEntity, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.shopId, 'str')
  f.printString(s4)
  const len5 = f.queryDictionarySLength(evt.purchaseItemDictionary)
  const s6 = f.dataTypeConversion(len5, 'str')
  f.printString(s6)
})

g.server({ id: 1073741866 }).on('whenShieldIsAttacked', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.attackerEntity, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.attackerGuid, 'str')
  f.printString(s4)
  const eq5 = f.equal(evt.unitStatusConfigId, evt.unitStatusConfigId)
  const s6 = f.dataTypeConversion(eq5, 'str')
  f.printString(s6)
  const s7 = f.dataTypeConversion(evt.preAttackLayers, 'str')
  f.printString(s7)
  const s8 = f.dataTypeConversion(evt.postAttackLayers, 'str')
  f.printString(s8)
  const s9 = f.dataTypeConversion(evt.shieldValueOfThisUnitStatusBeforeAttack, 'str')
  f.printString(s9)
  const s10 = f.dataTypeConversion(evt.shieldValueOfThisUnitStatusAfterAttack, 'str')
  f.printString(s10)
})

g.server({ id: 1073741866 }).on('whenSkillNodeIsCalled', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.callerEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.callerGuid, 'str')
  f.printString(s2)
  f.printString(evt.parameter1)
  f.printString(evt.parameter2)
  f.printString(evt.parameter3)
})

g.server({ id: 1073741866 }).on('whenTabIsSelected', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.tabId, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.selectorEntity, 'str')
  f.printString(s4)
})

g.server({ id: 1073741866 }).on('whenTextBubbleIsCompleted', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.bubbleOwnerEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.characterEntity, 'str')
  f.printString(s2)
  const eq3 = f.equal(evt.textBubbleConfigurationId, evt.textBubbleConfigurationId)
  const s4 = f.dataTypeConversion(eq3, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.textBubbleCompletionCount, 'str')
  f.printString(s5)
})

g.server({ id: 1073741866 }).on('whenTheCharacterIsDown', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.characterEntity, 'str')
  f.printString(s1)
  const enumEq2 = f.enumerationsEqual(evt.reason, evt.reason)
  const s3 = f.dataTypeConversion(enumEq2, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.knockdownEntity, 'str')
  f.printString(s4)
})

g.server({ id: 1073741866 }).on('whenTheQuantityOfInventoryCurrencyChanges', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.currencyOwnerEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.currencyOwnerGuid, 'str')
  f.printString(s2)
  const eq3 = f.equal(evt.currencyConfigId, evt.currencyConfigId)
  const s4 = f.dataTypeConversion(eq3, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.currencyChangeValue, 'str')
  f.printString(s5)
})

g.server({ id: 1073741866 }).on('whenTheQuantityOfInventoryItemChanges', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.itemOwnerEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.itemOwnerGuid, 'str')
  f.printString(s2)
  const eq3 = f.equal(evt.itemConfigId, evt.itemConfigId)
  const s4 = f.dataTypeConversion(eq3, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.preChangeQuantity, 'str')
  f.printString(s5)
  const s6 = f.dataTypeConversion(evt.postChangeQuantity, 'str')
  f.printString(s6)
  const enumEq7 = f.enumerationsEqual(evt.reasonForChange, evt.reasonForChange)
  const s8 = f.dataTypeConversion(enumEq7, 'str')
  f.printString(s8)
})

g.server({ id: 1073741866 }).on('whenTimerIsTriggered', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  f.printString(evt.timerName)
  const s3 = f.dataTypeConversion(evt.timerSequenceId, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.numberOfLoops, 'str')
  f.printString(s4)
})

g.server({ id: 1073741866 }).on('whenUiControlGroupIsTriggered', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const s3 = f.dataTypeConversion(evt.uiControlGroupCompositeIndex, 'str')
  f.printString(s3)
  const s4 = f.dataTypeConversion(evt.uiControlGroupIndex, 'str')
  f.printString(s4)
})

g.server({ id: 1073741866 }).on('whenUnitStatusChanges', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const eq3 = f.equal(evt.unitStatusConfigId, evt.unitStatusConfigId)
  const s4 = f.dataTypeConversion(eq3, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.applierEntity, 'str')
  f.printString(s5)
  const s6 = f.dataTypeConversion(evt.infiniteDuration, 'str')
  f.printString(s6)
  const s7 = f.dataTypeConversion(evt.remainingStatusDuration, 'str')
  f.printString(s7)
  const s8 = f.dataTypeConversion(evt.remainingStatusStacks, 'str')
  f.printString(s8)
  const s9 = f.dataTypeConversion(evt.originalStatusStacks, 'str')
  f.printString(s9)
  const s10 = f.dataTypeConversion(evt.slotId, 'str')
  f.printString(s10)
})

g.server({ id: 1073741866 }).on('whenUnitStatusEnds', (evt, f) => {
  const s1 = f.dataTypeConversion(evt.eventSourceEntity, 'str')
  f.printString(s1)
  const s2 = f.dataTypeConversion(evt.eventSourceGuid, 'str')
  f.printString(s2)
  const eq3 = f.equal(evt.unitStatusConfigId, evt.unitStatusConfigId)
  const s4 = f.dataTypeConversion(eq3, 'str')
  f.printString(s4)
  const s5 = f.dataTypeConversion(evt.applierEntity, 'str')
  f.printString(s5)
  const s6 = f.dataTypeConversion(evt.infiniteDuration, 'str')
  f.printString(s6)
  const s7 = f.dataTypeConversion(evt.remainingStatusDuration, 'str')
  f.printString(s7)
  const s8 = f.dataTypeConversion(evt.remainingStatusStacks, 'str')
  f.printString(s8)
  const s9 = f.dataTypeConversion(evt.removerEntity, 'str')
  f.printString(s9)
  const enumEq10 = f.enumerationsEqual(evt.removalReason, evt.removalReason)
  const s11 = f.dataTypeConversion(enumEq10, 'str')
  f.printString(s11)
  const s12 = f.dataTypeConversion(evt.slotId, 'str')
  f.printString(s12)
})
