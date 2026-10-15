import { g } from 'genshin-ts/runtime/core'

export default g.clientControlScript((lua) => {
  let ticks = 0

  return {
    onStart() {
      lua.print('Lua ready', self.name)
    },
    onEnable() {
      // Milliseconds; follows level time. Disable/Destroy clears this interval.
      setInterval(() => {
        ticks += 1
        console.log('Lua tick', ticks)
      }, 1000)
    }
  }
})
