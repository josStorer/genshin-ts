import {
  entity,
  type BoolValue,
  type configId,
  type ConfigIdValue,
  type dict,
  type EntityValue,
  type faction,
  type FactionValue,
  type FloatValue,
  type generic,
  type guid,
  type GuidValue,
  type IntValue,
  type RuntimeParameterValueTypeMap,
  type StrValue,
  type vec3,
  type Vec3Value
} from '../runtime/value.js'
import type {
  CharacterSkillSlot,
  DamagePopUpType,
  DecisionRefreshMode,
  EntityType,
  FixedMotionParameterType,
  FollowCoordinateSystem,
  FollowLocationType,
  InputDeviceType,
  InterruptStatus,
  ItemLootType,
  MovementMode,
  RemovalMethod,
  ScanRuleType,
  SettlementStatus,
  SoundAttenuationMode,
  UIControlGroupStatus,
  UnitStatusAdditionResult
} from './enum.js'
import type { ServerExecutionFlowFunctions } from './nodes.js'

declare const __entityKind: unique symbol

export type EntityKind = 'player' | 'character' | 'stage' | 'object' | 'creation'
type EntityKindMarker<K extends EntityKind> = { readonly [__entityKind]?: K }

export type EntityOf<K extends EntityKind> = entity & EntityKindMarker<K>
export type EntityAny = entity

// Generated from src/definitions/nodes.ts (methods whose first param is entity-like).
const ENTITY_HELPER_METHODS = [
  'activateBasicMotionDevice',
  'activateDisableCollisionTrigger',
  'activateDisableCollisionTriggerSource',
  'activateDisableExtraCollision',
  'activateDisableExtraCollisionClimbability',
  'activateDisableFollowMotionDevice',
  'activateDisableModelDisplay',
  'activateDisableNativeCollision',
  'activateDisableNativeCollisionClimbability',
  'activateDisablePathfindingObstacle',
  'activateDisablePathfindingObstacleFeature',
  'activateDisableTab',
  'activateFixedPointMotionDevice',
  'activateRevivePoint',
  'activateUiControlGroupInControlGroupLibrary',
  'addCharacterSkill',
  'addItemsToThePurchaseList',
  'addNewItemToCustomShopSalesList',
  'addNewItemToInventoryShopSalesList',
  'addSoundEffectPlayer',
  'addTargetOrientedRotationBasedMotionDevice',
  'addUniformBasicLinearMotionDevice',
  'addUniformBasicRotationBasedMotionDevice',
  'addUnitStatus',
  'addUnitTagToEntity',
  'adjustPlayerBackgroundMusicVolume',
  'adjustSpecifiedSoundEffectPlayer',
  'allowForbidPlayerToRevive',
  'changeAchievementProgressTally',
  'changePlayerClass',
  'changePlayerSCurrentClassLevel',
  'checkClassicModeCharacterId',
  'checkEntitySElementalEffectStatus',
  'clearSpecialEffectsBasedOnSpecialEffectAssets',
  'clearSpecifiedTargetSAggroList',
  'clearUnitTagsFromEntity',
  'closeDeckSelector',
  'closeShop',
  'closeSpecifiedSoundEffectPlayer',
  'consumeGiftBox',
  'deactivateRevivePoint',
  'defeatAllPlayerSCharacters',
  'deleteCharacterSkillById',
  'deleteCharacterSkillBySlot',
  'destroyEntity',
  'forwardingEvent',
  'getActiveCharacterOfSpecifiedPlayer',
  'getAggroListOfCreationInDefaultMode',
  'getAllBasicItemsFromInventory',
  'getAllCharacterEntitiesOfSpecifiedPlayer',
  'getAllCurrencyFromInventory',
  'getAllCurrencyFromLootComponent',
  'getAllEntitiesWithinTheCollisionTrigger',
  'getAllEquipmentFromInventory',
  'getAllEquipmentFromLootComponent',
  'getAllItemsFromLootComponent',
  'getCharacterAttribute',
  'getCreationAttribute',
  'getCreationSCurrentTarget',
  'getCurrentCreationSPatrolTemplate',
  'getCurrentGlobalTimerTime',
  'getCustomVariable',
  'getEntityAdvancedAttribute',
  'getEntityElementalAttribute',
  'getEntityForwardVector',
  'getEntityLocationAndRotation',
  'getEntityRightVector',
  'getEntitySMiniMapMarkerStatus',
  'getEntityType',
  'getEntityUnitTagList',
  'getEntityUpwardVector',
  'getFollowMotionDeviceTarget',
  'getInventoryCapacity',
  'getInventoryCurrencyQuantity',
  'getInventoryItemQuantity',
  'getListOfEntitiesOwnedByTheEntity',
  'getListOfOwnersThatHaveTheTargetAsTheirAggroTarget',
  'getListOfOwnersWhoHaveTheTargetInTheirAggroList',
  'getLootComponentCurrencyQuantity',
  'getLootComponentItemQuantity',
  'getObjectAttribute',
  'getOwnerEntity',
  'getPlayerClientInputDeviceType',
  'getPlayerEntityToWhichTheCharacterBelongs',
  'getPlayerEscapeValidity',
  'getPlayerNickname',
  'getPlayerRankScoreChange',
  'getPlayerRankingInfo',
  'getPlayerRemainingRevives',
  'getPlayerReviveTime',
  'getPlayerSCurrentUiLayout',
  'getPlayerSettlementRankingValue',
  'getPlayerSettlementSuccessStatus',
  'getPresetStatus',
  'getTheAggroListOfTheSpecifiedEntity',
  'getTheAggroTargetOfTheSpecifiedEntity',
  'getTheCurrentlyActiveScanTagConfigId',
  'getTheEquipmentIndexOfTheSpecifiedEquipmentSlot',
  'getThePresetStatusValueOfTheComplexCreation',
  'hpLoss',
  'increaseMaximumInventoryCapacity',
  'increasesCharacterSElementalEnergy',
  'increasePlayerSCurrentClassExp',
  'initializeCharacterSkill',
  'initiateAttack',
  'invokeDeckSelector',
  'listOfSlotIdsQueryingUnitStatus',
  'modifyCharacterSkillCd',
  'modifyCustomShopItemSalesInfo',
  'modifyEntityFaction',
  'modifyGlobalTimer',
  'modifyInventoryCurrencyQuantity',
  'modifyInventoryItemQuantity',
  'modifyInventoryShopItemSalesInfo',
  'modifyItemPurchaseInfoInThePurchaseList',
  'modifyLootComponentCurrencyAmount',
  'modifyLootItemComponentQuantity',
  'modifyMiniMapMarkerActivationStatus',
  'modifyMiniMapZoom',
  'modifyPlayerBackgroundMusic',
  'modifyPlayerListForTrackingMiniMapMarkers',
  'modifyPlayerListForVisibleMiniMapMarkers',
  'modifyPlayerMarkersOnTheMiniMap',
  'modifySkillCdPercentageBasedOnMaxCd',
  'modifySkillResourceAmount',
  'modifyUiControlStatusWithinTheInterfaceLayout',
  'modifyingCharacterDisruptorDevice',
  'openShop',
  'pauseBasicMotionDevice',
  'pauseGlobalTimer',
  'pauseTimer',
  'playerPlaysOneShot2dSoundEffect',
  'queryCharacterSCurrentMovementSpd',
  'queryCharacterSkill',
  'queryCorrespondingGiftBoxConsumption',
  'queryCorrespondingGiftBoxQuantity',
  'queryCustomShopItemSalesInfo',
  'queryCustomShopItemSalesList',
  'queryEntityFaction',
  'queryGuidByEntity',
  'queryIfAchievementIsCompleted',
  'queryIfAllPlayerCharactersAreDown',
  'queryIfEntityHasUnitStatus',
  'queryIfEntityIsOnTheField',
  'queryIfSpecifiedEntityIsInCombat',
  'queryInventoryShopItemSalesInfo',
  'queryInventoryShopItemSalesList',
  'queryPlayerClass',
  'queryPlayerClassLevel',
  'queryShopItemPurchaseInfo',
  'queryShopPurchaseItemList',
  'querySpecifiedMiniMapMarkerInformation',
  'queryTheAggroMultiplierOfTheSpecifiedEntity',
  'queryTheAggroValueOfTheSpecifiedEntity',
  'queryUnitStatusApplierBySlotId',
  'queryUnitStatusStacksBySlotId',
  'recoverBasicMotionDevice',
  'recoverGlobalTimer',
  'recoverHp',
  'recoverHpDirectly',
  'removeEntity',
  'removeInterfaceControlGroupFromControlGroupLibrary',
  'removeItemFromCustomShopSalesList',
  'removeItemFromInventoryShopSalesList',
  'removeItemFromPurchaseList',
  'removeTargetEntityFromAggroList',
  'removeUnitStatus',
  'removeUnitTagFromEntity',
  'replaceEquipmentToTheSpecifiedSlot',
  'resumeTimer',
  'reviveActiveCharacter',
  'reviveAllPlayerSCharacters',
  'reviveCharacter',
  'setAchievementProgressTally',
  'setCharacterSElementalEnergy',
  'setCharacterSkillCd',
  'setCustomVariable',
  'setEntityActiveNameplate',
  'setInventoryDropItemsCurrencyAmount',
  'setInventoryItemDropContents',
  'setLootDropContent',
  'setPlayerEscapeValidity',
  'setPlayerRankScoreChange',
  'setPlayerRemainingRevives',
  'setPlayerReviveTime',
  'setPlayerSettlementRankingValue',
  'setPlayerSettlementScoreboardDataDisplay',
  'setPlayerSettlementSuccessStatus',
  'setPresetStatus',
  'setScanComponentSActiveScanTagId',
  'setScanTagRules',
  'setSkillResourceAmount',
  'setTheAggroValueOfSpecifiedEntity',
  'setThePresetStatusValueOfTheComplexCreation',
  'startGlobalTimer',
  'startPausePlayerBackgroundMusic',
  'startPauseSpecifiedSoundEffectPlayer',
  'startTimer',
  'stopAndDeleteBasicMotionDevice',
  'stopGlobalTimer',
  'stopTimer',
  'switchActiveTextBubble',
  'switchCreationPatrolTemplate',
  'switchCurrentInterfaceLayout',
  'switchFollowMotionDeviceTargetByEntity',
  'switchFollowMotionDeviceTargetByGuid',
  'switchTheScoringGroupThatAffectsPlayerSCompetitiveRank',
  'tauntTarget',
  'teleportPlayer',
  'toggleEntityLightSource',
  'triggerLootDrop'
] as const

const ENTITY_HELPER_OVERRIDE_INDEX = {
  playTimedEffects: 1,
  mountLoopingSpecialEffect: 1,
  clearLoopingSpecialEffect: 1
} as const

const ENTITY_HELPER_ALIAS_SOURCES = {
  pos: 'getEntityLocationAndRotation',
  rotation: 'getEntityLocationAndRotation',
  forward: 'getEntityForwardVector',
  right: 'getEntityRightVector',
  up: 'getEntityUpwardVector',
  elementalAttr: 'getEntityElementalAttribute',
  type: 'getEntityType',
  guid: 'queryGuidByEntity',
  nickname: 'getPlayerNickname',
  remainingRevives: 'getPlayerRemainingRevives',
  reviveTime: 'getPlayerReviveTime',
  uiLayout: 'getPlayerSCurrentUiLayout',
  settlementStatus: 'getPlayerSettlementSuccessStatus',
  settlementRanking: 'getPlayerSettlementRankingValue',
  rankingInfo: 'getPlayerRankingInfo',
  advancedAttr: 'getEntityAdvancedAttribute',
  objectAttr: 'getObjectAttribute',
  characterAttr: 'getCharacterAttribute',
  creationAttr: 'getCreationAttribute',
  movementInfo: 'queryCharacterSCurrentMovementSpd',
  speed: 'queryCharacterSCurrentMovementSpd',
  velocity: 'queryCharacterSCurrentMovementSpd',
  player: 'getPlayerEntityToWhichTheCharacterBelongs',
  currentTarget: 'getCreationSCurrentTarget',
  patrolTemplate: 'getCurrentCreationSPatrolTemplate',
  defaultAggroList: 'getAggroListOfCreationInDefaultMode',
  characters: 'getAllCharacterEntitiesOfSpecifiedPlayer',
  activeCharacter: 'getActiveCharacterOfSpecifiedPlayer',
  classicModeId: 'checkClassicModeCharacterId',
  class: 'queryPlayerClass',
  classLevel: 'queryPlayerClassLevel',
  inputDevice: 'getPlayerClientInputDeviceType'
} as const

const ENTITY_HELPER_METHOD_ALIAS_SOURCES = {
  destroy: 'destroyEntity',
  remove: 'removeEntity',
  get: 'getCustomVariable',
  set: 'setCustomVariable',
  faction: 'queryEntityFaction',
  setFaction: 'modifyEntityFaction',
  owner: 'getOwnerEntity',
  addTag: 'addUnitTagToEntity',
  removeTag: 'removeUnitTagFromEntity',
  clearTags: 'clearUnitTagsFromEntity',
  unitTags: 'getEntityUnitTagList',
  ownedEntities: 'getListOfEntitiesOwnedByTheEntity',
  aggroList: 'getTheAggroListOfTheSpecifiedEntity',
  aggroTarget: 'getTheAggroTargetOfTheSpecifiedEntity',
  setAggroValue: 'setTheAggroValueOfSpecifiedEntity',
  isOnField: 'queryIfEntityIsOnTheField',
  isInCombat: 'queryIfSpecifiedEntityIsInCombat',
  getPreset: 'getPresetStatus',
  setPreset: 'setPresetStatus',
  getCreationPresetValue: 'getThePresetStatusValueOfTheComplexCreation',
  setCreationPresetValue: 'setThePresetStatusValueOfTheComplexCreation',
  hasUnitStatus: 'queryIfEntityHasUnitStatus',
  teleport: 'teleportPlayer',
  revive: 'reviveCharacter',
  reviveAllCharacters: 'reviveAllPlayerSCharacters',
  defeatAllCharacters: 'defeatAllPlayerSCharacters',
  consumeGift: 'consumeGiftBox',
  rankScoreChange: 'getPlayerRankScoreChange',
  setRankScoreChange: 'setPlayerRankScoreChange',
  isEscapeValid: 'getPlayerEscapeValidity',
  setEscapeValid: 'setPlayerEscapeValidity',
  enableRevivePoint: 'activateRevivePoint',
  disableRevivePoint: 'deactivateRevivePoint',
  enableUiControlGroup: 'activateUiControlGroupInControlGroupLibrary',
  removeUiControlGroup: 'removeInterfaceControlGroupFromControlGroupLibrary',
  addSkill: 'addCharacterSkill',
  removeSkillById: 'deleteCharacterSkillById',
  removeSkillBySlot: 'deleteCharacterSkillBySlot',
  resetSkill: 'initializeCharacterSkill',
  openDeck: 'invokeDeckSelector',
  closeDeck: 'closeDeckSelector',
  addClassExp: 'increasePlayerSCurrentClassExp',
  setClass: 'changePlayerClass',
  setClassLevel: 'changePlayerSCurrentClassLevel',
  setBgmVolume: 'adjustPlayerBackgroundMusicVolume',
  setReviveAllowed: 'allowForbidPlayerToRevive',
  setMiniMapZoom: 'modifyMiniMapZoom',
  setBgm: 'modifyPlayerBackgroundMusic',
  pauseBgm: 'startPausePlayerBackgroundMusic',
  setUiControlStatus: 'modifyUiControlStatusWithinTheInterfaceLayout',
  addSkillCd: 'modifyCharacterSkillCd',
  setSkillCd: 'setCharacterSkillCd',
  scaleSkillCd: 'modifySkillCdPercentageBasedOnMaxCd',
  addSkillResource: 'modifySkillResourceAmount',
  setSkillResource: 'setSkillResourceAmount',
  addElementalEnergy: 'increasesCharacterSElementalEnergy',
  setElementalEnergy: 'setCharacterSElementalEnergy',
  playSfx2d: 'playerPlaysOneShot2dSoundEffect',
  getSkill: 'queryCharacterSkill',
  getGiftBoxConsumption: 'queryCorrespondingGiftBoxConsumption',
  getGiftBoxQuantity: 'queryCorrespondingGiftBoxQuantity',
  areAllCharactersDown: 'queryIfAllPlayerCharactersAreDown',
  setRemainingRevives: 'setPlayerRemainingRevives',
  setReviveTime: 'setPlayerReviveTime',
  setSettlementRanking: 'setPlayerSettlementRankingValue',
  setSettlementScoreboard: 'setPlayerSettlementScoreboardDataDisplay',
  setSettlementStatus: 'setPlayerSettlementSuccessStatus',
  switchPatrolTemplate: 'switchCreationPatrolTemplate',
  switchUiLayout: 'switchCurrentInterfaceLayout',
  switchRankGroup: 'switchTheScoringGroupThatAffectsPlayerSCompetitiveRank'
} as const

const ENTITY_HELPER_KIND_BY_KEY = {
  activateBasicMotionDevice: ['player', 'character', 'stage', 'object', 'creation'],
  activateDisableCollisionTrigger: ['player', 'character', 'stage', 'object', 'creation'],
  activateDisableCollisionTriggerSource: ['player', 'character', 'stage', 'object', 'creation'],
  activateDisableExtraCollision: ['player', 'character', 'stage', 'object', 'creation'],
  activateDisableExtraCollisionClimbability: ['player', 'character', 'stage', 'object', 'creation'],
  activateDisableFollowMotionDevice: ['player', 'character', 'stage', 'object', 'creation'],
  activateDisableModelDisplay: ['player', 'character', 'stage', 'object', 'creation'],
  activateDisableNativeCollision: ['player', 'character', 'stage', 'object', 'creation'],
  activateDisableNativeCollisionClimbability: [
    'player',
    'character',
    'stage',
    'object',
    'creation'
  ],
  activateDisablePathfindingObstacle: ['player', 'character', 'stage', 'object', 'creation'],
  activateDisablePathfindingObstacleFeature: ['player', 'character', 'stage', 'object', 'creation'],
  activateDisableTab: ['player', 'character', 'stage', 'object', 'creation'],
  activateFixedPointMotionDevice: ['player', 'character', 'stage', 'object', 'creation'],
  activateRevivePoint: ['player'],
  activateUiControlGroupInControlGroupLibrary: ['player'],
  addCharacterSkill: ['character'],
  addItemsToThePurchaseList: ['player', 'character', 'stage', 'object', 'creation'],
  addNewItemToCustomShopSalesList: ['player', 'character', 'stage', 'object', 'creation'],
  addNewItemToInventoryShopSalesList: ['player', 'character', 'stage', 'object', 'creation'],
  addSoundEffectPlayer: ['player', 'character', 'stage', 'object', 'creation'],
  addTargetOrientedRotationBasedMotionDevice: [
    'player',
    'character',
    'stage',
    'object',
    'creation'
  ],
  addUniformBasicLinearMotionDevice: ['player', 'character', 'stage', 'object', 'creation'],
  addUniformBasicRotationBasedMotionDevice: ['player', 'character', 'stage', 'object', 'creation'],
  addUnitStatus: ['player', 'character', 'stage', 'object', 'creation'],
  addUnitTagToEntity: ['player', 'character', 'stage', 'object', 'creation'],
  addTag: ['player', 'character', 'stage', 'object', 'creation'],
  adjustPlayerBackgroundMusicVolume: ['player'],
  adjustSpecifiedSoundEffectPlayer: ['player', 'character', 'stage', 'object', 'creation'],
  advancedAttr: ['player', 'character', 'stage', 'object', 'creation'],
  aggroList: ['player', 'character', 'stage', 'object', 'creation'],
  aggroTarget: ['player', 'character', 'stage', 'object', 'creation'],
  allowForbidPlayerToRevive: ['player'],
  changeAchievementProgressTally: ['player', 'character', 'stage', 'object', 'creation'],
  changePlayerClass: ['player'],
  changePlayerSCurrentClassLevel: ['player'],
  checkClassicModeCharacterId: ['character'],
  classicModeId: ['character'],
  checkEntitySElementalEffectStatus: ['player', 'character', 'stage', 'object', 'creation'],
  character: ['player'],
  characterAttr: ['character'],
  characters: ['player'],
  activeCharacter: ['player'],
  class: ['player'],
  classLevel: ['player'],
  clearLoopingSpecialEffect: ['player', 'character', 'stage', 'object', 'creation'],
  clearSpecialEffectsBasedOnSpecialEffectAssets: [
    'player',
    'character',
    'stage',
    'object',
    'creation'
  ],
  clearSpecifiedTargetSAggroList: ['player', 'character', 'stage', 'object', 'creation'],
  clearUnitTagsFromEntity: ['player', 'character', 'stage', 'object', 'creation'],
  clearTags: ['player', 'character', 'stage', 'object', 'creation'],
  closeDeckSelector: ['player'],
  closeShop: ['player'],
  closeSpecifiedSoundEffectPlayer: ['player', 'character', 'stage', 'object', 'creation'],
  consumeGift: ['player'],
  consumeGiftBox: ['player'],
  creationAttr: ['creation'],
  currentTarget: ['creation'],
  deactivateRevivePoint: ['player'],
  defaultAggroList: ['creation'],
  defeatAllCharacters: ['player'],
  defeatAllPlayerSCharacters: ['player'],
  deleteCharacterSkillById: ['character'],
  deleteCharacterSkillBySlot: ['character'],
  destroy: ['player', 'character', 'stage', 'object', 'creation'],
  destroyEntity: ['player', 'character', 'stage', 'object', 'creation'],
  elementalAttr: ['player', 'character', 'stage', 'object', 'creation'],
  forward: ['player', 'character', 'stage', 'object', 'creation'],
  forwardingEvent: ['player', 'character', 'stage', 'object', 'creation'],
  get: ['player', 'character', 'stage', 'object', 'creation'],
  getActiveCharacterOfSpecifiedPlayer: ['player'],
  getAggroListOfCreationInDefaultMode: ['creation'],
  getAllBasicItemsFromInventory: ['player', 'character', 'stage', 'object', 'creation'],
  getAllCharacterEntitiesOfSpecifiedPlayer: ['player'],
  getAllCurrencyFromInventory: ['player', 'character', 'stage', 'object', 'creation'],
  getAllCurrencyFromLootComponent: ['player', 'character', 'stage', 'object', 'creation'],
  getAllEntitiesWithinTheCollisionTrigger: ['player', 'character', 'stage', 'object', 'creation'],
  getAllEquipmentFromInventory: ['player', 'character', 'stage', 'object', 'creation'],
  getAllEquipmentFromLootComponent: ['player', 'character', 'stage', 'object', 'creation'],
  getAllItemsFromLootComponent: ['player', 'character', 'stage', 'object', 'creation'],
  getCharacterAttribute: ['character'],
  getCreationAttribute: ['creation'],
  getCreationSCurrentTarget: ['creation'],
  getCurrentCreationSPatrolTemplate: ['creation'],
  getCurrentGlobalTimerTime: ['player', 'character', 'stage', 'object', 'creation'],
  getCustomVariable: ['player', 'character', 'stage', 'object', 'creation'],
  getEntityAdvancedAttribute: ['player', 'character', 'stage', 'object', 'creation'],
  getEntityElementalAttribute: ['player', 'character', 'stage', 'object', 'creation'],
  getEntityForwardVector: ['player', 'character', 'stage', 'object', 'creation'],
  getEntityLocationAndRotation: ['character', 'object', 'creation'],
  getEntityRightVector: ['player', 'character', 'stage', 'object', 'creation'],
  getEntitySMiniMapMarkerStatus: ['player', 'character', 'stage', 'object', 'creation'],
  getEntityType: ['player', 'character', 'stage', 'object', 'creation'],
  getEntityUnitTagList: ['player', 'character', 'stage', 'object', 'creation'],
  getEntityUpwardVector: ['player', 'character', 'stage', 'object', 'creation'],
  getFollowMotionDeviceTarget: ['player', 'character', 'stage', 'object', 'creation'],
  getInventoryCapacity: ['player', 'character', 'stage', 'object', 'creation'],
  getInventoryCurrencyQuantity: ['player', 'character', 'stage', 'object', 'creation'],
  getInventoryItemQuantity: ['player', 'character', 'stage', 'object', 'creation'],
  getListOfEntitiesOwnedByTheEntity: ['player', 'character', 'stage', 'object', 'creation'],
  getListOfOwnersThatHaveTheTargetAsTheirAggroTarget: [
    'player',
    'character',
    'stage',
    'object',
    'creation'
  ],
  getListOfOwnersWhoHaveTheTargetInTheirAggroList: [
    'player',
    'character',
    'stage',
    'object',
    'creation'
  ],
  getLootComponentCurrencyQuantity: ['player', 'character', 'stage', 'object', 'creation'],
  getLootComponentItemQuantity: ['player', 'character', 'stage', 'object', 'creation'],
  getObjectAttribute: ['object'],
  getOwnerEntity: ['player', 'character', 'stage', 'object', 'creation'],
  getPlayerClientInputDeviceType: ['player'],
  getPlayerEntityToWhichTheCharacterBelongs: ['character'],
  getPlayerEscapeValidity: ['player'],
  getPlayerNickname: ['player'],
  getPlayerRankScoreChange: ['player'],
  getPlayerRankingInfo: ['player'],
  getPlayerRemainingRevives: ['player'],
  getPlayerReviveTime: ['player'],
  getPlayerSCurrentUiLayout: ['player'],
  getPlayerSettlementRankingValue: ['player'],
  getPlayerSettlementSuccessStatus: ['player'],
  getPreset: ['player', 'character', 'stage', 'object', 'creation'],
  getCreationPresetValue: ['creation'],
  getPresetStatus: ['player', 'character', 'stage', 'object', 'creation'],
  getTheAggroListOfTheSpecifiedEntity: ['player', 'character', 'stage', 'object', 'creation'],
  getTheAggroTargetOfTheSpecifiedEntity: ['player', 'character', 'stage', 'object', 'creation'],
  getTheCurrentlyActiveScanTagConfigId: ['player', 'character', 'stage', 'object', 'creation'],
  getTheEquipmentIndexOfTheSpecifiedEquipmentSlot: [
    'player',
    'character',
    'stage',
    'object',
    'creation'
  ],
  getThePresetStatusValueOfTheComplexCreation: ['creation'],
  guid: ['player', 'character', 'stage', 'object', 'creation'],
  hasUnitStatus: ['player', 'character', 'stage', 'object', 'creation'],
  hpLoss: ['player', 'character', 'stage', 'object', 'creation'],
  increaseMaximumInventoryCapacity: ['player', 'character', 'stage', 'object', 'creation'],
  increasesCharacterSElementalEnergy: ['character'],
  increasePlayerSCurrentClassExp: ['player'],
  initializeCharacterSkill: ['character'],
  initiateAttack: ['player', 'character', 'stage', 'object', 'creation'],
  inputDevice: ['player'],
  invokeDeckSelector: ['player'],
  isEscapeValid: ['player'],
  isInCombat: ['player', 'character', 'stage', 'object', 'creation'],
  isOnField: ['player', 'character', 'stage', 'object', 'creation'],
  listOfSlotIdsQueryingUnitStatus: ['player', 'character', 'stage', 'object', 'creation'],
  modifyCharacterSkillCd: ['character'],
  modifyCustomShopItemSalesInfo: ['player', 'character', 'stage', 'object', 'creation'],
  modifyEntityFaction: ['player', 'character', 'stage', 'object', 'creation'],
  setFaction: ['player', 'character', 'stage', 'object', 'creation'],
  modifyGlobalTimer: ['player', 'character', 'stage', 'object', 'creation'],
  modifyInventoryCurrencyQuantity: ['player', 'character', 'stage', 'object', 'creation'],
  modifyInventoryItemQuantity: ['player', 'character', 'stage', 'object', 'creation'],
  modifyInventoryShopItemSalesInfo: ['player', 'character', 'stage', 'object', 'creation'],
  modifyItemPurchaseInfoInThePurchaseList: ['player', 'character', 'stage', 'object', 'creation'],
  modifyLootComponentCurrencyAmount: ['player', 'character', 'stage', 'object', 'creation'],
  modifyLootItemComponentQuantity: ['player', 'character', 'stage', 'object', 'creation'],
  modifyMiniMapMarkerActivationStatus: ['player', 'character', 'stage', 'object', 'creation'],
  modifyMiniMapZoom: ['player'],
  modifyPlayerBackgroundMusic: ['player'],
  modifyPlayerListForTrackingMiniMapMarkers: ['player', 'character', 'stage', 'object', 'creation'],
  modifyPlayerListForVisibleMiniMapMarkers: ['player', 'character', 'stage', 'object', 'creation'],
  modifyPlayerMarkersOnTheMiniMap: ['player', 'character', 'stage', 'object', 'creation'],
  modifySkillCdPercentageBasedOnMaxCd: ['character'],
  modifySkillResourceAmount: ['character'],
  modifyUiControlStatusWithinTheInterfaceLayout: ['player'],
  modifyingCharacterDisruptorDevice: ['player', 'character', 'stage', 'object', 'creation'],
  mountLoopingSpecialEffect: ['player', 'character', 'stage', 'object', 'creation'],
  movementInfo: ['character'],
  nickname: ['player'],
  objectAttr: ['object'],
  openShop: ['player'],
  ownedEntities: ['player', 'character', 'stage', 'object', 'creation'],
  owner: ['player', 'character', 'stage', 'object', 'creation'],
  patrolTemplate: ['creation'],
  pauseBasicMotionDevice: ['player', 'character', 'stage', 'object', 'creation'],
  pauseGlobalTimer: ['player', 'character', 'stage', 'object', 'creation'],
  pauseTimer: ['player', 'character', 'stage', 'object', 'creation'],
  playTimedEffects: ['player', 'character', 'stage', 'object', 'creation'],
  player: ['character'],
  playerPlaysOneShot2dSoundEffect: ['player'],
  pos: ['character', 'object', 'creation'],
  queryCharacterSCurrentMovementSpd: ['character'],
  queryCharacterSkill: ['character'],
  queryCorrespondingGiftBoxConsumption: ['player'],
  queryCorrespondingGiftBoxQuantity: ['player'],
  queryCustomShopItemSalesInfo: ['player', 'character', 'stage', 'object', 'creation'],
  queryCustomShopItemSalesList: ['player', 'character', 'stage', 'object', 'creation'],
  queryEntityFaction: ['player', 'character', 'stage', 'object', 'creation'],
  faction: ['player', 'character', 'stage', 'object', 'creation'],
  queryGuidByEntity: ['player', 'character', 'stage', 'object', 'creation'],
  queryIfAchievementIsCompleted: ['player', 'character', 'stage', 'object', 'creation'],
  queryIfAllPlayerCharactersAreDown: ['player'],
  queryIfEntityHasUnitStatus: ['player', 'character', 'stage', 'object', 'creation'],
  queryIfEntityIsOnTheField: ['player', 'character', 'stage', 'object', 'creation'],
  queryIfSpecifiedEntityIsInCombat: ['player', 'character', 'stage', 'object', 'creation'],
  queryInventoryShopItemSalesInfo: ['player', 'character', 'stage', 'object', 'creation'],
  queryInventoryShopItemSalesList: ['player', 'character', 'stage', 'object', 'creation'],
  queryPlayerClass: ['player'],
  queryPlayerClassLevel: ['player'],
  queryShopItemPurchaseInfo: ['player', 'character', 'stage', 'object', 'creation'],
  queryShopPurchaseItemList: ['player', 'character', 'stage', 'object', 'creation'],
  querySpecifiedMiniMapMarkerInformation: ['player', 'character', 'stage', 'object', 'creation'],
  queryTheAggroMultiplierOfTheSpecifiedEntity: [
    'player',
    'character',
    'stage',
    'object',
    'creation'
  ],
  queryTheAggroValueOfTheSpecifiedEntity: ['player', 'character', 'stage', 'object', 'creation'],
  queryUnitStatusApplierBySlotId: ['player', 'character', 'stage', 'object', 'creation'],
  queryUnitStatusStacksBySlotId: ['player', 'character', 'stage', 'object', 'creation'],
  rankScoreChange: ['player'],
  rankingInfo: ['player'],
  recoverBasicMotionDevice: ['player', 'character', 'stage', 'object', 'creation'],
  recoverGlobalTimer: ['player', 'character', 'stage', 'object', 'creation'],
  recoverHp: ['player', 'character', 'stage', 'object', 'creation'],
  recoverHpDirectly: ['player', 'character', 'stage', 'object', 'creation'],
  remainingRevives: ['player'],
  remove: ['player', 'character', 'stage', 'object', 'creation'],
  removeEntity: ['player', 'character', 'stage', 'object', 'creation'],
  removeInterfaceControlGroupFromControlGroupLibrary: ['player'],
  removeItemFromCustomShopSalesList: ['player', 'character', 'stage', 'object', 'creation'],
  removeItemFromInventoryShopSalesList: ['player', 'character', 'stage', 'object', 'creation'],
  removeItemFromPurchaseList: ['player', 'character', 'stage', 'object', 'creation'],
  removeTargetEntityFromAggroList: ['player', 'character', 'stage', 'object', 'creation'],
  removeUnitStatus: ['player', 'character', 'stage', 'object', 'creation'],
  removeUnitTagFromEntity: ['player', 'character', 'stage', 'object', 'creation'],
  removeTag: ['player', 'character', 'stage', 'object', 'creation'],
  replaceEquipmentToTheSpecifiedSlot: ['player', 'character', 'stage', 'object', 'creation'],
  resumeTimer: ['player', 'character', 'stage', 'object', 'creation'],
  revive: ['character'],
  reviveActiveCharacter: ['player'],
  reviveAllCharacters: ['player'],
  reviveAllPlayerSCharacters: ['player'],
  reviveCharacter: ['character'],
  reviveTime: ['player'],
  right: ['player', 'character', 'stage', 'object', 'creation'],
  rotation: ['character', 'object', 'creation'],
  set: ['player', 'character', 'stage', 'object', 'creation'],
  setAchievementProgressTally: ['player', 'character', 'stage', 'object', 'creation'],
  setCharacterSElementalEnergy: ['character'],
  setAggroValue: ['player', 'character', 'stage', 'object', 'creation'],
  setCharacterSkillCd: ['character'],
  setCustomVariable: ['player', 'character', 'stage', 'object', 'creation'],
  setEntityActiveNameplate: ['player', 'character', 'stage', 'object', 'creation'],
  setEscapeValid: ['player'],
  setInventoryDropItemsCurrencyAmount: ['player', 'character', 'stage', 'object', 'creation'],
  setInventoryItemDropContents: ['player', 'character', 'stage', 'object', 'creation'],
  setLootDropContent: ['player', 'character', 'stage', 'object', 'creation'],
  setPlayerEscapeValidity: ['player'],
  setPlayerRankScoreChange: ['player'],
  setPlayerRemainingRevives: ['player'],
  setPlayerReviveTime: ['player'],
  setPlayerSettlementRankingValue: ['player'],
  setPlayerSettlementScoreboardDataDisplay: ['player'],
  setPlayerSettlementSuccessStatus: ['player'],
  setPreset: ['player', 'character', 'stage', 'object', 'creation'],
  setCreationPresetValue: ['creation'],
  setPresetStatus: ['player', 'character', 'stage', 'object', 'creation'],
  setRankScoreChange: ['player'],
  setScanComponentSActiveScanTagId: ['player', 'character', 'stage', 'object', 'creation'],
  setScanTagRules: ['player', 'character', 'stage', 'object', 'creation'],
  setSkillResourceAmount: ['character'],
  setTheAggroValueOfSpecifiedEntity: ['player', 'character', 'stage', 'object', 'creation'],
  setThePresetStatusValueOfTheComplexCreation: ['creation'],
  settlementRanking: ['player'],
  settlementStatus: ['player'],
  speed: ['character'],
  startGlobalTimer: ['player', 'character', 'stage', 'object', 'creation'],
  startPausePlayerBackgroundMusic: ['player'],
  startPauseSpecifiedSoundEffectPlayer: ['player', 'character', 'stage', 'object', 'creation'],
  startTimer: ['player', 'character', 'stage', 'object', 'creation'],
  stopAndDeleteBasicMotionDevice: ['player', 'character', 'stage', 'object', 'creation'],
  stopGlobalTimer: ['player', 'character', 'stage', 'object', 'creation'],
  stopTimer: ['player', 'character', 'stage', 'object', 'creation'],
  switchActiveTextBubble: ['player', 'character', 'stage', 'object', 'creation'],
  switchCreationPatrolTemplate: ['creation'],
  switchCurrentInterfaceLayout: ['player'],
  switchFollowMotionDeviceTargetByEntity: ['player', 'character', 'stage', 'object', 'creation'],
  switchFollowMotionDeviceTargetByGuid: ['player', 'character', 'stage', 'object', 'creation'],
  switchTheScoringGroupThatAffectsPlayerSCompetitiveRank: ['player'],
  tauntTarget: ['player', 'character', 'stage', 'object', 'creation'],
  teleport: ['player'],
  teleportPlayer: ['player'],
  toggleEntityLightSource: ['player', 'character', 'stage', 'object', 'creation'],
  triggerLootDrop: ['player', 'character', 'stage', 'object', 'creation'],
  type: ['player', 'character', 'stage', 'object', 'creation'],
  uiLayout: ['player'],
  unitTags: ['player', 'character', 'stage', 'object', 'creation'],
  up: ['player', 'character', 'stage', 'object', 'creation'],
  velocity: ['character'],
  addClassExp: ['player'],
  addSkill: ['character'],
  addSkillCd: ['character'],
  addSkillResource: ['character'],
  addElementalEnergy: ['character'],
  setElementalEnergy: ['character'],
  areAllCharactersDown: ['player'],
  closeDeck: ['player'],
  disableRevivePoint: ['player'],
  enableRevivePoint: ['player'],
  enableUiControlGroup: ['player'],
  getGiftBoxConsumption: ['player'],
  getGiftBoxQuantity: ['player'],
  getSkill: ['character'],
  openDeck: ['player'],
  pauseBgm: ['player'],
  playSfx2d: ['player'],
  removeSkillById: ['character'],
  removeSkillBySlot: ['character'],
  removeUiControlGroup: ['player'],
  resetSkill: ['character'],
  scaleSkillCd: ['character'],
  setBgm: ['player'],
  setBgmVolume: ['player'],
  setClass: ['player'],
  setClassLevel: ['player'],
  setMiniMapZoom: ['player'],
  setRemainingRevives: ['player'],
  setReviveAllowed: ['player'],
  setReviveTime: ['player'],
  setSettlementRanking: ['player'],
  setSettlementScoreboard: ['player'],
  setSettlementStatus: ['player'],
  setSkillCd: ['character'],
  setSkillResource: ['character'],
  setUiControlStatus: ['player'],
  switchPatrolTemplate: ['creation'],
  switchRankGroup: ['player'],
  switchUiLayout: ['player']
} as const

type EntityHelperMethodKeys = (typeof ENTITY_HELPER_METHODS)[number]
type EntityHelperOverrideIndices = typeof ENTITY_HELPER_OVERRIDE_INDEX
type EntityHelperAliasSources = typeof ENTITY_HELPER_ALIAS_SOURCES
type EntityHelperMethodAliasSources = typeof ENTITY_HELPER_METHOD_ALIAS_SOURCES

type HelperFromFirstParam<F> = F extends (this: unknown, ...args: infer A) => infer R
  ? (...args: RemoveAtIndex<A, 0>) => R
  : F extends (...args: infer A) => infer R
    ? (...args: RemoveAtIndex<A, 0>) => R
    : never

type RemoveAtIndex<
  Args extends unknown[],
  Index extends number,
  Acc extends unknown[] = []
> = Args extends [infer Head, ...infer Rest]
  ? Acc['length'] extends Index
    ? [...Acc, ...Rest]
    : RemoveAtIndex<Rest, Index, [...Acc, Head]>
  : Acc

type HelperFromIndex<K extends keyof ServerExecutionFlowFunctions, Index extends number> = (
  ...args: RemoveAtIndex<Parameters<ServerExecutionFlowFunctions[K]>, Index>
) => ReturnType<ServerExecutionFlowFunctions[K]>

interface EntityHelperFromFirstParam {
  /**
   * Activate a Basic Motion Device configured within the Target Entity's Basic Motion Device Component
   *
   * 激活基础运动器: 激活一个配置在目标实体基础运动器组件上的运动器
   *
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   */
  activateBasicMotionDevice: (motionDeviceName: StrValue) => void

  /**
   * Edit the Collision Trigger Component data to Activate/Disable the Trigger at the specified ID
   *
   * 激活/关闭碰撞触发器: 修改碰撞触发器组件的数据，使某一个序号的触发器激活/关闭
   *
   * @param triggerId Identifier for this Collision Trigger
   *
   * 触发器序号: 该碰撞触发器的标识
   * @param activate Set to True to activate
   *
   * 是否激活: “是”为激活
   */
  activateDisableCollisionTrigger: (triggerId: IntValue, activate: BoolValue) => void

  /**
   * Edit the state of the Collision Trigger Source Component on the Target Entity
   *
   * 激活/关闭碰撞触发源: 可以修改目标实体的碰撞触发源组件状态
   *
   * @param activate If set to True, activates collision with Entities that carry Collision Trigger Components
   *
   * 是否激活: 为“是”则激活，可以与携带碰撞触发器组件的实体产生碰撞
   */
  activateDisableCollisionTriggerSource: (activate: BoolValue) => void

  /**
   * Edit data in the Entity's Extra Collision Component to enable/disable Extra Collision
   *
   * 激活/关闭额外碰撞: 修改实体额外碰撞组件内的数据，使额外碰撞开启/关闭
   *
   * @param extraCollisionId Identifier for this Extra Collision
   *
   * 额外碰撞序号: 该额外碰撞的标识
   * @param activate Set to True to activate
   *
   * 是否激活: “是”为激活
   */
  activateDisableExtraCollision: (extraCollisionId: IntValue, activate: BoolValue) => void

  /**
   * Edit the Climbability of the Entity's Extra Collision Component
   *
   * 激活/关闭额外碰撞可攀爬性: 修改实体额外碰撞组件的碰撞的可攀爬性
   *
   * @param extraCollisionId Identifier for this Extra Collision
   *
   * 额外碰撞序号: 该额外碰撞的标识
   * @param activate Set to True to activate
   *
   * 是否激活: “是”为激活
   */
  activateDisableExtraCollisionClimbability: (
    extraCollisionId: IntValue,
    activate: BoolValue
  ) => void

  /**
   * Enable/Disable the Follow Motion Device logic on the Target Entity
   *
   * 激活/关闭跟随运动器: 使目标实体上的跟随运动器组件逻辑激活/关闭
   *
   * @param activate Set to True to activate
   *
   * 是否激活: “是”为激活
   */
  activateDisableFollowMotionDevice: (activate: BoolValue) => void

  /**
   * Edit the Entity's Model Visibility attribute to make its Model visible or hidden
   *
   * 激活/关闭模型显示: 更改实体的模型可见性属性设置，从而使实体的模型可见/不可见
   *
   * @param activate Set to True to make the model visible
   *
   * 是否激活: “是”为使模型可见
   */
  activateDisableModelDisplay: (activate: BoolValue) => void

  /**
   * Edit the Entity's Native Collision
   *
   * 激活/关闭原生碰撞: 修改实体自带的碰撞
   *
   * @param activate Set to True to activate
   *
   * 是否激活: “是”为激活
   */
  activateDisableNativeCollision: (activate: BoolValue) => void

  /**
   * Edit the Climbability of the Entity's Native Collision
   *
   * 激活/关闭原生碰撞可攀爬性: 修改实体自带的碰撞的可攀爬性
   *
   * @param activate Set to True to activate
   *
   * 是否激活: “是”为激活
   */
  activateDisableNativeCollisionClimbability: (activate: BoolValue) => void

  /**
   * You can modify whether the pathfinding obstacle component of the target entity, corresponding to the specified
   * index, is active
   *
   * 激活/关闭寻路阻挡: 修改目标实体的寻路阻挡组件中指定序号的激活状态
   *
   * @param pathfindingObstacleId Identifier for this Pathfinding Obstacle
   *
   * 寻路阻挡序号: 该寻路阻挡的标识
   * @param activate
   *
   * 是否激活
   */
  activateDisablePathfindingObstacle: (pathfindingObstacleId: IntValue, activate: BoolValue) => void

  /**
   * You can modify whether the pathfinding obstacle feature of the target entity is activated
   *
   * 激活/关闭寻路阻挡功能: 修改目标实体的寻路阻挡功能是否启用
   *
   * @param activate
   *
   * 是否激活
   */
  activateDisablePathfindingObstacleFeature: (activate: BoolValue) => void

  /**
   * Edit the Tab state by ID in the Target Entity's Tab Component
   *
   * 激活/关闭选项卡: 可以修改目标实体的选项卡组件中对应序号的选项卡状态
   *
   * @param tabId Identifier for the Tab
   *
   * 选项卡序号: 选项卡的标识
   * @param activate If set to True, it is active and can be selected
   *
   * 是否激活: 为“是”则激活，可以被选取
   */
  activateDisableTab: (tabId: IntValue, activate: BoolValue) => void

  /**
   * Dynamically add a Fixed-Point Basic Motion Device to the Target Entity during Stage runtime
   *
   * 开启定点运动器: 在关卡运行时为目标实体动态添加一个定点运动型基础运动器
   *
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   * @param movementMode
   *
   * 移动方式
   * @param movementSpd
   *
   * 移动速度
   * @param targetLocation Absolute Location
   *
   * 目标位置: 绝对位置
   * @param targetRotation Absolute Rotation
   *
   * 目标旋转: 绝对旋转
   * @param lockRotation
   *
   * 是否锁定旋转
   * @param parameterType Options: Fixed Speed or Fixed Time
   *
   * 参数类型: 分为固定速度、固定时间
   * @param movementTime
   *
   * 移动时间
   */
  activateFixedPointMotionDevice: (
    motionDeviceName: StrValue,
    movementMode: MovementMode,
    movementSpd: FloatValue,
    targetLocation: Vec3Value,
    targetRotation: Vec3Value,
    lockRotation: BoolValue,
    parameterType: FixedMotionParameterType,
    movementTime: FloatValue
  ) => void

  /**
   * Activate the specified Revive Point ID for the player. When the player later triggers Revive logic, they can revive at this Revive Point
   *
   * 激活复苏点: 为该玩家激活指定序号的复苏点，此玩家后续触发复苏逻辑时，可以从该复苏点复苏
   *
   * @param revivePointId Identifier for this Revive Point
   *
   * 复苏点序号: 该复苏点的标识
   */
  activateRevivePoint: (revivePointId: IntValue) => void

  /**
   * Activate the UI Control Groups stored as Custom Templates in the UI Control Group Library within the Target Player's Interface Layout
   *
   * 激活控件组库内界面控件组: 可以在目标玩家的界面布局上激活处于界面控件组库内的以自定义模板形式存在的界面控件组
   *
   * @param uiControlGroupIndex Identifier for the UI Control Group
   *
   * 界面控件组索引: 界面控件组的标识
   */
  activateUiControlGroupInControlGroupLibrary: (uiControlGroupIndex: IntValue) => void

  /**
   * Add a skill to the specified Target Character's Skill Slot
   *
   * 添加角色技能: 为指定目标角色的某个技能槽位添加技能
   *
   * @param skillConfigId Skill Identifier
   *
   * 技能配置ID: 技能的标识
   * @param skillSlot The Skill Slot to be added: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 技能槽位: 要添加的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   */
  addCharacterSkill: (skillConfigId: ConfigIdValue, skillSlot: CharacterSkillSlot) => void

  /**
   * Add New Items to the Item Purchase List
   *
   * 向物品收购表中新增物品: 向物品收购表中新增物品
   *
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemConfigId
   *
   * 商品道具配置ID
   * @param purchaseCurrencyDictionary
   *
   * 收购货币字典
   * @param purchasable
   *
   * 是否可收购
   */
  addItemsToThePurchaseList: (
    shopId: IntValue,
    shopItemConfigId: ConfigIdValue,
    purchaseCurrencyDictionary: dict<'config_id', 'int'>,
    purchasable: BoolValue
  ) => void

  /**
   * Add items to the Custom Shop Sales List. Upon success, an Integer ID is generated in the Output Parameter as the item identifier
   *
   * 向自定义商店出售表中新增商品: 向自定义商店出售表中新增商品，新增成功后出参会生成一个整数型索引作为该商品的标识
   *
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemConfigId
   *
   * 商品道具配置ID
   * @param sellCurrencyDictionary
   *
   * 出售货币字典
   * @param affiliatedTabId 1 Equipment, 2 Consumables, 3 Materials, 4 Valuables
   *
   * 所属页签序号: 1装备、2消耗品、3材料、4贵重物品
   * @param limitPurchase
   *
   * 是否限购
   * @param purchaseLimit
   *
   * 限购数量
   * @param sortPriority
   *
   * 排序优先级
   * @param canBeSold
   *
   * 是否可出售
   *
   * @returns
   *
   * 商品索引
   */
  addNewItemToCustomShopSalesList: (
    shopId: IntValue,
    shopItemConfigId: ConfigIdValue,
    sellCurrencyDictionary: dict<'config_id', 'int'>,
    affiliatedTabId: IntValue,
    limitPurchase: BoolValue,
    purchaseLimit: IntValue,
    sortPriority: IntValue,
    canBeSold: BoolValue
  ) => bigint

  /**
   * Add new items to the inventory shop's sales list
   *
   * 向背包商店出售表中新增商品: 向背包商店出售表中新增商品
   *
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemConfigId
   *
   * 商品道具配置ID
   * @param sellCurrencyDictionary
   *
   * 出售货币字典
   * @param affiliatedTabId 1 Equipment, 2 Consumables, 3 Materials, 4 Valuables
   *
   * 所属页签序号: 1装备、2消耗品、3材料、4贵重物品
   * @param sortPriority
   *
   * 排序优先级
   * @param canBeSold
   *
   * 是否可出售
   */
  addNewItemToInventoryShopSalesList: (
    shopId: IntValue,
    shopItemConfigId: ConfigIdValue,
    sellCurrencyDictionary: dict<'config_id', 'int'>,
    affiliatedTabId: IntValue,
    sortPriority: IntValue,
    canBeSold: BoolValue
  ) => void

  /**
   * Dynamically add a Sound Effect Player. The Unit must have a Sound Effect Player Component
   *
   * 添加音效播放器: 动态添加一个音效播放器，需要单位持有音效播放器组件
   *
   * @param soundEffectAssetIndex
   *
   * 音效资产索引
   * @param volume
   *
   * 音量
   * @param playbackSpeed
   *
   * 播放速度
   * @param loopPlayback
   *
   * 是否循环播放
   * @param loopIntervalTime
   *
   * 循环间隔时间
   * @param _3dSoundEffect
   *
   * 是否为3D音效
   * @param rangeRadius
   *
   * 范围半径
   * @param attenuationMode
   *
   * 衰减方式
   * @param attachmentPointName
   *
   * 挂接点名称
   * @param attachmentPointOffset
   *
   * 挂接点偏移
   *
   * @returns
   *
   * 音效播放器序号
   */
  addSoundEffectPlayer: (
    soundEffectAssetIndex: IntValue,
    volume: IntValue,
    playbackSpeed: FloatValue,
    loopPlayback: BoolValue,
    loopIntervalTime: FloatValue,
    _3dSoundEffect: BoolValue,
    rangeRadius: FloatValue,
    attenuationMode: SoundAttenuationMode,
    attachmentPointName: StrValue,
    attachmentPointOffset: Vec3Value
  ) => bigint

  /**
   * Dynamically add a Basic Motion Device with Target-Oriented Rotation to the Target Entity during Stage runtime
   *
   * 添加朝向目标旋转型基础运动器: 在关卡运行时为目标实体动态添加一个朝向目标旋转型基础运动器
   *
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   * @param motionDeviceDuration The duration for which this motion device remains active
   *
   * 运动器时长: 该运动器生效的时长
   * @param targetAngle Absolute Angle
   *
   * 目标角度: 绝对角度
   */
  addTargetOrientedRotationBasedMotionDevice: (
    motionDeviceName: StrValue,
    motionDeviceDuration: FloatValue,
    targetAngle: Vec3Value
  ) => void

  /**
   * Dynamically add a Basic Motion Device with Uniform Linear Motion at runtime
   *
   * 添加匀速直线型基础运动器: 在运行时动态添加一个匀速直线型基础运动器
   *
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   * @param motionDeviceDuration The duration for which this motion device remains active
   *
   * 运动器时长: 该运动器生效的时长
   * @param velocityVector Determines the magnitude and direction of the velocity
   *
   * 速度向量: 决定了速度大小和方向
   */
  addUniformBasicLinearMotionDevice: (
    motionDeviceName: StrValue,
    motionDeviceDuration: FloatValue,
    velocityVector: Vec3Value
  ) => void

  /**
   * Dynamically add a Basic Motion Device with Uniform Rotation at runtime
   *
   * 添加匀速旋转型基础运动器: 在运行时动态添加一个匀速旋转型基础运动器
   *
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   * @param motionDeviceDuration The duration for which this motion device remains active
   *
   * 运动器时长: 该运动器生效的时长
   * @param angularVelocityS Angular Velocity Magnitude
   *
   * 角速度(角度/秒): 角速度大小
   * @param rotationAxisOrientation Relative Orientation
   *
   * 旋转轴朝向: 相对朝向
   */
  addUniformBasicRotationBasedMotionDevice: (
    motionDeviceName: StrValue,
    motionDeviceDuration: FloatValue,
    angularVelocityS: FloatValue,
    rotationAxisOrientation: Vec3Value
  ) => void

  /**
   * Add a specified Stack Count of Unit Status to the Target Entity
   *
   * 添加单位状态: 向指定目标实体添加一定层数的单位状态
   *
   * @param applicationTargetEntity The Entity that actually receives this Unit Status
   *
   * 施加目标实体: 实际被添加该单位状态的实体
   * @param unitStatusConfigId Identifier for this Unit Status
   *
   * 单位状态配置ID: 该单位状态的标识
   * @param appliedStacks The Stack Count for this Unit Status
   *
   * 施加层数: 该单位状态的层数
   * @param unitStatusParameterDictionary Can carry a set of parameters to overwrite parameters defined in the Unit Status. Currently, only parameters within shield templates can be overwritten.
   *
   * 单位状态参数字典: 可以携带一组参数，用于覆写单位状态中的参数，目前仅支持对护盾中护盾模板的参数覆写
   */
  addUnitStatus: (
    applicationTargetEntity: EntityValue,
    unitStatusConfigId: ConfigIdValue,
    appliedStacks: IntValue,
    unitStatusParameterDictionary: dict<'str', 'float'>
  ) => {
    /**
     * Failed, other exceptionsFailed: Yielded to another status. A yielding relationship exists between the Target's current Unit Status and the one being appliedFailed: Maximum coexistence limit reached. The specified Unit Status on the Target Entity has reached its Coexistence LimitFailed: Unable to add additional stack. Stack addition failedSuccess: New status applied. Successfully applied new Unit StatusSuccess: Slot stacking. Target already has this Unit Status, stacking applied
     *
     * 施加结果: 失败，其他异常失败，让位于其他状态：目标上已有的单位状态与尝试施加的状态之间有让位关系失败，超出并存上限：超出目标实体上的指定单位状态的并存上限失败，附加叠层未成功：叠层失败成功，施加新状态：成功附加新状态成功，槽位叠层：目标上已有该单位状态，叠层
     */
    applicationResult: UnitStatusAdditionResult
    /**
     * If application succeeds, returns the Unit Status Slot ID containing the instance
     *
     * 槽位序号: 如果施加成功，则返回一个该单位状态实例所在的单位状态槽位序号
     */
    slotId: bigint
  }

  /**
   * Add Unit Tags to the specified Entity
   *
   * 实体添加单位标签: 对指定实体添加单位标签
   *
   * @param unitTagIndex
   *
   * 单位标签索引
   */
  addUnitTagToEntity: (unitTagIndex: IntValue) => void

  /**
   * Adjust Player Background Music Volume
   *
   * 调整玩家背景音乐音量: 调整玩家背景音乐音量
   *
   * @param volume
   *
   * 音量
   */
  adjustPlayerBackgroundMusicVolume: (volume: IntValue) => void

  /**
   * Adjust the volume and playback speed of the Sound Effect Player with the specified ID in the Sound Effect Player Component on the Target Entity
   *
   * 调整指定音效播放器: 可以调整指定目标实体上的音效播放器组件对应序号的音效播放器的音量和播放速度
   *
   * @param sfxPlayerId
   *
   * 音效播放器序号
   * @param volume
   *
   * 音量
   * @param playbackSpeed
   *
   * 播放速度
   */
  adjustSpecifiedSoundEffectPlayer: (
    sfxPlayerId: IntValue,
    volume: IntValue,
    playbackSpeed: FloatValue
  ) => void

  /**
   * Set whether the specified player is allowed to revive
   *
   * 允许/禁止玩家复苏: 设置指定玩家是否允许复苏
   *
   * @param allow If set to True, reviving is allowed
   *
   * 是否允许: “是”则允许复苏
   */
  allowForbidPlayerToRevive: (allow: BoolValue) => void

  /**
   * Change the progress counter for the specified Achievement ID on the Target Entity
   *
   * 变更成就进度计数: 变更指定实体上对应成就序号的成就进度计数
   *
   * @param achievementId
   *
   * 成就序号
   * @param progressTallyChangeValue New Value = Previous Value + Change Value
   *
   * 进度计数变更值: 变更后值=变更前值+变更值
   */
  changeAchievementProgressTally: (
    achievementId: IntValue,
    progressTallyChangeValue: IntValue
  ) => void

  /**
   * Set the Player's current Class to the Class referenced by the Config ID
   *
   * 更改玩家职业: 修改玩家的当前职业为配置ID对应的职业
   *
   * @param classConfigId Class Identifier
   *
   * 职业配置ID: 该职业的标识
   */
  changePlayerClass: (classConfigId: ConfigIdValue) => void

  /**
   * Set the Player's current Class Level. If it exceeds the defined range, the change will not take effect
   *
   * 更改玩家当前职业等级: 修改玩家当前职业等级，若超出定义的等级范围则会失效
   *
   * @param level Edited Level
   *
   * 等级: 修改后的等级
   */
  changePlayerSCurrentClassLevel: (level: IntValue) => void

  /**
   * Available only in Classic Mode. Returns the Character ID for the target character
   *
   * 查询经典模式角色编号: 仅经典模式可用，查询指定角色的角色编号
   */
  checkClassicModeCharacterId: () => bigint

  /**
   * Check entity's elemental effect status
   *
   * 查询实体的元素附着状态
   */
  checkEntitySElementalEffectStatus: () => {
    /**
     *
     * 是否附着水元素
     */
    affectedByHydro: boolean
    /**
     *
     * 是否附着冰元素
     */
    affectedByCryo: boolean
    /**
     *
     * 是否附着雷元素
     */
    affectedByElectro: boolean
    /**
     *
     * 是否附着火元素
     */
    affectedByPyro: boolean
    /**
     *
     * 是否附着草元素
     */
    affectedByDendro: boolean
    /**
     *
     * 是否附着风元素
     */
    affectedByAnemo: boolean
    /**
     *
     * 是否附着岩元素
     */
    affectedByGeo: boolean
    /**
     *
     * 是否处于冻结
     */
    affectedByFrozen: boolean
    /**
     *
     * 是否处于感电（不包含月感电）
     */
    affectedByElectroCharged: boolean
    /**
     *
     * 是否处于燃烧
     */
    affectedByBurning: boolean
    /**
     *
     * 是否处于石化
     */
    affectedByPetrification: boolean
    /**
     *
     * 是否处于激化
     */
    affectedByCatalyze: boolean
  }

  /**
   * Clear all Effects on the specified Target Entity that use the given Effect Asset. Applies to Looping Effects only
   *
   * 根据特效资产清除特效: 清除指定目标实体上所有使用该特效资产的特效。仅限循环特效
   *
   * @param specialEffectsAsset Identifier for this Effect
   *
   * 特效资产: 该特效的标识
   */
  clearSpecialEffectsBasedOnSpecialEffectAssets: (specialEffectsAsset: ConfigIdValue) => void

  /**
   * Available only in Custom Aggro Mode; Clear the Aggro Owner's Aggro List. This may cause them to leave battle
   *
   * 清空指定目标的仇恨列表: 仅自定义仇恨模式可用; 清空仇恨拥有者的仇恨列表。可能会导致其脱战
   *
   */
  clearSpecifiedTargetSAggroList: () => void

  /**
   * Clear Unit Tags for the specified Entity
   *
   * 实体清空单位标签: 对指定实体清空单位标签
   *
   */
  clearUnitTagsFromEntity: () => void

  /**
   * Close the currently active Deck Selector for the specified Player
   *
   * 关闭卡牌选择器: 关闭指定玩家当前生效的卡牌选择器
   *
   * @param deckSelectorIndex
   *
   * 卡牌选择器索引
   */
  closeDeckSelector: (deckSelectorIndex: IntValue) => void

  /**
   * Close all open Shops from the Player Entity's perspective during gameplay
   *
   * 关闭商店: 在游戏运行过程中以玩家实体的视角关闭所有已打开的商店
   *
   */
  closeShop: () => void

  /**
   * Disable the Sound Effect Player with the specified ID in the Sound Effect Player Component on the specified Target Entity
   *
   * 关闭指定音效播放器: 关闭指定目标实体上的音效播放器组件对应序号的音效播放器
   *
   * @param sfxPlayerId
   *
   * 音效播放器序号
   */
  closeSpecifiedSoundEffectPlayer: (sfxPlayerId: IntValue) => void

  /**
   * Consume the specified Player's Wonderland Gift Box
   *
   * 消耗礼盒: 可以消耗指定玩家的奇域礼盒
   *
   * @param giftBoxIndex
   *
   * 礼盒索引
   * @param consumptionQuantity
   *
   * 消耗数量
   */
  consumeGiftBox: (giftBoxIndex: IntValue, consumptionQuantity: IntValue) => void

  /**
   * Unregister the specified Revive Point ID for the player. The layer will not revive at this Revive Point next time
   *
   * 注销复苏点: 为该玩家注销指定序号的复苏点。该玩家下次复苏时不会从该复苏点复苏
   *
   * @param revivePointId Identifier for this Revive Point
   *
   * 复苏点序号: 该复苏点的标识
   */
  deactivateRevivePoint: (revivePointId: IntValue) => void

  /**
   * Knock down all characters of the specified player, causing the player to enter When All Player's Characters Are Down state.
   *
   * 击倒玩家所有角色: 击倒指定玩家的所有角色，会导致该玩家进入玩家所有角色倒下状态
   *
   */
  defeatAllPlayerSCharacters: () => void

  /**
   * Iterate through and delete all skills with the specified Config ID across all of the Character's slots
   *
   * 以ID删除角色技能: 遍历角色的所有槽位，删除所有指定配置ID的技能
   *
   * @param skillConfigId Skill Identifier
   *
   * 技能配置ID: 技能的标识
   */
  deleteCharacterSkillById: (skillConfigId: ConfigIdValue) => void

  /**
   * Delete the skill in the specified slot of the Target Character
   *
   * 以槽位删除角色技能: 删除目标角色指定槽位的技能
   *
   * @param characterSkillSlot The Skill Slot to be deleted: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要删除的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   */
  deleteCharacterSkillBySlot: (characterSkillSlot: CharacterSkillSlot) => void

  /**
   * Destroy the specified Entity with a destruction effect. This can trigger logic that runs only after destruction, such as end-of-lifecycle behaviors for Local Projectiles; The [When Entity Is Destroyed] and [When Entity Is Removed/Destroyed] events can be monitored on Stage Entities
   *
   * 销毁实体: 销毁指定实体，会有销毁表现，也可以触发一些销毁后才会触发的逻辑，比如本地投射物中的生命周期结束时行为; 在关卡实体上可以监听到【实体销毁时】以及【实体移除/销毁时】事件
   *
   */
  destroyEntity: () => void

  /**
   * Forwards the source event of this Node's Execution Flow to the specified Target Entity. The event with the same name on the Target Entity's Node Graph will be triggered
   *
   * 转发事件: 向指定目标实体转发此节点所在的执行流的源头事件。被转发的目标实体上的节点图上的同名事件会被触发
   *
   */
  forwardingEvent: () => void

  /**
   * Returns the Aggro List in Classic Mode. This Node only outputs a valid list when the Aggro Configuration is set to [Default Type]
   *
   * 获取造物的经典模式仇恨列表: 获取造物的经典仇恨模式的仇恨列表，即仅仇恨配置为【默认类型】时，该节点才会有正确的输出列表
   *
   * @returns Unordered list of Entities this Creation currently has Aggro against
   *
   * 仇恨列表: 造物当前对哪些实体有仇恨，该列表是无序的
   */
  getAggroListOfCreationInDefaultMode: () => entity[]

  /**
   * Returns all Basic Items in the Inventory, including Item types and their quantities
   *
   * 获取背包所有基础道具: 获取背包所有基础道具，包括道具类型和对应的数量
   *
   * @returns
   *
   * 基础道具字典
   */
  getAllBasicItemsFromInventory: () => dict<'config_id', 'int'>

  /**
   * Returns a list of all Character Entities for the specified Player Entity
   *
   * 获取指定玩家所有角色实体: 获取指定玩家实体的所有角色实体列表
   *
   * @returns
   *
   * 角色实体列表
   */
  getAllCharacterEntitiesOfSpecifiedPlayer: () => CharacterEntity[]

  /**
   * Available only in Classic Mode, get the active character in the player's party
   *
   * 获取指定玩家的前台角色: 仅经典模式可用，获取玩家队伍内的前台角色
   *
   * @returns
   *
   * 前台角色实体
   */
  getActiveCharacterOfSpecifiedPlayer: () => CharacterEntity

  /**
   * Returns all Currencies in the Inventory, including types and corresponding amounts
   *
   * 获取背包所有货币: 获取背包所有货币，包括货币类型和对应的数量
   *
   * @returns
   *
   * 货币字典
   */
  getAllCurrencyFromInventory: () => dict<'config_id', 'int'>

  /**
   * Returns all Currencies from the Loot Component on the Loot Prefab
   *
   * 获取掉落物组件所有货币: 获取掉落物元件上掉落物组件中的所有货币
   *
   * @returns
   *
   * 货币字典
   */
  getAllCurrencyFromLootComponent: () => dict<'config_id', 'int'>

  /**
   * Returns all Entities within the Collision Trigger corresponding to a specific ID in the Collision Trigger Component on the Target Entity
   *
   * 获取碰撞触发器内所有实体: 获取目标实体上碰撞触发器组件中特定序号对应的碰撞触发器内的所有实体
   *
   * @param triggerId
   *
   * 触发器序号
   *
   * @returns
   *
   * 实体列表
   */
  getAllEntitiesWithinTheCollisionTrigger: (triggerId: IntValue) => entity[]

  /**
   * Returns all Equipment in the Inventory; the output parameter is a list of all Equipment IDs
   *
   * 获取背包所有装备: 获取背包所有装备，出参为所有装备索引组成的列表
   *
   * @returns
   *
   * 装备索引列表
   */
  getAllEquipmentFromInventory: () => bigint[]

  /**
   * Returns all Equipment from the Loot Component on the Loot Prefab
   *
   * 获取掉落物组件所有装备: 获取掉落物元件上掉落物组件中的所有装备
   *
   * @returns
   *
   * 装备索引列表
   */
  getAllEquipmentFromLootComponent: () => bigint[]

  /**
   * Returns all Items from the Loot Component on the Loot Prefab
   *
   * 获取掉落物组件所有道具: 获取掉落物元件上掉落物组件中的所有道具
   *
   * @returns
   *
   * 道具字典
   */
  getAllItemsFromLootComponent: () => dict<'config_id', 'int'>

  /**
   * Returns the Base Attributes of the Character Entity
   *
   * 获取角色属性: 获取角色实体的基础属性
   *
   */
  getCharacterAttribute: () => {
    /**
     *
     * 等级
     */
    level: bigint
    /**
     *
     * 当前生命值
     */
    currentHp: number
    /**
     *
     * 上限生命值
     */
    maxHp: number
    /**
     *
     * 当前攻击力
     */
    currentAtk: number
    /**
     *
     * 基础攻击力
     */
    baseAtk: number
    /**
     *
     * 当前防御力
     */
    currentDef: number
    /**
     *
     * 基础防御力
     */
    baseDef: number
    /**
     *
     * 受打断值上限
     */
    interruptValueThreshold: number
    /**
     *
     * 当前受打断值
     */
    currentInterruptValue: number
    /**
     *
     * 当前受打断状态
     */
    currentInterruptStatus: InterruptStatus
  }

  /**
   * Returns the Attributes of the specified Creation
   *
   * 获取造物属性: 获取指定造物的属性
   *
   */
  getCreationAttribute: () => {
    /**
     *
     * 等级
     */
    level: bigint
    /**
     *
     * 当前生命值
     */
    currentHp: number
    /**
     *
     * 上限生命值
     */
    maxHp: number
    /**
     *
     * 当前攻击力
     */
    currentAtk: number
    /**
     *
     * 基础攻击力
     */
    baseAtk: number
    /**
     *
     * 受打断值上限
     */
    interruptValueThreshold: number
    /**
     *
     * 当前受打断值
     */
    currentInterruptValue: number
    /**
     *
     * 当前受打断状态
     */
    currentInterruptStatus: InterruptStatus
  }

  /**
   * The Target Entity varies with the Creation's current behavior; For example, when a Creation is attacking, its Target is the specified enemy Entity; For example, when a Creation is healing allies, its Target is the specified allied Entity
   *
   * 获取造物当前目标: 根据造物当前行为的不同，目标实体也不尽相同。; 例如当造物在攻击敌方时，造物的目标为敌方指定实体。; 例如当造物在对友方进行治疗时，造物的目标为友方指定实体。
   *
   * @returns Current intelligently selected Target Entity of the Creation
   *
   * 目标实体: 造物当前的智能选取目标实体
   */
  getCreationSCurrentTarget: () => entity

  /**
   * Returns the Patrol Template information of the specified Creation Entity
   *
   * 获取当前造物的巡逻模板: 获取指定造物实体的巡逻模板信息
   *
   */
  getCurrentCreationSPatrolTemplate: () => {
    /**
     * The Patrol Template ID currently active on this Creation
     *
     * 巡逻模板序号: 造物当前生效的巡逻模板序号
     */
    patrolTemplateId: bigint
    /**
     * The Path ID referenced by the Creation's currently active Patrol Template
     *
     * 路径索引: 造物当前生效的巡逻模板引用的路径索引
     */
    pathIndex: bigint
    /**
     * The Waypoint ID the Creation will move to next
     *
     * 目标路点序号: 造物即将前往的路点序号
     */
    targetWaypointIndex: bigint
  }

  /**
   * Returns the current time of the specified Global Timer on the Target Entity
   *
   * 获取全局计时器当前时间: 获取目标实体上指定全局计时器的当前时间
   *
   * @param timerName
   *
   * 计时器名称
   *
   * @returns
   *
   * 当前时间
   */
  getCurrentGlobalTimerTime: (timerName: StrValue) => number

  /**
   * Returns the value of the specified Custom Variable from the Target Entity; If the variable does not exist, returns the type's default value
   *
   * 获取自定义变量: 获取目标实体的指定自定义变量的值; 如果变量不存在，则返回类型的默认值
   *
   * @param variableName
   *
   * 变量名
   *
   * @returns
   *
   * 变量值
   */
  getCustomVariable: (variableName: StrValue) => generic

  /**
   * Returns the Advanced Attributes of the Entity
   *
   * 获取实体进阶属性: 获取实体的进阶属性
   *
   */
  getEntityAdvancedAttribute: () => {
    /**
     *
     * 暴击率
     */
    critRate: number
    /**
     *
     * 暴击伤害
     */
    critDmg: number
    /**
     *
     * 治疗加成
     */
    healingBonus: number
    /**
     *
     * 受治疗加成
     */
    incomingHealingBonus: number
    /**
     *
     * 元素充能效率
     */
    energyRecharge: number
    /**
     *
     * 冷却缩减
     */
    cdReduction: number
    /**
     *
     * 护盾强效
     */
    shieldStrength: number
  }

  /**
   * Returns the Element Attributes of the Target Entity
   *
   * 获取实体元素属性: 获取目标实体的元素相关属性
   *
   */
  getEntityElementalAttribute: () => {
    /**
     *
     * 火元素伤害加成
     */
    pyroDmgBonus: number
    /**
     *
     * 火元素抗性
     */
    pyroRes: number
    /**
     *
     * 水元素伤害加成
     */
    hydroDmgBonus: number
    /**
     *
     * 水元素抗性
     */
    hydroRes: number
    /**
     *
     * 草元素伤害加成
     */
    dendroDmgBonus: number
    /**
     *
     * 草元素抗性
     */
    dendroRes: number
    /**
     *
     * 雷元素伤害加成
     */
    electroDmgBonus: number
    /**
     *
     * 雷元素抗性
     */
    electroRes: number
    /**
     *
     * 风元素伤害加成
     */
    anemoDmgBonus: number
    /**
     *
     * 风元素抗性
     */
    anemoRes: number
    /**
     *
     * 冰元素伤害加成
     */
    cryoDmgBonus: number
    /**
     *
     * 冰元素抗性
     */
    cryoRes: number
    /**
     *
     * 岩元素伤害加成
     */
    geoDmgBonus: number
    /**
     *
     * 岩元素抗性
     */
    geoRes: number
    /**
     *
     * 物理伤害加成
     */
    physicalDmgBonus: number
    /**
     *
     * 物理抗性
     */
    physicalRes: number
  }

  /**
   * Returns the Forward Vector of the specified Entity (the positive Z-axis direction in the Entity's relative coordinate system)
   *
   * 获取实体向前向量: 获取指定实体的向前向量（即该实体本地坐标系下的z轴正方向朝向）
   *
   * @returns
   *
   * 向前向量
   */
  getEntityForwardVector: () => vec3

  /**
   * Returns the Location and Rotation of the Target Entity; Not applicable to Player Entities or Stage Entities
   *
   * 获取实体位置与旋转: 获取目标实体的位置和旋转; 对玩家实体和关卡实体无意义
   *
   */
  getEntityLocationAndRotation: () => {
    /**
     *
     * 位置
     */
    location: vec3
    /**
     *
     * 旋转
     */
    rotate: vec3
  }

  /**
   * Returns the Right Vector of the specified Entity (the positive X-axis direction in the Entity's relative coordinate system)
   *
   * 获取实体向右向量: 获取指定实体的向右向量（即该实体本地坐标系下的x轴正方向朝向）
   *
   * @returns
   *
   * 向右向量
   */
  getEntityRightVector: () => vec3

  /**
   * Searches the configuration and activation status of the Entity's current Mini-map Marker
   *
   * 获取实体的小地图标识状态: 查询实体当前小地图标识的配置及生效情况
   *
   */
  getEntitySMiniMapMarkerStatus: () => {
    /**
     * Complete list of Mini-map Marker IDs for this Entity
     *
     * 全量小地图标识序号列表: 该实体的所有小地图标识枚举列表
     */
    fullMiniMapMarkerIdList: bigint[]
    /**
     * Complete list of active Mini-map Marker IDs for this Entity
     *
     * 生效的小地图标识序号列表: 该实体的所有生效小地图标识枚举列表
     */
    activeMiniMapMarkerIdList: bigint[]
    /**
     * Complete list of inactive Mini-map Marker IDs for this Entity
     *
     * 未生效的小地图标识序号列表: 该实体的所有未生效小地图标识枚举列表
     */
    inactiveMiniMapMarkerIdList: bigint[]
  }

  /**
   * Returns the Entity Type of the Target Entity
   *
   * 获取实体类型: 获取目标实体的实体类型
   *
   * @returns Includes Player, Character, Stage, Object, Creation.
   *
   * 实体类型: 分为玩家、角色、关卡、物件、造物
   */
  getEntityType: () => EntityType

  /**
   * Returns a list of all Unit Tags carried by the Target Entity
   *
   * 获取实体单位标签列表: 获取目标实体上携带的所有单位标签组成的列表
   *
   * @returns
   *
   * 单位标签列表
   */
  getEntityUnitTagList: () => bigint[]

  /**
   * Returns the Upward Vector of the specified Entity (the positive Y-axis direction in the Entity's relative coordinate system)
   *
   * 获取实体向上向量: 获取指定实体的向上向量（即该实体本地坐标系下的y轴正方向朝向）
   *
   * @returns
   *
   * 向上向量
   */
  getEntityUpwardVector: () => vec3

  /**
   * Returns the Target of the Follow Motion Device, including the Target Entity and its GUID
   *
   * 获取跟随运动器的目标: 获取跟随运动器的目标，可以获取目标实体和实体的GUID
   *
   */
  getFollowMotionDeviceTarget: () => {
    /**
     *
     * 跟随目标实体
     */
    followTargetEntity: entity
    /**
     *
     * 跟随目标GUID
     */
    followTargetGuid: guid
  }

  /**
   * Get Inventory Capacity
   *
   * 获取背包容量: 获取背包容量
   *
   * @returns
   *
   * 背包容量
   */
  getInventoryCapacity: () => bigint

  /**
   * Returns the amount of Currency with the specified Config ID in the Inventory
   *
   * 获取背包货币数量: 获取背包内特定配置ID的货币数量
   *
   * @param currencyConfigId
   *
   * 货币配置ID
   *
   * @returns
   *
   * 资源数量
   */
  getInventoryCurrencyQuantity: (currencyConfigId: ConfigIdValue) => bigint

  /**
   * Returns the quantity of the Item with the specified Config ID in the Inventory
   *
   * 获取背包道具数量: 获取背包内特定配置ID的道具数量
   *
   * @param itemConfigId
   *
   * 道具配置ID
   *
   * @returns
   *
   * 道具数量
   */
  getInventoryItemQuantity: (itemConfigId: ConfigIdValue) => bigint

  /**
   * Returns a list of all Entities owned by the Target Entity
   *
   * 获取实体拥有的实体列表: 获取所有以目标实体为拥有者的实体组成的列表
   *
   * @returns
   *
   * 实体列表
   */
  getListOfEntitiesOwnedByTheEntity: () => entity[]

  /**
   * Searches which Entities have the Target Entity as their Aggro Target
   *
   * 获取以目标为仇恨目标的拥有者列表: 查询哪些实体以目标实体为仇恨目标
   *
   * @returns
   *
   * 仇恨拥有者列表
   */
  getListOfOwnersThatHaveTheTargetAsTheirAggroTarget: () => entity[]

  /**
   * Searches which Entities' Aggro Lists include the specified Target Entity
   *
   * 获取目标所在仇恨列表的拥有者列表: 查询指定目标实体在哪些实体的仇恨列表中
   *
   * @returns
   *
   * 仇恨拥有者列表
   */
  getListOfOwnersWhoHaveTheTargetInTheirAggroList: () => entity[]

  /**
   * Returns the amount of Currency with the specified Config ID from the Loot Component on the Loot Prefab
   *
   * 获取掉落物组件货币数量: 获取掉落物元件上掉落物组件中特定配置ID的货币数量
   *
   * @param currencyConfigId
   *
   * 货币配置ID
   *
   * @returns
   *
   * 货币数量
   */
  getLootComponentCurrencyQuantity: (currencyConfigId: ConfigIdValue) => bigint

  /**
   * Returns the quantity of Items with the specified Config ID from the Loot Component on the Loot Prefab
   *
   * 获取掉落物组件道具数量: 获取掉落物元件上掉落物组件中特定配置ID的道具数量
   *
   * @param itemConfigId
   *
   * 道具配置ID
   *
   * @returns
   *
   * 道具数量
   */
  getLootComponentItemQuantity: (itemConfigId: ConfigIdValue) => bigint

  /**
   * Returns the Base Attributes of the Object
   *
   * 获取物件属性: 获取物件的相关基础属性
   *
   */
  getObjectAttribute: () => {
    /**
     *
     * 等级
     */
    level: bigint
    /**
     *
     * 当前生命值
     */
    currentHp: number
    /**
     *
     * 上限生命值
     */
    maxHp: number
    /**
     *
     * 当前攻击力
     */
    currentAtk: number
    /**
     *
     * 基础攻击力
     */
    baseAtk: number
    /**
     *
     * 当前防御力
     */
    currentDef: number
    /**
     *
     * 基础防御力
     */
    baseDef: number
  }

  /**
   * Returns the Owner Entity of the specified Target Entity
   *
   * 获取拥有者实体: 获取指定目标实体的拥有者实体
   *
   * @returns
   *
   * 拥有者实体
   */
  getOwnerEntity: () => entity

  /**
   * Returns the Player's local input device type, as determined by the Interface mapping method
   *
   * 获得玩家客户端输入设备类型: 获得玩家的客户端输入设备类型，根据用户界面的映射方式决定
   *
   * @returns Includes keyboard/mouse, gamepad, touchscreen
   *
   * 输入设备类型: 分为键盘鼠标、手柄、触屏
   */
  getPlayerClientInputDeviceType: () => InputDeviceType

  /**
   * Returns the Player Entity that owns the Character Entity
   *
   * 获取角色归属的玩家实体: 获取角色实体所归属的玩家实体
   *
   * @returns
   *
   * 所属玩家实体
   */
  getPlayerEntityToWhichTheCharacterBelongs: () => PlayerEntity

  /**
   * Get Player Escape Permission
   *
   * 获取玩家逃跑合法性: 获取玩家逃跑合法性
   *
   * @returns
   *
   * 是否合法
   */
  getPlayerEscapeValidity: () => boolean

  /**
   * Returns the Player's nickname
   *
   * 获取玩家昵称: 获取玩家的昵称
   *
   * @returns
   *
   * 玩家昵称
   */
  getPlayerNickname: () => string

  /**
   * Returns the Rank change score for the Player Entity under different Settlement states
   *
   * 获取玩家段位变化分数: 获取玩家实体在不同结算状态下段位的变化分数
   *
   * @param settlementStatus
   *
   * 结算状态
   *
   * @returns
   *
   * 分数
   */
  getPlayerRankScoreChange: (settlementStatus: SettlementStatus) => bigint

  /**
   * Returns the Player's Rank-related information
   *
   * 获取玩家段位信息: 获取玩家段位相关信息
   *
   */
  getPlayerRankingInfo: () => {
    /**
     *
     * 玩家段位总分
     */
    playerRankTotalScore: bigint
    /**
     *
     * 玩家连胜次数
     */
    playerWinStreak: bigint
    /**
     *
     * 玩家连败次数
     */
    playerLoseStreak: bigint
    /**
     *
     * 玩家连续逃跑次数
     */
    playerConsecutiveEscapes: bigint
  }

  /**
   * Returns the remaining number of revives for the specified Player Entity
   *
   * 获取玩家剩余复苏次数: 获取指定玩家实体的剩余复苏次数
   *
   * @returns
   *
   * 剩余次数
   */
  getPlayerRemainingRevives: () => bigint

  /**
   * Returns the revive duration of the specified Player Entity, in seconds
   *
   * 获取玩家复苏耗时: 获取指定玩家实体的复苏耗时，单位秒
   *
   * @returns
   *
   * 时长
   */
  getPlayerReviveTime: () => bigint

  /**
   * Returns the ID of the currently active Interface Layout on the specified Player Entity
   *
   * 获取玩家当前界面布局: 获取指定玩家实体上当前生效的界面布局的索引
   *
   * @returns
   *
   * 布局索引
   */
  getPlayerSCurrentUiLayout: () => bigint

  /**
   * Returns the Settlement ranking value for the specified Player Entity
   *
   * 获取玩家结算排名数值: 获取指定玩家实体结算的排名数值
   *
   * @returns
   *
   * 排名数值
   */
  getPlayerSettlementRankingValue: () => bigint

  /**
   * Get Player Settlement Success Status
   *
   * 获取玩家结算成功状态: 获取玩家结算成功状态
   *
   * @returns Includes: Undetermined, Victory, Defeat
   *
   * 结算状态: 分为未定、胜利、失败
   */
  getPlayerSettlementSuccessStatus: () => SettlementStatus

  /**
   * Returns the value of the specified Preset Status for the Target Entity. Returns 0 if the Entity does not have that Preset Status
   *
   * 获取预设状态: 获取目标实体的指定预设状态的预设状态值。如果该实体没有指定的预设状态，则返回0
   *
   * @param presetStatusIndex
   *
   * 预设状态索引
   *
   * @returns
   *
   * 预设状态值
   */
  getPresetStatus: (presetStatusIndex: IntValue) => bigint

  /**
   * Get Specific Entity's Aggro List
   *
   * 获取指定实体的仇恨列表: 获取指定实体的仇恨列表
   *
   * @returns
   *
   * 仇恨列表
   */
  getTheAggroListOfTheSpecifiedEntity: () => entity[]

  /**
   * Get Aggro Target of Specific Entity
   *
   * 获取指定实体的仇恨目标: 获取指定实体的仇恨目标
   *
   * @returns
   *
   * 仇恨目标
   */
  getTheAggroTargetOfTheSpecifiedEntity: () => entity

  /**
   * Returns the Configuration ID of the currently active Scan Tags on the Target Entity
   *
   * 获取当前生效的扫描标签配置ID: 获取目标实体上当前生效的扫描标签的配置ID
   *
   * @returns
   *
   * 扫描标签配置ID
   */
  getTheCurrentlyActiveScanTagConfigId: () => configId

  /**
   * Get the equipment index of the specified equipment slot
   *
   * 获取指定装备栏位的装备索引
   *
   * @param row
   *
   * 装备栏位行
   * @param column
   *
   * 装备栏位列
   *
   * @returns
   *
   * 装备索引
   */
  getTheEquipmentIndexOfTheSpecifiedEquipmentSlot: (row: IntValue, column: IntValue) => bigint

  /**
   * Returns the preset status value of the specified complex creation
   *
   * 获取复杂造物的预设状态值: 查询指定复杂造物的预设状态值
   *
   * @param presetStatusIndex
   *
   * 预设状态索引
   *
   * @returns
   *
   * 预设状态值
   */
  getThePresetStatusValueOfTheComplexCreation: (presetStatusIndex: IntValue) => bigint

  /**
   * Directly cause the specified target to lose HP. Losing HP is not an attack, so it does not trigger attack-related events
   *
   * 损失生命: 使指定目标直接损失生命。损失生命不是攻击，因此不会触发攻击相关的事件
   *
   * @param hpLoss The amount of HP lost in this instance
   *
   * 生命损失量: 该次损失生命值的损失量
   * @param lethal If set to False, this HP loss will leave the Target with at least 1 HP remaining
   *
   * 是否致命: 为“否”时，该次损失生命最多使目标生命扣为1点
   * @param canBeBlockedByInvincibility If set to True, and the Target is set to Invincible via Unit Status, HP loss has no effect
   *
   * 是否可被无敌抵挡: 为“是”时，如果目标已经通过单位状态设置为了无敌，则损失生命不生效
   * @param canBeBlockedByLockedHp If set to True, and the Target's HP is locked via Unit Status, HP loss has no effect
   *
   * 是否可被锁定生命值抵挡: 为“是”时，如果目标已经通过单位状态设置为了锁定生命值，则损失生命不生效
   * @param damagePopUpType No Pop-UpNormal Pop-UpCRIT Hit Pop-Up
   *
   * 伤害跳字类型: 无跳字普通跳字暴击跳字
   */
  hpLoss: (
    hpLoss: FloatValue,
    lethal: BoolValue,
    canBeBlockedByInvincibility: BoolValue,
    canBeBlockedByLockedHp: BoolValue,
    damagePopUpType: DamagePopUpType
  ) => void

  /**
   * Increase the maximum Inventory capacity of the specified Inventory Owner
   *
   * 增加背包最大容量: 增加指定背包持有者的背包最大容量
   *
   * @param increaseCapacity
   *
   * 增加容量
   */
  increaseMaximumInventoryCapacity: (increaseCapacity: IntValue) => void

  /**
   * Increase the Player's current Class EXP. Any excess beyond the maximum Level will not take effect
   *
   * 提升玩家当前职业经验: 提升玩家当前职业经验，超出最大等级的部分会无效
   *
   * @param exp Amount of EXP to be increased
   *
   * 经验值: 所要提升的经验值
   */
  increasePlayerSCurrentClassExp: (exp: IntValue) => void

  /**
   * Reset the Target Character's skills to those defined in the Class Template
   *
   * 初始化角色技能: 使目标角色的技能重置为职业模板上配置的技能
   *
   * @param characterSkillSlot The Skill Slot to initialize: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要初始化的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   */
  initializeCharacterSkill: (characterSkillSlot: CharacterSkillSlot) => void

  /**
   * Make the specified Entity initiate an attack. The Entity that uses this node must have the corresponding Ability Unit configured.; There are two usage modes:; When the Ability Unit is [Hitbox Attack], it executes a hitbox attack centered on the Target Entity's Location; When the Ability Unit is [Direct Attack], it directly attacks the Target Entity
   *
   * 发起攻击: 使指定实体发起攻击。使用该节点的实体上需要有对应的能力单元配置。; 分为两种使用方式：; 当能力单元为【攻击盒攻击】时，会以目标实体的位置为基准，打出一次攻击盒攻击; 当能力单元为【直接攻击】时，会直接攻击目标实体
   *
   * @param damageCoefficient The coefficient applied to the damage dealt by this attack
   *
   * 伤害系数: 该次攻击造成伤害的系数
   * @param damageIncrement The incremental damage applied by this attack
   *
   * 伤害增量: 该次攻击造成伤害的增量
   * @param locationOffset When using Hitbox Attack, determines the Hitbox offset When using Direct Attack, determines the hit-detection location for the attack and thus where on-hit special effects are created
   *
   * 位置偏移: 使用【攻击盒攻击】时，决定了攻击盒的偏移 使用【直接攻击】时，决定了该次攻击的判定位置，影响受击特效等的创建位置
   * @param rotationOffset When using Hitbox Attack, determines the Hitbox rotation When using Direct Attack, determines the hit-detection location for the attack and thus the rotation used for on-hit effects
   *
   * 旋转偏移: 使用【攻击盒攻击】时，决定了攻击盒的旋转 使用【直接攻击】时，决定了该次攻击的判定位置，影响受击特效等的旋转
   * @param abilityUnit Referenced Ability Unit. Must be configured on the entity associated with this Node Graph
   *
   * 能力单元: 引用的能力单元，需要配置在此节点图所关联的实体上
   * @param overwriteAbilityUnitConfig When set to True, the four parameters — Damage Coefficient, Damage Increment, Location Offset, and Rotation Offset — overwrite parameters of the same name in the Ability Unit. When set to False, the Ability Unit's original configuration is used
   *
   * 是否覆写能力单元配置: 为“是”时，伤害系数、伤害增量、位置偏移、旋转偏移这四个系数会覆写能力单元中的同名配置。为“否”时，则使用能力单元中的配置
   * @param initiatorEntity Determines the Initiator Entity for this attack. Defaults to the Entity associated with this Node Graph. Affects which attacker is identified in events such as On Hit and When Attacked
   *
   * 发起者实体: 决定了该次攻击的发起者实体，默认为该节点图所关联的实体。影响【攻击命中时】、【受到攻击时】等事件中判定的攻击者
   */
  initiateAttack: (
    damageCoefficient: FloatValue,
    damageIncrement: FloatValue,
    locationOffset: Vec3Value,
    rotationOffset: Vec3Value,
    abilityUnit: StrValue,
    overwriteAbilityUnitConfig: BoolValue,
    initiatorEntity: EntityValue
  ) => void

  /**
   * Open the pre-made Deck Selector for the Target Player
   *
   * 唤起卡牌选择器: 对目标玩家打开提前制作好的卡牌选择器
   *
   * @param deckSelectorId Referenced UI Control Group ID
   *
   * 卡牌选择器索引: 引用的界面控件组索引
   * @param selectDuration If empty, uses the Deck Selector's default configuration; otherwise, this time value is used as the effective durationUnit in seconds
   *
   * 选择时长: 若为空，则读取卡牌选择器默认配置；若不为空，以此处时间参数为实际生效时长单位为秒
   * @param selectResultCorrespondingList One-to-one with display items: the Deck Selector returns the result value corresponding to each display itemRecommended configuration: 1 to X
   *
   * 选择结果对应列表: 和显示项一一对应，卡牌选择器返回的实际结果是显示项对应的结果值推荐配置1至X
   * @param selectDisplayCorrespondingList Deck Library Configuration Reference
   *
   * 选择显示对应列表: 卡牌库中的配置引用
   * @param selectMinimumQuantity The minimum number of cards that must be selected for a valid interaction
   *
   * 选择数量下限: 选择卡牌数量下限，满足数量才可进行合法的选择交互
   * @param selectMaximumQuantity The maximum number of cards that can be selected for a valid interaction
   *
   * 选择数量上限: 选择卡牌数量上限，满足数量才可进行合法的选择交互
   * @param refreshMode No Refresh
   *
   * 刷新方式: 不可刷新
   * @param refreshMinimumQuantity The minimum number of cards that must be selected for a valid refresh interaction.
   *
   * 刷新数量下限: 选择卡牌数量下限，满足数量才可进行合法的刷新交互
   * @param refreshMaximumQuantity The maximum number of cards that can be selected for a valid refresh interaction
   *
   * 刷新数量上限: 选择卡牌数量上限，满足数量才可进行合法的刷新交互
   * @param defaultReturnSelection If the Deck Selector times out, has no interaction, or closes abnormally, force-assign this configured resultThe length of this Result List must match the valid card selection count
   *
   * 默认返回选择: 如果卡牌选择器超时/未交互/卡牌选择器异常关闭等情况，支持强制赋予配置的该结果该结果的列表长度，需要和合法选择卡牌数量一致
   */
  invokeDeckSelector: (
    deckSelectorId: IntValue,
    selectDuration: FloatValue,
    selectResultCorrespondingList: IntValue[],
    selectDisplayCorrespondingList: IntValue[],
    selectMinimumQuantity: IntValue,
    selectMaximumQuantity: IntValue,
    refreshMode: DecisionRefreshMode,
    refreshMinimumQuantity: IntValue,
    refreshMaximumQuantity: IntValue,
    defaultReturnSelection: IntValue[]
  ) => void

  /**
   * Searches the list of all Slot IDs for the Unit Status with the specified Config ID on the Target Entity
   *
   * 查询单位状态的槽位序号列表: 查询指定目标实体上特定配置ID的单位状态的所有槽位序号列表
   *
   * @param unitStatusConfigId
   *
   * 单位状态配置ID
   *
   * @returns
   *
   * 槽位序号列表
   */
  listOfSlotIdsQueryingUnitStatus: (unitStatusConfigId: ConfigIdValue) => bigint[]

  /**
   * Edit the cooldown of the specified Skill Slot on the Target Character. The edit value is added to the current cooldown and can be negative
   *
   * 修改角色技能冷却: 修改目标角色某个技能槽位的冷却，会在当前冷却时间上加修改值，修改值可以为负数
   *
   * @param characterSkillSlot The Skill Slot to edited: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要修改的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   * @param cdModifier New Value = Original Value + Edit Value
   *
   * 冷却时间修改值: 修改后的值为：原值+修改值
   * @param limitMaximumCdTime If set to True, the edited Cooldown cannot be less than the specified minimum value
   *
   * 是否限制最大冷却时间: 为“是”可以限制修改后的冷却时间不小于所限制的值
   */
  modifyCharacterSkillCd: (
    characterSkillSlot: CharacterSkillSlot,
    cdModifier: FloatValue,
    limitMaximumCdTime: BoolValue
  ) => void

  /**
   * Edit sale info for custom shop items
   *
   * 修改自定义商店商品出售信息: 修改自定义商店商品出售信息
   *
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemId
   *
   * 商品序号
   * @param itemConfigId
   *
   * 道具配置ID
   * @param sellCurrencyDictionary
   *
   * 出售货币字典
   * @param affiliatedTabId 1 Equipment, 2 Consumables, 3 Materials, 4 Valuables
   *
   * 所属页签序号: 1装备、2消耗品、3材料、4贵重物品
   * @param limitPurchase
   *
   * 是否限购
   * @param purchaseLimit
   *
   * 限购数量
   * @param sortPriority
   *
   * 排序优先级
   * @param canBeSold
   *
   * 是否可出售
   */
  modifyCustomShopItemSalesInfo: (
    shopId: IntValue,
    shopItemId: IntValue,
    itemConfigId: ConfigIdValue,
    sellCurrencyDictionary: dict<'config_id', 'int'>,
    affiliatedTabId: IntValue,
    limitPurchase: BoolValue,
    purchaseLimit: IntValue,
    sortPriority: IntValue,
    canBeSold: BoolValue
  ) => void

  /**
   * Edit the Faction of the specified Target Entity
   *
   * 修改实体阵营: 修改指定目标实体的阵营
   *
   * @param faction Edited Faction
   *
   * 阵营: 修改后的阵营
   */
  modifyEntityFaction: (faction: FactionValue) => void

  /**
   * Adjust the time of a running Global Timer via the Node Graph; If the timer is paused first and then modified to reduce the time, the modified time will be at least 0 seconds.; For countdown timers, pausing followed by modifying the time to 0s will trigger the [When the Global Timer Is Triggered] event upon resuming the timer.; If the timer is paused first, then modified to 0s, followed by modifying the time to increase it, and finally resumed, the [When the Global Timer Is Triggered] event will not be triggered.
   *
   * 修改全局计时器: 通过节点图，可以将运行中的全局计时器时间进行调整; 若计时器先暂停，后修改减少时间，则修改后时间最少为0s; 若为倒计时，则暂停后修改时间为0s且恢复计时器后，会触发【全局计时器触发时】事件; 若计时器先暂停，后修改时间到0s，再修改增加时间，再恢复计时器，则不会触发【全局计时器触发时】事件; 若有界面控件引用对应计时器，则界面控件的计时表现会同步修改
   *
   * @param timerName Identifier for the Timer. Only Timer Names configured in Timer Management can be referenced
   *
   * 计时器名称: 该计时器的标识，只能引用在计时器管理中已经配置好的计时器名称
   * @param changeValue For a Countdown Timer, a positive value increases the remaining time; a negative value decreases the remaining timeIf the timer is set to Stopwatch, a positive value increases the accumulated time, while a negative value decreases it
   *
   * 变化值: 若计时器为倒计时，则正数为增加倒计时剩余时间，负数为减少剩余时间若计时器为正计时，则正数为增加正计时累计时间，负数为减少累计时间
   */
  modifyGlobalTimer: (timerName: StrValue, changeValue: FloatValue) => void

  /**
   * Edit the amount of the specified Currency in the Inventory
   *
   * 修改背包货币数量: 修改背包内指定货币的数量
   *
   * @param currencyConfigId
   *
   * 货币配置ID
   * @param changeValue New Value = Original Value + Change Value
   *
   * 变更值: 变更后的值=变更前的值+变更值
   */
  modifyInventoryCurrencyQuantity: (currencyConfigId: ConfigIdValue, changeValue: IntValue) => void

  /**
   * Edit the quantity of the specified Item in the Inventory
   *
   * 修改背包道具数量: 修改背包内指定道具的数量
   *
   * @param itemConfigId
   *
   * 道具配置ID
   * @param changeValue New Value = Original Value + Change Value
   *
   * 变更值: 变更后的值=变更前的值+变更值
   */
  modifyInventoryItemQuantity: (itemConfigId: ConfigIdValue, changeValue: IntValue) => void

  /**
   * Edit sale info for inventory shop items
   *
   * 修改背包商店商品出售信息: 修改背包商店商品出售信息
   *
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param itemConfigId
   *
   * 道具配置ID
   * @param sellCurrencyDictionary
   *
   * 出售货币字典
   * @param affiliatedTabId
   *
   * 所属页签序号
   * @param sortPriority
   *
   * 排序优先级
   * @param canBeSold
   *
   * 是否可出售
   */
  modifyInventoryShopItemSalesInfo: (
    shopId: IntValue,
    itemConfigId: ConfigIdValue,
    sellCurrencyDictionary: dict<'config_id', 'int'>,
    affiliatedTabId: IntValue,
    sortPriority: IntValue,
    canBeSold: BoolValue
  ) => void

  /**
   * Edit Item Purchase Information in the Item Purchase List
   *
   * 修改物品收购表中道具收购信息: 修改物品收购表中道具收购信息
   *
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemConfigId
   *
   * 商品道具配置ID
   * @param purchaseCurrencyDictionary
   *
   * 收购货币字典
   * @param purchasable
   *
   * 是否可收购
   */
  modifyItemPurchaseInfoInThePurchaseList: (
    shopId: IntValue,
    shopItemConfigId: ConfigIdValue,
    purchaseCurrencyDictionary: dict<'config_id', 'int'>,
    purchasable: BoolValue
  ) => void

  /**
   * Edit the amount of the specified Currency in the Loot Component on the Loot Prefab
   *
   * 修改掉落物组件货币数量: 修改掉落物元件上掉落物组件内指定货币的数量
   *
   * @param currencyConfigId
   *
   * 货币配置ID
   * @param changeValue New Value = Original Value + Change Value
   *
   * 变更值: 变更后的值=变更前的值+变更值
   */
  modifyLootComponentCurrencyAmount: (
    currencyConfigId: ConfigIdValue,
    changeValue: IntValue
  ) => void

  /**
   * Edit the quantity of the specified Item in the Loot Component on the Loot Prefab
   *
   * 修改掉落物组件道具数量: 修改掉落物元件上掉落物组件内指定道具的数量
   *
   * @param itemConfigId
   *
   * 道具配置ID
   * @param changeValue New Value = Original Value + Change Value
   *
   * 变更值: 变更后的值=变更前的值+变更值
   */
  modifyLootItemComponentQuantity: (itemConfigId: ConfigIdValue, changeValue: IntValue) => void

  /**
   * Edit the active state of mini-map markers on the Target Entity in batches using the input list of Mini-map Marker IDs
   *
   * 修改小地图标识生效状态: 通过节点输入的小地图标识序号列表，批量修改目标实体的小地图标识生效状态
   *
   * @param miniMapMarkerIdList List of Mini-map Marker IDs to be set to the specified statusUnconfigured Mini-map Markers will be set to the opposite status
   *
   * 小地图标识序号列表: 需要指定状态的小地图标识序号列表未配置的小地图标识会改为相反状态
   * @param active If input is True,the Mini-map Markers corresponding to the specified ID numbers in the input list will be set to EnabledFor IDs not in the input list, the corresponding Mini-map Markers will be set to Disabled
   *
   * 是否生效: 若输入为“是”，输入序号列表指定的序号，对应小地图标识状态改为生效状态不在序号列表中的序号，对应小地图标识状态改为不生效状态
   */
  modifyMiniMapMarkerActivationStatus: (miniMapMarkerIdList: IntValue[], active: BoolValue) => void

  /**
   * Edit the map scale of the Target Player's mini-map UI control
   *
   * 修改小地图缩放: 修改目标玩家的小地图界面控件的地图比例
   *
   * @param zoomDimensions
   *
   * 缩放尺寸
   */
  modifyMiniMapZoom: (zoomDimensions: FloatValue) => void

  /**
   * Edit background music parameters for the Player
   *
   * 修改玩家背景音乐: 修改玩家背景音乐相关参数
   *
   * @param backgroundMusicIndex
   *
   * 背景音乐索引
   * @param startTime
   *
   * 开始时间
   * @param endTime
   *
   * 结束时间
   * @param volume
   *
   * 音量
   * @param loopPlayback
   *
   * 是否循环播放
   * @param loopInterval
   *
   * 循环播放间隔
   * @param playbackSpeed
   *
   * 播放速度
   * @param enableFadeInOut
   *
   * 是否允许渐入渐出
   */
  modifyPlayerBackgroundMusic: (
    backgroundMusicIndex: IntValue,
    startTime: FloatValue,
    endTime: FloatValue,
    volume: IntValue,
    loopPlayback: BoolValue,
    loopInterval: FloatValue,
    playbackSpeed: FloatValue,
    enableFadeInOut: BoolValue
  ) => void

  /**
   * Set the mini-map marker at the specified ID on the Target Entity to Tracking Display for the input Player
   *
   * 修改追踪小地图标识的玩家列表: 将目标实体的对应序号的小地图标识对入参玩家修改为追踪表现
   *
   * @param miniMapMarkerId
   *
   * 小地图标识序号
   * @param playerList
   *
   * 玩家列表
   */
  modifyPlayerListForTrackingMiniMapMarkers: (
    miniMapMarkerId: IntValue,
    playerList: PlayerEntity[]
  ) => void

  /**
   * The mini-map marker at the specified ID in the Target Entity's Mini-map Marker Component is visible to all Players in the Player List
   *
   * 修改可见小地图标识的玩家列表: 目标实体的小地图标识组件上对应序号的小地图标识对玩家列表中的玩家可见
   *
   * @param miniMapMarkerId ID of the specified Mini-map Marker to be edited
   *
   * 小地图标识序号: 要修改的指定小地图标识的序号
   * @param playerList The specified Mini-map ID on the Target Entity, visible only to the Player providing input
   *
   * 玩家列表: 目标实体的指定小地图序号，只有输入玩家可见
   */
  modifyPlayerListForVisibleMiniMapMarkers: (
    miniMapMarkerId: IntValue,
    playerList: PlayerEntity[]
  ) => void

  /**
   * When the Player Marker option is selected and a corresponding Player Entity is linked in the Node Graph, the Target Entity's display on the mini-map changes to that Player's avatar
   *
   * 修改小地图标识的玩家标记: 若小地图标识选择了玩家标记，在节点图输入对应玩家实体后，目标实体在小地图上的显示会变成输入玩家实体的头像
   *
   * @param miniMapMarkerId ID of the specified Mini-map Marker to be edited
   *
   * 小地图标识序号: 要修改的指定小地图标识的序号
   * @param correspondingPlayerEntity Changes the avatar of the corresponding Player Entity
   *
   * 对应玩家实体: 修改后为对应玩家实体的头像
   */
  modifyPlayerMarkersOnTheMiniMap: (
    miniMapMarkerId: IntValue,
    correspondingPlayerEntity: PlayerEntity
  ) => void

  /**
   * Edit the cooldown percentage of a skill in a Character's Skill Slot based on its maximum cooldown
   *
   * 按最大冷却时间修改技能冷却百分比: 通过技能最大冷却时间的百分比来修改角色某个技能槽位内的技能
   *
   * @param characterSkillSlot The Skill Slot to edited: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要修改的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   * @param cooldownRatioModifier Actual Cooldown after Editing = Original Cooldown × Cooldown Ratio Edit Value
   *
   * 冷却比例修改值: 修改后的实际冷却时间为：原冷却时间*冷却比例修改值
   * @param limitMaximumCdTime If set to True, the edited Cooldown cannot be less than the specified minimum value
   *
   * 是否限制最大冷却时间: 为“是”可以限制修改后的冷却时间不小于所限制的值
   */
  modifySkillCdPercentageBasedOnMaxCd: (
    characterSkillSlot: CharacterSkillSlot,
    cooldownRatioModifier: FloatValue,
    limitMaximumCdTime: BoolValue
  ) => void

  /**
   * Edit the skill's resource amount by adding the change value to the current value. The change value can be negative
   *
   * 修改技能资源量: 修改技能的资源量，会在当前值上加上变更值，变更值可以为负数
   *
   * @param skillResourceConfigId Skill Resource Identifier
   *
   * 技能资源配置ID: 技能资源的标识
   * @param changeValue New Value = Original Value + Change Value
   *
   * 变更值: 修改后的值为：原值+变更值
   */
  modifySkillResourceAmount: (skillResourceConfigId: ConfigIdValue, changeValue: FloatValue) => void

  /**
   * Edit the state of the UI Control in the Target Player's Interface Layout by its UI Control ID
   *
   * 修改界面布局内界面控件状态: 通过界面控件索引来修改目标玩家界面布局内对应界面控件的状态
   *
   * @param uiControlIndex Identifier for the UI Control
   *
   * 界面控件索引: 界面控件的标识
   * @param displayStatus Off: Invisible and logic not runningOn: Visible and logic running normallyHidden: Invisible and logic running normally
   *
   * 显示状态: 关闭：不可见且逻辑不运行开启：可见+逻辑正常运行隐藏：不可见+逻辑正常运行
   */
  modifyUiControlStatusWithinTheInterfaceLayout: (
    uiControlIndex: IntValue,
    displayStatus: UIControlGroupStatus
  ) => void

  /**
   * Edit the Character Disruptor Device active on the Target Entity by ID; if the ID does not exist, the change has no effect
   *
   * 修改角色扰动装置: 通过序号修改目标实体上生效的角色扰动装置，若序号不存在则此次修改不生效
   *
   * @param deviceId Identifier for the Character Disruptor Device
   *
   * 装置序号: 角色扰动装置的标识
   */
  modifyingCharacterDisruptorDevice: (deviceId: IntValue) => void

  /**
   * Open the Shop from the Player Entity's perspective during gameplay
   *
   * 打开商店: 在游戏运行过程中以玩家实体的视角打开商店
   *
   * @param shopOwnerEntity The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店归属者实体: 商店归属者实体的商店组件对应的商店序号
   * @param shopId
   *
   * 商店序号
   */
  openShop: (shopOwnerEntity: EntityValue, shopId: IntValue) => void

  /**
   * Pause a running Motion Device. The Resume Motion Device node can then be used to resume it
   *
   * 暂停基础运动器: 暂停一个运行中的运动器，之后可使用恢复运动器节点使其恢复运动
   *
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   */
  pauseBasicMotionDevice: (motionDeviceName: StrValue) => void

  /**
   * Pause a running Global Timer via the Node Graph; When paused, the UI controls linked to the timer will also pause their display
   *
   * 暂停全局计时器: 通过节点图，可以暂停运行中的全局计时器; 暂停时，若有界面控件引用对应计时器，则其显示时间也会暂停
   *
   * @param timerName Identifier for the Timer. Only Timer Names configured in Timer Management can be referenced
   *
   * 计时器名称: 该计时器的标识，只能引用在计时器管理中已经配置好的计时器名称
   */
  pauseGlobalTimer: (timerName: StrValue) => void

  /**
   * Pauses the specified Timer on the Target Entity. The [Resume Timer] node can then be used to resume its countdown
   *
   * 暂停定时器: 暂停指定目标实体上的指定定时器。之后可以使用【恢复定时器】节点恢复该定时器的计时
   *
   * @param timerName Timer Identifier
   *
   * 定时器名称: 该定时器的标识
   */
  pauseTimer: (timerName: StrValue) => void

  /**
   * Player plays a one-shot 2D Sound Effect
   *
   * 玩家播放单次2D音效: 玩家播放单次2D音效
   *
   * @param soundEffectAssetIndex
   *
   * 音效资产索引
   * @param volume
   *
   * 音量
   * @param playbackSpeed
   *
   * 播放速度
   */
  playerPlaysOneShot2dSoundEffect: (
    soundEffectAssetIndex: IntValue,
    volume: IntValue,
    playbackSpeed: FloatValue
  ) => void

  /**
   * Can only be searched when the Character has the [Monitor Movement Speed] Unit Status effect
   *
   * 查询角色当前移动速度: 仅当角色拥有【监听移动速率】的单位状态效果时，才能查询
   *
   * GSTS Note: The speed obtained is the actual movement speed, not the expected speed, and will be 0 when actually blocked, even when in motion
   *
   * GSTS 注: 获取到的速度是真实的运动速度, 而非期望速度, 被实际阻挡时速度将为0, 即使在运动
   */
  queryCharacterSCurrentMovementSpd: () => {
    /**
     *
     * 当前速度
     */
    currentSpeed: number
    /**
     *
     * 速度向量
     */
    velocityVector: vec3
  }

  /**
   * Searches the Skill in the specified slot of a Character; outputs that Skill's Config ID
   *
   * 查询角色技能: 查询角色指定槽位的技能，会输出该技能的配置ID
   *
   * @param characterSkillSlot
   *
   * 角色技能槽位
   *
   * @returns
   *
   * 技能配置ID
   */
  queryCharacterSkill: (characterSkillSlot: CharacterSkillSlot) => configId

  /**
   * Searches the consumed quantity of the specified Gift Box on the Player Entity
   *
   * 查询对应礼盒消耗数量: 查询玩家实体上指定礼盒的消耗数量
   *
   * @param giftBoxIndex
   *
   * 礼盒索引
   *
   * @returns
   *
   * 数量
   */
  queryCorrespondingGiftBoxConsumption: (giftBoxIndex: IntValue) => bigint

  /**
   * Searches the quantity of the specified Gift Box on the Player Entity
   *
   * 查询对应礼盒数量: 查询玩家实体上指定礼盒的数量
   *
   * @param giftBoxIndex
   *
   * 礼盒索引
   *
   * @returns
   *
   * 数量
   */
  queryCorrespondingGiftBoxQuantity: (giftBoxIndex: IntValue) => bigint

  /**
   * Searches sale information for a specified Item in the Custom Shop
   *
   * 查询自定义商店商品出售信息: 查询自定义商店特定商品的出售信息
   *
   * @param shopId
   *
   * 商店序号
   * @param shopItemId
   *
   * 商品序号
   */
  queryCustomShopItemSalesInfo: (
    shopId: IntValue,
    shopItemId: IntValue
  ) => {
    /**
     *
     * 道具配置ID
     */
    itemConfigId: configId
    /**
     *
     * 出售货币字典
     */
    sellCurrencyDictionary: dict<'config_id', 'int'>
    /**
     *
     * 所属页签序号
     */
    affiliatedTabId: bigint
    /**
     *
     * 是否限购
     */
    limitPurchase: boolean
    /**
     *
     * 限购数量
     */
    purchaseLimit: bigint
    /**
     *
     * 排序优先级
     */
    sortPriority: bigint
    /**
     *
     * 是否可出售
     */
    canBeSold: boolean
  }

  /**
   * Searches the Custom Shop sale list; the output parameter is a list of Item IDs
   *
   * 查询自定义商店商品出售列表: 查询自定义商店商品出售列表，出参为商品序号组成的列表
   *
   * @param shopId
   *
   * 商店序号
   *
   * @returns
   *
   * 商品序号列表
   */
  queryCustomShopItemSalesList: (shopId: IntValue) => bigint[]

  /**
   * Searches the Faction of the specified Entity
   *
   * 查询实体阵营: 查询指定实体的阵营
   *
   * @returns
   *
   * 阵营
   */
  queryEntityFaction: () => faction

  /**
   * Searches for the GUID of the specified Entity
   *
   * 以实体查询GUID: 查询指定实体的GUID
   *
   * @returns
   *
   * GUID
   */
  queryGuidByEntity: () => guid

  /**
   * Searches whether the Achievement corresponding to a specific ID on the Target Entity is complete
   *
   * 查询成就是否完成: 查询目标实体上特定序号对应的成就是否完成
   *
   * @param achievementId
   *
   * 成就序号
   *
   * @returns
   *
   * 是否完成
   */
  queryIfAchievementIsCompleted: (achievementId: IntValue) => boolean

  /**
   * Check if all of the player's characters are downed
   *
   * 查询玩家角色是否全部倒下: 查询玩家的所有角色是否已全部倒下
   *
   * @returns
   *
   * 结果
   */
  queryIfAllPlayerCharactersAreDown: () => boolean

  /**
   * Searches whether the specified Entity has a Unit Status with the given Config ID
   *
   * 查询实体是否具有单位状态: 查询指定实体是否具有特定配置ID的单位状态
   *
   * @param unitStatusConfigId
   *
   * 单位状态配置ID
   *
   * @returns
   *
   * 是否具有
   */
  queryIfEntityHasUnitStatus: (unitStatusConfigId: ConfigIdValue) => boolean

  /**
   * Searches whether the specified Entity is present; Note that Character Entities are still considered present even when Downed
   *
   * 查询实体是否在场: 查询指定实体是否在场; 注意角色实体即使处于倒下状态，仍然认为在场
   *
   * @returns
   *
   * 是否在场
   */
  queryIfEntityIsOnTheField: () => boolean

  /**
   * Searches whether the specified Entity has entered battle
   *
   * 查询指定实体是否已入战: 查询指定实体是否已经入战
   *
   * @returns
   *
   * 是否入战
   */
  queryIfSpecifiedEntityIsInCombat: () => boolean

  /**
   * Searches sale information for a specified Item in the Inventory Shop
   *
   * 查询背包商店商品出售信息: 查询背包商店种特定商品的出售信息
   *
   * @param shopId
   *
   * 商店序号
   * @param itemConfigId
   *
   * 道具配置ID
   */
  queryInventoryShopItemSalesInfo: (
    shopId: IntValue,
    itemConfigId: ConfigIdValue
  ) => {
    /**
     *
     * 出售货币字典
     */
    sellCurrencyDictionary: dict<'config_id', 'int'>
    /**
     *
     * 排序优先级
     */
    sortPriority: bigint
    /**
     *
     * 是否可出售
     */
    canBeSold: boolean
  }

  /**
   * Search the inventory shop's sales list
   *
   * 查询背包商店物品出售列表: 查询背包商店物品出售列表
   *
   * @param shopId
   *
   * 商店序号
   *
   * @returns
   *
   * 道具配置ID列表
   */
  queryInventoryShopItemSalesList: (shopId: IntValue) => configId[]

  /**
   * Searches the Player's current Class; outputs the Config ID of that Class
   *
   * 查询玩家职业: 查询玩家当前的职业，会输出该职业的配置ID
   *
   * @returns
   *
   * 职业配置ID
   */
  queryPlayerClass: () => configId

  /**
   * Searches the Player's Level of the specified Class
   *
   * 查询玩家职业的等级: 查询玩家指定职业的等级
   *
   * @param classConfigId
   *
   * 职业配置ID
   *
   * @returns
   *
   * 等级
   */
  queryPlayerClassLevel: (classConfigId: ConfigIdValue) => bigint

  /**
   * Searches purchase information for a specified Item in the Shop
   *
   * 查询商店物品收购信息: 查询商店特定物品的收购信息
   *
   * @param shopId
   *
   * 商店序号
   * @param itemConfigId
   *
   * 道具配置ID
   */
  queryShopItemPurchaseInfo: (
    shopId: IntValue,
    itemConfigId: ConfigIdValue
  ) => {
    /**
     *
     * 收购货币字典
     */
    purchaseCurrencyDictionary: dict<'config_id', 'int'>
    /**
     *
     * 是否可收购
     */
    purchasable: boolean
  }

  /**
   * Search the shop's purchase list
   *
   * 查询商店收购物品列表: 查询商店收购物品列表
   *
   * @param shopId
   *
   * 商店序号
   *
   * @returns
   *
   * 道具配置ID列表
   */
  queryShopPurchaseItemList: (shopId: IntValue) => configId[]

  /**
   * Searches the information of the Mini-map Marker with the specified ID in the Mini-map Marker Component on the Target Entity
   *
   * 查询指定小地图标识信息: 查询目标实体上小地图标识组件中特定序号对应的小地图标识的信息
   *
   * @param miniMapMarkerId The Mini-map Marker ID to search
   *
   * 小地图标识序号: 要查询的指定小地图标识的序号
   */
  querySpecifiedMiniMapMarkerInformation: (miniMapMarkerId: IntValue) => {
    /**
     * The active state of the searched Mini-map Marker
     *
     * 生效状态: 查询的小地图标识的生效状态
     */
    activationStaet: boolean
    /**
     * Returns the list of Players who can see this Marker
     *
     * 可见标识的玩家列表: 返回可见该标识的玩家列表
     */
    listOfPlayersWithVisibleMarkers: PlayerEntity[]
    /**
     * Returns the list of Players tracking this Marker
     *
     * 追踪标识的玩家列表: 返回追踪该标识的玩家列表
     */
    listOfPlayersTrackingMarkers: PlayerEntity[]
  }

  /**
   * Query Aggro Multiplier of Specific Entity
   *
   * 查询指定实体的仇恨倍率: 查询指定实体的仇恨倍率
   *
   * @returns
   *
   * 仇恨倍率
   */
  queryTheAggroMultiplierOfTheSpecifiedEntity: () => number

  /**
   * Searches the Aggro Value of the Target Entity on its Aggro Owners
   *
   * 查询指定实体的仇恨值: 查询目标实体在仇恨拥有者上的仇恨值
   *
   * @param aggroOwner
   *
   * 仇恨拥有者
   *
   * @returns
   *
   * 仇恨值
   */
  queryTheAggroValueOfTheSpecifiedEntity: (aggroOwner: EntityValue) => bigint

  /**
   * Searches the Applier of the specified Unit Status on the Target Entity's designated Slot
   *
   * 根据槽位序号查询单位状态施加者: 查询目标实体指定槽位上的特定单位状态的施加者
   *
   * @param unitStatusConfigId
   *
   * 单位状态配置ID
   * @param slotId
   *
   * 槽位序号
   *
   * @returns
   *
   * 施加者实体
   */
  queryUnitStatusApplierBySlotId: (unitStatusConfigId: ConfigIdValue, slotId: IntValue) => entity

  /**
   * Searches the Stack Count of the specified Unit Status on the Target Entity's designated Slot
   *
   * 根据槽位序号查询单位状态层数: 查询目标实体指定槽位上的特定单位状态的层数
   *
   * @param unitStatusConfigId
   *
   * 单位状态配置ID
   * @param slotId
   *
   * 槽位序号
   *
   * @returns
   *
   * 层数
   */
  queryUnitStatusStacksBySlotId: (unitStatusConfigId: ConfigIdValue, slotId: IntValue) => bigint

  /**
   * Resume a paused Basic Motion Device on the Target Entity. The Target Entity must have the Basic Motion Device Component
   *
   * 恢复基础运动器: 使目标实体上一个处于暂停状态的基础运动器恢复运动，需要目标实体持有基础运动器组件
   *
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   */
  recoverBasicMotionDevice: (motionDeviceName: StrValue) => void

  /**
   * Resume a paused Global Timer on the Target Entity
   *
   * 恢复全局计时器: 使目标实体上一个处于暂停状态的计时器恢复运行
   *
   * @param timerName Identifier for the Timer. Only Timer Names configured in Timer Management can be referenced
   *
   * 计时器名称: 该计时器的标识，只能引用在计时器管理中已经配置好的计时器名称
   */
  recoverGlobalTimer: (timerName: StrValue) => void

  /**
   * Restore HP to the specified Target Entity via an Ability Unit
   *
   * 恢复生命: 通过能力单元为指定目标实体恢复生命
   *
   * @param recoveryAmount The amount of HP restored in this healing instance
   *
   * 恢复量: 该次恢复生命的恢复量
   * @param abilityUnit Referenced Ability Unit. Must be configured on the entity associated with this Node Graph
   *
   * 能力单元: 引用的能力单元。需要配置在此节点图所关联的实体上
   * @param overwriteAbilityUnitConfig When set to True, the Recovery Amount overwrites the parameter of the same name in the Ability Unit. When set to False, the Ability Unit's original configuration is used
   *
   * 是否覆写能力单元配置: 为“是”时，恢复量会覆盖能力单元中的同名配置。为“否”时，使用能力单元中的配置
   * @param recoverInitiatorEntity Determines the Initiator Entity of this healing action. Defaults to the Entity associated with this Node Graph. Affects healer identification in events such as When HP Is Recovered and When Initiating HP Recovery
   *
   * 恢复发起者实体: 决定了该次恢复行为的发起者实体，默认为该节点图所关联的实体。影响【被恢复生命值时】、【发起恢复生命值时】等事件中判定的恢复者
   */
  recoverHp: (
    recoveryAmount: FloatValue,
    abilityUnit: StrValue,
    overwriteAbilityUnitConfig: BoolValue,
    recoverInitiatorEntity: EntityValue
  ) => void

  /**
   * Directly restore HP to the specified Target Entity. Unlike [Recover HP], this node does not require an Ability Unit
   *
   * 直接恢复生命: 直接恢复指定实体目标的生命。与【恢复生命】不同的是，此节点不需要使用能力单元
   *
   * @param recoverTargetEntity The Target Entity to be healed
   *
   * 恢复目标实体: 恢复的目标实体
   * @param recoveryAmount The amount of HP restored in this healing instance
   *
   * 恢复量: 该次恢复生命的恢复量
   * @param ignoreRecoveryAmountAdjustment If set to True, this healing amount is not affected by the Target's Unit Status effects that adjust healing
   *
   * 是否忽略恢复量调整: 为“是”时，该次恢复量不受目标的恢复量调整类的单位状态的影响
   * @param aggroGenerationMultiplier The Aggro generated by this healing, expressed as a multiplier. Only applicable when using Custom Aggro Mode
   *
   * 产生仇恨的倍率: 此次恢复产生的仇恨倍率。仅使用自定义仇恨模式时有意义
   * @param aggroGenerationIncrement The Aggro generated by this healing, expressed as an incremental value. Only applicable when using Custom Aggro Mode
   *
   * 产生仇恨的增量: 此次恢复产生的仇恨增量。仅使用自定义仇恨模式时有意义
   * @param healingTagList The list of tags associated with this healing action. These can be accessed in the When HP Is Recovered and When Initiating HP Recovery events to identify a specific healing action
   *
   * 治疗标签列表: 此次恢复行为的标签列表。在【发起恢复生命值】时以及【被恢复生命值时】事件中可以取出，用于判定一次特定的恢复行为
   */
  recoverHpDirectly: (
    recoverTargetEntity: EntityValue,
    recoveryAmount: FloatValue,
    ignoreRecoveryAmountAdjustment: BoolValue,
    aggroGenerationMultiplier: FloatValue,
    aggroGenerationIncrement: FloatValue,
    healingTagList: StrValue[]
  ) => void

  /**
   * Remove the specified Entity. Unlike destroying an Entity, this has no destruction effect and does not trigger logic that runs only after destruction; Removing an Entity does not trigger the [On Entity Destroyed] event, but it can trigger the [On Entity Removed/Destroyed] event
   *
   * 移除实体: 移除指定实体，与销毁实体不同的是，不会有销毁表现，也不会触发销毁后才会触发的逻辑; 移除实体不会触发【实体销毁时】事件，但可以触发【实体移除/销毁时】事件
   *
   */
  removeEntity: () => void

  /**
   * Remove the UI Control Groups activated via [Activate UI Control Group in Control Group Library] from the Target Player's Interface Layout
   *
   * 移除控件组库内界面控件组: 可以在目标玩家的界面布局上移除已通过节点【激活控件组库内界面控件组】激活的界面控件组
   *
   * @param uiControlGroupIndex Identifier for the UI Control Group
   *
   * 界面控件组索引: 界面控件组的标识
   */
  removeInterfaceControlGroupFromControlGroupLibrary: (uiControlGroupIndex: IntValue) => void

  /**
   * Remove items from the custom shop's sales list
   *
   * 从自定义商店出售表中移除商品: 从自定义商店出售表中移除商品
   *
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemId
   *
   * 商品序号
   */
  removeItemFromCustomShopSalesList: (shopId: IntValue, shopItemId: IntValue) => void

  /**
   * Remove items from the inventory shop's sales list
   *
   * 从背包商店出售表中移除商品: 从背包商店出售表中移除商品
   *
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param itemConfigId
   *
   * 道具配置ID
   */
  removeItemFromInventoryShopSalesList: (shopId: IntValue, itemConfigId: ConfigIdValue) => void

  /**
   * Remove items from the purchase list
   *
   * 从物品收购表中移除物品: 从物品收购表中移除物品
   *
   * @param shopId The Shop ID corresponding to the Shop component on the Shop Owner Entity
   *
   * 商店序号: 商店归属者实体的商店组件对应的商店序号
   * @param shopItemConfigId
   *
   * 商品道具配置ID
   */
  removeItemFromPurchaseList: (shopId: IntValue, shopItemConfigId: ConfigIdValue) => void

  /**
   * Available only in Custom Aggro Mode; Remove the Target Entity from the Aggro Owner's Aggro List; this may cause the target to leave battle
   *
   * 将目标实体移除出仇恨列表: 仅自定义仇恨模式可用; 将目标实体从仇恨拥有者的仇恨列表中移除，可能会导致目标实体脱战
   *
   * @param aggroOwnerEntity
   *
   * 仇恨拥有者实体
   */
  removeTargetEntityFromAggroList: (aggroOwnerEntity: EntityValue) => void

  /**
   * Remove a specified Unit Status from the Target Entity. Either all stacks or a single stack can be removed
   *
   * 移除单位状态: 从目标实体上移除指定单位状态。可以选择全部移除，或移除其中一层
   *
   * @param unitStatusConfigId Identifier for this Unit Status
   *
   * 单位状态配置ID: 该单位状态的标识
   * @param removalMethod All Coexisting Statuses with the Same Name: Removes all statuses applied with this Config ID that share the same nameStatus With Fastest Stack Loss: Removes one stack from the status that loses stacks the fastest
   *
   * 移除方式: 所有同名并存状态：移除以该配置ID施加的所有同名状态最快丢失叠加层数的状态：移除最快丢失叠加层数的一层状态
   * @param removerEntity Determines the Remover Entity for this action. Defaults to the Entity associated with this Node Graph
   *
   * 移除者实体: 决定了该次行为的移除者实体，默认为该节点图所关联的实体
   */
  removeUnitStatus: (
    unitStatusConfigId: ConfigIdValue,
    removalMethod: RemovalMethod,
    removerEntity: EntityValue
  ) => void

  /**
   * Remove Unit Tags from the specified Entity
   *
   * 实体移除单位标签: 对指定实体移除单位标签
   *
   * @param unitTagIndex
   *
   * 单位标签索引
   */
  removeUnitTagFromEntity: (unitTagIndex: IntValue) => void

  /**
   * Replaces the specified equipment in the corresponding equipment slot of the target entity. If the equipment is
   * already equipped in the equipment slot, the replacement will not take effect. If the target slot already
   * contains an equipped item, that item will be replaced.
   *
   * 替换装备到指定栏位: 将指定装备替换到目标实体的指定装备栏位。若该装备已在该栏位，则不生效；若该栏位已有装备，则会被替换
   *
   * @param equipmentRow
   *
   * 装备栏位行
   * @param equipmentColumn
   *
   * 装备栏位列
   * @param equipmentIndex The equipment instance is identified by an integer index generated during equipment initialization
   *
   * 装备索引: 通过装备初始化时生成的整数索引标识装备实例
   */
  replaceEquipmentToTheSpecifiedSlot: (
    equipmentRow: IntValue,
    equipmentColumn: IntValue,
    equipmentIndex: IntValue
  ) => void

  /**
   * Resume a paused Timer on the Target Entity
   *
   * 恢复定时器: 使目标实体上一个处于暂停状态的定时器恢复运行
   *
   * @param timerName Timer Identifier
   *
   * 定时器名称: 该定时器的标识
   */
  resumeTimer: (timerName: StrValue) => void

  /**
   * Revive all Character Entities of the specified player. In Beyond Mode, since each player has only one character, this is equivalent to [Revive Character]
   *
   * 复苏玩家所有角色: 复苏指定玩家的所有角色实体。在超限模式中，由于每个玩家只有一个角色，与【复苏角色】的效果相同
   *
   * @param deductRevives If set to False, the Revive Count will not be deducted
   *
   * 是否扣除复苏次数: 为否时，不会扣除复苏次数
   */
  reviveAllPlayerSCharacters: (deductRevives: BoolValue) => void

  /**
   * Revive the active character of the specified player
   *
   * Available only in Classic Mode.
   *
   * 复苏当前场上角色: 复苏指定玩家当前场上角色
   *
   * 仅经典模式可用
   */
  reviveActiveCharacter: () => void

  /**
   * Revive the specified Character Entity
   *
   * 复苏角色: 复苏指定的角色实体
   *
   */
  reviveCharacter: () => void

  /**
   * Set the progress counter for the specified Achievement ID on the Target Entity
   *
   * 设置成就进度计数: 设置指定实体上对应成就序号的成就进度计数
   *
   * @param achievementId
   *
   * 成就序号
   * @param progressTally Sets the Progress Count to the input value
   *
   * 进度计数: 修改后的进度计数为输入的值
   */
  setAchievementProgressTally: (achievementId: IntValue, progressTally: IntValue) => void

  /**
   * Directly set the cooldown of a specific Skill Slot on the Target Character to a specified value
   *
   * 设置角色技能冷却: 直接设置目标角色某个技能槽位的冷却为指定值
   *
   * @param characterSkillSlot The Skill Slot to edited: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要修改的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   * @param remainingCdTime Edited Cooldown will be set to this input value
   *
   * 冷却剩余时间: 修改后的冷却时间为该输入值
   * @param limitMaximumCdTime If set to True, the edited Cooldown cannot be less than the specified minimum value
   *
   * 是否限制最大冷却时间: 为“是”可以限制修改后的冷却时间不小于所限制的值
   */
  setCharacterSkillCd: (
    characterSkillSlot: CharacterSkillSlot,
    remainingCdTime: FloatValue,
    limitMaximumCdTime: BoolValue
  ) => void

  /**
   * Available only in Classic Mode, sets the elemental energy for a specific character
   *
   * 设置角色元素能量: 仅经典模式可用，设置指定角色的元素能量
   *
   * @param elementalEnergy
   *
   * 元素能量
   */
  setCharacterSElementalEnergy: (elementalEnergy: FloatValue) => void

  /**
   * Available only in Classic Mode, increases the elemental energy for a specific character
   *
   * 增加角色元素能量: 仅经典模式可用，增加指定角色的元素能量
   *
   * @param increaseValue
   *
   * 增加值
   */
  increasesCharacterSElementalEnergy: (increaseValue: FloatValue) => void

  /**
   * Set the value of the specified Custom Variable on the Target Entity
   *
   * 设置自定义变量: 为目标实体上的指定自定义变量设置值
   *
   * @param variableName Custom variable name. Must be unique
   *
   * 变量名: 自定义变量的命名，不可重复
   * @param variableValue Value assigned to this variable
   *
   * 变量值: 赋予该变量的值
   * @param triggerEvent Default: False. When set to False, this custom variable editing will not trigger the On Custom Variable Change event
   *
   * 是否触发事件: 默认为否。选为否时，这次自定义变量修改不会触发自定义变量变化时事件
   */
  setCustomVariable: <
    T extends
      | 'bool'
      | 'config_id'
      | 'entity'
      | 'faction'
      | 'float'
      | 'guid'
      | 'int'
      | 'prefab_id'
      | 'str'
      | 'vec3'
      | 'bool_list'
      | 'config_id_list'
      | 'entity_list'
      | 'faction_list'
      | 'float_list'
      | 'guid_list'
      | 'int_list'
      | 'prefab_id_list'
      | 'str_list'
      | 'vec3_list'
      | 'dict'
  >(
    variableName: StrValue,
    variableValue: RuntimeParameterValueTypeMap[T],
    triggerEvent?: BoolValue
  ) => void

  /**
   * Set the active Nameplate list for the specified target. Nameplates included in the input list are enabled, while those not included are disabled
   *
   * 设置实体生效铭牌: 直接设置指定目标的生效铭牌列表，在入参列表中的铭牌配置会生效，不在列表中的会失效
   *
   * @param nameplateConfigIdList
   *
   * 铭牌配置ID列表
   */
  setEntityActiveNameplate: (nameplateConfigIdList: ConfigIdValue[]) => void

  /**
   * Set the type and quantity of Items or Currency for the Inventory drop
   *
   * 设置背包掉落道具/货币数量: 设置背包掉落道具/货币的类型和数量
   *
   * @param itemCurrencyConfigId
   *
   * 道具/货币配置ID
   * @param quantityDropped
   *
   * 掉落数量
   * @param lootType Types: Shared Reward (one share for all), Individualized Reward (one share per person)
   *
   * 掉落类型: 分为全员一份、每人一份
   */
  setInventoryDropItemsCurrencyAmount: (
    itemCurrencyConfigId: ConfigIdValue,
    quantityDropped: IntValue,
    lootType: ItemLootType
  ) => void

  /**
   * Configure the Inventory Item drop data in Dictionary format, and specify the Drop Type
   *
   * 设置背包道具掉落内容: 以字典形式设置背包道具掉落内容，并可以设置掉落类型
   *
   * @param itemDropDictionary
   *
   * 道具掉落字典
   * @param lootType Types: Shared Reward (one share for all), Individualized Reward (one share per person)
   *
   * 掉落类型: 分为全员一份、每人一份
   */
  setInventoryItemDropContents: (
    itemDropDictionary: dict<'config_id', 'int'>,
    lootType: ItemLootType
  ) => void

  /**
   * Configure the Loot drop data in the Loot Component on the Dropper Entity in Dictionary format
   *
   * 设置战利品掉落内容: 以字典形式设置掉落者实体上战利品组件中战利品的掉落内容
   *
   * @param lootDropDictionary
   *
   * 战利品掉落字典
   */
  setLootDropContent: (lootDropDictionary: dict<'config_id', 'int'>) => void

  /**
   * Set whether escaping is permitted for the specified Player
   *
   * 设置玩家逃跑合法性: 设置指定玩家逃跑的合法性
   *
   * @param valid
   *
   * 是否合法
   */
  setPlayerEscapeValidity: (valid: BoolValue) => void

  /**
   * Set the Player's rank score change based on the settlement status
   *
   * 设置玩家段位变化分数: 根据结算状态设置玩家的段位变化分数
   *
   * @param settlementStatus Includes: Undefined, Victory, Defeat, Escape
   *
   * 结算状态: 分为未定、胜利、失败、逃跑
   * @param scoreChange
   *
   * 变化分数
   */
  setPlayerRankScoreChange: (settlementStatus: SettlementStatus, scoreChange: IntValue) => void

  /**
   * Set the remaining number of revives for the specified Player. When set to 0, the Player cannot revive
   *
   * 设置玩家剩余复苏次数: 设置指定玩家剩余复苏次数。设置为0时，该玩家无法复苏
   *
   * @param remainingTimes When set to 0, the player will not be revived
   *
   * 剩余次数: 设置为0时，该玩家无法复苏
   */
  setPlayerRemainingRevives: (remainingTimes: IntValue) => void

  /**
   * Set the duration for the Player's next revive. If the Player is currently reviving, this does not affect the ongoing revive process
   *
   * 设置玩家复苏耗时: 设置指定玩家的下一次复苏的时长。如果玩家当前正处于复苏中，不会影响该次复苏的耗时
   *
   * @param duration Unit in seconds
   *
   * 时长: 单位为秒
   */
  setPlayerReviveTime: (duration: IntValue) => void

  /**
   * Set the Player's ranking value after Settlement, then determine the final ranking order according to [Ranking Value Comparison Order] in [Stage Settings] – [Settlement]
   *
   * 设置玩家结算排名数值: 设置玩家结算后的排名数值，再按照【关卡设置】-【结算】中的【排名数值比较顺序】的设置来决定最终的排名顺序
   *
   * @param rankingValue
   *
   * 排名数值
   */
  setPlayerSettlementRankingValue: (rankingValue: IntValue) => void

  setPlayerSettlementScoreboardDataDisplay: <T extends 'float' | 'int' | 'str'>(
    dataOrder: IntValue,
    dataName: StrValue,
    dataValue: RuntimeParameterValueTypeMap[T]
  ) => void

  /**
   * Set Player Settlement Success Status
   *
   * 设置玩家结算成功状态: 设置玩家结算成功状态
   *
   * @param settlementStatus Three types: Undefined, Victory, Defeat
   *
   * 结算状态: 分为未定、胜利、失败三种
   */
  setPlayerSettlementSuccessStatus: (settlementStatus: SettlementStatus) => void

  /**
   * Set the Preset Status of the specified Target Entity
   *
   * 设置预设状态: 设置指定目标实体的预设状态
   *
   * @param presetStatusIndex The unique identifier for the Preset Status
   *
   * 预设状态索引: 预设状态的唯一标识
   * @param presetStatusValue Generally "0" for off, "1" for on
   *
   * 预设状态值: 一般“0”为关闭，“1”为开启
   */
  setPresetStatus: (presetStatusIndex: IntValue, presetStatusValue: IntValue) => void

  /**
   * Set the Scan Tag with the specified ID in the Target Entity's Scan Tag Component to the active state
   *
   * 设置扫描组件的生效扫描标签序号: 将目标实体的扫描标签组件中对应序号的扫描标签设置为生效
   *
   * @param scanTagId
   *
   * 扫描标签序号
   */
  setScanComponentSActiveScanTagId: (scanTagId: IntValue) => void

  /**
   * Configure rules for Scan Tags. The scanning logic is executed based on the configured rules
   *
   * 设置扫描标签的规则: 设置扫描标签的规则，会以设置好的规则执行扫描标签的逻辑
   *
   * @param ruleType Options: Prioritize View or Prioritize Distance
   *
   * 规则类型: 分为视野优先、距离优先
   */
  setScanTagRules: (ruleType: ScanRuleType) => void

  /**
   * Edit the Character's skill resource amount
   *
   * 设置技能资源量: 修改角色的技能资源量
   *
   * @param skillResourceConfigId Skill Resource Identifier
   *
   * 技能资源配置ID: 技能资源的标识
   * @param targetValue Edited value will be set to this input value
   *
   * 目标值: 修改后的值为该输入值
   */
  setSkillResourceAmount: (skillResourceConfigId: ConfigIdValue, targetValue: FloatValue) => void

  /**
   * Available only in Custom Aggro Mode; Set the Aggro Value of the specified Target Entity on the specified Aggro Owner
   *
   * 设置指定实体的仇恨值: 仅自定义仇恨模式可用; 设置指定目标实体在指定仇恨拥有者上的仇恨值
   *
   * @param aggroOwnerEntity
   *
   * 仇恨拥有者实体
   * @param aggroValue
   *
   * 仇恨值
   */
  setTheAggroValueOfSpecifiedEntity: (aggroOwnerEntity: EntityValue, aggroValue: IntValue) => void

  /**
   * You can set the preset state value for a specified preset state index of a complex creation
   *
   * 设置复杂造物预设状态值: 设置复杂造物指定预设状态索引的值
   *
   * @param presetStatusIndex
   *
   * 预设状态索引
   * @param presetStatusValue
   *
   * 预设状态值
   */
  setThePresetStatusValueOfTheComplexCreation: (
    presetStatusIndex: IntValue,
    presetStatusValue: IntValue
  ) => void

  /**
   * Start a Global Timer on the Target Entity; The Timer on the Target Entity is uniquely identified by its name; Based on Timer Management settings, Countdown and Stopwatch Timers are created accordingly
   *
   * 启动全局计时器: 在目标实体上启动一个全局计时器; 目标实体上的计时器，通过计时器名称进行唯一标识; 计时器根据计时器管理中的配置，会对应创生倒计时、正计时的计时器
   *
   * @param timerName Identifier for the Timer. Only Timer Names configured in Timer Management can be referenced
   *
   * 计时器名称: 该计时器的标识，只能引用在计时器管理中已经配置好的计时器名称
   */
  startGlobalTimer: (timerName: StrValue) => void

  /**
   * Edit the background music state for the specified Player
   *
   * 启动/暂停玩家背景音乐: 修改对应玩家的背景音乐状态
   *
   * @param recover
   *
   * 是否恢复
   */
  startPausePlayerBackgroundMusic: (recover: BoolValue) => void

  /**
   * Edit the state of the Sound Effect Player with the specified ID in the Sound Effect Player Component on the Target Entity. This node is only active when the sound effect is set to loop playback. It does not take effect for sound effects configured for single-playback.
   *
   * 启动/暂停指定音效播放器: 可以修改指定目标实体上的音效播放器组件对应序号的音效播放器状态，仅当该音效被设置为循环播放时有效，单次播放的音效该节点不生效
   *
   * @param sfxPlayerId
   *
   * 音效播放器序号
   * @param recover
   *
   * 是否恢复
   */
  startPauseSpecifiedSoundEffectPlayer: (sfxPlayerId: IntValue, recover: BoolValue) => void

  /**
   * Start a Timer on the Target Entity; The Timer is uniquely identified by its name; A Timer consists of a looping or non-looping Timer Sequence. The Timer Sequence is a set of time points in seconds arranged in ascending order; when the Timer reaches these points, it triggers the [On Timer Triggered] event. The maximum length of a Timer Sequence is 100; For example, if you input the Timer Sequence [1, 3, 5, 7], the [On Timer Triggered] event fires at 1s, 3s, 5s, and 7s; When Loop is set to "Yes," the Timer restarts from 0s after reaching the last time point. For [1, 3, 5, 7], it restarts from 0s after reaching 7s
   *
   * 启动定时器: 在目标实体上启动一个定时器; 定时器通过定时器名称进行唯一标识; 定时器由一个循环或不循环的定时器序列组成。定时器序列应是一组从小到大排列的，以秒为单位的时间点，在定时器运行到这些时间点时，会触发【定时器触发时】事件。该定时器序列最大限制为100; 例如：[1,3,5,7]，如果传入这样的定时器序列，那么分别在第1、3、5、7秒，会触发【定时器触发时】事件; 当是否循环为“是”时，在定时器到达最后一个时间点后，会从0秒开始进行循环计时。以[1,3,5,7]这样的定时器为例，则在运行到7秒后，再从0秒开始计时
   *
   * @param timerName Timer Identifier
   *
   * 定时器名称: 该定时器的标识
   * @param loop If set to True, the Timer Sequence executes in a loop
   *
   * 是否循环: “是”则会循环执行定时器序列
   * @param timerSequence Provide a list sorted in ascending order. If the list is invalid (not strictly ascending, contains negatives, etc.), the Timer will not run
   *
   * 定时器序列: 需要传入一个从小到大排列的列表。如果传入的列表不合法（不是严格按照从小到大排列、存在负数等），定时器不会运行
   */
  startTimer: (timerName: StrValue, loop: BoolValue, timerSequence: FloatValue[]) => void

  /**
   * Stop and delete a running Motion Device
   *
   * 停止并删除基础运动器: 停止并删除一个运行中的运动器
   *
   * @param motionDeviceName Identifier for this motion device
   *
   * 运动器名称: 该运动器的标识
   * @param stopAllBasicMotionDevices If set to True, stops all Basic Motion Devices on this Entity. If set to False, stops only the Motion Device whose name matches the specified Motion Device
   *
   * 是否停止所有基础运动器: “是”则停止该实体上的所有基础运动器，“否”则只停止与运动器名称对应的运动器
   */
  stopAndDeleteBasicMotionDevice: (
    motionDeviceName: StrValue,
    stopAllBasicMotionDevices: BoolValue
  ) => void

  /**
   * Use the node graph to stop running a global timer early
   *
   * 终止全局计时器: 通过节点图，提前结束运行中的全局计时器
   *
   * @param timerName Identifier for the Timer. Only Timer Names configured in Timer Management can be referenced
   *
   * 计时器名称: 该计时器的标识，只能引用在计时器管理中已经配置好的计时器名称
   */
  stopGlobalTimer: (timerName: StrValue) => void

  /**
   * Completely terminate the specified Timer on the Target Entity; it cannot be resumed
   *
   * 终止定时器: 完全终止目标实体上的指定定时器，不可恢复
   *
   * @param timerName Timer Identifier
   *
   * 定时器名称: 该定时器的标识
   */
  stopTimer: (timerName: StrValue) => void

  /**
   * In the Target Entity's Text Bubble Component, replace the current active Text Bubble with the one corresponding to the Config ID
   *
   * 切换生效的文本气泡: 目标实体的文本气泡组件中，会以配置ID对应的文本气泡替换当前生效的文本气泡
   *
   * @param textBubbleConfigurationId
   *
   * 文本气泡配置ID
   */
  switchActiveTextBubble: (textBubbleConfigurationId: ConfigIdValue) => void

  /**
   * Immediately switch the patrol template for the Creation and move according to the new template
   *
   * 切换造物巡逻模板: 造物切换的巡逻模板即刻切换，并按照新的巡逻模板进行移动
   *
   * @param patrolTemplateId
   *
   * 巡逻模板序号
   */
  switchCreationPatrolTemplate: (patrolTemplateId: IntValue) => void

  /**
   * Switch the Target Player's current Interface Layout via Layout ID
   *
   * 切换当前界面布局: 可以通过布局索引来切换目标玩家当前的界面布局
   *
   * @param layoutIndex Identifier for the UI Layout
   *
   * 布局索引: 界面布局的标识
   */
  switchCurrentInterfaceLayout: (layoutIndex: IntValue) => void

  /**
   * Switch the Follow Target of the Follow Motion Device by Entity
   *
   * 以实体切换跟随运动器的目标: 以实体切换跟随运动器的跟随目标
   *
   * @param followTargetEntity The Entity that follows the Target
   *
   * 跟随目标实体: 跟随目标的实体
   * @param followTargetAttachmentPointName Name of the Attachment Point to follow
   *
   * 跟随目标挂接点名称: 跟随的挂接点名称
   * @param locationOffset Location Offset based on the Follow Coordinate System
   *
   * 位置偏移: 以【跟随坐标系】为基准产生的位置偏移
   * @param rotationOffset Rotation Offset based on the Follow Coordinate System
   *
   * 旋转偏移: 以【跟随坐标系】为基准产生的旋转偏移
   * @param followCoordinateSystem Options: Relative Coordinate System or World Coordinate System
   *
   * 跟随坐标系: 可选”相对坐标系“、”世界坐标系“
   * @param followType Options: Completely Follow, Follow Location, Follow Rotation
   *
   * 跟随类型: 可选”完全跟随“、”跟随位置“、”跟随旋转”
   */
  switchFollowMotionDeviceTargetByEntity: (
    followTargetEntity: EntityValue,
    followTargetAttachmentPointName: StrValue,
    locationOffset: Vec3Value,
    rotationOffset: Vec3Value,
    followCoordinateSystem: FollowCoordinateSystem,
    followType: FollowLocationType
  ) => void

  /**
   * Switch the Follow Target of the Follow Motion Device by GUID
   *
   * 以GUID切换跟随运动器的目标: 以GUID切换跟随运动器的跟随目标
   *
   * @param followTargetGuid Identifier for the Follow Target
   *
   * 跟随目标GUID: 跟随目标的标识
   * @param followTargetAttachmentPointName Name of the Attachment Point to follow
   *
   * 跟随目标挂接点名称: 跟随的挂接点名称
   * @param locationOffset Location Offset based on the Follow Coordinate System
   *
   * 位置偏移: 以【跟随坐标系】为基准产生的位置偏移
   * @param rotationOffset Rotation Offset based on the Follow Coordinate System
   *
   * 旋转偏移: 以【跟随坐标系】为基准产生的旋转偏移
   * @param followCoordinateSystem Options: Relative Coordinate System or World Coordinate System
   *
   * 跟随坐标系: 可选”相对坐标系“、”世界坐标系“
   * @param followType Options: Completely Follow, Follow Location, Follow Rotation
   *
   * 跟随类型: 可选”完全跟随“、”跟随位置“、”跟随旋转”
   */
  switchFollowMotionDeviceTargetByGuid: (
    followTargetGuid: GuidValue,
    followTargetAttachmentPointName: StrValue,
    locationOffset: Vec3Value,
    rotationOffset: Vec3Value,
    followCoordinateSystem: FollowCoordinateSystem,
    followType: FollowLocationType
  ) => void

  /**
   * Switch the active Scoring Group of the specified Player's Ranking by Scoring Group ID
   *
   * 切换玩家竞技段位生效的计分组: 以计分组的序号切换指定玩家竞技段位生效的计分组
   *
   * @param scoreGroupId The ID corresponding to the specified Score Group in Peripheral System management
   *
   * 计分组序号: 外围系统管理中指定计分组对应的序号
   */
  switchTheScoringGroupThatAffectsPlayerSCompetitiveRank: (scoreGroupId: IntValue) => void

  /**
   * Available only in Custom Aggro Mode; Make the Taunter Entity taunt the specified Target Entity
   *
   * 嘲讽目标: 仅自定义仇恨模式可用; 使嘲讽者实体嘲讽指定目标实体
   *
   * @param targetEntity
   *
   * 目标实体
   */
  tauntTarget: (targetEntity: EntityValue) => void

  /**
   * Teleport the specified Player Entity. A loading interface may appear depending on teleport distance
   *
   * 传送玩家: 传送指定玩家实体。会根据传送距离的远近决定是否有加载界面
   *
   * GSTS Note: There is an internal cd, and it cannot be used for frequent coordinate movement
   *
   * GSTS 注: 有内置cd, 不可用于高频设置坐标移动
   *
   * @param targetLocation Absolute Location
   *
   * 目标位置: 绝对位置
   * @param targetRotation Absolute Rotation
   *
   * 目标旋转: 绝对旋转
   */
  teleportPlayer: (targetLocation: Vec3Value, targetRotation: Vec3Value) => void

  /**
   * Adjust the Light Source state at the specified ID in the Light Source Component on the Target Entity
   *
   * 开关实体光源: 调整指定目标实体上的光源组件对应序号的光源状态
   *
   * @param lightSourceId
   *
   * 光源序号
   * @param enableOrDisable If set to True, turns On
   *
   * 打开或关闭: “是”为打开
   */
  toggleEntityLightSource: (lightSourceId: IntValue, enableOrDisable: BoolValue) => void

  /**
   * Triggers a loot drop for the dropper entity, with configurable loot type.
   *
   * 触发战利品掉落: 对掉落者实体触发一次战利品掉落，可设置其掉落类型
   *
   * @param lootType Types: Shared Reward (one share for all), Individualized Reward (one share per person)
   *
   * 掉落类型: 分为全员一份、每人一份
   */
  triggerLootDrop: (lootType: ItemLootType) => void
}

interface EntityHelperOverrides {
  /**
   * Play a Timed Effect relative to the Target Entity. A valid Target Entity and Attachment Point are required
   *
   * 播放限时特效: 以目标实体为基准，播放一个限时特效。需要有合法的目标实体以及挂接点
   *
   * @param specialEffectsAsset Identifier for this Effect
   *
   * 特效资产: 该特效的标识
   * @param attachmentPointName If the Attachment Point Name does not exist, the Special Effect will not play
   *
   * 挂接点名称: 挂接点名称不存在会导致特效无法播放
   * @param moveWithTheTarget If set to True, follows the Target Entity's Motion
   *
   * 是否跟随目标运动: “是”会跟随目标实体运动
   * @param rotateWithTheTarget If set to True, follows the Target Entity's Rotation
   *
   * 是否跟随目标旋转: “是”会跟随目标实体旋转
   * @param locationOffset Location Offset relative to the Target Entity's specified Attachment Point
   *
   * 位置偏移: 相对于目标实体指定挂接点的位置偏移
   * @param rotationOffset Rotation offset relative to the Target Entity's specified Attachment Point
   *
   * 旋转偏移: 相对于目标实体指定挂接点的旋转偏移
   * @param zoomMultiplier The Zoom Multiplier of this Effect
   *
   * 缩放倍率: 该特效的缩放倍率
   * @param playBuiltInSoundEffect If set to True, plays the built-in Sound Effect as well
   *
   * 是否播放自带的音效: “是”则会同时播放自带的音效
   */
  playTimedEffects: (
    specialEffectsAsset: ConfigIdValue,
    attachmentPointName: StrValue,
    moveWithTheTarget: BoolValue,
    rotateWithTheTarget: BoolValue,
    locationOffset: Vec3Value,
    rotationOffset: Vec3Value,
    zoomMultiplier: FloatValue,
    playBuiltInSoundEffect: BoolValue
  ) => void

  /**
   * Mount a Looping Effect relative to the Target Entity. A valid Target Entity and Attachment Point are required; This node returns an Effect Instance ID that can be stored. When using the [Clear Looping Effects] node later, use this Effect Instance ID to clear the specified Looping Effect
   *
   * 挂载循环特效: 以目标实体为基准，挂载一个循环特效。需要有合法的目标实体以及挂接点; 该节点会返回一个特效实例ID，可以将其存下。后续使用【清除循环特效】节点时，用这个特效实例ID来清除指定的循环特效
   *
   * @param specialEffectsAsset Identifier for this Effect
   *
   * 特效资产: 该特效的标识
   * @param attachmentPointName If the Attachment Point Name does not exist, the Special Effect will not play
   *
   * 挂接点名称: 挂接点名称不存在会导致特效无法播放
   * @param moveWithTheTarget If set to True, follows the Target Entity's Motion
   *
   * 是否跟随目标运动: “是”会跟随目标实体运动
   * @param rotateWithTheTarget If set to True, follows the Target Entity's Rotation
   *
   * 是否跟随目标旋转: “是”会跟随目标实体旋转
   * @param locationOffset Location Offset relative to the Target Entity's specified Attachment Point
   *
   * 位置偏移: 相对于目标实体指定挂接点的位置偏移
   * @param rotationOffset Rotation offset relative to the Target Entity's specified Attachment Point
   *
   * 旋转偏移: 相对于目标实体指定挂接点的旋转偏移
   * @param zoomMultiplier The Zoom Multiplier of this Effect
   *
   * 缩放倍率: 该特效的缩放倍率
   *
   * @param playBuiltInSoundEffect If set to True, plays the built-in Sound Effect as well
   *
   * 是否播放自带的音效: “是”则会同时播放自带的音效
   * @returns The Instance ID automatically generated when mounting this Effect
   *
   * 特效实例ID: 挂载该特效时自动生成的实例ID
   */
  mountLoopingSpecialEffect: (
    specialEffectsAsset: ConfigIdValue,
    attachmentPointName: StrValue,
    moveWithTheTarget: BoolValue,
    rotateWithTheTarget: BoolValue,
    locationOffset: Vec3Value,
    rotationOffset: Vec3Value,
    zoomMultiplier: FloatValue,
    playBuiltInSoundEffect: BoolValue
  ) => bigint

  /**
   * Clear the specified Looping Effect on the Target Entity by Effect Instance ID. After a successful mount, the [Mount Looping Effect] node generates an Effect Instance ID
   *
   * 清除循环特效: 根据特效实例ID清除目标实体上的指定循环特效。【挂载循环特效】节点在成功挂载后，会生成一个特效实例ID
   *
   * @param specialEffectInstanceId Instance ID automatically generated by the Mount Looping Special Effect node
   *
   * 特效实例ID: 【挂载循环特效】节点中自动生成的实例ID
   */
  clearLoopingSpecialEffect: (specialEffectInstanceId: IntValue) => void
}

type AliasReturn<K extends keyof EntityHelperAliasSources> = ReturnType<
  ServerExecutionFlowFunctions[EntityHelperAliasSources[K]]
>
type PlayerCharacter = ReturnType<
  ServerExecutionFlowFunctions['getAllCharacterEntitiesOfSpecifiedPlayer']
>[number]
interface EntityHelperAliases {
  /**
   * Returns the Location and Rotation of the Target Entity; Not applicable to Player Entities or Stage Entities
   *
   * 获取实体位置与旋转: 获取目标实体的位置和旋转; 对玩家实体和关卡实体无意义
   *
   * Property: entity position vector.
   *
   * 属性: 实体位置向量。
   */
  readonly pos: AliasReturn<'pos'>['location']

  /**
   * Returns the Location and Rotation of the Target Entity; Not applicable to Player Entities or Stage Entities
   *
   * 获取实体位置与旋转: 获取目标实体的位置和旋转; 对玩家实体和关卡实体无意义
   *
   * Property: entity rotation data.
   *
   * 属性: 实体旋转数据。
   */
  readonly rotation: AliasReturn<'rotation'>['rotate']

  /**
   * Returns the Forward Vector of the specified Entity (the positive Z-axis direction in the Entity's relative coordinate system)
   *
   * 获取实体向前向量: 获取指定实体的向前向量（即该实体本地坐标系下的z轴正方向朝向）
   *
   * @returns
   *
   * 向前向量
   *
   * Property: entity forward direction vector.
   *
   * 属性: 实体向前方向向量。
   */
  readonly forward: AliasReturn<'forward'>

  /**
   * Returns the Right Vector of the specified Entity (the positive X-axis direction in the Entity's relative coordinate system)
   *
   * 获取实体向右向量: 获取指定实体的向右向量（即该实体本地坐标系下的x轴正方向朝向）
   *
   * @returns
   *
   * 向右向量
   *
   * Property: entity right direction vector.
   *
   * 属性: 实体向右方向向量。
   */
  readonly right: AliasReturn<'right'>

  /**
   * Returns the Upward Vector of the specified Entity (the positive Y-axis direction in the Entity's relative coordinate system)
   *
   * 获取实体向上向量: 获取指定实体的向上向量（即该实体本地坐标系下的y轴正方向朝向）
   *
   * @returns
   *
   * 向上向量
   *
   * Property: entity up direction vector.
   *
   * 属性: 实体向上方向向量。
   */
  readonly up: AliasReturn<'up'>

  /**
   * Returns the Element Attributes of the Target Entity
   *
   * 获取实体元素属性: 获取目标实体的元素相关属性
   *
   * Property: elemental attributes of the entity.
   *
   * 属性: 实体元素相关属性。
   */
  readonly elementalAttr: AliasReturn<'elementalAttr'>

  /**
   * Returns the Entity Type of the Target Entity
   *
   * 获取实体类型: 获取目标实体的实体类型
   *
   * @returns Includes Player, Character, Stage, Object, Creation.
   *
   * 实体类型: 分为玩家、角色、关卡、物件、造物
   *
   * Property: entity type.
   *
   * 属性: 实体类型。
   */
  readonly type: AliasReturn<'type'>

  /**
   * Searches for the GUID of the specified Entity
   *
   * 以实体查询GUID: 查询指定实体的GUID
   *
   * @returns
   *
   * GUID
   *
   * Property: entity GUID.
   *
   * 属性: 实体 GUID。
   */
  readonly guid: AliasReturn<'guid'>

  /**
   * Returns the Player's nickname
   *
   * 获取玩家昵称: 获取玩家的昵称
   *
   * @returns
   *
   * 玩家昵称
   *
   * Property: player nickname.
   *
   * 属性: 玩家昵称。
   */
  readonly nickname: AliasReturn<'nickname'>

  /**
   * Returns the remaining number of revives for the specified Player Entity
   *
   * 获取玩家剩余复苏次数: 获取指定玩家实体的剩余复苏次数
   *
   * @returns
   *
   * 剩余次数
   *
   * Property: remaining revives for the player.
   *
   * 属性: 玩家剩余复活次数。
   */
  readonly remainingRevives: AliasReturn<'remainingRevives'>

  /**
   * Returns the revive duration of the specified Player Entity, in seconds
   *
   * 获取玩家复苏耗时: 获取指定玩家实体的复苏耗时，单位秒
   *
   * @returns
   *
   * 时长
   *
   * Property: player revive duration (seconds).
   *
   * 属性: 玩家复活时间（秒）。
   */
  readonly reviveTime: AliasReturn<'reviveTime'>

  /**
   * Returns the ID of the currently active Interface Layout on the specified Player Entity
   *
   * 获取玩家当前界面布局: 获取指定玩家实体上当前生效的界面布局的索引
   *
   * @returns
   *
   * 布局索引
   *
   * Property: current UI layout ID.
   *
   * 属性: 当前界面布局 ID。
   */
  readonly uiLayout: AliasReturn<'uiLayout'>

  /**
   * Get Player Settlement Success Status
   *
   * 获取玩家结算成功状态: 获取玩家结算成功状态
   *
   * @returns Includes: Undetermined, Victory, Defeat
   *
   * 结算状态: 分为未定、胜利、失败
   *
   * Property: player settlement status.
   *
   * 属性: 玩家结算状态。
   */
  readonly settlementStatus: AliasReturn<'settlementStatus'>

  /**
   * Returns the Settlement ranking value for the specified Player Entity
   *
   * 获取玩家结算排名数值: 获取指定玩家实体结算的排名数值
   *
   * @returns
   *
   * 排名数值
   *
   * Property: player settlement ranking value.
   *
   * 属性: 玩家结算排名值。
   */
  readonly settlementRanking: AliasReturn<'settlementRanking'>

  /**
   * Returns the Player's Rank-related information
   *
   * 获取玩家段位信息: 获取玩家段位相关信息
   *
   * Property: player ranking info.
   *
   * 属性: 玩家段位/排行信息。
   */
  readonly rankingInfo: AliasReturn<'rankingInfo'>

  /**
   * Returns the Advanced Attributes of the Entity
   *
   * 获取实体进阶属性: 获取实体的进阶属性
   *
   * Property: entity advanced attributes.
   *
   * 属性: 实体高级属性。
   */
  readonly advancedAttr: AliasReturn<'advancedAttr'>

  /**
   * Returns the Base Attributes of the Object
   *
   * 获取物件属性: 获取物件的相关基础属性
   *
   * Property: object-specific attributes.
   *
   * 属性: 物件实体属性。
   */
  readonly objectAttr: AliasReturn<'objectAttr'>

  /**
   * Returns the Base Attributes of the Character Entity
   *
   * 获取角色属性: 获取角色实体的基础属性
   *
   * Property: character-specific attributes.
   *
   * 属性: 角色实体属性。
   */
  readonly characterAttr: AliasReturn<'characterAttr'>

  /**
   * Returns the Attributes of the specified Creation
   *
   * 获取造物属性: 获取指定造物的属性
   *
   * Property: creation-specific attributes.
   *
   * 属性: 造物实体属性。
   */
  readonly creationAttr: AliasReturn<'creationAttr'>

  /**
   * Can only be searched when the Character has the [Monitor Movement Speed] Unit Status effect
   *
   * 查询角色当前移动速度: 仅当角色拥有【监听移动速率】的单位状态效果时，才能查询
   *
   * GSTS Note: The speed obtained is the actual movement speed, not the expected speed, and will be 0 when actually blocked, even when in motion
   *
   * GSTS 注: 获取到的速度是真实的运动速度, 而非期望速度, 被实际阻挡时速度将为0, 即使在运动
   *
   * Property: character movement info (speed and velocity).
   *
   * 属性: 角色移动信息（速度与速度向量）。
   */
  readonly movementInfo: AliasReturn<'movementInfo'>

  /**
   * Can only be searched when the Character has the [Monitor Movement Speed] Unit Status effect
   *
   * 查询角色当前移动速度: 仅当角色拥有【监听移动速率】的单位状态效果时，才能查询
   *
   * GSTS Note: The speed obtained is the actual movement speed, not the expected speed, and will be 0 when actually blocked, even when in motion
   *
   * GSTS 注: 获取到的速度是真实的运动速度, 而非期望速度, 被实际阻挡时速度将为0, 即使在运动
   *
   * Property: character current movement speed.
   *
   * 属性: 角色当前移动速度。
   */
  readonly speed: AliasReturn<'speed'>['currentSpeed']

  /**
   * Can only be searched when the Character has the [Monitor Movement Speed] Unit Status effect
   *
   * 查询角色当前移动速度: 仅当角色拥有【监听移动速率】的单位状态效果时，才能查询
   *
   * GSTS Note: The speed obtained is the actual movement speed, not the expected speed, and will be 0 when actually blocked, even when in motion
   *
   * GSTS 注: 获取到的速度是真实的运动速度, 而非期望速度, 被实际阻挡时速度将为0, 即使在运动
   *
   * Property: character current movement velocity vector.
   *
   * 属性: 角色当前移动速度向量。
   */
  readonly velocity: AliasReturn<'velocity'>['velocityVector']

  /**
   * Returns the Player Entity that owns the Character Entity
   *
   * 获取角色归属的玩家实体: 获取角色实体所归属的玩家实体
   *
   * @returns
   *
   * 所属玩家实体
   *
   * Property: player entity owning this character.
   *
   * 属性: 角色所属的玩家实体。
   */
  readonly player: AliasReturn<'player'>

  /**
   * The Target Entity varies with the Creation's current behavior; For example, when a Creation is attacking, its Target is the specified enemy Entity; For example, when a Creation is healing allies, its Target is the specified allied Entity
   *
   * 获取造物当前目标: 根据造物当前行为的不同，目标实体也不尽相同。; 例如当造物在攻击敌方时，造物的目标为敌方指定实体。; 例如当造物在对友方进行治疗时，造物的目标为友方指定实体。
   *
   * @returns Current intelligently selected Target Entity of the Creation
   *
   * 目标实体: 造物当前的智能选取目标实体
   *
   * Property: creation current target.
   *
   * 属性: 造物当前目标。
   */
  readonly currentTarget: AliasReturn<'currentTarget'>

  /**
   * Returns the Patrol Template information of the specified Creation Entity
   *
   * 获取当前造物的巡逻模板: 获取指定造物实体的巡逻模板信息
   *
   * Property: creation current patrol template.
   *
   * 属性: 造物当前巡逻模板。
   */
  readonly patrolTemplate: AliasReturn<'patrolTemplate'>

  /**
   * Returns the Aggro List in Classic Mode. This Node only outputs a valid list when the Aggro Configuration is set to [Default Type]
   *
   * 获取造物的经典模式仇恨列表: 获取造物的经典仇恨模式的仇恨列表，即仅仇恨配置为【默认类型】时，该节点才会有正确的输出列表
   *
   * @returns Unordered list of Entities this Creation currently has Aggro against
   *
   * 仇恨列表: 造物当前对哪些实体有仇恨，该列表是无序的
   *
   * Property: creation default aggro list.
   *
   * 属性: 造物默认仇恨列表。
   */
  readonly defaultAggroList: AliasReturn<'defaultAggroList'>

  /**
   * Returns a list of all Character Entities for the specified Player Entity
   *
   * 获取指定玩家所有角色实体: 获取指定玩家实体的所有角色实体列表
   *
   * @returns
   *
   * 角色实体列表
   *
   * Property: character entity list of the player.
   *
   * 属性: 玩家拥有的角色实体列表。
   */
  readonly characters: AliasReturn<'characters'>

  /**
   * Available only in Classic Mode, get the active character in the player's party
   *
   * 获取指定玩家的前台角色: 仅经典模式可用，获取玩家队伍内的前台角色
   *
   * Property: active character entity of the player.
   *
   * 属性: 玩家前台角色实体。
   */
  readonly activeCharacter: AliasReturn<'activeCharacter'>

  /**
   * Available only in Classic Mode. Returns the Character ID for the target character
   *
   * 查询经典模式角色编号: 仅经典模式可用，查询指定角色的角色编号
   *
   * @returns
   *
   * 角色编号
   *
   * Property: classic mode character ID.
   *
   * 属性: 经典模式角色编号。
   */
  readonly classicModeId: AliasReturn<'classicModeId'>

  /**
   * Returns the first Character Entity of the Player (index 0).
   *
   * 获取玩家的首个角色实体: 返回玩家角色列表中的第一个角色实体（索引0）
   */
  readonly character: PlayerCharacter

  /**
   * Searches the Player's current Class; outputs the Config ID of that Class
   *
   * 查询玩家职业: 查询玩家当前的职业，会输出该职业的配置ID
   *
   * @returns
   *
   * 职业配置ID
   *
   * Property: player current class config ID.
   *
   * 属性: 玩家当前职业配置 ID。
   */
  readonly class: AliasReturn<'class'>

  /**
   * Searches the Player's Level of the specified Class
   *
   * 查询玩家职业的等级: 查询玩家指定职业的等级
   *
   * @returns
   *
   * 等级
   *
   * Property: level of the player current class.
   *
   * 属性: 玩家当前职业等级。
   */
  readonly classLevel: AliasReturn<'classLevel'>

  /**
   * Returns the Player's local input device type, as determined by the Interface mapping method
   *
   * 获得玩家客户端输入设备类型: 获得玩家的客户端输入设备类型，根据用户界面的映射方式决定
   *
   * @returns Includes keyboard/mouse, gamepad, touchscreen
   *
   * 输入设备类型: 分为键盘鼠标、手柄、触屏
   *
   * Property: player input device type.
   *
   * 属性: 玩家输入设备类型。
   */
  readonly inputDevice: AliasReturn<'inputDevice'>
}

interface EntityHelperMethodAliases {
  /**
   * Destroy the specified Entity with a destruction effect. This can trigger logic that runs only after destruction, such as end-of-lifecycle behaviors for Local Projectiles; The [When Entity Is Destroyed] and [When Entity Is Removed/Destroyed] events can be monitored on Stage Entities
   *
   * 销毁实体: 销毁指定实体，会有销毁表现，也可以触发一些销毁后才会触发的逻辑，比如本地投射物中的生命周期结束时行为; 在关卡实体上可以监听到【实体销毁时】以及【实体移除/销毁时】事件
   *
   */
  destroy: () => void

  /**
   * Remove the specified Entity. Unlike destroying an Entity, this has no destruction effect and does not trigger logic that runs only after destruction; Removing an Entity does not trigger the [On Entity Destroyed] event, but it can trigger the [On Entity Removed/Destroyed] event
   *
   * 移除实体: 移除指定实体，与销毁实体不同的是，不会有销毁表现，也不会触发销毁后才会触发的逻辑; 移除实体不会触发【实体销毁时】事件，但可以触发【实体移除/销毁时】事件
   *
   */
  remove: () => void

  /**
   * Returns the value of the specified Custom Variable from the Target Entity; If the variable does not exist, returns the type's default value
   *
   * 获取自定义变量: 获取目标实体的指定自定义变量的值; 如果变量不存在，则返回类型的默认值
   *
   * @param variableName
   *
   * 变量名
   *
   * @returns
   *
   * 变量值
   */
  get: (variableName: StrValue) => generic

  /**
   * Set the value of the specified Custom Variable on the Target Entity
   *
   * 设置自定义变量: 为目标实体上的指定自定义变量设置值
   *
   * @param variableName Custom variable name. Must be unique
   *
   * 变量名: 自定义变量的命名，不可重复
   * @param variableValue Value assigned to this variable
   *
   * 变量值: 赋予该变量的值
   * @param triggerEvent Default: False. When set to False, this custom variable editing will not trigger the On Custom Variable Change event
   *
   * 是否触发事件: 默认为否。选为否时，这次自定义变量修改不会触发自定义变量变化时事件
   */
  set: <
    T extends
      | 'bool'
      | 'config_id'
      | 'entity'
      | 'faction'
      | 'float'
      | 'guid'
      | 'int'
      | 'prefab_id'
      | 'str'
      | 'vec3'
      | 'bool_list'
      | 'config_id_list'
      | 'entity_list'
      | 'faction_list'
      | 'float_list'
      | 'guid_list'
      | 'int_list'
      | 'prefab_id_list'
      | 'str_list'
      | 'vec3_list'
      | 'dict'
  >(
    variableName: StrValue,
    variableValue: RuntimeParameterValueTypeMap[T],
    triggerEvent?: BoolValue
  ) => void

  /**
   * Searches the Faction of the specified Entity
   *
   * 查询实体阵营: 查询指定实体的阵营
   *
   * @returns
   *
   * 阵营
   */
  faction: () => faction

  /**
   * Edit the Faction of the specified Target Entity
   *
   * 修改实体阵营: 修改指定目标实体的阵营
   *
   * @param faction Edited Faction
   *
   * 阵营: 修改后的阵营
   */
  setFaction: (faction: FactionValue) => void

  /**
   * Add Unit Tags to the specified Entity
   *
   * 实体添加单位标签: 对指定实体添加单位标签
   *
   * @param unitTagIndex
   *
   * 单位标签索引
   */
  addTag: (unitTagIndex: IntValue) => void

  /**
   * Remove Unit Tags from the specified Entity
   *
   * 实体移除单位标签: 对指定实体移除单位标签
   *
   * @param unitTagIndex
   *
   * 单位标签索引
   */
  removeTag: (unitTagIndex: IntValue) => void

  /**
   * Clear Unit Tags for the specified Entity
   *
   * 实体清空单位标签: 对指定实体清空单位标签
   *
   */
  clearTags: () => void

  /**
   * Returns the Owner Entity of the specified Target Entity
   *
   * 获取拥有者实体: 获取指定目标实体的拥有者实体
   *
   * @returns
   *
   * 拥有者实体
   */
  owner: () => entity

  /**
   * Returns a list of all Unit Tags carried by the Target Entity
   *
   * 获取实体单位标签列表: 获取目标实体上携带的所有单位标签组成的列表
   *
   * @returns
   *
   * 单位标签列表
   */
  unitTags: () => bigint[]

  /**
   * Returns a list of all Entities owned by the Target Entity
   *
   * 获取实体拥有的实体列表: 获取所有以目标实体为拥有者的实体组成的列表
   *
   * @returns
   *
   * 实体列表
   */
  ownedEntities: () => entity[]

  /**
   * Get Specific Entity's Aggro List
   *
   * 获取指定实体的仇恨列表: 获取指定实体的仇恨列表
   *
   * @returns
   *
   * 仇恨列表
   */
  aggroList: () => entity[]

  /**
   * Get Aggro Target of Specific Entity
   *
   * 获取指定实体的仇恨目标: 获取指定实体的仇恨目标
   *
   * @returns
   *
   * 仇恨目标
   */
  aggroTarget: () => entity

  /**
   * Available only in Custom Aggro Mode; Set the Aggro Value of the specified Target Entity on the specified Aggro Owner
   *
   * 设置指定实体的仇恨值: 仅自定义仇恨模式可用; 设置指定目标实体在指定仇恨拥有者上的仇恨值
   *
   * @param aggroOwnerEntity
   *
   * 仇恨拥有者实体
   * @param aggroValue
   *
   * 仇恨值
   */
  setAggroValue: (aggroOwnerEntity: EntityValue, aggroValue: IntValue) => void

  /**
   * Searches whether the specified Entity is present; Note that Character Entities are still considered present even when Downed
   *
   * 查询实体是否在场: 查询指定实体是否在场; 注意角色实体即使处于倒下状态，仍然认为在场
   *
   * @returns
   *
   * 是否在场
   */
  isOnField: () => boolean

  /**
   * Searches whether the specified Entity has entered battle
   *
   * 查询指定实体是否已入战: 查询指定实体是否已经入战
   *
   * @returns
   *
   * 是否入战
   */
  isInCombat: () => boolean

  /**
   * Returns the value of the specified Preset Status for the Target Entity. Returns 0 if the Entity does not have that Preset Status
   *
   * 获取预设状态: 获取目标实体的指定预设状态的预设状态值。如果该实体没有指定的预设状态，则返回0
   *
   * @param presetStatusIndex
   *
   * 预设状态索引
   *
   * @returns
   *
   * 预设状态值
   */
  getPreset: (presetStatusIndex: IntValue) => bigint

  /**
   * Set the Preset Status of the specified Target Entity
   *
   * 设置预设状态: 设置指定目标实体的预设状态
   *
   * @param presetStatusIndex The unique identifier for the Preset Status
   *
   * 预设状态索引: 预设状态的唯一标识
   * @param presetStatusValue Generally "0" for off, "1" for on
   *
   * 预设状态值: 一般“0”为关闭，“1”为开启
   */
  setPreset: (presetStatusIndex: IntValue, presetStatusValue: IntValue) => void

  /**
   * Returns the preset status value of the specified complex creation
   *
   * 获取复杂造物的预设状态值: 查询指定复杂造物的预设状态值
   *
   * @param presetStatusIndex
   *
   * 预设状态索引
   *
   * @returns
   *
   * 预设状态值
   */
  getCreationPresetValue: (presetStatusIndex: IntValue) => bigint

  /**
   * You can set the preset state value for a specified preset state index of a complex creation
   *
   * 设置复杂造物预设状态值: 设置复杂造物指定预设状态索引的值
   *
   * @param presetStatusIndex
   *
   * 预设状态索引
   * @param presetStatusValue
   *
   * 预设状态值
   */
  setCreationPresetValue: (presetStatusIndex: IntValue, presetStatusValue: IntValue) => void

  /**
   * Searches whether the specified Entity has a Unit Status with the given Config ID
   *
   * 查询实体是否具有单位状态: 查询指定实体是否具有特定配置ID的单位状态
   *
   * @param unitStatusConfigId
   *
   * 单位状态配置ID
   *
   * @returns
   *
   * 是否具有
   */
  hasUnitStatus: (unitStatusConfigId: ConfigIdValue) => boolean

  /**
   * Teleport the specified Player Entity. A loading interface may appear depending on teleport distance
   *
   * 传送玩家: 传送指定玩家实体。会根据传送距离的远近决定是否有加载界面
   *
   * GSTS Note: There is an internal cd, and it cannot be used for frequent coordinate movement
   *
   * GSTS 注: 有内置cd, 不可用于高频设置坐标移动
   *
   * @param targetLocation Absolute Location
   *
   * 目标位置: 绝对位置
   * @param targetRotation Absolute Rotation
   *
   * 目标旋转: 绝对旋转
   */
  teleport: (targetLocation: Vec3Value, targetRotation: Vec3Value) => void

  /**
   * Revive the specified Character Entity
   *
   * 复苏角色: 复苏指定的角色实体
   *
   */
  revive: () => void

  /**
   * Revive all Character Entities of the specified player. In Beyond Mode, since each player has only one character, this is equivalent to [Revive Character]
   *
   * 复苏玩家所有角色: 复苏指定玩家的所有角色实体。在超限模式中，由于每个玩家只有一个角色，与【复苏角色】的效果相同
   *
   * @param deductRevives If set to False, the Revive Count will not be deducted
   *
   * 是否扣除复苏次数: 为否时，不会扣除复苏次数
   */
  reviveAllCharacters: (deductRevives: BoolValue) => void

  /**
   * Knock down all characters of the specified player, causing the player to enter When All Player's Characters Are Down state.
   *
   * 击倒玩家所有角色: 击倒指定玩家的所有角色，会导致该玩家进入玩家所有角色倒下状态
   *
   */
  defeatAllCharacters: () => void

  /**
   * Consume the specified Player's Wonderland Gift Box
   *
   * 消耗礼盒: 可以消耗指定玩家的奇域礼盒
   *
   * @param giftBoxIndex
   *
   * 礼盒索引
   * @param consumptionQuantity
   *
   * 消耗数量
   */
  consumeGift: (giftBoxIndex: IntValue, consumptionQuantity: IntValue) => void

  /**
   * Returns the Rank change score for the Player Entity under different Settlement states
   *
   * 获取玩家段位变化分数: 获取玩家实体在不同结算状态下段位的变化分数
   *
   * @param settlementStatus
   *
   * 结算状态
   *
   * @returns
   *
   * 分数
   */
  rankScoreChange: (settlementStatus: SettlementStatus) => bigint

  /**
   * Set the Player's rank score change based on the settlement status
   *
   * 设置玩家段位变化分数: 根据结算状态设置玩家的段位变化分数
   *
   * @param settlementStatus Includes: Undefined, Victory, Defeat, Escape
   *
   * 结算状态: 分为未定、胜利、失败、逃跑
   * @param scoreChange
   *
   * 变化分数
   */
  setRankScoreChange: (settlementStatus: SettlementStatus, scoreChange: IntValue) => void

  /**
   * Get Player Escape Permission
   *
   * 获取玩家逃跑合法性: 获取玩家逃跑合法性
   *
   * @returns
   *
   * 是否合法
   */
  isEscapeValid: () => boolean

  /**
   * Set whether escaping is permitted for the specified Player
   *
   * 设置玩家逃跑合法性: 设置指定玩家逃跑的合法性
   *
   * @param valid
   *
   * 是否合法
   */
  setEscapeValid: (valid: BoolValue) => void

  /**
   * Activate the specified Revive Point ID for the player. When the player later triggers Revive logic, they can revive at this Revive Point
   *
   * 激活复苏点: 为该玩家激活指定序号的复苏点，此玩家后续触发复苏逻辑时，可以从该复苏点复苏
   *
   * @param revivePointId Identifier for this Revive Point
   *
   * 复苏点序号: 该复苏点的标识
   */
  enableRevivePoint: (revivePointId: IntValue) => void

  /**
   * Unregister the specified Revive Point ID for the player. The layer will not revive at this Revive Point next time
   *
   * 注销复苏点: 为该玩家注销指定序号的复苏点。该玩家下次复苏时不会从该复苏点复苏
   *
   * @param revivePointId Identifier for this Revive Point
   *
   * 复苏点序号: 该复苏点的标识
   */
  disableRevivePoint: (revivePointId: IntValue) => void

  /**
   * Activate the UI Control Groups stored as Custom Templates in the UI Control Group Library within the Target Player's Interface Layout
   *
   * 激活控件组库内界面控件组: 可以在目标玩家的界面布局上激活处于界面控件组库内的以自定义模板形式存在的界面控件组
   *
   * @param uiControlGroupIndex Identifier for the UI Control Group
   *
   * 界面控件组索引: 界面控件组的标识
   */
  enableUiControlGroup: (uiControlGroupIndex: IntValue) => void

  /**
   * Remove the UI Control Groups activated via [Activate UI Control Group in Control Group Library] from the Target Player's Interface Layout
   *
   * 移除控件组库内界面控件组: 可以在目标玩家的界面布局上移除已通过节点【激活控件组库内界面控件组】激活的界面控件组
   *
   * @param uiControlGroupIndex Identifier for the UI Control Group
   *
   * 界面控件组索引: 界面控件组的标识
   */
  removeUiControlGroup: (uiControlGroupIndex: IntValue) => void

  /**
   * Add a skill to the specified Target Character's Skill Slot
   *
   * 添加角色技能: 为指定目标角色的某个技能槽位添加技能
   *
   * @param skillConfigId Skill Identifier
   *
   * 技能配置ID: 技能的标识
   * @param skillSlot The Skill Slot to be added: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 技能槽位: 要添加的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   */
  addSkill: (skillConfigId: ConfigIdValue, skillSlot: CharacterSkillSlot) => void

  /**
   * Iterate through and delete all skills with the specified Config ID across all of the Character's slots
   *
   * 以ID删除角色技能: 遍历角色的所有槽位，删除所有指定配置ID的技能
   *
   * @param skillConfigId Skill Identifier
   *
   * 技能配置ID: 技能的标识
   */
  removeSkillById: (skillConfigId: ConfigIdValue) => void

  /**
   * Delete the skill in the specified slot of the Target Character
   *
   * 以槽位删除角色技能: 删除目标角色指定槽位的技能
   *
   * @param characterSkillSlot The Skill Slot to be deleted: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要删除的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   */
  removeSkillBySlot: (characterSkillSlot: CharacterSkillSlot) => void

  /**
   * Reset the Target Character's skills to those defined in the Class Template
   *
   * 初始化角色技能: 使目标角色的技能重置为职业模板上配置的技能
   *
   * @param characterSkillSlot The Skill Slot to initialize: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要初始化的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   */
  resetSkill: (characterSkillSlot: CharacterSkillSlot) => void

  /**
   * Open the pre-made Deck Selector for the Target Player
   *
   * 唤起卡牌选择器: 对目标玩家打开提前制作好的卡牌选择器
   *
   * @param deckSelectorId Referenced UI Control Group ID
   *
   * 卡牌选择器索引: 引用的界面控件组索引
   * @param selectDuration If empty, uses the Deck Selector's default configuration; otherwise, this time value is used as the effective durationUnit in seconds
   *
   * 选择时长: 若为空，则读取卡牌选择器默认配置；若不为空，以此处时间参数为实际生效时长单位为秒
   * @param selectResultCorrespondingList One-to-one with display items: the Deck Selector returns the result value corresponding to each display itemRecommended configuration: 1 to X
   *
   * 选择结果对应列表: 和显示项一一对应，卡牌选择器返回的实际结果是显示项对应的结果值推荐配置1至X
   * @param selectDisplayCorrespondingList Deck Library Configuration Reference
   *
   * 选择显示对应列表: 卡牌库中的配置引用
   * @param selectMinimumQuantity The minimum number of cards that must be selected for a valid interaction
   *
   * 选择数量下限: 选择卡牌数量下限，满足数量才可进行合法的选择交互
   * @param selectMaximumQuantity The maximum number of cards that can be selected for a valid interaction
   *
   * 选择数量上限: 选择卡牌数量上限，满足数量才可进行合法的选择交互
   * @param refreshMode No Refresh
   *
   * 刷新方式: 不可刷新
   * @param refreshMinimumQuantity The minimum number of cards that must be selected for a valid refresh interaction.
   *
   * 刷新数量下限: 选择卡牌数量下限，满足数量才可进行合法的刷新交互
   * @param refreshMaximumQuantity The maximum number of cards that can be selected for a valid refresh interaction
   *
   * 刷新数量上限: 选择卡牌数量上限，满足数量才可进行合法的刷新交互
   * @param defaultReturnSelection If the Deck Selector times out, has no interaction, or closes abnormally, force-assign this configured resultThe length of this Result List must match the valid card selection count
   *
   * 默认返回选择: 如果卡牌选择器超时/未交互/卡牌选择器异常关闭等情况，支持强制赋予配置的该结果该结果的列表长度，需要和合法选择卡牌数量一致
   */
  openDeck: (
    deckSelectorId: IntValue,
    selectDuration: FloatValue,
    selectResultCorrespondingList: IntValue[],
    selectDisplayCorrespondingList: IntValue[],
    selectMinimumQuantity: IntValue,
    selectMaximumQuantity: IntValue,
    refreshMode: DecisionRefreshMode,
    refreshMinimumQuantity: IntValue,
    refreshMaximumQuantity: IntValue,
    defaultReturnSelection: IntValue[]
  ) => void

  /**
   * Close the currently active Deck Selector for the specified Player
   *
   * 关闭卡牌选择器: 关闭指定玩家当前生效的卡牌选择器
   *
   * @param deckSelectorIndex
   *
   * 卡牌选择器索引
   */
  closeDeck: (deckSelectorIndex: IntValue) => void

  /**
   * Increase the Player's current Class EXP. Any excess beyond the maximum Level will not take effect
   *
   * 提升玩家当前职业经验: 提升玩家当前职业经验，超出最大等级的部分会无效
   *
   * @param exp Amount of EXP to be increased
   *
   * 经验值: 所要提升的经验值
   */
  addClassExp: (exp: IntValue) => void

  /**
   * Set the Player's current Class to the Class referenced by the Config ID
   *
   * 更改玩家职业: 修改玩家的当前职业为配置ID对应的职业
   *
   * @param classConfigId Class Identifier
   *
   * 职业配置ID: 该职业的标识
   */
  setClass: (classConfigId: ConfigIdValue) => void

  /**
   * Set the Player's current Class Level. If it exceeds the defined range, the change will not take effect
   *
   * 更改玩家当前职业等级: 修改玩家当前职业等级，若超出定义的等级范围则会失效
   *
   * @param level Edited Level
   *
   * 等级: 修改后的等级
   */
  setClassLevel: (level: IntValue) => void

  /**
   * Adjust Player Background Music Volume
   *
   * 调整玩家背景音乐音量: 调整玩家背景音乐音量
   *
   * @param volume
   *
   * 音量
   */
  setBgmVolume: (volume: IntValue) => void

  /**
   * Set whether the specified player is allowed to revive
   *
   * 允许/禁止玩家复苏: 设置指定玩家是否允许复苏
   *
   * @param allow If set to True, reviving is allowed
   *
   * 是否允许: “是”则允许复苏
   */
  setReviveAllowed: (allow: BoolValue) => void

  /**
   * Edit the map scale of the Target Player's mini-map UI control
   *
   * 修改小地图缩放: 修改目标玩家的小地图界面控件的地图比例
   *
   * @param zoomDimensions
   *
   * 缩放尺寸
   */
  setMiniMapZoom: (zoomDimensions: FloatValue) => void

  /**
   * Edit background music parameters for the Player
   *
   * 修改玩家背景音乐: 修改玩家背景音乐相关参数
   *
   * @param backgroundMusicIndex
   *
   * 背景音乐索引
   * @param startTime
   *
   * 开始时间
   * @param endTime
   *
   * 结束时间
   * @param volume
   *
   * 音量
   * @param loopPlayback
   *
   * 是否循环播放
   * @param loopInterval
   *
   * 循环播放间隔
   * @param playbackSpeed
   *
   * 播放速度
   * @param enableFadeInOut
   *
   * 是否允许渐入渐出
   */
  setBgm: (
    backgroundMusicIndex: IntValue,
    startTime: FloatValue,
    endTime: FloatValue,
    volume: IntValue,
    loopPlayback: BoolValue,
    loopInterval: FloatValue,
    playbackSpeed: FloatValue,
    enableFadeInOut: BoolValue
  ) => void

  /**
   * Edit the background music state for the specified Player
   *
   * 启动/暂停玩家背景音乐: 修改对应玩家的背景音乐状态
   *
   * @param recover
   *
   * 是否恢复
   */
  pauseBgm: (recover: BoolValue) => void

  /**
   * Edit the state of the UI Control in the Target Player's Interface Layout by its UI Control ID
   *
   * 修改界面布局内界面控件状态: 通过界面控件索引来修改目标玩家界面布局内对应界面控件的状态
   *
   * @param uiControlIndex Identifier for the UI Control
   *
   * 界面控件索引: 界面控件的标识
   * @param displayStatus Off: Invisible and logic not runningOn: Visible and logic running normallyHidden: Invisible and logic running normally
   *
   * 显示状态: 关闭：不可见且逻辑不运行开启：可见+逻辑正常运行隐藏：不可见+逻辑正常运行
   */
  setUiControlStatus: (uiControlIndex: IntValue, displayStatus: UIControlGroupStatus) => void

  /**
   * Edit the cooldown of the specified Skill Slot on the Target Character. The edit value is added to the current cooldown and can be negative
   *
   * 修改角色技能冷却: 修改目标角色某个技能槽位的冷却，会在当前冷却时间上加修改值，修改值可以为负数
   *
   * @param characterSkillSlot The Skill Slot to edited: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要修改的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   * @param cdModifier New Value = Original Value + Edit Value
   *
   * 冷却时间修改值: 修改后的值为：原值+修改值
   * @param limitMaximumCdTime If set to True, the edited Cooldown cannot be less than the specified minimum value
   *
   * 是否限制最大冷却时间: 为“是”可以限制修改后的冷却时间不小于所限制的值
   */
  addSkillCd: (
    characterSkillSlot: CharacterSkillSlot,
    cdModifier: FloatValue,
    limitMaximumCdTime: BoolValue
  ) => void

  /**
   * Directly set the cooldown of a specific Skill Slot on the Target Character to a specified value
   *
   * 设置角色技能冷却: 直接设置目标角色某个技能槽位的冷却为指定值
   *
   * @param characterSkillSlot The Skill Slot to edited: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要修改的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   * @param remainingCdTime Edited Cooldown will be set to this input value
   *
   * 冷却剩余时间: 修改后的冷却时间为该输入值
   * @param limitMaximumCdTime If set to True, the edited Cooldown cannot be less than the specified minimum value
   *
   * 是否限制最大冷却时间: 为“是”可以限制修改后的冷却时间不小于所限制的值
   */
  setSkillCd: (
    characterSkillSlot: CharacterSkillSlot,
    remainingCdTime: FloatValue,
    limitMaximumCdTime: BoolValue
  ) => void

  /**
   * Edit the cooldown percentage of a skill in a Character's Skill Slot based on its maximum cooldown
   *
   * 按最大冷却时间修改技能冷却百分比: 通过技能最大冷却时间的百分比来修改角色某个技能槽位内的技能
   *
   * @param characterSkillSlot The Skill Slot to edited: Normal Attack, Skill 1-E, Skill 2-Q, Skill 3-R, Skill 4-T, or Custom Skill
   *
   * 角色技能槽位: 要修改的技能所在的槽位，分为普通攻击、技能1-E、技能2-Q、技能3-R、技能4-T和自定义技能
   * @param cooldownRatioModifier Actual Cooldown after Editing = Original Cooldown × Cooldown Ratio Edit Value
   *
   * 冷却比例修改值: 修改后的实际冷却时间为：原冷却时间*冷却比例修改值
   * @param limitMaximumCdTime If set to True, the edited Cooldown cannot be less than the specified minimum value
   *
   * 是否限制最大冷却时间: 为“是”可以限制修改后的冷却时间不小于所限制的值
   */
  scaleSkillCd: (
    characterSkillSlot: CharacterSkillSlot,
    cooldownRatioModifier: FloatValue,
    limitMaximumCdTime: BoolValue
  ) => void

  /**
   * Edit the skill's resource amount by adding the change value to the current value. The change value can be negative
   *
   * 修改技能资源量: 修改技能的资源量，会在当前值上加上变更值，变更值可以为负数
   *
   * @param skillResourceConfigId Skill Resource Identifier
   *
   * 技能资源配置ID: 技能资源的标识
   * @param changeValue New Value = Original Value + Change Value
   *
   * 变更值: 修改后的值为：原值+变更值
   */
  addSkillResource: (skillResourceConfigId: ConfigIdValue, changeValue: FloatValue) => void

  /**
   * Edit the Character's skill resource amount
   *
   * 设置技能资源量: 修改角色的技能资源量
   *
   * @param skillResourceConfigId Skill Resource Identifier
   *
   * 技能资源配置ID: 技能资源的标识
   * @param targetValue Edited value will be set to this input value
   *
   * 目标值: 修改后的值为该输入值
   */
  setSkillResource: (skillResourceConfigId: ConfigIdValue, targetValue: FloatValue) => void

  /**
   * Available only in Classic Mode, increases the elemental energy for a specific character
   *
   * 增加角色元素能量: 仅经典模式可用，增加指定角色的元素能量
   *
   * @param increaseValue
   *
   * 增加值
   */
  addElementalEnergy: (increaseValue: FloatValue) => void

  /**
   * Available only in Classic Mode, sets the elemental energy for a specific character
   *
   * 设置角色元素能量: 仅经典模式可用，设置指定角色的元素能量
   *
   * @param elementalEnergy
   *
   * 元素能量
   */
  setElementalEnergy: (elementalEnergy: FloatValue) => void

  /**
   * Player plays a one-shot 2D Sound Effect
   *
   * 玩家播放单次2D音效: 玩家播放单次2D音效
   *
   * @param soundEffectAssetIndex
   *
   * 音效资产索引
   * @param volume
   *
   * 音量
   * @param playbackSpeed
   *
   * 播放速度
   */
  playSfx2d: (soundEffectAssetIndex: IntValue, volume: IntValue, playbackSpeed: FloatValue) => void

  /**
   * Searches the Skill in the specified slot of a Character; outputs that Skill's Config ID
   *
   * 查询角色技能: 查询角色指定槽位的技能，会输出该技能的配置ID
   *
   * @param characterSkillSlot
   *
   * 角色技能槽位
   *
   * @returns
   *
   * 技能配置ID
   */
  getSkill: (characterSkillSlot: CharacterSkillSlot) => configId

  /**
   * Searches the consumed quantity of the specified Gift Box on the Player Entity
   *
   * 查询对应礼盒消耗数量: 查询玩家实体上指定礼盒的消耗数量
   *
   * @param giftBoxIndex
   *
   * 礼盒索引
   *
   * @returns
   *
   * 数量
   */
  getGiftBoxConsumption: (giftBoxIndex: IntValue) => bigint

  /**
   * Searches the quantity of the specified Gift Box on the Player Entity
   *
   * 查询对应礼盒数量: 查询玩家实体上指定礼盒的数量
   *
   * @param giftBoxIndex
   *
   * 礼盒索引
   *
   * @returns
   *
   * 数量
   */
  getGiftBoxQuantity: (giftBoxIndex: IntValue) => bigint

  /**
   * Check if all of the player's characters are downed
   *
   * 查询玩家角色是否全部倒下: 查询玩家的所有角色是否已全部倒下
   *
   * @returns
   *
   * 结果
   */
  areAllCharactersDown: () => boolean

  /**
   * Set the remaining number of revives for the specified Player. When set to 0, the Player cannot revive
   *
   * 设置玩家剩余复苏次数: 设置指定玩家剩余复苏次数。设置为0时，该玩家无法复苏
   *
   * @param remainingTimes When set to 0, the player will not be revived
   *
   * 剩余次数: 设置为0时，该玩家无法复苏
   */
  setRemainingRevives: (remainingTimes: IntValue) => void

  /**
   * Set the duration for the Player's next revive. If the Player is currently reviving, this does not affect the ongoing revive process
   *
   * 设置玩家复苏耗时: 设置指定玩家的下一次复苏的时长。如果玩家当前正处于复苏中，不会影响该次复苏的耗时
   *
   * @param duration Unit in seconds
   *
   * 时长: 单位为秒
   */
  setReviveTime: (duration: IntValue) => void

  /**
   * Set the Player's ranking value after Settlement, then determine the final ranking order according to [Ranking Value Comparison Order] in [Stage Settings] – [Settlement]
   *
   * 设置玩家结算排名数值: 设置玩家结算后的排名数值，再按照【关卡设置】-【结算】中的【排名数值比较顺序】的设置来决定最终的排名顺序
   *
   * @param rankingValue
   *
   * 排名数值
   */
  setSettlementRanking: (rankingValue: IntValue) => void

  setSettlementScoreboard: <T extends 'float' | 'int' | 'str'>(
    dataOrder: IntValue,
    dataName: StrValue,
    dataValue: RuntimeParameterValueTypeMap[T]
  ) => void

  /**
   * Set Player Settlement Success Status
   *
   * 设置玩家结算成功状态: 设置玩家结算成功状态
   *
   * @param settlementStatus Three types: Undefined, Victory, Defeat
   *
   * 结算状态: 分为未定、胜利、失败三种
   */
  setSettlementStatus: (settlementStatus: SettlementStatus) => void

  /**
   * Immediately switch the patrol template for the Creation and move according to the new template
   *
   * 切换造物巡逻模板: 造物切换的巡逻模板即刻切换，并按照新的巡逻模板进行移动
   *
   * @param patrolTemplateId
   *
   * 巡逻模板序号
   */
  switchPatrolTemplate: (patrolTemplateId: IntValue) => void

  /**
   * Switch the Target Player's current Interface Layout via Layout ID
   *
   * 切换当前界面布局: 可以通过布局索引来切换目标玩家当前的界面布局
   *
   * @param layoutIndex Identifier for the UI Layout
   *
   * 布局索引: 界面布局的标识
   */
  switchUiLayout: (layoutIndex: IntValue) => void

  /**
   * Switch the active Scoring Group of the specified Player's Ranking by Scoring Group ID
   *
   * 切换玩家竞技段位生效的计分组: 以计分组的序号切换指定玩家竞技段位生效的计分组
   *
   * @param scoreGroupId The ID corresponding to the specified Score Group in Peripheral System management
   *
   * 计分组序号: 外围系统管理中指定计分组对应的序号
   */
  switchRankGroup: (scoreGroupId: IntValue) => void
}

export type EntityHelperAll = EntityHelperFromFirstParam &
  EntityHelperOverrides &
  EntityHelperMethodAliases &
  EntityHelperAliases

type EntityHelperScoped = EntityHelperOverrides & EntityHelperMethodAliases & EntityHelperAliases

type EntityHelperKindByKey = {
  [K in keyof typeof ENTITY_HELPER_KIND_BY_KEY]: (typeof ENTITY_HELPER_KIND_BY_KEY)[K][number]
}

type EntityHelperScopedKindByKey = Pick<EntityHelperKindByKey, keyof EntityHelperScoped>

export type EntityHelperKeysByKind = {
  [K in EntityKind]: {
    [H in keyof EntityHelperScopedKindByKey]: K extends EntityHelperScopedKindByKey[H] ? H : never
  }[keyof EntityHelperScopedKindByKey]
}

type EntityHelperCommonKeys = {
  [K in keyof EntityHelperScopedKindByKey]: Exclude<
    EntityKind,
    EntityHelperScopedKindByKey[K]
  > extends never
    ? K
    : never
}[keyof EntityHelperScopedKindByKey]

type EntityHelperSpecificKeysByKind<K extends EntityKind> = Exclude<
  EntityHelperKeysByKind[K],
  EntityHelperCommonKeys
>

export type EntityHelperFor<K extends EntityKind> = Pick<
  EntityHelperScoped,
  EntityHelperSpecificKeysByKind<K>
> &
  Pick<EntityHelperScoped, EntityHelperCommonKeys>

export type EntityBase = Omit<entity, keyof EntityHelperAll>

export type PlayerEntity = EntityBase & EntityKindMarker<'player'> & EntityHelperFor<'player'>
export type CharacterEntity = EntityBase &
  EntityKindMarker<'character'> &
  EntityHelperFor<'character'>
export type StageEntity = EntityBase & EntityKindMarker<'stage'> & EntityHelperFor<'stage'>
export type ObjectEntity = EntityBase & EntityKindMarker<'object'> & EntityHelperFor<'object'>
export type CreationEntity = EntityBase & EntityKindMarker<'creation'> & EntityHelperFor<'creation'>

declare module '../runtime/value.js' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface entity extends EntityHelperAll {}
}

const kEntityHelpersInstalled = Symbol('gsts.entity_helpers_installed')

function defineEntityHelperMethod(name: string, insertIndex = 0) {
  const proto = entity.prototype as unknown as Record<PropertyKey, unknown>
  if (Object.prototype.hasOwnProperty.call(proto, name)) return
  Object.defineProperty(proto, name, {
    configurable: true,
    enumerable: false,
    value: function (...args: unknown[]) {
      const fn = (gsts.f as unknown as Record<string, (...args: unknown[]) => unknown>)[name]
      if (typeof fn !== 'function') {
        throw new Error(`[error] entity helper not found: ${name}`)
      }
      const callArgs = args.slice()
      callArgs.splice(insertIndex, 0, this)
      return fn.call(gsts.f, ...callArgs)
    }
  })
}

function defineEntityHelperMethodAlias(name: string, sourceName: string) {
  const proto = entity.prototype as unknown as Record<PropertyKey, unknown>
  if (Object.prototype.hasOwnProperty.call(proto, name)) return
  Object.defineProperty(proto, name, {
    configurable: true,
    enumerable: false,
    value: function (...args: unknown[]) {
      const fn = (gsts.f as unknown as Record<string, (...args: unknown[]) => unknown>)[sourceName]
      if (typeof fn !== 'function') {
        throw new Error(`[error] entity helper not found: ${sourceName}`)
      }
      return fn.call(gsts.f, this, ...args)
    }
  })
}

function defineEntityHelperGetter(name: string, getter: (self: entity) => unknown) {
  const proto = entity.prototype as unknown as Record<PropertyKey, unknown>
  if (Object.prototype.hasOwnProperty.call(proto, name)) return
  Object.defineProperty(proto, name, {
    configurable: true,
    enumerable: false,
    get: function () {
      return getter(this as entity)
    }
  })
}

export function installEntityHelpers(): void {
  const proto = entity.prototype as unknown as Record<PropertyKey, unknown>
  if (proto[kEntityHelpersInstalled]) return
  Object.defineProperty(proto, kEntityHelpersInstalled, {
    configurable: false,
    enumerable: false,
    value: true
  })

  for (const name of ENTITY_HELPER_METHODS) {
    defineEntityHelperMethod(name, 0)
  }

  for (const [name, index] of Object.entries(ENTITY_HELPER_OVERRIDE_INDEX)) {
    defineEntityHelperMethod(name, index)
  }

  for (const [name, source] of Object.entries(ENTITY_HELPER_METHOD_ALIAS_SOURCES)) {
    defineEntityHelperMethodAlias(name, source)
  }

  defineEntityHelperGetter('pos', (self) => {
    return gsts.f.getEntityLocationAndRotation(self).location
  })
  defineEntityHelperGetter('rotation', (self) => {
    return gsts.f.getEntityLocationAndRotation(self).rotate
  })
  defineEntityHelperGetter('forward', (self) => gsts.f.getEntityForwardVector(self))
  defineEntityHelperGetter('right', (self) => gsts.f.getEntityRightVector(self))
  defineEntityHelperGetter('up', (self) => gsts.f.getEntityUpwardVector(self))
  defineEntityHelperGetter('elementalAttr', (self) => gsts.f.getEntityElementalAttribute(self))
  defineEntityHelperGetter('type', (self) => gsts.f.getEntityType(self))
  defineEntityHelperGetter('guid', (self) => gsts.f.queryGuidByEntity(self))
  defineEntityHelperGetter('nickname', (self) => gsts.f.getPlayerNickname(self))
  defineEntityHelperGetter('remainingRevives', (self) => gsts.f.getPlayerRemainingRevives(self))
  defineEntityHelperGetter('reviveTime', (self) => gsts.f.getPlayerReviveTime(self))
  defineEntityHelperGetter('uiLayout', (self) => gsts.f.getPlayerSCurrentUiLayout(self))
  defineEntityHelperGetter('settlementStatus', (self) =>
    gsts.f.getPlayerSettlementSuccessStatus(self)
  )
  defineEntityHelperGetter('settlementRanking', (self) =>
    gsts.f.getPlayerSettlementRankingValue(self)
  )
  defineEntityHelperGetter('rankingInfo', (self) => gsts.f.getPlayerRankingInfo(self))
  defineEntityHelperGetter('advancedAttr', (self) => gsts.f.getEntityAdvancedAttribute(self))
  defineEntityHelperGetter('objectAttr', (self) => gsts.f.getObjectAttribute(self))
  defineEntityHelperGetter('characterAttr', (self) => gsts.f.getCharacterAttribute(self))
  defineEntityHelperGetter('creationAttr', (self) => gsts.f.getCreationAttribute(self))
  defineEntityHelperGetter('movementInfo', (self) => gsts.f.queryCharacterSCurrentMovementSpd(self))
  defineEntityHelperGetter(
    'speed',
    (self) => gsts.f.queryCharacterSCurrentMovementSpd(self).currentSpeed
  )
  defineEntityHelperGetter(
    'velocity',
    (self) => gsts.f.queryCharacterSCurrentMovementSpd(self).velocityVector
  )
  defineEntityHelperGetter('player', (self) =>
    gsts.f.getPlayerEntityToWhichTheCharacterBelongs(self)
  )
  defineEntityHelperGetter('currentTarget', (self) => gsts.f.getCreationSCurrentTarget(self))
  defineEntityHelperGetter('patrolTemplate', (self) =>
    gsts.f.getCurrentCreationSPatrolTemplate(self)
  )
  defineEntityHelperGetter('defaultAggroList', (self) =>
    gsts.f.getAggroListOfCreationInDefaultMode(self)
  )
  defineEntityHelperGetter('characters', (self) =>
    gsts.f.getAllCharacterEntitiesOfSpecifiedPlayer(self)
  )
  defineEntityHelperGetter('activeCharacter', (self) =>
    gsts.f.getActiveCharacterOfSpecifiedPlayer(self)
  )
  defineEntityHelperGetter('classicModeId', (self) => gsts.f.checkClassicModeCharacterId(self))
  defineEntityHelperGetter('character', (self) => {
    const list = gsts.f.getAllCharacterEntitiesOfSpecifiedPlayer(self)
    return gsts.f.getCorrespondingValueFromList(list, 0)
  })
  defineEntityHelperGetter('class', (self) => gsts.f.queryPlayerClass(self))
  defineEntityHelperGetter('classLevel', (self) => {
    const classId = gsts.f.queryPlayerClass(self)
    return gsts.f.queryPlayerClassLevel(self, classId)
  })
  defineEntityHelperGetter('inputDevice', (self) => gsts.f.getPlayerClientInputDeviceType(self))
}
