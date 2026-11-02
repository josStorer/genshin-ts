import { g } from 'genshin-ts/runtime/core'

import { formatClicks } from './lib/format'

// Mount on the Counter container, which has a text box named Label. hud.ts calls the methods below.
// 挂载到 Counter 容器上，容器里放名为 Label 的文本框。hud.ts 会调用下面的公开方法。
export default g.clientControlScript((lua) => {
  const label = lua.helper.requireControl(self, 'Label', 'ClientUITextBoxControl')

  return {
    onStart() {
      label.text = formatClicks(0)
    },
    methods: {
      show(clicks: number) {
        label.text = formatClicks(clicks)
      }
    }
  }
})
