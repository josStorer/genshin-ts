import fs from 'node:fs'
import path from 'node:path'

import { compileTsToGs } from '../src/compiler/ts_to_gs_pipeline.js'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'dist', 'variable-plan-semantics-assert')
const fixture = './tests/variable_plan_semantics_test.ts'

type CaseExpectation = {
  name: string
  mode: 'direct' | 'local' | 'mixed'
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

const cases: CaseExpectation[] = [
  {
    name: 'const_scalar_direct',
    mode: 'direct',
    description: 'const scalar read from graph variable should remain direct',
    includes: [`const constScalarDirect = f.get(Vars.IntValue);`]
  },
  {
    name: 'let_scalar_local',
    mode: 'local',
    description: 'let scalar mutation should use LocalVariable',
    includes: [
      `const letScalarLocal = gsts.f.initLocalVariable("int");`,
      `gsts.f.setLocalVariable(letScalarLocal.localVariable, f.get(Vars.IntValue));`
    ]
  },
  {
    name: 'const_scalar_reused',
    mode: 'local',
    description: 'reused const scalar from graph variable should use LocalVariable for stable reads',
    includes: [
      `const constScalarReused = gsts.f.initLocalVariable("float");`,
      `gsts.f.setLocalVariable(constScalarReused.localVariable, f.get(Vars.FloatValue));`
    ]
  },
  {
    name: 'live_list_f_get',
    mode: 'direct',
    description: 'auto-inferred const list from f.get should write through without asType',
    includes: [
      `const liveListFGet = f.get(Vars.LiveList);`,
      `gsts.f.modifyValueInList(liveListFGet, idx(0n), 10n);`
    ]
  },
  {
    name: 'assembly_existing_live_list_copy',
    mode: 'local',
    description: 'assemblyList(existing live list) should explicitly copy through LocalVariable',
    includes: [
      `const assemblyExistingLiveList = gsts.f.initLocalVariable("int_list");`,
      `gsts.f.setLocalVariable(assemblyExistingLiveList.localVariable, f.assemblyList(f.get(Vars.LiveList)));`,
      `gsts.f.modifyValueInList(assemblyExistingLiveList.value, idx(0n), 18n);`
    ]
  },
  {
    name: 'live_list_node_graph',
    mode: 'direct',
    description: 'const list from getNodeGraphVariable().asType should write through directly',
    includes: [
      `const liveListNodeGraph = f.getNodeGraphVariable(Vars.LiveList).asType('int_list');`,
      `gsts.f.modifyValueInList(liveListNodeGraph, idx(1n), 11n);`
    ]
  },
  {
    name: 'live_list_custom_f',
    mode: 'direct',
    description: 'const list from f.getCustomVariable().asType should write through directly',
    includes: [
      `const liveListCustomF = f`,
      `.getCustomVariable(selfForCustomF, 'custom_list')`,
      `.asType('int_list');`,
      `gsts.f.modifyValueInList(liveListCustomF, idx(2n), 12n);`
    ]
  },
  {
    name: 'live_list_custom_entity',
    mode: 'direct',
    description: 'const list from entity.get().asType should write through directly',
    includes: [
      `const liveListCustomEntity = selfForCustomEntity.get('custom_list').asType('int_list');`,
      `gsts.f.modifyValueInList(liveListCustomEntity, idx(0n), 13n);`
    ]
  },
  {
    name: 'live_list_custom_entity_full_name',
    mode: 'direct',
    description: 'const list from entity.getCustomVariable().asType should write through directly',
    includes: [
      `const liveListCustomEntityFullName = selfForCustomEntityFullName`,
      `.getCustomVariable('custom_list')`,
      `.asType('int_list');`,
      `gsts.f.modifyValueInList(liveListCustomEntityFullName, idx(0n), 23n);`
    ]
  },
  {
    name: 'let_live_list_local',
    mode: 'direct',
    description: 'let list initialized from live source should still write through unless rebound',
    includes: [
      `let letLiveListLocal = f.get(Vars.LiveList);`,
      `gsts.f.modifyValueInList(letLiveListLocal, idx(0n), 14n);`
    ]
  },
  {
    name: 'let_live_list_rebound_direct',
    mode: 'mixed',
    description: 'straight-line live list rebound should snapshot only after rebinding to temporary list',
    includes: [
      `let letLiveListRebound = f.get(Vars.LiveList);`,
      `gsts.f.modifyValueInList(letLiveListRebound, 1, 3n);`,
      `const __gsts_collection_rebind_`,
      `gsts.f.initLocalVariable("int_list")`,
      `gsts.f.setLocalVariable(__gsts_collection_rebind_`,
      `list('int', [1n])`,
      `letLiveListRebound = __gsts_collection_rebind_`,
      `gsts.f.modifyValueInList(letLiveListRebound, idx(0n), 2n);`
    ]
  },
  {
    name: 'let_live_list_alias_rebound_direct',
    mode: 'mixed',
    description:
      'straight-line aliases of live list sources should stay direct and snapshot only temporary rebinds',
    includes: [
      `const liveListAliasSource = f.get(Vars.LiveList);`,
      `const liveListAliasCustom = f`,
      `.getCustomVariable(liveListAliasSelf, 'custom_list')`,
      `.asType('int_list');`,
      `let letLiveListAliasRebound = liveListAliasSource;`,
      `gsts.f.modifyValueInList(letLiveListAliasRebound, idx(1n), 31n);`,
      `const __gsts_collection_rebind_`,
      `gsts.f.setLocalVariable(__gsts_collection_rebind_`,
      `list('int', [1n, 2n])`,
      `letLiveListAliasRebound = __gsts_collection_rebind_`,
      `gsts.f.modifyValueInList(letLiveListAliasRebound, idx(0n), 33n);`,
      `letLiveListAliasRebound = liveListAliasCustom;`,
      `gsts.f.modifyValueInList(letLiveListAliasRebound, idx(2n), 32n);`
    ],
    excludes: [`const letLiveListAliasRebound = gsts.f.initLocalVariable("int_list");`]
  },
  {
    name: 'let_live_list_rebound_in_branch_local',
    mode: 'local',
    description: 'live list rebound inside a branch should use LocalVariable for runtime state',
    includes: [
      `const letLiveListReboundInBranch = gsts.f.initLocalVariable("int_list");`,
      `gsts.f.setLocalVariable(letLiveListReboundInBranch.localVariable, f.get(Vars.LiveList));`,
      `gsts.f.setLocalVariable(letLiveListReboundInBranch.localVariable, list('int', [2n]));`,
      `gsts.f.modifyValueInList(letLiveListReboundInBranch.value, idx(0n), 24n);`
    ]
  },
  {
    name: 'copy_list_local',
    mode: 'local',
    description: 'copyList should explicitly force LocalVariable before mutation',
    includes: [
      `const copyListLocal = gsts.f.initLocalVariable("int_list");`,
      `gsts.f.setLocalVariable(copyListLocal.localVariable, f.copyList(f.get(Vars.LiveList)));`,
      `gsts.f.modifyValueInList(copyListLocal.value, idx(0n), 19n);`
    ]
  },
  {
    name: 'copy_list_readonly_local',
    mode: 'local',
    description: 'copyList should snapshot even when only read later',
    includes: [
      `const copyListReadonlyLocal = gsts.f.initLocalVariable("int_list");`,
      `gsts.f.setLocalVariable(copyListReadonlyLocal.localVariable, f.copyList(f.get(Vars.LiveList)));`,
      `gsts.f.getCorrespondingValueFromList(copyListReadonlyLocal.value, idx(1n))`
    ]
  },
  {
    name: 'temporary_assembly_list_local',
    mode: 'local',
    description: 'temporary assemblyList const mutation should use LocalVariable',
    includes: [
      `const temporaryAssemblyList = gsts.f.initLocalVariable("int_list");`,
      `gsts.f.setLocalVariable(temporaryAssemblyList.localVariable, f.assemblyList([1n, 2n], 'int'));`,
      `gsts.f.modifyValueInList(temporaryAssemblyList.value, idx(0n), 15n);`
    ]
  },
  {
    name: 'temporary_literal_list_local',
    mode: 'local',
    description: 'array literal const mutation should use LocalVariable',
    includes: [
      `const temporaryLiteralList = gsts.f.initLocalVariable("int_list");`,
      `gsts.f.modifyValueInList(temporaryLiteralList.value, idx(0n), 16n);`
    ]
  },
  {
    name: 'temporary_list_wrapper_local',
    mode: 'local',
    description: 'list(type, items) const mutation should use LocalVariable',
    includes: [
      `const temporaryListWrapper = gsts.f.initLocalVariable("int_list");`,
      `gsts.f.setLocalVariable(temporaryListWrapper.localVariable, list('int', [1n, 2n]));`,
      `gsts.f.modifyValueInList(temporaryListWrapper.value, idx(0n), 20n);`
    ]
  },
  {
    name: 'temporary_empty_list_wrapper_local',
    mode: 'local',
    description: 'list(type) const mutation should use LocalVariable',
    includes: [
      `const temporaryEmptyListWrapper = gsts.f.initLocalVariable("int_list");`,
      `gsts.f.setLocalVariable(temporaryEmptyListWrapper.localVariable, list('int'));`,
      `gsts.f.modifyValueInList(temporaryEmptyListWrapper.value, idx(0n), 21n);`
    ]
  },
  {
    name: 'unknown_list_local',
    mode: 'local',
    description: 'unknown function-returned list mutation should stay conservative',
    includes: [
      `const unknownList = gsts.f.initLocalVariable("int_list");`,
      `gsts.f.setLocalVariable(unknownList.localVariable, makeUnknownList());`,
      `gsts.f.modifyValueInList(unknownList.value, idx(0n), 17n);`
    ]
  },
  {
    name: 'live_dict_f_get',
    mode: 'direct',
    description: 'auto-inferred const dict from f.get should remain direct without asDict',
    includes: [`const liveDictFGet = f.get(Vars.LiveDict);`, `liveDictFGet.set('b', 2n);`]
  },
  {
    name: 'live_dict_node_graph',
    mode: 'direct',
    description: 'const dict from getNodeGraphVariable().asDict should remain direct',
    includes: [
      `const liveDictNodeGraph = f.getNodeGraphVariable(Vars.LiveDict).asDict('str', 'int');`,
      `liveDictNodeGraph.set('c', 3n);`
    ]
  },
  {
    name: 'live_dict_custom_f',
    mode: 'direct',
    description: 'const dict from f.getCustomVariable().asDict should remain direct',
    includes: [
      `const liveDictCustomF = f`,
      `.getCustomVariable(selfForCustomDictF, 'custom_dict')`,
      `.asDict('str', 'int');`,
      `liveDictCustomF.set('d', 4n);`
    ]
  },
  {
    name: 'live_dict_custom_entity',
    mode: 'direct',
    description: 'const dict from entity.get().asDict should remain direct',
    includes: [
      `const liveDictCustomEntity = selfForCustomDictEntity.get('custom_dict').asDict('str', 'int');`,
      `liveDictCustomEntity.set('e', 5n);`
    ]
  },
  {
    name: 'live_dict_custom_entity_full_name',
    mode: 'direct',
    description: 'const dict from entity.getCustomVariable().asDict should remain direct',
    includes: [
      `const liveDictCustomEntityFullName = selfForCustomDictEntityFullName`,
      `.getCustomVariable('custom_dict')`,
      `.asDict('str', 'int');`,
      `liveDictCustomEntityFullName.set('f', 6n);`
    ]
  },
  {
    name: 'temporary_dict_direct',
    mode: 'direct',
    description: 'temporary dict current lowering remains direct and does not use list LocalVariable',
    includes: [`const temporaryDict = dict([{ k: 'x', v: 1n }]);`, `temporaryDict.set('y', 2n);`]
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

const outFile = result.outFiles.find((file) => file.endsWith('variable_plan_semantics_test.gs.ts'))
if (!outFile) throw new Error('Expected variable plan semantics GS output file to be emitted')

const text = normalize(fs.readFileSync(outFile, 'utf8'))
const report: string[] = []

for (const expectation of cases) {
  const segment = caseSegment(text, expectation.name)
  if (expectation.mode === 'direct') {
    assertNotIncludes(segment, 'initLocalVariable', `${expectation.name} LocalVariable`)
  } else if (expectation.mode === 'local') {
    assertIncludes(segment, 'initLocalVariable', `${expectation.name} LocalVariable`)
  }
  for (const include of expectation.includes ?? []) {
    assertIncludes(segment, include, `${expectation.name} expected output`)
  }
  for (const exclude of expectation.excludes ?? []) {
    assertNotIncludes(segment, exclude, `${expectation.name} excluded output`)
  }
  report.push(`[ok] ${expectation.name} - ${expectation.description}`)
}

console.log(report.join('\n'))
console.log(`[ok] variable plan semantics output verified: ${outFile}`)
