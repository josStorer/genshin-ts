/**
 * AUTO-GENERATED exhaustive client-node import fixture (classic).
 *
 * Regenerate: npm run gen:client:november
 * Build GIA: node ./bin/gsts.mjs tests/manual/nodes-2026-11/classic.ts -c ./gsts.test.config.ts --noinject
 *
 * Graph IDs:
 *   1082131444  November_AllClientNodesCreationSkillClassic (creation_skill)
 *   1082131445  November_AllClientNodesCreationStatusClassic (creation_status)
 *   1082131446  November_AllClientNodesCreationStatusDecisionClassic (creation_status_decision)
 *   1082131449  November_AllClientNodesBoolFilterClassic (bool_filter)
 *   1082131448  November_AllClientNodesIntFilterClassic (int_filter)
 */

import * as CE from 'genshin-ts/definitions/client_enums'
import * as E from 'genshin-ts/definitions/enum'
import { defineSignal, g } from 'genshin-ts/runtime/core'

const ManualClientPinSignal = defineSignal('gsts_all_client_pin_probe', [
  ['boolValue', 'bool'],
  ['intValue', 'int'],
  ['floatValue', 'float'],
  ['stringValue', 'str'],
  ['vectorValue', 'vec3'],
  ['guidValue', 'guid'],
  ['entityValue', 'entity'],
  ['prefabValue', 'prefab_id'],
  ['configValue', 'config_id']
])

g.creationSkill({
  id: 1082131444,
  name: 'November_AllClientNodesCreationSkillClassic',
  prefix: true,
  mode: 'classic'
}).on('start', (_evt, f) => {
  const wireEntity = f.getSelfEntity()
  const wireBool = f.equal(101n, 101n)
  const wireInt = f.addition(101n, 202n)
  const wireFloat = f.addition(1.25, 2.5)
  const wireVec3 = f.create3dVector(1, 2, 3)
  const wireFaction = f.queryEntityFaction(wireEntity)
  const wireStr = f.getCustomVariable(wireEntity, 'gsts_manual_wire_str').asType('str')
  const wireGuid = f.getCustomVariable(wireEntity, 'gsts_manual_wire_guid').asType('guid')
  const wireConfig = f.getCustomVariable(wireEntity, 'gsts_manual_wire_config').asType('config_id')
  const wirePrefab = f.getCustomVariable(wireEntity, 'gsts_manual_wire_prefab').asType('prefab_id')
  const pinCheck93 = f.equal(wireStr, '')
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck93)
  const pinCheck94 = f.equal(wireGuid, guid(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck94)
  const pinCheck95 = f.equal(wireConfig, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck95)
  const pinCheck96 = f.equal(wirePrefab, prefabId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck96)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe2 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.AlliedFaction,
    f.getEntityTypeList([
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation,
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation
    ]),
    f.getRayFilterTypeList([
      CE.RayFilterType.Hurtbox,
      CE.RayFilterType.Scene,
      CE.RayFilterType.ObjectSelfCollision,
      CE.RayFilterType.CursorHitbox,
      CE.RayFilterType.Hurtbox,
      CE.RayFilterType.Scene,
      CE.RayFilterType.ObjectSelfCollision,
      CE.RayFilterType.CursorHitbox,
      CE.RayFilterType.Hurtbox,
      CE.RayFilterType.Scene
    ])
  )
  const pinCheck3 = f.equal(enumListProbe2.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck3)
  const pinCheck4 = f.equal(enumListProbe2.onHitEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck4)

  // triggerHitboxAtSpecificLocation / trigger_hitbox_at_specific_location / genericId=200051 / literal=34, wire=4
  f.triggerHitboxAtSpecificLocation(
    E.TargetType.AlliedFaction,
    wireVec3,
    [6, 7, 8],
    7.25,
    wireFloat,
    f.getEntityTypeList([
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation,
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation
    ]),
    E.TriggerRestriction.TriggerOnlyOncePerEntity,
    8n,
    E.AttackShape.Sphere,
    [9, 10, 11],
    10.25,
    11.25,
    12.25,
    13.25,
    14.25,
    CE.SectorDetectionDirection.Clockwise,
    CE.AttackLayerConfig.OnlyOnHitScene,
    list(0),
    E.ElementalType.Pyro,
    15.25,
    E.HitType.Default,
    E.AttackType.MeleeAttack,
    16.25,
    true,
    18n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    true,
    [20, 21, 22],
    [21, 22, 23],
    22.25,
    [23, 24, 25],
    [24, 25, 26],
    25.25,
    wireFloat,
    26n,
    CE.HitLevel.LightTremor,
    27.25,
    28.25
  )

  // triggerHitboxAtSpecifiedAttachmentPoint / trigger_hitbox_at_specified_attachment_point / genericId=200059 / literal=35, wire=4
  f.triggerHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.AlliedFaction,
    'literal-29',
    wireVec3,
    wireVec3,
    wireFloat,
    32.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOncePerEntity,
    33n,
    E.AttackShape.Sphere,
    [34, 35, 36],
    35.25,
    36.25,
    37.25,
    38.25,
    39.25,
    CE.SectorDetectionDirection.Clockwise,
    CE.AttackLayerConfig.OnlyOnHitScene,
    list(0),
    E.ElementalType.Pyro,
    40.25,
    E.HitType.Default,
    E.AttackType.MeleeAttack,
    41.25,
    false,
    43n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    false,
    [45, 46, 47],
    [46, 47, 48],
    47.25,
    [48, 49, 50],
    [49, 50, 51],
    50.25,
    51.25,
    wireInt,
    CE.HitLevel.LightTremor,
    52.25,
    53.25
  )

  // triggerRectangularHitboxAtSpecificLocation / trigger_rectangular_hitbox_at_specific_location / genericId=200112 / literal=27, wire=4
  f.triggerRectangularHitboxAtSpecificLocation(
    E.TargetType.AlliedFaction,
    wireVec3,
    [55, 56, 57],
    56.25,
    wireFloat,
    f.getEntityTypeList([
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation,
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation
    ]),
    E.TriggerRestriction.TriggerOnlyOncePerEntity,
    57n,
    [58, 59, 60],
    CE.AttackLayerConfig.OnlyOnHitScene,
    list(0),
    E.ElementalType.Pyro,
    59.25,
    E.HitType.Default,
    E.AttackType.MeleeAttack,
    60.25,
    true,
    62n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    true,
    [64, 65, 66],
    [65, 66, 67],
    66.25,
    [67, 68, 69],
    [68, 69, 70],
    69.25,
    wireFloat,
    70n,
    CE.HitLevel.LightTremor,
    71.25,
    72.25
  )

  // triggerRectangularHitboxAtSpecifiedAttachmentPoint / trigger_rectangular_hitbox_at_specified_attachment_point / genericId=200115 / literal=28, wire=4
  f.triggerRectangularHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.AlliedFaction,
    'literal-73',
    wireVec3,
    wireVec3,
    wireFloat,
    76.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOncePerEntity,
    77n,
    [78, 79, 80],
    CE.AttackLayerConfig.OnlyOnHitScene,
    list(0),
    E.ElementalType.Pyro,
    79.25,
    E.HitType.Default,
    E.AttackType.MeleeAttack,
    80.25,
    true,
    82n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    true,
    [84, 85, 86],
    [85, 86, 87],
    86.25,
    [87, 88, 89],
    [88, 89, 90],
    89.25,
    90.25,
    wireInt,
    CE.HitLevel.LightTremor,
    91.25,
    92.25
  )
})

g.creationStatus({
  id: 1082131445,
  name: 'November_AllClientNodesCreationStatusClassic',
  prefix: true,
  mode: 'classic'
}).on('start1', (_evt, f) => {
  const wireEntity = f.getSelfEntity()
  const wireBool = f.equal(101n, 101n)
  const wireInt = f.addition(101n, 202n)
  const wireFloat = f.addition(1.25, 2.5)
  const wireVec3 = f.create3dVector(1, 2, 3)
  const wireFaction = f.queryEntityFaction(CE.TargetEntity.Self)
  const wireStr = f.getCustomVariable(CE.TargetEntity.Self, 'gsts_manual_wire_str').asType('str')
  const wireGuid = f.getCustomVariable(CE.TargetEntity.Self, 'gsts_manual_wire_guid').asType('guid')
  const wireConfig = f
    .getCustomVariable(CE.TargetEntity.Self, 'gsts_manual_wire_config')
    .asType('config_id')
  const wirePrefab = f
    .getCustomVariable(CE.TargetEntity.Self, 'gsts_manual_wire_prefab')
    .asType('prefab_id')
  const pinCheck65 = f.equal(wireStr, '')
  f.executeSkill(pinCheck65, 1n)
  const pinCheck66 = f.equal(wireGuid, guid(0n))
  f.executeSkill(pinCheck66, 1n)
  const pinCheck67 = f.equal(wireConfig, configId(0n))
  f.executeSkill(pinCheck67, 1n)
  const pinCheck68 = f.equal(wirePrefab, prefabId(0n))
  f.executeSkill(pinCheck68, 1n)

  // getEntityTypeList / get_entity_type_list / genericId=200312 / literal=1, wire=0
  const enumListProbe2 = f.getRayDetectionResult(
    CE.TargetEntity.Self,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.AlliedFaction,
    f.getEntityTypeList([
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation,
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation
    ]),
    f.getRayFilterTypeList([
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox
    ])
  )
  const pinCheck3 = f.equal(enumListProbe2.onHitLocation, [0, 0, 0])
  f.executeSkill(pinCheck3, 1n)
  const pinCheck4 = enumListProbe2.onHitEntity
  f.executeSkill(pinCheck4, 1n)

  // getPreviousFrameExecutionTactic / get_previous_frame_execution_tactic / genericId=200252 / literal=0, wire=0
  const result5 = f.getPreviousFrameExecutionTactic()
  const pinCheck6 = f.enumerationMatch(result5.tacticType, CE.TacticType.StayMotionless)
  f.executeSkill(pinCheck6, 1n)
  const pinCheck7 = f.equal(result5.tacticalContext, '')
  f.executeSkill(pinCheck7, 1n)
  const pinCheck8 = f.equal(result5.tacticDuration, 0)
  f.executeSkill(pinCheck8, 1n)

  // getRayDetectionResult / get_ray_detection_result / genericId=200301 / literal=5, wire=2
  const result11 = f.getRayDetectionResult(
    CE.TargetEntity.Self,
    wireVec3,
    [10, 11, 12],
    wireFloat,
    E.TargetType.AlliedFaction,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    [
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision
    ]
  )
  const pinCheck12 = f.equal(result11.onHitLocation, [0, 0, 0])
  f.executeSkill(pinCheck12, 1n)
  const pinCheck13 = f.equal(result11.onHitEntity, false)
  f.executeSkill(pinCheck13, 1n)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200302 / literal=1, wire=0
  const enumListProbe15 = f.getRayDetectionResult(
    CE.TargetEntity.Self,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.AlliedFaction,
    f.getEntityTypeList([
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation,
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation
    ]),
    f.getRayFilterTypeList([
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox
    ])
  )
  const pinCheck16 = f.equal(enumListProbe15.onHitLocation, [0, 0, 0])
  f.executeSkill(pinCheck16, 1n)
  const pinCheck17 = enumListProbe15.onHitEntity
  f.executeSkill(pinCheck17, 1n)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200307 / literal=1, wire=1
  const result63 = f.whetherTheEntityHasTheSpecifiedUnitStatus(self, wireConfig)
  const pinCheck64 = f.equal(result63, false)
  f.executeSkill(pinCheck64, 1n)

  // tacticAerialConfrontation / tactic_aerial_confrontation / genericId=200310 / literal=17, wire=11
  f.tacticAerialConfrontation(
    wireBool,
    'literal-18',
    true,
    wireFloat,
    wireFloat,
    wireFloat,
    20.25,
    21.25,
    wireFloat,
    22.25,
    true,
    false,
    wireFloat,
    25.25,
    wireFloat,
    26.25,
    27.25,
    28.25,
    29.25,
    wireFloat,
    wireFloat,
    30.25,
    wireFloat,
    31.25,
    32.25,
    CE.TacticSpeed.Run,
    33.25,
    wireFloat
  )

  // tacticAerialEscape / tactic_aerial_escape / genericId=200309 / literal=10, wire=10
  f.tacticAerialEscape(
    false,
    'literal-35',
    wireBool,
    36.25,
    CE.TacticSpeed.Run,
    wireFloat,
    wireFloat,
    wireFloat,
    wireFloat,
    37.25,
    wireInt,
    38n,
    39.25,
    wireFloat,
    40.25,
    41.25,
    wireBool,
    wireFloat,
    wireFloat,
    false
  )

  // tacticAerialIdling / tactic_aerial_idling / genericId=200311 / literal=10, wire=4
  f.tacticAerialIdling(
    true,
    'literal-44',
    wireBool,
    CE.TacticSpeed.Run,
    45.25,
    46.25,
    47.25,
    wireFloat,
    48.25,
    49.25,
    50.25,
    wireFloat,
    51.25,
    wireFloat
  )

  // tacticAerialLanding / tactic_aerial_landing / genericId=200303 / literal=5, wire=5
  f.tacticAerialLanding(
    false,
    'literal-53',
    wireBool,
    54.25,
    wireFloat,
    wireFloat,
    CE.TacticSpeed.Run,
    wireFloat,
    wireFloat,
    55.25
  )

  // tacticAerialPursuit / tactic_aerial_pursuit / genericId=200308 / literal=8, wire=7
  f.tacticAerialPursuit(
    wireBool,
    'literal-56',
    true,
    wireFloat,
    58.25,
    wireBool,
    wireFloat,
    59.25,
    60.25,
    wireFloat,
    CE.TacticSpeed.Run,
    wireFloat,
    wireFloat,
    61.25,
    62.25
  )
})

g.creationStatusDecision({
  id: 1082131446,
  name: 'November_AllClientNodesCreationStatusDecisionClassic',
  prefix: true,
  mode: 'classic'
}).on('start1', (_evt, f) => {
  const wireEntity = f.getSelfEntity()
  const wireBool = f.equal(101n, 101n)
  const wireInt = f.addition(101n, 202n)
  const wireFloat = f.addition(1.25, 2.5)
  const wireVec3 = f.create3dVector(1, 2, 3)
  const wireFaction = f.queryEntityFaction(CE.TargetEntity.Self)
  const wireStr = f.getCustomVariable(CE.TargetEntity.Self, 'gsts_manual_wire_str').asType('str')
  const wireGuid = f.getCustomVariable(CE.TargetEntity.Self, 'gsts_manual_wire_guid').asType('guid')
  const wireConfig = f
    .getCustomVariable(CE.TargetEntity.Self, 'gsts_manual_wire_config')
    .asType('config_id')
  const wirePrefab = f
    .getCustomVariable(CE.TargetEntity.Self, 'gsts_manual_wire_prefab')
    .asType('prefab_id')
  const pinCheck22 = f.equal(wireStr, '')
  f.switchToSelfExecutionStatus(pinCheck22, configId(1082130445), 1n)
  const pinCheck23 = f.equal(wireGuid, guid(0n))
  f.switchToSelfExecutionStatus(pinCheck23, configId(1082130445), 1n)
  const pinCheck24 = f.equal(wireConfig, configId(0n))
  f.switchToSelfExecutionStatus(pinCheck24, configId(1082130445), 1n)
  const pinCheck25 = f.equal(wirePrefab, prefabId(0n))
  f.switchToSelfExecutionStatus(pinCheck25, configId(1082130445), 1n)

  // getEntityTypeList / get_entity_type_list / genericId=200312 / literal=1, wire=0
  const enumListProbe2 = f.getRayDetectionResult(
    CE.TargetEntity.Self,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.AlliedFaction,
    f.getEntityTypeList([
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation,
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation
    ]),
    f.getRayFilterTypeList([
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox
    ])
  )
  const pinCheck3 = f.equal(enumListProbe2.onHitLocation, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck3, configId(1082130445), 1n)
  const pinCheck4 = enumListProbe2.onHitEntity
  f.switchToSelfExecutionStatus(pinCheck4, configId(1082130445), 1n)

  // getPreviousFrameExecutionTactic / get_previous_frame_execution_tactic / genericId=200252 / literal=0, wire=0
  const result5 = f.getPreviousFrameExecutionTactic()
  const pinCheck6 = f.enumerationMatch(result5.tacticType, CE.TacticType.StayMotionless)
  f.switchToSelfExecutionStatus(pinCheck6, configId(1082130445), 1n)
  const pinCheck7 = f.equal(result5.tacticalContext, '')
  f.switchToSelfExecutionStatus(pinCheck7, configId(1082130445), 1n)
  const pinCheck8 = f.equal(result5.tacticDuration, 0)
  f.switchToSelfExecutionStatus(pinCheck8, configId(1082130445), 1n)

  // getRayDetectionResult / get_ray_detection_result / genericId=200301 / literal=4, wire=3
  const result12 = f.getRayDetectionResult(
    CE.TargetEntity.Self,
    [9, 10, 11],
    wireVec3,
    11.25,
    E.TargetType.AlliedFaction,
    f.getEntityTypeList([
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation,
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation
    ]),
    f.getRayFilterTypeList([
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox
    ])
  )
  const pinCheck13 = f.equal(result12.onHitLocation, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck13, configId(1082130445), 1n)
  const pinCheck14 = f.equal(result12.onHitEntity, false)
  f.switchToSelfExecutionStatus(pinCheck14, configId(1082130445), 1n)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200302 / literal=1, wire=0
  const enumListProbe16 = f.getRayDetectionResult(
    CE.TargetEntity.Self,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.AlliedFaction,
    f.getEntityTypeList([
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation,
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation
    ]),
    f.getRayFilterTypeList([
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision,
      CE.RayHitFilterType.Hurtbox
    ])
  )
  const pinCheck17 = f.equal(enumListProbe16.onHitLocation, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck17, configId(1082130445), 1n)
  const pinCheck18 = enumListProbe16.onHitEntity
  f.switchToSelfExecutionStatus(pinCheck18, configId(1082130445), 1n)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200307 / literal=1, wire=1
  const result20 = f.whetherTheEntityHasTheSpecifiedUnitStatus(wireEntity, configId(19n))
  const pinCheck21 = f.equal(result20, false)
  f.switchToSelfExecutionStatus(pinCheck21, configId(1082130445), 1n)
})

g.boolFilter({
  id: 1082131449,
  name: 'November_AllClientNodesBoolFilterClassic',
  prefix: true,
  mode: 'classic'
}).on('start', (_evt, f) => {
  const wireEntity = f.getSelfEntity()
  const wireBool = f.equal(101n, 101n)
  const wireInt = f.addition(101n, 202n)
  const wireFloat = f.addition(1.25, 2.5)
  const wireVec3 = f.create3dVector(1, 2, 3)
  const wireFaction = f.queryEntityFaction(wireEntity)
  const wireStr = f.getCustomVariable(wireEntity, 'gsts_manual_wire_str').asType('str')
  const wireGuid = f.getCustomVariable(wireEntity, 'gsts_manual_wire_guid').asType('guid')
  const wireConfig = f.getCustomVariable(wireEntity, 'gsts_manual_wire_config').asType('config_id')
  const wirePrefab = f.getCustomVariable(wireEntity, 'gsts_manual_wire_prefab').asType('prefab_id')
  const pinCheck5 = f.equal(wireStr, '')
  const pinCheck6 = f.equal(wireGuid, guid(0n))
  const pinCheck7 = f.equal(wireConfig, configId(0n))
  const pinCheck8 = f.equal(wirePrefab, prefabId(0n))

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe2 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.AlliedFaction,
    f.getEntityTypeList([
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation,
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation
    ]),
    f.getRayFilterTypeList([
      CE.RayFilterType.Hurtbox,
      CE.RayFilterType.Scene,
      CE.RayFilterType.ObjectSelfCollision,
      CE.RayFilterType.CursorHitbox,
      CE.RayFilterType.Hurtbox,
      CE.RayFilterType.Scene,
      CE.RayFilterType.ObjectSelfCollision,
      CE.RayFilterType.CursorHitbox,
      CE.RayFilterType.Hurtbox,
      CE.RayFilterType.Scene
    ])
  )
  const pinCheck3 = f.equal(enumListProbe2.onHitLocation, [0, 0, 0])
  const pinCheck4 = f.equal(enumListProbe2.onHitEntity, wireEntity)

  const combinedCheck9 = f.logicalAndOperation(pinCheck3, pinCheck4)
  const combinedCheck10 = f.logicalAndOperation(pinCheck5, pinCheck6)
  const combinedCheck11 = f.logicalAndOperation(pinCheck7, pinCheck8)
  const combinedCheck12 = f.logicalAndOperation(combinedCheck9, combinedCheck10)
  const combinedCheck13 = f.logicalAndOperation(combinedCheck12, combinedCheck11)
  return combinedCheck13
})

g.intFilter({
  id: 1082131448,
  name: 'November_AllClientNodesIntFilterClassic',
  prefix: true,
  mode: 'classic'
}).on('start', (_evt, f) => {
  const wireEntity = f.getSelfEntity()
  const wireBool = f.equal(101n, 101n)
  const wireInt = f.addition(101n, 202n)
  const wireFloat = f.addition(1.25, 2.5)
  const wireVec3 = f.create3dVector(1, 2, 3)
  const wireFaction = f.queryEntityFaction(wireEntity)
  const wireStr = f.getCustomVariable(wireEntity, 'gsts_manual_wire_str').asType('str')
  const wireGuid = f.getCustomVariable(wireEntity, 'gsts_manual_wire_guid').asType('guid')
  const wireConfig = f.getCustomVariable(wireEntity, 'gsts_manual_wire_config').asType('config_id')
  const wirePrefab = f.getCustomVariable(wireEntity, 'gsts_manual_wire_prefab').asType('prefab_id')
  const pinCheck5 = f.equal(wireStr, '')
  const pinCheck6 = f.equal(wireGuid, guid(0n))
  const pinCheck7 = f.equal(wireConfig, configId(0n))
  const pinCheck8 = f.equal(wirePrefab, prefabId(0n))

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe2 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.AlliedFaction,
    f.getEntityTypeList([
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation,
      E.EntityType.Stage,
      E.EntityType.Object,
      E.EntityType.Player,
      E.EntityType.Character,
      E.EntityType.Creation
    ]),
    f.getRayFilterTypeList([
      CE.RayFilterType.Hurtbox,
      CE.RayFilterType.Scene,
      CE.RayFilterType.ObjectSelfCollision,
      CE.RayFilterType.CursorHitbox,
      CE.RayFilterType.Hurtbox,
      CE.RayFilterType.Scene,
      CE.RayFilterType.ObjectSelfCollision,
      CE.RayFilterType.CursorHitbox,
      CE.RayFilterType.Hurtbox,
      CE.RayFilterType.Scene
    ])
  )
  const pinCheck3 = f.equal(enumListProbe2.onHitLocation, [0, 0, 0])
  const pinCheck4 = f.equal(enumListProbe2.onHitEntity, wireEntity)

  const combinedCheck9 = f.logicalAndOperation(pinCheck3, pinCheck4)
  const combinedCheck10 = f.logicalAndOperation(pinCheck5, pinCheck6)
  const combinedCheck11 = f.logicalAndOperation(pinCheck7, pinCheck8)
  const combinedCheck12 = f.logicalAndOperation(combinedCheck9, combinedCheck10)
  const combinedCheck13 = f.logicalAndOperation(combinedCheck12, combinedCheck11)
  return f.dataTypeConversion(combinedCheck13, 'int')
})
