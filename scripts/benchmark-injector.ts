import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import { resolveGilTarget } from '../src/cli/gil_paths.js'
import { loadGstsConfig } from '../src/compiler/config_loader.js'
import { createInjector } from '../src/injector/index.js'
import type {
  InjectGilBatchResult,
  InjectGilBatchSkipReason,
  InjectGilBatchTimings
} from '../src/injector/types.js'

type Options = {
  configPath?: string
  gilPath?: string
  giaInputs: string[]
  repeat: number
  warmup: number
  skipSafeCheck: boolean
  targetId?: number
  lang?: string
}

type ResolvedOptions = Omit<Options, 'configPath' | 'gilPath'> & {
  inputMode: 'config' | 'explicit'
  configPath?: string
  gilPath: string
}

function usage(exitCode = 1): never {
  const output = exitCode === 0 ? console.log : console.error
  output(
    [
      'Usage:',
      '  npm run benchmark:injector -- --config <gsts.config.ts> [options]',
      '  npm run benchmark:injector -- <map.gil> <file-or-directory>... [options]',
      '',
      'Options:',
      '  -c, --config <file>   Resolve the map and GIA directory from a GSTS config',
      '  --repeat <count>      Measured runs (default: 5)',
      '  --warmup <count>      Warmup runs (default: 1)',
      '  --target-id <id>      Override every GIA target id (explicit mode only)',
      '  --skip-safe-check     Allow replacing non-empty target graphs',
      '  --lang <lang>         Error/warning language'
    ].join('\n')
  )
  process.exit(exitCode)
}

function positiveInteger(raw: string | undefined, option: string): number {
  const value = Number(raw)
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${option} requires a non-negative integer`)
  }
  return value
}

function requiredValue(argv: string[], index: number, option: string): string {
  const value = argv[index]
  if (!value || value.startsWith('-')) throw new Error(`${option} requires a value`)
  return value
}

function parseOptions(argv: string[]): Options {
  const positional: string[] = []
  let configPath: string | undefined
  let repeat = 5
  let warmup = 1
  let skipSafeCheck = false
  let targetId: number | undefined
  let lang: string | undefined

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--config' || arg === '-c') {
      configPath = path.resolve(requiredValue(argv, ++i, arg))
    } else if (arg === '--repeat') {
      repeat = positiveInteger(argv[++i], '--repeat')
    } else if (arg === '--warmup') {
      warmup = positiveInteger(argv[++i], '--warmup')
    } else if (arg === '--target-id') {
      targetId = positiveInteger(argv[++i], '--target-id')
    } else if (arg === '--skip-safe-check') {
      skipSafeCheck = true
    } else if (arg === '--lang') {
      lang = argv[++i]
      if (!lang) throw new Error('--lang requires a value')
    } else if (arg === '--help' || arg === '-h') {
      usage(0)
    } else if (arg.startsWith('-')) {
      throw new Error(`unknown option: ${arg}`)
    } else {
      positional.push(arg)
    }
  }

  if (repeat < 1) throw new Error('--repeat must be at least 1')
  if (configPath) {
    if (positional.length > 0) {
      throw new Error('--config cannot be combined with explicit map or GIA paths')
    }
    if (targetId !== undefined) {
      throw new Error('--target-id is not supported with --config; batch mode uses GIA ids')
    }
    return {
      configPath,
      giaInputs: [],
      repeat,
      warmup,
      skipSafeCheck,
      lang
    }
  }
  if (positional.length < 2) usage()
  return {
    gilPath: path.resolve(positional[0]),
    giaInputs: positional.slice(1).map((input) => path.resolve(input)),
    repeat,
    warmup,
    skipSafeCheck,
    targetId,
    lang
  }
}

async function resolveOptions(options: Options): Promise<ResolvedOptions> {
  if (!options.configPath) {
    if (!options.gilPath) throw new Error('missing map path')
    return {
      ...options,
      inputMode: 'explicit',
      gilPath: options.gilPath
    }
  }

  const config = await loadGstsConfig(options.configPath)
  if (!config.inject) {
    throw new Error(`config does not define inject: ${options.configPath}`)
  }
  const gilPath = resolveGilTarget(config.inject).gilPath
  const giaDir = path.resolve(path.dirname(options.configPath), config.outDir)
  if (!fs.existsSync(giaDir)) {
    throw new Error(
      `GIA output directory not found: ${giaDir}\n` +
        `Run gsts with --noinject and this config before benchmarking.`
    )
  }
  return {
    ...options,
    inputMode: 'config',
    gilPath,
    giaInputs: [giaDir],
    skipSafeCheck: options.skipSafeCheck || !!config.inject.skipSafeCheck,
    lang: options.lang ?? config.lang
  }
}

function collectGiaFiles(inputs: string[]): string[] {
  const files: string[] = []
  const visit = (input: string) => {
    const stat = fs.statSync(input)
    if (stat.isFile()) {
      if (input.toLowerCase().endsWith('.gia')) files.push(input)
      return
    }
    if (!stat.isDirectory()) return
    for (const entry of fs.readdirSync(input, { withFileTypes: true })) {
      const child = path.join(input, entry.name)
      if (entry.isDirectory()) visit(child)
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.gia')) files.push(child)
    }
  }
  inputs.forEach(visit)
  return [...new Set(files.map((file) => path.resolve(file)))].sort((a, b) => a.localeCompare(b))
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

function distribution(values: number[]) {
  return {
    samples: values.map(round),
    min: round(Math.min(...values)),
    median: round(median(values)),
    max: round(Math.max(...values))
  }
}

const options = await resolveOptions(parseOptions(process.argv.slice(2)))
const readGilStart = performance.now()
const gilBytes = fs.readFileSync(options.gilPath)
const readGilMs = performance.now() - readGilStart
const giaFiles = collectGiaFiles(options.giaInputs)
if (giaFiles.length === 0) {
  throw new Error(
    options.inputMode === 'config'
      ? `no .gia files found in configured outDir: ${options.giaInputs[0]}\n` +
        'Run gsts with --noinject and this config before benchmarking.'
      : 'no .gia files found'
  )
}

const readGiaStart = performance.now()
const giaItems = giaFiles.map((giaPath) => ({
  giaPath,
  giaBytes: fs.readFileSync(giaPath)
}))
const readGiaMs = performance.now() - readGiaStart
const injector = createInjector({ lang: options.lang })

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function skipReason(error: unknown): InjectGilBatchSkipReason | undefined {
  const message = errorText(error)
  if (/^(?:\[error\]\s*)?target NodeGraph not found:\s*\d+\s*$/i.test(message)) {
    return 'target-not-found'
  }
  if (/^(?:\[error\]\s*)?target NodeGraph not empty and name not _GSTS\*:/i.test(message)) {
    return 'unsafe-target'
  }
  if (
    /^(?:\[error\]\s*)?(?:Client NodeGraph type mismatch|客户端节点图类型不一致):/i.test(message)
  ) {
    return 'client-type-mismatch'
  }
  return undefined
}

function runSequential(): Uint8Array {
  let bytes: Uint8Array = gilBytes
  for (const item of giaItems) {
    try {
      bytes = injector.injectBytes({
        gilBytes: bytes,
        giaBytes: item.giaBytes,
        targetId: options.targetId,
        skipNonEmptyCheck: options.skipSafeCheck,
        lang: options.lang
      }).bytes
    } catch (error) {
      if (skipReason(error)) continue
      throw new Error(`${path.basename(item.giaPath)}: ${errorText(error)}`)
    }
  }
  return bytes
}

function runBatch(): InjectGilBatchResult {
  const result = injector.injectManyBytes({
    gilBytes,
    items: giaItems.map((item) => ({
      giaBytes: item.giaBytes,
      targetId: options.targetId
    })),
    skipNonEmptyCheck: options.skipSafeCheck,
    lang: options.lang
  })
  const failures = result.items
    .map((item, index) => ({ item, index }))
    .filter(
      (
        entry
      ): entry is {
        item: Extract<(typeof result.items)[number], { status: 'failed' }>
        index: number
      } => entry.item.status === 'failed'
    )
  if (failures.length > 0) {
    throw new Error(
      failures
        .map(({ item, index }) => `${path.basename(giaItems[index].giaPath)}: ${item.error}`)
        .join('\n')
    )
  }
  return result
}

for (let i = 0; i < options.warmup; i++) {
  const sequential = runSequential()
  const batch = runBatch()
  assert.deepEqual(Buffer.from(batch.bytes), Buffer.from(sequential))
}

const sequentialSamples: number[] = []
const batchSamples: number[] = []
let batchStats: InjectGilBatchResult['stats'] | undefined
let batchItems: InjectGilBatchResult['items'] | undefined
const batchPhaseSamples: Record<keyof InjectGilBatchTimings, number[]> = {
  parseGilMs: [],
  indexNodeGraphsMs: [],
  buildSignalMapMs: [],
  prepareItemsMs: [],
  applyReplacementsMs: [],
  buildFileMs: [],
  totalMs: []
}

for (let i = 0; i < options.repeat; i++) {
  let sequential: Uint8Array
  let batch: InjectGilBatchResult
  if (i % 2 === 0) {
    const start = performance.now()
    sequential = runSequential()
    sequentialSamples.push(performance.now() - start)
    const batchStart = performance.now()
    batch = runBatch()
    batchSamples.push(performance.now() - batchStart)
  } else {
    const batchStart = performance.now()
    batch = runBatch()
    batchSamples.push(performance.now() - batchStart)
    const start = performance.now()
    sequential = runSequential()
    sequentialSamples.push(performance.now() - start)
  }
  assert.deepEqual(Buffer.from(batch.bytes), Buffer.from(sequential))
  batchStats = batch.stats
  batchItems = batch.items
  for (const key of Object.keys(batchPhaseSamples) as Array<keyof InjectGilBatchTimings>) {
    batchPhaseSamples[key].push(batch.timings[key])
  }
}
if (!batchStats || !batchItems) throw new Error('benchmark produced no batch result')

const skippedItems = batchItems.flatMap((item, index) => {
  return item.status === 'skipped'
    ? [{ file: path.basename(giaItems[index].giaPath), reason: item.reason }]
    : []
})
const skippedTargetNotFound = skippedItems
  .filter((item) => item.reason === 'target-not-found')
  .map((item) => item.file)
const skippedUnsafeTarget = skippedItems
  .filter((item) => item.reason === 'unsafe-target')
  .map((item) => item.file)
const skippedClientTypeMismatch = skippedItems
  .filter((item) => item.reason === 'client-type-mismatch')
  .map((item) => item.file)
const injectedItems = batchItems.filter((item) => item.status === 'ok').length

const sequentialMedian = median(sequentialSamples)
const batchMedian = median(batchSamples)
const phaseMedians = Object.fromEntries(
  (Object.keys(batchPhaseSamples) as Array<keyof InjectGilBatchTimings>).map((key) => [
    key,
    round(median(batchPhaseSamples[key]))
  ])
)

console.log(
  '[inject-benchmark]',
  JSON.stringify({
    kind: 'gsts-inject-benchmark',
    version: 1,
    scope: 'in-memory injector core; input files are read before measured runs',
    inputMode: options.inputMode,
    ...(options.configPath ? { configFile: path.basename(options.configPath) } : {}),
    mapFile: path.basename(options.gilPath),
    files: giaItems.length,
    items: {
      total: giaItems.length,
      injected: injectedItems,
      skippedTargetNotFound: {
        count: skippedTargetNotFound.length,
        files: skippedTargetNotFound
      },
      skippedUnsafeTarget: {
        count: skippedUnsafeTarget.length,
        files: skippedUnsafeTarget
      },
      skippedClientTypeMismatch: {
        count: skippedClientTypeMismatch.length,
        files: skippedClientTypeMismatch
      }
    },
    repeat: options.repeat,
    warmup: options.warmup,
    stats: {
      gilBytes: gilBytes.length,
      giaBytes: giaItems.reduce((sum, item) => sum + item.giaBytes.length, 0),
      fieldCount: batchStats.fieldCount,
      nodeGraphFieldCount: batchStats.nodeGraphFieldCount,
      signalFieldCount: batchStats.signalFieldCount,
      replacementCount: batchStats.replacementCount,
      outputBytes: batchStats.outputBytes
    },
    inputReadTimingsMs: {
      gil: round(readGilMs),
      gia: round(readGiaMs)
    },
    sequentialMs: distribution(sequentialSamples),
    batchMs: distribution(batchSamples),
    batchPhaseMedianMs: phaseMedians,
    speedup: round(sequentialMedian / batchMedian),
    reductionPercent: round((1 - batchMedian / sequentialMedian) * 100),
    outputVerifiedEqual: true
  })
)
