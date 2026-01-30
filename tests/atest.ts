import { g } from 'genshin-ts/runtime/core'
import { guid } from 'genshin-ts/runtime/value'

// undefined修正
// gsts.f._3dVectorAddition([1, 2, 3], [4, 5, 6])

g.server({
  id: 1073741825
}).on('whenEntityIsCreated', (evt, f) => {
  const e = f.initLocalVariable('entity')

  const c: number[] = []
  const d = [2, 3, 4]
  const a = list('float')
  const b = list('float', [1, 2, 3])
  // b.toString()
  const g = dict({
    1: 2,
    2: 3
  })
  const rr = configId(123)
  gsts.f._3dVectorAddition([1, 2, 3], [4, 5, 6])
  // f.createPrefab(123, [1, 2, 3], [4, 5, 6], f.getSelfEntity(), true, 100, [1, 2, 3])
  f.concatenateList(a, b)
  f.concatenateList(c, d)
  if (evt.eventSourceGuid === new guid(455)) {
    if (evt.eventSourceGuid === new guid(123)) {
      f.printString('entity 123 created')
    } else if (evt.eventSourceGuid === new guid(456)) {
      f.printString('entity 456 created')
    } else {
      f.printString('entity created')
    }
  }
})

g.server({
  id: 1073741826
}).on('whenEntityIsCreated', (evt, f) => {
  gsts.f._3dVectorAddition([1, 2, 3], [4, 5, 6])
  const list1 = [evt.eventSourceEntity]
  const list2 = [...list1, evt.eventSourceEntity]
  f.getListLength(list2)
  const b = [evt.eventSourceEntity, entity(1)]
  setTimeout(() => {
    b[0].destroy()
    list2[2].destroy()
  }, 1000)
})
