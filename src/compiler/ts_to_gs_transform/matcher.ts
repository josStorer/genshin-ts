import ts from 'typescript'

import {
  CLIENT_F_GLOBAL_NAME_BY_SUB_TYPE,
  CLIENT_GRAPH_SUB_TYPE_BY_METHOD
} from '../../definitions/client_graph_modes.js'
import { getClientFMethodNameFromAlias } from '../../definitions/client_zh_aliases.js'
import { SERVER_F_ZH_TO_EN } from '../../definitions/zh_aliases.js'
import { isGraphFactory } from '../../shared/ts_type_utils.js'
import type { ClientGraphSubType } from '../../thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.js'
import type { Env } from './types.js'

function unwrapExpression(expr: ts.Expression): ts.Expression {
  let current = expr
  while (true) {
    if (ts.isParenthesizedExpression(current)) {
      current = current.expression
      continue
    }
    if (ts.isAsExpression(current)) {
      current = current.expression
      continue
    }
    if (ts.isTypeAssertionExpression(current)) {
      current = current.expression
      continue
    }
    if (ts.isNonNullExpression(current)) {
      current = current.expression
      continue
    }
    if (ts.isSatisfiesExpression(current)) {
      current = current.expression
      continue
    }
    return current
  }
}

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

export function isGstsRootExpression(env: Env, expr: ts.Expression): boolean {
  if (ts.isIdentifier(expr)) return expr.text === env.gstsIdent || expr.text === 'gsts'
  return (
    ts.isPropertyAccessExpression(expr) &&
    ts.isIdentifier(expr.expression) &&
    expr.expression.text === 'globalThis' &&
    expr.name.text === 'gsts'
  )
}

export function isFObjectExpression(env: Env, expr: ts.Expression): boolean {
  if (ts.isIdentifier(expr) && env.fIdent && expr.text === env.fIdent) return true
  if (ts.isPropertyAccessExpression(expr) && isGstsRootExpression(env, expr.expression)) {
    if (expr.name.text === 'f') return true
    if (env.clientSubType) {
      return expr.name.text === CLIENT_F_GLOBAL_NAME_BY_SUB_TYPE[env.clientSubType]
    }
  }
  return false
}

export function getFMethodCall(
  env: Env,
  call: ts.CallExpression
): { method: string; callee: ts.PropertyAccessExpression } | null {
  const callee = call.expression
  if (!ts.isPropertyAccessExpression(callee)) return null
  if (!isFObjectExpression(env, callee.expression)) return null
  const method = env.clientSubType
    ? getClientFMethodNameFromAlias(env.clientSubType, callee.name.text)
    : ((SERVER_F_ZH_TO_EN as Readonly<Record<string, string>>)[callee.name.text] ??
      callee.name.text)
  return { method, callee }
}

export function isFMethodCall(
  env: Env,
  expr: ts.Expression,
  names: readonly string[]
): expr is ts.CallExpression {
  if (!ts.isCallExpression(expr)) return false
  const call = getFMethodCall(env, expr)
  return !!call && names.includes(call.method)
}
