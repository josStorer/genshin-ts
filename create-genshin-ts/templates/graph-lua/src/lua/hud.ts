import { g } from 'genshin-ts/runtime/core'

import { Signal } from '../resources/signals'
import { GREETING } from '../shared/constants'
import type Counter from './counter'
import { formatClicks } from './lib/format'
import { banner } from './native/banner'

// Mount on a container that has a text box named Title and a child container named Counter
// (which mounts lua/counter).
// 挂载到一个容器上：容器里放名为 Title 的文本框，以及名为 Counter 的子容器（子容器挂载 lua/counter）。
export default g.clientControlScript((lua) => {
  const title = lua.helper.requireControl(self, 'Title', 'ClientUITextBoxControl')
  const counter = lua.helper.findScript<typeof Counter>(self, 'Counter')
  let clicks = 0

  lua.onKey(self, lua.Enum.KeyEventType.KeyboardJumpKeyDown, () => {
    clicks += 1
    counter?.methods.show(clicks)
    send(Signal.HudClicked, clicks)
  })

  return {
    onStart() {
      title.text = banner(GREETING)
    },
    onEnable() {
      // Runs every second on level time; pauses while disabled and is cleared on destroy.
      // 按关卡时间每秒执行一次；停用时暂停，销毁时自动清除。
      setInterval(() => {
        title.text = banner(`${GREETING} · ${formatClicks(clicks)}`)
      }, 1000)
    }
  }
})
