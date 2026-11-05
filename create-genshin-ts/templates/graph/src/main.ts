import { g } from 'genshin-ts/runtime/core'

g.server({
  id: 1073741825
}).on('whenEntityIsCreated', (_evt, f) => {
  console.log('hello world')
})
