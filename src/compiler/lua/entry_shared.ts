import path from 'node:path'

import ts from 'typescript'
import * as lua from 'typescript-to-lua'

import type { LuaEntryModel, LuaSharedBinding } from './entry_model.js'

/** 保留目录不能作为用户模块路径；入口的挂载路径不变。 */
export const sharedEntryModule = (module: string) => `__gsts_shared/${module}`
export const sharedEntryFile = (source: string, root: string) =>
  path.join(root, '__gsts_shared', path.relative(root, source))

/** 只把回调用到的名字交给挂载；状态和固定绑定都是普通表字段。 */
export function finishSharedEntry(
  result: lua.File,
  model: LuaEntryModel,
  context: lua.TransformationContext,
  state: lua.Identifier | undefined
) {
  const fields = [
    lua.createTableFieldExpression(
      lua.createIdentifier('____exports'),
      lua.createStringLiteral('exports')
    )
  ]
  if (state) fields.push(lua.createTableFieldExpression(state, lua.createStringLiteral('state')))
  const values = model.shared.bindings.filter((binding) => !binding.mutable)
  if (values.length)
    fields.push(
      lua.createTableFieldExpression(
        lua.createTableExpression(
          values.map(({ name }) =>
            lua.createTableFieldExpression(
              context.transformExpression(name),
              lua.createStringLiteral(name.text)
            )
          )
        ),
        lua.createStringLiteral('values')
      )
    )
  const last = result.statements.at(-1)
  if (!last || !lua.isReturnStatement(last)) throw new Error('Shared entry must return its exports')
  last.expressions = [lua.createTableExpression(fields)]
}

/** 状态是唯一的读写位置；公开导出只在赋值时同步，没有读取函数或元表。 */
export interface SharedState {
  table: lua.Identifier
  exports: lua.Expression
  bindings: Map<ts.Symbol, LuaSharedBinding>
  fields: Map<string, LuaSharedBinding>
}
const field = (table: lua.Expression, name: string) =>
  lua.createTableIndexExpression(table, lua.createStringLiteral(name))

export function bindSharedState(
  model: LuaEntryModel,
  context: lua.TransformationContext,
  reads: Map<ts.Symbol, lua.Expression>,
  exports: lua.Expression = lua.createIdentifier('____exports')
): SharedState | undefined {
  const bindings = model.shared.bindings.filter((binding) => binding.mutable)
  if (!bindings.length) return undefined
  const table = lua.createIdentifier(context.createTempName('state'))
  const state: SharedState = { table, exports, bindings: new Map(), fields: new Map() }
  for (const binding of bindings) {
    const symbol = context.checker.getSymbolAtLocation(binding.name)!
    state.bindings.set(symbol, binding)
    state.fields.set(binding.name.text, binding)
    reads.set(symbol, field(table, binding.name.text))
  }
  return state
}

/** 每次实际写入后更新公开字段；私有名字永远不进入 exports。 */
export function syncSharedWrites(
  statements: lua.Statement[],
  state?: SharedState
): lua.Statement[] {
  if (!state) return statements
  return statements.flatMap((statement) => {
    if (!lua.isAssignmentStatement(statement)) return [statement]
    const writes = statement.left.flatMap((target) => {
      if (
        !lua.isTableIndexExpression(target) ||
        !lua.isIdentifier(target.table) ||
        target.table.text !== state.table.text ||
        !lua.isStringLiteral(target.index)
      )
        return []
      const binding = state.fields.get(target.index.value)
      return (binding?.exports ?? []).map((name) =>
        lua.createAssignmentStatement(field(state.exports, name), target)
      )
    })
    return [statement, ...writes]
  })
}

/** TSTL 直接生成声明左侧，绕过 Identifier 访问器；只转换声明与解构默认值分支。 */
export function rewriteSharedDeclarations(
  statements: lua.Statement[],
  state: SharedState,
  context: lua.TransformationContext
): lua.Statement[] {
  const target = (value: lua.Expression): lua.Expression => {
    if (lua.isIdentifier(value) && value.symbolId !== undefined) {
      const symbol = context.symbolInfoMap.get(value.symbolId)?.symbol
      const binding = symbol && state.bindings.get(symbol)
      if (binding) return field(state.table, binding.name.text)
    }
    if (
      lua.isTableIndexExpression(value) &&
      lua.isIdentifier(value.table) &&
      value.table.text === '____exports' &&
      lua.isStringLiteral(value.index)
    ) {
      const key = value.index.value
      const binding = [...state.fields.values()].find((binding) => binding.exports.includes(key))
      if (binding) return field(state.table, binding.name.text)
    }
    return value
  }
  const rewritten = statements.flatMap((statement) => {
    if (lua.isVariableDeclarationStatement(statement)) {
      const left = statement.left.map(target)
      if (left.every((value, index) => value === statement.left[index])) return [statement]
      const locals = left.filter(lua.isIdentifier)
      return [
        ...(locals.length ? [lua.createVariableDeclarationStatement(locals)] : []),
        lua.createAssignmentStatement(
          left as lua.AssignmentLeftHandSideExpression[],
          statement.right ?? [lua.createNilLiteral()]
        )
      ]
    }
    if (lua.isAssignmentStatement(statement))
      statement.left = statement.left.map(
        (value) => target(value) as lua.AssignmentLeftHandSideExpression
      )
    if (
      lua.isIfStatement(statement) &&
      lua.isBinaryExpression(statement.condition) &&
      statement.condition.operator === lua.SyntaxKind.EqualityOperator &&
      lua.isNilLiteral(statement.condition.right)
    ) {
      statement.condition.left = target(statement.condition.left)
      statement.ifBlock.statements = rewriteSharedDeclarations(
        statement.ifBlock.statements,
        state,
        context
      )
    }
    return [statement]
  })
  return syncSharedWrites(rewritten, state)
}
