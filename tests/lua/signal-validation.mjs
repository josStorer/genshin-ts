import assert from 'node:assert/strict'

import { signalKinds } from '../../src/runtime/signal_definition.ts'
import { buildFixture, execute, successful } from './support.mjs'

const result = successful(
  buildFixture({
    'main.ts': `import{g,defineSignal}from'genshin-ts/runtime/core';export default g.clientControlScript(()=>{const S=defineSignal('Input',[['n','int']] as const);return{onStart(){send(S,1)}}})`
  })
)
assert.match(result.files.get('main.lua'), /\.send\(/)
assert(!result.files.get('main.lua').includes('ServerSignal'))
const cases = {
  integer: ['3', '1.5'],
  float: ['2.5', '0/0'],
  string: ['"hello"', '3'],
  boolean: ['true', '0'],
  vec3: ['{x=1,y=2,z=3}', '{x=1,y="bad",z=3}']
}
let code = `local M=require('__gsts_helpers')
local constructed,sent,written=0,0,0
local expectedWriter
local handlers,errors={},{}
game={ServerSignal=function(name)
 constructed=constructed+1
 return setmetatable({SendSignal=function()sent=sent+1 end},{__index=function(_,writer)
   assert(writer==expectedWriter,writer);return function(self,value)written=written+1 end
 end})
end}
local script={}
function script:RegisterServerSignalHandler(name,callback)handlers[name]=callback end
function script:UnregisterServerSignalHandler(name)handlers[name]=nil end
local scope=M.createScope({script=script,printerr=function(message)errors[#errors+1]=message end},nil)
scope.activate()
`
for (const [kind, spec] of Object.entries(signalKinds)) {
  if (!spec.writer) continue
  for (const list of [false, true]) {
    const name = kind + (list ? '_list' : '')
    const [good, bad] = cases[spec.validation].map((value) => (list ? `{${value}}` : value))
    code += `do
   local signal={name='Contract_${name}',params={{'field','${name}'}}}
   expectedWriter='${spec.writer}${list ? 'List' : ''}'
   local received=0
   local off=scope.onSignal(signal,function(evt)received=received+1 end)
   local before=constructed
   M.send(signal,${good});handlers[signal.name](signal.name,{${good}})
   assert(constructed==before+1 and received==1)
   local ok,message=pcall(M.send,signal,${bad})
   assert(not ok and tostring(message):find(signal.name..'.field',1,true))
   handlers[signal.name](signal.name,{${bad}})
   assert(errors[#errors]:find(signal.name..'.field',1,true) and received==1 and constructed==before+1)
   off()
  end
`
  }
}
code += `local S={name='Count',params={{'value','int'}}}
local before=constructed
for _,values in ipairs({{}, {1,2}})do
 local ok,message=pcall(M.send,S,table.unpack(values))
 assert(not ok and tostring(message):find('Count',1,true))
end
assert(not pcall(M.send,S,1,nil))
assert(constructed==before,'invalid sends must not allocate a host signal')
local L={name='List',params={{'values','int_list'}}}
assert(not pcall(M.send,L,{[1]=1,[3]=3}))
assert(not pcall(M.send,L,{[0]=0,[1]=1}))
assert(not pcall(M.send,L,{1,0/0}))
scope.dispose()
assert(sent==${Object.values(signalKinds).filter((kind) => kind.writer).length * 2} and written==sent)
`
execute(result.files, code)
console.log(
  'Signal boundary: all nine scalar/list kinds share send/receive checks; invalid payloads never allocate a host signal: PASS'
)
