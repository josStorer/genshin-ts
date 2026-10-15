import { signalKinds } from '../../runtime/signal_definition.js'

/** Lua 表只保存种类元数据；list 的名称和写入方法从同一条标量定义派生。 */
export function renderSignalKindsLua() {
  const fields: string[] = []
  for (const [name, kind] of Object.entries(signalKinds)) {
    if (kind.writer === undefined) continue
    for (const list of [false, true]) {
      fields.push(
        `    ${name}${list ? '_list' : ''} = {writer=${JSON.stringify(kind.writer + (list ? 'List' : ''))}, validation=${JSON.stringify(kind.validation)}, list=${list}}`
      )
    }
  }
  return `return {\n${fields.join(',\n')}\n}\n`
}
