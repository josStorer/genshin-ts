/**
 * AUTO-GENERATED exhaustive client-node import fixture (classic).
 *
 * Regenerate: npm run gen:client:manual
 * Build GIA: node ./bin/gsts.mjs tests/manual/client-nodes/classic.ts -c ./gsts.test.config.ts --noinject
 *
 * Graph IDs:
 *   1082130444  AllClientNodesCreationSkillClassic (creation_skill)
 *   1082130445  AllClientNodesCreationStatusClassic (creation_status)
 *   1082130446  AllClientNodesCreationStatusDecisionClassic (creation_status_decision)
 *   1082130449  AllClientNodesBoolFilterClassic (bool_filter)
 *   1082130448  AllClientNodesIntFilterClassic (int_filter)
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
  id: 1082130444,
  name: 'AllClientNodesCreationSkillClassic',
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
  const pinCheck448 = f.equal(wireStr, '')
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck448)
  const pinCheck449 = f.equal(wireGuid, guid(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck449)
  const pinCheck450 = f.equal(wireConfig, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck450)
  const pinCheck451 = f.equal(wirePrefab, prefabId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck451)

  // _3dVectorAddition / _3d_vector_addition / genericId=200071 / literal=2, wire=0
  const result3 = f._3dVectorAddition([1, 2, 3], [2, 3, 4])
  const pinCheck4 = f.equal(result3, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck4)

  // _3dVectorAngle / _3d_vector_angle / genericId=200067 / literal=0, wire=2
  const result7 = f._3dVectorAngle(wireVec3, wireVec3)
  const pinCheck8 = f.equal(result7, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck8)

  // _3dVectorCrossProduct / _3d_vector_cross_product / genericId=200064 / literal=0, wire=2
  const result11 = f._3dVectorCrossProduct(wireVec3, wireVec3)
  const pinCheck12 = f.equal(result11, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck12)

  // _3dVectorDotProduct / _3d_vector_dot_product / genericId=200063 / literal=2, wire=0
  const result15 = f._3dVectorDotProduct([13, 14, 15], [14, 15, 16])
  const pinCheck16 = f.equal(result15, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck16)

  // _3dVectorModuloOperation / _3d_vector_modulo_operation / genericId=200069 / literal=1, wire=0
  const result18 = f._3dVectorModuloOperation([17, 18, 19])
  const pinCheck19 = f.equal(result18, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck19)

  // _3dVectorNormalization / _3d_vector_normalization / genericId=200100 / literal=1, wire=0
  const result21 = f._3dVectorNormalization([20, 21, 22])
  const pinCheck22 = f.equal(result21, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck22)

  // _3dVectorRotation / _3d_vector_rotation / genericId=200068 / literal=1, wire=1
  const result25 = f._3dVectorRotation(wireVec3, [24, 25, 26])
  const pinCheck26 = f.equal(result25, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck26)

  // _3dVectorSubtraction / _3d_vector_subtraction / genericId=200072 / literal=2, wire=0
  const result29 = f._3dVectorSubtraction([27, 28, 29], [28, 29, 30])
  const pinCheck30 = f.equal(result29, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck30)

  // _3dVectorZoom / _3d_vector_zoom / genericId=200066 / literal=0, wire=2
  const result32 = f._3dVectorZoom(wireFloat, wireVec3)
  const pinCheck33 = f.equal(result32, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck33)

  // absoluteValueOperation / absolute_value_operation / genericId=200015 / literal=1, wire=0
  const result35 = f.absoluteValueOperation(34n)
  const pinCheck36 = f.equal(result35, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck36)

  // addition / addition / genericId=200011 / literal=2, wire=0
  const result41 = f.addition(39n, 40n)
  const pinCheck42 = f.equal(result41, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck42)

  // arccosineFunction / arccosine_function / genericId=200098 / literal=1, wire=0
  const result44 = f.arccosineFunction(43.25)
  const pinCheck45 = f.equal(result44, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck45)

  // arcsineFunction / arcsine_function / genericId=200097 / literal=1, wire=0
  const result47 = f.arcsineFunction(46.25)
  const pinCheck48 = f.equal(result47, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck48)

  // arctangentFunction / arctangent_function / genericId=200099 / literal=1, wire=0
  const result50 = f.arctangentFunction(49.25)
  const pinCheck51 = f.equal(result50, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck51)

  // assemblyDictionary / assembly_dictionary / genericId=200152 / literal=1, wire=0
  const pinCheck55 = f.greaterThanOrEqualTo(
    f.queryDictionarySLength(
      f.assemblyDictionary([
        { k: 52n, v: 53n },
        { k: 52n, v: 53n },
        { k: 52n, v: 53n },
        { k: 52n, v: 53n },
        { k: 52n, v: 53n },
        { k: 52n, v: 53n },
        { k: 52n, v: 53n },
        { k: 52n, v: 53n },
        { k: 52n, v: 53n },
        { k: 52n, v: 53n }
      ])
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck55)

  // assemblyList / assembly_list / genericId=200049 / literal=2, wire=0
  const pinCheck58 = f.greaterThanOrEqualTo(
    f.getListLength(f.assemblyList([56n, 56n, 56n, 56n, 56n, 56n, 56n, 56n, 56n, 56n], 'int')),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck58)

  // checkClassicModeCharacterId / check_classic_mode_character_id / genericId=200254 / literal=1, wire=0
  const result59 = f.checkClassicModeCharacterId(self)
  const pinCheck60 = f.equal(result59, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck60)

  // checkThePresetStatusValueOfTheComplexCreation / check_the_preset_status_value_of_the_complex_creation / genericId=200244 / literal=0, wire=2
  const result61 = f.checkThePresetStatusValueOfTheComplexCreation(wireEntity, wireInt)
  const pinCheck62 = f.equal(result61, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck62)

  // cosineFunction / cosine_function / genericId=200095 / literal=0, wire=1
  const result68 = f.cosineFunction(wireFloat)
  const pinCheck69 = f.equal(result68, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck69)

  // create3dVector / create3d_vector / genericId=200070 / literal=3, wire=0
  const result73 = f.create3dVector(70.25, 71.25, 72.25)
  const pinCheck74 = f.equal(result73, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck74)

  // createDictionary / create_dictionary / genericId=200153 / literal=0, wire=2
  const pinCheck76 = f.greaterThanOrEqualTo(
    f.queryDictionarySLength(
      f.createDictionary(
        f.assemblyList(
          [
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt
          ],
          'int'
        ),
        f.assemblyList(
          [
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt
          ],
          'int'
        )
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck76)

  // dataTypeConversion / data_type_conversion / genericId=200022 / literal=1, wire=1
  const result78 = f.dataTypeConversion(wireInt, 'str')
  const pinCheck79 = f.equal(result78, '')
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck79)

  // degreesToRadians / degrees_to_radians / genericId=200102 / literal=1, wire=0
  const result81 = f.degreesToRadians(80.25)
  const pinCheck82 = f.equal(result81, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck82)

  // directionVectorToRotation / direction_vector_to_rotation / genericId=200073 / literal=1, wire=1
  const result85 = f.directionVectorToRotation([83, 84, 85], wireVec3)
  const pinCheck86 = f.equal(result85, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck86)

  // division / division / genericId=200014 / literal=0, wire=2
  const result87 = f.division(wireInt, wireInt)
  const pinCheck88 = f.equal(result87, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck88)

  // enumerationMatch / enumeration_match / genericId=200005 / literal=2, wire=0
  const result89 = f.enumerationMatch(E.SortBy.Ascending, E.SortBy.Ascending)
  const pinCheck90 = f.equal(result89, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck90)

  // equal / equal / genericId=200006 / literal=2, wire=0
  const result93 = f.equal(91n, 92n)
  const pinCheck94 = f.equal(result93, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck94)

  // filterEntityListWithinSphericalRange / filter_entity_list_within_spherical_range / genericId=200043 / literal=3, wire=1
  const pinCheck98 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSphericalRange(
        wireFloat,
        [95, 96, 97],
        96n,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck98)

  // filterEntityListWithinSquareRange / filter_entity_list_within_square_range / genericId=200044 / literal=3, wire=3
  const pinCheck102 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSquareRange(
        wireFloat,
        wireFloat,
        wireFloat,
        [99, 100, 101],
        100n,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck102)

  // getActiveCharacterOfSpecifiedPlayer / get_active_character_of_specified_player / genericId=200251 / literal=1, wire=0
  const result107 = f.getActiveCharacterOfSpecifiedPlayer(self)
  const pinCheck108 = f.equal(result107, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck108)

  // getAllEntitiesWithinTheCollisionTrigger / get_all_entities_within_the_collision_trigger / genericId=200107 / literal=0, wire=2
  const pinCheck110 = f.greaterThanOrEqualTo(
    f.getListLength(f.getAllEntitiesWithinTheCollisionTrigger(wireEntity, wireInt)),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck110)

  // getCorrespondingValueFromList / get_corresponding_value_from_list / genericId=200017 / literal=1, wire=1
  const result112 = f.getCorrespondingValueFromList(
    111n,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck113 = f.equal(result112, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck113)

  // getCreationSCurrentTarget / get_creation_s_current_target / genericId=200221 / literal=1, wire=0
  const result114 = f.getCreationSCurrentTarget(self)
  const pinCheck115 = f.equal(result114, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck115)

  // getCustomVariable / get_custom_variable / genericId=200016 / literal=2, wire=0
  const result117 = f.getCustomVariable(self, 'literal-116')
  const narrowed118 = result117.asType('int')
  const pinCheck119 = f.equal(narrowed118, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck119)

  // getEntityListByUnitTag / get_entity_list_by_unit_tag / genericId=200078 / literal=0, wire=1
  const pinCheck121 = f.greaterThanOrEqualTo(f.getListLength(f.getEntityListByUnitTag(wireInt)), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck121)

  // getEntityLocation / get_entity_location / genericId=200030 / literal=1, wire=0
  const result122 = f.getEntityLocation(self)
  const pinCheck123 = f.equal(result122, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck123)

  // getEntityRotation / get_entity_rotation / genericId=200031 / literal=0, wire=1
  const result124 = f.getEntityRotation(wireEntity)
  const pinCheck125 = f.equal(result124, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck125)

  // getEntitySType / get_entity_s_type / genericId=200045 / literal=0, wire=1
  const result126 = f.getEntitySType(wireEntity)
  const pinCheck127 = f.enumerationMatch(result126, E.EntityType.Stage)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck127)

  // getEntitySUnitTagList / get_entity_s_unit_tag_list / genericId=200077 / literal=0, wire=1
  const pinCheck129 = f.greaterThanOrEqualTo(
    f.getListLength(f.getEntitySUnitTagList(wireEntity)),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck129)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe131 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.None,
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
  const pinCheck132 = f.equal(enumListProbe131.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck132)

  // getListLength / get_list_length / genericId=200018 / literal=0, wire=1
  const result133 = f.getListLength(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck134 = f.equal(result133, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck134)

  // getListOfKeysFromDictionary / get_list_of_keys_from_dictionary / genericId=200159 / literal=0, wire=1
  const pinCheck136 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.getListOfKeysFromDictionary(
        f.assemblyDictionary([
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt }
        ])
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck136)

  // getListOfPlayerEntitiesOnTheField / get_list_of_player_entities_on_the_field / genericId=200026 / literal=0, wire=0
  const pinCheck138 = f.greaterThanOrEqualTo(
    f.getListLength(f.getListOfPlayerEntitiesOnTheField()),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck138)

  // getListOfValuesFromDictionary / get_list_of_values_from_dictionary / genericId=200158 / literal=0, wire=1
  const pinCheck140 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.getListOfValuesFromDictionary(
        f.assemblyDictionary([
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt }
        ])
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck140)

  // getLocalVariable / get_local_variable / genericId=200082 / literal=1, wire=0
  const result142 = f.getLocalVariable('literal-141')
  const narrowed143 = result142.asType('int')
  const pinCheck144 = f.equal(narrowed143, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck144)

  // getMaximumValueFromList / get_maximum_value_from_list / genericId=200020 / literal=0, wire=1
  const result145 = f.getMaximumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck146 = f.equal(result145, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck146)

  // getMinimumValueFromList / get_minimum_value_from_list / genericId=200021 / literal=0, wire=1
  const result147 = f.getMinimumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck148 = f.equal(result147, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck148)

  // getPlayerEntityToWhichTheCharacterBelongs / get_player_entity_to_which_the_character_belongs / genericId=200025 / literal=0, wire=1
  const result149 = f.getPlayerEntityToWhichTheCharacterBelongs(wireEntity)
  const pinCheck150 = f.equal(result149, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck150)

  // getPlayerSCharacterList / get_player_s_character_list / genericId=200242 / literal=1, wire=0
  const pinCheck152 = f.greaterThanOrEqualTo(f.getListLength(f.getPlayerSCharacterList(self)), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck152)

  // getPresetStatus / get_preset_status / genericId=200028 / literal=1, wire=1
  const result154 = f.getPresetStatus(wireEntity, 153n)
  const pinCheck155 = f.equal(result154, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck155)

  // getRandomNumber / get_random_number / genericId=200032 / literal=0, wire=2
  const result156 = f.getRandomNumber(wireInt, wireInt)
  const pinCheck157 = f.equal(result156, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck157)

  // getRayDetectionResult / get_ray_detection_result / genericId=200109 / literal=4, wire=3
  const result161 = f.getRayDetectionResult(
    self,
    [158, 159, 160],
    wireVec3,
    160.25,
    E.TargetType.None,
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
  const pinCheck162 = f.equal(result161.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck162)
  const pinCheck163 = f.equal(result161.onHitEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck163)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200110 / literal=1, wire=0
  const enumListProbe165 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.None,
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
  const pinCheck166 = f.equal(enumListProbe165.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck166)

  // getSelfEntity / get_self_entity / genericId=200033 / literal=0, wire=0
  const result167 = f.getSelfEntity()
  const pinCheck168 = f.equal(result167, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck168)

  // getSubEntityList / get_sub_entity_list / genericId=200214 / literal=1, wire=0
  const pinCheck170 = f.greaterThanOrEqualTo(f.getListLength(f.getSubEntityList(self)), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck170)

  // getTargetAttachmentPointLocation / get_target_attachment_point_location / genericId=200047 / literal=1, wire=1
  const result171 = f.getTargetAttachmentPointLocation(self, wireStr)
  const pinCheck172 = f.equal(result171, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck172)

  // getTargetAttachmentPointRotation / get_target_attachment_point_rotation / genericId=200048 / literal=1, wire=1
  const result174 = f.getTargetAttachmentPointRotation(wireEntity, 'literal-173')
  const pinCheck175 = f.equal(result174, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck175)

  // getTheComplexCreationSCurrentUsingSkill / get_the_complex_creation_s_current_using_skill / genericId=200213 / literal=0, wire=0
  const result176 = f.getTheComplexCreationSCurrentUsingSkill()
  const pinCheck177 = f.equal(result176, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck177)

  // getUnitAttackTarget / get_unit_attack_target / genericId=200035 / literal=0, wire=1
  const result178 = f.getUnitAttackTarget(wireEntity)
  const pinCheck179 = f.equal(result178, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck179)

  // greaterThan / greater_than / genericId=200007 / literal=0, wire=2
  const result180 = f.greaterThan(wireInt, wireInt)
  const pinCheck181 = f.equal(result180, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck181)

  // greaterThanOrEqualTo / greater_than_or_equal_to / genericId=200010 / literal=0, wire=2
  const result182 = f.greaterThanOrEqualTo(wireInt, wireInt)
  const pinCheck183 = f.equal(result182, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck183)

  // lessThan / less_than / genericId=200008 / literal=2, wire=0
  const result187 = f.lessThan(185n, 186n)
  const pinCheck188 = f.equal(result187, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck188)

  // lessThanOrEqualTo / less_than_or_equal_to / genericId=200009 / literal=2, wire=0
  const result191 = f.lessThanOrEqualTo(189n, 190n)
  const pinCheck192 = f.equal(result191, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck192)

  // listIncludesThisValue / list_includes_this_value / genericId=200019 / literal=1, wire=1
  const result194 = f.listIncludesThisValue(
    193n,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck195 = f.equal(result194, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck195)

  // logicalAndOperation / logical_and_operation / genericId=200001 / literal=2, wire=0
  const result198 = f.logicalAndOperation(false, true)
  const pinCheck199 = f.equal(result198, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck199)

  // logicalNotOperation / logical_not_operation / genericId=200003 / literal=0, wire=1
  const result200 = f.logicalNotOperation(wireBool)
  const pinCheck201 = f.equal(result200, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck201)

  // logicalOrOperation / logical_or_operation / genericId=200002 / literal=2, wire=0
  const result204 = f.logicalOrOperation(false, true)
  const pinCheck205 = f.equal(result204, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck205)

  // logicalXorOperation / logical_xor_operation / genericId=200004 / literal=2, wire=0
  const result208 = f.logicalXorOperation(false, true)
  const pinCheck209 = f.equal(result208, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck209)

  // multiplication / multiplication / genericId=200013 / literal=2, wire=0
  const result212 = f.multiplication(210n, 211n)
  const pinCheck213 = f.equal(result212, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck213)

  // orientationToRotation / orientation_to_rotation / genericId=200074 / literal=1, wire=0
  const result215 = f.orientationToRotation([214, 215, 216])
  const pinCheck216 = f.equal(result215, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck216)

  // queryDictionarySLength / query_dictionary_s_length / genericId=200157 / literal=0, wire=1
  const result221 = f.queryDictionarySLength(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ])
  )
  const pinCheck222 = f.equal(result221, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck222)

  // queryDictionaryValueByKey / query_dictionary_value_by_key / genericId=200154 / literal=1, wire=1
  const result224 = f.queryDictionaryValueByKey(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    223n
  )
  const pinCheck225 = f.equal(result224, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck225)

  // queryEntityByGuid / query_entity_by_guid / genericId=200023 / literal=0, wire=1
  const result226 = f.queryEntityByGuid(wireGuid)
  const pinCheck227 = f.equal(result226, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck227)

  // queryEntityFaction / query_entity_faction / genericId=200029 / literal=1, wire=0
  const result228 = f.queryEntityFaction(self)
  const pinCheck229 = f.equal(result228, faction(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck229)

  // queryGuidByEntity / query_guid_by_entity / genericId=200027 / literal=0, wire=1
  const result230 = f.queryGuidByEntity(wireEntity)
  const pinCheck231 = f.equal(result230, guid(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck231)

  // queryIfDictionaryContainsSpecificKey / query_if_dictionary_contains_specific_key / genericId=200155 / literal=1, wire=1
  const result233 = f.queryIfDictionaryContainsSpecificKey(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    232n
  )
  const pinCheck234 = f.equal(result233, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck234)

  // queryIfDictionaryContainsSpecificValue / query_if_dictionary_contains_specific_value / genericId=200156 / literal=1, wire=1
  const result236 = f.queryIfDictionaryContainsSpecificValue(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    235n
  )
  const pinCheck237 = f.equal(result236, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck237)

  // queryIfEntityIsOnTheField / query_if_entity_is_on_the_field / genericId=200103 / literal=0, wire=1
  const result238 = f.queryIfEntityIsOnTheField(wireEntity)
  const pinCheck239 = f.equal(result238, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck239)

  // queryIfFactionIsHostile / query_if_faction_is_hostile / genericId=200093 / literal=0, wire=2
  const result240 = f.queryIfFactionIsHostile(wireFaction, wireFaction)
  const pinCheck241 = f.equal(result240, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck241)

  // querySkillVariableValue / query_skill_variable_value / genericId=200259 / literal=1, wire=0
  const result243 = f.querySkillVariableValue(configId(242n))
  const pinCheck244 = f.equal(result243, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck244)

  // radiansToDegrees / radians_to_degrees / genericId=200101 / literal=1, wire=0
  const result246 = f.radiansToDegrees(245.25)
  const pinCheck247 = f.equal(result246, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck247)

  // sineFunction / sine_function / genericId=200094 / literal=0, wire=1
  const result260 = f.sineFunction(wireFloat)
  const pinCheck261 = f.equal(result260, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck261)

  // split3dVector / split3d_vector / genericId=200065 / literal=1, wire=0
  const result263 = f.split3dVector([262, 263, 264])
  const pinCheck264 = f.equal(result263.xComponent, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck264)
  const pinCheck265 = f.equal(result263.yComponent, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck265)
  const pinCheck266 = f.equal(result263.zComponent, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck266)

  // subtraction / subtraction / genericId=200012 / literal=2, wire=0
  const result269 = f.subtraction(267n, 268n)
  const pinCheck270 = f.equal(result269, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck270)

  // tangentFunction / tangent_function / genericId=200096 / literal=0, wire=1
  const result271 = f.tangentFunction(wireFloat)
  const pinCheck272 = f.equal(result271, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck272)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200243 / literal=1, wire=1
  const result446 = f.whetherTheEntityHasTheSpecifiedUnitStatus(wireEntity, configId(445n))
  const pinCheck447 = f.equal(result446, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck447)

  // addUnitStatus / add_unit_status / genericId=200057 / literal=2, wire=1
  f.addUnitStatus(wireEntity, 37n, configId(38n))

  // breakLoop is emitted by finiteLoop/traverseEntityList callbacks below.

  // complexCreationDirectedMovement / complex_creation_directed_movement / genericId=200248 / literal=2, wire=2
  f.complexCreationDirectedMovement(wireVec3, wireFloat, 64.25, true)

  // complexCreationTeleport / complex_creation_teleport / genericId=200247 / literal=0, wire=2
  f.complexCreationTeleport(wireVec3, wireVec3)

  // creationTurnsToFaceSetDirection / creation_turns_to_face_set_direction / genericId=200245 / literal=0, wire=1
  f.creationTurnsToFaceSetDirection(wireVec3)

  // doubleBranch / double_branch / genericId=200056 / literal=0, wire=1
  f.doubleBranch(
    wireBool,
    () => {},
    () => {}
  )

  // finiteLoop / finite_loop / genericId=200079 / literal=0, wire=2
  f.finiteLoop(wireInt, wireInt, (loopValue, breakLoop) => {
    f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', f.equal(loopValue, 0n))
    breakLoop()
  })

  // fixedPointProjectileLaunch / fixed_point_projectile_launch / genericId=200052 / literal=3, wire=2
  f.fixedPointProjectileLaunch(prefabId(103n), wireVec3, wireVec3, self, faction(106n))

  // increaseSkillVariableValue / increase_skill_variable_value / genericId=200258 / literal=1, wire=1
  f.increaseSkillVariableValue(configId(184n), wireFloat)

  // playTimedEffects / play_timed_effects / genericId=200038 / literal=3, wire=2
  f.playTimedEffects(configId(217n), [218, 219, 220], wireVec3, wireFloat, false)

  // recoverCreationSHp / recover_creation_s_hp / genericId=200249 / literal=1, wire=2
  f.recoverCreationSHp(wireEntity, wireFloat, false)

  // removeSpecifiedCharacterDisruptorDevice / remove_specified_character_disruptor_device / genericId=200060 / literal=1, wire=0
  f.removeSpecifiedCharacterDisruptorDevice(E.DisruptorDeviceType.ForceFieldDevice)

  // removeUnitStatus / remove_unit_status / genericId=200058 / literal=2, wire=0
  f.removeUnitStatus(self, configId(249n))

  // resetsTheCreationSSkillCd / resets_the_creation_s_skill_cd / genericId=200215 / literal=1, wire=0
  f.resetsTheCreationSSkillCd(250n)

  // sendSignalToServerNodeGraph / send_signal_to_server_node_graph / genericId=200124 / literal=1, wire=9
  f.sendSignalToServerNodeGraph(
    ManualClientPinSignal,
    wireBool,
    wireInt,
    wireFloat,
    wireStr,
    wireVec3,
    wireGuid,
    wireEntity,
    wirePrefab,
    wireConfig
  )

  // setLocalVariable / set_local_variable / genericId=200081 / literal=1, wire=1
  f.setLocalVariable('literal-251', wireInt)

  // setSkillVariable / set_skill_variable / genericId=200257 / literal=2, wire=0
  f.setSkillVariable(configId(252n), 253.25)

  // setTheCdOfTheCreationSkill / set_the_cd_of_the_creation_skill / genericId=200217 / literal=2, wire=1
  f.setTheCdOfTheCreationSkill(wireInt, 254.25, 255.25)

  // setTheCurrentCdOfTheCreationSkill / set_the_current_cd_of_the_creation_skill / genericId=200216 / literal=1, wire=1
  f.setTheCurrentCdOfTheCreationSkill(256n, wireFloat)

  // setTheCurrentTimeOfTheCreationCooldownGroup / set_the_current_time_of_the_creation_cooldown_group / genericId=200218 / literal=2, wire=0
  f.setTheCurrentTimeOfTheCreationCooldownGroup(257n, 258.25)

  // setTheGlobalCdOfTheCreation / set_the_global_cd_of_the_creation / genericId=200220 / literal=1, wire=0
  f.setTheGlobalCdOfTheCreation(259.25)

  // setTheTimeOfTheCreationCooldownGroup / set_the_time_of_the_creation_cooldown_group / genericId=200219 / literal=0, wire=3
  f.setTheTimeOfTheCreationCooldownGroup(wireInt, wireFloat, wireFloat)

  // traverseEntityList / traverse_entity_list / genericId=200055 / literal=0, wire=1
  f.traverseEntityList(
    f.assemblyList(
      [
        wireEntity,
        wireEntity,
        wireEntity,
        wireEntity,
        wireEntity,
        wireEntity,
        wireEntity,
        wireEntity,
        wireEntity,
        wireEntity
      ],
      'entity'
    ),
    (currentEntity, breakLoop) => {
      f.sendSignalToServerNodeGraph(
        'gsts_all_client_pin_anchor',
        f.equal(currentEntity, wireEntity)
      )
      breakLoop()
    }
  )

  // triggerHitboxAtSpecificLocation / trigger_hitbox_at_specific_location / genericId=200051 / literal=34, wire=4
  f.triggerHitboxAtSpecificLocation(
    E.TargetType.None,
    wireVec3,
    [274, 275, 276],
    275.25,
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
    E.TriggerRestriction.TriggerOnlyOnce,
    276n,
    E.AttackShape.Rectangle,
    [277, 278, 279],
    278.25,
    279.25,
    280.25,
    281.25,
    282.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    283.25,
    E.HitType.None,
    E.AttackType.None,
    284.25,
    true,
    286n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [288, 289, 290],
    [289, 290, 291],
    290.25,
    [291, 292, 293],
    [292, 293, 294],
    293.25,
    wireFloat,
    294n,
    CE.HitLevel.NoEffect,
    295.25,
    296.25
  )

  // triggerHitboxAtSpecifiedAttachmentPoint / trigger_hitbox_at_specified_attachment_point / genericId=200059 / literal=35, wire=4
  f.triggerHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-297',
    wireVec3,
    wireVec3,
    wireFloat,
    300.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    301n,
    E.AttackShape.Rectangle,
    [302, 303, 304],
    303.25,
    304.25,
    305.25,
    306.25,
    307.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    308.25,
    E.HitType.None,
    E.AttackType.None,
    309.25,
    false,
    311n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [313, 314, 315],
    [314, 315, 316],
    315.25,
    [316, 317, 318],
    [317, 318, 319],
    318.25,
    319.25,
    wireInt,
    CE.HitLevel.NoEffect,
    320.25,
    321.25
  )

  // triggerRectangularHitboxAtSpecificLocation / trigger_rectangular_hitbox_at_specific_location / genericId=200112 / literal=27, wire=4
  f.triggerRectangularHitboxAtSpecificLocation(
    E.TargetType.None,
    wireVec3,
    [323, 324, 325],
    324.25,
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
    E.TriggerRestriction.TriggerOnlyOnce,
    325n,
    [326, 327, 328],
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    327.25,
    E.HitType.None,
    E.AttackType.None,
    328.25,
    true,
    330n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [332, 333, 334],
    [333, 334, 335],
    334.25,
    [335, 336, 337],
    [336, 337, 338],
    337.25,
    wireFloat,
    338n,
    CE.HitLevel.NoEffect,
    339.25,
    340.25
  )

  // triggerRectangularHitboxAtSpecifiedAttachmentPoint / trigger_rectangular_hitbox_at_specified_attachment_point / genericId=200115 / literal=28, wire=4
  f.triggerRectangularHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-341',
    wireVec3,
    wireVec3,
    wireFloat,
    344.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    345n,
    [346, 347, 348],
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    347.25,
    E.HitType.None,
    E.AttackType.None,
    348.25,
    true,
    350n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [352, 353, 354],
    [353, 354, 355],
    354.25,
    [355, 356, 357],
    [356, 357, 358],
    357.25,
    358.25,
    wireInt,
    CE.HitLevel.NoEffect,
    359.25,
    360.25
  )

  // triggerSectorHitboxAtSpecificLocation / trigger_sector_hitbox_at_specific_location / genericId=200113 / literal=31, wire=4
  f.triggerSectorHitboxAtSpecificLocation(
    E.TargetType.None,
    wireVec3,
    [362, 363, 364],
    363.25,
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
    E.TriggerRestriction.TriggerOnlyOnce,
    364n,
    365.25,
    366.25,
    367.25,
    368.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    369.25,
    E.HitType.None,
    E.AttackType.None,
    370.25,
    true,
    372n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [374, 375, 376],
    [375, 376, 377],
    376.25,
    [377, 378, 379],
    [378, 379, 380],
    379.25,
    380.25,
    wireInt,
    CE.HitLevel.NoEffect,
    381.25,
    382.25
  )

  // triggerSectorHitboxAtSpecifiedAttachmentPoint / trigger_sector_hitbox_at_specified_attachment_point / genericId=200116 / literal=32, wire=4
  f.triggerSectorHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-383',
    wireVec3,
    wireVec3,
    wireFloat,
    386.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    387n,
    388.25,
    389.25,
    390.25,
    391.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    392.25,
    E.HitType.None,
    E.AttackType.None,
    393.25,
    false,
    395n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [397, 398, 399],
    [398, 399, 400],
    399.25,
    [400, 401, 402],
    [401, 402, 403],
    402.25,
    wireFloat,
    403n,
    CE.HitLevel.NoEffect,
    404.25,
    405.25
  )

  // triggerSphericalHitboxAtSpecificLocation / trigger_spherical_hitbox_at_specific_location / genericId=200111 / literal=28, wire=3
  f.triggerSphericalHitboxAtSpecificLocation(
    E.TargetType.None,
    [406, 407, 408],
    wireVec3,
    wireFloat,
    408.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    409n,
    410.25,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    411.25,
    E.HitType.None,
    E.AttackType.None,
    412.25,
    true,
    414n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [416, 417, 418],
    [417, 418, 419],
    418.25,
    [419, 420, 421],
    [420, 421, 422],
    421.25,
    422.25,
    wireInt,
    CE.HitLevel.NoEffect,
    423.25,
    424.25
  )

  // triggerSphericalHitboxAtSpecifiedAttachmentPoint / trigger_spherical_hitbox_at_specified_attachment_point / genericId=200114 / literal=29, wire=3
  f.triggerSphericalHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-425',
    [426, 427, 428],
    [427, 428, 429],
    428.25,
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
    E.TriggerRestriction.TriggerOnlyOnce,
    429n,
    430.25,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    431.25,
    E.HitType.None,
    E.AttackType.None,
    432.25,
    true,
    434n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [436, 437, 438],
    [437, 438, 439],
    438.25,
    [439, 440, 441],
    [440, 441, 442],
    441.25,
    wireFloat,
    442n,
    CE.HitLevel.NoEffect,
    443.25,
    444.25
  )
})

g.creationStatus({
  id: 1082130445,
  name: 'AllClientNodesCreationStatusClassic',
  prefix: true,
  mode: 'classic'
}).on('start1', (_evt, f) => {
  const wireEntity = f.getSelfEntity()
  const wireBool = f.equal(101n, 101n)
  const wireInt = f.addition(101n, 202n)
  const wireFloat = f.addition(1.25, 2.5)
  const wireVec3 = f.create3dVector(1, 2, 3)
  const wireFaction = f.queryEntityFaction(CE.TargetEntity.AggroTarget)
  const wireStr = f
    .getCustomVariable(CE.TargetEntity.AggroTarget, 'gsts_manual_wire_str')
    .asType('str')
  const wireGuid = f
    .getCustomVariable(CE.TargetEntity.AggroTarget, 'gsts_manual_wire_guid')
    .asType('guid')
  const wireConfig = f
    .getCustomVariable(CE.TargetEntity.AggroTarget, 'gsts_manual_wire_config')
    .asType('config_id')
  const wirePrefab = f
    .getCustomVariable(CE.TargetEntity.AggroTarget, 'gsts_manual_wire_prefab')
    .asType('prefab_id')
  const pinCheck325 = f.equal(wireStr, '')
  f.executeSkill(pinCheck325, 1n)
  const pinCheck326 = f.equal(wireGuid, guid(0n))
  f.executeSkill(pinCheck326, 1n)
  const pinCheck327 = f.equal(wireConfig, configId(0n))
  f.executeSkill(pinCheck327, 1n)
  const pinCheck328 = f.equal(wirePrefab, prefabId(0n))
  f.executeSkill(pinCheck328, 1n)

  // _3dVectorAddition / _3d_vector_addition / genericId=200200 / literal=0, wire=2
  const result3 = f._3dVectorAddition(wireVec3, wireVec3)
  const pinCheck4 = f.equal(result3, [0, 0, 0])
  f.executeSkill(pinCheck4, 1n)

  // _3dVectorAngle / _3d_vector_angle / genericId=200196 / literal=2, wire=0
  const result7 = f._3dVectorAngle([5, 6, 7], [6, 7, 8])
  const pinCheck8 = f.equal(result7, 0)
  f.executeSkill(pinCheck8, 1n)

  // _3dVectorCrossProduct / _3d_vector_cross_product / genericId=200193 / literal=2, wire=0
  const result11 = f._3dVectorCrossProduct([9, 10, 11], [10, 11, 12])
  const pinCheck12 = f.equal(result11, [0, 0, 0])
  f.executeSkill(pinCheck12, 1n)

  // _3dVectorDotProduct / _3d_vector_dot_product / genericId=200192 / literal=0, wire=2
  const result15 = f._3dVectorDotProduct(wireVec3, wireVec3)
  const pinCheck16 = f.equal(result15, 0)
  f.executeSkill(pinCheck16, 1n)

  // _3dVectorModuloOperation / _3d_vector_modulo_operation / genericId=200198 / literal=0, wire=1
  const result18 = f._3dVectorModuloOperation(wireVec3)
  const pinCheck19 = f.equal(result18, 0)
  f.executeSkill(pinCheck19, 1n)

  // _3dVectorNormalization / _3d_vector_normalization / genericId=200210 / literal=0, wire=1
  const result21 = f._3dVectorNormalization(wireVec3)
  const pinCheck22 = f.equal(result21, [0, 0, 0])
  f.executeSkill(pinCheck22, 1n)

  // _3dVectorRotation / _3d_vector_rotation / genericId=200197 / literal=1, wire=1
  const result25 = f._3dVectorRotation([23, 24, 25], wireVec3)
  const pinCheck26 = f.equal(result25, [0, 0, 0])
  f.executeSkill(pinCheck26, 1n)

  // _3dVectorSubtraction / _3d_vector_subtraction / genericId=200201 / literal=0, wire=2
  const result29 = f._3dVectorSubtraction(wireVec3, wireVec3)
  const pinCheck30 = f.equal(result29, [0, 0, 0])
  f.executeSkill(pinCheck30, 1n)

  // _3dVectorZoom / _3d_vector_zoom / genericId=200195 / literal=2, wire=0
  const result33 = f._3dVectorZoom(31.25, [32, 33, 34])
  const pinCheck34 = f.equal(result33, [0, 0, 0])
  f.executeSkill(pinCheck34, 1n)

  // absoluteValueOperation / absolute_value_operation / genericId=200188 / literal=0, wire=1
  const result35 = f.absoluteValueOperation(wireInt)
  const pinCheck36 = f.equal(result35, 0n)
  f.executeSkill(pinCheck36, 1n)

  // addition / addition / genericId=200184 / literal=0, wire=2
  const result37 = f.addition(wireInt, wireInt)
  const pinCheck38 = f.equal(result37, 0n)
  f.executeSkill(pinCheck38, 1n)

  // arccosineFunction / arccosine_function / genericId=200208 / literal=0, wire=1
  const result39 = f.arccosineFunction(wireFloat)
  const pinCheck40 = f.equal(result39, 0)
  f.executeSkill(pinCheck40, 1n)

  // arcsineFunction / arcsine_function / genericId=200207 / literal=0, wire=1
  const result41 = f.arcsineFunction(wireFloat)
  const pinCheck42 = f.equal(result41, 0)
  f.executeSkill(pinCheck42, 1n)

  // arctangentFunction / arctangent_function / genericId=200209 / literal=0, wire=1
  const result43 = f.arctangentFunction(wireFloat)
  const pinCheck44 = f.equal(result43, 0)
  f.executeSkill(pinCheck44, 1n)

  // assemblyDictionary / assembly_dictionary / genericId=200228 / literal=0, wire=1
  const pinCheck46 = f.greaterThanOrEqualTo(
    f.queryDictionarySLength(
      f.assemblyDictionary([
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt }
      ])
    ),
    0n
  )
  f.executeSkill(pinCheck46, 1n)

  // assemblyList / assembly_list / genericId=200191 / literal=1, wire=1
  const pinCheck48 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.assemblyList(
        [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
        'int'
      )
    ),
    0n
  )
  f.executeSkill(pinCheck48, 1n)

  // checkIfSelfIsInTheTerritory / check_if_self_is_in_the_territory / genericId=200151 / literal=0, wire=0
  const result49 = f.checkIfSelfIsInTheTerritory()
  const pinCheck50 = f.equal(result49, false)
  f.executeSkill(pinCheck50, 1n)

  // checkTargetPositionPathfindingAvailability / check_target_position_pathfinding_availability / genericId=200148 / literal=0, wire=0
  const result51 = f.checkTargetPositionPathfindingAvailability()
  const pinCheck52 = f.equal(result51, false)
  f.executeSkill(pinCheck52, 1n)

  // checkTheCoordinatesWhenEnteringBattle / check_the_coordinates_when_entering_battle / genericId=200162 / literal=0, wire=0
  const result53 = f.checkTheCoordinatesWhenEnteringBattle()
  const pinCheck54 = f.equal(result53.enteringBattlePosition, [0, 0, 0])
  f.executeSkill(pinCheck54, 1n)
  const pinCheck55 = f.equal(result53.enteringBattleRotation, [0, 0, 0])
  f.executeSkill(pinCheck55, 1n)

  // checkTheDistanceFromSelfToTarget / check_the_distance_from_self_to_target / genericId=200147 / literal=0, wire=0
  const result56 = f.checkTheDistanceFromSelfToTarget()
  const pinCheck57 = f.equal(result56, 0)
  f.executeSkill(pinCheck57, 1n)

  // checkTheHorizontalAngleFromSelfToTarget / check_the_horizontal_angle_from_self_to_target / genericId=200143 / literal=0, wire=0
  const result58 = f.checkTheHorizontalAngleFromSelfToTarget()
  const pinCheck59 = f.equal(result58, 0)
  f.executeSkill(pinCheck59, 1n)

  // checkTheHorizontalDistanceFromSelfToTarget / check_the_horizontal_distance_from_self_to_target / genericId=200145 / literal=0, wire=0
  const result60 = f.checkTheHorizontalDistanceFromSelfToTarget()
  const pinCheck61 = f.equal(result60, 0)
  f.executeSkill(pinCheck61, 1n)

  // checkTheVerticalAngleFromSelfToTarget / check_the_vertical_angle_from_self_to_target / genericId=200144 / literal=0, wire=0
  const result62 = f.checkTheVerticalAngleFromSelfToTarget()
  const pinCheck63 = f.equal(result62, 0)
  f.executeSkill(pinCheck63, 1n)

  // checkTheVerticalDistanceFromSelfToTarget / check_the_vertical_distance_from_self_to_target / genericId=200146 / literal=0, wire=0
  const result64 = f.checkTheVerticalDistanceFromSelfToTarget()
  const pinCheck65 = f.equal(result64, 0)
  f.executeSkill(pinCheck65, 1n)

  // checkWhetherSelfIsInBattle / check_whether_self_is_in_battle / genericId=200150 / literal=0, wire=0
  const result66 = f.checkWhetherSelfIsInBattle()
  const pinCheck67 = f.equal(result66, false)
  f.executeSkill(pinCheck67, 1n)

  // checkWhetherSelfIsUsingASkill / check_whether_self_is_using_a_skill / genericId=200149 / literal=0, wire=0
  const result68 = f.checkWhetherSelfIsUsingASkill()
  const pinCheck69 = f.equal(result68.isTheUnitUsingASkill, false)
  f.executeSkill(pinCheck69, 1n)
  const pinCheck70 = f.equal(result68.skillID, 0n)
  f.executeSkill(pinCheck70, 1n)

  // cosineFunction / cosine_function / genericId=200205 / literal=1, wire=0
  const result72 = f.cosineFunction(71.25)
  const pinCheck73 = f.equal(result72, 0)
  f.executeSkill(pinCheck73, 1n)

  // create3dVector / create3d_vector / genericId=200199 / literal=0, wire=3
  const result74 = f.create3dVector(wireFloat, wireFloat, wireFloat)
  const pinCheck75 = f.equal(result74, [0, 0, 0])
  f.executeSkill(pinCheck75, 1n)

  // createDictionary / create_dictionary / genericId=200229 / literal=0, wire=2
  const pinCheck77 = f.greaterThanOrEqualTo(
    f.queryDictionarySLength(
      f.createDictionary(
        f.assemblyList(
          [
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt
          ],
          'int'
        ),
        f.assemblyList(
          [
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt
          ],
          'int'
        )
      )
    ),
    0n
  )
  f.executeSkill(pinCheck77, 1n)

  // dataTypeConversion / data_type_conversion / genericId=200189 / literal=2, wire=0
  const result79 = f.dataTypeConversion(78n, 'str')
  const pinCheck80 = f.equal(result79, '')
  f.executeSkill(pinCheck80, 1n)

  // degreesToRadians / degrees_to_radians / genericId=200212 / literal=0, wire=1
  const result81 = f.degreesToRadians(wireFloat)
  const pinCheck82 = f.equal(result81, 0)
  f.executeSkill(pinCheck82, 1n)

  // directionVectorToRotation / direction_vector_to_rotation / genericId=200202 / literal=1, wire=1
  const result85 = f.directionVectorToRotation(wireVec3, [84, 85, 86])
  const pinCheck86 = f.equal(result85, [0, 0, 0])
  f.executeSkill(pinCheck86, 1n)

  // division / division / genericId=200187 / literal=2, wire=0
  const result89 = f.division(87n, 88n)
  const pinCheck90 = f.equal(result89, 0n)
  f.executeSkill(pinCheck90, 1n)

  // enumerationMatch / enumeration_match / genericId=200178 / literal=2, wire=0
  const result92 = f.enumerationMatch(E.SortBy.Ascending, E.SortBy.Ascending)
  const pinCheck93 = f.equal(result92, false)
  f.executeSkill(pinCheck93, 1n)

  // equal / equal / genericId=200179 / literal=0, wire=2
  const result94 = f.equal(wireInt, wireInt)
  const pinCheck95 = f.equal(result94, false)
  f.executeSkill(pinCheck95, 1n)

  // getCorrespondingValueFromList / get_corresponding_value_from_list / genericId=200222 / literal=0, wire=2
  const result96 = f.getCorrespondingValueFromList(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck97 = f.equal(result96, 0n)
  f.executeSkill(pinCheck97, 1n)

  // getCurrentExecutionStatus / get_current_execution_status / genericId=200142 / literal=0, wire=0
  const result98 = f.getCurrentExecutionStatus()
  const pinCheck99 = f.equal(result98, configId(0n))
  f.executeSkill(pinCheck99, 1n)

  // getCustomVariable / get_custom_variable / genericId=200173 / literal=1, wire=1
  const result100 = f.getCustomVariable(CE.TargetEntity.AggroTarget, wireStr)
  const narrowed101 = result100.asType('int')
  const pinCheck102 = f.equal(narrowed101, 0n)
  f.executeSkill(pinCheck102, 1n)

  // getEntityLocation / get_entity_location / genericId=200169 / literal=1, wire=0
  const result103 = f.getEntityLocation(CE.TargetEntity.AggroTarget)
  const pinCheck104 = f.equal(result103, [0, 0, 0])
  f.executeSkill(pinCheck104, 1n)

  // getEntityRotation / get_entity_rotation / genericId=200170 / literal=1, wire=0
  const result105 = f.getEntityRotation(CE.TargetEntity.AggroTarget)
  const pinCheck106 = f.equal(result105, [0, 0, 0])
  f.executeSkill(pinCheck106, 1n)

  // getEntitySType / get_entity_s_type / genericId=200168 / literal=1, wire=0
  const result107 = f.getEntitySType(CE.TargetEntity.AggroTarget)
  const pinCheck108 = f.enumerationMatch(result107, E.EntityType.Stage)
  f.executeSkill(pinCheck108, 1n)

  // getEntityTypeList / get_entity_type_list / genericId=200312 / literal=1, wire=0
  const enumListProbe110 = f.getRayDetectionResult(
    CE.TargetEntity.AggroTarget,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.None,
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
  const pinCheck111 = f.equal(enumListProbe110.onHitLocation, [0, 0, 0])
  f.executeSkill(pinCheck111, 1n)

  // getListLength / get_list_length / genericId=200223 / literal=0, wire=1
  const result112 = f.getListLength(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck113 = f.equal(result112, 0n)
  f.executeSkill(pinCheck113, 1n)

  // getListOfKeysFromDictionary / get_list_of_keys_from_dictionary / genericId=200235 / literal=0, wire=1
  const pinCheck115 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.getListOfKeysFromDictionary(
        f.assemblyDictionary([
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt }
        ])
      )
    ),
    0n
  )
  f.executeSkill(pinCheck115, 1n)

  // getListOfValuesFromDictionary / get_list_of_values_from_dictionary / genericId=200234 / literal=0, wire=1
  const pinCheck117 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.getListOfValuesFromDictionary(
        f.assemblyDictionary([
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt }
        ])
      )
    ),
    0n
  )
  f.executeSkill(pinCheck117, 1n)

  // getMaximumValueFromList / get_maximum_value_from_list / genericId=200225 / literal=0, wire=1
  const result118 = f.getMaximumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck119 = f.equal(result118, 0n)
  f.executeSkill(pinCheck119, 1n)

  // getMinimumValueFromList / get_minimum_value_from_list / genericId=200226 / literal=0, wire=1
  const result120 = f.getMinimumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck121 = f.equal(result120, 0n)
  f.executeSkill(pinCheck121, 1n)

  // getObjectPresetStatus / get_object_preset_status / genericId=200172 / literal=2, wire=0
  const result123 = f.getObjectPresetStatus(CE.TargetEntity.AggroTarget, 122n)
  const pinCheck124 = f.equal(result123, 0n)
  f.executeSkill(pinCheck124, 1n)

  // getPreviousFrameExecutionStatus / get_previous_frame_execution_status / genericId=200250 / literal=0, wire=0
  const result125 = f.getPreviousFrameExecutionStatus()
  const pinCheck126 = f.equal(result125, configId(0n))
  f.executeSkill(pinCheck126, 1n)

  // getPreviousFrameExecutionTactic / get_previous_frame_execution_tactic / genericId=200252 / literal=0, wire=0
  const result127 = f.getPreviousFrameExecutionTactic()
  const pinCheck128 = f.enumerationMatch(result127.tacticType, CE.TacticType.None)
  f.executeSkill(pinCheck128, 1n)
  const pinCheck129 = f.equal(result127.tacticalContext, '')
  f.executeSkill(pinCheck129, 1n)
  const pinCheck130 = f.equal(result127.tacticDuration, 0)
  f.executeSkill(pinCheck130, 1n)

  // getRandomNumber / get_random_number / genericId=200190 / literal=2, wire=0
  const result133 = f.getRandomNumber(131n, 132n)
  const pinCheck134 = f.equal(result133, 0n)
  f.executeSkill(pinCheck134, 1n)

  // getRayDetectionResult / get_ray_detection_result / genericId=200301 / literal=5, wire=2
  const result137 = f.getRayDetectionResult(
    CE.TargetEntity.AggroTarget,
    wireVec3,
    [136, 137, 138],
    wireFloat,
    E.TargetType.None,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    [
      CE.RayHitFilterType.Hurtbox,
      CE.RayHitFilterType.Scene,
      CE.RayHitFilterType.ObjectSelfCollision
    ]
  )
  const pinCheck138 = f.equal(result137.onHitLocation, [0, 0, 0])
  f.executeSkill(pinCheck138, 1n)
  const pinCheck139 = f.equal(result137.onHitEntity, false)
  f.executeSkill(pinCheck139, 1n)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200302 / literal=1, wire=0
  const enumListProbe141 = f.getRayDetectionResult(
    CE.TargetEntity.AggroTarget,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.None,
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
  const pinCheck142 = f.equal(enumListProbe141.onHitLocation, [0, 0, 0])
  f.executeSkill(pinCheck142, 1n)

  // getSelfEntity / get_self_entity / genericId=200164 / literal=0, wire=0
  const result143 = f.getSelfEntity()
  const pinCheck144 = f.equal(result143, wireEntity)
  f.executeSkill(pinCheck144, 1n)

  // getSelfPresetStatusValue / get_self_preset_status_value / genericId=200241 / literal=0, wire=1
  const result145 = f.getSelfPresetStatusValue(wireInt)
  const pinCheck146 = f.equal(result145, 0n)
  f.executeSkill(pinCheck146, 1n)

  // getSpawnPointLocationInformation / get_spawn_point_location_information / genericId=200163 / literal=0, wire=0
  const result147 = f.getSpawnPointLocationInformation()
  const pinCheck148 = f.equal(result147.spawnPointCoordinates, [0, 0, 0])
  f.executeSkill(pinCheck148, 1n)
  const pinCheck149 = f.equal(result147.spawnPointRotation, [0, 0, 0])
  f.executeSkill(pinCheck149, 1n)

  // getStageEntity / get_stage_entity / genericId=200166 / literal=0, wire=0
  const result150 = f.getStageEntity()
  const pinCheck151 = f.equal(result150, wireEntity)
  f.executeSkill(pinCheck151, 1n)

  // getTargetAtk / get_target_atk / genericId=200240 / literal=1, wire=0
  const result152 = f.getTargetAtk(CE.TargetEntity.AggroTarget)
  const pinCheck153 = f.equal(result152.baseATK, 0)
  f.executeSkill(pinCheck153, 1n)
  const pinCheck154 = f.equal(result152.currentATK, 0)
  f.executeSkill(pinCheck154, 1n)

  // getTargetEntity / get_target_entity / genericId=200165 / literal=0, wire=0
  const result155 = f.getTargetEntity()
  const pinCheck156 = f.equal(result155, wireEntity)
  f.executeSkill(pinCheck156, 1n)

  // getTargetHp / get_target_hp / genericId=200238 / literal=1, wire=0
  const result157 = f.getTargetHp(CE.TargetEntity.AggroTarget)
  const pinCheck158 = f.equal(result157.baseHP, 0)
  f.executeSkill(pinCheck158, 1n)
  const pinCheck159 = f.equal(result157.maxHP, 0)
  f.executeSkill(pinCheck159, 1n)
  const pinCheck160 = f.equal(result157.currentHPPercentage, 0)
  f.executeSkill(pinCheck160, 1n)

  // getTargetLevel / get_target_level / genericId=200239 / literal=1, wire=0
  const result161 = f.getTargetLevel(CE.TargetEntity.AggroTarget)
  const pinCheck162 = f.equal(result161, 0n)
  f.executeSkill(pinCheck162, 1n)

  // greaterThan / greater_than / genericId=200180 / literal=2, wire=0
  const result165 = f.greaterThan(163n, 164n)
  const pinCheck166 = f.equal(result165, false)
  f.executeSkill(pinCheck166, 1n)

  // greaterThanOrEqualTo / greater_than_or_equal_to / genericId=200183 / literal=2, wire=0
  const result169 = f.greaterThanOrEqualTo(167n, 168n)
  const pinCheck170 = f.equal(result169, false)
  f.executeSkill(pinCheck170, 1n)

  // lessThan / less_than / genericId=200181 / literal=0, wire=2
  const result171 = f.lessThan(wireInt, wireInt)
  const pinCheck172 = f.equal(result171, false)
  f.executeSkill(pinCheck172, 1n)

  // lessThanOrEqualTo / less_than_or_equal_to / genericId=200182 / literal=0, wire=2
  const result173 = f.lessThanOrEqualTo(wireInt, wireInt)
  const pinCheck174 = f.equal(result173, false)
  f.executeSkill(pinCheck174, 1n)

  // listIncludesThisValue / list_includes_this_value / genericId=200224 / literal=0, wire=2
  const result175 = f.listIncludesThisValue(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck176 = f.equal(result175, false)
  f.executeSkill(pinCheck176, 1n)

  // logicalAndOperation / logical_and_operation / genericId=200174 / literal=0, wire=2
  const result177 = f.logicalAndOperation(wireBool, wireBool)
  const pinCheck178 = f.equal(result177, false)
  f.executeSkill(pinCheck178, 1n)

  // logicalNotOperation / logical_not_operation / genericId=200176 / literal=1, wire=0
  const result180 = f.logicalNotOperation(true)
  const pinCheck181 = f.equal(result180, false)
  f.executeSkill(pinCheck181, 1n)

  // logicalOrOperation / logical_or_operation / genericId=200175 / literal=0, wire=2
  const result182 = f.logicalOrOperation(wireBool, wireBool)
  const pinCheck183 = f.equal(result182, false)
  f.executeSkill(pinCheck183, 1n)

  // logicalXorOperation / logical_xor_operation / genericId=200177 / literal=0, wire=2
  const result184 = f.logicalXorOperation(wireBool, wireBool)
  const pinCheck185 = f.equal(result184, false)
  f.executeSkill(pinCheck185, 1n)

  // multiplication / multiplication / genericId=200186 / literal=0, wire=2
  const result186 = f.multiplication(wireInt, wireInt)
  const pinCheck187 = f.equal(result186, 0n)
  f.executeSkill(pinCheck187, 1n)

  // orientationToRotation / orientation_to_rotation / genericId=200203 / literal=0, wire=1
  const result189 = f.orientationToRotation(wireVec3)
  const pinCheck190 = f.equal(result189, [0, 0, 0])
  f.executeSkill(pinCheck190, 1n)

  // queryDictionarySLength / query_dictionary_s_length / genericId=200233 / literal=0, wire=1
  const result191 = f.queryDictionarySLength(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ])
  )
  const pinCheck192 = f.equal(result191, 0n)
  f.executeSkill(pinCheck192, 1n)

  // queryDictionaryValueByKey / query_dictionary_value_by_key / genericId=200230 / literal=0, wire=2
  const result193 = f.queryDictionaryValueByKey(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    wireInt
  )
  const pinCheck194 = f.equal(result193, 0n)
  f.executeSkill(pinCheck194, 1n)

  // queryEntityFaction / query_entity_faction / genericId=200171 / literal=1, wire=0
  const result195 = f.queryEntityFaction(CE.TargetEntity.AggroTarget)
  const pinCheck196 = f.equal(result195, faction(0n))
  f.executeSkill(pinCheck196, 1n)

  // queryIfDictionaryContainsSpecificKey / query_if_dictionary_contains_specific_key / genericId=200231 / literal=0, wire=2
  const result197 = f.queryIfDictionaryContainsSpecificKey(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    wireInt
  )
  const pinCheck198 = f.equal(result197, false)
  f.executeSkill(pinCheck198, 1n)

  // queryIfDictionaryContainsSpecificValue / query_if_dictionary_contains_specific_value / genericId=200232 / literal=0, wire=2
  const result199 = f.queryIfDictionaryContainsSpecificValue(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    wireInt
  )
  const pinCheck200 = f.equal(result199, false)
  f.executeSkill(pinCheck200, 1n)

  // queryIfEntityIsOnTheField / query_if_entity_is_on_the_field / genericId=200167 / literal=1, wire=0
  const result201 = f.queryIfEntityIsOnTheField(CE.TargetEntity.AggroTarget)
  const pinCheck202 = f.equal(result201, false)
  f.executeSkill(pinCheck202, 1n)

  // queryIfFactionIsHostile / query_if_faction_is_hostile / genericId=200227 / literal=2, wire=0
  const result205 = f.queryIfFactionIsHostile(faction(203n), faction(204n))
  const pinCheck206 = f.equal(result205, false)
  f.executeSkill(pinCheck206, 1n)

  // radiansToDegrees / radians_to_degrees / genericId=200211 / literal=0, wire=1
  const result207 = f.radiansToDegrees(wireFloat)
  const pinCheck208 = f.equal(result207, 0)
  f.executeSkill(pinCheck208, 1n)

  // sineFunction / sine_function / genericId=200204 / literal=1, wire=0
  const result210 = f.sineFunction(209.25)
  const pinCheck211 = f.equal(result210, 0)
  f.executeSkill(pinCheck211, 1n)

  // split3dVector / split3d_vector / genericId=200194 / literal=0, wire=1
  const result213 = f.split3dVector(wireVec3)
  const pinCheck214 = f.equal(result213.xComponent, 0)
  f.executeSkill(pinCheck214, 1n)
  const pinCheck215 = f.equal(result213.yComponent, 0)
  f.executeSkill(pinCheck215, 1n)
  const pinCheck216 = f.equal(result213.zComponent, 0)
  f.executeSkill(pinCheck216, 1n)

  // subtraction / subtraction / genericId=200185 / literal=0, wire=2
  const result217 = f.subtraction(wireInt, wireInt)
  const pinCheck218 = f.equal(result217, 0n)
  f.executeSkill(pinCheck218, 1n)

  // tangentFunction / tangent_function / genericId=200206 / literal=1, wire=0
  const result321 = f.tangentFunction(320.25)
  const pinCheck322 = f.equal(result321, 0)
  f.executeSkill(pinCheck322, 1n)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200307 / literal=1, wire=1
  const result323 = f.whetherTheEntityHasTheSpecifiedUnitStatus(self, wireConfig)
  const pinCheck324 = f.equal(result323, false)
  f.executeSkill(pinCheck324, 1n)

  // continueExecutingPreviousFrameBehavior / continue_executing_previous_frame_behavior / genericId=200253 / literal=0, wire=0
  f.doubleBranch(
    false,
    () => {
      f.continueExecutingPreviousFrameBehavior()
    },
    () => {}
  )

  // doubleBranch / double_branch / genericId=200125 / literal=1, wire=0
  f.doubleBranch(
    true,
    () => {},
    () => {}
  )

  // executeSkill / execute_skill / genericId=200129 / literal=0, wire=2
  f.executeSkill(wireBool, wireInt)

  // multipleBranches / multiple_branches / genericId=200127 / literal=0, wire=1
  f.multipleBranches(wireInt, {
    1: () => {},
    2: () => {},
    3: () => {},
    4: () => {},
    5: () => {},
    6: () => {},
    7: () => {},
    8: () => {},
    9: () => {},
    10: () => {},
    default: () => {}
  })

  // tacticAerialConfrontation / tactic_aerial_confrontation / genericId=200310 / literal=17, wire=11
  f.tacticAerialConfrontation(
    wireBool,
    'literal-219',
    false,
    wireFloat,
    wireFloat,
    wireFloat,
    221.25,
    222.25,
    wireFloat,
    223.25,
    false,
    true,
    wireFloat,
    226.25,
    wireFloat,
    227.25,
    228.25,
    229.25,
    230.25,
    wireFloat,
    wireFloat,
    231.25,
    wireFloat,
    232.25,
    233.25,
    CE.TacticSpeed.Walk,
    234.25,
    wireFloat
  )

  // tacticAerialEscape / tactic_aerial_escape / genericId=200309 / literal=10, wire=10
  f.tacticAerialEscape(
    true,
    'literal-236',
    wireBool,
    237.25,
    CE.TacticSpeed.Walk,
    wireFloat,
    wireFloat,
    wireFloat,
    wireFloat,
    238.25,
    wireInt,
    239n,
    240.25,
    wireFloat,
    241.25,
    242.25,
    wireBool,
    wireFloat,
    wireFloat,
    true
  )

  // tacticAerialIdling / tactic_aerial_idling / genericId=200311 / literal=10, wire=4
  f.tacticAerialIdling(
    false,
    'literal-245',
    wireBool,
    CE.TacticSpeed.Walk,
    246.25,
    247.25,
    248.25,
    wireFloat,
    249.25,
    250.25,
    251.25,
    wireFloat,
    252.25,
    wireFloat
  )

  // tacticAerialLanding / tactic_aerial_landing / genericId=200303 / literal=5, wire=5
  f.tacticAerialLanding(
    true,
    'literal-254',
    wireBool,
    255.25,
    wireFloat,
    wireFloat,
    CE.TacticSpeed.Walk,
    wireFloat,
    wireFloat,
    256.25
  )

  // tacticAerialPursuit / tactic_aerial_pursuit / genericId=200308 / literal=8, wire=7
  f.tacticAerialPursuit(
    wireBool,
    'literal-257',
    false,
    wireFloat,
    259.25,
    wireBool,
    wireFloat,
    260.25,
    261.25,
    wireFloat,
    CE.TacticSpeed.Walk,
    wireFloat,
    wireFloat,
    262.25,
    263.25
  )

  // tacticExecutePatrol / tactic_execute_patrol / genericId=200141 / literal=4, wire=2
  f.tacticExecutePatrol(false, wireInt, wireBool, true, 'literal-266', true)

  // tacticGroundConfrontation / tactic_ground_confrontation / genericId=200140 / literal=10, wire=6
  f.tacticGroundConfrontation(
    false,
    269.25,
    270.25,
    271.25,
    272.25,
    wireFloat,
    true,
    wireBool,
    wireFloat,
    274.25,
    275.25,
    wireFloat,
    wireFloat,
    276.25,
    'literal-277',
    wireBool
  )

  // tacticGroundEscape / tactic_ground_escape / genericId=200138 / literal=7, wire=6
  f.tacticGroundEscape(
    wireBool,
    wireFloat,
    CE.TacticSpeed.Walk,
    wireFloat,
    wireInt,
    278n,
    279.25,
    wireFloat,
    280.25,
    281.25,
    false,
    'literal-283',
    wireBool
  )

  // tacticGroundIdleRoaming / tactic_ground_idle_roaming / genericId=200130 / literal=5, wire=4
  f.tacticGroundIdleRoaming(
    wireBool,
    CE.TacticSpeed.Walk,
    wireFloat,
    wireFloat,
    284.25,
    wireFloat,
    285.25,
    'literal-286',
    true
  )

  // tacticGroundPursuit / tactic_ground_pursuit / genericId=200131 / literal=9, wire=2
  f.tacticGroundPursuit(
    false,
    wireFloat,
    289.25,
    wireFloat,
    CE.TacticSpeed.Walk,
    290.25,
    CE.TacticSpeed.Walk,
    291.25,
    292.25,
    'literal-293',
    false
  )

  // tacticMoveToTheTargetEntity / tactic_move_to_the_target_entity / genericId=200135 / literal=5, wire=2
  f.tacticMoveToTheTargetEntity(
    true,
    self,
    296.25,
    CE.TacticSpeed.Walk,
    wireFloat,
    'literal-297',
    wireBool
  )

  // tacticMoveToTheTargetPosition / tactic_move_to_the_target_position / genericId=200134 / literal=5, wire=2
  f.tacticMoveToTheTargetPosition(
    false,
    [299, 300, 301],
    300.25,
    CE.TacticSpeed.Walk,
    wireFloat,
    'literal-301',
    wireBool
  )

  // tacticReturnToSpawnPointAfterLeavingBattle / tactic_return_to_spawn_point_after_leaving_battle / genericId=200139 / literal=5, wire=3
  f.tacticReturnToSpawnPointAfterLeavingBattle(
    wireBool,
    CE.TacticSpeed.Walk,
    false,
    303.25,
    wireFloat,
    false,
    'literal-305',
    wireBool
  )

  // tacticRotateBySpecifiedAngle / tactic_rotate_by_specified_angle / genericId=200137 / literal=4, wire=2
  f.tacticRotateBySpecifiedAngle(false, wireFloat, 307.25, wireBool, 'literal-308', true)

  // tacticRotateToTheSpecifiedDirection / tactic_rotate_to_the_specified_direction / genericId=200136 / literal=5, wire=2
  f.tacticRotateToTheSpecifiedDirection(
    wireBool,
    [310, 311, 312],
    wireFloat,
    true,
    CE.RotationDirection.Default,
    'literal-312',
    true
  )

  // tacticRotateToTheTargetEntity / tactic_rotate_to_the_target_entity / genericId=200246 / literal=5, wire=1
  f.tacticRotateToTheTargetEntity(false, self, 315.25, wireBool, 'literal-316', true)

  // tacticStandStill / tactic_stand_still / genericId=200133 / literal=2, wire=1
  f.tacticStandStill(wireBool, 'literal-318', true)
})

g.creationStatusDecision({
  id: 1082130446,
  name: 'AllClientNodesCreationStatusDecisionClassic',
  prefix: true,
  mode: 'classic'
}).on('start1', (_evt, f) => {
  const wireEntity = f.getSelfEntity()
  const wireBool = f.equal(101n, 101n)
  const wireInt = f.addition(101n, 202n)
  const wireFloat = f.addition(1.25, 2.5)
  const wireVec3 = f.create3dVector(1, 2, 3)
  const wireFaction = f.queryEntityFaction(CE.TargetEntity.AggroTarget)
  const wireStr = f
    .getCustomVariable(CE.TargetEntity.AggroTarget, 'gsts_manual_wire_str')
    .asType('str')
  const wireGuid = f
    .getCustomVariable(CE.TargetEntity.AggroTarget, 'gsts_manual_wire_guid')
    .asType('guid')
  const wireConfig = f
    .getCustomVariable(CE.TargetEntity.AggroTarget, 'gsts_manual_wire_config')
    .asType('config_id')
  const wirePrefab = f
    .getCustomVariable(CE.TargetEntity.AggroTarget, 'gsts_manual_wire_prefab')
    .asType('prefab_id')
  const pinCheck248 = f.equal(wireStr, '')
  f.switchToSelfExecutionStatus(pinCheck248, configId(1082130445), 1n)
  const pinCheck249 = f.equal(wireGuid, guid(0n))
  f.switchToSelfExecutionStatus(pinCheck249, configId(1082130445), 1n)
  const pinCheck250 = f.equal(wireConfig, configId(0n))
  f.switchToSelfExecutionStatus(pinCheck250, configId(1082130445), 1n)
  const pinCheck251 = f.equal(wirePrefab, prefabId(0n))
  f.switchToSelfExecutionStatus(pinCheck251, configId(1082130445), 1n)

  // _3dVectorAddition / _3d_vector_addition / genericId=200200 / literal=2, wire=0
  const result3 = f._3dVectorAddition([1, 2, 3], [2, 3, 4])
  const pinCheck4 = f.equal(result3, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck4, configId(1082130445), 1n)

  // _3dVectorAngle / _3d_vector_angle / genericId=200196 / literal=0, wire=2
  const result7 = f._3dVectorAngle(wireVec3, wireVec3)
  const pinCheck8 = f.equal(result7, 0)
  f.switchToSelfExecutionStatus(pinCheck8, configId(1082130445), 1n)

  // _3dVectorCrossProduct / _3d_vector_cross_product / genericId=200193 / literal=0, wire=2
  const result11 = f._3dVectorCrossProduct(wireVec3, wireVec3)
  const pinCheck12 = f.equal(result11, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck12, configId(1082130445), 1n)

  // _3dVectorDotProduct / _3d_vector_dot_product / genericId=200192 / literal=2, wire=0
  const result15 = f._3dVectorDotProduct([13, 14, 15], [14, 15, 16])
  const pinCheck16 = f.equal(result15, 0)
  f.switchToSelfExecutionStatus(pinCheck16, configId(1082130445), 1n)

  // _3dVectorModuloOperation / _3d_vector_modulo_operation / genericId=200198 / literal=1, wire=0
  const result18 = f._3dVectorModuloOperation([17, 18, 19])
  const pinCheck19 = f.equal(result18, 0)
  f.switchToSelfExecutionStatus(pinCheck19, configId(1082130445), 1n)

  // _3dVectorNormalization / _3d_vector_normalization / genericId=200210 / literal=1, wire=0
  const result21 = f._3dVectorNormalization([20, 21, 22])
  const pinCheck22 = f.equal(result21, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck22, configId(1082130445), 1n)

  // _3dVectorRotation / _3d_vector_rotation / genericId=200197 / literal=1, wire=1
  const result25 = f._3dVectorRotation(wireVec3, [24, 25, 26])
  const pinCheck26 = f.equal(result25, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck26, configId(1082130445), 1n)

  // _3dVectorSubtraction / _3d_vector_subtraction / genericId=200201 / literal=2, wire=0
  const result29 = f._3dVectorSubtraction([27, 28, 29], [28, 29, 30])
  const pinCheck30 = f.equal(result29, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck30, configId(1082130445), 1n)

  // _3dVectorZoom / _3d_vector_zoom / genericId=200195 / literal=0, wire=2
  const result32 = f._3dVectorZoom(wireFloat, wireVec3)
  const pinCheck33 = f.equal(result32, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck33, configId(1082130445), 1n)

  // absoluteValueOperation / absolute_value_operation / genericId=200188 / literal=1, wire=0
  const result35 = f.absoluteValueOperation(34n)
  const pinCheck36 = f.equal(result35, 0n)
  f.switchToSelfExecutionStatus(pinCheck36, configId(1082130445), 1n)

  // addition / addition / genericId=200184 / literal=2, wire=0
  const result39 = f.addition(37n, 38n)
  const pinCheck40 = f.equal(result39, 0n)
  f.switchToSelfExecutionStatus(pinCheck40, configId(1082130445), 1n)

  // arccosineFunction / arccosine_function / genericId=200208 / literal=1, wire=0
  const result42 = f.arccosineFunction(41.25)
  const pinCheck43 = f.equal(result42, 0)
  f.switchToSelfExecutionStatus(pinCheck43, configId(1082130445), 1n)

  // arcsineFunction / arcsine_function / genericId=200207 / literal=1, wire=0
  const result45 = f.arcsineFunction(44.25)
  const pinCheck46 = f.equal(result45, 0)
  f.switchToSelfExecutionStatus(pinCheck46, configId(1082130445), 1n)

  // arctangentFunction / arctangent_function / genericId=200209 / literal=1, wire=0
  const result48 = f.arctangentFunction(47.25)
  const pinCheck49 = f.equal(result48, 0)
  f.switchToSelfExecutionStatus(pinCheck49, configId(1082130445), 1n)

  // assemblyDictionary / assembly_dictionary / genericId=200228 / literal=1, wire=0
  const pinCheck53 = f.greaterThanOrEqualTo(
    f.queryDictionarySLength(
      f.assemblyDictionary([
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n }
      ])
    ),
    0n
  )
  f.switchToSelfExecutionStatus(pinCheck53, configId(1082130445), 1n)

  // assemblyList / assembly_list / genericId=200191 / literal=2, wire=0
  const pinCheck56 = f.greaterThanOrEqualTo(
    f.getListLength(f.assemblyList([54n, 54n, 54n, 54n, 54n, 54n, 54n, 54n, 54n, 54n], 'int')),
    0n
  )
  f.switchToSelfExecutionStatus(pinCheck56, configId(1082130445), 1n)

  // checkIfSelfIsInTheTerritory / check_if_self_is_in_the_territory / genericId=200151 / literal=0, wire=0
  const result57 = f.checkIfSelfIsInTheTerritory()
  const pinCheck58 = f.equal(result57, false)
  f.switchToSelfExecutionStatus(pinCheck58, configId(1082130445), 1n)

  // checkTargetPositionPathfindingAvailability / check_target_position_pathfinding_availability / genericId=200148 / literal=0, wire=0
  const result59 = f.checkTargetPositionPathfindingAvailability()
  const pinCheck60 = f.equal(result59, false)
  f.switchToSelfExecutionStatus(pinCheck60, configId(1082130445), 1n)

  // checkTheCoordinatesWhenEnteringBattle / check_the_coordinates_when_entering_battle / genericId=200162 / literal=0, wire=0
  const result61 = f.checkTheCoordinatesWhenEnteringBattle()
  const pinCheck62 = f.equal(result61.enteringBattlePosition, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck62, configId(1082130445), 1n)
  const pinCheck63 = f.equal(result61.enteringBattleRotation, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck63, configId(1082130445), 1n)

  // checkTheDistanceFromSelfToTarget / check_the_distance_from_self_to_target / genericId=200147 / literal=0, wire=0
  const result64 = f.checkTheDistanceFromSelfToTarget()
  const pinCheck65 = f.equal(result64, 0)
  f.switchToSelfExecutionStatus(pinCheck65, configId(1082130445), 1n)

  // checkTheHorizontalAngleFromSelfToTarget / check_the_horizontal_angle_from_self_to_target / genericId=200143 / literal=0, wire=0
  const result66 = f.checkTheHorizontalAngleFromSelfToTarget()
  const pinCheck67 = f.equal(result66, 0)
  f.switchToSelfExecutionStatus(pinCheck67, configId(1082130445), 1n)

  // checkTheHorizontalDistanceFromSelfToTarget / check_the_horizontal_distance_from_self_to_target / genericId=200145 / literal=0, wire=0
  const result68 = f.checkTheHorizontalDistanceFromSelfToTarget()
  const pinCheck69 = f.equal(result68, 0)
  f.switchToSelfExecutionStatus(pinCheck69, configId(1082130445), 1n)

  // checkTheVerticalAngleFromSelfToTarget / check_the_vertical_angle_from_self_to_target / genericId=200144 / literal=0, wire=0
  const result70 = f.checkTheVerticalAngleFromSelfToTarget()
  const pinCheck71 = f.equal(result70, 0)
  f.switchToSelfExecutionStatus(pinCheck71, configId(1082130445), 1n)

  // checkTheVerticalDistanceFromSelfToTarget / check_the_vertical_distance_from_self_to_target / genericId=200146 / literal=0, wire=0
  const result72 = f.checkTheVerticalDistanceFromSelfToTarget()
  const pinCheck73 = f.equal(result72, 0)
  f.switchToSelfExecutionStatus(pinCheck73, configId(1082130445), 1n)

  // checkWhetherSelfIsInBattle / check_whether_self_is_in_battle / genericId=200150 / literal=0, wire=0
  const result74 = f.checkWhetherSelfIsInBattle()
  const pinCheck75 = f.equal(result74, false)
  f.switchToSelfExecutionStatus(pinCheck75, configId(1082130445), 1n)

  // checkWhetherSelfIsUsingASkill / check_whether_self_is_using_a_skill / genericId=200149 / literal=0, wire=0
  const result76 = f.checkWhetherSelfIsUsingASkill()
  const pinCheck77 = f.equal(result76.isTheUnitUsingASkill, false)
  f.switchToSelfExecutionStatus(pinCheck77, configId(1082130445), 1n)
  const pinCheck78 = f.equal(result76.skillID, 0n)
  f.switchToSelfExecutionStatus(pinCheck78, configId(1082130445), 1n)

  // cosineFunction / cosine_function / genericId=200205 / literal=0, wire=1
  const result79 = f.cosineFunction(wireFloat)
  const pinCheck80 = f.equal(result79, 0)
  f.switchToSelfExecutionStatus(pinCheck80, configId(1082130445), 1n)

  // create3dVector / create3d_vector / genericId=200199 / literal=3, wire=0
  const result84 = f.create3dVector(81.25, 82.25, 83.25)
  const pinCheck85 = f.equal(result84, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck85, configId(1082130445), 1n)

  // createDictionary / create_dictionary / genericId=200229 / literal=0, wire=2
  const pinCheck87 = f.greaterThanOrEqualTo(
    f.queryDictionarySLength(
      f.createDictionary(
        f.assemblyList(
          [
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt
          ],
          'int'
        ),
        f.assemblyList(
          [
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt
          ],
          'int'
        )
      )
    ),
    0n
  )
  f.switchToSelfExecutionStatus(pinCheck87, configId(1082130445), 1n)

  // dataTypeConversion / data_type_conversion / genericId=200189 / literal=1, wire=1
  const result88 = f.dataTypeConversion(wireInt, 'str')
  const pinCheck89 = f.equal(result88, '')
  f.switchToSelfExecutionStatus(pinCheck89, configId(1082130445), 1n)

  // degreesToRadians / degrees_to_radians / genericId=200212 / literal=1, wire=0
  const result91 = f.degreesToRadians(90.25)
  const pinCheck92 = f.equal(result91, 0)
  f.switchToSelfExecutionStatus(pinCheck92, configId(1082130445), 1n)

  // directionVectorToRotation / direction_vector_to_rotation / genericId=200202 / literal=1, wire=1
  const result95 = f.directionVectorToRotation([93, 94, 95], wireVec3)
  const pinCheck96 = f.equal(result95, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck96, configId(1082130445), 1n)

  // division / division / genericId=200187 / literal=0, wire=2
  const result97 = f.division(wireInt, wireInt)
  const pinCheck98 = f.equal(result97, 0n)
  f.switchToSelfExecutionStatus(pinCheck98, configId(1082130445), 1n)

  // enumerationMatch / enumeration_match / genericId=200178 / literal=2, wire=0
  const result99 = f.enumerationMatch(E.SortBy.Ascending, E.SortBy.Ascending)
  const pinCheck100 = f.equal(result99, false)
  f.switchToSelfExecutionStatus(pinCheck100, configId(1082130445), 1n)

  // equal / equal / genericId=200179 / literal=2, wire=0
  const result103 = f.equal(101n, 102n)
  const pinCheck104 = f.equal(result103, false)
  f.switchToSelfExecutionStatus(pinCheck104, configId(1082130445), 1n)

  // getCorrespondingValueFromList / get_corresponding_value_from_list / genericId=200222 / literal=1, wire=1
  const result106 = f.getCorrespondingValueFromList(
    105n,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck107 = f.equal(result106, 0n)
  f.switchToSelfExecutionStatus(pinCheck107, configId(1082130445), 1n)

  // getCurrentExecutionStatus / get_current_execution_status / genericId=200142 / literal=0, wire=0
  const result108 = f.getCurrentExecutionStatus()
  const pinCheck109 = f.equal(result108, configId(0n))
  f.switchToSelfExecutionStatus(pinCheck109, configId(1082130445), 1n)

  // getCustomVariable / get_custom_variable / genericId=200173 / literal=2, wire=0
  const result111 = f.getCustomVariable(CE.TargetEntity.AggroTarget, 'literal-110')
  const narrowed112 = result111.asType('int')
  const pinCheck113 = f.equal(narrowed112, 0n)
  f.switchToSelfExecutionStatus(pinCheck113, configId(1082130445), 1n)

  // getEntityLocation / get_entity_location / genericId=200169 / literal=1, wire=0
  const result114 = f.getEntityLocation(CE.TargetEntity.AggroTarget)
  const pinCheck115 = f.equal(result114, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck115, configId(1082130445), 1n)

  // getEntityRotation / get_entity_rotation / genericId=200170 / literal=1, wire=0
  const result116 = f.getEntityRotation(CE.TargetEntity.AggroTarget)
  const pinCheck117 = f.equal(result116, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck117, configId(1082130445), 1n)

  // getEntitySType / get_entity_s_type / genericId=200168 / literal=1, wire=0
  const result118 = f.getEntitySType(CE.TargetEntity.AggroTarget)
  const pinCheck119 = f.enumerationMatch(result118, E.EntityType.Stage)
  f.switchToSelfExecutionStatus(pinCheck119, configId(1082130445), 1n)

  // getEntityTypeList / get_entity_type_list / genericId=200312 / literal=1, wire=0
  const enumListProbe121 = f.getRayDetectionResult(
    CE.TargetEntity.AggroTarget,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.None,
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
  const pinCheck122 = f.equal(enumListProbe121.onHitLocation, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck122, configId(1082130445), 1n)

  // getListLength / get_list_length / genericId=200223 / literal=0, wire=1
  const result123 = f.getListLength(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck124 = f.equal(result123, 0n)
  f.switchToSelfExecutionStatus(pinCheck124, configId(1082130445), 1n)

  // getListOfKeysFromDictionary / get_list_of_keys_from_dictionary / genericId=200235 / literal=0, wire=1
  const pinCheck126 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.getListOfKeysFromDictionary(
        f.assemblyDictionary([
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt }
        ])
      )
    ),
    0n
  )
  f.switchToSelfExecutionStatus(pinCheck126, configId(1082130445), 1n)

  // getListOfValuesFromDictionary / get_list_of_values_from_dictionary / genericId=200234 / literal=0, wire=1
  const pinCheck128 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.getListOfValuesFromDictionary(
        f.assemblyDictionary([
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt }
        ])
      )
    ),
    0n
  )
  f.switchToSelfExecutionStatus(pinCheck128, configId(1082130445), 1n)

  // getMaximumValueFromList / get_maximum_value_from_list / genericId=200225 / literal=0, wire=1
  const result129 = f.getMaximumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck130 = f.equal(result129, 0n)
  f.switchToSelfExecutionStatus(pinCheck130, configId(1082130445), 1n)

  // getMinimumValueFromList / get_minimum_value_from_list / genericId=200226 / literal=0, wire=1
  const result131 = f.getMinimumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck132 = f.equal(result131, 0n)
  f.switchToSelfExecutionStatus(pinCheck132, configId(1082130445), 1n)

  // getObjectPresetStatus / get_object_preset_status / genericId=200172 / literal=1, wire=1
  const result133 = f.getObjectPresetStatus(CE.TargetEntity.AggroTarget, wireInt)
  const pinCheck134 = f.equal(result133, 0n)
  f.switchToSelfExecutionStatus(pinCheck134, configId(1082130445), 1n)

  // getPreviousFrameExecutionStatus / get_previous_frame_execution_status / genericId=200250 / literal=0, wire=0
  const result135 = f.getPreviousFrameExecutionStatus()
  const pinCheck136 = f.equal(result135, configId(0n))
  f.switchToSelfExecutionStatus(pinCheck136, configId(1082130445), 1n)

  // getPreviousFrameExecutionTactic / get_previous_frame_execution_tactic / genericId=200252 / literal=0, wire=0
  const result137 = f.getPreviousFrameExecutionTactic()
  const pinCheck138 = f.enumerationMatch(result137.tacticType, CE.TacticType.None)
  f.switchToSelfExecutionStatus(pinCheck138, configId(1082130445), 1n)
  const pinCheck139 = f.equal(result137.tacticalContext, '')
  f.switchToSelfExecutionStatus(pinCheck139, configId(1082130445), 1n)
  const pinCheck140 = f.equal(result137.tacticDuration, 0)
  f.switchToSelfExecutionStatus(pinCheck140, configId(1082130445), 1n)

  // getRandomNumber / get_random_number / genericId=200190 / literal=0, wire=2
  const result141 = f.getRandomNumber(wireInt, wireInt)
  const pinCheck142 = f.equal(result141, 0n)
  f.switchToSelfExecutionStatus(pinCheck142, configId(1082130445), 1n)

  // getRayDetectionResult / get_ray_detection_result / genericId=200301 / literal=4, wire=3
  const result146 = f.getRayDetectionResult(
    CE.TargetEntity.AggroTarget,
    [143, 144, 145],
    wireVec3,
    145.25,
    E.TargetType.None,
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
  const pinCheck147 = f.equal(result146.onHitLocation, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck147, configId(1082130445), 1n)
  const pinCheck148 = f.equal(result146.onHitEntity, false)
  f.switchToSelfExecutionStatus(pinCheck148, configId(1082130445), 1n)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200302 / literal=1, wire=0
  const enumListProbe150 = f.getRayDetectionResult(
    CE.TargetEntity.AggroTarget,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.None,
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
  const pinCheck151 = f.equal(enumListProbe150.onHitLocation, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck151, configId(1082130445), 1n)

  // getSelfEntity / get_self_entity / genericId=200164 / literal=0, wire=0
  const result152 = f.getSelfEntity()
  const pinCheck153 = f.equal(result152, wireEntity)
  f.switchToSelfExecutionStatus(pinCheck153, configId(1082130445), 1n)

  // getSelfPresetStatusValue / get_self_preset_status_value / genericId=200241 / literal=1, wire=0
  const result155 = f.getSelfPresetStatusValue(154n)
  const pinCheck156 = f.equal(result155, 0n)
  f.switchToSelfExecutionStatus(pinCheck156, configId(1082130445), 1n)

  // getSpawnPointLocationInformation / get_spawn_point_location_information / genericId=200163 / literal=0, wire=0
  const result157 = f.getSpawnPointLocationInformation()
  const pinCheck158 = f.equal(result157.spawnPointCoordinates, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck158, configId(1082130445), 1n)
  const pinCheck159 = f.equal(result157.spawnPointRotation, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck159, configId(1082130445), 1n)

  // getStageEntity / get_stage_entity / genericId=200166 / literal=0, wire=0
  const result160 = f.getStageEntity()
  const pinCheck161 = f.equal(result160, wireEntity)
  f.switchToSelfExecutionStatus(pinCheck161, configId(1082130445), 1n)

  // getTargetAtk / get_target_atk / genericId=200240 / literal=1, wire=0
  const result162 = f.getTargetAtk(CE.TargetEntity.AggroTarget)
  const pinCheck163 = f.equal(result162.baseATK, 0)
  f.switchToSelfExecutionStatus(pinCheck163, configId(1082130445), 1n)
  const pinCheck164 = f.equal(result162.currentATK, 0)
  f.switchToSelfExecutionStatus(pinCheck164, configId(1082130445), 1n)

  // getTargetEntity / get_target_entity / genericId=200165 / literal=0, wire=0
  const result165 = f.getTargetEntity()
  const pinCheck166 = f.equal(result165, wireEntity)
  f.switchToSelfExecutionStatus(pinCheck166, configId(1082130445), 1n)

  // getTargetHp / get_target_hp / genericId=200238 / literal=1, wire=0
  const result167 = f.getTargetHp(CE.TargetEntity.AggroTarget)
  const pinCheck168 = f.equal(result167.baseHP, 0)
  f.switchToSelfExecutionStatus(pinCheck168, configId(1082130445), 1n)
  const pinCheck169 = f.equal(result167.maxHP, 0)
  f.switchToSelfExecutionStatus(pinCheck169, configId(1082130445), 1n)
  const pinCheck170 = f.equal(result167.currentHPPercentage, 0)
  f.switchToSelfExecutionStatus(pinCheck170, configId(1082130445), 1n)

  // getTargetLevel / get_target_level / genericId=200239 / literal=1, wire=0
  const result171 = f.getTargetLevel(CE.TargetEntity.AggroTarget)
  const pinCheck172 = f.equal(result171, 0n)
  f.switchToSelfExecutionStatus(pinCheck172, configId(1082130445), 1n)

  // greaterThan / greater_than / genericId=200180 / literal=0, wire=2
  const result173 = f.greaterThan(wireInt, wireInt)
  const pinCheck174 = f.equal(result173, false)
  f.switchToSelfExecutionStatus(pinCheck174, configId(1082130445), 1n)

  // greaterThanOrEqualTo / greater_than_or_equal_to / genericId=200183 / literal=0, wire=2
  const result175 = f.greaterThanOrEqualTo(wireInt, wireInt)
  const pinCheck176 = f.equal(result175, false)
  f.switchToSelfExecutionStatus(pinCheck176, configId(1082130445), 1n)

  // lessThan / less_than / genericId=200181 / literal=2, wire=0
  const result179 = f.lessThan(177n, 178n)
  const pinCheck180 = f.equal(result179, false)
  f.switchToSelfExecutionStatus(pinCheck180, configId(1082130445), 1n)

  // lessThanOrEqualTo / less_than_or_equal_to / genericId=200182 / literal=2, wire=0
  const result183 = f.lessThanOrEqualTo(181n, 182n)
  const pinCheck184 = f.equal(result183, false)
  f.switchToSelfExecutionStatus(pinCheck184, configId(1082130445), 1n)

  // listIncludesThisValue / list_includes_this_value / genericId=200224 / literal=1, wire=1
  const result186 = f.listIncludesThisValue(
    185n,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck187 = f.equal(result186, false)
  f.switchToSelfExecutionStatus(pinCheck187, configId(1082130445), 1n)

  // logicalAndOperation / logical_and_operation / genericId=200174 / literal=2, wire=0
  const result190 = f.logicalAndOperation(false, true)
  const pinCheck191 = f.equal(result190, false)
  f.switchToSelfExecutionStatus(pinCheck191, configId(1082130445), 1n)

  // logicalNotOperation / logical_not_operation / genericId=200176 / literal=0, wire=1
  const result192 = f.logicalNotOperation(wireBool)
  const pinCheck193 = f.equal(result192, false)
  f.switchToSelfExecutionStatus(pinCheck193, configId(1082130445), 1n)

  // logicalOrOperation / logical_or_operation / genericId=200175 / literal=2, wire=0
  const result196 = f.logicalOrOperation(false, true)
  const pinCheck197 = f.equal(result196, false)
  f.switchToSelfExecutionStatus(pinCheck197, configId(1082130445), 1n)

  // logicalXorOperation / logical_xor_operation / genericId=200177 / literal=2, wire=0
  const result200 = f.logicalXorOperation(false, true)
  const pinCheck201 = f.equal(result200, false)
  f.switchToSelfExecutionStatus(pinCheck201, configId(1082130445), 1n)

  // multiplication / multiplication / genericId=200186 / literal=2, wire=0
  const result205 = f.multiplication(203n, 204n)
  const pinCheck206 = f.equal(result205, 0n)
  f.switchToSelfExecutionStatus(pinCheck206, configId(1082130445), 1n)

  // orientationToRotation / orientation_to_rotation / genericId=200203 / literal=1, wire=0
  const result208 = f.orientationToRotation([207, 208, 209])
  const pinCheck209 = f.equal(result208, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck209, configId(1082130445), 1n)

  // queryDictionarySLength / query_dictionary_s_length / genericId=200233 / literal=0, wire=1
  const result210 = f.queryDictionarySLength(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ])
  )
  const pinCheck211 = f.equal(result210, 0n)
  f.switchToSelfExecutionStatus(pinCheck211, configId(1082130445), 1n)

  // queryDictionaryValueByKey / query_dictionary_value_by_key / genericId=200230 / literal=1, wire=1
  const result213 = f.queryDictionaryValueByKey(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    212n
  )
  const pinCheck214 = f.equal(result213, 0n)
  f.switchToSelfExecutionStatus(pinCheck214, configId(1082130445), 1n)

  // queryEntityFaction / query_entity_faction / genericId=200171 / literal=1, wire=0
  const result215 = f.queryEntityFaction(CE.TargetEntity.AggroTarget)
  const pinCheck216 = f.equal(result215, faction(0n))
  f.switchToSelfExecutionStatus(pinCheck216, configId(1082130445), 1n)

  // queryIfDictionaryContainsSpecificKey / query_if_dictionary_contains_specific_key / genericId=200231 / literal=1, wire=1
  const result218 = f.queryIfDictionaryContainsSpecificKey(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    217n
  )
  const pinCheck219 = f.equal(result218, false)
  f.switchToSelfExecutionStatus(pinCheck219, configId(1082130445), 1n)

  // queryIfDictionaryContainsSpecificValue / query_if_dictionary_contains_specific_value / genericId=200232 / literal=1, wire=1
  const result221 = f.queryIfDictionaryContainsSpecificValue(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    220n
  )
  const pinCheck222 = f.equal(result221, false)
  f.switchToSelfExecutionStatus(pinCheck222, configId(1082130445), 1n)

  // queryIfEntityIsOnTheField / query_if_entity_is_on_the_field / genericId=200167 / literal=1, wire=0
  const result223 = f.queryIfEntityIsOnTheField(CE.TargetEntity.AggroTarget)
  const pinCheck224 = f.equal(result223, false)
  f.switchToSelfExecutionStatus(pinCheck224, configId(1082130445), 1n)

  // queryIfFactionIsHostile / query_if_faction_is_hostile / genericId=200227 / literal=0, wire=2
  const result225 = f.queryIfFactionIsHostile(wireFaction, wireFaction)
  const pinCheck226 = f.equal(result225, false)
  f.switchToSelfExecutionStatus(pinCheck226, configId(1082130445), 1n)

  // radiansToDegrees / radians_to_degrees / genericId=200211 / literal=1, wire=0
  const result228 = f.radiansToDegrees(227.25)
  const pinCheck229 = f.equal(result228, 0)
  f.switchToSelfExecutionStatus(pinCheck229, configId(1082130445), 1n)

  // sineFunction / sine_function / genericId=200204 / literal=0, wire=1
  const result230 = f.sineFunction(wireFloat)
  const pinCheck231 = f.equal(result230, 0)
  f.switchToSelfExecutionStatus(pinCheck231, configId(1082130445), 1n)

  // split3dVector / split3d_vector / genericId=200194 / literal=1, wire=0
  const result233 = f.split3dVector([232, 233, 234])
  const pinCheck234 = f.equal(result233.xComponent, 0)
  f.switchToSelfExecutionStatus(pinCheck234, configId(1082130445), 1n)
  const pinCheck235 = f.equal(result233.yComponent, 0)
  f.switchToSelfExecutionStatus(pinCheck235, configId(1082130445), 1n)
  const pinCheck236 = f.equal(result233.zComponent, 0)
  f.switchToSelfExecutionStatus(pinCheck236, configId(1082130445), 1n)

  // subtraction / subtraction / genericId=200185 / literal=2, wire=0
  const result239 = f.subtraction(237n, 238n)
  const pinCheck240 = f.equal(result239, 0n)
  f.switchToSelfExecutionStatus(pinCheck240, configId(1082130445), 1n)

  // tangentFunction / tangent_function / genericId=200206 / literal=0, wire=1
  const result243 = f.tangentFunction(wireFloat)
  const pinCheck244 = f.equal(result243, 0)
  f.switchToSelfExecutionStatus(pinCheck244, configId(1082130445), 1n)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200307 / literal=1, wire=1
  const result246 = f.whetherTheEntityHasTheSpecifiedUnitStatus(wireEntity, configId(245n))
  const pinCheck247 = f.equal(result246, false)
  f.switchToSelfExecutionStatus(pinCheck247, configId(1082130445), 1n)

  // doubleBranch / double_branch / genericId=200125 / literal=0, wire=1
  f.doubleBranch(
    wireBool,
    () => {},
    () => {}
  )

  // multipleBranches / multiple_branches / genericId=200127 / literal=1, wire=0
  f.multipleBranches(202n, {
    1: () => {},
    2: () => {},
    3: () => {},
    4: () => {},
    5: () => {},
    6: () => {},
    7: () => {},
    8: () => {},
    9: () => {},
    10: () => {},
    default: () => {}
  })

  // switchToSelfExecutionStatus / switch_to_self_execution_status / genericId=200128 / literal=2, wire=1
  f.switchToSelfExecutionStatus(wireBool, configId(241n), 242n)
})

g.boolFilter({
  id: 1082130449,
  name: 'AllClientNodesBoolFilterClassic',
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
  const pinCheck246 = f.equal(wireStr, '')
  const pinCheck247 = f.equal(wireGuid, guid(0n))
  const pinCheck248 = f.equal(wireConfig, configId(0n))
  const pinCheck249 = f.equal(wirePrefab, prefabId(0n))

  // _3dVectorAddition / _3d_vector_addition / genericId=200071 / literal=2, wire=0
  const result3 = f._3dVectorAddition([1, 2, 3], [2, 3, 4])
  const pinCheck4 = f.equal(result3, [0, 0, 0])

  // _3dVectorAngle / _3d_vector_angle / genericId=200067 / literal=0, wire=2
  const result7 = f._3dVectorAngle(wireVec3, wireVec3)
  const pinCheck8 = f.equal(result7, 0)

  // _3dVectorCrossProduct / _3d_vector_cross_product / genericId=200064 / literal=0, wire=2
  const result11 = f._3dVectorCrossProduct(wireVec3, wireVec3)
  const pinCheck12 = f.equal(result11, [0, 0, 0])

  // _3dVectorDotProduct / _3d_vector_dot_product / genericId=200063 / literal=2, wire=0
  const result15 = f._3dVectorDotProduct([13, 14, 15], [14, 15, 16])
  const pinCheck16 = f.equal(result15, 0)

  // _3dVectorModuloOperation / _3d_vector_modulo_operation / genericId=200069 / literal=1, wire=0
  const result18 = f._3dVectorModuloOperation([17, 18, 19])
  const pinCheck19 = f.equal(result18, 0)

  // _3dVectorNormalization / _3d_vector_normalization / genericId=200100 / literal=1, wire=0
  const result21 = f._3dVectorNormalization([20, 21, 22])
  const pinCheck22 = f.equal(result21, [0, 0, 0])

  // _3dVectorRotation / _3d_vector_rotation / genericId=200068 / literal=1, wire=1
  const result25 = f._3dVectorRotation(wireVec3, [24, 25, 26])
  const pinCheck26 = f.equal(result25, [0, 0, 0])

  // _3dVectorSubtraction / _3d_vector_subtraction / genericId=200072 / literal=2, wire=0
  const result29 = f._3dVectorSubtraction([27, 28, 29], [28, 29, 30])
  const pinCheck30 = f.equal(result29, [0, 0, 0])

  // _3dVectorZoom / _3d_vector_zoom / genericId=200066 / literal=0, wire=2
  const result32 = f._3dVectorZoom(wireFloat, wireVec3)
  const pinCheck33 = f.equal(result32, [0, 0, 0])

  // absoluteValueOperation / absolute_value_operation / genericId=200015 / literal=1, wire=0
  const result35 = f.absoluteValueOperation(34n)
  const pinCheck36 = f.equal(result35, 0n)

  // addition / addition / genericId=200011 / literal=2, wire=0
  const result39 = f.addition(37n, 38n)
  const pinCheck40 = f.equal(result39, 0n)

  // arccosineFunction / arccosine_function / genericId=200098 / literal=1, wire=0
  const result42 = f.arccosineFunction(41.25)
  const pinCheck43 = f.equal(result42, 0)

  // arcsineFunction / arcsine_function / genericId=200097 / literal=1, wire=0
  const result45 = f.arcsineFunction(44.25)
  const pinCheck46 = f.equal(result45, 0)

  // arctangentFunction / arctangent_function / genericId=200099 / literal=1, wire=0
  const result48 = f.arctangentFunction(47.25)
  const pinCheck49 = f.equal(result48, 0)

  // assemblyDictionary / assembly_dictionary / genericId=200152 / literal=1, wire=0
  const pinCheck53 = f.greaterThanOrEqualTo(
    f.queryDictionarySLength(
      f.assemblyDictionary([
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n },
        { k: 50n, v: 51n }
      ])
    ),
    0n
  )

  // assemblyList / assembly_list / genericId=200049 / literal=2, wire=0
  const pinCheck56 = f.greaterThanOrEqualTo(
    f.getListLength(f.assemblyList([54n, 54n, 54n, 54n, 54n, 54n, 54n, 54n, 54n, 54n], 'int')),
    0n
  )

  // checkClassicModeCharacterId / check_classic_mode_character_id / genericId=200254 / literal=1, wire=0
  const result57 = f.checkClassicModeCharacterId(self)
  const pinCheck58 = f.equal(result57, 0n)

  // checkThePresetStatusValueOfTheComplexCreation / check_the_preset_status_value_of_the_complex_creation / genericId=200244 / literal=0, wire=2
  const result59 = f.checkThePresetStatusValueOfTheComplexCreation(wireEntity, wireInt)
  const pinCheck60 = f.equal(result59, 0n)

  // cosineFunction / cosine_function / genericId=200095 / literal=0, wire=1
  const result61 = f.cosineFunction(wireFloat)
  const pinCheck62 = f.equal(result61, 0)

  // create3dVector / create3d_vector / genericId=200070 / literal=3, wire=0
  const result66 = f.create3dVector(63.25, 64.25, 65.25)
  const pinCheck67 = f.equal(result66, [0, 0, 0])

  // createDictionary / create_dictionary / genericId=200153 / literal=0, wire=2
  const pinCheck69 = f.greaterThanOrEqualTo(
    f.queryDictionarySLength(
      f.createDictionary(
        f.assemblyList(
          [
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt
          ],
          'int'
        ),
        f.assemblyList(
          [
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt
          ],
          'int'
        )
      )
    ),
    0n
  )

  // dataTypeConversion / data_type_conversion / genericId=200022 / literal=1, wire=1
  const result70 = f.dataTypeConversion(wireInt, 'str')
  const pinCheck71 = f.equal(result70, '')

  // degreesToRadians / degrees_to_radians / genericId=200102 / literal=1, wire=0
  const result73 = f.degreesToRadians(72.25)
  const pinCheck74 = f.equal(result73, 0)

  // directionVectorToRotation / direction_vector_to_rotation / genericId=200073 / literal=1, wire=1
  const result77 = f.directionVectorToRotation([75, 76, 77], wireVec3)
  const pinCheck78 = f.equal(result77, [0, 0, 0])

  // division / division / genericId=200014 / literal=0, wire=2
  const result79 = f.division(wireInt, wireInt)
  const pinCheck80 = f.equal(result79, 0n)

  // enumerationMatch / enumeration_match / genericId=200005 / literal=2, wire=0
  const result81 = f.enumerationMatch(E.SortBy.Ascending, E.SortBy.Ascending)
  const pinCheck82 = f.equal(result81, false)

  // equal / equal / genericId=200006 / literal=2, wire=0
  const result85 = f.equal(83n, 84n)
  const pinCheck86 = f.equal(result85, false)

  // filterEntityListWithinSphericalRange / filter_entity_list_within_spherical_range / genericId=200043 / literal=3, wire=1
  const pinCheck90 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSphericalRange(
        wireFloat,
        [87, 88, 89],
        88n,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )

  // filterEntityListWithinSquareRange / filter_entity_list_within_square_range / genericId=200044 / literal=3, wire=3
  const pinCheck94 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSquareRange(
        wireFloat,
        wireFloat,
        wireFloat,
        [91, 92, 93],
        92n,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )

  // getActiveCharacterOfSpecifiedPlayer / get_active_character_of_specified_player / genericId=200251 / literal=1, wire=0
  const result95 = f.getActiveCharacterOfSpecifiedPlayer(self)
  const pinCheck96 = f.equal(result95, wireEntity)

  // getAllEntitiesWithinTheCollisionTrigger / get_all_entities_within_the_collision_trigger / genericId=200107 / literal=0, wire=2
  const pinCheck98 = f.greaterThanOrEqualTo(
    f.getListLength(f.getAllEntitiesWithinTheCollisionTrigger(wireEntity, wireInt)),
    0n
  )

  // getCorrespondingValueFromList / get_corresponding_value_from_list / genericId=200017 / literal=1, wire=1
  const result100 = f.getCorrespondingValueFromList(
    99n,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck101 = f.equal(result100, 0n)

  // getCurrentCharacter / get_current_character / genericId=200076 / literal=0, wire=0
  const result102 = f.getCurrentCharacter()
  const pinCheck103 = f.equal(result102, wireEntity)

  // getCustomVariable / get_custom_variable / genericId=200016 / literal=2, wire=0
  const result105 = f.getCustomVariable(self, 'literal-104')
  const narrowed106 = result105.asType('int')
  const pinCheck107 = f.equal(narrowed106, 0n)

  // getEntityLocation / get_entity_location / genericId=200030 / literal=1, wire=0
  const result108 = f.getEntityLocation(self)
  const pinCheck109 = f.equal(result108, [0, 0, 0])

  // getEntityRotation / get_entity_rotation / genericId=200031 / literal=0, wire=1
  const result110 = f.getEntityRotation(wireEntity)
  const pinCheck111 = f.equal(result110, [0, 0, 0])

  // getEntitySType / get_entity_s_type / genericId=200045 / literal=0, wire=1
  const result112 = f.getEntitySType(wireEntity)
  const pinCheck113 = f.enumerationMatch(result112, E.EntityType.Stage)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe115 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.None,
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
  const pinCheck116 = f.equal(enumListProbe115.onHitLocation, [0, 0, 0])

  // getListLength / get_list_length / genericId=200018 / literal=0, wire=1
  const result117 = f.getListLength(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck118 = f.equal(result117, 0n)

  // getListOfKeysFromDictionary / get_list_of_keys_from_dictionary / genericId=200159 / literal=0, wire=1
  const pinCheck120 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.getListOfKeysFromDictionary(
        f.assemblyDictionary([
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt }
        ])
      )
    ),
    0n
  )

  // getListOfPlayerEntitiesOnTheField / get_list_of_player_entities_on_the_field / genericId=200026 / literal=0, wire=0
  const pinCheck122 = f.greaterThanOrEqualTo(
    f.getListLength(f.getListOfPlayerEntitiesOnTheField()),
    0n
  )

  // getListOfValuesFromDictionary / get_list_of_values_from_dictionary / genericId=200158 / literal=0, wire=1
  const pinCheck124 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.getListOfValuesFromDictionary(
        f.assemblyDictionary([
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt }
        ])
      )
    ),
    0n
  )

  // getMaximumValueFromList / get_maximum_value_from_list / genericId=200020 / literal=0, wire=1
  const result125 = f.getMaximumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck126 = f.equal(result125, 0n)

  // getMinimumValueFromList / get_minimum_value_from_list / genericId=200021 / literal=0, wire=1
  const result127 = f.getMinimumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck128 = f.equal(result127, 0n)

  // getPlayerClientInputDeviceType / get_player_client_input_device_type / genericId=200123 / literal=0, wire=0
  const result129 = f.getPlayerClientInputDeviceType()
  const pinCheck130 = f.enumerationMatch(result129, E.InputDeviceType.KeyboardAndMouse)

  // getPlayerEntityToWhichTheCharacterBelongs / get_player_entity_to_which_the_character_belongs / genericId=200025 / literal=0, wire=1
  const result131 = f.getPlayerEntityToWhichTheCharacterBelongs(wireEntity)
  const pinCheck132 = f.equal(result131, wireEntity)

  // getPlayerMovementInput / get_player_movement_input / genericId=200255 / literal=0, wire=0
  const result133 = f.getPlayerMovementInput()
  const pinCheck134 = f.equal(result133.inputDirection, 0)
  const pinCheck135 = f.equal(result133.inputStrength, 0)

  // getPlayerSCharacterList / get_player_s_character_list / genericId=200242 / literal=1, wire=0
  const pinCheck137 = f.greaterThanOrEqualTo(f.getListLength(f.getPlayerSCharacterList(self)), 0n)

  // getPresetStatus / get_preset_status / genericId=200028 / literal=1, wire=1
  const result139 = f.getPresetStatus(wireEntity, 138n)
  const pinCheck140 = f.equal(result139, 0n)

  // getRandomNumber / get_random_number / genericId=200032 / literal=0, wire=2
  const result141 = f.getRandomNumber(wireInt, wireInt)
  const pinCheck142 = f.equal(result141, 0n)

  // getRayDetectionResult / get_ray_detection_result / genericId=200109 / literal=4, wire=3
  const result146 = f.getRayDetectionResult(
    self,
    [143, 144, 145],
    wireVec3,
    145.25,
    E.TargetType.None,
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
  const pinCheck147 = f.equal(result146.onHitLocation, [0, 0, 0])
  const pinCheck148 = f.equal(result146.onHitEntity, wireEntity)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200110 / literal=1, wire=0
  const enumListProbe150 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.None,
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
  const pinCheck151 = f.equal(enumListProbe150.onHitLocation, [0, 0, 0])

  // getSelfEntity / get_self_entity / genericId=200033 / literal=0, wire=0
  const result152 = f.getSelfEntity()
  const pinCheck153 = f.equal(result152, wireEntity)

  // getTargetAttachmentPointLocation / get_target_attachment_point_location / genericId=200047 / literal=1, wire=1
  const result154 = f.getTargetAttachmentPointLocation(self, wireStr)
  const pinCheck155 = f.equal(result154, [0, 0, 0])

  // getTargetAttachmentPointRotation / get_target_attachment_point_rotation / genericId=200048 / literal=1, wire=1
  const result157 = f.getTargetAttachmentPointRotation(wireEntity, 'literal-156')
  const pinCheck158 = f.equal(result157, [0, 0, 0])

  // getTargetEntity / get_target_entity / genericId=200034 / literal=0, wire=0
  const result159 = f.getTargetEntity()
  const pinCheck160 = f.equal(result159, wireEntity)

  // getUnitAttackTarget / get_unit_attack_target / genericId=200035 / literal=0, wire=1
  const result161 = f.getUnitAttackTarget(wireEntity)
  const pinCheck162 = f.equal(result161, wireEntity)

  // greaterThan / greater_than / genericId=200007 / literal=0, wire=2
  const result163 = f.greaterThan(wireInt, wireInt)
  const pinCheck164 = f.equal(result163, false)

  // greaterThanOrEqualTo / greater_than_or_equal_to / genericId=200010 / literal=0, wire=2
  const result165 = f.greaterThanOrEqualTo(wireInt, wireInt)
  const pinCheck166 = f.equal(result165, false)

  // lessThan / less_than / genericId=200008 / literal=2, wire=0
  const result169 = f.lessThan(167n, 168n)
  const pinCheck170 = f.equal(result169, false)

  // lessThanOrEqualTo / less_than_or_equal_to / genericId=200009 / literal=2, wire=0
  const result173 = f.lessThanOrEqualTo(171n, 172n)
  const pinCheck174 = f.equal(result173, false)

  // listIncludesThisValue / list_includes_this_value / genericId=200019 / literal=1, wire=1
  const result176 = f.listIncludesThisValue(
    175n,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck177 = f.equal(result176, false)

  // logicalAndOperation / logical_and_operation / genericId=200001 / literal=2, wire=0
  const result180 = f.logicalAndOperation(false, true)
  const pinCheck181 = f.equal(result180, false)

  // logicalNotOperation / logical_not_operation / genericId=200003 / literal=0, wire=1
  const result182 = f.logicalNotOperation(wireBool)
  const pinCheck183 = f.equal(result182, false)

  // logicalOrOperation / logical_or_operation / genericId=200002 / literal=2, wire=0
  const result186 = f.logicalOrOperation(false, true)
  const pinCheck187 = f.equal(result186, false)

  // logicalXorOperation / logical_xor_operation / genericId=200004 / literal=2, wire=0
  const result190 = f.logicalXorOperation(false, true)
  const pinCheck191 = f.equal(result190, false)

  // multiplication / multiplication / genericId=200013 / literal=2, wire=0
  const result194 = f.multiplication(192n, 193n)
  const pinCheck195 = f.equal(result194, 0n)

  // orientationToRotation / orientation_to_rotation / genericId=200074 / literal=1, wire=0
  const result197 = f.orientationToRotation([196, 197, 198])
  const pinCheck198 = f.equal(result197, [0, 0, 0])

  // queryDictionarySLength / query_dictionary_s_length / genericId=200157 / literal=0, wire=1
  const result199 = f.queryDictionarySLength(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ])
  )
  const pinCheck200 = f.equal(result199, 0n)

  // queryDictionaryValueByKey / query_dictionary_value_by_key / genericId=200154 / literal=1, wire=1
  const result202 = f.queryDictionaryValueByKey(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    201n
  )
  const pinCheck203 = f.equal(result202, 0n)

  // queryEntityByGuid / query_entity_by_guid / genericId=200023 / literal=0, wire=1
  const result204 = f.queryEntityByGuid(wireGuid)
  const pinCheck205 = f.equal(result204, wireEntity)

  // queryEntityFaction / query_entity_faction / genericId=200029 / literal=1, wire=0
  const result206 = f.queryEntityFaction(self)
  const pinCheck207 = f.equal(result206, faction(0n))

  // queryGuidByEntity / query_guid_by_entity / genericId=200027 / literal=0, wire=1
  const result208 = f.queryGuidByEntity(wireEntity)
  const pinCheck209 = f.equal(result208, guid(0n))

  // queryIfDictionaryContainsSpecificKey / query_if_dictionary_contains_specific_key / genericId=200155 / literal=1, wire=1
  const result211 = f.queryIfDictionaryContainsSpecificKey(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    210n
  )
  const pinCheck212 = f.equal(result211, false)

  // queryIfDictionaryContainsSpecificValue / query_if_dictionary_contains_specific_value / genericId=200156 / literal=1, wire=1
  const result214 = f.queryIfDictionaryContainsSpecificValue(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    213n
  )
  const pinCheck215 = f.equal(result214, false)

  // queryIfEntityIsOnTheField / query_if_entity_is_on_the_field / genericId=200103 / literal=0, wire=1
  const result216 = f.queryIfEntityIsOnTheField(wireEntity)
  const pinCheck217 = f.equal(result216, false)

  // queryIfFactionIsHostile / query_if_faction_is_hostile / genericId=200093 / literal=0, wire=2
  const result218 = f.queryIfFactionIsHostile(wireFaction, wireFaction)
  const pinCheck219 = f.equal(result218, false)

  // queryIfSelfIsInCombat / query_if_self_is_in_combat / genericId=200037 / literal=0, wire=0
  const result220 = f.queryIfSelfIsInCombat()
  const pinCheck221 = f.equal(result220, false)

  // querySkillVariableValue / query_skill_variable_value / genericId=200259 / literal=1, wire=0
  const result223 = f.querySkillVariableValue(configId(222n))
  const pinCheck224 = f.equal(result223, 0)

  // queryWhetherPlayerIsCurrentlyInVoiceChat / query_whether_player_is_currently_in_voice_chat / genericId=200271 / literal=1, wire=0
  const result225 = f.queryWhetherPlayerIsCurrentlyInVoiceChat(self)
  const pinCheck226 = f.equal(result225, false)

  // radiansToDegrees / radians_to_degrees / genericId=200101 / literal=1, wire=0
  const result228 = f.radiansToDegrees(227.25)
  const pinCheck229 = f.equal(result228, 0)

  // sineFunction / sine_function / genericId=200094 / literal=0, wire=1
  const result230 = f.sineFunction(wireFloat)
  const pinCheck231 = f.equal(result230, 0)

  // split3dVector / split3d_vector / genericId=200065 / literal=1, wire=0
  const result233 = f.split3dVector([232, 233, 234])
  const pinCheck234 = f.equal(result233.xComponent, 0)
  const pinCheck235 = f.equal(result233.yComponent, 0)
  const pinCheck236 = f.equal(result233.zComponent, 0)

  // subtraction / subtraction / genericId=200012 / literal=2, wire=0
  const result239 = f.subtraction(237n, 238n)
  const pinCheck240 = f.equal(result239, 0n)

  // tangentFunction / tangent_function / genericId=200096 / literal=0, wire=1
  const result241 = f.tangentFunction(wireFloat)
  const pinCheck242 = f.equal(result241, 0)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200243 / literal=1, wire=1
  const result244 = f.whetherTheEntityHasTheSpecifiedUnitStatus(wireEntity, configId(243n))
  const pinCheck245 = f.equal(result244, false)

  const combinedCheck250 = f.logicalAndOperation(pinCheck4, pinCheck8)
  const combinedCheck251 = f.logicalAndOperation(pinCheck12, pinCheck16)
  const combinedCheck252 = f.logicalAndOperation(pinCheck19, pinCheck22)
  const combinedCheck253 = f.logicalAndOperation(pinCheck26, pinCheck30)
  const combinedCheck254 = f.logicalAndOperation(pinCheck33, pinCheck36)
  const combinedCheck255 = f.logicalAndOperation(pinCheck40, pinCheck43)
  const combinedCheck256 = f.logicalAndOperation(pinCheck46, pinCheck49)
  const combinedCheck257 = f.logicalAndOperation(pinCheck53, pinCheck56)
  const combinedCheck258 = f.logicalAndOperation(pinCheck58, pinCheck60)
  const combinedCheck259 = f.logicalAndOperation(pinCheck62, pinCheck67)
  const combinedCheck260 = f.logicalAndOperation(pinCheck69, pinCheck71)
  const combinedCheck261 = f.logicalAndOperation(pinCheck74, pinCheck78)
  const combinedCheck262 = f.logicalAndOperation(pinCheck80, pinCheck82)
  const combinedCheck263 = f.logicalAndOperation(pinCheck86, pinCheck90)
  const combinedCheck264 = f.logicalAndOperation(pinCheck94, pinCheck96)
  const combinedCheck265 = f.logicalAndOperation(pinCheck98, pinCheck101)
  const combinedCheck266 = f.logicalAndOperation(pinCheck103, pinCheck107)
  const combinedCheck267 = f.logicalAndOperation(pinCheck109, pinCheck111)
  const combinedCheck268 = f.logicalAndOperation(pinCheck113, pinCheck116)
  const combinedCheck269 = f.logicalAndOperation(pinCheck118, pinCheck120)
  const combinedCheck270 = f.logicalAndOperation(pinCheck122, pinCheck124)
  const combinedCheck271 = f.logicalAndOperation(pinCheck126, pinCheck128)
  const combinedCheck272 = f.logicalAndOperation(pinCheck130, pinCheck132)
  const combinedCheck273 = f.logicalAndOperation(pinCheck134, pinCheck135)
  const combinedCheck274 = f.logicalAndOperation(pinCheck137, pinCheck140)
  const combinedCheck275 = f.logicalAndOperation(pinCheck142, pinCheck147)
  const combinedCheck276 = f.logicalAndOperation(pinCheck148, pinCheck151)
  const combinedCheck277 = f.logicalAndOperation(pinCheck153, pinCheck155)
  const combinedCheck278 = f.logicalAndOperation(pinCheck158, pinCheck160)
  const combinedCheck279 = f.logicalAndOperation(pinCheck162, pinCheck164)
  const combinedCheck280 = f.logicalAndOperation(pinCheck166, pinCheck170)
  const combinedCheck281 = f.logicalAndOperation(pinCheck174, pinCheck177)
  const combinedCheck282 = f.logicalAndOperation(pinCheck181, pinCheck183)
  const combinedCheck283 = f.logicalAndOperation(pinCheck187, pinCheck191)
  const combinedCheck284 = f.logicalAndOperation(pinCheck195, pinCheck198)
  const combinedCheck285 = f.logicalAndOperation(pinCheck200, pinCheck203)
  const combinedCheck286 = f.logicalAndOperation(pinCheck205, pinCheck207)
  const combinedCheck287 = f.logicalAndOperation(pinCheck209, pinCheck212)
  const combinedCheck288 = f.logicalAndOperation(pinCheck215, pinCheck217)
  const combinedCheck289 = f.logicalAndOperation(pinCheck219, pinCheck221)
  const combinedCheck290 = f.logicalAndOperation(pinCheck224, pinCheck226)
  const combinedCheck291 = f.logicalAndOperation(pinCheck229, pinCheck231)
  const combinedCheck292 = f.logicalAndOperation(pinCheck234, pinCheck235)
  const combinedCheck293 = f.logicalAndOperation(pinCheck236, pinCheck240)
  const combinedCheck294 = f.logicalAndOperation(pinCheck242, pinCheck245)
  const combinedCheck295 = f.logicalAndOperation(pinCheck246, pinCheck247)
  const combinedCheck296 = f.logicalAndOperation(pinCheck248, pinCheck249)
  const combinedCheck297 = f.logicalAndOperation(combinedCheck250, combinedCheck251)
  const combinedCheck298 = f.logicalAndOperation(combinedCheck252, combinedCheck253)
  const combinedCheck299 = f.logicalAndOperation(combinedCheck254, combinedCheck255)
  const combinedCheck300 = f.logicalAndOperation(combinedCheck256, combinedCheck257)
  const combinedCheck301 = f.logicalAndOperation(combinedCheck258, combinedCheck259)
  const combinedCheck302 = f.logicalAndOperation(combinedCheck260, combinedCheck261)
  const combinedCheck303 = f.logicalAndOperation(combinedCheck262, combinedCheck263)
  const combinedCheck304 = f.logicalAndOperation(combinedCheck264, combinedCheck265)
  const combinedCheck305 = f.logicalAndOperation(combinedCheck266, combinedCheck267)
  const combinedCheck306 = f.logicalAndOperation(combinedCheck268, combinedCheck269)
  const combinedCheck307 = f.logicalAndOperation(combinedCheck270, combinedCheck271)
  const combinedCheck308 = f.logicalAndOperation(combinedCheck272, combinedCheck273)
  const combinedCheck309 = f.logicalAndOperation(combinedCheck274, combinedCheck275)
  const combinedCheck310 = f.logicalAndOperation(combinedCheck276, combinedCheck277)
  const combinedCheck311 = f.logicalAndOperation(combinedCheck278, combinedCheck279)
  const combinedCheck312 = f.logicalAndOperation(combinedCheck280, combinedCheck281)
  const combinedCheck313 = f.logicalAndOperation(combinedCheck282, combinedCheck283)
  const combinedCheck314 = f.logicalAndOperation(combinedCheck284, combinedCheck285)
  const combinedCheck315 = f.logicalAndOperation(combinedCheck286, combinedCheck287)
  const combinedCheck316 = f.logicalAndOperation(combinedCheck288, combinedCheck289)
  const combinedCheck317 = f.logicalAndOperation(combinedCheck290, combinedCheck291)
  const combinedCheck318 = f.logicalAndOperation(combinedCheck292, combinedCheck293)
  const combinedCheck319 = f.logicalAndOperation(combinedCheck294, combinedCheck295)
  const combinedCheck320 = f.logicalAndOperation(combinedCheck297, combinedCheck298)
  const combinedCheck321 = f.logicalAndOperation(combinedCheck299, combinedCheck300)
  const combinedCheck322 = f.logicalAndOperation(combinedCheck301, combinedCheck302)
  const combinedCheck323 = f.logicalAndOperation(combinedCheck303, combinedCheck304)
  const combinedCheck324 = f.logicalAndOperation(combinedCheck305, combinedCheck306)
  const combinedCheck325 = f.logicalAndOperation(combinedCheck307, combinedCheck308)
  const combinedCheck326 = f.logicalAndOperation(combinedCheck309, combinedCheck310)
  const combinedCheck327 = f.logicalAndOperation(combinedCheck311, combinedCheck312)
  const combinedCheck328 = f.logicalAndOperation(combinedCheck313, combinedCheck314)
  const combinedCheck329 = f.logicalAndOperation(combinedCheck315, combinedCheck316)
  const combinedCheck330 = f.logicalAndOperation(combinedCheck317, combinedCheck318)
  const combinedCheck331 = f.logicalAndOperation(combinedCheck319, combinedCheck296)
  const combinedCheck332 = f.logicalAndOperation(combinedCheck320, combinedCheck321)
  const combinedCheck333 = f.logicalAndOperation(combinedCheck322, combinedCheck323)
  const combinedCheck334 = f.logicalAndOperation(combinedCheck324, combinedCheck325)
  const combinedCheck335 = f.logicalAndOperation(combinedCheck326, combinedCheck327)
  const combinedCheck336 = f.logicalAndOperation(combinedCheck328, combinedCheck329)
  const combinedCheck337 = f.logicalAndOperation(combinedCheck330, combinedCheck331)
  const combinedCheck338 = f.logicalAndOperation(combinedCheck332, combinedCheck333)
  const combinedCheck339 = f.logicalAndOperation(combinedCheck334, combinedCheck335)
  const combinedCheck340 = f.logicalAndOperation(combinedCheck336, combinedCheck337)
  const combinedCheck341 = f.logicalAndOperation(combinedCheck338, combinedCheck339)
  const combinedCheck342 = f.logicalAndOperation(combinedCheck341, combinedCheck340)
  return combinedCheck342
})

g.intFilter({
  id: 1082130448,
  name: 'AllClientNodesIntFilterClassic',
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
  const pinCheck228 = f.equal(wireStr, '')
  const pinCheck229 = f.equal(wireGuid, guid(0n))
  const pinCheck230 = f.equal(wireConfig, configId(0n))
  const pinCheck231 = f.equal(wirePrefab, prefabId(0n))

  // _3dVectorAddition / _3d_vector_addition / genericId=200071 / literal=0, wire=2
  const result3 = f._3dVectorAddition(wireVec3, wireVec3)
  const pinCheck4 = f.equal(result3, [0, 0, 0])

  // _3dVectorAngle / _3d_vector_angle / genericId=200067 / literal=2, wire=0
  const result7 = f._3dVectorAngle([5, 6, 7], [6, 7, 8])
  const pinCheck8 = f.equal(result7, 0)

  // _3dVectorCrossProduct / _3d_vector_cross_product / genericId=200064 / literal=2, wire=0
  const result11 = f._3dVectorCrossProduct([9, 10, 11], [10, 11, 12])
  const pinCheck12 = f.equal(result11, [0, 0, 0])

  // _3dVectorDotProduct / _3d_vector_dot_product / genericId=200063 / literal=0, wire=2
  const result15 = f._3dVectorDotProduct(wireVec3, wireVec3)
  const pinCheck16 = f.equal(result15, 0)

  // _3dVectorModuloOperation / _3d_vector_modulo_operation / genericId=200069 / literal=0, wire=1
  const result18 = f._3dVectorModuloOperation(wireVec3)
  const pinCheck19 = f.equal(result18, 0)

  // _3dVectorNormalization / _3d_vector_normalization / genericId=200100 / literal=0, wire=1
  const result21 = f._3dVectorNormalization(wireVec3)
  const pinCheck22 = f.equal(result21, [0, 0, 0])

  // _3dVectorRotation / _3d_vector_rotation / genericId=200068 / literal=1, wire=1
  const result25 = f._3dVectorRotation([23, 24, 25], wireVec3)
  const pinCheck26 = f.equal(result25, [0, 0, 0])

  // _3dVectorSubtraction / _3d_vector_subtraction / genericId=200072 / literal=0, wire=2
  const result29 = f._3dVectorSubtraction(wireVec3, wireVec3)
  const pinCheck30 = f.equal(result29, [0, 0, 0])

  // _3dVectorZoom / _3d_vector_zoom / genericId=200066 / literal=2, wire=0
  const result33 = f._3dVectorZoom(31.25, [32, 33, 34])
  const pinCheck34 = f.equal(result33, [0, 0, 0])

  // absoluteValueOperation / absolute_value_operation / genericId=200015 / literal=0, wire=1
  const result35 = f.absoluteValueOperation(wireInt)
  const pinCheck36 = f.equal(result35, 0n)

  // addition / addition / genericId=200011 / literal=0, wire=2
  const result37 = f.addition(wireInt, wireInt)
  const pinCheck38 = f.equal(result37, 0n)

  // arccosineFunction / arccosine_function / genericId=200098 / literal=0, wire=1
  const result39 = f.arccosineFunction(wireFloat)
  const pinCheck40 = f.equal(result39, 0)

  // arcsineFunction / arcsine_function / genericId=200097 / literal=0, wire=1
  const result41 = f.arcsineFunction(wireFloat)
  const pinCheck42 = f.equal(result41, 0)

  // arctangentFunction / arctangent_function / genericId=200099 / literal=0, wire=1
  const result43 = f.arctangentFunction(wireFloat)
  const pinCheck44 = f.equal(result43, 0)

  // assemblyDictionary / assembly_dictionary / genericId=200152 / literal=0, wire=1
  const pinCheck46 = f.greaterThanOrEqualTo(
    f.queryDictionarySLength(
      f.assemblyDictionary([
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt },
        { k: wireInt, v: wireInt }
      ])
    ),
    0n
  )

  // assemblyList / assembly_list / genericId=200049 / literal=1, wire=1
  const pinCheck48 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.assemblyList(
        [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
        'int'
      )
    ),
    0n
  )

  // checkClassicModeCharacterId / check_classic_mode_character_id / genericId=200254 / literal=0, wire=1
  const result49 = f.checkClassicModeCharacterId(wireEntity)
  const pinCheck50 = f.equal(result49, 0n)

  // checkThePresetStatusValueOfTheComplexCreation / check_the_preset_status_value_of_the_complex_creation / genericId=200244 / literal=2, wire=0
  const result52 = f.checkThePresetStatusValueOfTheComplexCreation(self, 51n)
  const pinCheck53 = f.equal(result52, 0n)

  // cosineFunction / cosine_function / genericId=200095 / literal=1, wire=0
  const result55 = f.cosineFunction(54.25)
  const pinCheck56 = f.equal(result55, 0)

  // create3dVector / create3d_vector / genericId=200070 / literal=0, wire=3
  const result57 = f.create3dVector(wireFloat, wireFloat, wireFloat)
  const pinCheck58 = f.equal(result57, [0, 0, 0])

  // createDictionary / create_dictionary / genericId=200153 / literal=0, wire=2
  const pinCheck60 = f.greaterThanOrEqualTo(
    f.queryDictionarySLength(
      f.createDictionary(
        f.assemblyList(
          [
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt
          ],
          'int'
        ),
        f.assemblyList(
          [
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt,
            wireInt
          ],
          'int'
        )
      )
    ),
    0n
  )

  // dataTypeConversion / data_type_conversion / genericId=200022 / literal=2, wire=0
  const result62 = f.dataTypeConversion(61n, 'str')
  const pinCheck63 = f.equal(result62, '')

  // degreesToRadians / degrees_to_radians / genericId=200102 / literal=0, wire=1
  const result64 = f.degreesToRadians(wireFloat)
  const pinCheck65 = f.equal(result64, 0)

  // directionVectorToRotation / direction_vector_to_rotation / genericId=200073 / literal=1, wire=1
  const result68 = f.directionVectorToRotation(wireVec3, [67, 68, 69])
  const pinCheck69 = f.equal(result68, [0, 0, 0])

  // division / division / genericId=200014 / literal=2, wire=0
  const result72 = f.division(70n, 71n)
  const pinCheck73 = f.equal(result72, 0n)

  // enumerationMatch / enumeration_match / genericId=200005 / literal=2, wire=0
  const result74 = f.enumerationMatch(E.SortBy.Ascending, E.SortBy.Ascending)
  const pinCheck75 = f.equal(result74, false)

  // equal / equal / genericId=200006 / literal=0, wire=2
  const result76 = f.equal(wireInt, wireInt)
  const pinCheck77 = f.equal(result76, false)

  // filterEntityListWithinSphericalRange / filter_entity_list_within_spherical_range / genericId=200043 / literal=2, wire=2
  const pinCheck81 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSphericalRange(
        78.25,
        wireVec3,
        wireInt,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )

  // filterEntityListWithinSquareRange / filter_entity_list_within_square_range / genericId=200044 / literal=4, wire=2
  const pinCheck87 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSquareRange(
        82.25,
        83.25,
        84.25,
        wireVec3,
        wireInt,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )

  // getActiveCharacterOfSpecifiedPlayer / get_active_character_of_specified_player / genericId=200251 / literal=0, wire=1
  const result88 = f.getActiveCharacterOfSpecifiedPlayer(wireEntity)
  const pinCheck89 = f.equal(result88, wireEntity)

  // getAllEntitiesWithinTheCollisionTrigger / get_all_entities_within_the_collision_trigger / genericId=200107 / literal=2, wire=0
  const pinCheck92 = f.greaterThanOrEqualTo(
    f.getListLength(f.getAllEntitiesWithinTheCollisionTrigger(self, 90n)),
    0n
  )

  // getCorrespondingValueFromList / get_corresponding_value_from_list / genericId=200017 / literal=0, wire=2
  const result93 = f.getCorrespondingValueFromList(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck94 = f.equal(result93, 0n)

  // getCurrentCharacter / get_current_character / genericId=200076 / literal=0, wire=0
  const result95 = f.getCurrentCharacter()
  const pinCheck96 = f.equal(result95, wireEntity)

  // getCustomVariable / get_custom_variable / genericId=200016 / literal=0, wire=2
  const result97 = f.getCustomVariable(wireEntity, wireStr)
  const narrowed98 = result97.asType('int')
  const pinCheck99 = f.equal(narrowed98, 0n)

  // getEntityLocation / get_entity_location / genericId=200030 / literal=0, wire=1
  const result100 = f.getEntityLocation(wireEntity)
  const pinCheck101 = f.equal(result100, [0, 0, 0])

  // getEntityRotation / get_entity_rotation / genericId=200031 / literal=1, wire=0
  const result102 = f.getEntityRotation(self)
  const pinCheck103 = f.equal(result102, [0, 0, 0])

  // getEntitySType / get_entity_s_type / genericId=200045 / literal=1, wire=0
  const result104 = f.getEntitySType(self)
  const pinCheck105 = f.enumerationMatch(result104, E.EntityType.Stage)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe107 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.None,
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
  const pinCheck108 = f.equal(enumListProbe107.onHitLocation, [0, 0, 0])

  // getListLength / get_list_length / genericId=200018 / literal=0, wire=1
  const result109 = f.getListLength(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck110 = f.equal(result109, 0n)

  // getListOfKeysFromDictionary / get_list_of_keys_from_dictionary / genericId=200159 / literal=0, wire=1
  const pinCheck112 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.getListOfKeysFromDictionary(
        f.assemblyDictionary([
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt }
        ])
      )
    ),
    0n
  )

  // getListOfPlayerEntitiesOnTheField / get_list_of_player_entities_on_the_field / genericId=200026 / literal=0, wire=0
  const pinCheck114 = f.greaterThanOrEqualTo(
    f.getListLength(f.getListOfPlayerEntitiesOnTheField()),
    0n
  )

  // getListOfValuesFromDictionary / get_list_of_values_from_dictionary / genericId=200158 / literal=0, wire=1
  const pinCheck116 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.getListOfValuesFromDictionary(
        f.assemblyDictionary([
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt },
          { k: wireInt, v: wireInt }
        ])
      )
    ),
    0n
  )

  // getMaximumValueFromList / get_maximum_value_from_list / genericId=200020 / literal=0, wire=1
  const result117 = f.getMaximumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck118 = f.equal(result117, 0n)

  // getMinimumValueFromList / get_minimum_value_from_list / genericId=200021 / literal=0, wire=1
  const result119 = f.getMinimumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck120 = f.equal(result119, 0n)

  // getPlayerClientInputDeviceType / get_player_client_input_device_type / genericId=200123 / literal=0, wire=0
  const result121 = f.getPlayerClientInputDeviceType()
  const pinCheck122 = f.enumerationMatch(result121, E.InputDeviceType.KeyboardAndMouse)

  // getPlayerEntityToWhichTheCharacterBelongs / get_player_entity_to_which_the_character_belongs / genericId=200025 / literal=1, wire=0
  const result123 = f.getPlayerEntityToWhichTheCharacterBelongs(self)
  const pinCheck124 = f.equal(result123, wireEntity)

  // getPlayerMovementInput / get_player_movement_input / genericId=200255 / literal=0, wire=0
  const result125 = f.getPlayerMovementInput()
  const pinCheck126 = f.equal(result125.inputDirection, 0)
  const pinCheck127 = f.equal(result125.inputStrength, 0)

  // getPlayerSCharacterList / get_player_s_character_list / genericId=200242 / literal=0, wire=1
  const pinCheck129 = f.greaterThanOrEqualTo(
    f.getListLength(f.getPlayerSCharacterList(wireEntity)),
    0n
  )

  // getPresetStatus / get_preset_status / genericId=200028 / literal=1, wire=1
  const result130 = f.getPresetStatus(self, wireInt)
  const pinCheck131 = f.equal(result130, 0n)

  // getRandomNumber / get_random_number / genericId=200032 / literal=2, wire=0
  const result134 = f.getRandomNumber(132n, 133n)
  const pinCheck135 = f.equal(result134, 0n)

  // getRayDetectionResult / get_ray_detection_result / genericId=200109 / literal=4, wire=3
  const result138 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    [137, 138, 139],
    wireFloat,
    E.TargetType.None,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    [CE.RayFilterType.Hurtbox, CE.RayFilterType.Scene, CE.RayFilterType.ObjectSelfCollision]
  )
  const pinCheck139 = f.equal(result138.onHitLocation, [0, 0, 0])
  const pinCheck140 = f.equal(result138.onHitEntity, wireEntity)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200110 / literal=1, wire=0
  const enumListProbe142 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    wireVec3,
    wireFloat,
    E.TargetType.None,
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
  const pinCheck143 = f.equal(enumListProbe142.onHitLocation, [0, 0, 0])

  // getSelfEntity / get_self_entity / genericId=200033 / literal=0, wire=0
  const result144 = f.getSelfEntity()
  const pinCheck145 = f.equal(result144, wireEntity)

  // getTargetAttachmentPointLocation / get_target_attachment_point_location / genericId=200047 / literal=1, wire=1
  const result147 = f.getTargetAttachmentPointLocation(wireEntity, 'literal-146')
  const pinCheck148 = f.equal(result147, [0, 0, 0])

  // getTargetAttachmentPointRotation / get_target_attachment_point_rotation / genericId=200048 / literal=1, wire=1
  const result149 = f.getTargetAttachmentPointRotation(self, wireStr)
  const pinCheck150 = f.equal(result149, [0, 0, 0])

  // getTargetEntity / get_target_entity / genericId=200034 / literal=0, wire=0
  const result151 = f.getTargetEntity()
  const pinCheck152 = f.equal(result151, wireEntity)

  // getUnitAttackTarget / get_unit_attack_target / genericId=200035 / literal=1, wire=0
  const result153 = f.getUnitAttackTarget(self)
  const pinCheck154 = f.equal(result153, wireEntity)

  // greaterThan / greater_than / genericId=200007 / literal=2, wire=0
  const result157 = f.greaterThan(155n, 156n)
  const pinCheck158 = f.equal(result157, false)

  // greaterThanOrEqualTo / greater_than_or_equal_to / genericId=200010 / literal=2, wire=0
  const result161 = f.greaterThanOrEqualTo(159n, 160n)
  const pinCheck162 = f.equal(result161, false)

  // lessThan / less_than / genericId=200008 / literal=0, wire=2
  const result163 = f.lessThan(wireInt, wireInt)
  const pinCheck164 = f.equal(result163, false)

  // lessThanOrEqualTo / less_than_or_equal_to / genericId=200009 / literal=0, wire=2
  const result165 = f.lessThanOrEqualTo(wireInt, wireInt)
  const pinCheck166 = f.equal(result165, false)

  // listIncludesThisValue / list_includes_this_value / genericId=200019 / literal=0, wire=2
  const result167 = f.listIncludesThisValue(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck168 = f.equal(result167, false)

  // logicalAndOperation / logical_and_operation / genericId=200001 / literal=0, wire=2
  const result169 = f.logicalAndOperation(wireBool, wireBool)
  const pinCheck170 = f.equal(result169, false)

  // logicalNotOperation / logical_not_operation / genericId=200003 / literal=1, wire=0
  const result172 = f.logicalNotOperation(true)
  const pinCheck173 = f.equal(result172, false)

  // logicalOrOperation / logical_or_operation / genericId=200002 / literal=0, wire=2
  const result174 = f.logicalOrOperation(wireBool, wireBool)
  const pinCheck175 = f.equal(result174, false)

  // logicalXorOperation / logical_xor_operation / genericId=200004 / literal=0, wire=2
  const result176 = f.logicalXorOperation(wireBool, wireBool)
  const pinCheck177 = f.equal(result176, false)

  // multiplication / multiplication / genericId=200013 / literal=0, wire=2
  const result178 = f.multiplication(wireInt, wireInt)
  const pinCheck179 = f.equal(result178, 0n)

  // orientationToRotation / orientation_to_rotation / genericId=200074 / literal=0, wire=1
  const result181 = f.orientationToRotation(wireVec3)
  const pinCheck182 = f.equal(result181, [0, 0, 0])

  // queryDictionarySLength / query_dictionary_s_length / genericId=200157 / literal=0, wire=1
  const result183 = f.queryDictionarySLength(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ])
  )
  const pinCheck184 = f.equal(result183, 0n)

  // queryDictionaryValueByKey / query_dictionary_value_by_key / genericId=200154 / literal=0, wire=2
  const result185 = f.queryDictionaryValueByKey(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    wireInt
  )
  const pinCheck186 = f.equal(result185, 0n)

  // queryEntityByGuid / query_entity_by_guid / genericId=200023 / literal=1, wire=0
  const result188 = f.queryEntityByGuid(guid(187n))
  const pinCheck189 = f.equal(result188, wireEntity)

  // queryEntityFaction / query_entity_faction / genericId=200029 / literal=0, wire=1
  const result190 = f.queryEntityFaction(wireEntity)
  const pinCheck191 = f.equal(result190, faction(0n))

  // queryGuidByEntity / query_guid_by_entity / genericId=200027 / literal=1, wire=0
  const result192 = f.queryGuidByEntity(self)
  const pinCheck193 = f.equal(result192, guid(0n))

  // queryIfDictionaryContainsSpecificKey / query_if_dictionary_contains_specific_key / genericId=200155 / literal=0, wire=2
  const result194 = f.queryIfDictionaryContainsSpecificKey(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    wireInt
  )
  const pinCheck195 = f.equal(result194, false)

  // queryIfDictionaryContainsSpecificValue / query_if_dictionary_contains_specific_value / genericId=200156 / literal=0, wire=2
  const result196 = f.queryIfDictionaryContainsSpecificValue(
    f.assemblyDictionary([
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt },
      { k: wireInt, v: wireInt }
    ]),
    wireInt
  )
  const pinCheck197 = f.equal(result196, false)

  // queryIfEntityIsOnTheField / query_if_entity_is_on_the_field / genericId=200103 / literal=1, wire=0
  const result198 = f.queryIfEntityIsOnTheField(self)
  const pinCheck199 = f.equal(result198, false)

  // queryIfFactionIsHostile / query_if_faction_is_hostile / genericId=200093 / literal=2, wire=0
  const result202 = f.queryIfFactionIsHostile(faction(200n), faction(201n))
  const pinCheck203 = f.equal(result202, false)

  // queryIfSelfIsInCombat / query_if_self_is_in_combat / genericId=200037 / literal=0, wire=0
  const result204 = f.queryIfSelfIsInCombat()
  const pinCheck205 = f.equal(result204, false)

  // querySkillVariableValue / query_skill_variable_value / genericId=200259 / literal=1, wire=0
  const result207 = f.querySkillVariableValue(configId(206n))
  const pinCheck208 = f.equal(result207, 0)

  // queryWhetherPlayerIsCurrentlyInVoiceChat / query_whether_player_is_currently_in_voice_chat / genericId=200271 / literal=0, wire=1
  const result209 = f.queryWhetherPlayerIsCurrentlyInVoiceChat(wireEntity)
  const pinCheck210 = f.equal(result209, false)

  // radiansToDegrees / radians_to_degrees / genericId=200101 / literal=0, wire=1
  const result211 = f.radiansToDegrees(wireFloat)
  const pinCheck212 = f.equal(result211, 0)

  // sineFunction / sine_function / genericId=200094 / literal=1, wire=0
  const result214 = f.sineFunction(213.25)
  const pinCheck215 = f.equal(result214, 0)

  // split3dVector / split3d_vector / genericId=200065 / literal=0, wire=1
  const result217 = f.split3dVector(wireVec3)
  const pinCheck218 = f.equal(result217.xComponent, 0)
  const pinCheck219 = f.equal(result217.yComponent, 0)
  const pinCheck220 = f.equal(result217.zComponent, 0)

  // subtraction / subtraction / genericId=200012 / literal=0, wire=2
  const result221 = f.subtraction(wireInt, wireInt)
  const pinCheck222 = f.equal(result221, 0n)

  // tangentFunction / tangent_function / genericId=200096 / literal=1, wire=0
  const result224 = f.tangentFunction(223.25)
  const pinCheck225 = f.equal(result224, 0)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200243 / literal=1, wire=1
  const result226 = f.whetherTheEntityHasTheSpecifiedUnitStatus(self, wireConfig)
  const pinCheck227 = f.equal(result226, false)

  const combinedCheck232 = f.logicalAndOperation(pinCheck4, pinCheck8)
  const combinedCheck233 = f.logicalAndOperation(pinCheck12, pinCheck16)
  const combinedCheck234 = f.logicalAndOperation(pinCheck19, pinCheck22)
  const combinedCheck235 = f.logicalAndOperation(pinCheck26, pinCheck30)
  const combinedCheck236 = f.logicalAndOperation(pinCheck34, pinCheck36)
  const combinedCheck237 = f.logicalAndOperation(pinCheck38, pinCheck40)
  const combinedCheck238 = f.logicalAndOperation(pinCheck42, pinCheck44)
  const combinedCheck239 = f.logicalAndOperation(pinCheck46, pinCheck48)
  const combinedCheck240 = f.logicalAndOperation(pinCheck50, pinCheck53)
  const combinedCheck241 = f.logicalAndOperation(pinCheck56, pinCheck58)
  const combinedCheck242 = f.logicalAndOperation(pinCheck60, pinCheck63)
  const combinedCheck243 = f.logicalAndOperation(pinCheck65, pinCheck69)
  const combinedCheck244 = f.logicalAndOperation(pinCheck73, pinCheck75)
  const combinedCheck245 = f.logicalAndOperation(pinCheck77, pinCheck81)
  const combinedCheck246 = f.logicalAndOperation(pinCheck87, pinCheck89)
  const combinedCheck247 = f.logicalAndOperation(pinCheck92, pinCheck94)
  const combinedCheck248 = f.logicalAndOperation(pinCheck96, pinCheck99)
  const combinedCheck249 = f.logicalAndOperation(pinCheck101, pinCheck103)
  const combinedCheck250 = f.logicalAndOperation(pinCheck105, pinCheck108)
  const combinedCheck251 = f.logicalAndOperation(pinCheck110, pinCheck112)
  const combinedCheck252 = f.logicalAndOperation(pinCheck114, pinCheck116)
  const combinedCheck253 = f.logicalAndOperation(pinCheck118, pinCheck120)
  const combinedCheck254 = f.logicalAndOperation(pinCheck122, pinCheck124)
  const combinedCheck255 = f.logicalAndOperation(pinCheck126, pinCheck127)
  const combinedCheck256 = f.logicalAndOperation(pinCheck129, pinCheck131)
  const combinedCheck257 = f.logicalAndOperation(pinCheck135, pinCheck139)
  const combinedCheck258 = f.logicalAndOperation(pinCheck140, pinCheck143)
  const combinedCheck259 = f.logicalAndOperation(pinCheck145, pinCheck148)
  const combinedCheck260 = f.logicalAndOperation(pinCheck150, pinCheck152)
  const combinedCheck261 = f.logicalAndOperation(pinCheck154, pinCheck158)
  const combinedCheck262 = f.logicalAndOperation(pinCheck162, pinCheck164)
  const combinedCheck263 = f.logicalAndOperation(pinCheck166, pinCheck168)
  const combinedCheck264 = f.logicalAndOperation(pinCheck170, pinCheck173)
  const combinedCheck265 = f.logicalAndOperation(pinCheck175, pinCheck177)
  const combinedCheck266 = f.logicalAndOperation(pinCheck179, pinCheck182)
  const combinedCheck267 = f.logicalAndOperation(pinCheck184, pinCheck186)
  const combinedCheck268 = f.logicalAndOperation(pinCheck189, pinCheck191)
  const combinedCheck269 = f.logicalAndOperation(pinCheck193, pinCheck195)
  const combinedCheck270 = f.logicalAndOperation(pinCheck197, pinCheck199)
  const combinedCheck271 = f.logicalAndOperation(pinCheck203, pinCheck205)
  const combinedCheck272 = f.logicalAndOperation(pinCheck208, pinCheck210)
  const combinedCheck273 = f.logicalAndOperation(pinCheck212, pinCheck215)
  const combinedCheck274 = f.logicalAndOperation(pinCheck218, pinCheck219)
  const combinedCheck275 = f.logicalAndOperation(pinCheck220, pinCheck222)
  const combinedCheck276 = f.logicalAndOperation(pinCheck225, pinCheck227)
  const combinedCheck277 = f.logicalAndOperation(pinCheck228, pinCheck229)
  const combinedCheck278 = f.logicalAndOperation(pinCheck230, pinCheck231)
  const combinedCheck279 = f.logicalAndOperation(combinedCheck232, combinedCheck233)
  const combinedCheck280 = f.logicalAndOperation(combinedCheck234, combinedCheck235)
  const combinedCheck281 = f.logicalAndOperation(combinedCheck236, combinedCheck237)
  const combinedCheck282 = f.logicalAndOperation(combinedCheck238, combinedCheck239)
  const combinedCheck283 = f.logicalAndOperation(combinedCheck240, combinedCheck241)
  const combinedCheck284 = f.logicalAndOperation(combinedCheck242, combinedCheck243)
  const combinedCheck285 = f.logicalAndOperation(combinedCheck244, combinedCheck245)
  const combinedCheck286 = f.logicalAndOperation(combinedCheck246, combinedCheck247)
  const combinedCheck287 = f.logicalAndOperation(combinedCheck248, combinedCheck249)
  const combinedCheck288 = f.logicalAndOperation(combinedCheck250, combinedCheck251)
  const combinedCheck289 = f.logicalAndOperation(combinedCheck252, combinedCheck253)
  const combinedCheck290 = f.logicalAndOperation(combinedCheck254, combinedCheck255)
  const combinedCheck291 = f.logicalAndOperation(combinedCheck256, combinedCheck257)
  const combinedCheck292 = f.logicalAndOperation(combinedCheck258, combinedCheck259)
  const combinedCheck293 = f.logicalAndOperation(combinedCheck260, combinedCheck261)
  const combinedCheck294 = f.logicalAndOperation(combinedCheck262, combinedCheck263)
  const combinedCheck295 = f.logicalAndOperation(combinedCheck264, combinedCheck265)
  const combinedCheck296 = f.logicalAndOperation(combinedCheck266, combinedCheck267)
  const combinedCheck297 = f.logicalAndOperation(combinedCheck268, combinedCheck269)
  const combinedCheck298 = f.logicalAndOperation(combinedCheck270, combinedCheck271)
  const combinedCheck299 = f.logicalAndOperation(combinedCheck272, combinedCheck273)
  const combinedCheck300 = f.logicalAndOperation(combinedCheck274, combinedCheck275)
  const combinedCheck301 = f.logicalAndOperation(combinedCheck276, combinedCheck277)
  const combinedCheck302 = f.logicalAndOperation(combinedCheck279, combinedCheck280)
  const combinedCheck303 = f.logicalAndOperation(combinedCheck281, combinedCheck282)
  const combinedCheck304 = f.logicalAndOperation(combinedCheck283, combinedCheck284)
  const combinedCheck305 = f.logicalAndOperation(combinedCheck285, combinedCheck286)
  const combinedCheck306 = f.logicalAndOperation(combinedCheck287, combinedCheck288)
  const combinedCheck307 = f.logicalAndOperation(combinedCheck289, combinedCheck290)
  const combinedCheck308 = f.logicalAndOperation(combinedCheck291, combinedCheck292)
  const combinedCheck309 = f.logicalAndOperation(combinedCheck293, combinedCheck294)
  const combinedCheck310 = f.logicalAndOperation(combinedCheck295, combinedCheck296)
  const combinedCheck311 = f.logicalAndOperation(combinedCheck297, combinedCheck298)
  const combinedCheck312 = f.logicalAndOperation(combinedCheck299, combinedCheck300)
  const combinedCheck313 = f.logicalAndOperation(combinedCheck301, combinedCheck278)
  const combinedCheck314 = f.logicalAndOperation(combinedCheck302, combinedCheck303)
  const combinedCheck315 = f.logicalAndOperation(combinedCheck304, combinedCheck305)
  const combinedCheck316 = f.logicalAndOperation(combinedCheck306, combinedCheck307)
  const combinedCheck317 = f.logicalAndOperation(combinedCheck308, combinedCheck309)
  const combinedCheck318 = f.logicalAndOperation(combinedCheck310, combinedCheck311)
  const combinedCheck319 = f.logicalAndOperation(combinedCheck312, combinedCheck313)
  const combinedCheck320 = f.logicalAndOperation(combinedCheck314, combinedCheck315)
  const combinedCheck321 = f.logicalAndOperation(combinedCheck316, combinedCheck317)
  const combinedCheck322 = f.logicalAndOperation(combinedCheck318, combinedCheck319)
  const combinedCheck323 = f.logicalAndOperation(combinedCheck320, combinedCheck321)
  const combinedCheck324 = f.logicalAndOperation(combinedCheck323, combinedCheck322)
  return f.dataTypeConversion(combinedCheck324, 'int')
})
