import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

import {
  compileGsModulesToJs,
  resolveGsJsOutputPath,
  type GsToJsCompileProfile
} from '../gs_to_js_pipeline.js'

const require = createRequire(import.meta.url)
const tsxCli = require.resolve('tsx/cli')
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const runnerJsPath = path.join(__dirname, 'runner.js')
const runnerPath = fs.existsSync(runnerJsPath) ? runnerJsPath : path.join(__dirname, 'runner.ts')

export type GsToJsonOptions = {
  maxParallel?: number
  compact?: boolean
  cwd?: string
  /** All generated .gs.ts runtime modules. When present they are compiled once and entries run with Node. */
  moduleFiles?: string[]
  /** Output root shared by moduleFiles. Required when moduleFiles is present. */
  moduleRoot?: string
  profile?: boolean
  onProfile?: (profile: GsToIrBatchProfile) => void
  runtimeOptions?: {
    precompileExpression?: boolean
    removeUnusedNodes?: boolean
  }
}

export type GsToIrChildProfile = {
  stats: {
    inputBytes: number
    outputBytes: number
    documents: number
    nodes: number
    variables: number
  }
  timingsMs: {
    importEntry: number
    buildDocuments: number
    stringify: number
    write: number
    total: number
  }
}

export type GsToIrTaskProfile = {
  entry: string
  runtimeEntry: string
  outFile: string
  wallMs: number
  startupOverheadMs?: number
  child?: GsToIrChildProfile
}

export type GsToIrBatchProfile = {
  stats: {
    tasks: number
    modules: number
    runner: 'node' | 'tsx'
    maxParallel: number
    sumTaskWallMs: number
    sumChildMs: number
    sumStartupOverheadMs: number
  }
  timingsMs: {
    precompile: number
    execute: number
    wall: number
  }
  precompile?: GsToJsCompileProfile
  tasks: GsToIrTaskProfile[]
}

const PROFILE_PREFIX = '[gsts-profile:gs-to-ir] '

export function hasEntryMarker(text: string): boolean {
  const cleaned = text.replace(/^\uFEFF/, '')
  const firstLine = cleaned.split(/\r?\n/, 1)[0]
  return /^\s*\/\/\s*@gsts:entry\s*$/.test(firstLine)
}

export function resolveIrOutputPath(entryFile: string): string {
  return entryFile.replace(/\.gs\.ts$/i, '.json')
}

function spawnRunner(
  entryFile: string,
  runtimeEntry: string,
  outFile: string,
  compact: boolean,
  directNode: boolean,
  cwd?: string,
  runtimeOptions?: GsToJsonOptions['runtimeOptions'],
  profile?: boolean
): Promise<GsToIrTaskProfile | undefined> {
  return new Promise((resolve, reject) => {
    const wallStart = profile ? performance.now() : 0
    const args = directNode
      ? ['--enable-source-maps', runnerPath, runtimeEntry, outFile, compact ? '1' : '0']
      : [tsxCli, runnerPath, runtimeEntry, outFile, compact ? '1' : '0']
    const env = { ...process.env }
    if (runtimeOptions && runtimeOptions.precompileExpression !== undefined) {
      env.GSTS_PRECOMPILE_EXPR = runtimeOptions.precompileExpression ? '1' : '0'
    }
    if (runtimeOptions && runtimeOptions.removeUnusedNodes !== undefined) {
      env.GSTS_REMOVE_UNUSED_NODES = runtimeOptions.removeUnusedNodes ? '1' : '0'
    }
    if (profile) env.GSTS_PIPELINE_PROFILE = '1'
    const child = spawn(process.execPath, args, {
      stdio: profile ? ['inherit', 'inherit', 'pipe'] : 'inherit',
      cwd,
      env
    })
    let stderrBuf = ''
    let childProfile: GsToIrChildProfile | undefined
    const consumeStderrLine = (line: string) => {
      if (line.startsWith(PROFILE_PREFIX)) {
        try {
          const parsed = JSON.parse(line.slice(PROFILE_PREFIX.length)) as GsToIrChildProfile
          childProfile = parsed
        } catch {
          process.stderr.write(line + '\n')
        }
        return
      }
      if (line.length) process.stderr.write(line + '\n')
    }
    if (profile) {
      child.stderr?.setEncoding('utf8')
      child.stderr?.on('data', (chunk: string) => {
        stderrBuf += chunk
        while (true) {
          const idx = stderrBuf.indexOf('\n')
          if (idx < 0) break
          consumeStderrLine(stderrBuf.slice(0, idx).replace(/\r$/, ''))
          stderrBuf = stderrBuf.slice(idx + 1)
        }
      })
    }
    child.on('error', reject)
    child.on('exit', (code) => {
      if (profile && stderrBuf.length) consumeStderrLine(stderrBuf.replace(/\r$/, ''))
      if (code !== 0) {
        reject(new Error(`[error] gs_to_ir_json failed: ${entryFile}`))
        return
      }
      if (!profile) {
        resolve(undefined)
        return
      }
      const wallMs = performance.now() - wallStart
      resolve({
        entry: entryFile,
        runtimeEntry,
        outFile,
        wallMs,
        ...(childProfile
          ? {
              child: childProfile,
              startupOverheadMs: Math.max(0, wallMs - childProfile.timingsMs.total)
            }
          : {})
      })
    })
  })
}

async function runWithLimit<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>) {
  let index = 0
  const slots = Math.min(limit, items.length)
  const results: R[] = []
  const runners = Array.from({ length: slots }, async () => {
    while (true) {
      if (index >= items.length) break
      const currentIndex = index++
      results[currentIndex] = await worker(items[currentIndex])
    }
  })
  await Promise.all(runners)
  return results
}

export async function emitIrJsonForEntries(
  entries: string[],
  opts: GsToJsonOptions = {}
): Promise<void> {
  if (!entries.length) return
  const list = entries.map((entry) => {
    const absEntry = path.resolve(entry)
    const outFile = resolveIrOutputPath(absEntry)
    return { entry: absEntry, runtimeEntry: absEntry, outFile }
  })
  const maxParallel = Math.max(1, opts.maxParallel ?? Math.max(1, os.cpus().length - 1))
  const wallStart = opts.profile ? performance.now() : 0
  const precompileStart = opts.profile ? performance.now() : 0
  let precompileProfile: GsToJsCompileProfile | undefined
  let directNode = false
  if (opts.moduleFiles) {
    if (!opts.moduleRoot) {
      throw new Error('[error] moduleRoot is required when moduleFiles is provided')
    }
    const compiled = await compileGsModulesToJs({
      moduleFiles: opts.moduleFiles,
      rootDir: opts.moduleRoot,
      profile: opts.profile
    })
    precompileProfile = compiled.profile
    const compiledSet = new Set(compiled.outFiles.map((file) => path.resolve(file)))
    for (const item of list) {
      item.runtimeEntry = resolveGsJsOutputPath(item.entry)
      if (!compiledSet.has(item.runtimeEntry)) {
        throw new Error(`[error] entry module was not precompiled: ${item.entry}`)
      }
    }
    directNode = runnerPath === runnerJsPath
  }
  const precompileMs = opts.profile ? performance.now() - precompileStart : 0
  const executeStart = opts.profile ? performance.now() : 0
  const profiles = await runWithLimit(list, maxParallel, (item) =>
    spawnRunner(
      item.entry,
      item.runtimeEntry,
      item.outFile,
      !!opts.compact,
      directNode,
      opts.cwd,
      opts.runtimeOptions,
      opts.profile
    )
  )
  const executeMs = opts.profile ? performance.now() - executeStart : 0
  if (!opts.profile) return

  const tasks = profiles.filter((item): item is GsToIrTaskProfile => !!item)
  const sumTaskWallMs = tasks.reduce((sum, item) => sum + item.wallMs, 0)
  const sumChildMs = tasks.reduce((sum, item) => sum + (item.child?.timingsMs.total ?? 0), 0)
  const sumStartupOverheadMs = tasks.reduce((sum, item) => sum + (item.startupOverheadMs ?? 0), 0)
  opts.onProfile?.({
    stats: {
      tasks: tasks.length,
      modules: opts.moduleFiles?.length ?? 0,
      runner: directNode ? 'node' : 'tsx',
      maxParallel,
      sumTaskWallMs,
      sumChildMs,
      sumStartupOverheadMs
    },
    timingsMs: {
      precompile: precompileMs,
      execute: executeMs,
      wall: performance.now() - wallStart
    },
    ...(precompileProfile ? { precompile: precompileProfile } : {}),
    tasks
  })
}
