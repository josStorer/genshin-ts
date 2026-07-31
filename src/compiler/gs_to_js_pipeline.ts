import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import { build, type Metafile } from 'esbuild'

function isPathInside(root: string, target: string): boolean {
  const rel = path.relative(root, target)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

function validateRuntimeImports(rootDir: string, metafile: Metafile) {
  for (const [outputPath, output] of Object.entries(metafile.outputs)) {
    if (!outputPath.endsWith('.js')) continue
    const outputFile = path.resolve(rootDir, outputPath)
    for (const imported of output.imports) {
      if (!imported.path.startsWith('.')) continue
      const cleanSpec = imported.path.split(/[?#]/, 1)[0]
      const target = path.resolve(path.dirname(outputFile), cleanSpec)
      if (fs.existsSync(target)) continue
      throw new Error(
        `[error] compiled runtime dependency not found: ${outputFile} -> ${imported.path} -> ${target}`
      )
    }
  }
}

export function resolveGsJsOutputPath(gsFile: string): string {
  if (!/\.gs\.ts$/i.test(gsFile)) {
    throw new Error(`[error] expected .gs.ts module: ${gsFile}`)
  }
  return gsFile.replace(/\.gs\.ts$/i, '.gs.js')
}

export type GsToJsCompileProfile = {
  stats: {
    modules: number
    inputBytes: number
    outputBytes: number
    sourceMapBytes: number
  }
  timingsMs: {
    prepare: number
    compile: number
    validate: number
    total: number
  }
}

export type GsToJsCompileResult = {
  outFiles: string[]
  sourceMapFiles: string[]
  profile?: GsToJsCompileProfile
}

export async function compileGsModulesToJs(params: {
  moduleFiles: string[]
  rootDir: string
  profile?: boolean
}): Promise<GsToJsCompileResult> {
  const profiling = params.profile === true
  const totalStart = profiling ? performance.now() : 0
  const prepareStart = totalStart
  const rootDir = path.resolve(params.rootDir)
  const moduleFiles = [...new Set(params.moduleFiles.map((file) => path.resolve(file)))].sort(
    (a, b) => a.localeCompare(b)
  )
  if (!moduleFiles.length) return { outFiles: [], sourceMapFiles: [] }

  for (const file of moduleFiles) {
    if (!isPathInside(rootDir, file)) {
      throw new Error(`[error] generated module is outside output directory: ${file}`)
    }
    if (!fs.existsSync(file)) throw new Error(`[error] generated module not found: ${file}`)
    if (!/\.gs\.ts$/i.test(file)) throw new Error(`[error] expected .gs.ts module: ${file}`)
  }

  const outFiles = moduleFiles.map(resolveGsJsOutputPath)
  const sourceMapFiles = outFiles.map((file) => `${file}.map`)
  const prepareMs = profiling ? performance.now() - prepareStart : 0
  const compileStart = profiling ? performance.now() : 0
  const buildResult = await build({
    absWorkingDir: rootDir,
    entryPoints: moduleFiles,
    outbase: rootDir,
    outdir: rootDir,
    entryNames: '[dir]/[name]',
    bundle: false,
    platform: 'node',
    format: 'esm',
    target: `node${process.versions.node.split('.')[0]}`,
    sourcemap: 'linked',
    sourcesContent: true,
    charset: 'utf8',
    metafile: true,
    logLevel: 'silent'
  })
  const compileMs = profiling ? performance.now() - compileStart : 0

  const validateStart = profiling ? performance.now() : 0
  for (const file of [...outFiles, ...sourceMapFiles]) {
    if (!fs.existsSync(file)) {
      throw new Error(`[error] esbuild did not produce expected output: ${file}`)
    }
  }
  validateRuntimeImports(rootDir, buildResult.metafile)
  const validateMs = profiling ? performance.now() - validateStart : 0

  return {
    outFiles,
    sourceMapFiles,
    ...(profiling
      ? {
          profile: {
            stats: {
              modules: moduleFiles.length,
              inputBytes: moduleFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0),
              outputBytes: outFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0),
              sourceMapBytes: sourceMapFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0)
            },
            timingsMs: {
              prepare: prepareMs,
              compile: compileMs,
              validate: validateMs,
              total: performance.now() - totalStart
            }
          }
        }
      : {})
  }
}
