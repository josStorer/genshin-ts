/**
 * Client enum seed ingestion (task 四.1).
 *
 * Reads the two family enum seeds (枚举匹配 dropdown census + explicit node
 * param samples) and derives:
 * - the TS enum class for every bindable enum input pin (server classes are
 *   reused when the value space matches; client-only classes are generated);
 * - the client-only class specs emitted into src/definitions/client_enums.ts;
 * - the value-string -> gia numeric table consumed by the encoder.
 *
 * Shared values encode through parseEnumValue. Client-only values that live
 * in an otherwise shared enum family are emitted into CLIENT_ENUM_VALUES.
 */

import fs from 'node:fs'

// Published July members hidden from the November dropdown; retain their wire
// values for existing scripts. Current options remain in mihoyo_editor_names.
export const LEGACY_CLIENT_ELEMENTAL_REACTION_VALUES = new Set([
  4704, 4709, 4710, 4711, 4713, 4714, 4715, 4721, 4722, 4723, 4724, 4725, 4726, 4732, 4738, 4739
])

type SeedOption = { order?: number; name: string; value: number }

type CensusRow = {
  ioc: number
  enumClassName: string | null
  values: number[]
  options: Array<{ value: number; name: string }>
}

type EnumSeed = {
  family: string
  nodeParamEnums?: Record<
    string,
    { zh: string; genericId: number; param: string; options: SeedOption[] }
  >
  targetEntityParam?: {
    options: SeedOption[]
    sampledNodes: Array<{ genericId: number; zh: string }>
  }
  tacticEnums?: Array<{
    className: string
    options: SeedOption[]
    usedBy: Array<{ genericId: number; zh: string; param: string }>
  }>
  enumMatchCensus: { rows: CensusRow[] }
}

export type ClientEnumMember = {
  name: string
  zhName: string
  value: number
  /** globally unique snake key: the enumeration value string in IR literals */
  key: string
  /** narrower public type for values available only in a subset of graph families */
  typeName?: string
}

export type ClientEnumClass = {
  className: string
  zhName: string
  members: ClientEnumMember[]
  typeInterfaces?: Array<{ name: string; zhName: string }>
}

export type EnumMatchRow = { ioc: number; values: number[] }

export type ClientEnumBinding = {
  /** TS enum class for a non-reflective enum input pin (undefined -> EnumerationValue) */
  resolve(
    record: { genericId: number; displayName: string },
    pin: { index: number; defaultValue?: unknown },
    zhParamName?: string
  ): string | undefined
  /** TS enum class for an enum output pin (undefined -> enumeration) */
  resolveReturn(zhParamName: string | undefined): string | undefined
  /** element enum class for an enum_list input pin (undefined -> EnumerationValue[]) */
  resolveListParam(zhParamName: string | undefined, genericId?: number): string | undefined
  /** element enum class for an enum_list output pin (undefined -> enumeration[]) */
  resolveListReturn(nodeType: string): string | undefined
  /** every bindable class (server + client-only), for same-class overload emission */
  allClasses: string[]
  /** 枚举匹配 classes available to each generic node family, in TS and IR naming forms */
  enumMatchByGenericId: Record<number, { classes: string[]; classKeys: string[] }>
  /** generic id -> ir snake class name -> census rows, for encoder ioc lookup */
  matchRowsByGenericId: Record<number, Record<string, EnumMatchRow[]>>
  /** classes reused from src/definitions/enum.ts, for import emission */
  serverClasses: string[]
  /** client-only classes to emit into src/definitions/client_enums.ts */
  clientOnlyClasses: ClientEnumClass[]
  /** enumeration value string -> gia numeric value (client-only values/classes) */
  valueByKey: Record<string, number>
}

const SEED_PATHS = [
  'resources/client_enum_seed.character_skill.json',
  'resources/client_enum_seed.creation_status.json'
]

const ENUM_MATCH_GENERIC_ID_BY_FAMILY: Record<string, number> = {
  character_skill: 200005,
  creation_status: 200178
}

/**
 * ioc -> existing server enum runtime class. Some rows use a narrower TS type
 * below while retaining this runtime class so existing static enum members
 * continue to select the correct editor row by numeric value.
 */
const SERVER_CLASS_BY_IOC: Record<number, string> = {
  0: 'ComparisonOperator',
  1: 'LogicalOperator',
  2: 'MathematicalOperator',
  3: 'AttackShape',
  4: 'SurvivalStatus',
  5: 'SortBy',
  6: 'RoundingMode',
  7: 'TypeConversion',
  8: 'MotionPathPointType',
  9: 'MotionType',
  10: 'FollowLocationType',
  11: 'FollowCoordinateSystem',
  12: 'ElementalType',
  13: 'EntityType',
  14: 'UnitStatusAdditionResult',
  15: 'UnitStatusAdditionResult',
  16: 'UnitStatusRemovalReason',
  17: 'UnitStatusRemovalStrategy',
  18: 'RevivePointSelectionStrategy',
  19: 'CauseOfBeingDown',
  20: 'TrigonometricFunction',
  21: 'DisruptorDeviceType',
  22: 'DisruptorDeviceOrientation',
  23: 'UIControlGroupStatus',
  24: 'TargetType',
  25: 'MathematicalOperator',
  26: 'HitType',
  27: 'AttackType',
  28: 'HitPerformanceLevel',
  37: 'ElementalReactionType',
  41: 'InputDeviceType'
}

/** Narrow client overload types for editor rows that split one server enum class. */
const ENUM_MATCH_TS_TYPE_BY_IOC: Record<number, string> = {
  2: 'BasicMathematicalOperator',
  6: 'ClientRoundingMode',
  14: 'UnitStatusAdditionFailureReason',
  15: 'UnitStatusAdditionSuccessType',
  25: 'QuickMathematicalOperator',
  37: 'ElementalReactionType | ClientElementalReactionType'
}

/** Family-specific row subsets that need a narrower TS overload. */
const ENUM_MATCH_TS_TYPE_BY_FAMILY_IOC: Record<string, string> = {
  'creation_status:34': 'CreationStatusTypeConversionSame'
}

type ClientOnlySpec = {
  className: string
  zhName: string
  /** English member name per gia value (vendor comments + doc translations) */
  memberByValue: Record<number, string>
  typeInterfaceByFamily?: Record<string, { name: string; zhName: string }>
}

/** census rows without a server counterpart (client-only dropdown classes) */
const CLIENT_ONLY_SPEC_BY_IOC: Record<number, ClientOnlySpec> = {
  29: {
    className: 'TargetSortingRules',
    zhName: '筛选规则',
    memberByValue: {
      1000001: 'DefaultSorting',
      1000002: 'RandomOrder',
      1000003: 'SortFromNearToFar'
    }
  },
  30: {
    className: 'AttackLayerConfig',
    zhName: '攻击盒层级配置',
    memberByValue: { 2601: 'OnlyOnHitHurtbox', 2602: 'OnlyOnHitScene', 2604: 'HitAll' }
  },
  31: {
    className: 'KnockbackDirectionType',
    zhName: '击退方向类型',
    memberByValue: {
      2501: 'LineConnectingAttackerAndHitPoint',
      2502: 'HitboxOnHitDirection',
      2503: 'LineConnectingAttackersOwnerAndHitPoint',
      2504: 'TangentLineBetweenAttackerAndHitPoint',
      2505: 'OppositeDirectionToHit',
      2506: 'AttackersFacingOrientation',
      2507: 'OppositeDirectionToLineConnectingAttackerAndHitPoint'
    }
  },
  32: {
    className: 'RotationType',
    zhName: '转向模式',
    memberByValue: {
      2900: 'TargetFirstThenInput',
      2901: 'InputOrientation',
      2902: 'TargetOrientation',
      2903: 'TargetFirstThenCamera',
      2904: 'CameraOrientation',
      2905: 'InputFirstThenTarget'
    }
  },
  33: {
    className: 'SectorDetectionDirection',
    zhName: '扇形检测方向',
    memberByValue: { 450: 'FromInsideOut', 451: 'Clockwise', 452: 'Counterclockwise' }
  },
  34: {
    className: 'TypeConversionSame',
    zhName: '类型转换',
    typeInterfaceByFamily: {
      creation_status: {
        name: 'CreationStatusTypeConversionSame',
        zhName: '客户端造物状态图“类型转换”下拉中的值'
      }
    },
    memberByValue: {
      800: 'IntegerToBoolean',
      801: 'IntegerToFloatingPoint',
      802: 'IntegerToString',
      803: 'EntityToString',
      804: 'GuidToString',
      805: 'BooleanToInteger',
      806: 'BooleanToString',
      807: 'FloatingPointToInteger',
      808: 'FloatingPointToString',
      809: 'Vector3ToString'
    }
  },
  35: {
    className: 'RetracingType',
    zhName: '溯源类型',
    memberByValue: { 3200: 'Self', 3201: 'SelfOwner', 3202: 'TopLayerSelfOwner' }
  },
  36: {
    className: 'HitLevel',
    zhName: '受击等级',
    memberByValue: {
      3900: 'NoEffect',
      3901: 'LightTremor',
      3902: 'LightHit',
      3903: 'KnockbackHit',
      3904: 'Launch'
    }
  },
  38: {
    className: 'FilterReturnType',
    zhName: '筛选器返回类型',
    memberByValue: { 1000010: 'ReturnBoolean', 10000011: 'ReturnInteger' }
  },
  39: {
    className: 'TargetTypeForCameraOrientationNode',
    zhName: '目标类型（镜头朝向节点用）',
    memberByValue: {
      2000: 'None',
      2001: 'AlliedFaction',
      2002: 'HostileFaction',
      2004: 'OwnFaction',
      2006: 'AllExceptSelf'
    }
  },
  40: {
    className: 'ScanStatus',
    zhName: '扫描状态',
    memberByValue: {
      5000: 'UnusableTarget',
      5001: 'CurrentScanTarget',
      5002: 'CandidateTarget',
      5003: 'ConditionNotMet'
    }
  }
}

/** ioc 42 is a different class per family */
const CLIENT_ONLY_SPEC_BY_FAMILY_IOC42: Record<string, ClientOnlySpec> = {
  character_skill: {
    className: 'PreAimingEndReason',
    zhName: '预瞄准结束原因',
    memberByValue: { 6800: 'None', 6801: 'Completed', 6802: 'Cancelled' }
  },
  creation_status: {
    className: 'TacticType',
    zhName: '战术类型',
    memberByValue: {
      0: 'None',
      6200: 'StayMotionless',
      6201: 'MoveToTheTargetPosition',
      6202: 'MoveToTheTargetEntity',
      6203: 'RotateToTheSpecifiedDirection',
      6204: 'RotateBySpecifiedAngle',
      6205: 'GroundPursuit',
      6206: 'GroundEscape',
      6207: 'GroundIdleRoaming',
      6208: 'ReturnToSpawnPointAfterLeavingBattle',
      6209: 'GroundStandoff',
      6210: 'ExecutePatrol',
      6211: 'RotateTowardsTargetEntity',
      6212: 'AerialPursuit',
      6213: 'AerialEscape',
      6214: 'AerialConfrontation',
      6215: 'AerialIdling',
      6216: 'AerialLanding'
    }
  }
}

/**
 * Classes with no census row, assembled from direct pin samples. RayFilterType:
 * round-3 structural sample fills the dropdown in order 2601/2602/2605/2606
 * (受击盒/场景/物件自身碰撞/光标碰撞盒); vendor comments confirm
 * 2605 = ObjectSelfCollision, and 光标碰撞盒 is the 4th editor option.
 */
const SAMPLED_ONLY_CLASSES: Array<{
  spec: ClientOnlySpec
  options: Array<{ value: number; name: string }>
}> = [
  {
    spec: {
      className: 'RayFilterType',
      zhName: '射线筛选类型',
      memberByValue: {
        2601: 'Hurtbox',
        2602: 'Scene',
        2605: 'ObjectSelfCollision',
        2606: 'CursorHitbox'
      }
    },
    options: [
      { value: 2601, name: '受击盒' },
      { value: 2602, name: '场景' },
      { value: 2605, name: '物件自身碰撞' },
      { value: 2606, name: '光标碰撞盒' }
    ]
  }
]

/** seed sections outside the census (tacticEnums / targetEntityParam) */
const EXTRA_SPEC_BY_ZH: Record<string, ClientOnlySpec> = {
  战术速度: {
    className: 'TacticSpeed',
    zhName: '战术速度',
    memberByValue: { 3601: 'Walk', 3602: 'Run' }
  },
  旋转方向: {
    className: 'RotationDirection',
    zhName: '旋转方向',
    memberByValue: { 6100: 'Default', 6101: 'Clockwise', 6102: 'Counterclockwise' }
  },
  目标实体: {
    className: 'TargetEntity',
    zhName: '目标实体',
    memberByValue: { 6000: 'AggroTarget', 6003: 'Self', 6007: 'StageEntity' }
  }
}

/**
 * zh doc param name -> enum class for enum pins whose sampled default is 0
 * (the value alone cannot identify the class). Evidence: the all-params
 * hitbox sample 指定挂接点打攻击盒_全参数填值 pin values resolved against the
 * census / vendor value spaces — 2001 TargetType, 2101 TriggerRestriction,
 * 400..402 AttackShape, 450 SectorDetectionDirection, 2602 AttackLayerConfig,
 * 1301 ElementalType, 2201 HitType, 2302 AttackType, 2502 KnockbackDirectionType.
 */
const CLASS_BY_ZH_PARAM: Record<string, string> = {
  目标阵营筛选: 'TargetType',
  阵营筛选: 'TargetType',
  触发类型: 'TriggerRestriction',
  攻击盒类型: 'AttackShape',
  攻击盒为扇形时的检测方向: 'SectorDetectionDirection',
  攻击层筛选: 'AttackLayerConfig',
  元素类型: 'ElementalType',
  打击类型: 'HitType',
  攻击类型: 'AttackType',
  受击击退朝向: 'KnockbackDirectionType',
  受击等级: 'HitLevel',
  // character_control_skill 填值样本编码 3111 = SkillSlot_1E（服务器 Skill_Slot 段）
  技能槽位: 'CharacterSkillSlot'
}

/**
 * zh doc output name -> enum class (census evidence: ioc40 扫描状态 /
 * ioc13 实体类型 / ioc41 输入设备类型 / ioc42 战术类型).
 */
const CLASS_BY_ZH_RETURN: Record<string, string> = {
  扫描状态: 'ScanStatus',
  实体类型: 'EntityType',
  输入设备类型: 'InputDeviceType',
  战术类型: 'TacticType',
  // 查询预瞄准结束原因（无/完成/取消，census 6800-6802）
  结束原因: 'PreAimingEndReason'
}

/**
 * zh doc param name -> element enum class for enum_list pins (sample
 * evidence: entity type filter literals encode census entity_type values;
 * ray filter values per SAMPLED_ONLY_CLASSES).
 */
const LIST_CLASS_BY_ZH_PARAM: Record<string, string> = {
  实体类型筛选: 'EntityType',
  攻击盒实体类型筛选列表: 'EntityType',
  命中层筛选: 'RayFilterType'
}

/** nodeType -> element enum class for enum_list outputs (doc names them all 列表) */
const LIST_CLASS_BY_NODE_TYPE: Record<string, string> = {
  get_entity_type_list: 'EntityType',
  get_ray_filter_type_list: 'RayFilterType'
}

/** server classes referenced by the zh maps beyond SERVER_CLASS_BY_IOC */
const EXTRA_SERVER_CLASSES = [
  'BasicMathematicalOperator',
  'CharacterSkillSlot',
  'ClientElementalReactionType',
  'ClientRoundingMode',
  'QuickMathematicalOperator',
  'TriggerRestriction',
  'UnitStatusAdditionFailureReason',
  'UnitStatusAdditionSuccessType'
]

/** Values present only in the client Elemental Reaction Type dropdown. */
const CLIENT_ELEMENTAL_REACTION_MEMBER_BY_VALUE: Record<number, string> = {
  4704: 'Burned',
  4709: 'AntiFire',
  4710: 'Rock',
  4711: 'SlowDown',
  4713: 'Wind',
  4714: 'Electric',
  4715: 'Fire',
  4721: 'SwirlFireAccu',
  4722: 'SwirlWaterAccu',
  4723: 'SwirlElectricAccu',
  4724: 'SwirlIceAccu',
  4725: 'StickRock',
  4726: 'StickWater',
  4732: 'StickGrass',
  4738: 'PhlogistonSolidification',
  4739: 'PhlogistonSolidificationEnd'
}

/**
 * 目标实体 dropdown reuse nodes beyond targetEntityParam.sampledNodes, per the
 * seed's reuseNote (round-2 sampling).
 */
const TARGET_ENTITY_REUSE_ZH = new Set([
  '获取实体位置',
  '获取实体旋转',
  '获取物件预设状态',
  '获取目标生命值',
  '获取目标等级'
])

function camelToSnakeKey(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase()
}

/** conn.value.enum 同款转换（src/runtime/ir_builder.ts camelToSnake），供编码器按类名查表 */
function irSnakeClassName(name: string): string {
  return name.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`).replace(/^_/, '')
}

function enumValueSetKey(values: Iterable<number>): string {
  return [...new Set(values)].sort((a, b) => a - b).join(',')
}

function memberZhName(className: string, zhClassName: string, optionName: string): string {
  for (const prefix of [`${zhClassName}_`, `${zhClassName}-`]) {
    if (optionName.startsWith(prefix)) return optionName.slice(prefix.length)
  }
  return optionName
}

export function buildClientEnumBinding(): ClientEnumBinding {
  const seeds = SEED_PATHS.map((p) => JSON.parse(fs.readFileSync(p, 'utf8')) as EnumSeed)
  const editorEnums = (
    JSON.parse(fs.readFileSync('resources/mihoyo_editor_names.json', 'utf8')) as {
      enums: Array<{ id: number; values: Array<{ value: number; nameZh: string }> }>
    }
  ).enums
  for (const seed of seeds) {
    for (const row of seed.enumMatchCensus.rows) {
      const id =
        row.ioc === 37
          ? 200039
          : row.ioc === 42 && seed.family === 'creation_status'
            ? 200051
            : undefined
      if (id === undefined) continue
      const current = editorEnums.find((entry) => entry.id === id)!
      // Keep previously published values encodable even when the current
      // dropdown hides them; resources/mihoyo_editor_names records its exact set.
      const options = new Map(row.options.map((entry) => [entry.value, entry]))
      for (const entry of current.values)
        options.set(entry.value, { value: entry.value, name: entry.nameZh })
      row.options = [...options.values()]
      row.values = row.options.map((entry) => entry.value)
    }
  }

  const classByValue = new Map<number, string>()
  const classesByValueSet = new Map<string, Set<string>>()
  const bindValue = (value: number, className: string, allowDuplicate = false) => {
    const existing = classByValue.get(value)
    if (existing && existing !== className) {
      if (allowDuplicate) return
      throw new Error(`[error] enum value ${value} claimed by both ${existing} and ${className}`)
    }
    classByValue.set(value, className)
  }

  // 枚举匹配 dropdown rows: generic id -> runtime enum class -> ioc -> value set.
  // The family dimension is required because creation_status row 34 omits value 807.
  const matchTsClassesByGenericId = new Map<number, Set<string>>()
  const matchClassKeysByGenericId = new Map<number, Set<string>>()
  const matchRowsByRuntimeClassByGenericId = new Map<
    number,
    Map<string, Map<number, Set<number>>>
  >()
  const recordMatchRow = (genericId: number, className: string, row: CensusRow) => {
    const rowsByClass =
      matchRowsByRuntimeClassByGenericId.get(genericId) ??
      new Map<string, Map<number, Set<number>>>()
    matchRowsByRuntimeClassByGenericId.set(genericId, rowsByClass)
    const rows = rowsByClass.get(className) ?? new Map<number, Set<number>>()
    rowsByClass.set(className, rows)
    const values = rows.get(row.ioc) ?? new Set<number>()
    rows.set(row.ioc, values)
    for (const value of row.values) values.add(value)
  }

  const supplementalValueByKey: Record<string, number> = {}
  const clientOnlyByName = new Map<string, ClientEnumClass>()
  const addClientOnlyClass = (
    spec: ClientOnlySpec,
    options: Array<{ value: number; name: string }>,
    family?: string
  ) => {
    const typeInterface = family ? spec.typeInterfaceByFamily?.[family] : undefined
    const existing = clientOnlyByName.get(spec.className)
    const cls: ClientEnumClass = existing ?? {
      className: spec.className,
      zhName: spec.zhName,
      members: [],
      typeInterfaces: spec.typeInterfaceByFamily
        ? Object.values(spec.typeInterfaceByFamily)
        : undefined
    }
    if (!existing) clientOnlyByName.set(spec.className, cls)
    for (const option of options) {
      const existingMember = cls.members.find((member) => member.value === option.value)
      if (existingMember) {
        if (typeInterface) existingMember.typeName = typeInterface.name
        continue
      }
      const name = spec.memberByValue[option.value]
      if (!name) {
        throw new Error(
          `[error] ${spec.className} misses an english member name for value ${option.value} (${option.name})`
        )
      }
      cls.members.push({
        name,
        zhName: memberZhName(spec.className, spec.zhName, option.name),
        value: option.value,
        key: `${camelToSnakeKey(spec.className)}_${camelToSnakeKey(name)}`,
        typeName: typeInterface?.name
      })
    }
  }

  for (const seed of seeds) {
    const enumMatchGenericId = ENUM_MATCH_GENERIC_ID_BY_FAMILY[seed.family]
    if (enumMatchGenericId === undefined) {
      throw new Error(`[error] enum-match seed family "${seed.family}" has no generic id`)
    }
    const familyMatchClasses =
      matchTsClassesByGenericId.get(enumMatchGenericId) ?? new Set<string>()
    matchTsClassesByGenericId.set(enumMatchGenericId, familyMatchClasses)
    const familyMatchClassKeys =
      matchClassKeysByGenericId.get(enumMatchGenericId) ?? new Set<string>()
    matchClassKeysByGenericId.set(enumMatchGenericId, familyMatchClassKeys)
    for (const row of seed.enumMatchCensus.rows) {
      const spec =
        row.ioc === 42
          ? CLIENT_ONLY_SPEC_BY_FAMILY_IOC42[seed.family]
          : CLIENT_ONLY_SPEC_BY_IOC[row.ioc]
      const className = spec?.className ?? SERVER_CLASS_BY_IOC[row.ioc]
      if (!className) {
        throw new Error(`[error] census ioc ${row.ioc} (${seed.family}) has no enum class mapping`)
      }
      if (row.enumClassName && spec && row.enumClassName !== spec.zhName) {
        throw new Error(
          `[error] census ioc ${row.ioc} zh name "${row.enumClassName}" != spec "${spec.zhName}"`
        )
      }
      for (const value of row.values) {
        if (value > 0) bindValue(value, className, row.ioc === 34 || row.ioc === 39)
        const clientElementalMember = CLIENT_ELEMENTAL_REACTION_MEMBER_BY_VALUE[value]
        if (row.ioc === 37 && clientElementalMember) {
          supplementalValueByKey[
            `elemental_reaction_type_${camelToSnakeKey(clientElementalMember)}`
          ] = value
        }
      }
      const valueSetKey = enumValueSetKey(row.values)
      const classes = classesByValueSet.get(valueSetKey) ?? new Set<string>()
      classesByValueSet.set(valueSetKey, classes)
      classes.add(className)
      recordMatchRow(enumMatchGenericId, className, row)
      familyMatchClasses.add(
        ENUM_MATCH_TS_TYPE_BY_FAMILY_IOC[`${seed.family}:${row.ioc}`] ??
          ENUM_MATCH_TS_TYPE_BY_IOC[row.ioc] ??
          className
      )
      familyMatchClassKeys.add(irSnakeClassName(className))
      if (spec) addClientOnlyClass(spec, row.options, seed.family)
    }
    for (const tactic of seed.tacticEnums ?? []) {
      const spec = EXTRA_SPEC_BY_ZH[tactic.className]
      if (!spec) throw new Error(`[error] tactic enum class "${tactic.className}" has no spec`)
      for (const option of tactic.options) bindValue(option.value, spec.className)
      addClientOnlyClass(spec, tactic.options)
    }
    if (seed.targetEntityParam) {
      const spec = EXTRA_SPEC_BY_ZH['目标实体']
      for (const option of seed.targetEntityParam.options) bindValue(option.value, spec.className)
      addClientOnlyClass(spec, seed.targetEntityParam.options)
    }
  }

  // sampled-only classes share values with census classes (2601/2602 also
  // belong to AttackLayerConfig), so they never register in classByValue
  for (const { spec, options } of SAMPLED_ONLY_CLASSES) addClientOnlyClass(spec, options)
  addClientOnlyClass(
    {
      className: 'RayHitFilterType',
      zhName: '射线命中层筛选',
      memberByValue: { 2601: 'Hurtbox', 2602: 'Scene', 2605: 'ObjectSelfCollision' }
    },
    editorEnums
      .find((entry) => entry.id === 200053)!
      .values.map((entry) => ({ value: entry.value, name: entry.nameZh }))
  )
  const preAimSpec = {
    className: 'PreAimResultDataType',
    zhName: '预瞄准结果数据获取类型',
    memberByValue: { 6810: 'Default', 6811: 'Current', 6812: 'LastSuccessful' }
  }
  const preAimOptions = editorEnums
    .find((entry) => entry.id === 200054)!
    .values.map((entry) => ({ value: entry.value, name: entry.nameZh }))
  addClientOnlyClass(preAimSpec, preAimOptions)
  for (const option of preAimOptions) bindValue(option.value, preAimSpec.className)

  // explicit (genericId / displayName) bindings for pins whose editor default
  // is 0: the value alone cannot identify the class there
  const explicitByGenericId = new Map<number, string>()
  const explicitByDisplayName = new Map<string, string>()
  for (const seed of seeds) {
    for (const entry of Object.values(seed.nodeParamEnums ?? {})) {
      const classes = classesByValueSet.get(
        enumValueSetKey(entry.options.map((option) => option.value))
      )
      if (!classes?.size) {
        throw new Error(
          `[error] nodeParamEnums ${entry.zh}: option set does not match an enum census row`
        )
      }
      if (classes.size !== 1) {
        throw new Error(
          `[error] nodeParamEnums ${entry.zh}: option set matches multiple classes ` +
            `${[...classes].join(', ')}`
        )
      }
      const [className] = classes
      explicitByGenericId.set(entry.genericId, className)
    }
    for (const sampled of seed.targetEntityParam?.sampledNodes ?? []) {
      explicitByGenericId.set(sampled.genericId, 'TargetEntity')
    }
  }
  for (const zh of TARGET_ENTITY_REUSE_ZH) explicitByDisplayName.set(zh, 'TargetEntity')

  const clientOnlyClasses = [...clientOnlyByName.values()].sort((a, b) =>
    a.className.localeCompare(b.className)
  )
  for (const cls of clientOnlyClasses) cls.members.sort((a, b) => a.value - b.value)

  const valueByKey: Record<string, number> = { ...supplementalValueByKey }
  for (const cls of clientOnlyClasses) {
    for (const m of cls.members) valueByKey[m.key] = m.value
  }

  const serverClasses = [
    ...new Set([...Object.values(SERVER_CLASS_BY_IOC), ...EXTRA_SERVER_CLASSES])
  ].sort()

  const matchRowsByGenericId: Record<number, Record<string, EnumMatchRow[]>> = {}
  for (const [genericId, rowsByClass] of matchRowsByRuntimeClassByGenericId) {
    const result: Record<string, EnumMatchRow[]> = {}
    matchRowsByGenericId[genericId] = result
    for (const className of [...rowsByClass.keys()].sort()) {
      result[irSnakeClassName(className)] = [...rowsByClass.get(className)!]
        .sort(([a], [b]) => a - b)
        .map(([ioc, values]) => ({ ioc, values: [...values].sort((a, b) => a - b) }))
    }
  }
  const enumMatchByGenericId: Record<number, { classes: string[]; classKeys: string[] }> = {}
  for (const [genericId, classes] of matchTsClassesByGenericId) {
    const sortedClasses = [...classes].sort()
    enumMatchByGenericId[genericId] = {
      classes: sortedClasses,
      classKeys: [...(matchClassKeysByGenericId.get(genericId) ?? [])].sort()
    }
  }

  return {
    resolve(record, pin, zhParamName) {
      if (record.genericId === 200301 && pin.index === 0) return 'TargetEntity'
      if (record.genericId === 200302 && pin.index > 0) return 'RayHitFilterType'
      if (record.genericId === 200312 && pin.index > 0) return 'EntityType'
      const v = pin.defaultValue
      if (typeof v === 'number' && v > 0) return classByValue.get(v)
      return (
        explicitByGenericId.get(record.genericId) ??
        explicitByDisplayName.get(record.displayName) ??
        (zhParamName ? CLASS_BY_ZH_PARAM[zhParamName] : undefined)
      )
    },
    resolveReturn(zhParamName) {
      return zhParamName ? CLASS_BY_ZH_RETURN[zhParamName] : undefined
    },
    resolveListParam(zhParamName, genericId) {
      if (genericId === 200301 && zhParamName === '命中层筛选') return 'RayHitFilterType'
      return zhParamName ? LIST_CLASS_BY_ZH_PARAM[zhParamName] : undefined
    },
    resolveListReturn(nodeType) {
      return LIST_CLASS_BY_NODE_TYPE[nodeType]
    },
    serverClasses,
    clientOnlyClasses,
    valueByKey,
    allClasses: [
      ...new Set([...serverClasses, ...clientOnlyClasses.map((c) => c.className)])
    ].sort(),
    enumMatchByGenericId,
    matchRowsByGenericId
  }
}
