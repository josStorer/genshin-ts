// @gsts:signals

import { defineSignal } from 'genshin-ts/runtime/core'

export const Signal = {
  HudClicked: defineSignal('HudClicked', [['count', 'int']])
} as const
