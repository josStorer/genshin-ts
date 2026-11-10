import ts from 'typescript'

import {
  CLIENT_GSTS_FUNCTION_PREFIXES,
  getClientGraphSubTypeForGstsFunctionName
} from '../../definitions/client_graph_modes.js'
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
