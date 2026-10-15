import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import fg from 'fast-glob'
import ts from 'typescript'

import type { GstsConfig } from '../compiler/gsts_config.js'
import type { LuaCompileCache } from '../compiler/lua/build.js'
import type { LuaOutputCache } from '../compiler/lua/output.js'
import { nodeGraphCalls } from '../compiler/lua/syntax.js'
import { createLuaWorker, type LuaWorker } from '../compiler/lua/worker-client.js'
import { resolveGilTarget } from './gil_paths.js'

export interface ClientLuaReport {
  active: boolean
  compilation: string
  injection: string
  log: (...values: unknown[]) => void
}

export interface ClientLuaSession {
  /** 最近发现的依赖；编译失败也保留，以便修复依赖时能再次触发。 */
  dependencies?: string[]
  compiler?: LuaCompileCache
  worker?: LuaWorker
  localOutput?: LuaOutputCache
  injectedOutput?: LuaOutputCache
  graphFiles?: Set<string>
  discovery?: {
    key: string
    candidates: Map<string, { file: string; entry: boolean }>
    additionalFiles: string[]
    knownFiles: Set<string>
  }
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
  onPrepared?: (dependencies: string[]) => void,
  reporting?: ClientLuaReport
) {
  const report = reporting ?? {
    active: false,
    compilation: '失败',
    injection: '未执行（编译或写出失败）',
    log: (...values: unknown[]) => console.log(...values)
  }
  const log = report.log
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
  const discoveryKey = JSON.stringify([rootDir, cfg.entries, cfg.lua?.include])
  const priorDiscovery = session?.discovery?.key === discoveryKey ? session.discovery : undefined
  const changed = changedFiles && new Set(changedFiles.map(normalize))
  const reuseFileList = !!(
    changedFiles &&
    priorDiscovery &&
    changedFiles.every(
      (file) =>
        priorDiscovery.knownFiles.has(normalize(file)) &&
        fs.existsSync(file) &&
        !/\.json$|\.d\.ts$/i.test(file)
    )
  )
  let discoveryReads = 0
  let candidates: string[]
  if (reuseFileList) candidates = [...priorDiscovery!.candidates.values()].map((item) => item.file)
  else {
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
    candidates = await fg(patterns, {
      cwd: rootDir,
      absolute: true,
      ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.gs.ts'],
      onlyFiles: true
    })
  }
  const classified = new Map<string, { file: string; entry: boolean }>()
  const entries = candidates.filter((file) => {
    const key = normalize(file)
    const prior = changed && !changed.has(key) ? priorDiscovery?.candidates.get(key) : undefined
    if (prior) {
      classified.set(key, prior)
      return prior.entry
    }
    discoveryReads++
    const text = fs.readFileSync(file, 'utf8')
    let entry = false
    if (text.includes('clientControlScript')) {
      const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
      entry = source.statements.some(
        (s) =>
          ts.isExportAssignment(s) &&
          ts.isCallExpression(s.expression) &&
          ts.isPropertyAccessExpression(s.expression.expression) &&
          s.expression.expression.name.text === 'clientControlScript'
      )
    }
    classified.set(key, { file, entry })
    return entry
  })
  report.active = entries.length > 0
  mark('discover')
  const additionalFiles = reuseFileList
    ? priorDiscovery!.additionalFiles
    : cfg.lua?.include?.length
      ? await fg(cfg.lua.include, {
          cwd: rootDir,
          absolute: true,
          onlyFiles: true,
          ignore: ['**/node_modules/**']
        })
      : []
  const discovery = {
    key: discoveryKey,
    candidates: classified,
    additionalFiles,
    knownFiles: new Set(
      [
        ...candidates,
        ...additionalFiles,
        ...(session?.last?.dependencies ?? []),
        ...(session?.graphFiles ?? [])
      ].map(normalize)
    )
  }
  if (session) session.discovery = discovery
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
      log(
        '[lua-profile]',
        JSON.stringify({
          kind: 'gsts-lua-profile',
          skipped: true,
          reason: 'unrelated-change',
          discoveryReads,
          discoveryRescanned: !reuseFileList,
          timingsMs: { total: performance.now() - started }
        })
      )
    report.compilation = '无改动（沿用上次成功产物）'
    report.injection = '无需更新'
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
      log(
        '[lua-profile]',
        JSON.stringify({
          kind: 'gsts-lua-profile',
          skipped: true,
          candidates: candidates.length,
          discoveryReads,
          discoveryRescanned: !reuseFileList,
          timingsMs: { ...timingsMs, total: performance.now() - started }
        })
      )
    const summary = { key, dependencies: [] as string[], entries: [] as string[], candidates }
    if (session) {
      session.last = summary
      session.dependencies = []
    }
    return summary
  }
  report.active = true
  const { writeLuaFiles, describeLuaConflicts } = await import('../compiler/lua/output.js')
  mark('loadCompiler')
  const input = {
    entries,
    rootDir,
    outDir,
    additionalFiles,
    profile,
    typeCheck: cfg.lua?.typeCheck,
    changedFiles: last?.key === key ? changedFiles : undefined
  }
  const prepared = (dependencies: string[]) => {
    if (session) session.dependencies = dependencies
    // 性能探针保留真实发生时机；普通诊断和结果仍在末尾集中显示。
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
  if (session) session.dependencies = result.dependencies
  mark('compile')
  if (result.diagnosticsText) log(result.diagnosticsText)
  if (result.hasErrors) throw new Error('Lua 编译失败；未更新本地产物和游戏文件。')
  if (session && (!changedFiles || last?.key !== key)) {
    session.localOutput = {}
    session.injectedOutput = {}
  }
  report.compilation = '成功，但本地写出失败'
  const local = writeLuaFiles(outDir, result.files, complete, owner, session?.localOutput)
  if (local.conflicts.length) throw new Error(describeLuaConflicts(local, false))
  report.compilation = `成功；本地产物 ${result.files.size} 个，更新 ${local.written.length}，未改动 ${local.unchanged.length}，移除 ${local.removed.length}`
  report.injection = noinject ? '已关闭（--noinject）' : '未配置地图'
  mark('localWrite')
  log(
    `[Lua] 本地产物 ${result.files.size} 个；更新 ${local.written.length}，未改动 ${local.unchanged.length}，移除 ${local.removed.length}。`
  )
  if (cfg.inject?.mapId !== undefined && !noinject) {
    report.injection = '失败'
    try {
      const target = resolveGilTarget(cfg.inject)
      const destination = path.join(target.saveLevelDir, String(target.mapId), 'external_lua_file')
      const injected = writeLuaFiles(
        destination,
        result.files,
        complete,
        owner,
        session?.injectedOutput
      )
      if (injected.conflicts.length) throw new Error(describeLuaConflicts(injected, true))
      report.injection = `成功；更新 ${injected.written.length}，未改动 ${injected.unchanged.length}，移除 ${injected.removed.length}`
      log(
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
    log(
      '[lua-profile]',
      JSON.stringify({
        kind: 'gsts-lua-profile',
        execution: session?.worker ? 'worker' : 'main',
        discoveryReads,
        discoveryRescanned: !reuseFileList,
        candidates: candidates.length,
        entries: entries.length,
        timingsMs: { ...timingsMs, total: performance.now() - started },
        compiler: 'profile' in result ? result.profile : undefined
      })
    )
  const summary = { key, dependencies: result.dependencies, entries: result.entries, candidates }
  if (session) session.last = summary
  discovery.knownFiles = new Set(
    [...candidates, ...additionalFiles, ...result.dependencies, ...(session?.graphFiles ?? [])].map(
      normalize
    )
  )
  return summary
}

/** 依赖分组完成后即可开始节点图编译；两种目标各用自己的类型环境。 */
export function startClientLua(
  cfgDir: string,
  cfg: GstsConfig,
  noinject: boolean,
  profile: boolean,
  session?: ClientLuaSession,
  changedFiles?: readonly string[],
  complete = true
) {
  const state = session ?? {}
  state.worker ??= createLuaWorker()
  type Prepared = { dependencies: string[]; excludeFiles: string[] }
  let resolvePrepared!: (value: Prepared) => void
  const prepared = new Promise<Prepared>((resolve) => {
    resolvePrepared = resolve
  })
  let isPrepared = false
  const ready = (value: { dependencies: string[] }) => {
    if (isPrepared) return
    isPrepared = true
    // Lua 依赖里可能包含节点图入口。保留该入口给节点图编译；Lua 自身会报告错误。
    const excludeFiles = value.dependencies.filter((file) => {
      if (!file.endsWith('.ts') || file.endsWith('.d.ts') || !fs.existsSync(file)) return true
      const source = ts.createSourceFile(
        file,
        fs.readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true
      )
      return nodeGraphCalls(source).length === 0
    })
    resolvePrepared({ dependencies: value.dependencies, excludeFiles })
  }
  const logs: unknown[][] = []
  const report: ClientLuaReport = {
    active: false,
    compilation: '失败',
    injection: '未执行（编译或写出失败）',
    log: (...values) => logs.push(values)
  }
  const result = buildClientLua(
    cfgDir,
    cfg,
    noinject,
    complete,
    profile,
    state,
    changedFiles,
    (dependencies) => ready({ dependencies }),
    report
  )
    .then(
      (result) => {
        ready(result)
        return result
      },
      (error) => {
        // Lua 失败也不能阻止节点图。至少排除已识别的 Lua 入口，避免作为 JS 执行。
        ready({
          dependencies: [
            ...new Set([
              ...(state.dependencies ?? []),
              ...[...(state.discovery?.candidates.values() ?? [])]
                .filter((item) => item.entry)
                .map((item) => item.file)
            ])
          ]
        })
        throw error
      }
    )
    .finally(async () => {
      if (!session) await state.worker?.close()
    })
  // 调用方可能先等待依赖分组；错误仍由返回的 Promise 交给调用方处理。
  void result.catch(() => {})
  return {
    prepared,
    result,
    report,
    // 编译和写出可以并行；普通日志与总结留到节点图输出结束后统一显示。
    async finish() {
      let value: Awaited<typeof result> | undefined
      let failure: string | undefined
      try {
        value = await result
      } catch (error) {
        process.exitCode = 1
        failure = error instanceof Error ? error.message : String(error)
      }
      for (const values of logs.splice(0)) console.log(...values)
      if (failure) console.log(`[Lua] ${failure}`)
      if (report.active || failure)
        console.log(`[TS→Lua] 编译：${report.compilation}；注入：${report.injection}。`)
      return value
    }
  }
}
