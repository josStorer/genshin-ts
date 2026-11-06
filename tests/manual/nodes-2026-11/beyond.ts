/**
 * AUTO-GENERATED exhaustive client-node import fixture (beyond).
 *
 * Regenerate: npm run gen:client:november
 * Build GIA: node ./bin/gsts.mjs tests/manual/nodes-2026-11/beyond.ts -c ./gsts.test.config.ts --noinject
 *
 * Graph IDs:
 *   1082131435  November_AllClientNodesCharacterSkillBeyond (character_skill)
 *   1082131436  November_AllClientNodesCharacterControlSkillBeyond (character_control_skill)
 *   1082131437  November_AllClientNodesCreationSkillBeyond (creation_skill)
 *   1082131438  November_AllClientNodesCreationStatusBeyond (creation_status)
 *   1082131439  November_AllClientNodesCreationStatusDecisionBeyond (creation_status_decision)
 *   1082131440  November_AllClientNodesBoolFilterBeyond (bool_filter)
 *   1082131441  November_AllClientNodesIntFilterBeyond (int_filter)
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

g.characterSkill({
  id: 1082131435,
  name: 'November_AllClientNodesCharacterSkillBeyond',
  prefix: true,
  mode: 'beyond'
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
  const pinCheck111 = f.equal(wireStr, '')
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck111)
  const pinCheck112 = f.equal(wireGuid, guid(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck112)
  const pinCheck113 = f.equal(wireConfig, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck113)
  const pinCheck114 = f.equal(wirePrefab, prefabId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck114)

  // getBaseObjectOfSpecifiedPreAiming / get_base_object_of_specified_pre_aiming / genericId=200276 / literal=1, wire=1
  const result1 = f.getBaseObjectOfSpecifiedPreAiming(wireInt, CE.PreAimResultDataType.Current)
  const pinCheck2 = f.equal(result1, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck2)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe4 = f.getRayDetectionResult(
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
  const pinCheck5 = f.equal(enumListProbe4.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck5)
  const pinCheck6 = f.equal(enumListProbe4.onHitEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck6)

  // getPreAimingCollisionDetectionResultCount / get_pre_aiming_collision_detection_result_count / genericId=200280 / literal=1, wire=1
  const result7 = f.getPreAimingCollisionDetectionResultCount(
    wireInt,
    CE.PreAimResultDataType.Current
  )
  const pinCheck8 = f.equal(result7, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck8)

  // getPreAimingDuration / get_pre_aiming_duration / genericId=200278 / literal=2, wire=0
  const result10 = f.getPreAimingDuration(9n, CE.PreAimResultDataType.Current)
  const pinCheck11 = f.equal(result10, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck11)

  // getPreAimingRayHitInfo / get_pre_aiming_ray_hit_info / genericId=200281 / literal=1, wire=1
  const result12 = f.getPreAimingRayHitInfo(wireInt, CE.PreAimResultDataType.Current)
  const pinCheck13 = f.equal(result12.hitPosition, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck13)
  const pinCheck14 = f.equal(result12.hitEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck14)

  // getPreAimingResult / get_pre_aiming_result / genericId=200277 / literal=1, wire=1
  const result15 = f.getPreAimingResult(wireInt, CE.PreAimResultDataType.Current)
  const pinCheck16 = f.equal(result15.hitPosition, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck16)
  const pinCheck17 = f.equal(result15.inRangePosition, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck17)
  const pinCheck18 = f.equal(result15.bestValidTarget, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck18)
  const pinCheck19 = f.greaterThanOrEqualTo(f.getListLength(result15.validTargetList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck19)

  // getWhetherPreAimingStickIsInDeadZone / get_whether_pre_aiming_stick_is_in_dead_zone / genericId=200282 / literal=2, wire=0
  const result21 = f.getWhetherPreAimingStickIsInDeadZone(20n, CE.PreAimResultDataType.Current)
  const pinCheck22 = f.equal(result21, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck22)

  // triggerHitboxAtSpecificLocation / trigger_hitbox_at_specific_location / genericId=200051 / literal=35, wire=3
  f.triggerHitboxAtSpecificLocation(
    E.TargetType.AlliedFaction,
    [23, 24, 25],
    wireVec3,
    wireFloat,
    25.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOncePerEntity,
    26n,
    E.AttackShape.Sphere,
    [27, 28, 29],
    28.25,
    29.25,
    30.25,
    31.25,
    32.25,
    CE.SectorDetectionDirection.Clockwise,
    CE.AttackLayerConfig.OnlyOnHitScene,
    list(0),
    E.ElementalType.Pyro,
    33.25,
    E.HitType.Default,
    E.AttackType.MeleeAttack,
    34.25,
    true,
    36n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    true,
    [38, 39, 40],
    [39, 40, 41],
    40.25,
    [41, 42, 43],
    [42, 43, 44],
    43.25,
    44.25,
    wireInt,
    CE.HitLevel.LightTremor,
    45.25,
    46.25
  )

  // triggerHitboxAtSpecifiedAttachmentPoint / trigger_hitbox_at_specified_attachment_point / genericId=200059 / literal=36, wire=3
  f.triggerHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.AlliedFaction,
    'literal-47',
    [48, 49, 50],
    [49, 50, 51],
    50.25,
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
    51n,
    E.AttackShape.Sphere,
    [52, 53, 54],
    53.25,
    54.25,
    55.25,
    56.25,
    57.25,
    CE.SectorDetectionDirection.Clockwise,
    CE.AttackLayerConfig.OnlyOnHitScene,
    list(0),
    E.ElementalType.Pyro,
    58.25,
    E.HitType.Default,
    E.AttackType.MeleeAttack,
    59.25,
    false,
    61n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    false,
    [63, 64, 65],
    [64, 65, 66],
    65.25,
    [66, 67, 68],
    [67, 68, 69],
    68.25,
    wireFloat,
    69n,
    CE.HitLevel.LightTremor,
    70.25,
    71.25
  )

  // triggerRectangularHitboxAtSpecificLocation / trigger_rectangular_hitbox_at_specific_location / genericId=200112 / literal=28, wire=3
  f.triggerRectangularHitboxAtSpecificLocation(
    E.TargetType.AlliedFaction,
    [72, 73, 74],
    wireVec3,
    wireFloat,
    74.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOncePerEntity,
    75n,
    [76, 77, 78],
    CE.AttackLayerConfig.OnlyOnHitScene,
    list(0),
    E.ElementalType.Pyro,
    77.25,
    E.HitType.Default,
    E.AttackType.MeleeAttack,
    78.25,
    true,
    80n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    true,
    [82, 83, 84],
    [83, 84, 85],
    84.25,
    [85, 86, 87],
    [86, 87, 88],
    87.25,
    88.25,
    wireInt,
    CE.HitLevel.LightTremor,
    89.25,
    90.25
  )

  // triggerRectangularHitboxAtSpecifiedAttachmentPoint / trigger_rectangular_hitbox_at_specified_attachment_point / genericId=200115 / literal=29, wire=3
  f.triggerRectangularHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.AlliedFaction,
    'literal-91',
    [92, 93, 94],
    [93, 94, 95],
    94.25,
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
    95n,
    [96, 97, 98],
    CE.AttackLayerConfig.OnlyOnHitScene,
    list(0),
    E.ElementalType.Pyro,
    97.25,
    E.HitType.Default,
    E.AttackType.MeleeAttack,
    98.25,
    true,
    100n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    true,
    [102, 103, 104],
    [103, 104, 105],
    104.25,
    [105, 106, 107],
    [106, 107, 108],
    107.25,
    wireFloat,
    108n,
    CE.HitLevel.LightTremor,
    109.25,
    110.25
  )
})

g.characterControlSkill({
  id: 1082131436,
  name: 'November_AllClientNodesCharacterControlSkillBeyond',
  prefix: true,
  mode: 'beyond'
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
  const pinCheck111 = f.equal(wireStr, '')
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck111)
  const pinCheck112 = f.equal(wireGuid, guid(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck112)
  const pinCheck113 = f.equal(wireConfig, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck113)
  const pinCheck114 = f.equal(wirePrefab, prefabId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck114)

  // getBaseObjectOfSpecifiedPreAiming / get_base_object_of_specified_pre_aiming / genericId=200276 / literal=1, wire=1
  const result1 = f.getBaseObjectOfSpecifiedPreAiming(wireInt, CE.PreAimResultDataType.Current)
  const pinCheck2 = f.equal(result1, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck2)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe4 = f.getRayDetectionResult(
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
  const pinCheck5 = f.equal(enumListProbe4.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck5)
  const pinCheck6 = f.equal(enumListProbe4.onHitEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck6)

  // getPreAimingCollisionDetectionResultCount / get_pre_aiming_collision_detection_result_count / genericId=200280 / literal=1, wire=1
  const result7 = f.getPreAimingCollisionDetectionResultCount(
    wireInt,
    CE.PreAimResultDataType.Current
  )
  const pinCheck8 = f.equal(result7, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck8)

  // getPreAimingDuration / get_pre_aiming_duration / genericId=200278 / literal=2, wire=0
  const result10 = f.getPreAimingDuration(9n, CE.PreAimResultDataType.Current)
  const pinCheck11 = f.equal(result10, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck11)

  // getPreAimingRayHitInfo / get_pre_aiming_ray_hit_info / genericId=200281 / literal=1, wire=1
  const result12 = f.getPreAimingRayHitInfo(wireInt, CE.PreAimResultDataType.Current)
  const pinCheck13 = f.equal(result12.hitPosition, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck13)
  const pinCheck14 = f.equal(result12.hitEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck14)

  // getPreAimingResult / get_pre_aiming_result / genericId=200277 / literal=1, wire=1
  const result15 = f.getPreAimingResult(wireInt, CE.PreAimResultDataType.Current)
  const pinCheck16 = f.equal(result15.hitPosition, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck16)
  const pinCheck17 = f.equal(result15.inRangePosition, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck17)
  const pinCheck18 = f.equal(result15.bestValidTarget, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck18)
  const pinCheck19 = f.greaterThanOrEqualTo(f.getListLength(result15.validTargetList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck19)

  // getWhetherPreAimingStickIsInDeadZone / get_whether_pre_aiming_stick_is_in_dead_zone / genericId=200282 / literal=2, wire=0
  const result21 = f.getWhetherPreAimingStickIsInDeadZone(20n, CE.PreAimResultDataType.Current)
  const pinCheck22 = f.equal(result21, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck22)

  // triggerHitboxAtSpecificLocation / trigger_hitbox_at_specific_location / genericId=200051 / literal=35, wire=3
  f.triggerHitboxAtSpecificLocation(
    E.TargetType.AlliedFaction,
    [23, 24, 25],
    wireVec3,
    wireFloat,
    25.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOncePerEntity,
    26n,
    E.AttackShape.Sphere,
    [27, 28, 29],
    28.25,
    29.25,
    30.25,
    31.25,
    32.25,
    CE.SectorDetectionDirection.Clockwise,
    CE.AttackLayerConfig.OnlyOnHitScene,
    list(0),
    E.ElementalType.Pyro,
    33.25,
    E.HitType.Default,
    E.AttackType.MeleeAttack,
    34.25,
    true,
    36n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    true,
    [38, 39, 40],
    [39, 40, 41],
    40.25,
    [41, 42, 43],
    [42, 43, 44],
    43.25,
    44.25,
    wireInt,
    CE.HitLevel.LightTremor,
    45.25,
    46.25
  )

  // triggerHitboxAtSpecifiedAttachmentPoint / trigger_hitbox_at_specified_attachment_point / genericId=200059 / literal=36, wire=3
  f.triggerHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.AlliedFaction,
    'literal-47',
    [48, 49, 50],
    [49, 50, 51],
    50.25,
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
    51n,
    E.AttackShape.Sphere,
    [52, 53, 54],
    53.25,
    54.25,
    55.25,
    56.25,
    57.25,
    CE.SectorDetectionDirection.Clockwise,
    CE.AttackLayerConfig.OnlyOnHitScene,
    list(0),
    E.ElementalType.Pyro,
    58.25,
    E.HitType.Default,
    E.AttackType.MeleeAttack,
    59.25,
    false,
    61n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    false,
    [63, 64, 65],
    [64, 65, 66],
    65.25,
    [66, 67, 68],
    [67, 68, 69],
    68.25,
    wireFloat,
    69n,
    CE.HitLevel.LightTremor,
    70.25,
    71.25
  )

  // triggerRectangularHitboxAtSpecificLocation / trigger_rectangular_hitbox_at_specific_location / genericId=200112 / literal=28, wire=3
  f.triggerRectangularHitboxAtSpecificLocation(
    E.TargetType.AlliedFaction,
    [72, 73, 74],
    wireVec3,
    wireFloat,
    74.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOncePerEntity,
    75n,
    [76, 77, 78],
    CE.AttackLayerConfig.OnlyOnHitScene,
    list(0),
    E.ElementalType.Pyro,
    77.25,
    E.HitType.Default,
    E.AttackType.MeleeAttack,
    78.25,
    true,
    80n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    true,
    [82, 83, 84],
    [83, 84, 85],
    84.25,
    [85, 86, 87],
    [86, 87, 88],
    87.25,
    88.25,
    wireInt,
    CE.HitLevel.LightTremor,
    89.25,
    90.25
  )

  // triggerRectangularHitboxAtSpecifiedAttachmentPoint / trigger_rectangular_hitbox_at_specified_attachment_point / genericId=200115 / literal=29, wire=3
  f.triggerRectangularHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.AlliedFaction,
    'literal-91',
    [92, 93, 94],
    [93, 94, 95],
    94.25,
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
    95n,
    [96, 97, 98],
    CE.AttackLayerConfig.OnlyOnHitScene,
    list(0),
    E.ElementalType.Pyro,
    97.25,
    E.HitType.Default,
    E.AttackType.MeleeAttack,
    98.25,
    true,
    100n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    true,
    [102, 103, 104],
    [103, 104, 105],
    104.25,
    [105, 106, 107],
    [106, 107, 108],
    107.25,
    wireFloat,
    108n,
    CE.HitLevel.LightTremor,
    109.25,
    110.25
  )
})

g.creationSkill({
  id: 1082131437,
  name: 'November_AllClientNodesCreationSkillBeyond',
  prefix: true,
  mode: 'beyond'
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

  // triggerHitboxAtSpecificLocation / trigger_hitbox_at_specific_location / genericId=200051 / literal=35, wire=3
  f.triggerHitboxAtSpecificLocation(
    E.TargetType.AlliedFaction,
    [5, 6, 7],
    wireVec3,
    wireFloat,
    7.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
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
    26.25,
    wireInt,
    CE.HitLevel.LightTremor,
    27.25,
    28.25
  )

  // triggerHitboxAtSpecifiedAttachmentPoint / trigger_hitbox_at_specified_attachment_point / genericId=200059 / literal=36, wire=3
  f.triggerHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.AlliedFaction,
    'literal-29',
    [30, 31, 32],
    [31, 32, 33],
    32.25,
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
    wireFloat,
    51n,
    CE.HitLevel.LightTremor,
    52.25,
    53.25
  )

  // triggerRectangularHitboxAtSpecificLocation / trigger_rectangular_hitbox_at_specific_location / genericId=200112 / literal=28, wire=3
  f.triggerRectangularHitboxAtSpecificLocation(
    E.TargetType.AlliedFaction,
    [54, 55, 56],
    wireVec3,
    wireFloat,
    56.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
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
    70.25,
    wireInt,
    CE.HitLevel.LightTremor,
    71.25,
    72.25
  )

  // triggerRectangularHitboxAtSpecifiedAttachmentPoint / trigger_rectangular_hitbox_at_specified_attachment_point / genericId=200115 / literal=29, wire=3
  f.triggerRectangularHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.AlliedFaction,
    'literal-73',
    [74, 75, 76],
    [75, 76, 77],
    76.25,
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
    wireFloat,
    90n,
    CE.HitLevel.LightTremor,
    91.25,
    92.25
  )
})

g.creationStatus({
  id: 1082131438,
  name: 'November_AllClientNodesCreationStatusBeyond',
  prefix: true,
  mode: 'beyond'
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
  const pinCheck64 = f.equal(wireStr, '')
  f.executeSkill(pinCheck64, 1n)
  const pinCheck65 = f.equal(wireGuid, guid(0n))
  f.executeSkill(pinCheck65, 1n)
  const pinCheck66 = f.equal(wireConfig, configId(0n))
  f.executeSkill(pinCheck66, 1n)
  const pinCheck67 = f.equal(wirePrefab, prefabId(0n))
  f.executeSkill(pinCheck67, 1n)

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
  f.executeSkill(pinCheck13, 1n)
  const pinCheck14 = f.equal(result12.onHitEntity, false)
  f.executeSkill(pinCheck14, 1n)

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
  f.executeSkill(pinCheck17, 1n)
  const pinCheck18 = enumListProbe16.onHitEntity
  f.executeSkill(pinCheck18, 1n)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200307 / literal=1, wire=1
  const result62 = f.whetherTheEntityHasTheSpecifiedUnitStatus(wireEntity, configId(61n))
  const pinCheck63 = f.equal(result62, false)
  f.executeSkill(pinCheck63, 1n)

  // tacticAerialConfrontation / tactic_aerial_confrontation / genericId=200310 / literal=13, wire=15
  f.tacticAerialConfrontation(
    true,
    'literal-20',
    wireBool,
    21.25,
    22.25,
    23.25,
    wireFloat,
    wireFloat,
    24.25,
    wireFloat,
    wireBool,
    wireBool,
    25.25,
    wireFloat,
    26.25,
    wireFloat,
    wireFloat,
    wireFloat,
    wireFloat,
    27.25,
    28.25,
    wireFloat,
    29.25,
    wireFloat,
    wireFloat,
    CE.TacticSpeed.Run,
    wireFloat,
    30.25
  )

  // tacticAerialEscape / tactic_aerial_escape / genericId=200309 / literal=12, wire=8
  f.tacticAerialEscape(
    wireBool,
    'literal-31',
    false,
    wireFloat,
    CE.TacticSpeed.Run,
    33.25,
    34.25,
    35.25,
    36.25,
    wireFloat,
    37n,
    wireInt,
    wireFloat,
    38.25,
    wireFloat,
    wireFloat,
    true,
    40.25,
    41.25,
    wireBool
  )

  // tacticAerialIdling / tactic_aerial_idling / genericId=200311 / literal=6, wire=8
  f.tacticAerialIdling(
    wireBool,
    'literal-42',
    true,
    CE.TacticSpeed.Run,
    wireFloat,
    wireFloat,
    wireFloat,
    44.25,
    wireFloat,
    wireFloat,
    wireFloat,
    45.25,
    wireFloat,
    46.25
  )

  // tacticAerialLanding / tactic_aerial_landing / genericId=200303 / literal=7, wire=3
  f.tacticAerialLanding(
    wireBool,
    'literal-47',
    false,
    wireFloat,
    49.25,
    50.25,
    CE.TacticSpeed.Run,
    51.25,
    52.25,
    wireFloat
  )

  // tacticAerialPursuit / tactic_aerial_pursuit / genericId=200308 / literal=9, wire=6
  f.tacticAerialPursuit(
    true,
    'literal-54',
    wireBool,
    55.25,
    wireFloat,
    false,
    57.25,
    wireFloat,
    wireFloat,
    58.25,
    CE.TacticSpeed.Run,
    59.25,
    60.25,
    wireFloat,
    wireFloat
  )
})

g.creationStatusDecision({
  id: 1082131439,
  name: 'November_AllClientNodesCreationStatusDecisionBeyond',
  prefix: true,
  mode: 'beyond'
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
  const pinCheck20 = f.equal(wireStr, '')
  f.switchToSelfExecutionStatus(pinCheck20, configId(1082130438), 1n)
  const pinCheck21 = f.equal(wireGuid, guid(0n))
  f.switchToSelfExecutionStatus(pinCheck21, configId(1082130438), 1n)
  const pinCheck22 = f.equal(wireConfig, configId(0n))
  f.switchToSelfExecutionStatus(pinCheck22, configId(1082130438), 1n)
  const pinCheck23 = f.equal(wirePrefab, prefabId(0n))
  f.switchToSelfExecutionStatus(pinCheck23, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck3, configId(1082130438), 1n)
  const pinCheck4 = enumListProbe2.onHitEntity
  f.switchToSelfExecutionStatus(pinCheck4, configId(1082130438), 1n)

  // getPreviousFrameExecutionTactic / get_previous_frame_execution_tactic / genericId=200252 / literal=0, wire=0
  const result5 = f.getPreviousFrameExecutionTactic()
  const pinCheck6 = f.enumerationMatch(result5.tacticType, CE.TacticType.StayMotionless)
  f.switchToSelfExecutionStatus(pinCheck6, configId(1082130438), 1n)
  const pinCheck7 = f.equal(result5.tacticalContext, '')
  f.switchToSelfExecutionStatus(pinCheck7, configId(1082130438), 1n)
  const pinCheck8 = f.equal(result5.tacticDuration, 0)
  f.switchToSelfExecutionStatus(pinCheck8, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck12, configId(1082130438), 1n)
  const pinCheck13 = f.equal(result11.onHitEntity, false)
  f.switchToSelfExecutionStatus(pinCheck13, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck16, configId(1082130438), 1n)
  const pinCheck17 = enumListProbe15.onHitEntity
  f.switchToSelfExecutionStatus(pinCheck17, configId(1082130438), 1n)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200307 / literal=1, wire=1
  const result18 = f.whetherTheEntityHasTheSpecifiedUnitStatus(self, wireConfig)
  const pinCheck19 = f.equal(result18, false)
  f.switchToSelfExecutionStatus(pinCheck19, configId(1082130438), 1n)
})

g.boolFilter({
  id: 1082131440,
  name: 'November_AllClientNodesBoolFilterBeyond',
  prefix: true,
  mode: 'beyond'
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
  const pinCheck23 = f.equal(wireStr, '')
  const pinCheck24 = f.equal(wireGuid, guid(0n))
  const pinCheck25 = f.equal(wireConfig, configId(0n))
  const pinCheck26 = f.equal(wirePrefab, prefabId(0n))

  // getBaseObjectOfSpecifiedPreAiming / get_base_object_of_specified_pre_aiming / genericId=200276 / literal=1, wire=1
  const result1 = f.getBaseObjectOfSpecifiedPreAiming(wireInt, CE.PreAimResultDataType.Current)
  const pinCheck2 = f.equal(result1, wireEntity)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe4 = f.getRayDetectionResult(
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
  const pinCheck5 = f.equal(enumListProbe4.onHitLocation, [0, 0, 0])
  const pinCheck6 = f.equal(enumListProbe4.onHitEntity, wireEntity)

  // getPreAimingCollisionDetectionResultCount / get_pre_aiming_collision_detection_result_count / genericId=200280 / literal=1, wire=1
  const result7 = f.getPreAimingCollisionDetectionResultCount(
    wireInt,
    CE.PreAimResultDataType.Current
  )
  const pinCheck8 = f.equal(result7, 0n)

  // getPreAimingDuration / get_pre_aiming_duration / genericId=200278 / literal=2, wire=0
  const result10 = f.getPreAimingDuration(9n, CE.PreAimResultDataType.Current)
  const pinCheck11 = f.equal(result10, 0)

  // getPreAimingRayHitInfo / get_pre_aiming_ray_hit_info / genericId=200281 / literal=1, wire=1
  const result12 = f.getPreAimingRayHitInfo(wireInt, CE.PreAimResultDataType.Current)
  const pinCheck13 = f.equal(result12.hitPosition, [0, 0, 0])
  const pinCheck14 = f.equal(result12.hitEntity, wireEntity)

  // getPreAimingResult / get_pre_aiming_result / genericId=200277 / literal=1, wire=1
  const result15 = f.getPreAimingResult(wireInt, CE.PreAimResultDataType.Current)
  const pinCheck16 = f.equal(result15.hitPosition, [0, 0, 0])
  const pinCheck17 = f.equal(result15.inRangePosition, [0, 0, 0])
  const pinCheck18 = f.equal(result15.bestValidTarget, wireEntity)
  const pinCheck19 = f.greaterThanOrEqualTo(f.getListLength(result15.validTargetList), 0n)

  // getWhetherPreAimingStickIsInDeadZone / get_whether_pre_aiming_stick_is_in_dead_zone / genericId=200282 / literal=2, wire=0
  const result21 = f.getWhetherPreAimingStickIsInDeadZone(20n, CE.PreAimResultDataType.Current)
  const pinCheck22 = f.equal(result21, false)

  const combinedCheck27 = f.logicalAndOperation(pinCheck2, pinCheck5)
  const combinedCheck28 = f.logicalAndOperation(pinCheck6, pinCheck8)
  const combinedCheck29 = f.logicalAndOperation(pinCheck11, pinCheck13)
  const combinedCheck30 = f.logicalAndOperation(pinCheck14, pinCheck16)
  const combinedCheck31 = f.logicalAndOperation(pinCheck17, pinCheck18)
  const combinedCheck32 = f.logicalAndOperation(pinCheck19, pinCheck22)
  const combinedCheck33 = f.logicalAndOperation(pinCheck23, pinCheck24)
  const combinedCheck34 = f.logicalAndOperation(pinCheck25, pinCheck26)
  const combinedCheck35 = f.logicalAndOperation(combinedCheck27, combinedCheck28)
  const combinedCheck36 = f.logicalAndOperation(combinedCheck29, combinedCheck30)
  const combinedCheck37 = f.logicalAndOperation(combinedCheck31, combinedCheck32)
  const combinedCheck38 = f.logicalAndOperation(combinedCheck33, combinedCheck34)
  const combinedCheck39 = f.logicalAndOperation(combinedCheck35, combinedCheck36)
  const combinedCheck40 = f.logicalAndOperation(combinedCheck37, combinedCheck38)
  const combinedCheck41 = f.logicalAndOperation(combinedCheck39, combinedCheck40)
  return combinedCheck41
})

g.intFilter({
  id: 1082131441,
  name: 'November_AllClientNodesIntFilterBeyond',
  prefix: true,
  mode: 'beyond'
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
  const pinCheck25 = f.equal(wireStr, '')
  const pinCheck26 = f.equal(wireGuid, guid(0n))
  const pinCheck27 = f.equal(wireConfig, configId(0n))
  const pinCheck28 = f.equal(wirePrefab, prefabId(0n))

  // getBaseObjectOfSpecifiedPreAiming / get_base_object_of_specified_pre_aiming / genericId=200276 / literal=2, wire=0
  const result2 = f.getBaseObjectOfSpecifiedPreAiming(1n, CE.PreAimResultDataType.Current)
  const pinCheck3 = f.equal(result2, wireEntity)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe5 = f.getRayDetectionResult(
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
  const pinCheck6 = f.equal(enumListProbe5.onHitLocation, [0, 0, 0])
  const pinCheck7 = f.equal(enumListProbe5.onHitEntity, wireEntity)

  // getPreAimingCollisionDetectionResultCount / get_pre_aiming_collision_detection_result_count / genericId=200280 / literal=2, wire=0
  const result9 = f.getPreAimingCollisionDetectionResultCount(8n, CE.PreAimResultDataType.Current)
  const pinCheck10 = f.equal(result9, 0n)

  // getPreAimingDuration / get_pre_aiming_duration / genericId=200278 / literal=1, wire=1
  const result11 = f.getPreAimingDuration(wireInt, CE.PreAimResultDataType.Current)
  const pinCheck12 = f.equal(result11, 0)

  // getPreAimingRayHitInfo / get_pre_aiming_ray_hit_info / genericId=200281 / literal=2, wire=0
  const result14 = f.getPreAimingRayHitInfo(13n, CE.PreAimResultDataType.Current)
  const pinCheck15 = f.equal(result14.hitPosition, [0, 0, 0])
  const pinCheck16 = f.equal(result14.hitEntity, wireEntity)

  // getPreAimingResult / get_pre_aiming_result / genericId=200277 / literal=2, wire=0
  const result18 = f.getPreAimingResult(17n, CE.PreAimResultDataType.Current)
  const pinCheck19 = f.equal(result18.hitPosition, [0, 0, 0])
  const pinCheck20 = f.equal(result18.inRangePosition, [0, 0, 0])
  const pinCheck21 = f.equal(result18.bestValidTarget, wireEntity)
  const pinCheck22 = f.greaterThanOrEqualTo(f.getListLength(result18.validTargetList), 0n)

  // getWhetherPreAimingStickIsInDeadZone / get_whether_pre_aiming_stick_is_in_dead_zone / genericId=200282 / literal=1, wire=1
  const result23 = f.getWhetherPreAimingStickIsInDeadZone(wireInt, CE.PreAimResultDataType.Current)
  const pinCheck24 = f.equal(result23, false)

  const combinedCheck29 = f.logicalAndOperation(pinCheck3, pinCheck6)
  const combinedCheck30 = f.logicalAndOperation(pinCheck7, pinCheck10)
  const combinedCheck31 = f.logicalAndOperation(pinCheck12, pinCheck15)
  const combinedCheck32 = f.logicalAndOperation(pinCheck16, pinCheck19)
  const combinedCheck33 = f.logicalAndOperation(pinCheck20, pinCheck21)
  const combinedCheck34 = f.logicalAndOperation(pinCheck22, pinCheck24)
  const combinedCheck35 = f.logicalAndOperation(pinCheck25, pinCheck26)
  const combinedCheck36 = f.logicalAndOperation(pinCheck27, pinCheck28)
  const combinedCheck37 = f.logicalAndOperation(combinedCheck29, combinedCheck30)
  const combinedCheck38 = f.logicalAndOperation(combinedCheck31, combinedCheck32)
  const combinedCheck39 = f.logicalAndOperation(combinedCheck33, combinedCheck34)
  const combinedCheck40 = f.logicalAndOperation(combinedCheck35, combinedCheck36)
  const combinedCheck41 = f.logicalAndOperation(combinedCheck37, combinedCheck38)
  const combinedCheck42 = f.logicalAndOperation(combinedCheck39, combinedCheck40)
  const combinedCheck43 = f.logicalAndOperation(combinedCheck41, combinedCheck42)
  return f.dataTypeConversion(combinedCheck43, 'int')
})
