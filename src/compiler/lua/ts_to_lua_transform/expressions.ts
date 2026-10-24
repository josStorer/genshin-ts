import ts from 'typescript'
import * as lua from 'typescript-to-lua'

import { getLuaBuiltins, numberConstants, scopedHelperMethods } from '../analysis/builtins.js'
import { luaTimerGlobals } from '../analysis/standard_library.js'
import { helpers, type LuaFileContext } from './context.js'
import { dataAccess, dataReference, dataValue } from './data.js'
import { read } from './imports.js'
import { field, id, str } from './lua_ast.js'
import { scope, scopedUpdate, updateReference } from './scope.js'
import { adaptBuiltinCallback } from './standard.js'

export function transformIdentifier(
  node: ts.Identifier,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const data = dataReference(node, ctx, file)
  if (data) return dataValue(data, ctx, file)
  const builtin = getLuaBuiltins(ctx.program).global(node)
  if (luaTimerGlobals.some((name) => name === builtin)) {
    return field(scope(ctx, file), builtin!)
  }
  if (builtin === 'Boolean') return field(helpers(ctx, file), 'toBoolean')
  if (builtin === 'self') return field(field(id('_ENV'), 'script'), 'object')
  if (builtin === 'send' || builtin === 'console') return field(helpers(ctx, file), builtin)
  return adaptBuiltinCallback(
    node,
    read(node, ctx, file) ?? ctx.superTransformExpression(node),
    ctx,
    file
  )
}

export function transformSuper(
  node: ts.SuperExpression,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const value = ctx.superTransformExpression(node)
  // TSTL 的 super 优化直接生成基类标识符；这里同样接回导入绑定。
  const target = lua.isTableIndexExpression(value) ? value.table : value
  if (lua.isIdentifier(target) && target.symbolId !== undefined) {
    const symbol = ctx.symbolInfoMap.get(target.symbolId)?.symbol
    const imported = symbol && file.bindings.get(symbol)
    if (imported) {
      if (lua.isTableIndexExpression(value)) value.table = imported
      else return imported
    }
  }
  return value
}

export function transformShorthand(
  node: ts.ShorthandPropertyAssignment,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const symbol = ctx.checker.getShorthandAssignmentValueSymbol(node)
  const data = symbol && file.dataBindings.get(symbol)
  if (data)
    return lua.createTableFieldExpression(dataValue(data, ctx, file), str(node.name.text), node)
  const value = symbol && file.bindings.get(symbol)
  return value
    ? lua.createTableFieldExpression(value, str(node.name.text), node)
    : ctx.superTransformNode(node)
}

export function transformProperty(
  node: ts.PropertyAccessExpression,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  if (scopedUpdate(node, ctx, file)) return updateReference(ctx, file)
  const data = dataAccess(node, ctx, file)
  if (data) return data
  const builtins = getLuaBuiltins(ctx.program)
  const member = builtins.member(node.name)
  if (member === 'onSignal' || member === 'onVariable') return field(scope(ctx, file), member)
  if (member && scopedHelperMethods[member])
    return field(scope(ctx, file), scopedHelperMethods[member])
  if (member === 'helper') return helpers(ctx, file)
  if (member === 'self')
    return field(field(ctx.transformExpression(node.expression), 'script'), 'object')
  if (builtins.global(node.expression) === 'Number' && node.name.text in numberConstants)
    return lua.createNumericLiteral(numberConstants[node.name.text], node)
  return adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx, file)
}

export function transformElement(
  node: ts.ElementAccessExpression,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  if (scopedUpdate(node, ctx, file)) return updateReference(ctx, file)
  const member = getLuaBuiltins(ctx.program).member(node)
  if (member === 'onSignal' || member === 'onVariable') return field(scope(ctx, file), member)
  if (member && scopedHelperMethods[member])
    return field(scope(ctx, file), scopedHelperMethods[member])
  return (
    dataAccess(node, ctx, file) ??
    adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx, file)
  )
}

export function transformWrapped(
  node: ts.ParenthesizedExpression | ts.AsExpression | ts.NonNullExpression,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  return adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx, file)
}
