import 'genshin-ts/runtime/server_globals'

import { g } from 'genshin-ts/runtime/core'
import type { dict as Dict, entity as Entity, vec3 as Vec3 } from 'genshin-ts/runtime/value'

g.server({
  variables: {
    count: exposed(1n),
    title: exposed('text'),
    target: exposed(entity(0)),
    position: exposed(vec3([1, 2, 3])),
    items: exposed(list('int', [1n])),
    scores: exposed(dict('str', 'int', 0)),
    plain: { value: 1n }
  }
}).on('whenEntityIsCreated', (_evt, f) => {
  const count: bigint = f.get('count')
  const title: string = f.get('title')
  const target: Entity = f.get('target')
  const position: Vec3 = f.get('position')
  const items: bigint[] = f.get('items')
  const scores: Dict<'str', 'int'> = f.get('scores')
  const plain: Dict<'str', 'int'> = f.get('plain')
  f.set('count', count)
  f.set('target', target)
  f.set('items', items)
  f.set('scores', scores)
  // @ts-expect-error The exposed wrapper must not erase the variable's type.
  const incorrect: string = f.get('count')
  void [title, position, plain, incorrect]
})
