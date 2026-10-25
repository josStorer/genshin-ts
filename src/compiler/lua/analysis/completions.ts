import ts from 'typescript'

import { t } from '../../../i18n/index.js'

// lua. 同时包含官方 API、gsts 工具和 Lua 标准库。补全时按常用程度排列前两类，标准库排在后面并标注来源；
// lua.helper. 把最常用的工具放前面；lua.Color 是可调用对象，TS 会附带函数自身的 apply、bind 等成员，这里去掉。
const environmentOrder = [
  'game',
  'helper',
  'script',
  'self',
  'onSignal',
  'onVariable',
  'onKey',
  'onCursor',
  'Color',
  'Enum'
]
const helperOrder = [
  'findControl',
  'findScript',
  'readParams',
  'readVariable',
  'setTimeout',
  'setInterval',
  'requireControl',
  'isControl',
  'requireScript',
  'scriptHandle',
  'multi',
  'clamp',
  'lerp',
  'moveTowards'
]
const functionMembers = new Set([
  'apply',
  'bind',
  'call',
  'arguments',
  'caller',
  'length',
  'prototype',
  'toString'
])

/** 光标处成员补全的接收者，例如 `lua.he|` 里的 `lua`。 */
function memberReceiver(source: ts.SourceFile, position: number) {
  let found: ts.PropertyAccessExpression | undefined
  const visit = (node: ts.Node): void => {
    if (position < node.getFullStart() || position > node.getEnd()) return
    if (ts.isPropertyAccessExpression(node) && node.expression.getEnd() < position) found = node
    ts.forEachChild(node, visit)
  }
  visit(source)
  return found?.expression
}

/** 排在前面的成员按列表顺序，其余保持 TS 原来的顺序。 */
function ranked(entry: ts.CompletionEntry, order: readonly string[]) {
  const rank = order.indexOf(entry.name)
  return rank < 0 ? '1' + entry.sortText : '0' + String(rank).padStart(2, '0')
}

/** 编辑器插件调用：整理 lua.、lua.helper. 和 lua.Color. 的成员补全，其他补全原样返回。 */
export function arrangeLuaCompletions(
  info: ts.CompletionInfo,
  source: ts.SourceFile,
  position: number,
  program: ts.Program
): ts.CompletionInfo {
  if (!info.isMemberCompletion) return info
  const receiver = memberReceiver(source, position)
  if (!receiver) return info
  const type = program.getTypeChecker().getTypeAtLocation(receiver)
  const name = type.aliasSymbol?.getName() ?? type.getSymbol()?.getName()
  if (name === 'ClientGlobals') {
    const standard = t('lua_completionStandard')
    return {
      ...info,
      entries: info.entries.map((entry) => ({
        ...entry,
        sortText: ranked(entry, environmentOrder),
        ...(environmentOrder.includes(entry.name)
          ? {}
          : { labelDetails: { ...entry.labelDetails, description: standard } })
      }))
    }
  }
  if (name === 'ClientHelpers')
    return {
      ...info,
      entries: info.entries.map((entry) => ({ ...entry, sortText: ranked(entry, helperOrder) }))
    }
  if (name === 'HostColor')
    return { ...info, entries: info.entries.filter((entry) => !functionMembers.has(entry.name)) }
  return info
}
