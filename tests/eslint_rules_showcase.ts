// import { g } from 'genshin-ts/runtime/core'

// let _outsidePreferConst = 1

// const _outsideConcat = 'alpha' + 'beta'
// const _outsideTemplate = `ok ${1}`
// const _outsideObject = {}
// const _outsideJson = JSON.stringify({ a: 1 })
// const _outsideSlice = 'abc'.slice(1)
// const _outsidePop = [1, 2, 3].pop()

// function normalFunction() {
//   const _localConcat = 'x' + 'y'
//   const _localSlice = 'def'.slice(1)
//   const _localFind = [1, 2, 3].find((value) => value > 1)
//   const _localJson = JSON.stringify({ a: 2 })
//   return _localConcat + _localSlice + String(_localFind) + String(_localJson)
// }

// const _normalResult = normalFunction()

// function gstsServerBadParams(value = 1n) {
//   return value
// }

// function gstsServerBadReturn(flag: boolean) {
//   if (flag) {
//     return 1n
//   }
//   return 2n
// }

// function gstsServerRecA(value: bigint): bigint {
//   gsts.f.printString('123')
//   return gstsServerRecB(value)
// }

// function gstsServerRecB(value: bigint): bigint {
//   return gstsServerRecA(value)
// }

// let gstsServerAssigned: (value: bigint) => bigint
// gstsServerAssigned = (value) => value

// function outerWrapper(): () => bigint {
//   function gstsServerNested() {
//     return 1n
//   }
//   return gstsServerNested
// }

// let b = 3
// console.log(b)

// const _outerResult = outerWrapper()
// const _badCall = gstsServerBadReturn(true)
// const _outsideFlow = gsts.f

// setTimeout(() => {
//   const _noop = 0
// }, 10)

// g.server({
//   id: 1073741900
// }).on('whenEntityIsCreated', (_evt, f) => {
//   const ints = list('int', [1n, 2n])
//   const _maybe = ints.pop()
//   const _reversed = ints.reverse()

//   const g = {}

//   let a = 2
//   print(str(a))

//   let sss = '1' + '2'

//   const mapCb = (value: bigint, _index: number) => value
//   const _mapped = ints.map(mapCb)

//   const _filtered = ints.filter((value) => {
//     const keep = value > 0n
//     return keep
//   })

//   const entities = list('entity', [])
//   const _entityFind = entities.find((_entity) => true)

//   let er = entity(0)
//   for (const e of entities) {
//     if (e == entity(0)) {
//       er = e
//       break
//     }
//   }

//   const unknownList: unknown[] = []
//   const _unknownMapped = unknownList.map((value) => value)
//   const _spread = [...unknownList]
//   const j = gsts.f.getRandomInteger(0n, 2n)
//   const _badIndex = ints[j]
//   const _goodIndex = ints[idx(j)]

//   const _plain = {}

//   const obj = { a: 1 }
//   obj.a = 1
//   const _hasKey = 'a' in obj
//   const _keys = Object.keys(obj)

//   const maybeValue: number | null = null
//   const _coalesce = maybeValue ?? 1
//   const _template = `bad ${1}`

//   const _math = Math.imul(2, 3)
//   const _number = Number()
//   console.log('a', 'b')

//   const _floatOp = 1 % 2
//   const _notBool = !1

//   const flag = true
//   const _branchMismatch = flag ? 1n : 1

//   switch (flag) {
//     case true:
//       break
//     default:
//       break
//   }

//   for (let i = 0; i < 3; i += 2) {
//     setTimeout(() => {
//       const _tick = 0
//     }, 10)
//   }

//   // eslint-disable-next-line no-constant-condition
//   while (true) {
//     break
//   }

//   try {
//     throw new Error('bad')
//   } catch (_err) {
//     const _ignored = _err
//   }

//   function innerDeclared() {
//     return 1
//   }
//   const _innerValue = innerDeclared()

//   const _json = JSON.stringify({ a: 1 })
//   const _promise = Promise.resolve(1)

//   const _timerHandler = () => {
//     const _noop = 0
//   }
//   setTimeout(_timerHandler, 10)

//   const outerTimerSeed = 2n
//   setTimeout(() => {
//     const innerSeed = outerTimerSeed
//     gsts.f.printString(str(outerTimerSeed))
//     setTimeout(() => {
//       gsts.f.printString(str(innerSeed))
//       gsts.f.printString(str(outerTimerSeed))
//     }, 150)
//   }, 200)

//   setInterval(() => {
//     const _tick = 0
//   }, 50)

//   const _badParamsValue = gstsServerBadParams()
//   const _assignedValue = gstsServerAssigned(1n)

//   f.printString(str(_assignedValue))
// })
