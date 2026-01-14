import {
  configId,
  customVariableSnapshot,
  dict,
  entity,
  faction,
  generic,
  guid,
  vec3
} from '../runtime/value.js'
import {
  CauseOfBeingDown,
  ComparisonOperator,
  ElementalReactionType,
  ElementalType,
  EntityType,
  ReasonForItemChange,
  SelectCompletionReason,
  UnitStatusRemovalReason
} from './enum.js'

export type ServerEventPayloads = {
  // === AUTO-GENERATED START ===
  /**
   * This event is triggered when a Node Graph Variable in the current Node Graph changes; The previous and current values are Generic. Determine the Generic type to correctly receive events for Node Graph Variables of the corresponding type; Vessel-type Node Graph Variables do not provide before-value and after-value Output Parameters
   *
   * 节点图变量变化时: 当前节点图的节点图变量发生变化时，触发该事件; 注意变化前值和变化后值为泛型，需确定其泛型类型后，才能正确接收到对应类型节点图变量的事件; 容器类型的节点图变量没有变化前值和变化后值出参
   */
  whenNodeGraphVariableChanges: {
    /**
     * The Entity associated with this Node Graph
     *
     * 事件源实体: 与节点图关联的实体
     */
    eventSourceEntity: entity
    /**
     * GUID of the Entity associated with this Node Graph
     *
     * 事件源GUID: 与节点图关联的实体的GUID
     */
    eventSourceGuid: guid
    /**
     * Name of the Variable that was changed
     *
     * 变量名: 发生变化的变量的名称
     */
    variableName: string
    /**
     * The Variable's value before the change
     *
     * 变化前值: 变量变化前的值
     */
    preChangeValue: generic
    /**
     * The Variable's value after the change
     *
     * 变化后值: 变量变化后的值
     */
    postChangeValue: generic
  }
  /**
   * This event is triggered when the Custom Variable of the Entity associated with the current Node Graph changes; The previous and current values are Generic. Determine the Generic type before you can correctly receive events for Custom Variables of the corresponding type; Vessel-type Custom Variables do not provide before-value and after-value Output Parameters
   *
   * 自定义变量变化时: 当前节点图所关联实体的自定义变量发生变化时，触发该事件; 注意变化前值和变化后值为泛型，需确定其泛型类型后，才能正确接收到对应类型自定义变量的事件; 容器类型的自定义变量没有变化前值和变化后值出参
   */
  whenCustomVariableChanges: {
    /**
     * The Entity associated with this Node Graph
     *
     * 事件源实体: 与节点图关联的实体
     */
    eventSourceEntity: entity
    /**
     * GUID of the Entity associated with this Node Graph
     *
     * 事件源GUID: 与节点图关联的实体的GUID
     */
    eventSourceGuid: guid
    /**
     * Name of the Variable that was changed
     *
     * 变量名: 发生变化的变量的名称
     */
    variableName: string
    /**
     * The Variable's value before the change
     *
     * 变化前值: 变量变化前的值
     */
    preChangeValue: generic
    /**
     * The Variable's value after the change
     *
     * 变化后值: 变量变化后的值
     */
    postChangeValue: generic
  }
  /**
   * This event is triggered when the Preset Status of the Entity associated with the Node Graph changes
   *
   * 预设状态变化时: 节点图所关联的实体的预设状态发生变化时，触发该事件
   */
  whenPresetStatusChanges: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 预设状态索引
     */
    presetStatusId: bigint
    /**
     *
     * 变化前值
     */
    preChangeValue: bigint
    /**
     *
     * 变化后值
     */
    postChangeValue: bigint
  }
  /**
   * This event is triggered when the preset state of a complex creation is changed using the "Set the preset status
   * value of the complex creation" node (the modified and unmodified values must be different for this event to
   * trigger).; This node graph event can only be received by the node graph of the complex creation.
   *
   * 复杂造物预设状态变化时: 使用“设置复杂造物预设状态值”节点更改复杂造物预设状态时触发（修改前后值需不同才触发）；该事件仅复杂造物节点图可接收
   */
  whenComplexCreationPresetStatusChanges: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 预设状态索引
     */
    presetStatusIndex: bigint
    /**
     *
     * 变化前值
     */
    preChangeValue: bigint
    /**
     *
     * 变化后值
     */
    postChangeValue: bigint
  }
  /**
   * Adds the Unit Status effect [Monitor Movement Speed] to the Character Entity. This event is triggered when the conditions are met
   *
   * 角色移动速度达到条件时: 为角色实体添加单位状态效果【监听移动速率】，达成条件会触发该事件
   */
  whenCharacterMovementSpdMeetsCondition: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 单位状态配置ID
     */
    unitStatusConfigId: configId
    /**
     *
     * 条件：比较类型
     */
    conditionComparisonType: ComparisonOperator
    /**
     *
     * 条件：比较值
     */
    conditionComparisonValue: number
    /**
     *
     * 当前移动速度
     */
    currentMovementSpd: number
  }
  /**
   * This event is triggered when an Entity is created; All types of Entities can trigger this event. Stage Entities, Character Entities, and Player Entities trigger this event when entering a Stage
   *
   * 实体创建时: 实体被创建时，触发该事件; 所有类型的实体均可以触发该事件。关卡实体、角色实体和玩家实体会在进入关卡时触发该事件
   */
  whenEntityIsCreated: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
  }
  /**
   * This event triggers when objects and creations within the stage are destroyed. This event can only trigger on stage entities.
   *
   * 实体销毁时: 关卡内物件和造物被销毁时触发该事件，该事件仅在关卡实体上可以触发
   */
  whenEntityIsDestroyed: {
    /**
     * Destroyed Entity
     *
     * 事件源实体: 被销毁的实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 位置
     */
    location: vec3
    /**
     *
     * 朝向
     */
    orientation: vec3
    /**
     *
     * 实体类型
     */
    entityType: EntityType
    /**
     *
     * 阵营
     */
    faction: faction
    /**
     *
     * 伤害来源
     */
    damageSource: entity
    /**
     *
     * 归属者实体
     */
    ownerEntity: entity
    /**
     * On destroy, captures a snapshot of the Custom Variable component on this Entity. Use the Search Custom Variable Snapshot node to retrieve its Custom Variable values
     *
     * 自定义变量组件快照: 销毁时，该实体上的自定义变量组件的快照。可以使用【查询自定义变量快照】节点获取其中的自定义变量值
     */
    customVariableComponentSnapshot: customVariableSnapshot
  }
  /**
   * This event is triggered when any Entity in the Stage is removed or destroyed, and it can only be triggered on Stage Entities; This event is triggered upon Entity destruction or removal. Therefore, when an Entity is destroyed, it triggers both the [On Entity Destroyed] and [On Entity Removed/Destroyed] events in sequence
   *
   * 实体移除/销毁时: 关卡内任意实体被移除或销毁时触发该事件，该事件仅在关卡实体上可以触发; 实体被销毁或被移除均会触发该事件。因此实体被销毁时，会依次触发【实体销毁时】以及【实体移除/销毁时】事件
   */
  whenEntityIsRemovedDestroyed: {
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
  }
  /**
   * This event is triggered when an Entity's Faction changes
   *
   * 实体阵营变化时: 实体的阵营变化时，触发该事件
   */
  whenEntityFactionChanges: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 变化前阵营
     */
    preChangeFaction: faction
    /**
     *
     * 变化后阵营
     */
    postChangeFaction: faction
  }
  /**
   * When a Character is Downed, the Node Graph on the Character Entity can trigger this event
   *
   * 角色倒下时: 角色倒下时，角色实体上的节点图可以触发该事件
   */
  whenTheCharacterIsDown: {
    /**
     *
     * 角色实体
     */
    characterEntity: entity
    /**
     * Node Graph caused: the Character was Downed by the Destroy Entity node in the Node GraphNormal Down: the Character was Downed because HP reached 0 Abnormal Down: the character was downed due to drowning, falling into an abyss, etc.
     *
     * 原因: 节点图导致：因节点图的【销毁实体】节点导致的角色倒下正常倒下：因生命值变为0导致的角色倒下非正常倒下：因溺水、坠入深渊等导致的角色倒下
     */
    reason: CauseOfBeingDown
    /**
     *
     * 击倒者实体
     */
    knockdownEntity: entity
  }
  /**
   * When a Character is Revived, the Node Graph on the Character Entity can trigger this event
   *
   * 角色复苏时: 角色复苏时，角色实体上的的节点图可以触发该事件
   */
  whenCharacterRevives: {
    /**
     *
     * 角色实体
     */
    characterEntity: entity
  }
  /**
   * This event is triggered on the Player Entity's Node Graph when the Player completes teleportation; This event is also triggered when a Player enters a Stage for the first time
   *
   * 玩家传送完成时: 玩家传送完成时，在玩家实体的节点图上可以触发该事件
   */
  whenPlayerTeleportCompletes: {
    /**
     *
     * 玩家实体
     */
    playerEntity: entity
    /**
     *
     * 玩家GUID
     */
    playerGuid: guid
  }
  /**
   * This event is triggered on the Player Entity's Node Graph when all of the Player's Character Entities are Downed
   *
   * 玩家所有角色倒下时: 玩家的所有角色实体均倒下时，玩家实体的节点图上触发该事件
   */
  whenAllPlayerSCharactersAreDown: {
    /**
     *
     * 玩家实体
     */
    playerEntity: entity
    /**
     * Node Graph caused: the Character was Downed by the Destroy Entity node in the Node GraphNormal Down: the Character was Downed because HP reached 0 Abnormal Down: the character was downed due to drowning, falling into an abyss, etc.
     *
     * 原因: 节点图导致：因节点图的【销毁实体】节点导致的角色倒下正常倒下：因生命值变为0导致的角色倒下非正常倒下：因溺水、坠入深渊等导致的角色倒下
     */
    reason: CauseOfBeingDown
  }
  /**
   * This event is triggered on the Player Entity's Node Graph when all of the Player's Characters are Revived
   *
   * 玩家所有角色复苏时: 玩家的所有角色均复苏时，玩家实体的节点图触发该事件
   */
  whenAllPlayerSCharactersAreRevived: {
    /**
     *
     * 玩家实体
     */
    playerEntity: entity
  }
  /**
   * This event is triggered on the Player Entity when a Character is Downed and then Revived due to drowning, falling into an abyss, or similar reasons
   *
   * 玩家异常倒下并复苏时: 角色因溺水、坠入深渊等原因倒下并复苏时，玩家实体上触发该事件
   */
  whenPlayerIsAbnormallyDownedAndRevives: {
    /**
     *
     * 玩家实体
     */
    playerEntity: entity
  }
  /**
   * Available only in Classic Mode. This event is triggered on the player entity when the active character changes.
   *
   * 前台角色变化时: 仅经典模式可用，前台角色变化时在玩家实体上触发该事件
   */
  whenTheActiveCharacterChanges: {
    /**
     *
     * 玩家实体
     */
    playerEntity: entity
    /**
     *
     * 玩家GUID
     */
    playerGuid: guid
    /**
     *
     * 换下的角色实体
     */
    previousActiveCharacterEntity: entity
    /**
     *
     * 当前前台角色实体
     */
    currentActiveCharacterEntity: entity
  }
  /**
   * The "Collision Trigger Source" range of a runtime entity A enters the "Collision Trigger" range of another runtime entity B; Node graph events will be sent to the entity B configured with "Collision Trigger"
   *
   * 进入碰撞触发器时: 运行中实体A的”碰撞触发源“范围，进入其他运行中实体B的“碰撞触发器”范围。; 会发送节点图事件给配置“碰撞触发器”的实体B
   */
  whenEnteringCollisionTrigger: {
    /**
     * Entity A (referenced above)
     *
     * 进入者实体: 上述中的实体A
     */
    enteringEntity: entity
    /**
     *
     * 进入者实体GUID
     */
    enteringEntityGuid: guid
    /**
     * Entity B (mentioned above)
     *
     * 触发器实体: 上述中的实体B
     */
    triggerEntity: entity
    /**
     *
     * 触发器实体GUID
     */
    triggerEntityGuid: guid
    /**
     * The trigger with the corresponding ID in Entity B's Collision Trigger Component
     *
     * 触发器序号: 实体B碰撞触发器组件中的对应序号的触发器
     */
    triggerId: bigint
  }
  /**
   * When the "Collision Trigger Source" range of active Entity A leaves the "Collision Trigger" range of active Entity B; Node graph events will be sent to the entity B configured with "Collision Trigger"
   *
   * 离开碰撞触发器时: 运行中实体A的“碰撞触发源”范围，离开其他运行中实体B的“碰撞触发器”范围; 会发送节点图事件给配置“碰撞触发器”的实体B
   */
  whenExitingCollisionTrigger: {
    /**
     * Entity A (referenced above)
     *
     * 离开者实体: 上述中的实体A
     */
    exitingEntity: entity
    /**
     *
     * 离开者实体GUID
     */
    exitingEntityGuid: guid
    /**
     * Entity B (mentioned above)
     *
     * 触发器实体: 上述中的实体B
     */
    triggerEntity: entity
    /**
     *
     * 触发器实体GUID
     */
    triggerEntityGuid: guid
    /**
     *
     * 触发器序号
     */
    triggerId: bigint
  }
  /**
   * This event is triggered when an Entity's HP is restored
   *
   * 被恢复生命值时: 实体被恢复生命值时，触发该事件
   */
  whenHpIsRecovered: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 治疗者实体
     */
    healerEntity: entity
    /**
     * Actual healing amount. If the Entity had not lost any HP prior to healing, the amount is 0
     *
     * 恢复量: 实际的恢复量。如果实体恢复前并未损失生命值，则恢复量为0
     */
    recoveryAmount: number
    /**
     *
     * 恢复标签列表
     */
    recoverTagList: string[]
  }
  /**
   * This event is triggered on the initiating Entity when an Entity restores HP to other Entities
   *
   * 发起恢复生命值时: 实体向其他实体恢复生命值时，发起者实体上触发该事件
   */
  whenInitiatingHpRecovery: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 恢复目标实体
     */
    recoverTargetEntity: entity
    /**
     * Actual healing amount. If the Target Entity had not lost any HP prior to healing, the amount is 0
     *
     * 恢复量: 实际的恢复量。如果目标实体恢复前并未损失生命值，则恢复量为0
     */
    recoveryAmount: number
    /**
     *
     * 恢复标签列表
     */
    recoverTagList: string[]
  }
  /**
   * This event is triggered when an Entity's attack hits other Entities
   *
   * 攻击命中时: 实体的攻击命中其他实体时，触发该事件
   */
  whenAttackHits: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 受击者实体
     */
    hitTargetEntity: entity
    /**
     * Actual damage dealt. If no damage is dealt due to Invincible or other reasons, the amount is 0
     *
     * 伤害量: 实际造成的伤害量。因无敌等原因未造成伤害时，伤害量为0
     */
    damage: number
    /**
     *
     * 攻击标签列表
     */
    attackTagList: string[]
    /**
     *
     * 元素类型
     */
    elementalType: ElementalType
    /**
     * Elemental Gauge in the Attack
     *
     * 元素攻击强效: 攻击包含的元素含量
     */
    elementalAttackPotency: number
  }
  /**
   * This event is triggered when the Entity is attacked
   *
   * 受到攻击时: 实体受到攻击时触发该事件
   */
  whenAttacked: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 攻击者实体
     */
    attackerEntity: entity
    /**
     * Actual damage dealt. If no damage is dealt due to Invincible or other reasons, the amount is 0
     *
     * 伤害量: 实际造成的伤害量。因无敌等原因未造成伤害时，伤害量为0
     */
    damage: number
    /**
     *
     * 攻击标签列表
     */
    attackTagList: string[]
    /**
     *
     * 元素类型
     */
    elementalType: ElementalType
    /**
     * Elemental Gauge in the Attack
     *
     * 元素攻击强效: 攻击包含的元素含量
     */
    elementalAttackPotency: number
  }
  /**
   * This event is triggered when an Entity is attacked and enters the Vulnerable Status
   *
   * 进入易受打断状态时: 实体被攻击进入易受打断状态时触发该事件
   */
  whenEnteringAnInterruptibleState: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 攻击者
     */
    attacker: entity
  }
  /**
   * This event is sent to the Component Owner when a Basic Motion Device on the Basic Motion Device Component completes its movement or is disabled
   *
   * 基础运动器停止时: 基础运动器组件上的某个基础运动器完成运动时或被关闭时向组件持有者发送该事件
   */
  whenBasicMotionDeviceStops: {
    /**
     * Component Owner
     *
     * 事件源实体: 组件持有者
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 运动器名称
     */
    motionDeviceName: string
  }
  /**
   * When the Pathing Motion Device reaches a Waypoint, it sends this event to the Owner of the Basic Motion Device Component. This event is triggered only if "Send Event on Waypoint Arrival" is enabled in the Waypoint settings
   *
   * 路径到达路点时: 路径运动器到达路点时发送给基础运动器组件的持有者，需要在路点配置中配置“到达路点发送事件”才会触发该事件
   */
  whenPathReachesWaypoint: {
    /**
     * Component Owner
     *
     * 事件源实体: 组件持有者
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 运动器名称
     */
    motionDeviceName: string
    /**
     *
     * 路径点序号
     */
    pathPointId: bigint
  }
  /**
   * This event is triggered when the On-Hit Detection Component's Owner hits other Entities or the Scene
   *
   * 命中检测触发时: 命中检测组件命中其他实体或场景时组件的持有者触发该事件
   */
  whenOnHitDetectionIsTriggered: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     * If set to False: The environment was hitIf set to True: An Entity was hit. Retrieve values from the Hit Entity output parameter
     *
     * 是否命中受击盒: 为否时，命中的是场景为是时，命中实体，此时可以从【命中实体】出参中取出值
     */
    onHitHurtbox: boolean
    /**
     * Hit Entity is only valid when a Hurtbox is hit
     *
     * 命中实体: 仅当命中受击盒时，命中实体才有意义
     */
    onHitEntity: entity
    /**
     *
     * 命中位置
     */
    onHitLocation: vec3
  }
  /**
   * This event is triggered when the Timer reaches the specified time node
   *
   * 定时器触发时: 定时器运行到指定时间节点时，触发该事件
   */
  whenTimerIsTriggered: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 定时器名称
     */
    timerName: string
    /**
     *
     * 定时器序列序号
     */
    timerSequenceId: bigint
    /**
     *
     * 循环次数
     */
    numberOfLoops: bigint
  }
  /**
   * This event is triggered when the Global Countdown Timer reaches zero; The Global Stopwatch Timer does not trigger this event
   *
   * 全局计时器触发时: 当倒计时的全局计时器计时结束时，会触发该事件; 正计时的全局计时器不会触发该事件
   */
  whenGlobalTimerIsTriggered: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 计时器名称
     */
    timerName: string
  }
  /**
   * Only UI Controls of the Interactive Button and Item Display types trigger this event; The Node Graph event "UI Control Group Triggered" is sent during Stage runtime when a UI Control Group created through an Interactive Button or an Item Display UI Control is interacted with. This event can only be received by the Node Graph of the Player who triggered the interaction
   *
   * 界面控件组触发时: 只有交互按钮和道具展示类型的界面控件，才会触发本事件; 在关卡运行中，通过交互按钮或道具展示界面控件制作的界面控件组，被执行交互操作会发送节点图事件”界面控件组触发时“，此事件只有触发交互的玩家节点图可以获取
   */
  whenUiControlGroupIsTriggered: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     * If the UI control that triggered this event forms a multi-control UI group with other controls, this output parameter returns the corresponding group value
     *
     * 界面控件组组合索引: 如果触发该事件的界面控件和其他界面控件组成了多控件界面控件组(即界面控件组组合)，此出参会有对应的值
     */
    uiControlGroupCompositeIndex: bigint
    /**
     * If the triggering UI control is a single-control UI group, this value represents the ID of that UI control groupIf the triggering UI control is part of a multi-control UI group, this value represents the ID of the control within that group
     *
     * 界面控件组索引: 触发该事件的界面控件为单控件界面控件组，则此处为该界面控件组的索引。触发该事件的界面控件为多控件界面控件组，则此处为组合内对应该界面控件的索引
     */
    uiControlGroupIndex: bigint
  }
  /**
   * This event is triggered when the Stack Count of a Unit Status changes; This event is triggered when Unit Status effects are applied or removed
   *
   * 单位状态变更时: 单位状态的层数发生变化时，触发该事件; 单位状态的施加以及移除都会触发该事件
   */
  whenUnitStatusChanges: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 单位状态配置ID
     */
    unitStatusConfigId: configId
    /**
     *
     * 施加者实体
     */
    applierEntity: entity
    /**
     *
     * 持续时间是否无限
     */
    infiniteDuration: boolean
    /**
     *
     * 状态剩余时长
     */
    remainingStatusDuration: number
    /**
     * Edited Stack Count
     *
     * 状态剩余层数: 变化后的层数
     */
    remainingStatusStacks: bigint
    /**
     * Previous Stack Count
     *
     * 状态原始层数: 变化前的层数
     */
    originalStatusStacks: bigint
    /**
     * ID of the Unit Status slot that changed
     *
     * 槽位序号: 发生变化的单位状态槽位的序号
     */
    slotId: bigint
  }
  /**
   * This event is triggered when a Unit Status is removed for any reason or when its Runtime Duration expires
   *
   * 单位状态结束时: 单位状态因为各种原因被移除或因时长结束时触发该事件
   */
  whenUnitStatusEnds: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 单位状态配置ID
     */
    unitStatusConfigId: configId
    /**
     *
     * 施加者实体
     */
    applierEntity: entity
    /**
     *
     * 持续时间是否无限
     */
    infiniteDuration: boolean
    /**
     *
     * 状态剩余时长
     */
    remainingStatusDuration: number
    /**
     *
     * 状态剩余层数
     */
    remainingStatusStacks: bigint
    /**
     *
     * 移除者实体
     */
    removerEntity: entity
    /**
     * Status Replacement: The Unit Status was removed because it was replaced by another statusDuration Exceeded: The Unit Status exceeded its runtime durationDispelled: The Unit Status was removed directlyStatus Expired: The Unit Status became invalid due to other reasonsClass Changed: The Unit Status was removed due to a class change
     *
     * 移除原因: 其他单位状态顶替：因被施加了顶替状态导致单位状态被移除超出持续时间：超出单位状态持续事件被驱散：单位状态被直接移除状态失效：因其他原因导致的状态失效职业变更：因职业变更导致的状态被移除
     */
    removalReason: UnitStatusRemovalReason
    /**
     * ID of the Unit Status slot that changed
     *
     * 槽位序号: 发生变化的单位状态槽位的序号
     */
    slotId: bigint
  }
  /**
   * Adds the Unit Status effect [Monitor Elemental Reaction] to the Entity. This event is triggered when the conditions are met
   *
   * 发生元素反应事件时: 为实体添加单位状态效果【监听元素反应】，达成条件会触发该事件
   */
  whenElementalReactionEventOccurs: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 元素反应类型
     */
    elementalReactionType: ElementalReactionType
    /**
     *
     * 触发者实体
     */
    triggererEntity: entity
    /**
     *
     * 触发者GUID
     */
    triggererEntityGuid: guid
  }
  /**
   * Adds the Unit Status effect [Add Shield] to the Entity. This event is triggered when the Shield takes damage
   *
   * 护盾受到攻击时: 为实体添加单位状态效果【添加护盾】，受到攻击时触发该事件
   */
  whenShieldIsAttacked: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 攻击者实体
     */
    attackerEntity: entity
    /**
     *
     * 攻击者GUID
     */
    attackerGuid: guid
    /**
     *
     * 单位状态配置ID
     */
    unitStatusConfigId: configId
    /**
     *
     * 攻击前层数
     */
    preAttackLayers: bigint
    /**
     *
     * 攻击后层数
     */
    postAttackLayers: bigint
    /**
     *
     * 攻击前该单位状态的护盾含量
     */
    shieldValueOfThisUnitStatusBeforeAttack: number
    /**
     *
     * 攻击后该单位状态的护盾含量
     */
    shieldValueOfThisUnitStatusAfterAttack: number
  }
  /**
   * When the active tab is selected, it will send an event to the node graph; The Entity Node Graph configured by the Tab Component will receive this event
   *
   * 选项卡选中时: 生效的选项卡被选中后，会向节点图发送事件; 配置选项卡组件的实体节点图，会接收该事件
   */
  whenTabIsSelected: {
    /**
     * Entity with the tab component mounted
     *
     * 事件源实体: 挂载选项卡组件的实体
     */
    eventSourceEntity: entity
    /**
     * GUID of the Entity with the tab component mounted; outputs 0 if none exists
     *
     * 事件源GUID: 挂载选项卡组件的实体GUID，若无则输出0
     */
    eventSourceGuid: guid
    /**
     * The tab ID
     *
     * 选项卡序号: 选项卡的序号
     */
    tabId: bigint
    /**
     * Character Entity that triggers the tab
     *
     * 选择者实体: 触发选项卡时的角色实体
     */
    selectorEntity: entity
  }
  /**
   * Only effective in Classic Aggro Mode; This event is triggered when a Creation enters battle
   *
   * 造物入战时: 仅在经典仇恨模式生效; 造物入战时触发该事件
   */
  whenCreationEntersCombat: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
  }
  /**
   * Only effective in Classic Aggro Mode; This event is triggered when a Creation leaves battle
   *
   * 造物脱战时: 仅在经典仇恨模式生效; 造物脱战时触发该事件
   */
  whenCreationLeavesCombat: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
  }
  /**
   * This event is triggered when a Player's Class Level changes and is sent to the corresponding Player. It can be received in that Class's Node Graph
   *
   * 玩家职业等级变化时: 玩家职业等级变化时触发该事件发送给对应玩家，可以在该职业的职业节点图里收到
   */
  whenPlayerClassLevelChanges: {
    /**
     * Active Player Entity
     *
     * 事件源实体: 生效的玩家实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 变化前等级
     */
    preChangeLevel: bigint
    /**
     *
     * 变化后等级
     */
    postChangeLevel: bigint
  }
  /**
   * This event is triggered when a Player's Class changes and is sent to the corresponding Player. It can be received in the Node Graph of the new Class
   *
   * 玩家职业更改时: 玩家职业更改时触发该事件发送给对应玩家，可以在更改后职业的职业节点图里收到
   */
  whenPlayerClassChanges: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 更改前职业配置ID
     */
    preModificationClassConfigId: configId
    /**
     *
     * 更改后职业配置ID
     */
    postModificationConfigId: configId
  }
  /**
   * This event is triggered when a Player's Class is removed and sent to the corresponding Player. It can be received in the Node Graph of the previous Class
   *
   * 玩家职业解除时: 玩家职业解除时触发该事件发送给对应玩家，可以在更改前职业的职业节点图里收到
   */
  whenPlayerClassIsRemoved: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 更改前职业配置ID
     */
    preModificationClassConfigId: configId
    /**
     *
     * 更改后职业配置ID
     */
    postModificationConfigId: configId
  }
  /**
   * This event is triggered by the [Notify Server Node Graph] Node in the Skill Node Graph. Up to three strings can be passed in
   *
   * 技能节点调用时: 通过技能节点图的【通知服务器节点图】节点触发，可以传入三个字符串类型的值
   */
  whenSkillNodeIsCalled: {
    /**
     *
     * 调用者实体
     */
    callerEntity: entity
    /**
     *
     * 调用者GUID
     */
    callerGuid: guid
    /**
     *
     * 参数1
     */
    parameter1: string
    /**
     *
     * 参数2
     */
    parameter2: string
    /**
     *
     * 参数3
     */
    parameter3: string
  }
  /**
   * Available only in Custom Aggro Mode; This event is triggered when the Aggro Target changes; This event can also be triggered when entering or leaving battle
   *
   * 仇恨目标变化时: 仅自定义仇恨模式可用; 仇恨目标发生变化时，触发该事件; 入战和脱战也可以触发该事件
   */
  whenAggroTargetChanges: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     *
     * 变化前仇恨目标
     */
    preChangeAggroTarget: entity
    /**
     *
     * 变化后仇恨目标
     */
    postChangeAggroTarget: entity
  }
  /**
   * Available only in Custom Aggro Mode; This event is triggered when the Entity itself enters battle
   *
   * 自身入战时: 仅自定义仇恨模式可用; 实体自身入战时，触发该事件
   */
  whenSelfEntersCombat: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
  }
  /**
   * Available only in Custom Aggro Mode; This event is triggered when the Entity itself leaves battle
   *
   * 自身脱战时: 仅自定义仇恨模式可用; 实体自身脱战时，触发该事件
   */
  whenSelfLeavesCombat: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
  }
  /**
   * Monitors Signal trigger events defined in the Signal Manager; The Signal name to monitor must be selected first
   *
   * 监听信号: 监听已在信号管理器中定义的信号触发事件; 需先选择需要监听的信号名
   */
  monitorSignal: {
    /**
     *
     * 事件源实体
     */
    eventSourceEntity: entity
    /**
     *
     * 事件源GUID
     */
    eventSourceGuid: guid
    /**
     * The Entity that sent this signal using the Send Signal node
     *
     * 信号来源实体: 使用【发送信号】节点发送该信号的实体
     */
    signalSourceEntity: entity
  }
  /**
   * This event is triggered on the Player's Node Graph when the Player completes the Deck Selector, or when it is forcibly closed due to time constraints; The output parameters report the Deck Selector's result and the corresponding reason
   *
   * 卡牌选择器完成时: 玩家操作完成卡牌选择器/或者因为时间原因强制关闭等，都会给玩家节点图触发本事件; 出参可以通知本次卡牌选择器的结果，和对应原因
   */
  whenDeckSelectorIsComplete: {
    /**
     * Active Player Entity
     *
     * 目标玩家: 生效的玩家实体
     */
    targetPlayer: entity
    /**
     * When a selection interaction is triggered, valid selection results are returned as this output parameter, and the completion reason is Completed by PlayerWhen a Full Refresh pop-up selection is triggered, the complete selection result list is returned as this output parameter, and the completion reason is Refresh AllWhen a Fixed-Quantity Refresh pop-up selection is triggered, valid selection results are returned as this output parameter, and the completion reason is Fixed-Quantity RefreshWhen the Deck Selector times out with no interaction, the default selection is returned is returned as this output parameter, and the completion reason is TimeoutWhen Allow Discard Selection is enabled and the Deck Selector is closed by the player, the default selection is returned as this output parameter, and the completion reason is Closed ManuallyWhen the Deck Selector is closed via the Node Graph, the default selection is returned as this output parameter, and the completion reason is Closed by Node Graph
     *
     * 选择结果列表: 触发选择选择交互时，合法的选择结果会作为该出参提供，并且完成原因为玩家完成唤起弹窗选择全量刷新，触发刷新交互时，全量的选择结果对应列表会作为该出参提供，并且完成原因为全量刷新唤起弹窗选择部分刷新，触发刷新交互时，合法的选择结果会作为该出参提供，并且完成原因为定量刷新卡牌选择器超时未交互时，默认返回选择会作为该出参提供，并且完成原因为超时关闭卡牌选择器的可放弃选择勾选时，触发关闭交互时，默认返回选择会作为该出参提供，并且完成原因为主动关闭通过节点图关闭卡牌选择器节点造成的卡牌选择器关闭，默认返回选择会作为该出参提供，并且完成原因为节点图关闭
     */
    selectionResultList: bigint[]
    /**
     * Six reason enumerationsCompleted by Player, Refresh All, Fixed-Quantity Refresh, Timeout, Closed Manually, Closed by Node Graph
     *
     * 完成原因: 六种原因枚举玩家完成、全量刷新、定量刷新、超时关闭、主动关闭、节点图关闭
     */
    completionReason: SelectCompletionReason
    /**
     * Referenced Deck Selector ID
     *
     * 卡牌选择器索引: 引用的卡牌选择器索引
     */
    deckSelectorIndex: bigint
  }
  /**
   * This event can only be mounted by Text Bubble Components and is received by the Entity's Node Graph that completed the dialogue; Completion refers to when the final line of dialogue has finished playing
   *
   * 文本气泡完成时: 该事件仅能被挂载文本气泡组件，且完成对话的实体节点图接收; 完成的含义是最后一句对话播放完成
   */
  whenTextBubbleIsCompleted: {
    /**
     * Runtime Entity with the Text Bubble component mounted
     *
     * 气泡归属者实体: 挂载文本气泡组件的运行时实体
     */
    bubbleOwnerEntity: entity
    /**
     * Target Character of the current Bubble dialogue
     *
     * 角色实体: 当前气泡对话的目标角色
     */
    characterEntity: entity
    /**
     * Currently active Text Bubble Config ID
     *
     * 文本气泡配置ID: 当前生效的文本气泡配置ID
     */
    textBubbleConfigurationId: configId
    /**
     * Number of times the currently active Text Bubble has been fully played for this dialogue Character
     *
     * 文本气泡完成次数: 当前生效的文本气泡，对该对话角色，完整播放了几次
     */
    textBubbleCompletionCount: bigint
  }
  /**
   * This event is triggered when Inventory items are sold in the Shop. The Owner of the Shop Component will receive it
   *
   * 商店出售背包物品时: 商店出售背包物品时触发，商店组件的持有者可收到
   */
  whenSellingInventoryItemsInTheShop: {
    /**
     *
     * 商店持有者
     */
    shopOwner: entity
    /**
     *
     * 商店持有者GUID
     */
    shopOwnerGuid: guid
    /**
     *
     * 购买者实体
     */
    buyerEntity: entity
    /**
     *
     * 商店序号
     */
    shopId: bigint
    /**
     *
     * 道具配置ID
     */
    itemConfigId: configId
    /**
     *
     * 购买数量
     */
    purchaseQuantity: bigint
  }
  /**
   * This event is triggered when Custom items are sold in the Shop. The Owner of the Shop Component will receive it
   *
   * 商店出售自定义商品时: 商店出售自定义物品时触发，商店组件的持有者可收到
   */
  whenCustomShopItemIsSold: {
    /**
     *
     * 商店持有者
     */
    shopOwner: entity
    /**
     *
     * 商店持有者GUID
     */
    shopOwnerGuid: guid
    /**
     *
     * 购买者实体
     */
    buyerEntity: entity
    /**
     *
     * 商店序号
     */
    shopId: bigint
    /**
     *
     * 商品序号
     */
    shopItemId: bigint
    /**
     *
     * 购买数量
     */
    purchaseQuantity: bigint
  }
  /**
   * This event is triggered when items are purchased by the Shop. The Owner of the Shop Component will receive it
   *
   * 商店收购道具时: 商店收购道具时触发，商店组件的持有者可收到
   */
  whenSellingItemsToTheShop: {
    /**
     *
     * 商店持有者
     */
    shopOwner: entity
    /**
     *
     * 商店持有者GUID
     */
    shopOwnerGuid: guid
    /**
     *
     * 出售者实体
     */
    sellerEntity: entity
    /**
     *
     * 商店序号
     */
    shopId: bigint
    /**
     *
     * 收购物品字典
     */
    purchaseItemDictionary: dict
  }
  /**
   * This event is triggered when Equipment is equipped. The Owner of the Equipment will receive it. Configure this in the Item Node Graph
   *
   * 装备被穿戴时: 装备被穿戴时触发该事件，装备的持有者可以收到，需要配置在道具节点图里
   */
  whenEquipmentIsEquipped: {
    /**
     *
     * 装备持有者实体
     */
    equipmentHolderEntity: entity
    /**
     *
     * 装备持有者GUID
     */
    equipmentHolderGuid: guid
    /**
     *
     * 装备索引
     */
    equipmentIndex: bigint
  }
  /**
   * This event is triggered when Equipment is unequipped. The Owner of the Equipment will receive it. Configure this in the Item Node Graph
   *
   * 装备被卸下时: 装备被卸下时触发该事件，装备的持有者可以收到，需要配置在道具节点图里
   */
  whenEquipmentIsUnequipped: {
    /**
     *
     * 装备持有者实体
     */
    equipmentOwnerEntity: entity
    /**
     *
     * 装备持有者GUID
     */
    equipmentOwnerGuid: guid
    /**
     *
     * 装备索引
     */
    equipmentIndex: bigint
  }
  /**
   * When Equipment is first obtained and enters the Inventory, it is initialized. The event's output parameters return the unique ID of the Equipment instance. Use this ID to edit the Equipment dynamically. The Owner of the Equipment will receive this event. Configure this in the Item Node Graph
   *
   * 装备初始化时: 当装备首次被获取进入背包时，会进行初始化，此时事件出参会返回装备实例的唯一索引，通过此索引即可对装备进行动态修改。装备的持有者可以收到该事件，需要配置在道具节点图里
   */
  whenEquipmentIsInitialized: {
    /**
     *
     * 装备持有者
     */
    equipmentOwner: entity
    /**
     *
     * 装备持有者GUID
     */
    equipmentOwnerGuid: guid
    /**
     *
     * 装备索引
     */
    equipmentIndex: bigint
  }
  /**
   * This event is triggered when Equipment Affix values change. The Owner of the Equipment will receive it. Configure this in the Item Node Graph
   *
   * 装备的词条数值改变时: 装备词条数值改变时触发该事件，装备的持有者可以收到，需要配置在道具节点图里
   */
  whenEquipmentAffixValueChanges: {
    /**
     *
     * 装备持有者
     */
    equipmentOwner: entity
    /**
     *
     * 装备持有者GUID
     */
    equipmentOwnerGuid: guid
    /**
     *
     * 装备索引
     */
    equipmentIndex: bigint
    /**
     * The corresponding ID of this Entry within the Equipment Affixes
     *
     * 词条序号: 该词条在装备词条上的对应序号
     */
    affixId: bigint
    /**
     *
     * 改变前数值
     */
    preChangeValue: number
    /**
     *
     * 改变后数值
     */
    postChangeValue: number
  }
  /**
   * This event is triggered when an Item is removed from the Inventory (its quantity becomes 0). The Owner of the Inventory Component will receive it
   *
   * 背包道具失去时: 背包内该道具失去，即背包内该道具数量为0时触发该事件，背包组件的持有者可以收到
   */
  whenItemIsLostFromInventory: {
    /**
     *
     * 道具持有者实体
     */
    itemOwnerEntity: entity
    /**
     *
     * 道具持有者GUID
     */
    itemOwnerGuid: guid
    /**
     *
     * 道具配置ID
     */
    itemConfigId: configId
    /**
     *
     * 失去数量
     */
    quantityLost: bigint
  }
  /**
   * This event is triggered when the quantity of Items in the Inventory changes. The Owner of the Inventory Component will receive it
   *
   * 背包道具数量变化时: 背包道具数量发生变化时触发该事件，背包组件的持有者可以收到
   */
  whenTheQuantityOfInventoryItemChanges: {
    /**
     *
     * 道具持有者实体
     */
    itemOwnerEntity: entity
    /**
     *
     * 道具持有者GUID
     */
    itemOwnerGuid: guid
    /**
     *
     * 道具配置ID
     */
    itemConfigId: configId
    /**
     *
     * 变化前数量
     */
    preChangeQuantity: bigint
    /**
     *
     * 变化后数量
     */
    postChangeQuantity: bigint
    /**
     *
     * 变化原因
     */
    reasonForChange: ReasonForItemChange
  }
  /**
   * This event is triggered when a new Item is added to the Inventory. The Owner of the Inventory Component will receive it. This event is not triggered by quantity-only changes
   *
   * 背包道具新增时: 背包内新增该道具时触发事件，背包组件的持有者可以收到。如果没有新增道具仅有数量变化则不会触发该事件
   */
  whenItemIsAddedToInventory: {
    /**
     *
     * 道具持有者实体
     */
    itemOwnerEntity: entity
    /**
     *
     * 道具持有者GUID
     */
    itemOwnerGuid: guid
    /**
     *
     * 道具配置ID
     */
    itemConfigId: configId
    /**
     *
     * 获得数量
     */
    quantityObtained: bigint
  }
  /**
   * This event is triggered when the amount of Inventory Currency changes. The Owner of the Inventory Component will receive it
   *
   * 背包货币数量变化时: 背包货币数量变化时触发该事件，背包组件的持有者可以收到
   */
  whenTheQuantityOfInventoryCurrencyChanges: {
    /**
     *
     * 货币持有者实体
     */
    currencyOwnerEntity: entity
    /**
     *
     * 货币持有者GUID
     */
    currencyOwnerGuid: guid
    /**
     *
     * 货币配置ID
     */
    currencyConfigId: configId
    /**
     *
     * 货币变化值
     */
    currencyChangeValue: bigint
  }
  /**
   * This event is triggered when an Item in the Inventory is used. The Owner of the Inventory Component will receive it
   *
   * 背包内道具被使用时: 背包内道具被使用时触发该事件，背包组件的持有者可以收到
   */
  whenItemsInTheInventoryAreUsed: {
    /**
     *
     * 道具持有者实体
     */
    itemOwnerEntity: entity
    /**
     *
     * 道具持有者GUID
     */
    itemOwnerGuid: guid
    /**
     *
     * 道具配置ID
     */
    itemConfigId: configId
    /**
     *
     * 使用数量
     */
    amountToUse: bigint
  }
  /**
   * When the Send Node Graph Event on Arrival option is enabled for a waypoint in the Patrol template, a Node Graph Event is triggered once the specified conditions are met; This Node Graph Event can only be received by the creation's node graph
   *
   * 造物抵达巡逻路点时: 若在巡逻模板编辑中，勾选了指定路点的到达发送节点图事件选项，则会在满足条件时，收到该节点图事件; 该节点图事件只能造物的节点图收到
   */
  whenCreationReachesPatrolWaypoint: {
    /**
     * Runtime Creation Entity
     *
     * 造物实体: 运行时的造物实体
     */
    creationEntity: entity
    /**
     * The GUID of the Creation. If it was not an initially placed Creation, the output is empty
     *
     * 造物GUID: 造物的GUID，若非初始布设的造物，则输出为空
     */
    creationGuid: guid
    /**
     * The Patrol Template ID currently active on this Creation
     *
     * 当前巡逻模板序号: 造物当前生效的巡逻模板序号
     */
    currentPatrolTemplateId: bigint
    /**
     * The Path ID referenced by the Creation's currently active Patrol Template
     *
     * 当前路径索引: 造物当前生效的巡逻模板引用的路径索引
     */
    currentPathIndex: bigint
    /**
     * The Waypoint ID the Creation has currently reached
     *
     * 当前抵达路点序号: 造物当前抵达的路点序号
     */
    currentReachedWaypointId: bigint
    /**
     * The Waypoint ID the Creation will move to next
     *
     * 即将前往路点序号: 造物即将前往的路点序号
     */
    nextWaypointId: bigint
  }
  // === AUTO-GENERATED END ===
}
