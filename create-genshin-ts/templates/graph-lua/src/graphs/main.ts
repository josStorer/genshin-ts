import { g } from 'genshin-ts/runtime/core'

import { Signal } from '../resources/signals'

g.server({
  id: 1073741825
})
  .on('whenEntityIsCreated', () => {
    console.log('hello world')
  })
  // Sent by src/lua/hud.ts each time the player jumps.
  // 玩家每次跳跃时由 src/lua/hud.ts 发出。
  .onSignal(Signal.JumpPressed, (evt) => {
    console.log(evt.params.count)
  })
