/**
 * AUTO-GENERATED exhaustive client-node import fixture (beyond).
 *
 * Regenerate: npm run gen:client:manual
 * Build GIA: node ./bin/gsts.mjs tests/manual/client-nodes/beyond.ts -c ./gsts.test.config.ts --noinject
 *
 * Graph IDs:
 *   1082130435  AllClientNodesCharacterSkillBeyond (character_skill)
 *   1082130436  AllClientNodesCharacterControlSkillBeyond (character_control_skill)
 *   1082130437  AllClientNodesCreationSkillBeyond (creation_skill)
 *   1082130438  AllClientNodesCreationStatusBeyond (creation_status)
 *   1082130439  AllClientNodesCreationStatusDecisionBeyond (creation_status_decision)
 *   1082130440  AllClientNodesBoolFilterBeyond (bool_filter)
 *   1082130441  AllClientNodesIntFilterBeyond (int_filter)
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
  id: 1082130435,
  name: 'AllClientNodesCharacterSkillBeyond',
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
  const pinCheck527 = f.equal(wireStr, '')
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck527)
  const pinCheck528 = f.equal(wireGuid, guid(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck528)
  const pinCheck529 = f.equal(wireConfig, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck529)
  const pinCheck530 = f.equal(wirePrefab, prefabId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck530)

  // _3dVectorAddition / _3d_vector_addition / genericId=200071 / literal=0, wire=2
  const result3 = f._3dVectorAddition(wireVec3, wireVec3)
  const pinCheck4 = f.equal(result3, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck4)

  // _3dVectorAngle / _3d_vector_angle / genericId=200067 / literal=2, wire=0
  const result7 = f._3dVectorAngle([5, 6, 7], [6, 7, 8])
  const pinCheck8 = f.equal(result7, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck8)

  // _3dVectorCrossProduct / _3d_vector_cross_product / genericId=200064 / literal=2, wire=0
  const result11 = f._3dVectorCrossProduct([9, 10, 11], [10, 11, 12])
  const pinCheck12 = f.equal(result11, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck12)

  // _3dVectorDotProduct / _3d_vector_dot_product / genericId=200063 / literal=0, wire=2
  const result15 = f._3dVectorDotProduct(wireVec3, wireVec3)
  const pinCheck16 = f.equal(result15, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck16)

  // _3dVectorModuloOperation / _3d_vector_modulo_operation / genericId=200069 / literal=0, wire=1
  const result18 = f._3dVectorModuloOperation(wireVec3)
  const pinCheck19 = f.equal(result18, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck19)

  // _3dVectorNormalization / _3d_vector_normalization / genericId=200100 / literal=0, wire=1
  const result21 = f._3dVectorNormalization(wireVec3)
  const pinCheck22 = f.equal(result21, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck22)

  // _3dVectorRotation / _3d_vector_rotation / genericId=200068 / literal=1, wire=1
  const result25 = f._3dVectorRotation([23, 24, 25], wireVec3)
  const pinCheck26 = f.equal(result25, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck26)

  // _3dVectorSubtraction / _3d_vector_subtraction / genericId=200072 / literal=0, wire=2
  const result29 = f._3dVectorSubtraction(wireVec3, wireVec3)
  const pinCheck30 = f.equal(result29, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck30)

  // _3dVectorZoom / _3d_vector_zoom / genericId=200066 / literal=2, wire=0
  const result33 = f._3dVectorZoom(31.25, [32, 33, 34])
  const pinCheck34 = f.equal(result33, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck34)

  // absoluteValueOperation / absolute_value_operation / genericId=200015 / literal=0, wire=1
  const result35 = f.absoluteValueOperation(wireInt)
  const pinCheck36 = f.equal(result35, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck36)

  // addition / addition / genericId=200011 / literal=0, wire=2
  const result39 = f.addition(wireInt, wireInt)
  const pinCheck40 = f.equal(result39, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck40)

  // arccosineFunction / arccosine_function / genericId=200098 / literal=0, wire=1
  const result41 = f.arccosineFunction(wireFloat)
  const pinCheck42 = f.equal(result41, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck42)

  // arcsineFunction / arcsine_function / genericId=200097 / literal=0, wire=1
  const result43 = f.arcsineFunction(wireFloat)
  const pinCheck44 = f.equal(result43, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck44)

  // arctangentFunction / arctangent_function / genericId=200099 / literal=0, wire=1
  const result45 = f.arctangentFunction(wireFloat)
  const pinCheck46 = f.equal(result45, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck46)

  // assemblyDictionary / assembly_dictionary / genericId=200152 / literal=0, wire=1
  const pinCheck48 = f.greaterThanOrEqualTo(
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
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck48)

  // assemblyList / assembly_list / genericId=200049 / literal=1, wire=1
  const pinCheck50 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.assemblyList(
        [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
        'int'
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck50)

  // checkThePresetStatusValueOfTheComplexCreation / check_the_preset_status_value_of_the_complex_creation / genericId=200244 / literal=2, wire=0
  const result62 = f.checkThePresetStatusValueOfTheComplexCreation(self, 61n)
  const pinCheck63 = f.equal(result62, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck63)

  // cosineFunction / cosine_function / genericId=200095 / literal=1, wire=0
  const result65 = f.cosineFunction(64.25)
  const pinCheck66 = f.equal(result65, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck66)

  // create3dVector / create3d_vector / genericId=200070 / literal=0, wire=3
  const result67 = f.create3dVector(wireFloat, wireFloat, wireFloat)
  const pinCheck68 = f.equal(result67, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck68)

  // createDictionary / create_dictionary / genericId=200153 / literal=0, wire=2
  const pinCheck70 = f.greaterThanOrEqualTo(
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
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck70)

  // dataTypeConversion / data_type_conversion / genericId=200022 / literal=2, wire=0
  const result72 = f.dataTypeConversion(71n, 'str')
  const pinCheck73 = f.equal(result72, '')
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck73)

  // degreesToRadians / degrees_to_radians / genericId=200102 / literal=0, wire=1
  const result74 = f.degreesToRadians(wireFloat)
  const pinCheck75 = f.equal(result74, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck75)

  // directionVectorToRotation / direction_vector_to_rotation / genericId=200073 / literal=1, wire=1
  const result78 = f.directionVectorToRotation(wireVec3, [77, 78, 79])
  const pinCheck79 = f.equal(result78, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck79)

  // division / division / genericId=200014 / literal=2, wire=0
  const result82 = f.division(80n, 81n)
  const pinCheck83 = f.equal(result82, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck83)

  // enumerationMatch / enumeration_match / genericId=200005 / literal=2, wire=0
  const result85 = f.enumerationMatch(E.SortBy.Ascending, E.SortBy.Ascending)
  const pinCheck86 = f.equal(result85, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck86)

  // equal / equal / genericId=200006 / literal=0, wire=2
  const result87 = f.equal(wireInt, wireInt)
  const pinCheck88 = f.equal(result87, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck88)

  // filterEntityListWithinSphericalRange / filter_entity_list_within_spherical_range / genericId=200043 / literal=2, wire=2
  const pinCheck92 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSphericalRange(
        89.25,
        wireVec3,
        wireInt,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck92)

  // filterEntityListWithinSquareRange / filter_entity_list_within_square_range / genericId=200044 / literal=4, wire=2
  const pinCheck98 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSquareRange(
        93.25,
        94.25,
        95.25,
        wireVec3,
        wireInt,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck98)

  // getAllEntitiesWithinTheCollisionTrigger / get_all_entities_within_the_collision_trigger / genericId=200107 / literal=2, wire=0
  const pinCheck109 = f.greaterThanOrEqualTo(
    f.getListLength(f.getAllEntitiesWithinTheCollisionTrigger(self, 107n)),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck109)

  // getAllValidEntitiesThatAreScannableByScanComponent / get_all_valid_entities_that_are_scannable_by_scan_component / genericId=200119 / literal=0, wire=0
  const pinCheck111 = f.greaterThanOrEqualTo(
    f.getListLength(f.getAllValidEntitiesThatAreScannableByScanComponent()),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck111)

  // getBaseObjectOfSpecifiedPreAiming / get_base_object_of_specified_pre_aiming / genericId=200276 / literal=1, wire=1
  const result112 = f.getBaseObjectOfSpecifiedPreAiming(wireInt, CE.PreAimResultDataType.Default)
  const pinCheck113 = f.equal(result112, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck113)

  // getCharacterEntityOfSpecifiedPlayer / get_character_entity_of_specified_player / genericId=200024 / literal=1, wire=0
  const result114 = f.getCharacterEntityOfSpecifiedPlayer(self)
  const pinCheck115 = f.equal(result114, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck115)

  // getCorrespondingValueFromList / get_corresponding_value_from_list / genericId=200017 / literal=0, wire=2
  const result116 = f.getCorrespondingValueFromList(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck117 = f.equal(result116, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck117)

  // getCurrentActivePreAimingIndex / get_current_active_pre_aiming_index / genericId=200279 / literal=0, wire=0
  const result118 = f.getCurrentActivePreAimingIndex()
  const pinCheck119 = f.equal(result118, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck119)

  // getCurrentCharacter / get_current_character / genericId=200076 / literal=0, wire=0
  const result120 = f.getCurrentCharacter()
  const pinCheck121 = f.equal(result120, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck121)

  // getCurrentClientTime / get_current_client_time / genericId=200269 / literal=0, wire=0
  const result122 = f.getCurrentClientTime()
  const pinCheck123 = f.equal(result122, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck123)

  // getCurrentClientTimeHighPrecision / get_current_client_time_high_precision / genericId=200270 / literal=0, wire=0
  const result124 = f.getCurrentClientTimeHighPrecision()
  const pinCheck125 = f.equal(result124.clientTimeS, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck125)
  const pinCheck126 = f.equal(result124.clientTimeMs, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck126)

  // getCurrentKeyBehavior / get_current_key_behavior / genericId=200267 / literal=0, wire=0
  const result127 = f.getCurrentKeyBehavior()
  const pinCheck128 = f.greaterThanOrEqualTo(f.getListLength(result127.behaviorIDList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck128)
  const pinCheck129 = f.greaterThanOrEqualTo(f.getListLength(result127.entryTimeList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck129)

  // getCurrentKeyBehaviorHighPrecision / get_current_key_behavior_high_precision / genericId=200268 / literal=0, wire=0
  const result130 = f.getCurrentKeyBehaviorHighPrecision()
  const pinCheck131 = f.greaterThanOrEqualTo(f.getListLength(result130.behaviorIDList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck131)
  const pinCheck132 = f.greaterThanOrEqualTo(f.getListLength(result130.entryTimeListS), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck132)
  const pinCheck133 = f.greaterThanOrEqualTo(f.getListLength(result130.entryTimeListMs), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck133)

  // getCursorHitResult / get_cursor_hit_result / genericId=200285 / literal=0, wire=0
  const result134 = f.getCursorHitResult()
  const pinCheck135 = f.greaterThanOrEqualTo(f.getListLength(result134.hitEntityList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck135)
  const pinCheck136 = f.greaterThanOrEqualTo(f.getListLength(result134.hitPositionList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck136)
  const pinCheck137 = f.equal(result134.hitCount, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck137)

  // getCursorScreenCoordinates / get_cursor_screen_coordinates / genericId=200286 / literal=0, wire=0
  const result138 = f.getCursorScreenCoordinates()
  const pinCheck139 = f.equal(result138.screenX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck139)
  const pinCheck140 = f.equal(result138.screenY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck140)

  // getCursorViewportCoordinates / get_cursor_viewport_coordinates / genericId=200287 / literal=0, wire=0
  const result141 = f.getCursorViewportCoordinates()
  const pinCheck142 = f.equal(result141.viewportX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck142)
  const pinCheck143 = f.equal(result141.viewportY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck143)

  // getCustomVariable / get_custom_variable / genericId=200016 / literal=0, wire=2
  const result144 = f.getCustomVariable(wireEntity, wireStr)
  const narrowed145 = result144.asType('int')
  const pinCheck146 = f.equal(narrowed145, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck146)

  // getEntityCurrentlyScannedByScanComponent / get_entity_currently_scanned_by_scan_component / genericId=200118 / literal=0, wire=0
  const result147 = f.getEntityCurrentlyScannedByScanComponent()
  const pinCheck148 = f.equal(result147.correspondingEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck148)
  const pinCheck149 = f.equal(result147.scanTagConfigID, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck149)

  // getEntityListByUnitTag / get_entity_list_by_unit_tag / genericId=200078 / literal=1, wire=0
  const pinCheck152 = f.greaterThanOrEqualTo(f.getListLength(f.getEntityListByUnitTag(150n)), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck152)

  // getEntityLocation / get_entity_location / genericId=200030 / literal=0, wire=1
  const result153 = f.getEntityLocation(wireEntity)
  const pinCheck154 = f.equal(result153, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck154)

  // getEntityRotation / get_entity_rotation / genericId=200031 / literal=1, wire=0
  const result155 = f.getEntityRotation(self)
  const pinCheck156 = f.equal(result155, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck156)

  // getEntitySCurrentActiveScanTags / get_entity_s_current_active_scan_tags / genericId=200121 / literal=0, wire=1
  const result157 = f.getEntitySCurrentActiveScanTags(wireEntity)
  const pinCheck158 = f.equal(result157, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck158)

  // getEntitySScanStatus / get_entity_s_scan_status / genericId=200120 / literal=0, wire=1
  const result159 = f.getEntitySScanStatus(wireEntity)
  const pinCheck160 = f.enumerationMatch(result159, CE.ScanStatus.UnusableTarget)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck160)

  // getEntitySType / get_entity_s_type / genericId=200045 / literal=1, wire=0
  const result161 = f.getEntitySType(self)
  const pinCheck162 = f.enumerationMatch(result161, E.EntityType.Stage)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck162)

  // getEntitySUnitTagList / get_entity_s_unit_tag_list / genericId=200077 / literal=1, wire=0
  const pinCheck164 = f.greaterThanOrEqualTo(f.getListLength(f.getEntitySUnitTagList(self)), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck164)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe166 = f.getRayDetectionResult(
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
  const pinCheck167 = f.equal(enumListProbe166.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck167)

  // getListLength / get_list_length / genericId=200018 / literal=0, wire=1
  const result168 = f.getListLength(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck169 = f.equal(result168, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck169)

  // getListOfKeysFromDictionary / get_list_of_keys_from_dictionary / genericId=200159 / literal=0, wire=1
  const pinCheck171 = f.greaterThanOrEqualTo(
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
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck171)

  // getListOfPlayerEntitiesOnTheField / get_list_of_player_entities_on_the_field / genericId=200026 / literal=0, wire=0
  const pinCheck173 = f.greaterThanOrEqualTo(
    f.getListLength(f.getListOfPlayerEntitiesOnTheField()),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck173)

  // getListOfValuesFromDictionary / get_list_of_values_from_dictionary / genericId=200158 / literal=0, wire=1
  const pinCheck175 = f.greaterThanOrEqualTo(
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
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck175)

  // getLocalVariable / get_local_variable / genericId=200082 / literal=1, wire=0
  const result177 = f.getLocalVariable('literal-176')
  const narrowed178 = result177.asType('int')
  const pinCheck179 = f.equal(narrowed178, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck179)

  // getMaximumValueFromList / get_maximum_value_from_list / genericId=200020 / literal=0, wire=1
  const result180 = f.getMaximumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck181 = f.equal(result180, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck181)

  // getMinimumValueFromList / get_minimum_value_from_list / genericId=200021 / literal=0, wire=1
  const result182 = f.getMinimumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck183 = f.equal(result182, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck183)

  // getPlayerClientInputDeviceType / get_player_client_input_device_type / genericId=200123 / literal=0, wire=0
  const result184 = f.getPlayerClientInputDeviceType()
  const pinCheck185 = f.enumerationMatch(result184, E.InputDeviceType.KeyboardAndMouse)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck185)

  // getPlayerEntityToWhichTheCharacterBelongs / get_player_entity_to_which_the_character_belongs / genericId=200025 / literal=1, wire=0
  const result186 = f.getPlayerEntityToWhichTheCharacterBelongs(self)
  const pinCheck187 = f.equal(result186, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck187)

  // getPlayerMovementInput / get_player_movement_input / genericId=200255 / literal=0, wire=0
  const result188 = f.getPlayerMovementInput()
  const pinCheck189 = f.equal(result188.inputDirection, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck189)
  const pinCheck190 = f.equal(result188.inputStrength, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck190)

  // getPreAimingCollisionDetectionResultCount / get_pre_aiming_collision_detection_result_count / genericId=200280 / literal=1, wire=1
  const result191 = f.getPreAimingCollisionDetectionResultCount(
    wireInt,
    CE.PreAimResultDataType.Default
  )
  const pinCheck192 = f.equal(result191, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck192)

  // getPreAimingDuration / get_pre_aiming_duration / genericId=200278 / literal=2, wire=0
  const result194 = f.getPreAimingDuration(193n, CE.PreAimResultDataType.Default)
  const pinCheck195 = f.equal(result194, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck195)

  // getPreAimingRayHitInfo / get_pre_aiming_ray_hit_info / genericId=200281 / literal=1, wire=1
  const result196 = f.getPreAimingRayHitInfo(wireInt, CE.PreAimResultDataType.Default)
  const pinCheck197 = f.equal(result196.hitPosition, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck197)
  const pinCheck198 = f.equal(result196.hitEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck198)

  // getPreAimingResult / get_pre_aiming_result / genericId=200277 / literal=1, wire=1
  const result199 = f.getPreAimingResult(wireInt, CE.PreAimResultDataType.Default)
  const pinCheck200 = f.equal(result199.hitPosition, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck200)
  const pinCheck201 = f.equal(result199.inRangePosition, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck201)
  const pinCheck202 = f.equal(result199.bestValidTarget, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck202)
  const pinCheck203 = f.greaterThanOrEqualTo(f.getListLength(result199.validTargetList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck203)

  // getPresetStatus / get_preset_status / genericId=200028 / literal=1, wire=1
  const result204 = f.getPresetStatus(self, wireInt)
  const pinCheck205 = f.equal(result204, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck205)

  // getRandomNumber / get_random_number / genericId=200032 / literal=2, wire=0
  const result208 = f.getRandomNumber(206n, 207n)
  const pinCheck209 = f.equal(result208, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck209)

  // getRayDetectionResult / get_ray_detection_result / genericId=200109 / literal=4, wire=3
  const result212 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    [211, 212, 213],
    wireFloat,
    E.TargetType.None,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    [CE.RayFilterType.Hurtbox, CE.RayFilterType.Scene, CE.RayFilterType.ObjectSelfCollision]
  )
  const pinCheck213 = f.equal(result212.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck213)
  const pinCheck214 = f.equal(result212.onHitEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck214)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200110 / literal=1, wire=0
  const enumListProbe216 = f.getRayDetectionResult(
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
  const pinCheck217 = f.equal(enumListProbe216.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck217)

  // getSelfEntity / get_self_entity / genericId=200033 / literal=0, wire=0
  const result218 = f.getSelfEntity()
  const pinCheck219 = f.equal(result218, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck219)

  // getSkillConfigIdBySkillInstanceId / get_skill_config_id_by_skill_instance_id / genericId=200272 / literal=0, wire=1
  const result220 = f.getSkillConfigIdBySkillInstanceId(wireInt)
  const pinCheck221 = f.equal(result220, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck221)

  // getTargetAttachmentPointLocation / get_target_attachment_point_location / genericId=200047 / literal=1, wire=1
  const result223 = f.getTargetAttachmentPointLocation(wireEntity, 'literal-222')
  const pinCheck224 = f.equal(result223, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck224)

  // getTargetAttachmentPointRotation / get_target_attachment_point_rotation / genericId=200048 / literal=1, wire=1
  const result225 = f.getTargetAttachmentPointRotation(self, wireStr)
  const pinCheck226 = f.equal(result225, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck226)

  // getTargetEntity / get_target_entity / genericId=200034 / literal=0, wire=0
  const result227 = f.getTargetEntity()
  const pinCheck228 = f.equal(result227, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck228)

  // getTheAggroListOfTheSpecifiedEntity / get_the_aggro_list_of_the_specified_entity / genericId=200091 / literal=0, wire=1
  const pinCheck230 = f.greaterThanOrEqualTo(
    f.getListLength(f.getTheAggroListOfTheSpecifiedEntity(wireEntity)),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck230)

  // getTheAggroTargetOfTheSpecifiedEntity / get_the_aggro_target_of_the_specified_entity / genericId=200090 / literal=1, wire=0
  const result231 = f.getTheAggroTargetOfTheSpecifiedEntity(self)
  const pinCheck232 = f.equal(result231, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck232)

  // getUnitAttackTarget / get_unit_attack_target / genericId=200035 / literal=1, wire=0
  const result233 = f.getUnitAttackTarget(self)
  const pinCheck234 = f.equal(result233, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck234)

  // getWhetherCursorIsActive / get_whether_cursor_is_active / genericId=200284 / literal=0, wire=0
  const result235 = f.getWhetherCursorIsActive()
  const pinCheck236 = f.equal(result235, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck236)

  // getWhetherPreAimingStickIsInDeadZone / get_whether_pre_aiming_stick_is_in_dead_zone / genericId=200282 / literal=2, wire=0
  const result238 = f.getWhetherPreAimingStickIsInDeadZone(237n, CE.PreAimResultDataType.Default)
  const pinCheck239 = f.equal(result238, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck239)

  // greaterThan / greater_than / genericId=200007 / literal=2, wire=0
  const result242 = f.greaterThan(240n, 241n)
  const pinCheck243 = f.equal(result242, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck243)

  // greaterThanOrEqualTo / greater_than_or_equal_to / genericId=200010 / literal=2, wire=0
  const result246 = f.greaterThanOrEqualTo(244n, 245n)
  const pinCheck247 = f.equal(result246, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck247)

  // lessThan / less_than / genericId=200008 / literal=0, wire=2
  const result251 = f.lessThan(wireInt, wireInt)
  const pinCheck252 = f.equal(result251, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck252)

  // lessThanOrEqualTo / less_than_or_equal_to / genericId=200009 / literal=0, wire=2
  const result253 = f.lessThanOrEqualTo(wireInt, wireInt)
  const pinCheck254 = f.equal(result253, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck254)

  // listIncludesThisValue / list_includes_this_value / genericId=200019 / literal=0, wire=2
  const result255 = f.listIncludesThisValue(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck256 = f.equal(result255, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck256)

  // logicalAndOperation / logical_and_operation / genericId=200001 / literal=0, wire=2
  const result257 = f.logicalAndOperation(wireBool, wireBool)
  const pinCheck258 = f.equal(result257, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck258)

  // logicalNotOperation / logical_not_operation / genericId=200003 / literal=1, wire=0
  const result260 = f.logicalNotOperation(true)
  const pinCheck261 = f.equal(result260, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck261)

  // logicalOrOperation / logical_or_operation / genericId=200002 / literal=0, wire=2
  const result262 = f.logicalOrOperation(wireBool, wireBool)
  const pinCheck263 = f.equal(result262, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck263)

  // logicalXorOperation / logical_xor_operation / genericId=200004 / literal=0, wire=2
  const result264 = f.logicalXorOperation(wireBool, wireBool)
  const pinCheck265 = f.equal(result264, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck265)

  // multiplication / multiplication / genericId=200013 / literal=0, wire=2
  const result266 = f.multiplication(wireInt, wireInt)
  const pinCheck267 = f.equal(result266, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck267)

  // orientationToRotation / orientation_to_rotation / genericId=200074 / literal=0, wire=1
  const result272 = f.orientationToRotation(wireVec3)
  const pinCheck273 = f.equal(result272, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck273)

  // queryActiveSkillInstanceListOfSpecifiedSlot / query_active_skill_instance_list_of_specified_slot / genericId=200274 / literal=1, wire=0
  const result279 = f.queryActiveSkillInstanceListOfSpecifiedSlot(E.CharacterSkillSlot.NormalAttack)
  const pinCheck280 = f.equal(result279, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck280)

  // queryDictionarySLength / query_dictionary_s_length / genericId=200157 / literal=0, wire=1
  const result281 = f.queryDictionarySLength(
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
  const pinCheck282 = f.equal(result281, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck282)

  // queryDictionaryValueByKey / query_dictionary_value_by_key / genericId=200154 / literal=0, wire=2
  const result283 = f.queryDictionaryValueByKey(
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
  const pinCheck284 = f.equal(result283, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck284)

  // queryEntityByGuid / query_entity_by_guid / genericId=200023 / literal=1, wire=0
  const result286 = f.queryEntityByGuid(guid(285n))
  const pinCheck287 = f.equal(result286, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck287)

  // queryEntityFaction / query_entity_faction / genericId=200029 / literal=0, wire=1
  const result288 = f.queryEntityFaction(wireEntity)
  const pinCheck289 = f.equal(result288, faction(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck289)

  // queryGuidByEntity / query_guid_by_entity / genericId=200027 / literal=1, wire=0
  const result290 = f.queryGuidByEntity(self)
  const pinCheck291 = f.equal(result290, guid(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck291)

  // queryIfDictionaryContainsSpecificKey / query_if_dictionary_contains_specific_key / genericId=200155 / literal=0, wire=2
  const result292 = f.queryIfDictionaryContainsSpecificKey(
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
  const pinCheck293 = f.equal(result292, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck293)

  // queryIfDictionaryContainsSpecificValue / query_if_dictionary_contains_specific_value / genericId=200156 / literal=0, wire=2
  const result294 = f.queryIfDictionaryContainsSpecificValue(
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
  const pinCheck295 = f.equal(result294, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck295)

  // queryIfEntityIsOnTheField / query_if_entity_is_on_the_field / genericId=200103 / literal=1, wire=0
  const result296 = f.queryIfEntityIsOnTheField(self)
  const pinCheck297 = f.equal(result296, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck297)

  // queryIfFactionIsHostile / query_if_faction_is_hostile / genericId=200093 / literal=2, wire=0
  const result300 = f.queryIfFactionIsHostile(faction(298n), faction(299n))
  const pinCheck301 = f.equal(result300, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck301)

  // queryIfSelfIsInCombat / query_if_self_is_in_combat / genericId=200037 / literal=0, wire=0
  const result302 = f.queryIfSelfIsInCombat()
  const pinCheck303 = f.equal(result302, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck303)

  // queryIfSpecifiedEntityIsInCombat / query_if_specified_entity_is_in_combat / genericId=200092 / literal=0, wire=1
  const result304 = f.queryIfSpecifiedEntityIsInCombat(wireEntity)
  const pinCheck305 = f.equal(result304, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck305)

  // queryPreAimingEndReason / query_pre_aiming_end_reason / genericId=200283 / literal=0, wire=1
  const result306 = f.queryPreAimingEndReason(wireInt)
  const pinCheck307 = f.enumerationMatch(result306, CE.PreAimingEndReason.None)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck307)

  // querySkillInstanceIdBySkillSlotAndSkillConfigId / query_skill_instance_id_by_skill_slot_and_skill_config_id / genericId=200275 / literal=1, wire=1
  const result308 = f.querySkillInstanceIdBySkillSlotAndSkillConfigId(
    E.CharacterSkillSlot.NormalAttack,
    wireConfig
  )
  const pinCheck309 = f.equal(result308, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck309)

  // querySkillInstanceListBySpecifiedSlot / query_skill_instance_list_by_specified_slot / genericId=200273 / literal=1, wire=0
  const pinCheck311 = f.greaterThanOrEqualTo(
    f.getListLength(f.querySkillInstanceListBySpecifiedSlot(E.CharacterSkillSlot.NormalAttack)),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck311)

  // querySkillVariableValue / query_skill_variable_value / genericId=200259 / literal=1, wire=0
  const result313 = f.querySkillVariableValue(configId(312n))
  const pinCheck314 = f.equal(result313, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck314)

  // queryWhetherPlayerIsCurrentlyInVoiceChat / query_whether_player_is_currently_in_voice_chat / genericId=200271 / literal=0, wire=1
  const result315 = f.queryWhetherPlayerIsCurrentlyInVoiceChat(wireEntity)
  const pinCheck316 = f.equal(result315, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck316)

  // radiansToDegrees / radians_to_degrees / genericId=200101 / literal=0, wire=1
  const result317 = f.radiansToDegrees(wireFloat)
  const pinCheck318 = f.equal(result317, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck318)

  // screenCoordinatesToViewportCoordinates / screen_coordinates_to_viewport_coordinates / genericId=200290 / literal=0, wire=2
  const result323 = f.screenCoordinatesToViewportCoordinates(wireFloat, wireFloat)
  const pinCheck324 = f.equal(result323.viewportX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck324)
  const pinCheck325 = f.equal(result323.viewportY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck325)

  // screenCoordinatesToWorldCoordinates / screen_coordinates_to_world_coordinates / genericId=200292 / literal=1, wire=2
  const result327 = f.screenCoordinatesToWorldCoordinates(wireFloat, wireFloat, 326.25)
  const pinCheck328 = f.equal(result327, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck328)

  // sineFunction / sine_function / genericId=200094 / literal=1, wire=0
  const result334 = f.sineFunction(333.25)
  const pinCheck335 = f.equal(result334, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck335)

  // split3dVector / split3d_vector / genericId=200065 / literal=0, wire=1
  const result337 = f.split3dVector(wireVec3)
  const pinCheck338 = f.equal(result337.xComponent, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck338)
  const pinCheck339 = f.equal(result337.yComponent, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck339)
  const pinCheck340 = f.equal(result337.zComponent, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck340)

  // subtraction / subtraction / genericId=200012 / literal=0, wire=2
  const result341 = f.subtraction(wireInt, wireInt)
  const pinCheck342 = f.equal(result341, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck342)

  // tangentFunction / tangent_function / genericId=200096 / literal=1, wire=0
  const result344 = f.tangentFunction(343.25)
  const pinCheck345 = f.equal(result344, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck345)

  // viewportCoordinatesToScreenCoordinates / viewport_coordinates_to_screen_coordinates / genericId=200291 / literal=0, wire=2
  const result518 = f.viewportCoordinatesToScreenCoordinates(wireFloat, wireFloat)
  const pinCheck519 = f.equal(result518.screenX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck519)
  const pinCheck520 = f.equal(result518.screenY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck520)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200243 / literal=1, wire=1
  const result521 = f.whetherTheEntityHasTheSpecifiedUnitStatus(self, wireConfig)
  const pinCheck522 = f.equal(result521, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck522)

  // worldCoordinatesToScreenCoordinates / world_coordinates_to_screen_coordinates / genericId=200293 / literal=1, wire=0
  const result524 = f.worldCoordinatesToScreenCoordinates([523, 524, 525])
  const pinCheck525 = f.equal(result524.screenX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck525)
  const pinCheck526 = f.equal(result524.screenY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck526)

  // addKeyBehavior / add_key_behavior / genericId=200262 / literal=1, wire=0
  f.addKeyBehavior(37n)

  // addUnitStatus / add_unit_status / genericId=200057 / literal=2, wire=1
  f.addUnitStatus(self, wireInt, configId(38n))

  // breakLoop is emitted by finiteLoop/traverseEntityList callbacks below.

  // cameraOrientationDetectionData / camera_orientation_detection_data / genericId=200062 / literal=3, wire=1
  const result54 = f.cameraOrientationDetectionData(
    CE.TargetTypeForCameraOrientationNode.None,
    wireVec3,
    52.25,
    53.25
  )
  const pinCheck55 = f.equal(result54.targetRotation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck55)
  const pinCheck56 = f.equal(result54.targetLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck56)

  // castSkillFromSpecifiedSlot / cast_skill_from_specified_slot / genericId=200266 / literal=1, wire=1
  f.castSkillFromSpecifiedSlot(E.CharacterSkillSlot.NormalAttack, wireBool)

  // castSpecifiedSkillInstance / cast_specified_skill_instance / genericId=200265 / literal=2, wire=0
  f.castSpecifiedSkillInstance(57n, false)

  // characterBlink / character_blink / genericId=200261 / literal=0, wire=2
  f.characterBlink(wireVec3, wireVec3)

  // clearKeyBehaviorLogPanel / clear_key_behavior_log_panel / genericId=200263 / literal=0, wire=0
  f.clearKeyBehaviorLogPanel()

  // clearTheAggroListOfTheSpecifiedEntity / clear_the_aggro_list_of_the_specified_entity / genericId=200087 / literal=0, wire=1
  f.clearTheAggroListOfTheSpecifiedEntity(wireEntity)

  // doubleBranch / double_branch / genericId=200056 / literal=1, wire=0
  f.doubleBranch(
    false,
    () => {},
    () => {}
  )

  // finishCurrentPreAiming / finish_current_pre_aiming / genericId=200288 / literal=0, wire=0
  f.finishCurrentPreAiming()

  // finiteLoop / finite_loop / genericId=200079 / literal=2, wire=0
  f.finiteLoop(99n, 100n, (loopValue, breakLoop) => {
    f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', f.equal(loopValue, 0n))
    breakLoop()
  })

  // fixedPointDisplacement / fixed_point_displacement / genericId=200053 / literal=2, wire=3
  f.fixedPointDisplacement(101.25, wireFloat, wireFloat, wireVec3, true)

  // fixedPointProjectileLaunch / fixed_point_projectile_launch / genericId=200052 / literal=3, wire=2
  f.fixedPointProjectileLaunch(
    prefabId(104n),
    [105, 106, 107],
    [106, 107, 108],
    wireEntity,
    wireFaction
  )

  // forceExitAimingState / force_exit_aiming_state / genericId=200108 / literal=0, wire=0
  f.forceExitAimingState()

  // increaseSkillVariableValue / increase_skill_variable_value / genericId=200258 / literal=2, wire=0
  f.increaseSkillVariableValue(configId(248n), 249.25)

  // increaseTheAggroValueOfTheSpecifiedEntity / increase_the_aggro_value_of_the_specified_entity / genericId=200084 / literal=2, wire=1
  f.increaseTheAggroValueOfTheSpecifiedEntity(wireEntity, self, 250n)

  // interruptCurrentSkill / interrupt_current_skill / genericId=200256 / literal=0, wire=0
  f.interruptCurrentSkill()

  // multipleBranches / multiple_branches / genericId=200264 / literal=0, wire=1
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

  // notifyServerNodeGraph / notify_server_node_graph / genericId=200039 / literal=3, wire=0
  f.notifyServerNodeGraph('literal-268', 'literal-269', 'literal-270')

  // playTimedEffects / play_timed_effects / genericId=200038 / literal=3, wire=2
  f.playTimedEffects(configId(274n), wireVec3, [276, 277, 278], 277.25, wireBool)

  // playerTurning / player_turning / genericId=200040 / literal=1, wire=0
  f.playerTurning(CE.RotationType.TargetFirstThenInput)

  // playerTurnsToFaceSetDirection / player_turns_to_face_set_direction / genericId=200105 / literal=1, wire=0
  f.playerTurnsToFaceSetDirection([278, 279, 280])

  // recoverCharacterSHp / recover_character_s_hp / genericId=200075 / literal=4, wire=1
  f.recoverCharacterSHp(self, 319.25, false, wireFloat, 321n)

  // removeSpecifiedCharacterDisruptorDevice / remove_specified_character_disruptor_device / genericId=200060 / literal=1, wire=0
  f.removeSpecifiedCharacterDisruptorDevice(E.DisruptorDeviceType.ForceFieldDevice)

  // removeTargetEntityFromAggroList / remove_target_entity_from_aggro_list / genericId=200088 / literal=1, wire=1
  f.removeTargetEntityFromAggroList(self, wireEntity)

  // removeUnitStatus / remove_unit_status / genericId=200058 / literal=1, wire=1
  f.removeUnitStatus(wireEntity, configId(322n))

  // resetSkillTarget / reset_skill_target / genericId=200106 / literal=0, wire=0
  f.resetSkillTarget()

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

  // setAttackWeight / set_attack_weight / genericId=200061 / literal=2, wire=0
  f.setAttackWeight(329.25, false)

  // setLocalVariable / set_local_variable / genericId=200081 / literal=1, wire=1
  f.setLocalVariable('literal-331', wireInt)

  // setOwnAttackTarget / set_own_attack_target / genericId=200041 / literal=0, wire=2
  f.setOwnAttackTarget(wireEntity, wireBool)

  // setSkillVariable / set_skill_variable / genericId=200257 / literal=1, wire=1
  f.setSkillVariable(configId(332n), wireFloat)

  // setTheAggroValueOfSpecifiedEntity / set_the_aggro_value_of_specified_entity / genericId=200083 / literal=1, wire=2
  f.setTheAggroValueOfSpecifiedEntity(self, wireEntity, wireInt)

  // setTheAggroValueOfTheSpecifiedEntityProportionally / set_the_aggro_value_of_the_specified_entity_proportionally / genericId=200085 / literal=1, wire=2
  f.setTheAggroValueOfTheSpecifiedEntityProportionally(wireEntity, self, wireFloat)

  // tauntTarget / taunt_target / genericId=200089 / literal=1, wire=1
  f.tauntTarget(wireEntity, self)

  // transferTheAggroValueOfTheSpecifiedEntityProportionally / transfer_the_aggro_value_of_the_specified_entity_proportionally / genericId=200086 / literal=2, wire=2
  f.transferTheAggroValueOfTheSpecifiedEntityProportionally(wireEntity, self, self, wireFloat)

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

  // triggerHitboxAtSpecificLocation / trigger_hitbox_at_specific_location / genericId=200051 / literal=35, wire=3
  f.triggerHitboxAtSpecificLocation(
    E.TargetType.None,
    [346, 347, 348],
    wireVec3,
    wireFloat,
    348.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    349n,
    E.AttackShape.Rectangle,
    [350, 351, 352],
    351.25,
    352.25,
    353.25,
    354.25,
    355.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    356.25,
    E.HitType.None,
    E.AttackType.None,
    357.25,
    false,
    359n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [361, 362, 363],
    [362, 363, 364],
    363.25,
    [364, 365, 366],
    [365, 366, 367],
    366.25,
    367.25,
    wireInt,
    CE.HitLevel.NoEffect,
    368.25,
    369.25
  )

  // triggerHitboxAtSpecifiedAttachmentPoint / trigger_hitbox_at_specified_attachment_point / genericId=200059 / literal=36, wire=3
  f.triggerHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-370',
    [371, 372, 373],
    [372, 373, 374],
    373.25,
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
    374n,
    E.AttackShape.Rectangle,
    [375, 376, 377],
    376.25,
    377.25,
    378.25,
    379.25,
    380.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    381.25,
    E.HitType.None,
    E.AttackType.None,
    382.25,
    true,
    384n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [386, 387, 388],
    [387, 388, 389],
    388.25,
    [389, 390, 391],
    [390, 391, 392],
    391.25,
    wireFloat,
    392n,
    CE.HitLevel.NoEffect,
    393.25,
    394.25
  )

  // triggerRectangularHitboxAtSpecificLocation / trigger_rectangular_hitbox_at_specific_location / genericId=200112 / literal=28, wire=3
  f.triggerRectangularHitboxAtSpecificLocation(
    E.TargetType.None,
    [395, 396, 397],
    wireVec3,
    wireFloat,
    397.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    398n,
    [399, 400, 401],
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    400.25,
    E.HitType.None,
    E.AttackType.None,
    401.25,
    false,
    403n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [405, 406, 407],
    [406, 407, 408],
    407.25,
    [408, 409, 410],
    [409, 410, 411],
    410.25,
    411.25,
    wireInt,
    CE.HitLevel.NoEffect,
    412.25,
    413.25
  )

  // triggerRectangularHitboxAtSpecifiedAttachmentPoint / trigger_rectangular_hitbox_at_specified_attachment_point / genericId=200115 / literal=29, wire=3
  f.triggerRectangularHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-414',
    [415, 416, 417],
    [416, 417, 418],
    417.25,
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
    418n,
    [419, 420, 421],
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    420.25,
    E.HitType.None,
    E.AttackType.None,
    421.25,
    false,
    423n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [425, 426, 427],
    [426, 427, 428],
    427.25,
    [428, 429, 430],
    [429, 430, 431],
    430.25,
    wireFloat,
    431n,
    CE.HitLevel.NoEffect,
    432.25,
    433.25
  )

  // triggerSectorHitboxAtSpecificLocation / trigger_sector_hitbox_at_specific_location / genericId=200113 / literal=32, wire=3
  f.triggerSectorHitboxAtSpecificLocation(
    E.TargetType.None,
    [434, 435, 436],
    wireVec3,
    wireFloat,
    436.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    437n,
    438.25,
    439.25,
    440.25,
    441.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    442.25,
    E.HitType.None,
    E.AttackType.None,
    443.25,
    false,
    445n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [447, 448, 449],
    [448, 449, 450],
    449.25,
    [450, 451, 452],
    [451, 452, 453],
    452.25,
    wireFloat,
    453n,
    CE.HitLevel.NoEffect,
    454.25,
    455.25
  )

  // triggerSectorHitboxAtSpecifiedAttachmentPoint / trigger_sector_hitbox_at_specified_attachment_point / genericId=200116 / literal=33, wire=3
  f.triggerSectorHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-456',
    [457, 458, 459],
    [458, 459, 460],
    459.25,
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
    460n,
    461.25,
    462.25,
    463.25,
    464.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    465.25,
    E.HitType.None,
    E.AttackType.None,
    466.25,
    true,
    468n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [470, 471, 472],
    [471, 472, 473],
    472.25,
    [473, 474, 475],
    [474, 475, 476],
    475.25,
    476.25,
    wireInt,
    CE.HitLevel.NoEffect,
    477.25,
    478.25
  )

  // triggerSphericalHitboxAtSpecificLocation / trigger_spherical_hitbox_at_specific_location / genericId=200111 / literal=27, wire=4
  f.triggerSphericalHitboxAtSpecificLocation(
    E.TargetType.None,
    wireVec3,
    [480, 481, 482],
    481.25,
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
    482n,
    483.25,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    484.25,
    E.HitType.None,
    E.AttackType.None,
    485.25,
    false,
    487n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [489, 490, 491],
    [490, 491, 492],
    491.25,
    [492, 493, 494],
    [493, 494, 495],
    494.25,
    wireFloat,
    495n,
    CE.HitLevel.NoEffect,
    496.25,
    497.25
  )

  // triggerSphericalHitboxAtSpecifiedAttachmentPoint / trigger_spherical_hitbox_at_specified_attachment_point / genericId=200114 / literal=28, wire=4
  f.triggerSphericalHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-498',
    wireVec3,
    wireVec3,
    wireFloat,
    501.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    502n,
    503.25,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    504.25,
    E.HitType.None,
    E.AttackType.None,
    505.25,
    false,
    507n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [509, 510, 511],
    [510, 511, 512],
    511.25,
    [512, 513, 514],
    [513, 514, 515],
    514.25,
    515.25,
    wireInt,
    CE.HitLevel.NoEffect,
    516.25,
    517.25
  )
})

g.characterControlSkill({
  id: 1082130436,
  name: 'AllClientNodesCharacterControlSkillBeyond',
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
  const pinCheck556 = f.equal(wireStr, '')
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck556)
  const pinCheck557 = f.equal(wireGuid, guid(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck557)
  const pinCheck558 = f.equal(wireConfig, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck558)
  const pinCheck559 = f.equal(wirePrefab, prefabId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck559)

  // _3dVectorAddition / _3d_vector_addition / genericId=200071 / literal=0, wire=2
  const result3 = f._3dVectorAddition(wireVec3, wireVec3)
  const pinCheck4 = f.equal(result3, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck4)

  // _3dVectorAngle / _3d_vector_angle / genericId=200067 / literal=2, wire=0
  const result7 = f._3dVectorAngle([5, 6, 7], [6, 7, 8])
  const pinCheck8 = f.equal(result7, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck8)

  // _3dVectorCrossProduct / _3d_vector_cross_product / genericId=200064 / literal=2, wire=0
  const result11 = f._3dVectorCrossProduct([9, 10, 11], [10, 11, 12])
  const pinCheck12 = f.equal(result11, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck12)

  // _3dVectorDotProduct / _3d_vector_dot_product / genericId=200063 / literal=0, wire=2
  const result15 = f._3dVectorDotProduct(wireVec3, wireVec3)
  const pinCheck16 = f.equal(result15, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck16)

  // _3dVectorModuloOperation / _3d_vector_modulo_operation / genericId=200069 / literal=0, wire=1
  const result18 = f._3dVectorModuloOperation(wireVec3)
  const pinCheck19 = f.equal(result18, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck19)

  // _3dVectorNormalization / _3d_vector_normalization / genericId=200100 / literal=0, wire=1
  const result21 = f._3dVectorNormalization(wireVec3)
  const pinCheck22 = f.equal(result21, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck22)

  // _3dVectorRotation / _3d_vector_rotation / genericId=200068 / literal=1, wire=1
  const result25 = f._3dVectorRotation([23, 24, 25], wireVec3)
  const pinCheck26 = f.equal(result25, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck26)

  // _3dVectorSubtraction / _3d_vector_subtraction / genericId=200072 / literal=0, wire=2
  const result29 = f._3dVectorSubtraction(wireVec3, wireVec3)
  const pinCheck30 = f.equal(result29, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck30)

  // _3dVectorZoom / _3d_vector_zoom / genericId=200066 / literal=2, wire=0
  const result33 = f._3dVectorZoom(31.25, [32, 33, 34])
  const pinCheck34 = f.equal(result33, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck34)

  // absoluteValueOperation / absolute_value_operation / genericId=200015 / literal=0, wire=1
  const result35 = f.absoluteValueOperation(wireInt)
  const pinCheck36 = f.equal(result35, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck36)

  // addition / addition / genericId=200011 / literal=0, wire=2
  const result46 = f.addition(wireInt, wireInt)
  const pinCheck47 = f.equal(result46, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck47)

  // arccosineFunction / arccosine_function / genericId=200098 / literal=0, wire=1
  const result48 = f.arccosineFunction(wireFloat)
  const pinCheck49 = f.equal(result48, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck49)

  // arcsineFunction / arcsine_function / genericId=200097 / literal=0, wire=1
  const result50 = f.arcsineFunction(wireFloat)
  const pinCheck51 = f.equal(result50, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck51)

  // arctangentFunction / arctangent_function / genericId=200099 / literal=0, wire=1
  const result52 = f.arctangentFunction(wireFloat)
  const pinCheck53 = f.equal(result52, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck53)

  // assemblyDictionary / assembly_dictionary / genericId=200152 / literal=0, wire=1
  const pinCheck55 = f.greaterThanOrEqualTo(
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
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck55)

  // assemblyList / assembly_list / genericId=200049 / literal=1, wire=1
  const pinCheck57 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.assemblyList(
        [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
        'int'
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck57)

  // checkThePresetStatusValueOfTheComplexCreation / check_the_preset_status_value_of_the_complex_creation / genericId=200244 / literal=2, wire=0
  const result69 = f.checkThePresetStatusValueOfTheComplexCreation(self, 68n)
  const pinCheck70 = f.equal(result69, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck70)

  // cosineFunction / cosine_function / genericId=200095 / literal=1, wire=0
  const result72 = f.cosineFunction(71.25)
  const pinCheck73 = f.equal(result72, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck73)

  // create3dVector / create3d_vector / genericId=200070 / literal=0, wire=3
  const result74 = f.create3dVector(wireFloat, wireFloat, wireFloat)
  const pinCheck75 = f.equal(result74, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck75)

  // createDictionary / create_dictionary / genericId=200153 / literal=0, wire=2
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
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck77)

  // dataTypeConversion / data_type_conversion / genericId=200022 / literal=2, wire=0
  const result79 = f.dataTypeConversion(78n, 'str')
  const pinCheck80 = f.equal(result79, '')
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck80)

  // degreesToRadians / degrees_to_radians / genericId=200102 / literal=0, wire=1
  const result81 = f.degreesToRadians(wireFloat)
  const pinCheck82 = f.equal(result81, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck82)

  // directionVectorToRotation / direction_vector_to_rotation / genericId=200073 / literal=1, wire=1
  const result85 = f.directionVectorToRotation(wireVec3, [84, 85, 86])
  const pinCheck86 = f.equal(result85, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck86)

  // division / division / genericId=200014 / literal=2, wire=0
  const result89 = f.division(87n, 88n)
  const pinCheck90 = f.equal(result89, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck90)

  // enumerationMatch / enumeration_match / genericId=200005 / literal=2, wire=0
  const result92 = f.enumerationMatch(E.SortBy.Ascending, E.SortBy.Ascending)
  const pinCheck93 = f.equal(result92, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck93)

  // equal / equal / genericId=200006 / literal=0, wire=2
  const result94 = f.equal(wireInt, wireInt)
  const pinCheck95 = f.equal(result94, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck95)

  // filterEntityListWithinSphericalRange / filter_entity_list_within_spherical_range / genericId=200043 / literal=2, wire=2
  const pinCheck99 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSphericalRange(
        96.25,
        wireVec3,
        wireInt,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck99)

  // filterEntityListWithinSquareRange / filter_entity_list_within_square_range / genericId=200044 / literal=4, wire=2
  const pinCheck105 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSquareRange(
        100.25,
        101.25,
        102.25,
        wireVec3,
        wireInt,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck105)

  // getAllEntitiesWithinTheCollisionTrigger / get_all_entities_within_the_collision_trigger / genericId=200107 / literal=2, wire=0
  const pinCheck116 = f.greaterThanOrEqualTo(
    f.getListLength(f.getAllEntitiesWithinTheCollisionTrigger(self, 114n)),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck116)

  // getAllValidEntitiesThatAreScannableByScanComponent / get_all_valid_entities_that_are_scannable_by_scan_component / genericId=200119 / literal=0, wire=0
  const pinCheck118 = f.greaterThanOrEqualTo(
    f.getListLength(f.getAllValidEntitiesThatAreScannableByScanComponent()),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck118)

  // getBaseObjectOfSpecifiedPreAiming / get_base_object_of_specified_pre_aiming / genericId=200276 / literal=1, wire=1
  const result119 = f.getBaseObjectOfSpecifiedPreAiming(wireInt, CE.PreAimResultDataType.Default)
  const pinCheck120 = f.equal(result119, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck120)

  // getCharacterEntityOfSpecifiedPlayer / get_character_entity_of_specified_player / genericId=200024 / literal=1, wire=0
  const result121 = f.getCharacterEntityOfSpecifiedPlayer(self)
  const pinCheck122 = f.equal(result121, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck122)

  // getControlMotorCurrentVelocity / get_control_motor_current_velocity / genericId=200297 / literal=0, wire=1
  const result123 = f.getControlMotorCurrentVelocity(wireEntity)
  const pinCheck124 = f.equal(result123.speed, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck124)
  const pinCheck125 = f.equal(result123.velocityDirection, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck125)

  // getControlMotorForwardDirection / get_control_motor_forward_direction / genericId=200298 / literal=1, wire=0
  const result126 = f.getControlMotorForwardDirection(self)
  const pinCheck127 = f.equal(result126, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck127)

  // getControlMotorMovementParameters / get_control_motor_movement_parameters / genericId=200296 / literal=1, wire=0
  const result128 = f.getControlMotorMovementParameters(self)
  const pinCheck129 = f.equal(result128.forwardAcceleration, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck129)
  const pinCheck130 = f.equal(result128.backwardAcceleration, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck130)
  const pinCheck131 = f.equal(result128.turningRate, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck131)
  const pinCheck132 = f.equal(result128.baseDragDeceleration, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck132)
  const pinCheck133 = f.equal(result128.dragCoefficient, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck133)
  const pinCheck134 = f.equal(result128.maxForwardSpeed, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck134)
  const pinCheck135 = f.equal(result128.maxBackwardSpeed, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck135)

  // getControlMotorTargetTurningDirection / get_control_motor_target_turning_direction / genericId=200299 / literal=0, wire=1
  const result136 = f.getControlMotorTargetTurningDirection(wireEntity)
  const pinCheck137 = f.equal(result136, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck137)

  // getCorrespondingValueFromList / get_corresponding_value_from_list / genericId=200017 / literal=0, wire=2
  const result138 = f.getCorrespondingValueFromList(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck139 = f.equal(result138, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck139)

  // getCurrentActiveControlMotorList / get_current_active_control_motor_list / genericId=200294 / literal=0, wire=0
  const pinCheck141 = f.greaterThanOrEqualTo(
    f.getListLength(f.getCurrentActiveControlMotorList()),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck141)

  // getCurrentActivePreAimingIndex / get_current_active_pre_aiming_index / genericId=200279 / literal=0, wire=0
  const result142 = f.getCurrentActivePreAimingIndex()
  const pinCheck143 = f.equal(result142, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck143)

  // getCurrentCharacter / get_current_character / genericId=200076 / literal=0, wire=0
  const result144 = f.getCurrentCharacter()
  const pinCheck145 = f.equal(result144, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck145)

  // getCurrentClientTime / get_current_client_time / genericId=200269 / literal=0, wire=0
  const result146 = f.getCurrentClientTime()
  const pinCheck147 = f.equal(result146, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck147)

  // getCurrentClientTimeHighPrecision / get_current_client_time_high_precision / genericId=200270 / literal=0, wire=0
  const result148 = f.getCurrentClientTimeHighPrecision()
  const pinCheck149 = f.equal(result148.clientTimeS, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck149)
  const pinCheck150 = f.equal(result148.clientTimeMs, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck150)

  // getCurrentFollowingControlMotor / get_current_following_control_motor / genericId=200295 / literal=0, wire=0
  const result151 = f.getCurrentFollowingControlMotor()
  const pinCheck152 = f.equal(result151, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck152)

  // getCurrentKeyBehavior / get_current_key_behavior / genericId=200267 / literal=0, wire=0
  const result153 = f.getCurrentKeyBehavior()
  const pinCheck154 = f.greaterThanOrEqualTo(f.getListLength(result153.behaviorIDList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck154)
  const pinCheck155 = f.greaterThanOrEqualTo(f.getListLength(result153.entryTimeList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck155)

  // getCurrentKeyBehaviorHighPrecision / get_current_key_behavior_high_precision / genericId=200268 / literal=0, wire=0
  const result156 = f.getCurrentKeyBehaviorHighPrecision()
  const pinCheck157 = f.greaterThanOrEqualTo(f.getListLength(result156.behaviorIDList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck157)
  const pinCheck158 = f.greaterThanOrEqualTo(f.getListLength(result156.entryTimeListS), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck158)
  const pinCheck159 = f.greaterThanOrEqualTo(f.getListLength(result156.entryTimeListMs), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck159)

  // getCursorHitResult / get_cursor_hit_result / genericId=200285 / literal=0, wire=0
  const result160 = f.getCursorHitResult()
  const pinCheck161 = f.greaterThanOrEqualTo(f.getListLength(result160.hitEntityList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck161)
  const pinCheck162 = f.greaterThanOrEqualTo(f.getListLength(result160.hitPositionList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck162)
  const pinCheck163 = f.equal(result160.hitCount, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck163)

  // getCursorScreenCoordinates / get_cursor_screen_coordinates / genericId=200286 / literal=0, wire=0
  const result164 = f.getCursorScreenCoordinates()
  const pinCheck165 = f.equal(result164.screenX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck165)
  const pinCheck166 = f.equal(result164.screenY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck166)

  // getCursorViewportCoordinates / get_cursor_viewport_coordinates / genericId=200287 / literal=0, wire=0
  const result167 = f.getCursorViewportCoordinates()
  const pinCheck168 = f.equal(result167.viewportX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck168)
  const pinCheck169 = f.equal(result167.viewportY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck169)

  // getCustomVariable / get_custom_variable / genericId=200016 / literal=0, wire=2
  const result170 = f.getCustomVariable(wireEntity, wireStr)
  const narrowed171 = result170.asType('int')
  const pinCheck172 = f.equal(narrowed171, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck172)

  // getEntityCurrentlyScannedByScanComponent / get_entity_currently_scanned_by_scan_component / genericId=200118 / literal=0, wire=0
  const result173 = f.getEntityCurrentlyScannedByScanComponent()
  const pinCheck174 = f.equal(result173.correspondingEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck174)
  const pinCheck175 = f.equal(result173.scanTagConfigID, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck175)

  // getEntityListByUnitTag / get_entity_list_by_unit_tag / genericId=200078 / literal=1, wire=0
  const pinCheck178 = f.greaterThanOrEqualTo(f.getListLength(f.getEntityListByUnitTag(176n)), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck178)

  // getEntityLocation / get_entity_location / genericId=200030 / literal=0, wire=1
  const result179 = f.getEntityLocation(wireEntity)
  const pinCheck180 = f.equal(result179, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck180)

  // getEntityRotation / get_entity_rotation / genericId=200031 / literal=1, wire=0
  const result181 = f.getEntityRotation(self)
  const pinCheck182 = f.equal(result181, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck182)

  // getEntitySCurrentActiveScanTags / get_entity_s_current_active_scan_tags / genericId=200121 / literal=0, wire=1
  const result183 = f.getEntitySCurrentActiveScanTags(wireEntity)
  const pinCheck184 = f.equal(result183, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck184)

  // getEntitySScanStatus / get_entity_s_scan_status / genericId=200120 / literal=0, wire=1
  const result185 = f.getEntitySScanStatus(wireEntity)
  const pinCheck186 = f.enumerationMatch(result185, CE.ScanStatus.UnusableTarget)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck186)

  // getEntitySType / get_entity_s_type / genericId=200045 / literal=1, wire=0
  const result187 = f.getEntitySType(self)
  const pinCheck188 = f.enumerationMatch(result187, E.EntityType.Stage)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck188)

  // getEntitySUnitTagList / get_entity_s_unit_tag_list / genericId=200077 / literal=1, wire=0
  const pinCheck190 = f.greaterThanOrEqualTo(f.getListLength(f.getEntitySUnitTagList(self)), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck190)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe192 = f.getRayDetectionResult(
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
  const pinCheck193 = f.equal(enumListProbe192.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck193)

  // getListLength / get_list_length / genericId=200018 / literal=0, wire=1
  const result194 = f.getListLength(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck195 = f.equal(result194, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck195)

  // getListOfKeysFromDictionary / get_list_of_keys_from_dictionary / genericId=200159 / literal=0, wire=1
  const pinCheck197 = f.greaterThanOrEqualTo(
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
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck197)

  // getListOfPlayerEntitiesOnTheField / get_list_of_player_entities_on_the_field / genericId=200026 / literal=0, wire=0
  const pinCheck199 = f.greaterThanOrEqualTo(
    f.getListLength(f.getListOfPlayerEntitiesOnTheField()),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck199)

  // getListOfValuesFromDictionary / get_list_of_values_from_dictionary / genericId=200158 / literal=0, wire=1
  const pinCheck201 = f.greaterThanOrEqualTo(
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
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck201)

  // getLocalVariable / get_local_variable / genericId=200082 / literal=1, wire=0
  const result203 = f.getLocalVariable('literal-202')
  const narrowed204 = result203.asType('int')
  const pinCheck205 = f.equal(narrowed204, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck205)

  // getMaximumValueFromList / get_maximum_value_from_list / genericId=200020 / literal=0, wire=1
  const result206 = f.getMaximumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck207 = f.equal(result206, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck207)

  // getMinimumValueFromList / get_minimum_value_from_list / genericId=200021 / literal=0, wire=1
  const result208 = f.getMinimumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck209 = f.equal(result208, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck209)

  // getPlayerClientInputDeviceType / get_player_client_input_device_type / genericId=200123 / literal=0, wire=0
  const result210 = f.getPlayerClientInputDeviceType()
  const pinCheck211 = f.enumerationMatch(result210, E.InputDeviceType.KeyboardAndMouse)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck211)

  // getPlayerEntityToWhichTheCharacterBelongs / get_player_entity_to_which_the_character_belongs / genericId=200025 / literal=1, wire=0
  const result212 = f.getPlayerEntityToWhichTheCharacterBelongs(self)
  const pinCheck213 = f.equal(result212, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck213)

  // getPlayerMovementInput / get_player_movement_input / genericId=200255 / literal=0, wire=0
  const result214 = f.getPlayerMovementInput()
  const pinCheck215 = f.equal(result214.inputDirection, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck215)
  const pinCheck216 = f.equal(result214.inputStrength, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck216)

  // getPreAimingCollisionDetectionResultCount / get_pre_aiming_collision_detection_result_count / genericId=200280 / literal=1, wire=1
  const result217 = f.getPreAimingCollisionDetectionResultCount(
    wireInt,
    CE.PreAimResultDataType.Default
  )
  const pinCheck218 = f.equal(result217, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck218)

  // getPreAimingDuration / get_pre_aiming_duration / genericId=200278 / literal=2, wire=0
  const result220 = f.getPreAimingDuration(219n, CE.PreAimResultDataType.Default)
  const pinCheck221 = f.equal(result220, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck221)

  // getPreAimingRayHitInfo / get_pre_aiming_ray_hit_info / genericId=200281 / literal=1, wire=1
  const result222 = f.getPreAimingRayHitInfo(wireInt, CE.PreAimResultDataType.Default)
  const pinCheck223 = f.equal(result222.hitPosition, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck223)
  const pinCheck224 = f.equal(result222.hitEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck224)

  // getPreAimingResult / get_pre_aiming_result / genericId=200277 / literal=1, wire=1
  const result225 = f.getPreAimingResult(wireInt, CE.PreAimResultDataType.Default)
  const pinCheck226 = f.equal(result225.hitPosition, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck226)
  const pinCheck227 = f.equal(result225.inRangePosition, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck227)
  const pinCheck228 = f.equal(result225.bestValidTarget, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck228)
  const pinCheck229 = f.greaterThanOrEqualTo(f.getListLength(result225.validTargetList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck229)

  // getPresetStatus / get_preset_status / genericId=200028 / literal=1, wire=1
  const result230 = f.getPresetStatus(self, wireInt)
  const pinCheck231 = f.equal(result230, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck231)

  // getRandomNumber / get_random_number / genericId=200032 / literal=2, wire=0
  const result234 = f.getRandomNumber(232n, 233n)
  const pinCheck235 = f.equal(result234, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck235)

  // getRayDetectionResult / get_ray_detection_result / genericId=200109 / literal=4, wire=3
  const result238 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    [237, 238, 239],
    wireFloat,
    E.TargetType.None,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    [CE.RayFilterType.Hurtbox, CE.RayFilterType.Scene, CE.RayFilterType.ObjectSelfCollision]
  )
  const pinCheck239 = f.equal(result238.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck239)
  const pinCheck240 = f.equal(result238.onHitEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck240)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200110 / literal=1, wire=0
  const enumListProbe242 = f.getRayDetectionResult(
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
  const pinCheck243 = f.equal(enumListProbe242.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck243)

  // getSelfEntity / get_self_entity / genericId=200033 / literal=0, wire=0
  const result244 = f.getSelfEntity()
  const pinCheck245 = f.equal(result244, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck245)

  // getSkillConfigIdBySkillInstanceId / get_skill_config_id_by_skill_instance_id / genericId=200272 / literal=0, wire=1
  const result246 = f.getSkillConfigIdBySkillInstanceId(wireInt)
  const pinCheck247 = f.equal(result246, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck247)

  // getTargetAttachmentPointLocation / get_target_attachment_point_location / genericId=200047 / literal=1, wire=1
  const result249 = f.getTargetAttachmentPointLocation(wireEntity, 'literal-248')
  const pinCheck250 = f.equal(result249, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck250)

  // getTargetAttachmentPointRotation / get_target_attachment_point_rotation / genericId=200048 / literal=1, wire=1
  const result251 = f.getTargetAttachmentPointRotation(self, wireStr)
  const pinCheck252 = f.equal(result251, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck252)

  // getTargetEntity / get_target_entity / genericId=200034 / literal=0, wire=0
  const result253 = f.getTargetEntity()
  const pinCheck254 = f.equal(result253, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck254)

  // getTheAggroListOfTheSpecifiedEntity / get_the_aggro_list_of_the_specified_entity / genericId=200091 / literal=0, wire=1
  const pinCheck256 = f.greaterThanOrEqualTo(
    f.getListLength(f.getTheAggroListOfTheSpecifiedEntity(wireEntity)),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck256)

  // getTheAggroTargetOfTheSpecifiedEntity / get_the_aggro_target_of_the_specified_entity / genericId=200090 / literal=1, wire=0
  const result257 = f.getTheAggroTargetOfTheSpecifiedEntity(self)
  const pinCheck258 = f.equal(result257, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck258)

  // getUnitAttackTarget / get_unit_attack_target / genericId=200035 / literal=1, wire=0
  const result259 = f.getUnitAttackTarget(self)
  const pinCheck260 = f.equal(result259, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck260)

  // getWhetherControlMotorIsGrounded / get_whether_control_motor_is_grounded / genericId=200300 / literal=0, wire=1
  const result261 = f.getWhetherControlMotorIsGrounded(wireEntity)
  const pinCheck262 = f.equal(result261, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck262)

  // getWhetherCursorIsActive / get_whether_cursor_is_active / genericId=200284 / literal=0, wire=0
  const result263 = f.getWhetherCursorIsActive()
  const pinCheck264 = f.equal(result263, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck264)

  // getWhetherPreAimingStickIsInDeadZone / get_whether_pre_aiming_stick_is_in_dead_zone / genericId=200282 / literal=2, wire=0
  const result266 = f.getWhetherPreAimingStickIsInDeadZone(265n, CE.PreAimResultDataType.Default)
  const pinCheck267 = f.equal(result266, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck267)

  // greaterThan / greater_than / genericId=200007 / literal=2, wire=0
  const result270 = f.greaterThan(268n, 269n)
  const pinCheck271 = f.equal(result270, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck271)

  // greaterThanOrEqualTo / greater_than_or_equal_to / genericId=200010 / literal=2, wire=0
  const result274 = f.greaterThanOrEqualTo(272n, 273n)
  const pinCheck275 = f.equal(result274, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck275)

  // lessThan / less_than / genericId=200008 / literal=0, wire=2
  const result279 = f.lessThan(wireInt, wireInt)
  const pinCheck280 = f.equal(result279, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck280)

  // lessThanOrEqualTo / less_than_or_equal_to / genericId=200009 / literal=0, wire=2
  const result281 = f.lessThanOrEqualTo(wireInt, wireInt)
  const pinCheck282 = f.equal(result281, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck282)

  // listIncludesThisValue / list_includes_this_value / genericId=200019 / literal=0, wire=2
  const result283 = f.listIncludesThisValue(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck284 = f.equal(result283, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck284)

  // logicalAndOperation / logical_and_operation / genericId=200001 / literal=0, wire=2
  const result285 = f.logicalAndOperation(wireBool, wireBool)
  const pinCheck286 = f.equal(result285, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck286)

  // logicalNotOperation / logical_not_operation / genericId=200003 / literal=1, wire=0
  const result288 = f.logicalNotOperation(true)
  const pinCheck289 = f.equal(result288, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck289)

  // logicalOrOperation / logical_or_operation / genericId=200002 / literal=0, wire=2
  const result290 = f.logicalOrOperation(wireBool, wireBool)
  const pinCheck291 = f.equal(result290, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck291)

  // logicalXorOperation / logical_xor_operation / genericId=200004 / literal=0, wire=2
  const result292 = f.logicalXorOperation(wireBool, wireBool)
  const pinCheck293 = f.equal(result292, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck293)

  // multiplication / multiplication / genericId=200013 / literal=0, wire=2
  const result294 = f.multiplication(wireInt, wireInt)
  const pinCheck295 = f.equal(result294, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck295)

  // orientationToRotation / orientation_to_rotation / genericId=200074 / literal=0, wire=1
  const result300 = f.orientationToRotation(wireVec3)
  const pinCheck301 = f.equal(result300, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck301)

  // queryActiveSkillInstanceListOfSpecifiedSlot / query_active_skill_instance_list_of_specified_slot / genericId=200274 / literal=1, wire=0
  const result307 = f.queryActiveSkillInstanceListOfSpecifiedSlot(E.CharacterSkillSlot.NormalAttack)
  const pinCheck308 = f.equal(result307, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck308)

  // queryDictionarySLength / query_dictionary_s_length / genericId=200157 / literal=0, wire=1
  const result309 = f.queryDictionarySLength(
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
  const pinCheck310 = f.equal(result309, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck310)

  // queryDictionaryValueByKey / query_dictionary_value_by_key / genericId=200154 / literal=0, wire=2
  const result311 = f.queryDictionaryValueByKey(
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
  const pinCheck312 = f.equal(result311, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck312)

  // queryEntityByGuid / query_entity_by_guid / genericId=200023 / literal=1, wire=0
  const result314 = f.queryEntityByGuid(guid(313n))
  const pinCheck315 = f.equal(result314, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck315)

  // queryEntityFaction / query_entity_faction / genericId=200029 / literal=0, wire=1
  const result316 = f.queryEntityFaction(wireEntity)
  const pinCheck317 = f.equal(result316, faction(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck317)

  // queryGuidByEntity / query_guid_by_entity / genericId=200027 / literal=1, wire=0
  const result318 = f.queryGuidByEntity(self)
  const pinCheck319 = f.equal(result318, guid(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck319)

  // queryIfDictionaryContainsSpecificKey / query_if_dictionary_contains_specific_key / genericId=200155 / literal=0, wire=2
  const result320 = f.queryIfDictionaryContainsSpecificKey(
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
  const pinCheck321 = f.equal(result320, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck321)

  // queryIfDictionaryContainsSpecificValue / query_if_dictionary_contains_specific_value / genericId=200156 / literal=0, wire=2
  const result322 = f.queryIfDictionaryContainsSpecificValue(
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
  const pinCheck323 = f.equal(result322, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck323)

  // queryIfEntityIsOnTheField / query_if_entity_is_on_the_field / genericId=200103 / literal=1, wire=0
  const result324 = f.queryIfEntityIsOnTheField(self)
  const pinCheck325 = f.equal(result324, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck325)

  // queryIfFactionIsHostile / query_if_faction_is_hostile / genericId=200093 / literal=2, wire=0
  const result328 = f.queryIfFactionIsHostile(faction(326n), faction(327n))
  const pinCheck329 = f.equal(result328, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck329)

  // queryIfSelfIsInCombat / query_if_self_is_in_combat / genericId=200037 / literal=0, wire=0
  const result330 = f.queryIfSelfIsInCombat()
  const pinCheck331 = f.equal(result330, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck331)

  // queryIfSpecifiedEntityIsInCombat / query_if_specified_entity_is_in_combat / genericId=200092 / literal=0, wire=1
  const result332 = f.queryIfSpecifiedEntityIsInCombat(wireEntity)
  const pinCheck333 = f.equal(result332, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck333)

  // queryPreAimingEndReason / query_pre_aiming_end_reason / genericId=200283 / literal=0, wire=1
  const result334 = f.queryPreAimingEndReason(wireInt)
  const pinCheck335 = f.enumerationMatch(result334, CE.PreAimingEndReason.None)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck335)

  // querySkillInstanceIdBySkillSlotAndSkillConfigId / query_skill_instance_id_by_skill_slot_and_skill_config_id / genericId=200275 / literal=1, wire=1
  const result336 = f.querySkillInstanceIdBySkillSlotAndSkillConfigId(
    E.CharacterSkillSlot.NormalAttack,
    wireConfig
  )
  const pinCheck337 = f.equal(result336, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck337)

  // querySkillInstanceListBySpecifiedSlot / query_skill_instance_list_by_specified_slot / genericId=200273 / literal=1, wire=0
  const pinCheck339 = f.greaterThanOrEqualTo(
    f.getListLength(f.querySkillInstanceListBySpecifiedSlot(E.CharacterSkillSlot.NormalAttack)),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck339)

  // querySkillVariableValue / query_skill_variable_value / genericId=200259 / literal=1, wire=0
  const result341 = f.querySkillVariableValue(configId(340n))
  const pinCheck342 = f.equal(result341, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck342)

  // queryWhetherPlayerIsCurrentlyInVoiceChat / query_whether_player_is_currently_in_voice_chat / genericId=200271 / literal=0, wire=1
  const result343 = f.queryWhetherPlayerIsCurrentlyInVoiceChat(wireEntity)
  const pinCheck344 = f.equal(result343, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck344)

  // radiansToDegrees / radians_to_degrees / genericId=200101 / literal=0, wire=1
  const result345 = f.radiansToDegrees(wireFloat)
  const pinCheck346 = f.equal(result345, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck346)

  // screenCoordinatesToViewportCoordinates / screen_coordinates_to_viewport_coordinates / genericId=200290 / literal=0, wire=2
  const result351 = f.screenCoordinatesToViewportCoordinates(wireFloat, wireFloat)
  const pinCheck352 = f.equal(result351.viewportX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck352)
  const pinCheck353 = f.equal(result351.viewportY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck353)

  // screenCoordinatesToWorldCoordinates / screen_coordinates_to_world_coordinates / genericId=200292 / literal=1, wire=2
  const result355 = f.screenCoordinatesToWorldCoordinates(wireFloat, wireFloat, 354.25)
  const pinCheck356 = f.equal(result355, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck356)

  // sineFunction / sine_function / genericId=200094 / literal=1, wire=0
  const result363 = f.sineFunction(362.25)
  const pinCheck364 = f.equal(result363, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck364)

  // split3dVector / split3d_vector / genericId=200065 / literal=0, wire=1
  const result366 = f.split3dVector(wireVec3)
  const pinCheck367 = f.equal(result366.xComponent, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck367)
  const pinCheck368 = f.equal(result366.yComponent, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck368)
  const pinCheck369 = f.equal(result366.zComponent, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck369)

  // subtraction / subtraction / genericId=200012 / literal=0, wire=2
  const result370 = f.subtraction(wireInt, wireInt)
  const pinCheck371 = f.equal(result370, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck371)

  // tangentFunction / tangent_function / genericId=200096 / literal=1, wire=0
  const result373 = f.tangentFunction(372.25)
  const pinCheck374 = f.equal(result373, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck374)

  // viewportCoordinatesToScreenCoordinates / viewport_coordinates_to_screen_coordinates / genericId=200291 / literal=0, wire=2
  const result547 = f.viewportCoordinatesToScreenCoordinates(wireFloat, wireFloat)
  const pinCheck548 = f.equal(result547.screenX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck548)
  const pinCheck549 = f.equal(result547.screenY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck549)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200243 / literal=1, wire=1
  const result550 = f.whetherTheEntityHasTheSpecifiedUnitStatus(self, wireConfig)
  const pinCheck551 = f.equal(result550, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck551)

  // worldCoordinatesToScreenCoordinates / world_coordinates_to_screen_coordinates / genericId=200293 / literal=1, wire=0
  const result553 = f.worldCoordinatesToScreenCoordinates([552, 553, 554])
  const pinCheck554 = f.equal(result553.screenX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck554)
  const pinCheck555 = f.equal(result553.screenY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck555)

  // addKeyBehavior / add_key_behavior / genericId=200262 / literal=1, wire=0
  f.addKeyBehavior(37n)

  // addTemporaryAcceleration / add_temporary_acceleration / genericId=200305 / literal=0, wire=4
  f.addTemporaryAcceleration(wireEntity, wireFloat, wireVec3, wireFloat)

  // addTemporaryMovementParameterValues / add_temporary_movement_parameter_values / genericId=200289 / literal=4, wire=4
  f.addTemporaryMovementParameterValues(
    wireEntity,
    39.25,
    40.25,
    wireFloat,
    wireFloat,
    wireFloat,
    41.25,
    42.25
  )

  // addUnitStatus / add_unit_status / genericId=200057 / literal=2, wire=1
  f.addUnitStatus(self, wireInt, configId(43n))

  // addVelocity / add_velocity / genericId=200304 / literal=1, wire=3
  f.addVelocity(wireEntity, 44.25, wireVec3, wireFloat)

  // breakLoop is emitted by finiteLoop/traverseEntityList callbacks below.

  // cameraOrientationDetectionData / camera_orientation_detection_data / genericId=200062 / literal=3, wire=1
  const result61 = f.cameraOrientationDetectionData(
    CE.TargetTypeForCameraOrientationNode.None,
    wireVec3,
    59.25,
    60.25
  )
  const pinCheck62 = f.equal(result61.targetRotation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck62)
  const pinCheck63 = f.equal(result61.targetLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck63)

  // castSkillFromSpecifiedSlot / cast_skill_from_specified_slot / genericId=200266 / literal=1, wire=1
  f.castSkillFromSpecifiedSlot(E.CharacterSkillSlot.NormalAttack, wireBool)

  // castSpecifiedSkillInstance / cast_specified_skill_instance / genericId=200265 / literal=2, wire=0
  f.castSpecifiedSkillInstance(64n, true)

  // characterBlink / character_blink / genericId=200261 / literal=0, wire=2
  f.characterBlink(wireVec3, wireVec3)

  // clearKeyBehaviorLogPanel / clear_key_behavior_log_panel / genericId=200263 / literal=0, wire=0
  f.clearKeyBehaviorLogPanel()

  // clearTheAggroListOfTheSpecifiedEntity / clear_the_aggro_list_of_the_specified_entity / genericId=200087 / literal=0, wire=1
  f.clearTheAggroListOfTheSpecifiedEntity(wireEntity)

  // doubleBranch / double_branch / genericId=200056 / literal=1, wire=0
  f.doubleBranch(
    true,
    () => {},
    () => {}
  )

  // finishCurrentPreAiming / finish_current_pre_aiming / genericId=200288 / literal=0, wire=0
  f.finishCurrentPreAiming()

  // finiteLoop / finite_loop / genericId=200079 / literal=2, wire=0
  f.finiteLoop(106n, 107n, (loopValue, breakLoop) => {
    f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', f.equal(loopValue, 0n))
    breakLoop()
  })

  // fixedPointDisplacement / fixed_point_displacement / genericId=200053 / literal=2, wire=3
  f.fixedPointDisplacement(108.25, wireFloat, wireFloat, wireVec3, false)

  // fixedPointProjectileLaunch / fixed_point_projectile_launch / genericId=200052 / literal=3, wire=2
  f.fixedPointProjectileLaunch(
    prefabId(111n),
    [112, 113, 114],
    [113, 114, 115],
    wireEntity,
    wireFaction
  )

  // forceExitAimingState / force_exit_aiming_state / genericId=200108 / literal=0, wire=0
  f.forceExitAimingState()

  // increaseSkillVariableValue / increase_skill_variable_value / genericId=200258 / literal=2, wire=0
  f.increaseSkillVariableValue(configId(276n), 277.25)

  // increaseTheAggroValueOfTheSpecifiedEntity / increase_the_aggro_value_of_the_specified_entity / genericId=200084 / literal=2, wire=1
  f.increaseTheAggroValueOfTheSpecifiedEntity(wireEntity, self, 278n)

  // interruptCurrentSkill / interrupt_current_skill / genericId=200256 / literal=0, wire=0
  f.interruptCurrentSkill()

  // multipleBranches / multiple_branches / genericId=200264 / literal=0, wire=1
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

  // notifyServerNodeGraph / notify_server_node_graph / genericId=200039 / literal=3, wire=0
  f.notifyServerNodeGraph('literal-296', 'literal-297', 'literal-298')

  // playTimedEffects / play_timed_effects / genericId=200038 / literal=3, wire=2
  f.playTimedEffects(configId(302n), wireVec3, [304, 305, 306], 305.25, wireBool)

  // playerTurning / player_turning / genericId=200040 / literal=1, wire=0
  f.playerTurning(CE.RotationType.TargetFirstThenInput)

  // playerTurnsToFaceSetDirection / player_turns_to_face_set_direction / genericId=200105 / literal=1, wire=0
  f.playerTurnsToFaceSetDirection([306, 307, 308])

  // recoverCharacterSHp / recover_character_s_hp / genericId=200075 / literal=4, wire=1
  f.recoverCharacterSHp(self, 347.25, false, wireFloat, 349n)

  // removeSpecifiedCharacterDisruptorDevice / remove_specified_character_disruptor_device / genericId=200060 / literal=1, wire=0
  f.removeSpecifiedCharacterDisruptorDevice(E.DisruptorDeviceType.ForceFieldDevice)

  // removeTargetEntityFromAggroList / remove_target_entity_from_aggro_list / genericId=200088 / literal=1, wire=1
  f.removeTargetEntityFromAggroList(self, wireEntity)

  // removeUnitStatus / remove_unit_status / genericId=200058 / literal=1, wire=1
  f.removeUnitStatus(wireEntity, configId(350n))

  // resetSkillTarget / reset_skill_target / genericId=200106 / literal=0, wire=0
  f.resetSkillTarget()

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

  // setAttackWeight / set_attack_weight / genericId=200061 / literal=2, wire=0
  f.setAttackWeight(357.25, false)

  // setControlMotorToUngroundedState / set_control_motor_to_ungrounded_state / genericId=200306 / literal=1, wire=1
  f.setControlMotorToUngroundedState(wireEntity, 359.25)

  // setLocalVariable / set_local_variable / genericId=200081 / literal=1, wire=1
  f.setLocalVariable('literal-360', wireInt)

  // setOwnAttackTarget / set_own_attack_target / genericId=200041 / literal=0, wire=2
  f.setOwnAttackTarget(wireEntity, wireBool)

  // setSkillVariable / set_skill_variable / genericId=200257 / literal=1, wire=1
  f.setSkillVariable(configId(361n), wireFloat)

  // setTheAggroValueOfSpecifiedEntity / set_the_aggro_value_of_specified_entity / genericId=200083 / literal=1, wire=2
  f.setTheAggroValueOfSpecifiedEntity(self, wireEntity, wireInt)

  // setTheAggroValueOfTheSpecifiedEntityProportionally / set_the_aggro_value_of_the_specified_entity_proportionally / genericId=200085 / literal=1, wire=2
  f.setTheAggroValueOfTheSpecifiedEntityProportionally(wireEntity, self, wireFloat)

  // tauntTarget / taunt_target / genericId=200089 / literal=1, wire=1
  f.tauntTarget(wireEntity, self)

  // transferTheAggroValueOfTheSpecifiedEntityProportionally / transfer_the_aggro_value_of_the_specified_entity_proportionally / genericId=200086 / literal=2, wire=2
  f.transferTheAggroValueOfTheSpecifiedEntityProportionally(wireEntity, self, self, wireFloat)

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

  // triggerHitboxAtSpecificLocation / trigger_hitbox_at_specific_location / genericId=200051 / literal=35, wire=3
  f.triggerHitboxAtSpecificLocation(
    E.TargetType.None,
    [375, 376, 377],
    wireVec3,
    wireFloat,
    377.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    378n,
    E.AttackShape.Rectangle,
    [379, 380, 381],
    380.25,
    381.25,
    382.25,
    383.25,
    384.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    385.25,
    E.HitType.None,
    E.AttackType.None,
    386.25,
    true,
    388n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [390, 391, 392],
    [391, 392, 393],
    392.25,
    [393, 394, 395],
    [394, 395, 396],
    395.25,
    396.25,
    wireInt,
    CE.HitLevel.NoEffect,
    397.25,
    398.25
  )

  // triggerHitboxAtSpecifiedAttachmentPoint / trigger_hitbox_at_specified_attachment_point / genericId=200059 / literal=36, wire=3
  f.triggerHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-399',
    [400, 401, 402],
    [401, 402, 403],
    402.25,
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
    403n,
    E.AttackShape.Rectangle,
    [404, 405, 406],
    405.25,
    406.25,
    407.25,
    408.25,
    409.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    410.25,
    E.HitType.None,
    E.AttackType.None,
    411.25,
    false,
    413n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [415, 416, 417],
    [416, 417, 418],
    417.25,
    [418, 419, 420],
    [419, 420, 421],
    420.25,
    wireFloat,
    421n,
    CE.HitLevel.NoEffect,
    422.25,
    423.25
  )

  // triggerRectangularHitboxAtSpecificLocation / trigger_rectangular_hitbox_at_specific_location / genericId=200112 / literal=28, wire=3
  f.triggerRectangularHitboxAtSpecificLocation(
    E.TargetType.None,
    [424, 425, 426],
    wireVec3,
    wireFloat,
    426.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    427n,
    [428, 429, 430],
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    429.25,
    E.HitType.None,
    E.AttackType.None,
    430.25,
    true,
    432n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [434, 435, 436],
    [435, 436, 437],
    436.25,
    [437, 438, 439],
    [438, 439, 440],
    439.25,
    440.25,
    wireInt,
    CE.HitLevel.NoEffect,
    441.25,
    442.25
  )

  // triggerRectangularHitboxAtSpecifiedAttachmentPoint / trigger_rectangular_hitbox_at_specified_attachment_point / genericId=200115 / literal=29, wire=3
  f.triggerRectangularHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-443',
    [444, 445, 446],
    [445, 446, 447],
    446.25,
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
    447n,
    [448, 449, 450],
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    449.25,
    E.HitType.None,
    E.AttackType.None,
    450.25,
    true,
    452n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [454, 455, 456],
    [455, 456, 457],
    456.25,
    [457, 458, 459],
    [458, 459, 460],
    459.25,
    wireFloat,
    460n,
    CE.HitLevel.NoEffect,
    461.25,
    462.25
  )

  // triggerSectorHitboxAtSpecificLocation / trigger_sector_hitbox_at_specific_location / genericId=200113 / literal=32, wire=3
  f.triggerSectorHitboxAtSpecificLocation(
    E.TargetType.None,
    [463, 464, 465],
    wireVec3,
    wireFloat,
    465.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    466n,
    467.25,
    468.25,
    469.25,
    470.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    471.25,
    E.HitType.None,
    E.AttackType.None,
    472.25,
    true,
    474n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [476, 477, 478],
    [477, 478, 479],
    478.25,
    [479, 480, 481],
    [480, 481, 482],
    481.25,
    wireFloat,
    482n,
    CE.HitLevel.NoEffect,
    483.25,
    484.25
  )

  // triggerSectorHitboxAtSpecifiedAttachmentPoint / trigger_sector_hitbox_at_specified_attachment_point / genericId=200116 / literal=33, wire=3
  f.triggerSectorHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-485',
    [486, 487, 488],
    [487, 488, 489],
    488.25,
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
    489n,
    490.25,
    491.25,
    492.25,
    493.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    494.25,
    E.HitType.None,
    E.AttackType.None,
    495.25,
    false,
    497n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [499, 500, 501],
    [500, 501, 502],
    501.25,
    [502, 503, 504],
    [503, 504, 505],
    504.25,
    505.25,
    wireInt,
    CE.HitLevel.NoEffect,
    506.25,
    507.25
  )

  // triggerSphericalHitboxAtSpecificLocation / trigger_spherical_hitbox_at_specific_location / genericId=200111 / literal=27, wire=4
  f.triggerSphericalHitboxAtSpecificLocation(
    E.TargetType.None,
    wireVec3,
    [509, 510, 511],
    510.25,
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
    511n,
    512.25,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    513.25,
    E.HitType.None,
    E.AttackType.None,
    514.25,
    true,
    516n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [518, 519, 520],
    [519, 520, 521],
    520.25,
    [521, 522, 523],
    [522, 523, 524],
    523.25,
    wireFloat,
    524n,
    CE.HitLevel.NoEffect,
    525.25,
    526.25
  )

  // triggerSphericalHitboxAtSpecifiedAttachmentPoint / trigger_spherical_hitbox_at_specified_attachment_point / genericId=200114 / literal=28, wire=4
  f.triggerSphericalHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-527',
    wireVec3,
    wireVec3,
    wireFloat,
    530.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    531n,
    532.25,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    533.25,
    E.HitType.None,
    E.AttackType.None,
    534.25,
    true,
    536n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [538, 539, 540],
    [539, 540, 541],
    540.25,
    [541, 542, 543],
    [542, 543, 544],
    543.25,
    544.25,
    wireInt,
    CE.HitLevel.NoEffect,
    545.25,
    546.25
  )
})

g.creationSkill({
  id: 1082130437,
  name: 'AllClientNodesCreationSkillBeyond',
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
  const pinCheck459 = f.equal(wireStr, '')
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck459)
  const pinCheck460 = f.equal(wireGuid, guid(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck460)
  const pinCheck461 = f.equal(wireConfig, configId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck461)
  const pinCheck462 = f.equal(wirePrefab, prefabId(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck462)

  // _3dVectorAddition / _3d_vector_addition / genericId=200071 / literal=0, wire=2
  const result3 = f._3dVectorAddition(wireVec3, wireVec3)
  const pinCheck4 = f.equal(result3, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck4)

  // _3dVectorAngle / _3d_vector_angle / genericId=200067 / literal=2, wire=0
  const result7 = f._3dVectorAngle([5, 6, 7], [6, 7, 8])
  const pinCheck8 = f.equal(result7, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck8)

  // _3dVectorCrossProduct / _3d_vector_cross_product / genericId=200064 / literal=2, wire=0
  const result11 = f._3dVectorCrossProduct([9, 10, 11], [10, 11, 12])
  const pinCheck12 = f.equal(result11, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck12)

  // _3dVectorDotProduct / _3d_vector_dot_product / genericId=200063 / literal=0, wire=2
  const result15 = f._3dVectorDotProduct(wireVec3, wireVec3)
  const pinCheck16 = f.equal(result15, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck16)

  // _3dVectorModuloOperation / _3d_vector_modulo_operation / genericId=200069 / literal=0, wire=1
  const result18 = f._3dVectorModuloOperation(wireVec3)
  const pinCheck19 = f.equal(result18, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck19)

  // _3dVectorNormalization / _3d_vector_normalization / genericId=200100 / literal=0, wire=1
  const result21 = f._3dVectorNormalization(wireVec3)
  const pinCheck22 = f.equal(result21, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck22)

  // _3dVectorRotation / _3d_vector_rotation / genericId=200068 / literal=1, wire=1
  const result25 = f._3dVectorRotation([23, 24, 25], wireVec3)
  const pinCheck26 = f.equal(result25, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck26)

  // _3dVectorSubtraction / _3d_vector_subtraction / genericId=200072 / literal=0, wire=2
  const result29 = f._3dVectorSubtraction(wireVec3, wireVec3)
  const pinCheck30 = f.equal(result29, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck30)

  // _3dVectorZoom / _3d_vector_zoom / genericId=200066 / literal=2, wire=0
  const result33 = f._3dVectorZoom(31.25, [32, 33, 34])
  const pinCheck34 = f.equal(result33, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck34)

  // absoluteValueOperation / absolute_value_operation / genericId=200015 / literal=0, wire=1
  const result35 = f.absoluteValueOperation(wireInt)
  const pinCheck36 = f.equal(result35, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck36)

  // addition / addition / genericId=200011 / literal=0, wire=2
  const result38 = f.addition(wireInt, wireInt)
  const pinCheck39 = f.equal(result38, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck39)

  // arccosineFunction / arccosine_function / genericId=200098 / literal=0, wire=1
  const result40 = f.arccosineFunction(wireFloat)
  const pinCheck41 = f.equal(result40, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck41)

  // arcsineFunction / arcsine_function / genericId=200097 / literal=0, wire=1
  const result42 = f.arcsineFunction(wireFloat)
  const pinCheck43 = f.equal(result42, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck43)

  // arctangentFunction / arctangent_function / genericId=200099 / literal=0, wire=1
  const result44 = f.arctangentFunction(wireFloat)
  const pinCheck45 = f.equal(result44, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck45)

  // assemblyDictionary / assembly_dictionary / genericId=200152 / literal=0, wire=1
  const pinCheck47 = f.greaterThanOrEqualTo(
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
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck47)

  // assemblyList / assembly_list / genericId=200049 / literal=1, wire=1
  const pinCheck49 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.assemblyList(
        [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
        'int'
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck49)

  // checkThePresetStatusValueOfTheComplexCreation / check_the_preset_status_value_of_the_complex_creation / genericId=200244 / literal=2, wire=0
  const result51 = f.checkThePresetStatusValueOfTheComplexCreation(self, 50n)
  const pinCheck52 = f.equal(result51, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck52)

  // cosineFunction / cosine_function / genericId=200095 / literal=1, wire=0
  const result58 = f.cosineFunction(57.25)
  const pinCheck59 = f.equal(result58, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck59)

  // create3dVector / create3d_vector / genericId=200070 / literal=0, wire=3
  const result60 = f.create3dVector(wireFloat, wireFloat, wireFloat)
  const pinCheck61 = f.equal(result60, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck61)

  // createDictionary / create_dictionary / genericId=200153 / literal=0, wire=2
  const pinCheck63 = f.greaterThanOrEqualTo(
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
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck63)

  // dataTypeConversion / data_type_conversion / genericId=200022 / literal=2, wire=0
  const result66 = f.dataTypeConversion(65n, 'str')
  const pinCheck67 = f.equal(result66, '')
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck67)

  // degreesToRadians / degrees_to_radians / genericId=200102 / literal=0, wire=1
  const result68 = f.degreesToRadians(wireFloat)
  const pinCheck69 = f.equal(result68, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck69)

  // directionVectorToRotation / direction_vector_to_rotation / genericId=200073 / literal=1, wire=1
  const result72 = f.directionVectorToRotation(wireVec3, [71, 72, 73])
  const pinCheck73 = f.equal(result72, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck73)

  // division / division / genericId=200014 / literal=2, wire=0
  const result76 = f.division(74n, 75n)
  const pinCheck77 = f.equal(result76, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck77)

  // enumerationMatch / enumeration_match / genericId=200005 / literal=2, wire=0
  const result79 = f.enumerationMatch(E.SortBy.Ascending, E.SortBy.Ascending)
  const pinCheck80 = f.equal(result79, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck80)

  // equal / equal / genericId=200006 / literal=0, wire=2
  const result81 = f.equal(wireInt, wireInt)
  const pinCheck82 = f.equal(result81, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck82)

  // filterEntityListWithinSphericalRange / filter_entity_list_within_spherical_range / genericId=200043 / literal=2, wire=2
  const pinCheck86 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSphericalRange(
        83.25,
        wireVec3,
        wireInt,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck86)

  // filterEntityListWithinSquareRange / filter_entity_list_within_square_range / genericId=200044 / literal=4, wire=2
  const pinCheck92 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSquareRange(
        87.25,
        88.25,
        89.25,
        wireVec3,
        wireInt,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck92)

  // getAllEntitiesWithinTheCollisionTrigger / get_all_entities_within_the_collision_trigger / genericId=200107 / literal=2, wire=0
  const pinCheck100 = f.greaterThanOrEqualTo(
    f.getListLength(f.getAllEntitiesWithinTheCollisionTrigger(self, 98n)),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck100)

  // getCorrespondingValueFromList / get_corresponding_value_from_list / genericId=200017 / literal=0, wire=2
  const result101 = f.getCorrespondingValueFromList(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck102 = f.equal(result101, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck102)

  // getCreationSCurrentTarget / get_creation_s_current_target / genericId=200221 / literal=0, wire=1
  const result103 = f.getCreationSCurrentTarget(wireEntity)
  const pinCheck104 = f.equal(result103, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck104)

  // getCursorHitResult / get_cursor_hit_result / genericId=200285 / literal=0, wire=0
  const result105 = f.getCursorHitResult()
  const pinCheck106 = f.greaterThanOrEqualTo(f.getListLength(result105.hitEntityList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck106)
  const pinCheck107 = f.greaterThanOrEqualTo(f.getListLength(result105.hitPositionList), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck107)
  const pinCheck108 = f.equal(result105.hitCount, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck108)

  // getCursorScreenCoordinates / get_cursor_screen_coordinates / genericId=200286 / literal=0, wire=0
  const result109 = f.getCursorScreenCoordinates()
  const pinCheck110 = f.equal(result109.screenX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck110)
  const pinCheck111 = f.equal(result109.screenY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck111)

  // getCursorViewportCoordinates / get_cursor_viewport_coordinates / genericId=200287 / literal=0, wire=0
  const result112 = f.getCursorViewportCoordinates()
  const pinCheck113 = f.equal(result112.viewportX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck113)
  const pinCheck114 = f.equal(result112.viewportY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck114)

  // getCustomVariable / get_custom_variable / genericId=200016 / literal=0, wire=2
  const result115 = f.getCustomVariable(wireEntity, wireStr)
  const narrowed116 = result115.asType('int')
  const pinCheck117 = f.equal(narrowed116, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck117)

  // getEntityListByUnitTag / get_entity_list_by_unit_tag / genericId=200078 / literal=1, wire=0
  const pinCheck120 = f.greaterThanOrEqualTo(f.getListLength(f.getEntityListByUnitTag(118n)), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck120)

  // getEntityLocation / get_entity_location / genericId=200030 / literal=0, wire=1
  const result121 = f.getEntityLocation(wireEntity)
  const pinCheck122 = f.equal(result121, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck122)

  // getEntityRotation / get_entity_rotation / genericId=200031 / literal=1, wire=0
  const result123 = f.getEntityRotation(self)
  const pinCheck124 = f.equal(result123, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck124)

  // getEntitySType / get_entity_s_type / genericId=200045 / literal=1, wire=0
  const result125 = f.getEntitySType(self)
  const pinCheck126 = f.enumerationMatch(result125, E.EntityType.Stage)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck126)

  // getEntitySUnitTagList / get_entity_s_unit_tag_list / genericId=200077 / literal=1, wire=0
  const pinCheck128 = f.greaterThanOrEqualTo(f.getListLength(f.getEntitySUnitTagList(self)), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck128)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe130 = f.getRayDetectionResult(
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
  const pinCheck131 = f.equal(enumListProbe130.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck131)

  // getListLength / get_list_length / genericId=200018 / literal=0, wire=1
  const result132 = f.getListLength(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck133 = f.equal(result132, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck133)

  // getListOfKeysFromDictionary / get_list_of_keys_from_dictionary / genericId=200159 / literal=0, wire=1
  const pinCheck135 = f.greaterThanOrEqualTo(
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
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck135)

  // getListOfPlayerEntitiesOnTheField / get_list_of_player_entities_on_the_field / genericId=200026 / literal=0, wire=0
  const pinCheck137 = f.greaterThanOrEqualTo(
    f.getListLength(f.getListOfPlayerEntitiesOnTheField()),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck137)

  // getListOfValuesFromDictionary / get_list_of_values_from_dictionary / genericId=200158 / literal=0, wire=1
  const pinCheck139 = f.greaterThanOrEqualTo(
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
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck139)

  // getLocalVariable / get_local_variable / genericId=200082 / literal=1, wire=0
  const result141 = f.getLocalVariable('literal-140')
  const narrowed142 = result141.asType('int')
  const pinCheck143 = f.equal(narrowed142, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck143)

  // getMaximumValueFromList / get_maximum_value_from_list / genericId=200020 / literal=0, wire=1
  const result144 = f.getMaximumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck145 = f.equal(result144, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck145)

  // getMinimumValueFromList / get_minimum_value_from_list / genericId=200021 / literal=0, wire=1
  const result146 = f.getMinimumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck147 = f.equal(result146, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck147)

  // getPlayerEntityToWhichTheCharacterBelongs / get_player_entity_to_which_the_character_belongs / genericId=200025 / literal=1, wire=0
  const result148 = f.getPlayerEntityToWhichTheCharacterBelongs(self)
  const pinCheck149 = f.equal(result148, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck149)

  // getPresetStatus / get_preset_status / genericId=200028 / literal=1, wire=1
  const result150 = f.getPresetStatus(self, wireInt)
  const pinCheck151 = f.equal(result150, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck151)

  // getRandomNumber / get_random_number / genericId=200032 / literal=2, wire=0
  const result154 = f.getRandomNumber(152n, 153n)
  const pinCheck155 = f.equal(result154, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck155)

  // getRayDetectionResult / get_ray_detection_result / genericId=200109 / literal=4, wire=3
  const result158 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    [157, 158, 159],
    wireFloat,
    E.TargetType.None,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    [CE.RayFilterType.Hurtbox, CE.RayFilterType.Scene, CE.RayFilterType.ObjectSelfCollision]
  )
  const pinCheck159 = f.equal(result158.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck159)
  const pinCheck160 = f.equal(result158.onHitEntity, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck160)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200110 / literal=1, wire=0
  const enumListProbe162 = f.getRayDetectionResult(
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
  const pinCheck163 = f.equal(enumListProbe162.onHitLocation, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck163)

  // getSelfEntity / get_self_entity / genericId=200033 / literal=0, wire=0
  const result164 = f.getSelfEntity()
  const pinCheck165 = f.equal(result164, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck165)

  // getSubEntityList / get_sub_entity_list / genericId=200214 / literal=0, wire=1
  const pinCheck167 = f.greaterThanOrEqualTo(f.getListLength(f.getSubEntityList(wireEntity)), 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck167)

  // getTargetAttachmentPointLocation / get_target_attachment_point_location / genericId=200047 / literal=1, wire=1
  const result169 = f.getTargetAttachmentPointLocation(wireEntity, 'literal-168')
  const pinCheck170 = f.equal(result169, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck170)

  // getTargetAttachmentPointRotation / get_target_attachment_point_rotation / genericId=200048 / literal=1, wire=1
  const result171 = f.getTargetAttachmentPointRotation(self, wireStr)
  const pinCheck172 = f.equal(result171, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck172)

  // getTheAggroListOfTheSpecifiedEntity / get_the_aggro_list_of_the_specified_entity / genericId=200091 / literal=0, wire=1
  const pinCheck174 = f.greaterThanOrEqualTo(
    f.getListLength(f.getTheAggroListOfTheSpecifiedEntity(wireEntity)),
    0n
  )
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck174)

  // getTheAggroTargetOfTheSpecifiedEntity / get_the_aggro_target_of_the_specified_entity / genericId=200090 / literal=1, wire=0
  const result175 = f.getTheAggroTargetOfTheSpecifiedEntity(self)
  const pinCheck176 = f.equal(result175, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck176)

  // getTheComplexCreationSCurrentUsingSkill / get_the_complex_creation_s_current_using_skill / genericId=200213 / literal=0, wire=0
  const result177 = f.getTheComplexCreationSCurrentUsingSkill()
  const pinCheck178 = f.equal(result177, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck178)

  // getUnitAttackTarget / get_unit_attack_target / genericId=200035 / literal=1, wire=0
  const result179 = f.getUnitAttackTarget(self)
  const pinCheck180 = f.equal(result179, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck180)

  // getWhetherCursorIsActive / get_whether_cursor_is_active / genericId=200284 / literal=0, wire=0
  const result181 = f.getWhetherCursorIsActive()
  const pinCheck182 = f.equal(result181, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck182)

  // greaterThan / greater_than / genericId=200007 / literal=2, wire=0
  const result185 = f.greaterThan(183n, 184n)
  const pinCheck186 = f.equal(result185, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck186)

  // greaterThanOrEqualTo / greater_than_or_equal_to / genericId=200010 / literal=2, wire=0
  const result189 = f.greaterThanOrEqualTo(187n, 188n)
  const pinCheck190 = f.equal(result189, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck190)

  // lessThan / less_than / genericId=200008 / literal=0, wire=2
  const result194 = f.lessThan(wireInt, wireInt)
  const pinCheck195 = f.equal(result194, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck195)

  // lessThanOrEqualTo / less_than_or_equal_to / genericId=200009 / literal=0, wire=2
  const result196 = f.lessThanOrEqualTo(wireInt, wireInt)
  const pinCheck197 = f.equal(result196, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck197)

  // listIncludesThisValue / list_includes_this_value / genericId=200019 / literal=0, wire=2
  const result198 = f.listIncludesThisValue(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck199 = f.equal(result198, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck199)

  // logicalAndOperation / logical_and_operation / genericId=200001 / literal=0, wire=2
  const result200 = f.logicalAndOperation(wireBool, wireBool)
  const pinCheck201 = f.equal(result200, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck201)

  // logicalNotOperation / logical_not_operation / genericId=200003 / literal=1, wire=0
  const result203 = f.logicalNotOperation(false)
  const pinCheck204 = f.equal(result203, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck204)

  // logicalOrOperation / logical_or_operation / genericId=200002 / literal=0, wire=2
  const result205 = f.logicalOrOperation(wireBool, wireBool)
  const pinCheck206 = f.equal(result205, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck206)

  // logicalXorOperation / logical_xor_operation / genericId=200004 / literal=0, wire=2
  const result207 = f.logicalXorOperation(wireBool, wireBool)
  const pinCheck208 = f.equal(result207, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck208)

  // multiplication / multiplication / genericId=200013 / literal=0, wire=2
  const result209 = f.multiplication(wireInt, wireInt)
  const pinCheck210 = f.equal(result209, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck210)

  // orientationToRotation / orientation_to_rotation / genericId=200074 / literal=0, wire=1
  const result215 = f.orientationToRotation(wireVec3)
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

  // queryDictionaryValueByKey / query_dictionary_value_by_key / genericId=200154 / literal=0, wire=2
  const result223 = f.queryDictionaryValueByKey(
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
  const pinCheck224 = f.equal(result223, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck224)

  // queryEntityByGuid / query_entity_by_guid / genericId=200023 / literal=1, wire=0
  const result226 = f.queryEntityByGuid(guid(225n))
  const pinCheck227 = f.equal(result226, wireEntity)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck227)

  // queryEntityFaction / query_entity_faction / genericId=200029 / literal=0, wire=1
  const result228 = f.queryEntityFaction(wireEntity)
  const pinCheck229 = f.equal(result228, faction(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck229)

  // queryGuidByEntity / query_guid_by_entity / genericId=200027 / literal=1, wire=0
  const result230 = f.queryGuidByEntity(self)
  const pinCheck231 = f.equal(result230, guid(0n))
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck231)

  // queryIfDictionaryContainsSpecificKey / query_if_dictionary_contains_specific_key / genericId=200155 / literal=0, wire=2
  const result232 = f.queryIfDictionaryContainsSpecificKey(
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
  const pinCheck233 = f.equal(result232, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck233)

  // queryIfDictionaryContainsSpecificValue / query_if_dictionary_contains_specific_value / genericId=200156 / literal=0, wire=2
  const result234 = f.queryIfDictionaryContainsSpecificValue(
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
  const pinCheck235 = f.equal(result234, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck235)

  // queryIfEntityIsOnTheField / query_if_entity_is_on_the_field / genericId=200103 / literal=1, wire=0
  const result236 = f.queryIfEntityIsOnTheField(self)
  const pinCheck237 = f.equal(result236, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck237)

  // queryIfFactionIsHostile / query_if_faction_is_hostile / genericId=200093 / literal=2, wire=0
  const result240 = f.queryIfFactionIsHostile(faction(238n), faction(239n))
  const pinCheck241 = f.equal(result240, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck241)

  // queryIfSpecifiedEntityIsInCombat / query_if_specified_entity_is_in_combat / genericId=200092 / literal=0, wire=1
  const result242 = f.queryIfSpecifiedEntityIsInCombat(wireEntity)
  const pinCheck243 = f.equal(result242, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck243)

  // querySkillVariableValue / query_skill_variable_value / genericId=200259 / literal=1, wire=0
  const result245 = f.querySkillVariableValue(configId(244n))
  const pinCheck246 = f.equal(result245, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck246)

  // radiansToDegrees / radians_to_degrees / genericId=200101 / literal=0, wire=1
  const result247 = f.radiansToDegrees(wireFloat)
  const pinCheck248 = f.equal(result247, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck248)

  // screenCoordinatesToViewportCoordinates / screen_coordinates_to_viewport_coordinates / genericId=200290 / literal=0, wire=2
  const result252 = f.screenCoordinatesToViewportCoordinates(wireFloat, wireFloat)
  const pinCheck253 = f.equal(result252.viewportX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck253)
  const pinCheck254 = f.equal(result252.viewportY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck254)

  // screenCoordinatesToWorldCoordinates / screen_coordinates_to_world_coordinates / genericId=200292 / literal=1, wire=2
  const result256 = f.screenCoordinatesToWorldCoordinates(wireFloat, wireFloat, 255.25)
  const pinCheck257 = f.equal(result256, [0, 0, 0])
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck257)

  // sineFunction / sine_function / genericId=200094 / literal=1, wire=0
  const result266 = f.sineFunction(265.25)
  const pinCheck267 = f.equal(result266, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck267)

  // split3dVector / split3d_vector / genericId=200065 / literal=0, wire=1
  const result269 = f.split3dVector(wireVec3)
  const pinCheck270 = f.equal(result269.xComponent, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck270)
  const pinCheck271 = f.equal(result269.yComponent, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck271)
  const pinCheck272 = f.equal(result269.zComponent, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck272)

  // subtraction / subtraction / genericId=200012 / literal=0, wire=2
  const result273 = f.subtraction(wireInt, wireInt)
  const pinCheck274 = f.equal(result273, 0n)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck274)

  // tangentFunction / tangent_function / genericId=200096 / literal=1, wire=0
  const result276 = f.tangentFunction(275.25)
  const pinCheck277 = f.equal(result276, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck277)

  // viewportCoordinatesToScreenCoordinates / viewport_coordinates_to_screen_coordinates / genericId=200291 / literal=0, wire=2
  const result450 = f.viewportCoordinatesToScreenCoordinates(wireFloat, wireFloat)
  const pinCheck451 = f.equal(result450.screenX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck451)
  const pinCheck452 = f.equal(result450.screenY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck452)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200243 / literal=1, wire=1
  const result453 = f.whetherTheEntityHasTheSpecifiedUnitStatus(self, wireConfig)
  const pinCheck454 = f.equal(result453, false)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck454)

  // worldCoordinatesToScreenCoordinates / world_coordinates_to_screen_coordinates / genericId=200293 / literal=1, wire=0
  const result456 = f.worldCoordinatesToScreenCoordinates([455, 456, 457])
  const pinCheck457 = f.equal(result456.screenX, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck457)
  const pinCheck458 = f.equal(result456.screenY, 0)
  f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', pinCheck458)

  // addUnitStatus / add_unit_status / genericId=200057 / literal=2, wire=1
  f.addUnitStatus(self, wireInt, configId(37n))

  // breakLoop is emitted by finiteLoop/traverseEntityList callbacks below.

  // clearTheAggroListOfTheSpecifiedEntity / clear_the_aggro_list_of_the_specified_entity / genericId=200087 / literal=0, wire=1
  f.clearTheAggroListOfTheSpecifiedEntity(wireEntity)

  // complexCreationDirectedMovement / complex_creation_directed_movement / genericId=200248 / literal=2, wire=2
  f.complexCreationDirectedMovement([53, 54, 55], 54.25, wireFloat, wireBool)

  // complexCreationTeleport / complex_creation_teleport / genericId=200247 / literal=2, wire=0
  f.complexCreationTeleport([55, 56, 57], [56, 57, 58])

  // creationTurnsToFaceSetDirection / creation_turns_to_face_set_direction / genericId=200245 / literal=1, wire=0
  f.creationTurnsToFaceSetDirection([64, 65, 66])

  // doubleBranch / double_branch / genericId=200056 / literal=1, wire=0
  f.doubleBranch(
    false,
    () => {},
    () => {}
  )

  // finiteLoop / finite_loop / genericId=200079 / literal=2, wire=0
  f.finiteLoop(93n, 94n, (loopValue, breakLoop) => {
    f.sendSignalToServerNodeGraph('gsts_all_client_pin_anchor', f.equal(loopValue, 0n))
    breakLoop()
  })

  // fixedPointProjectileLaunch / fixed_point_projectile_launch / genericId=200052 / literal=3, wire=2
  f.fixedPointProjectileLaunch(prefabId(95n), [96, 97, 98], [97, 98, 99], wireEntity, wireFaction)

  // increaseSkillVariableValue / increase_skill_variable_value / genericId=200258 / literal=2, wire=0
  f.increaseSkillVariableValue(configId(191n), 192.25)

  // increaseTheAggroValueOfTheSpecifiedEntity / increase_the_aggro_value_of_the_specified_entity / genericId=200084 / literal=2, wire=1
  f.increaseTheAggroValueOfTheSpecifiedEntity(wireEntity, self, 193n)

  // notifyServerNodeGraph / notify_server_node_graph / genericId=200039 / literal=3, wire=0
  f.notifyServerNodeGraph('literal-211', 'literal-212', 'literal-213')

  // playTimedEffects / play_timed_effects / genericId=200038 / literal=3, wire=2
  f.playTimedEffects(configId(217n), wireVec3, [219, 220, 221], 220.25, wireBool)

  // recoverCreationSHp / recover_creation_s_hp / genericId=200249 / literal=3, wire=0
  f.recoverCreationSHp(self, 249.25, false)

  // removeSpecifiedCharacterDisruptorDevice / remove_specified_character_disruptor_device / genericId=200060 / literal=1, wire=0
  f.removeSpecifiedCharacterDisruptorDevice(E.DisruptorDeviceType.ForceFieldDevice)

  // removeTargetEntityFromAggroList / remove_target_entity_from_aggro_list / genericId=200088 / literal=1, wire=1
  f.removeTargetEntityFromAggroList(self, wireEntity)

  // removeUnitStatus / remove_unit_status / genericId=200058 / literal=1, wire=1
  f.removeUnitStatus(wireEntity, configId(251n))

  // resetsTheCreationSSkillCd / resets_the_creation_s_skill_cd / genericId=200215 / literal=0, wire=1
  f.resetsTheCreationSSkillCd(wireInt)

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
  f.setLocalVariable('literal-258', wireInt)

  // setSkillVariable / set_skill_variable / genericId=200257 / literal=1, wire=1
  f.setSkillVariable(configId(259n), wireFloat)

  // setTheAggroValueOfSpecifiedEntity / set_the_aggro_value_of_specified_entity / genericId=200083 / literal=1, wire=2
  f.setTheAggroValueOfSpecifiedEntity(self, wireEntity, wireInt)

  // setTheAggroValueOfTheSpecifiedEntityProportionally / set_the_aggro_value_of_the_specified_entity_proportionally / genericId=200085 / literal=1, wire=2
  f.setTheAggroValueOfTheSpecifiedEntityProportionally(wireEntity, self, wireFloat)

  // setTheCdOfTheCreationSkill / set_the_cd_of_the_creation_skill / genericId=200217 / literal=1, wire=2
  f.setTheCdOfTheCreationSkill(260n, wireFloat, wireFloat)

  // setTheCurrentCdOfTheCreationSkill / set_the_current_cd_of_the_creation_skill / genericId=200216 / literal=1, wire=1
  f.setTheCurrentCdOfTheCreationSkill(wireInt, 261.25)

  // setTheCurrentTimeOfTheCreationCooldownGroup / set_the_current_time_of_the_creation_cooldown_group / genericId=200218 / literal=0, wire=2
  f.setTheCurrentTimeOfTheCreationCooldownGroup(wireInt, wireFloat)

  // setTheGlobalCdOfTheCreation / set_the_global_cd_of_the_creation / genericId=200220 / literal=0, wire=1
  f.setTheGlobalCdOfTheCreation(wireFloat)

  // setTheTimeOfTheCreationCooldownGroup / set_the_time_of_the_creation_cooldown_group / genericId=200219 / literal=3, wire=0
  f.setTheTimeOfTheCreationCooldownGroup(262n, 263.25, 264.25)

  // tauntTarget / taunt_target / genericId=200089 / literal=1, wire=1
  f.tauntTarget(wireEntity, self)

  // transferTheAggroValueOfTheSpecifiedEntityProportionally / transfer_the_aggro_value_of_the_specified_entity_proportionally / genericId=200086 / literal=2, wire=2
  f.transferTheAggroValueOfTheSpecifiedEntityProportionally(wireEntity, self, self, wireFloat)

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

  // triggerHitboxAtSpecificLocation / trigger_hitbox_at_specific_location / genericId=200051 / literal=35, wire=3
  f.triggerHitboxAtSpecificLocation(
    E.TargetType.None,
    [278, 279, 280],
    wireVec3,
    wireFloat,
    280.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    281n,
    E.AttackShape.Rectangle,
    [282, 283, 284],
    283.25,
    284.25,
    285.25,
    286.25,
    287.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    288.25,
    E.HitType.None,
    E.AttackType.None,
    289.25,
    false,
    291n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [293, 294, 295],
    [294, 295, 296],
    295.25,
    [296, 297, 298],
    [297, 298, 299],
    298.25,
    299.25,
    wireInt,
    CE.HitLevel.NoEffect,
    300.25,
    301.25
  )

  // triggerHitboxAtSpecifiedAttachmentPoint / trigger_hitbox_at_specified_attachment_point / genericId=200059 / literal=36, wire=3
  f.triggerHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-302',
    [303, 304, 305],
    [304, 305, 306],
    305.25,
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
    306n,
    E.AttackShape.Rectangle,
    [307, 308, 309],
    308.25,
    309.25,
    310.25,
    311.25,
    312.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    313.25,
    E.HitType.None,
    E.AttackType.None,
    314.25,
    true,
    316n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [318, 319, 320],
    [319, 320, 321],
    320.25,
    [321, 322, 323],
    [322, 323, 324],
    323.25,
    wireFloat,
    324n,
    CE.HitLevel.NoEffect,
    325.25,
    326.25
  )

  // triggerRectangularHitboxAtSpecificLocation / trigger_rectangular_hitbox_at_specific_location / genericId=200112 / literal=28, wire=3
  f.triggerRectangularHitboxAtSpecificLocation(
    E.TargetType.None,
    [327, 328, 329],
    wireVec3,
    wireFloat,
    329.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    330n,
    [331, 332, 333],
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    332.25,
    E.HitType.None,
    E.AttackType.None,
    333.25,
    false,
    335n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [337, 338, 339],
    [338, 339, 340],
    339.25,
    [340, 341, 342],
    [341, 342, 343],
    342.25,
    343.25,
    wireInt,
    CE.HitLevel.NoEffect,
    344.25,
    345.25
  )

  // triggerRectangularHitboxAtSpecifiedAttachmentPoint / trigger_rectangular_hitbox_at_specified_attachment_point / genericId=200115 / literal=29, wire=3
  f.triggerRectangularHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-346',
    [347, 348, 349],
    [348, 349, 350],
    349.25,
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
    350n,
    [351, 352, 353],
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    352.25,
    E.HitType.None,
    E.AttackType.None,
    353.25,
    false,
    355n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [357, 358, 359],
    [358, 359, 360],
    359.25,
    [360, 361, 362],
    [361, 362, 363],
    362.25,
    wireFloat,
    363n,
    CE.HitLevel.NoEffect,
    364.25,
    365.25
  )

  // triggerSectorHitboxAtSpecificLocation / trigger_sector_hitbox_at_specific_location / genericId=200113 / literal=32, wire=3
  f.triggerSectorHitboxAtSpecificLocation(
    E.TargetType.None,
    [366, 367, 368],
    wireVec3,
    wireFloat,
    368.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    369n,
    370.25,
    371.25,
    372.25,
    373.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    374.25,
    E.HitType.None,
    E.AttackType.None,
    375.25,
    false,
    377n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [379, 380, 381],
    [380, 381, 382],
    381.25,
    [382, 383, 384],
    [383, 384, 385],
    384.25,
    wireFloat,
    385n,
    CE.HitLevel.NoEffect,
    386.25,
    387.25
  )

  // triggerSectorHitboxAtSpecifiedAttachmentPoint / trigger_sector_hitbox_at_specified_attachment_point / genericId=200116 / literal=33, wire=3
  f.triggerSectorHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-388',
    [389, 390, 391],
    [390, 391, 392],
    391.25,
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
    392n,
    393.25,
    394.25,
    395.25,
    396.25,
    CE.SectorDetectionDirection.FromInsideOut,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    397.25,
    E.HitType.None,
    E.AttackType.None,
    398.25,
    true,
    400n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    true,
    [402, 403, 404],
    [403, 404, 405],
    404.25,
    [405, 406, 407],
    [406, 407, 408],
    407.25,
    408.25,
    wireInt,
    CE.HitLevel.NoEffect,
    409.25,
    410.25
  )

  // triggerSphericalHitboxAtSpecificLocation / trigger_spherical_hitbox_at_specific_location / genericId=200111 / literal=27, wire=4
  f.triggerSphericalHitboxAtSpecificLocation(
    E.TargetType.None,
    wireVec3,
    [412, 413, 414],
    413.25,
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
    414n,
    415.25,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    416.25,
    E.HitType.None,
    E.AttackType.None,
    417.25,
    false,
    419n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [421, 422, 423],
    [422, 423, 424],
    423.25,
    [424, 425, 426],
    [425, 426, 427],
    426.25,
    wireFloat,
    427n,
    CE.HitLevel.NoEffect,
    428.25,
    429.25
  )

  // triggerSphericalHitboxAtSpecifiedAttachmentPoint / trigger_spherical_hitbox_at_specified_attachment_point / genericId=200114 / literal=28, wire=4
  f.triggerSphericalHitboxAtSpecifiedAttachmentPoint(
    E.TargetType.None,
    'literal-430',
    wireVec3,
    wireVec3,
    wireFloat,
    433.25,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    E.TriggerRestriction.TriggerOnlyOnce,
    434n,
    435.25,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    list(0),
    E.ElementalType.None,
    436.25,
    E.HitType.None,
    E.AttackType.None,
    437.25,
    false,
    439n,
    CE.KnockbackDirectionType.LineConnectingAttackerAndHitPoint,
    false,
    [441, 442, 443],
    [442, 443, 444],
    443.25,
    [444, 445, 446],
    [445, 446, 447],
    446.25,
    447.25,
    wireInt,
    CE.HitLevel.NoEffect,
    448.25,
    449.25
  )
})

g.creationStatus({
  id: 1082130438,
  name: 'AllClientNodesCreationStatusBeyond',
  prefix: true,
  mode: 'beyond'
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
  const pinCheck337 = f.equal(wireStr, '')
  f.executeSkill(pinCheck337, 1n)
  const pinCheck338 = f.equal(wireGuid, guid(0n))
  f.executeSkill(pinCheck338, 1n)
  const pinCheck339 = f.equal(wireConfig, configId(0n))
  f.executeSkill(pinCheck339, 1n)
  const pinCheck340 = f.equal(wirePrefab, prefabId(0n))
  f.executeSkill(pinCheck340, 1n)

  // _3dVectorAddition / _3d_vector_addition / genericId=200200 / literal=2, wire=0
  const result3 = f._3dVectorAddition([1, 2, 3], [2, 3, 4])
  const pinCheck4 = f.equal(result3, [0, 0, 0])
  f.executeSkill(pinCheck4, 1n)

  // _3dVectorAngle / _3d_vector_angle / genericId=200196 / literal=0, wire=2
  const result7 = f._3dVectorAngle(wireVec3, wireVec3)
  const pinCheck8 = f.equal(result7, 0)
  f.executeSkill(pinCheck8, 1n)

  // _3dVectorCrossProduct / _3d_vector_cross_product / genericId=200193 / literal=0, wire=2
  const result11 = f._3dVectorCrossProduct(wireVec3, wireVec3)
  const pinCheck12 = f.equal(result11, [0, 0, 0])
  f.executeSkill(pinCheck12, 1n)

  // _3dVectorDotProduct / _3d_vector_dot_product / genericId=200192 / literal=2, wire=0
  const result15 = f._3dVectorDotProduct([13, 14, 15], [14, 15, 16])
  const pinCheck16 = f.equal(result15, 0)
  f.executeSkill(pinCheck16, 1n)

  // _3dVectorModuloOperation / _3d_vector_modulo_operation / genericId=200198 / literal=1, wire=0
  const result18 = f._3dVectorModuloOperation([17, 18, 19])
  const pinCheck19 = f.equal(result18, 0)
  f.executeSkill(pinCheck19, 1n)

  // _3dVectorNormalization / _3d_vector_normalization / genericId=200210 / literal=1, wire=0
  const result21 = f._3dVectorNormalization([20, 21, 22])
  const pinCheck22 = f.equal(result21, [0, 0, 0])
  f.executeSkill(pinCheck22, 1n)

  // _3dVectorRotation / _3d_vector_rotation / genericId=200197 / literal=1, wire=1
  const result25 = f._3dVectorRotation(wireVec3, [24, 25, 26])
  const pinCheck26 = f.equal(result25, [0, 0, 0])
  f.executeSkill(pinCheck26, 1n)

  // _3dVectorSubtraction / _3d_vector_subtraction / genericId=200201 / literal=2, wire=0
  const result29 = f._3dVectorSubtraction([27, 28, 29], [28, 29, 30])
  const pinCheck30 = f.equal(result29, [0, 0, 0])
  f.executeSkill(pinCheck30, 1n)

  // _3dVectorZoom / _3d_vector_zoom / genericId=200195 / literal=0, wire=2
  const result32 = f._3dVectorZoom(wireFloat, wireVec3)
  const pinCheck33 = f.equal(result32, [0, 0, 0])
  f.executeSkill(pinCheck33, 1n)

  // absoluteValueOperation / absolute_value_operation / genericId=200188 / literal=1, wire=0
  const result35 = f.absoluteValueOperation(34n)
  const pinCheck36 = f.equal(result35, 0n)
  f.executeSkill(pinCheck36, 1n)

  // addition / addition / genericId=200184 / literal=2, wire=0
  const result39 = f.addition(37n, 38n)
  const pinCheck40 = f.equal(result39, 0n)
  f.executeSkill(pinCheck40, 1n)

  // arccosineFunction / arccosine_function / genericId=200208 / literal=1, wire=0
  const result42 = f.arccosineFunction(41.25)
  const pinCheck43 = f.equal(result42, 0)
  f.executeSkill(pinCheck43, 1n)

  // arcsineFunction / arcsine_function / genericId=200207 / literal=1, wire=0
  const result45 = f.arcsineFunction(44.25)
  const pinCheck46 = f.equal(result45, 0)
  f.executeSkill(pinCheck46, 1n)

  // arctangentFunction / arctangent_function / genericId=200209 / literal=1, wire=0
  const result48 = f.arctangentFunction(47.25)
  const pinCheck49 = f.equal(result48, 0)
  f.executeSkill(pinCheck49, 1n)

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
  f.executeSkill(pinCheck53, 1n)

  // assemblyList / assembly_list / genericId=200191 / literal=2, wire=0
  const pinCheck56 = f.greaterThanOrEqualTo(
    f.getListLength(f.assemblyList([54n, 54n, 54n, 54n, 54n, 54n, 54n, 54n, 54n, 54n], 'int')),
    0n
  )
  f.executeSkill(pinCheck56, 1n)

  // checkIfSelfIsInTheTerritory / check_if_self_is_in_the_territory / genericId=200151 / literal=0, wire=0
  const result57 = f.checkIfSelfIsInTheTerritory()
  const pinCheck58 = f.equal(result57, false)
  f.executeSkill(pinCheck58, 1n)

  // checkTargetPositionPathfindingAvailability / check_target_position_pathfinding_availability / genericId=200148 / literal=0, wire=0
  const result59 = f.checkTargetPositionPathfindingAvailability()
  const pinCheck60 = f.equal(result59, false)
  f.executeSkill(pinCheck60, 1n)

  // checkTheCoordinatesWhenEnteringBattle / check_the_coordinates_when_entering_battle / genericId=200162 / literal=0, wire=0
  const result61 = f.checkTheCoordinatesWhenEnteringBattle()
  const pinCheck62 = f.equal(result61.enteringBattlePosition, [0, 0, 0])
  f.executeSkill(pinCheck62, 1n)
  const pinCheck63 = f.equal(result61.enteringBattleRotation, [0, 0, 0])
  f.executeSkill(pinCheck63, 1n)

  // checkTheDistanceFromSelfToTarget / check_the_distance_from_self_to_target / genericId=200147 / literal=0, wire=0
  const result64 = f.checkTheDistanceFromSelfToTarget()
  const pinCheck65 = f.equal(result64, 0)
  f.executeSkill(pinCheck65, 1n)

  // checkTheHorizontalAngleFromSelfToTarget / check_the_horizontal_angle_from_self_to_target / genericId=200143 / literal=0, wire=0
  const result66 = f.checkTheHorizontalAngleFromSelfToTarget()
  const pinCheck67 = f.equal(result66, 0)
  f.executeSkill(pinCheck67, 1n)

  // checkTheHorizontalDistanceFromSelfToTarget / check_the_horizontal_distance_from_self_to_target / genericId=200145 / literal=0, wire=0
  const result68 = f.checkTheHorizontalDistanceFromSelfToTarget()
  const pinCheck69 = f.equal(result68, 0)
  f.executeSkill(pinCheck69, 1n)

  // checkTheVerticalAngleFromSelfToTarget / check_the_vertical_angle_from_self_to_target / genericId=200144 / literal=0, wire=0
  const result70 = f.checkTheVerticalAngleFromSelfToTarget()
  const pinCheck71 = f.equal(result70, 0)
  f.executeSkill(pinCheck71, 1n)

  // checkTheVerticalDistanceFromSelfToTarget / check_the_vertical_distance_from_self_to_target / genericId=200146 / literal=0, wire=0
  const result72 = f.checkTheVerticalDistanceFromSelfToTarget()
  const pinCheck73 = f.equal(result72, 0)
  f.executeSkill(pinCheck73, 1n)

  // checkWhetherSelfIsInBattle / check_whether_self_is_in_battle / genericId=200150 / literal=0, wire=0
  const result74 = f.checkWhetherSelfIsInBattle()
  const pinCheck75 = f.equal(result74, false)
  f.executeSkill(pinCheck75, 1n)

  // checkWhetherSelfIsUsingASkill / check_whether_self_is_using_a_skill / genericId=200149 / literal=0, wire=0
  const result76 = f.checkWhetherSelfIsUsingASkill()
  const pinCheck77 = f.equal(result76.isTheUnitUsingASkill, false)
  f.executeSkill(pinCheck77, 1n)
  const pinCheck78 = f.equal(result76.skillID, 0n)
  f.executeSkill(pinCheck78, 1n)

  // cosineFunction / cosine_function / genericId=200205 / literal=0, wire=1
  const result79 = f.cosineFunction(wireFloat)
  const pinCheck80 = f.equal(result79, 0)
  f.executeSkill(pinCheck80, 1n)

  // create3dVector / create3d_vector / genericId=200199 / literal=3, wire=0
  const result84 = f.create3dVector(81.25, 82.25, 83.25)
  const pinCheck85 = f.equal(result84, [0, 0, 0])
  f.executeSkill(pinCheck85, 1n)

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
  f.executeSkill(pinCheck87, 1n)

  // dataTypeConversion / data_type_conversion / genericId=200189 / literal=1, wire=1
  const result88 = f.dataTypeConversion(wireInt, 'str')
  const pinCheck89 = f.equal(result88, '')
  f.executeSkill(pinCheck89, 1n)

  // degreesToRadians / degrees_to_radians / genericId=200212 / literal=1, wire=0
  const result91 = f.degreesToRadians(90.25)
  const pinCheck92 = f.equal(result91, 0)
  f.executeSkill(pinCheck92, 1n)

  // directionVectorToRotation / direction_vector_to_rotation / genericId=200202 / literal=1, wire=1
  const result95 = f.directionVectorToRotation([93, 94, 95], wireVec3)
  const pinCheck96 = f.equal(result95, [0, 0, 0])
  f.executeSkill(pinCheck96, 1n)

  // division / division / genericId=200187 / literal=0, wire=2
  const result97 = f.division(wireInt, wireInt)
  const pinCheck98 = f.equal(result97, 0n)
  f.executeSkill(pinCheck98, 1n)

  // enumerationMatch / enumeration_match / genericId=200178 / literal=2, wire=0
  const result99 = f.enumerationMatch(E.SortBy.Ascending, E.SortBy.Ascending)
  const pinCheck100 = f.equal(result99, false)
  f.executeSkill(pinCheck100, 1n)

  // equal / equal / genericId=200179 / literal=2, wire=0
  const result103 = f.equal(101n, 102n)
  const pinCheck104 = f.equal(result103, false)
  f.executeSkill(pinCheck104, 1n)

  // getCorrespondingValueFromList / get_corresponding_value_from_list / genericId=200222 / literal=1, wire=1
  const result108 = f.getCorrespondingValueFromList(
    107n,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck109 = f.equal(result108, 0n)
  f.executeSkill(pinCheck109, 1n)

  // getCurrentExecutionStatus / get_current_execution_status / genericId=200142 / literal=0, wire=0
  const result110 = f.getCurrentExecutionStatus()
  const pinCheck111 = f.equal(result110, configId(0n))
  f.executeSkill(pinCheck111, 1n)

  // getCustomVariable / get_custom_variable / genericId=200173 / literal=2, wire=0
  const result113 = f.getCustomVariable(CE.TargetEntity.AggroTarget, 'literal-112')
  const narrowed114 = result113.asType('int')
  const pinCheck115 = f.equal(narrowed114, 0n)
  f.executeSkill(pinCheck115, 1n)

  // getEntityLocation / get_entity_location / genericId=200169 / literal=1, wire=0
  const result116 = f.getEntityLocation(CE.TargetEntity.AggroTarget)
  const pinCheck117 = f.equal(result116, [0, 0, 0])
  f.executeSkill(pinCheck117, 1n)

  // getEntityRotation / get_entity_rotation / genericId=200170 / literal=1, wire=0
  const result118 = f.getEntityRotation(CE.TargetEntity.AggroTarget)
  const pinCheck119 = f.equal(result118, [0, 0, 0])
  f.executeSkill(pinCheck119, 1n)

  // getEntitySType / get_entity_s_type / genericId=200168 / literal=1, wire=0
  const result120 = f.getEntitySType(CE.TargetEntity.AggroTarget)
  const pinCheck121 = f.enumerationMatch(result120, E.EntityType.Stage)
  f.executeSkill(pinCheck121, 1n)

  // getEntityTypeList / get_entity_type_list / genericId=200312 / literal=1, wire=0
  const enumListProbe123 = f.getRayDetectionResult(
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
  const pinCheck124 = f.equal(enumListProbe123.onHitLocation, [0, 0, 0])
  f.executeSkill(pinCheck124, 1n)

  // getListLength / get_list_length / genericId=200223 / literal=0, wire=1
  const result125 = f.getListLength(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck126 = f.equal(result125, 0n)
  f.executeSkill(pinCheck126, 1n)

  // getListOfKeysFromDictionary / get_list_of_keys_from_dictionary / genericId=200235 / literal=0, wire=1
  const pinCheck128 = f.greaterThanOrEqualTo(
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
  f.executeSkill(pinCheck128, 1n)

  // getListOfValuesFromDictionary / get_list_of_values_from_dictionary / genericId=200234 / literal=0, wire=1
  const pinCheck130 = f.greaterThanOrEqualTo(
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
  f.executeSkill(pinCheck130, 1n)

  // getMaximumValueFromList / get_maximum_value_from_list / genericId=200225 / literal=0, wire=1
  const result131 = f.getMaximumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck132 = f.equal(result131, 0n)
  f.executeSkill(pinCheck132, 1n)

  // getMinimumValueFromList / get_minimum_value_from_list / genericId=200226 / literal=0, wire=1
  const result133 = f.getMinimumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck134 = f.equal(result133, 0n)
  f.executeSkill(pinCheck134, 1n)

  // getObjectPresetStatus / get_object_preset_status / genericId=200172 / literal=1, wire=1
  const result135 = f.getObjectPresetStatus(CE.TargetEntity.AggroTarget, wireInt)
  const pinCheck136 = f.equal(result135, 0n)
  f.executeSkill(pinCheck136, 1n)

  // getPreviousFrameExecutionStatus / get_previous_frame_execution_status / genericId=200250 / literal=0, wire=0
  const result137 = f.getPreviousFrameExecutionStatus()
  const pinCheck138 = f.equal(result137, configId(0n))
  f.executeSkill(pinCheck138, 1n)

  // getPreviousFrameExecutionTactic / get_previous_frame_execution_tactic / genericId=200252 / literal=0, wire=0
  const result139 = f.getPreviousFrameExecutionTactic()
  const pinCheck140 = f.enumerationMatch(result139.tacticType, CE.TacticType.None)
  f.executeSkill(pinCheck140, 1n)
  const pinCheck141 = f.equal(result139.tacticalContext, '')
  f.executeSkill(pinCheck141, 1n)
  const pinCheck142 = f.equal(result139.tacticDuration, 0)
  f.executeSkill(pinCheck142, 1n)

  // getRandomNumber / get_random_number / genericId=200190 / literal=0, wire=2
  const result143 = f.getRandomNumber(wireInt, wireInt)
  const pinCheck144 = f.equal(result143, 0n)
  f.executeSkill(pinCheck144, 1n)

  // getRayDetectionResult / get_ray_detection_result / genericId=200301 / literal=4, wire=3
  const result148 = f.getRayDetectionResult(
    CE.TargetEntity.AggroTarget,
    [145, 146, 147],
    wireVec3,
    147.25,
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
  const pinCheck149 = f.equal(result148.onHitLocation, [0, 0, 0])
  f.executeSkill(pinCheck149, 1n)
  const pinCheck150 = f.equal(result148.onHitEntity, false)
  f.executeSkill(pinCheck150, 1n)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200302 / literal=1, wire=0
  const enumListProbe152 = f.getRayDetectionResult(
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
  const pinCheck153 = f.equal(enumListProbe152.onHitLocation, [0, 0, 0])
  f.executeSkill(pinCheck153, 1n)

  // getSelfEntity / get_self_entity / genericId=200164 / literal=0, wire=0
  const result154 = f.getSelfEntity()
  const pinCheck155 = f.equal(result154, wireEntity)
  f.executeSkill(pinCheck155, 1n)

  // getSelfPresetStatusValue / get_self_preset_status_value / genericId=200241 / literal=1, wire=0
  const result157 = f.getSelfPresetStatusValue(156n)
  const pinCheck158 = f.equal(result157, 0n)
  f.executeSkill(pinCheck158, 1n)

  // getSpawnPointLocationInformation / get_spawn_point_location_information / genericId=200163 / literal=0, wire=0
  const result159 = f.getSpawnPointLocationInformation()
  const pinCheck160 = f.equal(result159.spawnPointCoordinates, [0, 0, 0])
  f.executeSkill(pinCheck160, 1n)
  const pinCheck161 = f.equal(result159.spawnPointRotation, [0, 0, 0])
  f.executeSkill(pinCheck161, 1n)

  // getStageEntity / get_stage_entity / genericId=200166 / literal=0, wire=0
  const result162 = f.getStageEntity()
  const pinCheck163 = f.equal(result162, wireEntity)
  f.executeSkill(pinCheck163, 1n)

  // getTargetAtk / get_target_atk / genericId=200240 / literal=1, wire=0
  const result164 = f.getTargetAtk(CE.TargetEntity.AggroTarget)
  const pinCheck165 = f.equal(result164.baseATK, 0)
  f.executeSkill(pinCheck165, 1n)
  const pinCheck166 = f.equal(result164.currentATK, 0)
  f.executeSkill(pinCheck166, 1n)

  // getTargetEntity / get_target_entity / genericId=200165 / literal=0, wire=0
  const result167 = f.getTargetEntity()
  const pinCheck168 = f.equal(result167, wireEntity)
  f.executeSkill(pinCheck168, 1n)

  // getTargetHp / get_target_hp / genericId=200238 / literal=1, wire=0
  const result169 = f.getTargetHp(CE.TargetEntity.AggroTarget)
  const pinCheck170 = f.equal(result169.baseHP, 0)
  f.executeSkill(pinCheck170, 1n)
  const pinCheck171 = f.equal(result169.maxHP, 0)
  f.executeSkill(pinCheck171, 1n)
  const pinCheck172 = f.equal(result169.currentHPPercentage, 0)
  f.executeSkill(pinCheck172, 1n)

  // getTargetLevel / get_target_level / genericId=200239 / literal=1, wire=0
  const result173 = f.getTargetLevel(CE.TargetEntity.AggroTarget)
  const pinCheck174 = f.equal(result173, 0n)
  f.executeSkill(pinCheck174, 1n)

  // greaterThan / greater_than / genericId=200180 / literal=0, wire=2
  const result175 = f.greaterThan(wireInt, wireInt)
  const pinCheck176 = f.equal(result175, false)
  f.executeSkill(pinCheck176, 1n)

  // greaterThanOrEqualTo / greater_than_or_equal_to / genericId=200183 / literal=0, wire=2
  const result177 = f.greaterThanOrEqualTo(wireInt, wireInt)
  const pinCheck178 = f.equal(result177, false)
  f.executeSkill(pinCheck178, 1n)

  // lessThan / less_than / genericId=200181 / literal=2, wire=0
  const result181 = f.lessThan(179n, 180n)
  const pinCheck182 = f.equal(result181, false)
  f.executeSkill(pinCheck182, 1n)

  // lessThanOrEqualTo / less_than_or_equal_to / genericId=200182 / literal=2, wire=0
  const result185 = f.lessThanOrEqualTo(183n, 184n)
  const pinCheck186 = f.equal(result185, false)
  f.executeSkill(pinCheck186, 1n)

  // listIncludesThisValue / list_includes_this_value / genericId=200224 / literal=1, wire=1
  const result188 = f.listIncludesThisValue(
    187n,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck189 = f.equal(result188, false)
  f.executeSkill(pinCheck189, 1n)

  // logicalAndOperation / logical_and_operation / genericId=200174 / literal=2, wire=0
  const result192 = f.logicalAndOperation(false, true)
  const pinCheck193 = f.equal(result192, false)
  f.executeSkill(pinCheck193, 1n)

  // logicalNotOperation / logical_not_operation / genericId=200176 / literal=0, wire=1
  const result194 = f.logicalNotOperation(wireBool)
  const pinCheck195 = f.equal(result194, false)
  f.executeSkill(pinCheck195, 1n)

  // logicalOrOperation / logical_or_operation / genericId=200175 / literal=2, wire=0
  const result198 = f.logicalOrOperation(false, true)
  const pinCheck199 = f.equal(result198, false)
  f.executeSkill(pinCheck199, 1n)

  // logicalXorOperation / logical_xor_operation / genericId=200177 / literal=2, wire=0
  const result202 = f.logicalXorOperation(false, true)
  const pinCheck203 = f.equal(result202, false)
  f.executeSkill(pinCheck203, 1n)

  // multiplication / multiplication / genericId=200186 / literal=2, wire=0
  const result207 = f.multiplication(205n, 206n)
  const pinCheck208 = f.equal(result207, 0n)
  f.executeSkill(pinCheck208, 1n)

  // orientationToRotation / orientation_to_rotation / genericId=200203 / literal=1, wire=0
  const result210 = f.orientationToRotation([209, 210, 211])
  const pinCheck211 = f.equal(result210, [0, 0, 0])
  f.executeSkill(pinCheck211, 1n)

  // queryDictionarySLength / query_dictionary_s_length / genericId=200233 / literal=0, wire=1
  const result212 = f.queryDictionarySLength(
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
  const pinCheck213 = f.equal(result212, 0n)
  f.executeSkill(pinCheck213, 1n)

  // queryDictionaryValueByKey / query_dictionary_value_by_key / genericId=200230 / literal=1, wire=1
  const result215 = f.queryDictionaryValueByKey(
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
    214n
  )
  const pinCheck216 = f.equal(result215, 0n)
  f.executeSkill(pinCheck216, 1n)

  // queryEntityFaction / query_entity_faction / genericId=200171 / literal=1, wire=0
  const result217 = f.queryEntityFaction(CE.TargetEntity.AggroTarget)
  const pinCheck218 = f.equal(result217, faction(0n))
  f.executeSkill(pinCheck218, 1n)

  // queryIfDictionaryContainsSpecificKey / query_if_dictionary_contains_specific_key / genericId=200231 / literal=1, wire=1
  const result220 = f.queryIfDictionaryContainsSpecificKey(
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
    219n
  )
  const pinCheck221 = f.equal(result220, false)
  f.executeSkill(pinCheck221, 1n)

  // queryIfDictionaryContainsSpecificValue / query_if_dictionary_contains_specific_value / genericId=200232 / literal=1, wire=1
  const result223 = f.queryIfDictionaryContainsSpecificValue(
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
    222n
  )
  const pinCheck224 = f.equal(result223, false)
  f.executeSkill(pinCheck224, 1n)

  // queryIfEntityIsOnTheField / query_if_entity_is_on_the_field / genericId=200167 / literal=1, wire=0
  const result225 = f.queryIfEntityIsOnTheField(CE.TargetEntity.AggroTarget)
  const pinCheck226 = f.equal(result225, false)
  f.executeSkill(pinCheck226, 1n)

  // queryIfFactionIsHostile / query_if_faction_is_hostile / genericId=200227 / literal=0, wire=2
  const result227 = f.queryIfFactionIsHostile(wireFaction, wireFaction)
  const pinCheck228 = f.equal(result227, false)
  f.executeSkill(pinCheck228, 1n)

  // radiansToDegrees / radians_to_degrees / genericId=200211 / literal=1, wire=0
  const result230 = f.radiansToDegrees(229.25)
  const pinCheck231 = f.equal(result230, 0)
  f.executeSkill(pinCheck231, 1n)

  // sineFunction / sine_function / genericId=200204 / literal=0, wire=1
  const result232 = f.sineFunction(wireFloat)
  const pinCheck233 = f.equal(result232, 0)
  f.executeSkill(pinCheck233, 1n)

  // split3dVector / split3d_vector / genericId=200194 / literal=1, wire=0
  const result235 = f.split3dVector([234, 235, 236])
  const pinCheck236 = f.equal(result235.xComponent, 0)
  f.executeSkill(pinCheck236, 1n)
  const pinCheck237 = f.equal(result235.yComponent, 0)
  f.executeSkill(pinCheck237, 1n)
  const pinCheck238 = f.equal(result235.zComponent, 0)
  f.executeSkill(pinCheck238, 1n)

  // subtraction / subtraction / genericId=200185 / literal=2, wire=0
  const result241 = f.subtraction(239n, 240n)
  const pinCheck242 = f.equal(result241, 0n)
  f.executeSkill(pinCheck242, 1n)

  // tangentFunction / tangent_function / genericId=200206 / literal=0, wire=1
  const result332 = f.tangentFunction(wireFloat)
  const pinCheck333 = f.equal(result332, 0)
  f.executeSkill(pinCheck333, 1n)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200307 / literal=1, wire=1
  const result335 = f.whetherTheEntityHasTheSpecifiedUnitStatus(wireEntity, configId(334n))
  const pinCheck336 = f.equal(result335, false)
  f.executeSkill(pinCheck336, 1n)

  // continueExecutingPreviousFrameBehavior / continue_executing_previous_frame_behavior / genericId=200253 / literal=0, wire=0
  f.doubleBranch(
    false,
    () => {
      f.continueExecutingPreviousFrameBehavior()
    },
    () => {}
  )

  // doubleBranch / double_branch / genericId=200125 / literal=0, wire=1
  f.doubleBranch(
    wireBool,
    () => {},
    () => {}
  )

  // executeSkill / execute_skill / genericId=200129 / literal=2, wire=0
  f.executeSkill(true, 106n)

  // multipleBranches / multiple_branches / genericId=200127 / literal=1, wire=0
  f.multipleBranches(204n, {
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

  // tacticAerialConfrontation / tactic_aerial_confrontation / genericId=200310 / literal=13, wire=15
  f.tacticAerialConfrontation(
    true,
    'literal-244',
    wireBool,
    245.25,
    246.25,
    247.25,
    wireFloat,
    wireFloat,
    248.25,
    wireFloat,
    wireBool,
    wireBool,
    249.25,
    wireFloat,
    250.25,
    wireFloat,
    wireFloat,
    wireFloat,
    wireFloat,
    251.25,
    252.25,
    wireFloat,
    253.25,
    wireFloat,
    wireFloat,
    CE.TacticSpeed.Walk,
    wireFloat,
    254.25
  )

  // tacticAerialEscape / tactic_aerial_escape / genericId=200309 / literal=12, wire=8
  f.tacticAerialEscape(
    wireBool,
    'literal-255',
    false,
    wireFloat,
    CE.TacticSpeed.Walk,
    257.25,
    258.25,
    259.25,
    260.25,
    wireFloat,
    261n,
    wireInt,
    wireFloat,
    262.25,
    wireFloat,
    wireFloat,
    true,
    264.25,
    265.25,
    wireBool
  )

  // tacticAerialIdling / tactic_aerial_idling / genericId=200311 / literal=6, wire=8
  f.tacticAerialIdling(
    wireBool,
    'literal-266',
    true,
    CE.TacticSpeed.Walk,
    wireFloat,
    wireFloat,
    wireFloat,
    268.25,
    wireFloat,
    wireFloat,
    wireFloat,
    269.25,
    wireFloat,
    270.25
  )

  // tacticAerialLanding / tactic_aerial_landing / genericId=200303 / literal=7, wire=3
  f.tacticAerialLanding(
    wireBool,
    'literal-271',
    false,
    wireFloat,
    273.25,
    274.25,
    CE.TacticSpeed.Walk,
    275.25,
    276.25,
    wireFloat
  )

  // tacticAerialPursuit / tactic_aerial_pursuit / genericId=200308 / literal=9, wire=6
  f.tacticAerialPursuit(
    true,
    'literal-278',
    wireBool,
    279.25,
    wireFloat,
    false,
    281.25,
    wireFloat,
    wireFloat,
    282.25,
    CE.TacticSpeed.Walk,
    283.25,
    284.25,
    wireFloat,
    wireFloat
  )

  // tacticExecutePatrol / tactic_execute_patrol / genericId=200141 / literal=3, wire=3
  f.tacticExecutePatrol(wireBool, 285n, false, wireBool, 'literal-287', wireBool)

  // tacticGroundConfrontation / tactic_ground_confrontation / genericId=200140 / literal=7, wire=9
  f.tacticGroundConfrontation(
    wireBool,
    wireFloat,
    wireFloat,
    wireFloat,
    wireFloat,
    288.25,
    wireBool,
    true,
    290.25,
    wireFloat,
    wireFloat,
    291.25,
    292.25,
    wireFloat,
    'literal-293',
    false
  )

  // tacticGroundEscape / tactic_ground_escape / genericId=200138 / literal=8, wire=5
  f.tacticGroundEscape(
    true,
    296.25,
    CE.TacticSpeed.Walk,
    297.25,
    298n,
    wireInt,
    wireFloat,
    299.25,
    wireFloat,
    wireFloat,
    wireBool,
    'literal-300',
    true
  )

  // tacticGroundIdleRoaming / tactic_ground_idle_roaming / genericId=200130 / literal=6, wire=3
  f.tacticGroundIdleRoaming(
    false,
    CE.TacticSpeed.Walk,
    303.25,
    304.25,
    wireFloat,
    305.25,
    wireFloat,
    'literal-306',
    wireBool
  )

  // tacticGroundPursuit / tactic_ground_pursuit / genericId=200131 / literal=5, wire=6
  f.tacticGroundPursuit(
    wireBool,
    307.25,
    wireFloat,
    308.25,
    CE.TacticSpeed.Walk,
    wireFloat,
    CE.TacticSpeed.Walk,
    wireFloat,
    wireFloat,
    'literal-309',
    wireBool
  )

  // tacticMoveToTheTargetEntity / tactic_move_to_the_target_entity / genericId=200135 / literal=4, wire=3
  f.tacticMoveToTheTargetEntity(
    wireBool,
    wireEntity,
    wireFloat,
    CE.TacticSpeed.Walk,
    310.25,
    'literal-311',
    false
  )

  // tacticMoveToTheTargetPosition / tactic_move_to_the_target_position / genericId=200134 / literal=4, wire=3
  f.tacticMoveToTheTargetPosition(
    wireBool,
    wireVec3,
    wireFloat,
    CE.TacticSpeed.Walk,
    314.25,
    'literal-315',
    false
  )

  // tacticReturnToSpawnPointAfterLeavingBattle / tactic_return_to_spawn_point_after_leaving_battle / genericId=200139 / literal=5, wire=3
  f.tacticReturnToSpawnPointAfterLeavingBattle(
    true,
    CE.TacticSpeed.Walk,
    wireBool,
    wireFloat,
    318.25,
    wireBool,
    'literal-319',
    false
  )

  // tacticRotateBySpecifiedAngle / tactic_rotate_by_specified_angle / genericId=200137 / literal=3, wire=3
  f.tacticRotateBySpecifiedAngle(wireBool, 321.25, wireFloat, false, 'literal-323', wireBool)

  // tacticRotateToTheSpecifiedDirection / tactic_rotate_to_the_specified_direction / genericId=200136 / literal=4, wire=3
  f.tacticRotateToTheSpecifiedDirection(
    false,
    wireVec3,
    326.25,
    wireBool,
    CE.RotationDirection.Default,
    'literal-327',
    wireBool
  )

  // tacticRotateToTheTargetEntity / tactic_rotate_to_the_target_entity / genericId=200246 / literal=2, wire=4
  f.tacticRotateToTheTargetEntity(wireBool, wireEntity, wireFloat, false, 'literal-329', wireBool)

  // tacticStandStill / tactic_stand_still / genericId=200133 / literal=2, wire=1
  f.tacticStandStill(false, 'literal-331', wireBool)
})

g.creationStatusDecision({
  id: 1082130439,
  name: 'AllClientNodesCreationStatusDecisionBeyond',
  prefix: true,
  mode: 'beyond'
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
  const pinCheck225 = f.equal(wireStr, '')
  f.switchToSelfExecutionStatus(pinCheck225, configId(1082130438), 1n)
  const pinCheck226 = f.equal(wireGuid, guid(0n))
  f.switchToSelfExecutionStatus(pinCheck226, configId(1082130438), 1n)
  const pinCheck227 = f.equal(wireConfig, configId(0n))
  f.switchToSelfExecutionStatus(pinCheck227, configId(1082130438), 1n)
  const pinCheck228 = f.equal(wirePrefab, prefabId(0n))
  f.switchToSelfExecutionStatus(pinCheck228, configId(1082130438), 1n)

  // _3dVectorAddition / _3d_vector_addition / genericId=200200 / literal=0, wire=2
  const result3 = f._3dVectorAddition(wireVec3, wireVec3)
  const pinCheck4 = f.equal(result3, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck4, configId(1082130438), 1n)

  // _3dVectorAngle / _3d_vector_angle / genericId=200196 / literal=2, wire=0
  const result7 = f._3dVectorAngle([5, 6, 7], [6, 7, 8])
  const pinCheck8 = f.equal(result7, 0)
  f.switchToSelfExecutionStatus(pinCheck8, configId(1082130438), 1n)

  // _3dVectorCrossProduct / _3d_vector_cross_product / genericId=200193 / literal=2, wire=0
  const result11 = f._3dVectorCrossProduct([9, 10, 11], [10, 11, 12])
  const pinCheck12 = f.equal(result11, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck12, configId(1082130438), 1n)

  // _3dVectorDotProduct / _3d_vector_dot_product / genericId=200192 / literal=0, wire=2
  const result15 = f._3dVectorDotProduct(wireVec3, wireVec3)
  const pinCheck16 = f.equal(result15, 0)
  f.switchToSelfExecutionStatus(pinCheck16, configId(1082130438), 1n)

  // _3dVectorModuloOperation / _3d_vector_modulo_operation / genericId=200198 / literal=0, wire=1
  const result18 = f._3dVectorModuloOperation(wireVec3)
  const pinCheck19 = f.equal(result18, 0)
  f.switchToSelfExecutionStatus(pinCheck19, configId(1082130438), 1n)

  // _3dVectorNormalization / _3d_vector_normalization / genericId=200210 / literal=0, wire=1
  const result21 = f._3dVectorNormalization(wireVec3)
  const pinCheck22 = f.equal(result21, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck22, configId(1082130438), 1n)

  // _3dVectorRotation / _3d_vector_rotation / genericId=200197 / literal=1, wire=1
  const result25 = f._3dVectorRotation([23, 24, 25], wireVec3)
  const pinCheck26 = f.equal(result25, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck26, configId(1082130438), 1n)

  // _3dVectorSubtraction / _3d_vector_subtraction / genericId=200201 / literal=0, wire=2
  const result29 = f._3dVectorSubtraction(wireVec3, wireVec3)
  const pinCheck30 = f.equal(result29, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck30, configId(1082130438), 1n)

  // _3dVectorZoom / _3d_vector_zoom / genericId=200195 / literal=2, wire=0
  const result33 = f._3dVectorZoom(31.25, [32, 33, 34])
  const pinCheck34 = f.equal(result33, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck34, configId(1082130438), 1n)

  // absoluteValueOperation / absolute_value_operation / genericId=200188 / literal=0, wire=1
  const result35 = f.absoluteValueOperation(wireInt)
  const pinCheck36 = f.equal(result35, 0n)
  f.switchToSelfExecutionStatus(pinCheck36, configId(1082130438), 1n)

  // addition / addition / genericId=200184 / literal=0, wire=2
  const result37 = f.addition(wireInt, wireInt)
  const pinCheck38 = f.equal(result37, 0n)
  f.switchToSelfExecutionStatus(pinCheck38, configId(1082130438), 1n)

  // arccosineFunction / arccosine_function / genericId=200208 / literal=0, wire=1
  const result39 = f.arccosineFunction(wireFloat)
  const pinCheck40 = f.equal(result39, 0)
  f.switchToSelfExecutionStatus(pinCheck40, configId(1082130438), 1n)

  // arcsineFunction / arcsine_function / genericId=200207 / literal=0, wire=1
  const result41 = f.arcsineFunction(wireFloat)
  const pinCheck42 = f.equal(result41, 0)
  f.switchToSelfExecutionStatus(pinCheck42, configId(1082130438), 1n)

  // arctangentFunction / arctangent_function / genericId=200209 / literal=0, wire=1
  const result43 = f.arctangentFunction(wireFloat)
  const pinCheck44 = f.equal(result43, 0)
  f.switchToSelfExecutionStatus(pinCheck44, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck46, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck48, configId(1082130438), 1n)

  // checkIfSelfIsInTheTerritory / check_if_self_is_in_the_territory / genericId=200151 / literal=0, wire=0
  const result49 = f.checkIfSelfIsInTheTerritory()
  const pinCheck50 = f.equal(result49, false)
  f.switchToSelfExecutionStatus(pinCheck50, configId(1082130438), 1n)

  // checkTargetPositionPathfindingAvailability / check_target_position_pathfinding_availability / genericId=200148 / literal=0, wire=0
  const result51 = f.checkTargetPositionPathfindingAvailability()
  const pinCheck52 = f.equal(result51, false)
  f.switchToSelfExecutionStatus(pinCheck52, configId(1082130438), 1n)

  // checkTheCoordinatesWhenEnteringBattle / check_the_coordinates_when_entering_battle / genericId=200162 / literal=0, wire=0
  const result53 = f.checkTheCoordinatesWhenEnteringBattle()
  const pinCheck54 = f.equal(result53.enteringBattlePosition, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck54, configId(1082130438), 1n)
  const pinCheck55 = f.equal(result53.enteringBattleRotation, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck55, configId(1082130438), 1n)

  // checkTheDistanceFromSelfToTarget / check_the_distance_from_self_to_target / genericId=200147 / literal=0, wire=0
  const result56 = f.checkTheDistanceFromSelfToTarget()
  const pinCheck57 = f.equal(result56, 0)
  f.switchToSelfExecutionStatus(pinCheck57, configId(1082130438), 1n)

  // checkTheHorizontalAngleFromSelfToTarget / check_the_horizontal_angle_from_self_to_target / genericId=200143 / literal=0, wire=0
  const result58 = f.checkTheHorizontalAngleFromSelfToTarget()
  const pinCheck59 = f.equal(result58, 0)
  f.switchToSelfExecutionStatus(pinCheck59, configId(1082130438), 1n)

  // checkTheHorizontalDistanceFromSelfToTarget / check_the_horizontal_distance_from_self_to_target / genericId=200145 / literal=0, wire=0
  const result60 = f.checkTheHorizontalDistanceFromSelfToTarget()
  const pinCheck61 = f.equal(result60, 0)
  f.switchToSelfExecutionStatus(pinCheck61, configId(1082130438), 1n)

  // checkTheVerticalAngleFromSelfToTarget / check_the_vertical_angle_from_self_to_target / genericId=200144 / literal=0, wire=0
  const result62 = f.checkTheVerticalAngleFromSelfToTarget()
  const pinCheck63 = f.equal(result62, 0)
  f.switchToSelfExecutionStatus(pinCheck63, configId(1082130438), 1n)

  // checkTheVerticalDistanceFromSelfToTarget / check_the_vertical_distance_from_self_to_target / genericId=200146 / literal=0, wire=0
  const result64 = f.checkTheVerticalDistanceFromSelfToTarget()
  const pinCheck65 = f.equal(result64, 0)
  f.switchToSelfExecutionStatus(pinCheck65, configId(1082130438), 1n)

  // checkWhetherSelfIsInBattle / check_whether_self_is_in_battle / genericId=200150 / literal=0, wire=0
  const result66 = f.checkWhetherSelfIsInBattle()
  const pinCheck67 = f.equal(result66, false)
  f.switchToSelfExecutionStatus(pinCheck67, configId(1082130438), 1n)

  // checkWhetherSelfIsUsingASkill / check_whether_self_is_using_a_skill / genericId=200149 / literal=0, wire=0
  const result68 = f.checkWhetherSelfIsUsingASkill()
  const pinCheck69 = f.equal(result68.isTheUnitUsingASkill, false)
  f.switchToSelfExecutionStatus(pinCheck69, configId(1082130438), 1n)
  const pinCheck70 = f.equal(result68.skillID, 0n)
  f.switchToSelfExecutionStatus(pinCheck70, configId(1082130438), 1n)

  // cosineFunction / cosine_function / genericId=200205 / literal=1, wire=0
  const result72 = f.cosineFunction(71.25)
  const pinCheck73 = f.equal(result72, 0)
  f.switchToSelfExecutionStatus(pinCheck73, configId(1082130438), 1n)

  // create3dVector / create3d_vector / genericId=200199 / literal=0, wire=3
  const result74 = f.create3dVector(wireFloat, wireFloat, wireFloat)
  const pinCheck75 = f.equal(result74, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck75, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck77, configId(1082130438), 1n)

  // dataTypeConversion / data_type_conversion / genericId=200189 / literal=2, wire=0
  const result79 = f.dataTypeConversion(78n, 'str')
  const pinCheck80 = f.equal(result79, '')
  f.switchToSelfExecutionStatus(pinCheck80, configId(1082130438), 1n)

  // degreesToRadians / degrees_to_radians / genericId=200212 / literal=0, wire=1
  const result81 = f.degreesToRadians(wireFloat)
  const pinCheck82 = f.equal(result81, 0)
  f.switchToSelfExecutionStatus(pinCheck82, configId(1082130438), 1n)

  // directionVectorToRotation / direction_vector_to_rotation / genericId=200202 / literal=1, wire=1
  const result85 = f.directionVectorToRotation(wireVec3, [84, 85, 86])
  const pinCheck86 = f.equal(result85, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck86, configId(1082130438), 1n)

  // division / division / genericId=200187 / literal=2, wire=0
  const result89 = f.division(87n, 88n)
  const pinCheck90 = f.equal(result89, 0n)
  f.switchToSelfExecutionStatus(pinCheck90, configId(1082130438), 1n)

  // enumerationMatch / enumeration_match / genericId=200178 / literal=2, wire=0
  const result92 = f.enumerationMatch(E.SortBy.Ascending, E.SortBy.Ascending)
  const pinCheck93 = f.equal(result92, false)
  f.switchToSelfExecutionStatus(pinCheck93, configId(1082130438), 1n)

  // equal / equal / genericId=200179 / literal=0, wire=2
  const result94 = f.equal(wireInt, wireInt)
  const pinCheck95 = f.equal(result94, false)
  f.switchToSelfExecutionStatus(pinCheck95, configId(1082130438), 1n)

  // getCorrespondingValueFromList / get_corresponding_value_from_list / genericId=200222 / literal=0, wire=2
  const result96 = f.getCorrespondingValueFromList(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck97 = f.equal(result96, 0n)
  f.switchToSelfExecutionStatus(pinCheck97, configId(1082130438), 1n)

  // getCurrentExecutionStatus / get_current_execution_status / genericId=200142 / literal=0, wire=0
  const result98 = f.getCurrentExecutionStatus()
  const pinCheck99 = f.equal(result98, configId(0n))
  f.switchToSelfExecutionStatus(pinCheck99, configId(1082130438), 1n)

  // getCustomVariable / get_custom_variable / genericId=200173 / literal=1, wire=1
  const result100 = f.getCustomVariable(CE.TargetEntity.AggroTarget, wireStr)
  const narrowed101 = result100.asType('int')
  const pinCheck102 = f.equal(narrowed101, 0n)
  f.switchToSelfExecutionStatus(pinCheck102, configId(1082130438), 1n)

  // getEntityLocation / get_entity_location / genericId=200169 / literal=1, wire=0
  const result103 = f.getEntityLocation(CE.TargetEntity.AggroTarget)
  const pinCheck104 = f.equal(result103, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck104, configId(1082130438), 1n)

  // getEntityRotation / get_entity_rotation / genericId=200170 / literal=1, wire=0
  const result105 = f.getEntityRotation(CE.TargetEntity.AggroTarget)
  const pinCheck106 = f.equal(result105, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck106, configId(1082130438), 1n)

  // getEntitySType / get_entity_s_type / genericId=200168 / literal=1, wire=0
  const result107 = f.getEntitySType(CE.TargetEntity.AggroTarget)
  const pinCheck108 = f.enumerationMatch(result107, E.EntityType.Stage)
  f.switchToSelfExecutionStatus(pinCheck108, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck111, configId(1082130438), 1n)

  // getListLength / get_list_length / genericId=200223 / literal=0, wire=1
  const result112 = f.getListLength(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck113 = f.equal(result112, 0n)
  f.switchToSelfExecutionStatus(pinCheck113, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck115, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck117, configId(1082130438), 1n)

  // getMaximumValueFromList / get_maximum_value_from_list / genericId=200225 / literal=0, wire=1
  const result118 = f.getMaximumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck119 = f.equal(result118, 0n)
  f.switchToSelfExecutionStatus(pinCheck119, configId(1082130438), 1n)

  // getMinimumValueFromList / get_minimum_value_from_list / genericId=200226 / literal=0, wire=1
  const result120 = f.getMinimumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck121 = f.equal(result120, 0n)
  f.switchToSelfExecutionStatus(pinCheck121, configId(1082130438), 1n)

  // getObjectPresetStatus / get_object_preset_status / genericId=200172 / literal=2, wire=0
  const result123 = f.getObjectPresetStatus(CE.TargetEntity.AggroTarget, 122n)
  const pinCheck124 = f.equal(result123, 0n)
  f.switchToSelfExecutionStatus(pinCheck124, configId(1082130438), 1n)

  // getPreviousFrameExecutionStatus / get_previous_frame_execution_status / genericId=200250 / literal=0, wire=0
  const result125 = f.getPreviousFrameExecutionStatus()
  const pinCheck126 = f.equal(result125, configId(0n))
  f.switchToSelfExecutionStatus(pinCheck126, configId(1082130438), 1n)

  // getPreviousFrameExecutionTactic / get_previous_frame_execution_tactic / genericId=200252 / literal=0, wire=0
  const result127 = f.getPreviousFrameExecutionTactic()
  const pinCheck128 = f.enumerationMatch(result127.tacticType, CE.TacticType.None)
  f.switchToSelfExecutionStatus(pinCheck128, configId(1082130438), 1n)
  const pinCheck129 = f.equal(result127.tacticalContext, '')
  f.switchToSelfExecutionStatus(pinCheck129, configId(1082130438), 1n)
  const pinCheck130 = f.equal(result127.tacticDuration, 0)
  f.switchToSelfExecutionStatus(pinCheck130, configId(1082130438), 1n)

  // getRandomNumber / get_random_number / genericId=200190 / literal=2, wire=0
  const result133 = f.getRandomNumber(131n, 132n)
  const pinCheck134 = f.equal(result133, 0n)
  f.switchToSelfExecutionStatus(pinCheck134, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck138, configId(1082130438), 1n)
  const pinCheck139 = f.equal(result137.onHitEntity, false)
  f.switchToSelfExecutionStatus(pinCheck139, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck142, configId(1082130438), 1n)

  // getSelfEntity / get_self_entity / genericId=200164 / literal=0, wire=0
  const result143 = f.getSelfEntity()
  const pinCheck144 = f.equal(result143, wireEntity)
  f.switchToSelfExecutionStatus(pinCheck144, configId(1082130438), 1n)

  // getSelfPresetStatusValue / get_self_preset_status_value / genericId=200241 / literal=0, wire=1
  const result145 = f.getSelfPresetStatusValue(wireInt)
  const pinCheck146 = f.equal(result145, 0n)
  f.switchToSelfExecutionStatus(pinCheck146, configId(1082130438), 1n)

  // getSpawnPointLocationInformation / get_spawn_point_location_information / genericId=200163 / literal=0, wire=0
  const result147 = f.getSpawnPointLocationInformation()
  const pinCheck148 = f.equal(result147.spawnPointCoordinates, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck148, configId(1082130438), 1n)
  const pinCheck149 = f.equal(result147.spawnPointRotation, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck149, configId(1082130438), 1n)

  // getStageEntity / get_stage_entity / genericId=200166 / literal=0, wire=0
  const result150 = f.getStageEntity()
  const pinCheck151 = f.equal(result150, wireEntity)
  f.switchToSelfExecutionStatus(pinCheck151, configId(1082130438), 1n)

  // getTargetAtk / get_target_atk / genericId=200240 / literal=1, wire=0
  const result152 = f.getTargetAtk(CE.TargetEntity.AggroTarget)
  const pinCheck153 = f.equal(result152.baseATK, 0)
  f.switchToSelfExecutionStatus(pinCheck153, configId(1082130438), 1n)
  const pinCheck154 = f.equal(result152.currentATK, 0)
  f.switchToSelfExecutionStatus(pinCheck154, configId(1082130438), 1n)

  // getTargetEntity / get_target_entity / genericId=200165 / literal=0, wire=0
  const result155 = f.getTargetEntity()
  const pinCheck156 = f.equal(result155, wireEntity)
  f.switchToSelfExecutionStatus(pinCheck156, configId(1082130438), 1n)

  // getTargetHp / get_target_hp / genericId=200238 / literal=1, wire=0
  const result157 = f.getTargetHp(CE.TargetEntity.AggroTarget)
  const pinCheck158 = f.equal(result157.baseHP, 0)
  f.switchToSelfExecutionStatus(pinCheck158, configId(1082130438), 1n)
  const pinCheck159 = f.equal(result157.maxHP, 0)
  f.switchToSelfExecutionStatus(pinCheck159, configId(1082130438), 1n)
  const pinCheck160 = f.equal(result157.currentHPPercentage, 0)
  f.switchToSelfExecutionStatus(pinCheck160, configId(1082130438), 1n)

  // getTargetLevel / get_target_level / genericId=200239 / literal=1, wire=0
  const result161 = f.getTargetLevel(CE.TargetEntity.AggroTarget)
  const pinCheck162 = f.equal(result161, 0n)
  f.switchToSelfExecutionStatus(pinCheck162, configId(1082130438), 1n)

  // greaterThan / greater_than / genericId=200180 / literal=2, wire=0
  const result165 = f.greaterThan(163n, 164n)
  const pinCheck166 = f.equal(result165, false)
  f.switchToSelfExecutionStatus(pinCheck166, configId(1082130438), 1n)

  // greaterThanOrEqualTo / greater_than_or_equal_to / genericId=200183 / literal=2, wire=0
  const result169 = f.greaterThanOrEqualTo(167n, 168n)
  const pinCheck170 = f.equal(result169, false)
  f.switchToSelfExecutionStatus(pinCheck170, configId(1082130438), 1n)

  // lessThan / less_than / genericId=200181 / literal=0, wire=2
  const result171 = f.lessThan(wireInt, wireInt)
  const pinCheck172 = f.equal(result171, false)
  f.switchToSelfExecutionStatus(pinCheck172, configId(1082130438), 1n)

  // lessThanOrEqualTo / less_than_or_equal_to / genericId=200182 / literal=0, wire=2
  const result173 = f.lessThanOrEqualTo(wireInt, wireInt)
  const pinCheck174 = f.equal(result173, false)
  f.switchToSelfExecutionStatus(pinCheck174, configId(1082130438), 1n)

  // listIncludesThisValue / list_includes_this_value / genericId=200224 / literal=0, wire=2
  const result175 = f.listIncludesThisValue(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck176 = f.equal(result175, false)
  f.switchToSelfExecutionStatus(pinCheck176, configId(1082130438), 1n)

  // logicalAndOperation / logical_and_operation / genericId=200174 / literal=0, wire=2
  const result177 = f.logicalAndOperation(wireBool, wireBool)
  const pinCheck178 = f.equal(result177, false)
  f.switchToSelfExecutionStatus(pinCheck178, configId(1082130438), 1n)

  // logicalNotOperation / logical_not_operation / genericId=200176 / literal=1, wire=0
  const result180 = f.logicalNotOperation(true)
  const pinCheck181 = f.equal(result180, false)
  f.switchToSelfExecutionStatus(pinCheck181, configId(1082130438), 1n)

  // logicalOrOperation / logical_or_operation / genericId=200175 / literal=0, wire=2
  const result182 = f.logicalOrOperation(wireBool, wireBool)
  const pinCheck183 = f.equal(result182, false)
  f.switchToSelfExecutionStatus(pinCheck183, configId(1082130438), 1n)

  // logicalXorOperation / logical_xor_operation / genericId=200177 / literal=0, wire=2
  const result184 = f.logicalXorOperation(wireBool, wireBool)
  const pinCheck185 = f.equal(result184, false)
  f.switchToSelfExecutionStatus(pinCheck185, configId(1082130438), 1n)

  // multiplication / multiplication / genericId=200186 / literal=0, wire=2
  const result186 = f.multiplication(wireInt, wireInt)
  const pinCheck187 = f.equal(result186, 0n)
  f.switchToSelfExecutionStatus(pinCheck187, configId(1082130438), 1n)

  // orientationToRotation / orientation_to_rotation / genericId=200203 / literal=0, wire=1
  const result189 = f.orientationToRotation(wireVec3)
  const pinCheck190 = f.equal(result189, [0, 0, 0])
  f.switchToSelfExecutionStatus(pinCheck190, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck192, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck194, configId(1082130438), 1n)

  // queryEntityFaction / query_entity_faction / genericId=200171 / literal=1, wire=0
  const result195 = f.queryEntityFaction(CE.TargetEntity.AggroTarget)
  const pinCheck196 = f.equal(result195, faction(0n))
  f.switchToSelfExecutionStatus(pinCheck196, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck198, configId(1082130438), 1n)

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
  f.switchToSelfExecutionStatus(pinCheck200, configId(1082130438), 1n)

  // queryIfEntityIsOnTheField / query_if_entity_is_on_the_field / genericId=200167 / literal=1, wire=0
  const result201 = f.queryIfEntityIsOnTheField(CE.TargetEntity.AggroTarget)
  const pinCheck202 = f.equal(result201, false)
  f.switchToSelfExecutionStatus(pinCheck202, configId(1082130438), 1n)

  // queryIfFactionIsHostile / query_if_faction_is_hostile / genericId=200227 / literal=2, wire=0
  const result205 = f.queryIfFactionIsHostile(faction(203n), faction(204n))
  const pinCheck206 = f.equal(result205, false)
  f.switchToSelfExecutionStatus(pinCheck206, configId(1082130438), 1n)

  // radiansToDegrees / radians_to_degrees / genericId=200211 / literal=0, wire=1
  const result207 = f.radiansToDegrees(wireFloat)
  const pinCheck208 = f.equal(result207, 0)
  f.switchToSelfExecutionStatus(pinCheck208, configId(1082130438), 1n)

  // sineFunction / sine_function / genericId=200204 / literal=1, wire=0
  const result210 = f.sineFunction(209.25)
  const pinCheck211 = f.equal(result210, 0)
  f.switchToSelfExecutionStatus(pinCheck211, configId(1082130438), 1n)

  // split3dVector / split3d_vector / genericId=200194 / literal=0, wire=1
  const result213 = f.split3dVector(wireVec3)
  const pinCheck214 = f.equal(result213.xComponent, 0)
  f.switchToSelfExecutionStatus(pinCheck214, configId(1082130438), 1n)
  const pinCheck215 = f.equal(result213.yComponent, 0)
  f.switchToSelfExecutionStatus(pinCheck215, configId(1082130438), 1n)
  const pinCheck216 = f.equal(result213.zComponent, 0)
  f.switchToSelfExecutionStatus(pinCheck216, configId(1082130438), 1n)

  // subtraction / subtraction / genericId=200185 / literal=0, wire=2
  const result217 = f.subtraction(wireInt, wireInt)
  const pinCheck218 = f.equal(result217, 0n)
  f.switchToSelfExecutionStatus(pinCheck218, configId(1082130438), 1n)

  // tangentFunction / tangent_function / genericId=200206 / literal=1, wire=0
  const result221 = f.tangentFunction(220.25)
  const pinCheck222 = f.equal(result221, 0)
  f.switchToSelfExecutionStatus(pinCheck222, configId(1082130438), 1n)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200307 / literal=1, wire=1
  const result223 = f.whetherTheEntityHasTheSpecifiedUnitStatus(self, wireConfig)
  const pinCheck224 = f.equal(result223, false)
  f.switchToSelfExecutionStatus(pinCheck224, configId(1082130438), 1n)

  // doubleBranch / double_branch / genericId=200125 / literal=1, wire=0
  f.doubleBranch(
    true,
    () => {},
    () => {}
  )

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

  // switchToSelfExecutionStatus / switch_to_self_execution_status / genericId=200128 / literal=1, wire=2
  f.switchToSelfExecutionStatus(true, wireConfig, wireInt)
})

g.boolFilter({
  id: 1082130440,
  name: 'AllClientNodesBoolFilterBeyond',
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
  const pinCheck300 = f.equal(wireStr, '')
  const pinCheck301 = f.equal(wireGuid, guid(0n))
  const pinCheck302 = f.equal(wireConfig, configId(0n))
  const pinCheck303 = f.equal(wirePrefab, prefabId(0n))

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

  // checkThePresetStatusValueOfTheComplexCreation / check_the_preset_status_value_of_the_complex_creation / genericId=200244 / literal=2, wire=0
  const result50 = f.checkThePresetStatusValueOfTheComplexCreation(self, 49n)
  const pinCheck51 = f.equal(result50, 0n)

  // cosineFunction / cosine_function / genericId=200095 / literal=1, wire=0
  const result53 = f.cosineFunction(52.25)
  const pinCheck54 = f.equal(result53, 0)

  // create3dVector / create3d_vector / genericId=200070 / literal=0, wire=3
  const result55 = f.create3dVector(wireFloat, wireFloat, wireFloat)
  const pinCheck56 = f.equal(result55, [0, 0, 0])

  // createDictionary / create_dictionary / genericId=200153 / literal=0, wire=2
  const pinCheck58 = f.greaterThanOrEqualTo(
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
  const result60 = f.dataTypeConversion(59n, 'str')
  const pinCheck61 = f.equal(result60, '')

  // degreesToRadians / degrees_to_radians / genericId=200102 / literal=0, wire=1
  const result62 = f.degreesToRadians(wireFloat)
  const pinCheck63 = f.equal(result62, 0)

  // directionVectorToRotation / direction_vector_to_rotation / genericId=200073 / literal=1, wire=1
  const result66 = f.directionVectorToRotation(wireVec3, [65, 66, 67])
  const pinCheck67 = f.equal(result66, [0, 0, 0])

  // division / division / genericId=200014 / literal=2, wire=0
  const result70 = f.division(68n, 69n)
  const pinCheck71 = f.equal(result70, 0n)

  // enumerationMatch / enumeration_match / genericId=200005 / literal=2, wire=0
  const result72 = f.enumerationMatch(E.SortBy.Ascending, E.SortBy.Ascending)
  const pinCheck73 = f.equal(result72, false)

  // equal / equal / genericId=200006 / literal=0, wire=2
  const result74 = f.equal(wireInt, wireInt)
  const pinCheck75 = f.equal(result74, false)

  // filterEntityListWithinSphericalRange / filter_entity_list_within_spherical_range / genericId=200043 / literal=2, wire=2
  const pinCheck79 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSphericalRange(
        76.25,
        wireVec3,
        wireInt,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )

  // filterEntityListWithinSquareRange / filter_entity_list_within_square_range / genericId=200044 / literal=4, wire=2
  const pinCheck85 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSquareRange(
        80.25,
        81.25,
        82.25,
        wireVec3,
        wireInt,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )

  // getAllEntitiesWithinTheCollisionTrigger / get_all_entities_within_the_collision_trigger / genericId=200107 / literal=2, wire=0
  const pinCheck88 = f.greaterThanOrEqualTo(
    f.getListLength(f.getAllEntitiesWithinTheCollisionTrigger(self, 86n)),
    0n
  )

  // getAllValidEntitiesThatAreScannableByScanComponent / get_all_valid_entities_that_are_scannable_by_scan_component / genericId=200119 / literal=0, wire=0
  const pinCheck90 = f.greaterThanOrEqualTo(
    f.getListLength(f.getAllValidEntitiesThatAreScannableByScanComponent()),
    0n
  )

  // getBaseObjectOfSpecifiedPreAiming / get_base_object_of_specified_pre_aiming / genericId=200276 / literal=1, wire=1
  const result91 = f.getBaseObjectOfSpecifiedPreAiming(wireInt, CE.PreAimResultDataType.Default)
  const pinCheck92 = f.equal(result91, wireEntity)

  // getCharacterEntityOfSpecifiedPlayer / get_character_entity_of_specified_player / genericId=200024 / literal=1, wire=0
  const result93 = f.getCharacterEntityOfSpecifiedPlayer(self)
  const pinCheck94 = f.equal(result93, wireEntity)

  // getCorrespondingValueFromList / get_corresponding_value_from_list / genericId=200017 / literal=0, wire=2
  const result95 = f.getCorrespondingValueFromList(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck96 = f.equal(result95, 0n)

  // getCurrentActivePreAimingIndex / get_current_active_pre_aiming_index / genericId=200279 / literal=0, wire=0
  const result97 = f.getCurrentActivePreAimingIndex()
  const pinCheck98 = f.equal(result97, 0n)

  // getCurrentCharacter / get_current_character / genericId=200076 / literal=0, wire=0
  const result99 = f.getCurrentCharacter()
  const pinCheck100 = f.equal(result99, wireEntity)

  // getCurrentClientTime / get_current_client_time / genericId=200269 / literal=0, wire=0
  const result101 = f.getCurrentClientTime()
  const pinCheck102 = f.equal(result101, 0)

  // getCurrentClientTimeHighPrecision / get_current_client_time_high_precision / genericId=200270 / literal=0, wire=0
  const result103 = f.getCurrentClientTimeHighPrecision()
  const pinCheck104 = f.equal(result103.clientTimeS, 0n)
  const pinCheck105 = f.equal(result103.clientTimeMs, 0n)

  // getCurrentKeyBehavior / get_current_key_behavior / genericId=200267 / literal=0, wire=0
  const result106 = f.getCurrentKeyBehavior()
  const pinCheck107 = f.greaterThanOrEqualTo(f.getListLength(result106.behaviorIDList), 0n)
  const pinCheck108 = f.greaterThanOrEqualTo(f.getListLength(result106.entryTimeList), 0n)

  // getCurrentKeyBehaviorHighPrecision / get_current_key_behavior_high_precision / genericId=200268 / literal=0, wire=0
  const result109 = f.getCurrentKeyBehaviorHighPrecision()
  const pinCheck110 = f.greaterThanOrEqualTo(f.getListLength(result109.behaviorIDList), 0n)
  const pinCheck111 = f.greaterThanOrEqualTo(f.getListLength(result109.entryTimeListS), 0n)
  const pinCheck112 = f.greaterThanOrEqualTo(f.getListLength(result109.entryTimeListMs), 0n)

  // getCursorHitResult / get_cursor_hit_result / genericId=200285 / literal=0, wire=0
  const result113 = f.getCursorHitResult()
  const pinCheck114 = f.greaterThanOrEqualTo(f.getListLength(result113.hitEntityList), 0n)
  const pinCheck115 = f.greaterThanOrEqualTo(f.getListLength(result113.hitPositionList), 0n)
  const pinCheck116 = f.equal(result113.hitCount, 0n)

  // getCursorScreenCoordinates / get_cursor_screen_coordinates / genericId=200286 / literal=0, wire=0
  const result117 = f.getCursorScreenCoordinates()
  const pinCheck118 = f.equal(result117.screenX, 0)
  const pinCheck119 = f.equal(result117.screenY, 0)

  // getCursorViewportCoordinates / get_cursor_viewport_coordinates / genericId=200287 / literal=0, wire=0
  const result120 = f.getCursorViewportCoordinates()
  const pinCheck121 = f.equal(result120.viewportX, 0)
  const pinCheck122 = f.equal(result120.viewportY, 0)

  // getCustomVariable / get_custom_variable / genericId=200016 / literal=0, wire=2
  const result123 = f.getCustomVariable(wireEntity, wireStr)
  const narrowed124 = result123.asType('int')
  const pinCheck125 = f.equal(narrowed124, 0n)

  // getEntityCurrentlyScannedByScanComponent / get_entity_currently_scanned_by_scan_component / genericId=200118 / literal=0, wire=0
  const result126 = f.getEntityCurrentlyScannedByScanComponent()
  const pinCheck127 = f.equal(result126.correspondingEntity, wireEntity)
  const pinCheck128 = f.equal(result126.scanTagConfigID, configId(0n))

  // getEntityLocation / get_entity_location / genericId=200030 / literal=0, wire=1
  const result129 = f.getEntityLocation(wireEntity)
  const pinCheck130 = f.equal(result129, [0, 0, 0])

  // getEntityRotation / get_entity_rotation / genericId=200031 / literal=1, wire=0
  const result131 = f.getEntityRotation(self)
  const pinCheck132 = f.equal(result131, [0, 0, 0])

  // getEntitySCurrentActiveScanTags / get_entity_s_current_active_scan_tags / genericId=200121 / literal=0, wire=1
  const result133 = f.getEntitySCurrentActiveScanTags(wireEntity)
  const pinCheck134 = f.equal(result133, configId(0n))

  // getEntitySScanStatus / get_entity_s_scan_status / genericId=200120 / literal=0, wire=1
  const result135 = f.getEntitySScanStatus(wireEntity)
  const pinCheck136 = f.enumerationMatch(result135, CE.ScanStatus.UnusableTarget)

  // getEntitySType / get_entity_s_type / genericId=200045 / literal=1, wire=0
  const result137 = f.getEntitySType(self)
  const pinCheck138 = f.enumerationMatch(result137, E.EntityType.Stage)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe140 = f.getRayDetectionResult(
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
  const pinCheck141 = f.equal(enumListProbe140.onHitLocation, [0, 0, 0])

  // getListLength / get_list_length / genericId=200018 / literal=0, wire=1
  const result142 = f.getListLength(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck143 = f.equal(result142, 0n)

  // getListOfKeysFromDictionary / get_list_of_keys_from_dictionary / genericId=200159 / literal=0, wire=1
  const pinCheck145 = f.greaterThanOrEqualTo(
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
  const pinCheck147 = f.greaterThanOrEqualTo(
    f.getListLength(f.getListOfPlayerEntitiesOnTheField()),
    0n
  )

  // getListOfValuesFromDictionary / get_list_of_values_from_dictionary / genericId=200158 / literal=0, wire=1
  const pinCheck149 = f.greaterThanOrEqualTo(
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
  const result150 = f.getMaximumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck151 = f.equal(result150, 0n)

  // getMinimumValueFromList / get_minimum_value_from_list / genericId=200021 / literal=0, wire=1
  const result152 = f.getMinimumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck153 = f.equal(result152, 0n)

  // getPlayerClientInputDeviceType / get_player_client_input_device_type / genericId=200123 / literal=0, wire=0
  const result154 = f.getPlayerClientInputDeviceType()
  const pinCheck155 = f.enumerationMatch(result154, E.InputDeviceType.KeyboardAndMouse)

  // getPlayerEntityToWhichTheCharacterBelongs / get_player_entity_to_which_the_character_belongs / genericId=200025 / literal=1, wire=0
  const result156 = f.getPlayerEntityToWhichTheCharacterBelongs(self)
  const pinCheck157 = f.equal(result156, wireEntity)

  // getPlayerMovementInput / get_player_movement_input / genericId=200255 / literal=0, wire=0
  const result158 = f.getPlayerMovementInput()
  const pinCheck159 = f.equal(result158.inputDirection, 0)
  const pinCheck160 = f.equal(result158.inputStrength, 0)

  // getPreAimingCollisionDetectionResultCount / get_pre_aiming_collision_detection_result_count / genericId=200280 / literal=1, wire=1
  const result161 = f.getPreAimingCollisionDetectionResultCount(
    wireInt,
    CE.PreAimResultDataType.Default
  )
  const pinCheck162 = f.equal(result161, 0n)

  // getPreAimingDuration / get_pre_aiming_duration / genericId=200278 / literal=2, wire=0
  const result164 = f.getPreAimingDuration(163n, CE.PreAimResultDataType.Default)
  const pinCheck165 = f.equal(result164, 0)

  // getPreAimingRayHitInfo / get_pre_aiming_ray_hit_info / genericId=200281 / literal=1, wire=1
  const result166 = f.getPreAimingRayHitInfo(wireInt, CE.PreAimResultDataType.Default)
  const pinCheck167 = f.equal(result166.hitPosition, [0, 0, 0])
  const pinCheck168 = f.equal(result166.hitEntity, wireEntity)

  // getPreAimingResult / get_pre_aiming_result / genericId=200277 / literal=1, wire=1
  const result169 = f.getPreAimingResult(wireInt, CE.PreAimResultDataType.Default)
  const pinCheck170 = f.equal(result169.hitPosition, [0, 0, 0])
  const pinCheck171 = f.equal(result169.inRangePosition, [0, 0, 0])
  const pinCheck172 = f.equal(result169.bestValidTarget, wireEntity)
  const pinCheck173 = f.greaterThanOrEqualTo(f.getListLength(result169.validTargetList), 0n)

  // getPresetStatus / get_preset_status / genericId=200028 / literal=1, wire=1
  const result174 = f.getPresetStatus(self, wireInt)
  const pinCheck175 = f.equal(result174, 0n)

  // getRandomNumber / get_random_number / genericId=200032 / literal=2, wire=0
  const result178 = f.getRandomNumber(176n, 177n)
  const pinCheck179 = f.equal(result178, 0n)

  // getRayDetectionResult / get_ray_detection_result / genericId=200109 / literal=4, wire=3
  const result182 = f.getRayDetectionResult(
    wireEntity,
    wireVec3,
    [181, 182, 183],
    wireFloat,
    E.TargetType.None,
    [E.EntityType.Stage, E.EntityType.Object, E.EntityType.Player],
    [CE.RayFilterType.Hurtbox, CE.RayFilterType.Scene, CE.RayFilterType.ObjectSelfCollision]
  )
  const pinCheck183 = f.equal(result182.onHitLocation, [0, 0, 0])
  const pinCheck184 = f.equal(result182.onHitEntity, wireEntity)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200110 / literal=1, wire=0
  const enumListProbe186 = f.getRayDetectionResult(
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
  const pinCheck187 = f.equal(enumListProbe186.onHitLocation, [0, 0, 0])

  // getSelfEntity / get_self_entity / genericId=200033 / literal=0, wire=0
  const result188 = f.getSelfEntity()
  const pinCheck189 = f.equal(result188, wireEntity)

  // getSkillConfigIdBySkillInstanceId / get_skill_config_id_by_skill_instance_id / genericId=200272 / literal=0, wire=1
  const result190 = f.getSkillConfigIdBySkillInstanceId(wireInt)
  const pinCheck191 = f.equal(result190, configId(0n))

  // getTargetAttachmentPointLocation / get_target_attachment_point_location / genericId=200047 / literal=1, wire=1
  const result193 = f.getTargetAttachmentPointLocation(wireEntity, 'literal-192')
  const pinCheck194 = f.equal(result193, [0, 0, 0])

  // getTargetAttachmentPointRotation / get_target_attachment_point_rotation / genericId=200048 / literal=1, wire=1
  const result195 = f.getTargetAttachmentPointRotation(self, wireStr)
  const pinCheck196 = f.equal(result195, [0, 0, 0])

  // getTargetEntity / get_target_entity / genericId=200034 / literal=0, wire=0
  const result197 = f.getTargetEntity()
  const pinCheck198 = f.equal(result197, wireEntity)

  // getUnitAttackTarget / get_unit_attack_target / genericId=200035 / literal=1, wire=0
  const result199 = f.getUnitAttackTarget(self)
  const pinCheck200 = f.equal(result199, wireEntity)

  // getWhetherCursorIsActive / get_whether_cursor_is_active / genericId=200284 / literal=0, wire=0
  const result201 = f.getWhetherCursorIsActive()
  const pinCheck202 = f.equal(result201, false)

  // getWhetherPreAimingStickIsInDeadZone / get_whether_pre_aiming_stick_is_in_dead_zone / genericId=200282 / literal=2, wire=0
  const result204 = f.getWhetherPreAimingStickIsInDeadZone(203n, CE.PreAimResultDataType.Default)
  const pinCheck205 = f.equal(result204, false)

  // greaterThan / greater_than / genericId=200007 / literal=2, wire=0
  const result208 = f.greaterThan(206n, 207n)
  const pinCheck209 = f.equal(result208, false)

  // greaterThanOrEqualTo / greater_than_or_equal_to / genericId=200010 / literal=2, wire=0
  const result212 = f.greaterThanOrEqualTo(210n, 211n)
  const pinCheck213 = f.equal(result212, false)

  // lessThan / less_than / genericId=200008 / literal=0, wire=2
  const result214 = f.lessThan(wireInt, wireInt)
  const pinCheck215 = f.equal(result214, false)

  // lessThanOrEqualTo / less_than_or_equal_to / genericId=200009 / literal=0, wire=2
  const result216 = f.lessThanOrEqualTo(wireInt, wireInt)
  const pinCheck217 = f.equal(result216, false)

  // listIncludesThisValue / list_includes_this_value / genericId=200019 / literal=0, wire=2
  const result218 = f.listIncludesThisValue(
    wireInt,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck219 = f.equal(result218, false)

  // logicalAndOperation / logical_and_operation / genericId=200001 / literal=0, wire=2
  const result220 = f.logicalAndOperation(wireBool, wireBool)
  const pinCheck221 = f.equal(result220, false)

  // logicalNotOperation / logical_not_operation / genericId=200003 / literal=1, wire=0
  const result223 = f.logicalNotOperation(false)
  const pinCheck224 = f.equal(result223, false)

  // logicalOrOperation / logical_or_operation / genericId=200002 / literal=0, wire=2
  const result225 = f.logicalOrOperation(wireBool, wireBool)
  const pinCheck226 = f.equal(result225, false)

  // logicalXorOperation / logical_xor_operation / genericId=200004 / literal=0, wire=2
  const result227 = f.logicalXorOperation(wireBool, wireBool)
  const pinCheck228 = f.equal(result227, false)

  // multiplication / multiplication / genericId=200013 / literal=0, wire=2
  const result229 = f.multiplication(wireInt, wireInt)
  const pinCheck230 = f.equal(result229, 0n)

  // orientationToRotation / orientation_to_rotation / genericId=200074 / literal=0, wire=1
  const result232 = f.orientationToRotation(wireVec3)
  const pinCheck233 = f.equal(result232, [0, 0, 0])

  // queryActiveSkillInstanceListOfSpecifiedSlot / query_active_skill_instance_list_of_specified_slot / genericId=200274 / literal=1, wire=0
  const result234 = f.queryActiveSkillInstanceListOfSpecifiedSlot(E.CharacterSkillSlot.NormalAttack)
  const pinCheck235 = f.equal(result234, 0n)

  // queryDictionarySLength / query_dictionary_s_length / genericId=200157 / literal=0, wire=1
  const result236 = f.queryDictionarySLength(
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
  const pinCheck237 = f.equal(result236, 0n)

  // queryDictionaryValueByKey / query_dictionary_value_by_key / genericId=200154 / literal=0, wire=2
  const result238 = f.queryDictionaryValueByKey(
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
  const pinCheck239 = f.equal(result238, 0n)

  // queryEntityByGuid / query_entity_by_guid / genericId=200023 / literal=1, wire=0
  const result241 = f.queryEntityByGuid(guid(240n))
  const pinCheck242 = f.equal(result241, wireEntity)

  // queryEntityFaction / query_entity_faction / genericId=200029 / literal=0, wire=1
  const result243 = f.queryEntityFaction(wireEntity)
  const pinCheck244 = f.equal(result243, faction(0n))

  // queryGuidByEntity / query_guid_by_entity / genericId=200027 / literal=1, wire=0
  const result245 = f.queryGuidByEntity(self)
  const pinCheck246 = f.equal(result245, guid(0n))

  // queryIfDictionaryContainsSpecificKey / query_if_dictionary_contains_specific_key / genericId=200155 / literal=0, wire=2
  const result247 = f.queryIfDictionaryContainsSpecificKey(
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
  const pinCheck248 = f.equal(result247, false)

  // queryIfDictionaryContainsSpecificValue / query_if_dictionary_contains_specific_value / genericId=200156 / literal=0, wire=2
  const result249 = f.queryIfDictionaryContainsSpecificValue(
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
  const pinCheck250 = f.equal(result249, false)

  // queryIfEntityIsOnTheField / query_if_entity_is_on_the_field / genericId=200103 / literal=1, wire=0
  const result251 = f.queryIfEntityIsOnTheField(self)
  const pinCheck252 = f.equal(result251, false)

  // queryIfFactionIsHostile / query_if_faction_is_hostile / genericId=200093 / literal=2, wire=0
  const result255 = f.queryIfFactionIsHostile(faction(253n), faction(254n))
  const pinCheck256 = f.equal(result255, false)

  // queryIfSelfIsInCombat / query_if_self_is_in_combat / genericId=200037 / literal=0, wire=0
  const result257 = f.queryIfSelfIsInCombat()
  const pinCheck258 = f.equal(result257, false)

  // queryPreAimingEndReason / query_pre_aiming_end_reason / genericId=200283 / literal=0, wire=1
  const result259 = f.queryPreAimingEndReason(wireInt)
  const pinCheck260 = f.enumerationMatch(result259, CE.PreAimingEndReason.None)

  // querySkillInstanceIdBySkillSlotAndSkillConfigId / query_skill_instance_id_by_skill_slot_and_skill_config_id / genericId=200275 / literal=1, wire=1
  const result261 = f.querySkillInstanceIdBySkillSlotAndSkillConfigId(
    E.CharacterSkillSlot.NormalAttack,
    wireConfig
  )
  const pinCheck262 = f.equal(result261, 0n)

  // querySkillInstanceListBySpecifiedSlot / query_skill_instance_list_by_specified_slot / genericId=200273 / literal=1, wire=0
  const pinCheck264 = f.greaterThanOrEqualTo(
    f.getListLength(f.querySkillInstanceListBySpecifiedSlot(E.CharacterSkillSlot.NormalAttack)),
    0n
  )

  // querySkillVariableValue / query_skill_variable_value / genericId=200259 / literal=1, wire=0
  const result266 = f.querySkillVariableValue(configId(265n))
  const pinCheck267 = f.equal(result266, 0)

  // queryWhetherPlayerIsCurrentlyInVoiceChat / query_whether_player_is_currently_in_voice_chat / genericId=200271 / literal=0, wire=1
  const result268 = f.queryWhetherPlayerIsCurrentlyInVoiceChat(wireEntity)
  const pinCheck269 = f.equal(result268, false)

  // radiansToDegrees / radians_to_degrees / genericId=200101 / literal=0, wire=1
  const result270 = f.radiansToDegrees(wireFloat)
  const pinCheck271 = f.equal(result270, 0)

  // screenCoordinatesToViewportCoordinates / screen_coordinates_to_viewport_coordinates / genericId=200290 / literal=0, wire=2
  const result272 = f.screenCoordinatesToViewportCoordinates(wireFloat, wireFloat)
  const pinCheck273 = f.equal(result272.viewportX, 0)
  const pinCheck274 = f.equal(result272.viewportY, 0)

  // screenCoordinatesToWorldCoordinates / screen_coordinates_to_world_coordinates / genericId=200292 / literal=1, wire=2
  const result276 = f.screenCoordinatesToWorldCoordinates(wireFloat, wireFloat, 275.25)
  const pinCheck277 = f.equal(result276, [0, 0, 0])

  // sineFunction / sine_function / genericId=200094 / literal=1, wire=0
  const result279 = f.sineFunction(278.25)
  const pinCheck280 = f.equal(result279, 0)

  // split3dVector / split3d_vector / genericId=200065 / literal=0, wire=1
  const result282 = f.split3dVector(wireVec3)
  const pinCheck283 = f.equal(result282.xComponent, 0)
  const pinCheck284 = f.equal(result282.yComponent, 0)
  const pinCheck285 = f.equal(result282.zComponent, 0)

  // subtraction / subtraction / genericId=200012 / literal=0, wire=2
  const result286 = f.subtraction(wireInt, wireInt)
  const pinCheck287 = f.equal(result286, 0n)

  // tangentFunction / tangent_function / genericId=200096 / literal=1, wire=0
  const result289 = f.tangentFunction(288.25)
  const pinCheck290 = f.equal(result289, 0)

  // viewportCoordinatesToScreenCoordinates / viewport_coordinates_to_screen_coordinates / genericId=200291 / literal=0, wire=2
  const result291 = f.viewportCoordinatesToScreenCoordinates(wireFloat, wireFloat)
  const pinCheck292 = f.equal(result291.screenX, 0)
  const pinCheck293 = f.equal(result291.screenY, 0)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200243 / literal=1, wire=1
  const result294 = f.whetherTheEntityHasTheSpecifiedUnitStatus(self, wireConfig)
  const pinCheck295 = f.equal(result294, false)

  // worldCoordinatesToScreenCoordinates / world_coordinates_to_screen_coordinates / genericId=200293 / literal=1, wire=0
  const result297 = f.worldCoordinatesToScreenCoordinates([296, 297, 298])
  const pinCheck298 = f.equal(result297.screenX, 0)
  const pinCheck299 = f.equal(result297.screenY, 0)

  const combinedCheck304 = f.logicalAndOperation(pinCheck4, pinCheck8)
  const combinedCheck305 = f.logicalAndOperation(pinCheck12, pinCheck16)
  const combinedCheck306 = f.logicalAndOperation(pinCheck19, pinCheck22)
  const combinedCheck307 = f.logicalAndOperation(pinCheck26, pinCheck30)
  const combinedCheck308 = f.logicalAndOperation(pinCheck34, pinCheck36)
  const combinedCheck309 = f.logicalAndOperation(pinCheck38, pinCheck40)
  const combinedCheck310 = f.logicalAndOperation(pinCheck42, pinCheck44)
  const combinedCheck311 = f.logicalAndOperation(pinCheck46, pinCheck48)
  const combinedCheck312 = f.logicalAndOperation(pinCheck51, pinCheck54)
  const combinedCheck313 = f.logicalAndOperation(pinCheck56, pinCheck58)
  const combinedCheck314 = f.logicalAndOperation(pinCheck61, pinCheck63)
  const combinedCheck315 = f.logicalAndOperation(pinCheck67, pinCheck71)
  const combinedCheck316 = f.logicalAndOperation(pinCheck73, pinCheck75)
  const combinedCheck317 = f.logicalAndOperation(pinCheck79, pinCheck85)
  const combinedCheck318 = f.logicalAndOperation(pinCheck88, pinCheck90)
  const combinedCheck319 = f.logicalAndOperation(pinCheck92, pinCheck94)
  const combinedCheck320 = f.logicalAndOperation(pinCheck96, pinCheck98)
  const combinedCheck321 = f.logicalAndOperation(pinCheck100, pinCheck102)
  const combinedCheck322 = f.logicalAndOperation(pinCheck104, pinCheck105)
  const combinedCheck323 = f.logicalAndOperation(pinCheck107, pinCheck108)
  const combinedCheck324 = f.logicalAndOperation(pinCheck110, pinCheck111)
  const combinedCheck325 = f.logicalAndOperation(pinCheck112, pinCheck114)
  const combinedCheck326 = f.logicalAndOperation(pinCheck115, pinCheck116)
  const combinedCheck327 = f.logicalAndOperation(pinCheck118, pinCheck119)
  const combinedCheck328 = f.logicalAndOperation(pinCheck121, pinCheck122)
  const combinedCheck329 = f.logicalAndOperation(pinCheck125, pinCheck127)
  const combinedCheck330 = f.logicalAndOperation(pinCheck128, pinCheck130)
  const combinedCheck331 = f.logicalAndOperation(pinCheck132, pinCheck134)
  const combinedCheck332 = f.logicalAndOperation(pinCheck136, pinCheck138)
  const combinedCheck333 = f.logicalAndOperation(pinCheck141, pinCheck143)
  const combinedCheck334 = f.logicalAndOperation(pinCheck145, pinCheck147)
  const combinedCheck335 = f.logicalAndOperation(pinCheck149, pinCheck151)
  const combinedCheck336 = f.logicalAndOperation(pinCheck153, pinCheck155)
  const combinedCheck337 = f.logicalAndOperation(pinCheck157, pinCheck159)
  const combinedCheck338 = f.logicalAndOperation(pinCheck160, pinCheck162)
  const combinedCheck339 = f.logicalAndOperation(pinCheck165, pinCheck167)
  const combinedCheck340 = f.logicalAndOperation(pinCheck168, pinCheck170)
  const combinedCheck341 = f.logicalAndOperation(pinCheck171, pinCheck172)
  const combinedCheck342 = f.logicalAndOperation(pinCheck173, pinCheck175)
  const combinedCheck343 = f.logicalAndOperation(pinCheck179, pinCheck183)
  const combinedCheck344 = f.logicalAndOperation(pinCheck184, pinCheck187)
  const combinedCheck345 = f.logicalAndOperation(pinCheck189, pinCheck191)
  const combinedCheck346 = f.logicalAndOperation(pinCheck194, pinCheck196)
  const combinedCheck347 = f.logicalAndOperation(pinCheck198, pinCheck200)
  const combinedCheck348 = f.logicalAndOperation(pinCheck202, pinCheck205)
  const combinedCheck349 = f.logicalAndOperation(pinCheck209, pinCheck213)
  const combinedCheck350 = f.logicalAndOperation(pinCheck215, pinCheck217)
  const combinedCheck351 = f.logicalAndOperation(pinCheck219, pinCheck221)
  const combinedCheck352 = f.logicalAndOperation(pinCheck224, pinCheck226)
  const combinedCheck353 = f.logicalAndOperation(pinCheck228, pinCheck230)
  const combinedCheck354 = f.logicalAndOperation(pinCheck233, pinCheck235)
  const combinedCheck355 = f.logicalAndOperation(pinCheck237, pinCheck239)
  const combinedCheck356 = f.logicalAndOperation(pinCheck242, pinCheck244)
  const combinedCheck357 = f.logicalAndOperation(pinCheck246, pinCheck248)
  const combinedCheck358 = f.logicalAndOperation(pinCheck250, pinCheck252)
  const combinedCheck359 = f.logicalAndOperation(pinCheck256, pinCheck258)
  const combinedCheck360 = f.logicalAndOperation(pinCheck260, pinCheck262)
  const combinedCheck361 = f.logicalAndOperation(pinCheck264, pinCheck267)
  const combinedCheck362 = f.logicalAndOperation(pinCheck269, pinCheck271)
  const combinedCheck363 = f.logicalAndOperation(pinCheck273, pinCheck274)
  const combinedCheck364 = f.logicalAndOperation(pinCheck277, pinCheck280)
  const combinedCheck365 = f.logicalAndOperation(pinCheck283, pinCheck284)
  const combinedCheck366 = f.logicalAndOperation(pinCheck285, pinCheck287)
  const combinedCheck367 = f.logicalAndOperation(pinCheck290, pinCheck292)
  const combinedCheck368 = f.logicalAndOperation(pinCheck293, pinCheck295)
  const combinedCheck369 = f.logicalAndOperation(pinCheck298, pinCheck299)
  const combinedCheck370 = f.logicalAndOperation(pinCheck300, pinCheck301)
  const combinedCheck371 = f.logicalAndOperation(pinCheck302, pinCheck303)
  const combinedCheck372 = f.logicalAndOperation(combinedCheck304, combinedCheck305)
  const combinedCheck373 = f.logicalAndOperation(combinedCheck306, combinedCheck307)
  const combinedCheck374 = f.logicalAndOperation(combinedCheck308, combinedCheck309)
  const combinedCheck375 = f.logicalAndOperation(combinedCheck310, combinedCheck311)
  const combinedCheck376 = f.logicalAndOperation(combinedCheck312, combinedCheck313)
  const combinedCheck377 = f.logicalAndOperation(combinedCheck314, combinedCheck315)
  const combinedCheck378 = f.logicalAndOperation(combinedCheck316, combinedCheck317)
  const combinedCheck379 = f.logicalAndOperation(combinedCheck318, combinedCheck319)
  const combinedCheck380 = f.logicalAndOperation(combinedCheck320, combinedCheck321)
  const combinedCheck381 = f.logicalAndOperation(combinedCheck322, combinedCheck323)
  const combinedCheck382 = f.logicalAndOperation(combinedCheck324, combinedCheck325)
  const combinedCheck383 = f.logicalAndOperation(combinedCheck326, combinedCheck327)
  const combinedCheck384 = f.logicalAndOperation(combinedCheck328, combinedCheck329)
  const combinedCheck385 = f.logicalAndOperation(combinedCheck330, combinedCheck331)
  const combinedCheck386 = f.logicalAndOperation(combinedCheck332, combinedCheck333)
  const combinedCheck387 = f.logicalAndOperation(combinedCheck334, combinedCheck335)
  const combinedCheck388 = f.logicalAndOperation(combinedCheck336, combinedCheck337)
  const combinedCheck389 = f.logicalAndOperation(combinedCheck338, combinedCheck339)
  const combinedCheck390 = f.logicalAndOperation(combinedCheck340, combinedCheck341)
  const combinedCheck391 = f.logicalAndOperation(combinedCheck342, combinedCheck343)
  const combinedCheck392 = f.logicalAndOperation(combinedCheck344, combinedCheck345)
  const combinedCheck393 = f.logicalAndOperation(combinedCheck346, combinedCheck347)
  const combinedCheck394 = f.logicalAndOperation(combinedCheck348, combinedCheck349)
  const combinedCheck395 = f.logicalAndOperation(combinedCheck350, combinedCheck351)
  const combinedCheck396 = f.logicalAndOperation(combinedCheck352, combinedCheck353)
  const combinedCheck397 = f.logicalAndOperation(combinedCheck354, combinedCheck355)
  const combinedCheck398 = f.logicalAndOperation(combinedCheck356, combinedCheck357)
  const combinedCheck399 = f.logicalAndOperation(combinedCheck358, combinedCheck359)
  const combinedCheck400 = f.logicalAndOperation(combinedCheck360, combinedCheck361)
  const combinedCheck401 = f.logicalAndOperation(combinedCheck362, combinedCheck363)
  const combinedCheck402 = f.logicalAndOperation(combinedCheck364, combinedCheck365)
  const combinedCheck403 = f.logicalAndOperation(combinedCheck366, combinedCheck367)
  const combinedCheck404 = f.logicalAndOperation(combinedCheck368, combinedCheck369)
  const combinedCheck405 = f.logicalAndOperation(combinedCheck370, combinedCheck371)
  const combinedCheck406 = f.logicalAndOperation(combinedCheck372, combinedCheck373)
  const combinedCheck407 = f.logicalAndOperation(combinedCheck374, combinedCheck375)
  const combinedCheck408 = f.logicalAndOperation(combinedCheck376, combinedCheck377)
  const combinedCheck409 = f.logicalAndOperation(combinedCheck378, combinedCheck379)
  const combinedCheck410 = f.logicalAndOperation(combinedCheck380, combinedCheck381)
  const combinedCheck411 = f.logicalAndOperation(combinedCheck382, combinedCheck383)
  const combinedCheck412 = f.logicalAndOperation(combinedCheck384, combinedCheck385)
  const combinedCheck413 = f.logicalAndOperation(combinedCheck386, combinedCheck387)
  const combinedCheck414 = f.logicalAndOperation(combinedCheck388, combinedCheck389)
  const combinedCheck415 = f.logicalAndOperation(combinedCheck390, combinedCheck391)
  const combinedCheck416 = f.logicalAndOperation(combinedCheck392, combinedCheck393)
  const combinedCheck417 = f.logicalAndOperation(combinedCheck394, combinedCheck395)
  const combinedCheck418 = f.logicalAndOperation(combinedCheck396, combinedCheck397)
  const combinedCheck419 = f.logicalAndOperation(combinedCheck398, combinedCheck399)
  const combinedCheck420 = f.logicalAndOperation(combinedCheck400, combinedCheck401)
  const combinedCheck421 = f.logicalAndOperation(combinedCheck402, combinedCheck403)
  const combinedCheck422 = f.logicalAndOperation(combinedCheck404, combinedCheck405)
  const combinedCheck423 = f.logicalAndOperation(combinedCheck406, combinedCheck407)
  const combinedCheck424 = f.logicalAndOperation(combinedCheck408, combinedCheck409)
  const combinedCheck425 = f.logicalAndOperation(combinedCheck410, combinedCheck411)
  const combinedCheck426 = f.logicalAndOperation(combinedCheck412, combinedCheck413)
  const combinedCheck427 = f.logicalAndOperation(combinedCheck414, combinedCheck415)
  const combinedCheck428 = f.logicalAndOperation(combinedCheck416, combinedCheck417)
  const combinedCheck429 = f.logicalAndOperation(combinedCheck418, combinedCheck419)
  const combinedCheck430 = f.logicalAndOperation(combinedCheck420, combinedCheck421)
  const combinedCheck431 = f.logicalAndOperation(combinedCheck423, combinedCheck424)
  const combinedCheck432 = f.logicalAndOperation(combinedCheck425, combinedCheck426)
  const combinedCheck433 = f.logicalAndOperation(combinedCheck427, combinedCheck428)
  const combinedCheck434 = f.logicalAndOperation(combinedCheck429, combinedCheck430)
  const combinedCheck435 = f.logicalAndOperation(combinedCheck431, combinedCheck432)
  const combinedCheck436 = f.logicalAndOperation(combinedCheck433, combinedCheck434)
  const combinedCheck437 = f.logicalAndOperation(combinedCheck435, combinedCheck436)
  const combinedCheck438 = f.logicalAndOperation(combinedCheck437, combinedCheck422)
  return combinedCheck438
})

g.intFilter({
  id: 1082130441,
  name: 'AllClientNodesIntFilterBeyond',
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
  const pinCheck328 = f.equal(wireStr, '')
  const pinCheck329 = f.equal(wireGuid, guid(0n))
  const pinCheck330 = f.equal(wireConfig, configId(0n))
  const pinCheck331 = f.equal(wirePrefab, prefabId(0n))

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

  // checkThePresetStatusValueOfTheComplexCreation / check_the_preset_status_value_of_the_complex_creation / genericId=200244 / literal=0, wire=2
  const result57 = f.checkThePresetStatusValueOfTheComplexCreation(wireEntity, wireInt)
  const pinCheck58 = f.equal(result57, 0n)

  // cosineFunction / cosine_function / genericId=200095 / literal=0, wire=1
  const result59 = f.cosineFunction(wireFloat)
  const pinCheck60 = f.equal(result59, 0)

  // create3dVector / create3d_vector / genericId=200070 / literal=3, wire=0
  const result64 = f.create3dVector(61.25, 62.25, 63.25)
  const pinCheck65 = f.equal(result64, [0, 0, 0])

  // createDictionary / create_dictionary / genericId=200153 / literal=0, wire=2
  const pinCheck67 = f.greaterThanOrEqualTo(
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
  const result68 = f.dataTypeConversion(wireInt, 'str')
  const pinCheck69 = f.equal(result68, '')

  // degreesToRadians / degrees_to_radians / genericId=200102 / literal=1, wire=0
  const result71 = f.degreesToRadians(70.25)
  const pinCheck72 = f.equal(result71, 0)

  // directionVectorToRotation / direction_vector_to_rotation / genericId=200073 / literal=1, wire=1
  const result75 = f.directionVectorToRotation([73, 74, 75], wireVec3)
  const pinCheck76 = f.equal(result75, [0, 0, 0])

  // division / division / genericId=200014 / literal=0, wire=2
  const result77 = f.division(wireInt, wireInt)
  const pinCheck78 = f.equal(result77, 0n)

  // enumerationMatch / enumeration_match / genericId=200005 / literal=2, wire=0
  const result79 = f.enumerationMatch(E.SortBy.Ascending, E.SortBy.Ascending)
  const pinCheck80 = f.equal(result79, false)

  // equal / equal / genericId=200006 / literal=2, wire=0
  const result83 = f.equal(81n, 82n)
  const pinCheck84 = f.equal(result83, false)

  // filterEntityListWithinSphericalRange / filter_entity_list_within_spherical_range / genericId=200043 / literal=3, wire=1
  const pinCheck88 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSphericalRange(
        wireFloat,
        [85, 86, 87],
        86n,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )

  // filterEntityListWithinSquareRange / filter_entity_list_within_square_range / genericId=200044 / literal=3, wire=3
  const pinCheck92 = f.greaterThanOrEqualTo(
    f.getListLength(
      f.filterEntityListWithinSquareRange(
        wireFloat,
        wireFloat,
        wireFloat,
        [89, 90, 91],
        90n,
        CE.TargetSortingRules.DefaultSorting
      )
    ),
    0n
  )

  // getAllEntitiesWithinTheCollisionTrigger / get_all_entities_within_the_collision_trigger / genericId=200107 / literal=0, wire=2
  const pinCheck94 = f.greaterThanOrEqualTo(
    f.getListLength(f.getAllEntitiesWithinTheCollisionTrigger(wireEntity, wireInt)),
    0n
  )

  // getAllValidEntitiesThatAreScannableByScanComponent / get_all_valid_entities_that_are_scannable_by_scan_component / genericId=200119 / literal=0, wire=0
  const pinCheck96 = f.greaterThanOrEqualTo(
    f.getListLength(f.getAllValidEntitiesThatAreScannableByScanComponent()),
    0n
  )

  // getBaseObjectOfSpecifiedPreAiming / get_base_object_of_specified_pre_aiming / genericId=200276 / literal=2, wire=0
  const result98 = f.getBaseObjectOfSpecifiedPreAiming(97n, CE.PreAimResultDataType.Default)
  const pinCheck99 = f.equal(result98, wireEntity)

  // getCharacterEntityOfSpecifiedPlayer / get_character_entity_of_specified_player / genericId=200024 / literal=0, wire=1
  const result100 = f.getCharacterEntityOfSpecifiedPlayer(wireEntity)
  const pinCheck101 = f.equal(result100, wireEntity)

  // getCorrespondingValueFromList / get_corresponding_value_from_list / genericId=200017 / literal=1, wire=1
  const result103 = f.getCorrespondingValueFromList(
    102n,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck104 = f.equal(result103, 0n)

  // getCurrentActivePreAimingIndex / get_current_active_pre_aiming_index / genericId=200279 / literal=0, wire=0
  const result105 = f.getCurrentActivePreAimingIndex()
  const pinCheck106 = f.equal(result105, 0n)

  // getCurrentCharacter / get_current_character / genericId=200076 / literal=0, wire=0
  const result107 = f.getCurrentCharacter()
  const pinCheck108 = f.equal(result107, wireEntity)

  // getCurrentClientTime / get_current_client_time / genericId=200269 / literal=0, wire=0
  const result109 = f.getCurrentClientTime()
  const pinCheck110 = f.equal(result109, 0)

  // getCurrentClientTimeHighPrecision / get_current_client_time_high_precision / genericId=200270 / literal=0, wire=0
  const result111 = f.getCurrentClientTimeHighPrecision()
  const pinCheck112 = f.equal(result111.clientTimeS, 0n)
  const pinCheck113 = f.equal(result111.clientTimeMs, 0n)

  // getCurrentKeyBehavior / get_current_key_behavior / genericId=200267 / literal=0, wire=0
  const result114 = f.getCurrentKeyBehavior()
  const pinCheck115 = f.greaterThanOrEqualTo(f.getListLength(result114.behaviorIDList), 0n)
  const pinCheck116 = f.greaterThanOrEqualTo(f.getListLength(result114.entryTimeList), 0n)

  // getCurrentKeyBehaviorHighPrecision / get_current_key_behavior_high_precision / genericId=200268 / literal=0, wire=0
  const result117 = f.getCurrentKeyBehaviorHighPrecision()
  const pinCheck118 = f.greaterThanOrEqualTo(f.getListLength(result117.behaviorIDList), 0n)
  const pinCheck119 = f.greaterThanOrEqualTo(f.getListLength(result117.entryTimeListS), 0n)
  const pinCheck120 = f.greaterThanOrEqualTo(f.getListLength(result117.entryTimeListMs), 0n)

  // getCursorHitResult / get_cursor_hit_result / genericId=200285 / literal=0, wire=0
  const result121 = f.getCursorHitResult()
  const pinCheck122 = f.greaterThanOrEqualTo(f.getListLength(result121.hitEntityList), 0n)
  const pinCheck123 = f.greaterThanOrEqualTo(f.getListLength(result121.hitPositionList), 0n)
  const pinCheck124 = f.equal(result121.hitCount, 0n)

  // getCursorScreenCoordinates / get_cursor_screen_coordinates / genericId=200286 / literal=0, wire=0
  const result125 = f.getCursorScreenCoordinates()
  const pinCheck126 = f.equal(result125.screenX, 0)
  const pinCheck127 = f.equal(result125.screenY, 0)

  // getCursorViewportCoordinates / get_cursor_viewport_coordinates / genericId=200287 / literal=0, wire=0
  const result128 = f.getCursorViewportCoordinates()
  const pinCheck129 = f.equal(result128.viewportX, 0)
  const pinCheck130 = f.equal(result128.viewportY, 0)

  // getCustomVariable / get_custom_variable / genericId=200016 / literal=2, wire=0
  const result132 = f.getCustomVariable(self, 'literal-131')
  const narrowed133 = result132.asType('int')
  const pinCheck134 = f.equal(narrowed133, 0n)

  // getEntityCurrentlyScannedByScanComponent / get_entity_currently_scanned_by_scan_component / genericId=200118 / literal=0, wire=0
  const result135 = f.getEntityCurrentlyScannedByScanComponent()
  const pinCheck136 = f.equal(result135.correspondingEntity, wireEntity)
  const pinCheck137 = f.equal(result135.scanTagConfigID, configId(0n))

  // getEntityLocation / get_entity_location / genericId=200030 / literal=1, wire=0
  const result138 = f.getEntityLocation(self)
  const pinCheck139 = f.equal(result138, [0, 0, 0])

  // getEntityRotation / get_entity_rotation / genericId=200031 / literal=0, wire=1
  const result140 = f.getEntityRotation(wireEntity)
  const pinCheck141 = f.equal(result140, [0, 0, 0])

  // getEntitySCurrentActiveScanTags / get_entity_s_current_active_scan_tags / genericId=200121 / literal=1, wire=0
  const result142 = f.getEntitySCurrentActiveScanTags(self)
  const pinCheck143 = f.equal(result142, configId(0n))

  // getEntitySScanStatus / get_entity_s_scan_status / genericId=200120 / literal=1, wire=0
  const result144 = f.getEntitySScanStatus(self)
  const pinCheck145 = f.enumerationMatch(result144, CE.ScanStatus.UnusableTarget)

  // getEntitySType / get_entity_s_type / genericId=200045 / literal=0, wire=1
  const result146 = f.getEntitySType(wireEntity)
  const pinCheck147 = f.enumerationMatch(result146, E.EntityType.Stage)

  // getEntityTypeList / get_entity_type_list / genericId=200050 / literal=1, wire=0
  const enumListProbe149 = f.getRayDetectionResult(
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
  const pinCheck150 = f.equal(enumListProbe149.onHitLocation, [0, 0, 0])

  // getListLength / get_list_length / genericId=200018 / literal=0, wire=1
  const result151 = f.getListLength(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck152 = f.equal(result151, 0n)

  // getListOfKeysFromDictionary / get_list_of_keys_from_dictionary / genericId=200159 / literal=0, wire=1
  const pinCheck154 = f.greaterThanOrEqualTo(
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
  const pinCheck156 = f.greaterThanOrEqualTo(
    f.getListLength(f.getListOfPlayerEntitiesOnTheField()),
    0n
  )

  // getListOfValuesFromDictionary / get_list_of_values_from_dictionary / genericId=200158 / literal=0, wire=1
  const pinCheck158 = f.greaterThanOrEqualTo(
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
  const result159 = f.getMaximumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck160 = f.equal(result159, 0n)

  // getMinimumValueFromList / get_minimum_value_from_list / genericId=200021 / literal=0, wire=1
  const result161 = f.getMinimumValueFromList(
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck162 = f.equal(result161, 0n)

  // getPlayerClientInputDeviceType / get_player_client_input_device_type / genericId=200123 / literal=0, wire=0
  const result163 = f.getPlayerClientInputDeviceType()
  const pinCheck164 = f.enumerationMatch(result163, E.InputDeviceType.KeyboardAndMouse)

  // getPlayerEntityToWhichTheCharacterBelongs / get_player_entity_to_which_the_character_belongs / genericId=200025 / literal=0, wire=1
  const result165 = f.getPlayerEntityToWhichTheCharacterBelongs(wireEntity)
  const pinCheck166 = f.equal(result165, wireEntity)

  // getPlayerMovementInput / get_player_movement_input / genericId=200255 / literal=0, wire=0
  const result167 = f.getPlayerMovementInput()
  const pinCheck168 = f.equal(result167.inputDirection, 0)
  const pinCheck169 = f.equal(result167.inputStrength, 0)

  // getPreAimingCollisionDetectionResultCount / get_pre_aiming_collision_detection_result_count / genericId=200280 / literal=2, wire=0
  const result171 = f.getPreAimingCollisionDetectionResultCount(
    170n,
    CE.PreAimResultDataType.Default
  )
  const pinCheck172 = f.equal(result171, 0n)

  // getPreAimingDuration / get_pre_aiming_duration / genericId=200278 / literal=1, wire=1
  const result173 = f.getPreAimingDuration(wireInt, CE.PreAimResultDataType.Default)
  const pinCheck174 = f.equal(result173, 0)

  // getPreAimingRayHitInfo / get_pre_aiming_ray_hit_info / genericId=200281 / literal=2, wire=0
  const result176 = f.getPreAimingRayHitInfo(175n, CE.PreAimResultDataType.Default)
  const pinCheck177 = f.equal(result176.hitPosition, [0, 0, 0])
  const pinCheck178 = f.equal(result176.hitEntity, wireEntity)

  // getPreAimingResult / get_pre_aiming_result / genericId=200277 / literal=2, wire=0
  const result180 = f.getPreAimingResult(179n, CE.PreAimResultDataType.Default)
  const pinCheck181 = f.equal(result180.hitPosition, [0, 0, 0])
  const pinCheck182 = f.equal(result180.inRangePosition, [0, 0, 0])
  const pinCheck183 = f.equal(result180.bestValidTarget, wireEntity)
  const pinCheck184 = f.greaterThanOrEqualTo(f.getListLength(result180.validTargetList), 0n)

  // getPresetStatus / get_preset_status / genericId=200028 / literal=1, wire=1
  const result186 = f.getPresetStatus(wireEntity, 185n)
  const pinCheck187 = f.equal(result186, 0n)

  // getRandomNumber / get_random_number / genericId=200032 / literal=0, wire=2
  const result188 = f.getRandomNumber(wireInt, wireInt)
  const pinCheck189 = f.equal(result188, 0n)

  // getRayDetectionResult / get_ray_detection_result / genericId=200109 / literal=4, wire=3
  const result193 = f.getRayDetectionResult(
    self,
    [190, 191, 192],
    wireVec3,
    192.25,
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
  const pinCheck194 = f.equal(result193.onHitLocation, [0, 0, 0])
  const pinCheck195 = f.equal(result193.onHitEntity, wireEntity)

  // getRayFilterTypeList / get_ray_filter_type_list / genericId=200110 / literal=1, wire=0
  const enumListProbe197 = f.getRayDetectionResult(
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
  const pinCheck198 = f.equal(enumListProbe197.onHitLocation, [0, 0, 0])

  // getSelfEntity / get_self_entity / genericId=200033 / literal=0, wire=0
  const result199 = f.getSelfEntity()
  const pinCheck200 = f.equal(result199, wireEntity)

  // getSkillConfigIdBySkillInstanceId / get_skill_config_id_by_skill_instance_id / genericId=200272 / literal=1, wire=0
  const result202 = f.getSkillConfigIdBySkillInstanceId(201n)
  const pinCheck203 = f.equal(result202, configId(0n))

  // getTargetAttachmentPointLocation / get_target_attachment_point_location / genericId=200047 / literal=1, wire=1
  const result204 = f.getTargetAttachmentPointLocation(self, wireStr)
  const pinCheck205 = f.equal(result204, [0, 0, 0])

  // getTargetAttachmentPointRotation / get_target_attachment_point_rotation / genericId=200048 / literal=1, wire=1
  const result207 = f.getTargetAttachmentPointRotation(wireEntity, 'literal-206')
  const pinCheck208 = f.equal(result207, [0, 0, 0])

  // getTargetEntity / get_target_entity / genericId=200034 / literal=0, wire=0
  const result209 = f.getTargetEntity()
  const pinCheck210 = f.equal(result209, wireEntity)

  // getUnitAttackTarget / get_unit_attack_target / genericId=200035 / literal=0, wire=1
  const result211 = f.getUnitAttackTarget(wireEntity)
  const pinCheck212 = f.equal(result211, wireEntity)

  // getWhetherCursorIsActive / get_whether_cursor_is_active / genericId=200284 / literal=0, wire=0
  const result213 = f.getWhetherCursorIsActive()
  const pinCheck214 = f.equal(result213, false)

  // getWhetherPreAimingStickIsInDeadZone / get_whether_pre_aiming_stick_is_in_dead_zone / genericId=200282 / literal=1, wire=1
  const result215 = f.getWhetherPreAimingStickIsInDeadZone(wireInt, CE.PreAimResultDataType.Default)
  const pinCheck216 = f.equal(result215, false)

  // greaterThan / greater_than / genericId=200007 / literal=0, wire=2
  const result217 = f.greaterThan(wireInt, wireInt)
  const pinCheck218 = f.equal(result217, false)

  // greaterThanOrEqualTo / greater_than_or_equal_to / genericId=200010 / literal=0, wire=2
  const result219 = f.greaterThanOrEqualTo(wireInt, wireInt)
  const pinCheck220 = f.equal(result219, false)

  // lessThan / less_than / genericId=200008 / literal=2, wire=0
  const result223 = f.lessThan(221n, 222n)
  const pinCheck224 = f.equal(result223, false)

  // lessThanOrEqualTo / less_than_or_equal_to / genericId=200009 / literal=2, wire=0
  const result227 = f.lessThanOrEqualTo(225n, 226n)
  const pinCheck228 = f.equal(result227, false)

  // listIncludesThisValue / list_includes_this_value / genericId=200019 / literal=1, wire=1
  const result230 = f.listIncludesThisValue(
    229n,
    f.assemblyList(
      [wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt, wireInt],
      'int'
    )
  )
  const pinCheck231 = f.equal(result230, false)

  // logicalAndOperation / logical_and_operation / genericId=200001 / literal=2, wire=0
  const result234 = f.logicalAndOperation(false, true)
  const pinCheck235 = f.equal(result234, false)

  // logicalNotOperation / logical_not_operation / genericId=200003 / literal=0, wire=1
  const result236 = f.logicalNotOperation(wireBool)
  const pinCheck237 = f.equal(result236, false)

  // logicalOrOperation / logical_or_operation / genericId=200002 / literal=2, wire=0
  const result240 = f.logicalOrOperation(false, true)
  const pinCheck241 = f.equal(result240, false)

  // logicalXorOperation / logical_xor_operation / genericId=200004 / literal=2, wire=0
  const result244 = f.logicalXorOperation(false, true)
  const pinCheck245 = f.equal(result244, false)

  // multiplication / multiplication / genericId=200013 / literal=2, wire=0
  const result248 = f.multiplication(246n, 247n)
  const pinCheck249 = f.equal(result248, 0n)

  // orientationToRotation / orientation_to_rotation / genericId=200074 / literal=1, wire=0
  const result251 = f.orientationToRotation([250, 251, 252])
  const pinCheck252 = f.equal(result251, [0, 0, 0])

  // queryActiveSkillInstanceListOfSpecifiedSlot / query_active_skill_instance_list_of_specified_slot / genericId=200274 / literal=1, wire=0
  const result253 = f.queryActiveSkillInstanceListOfSpecifiedSlot(E.CharacterSkillSlot.NormalAttack)
  const pinCheck254 = f.equal(result253, 0n)

  // queryDictionarySLength / query_dictionary_s_length / genericId=200157 / literal=0, wire=1
  const result255 = f.queryDictionarySLength(
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
  const pinCheck256 = f.equal(result255, 0n)

  // queryDictionaryValueByKey / query_dictionary_value_by_key / genericId=200154 / literal=1, wire=1
  const result258 = f.queryDictionaryValueByKey(
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
    257n
  )
  const pinCheck259 = f.equal(result258, 0n)

  // queryEntityByGuid / query_entity_by_guid / genericId=200023 / literal=0, wire=1
  const result260 = f.queryEntityByGuid(wireGuid)
  const pinCheck261 = f.equal(result260, wireEntity)

  // queryEntityFaction / query_entity_faction / genericId=200029 / literal=1, wire=0
  const result262 = f.queryEntityFaction(self)
  const pinCheck263 = f.equal(result262, faction(0n))

  // queryGuidByEntity / query_guid_by_entity / genericId=200027 / literal=0, wire=1
  const result264 = f.queryGuidByEntity(wireEntity)
  const pinCheck265 = f.equal(result264, guid(0n))

  // queryIfDictionaryContainsSpecificKey / query_if_dictionary_contains_specific_key / genericId=200155 / literal=1, wire=1
  const result267 = f.queryIfDictionaryContainsSpecificKey(
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
    266n
  )
  const pinCheck268 = f.equal(result267, false)

  // queryIfDictionaryContainsSpecificValue / query_if_dictionary_contains_specific_value / genericId=200156 / literal=1, wire=1
  const result270 = f.queryIfDictionaryContainsSpecificValue(
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
    269n
  )
  const pinCheck271 = f.equal(result270, false)

  // queryIfEntityIsOnTheField / query_if_entity_is_on_the_field / genericId=200103 / literal=0, wire=1
  const result272 = f.queryIfEntityIsOnTheField(wireEntity)
  const pinCheck273 = f.equal(result272, false)

  // queryIfFactionIsHostile / query_if_faction_is_hostile / genericId=200093 / literal=0, wire=2
  const result274 = f.queryIfFactionIsHostile(wireFaction, wireFaction)
  const pinCheck275 = f.equal(result274, false)

  // queryIfSelfIsInCombat / query_if_self_is_in_combat / genericId=200037 / literal=0, wire=0
  const result276 = f.queryIfSelfIsInCombat()
  const pinCheck277 = f.equal(result276, false)

  // queryPreAimingEndReason / query_pre_aiming_end_reason / genericId=200283 / literal=1, wire=0
  const result279 = f.queryPreAimingEndReason(278n)
  const pinCheck280 = f.enumerationMatch(result279, CE.PreAimingEndReason.None)

  // querySkillInstanceIdBySkillSlotAndSkillConfigId / query_skill_instance_id_by_skill_slot_and_skill_config_id / genericId=200275 / literal=2, wire=0
  const result282 = f.querySkillInstanceIdBySkillSlotAndSkillConfigId(
    E.CharacterSkillSlot.NormalAttack,
    configId(281n)
  )
  const pinCheck283 = f.equal(result282, 0n)

  // querySkillInstanceListBySpecifiedSlot / query_skill_instance_list_by_specified_slot / genericId=200273 / literal=1, wire=0
  const pinCheck285 = f.greaterThanOrEqualTo(
    f.getListLength(f.querySkillInstanceListBySpecifiedSlot(E.CharacterSkillSlot.NormalAttack)),
    0n
  )

  // querySkillVariableValue / query_skill_variable_value / genericId=200259 / literal=1, wire=0
  const result287 = f.querySkillVariableValue(configId(286n))
  const pinCheck288 = f.equal(result287, 0)

  // queryWhetherPlayerIsCurrentlyInVoiceChat / query_whether_player_is_currently_in_voice_chat / genericId=200271 / literal=1, wire=0
  const result289 = f.queryWhetherPlayerIsCurrentlyInVoiceChat(self)
  const pinCheck290 = f.equal(result289, false)

  // radiansToDegrees / radians_to_degrees / genericId=200101 / literal=1, wire=0
  const result292 = f.radiansToDegrees(291.25)
  const pinCheck293 = f.equal(result292, 0)

  // screenCoordinatesToViewportCoordinates / screen_coordinates_to_viewport_coordinates / genericId=200290 / literal=2, wire=0
  const result296 = f.screenCoordinatesToViewportCoordinates(294.25, 295.25)
  const pinCheck297 = f.equal(result296.viewportX, 0)
  const pinCheck298 = f.equal(result296.viewportY, 0)

  // screenCoordinatesToWorldCoordinates / screen_coordinates_to_world_coordinates / genericId=200292 / literal=2, wire=1
  const result301 = f.screenCoordinatesToWorldCoordinates(299.25, 300.25, wireFloat)
  const pinCheck302 = f.equal(result301, [0, 0, 0])

  // sineFunction / sine_function / genericId=200094 / literal=0, wire=1
  const result303 = f.sineFunction(wireFloat)
  const pinCheck304 = f.equal(result303, 0)

  // split3dVector / split3d_vector / genericId=200065 / literal=1, wire=0
  const result306 = f.split3dVector([305, 306, 307])
  const pinCheck307 = f.equal(result306.xComponent, 0)
  const pinCheck308 = f.equal(result306.yComponent, 0)
  const pinCheck309 = f.equal(result306.zComponent, 0)

  // subtraction / subtraction / genericId=200012 / literal=2, wire=0
  const result312 = f.subtraction(310n, 311n)
  const pinCheck313 = f.equal(result312, 0n)

  // tangentFunction / tangent_function / genericId=200096 / literal=0, wire=1
  const result314 = f.tangentFunction(wireFloat)
  const pinCheck315 = f.equal(result314, 0)

  // viewportCoordinatesToScreenCoordinates / viewport_coordinates_to_screen_coordinates / genericId=200291 / literal=2, wire=0
  const result318 = f.viewportCoordinatesToScreenCoordinates(316.25, 317.25)
  const pinCheck319 = f.equal(result318.screenX, 0)
  const pinCheck320 = f.equal(result318.screenY, 0)

  // whetherTheEntityHasTheSpecifiedUnitStatus / whether_the_entity_has_the_specified_unit_status / genericId=200243 / literal=1, wire=1
  const result322 = f.whetherTheEntityHasTheSpecifiedUnitStatus(wireEntity, configId(321n))
  const pinCheck323 = f.equal(result322, false)

  // worldCoordinatesToScreenCoordinates / world_coordinates_to_screen_coordinates / genericId=200293 / literal=0, wire=1
  const result325 = f.worldCoordinatesToScreenCoordinates(wireVec3)
  const pinCheck326 = f.equal(result325.screenX, 0)
  const pinCheck327 = f.equal(result325.screenY, 0)

  const combinedCheck332 = f.logicalAndOperation(pinCheck4, pinCheck8)
  const combinedCheck333 = f.logicalAndOperation(pinCheck12, pinCheck16)
  const combinedCheck334 = f.logicalAndOperation(pinCheck19, pinCheck22)
  const combinedCheck335 = f.logicalAndOperation(pinCheck26, pinCheck30)
  const combinedCheck336 = f.logicalAndOperation(pinCheck33, pinCheck36)
  const combinedCheck337 = f.logicalAndOperation(pinCheck40, pinCheck43)
  const combinedCheck338 = f.logicalAndOperation(pinCheck46, pinCheck49)
  const combinedCheck339 = f.logicalAndOperation(pinCheck53, pinCheck56)
  const combinedCheck340 = f.logicalAndOperation(pinCheck58, pinCheck60)
  const combinedCheck341 = f.logicalAndOperation(pinCheck65, pinCheck67)
  const combinedCheck342 = f.logicalAndOperation(pinCheck69, pinCheck72)
  const combinedCheck343 = f.logicalAndOperation(pinCheck76, pinCheck78)
  const combinedCheck344 = f.logicalAndOperation(pinCheck80, pinCheck84)
  const combinedCheck345 = f.logicalAndOperation(pinCheck88, pinCheck92)
  const combinedCheck346 = f.logicalAndOperation(pinCheck94, pinCheck96)
  const combinedCheck347 = f.logicalAndOperation(pinCheck99, pinCheck101)
  const combinedCheck348 = f.logicalAndOperation(pinCheck104, pinCheck106)
  const combinedCheck349 = f.logicalAndOperation(pinCheck108, pinCheck110)
  const combinedCheck350 = f.logicalAndOperation(pinCheck112, pinCheck113)
  const combinedCheck351 = f.logicalAndOperation(pinCheck115, pinCheck116)
  const combinedCheck352 = f.logicalAndOperation(pinCheck118, pinCheck119)
  const combinedCheck353 = f.logicalAndOperation(pinCheck120, pinCheck122)
  const combinedCheck354 = f.logicalAndOperation(pinCheck123, pinCheck124)
  const combinedCheck355 = f.logicalAndOperation(pinCheck126, pinCheck127)
  const combinedCheck356 = f.logicalAndOperation(pinCheck129, pinCheck130)
  const combinedCheck357 = f.logicalAndOperation(pinCheck134, pinCheck136)
  const combinedCheck358 = f.logicalAndOperation(pinCheck137, pinCheck139)
  const combinedCheck359 = f.logicalAndOperation(pinCheck141, pinCheck143)
  const combinedCheck360 = f.logicalAndOperation(pinCheck145, pinCheck147)
  const combinedCheck361 = f.logicalAndOperation(pinCheck150, pinCheck152)
  const combinedCheck362 = f.logicalAndOperation(pinCheck154, pinCheck156)
  const combinedCheck363 = f.logicalAndOperation(pinCheck158, pinCheck160)
  const combinedCheck364 = f.logicalAndOperation(pinCheck162, pinCheck164)
  const combinedCheck365 = f.logicalAndOperation(pinCheck166, pinCheck168)
  const combinedCheck366 = f.logicalAndOperation(pinCheck169, pinCheck172)
  const combinedCheck367 = f.logicalAndOperation(pinCheck174, pinCheck177)
  const combinedCheck368 = f.logicalAndOperation(pinCheck178, pinCheck181)
  const combinedCheck369 = f.logicalAndOperation(pinCheck182, pinCheck183)
  const combinedCheck370 = f.logicalAndOperation(pinCheck184, pinCheck187)
  const combinedCheck371 = f.logicalAndOperation(pinCheck189, pinCheck194)
  const combinedCheck372 = f.logicalAndOperation(pinCheck195, pinCheck198)
  const combinedCheck373 = f.logicalAndOperation(pinCheck200, pinCheck203)
  const combinedCheck374 = f.logicalAndOperation(pinCheck205, pinCheck208)
  const combinedCheck375 = f.logicalAndOperation(pinCheck210, pinCheck212)
  const combinedCheck376 = f.logicalAndOperation(pinCheck214, pinCheck216)
  const combinedCheck377 = f.logicalAndOperation(pinCheck218, pinCheck220)
  const combinedCheck378 = f.logicalAndOperation(pinCheck224, pinCheck228)
  const combinedCheck379 = f.logicalAndOperation(pinCheck231, pinCheck235)
  const combinedCheck380 = f.logicalAndOperation(pinCheck237, pinCheck241)
  const combinedCheck381 = f.logicalAndOperation(pinCheck245, pinCheck249)
  const combinedCheck382 = f.logicalAndOperation(pinCheck252, pinCheck254)
  const combinedCheck383 = f.logicalAndOperation(pinCheck256, pinCheck259)
  const combinedCheck384 = f.logicalAndOperation(pinCheck261, pinCheck263)
  const combinedCheck385 = f.logicalAndOperation(pinCheck265, pinCheck268)
  const combinedCheck386 = f.logicalAndOperation(pinCheck271, pinCheck273)
  const combinedCheck387 = f.logicalAndOperation(pinCheck275, pinCheck277)
  const combinedCheck388 = f.logicalAndOperation(pinCheck280, pinCheck283)
  const combinedCheck389 = f.logicalAndOperation(pinCheck285, pinCheck288)
  const combinedCheck390 = f.logicalAndOperation(pinCheck290, pinCheck293)
  const combinedCheck391 = f.logicalAndOperation(pinCheck297, pinCheck298)
  const combinedCheck392 = f.logicalAndOperation(pinCheck302, pinCheck304)
  const combinedCheck393 = f.logicalAndOperation(pinCheck307, pinCheck308)
  const combinedCheck394 = f.logicalAndOperation(pinCheck309, pinCheck313)
  const combinedCheck395 = f.logicalAndOperation(pinCheck315, pinCheck319)
  const combinedCheck396 = f.logicalAndOperation(pinCheck320, pinCheck323)
  const combinedCheck397 = f.logicalAndOperation(pinCheck326, pinCheck327)
  const combinedCheck398 = f.logicalAndOperation(pinCheck328, pinCheck329)
  const combinedCheck399 = f.logicalAndOperation(pinCheck330, pinCheck331)
  const combinedCheck400 = f.logicalAndOperation(combinedCheck332, combinedCheck333)
  const combinedCheck401 = f.logicalAndOperation(combinedCheck334, combinedCheck335)
  const combinedCheck402 = f.logicalAndOperation(combinedCheck336, combinedCheck337)
  const combinedCheck403 = f.logicalAndOperation(combinedCheck338, combinedCheck339)
  const combinedCheck404 = f.logicalAndOperation(combinedCheck340, combinedCheck341)
  const combinedCheck405 = f.logicalAndOperation(combinedCheck342, combinedCheck343)
  const combinedCheck406 = f.logicalAndOperation(combinedCheck344, combinedCheck345)
  const combinedCheck407 = f.logicalAndOperation(combinedCheck346, combinedCheck347)
  const combinedCheck408 = f.logicalAndOperation(combinedCheck348, combinedCheck349)
  const combinedCheck409 = f.logicalAndOperation(combinedCheck350, combinedCheck351)
  const combinedCheck410 = f.logicalAndOperation(combinedCheck352, combinedCheck353)
  const combinedCheck411 = f.logicalAndOperation(combinedCheck354, combinedCheck355)
  const combinedCheck412 = f.logicalAndOperation(combinedCheck356, combinedCheck357)
  const combinedCheck413 = f.logicalAndOperation(combinedCheck358, combinedCheck359)
  const combinedCheck414 = f.logicalAndOperation(combinedCheck360, combinedCheck361)
  const combinedCheck415 = f.logicalAndOperation(combinedCheck362, combinedCheck363)
  const combinedCheck416 = f.logicalAndOperation(combinedCheck364, combinedCheck365)
  const combinedCheck417 = f.logicalAndOperation(combinedCheck366, combinedCheck367)
  const combinedCheck418 = f.logicalAndOperation(combinedCheck368, combinedCheck369)
  const combinedCheck419 = f.logicalAndOperation(combinedCheck370, combinedCheck371)
  const combinedCheck420 = f.logicalAndOperation(combinedCheck372, combinedCheck373)
  const combinedCheck421 = f.logicalAndOperation(combinedCheck374, combinedCheck375)
  const combinedCheck422 = f.logicalAndOperation(combinedCheck376, combinedCheck377)
  const combinedCheck423 = f.logicalAndOperation(combinedCheck378, combinedCheck379)
  const combinedCheck424 = f.logicalAndOperation(combinedCheck380, combinedCheck381)
  const combinedCheck425 = f.logicalAndOperation(combinedCheck382, combinedCheck383)
  const combinedCheck426 = f.logicalAndOperation(combinedCheck384, combinedCheck385)
  const combinedCheck427 = f.logicalAndOperation(combinedCheck386, combinedCheck387)
  const combinedCheck428 = f.logicalAndOperation(combinedCheck388, combinedCheck389)
  const combinedCheck429 = f.logicalAndOperation(combinedCheck390, combinedCheck391)
  const combinedCheck430 = f.logicalAndOperation(combinedCheck392, combinedCheck393)
  const combinedCheck431 = f.logicalAndOperation(combinedCheck394, combinedCheck395)
  const combinedCheck432 = f.logicalAndOperation(combinedCheck396, combinedCheck397)
  const combinedCheck433 = f.logicalAndOperation(combinedCheck398, combinedCheck399)
  const combinedCheck434 = f.logicalAndOperation(combinedCheck400, combinedCheck401)
  const combinedCheck435 = f.logicalAndOperation(combinedCheck402, combinedCheck403)
  const combinedCheck436 = f.logicalAndOperation(combinedCheck404, combinedCheck405)
  const combinedCheck437 = f.logicalAndOperation(combinedCheck406, combinedCheck407)
  const combinedCheck438 = f.logicalAndOperation(combinedCheck408, combinedCheck409)
  const combinedCheck439 = f.logicalAndOperation(combinedCheck410, combinedCheck411)
  const combinedCheck440 = f.logicalAndOperation(combinedCheck412, combinedCheck413)
  const combinedCheck441 = f.logicalAndOperation(combinedCheck414, combinedCheck415)
  const combinedCheck442 = f.logicalAndOperation(combinedCheck416, combinedCheck417)
  const combinedCheck443 = f.logicalAndOperation(combinedCheck418, combinedCheck419)
  const combinedCheck444 = f.logicalAndOperation(combinedCheck420, combinedCheck421)
  const combinedCheck445 = f.logicalAndOperation(combinedCheck422, combinedCheck423)
  const combinedCheck446 = f.logicalAndOperation(combinedCheck424, combinedCheck425)
  const combinedCheck447 = f.logicalAndOperation(combinedCheck426, combinedCheck427)
  const combinedCheck448 = f.logicalAndOperation(combinedCheck428, combinedCheck429)
  const combinedCheck449 = f.logicalAndOperation(combinedCheck430, combinedCheck431)
  const combinedCheck450 = f.logicalAndOperation(combinedCheck432, combinedCheck433)
  const combinedCheck451 = f.logicalAndOperation(combinedCheck434, combinedCheck435)
  const combinedCheck452 = f.logicalAndOperation(combinedCheck436, combinedCheck437)
  const combinedCheck453 = f.logicalAndOperation(combinedCheck438, combinedCheck439)
  const combinedCheck454 = f.logicalAndOperation(combinedCheck440, combinedCheck441)
  const combinedCheck455 = f.logicalAndOperation(combinedCheck442, combinedCheck443)
  const combinedCheck456 = f.logicalAndOperation(combinedCheck444, combinedCheck445)
  const combinedCheck457 = f.logicalAndOperation(combinedCheck446, combinedCheck447)
  const combinedCheck458 = f.logicalAndOperation(combinedCheck448, combinedCheck449)
  const combinedCheck459 = f.logicalAndOperation(combinedCheck451, combinedCheck452)
  const combinedCheck460 = f.logicalAndOperation(combinedCheck453, combinedCheck454)
  const combinedCheck461 = f.logicalAndOperation(combinedCheck455, combinedCheck456)
  const combinedCheck462 = f.logicalAndOperation(combinedCheck457, combinedCheck458)
  const combinedCheck463 = f.logicalAndOperation(combinedCheck459, combinedCheck460)
  const combinedCheck464 = f.logicalAndOperation(combinedCheck461, combinedCheck462)
  const combinedCheck465 = f.logicalAndOperation(combinedCheck463, combinedCheck464)
  const combinedCheck466 = f.logicalAndOperation(combinedCheck465, combinedCheck450)
  return f.dataTypeConversion(combinedCheck466, 'int')
})
