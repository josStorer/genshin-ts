import { g } from 'genshin-ts/runtime/core'

// Demo: timer capture behavior (function exclusion, nested callback capture, write-back)
const DEMO_TAG = 'timer_capture_writeback_demo'
const HELPER_PREFIX = 'helper'

function helperFormat(v: bigint): string {
  return `${HELPER_PREFIX}:${v}`
}

g.server({
  id: 1073741827
}).on('whenEntityIsCreated', (_evt, f) => {
  f.printString(`${DEMO_TAG}:start`)

  // 1) Function call inside timer callback (function should NOT be captured)
  const base = 1n
  setTimeout(() => {
    f.printString(helperFormat(base))
  }, 100)

  // 2) Nested callback capture (value used only inside list callback)
  const label = 'nested_only'
  const nums = [1n, 2n, 3n]
  setTimeout(() => {
    nums.forEach((v) => {
      f.printString(label)
      f.printString(str(v + base))
    })
  }, 200)

  // 2b) Nested callback write-back
  let nestedCounter = 0n
  setTimeout(() => {
    nums.forEach(() => {
      nestedCounter = nestedCounter + 1n
    })
    f.printString(`${DEMO_TAG}:nested_counter`)
    f.printString(str(nestedCounter))
  }, 250)

  // 3) Write-back across interval ticks
  let counter = 0n
  const h = setInterval(() => {
    counter = counter + 1n
    f.printString(`${DEMO_TAG}:counter`)
    f.printString(str(counter))
    if (counter >= 3n) {
      clearInterval(h)
    }
  }, 300)

  clearInterval(h)

  // 4) Write-back with compound assignment
  let acc = 5n
  const h2 = setInterval(() => {
    acc += 2n
    f.printString(`${DEMO_TAG}:acc`)
    f.printString(str(acc))
    if (acc >= 9n) {
      clearInterval(h2)
    }
  }, 350)

  // 5) Captured list mutation in timer callback (push)
  let arrPush = [10n]
  const h3 = setInterval(() => {
    arrPush.push(1n)
    f.printString(`${DEMO_TAG}:arr_push_len`)
    f.printString(str(arrPush.length))
    if (arrPush.length >= 3n) {
      clearInterval(h3)
    }
  }, 400)

  // 6) Captured list reassignment in timer callback
  let arrAssign = [0n]
  const h4 = setInterval(() => {
    arrAssign = [arrAssign[0] + 1n]
    f.printString(`${DEMO_TAG}:arr_assign_first`)
    f.printString(str(arrAssign[0]))
    if (arrAssign[0] >= 2n) {
      clearInterval(h4)
    }
  }, 450)

  f.printString(`${DEMO_TAG}:end`)
})
