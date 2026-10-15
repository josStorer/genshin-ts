import ts from 'typescript'
import * as lua from 'typescript-to-lua'

import { t } from '../../i18n/index.js'
import { luaSignalWriters } from '../../runtime/lua_signals.js'
import { getLuaBuiltins, numberConstants } from './builtins.js'
import { luaDataConstant, luaDataModule } from './data-modules.js'
import { diagnostic, entryCall, hooks } from './syntax.js'
import { ContextType, getFunctionContextType, transformOrderedExpressions } from './tstl-compat.js'

export { entryCall, diagnostic, hooks } from './syntax.js'
const id = lua.createIdentifier
const str = lua.createStringLiteral
const field = (target: lua.Expression, name: string) =>
  lua.createTableIndexExpression(target, str(name))
const requireModule = (name: string) =>
  lua.createCallExpression(id('require'), [str(`@NoResolution:${name}`)])

export function createLuaPlugin(
  resolve: (name: string, source: string) => string,
  nativeDefault: (name: string, source: string) => boolean = () => false
): lua.Plugin {
  const bindings = new Map<ts.Symbol, lua.Expression>()
  const imports = new Map<ts.SourceFile, lua.Statement[]>()
  const getters = new Map<ts.SourceFile, lua.TableFieldExpression[]>()
  const helperLocals = new Map<ts.SourceFile, lua.Identifier>()
  const booleanLocals = new Map<ts.SourceFile, lua.Identifier>()
  const dataBindings = new Map<ts.Symbol, { module: string; key?: string }>()
  const dataLocals = new Map<ts.SourceFile, Map<string, lua.Identifier>>()
  function dataReference(
    node: ts.Expression,
    ctx: lua.TransformationContext
  ): { module: string; key?: string } | undefined {
    if (ts.isIdentifier(node)) {
      const symbol = ctx.checker.getSymbolAtLocation(node)
      return symbol && dataBindings.get(symbol)
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
    const locals = dataLocals.get(ctx.sourceFile)!
    let local = locals.get(module)
    if (!local) {
      local = id(ctx.createTempName('data'))
      locals.set(module, local)
      imports
        .get(ctx.sourceFile)!
        .push(lua.createVariableDeclarationStatement(local, requireModule(module)))
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
    let local = helperLocals.get(ctx.sourceFile)
    if (!local) {
      local = id(ctx.createTempName('helpers'))
      helperLocals.set(ctx.sourceFile, local)
    }
    return local
  }
  const adaptedCallbacks = new Set<number>()
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
    adaptedCallbacks.add(node.getStart())
    return lua.createFunctionExpression(
      lua.createBlock([
        lua.createReturnStatement([lua.createCallExpression(callback, [lua.createDotsLiteral()])])
      ]),
      [id('_')],
      lua.createDotsLiteral()
    )
  }
  function read(node: ts.Identifier, ctx: lua.TransformationContext) {
    const symbol = ctx.checker.getSymbolAtLocation(node)
    return symbol && bindings.get(symbol)
  }
  return {
    visitors: {
      [ts.SyntaxKind.SourceFile]: (node, ctx) => {
        adaptedCallbacks.clear()
        const builtins = getLuaBuiltins(ctx.program)
        const prelude: lua.Statement[] = []
        imports.set(node, prelude)
        dataLocals.set(node, new Map())
        getters.set(node, [])
        const entry = entryCall(node)
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
              if (symbol) dataBindings.set(symbol, { module: dataModule })
            } else if (named) {
              for (const item of named.elements) {
                if (item.isTypeOnly) continue
                const symbol = ctx.checker.getSymbolAtLocation(item.name)
                if (symbol)
                  dataBindings.set(symbol, {
                    module: dataModule,
                    key: (item.propertyName ?? item.name).text
                  })
              }
            }
            continue
          }
          if (
            builtins.modules.get(builtins.symbolAt(statement.moduleSpecifier)!) === 'core' &&
            clause?.namedBindings &&
            ts.isNamedImports(clause.namedBindings)
          ) {
            for (const item of clause.namedBindings.elements) {
              const name = (item.propertyName ?? item.name).text
              if (name !== 'g' && name !== 'defineSignal' && !item.isTypeOnly)
                ctx.diagnostics.push(diagnostic(item, t('lua_graphApi', { arg0: name })))
            }
          }
          const moduleKind = builtins.modules.get(builtins.symbolAt(statement.moduleSpecifier)!)
          const helperImport = moduleKind === 'helpers' || moduleKind === 'core'
          const table = id(ctx.createTempName('module'))
          let used = !clause
          const bind = (name: ts.Identifier, key?: string) => {
            const symbol = ctx.checker.getSymbolAtLocation(name)
            if (symbol) bindings.set(symbol, key ? field(table, key) : table)
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
                bind(item.name, name)
              }
          }
          if (used && helperImport) {
            const existing = helperLocals.get(node)
            if (existing) {
              prelude.push(lua.createVariableDeclarationStatement(table, existing, statement))
            } else helperLocals.set(node, table)
          }
          if (used && !helperImport)
            prelude.push(
              lua.createVariableDeclarationStatement(
                table,
                requireModule(resolve(moduleName, node.fileName)),
                statement
              )
            )
        }
        const result = ctx.superTransformNode(node)[0]
        if (!lua.isFile(result)) throw new Error('TSTL did not return a Lua file')
        if (entry) {
          result.statements = result.statements.filter(
            (s) =>
              !(lua.isVariableDeclarationStatement(s) && s.left[0]?.text === '____exports') &&
              !(
                lua.isReturnStatement(s) &&
                s.expressions.some((e) => lua.isIdentifier(e) && e.text === '____exports')
              )
          )
        }
        const reexports = getters.get(node)!
        if (reexports.length) {
          const table = id(ctx.createTempName('getters'))
          result.statements.splice(
            result.statements.length - 1,
            0,
            lua.createVariableDeclarationStatement(table, lua.createTableExpression(reexports)),
            lua.createExpressionStatement(
              lua.createCallExpression(field(helpers(ctx), 'liveExports'), [
                id('____exports'),
                table
              ])
            )
          )
        }
        for (let i = ctx.diagnostics.length - 1; i >= 0; i--) {
          const diagnostic = ctx.diagnostics[i]
          if (
            diagnostic.code === 100016 &&
            diagnostic.file === node &&
            adaptedCallbacks.has(diagnostic.start ?? -1)
          )
            ctx.diagnostics.splice(i, 1)
        }
        const helper = helperLocals.get(node)
        if (helper)
          prelude.unshift(
            lua.createVariableDeclarationStatement(helper, requireModule('__gsts_helpers'))
          )
        const boolean = booleanLocals.get(node)
        if (boolean) {
          const value = id('value')
          const unequal = (other: lua.Expression) =>
            lua.createBinaryExpression(value, other, lua.SyntaxKind.InequalityOperator)
          const comparisons = [
            unequal(lua.createNilLiteral()),
            unequal(lua.createBooleanLiteral(false)),
            unequal(lua.createNumericLiteral(0)),
            unequal(str('')),
            lua.createBinaryExpression(value, value, lua.SyntaxKind.EqualityOperator)
          ]
          const truth = comparisons.reduce((left, right) =>
            lua.createBinaryExpression(left, right, lua.SyntaxKind.AndOperator)
          )
          // JS 标准库函数的回调带接收者槽；直接调用、别名和 filter(Boolean) 共用同一实现。
          prelude.push(
            lua.createVariableDeclarationStatement(
              boolean,
              lua.createFunctionExpression(lua.createBlock([lua.createReturnStatement([truth])]), [
                id('_'),
                value
              ])
            )
          )
        }
        result.statements.unshift(...prelude)
        return result
      },
      [ts.SyntaxKind.ImportDeclaration]: () => [],
      [ts.SyntaxKind.VariableStatement]: (node, ctx) => {
        const globals = new Set<string>()
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
        const statements = ctx.superTransformStatements(node)
        if (!globals.size) return statements
        // 解构只生成局部声明/赋值和默认值分支。只改写声明右侧的访问链，
        // 不反射遍历整个 Lua AST，也不触碰默认值分支中的用户代码。
        const rewriteAccess = (value: lua.Expression): lua.Expression => {
          if (!lua.isTableIndexExpression(value)) return value
          value.table = rewriteAccess(value.table)
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
        if (builtin === 'Boolean') {
          let local = booleanLocals.get(ctx.sourceFile)
          if (!local) {
            local = id(ctx.createTempName('boolean'))
            booleanLocals.set(ctx.sourceFile, local)
          }
          return local
        }
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
          const imported = symbol && bindings.get(symbol)
          if (imported) {
            if (lua.isTableIndexExpression(value)) value.table = imported
            else return imported
          }
        }
        return value
      },
      [ts.SyntaxKind.ShorthandPropertyAssignment]: (node, ctx) => {
        const symbol = ctx.checker.getShorthandAssignmentValueSymbol(node)
        const data = symbol && dataBindings.get(symbol)
        if (data)
          return lua.createTableFieldExpression(dataValue(data, ctx), str(node.name.text), node)
        const value = symbol && bindings.get(symbol)
        return value
          ? lua.createTableFieldExpression(value, str(node.name.text), node)
          : ctx.superTransformNode(node)
      },
      [ts.SyntaxKind.ExportAssignment]: (node, ctx) => {
        if (node.expression !== entryCall(ctx.sourceFile)) return ctx.superTransformStatements(node)
        const call = node.expression as ts.CallExpression
        const setup = call.arguments[call.arguments.length - 1]
        if (!setup || !(ts.isArrowFunction(setup) || ts.isFunctionExpression(setup))) return []
        const returned = ts.isBlock(setup.body) ? setup.body.statements.at(-1) : undefined
        const members = new Map<string, ts.ObjectLiteralElementLike>()
        const hookMembers = new Set<string>()
        if (
          returned &&
          ts.isReturnStatement(returned) &&
          returned.expression &&
          ts.isObjectLiteralExpression(returned.expression)
        ) {
          for (const hook of returned.expression.properties) {
            if (!hook.name || !ts.isIdentifier(hook.name)) continue
            if (
              hook.name.text === 'methods' &&
              ts.isPropertyAssignment(hook) &&
              ts.isObjectLiteralExpression(hook.initializer)
            ) {
              for (const method of hook.initializer.properties)
                if (method.name && ts.isIdentifier(method.name))
                  members.set(method.name.text, method)
            } else hookMembers.add(hook.name.text)
          }
        }
        const transformed = ctx.transformExpression(setup)
        if (!lua.isFunctionExpression(transformed)) return []
        const body = [...transformed.body.statements]
        const last = body.pop()
        const value = last && lua.isReturnStatement(last) ? last.expressions[0] : undefined
        if (!value || !lua.isTableExpression(value)) {
          ctx.diagnostics.push(diagnostic(setup, t('lua_literalHooks')))
          return []
        }
        if (transformed.params?.length)
          body.unshift(lua.createVariableDeclarationStatement(transformed.params[0], id('_ENV')))
        for (const member of value.fields) {
          const name = member.key && lua.isStringLiteral(member.key) ? member.key.value : ''
          if (name === 'methods' && lua.isTableExpression(member.value)) {
            for (const method of member.value.fields) {
              if (method.key && lua.isStringLiteral(method.key)) {
                const original = members.get(method.key.value)
                if (
                  lua.isFunctionExpression(method.value) &&
                  original &&
                  getFunctionContextType(ctx, ctx.checker.getTypeAtLocation(original)) ===
                    ContextType.NonVoid
                )
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
          const globalName = hookMembers.has(name) ? hooks.get(name) : undefined
          if (!globalName || !lua.isFunctionExpression(member.value)) {
            ctx.diagnostics.push(diagnostic(setup, t('lua_hookFunction', { arg0: name })))
            continue
          }
          member.value.flags |= lua.NodeFlags.Declaration
          body.push(lua.createAssignmentStatement(field(id('_ENV'), globalName), member.value))
        }
        return body
      },
      [ts.SyntaxKind.ExportDeclaration]: (node, ctx) => {
        if (node.isTypeOnly) return []
        let module: lua.Expression | undefined
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const table = id(ctx.createTempName('reexport'))
          imports
            .get(ctx.sourceFile)!
            .push(
              lua.createVariableDeclarationStatement(
                table,
                requireModule(resolve(node.moduleSpecifier.text, ctx.sourceFile.fileName))
              )
            )
          module = table
        }
        const add = (name: string, value: lua.Expression) =>
          getters
            .get(ctx.sourceFile)!
            .push(
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
            add(item.name.text, module ? field(module, local.text) : ctx.transformExpression(local))
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
        const data = dataAccess(node, ctx)
        if (data) return data
        const builtins = getLuaBuiltins(ctx.program)
        const member = builtins.member(node.name)
        if (member === 'helper') return helpers(ctx)
        if (member === 'self')
          return field(field(ctx.transformExpression(node.expression), 'script'), 'object')
        if (builtins.global(node.expression) === 'Number' && node.name.text in numberConstants)
          return lua.createNumericLiteral(numberConstants[node.name.text], node)
        return adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx)
      },
      [ts.SyntaxKind.ElementAccessExpression]: (node, ctx) =>
        dataAccess(node, ctx) ??
        adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx),
      [ts.SyntaxKind.ParenthesizedExpression]: (node, ctx) =>
        adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx),
      [ts.SyntaxKind.AsExpression]: (node, ctx) =>
        adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx),
      [ts.SyntaxKind.NonNullExpression]: (node, ctx) =>
        adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx),
      [ts.SyntaxKind.CallExpression]: (node, ctx) => {
        const callee = node.expression
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
          const signalType = node.arguments[0] && ctx.checker.getTypeAtLocation(node.arguments[0])
          const paramsSymbol = signalType?.getProperty('params')
          const paramsType =
            paramsSymbol && ctx.checker.getTypeOfSymbolAtLocation(paramsSymbol, node.arguments[0])
          const methods: Readonly<Record<string, string>> = luaSignalWriters
          const writers =
            paramsType && ctx.checker.isTupleType(paramsType)
              ? ctx.checker.getTypeArguments(paramsType as ts.TypeReference).map((param) => {
                  if (!ctx.checker.isTupleType(param)) return undefined
                  const type = ctx.checker.getTypeArguments(param as ts.TypeReference)[1]
                  if (!type?.isStringLiteral()) return undefined
                  const list = type.value.endsWith('_list'),
                    name = list ? type.value.slice(0, -5) : type.value
                  return methods[name] ? methods[name] + (list ? 'List' : '') : undefined
                })
              : undefined
          const args = transformOrderedExpressions(ctx, node.arguments)
          if (
            writers &&
            writers.every((writer): writer is string => !!writer) &&
            args.length === writers.length + 1
          ) {
            const params = args.map((_, i) => id(`arg${i}`)),
              builder = id('signal')
            const body: lua.Statement[] = [
              lua.createVariableDeclarationStatement(
                builder,
                lua.createCallExpression(field(field(id('_ENV'), 'game'), 'ServerSignal'), [
                  field(params[0], 'name')
                ])
              )
            ]
            writers.forEach((writer, i) =>
              body.push(
                lua.createExpressionStatement(
                  lua.createMethodCallExpression(builder, id(writer), [params[i + 1]])
                )
              )
            )
            body.push(
              lua.createExpressionStatement(
                lua.createMethodCallExpression(builder, id('SendSignal'), [])
              )
            )
            return lua.createCallExpression(
              lua.createFunctionExpression(lua.createBlock(body), params),
              args,
              node
            )
          }
          return lua.createCallExpression(field(helpers(ctx), 'send'), args, node)
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
