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

/**
 * 回调会改写的顶层变量各只有一个存放位置：export let 声明的直接存在 exports 的同名字段上
 * （与 TSTL 相同），其余放进状态表；通过 export { … } 公开的名字在写入后同步。
 */
export interface SharedState {
  /** 只有存在非 export let 的可变名字时才创建。 */
  table?: lua.Identifier
  exports: lua.Expression
  bindings: Map<ts.Symbol, LuaSharedBinding>
}
const field = (table: lua.Expression, name: string) =>
  lua.createTableIndexExpression(table, lua.createStringLiteral(name))

export function sharedStorage(state: SharedState, binding: LuaSharedBinding) {
  return field(binding.declared ? state.exports : state.table!, binding.name.text)
}

export function bindSharedState(
  model: LuaEntryModel,
  context: lua.TransformationContext,
  reads: Map<ts.Symbol, lua.Expression>,
  exports: lua.Expression = lua.createIdentifier('____exports')
): SharedState | undefined {
  const bindings = model.shared.bindings.filter((binding) => binding.mutable)
  if (!bindings.length) return undefined
  const state: SharedState = {
    table: bindings.some((binding) => !binding.declared)
      ? lua.createIdentifier(context.createTempName('state'))
      : undefined,
    exports,
    bindings: new Map()
  }
  for (const binding of bindings) {
    const symbol = context.checker.getSymbolAtLocation(binding.name)!
    state.bindings.set(symbol, binding)
    reads.set(symbol, sharedStorage(state, binding))
  }
  return state
}

/** 存放位置以外的公开名字，在每次写入后同步。 */
export function aliasWrites(state: SharedState, binding: LuaSharedBinding) {
  return binding.exports
    .filter((name) => !(binding.declared && name === binding.name.text))
    .map((name) =>
      lua.createAssignmentStatement(field(state.exports, name), sharedStorage(state, binding))
    )
}

const sameField = (a: lua.Expression, b: lua.Expression): boolean =>
  (lua.isIdentifier(a) && lua.isIdentifier(b) && a.text === b.text) ||
  (lua.isTableIndexExpression(a) &&
    lua.isTableIndexExpression(b) &&
    lua.isStringLiteral(a.index) &&
    lua.isStringLiteral(b.index) &&
    a.index.value === b.index.value &&
    sameField(a.table, b.table))

export function syncSharedWrites(
  statements: lua.Statement[],
  state?: SharedState
): lua.Statement[] {
  const aliased = state && [...state.bindings.values()].filter((b) => aliasWrites(state, b).length)
  if (!state || !aliased?.length) return statements
  return statements.flatMap((statement) => {
    if (!lua.isAssignmentStatement(statement)) return [statement]
    const writes = statement.left.flatMap((target) => {
      const binding = aliased.find((item) => sameField(sharedStorage(state, item), target))
      return binding ? aliasWrites(state, binding) : []
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
      if (binding) return sharedStorage(state, binding)
    }
    if (
      lua.isTableIndexExpression(value) &&
      lua.isIdentifier(value.table) &&
      value.table.text === '____exports' &&
      lua.isStringLiteral(value.index)
    ) {
      const key = value.index.value
      const binding = [...state.bindings.values()].find((item) => item.exports.includes(key))
      if (binding) return sharedStorage(state, binding)
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
