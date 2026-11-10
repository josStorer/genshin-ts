import { g } from 'genshin-ts/runtime/core'

const TEST_TAG = 1073741825n
const TEST_PREFAB = 20001224

function gstsServerSpawnTestBoxes() {
  for (let i = 0; i < 5; i++) {
    gsts.f.createPrefab(TEST_PREFAB, [0, 2, 0], [0, 0, 0], entity(0), false, 1n, [TEST_TAG])
  }
}

g.server({
  id: 1073742430,
  name: '_GSTS_ListRegression',
  variables: { items: list('int', [1n, 2n, 3n]) }
}).on('whenEntityIsCreated', (_evt, f) => {
  print('LIST CHECK START')
  if (f.getEntityListByUnitTag(TEST_TAG).length !== 0) {
    print('SETUP FAIL: test tag already in use')
    return
  }

  gstsServerSpawnTestBoxes()
  if (f.getEntityListByUnitTag(TEST_TAG).length !== 5) {
    print('SETUP FAIL: expected five tagged boxes')
    return
  }
  let forOfCount = 0n
  for (const target of f.getEntityListByUnitTag(TEST_TAG)) {
    f.destroyEntity(target)
    forOfCount = forOfCount + 1n
  }
  print('FOR OF: destroyed / remaining')
  print(str(forOfCount))
  print(str(f.getEntityListByUnitTag(TEST_TAG).length))

  gstsServerSpawnTestBoxes()
  if (f.getEntityListByUnitTag(TEST_TAG).length !== 5) {
    print('SETUP FAIL: expected five tagged boxes')
    return
  }
  let forEachCount = 0n
  f.getEntityListByUnitTag(TEST_TAG).forEach((target) => {
    f.destroyEntity(target)
    forEachCount = forEachCount + 1n
  })
  print('FOR EACH: destroyed / remaining')
  print(str(forEachCount))
  print(str(f.getEntityListByUnitTag(TEST_TAG).length))

  gstsServerSpawnTestBoxes()
  if (f.getEntityListByUnitTag(TEST_TAG).length !== 5) {
    print('SETUP FAIL: expected five tagged boxes')
    return
  }
  const indexed = f.getEntityListByUnitTag(TEST_TAG)
  let indexedCount = 0n
  for (let i = 0; i < indexed.length; i++) {
    f.destroyEntity(indexed[i])
    indexedCount = indexedCount + 1n
  }
  print('INDEXED: destroyed / remaining')
  print(str(indexedCount))
  print(str(f.getEntityListByUnitTag(TEST_TAG).length))

  gstsServerSpawnTestBoxes()
  if (f.getEntityListByUnitTag(TEST_TAG).length !== 5) {
    print('SETUP FAIL: expected five tagged boxes')
    return
  }
  const retained = f.getEntityListByUnitTag(TEST_TAG)
  f.destroyEntity(retained[0])
  print('LENGTH: saved / current')
  print(str(retained.length))
  print(str(f.getEntityListByUnitTag(TEST_TAG).length))
  for (const target of f.getEntityListByUnitTag(TEST_TAG)) f.destroyEntity(target)
  print('CLEANUP: remaining')
  print(str(f.getEntityListByUnitTag(TEST_TAG).length))

  const values = [1n, 2n, 3n]
  const alias = values
  alias[0] = 9n
  print('ALIAS')
  print(str(values[0]))

  print('LIVE')
  for (const value of f.get('items')) {
    print(str(value))
    f.get('items')[1] = 9n
  }
  const stored = f.initLocalVariable('int_list', [1n, 2n, 3n])
  print('STORED')
  for (const value of stored.value) {
    print(str(value))
    stored.value[1] = 9n
  }
  print('LIST CHECK END')
})
