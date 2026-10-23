import ts from 'typescript'
import * as lua from 'typescript-to-lua'

import { luaDataConstant } from '../output/data_modules.js'
import type { LuaFileContext } from './context.js'
import { id, requireModule, str } from './lua_ast.js'

export function dataReference(
  node: ts.Expression,
  ctx: lua.TransformationContext,
  file: LuaFileContext
): { module: string; key?: string } | undefined {
  if (ts.isIdentifier(node)) {
    const symbol = ctx.checker.getSymbolAtLocation(node)
    return symbol && file.dataBindings.get(symbol)
  }
  if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
    const parent = dataReference(node.expression, ctx, file)
    const key = ts.isPropertyAccessExpression(node)
      ? node.name.text
      : ts.isStringLiteralLike(node.argumentExpression)
        ? node.argumentExpression.text
        : undefined
    if (parent && !parent.key && key) return { module: parent.module, key }
  }
  return undefined
}

export function dataValue(
  reference: { module: string; key?: string },
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const module = `__gsts_data.${reference.module}${reference.key ? '.' + reference.key : ''}`
  const locals = file.dataLocals
  let local = locals.get(module)
  if (!local) {
    local = id(ctx.createTempName('data'))
    locals.set(module, local)
    file.prelude.push(lua.createVariableDeclarationStatement(local, requireModule(module)))
  }
  return local
}

export function dataAccess(
  node: ts.PropertyAccessExpression | ts.ElementAccessExpression,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const root = dataReference(node.expression, ctx, file)
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
  const reference = dataReference(node, ctx, file)
  return reference ? dataValue(reference, ctx, file) : undefined
}
