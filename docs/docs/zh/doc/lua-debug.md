# Lua 调试

构建默认生成 sourcemap，用离线命令把 Lua 报错位置换算回 TS；映射文件只留在本地，不注入游戏。

## 从游戏报错找到源码

1. 正常构建，保留输出目录里的 .lua 与同名 .lua.map。
2. 在编辑器日志里勾选“客户端脚本”，双击条目查看完整报错位置。
3. 把 Lua 文件和行号交给 locate，或保存日志后批量解析。
4. 根据输出的 TS 文件、行、列修改源码，重新构建，再在编辑器运行游戏。

```sh
gsts --noinject --lang zh
gsts lua locate dist/lua/lua/hud.lua:42
gsts lua locate --log game-error.txt --outDir dist
```

上例假设 compileRoot=src、入口 src/lua/hud.ts。直接传位置时写本地文件路径；日志里若是 `lua/hud.lua:42`，--outDir dist 会从 dist/lua 下寻找它。还支持 `[string "lua/hud.lua"]:42` 这种形式。

**真实游戏日志的完整格式尚未实机确认，待补截图。**以下只是当前解析器支持的格式，不是已经取得的游戏日志：

```text
lua/hud.lua:42: example failure
[string "lua/hud.lua"]:42: example failure
```

映射按编译时的 Lua 内容校验；手改 Lua 后旧 map 会被拒绝，需要重新构建。框架生成语句可能没有 TS 对应位置，命令会说明。顶层共享代码的错误要使用实际的 \_\_gsts_shared 文件路径：

```sh
gsts lua locate dist/lua/__gsts_shared/lua/hud.lua:20
```

需要关闭时设置以下选项，关闭映射不改变 Lua 代码：

```ts
// gsts.config.ts
lua: {
  sourceMap: false
}
```

## 为什么不是自动还原运行时栈

官方沙箱没有 debug.getinfo，不能在运行时读取栈信息并自动换算；目前是“记录 Lua 位置 → 本地 locate”，不会自动收集游戏日志。

```ts
try {
  throw new Error('HUD failed')
} catch (error) {
  console.error(error) // 保存输出中的 Lua 位置，再交给 locate
}
```

console.log/info 输出普通日志，warn 带前缀，error 用 printerr；assert 只记录失败，throw/lua.error 才中断。需要看调用链时可用 console.trace，能否得到完整的宿主日志格式仍以实际日志为准。

## 进关卡卡住与对象身份

官方说明：遇到进关卡卡住等情况，检查客户端脚本目录中的 ErrorLog.txt，并保存完整内容再定位。

```sh
gsts lua locate --log path/to/client-scripts/ErrorLog.txt --outDir dist
```

游戏里的 tostring(表) 只输出 `<table>`，不能靠打印地址判断是否同一张表。比较引用本身，或给调试对象加自己维护的序号。

```ts
const left = { count: 0 }
const same = left
const other = { count: 0 }
console.log(left === same, left === other) // true, false
```

本文的命令和映射有自动测试；游戏日志截图、完整格式及本轮生成脚本的实机结果仍待回报。宿主本身已确认的生命周期事实见 [客户端 Lua](./lua.md)。
