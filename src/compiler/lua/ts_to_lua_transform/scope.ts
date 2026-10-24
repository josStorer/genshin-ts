import ts from 'typescript'
import * as lua from 'typescript-to-lua'

import { getLuaBuiltins } from '../analysis/builtins.js'
import { helpers, type LuaFileContext } from './context.js'
import { field, id } from './lua_ast.js'

export function scope(ctx: lua.TransformationContext, file: LuaFileContext) {
  let local = file.scope
  if (!local) {
    local = id(ctx.createTempName('scope'))
    file.scope = local
    helpers(ctx, file)
  }
  return local
}

export function scopedUpdate(
  node: ts.Expression,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  if (!(ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))) return false
  const builtins = getLuaBuiltins(ctx.program)
  if (builtins.member(node) !== 'enableUpdate' || !builtins.isCurrentScript(node.expression))
    return false
  const model = file.entry
  return !!model && Object.values(model.scope).some(Boolean)
}

// 方法引用仍接收 TSTL 的 self 槽，实际开关归属当前挂载的作用域。
export function updateReference(ctx: lua.TransformationContext, file: LuaFileContext) {
  const enabled = id('enabled')
  return lua.createFunctionExpression(
    lua.createBlock([
      lua.createExpressionStatement(
        lua.createCallExpression(field(scope(ctx, file), 'enableUpdate'), [enabled])
      )
    ]),
    [id('_'), enabled]
  )
}
