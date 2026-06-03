# Supported TS Subset

## Not supported or limited
- Promise / async / await
- recursion
- JSON / Object native operations
- string properties/concatenation (precompute at top-level)

## Hard rules
- Conditions must be boolean (use `bool(...)`).
- `while(true)` is capped; use timers instead.
- `console.log` supports a single argument only.

## Variable semantics
- `let` forces a local variable node.
- `const` may be optimized into direct wiring.

The compiler tries to preserve normal JS/TS intuition and development flow. For variable
declarations, assignments, and reads, it automatically uses Miliastra local-variable nodes
when that is needed to keep execution behavior close to JavaScript. In most cases this is
handled by the compiler and users do not need to manage local variables manually.

### Collection Variables And Live References

One important case is collection access. Lists obtained from node graph variables or custom
variables are treated as live references. Lists obtained through `f.get(name)`,
`gsts.f.get(name)`, `getNodeGraphVariable(name).asType('*_list')`,
`f.getCustomVariable(entity, name).asType('*_list')`, `entity.get(name).asType('*_list')`,
or `entity.getCustomVariable(name).asType('*_list')` are read and mutated directly against
the original variable; no data copy is created:

```ts
const xs = f.get('items')
xs[idx(0n)] = 1n
```

This is equivalent to mutating `f.get('items')[0]` directly. `let` does not copy a
live list unless the binding itself is reassigned; element mutation still writes through.
This matches JavaScript reference behavior more closely and produces simpler, faster node
graphs.

Use `f.copyList()` or `f.assemblyList()` around `f.get()`, `entity.get()`,
`entity.getCustomVariable()`, or another live reference when you need an explicit list snapshot
that does not mutate the original data:

```ts
const xs = f.copyList(f.get('items'))
xs[0] = 1n
```

```ts
const ys = f.assemblyList(f.get('items'))
ys[0] = 1n
```

Temporary collections still use local-variable semantics, including `assemblyList([a, b])`,
array literals, and function return values whose source cannot be proven.

> **Warning**
>
> In v0.1.9 and earlier, mutating a list obtained with `const l = f.get(...)` modified a
> copied list. Later versions changed this behavior because it was considered a bug. The old
> behavior made semantically equivalent code produce inconsistent results, and even though
> dictionaries and lists are both collection types, dictionaries were always treated as live
> collection references while lists could be treated as value copies.
> This was surprising for JS/TS users, so lists are now live references by default. Use
> `f.copyList()` or `f.assemblyList()` when a copy is required.
