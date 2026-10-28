# Lua 编译器结构

给维护者看：TS → Lua 这条编译链路由哪些部分组成、各自保证什么，改动时先看哪些测试。

## 命令行里的一轮构建

`gsts`、`gsts dev` 和单文件构建都经过 [src/cli/lua.ts](../../src/cli/lua.ts)，按顺序分几步：

| 步骤 | 函数                                | 做什么                                                                                                                                  |
| ---- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 发现 | `discoverClientLua`                 | 在 compileRoot 下找 `g.clientControlScript` 入口。没有文件提到 `clientControlScript` 时只读文本、不解析，纯节点图项目几乎没有额外开销。 |
| 计划 | `planClientLua`                     | 决定这一轮要不要编译；dev 里与 Lua 无关的改动直接沿用上次结果。                                                                         |
| 编译 | `compilePlannedLua`                 | 交给编译线程（dev 里常驻）。诊断有错误时抛出，不写任何文件。                                                                            |
| 写出 | `writeClientLua`、`injectClientLua` | 在主线程写到 `<outDir>/lua`，再把 .lua 复制到地图的 `external_lua_file`。只覆盖带 `-- @gsts:lua` 标记的文件。                           |
| 结果 | `startClientLua` 的 `finish`        | 打印缓存的日志和 Lua 的结果行，返回给 [build_summary.ts](../../src/cli/build_summary.ts) 判断是否需要最后的整体结果行。                 |

节点图和 Lua 并行：节点图先等 Lua 的依赖分组（`prepared`），把 Lua 用到的文件排除在节点图编译之外；Lua 的输出等节点图输出结束后再统一打印。`gsts lua check` 走 [lua_check.ts](../../src/cli/lua_check.ts) 的轻量入口，`gsts lua locate` 在 [lua_locate.ts](../../src/cli/lua_locate.ts)。

## 编译器目录

```text
src/compiler/lua/
  ts_to_lua_pipeline.ts   创建 Program、检查、转译和打包
  analysis/              入口模型、类型与语法诊断、共享模块规则
  ts_to_lua_transform/   TSTL 访问器、作用域钩子、共享入口生成
  output/                文件写出、原生模块、数据表和行号映射
  worker/                编译线程、增量依赖与计时
```

`ts_to_lua_transform/plugin.ts` 只创建每文件上下文并装配访问器。`source_file.ts` 决定每个源文件的转换顺序：入口有顶层运行时代码时，先生成共享模块，再生成挂载脚本。`context.ts` 保存本文件的导入绑定和前导声明；`scope.ts` 处理计时与更新开关，`data.ts` 处理包内常量，`standard.ts` 处理标准库调用，`imports.ts` 处理导入、重导出和前导语句，`entry.ts` 生成生命周期与公开方法，`entry_shared.ts` 提供共享模块的生成步骤（`generateSharedModule`、`bindSharedEntry`）。表达式和变量声明分别交给 `expressions.ts`、`variables.ts`。这些函数显式接收文件上下文，转换顺序不依赖另一个文件的状态。

升级 TSTL（`package.json` 锁定 1.34.0）时要核对三类依赖：未公开的内部接口集中在 `tstl_compat.ts`；生成变量名约定（如 `____exports`）用在 `entry.ts`、`entry_shared.ts`、`imports.ts` 和 `output/native.ts`；对 `lualib_bundle.lua` 的文本补丁在 `ts_to_lua_pipeline.ts`。

## 模型、种类表和运行库

模型和种类表描述“是什么”，转换插件负责生成代码，运行库负责每个挂载实例的资源。

| 位置                                                                      | 核心函数或类型                                   | 保证的事情                                                                                                              |
| ------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| [入口模型](../../src/compiler/lua/analysis/entry_model.ts)                | `LuaEntryModel`、`LuaEntryFunction`              | 一个入口明确记录 setup、环境参数、选项、钩子、公开方法和实例能力；保留源码顺序和节点身份。                              |
| [入口分析](../../src/compiler/lua/analysis/entry_analysis.ts)             | `analyzeLuaEntry`                                | 同一个 Program/源码复用分析结果。编辑器、ESLint、构建和插件读取相同事实；私有字段预转换只映射节点身份，不重新解释入口。 |
| [信号定义](../../src/runtime/signal_definition.ts)                        | `signalKinds`                                    | 种类名称、Lua 写入方法和校验类别只定义一次；list 从标量派生。`faction` 明确仅节点图支持。                               |
| [Lua 值类型](../../src/runtime/lua_signals.ts)                            | `LuaKindValues`、`CompleteKinds`                 | 每种 Lua 种类必须有对应 TS 值类型，不能遗漏或多出一项。节点图保留自己的值类型映射。                                     |
| [Lua 种类表生成](../../src/compiler/lua/output/signal_kinds.ts)           | `renderSignalKindsLua`                           | 将同一份元数据输出为 Lua 模块，不修改 helpers 源码，也不在 Lua 中靠截取名称判断列表。                                   |
| [作用域运行库](../../src/runtime/lua_assets/helpers.lua)                  | `createScope`、`subscribe`、`visitSubscriptions` | 每个挂载实例持有一个状态和订阅列表。信号组、按键和计时队列都有 activate/deactivate/dispose；重复取消不会影响其他资源。  |
| [生命周期生成](../../src/compiler/lua/ts_to_lua_transform/scope_hooks.ts) | `generateScopeHooks`                             | 启动先激活再运行用户代码；停止先运行用户代码再清理，用户抛错也会清理。生成的 Lua 显式显示调用，不在运行时改写钩子。     |

## 作用域与宿主行为

作用域允许 `idle → active/inactive/destroyed`、`active ⇄ inactive`、`active/inactive → destroyed`。重复转换和销毁后的状态转换被忽略；销毁后新增订阅或计时任务报错。停用同时暂停监听和定时器；启用后恢复监听，定时器从剩余时间继续。停用期间可排入任务，销毁才释放全部订阅并清空定时器。

`scope.enableUpdate` 只记录用户意愿。宿主开关由“用户需要更新，或者有需要更新时钟的定时器”决定，用户 `onUpdate` 单独受意愿保护。官方关闭更新会同时停止 OnUpdate 和 OnLevelUpdate（已在游戏内确认），所以 `LEVEL_CLOCK_NEEDS_UPDATE = true`。只有当前入口的 `lua.script` 及其 const 或从未重新赋值的别名归作用域管理，其他脚本的 `EnableUpdate` 仍直接调用官方方法。

以下宿主行为也已在游戏内确认，模型据此把共享顶层和实例根部分开：回调根部执行时子控件已存在，随后首次钩子依次为 OnInit → OnEnable → OnStart；关卡时停期间 OnUpdate 照常、OnLevelUpdate 停止；传送会销毁旧挂载，重新执行根部并创建控件，但 require 模块保留。

## 改动时先跑的测试

`npm run test:lua` 跑全部常规测试，`npm run test:lua:watch` 跑 dev 监听、失败恢复和退出码。和上面几部分对应的行为测试：[入口与共同诊断](../../tests/lua/entry-model.mjs)、[假想种类的类型约束](../../tests/lua/signal-kinds.mjs)、[收发边界](../../tests/lua/signal-validation.mjs)、[停用/销毁与异常清理](../../tests/lua/scope-lifecycle.mjs)、[开关归属](../../tests/lua/update-ownership.mjs)、[增量与全量产物一致](../../tests/lua/incremental.mjs)、[节点图与 Lua 混合构建](../../tests/lua/mixed-failures.mjs)。
