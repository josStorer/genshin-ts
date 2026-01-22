import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED enum coverage for CharacterSkillSlot
// Run: npx tsx scripts/generate-enum-gia-tests.ts

g.server({ id: 1073741854 }).on('whenEntityIsCreated', (_evt, f) => {
  const e = f.getSelfEntity()
  const pe = f.getListOfPlayerEntitiesOnTheField()[0]
  const ce = f.getAllCharacterEntitiesOfSpecifiedPlayer(pe)[0]
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.NormalAttack)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.Skill1E)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.Skill2Q)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.Skill3R)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.Skill4T)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot1)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot2)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot3)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot4)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot5)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot6)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot7)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot8)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot9)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot10)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot11)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot12)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot13)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot14)
  f.initializeCharacterSkill(ce, E.CharacterSkillSlot.CustomSkillSlot15)
})
