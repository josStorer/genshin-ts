import { g } from 'genshin-ts/runtime/core'

g.server({ id: 1073742412 }).on('whenEntityIsCreated', (_evt, f) => {
  const values = [1n, 2n, 3n]
  setTimeout(() => {
    values.forEach((value) => {
      print(str(value))
      values[1] = 9n
    })
    for (const value of values) print(str(value))
  }, 100)
})
