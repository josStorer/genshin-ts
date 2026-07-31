import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import { DEFAULT_GIA_PROTO } from '../../injector/proto.js'
import { resolveGraphIdForGraph } from '../../runtime/graph_defaults.js'
import type { IRDocument } from '../../runtime/IR.js'
import { irToGia, type IrToGiaProfile } from './index.js'

function ensurePrefixedDefaultName(raw: string): string {
  if (raw.startsWith('_GSTS')) return raw
  return `_GSTS_${raw}`
}

function resolveGraphId(ir: IRDocument): number {
  return resolveGraphIdForGraph(ir.graph)
}

export type WriteGiaFromIrJsonFileOptions = {
  /**
   * Only emit selected document indices from the IR list (when the input json is an array).
   * If omitted, emits all.
   */
  includeIndices?: number[]
  /**
   * When includeIndices is provided and the input is an array, keep the original index in
   * output file names (e.g. `foo_3.gia`), instead of re-numbering.
   */
  preserveIndices?: boolean
}

export type GiaWriteResult = {
  irPath: string
  giaPath: string
  graphId: number
  sourceIndex: number
}

export type GiaWriteItemProfile = {
  graphId: number
  sourceIndex: number
  nodes: number
  variables: number
  outputBytes: number
  transformProfile?: IrToGiaProfile
  timingsMs: {
    transform: number
    write: number
    report: number
    total: number
  }
}

export type GiaWriteFileProfile = {
  irPath: string
  inputBytes: number
  documents: number
  timingsMs: {
    read: number
    parse: number
    total: number
  }
  items: GiaWriteItemProfile[]
}

export function writeGiaFromIrJsonFile(
  irPath: string,
  outFile?: string,
  opts?: WriteGiaFromIrJsonFileOptions,
  onWriteGia?: (res: GiaWriteResult) => void,
  onProfile?: (profile: GiaWriteFileProfile) => void
): GiaWriteResult[] {
  const profiling = !!onProfile
  const totalStart = profiling ? performance.now() : 0
  const readStart = profiling ? performance.now() : 0
  const source = fs.readFileSync(irPath, 'utf-8')
  const readMs = profiling ? performance.now() - readStart : 0
  const parseStart = profiling ? performance.now() : 0
  const raw: unknown = JSON.parse(source)
  const parseMs = profiling ? performance.now() - parseStart : 0
  const list: unknown[] = Array.isArray(raw) ? (raw as unknown[]) : [raw]
  if (list.length === 0) {
    throw new Error(`[error] empty IR list: ${irPath}`)
  }

  const inputBaseName = path.basename(irPath, path.extname(irPath))
  const inputDir = path.dirname(irPath)
  const outPath = outFile ?? inputDir
  const isOutputDirectory =
    !path.extname(outPath) || (fs.existsSync(outPath) && fs.statSync(outPath).isDirectory())

  const indices =
    opts?.includeIndices?.length && list.length > 1
      ? [...new Set(opts.includeIndices)]
          .filter((n) => Number.isInteger(n) && n >= 0 && n < list.length)
          .sort((a, b) => a - b)
      : list.map((_, i) => i)

  const outputs: GiaWriteResult[] = []
  const itemProfiles: GiaWriteItemProfile[] = []
  indices.forEach((idx) => {
    const itemStart = profiling ? performance.now() : 0
    const item = list[idx]
    if (!item) return

    const ir = item as IRDocument

    let target: string
    if (list.length === 1) {
      target = isOutputDirectory ? path.join(outPath, `${inputBaseName}.gia`) : outPath
    } else {
      const outputDir = isOutputDirectory ? outPath : path.dirname(outPath)
      const suffix =
        opts?.includeIndices?.length && opts.preserveIndices ? String(idx) : String(outputs.length)
      target = path.join(outputDir, `${inputBaseName}_${suffix}.gia`)
    }

    if (!ir.graph.name) {
      ir.graph.name = ensurePrefixedDefaultName(inputBaseName)
    }

    const transformStart = profiling ? performance.now() : 0
    let transformProfile: IrToGiaProfile | undefined
    const bytes = irToGia(ir, {
      protoPath: DEFAULT_GIA_PROTO,
      onProfile: profiling ? (value) => (transformProfile = value) : undefined
    })
    const transformMs = profiling ? performance.now() - transformStart : 0
    const writeStart = profiling ? performance.now() : 0
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, Buffer.from(bytes))
    const writeMs = profiling ? performance.now() - writeStart : 0
    const res = { irPath, giaPath: target, graphId: resolveGraphId(ir), sourceIndex: idx }
    outputs.push(res)
    const reportStart = profiling ? performance.now() : 0
    onWriteGia?.(res)
    const reportMs = profiling ? performance.now() - reportStart : 0
    if (profiling) {
      itemProfiles.push({
        graphId: res.graphId,
        sourceIndex: idx,
        nodes: ir.nodes?.length ?? 0,
        variables: ir.variables?.length ?? 0,
        outputBytes: bytes.length,
        transformProfile,
        timingsMs: {
          transform: transformMs,
          write: writeMs,
          report: reportMs,
          total: performance.now() - itemStart
        }
      })
    }
  })
  if (profiling) {
    onProfile({
      irPath,
      inputBytes: Buffer.byteLength(source),
      documents: list.length,
      timingsMs: {
        read: readMs,
        parse: parseMs,
        total: performance.now() - totalStart
      },
      items: itemProfiles
    })
  }
  return outputs
}
