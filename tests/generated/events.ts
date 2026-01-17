import { g } from 'genshin-ts/runtime/core'

// AUTO-GENERATED: server events
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741843 }).onSignal("monitor_signal", (_evt, f) => {
  f.printString("event_monitorSignal")
})

g.server({ id: 1073741843 }).on("whenAggroTargetChanges", (_evt, f) => {
  f.printString("event_whenAggroTargetChanges")
})

g.server({ id: 1073741843 }).on("whenAllPlayerSCharactersAreDown", (_evt, f) => {
  f.printString("event_whenAllPlayerSCharactersAreDown")
})

g.server({ id: 1073741843 }).on("whenAllPlayerSCharactersAreRevived", (_evt, f) => {
  f.printString("event_whenAllPlayerSCharactersAreRevived")
})

g.server({ id: 1073741843 }).on("whenAttackHits", (_evt, f) => {
  f.printString("event_whenAttackHits")
})

g.server({ id: 1073741843 }).on("whenAttacked", (_evt, f) => {
  f.printString("event_whenAttacked")
})

g.server({ id: 1073741843 }).on("whenBasicMotionDeviceStops", (_evt, f) => {
  f.printString("event_whenBasicMotionDeviceStops")
})

g.server({ id: 1073741843 }).on("whenCharacterMovementSpdMeetsCondition", (_evt, f) => {
  f.printString("event_whenCharacterMovementSpdMeetsCondition")
})

g.server({ id: 1073741843 }).on("whenCharacterRevives", (_evt, f) => {
  f.printString("event_whenCharacterRevives")
})

g.server({ id: 1073741843 }).on("whenComplexCreationPresetStatusChanges", (_evt, f) => {
  f.printString("event_whenComplexCreationPresetStatusChanges")
})

g.server({ id: 1073741843 }).on("whenCreationEntersCombat", (_evt, f) => {
  f.printString("event_whenCreationEntersCombat")
})

g.server({ id: 1073741843 }).on("whenCreationLeavesCombat", (_evt, f) => {
  f.printString("event_whenCreationLeavesCombat")
})

g.server({ id: 1073741843 }).on("whenCreationReachesPatrolWaypoint", (_evt, f) => {
  f.printString("event_whenCreationReachesPatrolWaypoint")
})

g.server({ id: 1073741843 }).on("whenCustomShopItemIsSold", (_evt, f) => {
  f.printString("event_whenCustomShopItemIsSold")
})

g.server({ id: 1073741843 }).on("whenCustomVariableChanges", (_evt, f) => {
  f.printString("event_whenCustomVariableChanges")
})

g.server({ id: 1073741843 }).on("whenDeckSelectorIsComplete", (_evt, f) => {
  f.printString("event_whenDeckSelectorIsComplete")
})

g.server({ id: 1073741843 }).on("whenElementalReactionEventOccurs", (_evt, f) => {
  f.printString("event_whenElementalReactionEventOccurs")
})

g.server({ id: 1073741843 }).on("whenEnteringAnInterruptibleState", (_evt, f) => {
  f.printString("event_whenEnteringAnInterruptibleState")
})

g.server({ id: 1073741843 }).on("whenEnteringCollisionTrigger", (_evt, f) => {
  f.printString("event_whenEnteringCollisionTrigger")
})

g.server({ id: 1073741843 }).on("whenEntityFactionChanges", (_evt, f) => {
  f.printString("event_whenEntityFactionChanges")
})

g.server({ id: 1073741843 }).on("whenEntityIsCreated", (_evt, f) => {
  f.printString("event_whenEntityIsCreated")
})

g.server({ id: 1073741843 }).on("whenEntityIsDestroyed", (_evt, f) => {
  f.printString("event_whenEntityIsDestroyed")
})

g.server({ id: 1073741843 }).on("whenEntityIsRemovedDestroyed", (_evt, f) => {
  f.printString("event_whenEntityIsRemovedDestroyed")
})

g.server({ id: 1073741843 }).on("whenEquipmentAffixValueChanges", (_evt, f) => {
  f.printString("event_whenEquipmentAffixValueChanges")
})

g.server({ id: 1073741843 }).on("whenEquipmentIsEquipped", (_evt, f) => {
  f.printString("event_whenEquipmentIsEquipped")
})

g.server({ id: 1073741843 }).on("whenEquipmentIsInitialized", (_evt, f) => {
  f.printString("event_whenEquipmentIsInitialized")
})

g.server({ id: 1073741843 }).on("whenEquipmentIsUnequipped", (_evt, f) => {
  f.printString("event_whenEquipmentIsUnequipped")
})

g.server({ id: 1073741843 }).on("whenExitingCollisionTrigger", (_evt, f) => {
  f.printString("event_whenExitingCollisionTrigger")
})

g.server({ id: 1073741843 }).on("whenGlobalTimerIsTriggered", (_evt, f) => {
  f.printString("event_whenGlobalTimerIsTriggered")
})

g.server({ id: 1073741843 }).on("whenHpIsRecovered", (_evt, f) => {
  f.printString("event_whenHpIsRecovered")
})

g.server({ id: 1073741843 }).on("whenInitiatingHpRecovery", (_evt, f) => {
  f.printString("event_whenInitiatingHpRecovery")
})

g.server({ id: 1073741843 }).on("whenItemIsAddedToInventory", (_evt, f) => {
  f.printString("event_whenItemIsAddedToInventory")
})

g.server({ id: 1073741843 }).on("whenItemIsLostFromInventory", (_evt, f) => {
  f.printString("event_whenItemIsLostFromInventory")
})

g.server({ id: 1073741843 }).on("whenItemsInTheInventoryAreUsed", (_evt, f) => {
  f.printString("event_whenItemsInTheInventoryAreUsed")
})

g.server({ id: 1073741843 }).on("whenNodeGraphVariableChanges", (_evt, f) => {
  f.printString("event_whenNodeGraphVariableChanges")
})

g.server({ id: 1073741843 }).on("whenOnHitDetectionIsTriggered", (_evt, f) => {
  f.printString("event_whenOnHitDetectionIsTriggered")
})

g.server({ id: 1073741843 }).on("whenPathReachesWaypoint", (_evt, f) => {
  f.printString("event_whenPathReachesWaypoint")
})

g.server({ id: 1073741843 }).on("whenPlayerClassChanges", (_evt, f) => {
  f.printString("event_whenPlayerClassChanges")
})

g.server({ id: 1073741843 }).on("whenPlayerClassIsRemoved", (_evt, f) => {
  f.printString("event_whenPlayerClassIsRemoved")
})

g.server({ id: 1073741843 }).on("whenPlayerClassLevelChanges", (_evt, f) => {
  f.printString("event_whenPlayerClassLevelChanges")
})

g.server({ id: 1073741843 }).on("whenPlayerIsAbnormallyDownedAndRevives", (_evt, f) => {
  f.printString("event_whenPlayerIsAbnormallyDownedAndRevives")
})

g.server({ id: 1073741843 }).on("whenPlayerTeleportCompletes", (_evt, f) => {
  f.printString("event_whenPlayerTeleportCompletes")
})

g.server({ id: 1073741843 }).on("whenPresetStatusChanges", (_evt, f) => {
  f.printString("event_whenPresetStatusChanges")
})

g.server({ id: 1073741843 }).on("whenSelfEntersCombat", (_evt, f) => {
  f.printString("event_whenSelfEntersCombat")
})

g.server({ id: 1073741843 }).on("whenSelfLeavesCombat", (_evt, f) => {
  f.printString("event_whenSelfLeavesCombat")
})

g.server({ id: 1073741843 }).on("whenSellingInventoryItemsInTheShop", (_evt, f) => {
  f.printString("event_whenSellingInventoryItemsInTheShop")
})

g.server({ id: 1073741843 }).on("whenSellingItemsToTheShop", (_evt, f) => {
  f.printString("event_whenSellingItemsToTheShop")
})

g.server({ id: 1073741843 }).on("whenShieldIsAttacked", (_evt, f) => {
  f.printString("event_whenShieldIsAttacked")
})

g.server({ id: 1073741843 }).on("whenSkillNodeIsCalled", (_evt, f) => {
  f.printString("event_whenSkillNodeIsCalled")
})

g.server({ id: 1073741843 }).on("whenTabIsSelected", (_evt, f) => {
  f.printString("event_whenTabIsSelected")
})

g.server({ id: 1073741843 }).on("whenTextBubbleIsCompleted", (_evt, f) => {
  f.printString("event_whenTextBubbleIsCompleted")
})

g.server({ id: 1073741843 }).on("whenTheActiveCharacterChanges", (_evt, f) => {
  f.printString("event_whenTheActiveCharacterChanges")
})

g.server({ id: 1073741843 }).on("whenTheCharacterIsDown", (_evt, f) => {
  f.printString("event_whenTheCharacterIsDown")
})

g.server({ id: 1073741843 }).on("whenTheQuantityOfInventoryCurrencyChanges", (_evt, f) => {
  f.printString("event_whenTheQuantityOfInventoryCurrencyChanges")
})

g.server({ id: 1073741843 }).on("whenTheQuantityOfInventoryItemChanges", (_evt, f) => {
  f.printString("event_whenTheQuantityOfInventoryItemChanges")
})

g.server({ id: 1073741843 }).on("whenTimerIsTriggered", (_evt, f) => {
  f.printString("event_whenTimerIsTriggered")
})

g.server({ id: 1073741843 }).on("whenUiControlGroupIsTriggered", (_evt, f) => {
  f.printString("event_whenUiControlGroupIsTriggered")
})

g.server({ id: 1073741843 }).on("whenUnitStatusChanges", (_evt, f) => {
  f.printString("event_whenUnitStatusChanges")
})

g.server({ id: 1073741843 }).on("whenUnitStatusEnds", (_evt, f) => {
  f.printString("event_whenUnitStatusEnds")
})
