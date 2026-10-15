import ts from 'typescript'
import * as lua from 'typescript-to-lua'
import {
  ContextType,
  getFunctionContextType
} from 'typescript-to-lua/dist/transformation/utils/function-context.js'
import { transformOrderedExpressions } from 'typescript-to-lua/dist/transformation/visitors/expression-list.js'

import { t } from '../../i18n/index.js'
import { diagnostic, entryCall, hooks } from './syntax.js'

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
  const envSymbols = new Set<ts.Symbol>()
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
        const prelude: lua.Statement[] = []
        imports.set(node, prelude)
        getters.set(node, [])
        const entry = entryCall(node)
        if (entry) {
          const setup = entry.arguments[entry.arguments.length - 1]
          if (
            setup &&
            (ts.isArrowFunction(setup) || ts.isFunctionExpression(setup)) &&
            setup.parameters[0]
          ) {
            const symbol = ctx.checker.getSymbolAtLocation(setup.parameters[0].name)
            if (symbol) envSymbols.add(symbol)
          }
        }
        // Register every alias before visiting bodies. This also covers uses before import declarations.
        for (const statement of node.statements) {
          if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
            continue
          const clause = statement.importClause
          if (clause?.isTypeOnly) continue
          const moduleName = statement.moduleSpecifier.text
          if (
            moduleName === 'genshin-ts/runtime/core' &&
            clause?.namedBindings &&
            ts.isNamedImports(clause.namedBindings)
          ) {
            for (const item of clause.namedBindings.elements) {
              const name = (item.propertyName ?? item.name).text
              if (name !== 'g' && name !== 'defineSignal' && !item.isTypeOnly)
                ctx.diagnostics.push(diagnostic(item, t('lua_graphApi', { arg0: name })))
            }
          }
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
                if (moduleName === 'genshin-ts/runtime/core' && name === 'g') continue
                bind(item.name, name)
              }
          }
          if (used)
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
              lua.createCallExpression(field(requireModule('__gsts_helpers'), 'liveExports'), [
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
            ctx.checker.getTypeAtLocation(declaration.initializer).getSymbol()?.name ===
              'ClientGlobals'
          ) {
            const value = ctx.transformExpression(declaration.initializer)
            if (lua.isIdentifier(value)) globals.add(value.text)
          }
        }
        const statements = ctx.superTransformStatements(node)
        if (!globals.size) return statements
        const rewrite = (value: unknown): unknown => {
          if (Array.isArray(value)) return value.map(rewrite)
          if (!value || typeof value !== 'object' || !('kind' in value) || !('flags' in value))
            return value
          const ast = value as lua.Node
          if (
            lua.isVariableDeclarationStatement(ast) &&
            ast.right?.[0] &&
            lua.isIdentifier(ast.right[0]) &&
            globals.has(ast.right[0].text)
          )
            globals.add(ast.left[0].text)
          if (
            lua.isTableIndexExpression(ast) &&
            lua.isIdentifier(ast.table) &&
            globals.has(ast.table.text) &&
            lua.isStringLiteral(ast.index)
          ) {
            if (ast.index.value === 'helper') return requireModule('__gsts_helpers')
            if (ast.index.value === 'self') return field(field(ast.table, 'script'), 'object')
          }
          const record = value as Record<string, unknown>
          for (const key of Object.keys(record)) record[key] = rewrite(record[key])
          return value
        }
        return statements.map((statement) => rewrite(statement) as lua.Statement)
      },
      [ts.SyntaxKind.Identifier]: (node, ctx) => {
        const symbol = ctx.checker.getSymbolAtLocation(node)
        if (
          symbol?.declarations?.some((d) => d.getSourceFile().fileName.endsWith('lua-globals.d.ts'))
        ) {
          if (node.text === 'self') return field(field(id('_ENV'), 'script'), 'object')
          if (node.text === 'send' || node.text === 'console')
            return field(requireModule('__gsts_helpers'), node.text)
        }
        return adaptBuiltinCallback(
          node,
          read(node, ctx) ?? ctx.superTransformExpression(node),
          ctx
        )
      },
      [ts.SyntaxKind.ShorthandPropertyAssignment]: (node, ctx) => {
        const symbol = ctx.checker.getShorthandAssignmentValueSymbol(node)
        const value = symbol && bindings.get(symbol)
        return value
          ? lua.createTableFieldExpression(value, str(node.name.text), node)
          : ctx.superTransformNode(node)
      },
      [ts.SyntaxKind.ExportAssignment]: (node, ctx) => {
        if (node.expression !== entryCall(node.getSourceFile()))
          return ctx.superTransformStatements(node)
        const call = node.expression as ts.CallExpression
        const setup = call.arguments[call.arguments.length - 1]
        if (!setup || !(ts.isArrowFunction(setup) || ts.isFunctionExpression(setup))) return []
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
              if (
                method.key &&
                lua.isStringLiteral(method.key) &&
                lua.isFunctionExpression(method.value)
              ) {
                const returned = ts.isBlock(setup.body) ? setup.body.statements.at(-1) : undefined
                const methods =
                  returned &&
                  ts.isReturnStatement(returned) &&
                  returned.expression &&
                  ts.isObjectLiteralExpression(returned.expression)
                    ? returned.expression.properties.find(
                        (p) => p.name && ts.isIdentifier(p.name) && p.name.text === 'methods'
                      )
                    : undefined
                const original =
                  methods &&
                  ts.isPropertyAssignment(methods) &&
                  ts.isObjectLiteralExpression(methods.initializer)
                    ? methods.initializer.properties.find(
                        (p) =>
                          p.name &&
                          ts.isIdentifier(p.name) &&
                          p.name.text === (method.key as lua.StringLiteral).value
                      )
                    : undefined
                if (
                  original &&
                  getFunctionContextType(ctx, ctx.checker.getTypeAtLocation(original)) ===
                    ContextType.NonVoid
                )
                  method.value.params?.shift()
                method.value.flags |= lua.NodeFlags.Declaration
                body.push(
                  lua.createAssignmentStatement(field(id('_ENV'), method.key.value), method.value)
                )
              }
            }
            continue
          }
          const globalName = hooks.get(name)
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
            .get(node.getSourceFile())!
            .push(
              lua.createVariableDeclarationStatement(
                table,
                requireModule(resolve(node.moduleSpecifier.text, node.getSourceFile().fileName))
              )
            )
          module = table
        }
        const add = (name: string, value: lua.Expression) =>
          getters
            .get(node.getSourceFile())!
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
              const sourceSymbol = ctx.checker.getSymbolAtLocation(node.getSourceFile())
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
        const symbol = ts.isIdentifier(node.expression)
          ? ctx.checker.getSymbolAtLocation(node.expression)
          : undefined
        const globalObject =
          (!!symbol && envSymbols.has(symbol)) ||
          ctx.checker
            .getTypeAtLocation(node.expression)
            .getSymbol()
            ?.declarations?.some(
              (d) =>
                ts.isInterfaceDeclaration(d) &&
                d.name.text === 'ClientGlobals' &&
                d.getSourceFile().fileName.endsWith('lua.d.ts')
            )
        if (globalObject && node.name.text === 'helper') return requireModule('__gsts_helpers')
        if (globalObject && node.name.text === 'self')
          return field(field(ctx.transformExpression(node.expression), 'script'), 'object')
        if (
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'Number' &&
          symbol?.declarations?.some((d) => d.getSourceFile().hasNoDefaultLib)
        ) {
          const constants: Record<string, number> = {
            MAX_SAFE_INTEGER: 9007199254740991,
            MIN_SAFE_INTEGER: -9007199254740991,
            MAX_VALUE: Number.MAX_VALUE,
            MIN_VALUE: Number.MIN_VALUE,
            EPSILON: Number.EPSILON
          }
          if (node.name.text in constants)
            return lua.createNumericLiteral(constants[node.name.text], node)
        }
        return adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx)
      },
      [ts.SyntaxKind.ElementAccessExpression]: (node, ctx) =>
        adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx),
      [ts.SyntaxKind.ParenthesizedExpression]: (node, ctx) =>
        adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx),
      [ts.SyntaxKind.AsExpression]: (node, ctx) =>
        adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx),
      [ts.SyntaxKind.NonNullExpression]: (node, ctx) =>
        adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx),
      [ts.SyntaxKind.CallExpression]: (node, ctx) => {
        const callee = node.expression
        const declaration = ctx.checker.getResolvedSignature(node)?.declaration
        if (
          declaration &&
          ts.isMethodSignature(declaration) &&
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === 'require' &&
          declaration.getSourceFile().fileName.endsWith('lua-standard.d.ts')
        ) {
          const argument = node.arguments[0]
          return argument && ts.isStringLiteralLike(argument)
            ? requireModule(argument.text)
            : lua.createCallExpression(
                id('require'),
                transformOrderedExpressions(ctx, node.arguments),
                node
              )
        }
        if (
          ts.isIdentifier(callee) &&
          callee.text === 'send' &&
          ctx.checker
            .getSymbolAtLocation(callee)
            ?.declarations?.some((d) => d.getSourceFile().fileName.endsWith('lua-globals.d.ts'))
        ) {
          const signalType = node.arguments[0] && ctx.checker.getTypeAtLocation(node.arguments[0])
          const paramsSymbol = signalType?.getProperty('params')
          const paramsType =
            paramsSymbol && ctx.checker.getTypeOfSymbolAtLocation(paramsSymbol, node.arguments[0])
          const methods: Record<string, string> = {
            int: 'AddInt',
            float: 'AddFloat',
            str: 'AddString',
            bool: 'AddBool',
            vec3: 'AddVector3',
            guid: 'AddGuid',
            entity: 'AddEntity',
            prefab_id: 'AddPrefabId',
            config_id: 'AddConfigId'
          }
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
          return lua.createCallExpression(
            field(requireModule('__gsts_helpers'), 'send'),
            args,
            node
          )
        }
        if (
          ts.isPropertyAccessExpression(callee) &&
          ts.isIdentifier(callee.expression) &&
          callee.expression.text === 'console' &&
          ctx.checker
            .getSymbolAtLocation(callee.expression)
            ?.declarations?.some((d) => d.getSourceFile().fileName.endsWith('lua-globals.d.ts'))
        ) {
          return lua.createCallExpression(
            field(field(requireModule('__gsts_helpers'), 'console'), callee.name.text),
            transformOrderedExpressions(ctx, node.arguments),
            node
          )
        }
        return adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx)
      }
    }
  }
}
