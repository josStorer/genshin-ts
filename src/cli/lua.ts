import fs from 'node:fs'
import path from 'node:path'

import fg from 'fast-glob'
import ts from 'typescript'

import type { GstsConfig } from '../compiler/gsts_config.js'
import { resolveGilTarget } from './gil_paths.js'

/** Lua 独立编译与注入；没有 Lua 入口时不加载 TSTL。 */
export async function buildClientLua(
  cfgDir: string,
  cfg: GstsConfig,
  noinject = false,
  complete = true
) {
  const rootDir = path.resolve(cfgDir, cfg.compileRoot)
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
  const candidates = await fg(patterns, {
    cwd: rootDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.gs.ts'],
    onlyFiles: true
  })
  const entries = candidates.filter((file) => {
    const text = fs.readFileSync(file, 'utf8')
    if (!text.includes('clientControlScript')) return false
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
    return source.statements.some(
      (s) =>
        ts.isExportAssignment(s) &&
        ts.isCallExpression(s.expression) &&
        ts.isPropertyAccessExpression(s.expression.expression) &&
        s.expression.expression.name.text === 'clientControlScript'
    )
  })
  const outDir = path.resolve(cfgDir, cfg.outDir, 'lua')
  if (!entries.length && !fs.existsSync(path.join(outDir, '.gsts-lua-files.json')))
    return { dependencies: [] as string[], entries: [] as string[] }
  const [{ compileLua, formatLuaDiagnostics }, { writeLuaFiles, describeLuaConflicts }] =
    await Promise.all([import('../compiler/lua/build.js'), import('../compiler/lua/output.js')])
  const result = entries.length
    ? compileLua({ entries, rootDir, outDir })
    : { files: new Map<string, string>(), entries: [], dependencies: [], diagnostics: [] }
  if (result.diagnostics.length) console.log(formatLuaDiagnostics(result.diagnostics))
  if (result.diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error))
    throw new Error('Lua 编译失败；未更新本地产物和游戏文件。')
  const local = writeLuaFiles(outDir, result.files, complete)
  if (local.conflicts.length) throw new Error(describeLuaConflicts(local, false))
  console.log(
    `[Lua] 本地产物 ${result.files.size} 个；更新 ${local.written.length}，未改动 ${local.unchanged.length}，移除 ${local.removed.length}。`
  )
  if (cfg.inject?.mapId !== undefined && !noinject) {
    try {
      const target = resolveGilTarget(cfg.inject)
      const destination = path.join(target.saveLevelDir, String(target.mapId), 'external_lua_file')
      const injected = writeLuaFiles(destination, result.files, complete)
      if (injected.conflicts.length) throw new Error(describeLuaConflicts(injected, true))
      console.log(
        `[Lua] 注入完成：地图 ${target.mapId}；更新 ${injected.written.length}，未改动 ${injected.unchanged.length}，移除 ${injected.removed.length}。`
      )
    } catch (error) {
      throw new Error(
        `Lua 本地编译成功，但注入未完成。${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
  return { dependencies: result.dependencies, entries: result.entries }
}
