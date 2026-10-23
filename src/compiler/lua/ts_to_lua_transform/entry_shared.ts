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
 * （与 TSTL 相同），其余放进状态表。
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
      if (binding && !binding.declared) return sharedStorage(state, binding)
    }
    return value
  }
  return statements.flatMap((statement) => {
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
  let entrySource = node
  if (model?.shared.runtime) {
    // 同一份已分析的 AST 先生成共享模块，再生成挂载；不构造第二个 Program。
    const sharedState: LuaFileContext = {
      ...state,
      entry: undefined,
      sharedModule: true,
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
      (binding) => binding.mutable && binding.declared
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
