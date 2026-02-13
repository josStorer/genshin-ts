import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

function printUsage() {
  console.log(`Usage:
  node scripts/inspect-ts-hover.mjs --file <path> --marker <text> [options]

Required:
  --file <path>             Source file to inspect.
  --marker <text>           Text marker used to locate position.

Options:
  --project <path>          tsconfig path (default: auto-find from cwd).
  --marker-index <n>        1-based occurrence index (default: 1).
  --pos-shift <n>           Position shift from marker start (default: 0).
  --json                    Print JSON output.
  --help                    Show this help.

Examples:
  node scripts/inspect-ts-hover.mjs --file tmp/repro.ts --marker ".on(" --pos-shift 2
  node scripts/inspect-ts-hover.mjs --file tmp/repro.ts --marker "'实体创建时'" --pos-shift 2
`)
}

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) {
      args._.push(token)
      continue
    }
    const key = token.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
      continue
    }
    args[key] = next
    i += 1
  }
  return args
}

function toNumber(v, fallback) {
  if (v === undefined) return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function findCallContainingPosition(node, pos, best = null) {
  if (pos < node.getStart() || pos > node.getEnd()) return best
  if (ts.isCallExpression(node)) {
    if (!best) {
      best = node
    } else {
      const currentSpan = best.getEnd() - best.getStart()
      const nextSpan = node.getEnd() - node.getStart()
      if (nextSpan <= currentSpan) best = node
    }
  }
  return ts.forEachChild(node, (child) => findCallContainingPosition(child, pos, best)) ?? best
}

function posToLineCol(sourceFile, pos) {
  const lc = ts.getLineAndCharacterOfPosition(sourceFile, pos)
  return { line: lc.line + 1, column: lc.character + 1 }
}

function displayPartsToString(parts) {
  return ts.displayPartsToString(parts ?? []).trim()
}

function main() {
  const args = parseArgs(process.argv)
  if (args.help) {
    printUsage()
    process.exit(0)
  }

  const fileArg = args.file
  const marker = args.marker
  if (!fileArg || !marker) {
    printUsage()
    process.exit(1)
  }

  const markerIndex = Math.max(1, toNumber(args['marker-index'], 1))
  const posShift = toNumber(args['pos-shift'], 0)
  const cwd = process.cwd()
  const filePath = path.resolve(cwd, String(fileArg))

  if (!fs.existsSync(filePath)) {
    throw new Error(`file not found: ${filePath}`)
  }

  const sourceText = fs.readFileSync(filePath, 'utf8')
  let markerPos = -1
  let from = 0
  for (let i = 0; i < markerIndex; i += 1) {
    markerPos = sourceText.indexOf(String(marker), from)
    if (markerPos < 0) break
    from = markerPos + String(marker).length
  }
  if (markerPos < 0) {
    throw new Error(`marker not found: "${String(marker)}" (index: ${markerIndex})`)
  }
  const position = markerPos + posShift
  if (position < 0 || position >= sourceText.length) {
    throw new Error(`position out of range: ${position}`)
  }

  const configPath =
    args.project !== undefined
      ? path.resolve(cwd, String(args.project))
      : ts.findConfigFile(cwd, ts.sys.fileExists, 'tsconfig.json')
  if (!configPath || !fs.existsSync(configPath)) {
    throw new Error('tsconfig not found')
  }

  const config = ts.readConfigFile(configPath, ts.sys.readFile)
  if (config.error) {
    throw new Error(ts.formatDiagnosticsWithColorAndContext([config.error], {
      getCanonicalFileName: (f) => f,
      getCurrentDirectory: () => cwd,
      getNewLine: () => '\n'
    }))
  }

  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath))
  const files = new Map(parsed.fileNames.map((f) => [path.resolve(f), { version: 0 }]))
  files.set(filePath, { version: 0 })

  const host = {
    getCompilationSettings: () => parsed.options,
    getScriptFileNames: () => Array.from(files.keys()),
    getScriptVersion: (f) => String(files.get(path.resolve(f))?.version ?? 0),
    getScriptSnapshot: (f) => {
      if (!ts.sys.fileExists(f)) return undefined
      return ts.ScriptSnapshot.fromString(ts.sys.readFile(f) ?? '')
    },
    getCurrentDirectory: () => path.dirname(configPath),
    getDefaultLibFileName: (opts) => ts.getDefaultLibFilePath(opts),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory
  }

  const ls = ts.createLanguageService(host)
  const sf = ls.getProgram()?.getSourceFile(filePath)
  if (!sf) throw new Error(`unable to load source file from language service: ${filePath}`)

  const lc = posToLineCol(sf, position)
  const quickInfo = ls.getQuickInfoAtPosition(filePath, position)
  const sigHelp = ls.getSignatureHelpItems(filePath, position, undefined)

  const program = ls.getProgram()
  const checker = program?.getTypeChecker()
  let resolvedSignature = null
  if (program && checker) {
    const sourceFile = program.getSourceFile(filePath)
    if (sourceFile) {
      const callNode = findCallContainingPosition(sourceFile, position)
      if (callNode) {
        const sig = checker.getResolvedSignature(callNode)
        if (sig) {
          const decl = sig.getDeclaration()
          let declaration = null
          if (decl) {
            const declSf = decl.getSourceFile()
            const declLc = posToLineCol(declSf, decl.getStart())
            declaration = `${path.relative(cwd, declSf.fileName)}:${declLc.line}:${declLc.column}`
          }
          resolvedSignature = {
            signature: checker.signatureToString(sig, callNode),
            docs: displayPartsToString(sig.getDocumentationComment(checker)),
            declaration
          }
        }
      }
    }
  }

  const selectedSigItem = sigHelp?.items[sigHelp.selectedItemIndex]
  const output = {
    configPath: path.relative(cwd, configPath),
    file: path.relative(cwd, filePath),
    marker: String(marker),
    markerIndex,
    position,
    line: lc.line,
    column: lc.column,
    quickInfo: quickInfo
      ? {
          kind: quickInfo.kind,
          display: displayPartsToString(quickInfo.displayParts),
          docs: displayPartsToString(quickInfo.documentation)
        }
      : null,
    signatureHelp: selectedSigItem
      ? {
          selectedIndex: sigHelp.selectedItemIndex,
          display: `${displayPartsToString(selectedSigItem.prefixDisplayParts)}${selectedSigItem.parameters
            .map((p) => displayPartsToString(p.displayParts))
            .join(displayPartsToString(selectedSigItem.separatorDisplayParts))}${displayPartsToString(
            selectedSigItem.suffixDisplayParts
          )}`,
          docs: displayPartsToString(selectedSigItem.documentation)
        }
      : null,
    resolvedSignature
  }

  if (args.json) {
    console.log(JSON.stringify(output, null, 2))
    return
  }

  console.log(`[config] ${output.configPath}`)
  console.log(`[file]   ${output.file}:${output.line}:${output.column}`)
  console.log(`[marker] ${output.marker} (index=${output.markerIndex}, shift=${posShift})`)
  console.log('')
  console.log('[quickInfo]')
  if (!output.quickInfo) {
    console.log('  <none>')
  } else {
    console.log(`  kind: ${output.quickInfo.kind}`)
    console.log(`  display: ${output.quickInfo.display}`)
    console.log(`  docs: ${output.quickInfo.docs || '<empty>'}`)
  }
  console.log('')
  console.log('[signatureHelp]')
  if (!output.signatureHelp) {
    console.log('  <none>')
  } else {
    console.log(`  display: ${output.signatureHelp.display}`)
    console.log(`  docs: ${output.signatureHelp.docs || '<empty>'}`)
  }
  console.log('')
  console.log('[resolvedSignature]')
  if (!output.resolvedSignature) {
    console.log('  <none>')
  } else {
    console.log(`  signature: ${output.resolvedSignature.signature}`)
    console.log(`  docs: ${output.resolvedSignature.docs || '<empty>'}`)
    console.log(`  declaration: ${output.resolvedSignature.declaration ?? '<unknown>'}`)
  }
}

main()
