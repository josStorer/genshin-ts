# 模板结构

`npm create genshin-ts@latest` 提供两个模板，目录结构相同，"节点图 + Lua"多一个 `src/lua`：

```text
src/
  graphs/main.ts        服务器节点图入口
  shared/constants.ts   共用常量
  resources/            配置 inject 后从地图生成（信号、元件定义）
  lua/                  仅"节点图 + Lua"：客户端控件脚本，有自己的 tsconfig
gsts.config.ts          编译与注入配置
dist/                   编译产物
```

生成的项目里，`README_ZH.md` 写了完整用法和注意事项；"节点图 + Lua"模板还列出了首次运行前要在编辑器里做的设置（控件、信号和挂载）。

之后要给"仅节点图"的项目加入 Lua，见[在已有项目中加入 Lua](../lua.md#add-lua)。
