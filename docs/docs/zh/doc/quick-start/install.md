# 安装与准备

## 推荐方式

```bash
npm create genshin-ts@latest
```

> 如果执行命令遇到 Windows 执行策略禁止运行脚本，请将所有命令中的 `npm` 改为 `npm.cmd` 执行。

运行后用方向键和回车，依次完成：

1. 项目名称；
2. 模板：**节点图 + Lua**（推荐）或**仅节点图**，结构见[模板结构](./template.md)；
3. 注入地图：自动查找本机的地图存档，按需选择区服、账号（用户 ID）和地图，写进 `gsts.config.ts` 的 `inject`；也可以先跳过；
4. 是否立即安装依赖。

提示语言跟随系统，可以用 `--lang zh` 或 `--lang en` 指定。不能用方向键的环境（例如 CI）可以直接带参数创建，不会再提问：

```bash
npm create genshin-ts@latest my-world -- --template graph-lua --yes
npm create genshin-ts@latest my-world -- --template graph --region China --player 100000000 --map 1073741825 --install
```

全部参数见 `npm create genshin-ts@latest -- --help`。

genshin-ts 内置 TypeScript 插件以获得更高级的TypeScript支持增强；即使不启用也不影响功能与开发流程，但推荐启用。说明见：
`https://gsts.moe/zh/doc/quick-start/install.html#typescript-plugin`

## 依赖环境

- Node.js 20.19+ 或 22+（建议 LTS）
- Windows (涉及地图注入路径)

## TypeScript Plugin

- genshin-ts 项目内置 TypeScript Language Service 插件，用于提供更高级的 TypeScript 支持增强。
- 即使不启用插件，也不影响项目编译、运行和类型系统体验, 但推荐启用, 以获得更高级的TypeScript支持增强。
- 多数主流编辑器支持该插件，IDEA 系列通常开箱即用。
- 对于 VSCode/Cursor，使用 `npm create genshin-ts@latest` 创建模板项目后，打开项目通常会提示：
  - `"此工作区包含一个 TypeScript 版本。是否要对 TypeScript 和 JavaScript 语言功能使用工作区 TypeScript 版本?"`
  - 请允许/确认使用工作区 TypeScript 版本，这样 TypeScript 插件才会生效。
- 若未弹出提示，可手动确认或设置：
  - `"typescript.tsdk": "node_modules/typescript/lib"`
  - `"typescript.enablePromptUseWorkspaceTsdk": true`
  - 然后执行：`TypeScript: Select TypeScript Version` -> `Use Workspace Version`
- 插件具体改善了什么、不开插件时的情况、升级后如何生效和排错，见 [TypeScript 插件](./ts-plugin.md)。

## 下一步

进入模板后请先阅读 `README_ZH.md` 了解使用边界。
