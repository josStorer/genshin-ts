import ts from 'typescript'
import * as lua from 'typescript-to-lua'

import type { LuaEntryModel } from '../analysis/entry_model.js'
import { hooks } from '../analysis/syntax.js'
import type { LuaFileContext } from './context.js'
import { field, id } from './lua_ast.js'

export function finishEntry(result: lua.File, file: LuaFileContext) {
  if (file.entry) {
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

export function generateEntry(model: LuaEntryModel, ctx: lua.TransformationContext) {
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

export function transformEntryStatement(
  node: ts.ExpressionStatement,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const model = file.entry
  return model && node.expression === model.call
    ? generateEntry(model, ctx)
    : ctx.superTransformStatements(node)
}

export function transformExportAssignment(
  node: ts.ExportAssignment,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const model = file.entry
  if (!model || node.expression !== model.call) return ctx.superTransformStatements(node)
  return generateEntry(model, ctx)
}
