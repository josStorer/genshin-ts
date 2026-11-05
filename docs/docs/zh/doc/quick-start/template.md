# 模板结构

`npm create genshin-ts@latest` 提供两个模板。

"节点图 + Lua"（推荐）：

```text
src/
  graphs/main.ts        服务器节点图，接收 Lua 发来的信号
  lua/                  客户端控件脚本，有自己的 tsconfig
    hud.ts              Lua 入口
    lib/format.ts       Lua 入口用到的普通 TS 模块
  resources/signals.ts  节点图和 Lua 共用的信号定义
gsts.config.ts          编译与注入配置
dist/                   编译产物
```

"仅节点图"：

```text
src/
  main.ts               节点图入口
  resources/            配置 inject 后从地图生成（信号、元件定义）
gsts.config.ts          编译与注入配置
dist/                   编译产物
```

生成的项目里，`README_ZH.md` 写了完整用法和注意事项；"节点图 + Lua"模板还列出了首次运行前要在编辑器里做的设置（控件、信号和挂载）。

之后要给"仅节点图"的项目加入 Lua，见[在已有项目中加入 Lua](../lua.md#add-lua)。
