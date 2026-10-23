import path from 'node:path'

import type { RawSourceMap } from 'source-map'
import ts from 'typescript'
import * as lua from 'typescript-to-lua'

import type { LuaEntryModel, LuaSharedBinding } from '../analysis/entry_model.js'
import type { LuaFileContext, SharedFiles } from './context.js'
import { finishEntry } from './entry.js'
import { bindImports, generatePrelude, generateReexports } from './imports.js'
import { field, id, requireModule } from './lua_ast.js'
import { discardAdaptedCallbackDiagnostics, transformSharedSource } from './tstl_compat.js'

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

// 只移除转换器直接追加的别名写入，不遍历 Lua AST 的其他字段。
export function withoutAliasWrites(
  statements: lua.Statement[],
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const aliases = file.sharedAliases
  if (!aliases?.size) return statements
  return statements.filter((statement) => {
    if (!lua.isAssignmentStatement(statement) || statement.left.length !== 1) return true
    const target = statement.left[0]
    return !(
      lua.isTableIndexExpression(target) &&
      lua.isIdentifier(target.table) &&
      target.table.text === '____exports' &&
      lua.isStringLiteral(target.index) &&
      aliases.has(target.index.value)
    )
  })
}

export function sharedExportWrites(
  node: ts.Expression,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const shared = file.shared
  if (!shared) return []
  const target =
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
    node.operatorToken.kind <= ts.SyntaxKind.LastAssignment
      ? node.left
      : (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
          (node.operator === ts.SyntaxKind.PlusPlusToken ||
            node.operator === ts.SyntaxKind.MinusMinusToken)
        ? node.operand
        : undefined
  const writes: lua.Statement[] = []
  const visit = (value: ts.Expression) => {
    if (ts.isIdentifier(value)) {
      const binding = shared.bindings.get(ctx.checker.getSymbolAtLocation(value)!)
      if (binding) writes.push(...aliasWrites(shared, binding))
    } else if (ts.isArrayLiteralExpression(value)) value.elements.forEach(visit)
    else if (ts.isObjectLiteralExpression(value))
      for (const property of value.properties) {
        if (ts.isPropertyAssignment(property)) visit(property.initializer)
        else if (ts.isShorthandPropertyAssignment(property)) {
          const binding = shared.bindings.get(
            ctx.checker.getShorthandAssignmentValueSymbol(property)!
          )
          if (binding) writes.push(...aliasWrites(shared, binding))
        } else if (ts.isSpreadAssignment(property)) visit(property.expression)
      }
    else if (ts.isSpreadElement(value) || ts.isParenthesizedExpression(value))
      visit(value.expression)
    else if (ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.EqualsToken)
      visit(value.left)
  }
  if (target) visit(target)
  return writes
}

export function sharedAssignment(
  node: ts.BinaryExpression | ts.PrefixUnaryExpression | ts.PostfixUnaryExpression,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  if (!file.sharedAliases?.size && !file.shared) return ctx.superTransformExpression(node)
  ctx.pushPrecedingStatements()
  const result = ctx.superTransformExpression(node)
  ctx.addPrecedingStatements([
    ...withoutAliasWrites(ctx.popPrecedingStatements(), ctx, file),
    ...sharedExportWrites(node, ctx, file)
  ])
  return result
}

export function sharedLoop(
  node: ts.ForOfStatement | ts.ForInStatement,
  ctx: lua.TransformationContext,
  file: LuaFileContext
) {
  const result = ctx.superTransformStatements(node)
  if (file.shared && !ts.isVariableDeclarationList(node.initializer)) {
    for (const statement of result)
      if (lua.isForInStatement(statement)) {
        statement.body.statements = syncSharedWrites(
          withoutAliasWrites(statement.body.statements, ctx, file),
          file.shared
        )
      }
  }
  return result
}

export function transformSourceFile(
  node: ts.SourceFile,
  ctx: lua.TransformationContext,
  selectFile: (file: LuaFileContext) => void,
  sharedFiles: SharedFiles,
  file: LuaFileContext
) {
  const state = file
  const model = state.entry
  if (model?.shared.runtime) state.sharedAliases = new Set(model.shared.aliases)
  let entrySource = node
  if (model?.shared.runtime) {
    // 同一份已分析的 AST 先生成共享模块，再生成挂载；不构造第二个 Program。
    const sharedState: LuaFileContext = {
      ...state,
      entry: undefined,
      prelude: [],
      bindings: new Map(),
      getters: [],
      dataBindings: new Map(),
      dataLocals: new Map(),
      adaptedCallbacks: new Set()
    }
    selectFile(sharedState)
    file = sharedState
    sharedState.shared = bindSharedState(model, ctx, sharedState.bindings)
    bindImports(node, ctx, file)
    const sharedSource = ts.factory.updateSourceFile(node, model.shared.statements)
    const shared = transformSharedSource(sharedSource, ctx)
    if (!lua.isFile(shared)) throw new Error('TSTL did not return a shared Lua file')
    generateReexports(shared, ctx, file)
    finishSharedEntry(shared, model, ctx, sharedState.shared?.table)
    if (sharedState.shared?.table)
      sharedState.prelude.push(
        lua.createVariableDeclarationStatement(
          sharedState.shared.table,
          lua.createTableExpression()
        )
      )
    generatePrelude(shared, ctx, file)
    shared.statements.unshift(...sharedState.prelude)
    discardAdaptedCallbackDiagnostics(ctx, sharedState.adaptedCallbacks)
    shared.luaLibFeatures = new Set(shared.luaLibFeatures)
    ctx.usedLuaLibFeatures.clear()
    sharedFiles.set(sharedEntryFile(node.fileName, file.options.rootDir), {
      source: node,
      ast: shared
    })
    selectFile(state)
    file = state
    const module = sharedEntryModule(
      path
        .relative(file.options.rootDir, node.fileName)
        .replaceAll('\\', '/')
        .replace(/\.[cm]?tsx?$/, '')
    )
    const local = id(ctx.createTempName('shared'))
    state.prelude.push(lua.createVariableDeclarationStatement(local, requireModule(module)))
    const sharedExports = model.shared.bindings.some(
      (binding) => binding.mutable && binding.exports.length
    )
      ? id(ctx.createTempName('sharedExports'))
      : field(local, 'exports')
    if (lua.isIdentifier(sharedExports))
      state.prelude.push(
        lua.createVariableDeclarationStatement(sharedExports, field(local, 'exports'))
      )
    state.shared = bindSharedState(model, ctx, state.bindings, sharedExports)
    if (state.shared?.table)
      state.prelude.push(
        lua.createVariableDeclarationStatement(state.shared.table, field(local, 'state'))
      )
    if (model.shared.bindings.some((binding) => !binding.mutable)) {
      const values = id(ctx.createTempName('values'))
      state.prelude.push(lua.createVariableDeclarationStatement(values, field(local, 'values')))
      for (const { name, mutable } of model.shared.bindings) {
        if (mutable) continue
        const symbol = ctx.checker.getSymbolAtLocation(name)
        if (symbol) state.bindings.set(symbol, field(values, name.text))
      }
    }
    entrySource = ts.factory.updateSourceFile(
      node,
      node.statements.filter(
        (statement) => statement === model.call.parent || ts.isImportDeclaration(statement)
      )
    )
  }
  bindImports(node, ctx, file)
  const result = ctx.superTransformNode(entrySource)[0]
  if (!lua.isFile(result)) throw new Error('TSTL did not return a Lua file')
  finishEntry(result, ctx, file)
  generateReexports(result, ctx, file)
  discardAdaptedCallbackDiagnostics(ctx, state.adaptedCallbacks)
  generatePrelude(result, ctx, file)
  result.statements.unshift(...state.prelude)
  return result
}

export function printSharedFiles(
  sharedFiles: SharedFiles,
  ...[program, _options, host, results]: Parameters<NonNullable<lua.Plugin['afterPrint']>>
) {
  for (const [fileName, { source, ast }] of sharedFiles) {
    const printed = new lua.LuaPrinter(host, program, source.fileName).print(ast)
    const map = JSON.parse(printed.sourceMap) as RawSourceMap
    const from = path.dirname(lua.getEmitPath(source.fileName, program))
    const to = path.dirname(lua.getEmitPath(fileName, program))
    map.sources = map.sources.map((name) =>
      path.relative(to, path.resolve(from, name)).replaceAll('\\', '/')
    )
    results.push({
      fileName,
      code: printed.code,
      sourceMap: JSON.stringify(map),
      sourceFiles: [source],
      luaAst: ast
    })
  }
}
