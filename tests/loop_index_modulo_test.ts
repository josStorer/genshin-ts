import { g } from 'genshin-ts/runtime/core'

g.server({
  id: 1073741895
}).on('whenEntityIsCreated', (_evt, f) => {
  f.printString('__CASE__:loop_index_modulo:start')

  let total = 0n
  for (let outer = 0; outer < 4; outer++) {
    if (outer % 2 === 0) {
      total = total + int(outer)
    } else {
      total = total + 10n
    }
  }

  f.printString(str(total))
  f.printString('__CASE__:loop_index_modulo:end')
})
