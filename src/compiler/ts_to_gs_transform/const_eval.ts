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

function isConstVariableDeclaration(decl: ts.VariableDeclaration): boolean {
  const list = decl.parent
  return ts.isVariableDeclarationList(list) && (list.flags & ts.NodeFlags.Const) !== 0
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

function literalFromSignedText(
  text: string,
  makePositiveLiteral: (positiveText: string) => ts.Expression
): ts.Expression | null {
  if (text.startsWith('-')) {
    const positiveText = text.slice(1)
    if (!positiveText) return null
    return ts.factory.createPrefixUnaryExpression(
      ts.SyntaxKind.MinusToken,
      makePositiveLiteral(positiveText)
    )
  }
  return makePositiveLiteral(text.startsWith('+') ? text.slice(1) : text)
}

function literalExpressionFromType(env: Env, expr: ts.Expression): ts.Expression | null {
  const t = env.checker.getTypeAtLocation(expr)
  if (t.isUnion()) return null

  if (t.isStringLiteral()) {
    return ts.factory.createStringLiteral(t.value)
  }
  if ((t.flags & ts.TypeFlags.BigIntLiteral) !== 0) {
    const value = (t as ts.BigIntLiteralType).value
    const text = `${value.negative ? '-' : ''}${value.base10Value}`
    return literalFromSignedText(text, (positiveText) =>
      ts.factory.createBigIntLiteral(`${positiveText}n`)
    )
  }
  if (t.isNumberLiteral()) {
    return literalFromSignedText(String(t.value), (text) => ts.factory.createNumericLiteral(text))
  }

  const typeText = env.checker.typeToString(t)
  if (typeText === 'true') return ts.factory.createTrue()
  if (typeText === 'false') return ts.factory.createFalse()

  return null
}

function isLiteralLikeExpression(expr: ts.Expression): boolean {
  const unwrapped = unwrapConstExpression(expr)
  if (
    ts.isNumericLiteral(unwrapped) ||
    ts.isBigIntLiteral(unwrapped) ||
    ts.isStringLiteral(unwrapped) ||
    ts.isNoSubstitutionTemplateLiteral(unwrapped) ||
    unwrapped.kind === ts.SyntaxKind.TrueKeyword ||
    unwrapped.kind === ts.SyntaxKind.FalseKeyword
  ) {
    return true
  }
  if (ts.isPrefixUnaryExpression(unwrapped)) {
    return (
      (unwrapped.operator === ts.SyntaxKind.PlusToken ||
        unwrapped.operator === ts.SyntaxKind.MinusToken ||
        unwrapped.operator === ts.SyntaxKind.ExclamationToken ||
        unwrapped.operator === ts.SyntaxKind.TildeToken) &&
      isLiteralLikeExpression(unwrapped.operand)
    )
  }
  return false
}

function propertyNameText(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name))
    return name.text
  return null
}

function propertyInitializerFromObject(
  object: ts.ObjectLiteralExpression,
  name: string
): ts.Expression | null {
  for (const prop of object.properties) {
    if (!ts.isPropertyAssignment(prop)) continue
    if (propertyNameText(prop.name) === name) return prop.initializer
  }
  return null
}

function resolveConstObjectExpression(
  env: Env,
  expr: ts.Expression,
  seen: Set<ts.Symbol>
): ts.ObjectLiteralExpression | null {
  const unwrapped = unwrapConstExpression(expr)

  if (ts.isObjectLiteralExpression(unwrapped)) return unwrapped

  if (ts.isIdentifier(unwrapped)) {
    const sym = env.checker.getSymbolAtLocation(unwrapped)
    if (!sym) return null
    const resolved = resolveSymbol(sym, env.checker)
    if (seen.has(resolved)) return null
    seen.add(resolved)
    const initializer = constInitializerFromSymbol(resolved)
    return initializer ? resolveConstObjectExpression(env, initializer, seen) : null
  }

  if (ts.isPropertyAccessExpression(unwrapped)) {
    const initializer = propertyInitializerFromAccess(env, unwrapped, seen)
    return initializer ? resolveConstObjectExpression(env, initializer, seen) : null
  }

  return null
}

function propertyInitializerFromAccess(
  env: Env,
  expr: ts.PropertyAccessExpression,
  seen: Set<ts.Symbol>
): ts.Expression | null {
  const object = resolveConstObjectExpression(env, expr.expression, seen)
  return object ? propertyInitializerFromObject(object, expr.name.text) : null
}

function hasSafeConstOrigin(env: Env, expr: ts.Expression, seen: Set<ts.Symbol>): boolean {
  const unwrapped = unwrapConstExpression(expr)

  if (isLiteralLikeExpression(unwrapped)) return true

  if (ts.isIdentifier(unwrapped)) {
    const sym = env.checker.getSymbolAtLocation(unwrapped)
    if (!sym) return false
    const resolved = resolveSymbol(sym, env.checker)
    if (seen.has(resolved)) return false
    seen.add(resolved)
    const initializer = constInitializerFromSymbol(resolved)
    return initializer ? hasSafeConstOrigin(env, initializer, seen) : false
  }

  if (ts.isPropertyAccessExpression(unwrapped)) {
    const initializer = propertyInitializerFromAccess(env, unwrapped, seen)
    return initializer ? hasSafeConstOrigin(env, initializer, seen) : false
  }

  return false
}

function literalExpressionFromConstOrigin(
  env: Env,
  expr: ts.Expression,
  seen: Set<ts.Symbol>
): ts.Expression | null {
  const directLiteral = literalExpressionFromType(env, expr)
  if (directLiteral) return directLiteral

  const unwrapped = unwrapConstExpression(expr)
  if (ts.isIdentifier(unwrapped)) {
    const sym = env.checker.getSymbolAtLocation(unwrapped)
    if (!sym) return null
    const resolved = resolveSymbol(sym, env.checker)
    if (seen.has(resolved)) return null
    seen.add(resolved)
    const initializer = constInitializerFromSymbol(resolved)
    return initializer ? literalExpressionFromConstOrigin(env, initializer, seen) : null
  }

  if (ts.isPropertyAccessExpression(unwrapped)) {
    const initializer = propertyInitializerFromAccess(env, unwrapped, seen)
    return initializer ? literalExpressionFromConstOrigin(env, initializer, seen) : null
  }

  return null
}

export function tryEvaluateConstExpression(
  env: Env,
  expr: ts.Expression,
  seen = new Set<ts.Symbol>()
): ts.Expression | null {
  if (!hasSafeConstOrigin(env, expr, seen)) return null
  return literalExpressionFromConstOrigin(env, expr, new Set())
}

export function isConstEvaluableExpression(env: Env, expr: ts.Expression): boolean {
  return tryEvaluateConstExpression(env, expr) !== null
}
