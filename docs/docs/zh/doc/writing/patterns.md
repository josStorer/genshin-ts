# 常见编写模式

## 条件与类型
- 条件统一用 `bool(...)` 转换。
- `number` -> float，`bigint` -> int。

## 列表与字典
- 空数组请使用 `list(t, [])` 明确类型。
- 需要类型占位且保持引脚不连线时用 `list(t, 0)` / `list(t, null)` 或 `dict(k, v, 0)`。
- 仅在可推断类型时使用 `list(0)` / `list(null)` / `dict(0)` / `dict(null)`。
- `dict(...)` 为只读，需可写字典请用节点图变量。

## 自定义变量 {#custom-variables}
- 只有在实体的自定义变量组件里预先配置的变量才会同步到客户端；用 `setCustomVariable` 在运行时新建的变量，客户端节点图和 Lua 都读不到。
- 原地修改自定义变量里的列表或字典（例如 `push`）会直接改动变量，但不会触发“自定义变量变化时”事件；需要触发时，改完再用 `f.setCustomVariable(实体, 变量名, 列表, true)` 写回。
- 浮点数自定义变量的精度为 0.0001。
- `setCustomVariable` 省略“是否触发事件”时 gsts 传入“否”，编辑器里的默认值是“是”。

## 实体占位
- `entity(0)` / `entity(null)` 可用于占位，保持节点参数引脚为空不连接。

## 调试输出
- 推荐 `print(str(...))` 或 `console.log(x)`（单参）。
