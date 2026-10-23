import fs from 'node:fs'
import path from 'node:path'

import { parse } from 'luaparse'

import { t } from '../../../i18n/index.js'

/** 同时用于复制原生依赖和检查最终 Lua 的顶层加载环；不执行脚本。 */
function luaRequires(text: string) {
  const functions: [number, number][] = []
  const calls: { name: string | undefined; range: [number, number] }[] = []
  parse(text, {
    luaVersion: '5.3',
    scope: true,
    ranges: true,
    onCreateNode(node) {
      // ranges:true guarantees these offsets; the upstream declaration omits the option-dependent field.
      const { range } = node as typeof node & { range: [number, number] }
      if (node.type === 'FunctionDeclaration') functions.push(range)
      if (
        (node.type !== 'CallExpression' && node.type !== 'StringCallExpression') ||
        node.base.type !== 'Identifier' ||
        node.base.name !== 'require' ||
        ('isLocal' in node.base && node.base.isLocal === true)
      )
        return
      const argument = node.type === 'StringCallExpression' ? node.argument : node.arguments[0]
      let name: string | undefined
      if (argument?.type === 'StringLiteral') {
        const raw = argument.raw
        const long = /^\[(=*)\[([\s\S]*)\]\1\]$/.exec(raw)
        name = long ? long[2].replace(/^\r?\n/, '') : raw.slice(1, -1)
        if (name.includes('\\')) throw new Error(t('lua_requireSeparator'))
      }
      calls.push({ name, range })
    }
  })
  return calls.map((call) => ({
    name: call.name,
    deferred: functions.some((range) => range[0] <= call.range[0] && range[1] >= call.range[1])
  }))
}
export interface LuaParseCache {
  files: Map<string, { text: string; requires: ReturnType<typeof luaRequires> }>
  used: Set<string>
  parsed: number
  cycleChecks: number
  edges?: Map<string, string[]>
}
export function createLuaParseCache(): LuaParseCache {
  return { files: new Map(), used: new Set(), parsed: 0, cycleChecks: 0 }
}
function cachedRequires(name: string, text: string, cache?: LuaParseCache) {
  if (!cache) return luaRequires(text)
  cache.used.add(name)
  const previous = cache.files.get(name)
  if (previous?.text === text) return previous.requires
  cache.parsed++
  const requires = luaRequires(text)
  cache.files.set(name, { text, requires })
  return requires
}
function moduleName(name: string) {
  const module = name.replace(/\.lua$/, '')
  if (
    module.startsWith('.') ||
    path.isAbsolute(module) ||
    module.includes(':') ||
    module.split('/').includes('..')
  )
    throw new Error(t('lua_requireRelative', { arg0: name }))
  return module
}
export function collectNativeLua(
  filename: string,
  root: string,
  files: Map<string, string>,
  dependencies: Set<string>,
  allowDynamic = false,
  tsModules = new Set<string>(),
  cache?: LuaParseCache
) {
  const absolute = path.resolve(filename)
  const relative = path.relative(root, absolute).replace(/\\/g, '/')
  if (relative.startsWith('../') || path.isAbsolute(relative))
    throw new Error(t('lua_nativeOutsideRoot', { arg0: relative }))
  if (relative.startsWith('__gsts') || relative === 'lualib_bundle.lua')
    throw new Error(t('lua_nativeReserved', { arg0: relative }))
  if (files.has(relative)) return
  const text = fs.readFileSync(absolute, 'utf8').replace(/^\uFEFF/, '')
  const required = cachedRequires(`native:${absolute}`, text, cache)
  dependencies.add(absolute)
  files.set(relative, text)
  for (const { name } of required) {
    if (name === undefined) {
      if (allowDynamic) continue
      throw new Error(t('lua_nativeDynamic', { arg0: relative }))
    }
    const module = moduleName(name)
    const literal = path.resolve(root, module + '.lua')
    const target = fs.existsSync(literal)
      ? literal
      : path.resolve(root, module.replace(/\./g, '/') + '.lua')
    if (!fs.existsSync(target)) {
      if (tsModules.has(module) || tsModules.has(module.replace(/\./g, '/'))) continue
      throw new Error(t('lua_nativeDependencyMissing', { arg0: relative, arg1: name }))
    }
    collectNativeLua(target, root, files, dependencies, allowDynamic, tsModules, cache)
  }
}
export function checkLuaModuleCycles(files: ReadonlyMap<string, string>, cache?: LuaParseCache) {
  const edges = new Map<string, string[]>()
  for (const [name, text] of files) {
    if (!name.endsWith('.lua')) continue
    const targets: string[] = []
    for (const call of cachedRequires(`output:${name}`, text, cache)) {
      if (!call.name || call.deferred) continue
      const module = moduleName(call.name)
      const target = files.has(module + '.lua')
        ? module + '.lua'
        : module.replace(/\./g, '/') + '.lua'
      if (files.has(target)) targets.push(target)
    }
    edges.set(name, targets)
  }
  // Lua 文本仍逐个确认语法；顶层依赖边没变时，无需再次遍历整张图。
  if (
    cache?.edges &&
    edges.size === cache.edges.size &&
    [...edges].every(([name, targets]) => {
      const old = cache.edges!.get(name)
      return old && old.length === targets.length && old.every((target, i) => target === targets[i])
    })
  )
    return
  if (cache) cache.cycleChecks++
  const active: string[] = [],
    done = new Set<string>()
  const visit = (name: string) => {
    if (done.has(name)) return
    if (active.includes(name))
      throw new Error(
        t('lua_requireCycle', { arg0: [...active.slice(active.indexOf(name)), name].join(' → ') })
      )
    active.push(name)
    for (const target of edges.get(name) ?? []) visit(target)
    active.pop()
    done.add(name)
  }
  for (const name of files.keys()) visit(name)
  if (cache) cache.edges = edges
}
