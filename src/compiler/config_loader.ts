import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { build } from 'esbuild'

import type { GstsConfig } from './gsts_config.js'

let configBundleId = 0

export function existsFile(p: string) {
  try {
    return fs.statSync(p).isFile()
  } catch {
    return false
  }
}

export function existsDir(p: string) {
  try {
    return fs.statSync(p).isDirectory()
  } catch {
    return false
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string')
}

function isGstsConfig(v: unknown): v is GstsConfig {
  if (!isRecord(v)) return false
  if (typeof v.compileRoot !== 'string') return false
  if (!isStringArray(v.entries) || v.entries.length === 0) return false
  if (typeof v.outDir !== 'string') return false
  return true
}

async function loadViaImport(configPath: string): Promise<unknown> {
  const mod = (await import(pathToFileURL(configPath).href)) as unknown
  return isRecord(mod) && 'default' in mod ? ((mod as { default?: unknown }).default ?? mod) : mod
}

async function loadViaEsbuild(configPath: string): Promise<unknown> {
  const configDir = path.dirname(configPath)
  const entrySource = 'gsts-config-loader-entry.mjs'
  const configSpecifier = `./${path.basename(configPath).replaceAll('\\', '/')}`
  const result = await build({
    absWorkingDir: configDir,
    stdin: {
      contents: [
        `import { writeFileSync as writeGstsConfigResult } from 'node:fs'`,
        `import * as configModule from ${JSON.stringify(configSpecifier)}`,
        `const config = configModule && typeof configModule === 'object' && 'default' in configModule`,
        `  ? (configModule.default ?? configModule)`,
        `  : configModule`,
        `writeGstsConfigResult(3, JSON.stringify(config))`
      ].join('\n'),
      resolveDir: configDir,
      sourcefile: entrySource,
      loader: 'js'
    },
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    target: `node${process.versions.node.split('.')[0]}`,
    sourcemap: 'inline',
    sourcesContent: true,
    logLevel: 'silent'
  })
  const output = result.outputFiles[0]
  if (!output) throw new Error('[error] esbuild did not produce a config module')

  const tempBundle = path.join(
    configDir,
    `.gsts-config-${process.pid}-${Date.now()}-${configBundleId++}.mjs`
  )
  fs.writeFileSync(tempBundle, output.contents, { flag: 'wx' })
  try {
    const executed = spawnSync(process.execPath, ['--enable-source-maps', tempBundle], {
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe', 'pipe']
    })
    if (executed.error) throw executed.error
    if (executed.status !== 0) {
      const msg = (executed.stderr || executed.stdout || '').trim()
      throw new Error(msg || `exit code ${String(executed.status)}`)
    }
    const serialized = executed.output[3]
    if (typeof serialized !== 'string' || !serialized) {
      throw new Error('[error] config process produced no result')
    }

    return JSON.parse(serialized)
  } finally {
    try {
      fs.unlinkSync(tempBundle)
    } catch {
      // ignore
    }
  }
}

export async function loadGstsConfig(configPath: string): Promise<GstsConfig> {
  const resolvedPath = path.resolve(configPath)
  const ext = path.extname(resolvedPath).toLowerCase()
  const isTs = ext === '.ts' || ext === '.mts' || ext === '.cts'
  const exported = isTs ? await loadViaEsbuild(resolvedPath) : await loadViaImport(resolvedPath)

  if (!isGstsConfig(exported)) {
    throw new Error('[error] config must provide compileRoot, entries, outDir')
  }
  return exported
}
