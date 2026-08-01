import assert from 'node:assert'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { mergeIrJsonFilesByGraphId } from '../../src/compiler/ir_merge.js'
import { irToGia } from '../../src/compiler/ir_to_gia_transform/index.js'
import { compileTsToGs } from '../../src/compiler/ts_to_gs_pipeline.js'
import { loadGiaProto } from '../../src/injector/proto.js'
import type { IRDocument } from '../../src/runtime/IR.js'
import {
  NodePin_Index_Kind,
  type Root as GiaRoot,
  type GraphNode,
  type NodePin
} from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto.js'

const root = process.cwd()
const tempRoot = path.join(root, 'tests', '.client-ts-transform-tmp')
const outDir = path.join(tempRoot, 'out')
const fixture = 'scripts/client-nodegraph/fixtures/client_ts_transform.ts'
const helperFixture = 'scripts/client-nodegraph/fixtures/client_ts_transform_helpers.ts'

function relative(file: string) {
  return path.relative(root, file).replace(/\\/g, '/')
}

function buildClientDocumentsInIsolatedProcess(entryOutFile: string): IRDocument[] {
  const marker = '__GSTS_CLIENT_DOCUMENTS__'
  const script = `
await import(${JSON.stringify(pathToFileURL(entryOutFile).href)})
const { buildClientGraphRegistriesIRDocuments } = await import('genshin-ts/runtime/core')
process.stdout.write(${JSON.stringify(marker)} + JSON.stringify(buildClientGraphRegistriesIRDocuments()))
`
  const output = execFileSync(process.execPath, ['--input-type=module', '--eval', script], {
    cwd: root,
    encoding: 'utf8'
  })
  const markerIndex = output.lastIndexOf(marker)
  assert.notStrictEqual(markerIndex, -1, 'isolated client graph process did not return IR')
  return JSON.parse(output.slice(markerIndex + marker.length)) as IRDocument[]
}

async function compile(entries: string[]) {
  return compileTsToGs({
    cfgDir: root,
    cfg: {
      compileRoot: '.',
      entries,
      outDir: relative(outDir),
      options: { optimize: { precompileExpression: false, removeUnusedNodes: false } }
    }
  })
}

async function expectCompileError(name: string, source: string, pattern: RegExp) {
  const file = path.join(tempRoot, `${name}.ts`)
  fs.writeFileSync(file, source, 'utf8')
  let error: unknown
  try {
    await compile([relative(file)])
  } catch (caught) {
    error = caught
  }
  assert.ok(error, `${name}: expected compilation to fail`)
  assert.match(String(error), pattern, `${name}: unexpected compilation error`)
}

async function expectRuntimeError(
  name: string,
  source: string,
  pattern: RegExp,
  buildDocuments = false
) {
  const file = path.join(tempRoot, `${name}.ts`)
  fs.writeFileSync(file, source, 'utf8')
  const result = await compile([relative(file)])
  let error: unknown
  try {
    await import(`${pathToFileURL(result.entryOutFiles[0]).href}?test=${Date.now()}`)
    if (buildDocuments) {
      const { buildAllGraphRegistriesIRDocuments } = await import('genshin-ts/runtime/core')
      buildAllGraphRegistriesIRDocuments()
    }
  } catch (caught) {
    error = caught
  }
  assert.ok(error, `${name}: expected graph construction to fail`)
  assert.match(String(error), pattern, `${name}: unexpected graph construction error`)
}

async function expectRuntimeSuccess(name: string, source: string) {
  const file = path.join(tempRoot, `${name}.ts`)
  fs.writeFileSync(file, source, 'utf8')
  const result = await compile([relative(file)])
  await import(`${pathToFileURL(result.entryOutFiles[0]).href}?test=${Date.now()}`)
}

function literalOnlyHitboxListSource(graphId: number, setup: string, attackTags: string) {
  return `import * as CE from 'genshin-ts/definitions/client_enums'
import * as E from 'genshin-ts/definitions/enum'
import { g } from 'genshin-ts/runtime/core'

g.characterSkill({ id: ${graphId} }).on('start', (_evt, f) => {
  ${setup}
  f.triggerSphericalHitboxAtSpecificLocation(
    E.TargetType.None,
    [0, 0, 0],
    [0, 0, 0],
    0,
    0,
    [E.EntityType.Creation],
    E.TriggerRestriction.TriggerOnlyOnce,
    0n,
    1,
    CE.AttackLayerConfig.OnlyOnHitHurtbox,
    ${attackTags},
    E.ElementalType.None,
    0,
    E.HitType.None,
    E.AttackType.None,
    0,
    false,
    0n,
    CE.KnockbackDirectionType.HitboxOnHitDirection,
    false,
    [0, 0, 0],
    [0, 0, 0],
    1,
    [0, 0, 0],
    [0, 0, 0],
    1,
    0,
    0n,
    CE.HitLevel.NoEffect,
    0,
    0
  )
})`
}

fs.rmSync(tempRoot, { recursive: true, force: true })
fs.mkdirSync(tempRoot, { recursive: true })

try {
  const result = await compile([fixture, helperFixture])
  assert.strictEqual(result.entryOutFiles.length, 1, 'pure client file must be an entry')
  const output = fs.readFileSync(result.entryOutFiles[0], 'utf8')
  assert.match(output, /^\/\/ @gsts:entry\n/)
  assert.match(output, /\.doubleBranch\(/)
  assert.match(output, /\.__gstsInitLocalVariable\(/)
  assert.match(output, /\.finiteLoop\(/)
  assert.match(output, /\.multipleBranches\(/)
  assert.match(output, /\.dataTypeConversion\(/)
  assert.match(output, /\.getCorrespondingValueFromList\(0, indexedValues\)/)
  assert.match(output, /\.getCorrespondingValueFromList\(idx\(1n\), indexedValues\)/)
  assert.doesNotMatch(output, /\.getCorrespondingValueFromList\(indexedValues,/)
  assert.match(output, /gsts\.fCreationStatus\.doubleBranch\(/)
  assert.doesNotMatch(output, /gsts\.f\.(?:doubleBranch|finiteLoop|addition)/)

  await import(`${pathToFileURL(result.entryOutFiles[0]).href}?test=${Date.now()}`)
  const { buildClientGraphRegistriesIRDocuments } = await import('genshin-ts/runtime/core')
  const { getRuntimeOptions, setRuntimeOptions } = await import('genshin-ts/runtime/runtime_config')
  assert.strictEqual(int(123), 123n)
  assert.strictEqual(float(1), 1)
  assert.strictEqual(bool(true), true)
  assert.strictEqual(str('value'), 'value')
  assert.strictEqual(
    gsts.ctx.withCtx('client_creation_status_decision_handler', () =>
      gsts.ctx.isClientGraphCtx('creation_status')
    ),
    false,
    'creation_status_decision context must not match creation_status'
  )
  const documents = buildClientGraphRegistriesIRDocuments()
  assert.strictEqual(documents.length, 7, 'fixture must build all seven client graph families')
  const subTypes = documents.map((document) => {
    assert.strictEqual(document.graph.type, 'client')
    if (document.graph.type !== 'client') throw new Error('expected client graph document')
    return document.graph.sub_type
  })
  assert.deepStrictEqual(
    new Set(subTypes),
    new Set([
      'character_skill',
      'character_control_skill',
      'creation_skill',
      'creation_status',
      'creation_status_decision',
      'bool_filter',
      'int_filter'
    ])
  )
  const creationStatusDocument = documents.find(
    (document) => document.graph.type === 'client' && document.graph.sub_type === 'creation_status'
  )
  const orderedEntryNodes =
    creationStatusDocument?.nodes?.filter((node) => node.type === 'node_graph_begins') ?? []
  assert.strictEqual(
    orderedEntryNodes.length,
    1,
    'multiple startN handlers must share one ordered-exclusive entry node'
  )
  const orderedEntryNext = orderedEntryNodes[0]?.next ?? []
  assert.deepStrictEqual(
    orderedEntryNext
      .map((next) => (typeof next === 'number' ? 0 : (next.source_index ?? 0)))
      .sort((a, b) => a - b),
    [0, 1],
    'start1/start2 must map to ordered-exclusive output pins 1/2'
  )
  const continuePreviousFrameNode = creationStatusDocument?.nodes?.find(
    (node) => node.type === 'continue_executing_previous_frame_behavior'
  )
  assert.ok(continuePreviousFrameNode, 'start2 must retain continue-previous-frame action')
  assert.strictEqual(
    continuePreviousFrameNode.next,
    undefined,
    'continue-previous-frame action must not have a successor execution edge'
  )
  const secondEntry = orderedEntryNext.find(
    (next) => typeof next !== 'number' && next.source_index === 1
  )
  assert.ok(
    secondEntry && typeof secondEntry !== 'number',
    'start2 must have a detailed root connection'
  )
  assert.strictEqual(
    secondEntry.node_id,
    continuePreviousFrameNode.id,
    'start2 must connect output pin 2 directly to its handler'
  )
  const stringBranches = creationStatusDocument?.nodes?.find(
    (node) => node.type === 'multiple_branches'
  )
  assert.deepStrictEqual(
    stringBranches?.args
      ?.slice(0, 2)
      .map((arg) => (arg?.type === 'conn' ? arg.value.type : arg?.type)),
    ['str', 'str'],
    'string switch must retain the string/string-list multipleBranches variant'
  )
  const characterSkillDocument = documents.find(
    (document) => document.graph.type === 'client' && document.graph.sub_type === 'character_skill'
  )
  const characterSkillNodeTypes = characterSkillDocument?.nodes?.map((node) => node.type) ?? []
  assert.ok(
    characterSkillNodeTypes.includes('equal'),
    'ordinary ==/=== must lower to the client equal node'
  )
  assert.strictEqual(
    characterSkillNodeTypes.filter((type) => type === 'enumeration_match').length,
    2,
    'enum equality and inequality must lower through client enumerationMatch'
  )
  assert.ok(
    characterSkillNodeTypes.includes('logical_not_operation'),
    'enum !=/!== must negate the client enumerationMatch result'
  )
  const indexedValueNodes =
    characterSkillDocument?.nodes?.filter(
      (node) => node.type === 'get_corresponding_value_from_list'
    ) ?? []
  assert.strictEqual(
    indexedValueNodes.length,
    3,
    '[], idx(), and direct f.getCorrespondingValueFromList() must all be retained'
  )
  const indexedListNodeIds = indexedValueNodes.map((node) => {
    const listArg = node.args?.[1]
    assert.strictEqual(listArg?.type, 'conn', 'list input must be a data connection')
    if (listArg?.type !== 'conn') throw new Error('expected list connection')
    return listArg.value.node_id
  })
  assert.strictEqual(
    new Set(indexedListNodeIds).size,
    1,
    'all three list reads must share one assembled list'
  )
  const indexedListNodeId = indexedListNodeIds[0]
  const indexedListNode = characterSkillDocument?.nodes?.find(
    (node) => node.id === indexedListNodeId
  )
  assert.strictEqual(indexedListNode?.type, 'assembly_list')
  assert.deepStrictEqual(
    indexedListNode?.args?.map((arg) => arg?.type),
    ['conn', 'int', 'int', 'int'],
    'list(dynamic, literal...) must preserve one connection and three literal slots'
  )
  const intervalBySubType = new Map(
    documents.flatMap((document) =>
      document.graph.type === 'client'
        ? [[document.graph.sub_type, document.graph.evaluation_interval] as const]
        : []
    )
  )
  assert.strictEqual(intervalBySubType.get('bool_filter'), 0.3)
  assert.strictEqual(intervalBySubType.get('int_filter'), 0.75)
  for (const subType of subTypes) {
    if (subType === 'bool_filter' || subType === 'int_filter') continue
    assert.strictEqual(intervalBySubType.get(subType), undefined)
  }

  const duplicateClientPath = path.join(outDir, 'duplicate-client.json')
  fs.writeFileSync(duplicateClientPath, JSON.stringify([documents[0], documents[0]]), 'utf8')
  assert.throws(
    () => mergeIrJsonFilesByGraphId({ outDirAbs: outDir, irJsonPaths: [duplicateClientPath] }),
    /client graph id may only be declared once|客户端节点图 id 只能声明一次/
  )

  const serverGraphId = 1082130699
  const duplicateServerPath = path.join(outDir, 'duplicate-server.json')
  const serverDocuments: IRDocument[] = [
    {
      ir_version: 1,
      ir_type: 'node_graph',
      graph: { type: 'server', id: serverGraphId, mode: 'beyond' },
      nodes: [{ id: 1, type: 'first_server_event' }]
    },
    {
      ir_version: 1,
      ir_type: 'node_graph',
      graph: { type: 'server', id: serverGraphId, mode: 'beyond' },
      nodes: [{ id: 1, type: 'second_server_event' }]
    }
  ]
  fs.writeFileSync(duplicateServerPath, JSON.stringify(serverDocuments), 'utf8')
  const [mergedServer] = mergeIrJsonFilesByGraphId({
    outDirAbs: outDir,
    irJsonPaths: [duplicateServerPath]
  })
  assert.strictEqual(mergedServer.merged.nodes?.length, 2)
  assert.deepStrictEqual(
    mergedServer.merged.nodes?.map((node) => node.id),
    [1, 2],
    'duplicate server graph ids must keep the existing multi-event merge behavior'
  )

  const ir = JSON.stringify(documents)
  for (const nodeType of [
    'double_branch',
    'finite_loop',
    'multiple_branches',
    'get_local_variable',
    'set_local_variable',
    'sine_function',
    'data_type_conversion_float',
    'data_type_conversion_int',
    'data_type_conversion_str',
    'data_type_conversion_bool',
    'get_corresponding_value_from_list'
  ]) {
    assert.ok(ir.includes(`"type":"${nodeType}"`), `missing transformed node ${nodeType}`)
  }

  const protoPath = path.join(
    root,
    'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto'
  )
  const { rootMessage } = loadGiaProto(protoPath)
  assert.throws(
    () =>
      irToGia(
        {
          ir_version: 1,
          ir_type: 'node_graph',
          graph: {
            type: 'client',
            sub_type: 'character_skill',
            mode: 'beyond',
            id: 1082130676
          },
          nodes: [
            {
              id: 1,
              type: 'data_type_conversion_str',
              args: [{ type: 'int', value: 1 }]
            },
            {
              id: 2,
              type: 'notify_server_node_graph',
              args: [
                { type: 'conn', value: { node_id: 1, index: 0, type: 'str' } },
                { type: 'str', value: '' },
                { type: 'str', value: '' }
              ]
            }
          ]
        },
        { protoPath }
      ),
    /CLIENT_LITERAL_REQUIRED.*notify_server_node_graph input pin #0/
  )
  documents.forEach((document, index) => {
    const bytes = irToGia(document, { protoPath })
    assert.ok(bytes.length > 0, `${subTypes[index]}: empty GIA output`)
    const message = rootMessage.decode(bytes.slice(20, -4))
    const decoded = rootMessage.toObject(message, {
      defaults: true,
      longs: Number
    }) as GiaRoot
    const clientGraph = decoded.graph?.graph?.inner.graph
    assert.ok(clientGraph, `${subTypes[index]}: missing decoded client graph`)
    const expectedInterval = intervalBySubType.get(subTypes[index])
    if (expectedInterval === undefined) {
      assert.strictEqual(clientGraph.evaluationInterval, undefined)
    } else {
      assert.ok(
        Math.abs((clientGraph.evaluationInterval ?? Number.NaN) - expectedInterval) < 1e-6,
        `${subTypes[index]}: unexpected GIA evaluationInterval ${String(clientGraph.evaluationInterval)}`
      )
    }
    if (subTypes[index] === 'bool_filter' || subTypes[index] === 'int_filter') {
      const endGenericId = subTypes[index] === 'bool_filter' ? 200000 : 200122
      const endNode = clientGraph.nodes?.find(
        (node) => Number(node.genericId?.nodeId) === endGenericId
      )
      assert.ok(endNode, `${subTypes[index]}: missing filter result node`)
      assert.strictEqual(
        Number(endNode.nodeIndex),
        1,
        `${subTypes[index]}: filter result node must use the editor-reserved index 1`
      )
      assert.strictEqual(
        clientGraph.nodes?.filter((node) => Number(node.nodeIndex) === 1).length,
        1,
        `${subTypes[index]}: filter result must be the only node using index 1`
      )
      const resultPin = endNode.pins?.find(
        (pin) => Number(pin.i1?.kind) === 3 && Number(pin.i1?.index) === 0
      )
      assert.strictEqual(
        resultPin?.connects?.length,
        1,
        `${subTypes[index]}: filter result must remain connected`
      )
    }
    if (subTypes[index] === 'character_skill') {
      const indexedList = clientGraph.nodes?.find(
        (node) => Number(node.nodeIndex) === indexedListNodeId
      )
      assert.ok(indexedList, 'indexed values must emit one assembly_list node')
      const indexedCountPin = indexedList.pins?.find(
        (pin) => Number(pin.i1?.kind) === 3 && Number(pin.i1?.index) === 0
      )
      assert.strictEqual(Number(indexedCountPin?.value?.bInt?.val), 4, 'indexed list count')
      const dynamicElementPin = indexedList.pins?.find(
        (pin) => Number(pin.i1?.kind) === 3 && Number(pin.i1?.index) === 1
      )
      assert.strictEqual(
        dynamicElementPin?.connects?.length,
        1,
        'dynamic list element must remain connected'
      )
      for (let pinIndex = 2; pinIndex <= 4; pinIndex++) {
        const literalPin: NodePin | undefined = indexedList.pins?.find(
          (pin) => Number(pin.i1?.kind) === 3 && Number(pin.i1?.index) === pinIndex
        )
        assert.strictEqual(
          Number(literalPin?.value?.bConcreteValue?.value?.bInt?.val),
          pinIndex,
          `literal list element pin ${pinIndex}`
        )
      }
      for (const valueNode of indexedValueNodes) {
        const decodedValueNode: GraphNode | undefined = clientGraph.nodes?.find(
          (node) => Number(node.nodeIndex) === valueNode.id
        )
        const listInput: NodePin | undefined = decodedValueNode?.pins?.find(
          (pin) => Number(pin.i1?.kind) === 3 && Number(pin.i1?.index) === 1
        )
        assert.strictEqual(
          Number(listInput?.connects?.[0]?.id),
          indexedListNodeId,
          `list reader ${valueNode.id} must connect to the assembled list`
        )
      }

      const maxList = clientGraph.nodes?.find(
        (node) =>
          Number(node.genericId?.nodeId) === 200049 && Number(node.concreteId?.nodeId) === 1028
      )
      assert.ok(maxList, 'Math.max must emit a float assembly_list')
      const countPin = maxList.pins?.find(
        (pin) => Number(pin.i1?.kind) === 3 && Number(pin.i1?.index) === 0
      )
      assert.strictEqual(Number(countPin?.value?.bInt?.val), 2, 'Math.max list count')
      assert.strictEqual(
        Boolean(countPin?.value?.alreadySetVal),
        true,
        'Math.max non-default list count must be explicitly set'
      )
    }
    if (subTypes[index] === 'creation_status') {
      const orderedEntry = clientGraph.nodes?.find(
        (node) => Number(node.genericId?.nodeId) === 200126
      )
      assert.ok(orderedEntry, 'creation status GIA must contain one ordered-exclusive entry node')
      const connectedEntryPins = (orderedEntry.pins ?? [])
        .filter(
          (pin) => pin.i1?.kind === NodePin_Index_Kind.OutFlow && (pin.connects?.length ?? 0) > 0
        )
        .map((pin) => Number(pin.i1?.index))
        .sort((a, b) => a - b)
      assert.deepStrictEqual(
        connectedEntryPins,
        [0, 1],
        'creation status GIA must connect ordered-exclusive output pins 1/2'
      )

      const continuePreviousFrame = clientGraph.nodes?.find(
        (node) => Number(node.genericId?.nodeId) === 200253
      )
      assert.ok(continuePreviousFrame, 'creation status GIA must contain continue-previous-frame')
      assert.strictEqual(
        continuePreviousFrame.pins?.some((pin) => pin.i1?.kind === NodePin_Index_Kind.OutFlow),
        false,
        'continue-previous-frame must not emit an artificial successor pin'
      )
    }
  })

  const importG = `import { g } from 'genshin-ts/runtime/core'`
  await expectCompileError(
    'client-cross-row-enum-operator',
    `import { MathematicalOperator } from 'genshin-ts/definitions/enum'
${importG}
g.characterSkill().on('start', (_evt, f) => {
  if (MathematicalOperator.Addition == MathematicalOperator.Logarithm) {
    f.forceExitAimingState()
  }
})`,
    /enum comparison type mismatch \(BasicMathematicalOperator vs QuickMathematicalOperator\)/
  )
  await expectRuntimeError(
    'client-literal-only-input',
    `${importG}
g.characterSkill({ id: 1082130676 }).on('start', (_evt, f) => {
  f.notifyServerNodeGraph(str(f.addition(1n, 2n)), '', '')
})`,
    /CLIENT_LITERAL_REQUIRED.*notifyServerNodeGraph\.string1.*data_type_conversion_str\.output/
  )

  const literalOnlyListCases = [
    {
      name: 'direct-array',
      graphId: 1082130790,
      setup: '',
      attackTags: "['direct_tag']",
      expectedTag: 'direct_tag'
    },
    {
      name: 'list-wrapper',
      graphId: 1082130791,
      setup: '',
      attackTags: "list('str', ['wrapped_tag'])",
      expectedTag: 'wrapped_tag'
    },
    {
      name: 'const-alias',
      graphId: 1082130792,
      setup: "const tags = ['alias_tag']",
      attackTags: 'tags',
      expectedTag: 'alias_tag'
    }
  ] as const

  for (const testCase of literalOnlyListCases) {
    const file = path.join(tempRoot, `client-literal-list-${testCase.name}.ts`)
    fs.writeFileSync(
      file,
      literalOnlyHitboxListSource(testCase.graphId, testCase.setup, testCase.attackTags),
      'utf8'
    )
    const caseResult = await compile([relative(file)])
    const [document] = buildClientDocumentsInIsolatedProcess(caseResult.entryOutFiles[0])
    assert.strictEqual(document?.graph.id, testCase.graphId, `${testCase.name}: wrong graph id`)

    const hitboxNode = document.nodes?.find(
      (node) => node.type === 'trigger_spherical_hitbox_at_specific_location'
    )
    assert.ok(hitboxNode, `${testCase.name}: missing hitbox node`)
    assert.deepStrictEqual(
      hitboxNode.args?.[10],
      { type: 'str_list', value: [testCase.expectedTag] },
      `${testCase.name}: attack tags must be an inline IR literal`
    )

    const bytes = irToGia(document, { protoPath })
    const decoded = rootMessage.toObject(rootMessage.decode(bytes.slice(20, -4)), {
      defaults: true,
      longs: Number
    }) as GiaRoot
    const giaNode = decoded.graph?.graph?.inner.graph?.nodes?.find(
      (node) => Number(node.nodeIndex) === hitboxNode.id
    )
    assert.strictEqual(
      Number(giaNode?.genericId?.nodeId),
      200111,
      `${testCase.name}: wrong hitbox generic id`
    )
    const attackTagPin = giaNode?.pins?.find(
      (pin) => pin.i1?.kind === NodePin_Index_Kind.InParam && Number(pin.i1?.index) === 17
    )
    const attackTagValue = attackTagPin?.value?.bConcreteValue?.value ?? attackTagPin?.value
    assert.strictEqual(Number(attackTagPin?.type), 10, `${testCase.name}: wrong tag pin type`)
    assert.strictEqual(
      attackTagPin?.connects?.length ?? 0,
      0,
      `${testCase.name}: literal-only tag pin must not connect`
    )
    assert.strictEqual(
      attackTagValue?.alreadySetVal,
      true,
      `${testCase.name}: tag pin must be explicitly set`
    )
    assert.deepStrictEqual(
      attackTagValue?.bArray?.entries?.map((entry) => entry.bString?.val),
      [testCase.expectedTag],
      `${testCase.name}: wrong encoded tag values`
    )
  }

  await expectRuntimeError(
    'client-literal-list-dynamic-element',
    literalOnlyHitboxListSource(1082130793, 'const tags = [str(f.addition(1n, 2n))]', 'tags'),
    /CLIENT_LITERAL_REQUIRED.*triggerSphericalHitboxAtSpecificLocation\.attackTagList.*assembly_list\.list/
  )

  const classicCreationGraphId = 1082130670
  const classicCreationPath = path.join(tempRoot, 'classic-creation-skill.ts')
  fs.writeFileSync(
    classicCreationPath,
    `${importG}
g.creationSkill({ id: ${classicCreationGraphId}, mode: 'classic' }).on('start', (_evt, f) => {
  const playerEntity = f.getSelfEntity()
  const characters = f.getPlayerSCharacterList(playerEntity)
  const activeCharacter = f.getActiveCharacterOfSpecifiedPlayer(playerEntity)
  const characterId = f.checkClassicModeCharacterId(activeCharacter)
  f.recoverCreationSHp(
    activeCharacter,
    float(f.getListLength(characters)),
    false
  )
  f.sendSignalToServerNodeGraph('classic_creation_character', characterId)
})`,
    'utf8'
  )
  const classicCreationResult = await compile([relative(classicCreationPath)])
  await import(`${pathToFileURL(classicCreationResult.entryOutFiles[0]).href}?test=${Date.now()}`)
  const classicCreationDocument = buildClientGraphRegistriesIRDocuments().find(
    (document) => document.graph.id === classicCreationGraphId
  )
  assert.ok(classicCreationDocument, 'missing classic creation skill graph')
  assert.strictEqual(classicCreationDocument.graph.mode, 'classic')
  const classicIr = JSON.stringify(classicCreationDocument)
  for (const nodeType of [
    'get_player_s_character_list',
    'get_active_character_of_specified_player',
    'check_classic_mode_character_id',
    'recover_creation_s_hp'
  ]) {
    assert.ok(classicIr.includes(`"type":"${nodeType}"`), `missing classic node ${nodeType}`)
  }
  const classicBytes = irToGia(classicCreationDocument, { protoPath })
  const classicMessage = rootMessage.decode(classicBytes.slice(20, -4))
  const classicDecoded = rootMessage.toObject(classicMessage, {
    defaults: true,
    longs: Number
  }) as GiaRoot
  assert.strictEqual(classicDecoded.modeFlag, 1, 'classic client GIA must set Root.modeFlag=1')
  const classicGenericIds = new Set(
    (classicDecoded.graph?.graph?.inner.graph?.nodes ?? []).map((node) => node.genericId?.nodeId)
  )
  for (const genericId of [200242, 200249, 200251, 200254]) {
    assert.ok(classicGenericIds.has(genericId), `missing classic generic id ${genericId}`)
  }

  const entityHelperGraphIds = {
    characterControlSkill: 1082130660,
    classicCreationSkill: 1082130661
  }
  const entityHelperPath = path.join(tempRoot, 'client-entity-helpers.ts')
  fs.writeFileSync(
    entityHelperPath,
    `${importG}
g.characterControlSkill({ id: ${entityHelperGraphIds.characterControlSkill} }).on('start', (_evt, f) => {
  const controlMotor = f.getSelfEntity()
  const position = controlMotor.pos
  const speed = controlMotor.get('speed').asType('float')
  controlMotor.addVelocity(speed, position, 0.5)
  controlMotor.fixedPointProjectileLaunch(10001, [0, 0, 0], [0, 0, 0], 1n)
})
g.creationSkill({ id: ${entityHelperGraphIds.classicCreationSkill}, mode: 'classic' }).on('start', (_evt, f) => {
  const selfEntity = f.getSelfEntity()
  const characters = selfEntity.characters
  const score = selfEntity.get('score').asType('int')
  selfEntity.recoverCreationSHp(float(f.addition(f.getListLength(characters), score)), false)
})`,
    'utf8'
  )
  const entityHelperResult = await compile([relative(entityHelperPath)])
  await import(`${pathToFileURL(entityHelperResult.entryOutFiles[0]).href}?test=${Date.now()}`)
  const entityHelperDocuments = buildClientGraphRegistriesIRDocuments().filter(
    (document) =>
      typeof document.graph.id === 'number' &&
      Object.values(entityHelperGraphIds).includes(document.graph.id)
  )
  assert.strictEqual(entityHelperDocuments.length, 2)
  const entityHelperIr = JSON.stringify(entityHelperDocuments)
  for (const nodeType of [
    'add_velocity',
    'fixed_point_projectile_launch',
    'get_entity_location',
    'get_custom_variable',
    'recover_creation_s_hp',
    'get_player_s_character_list'
  ]) {
    assert.ok(
      entityHelperIr.includes(`"type":"${nodeType}"`),
      `missing client entity helper node ${nodeType}`
    )
  }
  for (const document of entityHelperDocuments) {
    assert.ok(irToGia(document, { protoPath }).length > 0, 'client entity helper GIA is empty')
  }

  await expectRuntimeError(
    'client-entity-set-unavailable',
    `${importG}
g.creationSkill({ id: 1082130662 }).on('start', (_evt, f) => {
  const selfEntity = f.getSelfEntity()
  ;(selfEntity as unknown as { set(name: string, value: bigint): void }).set('score', 1n)
})`,
    /client entity helper set is not available in creation_skill beyond mode/
  )
  await expectRuntimeError(
    'classic-client-entity-helper-unavailable',
    `${importG}
g.creationSkill({ id: 1082130663, mode: 'classic' }).on('start', (_evt, f) => {
  const selfEntity = f.getSelfEntity()
  ;(selfEntity as unknown as { tauntTarget(): void }).tauntTarget()
})`,
    /client entity helper tauntTarget is not available in creation_skill classic mode/
  )

  const zhClientGraphIds = {
    characterSkill: 1082130693,
    classicCreationSkill: 1082130694
  }
  const zhClientPath = path.join(tempRoot, 'client-zh-aliases.ts')
  fs.writeFileSync(
    zhClientPath,
    `${importG}
g.characterSkill({ id: ${zhClientGraphIds.characterSkill}, lang: 'zh' }).on('start', (_evt, f) => {
  const sum = f.加法运算(1n, 2n)
  f.恢复生命值(f.获取自身实体(), 1, false, 1, 0n)
  f.多分支(sum, {
    3: () => { f.向服务器节点图发送信号('zh_alias_debug', String(f.绝对值运算(-1n))) },
    default: () => {
      const time = f.获取当前客户端时间高精度()
      f.向服务器节点图发送信号('zh_alias_debug', String(time.clientTimeMs))
    }
  })
})
g.creationSkill({ id: ${zhClientGraphIds.classicCreationSkill}, mode: 'classic', lang: 'zh' }).on('start', (_evt, f) => {
  const selfEntity = f.获取自身实体()
  const characters = f.获取玩家的角色列表(selfEntity)
  const characterId = f.查询经典模式角色编号(selfEntity)
  const currentSkill = f.获取复杂造物当前释放的技能()
  f.造物恢复生命值(
    selfEntity,
    float(f.获取列表长度(characters)),
    false
  )
  f.向服务器节点图发送信号('zh_alias_debug', characterId)
  f.向服务器节点图发送信号('zh_alias_debug', String(currentSkill))
})`,
    'utf8'
  )
  const zhClientResult = await compile([relative(zhClientPath)])
  const zhClientOutput = fs.readFileSync(zhClientResult.entryOutFiles[0], 'utf8')
  assert.match(zhClientOutput, /f\.加法运算\(1n, 2n\)/)
  assert.match(zhClientOutput, /f\.多分支\(sum/)
  assert.match(zhClientOutput, /f\.获取当前客户端时间高精度\(\)/)
  await import(`${pathToFileURL(zhClientResult.entryOutFiles[0]).href}?test=${Date.now()}`)
  const zhClientGraphIdSet = new Set(Object.values(zhClientGraphIds))
  const zhClientDocuments = buildClientGraphRegistriesIRDocuments().filter(
    (document) => typeof document.graph.id === 'number' && zhClientGraphIdSet.has(document.graph.id)
  )
  assert.strictEqual(zhClientDocuments.length, zhClientGraphIdSet.size)
  const zhClientIr = JSON.stringify(zhClientDocuments)
  for (const nodeType of [
    'addition',
    'multiple_branches',
    'absolute_value_operation',
    'get_current_client_time_high_precision',
    'recover_character_s_hp',
    'get_self_entity',
    'get_player_s_character_list',
    'check_classic_mode_character_id',
    'get_the_complex_creation_s_current_using_skill'
  ]) {
    assert.ok(zhClientIr.includes(`"type":"${nodeType}"`), `missing zh alias node ${nodeType}`)
  }

  await expectRuntimeError(
    'classic-character-skill-unavailable',
    `${importG}
g.characterSkill({ mode: 'classic' }).on('start', () => {})`,
    /character_skill is not available in classic mode/
  )
  await expectRuntimeError(
    'classic-character-control-skill-unavailable',
    `${importG}
g.characterControlSkill({ mode: 'classic' }).on('start', () => {})`,
    /character_control_skill is not available in classic mode/
  )
  await expectRuntimeError(
    'classic-creation-beyond-node',
    `${importG}
g.creationSkill({ id: 1082130674, mode: 'classic' }).on('start', (_evt, f) => {
  f.notifyServerNodeGraph('test', '', '')
})`,
    /creation_skill\.notify_server_node_graph is not available in classic mode/
  )
  await expectRuntimeError(
    'classic-helper-beyond-node',
    `${importG}
function gstsCreationSkillBeyondOnly() {
  gsts.fCreationSkill.notifyServerNodeGraph('test', '', '')
}
g.creationSkill({ id: 1082130672, mode: 'classic' }).on('start', () => {
  gstsCreationSkillBeyondOnly()
})`,
    /creation_skill\.notify_server_node_graph is not available in classic mode/
  )
  await expectRuntimeSuccess(
    'classic-helper-classic-node',
    `${importG}
function gstsCreationSkillClassicOnly() {
  const selfEntity = gsts.fCreationSkill.getSelfEntity()
  gsts.fCreationSkill.getPlayerSCharacterList(selfEntity)
}
g.creationSkill({ id: 1082130671, mode: 'classic' }).on('start', () => {
  gstsCreationSkillClassicOnly()
})`
  )
  await expectRuntimeError(
    'beyond-helper-classic-node',
    `${importG}
function gstsCreationSkillClassicOnly() {
  const selfEntity = gsts.fCreationSkill.getSelfEntity()
  gsts.fCreationSkill.getPlayerSCharacterList(selfEntity)
}
g.creationSkill({ id: 1082130673, mode: 'beyond' }).on('start', () => {
  gstsCreationSkillClassicOnly()
})`,
    /creation_skill\.get_player_s_character_list is not available in beyond mode/
  )
  await expectRuntimeError(
    'classic-filter-beyond-node',
    `${importG}
g.boolFilter({ id: 1082130675, mode: 'classic' }).on('start', (_evt, f) => {
  f.getCurrentClientTime()
  return true
})`,
    /bool_filter\.get_current_client_time is not available in classic mode/
  )

  const wrapperConversionGraphIds = {
    characterSkill: 1082130690,
    creationStatusDecision: 1082130691
  }
  const wrapperConversionPath = path.join(tempRoot, 'client-wrapper-conversions.ts')
  fs.writeFileSync(
    wrapperConversionPath,
    `${importG}
function gstsCharacterSkillConvertFloat(value: bigint) { return float(value) }
g.characterSkill({ id: ${wrapperConversionGraphIds.characterSkill} }).on('start', (_evt, f) => {
  const sameInt = int(f.addition(1n, 2n))
  const literalInt = int(123)
  const convertedFloat = gstsCharacterSkillConvertFloat(f.addition(3n, 4n))
  const nativeFloat = Number(f.addition(5n, 6n))
  const nativeString = String(f.addition(7n, 8n))
  const nativeBool = Boolean(f.addition(9n, 10n))
  const nativeMath = Math.sin(f.addition(11n, 12n))
  f.finiteLoop(sameInt, literalInt, () => {})
  f.setAttackWeight(convertedFloat, true)
  f.setAttackWeight(nativeFloat, nativeBool)
  f.setAttackWeight(nativeMath, true)
  f.sendSignalToServerNodeGraph('wrapper_conversion', nativeString)
})
g.creationStatusDecision({ id: ${wrapperConversionGraphIds.creationStatusDecision} }).on('start1', (_evt, f) => {
  f.doubleBranch(true, () => {
    const wiredInt = f.absoluteValueOperation(-1n)
    f.doubleBranch(f.greaterThan(float(wiredInt), 0), () => {}, () => {})
  }, () => {})
})`,
    'utf8'
  )
  const wrapperConversionResult = await compile([relative(wrapperConversionPath)])
  const wrapperConversionOutput = fs.readFileSync(wrapperConversionResult.entryOutFiles[0], 'utf8')
  assert.match(wrapperConversionOutput, /const sameInt = int\(f\.addition\(1n, 2n\)\)/)
  assert.match(wrapperConversionOutput, /const literalInt = int\(123\)/)
  assert.match(wrapperConversionOutput, /return float\(value\)/)
  assert.match(
    wrapperConversionOutput,
    /const convertedFloat = gstsCharacterSkillConvertFloat\(f\.addition\(3n, 4n\)\)/
  )
  assert.match(wrapperConversionOutput, /const nativeFloat = float\(f\.addition\(5n, 6n\)\)/)
  assert.match(wrapperConversionOutput, /const nativeString = str\(f\.addition\(7n, 8n\)\)/)
  assert.match(wrapperConversionOutput, /const nativeBool = bool\(f\.addition\(9n, 10n\)\)/)
  assert.match(
    wrapperConversionOutput,
    /const nativeMath = f\.sineFunction\(float\(f\.addition\(11n, 12n\)\)\)/
  )
  assert.match(wrapperConversionOutput, /f\.greaterThan\(float\(wiredInt\), 0\)/)
  await import(`${pathToFileURL(wrapperConversionResult.entryOutFiles[0]).href}?test=${Date.now()}`)
  const wrapperConversionDocuments = buildClientGraphRegistriesIRDocuments().filter(
    (document) =>
      typeof document.graph.id === 'number' &&
      Object.values(wrapperConversionGraphIds).includes(document.graph.id)
  )
  assert.strictEqual(wrapperConversionDocuments.length, 2)
  const characterWrapperDocument = wrapperConversionDocuments.find(
    (item) => item.graph.id === wrapperConversionGraphIds.characterSkill
  )
  assert.ok(characterWrapperDocument, 'missing character skill wrapper conversion graph')
  const characterConversionTypes =
    characterWrapperDocument.nodes
      ?.map((node) => node.type)
      .filter((type) => type.startsWith('data_type_conversion_')) ?? []
  assert.strictEqual(
    characterConversionTypes.filter((type) => type === 'data_type_conversion_float').length,
    3
  )
  assert.strictEqual(
    characterConversionTypes.filter((type) => type === 'data_type_conversion_str').length,
    1
  )
  assert.strictEqual(
    characterConversionTypes.filter((type) => type === 'data_type_conversion_bool').length,
    1
  )
  assert.doesNotMatch(
    JSON.stringify(characterConversionTypes),
    /data_type_conversion_int/,
    'same-type int wrappers and int(123) must not create conversion nodes'
  )
  const decisionWrapperDocument = wrapperConversionDocuments.find(
    (item) => item.graph.id === wrapperConversionGraphIds.creationStatusDecision
  )
  assert.ok(decisionWrapperDocument, 'missing creation status decision wrapper conversion graph')
  assert.deepStrictEqual(
    decisionWrapperDocument.nodes
      ?.map((node) => node.type)
      .filter((type) => type.startsWith('data_type_conversion_')),
    ['data_type_conversion_float'],
    'creation status decision must use its own client conversion functions'
  )

  const globalHelperGraphIds = {
    characterSkill: 1082130695,
    creationStatus: 1082130696
  }
  const globalHelperPath = path.join(tempRoot, 'client-global-helpers.ts')
  fs.writeFileSync(
    globalHelperPath,
    `${importG}
g.characterSkill({ id: ${globalHelperGraphIds.characterSkill} }).on('start', (_evt, f) => {
  const found = clientEntity(123n)
  const legacyFound = entity(124n)
  const convertedSelf = clientEntity(self)
  const convertedGameObject = clientEntity(GameObject.Find(125n))
  const values = list('int', [1n, 2n])
  const lookup = dict([{ k: 1n, v: 1n }])
  const lookupValue = lookup.get(1n)
  const lookupHasValue = lookup.has(1n)
  const lookupKeyCount = f.getListLength(lookup.keys())
  const lookupValueCount = f.getListLength(lookup.values())
  const lookupSize = lookup.size
  const random = Math.random()
  const floor = Math.floor(-1.25)
  const ceil = Math.ceil(1.25)
  const rounded = Math.round(-1.5)
  const truncated = Math.trunc(1.75)
  const hypot = Math.hypot(3, 4)
  const mathfFloor = Mathf.FloorToInt(-1.25)
  const mathfCeil = Mathf.CeilToInt(1.25)
  const sign = Math.sign(f.subtraction(1, 2))
  const atan2 = Math.atan2(1, 1)
  const randomValue = Random.value
  const randomRange = Random.Range(0, 1)
  const distance = Vector3.Distance(Vector3.zero, Vector3.one)
  const scaled = Vector3.Scale(Vector3.one, 0.5)
  const rotated = Vector3.Rotation(Vector3.up, Vector3.forward)
  const lerped = Vector3.Lerp(Vector3.zero, Vector3.one, 0.5)
  const clamped = Vector3.ClampMagnitude(Vector3.one, 0.5)
  const tagged = GameObject.FindWithTag(1n)
  const vectorX = Vector3.one.x
  const vectorY = Vector3.one.y
  const vectorZ = Vector3.one.z
  f.sendSignalToServerNodeGraph(
    'client_helper_values',
    str(f.getEntityLocation(found)),
    str(f.getListLength(values)),
    str(f.queryDictionaryValueByKey(lookup, 1n))
  )
  f.sendSignalToServerNodeGraph('client_helper_values', str(legacyFound), str(convertedSelf.pos), str(convertedGameObject.pos))
  f.sendSignalToServerNodeGraph('client_helper_values', str(random), str(sign), str(atan2))
  f.sendSignalToServerNodeGraph('client_helper_values', str(floor), str(ceil))
  f.sendSignalToServerNodeGraph('client_helper_values', str(rounded))
  f.sendSignalToServerNodeGraph('client_helper_values', str(truncated), str(hypot))
  f.sendSignalToServerNodeGraph('client_helper_values', str(mathfFloor), str(mathfCeil))
  f.sendSignalToServerNodeGraph('client_helper_values', str(randomValue), str(randomRange), str(distance))
  f.sendSignalToServerNodeGraph('client_helper_values', str(scaled), str(rotated), str(lerped))
  f.sendSignalToServerNodeGraph('client_helper_values', str(clamped), str(tagged))
  f.sendSignalToServerNodeGraph('client_helper_values', str(lookupValue), str(lookupHasValue), str(lookupKeyCount))
  f.sendSignalToServerNodeGraph('client_helper_values', str(lookupValueCount), str(lookupSize))
  f.sendSignalToServerNodeGraph('client_helper_values', str(vectorX), str(vectorY), str(vectorZ))
})
g.creationStatus({ id: ${globalHelperGraphIds.creationStatus}, mode: 'classic' }).on('start1', (_evt, f) => {
  f.doubleBranch(f.equal(entity(0), entity(0)), () => {}, () => {})
  f.doubleBranch(f.equal(clientEntity(0), clientEntity(null)), () => {}, () => {})
  f.doubleBranch(
    f.equal(f.queryDictionaryValueByKey(dict({ status: 1n }), 'status'), 1n),
    () => {},
    () => {}
  )
  f.doubleBranch(f.equal(dict({ status: 1n }).size, 1n), () => {}, () => {})
  f.doubleBranch(f.equal(f.getListLength(list('bool', [true])), 1n), () => {}, () => {})
  f.doubleBranch(
    f.greaterThanOrEqualTo(Vector3.Distance(Vector3.zero, Vector3.one), 0),
    () => {},
    () => {}
  )
  f.doubleBranch(
    f.equal(Vector3.ClampMagnitude(Vector3.one, 0.5), Vector3.one),
    () => {},
    () => {}
  )
  f.doubleBranch(f.greaterThanOrEqualTo(Math.trunc(1.75), 0), () => {}, () => {})
  f.doubleBranch(f.greaterThanOrEqualTo(Math.hypot(3, 4), 0), () => {}, () => {})
})`,
    'utf8'
  )
  const globalHelperResult = await compile([relative(globalHelperPath)])
  const globalHelperOutput = fs.readFileSync(globalHelperResult.entryOutFiles[0], 'utf8')
  assert.match(globalHelperOutput, /f\.getRandomNumber\(0, 1\)/)
  assert.match(globalHelperOutput, /f\.__gstsInitLocalVariable\("int", 0n\)/)
  assert.match(globalHelperOutput, /f\.arctangentFunction\(/)
  await import(`${pathToFileURL(globalHelperResult.entryOutFiles[0]).href}?test=${Date.now()}`)
  const globalHelperDocuments = buildClientGraphRegistriesIRDocuments().filter(
    (document) =>
      typeof document.graph.id === 'number' &&
      Object.values(globalHelperGraphIds).includes(document.graph.id)
  )
  assert.strictEqual(globalHelperDocuments.length, 2)
  const helperTypesById = new Map(
    globalHelperDocuments.map((document) => [
      document.graph.id,
      new Set(document.nodes?.map((node) => node.type) ?? [])
    ])
  )
  const characterHelperTypes = helperTypesById.get(globalHelperGraphIds.characterSkill)
  assert.ok(characterHelperTypes)
  for (const nodeType of [
    'query_entity_by_guid',
    'assembly_dictionary',
    'assembly_list',
    'get_random_number',
    'data_type_conversion_int',
    'data_type_conversion_float',
    'get_local_variable',
    'set_local_variable',
    'double_branch',
    'less_than',
    'greater_than',
    'arctangent_function',
    '_3d_vector_subtraction',
    '_3d_vector_modulo_operation',
    '_3d_vector_normalization',
    '_3d_vector_zoom',
    '_3d_vector_rotation',
    'get_minimum_value_from_list',
    'get_entity_list_by_unit_tag',
    'get_corresponding_value_from_list',
    'get_list_of_keys_from_dictionary',
    'get_list_of_values_from_dictionary',
    'query_dictionary_s_length',
    'query_if_dictionary_contains_specific_key',
    'split3d_vector'
  ]) {
    assert.ok(characterHelperTypes.has(nodeType), `client global helper missing ${nodeType}`)
  }
  const statusHelperTypes = helperTypesById.get(globalHelperGraphIds.creationStatus)
  assert.ok(statusHelperTypes)
  assert.ok(statusHelperTypes.has('assembly_dictionary'))
  assert.ok(statusHelperTypes.has('assembly_list'))
  assert.ok(statusHelperTypes.has('query_dictionary_s_length'))
  assert.doesNotMatch(
    JSON.stringify(
      globalHelperDocuments.find(
        (document) => document.graph.id === globalHelperGraphIds.creationStatus
      )
    ),
    /query_entity_by_guid/,
    'entity(0) must remain an unconnected entity placeholder'
  )

  await expectRuntimeError(
    'unavailable-client-entity-lookup',
    `${importG}
g.creationStatus({ id: 1082130697 }).on('start1', () => { entity(123n) })`,
    /entity\(\) requires client method queryEntityByGuid/
  )
  await expectRuntimeError(
    'unavailable-client-entity-lookup-explicit',
    `${importG}
g.creationStatus({ id: 1082130686 }).on('start1', () => { clientEntity(123n) })`,
    /clientEntity\(\) requires client method queryEntityByGuid/
  )
  await expectRuntimeError(
    'unavailable-client-print',
    `${importG}
g.creationSkill({ id: 1082130698 }).on('start', () => { print('client') })`,
    /CLIENT_HELPER_UNAVAILABLE.*print is not available in creation_skill/
  )
  await expectRuntimeError(
    'unavailable-client-dict-mutation',
    `${importG}
g.creationSkill({ id: 1082130687 }).on('start', () => {
  dict([{ k: 1n, v: 1n }]).set(1n, 2n)
})`,
    /dict\.set\(\) requires client method setOrAddKeyValuePairsToDictionary/
  )
  await expectRuntimeError(
    'client-local-variable-name-must-be-literal',
    `${importG}
g.characterSkill({ id: 1082130658 }).on('start', (_evt, f) => {
  const dynamicName = str(f.addition(1n, 2n))
  f.getLocalVariable(dynamicName)
})`,
    /CLIENT_LITERAL_REQUIRED.*getLocalVariable\.variableName/
  )
  await expectRuntimeError(
    'client-ray-filter-list-must-be-source-array',
    `${importG}
g.characterSkill({ id: 1082130659 }).on('start', (_evt, f) => {
  f.getRayFilterTypeList(f.getRayFilterTypeList())
})`,
    /CLIENT_LITERAL_REQUIRED.*getRayFilterTypeList\.types.*source-level array/
  )
  await expectCompileError(
    'unavailable-client-list-insert',
    `${importG}
g.characterSkill().on('start', () => {
  list('int', [1n]).push(2n)
})`,
    /client method "insertValueIntoList" is not available in character_skill/
  )
  await expectRuntimeSuccess(
    'available-client-list-iteration',
    `${importG}
g.characterSkill({ id: 1082130780 }).on('start', (_evt, f) => {
  list('int', [1n]).forEach(() => {
    f.forceExitAimingState()
  })
})`
  )

  const shadowedWrapperGraphId = 1082130692
  const shadowedWrapperPath = path.join(tempRoot, 'shadowed-client-wrapper.ts')
  fs.writeFileSync(
    shadowedWrapperPath,
    `${importG}
function float<T>(value: T): T { return value }
g.characterSkill({ id: ${shadowedWrapperGraphId} }).on('start', (_evt, f) => {
  const wiredInt = f.addition(1n, 2n)
  f.absoluteValueOperation(float(wiredInt))
})`,
    'utf8'
  )
  const shadowedWrapperResult = await compile([relative(shadowedWrapperPath)])
  const shadowedWrapperOutput = fs.readFileSync(shadowedWrapperResult.entryOutFiles[0], 'utf8')
  assert.match(shadowedWrapperOutput, /f\.absoluteValueOperation\(float\(wiredInt\)\)/)
  assert.doesNotMatch(shadowedWrapperOutput, /\.dataTypeConversion\(/)
  await import(`${pathToFileURL(shadowedWrapperResult.entryOutFiles[0]).href}?test=${Date.now()}`)
  const shadowedWrapperDocument = buildClientGraphRegistriesIRDocuments().find(
    (document) => document.graph.id === shadowedWrapperGraphId
  )
  assert.ok(shadowedWrapperDocument, 'missing shadowed wrapper graph')
  assert.doesNotMatch(JSON.stringify(shadowedWrapperDocument), /data_type_conversion_/)

  await expectCompileError(
    'mutable-outer-capture',
    `${importG}
let counter = 0n
g.characterSkill().on('start', () => { counter = counter + 1n })`,
    /cannot capture mutable outer variable "counter"/
  )
  fs.writeFileSync(
    path.join(tempRoot, 'mutable-outer-state.ts'),
    'export let sharedCounter = 0n\n',
    'utf8'
  )
  await expectCompileError(
    'imported-mutable-outer-capture',
    `${importG}
import { sharedCounter } from './mutable-outer-state.js'
g.characterSkill().on('start', (_evt, f) => { f.addition(sharedCounter, 1n) })`,
    /cannot capture mutable outer variable "sharedCounter"/
  )
  await expectCompileError(
    'cross-family-call',
    `${importG}
function gstsCharacterSkillShared(value: bigint) { return value + 1n }
g.creationSkill().on('start', () => { gstsCharacterSkillShared(0n) })`,
    /can only be called from the same client graph family/
  )
  await expectCompileError(
    'mismatched-f-namespace',
    `${importG}
g.characterSkill().on('start', () => { gsts.fCreationSkill.addition(1n, 2n) })`,
    /gsts\.fCreationSkill is only available in matching creation_skill/
  )
  await expectCompileError(
    'unsupported-math',
    `${importG}
g.characterSkill().on('start', () => { Math.sqrt(4) })`,
    /Math\.sqrt is not supported in client graph character_skill; available methods: Math\.abs/
  )
  await expectCompileError(
    'unavailable-local-variable',
    `${importG}
g.creationStatus().on('start1', () => { let value = 0n; value += 1n })`,
    /client method "initLocalVariable" is not available in creation_status/
  )
  await expectCompileError(
    'unavailable-ternary-local-variable',
    `${importG}
g.creationStatusDecision().on('start1', (_evt, f) => {
  const result = f.equal(1n, 1n) ? 'yes' : 'no'
  f.equal(result, 'yes')
})`,
    /conditional expressions without local variables only support bool, int, or float/
  )
  await expectRuntimeSuccess(
    'available-client-data-ternary',
    `${importG}
g.creationStatusDecision({ id: 1082130781 }).on('start1', (_evt, f) => {
  const result = f.equal(1n, 1n) ? 1n : 0n
  f.doubleBranch(f.equal(result, 1n), () => {}, () => {})
})`
  )
  await expectCompileError(
    'unavailable-client-filter-switch',
    `${importG}
g.boolFilter({ id: 1082130782 }).on('start', (_evt, f) => {
  const control = f.addition(1n, 1n)
  switch (control) {
    case 0n:
      return false
    case 1n:
      return false
    case 2n:
      return true
    default:
      return false
  }
})`,
    /client filter graphs do not support switch/
  )
  const repeatedConstGraphIds = {
    creationStatus: 1082130680,
    creationStatusDecision: 1082130681,
    boolFilter: 1082130682,
    intFilter: 1082130683
  }
  const repeatedConstPath = path.join(tempRoot, 'repeated-const-direct-evaluation.ts')
  fs.writeFileSync(
    repeatedConstPath,
    `${importG}
g.creationStatus({ id: ${repeatedConstGraphIds.creationStatus} }).on('start1', (_evt, f) => {
  const ready = f.equal(1n, 1n)
  if (ready) f.absoluteValueOperation(-1n)
  if (ready) f.absoluteValueOperation(-2n)
})
g.creationStatusDecision({ id: ${repeatedConstGraphIds.creationStatusDecision} }).on('start1', (_evt, f) => {
  const ready = f.equal(1n, 1n)
  if (ready) f.absoluteValueOperation(-1n)
  if (ready) f.absoluteValueOperation(-2n)
})
g.boolFilter({ id: ${repeatedConstGraphIds.boolFilter} }).on('start', (_evt, f) => {
  const ready = f.equal(1n, 1n)
  return f.logicalAndOperation(ready, ready)
})
g.intFilter({ id: ${repeatedConstGraphIds.intFilter} }).on('start', (_evt, f) => {
  const roll = f.getRandomNumber(0n, 10n)
  return f.addition(roll, roll)
})`,
    'utf8'
  )
  const repeatedConstResult = await compile([relative(repeatedConstPath)])
  const repeatedConstOutput = fs.readFileSync(repeatedConstResult.entryOutFiles[0], 'utf8')
  assert.doesNotMatch(repeatedConstOutput, /\.__gstsInitLocalVariable\(/)
  await import(`${pathToFileURL(repeatedConstResult.entryOutFiles[0]).href}?test=${Date.now()}`)
  const repeatedConstGraphIdSet = new Set(Object.values(repeatedConstGraphIds))
  const repeatedConstDocuments = buildClientGraphRegistriesIRDocuments().filter(
    (document) =>
      typeof document.graph.id === 'number' && repeatedConstGraphIdSet.has(document.graph.id)
  )
  assert.strictEqual(
    repeatedConstDocuments.length,
    repeatedConstGraphIdSet.size,
    'all reused const graphs must compile and register'
  )
  const repeatedConstIr = JSON.stringify(repeatedConstDocuments)
  assert.match(repeatedConstIr, /"type":"equal"/)
  assert.match(repeatedConstIr, /"type":"get_random_number"/)
  assert.doesNotMatch(repeatedConstIr, /"type":"(?:get|set)_local_variable"/)

  const controlFlowExamples = [
    {
      mode: 'beyond',
      file: path.join(root, 'tests/manual/client-control-flow/beyond.ts'),
      graphId: 1082130437,
      ternaryId: 1082130441,
      statusId: 1082130438,
      decisionId: 1082130439
    },
    {
      mode: 'classic',
      file: path.join(root, 'tests/manual/client-control-flow/classic.ts'),
      graphId: 1082130435,
      ternaryId: 1082130436,
      statusId: 1082130433,
      decisionId: 1082130434
    }
  ] as const
  let referenceControlFlowCounts: Record<string, number> | undefined

  for (const example of controlFlowExamples) {
    const controlFlowResult = await compile([relative(example.file)])
    const controlFlowOutput = fs.readFileSync(controlFlowResult.entryOutFiles[0], 'utf8')
    assert.match(controlFlowOutput, /\.listIterationLoop\(/)
    assert.match(controlFlowOutput, /\.continue\(\)/)
    assert.match(controlFlowOutput, /\.return\(\)/)
    assert.match(controlFlowOutput, /\.division\(/)
    assert.match(controlFlowOutput, /\.listIncludesThisValue\(/)
    assert.match(controlFlowOutput, /\.sendSignalToServerNodeGraph\(/)
    assert.match(
      controlFlowOutput,
      /const hasFourViaSimpleSome = f\.listIncludesThisValue\(4n,\s*values\.value\)/,
      'simple some(value => value === expected) must use the native includes node'
    )
    assert.match(
      controlFlowOutput,
      /setLocalVariable\(forEachSum\.localVariable,\s*f\.addition\(forEachSum\.value,\s*value\)\)/
    )
    assert.match(
      controlFlowOutput,
      /setLocalVariable\(mutableFloatRemainder\.localVariable,\s*f\.subtraction\(/,
      'float %= must lower through the client truncating modulo formula'
    )
    assert.match(
      controlFlowOutput,
      /const classicForSum = f\.__gstsInitLocalVariable\("int"\)[\s\S]*const whileIndex = f\.__gstsInitLocalVariable\("int"\)[\s\S]*const doWhileIndex = f\.__gstsInitLocalVariable\("int"\)/,
      'injectable example must exercise for, while, and do...while lowering'
    )
    assert.match(controlFlowOutput, /f\.enumerationMatch\(f\.getEntitySType\(selfEntity\)/)
    assert.match(
      controlFlowOutput,
      /f\.getRayDetectionResult\([\s\S]*\[EntityType\.Stage,\s*EntityType\.Creation\],[\s\S]*\[RayFilterType\.Hurtbox,\s*RayFilterType\.Scene\]/
    )
    assert.doesNotMatch(
      controlFlowOutput,
      /assemblyList\(\[EntityType\.Stage|assemblyList\(\[RayFilterType\.Hurtbox/,
      'client enum-list arguments must remain literals until IR -> GIA expansion'
    )
    assert.doesNotMatch(controlFlowOutput, /\.moduloOperation\(/)
    assert.doesNotMatch(controlFlowOutput, /\.multipleBranches\(/)
    assert.strictEqual(
      (controlFlowOutput.match(/\.equal\(__gsts_switch_control_\d+,\s*(?:0|1|2)n?\)/g) ?? [])
        .length,
      3,
      'creation_skill switch fallback must emit one comparison for every case'
    )
    assert.doesNotMatch(
      controlFlowOutput,
      /__gsts_(?:includes|some)_out_/,
      'server and client includes should use their native data node directly'
    )

    await import(`${pathToFileURL(controlFlowResult.entryOutFiles[0]).href}?test=${Date.now()}`)
    const documents = buildClientGraphRegistriesIRDocuments()
    const controlFlowDocument = documents.find((document) => document.graph.id === example.graphId)
    assert.ok(controlFlowDocument, `missing ${example.mode} client control-flow example graph`)
    assert.strictEqual(controlFlowDocument.graph.mode, example.mode)
    const controlFlowNodeTypes = new Set(controlFlowDocument.nodes?.map((node) => node.type) ?? [])
    for (const nodeType of [
      'finite_loop',
      'break_loop',
      'get_corresponding_value_from_list',
      'get_list_length',
      'get_local_variable',
      'set_local_variable',
      'double_branch',
      'division',
      'multiplication',
      'subtraction',
      'list_includes_this_value',
      'enumeration_match',
      'get_ray_detection_result',
      'send_signal_to_server_node_graph'
    ]) {
      assert.ok(
        controlFlowNodeTypes.has(nodeType),
        `${example.mode} control-flow example missing ${nodeType}`
      )
    }
    assert.ok(
      !controlFlowNodeTypes.has('multiple_branches'),
      'creation_skill switch must lower through doubleBranch'
    )

    const finiteLoopCount =
      controlFlowDocument.nodes?.filter((node) => node.type === 'finite_loop').length ?? 0
    const falseWritesByVariable = new Map<string, number>()
    for (const node of controlFlowDocument.nodes ?? []) {
      if (
        node.type !== 'set_local_variable' ||
        node.args?.[0]?.type !== 'str' ||
        node.args?.[1]?.type !== 'bool' ||
        node.args[1].value !== false
      ) {
        continue
      }
      const name = node.args[0].value
      falseWritesByVariable.set(name, (falseWritesByVariable.get(name) ?? 0) + 1)
    }
    const [returnGateName, returnGateResetCount] = [...falseWritesByVariable].sort(
      (left, right) => right[1] - left[1]
    )[0] ?? ['', 0]
    assert.ok(finiteLoopCount > 0, `${example.mode} example must contain finite loops`)
    assert.strictEqual(
      returnGateResetCount,
      finiteLoopCount,
      `${example.mode} must reset one shared return gate before every finite loop`
    )
    assert.ok(
      (controlFlowDocument.nodes ?? []).some(
        (node) =>
          node.type === 'set_local_variable' &&
          node.args?.[0]?.type === 'str' &&
          node.args[0].value === returnGateName &&
          node.args?.[1]?.type === 'bool' &&
          node.args[1].value === true
      ),
      `${example.mode} nested return must write the shared return gate`
    )

    const currentCounts = Object.fromEntries(
      [
        'finite_loop',
        'get_local_variable',
        'set_local_variable',
        'double_branch',
        'send_signal_to_server_node_graph'
      ].map((nodeType) => [
        nodeType,
        controlFlowDocument.nodes?.filter((node) => node.type === nodeType).length ?? 0
      ])
    )
    if (referenceControlFlowCounts) {
      assert.deepStrictEqual(
        currentCounts,
        referenceControlFlowCounts,
        'classic and beyond examples must retain the same control-flow structure'
      )
    } else {
      referenceControlFlowCounts = currentCounts
    }

    const ternaryProbeDocument = documents.find(
      (document) => document.graph.id === example.ternaryId
    )
    assert.ok(ternaryProbeDocument, `missing ${example.mode} client data-ternary probe graph`)
    assert.strictEqual(ternaryProbeDocument.graph.mode, example.mode)
    const ternaryProbeNodeTypes = new Set(
      ternaryProbeDocument.nodes?.map((node) => node.type) ?? []
    )
    for (const nodeType of [
      'division',
      'equal',
      'logical_not_operation',
      'data_type_conversion_int',
      'multiplication',
      'addition'
    ]) {
      assert.ok(
        ternaryProbeNodeTypes.has(nodeType),
        `${example.mode} data ternary probe missing ${nodeType}`
      )
    }

    const statusDocument = documents.find((document) => document.graph.id === example.statusId)
    assert.ok(statusDocument, `missing ${example.mode} control-flow status graph`)
    const statusEntry = statusDocument.nodes?.find((node) => node.type === 'node_graph_begins')
    assert.deepStrictEqual(
      (statusEntry?.next ?? [])
        .map((next) => (typeof next === 'number' ? 0 : (next.source_index ?? 0)))
        .sort((a, b) => a - b),
      [0, 1],
      `${example.mode} control-flow status graph must expose ordered output pins start1/start2`
    )
    const terminalNodeIds = new Set(
      statusDocument.nodes
        ?.filter((node) => node.type === 'continue_executing_previous_frame_behavior')
        .map((node) => node.id) ?? []
    )
    assert.strictEqual(terminalNodeIds.size, 2)
    for (const actionType of ['execute_skill', 'tactic_move_to_the_target_entity']) {
      const action = statusDocument.nodes?.find((node) => node.type === actionType)
      const next = action?.next?.[0]
      assert.ok(
        next !== undefined && terminalNodeIds.has(typeof next === 'number' ? next : next.node_id),
        `${example.mode} control-flow ${actionType} failure output must lead to its terminal fallback`
      )
    }

    const decisionDocument = documents.find((document) => document.graph.id === example.decisionId)
    assert.ok(decisionDocument, `missing ${example.mode} control-flow decision graph`)
    for (const nodeType of [
      'check_whether_self_is_in_battle',
      'check_the_horizontal_distance_from_self_to_target',
      'less_than',
      'double_branch',
      'switch_to_self_execution_status'
    ]) {
      assert.ok(
        decisionDocument.nodes?.some((node) => node.type === nodeType),
        `${example.mode} control-flow decision graph misses ${nodeType}`
      )
    }
    const switchIndexes =
      decisionDocument.nodes
        ?.filter((node) => node.type === 'switch_to_self_execution_status')
        .map((node) => {
          assert.strictEqual(node.args?.[1]?.type, 'config_id')
          assert.strictEqual(node.args?.[1]?.value, example.statusId)
          assert.strictEqual(node.args?.[2]?.type, 'int')
          return Number(node.args?.[2]?.value)
        })
        .sort((a, b) => a - b) ?? []
    assert.deepStrictEqual(
      switchIndexes,
      [1, 2],
      `${example.mode} control-flow decision graph must encode autonomous-logic parameters 1/2`
    )

    assert.ok(
      irToGia(controlFlowDocument, { protoPath }).length > 0,
      `${example.mode} client control-flow example GIA is empty`
    )
    assert.ok(
      irToGia(statusDocument, { protoPath }).length > 0,
      `${example.mode} control-flow status GIA is empty`
    )
    assert.ok(
      irToGia(decisionDocument, { protoPath }).length > 0,
      `${example.mode} control-flow decision GIA is empty`
    )
  }

  const featureExamples = [
    {
      mode: 'beyond',
      file: path.join(root, 'tests/manual/features/beyond.ts'),
      graphs: [
        [1082130435, 'character_skill'],
        [1082130436, 'character_control_skill'],
        [1082130437, 'creation_skill'],
        [1082130438, 'creation_status'],
        [1082130439, 'creation_status_decision'],
        [1082130440, 'bool_filter'],
        [1082130441, 'int_filter']
      ],
      statusId: 1082130438,
      decisionId: 1082130439,
      signalGraphIds: [1082130435, 1082130436, 1082130437]
    },
    {
      mode: 'classic',
      file: path.join(root, 'tests/manual/features/classic.ts'),
      graphs: [
        [1082130444, 'creation_skill'],
        [1082130445, 'creation_status'],
        [1082130446, 'creation_status_decision'],
        [1082130449, 'bool_filter'],
        [1082130448, 'int_filter']
      ],
      statusId: 1082130445,
      decisionId: 1082130446,
      signalGraphIds: [1082130444]
    }
  ] as const

  for (const example of featureExamples) {
    const result = await compile([relative(example.file)])
    const output = fs.readFileSync(result.entryOutFiles[0], 'utf8')
    assert.match(output, /\.sendSignalToServerNodeGraph\(/)
    assert.match(output, /gstsClientCreationSkillIncrement/)
    assert.match(output, /gstsClientCreationStatusIncrement/)
    assert.match(output, /gstsClientCreationStatusDecisionIncrement/)
    assert.match(output, /gstsClientBoolFilterNot/)
    assert.match(output, /gstsClientIntFilterIncrement/)

    const documents = buildClientDocumentsInIsolatedProcess(result.entryOutFiles[0])
    for (const [graphId, subType] of example.graphs) {
      const document = documents.find((candidate) => candidate.graph.id === graphId)
      assert.ok(document, `missing ${example.mode} feature graph id=${graphId}`)
      assert.strictEqual(document.graph.mode, example.mode)
      assert.strictEqual(document.graph.sub_type, subType)
      assert.ok(
        irToGia(document, { protoPath }).length > 0,
        `${example.mode} feature graph id=${graphId} GIA is empty`
      )
    }
    for (const graphId of example.signalGraphIds) {
      const document = documents.find((candidate) => candidate.graph.id === graphId)
      assert.ok(
        document?.nodes?.some((node) => node.type === 'send_signal_to_server_node_graph'),
        `${example.mode} feature graph id=${graphId} must report through the server signal`
      )
    }

    const statusDocument = documents.find((candidate) => candidate.graph.id === example.statusId)
    assert.ok(statusDocument, `missing ${example.mode} movable-monster status graph`)
    const statusEntry = statusDocument.nodes?.find((node) => node.type === 'node_graph_begins')
    assert.ok(statusEntry, `${example.mode} status graph must contain its ordered entry`)
    assert.deepStrictEqual(
      (statusEntry.next ?? [])
        .map((next) => (typeof next === 'number' ? 0 : (next.source_index ?? 0)))
        .sort((a, b) => a - b),
      [0, 1],
      `${example.mode} status graph must expose ordered output pins start1/start2`
    )
    const statusNodeTypes = statusDocument.nodes?.map((node) => node.type) ?? []
    for (const nodeType of [
      'execute_skill',
      'tactic_move_to_the_target_entity',
      'continue_executing_previous_frame_behavior'
    ]) {
      assert.ok(
        statusNodeTypes.includes(nodeType),
        `${example.mode} movable-monster status graph misses ${nodeType}`
      )
    }
    const terminalNodeIds = new Set(
      statusDocument.nodes
        ?.filter((node) => node.type === 'continue_executing_previous_frame_behavior')
        .map((node) => node.id) ?? []
    )
    assert.strictEqual(
      terminalNodeIds.size,
      2,
      `${example.mode} ordered status branches must each end in a terminal fallback`
    )
    for (const actionType of ['execute_skill', 'tactic_move_to_the_target_entity']) {
      const action = statusDocument.nodes?.find((node) => node.type === actionType)
      const next = action?.next?.[0]
      assert.ok(
        next !== undefined && terminalNodeIds.has(typeof next === 'number' ? next : next.node_id),
        `${example.mode} ${actionType} failure output must lead to its terminal fallback`
      )
    }

    const decisionDocument = documents.find(
      (candidate) => candidate.graph.id === example.decisionId
    )
    assert.ok(decisionDocument, `missing ${example.mode} movable-monster decision graph`)
    const decisionNodeTypes = decisionDocument.nodes?.map((node) => node.type) ?? []
    for (const nodeType of [
      'check_whether_self_is_in_battle',
      'check_the_horizontal_distance_from_self_to_target',
      'less_than',
      'double_branch',
      'switch_to_self_execution_status'
    ]) {
      assert.ok(
        decisionNodeTypes.includes(nodeType),
        `${example.mode} movable-monster decision graph misses ${nodeType}`
      )
    }
    const switches =
      decisionDocument.nodes?.filter((node) => node.type === 'switch_to_self_execution_status') ??
      []
    assert.strictEqual(switches.length, 2)
    assert.deepStrictEqual(
      switches
        .map((node) => {
          const statusId = node.args?.[1]
          const autonomousLogicIndex = node.args?.[2]
          assert.strictEqual(statusId?.type, 'config_id')
          assert.strictEqual(statusId?.value, example.statusId)
          assert.strictEqual(autonomousLogicIndex?.type, 'int')
          return Number(autonomousLogicIndex?.value)
        })
        .sort((a, b) => a - b),
      [1, 2],
      `${example.mode} decision graph must encode autonomous-logic parameters 1/2`
    )
  }

  const unoptimizedLoopGraphId = 1082130786
  await expectRuntimeSuccess(
    'unoptimized-client-loop-without-return',
    `${importG}
g.characterSkill({ id: ${unoptimizedLoopGraphId} }).on('start', (_evt, f) => {
  let sum = 0n
  for (let index = 0n; index < 2n; index += 1n) {
    sum += index
  }
  if (sum >= 0n) f.forceExitAimingState()
})`
  )
  const previousRuntimeOptions = getRuntimeOptions()
  setRuntimeOptions({
    optimize: {
      ...previousRuntimeOptions.optimize,
      removeUnusedNodes: false
    }
  })
  try {
    const unoptimizedLoopDocument = buildClientGraphRegistriesIRDocuments().find(
      (document) => document.graph.id === unoptimizedLoopGraphId
    )
    assert.ok(unoptimizedLoopDocument, 'missing unoptimized client loop graph')
    const connectedDataNodeIds = new Set(
      (unoptimizedLoopDocument.nodes ?? []).flatMap((node) =>
        (node.args ?? [])
          .filter((arg) => arg?.type === 'conn')
          .map((arg) => (arg?.type === 'conn' ? arg.value.node_id : -1))
      )
    )
    assert.ok(
      unoptimizedLoopDocument.nodes?.some(
        (node) => node.type === 'get_local_variable' && !connectedDataNodeIds.has(node.id)
      ),
      'removeUnusedNodes=false fixture must retain an unconsumed return-gate getter'
    )
    assert.ok(
      irToGia(unoptimizedLoopDocument, { protoPath }).length > 0,
      'unconsumed local-variable getter must infer its type from the matching setter'
    )
  } finally {
    setRuntimeOptions(previousRuntimeOptions)
  }

  await expectRuntimeError(
    'duplicate-client-handler',
    `${importG}
const graph = g.creationStatus({ id: 1082130688 })
graph.on('start1', () => {})
graph.on('start1', () => {})`,
    /client creation_status graph may only register one start1 handler/
  )
  await expectRuntimeError(
    'duplicate-client-id',
    `${importG}
g.creationStatus({ id: 1082130689 }).on('start1', () => {})
g.creationStatus({ id: 1082130689 }).on('start1', () => {})`,
    /client graph id may only be declared once: id=1082130689/,
    true
  )
  await expectCompileError(
    'client-recursion',
    `${importG}
function gstsCharacterSkillA(value: bigint): bigint { return gstsCharacterSkillB(value) }
function gstsCharacterSkillB(value: bigint): bigint { return gstsCharacterSkillA(value) }
g.characterSkill().on('start', () => { gstsCharacterSkillA(0n) })`,
    /client gsts function recursion is not supported/
  )

  console.log('[ok] client TS transform entry, lowering, aliases, GIA, and errors verified')
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true })
}
