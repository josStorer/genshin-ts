import { g } from 'genshin-ts/runtime/core'

// Every case prints a label line followed by its values. The expected output is whatever
// Node.js prints for this file (scripts/parity/run-node.mjs); the game log must match it.
// The cases run in three events so no single event exceeds the game's execution budget.

function gstsServerDoubled(xs: bigint[]): bigint[] {
  return xs.map((v) => v * 2n)
}

function gstsServerAppendAll(src: bigint[], sink: bigint[]) {
  for (const v of src) sink.push(v)
}

function gstsServerPushTwice(xs: bigint[]) {
  xs.push(1n)
  xs.push(2n)
}

function gstsServerSum(xs: bigint[]) {
  let sum = 0n
  for (const v of xs) sum = sum + v
  return sum
}

// Promotion required: the loop source is derived from a list the body changes.
function gstsServerLoopSources() {
  const p01 = [1n, 2n, 3n]
  let p01Count = 0n
  for (const v of p01.map((x) => x * 10n)) {
    p01.push(v)
    p01Count = p01Count + 1n
  }
  print('P01 inline map source: iterations / length / last')
  print(str(p01Count))
  print(str(p01.length))
  print(str(p01[p01.length - 1]))

  const p02 = [1n, 2n, 3n]
  for (const v of gstsServerDoubled(p02)) p02.push(v)
  print('P02 helper result source: length / sum')
  print(str(p02.length))
  print(str(gstsServerSum(p02)))

  const p03 = [1n, 2n]
  gstsServerAppendAll(
    p03.filter((x) => x > 0n),
    p03
  )
  print('P03 parameter evaluated once: length')
  print(str(p03.length))

  let p04 = 1n
  let p04Sum = 0n
  for (const v of [p04, p04 + 1n]) {
    p04 = p04 + 10n
    p04Sum = p04Sum + v
  }
  print('P04 literal of changing values: sum / final')
  print(str(p04Sum))
  print(str(p04))

  const p05 = [1n, 2n, 3n]
  let p05Count = 0n
  p05
    .filter((x) => x >= 2n)
    .forEach((v) => {
      p05.push(v)
      p05Count = p05Count + 1n
    })
  print('P05 forEach on derived list: calls / length')
  print(str(p05Count))
  print(str(p05.length))

  const p06 = [1n, 2n, 3n, 4n]
  let p06Sum = 0n
  for (const v of p06.map((x) => x * 2n)) {
    if (v === 4n) continue
    if (v === 8n) break
    p06Sum = p06Sum + v
    p06.push(v)
  }
  print('P06 break/continue on derived list: sum / length')
  print(str(p06Sum))
  print(str(p06.length))

  const p07 = [1n, 2n]
  let p07Sum = 0n
  for (const a of p07) for (const b of p07.map((x) => x + a)) p07Sum = p07Sum + b
  print('P07 nested derived loop: sum')
  print(str(p07Sum))
}

// Values captured by a const before their source changes.
function gstsServerConstReads() {
  const p08 = [1n, 2n, 3n]
  const p08Doubled = p08.map((x) => x * 2n)
  p08.push(4n)
  print('P08 const derived list: length / sum')
  print(str(p08Doubled.length))
  print(str(gstsServerSum(p08Doubled)))

  const p09 = [1n, 2n, 3n]
  const p09First = p09[0]
  const p09Length = p09.length
  p09[0] = 50n
  p09.push(4n)
  print('P09 const element / length: first / length')
  print(str(p09First))
  print(str(p09Length))

  let p10 = 1n
  const p10Next = p10 + 1n
  p10 = 10n
  print('P10 const from let: next / current')
  print(str(p10Next))
  print(str(p10))

  const p11 = [1n, 2n]
  const p11Copy = gstsServerDoubled(p11)
  p11.push(3n)
  print('P11 const helper result: length')
  print(str(p11Copy.length))

  const p12 = [5n, 6n, 7n]
  const p12Slice = p12.slice(0, 2)
  p12[0] = 50n
  print('P12 slice then mutate: slice[0] / indexOf 7')
  print(str(p12Slice[0]))
  print(str(p12.indexOf(7n)))
  if (p12.includes(50n)) print('includes 50: yes')
  else print('includes 50: no')

  const p13 = [1n, 2n, 3n]
  const p13Odd = p13.filter((x) => x % 2n === 1n)
  for (let i = 0; i < p13Odd.length; i++) p13.push(p13Odd[i])
  print('P13 index loop over const derived list: length')
  print(str(p13.length))
}

// Promotion must NOT happen: these are references in JavaScript.
function gstsServerReferences() {
  const p14 = [1n, 2n, 3n]
  const p14Alias = p14
  p14Alias.push(4n)
  p14[0] = 9n
  print('P14 alias: alias length / alias[0]')
  print(str(p14Alias.length))
  print(str(p14Alias[0]))

  const p15 = [1n, 2n, 3n]
  print('P15 named list for-of sees later writes')
  for (const v of p15) {
    print(str(v))
    p15[2] = 100n
  }

  print('P16 node graph variable for-of sees later writes')
  for (const v of gsts.f.getNodeGraphVariable('items').asType('int_list')) {
    print(str(v))
    gsts.f.getNodeGraphVariable('items').asType('int_list')[2] = 7n
  }

  const p17 = [0n]
  gstsServerPushTwice(p17)
  print('P17 helper mutates argument: length')
  print(str(p17.length))

  // No promotion needed: nothing can change the source.
  let p18 = 0n
  for (const v of [4n, 5n, 6n]) p18 = p18 + v
  print('P18 pure literal: sum')
  print(str(p18))

  // JavaScript re-checks the loop condition every iteration.
  const p19 = [1n, 2n, 3n]
  let p19Iterations = 0n
  for (let i = 0; i < p19.length; i++) {
    if (p19.length < 6) p19.push(0n)
    p19Iterations = p19Iterations + 1n
  }
  print('P19 growing loop bound: iterations / length')
  print(str(p19Iterations))
  print(str(p19.length))

  // Timer callbacks read captured lists when they run.
  const p20 = [1n, 2n]
  setTimeout(() => {
    print('P20 timer reads captured list: length')
    print(str(p20.length))
    print('PARITY END')
  }, 200)
  p20.push(3n)
}

g.server({
  id: 1073742440,
  name: '_GSTS_ListPromotionParity',
  variables: { items: list('int', [1n, 2n, 3n]) }
}).on('whenEntityIsCreated', () => {
  print('PARITY START')
  gstsServerLoopSources()
  setTimeout(() => {
    print('PARITY STAGE 2')
    gstsServerConstReads()
  }, 100)
  setTimeout(() => {
    print('PARITY STAGE 3')
    gstsServerReferences()
  }, 200)
})
