import ts from 'typescript'
import * as lua from 'typescript-to-lua'

import { getLuaBuiltins, scopedHelperMethods } from '../analysis/builtins.js'
import { luaDataModule } from '../output/data_modules.js'
import { helpers, type LuaFileContext } from './context.js'
import { field, id, importModule, requireModule, str } from './lua_ast.js'
import { generateScopeHooks } from './scope_hooks.js'
import { scope } from './scope.js'

export function read(node: ts.Identifier, ctx: lua.TransformationContext, file: LuaFileContext) {
  const symbol =
    node.parent && ts.isShorthandPropertyAssignment(node.parent)
      ? ctx.checker.getShorthandAssignmentValueSymbol(node.parent)
      : ctx.checker.getSymbolAtLocation(node)
  return symbol && file.bindings.get(symbol)
}

// 先绑定全部导入，声明之前的引用也使用同一个模块局部变量。
export function bindImports(
  node: ts.SourceFile,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const builtins = getLuaBuiltins(ctx.program)
  const prelude = file.prelude
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
        if (symbol) file.dataBindings.set(symbol, { module: dataModule })
      } else if (named) {
        for (const item of named.elements) {
          if (item.isTypeOnly) continue
          const symbol = ctx.checker.getSymbolAtLocation(item.name)
          if (symbol)
            file.dataBindings.set(symbol, {
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
      if (symbol) file.bindings.set(symbol, key ? field(table, key) : table)
      used = true
    }
    if (clause?.name && ctx.resolver.isReferencedAliasDeclaration(clause))
      bind(
        clause.name,
        file.options.nativeDefault(moduleName, node.fileName) ? undefined : 'default'
      )
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
              file.bindings.set(symbol, field(scope(ctx, file), scopedHelperMethods[member]))
            continue
          }
          bind(item.name, name)
        }
    }
    if (used && helperImport) {
      const existing = file.helper
      if (existing) {
        prelude.push(lua.createVariableDeclarationStatement(table, existing, statement))
      } else file.helper = table
    }
    if (used && !helperImport)
      prelude.push(
        lua.createVariableDeclarationStatement(
          table,
          importModule(file.options.resolve(moduleName, node.fileName)),
          statement
        )
      )
  }
}

export function generateReexports(
  result: lua.File,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const reexports = file.getters
  if (reexports.length) {
    const table = id(ctx.createTempName('getters'))
    result.statements.splice(
      result.statements.length - 1,
      0,
      lua.createVariableDeclarationStatement(table, lua.createTableExpression(reexports)),
      lua.createExpressionStatement(
        lua.createCallExpression(field(helpers(ctx, file), 'liveExports'), [
          id('____exports'),
          table
        ])
      )
    )
  }
}

export function generatePrelude(
  result: lua.File,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const { prelude, entry } = file
  const helper = file.helper
  if (helper)
    prelude.unshift(lua.createVariableDeclarationStatement(helper, requireModule('__gsts_helpers')))
  const instance = file.scope
  if (instance) {
    const clock = entry?.scope.timers ? str(entry.options.timerClock) : lua.createNilLiteral()
    prelude.push(
      lua.createVariableDeclarationStatement(
        instance,
        lua.createCallExpression(field(helpers(ctx, file), 'createScope'), [id('_ENV'), clock])
      )
    )
    generateScopeHooks(result.statements, instance, entry!, ctx)
  }
}

export function transformExport(
  node: ts.ExportDeclaration,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  if (node.isTypeOnly) return []
  let module: lua.Expression | undefined
  if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
    const table = id(ctx.createTempName('reexport'))
    file.prelude.push(
      lua.createVariableDeclarationStatement(
        table,
        importModule(file.options.resolve(node.moduleSpecifier.text, ctx.sourceFile.fileName))
      )
    )
    module = table
  }
  const add = (name: string, value: lua.Expression) =>
    file.getters.push(
      lua.createTableFieldExpression(
        lua.createFunctionExpression(lua.createBlock([lua.createReturnStatement([value])]), []),
        str(name)
      )
    )
  if (node.exportClause && ts.isNamedExports(node.exportClause)) {
    for (const item of node.exportClause.elements) {
      if (item.isTypeOnly || !ctx.resolver.isValueAliasDeclaration(item)) continue
      const local = item.propertyName ?? item.name
      const symbol = ctx.checker.getExportSpecifierLocalTargetSymbol(item)
      if (!module && symbol && file.shared?.bindings.has(symbol)) continue
      const value = module ? field(module, local.text) : ctx.transformExpression(local)
      // 同名导出已由 TSTL 存在 exports 上；再加 getter 会在值为 nil 时递归读取自身。
      if (
        file.sharedAliases &&
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
        const target = item.flags & ts.SymbolFlags.Alias ? ctx.checker.getAliasedSymbol(item) : item
        const sourceSymbol = ctx.checker.getSymbolAtLocation(ts.getOriginalNode(ctx.sourceFile))
        const visible =
          sourceSymbol &&
          ctx.checker.getExportsOfModule(sourceSymbol).find((x) => x.name === item.name)
        const visibleTarget =
          visible &&
          (visible.flags & ts.SymbolFlags.Alias ? ctx.checker.getAliasedSymbol(visible) : visible)
        if (
          visibleTarget === target &&
          item.name !== 'default' &&
          target.flags & ts.SymbolFlags.Value
        )
          add(item.name, field(module, item.name))
      }
  }
  return []
}
