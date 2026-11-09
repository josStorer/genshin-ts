# Supported TS Subset

## Not supported or limited

- Promise / async / await
- recursion
- JSON / Object native operations
- string properties/concatenation (precompute at top-level)
- object/array destructuring declarations and assignments inside node graphs

To read multiple return values, store the result first, then access its properties. Use indices
for list elements. Avoid `const { location, rotate } = ...` and `const [first] = ...`;
`gsts/assignment-restrictions` in the recommended ESLint config reports these forms.
This restriction does not apply to ordinary JS/TS preprocessing code or client Lua scripts.

```ts
const point = f.queryPresetPointPositionRotation(presetPointIndex[index])
f.teleportPlayer(playerList[index], point.location, point.rotate)
```

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

For custom variables, such in-place edits do not trigger On Custom Variable Change; only
`setCustomVariable` does. See [Common Patterns](./patterns.md#custom-variables).

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

### List Iteration And Evaluation Timing

`for...of` and list iteration methods such as `forEach()` save the result of an inline list
expression before iterating. For example, destroying entities returned by a tag query does
not rerun the query and skip other entities:

```ts
for (const target of f.getEntityListByUnitTag(1073741825n)) {
  f.destroyEntity(target)
}
```

When you declare `const targets = f.getEntityListByUnitTag(...)` before iterating, the query
result is saved at the declaration. Array literals are also saved at their declarations;
changing a variable used to initialize the array does not rebuild it. An iterated list and
simple aliases whose bindings are not reassigned, such as `const alias = targets`, share the
same list. Existing local-variable storage is reused, so element updates during iteration
still affect that list.

Named live references, such as `const items = f.get('items')`, still read and modify the
original variable. Writing `for (const item of f.get('items'))` directly instead saves a
snapshot at loop entry. Declare a live reference first when iteration should observe
element updates to the original list.

Do not reassign the iteration source variable to another list during iteration; assign
after the loop instead. The recommended ESLint configuration warns about directly detectable
reassignments through `gsts/no-iteration-source-reassignment`. Element assignments and
`push()` / `pop()` are allowed. The native `f.listIterationLoop()` API retains the node's
behavior; use `f.initLocalVariable('entity_list', expression).value` explicitly when its input
needs a snapshot.
