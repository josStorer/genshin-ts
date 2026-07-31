import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

import type {
  GiaWriteFileProfile,
  GiaWriteResult,
  WriteGiaFromIrJsonFileOptions
} from './ir_to_gia_transform/shared.js'

export { writeGiaFromIrJsonFile } from './ir_to_gia_transform/shared.js'
export type {
  GiaWriteFileProfile,
  GiaWriteResult,
  WriteGiaFromIrJsonFileOptions
} from './ir_to_gia_transform/shared.js'

const require = createRequire(import.meta.url)
const tsxCli = require.resolve('tsx/cli')
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const runnerPath = path.join(__dirname, 'ir_to_gia_transform', 'runner.js')
const runnerMode = fs.existsSync(runnerPath) ? 'node' : 'tsx'

export function resolveGiaOutputPath(irJsonPath: string): string {
  return irJsonPath.replace(/\.json$/i, '.gia')
}

export type IrToGiaParallelOptions = {
  maxParallel?: number
  cwd?: string
  profile?: boolean
  onProfile?: (profile: IrToGiaBatchProfile) => void
  /**
   * Called when runner emits an `[ok] ...` progress line.
   * The argument is the message part after `[ok] ` (e.g. `path (id=123)`).
   */
  onOkLine?: (msg: string) => void
}

export type IrToGiaTaskProfile = {
  irPath: string
  wallMs: number
  startupOverheadMs?: number
  child?: GiaWriteFileProfile
}

export type IrToGiaBatchProfile = {
  stats: {
    tasks: number
    maxParallel: number
    runner: 'node' | 'tsx'
    sumTaskWallMs: number
    sumChildMs: number
    sumStartupOverheadMs: number
  }
  timingsMs: {
    wall: number
  }
  tasks: IrToGiaTaskProfile[]
}

type GiaTask = { irPath: string; outFile?: string; opts?: WriteGiaFromIrJsonFileOptions }

const PROFILE_PREFIX = '[gsts-profile:ir-to-gia] '

function spawnRunner(
  task: GiaTask,
  opts?: Pick<IrToGiaParallelOptions, 'cwd' | 'onOkLine' | 'profile'>
): Promise<{ outputs: GiaWriteResult[]; profile?: IrToGiaTaskProfile }> {
  return new Promise((resolve, reject) => {
    const wallStart = opts?.profile ? performance.now() : 0
    const absIr = path.resolve(task.irPath)
    const out = task.outFile ? path.resolve(task.outFile) : ''
    const preserve = task.opts?.preserveIndices ? '1' : '0'
    const indices = task.opts?.includeIndices?.length ? task.opts.includeIndices.join(',') : ''
    const runnerArgs = [runnerPath, absIr, out, preserve, indices]
    const args = runnerMode === 'node' ? runnerArgs : [tsxCli, ...runnerArgs]
    const env = { ...process.env }
    if (opts?.profile) env.GSTS_PIPELINE_PROFILE = '1'
    const child = spawn(process.execPath, args, {
      cwd: opts?.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      env
    })
    let stdout = ''
    let stderrBuf = ''
    let childProfile: GiaWriteFileProfile | undefined
    const consumeStderrLine = (line: string) => {
      const okMatch = /^\[ok\]\s+(.*)$/.exec(line)
      if (okMatch) {
        opts?.onOkLine?.(okMatch[1] ?? '')
        return
      }
      if (line.startsWith(PROFILE_PREFIX)) {
        try {
          childProfile = JSON.parse(line.slice(PROFILE_PREFIX.length)) as GiaWriteFileProfile
        } catch {
          process.stderr.write(line + '\n')
        }
        return
      }
      if (line.length) process.stderr.write(line + '\n')
    }
    child.stdout?.setEncoding('utf8')
    child.stdout?.on('data', (d) => (stdout += d))
    child.stderr?.setEncoding('utf8')
    child.stderr?.on('data', (d) => {
      stderrBuf += d
      while (true) {
        const idx = stderrBuf.indexOf('\n')
        if (idx < 0) break
        const line = stderrBuf.slice(0, idx).replace(/\r$/, '')
        stderrBuf = stderrBuf.slice(idx + 1)
        consumeStderrLine(line)
      }
    })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`[error] ir_to_gia failed: ${absIr}`))
        return
      }
      if (stderrBuf.length) {
        consumeStderrLine(stderrBuf.replace(/\r$/, ''))
      }
      try {
        const parsed = JSON.parse(stdout || '[]') as GiaWriteResult[]
        if (!opts?.profile) {
          resolve({ outputs: parsed })
          return
        }
        const wallMs = performance.now() - wallStart
        resolve({
          outputs: parsed,
          profile: {
            irPath: absIr,
            wallMs,
            ...(childProfile
              ? {
                  child: childProfile,
                  startupOverheadMs: Math.max(0, wallMs - childProfile.timingsMs.total)
                }
              : {})
          }
        })
      } catch {
        reject(new Error(`[error] ir_to_gia runner invalid output: ${absIr}`))
      }
    })
  })
}

async function runWithLimit<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  let nextIndex = 0
  const slots = Math.min(limit, items.length)
  const results: R[] = []
  const runners = Array.from({ length: slots }, async () => {
    while (true) {
      if (nextIndex >= items.length) break
      const i = nextIndex++
      const item = items[i]
      results[i] = await worker(item, i)
    }
  })
  await Promise.all(runners)
  return results
}

export async function writeGiaFromIrJsonFiles(
  tasks: GiaTask[],
  opts: IrToGiaParallelOptions = {}
): Promise<GiaWriteResult[]> {
  if (!tasks.length) return []
  const maxParallel = Math.max(1, opts.maxParallel ?? Math.max(1, os.cpus().length - 1))
  const wallStart = opts.profile ? performance.now() : 0
  const perTask = await runWithLimit(tasks, maxParallel, (t) => spawnRunner(t, opts))
  if (opts.profile) {
    const profiles = perTask
      .map((item) => item.profile)
      .filter((item): item is IrToGiaTaskProfile => !!item)
    const sumTaskWallMs = profiles.reduce((sum, item) => sum + item.wallMs, 0)
    const sumChildMs = profiles.reduce((sum, item) => sum + (item.child?.timingsMs.total ?? 0), 0)
    const sumStartupOverheadMs = profiles.reduce(
      (sum, item) => sum + (item.startupOverheadMs ?? 0),
      0
    )
    opts.onProfile?.({
      stats: {
        tasks: profiles.length,
        maxParallel,
        runner: runnerMode,
        sumTaskWallMs,
        sumChildMs,
        sumStartupOverheadMs
      },
      timingsMs: {
        wall: performance.now() - wallStart
      },
      tasks: profiles
    })
  }
  return perTask.flatMap((item) => item.outputs)
}
