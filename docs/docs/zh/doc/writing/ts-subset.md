# 可编译 TS 子集

## 不支持/受限
- Promise / async / await
- 递归
- JSON / Object 原生操作
- 字符串属性/拼接（建议顶层预处理）

## 强约束
- 条件必须是 boolean（必要时用 `bool(...)`）。
- `while(true)` 受循环上限影响，建议用定时器。
- `console.log` 仅支持单一参数。

## 变量语义
- `let` 可强制生成节点图局部变量。
- `const` 可能被优化为直接连线。

项目希望用户尽可能保持原来对 JS/TS 代码的使用直觉和开发手感。因此当涉及到变量声明、
赋值、取用时，编译器会根据情况自动使用千星奇域的“局部变量”功能，以保持代码执行效果
和 JS 直觉一致。多数情况下，这部分由编译器自动完成，用户不需要手动处理。

### 集合变量与实时引用

有一种情况需要特别说明：当通过获取节点图变量、获取自定义变量等方式取得列表类型时，
这个列表会被视为实时引用。也就是说，通过 `f.get(name)`、`gsts.f.get(name)`、
`getNodeGraphVariable(name).asType('*_list')`、`f.getCustomVariable(entity, name).asType('*_list')`
或 `entity.get(name).asType('*_list')` / `entity.getCustomVariable(name).asType('*_list')`
取得的列表，对它的取用和修改都会直接影响原始变量，不会创建数据拷贝：

```ts
const xs = f.get('items')
xs[idx(0n)] = 1n
```

这与直接写 `f.get('items')[0] = 1n` 等价；即使用 `let` 声明，只要变量本身没有被重新赋值，
列表元素修改也仍然写回原始运行时变量。这和 JS 行为更相符，也更容易生成简洁、高性能的节点图。

如果需要一个列表的数据拷贝，并且不希望修改影响原始数据，需要显式调用 `f.copyList()` 或
`f.assemblyList()` 包裹 `f.get()`、`entity.get()`、`entity.getCustomVariable()` 等实时引用。
这样取到的列表数据会通过局部变量节点完成复制：

```ts
const xs = f.copyList(f.get('items'))
xs[0] = 1n
```

```ts
const ys = f.assemblyList(f.get('items'))
ys[0] = 1n
```

临时集合仍使用局部变量语义，例如 `assemblyList([a, b])`、数组字面量或无法证明来源的函数返回值。

> **警告**
>
> 在 v0.1.9 以及之前的版本，通过 `const l = f.get(...)` 取得列表并修改时，修改的是列表的复制。
> 在之后的版本中，这一行为已经修正，因为它被认为是一个 bug。旧行为会导致很多语义上相同的代码
> 产生不一致的结果，并且同样是集合类型，字典修改总是视作引用，而列表却可能被视作值拷贝，
> 这不符合开发直觉。因此后续版本统一修正为列表实时引用；如需复制，请显式使用
> `f.copyList()` 或 `f.assemblyList()`。
