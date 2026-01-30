import ts from 'typescript'

import {
  inferListElementTypeFromExpression as inferListElementTypeFromExpressionShared,
  inferListElementTypeFromType as inferListElementTypeFromTypeShared,
  inferListTypeFromExpression as inferListTypeFromExpressionShared,
  inferListTypeFromType as inferListTypeFromTypeShared,
  isArrayLikeType as isArrayLikeTypeShared
} from '../../shared/ts_list_utils.js'
import { fail } from './errors.js'
import { type ListType } from './lists.js'
import type { Env } from './types.js'
import { makeFCall } from './utils.js'

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
  paramCount: number
): InlineCallbackBlock {
  const fn = requireInlineCallback(env, method, arg)
  if (fn.parameters.length !== paramCount) {
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

function unwrapExpression(expr: ts.Expression): ts.Expression {
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
    const cur = unwrapExpression(node)
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
  const inner = unwrapExpression(expr)
  if (!ts.isBinaryExpression(inner)) return null
  if (
    inner.operatorToken.kind !== ts.SyntaxKind.EqualsEqualsToken &&
    inner.operatorToken.kind !== ts.SyntaxKind.EqualsEqualsEqualsToken
  ) {
    return null
  }

  const left = unwrapExpression(inner.left)
  const right = unwrapExpression(inner.right)

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
