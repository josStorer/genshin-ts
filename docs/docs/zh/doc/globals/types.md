# 类型映射

- `number` -> float
- `bigint` -> int
- 列表/字典元素必须同类型

常见报错：
- `invalid value type`
- `Generic parameter not matched`

建议优先使用类型辅助函数明确类型。

## 全局辅助函数

### 原始表达式与类型转换
- `raw(expr)` 保留 JS 语义，编译器不做节点图转换。
- `bool/int/float/str` 用于类型转换，满足目标 pin 的类型要求。
- `int(123)` 可用于显式声明整数字面量，但仍推荐使用 `123n`。
- `idx(...)` 用于让 `bigint` / `IntValue` 索引通过 TypeScript 类型检查（仅用于通过类型检查，不改变节点图整数语义）；可直接使用 ESLint 自动修复应用该包装。
- 若此提示显示为“警告”而非“错误”，通常表示项目的 TypeScript 插件已生效（已将 `bigint` 视作可索引），可按需禁用 `gsts/bigint-index-in-server` 规则。
- 若在 VSCode/Cursor 中仍见到 `TS2538` 错误，请配置 `"typescript.tsdk": "node_modules/typescript/lib"` 与 `"typescript.enablePromptUseWorkspaceTsdk": true`（genshin-ts 的项目模板已经自带这些设置），并切换到“使用工作区 TypeScript 版本”。
- `str(...)` 用于字符串转换，主要用于日志。
- `vec3([x, y, z])` 构造 vec3 字面量；多数情况下直接 `[x, y, z]` 可自动推断，`vec3(...)` 主要用于列表场景消除歧义。

### ID 与实体
- `guid/prefabId/configId/faction` 用于显式声明类型字面量（如“设置自定义变量”等涉及泛型参数的节点）；不做运行期类型转换。
- `entity(guid | entity | 0 | null)` 支持占位（`entity(0)` / `entity(null)`，保持节点参数引脚为空不连接）、GUID 获取、以及将子类型提升为通用实体类型。
- `stage` / `level` / `self` 分别代表当前节点图的关卡/实体句柄。

### 集合
- `list(t, items)` 创建带类型列表；空列表用 `list(t, [])`。
- `list(t, 0)` / `list(t, null)` 为带类型占位（保持节点参数引脚为空不连接）；仅在可推断类型时使用 `list(0)` / `list(null)`。
- `dict(...)` 创建只读字典；空占位请用 `dict(k, v, 0)`（保持节点参数引脚为空不连接）；仅在可推断类型时使用 `dict(0)` / `dict(null)`。

### 运行期辅助
- `print(str)` 打印日志。
- `send('signal')` 触发关卡信号（需在编辑器注册）。
- `player(id)` 通过玩家序号获取实体（从 1 开始）。
- `setTimeout/setInterval` 在 server 作用域编译为节点图计时器，非节点图作用域回退为 JS 计时器。
- `clearTimeout/clearInterval` 用于清理计时器句柄。
