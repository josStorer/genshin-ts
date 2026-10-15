import ts from 'typescript'

import { t } from '../../i18n/index.js'
import { getLuaBuiltins } from './builtins.js'
import { standardLibraryDiagnostic } from './standard-library.js'
import { diagnostic, entryCall, hooks, nodeGraphCalls } from './syntax.js'

/** 编译器、ESLint 和编辑器共用的 Lua 规则，不加载 TSTL。 */
export function getLuaDiagnostics(source: ts.SourceFile, program: ts.Program): ts.Diagnostic[] {
  const checker = program.getTypeChecker()
  const builtins = getLuaBuiltins(program)
  const diagnostics: ts.Diagnostic[] = []
  for (const call of nodeGraphCalls(source))
    diagnostics.push(diagnostic(call, t('lua_importGraphEntry')))
  const call = entryCall(source)
  if (call) {
    if (!builtins.isEntryCall(call)) diagnostics.push(diagnostic(call, t('lua_invalidEntry')))
    const setup = call.arguments[call.arguments.length - 1]
    if (
      call.arguments.length < 1 ||
      call.arguments.length > 2 ||
      (call.arguments.length === 2 &&
        (!ts.isObjectLiteralExpression(call.arguments[0]) || call.arguments[0].properties.length))
    )
      diagnostics.push(diagnostic(call, t('lua_optionsEmpty')))
    if (
      !setup ||
      !(ts.isArrowFunction(setup) || ts.isFunctionExpression(setup)) ||
      !ts.isBlock(setup.body) ||
      setup.parameters.length > 1 ||
      (setup.parameters[0] && !ts.isIdentifier(setup.parameters[0].name))
    )
      diagnostics.push(diagnostic(call, t('lua_invalidCallback')))
    else {
      const last = setup.body.statements.at(-1)
      if (
        !last ||
        !ts.isReturnStatement(last) ||
        !last.expression ||
        !ts.isObjectLiteralExpression(last.expression)
      )
        diagnostics.push(diagnostic(setup, t('lua_returnHooks')))
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
              const fn = ts.isPropertyAssignment(method) ? method.initializer : method
              const checkThis = (node: ts.Node) => {
                if (
                  node !== fn &&
                  (ts.isClassLike(node) ||
                    ts.isFunctionDeclaration(node) ||
                    ts.isFunctionExpression(node))
                )
                  return
                if (node.kind === ts.SyntaxKind.ThisKeyword)
                  diagnostics.push(diagnostic(node, t('lua_publicMethodThis')))
                ts.forEachChild(node, checkThis)
              }
              checkThis(fn)
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
                !(
                  ts.isMethodDeclaration(method) ||
                  (ts.isPropertyAssignment(method) &&
                    (ts.isArrowFunction(method.initializer) ||
                      ts.isFunctionExpression(method.initializer)))
                )
              )
                diagnostics.push(diagnostic(method, t('lua_publicMethodName')))
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
            diagnostics.push(diagnostic(member, t('lua_dynamicHooks')))
        }
      const checkReturn = (node: ts.Node) => {
        if (node !== setup.body && ts.isFunctionLike(node)) return
        if (ts.isReturnStatement(node) && node !== last)
          diagnostics.push(diagnostic(node, t('lua_earlyReturn')))
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
      diagnostics.push(diagnostic(statement, t('lua_entryTopLevel')))
    }
  }
  const visit = (node: ts.Node) => {
    const standard = standardLibraryDiagnostic(node, checker, builtins)
    if (standard) diagnostics.push(standard)
    if (ts.isCallExpression(node) && node !== call && builtins.isEntryCall(node))
      diagnostics.push(diagnostic(node, t('lua_nestedEntry')))
    if (
      ts.isIdentifier(node) &&
      node.text === '_ENV' &&
      (ts.isVariableDeclaration(node.parent) ||
        ts.isParameter(node.parent) ||
        ts.isFunctionDeclaration(node.parent)) &&
      node.parent.name === node
    )
      diagnostics.push(diagnostic(node, t('lua_reservedEnv')))
    if (
      (ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node) ||
        ts.isMethodDeclaration(node)) &&
      (('asteriskToken' in node && node.asteriskToken) ||
        ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword))
    )
      diagnostics.push(diagnostic(node, t('lua_asyncFunction')))
    if (
      ts.isVariableDeclaration(node) &&
      ts.isObjectBindingPattern(node.name) &&
      node.initializer &&
      checker.getTypeAtLocation(node.initializer).getSymbol() === builtins.clientGlobals &&
      (node.name.elements.some((e) => e.dotDotDotToken) || !ts.isIdentifier(node.initializer))
    )
      diagnostics.push(diagnostic(node, t('lua_spreadEnvironment')))
    if (
      ts.isAwaitExpression(node) ||
      ts.isYieldExpression(node) ||
      ts.isBigIntLiteral(node) ||
      (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
    )
      diagnostics.push(diagnostic(node, t('lua_unsupportedSyntax')))
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
        diagnostics.push(diagnostic(condition, t('lua_truthiness'), true))
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      (ts.isElementAccessExpression(node.left) || ts.isPropertyAccessExpression(node.left))
    ) {
      const type = checker.getTypeAtLocation(node.right)
      const parts = type.isUnion() ? type.types : [type]
      if (parts.some((t) => t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)))
        diagnostics.push(diagnostic(node, t('lua_nil'), true))
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return diagnostics
}
