import { getLuaDiagnostics } from './diagnostics.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import * as tstl from 'typescript-to-lua'
import { createLuaPlugin, diagnostic, entryCall, hooks } from './plugin.js'

export interface LuaBuildOptions { entries: string[]; rootDir: string; outDir: string }
export interface LuaBuildResult { files: Map<string, string>; diagnostics: readonly ts.Diagnostic[]; entries: string[]; dependencies: string[] }
const posix = (name: string) => name.replace(/\\/g, '/')
export function formatLuaDiagnostics(diagnostics: readonly ts.Diagnostic[]) {
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: x => x, getCurrentDirectory: () => process.cwd(), getNewLine: () => '\n' })
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
export function compileLua(input: LuaBuildOptions): LuaBuildResult {
  const root = path.resolve(input.rootDir)
  const outDir = path.resolve(input.outDir)
  const sdkRoot = path.join(packageRoot(), 'dist/src/runtime')
  const globals = path.join(sdkRoot, 'lua-globals.d.ts')
  if (!fs.existsSync(globals)) throw new Error('Lua 类型文件尚未生成，请先运行 npm run build。')
  const options: tstl.CompilerOptions = {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ['lib.es2022.d.ts'], types: [], strict: true, skipLibCheck: true, rootDir: root, outDir,
    luaTarget: tstl.LuaTarget.Lua53, luaLibImport: tstl.LuaLibImportKind.Require, noHeader: true,
    noImplicitSelf: false
  }
  const host = ts.createCompilerHost(options)
  const runtimeMap: Record<string, string> = {
    'genshin-ts/runtime/core': 'lua-core.d.ts', 'genshin-ts/runtime/lua': 'lua.d.ts'
  }
  const resolve = (name: string, from: string) => runtimeMap[name]
    ? { resolvedFileName: path.join(sdkRoot, runtimeMap[name]), extension: ts.Extension.Dts }
    : ts.resolveModuleName(name, from, options, host).resolvedModule
  host.resolveModuleNames = (names, from) => names.map(name => resolve(name, from))
  const program = ts.createProgram([...input.entries.map(x => path.resolve(x)), globals], options, host)
  const checker = program.getTypeChecker()
  const diagnostics: ts.Diagnostic[] = [...ts.getPreEmitDiagnostics(program)]
  const files = new Map<string, string>()
  const dependencies = new Set<string>()
  const graph = new Map<string, { target: string; node: ts.Node }[]>()
  const modules = program.getSourceFiles().filter(x => !x.isDeclarationFile)
  const entryFiles = new Set(modules.filter(x => entryCall(x)).map(x => x.fileName))
  const modulePath = (filename: string) => {
    const relative = posix(path.relative(root, filename)).replace(/(?:\.d)?\.[cm]?[tj]s$/, '').replace(/\.lua$/, '')
    if (relative === '..' || relative.startsWith('../') || path.isAbsolute(relative)) throw new Error(`Lua 依赖必须位于 compileRoot 内：${filename}`)
    if (relative.startsWith('__gsts') || relative === 'lualib_bundle') throw new Error(`文件名 ${relative} 为编译器保留，请换一个名称。`)
    return relative
  }
  const resolveLua = (name: string, from: string) => {
    if (name === 'genshin-ts/runtime/lua' || name === 'genshin-ts/runtime/core') return '__gsts_helpers'
    const resolved = resolve(name, from)
    if (!resolved) throw new Error(`无法解析 Lua 依赖 ${name}（来自 ${posix(path.relative(root, from))}）。`)
    const target = resolved.resolvedFileName
    if (entryFiles.has(target)) throw new Error('挂载入口不能作为模块导入；请把共享函数移到普通 TS 模块。')
    if (target.endsWith('.d.ts')) {
      const native = target.slice(0, -5) + '.lua'
      if (!fs.existsSync(native)) throw new Error(`带类型的 Lua 模块缺少同名 .lua 文件：${posix(path.relative(root, native))}`)
      dependencies.add(native)
      files.set(modulePath(native) + '.lua', fs.readFileSync(native, 'utf8').replace(/^\uFEFF/, ''))
      return modulePath(native)
    }
    return modulePath(target)
  }
  for (const source of modules) {
    dependencies.add(source.fileName)
    const edges: { target: string; node: ts.Node }[] = []
    graph.set(source.fileName, edges)
    diagnostics.push(...getLuaDiagnostics(source, checker))
    const visit = (node: ts.Node) => {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = ts.isImportDeclaration(node) ? node.importClause : undefined
        const typeOnly = ts.isExportDeclaration(node) ? node.isTypeOnly : clause?.isTypeOnly || clause?.namedBindings && ts.isNamedImports(clause.namedBindings) && !clause.name && clause.namedBindings.elements.every(e => e.isTypeOnly)
        if (!typeOnly) {
          const target = resolve(node.moduleSpecifier.text, source.fileName)?.resolvedFileName
          if (target && !target.endsWith('.d.ts')) edges.push({ target, node })
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  const active: string[] = [], done = new Set<string>()
  const checkCycle = (file: string) => {
    if (done.has(file)) return
    active.push(file)
    for (const edge of graph.get(file) ?? []) {
      if (active.includes(edge.target)) diagnostics.push(diagnostic(edge.node, `官方 require 不支持循环加载：${[...active.slice(active.indexOf(edge.target)), edge.target].map(x => posix(path.relative(root, x))).join(' → ')}。请提取共同依赖；仅类型引用请用 import type。`))
      else checkCycle(edge.target)
    }
    active.pop(); done.add(file)
  }
  for (const source of modules) checkCycle(source.fileName)
  if (!diagnostics.some(d => d.category === ts.DiagnosticCategory.Error)) {
    try {
      const result = new tstl.Transpiler().emit({ program, sourceFiles: modules, plugins: [createLuaPlugin(resolveLua)], writeFile: (filename, data) => {
        const relative = posix(path.relative(outDir, filename))
        if (relative.startsWith('../') || path.isAbsolute(relative)) throw new Error(`Lua 输出越过 outDir：${relative}`)
        files.set(relative, data)
      } })
      diagnostics.push(...result.diagnostics)
    } catch (error) {
      diagnostics.push({ category: ts.DiagnosticCategory.Error, code: 97002, file: undefined, start: undefined, length: undefined, messageText: error instanceof Error ? error.message : String(error) })
    }
  }
  if (diagnostics.some(d => d.category === ts.DiagnosticCategory.Error)) files.clear()
  else {
    const helpers = path.join(packageRoot(), 'dist/src/runtime/lua-assets/helpers.lua')
    files.set('__gsts_helpers.lua', fs.readFileSync(helpers, 'utf8'))
    for (const [name, text] of files) if (name.endsWith('.lua')) files.set(name, `-- @gsts:lua\n-- GSTS generated: ${name}\n${text.replace(/^-- @gsts:lua\r?\n/, '')}`)
  }
  return { files, diagnostics, entries: [...entryFiles].map(x => modulePath(x) + '.lua'), dependencies: [...dependencies] }
}
