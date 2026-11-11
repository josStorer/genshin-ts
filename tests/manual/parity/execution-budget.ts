import { g } from 'genshin-ts/runtime/core'

// Measures how much one event may execute: each iteration runs two execution nodes
// (set local variable + branch) and the counter is printed every 50 iterations.
// If the game stops the event, the last printed number shows where.

g.server({
  id: 1073742441,
  name: '_GSTS_ExecutionBudget'
}).on('whenEntityIsCreated', () => {
  print('BUDGET START')
  let n = 0n
  for (let i = 0; i < 5000; i++) {
    n = n + 1n
    if (n % 50n === 0n) print(str(n))
  }
  print('BUDGET END')
})
