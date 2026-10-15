import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const suites = {
  default: [
    'compiler',
    'names',
    'private-fields',
    'standard-library',
    'data-modules',
    'lint',
    'incremental',
    'affected',
    'output-incremental',
    'discovery',
    'editor',
    'cli',
    'cli-language',
    'worker',
    'injection'
  ],
  watch: [
    'watch',
    'watch-routing',
    'mixed-failures',
    'watch-additions',
    'graph-imports',
    'watch-inactive',
    'exit-codes'
  ]
}
const args = process.argv.slice(2)
if (args.length > 1 || (args.length === 1 && args[0] !== '--watch')) {
  console.error('Usage: node tests/lua/run.mjs [--watch]')
  process.exit(2)
}
const suite = args[0] === '--watch' ? suites.watch : suites.default
const root = fileURLToPath(new URL('../..', import.meta.url))
let active
let interrupted = false
function stop(signal) {
  interrupted = true
  process.exitCode = signal === 'SIGINT' ? 130 : 143
  if (!active?.pid) return
  // Stop only this runner's active test and its descendants (including dev watchers).
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(active.pid), '/T', '/F'], { stdio: 'ignore' })
  } else {
    process.kill(-active.pid, signal)
  }
}
const interrupt = () => stop('SIGINT')
const terminate = () => stop('SIGTERM')
process.on('SIGINT', interrupt)
process.on('SIGTERM', terminate)
try {
  for (const [index, name] of suite.entries()) {
    console.log(`[lua-test ${index + 1}/${suite.length}] ${name}`)
    const status = await new Promise((resolve, reject) => {
      active = spawn(process.execPath, ['--import', 'tsx', `tests/lua/${name}.mjs`], {
        cwd: root,
        stdio: 'inherit',
        detached: process.platform !== 'win32'
      })
      active.once('error', reject)
      active.once('close', resolve)
    })
    active = undefined
    if (interrupted) break
    if (status !== 0) {
      console.error(`[lua-test] ${name} failed (exit ${status})`)
      process.exitCode = status || 1
      break
    }
  }
  if (!process.exitCode) console.log(`[lua-test] ${suite.length} suites passed`)
} finally {
  process.off('SIGINT', interrupt)
  process.off('SIGTERM', terminate)
}
