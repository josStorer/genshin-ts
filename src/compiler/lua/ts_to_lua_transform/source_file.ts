import type ts from 'typescript'
import * as lua from 'typescript-to-lua'

import { withFileContext, type FileContexts, type SharedFiles } from './context.js'
import {
  bindSharedEntry,
  generateSharedModule,
  sharedEntryFile,
  sharedModuleContext
} from './entry_shared.js'
import { finishEntry } from './entry.js'
import { bindImports, generatePrelude, generateReexports } from './imports.js'
import { discardAdaptedCallbackDiagnostics } from './tstl_compat.js'

/**
 * 每个源文件的转换顺序。入口文件有顶层运行时代码时，先用同一份 AST 生成共享模块，
 * 再生成只含入口的挂载脚本；其他文件直接转换。不构造第二个 Program。
 */
export function transformSourceFile(
  node: ts.SourceFile,
  ctx: lua.TransformationContext,
  files: FileContexts,
  sharedFiles: SharedFiles
): lua.File {
  const file = files.get(node)!
  const model = file.entry
  let source = node
  if (model?.shared.runtime) {
    const shared = withFileContext(files, node, sharedModuleContext(file), (sharedFile) =>
      generateSharedModule(node, model, ctx, sharedFile)
    )
    sharedFiles.set(sharedEntryFile(node.fileName, file.options.rootDir), {
      source: node,
      ast: shared
    })
    source = bindSharedEntry(node, model, ctx, file)
  }
  bindImports(node, ctx, file)
  const result = ctx.superTransformNode(source)[0]
  if (!lua.isFile(result)) throw new Error('TSTL did not return a Lua file')
  finishEntry(result, ctx, file)
  generateReexports(result, ctx, file)
  discardAdaptedCallbackDiagnostics(ctx, file.adaptedCallbacks)
  generatePrelude(result, ctx, file)
  result.statements.unshift(...file.prelude)
  return result
}
