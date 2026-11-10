import { g } from 'genshin-ts/runtime/core'

g.server({ id: 1073742421 }).on('whenEntityIsCreated', (_evt, f) => {
  const __gstsTimerEvt = 'EXPECTED_CAPTURE'
  const __gstsTimerEvt_1 = 'SECOND_CAPTURE'
  setTimeout(() => {
    f.printString(__gstsTimerEvt)
    f.printString(__gstsTimerEvt_1)
  }, 10)
})

g.server({ id: 1073742422 }).on('whenEntityIsCreated', () => {
  setTimeout((customEvt, f) => f.printString(customEvt.timerName), 10)
})
