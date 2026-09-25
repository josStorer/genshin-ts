import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import * as tstl from 'typescript-to-lua'

import { getLuaDiagnostics } from './diagnostics.js'
import { luaFileKey, planLuaModules, type LuaDependencyState } from './incremental.js'
import {
  checkLuaModuleCycles,
  collectNativeLua,
  createLuaParseCache,
  type LuaParseCache
} from './native.js'
import { createLuaPlugin, diagnostic, entryCall, hooks } from './plugin.js'

export interface LuaBuildOptions {
  entries: string[]
  /** 记录各阶段耗时；默认关闭。 */
  profile?: boolean
  /** 额外检查整个 Lua 项目的 TS 类型；日常编译默认关闭，编辑器提示不受影响。 */
  typeCheck?: boolean
  additionalFiles?: string[]
  rootDir: string
  outDir: string
}
export interface LuaCompileProfile {
  timingsMs: Record<string, number>
  stats: {
    sourceFiles: number
    programFiles: number
    outputFiles: number
    outputBytes: number
    reusedTs: boolean
    parsedLuaFiles: number
    transpiledFiles: number
  }
}
export interface LuaBuildResult {
  profile?: LuaCompileProfile
  files: Map<string, string>
  diagnostics: readonly ts.Diagnostic[]
  entries: string[]
  dependencies: string[]
}
/** 一个 dev 会话一份缓存；不跨项目保存，也不写入磁盘。 */
export interface LuaCompileCache {
  lua: LuaParseCache
  program?: ts.Program
  sources: Map<string, ts.SourceFile>
  checked?: {
    key: string
    sources: readonly ts.SourceFile[]
    diagnostics: readonly ts.Diagnostic[]
    emitted: Map<string, string>
    dependencyState: LuaDependencyState
    sourceChecks: Map<
      string,
      { diagnostics: readonly ts.Diagnostic[]; rawRequires: ts.CallExpression[] }
    >
    printed: Map<string, { fileName: string; code: string }>
    nativeImports: Map<string, Set<string>>
    transpileDiagnostics: readonly ts.Diagnostic[]
  }
}
export function createLuaCompileCache(): LuaCompileCache {
  return { sources: new Map(), lua: createLuaParseCache() }
}
const posix = (name: string) => name.replace(/\\/g, '/')
export function formatLuaDiagnostics(diagnostics: readonly ts.Diagnostic[]) {
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (x) => x,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => '\n'
  })
}
export function hasLuaEntry(file: string) {
  if (!file.endsWith('.ts') || file.endsWith('.d.ts')) return false
  const text = fs.readFileSync(file, 'utf8')
  if (!text.includes('clientControlScript')) return false
  return !!entryCall(ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true))
}
function packageRoot() {
  let current = path.dirname(fileURLToPath(import.meta.url))
  while (!fs.existsSync(path.join(current, 'package.json'))) {
    const parent = path.dirname(current)
    if (parent === current) throw new Error('找不到 genshin-ts 安装目录。')
    current = parent
  }
  return current
}
/** 编译到内存；所有诊断通过后才由调用者写入输出目录。 */
export function compileLua(
  input: LuaBuildOptions,
  cache?: LuaCompileCache,
  onPrepared?: (dependencies: string[]) => void
): LuaBuildResult {
  const started = input.profile ? performance.now() : 0
  let previous = started
  const timingsMs: Record<string, number> = {}
  const mark = (name: string) => {
    if (!input.profile) return
    const now = performance.now()
    timingsMs[name] = now - previous
    previous = now
  }
  const luaCache = cache?.lua ?? createLuaParseCache()
  luaCache.used.clear()
  luaCache.parsed = 0
  const root = path.resolve(input.rootDir)
  const outDir = path.resolve(input.outDir)
  const sdkRoot = path.join(packageRoot(), 'dist/src/runtime')
  const globals = path.join(sdkRoot, 'lua-globals.d.ts')
  if (!fs.existsSync(globals)) throw new Error('Lua 类型文件尚未生成，请先运行 npm run build。')
  const options: tstl.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ['lib.es2022.d.ts'],
    types: [],
    strict: true,
    skipLibCheck: true,
    rootDir: root,
    outDir,
    luaTarget: tstl.LuaTarget.Lua53,
    luaLibImport: tstl.LuaLibImportKind.RequireMinimal,
    noHeader: true,
    noImplicitSelf: true
  }
  const configDiagnostics: ts.Diagnostic[] = []
  const configPath = ts.findConfigFile(
    path.dirname(path.resolve(input.entries[0] ?? root)),
    ts.sys.fileExists
  )
  if (configPath) {
    const read = ts.readConfigFile(configPath, ts.sys.readFile)
    if (read.error) configDiagnostics.push(read.error)
    else {
      const parsed = ts.parseJsonConfigFileContent(
        { ...read.config, files: [], include: [] },
        ts.sys,
        path.dirname(configPath),
        undefined,
        configPath
      )
      options.baseUrl = parsed.options.baseUrl
      options.paths = parsed.options.paths
      configDiagnostics.push(...parsed.errors.filter((d) => d.code !== 18002 && d.code !== 18003))
    }
  }
  const host = ts.createCompilerHost(options)
  const runtimeMap: Record<string, string> = {
    'genshin-ts/runtime/core': 'lua-core.d.ts',
    'genshin-ts/runtime/lua': 'lua.d.ts'
  }
  const virtual = new Map<string, string>()
  const originalRead = host.readFile.bind(host),
    originalExists = host.fileExists.bind(host)
  host.readFile = (file) => virtual.get(path.resolve(file)) ?? originalRead(file)
  host.fileExists = (file) => virtual.has(path.resolve(file)) || originalExists(file)
  const nextSources = new Map<string, ts.SourceFile>()
  let refreshSources = new Set<string>()
  host.getSourceFile = (file, version, onError) => {
    const text = host.readFile(file)
    if (text === undefined) return undefined
    const key = path.resolve(file)
    const previous = nextSources.get(key) ?? cache?.sources.get(key)
    const source =
      previous?.text === text && !refreshSources.has(luaFileKey(file))
        ? previous
        : ts.createSourceFile(file, text, version, true)
    nextSources.set(key, source)
    return source
  }
  // 每轮重新解析依赖，避免新增同名 TS/声明文件后仍命中旧的 Lua 路径。
  host.hasInvalidatedResolutions = () => true
  const resolutionCache = ts.createModuleResolutionCache(root, host.getCanonicalFileName, options)
  const resolveUncached = (name: string, from: string): ts.ResolvedModuleFull | undefined => {
    if (runtimeMap[name])
      return { resolvedFileName: path.join(sdkRoot, runtimeMap[name]), extension: ts.Extension.Dts }
    const resolved = ts.resolveModuleName(name, from, options, host, resolutionCache).resolvedModule
    if (resolved) return resolved
    if (!name.startsWith('.')) return undefined
    const native = path.resolve(path.dirname(from), name.endsWith('.lua') ? name : name + '.lua')
    if (!fs.existsSync(native)) return undefined
    const declaration = native.slice(0, -4) + '.d.ts'
    if (!fs.existsSync(declaration))
      virtual.set(declaration, 'declare const value: unknown; export = value;')
    return { resolvedFileName: declaration, extension: ts.Extension.Dts }
  }
  const resolvedModules = new Map<string, ts.ResolvedModuleFull | undefined>()
  const resolve = (name: string, from: string) => {
    const key = `${from}\0${name}`
    if (!resolvedModules.has(key)) resolvedModules.set(key, resolveUncached(name, from))
    return resolvedModules.get(key)
  }
  host.resolveModuleNames = (names, from) => names.map((name) => resolve(name, from))
  const additional = input.additionalFiles ?? []
  mark('setup')
  let program = ts.createProgram(
    [
      ...input.entries.map((x) => path.resolve(x)),
      ...additional.filter((x) => x.endsWith('.ts')),
      globals
    ],
    options,
    host,
    cache?.program
  )
  mark('programLoad')
  const cacheKey = JSON.stringify([
    options,
    program.getRootFileNames(),
    additional,
    !!input.typeCheck
  ])
  const oldCheck = cache?.checked
  let sources = program.getSourceFiles()
  const plan = planLuaModules(
    sources,
    resolve,
    oldCheck?.key === cacheKey ? oldCheck.dependencyState : undefined
  )
  refreshSources = new Set(
    sources
      .filter(
        (source) =>
          plan.affected.has(luaFileKey(source.fileName)) &&
          oldCheck?.dependencyState.sources.get(luaFileKey(source.fileName)) === source
      )
      .map((source) => luaFileKey(source.fileName))
  )
  if (refreshSources.size) {
    // TSTL 按 AST 节点缓存 self 调用方式；依赖类型变化时，受影响的使用者也要换新节点。
    program = ts.createProgram(program.getRootFileNames(), options, host, program)
    sources = program.getSourceFiles()
    plan.state.sources = new Map(sources.map((source) => [luaFileKey(source.fileName), source]))
  }
  if (cache) {
    cache.program = program
    cache.sources = nextSources
  }
  mark('affectedFiles')
  onPrepared?.(sources.map((source) => source.fileName))
  const checker = program.getTypeChecker()
  mark('typeChecker')
  const reuse =
    oldCheck?.key === cacheKey &&
    sources.length === oldCheck.sources.length &&
    sources.every((source, i) => source === oldCheck.sources[i])
      ? oldCheck
      : undefined
  const diagnostics: ts.Diagnostic[] = reuse
    ? [...configDiagnostics, ...reuse.diagnostics]
    : [
        ...configDiagnostics,
        ...(input.typeCheck
          ? ts.getPreEmitDiagnostics(program)
          : [
              ...program.getOptionsDiagnostics(),
              ...program.getGlobalDiagnostics(),
              ...program.getSyntacticDiagnostics()
            ])
      ]
  mark(input.typeCheck ? 'typeCheck' : 'syntaxCheck')
  const files = new Map<string, string>()
  const dependencies = new Set<string>(
    program
      .getSourceFiles()
      .map((source) => source.fileName)
      .filter((file) => !file.includes('/node_modules/') && !file.includes('\\node_modules\\'))
  )
  if (configPath) dependencies.add(configPath)
  const emitted = new Map<string, string>()
  const modules = program.getSourceFiles().filter((x) => !x.isDeclarationFile)
  const entryFiles = new Set(modules.filter((x) => entryCall(x)).map((x) => x.fileName))
  const targets = modules.filter((source) => plan.affected.has(luaFileKey(source.fileName)))
  const sourceChecks = new Map<
    string,
    { diagnostics: readonly ts.Diagnostic[]; rawRequires: ts.CallExpression[] }
  >()
  const printed = new Map<string, { fileName: string; code: string }>()
  const nativeImports = new Map<string, Set<string>>()
  let transpileDiagnostics: readonly ts.Diagnostic[] = reuse?.transpileDiagnostics ?? []
  for (const source of modules) {
    const key = luaFileKey(source.fileName)
    if (plan.affected.has(key)) continue
    const text = oldCheck?.printed.get(key)
    if (text) printed.set(key, text)
    nativeImports.set(key, oldCheck?.nativeImports.get(key) ?? new Set())
  }
  const modulePaths = new Map<string, string>()
  const modulePath = (filename: string) => {
    const cached = modulePaths.get(filename)
    if (cached !== undefined) return cached
    const relative = posix(path.relative(root, filename))
      .replace(/(?:\.d)?\.[cm]?[tj]s$/, '')
      .replace(/\.lua$/, '')
    if (relative === '..' || relative.startsWith('../') || path.isAbsolute(relative))
      throw new Error(`Lua 依赖必须位于 compileRoot 内：${filename}`)
    if (relative.startsWith('__gsts') || relative === 'lualib_bundle')
      throw new Error(`文件名 ${relative} 为编译器保留，请换一个名称。`)
    modulePaths.set(filename, relative)
    return relative
  }
  const availableModules = new Set(modules.map((x) => modulePath(x.fileName)))
  const collectNative = (file: string) => {
    collectNativeLua(
      file,
      root,
      files,
      dependencies,
      additional.length > 0,
      availableModules,
      luaCache
    )
  }
  const resolveLua = (name: string, from: string) => {
    if (name === 'genshin-ts/runtime/lua' || name === 'genshin-ts/runtime/core')
      return '__gsts_helpers'
    const resolved = resolve(name, from)
    if (!resolved)
      throw new Error(`无法解析 Lua 依赖 ${name}（来自 ${posix(path.relative(root, from))}）。`)
    const target = resolved.resolvedFileName
    if (entryFiles.has(target))
      throw new Error('挂载入口不能作为模块导入；请把共享函数移到普通 TS 模块。')
    if (target.endsWith('.d.ts')) {
      const native = target.slice(0, -5) + '.lua'
      if (!fs.existsSync(native))
        throw new Error(
          `带类型的 Lua 模块缺少同名 .lua 文件：${posix(path.relative(root, native))}`
        )
      const key = luaFileKey(from)
      let imports = nativeImports.get(key)
      if (!imports) nativeImports.set(key, (imports = new Set()))
      imports.add(native)
      collectNative(native)
      return modulePath(native)
    }
    return modulePath(target)
  }
  const rawRequires: ts.CallExpression[] = []
  for (const source of modules) {
    const key = luaFileKey(source.fileName)
    let checks = plan.affected.has(key) ? undefined : oldCheck?.sourceChecks.get(key)
    if (!checks) {
      const localDiagnostics = getLuaDiagnostics(source, checker)
      const fromOutput = path.relative(outDir, source.fileName)
      if (!fromOutput.startsWith('..') && !path.isAbsolute(fromOutput))
        localDiagnostics.push(
          diagnostic(source, 'Lua 源文件不能放在生成的 outDir/lua 目录中，请分开源码和产物。')
        )
      const calls: ts.CallExpression[] = []
      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const declaration = checker.getResolvedSignature(node)?.declaration
          if (
            declaration &&
            ts.isMethodSignature(declaration) &&
            ts.isIdentifier(declaration.name) &&
            declaration.name.text === 'require' &&
            declaration.getSourceFile().fileName.endsWith('lua-standard.d.ts')
          )
            calls.push(node)
        }
        ts.forEachChild(node, visit)
      }
      visit(source)
      checks = { diagnostics: localDiagnostics, rawRequires: calls }
    }
    sourceChecks.set(key, checks)
    if (!reuse) diagnostics.push(...checks.diagnostics)
    rawRequires.push(...checks.rawRequires)
  }
  mark('gstsCheck')
  if (!diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error)) {
    try {
      for (const imports of nativeImports.values()) for (const file of imports) collectNative(file)
      for (const call of rawRequires) {
        const argument = call.arguments[0]
        if (!argument || !ts.isStringLiteralLike(argument)) {
          if (!additional.length)
            diagnostics.push(
              diagnostic(
                call,
                '动态 require 需要在 gsts.config.ts 的 lua.include 中列出可能加载的文件。'
              )
            )
          continue
        }
        const name = argument.text.replace(/\.lua$/, '')
        if (
          name.startsWith('.') ||
          name.includes(':') ||
          name.includes('\\') ||
          name.split('/').includes('..')
        )
          throw new Error(`require 请使用从 compileRoot 开始的路径，不加 ./：${name}`)
        if (availableModules.has(name) || availableModules.has(name.replace(/\./g, '/'))) continue
        const literal = path.resolve(root, name + '.lua')
        collectNative(
          fs.existsSync(literal) ? literal : path.resolve(root, name.replace(/\./g, '/') + '.lua')
        )
      }
      for (const file of additional.filter((x) => x.endsWith('.lua'))) collectNative(file)
      mark('nativeInputs')
      if (reuse) {
        for (const [name, text] of reuse.emitted) {
          if (files.has(name)) throw new Error(`TS 与原生 Lua 的输出路径重复：${name}`)
          files.set(name, text)
          emitted.set(name, text)
        }
      } else {
        const result = new tstl.Transpiler().emit({
          program,
          sourceFiles: targets,
          plugins: [
            createLuaPlugin(resolveLua, (name, from) => {
              const target = resolve(name, from)?.resolvedFileName
              return (
                !!target &&
                !!program
                  .getSourceFile(target)
                  ?.statements.some((s) => ts.isExportAssignment(s) && s.isExportEquals)
              )
            }),
            {
              afterPrint(_program, _options, _host, results) {
                // 保存 require 路径改写前的文本；TSTL 后续仍处理完整集合并重建最小 lualib。
                for (const result of results)
                  printed.set(luaFileKey(result.fileName), {
                    fileName: result.fileName,
                    code: result.code
                  })
                results.splice(
                  0,
                  results.length,
                  ...modules.map((source) => {
                    const result = printed.get(luaFileKey(source.fileName))
                    if (!result) throw new Error(`缺少 Lua 模块转译结果：${source.fileName}`)
                    return { ...result, sourceFiles: [source] }
                  })
                )
              }
            }
          ],
          writeFile: (filename, data) => {
            const relative = posix(path.relative(outDir, filename))
            if (relative.startsWith('../') || path.isAbsolute(relative))
              throw new Error(`Lua 输出越过 outDir：${relative}`)
            // The official sandbox exposes traceback but not debug.getinfo. Keep Error usable.
            if (relative === 'lualib_bundle.lua')
              data = data
                .replaceAll(
                  'debug.getinfo(level, "f")',
                  '(debug.getinfo and debug.getinfo(level, "f"))'
                )
                .replaceAll('debug.getinfo(3, "f")', '(debug.getinfo and debug.getinfo(3, "f"))')
            if (files.has(relative)) throw new Error(`TS 与原生 Lua 的输出路径重复：${relative}`)
            files.set(relative, data)
            emitted.set(relative, data)
          }
        })
        transpileDiagnostics = [
          ...(oldCheck?.transpileDiagnostics.filter(
            (d) => d.file && !plan.affected.has(luaFileKey(d.file.fileName))
          ) ?? []),
          ...result.diagnostics
        ]
        diagnostics.push(...transpileDiagnostics)
      }
      mark('transpile')
      checkLuaModuleCycles(files, luaCache)
      mark('luaValidate')
    } catch (error) {
      diagnostics.push({
        category: ts.DiagnosticCategory.Error,
        code: 97002,
        file: undefined,
        start: undefined,
        length: undefined,
        messageText: error instanceof Error ? error.message : String(error)
      })
    }
  }
  if (diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error)) files.clear()
  else {
    if (cache)
      cache.checked = {
        key: cacheKey,
        sources,
        diagnostics: [...diagnostics],
        emitted,
        dependencyState: plan.state,
        sourceChecks,
        printed,
        nativeImports,
        transpileDiagnostics
      }
    const helpers = path.join(packageRoot(), 'dist/src/runtime/lua-assets/helpers.lua')
    files.set('__gsts_helpers.lua', fs.readFileSync(helpers, 'utf8'))
    const origins = new Map(
      modules.map((source) => [
        modulePath(source.fileName) + '.lua',
        posix(path.relative(root, source.fileName))
      ])
    )
    for (const [name, text] of files) {
      if (!name.endsWith('.lua')) continue
      const origin =
        name === '__gsts_helpers.lua'
          ? 'genshin-ts/runtime/lua'
          : name === 'lualib_bundle.lua'
            ? 'typescript-to-lua@1.34.0 (lualib)'
            : (origins.get(name) ?? name)
      files.set(
        name,
        `-- @gsts:lua\n-- 此文件由 GSTS 生成，请修改源文件后重新编译。\n-- 来源：${origin.replace(/[\r\n]/g, ' ')}\n${text.replace(/^-- @gsts:lua\r?\n/, '')}`
      )
    }
  }
  for (const name of luaCache.files.keys())
    if (!luaCache.used.has(name)) luaCache.files.delete(name)
  mark('package')
  return {
    ...(input.profile
      ? {
          profile: {
            timingsMs: { ...timingsMs, total: performance.now() - started },
            stats: {
              reusedTs: !!reuse,
              parsedLuaFiles: luaCache.parsed,
              transpiledFiles: reuse ? 0 : targets.length,
              sourceFiles: modules.length,
              programFiles: program.getSourceFiles().length,
              outputFiles: files.size,
              outputBytes: [...files.values()].reduce((n, text) => n + Buffer.byteLength(text), 0)
            }
          }
        }
      : {}),
    files,
    diagnostics: ts.sortAndDeduplicateDiagnostics(diagnostics),
    entries: [...entryFiles].map((x) => modulePath(x) + '.lua'),
    dependencies: [...dependencies]
  }
}
