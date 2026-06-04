import { g } from 'genshin-ts/runtime/core'

enum Vars {
  LiveA = 'LiveA',
  LiveB = 'LiveB'
}

g.server({
  id: 1073741893,
  variables: {
    [Vars.LiveA]: list('int', [0n, 0n, 0n]),
    [Vars.LiveB]: list('int', [9n, 9n, 9n])
  }
}).on('whenEntityIsCreated', (_evt, f) => {
  f.printString('__CASE__:alternating_rebind:start')

  let alternating = f.get(Vars.LiveA)
  alternating[idx(0n)] = 10n
  f.printString(str(alternating[idx(0n)]))

  alternating = list('int', [1n])
  alternating[idx(0n)] = 20n
  f.printString(str(alternating[idx(0n)]))

  alternating = f.get(Vars.LiveB)
  alternating[idx(1n)] = 30n
  f.printString(str(alternating[idx(1n)]))

  alternating = f.assemblyList([2n, 3n], 'int')
  alternating[idx(1n)] = 40n
  f.printString(str(alternating[idx(1n)]))

  alternating = f.getNodeGraphVariable(Vars.LiveA).asType('int_list')
  alternating[idx(2n)] = 50n
  f.printString(str(alternating[idx(2n)]))

  alternating = [5n, 6n]
  alternating[idx(0n)] = 60n
  f.printString(str(alternating[idx(0n)]))

  alternating = f.copyList(f.get(Vars.LiveB))
  alternating[idx(0n)] = 70n
  f.printString(str(alternating[idx(0n)]))

  alternating = f.get(Vars.LiveA)
  alternating[idx(0n)] = 80n
  f.printString(str(alternating[idx(0n)]))

  f.printString('__CASE__:alternating_rebind:end')
})
