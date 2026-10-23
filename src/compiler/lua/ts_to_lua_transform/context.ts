import ts from 'typescript'
import * as lua from 'typescript-to-lua'

import { analyzeLuaEntry } from '../analysis/entry_analysis.js'
import type { LuaEntryModel } from '../analysis/entry_model.js'
import { type SharedState } from './entry_shared.js'
import { id } from './lua_ast.js'

export interface LuaTransformOptions {
  resolve: (name: string, source: string) => string | undefined
  nativeDefault: (name: string, source: string) => boolean
  rootDir: string
}
export type SharedFiles = Map<string, { source: ts.SourceFile; ast: lua.File }>
/** 一个文件的导入、共享绑定和前导声明，不跨文件复用。 */
export interface LuaFileContext {
  options: LuaTransformOptions
  entry?: LuaEntryModel
  prelude: lua.Statement[]
  bindings: Map<ts.Symbol, lua.Expression>
  getters: lua.TableFieldExpression[]
  helper?: lua.Identifier
  scope?: lua.Identifier
  dataBindings: Map<ts.Symbol, { module: string; key?: string }>
  dataLocals: Map<string, lua.Identifier>
  adaptedCallbacks: Set<ts.Node>
  sharedAliases?: ReadonlySet<string>
  shared?: SharedState
}
export function createFileContext(
  node: ts.SourceFile,
  ctx: lua.TransformationContext,
  options: LuaTransformOptions
): LuaFileContext {
  return {
    options,
    entry: analyzeLuaEntry(node, ctx.program).model,
    prelude: [],
    bindings: new Map(),
    getters: [],
    dataBindings: new Map(),
    dataLocals: new Map(),
    adaptedCallbacks: new Set()
  }
}
export function helpers(ctx: lua.TransformationContext, file: LuaFileContext) {
  let local = file.helper
  if (!local) {
    local = id(ctx.createTempName('helpers'))
    file.helper = local
  }
  return local
}
