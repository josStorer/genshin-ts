# 客户端节点图

Genshin-TS 支持直接用 TypeScript 编写七类客户端节点图。注入前，需要先在编辑器中创建并保存类型相同的客户端节点图，再把它的节点图 ID 填入对应的 `id`。

## 七类入口

| 节点图类型   | TypeScript 入口                 | 入口事件 / 返回值                         | 支持模式   | 简要用途                                             |
| ------------ | ------------------------------- | ----------------------------------------- | ---------- | ---------------------------------------------------- |
| 角色技能     | `g.characterSkill(...)`         | `start`                                   | 仅超限     | 编写角色技能的位移、投射物、攻击盒、预瞄等客户端逻辑 |
| 角色操控技能 | `g.characterControlSkill(...)`  | `start`                                   | 仅超限     | 编写操控运动器、移动、转向和预瞄等角色控制逻辑       |
| 造物技能     | `g.creationSkill(...)`          | `start`                                   | 超限、经典 | 编写造物技能的表现和执行逻辑                         |
| 造物状态     | `g.creationStatus(...)`         | `start1`～`start10`                       | 超限、经典 | 持续判断并执行造物的攻击、索敌、移动等行为           |
| 造物状态决策 | `g.creationStatusDecision(...)` | `start1`～`start10`                       | 超限、经典 | 根据条件选择造物需要执行的状态节点图                 |
| 布尔过滤器   | `g.boolFilter(...)`             | `start`，返回 `boolean` / `bool`          | 超限、经典 | 向引用该过滤器的功能输出最终布尔结果                 |
| 整数过滤器   | `g.intFilter(...)`              | `start`，返回 `bigint` / `number` / `int` | 超限、经典 | 向引用该过滤器的功能输出最终整数结果                 |

所有入口都支持 `id`、`name`、`prefix`、`mode` 和 `lang`。默认使用超限模式；`lang: 'zh'` 会为当前图的 `f` 开启中文节点别名。布尔和整数过滤器还支持 `evaluationInterval`，单位为秒，默认值为 `0.3`。

`f` 的方法会按节点图类型和模式自动收窄。服务器图可用的全局函数或节点不一定能用于客户端图，请以类型提示和 ESLint 结果为准。

常用算术和比较运算符可以直接写；例如 `value > 5` 会编译为当前客户端图的 `greaterThan` 节点。

## 基本写法

下面的 ID 只是占位，使用时请替换成地图中对应类型的真实节点图 ID。

```ts
import { g } from 'genshin-ts/runtime/core'

g.characterSkill({ id: CHARACTER_SKILL_ID }).on('start', (_evt, f) => {
  // 使用角色技能节点，例如位移、投射物或攻击盒。
})

g.characterControlSkill({ id: CHARACTER_CONTROL_SKILL_ID }).on('start', (_evt, f) => {
  // 使用角色操控技能节点，例如操控运动器或预瞄。
})

g.creationSkill({ id: CREATION_SKILL_ID, mode: 'classic' }).on('start', (_evt, f) => {
  // 使用造物技能节点。
})

g.creationStatus({ id: CREATION_STATUS_ID }).on('start1', (_evt, f) => {
  f.executeSkill(true, 1)
})

g.creationStatusDecision({ id: CREATION_STATUS_DECISION_ID }).on('start1', (_evt, f) => {
  f.switchToSelfExecutionStatus(true, CREATION_STATUS_ID, 1)
})

g.boolFilter({
  id: BOOL_FILTER_ID,
  evaluationInterval: 0.5
}).on('start', (_evt, f) => {
  return f.getRandomNumber(1, 10) > 5
})

g.intFilter({ id: INT_FILTER_ID }).on('start', (_evt, f) => {
  return f.getRandomNumber(1, 10)
})
```

在造物状态和造物状态决策图中，`start1`～`start10` 对应编辑器【按顺序唯一执行】的 1～10 号引脚，并按引脚顺序尝试。它们用于拆分和组织代码，不是十个可自由切换的状态。

这两类图还有一项特殊语义：顺序书写的行为节点通过前一个行为的【失败执行】引脚连接。下一条语句只会在前一个行为执行失败时运行，并不是普通 TypeScript 中的无条件顺序执行。

## `clientEntity` 客户端实体辅助函数

`clientEntity(...)` 只能在客户端节点图处理函数内使用，它会根据当前节点图类型和模式暴露可用的客户端实体快捷属性与方法：

- `clientEntity(0)` / `clientEntity(null)`：生成实体占位，保持实体参数引脚不连接。
- `clientEntity(10001)`：通过当前客户端图的 `queryEntityByGuid` 节点查询实体；该节点不可用的图会直接报错。
- `clientEntity(otherEntity)`：保留同一个运行时实体，但把类型收窄为当前客户端图可用的实体快捷方法。常用于 `self` 或 `GameObject.Find(...)` 返回的通用实体。

```ts
g.characterSkill({ id: CHARACTER_SKILL_ID }).on('start', (_evt, f) => {
  const byGuid = clientEntity(10001)
  const fromGameObject = clientEntity(GameObject.Find(10002))
  const placeholder = clientEntity(0)

  // 客户端 f 直接返回的实体已经带有正确的 clientEntity 类型，无需再次包装。
  const typedTarget = f.queryEntityByGuid(10003)

  const targetPosition = fromGameObject.pos
})
```

`clientEntity` 不会复制或替换传入的实体；传入现有实体时，它主要用于类型收窄。客户端节点的普通实体参数通常仍可直接接收 `entity`，只有需要调用客户端实体快捷方法时才需要显式包装。

处理函数里的 `f` 是推荐入口。可复用的顶层客户端函数也可以使用各类型专属的 `gsts.fCharacterSkill`、`gsts.fCharacterControlSkill`、`gsts.fCreationSkill`、`gsts.fCreationStatus`、`gsts.fCreationStatusDecision`、`gsts.fBoolFilter` 和 `gsts.fIntFilter`；`gsts.f` / `gsts.fServer` 仍属于服务器节点图。

## 运行时注意事项

- 官方说明只有在实体的自定义变量组件里预先配置的变量才会同步到客户端，服务器用“设置自定义变量”在运行时新建的变量不在此列（Lua 已在游戏内确认读不到）。
- 负载优化（视野检测）会在本地卸载离角色较远的实体；实体不在本地时，部分纯本地的逻辑（如播放特效）可能不会执行。造物超出角色一定范围后，会在该角色的客户端降频运行（造物的“超出范围降频运行”，默认开启）。

完整功能示例可参考仓库中的 [`tests/manual/features/beyond.ts`](https://github.com/josStorer/genshin-ts/blob/master/tests/manual/features/beyond.ts) 和 [`tests/manual/features/classic.ts`](https://github.com/josStorer/genshin-ts/blob/master/tests/manual/features/classic.ts)。
