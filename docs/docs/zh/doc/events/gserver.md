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

## variables（节点图变量定义）

- `variables` 中的每个字段都会生成节点图变量，并提供类型化的 `f.get('name')` / `f.set('name', value)`。
- 支持基础类型、列表、字典。
- 需要定义复杂字典键值类型时，建议使用 `dict(...)` 显式声明。
- 字典键类型常用：`str` / `int` / `entity` / `guid` / `faction` / `config_id` / `prefab_id`。
- 字典值类型支持基础值与列表值；复杂场景可组合成如“`int -> config_id_list`”、“`int -> float_list_list`”等结构。

示例（节选）：

```ts
g.server({
  id: 1073741867,
  variables: {
    d_str_entity_list: dict([{ k: 'elist', v: list('entity', new Array(3)) }]),
    d_int_config_list: dict([
      { k: 123, v: [configId(1), configId(2)] },
      { k: 345, v: [configId(3), configId(4)] }
    ]),
    d_int_float_2d: dict([
      {
        k: 123,
        v: [
          [1, 2, 3],
          [4, 5, 6]
        ]
      },
      {
        k: 345,
        v: [
          [7, 8, 9],
          [10, 11, 12]
        ]
      }
    ])
  }
})
```

完整案例请参考：
- https://github.com/josStorer/genshin-ts/blob/master/tests/variables_definition_test.ts

注入安全要求：
- 目标图必须存在，且为空或以 `_GSTS` 开头。
- 新建图后必须保存地图才能被识别。
