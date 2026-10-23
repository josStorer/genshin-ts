import ts from 'typescript'
import type * as lua from 'typescript-to-lua'

import { createFileContext, type FileContexts, type SharedFiles } from './context.js'
import { printSharedFiles } from './entry_shared.js'
import { transformEntryStatement, transformExportAssignment } from './entry.js'
import {
  transformElement,
  transformIdentifier,
  transformProperty,
  transformShorthand,
  transformSuper,
  transformWrapped
} from './expressions.js'
import { transformExport } from './imports.js'
import { transformSourceFile } from './source_file.js'
import { transformCall } from './standard.js'
import { transformVariables } from './variables.js'

export { diagnostic, entryCall, hooks } from '../analysis/syntax.js'

export function createLuaPlugin(
  resolve: (name: string, source: string) => string | undefined,
  nativeDefault: (name: string, source: string) => boolean = () => false,
  rootDir = '.'
): lua.Plugin {
  const options = { resolve, nativeDefault, rootDir }
  const sharedFiles: SharedFiles = new Map()
  const files: FileContexts = new WeakMap()
  const file = (ctx: lua.TransformationContext) => files.get(ctx.sourceFile)!
  return {
    afterPrint: (...args) => printSharedFiles(sharedFiles, ...args),
    visitors: {
      [ts.SyntaxKind.SourceFile]: (node, ctx) => {
        files.set(node, createFileContext(node, ctx, options))
        return transformSourceFile(node, ctx, files, sharedFiles)
      },
      [ts.SyntaxKind.ImportDeclaration]: () => [],
      [ts.SyntaxKind.VariableStatement]: (node, ctx) => transformVariables(node, ctx, file(ctx)),
      [ts.SyntaxKind.Identifier]: (node, ctx) => transformIdentifier(node, ctx, file(ctx)),
      [ts.SyntaxKind.SuperKeyword]: (node, ctx) => transformSuper(node, ctx, file(ctx)),
      [ts.SyntaxKind.ShorthandPropertyAssignment]: (node, ctx) =>
        transformShorthand(node, ctx, file(ctx)),
      [ts.SyntaxKind.ExpressionStatement]: (node, ctx) =>
        transformEntryStatement(node, ctx, file(ctx)),
      [ts.SyntaxKind.ExportAssignment]: (node, ctx) =>
        transformExportAssignment(node, ctx, file(ctx)),
      [ts.SyntaxKind.ExportDeclaration]: (node, ctx) => transformExport(node, ctx, file(ctx)),
      [ts.SyntaxKind.PropertyAccessExpression]: (node, ctx) =>
        transformProperty(node, ctx, file(ctx)),
      [ts.SyntaxKind.ElementAccessExpression]: (node, ctx) =>
        transformElement(node, ctx, file(ctx)),
      [ts.SyntaxKind.ParenthesizedExpression]: (node, ctx) =>
        transformWrapped(node, ctx, file(ctx)),
      [ts.SyntaxKind.AsExpression]: (node, ctx) => transformWrapped(node, ctx, file(ctx)),
      [ts.SyntaxKind.NonNullExpression]: (node, ctx) => transformWrapped(node, ctx, file(ctx)),
      [ts.SyntaxKind.CallExpression]: (node, ctx) => transformCall(node, ctx, file(ctx))
    }
  }
}
