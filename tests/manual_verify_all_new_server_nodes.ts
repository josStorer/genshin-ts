import { CharacterSkillSlot, OriginalSlotSkillHandling } from 'genshin-ts/definitions/enum'
import type { PlayerEntity } from 'genshin-ts/definitions/entity_helpers'
import { g } from 'genshin-ts/runtime/core'

// Manual import/export verification for the newly added server nodes/events from the 2026-04 update.

g.server({
  id: 1073742201,
  lang: 'en',
  mode: 'beyond'
})
  .on('whenEntityIsCreated', (_evt, f) => {
  const player = f.getSelfEntity() as unknown as PlayerEntity
  const character = entity(0)
  const followEntity = entity(0)

  f.playUiAnimationOnControl(player, 101n)
  f.setPlayerCameraToFollowEntity(player, followEntity, 'camera_template_alpha')
  f.resetPlayerCameraToFollowEntity(player)
  f.closeFloatingInteractionPage(player, 201n)
  f.updateFloatingInteractionPageListData(player, 202n, [11n, 22n, 33n], false)
  f.showFloatingInteractionPage(
    player,
    203n,
    dict([
      { k: 1n, v: list('int', [101n, 102n]) },
      { k: 2n, v: list('int', [201n, 202n, 203n]) }
    ])
  )
  f.setTextChatPermissions(player, [1n, 3n, 5n], true)
  f.setVoiceChatScope(player, [2n, 4n], 25n, true)
  f.setVoiceChatPermissions(player, [6n, 8n], true, false)

  const originalSlotSkillInstanceId = f.bindCustomSkillInstanceToSpecifiedSlot(
    character,
    9001n,
    CharacterSkillSlot.DashSkill,
    OriginalSlotSkillHandling.KeepSlotRelation
  )
  f.unbindSkillInstance(character, 9002n)
  const unboundSkillInstanceIds = f.unbindAllSkillInstancesOnTheSlot(
    character,
    CharacterSkillSlot.CustomSkillSlot2
  )
  const createdSkillInstanceId = f.createCustomSkillInstance(character, configId(3301n))
  f.destroyCustomSkillInstance(character, 9003n)
  f.castSkillFromSpecifiedPanelSlot(character, CharacterSkillSlot.CustomSkillSlot3, true)
  f.castSpecifiedSkillInstance(character, 9004n, false)

  f.removeEquipmentFromSpecifiedSlot(player, 2n, 3n)

  const skillConfigId = f.querySkillConfigIdBySkillInstanceId(character, 9101n)
  const skillInstanceIdsByConfig = f.queryAllSkillInstanceIdsBySkillConfigId(
    character,
    configId(3401n)
  )
  const skillInstanceIdsByQueriedConfig = f.queryAllSkillInstanceIdsBySkillConfigId(
    character,
    skillConfigId
  )
  const skillInstanceIdsBySlot = f.queryAllSkillInstanceIdsBySkillSlot(
    character,
    CharacterSkillSlot.CustomSkillSlot10
  )
  const skillInstanceId = f.querySkillInstanceIdBySkillSlotAndSkillConfigId(
    character,
    CharacterSkillSlot.CustomSkillSlot3,
    configId(3402n)
  )
  const skillGroupValue = f.querySkillAttributeGroupValue(character, configId(3501n))

  f.printString(str(originalSlotSkillInstanceId))
  f.printString(str(f.getListLength(unboundSkillInstanceIds)))
  f.printString(str(createdSkillInstanceId))
  f.printString(str(f.getListLength(skillInstanceIdsByConfig)))
  f.printString(str(f.getListLength(skillInstanceIdsByQueriedConfig)))
  f.printString(str(f.getListLength(skillInstanceIdsBySlot)))
  f.printString(str(skillInstanceId))
  f.printString(str(skillGroupValue))
})
  .on('whenFloatingInteractionPageIsTriggered', (evt, f) => {
  f.printString(f.dataTypeConversion(evt.playerEntity, 'str'))
  f.printString(f.dataTypeConversion(evt.playerGuid, 'str'))
  f.printString(str(evt.floatingInteractionPageIndex))
  f.printString(str(evt.interactiveItemIndex))
  f.printString(str(evt.listIndex.length))
  f.printString(str(evt.selectedListItem.length))
})
  .on('whenEquipmentIsPurchased', (evt, f) => {
  f.printString(f.dataTypeConversion(evt.purchasingInventoryOwnerEntity, 'str'))
  f.printString(f.dataTypeConversion(evt.purchasingInventoryOwnerGuid, 'str'))
  f.printString(str(evt.equipmentIndexList.length))
})
  .on('whenEquipmentIsSold', (evt, f) => {
  f.printString(f.dataTypeConversion(evt.purchasingInventoryOwnerEntity, 'str'))
  f.printString(f.dataTypeConversion(evt.purchasingInventoryOwnerGuid, 'str'))
  f.printString(str(evt.equipmentIndexList.length))
})
