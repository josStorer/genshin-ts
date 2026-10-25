import assert from 'node:assert/strict'

import { buildFixture, execute, successful } from './support.mjs'

// 按名字监听拿到按顺序的原始值；信号定义的监听同时有 params 和带类型的 values；按名字发送只能不带参数。
const result = successful(
  buildFixture({
    'main.ts': `import{g,defineSignal}from'genshin-ts/runtime/core'
export default g.clientControlScript(lua=>{
  const Typed=defineSignal('Mixed',[['count','int'],['label','str']] as const)
  const seen:string[]=[]
  lua.onSignal('Raw',evt=>{seen.push(evt.name+':'+evt.values.length+':'+String(evt.values[0]))})
  lua.onSignal('Mixed',evt=>{seen.push('raw '+String(evt.values[1]))})
  lua.onSignal(Typed,evt=>{const [count,label]=evt.values;seen.push('typed '+(count+evt.params.count)+label+evt.params.label)})
  const {onSignal}=lua
  onSignal('Destructured',evt=>{seen.push('destructured '+evt.values.length)})
  return {methods:{seen(){return seen.join('|')},ping(){send('Ping')}}}
})`
  })
)
execute(
  result.files,
  `
 local handlers, logs, sent = {}, {}, {}
 script = {object = {alive = true}}
 function script:RegisterServerSignalHandler(name, fn) assert(handlers[name] == nil); handlers[name] = fn end
 function script:UnregisterServerSignalHandler(name) handlers[name] = nil end
 game = {ServerSignal = function(name)
   local signal = {name = name, writes = 0}
   function signal:AddInt() self.writes = self.writes + 1 end
   function signal:SendSignal() sent[#sent + 1] = self end
   return signal
 end}
 printerr = function(message) logs[#logs + 1] = message end
 require('main')
 OnEnable(); OnStart()
 handlers.Raw('Raw', {7, 'x'})
 handlers.Mixed('Mixed', {3, 'go'})
 handlers.Destructured('Destructured', {})
 assert(seen() == 'Raw:2:7|raw go|typed 6gogo|destructured 0', seen())
 -- 同名的信号定义加入后，按名字的监听也只收到检查合格的消息
 handlers.Mixed('Mixed', {1.5, 'go'})
 assert(#logs == 1 and logs[1]:find('Invalid signal payload: Mixed.count', 1, true), logs[1])
 assert(seen() == 'Raw:2:7|raw go|typed 6gogo|destructured 0', seen())
 ping()
 assert(#sent == 1 and sent[1].name == 'Ping' and sent[1].writes == 0)
 local ok, err = pcall(require('__gsts_helpers').send, 'Ping', 1)
 assert(not ok and tostring(err):find('cannot carry parameters', 1, true), tostring(err))
 OnDestroy()
 assert(next(handlers) == nil)
`
)

// 诊断：按名字发送带参数、信号参数既不是定义也不是字符串，默认构建就会报错
const diagnosed = buildFixture(
  {
    'main.ts': `import{g,defineSignal}from'genshin-ts/runtime/core'
export default g.clientControlScript(lua=>{
  const Typed=defineSignal('Typed',[['count','int']] as const)
  send('Ping', 1)
  lua.onSignal(42, ()=>{})
  send('Ok')
  send(Typed, 2)
  lua.onSignal('Ok', ()=>{})
  return {}
})`
  },
  false
)
const signalIssues = diagnosed.diagnostics.filter((d) => d.source === 'lua-signal-argument')
assert.equal(signalIssues.length, 2, signalIssues.map((d) => d.messageText).join('\n'))
assert(signalIssues.every((d) => d.category === 1))
console.log(
  'Signal names: onSignal by name gets raw values in order, definitions add typed values, a definition validates its name for every listener, send by name carries no parameters; misuse is diagnosed: PASS'
)
