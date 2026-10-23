import ts from 'typescript'

import { getCliLanguage, t } from '../../i18n/index.js'
import { getLuaBuiltins } from './builtins.js'
import type { LuaEntryAnalysis, LuaEntryFunction, LuaEntryModel } from './entry_model.js'
import { luaTimerGlobals } from './standard_library.js'
import { diagnostic, entryCall, hooks } from './syntax.js'
import { functionNeedsSelf } from './tstl_compat.js'

const analyses = new WeakMap<
  ts.Program,
  WeakMap<ts.SourceFile, { lang: string; result: LuaEntryAnalysis }>
>()
export const entryDiagnosticRules = {
  lua_invalidEntry: 'lua-entry-declaration',
  lua_optionsEmpty: 'lua-entry-options',
  lua_invalidCallback: 'lua-entry-callback',
  lua_literalHooks: 'lua-entry-return',
  lua_dynamicHooks: 'lua-entry-return',
  lua_hookFunction: 'lua-hook-function',
  lua_earlyReturn: 'lua-entry-return',
  lua_publicMethodThis: 'lua-public-methods',
  lua_publicMethodName: 'lua-public-methods',
  lua_graphApi: 'lua-graph-api',
  lua_instanceScope: 'lua-instance-scope'
} as const
const reservedMethods = new Set([
  ...hooks.values(),
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
])

/** 每个 Program/源码只分析一次；编辑器、lint 和生成器共用结果。 */
export function analyzeLuaEntry(source: ts.SourceFile, program: ts.Program): LuaEntryAnalysis {
  let cache = analyses.get(program)
  if (!cache) {
    cache = new WeakMap()
    analyses.set(program, cache)
  }
  const lang = getCliLanguage()
  const cached = cache.get(source)
  if (cached?.lang === lang) return cached.result
  const original = ts.getOriginalNode(source, ts.isSourceFile)
  if (original !== source) {
    // 私有字段的 TS 预转换只替换节点身份；入口形状和分析结论保持不变。
    const analysis = analyzeLuaEntry(original, program)
    const result = remapEntry(analysis, source)
    cache.set(source, { lang, result })
    return result
  }
  const checker = program.getTypeChecker()
  const builtins = getLuaBuiltins(program)
  const diagnostics: ts.Diagnostic[] = []
  const issue = (node: ts.Node, key: keyof typeof entryDiagnosticRules, arg0?: string) => {
    diagnostics.push({ ...diagnostic(node, t(key, { arg0 })), source: entryDiagnosticRules[key] })
  }
  const call = entryCall(source)
  let model: LuaEntryModel | undefined
  let timerClock: 'level' | 'real' = 'level'
  if (call) {
    if (!builtins.isEntryCall(call)) issue(call, 'lua_invalidEntry')
    if (call.arguments.length < 1 || call.arguments.length > 2) issue(call, 'lua_optionsEmpty')
    if (call.arguments.length === 2) {
      const options = call.arguments[0]
      if (!ts.isObjectLiteralExpression(options)) issue(options, 'lua_optionsEmpty')
      else
        for (const property of options.properties) {
          if (
            ts.isPropertyAssignment(property) &&
            ts.isIdentifier(property.name) &&
            property.name.text === 'timerClock' &&
            ts.isStringLiteralLike(property.initializer) &&
            (property.initializer.text === 'level' || property.initializer.text === 'real')
          ) {
            timerClock = property.initializer.text
          } else issue(property, 'lua_optionsEmpty')
        }
    }
    const setup = call.arguments.at(-1)
    if (
      !setup ||
      !(ts.isArrowFunction(setup) || ts.isFunctionExpression(setup)) ||
      !ts.isBlock(setup.body) ||
      setup.parameters.length > 1 ||
      (setup.parameters[0] && !ts.isIdentifier(setup.parameters[0].name))
    ) {
      issue(call, 'lua_invalidCallback')
    } else {
      const returned = setup.body.statements.at(-1)
      if (
        !returned ||
        !ts.isReturnStatement(returned) ||
        !returned.expression ||
        !ts.isObjectLiteralExpression(returned.expression)
      ) {
        issue(setup, 'lua_literalHooks')
      } else {
        const hookMap = new Map<string, LuaEntryFunction>()
        const methods = new Map<string, LuaEntryFunction>()
        for (const member of returned.expression.properties) {
          if (
            member.name &&
            ts.isIdentifier(member.name) &&
            member.name.text === 'methods' &&
            ts.isPropertyAssignment(member) &&
            ts.isObjectLiteralExpression(member.initializer)
          ) {
            for (const method of member.initializer.properties) {
              const definition = publicMethodFunction(method, checker, setup.body)
              if (
                !definition ||
                !method.name ||
                !ts.isIdentifier(method.name) ||
                !/^[A-Za-z_][A-Za-z0-9_]*$/.test(method.name.text) ||
                reservedMethods.has(method.name.text)
              ) {
                issue(method, 'lua_publicMethodName')
                continue
              }
              const checkThis = (node: ts.Node) => {
                if (
                  node !== definition &&
                  (ts.isClassLike(node) ||
                    ts.isFunctionDeclaration(node) ||
                    ts.isFunctionExpression(node))
                )
                  return
                if (node.kind === ts.SyntaxKind.ThisKeyword) issue(node, 'lua_publicMethodThis')
                ts.forEachChild(node, checkThis)
              }
              checkThis(definition)
              methods.set(method.name.text, {
                member: method,
                definition,
                removeSelf: functionNeedsSelf(program, method)
              })
            }
          } else if (
            !member.name ||
            !ts.isIdentifier(member.name) ||
            !hooks.has(member.name.text)
          ) {
            issue(member, 'lua_dynamicHooks')
          } else {
            const definition = ts.isMethodDeclaration(member)
              ? member
              : ts.isPropertyAssignment(member) &&
                  (ts.isArrowFunction(member.initializer) ||
                    ts.isFunctionExpression(member.initializer))
                ? member.initializer
                : undefined
            if (!definition) issue(member, 'lua_hookFunction', member.name.text)
            else hookMap.set(member.name.text, { member, definition, removeSelf: false })
          }
        }
        const sharedStatements = source.statements.filter((statement) => statement !== call.parent)
        const bindings: ts.Identifier[] = []
        const bindName = (name: ts.BindingName) => {
          if (ts.isIdentifier(name)) bindings.push(name)
          else
            for (const element of name.elements)
              if (ts.isBindingElement(element)) bindName(element.name)
        }
        for (const statement of sharedStatements) {
          if (ts.isVariableStatement(statement))
            for (const declaration of statement.declarationList.declarations)
              bindName(declaration.name)
          else if (
            (ts.isFunctionDeclaration(statement) ||
              ts.isClassDeclaration(statement) ||
              ts.isEnumDeclaration(statement)) &&
            statement.name
          )
            bindings.push(statement.name)
        }
        model = {
          source,
          shared: {
            aliases: sharedStatements.flatMap((statement) =>
              ts.isExportDeclaration(statement) &&
              !statement.moduleSpecifier &&
              statement.exportClause &&
              ts.isNamedExports(statement.exportClause)
                ? statement.exportClause.elements
                    .filter((item) => !item.isTypeOnly)
                    .map((item) => item.name.text)
                : []
            ),
            runtime: sharedStatements.some((statement) => {
              if (
                ts.isImportDeclaration(statement) ||
                ts.isTypeAliasDeclaration(statement) ||
                ts.isInterfaceDeclaration(statement) ||
                ts.isEmptyStatement(statement)
              )
                return false
              if (ts.isExportDeclaration(statement)) {
                if (statement.isTypeOnly) return false
                if (statement.exportClause && ts.isNamedExports(statement.exportClause))
                  return statement.exportClause.elements.some((item) => {
                    if (item.isTypeOnly) return false
                    const symbol = checker.getSymbolAtLocation(item.name)
                    const target =
                      symbol &&
                      (symbol.flags & ts.SymbolFlags.Alias
                        ? checker.getAliasedSymbol(symbol)
                        : symbol)
                    return !!target && !!(target.flags & ts.SymbolFlags.Value)
                  })
                return true
              }
              if (ts.isFunctionDeclaration(statement) && !statement.body) return false
              return !(
                ts.canHaveModifiers(statement) &&
                ts.getModifiers(statement)?.some((m) => m.kind === ts.SyntaxKind.DeclareKeyword)
              )
            }),
            statements: sharedStatements,
            bindings
          },
          call,
          setup,
          environment: setup.parameters[0]?.name as ts.Identifier | undefined,
          options: { timerClock },
          hooks: hookMap,
          methods,
          statements: setup.body.statements.slice(0, -1),
          returned,
          scope: { signals: false, keys: false, timers: false },
          timerClocks: new Set()
        }
      }
      const checkReturn = (node: ts.Node) => {
        if (node !== setup.body && ts.isFunctionLike(node)) return
        if (ts.isReturnStatement(node) && node !== returned) issue(node, 'lua_earlyReturn')
        ts.forEachChild(node, checkReturn)
      }
      checkReturn(setup.body)
    }
  }
  const timerClocks = new Set<'level' | 'real'>()
  const markCapability = (
    node: ts.Node,
    member: string | undefined,
    global: string | undefined,
    instance: boolean
  ) => {
    const clockHelper = member === 'clockTimeout' || member === 'clockInterval'
    const capability =
      member === 'onSignal'
        ? 'signals'
        : member === 'listenKey'
          ? 'keys'
          : clockHelper || luaTimerGlobals.some((name) => name === global)
            ? 'timers'
            : undefined
    if (instance && capability && model) {
      model.scope[capability] = true
      if (global === 'setTimeout' || global === 'setInterval') timerClocks.add(timerClock)
      if (clockHelper) {
        const call = node.parent
        const arg =
          ts.isCallExpression(call) && call.expression === node ? call.arguments[2] : undefined
        const type = arg && checker.getTypeAtLocation(arg)
        if (type?.isStringLiteral() && (type.value === 'real' || type.value === 'level'))
          timerClocks.add(type.value)
        else {
          timerClocks.add('real')
          timerClocks.add('level')
        }
      }
    }
    if (
      !instance &&
      (capability ||
        global === 'self' ||
        global === 'send' ||
        member === 'script' ||
        member === 'self')
    )
      issue(node, 'lua_instanceScope')
  }
  const visit = (node: ts.Node, instance = false) => {
    if (node === model?.setup) instance = true
    if (ts.isTypeNode(node)) return
    if (ts.isImportDeclaration(node)) {
      if (
        node.importClause?.isTypeOnly ||
        builtins.modules.get(builtins.symbolAt(node.moduleSpecifier)!) !== 'core'
      )
        return
      const named = node.importClause?.namedBindings
      if (named && ts.isNamedImports(named))
        for (const item of named.elements) {
          const name = (item.propertyName ?? item.name).text
          if (!item.isTypeOnly && name !== 'g' && name !== 'defineSignal')
            issue(item, 'lua_graphApi', name)
        }
      return
    }
    if (
      ts.isIdentifier(node) ||
      ts.isPropertyAccessExpression(node) ||
      ts.isElementAccessExpression(node)
    ) {
      if (
        ts.isIdentifier(node) &&
        ts.isPropertyAccessExpression(node.parent) &&
        node.parent.name === node
      )
        return
      const member = builtins.member(node),
        global = builtins.global(node)
      markCapability(node, member, global, instance)
    }
    if (ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent)) {
      const declaration = node.parent.parent
      const name = node.propertyName ?? node.name
      if (
        ts.isVariableDeclaration(declaration) &&
        declaration.initializer &&
        ts.isIdentifier(name)
      ) {
        const property = checker.getTypeAtLocation(declaration.initializer).getProperty(name.text)
        if (property) markCapability(node, builtins.members.get(property), undefined, instance)
      }
    }
    ts.forEachChild(node, (child) => visit(child, instance))
  }
  visit(source)
  if (model) model.timerClocks = timerClocks
  const result = { model, diagnostics }
  cache.set(source, { lang, result })
  return result
}

/** 预转换后的节点只做身份映射，不再解析入口的选项、钩子或方法。 */
function remapEntry(analysis: LuaEntryAnalysis, source: ts.SourceFile): LuaEntryAnalysis {
  if (!analysis.model) return analysis
  const nodes = new Map<ts.Node, ts.Node>()
  const visit = (node: ts.Node) => {
    nodes.set(ts.getOriginalNode(node), node)
    ts.forEachChild(node, visit)
  }
  visit(source)
  const remap = <T extends ts.Node>(node: T): T => (nodes.get(node) ?? node) as T
  const functions = (items: ReadonlyMap<string, LuaEntryFunction>) =>
    new Map(
      [...items].map(
        ([name, fn]) =>
          [name, { ...fn, member: remap(fn.member), definition: remap(fn.definition) }] as const
      )
    )
  const model = analysis.model
  return {
    diagnostics: analysis.diagnostics,
    model: {
      ...model,
      source,
      shared: {
        ...model.shared,
        statements: model.shared.statements.map(remap),
        bindings: model.shared.bindings.map(remap)
      },
      call: remap(model.call),
      setup: remap(model.setup),
      environment: model.environment && remap(model.environment),
      hooks: functions(model.hooks),
      methods: functions(model.methods),
      statements: model.statements.map(remap),
      returned: remap(model.returned)
    }
  }
}

/** 公开方法可内联，也可引用当前入口回调中声明的函数；不接收需要对象上下文的方法。 */
function publicMethodFunction(
  member: ts.ObjectLiteralElementLike,
  checker: ts.TypeChecker,
  body: ts.ConciseBody
):
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.ArrowFunction
  | ts.MethodDeclaration
  | undefined {
  if (ts.isMethodDeclaration(member)) return member
  const value = ts.isPropertyAssignment(member) ? member.initializer : undefined
  if (value && (ts.isArrowFunction(value) || ts.isFunctionExpression(value))) return value
  const symbol = ts.isShorthandPropertyAssignment(member)
    ? checker.getShorthandAssignmentValueSymbol(member)
    : value && ts.isIdentifier(value)
      ? checker.getSymbolAtLocation(value)
      : undefined
  const declaration = symbol?.valueDeclaration
  if (
    declaration &&
    ts.isFunctionDeclaration(declaration) &&
    declaration.parent === body &&
    declaration.body
  )
    return declaration
  if (
    declaration &&
    ts.isVariableDeclaration(declaration) &&
    declaration.parent.parent.parent === body &&
    declaration.initializer &&
    (ts.isArrowFunction(declaration.initializer) ||
      ts.isFunctionExpression(declaration.initializer))
  )
    return declaration.initializer
  return undefined
}
