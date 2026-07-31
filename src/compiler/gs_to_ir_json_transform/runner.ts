import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { pathToFileURL } from 'node:url'

import { buildAllGraphRegistriesIRDocuments } from '../../runtime/core.js'
import { setRuntimeOptions } from '../../runtime/runtime_config.js'

function defaultGraphNameFromEntryFile(entryFile: string): string {
  const base = path.basename(entryFile)
  // 入口可能由 tsx 直接运行 .gs.ts，也可能预编译后由 Node 运行 .gs.js。
  if (/\.gs\.(?:ts|js)$/i.test(base)) return base.replace(/\.gs\.(?:ts|js)$/i, '')
  return path.basename(entryFile, path.extname(entryFile))
}

async function main() {
  const profiling = process.env.GSTS_PIPELINE_PROFILE === '1'
  const totalStart = profiling ? performance.now() : 0
  const [entryFile, outFile, compactFlag] = process.argv.slice(2)
  if (!entryFile || !outFile) {
    console.error('[error] entryFile and outFile are required')
    process.exit(1)
  }

  setRuntimeOptions({
    optimize: {
      precompileExpression: process.env.GSTS_PRECOMPILE_EXPR === '1',
      removeUnusedNodes: process.env.GSTS_REMOVE_UNUSED_NODES === '1'
    }
  })

  const entryUrl = pathToFileURL(entryFile).href
  const importStart = profiling ? performance.now() : 0
  await import(entryUrl)
  const importEntryMs = profiling ? performance.now() - importStart : 0

  const space = compactFlag === '1' ? 0 : 2
  const buildStart = profiling ? performance.now() : 0
  const documents = buildAllGraphRegistriesIRDocuments({
    defaultName: defaultGraphNameFromEntryFile(entryFile)
  })
  const buildDocumentsMs = profiling ? performance.now() - buildStart : 0
  const stringifyStart = profiling ? performance.now() : 0
  const json =
    JSON.stringify(
      // defaultName：当脚本内未传 g.server({ name }) 时，用入口文件名自动命名
      documents,
      null,
      space
    ) + '\n'
  const stringifyMs = profiling ? performance.now() - stringifyStart : 0

  const writeStart = profiling ? performance.now() : 0
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, json, 'utf8')
  const writeMs = profiling ? performance.now() - writeStart : 0
  if (profiling) {
    process.stderr.write(
      `[gsts-profile:gs-to-ir] ${JSON.stringify({
        stats: {
          inputBytes: fs.statSync(entryFile).size,
          outputBytes: Buffer.byteLength(json),
          documents: documents.length,
          nodes: documents.reduce((sum, doc) => sum + (doc.nodes?.length ?? 0), 0),
          variables: documents.reduce((sum, doc) => sum + (doc.variables?.length ?? 0), 0)
        },
        timingsMs: {
          importEntry: importEntryMs,
          buildDocuments: buildDocumentsMs,
          stringify: stringifyMs,
          write: writeMs,
          total: performance.now() - totalStart
        }
      })}\n`
    )
  }
  console.log(`[ok] ${outFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
