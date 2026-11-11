import ts from 'typescript'

import { CLIENT_GRAPH_SUB_TYPE_BY_METHOD } from '../definitions/client_graph_modes.js'
import type { ClientGraphSubType } from '../thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.js'
import { unwrapExpression } from './ts_ast_utils.js'
import { isGraphFactory } from './ts_type_utils.js'

function isGServerCall(expr: ts.Expression, checker: ts.TypeChecker): boolean {
  const target = unwrapExpression(expr)
  if (!ts.isCallExpression(target)) return false
  const callee = target.expression
  if (!ts.isPropertyAccessExpression(callee) || callee.name.text !== 'server') return false
  return isGraphFactory(callee.expression, checker)
}

function isServerInstanceExpression(
  expr: ts.Expression,
  checker: ts.TypeChecker,
  seen: Set<ts.Symbol>
): boolean {
  const target = unwrapExpression(expr)
  if (ts.isCallExpression(target)) {
    const callee = target.expression
    if (
      ts.isPropertyAccessExpression(callee) &&
      (callee.name.text === 'on' || callee.name.text === 'onSignal')
    ) {
      return isServerInstanceExpression(callee.expression, checker, seen)
    }
  }
  if (isGServerCall(target, checker)) return true
  if (!ts.isIdentifier(target)) return false

  const symbol = checker.getSymbolAtLocation(target)
  if (!symbol || seen.has(symbol)) return false
  seen.add(symbol)

  const declarations = symbol.getDeclarations() ?? []
  for (const decl of declarations) {
    if (ts.isVariableDeclaration(decl) && decl.initializer) {
      if (isServerInstanceExpression(decl.initializer, checker, seen)) return true
    }
  }
  return false
}

export function isServerOnCall(call: ts.CallExpression, checker: ts.TypeChecker): boolean {
  const callee = call.expression
  if (!ts.isPropertyAccessExpression(callee)) return false
  if (callee.name.text !== 'on' && callee.name.text !== 'onSignal') return false
  return isServerInstanceExpression(callee.expression, checker, new Set())
}

export type ClientOnCallInfo = {
  subType: ClientGraphSubType
  handler: ts.ArrowFunction | ts.FunctionExpression
}

type ClientInstanceInfo = Omit<ClientOnCallInfo, 'handler'>

function getClientInstanceInfo(
  expr: ts.Expression,
  checker: ts.TypeChecker,
  seen: Set<ts.Symbol>
): ClientInstanceInfo | undefined {
  const target = unwrapExpression(expr)
  if (ts.isCallExpression(target)) {
    const callee = target.expression
    if (ts.isPropertyAccessExpression(callee)) {
      const subType = CLIENT_GRAPH_SUB_TYPE_BY_METHOD[callee.name.text]
      if (subType && isGraphFactory(callee.expression, checker)) return { subType }
    }
  }
  if (!ts.isIdentifier(target)) return undefined

  const symbol = checker.getSymbolAtLocation(target)
  if (!symbol || seen.has(symbol)) return undefined
  seen.add(symbol)
  for (const decl of symbol.getDeclarations() ?? []) {
    if (!ts.isVariableDeclaration(decl) || !decl.initializer) continue
    const info = getClientInstanceInfo(decl.initializer, checker, seen)
    if (info) return info
  }
  return undefined
}

export function getClientOnCallInfo(
  call: ts.CallExpression,
  checker: ts.TypeChecker
): ClientOnCallInfo | undefined {
  const callee = call.expression
  if (!ts.isPropertyAccessExpression(callee) || callee.name.text !== 'on') return undefined
  const info = getClientInstanceInfo(callee.expression, checker, new Set())
  if (!info) return undefined
  const handler = call.arguments[1]
  if (!handler || (!ts.isArrowFunction(handler) && !ts.isFunctionExpression(handler))) {
    return undefined
  }
  return { ...info, handler }
}

export type TimerKind = 'timeout' | 'interval'

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
