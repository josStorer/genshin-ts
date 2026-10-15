import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { compileLua } from '../../dist/src/compiler/lua/build.js'
import { createLuaWorker } from '../../dist/src/compiler/lua/worker-client.js'

const base = path.resolve('.tmp/lua-worker')
fs.mkdirSync(base, { recursive: true })
const root = fs.mkdtempSync(path.join(base, 'run-'))
const input = {
  entries: [path.join(root, 'main.ts')],
  rootDir: root,
  outDir: path.join(root, 'out'),
  typeCheck: true
}
const good = `import {g} from 'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return {onStart(){lua.print(42)}}})`
fs.writeFileSync(input.entries[0], good)
const worker = createLuaWorker()
try {
  let prepared = false,
    settled = false
  const compiling = worker.compile(input, (deps) => {
    assert.equal(settled, false, 'dependencies must arrive before completion')
    assert.ok(
      deps.includes(input.entries[0].replaceAll('\\', '/')) || deps.includes(input.entries[0])
    )
    prepared = true
  })
  await assert.rejects(worker.compile(input), /已有任务/)
  const result = await compiling
  settled = true
  assert.ok(prepared)
  assert.equal(result.hasErrors, false, result.diagnosticsText)
  assert.deepEqual([...result.files].sort(), [...compileLua(input).files].sort())
  fs.writeFileSync(input.entries[0], good.replace('lua.print(42)', 'lua.print(missing)'))
  assert.equal((await worker.compile(input)).hasErrors, true)
  fs.writeFileSync(input.entries[0], good)
  assert.equal((await worker.compile(input)).hasErrors, false)
  const cancelled = worker.compile(input)
  const rejection = assert.rejects(cancelled, /取消/)
  await worker.close()
  await rejection
  assert.equal((await worker.compile(input)).hasErrors, false, 'closed worker can restart')
} finally {
  await worker.close()
}
console.log(
  'Lua worker: preparation, output, busy rejection, error recovery, cancellation and restart: PASS'
)
