import { defineSignal, g } from 'genshin-ts/runtime/core'

const Signal = {
  signal_param_literal: defineSignal('signal_param_literal', [
    ['参数_1', 'int'],
    ['参数_2', 'str'],
    ['参数_3', 'bool']
  ]),
  signal_param_wired: defineSignal('signal_param_wired', [
    ['参数_1', 'int'],
    ['参数_2', 'str'],
    ['参数_3', 'entity']
  ]),
  signal_param_none: defineSignal('signal_param_none', [])
} as const

const graph = g
  .server({ id: 1073741888 })
  .on('whenEntityIsCreated', (_evt, f) => {
    f.sendSignal(Signal.signal_param_literal, int(2 + 3 + 43534), 'ready', true)
    f.sendSignal(
      Signal.signal_param_wired,
      f.addition(40n, 2n),
      f.getPlayerNickname(f.getSelfEntity() as any),
      f.getSelfEntity()
    )
    f.sendSignal('signal_param_none')
  })
  .onSignal(Signal.signal_param_wired, (evt, f) => {
    const amount = evt.params.参数_1
    const label = evt.params.参数_2
    const sender = evt.params.参数_3

    f.printString(f.dataTypeConversion(f.addition(amount, 1n), 'str'))
    f.printString(label)
    f.printString(f.dataTypeConversion(f.queryGuidByEntity(sender), 'str'))
  })
  .onSignal(Signal.signal_param_literal, (evt, f) => {
    print(str(evt.eventSourceGuid))
    const amount = evt.params.参数_1
    const label = evt.params.参数_2
    const enabled = evt.params.参数_3

    f.printString(f.dataTypeConversion(amount, 'str'))
    f.printString(label)
    f.printString(f.dataTypeConversion(enabled, 'str'))
  })
  .onSignal('signal_param_none', (_evt, f) => {
    f.printString('no params')
  })
