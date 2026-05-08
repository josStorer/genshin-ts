import ts from 'typescript'

import type { Env } from './types.js'

/**
 * Conservative compile-time evaluator for literal-like const expressions.
 *
 * This module intentionally evaluates only the small subset of TypeScript that
 * the TS -> GS transform can safely erase without changing runtime semantics:
 *
 *   - literal values: 1, 1n, 'x', `x`, true, false
 *   - literal unary wrappers: -1, +1, !true, ~1
 *   - const aliases: const A = 1n; A
 *   - const object members: const Codes = { Start: 1n } as const; Codes.Start
 *   - nested const object members:
 *       const Codes = { Labels: { Ready: 'ready' } } as const
 *       Codes.Labels.Ready
 *
 * Example resolution flow:
 *
 *   const Workflow = {
 *     Step: {
 *       Start: 100n,
 *       ReadyLabel: 'ready'
 *     }
 *   } as const
 *   const FirstStep = Workflow.Step.Start
 *
 *   tryEvaluateConstExpression(FirstStep)
 *     -> identifier symbol FirstStep
 *     -> const initializer Workflow.Step.Start
 *     -> property symbol Start
 *     -> property initializer 100n
 *     -> cloned BigInt literal 100n
 *
 * The evaluator does not run JavaScript. It does not fold function calls,
 * arithmetic, object construction, Object.*, JSON.*, mutable variables, getters,
 * or arbitrary property reads. If any step is not provably a const literal, the
 * function returns null and the normal transformer handles the expression.
 *
 * Cloning literals matters because the returned node is inserted at the original
 * expression site. Callers then wrap it with withSameRange(...) so diagnostics
 * and source mapping still point at the user expression that was folded.
 */

function unwrapConstExpression(expr: ts.Expression): ts.Expression {
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
    if (ts.isSatisfiesExpression(cur)) {
      cur = cur.expression
      continue
    }
    return cur
  }
}

function cloneLiteralExpression(expr: ts.Expression): ts.Expression | null {
  const unwrapped = unwrapConstExpression(expr)

  if (ts.isNumericLiteral(unwrapped)) {
    return ts.factory.createNumericLiteral(unwrapped.text)
  }
  if (ts.isBigIntLiteral(unwrapped)) {
    return ts.factory.createBigIntLiteral(unwrapped.text)
  }
  if (ts.isStringLiteral(unwrapped) || ts.isNoSubstitutionTemplateLiteral(unwrapped)) {
    return ts.factory.createStringLiteral(unwrapped.text)
  }
  if (unwrapped.kind === ts.SyntaxKind.TrueKeyword) return ts.factory.createTrue()
  if (unwrapped.kind === ts.SyntaxKind.FalseKeyword) return ts.factory.createFalse()

  if (ts.isPrefixUnaryExpression(unwrapped)) {
    const operand = cloneLiteralExpression(unwrapped.operand)
    if (!operand) return null
    if (
      unwrapped.operator === ts.SyntaxKind.PlusToken ||
      unwrapped.operator === ts.SyntaxKind.MinusToken ||
      unwrapped.operator === ts.SyntaxKind.ExclamationToken ||
      unwrapped.operator === ts.SyntaxKind.TildeToken
    ) {
      return ts.factory.createPrefixUnaryExpression(unwrapped.operator, operand)
    }
  }

  return null
}

function isConstVariableDeclaration(decl: ts.VariableDeclaration): boolean {
  const list = decl.parent
  return ts.isVariableDeclarationList(list) && (list.flags & ts.NodeFlags.Const) !== 0
}

function isConstAssertedObjectInitializer(expr: ts.Expression): boolean {
  const unwrapped = unwrapConstExpression(expr)
  return ts.isObjectLiteralExpression(unwrapped) || ts.isArrayLiteralExpression(unwrapped)
}

function getEnclosingConstObjectDeclaration(node: ts.Node): ts.VariableDeclaration | null {
  let cur: ts.Node | undefined = node
  while (cur) {
    if (ts.isVariableDeclaration(cur)) {
      if (!cur.initializer || !isConstVariableDeclaration(cur)) return null
      return isConstAssertedObjectInitializer(cur.initializer) ? cur : null
    }
    if (ts.isFunctionLike(cur) || ts.isSourceFile(cur)) return null
    cur = cur.parent
  }
  return null
}

function propertyInitializerFromSymbol(sym: ts.Symbol): ts.Expression | null {
  for (const decl of sym.declarations ?? []) {
    if (!ts.isPropertyAssignment(decl)) continue
    if (!getEnclosingConstObjectDeclaration(decl)) continue
    return decl.initializer
  }
  return null
}

function constInitializerFromSymbol(sym: ts.Symbol): ts.Expression | null {
  for (const decl of sym.declarations ?? []) {
    if (!ts.isVariableDeclaration(decl)) continue
    if (!decl.initializer || !isConstVariableDeclaration(decl)) continue
    return decl.initializer
  }
  return null
}

function resolveSymbol(sym: ts.Symbol, checker: ts.TypeChecker): ts.Symbol {
  if ((sym.flags & ts.SymbolFlags.Alias) !== 0) {
    return checker.getAliasedSymbol(sym)
  }
  return sym
}

export function tryEvaluateConstExpression(
  env: Env,
  expr: ts.Expression,
  seen = new Set<ts.Symbol>()
): ts.Expression | null {
  const unwrapped = unwrapConstExpression(expr)
  const directLiteral = cloneLiteralExpression(unwrapped)
  if (directLiteral) return directLiteral

  if (ts.isIdentifier(unwrapped)) {
    const sym = env.checker.getSymbolAtLocation(unwrapped)
    if (!sym) return null
    const resolved = resolveSymbol(sym, env.checker)
    if (seen.has(resolved)) return null
    seen.add(resolved)
    const initializer = constInitializerFromSymbol(resolved)
    return initializer ? tryEvaluateConstExpression(env, initializer, seen) : null
  }

  if (ts.isPropertyAccessExpression(unwrapped)) {
    const sym = env.checker.getSymbolAtLocation(unwrapped.name)
    if (!sym) return null
    const resolved = resolveSymbol(sym, env.checker)
    if (seen.has(resolved)) return null
    seen.add(resolved)
    const initializer = propertyInitializerFromSymbol(resolved)
    return initializer ? tryEvaluateConstExpression(env, initializer, seen) : null
  }

  return null
}

export function isConstEvaluableExpression(env: Env, expr: ts.Expression): boolean {
  return tryEvaluateConstExpression(env, expr) !== null
}
