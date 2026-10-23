import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import * as tstl from 'typescript-to-lua'

import { initCliI18n, t, type Lang } from '../../i18n/index.js'
import { getLuaBuiltins } from './builtins.js'
import { luaDataModule, luaDataModules } from './data_modules.js'
import { localizeLuaTranspileDiagnostic, removeDuplicateTruthiness } from './diagnostic_messages.js'
import { getLuaDiagnostics } from './diagnostics.js'
import { analyzeLuaEntry } from './entry_analysis.js'
import { sharedEntryFile, sharedEntryModule } from './entry_shared.js'
import { luaFileKey, planLuaModules, type LuaDependencyState } from './incremental.js'
import { isNativeLuaDeclaration } from './native_declarations.js'
import {
  checkLuaModuleCycles,
  collectNativeLua,
  createLuaParseCache,
  type LuaParseCache
} from './native.js'
import { createLuaPlugin, diagnostic } from './plugin.js'
import { lowerPrivateFields } from './private_fields.js'
import { createBuildTimer, type BuildTimer } from './profile.js'
import { renderSignalKindsLua } from './signal_kinds.js'
import { packageLuaMaps } from './source_maps.js'
import { isNodeGraphEntry } from './syntax.js'
import { LocatedLuaError, withLuaErrorLocations } from './tstl_compat.js'

export interface LuaBuildOptions {
  sourceMap?: boolean
  /** 两侧共享关系的入口候选与 import 签名；普通函数体编辑不改变它。 */
  sharedProjectFiles?: string[]
  sharedProjectKey?: string
  lang?: Lang
  entries: string[]
  /** 记录各阶段耗时；默认关闭。 */
  profile?: boolean
  /** 额外检查整个 Lua 项目的 TS 类型；日常编译默认关闭，编辑器提示不受影响。 */
  typeCheck?: boolean
  /** dev 提供自上次调用以来完整的变化清单；省略时重新检查磁盘。 */
  changedFiles?: readonly string[]
  additionalFiles?: string[]
  rootDir: string
  outDir: string
}
/** Program 建好后即可交给节点图：Lua 依赖的源文件，以及其中误作模块导入的节点图入口。 */
export interface LuaPrepared {
  dependencies: string[]
  /** 节点图仍需编译这些入口；Lua 侧会对导入它们报错。 */
  graphEntries: string[]
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
    sourceReads: number
    resolvedDependencyFiles: number
    cycleChecks: number
    nameCheckedFiles: number
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
  hostState?: {
    key: string
    resolvedModules: Map<string, ts.ResolvedModuleFull | undefined>
    virtual: Map<string, string>
    resolutionCache: ts.ModuleResolutionCache
    knownFiles: Set<string>
  }
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
    printed: Map<string, { fileName: string; code: string; sourceMap?: string }>
    nativeImports: Map<string, Set<string>>
    transpileDiagnostics: readonly ts.Diagnostic[]
  }
}
export function createLuaCompileCache(): LuaCompileCache {
  return { sources: new Map(), lua: createLuaParseCache() }
}
// Always reject unresolved names/members, while leaving ordinary type compatibility to the editor.
// These are filtered from affected-file diagnostics, never a second project-wide typecheck.
const unresolvedNameCodes = new Set([
  2304, 2305, 2306, 2307, 2339, 2503, 2551, 2552, 2553, 2662, 2663, 2724, 2792, 18004
])
const posix = (name: string) => name.replace(/\\/g, '/')
export function formatLuaDiagnostics(diagnostics: readonly ts.Diagnostic[]) {
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (x) => x,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => '\n'
  })
}
function packageRoot() {
  let current = path.dirname(fileURLToPath(import.meta.url))
  while (!fs.existsSync(path.join(current, 'package.json'))) {
    const parent = path.dirname(current)
    if (parent === current) throw new Error(t('lua_installationMissing'))
    current = parent
  }
  return current
}
/** 编译到内存；所有诊断通过后才由调用者写入输出目录。 */
export function compileLua(
  input: LuaBuildOptions,
  cache?: LuaCompileCache,
  onPrepared?: (prepared: LuaPrepared) => void
): LuaBuildResult {
  if (input.lang) initCliI18n(input.lang)
  const timer = createBuildTimer(!!input.profile)
  const luaCache = cache?.lua ?? createLuaParseCache()
  luaCache.used.clear()
  luaCache.parsed = 0
  luaCache.cycleChecks = 0
  const resolved = resolveLuaHost(input, cache)
  timer.mark('setup')
  const prepared = prepareLuaProgram(input, resolved, timer, cache)
  onPrepared?.({
    dependencies: prepared.sources.map((source) => source.fileName),
    graphEntries: prepared.sources
      .filter((source) => !source.isDeclarationFile && isNodeGraphEntry(source))
      .map((source) => source.fileName)
  })
  const checked = diagnoseLua(input, resolved, prepared, timer)
  const context = { input, cache, timer, luaCache, resolved, prepared, checked }
  if (!checked.diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error)) {
    try {
      const resolveLua = collectNativeInputs(context)
      transpileLua(context, resolveLua)
      checkLuaModuleCycles(checked.files, luaCache)
      timer.mark('luaValidate')
    } catch (error) {
      checked.diagnostics.push(
        error instanceof LocatedLuaError
          ? { ...diagnostic(error.node, error.message), code: 97002 }
          : {
              category: ts.DiagnosticCategory.Error,
              code: 97002,
              file: undefined,
              start: undefined,
              length: undefined,
              messageText: error instanceof Error ? error.message : String(error)
            }
      )
    }
  }
  return packageLua(context)
}

function resolveLuaHost(input: LuaBuildOptions, cache?: LuaCompileCache) {
  const root = path.resolve(input.rootDir)
  const outDir = path.resolve(input.outDir)
  const sdkRoot = path.join(packageRoot(), 'dist/src/runtime')
  const globals = path.join(sdkRoot, 'lua_globals.d.ts')
  if (!fs.existsSync(globals)) throw new Error(t('lua_typesMissing'))
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
    noImplicitSelf: true,
    sourceMap: input.sourceMap ?? false
  }
  const configDiagnostics: ts.Diagnostic[] = []
  const configPath = ts.findConfigFile(
    path.dirname(path.resolve(input.entries[0] ?? root)),
    (file) => ts.sys.fileExists(file)
  )
  if (configPath) {
    const read = ts.readConfigFile(configPath, (file) => ts.sys.readFile(file))
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
  const additional = input.additionalFiles ?? []
  const roots = [
    ...input.entries.map((x) => path.resolve(x)),
    ...additional.filter((x) => x.endsWith('.ts')),
    globals
  ]
  const hostKey = JSON.stringify([options, roots, additional])
  const changes = input.changedFiles && new Set(input.changedFiles.map(luaFileKey))
  const oldHost = cache?.hostState
  const stableResolution = !!(
    changes &&
    oldHost?.key === hostKey &&
    input.changedFiles!.every(
      (file) =>
        oldHost.knownFiles.has(luaFileKey(file)) &&
        !oldHost.virtual.has(path.resolve(file)) &&
        !/\.json$/i.test(file) &&
        fs.existsSync(file)
    )
  )
  let sourceReads = 0
  const host = ts.createCompilerHost(options)
  const runtimeMap: Record<string, string> = {
    'genshin-ts/runtime/core': 'lua_core.d.ts',
    'genshin-ts/runtime/lua': 'lua.d.ts'
  }
  const virtual = new Map<string, string>(stableResolution ? oldHost?.virtual : undefined)
  const originalRead = host.readFile.bind(host),
    originalExists = host.fileExists.bind(host)
  host.readFile = (file) => virtual.get(path.resolve(file)) ?? originalRead(file)
  host.fileExists = (file) => virtual.has(path.resolve(file)) || originalExists(file)
  const nextSources = new Map<string, ts.SourceFile>()
  const refreshSources = new Set<string>()
  host.getSourceFile = (file, version) => {
    const key = path.resolve(file)
    const previous = nextSources.get(key) ?? cache?.sources.get(key)
    const canReuse = stableResolution && !changes.has(luaFileKey(file))
    const text = previous && canReuse ? previous.text : (sourceReads++, host.readFile(file))
    if (text === undefined) return undefined
    const source =
      previous?.text === text && !refreshSources.has(luaFileKey(file))
        ? previous
        : ts.createSourceFile(file, text, version, true)
    nextSources.set(key, source)
    return source
  }
  // 普通编辑沿用解析结果；新增、删除、配置变化或没有变化清单时重新解析。
  host.hasInvalidatedResolutions = () => !stableResolution
  const resolutionCache = stableResolution
    ? oldHost.resolutionCache
    : ts.createModuleResolutionCache(root, (file) => host.getCanonicalFileName(file), options)
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
  const resolvedModules = new Map<string, ts.ResolvedModuleFull | undefined>(
    stableResolution ? oldHost?.resolvedModules : undefined
  )
  if (changes)
    for (const key of resolvedModules.keys())
      if (changes.has(luaFileKey(key.slice(0, key.indexOf('\0'))))) resolvedModules.delete(key)
  const resolve = (name: string, from: string) => {
    const key = `${from}\0${name}`
    if (!resolvedModules.has(key)) resolvedModules.set(key, resolveUncached(name, from))
    return resolvedModules.get(key)
  }
  host.resolveModuleNames = (names, from) => names.map((name) => resolve(name, from))
  return {
    root,
    outDir,
    options,
    roots,
    additional,
    configPath,
    configDiagnostics,
    host,
    hostKey,
    stableResolution,
    resolve,
    resolvedModules,
    virtual,
    resolutionCache,
    refreshSources,
    get sourceReads() {
      return sourceReads
    }
  }
}

function prepareLuaProgram(
  input: LuaBuildOptions,
  resolved: ReturnType<typeof resolveLuaHost>,
  timer: BuildTimer,
  cache?: LuaCompileCache
) {
  const {
    host,
    roots,
    options,
    additional,
    stableResolution,
    resolve,
    refreshSources,
    hostKey,
    resolvedModules,
    virtual,
    resolutionCache
  } = resolved
  const { mark } = timer
  let program = ts.createProgram(roots, options, host, cache?.program)
  mark('programLoad')
  const cacheKey = JSON.stringify([
    options,
    program.getRootFileNames(),
    additional,
    !!input.typeCheck,
    input.sharedProjectKey
  ])
  const oldCheck = cache?.checked
  let sources = program.getSourceFiles()
  const plan = planLuaModules(
    sources,
    resolve,
    oldCheck?.key === cacheKey ? oldCheck.dependencyState : undefined,
    !stableResolution
  )
  const affectedSources = new Set(
    sources
      .filter(
        (source) =>
          plan.affected.has(luaFileKey(source.fileName)) &&
          oldCheck?.dependencyState.sources.get(luaFileKey(source.fileName)) === source
      )
      .map((source) => luaFileKey(source.fileName))
  )
  for (const key of affectedSources) refreshSources.add(key)
  if (refreshSources.size) {
    // TSTL 按 AST 节点缓存 self 调用方式；依赖类型变化时，受影响的使用者也要换新节点。
    program = ts.createProgram(program.getRootFileNames(), options, host, program)
    sources = program.getSourceFiles()
    plan.state.sources = new Map(sources.map((source) => [luaFileKey(source.fileName), source]))
  }
  if (cache) {
    cache.program = program
    cache.sources = new Map(sources.map((source) => [path.resolve(source.fileName), source]))
    cache.hostState = {
      key: hostKey,
      resolvedModules,
      virtual,
      resolutionCache,
      knownFiles: new Set(sources.map((source) => luaFileKey(source.fileName)))
    }
  }
  mark('affectedFiles')
  return { program, sources, cacheKey, oldCheck, plan }
}

function diagnoseLua(
  input: LuaBuildOptions,
  resolved: ReturnType<typeof resolveLuaHost>,
  prepared: ReturnType<typeof prepareLuaProgram>,
  timer: BuildTimer
) {
  const { root, outDir, configPath, configDiagnostics } = resolved
  const { program, sources, oldCheck, cacheKey, plan } = prepared
  const diagnosticContext = { program, project: { root, files: input.sharedProjectFiles } }
  const { mark } = timer
  const checker = program.getTypeChecker()
  const builtins = getLuaBuiltins(program)
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
  const entryFiles = new Set(
    modules.filter((x) => analyzeLuaEntry(x, program).model).map((x) => x.fileName)
  )
  const targets = modules.filter((source) => plan.affected.has(luaFileKey(source.fileName)))
  const sourceChecks = new Map<
    string,
    { diagnostics: readonly ts.Diagnostic[]; rawRequires: ts.CallExpression[] }
  >()
  const printed = new Map<string, { fileName: string; code: string; sourceMap?: string }>()
  const nativeImports = new Map<string, Set<string>>()
  const transpileDiagnostics: readonly ts.Diagnostic[] = reuse?.transpileDiagnostics ?? []
  for (const source of modules) {
    const key = luaFileKey(source.fileName)
    if (plan.affected.has(key)) continue
    const text = oldCheck?.printed.get(key)
    if (text) printed.set(key, text)
    const sharedKey = luaFileKey(sharedEntryFile(source.fileName, root))
    const shared = oldCheck?.printed.get(sharedKey)
    if (shared && analyzeLuaEntry(source, program).model?.shared.runtime)
      printed.set(sharedKey, shared)
    nativeImports.set(key, oldCheck?.nativeImports.get(key) ?? new Set())
  }
  const modulePath = (filename: string) => {
    const relative = posix(path.relative(root, filename))
      .replace(/(?:\.d)?\.[cm]?[tj]s$/, '')
      .replace(/\.lua$/, '')
    if (relative === '..' || relative.startsWith('../') || path.isAbsolute(relative))
      throw new Error(t('lua_dependencyOutsideRoot', { arg0: filename }))
    if (relative.startsWith('__gsts') || relative === 'lualib_bundle')
      throw new Error(t('lua_reservedFilename', { arg0: relative }))
    return relative
  }
  const availableModules = new Set(modules.map((x) => modulePath(x.fileName)))
  const rawRequires: ts.CallExpression[] = []
  let nameCheckedFiles = 0
  const declarations = program.getSourceFiles().filter(isNativeLuaDeclaration)
  for (const source of [...modules, ...declarations]) {
    const key = luaFileKey(source.fileName)
    let checks = plan.affected.has(key) ? undefined : oldCheck?.sourceChecks.get(key)
    if (!checks) {
      const localDiagnostics = [...getLuaDiagnostics(source, diagnosticContext)]
      if (!input.typeCheck && !source.isDeclarationFile) {
        nameCheckedFiles++
        localDiagnostics.push(
          ...program.getSemanticDiagnostics(source).filter((d) => unresolvedNameCodes.has(d.code))
        )
      }
      const fromOutput = path.relative(outDir, source.fileName)
      if (!fromOutput.startsWith('..') && !path.isAbsolute(fromOutput))
        localDiagnostics.push(diagnostic(source, t('lua_sourceInOutput')))
      const calls: ts.CallExpression[] = []
      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          if (builtins.member(node.expression) === 'require') calls.push(node)
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
  return {
    checker,
    reuse,
    diagnostics,
    files,
    dependencies,
    emitted,
    modules,
    entryFiles,
    targets,
    sourceChecks,
    printed,
    nativeImports,
    transpileDiagnostics,
    modulePath,
    availableModules,
    rawRequires,
    nameCheckedFiles
  }
}

type LuaBuildContext = {
  input: LuaBuildOptions
  cache?: LuaCompileCache
  timer: BuildTimer
  luaCache: LuaParseCache
  resolved: ReturnType<typeof resolveLuaHost>
  prepared: ReturnType<typeof prepareLuaProgram>
  checked: ReturnType<typeof diagnoseLua>
}

function collectNativeInputs({ resolved, prepared, checked, luaCache, timer }: LuaBuildContext) {
  const { root, resolve, additional } = resolved
  const {
    files,
    dependencies,
    availableModules,
    entryFiles,
    nativeImports,
    modulePath,
    diagnostics,
    rawRequires
  } = checked
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
    const dataModule = luaDataModule(name)
    if (dataModule) return `__gsts_data.${dataModule}`
    const resolved = resolve(name, from)
    if (
      name.startsWith('genshin-ts/') ||
      resolved?.resolvedFileName.replaceAll('\\', '/').includes('/node_modules/')
    )
      throw new Error(t('lua_packageUnavailable', { arg0: name }))
    if (!resolved)
      throw new Error(
        t('lua_unresolvedDependency', { arg0: name, arg1: posix(path.relative(root, from)) })
      )
    const target = resolved.resolvedFileName
    if (entryFiles.has(target)) {
      const source = prepared.program.getSourceFile(target)!
      return analyzeLuaEntry(source, prepared.program).model?.shared.runtime
        ? sharedEntryModule(modulePath(target))
        : undefined
    }
    if (target.endsWith('.d.ts')) {
      const native = target.slice(0, -5) + '.lua'
      if (!fs.existsSync(native))
        throw new Error(t('lua_nativeModuleMissing', { arg0: posix(path.relative(root, native)) }))
      const key = luaFileKey(from)
      let imports = nativeImports.get(key)
      if (!imports) nativeImports.set(key, (imports = new Set()))
      imports.add(native)
      collectNative(native)
      return modulePath(native)
    }
    return modulePath(target)
  }
  for (const imports of nativeImports.values()) for (const file of imports) collectNative(file)
  for (const call of rawRequires) {
    const argument = call.arguments[0]
    if (!argument || !ts.isStringLiteralLike(argument)) {
      if (!additional.length) diagnostics.push(diagnostic(call, t('lua_dynamicRequire')))
      continue
    }
    const name = argument.text.replace(/\.lua$/, '')
    if (
      name.startsWith('.') ||
      name.includes(':') ||
      name.includes('\\') ||
      name.split('/').includes('..')
    )
      throw new Error(t('lua_requireRootPath', { arg0: name }))
    if (availableModules.has(name) || availableModules.has(name.replace(/\./g, '/'))) continue
    const literal = path.resolve(root, name + '.lua')
    collectNative(
      fs.existsSync(literal) ? literal : path.resolve(root, name.replace(/\./g, '/') + '.lua')
    )
  }
  for (const file of additional.filter((x) => x.endsWith('.lua'))) collectNative(file)
  timer.mark('nativeInputs')
  return resolveLua
}

function transpileLua(
  { resolved, prepared, checked, timer }: LuaBuildContext,
  resolveLua: ReturnType<typeof collectNativeInputs>
) {
  const { outDir, resolve, root } = resolved
  const { program, oldCheck, plan } = prepared
  const { reuse, files, emitted, targets, printed, modules, diagnostics } = checked
  if (reuse) {
    for (const [name, text] of reuse.emitted) {
      if (files.has(name)) throw new Error(t('lua_outputCollision', { arg0: name }))
      files.set(name, text)
      emitted.set(name, text)
    }
  } else {
    const plugin = createLuaPlugin(
      resolveLua,
      (name, from) => {
        const target = resolve(name, from)?.resolvedFileName
        return (
          !!target &&
          !!program
            .getSourceFile(target)
            ?.statements.some((s) => ts.isExportAssignment(s) && s.isExportEquals)
        )
      },
      root
    )
    const result = new tstl.Transpiler().emit({
      program,
      sourceFiles: targets,
      customTransformers: { before: [lowerPrivateFields(program)] },
      plugins: [
        plugin,
        withLuaErrorLocations(plugin),
        {
          afterPrint(_program, _options, _host, results) {
            // 保存 require 路径改写前的文本；TSTL 后续仍处理完整集合并重建最小 lualib。
            for (const result of results)
              printed.set(luaFileKey(result.fileName), {
                fileName: result.fileName,
                code: result.code,
                sourceMap: result.sourceMap
              })
            results.splice(
              0,
              results.length,
              ...modules.flatMap((source) => {
                const names = [source.fileName]
                if (analyzeLuaEntry(source, program).model?.shared.runtime)
                  names.push(sharedEntryFile(source.fileName, root))
                return names.map((name) => {
                  const result = printed.get(luaFileKey(name))
                  if (!result) throw new Error(t('lua_transpileResultMissing', { arg0: name }))
                  return { ...result, sourceFiles: [source] }
                })
              })
            )
          }
        }
      ],
      writeFile: (filename, data) => {
        const relative = posix(path.relative(outDir, filename))
        if (relative.startsWith('../') || path.isAbsolute(relative))
          throw new Error(t('lua_outputOutsideOutDir', { arg0: relative }))
        // The official sandbox exposes traceback but not debug.getinfo. Keep Error usable.
        if (relative === 'lualib_bundle.lua')
          data = data
            .replaceAll(
              'debug.getinfo(level, "f")',
              '(debug.getinfo and debug.getinfo(level, "f"))'
            )
            .replaceAll('debug.getinfo(3, "f")', '(debug.getinfo and debug.getinfo(3, "f"))')
        if (files.has(relative)) throw new Error(t('lua_outputCollision', { arg0: relative }))
        files.set(relative, data)
        emitted.set(relative, data)
      }
    })
    checked.transpileDiagnostics = [
      ...(oldCheck?.transpileDiagnostics.filter(
        (d) => d.file && !plan.affected.has(luaFileKey(d.file.fileName))
      ) ?? []),
      ...result.diagnostics.map(localizeLuaTranspileDiagnostic)
    ]
    diagnostics.push(...checked.transpileDiagnostics)
  }
  timer.mark('transpile')
  // 增量编译会复用未改动模块的文本；从最终引用集合收集数据模块，类型导入不产生文件。
  const dataReferences = new Set<string>()
  for (const text of files.values())
    for (const match of text.matchAll(/"__gsts_data\.([A-Za-z_][\w]*)(?:\.([A-Za-z_][\w]*))?"/g))
      if (luaDataModules.some((name) => name === match[1]))
        dataReferences.add(match[2] ? `${match[1]}/${match[2]}` : match[1])
  for (const name of dataReferences) {
    files.set(
      `__gsts_data/${name}.lua`,
      fs.readFileSync(
        path.join(packageRoot(), 'dist/src/runtime/lua_assets/data_modules', name + '.lua'),
        'utf8'
      )
    )
  }
}

function packageLua({
  input,
  cache,
  timer,
  luaCache,
  resolved,
  prepared,
  checked
}: LuaBuildContext): LuaBuildResult {
  const { sources, cacheKey, plan, program } = prepared
  const {
    diagnostics,
    files,
    dependencies,
    emitted,
    sourceChecks,
    printed,
    nativeImports,
    transpileDiagnostics,
    modules,
    modulePath,
    entryFiles,
    reuse,
    targets
  } = checked
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
    const helpers = path.join(packageRoot(), 'dist/src/runtime/lua_assets/helpers.lua')
    files.set('__gsts_helpers.lua', fs.readFileSync(helpers, 'utf8'))
    files.set('__gsts_signal_kinds.lua', renderSignalKindsLua())
    for (const [name, text] of files) {
      if (!name.endsWith('.lua')) continue
      files.set(name, `-- @gsts:lua\n${text.replace(/^-- @gsts:lua\r?\n/, '')}`)
    }
    if (input.sourceMap) packageLuaMaps(files, input.rootDir, input.outDir)
  }
  for (const name of luaCache.files.keys())
    if (!luaCache.used.has(name)) luaCache.files.delete(name)
  if (cache?.hostState)
    for (const file of dependencies) cache.hostState.knownFiles.add(luaFileKey(file))
  timer.mark('package')
  return {
    ...(input.profile
      ? {
          profile: {
            timingsMs: timer.snapshot(),
            stats: {
              sourceReads: resolved.sourceReads,
              nameCheckedFiles: checked.nameCheckedFiles,
              resolvedDependencyFiles: plan.resolvedFiles,
              cycleChecks: luaCache.cycleChecks,
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
    diagnostics: ts.sortAndDeduplicateDiagnostics(removeDuplicateTruthiness(diagnostics)),
    entries: [...entryFiles].map((x) => modulePath(x) + '.lua'),
    dependencies: [...dependencies]
  }
}
