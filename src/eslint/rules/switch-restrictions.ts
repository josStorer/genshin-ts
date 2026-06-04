import type { Rule } from 'eslint'
import ts from 'typescript'

import { formatMessage } from '../utils/messages.js'
import { readBaseOptions } from '../utils/options.js'
import { getParserServices } from '../utils/parser.js'
import { buildServerScopeIndex } from '../utils/scope.js'
import { getNumericKind, isStringType } from '../utils/types.js'

type Options = {
  allowFallthrough?: boolean
  lang?: 'zh' | 'en' | 'both'
  scope?: 'server' | 'all'
  includeNestedFunctions?: boolean
}

const DEFAULTS: Required<Options> = {
  allowFallthrough: false,
  lang: 'both',
  scope: 'server',
  includeNestedFunctions: true
}

function isStringLiteral(node: any): boolean {
  return node?.type === 'Literal' && typeof node.value === 'string'
}

function isIntLiteral(node: any): boolean {
  if (!node || node.type !== 'Literal') return false
  if (typeof node.value === 'number' && Number.isInteger(node.value)) return true
  if (typeof node.value === 'bigint') return true
  if (typeof node.bigint === 'string') return true
  return false
}

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

function isTsStringLiteral(expr: ts.Expression): boolean {
  const unwrapped = unwrapConstExpression(expr)
  return ts.isStringLiteral(unwrapped) || ts.isNoSubstitutionTemplateLiteral(unwrapped)
}

function isTsIntLiteral(expr: ts.Expression): boolean {
  const unwrapped = unwrapConstExpression(expr)
  if (ts.isBigIntLiteral(unwrapped)) return true
  if (ts.isNumericLiteral(unwrapped)) {
    const raw = unwrapped.text.replace(/_/g, '')
    return !/[.eE]/.test(raw)
  }
  if (
    ts.isPrefixUnaryExpression(unwrapped) &&
    (unwrapped.operator === ts.SyntaxKind.PlusToken ||
      unwrapped.operator === ts.SyntaxKind.MinusToken)
  ) {
    return isTsIntLiteral(unwrapped.operand)
  }
  return false
}

type ConstLiteralKind = 'int' | 'str'

function isConstVariableDeclaration(decl: ts.VariableDeclaration): boolean {
  const list = decl.parent
  return ts.isVariableDeclarationList(list) && (list.flags & ts.NodeFlags.Const) !== 0
}

function resolveSymbol(sym: ts.Symbol, checker: ts.TypeChecker): ts.Symbol {
  if ((sym.flags & ts.SymbolFlags.Alias) !== 0) {
    return checker.getAliasedSymbol(sym)
  }
  return sym
}

function constInitializerFromSymbol(sym: ts.Symbol): ts.Expression | null {
  for (const decl of sym.declarations ?? []) {
    if (!ts.isVariableDeclaration(decl)) continue
    if (!decl.initializer || !isConstVariableDeclaration(decl)) continue
    return decl.initializer
  }
  return null
}

function propertyNameText(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text
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
  checker: ts.TypeChecker,
  expr: ts.Expression,
  seen: Set<ts.Symbol>
): ts.ObjectLiteralExpression | null {
  const unwrapped = unwrapConstExpression(expr)

  if (ts.isObjectLiteralExpression(unwrapped)) return unwrapped

  if (ts.isIdentifier(unwrapped)) {
    const sym = checker.getSymbolAtLocation(unwrapped)
    if (!sym) return null
    const resolved = resolveSymbol(sym, checker)
    if (seen.has(resolved)) return null
    seen.add(resolved)
    const initializer = constInitializerFromSymbol(resolved)
    return initializer ? resolveConstObjectExpression(checker, initializer, seen) : null
  }

  if (ts.isPropertyAccessExpression(unwrapped)) {
    const initializer = propertyInitializerFromAccess(checker, unwrapped, seen)
    return initializer ? resolveConstObjectExpression(checker, initializer, seen) : null
  }

  return null
}

function propertyInitializerFromAccess(
  checker: ts.TypeChecker,
  expr: ts.PropertyAccessExpression,
  seen: Set<ts.Symbol>
): ts.Expression | null {
  const object = resolveConstObjectExpression(checker, expr.expression, seen)
  return object ? propertyInitializerFromObject(object, expr.name.text) : null
}

function hasSafeConstOrigin(
  checker: ts.TypeChecker,
  expr: ts.Expression,
  seen: Set<ts.Symbol>
): boolean {
  const unwrapped = unwrapConstExpression(expr)
  if (isTsStringLiteral(unwrapped) || isTsIntLiteral(unwrapped)) return true

  if (ts.isIdentifier(unwrapped)) {
    const sym = checker.getSymbolAtLocation(unwrapped)
    if (!sym) return false
    const resolved = resolveSymbol(sym, checker)
    if (seen.has(resolved)) return false
    seen.add(resolved)
    const initializer = constInitializerFromSymbol(resolved)
    return initializer ? hasSafeConstOrigin(checker, initializer, seen) : false
  }

  if (ts.isPropertyAccessExpression(unwrapped)) {
    const initializer = propertyInitializerFromAccess(checker, unwrapped, seen)
    return initializer ? hasSafeConstOrigin(checker, initializer, seen) : false
  }

  return false
}

function constLiteralKindFromType(
  checker: ts.TypeChecker,
  expr: ts.Expression
): ConstLiteralKind | null {
  const t = checker.getTypeAtLocation(expr)
  if (t.isUnion()) return null
  if (t.isStringLiteral()) return 'str'
  if ((t.flags & ts.TypeFlags.BigIntLiteral) !== 0) return 'int'
  if (t.isNumberLiteral()) return Number.isInteger(t.value) ? 'int' : null

  return null
}

function constLiteralKindFromConstOrigin(
  checker: ts.TypeChecker,
  expr: ts.Expression,
  seen: Set<ts.Symbol>
): ConstLiteralKind | null {
  const directKind = constLiteralKindFromType(checker, expr)
  if (directKind) return directKind

  const unwrapped = unwrapConstExpression(expr)
  if (ts.isIdentifier(unwrapped)) {
    const sym = checker.getSymbolAtLocation(unwrapped)
    if (!sym) return null
    const resolved = resolveSymbol(sym, checker)
    if (seen.has(resolved)) return null
    seen.add(resolved)
    const initializer = constInitializerFromSymbol(resolved)
    return initializer ? constLiteralKindFromConstOrigin(checker, initializer, seen) : null
  }

  if (ts.isPropertyAccessExpression(unwrapped)) {
    const initializer = propertyInitializerFromAccess(checker, unwrapped, seen)
    return initializer ? constLiteralKindFromConstOrigin(checker, initializer, seen) : null
  }

  return null
}

function isConstStringLiteral(checker: ts.TypeChecker, expr: ts.Expression): boolean {
  return (
    constLiteralKindFromConstOrigin(checker, expr, new Set()) === 'str' &&
    hasSafeConstOrigin(checker, expr, new Set())
  )
}

function isConstIntLiteral(checker: ts.TypeChecker, expr: ts.Expression): boolean {
  return (
    constLiteralKindFromConstOrigin(checker, expr, new Set()) === 'int' &&
    hasSafeConstOrigin(checker, expr, new Set())
  )
}

function lastNonEmptyStatement(stmts: any[]): any | null {
  for (let i = stmts.length - 1; i >= 0; i -= 1) {
    const stmt = stmts[i]
    if (!stmt || stmt.type === 'EmptyStatement') continue
    return stmt
  }
  return null
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          allowFallthrough: { type: 'boolean' },
          lang: { enum: ['zh', 'en', 'both'] },
          scope: { enum: ['server', 'all'] },
          includeNestedFunctions: { type: 'boolean' }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const raw = (context.options[0] ?? {}) as Options
    const options = readBaseOptions(raw, DEFAULTS)
    const services = getParserServices(context)
    if (!services) return {}
    const checker = services.program.getTypeChecker()
    const scopeIndex = buildServerScopeIndex(context)

    return {
      SwitchStatement(node) {
        if (!scopeIndex.isInServerScope(node, options)) return
        const tsNode = services.esTreeNodeToTSNodeMap.get(node.discriminant)
        if (!tsNode) return
        const type = checker.getTypeAtLocation(tsNode)
        const kind = getNumericKind(checker, type)
        const isStr = isStringType(checker, type)
        if (kind !== 'int' && !isStr) {
          context.report({
            node: node.discriminant,
            message: formatMessage(
              options.lang,
              'switch 控制表达式必须是 int 或 str',
              'switch control expression must be int or str'
            )
          })
          return
        }

        let defaultCount = 0
        const cases = node.cases ?? []
        for (let i = 0; i < cases.length; i += 1) {
          const clause = cases[i]
          if (!clause.test) {
            defaultCount += 1
            if (defaultCount > 1) {
              context.report({
                node: clause,
                message: formatMessage(
                  options.lang,
                  'switch 不允许多个 default',
                  'switch has multiple default clauses'
                )
              })
            }
            continue
          }
          const testTsNode = services.esTreeNodeToTSNodeMap.get(clause.test)
          const testExpression = testTsNode && ts.isExpression(testTsNode) ? testTsNode : null
          const isConstString = testExpression
            ? isConstStringLiteral(checker, testExpression)
            : false
          const isConstInt = testExpression ? isConstIntLiteral(checker, testExpression) : false

          if (isStr && !isStringLiteral(clause.test) && !isConstString) {
            context.report({
              node: clause.test,
              message: formatMessage(
                options.lang,
                'switch case 表达式必须为字符串字面量',
                'switch case expression must be a string literal'
              )
            })
          }
          if (kind === 'int' && !isIntLiteral(clause.test) && !isConstInt) {
            context.report({
              node: clause.test,
              message: formatMessage(
                options.lang,
                'switch case 表达式必须为整数/BigInt字面量',
                'switch case expression must be an integer literal'
              )
            })
          }
        }

        if (!options.allowFallthrough && cases.length > 1) {
          for (let i = 0; i < cases.length - 1; i += 1) {
            const clause = cases[i]
            if (!clause.consequent?.length) continue
            const last = lastNonEmptyStatement(clause.consequent)
            if (
              last &&
              last.type !== 'BreakStatement' &&
              last.type !== 'ReturnStatement' &&
              last.type !== 'ContinueStatement'
            ) {
              context.report({
                node: clause,
                message: formatMessage(
                  options.lang,
                  'switch 不支持带 body 的 fallthrough, 请添加 break/return/continue',
                  'switch fallthrough with body is not supported; add break/return/continue'
                )
              })
            }
          }
        }
      }
    }
  }
}

export default rule
