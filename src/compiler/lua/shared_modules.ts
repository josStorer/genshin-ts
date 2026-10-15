import path from 'node:path'

import ts from 'typescript'

import { t } from '../../i18n/index.js'
import type { LuaDiagnosticContext } from './diagnostic_context.js'
import { analyzeLuaEntry } from './entry_analysis.js'
import { luaFileKey } from './incremental.js'
import { diagnostic, entryCall, isNodeGraphEntry } from './syntax.js'

const indexes = new WeakMap<LuaDiagnosticContext, Set<string>>()
/** 编辑器/lint 显式发现项目；构建已有配置，直接传入对应范围。 */
export function resolveSharedProject(
  source: ts.SourceFile,
  program: ts.Program
): LuaDiagnosticContext['project'] {
  let root = path.dirname(source.fileName)
  let project: string | undefined
  let configFile: string | undefined
  while (true) {
    configFile = ['gsts.config.ts', 'gsts.config.mts', 'gsts.config.js']
      .map((name) => path.join(root, name))
      .find((file) => ts.sys.fileExists(file))
    if (configFile) {
      project = root
      break
    }
    if (ts.sys.fileExists(path.join(root, 'package.json'))) break
    const parent = path.dirname(root)
    if (parent === root) break
    root = parent
  }
  root = project ?? program.getCompilerOptions().rootDir ?? path.dirname(source.fileName)
  let entries = ['**/*']
  const excluded = ['**/node_modules/**', '**/.git/**', '**/.tmp/**']
  if (configFile) {
    const config = ts.createSourceFile(
      configFile,
      ts.sys.readFile(configFile)!,
      ts.ScriptTarget.Latest,
      true
    )
    const inspect = (node: ts.Node) => {
      if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name)) {
        const value = node.initializer
        if (node.name.text === 'compileRoot' && ts.isStringLiteralLike(value))
          root = path.resolve(project!, value.text)
        if (node.name.text === 'outDir' && ts.isStringLiteralLike(value))
          excluded.push(path.resolve(project!, value.text) + '/**')
        if (
          ['entries', 'exclude'].includes(node.name.text) &&
          ts.isArrayLiteralExpression(value) &&
          value.elements.every(ts.isStringLiteralLike)
        ) {
          const values = value.elements.map((item) => (item as ts.StringLiteral).text)
          if (node.name.text === 'entries') entries = values
          else
            excluded.push(...values.map((value) => (value.includes('*') ? value : value + '/**')))
        }
      }
      ts.forEachChild(node, inspect)
    }
    inspect(config)
  }
  excluded.push(...entries.filter((entry) => entry.startsWith('!')).map((entry) => entry.slice(1)))
  entries = entries
    .filter((entry) => !entry.startsWith('!'))
    .map((entry) =>
      ts.sys.directoryExists(path.resolve(root, entry)) ? entry.replace(/\/$/, '') + '/**/*' : entry
    )
  return { root, files: ts.sys.readDirectory(root, ['.ts', '.tsx', '.mts'], excluded, entries) }
}

/** 沿两类入口的实际 import/re-export 找交集；缓存只属于传入的上下文。 */
function sharedFiles(context: LuaDiagnosticContext) {
  const previous = indexes.get(context)
  if (previous) return previous
  const { program, project } = context
  const shared = new Set<string>()
  indexes.set(context, shared)
  const sources = new Map(program.getSourceFiles().map((file) => [luaFileKey(file.fileName), file]))
  const read = (file: string) => {
    const key = luaFileKey(file)
    let source = sources.get(key)
    if (!source) {
      const text = ts.sys.readFile(file)
      if (text === undefined) return undefined
      source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
      sources.set(key, source)
    }
    return source
  }
  const candidates =
    project.files ??
    ts.sys.readDirectory(
      project.root,
      ['.ts', '.tsx', '.mts'],
      ['**/node_modules/**', '**/.git/**', '**/.tmp/**'],
      ['**/*']
    )
  const graphRoots: ts.SourceFile[] = [],
    luaRoots: ts.SourceFile[] = []
  for (const file of candidates) {
    if (file.endsWith('.d.ts')) continue
    const source = read(file)
    if (!source) continue
    // 跨 tsconfig 尚未进入 Program 的文件只做发现；已有类型信息的入口读取公共模型。
    const entry =
      program.getSourceFile(source.fileName) === source
        ? analyzeLuaEntry(source, program).model
        : entryCall(source)
    if (entry) luaRoots.push(source)
    if (isNodeGraphEntry(source)) graphRoots.push(source)
  }
  if (!luaRoots.length || !graphRoots.length) return shared
  const options = {
    ...program.getCompilerOptions(),
    moduleResolution: ts.ModuleResolutionKind.Bundler
  }
  function reachable(roots: ts.SourceFile[]) {
    const seen = new Set<string>()
    const visit = (source: ts.SourceFile) => {
      const key = luaFileKey(source.fileName)
      if (seen.has(key) || source.isDeclarationFile) return
      seen.add(key)
      for (const statement of source.statements) {
        if (
          !(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) ||
          !statement.moduleSpecifier ||
          !ts.isStringLiteralLike(statement.moduleSpecifier)
        )
          continue
        if (
          (ts.isImportDeclaration(statement) && statement.importClause?.isTypeOnly) ||
          (ts.isExportDeclaration(statement) && statement.isTypeOnly)
        )
          continue
        const target = ts.resolveModuleName(
          statement.moduleSpecifier.text,
          source.fileName,
          options,
          ts.sys
        ).resolvedModule
        if (!target || target.isExternalLibraryImport) continue
        const imported = read(target.resolvedFileName)
        if (imported) visit(imported)
      }
    }
    roots.forEach(visit)
    return seen
  }
  const graph = reachable(graphRoots)
  for (const file of reachable(luaRoots)) if (graph.has(file)) shared.add(file)
  return shared
}

/** 可从任意一侧的 Program 调用，错误定位在共享源码上，局部同名变量不受影响。 */
export function getSharedModuleDiagnostics(
  source: ts.SourceFile,
  context: LuaDiagnosticContext
): ts.Diagnostic[] {
  const { program } = context
  if (source.isDeclarationFile || !sharedFiles(context).has(luaFileKey(source.fileName))) return []
  const checker = program.getTypeChecker()
  const diagnostics: ts.Diagnostic[] = []
  const add = (node: ts.Node, key: 'lua_sharedBigint' | 'lua_sharedApi') =>
    diagnostics.push({ ...diagnostic(node, t(key)), source: 'lua-shared-module' })
  const visit = (node: ts.Node) => {
    if (ts.isBigIntLiteral(node)) add(node, 'lua_sharedBigint')
    if (
      ts.isImportDeclaration(node) &&
      !node.importClause?.isTypeOnly &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      const name = node.moduleSpecifier.text
      if (name.startsWith('genshin-ts/runtime/')) {
        const bindings = node.importClause?.namedBindings
        const neutral = /^genshin-ts\/runtime\/(core|signal_definition)(?:\.js)?$/.test(name)
        if (!neutral || !bindings || !ts.isNamedImports(bindings)) add(node, 'lua_sharedApi')
        else
          for (const item of bindings.elements)
            if (!item.isTypeOnly && (item.propertyName ?? item.name).text !== 'defineSignal')
              add(item, 'lua_sharedApi')
      }
    }
    if (ts.isIdentifier(node)) {
      const symbol = checker.getSymbolAtLocation(node)
      const declarations = symbol?.declarations ?? []
      const hostGlobal = declarations.some((declaration) =>
        /[/\\]runtime[/\\](?:server_globals|client_globals|lua_globals)(?:\.global)?\.d\.ts$/.test(
          declaration.getSourceFile().fileName
        )
      )
      if (hostGlobal && node.text !== 'console') add(node, 'lua_sharedApi')
      if (
        node.text === 'BigInt' &&
        declarations.some((declaration) => declaration.getSourceFile().hasNoDefaultLib)
      )
        add(node, 'lua_sharedBigint')
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return diagnostics
}
