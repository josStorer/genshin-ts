import ts from 'typescript'

import { isInlineCallback } from './ts_graph_calls.js'
import { isArrayLikeType } from './ts_list_utils.js'
import { unwrapExpression } from './ts_type_utils.js'

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

export function findIterationSourceReassignment(
  assignment: ts.BinaryExpression,
  checker: ts.TypeChecker
): ts.Identifier | undefined {
  const target = unwrapExpression(assignment.left)
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
    source = unwrapExpression(source)
    if (ts.isIdentifier(source) && checker.getSymbolAtLocation(source) === symbol) return target
  }
  return undefined
}
