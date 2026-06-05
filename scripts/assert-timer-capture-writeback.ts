import fs from 'node:fs'
import path from 'node:path'

import { compileTsToGs } from '../src/compiler/ts_to_gs_pipeline.js'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'dist', 'timer-capture-writeback-assert')
const fixture = './tests/other/timer_capture_writeback_demo.ts'

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

function assertMatches(text: string, pattern: RegExp, label: string) {
  if (!pattern.test(text)) {
    throw new Error(`Missing ${label}:\n${pattern}\n\nActual:\n${text}`)
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

const outFile = result.outFiles.find((file) => file.endsWith('timer_capture_writeback_demo.gs.ts'))
if (!outFile) throw new Error('Expected timer capture writeback GS output file to be emitted')

const text = normalize(fs.readFileSync(outFile, 'utf8'))

assertMatches(
  text,
  /setLocalVariable\(counter\.localVariable, [\s\S]*?addition\(counter\.value, 1n\)[\s\S]*?setOrAddKeyValuePairsToDictionary\(gsts\.f\.getNodeGraphVariable\("__gsts_interval_\d+_cap_counter"\)\.asDict\("str", "int"\), __gsts_interval_\d+_timerName, __gsts_timer_cap_\d+\.value\)/,
  'captured scalar reassignment writeback'
)

assertMatches(
  text,
  /setLocalVariable\(acc\.localVariable, [\s\S]*?addition\(acc\.value, 2n\)[\s\S]*?setOrAddKeyValuePairsToDictionary\(gsts\.f\.getNodeGraphVariable\("__gsts_interval_\d+_cap_acc"\)\.asDict\("str", "int"\), __gsts_interval_\d+_timerName, __gsts_timer_cap_\d+\.value\)/,
  'captured scalar compound-assignment writeback'
)

assertMatches(
  text,
  /listIterationLoop\(nums\.value[\s\S]*?setLocalVariable\(nestedCounter\.localVariable, __gsts_timer_cap_\d+\.value\)[\s\S]*?setOrAddKeyValuePairsToDictionary\(gsts\.f\.getNodeGraphVariable\("__gsts_timeout_\d+_cap_nestedCounter"\)\.asDict\("str", "int"\), __gsts_timeout_\d+_timerName, __gsts_timer_cap_\d+\.value\)/,
  'nested callback captured scalar writeback'
)

assertMatches(
  text,
  /const __gsts_list_\d+ = arrPush\.value;[\s\S]*?insertValueIntoList\(__gsts_list_\d+, __gsts_push_len_\d+\.value, 1n\);[\s\S]*?setOrAddKeyValuePairsToDictionary\(gsts\.f\.getNodeGraphVariable\("__gsts_interval_\d+_cap_arrPush"\)\.asDict\("str", "int_list"\), __gsts_interval_\d+_timerName, __gsts_list_\d+\)/,
  'captured list method mutation writeback'
)

assertInOrder(
  text,
  [
    `const arrAssign = f.initLocalVariable("int_list");`,
    `f.setLocalVariable(arrAssign.localVariable, f.queryDictionaryValueByKey(f.getNodeGraphVariable("__gsts_interval_6_cap_arrAssign").asDict("str", "int_list"), _evt.timerName));`,
    `const __gsts_timer_cap_`,
    `gsts.f.setLocalVariable(__gsts_timer_cap_`,
    `gsts.f.assemblyList([gsts.f.addition(gsts.f.getCorrespondingValueFromList(arrAssign.value, 0), 1n)])`,
    `gsts.f.setLocalVariable(arrAssign.localVariable, __gsts_timer_cap_`,
    `gsts.f.setOrAddKeyValuePairsToDictionary(gsts.f.getNodeGraphVariable("__gsts_interval_6_cap_arrAssign").asDict("str", "int_list"), __gsts_interval_6_timerName, __gsts_timer_cap_`
  ],
  'captured list reassignment writeback'
)

assertIncludes(text, `f.printString(str(gsts.f.getCorrespondingValueFromList(arrAssign.value, 0)));`, 'read from captured list local value')
assertNotIncludes(text, `arrAssign = __gsts_collection_rebind_`, 'captured list direct collection rebind')

console.log(`[ok] timer capture writeback output verified: ${outFile}`)
