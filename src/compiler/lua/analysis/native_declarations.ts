import ts from 'typescript'

import { t } from '../../../i18n/index.js'
import { diagnostic } from './syntax.js'

/** 只检查真正配有原生 Lua 文件的声明，不改变普通 TS 或 SDK 声明规则。 */
export function isNativeLuaDeclaration(source: ts.SourceFile) {
  return (
    source.isDeclarationFile &&
    source.fileName.endsWith('.d.ts') &&
    ts.sys.fileExists(source.fileName.slice(0, -5) + '.lua')
  )
}

export function nativeDeclarationDiagnostics(source: ts.SourceFile, checker: ts.TypeChecker) {
  const diagnostics: ts.Diagnostic[] = []
  if (!isNativeLuaDeclaration(source)) return diagnostics
  const visit = (node: ts.Node) => {
    const member = ts.isMethodSignature(node) || ts.isPropertySignature(node)
    const callable = member || ts.isFunctionDeclaration(node) || ts.isFunctionTypeNode(node)
    if (callable) {
      // 函数类型在属性上整体检查，避免同一声明报两次。
      if (ts.isFunctionTypeNode(node) && ts.isPropertySignature(node.parent)) return
      const signatures = checker
        .getNonNullableType(checker.getTypeAtLocation(node))
        .getCallSignatures()
      if (member && signatures.some((signature) => !signature.thisParameter))
        diagnostics.push({ ...diagnostic(node, t('lua_nativeThis')), source: 'lua-native-this' })
      if (
        signatures.some((signature) => {
          const result = checker.getReturnTypeOfSignature(signature)
          return !result.getProperty('__tstlMultiReturn') && checker.isTupleType(result)
        })
      )
        diagnostics.push({
          ...diagnostic(node, t('lua_nativeTuple')),
          source: 'lua-native-multi-return'
        })
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return diagnostics
}
