# Lua 调试

游戏里报错时，日志给出的是编译后 Lua 文件的行号。构建会同时生成 sourcemap（`.lua.map`），用 `gsts lua locate` 就能把 Lua 行号换算回 TS 源码位置。sourcemap 默认开启，只保存在本地输出目录，不会复制到游戏目录。

## 从游戏报错找到源码

1. 照常构建。输出目录里每个 `.lua` 旁边会有同名的 `.lua.map`。
2. 在编辑器的日志里勾选"客户端脚本"，运行游戏。出错后复制那条报错日志。
3. 在项目目录（有 `gsts.config.ts` 的地方）运行 `gsts lua locate`。不带参数时它读取剪贴板；也可以把报错文本或日志文件路径作为参数传入。
4. 按输出的 TS 文件、行、列修改源码，重新构建，再在编辑器里运行游戏。

```sh
gsts lua locate                          # 读取剪贴板里的报错
gsts lua locate game-error.txt           # 解析整份日志文件
gsts lua locate dist/lua/lua/hud.lua:42  # 换算一个本地位置
```

游戏日志里的位置写的是模块名，不带 `.lua`（2026-10-24 实机）。例如：

```text
lua/hud:299: attempt to index a nil value (local 'item')
stack traceback:
	__gsts_helpers:120: in function 'findControl'
	lua/hud:299: in function 'OnStart'
```

`locate` 会把 `lua/hud:299` 换算成 TS 位置；`lualib_bundle`、`__gsts_helpers` 这些运行库位置没有对应的 TS 源码，只提示省略了几处。同一个错误在日志里重复出现时只输出一次。`lua/hud.lua:42`、`[string "lua/hud.lua"]:42` 这类写法也能识别。

日志里的位置会到输出目录的 `lua` 子目录下查找。输出目录默认读当前目录 `gsts.config.ts` 的 `outDir`，在别处运行时用 `--outDir` 指定。上面假设 compileRoot 是 `src`，入口是 `src/lua/hud.ts`。

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

### catch 拿到的总是字符串

宿主会把抛出的任何值都转成文字（2026-10-24 实机确认）：`throw new Error('x')` 在 catch 里得到的是 `"Error: x
stack traceback: …"` 这样的字符串，`throw { code: 7 }` 得到的是 `"<table>"`。所以 `e instanceof Error` 永远为 false，`e.message`、自定义错误类和对象上的字段都读不到。

```ts
try {
  risky()
} catch (e) {
  console.error(String(e)) // 需要错误信息时这样写
}
```

要传额外的信息，请写进 Error 的消息里。对 catch 变量用 `instanceof`、`as` 转成其他类型、读字段，以及 throw 非 Error 的对象或数字，都会收到 `gsts/lua-thrown-value` 警告（编辑器、ESLint、构建一致）。

## 进关卡卡住时

官方说明：如果脚本里有死循环等问题导致进关卡变慢或卡死，普通日志可能来不及报告，这时看客户端脚本目录下的 `ErrorLog.txt`（只在这种情况下才会生成）。

```sh
gsts lua locate path/to/client-scripts/ErrorLog.txt
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
