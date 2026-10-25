import assert from 'node:assert/strict'

import { buildFixture } from './support.mjs'

// 照节点图习惯写的 API：默认构建报 lua-graph-api 并给出客户端写法，不再重复 TypeScript 的"找不到名称"
const result = buildFixture(
  {
    'main.ts': `import {g, GameObject} from 'genshin-ts/runtime/core'
export default g.clientControlScript(lua=>{
  const str = 'a local named like a node-graph API is fine'
  lua.print(stage.get('x'), Vector3.zero, int(3), list([1]), GameObject, str)
  return {}
})`
  },
  false
)
const hints = result.diagnostics.filter((d) => d.source === 'lua-graph-api')
const text = (d) => (typeof d.messageText === 'string' ? d.messageText : d.messageText.messageText)
assert.deepEqual(
  hints.map((d) => text(d).match(/API (\w+)/)?.[1]).sort(),
  ['GameObject', 'Vector3', 'int', 'list', 'stage'],
  hints.map(text).join('\n')
)
assert(text(hints.find((d) => text(d).includes('API stage'))).includes('lua.helper.readVariable'))
assert(text(hints.find((d) => text(d).includes('API GameObject'))).includes('findControl'))
const hinted = new Set(hints.map((d) => d.start))
assert(
  !result.diagnostics.some((d) => [2304, 2305, 2552, 2724].includes(d.code) && hinted.has(d.start)),
  result.diagnostics.map(text).join('\n')
)
console.log(
  'Node-graph APIs in Lua: stage, GameObject, Vector3, int and list get the client way to do it, locals with the same names stay clean, and no duplicate TypeScript name error: PASS'
)
