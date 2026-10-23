# Lua 核心审阅导读

从下面三个入口看起。模型和种类表描述“是什么”，插件负责生成代码，运行库负责每个挂载实例的资源。

| 审阅起点                                                 | 核心函数或类型                                   | 保证的事情                                                                                                              |
| -------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| [入口模型](../../src/compiler/lua/entry_model.ts)        | `LuaEntryModel`、`LuaEntryFunction`              | 一个入口明确记录 setup、环境参数、选项、钩子、公开方法和实例能力；保留源码顺序和节点身份。                              |
| [入口分析](../../src/compiler/lua/entry_analysis.ts)     | `analyzeLuaEntry`                                | 同一个 Program/源码复用分析结果。编辑器、ESLint、构建和插件读取相同事实；私有字段预转换只映射节点身份，不重新解释入口。 |
| [信号定义](../../src/runtime/signal_definition.ts)       | `signalKinds`                                    | 种类名称、Lua 写入方法和校验类别只定义一次；list 从标量派生。`faction` 明确仅节点图支持。                               |
| [Lua 值类型](../../src/runtime/lua_signals.ts)           | `LuaKindValues`、`CompleteKinds`                 | 每种 Lua 种类必须有对应 TS 值类型，不能遗漏或多出一项。节点图保留自己的值类型映射。                                     |
| [Lua 种类表生成](../../src/compiler/lua/signal_kinds.ts) | `renderSignalKindsLua`                           | 将同一份元数据输出为 Lua 模块，不修改 helpers 源码，也不在 Lua 中靠截取名称判断列表。                                   |
| [作用域运行库](../../src/runtime/lua_assets/helpers.lua) | `createScope`、`subscribe`、`visitSubscriptions` | 每个挂载实例持有一个状态和订阅列表。信号组、按键和计时队列都有 activate/deactivate/dispose；重复取消不会影响其他资源。  |
| [生命周期生成](../../src/compiler/lua/scope_hooks.ts)    | `generateScopeHooks`                             | 启动先激活再运行用户代码；停止先运行用户代码再清理，用户抛错也会清理。生成的 Lua 显式显示调用，不在运行时改写钩子。     |

作用域允许 `idle → active/inactive/destroyed`、`active ⇄ inactive`、`active/inactive → destroyed`。重复转换和销毁后的状态转换被忽略；销毁后新增订阅或计时任务报错。停用同时暂停监听和定时器；启用后恢复监听，定时器从剩余时间继续。停用期间可排入任务，销毁才释放全部订阅并清空定时器。

`scope.enableUpdate` 只记录用户意愿。宿主开关由“用户需要更新，或者有需要更新时钟的定时器”决定，用户 `onUpdate` 单独受意愿保护。`LEVEL_CLOCK_NEEDS_UPDATE = true` 已实机确认（2026-10-22）：官方关闭更新会同时停止 OnUpdate 和 OnLevelUpdate。两种模拟宿主语义仍保留为回归测试；框架改动后的 HUD 行为另需游戏验收。

同日实测：回调根部执行时子控件已存在，随后首次钩子依次为 OnInit → OnEnable → OnStart。关卡时停期间 OnUpdate 照常、OnLevelUpdate 停止。传送销毁旧挂载，重新执行根部并创建控件，但 require 模块保留；模型的共享顶层与实例根部据此分开。

可从这些行为测试反向审阅：[入口与共同诊断](../../tests/lua/entry-model.mjs)、[假想种类的类型约束](../../tests/lua/signal-kinds.mjs)、[收发边界](../../tests/lua/signal-validation.mjs)、[停用/销毁与异常清理](../../tests/lua/scope-lifecycle.mjs)、[开关归属](../../tests/lua/update-ownership.mjs)。
