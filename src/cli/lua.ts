import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import fg from 'fast-glob'
import ts from 'typescript'

import type { GstsConfig } from '../compiler/gsts_config.js'
import { entryCall, isNodeGraphEntry } from '../compiler/lua/analysis/syntax.js'
import type { LuaOutputCache, LuaWriteResult } from '../compiler/lua/output/output.js'
import type { LuaCompileCache, LuaPrepared } from '../compiler/lua/ts_to_lua_pipeline.js'
import { createBuildTimer } from '../compiler/lua/worker/profile.js'
import { createLuaWorker, type LuaWorker } from '../compiler/lua/worker/worker_client.js'
import { t } from '../i18n/index.js'
import type { LuaOutcome } from './build_summary.js'
import { resolveGilTarget } from './gil_paths.js'
import { createUi, uiTags } from './ui.js'

const ui = createUi()

/** 写出或注入一组文件的结果，用于结尾的一行说明。 */
interface LuaWriteSummary {
  dir: string
  files: number
  written: number
  unchanged: number
  removed: number
  skipped: number
}

export interface ClientLuaReport {
  /** 发现了 Lua 入口；dev 据此决定是否处理 Lua 文件的监听事件。 */
  active: boolean
  /** 这一轮真的编译了 Lua（复用上次结果或没有入口时为 false）。 */
  ran?: boolean
  local?: LuaWriteSummary & { entries: number }
  injected?: LuaWriteSummary
  log: (...values: unknown[]) => void
}

export interface ClientLuaSession {
  /** 有 Lua 入口或历史产物清单时，才处理 Lua 和声明文件的监听事件。 */
  active?: boolean
  /** 最近发现的依赖；编译失败也保留，以便修复依赖时能再次触发。 */
  dependencies?: string[]
  /** 最近一次 Lua 依赖中的节点图入口；它们不能从节点图编译中排除。 */
  graphEntries?: string[]
  compiler?: LuaCompileCache
  worker?: LuaWorker
  localOutput?: LuaOutputCache
  injectedOutput?: LuaOutputCache
  graphFiles?: Set<string>
  discovery?: {
    key: string
    candidates: Map<string, DiscoveredFile>
    additionalFiles: string[]
    knownFiles: Set<string>
    graphImports?: Map<string, string>
  }
  last?: { key: string; dependencies: string[]; entries: string[]; candidates: string[] }
}
/** 入口识别对每个候选文件的结论；parsed 为 false 时只做过文本筛查，graph 和 imports 还没算。 */
interface DiscoveredFile {
  file: string
  entry: boolean
  imports: string
  graph: boolean
  parsed: boolean
}
const normalize = (file: string) => {
  const absolute = path.resolve(file)
  return process.platform === 'win32' ? absolute.toLowerCase() : absolute
}

/** Lua 输出始终放在节点图输出目录下，监听排除也使用同一个名称。 */
export const LUA_OUTPUT_DIRECTORY = 'lua'
/** 单文件且没有配置时，Lua 使用 dist/lua，避免输出覆盖源码。 */
export const DEFAULT_LUA_OUT_DIR = 'dist'

export interface ClientLuaOptions {
  cfgDir: string
  cfg: GstsConfig
  noinject?: boolean
  complete?: boolean
  profile?: boolean
  session?: ClientLuaSession
  changedFiles?: readonly string[]
  onPrepared?: (prepared: LuaPrepared) => void
  reporting?: ClientLuaReport
}

type ClientLuaBuildContext = Omit<
  ClientLuaOptions,
  'noinject' | 'complete' | 'profile' | 'reporting'
> & {
  noinject: boolean
  complete: boolean
  profile: boolean
  rootDir: string
  report: ClientLuaReport
  timer: ReturnType<typeof createBuildTimer>
}
type DiscoveredClientLua = Awaited<ReturnType<typeof discoverClientLua>>
type ClientLuaCompilePlan = Extract<ReturnType<typeof planClientLua>, { kind: 'compile' }>
type CompiledClientLua = Awaited<ReturnType<typeof compilePlannedLua>>

/** Lua 独立编译与注入；没有 Lua 入口时不加载 TSTL。 */
export async function buildClientLua({
  cfgDir,
  cfg,
  noinject = false,
  complete = true,
  profile = process.env.GSTS_INJECT_PROFILE === '1',
  session,
  changedFiles,
  onPrepared,
  reporting
}: ClientLuaOptions) {
  const report: ClientLuaReport = reporting ?? {
    active: false,
    log: (...values: unknown[]) => console.log(...values)
  }
  const timer = createBuildTimer(profile)
  const rootDir = path.resolve(cfgDir, cfg.compileRoot)
  const context: ClientLuaBuildContext = {
    cfgDir,
    cfg,
    noinject,
    complete,
    profile,
    session,
    changedFiles,
    onPrepared,
    report,
    timer,
    rootDir
  }
  const discovered = await discoverClientLua(context)
  const plan = planClientLua(context, discovered)
  if (plan.kind !== 'compile') {
    timer.report(plan.metrics, report.log)
    return plan.summary
  }
  const compiled = await compilePlannedLua(context, discovered, plan)
  writeClientLua(context, compiled)
  injectClientLua(context, compiled)
  return reportClientLua(context, discovered, compiled)
}

/** gsts lua check：发现入口后做完整类型检查和全部 Lua 规则检查（含原生 .d.ts），不写产物、不注入。 */
export async function checkClientLua(cfgDir: string, cfg: GstsConfig) {
  const rootDir = path.resolve(cfgDir, cfg.compileRoot)
  const context: ClientLuaBuildContext = {
    cfgDir,
    cfg,
    noinject: true,
    complete: true,
    profile: false,
    rootDir,
    timer: createBuildTimer(false),
    report: { active: false, log: console.log }
  }
  const { entries, candidates, additionalFiles, sharedProjectKey } =
    await discoverClientLua(context)
  if (!entries.length) return { entries: 0, hasErrors: false }
  const { compileLua, formatLuaDiagnostics } = await import('../compiler/lua/ts_to_lua_pipeline.js')
  const { diagnostics } = compileLua({
    sharedProjectFiles: candidates,
    sharedProjectKey,
    entries,
    rootDir,
    outDir: path.resolve(cfgDir, cfg.outDir, LUA_OUTPUT_DIRECTORY),
    additionalFiles,
    typeCheck: true,
    sourceMap: false
  })
  const text = formatLuaDiagnostics(diagnostics)
  if (text) console.log(text)
  return {
    entries: entries.length,
    hasErrors: diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error)
  }
}

/** 发现候选及额外文件；缓存只复用确认未改动的文件。 */
async function discoverClientLua({
  cfg,
  rootDir,
  changedFiles,
  session,
  report,
  timer
}: ClientLuaBuildContext) {
  const { mark } = timer
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
  if (reuseFileList) candidates = [...priorDiscovery.candidates.values()].map((item) => item.file)
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
  const classified = new Map<string, DiscoveredFile>()
  // 先只读文本：没有任何文件写到 clientControlScript 时不可能有 Lua 入口，
  // 纯节点图项目就不用逐个解析（大项目能省下上百毫秒）。
  const texts = new Map<string, string>()
  let mayHaveLua = false
  for (const file of candidates) {
    const key = normalize(file)
    const prior = changed && !changed.has(key) ? priorDiscovery?.candidates.get(key) : undefined
    if (prior) {
      classified.set(key, prior)
      if (prior.entry) mayHaveLua = true
      continue
    }
    discoveryReads++
    const text = fs.readFileSync(file, 'utf8')
    texts.set(key, text)
    if (text.includes('clientControlScript')) mayHaveLua = true
  }
  for (const file of candidates) {
    const key = normalize(file)
    const prior = classified.get(key)
    if (prior && (prior.parsed || !mayHaveLua)) continue
    if (!mayHaveLua) {
      classified.set(key, { file, entry: false, graph: false, imports: '', parsed: false })
      continue
    }
    // 之前只做过文本筛查的文件，出现 Lua 入口后要补读、补解析
    let text = texts.get(key)
    if (text === undefined) {
      discoveryReads++
      text = fs.readFileSync(file, 'utf8')
    }
    let entry = false
    let graph = false
    if (text.includes('clientControlScript') || text.includes('genshin-ts/runtime/core')) {
      const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
      entry = !!entryCall(source)
      graph = isNodeGraphEntry(source)
    }
    classified.set(key, {
      file,
      entry,
      graph,
      imports: ts
        .preProcessFile(text, true, true)
        .importedFiles.map((item) => item.fileName)
        .join('\n'),
      parsed: true
    })
  }
  const entries = candidates.filter((file) => classified.get(normalize(file))?.entry)
  report.active = entries.length > 0
  if (session) session.active = report.active
  mark('discover')
  const additionalFiles = reuseFileList
    ? priorDiscovery.additionalFiles
    : cfg.lua?.include?.length
      ? await fg(cfg.lua.include, {
          cwd: rootDir,
          absolute: true,
          onlyFiles: true,
          ignore: ['**/node_modules/**']
        })
      : []
  const graphImports = new Map<string, string>()
  // 节点图依赖在首轮节点图编译后才就绪，首次读取单独统计，不混入入口发现。
  let sharedDependencyReads = 0
  if (entries.length)
    for (const file of session?.graphFiles ?? []) {
      const normalized = normalize(file)
      if (classified.has(normalized) || !fs.existsSync(file) || !file.endsWith('.ts')) continue
      const prior =
        changed && !changed.has(normalized)
          ? priorDiscovery?.graphImports?.get(normalized)
          : undefined
      if (prior !== undefined) graphImports.set(normalized, prior)
      else {
        sharedDependencyReads++
        graphImports.set(
          normalized,
          ts
            .preProcessFile(fs.readFileSync(file, 'utf8'), true, true)
            .importedFiles.map((item) => item.fileName)
            .join('\n')
        )
      }
    }
  const discovery = {
    graphImports,
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
  const sharedProjectKey = entries.length
    ? JSON.stringify([
        [...classified]
          .map(([name, value]) => [name, value.entry, value.graph, value.imports])
          .sort(),
        [...graphImports].sort()
      ])
    : undefined
  return {
    entries,
    candidates,
    additionalFiles,
    discoveryReads,
    sharedDependencyReads,
    reuseFileList,
    discovery,
    sharedProjectKey
  }
}

/** 计划复用、无入口跳过或编译；失败后的会话仍必须重试。 */
function planClientLua(
  {
    cfgDir,
    cfg,
    noinject,
    complete,
    changedFiles,
    session,
    rootDir,
    report
  }: ClientLuaBuildContext,
  discovered: DiscoveredClientLua
) {
  const {
    entries,
    candidates,
    additionalFiles,
    sharedProjectKey,
    discoveryReads,
    sharedDependencyReads,
    reuseFileList
  } = discovered
  const key = JSON.stringify([
    sharedProjectKey,
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
    return {
      kind: 'reused' as const,
      summary: last,
      metrics: {
        skipped: true,
        reason: 'unrelated-change',
        discoveryReads,
        sharedDependencyReads,
        discoveryRescanned: !reuseFileList
      }
    }
  }
  // 失败后下一轮必须重试，不能把上次成功当成本次成功。
  if (session) session.last = undefined
  const outDir = path.resolve(cfgDir, cfg.outDir, LUA_OUTPUT_DIRECTORY)
  const owner = createHash('sha256')
    .update(process.platform === 'win32' ? rootDir.toLowerCase() : rootDir)
    .digest('hex')
    .slice(0, 12)
  if (
    !entries.length &&
    (!complete || !fs.existsSync(path.join(outDir, `.gsts-lua-${owner}.json`)))
  ) {
    const summary = { key, dependencies: [] as string[], entries: [] as string[], candidates }
    if (session) {
      session.last = summary
      session.dependencies = []
      session.graphEntries = []
    }
    return {
      kind: 'empty' as const,
      summary,
      metrics: {
        skipped: true,
        candidates: candidates.length,
        discoveryReads,
        discoveryRescanned: !reuseFileList
      }
    }
  }
  report.active = true
  report.ran = true
  if (session) session.active = true
  return { kind: 'compile' as const, key, last, outDir, owner }
}

/** 只有需要编译时才加载编译器；依赖就绪通知仍可提前放行节点图。 */
async function compilePlannedLua(
  {
    session,
    profile,
    cfg,
    rootDir,
    changedFiles,
    onPrepared,
    report,
    timer
  }: ClientLuaBuildContext,
  discovered: DiscoveredClientLua,
  plan: ClientLuaCompilePlan
) {
  const { entries, candidates, additionalFiles, sharedProjectKey } = discovered
  const { outDir, key, last } = plan
  const { mark } = timer
  const log = report.log
  const writer = await import('../compiler/lua/output/output.js')
  mark('loadCompiler')
  const input = {
    sharedProjectFiles: candidates,
    sharedProjectKey,
    entries,
    rootDir,
    outDir,
    additionalFiles,
    profile,
    typeCheck: cfg.lua?.typeCheck,
    sourceMap: cfg.lua?.sourceMap,
    changedFiles: last?.key === key ? changedFiles : undefined
  }
  const prepared = (value: LuaPrepared) => {
    if (session) {
      session.dependencies = value.dependencies
      session.graphEntries = value.graphEntries
    }
    // 性能探针保留真实发生时机；普通诊断和结果仍在末尾集中显示。
    timer.prepared(value.dependencies.length)
    onPrepared?.(value)
  }
  const compile = async () => {
    if (session?.worker) return session.worker.compile(input, prepared)
    const { compileLua, formatLuaDiagnostics, createLuaCompileCache } = await import(
      '../compiler/lua/ts_to_lua_pipeline.js'
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
  if (result.hasErrors) throw new Error(t('lua_compileFailed'))
  if (session && (!changedFiles || last?.key !== key)) {
    session.localOutput = {}
    session.injectedOutput = {}
  }
  return { plan, result, writer }
}

/** 逐个列出被跳过的文件；注入时（传入注入开始时间）再补一行与节点图注入相同的汇总。没有冲突时不输出。 */
function reportLuaConflicts(
  result: LuaWriteResult,
  describe: (result: LuaWriteResult, injection: boolean) => string,
  log: ClientLuaReport['log'],
  injectionStartedAt?: number
) {
  if (!result.conflicts.length) return
  for (const line of describe(result, injectionStartedAt !== undefined).split('\n'))
    log(uiTags.warn, line)
  if (injectionStartedAt === undefined) return
  const ok = result.written.length + result.unchanged.length + result.removed.length
  log(
    uiTags.info,
    t('injectAllDone', {
      ok,
      skipped: result.conflicts.length,
      fail: 0,
      count: ok + result.conflicts.length,
      ms: (performance.now() - injectionStartedAt).toFixed(3)
    })
  )
}

/** 本地写出后进入注入；两处独立跳过没有授权标记的文件。 */
function writeClientLua(
  { session, complete, report, timer }: ClientLuaBuildContext,
  { plan, result, writer }: CompiledClientLua
) {
  const { outDir, owner } = plan
  const { writeLuaFiles, describeLuaConflicts } = writer
  const { mark } = timer
  const local = writeLuaFiles(outDir, result.files, complete, owner, session?.localOutput)
  reportLuaConflicts(local, describeLuaConflicts, report.log)
  report.local = {
    ...writeSummary(outDir, result.files.size, local),
    entries: result.entries.length
  }
  mark('localWrite')
}

const writeSummary = (dir: string, files: number, result: LuaWriteResult): LuaWriteSummary => ({
  dir,
  files,
  written: result.written.length,
  unchanged: result.unchanged.length,
  removed: result.removed.length,
  skipped: result.conflicts.length
})

/** 注入只复制 Lua 文件，保持既有的标记保护和错误状态。 */
function injectClientLua(
  { cfg, noinject, complete, session, report }: ClientLuaBuildContext,
  { plan, result, writer }: CompiledClientLua
) {
  const { owner } = plan
  const { writeLuaFiles, describeLuaConflicts } = writer
  if (cfg.inject?.mapId !== undefined && !noinject) {
    try {
      const target = resolveGilTarget(cfg.inject)
      const destination = path.join(target.saveLevelDir, String(target.mapId), 'external_lua_file')
      const started = performance.now()
      const files = new Map([...result.files].filter(([name]) => name.endsWith('.lua')))
      const injected = writeLuaFiles(destination, files, complete, owner, session?.injectedOutput)
      reportLuaConflicts(injected, describeLuaConflicts, report.log, started)
      report.injected = writeSummary(destination, files.size, injected)
    } catch (error) {
      throw new Error(
        t('lua_injectionFailed', { arg0: error instanceof Error ? error.message : String(error) }),
        { cause: error }
      )
    }
  }
}

/** 性能信息和会话结果统一在写出/注入之后收尾。 */
function reportClientLua(
  { session, report, timer }: ClientLuaBuildContext,
  discovered: DiscoveredClientLua,
  { plan, result }: CompiledClientLua
) {
  const {
    entries,
    candidates,
    additionalFiles,
    discoveryReads,
    sharedDependencyReads,
    reuseFileList,
    discovery
  } = discovered
  const { key } = plan
  const { mark } = timer
  mark('injectionAndReport')
  timer.report(
    {
      execution: session?.worker ? 'worker' : 'main',
      discoveryReads,
      sharedDependencyReads,
      discoveryRescanned: !reuseFileList,
      candidates: candidates.length,
      entries: entries.length,
      compiler: 'profile' in result ? result.profile : undefined
    },
    report.log
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

/** 写出结果的变化说明，例如“更新 2，删除 1”；什么都没变时为“没有变化”。 */
function describeChanges({ written, removed, skipped }: LuaWriteSummary) {
  const parts = [
    written ? t('lua_changeWritten', { count: written }) : '',
    removed ? t('lua_changeRemoved', { count: removed }) : '',
    skipped ? t('lua_changeSkipped', { count: skipped }) : ''
  ].filter(Boolean)
  return parts.length ? parts.join(t('lua_changeSeparator')) : t('lua_changeNone')
}

/** 依赖分组完成后即可开始节点图编译；两种目标各用自己的类型环境。 */
export function startClientLua({
  cfgDir,
  cfg,
  noinject = false,
  profile = process.env.GSTS_INJECT_PROFILE === '1',
  session,
  changedFiles,
  complete = true
}: Omit<ClientLuaOptions, 'onPrepared' | 'reporting'>) {
  const state = session ?? {}
  state.worker ??= createLuaWorker()
  type Prepared = { dependencies: string[]; excludeFiles: string[] }
  let resolvePrepared!: (value: Prepared) => void
  const prepared = new Promise<Prepared>((resolve) => {
    resolvePrepared = resolve
  })
  let isPrepared = false
  const ready = (dependencies: string[], graphEntries = state.graphEntries ?? []) => {
    if (isPrepared) return
    isPrepared = true
    // Lua 依赖里可能包含节点图入口。保留该入口给节点图编译；Lua 自身会报告错误。
    const keep = new Set(graphEntries.map(normalize))
    const excludeFiles = dependencies.filter((file) => !keep.has(normalize(file)))
    resolvePrepared({ dependencies, excludeFiles })
  }
  const logs: unknown[][] = []
  const report: ClientLuaReport = {
    active: false,
    log: (...values) => logs.push(values)
  }
  const result = buildClientLua({
    cfgDir,
    cfg,
    noinject,
    complete,
    profile,
    session: state,
    changedFiles,
    onPrepared: (value) => ready(value.dependencies, value.graphEntries),
    reporting: report
  })
    .then(
      (result) => {
        ready(result.dependencies)
        return result
      },
      (error) => {
        // Lua 失败也不能阻止节点图。至少排除已识别的 Lua 入口，避免作为 JS 执行。
        ready([
          ...new Set([
            ...(state.dependencies ?? []),
            ...[...(state.discovery?.candidates.values() ?? [])]
              .filter((item) => item.entry)
              .map((item) => item.file)
          ])
        ])
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
    // 编译和写出可以并行；日志和结果行留到节点图输出结束后统一显示。
    async finish(): Promise<LuaOutcome> {
      let failure: string | undefined
      try {
        await result
      } catch (error) {
        process.exitCode = 1
        failure = error instanceof Error ? error.message : String(error)
      }
      for (const values of logs.splice(0)) console.log(...values)
      const { local, injected } = report
      if (local) {
        ui.ok(
          t('lua_compiled', {
            entries: local.entries,
            files: local.files,
            changes: describeChanges(local),
            dir: local.dir
          })
        )
      }
      if (injected) {
        ui.ok(
          t('lua_injected', {
            files: injected.files,
            changes: describeChanges(injected),
            dir: injected.dir
          })
        )
      }
      // 编译错误已经逐条列出，结尾不再重复；写出、注入等失败在这里说明一次。
      const compileFailed = failure === t('lua_compileFailed')
      if (failure && !compileFailed) ui.error(failure)
      return {
        ran: !!report.ran || !!failure,
        ok: !failure,
        files: local?.files ?? 0,
        overwritten: injected?.written,
        skipped: injected?.skipped,
        compileFailed
      }
    }
  }
}
