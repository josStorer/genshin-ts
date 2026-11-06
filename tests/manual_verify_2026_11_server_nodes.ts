import type { CharacterEntity, CreationEntity } from 'genshin-ts/definitions/entity_helpers'
import {
  CharacterSkillSlot,
  DamagePopUpType,
  ElementalReactionType,
  ElementalType,
  HitLevel,
  InterruptStatus
} from 'genshin-ts/definitions/enum'
import { g } from 'genshin-ts/runtime/core'

// Compile with --noinject, then import this single GIA to inspect sockets and holes.
g.server({ id: 1073741900, mode: 'beyond', lang: 'en' })
  .on('whenEntityIsCreated', (_evt, f) => {
    const target = f.getCorrespondingValueFromList(f.getListOfPlayerEntitiesOnTheField(), 0n)
    const character = f.getSelfEntity() as CharacterEntity
    const creation = f.getSelfEntity() as CreationEntity
    const index = f.addition(1n, 2n)
    const enabled = f.equal(index, 3n)
    const amount = f.addition(1.5, 2.5)
    f.openGiftBoxInterface(target, index)
    character.setCdForSpecifiedSkillInstance(index, amount, enabled)
    f.increaseCdForSpecifiedSkillInstance(character, index, amount, enabled)
    creation.setCreationDisruptorDevice(index)
    f.activateDisableNativePushCollision(creation, index, enabled)
    creation.activateDisableExtraPushCollision(index, enabled)
    target.switchCombatTextFilterTemplate(index)
    f.initiateAttack(
      creation,
      amount,
      amount,
      [0, 0, 0],
      [0, 0, 0],
      'attack',
      enabled,
      character,
      creation
    )
    f.getSelfEntity().hpLoss(amount, false, true, true, DamagePopUpType.CritHitPopUp, character)
    const attributes = creation.creationAttr
    print(str(attributes.level))
    print(str(attributes.currentHp))
    print(str(attributes.maxHp))
    print(str(attributes.currentAtk))
    print(str(attributes.baseAtk))
    print(str(attributes.interruptValueThreshold))
    print(str(attributes.currentInterruptValue))
    print(
      str(
        f.enumerationsEqual(
          attributes.currentInterruptStatus,
          InterruptStatus.InterruptVulnerabilityStatus
        )
      )
    )
    print(str(attributes.creationWeight))
    print(str(f.enumerationsEqual(CharacterSkillSlot.JumpSkill, CharacterSkillSlot.DashSkill)))
    print(
      str(
        f.enumerationsEqual(ElementalReactionType.StellarSwirl, ElementalReactionType.LunarCharged)
      )
    )
  })
  .on('whenAttacked', (evt, f) => {
    print(str(evt.eventSourceEntity))
    print(str(evt.eventSourceGuid))
    print(str(evt.attackerEntity))
    print(str(evt.damage))
    print(str(f.getListLength(evt.attackTagList)))
    print(str(f.enumerationsEqual(evt.elementalType, ElementalType.Pyro)))
    print(str(evt.elementalAttackPotency))
    print(str(evt.isCriticalHit))
    print(str(f.enumerationsEqual(evt.hitLevel, HitLevel.Launch)))
  })
  .on('whenAttackHits', (evt, f) => {
    print(str(evt.eventSourceEntity))
    print(str(evt.eventSourceGuid))
    print(str(evt.hitTargetEntity))
    print(str(evt.damage))
    print(str(f.getListLength(evt.attackTagList)))
    print(str(f.enumerationsEqual(evt.elementalType, ElementalType.Pyro)))
    print(str(evt.elementalAttackPotency))
    print(str(evt.isCriticalHit))
  })
