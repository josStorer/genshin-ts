/**
 * Align zh-cn and en-us node entries of resources/node_definitions.json for the
 * client_* / detail_* categories.
 *
 * The official zh and en page arrays are misordered relative to each other, so
 * index-based pairing is forbidden (see docs/maintenance/routine-node-maintenance.md).
 * Section pairing is order-preserving but fingerprint-driven: zh pages carry
 * untranslated extra sections (2026-07 pre-aiming/cursor additions) that shift
 * raw section indexes, so zh/en sections are paired by maximizing node
 * fingerprint overlap along the diagonal instead of by index.
 * Alignment uses, per section pair:
 *   1. parameter fingerprint matches unique on both sides
 *   2. seed dictionary entries validated against the unmatched en pool
 *   3. elimination (a fingerprint group reduced to 1v1 by earlier rounds)
 * repeated until a fixpoint. Results are aggregated globally with conflicts
 * reported instead of guessed.
 */

import fs from 'node:fs'

export type DocParam = {
  io: 'in' | 'out' | 'other'
  name: string
  dataType: string
  description: string
}

export type DocNodeEntry = {
  page: string
  section: number
  name: string
  functions: string[]
  params: DocParam[]
}

export type AlignedDocNode = {
  zhName: string
  enName: string
  provenance: 'fingerprint' | 'seed' | 'elimination'
  pages: string[]
  zh: DocNodeEntry
  en: DocNodeEntry
}

export type DocAlignmentReport = {
  pagePairs: number
  zhEntries: number
  matched: number
  matchRate: string
  provenance: Record<string, number>
  conflicts: Array<{ zhName: string; enNames: string[]; chosen: string }>
  unresolved: Array<{ page: string; section: number; zhName: string; fingerprint: string }>
  /** per section with unresolved zh entries: the leftover en candidate pool */
  sectionLeftovers: Array<{ page: string; section: number; zh: string[]; en: string[] }>
  seedMisses: Array<{ zhName: string; expectedEn: string; page: string }>
  /**
   * pages whose en counterpart has no node content (untranslated families such
   * as 角色操控技能节点图); their zh entries can only get fallback names
   */
  zhOnlyPages: Array<{ page: string; entries: number }>
}

export type DocAlignment = {
  /** official zh node name -> aligned doc info */
  byZhName: Map<string, AlignedDocNode>
  /**
   * official zh node name -> all distinct doc variants (primary first). Some
   * names describe different nodes per graph family (e.g. 获取实体位置 takes an
   * entity in skill/filter graphs but a target-selector enum in creation
   * status graphs); consumers pick the variant matching their pin evidence.
   */
  variantsByZhName: Map<string, AlignedDocNode[]>
  report: DocAlignmentReport
}

/**
 * Developer-confirmed zh -> en pairs for fingerprint-identical clusters
 * (comparators, logic ops, trig, list min/max...). Every entry is validated
 * against the unmatched en pool of the same section: a seed whose en name is
 * absent fails the build instead of silently mis-mapping.
 */
const SEED_ZH_TO_EN: Record<string, string> = {
  屏幕坐标转视口坐标: 'Convert Screen Coordinates to Viewport Coordinates',
  视口坐标转屏幕坐标: 'Convert Viewport Coordinates to Screen Coordinates',
  屏幕坐标转世界坐标: 'Convert Screen Coordinates to World Coordinates',
  // comparators / logic / trig / math clusters (identical fingerprints)
  是否大于: 'Greater Than',
  是否小于: 'Less Than',
  是否大于等于: 'Greater Than or Equal To',
  是否小于等于: 'Less Than or Equal To',
  是否相等: 'Equal',
  枚举匹配: 'Enumeration Match',
  逻辑与运算: 'Logical AND Operation',
  逻辑或运算: 'Logical OR Operation',
  逻辑异或运算: 'Logical XOR Operation',
  正弦函数: 'Sine Function',
  余弦函数: 'Cosine Function',
  正切函数: 'Tangent Function',
  反正弦函数: 'Arcsine Function',
  反余弦函数: 'Arccosine Function',
  反正切函数: 'Arctangent Function',
  弧度转角度: 'Radians to Degrees',
  角度转弧度: 'Degrees to Radians',
  绝对值运算: 'Absolute Value Operation',
  加法运算: 'Addition',
  减法运算: 'Subtraction',
  乘法运算: 'Multiplication',
  除法运算: 'Division',
  获取列表最大值: 'Get Maximum Value From List',
  获取列表最小值: 'Get Minimum Value From List',
  拼装列表: 'Assembly List',
  拼装字典: 'Assembly Dictionary',
  建立字典: 'Create Dictionary',
  // vectors
  三维向量加法: '3D Vector Addition',
  三维向量减法: '3D Vector Subtraction',
  三维向量内积: '3D Vector Dot Product',
  三维向量外积: '3D Vector Cross Product',
  三维向量夹角: '3D Vector Angle',
  三维向量旋转: '3D Vector Rotation',
  三维向量归一化: '3D Vector Normalization',
  方向向量转旋转: 'Direction Vector to Rotation',
  朝向转旋转: 'Orientation to Rotation',
  // flow
  双分支: 'Double Branch',
  多分支: 'Multiple Branches',
  // exec cluster: skill / aiming / behavior
  重置技能目标: 'Reset Skill Target',
  强制退出瞄准状态: 'Force Exit Aiming State',
  打断当前技能: 'Interrupt Current Skill',
  清空关键行为记录面板: 'Clear Key Behavior Log Panel',
  设置技能变量: 'Set Skill Variable',
  增加技能变量值: 'Increase Skill Variable Value',
  定点发射投射物: 'Fixed-Point Projectile Launch',
  玩家转向: 'Player Turning',
  移除指定角色扰动装置: 'Remove Specified Character Disruptor Device',
  // exec cluster: hitboxes (fingerprints unreliable across languages here)
  特定位置打攻击盒: 'Trigger Hitbox at Specific Location',
  特定位置打矩形攻击盒: 'Trigger Rectangular Hitbox at Specific Location',
  特定位置打球形攻击盒: 'Trigger Spherical Hitbox at Specific Location',
  特定位置打扇形攻击盒: 'Trigger Sector Hitbox at Specific Location',
  指定挂接点打矩形攻击盒: 'Trigger Rectangular Hitbox at Specified Attachment Point',
  指定挂接点打球形攻击盒: 'Trigger Spherical Hitbox at Specified Attachment Point',
  指定挂接点打扇形攻击盒: 'Trigger Sector Hitbox at Specified Attachment Point',
  // exec cluster: aggro
  设置指定实体的仇恨值: 'Set the Aggro Value of the Specified Entity',
  增加指定实体的仇恨值: 'Increase the Aggro Value of the Specified Entity',
  将目标实体移除出仇恨列表: 'Remove Target Entity From Aggro List',
  嘲讽目标: 'Taunt Target',
  // query cluster: entities
  获取自身实体: 'Get Self Entity',
  获取目标实体: 'Get Target Entity',
  获取关卡实体: 'Get Stage Entity',
  获取实体位置: 'Get Entity Location',
  获取实体旋转: 'Get Entity Rotation',
  获取目标挂接点位置: 'Get Target Attachment Point Location',
  获取目标挂接点旋转: 'Get Target Attachment Point Rotation',
  获取实体类型列表: 'Get Entity Type List',
  获取射线筛选类型列表: 'Get Ray Filter Type List',
  获取指定玩家的角色实体: 'Get Character Entity of Specified Player',
  获取角色归属的玩家实体: 'Get Player Entity to Which the Character Belongs',
  获取指定玩家的前台角色: 'Get Active Character of Specified Player',
  获取玩家的角色列表: "Get Player's Character List",
  获取玩家移动输入: 'Get Player Movement Input',
  获取子实体列表: 'Get Sub-Entity List',
  获取单位攻击目标: 'Get Unit Attack Target',
  获取造物当前目标: "Get Creation's Current Target",
  // query cluster: dictionaries
  查询字典是否包含特定键: 'Query If Dictionary Contains Specific Key',
  查询字典是否包含特定值: 'Query If Dictionary Contains Specific Value',
  获取字典中键组成的列表: 'Get List of Keys From Dictionary',
  获取字典中值组成的列表: 'Get List of Values From Dictionary',
  // query cluster: creation status self-checks
  查询自身距离目标的水平距离: 'Check the Horizontal Distance From Self to Target',
  查询自身距离目标的垂直距离: 'Check the Vertical Distance From Self to Target',
  查询自身距离目标的距离: 'Check the Distance From Self to Target',
  查询自身距离目标的水平角度: 'Check the Horizontal Angle From Self to Target',
  查询自身距离目标的垂直角度: 'Check the Vertical Angle From Self to Target',
  查询目标点是否寻路可达: 'Check Target Position Pathfinding Availability',
  查询自身是否处于交战中: 'Check Whether Self Is in Battle',
  查询自身是否在领地中: 'Check If Self Is in the Territory',
  查询入战时的坐标点: 'Check the Coordinates When Entering Battle',
  获取出生点位置信息: 'Get Spawn Point Location Information',
  // creation cooldown cluster
  设置造物冷却组的时间: 'Set the Time of the Creation Cooldown Group',
  设置造物冷却组的当前时间: 'Set the Current Time of the Creation Cooldown Group',
  设置造物技能的冷却时间: 'Set the CD of the Creation Skill',
  设置造物技能的当前冷却时间: 'Set the Current CD of the Creation Skill',
  // tactics
  '战术：地面追击': 'Tactic: Ground Pursuit',
  获取前一帧执行状态: 'Get Previous Frame Execution Status',
  // pairs whose fingerprint uniqueness was broken by 2026-07 zh-only doc
  // additions (pre-aiming/cursor/coordinate nodes share these fingerprints)
  实体是否携带指定单位状态: 'Whether the Entity Has the Specified Unit Status',
  查询指定实体是否入战: 'Query if Specified Entity is in Combat',
  获取单位标签的实体列表: 'Get Entity List by Unit Tag',
  获取实体当前生效的扫描标签: "Get Entity's Current Active Scan Tags",
  获取实体扫描状态: "Get Entity's Scan Status",
  获取实体的单位标签列表: "Get Entity's Unit Tag List",
  获取射线检测结果: 'Get Ray Detection Result',
  获取局部变量: 'Get Local Variable',
  获取扫描组件可扫描的所有合法对象: 'Get All Valid Entities That Are Scannable by Scan Component',
  获取扫描组件当前扫描到的实体: 'Get Entity Currently Scanned by Scan Component',
  获取指定实体的仇恨列表: 'Get the Aggro List of the Specified Entity',
  获取指定实体的仇恨目标: 'Get the Aggro Target of the Specified Entity',
  获取碰撞触发器内所有实体: 'Get All Entities Within the Collision Trigger'
}

/**
 * Developer-curated en names for entries that only exist on untranslated
 * zh-only doc pages (角色操控技能 pre-aiming/cursor/control-motor/coordinate
 * chapters, 2026-07). The official en shell pages are empty, so these entries
 * are self-aligned from the zh page with node/param en names supplied here;
 * params not listed fall back to positional idents in codegen.
 */
const ZH_ONLY_SEED: Record<string, { en: string; params?: Record<string, string> }> = {
  获取前一帧执行战术: {
    en: 'Get Previous Frame Execution Tactic',
    params: {
      战术类型: 'Tactic Type',
      战术上下文: 'Tactic Context',
      战术持续时长: 'Tactic Duration'
    }
  },
  // coordinate conversions (超限模式)
  世界坐标转屏幕坐标: {
    en: 'World Coordinates to Screen Coordinates',
    params: { 世界坐标: 'World Position', 屏幕X: 'Screen X', 屏幕Y: 'Screen Y' }
  },
  屏幕坐标转世界坐标: {
    en: 'Screen Coordinates to World Coordinates',
    params: { 屏幕X: 'Screen X', 屏幕Y: 'Screen Y', 深度值: 'Depth', 世界坐标: 'World Position' }
  },
  屏幕坐标转视口坐标: {
    en: 'Screen Coordinates to Viewport Coordinates',
    params: { 屏幕X: 'Screen X', 屏幕Y: 'Screen Y', 视口X: 'Viewport X', 视口Y: 'Viewport Y' }
  },
  视口坐标转屏幕坐标: {
    en: 'Viewport Coordinates to Screen Coordinates',
    params: { 视口X: 'Viewport X', 视口Y: 'Viewport Y', 屏幕X: 'Screen X', 屏幕Y: 'Screen Y' }
  },
  // pre-aiming (超限模式)
  完成当前预瞄准: { en: 'Finish Current Pre-Aiming' },
  查询预瞄准结束原因: {
    en: 'Query Pre-Aiming End Reason',
    params: { 预瞄准序号: 'Pre-Aiming Index', 结束原因: 'End Reason' }
  },
  获取当前生效的预瞄准序号: {
    en: 'Get Current Active Pre-Aiming Index',
    params: { 预瞄准序号: 'Pre-Aiming Index' }
  },
  获取指定预瞄准的基准对象: {
    en: 'Get Base Object of Specified Pre-Aiming',
    params: { 预瞄准序号: 'Pre-Aiming Index', 基准对象: 'Base Object' }
  },
  获取预瞄准摇杆是否处于死区: {
    en: 'Get Whether Pre-Aiming Stick Is in Dead Zone',
    params: { 预瞄准序号: 'Pre-Aiming Index', 是否处于死区: 'Is in Dead Zone' }
  },
  获取预瞄射线命中信息: {
    en: 'Get Pre-Aiming Ray Hit Info',
    params: { 预瞄准序号: 'Pre-Aiming Index', 命中位置: 'Hit Position', 命中实体: 'Hit Entity' }
  },
  获取预瞄持续时长: {
    en: 'Get Pre-Aiming Duration',
    params: { 预瞄准序号: 'Pre-Aiming Index', '持续时长（s）': 'Duration Seconds' }
  },
  获取预瞄碰撞检测结果数量: {
    en: 'Get Pre-Aiming Collision Detection Result Count',
    params: { 预瞄准序号: 'Pre-Aiming Index', 结果数量: 'Result Count' }
  },
  获取预瞄结果: {
    en: 'Get Pre-Aiming Result',
    params: {
      预瞄准序号: 'Pre-Aiming Index',
      命中位置: 'Hit Position',
      范围内位置: 'In-Range Position',
      最优合法目标: 'Best Valid Target',
      合法目标列表: 'Valid Target List'
    }
  },
  // cursor (超限模式)
  获取光标是否激活: {
    en: 'Get Whether Cursor Is Active',
    params: { 是否激活: 'Is Active' }
  },
  获取光标命中结果: {
    en: 'Get Cursor Hit Result',
    params: {
      命中实体列表: 'Hit Entity List',
      命中位置列表: 'Hit Position List',
      命中数量: 'Hit Count'
    }
  },
  获取光标屏幕坐标: {
    en: 'Get Cursor Screen Coordinates',
    params: { 屏幕X: 'Screen X', 屏幕Y: 'Screen Y' }
  },
  获取光标视口坐标: {
    en: 'Get Cursor Viewport Coordinates',
    params: { 视口X: 'Viewport X', 视口Y: 'Viewport Y' }
  },
  // high-precision variants of existing nodes
  '获取当前关键行为（高精度）': {
    en: 'Get Current Key Behavior (High Precision)',
    params: {
      行为ID列表: 'Behavior ID List',
      '录入时间列表（s）': 'Record Time List Seconds',
      '录入时间列表（ms）': 'Record Time List Milliseconds'
    }
  },
  '获取当前客户端时间（高精度）': {
    en: 'Get Current Client Time (High Precision)',
    params: {
      '客户端时间（s）': 'Client Time Seconds',
      '客户端时间（ms）': 'Client Time Milliseconds'
    }
  },
  // control motor
  使操控运动器转换至非接地状态: {
    en: 'Set Control Motion Device to Not Grounded',
    params: { 目标操控运动器: 'Target Control Motor', 持续时间: 'Duration' }
  },
  添加临时加速度: {
    en: 'Add Temporary Acceleration',
    params: {
      目标操控运动器: 'Target Control Motor',
      加速度值: 'Acceleration',
      朝向: 'Direction',
      持续时间: 'Duration'
    }
  },
  添加速度: {
    en: 'Add Acceleration',
    params: {
      目标操控运动器: 'Target Control Motor',
      速度值: 'Velocity',
      朝向: 'Direction',
      持续时间: 'Duration'
    }
  },
  添加临时运动参数值: {
    en: 'Add Temporary Movement Parameters',
    params: {
      操控运动器: 'Control Motor',
      前进加速度: 'Forward Acceleration',
      后退加速度: 'Backward Acceleration',
      转向速率: 'Turning Rate',
      基础阻力减速度: 'Base Drag Deceleration',
      阻力系数: 'Drag Coefficient',
      最大前进速度: 'Max Forward Speed',
      最大后退速度: 'Max Backward Speed'
    }
  },
  获取操控运动器运动参数: {
    en: "Get Control Motion Device's Movement Parameters",
    params: {
      操控运动器: 'Control Motor',
      前进加速度: 'Forward Acceleration',
      后退加速度: 'Backward Acceleration',
      转向速率: 'Turning Rate',
      基础阻力减速度: 'Base Drag Deceleration',
      阻力系数: 'Drag Coefficient',
      最大前进速度: 'Max Forward Speed',
      最大后退速度: 'Max Backward Speed'
    }
  },
  获取操控运动器前向: {
    en: "Get Control Motion Device's Forward Direction",
    params: { 操控运动器: 'Control Motor', 前向: 'Forward Direction' }
  },
  获取操控运动器当前速度: {
    en: "Get Control Motion Device's Current Speed",
    params: { 操控运动器: 'Control Motor', 速度大小: 'Speed', 速度方向: 'Velocity Direction' }
  },
  获取操控运动器是否接地: {
    en: 'Get Control Motion Device Grounded Status',
    params: { 目标操控运动器: 'Target Control Motor', 是否接地: 'Is Grounded' }
  },
  获取操控运动器目标转向方向: {
    en: "Get Control Motion Device's Target Turn Direction",
    params: { 操控运动器: 'Control Motor', 目标转向方向: 'Target Turning Direction' }
  },
  获取当前激活操控运动器列表: {
    en: 'Get Currently Activated Control Motion Device List',
    params: { 操控运动器列表: 'Control Motor List' }
  },
  获取当前跟随操控运动器: {
    en: 'Get Currently Followed Control Motion Device',
    params: { 跟随操控运动器: 'Following Control Motor' }
  }
}

/**
 * Sample-derived display names (from vendor sample file names) that differ from
 * the official doc zh node names. Bridges metadata displayName -> doc zh name.
 * Keys may be family-qualified (`subType:displayName`) when the official docs
 * name the same generic node differently per graph family.
 */
export const METADATA_ZH_TO_DOC_ZH: Record<string, string> = {
  查询字典中值组成的列表: '获取字典中值组成的列表',
  查询字典中键组成的列表: '获取字典中键组成的列表',
  获取复杂造物当前释放的技能: '获取复杂造物当前施放的技能',
  // sample filenames use half-width parens; doc zh names are full-width
  '获取当前关键行为(高精度)': '获取当前关键行为（高精度）',
  '获取当前客户端时间(高精度)': '获取当前客户端时间（高精度）',
  // same generic node (200075); official docs name it per family
  'character_skill:恢复生命值': '角色恢复生命值',
  'creation_skill:恢复生命值': '造物恢复生命值'
}

/** metadata displayName (+ family) -> aligned doc node, applying the bridges */
export function lookupDocNode(
  alignment: DocAlignment,
  subType: string,
  displayName: string
): AlignedDocNode | undefined {
  const docZh =
    METADATA_ZH_TO_DOC_ZH[`${subType}:${displayName}`] ??
    METADATA_ZH_TO_DOC_ZH[displayName] ??
    displayName
  return alignment.byZhName.get(docZh)
}

/** all doc shape variants for a metadata displayName (primary variant first) */
export function lookupDocNodeVariants(
  alignment: DocAlignment,
  subType: string,
  displayName: string
): AlignedDocNode[] {
  const docZh =
    METADATA_ZH_TO_DOC_ZH[`${subType}:${displayName}`] ??
    METADATA_ZH_TO_DOC_ZH[displayName] ??
    displayName
  return alignment.variantsByZhName.get(docZh) ?? []
}

const TYPE_TAGS: Array<[RegExp, string]> = [
  [/布尔值?列表|boolean list/gi, 'BL'],
  [/整数列表|integer list/gi, 'IL'],
  [/浮点数?列表|float(?:ing point)? (?:number )?list|floating point list/gi, 'FL'],
  [/字符串列表|string list/gi, 'SL'],
  [/三维向量列表|3d vector list/gi, 'VL'],
  [/实体列表|entity list/gi, 'EL'],
  [/枚举列表|enumerations? list|enumerationd list/gi, 'NL'],
  [/配置ID列表|config(?:uration)? id list/gi, 'CL'],
  [/GUID列表|guid list/gi, 'UL'],
  [/布尔值?|boolean/gi, 'B'],
  [/整数|integer/gi, 'I'],
  [/浮点数?|float(?:ing point numbers?)?/gi, 'F'],
  [/字符串|string/gi, 'S'],
  [/三维向量|3d vector/gi, 'V'],
  [/实体|entity|emtity/gi, 'E'],
  [/枚举|enumerations?|enumerationd|enum/gi, 'N'],
  [/泛型|generic/gi, 'G'],
  [/列表|list/gi, 'L'],
  [/字典|dictionary/gi, 'D'],
  [/GUID/gi, 'U'],
  [/配置ID|config(?:uration)? id/gi, 'C'],
  [/预制体ID|prefab id/gi, 'P'],
  [/局部变量|local variable/gi, 'W'],
  [/自定义变量快照|custom variable snapshot/gi, 'X'],
  [/结构体?|structure/gi, 'T'],
  [/阵营|faction/gi, 'A']
]

/** doc data_type text -> single-letter tag ('' empty, '?' unknown) */
export function docTypeTag(dataType: string): string {
  return typeTag(dataType)
}

function typeTag(dataType: string): string {
  let s = String(dataType ?? '').trim()
  for (const [re, tag] of TYPE_TAGS) {
    if (re.test(s)) {
      re.lastIndex = 0
      return tag
    }
    re.lastIndex = 0
  }
  return s ? '?' : ''
}

function ioTag(io: string): DocParam['io'] {
  // tolerate doc typos like "Input Paraneter"
  if (/入参|input/i.test(io)) return 'in'
  if (/出参|output/i.test(io)) return 'out'
  return 'other'
}

function fingerprint(params: DocParam[]): string {
  // docs sometimes mislabel io (bare "Parameter", named labels); everything not
  // explicitly an output is treated as an input for matching purposes
  return params.map((p) => `${p.io === 'out' ? 'o' : 'i'}${typeTag(p.dataType)}`).join(',')
}

/** normalize curly quotes/whitespace so spelling variants collapse to one form */
function canonicalEnName(name: string): string {
  return name
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseEntries(page: unknown, slug: string): DocNodeEntry[] {
  const out: DocNodeEntry[] = []
  const sections = (page as { sections?: Array<{ nodes?: unknown[] }> }).sections ?? []
  sections.forEach((section, sectionIndex) => {
    for (const rawNode of section.nodes ?? []) {
      const node = rawNode as {
        name?: string
        functions?: string[]
        parameters?: Array<{ io?: string; name?: string; data_type?: string; description?: string }>
      }
      const name = node.name?.trim()
      if (!name) continue
      out.push({
        page: slug,
        section: sectionIndex,
        name,
        functions: (node.functions ?? []).map((f) => String(f).trim()).filter(Boolean),
        params: (node.parameters ?? []).map((p) => {
          const rawIo = (p.io ?? '').trim()
          const io = ioTag(rawIo)
          return {
            io,
            // The official EN page for Tactic: Ground Pursuit stores all 11
            // parameter labels in `io` instead of `name`. Only use that field
            // as a label when it is not an actual input/output marker.
            name: (p.name ?? '').trim() || (io === 'other' ? rawIo : ''),
            dataType: (p.data_type ?? '').trim(),
            description: (p.description ?? '').trim()
          }
        })
      })
    }
  })
  return out
}

type SectionMatch = {
  zh: DocNodeEntry
  en: DocNodeEntry
  provenance: AlignedDocNode['provenance']
}

/** fingerprint-multiset overlap ratio between a zh and an en section */
function sectionSimilarity(zh: DocNodeEntry[], en: DocNodeEntry[]): number {
  if (!zh.length || !en.length) return 0
  const counts = new Map<string, number>()
  for (const n of zh) {
    const k = fingerprint(n.params)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  let overlap = 0
  for (const n of en) {
    const k = fingerprint(n.params)
    const c = counts.get(k) ?? 0
    if (c > 0) {
      overlap++
      counts.set(k, c - 1)
    }
  }
  return overlap / Math.max(zh.length, en.length)
}

/**
 * Order-preserving zh/en section pairing (LCS-style DP maximizing fingerprint
 * overlap). Handles zh-only inserted sections without shifting later pairs.
 */
function pairSections(
  zhSections: DocNodeEntry[][],
  enSections: DocNodeEntry[][]
): Array<[number, number]> {
  const Z = zhSections.length
  const E = enSections.length
  const sim: number[][] = zhSections.map((zh) => enSections.map((en) => sectionSimilarity(zh, en)))
  const dp: number[][] = Array.from({ length: Z + 1 }, () => new Array<number>(E + 1).fill(0))
  for (let i = 1; i <= Z; i++) {
    for (let j = 1; j <= E; j++) {
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      if (sim[i - 1][j - 1] > 0) {
        dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - 1] + sim[i - 1][j - 1])
      }
    }
  }
  const pairs: Array<[number, number]> = []
  let i = Z
  let j = E
  while (i > 0 && j > 0) {
    if (
      sim[i - 1][j - 1] > 0 &&
      Math.abs(dp[i][j] - (dp[i - 1][j - 1] + sim[i - 1][j - 1])) < 1e-9
    ) {
      pairs.push([i - 1, j - 1])
      i--
      j--
    } else if (dp[i][j] === dp[i - 1][j]) {
      i--
    } else {
      j--
    }
  }
  return pairs.reverse()
}

function alignSection(
  zhNodes: DocNodeEntry[],
  enNodes: DocNodeEntry[],
  seedMisses: DocAlignmentReport['seedMisses']
): { matches: SectionMatch[]; unresolvedZh: DocNodeEntry[]; unresolvedEn: DocNodeEntry[] } {
  const matches: SectionMatch[] = []
  let zhPool = [...zhNodes]
  let enPool = [...enNodes]

  const take = (zh: DocNodeEntry, en: DocNodeEntry, provenance: AlignedDocNode['provenance']) => {
    matches.push({ zh, en, provenance })
    zhPool = zhPool.filter((n) => n !== zh)
    enPool = enPool.filter((n) => n !== en)
  }

  let changed = true
  let firstRound = true
  while (changed) {
    changed = false

    // round A: fingerprints unique on both sides
    const zhByFp = new Map<string, DocNodeEntry[]>()
    for (const n of zhPool) {
      const k = fingerprint(n.params)
      zhByFp.set(k, [...(zhByFp.get(k) ?? []), n])
    }
    const enByFp = new Map<string, DocNodeEntry[]>()
    for (const n of enPool) {
      const k = fingerprint(n.params)
      enByFp.set(k, [...(enByFp.get(k) ?? []), n])
    }
    for (const [fp, zhGroup] of zhByFp) {
      const enGroup = enByFp.get(fp) ?? []
      if (zhGroup.length === 1 && enGroup.length === 1) {
        take(zhGroup[0], enGroup[0], firstRound ? 'fingerprint' : 'elimination')
        changed = true
      }
    }

    // round B: seed entries against the remaining en pool
    for (const zh of [...zhPool]) {
      const expectedEn = SEED_ZH_TO_EN[zh.name]
      if (!expectedEn) continue
      const candidates = enPool.filter(
        (en) => canonicalEnName(en.name) === canonicalEnName(expectedEn)
      )
      if (candidates.length === 1) {
        take(zh, candidates[0], 'seed')
        changed = true
      } else if (candidates.length === 0 && firstRound) {
        seedMisses.push({ zhName: zh.name, expectedEn, page: zh.page })
      }
    }

    firstRound = false
  }

  return { matches, unresolvedZh: zhPool, unresolvedEn: enPool }
}

/** Pins added in 7.2 that the seeds do not list. */
const SEED_PARAM_FALLBACK: Record<string, string> = { 获取类型: 'Result Data Type' }

/**
 * Match for a seeded zh entry. When the en page has an entry under the seeded
 * name (alignment left it unpaired because its pins differ), its description is kept.
 */
function seedMatch(
  zh: DocNodeEntry,
  seed: (typeof ZH_ONLY_SEED)[string],
  enEntries: DocNodeEntry[]
): SectionMatch {
  const en = enEntries.find((entry) => canonicalEnName(entry.name) === canonicalEnName(seed.en))
  return {
    zh,
    en: {
      page: zh.page,
      section: zh.section,
      name: seed.en,
      functions: en?.functions ?? [],
      params: zh.params.map((p) => {
        const name = seed.params?.[p.name] ?? SEED_PARAM_FALLBACK[p.name] ?? ''
        return {
          io: p.io,
          name,
          dataType: p.dataType,
          description: en?.params.find((param) => param.name === name)?.description ?? ''
        }
      })
    },
    provenance: 'seed'
  }
}

export function buildDocNameAlignment(defsPath = 'resources/node_definitions.json'): DocAlignment {
  const defs = JSON.parse(fs.readFileSync(defsPath, 'utf8')) as Record<string, unknown>

  const seedMisses: DocAlignmentReport['seedMisses'] = []
  const allMatches: SectionMatch[] = []
  const unresolved: DocAlignmentReport['unresolved'] = []
  const sectionLeftovers: DocAlignmentReport['sectionLeftovers'] = []
  const zhOnlyPages: DocAlignmentReport['zhOnlyPages'] = []
  let pagePairs = 0
  let zhEntries = 0

  for (const [slug, page] of Object.entries(defs)) {
    if (slug === '__summary__' || !slug.endsWith('_zh-cn')) continue
    if (!/^(client_|detail_)/.test(slug)) continue
    const enPage = defs[slug.replace(/_zh-cn$/, '_en-us')]
    if (!enPage) continue

    const zhAll = parseEntries(page, slug)
    const enAll = parseEntries(enPage, slug.replace(/_zh-cn$/, '_en-us'))
    if (zhAll.length && !enAll.length) {
      // untranslated family (empty en shell page): self-align entries that
      // have a developer-curated en name; the rest stay unmatched
      zhOnlyPages.push({ page: slug, entries: zhAll.length })
      for (const zh of zhAll) {
        const seed = ZH_ONLY_SEED[zh.name]
        if (seed) allMatches.push(seedMatch(zh, seed, []))
      }
      continue
    }
    pagePairs++
    zhEntries += zhAll.length
    const zhSectionCount = Math.max(...zhAll.map((n) => n.section + 1), 0)
    const enSectionCount = Math.max(...enAll.map((n) => n.section + 1), 0)
    const zhSections = Array.from({ length: zhSectionCount }, (_, s) =>
      zhAll.filter((n) => n.section === s)
    )
    const enSections = Array.from({ length: enSectionCount }, (_, s) =>
      enAll.filter((n) => n.section === s)
    )
    const enSectionByZh = new Map(pairSections(zhSections, enSections))
    const pairedEn = new Set(enSectionByZh.values())

    for (let s = 0; s < Math.max(zhSectionCount, enSectionCount); s++) {
      const enIndex = enSectionByZh.get(s)
      const { matches, unresolvedZh, unresolvedEn } = alignSection(
        zhSections[s] ?? [],
        enIndex === undefined ? [] : enSections[enIndex],
        seedMisses
      )
      // en sections with no zh partner are reported as pure leftovers
      if (s < enSectionCount && !pairedEn.has(s)) unresolvedEn.push(...enSections[s])
      allMatches.push(...matches)
      for (const zh of unresolvedZh) {
        // November translations moved whole sections and still omit several
        // new pins. Keep the reviewed Chinese-name mapping for these entries.
        const seed = ZH_ONLY_SEED[zh.name]
        if (seed) {
          allMatches.push(seedMatch(zh, seed, enAll))
          continue
        }
        unresolved.push({
          page: slug,
          section: s,
          zhName: zh.name,
          fingerprint: fingerprint(zh.params)
        })
      }
      if (unresolvedZh.length || unresolvedEn.length) {
        sectionLeftovers.push({
          page: slug,
          section: s,
          zh: unresolvedZh.map((n) => `${n.name} [${fingerprint(n.params)}]`),
          en: unresolvedEn.map((n) => `${n.name} [${fingerprint(n.params)}]`)
        })
      }
    }
  }

  // global aggregation; official pages carry spelling variants of the same en
  // name (casing, Query/Check drift), resolved by majority vote with client_*
  // pages preferred, and every variant group reported for review. Matches are
  // first split by zh parameter fingerprint: some zh names describe different
  // node shapes per graph family (e.g. 获取实体位置 entity vs selector-enum).
  const matchesByZh = new Map<string, SectionMatch[]>()
  for (const match of allMatches) {
    const list = matchesByZh.get(match.zh.name) ?? []
    list.push(match)
    matchesByZh.set(match.zh.name, list)
  }

  const byZhName = new Map<string, AlignedDocNode>()
  const variantsByZhName = new Map<string, AlignedDocNode[]>()
  const conflicts: DocAlignmentReport['conflicts'] = []
  for (const [zhName, matches] of matchesByZh) {
    const byFingerprint = new Map<string, SectionMatch[]>()
    for (const m of matches) {
      const key = fingerprint(m.zh.params)
      byFingerprint.set(key, [...(byFingerprint.get(key) ?? []), m])
    }
    const groups = [...byFingerprint.values()].sort((a, b) => b.length - a.length)

    const variants: AlignedDocNode[] = []
    for (const [groupIndex, group] of groups.entries()) {
      const votes = new Map<
        string,
        { count: number; clientPage: boolean; matches: SectionMatch[] }
      >()
      for (const m of group) {
        const enName = canonicalEnName(m.en.name)
        const vote = votes.get(enName) ?? { count: 0, clientPage: false, matches: [] }
        vote.count++
        vote.clientPage ||= m.zh.page.startsWith('client_')
        vote.matches.push(m)
        votes.set(enName, vote)
      }
      const ranked = [...votes.entries()].sort(
        (a, b) =>
          b[1].count - a[1].count ||
          Number(b[1].clientPage) - Number(a[1].clientPage) ||
          a[0].localeCompare(b[0])
      )
      const [enName, vote] = ranked[0]
      if (ranked.length > 1 && groupIndex === 0) {
        conflicts.push({ zhName, enNames: ranked.map(([n]) => n), chosen: enName })
      }
      const representative = vote.matches.reduce((best, m) =>
        m.zh.functions.length > best.zh.functions.length ? m : best
      )
      variants.push({
        zhName,
        enName,
        provenance: representative.provenance,
        pages: group.map((m) => m.zh.page),
        zh: representative.zh,
        en: representative.en
      })
    }
    variantsByZhName.set(zhName, variants)
    byZhName.set(zhName, variants[0])
  }

  const provenance: Record<string, number> = {}
  for (const info of byZhName.values()) {
    provenance[info.provenance] = (provenance[info.provenance] ?? 0) + 1
  }

  const report: DocAlignmentReport = {
    pagePairs,
    zhEntries,
    matched: allMatches.length,
    matchRate: `${allMatches.length}/${zhEntries}`,
    provenance,
    conflicts,
    unresolved,
    sectionLeftovers,
    seedMisses,
    zhOnlyPages
  }

  return { byZhName, variantsByZhName, report }
}
