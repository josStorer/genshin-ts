import { SimplifyDeep } from 'type-fest'

import { enumeration } from '../runtime/value.js'
import type { ClientEnumerationTypeMap } from './client_enums.js'

// HitLevel became a server enum in November. Retain the existing client import
// and constructor identity while exposing it through the shared enum module.
export { HitLevel } from './client_enums.js'

export type EnumerationType = SimplifyDeep<keyof EnumerationTypeMap>
export type EnumerationTypeMap = ClientEnumerationTypeMap & {
  ComparisonOperator: ComparisonOperator
  SortBy: SortBy
  RandomOrder: RandomOrder
  DamagePopUpType: DamagePopUpType
  MovementMode: MovementMode
  FixedMotionParameterType: FixedMotionParameterType
  ColorOverlayType: ColorOverlayType
  FillMaterial: FillMaterial
  FollowCoordinateSystem: FollowCoordinateSystem
  FollowLocationType: FollowLocationType
  RemovalMethod: UnitStatusRemovalStrategy
  UIControlGroupStatus: UIControlGroupStatus
  DisruptorDeviceType: DisruptorDeviceType
  DisruptorDeviceOrientation: DisruptorDeviceOrientation
  CharacterSkillSlot: CharacterSkillSlot
  OriginalSlotSkillHandling: OriginalSlotSkillHandling
  ExistingSkillHandling: ExistingSkillHandling
  SoundAttenuationMode: SoundAttenuationMode
  LogicalOperator: LogicalOperator
  MathematicalOperator: MathematicalOperator
  TrigonometricFunction: TrigonometricFunction
  AttackShape: AttackShape
  SurvivalStatus: SurvivalStatus
  TypeConversion: TypeConversion
  MotionPathPointType: MotionPathPointType
  MotionType: MotionType
  DecisionRefreshMode: DecisionRefreshMode
  SettlementStatus: SettlementStatus
  RankSettlementStatus: RankSettlementStatus
  ItemLootType: ItemLootType
  ScanRuleType: ScanRuleType
  RoundingMode: RoundingMode
  EntityType: EntityType
  CauseOfBeingDown: CauseOfBeingDown
  ElementalType: ElementalType
  TargetType: TargetType
  TriggerRestriction: TriggerRestriction
  HitType: HitType
  AttackType: AttackType
  HitPerformanceLevel: HitPerformanceLevel
  UnitStatusAdditionResult: UnitStatusAdditionResult
  UnitStatusRemovalStrategy: UnitStatusRemovalStrategy
  RevivePointSelectionStrategy: RevivePointSelectionStrategy
  InterruptStatus: InterruptStatus
  GameplayMode: GameplayMode
  InputDeviceType: InputDeviceType
  UnitStatusRemovalReason: UnitStatusRemovalReason
  ElementalReactionType: ElementalReactionType
  SelectCompletionReason: SelectCompletionReason
  ReasonForItemChange: ReasonForItemChange
}

/** 排序规则 */
export class SortBy extends enumeration {
  declare private readonly __brandSortBy: 'SortBy'
  private constructor() {
    super('')
    // 防止用户通过字符串传参构造枚举导致的意外行为
    throw new Error('you should not create an enum instance')
  }

  /**
   * Ascending
   *
   * 顺序（从小到大）
   */
  static readonly Ascending = new enumeration('SortBy', 'sort_by_ascending') as SortBy
  /**
   * Descending
   *
   * 逆序（从大到小）
   */
  static readonly Descending = new enumeration('SortBy', 'sort_by_descending') as SortBy
}

/**
 * Random Order
 *
 * 随机排序
 */
export class RandomOrder extends enumeration {
  declare private readonly __brandRandomOrder: 'RandomOrder'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Sorting Rules_Random
   *
   * 排序规则_随机
   */
  static readonly Random = new enumeration('RandomOrder', 'random_order_random') as RandomOrder
}

/** 伤害跳字类型 */
export class DamagePopUpType extends enumeration {
  declare private readonly __brandDamagePopUpType: 'DamagePopUpType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * No Pop-Up
   *
   * 无跳字
   */
  static readonly NoPopUp = new enumeration(
    'DamagePopUpType',
    'damage_pop_up_type_no_pop_up'
  ) as DamagePopUpType
  /**
   * Normal Pop-Up
   *
   * 普通跳字
   */
  static readonly NormalPopUp = new enumeration(
    'DamagePopUpType',
    'damage_pop_up_type_normal_pop_up'
  ) as DamagePopUpType
  /**
   * CRIT Hit Pop-Up
   *
   * 暴击跳字
   */
  static readonly CritHitPopUp = new enumeration(
    'DamagePopUpType',
    'damage_pop_up_type_crit_hit_pop_up'
  ) as DamagePopUpType
}

/** 移动方式 */
export class MovementMode extends enumeration {
  declare private readonly __brandMovementMode: 'MovementMode'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Instant Movement
   *
   * 瞬间移动
   */
  static readonly InstantMovement = new enumeration(
    'MovementMode',
    'movement_mode_instant_movement'
  ) as MovementMode
  /**
   * Uniform Linear Motion
   *
   * 匀速直线运动
   */
  static readonly UniformLinearMotion = new enumeration(
    'MovementMode',
    'movement_mode_uniform_linear_motion'
  ) as MovementMode
}

/**
 * Fixed-Point Motion Device Motion Type
 *
 * 定点运动器运动类型
 *
 * Alias of {@link MovementMode}; both names refer to the same enum type.
 *
 * {@link MovementMode} 的别名；两个名称指向同一枚举类型。
 */
export { MovementMode as FixedPointMotionDeviceMotionType }

/** 定点运动器参数转化类型 */
export class FixedMotionParameterType extends enumeration {
  declare private readonly __brandFixedMotionParameterType: 'FixedMotionParameterType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Fixed Speed
   *
   * 固定速度
   */
  static readonly FixedSpeed = new enumeration(
    'FixedMotionParameterType',
    'fixed_motion_parameter_type_fixed_speed'
  ) as FixedMotionParameterType
  /**
   * Fixed Time
   *
   * 固定时间
   */
  static readonly FixedTime = new enumeration(
    'FixedMotionParameterType',
    'fixed_motion_parameter_type_fixed_time'
  ) as FixedMotionParameterType
}

/**
 * Fixed-Point Motion Device Parameter Conversion Type
 *
 * 定点运动器参数转化类型
 *
 * Alias of {@link FixedMotionParameterType}; both names refer to the same enum type.
 *
 * {@link FixedMotionParameterType} 的别名；两个名称指向同一枚举类型。
 */
export { FixedMotionParameterType as FixedPointMotionDeviceParameterConversionType }

/** 颜色叠加类型 */
export class ColorOverlayType extends enumeration {
  declare private readonly __brandColorOverlayType: 'ColorOverlayType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Overwrite
   *
   * 覆盖
   */
  static readonly Overwrite = new enumeration(
    'ColorOverlayType',
    'color_overlay_type_overwrite'
  ) as ColorOverlayType

  /**
   * Override
   *
   * 覆盖
   *
   * Alias of {@link Overwrite}; both names refer to the same enum value.
   *
   * {@link Overwrite} 的别名；两个名称指向同一枚举值。
   */
  static readonly Override = ColorOverlayType.Overwrite

  /**
   * Multiply
   *
   * 正片叠底
   */
  static readonly Multiply = new enumeration(
    'ColorOverlayType',
    'color_overlay_type_multiply'
  ) as ColorOverlayType
}

/**
 * Color Blend Type
 *
 * 颜色叠加类型
 *
 * Alias of {@link ColorOverlayType}; both names refer to the same enum type.
 *
 * {@link ColorOverlayType} 的别名；两个名称指向同一枚举类型。
 */
export { ColorOverlayType as ColorBlendType }

/** 填充材质 */
export class FillMaterial extends enumeration {
  declare private readonly __brandFillMaterial: 'FillMaterial'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Frozen
   *
   * 冰冻
   */
  static readonly Frozen = new enumeration('FillMaterial', 'fill_material_frozen') as FillMaterial

  /**
   * Freeze
   *
   * 冰冻
   *
   * Alias of {@link Frozen}; both names refer to the same enum value.
   *
   * {@link Frozen} 的别名；两个名称指向同一枚举值。
   */
  static readonly Freeze = FillMaterial.Frozen

  /**
   * Petrified
   *
   * 石化
   */
  static readonly Petrified = new enumeration(
    'FillMaterial',
    'fill_material_petrified'
  ) as FillMaterial

  /**
   * Petrification
   *
   * 石化
   *
   * Alias of {@link Petrified}; both names refer to the same enum value.
   *
   * {@link Petrified} 的别名；两个名称指向同一枚举值。
   */
  static readonly Petrification = FillMaterial.Petrified
}

/** 跟随坐标系 */
export class FollowCoordinateSystem extends enumeration {
  declare private readonly __brandFollowCoordinateSystem: 'FollowCoordinateSystem'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Relative Coordinate System
   *
   * 相对坐标系
   */
  static readonly RelativeCoordinateSystem = new enumeration(
    'FollowCoordinateSystem',
    'follow_coordinate_system_relative_coordinate_system'
  ) as FollowCoordinateSystem

  /**
   * Local Coordinate System
   *
   * 相对坐标系
   *
   * Alias of {@link RelativeCoordinateSystem}; both names refer to the same enum value.
   *
   * {@link RelativeCoordinateSystem} 的别名；两个名称指向同一枚举值。
   */
  static readonly LocalCoordinateSystem = FollowCoordinateSystem.RelativeCoordinateSystem
  /**
   * World Coordinate System
   *
   * 世界坐标系
   */
  static readonly WorldCoordinateSystem = new enumeration(
    'FollowCoordinateSystem',
    'follow_coordinate_system_world_coordinate_system'
  ) as FollowCoordinateSystem
}

/**
 * Coordinate System Type
 *
 * 坐标系类型
 *
 * Alias of {@link FollowCoordinateSystem}; both names refer to the same enum type.
 *
 * {@link FollowCoordinateSystem} 的别名；两个名称指向同一枚举类型。
 */
export { FollowCoordinateSystem as CoordinateSystemType }

/** 跟随类型 */
export class FollowLocationType extends enumeration {
  declare private readonly __brandFollowLocationType: 'FollowLocationType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Completely Follow
   *
   * 完全跟随
   */
  static readonly CompletelyFollow = new enumeration(
    'FollowLocationType',
    'follow_location_type_completely_follow'
  ) as FollowLocationType
  /**
   * Follow Location
   *
   * 跟随位置
   */
  static readonly FollowLocation = new enumeration(
    'FollowLocationType',
    'follow_location_type_follow_location'
  ) as FollowLocationType
  /**
   * Follow Rotation
   *
   * 跟随旋转
   */
  static readonly FollowRotation = new enumeration(
    'FollowLocationType',
    'follow_location_type_follow_rotation'
  ) as FollowLocationType
}

/** 界面控件组状态 */
export class UIControlGroupStatus extends enumeration {
  declare private readonly __brandUIControlGroupStatus: 'UIControlGroupStatus'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Off
   *
   * 界面控件组状态_关闭：不可见且逻辑不运行
   */
  static readonly Off = new enumeration(
    'UIControlGroupStatus',
    'ui_control_group_status_off'
  ) as UIControlGroupStatus
  /**
   * On
   *
   * 界面控件组状态_开启：可见+逻辑正常运行
   */
  static readonly On = new enumeration(
    'UIControlGroupStatus',
    'ui_control_group_status_on'
  ) as UIControlGroupStatus
  /**
   * Hidden
   *
   * 界面控件组状态_隐藏：不可见+逻辑正常运行
   */
  static readonly Hidden = new enumeration(
    'UIControlGroupStatus',
    'ui_control_group_status_hidden'
  ) as UIControlGroupStatus
}

/** 扰动装置类型 */
export class DisruptorDeviceType extends enumeration {
  declare private readonly __brandDisruptorDeviceType: 'DisruptorDeviceType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Force Field Device
   *
   * 力场器
   */
  static readonly ForceFieldDevice = new enumeration(
    'DisruptorDeviceType',
    'disruptor_device_type_force_field_device'
  ) as DisruptorDeviceType
  /**
   * Ejector
   *
   * 弹射器
   */
  static readonly Ejector = new enumeration(
    'DisruptorDeviceType',
    'disruptor_device_type_ejector'
  ) as DisruptorDeviceType
  /**
   * Tractor Device
   *
   * 牵引器
   */
  static readonly TractorDevice = new enumeration(
    'DisruptorDeviceType',
    'disruptor_device_type_tractor_device'
  ) as DisruptorDeviceType
}

/**
 * Disruptor Device Types
 *
 * 扰动装置类型
 *
 * Alias of {@link DisruptorDeviceType}; both names refer to the same enum type.
 *
 * {@link DisruptorDeviceType} 的别名；两个名称指向同一枚举类型。
 */
export { DisruptorDeviceType as DisruptorDeviceTypes }

/** 扰动装置朝向 */
export class DisruptorDeviceOrientation extends enumeration {
  declare private readonly __brandDisruptorDeviceOrientation: 'DisruptorDeviceOrientation'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Associate Character Orientation
   *
   * 关联角色朝向
   */
  static readonly AssociateCharacterOrientation = new enumeration(
    'DisruptorDeviceOrientation',
    'disruptor_device_orientation_associate_character_orientation'
  ) as DisruptorDeviceOrientation
  /**
   * Fixed Unidirectional
   *
   * 固定单向
   */
  static readonly FixedUnidirectional = new enumeration(
    'DisruptorDeviceOrientation',
    'disruptor_device_orientation_fixed_unidirectional'
  ) as DisruptorDeviceOrientation
}

/** 技能槽位 */
export class CharacterSkillSlot extends enumeration {
  declare private readonly __brandCharacterSkillSlot: 'CharacterSkillSlot'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Normal Attack
   *
   * 普通攻击
   */
  static readonly NormalAttack = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_normal_attack'
  ) as CharacterSkillSlot
  /**
   * Dash Skill
   *
   * 冲刺技能
   */
  static readonly DashSkill = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_dash_skill'
  ) as CharacterSkillSlot

  /**
   * Sprint Skill
   *
   * 冲刺技能
   *
   * Alias of {@link DashSkill}; both names refer to the same enum value.
   *
   * {@link DashSkill} 的别名；两个名称指向同一枚举值。
   */
  static readonly SprintSkill = CharacterSkillSlot.DashSkill
  /**
   * Jump Skill
   * 跳跃技能: 跳跃技能槽位。
   */
  static readonly JumpSkill = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_jump_skill'
  ) as CharacterSkillSlot
  /**
   * Skill 1-E
   *
   * 技能1-E
   */
  static readonly Skill1E = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_skill_1_e'
  ) as CharacterSkillSlot
  /**
   * Skill 2-Q
   *
   * 技能2-Q
   */
  static readonly Skill2Q = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_skill_2_q'
  ) as CharacterSkillSlot
  /**
   * Skill 3-R
   *
   * 技能3-R
   */
  static readonly Skill3R = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_skill_3_r'
  ) as CharacterSkillSlot
  /**
   * Skill 4-T
   *
   * 技能4-T
   */
  static readonly Skill4T = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_skill_4_t'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 1
   *
   * 自定义技能槽位1
   */
  static readonly CustomSkillSlot1 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_1'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 2
   *
   * 自定义技能槽位2
   */
  static readonly CustomSkillSlot2 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_2'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 3
   *
   * 自定义技能槽位3
   */
  static readonly CustomSkillSlot3 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_3'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 4
   *
   * 自定义技能槽位4
   */
  static readonly CustomSkillSlot4 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_4'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 5
   *
   * 自定义技能槽位5
   */
  static readonly CustomSkillSlot5 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_5'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 6
   *
   * 自定义技能槽位6
   */
  static readonly CustomSkillSlot6 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_6'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 7
   *
   * 自定义技能槽位7
   */
  static readonly CustomSkillSlot7 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_7'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 8
   *
   * 自定义技能槽位8
   */
  static readonly CustomSkillSlot8 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_8'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 9
   *
   * 自定义技能槽位9
   */
  static readonly CustomSkillSlot9 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_9'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 10
   *
   * 自定义技能槽位10
   */
  static readonly CustomSkillSlot10 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_10'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 11
   *
   * 自定义技能槽位11
   */
  static readonly CustomSkillSlot11 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_11'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 12
   *
   * 自定义技能槽位12
   */
  static readonly CustomSkillSlot12 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_12'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 13
   *
   * 自定义技能槽位13
   */
  static readonly CustomSkillSlot13 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_13'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 14
   *
   * 自定义技能槽位14
   */
  static readonly CustomSkillSlot14 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_14'
  ) as CharacterSkillSlot
  /**
   * Custom Skill Slot 15
   *
   * 自定义技能槽位15
   */
  static readonly CustomSkillSlot15 = new enumeration(
    'CharacterSkillSlot',
    'character_skill_slot_custom_skill_slot_15'
  ) as CharacterSkillSlot
}

/** 原槽位技能处理方式 */
export class OriginalSlotSkillHandling extends enumeration {
  declare private readonly __brandOriginalSlotSkillHandling: 'OriginalSlotSkillHandling'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Destroy: Remove the original skill
   *
   * 销毁：销毁原技能
   */
  static readonly Destroy = new enumeration(
    'OriginalSlotSkillHandling',
    'original_slot_skill_handling_destroy'
  ) as OriginalSlotSkillHandling
  /**
   * Preserve Slot Binding: Retain the current slot binding. When the newly bound skill instance is removed, it is automatically displayed in that slot
   *
   * 保留槽位关系：继续保留在当前槽位，在新绑定的技能实例被移除后会自动显示在该槽位上
   */
  static readonly KeepSlotRelation = new enumeration(
    'OriginalSlotSkillHandling',
    'original_slot_skill_handling_keep_slot_relation'
  ) as OriginalSlotSkillHandling

  /**
   * Preserve Slot Binding: Retain the current slot binding. When the newly bound skill instance is removed, it is automatically displayed in that slot
   *
   * 保留槽位关系：继续保留在当前槽位，在新绑定的技能实例被移除后会自动显示在该槽位上
   *
   * Alias of {@link KeepSlotRelation}; both names refer to the same enum value.
   *
   * {@link KeepSlotRelation} 的别名；两个名称指向同一枚举值。
   */
  static readonly PreserveSlotBinding = OriginalSlotSkillHandling.KeepSlotRelation
  /**
   * Remove Slot Binding: The skill must be reassigned to the specified slot in order to be displayed in that slot
   *
   * 脱离槽位关系：必须被重新绑定到指定槽位才可以显示在槽位上
   */
  static readonly DetachFromSlotRelation = new enumeration(
    'OriginalSlotSkillHandling',
    'original_slot_skill_handling_detach_from_slot_relation'
  ) as OriginalSlotSkillHandling

  /**
   * Remove Slot Binding: The skill must be reassigned to the specified slot in order to be displayed in that slot
   *
   * 脱离槽位关系：必须被重新绑定到指定槽位才可以显示在槽位上
   *
   * Alias of {@link DetachFromSlotRelation}; both names refer to the same enum value.
   *
   * {@link DetachFromSlotRelation} 的别名；两个名称指向同一枚举值。
   */
  static readonly RemoveSlotBinding = OriginalSlotSkillHandling.DetachFromSlotRelation
}

/**
 * Top-of-Stack Skill Destruction Type
 *
 * 栈顶技能销毁类型
 *
 * Alias of {@link OriginalSlotSkillHandling}; both names refer to the same enum type.
 *
 * {@link OriginalSlotSkillHandling} 的别名；两个名称指向同一枚举类型。
 */
export { OriginalSlotSkillHandling as TopOfStackSkillDestructionType }

/** 已有技能处理方式 */
export class ExistingSkillHandling extends enumeration {
  declare private readonly __brandExistingSkillHandling: 'ExistingSkillHandling'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Clear All: Clear all existing skills
   *
   * 全部清理：将已有技能全部清理
   */
  static readonly ClearAll = new enumeration(
    'ExistingSkillHandling',
    'existing_skill_handling_clear_all'
  ) as ExistingSkillHandling
  /**
   * Preserve Unrelated Skills: Retain skills that are not defined in the default skill sets of either the previous or the new class
   *
   * 保留无关技能：保留更换前后两个职业默认配置内均没有的技能
   */
  static readonly KeepIrrelevantSkills = new enumeration(
    'ExistingSkillHandling',
    'existing_skill_handling_keep_irrelevant_skills'
  ) as ExistingSkillHandling

  /**
   * Preserve Unrelated Skills: Retain skills that are not defined in the default skill sets of either the previous or the new class
   *
   * 保留无关技能：保留更换前后两个职业默认配置内均没有的技能
   *
   * Alias of {@link KeepIrrelevantSkills}; both names refer to the same enum value.
   *
   * {@link KeepIrrelevantSkills} 的别名；两个名称指向同一枚举值。
   */
  static readonly PreserveUnrelatedSkills = ExistingSkillHandling.KeepIrrelevantSkills
}

/**
 * Class Switch Skill Handling
 *
 * 职业切换技能处理
 *
 * Alias of {@link ExistingSkillHandling}; both names refer to the same enum type.
 *
 * {@link ExistingSkillHandling} 的别名；两个名称指向同一枚举类型。
 */
export { ExistingSkillHandling as ClassSwitchSkillHandling }

/** 声音衰减方式 */
export class SoundAttenuationMode extends enumeration {
  declare private readonly __brandSoundAttenuationMode: 'SoundAttenuationMode'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Linear Attenuation
   *
   * 线性衰减
   */
  static readonly LinearAttenuation = new enumeration(
    'SoundAttenuationMode',
    'sound_attenuation_mode_linear_attenuation'
  ) as SoundAttenuationMode
  /**
   * Fast Then Slow
   *
   * 先快后慢
   */
  static readonly FastThenSlow = new enumeration(
    'SoundAttenuationMode',
    'sound_attenuation_mode_fast_then_slow'
  ) as SoundAttenuationMode
  /**
   * Slow Then Fast
   *
   * 先慢后快
   */
  static readonly SlowThenFast = new enumeration(
    'SoundAttenuationMode',
    'sound_attenuation_mode_slow_then_fast'
  ) as SoundAttenuationMode
}

/** 逻辑运算 */
export class LogicalOperator extends enumeration {
  declare private readonly __brandLogicalOperator: 'LogicalOperator'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * AND
   *
   * 与
   */
  static readonly AND = new enumeration(
    'LogicalOperator',
    'logical_operator_and'
  ) as LogicalOperator
  /**
   * OR
   *
   * 或
   */
  static readonly OR = new enumeration('LogicalOperator', 'logical_operator_or') as LogicalOperator
  /**
   * XOR
   *
   * 异或
   */
  static readonly XOR = new enumeration(
    'LogicalOperator',
    'logical_operator_xor'
  ) as LogicalOperator
  /**
   * NOT
   *
   * 非
   */
  static readonly NOT = new enumeration(
    'LogicalOperator',
    'logical_operator_not'
  ) as LogicalOperator
}

interface BasicMathematicalOperatorValue extends MathematicalOperator {
  readonly __brandBasicMathematicalOperator: 'BasicMathematicalOperator'
}

interface QuickMathematicalOperatorValue extends MathematicalOperator {
  readonly __brandQuickMathematicalOperator: 'QuickMathematicalOperator'
}

interface MathematicalOperatorComparisonOverlap extends MathematicalOperator {
  readonly __brandMathematicalOperatorComparisonOverlap: 'MathematicalOperatorComparisonOverlap'
}

/** 客户端“基础数学运算”下拉中的值。 */
export type BasicMathematicalOperator =
  | BasicMathematicalOperatorValue
  | MathematicalOperatorComparisonOverlap

/** 客户端“便捷数学运算”下拉中的值。 */
export type QuickMathematicalOperator =
  | QuickMathematicalOperatorValue
  | MathematicalOperatorComparisonOverlap

/** 数学运算 */
export class MathematicalOperator extends enumeration {
  declare private readonly __brandMathematicalOperator: 'MathematicalOperator'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Addition
   *
   * 加法
   */
  static readonly Addition = new enumeration(
    'MathematicalOperator',
    'mathematical_operator_addition'
  ) as BasicMathematicalOperator
  /**
   * Subtraction
   *
   * 减法
   */
  static readonly Subtraction = new enumeration(
    'MathematicalOperator',
    'mathematical_operator_subtraction'
  ) as BasicMathematicalOperator
  /**
   * Multiplication
   *
   * 乘法
   */
  static readonly Multiplication = new enumeration(
    'MathematicalOperator',
    'mathematical_operator_multiplication'
  ) as BasicMathematicalOperator
  /**
   * Division
   *
   * 除法
   */
  static readonly Division = new enumeration(
    'MathematicalOperator',
    'mathematical_operator_division'
  ) as BasicMathematicalOperator
  /**
   * Modulo Operation
   *
   * 取模
   */
  static readonly ModuloOperation = new enumeration(
    'MathematicalOperator',
    'mathematical_operator_modulo_operation'
  ) as QuickMathematicalOperator
  /**
   * Exponentiation
   *
   * 幂运算
   */
  static readonly Exponentiation = new enumeration(
    'MathematicalOperator',
    'mathematical_operator_exponentiation'
  ) as QuickMathematicalOperator
  /**
   * Get Maximum Value
   *
   * 取最大值
   */
  static readonly GetMaximumValue = new enumeration(
    'MathematicalOperator',
    'mathematical_operator_get_maximum_value'
  ) as QuickMathematicalOperator
  /**
   * Get Minimum Value
   *
   * 取最小值
   */
  static readonly GetMinimumValue = new enumeration(
    'MathematicalOperator',
    'mathematical_operator_get_minimum_value'
  ) as QuickMathematicalOperator
  /**
   * Logarithm
   *
   * 对数
   */
  static readonly Logarithm = new enumeration(
    'MathematicalOperator',
    'mathematical_operator_logarithm'
  ) as QuickMathematicalOperator
}

/** 三角函数 */
export class TrigonometricFunction extends enumeration {
  declare private readonly __brandTrigonometricFunction: 'TrigonometricFunction'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Cosine
   *
   * 余弦
   */
  static readonly Cos = new enumeration(
    'TrigonometricFunction',
    'trigonometric_function_cos'
  ) as TrigonometricFunction
  /**
   * Sine
   *
   * 正弦
   */
  static readonly Sin = new enumeration(
    'TrigonometricFunction',
    'trigonometric_function_sin'
  ) as TrigonometricFunction
  /**
   * Tangent
   *
   * 正切
   */
  static readonly Tan = new enumeration(
    'TrigonometricFunction',
    'trigonometric_function_tan'
  ) as TrigonometricFunction
  /**
   * Arccos
   *
   * 反余弦
   */
  static readonly Arccos = new enumeration(
    'TrigonometricFunction',
    'trigonometric_function_arccos'
  ) as TrigonometricFunction
  /**
   * Arcsin
   *
   * 反正弦
   */
  static readonly Arcsin = new enumeration(
    'TrigonometricFunction',
    'trigonometric_function_arcsin'
  ) as TrigonometricFunction
  /**
   * Arctan
   *
   * 反正切
   */
  static readonly Arctan = new enumeration(
    'TrigonometricFunction',
    'trigonometric_function_arctan'
  ) as TrigonometricFunction
  /**
   * Radians To Degrees
   *
   * 弧度转角度
   */
  static readonly RadiansToDegrees = new enumeration(
    'TrigonometricFunction',
    'trigonometric_function_radians_to_degrees'
  ) as TrigonometricFunction
  /**
   * Degrees To Radians
   *
   * 角度转弧度
   */
  static readonly DegreesToRadians = new enumeration(
    'TrigonometricFunction',
    'trigonometric_function_degrees_to_radians'
  ) as TrigonometricFunction
}

/** 攻击形状 */
export class AttackShape extends enumeration {
  declare private readonly __brandAttackShape: 'AttackShape'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Rectangle
   *
   * 矩形
   */
  static readonly Rectangle = new enumeration(
    'AttackShape',
    'attack_shape_rectangle'
  ) as AttackShape
  /**
   * Sphere
   *
   * 球体
   */
  static readonly Sphere = new enumeration('AttackShape', 'attack_shape_sphere') as AttackShape
  /**
   * Sector
   *
   * 扇形
   */
  static readonly Sector = new enumeration('AttackShape', 'attack_shape_sector') as AttackShape
}

/** 生存状态 */
export class SurvivalStatus extends enumeration {
  declare private readonly __brandSurvivalStatus: 'SurvivalStatus'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Alive
   *
   * 存活
   */
  static readonly Alive = new enumeration(
    'SurvivalStatus',
    'survival_status_alive'
  ) as SurvivalStatus
  /**
   * Down
   *
   * 倒下
   */
  static readonly Down = new enumeration('SurvivalStatus', 'survival_status_down') as SurvivalStatus
}

/** 类型转换 */
export class TypeConversion extends enumeration {
  declare private readonly __brandTypeConversion: 'TypeConversion'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Integer → Boolean
   *
   * 整数转布尔
   */
  static readonly IntegerToBoolean = new enumeration(
    'TypeConversion',
    'type_conversion_integer_to_boolean'
  ) as TypeConversion
  /**
   * Integer → Float
   *
   * 整数转浮点
   */
  static readonly IntegerToFloatingPoint = new enumeration(
    'TypeConversion',
    'type_conversion_integer_to_floating_point'
  ) as TypeConversion
  /**
   * Integer → String
   *
   * 整数转字符串
   */
  static readonly IntegerToString = new enumeration(
    'TypeConversion',
    'type_conversion_integer_to_string'
  ) as TypeConversion
  /**
   * Entity → String
   *
   * 实体转字符串
   */
  static readonly EntityToString = new enumeration(
    'TypeConversion',
    'type_conversion_entity_to_string'
  ) as TypeConversion
  /**
   * GUID → String
   *
   * GUID转字符串
   */
  static readonly GuidToString = new enumeration(
    'TypeConversion',
    'type_conversion_guid_to_string'
  ) as TypeConversion
  /**
   * Boolean → Integer
   *
   * 布尔转整数
   */
  static readonly BooleanToInteger = new enumeration(
    'TypeConversion',
    'type_conversion_boolean_to_integer'
  ) as TypeConversion
  /**
   * Boolean → String
   *
   * 布尔转字符串
   */
  static readonly BooleanToString = new enumeration(
    'TypeConversion',
    'type_conversion_boolean_to_string'
  ) as TypeConversion
  /**
   * Float → Integer
   *
   * 浮点转整数
   */
  static readonly FloatingPointToInteger = new enumeration(
    'TypeConversion',
    'type_conversion_floating_point_to_integer'
  ) as TypeConversion
  /**
   * Float → String
   *
   * 浮点转字符串
   */
  static readonly FloatingPointToString = new enumeration(
    'TypeConversion',
    'type_conversion_floating_point_to_string'
  ) as TypeConversion
  /**
   * Vector3 → String
   *
   * 三维向量转字符串
   */
  static readonly Vector3ToString = new enumeration(
    'TypeConversion',
    'type_conversion_vector_3_to_string'
  ) as TypeConversion
  /**
   * Faction → String
   *
   * 阵营转字符串
   */
  static readonly FactionToString = new enumeration(
    'TypeConversion',
    'type_conversion_faction_to_string'
  ) as TypeConversion
}

/** 运动路径点位类型 */
export class MotionPathPointType extends enumeration {
  declare private readonly __brandMotionPathPointType: 'MotionPathPointType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Straight Line
   *
   * 直线点
   */
  static readonly StraightLine = new enumeration(
    'MotionPathPointType',
    'motion_path_point_type_straight_line'
  ) as MotionPathPointType
  /**
   * Curve
   *
   * 曲线点
   */
  static readonly Curve = new enumeration(
    'MotionPathPointType',
    'motion_path_point_type_curve'
  ) as MotionPathPointType
}

/** 运动类型 */
export class MotionType extends enumeration {
  declare private readonly __brandMotionType: 'MotionType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * One-Way
   *
   * 单向
   */
  static readonly OneWay = new enumeration('MotionType', 'motion_type_one_way') as MotionType
  /**
   * Back and Forth
   *
   * 往返
   */
  static readonly BackAndForth = new enumeration(
    'MotionType',
    'motion_type_back_and_forth'
  ) as MotionType
  /**
   * Cyclic Movement
   *
   * 循环
   */
  static readonly CyclicMovement = new enumeration(
    'MotionType',
    'motion_type_cyclic_movement'
  ) as MotionType
}

/** 决策刷新方式 */
export class DecisionRefreshMode extends enumeration {
  declare private readonly __brandDecisionRefreshMode: 'DecisionRefreshMode'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Cannot Refresh
   *
   * 不可刷新
   */
  static readonly CannotRefresh = new enumeration(
    'DecisionRefreshMode',
    'decision_refresh_mode_cannot_refresh'
  ) as DecisionRefreshMode
  /**
   * Partial Refresh
   *
   * 部分刷新
   */
  static readonly PartialRefresh = new enumeration(
    'DecisionRefreshMode',
    'decision_refresh_mode_partial_refresh'
  ) as DecisionRefreshMode
  /**
   * Refresh All
   *
   * 全部刷新
   */
  static readonly RefreshAll = new enumeration(
    'DecisionRefreshMode',
    'decision_refresh_mode_refresh_all'
  ) as DecisionRefreshMode
}

/** 结算状态 */
export class SettlementStatus extends enumeration {
  declare private readonly __brandSettlementStatus: 'SettlementStatus'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * TBC
   *
   * 未定
   */
  static readonly Undefined = new enumeration(
    'SettlementStatus',
    'settlement_status_undefined'
  ) as SettlementStatus

  /**
   * TBC
   *
   * 未定
   *
   * Alias of {@link Undefined}; both names refer to the same enum value.
   *
   * {@link Undefined} 的别名；两个名称指向同一枚举值。
   */
  static readonly TBC = SettlementStatus.Undefined

  /**
   * Victory
   *
   * 胜利
   */
  static readonly Victory = new enumeration(
    'SettlementStatus',
    'settlement_status_victory'
  ) as SettlementStatus
  /**
   * Failed
   *
   * 失败
   */
  static readonly Defeat = new enumeration(
    'SettlementStatus',
    'settlement_status_defeat'
  ) as SettlementStatus

  /**
   * Failed
   *
   * 失败
   *
   * Alias of {@link Defeat}; both names refer to the same enum value.
   *
   * {@link Defeat} 的别名；两个名称指向同一枚举值。
   */
  static readonly Failed = SettlementStatus.Defeat
}

/**
 * Settlement Status
 *
 * 结算状态（段位）
 */
export class RankSettlementStatus extends enumeration {
  declare private readonly __brandRankSettlementStatus: 'RankSettlementStatus'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * TBC
   *
   * 未定
   */
  static readonly TBC = new enumeration(
    'RankSettlementStatus',
    'rank_settlement_status_tbc'
  ) as RankSettlementStatus

  /**
   * Victory
   *
   * 胜利
   */
  static readonly Victory = new enumeration(
    'RankSettlementStatus',
    'rank_settlement_status_victory'
  ) as RankSettlementStatus

  /**
   * Failed
   *
   * 失败
   */
  static readonly Failed = new enumeration(
    'RankSettlementStatus',
    'rank_settlement_status_failed'
  ) as RankSettlementStatus

  /**
   * Escape
   *
   * 逃跑
   */
  static readonly Escape = new enumeration(
    'RankSettlementStatus',
    'rank_settlement_status_escape'
  ) as RankSettlementStatus
}

/** 道具掉落类型 */
export class ItemLootType extends enumeration {
  declare private readonly __brandItemLootType: 'ItemLootType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Shared Reward
   *
   * 全员一份
   */
  static readonly SharedReward = new enumeration(
    'ItemLootType',
    'item_loot_type_shared_reward'
  ) as ItemLootType
  /**
   * Individualized Reward
   *
   * 每人一份
   */
  static readonly IndividualizedReward = new enumeration(
    'ItemLootType',
    'item_loot_type_individualized_reward'
  ) as ItemLootType
}

/** 扫描规则类型 */
export class ScanRuleType extends enumeration {
  declare private readonly __brandScanRuleType: 'ScanRuleType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Prioritize View
   *
   * 视野优先
   */
  static readonly PrioritizeView = new enumeration(
    'ScanRuleType',
    'scan_rule_type_prioritize_view'
  ) as ScanRuleType
  /**
   * Prioritize Distance
   *
   * 距离优先
   */
  static readonly PrioritizeDistance = new enumeration(
    'ScanRuleType',
    'scan_rule_type_prioritize_distance'
  ) as ScanRuleType
}

/**
 * Scan Scoring Rules
 *
 * 扫描积分规则
 *
 * Alias of {@link ScanRuleType}; both names refer to the same enum type.
 *
 * {@link ScanRuleType} 的别名；两个名称指向同一枚举类型。
 */
export { ScanRuleType as ScanScoringRules }

/** 客户端“取整逻辑”下拉中可选的值。 */
export interface ClientRoundingMode extends RoundingMode {
  readonly __clientRoundingMode: 'client'
}

/** 取整逻辑 */
export class RoundingMode extends enumeration {
  declare private readonly __brandRoundingMode: 'RoundingMode'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Round To Nearest: Rounds to the nearest integer according to standard rules
   *
   * 四舍五入：按照四舍五入规则进行取整
   */
  static readonly RoundToNearest = new enumeration(
    'RoundingMode',
    'rounding_mode_round_to_nearest'
  ) as ClientRoundingMode
  /**
   * Round Up: Returns the smallest integer greater than the input value. For example: input 1.2 → 2; input −2.3 → −2
   *
   * 向上取整：返回大于输入且离输入值最近的一个整数
   */
  static readonly RoundUp = new enumeration(
    'RoundingMode',
    'rounding_mode_round_up'
  ) as ClientRoundingMode
  /**
   * Round Down: Returns the largest integer smaller than the input value. For example: input 1.2 → 1; input −2.3 → −3
   *
   * 向下取整：返回小于输入且离输入值最近的一个整数
   */
  static readonly RoundDown = new enumeration(
    'RoundingMode',
    'rounding_mode_round_down'
  ) as ClientRoundingMode
  /**
   * Truncate: Removes the decimal part of the floating point number (rounds toward zero). For example: input 1.2 → 1; input −2.3 → −2
   *
   * 截尾取整：截去浮点数尾部的小数部分，也相当于向0方向取整
   */
  static readonly Truncate = new enumeration(
    'RoundingMode',
    'rounding_mode_truncate'
  ) as RoundingMode
}

/** 实体类型 */
export class EntityType extends enumeration {
  declare private readonly __brandEntityType: 'EntityType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Stage
   *
   * 关卡
   */
  static readonly Stage = new enumeration('EntityType', 'entity_type_stage') as EntityType
  /**
   * Object
   *
   * 物件
   */
  static readonly Object = new enumeration('EntityType', 'entity_type_object') as EntityType
  /**
   * Player
   *
   * 玩家
   */
  static readonly Player = new enumeration('EntityType', 'entity_type_player') as EntityType
  /**
   * Character
   *
   * 角色
   */
  static readonly Character = new enumeration('EntityType', 'entity_type_character') as EntityType
  /**
   * Creation
   *
   * 造物
   */
  static readonly Creation = new enumeration('EntityType', 'entity_type_creation') as EntityType
}

/** 比较运算 */
export class ComparisonOperator extends enumeration {
  declare private readonly __brandComparisonOperator: 'ComparisonOperator'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * ==
   *
   * 相等
   */
  static readonly EqualTo = new enumeration(
    'ComparisonOperator',
    'comparison_operator_equal_to'
  ) as ComparisonOperator
  /**
   * <
   *
   * 小于
   */
  static readonly LessThan = new enumeration(
    'ComparisonOperator',
    'comparison_operator_less_than'
  ) as ComparisonOperator
  /**
   * <=
   *
   * 小于等于
   */
  static readonly LessThanOrEqualTo = new enumeration(
    'ComparisonOperator',
    'comparison_operator_less_than_or_equal_to'
  ) as ComparisonOperator
  /**
   * >
   *
   * 大于
   */
  static readonly GreaterThan = new enumeration(
    'ComparisonOperator',
    'comparison_operator_greater_than'
  ) as ComparisonOperator
  /**
   * >=
   *
   * 大于等于
   */
  static readonly GreaterThanOrEqualTo = new enumeration(
    'ComparisonOperator',
    'comparison_operator_greater_than_or_equal_to'
  ) as ComparisonOperator
}

/** 倒下原因 */
export class CauseOfBeingDown extends enumeration {
  declare private readonly __brandCauseOfBeingDown: 'CauseOfBeingDown'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Node Graph caused
   *
   * 节点图导致：因节点图的【销毁实体】节点导致的角色倒下
   */
  static readonly NodeGraphTriggered = new enumeration(
    'CauseOfBeingDown',
    'cause_of_being_down_node_graph_triggered'
  ) as CauseOfBeingDown
  /**
   * Normal defeat
   *
   * 正常倒下：因生命值变为0导致的角色倒下
   */
  static readonly NormalDefeat = new enumeration(
    'CauseOfBeingDown',
    'cause_of_being_down_normal_defeat'
  ) as CauseOfBeingDown
  /**
   * Abnormal defeat
   *
   * 异常倒下：溺水、坠落等特殊原因
   */
  static readonly AbnormalDefeat = new enumeration(
    'CauseOfBeingDown',
    'cause_of_being_down_abnormal_defeat'
  ) as CauseOfBeingDown
}

/** 元素类型 */
export class ElementalType extends enumeration {
  declare private readonly __brandElementalType: 'ElementalType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * None
   *
   * 无元素
   */
  static readonly None = new enumeration('ElementalType', 'elemental_type_none') as ElementalType
  /**
   * Pyro
   *
   * 火
   */
  static readonly Pyro = new enumeration('ElementalType', 'elemental_type_pyro') as ElementalType
  /**
   * Hydro
   *
   * 水
   */
  static readonly Hydro = new enumeration('ElementalType', 'elemental_type_hydro') as ElementalType
  /**
   * Anemo
   *
   * 风
   */
  static readonly Anemo = new enumeration('ElementalType', 'elemental_type_anemo') as ElementalType
  /**
   * Electro
   *
   * 雷
   */
  static readonly Electro = new enumeration(
    'ElementalType',
    'elemental_type_electro'
  ) as ElementalType
  /**
   * Dendro
   *
   * 草
   */
  static readonly Dendro = new enumeration(
    'ElementalType',
    'elemental_type_dendro'
  ) as ElementalType
  /**
   * Cryo
   *
   * 冰
   */
  static readonly Cryo = new enumeration('ElementalType', 'elemental_type_cryo') as ElementalType
  /**
   * Geo
   *
   * 岩
   */
  static readonly Geo = new enumeration('ElementalType', 'elemental_type_geo') as ElementalType
}

/** 单位状态移除原因 */
export class UnitStatusRemovalReason extends enumeration {
  declare private readonly __brandUnitStatusRemovalReason: 'UnitStatusRemovalReason'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Status Replacement: removed because it was replaced by another status
   *
   * 其他单位状态顶替：因被施加了顶替状态导致单位状态被移除
   */
  static readonly ReplacedByOtherUnitStatus = new enumeration(
    'UnitStatusRemovalReason',
    'unit_status_removal_reason_replaced_by_other_unit_status'
  ) as UnitStatusRemovalReason
  /**
   * Duration Exceeded: the Unit Status exceeded its runtime duration
   *
   * 超出持续时间：单位状态超出其运行时长
   */
  static readonly DurationExceeded = new enumeration(
    'UnitStatusRemovalReason',
    'unit_status_removal_reason_duration_exceeded'
  ) as UnitStatusRemovalReason
  /**
   * Dispelled: the Unit Status was removed directly
   *
   * 被驱散：单位状态被直接移除
   */
  static readonly Dispelled = new enumeration(
    'UnitStatusRemovalReason',
    'unit_status_removal_reason_dispelled'
  ) as UnitStatusRemovalReason
  /**
   * Status Expired: became invalid due to other reasons
   *
   * 状态失效：因其他原因导致单位状态失效
   */
  static readonly StatusExpired = new enumeration(
    'UnitStatusRemovalReason',
    'unit_status_removal_reason_status_expired'
  ) as UnitStatusRemovalReason
  /**
   * Class Changed: the Unit Status was removed due to a class change
   *
   * 职业变更：因职业变更导致单位状态被移除
   */
  static readonly ClassChanged = new enumeration(
    'UnitStatusRemovalReason',
    'unit_status_removal_reason_class_changed'
  ) as UnitStatusRemovalReason
  /**
   * Affix Expired
   *
   * 词条失效
   */
  static readonly AffixExpired = new enumeration(
    'UnitStatusRemovalReason',
    'unit_status_removal_reason_affix_expired'
  ) as UnitStatusRemovalReason
  /**
   * Shield Depleted to Zero
   *
   * 护盾含量归零
   */
  static readonly ShieldDepletedToZero = new enumeration(
    'UnitStatusRemovalReason',
    'unit_status_removal_reason_shield_depleted_to_zero'
  ) as UnitStatusRemovalReason
}

/** 仅客户端元素反应选项使用的值。 */
export interface ClientElementalReactionType extends enumeration {
  readonly __brandClientElementalReactionType: 'ClientElementalReactionType'
}

/** 元素反应类型 */
export class ElementalReactionType extends enumeration {
  declare private readonly __brandElementalReactionType: 'ElementalReactionType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Overloaded
   *
   * 超载
   */
  static readonly Overloaded = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_overloaded'
  ) as ElementalReactionType
  /**
   * Vaporize
   *
   * 蒸发
   */
  static readonly Vaporize = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_vaporize'
  ) as ElementalReactionType
  /**
   * Burning
   *
   * 燃烧
   */
  static readonly Burning = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_burning'
  ) as ElementalReactionType
  /**
   * Wet
   *
   * 湿润
   */
  static readonly Wet = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_wet'
  ) as ElementalReactionType
  /**
   * Bloom
   *
   * 绽放
   */
  static readonly Bloom = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_bloom'
  ) as ElementalReactionType
  /**
   * Melt
   *
   * 融化
   */
  static readonly Melt = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_melt'
  ) as ElementalReactionType
  /**
   * Frozen
   *
   * 冻结
   */
  static readonly Frozen = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_frozen'
  ) as ElementalReactionType
  /**
   * Electro-Charged
   *
   * 感电
   */
  static readonly ElectroCharged = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_electro_charged'
  ) as ElementalReactionType
  /**
   * Superconduct
   *
   * 超导
   */
  static readonly Superconduct = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_superconduct'
  ) as ElementalReactionType
  /**
   * Swirl (Pyro)
   *
   * 扩散·火
   */
  static readonly SwirlPyro = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_swirl_pyro'
  ) as ElementalReactionType
  /**
   * Swirl (Hydro)
   *
   * 扩散·水
   */
  static readonly SwirlHydro = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_swirl_hydro'
  ) as ElementalReactionType
  /**
   * Swirl (Electro)
   *
   * 扩散·雷
   */
  static readonly SwirlElectro = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_swirl_electro'
  ) as ElementalReactionType
  /**
   * Swirl (Cryo)
   *
   * 扩散·冰
   */
  static readonly SwirlCryo = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_swirl_cryo'
  ) as ElementalReactionType
  /**
   * Crystallize (Pyro)
   *
   * 结晶·火
   */
  static readonly CrystallizePyro = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_crystallize_pyro'
  ) as ElementalReactionType
  /**
   * Crystallize (Hydro)
   *
   * 结晶·水
   */
  static readonly CrystallizeHydro = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_crystallize_hydro'
  ) as ElementalReactionType
  /**
   * Crystallize (Electro)
   *
   * 结晶·雷
   */
  static readonly CrystallizeElectro = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_crystallize_electro'
  ) as ElementalReactionType
  /**
   * Crystallize (Cryo)
   *
   * 结晶·冰
   */
  static readonly CrystallizeCryo = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_crystallize_cryo'
  ) as ElementalReactionType
  /**
   * Catalyze
   *
   * 激化
   */
  static readonly Catalyze = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_catalyze'
  ) as ElementalReactionType
  /**
   * Aggravate
   *
   * 超激化
   */
  static readonly Aggravate = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_aggravate'
  ) as ElementalReactionType
  /**
   * Spread
   *
   * 蔓激化
   */
  static readonly Spread = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_spread'
  ) as ElementalReactionType
  /**
   * Burgeon
   *
   * 烈绽放
   */
  static readonly Burgeon = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_burgeon'
  ) as ElementalReactionType
  /**
   * Hyperbloom
   *
   * 超绽放
   */
  static readonly Hyperbloom = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_hyperbloom'
  ) as ElementalReactionType

  /**
   * Shatter
   *
   * 碎冰
   */
  static readonly Shatter = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_shatter'
  ) as ElementalReactionType

  /**
   * Lunar-Charged
   *
   * 月感电
   */
  static readonly LunarCharged = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_lunar_charged'
  ) as ElementalReactionType

  /**
   * Lunar-Bloom
   *
   * 月绽放
   */
  static readonly LunarBloom = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_lunar_bloom'
  ) as ElementalReactionType

  /**
   * Lunar-Crystallize
   *
   * 月结晶
   */
  static readonly LunarCrystallize = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_lunar_crystallize'
  ) as ElementalReactionType

  /**
   * Stellar-Conduct
   *
   * 星超导
   */
  static readonly StellarConduct = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_stellar_conduct'
  ) as ElementalReactionType
  /**
   * Stellar Swirl
   * 星扩散: 星扩散元素反应。
   */
  static readonly StellarSwirl = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_stellar_swirl'
  ) as ElementalReactionType

  /**
   * Explode
   *
   * 超载
   *
   * Alias of {@link Overloaded}; both names refer to the same enum value.
   *
   * {@link Overloaded} 的别名；两个名称指向同一枚举值。
   */
  static readonly Explode =
    ElementalReactionType.Overloaded as unknown as ClientElementalReactionType

  /**
   * Stream
   *
   * 蒸发
   *
   * Alias of {@link Vaporize}; both names refer to the same enum value.
   *
   * {@link Vaporize} 的别名；两个名称指向同一枚举值。
   */
  static readonly Stream = ElementalReactionType.Vaporize as unknown as ClientElementalReactionType

  /**
   * Burned
   *
   * 燃元素
   */
  static readonly Burned = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_burned'
  ) as ClientElementalReactionType

  /**
   * Overgrow
   *
   * 绽放
   *
   * Alias of {@link Bloom}; both names refer to the same enum value.
   *
   * {@link Bloom} 的别名；两个名称指向同一枚举值。
   */
  static readonly Overgrow = ElementalReactionType.Bloom as unknown as ClientElementalReactionType

  /**
   * Freeze
   *
   * 冻结
   *
   * Alias of {@link Frozen}; both names refer to the same enum value.
   *
   * {@link Frozen} 的别名；两个名称指向同一枚举值。
   */
  static readonly Freeze = ElementalReactionType.Frozen as unknown as ClientElementalReactionType

  /**
   * AntiFire
   *
   * 灭火
   */
  static readonly AntiFire = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_anti_fire'
  ) as ClientElementalReactionType

  /**
   * Rock
   *
   * 岩元素
   */
  static readonly Rock = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_rock'
  ) as ClientElementalReactionType

  /**
   * SlowDown
   *
   * 减速
   */
  static readonly SlowDown = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_slow_down'
  ) as ClientElementalReactionType

  /**
   * Shock
   *
   * 感电
   *
   * Alias of {@link ElectroCharged}; both names refer to the same enum value.
   *
   * {@link ElectroCharged} 的别名；两个名称指向同一枚举值。
   */
  static readonly Shock =
    ElementalReactionType.ElectroCharged as unknown as ClientElementalReactionType

  /**
   * Wind
   *
   * 风元素
   */
  static readonly Wind = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_wind'
  ) as ClientElementalReactionType

  /**
   * Electric
   *
   * 雷元素
   */
  static readonly Electric = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_electric'
  ) as ClientElementalReactionType

  /**
   * Fire
   *
   * 火元素
   */
  static readonly Fire = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_fire'
  ) as ClientElementalReactionType

  /**
   * Superconductor
   *
   * 超导
   *
   * Alias of {@link Superconduct}; both names refer to the same enum value.
   *
   * {@link Superconduct} 的别名；两个名称指向同一枚举值。
   */
  static readonly Superconductor =
    ElementalReactionType.Superconduct as unknown as ClientElementalReactionType

  /**
   * SwirlFire
   *
   * 扩散·火
   *
   * Alias of {@link SwirlPyro}; both names refer to the same enum value.
   *
   * {@link SwirlPyro} 的别名；两个名称指向同一枚举值。
   */
  static readonly SwirlFire =
    ElementalReactionType.SwirlPyro as unknown as ClientElementalReactionType

  /**
   * SwirlWater
   *
   * 扩散·水
   *
   * Alias of {@link SwirlHydro}; both names refer to the same enum value.
   *
   * {@link SwirlHydro} 的别名；两个名称指向同一枚举值。
   */
  static readonly SwirlWater =
    ElementalReactionType.SwirlHydro as unknown as ClientElementalReactionType

  /**
   * SwirlElectric
   *
   * 扩散·雷
   *
   * Alias of {@link SwirlElectro}; both names refer to the same enum value.
   *
   * {@link SwirlElectro} 的别名；两个名称指向同一枚举值。
   */
  static readonly SwirlElectric =
    ElementalReactionType.SwirlElectro as unknown as ClientElementalReactionType

  /**
   * SwirlIce
   *
   * 扩散·冰
   *
   * Alias of {@link SwirlCryo}; both names refer to the same enum value.
   *
   * {@link SwirlCryo} 的别名；两个名称指向同一枚举值。
   */
  static readonly SwirlIce =
    ElementalReactionType.SwirlCryo as unknown as ClientElementalReactionType

  /**
   * SwirlFireAccu
   *
   * 扩散·火（累积）
   */
  static readonly SwirlFireAccu = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_swirl_fire_accu'
  ) as ClientElementalReactionType

  /**
   * SwirlWaterAccu
   *
   * 扩散·水（累积）
   */
  static readonly SwirlWaterAccu = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_swirl_water_accu'
  ) as ClientElementalReactionType

  /**
   * SwirlElectricAccu
   *
   * 扩散·雷（累积）
   */
  static readonly SwirlElectricAccu = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_swirl_electric_accu'
  ) as ClientElementalReactionType

  /**
   * SwirlIceAccu
   *
   * 扩散·冰（累积）
   */
  static readonly SwirlIceAccu = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_swirl_ice_accu'
  ) as ClientElementalReactionType

  /**
   * StickRock
   *
   * 岩元素附着
   */
  static readonly StickRock = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_stick_rock'
  ) as ClientElementalReactionType

  /**
   * StickWater
   *
   * 水元素附着
   */
  static readonly StickWater = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_stick_water'
  ) as ClientElementalReactionType

  /**
   * CrystallizeFire
   *
   * 结晶·火
   *
   * Alias of {@link CrystallizePyro}; both names refer to the same enum value.
   *
   * {@link CrystallizePyro} 的别名；两个名称指向同一枚举值。
   */
  static readonly CrystallizeFire =
    ElementalReactionType.CrystallizePyro as unknown as ClientElementalReactionType

  /**
   * CrystallizeWater
   *
   * 结晶·水
   *
   * Alias of {@link CrystallizeHydro}; both names refer to the same enum value.
   *
   * {@link CrystallizeHydro} 的别名；两个名称指向同一枚举值。
   */
  static readonly CrystallizeWater =
    ElementalReactionType.CrystallizeHydro as unknown as ClientElementalReactionType

  /**
   * CrystallizeElectric
   *
   * 结晶·雷
   *
   * Alias of {@link CrystallizeElectro}; both names refer to the same enum value.
   *
   * {@link CrystallizeElectro} 的别名；两个名称指向同一枚举值。
   */
  static readonly CrystallizeElectric =
    ElementalReactionType.CrystallizeElectro as unknown as ClientElementalReactionType

  /**
   * CrystallizeIce
   *
   * 结晶·冰
   *
   * Alias of {@link CrystallizeCryo}; both names refer to the same enum value.
   *
   * {@link CrystallizeCryo} 的别名；两个名称指向同一枚举值。
   */
  static readonly CrystallizeIce =
    ElementalReactionType.CrystallizeCryo as unknown as ClientElementalReactionType

  /**
   * FrozenBroken
   *
   * 碎冰
   *
   * Alias of {@link Shatter}; both names refer to the same enum value.
   *
   * {@link Shatter} 的别名；两个名称指向同一枚举值。
   */
  static readonly FrozenBroken =
    ElementalReactionType.Shatter as unknown as ClientElementalReactionType

  /**
   * StickGrass
   *
   * 草元素附着
   */
  static readonly StickGrass = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_stick_grass'
  ) as ClientElementalReactionType

  /**
   * Overdose
   *
   * 激化
   *
   * Alias of {@link Catalyze}; both names refer to the same enum value.
   *
   * {@link Catalyze} 的别名；两个名称指向同一枚举值。
   */
  static readonly Overdose =
    ElementalReactionType.Catalyze as unknown as ClientElementalReactionType

  /**
   * OverdoseElectric
   *
   * 超激化
   *
   * Alias of {@link Aggravate}; both names refer to the same enum value.
   *
   * {@link Aggravate} 的别名；两个名称指向同一枚举值。
   */
  static readonly OverdoseElectric =
    ElementalReactionType.Aggravate as unknown as ClientElementalReactionType

  /**
   * OverdoseGrass
   *
   * 蔓激化
   *
   * Alias of {@link Spread}; both names refer to the same enum value.
   *
   * {@link Spread} 的别名；两个名称指向同一枚举值。
   */
  static readonly OverdoseGrass =
    ElementalReactionType.Spread as unknown as ClientElementalReactionType

  /**
   * OvergrowMushroomFire
   *
   * 烈绽放
   *
   * Alias of {@link Burgeon}; both names refer to the same enum value.
   *
   * {@link Burgeon} 的别名；两个名称指向同一枚举值。
   */
  static readonly OvergrowMushroomFire =
    ElementalReactionType.Burgeon as unknown as ClientElementalReactionType

  /**
   * OvergrowMushroomElectric
   *
   * 超绽放
   *
   * Alias of {@link Hyperbloom}; both names refer to the same enum value.
   *
   * {@link Hyperbloom} 的别名；两个名称指向同一枚举值。
   */
  static readonly OvergrowMushroomElectric =
    ElementalReactionType.Hyperbloom as unknown as ClientElementalReactionType

  /**
   * PhlogistonSolidification
   *
   * 固态燃素
   */
  static readonly PhlogistonSolidification = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_phlogiston_solidification'
  ) as ClientElementalReactionType

  /**
   * PhlogistonSolidificationEnd
   *
   * 固态燃素结束
   */
  static readonly PhlogistonSolidificationEnd = new enumeration(
    'ElementalReactionType',
    'elemental_reaction_type_phlogiston_solidification_end'
  ) as ClientElementalReactionType
}

/** 选择完成原因 */
export class SelectCompletionReason extends enumeration {
  declare private readonly __brandSelectCompletionReason: 'SelectCompletionReason'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Completed by Player
   *
   * 玩家完成：正常完成选择交互
   */
  static readonly CompletedByPlayer = new enumeration(
    'SelectCompletionReason',
    'select_completion_reason_completed_by_player'
  ) as SelectCompletionReason
  /**
   * Timeout
   *
   * 超时关闭：未交互超时后默认返回
   */
  static readonly Timeout = new enumeration(
    'SelectCompletionReason',
    'select_completion_reason_timeout'
  ) as SelectCompletionReason
  /**
   * Fixed-Quantity Refresh
   *
   * 定量刷新：定量刷新弹窗选择完成
   */
  static readonly FixedQuantityRefresh = new enumeration(
    'SelectCompletionReason',
    'select_completion_reason_fixed_quantity_refresh'
  ) as SelectCompletionReason
  /**
   * Refresh All
   *
   * 全量刷新：全量刷新弹窗选择完成
   */
  static readonly RefreshAll = new enumeration(
    'SelectCompletionReason',
    'select_completion_reason_refresh_all'
  ) as SelectCompletionReason
  /**
   * Closed manually
   *
   * 主动关闭：玩家主动关闭（允许放弃选择时）
   */
  static readonly ClosedManually = new enumeration(
    'SelectCompletionReason',
    'select_completion_reason_closed_manually'
  ) as SelectCompletionReason
  /**
   * Closed by Node Graph
   *
   * 节点图关闭：由节点图强制关闭
   */
  static readonly ClosedByNodeGraph = new enumeration(
    'SelectCompletionReason',
    'select_completion_reason_closed_by_node_graph'
  ) as SelectCompletionReason
}

/** 道具变化原因 */
export class ReasonForItemChange extends enumeration {
  declare private readonly __brandReasonForItemChange: 'ReasonForItemChange'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Default
   *
   * 默认
   */
  static readonly Default = new enumeration(
    'ReasonForItemChange',
    'reason_for_item_change_default'
  ) as ReasonForItemChange

  /**
   * Destroy
   *
   * 销毁：道具被直接销毁
   */
  static readonly Destroy = new enumeration(
    'ReasonForItemChange',
    'reason_for_item_change_destroy'
  ) as ReasonForItemChange
  /**
   * Discard
   *
   * 丢弃
   */
  static readonly Discard = new enumeration(
    'ReasonForItemChange',
    'reason_for_item_change_discard'
  ) as ReasonForItemChange
  /**
   * Use
   *
   * 使用：因使用道具导致数量变化
   */
  static readonly Use = new enumeration(
    'ReasonForItemChange',
    'reason_for_item_change_use'
  ) as ReasonForItemChange
  /**
   * Defeat drops
   *
   * 击败掉落：击败敌人后获得/失去
   */
  static readonly DefeatDrops = new enumeration(
    'ReasonForItemChange',
    'reason_for_item_change_defeat_drops'
  ) as ReasonForItemChange
  /**
   * Shop trade
   *
   * 商店交易：商店买卖变动
   */
  static readonly ShopTrade = new enumeration(
    'ReasonForItemChange',
    'reason_for_item_change_shop_trade'
  ) as ReasonForItemChange
  /**
   * Node Graph operation
   *
   * 节点图操作：由节点图逻辑导致的变动
   */
  static readonly NodeGraphOperation = new enumeration(
    'ReasonForItemChange',
    'reason_for_item_change_node_graph_operation'
  ) as ReasonForItemChange
  /**
   * Pick up
   *
   * 拾取：拾取获得
   */
  static readonly PickUp = new enumeration(
    'ReasonForItemChange',
    'reason_for_item_change_pick_up'
  ) as ReasonForItemChange
}

/** 目标类型 */
export class TargetType extends enumeration {
  declare private readonly __brandTargetType: 'TargetType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * None
   *
   * 无目标
   */
  static readonly None = new enumeration('TargetType', 'target_type_none') as TargetType
  /**
   * Allied Faction
   *
   * 友方阵营
   */
  static readonly AlliedFaction = new enumeration(
    'TargetType',
    'target_type_allied_faction'
  ) as TargetType
  /**
   * Hostile Faction
   *
   * 敌对阵营
   */
  static readonly HostileFaction = new enumeration(
    'TargetType',
    'target_type_hostile_faction'
  ) as TargetType
  /**
   * Self
   *
   * 自身
   */
  static readonly Self = new enumeration('TargetType', 'target_type_self') as TargetType
  /**
   * Own Faction
   *
   * 本方阵营
   */
  static readonly OwnFaction = new enumeration(
    'TargetType',
    'target_type_own_faction'
  ) as TargetType
  /**
   * All
   *
   * 全部
   */
  static readonly All = new enumeration('TargetType', 'target_type_all') as TargetType
  /**
   * All Except Self
   *
   * 除自身外全部
   */
  static readonly AllExceptSelf = new enumeration(
    'TargetType',
    'target_type_all_except_self'
  ) as TargetType
  /**
   * Allied Faction (Self Included)
   *
   * 友方阵营（含自身）
   */
  static readonly AlliedFactionSelfIncluded = new enumeration(
    'TargetType',
    'target_type_allied_faction_self_included'
  ) as TargetType
}

/** 触发限制 */
export class TriggerRestriction extends enumeration {
  declare private readonly __brandTriggerRestriction: 'TriggerRestriction'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Trigger Only Once
   *
   * 仅触发一次
   */
  static readonly TriggerOnlyOnce = new enumeration(
    'TriggerRestriction',
    'trigger_restriction_trigger_only_once'
  ) as TriggerRestriction
  /**
   * Trigger Only Once Per Entity
   *
   * 每实体仅触发一次
   */
  static readonly TriggerOnlyOncePerEntity = new enumeration(
    'TriggerRestriction',
    'trigger_restriction_trigger_only_once_per_entity'
  ) as TriggerRestriction
}

/** 打击类型 */
export class HitType extends enumeration {
  declare private readonly __brandHitType: 'HitType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * None
   *
   * 无击中类型
   */
  static readonly None = new enumeration('HitType', 'hit_type_none') as HitType
  /**
   * Default
   *
   * 默认
   */
  static readonly Default = new enumeration('HitType', 'hit_type_default') as HitType
  /**
   * Slash
   *
   * 斩击
   */
  static readonly Slash = new enumeration('HitType', 'hit_type_slash') as HitType
  /**
   * Smash
   *
   * 打击
   */
  static readonly Smash = new enumeration('HitType', 'hit_type_smash') as HitType
  /**
   * Projectile
   *
   * 投射
   */
  static readonly Projectile = new enumeration('HitType', 'hit_type_projectile') as HitType
  /**
   * Piercing Attack
   *
   * 穿刺攻击
   */
  static readonly PiercingAttack = new enumeration('HitType', 'hit_type_piercing_attack') as HitType
}

/** 攻击类型 */
export class AttackType extends enumeration {
  declare private readonly __brandAttackType: 'AttackType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * None
   *
   * 无攻击类型
   */
  static readonly None = new enumeration('AttackType', 'attack_type_none') as AttackType
  /**
   * Melee Attack
   *
   * 近战攻击
   */
  static readonly MeleeAttack = new enumeration(
    'AttackType',
    'attack_type_melee_attack'
  ) as AttackType
  /**
   * Ranged Attack
   *
   * 远程攻击
   */
  static readonly RangedAttack = new enumeration(
    'AttackType',
    'attack_type_ranged_attack'
  ) as AttackType
  /**
   * Default
   *
   * 默认
   */
  static readonly Default = new enumeration('AttackType', 'attack_type_default') as AttackType
}

/** 受击表现等级 */
export class HitPerformanceLevel extends enumeration {
  declare private readonly __brandHitPerformanceLevel: 'HitPerformanceLevel'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Default
   *
   * 默认表现
   */
  static readonly Default = new enumeration(
    'HitPerformanceLevel',
    'hit_performance_level_default'
  ) as HitPerformanceLevel
  /**
   * No Hit Performance
   *
   * 无表现
   */
  static readonly NoHitPerformance = new enumeration(
    'HitPerformanceLevel',
    'hit_performance_level_no_hit_performance'
  ) as HitPerformanceLevel
  /**
   * Hit by Normal Arrow Without Charging
   *
   * 无蓄力普通箭命中
   */
  static readonly HitByNormalArrowWithoutCharging = new enumeration(
    'HitPerformanceLevel',
    'hit_performance_level_hit_by_normal_arrow_without_charging'
  ) as HitPerformanceLevel
  /**
   * Combo Hit
   *
   * 连击
   */
  static readonly ComboHit = new enumeration(
    'HitPerformanceLevel',
    'hit_performance_level_combo_hit'
  ) as HitPerformanceLevel
  /**
   * Normal Hit
   *
   * 普通命中
   */
  static readonly NormalHit = new enumeration(
    'HitPerformanceLevel',
    'hit_performance_level_normal_hit'
  ) as HitPerformanceLevel
  /**
   * Heavy Hit
   *
   * 重击
   */
  static readonly HeavyHit = new enumeration(
    'HitPerformanceLevel',
    'hit_performance_level_heavy_hit'
  ) as HitPerformanceLevel
  /**
   * Strong Impact
   *
   * 强力冲击
   */
  static readonly StrongImpact = new enumeration(
    'HitPerformanceLevel',
    'hit_performance_level_strong_impact'
  ) as HitPerformanceLevel
  /**
   * Ultimate Impact
   *
   * 终极冲击
   */
  static readonly UltimateImpact = new enumeration(
    'HitPerformanceLevel',
    'hit_performance_level_ultimate_impact'
  ) as HitPerformanceLevel
  /**
   * Vertical Launch
   *
   * 垂直击飞
   */
  static readonly VerticalLaunch = new enumeration(
    'HitPerformanceLevel',
    'hit_performance_level_vertical_launch'
  ) as HitPerformanceLevel
  /**
   * Super Launch
   *
   * 强力击飞
   */
  static readonly SuperLaunch = new enumeration(
    'HitPerformanceLevel',
    'hit_performance_level_super_launch'
  ) as HitPerformanceLevel
  /**
   * Long-Range Throw
   *
   * 远程投掷
   */
  static readonly LongRangeThrow = new enumeration(
    'HitPerformanceLevel',
    'hit_performance_level_long_range_throw'
  ) as HitPerformanceLevel
}

interface UnitStatusAdditionFailureReasonValue extends UnitStatusAdditionResult {
  readonly __brandUnitStatusAdditionFailureReason: 'UnitStatusAdditionFailureReason'
}

interface UnitStatusAdditionSuccessTypeValue extends UnitStatusAdditionResult {
  readonly __brandUnitStatusAdditionSuccessType: 'UnitStatusAdditionSuccessType'
}

interface UnitStatusAdditionResultComparisonOverlap extends UnitStatusAdditionResult {
  readonly __brandUnitStatusAdditionResultComparisonOverlap: 'UnitStatusAdditionResultComparisonOverlap'
}

/** 客户端“单位状态添加失败原因”下拉中的值。 */
export type UnitStatusAdditionFailureReason =
  | UnitStatusAdditionFailureReasonValue
  | UnitStatusAdditionResultComparisonOverlap

/** 客户端“单位状态添加成功类型”下拉中的值。 */
export type UnitStatusAdditionSuccessType =
  | UnitStatusAdditionSuccessTypeValue
  | UnitStatusAdditionResultComparisonOverlap

/** 单位状态添加结果 */
export class UnitStatusAdditionResult extends enumeration {
  declare private readonly __brandUnitStatusAdditionResult: 'UnitStatusAdditionResult'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Failed - Unexpected Error
   *
   * 失败：意外错误
   */
  static readonly FailedUnexpectedError = new enumeration(
    'UnitStatusAdditionResult',
    'unit_status_addition_result_failed_unexpected_error'
  ) as UnitStatusAdditionFailureReason
  /**
   * Failed - Operation Paused For Another Process
   *
   * 失败：操作被其他流程暂停
   */
  static readonly FailedOperationPausedForAnotherProcess = new enumeration(
    'UnitStatusAdditionResult',
    'unit_status_addition_result_failed_operation_paused_for_another_process'
  ) as UnitStatusAdditionFailureReason
  /**
   * Failed - Maximum Coexistence Limit Reached
   *
   * 失败：达到可并存上限
   */
  static readonly FailedMaximumCoexistenceLimitReached = new enumeration(
    'UnitStatusAdditionResult',
    'unit_status_addition_result_failed_maximum_coexistence_limit_reached'
  ) as UnitStatusAdditionFailureReason
  /**
   * Failed - Unable To Add Additional Stack
   *
   * 失败：无法增加叠层
   */
  static readonly FailedUnableToAddAdditionalStack = new enumeration(
    'UnitStatusAdditionResult',
    'unit_status_addition_result_failed_unable_to_add_additional_stack'
  ) as UnitStatusAdditionFailureReason
  /**
   * Success - New Status Applied
   *
   * 成功：施加新状态
   */
  static readonly SuccessNewStatusApplied = new enumeration(
    'UnitStatusAdditionResult',
    'unit_status_addition_result_success_new_status_applied'
  ) as UnitStatusAdditionSuccessType
  /**
   * Success - Slot Stacking
   *
   * 成功：槽位叠加
   */
  static readonly SuccessSlotStacking = new enumeration(
    'UnitStatusAdditionResult',
    'unit_status_addition_result_success_slot_stacking'
  ) as UnitStatusAdditionSuccessType
}

/** 单位状态移除策略 */
export class UnitStatusRemovalStrategy extends enumeration {
  declare private readonly __brandUnitStatusRemovalStrategy: 'UnitStatusRemovalStrategy'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * All Coexisting Statuses With The Same Name
   *
   * 所有同名并存状态
   */
  static readonly AllCoexistingStatusesWithTheSameName = new enumeration(
    'UnitStatusRemovalStrategy',
    'unit_status_removal_strategy_all_coexisting_statuses_with_the_same_name'
  ) as UnitStatusRemovalStrategy
  /**
   * Status With Fastest Stack Loss
   *
   * 最快丢失叠层的状态
   */
  static readonly StatusWithFastestStackLoss = new enumeration(
    'UnitStatusRemovalStrategy',
    'unit_status_removal_strategy_status_with_fastest_stack_loss'
  ) as UnitStatusRemovalStrategy
}

/**
 * Unit Status Removal Strategy
 *
 * 单位状态移除策略
 *
 * Alias of {@link UnitStatusRemovalStrategy}; both names refer to the same enum type.
 *
 * {@link UnitStatusRemovalStrategy} 的别名；两个名称指向同一枚举类型。
 */
export { UnitStatusRemovalStrategy as RemovalMethod }

/** 复苏点选取策略 */
export class RevivePointSelectionStrategy extends enumeration {
  declare private readonly __brandRevivePointSelectionStrategy: 'RevivePointSelectionStrategy'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  static readonly Nearest = new enumeration(
    'RevivePointSelectionStrategy',
    'revive_point_selection_strategy_nearest'
  ) as RevivePointSelectionStrategy
  /**
   * Most Recently Activated
   *
   * 最近激活
   */
  static readonly MostRecentlyActivated = new enumeration(
    'RevivePointSelectionStrategy',
    'revive_point_selection_strategy_most_recently_activated'
  ) as RevivePointSelectionStrategy
  /**
   * Highest Priority
   *
   * 优先级最高
   */
  static readonly HighestPriority = new enumeration(
    'RevivePointSelectionStrategy',
    'revive_point_selection_strategy_highest_priority'
  ) as RevivePointSelectionStrategy
  /**
   * Random
   *
   * 随机
   */
  static readonly Random = new enumeration(
    'RevivePointSelectionStrategy',
    'revive_point_selection_strategy_random'
  ) as RevivePointSelectionStrategy
}

/** 受打断状态 */
export class InterruptStatus extends enumeration {
  declare private readonly __brandInterruptStatus: 'InterruptStatus'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Interrupt Resistance Status
   *
   * 打断抗性状态
   */
  static readonly InterruptResistanceStatus = new enumeration(
    'InterruptStatus',
    'interrupt_status_interrupt_resistance_status'
  ) as InterruptStatus
  /**
   * Interrupt Vulnerability Status
   *
   * 易被打断状态
   */
  static readonly InterruptVulnerabilityStatus = new enumeration(
    'InterruptStatus',
    'interrupt_status_interrupt_vulnerability_status'
  ) as InterruptStatus

  /**
   * Interrupt Vulnerable State
   *
   * 易被打断状态
   *
   * Alias of {@link InterruptVulnerabilityStatus}; both names refer to the same enum value.
   *
   * {@link InterruptVulnerabilityStatus} 的别名；两个名称指向同一枚举值。
   */
  static readonly InterruptVulnerableState = InterruptStatus.InterruptVulnerabilityStatus
  /**
   * Protected Status
   *
   * 保护状态
   */
  static readonly ProtectedStatus = new enumeration(
    'InterruptStatus',
    'interrupt_status_protected_status'
  ) as InterruptStatus
}

/** 游玩方式 */
export class GameplayMode extends enumeration {
  declare private readonly __brandGameplayMode: 'GameplayMode'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Play
   *
   * 普通玩法
   */
  static readonly Play = new enumeration('GameplayMode', 'gameplay_mode_play') as GameplayMode

  /**
   * Test Play
   *
   * 普通玩法
   *
   * Alias of {@link Play}; both names refer to the same enum value.
   *
   * {@link Play} 的别名；两个名称指向同一枚举值。
   */
  static readonly TestPlay = GameplayMode.Play
  /**
   * Room Play
   *
   * 房间玩法
   */
  static readonly RoomPlay = new enumeration(
    'GameplayMode',
    'gameplay_mode_room_play'
  ) as GameplayMode
  /**
   * Match Play
   *
   * 对战玩法
   */
  static readonly MatchPlay = new enumeration(
    'GameplayMode',
    'gameplay_mode_match_play'
  ) as GameplayMode
}

/** 输入设备类型 */
export class InputDeviceType extends enumeration {
  declare private readonly __brandInputDeviceType: 'InputDeviceType'
  private constructor() {
    super('')
    throw new Error('you should not create an enum instance')
  }

  /**
   * Keyboard and Mouse
   *
   * 键鼠
   */
  static readonly KeyboardAndMouse = new enumeration(
    'InputDeviceType',
    'input_device_type_keyboard_and_mouse'
  ) as InputDeviceType
  /**
   * Controller
   *
   * 手柄
   */
  static readonly Controller = new enumeration(
    'InputDeviceType',
    'input_device_type_controller'
  ) as InputDeviceType
  /**
   * Touchscreen
   *
   * 触屏
   */
  static readonly Touchscreen = new enumeration(
    'InputDeviceType',
    'input_device_type_touchscreen'
  ) as InputDeviceType
}
