# Lua 调试

游戏里报错时，日志给出的是编译后 Lua 文件的行号。构建会同时生成 sourcemap（`.lua.map`），用 `gsts lua locate` 就能把 Lua 行号换算回 TS 源码位置。sourcemap 默认开启，只保存在本地输出目录，不会复制到游戏目录。

## 从游戏报错找到源码

1. 照常构建。输出目录里每个 `.lua` 旁边会有同名的 `.lua.map`。
2. 在编辑器的日志里勾选"客户端脚本"，运行游戏；出错后双击对应条目，查看完整的报错位置。
3. 把报错里的 Lua 文件和行号交给 `gsts lua locate`；报错很多时，也可以把日志存成文本文件，一次性解析。
4. 按输出的 TS 文件、行、列修改源码，重新构建，再在编辑器里运行游戏。

```sh
gsts --noinject --lang zh                           # 构建
gsts lua locate dist/lua/lua/hud.lua:42             # 换算一个位置
gsts lua locate --log game-error.txt --outDir dist  # 解析整份日志
```

上面假设 compileRoot 是 `src`，入口是 `src/lua/hud.ts`。直接换算时写本地文件路径；解析日志时，日志里的 `lua/hud.lua:42` 会在 `--outDir` 指定目录的 `lua` 子目录下查找。

`locate` 能识别下面两种写法。游戏日志的实际格式还在确认中；如果它认不出你日志里的位置，把"文件:行号"手动传给它即可。

```text
lua/hud.lua:42: 报错内容
[string "lua/hud.lua"]:42: 报错内容
```

### 几种特殊情况

- **手改过 Lua 文件**：sourcemap 只对应构建时的 Lua 内容，手改后会被拒绝，重新构建即可。
- **框架生成的代码**：有些行（例如生命周期包装）没有对应的 TS 位置，命令会直接说明。
- **入口文件顶层的代码**：它被编译到 `__gsts_shared` 目录下的共享模块里，要用那个文件的路径：

```sh
gsts lua locate dist/lua/__gsts_shared/lua/hud.lua:20
```

不需要 sourcemap 时可以关闭，关闭不会改变生成的 Lua：

```ts
// gsts.config.ts
lua: {
  sourceMap: false
}
```

## 为什么不能自动换算

要在运行时自动把报错换算成 TS 行号，需要用 `debug.getinfo` 读取调用栈，而原神的脚本环境没有提供它，所以只能"游戏里记下 Lua 位置，再在本地换算"。

```ts
try {
  throw new Error('HUD failed')
} catch (error) {
  console.error(error) // 日志里会带上 Lua 位置，再交给 locate
}
```

`console` 各方法的输出：

| 写法                           | 效果                                         |
| ------------------------------ | -------------------------------------------- |
| `console.log` / `console.info` | 普通日志                                     |
| `console.warn`                 | 普通日志，带 `[warn]` 前缀                   |
| `console.error`                | 错误级别日志（官方 `printerr`）              |
| `console.assert`               | 条件不成立时记一条错误日志，**不会**中断执行 |
| `console.trace`                | 输出调用栈                                   |

需要中断执行时用 `throw` 或 `lua.error`。

## 进关卡卡住时

官方说明：如果脚本里有死循环等问题导致进关卡变慢或卡死，普通日志可能来不及报告，这时看客户端脚本目录下的 `ErrorLog.txt`（只在这种情况下才会生成）。

```sh
gsts lua locate --log path/to/client-scripts/ErrorLog.txt --outDir dist
```

## 判断是不是同一个对象

游戏里 `tostring(表)` 只输出 `<table>`，不带地址，所以不能靠打印出来的内容判断两个变量是不是同一张表。直接用 `===` 比较，或者给需要追踪的对象自己加一个编号。

```ts
const left = { count: 0 }
const same = left
const other = { count: 0 }
console.log(left === same, left === other) // true, false
```

生命周期顺序、传送等已在游戏里实测的行为，见 [客户端 Lua](./lua.md)。
