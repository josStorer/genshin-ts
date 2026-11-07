import ts from 'typescript'

import {
  CLIENT_GRAPH_SUB_TYPE_BY_METHOD,
  CLIENT_GSTS_FUNCTION_PREFIXES,
  getClientGraphSubTypeForGstsFunctionName
} from '../../definitions/client_graph_modes.js'
import { isGraphFactory } from '../../shared/ts_type_utils.js'
import type { ClientGraphSubType } from '../../thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.js'

export const DEFAULT_GSTS_SERVER_PREFIX = 'gstsServer'
export const DEFAULT_GRAPH_FUNCTION_PREFIXES = [
  DEFAULT_GSTS_SERVER_PREFIX,
  ...CLIENT_GSTS_FUNCTION_PREFIXES
]

export function isGraphFunctionName(
  name: string | undefined,
  prefixes = DEFAULT_GRAPH_FUNCTION_PREFIXES
) {
  return !!name && prefixes.some((prefix) => name.startsWith(prefix))
}

export function isGstsServerName(
  name: string | undefined,
  prefixes = [DEFAULT_GSTS_SERVER_PREFIX]
) {
  return isGraphFunctionName(name, prefixes)
}

export function isFunctionInitializer(
  expr: ts.Expression | undefined
): expr is ts.FunctionExpression | ts.ArrowFunction {
  return !!expr && (ts.isFunctionExpression(expr) || ts.isArrowFunction(expr))
}

export function resolveAliasedSymbol(sym: ts.Symbol, checker: ts.TypeChecker): ts.Symbol {
  if ((sym.flags & ts.SymbolFlags.Alias) !== 0) {
    return checker.getAliasedSymbol(sym)
  }
  return sym
}

export function isGstsServerFunctionDecl(node: ts.Node): boolean {
  if (ts.isFunctionDeclaration(node)) return true
  if (ts.isFunctionExpression(node)) return true
  if (ts.isVariableDeclaration(node)) return isFunctionInitializer(node.initializer)
  return false
}

export function isGstsServerSymbol(
  sym: ts.Symbol,
  checker: ts.TypeChecker,
  prefixes = [DEFAULT_GSTS_SERVER_PREFIX]
): boolean {
  const target = resolveAliasedSymbol(sym, checker)
  if (!isGstsServerName(target.getName(), prefixes)) return false
  const decls = target.getDeclarations() ?? []
  if (!decls.length) return true
  return decls.some((d) => isGstsServerFunctionDecl(d))
}

export function getCallSymbol(call: ts.CallExpression, checker: ts.TypeChecker): ts.Symbol | null {
  const callee = call.expression
  if (ts.isIdentifier(callee)) return checker.getSymbolAtLocation(callee) ?? null
  if (ts.isPropertyAccessExpression(callee)) {
    return checker.getSymbolAtLocation(callee.name) ?? checker.getSymbolAtLocation(callee) ?? null
  }
  return checker.getSymbolAtLocation(callee) ?? null
}

export function isGstsServerCall(
  call: ts.CallExpression,
  checker: ts.TypeChecker,
  prefixes = [DEFAULT_GSTS_SERVER_PREFIX]
): boolean {
  const sym = getCallSymbol(call, checker)
  if (!sym) return false
  return isGstsServerSymbol(sym, checker, prefixes)
}

export function getGstsClientSymbolSubType(
  sym: ts.Symbol,
  checker: ts.TypeChecker
): ClientGraphSubType | undefined {
  const target = resolveAliasedSymbol(sym, checker)
  const subType = getClientGraphSubTypeForGstsFunctionName(target.getName())
  if (!subType) return undefined
  const decls = target.getDeclarations() ?? []
  if (!decls.length || decls.some((decl) => isGstsServerFunctionDecl(decl))) return subType
  return undefined
}

export function getGstsClientCallSubType(
  call: ts.CallExpression,
  checker: ts.TypeChecker
): ClientGraphSubType | undefined {
  const symbol = getCallSymbol(call, checker)
  return symbol ? getGstsClientSymbolSubType(symbol, checker) : undefined
}

export function isTopLevelVarDeclaration(decl: ts.VariableDeclaration): boolean {
  const list = decl.parent
  if (!ts.isVariableDeclarationList(list)) return false
  const stmt = list.parent
  return ts.isVariableStatement(stmt) && ts.isSourceFile(stmt.parent)
}

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
