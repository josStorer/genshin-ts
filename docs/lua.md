# 客户端控件脚本：TypeScript → Lua

用 `g.clientControlScript` 编写挂载脚本；普通 TS 模块与原生 Lua 分文件输出，由官方 `require` 加载。依赖固定为 TypeScript 5.9.3、TSTL 1.34.0，目标 Lua 5.3，没有 fork TSTL。

## 最小示例

```ts
import { g } from 'genshin-ts/runtime/core'

export default g.clientControlScript((lua) => {
  let elapsed = 0
  const speed = 20

  return {
    onStart() {
      lua.script.EnableUpdate(true)
    },
    onUpdate(dt) {
      elapsed += dt
      console.log(elapsed * speed)
    }
  }
})
```

回调中的声明和执行语句展开到 Lua 文件根级；`onStart`、`onUpdate` 生成官方的 `OnStart`、`OnUpdate`，不会创建运行时脚本工厂。一个入口文件对应一个挂载脚本。可以在回调里写函数、class、对象、数组和普通 TS 运算；class 的 `this` 正常使用。

回调参数可以叫 `lua`、`env`、`global` 或 `g`。也可以写 `g.clientControlScript({}, lua => { … })`，目前配置对象没有可填字段。`_ENV` 是 Lua 保留的运行环境名称，不能拿来声明变量。

入口文件在回调外只放 import、类型和 declare 声明。结尾直接 `return { … }`，暂不接受动态拼接、展开生命周期对象或提前返回。普通模块的顶层执行不受此限制。挂载入口不能作为值模块导入；共享内容放进普通模块，入口的类型可以 `import type`。

支持 `onInit`、`onStart`、`onEnable`、`onDisable`、`onUpdate`、`onLevelUpdate`、`onDestroy`。两个更新函数的 `dt` 都是秒；调度和时停由官方负责。

## 类型环境与智能提示

建议把 Lua 文件放在独立目录，例如 `src/lua/`，其中的 `tsconfig.json`：

```json
{
  "extends": "genshin-ts/tsconfig/lua.json",
  "include": ["**/*.ts"],
  "exclude": ["dist"]
}
```

同时从节点图工程的 tsconfig 中排除这个目录，避免同一文件落入两套全局类型。导入路径仍然是 `genshin-ts/runtime/core`；Lua tsconfig 将其类型解析到轻量声明，编译器消除入口标记，不加载节点图运行库。不要覆盖继承配置中的 `paths`；若确实需要项目别名，必须同时保留 core 的 Lua 类型映射。Lua CLI 读取首个入口最近的 tsconfig 的 baseUrl/paths，依赖最终仍须位于 compileRoot 内。多个入口应使用同一套路径映射。

`lua.script`、`lua.game`、`lua.Enum`、`lua.Color` 提供官方接口，悬停可查看用途；`lua.helper` 提供工具。`self` 和 `lua.self` 都代表当前挂载控件，编译为当前环境的 `script.object`。这与节点图里代表实体的 `self` 不同。

```ts
const control = lua.game.GetClientUIControl(self.id)
if (lua.helper.isControl(control, 'ClientUITextBoxControl')) {
  control.text = '现在会提示文本控件的属性'
  control.fontSize = 24
}
```

`id` 是运行时 ID；`prefabIndex` 是编辑器中的控件/模板索引。类型会阻止把已知的 `prefabIndex` 传给 `GetClientUIControl`。直接写数字仍然允许，需要自己确认数字的含义。创建模板使用 `InstantiateClientUIControl`，不会把查询失败偷偷改成遍历查找。

Lua 环境不引入 `GameObject`、`stage`、`level`、节点图的 `f`、Node 或 DOM 全局。基础 `Math`、`Number`、字符串、数组、对象、Map/Set 由固定版本 TSTL 支持；不支持的操作在构建时诊断。Promise、异步函数、生成器、Date、RegExp、JSON、WeakMap/WeakSet 等不在当前支持范围。

ESLint 可以对 Lua 目录单独使用：

```js
import parser from '@typescript-eslint/parser'
import gsts from 'genshin-ts/eslint'

export default [
  {
    files: ['src/lua/**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: { project: './src/lua/tsconfig.json' }
    },
    plugins: { gsts },
    rules: gsts.configs.lua.rules
  }
]
```

这个预设关闭节点图语法子集规则，开启 Lua 语法检查和真值/nil 提醒。真值提醒覆盖条件、循环、`!`、`&&` 和 `||`；`??` 与明确的布尔比较不因此报警。TS 插件也复用这些诊断。官方 API 签名、只读属性、枚举、回调参数和普通 TS 语法由 TypeScript 检查；TSTL 专有语法限制仍以构建诊断为准。

## 模块和原生 Lua

```ts
// 挂载入口中

import { count, increment } from './shared'

// shared.ts：所有挂载实例共享模块状态
export let count = 0
export function increment() {
  count += 1
}
```

命名导入、默认导入、命名空间导入、转导出会读取最新导出值。`const snapshot = count` 仍然是主动保存快照。`const old = state` 保存对象引用；如果导出者重新赋值 `state`，旧引用不会跟着替换。普通对象浅复制也仍共享嵌套对象，这与 JS 的引用语义一致。

TS import 可以写相对路径；输出的 require 使用从编译根目录开始的点分路径，例如 `ui.counter`，不带 `./`。原生 Lua 手写 require 建议采用同一拼写；不同拼写之间是否共享缓存不作额外承诺。普通模块只加载一次；入口回调展开后的局部变量属于各自挂载实例。模块不能假定其中的全局 `script` 是调用它的入口，涉及具体实例时显式传入 `script` 或控件。

原生 Lua 添加同名声明即可补全：

```lua
-- easing.lua
return { double = function(value) return value * 2 end }
```

```ts
// 使用

import { double } from './easing'

// easing.d.ts：Lua 普通函数无隐式接收者
export function double(this: void, value: number): number
```

原生方法用 `this: 对象类型`，普通函数用 `this: void`。这是编写外部 Lua 声明时的约定；官方控件类型已经处理好，日常调用 `control.SetVisible(true)` 即可，无需手工传 self。

原生 Lua 返回整个对象或函数时，可以在声明中使用 `export = api`，通过默认 import 取得整个返回值。没有声明的 `.lua` 也能默认导入，但类型是 `unknown`，需要检查或补声明，不能假装它是任意可调用对象。原生 Lua 代码原样复制，只加生成标记。

`lua.require('vendor/module')` 可自动收集静态依赖。原生 Lua 中的静态 require 也会递归收集。顶层 require 环（包括 TS/Lua 混合环）在写文件前拒绝；函数中延后加载不会一概当作顶层环。动态路径需显式列出可能的文件：

```ts
// gsts.config.ts，路径相对 compileRoot
lua: {
  include: ['vendor/**/*.lua', 'shared/dynamically-loaded.ts']
}
```

这只是构建文件清单，不替换官方 require。动态路径的实际存在性和运行时调用环需要由脚本自己保证。原生 Lua 引用未被 TS import 的 TS 模块时，也把它列入 include。

## 常用工具、信号和参数

工具可通过 `lua.helper.xxx` 使用，也可从 `genshin-ts/runtime/lua` 按需导入。两种写法使用相同实现。`helper`、`self` 是编译期成员，不写入宿主环境表；支持直接访问、局部别名和 `const { helper, self: host } = lua` 这样的命名解构；不支持展开整个运行环境。

| 能力           | 用法                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| 数值工具       | `clamp(value, min, max)`、`lerp(from, to, t)`、`moveTowards(value, target, maxDelta)`                  |
| 类型守卫       | `isControl(control, 'ClientUITextBoxControl')`                                                         |
| 控件路径       | `findControl(root, 'Panel/Title', 'ClientUITextBoxControl')`；缺失返回 undefined，重名或类型错误时报错 |
| 必须存在的控件 | `requireControl(root, path, kind)`；缺失时报错                                                         |
| 取消按键监听   | `const off = listenKey(control, event, callback)`；`off()` 可重复调用                                  |
| 脚本参数       | `readParams(script, schema)`，返回已检查类型的字段                                                     |
| 多返回值       | `multi(a, b)`；普通 TS 数组仍然返回一个 table                                                          |
| 脚本公开方法   | `scriptHandle<typeof OtherEntry>(otherScript)` 后调用 `Invoke`                                         |

生命周期和资源所有权由用户掌握。工具不会暗中启动更新、销毁借用控件或自动取消所有监听。保存 `off`，在自己的 `onDisable` / `onDestroy` 中调用即可。

```ts
const params = lua.helper.readParams(lua.script, {
  Speed: { type: 'number', default: 20 },
  Caption: { type: 'string', default: '速度' }
})
console.log(params.Speed, params.Caption)
```

schema 不会自动创建编辑器变量。基础值未填写可使用默认值；无默认值或类型错误会报出变量名。原始 `GetParam` 返回 unknown，仍可直接使用。控件参数的自动转换在此前实测中未观察到，因此不会根据数字猜控件对象；推荐显式使用名称路径查找。`type: 'control'` 仅接受实际返回的对应控件对象，填索引不会自动转换。

信号继续使用现有提取的 `Signal` 定义：

```ts
import { Signal } from '../definitions/signals'

// 在脚本回调或普通 Lua TS 模块中
send(Signal['操作输入'], 20, true)
```

类型和参数顺序取自 `defineSignal` 元数据。静态契约直接生成 `AddFloat`、`AddBool` 等调用；动态契约使用相同映射的辅助函数。每次发送新建信号对象，各参数只求值一次，按源码顺序执行。Lua 不支持的信号参数类型会报错，不能仅凭 TS number 猜应该发送整数还是浮点数。

`console.log/info` 输出普通日志；`warn` 带警告前缀；`error` 使用 `printerr`；`assert` 失败记录日志而不抛错；`trace` 输出调用栈。多参数与含 `%` 的文本不会触发格式化。需要中断时使用 `throw` 或 `lua.error`。

## 跨脚本公开方法

```ts
// counter.ts
export default g.clientControlScript((lua) => {
  let value = 0
  return {
    methods: {
      add(amount: number) {
        value += amount
        return value
      }
    }
  }
})

// 另一个脚本的回调内；OtherEntry 通过 import type 导入
const other = self.GetScriptByPath('counter')
if (other) {
  const typed = lua.helper.scriptHandle<typeof OtherEntry>(other)
  const [value] = typed.Invoke('add', 2)
}
```

`methods` 中的函数生成 Lua 全局函数，官方 `Invoke` 可以调用。方法参数和返回值有类型提示；多返回值用 `multi`。由你确认取得的句柄确实对应所声明入口；目前不读取编辑器挂载映射来验证。公开函数访问闭包状态，class 方法才使用 class 的 `this`。

## 输出与安全注入

沿用现有 `gsts` 单文件、批量和 `gsts dev` 命令。输出在 `<outDir>/lua/`；单文件无配置时默认 `dist/lua/`。包含挂载入口、依赖模块、原生 Lua、辅助库及按需 lualib。

配置 `inject.mapId` 且没有 `--noinject` 时，同步到该地图的 `external_lua_file`。继续使用现有区服/玩家/地图定位，不需要 nodeGraphId；本地 dist 产物也保留。Lua 不会修改 gil 中的脚本挂载映射。

生成文件第一条非空行为 `-- @gsts:lua`。写入前检查整个目标批次：目标文件没有这个标记就不覆盖，本批次不写入，并明确报告冲突路径和“Lua 注入未完成”。确认允许覆盖后，由用户在文件头第一条非空行添加标记再运行。`skipSafeCheck` 不会关闭 Lua 的保护。

同内容不重写，每个文件通过临时文件替换。生成清单按项目区分；完整项目构建只移除本项目清单中仍带标记的旧文件，单文件构建不清理其他入口。符号链接/junction、越界路径和文件名冲突会拒绝。清理时也会保留其他项目清单仍在引用的文件。多个项目若输出同名业务模块，仍应主动使用不同子目录；清单隔离不会替你重命名 require 模块。多文件同步不承诺游戏层面的原子热更新；中途失败会列出已更新、已移除和尚未更新的文件。

`dev` 监听 TS、原生 Lua 和声明文件；构建失败保留上一版输出。修改构建配置后重启 dev，与现有监听配置的使用方式一致。编辑器批量添加生成文件夹并挂载入口后，修改 Lua、重新运行游戏即可生效，没有额外“刷新脚本”步骤。

## 已验证与边界

- 自动执行生成的 Lua：生命周期、class、导入实时绑定、双挂载私有状态、共享模块、原生依赖、多返回值、参数、公开方法、信号参数顺序、console 和 Error 沙箱兼容。
- 使用 TypeScript Language Service 验证全局对象、生命周期、dt、收窄控件的补全，以及节点图专用全局的隔离。
- 在临时模拟地图目录验证注入、noinject、文件头冲突、恢复、清单归属和 junction 保护。
- 官方 SDK 由缓存的官方文档生成；`npm run test:lua:sdk` 检查 640 个宿主 API/枚举成员与生成结果。标准库声明另外维护，不等同于每一个官方 API 都经过游戏实测。

仍需在游戏内验收本次编译器生成的文件：双挂载示例、实际按键/网格交互、信号收发、公开方法和真实注入后的编辑器运行。此前手写 Lua 探针结果不能替代这些验收。

JS 与 Lua 不是完全相同的运行时：nil 会删除字段、造成数组空洞；0 和空字符串在 Lua 中是真值；原生字符串/索引 API 使用 Lua 规则。保留相应诊断，避免宣称任意 JS/Node 库都能运行。

后续待办：提取编辑器脚本变量、控件树与挂载映射，用户补充详细编辑器操作说明；不继续追究时停切换瞬间的严格 OnLevelUpdate 次序。

生成文件头记录源码相对路径；目前运行时报错仍使用 Lua 行号，没有 TS sourcemap。

编译耗时、当前并行方式和基准运行方法见 [性能实测](design/client-lua-performance.md)。

### 编译时的类型检查

日常编译默认不执行整项目 typecheck；编辑器中的类型提示、类型错误与 GSTS 规则照常工作。编译器仍按需读取类型信息，检查 TS 语法、可转译范围、模块依赖和 Lua 产物。

需要构建时同时检查完整 TS 类型，可在 `gsts.config.ts` 中设置 `lua: { typeCheck: true }`。它与 `lua.include` 可以同时使用；关闭后不会隐藏编辑器里的类型错误。

Lua 语法与 `require` 的解析结果按文件内容缓存，没改的文件不重复解析。每轮仍用当前完整模块关系检查顶层循环加载。
