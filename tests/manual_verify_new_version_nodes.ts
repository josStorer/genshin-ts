import {
  CharacterSkillSlot,
  ExistingSkillHandling,
  OriginalSlotSkillHandling
} from 'genshin-ts/definitions/enum'
import type { PlayerEntity } from 'genshin-ts/definitions/entity_helpers'
import { g } from 'genshin-ts/runtime/core'

// Manual import/export verification for the 2026-04 node-definition update.

g.server({
  id: 1073742101,
  lang: 'en',
  mode: 'beyond'
}).on('whenEntityIsCreated', (_evt, f) => {
  const player = f.getSelfEntity() as unknown as PlayerEntity
  const character = entity(0)

  f.changePlayerClass(player, configId(21011n), ExistingSkillHandling.ClearAll)
  f.changePlayerClass(player, configId(21012n), ExistingSkillHandling.KeepIrrelevantSkills)
  player.setClass(configId(21013n), ExistingSkillHandling.KeepIrrelevantSkills)

  const switchedSkillInstanceIdDestroy = f.addCharacterSkill(
    character,
    configId(21021n),
    CharacterSkillSlot.Skill1E,
    OriginalSlotSkillHandling.Destroy
  )
  const switchedSkillInstanceIdKeepSlotRelation = f.addCharacterSkill(
    character,
    configId(21022n),
    CharacterSkillSlot.CustomSkillSlot8,
    OriginalSlotSkillHandling.KeepSlotRelation
  )
  const switchedSkillInstanceIdDetachFromSlotRelation = f.addCharacterSkill(
    character,
    configId(21023n),
    CharacterSkillSlot.CustomSkillSlot9,
    OriginalSlotSkillHandling.DetachFromSlotRelation
  )
  character.addSkill(
    configId(21024n),
    CharacterSkillSlot.CustomSkillSlot10,
    OriginalSlotSkillHandling.DetachFromSlotRelation
  )

  f.setChatChannelSwitch(0n, false, false)
  f.setChatChannelSwitch(1n, true, false)
  f.setChatChannelSwitch(2n, true, true)

  f.printString(str(switchedSkillInstanceIdDestroy))
  f.printString(str(switchedSkillInstanceIdKeepSlotRelation))
  f.printString(str(switchedSkillInstanceIdDetachFromSlotRelation))
})
