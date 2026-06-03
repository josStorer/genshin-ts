import fs from 'node:fs'
import path from 'node:path'

import { compileTsToGs } from '../src/compiler/ts_to_gs_pipeline.js'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'dist-live-collection-reference-assert')
const fixture = './tests/live_collection_reference_test.ts'

function normalize(text: string) {
  return text.replace(/\r\n/g, '\n')
}

function assertIncludes(text: string, needle: string) {
  if (!text.includes(needle)) {
    throw new Error(`Expected generated output to include:\n${needle}\n\nActual:\n${text}`)
  }
}

function assertNotIncludes(text: string, needle: string) {
  if (text.includes(needle)) {
    throw new Error(`Expected generated output not to include:\n${needle}\n\nActual:\n${text}`)
  }
}

try {
  fs.rmSync(outDir, { recursive: true, force: true })

  const result = await compileTsToGs({
    cfgDir: repoRoot,
    cfg: {
      compileRoot: '.',
      entries: [fixture],
      outDir
    }
  })

  const outFile = result.outFiles.find((file) =>
    file.endsWith('live_collection_reference_test.gs.ts')
  )
  if (!outFile) throw new Error('Expected live collection reference GS output file to be emitted')

  const text = normalize(fs.readFileSync(outFile, 'utf8'))

  assertIncludes(
    text,
    `const liveViaGet = f.get(Vars.LiveList);\n    gsts.f.modifyValueInList(liveViaGet, idx(0n), 10n);`
  )
  assertIncludes(text, `gsts.f.modifyValueInList(liveViaGet, idx(1n), 11n);`)
  assertIncludes(
    text,
    `const liveViaGetNode = f.getNodeGraphVariable(Vars.LiveList).asType('int_list');\n    gsts.f.modifyValueInList(liveViaGetNode, idx(2n), 12n);`
  )
  assertIncludes(
    text,
    `const enumLive = f.getNodeGraphVariable(Vars.LiveList).asType('int_list');\n    gsts.f.modifyValueInList(enumLive, idx(0n), 13n);`
  )
  assertIncludes(
    text,
    `const customViaF = f.getCustomVariable(f.getSelfEntity(), 'custom_list').asType('int_list');\n    gsts.f.modifyValueInList(customViaF, idx(0n), 14n);`
  )
  assertIncludes(
    text,
    `const customViaEntity = self.get('custom_list').asType('int_list');\n    gsts.f.modifyValueInList(customViaEntity, idx(1n), 15n);`
  )
  assertIncludes(
    text,
    `const customViaEntityFullName = selfFullName.getCustomVariable('custom_list').asType('int_list');\n    gsts.f.modifyValueInList(customViaEntityFullName, idx(2n), 16n);`
  )
  assertIncludes(text, `const liveDict = f.get(Vars.LiveDict);`)
  assertIncludes(text, `liveDict.set('b', 2n);`)

  assertNotIncludes(text, `const liveViaGet = gsts.f.initLocalVariable`)
  assertNotIncludes(text, `const liveViaGetNode = gsts.f.initLocalVariable`)
  assertNotIncludes(text, `const enumLive = gsts.f.initLocalVariable`)
  assertNotIncludes(text, `const customViaF = gsts.f.initLocalVariable`)
  assertNotIncludes(text, `const customViaEntity = gsts.f.initLocalVariable`)
  assertNotIncludes(text, `const customViaEntityFullName = gsts.f.initLocalVariable`)
  assertNotIncludes(text, `const liveDict = gsts.f.initLocalVariable`)

  assertIncludes(text, `const temporary = gsts.f.initLocalVariable("int_list");`)
  assertIncludes(text, `const unknown = gsts.f.initLocalVariable("int_list");`)

  console.log(`[ok] live collection reference output verified: ${outFile}`)
} finally {
  fs.rmSync(outDir, { recursive: true, force: true })
}
