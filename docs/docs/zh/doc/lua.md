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

回调中的声明和执行语句展开到 Lua 文件根级；`onStart`、`onUpdate` 生成官方的 `OnStart`、`OnUpdate`，不会创建运行时脚本工厂。一个入口文件对应一个挂载脚本。可以在回调里写函数、class、对象、数组和普通 TS 运算；class 的 `this` 正常使用。`#value` 私有字段会改写为不冲突的普通 Lua 字段；Lua 侧不提供访问控制。私有字段的 `in` 品牌检查不支持。

回调参数可以叫 `lua`、`env`、`global` 或 `g`。也可以写 `g.clientControlScript({}, lua => { … })`，配置可填写 `timerClock: 'level' | 'real'`，默认使用关卡时钟。`_ENV` 是 Lua 保留的运行环境名称，不能拿来声明变量。

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

`lua.script`、`lua.game`、`lua.Enum`、`lua.Color` 提供官方接口，悬停可查看用途；`lua.helper` 提供工具。全局 `self` 统一表示“当前脚本挂载的宿主”：这里是控件，编译为 `script.object`；节点图中是实体。`send`、`console` 和四个定时器函数也保持全局写法。宿主能力继续经 `lua.script/game/Enum/Color/helper` 访问。

```ts
const control = lua.game.GetClientUIControl(self.id)
if (lua.helper.isControl(control, 'ClientUITextBoxControl')) {
  control.text = '现在会提示文本控件的属性'
  control.fontSize = 24
}
```

`id` 是运行时 ID；`prefabIndex` 是编辑器中的控件/模板索引。类型会阻止把已知的 `prefabIndex` 传给 `GetClientUIControl`。直接写数字仍然允许，需要自己确认数字的含义。创建模板使用 `InstantiateClientUIControl`，不会把查询失败偷偷改成遍历查找。

Lua 环境不引入 `GameObject`、`stage`、`level`、节点图的 `f`、Node 或 DOM 全局。基础 `Math`、`Number`、字符串、数组、对象、Map/Set 由固定版本 TSTL 支持；不支持的操作在构建时诊断。Promise、异步函数、生成器、Date、RegExp、JSON、WeakMap/WeakSet 等不在当前支持范围。

模板默认配置 `export { default } from 'genshin-ts/configs/eslint/full.mjs'` 会按文件所属 tsconfig 中的 `lua_globals` 类型自动启用 Lua 规则，不依赖目录名；节点图专属规则不会运行在 Lua 文件上。自定义配置也可以单独使用：

```js
import tseslint from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'
import gsts from 'genshin-ts/eslint'

export default [
  {
    files: ['src/lua/**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: { project: './src/lua/tsconfig.json' }
    },
    plugins: { gsts, '@typescript-eslint': tseslint },
    rules: gsts.configs.lua.rules
  }
]
```

这个预设关闭节点图语法子集规则，开启可单独配置的 `gsts/lua-*` 规则。`eqeqeq` 要求严格相等；`@typescript-eslint/strict-boolean-expressions` 禁止数字、字符串直接作条件；`no-restricted-syntax` 提醒用 undefined 代替 null。Lua 专有的 `lua-no-undefined-field`、`lua-no-array-hole`、`lua-no-array-delete` 提醒 nil 风险，`lua-no-bigint` 拒绝 bigint。真值提醒覆盖条件、循环、`!`、`&&` 和 `||`；`??` 与明确的布尔比较不因此报警。TS 插件也复用这些诊断。官方 API 签名、只读属性、枚举、回调参数和普通 TS 语法由 TypeScript 检查；TSTL 专有语法限制仍以构建诊断为准。

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

工具可通过 `lua.helper.xxx` 使用，也可从 `genshin-ts/runtime/lua` 按需导入。两种写法使用相同实现。`helper` 是编译期成员，不写入宿主环境表；支持直接访问、局部别名和 `const { helper } = lua` 这样的命名解构；不支持展开整个运行环境。

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

入口中的 `listenKey` 与 `lua.onSignal` 随实例启用/停用注册和取消，未主动取消的订阅在再次启用时恢复；返回的 `off()` 可提前取消且可重复调用。原始官方监听接口仍由调用者管理。控件和 Tween 的所有权仍由用户掌握；框架不会销毁借用的控件。

```ts
const params = lua.helper.readParams(lua.script, {
  Speed: { type: 'number', default: 20 },
  Caption: { type: 'string', default: '速度' }
})
console.log(params.Speed, params.Caption)
```

schema 不会自动创建编辑器变量。未填写可使用默认值；无默认值或类型错误会报出变量名。原始 `GetParam` 返回 unknown，仍可直接使用。2026-09-24 实机确认：客户端控件ID变量原样返回填写的编辑器索引（prefabIndex），不是控件或运行时 ID；改成整数、GUID 或写死数字也不会转换。`GetClientUIControl` 只接受运行时 ID，官方没有按索引查找已有控件的接口。控件按名称/层级查找是官方推荐且实测可用的方式；用 `lua.helper.requireControl(self, 'Panel/Title', 'ClientUITextBoxControl')` 或 `findControl`，不要把控件写进参数 schema。

信号继续使用现有提取的 `Signal` 定义：

```ts
import { Signal } from '../definitions/signals'

// 在脚本回调或普通 Lua TS 模块中
send(Signal['操作输入'], 20, true)
```

类型和参数顺序取自 `defineSignal` 元数据。所有 `send` 都调用同一个运行时辅助函数，按 `signal.params` 和统一种类表选择 `AddFloat`、`AddBool` 等写入方法。发送和接收共用参数数量、类型、整数范围、列表和向量检查；发送校验失败会报出信号名和字段名，参数数量错误则报告信号名，并且不会创建宿主信号对象。各参数按源码顺序只求值一次，校验通过后每次新建信号对象。不能仅凭 TS number 猜应该发送整数还是浮点数。

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

`methods` 中的函数生成 Lua 全局函数，官方 `Invoke` 可以调用。方法参数和返回值有类型提示；多返回值用 `multi`。由你确认取得的句柄确实对应所声明入口；目前不读取编辑器挂载映射来验证。公开函数访问闭包状态，class 方法才使用 class 的 `this`。也支持回调内已有函数：`function summary() { return value }`，再写 `methods: { summary }` 或 `methods: { summary: summary }`。引用对象/class 的方法、非函数值或回调外函数会得到明确诊断。

## 标准库支持清单

下面列出的 128 个成员都有 fengari 执行用例。它们说明已覆盖的常用操作，不承诺完整 ECMAScript 行为或所有重载。新成员先加执行测试，再加入同一份支持表；不在表中的标准库成员会收到说明性诊断。官方宿主 API 与这份标准库清单是两回事，宿主行为仍需游戏验收。

| 类型（Constructor 表示静态成员） | 已覆盖成员                                                                                                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Math                             | `E`, `LN10`, `LN2`, `LOG10E`, `LOG2E`, `PI`, `SQRT1_2`, `SQRT2`, `abs`, `acos`, `asin`, `atan`, `atan2`, `ceil`, `cos`, `exp`, `floor`, `log`, `log10`, `log2`, `log1p`, `max`, `min`, `pow`, `random`, `round`, `sign`, `sin`, `sqrt`, `tan`, `trunc`                                           |
| NumberConstructor                | `MAX_SAFE_INTEGER`, `MIN_SAFE_INTEGER`, `MAX_VALUE`, `MIN_VALUE`, `EPSILON`, `POSITIVE_INFINITY`, `NEGATIVE_INFINITY`, `NaN`, `isInteger`, `isNaN`, `isFinite`, `parseInt`, `parseFloat`                                                                                                         |
| Number                           | `toString`, `toFixed`                                                                                                                                                                                                                                                                            |
| StringConstructor                | `fromCharCode`                                                                                                                                                                                                                                                                                   |
| String                           | `length`, `replace`, `replaceAll`, `concat`, `indexOf`, `substr`, `substring`, `slice`, `toLowerCase`, `toUpperCase`, `trim`, `trimEnd`, `trimRight`, `trimStart`, `trimLeft`, `split`, `charAt`, `charCodeAt`, `startsWith`, `endsWith`, `includes`, `repeat`, `padStart`, `padEnd`, `toString` |
| ArrayConstructor                 | `from`, `isArray`, `of`                                                                                                                                                                                                                                                                          |
| Array                            | `length`, `at`, `concat`, `entries`, `fill`, `push`, `reverse`, `shift`, `unshift`, `sort`, `pop`, `forEach`, `find`, `findIndex`, `includes`, `indexOf`, `map`, `filter`, `reduce`, `reduceRight`, `some`, `every`, `slice`, `splice`, `join`, `flat`, `flatMap`                                |
| ObjectConstructor                | `assign`, `defineProperty`, `entries`, `fromEntries`, `keys`, `values`                                                                                                                                                                                                                           |
| Object                           | `hasOwnProperty`                                                                                                                                                                                                                                                                                 |
| Map                              | `size`, `clear`, `delete`, `entries`, `forEach`, `get`, `has`, `keys`, `set`, `values`                                                                                                                                                                                                           |
| Set                              | `size`, `add`, `clear`, `delete`, `entries`, `forEach`, `has`, `keys`, `values`                                                                                                                                                                                                                  |

可使用普通数组、对象、class、Map、Set、Number/String 转换，以及 Error/throw/try/catch。不要把标准库方法当作值传递或解构；如需回调，用 `values.map(value => Math.abs(value))`。方法名动态索引不支持；数组/字符串的数字索引不受此限制。

`Boolean(value)` 支持显式 JS 真值转换，参数只求值一次：0、空字符串、NaN、undefined（Lua nil）和 false 为 false；对象和数组为 true。无参调用为 false，支持函数别名和 `filter(Boolean)`。`new Boolean()` 不支持。直接在条件中使用数字/字符串仍应改成明确比较；这与显式 Boolean 转换不同。

`setTimeout`、`setInterval` 和对应 clear 函数可用，见下文定时器。requestAnimationFrame、queueMicrotask 暂不可用。Promise、Date、RegExp、JSON、WeakMap/WeakSet、浏览器与 Node 全局不可用。编译器、编辑器插件和 ESLint 共用说明性诊断；用户自己定义的同名局部函数不受影响。

### 包内数据

`genshin-ts/definitions/` 下只允许导入 `prefabs`。构建包时从同一份 TS 数据生成配套 Lua；用户项目按需输出，中文名、英文名和动态键访问均保留。

`import { CharacterPrefab } from 'genshin-ts/definitions/prefabs'` 可直接使用。`CharacterPrefab.Amber`、`CharacterPrefabZh.丽莎` 等静态访问直接生成数值，不输出数据模块。动态键访问只输出被访问的那张导出表；整个命名空间作为值传递时才需要完整模块。节点图 enum/client_enums 包含运行时类，不属于纯数据；Lua 宿主枚举用 `lua.Enum`。其他包内 JS 和 npm 模块不能自动在 Lua 中运行，构建时会解释拒绝原因。

### 需要注意的语义

- TS 数组仍写 0 起始索引；编译器处理 Lua table 的 1 起始索引。调用原生 Lua API 则遵循其声明。
- `{ a: undefined }` 在 Lua 中没有 a 字段；数组中的 undefined 或空项可能截断遍历，`delete items[i]` 会留下空洞。需要移除元素时用 splice。
- 负数取模不同：JS 的 `-5 % 3` 为 -2，Lua 为 1。需要非负循环索引时显式使用 `((n % size) + size) % size`；需要 JS 余数时按向零截断的商计算。
- 对象赋值共享引用；展开或 Object.assign 是浅复制，嵌套对象仍共享。这与 JS 一致，框架不会隐式深复制。

## 输出与安全注入

沿用现有 `gsts` 单文件、批量和 `gsts dev` 命令。输出在 `<outDir>/lua/`；单文件无配置时默认 `dist/lua/`。包含挂载入口、依赖模块、原生 Lua、辅助库及按需 lualib。

配置 `inject.mapId` 且没有 `--noinject` 时，同步到该地图的 `external_lua_file`。继续使用现有区服/玩家/地图定位，不需要 nodeGraphId；本地 dist 产物也保留。**Lua 的“注入”只是把文件复制到 `external_lua_file`，挂载仍需在编辑器中手动完成。** Lua 不会修改 gil 中的脚本挂载映射。

生成文件第一条非空行为 `-- @gsts:lua`。写入前检查本轮待更新的目标批次：目标文件没有这个标记就逐个跳过，其余文件继续写入和清理。结果列出跳过路径及数量。如果冲突文件是手写 Lua，请改名或移动；确认允许覆盖时，在第一条非空行添加标记再运行。`skipSafeCheck` 不会关闭 Lua 的保护。

同内容不重写，每个文件通过临时文件替换。生成清单按项目区分；完整项目构建只移除本项目清单中仍带标记的旧文件，单文件构建不清理其他入口。符号链接/junction、越界路径和文件名冲突会拒绝。清理时也会保留其他项目清单仍在引用的文件。多个项目若输出同名业务模块，仍应主动使用不同子目录；清单隔离不会替你重命名 require 模块。多文件同步不承诺游戏层面的原子热更新；中途失败会列出已更新、已移除和尚未更新的文件。

`dev` 监听 TS、原生 Lua 和声明文件；构建失败保留上一版输出。修改构建配置后重启 dev，与现有监听配置的使用方式一致。编辑器批量添加生成文件夹并挂载入口后，修改 Lua、重新运行游戏即可生效，没有额外“刷新脚本”步骤。

## 自动测试与待验收边界

- 自动执行生成的 Lua：生命周期、class、导入实时绑定、双挂载私有状态、共享模块、原生依赖、多返回值、参数、公开方法、信号参数顺序、console 和 Error 沙箱兼容。
- 使用 TypeScript Language Service 验证全局对象、生命周期、dt、收窄控件的补全，以及节点图专用全局的隔离。
- 在临时模拟地图目录验证注入、noinject、文件头冲突、恢复、清单归属和 junction 保护。
- 官方 SDK 由缓存的官方文档生成；`npm run test:lua:sdk` 检查 640 个宿主 API/枚举成员与生成结果。标准库声明另外维护，不等同于每一个官方 API 都经过游戏实测。

仍需在游戏内验收本次编译器生成的文件：双挂载示例、实际按键/网格交互、信号收发、公开方法和真实注入后的编辑器运行。此前手写 Lua 探针结果不能替代这些验收。

JS 与 Lua 不是完全相同的运行时：nil 会删除字段、造成数组空洞；0 和空字符串在 Lua 中是真值；原生字符串/索引 API 使用 Lua 规则。保留相应诊断，避免宣称任意 JS/Node 库都能运行。

后续待办：提取编辑器脚本变量、控件树与挂载映射，用户补充详细编辑器操作说明；不继续追究时停切换瞬间的严格 OnLevelUpdate 次序。

生成文件头只保留 `-- @gsts:lua`；可选择生成映射文件，用离线命令把 Lua 报错位置还原到 TS，见下文。

需要排查耗时时，设置 `GSTS_INJECT_PROFILE=1`（或 `--inject-profile`）。统一的 `[pipeline-profile]` JSON 中，`lua` 字段记录入口发现、Program、转译、写出和监听阶段；普通构建不会打印这些细节。dev 中 Lua 使用独立 worker，与节点图并行；只重编受修改影响的依赖。

### 编译时的类型检查

日常编译默认不执行整项目 typecheck；编辑器中的类型提示、类型错误与 GSTS 规则照常工作。编译器仍按需读取类型信息，检查 TS 语法、可转译范围、模块依赖和 Lua 产物。默认还会对本轮受影响文件检查无法解析的名称、导入和成员（如 TS2304、TS2339、TS2551），避免拼错 API 后运行才崩；其他完整类型检查仍是可选项。

需要构建时同时检查完整 TS 类型，可在 `gsts.config.ts` 中设置 `lua: { typeCheck: true }`。它与 `lua.include` 可以同时使用；关闭后不会隐藏编辑器里的类型错误。

Lua 语法与 `require` 的解析结果按文件内容缓存，没改的文件不重复解析。只有模块集合或顶层 `require` 依赖关系变化时，才重新检查完整依赖图的循环。新内容仍会检查语法。

### 修改一个 TS 文件时

Lua 编译器会单独维护反向依赖关系，重新转译改动文件及其使用者。只修改一个没有被导入的挂载入口时，只转译该入口；修改共享模块时，其使用者也会更新。类型导入和重导出同样参与分析。

没有改动、也不受影响的模块复用上次结果，再由 TSTL 基于完整集合生成最小运行库。声明文件、全局类型或构建选项变化时，保守地重新转译全部模块。第一次构建、重启 dev 后也需要完整编译。

这套分析仅用于 Lua，不改变节点图原来的依赖判断。`--inject-profile` 中 `compiler.stats.transpiledFiles` 是本轮实际转译文件数，`parsedLuaFiles` 是实际重新解析的 Lua 数量，`sourceFiles` 仍表示项目总文件数。

`dev` 将文件变化清单交给单个持久 Lua worker。普通编辑直接复用未变的 TS 文件和模块解析结果，只更新变化文件的依赖边；新增、删除文件或配置变化会扩大检查范围。Lua 与节点图仍可重叠编译，Lua 内部不分片。

`dev` 也缓存上次成功写出的内容，只预检本轮需要写入、删除的产物。覆盖或删除前仍检查路径和 `-- @gsts:lua`。若你在外部修改、删除了一个本轮未变化的产物，dev 会保持它当前的状态；需要恢复全部产物时，重新执行一次普通构建。普通构建检查所有目标；失败后的重试也会重新检查，不会用旧缓存绕过冲突。

### dev 的入口发现与依赖监听

普通保存只重新识别改动文件是否为 Lua 入口，不再读取所有候选文件。新增、删除文件或调整入口/include 配置时重新检查文件列表；主动构建也会重新检查。

Lua 依赖使用独立监听，只增删实际变化的监听项，不再交给节点图依赖分析重复解析。编译失败时保留旧监听并补上已经解析出的新依赖，成功后才移除不再使用的项。纯 Lua 修改跳过节点图前端；共享 TS 修改仍更新两种产物。同一文件从节点图入口改成 Lua 或反向转换时，也会处理旧产物。

终端的 `All injections done (... ms)` 只记录注入地图的耗时，不包含此前 TS 编译和 GIA 生成。比较编译速度时，需要使用同一计时范围；dev 从保存开始的等待还包含防抖。

### 混合项目的构建结果

节点图和 Lua 分别编译、分别注入。一侧编译失败或注入受阻，不会阻止另一侧完成本轮更新；任何一侧失败，命令仍返回失败退出码。共享依赖本身有错时，使用它的两侧都可能失败。

每轮结束先显示节点图结果，再显示 Lua 日志及结果。例如：

```text
[TS→节点图] 编译：成功；生成 1 个 GIA；注入：成功 1，跳过 0，失败 0。
[Lua] …具体诊断或文件更新信息…
[TS→Lua] 编译：失败；注入：未执行（编译或写出失败）。
```

汇总会区分编译失败、编译成功但本地写出失败、注入失败、`--noinject` 关闭注入、未配置地图、无改动。Lua 编译与写出仍可同节点图并行，日志集中到后面显示。未授权的 Lua 文件仍不会覆盖，结果中会列出冲突路径及 `-- @gsts:lua` 要求。

`entries` 的负向规则只排除入口发现。例如 `!private/**` 不会阻止入口导入 `private` 里的 TS 或原生 Lua 模块，也不会阻止 dev 监听这些依赖及其声明文件。

目前采用自动识别入口的方式：首次构建需要查看匹配 `entries` 的候选文件，才能区分节点图和 Lua。没有 Lua 时不启动 Lua 编译线程、不创建 Lua TS Program，也不运行 TSTL。dev 缓存分类，普通保存只读取变化的候选文件；新增、删除等情况才重新匹配文件列表。不能把“上一轮没有 Lua”当成永久关闭，否则现有 TS 文件改为 Lua 入口后无法自动识别。纯节点图轮次不显示空的 Lua 总结。

这里的“自动识别”是现有行为，不是一个可切换的模式。目前没有另一套手动选择节点图或 Lua 的构建模式；同一套 `entries` 同时发现两类入口，再按文件内的声明分流。

`dev` 就绪后，即使源码目录最初为空，新增节点图入口或 `export default g.clientControlScript(...)` 入口也会触发对应编译。已有一种入口时再新增另一种同样支持，不必重启 dev。新增文件须匹配 `entries` 且未被入口排除规则排除。例如 `entries: ['**/*.ts']` 包含新子目录的 TS 文件；`entries: ['main.ts']` 不会把另一个 `other.ts` 自动当作入口。纯 `.d.ts` 是类型声明，不会单独产出 Lua 或 GIA。

## 类型化接收与共享模块

```ts
// 在入口回调中声明；Signal 使用现有 defineSignal 契约
const off = lua.onSignal(Signal.Input, (evt) => {
  console.log(evt.params.speed, evt.params.fire)
})
// off() 可提前取消；重复调用没有额外效果
```

每个实例、每个信号只有一个宿主监听，多个订阅按声明顺序各执行一次。Start/Enable 幂等注册，Disable 在用户钩子执行后取消底层监听，Destroy 在用户钩子执行后永久释放。分发中新增的订阅从下一条消息生效；已取消的订阅跳过。单个订阅抛错会记录错误，不中断其他订阅。不要对同一个脚本/信号同时使用原始 Register/Unregister 和框架订阅。

作用域的状态为 `idle`（初始化）、`active`（启用）、`inactive`（停用）、`destroyed`（销毁）。Start/Enable 先激活作用域，再执行用户代码；Disable/Destroy 先执行用户代码，再清理订阅和定时器，即使用户代码抛错也会清理。可以在 onDisable 中取消监听或安排收尾；该钩子中新建的定时器也会在随后清理时取消。重复启用/停用不重复注册或移除，销毁后再请求状态转换会被忽略；销毁后新增订阅或定时器则报错。生成的 Lua 中可以直接看到这些调用。

接收先检查参数数量、类型、整数范围、列表元素和向量形状；错误载荷记录信号/字段后丢弃。实体和 GUID 是官方传递的原值，类型为 LuaEntityValue/LuaGuidValue，不会变成节点图实体包装。宿主实际载荷仍须实机验收。

被节点图和 Lua 实际共同导入的模块只写中立代码：类型、常量、纯函数、defineSignal。构建、默认 ESLint 和 TS 编辑器插件都会检查共享模块，即使文件分别落在两套 tsconfig 中。不要在共享模块直接使用 self、宿主 API 或某侧专有运行库。

```ts
// shared/rules.ts
export const INITIAL_SCORE = 10
// server.ts：节点图 int 是 bigint，边界处转换
const score = int(INITIAL_SCORE)
// Lua 侧直接使用 INITIAL_SCORE；Lua int 用 number 表示
```

共享 bigint 字面量和 BigInt() 会报错并提示改用 number。defineSignal 的契约和写入方法映射共用一份中立数据；两侧各自映射到适用的参数类型。

## 定时器

```ts
export default g.clientControlScript({ timerClock: 'level' }, () => {
  return {
    onEnable() {
      const repeat = setInterval(() => console.log(self.name), 1000)
      setTimeout(() => clearInterval(repeat), 5000)
    }
  }
})
```

延迟单位为毫秒；默认 level 累加 OnLevelUpdate 的 dt，real 累加 OnUpdate 的 dt。它们都由宿主派发更新驱动，不是系统墙钟；暂停关系以宿主提供的 dt 为准。在使用框架监听或定时器的入口中，当前脚本的 EnableUpdate 记录用户是否需要执行 onUpdate。待执行的定时器会独立保持宿主更新开关开启；用户关闭更新只停止自己的 onUpdate，不会暂停倒计时。对其他脚本实例的调用仍直接使用官方方法。只有写在入口中的调用（包括 `const s = lua.script` 这类局部别名）会转交给作用域；把 `lua.script` 作为参数传给普通模块后，在模块里调用 EnableUpdate 会直接切换宿主开关，可能让待执行的定时器停止，因此请把 EnableUpdate 留在入口中调用。

停用和销毁自动清空所有任务，再启用不会恢复旧任务。需要每次启用重新计时，就像上例放在 onEnable 中。clearTimeout/clearInterval 可重复调用；0 或负延迟最早下次更新执行，interval 卡顿后每次更新最多补一次，不连续补发积压。回调抛错会记录并移除该任务，其余任务继续。回调内新建任务从下次更新开始。

定时器需要入口实例：在入口回调中使用；普通模块应接收入口传入的调度函数，不能假定其全局 script 属于调用者。

## 报错定位与挂载提示

默认不输出 sourcemap。在 gsts.config.ts 设置 `lua: { sourceMap: true }` 后，本地 Lua 文件旁会输出 .lua.map；映射不会复制进地图。原生 Lua 也记录添加文件头后的行号偏移。

```sh
gsts lua locate dist/lua/hud.lua:42
gsts lua locate --log game-error.log --outDir dist
```

命令显示对应 TS/原生 Lua 文件和行列。它识别常见 file.lua:line 和 [string "..."]:line 文本，不连接游戏进程。Lua 内容与映射不匹配时拒绝定位，框架生成代码可能没有源码位置；请保存同一轮的产物与映射。

构建完成会列出入口的编辑器挂载路径。配置地图后只读核对已识别的 GIL 记录；找到候选记录不代表已确认游戏内挂载成功，未找到也不等于一定没挂载。不会写 GIL 或自动挂载。控件树、脚本变量和精确挂载类型提取待差分地图样本补齐。

## 创建新项目

```sh
npm create genshin-ts@latest my-project -- --with-lua
```

该选项增加 src/lua、独立 tsconfig、最小示例和 typecheck:lua 命令，并补充 AGENTS.md/CLAUDE.md 指引。不加选项的默认模板仍为纯节点图。


入口文件顶层的运行代码是共享模块：所有挂载只执行一次，传送后保留；回调里的代码和变量仍属于每个挂载。共享层不能使用 self、脚本对象、定时器或监听等实例能力。`export default` 可以省略；只有需要让其他脚本通过 `scriptHandle<typeof Board>` 获取 methods 类型时才需要保留。

```ts
export let total = 0 // 所有挂载共享
export function reset() { total = 0 }
g.clientControlScript(lua => {
  let own = 0 // 每个挂载独立
  return { onStart() { own++; total++; lua.print(own, total) } }
})
```

有顶层运行代码的 `lua/hud.ts` 额外生成 `__gsts_shared/lua/hud.lua`，由 require 缓存。挂载路径仍是 `lua/hud`。具名导入读取共享模块的实时导出；default 只当类型使用。顶层只有 import/类型时不会生成额外文件。`__gsts_shared` 是编译器保留的目录，不可用于源码模块。
