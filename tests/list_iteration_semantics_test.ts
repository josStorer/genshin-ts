/* eslint-disable no-useless-assignment, @typescript-eslint/no-unnecessary-type-assertion --
   Fixtures exercise deferred reads after assignment and wrapped list sources. */

import { g } from 'genshin-ts/runtime/core'

g.server({ id: 1073741910 }).on('whenEntityIsCreated', (_evt, f) => {
  for (const target of f.getEntityListByUnitTag(1073741825n)) {
    f.destroyEntity(target)
  }
})

g.server({ id: 1073741911 }).on('whenEntityIsCreated', (_evt, f) => {
  const targets = f.getEntityListByUnitTag(1073741825n)
  for (const target of targets) {
    f.destroyEntity(target)
  }
})

g.server({ id: 1073741912 }).on('whenEntityIsCreated', (_evt, f) => {
  const targets = f.getEntityListByUnitTag(1073741825n)
  const alias = targets
  const secondAlias = alias
  for (const target of secondAlias) {
    f.destroyEntity(target)
  }
})

g.server({ id: 1073741913 }).on('whenEntityIsCreated', (_evt, f) => {
  let n = 1n
  const values = [n, n + 1n]
  n = 10n
  for (const value of values) {
    f.printString(str(value))
  }
})

g.server({ id: 1073741914 }).on('whenEntityIsCreated', (_evt, f) => {
  const values = [1n, 2n, 3n]
  const alias = values
  for (const value of values) {
    f.printString(str(value))
    alias[1] = 9n
  }
})

g.server({ id: 1073741915, variables: { items: list('int', [1n, 2n, 3n]) } }).on(
  'whenEntityIsCreated',
  (_evt, f) => {
    const values = f.get('items')
    const alias = values
    for (const value of alias) {
      f.printString(str(value))
      values[1] = 9n
    }
  }
)

g.server({ id: 1073741916, variables: { items: list('int', [1n, 2n, 3n]) } }).on(
  'whenEntityIsCreated',
  (_evt, f) => {
    for (const value of f.get('items')) {
      f.printString(str(value))
      f.get('items')[1] = 9n
    }
  }
)

g.server({ id: 1073741917 }).on('whenEntityIsCreated', (_evt, f) => {
  for (const start of [1n, 11n]) {
    for (const value of [start, start + 1n]) {
      f.printString(str(value))
    }
  }
})

g.server({ id: 1073741918 }).on('whenEntityIsCreated', (_evt, f) => {
  for (const value of [1n, 2n, 3n, 4n, 5n]) {
    if (value === 2n) continue
    if (value === 4n) break
    f.printString(str(value))
  }
  const empty: bigint[] = []
  for (const value of empty) {
    f.printString(str(value))
  }
  f.printString('done')
})

g.server({ id: 1073741919 }).on('whenEntityIsCreated', (_evt, f) => {
  f.getEntityListByUnitTag(1073741825n).forEach((target) => {
    f.destroyEntity(target)
  })
})

g.server({ id: 1073741920 }).on('whenEntityIsCreated', (_evt, f) => {
  const targets = f.getEntityListByUnitTag(1073741825n)
  targets.forEach((target) => {
    f.destroyEntity(target)
  })
})

g.server({ id: 1073741921 }).on('whenEntityIsCreated', (_evt, f) => {
  const values = f.copyList(f.assemblyList([1n, 2n, 3n], 'int'))
  for (const value of values) {
    f.printString(str(value))
    values[1] = 9n
  }
})

// Direct node calls retain the engine's repeated-input evaluation behavior.
g.server({ id: 1073741922 }).on('whenEntityIsCreated', (_evt, f) => {
  f.listIterationLoop(f.getEntityListByUnitTag(1073741825n), (target) => {
    f.destroyEntity(target)
  })
})

g.server({ id: 1073741923 }).on('whenEntityIsCreated', (_evt, f) => {
  const targets = f.getEntityListByUnitTag(1073741825n).map((target) => target)
  for (const target of targets) {
    f.destroyEntity(target)
  }
})

g.server({ id: 1073741924 }).on('whenEntityIsCreated', (_evt, f) => {
  let n = 1n
  for (const value of [n, n + 1n]) {
    f.printString(str(value))
    n = 10n
  }
})

g.server({ id: 1073741925 }).on('whenEntityIsCreated', (_evt, f) => {
  let n = 1n
  const values = [n, n + 1n]
  const alias = (values as bigint[])!
  n = 10n
  for (const value of alias as bigint[]) {
    f.printString(str(value))
  }
})

g.server({ id: 1073742404 }).on('whenEntityIsCreated', (_evt, f) => {
  const stored = f.initLocalVariable('int_list', [1n, 2n, 3n])
  for (const value of stored.value) {
    f.printString(str(value))
    stored.value[1] = 9n
  }
})

g.server({ id: 1073742405 }).on('whenEntityIsCreated', (_evt, f) => {
  const stored = f.initLocalVariable('int_list', [1n, 2n, 3n])
  stored.value.forEach((value) => {
    f.printString(str(value))
    stored.value[1] = 9n
  })
})

g.server({ id: 1073742406 }).on('whenEntityIsCreated', (_evt, f) => {
  const stored = f.getLocalVariable([1n, 2n, 3n])
  for (const value of stored.value) {
    f.printString(str(value))
    stored.value[1] = 9n
  }
})

g.server({ id: 1073742407, variables: { items: list('int', [1n, 2n, 3n]) } }).on(
  'whenEntityIsCreated',
  (_evt, f) => {
    f.get('items').forEach((value) => {
      f.printString(str(value))
      f.get('items')[1] = 9n
    })
  }
)

g.server({ id: 1073742408, variables: { items: list('int', [1n, 2n, 3n]) } }).on(
  'whenEntityIsCreated',
  (_evt, f) => {
    for (const value of f.getNodeGraphVariable('items').asType('int_list')) {
      f.printString(str(value))
      f.get('items')[1] = 9n
    }
  }
)

g.server({ id: 1073742409 }).on('whenEntityIsCreated', (_evt, f) => {
  const object = { value: f.getEntityListByUnitTag(1073741825n) }
  for (const target of object.value) f.destroyEntity(target)
})

g.server({ id: 1073742410 }).on('whenEntityIsCreated', (_evt, f) => {
  for (const value of [1n, 2n, 3n]) f.printString(str(value))
})

g.server({ id: 1073742411 }).on('whenEntityIsCreated', (_evt, f) => {
  f.printString(str([1n, 2n, 3n].find((value) => value === 2n)!))
})

g.server({ id: 1073742413 }).on('whenEntityIsCreated', (_evt, f) => {
  const values = [1n, 2n, 3n]
  const alias = values
  alias[0] = 9n
  f.printString(str(values[0]))
})

g.server({ id: 1073742414 }).on('whenEntityIsCreated', (_evt, f) => {
  const values = [1n, 2n, 3n]
  const alias = values
  alias[0] = 9n
  f.printString(str(values[0]))
  for (const value of values) f.printString(str(value))
})

g.server({ id: 1073742415 }).on('whenEntityIsCreated', (_evt, f) => {
  const values = [1n, 2n, 3n]
  const alias = values
  const second = alias
  second[0] = 9n
  values[1] = 8n
  f.printString(str(values[0]))
  f.printString(str(second[1]))
})
