import ts from 'typescript'

import { getCliLanguage, t } from '../../i18n/index.js'
import { getLuaBuiltins } from './builtins.js'
import { standardLibraryDiagnostic } from './standard_library.js'
import { diagnostic, entryCall, hooks, nodeGraphCalls, publicMethodFunction } from './syntax.js'

const ruleByMessage = {
  lua_importGraphEntry: 'lua-no-graph-entry',
  lua_invalidEntry: 'lua-entry-declaration',
  lua_nestedEntry: 'lua-entry-declaration',
  lua_optionsEmpty: 'lua-entry-options',
  lua_invalidCallback: 'lua-entry-callback',
  lua_returnHooks: 'lua-entry-return',
  lua_dynamicHooks: 'lua-entry-return',
  lua_earlyReturn: 'lua-entry-return',
  lua_publicMethodThis: 'lua-public-methods',
  lua_publicMethodName: 'lua-public-methods',
  lua_entryTopLevel: 'lua-entry-top-level',
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
  'lua-unavailable-global'
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

/** 编译器、ESLint 和编辑器共用的 Lua 规则，不加载 TSTL。 */
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
  const diagnostics: ts.Diagnostic[] = []
  for (const call of nodeGraphCalls(source)) diagnostics.push(issue(call, 'lua_importGraphEntry'))
  const call = entryCall(source)
  if (call) {
    if (!builtins.isEntryCall(call)) diagnostics.push(issue(call, 'lua_invalidEntry'))
    const setup = call.arguments[call.arguments.length - 1]
    if (
      call.arguments.length < 1 ||
      call.arguments.length > 2 ||
      (call.arguments.length === 2 &&
        (!ts.isObjectLiteralExpression(call.arguments[0]) || call.arguments[0].properties.length))
    )
      diagnostics.push(issue(call, 'lua_optionsEmpty'))
    if (
      !setup ||
      !(ts.isArrowFunction(setup) || ts.isFunctionExpression(setup)) ||
      !ts.isBlock(setup.body) ||
      setup.parameters.length > 1 ||
      (setup.parameters[0] && !ts.isIdentifier(setup.parameters[0].name))
    )
      diagnostics.push(issue(call, 'lua_invalidCallback'))
    else {
      const last = setup.body.statements.at(-1)
      if (
        !last ||
        !ts.isReturnStatement(last) ||
        !last.expression ||
        !ts.isObjectLiteralExpression(last.expression)
      )
        diagnostics.push(issue(setup, 'lua_returnHooks'))
      else
        for (const member of last.expression.properties) {
          if (
            member.name &&
            ts.isIdentifier(member.name) &&
            member.name.text === 'methods' &&
            ts.isPropertyAssignment(member) &&
            ts.isObjectLiteralExpression(member.initializer)
          ) {
            for (const method of member.initializer.properties) {
              const fn = publicMethodFunction(method, checker, setup.body)
              const checkThis = (node: ts.Node) => {
                if (
                  node !== fn &&
                  (ts.isClassLike(node) ||
                    ts.isFunctionDeclaration(node) ||
                    ts.isFunctionExpression(node))
                )
                  return
                if (node.kind === ts.SyntaxKind.ThisKeyword)
                  diagnostics.push(issue(node, 'lua_publicMethodThis'))
                ts.forEachChild(node, checkThis)
              }
              if (fn) checkThis(fn)
              if (
                !method.name ||
                !ts.isIdentifier(method.name) ||
                !/^[A-Za-z_][A-Za-z0-9_]*$/.test(method.name.text) ||
                [...hooks.values()].includes(method.name.text) ||
                [
                  'script',
                  'game',
                  'Enum',
                  'Color',
                  'print',
                  'printerr',
                  'require',
                  'self',
                  '_ENV',
                  'math',
                  'string',
                  'table',
                  'os',
                  'debug'
                ].includes(method.name.text) ||
                !fn
              )
                diagnostics.push(issue(method, 'lua_publicMethodName'))
            }
          } else if (
            !member.name ||
            !ts.isIdentifier(member.name) ||
            !hooks.has(member.name.text) ||
            !(
              ts.isMethodDeclaration(member) ||
              (ts.isPropertyAssignment(member) &&
                (ts.isArrowFunction(member.initializer) ||
                  ts.isFunctionExpression(member.initializer)))
            )
          )
            diagnostics.push(issue(member, 'lua_dynamicHooks'))
        }
      const checkReturn = (node: ts.Node) => {
        if (node !== setup.body && ts.isFunctionLike(node)) return
        if (ts.isReturnStatement(node) && node !== last)
          diagnostics.push(issue(node, 'lua_earlyReturn'))
        ts.forEachChild(node, checkReturn)
      }
      checkReturn(setup.body)
    }
    for (const statement of source.statements) {
      if (
        ts.isImportDeclaration(statement) ||
        ts.isExportAssignment(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isEmptyStatement(statement) ||
        (ts.canHaveModifiers(statement) &&
          ts.getModifiers(statement)?.some((m) => m.kind === ts.SyntaxKind.DeclareKeyword))
      )
        continue
      diagnostics.push(issue(statement, 'lua_entryTopLevel'))
    }
  }
  const includesNil = (expression: ts.Expression) => {
    const type = checker.getTypeAtLocation(expression)
    return (type.isUnion() ? type.types : [type]).some(
      (part) => !!(part.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null))
    )
  }
  const visit = (node: ts.Node) => {
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
  cached.set(source, { lang, diagnostics })
  return diagnostics
}
