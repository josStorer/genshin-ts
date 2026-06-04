import fs from 'node:fs'
import path from 'node:path'

import { compileTsToGs } from '../src/compiler/ts_to_gs_pipeline.js'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'dist', 'loop-index-modulo-assert')
const fixture = './tests/loop_index_modulo_test.ts'

function normalize(text: string) {
  return text.replace(/\r\n/g, '\n')
}

function assertIncludes(text: string, needle: string, label: string) {
  if (!text.includes(needle)) {
    throw new Error(`Missing ${label}:\n${needle}\n\nActual:\n${text}`)
  }
}

function assertNotIncludes(text: string, needle: string, label: string) {
  if (text.includes(needle)) {
    throw new Error(`Unexpected ${label}:\n${needle}\n\nActual:\n${text}`)
  }
}

fs.rmSync(outDir, { recursive: true, force: true })

const result = await compileTsToGs({
  cfgDir: repoRoot,
  cfg: {
    compileRoot: '.',
    entries: [fixture],
    outDir
  }
})

const outFile = result.outFiles.find((file) => file.endsWith('loop_index_modulo_test.gs.ts'))
if (!outFile) throw new Error('Expected loop index modulo GS output file to be emitted')

const text = normalize(fs.readFileSync(outFile, 'utf8'))

assertIncludes(
  text,
  `gsts.f.moduloOperation(int(outer), 2)`,
  'loop index modulo should coerce loop index to int'
)
assertNotIncludes(
  text,
  `gsts.f.moduloOperation(float(outer), 2)`,
  'loop index modulo should not coerce loop index to float'
)

console.log(`[ok] loop index modulo output verified: ${outFile}`)
