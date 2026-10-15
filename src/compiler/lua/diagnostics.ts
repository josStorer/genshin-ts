import ts from 'typescript'

import { getCliLanguage, t } from '../../i18n/index.js'
import { getLuaBuiltins } from './builtins.js'
import { analyzeLuaEntry, entryDiagnosticRules } from './entry_analysis.js'
import { getSharedModuleDiagnostics } from './shared_modules.js'
import { standardLibraryDiagnostic } from './standard_library.js'
import { diagnostic, nodeGraphCalls } from './syntax.js'

export { getSharedModuleDiagnostics } from './shared_modules.js'

const ruleByMessage = {
  lua_importGraphEntry: 'lua-no-graph-entry',
  ...entryDiagnosticRules,
  lua_nestedEntry: 'lua-entry-declaration',
  lua_listenerOwnership: 'lua-listener-ownership',
  lua_reservedEnv: 'lua-reserved-env',
  lua_asyncFunction: 'lua-no-async',
  lua_spreadEnvironment: 'lua-environment-destructuring',
  lua_unsupportedSyntax: 'lua-unsupported-syntax',
  lua_truthiness: 'lua-truthiness',
  lua_nil: 'lua-nil-assignment',
  lua_undefinedField: 'lua-no-undefined-field',
  lua_arrayHole: 'lua-no-array-hole',
  lua_deleteArray: 'lua-no-array-delete',
  lua_bigint: 'lua-no-bigint'
} as const

export const luaLintRules = [
  ...new Set(
    Object.values(ruleByMessage).filter(
      (name) => name !== 'lua-truthiness' && name !== 'lua-nil-assignment'
    )
  ),
  'lua-standard-library',
  'lua-unavailable-global',
  'lua-shared-module'
] as const
export const luaWarningRules: readonly string[] = [
  'lua-no-undefined-field',
  'lua-no-array-hole',
  'lua-no-array-delete'
]
const diagnosticCache = new WeakMap<
  ts.Program,
  WeakMap<ts.SourceFile, { lang: string; diagnostics: ts.Diagnostic[] }>
>()
function issue(node: ts.Node, key: keyof typeof ruleByMessage, warning = false) {
  return { ...diagnostic(node, t(key), warning), source: ruleByMessage[key] }
}

/** 编译器、ESLint 和编辑器共用的 Lua 规则和入口分析结果。 */
export function getLuaDiagnostics(source: ts.SourceFile, program: ts.Program): ts.Diagnostic[] {
  const lang = getCliLanguage()
  let cached = diagnosticCache.get(program)
  if (!cached) {
    cached = new WeakMap()
    diagnosticCache.set(program, cached)
  }
  const previous = cached.get(source)
  if (previous?.lang === lang) return previous.diagnostics
  const checker = program.getTypeChecker()
  const builtins = getLuaBuiltins(program)
  const diagnostics: ts.Diagnostic[] = [...getSharedModuleDiagnostics(source, program)]
  for (const call of nodeGraphCalls(source)) diagnostics.push(issue(call, 'lua_importGraphEntry'))
  const analysis = analyzeLuaEntry(source, program)
  diagnostics.push(...analysis.diagnostics)
  const call = analysis.model?.call
  const includesNil = (expression: ts.Expression) => {
    const type = checker.getTypeAtLocation(expression)
    return (type.isUnion() ? type.types : [type]).some(
      (part) => !!(part.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null))
    )
  }
  const managedSignals: (string | undefined)[] = []
  const rawSignals: { name: string | undefined; node: ts.Node }[] = []
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const member = builtins.member(node.expression)
      const argument = node.arguments[0]
      if (member === 'onSignal') {
        const name = argument && checker.getTypeAtLocation(argument).getProperty('name')
        const type = name && checker.getTypeOfSymbolAtLocation(name, argument)
        managedSignals.push(type?.isStringLiteral() ? type.value : undefined)
      }
      if (member === 'rawSignalHandler' && ts.isPropertyAccessExpression(node.expression)) {
        let receiver: ts.Expression = node.expression.expression
        const seen = new Set<ts.Symbol>()
        while (ts.isIdentifier(receiver)) {
          const symbol = checker.getSymbolAtLocation(receiver)
          const declaration = symbol?.valueDeclaration
          if (
            !symbol ||
            seen.has(symbol) ||
            !declaration ||
            !ts.isVariableDeclaration(declaration) ||
            !declaration.initializer
          )
            break
          seen.add(symbol)
          receiver = declaration.initializer
        }
        if (builtins.member(receiver) === 'script')
          rawSignals.push({
            node,
            name: argument && ts.isStringLiteralLike(argument) ? argument.text : undefined
          })
      }
    }
    const standard = standardLibraryDiagnostic(node, checker, builtins)
    if (standard) diagnostics.push(standard)
    if (ts.isCallExpression(node) && node !== call && builtins.isEntryCall(node))
      diagnostics.push(issue(node, 'lua_nestedEntry'))
    if (
      ts.isIdentifier(node) &&
      node.text === '_ENV' &&
      (ts.isVariableDeclaration(node.parent) ||
        ts.isParameter(node.parent) ||
        ts.isFunctionDeclaration(node.parent)) &&
      node.parent.name === node
    )
      diagnostics.push(issue(node, 'lua_reservedEnv'))
    if (
      (ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node) ||
        ts.isMethodDeclaration(node)) &&
      (('asteriskToken' in node && node.asteriskToken) ||
        ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword))
    )
      diagnostics.push(issue(node, 'lua_asyncFunction'))
    if (
      ts.isVariableDeclaration(node) &&
      ts.isObjectBindingPattern(node.name) &&
      node.initializer &&
      checker.getTypeAtLocation(node.initializer).getSymbol() === builtins.clientGlobals &&
      (node.name.elements.some((e) => e.dotDotDotToken) || !ts.isIdentifier(node.initializer))
    )
      diagnostics.push(issue(node, 'lua_spreadEnvironment'))
    if (
      ts.isAwaitExpression(node) ||
      ts.isYieldExpression(node) ||
      (ts.isPrivateIdentifier(node) && ts.isBinaryExpression(node.parent)) ||
      (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
    )
      diagnostics.push(issue(node, 'lua_unsupportedSyntax'))

    if (
      ts.isPropertyAssignment(node) &&
      ts.isObjectLiteralExpression(node.parent) &&
      includesNil(node.initializer)
    )
      diagnostics.push(issue(node.initializer, 'lua_undefinedField', true))
    if (ts.isShorthandPropertyAssignment(node) && includesNil(node.name))
      diagnostics.push(issue(node.name, 'lua_undefinedField', true))
    if (ts.isArrayLiteralExpression(node))
      for (const element of node.elements)
        if (
          ts.isOmittedExpression(element) ||
          (!ts.isSpreadElement(element) && includesNil(element))
        )
          diagnostics.push(issue(element, 'lua_arrayHole', true))
    if (ts.isDeleteExpression(node) && ts.isElementAccessExpression(node.expression)) {
      const type = checker.getTypeAtLocation(node.expression.expression)
      if (checker.isArrayType(type) || checker.isTupleType(type))
        diagnostics.push(issue(node, 'lua_deleteArray', true))
    }
    if (
      ts.isBigIntLiteral(node) ||
      node.kind === ts.SyntaxKind.BigIntKeyword ||
      (ts.isIdentifier(node) && builtins.global(node) === 'BigInt')
    )
      diagnostics.push(issue(node, 'lua_bigint'))
    let condition: ts.Expression | undefined
    if (ts.isIfStatement(node) || ts.isWhileStatement(node) || ts.isDoStatement(node))
      condition = node.expression
    else if (ts.isConditionalExpression(node) || ts.isForStatement(node)) condition = node.condition
    else if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken)
      condition = node.operand
    else if (
      ts.isBinaryExpression(node) &&
      (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        node.operatorToken.kind === ts.SyntaxKind.BarBarToken)
    )
      condition = node.left
    if (condition) {
      const type = checker.getTypeAtLocation(condition)
      const parts = type.isUnion() ? type.types : [type]
      if (
        parts.some((t) => {
          if (t.isStringLiteral()) return t.value === ''
          if (t.isNumberLiteral()) return t.value === 0
          return !!(t.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.StringLike))
        })
      )
        diagnostics.push(issue(condition, 'lua_truthiness', true))
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      (ts.isElementAccessExpression(node.left) || ts.isPropertyAccessExpression(node.left))
    ) {
      const type = checker.getTypeAtLocation(node.right)
      const parts = type.isUnion() ? type.types : [type]
      if (parts.some((t) => t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)))
        diagnostics.push(issue(node, 'lua_nil', true))
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  for (const raw of rawSignals)
    if (
      managedSignals.some(
        (name) => name === undefined || raw.name === undefined || name === raw.name
      )
    )
      diagnostics.push(issue(raw.node, 'lua_listenerOwnership'))
  cached.set(source, { lang, diagnostics })
  return diagnostics
}
