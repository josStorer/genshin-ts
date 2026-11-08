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
- 一张图最多 100 个节点图变量（编辑器上限，含 gsts 为定时器等自动生成的 `__gsts` 变量），超过时编译报错。

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

### 暴露给关卡：exposed

用 `exposed(初始值)` 包住的变量会暴露到关卡：挂载这张图的每个实体，都可以在实体的节点图配置里（“编辑变量数”）填自己的值。`f.get` / `f.set` 的写法不变。

```ts
g.server({
  id: 1073741825,
  variables: {
    damage: exposed(100n), // 每个实体可以填不同的伤害
    targetGuid: exposed(guid(0)), // 每个实体填自己要指向的场景实体 GUID
    hits: 0n // 内部状态，不暴露
  }
}).on('whenEntityIsCreated', (_evt, f) => {
  print(str(f.get('damage')))
  print(str(entity(f.get('targetGuid'))))
})
```

- 适用于一张图挂在多个实体上、每个实体需要不同配置的情况，例如两个炸药桶共用一张图，但伤害不同。
- 代码里的值，是没有单独填写的实体所用的值。
- 暴露与否以代码为准：每次注入都按代码写入，在编辑器里手动勾选或取消的“对外暴露”，下次注入会恢复成代码里的设置。
- 重新注入不会清掉实体上已经填写的值。但变量改名或改类型后，实体上原来填的值就对不上了。
- 编辑器里无法为暴露的实体、实体列表或含实体的字典填写值，构建时会警告。要让每个实体指向各自的场景实体，请暴露 GUID 变量，再用 `entity(guid)` 取实体。
- 7.2 起多语言文本管理工具也会收集实体上填写的文本。节点图里的初始值本来就会被收集，所以只是为了翻译，不需要暴露。

## 注入安全要求

- 目标图必须存在，且为空或以 `_GSTS` 开头。
- 新建图后必须保存地图才能被识别。
