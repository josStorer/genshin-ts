import { g } from 'genshin-ts/runtime/core'

import { Signal } from '../resources/signals'
import { formatJumps } from './lib/format'

// Mount on a container that has a text box named Title.
// 挂载到一个容器上，容器里放名为 Title 的文本框。
export default g.clientControlScript((lua) => {
  const title = lua.helper.requireControl(self, 'Title', 'ClientUITextBoxControl')
  let jumps = 0

  // Each jump updates the text box and tells the server node graph.
  // 每次跳跃都更新文本框，并通知服务器节点图。
  lua.onKey(self, lua.Enum.KeyEventType.KeyboardJumpKeyDown, () => {
    jumps += 1
    title.text = formatJumps(jumps)
    send(Signal.JumpPressed, jumps)
  })

  return {
    onStart() {
      title.text = formatJumps(jumps)
    }
  }
})
