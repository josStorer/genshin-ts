import fs from 'node:fs'
import path from 'node:path'

import { compileTsToGs } from '../src/compiler/ts_to_gs_pipeline.js'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'dist', 'f-method-matcher-assert')
const fixture = './tests/f_method_matcher_test.ts'

type CaseExpectation = {
  name: string
  description: string
  includes?: string[]
  excludes?: string[]
}

function normalize(text: string) {
  return text.replace(/\r\n/g, '\n')
}

function assertIncludes(text: string, needle: string, label: string) {
  if (!text.includes(needle)) {
    throw new Error(`Missing ${label}:\n${needle}\n\nActual segment:\n${text}`)
  }
}

function assertNotIncludes(text: string, needle: string, label: string) {
  if (text.includes(needle)) {
    throw new Error(`Unexpected ${label}:\n${needle}\n\nActual segment:\n${text}`)
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

const assemblyCases: CaseExpectation[] = [
  {
    name: 'assembly_callback_f',
    description: 'f.assemblyList(array literal) keeps the array literal argument unwrapped',
    includes: [`f.assemblyList([gsts.f.addition(1n, 2n), 3n], 'int')`],
    excludes: [`assemblyList(gsts.f.assemblyList`]
  },
  {
    name: 'assembly_gsts_root',
    description: 'gsts.f.assemblyList(array literal) keeps the array literal argument unwrapped',
    includes: [`gsts.f.assemblyList([gsts.f.addition(4n, 5n), 6n], 'int')`],
    excludes: [`assemblyList(gsts.f.assemblyList`]
  },
  {
    name: 'assembly_global_this_root',
    description: 'globalThis.gsts.f.assemblyList(array literal) keeps the array literal argument unwrapped',
    includes: [`globalThis.gsts.f.assemblyList([gsts.f.addition(7n, 8n), 9n], 'int')`],
    excludes: [`assemblyList(gsts.f.assemblyList`]
  }
]

const multipleBranchesCases: CaseExpectation[] = [
  {
    name: 'multiple_branches_callback_f',
    description: 'f.multipleBranches transforms branch handlers',
    includes: [
      `f.multipleBranches(1n, {`,
      `const branchCounterF = gsts.f.initLocalVariable("int");`,
      `gsts.f.setLocalVariable(branchCounterF.localVariable, f.get(Vars.IntValue));`,
      `gsts.f.setLocalVariable(branchCounterF.localVariable, gsts.f.addition(branchCounterF.value, 1n));`
    ]
  },
  {
    name: 'multiple_branches_gsts_root',
    description: 'gsts.f.multipleBranches transforms branch handlers',
    includes: [
      `gsts.f.multipleBranches(2n, {`,
      `const branchCounterGsts = gsts.f.initLocalVariable("int");`,
      `gsts.f.setLocalVariable(branchCounterGsts.localVariable, f.get(Vars.IntValue));`,
      `gsts.f.setLocalVariable(branchCounterGsts.localVariable, gsts.f.addition(branchCounterGsts.value, 2n));`
    ]
  },
  {
    name: 'multiple_branches_global_this_root',
    description: 'globalThis.gsts.f.multipleBranches transforms branch handlers',
    includes: [
      `globalThis.gsts.f.multipleBranches(3n, {`,
      `const branchCounterGlobalThis = gsts.f.initLocalVariable("int");`,
      `gsts.f.setLocalVariable(branchCounterGlobalThis.localVariable, f.get(Vars.IntValue));`,
      `gsts.f.setLocalVariable(branchCounterGlobalThis.localVariable, gsts.f.addition(branchCounterGlobalThis.value, 3n));`
    ]
  }
]

fs.rmSync(outDir, { recursive: true, force: true })

const result = await compileTsToGs({
  cfgDir: repoRoot,
  cfg: {
    compileRoot: '.',
    entries: [fixture],
    outDir
  }
})

const outFile = result.outFiles.find((file) => file.endsWith('f_method_matcher_test.gs.ts'))
if (!outFile) throw new Error('Expected f-method matcher GS output file to be emitted')

const text = normalize(fs.readFileSync(outFile, 'utf8'))
const report: string[] = []

for (const expectation of [...assemblyCases, ...multipleBranchesCases]) {
  const segment = caseSegment(text, expectation.name)
  for (const include of expectation.includes ?? []) {
    assertIncludes(segment, include, `${expectation.name} expected output`)
  }
  for (const exclude of expectation.excludes ?? []) {
    assertNotIncludes(segment, exclude, `${expectation.name} excluded output`)
  }
  report.push(`[ok] ${expectation.name} - ${expectation.description}`)
}

console.log(report.join('\n'))
console.log(`[ok] f-method matcher output verified: ${outFile}`)
