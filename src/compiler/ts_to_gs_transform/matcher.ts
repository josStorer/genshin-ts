import ts from 'typescript'

import { CLIENT_F_GLOBAL_NAME_BY_SUB_TYPE } from '../../definitions/client_graph_modes.js'
import { getClientFMethodNameFromAlias } from '../../definitions/client_zh_aliases.js'
import { SERVER_F_ZH_TO_EN } from '../../definitions/zh_aliases.js'
import type { Env } from './types.js'

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
