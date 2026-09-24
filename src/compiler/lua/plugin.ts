import ts from 'typescript'
import * as lua from 'typescript-to-lua'
import { transformOrderedExpressions } from 'typescript-to-lua/dist/transformation/visitors/expression-list.js'

import { entryCall, diagnostic, hooks } from './syntax.js'
export { entryCall, diagnostic, hooks } from './syntax.js'
const id = lua.createIdentifier
const str = lua.createStringLiteral
const field = (target: lua.Expression, name: string) => lua.createTableIndexExpression(target, str(name))
const requireModule = (name: string) => lua.createCallExpression(id('require'), [str(`@NoResolution:${name}`)])

export function createLuaPlugin(resolve: (name: string, source: string) => string): lua.Plugin {
  const bindings = new Map<ts.Symbol, lua.Expression>()
  const imports = new Map<ts.SourceFile, lua.Statement[]>()
  const getters = new Map<ts.SourceFile, lua.TableFieldExpression[]>()
  const envSymbols = new Set<ts.Symbol>()
  function read(node: ts.Identifier, ctx: lua.TransformationContext) {
    const symbol = ctx.checker.getSymbolAtLocation(node)
    return symbol && bindings.get(symbol)
  }
  return { visitors: {
    [ts.SyntaxKind.SourceFile]: (node, ctx) => {
      const prelude: lua.Statement[] = []
      imports.set(node, prelude)
      getters.set(node, [])
      const entry = entryCall(node)
      if (entry) {
        const setup = entry.arguments[entry.arguments.length - 1]
        if (setup && (ts.isArrowFunction(setup) || ts.isFunctionExpression(setup)) && setup.parameters[0]) {
          const symbol = ctx.checker.getSymbolAtLocation(setup.parameters[0].name)
          if (symbol) envSymbols.add(symbol)
        }
      }
      // Register every alias before visiting bodies. This also covers uses before import declarations.
      for (const statement of node.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue
        const clause = statement.importClause
        if (clause?.isTypeOnly) continue
        const moduleName = statement.moduleSpecifier.text
        if (moduleName === 'genshin-ts/runtime/core' && clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const item of clause.namedBindings.elements) {
            const name = (item.propertyName ?? item.name).text
            if (name !== 'g' && name !== 'defineSignal' && !item.isTypeOnly) ctx.diagnostics.push(diagnostic(item, `Lua 脚本不能使用节点图 API ${name}。`))
          }
        }
        const table = id(ctx.createTempName('module'))
        let used = !clause
        const bind = (name: ts.Identifier, key?: string) => {
          const symbol = ctx.checker.getSymbolAtLocation(name)
          if (symbol) bindings.set(symbol, key ? field(table, key) : table)
          used = true
        }
        if (clause?.name) bind(clause.name, 'default')
        if (clause?.namedBindings) {
          if (ts.isNamespaceImport(clause.namedBindings)) bind(clause.namedBindings.name)
          else for (const item of clause.namedBindings.elements) {
            if (item.isTypeOnly || !ctx.resolver.isReferencedAliasDeclaration(item)) continue
            const name = (item.propertyName ?? item.name).text
            if (moduleName === 'genshin-ts/runtime/core' && name === 'g') continue
            bind(item.name, name)
          }
        }
        if (used) prelude.push(lua.createVariableDeclarationStatement(table, requireModule(resolve(moduleName, node.fileName)), statement))
      }
      const result = ctx.superTransformNode(node)[0]
      if (!lua.isFile(result)) throw new Error('TSTL did not return a Lua file')
      if (entry) {
        result.statements = result.statements.filter(s => !(lua.isVariableDeclarationStatement(s) && s.left[0]?.text === '____exports') && !(lua.isReturnStatement(s) && s.expressions.some(e => lua.isIdentifier(e) && e.text === '____exports')))
      }
      const reexports = getters.get(node)!
      if (reexports.length) {
        const table = id('____gstsGetters')
        const key = id('key')
        const get = lua.createTableIndexExpression(table, key)
        const lookup = lua.createFunctionExpression(lua.createBlock([
          lua.createIfStatement(get, lua.createBlock([lua.createReturnStatement([lua.createCallExpression(get, [])])]))
        ]), [id('_'), key])
        result.statements.splice(result.statements.length - 1, 0,
          lua.createVariableDeclarationStatement(table, lua.createTableExpression(reexports)),
          lua.createExpressionStatement(lua.createCallExpression(id('setmetatable'), [id('____exports'), lua.createTableExpression([lua.createTableFieldExpression(lookup, str('__index'))])])))
      }
      result.statements.unshift(...prelude)
      return result
    },
    [ts.SyntaxKind.ImportDeclaration]: () => [],
    [ts.SyntaxKind.Identifier]: (node, ctx) => {
      const symbol = ctx.checker.getSymbolAtLocation(node)
      if (symbol?.declarations?.some(d => d.getSourceFile().fileName.endsWith('lua-globals.d.ts'))) {
        if (node.text === 'self') return field(id('script'), 'object')
        if (node.text === 'send' || node.text === 'console') return field(requireModule('__gsts_helpers'), node.text)
      }
      return read(node, ctx) ?? ctx.superTransformExpression(node)
    },
    [ts.SyntaxKind.ShorthandPropertyAssignment]: (node, ctx) => {
      const symbol = ctx.checker.getShorthandAssignmentValueSymbol(node)
      const value = symbol && bindings.get(symbol)
      return value ? lua.createTableFieldExpression(value, str(node.name.text), node) : ctx.superTransformNode(node)
    },
    [ts.SyntaxKind.ExportAssignment]: (node, ctx) => {
      if (node.expression !== entryCall(node.getSourceFile())) return ctx.superTransformStatements(node)
      const call = node.expression as ts.CallExpression
      const setup = call.arguments[call.arguments.length - 1]
      if (!setup || !(ts.isArrowFunction(setup) || ts.isFunctionExpression(setup))) return []
      const transformed = ctx.transformExpression(setup)
      if (!lua.isFunctionExpression(transformed)) return []
      const body = [...transformed.body.statements]
      const last = body.pop()
      const value = last && lua.isReturnStatement(last) ? last.expressions[0] : undefined
      if (!value || !lua.isTableExpression(value)) { ctx.diagnostics.push(diagnostic(setup, '请在回调最后直接 return { onStart() { … }, onUpdate(dt) { … } }。')); return [] }
      if (transformed.params?.length) body.unshift(lua.createVariableDeclarationStatement(transformed.params[0], id('_ENV')))
      for (const member of value.fields) {
        const name = member.key && lua.isStringLiteral(member.key) ? member.key.value : ''
        const globalName = hooks.get(name)
        if (!globalName || !lua.isFunctionExpression(member.value)) { ctx.diagnostics.push(diagnostic(setup, `生命周期 ${name} 必须直接声明为函数。`)); continue }
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
        imports.get(node.getSourceFile())!.push(lua.createVariableDeclarationStatement(table, requireModule(resolve(node.moduleSpecifier.text, node.getSourceFile().fileName))))
        module = table
      }
      const add = (name: string, value: lua.Expression) => getters.get(node.getSourceFile())!.push(lua.createTableFieldExpression(lua.createFunctionExpression(lua.createBlock([lua.createReturnStatement([value])]), []), str(name)))
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
        if (symbol) for (const item of ctx.checker.getExportsOfModule(symbol)) {
          const target = item.flags & ts.SymbolFlags.Alias ? ctx.checker.getAliasedSymbol(item) : item
          if (item.name !== 'default' && target.flags & ts.SymbolFlags.Value) add(item.name, field(module, item.name))
        }
      }
      return []
    },
    [ts.SyntaxKind.PropertyAccessExpression]: (node, ctx) => {
      const symbol = ts.isIdentifier(node.expression) ? ctx.checker.getSymbolAtLocation(node.expression) : undefined
      if (symbol && envSymbols.has(symbol) && node.name.text === 'helper') return requireModule('__gsts_helpers')
      if (symbol && envSymbols.has(symbol) && node.name.text === 'self') return field(field(ctx.transformExpression(node.expression), 'script'), 'object')
      if (ts.isIdentifier(node.expression) && node.expression.text === 'Number' && symbol?.declarations?.some(d => d.getSourceFile().hasNoDefaultLib)) {
        const constants: Record<string, number> = { MAX_SAFE_INTEGER: 9007199254740991, MIN_SAFE_INTEGER: -9007199254740991, MAX_VALUE: Number.MAX_VALUE, MIN_VALUE: Number.MIN_VALUE, EPSILON: Number.EPSILON }
        if (node.name.text in constants) return lua.createNumericLiteral(constants[node.name.text], node)
      }
      return ctx.superTransformExpression(node)
    },
    [ts.SyntaxKind.CallExpression]: (node, ctx) => {
      const callee = node.expression
      if (ts.isIdentifier(callee) && callee.text === 'send' && ctx.checker.getSymbolAtLocation(callee)?.declarations?.some(d => d.getSourceFile().fileName.endsWith('lua-globals.d.ts'))) {
        return lua.createCallExpression(field(requireModule('__gsts_helpers'), 'send'), transformOrderedExpressions(ctx, node.arguments), node)
      }
      if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && callee.expression.text === 'console' && ctx.checker.getSymbolAtLocation(callee.expression)?.declarations?.some(d => d.getSourceFile().fileName.endsWith('lua-globals.d.ts'))) {
        return lua.createCallExpression(field(field(requireModule('__gsts_helpers'), 'console'), callee.name.text), transformOrderedExpressions(ctx, node.arguments), node)
      }
      return ctx.superTransformExpression(node)
    }
  } }
}
