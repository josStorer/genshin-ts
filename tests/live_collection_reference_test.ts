import { g } from 'genshin-ts/runtime/core'

enum Vars {
  LiveList = 'LiveList',
  LiveDict = 'LiveDict'
}

function makeTemporaryList() {
  return gsts.f.assemblyList([1n, 2n], 'int')
}

g.server({
  id: 1073741890,
  variables: {
    [Vars.LiveList]: list('int', [0n, 0n, 0n]),
    [Vars.LiveDict]: dict([{ k: 'a', v: 1n }])
  }
}).on('whenEntityIsCreated', (_evt, f) => {
  const liveViaGet = f.get(Vars.LiveList)
  liveViaGet[idx(0n)] = 10n
  liveViaGet[idx(1n)] = 11n
  const ggg = liveViaGet[idx(1n)]
  f.printString(str(ggg))
  f.printString(str(ggg))

  const liveViaGetNode = f.getNodeGraphVariable(Vars.LiveList).asType('int_list')
  liveViaGetNode[idx(2n)] = 12n

  const enumLive = f.getNodeGraphVariable(Vars.LiveList).asType('int_list')
  enumLive[idx(0n)] = 13n

  const customViaF = f.getCustomVariable(f.getSelfEntity(), 'custom_list').asType('int_list')
  customViaF[idx(0n)] = 14n

  const self = f.getSelfEntity()
  const customViaEntity = self.get('custom_list').asType('int_list')
  customViaEntity[idx(1n)] = 15n

  const selfFullName = f.getSelfEntity()
  const customViaEntityFullName = selfFullName.getCustomVariable('custom_list').asType('int_list')
  customViaEntityFullName[idx(2n)] = 16n

  const liveDict = f.get(Vars.LiveDict)
  liveDict.set('b', 2n)
  f.printString(str(liveDict.get('b')))

  const kk = [1, 2, 3, 4]
  kk.push(34)
  f.printString(str(kk[3]))

  const temporary = f.assemblyList([1n, 2n], 'int')
  temporary[idx(0n)] = 3n
  f.printString(str(temporary[idx(0n)]))

  const unknown = makeTemporaryList()
  unknown[idx(0n)] = 4n
  f.printString(str(unknown[idx(0n)]))
})
