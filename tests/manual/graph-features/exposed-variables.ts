import { g } from 'genshin-ts/runtime/core'

// Compile with --noinject. Check entity overrides and localized text collection in the editor.
g.server({
  id: 1073741920,
  variables: {
    maxHp: exposed(100n),
    speed: exposed(1.5),
    label: exposed('Exposed text'),
    enabled: exposed(true),
    position: exposed(vec3([1, 2, 3])),
    target: exposed(entity(0)),
    targetGuid: exposed(guid(1)),
    team: exposed(faction(1)),
    config: exposed(configId(1)),
    prefab: exposed(prefabId(1)),
    integers: exposed(list('int', [1n, 2n])),
    floats: exposed(list('float', [1.5])),
    strings: exposed(list('str', ['text'])),
    booleans: exposed(list('bool', [true])),
    positions: exposed(list('vec3', [vec3([1, 2, 3])])),
    targets: exposed(list('entity', [entity(0)])),
    guids: exposed(list('guid', [guid(1)])),
    teams: exposed(list('faction', [faction(1)])),
    configs: exposed(list('config_id', [configId(1)])),
    prefabs: exposed(list('prefab_id', [prefabId(1)])),
    names: exposed(dict([{ k: 'a', v: 'text' }])),
    scores: exposed(dict([{ k: 1n, v: 2n }])),
    entities: exposed(dict('entity', 'int', 0)),
    guidKeys: exposed(dict('guid', 'float', 0)),
    factionKeys: exposed(dict('faction', 'bool', 0)),
    configKeys: exposed(dict('config_id', 'vec3', 0)),
    prefabKeys: exposed(dict('prefab_id', 'entity', 0)),
    listValues: exposed(dict('str', 'int_list', 0)),
    entityLists: exposed(dict('str', 'entity_list', 0)),
    counter: 0n,
    privateText: 'not exposed'
  }
}).on('whenEntityIsCreated', (_evt, f) => {
  print(f.get('label'))
  print(str(f.get('maxHp')))
  print(str(f.get('target')))
  print(str(f.getListLength(f.get('integers'))))
  f.set('counter', f.get('maxHp'))
  const initialHp = f.get('maxHp')
  setTimeout(() => print(str(initialHp)), 1000)
})
