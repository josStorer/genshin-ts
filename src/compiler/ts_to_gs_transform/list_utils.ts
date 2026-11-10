import ts from 'typescript'

import {
  inferListElementTypeFromExpression as inferListElementTypeFromExpressionShared,
  inferListElementTypeFromType as inferListElementTypeFromTypeShared,
  inferListTypeFromExpression as inferListTypeFromExpressionShared,
  inferListTypeFromType as inferListTypeFromTypeShared,
  isArrayLikeType as isArrayLikeTypeShared
} from '../../shared/ts_list_utils.js'
import {
  isEntityLikeType as isSharedEntityLikeType,
  unwrapExpression
} from '../../shared/ts_type_utils.js'
import { isCollectionType } from '../../shared/ts_variable_utils.js'
import { isConstEvaluableExpression, isPureLiteralExpression } from './const_eval.js'
import { fail } from './errors.js'
import { type ListType } from './lists.js'
import { isFMethodCall } from './matcher.js'
import type { CollectionSourceKind, Env } from './types.js'
import { isClientFMethodAvailable, makeFCall } from './utils.js'

export type InlineCallbackExpr = {
  fn: ts.ArrowFunction | ts.FunctionExpression
  params: string[]
  expr: ts.Expression
}

export type InlineCallbackBlock = {
  fn: ts.ArrowFunction | ts.FunctionExpression
  params: string[]
  body: ts.Block
}

export const SUPPORTED_LIST_METHODS = new Set<string>([
  'concat',
  'forEach',
  'includes',
  'indexOf',
  'map',
  'filter',
  'reduce',
  'some',
  'every',
  'find',
  'findIndex',
  'push',
  'pop',
  'shift',
  'unshift',
  'slice',
  'splice'
])

export function isListWrapperCall(expr: ts.Expression): expr is ts.CallExpression {
  return (
    ts.isCallExpression(expr) && ts.isIdentifier(expr.expression) && expr.expression.text === 'list'
  )
}

export function classifyCollectionSource(
  env: Env,
  expr: ts.Expression | undefined,
  sourceKindForSymbol?: (symbol: ts.Symbol) => CollectionSourceKind | undefined
): CollectionSourceKind {
  const isEntityReceiverType = (t: ts.Type, location: ts.Node): boolean => {
    if (t.flags & ts.TypeFlags.Union) {
      return (t as ts.UnionType).types.some((tt) => isEntityReceiverType(tt, location))
    }
    if (t.flags & ts.TypeFlags.Intersection) {
      return (t as ts.IntersectionType).types.some((tt) => isEntityReceiverType(tt, location))
    }
    return isSharedEntityLikeType(env.checker, t, location)
  }

  const isEntityCustomVariableGetCall = (expr: ts.Expression): expr is ts.CallExpression => {
    if (!ts.isCallExpression(expr)) return false
    if (!ts.isPropertyAccessExpression(expr.expression)) return false
    if (expr.expression.name.text !== 'get' && expr.expression.name.text !== 'getCustomVariable') {
      return false
    }
    const receiver = unwrapExpression(expr.expression.expression)
    return isEntityReceiverType(env.checker.getTypeAtLocation(receiver), receiver)
  }

  const classify = (expr: ts.Expression | undefined): CollectionSourceKind => {
    if (!expr) return 'unknown'
    const unwrapped = unwrapExpression(expr)

    if (ts.isIdentifier(unwrapped)) {
      const sourceSym = env.checker.getSymbolAtLocation(unwrapped)
      const sourceKind = sourceSym
        ? sourceKindForSymbol
          ? sourceKindForSymbol(sourceSym)
          : env.varPlan?.get(sourceSym)?.collectionSourceKind
        : undefined
      if (sourceKind) return sourceKind
    }

    if (isLocalListRead(env, unwrapped)) return 'liveRef'

    // `f.get(...)` 已经带有节点图变量元数据推断, 裸调用就应视为实时引用,
    // 不应依赖用户再手动追加 `.asType(...)` / `.asDict(...)`。
    if (isFMethodCall(env, unwrapped, ['get'])) return 'liveRef'

    if (ts.isCallExpression(unwrapped) && ts.isPropertyAccessExpression(unwrapped.expression)) {
      const method = unwrapped.expression.name.text
      if (method === 'asType' || method === 'asDict') {
        const base = unwrapExpression(unwrapped.expression.expression)
        // `getNodeGraphVariable` / `getCustomVariable` 返回 generic, 需要通过 asType/asDict
        // 确认集合类型。这里保留 `get` 仅用于兼容 `f.get(...).asType(...)` 这种冗余写法。
        if (isFMethodCall(env, base, ['getNodeGraphVariable', 'get', 'getCustomVariable'])) {
          return 'liveRef'
        }
        if (isEntityCustomVariableGetCall(base)) return 'liveRef'
      }
    }

    if (isFMethodCall(env, unwrapped, ['copyList'])) {
      return 'copy'
    }

    if (isFMethodCall(env, unwrapped, ['assemblyList'])) {
      const firstArg = unwrapped.arguments[0]
      if (firstArg) {
        const firstArgType = env.checker.getTypeAtLocation(firstArg)
        if (isCollectionType(env, firstArgType)) return 'copy'
      }
      return 'temporary'
    }

    if (isFMethodCall(env, unwrapped, ['createDictionary', 'assemblyDictionary'])) {
      return 'temporary'
    }
    if (
      isListWrapperCall(unwrapped) ||
      ts.isArrayLiteralExpression(unwrapped) ||
      ts.isObjectLiteralExpression(unwrapped)
    ) {
      return 'temporary'
    }

    return 'unknown'
  }

  return classify(expr)
}

export function isPureCollectionExpression(env: Env, expr: ts.Expression): boolean {
  let source = unwrapExpression(expr)
  if (isListWrapperCall(source)) {
    const items = source.arguments[1]
    if (!items) return source.arguments.length === 1
    source = unwrapExpression(items)
  }
  if (!ts.isArrayLiteralExpression(source)) return false
  return source.elements.every(
    (element) =>
      !ts.isSpreadElement(element) &&
      (isPureLiteralExpression(element) || isConstEvaluableExpression(env, element))
  )
}

function isLocalListRead(env: Env, source: ts.Expression): boolean {
  if (!ts.isPropertyAccessExpression(source) || source.name.text !== 'value') return false
  const receiver = env.checker.getTypeAtLocation(source.expression)
  const handle = env.checker.getPropertyOfType(receiver, 'localVariable')
  if (!handle) return false
  const type = env.checker.getTypeOfSymbolAtLocation(handle, source.expression)
  return !!env.checker.getPropertyOfType(type, '__brandLocalVariable')
}

export function inferSnapshotListType(env: Env, source: ts.Expression): ListType | null {
  const type = env.checker.getTypeAtLocation(source)
  const element = env.checker.getIndexTypeOfType(type, ts.IndexKind.Number)
  const unsupported = (item: ts.Type): boolean =>
    (item.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Never)) !== 0 ||
    !!env.checker.getPropertyOfType(item, '__brandStruct') ||
    (item.isUnionOrIntersection() && item.types.some(unsupported))
  // Struct lists have no local-variable node; unresolved element types cannot select one either.
  if (!element || unsupported(element)) return null
  return inferListTypeFromExpression(env, source)
}

export function stabilizeListIterationSource(
  env: Env,
  source: ts.Expression,
  transformed: ts.Expression
): ts.Expression {
  const unwrapped = unwrapExpression(source)
  if (ts.isIdentifier(unwrapped)) {
    const symbol = env.checker.getSymbolAtLocation(unwrapped)
    // Named collections are saved at their declarations or deliberately retain a live reference.
    if (
      symbol &&
      (env.varPlan?.get(symbol)?.isCollection || env.timerCaptureMap?.get(symbol)?.useLocalVar)
    )
      return transformed
  }
  if (
    classifyCollectionSource(env, source) === 'liveRef' ||
    isLocalListRead(env, unwrapped) ||
    isPureCollectionExpression(env, unwrapped)
  )
    return transformed
  if (!isClientFMethodAvailable(env, 'initLocalVariable')) return transformed
  const type = inferSnapshotListType(env, source)
  if (!type) return transformed
  return ts.factory.createPropertyAccessExpression(
    makeFCall(env, 'initLocalVariable', [
      ts.factory.createStringLiteral(`${type}_list`),
      transformed
    ]),
    'value'
  )
}

export function inferListElementTypeFromType(env: Env, t: ts.Type): ListType | null {
  return inferListElementTypeFromTypeShared(env.checker, t, env.file)
}

export function inferListElementTypeFromExpression(env: Env, expr: ts.Expression): ListType | null {
  return inferListElementTypeFromExpressionShared(env.checker, expr)
}

export function inferListTypeFromType(env: Env, t: ts.Type): ListType | null {
  return inferListTypeFromTypeShared(env.checker, t, env.file)
}

export function inferListTypeFromExpression(env: Env, expr: ts.Expression): ListType | null {
  return inferListTypeFromExpressionShared(env.checker, expr)
}

export function isArrayLikeType(env: Env, t: ts.Type): boolean {
  return isArrayLikeTypeShared(env.checker, t)
}

export function isArrayLikeExpression(env: Env, expr: ts.Expression): boolean {
  const t = env.checker.getTypeAtLocation(expr)
  return isArrayLikeType(env, t)
}

function readCallbackParamName(
  env: Env,
  method: string,
  param: ts.ParameterDeclaration,
  index: number
): string {
  if (param.dotDotDotToken) {
    fail(env, param, `${method} callback does not support rest parameters`)
  }
  if (!ts.isIdentifier(param.name)) {
    fail(env, param, `${method} callback parameter #${index + 1} must be an identifier`)
  }
  if (param.name.text === 'this') {
    fail(env, param, `${method} callback does not support "this" parameters`)
  }
  if (param.initializer) {
    fail(env, param, `${method} callback parameter #${index + 1} must not have a default`)
  }
  return param.name.text
}

function requireInlineCallback(
  env: Env,
  method: string,
  arg: ts.Expression
): ts.ArrowFunction | ts.FunctionExpression {
  if (!ts.isArrowFunction(arg) && !ts.isFunctionExpression(arg)) {
    fail(env, arg, `${method} callback must be an inline function`)
  }
  return arg
}

export function readInlineCallbackExpression(
  env: Env,
  method: string,
  arg: ts.Expression,
  paramCount: number
): InlineCallbackExpr {
  const fn = requireInlineCallback(env, method, arg)
  if (fn.parameters.length !== paramCount) {
    fail(env, fn, `${method} callback must have exactly ${paramCount} parameter(s)`)
  }
  const params = fn.parameters.map((p, idx) => readCallbackParamName(env, method, p, idx))
  if (new Set(params).size !== params.length) {
    fail(env, fn, `${method} callback parameters must be unique`)
  }
  if (ts.isBlock(fn.body)) {
    const stmts = fn.body.statements
    if (stmts.length !== 1 || !ts.isReturnStatement(stmts[0]) || !stmts[0].expression) {
      fail(env, fn.body, `${method} callback must return a single expression`)
    }
    return { fn, params, expr: stmts[0].expression }
  }
  return { fn, params, expr: fn.body }
}

export function readInlineCallbackBlock(
  env: Env,
  method: string,
  arg: ts.Expression,
  paramCount: number,
  opts?: { allowZero?: boolean }
): InlineCallbackBlock {
  const fn = requireInlineCallback(env, method, arg)
  const allowZero = opts?.allowZero === true
  if (fn.parameters.length !== paramCount && !(allowZero && fn.parameters.length === 0)) {
    fail(env, fn, `${method} callback must have exactly ${paramCount} parameter(s)`)
  }
  const params = fn.parameters.map((p, idx) => readCallbackParamName(env, method, p, idx))
  if (new Set(params).size !== params.length) {
    fail(env, fn, `${method} callback parameters must be unique`)
  }
  if (!ts.isBlock(fn.body)) {
    fail(env, fn.body, `${method} callback must use a block body`)
  }
  return { fn, params, body: fn.body }
}

function unwrapEqualityOperand(expr: ts.Expression): ts.Expression {
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
    if (ts.isNonNullExpression(cur)) {
      cur = cur.expression
      continue
    }
    return cur
  }
}

function isSafeEqualityOperand(expr: ts.Expression, paramName: string): boolean {
  const visit = (node: ts.Expression): boolean => {
    const cur = unwrapEqualityOperand(node)
    if (ts.isIdentifier(cur)) return cur.text !== paramName
    if (ts.isNumericLiteral(cur)) return true
    if (ts.isBigIntLiteral(cur)) return true
    if (ts.isStringLiteral(cur)) return true
    if (cur.kind === ts.SyntaxKind.TrueKeyword || cur.kind === ts.SyntaxKind.FalseKeyword) {
      return true
    }
    if (cur.kind === ts.SyntaxKind.NullKeyword) return true
    if (ts.isPrefixUnaryExpression(cur)) {
      if (
        cur.operator !== ts.SyntaxKind.PlusToken &&
        cur.operator !== ts.SyntaxKind.MinusToken &&
        cur.operator !== ts.SyntaxKind.ExclamationToken
      ) {
        return false
      }
      return visit(cur.operand)
    }
    if (ts.isPropertyAccessExpression(cur)) return visit(cur.expression)
    if (ts.isElementAccessExpression(cur)) {
      if (!cur.argumentExpression) return false
      return visit(cur.expression) && visit(cur.argumentExpression)
    }
    return false
  }
  return visit(expr)
}

export function extractSimpleEqualityMatch(
  expr: ts.Expression,
  paramName: string
): ts.Expression | null {
  const inner = unwrapEqualityOperand(expr)
  if (!ts.isBinaryExpression(inner)) return null
  if (
    inner.operatorToken.kind !== ts.SyntaxKind.EqualsEqualsToken &&
    inner.operatorToken.kind !== ts.SyntaxKind.EqualsEqualsEqualsToken
  ) {
    return null
  }

  const left = unwrapEqualityOperand(inner.left)
  const right = unwrapEqualityOperand(inner.right)

  if (ts.isIdentifier(left) && left.text === paramName) {
    return isSafeEqualityOperand(right, paramName) ? right : null
  }
  if (ts.isIdentifier(right) && right.text === paramName) {
    return isSafeEqualityOperand(left, paramName) ? left : null
  }

  return null
}

export function makeConst(name: string, init: ts.Expression): ts.VariableStatement {
  return ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration(name, undefined, undefined, init)],
      ts.NodeFlags.Const
    )
  )
}

export function makeLocalVarInit(
  env: Env,
  name: string,
  type: string,
  init?: ts.Expression
): ts.VariableStatement {
  const args = init
    ? [ts.factory.createStringLiteral(type), init]
    : [ts.factory.createStringLiteral(type)]
  const initExpr = makeFCall(env, 'initLocalVariable', args)
  return makeConst(name, initExpr)
}

export function makeIife(stmts: ts.Statement[], retExpr: ts.Expression): ts.Expression {
  return ts.factory.createCallExpression(
    ts.factory.createParenthesizedExpression(
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.factory.createBlock([...stmts, ts.factory.createReturnStatement(retExpr)], true)
      )
    ),
    undefined,
    []
  )
}

export function makeDefaultValueExpr(listType: ListType): ts.Expression | null {
  switch (listType) {
    case 'int':
      return ts.factory.createBigIntLiteral('0n')
    case 'float':
      return ts.factory.createNumericLiteral(0)
    case 'bool':
      return ts.factory.createFalse()
    case 'str':
      return ts.factory.createStringLiteral('')
    case 'vec3':
      return ts.factory.createArrayLiteralExpression(
        [
          ts.factory.createNumericLiteral(0),
          ts.factory.createNumericLiteral(0),
          ts.factory.createNumericLiteral(0)
        ],
        false
      )
    default:
      return null
  }
}

export function ensureDefaultSupported(
  env: Env,
  node: ts.Node,
  listType: ListType,
  method: string
) {
  if (makeDefaultValueExpr(listType) === null) {
    fail(env, node, `${method}() only supports list types: int/float/bool/str/vec3`)
  }
}

export function assertBoolResult(env: Env, node: ts.Node, method: string, expr: ts.Expression) {
  const t = inferListElementTypeFromExpression(env, expr)
  if (t !== 'bool') {
    fail(env, node, `${method}() callback must return a boolean`)
  }
}

export function assertMapReturnType(env: Env, node: ts.Node, expr: ts.Expression): ListType {
  const t = inferListElementTypeFromExpression(env, expr)
  if (!t) {
    fail(env, node, 'map() callback return type must be a list element type')
  }
  const listResult = inferListTypeFromType(env, env.checker.getTypeAtLocation(expr))
  if (listResult) {
    fail(env, node, 'map() callback must return a single value, not a list')
  }
  return t
}

export function inferReduceAccumulatorType(
  env: Env,
  node: ts.Node,
  initExpr: ts.Expression,
  callbackExpr: ts.Expression
): ListType {
  const initType = inferListElementTypeFromExpression(env, initExpr)
  if (!initType) {
    fail(env, node, 'reduce() initial value must be a list element type')
  }
  const retType = inferListElementTypeFromExpression(env, callbackExpr)
  if (!retType) {
    fail(env, node, 'reduce() callback must return a list element type')
  }
  if (initType !== retType) {
    fail(env, node, 'reduce() callback return type must match the initial value type')
  }
  return initType
}

export function hasReturnStatement(block: ts.Block): boolean {
  let found = false
  const visit = (node: ts.Node) => {
    if (found) return
    if (ts.isFunctionLike(node)) return
    if (ts.isReturnStatement(node)) {
      found = true
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(block)
  return found
}
