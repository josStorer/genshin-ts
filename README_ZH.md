<p align="center">
<img width="256" height="256" alt="logo" src="https://github.com/user-attachments/assets/a1000ae8-8633-449f-9b90-fd3c5da8c4a2" />
</p>
<h1 align="center">Genshin-TS</h1>

<div align="center">

使用 TypeScript 进行原神UGC - 千星奇域项目开发，全面的类型系统与便捷的辅助函数, js原生api和Unity3d风格api支持, npm库支持, 面向 AI 编码工具的高可读/高可维护开发方式。

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/josStorer/genshin-ts/blob/master/LICENSE)
[![release](https://img.shields.io/github/release/josStorer/genshin-ts.svg)](https://github.com/josStorer/genshin-ts/releases/latest)
[![downloads](https://img.shields.io/npm/dm/genshin-ts.svg)](https://www.npmjs.com/package/genshin-ts)
[![typescript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[English](README.md) · 简体中文

[文档站](https://gsts.moe/zh) · [介绍视频](https://www.bilibili.com/video/BV1qdrTBpEQw) · [模板文档和使用细节](create-genshin-ts/templates/start/README_ZH.md) · QQ群: 283430436

</div>

## 简介

Genshin-TS（gsts）是一套使用Typescript进行千星奇域项目开发的工具链。强调“代码级开发体验”和“节点图语义可控”，支持编译、注入、调试、优化、并行和增量构建。

https://github.com/user-attachments/assets/91b1f5f6-9415-4128-be3a-a0748680bc02

## 快速开始

```bash
npm create genshin-ts@latest
```

genshin-ts 内置 TypeScript 插件以获得更高级的TypeScript支持增强；即使不启用也不影响功能和开发体验，但推荐启用。相关说明查看文档站：
[https://gsts.moe/zh/doc/quick-start/install.html#typescript-plugin](https://gsts.moe/zh/doc/quick-start/install.html#typescript-plugin)

进入模板后：

```bash
npm install
npm run dev
```

更详细的操作与边界规则见[模板文档](create-genshin-ts/templates/start/README_ZH.md)和[文档站](https://gsts.moe/zh)：
- [`create-genshin-ts/templates/start/README_ZH.md`](create-genshin-ts/templates/start/README_ZH.md)
- [https://gsts.moe](https://gsts.moe/zh)

## 核心亮点

- TS -> NodeGraph 编译：入口事件、控制流、函数复用。
- 全量类型提示与中英文别名：事件/函数/API/实体子类型。
- `g.server(...).on(...)` 链式注册，多入口同 ID 自动合并。
- `gstsServer*` 函数编译支持（可复用逻辑，受控 return）。
- JS 风格定时器：`setTimeout` / `setInterval` + 闭包捕获 + 名称池 + 聚合分发。
- 编译优化：常量预计算、无用节点清理、局部变量复用。
- 可读 IR JSON：便于调试与二次处理。
- CLI 工具链：增量编译、注入安全检查、地图定位、自动备份。
- 定制化 ESLint：提前提示语义限制与不安全写法。
- 内置元件资源id支持

## 编译流程与产物

编译链路：
1. TS -> `.gs.ts`（节点函数调用形态）
2. `.gs.ts` -> IR `.json`（节点与连线）
3. IR -> `.gia`（可注入产物）

产物默认位于 `dist/` 目录，`.gs.ts` 与 `.json` 是排错关键入口。

## 关键优化

默认启用的优化项（可在 `gsts.config.ts` 中关闭）：
- `precompileExpression`：预编译纯字面量表达式，减少运行期开销。
- `removeUnusedNodes`：清理未接入事件或未使用的节点。
- `timerPool`：定时器名称池，规避同名冲突。
- `timerDispatchAggregate`：定时器分发聚合，降低图复杂度。

## 使用方式

- **模板工程**：`npm create genshin-ts@latest`（推荐，TypeScript 插件启用说明见：[https://gsts.moe/zh/doc/quick-start/install.html#typescript-plugin](https://gsts.moe/zh/doc/quick-start/install.html#typescript-plugin)）
- **作为依赖**：`npm i genshin-ts`，在自有项目中调用编译器/注入器 API
- **全局 CLI**：`npm install -g genshin-ts` 安装后使用 `gsts` 命令编译/注入

## 使用限制（概览）

- 仅支持可编译的 TS 子集（无 Promise/async/递归）。
- 条件表达式必须为 boolean。
- `gstsServer*` 只允许末尾单一 return。
- `console.log` 仅支持单一参数（会转为 `print(str(...))`）。
- 原生 `Object.*` / `JSON.*` 在节点图作用域通常不可用。

完整限制与可用 API 详见模板文档。

## 详细用法与 AI 指引

- 模板使用说明（中文）：`create-genshin-ts/templates/start/README_ZH.md`
- AI 协作指引：`create-genshin-ts/templates/start/CLAUDE.md` / `create-genshin-ts/templates/start/AGENTS.md`
- 函数/事件注释：`node_modules/genshin-ts/dist/src/definitions/`

## TODO (根据实际可行性某些可能会放弃实现, 不分先后顺序)

- 完善ci流程
- 增加客户端节点图支持
- 完善文档站
- 信号与结构体定义和传参 (泛型参数类型提示)
- 节点图超限自动检测 (3000)
- 检测地图外部保存自动重注入
- g.scene()程序化场景定义支持
- 自动变量挂载支持
- 节点图json可视化预览器
- 程序化定义结构体和全局计时器
- 更多 // @gsts: 装饰优化开关, 例如预编译局部开关
- await delay支持? (高度不确定)
- gia转typescript支持
- npm库的开发模板
- 生成js map以便更好的错误定位
- 修正跨文件同id重复的关卡缓存问题
- jsx控件开发抽象
- 丰富examples
- 简化 {} 形式的三维向量数组推断
- 直接从gil解出自定义元件id到项目内
- 特效声音等id资源

## 特别鸣谢

- https://github.com/Wu-Yijun/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack

- 尽管在发现此项目前, 我前后也已经花了近一个月时间处理gia和gil的逆向工作, 但这个项目的逆向方案比我的方案更完善, 最终我将其作为三方模块引入了本项目, 并整合了一些我逆向得到的数据.

- 这个项目的工作非常卓越, 且同样MIT协议开源, 因此也强烈建议大家支持.
