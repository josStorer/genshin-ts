import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import fg from 'fast-glob'
import ts from 'typescript'

import type { GstsConfig } from '../compiler/gsts_config.js'
import type { LuaCompileCache } from '../compiler/lua/build.js'
import { resolveGilTarget } from './gil_paths.js'

export interface ClientLuaSession {
  compiler?: LuaCompileCache
  last?: { key: string; dependencies: string[]; entries: string[] }
}
const normalize = (file: string) => {
  const absolute = path.resolve(file)
  return process.platform === 'win32' ? absolute.toLowerCase() : absolute
}

/** Lua 独立编译与注入；没有 Lua 入口时不加载 TSTL。 */
export async function buildClientLua(
  cfgDir: string,
  cfg: GstsConfig,
  noinject = false,
  complete = true,
  profile = process.env.GSTS_INJECT_PROFILE === '1',
  session?: ClientLuaSession,
  changedFiles?: readonly string[]
) {
  const started = profile ? performance.now() : 0
  let previous = started
  const timingsMs: Record<string, number> = {}
  const mark = (name: string) => {
    if (!profile) return
    const now = performance.now()
    timingsMs[name] = now - previous
    previous = now
  }
  const rootDir = path.resolve(cfgDir, cfg.compileRoot)
  const patterns = cfg.entries.map((raw) => {
    const neg = raw.startsWith('!'),
      entry = neg ? raw.slice(1) : raw
    const absolute = path.resolve(rootDir, entry)
    return (
      (neg ? '!' : '') +
      (fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()
        ? entry.replace(/\\/g, '/') + '/**/*.ts'
        : entry.replace(/\\/g, '/'))
    )
  })
  const candidates = await fg(patterns, {
    cwd: rootDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.gs.ts'],
    onlyFiles: true
  })
  const entries = candidates.filter((file) => {
    const text = fs.readFileSync(file, 'utf8')
    if (!text.includes('clientControlScript')) return false
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
    return source.statements.some(
      (s) =>
        ts.isExportAssignment(s) &&
        ts.isCallExpression(s.expression) &&
        ts.isPropertyAccessExpression(s.expression.expression) &&
        s.expression.expression.name.text === 'clientControlScript'
    )
  })
  const key = JSON.stringify([cfgDir, cfg, noinject, complete, [...entries].sort()])
  const last = session?.last
  const dependencies = new Set(last?.dependencies.map(normalize))
  if (
    last?.key === key &&
    changedFiles &&
    changedFiles.every(
      (file) => !dependencies.has(normalize(file)) && !/\.(lua|json)$|\.d\.ts$/i.test(file)
    )
  ) {
    if (profile)
      console.log(
        '[lua-profile]',
        JSON.stringify({
          kind: 'gsts-lua-profile',
          skipped: true,
          reason: 'unrelated-change',
          timingsMs: { total: performance.now() - started }
        })
      )
    return last
  }
  // 失败后下一轮必须重试，不能把上次成功当成本次成功。
  if (session) session.last = undefined
  const outDir = path.resolve(cfgDir, cfg.outDir, 'lua')
  const owner = createHash('sha256')
    .update(process.platform === 'win32' ? rootDir.toLowerCase() : rootDir)
    .digest('hex')
    .slice(0, 12)
  mark('discover')
  if (
    !entries.length &&
    (!complete || !fs.existsSync(path.join(outDir, `.gsts-lua-${owner}.json`)))
  ) {
    if (profile)
      console.log(
        '[lua-profile]',
        JSON.stringify({
          kind: 'gsts-lua-profile',
          skipped: true,
          candidates: candidates.length,
          timingsMs: { ...timingsMs, total: performance.now() - started }
        })
      )
    return { dependencies: [] as string[], entries: [] as string[] }
  }
  const [
    { compileLua, formatLuaDiagnostics, createLuaCompileCache },
    { writeLuaFiles, describeLuaConflicts }
  ] = await Promise.all([import('../compiler/lua/build.js'), import('../compiler/lua/output.js')])
  mark('loadCompiler')
  const additionalFiles = cfg.lua?.include?.length
    ? await fg(cfg.lua.include, {
        cwd: rootDir,
        absolute: true,
        onlyFiles: true,
        ignore: ['**/node_modules/**']
      })
    : []
  mark('additionalFiles')
  if (session && !session.compiler) session.compiler = createLuaCompileCache()
  const result = entries.length
    ? compileLua({ entries, rootDir, outDir, additionalFiles, profile }, session?.compiler)
    : { files: new Map<string, string>(), entries: [], dependencies: [], diagnostics: [] }
  mark('compile')
  if (result.diagnostics.length) console.log(formatLuaDiagnostics(result.diagnostics))
  if (result.diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error))
    throw new Error('Lua 编译失败；未更新本地产物和游戏文件。')
  const local = writeLuaFiles(outDir, result.files, complete, owner)
  if (local.conflicts.length) throw new Error(describeLuaConflicts(local, false))
  mark('localWrite')
  console.log(
    `[Lua] 本地产物 ${result.files.size} 个；更新 ${local.written.length}，未改动 ${local.unchanged.length}，移除 ${local.removed.length}。`
  )
  if (cfg.inject?.mapId !== undefined && !noinject) {
    try {
      const target = resolveGilTarget(cfg.inject)
      const destination = path.join(target.saveLevelDir, String(target.mapId), 'external_lua_file')
      const injected = writeLuaFiles(destination, result.files, complete, owner)
      if (injected.conflicts.length) throw new Error(describeLuaConflicts(injected, true))
      console.log(
        `[Lua] 注入完成：地图 ${target.mapId}；更新 ${injected.written.length}，未改动 ${injected.unchanged.length}，移除 ${injected.removed.length}。`
      )
    } catch (error) {
      throw new Error(
        `Lua 本地编译成功，但注入未完成。${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
  mark('injectionAndReport')
  if (profile)
    console.log(
      '[lua-profile]',
      JSON.stringify({
        kind: 'gsts-lua-profile',
        candidates: candidates.length,
        entries: entries.length,
        timingsMs: { ...timingsMs, total: performance.now() - started },
        compiler: 'profile' in result ? result.profile : undefined
      })
    )
  const summary = { key, dependencies: result.dependencies, entries: result.entries }
  if (session) session.last = summary
  return summary
}
