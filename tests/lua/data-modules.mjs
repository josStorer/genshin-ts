import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  compileLua,
  createLuaCompileCache,
  formatLuaDiagnostics
} from '../../src/compiler/lua/build.ts'
import { generateLuaDataModules, luaDataModules } from '../../src/compiler/lua/data_modules.ts'
import { buildFixture, execute, successful } from './support.mjs'

const result = successful(
  buildFixture({
    'main.ts': `import {g} from 'genshin-ts/runtime/core';
import {CharacterPrefab,CharacterPrefabZh} from 'genshin-ts/definitions/prefabs';
import {NODE_GRAPH_ENTRY_FACTORIES} from 'genshin-ts/definitions/node_graph_entries';
import {NODE_TYPE_BY_METHOD} from 'genshin-ts/definitions/node_modes';
import {SERVER_F_ZH_TO_EN} from 'genshin-ts/definitions/zh_aliases';
import {SERVER_LITERAL_ARGUMENT_INDEXES_BY_METHOD} from 'genshin-ts/definitions/server_node_metadata';
import {CLIENT_BLOCKED_SERVER_HELPERS} from 'genshin-ts/definitions/client_scoped_globals';
export default g.clientControlScript(lua=>{return{onStart(){
const key=lua.tostring('Kamisato_Ayaka') as keyof typeof CharacterPrefab;
lua.assert(CharacterPrefab.Kamisato_Ayaka===10000002 && CharacterPrefab[key]===10000002);
lua.assert(CharacterPrefabZh['神里绫华']===CharacterPrefab[key]);
lua.assert(NODE_GRAPH_ENTRY_FACTORIES[0]==='server');
lua.assert(NODE_TYPE_BY_METHOD.activateDisableCursorCollisionBox==='beyond');
lua.assert(Object.keys(SERVER_F_ZH_TO_EN).length>0);
lua.assert(SERVER_LITERAL_ARGUMENT_INDEXES_BY_METHOD.setPlayerSCursorClickSelectableTargets[0]===1);
lua.assert(CLIENT_BLOCKED_SERVER_HELPERS.length>0);
}}})`
  })
)
assert(result.files.has('__gsts_data/prefabs/CharacterPrefab.lua'))
assert(!result.files.has('__gsts_data/prefabs/CharacterPrefabZh.lua'))
assert(!result.files.has('__gsts_data/prefabs.lua'))
execute(result.files, "require('main');OnStart()")
const staticResult = successful(
  buildFixture({
    'main.ts': `import{g}from'genshin-ts/runtime/core';import{CharacterPrefab,CharacterPrefabZh}from'genshin-ts/definitions/prefabs';export default g.clientControlScript(lua=>{return{onStart(){lua.assert(CharacterPrefab.Amber===10000021);lua.assert(CharacterPrefabZh.丽莎===10000006)}}})`
  })
)
assert(![...staticResult.files.keys()].some((name) => name.startsWith('__gsts_data/')))
execute(staticResult.files, "require('main');OnStart()")
const namespaceResult = successful(
  buildFixture({
    'main.ts': `import{g}from'genshin-ts/runtime/core';import*as data from'genshin-ts/definitions/prefabs';export default g.clientControlScript(lua=>{const key=lua.tostring('Amber') as keyof typeof data.CharacterPrefab;return{onStart(){lua.assert(data.CharacterPrefab.Amber===10000021);lua.assert(data.CharacterPrefab[key]===10000021)}}})`
  })
)
assert(namespaceResult.files.has('__gsts_data/prefabs/CharacterPrefab.lua'))
assert(!namespaceResult.files.has('__gsts_data/prefabs.lua'))
execute(namespaceResult.files, "require('main');OnStart()")
for (const module of [
  'genshin-ts/definitions/enum',
  'genshin-ts/definitions/client_enums',
  'genshin-ts/runtime/value',
  'typescript'
]) {
  const failed = buildFixture(
    {
      'main.ts': `import{g}from'genshin-ts/runtime/core';import * as values from '${module}';export default g.clientControlScript(lua=>{return{onStart(){lua.print(values)}}})`
    },
    false
  )
  assert(
    failed.diagnostics.some((d) => String(d.messageText).includes('JavaScript')),
    module + ' ' + formatLuaDiagnostics(failed.diagnostics)
  )
  assert.equal(failed.files.size, 0)
}
const root = fs.mkdtempSync(path.resolve('.tmp/lua-tests/data-incremental-'))
const entry = path.join(root, 'main.ts')
fs.writeFileSync(
  entry,
  `import{g}from'genshin-ts/runtime/core';import{CharacterPrefab}from'genshin-ts/definitions/prefabs';export default g.clientControlScript(lua=>{return{onStart(){lua.print(CharacterPrefab.Amber)}}})`
)
const cache = createLuaCompileCache(),
  input = { entries: [entry], rootDir: root, outDir: path.join(root, 'out') }
const first = successful(compileLua(input, cache))
const unchanged = successful(compileLua({ ...input, changedFiles: [] }, cache))
assert.deepEqual(unchanged.files, first.files)
fs.writeFileSync(
  entry,
  "import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return{onStart(){lua.print(1)}}})"
)
const removed = successful(compileLua({ ...input, changedFiles: [entry] }, cache))
assert(![...removed.files.keys()].some((name) => name.startsWith('__gsts_data/')))
fs.mkdirSync(path.join(root, 'src/definitions'), { recursive: true })
fs.writeFileSync(
  path.join(root, 'src/definitions/prefabs.ts'),
  'export const sideEffect = console.log("must not run")'
)
assert.throws(() => generateLuaDataModules(root), /unsupported data expression/)
console.log(
  'Lua package data: six allowlisted modules, Chinese/dynamic keys, incremental removal and rejected JavaScript: PASS'
)
