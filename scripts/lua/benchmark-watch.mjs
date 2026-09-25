import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = path.join(project, '.tmp/lua-benchmark')
const prior = fs
  .readdirSync(base)
  .filter((x) => x.startsWith('entries-100-'))
  .map((x) => path.join(base, x))
  .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0]
assert.ok(prior, 'Run node scripts/lua/benchmark.mjs first')
const root = fs.mkdtempSync(path.join(base, 'watch-'))
for (const name of fs.readdirSync(prior))
  if (/\.(ts|lua)$/.test(name)) fs.copyFileSync(path.join(prior, name), path.join(root, name))
for (const name of ['lua-server.ts', 'lua-signals.ts'])
  fs.copyFileSync(path.join(project, 'examples', name), path.join(root, name))
fs.writeFileSync(
  path.join(root, 'gsts.config.ts'),
  `export default {compileRoot:'.',entries:['main*.ts','lua-server.ts'],outDir:'out',lang:'zh'}`
)
const child = spawn(
  process.execPath,
  [
    path.join(project, 'bin/gsts.mjs'),
    'dev',
    '-c',
    path.join(root, 'gsts.config.ts'),
    '--noinject',
    '--lang',
    'zh',
    '--inject-profile'
  ],
  { cwd: project, stdio: ['ignore', 'pipe', 'pipe'] }
)
let log = '',
  pending = '',
  exited = false
const profiles = []
child.on('exit', () => {
  exited = true
})
child.stdout.on('data', (data) => {
  log = (log + data).slice(-60000)
  pending += data
  const lines = pending.split(/\r?\n/)
  pending = lines.pop()
  for (const line of lines)
    if (line.startsWith('[lua-profile] '))
      profiles.push(JSON.parse(line.slice('[lua-profile] '.length)))
})
child.stderr.on('data', (data) => {
  log = (log + data).slice(-60000)
})
async function wait(check) {
  const deadline = Date.now() + 45000
  while (!check()) {
    assert.ok(!exited && Date.now() < deadline, log)
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const runs = []
try {
  const gia = path.join(root, 'out/lua-server.gia')
  await wait(() => profiles.length > 0 && fs.existsSync(gia))
  await sleep(800)
  const entry = path.join(root, 'main0.ts'),
    entryText = fs.readFileSync(entry, 'utf8')
  const server = path.join(root, 'lua-server.ts'),
    serverText = fs.readFileSync(server, 'utf8')
  for (const mode of [
    'ts-edit',
    'ts-edit',
    'ts-edit',
    'lua-edit',
    'lua-edit',
    'lua-edit',
    'server-only'
  ]) {
    const index = profiles.length,
      started = performance.now(),
      beforeGia = fs.statSync(gia).mtimeMs
    if (mode === 'ts-edit')
      fs.writeFileSync(
        entry,
        entryText.replace('counter.next()', `counter.next()+${runs.length + 10}`)
      )
    if (mode === 'lua-edit')
      fs.writeFileSync(
        path.join(root, 'native.lua'),
        `return {twice=function(n)return n*${runs.length + 20} end}`
      )
    if (mode === 'server-only')
      fs.writeFileSync(server, serverText.replace('收到 LuaProbeInput', 'benchmark server-only'))
    await wait(() => profiles.length > index)
    const luaReadyMs = performance.now() - started
    if (mode === 'server-only')
      await wait(() => {
        const stat = fs.statSync(gia, { throwIfNoEntry: false })
        return stat && stat.mtimeMs !== beforeGia
      })
    runs.push({
      mode,
      luaReadyMs,
      completionMs: performance.now() - started,
      profile: profiles[index]
    })
    await sleep(350)
  }
  fs.writeFileSync(path.join(base, 'watch-latest.json'), JSON.stringify({ runs }, null, 2) + '\n')
  console.log(
    JSON.stringify(
      runs.map((r) => ({
        mode: r.mode,
        luaReadyMs: Math.round(r.luaReadyMs),
        completionMs: Math.round(r.completionMs),
        luaWorkMs: Math.round(r.profile.timingsMs.total),
        tsFiles: r.profile.compiler.stats.sourceFiles
      }))
    )
  )
} finally {
  if (!exited) {
    const stopped = new Promise((resolve) => child.once('exit', resolve))
    child.kill()
    await stopped
  }
}
