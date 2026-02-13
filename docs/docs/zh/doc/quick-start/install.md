# 安装与准备

## 推荐方式
```bash
npm create genshin-ts@latest
```

genshin-ts 内置 TypeScript 插件以获得更高级的TypeScript支持增强；即使不启用也不影响功能与开发流程，但推荐启用。说明见：
`https://gsts.moe/zh/doc/quick-start/install.html#typescript-plugin`

## 依赖环境
- Node.js (建议 LTS)
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

## 下一步
进入模板后请先阅读 `README_ZH.md` 了解使用边界。
