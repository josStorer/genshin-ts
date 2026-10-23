import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { renderSignalKindsLua } from '../../src/compiler/lua/output/signal_kinds.ts'
import { execute } from './support.mjs'

// Default: Fengari correctness + timing. Optional Lua 5.4 comparison:
// node --import tsx tests/lua/signal-list-performance.mjs <wasmoon-entry> [previous-helpers.lua]
const [enginePath, previous] = process.argv.slice(2)
const current = fs.readFileSync('src/runtime/lua_assets/helpers.lua', 'utf8')
const setup = `
local sent=0
local S={name='Large',params={{'values','int_list'}}}
game={ServerSignal=function()return{AddIntList=function(_,value)assert(#value==100000)end,SendSignal=function()sent=sent+1 end}end}
local values={};for i=1,100000 do values[i]=i end
local start=os.clock();M.send(S,values);local elapsed=(os.clock()-start)*1000
assert(sent==1)
values[100000]='bad';assert(not pcall(M.send,S,values));values[100000]=100000
values[0]=0;assert(not pcall(M.send,S,values));values[0]=nil
values[50000]=nil;assert(not pcall(M.send,S,values));values[50000]=50000
assert(sent==1)
`
if (!enginePath) {
  execute(
    new Map([
      ['__gsts_helpers.lua', current],
      ['__gsts_signal_kinds.lua', renderSignalKindsLua()]
    ]),
    `local M=require('__gsts_helpers');${setup};print(string.format('100,000 integers: %.3f ms (Fengari; not a game measurement)',elapsed))`
  )
} else {
  const { LuaFactory } = await import(pathToFileURL(path.resolve(enginePath)).href)
  const results = {}
  for (const [name, text] of [
    ...(previous ? [['before', fs.readFileSync(previous, 'utf8')]] : []),
    ['after', current]
  ]) {
    const engine = await new LuaFactory().createEngine()
    try {
      await engine.doString(
        `package.preload['__gsts_signal_kinds']=function()${renderSignalKindsLua()}end;M=(function()${text}end)()`
      )
      await engine.doString(setup)
      const samples = []
      for (let i = 0; i < 9; i++)
        samples.push(
          await engine.doString(
            `local values={};for i=1,100000 do values[i]=i end;local S={name='Large',params={{'values','int_list'}}};local start=os.clock();for n=1,10 do M.send(S,values)end;return (os.clock()-start)*100`
          )
        )
      samples.sort((a, b) => a - b)
      results[name] = { medianMs: samples[4], samplesMs: samples }
    } finally {
      engine.global.close()
    }
  }
  console.log(
    JSON.stringify({
      engine: 'wasmoon / Lua 5.4',
      items: 100000,
      rounds: 9,
      repeatsPerRound: 10,
      results
    })
  )
  assert(results.after.medianMs >= 0)
}
console.log('Large lists: valid payload, invalid tail, zero-based key and sparse hole: PASS')
