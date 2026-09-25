import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

// All fixtures and outputs stay under .tmp. This never writes to a game map.
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = path.join(project, '.tmp/lua-benchmark')
fs.mkdirSync(base, { recursive: true })
const fixture = (count) => {
  const root = fs.mkdtempSync(path.join(base, `entries-${count}-`))
  fs.writeFileSync(
    path.join(root, 'shared.ts'),
    'export let visits=0;export function touch(){visits++}'
  )
  fs.writeFileSync(
    path.join(root, 'native.d.ts'),
    'export function twice(this:void,n:number):number'
  )
  fs.writeFileSync(path.join(root, 'native.lua'), 'return {twice=function(n)return n*2 end}')
  const entries = []
  for (let i = 0; i < count; i++) {
    const functions = Array.from(
      { length: 24 },
      (_, n) =>
        `export function part${n}(n:number){return Math.max(0,Math.min(100,n*${n + 1}+${i}))}`
    ).join('\n')
    fs.writeFileSync(
      path.join(root, `logic${i}.ts`),
      functions +
        `\nexport function step(n:number){return ${Array.from({ length: 24 }, (_, n) => `part${n}(n)`).join('+')}}`
    )
    const name = path.join(root, `main${i}.ts`)
    fs.writeFileSync(
      name,
      `import {g} from 'genshin-ts/runtime/core';import{step}from'./logic${i}';import{visits,touch}from'./shared';import{twice}from'./native';export default g.clientControlScript(lua=>{let elapsed=0;class Counter{value=0;next(){return ++this.value}}const counter=new Counter();return{onStart(){touch();lua.script.EnableUpdate(true)},onUpdate(dt){elapsed+=dt;lua.print(step(twice(elapsed)),visits,counter.next())}}})`
    )
    entries.push(name)
  }
  return { root, entries }
}
if (process.argv[2] === '--case') {
  const count = Number(process.argv[3])
  const { root, entries } = fixture(count)
  const importStart = performance.now()
  const [{ compileLua, formatLuaDiagnostics, createLuaCompileCache }, { writeLuaFiles }] =
    await Promise.all([
      import('../../dist/src/compiler/lua/build.js'),
      import('../../dist/src/compiler/lua/output.js')
    ])
  const loadCompilerMs = performance.now() - importStart
  const cache = createLuaCompileCache()
  const runs = []
  const entrySource = fs.readFileSync(entries[0], 'utf8')
  for (const mode of [
    'first',
    'unchanged',
    'unchanged',
    'unchanged',
    'ts-edit',
    'ts-edit',
    'ts-edit',
    'lua-edit',
    'lua-edit',
    'lua-edit'
  ]) {
    if (mode === 'ts-edit')
      fs.writeFileSync(
        entries[0],
        entrySource.replace('elapsed+=dt;', `elapsed+=dt*${runs.length};`)
      )
    if (mode === 'lua-edit')
      fs.writeFileSync(
        path.join(root, 'native.lua'),
        `return {twice=function(n)return n*${runs.length} end}`
      )
    const started = performance.now(),
      cpu = process.cpuUsage()
    const result = compileLua(
      {
        entries,
        rootDir: root,
        outDir: path.join(root, 'out'),
        profile: true
      },
      cache
    )
    assert.ok(
      !result.diagnostics.some((d) => d.category === 1),
      formatLuaDiagnostics(result.diagnostics)
    )
    const writeStart = performance.now()
    const written = writeLuaFiles(path.join(root, 'out'), result.files, true)
    assert.equal(written.conflicts.length, 0)
    runs.push({
      mode,
      compiler: result.profile,
      writeMs: performance.now() - writeStart,
      totalMs: performance.now() - started,
      cpuMs: Object.values(process.cpuUsage(cpu)).reduce((a, b) => a + b, 0) / 1000,
      written: written.written.length
    })
  }
  const sourceBytes = fs
    .readdirSync(root)
    .filter((x) => /\.(ts|lua)$/.test(x))
    .reduce((n, x) => n + fs.statSync(path.join(root, x)).size, 0)
  console.log(
    JSON.stringify({
      count,
      sourceBytes,
      loadCompilerMs,
      maxRssMB: process.resourceUsage().maxRSS / 1024,
      runs
    })
  )
} else {
  const results = []
  // Run sequentially so benchmark cases do not compete for CPU or disk.
  for (const count of [1, 20, 100]) {
    const child = spawnSync(
      process.execPath,
      [fileURLToPath(import.meta.url), '--case', String(count)],
      { cwd: project, encoding: 'utf8', timeout: 180000, maxBuffer: 8 * 1024 * 1024 }
    )
    assert.equal(child.status, 0, child.stderr + child.stdout)
    const result = JSON.parse(child.stdout.trim())
    results.push(result)
    const median = (items) => [...items].sort((a, b) => a - b)[Math.floor(items.length / 2)]
    const summary = {
      entries: count,
      sourceKiB: Math.round(result.sourceBytes / 1024),
      loadCompilerMs: Math.round(result.loadCompilerMs),
      maxRssMB: Math.round(result.maxRssMB)
    }
    for (const mode of ['first', 'unchanged', 'ts-edit', 'lua-edit'])
      summary[mode] = Math.round(
        median(result.runs.filter((r) => r.mode === mode).map((r) => r.totalMs))
      )
    console.log(JSON.stringify(summary))
  }
  const report = {
    node: process.version,
    platform: process.platform,
    cpu: os.cpus()[0]?.model,
    logicalCpus: os.cpus().length,
    date: new Date().toISOString(),
    results
  }
  fs.writeFileSync(path.join(base, 'latest.json'), JSON.stringify(report, null, 2) + '\n')
  console.log('Full phase timings: .tmp/lua-benchmark/latest.json')
}
