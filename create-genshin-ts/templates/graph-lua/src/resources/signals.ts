// @gsts:signals

import { defineSignal } from 'genshin-ts/runtime/core'

export const Signal = {
  JumpPressed: defineSignal('JumpPressed', [['count', 'int']])
} as const
