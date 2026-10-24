import assert from 'node:assert/strict'

import { buildFixture, execute, successful } from './support.mjs'

// 作用域管理的点击、变量监听；按键回调可不写返回值；readParams 可省略 script；requireScript 找不到就报错。
const result = successful(
  buildFixture({
    'lua/board.ts':
      "import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return{methods:{ping(){return 1}}}})",
    'main.ts': `import {g} from 'genshin-ts/runtime/core'
import type Board from './lua/board'
export default g.clientControlScript(lua=>{
  const params=lua.helper.readParams({Goal:{type:'number',default:300}})
  const button=lua.helper.requireControl(self,'Button','ClientUIPresetButtonControl')
  let clicks=0, keys=0, stage=0, words=''
  lua.helper.listenCursor(button,lua.Enum.CursorEventType.CursorClick,()=>{clicks++})
  lua.helper.listenKey(self,lua.Enum.KeyEventType.KeyboardJumpKeyDown,()=>{keys++})
  lua.onVariable(lua.Enum.CustomVariableEntityType.Level,'Stage','number',(value)=>{stage=value})
  lua.onVariable(lua.Enum.CustomVariableEntityType.Level,'Stage','string',(value)=>{words=value})
  return {methods:{state(){return lua.helper.multi(params.Goal,clicks,keys,stage,words)},
    board(){return lua.helper.requireScript<typeof Board>(self,'Missing').methods.ping()}}}
})`
  })
)
execute(
  result.files,
  `
 local cursors, keys, variables, errors = {}, {}, {}, {}
 local level = {FullName = 'Enum.CustomVariableEntityType.Level'}
 local button = {name = 'Button', alive = true, GetChildren = function() return {} end}
 function button:AddCursorEventListener(event, fn) cursors[fn] = event end
 function button:RemoveCursorEventListener(event, fn) cursors[fn] = nil end
 local root = {alive = true, GetChildren = function() return {button} end}
 function root:AddKeyEventListener(event, fn) keys[fn] = event end
 function root:RemoveKeyEventListener(event, fn) keys[fn] = nil end
 typeof = function(control) return control == button and 'ClientUIPresetButtonControl' or 'ClientUIContainerControl' end
 local value = 2
 script = {object = root}
 function script:GetParam(name) assert(name == 'Goal'); return 500 end
 function script:EnableUpdate() end
 function script:RegisterCustomVariableChangedHandler(entity, name, fn) assert(not variables[name]); variables[name] = fn end
 function script:UnregisterCustomVariableChangedHandler(entity, name) variables[name] = nil end
 game = {GetGlobalCustomVariableValue = function(entity, name) assert(entity == level and name == 'Stage'); return value end}
 Enum = {CursorEventType = {CursorClick = 'click'}, KeyEventType = {KeyboardJumpKeyDown = 'jump'},
   CustomVariableEntityType = {Level = level}}
 printerr = function(message) errors[#errors + 1] = message end
 require('main')
 OnEnable(); OnStart()
 for fn in pairs(cursors) do fn({}) end
 for fn in pairs(keys) do assert(fn() == false, 'no return value means not handled') end
 variables.Stage(level, 'Stage')
 local goal, clicks, presses, stage, words = state()
 assert(goal == 500 and clicks == 1 and presses == 1 and stage == 2 and words == '')
 assert(#errors == 1 and errors[1]:find('Stage must be string', 1, true), errors[1])
 OnDisable()
 assert(next(cursors) == nil and next(keys) == nil and next(variables) == nil, 'disable pauses every listener')
 OnEnable()
 assert(next(cursors) and next(keys) and variables.Stage, 'enable resumes them')
 local ok, err = pcall(board)
 assert(not ok and tostring(err):find('Control not found: Missing', 1, true), tostring(err))
 OnDestroy()
 assert(next(cursors) == nil and next(keys) == nil and next(variables) == nil)
`
)
const main = result.files.get('main.lua')
assert(main.includes('readParams(_ENV.script,'), main)
assert(main.includes('requireScript("lua/board"'), main)

// 诊断：readParams 省略 script 只能写在回调里；变量的两种监听不能混用；onEnable 里丢弃的订阅要提醒
const diagnosed = buildFixture(
  {
    'main.ts': `import {g} from 'genshin-ts/runtime/core'
import {readParams} from 'genshin-ts/runtime/lua'
const outside=readParams({A:{type:'number'}})
export default g.clientControlScript(lua=>{
  const button=lua.helper.requireControl(self,'Button','ClientUIPresetButtonControl')
  lua.onVariable(lua.Enum.CustomVariableEntityType.Level,'Stage','number',()=>{})
  lua.script.RegisterCustomVariableChangedHandler(lua.Enum.CustomVariableEntityType.Level,'Stage',()=>{})
  return {onEnable(){lua.helper.listenCursor(button,lua.Enum.CursorEventType.CursorClick,()=>{})}}
})`
  },
  false
)
const sources = diagnosed.diagnostics.map((d) => d.source)
for (const rule of ['lua-instance-scope', 'lua-listener-ownership', 'lua-on-enable-subscription'])
  assert(sources.includes(rule), rule + ': ' + sources.join(', '))
console.log(
  'Listeners: listenCursor and onVariable follow the scope, listenKey callbacks may return nothing, readParams reads the current script, requireScript throws with the path; misuse is diagnosed: PASS'
)
