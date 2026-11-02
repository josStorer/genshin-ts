# TypeScript 插件

genshin-ts 自带一个 TypeScript 语言服务插件（`genshin-ts/configs/ts-plugin`）。它运行在编辑器的 TypeScript 服务器里，补全、悬停、报错都经过它，不是某个编辑器的专属扩展。

## 原则：不开插件也不缺功能

插件只负责更好的编辑体验。编译、运行、类型检查和所有 gsts 规则都不依赖它：

- 构建（`gsts`、`gsts dev`）和 `npm run typecheck`（含 `gsts lua check`）照常检查；
- 所有 gsts 规则都有对应的 ESLint 规则，装了 ESLint 扩展就能在编辑器里看到；
- 插件新增的改善都会列在本页，并写明不开插件时的情况。

## 插件带来的改善

| 场景                      | 开启插件                                                                                                                                                                          | 不开插件时                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 节点图：bigint 下标       | `g.server().on(...)` 回调和 `gstsServer*` 函数里用 bigint / int 值做下标时，不报 TS2538                                                                                           | 编辑器显示 TS2538；用 `idx(...)` 包一层即可（ESLint 可自动修复），编译不受影响 |
| 节点图：与 Lua 共享的模块 | 编辑器直接提示共享模块里不能用的写法（bigint、两边专属的 API）                                                                                                                    | ESLint 的 `gsts/lua-shared-module` 和构建同样会报                              |
| Lua：gsts 报错            | 作为 TypeScript 报错直接显示，不需要 ESLint 扩展                                                                                                                                  | ESLint 扩展、构建、`gsts lua check` 报同样的内容                               |
| Lua：重复的"找不到名称"   | gsts 已给出说明的位置（例如照节点图习惯写了 `stage`）不再重复 TypeScript 的 "Cannot find name"                                                                                    | 两条都显示，信息不缺                                                           |
| Lua：`lua.` 补全          | 按常用程度排列：game、helper、script、self、onSignal、onVariable、onKey、onCursor、Color、Enum；Lua 标准库（print、pairs、math 等）排在后面，右侧标注"Lua 标准库"（跟随系统语言） | 按字母顺序混在一起                                                             |
| Lua：`lua.helper.` 补全   | findControl、findScript、readParams、readVariable、setTimeout、setInterval 在前，其次 requireControl、isControl、requireScript、scriptHandle，最后 multi 和数学工具               | 按字母顺序                                                                     |
| Lua：`lua.Color.` 补全    | 不出现函数自带的 apply、bind 等无关成员                                                                                                                                           | 会出现这些成员                                                                 |

## 启用与确认

- **配置：** 模板项目继承的 `genshin-ts/tsconfig/base.json` 和 `genshin-ts/tsconfig/lua.json` 已经写好 `plugins`，不用改 tsconfig。
- **VS Code / Cursor：** 插件需要编辑器使用工作区的 TypeScript。模板自带 `.vscode/settings.json`，新旧两种设置名都写了：`"typescript.tsdk"` 和较新 VS Code / Cursor 用的 `"js/ts.tsdk.path"`，都指向 `node_modules/typescript/lib`。打开项目时如果提示"使用工作区 TypeScript 版本"，请确认；没有提示时执行 `TypeScript: Select TypeScript Version` → `Use Workspace Version`。
- **IDEA 系列：** 通常开箱即用。
- **升级 genshin-ts 之后：** 运行 `TypeScript: Restart TS Server`。TypeScript 服务器启动时加载插件，不重启会继续用旧版本。
- **确认是否生效：** 在 Lua 文件里输入 `lua.Color.`，列表里没有 apply、bind 就说明插件已加载；也可以打开 TypeScript 服务器日志，查找 `Plugin validation succeeded`。

## 排错：插件没有加载

TypeScript 服务器只在它所用 TypeScript 旁边的 `node_modules` 里找插件。正常用 `npm install` 安装时，`genshin-ts` 和 `typescript` 在同一个 `node_modules` 里，不会有问题。

如果 `genshin-ts` 是用 `npm link` 或手动链接进来的，或者编辑器用的是别处的 TypeScript，日志里会出现 `Failed to load module 'genshin-ts/configs/ts-plugin'`。这时在工作区设置里告诉它到项目的 `node_modules` 找插件，然后重启 TypeScript 服务器：

```json
{
  "typescript.tsserver.pluginPaths": ["./node_modules"]
}
```

较新的 VS Code / Cursor 里这个设置名为 `js/ts.tsserver.pluginPaths`。相对路径按工作区文件夹解析。
