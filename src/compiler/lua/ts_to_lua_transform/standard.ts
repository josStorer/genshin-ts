import path from 'node:path'

import ts from 'typescript'
import * as lua from 'typescript-to-lua'

import { getLuaBuiltins } from '../analysis/builtins.js'
import { scriptEntryOf } from '../analysis/syntax.js'
import { helpers, type LuaFileContext } from './context.js'
import { field, id, requireModule, str } from './lua_ast.js'
import { scope, scopedUpdate } from './scope.js'
import { ContextType, getFunctionContextType, transformOrderedExpressions } from './tstl_compat.js'

// TSTL 的数组工具会多传一个 self 槽；适配不使用 this 的回调，并保留其他诊断。
export function adaptBuiltinCallback(
  node: ts.Expression,
  value: lua.Expression,
  ctx: lua.TransformationContext,
  file: LuaFileContext
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
  file.adaptedCallbacks.add(ts.getOriginalNode(node))
  return lua.createFunctionExpression(
    lua.createBlock([
      lua.createReturnStatement([lua.createCallExpression(callback, [lua.createDotsLiteral()])])
    ]),
    [id('_')],
    lua.createDotsLiteral()
  )
}

export function transformCall(
  node: ts.CallExpression,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const callee = node.expression
  if (scopedUpdate(callee, ctx, file))
    return lua.createCallExpression(
      field(scope(ctx, file), 'enableUpdate'),
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
  const member = builtins.member(callee)
  if (member === 'readParams' && node.arguments.length === 1)
    return lua.createCallExpression(
      field(helpers(ctx, file), 'readParams'),
      [field(id('_ENV'), 'script'), ...transformOrderedExpressions(ctx, node.arguments)],
      node
    )
  if (member === 'findScript' || member === 'requireScript') {
    // 脚本路径就是入口相对 compileRoot 的模块路径（与编辑器里挂载的 lua/board 一致）；无效时诊断已报错。
    const entry = scriptEntryOf(node, ctx.checker)
    const scriptPath = entry
      ? path
          .relative(file.options.rootDir, entry.fileName)
          .replaceAll('\\', '/')
          .replace(/\.tsx?$/, '')
      : ''
    return lua.createCallExpression(
      field(helpers(ctx, file), member),
      [str(scriptPath), ...transformOrderedExpressions(ctx, node.arguments)],
      node
    )
  }
  if (builtins.global(callee) === 'send') {
    return lua.createCallExpression(
      field(helpers(ctx, file), 'send'),
      transformOrderedExpressions(ctx, node.arguments),
      node
    )
  }
  if (ts.isPropertyAccessExpression(callee) && builtins.global(callee.expression) === 'console') {
    return lua.createCallExpression(
      field(field(helpers(ctx, file), 'console'), callee.name.text),
      transformOrderedExpressions(ctx, node.arguments),
      node
    )
  }
  return adaptBuiltinCallback(node, ctx.superTransformExpression(node), ctx, file)
}
