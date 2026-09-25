import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = path.join(project, '.tmp/lua-benchmark')
fs.mkdirSync(base, { recursive: true })
const median = (items) => [...items].sort((a, b) => a - b)[Math.floor(items.length / 2)]
if (process.argv[2] === '--case') {
  const count = Number(process.argv[3])
  const root = fs.mkdtempSync(path.join(base, `parallel-${count}-`))
  const entries = []
  const originals = new Map()
  fs.writeFileSync(
    path.join(root, 'shared.ts'),
    'export let value=1;export function touch(){value++}'
  )
  // 99 个入口 + 1 个共享模块，恰好 100 个业务 TS 文件。
  for (let i = 0; i < 99; i++) {
    const functions = Array.from(
      { length: 24 },
      (_, n) => `function part${n}(v:number){return Math.max(0,Math.min(100,v*${n + 1}+${i}))}`
    ).join('\n')
    const sum = Array.from({ length: 24 }, (_, n) => `part${n}(elapsed)`).join('+')
    const source = `import {g} from 'genshin-ts/runtime/core';import {value,touch} from './shared';export default g.clientControlScript(lua=>{${functions};let elapsed=0;class Counter {value=0;next(){return ++this.value}}const counter=new Counter();return{onStart(){touch();lua.script.EnableUpdate(true)},onUpdate(dt){elapsed+=dt;lua.print(${sum},value,counter.next())}}})`
    const file = path.join(root, `main${i}.ts`)
    entries.push(file)
    originals.set(file, source)
    fs.writeFileSync(file, source)
  }
  const [
    { createLuaWorker },
    { compileLua, formatLuaDiagnostics },
    { checkLuaModuleCycles, createLuaParseCache },
    tstl,
    tsModule,
    luaLib
  ] = await Promise.all([
    import('../../dist/src/compiler/lua/worker-client.js'),
    import('../../dist/src/compiler/lua/build.js'),
    import('../../dist/src/compiler/lua/native.js'),
    import('typescript-to-lua'),
    import('typescript'),
    import('typescript-to-lua/dist/LuaLib.js')
  ])
  const ts = tsModule.default
  const workers = Array.from({ length: count }, () => createLuaWorker())
  const groups = workers.map((_, i) => entries.filter((_, index) => index % count === i))
  const input = { entries, rootDir: root, outDir: path.join(root, 'out'), profile: true }
  const runs = []
  const parsed = createLuaParseCache()
  function merge(results) {
    const files = new Map()
    for (const result of results) {
      assert.equal(result.hasErrors, false, result.diagnosticsText)
      for (const [name, text] of result.files) {
        if (name === 'lualib_bundle.lua') continue
        if (files.has(name))
          assert.equal(files.get(name), text, 'shared outputs must agree: ' + name)
        files.set(name, text)
      }
    }
    // 实验性分片也必须按完整代码重建最小运行库，不能简单覆盖某个分片的 bundle。
    const features = luaLib.findUsedLualibFeatures(tstl.LuaTarget.Lua53, ts.sys, [
      ...files.values()
    ])
    if (features.size) {
      const code = luaLib
        .buildMinimalLualibBundle(features, tstl.LuaTarget.Lua53, ts.sys)
        .replaceAll('debug.getinfo(level, "f")', '(debug.getinfo and debug.getinfo(level, "f"))')
        .replaceAll('debug.getinfo(3, "f")', '(debug.getinfo and debug.getinfo(3, "f"))')
      files.set(
        'lualib_bundle.lua',
        '-- @gsts:lua\n-- 此文件由 GSTS 生成，请修改源文件后重新编译。\n-- 来源：typescript-to-lua@1.34.0 (lualib)\n' +
          code
      )
    }
    parsed.used.clear()
    parsed.parsed = 0
    checkLuaModuleCycles(files, parsed)
    for (const name of parsed.files.keys()) if (!parsed.used.has(name)) parsed.files.delete(name)
    return files
  }
  try {
    const modes = [
      'first',
      ...Array(3).fill('all-ts-edit'),
      ...Array(3).fill('one-ts-edit'),
      ...Array(3).fill('shared-edit')
    ]
    for (const mode of modes) {
      if (mode === 'all-ts-edit')
        for (const file of entries)
          fs.writeFileSync(
            file,
            originals.get(file).replace('elapsed+=dt;', `elapsed+=dt*${runs.length + 1};`)
          )
      if (mode === 'one-ts-edit')
        fs.writeFileSync(
          entries[0],
          originals.get(entries[0]).replace('elapsed+=dt;', `elapsed+=dt*${runs.length + 10};`)
        )
      if (mode === 'shared-edit')
        fs.writeFileSync(
          path.join(root, 'shared.ts'),
          `export let value=${runs.length};export function touch(){value++}`
        )
      const started = performance.now()
      const outcomes = await Promise.allSettled(
        workers.map((worker, i) => worker.compile({ ...input, entries: groups[i] }))
      )
      for (const outcome of outcomes) if (outcome.status === 'rejected') throw outcome.reason
      const results = outcomes.map((outcome) => outcome.value)
      const mergeStarted = performance.now()
      const files = merge(results)
      const mergeMs = performance.now() - mergeStarted
      const totalMs = performance.now() - started
      runs.push({
        mode,
        totalMs,
        mergeMs,
        transpiledFiles: results.reduce((sum, r) => sum + r.profile.stats.transpiledFiles, 0),
        workerMs: results.map((r) => r.profile.timingsMs.total)
      })
      // 正确性对照在计时结束后执行，逐文件比较，不把它算进并行收益。
      const reference = compileLua(input)
      assert.ok(
        !reference.diagnostics.some((d) => d.category === 1),
        formatLuaDiagnostics(reference.diagnostics)
      )
      assert.deepEqual([...files.keys()].sort(), [...reference.files.keys()].sort())
      for (const [name, text] of files)
        assert.equal(text, reference.files.get(name), 'parallel differs: ' + name)
    }
  } finally {
    await Promise.all(workers.map((worker) => worker.close()))
  }
  console.log(JSON.stringify({ workers: count, tsFiles: 100, entries: 99, runs }))
} else {
  const results = []
  for (const count of [1, 2, 4]) {
    const child = spawnSync(
      process.execPath,
      [fileURLToPath(import.meta.url), '--case', String(count)],
      { cwd: project, encoding: 'utf8', timeout: 240000, maxBuffer: 8 * 1024 * 1024 }
    )
    assert.equal(child.status, 0, child.stdout + child.stderr)
    const result = JSON.parse(child.stdout.trim())
    results.push(result)
    const summary = { workers: count }
    for (const mode of ['first', 'all-ts-edit', 'one-ts-edit', 'shared-edit'])
      summary[mode] = Math.round(
        median(result.runs.filter((r) => r.mode === mode).map((r) => r.totalMs))
      )
    console.log(JSON.stringify(summary))
  }
  fs.writeFileSync(
    path.join(base, 'parallel-latest.json'),
    JSON.stringify(
      { cpu: os.cpus()[0]?.model, node: process.version, date: new Date().toISOString(), results },
      null,
      2
    ) + '\n'
  )
}
