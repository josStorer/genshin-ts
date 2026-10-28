import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const base = path.resolve('.tmp/lua-watch-additions')
fs.mkdirSync(base, { recursive: true })
const study = fs.mkdtempSync(path.join(base, 'run-'))
const lua = `import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return{onStart(){lua.print('added-lua')}}})`
const graph = `import{g}from'genshin-ts/runtime/core';g.server({id:1073742911,name:'AddedGraph'}).on('whenEntityIsCreated',(_evt,f)=>{f.printString('added-graph')})`
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
for (const [initial, added] of [
  ['empty', 'lua'],
  ['empty', 'graph'],
  ['lua', 'graph'],
  ['graph', 'lua']
]) {
  const dir = path.join(study, `${initial}-to-${added}`)
  const src = path.join(dir, 'src')
  fs.mkdirSync(src, { recursive: true })
  const config = path.join(dir, 'gsts.config.mjs')
  fs.writeFileSync(
    config,
    `export default {compileRoot:'src',entries:['**/*.ts'],outDir:'out',lang:'zh'}`
  )
  const output = (name) => path.join(dir, 'out', name)
  if (initial !== 'empty')
    fs.writeFileSync(path.join(src, 'initial.ts'), initial === 'lua' ? lua : graph)
  const child = spawn(
    process.execPath,
    [path.resolve('bin/gsts.mjs'), 'dev', '-c', config, '--noinject', '--lang', 'zh'],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  )
  let log = '',
    exited = false
  for (const stream of [child.stdout, child.stderr]) stream.on('data', (d) => (log += d))
  child.on('exit', () => (exited = true))
  async function wait(check) {
    const until = Date.now() + 45000
    while (!check()) {
      assert(!exited && Date.now() < until, `${initial}->${added}\n${log}`)
      await sleep(40)
    }
  }
  try {
    // 首轮：只有 Lua 时以 Lua 结果行结束，否则以 --noinject 提示结束
    await wait(() => log.includes(initial === 'lua' ? 'Lua 编译完成' : '--noinject 已启用'))
    // The first round's output precedes watcher setup; allow the watcher to finish its initial scan.
    await sleep(700)
    const initialOutput =
      initial === 'empty'
        ? undefined
        : output(initial === 'lua' ? 'lua/initial.lua' : 'initial.gia')
    const initialTime = initialOutput ? fs.statSync(initialOutput).mtimeMs : undefined
    const from = log.length
    // Also exercise a directory created after dev has started.
    fs.mkdirSync(path.join(src, 'new'))
    const file = path.join(src, 'new', 'added.ts')
    if (initial === 'empty') {
      // Editors commonly create an empty TS file before saving the entry body.
      fs.writeFileSync(file, '')
      await wait(() => log.slice(from).includes('开始编译'))
      await sleep(250)
    }
    const offset = log.length
    fs.writeFileSync(file, added === 'lua' ? lua : graph)
    const result = output(added === 'lua' ? 'lua/new/added.lua' : 'new/added.gia')
    await wait(
      () =>
        fs.existsSync(result) &&
        log.slice(offset).includes(added === 'lua' ? 'Lua 编译完成' : 'added.gia')
    )
    if (added === 'lua') {
      assert.match(fs.readFileSync(result, 'utf8'), /function _ENV\.OnStart/)
      assert.match(fs.readFileSync(result, 'utf8'), /added-lua/)
      assert(!fs.existsSync(output('new/added.gia')), log)
    } else {
      assert(fs.statSync(result).size > 0)
      assert.match(fs.readFileSync(output('new/added.json'), 'utf8'), /added-graph/)
      assert(!fs.existsSync(output('lua/new/added.lua')), log)
    }
    if (initialOutput)
      assert.equal(
        fs.statSync(initialOutput).mtimeMs,
        initialTime,
        'adding the other target must not rewrite the existing output'
      )
    assert(!/\[error\]|Lua 编译失败/.test(log), log)
    console.log(
      `PASS: dev ${initial} -> add ${added}, nested directory, correct outputs, existing target unchanged`
    )
  } finally {
    fs.writeFileSync(path.join(dir, 'dev.log'), log)
    if (!exited) {
      const stopped = new Promise((r) => child.once('exit', r))
      child.kill()
      await stopped
    }
  }
}
