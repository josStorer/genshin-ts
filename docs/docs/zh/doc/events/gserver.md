# g.server 参数与入口

常用参数：
- `id` / `name` / `prefix` / `type` / `mode`
- `variables`
- `lang`

## mode（节点图模式）

- 默认是超限模式（Beyond Mode）：不写 `mode` 等价于 `mode: 'beyond'`。
- 可显式声明经典模式：`g.server({ id: 1073741825, mode: 'classic' })`。
- 经典模式下不允许 `type: 'class'`，会直接报错。
- 节点可用性按模式区分；调用仅某模式可用的节点时会报错（例如提示 `... is classic mode only` / `... is beyond mode only`）。

## type（服务器节点图子类型）

- 可选值：`'entity' | 'status' | 'class' | 'item'`。
- 默认值：`'entity'`。
- 若 `mode: 'classic'`，`type` 只能是 `'entity' | 'status' | 'item'`。

注入安全要求：
- 目标图必须存在，且为空或以 `_GSTS` 开头。
- 新建图后必须保存地图才能被识别。
