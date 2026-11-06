import assert from 'node:assert/strict'
import fs from 'node:fs'

import { CLIENT_NODE_TYPES_BY_SUB_TYPE_AND_MODE } from '../../src/definitions/client_method_modes.js'
import type { ClientGraphMode, ClientGraphSubType } from '../../src/runtime/IR.js'
import { CLIENT_NODE_METADATA } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.js'
import { decode_gia_file } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/decode.js'
import { NodePin_Index_Kind } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto.js'

type CoverageGraph = {
  mode: ClientGraphMode
  subType: ClientGraphSubType
  id: number
  name: string
  methodCount: number
  expectedNodeTypeCount: number
  literalArgs: number
  wiredArgs: number
  uncoveredNodeTypes: string[]
}

type GapRecord = {
  subType: ClientGraphSubType
  nodeType: string
  reason: string
}

type CoverageReport = {
  format: number
  seed: number
  graphs: CoverageGraph[]
  knownGenerationGaps: GapRecord[]
}

type MetadataRecord = {
  subType: ClientGraphSubType
  nodeType: string
  genericId: number
  inputs: Array<{ index: number }>
  outputs: Array<{ index: number }>
}

type IrConnection = {
  node_id: number
  index?: number
}

type IrArg = {
  type: string
  value?: unknown
}

type IrNode = {
  id: number
  type: string
  args?: Array<IrArg | null>
}

type IrDocument = {
  graph: {
    id: number
    name: string
    mode: ClientGraphMode
    sub_type: ClientGraphSubType
  }
  nodes: IrNode[]
}

type GiaValue = {
  alreadySetVal?: boolean
  bEnum?: { val?: number }
  bInt?: { val?: number }
  bConcreteValue?: { value?: GiaValue }
}

type GiaConnection = {
  id?: number
}

type GiaPin = {
  i1: { kind: number; index: number }
  connects?: GiaConnection[]
  value?: GiaValue
}

const CLIENT_SEND_SIGNAL_PLACEHOLDER_GID = 300002
const SPECIAL_ARGUMENT_NODE_TYPES = new Set([
  'assembly_dictionary',
  'assembly_list',
  'create_dictionary',
  'data_type_conversion',
  'enumeration_match',
  'get_entity_type_list',
  'get_list_of_keys_from_dictionary',
  'get_list_of_values_from_dictionary',
  'get_local_variable',
  'get_ray_filter_type_list',
  'multiple_branches',
  'query_dictionary_s_length',
  'query_dictionary_value_by_key',
  'query_if_dictionary_contains_specific_key',
  'query_if_dictionary_contains_specific_value',
  'send_signal_to_server_node_graph',
  'set_local_variable'
])
const SCALAR_LITERAL_TYPES = new Set([
  'bool',
  'config_id',
  'enum',
  'faction',
  'float',
  'guid',
  'int',
  'prefab_id',
  'str',
  'vec3'
])
const MANUAL_GRAPH_IDS = new Map<string, number>([
  ['beyond.character_skill', 1082130435],
  ['beyond.character_control_skill', 1082130436],
  ['beyond.creation_skill', 1082130437],
  ['beyond.creation_status', 1082130438],
  ['beyond.creation_status_decision', 1082130439],
  ['beyond.bool_filter', 1082130440],
  ['beyond.int_filter', 1082130441],
  ['classic.creation_skill', 1082130444],
  ['classic.creation_status', 1082130445],
  ['classic.creation_status_decision', 1082130446],
  ['classic.bool_filter', 1082130449],
  ['classic.int_filter', 1082130448]
])

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function normalizeNodeType(nodeType: string): string {
  return nodeType.replace(/^data_type_conversion_.+$/, 'data_type_conversion')
}

function asConnection(arg: IrArg | null): IrConnection | undefined {
  if (arg?.type !== 'conn' || !arg.value || typeof arg.value !== 'object') return undefined
  const value = arg.value as { node_id?: unknown; index?: unknown }
  if (typeof value.node_id !== 'number') return undefined
  return {
    node_id: value.node_id,
    index: typeof value.index === 'number' ? value.index : undefined
  }
}

function gapSet(report: CoverageReport, subType: ClientGraphSubType): Set<string> {
  return new Set(
    report.knownGenerationGaps.filter((gap) => gap.subType === subType).map((gap) => gap.nodeType)
  )
}

function assertIrCoverage(
  graph: CoverageGraph,
  document: IrDocument,
  metadataByKey: ReadonlyMap<string, MetadataRecord>,
  report: CoverageReport
): void {
  assert.equal(document.graph.id, graph.id)
  assert.equal(document.graph.name, `_GSTS_${graph.name}`)
  assert.equal(document.graph.mode, graph.mode)
  assert.equal(document.graph.sub_type, graph.subType)
  assert.ok(graph.literalArgs > 0, `${graph.name}: no literal input assignments`)
  assert.ok(graph.wiredArgs > 0, `${graph.name}: no wired input assignments`)

  const knownGaps = gapSet(report, graph.subType)
  assert.deepEqual(
    [...graph.uncoveredNodeTypes].sort(),
    [...knownGaps].sort(),
    `${graph.name}: uncovered nodes differ from the checked-in generation gaps`
  )

  const expectedNodeTypes = CLIENT_NODE_TYPES_BY_SUB_TYPE_AND_MODE[graph.subType][
    graph.mode
  ] as readonly string[]
  const actualNodeTypes = new Set(document.nodes.map((node) => normalizeNodeType(node.type)))
  const missing = expectedNodeTypes.filter(
    (nodeType) => !knownGaps.has(nodeType) && !actualNodeTypes.has(nodeType)
  )
  assert.deepEqual(missing, [], `${graph.name}: missing IR node types`)

  if (expectedNodeTypes.includes('send_signal_to_server_node_graph')) {
    const probeSignals = document.nodes.filter(
      (node) =>
        node.type === 'send_signal_to_server_node_graph' &&
        node.args?.[0]?.type === 'str' &&
        node.args[0].value === 'gsts_all_client_pin_probe'
    )
    assert.equal(probeSignals.length, 1, `${graph.name}: manual pin probe signal count`)
    assert.equal(probeSignals[0]?.args?.length, 10, `${graph.name}: pin probe must have 9 params`)
    assert.equal(
      probeSignals[0]?.args?.some(
        (arg) =>
          arg?.type === 'faction' ||
          (arg?.type === 'conn' &&
            typeof arg.value === 'object' &&
            arg.value !== null &&
            'type' in arg.value &&
            (arg.value.type === 'faction' || arg.value.type === 'faction_list'))
      ),
      false,
      `${graph.name}: signal params must not use faction types`
    )
  }

  const usedOutputs = new Map<number, Set<number>>()
  for (const node of document.nodes) {
    for (const arg of node.args ?? []) {
      const connection = asConnection(arg)
      if (!connection) continue
      const indexes = usedOutputs.get(connection.node_id) ?? new Set<number>()
      indexes.add(connection.index ?? 0)
      usedOutputs.set(connection.node_id, indexes)
    }
  }

  const unconsumedCustomVariableGetters = document.nodes
    .filter((node) => node.type === 'get_custom_variable' && !usedOutputs.has(node.id))
    .map((node) => node.id)
  assert.deepEqual(
    unconsumedCustomVariableGetters,
    [],
    `${graph.name}: get_custom_variable nodes must retain an output-type connection`
  )

  const unconsumedOutputs: string[] = []
  for (const nodeType of expectedNodeTypes) {
    if (knownGaps.has(nodeType)) continue
    const metadata = metadataByKey.get(`${graph.subType}.${nodeType}`)
    if (!metadata?.outputs.length) continue
    const instances = document.nodes.filter((node) => normalizeNodeType(node.type) === nodeType)
    const allOutputsConsumed = instances.some((node) =>
      metadata.outputs.every((output) => usedOutputs.get(node.id)?.has(output.index))
    )
    if (!allOutputsConsumed) unconsumedOutputs.push(nodeType)
  }
  assert.deepEqual(
    unconsumedOutputs,
    [],
    `${graph.name}: at least one output pin is not connected to a retained consumer`
  )
}

function assertGiaCoverage(
  graph: CoverageGraph,
  document: IrDocument,
  giaFile: string,
  metadataByKey: ReadonlyMap<string, MetadataRecord>,
  report: CoverageReport
): void {
  assert.ok(fs.existsSync(giaFile), `${graph.name}: missing ${giaFile}`)
  const decoded = decode_gia_file(giaFile, undefined, true)
  const nodes = decoded.graph.graph?.inner.graph?.nodes ?? []
  const nodesByGenericId = new Map<number, typeof nodes>()
  const conversionGenericId = metadataByKey.get(`${graph.subType}.data_type_conversion`)?.genericId
  let wiredInputPins = 0
  let literalOrDefaultInputPins = 0
  let checkedScalarLiterals = 0

  for (const node of nodes) {
    const genericId = Number(node.genericId?.nodeId)
    const list = nodesByGenericId.get(genericId) ?? []
    list.push(node)
    nodesByGenericId.set(genericId, list)
    assert.notEqual(node.concreteId?.nodeId, undefined, `${graph.name}: unresolved concrete id`)

    for (const pin of node.pins ?? []) {
      if (pin.i1.kind !== NodePin_Index_Kind.InParam) continue
      if ((pin.connects?.length ?? 0) > 0) wiredInputPins += 1
      else literalOrDefaultInputPins += 1
      // The editor protocol keeps data_type_conversion pin 0 as a hidden
      // conversion-selector enum. Its reflective index is intentionally -1;
      // the user-facing typed input/output pins must still be fully resolved.
      if (genericId === conversionGenericId && pin.i1.index === 0) continue
      assert.notEqual(
        pin.value?.bConcreteValue?.indexOfConcrete,
        -1,
        `${graph.name}: unresolved reflective pin on genericId=${genericId}`
      )
    }
  }

  assert.ok(wiredInputPins > 0, `${graph.name}: decoded GIA has no wired input pins`)
  assert.ok(
    literalOrDefaultInputPins > 0,
    `${graph.name}: decoded GIA has no literal/default input pins`
  )

  const giaNodeByIndex = new Map(nodes.map((node) => [Number(node.nodeIndex), node]))
  const runtimeMetadataByNodeType = new Map(
    CLIENT_NODE_METADATA.filter((record) => record.subType === graph.subType).map((record) => [
      record.nodeType,
      record
    ])
  )
  const originalNodeIds = new Set(document.nodes.map((node) => node.id))
  for (const irNode of document.nodes) {
    const nodeType = normalizeNodeType(irNode.type)
    if (SPECIAL_ARGUMENT_NODE_TYPES.has(nodeType)) continue
    const metadata = runtimeMetadataByNodeType.get(nodeType)
    const giaNode = giaNodeByIndex.get(irNode.id)
    if (!metadata || !giaNode) continue

    for (const [argIndex, arg] of (irNode.args ?? []).entries()) {
      if (!arg) continue
      const pinIndex: number = metadata.argPins?.[argIndex] ?? argIndex
      const giaPins = (giaNode.pins ?? []) as GiaPin[]
      const pin = giaPins.find(
        (candidate) =>
          candidate.i1.kind === NodePin_Index_Kind.InParam && candidate.i1.index === pinIndex
      )
      assert.ok(pin, `${graph.name}:${irNode.type} arg #${argIndex} misses input pin #${pinIndex}`)
      if (arg.type === 'conn') {
        assert.ok(
          (pin.connects?.length ?? 0) > 0,
          `${graph.name}:${irNode.type} wired arg #${argIndex} is not connected at pin #${pinIndex}`
        )
        continue
      }
      if (arg.type === 'enum_list') {
        const values = Array.isArray(arg.value) ? arg.value : []
        const builderType = values.every(
          (value) => typeof value === 'string' && value.startsWith('entity_type_')
        )
          ? 'get_entity_type_list'
          : values.every(
                (value) => typeof value === 'string' && /^ray_(hit_)?filter_type_/.test(value)
              )
            ? 'get_ray_filter_type_list'
            : undefined
        assert.ok(
          builderType,
          `${graph.name}:${irNode.type} enum-list arg #${argIndex} has no supported builder`
        )
        assert.equal(
          pin.connects?.length,
          1,
          `${graph.name}:${irNode.type} enum-list arg #${argIndex} must connect one builder`
        )
        const builderId = Number(pin.connects?.[0]?.id)
        assert.equal(
          originalNodeIds.has(builderId),
          false,
          `${graph.name}:${irNode.type} enum-list builder must be compiler-generated`
        )
        const builderNode = giaNodeByIndex.get(builderId)
        assert.ok(
          builderNode,
          `${graph.name}:${irNode.type} enum-list builder node #${builderId} is missing`
        )
        assert.equal(
          Number(builderNode.genericId?.nodeId),
          runtimeMetadataByNodeType.get(builderType)?.genericId,
          `${graph.name}:${irNode.type} enum-list arg #${argIndex} uses the wrong builder`
        )
        const builderPins = (builderNode.pins ?? []) as GiaPin[]
        const countPin = builderPins.find(
          (candidate) =>
            candidate.i1.kind === NodePin_Index_Kind.InParam && candidate.i1.index === 0
        )
        assert.equal(
          countPin?.value?.bInt?.val,
          values.length,
          `${graph.name}:${irNode.type} enum-list builder count`
        )
        for (let valueIndex = 0; valueIndex < values.length; valueIndex++) {
          const valuePin = builderPins.find(
            (candidate) =>
              candidate.i1.kind === NodePin_Index_Kind.InParam &&
              candidate.i1.index === valueIndex + 1
          )
          assert.equal(
            valuePin?.value?.alreadySetVal,
            true,
            `${graph.name}:${irNode.type} enum-list builder element #${valueIndex} was left unset`
          )
        }
        continue
      }
      assert.equal(
        pin.connects?.length ?? 0,
        0,
        `${graph.name}:${irNode.type} literal arg #${argIndex} unexpectedly connects pin #${pinIndex}`
      )
      if (!SCALAR_LITERAL_TYPES.has(arg.type)) continue

      const value = pin.value?.bConcreteValue?.value ?? pin.value
      assert.equal(
        value?.alreadySetVal,
        true,
        `${graph.name}:${irNode.type} literal arg #${argIndex} was left unset at pin #${pinIndex}`
      )
      if (arg.type === 'bool') {
        assert.equal(
          Number(value?.bEnum?.val),
          arg.value === true ? 1 : 0,
          `${graph.name}:${irNode.type} bool arg #${argIndex} payload at pin #${pinIndex}`
        )
      }
      checkedScalarLiterals += 1
    }
  }
  assert.ok(checkedScalarLiterals > 0, `${graph.name}: no scalar literal pins were verified`)

  if (graph.subType === 'character_skill') {
    const recover = document.nodes.find((node) => node.type === 'recover_character_s_hp')
    assert.ok(recover, `${graph.name}: missing recover_character_s_hp probe`)
    const ignoreAdjustment = recover.args?.[2]?.value
    assert.equal(typeof ignoreAdjustment, 'boolean')
    const recoverGia = giaNodeByIndex.get(recover.id)
    const ignoreAdjustmentPin = (recoverGia?.pins as GiaPin[] | undefined)?.find(
      (pin) => pin.i1.kind === NodePin_Index_Kind.InParam && pin.i1.index === 7
    )
    assert.equal(ignoreAdjustmentPin?.value?.alreadySetVal, true)
    assert.equal(ignoreAdjustmentPin?.value?.bEnum?.val, ignoreAdjustment ? 1 : 0)
  }

  const knownGaps = gapSet(report, graph.subType)
  const expectedNodeTypes = CLIENT_NODE_TYPES_BY_SUB_TYPE_AND_MODE[graph.subType][
    graph.mode
  ] as readonly string[]
  const missingGenericIds: string[] = []
  const incompletePins: string[] = []

  for (const nodeType of expectedNodeTypes) {
    if (knownGaps.has(nodeType)) continue
    const metadata = metadataByKey.get(`${graph.subType}.${nodeType}`)
    if (!metadata) continue
    const giaGenericId =
      nodeType === 'send_signal_to_server_node_graph'
        ? CLIENT_SEND_SIGNAL_PLACEHOLDER_GID
        : metadata.genericId
    const matchingNodes = nodesByGenericId.get(giaGenericId) ?? []
    if (!matchingNodes.length) {
      missingGenericIds.push(`${nodeType}:${giaGenericId}`)
      continue
    }

    const hasCompletePinShape = matchingNodes.some((node) => {
      const inputIndexes = new Set(
        (node.pins ?? [])
          .filter((pin) => pin.i1.kind === NodePin_Index_Kind.InParam)
          .map((pin) => pin.i1.index)
      )
      const outputIndexes = new Set(
        (node.pins ?? [])
          .filter((pin) => pin.i1.kind === NodePin_Index_Kind.OutParam)
          .map((pin) => pin.i1.index)
      )
      return (
        metadata.inputs.every((input) => inputIndexes.has(input.index)) &&
        metadata.outputs.every((output) => outputIndexes.has(output.index))
      )
    })
    if (!hasCompletePinShape) incompletePins.push(nodeType)
  }

  assert.deepEqual(missingGenericIds, [], `${graph.name}: decoded GIA misses generic ids`)
  assert.deepEqual(incompletePins, [], `${graph.name}: decoded GIA pin shape mismatch`)
}

function main(): void {
  const report = readJson<CoverageReport>('tests/manual/client-nodes/_coverage.json')
  const metadata = readJson<MetadataRecord[]>('resources/client_node_metadata.json')
  const metadataByKey = new Map(
    metadata.map((record) => [`${record.subType}.${record.nodeType}`, record])
  )

  assert.equal(report.format, 1)
  assert.equal(report.graphs.length, 12)
  assert.equal(new Set(report.graphs.map((graph) => graph.id)).size, report.graphs.length)
  for (const graph of report.graphs) {
    assert.equal(
      graph.id,
      MANUAL_GRAPH_IDS.get(`${graph.mode}.${graph.subType}`),
      `${graph.mode}.${graph.subType}: must reuse its tests/manual/features graph id`
    )
  }

  for (const mode of ['beyond', 'classic'] as const) {
    const modeGraphs = report.graphs.filter((graph) => graph.mode === mode)
    const documents = readJson<IrDocument[]>(`dist/tests/manual/client-nodes/${mode}.json`)
    assert.equal(documents.length, modeGraphs.length, `${mode}: graph document count`)

    for (const [index, graph] of modeGraphs.entries()) {
      const document = documents.find((candidate) => candidate.graph.id === graph.id)
      assert.ok(document, `${graph.name}: missing IR document`)
      assertIrCoverage(graph, document, metadataByKey, report)
      assertGiaCoverage(
        graph,
        document,
        `dist/tests/manual/client-nodes/${mode}_${index}.gia`,
        metadataByKey,
        report
      )
      console.log(
        `[ok] ${mode}.${graph.subType}: ${graph.methodCount} methods, ` +
          `${graph.literalArgs} literal args, ${graph.wiredArgs} wired args`
      )
    }
  }

  console.log(
    `[ok] all ${report.graphs.length} manual client graphs cover every generated node and output pin`
  )
  console.log(
    `[note] ${report.knownGenerationGaps.length} schema-dependent structure nodes remain explicit generation gaps`
  )
}

main()
