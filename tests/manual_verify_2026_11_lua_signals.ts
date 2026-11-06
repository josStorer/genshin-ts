import { defineSignal, g } from 'genshin-ts/runtime/core'

// Register these two signals with matching parameter types before editor import.
const Signal = {
  scalars: defineSignal('GSTS_NOV_LUA_SCALARS', [
    ['integer', 'int'],
    ['number', 'float'],
    ['text', 'str'],
    ['flag', 'bool'],
    ['position', 'vec3'],
    ['guid', 'guid'],
    ['entity', 'entity'],
    ['prefab', 'prefab_id'],
    ['config', 'config_id']
  ]),
  lists: defineSignal('GSTS_NOV_LUA_LISTS', [
    ['integers', 'int_list'],
    ['numbers', 'float_list'],
    ['texts', 'str_list'],
    ['flags', 'bool_list'],
    ['positions', 'vec3_list'],
    ['guids', 'guid_list'],
    ['entities', 'entity_list'],
    ['prefabs', 'prefab_id_list'],
    ['configs', 'config_id_list']
  ])
} as const

g.server({ id: 1073741901, mode: 'beyond', lang: 'en' }).on('whenEntityIsCreated', (_evt, f) => {
  const target = f.getCorrespondingValueFromList(f.getListOfPlayerEntitiesOnTheField(), 0n)
  f.sendClientScriptedServerSignal(
    target,
    Signal.scalars,
    f.addition(2n, 3n),
    1.5,
    'direct',
    true,
    [1, 2, 3],
    guid(7),
    target,
    prefabId(8),
    configId(9)
  )
  sendLua(
    target,
    Signal.lists,
    [1n, 2n],
    [1.5, 2.5],
    ['a', 'b'],
    [true, false],
    [[1, 2, 3]],
    [guid(7)],
    f.getListOfPlayerEntitiesOnTheField(),
    [prefabId(8)],
    [configId(9)]
  )
  sendLuaAll(
    Signal.scalars,
    7n,
    f.addition(1.5, 2.5),
    'all',
    false,
    [3, 2, 1],
    guid(7),
    target,
    prefabId(8),
    configId(9)
  )
  target.sendLua(
    Signal.lists,
    [3n],
    [3.5],
    ['helper'],
    [false],
    [[3, 2, 1]],
    [guid(7)],
    [target],
    [prefabId(8)],
    [configId(9)]
  )
  sendLua(target, 'GSTS_NOV_LUA_BY_NAME', 12n, 'literal', true)
  // Existing graph broadcast remains a different node (300000).
  send('GSTS_NOV_GRAPH_BROADCAST', 12n)
})
