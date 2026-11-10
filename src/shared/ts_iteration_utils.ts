import ts from 'typescript'

import { getClientOnCallInfo, isServerOnCall } from '../compiler/ts_to_gs_transform/matcher.js'
import { isArrayLikeType } from './ts_list_utils.js'

export type TimerKind = 'timeout' | 'interval'

export const ITERATING_LIST_METHODS = new Set([
  'forEach',
  'indexOf',
  'map',
  'filter',
  'reduce',
  'some',
  'every',
  'find',
  'findIndex',
  'slice'
])

export function unwrapListSource(expr: ts.Expression): ts.Expression {
  while (
    ts.isParenthesizedExpression(expr) ||
    ts.isAsExpression(expr) ||
    ts.isTypeAssertionExpression(expr) ||
    ts.isSatisfiesExpression(expr) ||
    ts.isNonNullExpression(expr)
  ) {
    expr = expr.expression
  }
  return expr
}

export function getTimerKind(expr: ts.CallExpression): TimerKind | null {
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

/** Branch and list callbacks share a flow; timers and event handlers start another one. */
export function isInlineCallback(fn: ts.Node, checker: ts.TypeChecker): boolean {
  if (!ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn)) return false
  const call = fn.parent
  return !(
    ts.isCallExpression(call) &&
    (getTimerKind(call) !== null ||
      isServerOnCall(call, checker) ||
      getClientOnCallInfo(call, checker))
  )
}

export function findIterationSourceReassignment(
  assignment: ts.BinaryExpression,
  checker: ts.TypeChecker
): ts.Identifier | undefined {
  const target = unwrapListSource(assignment.left)
  if (!ts.isIdentifier(target)) return undefined
  const symbol = checker.getSymbolAtLocation(target)
  if (!symbol) return undefined
  for (let current: ts.Node = assignment; current.parent; current = current.parent) {
    const parent = current.parent
    let source: ts.Expression | undefined
    if (ts.isForOfStatement(parent) && current === parent.statement) {
      source = parent.expression
    } else if (ts.isFunctionLike(current)) {
      if (!isInlineCallback(current, checker)) return undefined
      if (
        ts.isCallExpression(parent) &&
        ts.isPropertyAccessExpression(parent.expression) &&
        ITERATING_LIST_METHODS.has(parent.expression.name.text) &&
        parent.arguments[0] === current &&
        isArrayLikeType(checker, checker.getTypeAtLocation(parent.expression.expression))
      ) {
        source = parent.expression.expression
      }
    }
    if (!source) continue
    source = unwrapListSource(source)
    if (ts.isIdentifier(source) && checker.getSymbolAtLocation(source) === symbol) return target
  }
  return undefined
}
