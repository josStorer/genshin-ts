import ts from 'typescript'

import { t } from '../../i18n/index.js'
import type { DictValueType } from '../../runtime/value.js'
import { inferConcreteTypeFromType, inferListTypeFromType } from '../../shared/ts_list_utils.js'
import { isEntityLikeType } from '../../shared/ts_type_utils.js'
import { tryTransformBuiltinCall, tryTransformBuiltinPropertyAccess } from './builtins.js'
import { fail, warn } from './errors.js'
import { tryTransformListMethodCall } from './list_methods.js'
import {
  inferArrayListType,
  inferConcreteTypeFromString,
  inferListTypeFromTypeString,
  makeEmptyListExpr,
  type ListType
} from './lists.js'
import {
  getBinaryOpInfo,
  getCompoundAssignmentMethod,
  isAssignmentLikeOperator,
  isSupportedSimpleAssignmentOperator,
  isUnsupportedBinaryOperator
} from './ops.js'
import { transformHandler } from './stmt.js'
import type { Env, TimerCaptureInfo, TimerHandleMeta } from './types.js'
import { makeFCall, withSameRange } from './utils.js'

type NumericKind = 'float' | 'int' | 'mixed' | 'unknown'
type LocalVarType = ListType | `${ListType}_list`
type EnumTypeInfo = {
  isEnum: boolean
  name: string | null
}
type TimerKind = 'timeout' | 'interval'
type TimerCaptureDictMeta = { name: string; valueType: DictValueType }
type TimerCaptureSpec = {
  name: string
  valueType: DictValueType
  dictVarName: string
  valueExpr: ts.Expression
  timerDicts?: TimerCaptureDictMeta[]
}

function inferLocalVarTypeFromTypeString(s: string): LocalVarType | null {
  const listType = inferListTypeFromTypeString(s)
  if (listType) return `${listType}_list`
  const base = inferConcreteTypeFromString(s)
  if (base) return base
  return null
}

function inferLocalVarTypeFromType(env: Env, t: ts.Type): LocalVarType | null {
  const aliasName = t.aliasSymbol?.getName()
  if (aliasName) {
    const aliased = inferLocalVarTypeFromTypeString(aliasName)
    if (aliased) return aliased
  }

  if (t.flags & ts.TypeFlags.Union) {
    const u = t as ts.UnionType
    let base: LocalVarType | null = null
    for (const tt of u.types) {
      const next = inferLocalVarTypeFromType(env, tt)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }
  if (t.flags & ts.TypeFlags.Intersection) {
    const it = t as ts.IntersectionType
    let base: LocalVarType | null = null
    for (const tt of it.types) {
      const next = inferLocalVarTypeFromType(env, tt)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }

  if ((t.flags & ts.TypeFlags.BigIntLike) !== 0) return 'int'
  if ((t.flags & ts.TypeFlags.NumberLike) !== 0) return 'float'
  if ((t.flags & ts.TypeFlags.BooleanLike) !== 0) return 'bool'
  if ((t.flags & ts.TypeFlags.StringLike) !== 0) return 'str'

  const listType = inferListTypeFromType(env.checker, t, env.file)
  if (listType) return `${listType}_list`
  const base = inferConcreteTypeFromType(env.checker, t, env.file)
  if (base) return base
  return null
}

function inferLocalVarTypeFromExpression(env: Env, expr: ts.Expression): LocalVarType | null {
  const t = env.checker.getTypeAtLocation(expr)
  return inferLocalVarTypeFromType(env, t)
}

function inferConditionalResultType(env: Env, expr: ts.ConditionalExpression): LocalVarType {
  const trueType = inferLocalVarTypeFromExpression(env, expr.whenTrue)
  if (!trueType) {
    const raw = env.checker.typeToString(env.checker.getTypeAtLocation(expr.whenTrue))
    fail(env, expr.whenTrue, `cannot infer ternary true-branch type (${raw})`)
  }
  const falseType = inferLocalVarTypeFromExpression(env, expr.whenFalse)
  if (!falseType) {
    const raw = env.checker.typeToString(env.checker.getTypeAtLocation(expr.whenFalse))
    fail(env, expr.whenFalse, `cannot infer ternary false-branch type (${raw})`)
  }
  if (trueType !== falseType) {
    const left = env.checker.typeToString(env.checker.getTypeAtLocation(expr.whenTrue))
    const right = env.checker.typeToString(env.checker.getTypeAtLocation(expr.whenFalse))
    fail(env, expr, `ternary branches must have the same type (${left} vs ${right})`)
  }
  return trueType
}

function getNumericKind(env: Env, t: ts.Type): NumericKind {
  const mergeKinds = (a: NumericKind, b: NumericKind): NumericKind => {
    if (a === 'unknown') return b
    if (b === 'unknown') return a
    if (a === b) return a
    return 'mixed'
  }

  if (t.flags & ts.TypeFlags.Union) {
    const u = t as ts.UnionType
    let kind: NumericKind = 'unknown'
    for (const tt of u.types) {
      kind = mergeKinds(kind, getNumericKind(env, tt))
      if (kind === 'mixed') return 'mixed'
    }
    return kind
  }
  if (t.flags & ts.TypeFlags.Intersection) {
    const it = t as ts.IntersectionType
    let kind: NumericKind = 'unknown'
    for (const tt of it.types) {
      kind = mergeKinds(kind, getNumericKind(env, tt))
      if (kind === 'mixed') return 'mixed'
    }
    return kind
  }

  if ((t.flags & ts.TypeFlags.BigIntLike) !== 0) return 'int'
  if ((t.flags & ts.TypeFlags.NumberLike) !== 0) return 'float'

  const s = env.checker.typeToString(t)
  if (s === 'IntValue') return 'int'
  if (s === 'FloatValue') return 'float'

  const base = inferConcreteTypeFromString(s)
  if (base === 'int') return 'int'
  if (base === 'float') return 'float'
  return 'unknown'
}

function isEnumClassType(env: Env, t: ts.Type): boolean {
  const seen = new Set<ts.Type>()
  const visit = (cur: ts.Type): boolean => {
    if (seen.has(cur)) return false
    seen.add(cur)
    const sym = cur.getSymbol()
    if (sym?.getName() === 'enumeration') return true

    if ((cur.flags & ts.TypeFlags.Object) === 0) return false
    const obj = cur as ts.ObjectType
    if ((obj.objectFlags & ts.ObjectFlags.ClassOrInterface) === 0) return false

    const bases = env.checker.getBaseTypes(obj as ts.InterfaceType)
    return bases?.some(visit) ?? false
  }
  return visit(t)
}

function getEnumTypeInfo(env: Env, t: ts.Type): EnumTypeInfo {
  if (t.flags & ts.TypeFlags.TypeParameter) {
    const constraint = env.checker.getBaseConstraintOfType(t)
    if (!constraint) return { isEnum: false, name: null }
    return getEnumTypeInfo(env, constraint)
  }

  if (t.flags & ts.TypeFlags.Union) {
    const u = t as ts.UnionType
    let name: string | null = null
    for (const tt of u.types) {
      const info = getEnumTypeInfo(env, tt)
      if (!info.isEnum) return { isEnum: false, name: null }
      if (info.name) {
        if (!name) name = info.name
        else if (name !== info.name) name = null
      }
    }
    return { isEnum: u.types.length > 0, name }
  }

  if (t.flags & ts.TypeFlags.Intersection) {
    const it = t as ts.IntersectionType
    let name: string | null = null
    for (const tt of it.types) {
      const info = getEnumTypeInfo(env, tt)
      if (!info.isEnum) return { isEnum: false, name: null }
      if (info.name) {
        if (!name) name = info.name
        else if (name !== info.name) name = null
      }
    }
    return { isEnum: it.types.length > 0, name }
  }

  if (!isEnumClassType(env, t)) return { isEnum: false, name: null }
  const sym = t.getSymbol() ?? t.aliasSymbol
  const name = sym?.getName() ?? null
  return { isEnum: true, name: name === 'enumeration' ? null : name }
}

function isLoopIndexIdentifier(env: Env, expr: ts.Expression): expr is ts.Identifier {
  if (!ts.isIdentifier(expr)) return false
  const sym = env.checker.getSymbolAtLocation(expr)
  if (!sym) return false
  return env.loopIndexSymbols?.has(sym) ?? false
}

function wrapWithFloat(expr: ts.Expression): ts.Expression {
  return ts.factory.createCallExpression(ts.factory.createIdentifier('float'), undefined, [expr])
}

function shouldWrapLoopIndexByContext(env: Env, id: ts.Identifier): boolean {
  if (!isLoopIndexIdentifier(env, id)) return false
  const parent = id.parent
  if (parent && ts.isCallExpression(parent)) {
    if (ts.isIdentifier(parent.expression) && parent.expression.text === 'float') return false
  }
  if (parent && ts.isBinaryExpression(parent)) {
    const op = parent.operatorToken.kind
    if (
      op === ts.SyntaxKind.PlusToken ||
      op === ts.SyntaxKind.MinusToken ||
      op === ts.SyntaxKind.AsteriskToken ||
      op === ts.SyntaxKind.SlashToken ||
      op === ts.SyntaxKind.PercentToken ||
      op === ts.SyntaxKind.LessThanToken ||
      op === ts.SyntaxKind.LessThanEqualsToken ||
      op === ts.SyntaxKind.GreaterThanToken ||
      op === ts.SyntaxKind.GreaterThanEqualsToken
    ) {
      return false
    }
  }
  const ctxType = env.checker.getContextualType(id)
  if (!ctxType) return false
  return getNumericKind(env, ctxType) === 'float'
}

function isRawWrapperCall(expr: ts.CallExpression): boolean {
  const callee = expr.expression
  return ts.isIdentifier(callee) && callee.text === 'raw'
}

function isListWrapperCall(expr: ts.CallExpression): boolean {
  const callee = expr.expression
  return ts.isIdentifier(callee) && callee.text === 'list'
}

function isAssemblyListFCall(env: Env, expr: ts.CallExpression): boolean {
  const callee = expr.expression
  if (!ts.isPropertyAccessExpression(callee)) return false
  if (callee.name.text !== 'assemblyList') return false
  const left = callee.expression

  // shape 1: gsts.f.assemblyList(...) / __gsts.f.assemblyList(...) / globalThis.gsts.f.assemblyList(...)
  if (ts.isPropertyAccessExpression(left) && left.name.text === 'f') {
    const root = left.expression
    if (ts.isIdentifier(root) && (root.text === env.gstsIdent || root.text === 'gsts')) return true
    if (
      ts.isPropertyAccessExpression(root) &&
      ts.isIdentifier(root.expression) &&
      root.expression.text === 'globalThis' &&
      root.name.text === 'gsts'
    ) {
      return true
    }
  }

  // shape 2: f.assemblyList(...) (handler 2nd param)
  if (ts.isIdentifier(left) && env.fIdent && left.text === env.fIdent) {
    return true
  }

  return false
}

function isMultipleBranchesFCall(env: Env, expr: ts.CallExpression): boolean {
  const callee = expr.expression
  if (!ts.isPropertyAccessExpression(callee)) return false
  if (callee.name.text !== 'multipleBranches') return false
  const left = callee.expression

  // shape 1: gsts.f.multipleBranches(...) / __gsts.f.multipleBranches(...) / globalThis.gsts.f.multipleBranches(...)
  if (ts.isPropertyAccessExpression(left) && left.name.text === 'f') {
    const root = left.expression
    if (ts.isIdentifier(root) && (root.text === env.gstsIdent || root.text === 'gsts')) return true
    if (
      ts.isPropertyAccessExpression(root) &&
      ts.isIdentifier(root.expression) &&
      root.expression.text === 'globalThis' &&
      root.name.text === 'gsts'
    ) {
      return true
    }
  }

  // shape 2: f.multipleBranches(...) (handler 2nd param)
  if (ts.isIdentifier(left) && env.fIdent && left.text === env.fIdent) {
    return true
  }

  return false
}

function tryMapArrayLiteralThroughWrappers(
  input: ts.Expression,
  mapper: (arr: ts.ArrayLiteralExpression) => ts.Expression | null
): ts.Expression | null {
  if (ts.isArrayLiteralExpression(input)) return mapper(input)

  if (ts.isParenthesizedExpression(input)) {
    const inner = tryMapArrayLiteralThroughWrappers(input.expression, mapper)
    if (!inner) return null
    return ts.factory.updateParenthesizedExpression(input, inner)
  }

  if (ts.isAsExpression(input)) {
    const inner = tryMapArrayLiteralThroughWrappers(input.expression, mapper)
    if (!inner) return null
    return ts.factory.updateAsExpression(input, inner, input.type)
  }

  if (ts.isTypeAssertionExpression(input)) {
    const inner = tryMapArrayLiteralThroughWrappers(input.expression, mapper)
    if (!inner) return null
    return ts.factory.updateTypeAssertion(input, input.type, inner)
  }

  return null
}

function tryTransformWrappedArrayLiteral(
  env: Env,
  context: ts.TransformationContext,
  expr: ts.Expression
): ts.Expression | null {
  return tryMapArrayLiteralThroughWrappers(expr, (arr) => {
    const elements = arr.elements
    if (elements.length === 0) {
      return makeEmptyListExpr(env, arr)
    }

    const hasSpread = elements.some((e) => ts.isSpreadElement(e))
    if (!hasSpread) {
      const mapped = elements.map((e) => transformExpression(env, context, e))
      // vec3 literal: keep as `[x,y,z]` to preserve Vec3Value semantics
      if (shouldKeepArrayLiteralAsVec3(env, arr)) {
        return ts.factory.createArrayLiteralExpression(mapped, false)
      }
      // 只要出现对象字面量，就不包裹 assemblyList（避免误把“对象数组/字典数据”当作可拼装的 value 列表）。
      if (mapped.some((e) => ts.isObjectLiteralExpression(e))) {
        return ts.factory.createArrayLiteralExpression(mapped, false)
      }
      return makeFCall(env, 'assemblyList', [
        ts.factory.createArrayLiteralExpression(mapped, false)
      ])
    }

    // spread 版本：用 concatenateList 拼装
    const tmp = `__gsts_list_tmp`
    const tmpId = ts.factory.createIdentifier(tmp)

    const stmts: ts.Statement[] = []
    const listType = inferSpreadArrayListType(env, arr)
    const initialListExpr = makeFCall(env, 'emptyList', [ts.factory.createStringLiteral(listType)])

    stmts.push(
      ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
          [ts.factory.createVariableDeclaration(tmpId, undefined, undefined, initialListExpr)],
          ts.NodeFlags.Const
        )
      )
    )

    const flush = (buf: ts.Expression[]) => {
      if (buf.length === 0) return
      const assembled = makeFCall(env, 'assemblyList', [
        ts.factory.createArrayLiteralExpression(
          buf.map((e) => transformExpression(env, context, e)),
          false
        )
      ])
      stmts.push(
        ts.factory.createExpressionStatement(makeFCall(env, 'concatenateList', [tmpId, assembled]))
      )
    }

    const buf: ts.Expression[] = []
    for (const el of elements) {
      if (ts.isSpreadElement(el)) {
        flush(buf.splice(0, buf.length))
        stmts.push(
          ts.factory.createExpressionStatement(
            makeFCall(env, 'concatenateList', [
              tmpId,
              transformExpression(env, context, el.expression)
            ])
          )
        )
        continue
      }
      buf.push(el)
    }
    flush(buf)

    stmts.push(ts.factory.createReturnStatement(tmpId))
    return ts.factory.createCallExpression(
      ts.factory.createParenthesizedExpression(
        ts.factory.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          ts.factory.createBlock(stmts, true)
        )
      ),
      undefined,
      []
    )
  })
}

function inferSpreadArrayListType(env: Env, node: ts.ArrayLiteralExpression): ListType {
  try {
    return inferArrayListType(env, node)
  } catch {
    // ignore, fallback below
  }

  // 尝试从 spread 表达式的 list 类型推断
  for (const el of node.elements) {
    if (!ts.isSpreadElement(el)) continue
    const t = env.checker.getTypeAtLocation(el.expression)
    const inferred = inferListTypeFromType(env.checker, t, env.file)
    if (inferred) return inferred
  }

  // 尝试从非 spread 元素的值类型推断
  for (const el of node.elements) {
    if (ts.isSpreadElement(el)) continue
    const t = env.checker.getTypeAtLocation(el)

    if (env.checker.isTupleType(t)) {
      const tuple = t as ts.TupleType
      const elements = env.checker.getTypeArguments(tuple)
      if (
        elements.length === 3 &&
        elements.every((e) => (e.flags & ts.TypeFlags.NumberLike) !== 0)
      ) {
        return 'vec3'
      }
    }

    if ((t.flags & ts.TypeFlags.BigIntLike) !== 0) return 'int'
    if ((t.flags & ts.TypeFlags.NumberLike) !== 0) return 'float'
    if ((t.flags & ts.TypeFlags.BooleanLike) !== 0) return 'bool'
    if ((t.flags & ts.TypeFlags.StringLike) !== 0) return 'str'

    const inferred = inferConcreteTypeFromType(env.checker, t, env.file)
    if (inferred) return inferred
  }

  fail(env, node, 'cannot infer list type for spread array, please add type annotation')
}

function isVec3TupleType(env: Env, t: ts.Type): boolean {
  if (!env.checker.isTupleType(t)) return false
  const tuple = t as ts.TupleType
  const elements = env.checker.getTypeArguments(tuple)
  return elements.length === 3 && elements.every((e) => (e.flags & ts.TypeFlags.NumberLike) !== 0)
}

function isVec3ContextType(env: Env, t: ts.Type): boolean {
  if (isVec3TupleType(env, t)) return true
  const s = env.checker.typeToString(t)
  // common forms:
  // - Vec3Value
  // - vec3
  // - [number, number, number]
  // - vec3 | [number, number, number]
  if (s === 'vec3' || s === 'Vec3Value') return true
  if (/^\[\s*number\s*,\s*number\s*,\s*number\s*\]$/.test(s)) return true
  if (s.includes('|') && (s.includes('vec3') || s.includes('[number, number, number]'))) {
    return true
  }
  return false
}

function shouldKeepArrayLiteralAsVec3(env: Env, node: ts.ArrayLiteralExpression): boolean {
  // Only treat "non-spread, length=3" arrays as vec3 candidates
  if (node.elements.length !== 3) return false
  if (node.elements.some((e) => ts.isSpreadElement(e))) return false

  const ct = env.checker.getContextualType(node)
  if (!ct) return false

  if ((ct.flags & ts.TypeFlags.Union) !== 0) {
    const ut = ct as ts.UnionType
    return ut.types.some((t) => isVec3ContextType(env, t))
  }
  return isVec3ContextType(env, ct)
}

function hasNestedAssignment(node: ts.Node): boolean {
  if (ts.isBinaryExpression(node)) {
    if (isAssignmentLikeOperator(node.operatorToken.kind)) return true
  }

  if (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
    const op = node.operator
    if (op === ts.SyntaxKind.PlusPlusToken || op === ts.SyntaxKind.MinusMinusToken) return true
  }

  let found = false
  ts.forEachChild(node, (c) => {
    if (found) return
    if (hasNestedAssignment(c)) found = true
  })
  return found
}

function getTimerKind(expr: ts.CallExpression): TimerKind | null {
  const callee = expr.expression
  if (ts.isIdentifier(callee)) {
    if (callee.text === 'setTimeout') return 'timeout'
    if (callee.text === 'setInterval') return 'interval'
  }
  if (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'globalThis'
  ) {
    if (callee.name.text === 'setTimeout') return 'timeout'
    if (callee.name.text === 'setInterval') return 'interval'
  }
  return null
}

function getParamName(param: ts.ParameterDeclaration | undefined): string | null {
  if (!param) return null
  return ts.isIdentifier(param.name) ? param.name.text : null
}

function resolveTimerParamNames(
  env: Env,
  fn: ts.ArrowFunction | ts.FunctionExpression
): { evtName: string; fName: string } {
  if (!env.serverCtx) {
    fail(
      env,
      fn,
      'setTimeout/setInterval is only supported inside g.server().on/onSignal handler or gstsServer function'
    )
  }
  if (fn.parameters.length > 2) {
    fail(env, fn, 'setTimeout/setInterval callback supports at most 2 parameters (evt, f)')
  }
  const p0 = fn.parameters[0]
  const p1 = fn.parameters[1]
  if (p0 && !ts.isIdentifier(p0.name)) {
    fail(env, p0, 'setTimeout/setInterval callback parameter must be an identifier')
  }
  if (p1 && !ts.isIdentifier(p1.name)) {
    fail(env, p1, 'setTimeout/setInterval callback parameter must be an identifier')
  }

  const defaultEvt = env.evtIdent ?? 'evt'
  const defaultF = env.fIdent ?? 'f'

  let evtName = getParamName(p0) ?? defaultEvt
  let fName = getParamName(p1) ?? defaultF

  if (!p1 && p0 && getParamName(p0) === defaultF) {
    evtName = defaultEvt
    fName = defaultF
  }

  if (evtName === fName) {
    fail(env, fn, 'setTimeout/setInterval callback parameter names must be different')
  }

  return { evtName, fName }
}

function getCommentTargetNode(node: ts.Node): ts.Node {
  if (ts.isExpressionStatement(node.parent)) return node.parent
  if (ts.isVariableDeclaration(node.parent)) {
    const list = node.parent.parent
    if (ts.isVariableDeclarationList(list) && ts.isVariableStatement(list.parent)) {
      return list.parent
    }
  }
  return node
}

function readTimerPoolOverride(env: Env, node: ts.Node): number | null {
  const target = getCommentTargetNode(node)
  const text = env.file.getFullText()
  const ranges = [
    ...(ts.getLeadingCommentRanges(text, target.getFullStart()) ?? []),
    ...(ts.getTrailingCommentRanges(text, target.getEnd()) ?? [])
  ]
  for (const r of ranges) {
    const comment = text.slice(r.pos, r.end)
    const match = /@gsts:timerPool\s*=\s*(\d+)/i.exec(comment)
    if (!match) continue
    const parsed = Number(match[1])
    if (!Number.isInteger(parsed) || parsed < 1) {
      fail(env, target, 'timerPool override must be a positive integer')
    }
    return parsed
  }
  return null
}

function isInLoop(node: ts.Node): boolean {
  let cur: ts.Node | undefined = node.parent
  while (cur) {
    if (
      ts.isForStatement(cur) ||
      ts.isForOfStatement(cur) ||
      ts.isForInStatement(cur) ||
      ts.isWhileStatement(cur) ||
      ts.isDoStatement(cur)
    ) {
      return true
    }
    if (ts.isFunctionLike(cur)) return false
    cur = cur.parent
  }
  return false
}

function resolveTimerPoolSize(env: Env, node: ts.Node, kind: TimerKind): number {
  const override = readTimerPoolOverride(env, node)
  if (override !== null) return override

  const configured =
    kind === 'timeout'
      ? env.config.options?.optimize?.timerPool?.setTimeout
      : env.config.options?.optimize?.timerPool?.setInterval
  const fallback = kind === 'timeout' ? 5 : 1
  let size = configured ?? fallback

  if (
    (env.eventName === 'whenEntityIsCreated' || env.eventName === '实体创建时') &&
    !isInLoop(node) &&
    configured === undefined
  ) {
    size = 1
  }

  if (!Number.isInteger(size) || size < 1) {
    fail(env, node, 'timerPool size must be a positive integer')
  }
  return size
}

function inferDictValueTypeFromType(env: Env, t: ts.Type): DictValueType | null {
  if (t.flags & ts.TypeFlags.Any) return null
  if (t.flags & ts.TypeFlags.Unknown) return null
  if (isEntityLikeType(env.checker, t, env.file)) return 'entity'

  if (t.flags & ts.TypeFlags.Union) {
    const u = t as ts.UnionType
    let base: DictValueType | null = null
    for (const tt of u.types) {
      const next = inferDictValueTypeFromType(env, tt)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }
  if (t.flags & ts.TypeFlags.Intersection) {
    const it = t as ts.IntersectionType
    let base: DictValueType | null = null
    for (const tt of it.types) {
      const next = inferDictValueTypeFromType(env, tt)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }

  if ((t.flags & ts.TypeFlags.BigIntLike) !== 0) return 'int'
  if ((t.flags & ts.TypeFlags.NumberLike) !== 0) return 'float'
  if ((t.flags & ts.TypeFlags.BooleanLike) !== 0) return 'bool'
  if ((t.flags & ts.TypeFlags.StringLike) !== 0) return 'str'

  const s = env.checker.typeToString(t)
  if (s === 'Timeout' || s === 'NodeJS.Timeout') return 'str'
  if (/\b(dict|ReadonlyDict|generic)\b/.test(s)) return null
  const listType = inferListTypeFromType(env.checker, t, env.file) ?? inferListTypeFromTypeString(s)
  if (listType) return `${listType}_list`
  const scalar =
    inferConcreteTypeFromType(env.checker, t, env.file) ?? inferConcreteTypeFromString(s)
  if (scalar) return scalar
  return null
}

export function isDeclarationName(id: ts.Identifier): boolean {
  const parent = id.parent
  if (!parent) return false
  if (ts.isVariableDeclaration(parent) && parent.name === id) return true
  if (ts.isParameter(parent) && parent.name === id) return true
  if (ts.isFunctionDeclaration(parent) && parent.name === id) return true
  if (ts.isClassDeclaration(parent) && parent.name === id) return true
  if (ts.isInterfaceDeclaration(parent) && parent.name === id) return true
  if (ts.isTypeAliasDeclaration(parent) && parent.name === id) return true
  if (ts.isEnumDeclaration(parent) && parent.name === id) return true
  if (ts.isEnumMember(parent) && parent.name === id) return true
  if (ts.isModuleDeclaration(parent) && parent.name === id) return true
  if (ts.isImportClause(parent) && parent.name === id) return true
  if (ts.isNamespaceImport(parent) && parent.name === id) return true
  if (ts.isImportSpecifier(parent) && parent.name === id) return true
  if (ts.isExportSpecifier(parent) && parent.name === id) return true
  if (ts.isBindingElement(parent) && parent.name === id) return true
  return false
}

function shouldCaptureIdentifier(id: ts.Identifier): boolean {
  if (isDeclarationName(id)) return false
  const parent = id.parent
  if (!parent) return true
  if (ts.isTypeNode(parent)) return false
  if (ts.isPropertyAccessExpression(parent) && parent.name === id) return false
  if (ts.isPropertyAssignment(parent) && parent.name === id) return false
  if (ts.isMethodDeclaration(parent) && parent.name === id) return false
  if (ts.isMethodSignature(parent) && parent.name === id) return false
  if (ts.isPropertySignature(parent) && parent.name === id) return false
  if (ts.isPropertyDeclaration(parent) && parent.name === id) return false
  return true
}

function isSymbolDeclaredInFunction(sym: ts.Symbol, fn: ts.FunctionLikeDeclaration): boolean {
  const decls = sym.declarations ?? []
  return decls.some((d) => {
    let cur: ts.Node | undefined = d
    while (cur) {
      if (cur === fn) return true
      cur = cur.parent
    }
    return false
  })
}

function isSymbolDeclaredAtTopLevel(sym: ts.Symbol, file: ts.SourceFile): boolean {
  const decls = sym.declarations ?? []
  return decls.some((d) => {
    let cur: ts.Node | undefined = d
    while (cur) {
      if (ts.isFunctionLike(cur)) return false
      if (cur === file) return true
      cur = cur.parent
    }
    return false
  })
}

function isSymbolFromDeclarationFile(sym: ts.Symbol): boolean {
  const decls = sym.declarations ?? []
  if (!decls.length) return false
  return decls.every((d) => d.getSourceFile().isDeclarationFile)
}

function isCallableType(env: Env, t: ts.Type): boolean {
  if (t.flags & ts.TypeFlags.TypeParameter) {
    const constraint = env.checker.getBaseConstraintOfType(t)
    if (constraint) return isCallableType(env, constraint)
  }
  if (t.getCallSignatures().length > 0 || t.getConstructSignatures().length > 0) return true
  if (t.flags & ts.TypeFlags.Union) {
    const u = t as ts.UnionType
    return u.types.some((tt) => isCallableType(env, tt))
  }
  if (t.flags & ts.TypeFlags.Intersection) {
    const it = t as ts.IntersectionType
    return it.types.some((tt) => isCallableType(env, tt))
  }
  return false
}

function collectTimerCaptures(
  env: Env,
  fn: ts.ArrowFunction | ts.FunctionExpression,
  excludedNames: Set<string>
): {
  name: string
  valueType: DictValueType
  id: ts.Identifier
  timerDicts?: TimerCaptureDictMeta[]
}[] {
  const out: {
    name: string
    valueType: DictValueType
    id: ts.Identifier
    timerDicts?: TimerCaptureDictMeta[]
  }[] = []
  const seen = new Set<ts.Symbol>()

  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node)) {
      if (!shouldCaptureIdentifier(node)) return
      const name = node.text
      if (excludedNames.has(name)) return
      const sym = env.checker.getSymbolAtLocation(node)
      if (!sym) return
      if (seen.has(sym)) return
      if (env.timerHandleSymbol && sym === env.timerHandleSymbol) return
      if (isSymbolDeclaredInFunction(sym, fn)) return
      if (isSymbolDeclaredAtTopLevel(sym, env.file)) return
      if (isSymbolFromDeclarationFile(sym)) return
      const t = env.checker.getTypeAtLocation(node)
      if (isCallableType(env, t)) return
      const valueType = env.loopIndexSymbols?.has(sym) ? 'int' : inferDictValueTypeFromType(env, t)
      if (!valueType) {
        const raw = env.checker.typeToString(t)
        fail(env, node, `unsupported timer capture type for "${name}": ${raw}`)
      }
      const timerDicts = env.timerHandleMeta?.get(sym)?.dicts
      seen.add(sym)
      out.push({ name, valueType, id: node, timerDicts })
      return
    }
    ts.forEachChild(node, visit)
  }

  if (ts.isBlock(fn.body)) {
    fn.body.statements.forEach((s) => visit(s))
  } else {
    visit(fn.body)
  }

  return out
}

export function extractTimerHandleMeta(expr: ts.Expression): TimerCaptureDictMeta[] | null {
  if (!ts.isCallExpression(expr)) return null
  const callee = expr.expression
  if (ts.isIdentifier(callee)) {
    if (callee.text !== 'setTimeout' && callee.text !== 'setInterval') return null
  } else if (ts.isPropertyAccessExpression(callee)) {
    const name = callee.name.text
    if (name !== 'setTimeout' && name !== 'setInterval') return null
  } else {
    return null
  }
  if (expr.arguments.length < 3) return null
  const opts = expr.arguments[2]
  if (!ts.isObjectLiteralExpression(opts)) return null
  const getPropName = (p: ts.ObjectLiteralElementLike): string | null => {
    if (!ts.isPropertyAssignment(p)) return null
    if (ts.isIdentifier(p.name)) return p.name.text
    if (ts.isStringLiteral(p.name)) return p.name.text
    if (ts.isNoSubstitutionTemplateLiteral(p.name)) return p.name.text
    return null
  }
  let hasMarker = false
  let capturesProp: ts.Expression | null = null
  for (const p of opts.properties) {
    const key = getPropName(p)
    if (!key) continue
    if (key === '__gstsTimer' && ts.isPropertyAssignment(p)) {
      if (p.initializer.kind === ts.SyntaxKind.TrueKeyword) hasMarker = true
    }
    if (key === 'captures' && ts.isPropertyAssignment(p)) {
      capturesProp = p.initializer
    }
  }
  if (!hasMarker || !capturesProp || !ts.isArrayLiteralExpression(capturesProp)) return null
  const dicts: TimerCaptureDictMeta[] = []
  for (const el of capturesProp.elements) {
    if (!ts.isObjectLiteralExpression(el)) return null
    let name: string | null = null
    let valueType: string | null = null
    for (const prop of el.properties) {
      const key = getPropName(prop)
      if (!key || !ts.isPropertyAssignment(prop)) continue
      if (key === 'dictVar') {
        if (ts.isStringLiteral(prop.initializer)) name = prop.initializer.text
      }
      if (key === 'valueType') {
        if (ts.isStringLiteral(prop.initializer)) valueType = prop.initializer.text
      }
    }
    if (!name || !valueType) return null
    dicts.push({ name, valueType: valueType as DictValueType })
  }
  return dicts
}

export function recordTimerHandleMeta(env: Env, id: ts.Identifier, dicts: TimerCaptureDictMeta[]) {
  const sym = env.checker.getSymbolAtLocation(id)
  if (!sym) return
  if (!env.timerHandleMeta) env.timerHandleMeta = new Map()
  const meta: TimerHandleMeta = { dicts }
  env.timerHandleMeta.set(sym, meta)
}

export function propagateTimerHandleMeta(
  env: Env,
  target: ts.Identifier,
  source: ts.Identifier
): boolean {
  const sourceSym = env.checker.getSymbolAtLocation(source)
  const targetSym = env.checker.getSymbolAtLocation(target)
  if (!sourceSym || !targetSym) return false
  const meta = env.timerHandleMeta?.get(sourceSym)
  if (!meta) return false
  if (!env.timerHandleMeta) env.timerHandleMeta = new Map()
  env.timerHandleMeta.set(targetSym, meta)
  return true
}

function buildCaptureValueExpr(env: Env, id: ts.Identifier): ts.Expression {
  const sym = env.checker.getSymbolAtLocation(id)
  let plan = sym ? env.varPlan?.get(sym) : undefined
  if (!plan && sym && env.varPlan && sym.valueDeclaration) {
    for (const [entrySym, entryPlan] of env.varPlan.entries()) {
      if (entrySym.valueDeclaration === sym.valueDeclaration) {
        plan = entryPlan
        break
      }
    }
  }
  const base = ts.factory.createIdentifier(id.text)
  if (plan?.needsLocalVar) {
    return ts.factory.createPropertyAccessExpression(base, 'value')
  }
  return base
}

function readNumericLiteral(expr: ts.Expression): number | null {
  if (ts.isNumericLiteral(expr)) return Number(expr.text.replace(/_/g, ''))
  if (ts.isBigIntLiteral(expr)) return Number(expr.text.replace(/_/g, '').slice(0, -1))
  if (ts.isPrefixUnaryExpression(expr)) {
    if (expr.operator === ts.SyntaxKind.PlusToken || expr.operator === ts.SyntaxKind.MinusToken) {
      const inner = readNumericLiteral(expr.operand)
      if (inner === null) return null
      return expr.operator === ts.SyntaxKind.MinusToken ? -inner : inner
    }
  }
  return null
}

function buildTimerHandler(
  env: Env,
  fn: ts.ArrowFunction | ts.FunctionExpression,
  evtName: string,
  fName: string,
  poolNames: string[],
  captures: TimerCaptureSpec[],
  kind: TimerKind,
  timerNameIdent: string | null
): ts.ArrowFunction {
  const evtId = ts.factory.createIdentifier(evtName)
  const fId = ts.factory.createIdentifier(fName)
  const timerNameDecl =
    timerNameIdent !== null
      ? ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                timerNameIdent,
                undefined,
                undefined,
                ts.factory.createPropertyAccessExpression(evtId, 'timerName')
              )
            ],
            ts.NodeFlags.Const
          )
        )
      : null
  const captureStmts = captures.flatMap((cap) => {
    const dictExpr = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(fId, 'getNodeGraphVariable'),
          undefined,
          [ts.factory.createStringLiteral(cap.dictVarName)]
        ),
        'asDict'
      ),
      undefined,
      [ts.factory.createStringLiteral('str'), ts.factory.createStringLiteral(cap.valueType)]
    )
    const rawValueExpr = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(fId, 'queryDictionaryValueByKey'),
      undefined,
      [dictExpr, ts.factory.createPropertyAccessExpression(evtId, 'timerName')]
    )
    const valueExpr =
      cap.timerDicts !== undefined
        ? ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(fId, '__gstsAttachTimerHandle'),
            undefined,
            [
              rawValueExpr,
              ts.factory.createArrayLiteralExpression(
                cap.timerDicts.map((dict) =>
                  ts.factory.createObjectLiteralExpression(
                    [
                      ts.factory.createPropertyAssignment(
                        'name',
                        ts.factory.createStringLiteral(dict.name)
                      ),
                      ts.factory.createPropertyAssignment(
                        'valueType',
                        ts.factory.createStringLiteral(dict.valueType)
                      )
                    ],
                    true
                  )
                ),
                true
              )
            ]
          )
        : rawValueExpr
    return ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [ts.factory.createVariableDeclaration(cap.name, undefined, undefined, valueExpr)],
        ts.NodeFlags.Const
      )
    )
  })

  const originalStmts = ts.isBlock(fn.body)
    ? [...fn.body.statements]
    : [ts.factory.createExpressionStatement(fn.body)]

  const cleanupStmt =
    kind === 'timeout' && captures.length > 0
      ? ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(fId, '__gstsClearTimerCaptures'),
            undefined,
            [
              ts.factory.createPropertyAccessExpression(evtId, 'timerName'),
              ts.factory.createArrayLiteralExpression(
                captures.map((cap) =>
                  ts.factory.createObjectLiteralExpression(
                    [
                      ts.factory.createPropertyAssignment(
                        'name',
                        ts.factory.createStringLiteral(cap.dictVarName)
                      ),
                      ts.factory.createPropertyAssignment(
                        'valueType',
                        ts.factory.createStringLiteral(cap.valueType)
                      )
                    ],
                    true
                  )
                ),
                true
              )
            ]
          )
        )
      : null

  const mainStmts = [
    ...(timerNameDecl ? [timerNameDecl] : []),
    ...captureStmts,
    ...originalStmts,
    ...(cleanupStmt ? [cleanupStmt] : [])
  ]

  let body: ts.Block
  if (poolNames.length <= 1) {
    const cond = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(fId, 'equal'),
      undefined,
      [
        ts.factory.createPropertyAccessExpression(evtId, 'timerName'),
        ts.factory.createStringLiteral(poolNames[0] ?? '')
      ]
    )
    const ifStmt = ts.factory.createIfStatement(
      cond,
      ts.factory.createBlock(mainStmts, true),
      undefined
    )
    body = ts.factory.createBlock([ifStmt], true)
  } else {
    const bodyFn = ts.factory.createArrowFunction(
      undefined,
      undefined,
      [],
      undefined,
      ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      ts.factory.createBlock(mainStmts, true)
    )

    const primary = poolNames[0] ?? ''
    const props: ts.ObjectLiteralElementLike[] = [
      ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(primary), bodyFn)
    ]
    for (const name of poolNames.slice(1)) {
      props.push(
        ts.factory.createPropertyAssignment(
          ts.factory.createStringLiteral(name),
          ts.factory.createStringLiteral(primary)
        )
      )
    }

    const branchesObj = ts.factory.createObjectLiteralExpression(props, true)
    const call = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(fId, 'multipleBranches'),
      undefined,
      [ts.factory.createPropertyAccessExpression(evtId, 'timerName'), branchesObj]
    )
    body = ts.factory.createBlock([ts.factory.createExpressionStatement(call)], true)
  }

  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(undefined, undefined, evtName),
      ts.factory.createParameterDeclaration(undefined, undefined, fName)
    ],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    body
  )
}

function transformTimerCall(
  env: Env,
  context: ts.TransformationContext,
  expr: ts.CallExpression,
  kind: TimerKind
): ts.Expression {
  if (!env.serverCtx) {
    fail(
      env,
      expr,
      'setTimeout/setInterval is only supported inside g.server().on/onSignal handler or gstsServer function'
    )
  }
  if (expr.arguments.length === 0) {
    fail(env, expr, 'setTimeout/setInterval requires a callback function')
  }
  if (expr.arguments.length > 2) {
    fail(env, expr, 'setTimeout/setInterval only supports (callback, delayMs)')
  }

  const handlerArg = expr.arguments[0]
  if (!ts.isArrowFunction(handlerArg) && !ts.isFunctionExpression(handlerArg)) {
    fail(env, handlerArg, 'setTimeout/setInterval callback must be a function')
  }

  const { evtName, fName } = resolveTimerParamNames(env, handlerArg)
  const poolSize = resolveTimerPoolSize(env, expr, kind)
  const timerId = env.timerCounterRef.value++
  const poolNames = Array.from({ length: poolSize }, (_, i) => `__gsts_${kind}_${timerId}_${i}`)
  const indexVarName = `__gsts_${kind}_${timerId}_index`
  const timerNameIdent = `__gsts_${kind}_${timerId}_timerName`

  const handleSymbol = (() => {
    const parent = expr.parent
    if (ts.isVariableDeclaration(parent) && parent.initializer === expr) {
      if (ts.isIdentifier(parent.name)) {
        return env.checker.getSymbolAtLocation(parent.name) ?? null
      }
    }
    if (
      ts.isBinaryExpression(parent) &&
      parent.right === expr &&
      ts.isIdentifier(parent.left) &&
      isAssignmentLikeOperator(parent.operatorToken.kind)
    ) {
      return env.checker.getSymbolAtLocation(parent.left) ?? null
    }
    return null
  })()

  const excludedNames = new Set<string>([evtName, fName, 'gsts', env.gstsIdent, 'globalThis'])
  if (handleSymbol) excludedNames.add(handleSymbol.getName())
  const captureInfos = collectTimerCaptures(
    { ...env, timerHandleSymbol: handleSymbol ?? undefined },
    handlerArg,
    excludedNames
  )
  const captures: TimerCaptureSpec[] = captureInfos.map((info) => ({
    name: info.name,
    valueType: info.valueType,
    dictVarName: `__gsts_${kind}_${timerId}_cap_${info.name}`,
    valueExpr: buildCaptureValueExpr(env, info.id),
    timerDicts: info.timerDicts
  }))

  const handler = buildTimerHandler(
    env,
    handlerArg,
    evtName,
    fName,
    poolNames,
    captures,
    kind,
    timerNameIdent
  )
  const timerHandleDicts = captures.map((cap) => ({
    name: cap.dictVarName,
    valueType: cap.valueType
  }))
  const timerCaptureMap = new Map<ts.Symbol, TimerCaptureInfo>()
  for (let i = 0; i < captureInfos.length; i += 1) {
    const info = captureInfos[i]
    const sym = env.checker.getSymbolAtLocation(info.id)
    if (!sym) continue
    const cap = captures[i]
    if (!cap) continue
    timerCaptureMap.set(sym, { dictVarName: cap.dictVarName, valueType: cap.valueType })
  }
  const shadowedNames = new Set(captures.map((cap) => cap.name))
  const transformedHandler = transformHandler(
    {
      ...env,
      shadowedNames,
      timerCaptureMap,
      timerNameIdent,
      timerHandleSymbol: handleSymbol ?? undefined,
      timerHandleDicts
    },
    context,
    handler
  )

  const delayArg = expr.arguments[1]
  if (kind === 'interval' && delayArg) {
    const ms = readNumericLiteral(delayArg)
    if (ms !== null && ms <= 100) {
      warn(env, delayArg, t('warn_timerIntervalHighFrequency', { ms }))
    }
  }
  const delayExpr = delayArg
    ? transformExpression(env, context, delayArg)
    : ts.factory.createNumericLiteral(0)

  const captureEntries = captures.map((cap) =>
    ts.factory.createObjectLiteralExpression(
      [
        ts.factory.createPropertyAssignment('name', ts.factory.createStringLiteral(cap.name)),
        ts.factory.createPropertyAssignment(
          'dictVar',
          ts.factory.createStringLiteral(cap.dictVarName)
        ),
        ts.factory.createPropertyAssignment(
          'valueType',
          ts.factory.createStringLiteral(cap.valueType)
        ),
        ts.factory.createPropertyAssignment('value', cap.valueExpr)
      ],
      true
    )
  )

  const optionProps: ts.ObjectLiteralElementLike[] = [
    ts.factory.createPropertyAssignment('__gstsTimer', ts.factory.createTrue()),
    ts.factory.createPropertyAssignment('kind', ts.factory.createStringLiteral(kind)),
    ts.factory.createPropertyAssignment(
      'poolNames',
      ts.factory.createArrayLiteralExpression(
        poolNames.map((n) => ts.factory.createStringLiteral(n)),
        false
      )
    ),
    ts.factory.createPropertyAssignment(
      '__gstsTimerDedupKey',
      ts.factory.createStringLiteral(
        `${kind}:${env.file.fileName}:${expr.getStart(env.file, false)}`
      )
    ),
    ts.factory.createPropertyAssignment(
      'captures',
      ts.factory.createArrayLiteralExpression(captureEntries, true)
    )
  ]
  if (poolSize > 1) {
    optionProps.push(
      ts.factory.createPropertyAssignment('indexVar', ts.factory.createStringLiteral(indexVarName))
    )
  }
  const optionsExpr = ts.factory.createObjectLiteralExpression(optionProps, true)

  const newArgs = [transformedHandler, delayExpr, optionsExpr]
  return withSameRange(
    ts.factory.updateCallExpression(expr, expr.expression, expr.typeArguments, newArgs),
    expr
  )
}

export function transformExpression(
  env: Env,
  context: ts.TransformationContext,
  expr: ts.Expression
): ts.Expression {
  // keep raw-wrapper function arguments untouched (no transform on subtree)
  if (ts.isCallExpression(expr) && isRawWrapperCall(expr)) {
    return expr
  }

  const timerKind = ts.isCallExpression(expr) ? getTimerKind(expr) : null
  if (timerKind && ts.isCallExpression(expr)) {
    return transformTimerCall(env, context, expr, timerKind)
  }

  if (
    ts.isCallExpression(expr) &&
    isMultipleBranchesFCall(env, expr) &&
    expr.arguments.length >= 2
  ) {
    const args = [...expr.arguments]
    args[0] = transformExpression(env, context, args[0])
    const branches = args[1]
    if (ts.isObjectLiteralExpression(branches)) {
      const props = branches.properties.map((p) => {
        if (ts.isPropertyAssignment(p)) {
          const init = p.initializer
          if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
            const override = { fIdent: env.fIdent, evtIdent: env.evtIdent }
            const transformed = transformHandler(env, context, init, override)
            return ts.factory.updatePropertyAssignment(p, p.name, transformed)
          }
          return ts.factory.updatePropertyAssignment(
            p,
            p.name,
            transformExpression(env, context, init)
          )
        }
        if (ts.isShorthandPropertyAssignment(p)) {
          const name = p.name
          const sym = env.checker.getSymbolAtLocation(name)
          const plan = sym ? env.varPlan?.get(sym) : undefined
          if (plan?.needsLocalVar) {
            return ts.factory.createPropertyAssignment(
              name,
              withSameRange(ts.factory.createPropertyAccessExpression(name, 'value'), p)
            )
          }
          return p
        }
        if (ts.isSpreadAssignment(p)) {
          return ts.factory.updateSpreadAssignment(
            p,
            transformExpression(env, context, p.expression)
          )
        }
        return p
      })
      args[1] = ts.factory.updateObjectLiteralExpression(branches, props)
    } else {
      args[1] = transformExpression(env, context, branches)
    }
    for (let i = 2; i < args.length; i++) {
      args[i] = transformExpression(env, context, args[i])
    }
    return withSameRange(
      ts.factory.updateCallExpression(expr, expr.expression, expr.typeArguments, args),
      expr
    )
  }

  if (ts.isPropertyAccessExpression(expr)) {
    const builtinProp = tryTransformBuiltinPropertyAccess(env, context, expr, transformExpression)
    if (builtinProp) return builtinProp
  }

  if (ts.isCallExpression(expr)) {
    const builtinCall = tryTransformBuiltinCall(env, context, expr, transformExpression)
    if (builtinCall) return builtinCall
    const listCall = tryTransformListMethodCall(
      env,
      context,
      expr,
      transformExpression,
      transformHandler
    )
    if (listCall) return listCall
  }

  // gsts.f.assemblyList(items, ...): avoid nested assemblyList(assemblyList([...]))
  // - if items is an array literal without spread: keep it as JS array literal, but still transform element expressions
  // - if items contains spread: use the original array->list concatenation logic (same as normal array transform)
  if (ts.isCallExpression(expr) && isAssemblyListFCall(env, expr) && expr.arguments.length >= 1) {
    const args = [...expr.arguments]
    const items = args[0]
    const mapped = tryMapArrayLiteralThroughWrappers(items, (arr) => {
      if (arr.elements.some((el) => ts.isSpreadElement(el))) return null
      const mapped = arr.elements.map((el) => transformExpression(env, context, el))
      return ts.factory.createArrayLiteralExpression(mapped, false)
    })
    if (mapped) {
      args[0] = mapped
      for (let i = 1; i < args.length; i++) {
        args[i] = transformExpression(env, context, args[i])
      }
      return withSameRange(
        ts.factory.updateCallExpression(expr, expr.expression, expr.typeArguments, args),
        expr
      )
    }
  }

  // list(type, items?): do NOT wrap `items` array literal with assemblyList(...)
  // but still transform element expressions (so DSL ops still work inside the array)
  if (ts.isCallExpression(expr) && isListWrapperCall(expr) && expr.arguments.length >= 2) {
    const args = [...expr.arguments]
    args[0] = transformExpression(env, context, args[0])
    const items = args[1]
    const mapped = tryMapArrayLiteralThroughWrappers(items, (arr) => {
      // If spread exists, fall back to the original "spread array -> concatenateList" logic,
      // because JS spread semantics may not work for GSTS list values.
      if (arr.elements.some((el) => ts.isSpreadElement(el))) return null
      const mapped = arr.elements.map((el) => transformExpression(env, context, el))
      return ts.factory.createArrayLiteralExpression(mapped, false)
    })
    args[1] = mapped ?? transformExpression(env, context, items)
    return withSameRange(
      ts.factory.updateCallExpression(expr, expr.expression, expr.typeArguments, args),
      expr
    )
  }

  if (ts.isIdentifier(expr)) {
    const name = expr.text
    const sym = env.checker.getSymbolAtLocation(expr)
    // 仅在定时器回调上下文生效(因为这些env参数仅在回调情况下才存在)：
    // 1) handle 标识符 -> 当前 timerName(并附带捕获字典元数据以便清理), 该转换用于避免直接clearInterval(t)产生的报错, 因为.gs.ts的setInterval是伪异步
    // 2) 捕获变量标识符 -> LocalVariable 的 .value 读取
    if (sym && env.timerHandleSymbol && sym === env.timerHandleSymbol && env.timerNameIdent) {
      const timerName = ts.factory.createIdentifier(env.timerNameIdent)
      if (env.timerHandleDicts) {
        const call = ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier(env.gstsIdent),
              'f'
            ),
            '__gstsAttachTimerHandle'
          ),
          undefined,
          [timerName, buildTimerHandleDictsLiteral(env.timerHandleDicts)]
        )
        return withSameRange(call, expr)
      }
      return withSameRange(timerName, expr)
    }
    if (sym && env.timerCaptureMap?.has(sym)) {
      return withSameRange(ts.factory.createPropertyAccessExpression(expr, 'value'), expr)
    }
    const shadowedNames = env.shadowedNames
    if (shadowedNames && shadowedNames.has(name)) {
      if (shouldWrapLoopIndexByContext(env, expr)) {
        return withSameRange(wrapWithFloat(expr), expr)
      }
      return expr
    }
    const localSymbols = env.localSymbols
    if (sym && localSymbols && localSymbols.has(sym)) {
      const localVarSymbols = env.localVarSymbols
      if (localVarSymbols && localVarSymbols.has(sym)) {
        return withSameRange(ts.factory.createPropertyAccessExpression(expr, 'value'), expr)
      }
      if (shouldWrapLoopIndexByContext(env, expr)) {
        return withSameRange(wrapWithFloat(expr), expr)
      }
      return expr
    }
    if (!sym) {
      const localNames: Set<string> | undefined = env.localNames
      if (localNames && localNames.has(name)) {
        const localVarNames: Set<string> | undefined = env.localVarNames
        if (localVarNames && localVarNames.has(name)) {
          return withSameRange(ts.factory.createPropertyAccessExpression(expr, 'value'), expr)
        }
        if (shouldWrapLoopIndexByContext(env, expr)) {
          return withSameRange(wrapWithFloat(expr), expr)
        }
        return expr
      }
    }
    let p = sym ? env.varPlan?.get(sym) : undefined
    if (!p && sym && env.varPlan && sym.valueDeclaration) {
      for (const [entrySym, entryPlan] of env.varPlan.entries()) {
        if (entrySym.valueDeclaration === sym.valueDeclaration) {
          p = entryPlan
          break
        }
      }
    }
    if (p?.needsLocalVar) {
      return withSameRange(ts.factory.createPropertyAccessExpression(expr, 'value'), expr)
    }
    if (shouldWrapLoopIndexByContext(env, expr)) {
      return withSameRange(wrapWithFloat(expr), expr)
    }
    return expr
  }

  if (ts.isObjectLiteralExpression(expr)) {
    // Do not convert object literal to dict for now, but still transform nested expressions.
    // This is important for patterns like:
    //   f.assemblyDictionary([{ k: xxx, v: someListLocalVar }])
    // where `someListLocalVar` needs to be referenced as `.value`.
    const transformObjValue = (e: ts.Expression): ts.Expression => {
      const mapped = tryMapArrayLiteralThroughWrappers(e, (arr) => {
        const mappedElems = arr.elements.map((el) => {
          if (ts.isSpreadElement(el)) {
            return ts.factory.updateSpreadElement(
              el,
              transformExpression(env, context, el.expression)
            )
          }
          return transformExpression(env, context, el)
        })
        return ts.factory.createArrayLiteralExpression(mappedElems, false)
      })
      return mapped ?? transformExpression(env, context, e)
    }
    const props = expr.properties.map((p) => {
      if (ts.isPropertyAssignment(p)) {
        return ts.factory.updatePropertyAssignment(p, p.name, transformObjValue(p.initializer))
      }
      if (ts.isShorthandPropertyAssignment(p)) {
        const name = p.name
        const sym = env.checker.getSymbolAtLocation(name)
        const plan = sym ? env.varPlan?.get(sym) : undefined
        if (plan?.needsLocalVar) {
          return ts.factory.createPropertyAssignment(
            name,
            withSameRange(ts.factory.createPropertyAccessExpression(name, 'value'), p)
          )
        }
        return p
      }
      if (ts.isSpreadAssignment(p)) {
        return ts.factory.updateSpreadAssignment(p, transformObjValue(p.expression))
      }
      return p
    })
    return withSameRange(ts.factory.updateObjectLiteralExpression(expr, props), expr)
  }

  const wrappedArr = tryTransformWrappedArrayLiteral(env, context, expr)
  if (wrappedArr) return wrappedArr

  if (ts.isConditionalExpression(expr)) {
    const resultType = inferConditionalResultType(env, expr)
    const cond = transformExpression(env, context, expr.condition)
    const whenTrue = transformExpression(env, context, expr.whenTrue)
    const whenFalse = transformExpression(env, context, expr.whenFalse)

    const tmpName = `__gsts_ternary_${env.tempCounter++}`
    const tmpId = ts.factory.createIdentifier(tmpName)

    const decl = ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            tmpId,
            undefined,
            undefined,
            makeFCall(env, 'initLocalVariable', [ts.factory.createStringLiteral(resultType)])
          )
        ],
        ts.NodeFlags.Const
      )
    )

    const setTrue = ts.factory.createExpressionStatement(
      makeFCall(env, 'setLocalVariable', [
        ts.factory.createPropertyAccessExpression(tmpId, 'localVariable'),
        whenTrue
      ])
    )
    const setFalse = ts.factory.createExpressionStatement(
      makeFCall(env, 'setLocalVariable', [
        ts.factory.createPropertyAccessExpression(tmpId, 'localVariable'),
        whenFalse
      ])
    )

    const branch = makeFCall(env, 'doubleBranch', [
      cond,
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([setTrue], true)
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([setFalse], true)
      )
    ])

    const body = ts.factory.createBlock(
      [
        decl,
        ts.factory.createExpressionStatement(branch),
        ts.factory.createReturnStatement(ts.factory.createPropertyAccessExpression(tmpId, 'value'))
      ],
      true
    )

    return withSameRange(
      ts.factory.createCallExpression(
        ts.factory.createParenthesizedExpression(
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            body
          )
        ),
        undefined,
        []
      ),
      expr
    )
  }

  // element access: list[id] -> getCorrespondingValueFromList(list, id)
  if (ts.isElementAccessExpression(expr)) {
    const obj = transformExpression(env, context, expr.expression)
    let idx: ts.Expression
    if (expr.argumentExpression) idx = transformExpression(env, context, expr.argumentExpression)
    else fail(env, expr, 'index is required')
    return makeFCall(env, 'getCorrespondingValueFromList', [obj, idx])
  }

  // binary
  if (ts.isBinaryExpression(expr)) {
    const op = expr.operatorToken.kind
    if (op === ts.SyntaxKind.QuestionQuestionToken) {
      fail(env, expr, 'nullish coalescing operator ?? is not supported')
    }

    if (op === ts.SyntaxKind.EqualsToken && ts.isElementAccessExpression(expr.left)) {
      // list[id] = v -> modifyValueInList(list, id, v)
      const left = expr.left
      const listExpr = transformExpression(env, context, left.expression)
      let idExpr: ts.Expression
      if (left.argumentExpression) {
        idExpr = transformExpression(env, context, left.argumentExpression)
      } else {
        fail(env, left, 'index is required')
      }
      const valExpr = transformExpression(env, context, expr.right)
      return makeFCall(env, 'modifyValueInList', [listExpr, idExpr, valExpr])
    }

    // 标识符赋值/复合赋值
    if (isAssignmentLikeOperator(op)) {
      if (!ts.isIdentifier(expr.left)) {
        fail(env, expr.left, 'Only assignment/compound assignment to identifiers is supported')
      }

      // 赋值表达式只能作为独立语句；禁止 foo(a=1) / x = (y = 1) 等
      if (!ts.isExpressionStatement(expr.parent)) {
        fail(
          env,
          expr,
          'Assignment is only supported as a standalone statement (assignment used as an expression is not supported)'
        )
      }
      if (hasNestedAssignment(expr.right)) {
        fail(env, expr, 'Nested assignment is not supported (e.g. a = (b = 1) or a = b = 1)')
      }

      const leftId = expr.left
      let rhs = transformExpression(env, context, expr.right)
      const leftType = env.checker.getTypeAtLocation(leftId)
      if (getNumericKind(env, leftType) === 'float' && isLoopIndexIdentifier(env, expr.right)) {
        rhs = wrapWithFloat(rhs)
      }
      const timerMeta = extractTimerHandleMeta(rhs)
      if (timerMeta) {
        recordTimerHandleMeta(env, leftId, timerMeta)
      } else if (ts.isIdentifier(expr.right)) {
        propagateTimerHandleMeta(env, leftId, expr.right)
      }

      const sym = env.checker.getSymbolAtLocation(leftId)
      const p = sym ? env.varPlan?.get(sym) : undefined
      if (p?.needsLocalVar) {
        if (!isSupportedSimpleAssignmentOperator(op)) {
          fail(env, expr, 'Unsupported assignment operator for local variables')
        }
        if (op === ts.SyntaxKind.EqualsToken) {
          return withSameRange(
            makeFCall(env, 'setLocalVariable', [
              ts.factory.createPropertyAccessExpression(leftId, 'localVariable'),
              rhs
            ]),
            expr
          )
        }
        if (p.isCollection) {
          fail(env, expr, 'Unsupported compound assignment operator for collection local variables')
        }
        const opMethod = getCompoundAssignmentMethod(op)
        if (!opMethod) fail(env, expr, 'Unsupported compound assignment operator')
        const computed = makeFCall(env, opMethod, [
          ts.factory.createPropertyAccessExpression(leftId, 'value'),
          rhs
        ])
        return withSameRange(
          makeFCall(env, 'setLocalVariable', [
            ts.factory.createPropertyAccessExpression(leftId, 'localVariable'),
            computed
          ]),
          expr
        )
      }

      if (!isSupportedSimpleAssignmentOperator(op)) {
        fail(env, expr, `Unsupported assignment operator: ${expr.operatorToken.getText(env.file)}`)
      }
      if (op === ts.SyntaxKind.EqualsToken) {
        return withSameRange(
          ts.factory.updateBinaryExpression(expr, leftId, expr.operatorToken, rhs),
          expr
        )
      }
      const opMethod = getCompoundAssignmentMethod(op)
      if (!opMethod) fail(env, expr, 'Unsupported compound assignment operator')
      const computed = makeFCall(env, opMethod, [leftId, rhs])
      return withSameRange(
        ts.factory.updateBinaryExpression(
          expr,
          leftId,
          ts.factory.createToken(ts.SyntaxKind.EqualsToken),
          computed
        ),
        expr
      )
    }

    let left = transformExpression(env, context, expr.left)
    let right = transformExpression(env, context, expr.right)

    if (
      op === ts.SyntaxKind.EqualsEqualsToken ||
      op === ts.SyntaxKind.EqualsEqualsEqualsToken ||
      op === ts.SyntaxKind.ExclamationEqualsToken ||
      op === ts.SyntaxKind.ExclamationEqualsEqualsToken
    ) {
      const leftEnum = getEnumTypeInfo(env, env.checker.getTypeAtLocation(expr.left))
      const rightEnum = getEnumTypeInfo(env, env.checker.getTypeAtLocation(expr.right))
      if (leftEnum.isEnum || rightEnum.isEnum) {
        if (!leftEnum.isEnum || !rightEnum.isEnum) {
          fail(env, expr, 'enum comparison requires both sides to be enum values')
        }
        if (leftEnum.name && rightEnum.name && leftEnum.name !== rightEnum.name) {
          fail(env, expr, `enum comparison type mismatch (${leftEnum.name} vs ${rightEnum.name})`)
        }
        const eq = makeFCall(env, 'enumerationsEqual', [left, right])
        return op === ts.SyntaxKind.EqualsEqualsToken ||
          op === ts.SyntaxKind.EqualsEqualsEqualsToken
          ? eq
          : makeFCall(env, 'logicalNotOperation', [eq])
      }

      const eq = makeFCall(env, 'equal', [left, right])
      return op === ts.SyntaxKind.EqualsEqualsToken || op === ts.SyntaxKind.EqualsEqualsEqualsToken
        ? eq
        : makeFCall(env, 'logicalNotOperation', [eq])
    }

    const info = getBinaryOpInfo(op)
    if (info) {
      const isNumericOp =
        op === ts.SyntaxKind.PlusToken ||
        op === ts.SyntaxKind.MinusToken ||
        op === ts.SyntaxKind.AsteriskToken ||
        op === ts.SyntaxKind.SlashToken ||
        op === ts.SyntaxKind.PercentToken ||
        op === ts.SyntaxKind.LessThanToken ||
        op === ts.SyntaxKind.LessThanEqualsToken ||
        op === ts.SyntaxKind.GreaterThanToken ||
        op === ts.SyntaxKind.GreaterThanEqualsToken
      if (isNumericOp) {
        const leftIsLoop = isLoopIndexIdentifier(env, expr.left)
        const rightIsLoop = isLoopIndexIdentifier(env, expr.right)
        if (leftIsLoop) {
          const otherKind = getNumericKind(env, env.checker.getTypeAtLocation(expr.right))
          if (otherKind === 'float') {
            left = wrapWithFloat(left)
          }
        }
        if (rightIsLoop) {
          const otherKind = getNumericKind(env, env.checker.getTypeAtLocation(expr.left))
          if (otherKind === 'float') {
            right = wrapWithFloat(right)
          }
        }
      }
      if (info.swap) return makeFCall(env, info.method, [right, left])
      return makeFCall(env, info.method, [left, right])
    }

    // 明确拦截目前未实现但会产生错误语义的运算符，避免静默输出看似能跑的 .gs.ts
    if (isUnsupportedBinaryOperator(op)) {
      fail(env, expr, `Binary operator ${expr.operatorToken.getText(env.file)} is not supported`)
    }
  }

  if (ts.isPrefixUnaryExpression(expr)) {
    if (expr.operator === ts.SyntaxKind.ExclamationToken) {
      return makeFCall(env, 'logicalNotOperation', [
        transformExpression(env, context, expr.operand)
      ])
    }
    if (expr.operator === ts.SyntaxKind.TildeToken) {
      return makeFCall(env, 'bitwiseComplement', [transformExpression(env, context, expr.operand)])
    }
  }

  return ts.visitEachChild(
    expr,
    (n) => (ts.isExpression(n) ? transformExpression(env, context, n) : n),
    context
  )
}
