#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { clearTimeout, setTimeout } from 'node:timers'

import chokidar from 'chokidar'
import { program } from 'commander'
import fg from 'fast-glob'
import ts from 'typescript'

import { existsFile, loadGstsConfig } from '../compiler/config_loader.js'
import {
  emitIrJsonForEntries,
  hasEntryMarker,
  resolveIrOutputPath
} from '../compiler/gs_to_ir_json_transform/index.js'
import type { GstsConfig, GstsInjectConfig } from '../compiler/gsts_config.js'
import { mergeIrJsonFilesByGraphId } from '../compiler/ir_merge.js'
import { writeGiaFromIrJsonFile, writeGiaFromIrJsonFiles } from '../compiler/ir_to_gia_pipeline.js'
import { compileTsToGs } from '../compiler/ts_to_gs_pipeline.js'
import { detectLang, initCliI18n, type Lang } from '../i18n/index.js'
import { createInjector } from '../injector/index.js'
import { resolveGraphIdForGraph } from '../runtime/graph_defaults.js'
import { maybeCheckRemoteMarkdown } from './checks.js'
import { ensureDataDirs } from './data.js'
import {
  assertGilFileUnchanged,
  getGilFileVersion,
  writeFileAtomic
} from './gil_file_transaction.js'
import { resolveGilFolder, resolveGilTarget } from './gil_paths.js'
import { DEFAULT_RESOURCES_PATH, extractCustomResourcesFromGil } from './gil_resources.js'
import { DEFAULT_SIGNALS_PATH, extractSignalsFromGil } from './gil_signals.js'
import {
  createInjectionTaskQueue,
  runInjectionAttempt,
  type InjectionAttemptHooks
} from './injection_lifecycle.js'
import { getMapKey, loadState, saveState } from './state.js'
import { createUi } from './ui.js'
import { openAndSelect, openDir } from './windows_open.js'

type GlobalOptions = {
  config?: string
  noinject?: boolean
  injectProfile?: boolean
  lang?: string
}

type InjectManyParams = {
  giaPaths: string[]
  opts: GlobalOptions
  gilCfg: GstsInjectConfig | undefined
  useConfiguredTargetId: boolean
  lang: string
  t: ReturnType<typeof initCliI18n>['t']
}

type InjectManyResult = {
  ok: number
  skipped: number
  fail: number
  count: number
  totalMs: number
  wroteGil: boolean
}

const ui = createUi()

type MergeResult = { graphId: number; outJsonPath: string; sourceJsonPaths: string[] }

type RunBatchHooks = InjectionAttemptHooks & {
  onPrepared?: (result: { giaPaths: string[]; mergeResults?: MergeResult[] }) => void
}

type CachedConfig = { mtimeMs: number; cfg: GstsConfig }
const configCache = new Map<string, CachedConfig>()

function getGraphIdFromIrDocLike(doc: unknown): number {
  const graph = (doc as { graph?: { id?: unknown; type?: unknown } } | undefined)?.graph
  return resolveGraphIdForGraph(graph)
}

function isMergedJsonFile(p: string): boolean {
  try {
    const raw = JSON.parse(fs.readFileSync(p, 'utf8')) as unknown
    const meta = (raw as { __gsts?: unknown } | undefined)?.__gsts
    return !!meta && typeof meta === 'object' && (meta as { merged?: unknown }).merged === true
  } catch {
    return false
  }
}

function readJsonAsList(absPath: string): unknown[] {
  const raw: unknown = JSON.parse(fs.readFileSync(absPath, 'utf8'))
  return Array.isArray(raw) ? raw : [raw]
}

function computeAllowedDocIndices(list: unknown[], allowGraphIds: Set<number>): number[] {
  return list
    .map((doc, idx) => (allowGraphIds.has(getGraphIdFromIrDocLike(doc)) ? idx : -1))
    .filter((i) => i >= 0)
}

function applyIrToGiaOptimizeEnv(cfg: GstsConfig | undefined) {
  if (!cfg) return
  const enabled = cfg.options?.optimize?.timerDispatchAggregate ?? true
  process.env.GSTS_OPT_TIMER_DISPATCH = enabled ? '1' : '0'
}

/**
 * If allowGraphIds is undefined: emit all docs from the json (single-file mode).
 * If allowGraphIds is a Set: only emit docs whose graphId is in the set (batch/dev mode).
 */
function writeGiaFromOutJson(
  outJson: string,
  allowGraphIds?: Set<number>,
  onWriteGia?: (x: { giaPath: string; graphId: number }) => void
): { giaPath: string; graphId: number }[] {
  const task = planGiaTaskFromOutJson(outJson, allowGraphIds)
  if (!task) return []
  return writeGiaFromIrJsonFile(task.irPath, task.outFile, task.opts, onWriteGia)
}

function planGiaTaskFromOutJson(
  outJson: string,
  allowGraphIds?: Set<number>
): {
  irPath: string
  outFile?: string
  opts?: { includeIndices?: number[]; preserveIndices?: boolean }
} | null {
  if (isMergedJsonFile(outJson)) return { irPath: outJson }

  // allowGraphIds absent => emit all docs (single-file mode)
  if (!allowGraphIds) return { irPath: outJson }

  const list = readJsonAsList(outJson)
  if (list.length <= 1) return { irPath: outJson }

  const idxs = computeAllowedDocIndices(list, allowGraphIds)
  if (!idxs.length) return null

  return { irPath: outJson, opts: { includeIndices: idxs, preserveIndices: true } }
}

function roundMs(value: number): number {
  return Math.round(value * 1000) / 1000
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function injectProfileEnabled(opts: GlobalOptions): boolean {
  return !!opts.injectProfile || process.env.GSTS_INJECT_PROFILE === '1'
}

function injectManyCore(params: InjectManyParams): InjectManyResult {
  const totalStart = performance.now()
  if (params.opts.noinject || !params.gilCfg) {
    return {
      ok: 0,
      skipped: 0,
      fail: 0,
      count: params.giaPaths.length,
      totalMs: 0,
      wroteGil: false
    }
  }
  if (params.giaPaths.length === 0) {
    return {
      ok: 0,
      skipped: 0,
      fail: 0,
      count: 0,
      totalMs: performance.now() - totalStart,
      wroteGil: false
    }
  }

  const resolveStart = performance.now()
  const target = resolveGilTarget(params.gilCfg)
  const resolveTargetMs = performance.now() - resolveStart

  const backupStart = performance.now()
  maybeBackupGil(target.playerId, target.mapId, target.gilPath)
  const backupMs = performance.now() - backupStart

  const prepared: Array<{
    giaPath: string
    giaBytes: Uint8Array
    readGiaMs: number
  }> = []
  const readFailures: Array<{ giaPath: string; error: string; readGiaMs: number }> = []
  let readGiaMs = 0
  let giaBytesTotal = 0
  for (const giaPath of params.giaPaths) {
    const readStart = performance.now()
    try {
      const giaBytes = fs.readFileSync(giaPath)
      const cost = performance.now() - readStart
      readGiaMs += cost
      giaBytesTotal += giaBytes.length
      prepared.push({ giaPath, giaBytes, readGiaMs: cost })
    } catch (error) {
      const cost = performance.now() - readStart
      readGiaMs += cost
      const message = errorText(error)
      readFailures.push({ giaPath, error: message, readGiaMs: cost })
      const msg = message.replace(/^\[error\]\s*/i, '').trim()
      ui.error(params.t('injectFail', { file: path.basename(giaPath), error: msg }))
    }
  }

  if (prepared.length === 0) {
    const totalMs = performance.now() - totalStart
    if (injectProfileEnabled(params.opts)) {
      console.log(
        '[inject-profile]',
        JSON.stringify({
          kind: 'gsts-inject-profile',
          version: 2,
          strategy: 'batch',
          mapFile: path.basename(target.gilPath),
          files: params.giaPaths.length,
          ok: 0,
          skipped: 0,
          fail: readFailures.length,
          timingsMs: {
            resolveTarget: roundMs(resolveTargetMs),
            backup: roundMs(backupMs),
            readGia: roundMs(readGiaMs),
            total: roundMs(totalMs)
          },
          items: readFailures.map((item) => ({
            file: path.basename(item.giaPath),
            status: 'failed',
            error: item.error,
            timingsMs: { readGia: roundMs(item.readGiaMs) }
          }))
        })
      )
    }
    if (readFailures.length > 0) process.exitCode = 1
    return {
      ok: 0,
      skipped: 0,
      fail: readFailures.length,
      count: params.giaPaths.length,
      totalMs,
      wroteGil: false
    }
  }

  const beforeRead = getGilFileVersion(target.gilPath)
  const readGilStart = performance.now()
  const gilBytes = fs.readFileSync(target.gilPath)
  const readGilMs = performance.now() - readGilStart
  const afterRead = assertGilFileUnchanged(
    target.gilPath,
    beforeRead,
    '[error] target gil changed while it was being read; injection aborted'
  )

  const createInjectorStart = performance.now()
  const injector = createInjector({ lang: params.lang })
  const createInjectorMs = performance.now() - createInjectorStart
  const batch = injector.injectManyBytes({
    gilBytes,
    items: prepared.map((item) => ({
      giaBytes: item.giaBytes,
      targetId: params.useConfiguredTargetId ? params.gilCfg?.nodeGraphId : undefined
    })),
    skipNonEmptyCheck: !!params.gilCfg.skipSafeCheck,
    lang: params.lang
  })

  const writeStart = performance.now()
  const wroteGil = batch.stats.replacementCount > 0
  if (wroteGil) {
    assertGilFileUnchanged(
      target.gilPath,
      afterRead,
      '[error] target gil changed during batch injection; write aborted'
    )
    writeFileAtomic(target.gilPath, batch.bytes)
  }
  const writeGilMs = performance.now() - writeStart

  let ok = 0
  let skipped = 0
  let fail = readFailures.length
  const reportItemsStart = performance.now()
  batch.items.forEach((result, index) => {
    const giaPath = prepared[index].giaPath
    if (result.status === 'ok') {
      ok++
      ui.ok(params.t('injectOk', { file: path.basename(giaPath), outPath: target.gilPath }))
      return
    }

    if (result.status === 'skipped') {
      skipped++
      const message = result.message.replace(/^\[error\]\s*/i, '').trim()
      ui.warn(params.t('injectSkip', { file: path.basename(giaPath), reason: message }))
      return
    }

    fail++
    const msg = result.error.replace(/^\[error\]\s*/i, '').trim()
    ui.error(params.t('injectFail', { file: path.basename(giaPath), error: msg }))
  })
  const reportItemsMs = performance.now() - reportItemsStart

  const totalMs = performance.now() - totalStart
  if (injectProfileEnabled(params.opts)) {
    const core = batch.timings
    const profileItems = prepared.map((item, index) => {
      const result = batch.items[index]
      return {
        file: path.basename(item.giaPath),
        bytes: item.giaBytes.length,
        status: result.status,
        targetId: result.targetId,
        ...(result.status === 'failed' ? { error: result.error } : {}),
        ...(result.status === 'skipped' ? { reason: result.reason, message: result.message } : {}),
        timingsMs: {
          readGia: roundMs(item.readGiaMs),
          decodeGia: roundMs(result.timings.decodeGiaMs),
          patchSignalIds: roundMs(result.timings.patchSignalIdsMs),
          validateTarget: roundMs(result.timings.validateTargetMs),
          encodeGraph: roundMs(result.timings.encodeGraphMs),
          coreTotal: roundMs(result.timings.totalMs)
        }
      }
    })
    profileItems.push(
      ...readFailures.map((item) => ({
        file: path.basename(item.giaPath),
        bytes: 0,
        status: 'failed' as const,
        targetId: undefined,
        error: item.error,
        timingsMs: {
          readGia: roundMs(item.readGiaMs),
          decodeGia: 0,
          patchSignalIds: 0,
          validateTarget: 0,
          encodeGraph: 0,
          coreTotal: 0
        }
      }))
    )
    console.log(
      '[inject-profile]',
      JSON.stringify({
        kind: 'gsts-inject-profile',
        version: 2,
        strategy: 'batch',
        mapFile: path.basename(target.gilPath),
        files: params.giaPaths.length,
        ok,
        skipped,
        fail,
        stats: {
          ...batch.stats,
          giaBytes: giaBytesTotal
        },
        timingsMs: {
          resolveTarget: roundMs(resolveTargetMs),
          backup: roundMs(backupMs),
          readGia: roundMs(readGiaMs),
          readGil: roundMs(readGilMs),
          createInjector: roundMs(createInjectorMs),
          parseGil: roundMs(core.parseGilMs),
          indexNodeGraphs: roundMs(core.indexNodeGraphsMs),
          buildSignalMap: roundMs(core.buildSignalMapMs),
          prepareItems: roundMs(core.prepareItemsMs),
          applyReplacements: roundMs(core.applyReplacementsMs),
          buildFile: roundMs(core.buildFileMs),
          writeGil: roundMs(writeGilMs),
          reportItems: roundMs(reportItemsMs),
          coreTotal: roundMs(core.totalMs),
          total: roundMs(totalMs)
        },
        items: profileItems
      })
    )
  }

  if (fail > 0) process.exitCode = 1
  return {
    ok,
    skipped,
    fail,
    count: params.giaPaths.length,
    totalMs,
    wroteGil
  }
}

function injectMany(params: InjectManyParams): InjectManyResult {
  const totalStart = performance.now()
  try {
    return injectManyCore(params)
  } catch (error) {
    process.exitCode = 1
    if (injectProfileEnabled(params.opts)) {
      try {
        console.log(
          '[inject-profile]',
          JSON.stringify({
            kind: 'gsts-inject-profile',
            version: 2,
            strategy: 'batch',
            status: 'failed',
            fatal: true,
            ...(typeof params.gilCfg?.mapId === 'number'
              ? { mapFile: `${params.gilCfg.mapId}.gil` }
              : {}),
            files: params.giaPaths.length,
            error: errorText(error),
            timingsMs: { total: roundMs(performance.now() - totalStart) }
          })
        )
      } catch {
        // Profiling must not replace the original injection error.
      }
    }
    throw error
  }
}

async function runCliChecks(lang: Lang) {
  try {
    await maybeCheckRemoteMarkdown('update', lang)
  } catch (e) {
    ui.warn(`update check failed: ${e instanceof Error ? e.message : String(e)}`)
  }
  try {
    await maybeCheckRemoteMarkdown('notice', lang)
  } catch (e) {
    ui.warn(`notice check failed: ${e instanceof Error ? e.message : String(e)}`)
  }
}

function tryGetMtimeMs(p: string): number | null {
  try {
    return fs.statSync(p).mtimeMs
  } catch {
    return null
  }
}

async function loadGstsConfigCached(cfgPath: string): Promise<GstsConfig> {
  const mtimeMs = tryGetMtimeMs(cfgPath)
  const cached = configCache.get(cfgPath)
  if (cached && mtimeMs != null && cached.mtimeMs === mtimeMs) return cached.cfg
  const cfg = await loadGstsConfig(cfgPath)
  if (mtimeMs != null) configCache.set(cfgPath, { mtimeMs, cfg })
  return cfg
}

function resolveConfigPath(opts: GlobalOptions): string {
  return path.resolve(process.cwd(), opts.config ?? 'gsts.config.ts')
}

function preparseArgv(argv: string[]): { config?: string; lang?: string } {
  const out: { config?: string; lang?: string } = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-c' || a === '--config') out.config = argv[i + 1]
    if (a.startsWith('--config=')) out.config = a.slice('--config='.length)
    if (a === '--lang') out.lang = argv[i + 1]
    if (a.startsWith('--lang=')) out.lang = a.slice('--lang='.length)
  }
  return out
}

type LoadedConfig = { cfgPath: string; cfgDir: string; cfg: GstsConfig }

async function loadConfigOrNull(opts: GlobalOptions): Promise<LoadedConfig | null> {
  const cfgPath = resolveConfigPath(opts)
  if (!existsFile(cfgPath)) return null
  const cfgDir = path.dirname(cfgPath)
  const cfg = await loadGstsConfigCached(cfgPath)
  return { cfgPath, cfgDir, cfg }
}

function isGiaPath(p: string): boolean {
  return /\.gia$/i.test(p)
}

function isJsonPath(p: string): boolean {
  return /\.json$/i.test(p)
}

function isEligibleInputTsFile(p: string): boolean {
  if (!p.endsWith('.ts')) return false
  if (p.endsWith('.d.ts')) return false
  if (p.endsWith('.gs.ts')) return false
  return true
}

async function findEntryOutFiles(outDirAbs: string, compileRoot: string): Promise<string[]> {
  const files = await fg('**/*.gs.ts', {
    cwd: outDirAbs,
    absolute: true,
    onlyFiles: true,
    unique: true,
    followSymbolicLinks: true,
    dot: true,
    ignore: ['**/node_modules/**']
  })
  const out: string[] = []
  for (const file of files) {
    try {
      const rel = path.relative(outDirAbs, file)
      const src = path.resolve(compileRoot, rel.replace(/\.gs\.ts$/i, '.ts'))
      if (!fs.existsSync(src)) continue
      const text = fs.readFileSync(file, 'utf8')
      if (hasEntryMarker(text)) out.push(file)
    } catch {
      // ignore
    }
  }
  return out
}

function toPosixPath(p: string): string {
  return p.replace(/\\/g, '/')
}

function hasGlobMeta(p: string): boolean {
  return /[*?[\]{}]/.test(p)
}

function stripDotSlash(p: string): string {
  return p.startsWith('./') ? p.slice(2) : p
}

function normForMap(p: string): string {
  const abs = path.resolve(p).replace(/\\/g, '/')
  return ts.sys.useCaseSensitiveFileNames ? abs : abs.toLowerCase()
}

function loadTsCompilerOptions(cwd: string): ts.CompilerOptions {
  const configPath = path.resolve(cwd, 'tsconfig.json')
  if (!existsFile(configPath)) {
    return { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext }
  }
  const raw = ts.readConfigFile(configPath, (p) => ts.sys.readFile(p))
  if (raw.error) {
    const msg = ts.flattenDiagnosticMessageText(raw.error.messageText, '\n')
    throw new Error(`[error] tsconfig parse failed: ${msg}`)
  }
  const parsed = ts.parseJsonConfigFileContent(raw.config, ts.sys, cwd)
  if (parsed.errors?.length) {
    const msg = parsed.errors
      .map((e) => ts.flattenDiagnosticMessageText(e.messageText, '\n'))
      .join('\n')
    throw new Error(`[error] tsconfig invalid: ${msg}`)
  }
  return parsed.options
}

function buildEntryPatterns(entries: string[], compileRoot: string): string[] {
  const out: string[] = []
  for (const rawEnt of entries) {
    const ent = toPosixPath(rawEnt)
    const neg = ent.startsWith('!')
    const entNoBang = stripDotSlash(neg ? ent.slice(1) : ent)
    const abs = path.resolve(compileRoot, entNoBang)

    if (!hasGlobMeta(entNoBang)) {
      try {
        if (fs.statSync(abs).isDirectory()) {
          out.push(`${neg ? '!' : ''}${toPosixPath(path.posix.join(entNoBang, '**/*.ts'))}`)
          continue
        }
      } catch {
        // ignore
      }
    }
    out.push(`${neg ? '!' : ''}${entNoBang}`)
  }
  return out
}

async function listAllSourceFiles(compileRoot: string, entries: string[]): Promise<string[]> {
  const patterns = buildEntryPatterns(entries, compileRoot)
  const matched = await fg(patterns, {
    cwd: compileRoot,
    absolute: true,
    onlyFiles: true,
    unique: true,
    followSymbolicLinks: true,
    dot: true,
    ignore: ['**/node_modules/**']
  })
  return matched.filter((abs) => isEligibleInputTsFile(abs)).sort((a, b) => a.localeCompare(b))
}

function collectModuleDeps(fileAbs: string, options: ts.CompilerOptions): Set<string> {
  const text = fs.readFileSync(fileAbs, 'utf8')
  const sf = ts.createSourceFile(fileAbs, text, ts.ScriptTarget.Latest, true)
  const specs: string[] = []

  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)) {
      specs.push(stmt.moduleSpecifier.text)
      continue
    }
    if (ts.isExportDeclaration(stmt) && stmt.moduleSpecifier) {
      if (ts.isStringLiteral(stmt.moduleSpecifier)) specs.push(stmt.moduleSpecifier.text)
    }
  }

  const out = new Set<string>()
  for (const spec of specs) {
    const resolved = ts.resolveModuleName(spec, fileAbs, options, ts.sys).resolvedModule
    if (!resolved || resolved.isExternalLibraryImport) continue
    const target = resolved.resolvedFileName
    if (!isEligibleInputTsFile(target)) continue
    out.add(path.resolve(target))
  }
  return out
}

type DepGraph = {
  depsByFile: Map<string, Set<string>>
  reverseByFile: Map<string, Set<string>>
  absByNorm: Map<string, string>
}

function updateDepsForFile(graph: DepGraph, fileAbs: string, options: ts.CompilerOptions) {
  const norm = normForMap(fileAbs)
  graph.absByNorm.set(norm, fileAbs)
  let deps: Set<string>
  try {
    deps = collectModuleDeps(fileAbs, options)
  } catch {
    deps = new Set()
  }

  const prev = graph.depsByFile.get(norm) ?? new Set<string>()
  for (const depAbs of prev) {
    const depNorm = normForMap(depAbs)
    const rev = graph.reverseByFile.get(depNorm)
    if (rev) {
      rev.delete(norm)
      if (rev.size === 0) graph.reverseByFile.delete(depNorm)
    }
  }

  const next = new Set<string>()
  for (const depAbs of deps) {
    const depNorm = normForMap(depAbs)
    graph.absByNorm.set(depNorm, depAbs)
    next.add(depAbs)
    const rev = graph.reverseByFile.get(depNorm) ?? new Set<string>()
    rev.add(norm)
    graph.reverseByFile.set(depNorm, rev)
  }

  graph.depsByFile.set(norm, next)
}

function removeFileFromDeps(graph: DepGraph, fileAbs: string) {
  const norm = normForMap(fileAbs)
  const prev = graph.depsByFile.get(norm)
  if (prev) {
    for (const depAbs of prev) {
      const depNorm = normForMap(depAbs)
      const rev = graph.reverseByFile.get(depNorm)
      if (rev) {
        rev.delete(norm)
        if (rev.size === 0) graph.reverseByFile.delete(depNorm)
      }
    }
  }
  graph.depsByFile.delete(norm)
  graph.reverseByFile.delete(norm)
  graph.absByNorm.delete(norm)
}

function collectDependents(graph: DepGraph, fileAbs: string): Set<string> {
  const start = normForMap(fileAbs)
  const out = new Set<string>()
  const queue: string[] = [start]
  while (queue.length) {
    const cur = queue.shift()!
    if (out.has(cur)) continue
    out.add(cur)
    const rev = graph.reverseByFile.get(cur)
    if (!rev) continue
    for (const next of rev) queue.push(next)
  }
  return out
}

function entrySourceFromOut(
  outFile: string,
  outDirAbs: string,
  compileRoot: string
): string | null {
  const rel = path.relative(outDirAbs, outFile)
  const src = path.resolve(compileRoot, rel.replace(/\.gs\.ts$/i, '.ts'))
  if (!fs.existsSync(src)) return null
  return src
}

function buildDevWatchGlobs(
  cfgDir: string,
  cfg: GstsConfig
): {
  cwd: string
  watch: string[]
  ignored: string[]
} {
  const compileRoot = path.resolve(cfgDir, cfg.compileRoot)

  const watch: string[] = []
  const ignored: string[] = []

  for (const raw of cfg.entries) {
    const ent = toPosixPath(raw)
    const neg = ent.startsWith('!')
    const entNoBang = stripDotSlash(neg ? ent.slice(1) : ent)

    const abs = path.resolve(compileRoot, entNoBang)
    let relPattern: string
    if (!hasGlobMeta(entNoBang)) {
      try {
        if (fs.statSync(abs).isDirectory()) {
          relPattern = toPosixPath(path.join(entNoBang, '**/*.ts'))
        } else {
          relPattern = toPosixPath(entNoBang)
        }
      } catch {
        relPattern = toPosixPath(entNoBang)
      }
    } else {
      relPattern = toPosixPath(entNoBang)
    }

    if (neg) ignored.push(relPattern)
    else watch.push(relPattern)
  }

  if (!watch.length) {
    watch.push('**/*.ts')
  }

  ignored.push('**/node_modules/**', '**/*.d.ts', '**/*.gs.ts')
  ignored.push(toPosixPath(path.posix.join(stripDotSlash(cfg.outDir), '**')))

  return { cwd: compileRoot, watch, ignored }
}

async function runBatch(opts: GlobalOptions, hooks?: RunBatchHooks) {
  const loaded = await loadConfigOrNull(opts)
  if (!loaded) {
    throw new Error(
      `[error] config not found: ${resolveConfigPath(opts)} (use -c/--config or create gsts.config.ts)`
    )
  }

  const { cfgDir, cfg } = loaded
  const lang = detectLang(opts.lang ?? cfg.lang)
  const { t } = initCliI18n(lang)
  await runCliChecks(lang)
  applyIrToGiaOptimizeEnv(cfg)

  ui.info(t('startCompile'))
  const { entryOutFiles } = await compileTsToGs({
    cfgDir,
    cfg,
    onWriteGs: (outFile) => ui.ok(outFile)
  })

  let outDirAbs: string | undefined
  let lastMergeResults: MergeResult[] | undefined

  const giaAll: string[] = []

  if (entryOutFiles.length) {
    console.log('')
    ui.info(t('startGia'))
    await emitIrJsonForEntries(entryOutFiles, {
      cwd: cfgDir,
      runtimeOptions: {
        precompileExpression: cfg.options?.optimize?.precompileExpression ?? true,
        removeUnusedNodes: cfg.options?.optimize?.removeUnusedNodes ?? true
      }
    })
    outDirAbs = path.resolve(cfgDir, cfg.outDir)
    const irPaths = entryOutFiles.map((gsEntry) => resolveIrOutputPath(gsEntry))

    // 合并：同 graph.id 的 IR 输出合并成一个 JSON（用于更好的 DSL 拆分/工程化）
    const merged = mergeIrJsonFilesByGraphId({ outDirAbs, irJsonPaths: irPaths })
    lastMergeResults = merged.map((m) => ({
      graphId: m.graphId,
      outJsonPath: m.outJsonPath,
      sourceJsonPaths: m.sourceJsonPaths
    }))
    const uniqueJsonPaths = [...new Set(merged.map((m) => m.outJsonPath))]
    uniqueJsonPaths.forEach((p) => ui.ok(p))

    const outJsonToGraphIds = new Map<string, Set<number>>()
    for (const m of merged) {
      const s = outJsonToGraphIds.get(m.outJsonPath) ?? new Set<number>()
      s.add(m.graphId)
      outJsonToGraphIds.set(m.outJsonPath, s)
    }

    const tasks = uniqueJsonPaths
      .map((p) => planGiaTaskFromOutJson(p, outJsonToGraphIds.get(p) ?? new Set<number>()))
      .filter(
        (
          t
        ): t is {
          irPath: string
          outFile?: string
          opts?: { includeIndices?: number[]; preserveIndices?: boolean }
        } => Boolean(t)
      )
    const detailed = await writeGiaFromIrJsonFiles(tasks, {
      cwd: cfgDir,
      onOkLine: (msg) => ui.ok(msg)
    })
    // GIA 输出由 runner 实时打印，这里避免重复输出
    giaAll.push(...detailed.map((x) => x.giaPath))

    ui.info(t('giaAllDone', { count: giaAll.length }))
  }

  hooks?.onPrepared?.({ giaPaths: giaAll, mergeResults: lastMergeResults })

  // 批量模式：忽略 config.inject.nodeGraphId，使用 GIA 内的 graph id 推断
  if (entryOutFiles.length && !opts.noinject && cfg.inject) {
    const stat = runInjectionAttempt(
      () =>
        injectMany({
          giaPaths: giaAll,
          opts,
          gilCfg: cfg.inject,
          useConfiguredTargetId: false,
          lang,
          t
        }),
      hooks
    )
    ui.info(
      t('injectAllDone', {
        ok: stat.ok,
        skipped: stat.skipped,
        fail: stat.fail,
        count: stat.count,
        ms: roundMs(stat.totalMs)
      })
    )
  }

  if (opts.noinject) {
    ui.warn(t('warnNoInject'))
  }

  return {
    cfgDir,
    cfg,
    lang,
    outDirAbs,
    mergeResults: lastMergeResults,
    giaPaths: giaAll
  }
}

async function runDev(opts: GlobalOptions) {
  const loaded = await loadConfigOrNull(opts)
  if (!loaded) {
    throw new Error(
      `[error] config not found: ${resolveConfigPath(opts)} (use -c/--config or create gsts.config.ts)`
    )
  }
  const { cfgDir, cfg } = loaded
  const compileRoot = path.resolve(cfgDir, cfg.compileRoot)
  const outDirAbs = path.resolve(cfgDir, cfg.outDir)
  const lang = detectLang(opts.lang ?? cfg.lang)
  const { t } = initCliI18n(lang)
  applyIrToGiaOptimizeEnv(cfg)

  const lastInjectedGiaPaths = new Set<string>()
  const normalizeGiaPath = (p: string) => path.resolve(p)
  const trackGiaPaths = (paths: string[], mode: 'add' | 'replace' = 'add') => {
    if (mode === 'replace') lastInjectedGiaPaths.clear()
    for (const p of paths) lastInjectedGiaPaths.add(normalizeGiaPath(p))
  }

  // 注入完成后的短暂冷却：用于屏蔽“迟到”的文件变更事件（杀软/IO 抖动等）
  let gilIgnoreUntil = 0
  const markGilIgnoreCooldown = () => {
    gilIgnoreUntil = Date.now() + 800
  }
  // injectMany is synchronous, so Chokidar callbacks run only after this hook settles.
  // Mark only committed writes as self-write cooldowns; failed attempts leave the queued event visible.
  const injectionHooks: InjectionAttemptHooks = {
    onAfterInject: (outcome) => {
      if (outcome.status === 'ok' && outcome.wroteGil) markGilIgnoreCooldown()
      else gilIgnoreUntil = 0
    }
  }

  const injectCfg = cfg.inject
  const reinjectOnMapChange =
    !!injectCfg && !opts.noinject && injectCfg.reinjectOnMapChange !== false
  let gilPath: string | undefined
  if (reinjectOnMapChange) {
    try {
      gilPath = resolveGilTarget(injectCfg).gilPath
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      ui.warn(t('devMapWatchSkip', { error: msg.replace('[error]', '').trim() }))
    }
  }

  ui.ok(`watching ${compileRoot}`)

  const graphIdToSources = new Map<number, string[]>()
  const graphIdToMergedJsonPath = new Map<number, string>()

  const updateMergeCache = (results: MergeResult[] | undefined) => {
    if (!results?.length) return
    for (const r of results) {
      graphIdToSources.set(r.graphId, r.sourceJsonPaths)
      graphIdToMergedJsonPath.set(r.graphId, r.outJsonPath)
    }
  }

  const safeRunBatch = async () => {
    try {
      const res = await runBatch(opts, {
        onPrepared: ({ giaPaths, mergeResults }) => {
          trackGiaPaths(giaPaths, 'replace')
          updateMergeCache(mergeResults)
        },
        ...injectionHooks
      })
      return res
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      ui.error(msg.replace('[error]', '').trim())
      process.exitCode = 1
      return undefined
    }
  }

  let codeChangeTimer: ReturnType<typeof setTimeout> | undefined
  let gilChangeTimer: ReturnType<typeof setTimeout> | undefined

  const reportDevTaskError = (error: unknown) => {
    const msg = error instanceof Error ? error.message : String(error)
    ui.error(msg.replace('[error]', '').trim())
    process.exitCode = 1
  }

  const injectionTasks = createInjectionTaskQueue({
    runCodeChange: () => runChanged(),
    runReinject: () => runReinject(),
    onError: reportDevTaskError
  })

  const triggerCodeChange = () => {
    if (codeChangeTimer) clearTimeout(codeChangeTimer)
    codeChangeTimer = setTimeout(() => {
      void injectionTasks.schedule('code-change')
    }, 150)
  }

  const triggerReinject = () => {
    if (!reinjectOnMapChange || !gilPath) return
    if (gilChangeTimer) clearTimeout(gilChangeTimer)
    gilChangeTimer = setTimeout(() => {
      void injectionTasks.schedule('reinject')
    }, 200)
  }

  const initial = await safeRunBatch()
  if (initial) {
    maybeExtractResources({
      cfgDir,
      injectCfg: initial.cfg.inject,
      opts,
      lang: initial.lang,
      gilPath
    })
  }

  const compilerOptions = loadTsCompilerOptions(cfgDir)
  const depGraph: DepGraph = {
    depsByFile: new Map(),
    reverseByFile: new Map(),
    absByNorm: new Map()
  }
  const allSources = await listAllSourceFiles(compileRoot, cfg.entries)
  allSources.forEach((abs) => updateDepsForFile(depGraph, abs, compilerOptions))

  const entryOutBySource = new Map<string, string>()
  const entrySources = new Set<string>()

  const updateEntryMapping = (entryOutFiles: string[]) => {
    for (const outFile of entryOutFiles) {
      const src = entrySourceFromOut(outFile, outDirAbs, compileRoot)
      if (!src) continue
      const norm = normForMap(src)
      entryOutBySource.set(norm, outFile)
      entrySources.add(norm)
      depGraph.absByNorm.set(norm, src)
    }
  }

  const refreshEntryMapping = async () => {
    const entryOutFiles = await findEntryOutFiles(outDirAbs, compileRoot)
    entryOutBySource.clear()
    entrySources.clear()
    updateEntryMapping(entryOutFiles)
  }

  await refreshEntryMapping()

  const { cwd, watch, ignored } = buildDevWatchGlobs(cfgDir, cfg)
  const changed = new Set<string>()
  const removed = new Set<string>()

  const sourceJsonToGraphIds = new Map<string, Set<number>>()

  const deleteIfExists = (p: string) => {
    try {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p)
        if (p.toLowerCase().endsWith('.gia')) {
          lastInjectedGiaPaths.delete(normalizeGiaPath(p))
        }
      }
    } catch {
      // ignore
    }
  }

  const runChanged = async () => {
    const queuedOutJson = new Map<string, Set<number>>()
    const queueOutJson = (outJson: string, gid: number) => {
      const s = queuedOutJson.get(outJson) ?? new Set<number>()
      s.add(gid)
      queuedOutJson.set(outJson, s)
    }
    const pendingEntryGs = new Set<string>()

    const processEntryOutputs = async (entryOutFiles: string[]) => {
      if (!entryOutFiles.length) return

      console.log('')
      ui.info(t('startGia'))
      await emitIrJsonForEntries(entryOutFiles, {
        cwd: cfgDir,
        runtimeOptions: {
          precompileExpression: cfg.options?.optimize?.precompileExpression ?? true,
          removeUnusedNodes: cfg.options?.optimize?.removeUnusedNodes ?? true
        }
      })

      const graphIds = new Set<number>()
      const sourceJsonPaths: string[] = []
      for (const gs of entryOutFiles) {
        const irPath = resolveIrOutputPath(gs)
        sourceJsonPaths.push(irPath)
        const list = readJsonAsList(irPath)
        for (const doc of list) graphIds.add(getGraphIdFromIrDocLike(doc))
      }
      for (const irPath of sourceJsonPaths) {
        sourceJsonToGraphIds.set(irPath, new Set(graphIds))
      }

      const unionSources = new Set<string>()
      for (const gid of graphIds) {
        const sources = graphIdToSources.get(gid) ?? []
        sources.forEach((p) => unionSources.add(p))
      }
      sourceJsonPaths.forEach((p) => unionSources.add(p))

      const merged = mergeIrJsonFilesByGraphId({ outDirAbs, irJsonPaths: [...unionSources] })
      updateMergeCache(
        merged.map((m) => ({
          graphId: m.graphId,
          outJsonPath: m.outJsonPath,
          sourceJsonPaths: m.sourceJsonPaths
        }))
      )
      for (const gid of graphIds) {
        const outJson =
          graphIdToMergedJsonPath.get(gid) ?? merged.find((m) => m.graphId === gid)?.outJsonPath
        if (!outJson) continue
        queueOutJson(outJson, gid)
      }
    }

    if (removed.size > 20 || changed.size > 20) {
      removed.clear()
      changed.clear()
      await safeRunBatch()
      return
    }

    const removedRels = [...removed]
    removed.clear()

    const rels = [...changed]
    changed.clear()

    for (const rel of removedRels) {
      const abs = path.resolve(compileRoot, rel)
      removeFileFromDeps(depGraph, abs)
      const norm = normForMap(abs)
      entrySources.delete(norm)
      entryOutBySource.delete(norm)
    }

    const changedAbs = rels.map((rel) => path.resolve(compileRoot, rel))
    for (const abs of changedAbs) {
      updateDepsForFile(depGraph, abs, compilerOptions)
    }

    const affectedGraphIdsByRemoval = new Set<number>()
    for (const rel of removedRels) {
      // outDir 下对应的 source IR json 路径（由 gs_to_ir_json_transform 产出）
      const gsOut = path.resolve(outDirAbs, rel.replace(/\.ts$/i, '.gs.ts'))
      const irPath = resolveIrOutputPath(gsOut)

      const graphIds =
        sourceJsonToGraphIds.get(irPath) ??
        new Set<number>(
          [...graphIdToSources.entries()]
            .filter(([, srcs]) => srcs.includes(irPath))
            .map(([gid]) => gid)
        )

      sourceJsonToGraphIds.delete(irPath)

      for (const gid of graphIds) {
        affectedGraphIdsByRemoval.add(gid)
        const prev = graphIdToSources.get(gid) ?? []
        const next = prev.filter((p) => p !== irPath)
        graphIdToSources.set(gid, next)
      }
    }

    // 对删除影响到的 graphId 做增量重建（merge/json/gia/注入）
    // 注意：不要“按 gid 单独 merge 并 update cache”，否则会用子集 sources 覆写其它 gid 的缓存。
    const removalPrevOutByGid = new Map<number, string | undefined>()
    const removalToRebuild = new Set<number>()
    const removalUnionSources = new Set<string>()
    for (const gid of affectedGraphIdsByRemoval) {
      const prevOut = graphIdToMergedJsonPath.get(gid)
      removalPrevOutByGid.set(gid, prevOut)

      const sources = (graphIdToSources.get(gid) ?? []).filter((p) => fs.existsSync(p))
      if (!sources.length) {
        if (prevOut && isMergedJsonFile(prevOut)) {
          deleteIfExists(prevOut)
          deleteIfExists(prevOut.replace(/\.json$/i, '.gia'))
        }
        graphIdToSources.delete(gid)
        graphIdToMergedJsonPath.delete(gid)
        continue
      }
      sources.forEach((p) => removalUnionSources.add(p))
      removalToRebuild.add(gid)
    }
    if (removalUnionSources.size) {
      const merged = mergeIrJsonFilesByGraphId({ outDirAbs, irJsonPaths: [...removalUnionSources] })
      updateMergeCache(
        merged.map((m) => ({
          graphId: m.graphId,
          outJsonPath: m.outJsonPath,
          sourceJsonPaths: m.sourceJsonPaths
        }))
      )
      for (const gid of removalToRebuild) {
        const prevOut = removalPrevOutByGid.get(gid)
        const outJson =
          graphIdToMergedJsonPath.get(gid) ?? merged.find((m) => m.graphId === gid)?.outJsonPath
        if (!outJson) continue

        // 若之前是合并文件，但这次变成“单源文件”，可以删除旧合并文件避免堆积
        if (prevOut && prevOut !== outJson && isMergedJsonFile(prevOut)) {
          deleteIfExists(prevOut)
          deleteIfExists(prevOut.replace(/\.json$/i, '.gia'))
        }

        queueOutJson(outJson, gid)
      }
    }

    const impactedEntryNorms = new Set<string>()
    for (const abs of changedAbs) {
      const dependents = collectDependents(depGraph, abs)
      for (const dep of dependents) {
        if (entrySources.has(dep)) impactedEntryNorms.add(dep)
      }
    }

    const changedRelSet = new Set(rels)
    const impactedEntryRels = [...impactedEntryNorms]
      .map((norm) => depGraph.absByNorm.get(norm))
      .filter((abs): abs is string => !!abs)
      .map((abs) => path.relative(compileRoot, abs).replace(/\\/g, '/'))
      .filter((rel) => rel && !changedRelSet.has(rel))

    if (rels.length) {
      ui.info(t('startCompile'))
      const { entryOutFiles } = await compileTsToGs({
        cfgDir,
        cfg,
        emitEntries: rels,
        programEntries: cfg.entries,
        onWriteGs: (p) => ui.ok(p)
      })
      updateEntryMapping(entryOutFiles)
      entryOutFiles.forEach((p) => pendingEntryGs.add(p))
    }

    if (impactedEntryRels.length) {
      ui.info(t('startCompile'))
      const { entryOutFiles } = await compileTsToGs({
        cfgDir,
        cfg,
        emitEntries: impactedEntryRels,
        programEntries: cfg.entries,
        onWriteGs: (p) => ui.ok(p)
      })
      updateEntryMapping(entryOutFiles)
      entryOutFiles.forEach((p) => pendingEntryGs.add(p))
    }

    await processEntryOutputs([...pendingEntryGs].filter((p) => fs.existsSync(p)))

    const entries = [...queuedOutJson.entries()]
    const tasks = entries
      .map(([outJson, gids]) => planGiaTaskFromOutJson(outJson, gids))
      .filter(
        (
          t
        ): t is {
          irPath: string
          outFile?: string
          opts?: { includeIndices?: number[]; preserveIndices?: boolean }
        } => Boolean(t)
      )

    let all: { irPath: string; giaPath: string; graphId: number }[] = []
    if (tasks.length) {
      try {
        all = await writeGiaFromIrJsonFiles(tasks, {
          cwd: cfgDir,
          onOkLine: (msg) => ui.ok(msg)
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        ui.error(msg.replace('[error]', '').trim())
        all = []
      }
    }
    if (all.length) {
      trackGiaPaths(all.map((x) => x.giaPath))
    }

    for (const [outJson] of entries) {
      ui.ok(outJson)
      // GIA 输出由 runner 实时打印，这里避免重复输出
    }

    if (all.length && !opts.noinject && cfg.inject) {
      const stat = runInjectionAttempt(
        () =>
          injectMany({
            giaPaths: all.map((x) => x.giaPath),
            opts,
            gilCfg: cfg.inject,
            useConfiguredTargetId: false,
            lang,
            t
          }),
        injectionHooks
      )
      ui.info(
        t('injectAllDone', {
          ok: stat.ok,
          skipped: stat.skipped,
          fail: stat.fail,
          count: stat.count,
          ms: roundMs(stat.totalMs)
        })
      )
    }
  }

  async function runReinject() {
    if (!reinjectOnMapChange || !gilPath || !cfg.inject) return

    const tracked = [...lastInjectedGiaPaths]
    if (!tracked.length) {
      ui.warn(t('devReinjectNoGia'))
      return
    }

    const missing = tracked.filter((p) => !fs.existsSync(p))
    if (missing.length) {
      ui.warn(t('devReinjectMissingGia', { count: missing.length }))
      const res = await safeRunBatch()
      if (res) {
        maybeExtractResources({
          cfgDir,
          injectCfg: res.cfg.inject,
          opts,
          lang: res.lang,
          gilPath,
          reason: 'map-change'
        })
      }
      return
    }

    if (!fs.existsSync(gilPath)) {
      ui.warn(t('devMapMissing', { path: gilPath }))
      return
    }

    ui.info(t('devMapChanged'))
    const stat = runInjectionAttempt(
      () =>
        injectMany({
          giaPaths: tracked,
          opts,
          gilCfg: cfg.inject,
          useConfiguredTargetId: false,
          lang,
          t
        }),
      injectionHooks
    )
    ui.info(
      t('injectAllDone', {
        ok: stat.ok,
        skipped: stat.skipped,
        fail: stat.fail,
        count: stat.count,
        ms: roundMs(stat.totalMs)
      })
    )
    maybeExtractResources({
      cfgDir,
      injectCfg: cfg.inject,
      opts,
      lang,
      gilPath,
      reason: 'map-change'
    })
  }

  const onGilChange = () => {
    if (!reinjectOnMapChange || !gilPath) return
    if (Date.now() < gilIgnoreUntil) return
    triggerReinject()
  }

  // eslint-disable-next-line
  chokidar
    // eslint-disable-next-line
    .watch(watch, {
      cwd,
      ignoreInitial: true,
      ignored
    })
    // eslint-disable-next-line
    .on('add', (p: string) => {
      changed.add(p)
      triggerCodeChange()
    })
    // eslint-disable-next-line
    .on('change', (p: string) => {
      changed.add(p)
      triggerCodeChange()
    })
    // eslint-disable-next-line
    .on('unlink', (p: string) => {
      removed.add(p)
      triggerCodeChange()
    })
    // eslint-disable-next-line
    .on('error', (err: unknown) => {
      ui.error(`watch error: ${err instanceof Error ? err.message : String(err)}`)
    })

  if (reinjectOnMapChange && gilPath) {
    // eslint-disable-next-line
    chokidar
      // eslint-disable-next-line
      .watch(gilPath, {
        ignoreInitial: true,
        awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 }
      })
      // eslint-disable-next-line
      .on('add', onGilChange)
      // eslint-disable-next-line
      .on('change', onGilChange)
      // eslint-disable-next-line
      .on('unlink', onGilChange)
      // eslint-disable-next-line
      .on('error', (err: unknown) => {
        ui.error(`map watch error: ${err instanceof Error ? err.message : String(err)}`)
      })
  }

  // keep alive
  await new Promise<void>(() => {})
}

async function runMaps(opts: GlobalOptions) {
  const loaded = await loadConfigOrNull(opts)
  const gil: GstsInjectConfig = loaded?.cfg.inject ?? {}
  const resolve = resolveGilFolder as unknown as (cfg: GstsInjectConfig) => { saveLevelDir: string }
  const resolved = resolve(gil)

  const files = fs
    .readdirSync(resolved.saveLevelDir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.gil'))
    .map((d) => {
      const full = path.join(resolved.saveLevelDir, d.name)
      const st = fs.statSync(full)
      return { name: d.name, full, mtimeMs: st.mtimeMs }
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)

  ui.ok(`maps: ${resolved.saveLevelDir}`)
  const now = Date.now()
  files.forEach((f) => {
    const recent = now - f.mtimeMs <= 30 * 60 * 1000
    const prefix = recent ? ui.highlight('[recent]') : '        '
    const time = new Date(f.mtimeMs).toLocaleString()
    const id = f.name.replace(/\.gil$/i, '')
    console.log(`${prefix} ${id}  ${time}`)
  })
}

async function runOpen(target: string | undefined, opts: GlobalOptions) {
  if (!target) throw new Error('[error] missing target (map|backup|data)')
  const { dataDir, backupsDir } = ensureDataDirs()
  if (target === 'data') {
    openDir(dataDir)
    ui.ok(`opened ${dataDir}`)
    return
  }
  if (target === 'backup') {
    openDir(backupsDir)
    ui.ok(`opened ${backupsDir}`)
    return
  }
  if (target === 'map') {
    const loaded = await loadConfigOrNull(opts)
    const inject = loaded?.cfg.inject
    if (!inject) throw new Error('[error] inject is not configured (set config.inject)')
    const resolved = resolveGilTarget(inject)
    openAndSelect(resolved.gilPath)
    ui.ok(`opened ${resolved.saveLevelDir}`)
    return
  }
  throw new Error('[error] invalid target (map|backup|data)')
}

function maybeBackupGil(playerId: number, mapId: number, gilPath: string) {
  const { backupsDir } = ensureDataDirs()
  const state = loadState()
  const key = getMapKey(playerId, mapId)
  const last = state.lastBackupAtByMap?.[key] ?? 0
  const now = Date.now()
  if (now - last <= 5 * 60 * 1000) return

  const stamp = String(now)
  const mapBackupDir = path.join(backupsDir, String(playerId), String(mapId))
  fs.mkdirSync(mapBackupDir, { recursive: true })
  const backupPath = path.join(mapBackupDir, `${stamp}.gil`)
  fs.copyFileSync(gilPath, backupPath)

  // 每个地图（key）最多保留 200 个备份：按时间从新到旧排序，保留前 200 个，删除第 201 个及更旧的
  const backups = fs
    .readdirSync(mapBackupDir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.gil'))
    .map((d) => {
      const full = path.join(mapBackupDir, d.name)
      const st = fs.statSync(full)
      return { full, mtimeMs: st.mtimeMs }
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)

  const toDelete = backups.slice(200)
  for (const b of toDelete) {
    try {
      fs.unlinkSync(b.full)
    } catch {
      // ignore
    }
  }

  const next = {
    ...state,
    lastBackupAtByMap: {
      ...(state.lastBackupAtByMap ?? {}),
      [key]: now
    }
  }
  saveState(next)
}

function resolveResourcesPath(cfgDir: string, injectCfg: GstsInjectConfig): string {
  const raw = injectCfg.resourcesPath ?? DEFAULT_RESOURCES_PATH
  return path.isAbsolute(raw) ? raw : path.resolve(cfgDir, raw)
}

function resolveSignalsPath(cfgDir: string, injectCfg: GstsInjectConfig): string {
  const raw = injectCfg.signalsPath ?? DEFAULT_SIGNALS_PATH
  return path.isAbsolute(raw) ? raw : path.resolve(cfgDir, raw)
}

function maybeExtractResources(params: {
  cfgDir: string
  injectCfg: GstsInjectConfig | undefined
  opts: GlobalOptions
  lang: string | undefined
  gilPath?: string
  reason?: 'map-change'
}) {
  const { injectCfg, opts, lang } = params
  if (!injectCfg || opts.noinject) return

  const shouldExtractResources = injectCfg.extractResources !== false
  const shouldExtractSignals = injectCfg.extractSignals !== false
  if (!shouldExtractResources && !shouldExtractSignals) return

  const { t } = initCliI18n(detectLang(lang ?? opts.lang))

  let gilPath = params.gilPath
  if (!gilPath) {
    try {
      gilPath = resolveGilTarget(injectCfg).gilPath
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const error = msg.replace('[error]', '').trim()
      if (shouldExtractResources) ui.warn(t('extractResourcesFail', { error }))
      if (shouldExtractSignals) ui.warn(t('extractSignalsFail', { error }))
      return
    }
  }

  if (params.reason === 'map-change') {
    ui.info(t('devResourcesReextract'))
  }

  if (shouldExtractResources) {
    const outPath = resolveResourcesPath(params.cfgDir, injectCfg)
    const result = extractCustomResourcesFromGil({ gilPath, outPath, lang })
    if (result.status === 'ok') {
      ui.ok(t('extractResourcesOk', { path: result.outPath, count: result.count }))
    } else if (result.status === 'skipped-existing') {
      ui.warn(t('extractResourcesSkipExisting', { path: result.outPath }))
    } else {
      ui.warn(t('extractResourcesFail', { error: result.error }))
    }
  }

  if (shouldExtractSignals) {
    const outPath = resolveSignalsPath(params.cfgDir, injectCfg)
    const result = extractSignalsFromGil({ gilPath, outPath })
    if (result.status === 'ok') {
      ui.ok(t('extractSignalsOk', { path: result.outPath, count: result.count }))
    } else if (result.status === 'skipped-existing') {
      ui.warn(t('extractSignalsSkipExisting', { path: result.outPath }))
    } else {
      ui.warn(t('extractSignalsFail', { error: result.error }))
    }
  }
}

function maybeInjectGias(
  giaPaths: string[],
  opts: GlobalOptions,
  gilCfg: GstsInjectConfig | undefined,
  useConfiguredTargetId: boolean,
  resolvedLang: string | undefined
) {
  if (opts.noinject) return
  if (!gilCfg) return

  const { t } = initCliI18n(detectLang(resolvedLang ?? opts.lang))
  const stat = injectMany({
    giaPaths,
    opts,
    gilCfg,
    useConfiguredTargetId,
    lang: resolvedLang ?? detectLang(opts.lang),
    t
  })
  ui.info(
    t('injectAllDone', {
      ok: stat.ok,
      skipped: stat.skipped,
      fail: stat.fail,
      count: stat.count,
      ms: roundMs(stat.totalMs)
    })
  )
  return stat
}

async function runSingle(file: string, opts: GlobalOptions) {
  const abs = path.resolve(process.cwd(), file)
  if (!existsFile(abs)) throw new Error(`[error] file not found: ${abs}`)

  const loadedForChecks = await loadConfigOrNull(opts)
  const lang = detectLang(opts.lang ?? loadedForChecks?.cfg.lang)
  const { t } = initCliI18n(lang)
  await runCliChecks(lang)
  applyIrToGiaOptimizeEnv(loadedForChecks?.cfg)
  const injectCfg = loadedForChecks?.cfg.inject

  if (isGiaPath(abs)) {
    // 单文件模式：允许使用 config.inject.nodeGraphId 覆盖目标 id
    maybeInjectGias([abs], opts, injectCfg, true, lang)
    return
  }

  if (isJsonPath(abs)) {
    ui.info(t('startGia'))
    const out = writeGiaFromOutJson(abs, undefined, (x) => ui.ok(`${x.giaPath} (id=${x.graphId})`))
    // 单文件模式：允许使用 config.inject.nodeGraphId 覆盖目标 id
    maybeInjectGias(
      out.map((x) => x.giaPath),
      opts,
      injectCfg,
      true,
      lang
    )
    return
  }

  const text = fs.readFileSync(abs, 'utf8')
  try {
    JSON.parse(text)
    ui.info(t('startGia'))
    const out = writeGiaFromOutJson(abs, undefined, (x) => ui.ok(`${x.giaPath} (id=${x.graphId})`))
    // 单文件模式：允许使用 config.inject.nodeGraphId 覆盖目标 id
    maybeInjectGias(
      out.map((x) => x.giaPath),
      opts,
      injectCfg,
      true,
      lang
    )
    return
  } catch {
    // not json
  }

  const loaded = loadedForChecks
  const cfgDir = loaded?.cfgDir ?? path.dirname(abs)
  const cfg = loaded?.cfg ?? {
    compileRoot: '.',
    entries: [path.basename(abs)],
    outDir: '.'
  }

  // 单文件：复用批量编译函数（通过 entries 仅匹配该文件路径）
  const singleCfg = (() => {
    if (!loaded) return cfg
    const compileRoot = path.resolve(cfgDir, cfg.compileRoot)
    const rel = path.relative(compileRoot, abs).replace(/\\/g, '/')
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      throw new Error(
        `[error] file is outside compileRoot: ${abs} (compileRoot=${compileRoot}) (try use -c or adjust compileRoot)`
      )
    }
    return { ...cfg, entries: [rel] }
  })()
  ui.info(t('startCompile'))
  const { entryOutFiles } = await compileTsToGs({
    cfgDir,
    cfg: singleCfg,
    onWriteGs: (p) => ui.ok(p)
  })

  const gsFile = entryOutFiles[0]
  if (!gsFile) {
    ui.warn(t('warnNotEntry'))
    return
  }

  console.log('')
  ui.info(t('startGia'))
  await emitIrJsonForEntries([gsFile], {
    cwd: cfgDir,
    runtimeOptions: {
      precompileExpression: singleCfg.options?.optimize?.precompileExpression ?? true,
      removeUnusedNodes: singleCfg.options?.optimize?.removeUnusedNodes ?? true
    }
  })
  const irPath = resolveIrOutputPath(gsFile)
  const giaOut = writeGiaFromOutJson(irPath, undefined, (x) =>
    ui.ok(`${x.giaPath} (id=${x.graphId})`)
  )
  // 单文件模式：允许使用 config.inject.nodeGraphId 覆盖目标 id
  maybeInjectGias(
    giaOut.map((x) => x.giaPath),
    opts,
    injectCfg,
    true,
    lang
  )
}

async function main() {
  const pre = preparseArgv(process.argv.slice(2))
  const preLoaded = await loadConfigOrNull({ config: pre.config, lang: pre.lang })
  const lang = detectLang(pre.lang ?? (preLoaded && !pre.lang ? preLoaded.cfg.lang : undefined))
  const { t } = initCliI18n(lang)

  program
    .name('gsts')
    .description(t('desc'))
    .option('-c, --config <file>', t('optConfig'))
    .option('--noinject', t('optNoInject'))
    .option('--inject-profile', t('optInjectProfile'))
    .option('--lang <lang>', t('optLang'))
    .argument('[file]', t('argFile'))
    .showHelpAfterError(t('helpAfterError'))
    .action(async (file: string | undefined) => {
      const opts = program.opts<GlobalOptions>()
      if (file) await runSingle(file, opts)
      else {
        const res = await runBatch(opts)
        maybeExtractResources({
          cfgDir: res.cfgDir,
          injectCfg: res.cfg.inject,
          opts,
          lang: res.lang
        })
      }
    })

  program
    .command('dev')
    .description(t('cmdDev'))
    .action(async () => {
      const opts = program.opts<GlobalOptions>()
      await runDev(opts)
    })

  program
    .command('maps')
    .description(t('cmdMaps'))
    .action(async () => {
      const opts = program.opts<GlobalOptions>()
      await runMaps(opts)
    })

  program
    .command('open')
    .description(t('openDesc'))
    .argument('[target]', t('openArg'))
    .action(async (target: string | undefined) => {
      const opts = program.opts<GlobalOptions>()
      await runOpen(target, opts)
    })

  program
    .command('help')
    .description(t('cmdHelp'))
    .action(() => {
      program.help()
    })

  await program.parseAsync()
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err)
  ui.error(msg.replace('[error]', '').trim())
  process.exitCode = 1
})
