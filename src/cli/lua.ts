import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import fg from 'fast-glob'
import ts from 'typescript'

import type { GstsConfig } from '../compiler/gsts_config.js'
import type { LuaCompileCache } from '../compiler/lua/build.js'
import { createLuaWorker, type LuaWorker } from '../compiler/lua/worker-client.js'
import { resolveGilTarget } from './gil_paths.js'

export interface ClientLuaSession {
  compiler?: LuaCompileCache
  worker?: LuaWorker
  graphFiles?: Set<string>
  last?: { key: string; dependencies: string[]; entries: string[]; candidates: string[] }
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
  changedFiles?: readonly string[],
  onPrepared?: (dependencies: string[]) => void
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
  mark('discover')
  const additionalFiles = cfg.lua?.include?.length
    ? await fg(cfg.lua.include, {
        cwd: rootDir,
        absolute: true,
        onlyFiles: true,
        ignore: ['**/node_modules/**']
      })
    : []
  mark('additionalFiles')
  const key = JSON.stringify([
    cfgDir,
    cfg,
    noinject,
    complete,
    [...entries].sort(),
    [...additionalFiles].sort()
  ])
  const last = session?.last
  const dependencies = new Set(last?.dependencies.map(normalize))
  const knownFiles = new Set(
    [...(last?.candidates ?? []), ...(session?.graphFiles ?? [])].map(normalize)
  )
  if (
    last?.key === key &&
    changedFiles &&
    changedFiles.every(
      (file) =>
        knownFiles.has(normalize(file)) &&
        fs.existsSync(file) &&
        !dependencies.has(normalize(file)) &&
        !/\.(lua|json)$|\.d\.ts$/i.test(file)
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
  const { writeLuaFiles, describeLuaConflicts } = await import('../compiler/lua/output.js')
  mark('loadCompiler')
  const input = { entries, rootDir, outDir, additionalFiles, profile }
  const prepared = (dependencies: string[]) => {
    if (profile)
      console.log('[lua-prepared]', JSON.stringify({ dependencies: dependencies.length }))
    onPrepared?.(dependencies)
  }
  const compile = async () => {
    if (session?.worker) return session.worker.compile(input, prepared)
    const { compileLua, formatLuaDiagnostics, createLuaCompileCache } = await import(
      '../compiler/lua/build.js'
    )
    if (session && !session.compiler) session.compiler = createLuaCompileCache()
    const { diagnostics, ...result } = compileLua(input, session?.compiler, prepared)
    return {
      ...result,
      diagnosticsText: formatLuaDiagnostics(diagnostics),
      hasErrors: diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error)
    }
  }
  const result = entries.length
    ? await compile()
    : {
        files: new Map<string, string>(),
        entries: [],
        dependencies: [],
        diagnosticsText: '',
        hasErrors: false
      }
  mark('compile')
  if (result.diagnosticsText) console.log(result.diagnosticsText)
  if (result.hasErrors) throw new Error('Lua 编译失败；未更新本地产物和游戏文件。')
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
        execution: session?.worker ? 'worker' : 'main',
        candidates: candidates.length,
        entries: entries.length,
        timingsMs: { ...timingsMs, total: performance.now() - started },
        compiler: 'profile' in result ? result.profile : undefined
      })
    )
  const summary = { key, dependencies: result.dependencies, entries: result.entries, candidates }
  if (session) session.last = summary
  return summary
}

/** 依赖分组完成后即可开始节点图编译；两种目标各用自己的类型环境。 */
export function startClientLua(
  cfgDir: string,
  cfg: GstsConfig,
  noinject: boolean,
  profile: boolean,
  session?: ClientLuaSession,
  changedFiles?: readonly string[]
) {
  const state = session ?? {}
  state.worker ??= createLuaWorker()
  let ready!: (value: { dependencies: string[] }) => void
  let failed!: (error: unknown) => void
  const prepared = new Promise<{ dependencies: string[] }>((resolve, reject) => {
    ready = resolve
    failed = reject
  })
  const result = buildClientLua(
    cfgDir,
    cfg,
    noinject,
    true,
    profile,
    state,
    changedFiles,
    (dependencies) => ready({ dependencies })
  )
    .then(
      (result) => {
        ready(result)
        return result
      },
      (error) => {
        failed(error)
        throw error
      }
    )
    .finally(async () => {
      if (!session) await state.worker?.close()
    })
  // 调用方可能先等待依赖分组；错误仍由返回的 Promise 交给调用方处理。
  void result.catch(() => {})
  return { prepared, result }
}
