import ts from 'typescript'

import { t } from '../../../i18n/index.js'

/** 提前检查和 TSTL 错误翻译共用同一套说明，保留原来的定位信息。 */
export function unsupportedLuaSyntax(node: ts.Node): string | undefined {
  if (node.kind === ts.SyntaxKind.RegularExpressionLiteral) return t('lua_regexLiteral')
  if (
    ts.isYieldExpression(node) ||
    (ts.isFunctionLike(node) && 'asteriskToken' in node && node.asteriskToken)
  )
    return t('lua_generator')
  return undefined
}

export function localizeLuaTranspileError(message: string, node?: ts.Node) {
  const unsupported = /^Unsupported node kind (\w+)/.exec(message)
  if (!unsupported) return message
  if (node) {
    const explanation = unsupportedLuaSyntax(node)
    if (explanation) return explanation
  }
  if (unsupported[1] === 'RegularExpressionLiteral') return t('lua_regexLiteral')
  if (unsupported[1] === 'YieldExpression') return t('lua_generator')
  return t('lua_unsupportedNode', { arg0: unsupported[1] })
}

export function localizeLuaTranspileDiagnostic(diagnostic: ts.Diagnostic): ts.Diagnostic {
  if (typeof diagnostic.messageText !== 'string') return diagnostic
  const messageText = localizeLuaTranspileError(diagnostic.messageText)
  return messageText === diagnostic.messageText ? diagnostic : { ...diagnostic, messageText }
}

/** 同一条件已有可操作的 GSTS 错误时，不再重复显示 TSTL 的真值提醒。 */
export function removeDuplicateTruthiness(diagnostics: readonly ts.Diagnostic[]) {
  const sites = new Set(
    diagnostics
      .filter((d) => d.source === 'lua-truthiness' && d.code === 97001)
      .map((d) => `${d.file?.fileName}:${d.start}:${d.length}`)
  )
  return diagnostics.filter(
    (d) => d.code !== 100037 || !sites.has(`${d.file?.fileName}:${d.start}:${d.length}`)
  )
}
