import { g } from 'genshin-ts/runtime/core'

enum ComplexLogicVars {
  LiveList = 'ComplexLogicLiveList',
  AltList = 'ComplexLogicAltList',
  LiveDict = 'ComplexLogicLiveDict',
  Score = 'ComplexLogicScore',
  Flag = 'ComplexLogicFlag'
}

g.server({
  id: 1073741894,
  variables: {
    [ComplexLogicVars.LiveList]: list('int', [2n, 5n, 8n, 11n]),
    [ComplexLogicVars.AltList]: list('int', [13n, 17n, 19n, 23n]),
    [ComplexLogicVars.LiveDict]: dict([
      { k: 'seed', v: 3n },
      { k: 'bonus', v: 4n }
    ]),
    [ComplexLogicVars.Score]: 6n,
    [ComplexLogicVars.Flag]: true
  }
}).on('whenEntityIsCreated', (_evt, f) => {
  console.log('__COMPLEX_LOGIC__:start')

  const self = f.getSelfEntity()
  f.setCustomVariable(self, 'ComplexLogicFList', f.assemblyList([4n, 1n, 7n, 2n], 'int'))
  f.setCustomVariable(self, 'ComplexLogicEntityList', f.assemblyList([3n, 6n, 9n, 12n], 'int'))
  f.setCustomVariable(self, 'ComplexLogicDict', dict([{ k: 'x', v: 1n }]))

  let scalar = f.get(ComplexLogicVars.Score)
  const liveDict = f.get(ComplexLogicVars.LiveDict)
  const seed = liveDict.get('seed')
  let repeated = scalar + seed
  repeated = repeated * 2n
  if (f.get(ComplexLogicVars.Flag)) {
    repeated = repeated + f.get(ComplexLogicVars.LiveList)[0]
  } else {
    repeated = repeated - 1n
  }
  console.log(str(repeated))

  const live = f.get(ComplexLogicVars.LiveList)
  const customFList = f.getCustomVariable(self, 'ComplexLogicFList').asType('int_list')
  const customEntityList = self.getCustomVariable('ComplexLogicEntityList').asType('int_list')

  live[0] = live[0] + repeated
  customFList[1] = live[0] - customFList[0]
  customEntityList[2] = customEntityList[2] + customFList[1]
  console.log(str(live[0]))
  console.log(str(customFList[1]))
  console.log(str(customEntityList[2]))

  const copied = f.copyList(live)
  copied[0] = copied[0] + 100n
  copied[3] = copied[0] - copied[1]
  console.log(str(copied[0]))
  console.log(str(live[0]))

  let rotating = live
  rotating[1] = rotating[0] + 3n
  console.log(str(rotating[1]))

  rotating = list('int', [1n, 2n, 3n, 4n])
  rotating[2] = rotating[0] + rotating[1] + 50n
  console.log(str(rotating[2]))

  rotating = customFList
  rotating[3] = rotating[1] + 9n
  console.log(str(customFList[3]))

  rotating = f.copyList(f.get(ComplexLogicVars.AltList))
  rotating[0] = rotating[0] + 77n
  console.log(str(rotating[0]))
  console.log(str(f.get(ComplexLogicVars.AltList)[0]))

  let branchList = f.get(ComplexLogicVars.LiveList)
  if (repeated % 3n === 2n) {
    branchList = list('int', [9n, 8n, 7n, 6n])
    branchList[1] = branchList[1] + repeated
  } else {
    branchList = f.copyList(customEntityList)
    branchList[2] = branchList[2] + 1n
  }
  branchList[0] = branchList[1] - branchList[2]
  console.log(str(branchList[0]))
  console.log(str(f.get(ComplexLogicVars.LiveList)[1]))

  let total = 0n
  let gate = 0n
  for (let outer = 0; outer < 4; outer++) {
    let inner = 0n
    while (inner < 4n) {
      let pick = 0n
      if (outer % 2 === 0) {
        pick = live[idx(inner)]
      } else {
        pick = customEntityList[idx(inner)]
      }

      if ((pick + int(outer)) % 5n === 0n) {
        gate = gate + int(outer)
        inner = inner + 1n
        continue
      }

      total = total + pick + int(outer * 10) + inner
      if (total > 220n) {
        gate = gate + 99n
        break
      }
      inner = inner + 1n
    }

    if (total > 220n) {
      break
    }
  }
  console.log(str(total))
  console.log(str(gate))

  liveDict.set('sum', total)
  liveDict.set('gate', gate)
  const customDict = self.getCustomVariable('ComplexLogicDict').asDict('str', 'int')
  customDict.set('x', liveDict.get('seed') + branchList[0])
  customDict.set('y', customDict.get('x') + copied[0])
  console.log(str(liveDict.get('sum')))
  console.log(str(customDict.get('y')))

  const scratch = list('int', [total, gate, branchList[0]])
  scratch.push(live[0])
  const removed = scratch.pop()!
  scratch.unshift(5n)
  const shifted = scratch.shift()!
  scratch[1] = scratch[1] + removed
  const methodSum = scratch.reduce((acc, value) => acc + value, 0n)
  console.log(str(shifted))
  console.log(str(removed))
  console.log(str(methodSum))

  let switchScore = 0n
  switch (methodSum % 4n) {
    case 0n:
      switchScore = methodSum / 2n
      break
    case 1n:
      switchScore = methodSum + 1n
      break
    case 2n:
      switchScore = methodSum + gate
      break
    default:
      switchScore = methodSum - gate
      break
  }

  if (switchScore > 400n) {
    if (branchList[0] === 21n) {
      switchScore = switchScore + customFList[3]
    } else {
      switchScore = switchScore - 7n
    }
  } else {
    switchScore = switchScore + 3n
  }
  console.log(str(switchScore))

  console.log(str(f.get(ComplexLogicVars.LiveList)[0]))
  console.log(str(f.get(ComplexLogicVars.LiveList)[1]))
  console.log(str(customFList[3]))
  console.log(str(f.get(ComplexLogicVars.AltList)[0]))
  console.log('__COMPLEX_LOGIC__:end')
})
