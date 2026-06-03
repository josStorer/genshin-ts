# Live Collection Reference Semantics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make modified node graph variable collection aliases write through to their live source instead of being converted into LocalVariable wrappers.

**Architecture:** Add a conservative collection source classifier to the TS to GS transform. Only known node graph variable access helpers are classified as live references; temporary and unknown collection sources keep the existing LocalVariable behavior.

**Tech Stack:** TypeScript 5.9, TypeScript compiler API transformers, Node.js scripts, existing `compileTsToGs` test harness.

---

## File Structure

- Modify: `src/compiler/ts_to_gs_transform/types.ts`
  - Add `CollectionSourceKind` and extend `VarPlanEntry`.
- Modify: `src/compiler/ts_to_gs_transform/stmt.ts`
  - Classify collection initializer provenance during `buildVarPlan()`.
  - Skip LocalVariable promotion for modified `liveRef` collections.
- Create: `tests/live_collection_reference_test.ts`
  - Fixture with live list aliases, temporary list aliases, unknown list aliases, and dict alias checks.
- Create: `scripts/assert-live-collection-reference.ts`
  - Compile only the fixture and assert the generated `.gs.ts` output.
- Modify: `package.json`
  - Add `test:live-collection-reference`.
- Modify: `docs/docs/zh/doc/writing/ts-subset.md`
  - Document live collection alias semantics.
- Modify: `docs/docs/en/doc/writing/ts-subset.md`
  - English version of the same note.

## Task 1: Add Failing Fixture And Assertion Script

**Files:**
- Create: `tests/live_collection_reference_test.ts`
- Create: `scripts/assert-live-collection-reference.ts`
- Modify: `package.json`

- [x] **Step 1: Create the fixture**

Create `tests/live_collection_reference_test.ts`:

```ts
import { g } from 'genshin-ts/runtime/core'

enum Vars {
  LiveList = 'LiveList',
  LiveDict = 'LiveDict'
}

function makeTemporaryList(f: typeof gsts.f) {
  return f.assemblyList([1n, 2n], 'int')
}

g.server({
  id: 1073741890,
  variables: {
    [Vars.LiveList]: list('int', [0n, 0n, 0n]),
    [Vars.LiveDict]: dict([{ k: 'a', v: 1n }])
  }
}).on('whenEntityIsCreated', (_evt, f) => {
  const liveViaGet = f.get(Vars.LiveList)
  liveViaGet[idx(0n)] = 10n
  liveViaGet[idx(1n)] = 11n
  f.printString(str(liveViaGet[idx(1n)]))

  const liveViaGetNode = f.getNodeGraphVariable(Vars.LiveList).asType('int_list')
  liveViaGetNode[idx(2n)] = 12n

  const liveDict = f.get(Vars.LiveDict)
  liveDict.set('b', 2n)
  f.printString(str(liveDict.get('b')))

  const temporary = f.assemblyList([1n, 2n], 'int')
  temporary[idx(0n)] = 3n
  f.printString(str(temporary[idx(0n)]))

  const unknown = makeTemporaryList(f)
  unknown[idx(0n)] = 4n
  f.printString(str(unknown[idx(0n)]))
})
```

- [x] **Step 2: Create the assertion script**

Create `scripts/assert-live-collection-reference.ts`:

```ts
import fs from 'node:fs'
import path from 'node:path'

import { compileTsToGs } from '../src/compiler/ts_to_gs_pipeline.js'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'dist-live-collection-reference-assert')
const fixture = './tests/live_collection_reference_test.ts'

function normalize(text: string) {
  return text.replace(/\r\n/g, '\n')
}

function assertIncludes(text: string, needle: string) {
  if (!text.includes(needle)) {
    throw new Error(`Expected generated output to include:\n${needle}\n\nActual:\n${text}`)
  }
}

function assertNotIncludesBefore(text: string, marker: string, needle: string) {
  const markerIndex = text.indexOf(marker)
  if (markerIndex < 0) throw new Error(`Missing marker: ${marker}`)
  const prefix = text.slice(0, markerIndex)
  if (prefix.includes(needle)) {
    throw new Error(`Unexpected "${needle}" before marker "${marker}".\n\nActual:\n${text}`)
  }
}

try {
  fs.rmSync(outDir, { recursive: true, force: true })

  const result = await compileTsToGs({
    cfgDir: repoRoot,
    cfg: {
      compileRoot: '.',
      entries: [fixture],
      outDir
    }
  })

  const outFile = result.outFiles.find((file) =>
    file.endsWith('live_collection_reference_test.gs.ts')
  )
  if (!outFile) throw new Error('Expected live collection reference GS output file to be emitted')

  const text = normalize(fs.readFileSync(outFile, 'utf8'))

  assertIncludes(
    text,
    `const liveViaGet = f.get(Vars.LiveList);\n    gsts.f.modifyValueInList(liveViaGet, idx(0n), 10n);`
  )
  assertIncludes(text, `gsts.f.modifyValueInList(liveViaGet, idx(1n), 11n);`)
  assertIncludes(
    text,
    `f.printString(str(gsts.f.getCorrespondingValueFromList(liveViaGet, idx(1n))));`
  )
  assertIncludes(
    text,
    `const liveViaGetNode = f.getNodeGraphVariable(Vars.LiveList).asType('int_list');\n    gsts.f.modifyValueInList(liveViaGetNode, idx(2n), 12n);`
  )
  assertIncludes(text, `const liveDict = f.get(Vars.LiveDict);`)
  assertIncludes(text, `liveDict.set('b', 2n);`)

  assertNotIncludesBefore(text, `const temporary = gsts.f.initLocalVariable("int_list");`, 'initLocalVariable')
  assertIncludes(text, `const temporary = gsts.f.initLocalVariable("int_list");`)
  assertIncludes(text, `const unknown = gsts.f.initLocalVariable("int_list");`)

  console.log(`[ok] live collection reference output verified: ${outFile}`)
} finally {
  fs.rmSync(outDir, { recursive: true, force: true })
}
```

- [x] **Step 3: Add the package script**

In `package.json`, add the script next to other test scripts:

```json
"test:live-collection-reference": "npm run build && tsx scripts/assert-live-collection-reference.ts"
```

- [x] **Step 4: Run the failing test**

Run:

```powershell
npm run test:live-collection-reference
```

Expected: FAIL. The generated output still contains `initLocalVariable` before the live alias cases or does not contain direct `modifyValueInList(liveViaGet, ...)`.

- [x] **Step 5: Skip committing the failing test per user request**

```powershell
git add package.json scripts/assert-live-collection-reference.ts tests/live_collection_reference_test.ts
git commit -m "test: capture live collection alias semantics"
```

## Task 2: Add Collection Source Metadata To VarPlan

**Files:**
- Modify: `src/compiler/ts_to_gs_transform/types.ts`
- Modify: `src/compiler/ts_to_gs_transform/stmt.ts`

- [x] **Step 1: Extend transform types**

In `src/compiler/ts_to_gs_transform/types.ts`, replace `VarPlanEntry` with:

```ts
export type CollectionSourceKind = 'liveRef' | 'temporary' | 'unknown'

export type VarPlanEntry = {
  /**
   * 变量需要“局部变量语义”（Get/Set Local Variable）以模拟可变状态
   */
  needsLocalVar: boolean
  /**
   * 变量被判定为 collection（list/dict）
   */
  isCollection: boolean
  /**
   * collection initializer provenance. liveRef means mutations should write through
   * to the source instead of being copied into a LocalVariable.
   */
  collectionSourceKind?: CollectionSourceKind
}
```

- [x] **Step 2: Import the new type in stmt.ts**

In `src/compiler/ts_to_gs_transform/stmt.ts`, change the type import to:

```ts
import type { CollectionSourceKind, Env, VarPlan, VarPlanEntry } from './types.js'
```

- [x] **Step 3: Add `collectionSourceKind` to Usage**

Inside `buildVarPlan()`, extend the local `Usage` type:

```ts
type Usage = {
  modified: boolean
  isCollection: boolean
  isBasic: boolean
  hasWrite: boolean
  wroteInExec: boolean
  hasRandomWrite: boolean
  readCount: number
  readInLoop: boolean
  collectionSourceKind?: CollectionSourceKind
}
```

- [x] **Step 4: Keep behavior unchanged while carrying metadata**

In the final `out.set(...)`, initially include the metadata without changing the decision:

```ts
out.set(symbol, {
  needsLocalVar,
  isCollection: u.isCollection,
  collectionSourceKind: u.collectionSourceKind
})
```

- [x] **Step 5: Build**

Run:

```powershell
npm run build
```

Expected: PASS. This task only extends metadata and should not change generated output.

- [x] **Step 6: Skip committing metadata plumbing per user request**

```powershell
git add src/compiler/ts_to_gs_transform/types.ts src/compiler/ts_to_gs_transform/stmt.ts
git commit -m "refactor: track collection source kind in var plan"
```

## Task 3: Classify Node Graph Variable Collection Initializers

**Files:**
- Modify: `src/compiler/ts_to_gs_transform/stmt.ts`

- [x] **Step 1: Add helper predicates inside `buildVarPlan()`**

Add these helpers after `getGstsFCall`:

```ts
const isGstsRoot = (expr: ts.Expression): boolean => {
  if (ts.isIdentifier(expr)) return expr.text === env.gstsIdent || expr.text === 'gsts'
  if (
    ts.isPropertyAccessExpression(expr) &&
    ts.isIdentifier(expr.expression) &&
    expr.expression.text === 'globalThis' &&
    expr.name.text === 'gsts'
  ) {
    return true
  }
  return false
}

const isFObject = (expr: ts.Expression): boolean => {
  if (ts.isIdentifier(expr) && env.fIdent && expr.text === env.fIdent) return true
  if (ts.isPropertyAccessExpression(expr) && expr.name.text === 'f') {
    return isGstsRoot(expr.expression)
  }
  return false
}

const isFMethodCall = (expr: ts.Expression, names: readonly string[]): expr is ts.CallExpression => {
  if (!ts.isCallExpression(expr)) return false
  if (!ts.isPropertyAccessExpression(expr.expression)) return false
  if (!names.includes(expr.expression.name.text)) return false
  return isFObject(expr.expression.expression)
}

const unwrapPlanExpression = (expr: ts.Expression): ts.Expression => {
  let cur = expr
  while (true) {
    if (ts.isParenthesizedExpression(cur)) {
      cur = cur.expression
      continue
    }
    if (ts.isAsExpression(cur)) {
      cur = cur.expression
      continue
    }
    if (ts.isTypeAssertionExpression(cur)) {
      cur = cur.expression
      continue
    }
    if (ts.isSatisfiesExpression(cur)) {
      cur = cur.expression
      continue
    }
    return cur
  }
}
```

- [x] **Step 2: Add source classifier**

Add this helper after `unwrapPlanExpression`:

```ts
const classifyCollectionSource = (expr: ts.Expression | undefined): CollectionSourceKind => {
  if (!expr) return 'unknown'
  const unwrapped = unwrapPlanExpression(expr)

  if (isFMethodCall(unwrapped, ['get'])) return 'liveRef'

  if (ts.isCallExpression(unwrapped) && ts.isPropertyAccessExpression(unwrapped.expression)) {
    const method = unwrapped.expression.name.text
    if (method === 'asType' || method === 'asDict') {
      const base = unwrapPlanExpression(unwrapped.expression.expression)
      if (isFMethodCall(base, ['getNodeGraphVariable', 'get'])) return 'liveRef'
    }
  }

  if (isFMethodCall(unwrapped, ['assemblyList', 'createDictionary', 'assemblyDictionary'])) {
    return 'temporary'
  }
  if (ts.isArrayLiteralExpression(unwrapped) || ts.isObjectLiteralExpression(unwrapped)) {
    return 'temporary'
  }

  return 'unknown'
}
```

- [x] **Step 3: Store classifier result during declaration collection**

In `collectDecls()`, after:

```ts
u.isCollection = isCollectionType(env, t)
```

add:

```ts
if (u.isCollection) {
  u.collectionSourceKind = classifyCollectionSource(d.initializer)
}
```

- [x] **Step 4: Build**

Run:

```powershell
npm run build
```

Expected: PASS. The failing live collection test may still fail until the promotion condition changes.

- [x] **Step 5: Skip committing classifier per user request**

```powershell
git add src/compiler/ts_to_gs_transform/stmt.ts
git commit -m "refactor: classify collection initializer sources"
```

## Task 4: Skip LocalVariable For Live Collection References

**Files:**
- Modify: `src/compiler/ts_to_gs_transform/stmt.ts`

- [x] **Step 1: Change collection promotion condition**

Replace:

```ts
if (u.isCollection) {
  needsLocalVar = u.modified
}
```

with:

```ts
if (u.isCollection) {
  needsLocalVar = u.modified && u.collectionSourceKind !== 'liveRef'
}
```

- [x] **Step 2: Run the focused test**

Run:

```powershell
npm run test:live-collection-reference
```

Expected: PASS. The live aliases should not emit `initLocalVariable`; temporary and unknown aliases should still emit it.

- [x] **Step 3: Inspect generated output manually when the focused test passes**

Run:

```powershell
npm run build
tsx scripts/assert-live-collection-reference.ts
```

Expected: output contains `[ok] live collection reference output verified`.

- [x] **Step 4: Skip committing behavior change per user request**

```powershell
git add src/compiler/ts_to_gs_transform/stmt.ts
git commit -m "fix: preserve live collection reference mutations"
```

## Task 5: Add A Regression Case For `tests/temp_test.ts` Shape

**Files:**
- Modify: `tests/live_collection_reference_test.ts`
- Modify: `scripts/assert-live-collection-reference.ts`

- [x] **Step 1: Add enum-based direct node graph variable case**

Append this to the server handler in `tests/live_collection_reference_test.ts` after `liveViaGetNode`:

```ts
  const enumLive = f.getNodeGraphVariable(Vars.LiveList).asType('int_list')
  enumLive[idx(0n)] = 13n
```

- [x] **Step 2: Add assertion for enum case**

In `scripts/assert-live-collection-reference.ts`, add:

```ts
  assertIncludes(
    text,
    `const enumLive = f.getNodeGraphVariable(Vars.LiveList).asType('int_list');\n    gsts.f.modifyValueInList(enumLive, idx(0n), 13n);`
  )
```

- [x] **Step 3: Run focused test**

Run:

```powershell
npm run test:live-collection-reference
```

Expected: PASS.

- [x] **Step 4: Skip committing regression case per user request**

```powershell
git add tests/live_collection_reference_test.ts scripts/assert-live-collection-reference.ts
git commit -m "test: cover direct node graph list alias mutation"
```

## Task 6: Document Semantics

**Files:**
- Modify: `docs/docs/zh/doc/writing/ts-subset.md`
- Modify: `docs/docs/en/doc/writing/ts-subset.md`

- [x] **Step 1: Update Chinese docs**

Add this section near the existing `let` and `const` local variable notes:

```md
### 集合变量与实时引用

节点图变量集合是实时引用。通过 `f.get(name)`、`gsts.f.get(name)` 或 `getNodeGraphVariable(name).asType('*_list')` 取得的列表，赋给 `const` 后再修改元素，仍会写回同一个节点图变量：

```ts
const xs = f.get('items')
xs[idx(0n)] = 1n
```

这与直接写 `f.get('items')[idx(0n)] = 1n` 等价。临时集合仍使用局部变量语义，例如 `assemblyList()`、数组字面量或无法证明来源的函数返回值。需要强制生成节点图局部变量时，用 `let` 声明。
```

- [x] **Step 2: Update English docs**

Add this section near the existing `let` and `const` local variable notes:

```md
### Collection Variables And Live References

Node graph variable collections are live references. Lists obtained through `f.get(name)`, `gsts.f.get(name)`, or `getNodeGraphVariable(name).asType('*_list')` still write through to the same node graph variable when assigned to a `const` alias and mutated:

```ts
const xs = f.get('items')
xs[idx(0n)] = 1n
```

This is equivalent to mutating `f.get('items')[idx(0n)]` directly. Temporary collections still use local-variable semantics, including `assemblyList()`, array literals, and function return values whose source cannot be proven. Use `let` when you need to force a node graph local variable.
```

- [x] **Step 3: Skip committing docs per user request**

```powershell
git add docs/docs/zh/doc/writing/ts-subset.md docs/docs/en/doc/writing/ts-subset.md
git commit -m "docs: explain live collection reference semantics"
```

## Task 7: Run Full Verification

**Files:**
- No edits expected.

- [x] **Step 1: Run build**

```powershell
npm run build
```

Expected: PASS.

- [x] **Step 2: Run focused test**

```powershell
npm run test:live-collection-reference
```

Expected: PASS with `[ok] live collection reference output verified`.

- [x] **Step 3: Run quicktest and record unrelated generated fixture failure**

```powershell
npm run quicktest
```

Expected: PASS. If it fails, record the exact failing generated file and node mismatch before making any follow-up changes.

- [x] **Step 4: Check git status**

```powershell
git status --short
```

Expected: only intentional committed changes or a clean worktree. Existing unrelated user changes such as `tests/temp_test.ts` should not be reverted.

## Task 8: Entity Custom Variable Live References

**Files:**
- Modify: `tests/live_collection_reference_test.ts`
- Modify: `scripts/assert-live-collection-reference.ts`
- Modify: `src/compiler/ts_to_gs_transform/stmt.ts`
- Modify: `docs/docs/zh/doc/writing/ts-subset.md`
- Modify: `docs/docs/en/doc/writing/ts-subset.md`
- Modify: `docs/superpowers/specs/2026-06-02-live-collection-reference-design.md`

- [x] **Step 1: Add RED cases for custom variable collection aliases**

Add coverage for both `f.getCustomVariable(entity, name).asType('*_list')` and
`entity.get(name).asType('*_list')`.

- [x] **Step 2: Verify existing implementation fails**

The focused test failed because both custom variable aliases emitted `initLocalVariable`.

- [x] **Step 3: Extend live reference classification**

Classify `getCustomVariable(...).asType/asDict(...)` and entity-typed
`entity.get(...).asType/asDict(...)` as `liveRef`.

- [x] **Step 4: Run focused verification**

`npm run test:live-collection-reference` passed.

## Self-Review

- Spec coverage: The plan implements live source classification, preserves temporary/unknown LocalVariable behavior, adds tests for live aliases, temporary aliases, unknown aliases, and documentation.
- Placeholder scan: No task uses unspecified implementation steps; each code change includes concrete snippets.
- Type consistency: `CollectionSourceKind`, `collectionSourceKind`, and `VarPlanEntry` names are consistent across tasks.

## Execution Options

Plan complete and saved to `docs/superpowers/plans/2026-06-02-live-collection-reference-plan.md`. Two execution options:

1. Subagent-Driven (recommended) - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. Inline Execution - execute tasks in this session using executing-plans, batch execution with checkpoints.
