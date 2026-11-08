# 信号

信号用于在关卡全局发送和监听自定义事件。使用前需要先在编辑器的信号管理器中注册信号；如果编译产物里引用了不存在的信号，注入时会失败。

## 基础写法

字符串写法仍然可用，适合没有参数或不需要类型提示的场景：

```ts
import { g } from 'genshin-ts/runtime/core'

g.server({ id: 1073741825 }).on('whenEntityIsCreated', (_evt, f) => {
  f.sendSignal('ready')
})

g.server({ id: 1073741826 }).onSignal('ready', (_evt, f) => {
  f.printString('ready')
})
```

在全局函数写法中也可以发送信号：

```ts
send('ready')
```

## 使用提取出的 Signal

配置了 `inject` 后，编译器会从地图中提取信号定义到 `src/resources/signals.ts`。推荐导入其中的 `Signal`，这样 `sendSignal` 和 `onSignal` 都能获得参数类型提示。

```ts
import { g } from 'genshin-ts/runtime/core'
import { Signal } from './resources/signals'

g.server({ id: 1073741825 }).on('whenEntityIsCreated', (_evt, f) => {
  f.sendSignal(Signal.signal_param_literal, 7n, 'ready', true)
})

g.server({ id: 1073741826 }).onSignal(Signal.signal_param_literal, (evt, f) => {
  const amount = evt.params.参数_1
  const label = evt.params.参数_2
  const enabled = evt.params.参数_3

  f.printString(f.dataTypeConversion(amount, 'str'))
  f.printString(label)
  f.printString(f.dataTypeConversion(enabled, 'str'))
})
```

`Signal.xxx` 会保留信号名、参数名和参数类型。发送时参数数量和类型会被 TypeScript 检查；监听时可以通过 `evt.params.参数名` 访问类型化参数。

## 字面量和连线参数

信号参数可以混合字面量和节点连线值：

```ts
g.server({ id: 1073741825 }).on('whenEntityIsCreated', (_evt, f) => {
  const amount = f.addition(2n, 3n)
  f.sendSignal(Signal.signal_param_literal, amount, 'ready', true)
})
```

上例中第一个参数来自节点输出，后两个参数是字面量。编译器会把它们写入同一个发送信号节点的对应参数 pin。

## 发给客户端 Lua 脚本 {#to-lua}

`f.sendSignal` 和 `send` 只发给节点图，客户端 Lua 脚本收不到。发给 Lua 要用 7.2 新增的【发送客户端脚本信号】节点：

```ts
g.server({ id: 1073741825 }).onSignal(Signal.PlayerAction, (evt, f) => {
  // 发给 1 号玩家
  sendLua(player(1), Signal.ScoreChanged, 20n, true)
  // 发给所有在场玩家
  sendLuaAll(Signal.ScoreChanged, 20n, true)
})
```

- `sendLua(玩家, 信号, ...参数)` 发给一个玩家，这个玩家身上挂载的所有客户端 Lua 脚本都会收到。也可以写成 `玩家.sendLua(信号, ...参数)` 或 `f.sendClientScriptedServerSignal(...)`。
- `sendLuaAll(信号, ...参数)` 会遍历【获取在场玩家实体列表】，逐个玩家发送。
- 信号同样要先在信号管理器里注册。参数只能使用 Lua 能接收的类型，不支持阵营。
- 目标必须是玩家实体，例如 `player(序号)` 或在场玩家列表里的元素。Lua 发来的信号里的【信号来源实体】不能直接当作目标，信号会发不到；要回复发送者，请让客户端在参数里带上能识别自己的信息。
- Lua 侧用 `lua.onSignal` 接收，见[客户端 Lua：信号与监听](../lua.md#signals)。

## 注意事项

- 单个关卡最多 99 个信号。
- `Signal.xxx` 来自地图提取结果；编辑器里修改信号后，需要先保存地图，然后重新运行编译以提取信号更新的信息。
- 字符串写法不会提供参数名和参数类型提示。
