import fs from 'node:fs'
import path from 'node:path'

import { compileTsToGs } from '../src/compiler/ts_to_gs_pipeline.js'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'dist', 'collection-rebind-semantics-assert')
const fixture = './tests/collection_rebind_semantics_test.ts'

function normalize(text: string) {
  return text.replace(/\r\n/g, '\n')
}

function assertIncludes(text: string, needle: string, label: string) {
  if (!text.includes(needle)) {
    throw new Error(`Missing ${label}:\n${needle}\n\nActual:\n${text}`)
  }
}

function assertInOrder(text: string, needles: string[], label: string) {
  let cursor = 0
  for (const needle of needles) {
    const next = text.indexOf(needle, cursor)
    if (next < 0) {
      throw new Error(`Missing ordered ${label}:\n${needle}\n\nActual after cursor:\n${text.slice(cursor)}`)
    }
    cursor = next + needle.length
  }
}

function assertCount(text: string, needle: string, expected: number, label: string) {
  const actual = text.split(needle).length - 1
  if (actual !== expected) {
    throw new Error(`Unexpected ${label}: expected ${expected}, got ${actual}\nNeedle: ${needle}\n\nActual:\n${text}`)
  }
}

function caseSegment(text: string, name: string) {
  const start = `f.printString('__CASE__:${name}:start');`
  const end = `f.printString('__CASE__:${name}:end');`
  const startIndex = text.indexOf(start)
  if (startIndex < 0) throw new Error(`Missing case start marker: ${name}`)
  const bodyStart = startIndex + start.length
  const endIndex = text.indexOf(end, bodyStart)
  if (endIndex < 0) throw new Error(`Missing case end marker: ${name}`)
  return text.slice(bodyStart, endIndex)
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

const outFile = result.outFiles.find((file) => file.endsWith('collection_rebind_semantics_test.gs.ts'))
if (!outFile) throw new Error('Expected collection rebind semantics GS output file to be emitted')

const text = normalize(fs.readFileSync(outFile, 'utf8'))
const segment = caseSegment(text, 'alternating_rebind')

assertCount(segment, 'gsts.f.initLocalVariable("int_list")', 4, 'temporary/copy rebind LocalVariable count')
assertCount(segment, 'const __gsts_collection_rebind_', 4, 'hidden collection rebind variable count')

assertInOrder(
  segment,
  [
    `let alternating = f.get(Vars.LiveA);`,
    `gsts.f.modifyValueInList(alternating, idx(0n), 10n);`,
    `const __gsts_collection_rebind_1 = gsts.f.initLocalVariable("int_list");`,
    `gsts.f.setLocalVariable(__gsts_collection_rebind_1.localVariable, list('int', [1n]));`,
    `alternating = __gsts_collection_rebind_1.value;`,
    `gsts.f.modifyValueInList(alternating, idx(0n), 20n);`,
    `alternating = f.get(Vars.LiveB);`,
    `gsts.f.modifyValueInList(alternating, idx(1n), 30n);`,
    `const __gsts_collection_rebind_2 = gsts.f.initLocalVariable("int_list");`,
    `gsts.f.setLocalVariable(__gsts_collection_rebind_2.localVariable, f.assemblyList([2n, 3n], 'int'));`,
    `alternating = __gsts_collection_rebind_2.value;`,
    `gsts.f.modifyValueInList(alternating, idx(1n), 40n);`,
    `alternating = f.getNodeGraphVariable(Vars.LiveA).asType('int_list');`,
    `gsts.f.modifyValueInList(alternating, idx(2n), 50n);`,
    `const __gsts_collection_rebind_3 = gsts.f.initLocalVariable("int_list");`,
    `gsts.f.setLocalVariable(__gsts_collection_rebind_3.localVariable, gsts.f.assemblyList([5n, 6n]));`,
    `alternating = __gsts_collection_rebind_3.value;`,
    `gsts.f.modifyValueInList(alternating, idx(0n), 60n);`,
    `const __gsts_collection_rebind_4 = gsts.f.initLocalVariable("int_list");`,
    `gsts.f.setLocalVariable(__gsts_collection_rebind_4.localVariable, f.copyList(f.get(Vars.LiveB)));`,
    `alternating = __gsts_collection_rebind_4.value;`,
    `gsts.f.modifyValueInList(alternating, idx(0n), 70n);`,
    `alternating = f.get(Vars.LiveA);`,
    `gsts.f.modifyValueInList(alternating, idx(0n), 80n);`
  ],
  'live/temporary alternating rebind sequence'
)

assertIncludes(
  segment,
  `f.printString(str(gsts.f.getCorrespondingValueFromList(alternating, idx(0n))));`,
  'final read from current binding'
)

console.log(`[ok] collection rebind semantics output verified: ${outFile}`)
