import ts from 'typescript'

import { t } from '../../../i18n/index.js'

// lua. 同时包含官方 API、gsts 工具和 Lua 标准库。补全时前两类排在前面，标准库排在后面并标注来源；
// lua.Color 是可调用对象，TS 会附带函数自身的 apply、bind 等成员，这里去掉。
const environmentFirst = new Set([
  'self',
  'script',
  'game',
  'Enum',
  'Color',
  'helper',
  'onSignal',
  'onVariable'
])
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

/** 编辑器插件调用：整理 lua. 和 lua.Color. 的成员补全，其他补全原样返回。 */
export function arrangeLuaCompletions(
  info: ts.CompletionInfo,
  source: ts.SourceFile,
  position: number,
  program: ts.Program
): ts.CompletionInfo {
  if (!info.isMemberCompletion) return info
  const receiver = memberReceiver(source, position)
  if (!receiver) return info
  const name = program.getTypeChecker().getTypeAtLocation(receiver).getSymbol()?.getName()
  if (name === 'ClientGlobals') {
    const standard = t('lua_completionStandard')
    return {
      ...info,
      entries: info.entries.map((entry) =>
        environmentFirst.has(entry.name)
          ? { ...entry, sortText: '0' + entry.sortText }
          : {
              ...entry,
              sortText: '1' + entry.sortText,
              labelDetails: { ...entry.labelDetails, description: standard }
            }
      )
    }
  }
  if (name === 'HostColor')
    return { ...info, entries: info.entries.filter((entry) => !functionMembers.has(entry.name)) }
  return info
}
