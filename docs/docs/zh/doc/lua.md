# 客户端控件脚本：TypeScript → Lua

用 `g.clientControlScript` 编写客户端控件脚本；TS 模块和原生 Lua 分文件输出，由官方 `require` 加载。编译器使用 TypeScript 5.9.3、TSTL 1.34.0，目标 Lua 5.3，没有 fork TSTL。

## 项目结构与类型提示

Lua 与节点图在同一项目开发，但分别使用自己的 tsconfig，避免混入另一侧的全局类型。

```text
src/
  graphs/main.ts
  resources/signals.ts
  lua/
    tsconfig.json
    hud.ts
    lib/format.ts
```

`src/lua/tsconfig.json`：

```json
{
  "extends": "genshin-ts/tsconfig/lua.json",
  "include": ["**/*.ts"],
  "exclude": ["dist"]
}
```

根 tsconfig 排除 `src/lua`。导入 `g` 仍用 `genshin-ts/runtime/core`；继承配置中的 paths 将它解析为 Lua 声明，不加载节点图运行库。添加自己的路径别名时要保留这项映射。CLI 使用首个入口最近的 tsconfig 的 baseUrl/paths，多个入口应使用相同映射，依赖须位于 compileRoot 内。

`npm create genshin-ts@latest` 默认使用"节点图 + Lua"模板，生成的就是上面这套结构；模板的 `npm run typecheck` 会顺带运行 `gsts lua check`。

## 在已有项目中加入 Lua {#add-lua}

用"仅节点图"模板或更早版本创建的项目，按下面几步加入 Lua：

1. 新建 `src/lua/tsconfig.json`，内容同上。
2. 在根目录的 `tsconfig.json` 里加上 `"exclude": ["src/lua"]`，避免节点图工程混入 Lua 的全局类型。
3. 在 `src/lua` 下写第一个 `g.clientControlScript` 入口，写法见下文"入口与代码位置"。构建会自动识别 Lua 入口；只要文件在 `gsts.config.ts` 的 `entries` 覆盖范围内，就不用改配置。
4. 默认的 `full.mjs` ESLint 会按 tsconfig 自动给 `src/lua` 使用 Lua 规则；在 `package.json` 的 `typecheck` 脚本后面加上 `&& gsts lua check`。
5. 运行 `npm run dev`，然后在编辑器里添加 Lua 输出文件夹并挂载入口，见下文"构建、路径与注入"。

用"节点图 + Lua"模板新建一个项目，可以对照完整结构。

## 入口与代码位置

回调根部展开到 Lua 文件根级，钩子生成官方的同名函数，不创建运行时脚本工厂。

```ts
import { g } from 'genshin-ts/runtime/core'

export let visits = 0 // 全体挂载共享，传送后保留

g.clientControlScript((lua) => {
  visits += 1
  let elapsed = 0 // 每个挂载各一份
  const title = lua.helper.requireControl(self, 'Title', 'ClientUITextBoxControl')
  return {
    onStart() {
      title.text = `第 ${visits} 次挂载`
      lua.script.EnableUpdate(true)
    },
    onUpdate(dt) {
      elapsed += dt
      title.text = `${elapsed.toFixed(1)} 秒`
    }
  }
})
```

没有根部初始化代码时，可以直接返回对象，省去花括号和 `return`。两种写法生成的 Lua 相同：

```ts
export default g.clientControlScript((lua) => ({
  onStart() {
    lua.print('Ready')
  },
  onUpdate(dt) {
    lua.print(dt)
  }
}))
```

对象外层可以加括号、`as` 或 `satisfies`。仍需直接写出钩子对象，不能用 `(lua) => makeHooks()` 代替。

以下是框架的编写建议，不是官方对代码位置的推荐：

| 位置         | 执行次数                                 | 适合放什么                               |
| ------------ | ---------------------------------------- | ---------------------------------------- |
| 入口文件顶层 | 当前客户端模块环境中全体一次，传送后保留 | 共享数据、工具函数、跨传送状态           |
| 回调根部     | 每个挂载一次，传送后重跑                 | 查找控件、本实例状态、信号/按键订阅      |
| onStart      | 每个实例一次                             | 初次显示、开启用户更新、只排一次的定时器 |
| onEnable     | 每次启用                                 | 每次恢复都要重做的事                     |

首次顺序是 **根部 → OnInit → OnEnable → OnStart**，OnEnable 在 OnStart 之前；根部执行时子控件已存在（已在游戏内确认）。通常无需 onInit，初始化可以直接写在根部。

回调参数名可用 `lua`、`env` 等；`_ENV` 是保留名。一个文件只允许一个入口。回调中可写函数、class、对象、数组和普通 TS 运算，用上面的任一种写法直接返回钩子对象；不接受动态拼接/展开钩子对象或提前返回。class 的 this 正常使用；`#value` 改写为不冲突的普通字段，不提供 Lua 访问控制，私有字段的 in 品牌检查不支持。

顶层支持 import、类型、const/let、函数、class 和具名 export。涉及当前实例的 self、script、定时器、信号/按键订阅只能在回调内使用，不能放在共享顶层或普通模块中。import/type-only 顶层不生成额外共享文件。

入口回调直接用到的可变顶层变量，如需导出，请写 `export let value = 0`。不能再用 `export { value }` 或 `export { value as other }` 导出它，包括已经写了 `export let` 的变量。`const`、函数、class，以及回调没有直接用到的变量，仍可用 `export { … }`。

支持 onInit、onStart、onEnable、onDisable、onUpdate、onLevelUpdate、onDestroy；更新函数的 dt 单位均为秒。

## 宿主 API、控件和脚本变量

官方能力通过 `lua.script`、`lua.game`、`lua.Enum`、`lua.Color` 访问；工具用 `lua.helper`，也可从 `genshin-ts/runtime/lua` 按需导入。信号、自定义变量、按键和光标的监听直接在 `lua` 上：`lua.onSignal`、`lua.onVariable`、`lua.onKey`、`lua.onCursor`（见“信号与监听”）。

```ts
// clientControlScript 回调内
const title = lua.helper.requireControl(self, 'Panel/Title', 'ClientUITextBoxControl')
title.text = '已就绪' // 收窄后提示文本控件属性
const candidate = lua.game.GetClientUIControl(self.id)
if (lua.helper.isControl(candidate, 'ClientUITextBoxControl')) {
  candidate.fontSize = 24
}
```

全局 self 表示“当前脚本挂载的宿主”：Lua 是控件（`script.object`），节点图是实体。send、console 和四个定时器函数也保持全局写法。Lua 中没有节点图的 f、GameObject、stage、level、Vector3、int/str 等取值函数，也没有 Node/DOM 全局；照节点图习惯写时会报 `gsts/lua-graph-api` 并给出客户端的写法：

| 节点图                         | 客户端 Lua                                                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| GameObject、player、entity     | 客户端没有实体 API；界面控件用 lua.helper.findControl / requireControl                                                                  |
| stage、level                   | 只能读取：lua.helper.readVariable(lua.Enum.CustomVariableEntityType.Level, 名称, 类型)；变化用 lua.onVariable；要修改请发信号让服务器改 |
| Vector3、vec3                  | 写成 `{ x, y, z }` 表                                                                                                                   |
| Mathf、Random                  | Math.\*、Math.random()，以及 lua.helper.clamp / lerp / moveTowards                                                                      |
| int、float、str、bool、guid 等 | 不需要：数字都是 number（不区分 int 和 float），转换用 String(x)、Boolean(x)                                                            |
| list、dict                     | 数组写 `[...]`，键值数据用普通对象或 Map                                                                                                |

`control.SetVisible(true)` 自动生成 `control:SetVisible(true)`；官方控件的 self 已在声明里处理，无需手工传参。只在给原生 Lua 写声明时需要区分 `this: void` 与有接收者的方法。

| 工具                               | 用途                                                       |
| ---------------------------------- | ---------------------------------------------------------- |
| findControl(root, path, kind)      | 按名称路径查找；缺失返回 undefined，重名或类型错误时报错   |
| requireControl(root, path, kind)   | 必须找到的控件；缺失时报出路径                             |
| isControl(control, kind)           | 类型守卫，收窄后支持 control.xxx 补全                      |
| clamp / lerp / moveTowards         | 数值限制、插值、向目标移动                                 |
| readParams(schema)                 | 检查当前脚本的变量，返回带类型字段                         |
| readVariable(实体类型, 名称, 类型) | 立即读取一个全局自定义变量并检查类型；没有值时为 undefined |
| multi                              | 多返回值                                                   |
| findScript / requireScript         | 找到另一个挂载并调用它的公开方法；require 版找不到就报错   |
| scriptHandle(script)               | 把已有的官方 Script 包装成同样的句柄                       |

脚本变量只支持 number/string/boolean；schema 不创建编辑器变量。编辑器里没有这个变量时使用 default，没有 default 就报出变量名；变量建了但留空不算缺失，字符串会读到空串（已在游戏内确认）。

```ts
const params = lua.helper.readParams({
  Speed: { type: 'number', default: 20 },
  Caption: { type: 'string', default: '速度' },
  Enabled: { type: 'boolean', default: true }
})
console.log(params.Speed, params.Caption, params.Enabled)
```

**已在游戏内确认：**编辑器“客户端控件ID”变量原样返回填写的索引 prefabIndex，不是控件或运行时 ID；改成整数、GUID，或写死数字都不会转换。GetClientUIControl 只接受运行时 ID，官方没有“按索引找已有控件”的接口。控件按名称/层级查找是官方推荐且实测可用的方式，不要把控件放进 readParams schema。prefabIndex 用于 InstantiateClientUIControl 等模板创建场景，self.id 才是运行时查询值。

## 模块、传送与状态恢复

入口顶层和普通模块共享一份状态；回调里的变量属于各自挂载。命名导入保持实时绑定，主动保存值仍然是快照。

```ts
// 在回调根部重新找到控件，用共享 score 恢复画面
// title.text = `${score}`

// 另一个入口文件

import { addScore, score } from './hud'

// hud.ts 顶层
export let score = 0
export function addScore(amount: number) {
  score += amount
}

// 回调内：addScore(1); console.log(score)
```

传送的实测结果：旧实例先停用、销毁；新控件重新创建，回调根部重跑，之后 Init → Enable → Start；require 模块不重新加载。根部必须能从头建立完整界面，读取共享数据恢复显示。共享模块不要长期保存控件对象，传送后重新查找；共享数据是所有挂载共用的，需要区分玩家/面板时自己按稳定的业务键保存。

断线重连暂按同一恢复模型编写，**尚未实测**。不能把传送结果当成客户端彻底退出后仍持久化的承诺。

```ts
// 普通共享模块：只存数据，不保存控件
export const scores: Record<string, number> = {}
// 某一入口回调内：
// const title = lua.helper.requireControl(self, 'Title', 'ClientUITextBoxControl')
// title.text = `${scores.left ?? 0}`
```

TS 相对 import 会转为从编译根目录开始的 require 路径，不带 `./`。循环的顶层 require（包括 TS/Lua 混合）在写出前报错；延后到函数中的 require 不一概判成顶层环。官方缓存按路径工作，手写原生 require 应保持一致拼写。

`const saved = score` 保存数值快照；`const old = state` 保存对象引用，导出者重新赋值 state 不会替换 old。spread/Object.assign 是浅复制，嵌套对象仍共享，和 JS 一样。

## methods：调用指定挂载

屏幕左右各一个计分板时，顶层 export 是两边共享的函数；methods 经 Invoke 调用其中某一个挂载，修改它自己的分数。

```ts
// board.ts

import { g } from 'genshin-ts/runtime/core'

export default g.clientControlScript(() => {
  let score = 0
  function push(amount: number) {
    score += amount
    return score
  }
  return { methods: { push } }
})
```

```ts
// hud.ts 顶层

import type Board from './board'

// hud 回调内：Left 和 Right 是两个分别挂载 board 的容器
const left = lua.helper.findScript<typeof Board>(self, 'Left')
const score = left?.methods.push(2) // 只修改左侧，右侧不变
left?.Invoke('push', 2) // 官方 Invoke 写法也可以，返回全部返回值
```

`findScript<typeof Board>(control, path?)` 在 control 上（写了 path 就先按路径找子控件）找到挂载的 board 脚本，找不到返回 undefined。脚本路径由 `typeof Board` 指向的入口文件推出（这里是 `lua/board`），不用手写；类型参数不是入口时编辑器、ESLint、构建都会报 `gsts/lua-find-script`。拿到的句柄上：`methods.方法名(...)` 像普通函数一样调用并返回方法的返回值；`Invoke('方法名', ...)` 与官方相同；`script` 是官方 Script 本身。已经拿到官方 Script 时（例如来自 `GetScript`），用 `lua.helper.scriptHandle<typeof Board>(script)` 包装成同样的句柄。

export default 可以省略；保留它是为了 `import type Board` / `typeof Board` 提供方法名、参数和返回类型。default 不能作为运行时值导入，具名 export 可以。

methods 支持内联函数、回调内函数引用及简写；不接受 class/对象方法、非函数值或回调外函数。多返回值用 `lua.helper.multi(a, b)`；普通 TS 数组仍返回一个 table。

## 信号与监听 {#signals}

信号使用现有提取结果或同一份 defineSignal 契约，发送顺序、接收字段和类型一起推导。

```ts
// shared/signals.ts

import { defineSignal } from 'genshin-ts/runtime/core'

export const Signal = {
  Input: defineSignal('Input', [
    ['speed', 'float'],
    ['fire', 'bool']
  ])
}
// 入口文件 import { Signal } from '../shared/signals'
// 回调根部：
const off = lua.onSignal(Signal.Input, (evt) => {
  console.log(evt.params.speed, evt.params.fire)
})
send(Signal.Input, 20, true)
// off() 可提前取消；重复调用没有额外效果
```

服务器节点图要用【发送客户端脚本信号】（`sendLua` / `sendLuaAll`）发给 Lua；普通的 `send` / `f.sendSignal` 只发给节点图，Lua 收不到。信号会送到目标玩家身上挂载的所有 Lua 脚本，每个挂载实例各收到一次。服务器侧的写法见[信号：发给客户端 Lua 脚本](./events/signals.md#to-lua)。

`evt.params` 按参数名读取，`evt.values` 按定义顺序读取同一组参数，两者都有类型、都经过检查：

```ts
lua.onSignal(Signal.Input, (evt) => {
  const [speed, fire] = evt.values // speed: number, fire: boolean
})
```

和节点图一样，也可以只写信号名。这时没有信号定义：回调里只有 `evt.name` 和 `evt.values`（按服务器发送顺序排列的原始值，类型是 unknown，使用前请自行判断），不做参数检查。按名字发送只能用于不带参数的信号：

```ts
lua.onSignal('GameStart', (evt) => {
  const [round] = evt.values
  if (typeof round === 'number') console.log('第', round, '回合')
})
send('Ready') // 不带参数
```

带参数的信号必须传信号定义（`Signal.X` 或 `defineSignal(...)`）：节点图按值区分 int（bigint）和 float（number），Lua 的数字没有这个区别，实体、GUID 也都是数字，无法推断该写入哪种类型。`send('名字', 参数)` 会报 `gsts/lua-signal-argument`；同一个脚本里，同名信号只要有一处用了信号定义，按名字的监听也只会收到检查合格的消息。

推荐在根部订阅；根部和 onStart 每个实例只执行一次，框架负责暂停/恢复。onEnable 每次启用都再增加一条，丢弃返回的取消函数会收到 `gsts/lua-on-enable-subscription` 警告（编辑器、ESLint、构建一致）。确实需要每次重新订阅时，保存取消函数并在 onDisable 取消：

```ts
let off: (() => void) | undefined
return {
  onEnable() {
    off = lua.onSignal(Signal.Input, (evt) => console.log(evt.params.speed))
  },
  onDisable() {
    off?.()
    off = undefined
  }
}
```

按键、光标和自定义变量的监听也在 `lua` 上，和 lua.onSignal 一样写在根部、随启停自动管理：

```ts
// 回调根部
lua.onKey(self, lua.Enum.KeyEventType.KeyboardJumpKeyDown, () => {
  jump() // 不写返回值：同容器的其他控件照常响应；返回 true 表示已处理，其他控件不再响应
})
lua.onCursor(button, lua.Enum.CursorEventType.CursorClick, (event) => {
  console.log(event.GetUIPos())
})
render(lua.helper.readVariable(lua.Enum.CustomVariableEntityType.Level, 'Stage', 'number') ?? 0) // 开始时先读当前值
lua.onVariable(lua.Enum.CustomVariableEntityType.Level, 'Stage', 'number', (stage) => {
  render(stage) // 每次被设置时给出新值（值没变也会触发）；类型不是 number 时记一条错误并跳过
})
```

lua.onCursor 只接受预设按钮和光标检测区域。四个监听都返回取消函数，也可以先解构再用：`const { onKey, onSignal } = lua`。

lua.onVariable 在变量每次被设置时触发：设成相同的值也会触发，也不受服务器“设置自定义变量”节点“是否触发事件”的影响（该选项只管服务器的“自定义变量变化时”事件）。只关心真正变化时请自己和上次的值比较；开始时不会触发，需要当前值请用 `lua.helper.readVariable` 读取（参数和 onVariable 相同，没有值时返回 undefined，类型不符直接报错）；只有在自定义变量组件里预先配置的变量才会同步到客户端：服务器用“设置自定义变量”在运行时新建的变量，Lua 读不到也监听不到；配置好的变量被服务器修改后，不需要信号也会同步过来，readVariable 能读到新值，onVariable 也会触发；客户端只能读变量，要修改请发信号让服务器改；同一个变量不要再混用官方的 RegisterCustomVariableChangedHandler（会报 `gsts/lua-listener-ownership`）。每个实例每个信号只有一个底层监听，多个订阅按声明顺序各执行一次；分发时新增的下次生效，取消的跳过，单个回调抛错不阻断其他回调。不要混用同一信号的官方 Register/Unregister 与框架订阅。官方原始监听、Tween 和控件所有权仍由用户管理，框架不会销毁借用控件。

### 信号边界检查

Lua 发送前、接收后共用一套检查，服务器节点图不参与这些客户端检查：发送不合格直接报错；接收不合格打印错误、丢弃消息，不执行回调。

```text
[GSTS] Invalid signal payload: Input.speed
```

```ts
// 即使原生调用绕过了 TS 类型，数量/类型错误仍在 Lua 边界被检查
send(Signal.Input, 20, true) // 按契约写 AddFloat、AddBool
```

每次有效发送新建官方信号对象，参数按顺序只求值一次。检查数量、类型、有限数值、整数安全范围、列表形状和 vec3。int 在 Lua TS 中是 number；Lua 5.3 区分整数/浮点，`4 / 2` 为浮点 2.0。**已在游戏内确认：**官方 AddInt 收到 2.0 时，服务器得到 2；收到 1.5 时不报错，服务器却得到 0。所以 send 放行 2.0 这样的浮点整数，拒绝带小数的值；需要取整时自己写，例如 `Math.floor(total / 2)`。实体/GUID 是官方原值（LuaEntityValue/LuaGuidValue），不是节点图实体包装。

每个参数只需几次比较；列表的检查耗时与长度成正比。在 PC 上用 wasmoon（Lua 5.4）模拟测量，10 万个 int 元素约 20 ms；常见的几十到几百个元素可以忽略。

两侧共同导入的文件只写类型、常量、纯函数、defineSignal。构建、默认 ESLint、TS 插件按实际依赖检查跨 tsconfig 共享模块。共享常量写 number，节点图在边界用 int()，共享 bigint 会报错。

共享的计算函数在两边的执行方式不同：Lua 里是普通函数，运行时调用；节点图里普通函数在**编译期**执行。所以节点图传字面量（如 `score(2, false)`）会在编译时直接算成常量；要用游戏运行时的值（如 `evt.params.combo`）计算，请把函数命名为 `gstsServer` 开头，它会被编译成节点，Lua 侧照常是普通函数：

```ts
// shared/calc.ts，节点图和 Lua 都能在运行时调用
export function gstsServerScore(combo: number, perfect: boolean) {
  return perfect ? combo * 20 : combo * 10
}
```

如果普通函数拿到运行时的值做了 JS 运算（`*`、`+`、`<`、`Number()` 等），构建会直接报错并给出上面的改法。普通函数接收 `f`、只调用节点函数的写法不受影响。

```ts
// shared/rules.ts
export const INITIAL_SCORE = 10
// server.ts
const score = int(INITIAL_SCORE)
// Lua 直接用 INITIAL_SCORE
```

## 停用、定时器与时停

停用暂停监听和定时器，启用从剩余时间继续，销毁才清空；把 script.enabled 设回 true 或重新激活控件，官方会再调用 OnEnable。

```ts
import type { LuaTimerHandle } from 'genshin-ts/runtime/lua'

// 回调内
const pending: LuaTimerHandle = setTimeout(() => console.log('到时'), 3000)
// 运行 1 秒 → 停用 5 秒 → 启用 → 再运行 2 秒才触发
// clearTimeout(pending) 可提前取消
```

停用期间可以安排任务，启用后开始计时；销毁后安排任务报错。Start/Enable 先激活作用域再执行用户钩子；Disable/Destroy 先执行用户钩子，再暂停/清除资源，即使钩子抛错也清理。onDisable 新排的定时器随即暂停，之后可以恢复。

全局定时器延迟是毫秒，默认用关卡时钟；入口可整体换成 real，每个 helper 定时器也可以单独选。

```ts
g.clientControlScript({ timerClock: 'real' }, (lua) => {
  const real = setTimeout(() => console.log('全局使用 real'), 1000)
  const level = lua.helper.setInterval(() => console.log('随关卡时间'), 1000, 'level')
  const prompt = lua.helper.setTimeout(() => console.log('不受时停影响'), 1000, 'real')
  return {
    methods: {
      cancel() {
        clearTimeout(real)
        clearInterval(level)
        clearTimeout(prompt)
      }
    }
  }
})
```

real 由 OnUpdate 推进，不受关卡时停影响；level 由 OnLevelUpdate 推进，关卡时停时暂停。两者在脚本停用时都暂停，均不是系统墙上时钟。全局 clearTimeout/clearInterval 也可取消 helper 句柄，重复取消安全。零/负延迟等下一次更新，卡顿后 interval 一帧最多执行一次、不补过期次数；回调中新任务等下一次更新，抛错任务记录错误后移除。

### 更新开关的归属

使用框架监听/定时器的入口中，`lua.script.EnableUpdate(x)` 记录“用户是否要跑 onUpdate”；待执行定时器独立保有官方开关。

| 最后一次 EnableUpdate | 有定时器在等 | 官方开关（脚本启用时） | 用户 onUpdate |
| --------------------- | ------------ | ---------------------- | ------------- |
| true                  | 无/有        | 开                     | 执行          |
| false                 | 有           | 开，供定时器计时       | 不执行        |
| false                 | 无           | 关                     | 不执行        |

```ts
let elapsed = 0
return {
  onStart() {
    lua.script.EnableUpdate(true)
    setTimeout(() => console.log('3 秒结束'), 3000)
  },
  onUpdate(dt) {
    elapsed += dt
    if (elapsed >= 1) lua.script.EnableUpdate(false) // 动画结束，倒计时仍继续
  }
}
```

只在最终结果变化时调用官方开关，频繁 true/false 不会多余地切换它。当前实例的开关调用应写在入口内；其他脚本的官方开关不会被接管。已在游戏内确认：官方 EnableUpdate(false) 同时停止两个更新钩子，因此关卡定时器也需要保持开关。

## 原生 Lua 互操作

原生模块配同名 .d.ts；多返回值写 LuaMultiReturn，普通导出函数声明 this:void。

```lua
-- vector.lua
return { split = function(value) return value, value * 2 end }
```

```ts
// vector.d.ts

import type { LuaMultiReturn } from 'genshin-ts/runtime/lua'

export function split(this: void, value: number): LuaMultiReturn<[number, number]>
// 使用：import { split } from './vector'
// const [x, y] = split(3)
```

写成 `[number, number]` 会被当作一个数组，诊断会提示改成 LuaMultiReturn。对象/接口的函数成员也需显式 this：普通点调用用 void，真正的冒号方法填对象类型；顶层 export function 不因缺 this 被误报。

```ts
export interface VectorApi {
  add(this: void, a: number, b: number): number
}
```

export = 可描述整个返回对象/函数，再用默认 import；无声明的 .lua 可默认导入为 unknown，需自行收窄。原生 Lua 原样复制，只增加生成标记。lua.require('vendor/module') 和原生静态 require 自动收集，动态路径用 include 列出候选文件：

```ts
// gsts.config.ts，路径相对 compileRoot
lua: {
  include: ['vendor/**/*.lua', 'shared/dynamically-loaded.ts']
}
```

include 只补构建清单，不改变官方 require 或保证动态调用不会成环。原生模块不能假定其中的 script 是调用入口的实例，需显式传入对象。

## 语义差异与检查

数字/字符串不能直接当条件；编辑器、ESLint 和构建都报错，显式比较或 Boolean 转换即可。

```ts
if (count !== 0) {
  /* … */
}
if (name !== '') {
  /* … */
}
const selected = [0, 1, 2].filter(Boolean) // [1, 2]
```

Boolean(x) 保持 JS 转换规则，生成 `__gsts_helpers.toBoolean(nil, x)`；nil 是回调接收者占位，以兼容 filter(Boolean)。0、空字符串、NaN、undefined/nil、false 变 false，其余变 true。参数只求值一次，无参返回 false，别名可用，new Boolean() 不支持。

### 数组和 nil

TS 数组照常从 0 写，TSTL 换算成 Lua 从 1 开始的连续表；length 变为 #arr。

```ts
const values = [10, 20, 30]
console.log(values[0]) // Lua: values[1]
const copy = values.slice(1) // 新的连续数组 [20, 30]
values.splice(1, 1) // 删除并收拢，不用 delete values[1]
```

对象字段设为 undefined 会删除字段；数组的 `[1, undefined, 3]`、给中间元素赋 undefined、delete 都可能留洞。ESLint 会提醒可静态发现的写法；信号边界检查拦下空洞、非连续或带多余键的表，包括原生 Lua 的 0 起始表。不要理解为所有任意数组赋值都有通用运行时检查。

### 相等与取模

Lua 文件允许 ==/!=，与 ===/!== 分别生成同样的 ==/~=；Lua 不做隐式类型转换，字符串 '1' 与数字 1 不相等。

```ts
const a: unknown = '1'
const b: unknown = 1
console.log(a == b, a === b) // false, false
```

| 运算  | JS % | Lua % | lua.math.fmod |
| ----- | ---- | ----- | ------------- |
| 5, 3  | 2    | 2     | 2             |
| -5, 3 | -2   | 1     | -2            |
| 5, -3 | 2    | -1    | 2             |

`gsts/lua-modulo` 仅在 ESLint 对 %/%= 给警告，两边非负可忽略，需要 JS 余数用 lua.math.fmod。它不进入 TS 插件或构建诊断，可单独关闭。

```ts
const remainder = lua.math.fmod(-5, 3) // -2
```

```js
// eslint.config.mjs，在原配置后添加
{ files: ['src/lua/**/*.ts'], rules: { 'gsts/lua-modulo': 'off' } }
```

模板默认 `export { default } from 'genshin-ts/configs/eslint/full.mjs'` 按所属 tsconfig 的 lua_globals 类型启用 Lua 规则，不依赖目录名；节点图专属规则不运行在这些文件上。自定义配置可取 gsts.configs.lua.rules，配合 typescript-eslint 的 parser/project。

编辑器里的 Lua 报错由 ESLint 扩展或 TypeScript 插件显示，两者内容相同，不开插件也不会漏报；插件另外负责 `lua.` 补全排序、"Lua 标准库"标注等体验改善，见 [TypeScript 插件](./quick-start/ts-plugin.md)。

strict-boolean-expressions 为 error；null、undefined 字段、数组空洞/删除有独立提示；bigint 不支持。默认构建仅对受影响文件检查名称/成员无法解析等错误，不做完整 typecheck。编辑器仍检查所有普通 TS 类型；需要构建完整检查可设置 `lua: { typeCheck: true }`。

`gsts lua check` 只做检查、不写文件：完整 TS 类型检查加全部 Lua 规则，包括原生 `.d.ts` 的写法检查（普通 `tsc` 不认识这些规则）。它先看项目里有没有 Lua 的 tsconfig，没有就立即结束，所以模板把它接在 `typecheck` 后面，纯节点图项目几乎没有额外开销。

## 标准库与包内数据

下表列出可以使用的 128 个标准库成员，每个都有自动测试；但不保证与 JavaScript 的每个细节和重载完全一致。用到表外的成员时会有诊断提示。

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

支持普通 class、数组/对象、Map/Set、Number/String、Error/throw/try/catch（catch 拿到的总是字符串，见 [Lua 调试](./lua-debug.md)）；标准库方法不支持当值取出或动态访问方法名，请用 `values.map(value => Math.abs(value))`。数字索引仍可用。Promise、Date、RegExp、JSON、WeakMap/WeakSet、requestAnimationFrame、queueMicrotask 等不可用；同名局部自定义函数不误报。正则可考虑宿主 Lua 的 string.match/gsub。

包内纯数据白名单只有 prefabs；静态访问直接内联数字，动态键只输出所用的那张表，中文/英文名称提示保留。

```ts
import { CharacterPrefab, CharacterPrefabZh } from 'genshin-ts/definitions/prefabs'

const amber = CharacterPrefab.Amber
const lisa = CharacterPrefabZh.丽莎
function getCharacter(key: keyof typeof CharacterPrefab) {
  return CharacterPrefab[key]
}
```

其他包内 JS/npm 模块不能直接作为 Lua 运行；官方枚举用 lua.Enum。整个 prefabs 命名空间作为值使用时才需要完整数据模块。

console.log/info 是普通日志，warn 有前缀，error 用 printerr，assert 失败只记录，trace 输出栈；throw 或 lua.error 才中断。报错定位见独立的 [Lua 调试](./lua-debug.md)。

## 构建、路径与注入

现有单文件、批量、dev 命令都支持 Lua；以下配置与路径示例使用 compileRoot=src、outDir=dist。

```ts
// gsts.config.ts 的选项
compileRoot: 'src',
entries: ['**/*.ts'],
outDir: 'dist',
lua: { sourceMap: true } // 默认已开；只影响本地映射
```

| 源码/用途               | 本地输出                                                   | 编辑器挂载路径         |
| ----------------------- | ---------------------------------------------------------- | ---------------------- |
| src/lua/hud.ts 入口     | dist/lua/lua/hud.lua                                       | lua/hud                |
| 该入口有顶层运行时代码  | dist/lua/\_\_gsts_shared/lua/hud.lua                       | 不挂载，由入口 require |
| 普通 TS / 原生 Lua 模块 | dist/lua 下对应相对路径                                    | 不挂载                 |
| 框架/标准库             | **gsts_helpers.lua、**gsts_signal_kinds.lua、需要的 lualib | 不挂载                 |
| sourcemap               | Lua 文件旁的 .lua.map                                      | 不复制到游戏           |

`__gsts_shared` 是编译器保留目录，不能作为源码模块目录。无配置的单文件构建默认输出 dist/lua。

注入只是把 .lua 文件复制到地图的 external_lua_file，**不会自动挂载**。首次通过编辑器批量添加整个输出文件夹并手动挂载入口。手动添加时保持相对目录：require 按磁盘文件路径找模块，不认编辑器映射名（已在游戏内确认）；自动注入会保持目录结构。

```text
external_lua_file/
  lua/hud.lua
  lua/board.lua
  __gsts_shared/lua/hud.lua
  __gsts_helpers.lua
  …其余依赖
```

配置 inject.mapId 后，未加 --noinject 就会复制到指定地图；本地 dist 保留。改 Lua 后编辑器重新运行游戏即生效，没有额外刷新脚本步骤。TS 则等 dev 编译/复制完成后再重新运行。注入后输出一行 `[ok] 已注入 Lua：… -> …external_lua_file`，路径就是复制到的位置；CLI 不检查挂载，挂载情况请在编辑器里确认。

### 保护、清单与旧文件清理

只覆盖第一条非空行带 `-- @gsts:lua` 的文件，旧三行文件头同样有效；冲突逐个跳过，其他文件继续写入/清理，日志列出路径与跳过数。手写文件冲突请改名/移动；确认允许覆盖才加标记，skipSafeCheck 不会绕过此保护。

```text
hud.ts → panel.ts
上次构建的清单：lua/hud.lua
这次构建的产物：lua/panel.lua
结果：写 panel.lua；清单拥有且仍带标记的旧 hud.lua 被删除
```

`.gsts-lua-<owner>.json` 记录本项目拥有的输出，避免误删其他文件；失去标记的旧文件保留。临时文件写完再改名是防止写一半中断，与清单的旧文件清理是两件事；整批文件不构成游戏级原子事务。单文件构建不清理其他入口，其他项目仍引用的文件保留。路径逃逸、符号链接/联接与文件名冲突受检查，实际 I/O 失败仍返回失败。

### dev 与混合项目

Lua 用一个持久 worker，和节点图可并行。修改只重编受影响模块及使用者，原生 Lua 和声明改动也监听；声明/配置变化可能全量重建。配置改动后重启 dev。纯节点图不创建 Lua Program/worker，.lua/.d.ts 改动不会触发空轮次。

```sh
gsts dev --noinject --lang zh
# 修改 src/lua/hud.ts → 等编译成功 → 编辑器重新运行地图
```

entries 排除只影响入口发现，被导入的依赖仍编译和监听。dev 可以从空目录发现新入口，前提是文件匹配 entries。节点图/Lua 一侧失败不挡另一侧产出，末尾分别汇总，真实失败仍返回失败状态。失败保留之前产物；普通保存只预检改动输出，想恢复外部改动的全部产物需重新普通构建。

排查耗时用 `GSTS_INJECT_PROFILE=1` 或 --inject-profile，统一输出 [pipeline-profile] 的 lua 字段。注入耗时不包含此前编译/GIA，保存到输出还含防抖，不应直接比较两种范围。

## 测试与已知限制

自动测试在模拟环境（fengari）中运行生成的 Lua，覆盖类型、ESLint、模块状态和输出保护；SDK 检查覆盖 640 个官方 API 和枚举成员。本文写明"已在游戏内确认"的宿主行为都经过实机测试。

暂不支持：从地图文件自动提取控件树、脚本变量和挂载位置。

负载优化（视野检测）会在本地卸载离角色较远的实体；实体不在本地时，部分纯本地的逻辑（如播放特效）可能不会执行。
