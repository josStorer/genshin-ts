import ts from 'typescript'

import { getCliLanguage, t } from '../../../i18n/index.js'
import { getLuaBuiltins, scopedGlobals } from './builtins.js'
import type { LuaDiagnosticContext } from './diagnostic_context.js'
import { unsupportedLuaSyntax } from './diagnostic_messages.js'
import { analyzeLuaEntry, entryDiagnosticRules } from './entry_analysis.js'
import { nativeDeclarationDiagnostics } from './native_declarations.js'
import { getSharedModuleDiagnostics } from './shared_modules.js'
import { standardLibraryDiagnostic } from './standard_library.js'
import { diagnostic, entryCall, nodeGraphCalls, scriptEntryOf } from './syntax.js'

export { getSharedModuleDiagnostics, resolveSharedProject } from './shared_modules.js'
export { arrangeLuaCompletions } from './completions.js'

const ruleByMessage = {
  lua_importGraphEntry: 'lua-no-graph-entry',
  lua_importEntry: 'lua-entry-default-value',
  ...entryDiagnosticRules,
  lua_nestedEntry: 'lua-entry-declaration',
  lua_listenerOwnership: 'lua-listener-ownership',
  lua_variableOwnership: 'lua-listener-ownership',
  lua_enableSubscription: 'lua-on-enable-subscription',
  lua_reservedEnv: 'lua-reserved-env',
  lua_asyncFunction: 'lua-no-async',
  lua_spreadEnvironment: 'lua-environment-destructuring',
  lua_unsupportedSyntax: 'lua-unsupported-syntax',
  lua_truthiness: 'lua-truthiness',
  lua_nil: 'lua-nil-assignment',
  lua_undefinedField: 'lua-no-undefined-field',
  lua_arrayHole: 'lua-no-array-hole',
  lua_deleteArray: 'lua-no-array-delete',
  lua_bigint: 'lua-no-bigint',
  lua_caughtObject: 'lua-thrown-value',
  lua_thrownObject: 'lua-thrown-value',
  lua_findScriptEntry: 'lua-find-script'
} as const

export const luaLintRules = [
  ...new Set(
    Object.values(ruleByMessage).filter(
      (name) => name !== 'lua-truthiness' && name !== 'lua-nil-assignment'
    )
  ),
  'lua-native-multi-return',
  'lua-native-this',
  'lua-standard-library',
  'lua-unavailable-global',
  'lua-shared-module'
] as const
export const luaWarningRules: readonly string[] = [
  'lua-on-enable-subscription',
  'lua-no-undefined-field',
  'lua-no-array-hole',
  'lua-no-array-delete',
  'lua-thrown-value'
]
const diagnosticCache = new WeakMap<
  LuaDiagnosticContext,
  WeakMap<ts.SourceFile, { lang: string; diagnostics: ts.Diagnostic[] }>
>()
function issue(node: ts.Node, key: keyof typeof ruleByMessage, warning = false) {
  return { ...diagnostic(node, t(key), warning), source: ruleByMessage[key] }
}

/** 编译器、ESLint 和编辑器共用的 Lua 规则和入口分析结果。 */
export function getLuaDiagnostics(
  source: ts.SourceFile,
  context: LuaDiagnosticContext
): ts.Diagnostic[] {
  const { program } = context
  if (source.isDeclarationFile)
    return nativeDeclarationDiagnostics(source, program.getTypeChecker())
  const lang = getCliLanguage()
  let cached = diagnosticCache.get(context)
  if (!cached) {
    cached = new WeakMap()
    diagnosticCache.set(context, cached)
  }
  const previous = cached.get(source)
  if (previous?.lang === lang) return previous.diagnostics
  const checker = program.getTypeChecker()
  const builtins = getLuaBuiltins(program)
  const diagnostics: ts.Diagnostic[] = [...getSharedModuleDiagnostics(source, context)]
  const sharedSites = new Set(
    diagnostics.filter((d) => d.source === 'lua-shared-module').map((d) => `${d.start}:${d.length}`)
  )
  for (const call of nodeGraphCalls(source)) diagnostics.push(issue(call, 'lua_importGraphEntry'))
  const analysis = analyzeLuaEntry(source, program)
  diagnostics.push(...analysis.diagnostics)
  // 回调写法不合法时没有模型，仍以发现到的入口为准，避免把它误报成"嵌套入口"。
  const call = analysis.model?.call ?? entryCall(source)
  const includesNil = (expression: ts.Expression) => {
    const type = checker.getTypeAtLocation(expression)
    return (type.isUnion() ? type.types : [type]).some(
      (part) => !!(part.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null))
    )
  }
  // 宿主把抛出的任何值都转成文字（2026-10-24 实机），catch 拿到的总是字符串。
  const caught = (expression: ts.Expression) => {
    const declaration = ts.isIdentifier(expression)
      ? checker.getSymbolAtLocation(expression)?.valueDeclaration
      : undefined
    return (
      !!declaration && ts.isVariableDeclaration(declaration) && ts.isCatchClause(declaration.parent)
    )
  }
  const stringMembers = checker.getApparentType(checker.getStringType())
  const notString = (type: ts.Type) =>
    (type.isUnion() ? type.types : [type]).some(
      (part) => !(part.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.Unknown))
    )
  const managedSignals: (string | undefined)[] = []
  const rawSignals: { name: string | undefined; node: ts.Node }[] = []
  const managedVariables: (string | undefined)[] = []
  const rawVariables: { name: string | undefined; node: ts.Node }[] = []
  const onEnable = analysis.model?.hooks.get('onEnable')?.definition
  const subscriptionMember = (expression: ts.Expression) => {
    const seen = new Set<ts.Symbol>()
    let node = expression
    for (;;) {
      const member = builtins.member(node)
      if (member) return member
      const symbol = checker.getSymbolAtLocation(node)
      const declaration = symbol?.valueDeclaration
      if (
        !symbol ||
        seen.has(symbol) ||
        !declaration ||
        !ts.isVariableDeclaration(declaration) ||
        !declaration.initializer
      )
        return undefined
      seen.add(symbol)
      node = declaration.initializer
    }
  }
  const discarded = (call: ts.CallExpression) => {
    let node: ts.Node = call
    while (
      ts.isParenthesizedExpression(node.parent) ||
      ts.isAsExpression(node.parent) ||
      ts.isNonNullExpression(node.parent) ||
      ts.isVoidExpression(node.parent)
    )
      node = node.parent
    return (
      ts.isExpressionStatement(node.parent) ||
      (ts.isReturnStatement(node.parent) &&
        ts.findAncestor(node.parent, ts.isFunctionLike) === onEnable)
    )
  }
  // 只有本文件导入的名字可能读取别的入口；普通标识符不为这条规则查符号。
  const importedNames = new Set<string>()
  const namespaceNames = new Set<string>()
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || statement.importClause?.isTypeOnly) continue
    const clause = statement.importClause
    if (clause?.name) importedNames.add(clause.name.text)
    const named = clause?.namedBindings
    if (named && ts.isNamespaceImport(named)) namespaceNames.add(named.name.text)
    else if (named)
      for (const item of named.elements) if (!item.isTypeOnly) importedNames.add(item.name.text)
  }
  const importedValue = (node: ts.Node) => {
    if (ts.isIdentifier(node)) return importedNames.has(node.text)
    if (!ts.isPropertyAccessExpression(node) && !ts.isElementAccessExpression(node)) return false
    let root: ts.Expression = node.expression
    while (
      ts.isParenthesizedExpression(root) ||
      ts.isAsExpression(root) ||
      ts.isSatisfiesExpression(root) ||
      ts.isNonNullExpression(root)
    )
      root = root.expression
    return ts.isIdentifier(root) && namespaceNames.has(root.text)
  }
  const visit = (node: ts.Node) => {
    // 类型查询和 import 声明本身不读取运行时值；默认入口只用于 scriptHandle 的类型。
    if (
      importedValue(node) &&
      !ts.findAncestor(
        node,
        (ancestor) => ts.isTypeNode(ancestor) || ts.isImportDeclaration(ancestor)
      ) &&
      !(
        ts.isIdentifier(node) &&
        ts.isPropertyAccessExpression(node.parent) &&
        node.parent.name === node
      )
    ) {
      const symbol = builtins.symbolAt(node)
      const declaration = symbol?.valueDeclaration
      if (
        declaration &&
        ts.isExportAssignment(declaration) &&
        entryCall(declaration.getSourceFile()) === declaration.expression
      )
        diagnostics.push(issue(node, 'lua_importEntry'))
    }
    const unsupported = unsupportedLuaSyntax(node)
    if (unsupported)
      diagnostics.push({ ...diagnostic(node, unsupported), source: 'lua-unsupported-syntax' })
    if (ts.isCallExpression(node)) {
      const member = builtins.member(node.expression)
      const subscribed = subscriptionMember(node.expression)
      if (
        subscribed &&
        scopedGlobals.has(subscribed) &&
        onEnable &&
        ts.findAncestor(node, (parent) => parent === onEnable) &&
        discarded(node)
      )
        diagnostics.push(issue(node, 'lua_enableSubscription', true))
      if ((member === 'findScript' || member === 'requireScript') && !scriptEntryOf(node, checker))
        diagnostics.push(issue(node, 'lua_findScriptEntry'))
      const argument = node.arguments[0]
      if (member === 'onSignal') {
        const name = argument && checker.getTypeAtLocation(argument).getProperty('name')
        const type = name && checker.getTypeOfSymbolAtLocation(name, argument)
        managedSignals.push(type?.isStringLiteral() ? type.value : undefined)
      }
      const variable = node.arguments[1]
      if (member === 'onVariable')
        managedVariables.push(
          variable && ts.isStringLiteralLike(variable) ? variable.text : undefined
        )
      if (member === 'rawVariableHandler')
        rawVariables.push({
          node,
          name: variable && ts.isStringLiteralLike(variable) ? variable.text : undefined
        })
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
      ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)
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
      (ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword &&
        caught(node.left)) ||
      ((ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) &&
        caught(node.expression) &&
        notString(checker.getTypeFromTypeNode(node.type))) ||
      (ts.isPropertyAccessExpression(node) &&
        caught(node.expression) &&
        !stringMembers.getProperty(node.name.text) &&
        notString(checker.getTypeAtLocation(node.expression))) ||
      (ts.isElementAccessExpression(node) &&
        caught(node.expression) &&
        notString(checker.getTypeAtLocation(node.expression)))
    )
      diagnostics.push(issue(node, 'lua_caughtObject', true))
    if (
      ts.isCatchClause(node) &&
      node.variableDeclaration &&
      !ts.isIdentifier(node.variableDeclaration.name)
    )
      diagnostics.push(issue(node.variableDeclaration, 'lua_caughtObject', true))
    if (ts.isThrowStatement(node)) {
      const type = checker.getTypeAtLocation(node.expression)
      // Error 的消息会留在文字里；其他对象和数字会丢掉类型与字段。
      const lost = (type.isUnion() ? type.types : [type]).some(
        (part) =>
          !(part.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.Any | ts.TypeFlags.Unknown)) &&
          !(part.getProperty('name') && part.getProperty('message'))
      )
      if (lost) diagnostics.push(issue(node.expression, 'lua_thrownObject', true))
    }
    if (
      ts.isBigIntLiteral(node) ||
      node.kind === ts.SyntaxKind.BigIntKeyword ||
      (ts.isIdentifier(node) && builtins.global(node) === 'BigInt')
    )
      if (!sharedSites.has(`${node.getStart()}:${node.getWidth()}`))
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
        diagnostics.push(issue(condition, 'lua_truthiness'))
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
  for (const raw of rawVariables)
    if (
      managedVariables.some(
        (name) => name === undefined || raw.name === undefined || name === raw.name
      )
    )
      diagnostics.push(issue(raw.node, 'lua_variableOwnership'))
  cached.set(source, { lang, diagnostics })
  return diagnostics
}
