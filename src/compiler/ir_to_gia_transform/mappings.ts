import { ENUM_ID, ENUM_VALUE, NODE_ID } from '../gia_vendor.js'

const NODE_ID_LOWER = new Map<string, number>(
  Object.entries(NODE_ID).map(([key, id]) => [key.toLowerCase(), id])
)

const ENUM_ID_LOWER = new Map<string, number>(
  Object.entries(ENUM_ID).map(([key, id]) => [key.toLowerCase(), id])
)

const skippedEnumKeys = new Set([
  'Default',
  'True',
  'UIControlGroupStatus_On',
  'UIControlGroupStatus_Off',
  'UIControlGroupStatus_Hidden'
])

const ENUM_VALUE_LOWER = new Map<string, { enumId: number; enumValue: number }>(
  Object.keys(ENUM_VALUE)
    .filter((key) => !skippedEnumKeys.has(key))
    .map((key) => {
      const snakeCase = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
      const enumValue = ENUM_VALUE[key as keyof typeof ENUM_VALUE]

      const enumTypePrefix = key.split('_')[0]
      const enumIdKey = enumTypePrefix.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
      const enumId = ENUM_ID_LOWER.get(enumIdKey)
      if (!enumId) {
        throw new Error(`[error] unknown enum id: ${enumIdKey}`)
      }

      return [snakeCase, { enumId, enumValue }]
    })
)

export const ENUM_VALUE_MAPPINGS: Record<string, { enumId: number; enumValue: number }> = {
  // enum.ts 使用的是更直观的“单数”value key，但上游 vendor 的 ENUM_VALUE 多数是“复数”前缀；
  // 这里做一次性桥接，避免 parseEnumValue 找不到键
  comparison_operator_equal_to: {
    enumId: ENUM_ID.Comparison_Operators,
    enumValue: ENUM_VALUE.ComparisonOperators_EqualTo
  },
  comparison_operator_less_than: {
    enumId: ENUM_ID.Comparison_Operators,
    enumValue: ENUM_VALUE.ComparisonOperators_LessThan
  },
  comparison_operator_less_than_or_equal_to: {
    enumId: ENUM_ID.Comparison_Operators,
    enumValue: ENUM_VALUE.ComparisonOperators_LessThanOrEqualTo
  },
  comparison_operator_greater_than: {
    enumId: ENUM_ID.Comparison_Operators,
    enumValue: ENUM_VALUE.ComparisonOperators_GreaterThan
  },
  comparison_operator_greater_than_or_equal_to: {
    enumId: ENUM_ID.Comparison_Operators,
    enumValue: ENUM_VALUE.ComparisonOperators_GreaterThanOrEqualTo
  },

  logical_operator_and: {
    enumId: ENUM_ID.Logical_Operators,
    enumValue: ENUM_VALUE.LogicalOperators_AND
  },
  logical_operator_or: {
    enumId: ENUM_ID.Logical_Operators,
    enumValue: ENUM_VALUE.LogicalOperators_OR
  },
  logical_operator_xor: {
    enumId: ENUM_ID.Logical_Operators,
    enumValue: ENUM_VALUE.LogicalOperators_XOR
  },
  logical_operator_not: {
    enumId: ENUM_ID.Logical_Operators,
    enumValue: ENUM_VALUE.LogicalOperators_NOT
  },

  mathematical_operator_addition: {
    enumId: ENUM_ID.Mathematical_Operators,
    enumValue: ENUM_VALUE.MathematicalOperators_Addition
  },
  mathematical_operator_subtraction: {
    enumId: ENUM_ID.Mathematical_Operators,
    enumValue: ENUM_VALUE.MathematicalOperators_Subtraction
  },
  mathematical_operator_multiplication: {
    enumId: ENUM_ID.Mathematical_Operators,
    enumValue: ENUM_VALUE.MathematicalOperators_Multiplication
  },
  mathematical_operator_division: {
    enumId: ENUM_ID.Mathematical_Operators,
    enumValue: ENUM_VALUE.MathematicalOperators_Division
  },
  mathematical_operator_modulo_operation: {
    enumId: ENUM_ID.Mathematical_Operators,
    enumValue: ENUM_VALUE.MathematicalOperators_ModuloOperation
  },
  mathematical_operator_exponentiation: {
    enumId: ENUM_ID.Mathematical_Operators,
    enumValue: ENUM_VALUE.MathematicalOperators_Exponentiation
  },
  mathematical_operator_get_maximum_value: {
    enumId: ENUM_ID.Mathematical_Operators,
    enumValue: ENUM_VALUE.MathematicalOperators_GetMaximumValue
  },
  mathematical_operator_get_minimum_value: {
    enumId: ENUM_ID.Mathematical_Operators,
    enumValue: ENUM_VALUE.MathematicalOperators_GetMinimumValue
  },
  mathematical_operator_logarithm: {
    enumId: ENUM_ID.Mathematical_Operators,
    enumValue: ENUM_VALUE.MathematicalOperators_Logarithm
  },

  attack_shape_rectangle: {
    enumId: ENUM_ID.Attack_Shapes,
    enumValue: ENUM_VALUE.AttackShapes_Rectangle
  },
  attack_shape_sphere: {
    enumId: ENUM_ID.Attack_Shapes,
    enumValue: ENUM_VALUE.AttackShapes_Sphere
  },
  attack_shape_sector: {
    enumId: ENUM_ID.Attack_Shapes,
    enumValue: ENUM_VALUE.AttackShapes_Sector
  },

  type_conversion_integer_to_boolean: {
    enumId: ENUM_ID.Type_Conversions,
    enumValue: ENUM_VALUE.TypeConversions_IntegerToBoolean
  },
  type_conversion_integer_to_floating_point: {
    enumId: ENUM_ID.Type_Conversions,
    enumValue: ENUM_VALUE.TypeConversions_IntegerToFloatingPoint
  },
  type_conversion_integer_to_string: {
    enumId: ENUM_ID.Type_Conversions,
    enumValue: ENUM_VALUE.TypeConversions_IntegerToString
  },
  type_conversion_entity_to_string: {
    enumId: ENUM_ID.Type_Conversions,
    enumValue: ENUM_VALUE.TypeConversions_EntityToString
  },
  type_conversion_guid_to_string: {
    enumId: ENUM_ID.Type_Conversions,
    enumValue: ENUM_VALUE.TypeConversions_GUIDToString
  },
  type_conversion_boolean_to_integer: {
    enumId: ENUM_ID.Type_Conversions,
    enumValue: ENUM_VALUE.TypeConversions_BooleanToInteger
  },
  type_conversion_boolean_to_string: {
    enumId: ENUM_ID.Type_Conversions,
    enumValue: ENUM_VALUE.TypeConversions_BooleanToString
  },
  type_conversion_floating_point_to_integer: {
    enumId: ENUM_ID.Type_Conversions,
    enumValue: ENUM_VALUE.TypeConversions_FloatingPointToInteger
  },
  type_conversion_floating_point_to_string: {
    enumId: ENUM_ID.Type_Conversions,
    enumValue: ENUM_VALUE.TypeConversions_FloatingPointToString
  },
  type_conversion_vector_3_to_string: {
    enumId: ENUM_ID.Type_Conversions,
    enumValue: ENUM_VALUE.TypeConversions_3DVectorToString
  },
  type_conversion_faction_to_string: {
    enumId: ENUM_ID.Type_Conversions,
    enumValue: ENUM_VALUE.TypeConversions_FactionToString
  },

  motion_path_point_type_straight_line: {
    enumId: ENUM_ID.Motion_Path_Point_Types,
    enumValue: ENUM_VALUE.MotionPathPointTypes_StraightLine
  },
  motion_path_point_type_curve: {
    enumId: ENUM_ID.Motion_Path_Point_Types,
    enumValue: ENUM_VALUE.MotionPathPointTypes_Curve
  },

  motion_type_one_way: {
    enumId: ENUM_ID.Motion_Types,
    enumValue: ENUM_VALUE.MotionTypes_OneWay
  },
  motion_type_back_and_forth: {
    enumId: ENUM_ID.Motion_Types,
    enumValue: ENUM_VALUE.MotionTypes_BackAndForth
  },
  motion_type_cyclic_movement: {
    enumId: ENUM_ID.Motion_Types,
    enumValue: ENUM_VALUE.MotionTypes_CyclicMovement
  },

  original_slot_skill_handling_destroy: {
    enumId: ENUM_ID.Generic,
    enumValue: ENUM_VALUE.OriginalSlotSkillHandling_Destroy
  },
  original_slot_skill_handling_keep_slot_relation: {
    enumId: ENUM_ID.Generic,
    enumValue: ENUM_VALUE.OriginalSlotSkillHandling_KeepSlotRelation
  },
  original_slot_skill_handling_detach_from_slot_relation: {
    enumId: ENUM_ID.Generic,
    enumValue: ENUM_VALUE.OriginalSlotSkillHandling_DetachFromSlotRelation
  },

  existing_skill_handling_clear_all: {
    enumId: ENUM_ID.Generic,
    enumValue: ENUM_VALUE.ExistingSkillHandling_ClearAll
  },
  existing_skill_handling_keep_irrelevant_skills: {
    enumId: ENUM_ID.Generic,
    enumValue: ENUM_VALUE.ExistingSkillHandling_KeepIrrelevantSkills
  },

  trigonometric_function_cos: {
    enumId: ENUM_ID.Trigonometric_Functions,
    enumValue: ENUM_VALUE.TrigonometricFunctions_cos
  },
  trigonometric_function_sin: {
    enumId: ENUM_ID.Trigonometric_Functions,
    enumValue: ENUM_VALUE.TrigonometricFunctions_sin
  },
  trigonometric_function_tan: {
    enumId: ENUM_ID.Trigonometric_Functions,
    enumValue: ENUM_VALUE.TrigonometricFunctions_tan
  },
  trigonometric_function_arccos: {
    enumId: ENUM_ID.Trigonometric_Functions,
    enumValue: ENUM_VALUE.TrigonometricFunctions_arccos
  },
  trigonometric_function_arcsin: {
    enumId: ENUM_ID.Trigonometric_Functions,
    enumValue: ENUM_VALUE.TrigonometricFunctions_arcsin
  },
  trigonometric_function_arctan: {
    enumId: ENUM_ID.Trigonometric_Functions,
    enumValue: ENUM_VALUE.TrigonometricFunctions_arctan
  },
  trigonometric_function_radians_to_degrees: {
    enumId: ENUM_ID.Trigonometric_Functions,
    enumValue: ENUM_VALUE.TrigonometricFunctions_RadiansToDegrees
  },
  trigonometric_function_degrees_to_radians: {
    enumId: ENUM_ID.Trigonometric_Functions,
    enumValue: ENUM_VALUE.TrigonometricFunctions_DegreesToRadians
  },

  sort_by_ascending: {
    enumId: ENUM_ID.Sorting_Rules,
    enumValue: ENUM_VALUE.SortingRules_Ascending
  },
  sort_by_descending: {
    enumId: ENUM_ID.Sorting_Rules,
    enumValue: ENUM_VALUE.SortingRules_Descending
  },
  character_skill_slot_normal_attack: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_NormalAttack
  },
  character_skill_slot_dash_skill: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_DashSkill
  },
  character_skill_slot_skill_1_e: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_1E
  },
  character_skill_slot_skill_2_q: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_2Q
  },
  character_skill_slot_skill_3_r: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_3R
  },
  character_skill_slot_skill_4_t: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_4T
  },
  character_skill_slot_custom_skill_slot_1: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot1
  },
  character_skill_slot_custom_skill_slot_2: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot2
  },
  character_skill_slot_custom_skill_slot_3: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot3
  },
  character_skill_slot_custom_skill_slot_4: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot4
  },
  character_skill_slot_custom_skill_slot_5: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot5
  },
  character_skill_slot_custom_skill_slot_6: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot6
  },
  character_skill_slot_custom_skill_slot_7: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot7
  },
  character_skill_slot_custom_skill_slot_8: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot8
  },
  character_skill_slot_custom_skill_slot_9: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot9
  },
  character_skill_slot_custom_skill_slot_10: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot10
  },
  character_skill_slot_custom_skill_slot_11: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot11
  },
  character_skill_slot_custom_skill_slot_12: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot12
  },
  character_skill_slot_custom_skill_slot_13: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot13
  },
  character_skill_slot_custom_skill_slot_14: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot14
  },
  character_skill_slot_custom_skill_slot_15: {
    enumId: ENUM_ID.Skill_Slot,
    enumValue: ENUM_VALUE.SkillSlot_CustomSkillSlot15
  },
  damage_pop_up_type_no_pop_up: {
    enumId: ENUM_ID.Damage_Pop_Up_Type,
    enumValue: 5400
  },
  damage_pop_up_type_normal_pop_up: {
    enumId: ENUM_ID.Damage_Pop_Up_Type,
    enumValue: 5401
  },
  damage_pop_up_type_crit_hit_pop_up: {
    enumId: ENUM_ID.Damage_Pop_Up_Type,
    enumValue: 5402
  },
  follow_coordinate_system_relative_coordinate_system: {
    enumId: ENUM_ID.Coordinate_System_Type,
    enumValue: ENUM_VALUE.CoordinateSystemType_RelativeCoordinateSystem
  },
  follow_coordinate_system_world_coordinate_system: {
    enumId: ENUM_ID.Coordinate_System_Type,
    enumValue: ENUM_VALUE.CoordinateSystemType_WorldCoordinateSystem
  },
  removal_method_all_coexisting_statuses_with_the_same_name: {
    enumId: ENUM_ID.Unit_Status_Removal_Strategy,
    enumValue: ENUM_VALUE.UnitStatusRemovalStrategy_AllCoexistingStatusesWithTheSameName
  },
  removal_method_status_with_fastest_stack_loss: {
    enumId: ENUM_ID.Unit_Status_Removal_Strategy,
    enumValue: ENUM_VALUE.UnitStatusRemovalStrategy_StatusWithFastestStackLoss
  },
  rounding_mode_round_to_nearest: {
    enumId: ENUM_ID.Rounding_Logic,
    enumValue: ENUM_VALUE.RoundingLogic_RoundToNearest
  },
  rounding_mode_round_up: {
    enumId: ENUM_ID.Rounding_Logic,
    enumValue: ENUM_VALUE.RoundingLogic_RoundUp
  },
  rounding_mode_round_down: {
    enumId: ENUM_ID.Rounding_Logic,
    enumValue: ENUM_VALUE.RoundingLogic_RoundDown
  },
  rounding_mode_truncate: {
    enumId: ENUM_ID.Rounding_Logic,
    enumValue: ENUM_VALUE.RoundingLogic_Truncate
  },
  scan_rule_type_prioritize_view: {
    enumId: ENUM_ID.Scan_Rule_Type,
    enumValue: 5100
  },
  scan_rule_type_prioritize_distance: {
    enumId: ENUM_ID.Scan_Rule_Type,
    enumValue: 5101
  },
  settlement_status_undefined: {
    enumId: ENUM_ID.Settlement_Status,
    enumValue: ENUM_VALUE.SettlementStatus_TBC
  },
  settlement_status_victory: {
    enumId: ENUM_ID.Settlement_Status,
    enumValue: ENUM_VALUE.SettlementStatus_Victory
  },
  settlement_status_defeat: {
    enumId: ENUM_ID.Settlement_Status,
    enumValue: ENUM_VALUE.SettlementStatus_Failed
  },
  ui_control_group_status_off: {
    enumId: ENUM_ID.UI_Control_Group_Status,
    enumValue: ENUM_VALUE.UIControlGroupStatus_Off
  },
  ui_control_group_status_on: {
    enumId: ENUM_ID.UI_Control_Group_Status,
    enumValue: ENUM_VALUE.UIControlGroupStatus_On
  },
  ui_control_group_status_hidden: {
    enumId: ENUM_ID.UI_Control_Group_Status,
    enumValue: ENUM_VALUE.UIControlGroupStatus_Hidden
  }
}

export const SPECIAL_NODE_IDS: Record<string, number> = {
  send_signal: 300000,
  monitor_signal: 300001,
  assemble_structure: 300002,
  split_structure: 300003,
  modify_structure: 300004
}

export const SPECIAL_NODE_MAPPINGS: Record<string, string> = {
  player_plays_one_shot2d_sound_effect: 'player_plays_one_shot_2d_sound_effect',
  query_timestamp_utc0: 'query_timestamp_utc_0',
  split3d_vector: 'split_3d_vector',
  create3d_vector: 'create_3d_vector',
  get_entity_list_by_specified_prefab_id: 'get_entity_list_by_specified_prefab',
  get_all_items_from_loot_component: 'get_all_trophy_items',
  get_all_currency_from_loot_component: 'get_all_trophy_currency'
}

export function parseEnumValue(
  value: string,
  index: number,
  nodeType: string
): { enumId: number; enumValue: number } {
  const mapping = ENUM_VALUE_MAPPINGS[value]
  if (mapping) return mapping

  const result = ENUM_VALUE_LOWER.get(value)
  if (result) return result

  throw new Error(`[error] unknown enum value "${value}" at arg #${index} of ${nodeType}`)
}

export function getNodeIdLowerMap() {
  return NODE_ID_LOWER
}

export function getEnumIdLowerMap() {
  return ENUM_ID_LOWER
}
