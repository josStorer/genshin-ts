import { g } from 'genshin-ts/runtime/core'

import { GREETING } from '../shared/constants'

g.server({
  id: 1073741825
}).on('whenEntityIsCreated', () => {
  console.log(GREETING)
})
