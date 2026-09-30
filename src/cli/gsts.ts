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
  resolveIrOutputPath,
  type GsToIrBatchProfile
} from '../compiler/gs_to_ir_json_transform/index.js'
import type { GstsConfig, GstsInjectConfig } from '../compiler/gsts_config.js'
import { mergeIrJsonFilesByGraphIdAsync } from '../compiler/ir_merge.js'
import {
  writeGiaFromIrJsonFile,
  writeGiaFromIrJsonFiles,
  type IrToGiaBatchProfile
} from '../compiler/ir_to_gia_pipeline.js'
import {
  compileTsToGs,
  createTsToGsProgramCache,
  invalidateTsToGsProgramCache,
  type TsToGsCompileProfile,
  type TsToGsProgramCache
} from '../compiler/ts_to_gs_pipeline.js'
import { detectLang, initCliI18n, type Lang } from '../i18n/index.js'
import { createInjector } from '../injector/index.js'
import type { ParsedGilPayload } from '../injector/types.js'
import { resolveGraphIdForGraph } from '../runtime/graph_defaults.js'
import { maybeCheckRemoteMarkdown } from './checks.js'
import { ensureDataDirs } from './data.js'
import { extractGilArtifacts } from './gil_artifacts.js'
import {
  assertGilFileUnchanged,
  getGilFileVersion,
  writeFileAtomic
} from './gil_file_transaction.js'
import { listGilFiles, resolveGilFolder, resolveGilTarget } from './gil_paths.js'
import { DEFAULT_RESOURCES_PATH } from './gil_resources.js'
import { DEFAULT_SIGNALS_PATH } from './gil_signals.js'
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

type GiaInjectionItem = { giaPath: string; targetId?: number }

type InjectManyParams = {
  giaItems: GiaInjectionItem[]
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
  parsedGil?: ParsedGilCache
}

const ui = createUi()

type MergeResult = {
  graphId: number
  outJsonPath: string
  sourceJsonPaths: string[]
  sourceIndex: number | null
  mergedOutput: boolean
}

type GiaGenerationTask = {
  irPath: string
  outFile?: string
  opts?: { includeIndices?: number[]; preserveIndices?: boolean }
}

type RunBatchHooks = InjectionAttemptHooks & {
  programCache?: TsToGsProgramCache
  invalidatedFiles?: Iterable<string>
  onPrepared?: (result: {
    giaPaths: string[]
    giaItems: GiaInjectionItem[]
    mergeResults?: MergeResult[]
  }) => void
}

type ParsedGilCache = {
  gilPath: string
  parsed: ParsedGilPayload
}

type CliChecksProfile = {
  timingsMs: {
    update: number
    notice: number
    total: number
  }
}

type RunBatchProfile = {
  stats: {
    sourceFiles: number
    entryFiles: number
    jsonFiles: number
    giaFiles: number
  }
  timingsMs: {
    loadConfig: number
    checks: number
    compile: number
    emitIr: number
    mergeIr: number
    reportJson: number
    planGia: number
    generateGia: number
    inject: number
    total: number
  }
  checks?: CliChecksProfile
  compile?: TsToGsCompileProfile
  gsToIr?: GsToIrBatchProfile
  irToGia?: IrToGiaBatchProfile
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
): GiaGenerationTask | null {
  if (isMergedJsonFile(outJson)) return { irPath: outJson }

  // allowGraphIds absent => emit all docs (single-file mode)
  if (!allowGraphIds) return { irPath: outJson }

  const list = readJsonAsList(outJson)
  if (list.length <= 1) return { irPath: outJson }

  const idxs = computeAllowedDocIndices(list, allowGraphIds)
  if (!idxs.length) return null

  return { irPath: outJson, opts: { includeIndices: idxs, preserveIndices: true } }
}

function planGiaTasksFromMergeResults(results: MergeResult[]): GiaGenerationTask[] {
  const byPath = new Map<string, { mergedOutput: boolean; sourceIndices: Set<number> }>()
  for (const result of results) {
    const current = byPath.get(result.outJsonPath) ?? {
      mergedOutput: result.mergedOutput,
      sourceIndices: new Set<number>()
    }
    if (result.sourceIndex !== null) current.sourceIndices.add(result.sourceIndex)
    byPath.set(result.outJsonPath, current)
  }

  return [...byPath].map(([irPath, metadata]) =>
    metadata.mergedOutput
      ? { irPath }
      : {
          irPath,
          opts: {
            includeIndices: [...metadata.sourceIndices].sort((a, b) => a - b),
            preserveIndices: true
          }
        }
  )
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
      count: params.giaItems.length,
      totalMs: 0,
      wroteGil: false
    }
  }
  if (params.giaItems.length === 0) {
    return {
      ok: 0,
      skipped: 0,
      fail: 0,
      count: 0,
      totalMs: performance.now() - totalStart,
      wroteGil: false
    }
  }

  ui.info(params.t('startInject'))

  const resolveStart = performance.now()
  const target = resolveGilTarget(params.gilCfg)
  const resolveTargetMs = performance.now() - resolveStart

  const backupStart = performance.now()
  maybeBackupGil(target.playerId, target.mapId, target.gilPath)
  const backupMs = performance.now() - backupStart

  const prepared: Array<{
    giaPath: string
    targetId?: number
    giaBytes: Uint8Array
    readGiaMs: number
  }> = []
  const readFailures: Array<{ giaPath: string; error: string; readGiaMs: number }> = []
  let readGiaMs = 0
  let giaBytesTotal = 0
  for (const item of params.giaItems) {
    const { giaPath } = item
    const readStart = performance.now()
    try {
      const giaBytes = fs.readFileSync(giaPath)
      const cost = performance.now() - readStart
      readGiaMs += cost
      giaBytesTotal += giaBytes.length
      prepared.push({ giaPath, targetId: item.targetId, giaBytes, readGiaMs: cost })
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
          files: params.giaItems.length,
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
      count: params.giaItems.length,
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
    items: prepared.map((item) => {
      const configuredTargetId = params.useConfiguredTargetId
        ? params.gilCfg?.nodeGraphId
        : undefined
      const targetId = configuredTargetId ?? item.targetId
      return {
        giaBytes: item.giaBytes,
        targetId,
        prevalidateTarget: configuredTargetId === undefined && item.targetId !== undefined
      }
    }),
    skipNonEmptyCheck: !!params.gilCfg.skipSafeCheck,
    lang: params.lang
  })

  const writeStart = performance.now()
  const wroteGil = batch.stats.replacementCount > 0 && !gilBytes.equals(batch.bytes)
  assertGilFileUnchanged(
    target.gilPath,
    afterRead,
    '[error] target gil changed during batch injection; write aborted'
  )
  if (wroteGil) {
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
        files: params.giaItems.length,
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
    count: params.giaItems.length,
    totalMs,
    wroteGil,
    parsedGil: { gilPath: target.gilPath, parsed: batch.parsed }
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
            files: params.giaItems.length,
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

async function runCliChecks(lang: Lang, profile = false): Promise<CliChecksProfile | undefined> {
  const totalStart = profile ? performance.now() : 0
  const updateStart = profile ? performance.now() : 0
  try {
    await maybeCheckRemoteMarkdown('update', lang)
  } catch (e) {
    ui.warn(`update check failed: ${e instanceof Error ? e.message : String(e)}`)
  }
  const updateMs = profile ? performance.now() - updateStart : 0
  const noticeStart = profile ? performance.now() : 0
  try {
    await maybeCheckRemoteMarkdown('notice', lang)
  } catch (e) {
    ui.warn(`notice check failed: ${e instanceof Error ? e.message : String(e)}`)
  }
  if (!profile) return
  return {
    timingsMs: {
      update: updateMs,
      notice: performance.now() - noticeStart,
      total: performance.now() - totalStart
    }
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

async function findGeneratedGsFiles(outDirAbs: string, compileRoot: string): Promise<string[]> {
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
      out.push(file)
    } catch {
      // ignore
    }
  }
  return out.sort((a, b) => a.localeCompare(b))
}

async function findEntryOutFiles(outDirAbs: string, compileRoot: string): Promise<string[]> {
  const files = await findGeneratedGsFiles(outDirAbs, compileRoot)
  return files.filter((file) => {
    try {
      return hasEntryMarker(fs.readFileSync(file, 'utf8'))
    } catch {
      return false
    }
  })
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

  const visit = (node: ts.Node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !node.importClause?.isTypeOnly &&
      !(
        !node.importClause?.name &&
        node.importClause?.namedBindings &&
        ts.isNamedImports(node.importClause.namedBindings) &&
        node.importClause.namedBindings.elements.length > 0 &&
        node.importClause.namedBindings.elements.every((element) => element.isTypeOnly)
      )
    ) {
      specs.push(node.moduleSpecifier.text)
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !node.isTypeOnly &&
      !(
        node.exportClause &&
        ts.isNamedExports(node.exportClause) &&
        node.exportClause.elements.length > 0 &&
        node.exportClause.elements.every((element) => element.isTypeOnly)
      )
    ) {
      specs.push(node.moduleSpecifier.text)
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specs.push(node.arguments[0].text)
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)

  const out = new Set<string>()
  for (const spec of specs) {
    const resolved = ts.resolveModuleName(spec, fileAbs, options, ts.sys).resolvedModule
    if (!resolved || resolved.isExternalLibraryImport || resolved.packageId) continue
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
  const profiling = injectProfileEnabled(opts)
  const totalStart = profiling ? performance.now() : 0
  const loadConfigStart = profiling ? performance.now() : 0
  const loaded = await loadConfigOrNull(opts)
  const loadConfigMs = profiling ? performance.now() - loadConfigStart : 0
  if (!loaded) {
    throw new Error(
      `[error] config not found: ${resolveConfigPath(opts)} (use -c/--config or create gsts.config.ts)`
    )
  }

  const { cfgDir, cfg } = loaded
  const lang = detectLang(opts.lang ?? cfg.lang)
  const { t } = initCliI18n(lang)
  const checksStart = profiling ? performance.now() : 0
  const checksProfile = await runCliChecks(lang, profiling)
  const checksMs = profiling ? performance.now() - checksStart : 0
  applyIrToGiaOptimizeEnv(cfg)

  ui.info(t('startCompile'))
  const compileStart = profiling ? performance.now() : 0
  const compileResult = await compileTsToGs({
    cfgDir,
    cfg,
    profile: profiling,
    programCache: hooks?.programCache,
    invalidatedFiles: hooks?.invalidatedFiles,
    onWriteGs: (outFile) => ui.ok(outFile)
  })
  const compileMs = profiling ? performance.now() - compileStart : 0
  const { entryOutFiles } = compileResult

  let outDirAbs: string | undefined
  let lastMergeResults: MergeResult[] | undefined
  let gsToIrProfile: GsToIrBatchProfile | undefined
  let irToGiaProfile: IrToGiaBatchProfile | undefined
  let emitIrMs = 0
  let mergeIrMs = 0
  let reportJsonMs = 0
  let planGiaMs = 0
  let generateGiaMs = 0
  let jsonFileCount = 0

  const giaAll: GiaInjectionItem[] = []
  let parsedGil: ParsedGilCache | undefined

  if (entryOutFiles.length) {
    console.log('')
    ui.info(t('startGia'))
    const emitIrStart = profiling ? performance.now() : 0
    await emitIrJsonForEntries(entryOutFiles, {
      cwd: cfgDir,
      lang,
      moduleFiles: compileResult.moduleOutFiles,
      moduleRoot: compileResult.outDir,
      profile: profiling,
      onProfile: (profile) => (gsToIrProfile = profile),
      runtimeOptions: {
        precompileExpression: cfg.options?.optimize?.precompileExpression ?? true,
        removeUnusedNodes: cfg.options?.optimize?.removeUnusedNodes ?? true
      }
    })
    emitIrMs = profiling ? performance.now() - emitIrStart : 0
    outDirAbs = path.resolve(cfgDir, cfg.outDir)
    const irPaths = entryOutFiles.map((gsEntry) => resolveIrOutputPath(gsEntry))

    // 合并：同 graph.id 的 IR 输出合并成一个 JSON（用于更好的 DSL 拆分/工程化）
    const mergeIrStart = profiling ? performance.now() : 0
    const merged = await mergeIrJsonFilesByGraphIdAsync({ outDirAbs, irJsonPaths: irPaths })
    mergeIrMs = profiling ? performance.now() - mergeIrStart : 0
    lastMergeResults = merged.map((m) => ({
      graphId: m.graphId,
      outJsonPath: m.outJsonPath,
      sourceJsonPaths: m.sourceJsonPaths,
      sourceIndex: m.sourceIndex ?? null,
      mergedOutput: m.mergedOutput === true
    }))
    const uniqueJsonPaths = [...new Set(merged.map((m) => m.outJsonPath))]
    jsonFileCount = uniqueJsonPaths.length
    const reportJsonStart = profiling ? performance.now() : 0
    uniqueJsonPaths.forEach((p) => ui.ok(p))
    reportJsonMs = profiling ? performance.now() - reportJsonStart : 0

    const planGiaStart = profiling ? performance.now() : 0
    const tasks = planGiaTasksFromMergeResults(lastMergeResults)
    planGiaMs = profiling ? performance.now() - planGiaStart : 0
    const generateGiaStart = profiling ? performance.now() : 0
    const detailed = await writeGiaFromIrJsonFiles(tasks, {
      cwd: cfgDir,
      profile: profiling,
      onProfile: (profile) => (irToGiaProfile = profile),
      onOkLine: (msg) => ui.ok(msg)
    })
    generateGiaMs = profiling ? performance.now() - generateGiaStart : 0
    // GIA 输出由 runner 实时打印，这里避免重复输出
    giaAll.push(...detailed.map((x) => ({ giaPath: x.giaPath, targetId: x.graphId })))

    ui.info(t('giaAllDone', { count: giaAll.length }))
  }

  hooks?.onPrepared?.({
    giaPaths: giaAll.map((item) => item.giaPath),
    giaItems: giaAll,
    mergeResults: lastMergeResults
  })

  let injectMs = 0
  // 批量模式：忽略 config.inject.nodeGraphId，使用 GIA 内的 graph id 推断
  if (entryOutFiles.length && !opts.noinject && cfg.inject) {
    const injectStart = profiling ? performance.now() : 0
    const stat = runInjectionAttempt(
      () =>
        injectMany({
          giaItems: giaAll,
          opts,
          gilCfg: cfg.inject,
          useConfiguredTargetId: false,
          lang,
          t
        }),
      hooks
    )
    injectMs = profiling ? performance.now() - injectStart : 0
    parsedGil = stat.parsedGil
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
    sourceFiles: compileResult.runtimeSourceFiles,
    moduleFiles: compileResult.moduleOutFiles,
    outDirAbs,
    mergeResults: lastMergeResults,
    giaPaths: giaAll.map((item) => item.giaPath),
    parsedGil,
    ...(profiling
      ? {
          profile: {
            stats: {
              sourceFiles: compileResult.outFiles.length,
              entryFiles: entryOutFiles.length,
              jsonFiles: jsonFileCount,
              giaFiles: giaAll.length
            },
            timingsMs: {
              loadConfig: loadConfigMs,
              checks: checksMs,
              compile: compileMs,
              emitIr: emitIrMs,
              mergeIr: mergeIrMs,
              reportJson: reportJsonMs,
              planGia: planGiaMs,
              generateGia: generateGiaMs,
              inject: injectMs,
              total: performance.now() - totalStart
            },
            checks: checksProfile,
            compile: compileResult.profile,
            gsToIr: gsToIrProfile,
            irToGia: irToGiaProfile
          } satisfies RunBatchProfile
        }
      : {})
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
  const programCache = createTsToGsProgramCache()

  const lastInjectedGiaItems = new Map<string, GiaInjectionItem>()
  // Invalidated outputs are not injectable, but a map save must still retry their generation.
  const pendingGiaGraphIds = new Set<number>()
  const normalizeGiaPath = (p: string) => path.resolve(p)
  const trackGiaItems = (items: GiaInjectionItem[], mode: 'add' | 'replace' = 'add') => {
    if (mode === 'replace') lastInjectedGiaItems.clear()
    for (const item of items) {
      const giaPath = normalizeGiaPath(item.giaPath)
      lastInjectedGiaItems.set(giaPath, { giaPath, targetId: item.targetId })
    }
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
  const graphIdToMergeResult = new Map<number, MergeResult>()
  const sourceJsonToGraphIds = new Map<string, Set<number>>()

  const updateMergeCache = (results: MergeResult[] | undefined) => {
    if (!results?.length) return
    for (const r of results) {
      graphIdToSources.set(r.graphId, r.sourceJsonPaths)
      graphIdToMergedJsonPath.set(r.graphId, r.outJsonPath)
      graphIdToMergeResult.set(r.graphId, r)
      for (const source of r.sourceJsonPaths) {
        const ids = sourceJsonToGraphIds.get(source) ?? new Set<number>()
        ids.add(r.graphId)
        sourceJsonToGraphIds.set(source, ids)
      }
    }
  }

  const safeRunBatch = async (invalidatedFiles?: Iterable<string>) => {
    try {
      const res = await runBatch(opts, {
        programCache,
        invalidatedFiles,
        onPrepared: ({ giaItems, mergeResults }) => {
          trackGiaItems(giaItems, 'replace')
          pendingGiaGraphIds.clear()
          graphIdToSources.clear()
          graphIdToMergedJsonPath.clear()
          graphIdToMergeResult.clear()
          sourceJsonToGraphIds.clear()
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
      gilPath,
      parsedGil: initial.parsedGil
    })
  }

  const compilerOptions = loadTsCompilerOptions(cfgDir)
  const depGraph: DepGraph = {
    depsByFile: new Map(),
    reverseByFile: new Map(),
    absByNorm: new Map()
  }
  const allSources = [
    ...new Set([
      ...(await listAllSourceFiles(compileRoot, cfg.entries)),
      ...(initial?.sourceFiles ?? [])
    ])
  ]
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

  const collectActiveModuleFiles = () => {
    const files = new Set<string>()
    const seen = new Set<string>()
    const queue = [...entrySources]
    while (queue.length) {
      const norm = queue.shift()!
      if (seen.has(norm)) continue
      seen.add(norm)
      const source = depGraph.absByNorm.get(norm)
      if (source) {
        const rel = path.relative(compileRoot, source)
        if (!rel.startsWith('..') && !path.isAbsolute(rel)) {
          const outFile = path.resolve(outDirAbs, rel.replace(/\.ts$/i, '.gs.ts'))
          if (fs.existsSync(outFile)) files.add(outFile)
        }
      }
      for (const dep of depGraph.depsByFile.get(norm) ?? []) queue.push(normForMap(dep))
    }
    return [...files].sort((a, b) => a.localeCompare(b))
  }

  await refreshEntryMapping()

  const { cwd, watch, ignored } = buildDevWatchGlobs(cfgDir, cfg)
  const changed = new Set<string>()
  const removed = new Set<string>()
  let runtimeDependencyWatcher: ReturnType<typeof chokidar.watch> | undefined

  const registerRuntimeSources = (sourceFiles: string[]) => {
    const rels: string[] = []
    for (const source of sourceFiles) {
      if (!fs.existsSync(source)) continue
      updateDepsForFile(depGraph, source, compilerOptions)
      const rel = path.relative(compileRoot, source)
      if (rel.startsWith('..') || path.isAbsolute(rel)) continue
      rels.push(toPosixPath(rel))
    }
    if (rels.length) runtimeDependencyWatcher?.add(rels)
  }

  const refreshCompilerState = async (runtimeSources: string[]) => {
    depGraph.depsByFile.clear()
    depGraph.reverseByFile.clear()
    depGraph.absByNorm.clear()
    const currentSources = [
      ...new Set([...(await listAllSourceFiles(compileRoot, cfg.entries)), ...runtimeSources])
    ]
    currentSources.forEach((source) => updateDepsForFile(depGraph, source, compilerOptions))
    await refreshEntryMapping()
    registerRuntimeSources(runtimeSources)
  }

  const deleteIfExists = (p: string) => {
    if (p.toLowerCase().endsWith('.gia')) lastInjectedGiaItems.delete(normalizeGiaPath(p))
    try {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p)
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
    const retiredSources = new Set<string>()

    const processEntryOutputs = async (entryOutFiles: string[]) => {
      if (!entryOutFiles.length && !retiredSources.size) return
      const sourceJsonPaths = entryOutFiles.map(resolveIrOutputPath)
      const graphIds = new Set<number>()
      // Keep old memberships before replacing them, including entries that disappeared.
      for (const source of [...sourceJsonPaths, ...retiredSources]) {
        for (const gid of sourceJsonToGraphIds.get(source) ?? []) graphIds.add(gid)
      }

      if (entryOutFiles.length) {
        console.log('')
        ui.info(t('startGia'))
        const moduleFiles = collectActiveModuleFiles()
        await emitIrJsonForEntries(entryOutFiles, {
          cwd: cfgDir,
          lang,
          moduleFiles,
          moduleRoot: outDirAbs,
          runtimeOptions: {
            precompileExpression: cfg.options?.optimize?.precompileExpression ?? true,
            removeUnusedNodes: cfg.options?.optimize?.removeUnusedNodes ?? true
          }
        })
      }

      const nextSourceIds = new Map<string, Set<number>>()
      for (const irPath of sourceJsonPaths) {
        const ids = new Set(readJsonAsList(irPath).map(getGraphIdFromIrDocLike))
        nextSourceIds.set(irPath, ids)
        for (const gid of ids) graphIds.add(gid)
      }

      // Include the connected source/graph group: a source can contain several graphs.
      // Merging whole documents must not replace another graph with a subset of its sources.
      const unionSources = new Set(sourceJsonPaths)
      for (const gid of graphIds) {
        for (const source of graphIdToSources.get(gid) ?? []) {
          if (retiredSources.has(source) || !fs.existsSync(source)) continue
          unionSources.add(source)
          for (const related of nextSourceIds.get(source) ??
            sourceJsonToGraphIds.get(source) ??
            []) {
            graphIds.add(related)
          }
        }
      }

      const merged = await mergeIrJsonFilesByGraphIdAsync({
        outDirAbs,
        irJsonPaths: [...unionSources]
      })
      const nextOutputs = new Set(merged.map((m) => m.outJsonPath))
      for (const gid of graphIds) {
        const prevOut = graphIdToMergedJsonPath.get(gid)
        if (prevOut && !nextOutputs.has(prevOut) && isMergedJsonFile(prevOut)) {
          deleteIfExists(prevOut)
        }
        graphIdToSources.delete(gid)
        graphIdToMergedJsonPath.delete(gid)
        graphIdToMergeResult.delete(gid)
      }
      for (const source of [...unionSources, ...retiredSources]) sourceJsonToGraphIds.delete(source)
      // Replace pending memberships too: a failed graph can later move IDs or lose all sources.
      for (const gid of graphIds) pendingGiaGraphIds.delete(gid)
      for (const result of merged) pendingGiaGraphIds.add(result.graphId)
      // Retire by graph ID: single/multiple/merged outputs can use different GIA filenames.
      for (const [giaPath, item] of lastInjectedGiaItems) {
        if (item.targetId !== undefined && graphIds.has(item.targetId)) deleteIfExists(giaPath)
      }
      updateMergeCache(
        merged.map((m) => ({
          graphId: m.graphId,
          outJsonPath: m.outJsonPath,
          sourceJsonPaths: m.sourceJsonPaths,
          sourceIndex: m.sourceIndex ?? null,
          mergedOutput: m.mergedOutput === true
        }))
      )
      for (const result of merged) queueOutJson(result.outJsonPath, result.graphId)
    }

    if (removed.size > 20 || changed.size > 20) {
      const invalidatedFiles = [...removed, ...changed].map((rel) => path.resolve(compileRoot, rel))
      removed.clear()
      changed.clear()
      const result = await safeRunBatch(invalidatedFiles)
      if (result) await refreshCompilerState(result.sourceFiles)
      return
    }

    const removedRels = [...removed]
    removed.clear()

    const rels = [...changed]
    changed.clear()

    const impactedEntryNorms = new Set<string>()
    for (const rel of removedRels) {
      const abs = path.resolve(compileRoot, rel)
      for (const dependent of collectDependents(depGraph, abs)) {
        if (entrySources.has(dependent)) impactedEntryNorms.add(dependent)
      }
      removeFileFromDeps(depGraph, abs)
      const norm = normForMap(abs)
      entrySources.delete(norm)
      entryOutBySource.delete(norm)
    }

    const changedAbs = rels.map((rel) => path.resolve(compileRoot, rel))
    invalidateTsToGsProgramCache(programCache, [
      ...removedRels.map((rel) => path.resolve(compileRoot, rel)),
      ...changedAbs
    ])
    for (const abs of changedAbs) {
      updateDepsForFile(depGraph, abs, compilerOptions)
    }

    for (const rel of removedRels) {
      const gsOut = path.resolve(outDirAbs, rel.replace(/\.ts$/i, '.gs.ts'))
      const irPath = resolveIrOutputPath(gsOut)
      retiredSources.add(irPath)
      deleteIfExists(gsOut)
      deleteIfExists(gsOut.replace(/\.gs\.ts$/i, '.gs.js'))
      deleteIfExists(gsOut.replace(/\.gs\.ts$/i, '.gs.js.map'))
      deleteIfExists(irPath)
    }

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

    const compileRels = [...new Set([...rels, ...impactedEntryRels])]
    if (compileRels.length) {
      ui.info(t('startCompile'))
      const compileResult = await compileTsToGs({
        cfgDir,
        cfg,
        emitEntries: compileRels,
        programEntries: cfg.entries,
        programCache,
        onWriteGs: (p) => ui.ok(p)
      })
      registerRuntimeSources(compileResult.runtimeSourceFiles)
      const { entryOutFiles } = compileResult
      const currentEntries = new Set(entryOutFiles.map((p) => path.resolve(p)))
      for (const rel of compileRels) {
        const norm = normForMap(path.resolve(compileRoot, rel))
        const previous = entryOutBySource.get(norm)
        if (previous && !currentEntries.has(path.resolve(previous))) {
          const irPath = resolveIrOutputPath(previous)
          retiredSources.add(irPath)
          deleteIfExists(irPath)
          entrySources.delete(norm)
          entryOutBySource.delete(norm)
        }
      }
      updateEntryMapping(entryOutFiles)
      entryOutFiles.forEach((p) => pendingEntryGs.add(p))
    }

    await processEntryOutputs([...pendingEntryGs].filter((p) => fs.existsSync(p)))

    const entries = [...queuedOutJson.entries()]
    const tasks = entries.flatMap(([outJson, gids]) => {
      const metadata = [...gids]
        .map((graphId) => graphIdToMergeResult.get(graphId))
        .filter((result): result is MergeResult => !!result && result.outJsonPath === outJson)
      if (metadata.length === gids.size) return planGiaTasksFromMergeResults(metadata)
      const fallback = planGiaTaskFromOutJson(outJson, gids)
      return fallback ? [fallback] : []
    })

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
      for (const item of all) pendingGiaGraphIds.delete(item.graphId)
      trackGiaItems(all.map((item) => ({ giaPath: item.giaPath, targetId: item.graphId })))
    }

    for (const [outJson] of entries) {
      ui.ok(outJson)
      // GIA 输出由 runner 实时打印，这里避免重复输出
    }

    if (all.length && !opts.noinject && cfg.inject) {
      const stat = runInjectionAttempt(
        () =>
          injectMany({
            giaItems: all.map((item) => ({ giaPath: item.giaPath, targetId: item.graphId })),
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

    const tracked = [...lastInjectedGiaItems.values()]
    if (!tracked.length && !pendingGiaGraphIds.size) {
      ui.warn(t('devReinjectNoGia'))
      if (fs.existsSync(gilPath)) {
        maybeExtractResources({
          cfgDir,
          injectCfg: cfg.inject,
          opts,
          lang,
          gilPath,
          reason: 'map-change'
        })
      }
      return
    }

    const missing = tracked.filter((item) => !fs.existsSync(item.giaPath))
    if (missing.length || pendingGiaGraphIds.size) {
      ui.warn(t('devReinjectMissingGia', { count: missing.length + pendingGiaGraphIds.size }))
      const res = await safeRunBatch()
      if (res) {
        await refreshCompilerState(res.sourceFiles)
        maybeExtractResources({
          cfgDir,
          injectCfg: res.cfg.inject,
          opts,
          lang: res.lang,
          gilPath,
          reason: 'map-change',
          parsedGil: res.parsedGil
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
          giaItems: tracked,
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
      reason: 'map-change',
      parsedGil: stat.parsedGil
    })
  }

  const onGilChange = () => {
    if (!reinjectOnMapChange || !gilPath) return
    if (Date.now() < gilIgnoreUntil) return
    triggerReinject()
  }

  const onSourceAddOrChange = (p: string) => {
    changed.add(p)
    triggerCodeChange()
  }
  const onSourceUnlink = (p: string) => {
    removed.add(p)
    triggerCodeChange()
  }
  const onSourceWatchError = (err: unknown) => {
    ui.error(`watch error: ${err instanceof Error ? err.message : String(err)}`)
  }

  chokidar
    .watch(watch, { cwd, ignoreInitial: true, ignored })
    .on('add', onSourceAddOrChange)
    .on('change', onSourceAddOrChange)
    .on('unlink', onSourceUnlink)
    .on('error', onSourceWatchError)

  const runtimeWatchFiles = allSources
    .map((source) => path.relative(compileRoot, source))
    .filter((rel) => rel && !rel.startsWith('..') && !path.isAbsolute(rel))
    .map(toPosixPath)
  runtimeDependencyWatcher = chokidar
    .watch(runtimeWatchFiles, {
      cwd,
      ignoreInitial: true,
      ignored: [
        '**/node_modules/**',
        '**/*.d.ts',
        '**/*.gs.ts',
        toPosixPath(path.posix.join(stripDotSlash(cfg.outDir), '**'))
      ]
    })
    .on('add', onSourceAddOrChange)
    .on('change', onSourceAddOrChange)
    .on('unlink', onSourceUnlink)
    .on('error', onSourceWatchError)

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
  const resolved = resolveGilFolder(gil)

  const files = listGilFiles(resolved.saveLevelDir)
    .map((full) => {
      const st = fs.statSync(full)
      return { name: path.basename(full), mtimeMs: st.mtimeMs }
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
    ui.ok(`opened ${path.dirname(resolved.gilPath)}`)
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
  parsedGil?: ParsedGilCache
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

  const cached =
    params.parsedGil && path.resolve(params.parsedGil.gilPath) === path.resolve(gilPath)
      ? params.parsedGil.parsed
      : undefined
  const extracted = extractGilArtifacts({
    gilPath,
    parsed: cached,
    resources: shouldExtractResources
      ? { outPath: resolveResourcesPath(params.cfgDir, injectCfg), lang }
      : undefined,
    signals: shouldExtractSignals
      ? { outPath: resolveSignalsPath(params.cfgDir, injectCfg) }
      : undefined
  })

  if (extracted.resources) {
    const result = extracted.resources
    if (result.status === 'ok') {
      ui.ok(t('extractResourcesOk', { path: result.outPath, count: result.count }))
    } else if (result.status === 'skipped-existing') {
      ui.warn(t('extractResourcesSkipExisting', { path: result.outPath }))
    } else {
      ui.warn(t('extractResourcesFail', { error: result.error }))
    }
  }

  if (extracted.signals) {
    const result = extracted.signals
    if (result.status === 'ok') {
      ui.ok(t('extractSignalsOk', { path: result.outPath, count: result.count }))
    } else if (result.status === 'skipped-existing') {
      ui.warn(t('extractSignalsSkipExisting', { path: result.outPath }))
    } else {
      ui.warn(t('extractSignalsFail', { error: result.error }))
    }
  }

  if (injectProfileEnabled(opts)) {
    const profile = extracted.profile
    console.log(
      '[extract-profile]',
      JSON.stringify({
        kind: 'gsts-extract-profile',
        version: 2,
        mapFile: path.basename(gilPath),
        resources: extracted.resources?.status,
        signals: extracted.signals?.status,
        stats: {
          inputBytes: profile.inputBytes,
          fieldCount: profile.fieldCount,
          reusedInjectionParse: profile.reusedParsed,
          formatAttempts: profile.formatAttempts,
          formatRuns: profile.formatRuns,
          formatRequestedFiles: profile.formatRequestedFiles,
          formattedFiles: profile.formattedFiles,
          ...(profile.formatError ? { formatError: profile.formatError } : {})
        },
        timingsMs: {
          checks: roundMs(profile.checksMs),
          readGil: roundMs(profile.readGilMs),
          parseGil: roundMs(profile.parseGilMs),
          resources: roundMs(profile.resourcesMs),
          signals: roundMs(profile.signalsMs),
          format: roundMs(profile.formatMs),
          total: roundMs(profile.totalMs)
        }
      })
    )
  }
  return extracted
}

function maybeInjectGias(
  giaItems: GiaInjectionItem[],
  opts: GlobalOptions,
  gilCfg: GstsInjectConfig | undefined,
  useConfiguredTargetId: boolean,
  resolvedLang: string | undefined
) {
  if (opts.noinject) return
  if (!gilCfg) return

  const { t } = initCliI18n(detectLang(resolvedLang ?? opts.lang))
  const stat = injectMany({
    giaItems,
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
    maybeInjectGias([{ giaPath: abs }], opts, injectCfg, true, lang)
    return
  }

  if (isJsonPath(abs)) {
    ui.info(t('startGia'))
    const out = writeGiaFromOutJson(abs, undefined, (x) => ui.ok(`${x.giaPath} (id=${x.graphId})`))
    // 单文件模式：允许使用 config.inject.nodeGraphId 覆盖目标 id
    maybeInjectGias(
      out.map((item) => ({ giaPath: item.giaPath, targetId: item.graphId })),
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
      out.map((item) => ({ giaPath: item.giaPath, targetId: item.graphId })),
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
  const compileResult = await compileTsToGs({
    cfgDir,
    cfg: singleCfg,
    onWriteGs: (p) => ui.ok(p)
  })
  const { entryOutFiles } = compileResult

  const gsFile = entryOutFiles[0]
  if (!gsFile) {
    ui.warn(t('warnNotEntry'))
    return
  }

  console.log('')
  ui.info(t('startGia'))
  await emitIrJsonForEntries([gsFile], {
    cwd: cfgDir,
    lang,
    moduleFiles: compileResult.moduleOutFiles,
    moduleRoot: compileResult.outDir,
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
    giaOut.map((item) => ({ giaPath: item.giaPath, targetId: item.graphId })),
    opts,
    injectCfg,
    true,
    lang
  )
}

async function main() {
  const argv = process.argv.slice(2)
  const startupProfiling =
    process.env.GSTS_INJECT_PROFILE === '1' || argv.includes('--inject-profile')
  const mainStart = startupProfiling ? performance.now() : 0
  const pre = preparseArgv(argv)
  const initialConfigLoadStart = startupProfiling ? performance.now() : 0
  const preLoaded = await loadConfigOrNull({ config: pre.config, lang: pre.lang })
  const initialConfigLoadMs = startupProfiling ? performance.now() - initialConfigLoadStart : 0
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
        const actionStart = injectProfileEnabled(opts) ? performance.now() : 0
        const res = await runBatch(opts)
        const extractStart = injectProfileEnabled(opts) ? performance.now() : 0
        const extracted = maybeExtractResources({
          cfgDir: res.cfgDir,
          injectCfg: res.cfg.inject,
          opts,
          lang: res.lang,
          parsedGil: res.parsedGil
        })
        if (injectProfileEnabled(opts)) {
          const extractMs = performance.now() - extractStart
          console.log(
            '[pipeline-profile]',
            JSON.stringify({
              kind: 'gsts-pipeline-profile',
              version: 1,
              mode: 'batch',
              configFile: path.basename(resolveConfigPath(opts)),
              stats: res.profile?.stats,
              timingsMs: {
                initialConfigLoad: roundMs(initialConfigLoadMs),
                startupBeforeAction: roundMs(actionStart - mainStart),
                batch: roundMs(res.profile?.timingsMs.total ?? 0),
                extraction: roundMs(extractMs),
                total: roundMs(performance.now() - mainStart)
              },
              batch: res.profile,
              extraction: extracted?.profile
            })
          )
        }
      }
    })

  program
    .command('analyze <file>')
    .description(
      lang === 'zh-CN'
        ? '分析节点图 IR JSON 的静态节点与连线数量（不编译或注入）'
        : 'Report static node and connection counts from IR JSON (no compilation or injection)'
    )
    .action(async (file: string) => {
      const { analyzeGraphDocuments } = await import('../compiler/graph_analysis.js')
      const raw: unknown = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'))
      console.log(JSON.stringify(analyzeGraphDocuments(raw), null, 2))
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
