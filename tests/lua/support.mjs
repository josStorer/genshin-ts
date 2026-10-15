import './locale.mjs'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { lauxlib, lua, lualib, to_jsstring, to_luastring } from 'fengari'

import { compileLua, formatLuaDiagnostics } from '../../src/compiler/lua/build.ts'

export function buildFixture(sources, typeCheck = true) {
  const base = path.resolve('.tmp/lua-tests')
  fs.mkdirSync(base, { recursive: true })
  const dir = fs.mkdtempSync(path.join(base, 'support-'))
  for (const [name, text] of Object.entries(sources)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true })
    fs.writeFileSync(path.join(dir, name), text)
  }
  return compileLua({
    entries: [path.join(dir, 'main.ts')],
    rootDir: dir,
    outDir: path.join(dir, 'out'),
    typeCheck
  })
}
export function successful(result) {
  assert(
    !result.diagnostics.some((d) => d.category === 1),
    formatLuaDiagnostics(result.diagnostics)
  )
  return result
}
export function execute(files, code) {
  const state = lauxlib.luaL_newstate()
  lualib.luaL_openlibs(state)
  const run = (text) => {
    const status = lauxlib.luaL_dostring(state, to_luastring(text))
    assert.equal(
      status,
      0,
      lua.lua_isstring(state, -1)
        ? to_jsstring(lua.lua_tostring(state, -1))
        : 'Lua execution failed'
    )
  }
  try {
    for (const [name, text] of files)
      run(
        `package.preload[${JSON.stringify(name.replace(/\.lua$/, '').replaceAll('/', '.'))}] = function(...)\n${text}\nend`
      )
    run(code)
  } catch (error) {
    fs.writeFileSync(
      path.resolve('.tmp/lua-tests/failed-output.json'),
      JSON.stringify(Object.fromEntries(files), null, 2)
    )
    throw error
  } finally {
    lua.lua_close(state)
  }
}
