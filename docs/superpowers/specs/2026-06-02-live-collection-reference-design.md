# Live Collection Reference Semantics Design

## Background

The current TS to GS transform promotes every modified collection binding to a LocalVariable. For example:

```ts
const infoList = gsts.f.getNodeGraphVariable(MineVariable.Info).asType('int_list')
infoList[idx(cellCursor)] = 0n
```

currently emits:

```ts
const infoList = gsts.f.initLocalVariable("int_list")
gsts.f.setLocalVariable(
  infoList.localVariable,
  gsts.f.getNodeGraphVariable(MineVariable.Info).asType('int_list')
)
gsts.f.modifyValueInList(infoList.value, idx(cellCursor), 0n)
```

This treats the collection as local state even when the initializer is a live node graph variable reference. That can make an extracted alias behave differently from the inline form:

```ts
gsts.f.modifyValueInList(
  gsts.f.getNodeGraphVariable(MineVariable.Info).asType('int_list'),
  idx(cellCursor),
  0n
)
```

For node graph variables, entity custom variables, and their helper APIs, this is not the desired developer model. Runtime variable data links are evaluated at execution time and represent current graph state. A collection returned by `getNodeGraphVariable`, `f.get`, `f.getCustomVariable`, `entity.get`, or equivalent helper APIs should behave like a live collection reference for collection mutation operations.

## Problem

`buildVarPlan()` currently only distinguishes:

- whether a binding is a collection;
- whether that collection is modified.

It does not distinguish where the collection came from. This causes live references and temporary collections to be treated the same.

Live references:

```ts
const xs = f.get('Info')
xs[idx(0n)] = 1n
```

Temporary collections:

```ts
const xs = f.assemblyList([1n, 2n])
xs[idx(0n)] = 3n
```

These should not have the same lowering. Live references should write through to their source. Temporary collections still need LocalVariable semantics because there is no external mutable source to update.

## Design Goals

1. Extracting a live collection into a `const` binding must not change write semantics.
2. `f.get(name)`, `gsts.f.get(name)`, `getNodeGraphVariable(name).asType('*_list')`, `getNodeGraphVariable(name).asDict(...)`, `f.getCustomVariable(entity, name).asType/asDict(...)`, and `entity.get(name).asType/asDict(...)` should be treated as live collection references.
3. Dictionary aliases and list aliases should behave consistently.
4. Temporary collections should continue to use LocalVariable when they are modified.
5. Unknown collection sources should remain conservative unless the transform can prove they are live references.
6. Timer capture handling must remain conservative, because timer callbacks cross execution-flow boundaries.
7. The implementation should be test-first and narrow enough to avoid changing unrelated scalar const behavior.

## Non-Goals

This change does not attempt to:

- optimize scalar const folding;
- rewrite every collection-producing node as a live reference;
- infer purity or write-through semantics for arbitrary user functions;
- change node graph variable declaration or `setNodeGraphVariable` behavior;
- remove LocalVariable support for temporary mutable values.

## Proposed Semantics

Introduce a collection source classification for local variable declarations inside server contexts:

```ts
type CollectionSourceKind = 'liveRef' | 'temporary' | 'unknown'
```

`liveRef` means the initializer points at a mutable runtime source. Mutating the alias should mutate the source directly.

`temporary` means the initializer creates a standalone collection value. Mutating it requires a LocalVariable if the value must be used across multiple nodes.

`unknown` means the compiler cannot safely prove live reference semantics. Unknown modified collections keep the current LocalVariable behavior.

## Live Reference Sources

The first implementation should recognize these source shapes:

```ts
f.get('Name')
gsts.f.get('Name')
globalThis.gsts.f.get('Name')
f.getNodeGraphVariable('Name').asType('int_list')
gsts.f.getNodeGraphVariable('Name').asType('int_list')
globalThis.gsts.f.getNodeGraphVariable('Name').asType('int_list')
f.getNodeGraphVariable('Name').asDict('str', 'int')
f.getCustomVariable(entity, 'Name').asType('int_list')
gsts.f.getCustomVariable(entity, 'Name').asType('int_list')
entity.get('Name').asType('int_list')
entity.get('Name').asDict('str', 'int')
```

The same should work when the first segment is the configured server callback `f` identifier or `env.gstsIdent`.

Entity helper getter support should be narrow: only `entity.get(...)` whose receiver is typed as an entity value is classified as a live custom variable reference. Ordinary `map.get(...)`, dictionary `.get(...)`, and arbitrary object `.get(...)` calls remain outside this optimization.

## Lowering Rules

### Live list alias

Input:

```ts
const xs = f.get('Info')
xs[idx(i)] = v
```

Output:

```ts
const xs = f.get('Info')
gsts.f.modifyValueInList(xs, idx(i), v)
```

The declaration remains a direct alias. Reads of `xs` stay `xs`, not `xs.value`.

### Live dict alias

Input:

```ts
const d = f.get('InfoDict')
d.set('key', 1n)
```

Output should remain direct:

```ts
const d = f.get('InfoDict')
d.set('key', 1n)
```

No LocalVariable wrapper should be introduced.

### Temporary list alias

Input:

```ts
const xs = f.assemblyList([1n, 2n])
xs[idx(0n)] = 3n
const len = f.getListLength(xs)
```

Output keeps LocalVariable:

```ts
const xs = gsts.f.initLocalVariable("int_list")
gsts.f.setLocalVariable(xs.localVariable, f.assemblyList([1n, 2n]))
gsts.f.modifyValueInList(xs.value, idx(0n), 3n)
const len = f.getListLength(xs.value)
```

### Unknown source

Input:

```ts
const xs = makeList()
xs[idx(0n)] = 1n
```

Output keeps LocalVariable because `makeList()` might return a temporary value.

## Required Internal Model

Extend `VarPlanEntry` from:

```ts
export type VarPlanEntry = {
  needsLocalVar: boolean
  isCollection: boolean
}
```

to:

```ts
export type CollectionSourceKind = 'liveRef' | 'temporary' | 'unknown'

export type VarPlanEntry = {
  needsLocalVar: boolean
  isCollection: boolean
  collectionSourceKind?: CollectionSourceKind
}
```

Then calculate `needsLocalVar` as:

```ts
if (u.isCollection) {
  needsLocalVar = u.modified && u.collectionSourceKind !== 'liveRef'
}
```

The implementation may store `collectionSourceKind` on the usage object after declaration collection.

## Behavioral Risks

The main risk is classifying a temporary value as `liveRef`. That would make the compiler skip LocalVariable and incorrectly treat a standalone collection as externally mutable. The first implementation must be conservative and only recognize explicit node graph variable access patterns.

The second risk is timer capture. A live reference captured into a timer callback may need capture dictionary/writeback semantics rather than direct write-through. The implementation should leave timer capture behavior unchanged.

The third risk is preserving current dict behavior while changing list behavior. This is acceptable because dict aliases already behave like live references through `dict.set`, `delete`, and `clear`. The change brings list aliases closer to that existing model.

## Test Requirements

Add a focused fixture and assertion script covering:

1. `const xs = f.get('l_int'); xs[idx(0n)] = 1n` does not emit `initLocalVariable`.
2. `const xs = f.getNodeGraphVariable('l_int').asType('int_list'); xs[idx(0n)] = 1n` does not emit `initLocalVariable`.
3. Repeated writes to a live list alias still do not emit `initLocalVariable`.
4. Reading after live-list mutation still does not emit `.value`.
5. `const xs = f.assemblyList([1n, 2n]); xs[idx(0n)] = 3n` still emits `initLocalVariable`.
6. `const xs = makeList(); xs[idx(0n)] = 1n` still emits `initLocalVariable`.
7. Existing dict alias mutation output remains unchanged.

The test should assert generated `.gs.ts` text, because this bug is in the TS to GS transform phase.

## Documentation Requirements

Update the writing guide to clarify:

- Node graph variable collection helpers return live collection references.
- Mutating a live collection alias writes through to the graph variable.
- Temporary lists still require local variable semantics when mutated.
- `let` remains the explicit way to force LocalVariable behavior.

## Acceptance Criteria

The change is accepted when:

- live node graph list aliases no longer generate `initLocalVariable`;
- temporary modified lists still generate `initLocalVariable`;
- existing scalar LocalVariable behavior is unchanged;
- dict alias behavior remains consistent;
- `npm run build` passes;
- the new assertion script passes;
- `npm run quicktest` passes or any failure is documented with the exact failing case.
