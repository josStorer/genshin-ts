import {
  bool,
  configId,
  customVariableSnapshot,
  dict,
  entity,
  enumeration,
  faction,
  float,
  generic,
  guid,
  int,
  str,
  vec3
} from '../runtime/value.js'

export const ServerEventMetadata = {
  // === AUTO-GENERATED START ===
  whenNodeGraphVariableChanges: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'variableName', typeBase: str, typeName: 'str', isArray: false },
    { name: 'preChangeValue', typeBase: generic, typeName: 'generic', isArray: false },
    { name: 'postChangeValue', typeBase: generic, typeName: 'generic', isArray: false }
  ],
  whenCustomVariableChanges: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'variableName', typeBase: str, typeName: 'str', isArray: false },
    { name: 'preChangeValue', typeBase: generic, typeName: 'generic', isArray: false },
    { name: 'postChangeValue', typeBase: generic, typeName: 'generic', isArray: false }
  ],
  whenPresetStatusChanges: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'presetStatusId', typeBase: int, typeName: 'int', isArray: false },
    { name: 'preChangeValue', typeBase: int, typeName: 'int', isArray: false },
    { name: 'postChangeValue', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenComplexCreationPresetStatusChanges: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'presetStatusIndex', typeBase: int, typeName: 'int', isArray: false },
    { name: 'preChangeValue', typeBase: int, typeName: 'int', isArray: false },
    { name: 'postChangeValue', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenCharacterMovementSpdMeetsCondition: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'unitStatusConfigId', typeBase: configId, typeName: 'configId', isArray: false },
    {
      name: 'conditionComparisonType',
      typeBase: enumeration,
      typeName: 'ComparisonOperator',
      isArray: false
    },
    { name: 'conditionComparisonValue', typeBase: float, typeName: 'float', isArray: false },
    { name: 'currentMovementSpd', typeBase: float, typeName: 'float', isArray: false }
  ],
  whenEntityIsCreated: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false }
  ],
  whenEntityIsDestroyed: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'location', typeBase: vec3, typeName: 'vec3', isArray: false },
    { name: 'orientation', typeBase: vec3, typeName: 'vec3', isArray: false },
    { name: 'entityType', typeBase: enumeration, typeName: 'EntityType', isArray: false },
    { name: 'faction', typeBase: faction, typeName: 'faction', isArray: false },
    { name: 'damageSource', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'ownerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    {
      name: 'customVariableComponentSnapshot',
      typeBase: customVariableSnapshot,
      typeName: 'customVariableSnapshot',
      isArray: false
    }
  ],
  whenEntityIsRemovedDestroyed: [
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false }
  ],
  whenEntityFactionChanges: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'preChangeFaction', typeBase: faction, typeName: 'faction', isArray: false },
    { name: 'postChangeFaction', typeBase: faction, typeName: 'faction', isArray: false }
  ],
  whenTheCharacterIsDown: [
    { name: 'characterEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'reason', typeBase: enumeration, typeName: 'CauseOfBeingDown', isArray: false },
    { name: 'knockdownEntity', typeBase: entity, typeName: 'entity', isArray: false }
  ],
  whenCharacterRevives: [
    { name: 'characterEntity', typeBase: entity, typeName: 'entity', isArray: false }
  ],
  whenPlayerTeleportCompletes: [
    { name: 'playerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'playerGuid', typeBase: guid, typeName: 'guid', isArray: false }
  ],
  whenAllPlayerSCharactersAreDown: [
    { name: 'playerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'reason', typeBase: enumeration, typeName: 'CauseOfBeingDown', isArray: false }
  ],
  whenAllPlayerSCharactersAreRevived: [
    { name: 'playerEntity', typeBase: entity, typeName: 'entity', isArray: false }
  ],
  whenPlayerIsAbnormallyDownedAndRevives: [
    { name: 'playerEntity', typeBase: entity, typeName: 'entity', isArray: false }
  ],
  whenTheActiveCharacterChanges: [
    { name: 'playerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'playerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    {
      name: 'previousActiveCharacterEntity',
      typeBase: entity,
      typeName: 'entity',
      isArray: false
    },
    { name: 'currentActiveCharacterEntity', typeBase: entity, typeName: 'entity', isArray: false }
  ],
  whenEnteringCollisionTrigger: [
    { name: 'enteringEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'enteringEntityGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'triggerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'triggerEntityGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'triggerId', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenExitingCollisionTrigger: [
    { name: 'exitingEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'exitingEntityGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'triggerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'triggerEntityGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'triggerId', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenHpIsRecovered: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'healerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'recoveryAmount', typeBase: float, typeName: 'float', isArray: false },
    { name: 'recoverTagList', typeBase: str, typeName: 'str', isArray: true }
  ],
  whenInitiatingHpRecovery: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'recoverTargetEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'recoveryAmount', typeBase: float, typeName: 'float', isArray: false },
    { name: 'recoverTagList', typeBase: str, typeName: 'str', isArray: true }
  ],
  whenAttackHits: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'hitTargetEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'damage', typeBase: float, typeName: 'float', isArray: false },
    { name: 'attackTagList', typeBase: str, typeName: 'str', isArray: true },
    { name: 'elementalType', typeBase: enumeration, typeName: 'ElementalType', isArray: false },
    { name: 'elementalAttackPotency', typeBase: float, typeName: 'float', isArray: false }
  ],
  whenAttacked: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'attackerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'damage', typeBase: float, typeName: 'float', isArray: false },
    { name: 'attackTagList', typeBase: str, typeName: 'str', isArray: true },
    { name: 'elementalType', typeBase: enumeration, typeName: 'ElementalType', isArray: false },
    { name: 'elementalAttackPotency', typeBase: float, typeName: 'float', isArray: false }
  ],
  whenEnteringAnInterruptibleState: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'attacker', typeBase: entity, typeName: 'entity', isArray: false }
  ],
  whenBasicMotionDeviceStops: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'motionDeviceName', typeBase: str, typeName: 'str', isArray: false }
  ],
  whenPathReachesWaypoint: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'motionDeviceName', typeBase: str, typeName: 'str', isArray: false },
    { name: 'pathPointId', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenOnHitDetectionIsTriggered: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'onHitHurtbox', typeBase: bool, typeName: 'bool', isArray: false },
    { name: 'onHitEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'onHitLocation', typeBase: vec3, typeName: 'vec3', isArray: false }
  ],
  whenTimerIsTriggered: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'timerName', typeBase: str, typeName: 'str', isArray: false },
    { name: 'timerSequenceId', typeBase: int, typeName: 'int', isArray: false },
    { name: 'numberOfLoops', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenGlobalTimerIsTriggered: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'timerName', typeBase: str, typeName: 'str', isArray: false }
  ],
  whenUiControlGroupIsTriggered: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'uiControlGroupCompositeIndex', typeBase: int, typeName: 'int', isArray: false },
    { name: 'uiControlGroupIndex', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenUnitStatusChanges: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'unitStatusConfigId', typeBase: configId, typeName: 'configId', isArray: false },
    { name: 'applierEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'infiniteDuration', typeBase: bool, typeName: 'bool', isArray: false },
    { name: 'remainingStatusDuration', typeBase: float, typeName: 'float', isArray: false },
    { name: 'remainingStatusStacks', typeBase: int, typeName: 'int', isArray: false },
    { name: 'originalStatusStacks', typeBase: int, typeName: 'int', isArray: false },
    { name: 'slotId', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenUnitStatusEnds: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'unitStatusConfigId', typeBase: configId, typeName: 'configId', isArray: false },
    { name: 'applierEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'infiniteDuration', typeBase: bool, typeName: 'bool', isArray: false },
    { name: 'remainingStatusDuration', typeBase: float, typeName: 'float', isArray: false },
    { name: 'remainingStatusStacks', typeBase: int, typeName: 'int', isArray: false },
    { name: 'removerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    {
      name: 'removalReason',
      typeBase: enumeration,
      typeName: 'UnitStatusRemovalReason',
      isArray: false
    },
    { name: 'slotId', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenElementalReactionEventOccurs: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    {
      name: 'elementalReactionType',
      typeBase: enumeration,
      typeName: 'ElementalReactionType',
      isArray: false
    },
    { name: 'triggererEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'triggererEntityGuid', typeBase: guid, typeName: 'guid', isArray: false }
  ],
  whenShieldIsAttacked: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'attackerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'attackerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'unitStatusConfigId', typeBase: configId, typeName: 'configId', isArray: false },
    { name: 'preAttackLayers', typeBase: int, typeName: 'int', isArray: false },
    { name: 'postAttackLayers', typeBase: int, typeName: 'int', isArray: false },
    {
      name: 'shieldValueOfThisUnitStatusBeforeAttack',
      typeBase: float,
      typeName: 'float',
      isArray: false
    },
    {
      name: 'shieldValueOfThisUnitStatusAfterAttack',
      typeBase: float,
      typeName: 'float',
      isArray: false
    }
  ],
  whenTabIsSelected: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'tabId', typeBase: int, typeName: 'int', isArray: false },
    { name: 'selectorEntity', typeBase: entity, typeName: 'entity', isArray: false }
  ],
  whenCreationEntersCombat: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false }
  ],
  whenCreationLeavesCombat: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false }
  ],
  whenPlayerClassLevelChanges: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'preChangeLevel', typeBase: int, typeName: 'int', isArray: false },
    { name: 'postChangeLevel', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenPlayerClassChanges: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    {
      name: 'preModificationClassConfigId',
      typeBase: configId,
      typeName: 'configId',
      isArray: false
    },
    { name: 'postModificationConfigId', typeBase: configId, typeName: 'configId', isArray: false }
  ],
  whenPlayerClassIsRemoved: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    {
      name: 'preModificationClassConfigId',
      typeBase: configId,
      typeName: 'configId',
      isArray: false
    },
    { name: 'postModificationConfigId', typeBase: configId, typeName: 'configId', isArray: false }
  ],
  whenSkillNodeIsCalled: [
    { name: 'callerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'callerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'parameter1', typeBase: str, typeName: 'str', isArray: false },
    { name: 'parameter2', typeBase: str, typeName: 'str', isArray: false },
    { name: 'parameter3', typeBase: str, typeName: 'str', isArray: false }
  ],
  whenAggroTargetChanges: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'preChangeAggroTarget', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'postChangeAggroTarget', typeBase: entity, typeName: 'entity', isArray: false }
  ],
  whenSelfEntersCombat: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false }
  ],
  whenSelfLeavesCombat: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false }
  ],
  monitorSignal: [
    { name: 'eventSourceEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'eventSourceGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'signalSourceEntity', typeBase: entity, typeName: 'entity', isArray: false }
  ],
  whenDeckSelectorIsComplete: [
    { name: 'targetPlayer', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'selectionResultList', typeBase: int, typeName: 'int', isArray: true },
    {
      name: 'completionReason',
      typeBase: enumeration,
      typeName: 'SelectCompletionReason',
      isArray: false
    },
    { name: 'deckSelectorIndex', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenTextBubbleIsCompleted: [
    { name: 'bubbleOwnerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'characterEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'textBubbleConfigurationId', typeBase: configId, typeName: 'configId', isArray: false },
    { name: 'textBubbleCompletionCount', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenSellingInventoryItemsInTheShop: [
    { name: 'shopOwner', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'shopOwnerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'buyerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'shopId', typeBase: int, typeName: 'int', isArray: false },
    { name: 'itemConfigId', typeBase: configId, typeName: 'configId', isArray: false },
    { name: 'purchaseQuantity', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenCustomShopItemIsSold: [
    { name: 'shopOwner', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'shopOwnerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'buyerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'shopId', typeBase: int, typeName: 'int', isArray: false },
    { name: 'shopItemId', typeBase: int, typeName: 'int', isArray: false },
    { name: 'purchaseQuantity', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenSellingItemsToTheShop: [
    { name: 'shopOwner', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'shopOwnerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'sellerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'shopId', typeBase: int, typeName: 'int', isArray: false },
    { name: 'purchaseItemDictionary', typeBase: dict, typeName: 'dict', isArray: false }
  ],
  whenEquipmentIsEquipped: [
    { name: 'equipmentHolderEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'equipmentHolderGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'equipmentIndex', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenEquipmentIsUnequipped: [
    { name: 'equipmentOwnerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'equipmentOwnerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'equipmentIndex', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenEquipmentIsInitialized: [
    { name: 'equipmentOwner', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'equipmentOwnerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'equipmentIndex', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenEquipmentAffixValueChanges: [
    { name: 'equipmentOwner', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'equipmentOwnerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'equipmentIndex', typeBase: int, typeName: 'int', isArray: false },
    { name: 'affixId', typeBase: int, typeName: 'int', isArray: false },
    { name: 'preChangeValue', typeBase: float, typeName: 'float', isArray: false },
    { name: 'postChangeValue', typeBase: float, typeName: 'float', isArray: false }
  ],
  whenItemIsLostFromInventory: [
    { name: 'itemOwnerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'itemOwnerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'itemConfigId', typeBase: configId, typeName: 'configId', isArray: false },
    { name: 'quantityLost', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenTheQuantityOfInventoryItemChanges: [
    { name: 'itemOwnerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'itemOwnerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'itemConfigId', typeBase: configId, typeName: 'configId', isArray: false },
    { name: 'preChangeQuantity', typeBase: int, typeName: 'int', isArray: false },
    { name: 'postChangeQuantity', typeBase: int, typeName: 'int', isArray: false },
    {
      name: 'reasonForChange',
      typeBase: enumeration,
      typeName: 'ReasonForItemChange',
      isArray: false
    }
  ],
  whenItemIsAddedToInventory: [
    { name: 'itemOwnerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'itemOwnerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'itemConfigId', typeBase: configId, typeName: 'configId', isArray: false },
    { name: 'quantityObtained', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenTheQuantityOfInventoryCurrencyChanges: [
    { name: 'currencyOwnerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'currencyOwnerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'currencyConfigId', typeBase: configId, typeName: 'configId', isArray: false },
    { name: 'currencyChangeValue', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenItemsInTheInventoryAreUsed: [
    { name: 'itemOwnerEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'itemOwnerGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'itemConfigId', typeBase: configId, typeName: 'configId', isArray: false },
    { name: 'amountToUse', typeBase: int, typeName: 'int', isArray: false }
  ],
  whenCreationReachesPatrolWaypoint: [
    { name: 'creationEntity', typeBase: entity, typeName: 'entity', isArray: false },
    { name: 'creationGuid', typeBase: guid, typeName: 'guid', isArray: false },
    { name: 'currentPatrolTemplateId', typeBase: int, typeName: 'int', isArray: false },
    { name: 'currentPathIndex', typeBase: int, typeName: 'int', isArray: false },
    { name: 'currentReachedWaypointId', typeBase: int, typeName: 'int', isArray: false },
    { name: 'nextWaypointId', typeBase: int, typeName: 'int', isArray: false }
  ]
  // === AUTO-GENERATED END ===
} as const

export type ServerEventMetadataType = typeof ServerEventMetadata

export type ServerEventName = keyof ServerEventMetadataType

// export type ServerEventPayloads = {
//   [K in keyof ServerEventMetadataType]: {
//     [P in ServerEventMetadataType[K][number] as P['name']]: P['isArray'] extends true
//       ? InstanceType<P['typeBase']>[]
//       : InstanceType<P['typeBase']>
//   }
// }
