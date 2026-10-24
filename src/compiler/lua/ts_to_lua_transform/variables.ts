import ts from 'typescript'
import * as lua from 'typescript-to-lua'

import { getLuaBuiltins, scopedGlobals, scopedHelperMethods } from '../analysis/builtins.js'
import { helpers, type LuaFileContext } from './context.js'
import { rewriteSharedDeclarations } from './entry_shared.js'
import { field } from './lua_ast.js'
import { scope } from './scope.js'

export function transformVariables(
  node: ts.VariableStatement,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
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
    for (const property of ctx.checker.getTypeAtLocation(declaration.initializer).getProperties()) {
      const member = builtins.members.get(property)
      if (member && scopedHelperMethods[member])
        properties.set(property.name, scopedHelperMethods[member])
    }
    if (!properties.size) continue
    const value = ctx.transformExpression(declaration.initializer)
    if (lua.isIdentifier(value)) helperObjects.set(value.text, properties)
  }
  // 模块根部的 var 和 let 都只有一份共享状态；TSTL 默认只接受 let/const。
  const shared = file.shared
  const isSharedDeclaration =
    shared &&
    node.declarationList.declarations.some((declaration) => {
      const check = (name: ts.BindingName): boolean =>
        ts.isIdentifier(name)
          ? shared.bindings.has(ctx.checker.getSymbolAtLocation(name)!)
          : name.elements.some((element) => ts.isBindingElement(element) && check(element.name))
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
  let statements = ctx.superTransformStatements(input)
  if (isSharedDeclaration) statements = rewriteSharedDeclarations(statements, shared, ctx)
  if (!globals.size && !helperObjects.size) return statements
  // 解构只生成局部声明/赋值和默认值分支。只改写声明右侧的访问链，
  // 不反射遍历整个 Lua AST，也不触碰默认值分支中的用户代码。
  const rewriteAccess = (value: lua.Expression): lua.Expression => {
    if (!lua.isTableIndexExpression(value)) return value
    value.table = rewriteAccess(value.table)
    if (lua.isIdentifier(value.table) && lua.isStringLiteral(value.index)) {
      const name = helperObjects.get(value.table.text)?.get(value.index.value)
      if (name) return field(scope(ctx, file), name)
    }
    if (
      lua.isIdentifier(value.table) &&
      globals.has(value.table.text) &&
      lua.isStringLiteral(value.index)
    ) {
      if (value.index.value === 'helper') return helpers(ctx, file)
      if (value.index.value === 'self') return field(field(value.table, 'script'), 'object')
      if (scopedGlobals.has(value.index.value)) return field(scope(ctx, file), value.index.value)
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
}
