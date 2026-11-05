# __PROJECT_NAME__

这是一个基于 genshin-ts 的千星奇域项目模板。你可以用 TypeScript 写逻辑，编译为节点图并注入到地图。

## 快速开始

```bash
npm install
npm run dev
```

文档站：`https://gsts.moe/zh`

## 项目结构

<!-- snippet:LAYOUT -->
- `src/graphs/main.ts`：服务器节点图，接收 Lua 发来的 `JumpPressed` 信号
- `src/lua/hud.ts`：HUD 容器上的客户端控件脚本（Lua 入口）
- `src/lua/lib/`：Lua 入口用到的普通 TS 模块
- `src/lua/tsconfig.json`：Lua 的类型环境（根目录的 `tsconfig.json` 排除了 `src/lua`）
- `src/resources/signals.ts`：节点图和 Lua 共用的信号定义；配置 `inject` 后会按地图的信号管理器重新生成
<!-- /snippet -->
- `gsts.config.ts`：编译与输出配置
- `dist/`：编译产物（`.gs.ts` / `.json` / `.gia`）
- `docs/EDITOR_BOUNDARIES.md`：英文版代码与编辑器职责边界说明
- `docs/EDITOR_BOUNDARIES_ZH.md`：中文版代码与编辑器职责边界说明与术语参考
- `CLAUDE.md` / `AGENTS.md`：AI 协作指引（建议先读）

## 注入配置示例（可选）

```ts
import type { GstsConfig } from 'genshin-ts'

const config: GstsConfig = {
  compileRoot: './src',
  entries: ['.'],
  outDir: './dist',
  inject: {
    gameRegion: 'China',
    playerId: 1,
    mapId: 1073741849,
    nodeGraphId: 1073741825
  }
}

export default config
```

提示：

- 创建项目时选了地图的话，`inject` 已经填好了。
- `npm run maps` 可列出最近保存的地图，帮助确定 `mapId`。
- 多账号/多服务器时填写 `gameRegion` / `playerId` 以定位地图目录。
- 注入会自动做备份，便于回滚。

<!-- snippet:LUA_README -->
## 客户端 Lua

### 首次运行前

在编辑器里做一次下面几件事，然后保存地图：

1. 新建一个服务器节点图。新地图里的第一个节点图 ID 是 `1073741825`，`src/graphs/main.ts` 用的就是它；不是的话改成实际 ID。节点图保持为空，或者名称以 `_GSTS` 开头。
2. 在信号管理器里添加信号 `JumpPressed`，带一个整数参数 `count`。`src/resources/signals.ts` 里已经有这份定义；注入时会按地图重新生成这个文件，所以名称和参数要一致。
3. 新建一个 HUD 容器，里面放一个名为 `Title` 的文本框。

然后运行 `npm run dev`。配置了 `inject` 时，Lua 文件会复制到地图的 `external_lua_file` 目录；没有配置时留在 `dist/lua/`。注入只复制文件：第一次要在编辑器里添加整个 Lua 输出文件夹，再给 HUD 容器挂载 `lua/hud`。之后改 TS、等编译完成，在编辑器里重新运行地图即可。每次跳跃都会更新 `Title` 里的次数，并把 `JumpPressed` 发给服务器节点图。

### 检查

`npm run typecheck` 同时检查节点图和 Lua（`gsts lua check` 做完整的 Lua 检查）。`npm run lint` 会自动对 `src/lua` 使用 Lua 的 ESLint 规则。

完整说明：https://gsts.moe/zh/doc/lua
<!-- /snippet -->

## 编辑器边界

这个模板默认采用“代码优先”的开发方式，但千星奇域 / Genshin UGC 中仍有不少能力必须先由编辑器手动配置。

语言入口：
- 以中文协作时，优先阅读本文件与 `docs/EDITOR_BOUNDARIES_ZH.md`。
- 若以英文协作，则切换到 `README.md` 与 `docs/EDITOR_BOUNDARIES.md`。

- 代码优先负责运行时规则：玩法流程、状态机、波次逻辑、经济结算、校验、刷怪、结算、信号编排。
- 编辑器负责资源与配置：元件、组件、路径、界面布局/控件组、信号、全局计时器、商店、货币、能力单元、文本气泡、小地图标识、音频资源等。
- 在设计或实现功能前，先查看 `docs/EDITOR_BOUNDARIES_ZH.md`，并明确区分：
  - 代码改动
  - 仍需手动完成的编辑器配置
- 若工作区中存在本地编辑器参考文档，优先以其为准，不要只根据 API 名称猜测编辑器能力。
- 若以中文进行开发沟通，优先沿用本文件与 `docs/EDITOR_BOUNDARIES_ZH.md` 中的术语，避免临时翻译导致表达不地道。

## 入口与事件写法

```ts
import { g } from 'genshin-ts/runtime/core'

g.server({ id: 1073741825 }).on('whenEntityIsCreated', (evt, f) => {
  const p = player(1)
  f.printString(str(p.guid))
})
```

要点：

- `id` 是目标节点图 ID；同 ID 的多个入口会自动合并到同一图。
- 事件名使用字符串字面量（支持中英文名称）。
- 回调参数中 `f` 是节点图函数入口，优先用它做输出、变量操作等。
- 可链式注册多个事件：`g.server(...).on(...).onSignal(...)`。

## g.server 参数说明（与注入安全相关）

常用参数：

- `id`：目标节点图 ID（注入必须匹配该 ID）。
- `name`：节点图显示名称；未指定时默认使用入口文件名。
- `prefix`：是否自动添加 `_GSTS_` 前缀（默认 true）。
- `mode`：图模式，`'beyond' | 'classic'`，默认 `'beyond'`。
- `type`：节点图类型（默认 server/entity）。
- `variables`：声明节点图变量并启用 `f.get` / `f.set`。
- `lang`：`'zh'` 时启用中文事件名与中文函数别名。

模式说明：

- 默认是超限模式（`mode: 'beyond'`），可用节点能力更完整。
- 若需要经典模式，显式写 `mode: 'classic'`。
- 经典模式下不允许 `type: 'class'`，且可用节点能力会少于超限模式。

经典模式示例：

```ts
g.server({
  id: 1073741825,
  mode: 'classic'
}).on('whenEntityIsCreated', (evt, f) => {
  f.printString('classic mode')
})
```

注入安全检查要点：

- 目标 `id` 必须在地图里存在对应节点图。
- 目标节点图需要是 **空图** 或 **名称以 `_GSTS` 开头**，否则注入会被拦截。
- 若你明确知道自己在做什么，可在 `gsts.config.ts` 中设置 `inject.skipSafeCheck = true` 跳过检查。
- 新建节点图后必须 **保存地图**，注入器才能识别该 `id`。
- 建议先创建好一批节点图并保存，再一次性编译注入；否则可能出现“注入 -> 新建 -> 保存”导致注入内容被覆盖的问题。

## 客户端节点图

客户端图也使用 `g.<类型>({ id }).on(...)` 注册。注入前，必须先在编辑器中创建并保存类型相同的客户端节点图，再填写它的真实 ID。

| 节点图类型   | 入口                            | 事件 / 返回值       | 模式       | 用途                                       |
| ------------ | ------------------------------- | ------------------- | ---------- | ------------------------------------------ |
| 角色技能     | `g.characterSkill(...)`         | `start`             | 仅超限     | 角色技能的位移、投射物、攻击盒、预瞄等逻辑 |
| 角色操控技能 | `g.characterControlSkill(...)`  | `start`             | 仅超限     | 操控运动器、移动、转向和预瞄等逻辑         |
| 造物技能     | `g.creationSkill(...)`          | `start`             | 超限、经典 | 造物技能的表现与执行逻辑                   |
| 造物状态     | `g.creationStatus(...)`         | `start1`～`start10` | 超限、经典 | 造物的攻击、索敌、移动等持续行为           |
| 造物状态决策 | `g.creationStatusDecision(...)` | `start1`～`start10` | 超限、经典 | 按条件选择要执行的造物状态图               |
| 布尔过滤器   | `g.boolFilter(...)`             | `start`，返回布尔值 | 超限、经典 | 向引用方输出最终布尔结果                   |
| 整数过滤器   | `g.intFilter(...)`              | `start`，返回整数   | 超限、经典 | 向引用方输出最终整数结果                   |

```ts
g.characterSkill({ id: CHARACTER_SKILL_ID }).on('start', (_evt, f) => {})
g.characterControlSkill({ id: CHARACTER_CONTROL_SKILL_ID }).on('start', (_evt, f) => {})
g.creationSkill({ id: CREATION_SKILL_ID, mode: 'classic' }).on('start', (_evt, f) => {})

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

要点：

- 所有客户端入口都支持 `id`、`name`、`prefix`、`mode`、`lang`；`lang: 'zh'` 会开启当前图的中文 `f` 别名。
- 过滤器额外支持 `evaluationInterval`，单位为秒，默认 `0.3`。
- 造物状态和造物状态决策的 `start1`～`start10` 对应【按顺序唯一执行】引脚，用于拆分代码，不是十个独立状态。
- 这两类状态图内顺序书写的行为通过前一个行为的【失败执行】引脚连接；下一条语句只在前一个行为失败时执行。
- `f` 会按客户端图类型和模式提供不同的方法；服务器图函数不一定可用，请以类型提示和 ESLint 为准。
- 常用算术和比较运算符可以直接写，例如 `value > 5` 会编译为当前客户端图的 `greaterThan` 节点。

### `clientEntity(...)`

该全局辅助函数只能在客户端图处理函数内使用：

- `clientEntity(0)` / `clientEntity(null)`：实体占位，保持参数引脚不连接。
- `clientEntity(10001)`：使用当前客户端图的 GUID 查询节点获取实体；当前图没有该节点时会报错。
- `clientEntity(otherEntity)`：保持原实体值，并将类型收窄为当前客户端图可用的实体快捷方法，适合包装 `self` 或 `GameObject.Find(...)` 的结果。

```ts
g.characterSkill({ id: CHARACTER_SKILL_ID }).on('start', (_evt, f) => {
  const byGuid = clientEntity(10001)
  const found = clientEntity(GameObject.Find(10002))
  const placeholder = clientEntity(0)

  // 客户端 f 返回的实体已经是正确的 clientEntity 类型。
  const typedTarget = f.queryEntityByGuid(10003)
  const targetPosition = found.pos
})
```

需要在顶层客户端复用函数中访问节点 API 时，使用与图类型对应的 `gsts.fCharacterSkill`、`gsts.fCharacterControlSkill`、`gsts.fCreationSkill`、`gsts.fCreationStatus`、`gsts.fCreationStatusDecision`、`gsts.fBoolFilter` 或 `gsts.fIntFilter`。`gsts.f` / `gsts.fServer` 仍属于服务器节点图。

完整说明与示例见：`https://gsts.moe/zh/doc/events/client-graphs`。

## gsts.config 优化配置（默认启用）

`gsts.config.ts` 的 `options.optimize` 默认全开，常见项：
- `precompileExpression`：预编译纯字面量表达式，减少运行期节点计算。
- `removeUnusedNodes`：清理未接入事件或未被使用的节点。
- `timerPool`：控制 `setTimeout` / `setInterval` 的定时器名称池大小。
- `timerDispatchAggregate`：合并定时器事件分发，减少图复杂度。

如需调试或对比节点图，可临时关闭单项优化。

## 典型用法与限制（AI 必看）

### 作用域划分

- **顶层作用域（编译期）**：可以读取文件、使用 npm 库、做预计算，但不要调用 `g.server` 或 `gsts` 相关 API。
- **节点图作用域（运行期）**：仅支持可编译的 TS 子集，语义会转换为节点图。

### 控制流与返回值

- `if/while/switch` 条件必须是 `boolean`，需要时用 `bool(...)` 转换。
- `gstsServer*` 函数只允许 **末尾单一 `return <expr>`**，不能在分支或循环里 `return`。
- 递归、`async/await`、Promise 在节点图作用域内不支持（会报错或被 ESLint 提示）。
- `while(true)` 会受循环上限影响，建议改用定时器或显式计数。
- `!`/三目运算需要布尔条件，避免对非 bool 取反。

### 数值与类型

- `number` 会视为 **float**，`bigint` 会视为 **int**。
- 取余、位运算等整数运算请使用 `bigint`。
- 列表下标若使用 `bigint` / `IntValue`，请用 `idx(...)` 包裹，例如 `arr[idx(i)]`（可直接应用 ESLint 自动修复）。
- 若此处显示为“警告”而非“错误”，通常表示项目 TypeScript 插件已生效（已将 `bigint` 视作可索引），可按需禁用 `gsts/require-bigint-index-wrapper`。
- 若 VSCode/Cursor 里仍看到 `TS2538` 错误，请配置 `"typescript.tsdk": "node_modules/typescript/lib"` 与 `"typescript.enablePromptUseWorkspaceTsdk": true`（genshin-ts 的项目模板已经自带这些设置），并设置“使用工作区 TypeScript 版本”。
- 列表/字典元素类型必须一致，混合类型会报错。
- 空数组可能无法推断类型，建议先放一个同类型占位值。
- 建议使用辅助函数明确类型：`int`、`float`、`vec3`、`configId`、`prefabId`、`entity` 等。
- `dict(...)` 用于创建只读字典；需要可写字典时请改用节点图变量（`f.get` / `f.set`）。
- 需要强制生成节点图局部变量时，用 `let` 声明；`const` 可能会被优化为直接连线。

### 全局函数与变量速查（建议 AI 优先使用）

日志与调试：

- `print(str(...))`：最稳定的日志输出方式。
- `console.log(x)`：仅支持 **单一参数**，会自动转成 `print(str(...))`。
- `f.printString(...)`：显式节点调用，适合需要严格对齐节点图时使用。

类型与构造：

- `bool(...)` / `int(...)` / `float(...)` / `str(...)`：显式类型转换。
- `idx(...)`：用于让 `bigint` / `IntValue` 索引通过 TypeScript 类型检查（仅用于通过类型检查，不改变节点图整数语义）。
- `vec3(...)` / `guid(...)` / `prefabId(...)` / `configId(...)` / `faction(...)` / `entity(...)`：常用类型构造。
- `clientEntity(...)`：仅客户端图使用；查询或收窄实体，并提供当前客户端图可用的实体快捷方法。
- `list('int', items)`：显式声明列表类型（空数组时尤为重要）。
- `dict(...)`：声明只读字典（节点图变量字典需用 `f.get` / `f.set`）。
- `raw(...)`：编译器不处理，按 JS 原生语义执行（仅在必要时使用）。

实体与场景：

- `player(1)`：获取玩家实体（从 1 开始）。
- `stage` / `level`：关卡实体别名。
- `self`：当前节点图关联实体。
- `GameObject.Find(...)` / `FindWithTag(...)` / `FindByPrefabId(...)`：实体查询。

数学与向量：

- `Math.*`：会编译为节点图等价实现（server 作用域内）。
- `Mathf.*` / `Vector3.*` / `Random.*`：Unity 风格 API。

信号与事件：

- 字符串写法可用：`send('signalName')` 配合 `g.server().onSignal('signalName', ...)`。
- 推荐使用提取定义：`send(Signal.xxx, ...)` 和 `g.server().onSignal(Signal.xxx, ...)`。
- `Signal.xxx` 来自 `src/resources/signals.ts`，可获得参数类型检查。

定时器：

- `setTimeout` / `setInterval` / `clearTimeout` / `clearInterval`。

常用方法支持：

- 数组/字符串的常用方法（`map`/`filter`/`find`/`length` 等）有编译支持，以类型提示为准。

### 节点图变量（可写变量）

```ts
g.server({
  id: 1073741825,
  variables: { counter: 0n },
  lang: 'zh'
}).on('whenEntityIsCreated', (evt, f) => {
  const v = f.get('counter')
  f.set('counter', v + 1n)
})
```

提示：

- `variables` 会生成节点图变量，并提供类型化的 `f.get` / `f.set`。
- 实体类型变量通常只用于声明类型（常用 `entity(0)` 作为占位）。
- `entity(0)` 也可用于部分节点调用的实体参数占位，让编辑器中该参数保持为空。

### 定时器

- 直接使用 `setTimeout` / `setInterval`（单位为毫秒）。
- 编译器会自动生成定时器池以避免同名冲突。
- 可用注释 `// @gsts:timerPool=4` 覆盖池大小（高阶用法）。
- `setInterval` 间隔过小（<=100ms）会有性能警告。
- 定时器回调支持闭包捕获（按值），但不支持捕获字典类型。

### JS 原生对象的限制

- `Object.*`、`JSON.*` 等原生对象在节点图作用域内通常不可编译。
- 若必须使用，请在顶层预处理，或用 `raw(...)` 让编译器忽略该表达式。
- 字符串拼接若报错，建议在顶层预计算或用 `str(...)` 显式转换。

## 复用函数（gstsServer）

```ts
function gstsServerSum(a: bigint, b: bigint) {
  const total = a + b
  return total
}

g.server({ id: 1073741825 }).on('whenEntityIsCreated', (evt, f) => {
  const v = gstsServerSum(1n, 2n)
  f.printString(str(v))
})
```

规则：

- 必须是顶层声明，参数只能是标识符（不支持解构/默认值/rest）。
- 只允许末尾单一 `return`，且调用必须发生在 `g.server().on(...)` 或另一个 `gstsServer*` 中。
- 在 `gstsServer*` 内可直接使用 `gsts.f` 访问节点图 API（不强制传 `f` 参数）。

## 多入口与合并

- `gsts.config.ts` 的 `entries` 决定哪些文件被编译。
- 每个入口文件默认生成一个节点图；同 ID 会自动合并。
- 增量编译下，依赖变更会触发相关入口重编译。

## 输出与调试

- `.gs.ts`：TS 被展开成节点函数调用的中间文件，便于定位语义差异。
- `.json`：节点图 IR，用来排查连接和类型匹配问题。
- `.gia`：最终节点图产物，可注入或手动导入。

## 编译执行注意事项

- 编译器会扫描所有入口文件并找到 `g.server().on(...)` 入口进行编译。
- 顶层代码会在编译期执行一次或多次（例如增量编译/多入口场景）。
- 若顶层代码涉及本地文件读写或随机数，请注意副作用与一致性问题。
- 需要临时禁用某个节点图注入时，可把 `id` 设置为一个不存在的值。
- 顶层作用域适合做本地文件读取/预计算/程序化生成（例如伪随机场景）。
- `stage.set` 可当作全局变量使用（节点图运行期）。

## Scripts

- `npm run build`：完整编译
- `npm run dev`：增量编译（配置 inject 后会自动注入）
- `npm run maps`：列出最近编辑的地图
- `npm run backup`：打开注入备份目录
- `npm run typecheck`：TypeScript 类型检查；项目里有客户端 Lua 时同时用 `gsts lua check` 检查 Lua，没有时直接跳过
- `npm run lint`：ESLint

补充说明：

- 本项目内置定制化 ESLint 规则，能提示编译器的隐含约束，建议经常运行 `npm run lint`。
- `npm run typecheck` 可提前发现类型不匹配问题，避免编译期报错。
- `npm run dev` 实际调用的是 `gsts dev`，仅进入监控变更的编译模式。
- 注入后需要重新加载地图，节点图变更才会生效。
- 可准备一个临时空地图，注入后快速切换以触发重载。
- 注入后如果在加载前使用编辑器保存地图，注入内容会被覆盖，需要重新注入。

## 常见问题

- `npm run maps` 为空：先在编辑器里保存一次地图，再重试。
- 注入失败：检查 `mapId` / `nodeGraphId` 是否正确，图类型是否匹配。
- 类型报错：优先检查 `.value` 的使用与引脚类型是否一致。

## 需要查函数说明时（AI 可用）

当类型提示不足时，可以直接在 `node_modules/genshin-ts` 中搜索函数/事件注释：

- 节点函数与事件定义：`node_modules/genshin-ts/dist/src/definitions/`
- 建议用关键词搜索（事件名、函数名、中文别名）定位注释与参数说明。
