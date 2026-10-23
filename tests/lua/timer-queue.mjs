import assert from 'node:assert/strict'

import { buildFixture, execute, successful } from './support.mjs'

const result = successful(
  buildFixture({
    'main.ts': `import{g}from'genshin-ts/runtime/core';g.clientControlScript(lua=>{setTimeout(()=>{},1);return{onUpdate(){}}})`
  })
)
assert.match(result.files.get('main.lua'), /if \w+\.wantsUpdate then/)
execute(
  result.files,
  `
local M=require('__gsts_helpers')
local switches=0
local script={EnableUpdate=function(_,enabled)switches=switches+1 end}
local scope=M.createScope({script=script,printerr=error},'level')
local count=0
scope.activate()
for i=1,1000 do scope.tick(1) end
local future=scope.setTimeout(function()count=count+1 end,10000)
local earliest=scope.setTimeout(function()error('cancelled earliest')end,1)
scope.clearTimeout(earliest)
for i=1,1000 do scope.tick(0.001) end
assert(count==0)
-- Insert an earlier deadline, cancel it, then finish the original remaining delay.
local early=scope.setTimeout(function()count=count+100 end,500)
scope.tick(0.2);scope.clearTimeout(early);scope.tick(8.81)
assert(count==1)
scope.clearTimeout(future);scope.clearTimeout(future)
assert(switches==2)
local order={}
local later
scope.setTimeout(function()order[#order+1]=1;scope.clearTimeout(later);scope.setTimeout(function()order[#order+1]=3 end,0)end,0)
later=scope.setTimeout(function()error('cancelled during tick')end,0)
scope.tick(0);assert(#order==1);scope.tick(0);assert(order[2]==3)
local repeating
repeating=scope.setInterval(function()count=count+1;scope.clearInterval(repeating)end,0)
scope.tick(0);scope.tick(0);assert(count==2)
scope.enableUpdate(true);assert(scope.wantsUpdate==true)
scope.deactivate();assert(scope.wantsUpdate==false)
scope.activate();assert(scope.wantsUpdate==true)
scope.dispose();assert(scope.wantsUpdate==false)
`
)
console.log(
  'Timer deadlines: idle/waiting frames, earliest cancellation, reentrant scheduling, cancellation during tick and intent field: PASS'
)
