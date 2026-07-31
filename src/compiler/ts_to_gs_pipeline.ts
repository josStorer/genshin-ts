import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import fg from 'fast-glob'
import ts from 'typescript'

import { existsDir, existsFile, loadGstsConfig } from './config_loader.js'
import type { GstsConfig } from './gsts_config.js'
import { hasNodeGraphEntryCall, transformToGs } from './ts_to_gs_transform/index.js'
import { isServerOnCall } from './ts_to_gs_transform/matcher.js'

function toPosixPath(p: string): string {
  return p.replace(/\\/g, '/')
}

function hasGlobMeta(p: string): boolean {
  return /[*?[\]{}]/.test(p)
}

function isEligibleInputTsFile(p: string): boolean {
  if (!p.endsWith('.ts')) return false
  if (p.endsWith('.d.ts')) return false
  if (p.endsWith('.gs.ts')) return false
  return true
}

function normForMap(p: string): string {
  const abs = path.resolve(p).replace(/\\/g, '/')
  return ts.sys.useCaseSensitiveFileNames ? abs : abs.toLowerCase()
}

function isPathInside(root: string, target: string): boolean {
  const rel = path.relative(root, target)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

function isTypeOnlyExport(node: ts.ExportDeclaration): boolean {
  if (node.isTypeOnly) return true
  return (
    !!node.exportClause &&
    ts.isNamedExports(node.exportClause) &&
    node.exportClause.elements.length > 0 &&
    node.exportClause.elements.every((element) => element.isTypeOnly)
  )
}

function isTypeOnlyImport(node: ts.ImportDeclaration): boolean {
  const clause = node.importClause
  if (!clause) return false
  if (clause.isTypeOnly) return true
  return (
    !clause.name &&
    !!clause.namedBindings &&
    ts.isNamedImports(clause.namedBindings) &&
    clause.namedBindings.elements.length > 0 &&
    clause.namedBindings.elements.every((element) => element.isTypeOnly)
  )
}

function collectRuntimeModuleSpecifiers(sf: ts.SourceFile): string[] {
  const specs: string[] = []
  const visit = (node: ts.Node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !isTypeOnlyImport(node)
    ) {
      specs.push(node.moduleSpecifier.text)
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !isTypeOnlyExport(node)
    ) {
      specs.push(node.moduleSpecifier.text)
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specs.push(node.arguments[0].text)
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return specs
}

function collectRuntimeDependencyFiles(
  roots: string[],
  program: ts.Program,
  options: ts.CompilerOptions,
  compileRoot: string
): string[] {
  const queue = [...roots]
  const seen = new Map<string, string>()

  while (queue.length) {
    const file = path.resolve(queue.shift()!)
    const key = normForMap(file)
    if (seen.has(key)) continue
    seen.set(key, file)

    const sf = program.getSourceFile(file)
    if (!sf) throw new Error(`[error] failed to load source file: ${file}`)
    for (const spec of collectRuntimeModuleSpecifiers(sf)) {
      const resolved = ts.resolveModuleName(spec, file, options, ts.sys).resolvedModule
      if (!resolved || resolved.isExternalLibraryImport || resolved.packageId) continue
      const target = path.resolve(resolved.resolvedFileName)
      if (!isEligibleInputTsFile(target)) continue
      if (!isPathInside(compileRoot, target)) {
        throw new Error(
          `[error] local TypeScript runtime dependency is outside compileRoot: ${file} -> ${spec} -> ${target}`
        )
      }
      queue.push(target)
    }
  }

  return [...seen.values()].sort((a, b) => a.localeCompare(b))
}

function isGstsServerName(name: string | undefined): boolean {
  return !!name && name.startsWith('gstsServer')
}

function isFunctionInitializer(
  expr: ts.Expression | undefined
): expr is ts.FunctionExpression | ts.ArrowFunction {
  return !!expr && (ts.isFunctionExpression(expr) || ts.isArrowFunction(expr))
}

function isTimerCall(expr: ts.CallExpression): boolean {
  const callee = expr.expression
  if (ts.isIdentifier(callee)) {
    return callee.text === 'setTimeout' || callee.text === 'setInterval'
  }
  if (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'globalThis'
  ) {
    return callee.name.text === 'setTimeout' || callee.name.text === 'setInterval'
  }
  return false
}

function countTimersInSourceFile(sf: ts.SourceFile, checker: ts.TypeChecker): number {
  let count = 0
  const visit = (node: ts.Node, inServerCtx: boolean) => {
    if (ts.isCallExpression(node)) {
      if (inServerCtx && isTimerCall(node)) count += 1
      if (isServerOnCall(node, checker) && node.arguments.length >= 2) {
        const handler = node.arguments[1]
        visit(node.expression, inServerCtx)
        node.arguments.forEach((arg, idx) => {
          if (idx === 1 && (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))) {
            visit(arg, true)
          } else {
            visit(arg, inServerCtx)
          }
        })
        return
      }
    }

    if (ts.isFunctionDeclaration(node) && isGstsServerName(node.name?.text)) {
      if (node.body) visit(node.body, true)
      return
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      if (isGstsServerName(node.name.text) && isFunctionInitializer(node.initializer)) {
        visit(node.initializer, true)
        return
      }
    }

    if (ts.isFunctionLike(node) && !inServerCtx) return

    ts.forEachChild(node, (c) => visit(c, inServerCtx))
  }

  visit(sf, false)
  return count
}

function rewriteRelativeModuleSpecifiers(
  sf: ts.SourceFile,
  ctx: {
    inFile: string
    outFile: string
    options: ts.CompilerOptions
    inToOutFiles: Map<string, string>
    strictRuntime: boolean
  }
): ts.SourceFile {
  const fromDir = path.dirname(ctx.inFile)
  const toDir = path.dirname(ctx.outFile)

  const rewriteOne = (rawSpec: string, typeOnly = false): string | null => {
    // 统一用 TS 模块解析：既支持 ./../，也支持 tsconfig paths 等“非点号开头”的本地别名导入。
    // 仅当解析结果命中 filtered（且不是外部库导入）时才改写到目标输出路径。
    const resolved = ts.resolveModuleName(rawSpec, ctx.inFile, ctx.options, ts.sys).resolvedModule
    const resolvedFile = resolved?.resolvedFileName
    if (resolvedFile && !resolved.isExternalLibraryImport && !resolved.packageId) {
      const outTarget = ctx.inToOutFiles.get(normForMap(resolvedFile))
      if (outTarget) {
        let rel = path.relative(toDir, outTarget).replace(/\\/g, '/')
        if (!rel.startsWith('.')) rel = `./${rel}`
        return rel.replace(/\.gs\.ts$/i, '.gs.js')
      }
      if (isEligibleInputTsFile(resolvedFile) && !typeOnly && ctx.strictRuntime) {
        throw new Error(
          `[error] local TypeScript runtime dependency was not emitted: ${ctx.inFile} -> ${rawSpec} -> ${resolvedFile}`
        )
      }
      if (!resolvedFile.endsWith('.d.ts')) {
        let rel = path.relative(toDir, resolvedFile).replace(/\\/g, '/')
        if (!rel.startsWith('.')) rel = `./${rel}`
        return rel
      }
    }

    if (
      resolved?.isExternalLibraryImport &&
      isEligibleInputTsFile(resolved.resolvedFileName) &&
      !typeOnly
    ) {
      throw new Error(
        `[error] external TypeScript runtime dependency must provide JavaScript: ${ctx.inFile} -> ${rawSpec} -> ${resolved.resolvedFileName}`
      )
    }

    if (rawSpec.startsWith('.')) {
      // 非 filtered：保持“相对源路径”的语义（尽量不改变用户写的目录/扩展名形态）
      const abs = path.resolve(fromDir, rawSpec)
      let rel = path.relative(toDir, abs).replace(/\\/g, '/')
      if (!rel.startsWith('.')) rel = `./${rel}`
      return rel
    }

    // 非点号开头且不命中 filtered：保持原样（比如 npm 包名 / 外部依赖 / 未被编译的文件）
    return null
  }

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visit = (node: ts.Node): ts.Node => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const spec = node.moduleSpecifier.text
        const next = rewriteOne(spec, isTypeOnlyImport(node))
        if (next) {
          return ts.factory.updateImportDeclaration(
            node,
            node.modifiers,
            node.importClause,
            ts.factory.createStringLiteral(next),
            node.attributes
          )
        }
      }
      if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const spec = node.moduleSpecifier.text
        const next = rewriteOne(spec, isTypeOnlyExport(node))
        if (next) {
          return ts.factory.updateExportDeclaration(
            node,
            node.modifiers,
            node.isTypeOnly,
            node.exportClause,
            ts.factory.createStringLiteral(next),
            node.attributes
          )
        }
      }
      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments[0] &&
        ts.isStringLiteralLike(node.arguments[0])
      ) {
        const next = rewriteOne(node.arguments[0].text)
        if (next) {
          return ts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
            ts.factory.createStringLiteral(next),
            ...node.arguments.slice(1)
          ])
        }
      }
      if (
        ctx.strictRuntime &&
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments[0] &&
        ts.isTemplateExpression(node.arguments[0]) &&
        node.arguments[0].head.text.startsWith('.')
      ) {
        throw new Error(
          `[error] local dynamic import must use a fixed string: ${ctx.inFile} -> ${node.arguments[0].getText()}`
        )
      }
      return ts.visitEachChild(node, visit, context)
    }
    return (root) => ts.visitNode(root, visit) as ts.SourceFile
  }
  const res = ts.transform(sf, [transformer])
  return res.transformed[0]
}

function loadTsConfig(cwd: string): { options: ts.CompilerOptions; extraRoots: string[] } {
  const configPath = path.resolve(cwd, 'tsconfig.json')
  if (!existsFile(configPath)) {
    return {
      options: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
      extraRoots: []
    }
  }
  const raw = ts.readConfigFile(configPath, (p) => ts.sys.readFile(p))
  if (raw.error) {
    const msg = ts.flattenDiagnosticMessageText(raw.error.messageText, '\n')
    throw new Error(`[error] tsconfig parse failed: ${msg}`)
  }
  const parsed = ts.parseJsonConfigFileContent(raw.config, ts.sys, cwd)
  if (parsed.errors?.length) {
    const msg = parsed.errors
      .map((e) => ts.flattenDiagnosticMessageText(e.messageText, '\n'))
      .join('\n')
    throw new Error(`[error] tsconfig invalid: ${msg}`)
  }
  const extraRoots = parsed.fileNames.filter((f) => f.endsWith('.d.ts'))
  return { options: parsed.options, extraRoots }
}

export type TsToGsCompileParams = {
  cfgDir: string
  cfg: GstsConfig
  /**
   * Collect detailed phase and per-file timings.
   */
  profile?: boolean
  /**
   * Optional entries used only for .gs.ts emission (dev incremental).
   */
  emitEntries?: string[]
  /**
   * Optional entries used only for TS program/type-checking (dev incremental).
   */
  programEntries?: string[]
  /**
   * Called immediately after each `.gs.ts` file is written.
   */
  onWriteGs?: (outFile: string, isEntry: boolean) => void
}

export type TsToGsCompileResult = {
  compileRoot: string
  outDir: string
  sourceFiles: string[]
  runtimeSourceFiles: string[]
  outFiles: string[]
  moduleOutFiles: string[]
  entryOutFiles: string[]
  profile?: TsToGsCompileProfile
}

export type TsToGsFileProfile = {
  file: string
  isEntry: boolean
  sourceChars: number
  outputChars: number
  timingsMs: {
    entryCheck: number
    transform: number
    rewriteImports: number
    print: number
    write: number
    report: number
    total: number
  }
}

export type TsToGsCompileProfile = {
  stats: {
    matchedEmitFiles: number
    runtimeDependencyFiles: number
    emitFiles: number
    programFiles: number
    rootNames: number
    programSourceFiles: number
    timerFiles: number
    entryFiles: number
  }
  timingsMs: {
    setup: number
    glob: number
    prepareFiles: number
    loadTsConfig: number
    createProgram: number
    getTypeChecker: number
    resolveDependencies: number
    timerScan: number
    emitFiles: number
    total: number
  }
  files: TsToGsFileProfile[]
}

export async function compileTsToGs(params: TsToGsCompileParams): Promise<TsToGsCompileResult> {
  const profiling = params.profile === true
  const totalStart = profiling ? performance.now() : 0
  const setupStart = totalStart
  const compileRoot = path.resolve(params.cfgDir, params.cfg.compileRoot)
  const outDir = path.resolve(params.cfgDir, params.cfg.outDir)
  if (!existsDir(compileRoot)) throw new Error(`[error] compileRoot not found: ${compileRoot}`)
  fs.mkdirSync(outDir, { recursive: true })

  const buildEntryPatterns = (entries: string[]): string[] => {
    const entryPatterns: string[] = []
    for (const rawEnt of entries) {
      const ent = toPosixPath(rawEnt)
      const neg = ent.startsWith('!')
      const entNoBang = neg ? ent.slice(1) : ent
      const abs = path.resolve(compileRoot, entNoBang)

      if (!hasGlobMeta(entNoBang) && existsDir(abs)) {
        entryPatterns.push(`${neg ? '!' : ''}${toPosixPath(path.posix.join(entNoBang, '**/*.ts'))}`)
      } else {
        entryPatterns.push(ent)
      }
    }
    return entryPatterns
  }

  const emitPatterns = buildEntryPatterns(params.emitEntries ?? params.cfg.entries)
  const programPatterns = buildEntryPatterns(params.programEntries ?? params.cfg.entries)
  const setupMs = profiling ? performance.now() - setupStart : 0

  const globStart = profiling ? performance.now() : 0
  const [emitMatched, programMatched] = await Promise.all([
    fg(emitPatterns, {
      cwd: compileRoot,
      absolute: true,
      onlyFiles: true,
      unique: true,
      followSymbolicLinks: true,
      dot: true,
      ignore: ['**/node_modules/**']
    }),
    fg(programPatterns, {
      cwd: compileRoot,
      absolute: true,
      onlyFiles: true,
      unique: true,
      followSymbolicLinks: true,
      dot: true,
      ignore: ['**/node_modules/**']
    })
  ])
  const globMs = profiling ? performance.now() - globStart : 0

  const prepareFilesStart = profiling ? performance.now() : 0
  const matchedEmitFiles = emitMatched
    .filter((abs) => isEligibleInputTsFile(abs))
    .sort((a, b) => a.localeCompare(b))

  const programFiles = programMatched
    .filter((abs) => isEligibleInputTsFile(abs))
    .sort((a, b) => a.localeCompare(b))

  const prepareFilesMs = profiling ? performance.now() - prepareFilesStart : 0

  const loadTsConfigStart = profiling ? performance.now() : 0
  const { options, extraRoots } = loadTsConfig(path.resolve(params.cfgDir))
  const loadTsConfigMs = profiling ? performance.now() - loadTsConfigStart : 0
  const rootNames: string[] = [...programFiles]
  const seen = new Set<string>(rootNames.map(normForMap))
  for (const emitFile of matchedEmitFiles) {
    const key = normForMap(emitFile)
    if (seen.has(key)) continue
    seen.add(key)
    rootNames.push(emitFile)
  }
  for (const extra of extraRoots) {
    const key = normForMap(extra)
    if (seen.has(key)) continue
    seen.add(key)
    rootNames.push(extra)
  }
  const createProgramStart = profiling ? performance.now() : 0
  const prg = ts.createProgram({ rootNames, options })
  const createProgramMs = profiling ? performance.now() - createProgramStart : 0
  const getTypeCheckerStart = profiling ? performance.now() : 0
  const checker = prg.getTypeChecker()
  const getTypeCheckerMs = profiling ? performance.now() - getTypeCheckerStart : 0
  const resolveDependenciesStart = profiling ? performance.now() : 0
  const matchedEntryFiles = matchedEmitFiles.filter((file) => {
    const sf = prg.getSourceFile(file)
    return !!sf && hasNodeGraphEntryCall(sf, checker)
  })
  const runtimeSourceFiles = collectRuntimeDependencyFiles(
    matchedEntryFiles,
    prg,
    options,
    compileRoot
  )
  const emitFiles = [
    ...new Map(
      [...matchedEmitFiles, ...runtimeSourceFiles].map((file) => [normForMap(file), file])
    ).values()
  ].sort((a, b) => a.localeCompare(b))
  const matchedEmitKeys = new Set(matchedEmitFiles.map(normForMap))
  const runtimeSourceKeys = new Set(runtimeSourceFiles.map(normForMap))
  const inToOutFiles = new Map<string, string>()
  for (const inFile of emitFiles) {
    const rel = path.relative(compileRoot, inFile)
    const outRel = rel.replace(/\.ts$/i, '.gs.ts')
    inToOutFiles.set(normForMap(inFile), path.resolve(outDir, outRel))
  }
  const resolveDependenciesMs = profiling ? performance.now() - resolveDependenciesStart : 0
  const timerCounterRef = { value: 0 }
  const timerFiles = prg
    .getSourceFiles()
    .map((sf) => sf.fileName)
    .filter((abs) => isEligibleInputTsFile(abs))
    .sort((a, b) => a.localeCompare(b))
  const timerOffsets = new Map<string, number>()
  const timerScanStart = profiling ? performance.now() : 0
  if (timerFiles.length > 0) {
    let offset = 0
    for (const file of timerFiles) {
      const norm = normForMap(file)
      timerOffsets.set(norm, offset)
      const sf = prg.getSourceFile(file)
      if (sf) {
        offset += countTimersInSourceFile(sf, checker)
      }
    }
  }
  const timerScanMs = profiling ? performance.now() - timerScanStart : 0

  const outFiles: string[] = []
  const entryOutFiles: string[] = []
  const fileProfiles: TsToGsFileProfile[] = []
  const emitFilesStart = profiling ? performance.now() : 0

  for (const inFile of emitFiles) {
    const fileStart = profiling ? performance.now() : 0
    const sf = prg.getSourceFile(inFile)
    if (!sf) throw new Error(`[error] failed to load source file: ${inFile}`)
    const base = timerOffsets.get(normForMap(inFile))
    if (base !== undefined) timerCounterRef.value = base

    const rel = path.relative(compileRoot, inFile)
    const outRel = rel.replace(/\.ts$/i, '.gs.ts')
    const outFile = path.resolve(outDir, outRel)
    fs.mkdirSync(path.dirname(outFile), { recursive: true })

    const entryCheckStart = profiling ? performance.now() : 0
    const hasEntry = hasNodeGraphEntryCall(sf, checker)
    const entryCheckMs = profiling ? performance.now() - entryCheckStart : 0
    const transformStart = profiling ? performance.now() : 0
    const out = transformToGs(sf, { checker, config: params.cfg, timerCounterRef })
    const transformMs = profiling ? performance.now() - transformStart : 0
    const rewriteImportsStart = profiling ? performance.now() : 0
    const rewritten = rewriteRelativeModuleSpecifiers(out, {
      inFile,
      outFile,
      options,
      inToOutFiles: inToOutFiles,
      strictRuntime: runtimeSourceKeys.has(normForMap(inFile))
    })
    const rewriteImportsMs = profiling ? performance.now() - rewriteImportsStart : 0
    const printStart = profiling ? performance.now() : 0
    const printed = ts
      .createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: false })
      .printFile(rewritten)
    const printMs = profiling ? performance.now() - printStart : 0

    const tagged = hasEntry ? `// @gsts:entry\n${printed}` : printed
    const writeStart = profiling ? performance.now() : 0
    fs.writeFileSync(outFile, tagged, 'utf8')
    const writeMs = profiling ? performance.now() - writeStart : 0
    const reportStart = profiling ? performance.now() : 0
    params.onWriteGs?.(outFile, hasEntry)
    const reportMs = profiling ? performance.now() - reportStart : 0
    outFiles.push(outFile)
    if (hasEntry) entryOutFiles.push(outFile)
    if (profiling) {
      fileProfiles.push({
        file: toPosixPath(path.relative(compileRoot, inFile)),
        isEntry: hasEntry,
        sourceChars: sf.text.length,
        outputChars: tagged.length,
        timingsMs: {
          entryCheck: entryCheckMs,
          transform: transformMs,
          rewriteImports: rewriteImportsMs,
          print: printMs,
          write: writeMs,
          report: reportMs,
          total: performance.now() - fileStart
        }
      })
    }
  }
  const emitFilesMs = profiling ? performance.now() - emitFilesStart : 0

  return {
    compileRoot,
    outDir,
    sourceFiles: emitFiles,
    runtimeSourceFiles,
    outFiles,
    moduleOutFiles: runtimeSourceFiles.map((file) => inToOutFiles.get(normForMap(file))!),
    entryOutFiles,
    ...(profiling
      ? {
          profile: {
            stats: {
              matchedEmitFiles: matchedEmitFiles.length,
              runtimeDependencyFiles: emitFiles.filter(
                (file) => !matchedEmitKeys.has(normForMap(file))
              ).length,
              emitFiles: emitFiles.length,
              programFiles: programFiles.length,
              rootNames: rootNames.length,
              programSourceFiles: prg.getSourceFiles().length,
              timerFiles: timerFiles.length,
              entryFiles: entryOutFiles.length
            },
            timingsMs: {
              setup: setupMs,
              glob: globMs,
              prepareFiles: prepareFilesMs,
              loadTsConfig: loadTsConfigMs,
              createProgram: createProgramMs,
              getTypeChecker: getTypeCheckerMs,
              resolveDependencies: resolveDependenciesMs,
              timerScan: timerScanMs,
              emitFiles: emitFilesMs,
              total: performance.now() - totalStart
            },
            files: fileProfiles
          }
        }
      : {})
  }
}

export async function compileTsToGsFromConfig(configPath: string) {
  const cfgAbsPath = path.resolve(process.cwd(), configPath)
  if (!existsFile(cfgAbsPath)) throw new Error(`[error] config not found: ${cfgAbsPath}`)
  const cfgDir = path.dirname(cfgAbsPath)
  const cfg = await loadGstsConfig(cfgAbsPath)
  const result = await compileTsToGs({ cfgDir, cfg })
  return { cfgAbsPath, cfgDir, cfg, ...result }
}
