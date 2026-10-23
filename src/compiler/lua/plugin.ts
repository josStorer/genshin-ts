import path from 'node:path'

import type { RawSourceMap } from 'source-map'
import ts from 'typescript'
import * as lua from 'typescript-to-lua'

import { getLuaBuiltins, numberConstants, scopedHelperMethods } from './builtins.js'
import { luaDataConstant, luaDataModule } from './data_modules.js'
import { analyzeLuaEntry } from './entry_analysis.js'
import type { LuaEntryModel } from './entry_model.js'
import {
  bindSharedState,
  finishSharedEntry,
  rewriteSharedDeclarations,
  sharedEntryFile,
  sharedEntryModule,
  syncSharedWrites,
  type SharedState
} from './entry_shared.js'
import { generateScopeHooks } from './scope_hooks.js'
import { luaTimerGlobals } from './standard_library.js'
import { hooks } from './syntax.js'
import {
  ContextType,
  discardAdaptedCallbackDiagnostics,
  getFunctionContextType,
  transformOrderedExpressions,
  transformSharedSource
} from './tstl_compat.js'

export { entryCall, diagnostic, hooks } from './syntax.js'
const id = lua.createIdentifier
const str = lua.createStringLiteral
const field = (target: lua.Expression, name: string) =>
  lua.createTableIndexExpression(target, str(name))
const requireModule = (name: string) =>
  lua.createCallExpression(id('require'), [str(`@NoResolution:${name}`)])
const importModule = (name: string | undefined) =>
  name === undefined
    ? lua.createTableExpression()
    : name.startsWith('__gsts_shared/')
      ? field(requireModule(name), 'exports')
      : requireModule(name)

/** 一个文件的生成状态；导入、前导声明和重导出只在本文件内共享。 */
interface LuaFileContext {
  entry?: LuaEntryModel
  prelude: lua.Statement[]
  bindings: Map<ts.Symbol, lua.Expression>
  getters: lua.TableFieldExpression[]
  helper?: lua.Identifier
  scope?: lua.Identifier
  dataBindings: Map<ts.Symbol, { module: string; key?: string }>
  dataLocals: Map<string, lua.Identifier>
  adaptedCallbacks: Set<ts.Node>
  sharedAliases?: ReadonlySet<string>
  shared?: SharedState
}

export function createLuaPlugin(
  resolve: (name: string, source: string) => string | undefined,
  nativeDefault: (name: string, source: string) => boolean = () => false,
  rootDir = '.'
): lua.Plugin {
  const sharedFiles = new Map<string, { source: ts.SourceFile; ast: lua.File }>()
  const files = new WeakMap<ts.SourceFile, LuaFileContext>()
  const file = (ctx: lua.TransformationContext) => files.get(ctx.sourceFile)!
  function scope(ctx: lua.TransformationContext) {
    let local = file(ctx).scope
    if (!local) {
      local = id(ctx.createTempName('scope'))
      file(ctx).scope = local
      helpers(ctx)
    }
    return local
  }
  function scopedUpdate(node: ts.Expression, ctx: lua.TransformationContext) {
    if (!(ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))) return false
    const builtins = getLuaBuiltins(ctx.program)
    if (builtins.member(node) !== 'enableUpdate' || !builtins.isCurrentScript(node.expression))
      return false
    const model = file(ctx).entry
    return !!model && (model.scope.signals || model.scope.keys || model.scope.timers)
  }
  // 方法引用仍接收 TSTL 的 self 槽，实际开关归属当前挂载的作用域。
  function updateReference(ctx: lua.TransformationContext) {
    const enabled = id('enabled')
    return lua.createFunctionExpression(
      lua.createBlock([
        lua.createExpressionStatement(
          lua.createCallExpression(field(scope(ctx), 'enableUpdate'), [enabled])
        )
      ]),
      [id('_'), enabled]
    )
  }
  function dataReference(
    node: ts.Expression,
    ctx: lua.TransformationContext
  ): { module: string; key?: string } | undefined {
    if (ts.isIdentifier(node)) {
      const symbol = ctx.checker.getSymbolAtLocation(node)
      return symbol && file(ctx).dataBindings.get(symbol)
    }
    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
      const parent = dataReference(node.expression, ctx)
      const key = ts.isPropertyAccessExpression(node)
        ? node.name.text
        : ts.isStringLiteralLike(node.argumentExpression)
          ? node.argumentExpression.text
          : undefined
      if (parent && !parent.key && key) return { module: parent.module, key }
    }
    return undefined
  }
  function dataValue(reference: { module: string; key?: string }, ctx: lua.TransformationContext) {
    const module = `__gsts_data.${reference.module}${reference.key ? '.' + reference.key : ''}`
    const locals = file(ctx).dataLocals
    let local = locals.get(module)
    if (!local) {
      local = id(ctx.createTempName('data'))
      locals.set(module, local)
      file(ctx).prelude.push(lua.createVariableDeclarationStatement(local, requireModule(module)))
    }
    return local
  }
  function dataAccess(
    node: ts.PropertyAccessExpression | ts.ElementAccessExpression,
    ctx: lua.TransformationContext
  ) {
    const root = dataReference(node.expression, ctx)
    const staticKey =
      ts.isPropertyAccessExpression(node) ||
      ts.isStringLiteralLike(node.argumentExpression) ||
      ts.isNumericLiteral(node.argumentExpression)
    if (root && staticKey) {
      const key = ts.isPropertyAccessExpression(node)
        ? node.name.text
        : (node.argumentExpression as ts.StringLiteral | ts.NumericLiteral).text
      const constant = root.key ? luaDataConstant(root.module, root.key, key) : undefined
      if (typeof constant === 'number') return lua.createNumericLiteral(constant, node)
      if (typeof constant === 'string') return str(constant, node)
      if (typeof constant === 'boolean') return lua.createBooleanLiteral(constant, node)
      const type = ctx.checker.getTypeAtLocation(node)
      if (type.isNumberLiteral()) return lua.createNumericLiteral(type.value, node)
      if (type.isStringLiteral()) return str(type.value, node)
    }
    const reference = dataReference(node, ctx)
    return reference ? dataValue(reference, ctx) : undefined
  }
  function helpers(ctx: lua.TransformationContext) {
    let local = file(ctx).helper
    if (!local) {
      local = id(ctx.createTempName('helpers'))
      file(ctx).helper = local
    }
    return local
  }
  // TSTL's standard array helpers pass a receiver slot even when the TS function does not use one.
  function adaptBuiltinCallback(
    node: ts.Expression,
    value: lua.Expression,
    ctx: lua.TransformationContext
  ) {
    const call = node.parent
    if (!call || !ts.isCallExpression(call)) return value
    const index = call.arguments.indexOf(node)
    const parameter = ctx.checker.getResolvedSignature(call)?.parameters[index]
    if (index < 0 || !parameter?.declarations?.some((d) => d.getSourceFile().hasNoDefaultLib))
      return value
    const expected = ctx.checker.getTypeOfSymbolAtLocation(parameter, call)
    if (
      getFunctionContextType(ctx, expected) !== ContextType.NonVoid ||
      getFunctionContextType(ctx, ctx.checker.getTypeAtLocation(node)) !== ContextType.Void
    )
      return value
    const callback = id(ctx.createTempName('callback'))
    ctx.addPrecedingStatements(lua.createVariableDeclarationStatement(callback, value, node))
    file(ctx).adaptedCallbacks.add(ts.getOriginalNode(node))
    return lua.createFunctionExpression(
      lua.createBlock([
        lua.createReturnStatement([lua.createCallExpression(callback, [lua.createDotsLiteral()])])
      ]),
      [id('_')],
      lua.createDotsLiteral()
    )
  }
  function read(node: ts.Identifier, ctx: lua.TransformationContext) {
    const symbol =
      node.parent && ts.isShorthandPropertyAssignment(node.parent)
        ? ctx.checker.getShorthandAssignmentValueSymbol(node.parent)
        : ctx.checker.getSymbolAtLocation(node)
    return symbol && file(ctx).bindings.get(symbol)
  }
  // 导入先绑定，保证声明之前的引用也使用同一个模块局部变量。
  function bindImports(node: ts.SourceFile, ctx: lua.TransformationContext) {
    const builtins = getLuaBuiltins(ctx.program)
    const prelude = file(ctx).prelude
    // Register every alias before visiting bodies. This also covers uses before import declarations.
    for (const statement of node.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
        continue
      const clause = statement.importClause
      if (clause?.isTypeOnly) continue
      const moduleName = statement.moduleSpecifier.text
      const dataModule = luaDataModule(moduleName)
      if (dataModule) {
        const named = clause?.namedBindings
        if (named && ts.isNamespaceImport(named)) {
          const symbol = ctx.checker.getSymbolAtLocation(named.name)
          if (symbol) file(ctx).dataBindings.set(symbol, { module: dataModule })
        } else if (named) {
          for (const item of named.elements) {
            if (item.isTypeOnly) continue
            const symbol = ctx.checker.getSymbolAtLocation(item.name)
            if (symbol)
              file(ctx).dataBindings.set(symbol, {
                module: dataModule,
                key: (item.propertyName ?? item.name).text
              })
          }
        }
        continue
      }
      const moduleKind = builtins.modules.get(builtins.symbolAt(statement.moduleSpecifier)!)
      const helperImport = moduleKind === 'helpers' || moduleKind === 'core'
      const table = id(ctx.createTempName('module'))
      let used = !clause
      const bind = (name: ts.Identifier, key?: string) => {
        const symbol = ctx.checker.getSymbolAtLocation(name)
        if (symbol) file(ctx).bindings.set(symbol, key ? field(table, key) : table)
        used = true
      }
      if (clause?.name && ctx.resolver.isReferencedAliasDeclaration(clause))
        bind(clause.name, nativeDefault(moduleName, node.fileName) ? undefined : 'default')
      if (clause?.namedBindings) {
        if (ts.isNamespaceImport(clause.namedBindings)) {
          if (ctx.resolver.isReferencedAliasDeclaration(clause.namedBindings))
            bind(clause.namedBindings.name)
        } else
          for (const item of clause.namedBindings.elements) {
            if (item.isTypeOnly || !ctx.resolver.isReferencedAliasDeclaration(item)) continue
            const name = (item.propertyName ?? item.name).text
            if (moduleKind === 'core' && name === 'g') continue
            const member = getLuaBuiltins(ctx.program).member(item.name)
            if (moduleKind === 'helpers' && member && scopedHelperMethods[member]) {
              const symbol = ctx.checker.getSymbolAtLocation(item.name)
              if (symbol)
                file(ctx).bindings.set(symbol, field(scope(ctx), scopedHelperMethods[member]))
              continue
            }
            bind(item.name, name)
          }
      }
      if (used && helperImport) {
        const existing = file(ctx).helper
        if (existing) {
          prelude.push(lua.createVariableDeclarationStatement(table, existing, statement))
        } else file(ctx).helper = table
      }
      if (used && !helperImport)
        prelude.push(
          lua.createVariableDeclarationStatement(
            table,
            importModule(resolve(moduleName, node.fileName)),
            statement
          )
        )
    }
  }
  function finishEntry(result: lua.File, ctx: lua.TransformationContext) {
    if (file(ctx).entry) {
      result.statements = result.statements.filter(
        (s) =>
          !(lua.isVariableDeclarationStatement(s) && s.left[0]?.text === '____exports') &&
          !(
            lua.isReturnStatement(s) &&
            s.expressions.some((e) => lua.isIdentifier(e) && e.text === '____exports')
          )
      )
    }
  }
  function generateReexports(result: lua.File, ctx: lua.TransformationContext) {
    const reexports = file(ctx).getters
    if (reexports.length) {
      const table = id(ctx.createTempName('getters'))
      result.statements.splice(
        result.statements.length - 1,
        0,
        lua.createVariableDeclarationStatement(table, lua.createTableExpression(reexports)),
        lua.createExpressionStatement(
          lua.createCallExpression(field(helpers(ctx), 'liveExports'), [id('____exports'), table])
        )
      )
    }
  }
  function generatePrelude(result: lua.File, ctx: lua.TransformationContext) {
    const { prelude, entry } = file(ctx)
    const helper = file(ctx).helper
    if (helper)
      prelude.unshift(
        lua.createVariableDeclarationStatement(helper, requireModule('__gsts_helpers'))
      )
    const instance = file(ctx).scope
    if (instance) {
      const clock = entry?.scope.timers ? str(entry.options.timerClock) : lua.createNilLiteral()
      prelude.push(
        lua.createVariableDeclarationStatement(
          instance,
          lua.createCallExpression(field(helpers(ctx), 'createScope'), [id('_ENV'), clock])
        )
      )
      generateScopeHooks(result.statements, instance, entry!, ctx)
    }
  }
  function generateEntry(model: LuaEntryModel, ctx: lua.TransformationContext) {
    const setup = model.setup
    const transformed = ctx.transformExpression(setup)
    if (!lua.isFunctionExpression(transformed)) return []
    const body = [...transformed.body.statements]
    const last = body.pop()
    const value = last && lua.isReturnStatement(last) ? last.expressions[0] : undefined
    if (!value || !lua.isTableExpression(value))
      throw new Error('Validated Lua entry did not produce a hook table')
    if (transformed.params?.length)
      body.unshift(lua.createVariableDeclarationStatement(transformed.params[0], id('_ENV')))
    for (const member of value.fields) {
      const name = member.key && lua.isStringLiteral(member.key) ? member.key.value : ''
      if (name === 'methods' && lua.isTableExpression(member.value)) {
        for (const method of member.value.fields) {
          if (method.key && lua.isStringLiteral(method.key)) {
            const original = model.methods.get(method.key.value)
            if (lua.isFunctionExpression(method.value) && original?.removeSelf)
              method.value.params?.shift()
            if (lua.isFunctionExpression(method.value))
              method.value.flags |= lua.NodeFlags.Declaration
            body.push(
              lua.createAssignmentStatement(field(id('_ENV'), method.key.value), method.value)
            )
          }
        }
        continue
      }
      const globalName = model.hooks.has(name) ? hooks.get(name) : undefined
      if (!globalName || !lua.isFunctionExpression(member.value))
        throw new Error('Validated Lua hook did not produce a function')
      member.value.flags |= lua.NodeFlags.Declaration
      body.push(lua.createAssignmentStatement(field(id('_ENV'), globalName), member.value))
    }
    return body
  }
  // TSTL 会为 export { value as alias } 追加赋值；共享状态的导出由同一处同步。
  // 只处理赋值转换器直接返回/前置的语句，不遍历或反射改写整棵 Lua AST。
  function withoutAliasWrites(statements: lua.Statement[], ctx: lua.TransformationContext) {
    const aliases = file(ctx).sharedAliases
    if (!aliases?.size) return statements
    return statements.filter((statement) => {
      if (!lua.isAssignmentStatement(statement) || statement.left.length !== 1) return true
      const target = statement.left[0]
      return !(
        lua.isTableIndexExpression(target) &&
        lua.isIdentifier(target.table) &&
        target.table.text === '____exports' &&
        lua.isStringLiteral(target.index) &&
        aliases.has(target.index.value)
      )
    })
  }
  // 自增/赋值表达式可能先把状态表存进 TSTL 临时变量；从 TS 左值确认导出名。
  function sharedExportWrites(node: ts.Expression, ctx: lua.TransformationContext) {
    const shared = file(ctx).shared
    if (!shared) return []
    const target =
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
      node.operatorToken.kind <= ts.SyntaxKind.LastAssignment
        ? node.left
        : (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
            (node.operator === ts.SyntaxKind.PlusPlusToken ||
              node.operator === ts.SyntaxKind.MinusMinusToken)
          ? node.operand
          : undefined
    const writes: lua.Statement[] = []
    const visit = (value: ts.Expression) => {
      if (ts.isIdentifier(value)) {
        const binding = shared.bindings.get(ctx.checker.getSymbolAtLocation(value)!)
        for (const name of binding?.exports ?? [])
          writes.push(
            lua.createAssignmentStatement(
              field(shared.exports, name),
              field(shared.table, binding!.name.text)
            )
          )
      } else if (ts.isArrayLiteralExpression(value)) value.elements.forEach(visit)
      else if (ts.isObjectLiteralExpression(value))
        for (const property of value.properties) {
          if (ts.isPropertyAssignment(property)) visit(property.initializer)
          else if (ts.isShorthandPropertyAssignment(property)) {
            const binding = shared.bindings.get(
              ctx.checker.getShorthandAssignmentValueSymbol(property)!
            )
            for (const name of binding?.exports ?? [])
              writes.push(
                lua.createAssignmentStatement(
                  field(shared.exports, name),
                  field(shared.table, binding!.name.text)
                )
              )
          } else if (ts.isSpreadAssignment(property)) visit(property.expression)
        }
      else if (ts.isSpreadElement(value) || ts.isParenthesizedExpression(value))
        visit(value.expression)
      else if (
        ts.isBinaryExpression(value) &&
        value.operatorToken.kind === ts.SyntaxKind.EqualsToken
      )
        visit(value.left)
    }
    if (target) visit(target)
    return writes
  }
  function sharedAssignment(
    node: ts.BinaryExpression | ts.PrefixUnaryExpression | ts.PostfixUnaryExpression,
    ctx: lua.TransformationContext
  ) {
    if (!file(ctx).sharedAliases?.size && !file(ctx).shared)
      return ctx.superTransformExpression(node)
    ctx.pushPrecedingStatements()
    const result = ctx.superTransformExpression(node)
    ctx.addPrecedingStatements([
      ...withoutAliasWrites(ctx.popPrecedingStatements(), ctx),
      ...sharedExportWrites(node, ctx)
    ])
    return result
  }
  function sharedLoop(node: ts.ForOfStatement | ts.ForInStatement, ctx: lua.TransformationContext) {
    const result = ctx.superTransformStatements(node)
    if (file(ctx).shared && !ts.isVariableDeclarationList(node.initializer)) {
      for (const statement of result)
        if (lua.isForInStatement(statement)) {
          statement.body.statements = syncSharedWrites(
            withoutAliasWrites(statement.body.statements, ctx),
            file(ctx).shared
          )
        }
    }
    return result
  }
  return {
    afterPrint(program, _options, host, results) {
      for (const [fileName, { source, ast }] of sharedFiles) {
        const printed = new lua.LuaPrinter(host, program, source.fileName).print(ast)
        const map = JSON.parse(printed.sourceMap) as RawSourceMap
        const from = path.dirname(lua.getEmitPath(source.fileName, program))
        const to = path.dirname(lua.getEmitPath(fileName, program))
        map.sources = map.sources.map((name) =>
          path.relative(to, path.resolve(from, name)).replaceAll('\\', '/')
        )
        results.push({
          fileName,
          code: printed.code,
          sourceMap: JSON.stringify(map),
          sourceFiles: [source],
          luaAst: ast
        })
      }
    },
    visitors: {
      [ts.SyntaxKind.SourceFile]: (node, ctx) => {
        const state: LuaFileContext = {
          entry: analyzeLuaEntry(node, ctx.program).model,
          prelude: [],
          bindings: new Map(),
          getters: [],
          dataBindings: new Map(),
          dataLocals: new Map(),
          adaptedCallbacks: new Set()
        }
        files.set(node, state)
        const model = state.entry
        if (model?.shared.runtime) state.sharedAliases = new Set(model.shared.aliases)
        let entrySource = node
        if (model?.shared.runtime) {
          // 同一份已分析的 AST 先生成共享模块，再生成挂载；不构造第二个 Program。
          const sharedState: LuaFileContext = {
            ...state,
            entry: undefined,
            prelude: [],
            bindings: new Map(),
            getters: [],
            dataBindings: new Map(),
            dataLocals: new Map(),
            adaptedCallbacks: new Set()
          }
          files.set(node, sharedState)
          sharedState.shared = bindSharedState(model, ctx, sharedState.bindings)
          bindImports(node, ctx)
          const sharedSource = ts.factory.updateSourceFile(node, model.shared.statements)
          const shared = transformSharedSource(sharedSource, ctx)
          if (!lua.isFile(shared)) throw new Error('TSTL did not return a shared Lua file')
          generateReexports(shared, ctx)
          finishSharedEntry(shared, model, ctx, sharedState.shared?.table)
          if (sharedState.shared)
            sharedState.prelude.push(
              lua.createVariableDeclarationStatement(
                sharedState.shared.table,
                lua.createTableExpression()
              )
            )
          generatePrelude(shared, ctx)
          shared.statements.unshift(...sharedState.prelude)
          discardAdaptedCallbackDiagnostics(ctx, sharedState.adaptedCallbacks)
          shared.luaLibFeatures = new Set(shared.luaLibFeatures)
          ctx.usedLuaLibFeatures.clear()
          sharedFiles.set(sharedEntryFile(node.fileName, rootDir), { source: node, ast: shared })
          files.set(node, state)
          const module = sharedEntryModule(
            path
              .relative(rootDir, node.fileName)
              .replaceAll('\\', '/')
              .replace(/\.[cm]?tsx?$/, '')
          )
          const local = id(ctx.createTempName('shared'))
          state.prelude.push(lua.createVariableDeclarationStatement(local, requireModule(module)))
          state.shared = bindSharedState(model, ctx, state.bindings, field(local, 'exports'))
          if (state.shared)
            state.prelude.push(
              lua.createVariableDeclarationStatement(state.shared.table, field(local, 'state'))
            )
          if (model.shared.bindings.some((binding) => !binding.mutable)) {
            const values = id(ctx.createTempName('values'))
            state.prelude.push(
              lua.createVariableDeclarationStatement(values, field(local, 'values'))
            )
            for (const { name, mutable } of model.shared.bindings) {
              if (mutable) continue
              const symbol = ctx.checker.getSymbolAtLocation(name)
              if (symbol) state.bindings.set(symbol, field(values, name.text))
            }
          }
          entrySource = ts.factory.updateSourceFile(
            node,
            node.statements.filter(
              (statement) => statement === model.call.parent || ts.isImportDeclaration(statement)
            )
          )
        }
        bindImports(node, ctx)
        const result = ctx.superTransformNode(entrySource)[0]
        if (!lua.isFile(result)) throw new Error('TSTL did not return a Lua file')
        finishEntry(result, ctx)
        generateReexports(result, ctx)
        discardAdaptedCallbackDiagnostics(ctx, state.adaptedCallbacks)
        generatePrelude(result, ctx)
        result.statements.unshift(...state.prelude)
        return result
      },
      [ts.SyntaxKind.ImportDeclaration]: () => [],
      [ts.SyntaxKind.VariableStatement]: (node, ctx) => {
        const globals = new Set<string>()
        const helperObjects = new Map<string, Map<string, string>>()
        for (const declaration of node.declarationList.declarations) {
          if (
            ts.isObjectBindingPattern(declaration.name) &&
            declaration.initializer &&
            ts.isIdentifier(declaration.initializer) &&
            ctx.checker.getTypeAtLocation(declaration.initializer).getSymbol() ===
              getLuaBuiltins(ctx.program).clientGlobals
          ) {
            const value = ctx.transformExpression(declaration.initializer)
            if (lua.isIdentifier(value)) globals.add(value.text)
          }
        }
        for (const declaration of node.declarationList.declarations) {
          if (!ts.isObjectBindingPattern(declaration.name) || !declaration.initializer) continue
          const properties = new Map<string, string>()
          const builtins = getLuaBuiltins(ctx.program)
          for (const property of ctx.checker
            .getTypeAtLocation(declaration.initializer)
            .getProperties()) {
            const member = builtins.members.get(property)
            if (member && scopedHelperMethods[member])
              properties.set(property.name, scopedHelperMethods[member])
          }
          if (!properties.size) continue
          const value = ctx.transformExpression(declaration.initializer)
          if (lua.isIdentifier(value)) helperObjects.set(value.text, properties)
        }
        // 模块根部的 var 和 let 都只有一份共享状态；TSTL 默认只接受 let/const。
        const shared = file(ctx).shared
        const isSharedDeclaration =
          shared &&
          node.declarationList.declarations.some((declaration) => {
            const check = (name: ts.BindingName): boolean =>
              ts.isIdentifier(name)
                ? shared.bindings.has(ctx.checker.getSymbolAtLocation(name)!)
                : name.elements.some(
                    (element) => ts.isBindingElement(element) && check(element.name)
                  )
            return check(declaration.name)
          })
        const input =
          isSharedDeclaration && !(node.declarationList.flags & ts.NodeFlags.BlockScoped)
            ? ts.factory.updateVariableStatement(
                node,
                node.modifiers,
                ts.factory.createVariableDeclarationList(
                  node.declarationList.declarations,
                  ts.NodeFlags.Let
                )
              )
            : node
        let statements = withoutAliasWrites(ctx.superTransformStatements(input), ctx)
        if (isSharedDeclaration) statements = rewriteSharedDeclarations(statements, shared, ctx)
        if (!globals.size && !helperObjects.size) return statements
        // 解构只生成局部声明/赋值和默认值分支。只改写声明右侧的访问链，
        // 不反射遍历整个 Lua AST，也不触碰默认值分支中的用户代码。
        const rewriteAccess = (value: lua.Expression): lua.Expression => {
          if (!lua.isTableIndexExpression(value)) return value
          value.table = rewriteAccess(value.table)
          if (lua.isIdentifier(value.table) && lua.isStringLiteral(value.index)) {
            const name = helperObjects.get(value.table.text)?.get(value.index.value)
            if (name) return field(scope(ctx), name)
          }
          if (
            lua.isIdentifier(value.table) &&
            globals.has(value.table.text) &&
            lua.isStringLiteral(value.index)
          ) {
            if (value.index.value === 'helper') return helpers(ctx)
            if (value.index.value === 'self') return field(field(value.table, 'script'), 'object')
          }
          return value
        }
        for (const statement of statements) {
          if (lua.isVariableDeclarationStatement(statement)) {
            const value = statement.right?.[0]
            if (value && lua.isIdentifier(value) && globals.has(value.text))
              globals.add(statement.left[0].text)
            if (value && lua.isIdentifier(value) && helperObjects.has(value.text))
              helperObjects.set(statement.left[0].text, helperObjects.get(value.text)!)
            if (statement.right) statement.right = statement.right.map(rewriteAccess)
          } else if (lua.isAssignmentStatement(statement))
            statement.right = statement.right.map(rewriteAccess)
        }
        return statements
      },
      [ts.SyntaxKind.Identifier]: (node, ctx) => {
        const data = dataReference(node, ctx)
        if (data) return dataValue(data, ctx)
        const builtin = getLuaBuiltins(ctx.program).global(node)
        if (luaTimerGlobals.some((name) => name === builtin)) {
          return field(scope(ctx), builtin!)
        }
        if (builtin === 'Boolean') return field(helpers(ctx), 'toBoolean')
        if (builtin === 'self') return field(field(id('_ENV'), 'script'), 'object')
        if (builtin === 'send' || builtin === 'console') return field(helpers(ctx), builtin)
        return adaptBuiltinCallback(
          node,
          read(node, ctx) ?? ctx.superTransformExpression(node),
          ctx
        )
      },
      [ts.SyntaxKind.SuperKeyword]: (node, ctx) => {
        const value = ctx.superTransformExpression(node)
        // TSTL 的 super 优化直接生成基类标识符；这里同样接回导入绑定。
        const target = lua.isTableIndexExpression(value) ? value.table : value
        if (lua.isIdentifier(target) && target.symbolId !== undefined) {
          const symbol = ctx.symbolInfoMap.get(target.symbolId)?.symbol
          const imported = symbol && file(ctx).bindings.get(symbol)
          if (imported) {
            if (lua.isTableIndexExpression(value)) value.table = imported
            else return imported
          }
        }
        return value
      },
      [ts.SyntaxKind.ShorthandPropertyAssignment]: (node, ctx) => {
        const symbol = ctx.checker.getShorthandAssignmentValueSymbol(node)
        const data = symbol && file(ctx).dataBindings.get(symbol)
        if (data)
          return lua.createTableFieldExpression(dataValue(data, ctx), str(node.name.text), node)
        const value = symbol && file(ctx).bindings.get(symbol)
        return value
          ? lua.createTableFieldExpression(value, str(node.name.text), node)
          : ctx.superTransformNode(node)
      },
      [ts.SyntaxKind.ExpressionStatement]: (node, ctx) => {
        const model = file(ctx).entry
        return model && node.expression === model.call
          ? generateEntry(model, ctx)
          : [
              ...withoutAliasWrites(ctx.superTransformStatements(node), ctx),
              ...sharedExportWrites(node.expression, ctx)
            ]
      },
      [ts.SyntaxKind.ForOfStatement]: sharedLoop,
      [ts.SyntaxKind.ForInStatement]: sharedLoop,
      [ts.SyntaxKind.BinaryExpression]: sharedAssignment,
      [ts.SyntaxKind.PrefixUnaryExpression]: sharedAssignment,
      [ts.SyntaxKind.PostfixUnaryExpression]: sharedAssignment,
      [ts.SyntaxKind.ExportAssignment]: (node, ctx) => {
        const model = file(ctx).entry
        if (!model || node.expression !== model.call) return ctx.superTransformStatements(node)
        return generateEntry(model, ctx)
      },
      [ts.SyntaxKind.ExportDeclaration]: (node, ctx) => {
        if (node.isTypeOnly) return []
        let module: lua.Expression | undefined
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const table = id(ctx.createTempName('reexport'))
          file(ctx).prelude.push(
            lua.createVariableDeclarationStatement(
              table,
              importModule(resolve(node.moduleSpecifier.text, ctx.sourceFile.fileName))
            )
          )
          module = table
        }
        const add = (name: string, value: lua.Expression) =>
          file(ctx).getters.push(
            lua.createTableFieldExpression(
              lua.createFunctionExpression(
                lua.createBlock([lua.createReturnStatement([value])]),
                []
              ),
              str(name)
            )
          )
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          for (const item of node.exportClause.elements) {
            if (item.isTypeOnly || !ctx.resolver.isValueAliasDeclaration(item)) continue
            const local = item.propertyName ?? item.name
            const symbol = ctx.checker.getExportSpecifierLocalTargetSymbol(item)
            if (!module && symbol && file(ctx).shared?.bindings.has(symbol)) continue
            const value = module ? field(module, local.text) : ctx.transformExpression(local)
            // 同名导出已由 TSTL 存在 exports 上；再加 getter 会在值为 nil 时递归读取自身。
            if (
              file(ctx).sharedAliases &&
              lua.isTableIndexExpression(value) &&
              lua.isIdentifier(value.table) &&
              value.table.text === '____exports' &&
              lua.isStringLiteral(value.index) &&
              value.index.value === item.name.text
            )
              continue
            add(item.name.text, value)
          }
        } else if (node.exportClause && ts.isNamespaceExport(node.exportClause) && module) {
          add(node.exportClause.name.text, module)
        } else if (module && node.moduleSpecifier) {
          const symbol = ctx.checker.getSymbolAtLocation(node.moduleSpecifier)
          if (symbol)
            for (const item of ctx.checker.getExportsOfModule(symbol)) {
              const target =
                item.flags & ts.SymbolFlags.Alias ? ctx.checker.getAliasedSymbol(item) : item
              const sourceSymbol = ctx.checker.getSymbolAtLocation(
                ts.getOriginalNode(ctx.sourceFile)
              )
              const visible =
                sourceSymbol &&
                ctx.checker.getExportsOfModule(sourceSymbol).find((x) => x.name === item.name)
              const visibleTarget =
                visible &&
                (visible.flags & ts.SymbolFlags.Alias
                  ? ctx.checker.getAliasedSymbol(visible)
                  : visible)
              if (
                visibleTarget === target &&
                item.name !== 'default' &&
                target.flags & ts.SymbolFlags.Value
              )
                add(item.name, field(module, item.name))
            }
        }
        return []
      },
      [ts.SyntaxKind.PropertyAccessExpression]: (node, ctx) => {
        if (scopedUpdate(node, ctx)) return updateReference(ctx)
        const data = dataAccess(node, ctx)
        if (data) return data
        const builtins = getLuaBuiltins(ctx.program)
        const member = builtins.member(node.name)
        if (member === 'onSignal') return field(scope(ctx), member)
        if (member && scopedHelperMethods[member])
          return field(scope(ctx), scopedHelperMethods[member])
        if (member === 'helper') return helpers(ctx)
        if (member === 'self')
          return field(field(ctx.transformExpression(node.expression), 'script'), 'object')
        if (builtins.global(node.expression) === 'Number' && node.name.text in numberConstants)
          return lua.createNumericLiteral(numberConstants[node.name.text], node)
        return adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx)
      },
      [ts.SyntaxKind.ElementAccessExpression]: (node, ctx) => {
        if (scopedUpdate(node, ctx)) return updateReference(ctx)
        const member = getLuaBuiltins(ctx.program).member(node)
        if (member === 'onSignal') return field(scope(ctx), member)
        if (member && scopedHelperMethods[member])
          return field(scope(ctx), scopedHelperMethods[member])
        return (
          dataAccess(node, ctx) ??
          adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx)
        )
      },
      [ts.SyntaxKind.ParenthesizedExpression]: (node, ctx) =>
        adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx),
      [ts.SyntaxKind.AsExpression]: (node, ctx) =>
        adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx),
      [ts.SyntaxKind.NonNullExpression]: (node, ctx) =>
        adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx),
      [ts.SyntaxKind.CallExpression]: (node, ctx) => {
        const callee = node.expression
        if (scopedUpdate(callee, ctx))
          return lua.createCallExpression(
            field(scope(ctx), 'enableUpdate'),
            transformOrderedExpressions(ctx, node.arguments),
            node
          )
        const builtins = getLuaBuiltins(ctx.program)
        if (builtins.member(callee) === 'require') {
          const argument = node.arguments[0]
          return argument && ts.isStringLiteralLike(argument)
            ? requireModule(argument.text)
            : lua.createCallExpression(
                id('require'),
                transformOrderedExpressions(ctx, node.arguments),
                node
              )
        }
        if (builtins.global(callee) === 'send') {
          return lua.createCallExpression(
            field(helpers(ctx), 'send'),
            transformOrderedExpressions(ctx, node.arguments),
            node
          )
        }
        if (
          ts.isPropertyAccessExpression(callee) &&
          builtins.global(callee.expression) === 'console'
        ) {
          return lua.createCallExpression(
            field(field(helpers(ctx), 'console'), callee.name.text),
            transformOrderedExpressions(ctx, node.arguments),
            node
          )
        }
        return adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx)
      }
    }
  }
}
