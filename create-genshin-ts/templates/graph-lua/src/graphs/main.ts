import { g } from 'genshin-ts/runtime/core'

import { Signal } from '../resources/signals'
import { GREETING } from '../shared/constants'

g.server({
  id: 1073741825
})
  .on('whenEntityIsCreated', () => {
    console.log(GREETING)
  })
  // Sent by src/lua/hud.ts when the player presses jump.
  // 玩家按跳跃键时由 src/lua/hud.ts 发出。
  .onSignal(Signal.HudClicked, (evt) => {
    console.log(evt.params.count)
  })
