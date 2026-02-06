# __PROJECT_NAME__

这是一个基于 genshin-ts 的千星奇域项目模板。你可以用 TypeScript 写逻辑，编译为节点图并注入到地图。

## 快速开始

```bash
npm install
npm run dev
```

文档站：`https://gsts.moe/zh`

## 项目结构

- `src/main.ts`：入口示例（`g.server(...).on(...)`）
- `gsts.config.ts`：编译与输出配置
- `dist/`：编译产物（`.gs.ts` / `.json` / `.gia`）
- `CLAUDE.md` / `AGENTS.md`：AI 协作指引（建议先读）

## 注入配置示例（可选）

```ts
import type { GstsConfig } from 'genshin-ts'

const config: GstsConfig = {
  compileRoot: '.',
  entries: ['./src'],
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

- `npm run maps` 可列出最近保存的地图，帮助确定 `mapId`。
- 多账号/多服务器时填写 `gameRegion` / `playerId` 以定位地图目录。
- 注入会自动做备份，便于回滚。

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
- `vec3(...)` / `guid(...)` / `prefabId(...)` / `configId(...)` / `faction(...)` / `entity(...)`：常用类型构造。
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

- `send('signalName')` 发送信号，配合 `g.server().onSignal(...)` 监听。

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
- `npm run typecheck`：TypeScript 类型检查
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
