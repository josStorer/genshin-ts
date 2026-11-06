import fs from 'node:fs'
import path from 'node:path'

import protobuf from 'protobufjs'

import { SERVER_EVENT_ZH_TO_EN, SERVER_F_ZH_TO_EN } from '../../src/definitions/zh_aliases.js'
import {
  decode_gia_file,
  unwrap_gia
} from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/decode.js'
import { buildDocNameAlignment, lookupDocNode, type DocAlignment } from './doc_name_alignment.js'

type ClientGraphSubType =
  | 'character_skill'
  | 'character_control_skill'
  | 'creation_skill'
  | 'creation_status'
  | 'creation_status_decision'
  | 'bool_filter'
  | 'int_filter'

type DecodedRoot = ReturnType<typeof decode_gia_file>
type DecodedNode = NonNullable<
  NonNullable<DecodedRoot['graph']['graph']>['inner']['graph']['nodes']
>[number]

const DEFAULT_SAMPLE_ROOT = 'D:\\_S2\\mypy_test\\client_nodes'
const GIA_PROTO_PATH =
  'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto'
const CLIENT_NODE_METADATA_PATH = 'resources/client_node_metadata.json'
const CLIENT_NODE_MODES_PATH = 'resources/client_node_modes.json'
const CLIENT_NODE_STATIC_METADATA_PATH = 'resources/client_node_static_metadata.json'
const CLIENT_NODE_CONCRETE_VARIANTS_PATH = 'resources/client_node_concrete_variants.json'

const FAMILY_BY_DIR: Record<string, ClientGraphSubType> = {
  角色技能节点图: 'character_skill',
  角色操控技能节点图: 'character_control_skill',
  造物技能节点图: 'creation_skill',
  造物状态节点图: 'creation_status',
  造物状态决策节点图: 'creation_status_decision',
  布尔过滤器节点: 'bool_filter',
  整数过滤器节点: 'int_filter'
}

// User-defined signal senders/receivers carry dynamic high-range generic ids
// (0x60000018 send / 0x6000001B receive observed in round-2 samples); they are
// per-graph artifacts, not fixed node types, and are excluded from metadata.
const DYNAMIC_GENERIC_ID_MIN = 0x60000000

/** Nodes whose reflective pins are specialized by dedicated IR -> GIA handlers. */
const CUSTOM_REFLECTIVE_PIN_SPECIALIZATION_NODE_TYPES = new Set([
  'assembly_dictionary',
  'create_dictionary',
  'data_type_conversion',
  'enumeration_match',
  'get_custom_variable',
  'get_list_of_keys_from_dictionary',
  'get_list_of_values_from_dictionary',
  'get_local_variable',
  'query_dictionary_value_by_key',
  'query_if_dictionary_contains_specific_key',
  'query_if_dictionary_contains_specific_value',
  'set_local_variable'
])

// The one node present in every sample of a family: begins for skill/status
// families, the result end node for filter families.
const UNIVERSAL_NODE_BY_SUB_TYPE: Record<
  ClientGraphSubType,
  { genericId: number; nodeType: string }
> = {
  character_skill: { genericId: 200042, nodeType: 'node_graph_begins' },
  character_control_skill: { genericId: 200042, nodeType: 'node_graph_begins' },
  creation_skill: { genericId: 200042, nodeType: 'node_graph_begins' },
  creation_status: { genericId: 200126, nodeType: 'node_graph_begins' },
  creation_status_decision: { genericId: 200126, nodeType: 'node_graph_begins' },
  bool_filter: { genericId: 200000, nodeType: 'node_graph_end_boolean' },
  int_filter: { genericId: 200122, nodeType: 'node_graph_end_integer' }
}

const EXPECTED_STATUS_EXTENSION = JSON.stringify({ type: 1, inner: { value: 1 } })

const CLIENT_VAR_TYPE_NAMES: Record<number, string> = {
  1: 'entity',
  2: 'entity_list',
  3: 'int',
  4: 'int_list',
  5: 'bool',
  6: 'bool_list',
  7: 'float',
  8: 'float_list',
  9: 'str',
  10: 'str_list',
  11: 'vec3',
  12: 'vec3_list',
  13: 'enum',
  14: 'guid',
  15: 'guid_list',
  16: 'faction',
  17: 'enum_list',
  18: 'config_id',
  19: 'prefab_id',
  20: 'config_id_list',
  21: 'prefab_id_list',
  22: 'structure',
  23: 'structure_list',
  24: 'dict',
  25: 'faction_list'
}

const PIN_KIND_NAMES: Record<number, PinRecord['kind']> = {
  1: 'in_flow',
  2: 'out_flow',
  3: 'input',
  4: 'output',
  5: 'client_exec',
  6: 'client_signal'
}

type PinRecord = {
  index: number
  kind: 'input' | 'output' | 'in_flow' | 'out_flow' | 'client_exec' | 'client_signal'
  type: string
  /** localized editor pin name decoded from the static Node/TextMap resources */
  name?: string
  reflective?: boolean
  /** editor dropdown row for this concrete reflective pin */
  indexOfConcrete?: number
  clientVarType?: number
  /** single consistent literal payload observed across all set instances */
  defaultValue?: number | string | boolean | [number, number, number]
  /** editor i2 index when it differs from i1 (static Node protobuf evidence) */
  i2Index?: number
  /** whether the editor exposes a connection socket for this input */
  connectable?: boolean
  /** exact editor connection type; enum pins use their enum class id */
  connectionType?: number
}

type NodeRecord = {
  subType: ClientGraphSubType
  nodeType: string
  displayName: string
  graphType: number
  genericId: number
  concreteId: number | string | null
  inputs: PinRecord[]
  outputs: PinRecord[]
  flows?: PinRecord[]
  reflectMap?: Array<{ concreteId: number | string; variantKey: string; pins?: PinRecord[] }>
  specialKind?: string
  isStart?: boolean
  contextDeclaration?: { kind: number; index: number }
  sampleFile: string
}

type ClientGraphModeData = {
  status: 'available' | 'unavailable'
  reason: string
  genericIds: number[]
}

type ClientNodeModeData = {
  graphs: Record<
    ClientGraphSubType,
    {
      entryGenericId: number
      beyond: ClientGraphModeData
      classic: ClientGraphModeData
    }
  >
}

type StaticPinRecord = {
  index: number
  kind: PinRecord['kind']
  i2Index?: number
  name?: string
  clientVarType?: number
  connectable?: boolean
  connectionType?: number
  variants?: Array<{ clientVarType?: number; connectionType?: number }>
  defaultValue?: number | string | boolean | [number, number, number]
}

type ClientNodeStaticMetadata = {
  formatVersion: 2
  source: {
    scannedNodeFiles: number
    selectedClientNodes: number
    aggregateSha256: string
  }
  summary: {
    inputPins: number
    connectableInputs: number
    literalOnlyInputs: number
    reflectiveInputs: number
    pinsWithExplicitDefaults: number
    concreteVariantGroups: number
    concreteVariants: number
    concreteVariantBindings: number
  }
  nodes: Array<{
    genericId: number
    sourceFile: string
    sha256: string
    pins: StaticPinRecord[]
  }>
}

type StaticVariantBindingTuple = [number, number, number, number?, number?, number?]

type ClientNodeConcreteVariants = {
  formatVersion: 1
  sourceAggregateSha256: string
  nodes: Array<{
    genericId: number
    groups: Array<{
      graphType: number
      variants: Array<{
        concreteId: number
        bindings: StaticVariantBindingTuple[]
      }>
    }>
  }>
}

function walkGiaFiles(dir: string): string[] {
  const out: string[] = []
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name)
    if (item.isDirectory()) {
      out.push(...walkGiaFiles(full))
    } else if (item.isFile() && item.name.toLowerCase().endsWith('.gia')) {
      out.push(full)
    }
  }
  return out
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8')
}

function applyEditorStaticMetadata(records: NodeRecord[], modeData: ClientNodeModeData) {
  const creationRecovery = records.find(
    (record) => record.subType === 'creation_skill' && record.nodeType === 'recover_creation_s_hp'
  )
  if (!creationRecovery) throw new Error('[error] missing sampled creation recovery metadata')
  creationRecovery.genericId = 200249
  creationRecovery.displayName = '造物恢复生命值'

  const graphTypeBySubType: Record<ClientGraphSubType, number> = {
    bool_filter: 20001,
    int_filter: 20001,
    character_skill: 20002,
    character_control_skill: 20002,
    creation_skill: 20002,
    creation_status: 20007,
    creation_status_decision: 20007
  }
  const staticSeeds = new Map<number, Omit<NodeRecord, 'subType' | 'graphType'>>([
    [
      200242,
      {
        nodeType: 'get_player_s_character_list',
        displayName: '获取玩家的角色列表',
        genericId: 200242,
        concreteId: 1067,
        inputs: [{ index: 0, kind: 'input', type: 'entity', clientVarType: 1 }],
        outputs: [{ index: 0, kind: 'output', type: 'entity_list', clientVarType: 2 }],
        sampleFile: 'BeyondEditorStatic/Node/16783183026819652111.mihoyobin'
      }
    ],
    [
      200251,
      {
        nodeType: 'get_active_character_of_specified_player',
        displayName: '获取指定玩家的前台角色',
        genericId: 200251,
        concreteId: 1002,
        inputs: [{ index: 0, kind: 'input', type: 'entity', clientVarType: 1 }],
        outputs: [{ index: 0, kind: 'output', type: 'entity', clientVarType: 1 }],
        sampleFile: 'BeyondEditorStatic/Node/17432833879509313657.mihoyobin'
      }
    ],
    [
      200254,
      {
        nodeType: 'check_classic_mode_character_id',
        displayName: '查询经典模式角色编号',
        genericId: 200254,
        concreteId: 1069,
        inputs: [{ index: 0, kind: 'input', type: 'entity', clientVarType: 1 }],
        outputs: [{ index: 0, kind: 'output', type: 'int', clientVarType: 3 }],
        sampleFile: 'BeyondEditorStatic/Node/279208459246344190.mihoyobin'
      }
    ]
  ])

  const reused: Array<{
    subType: ClientGraphSubType
    genericId: number
    nodeType: string
    sourceSubType: ClientGraphSubType | 'static'
  }> = []

  // November editor fixed-id nodes. Pins come from the same static resource as the ids.
  const novemberSeeds: Array<[number, number, string]> = [
    [200301, 3014, 'get_ray_detection_result'],
    [200302, 3015, 'get_ray_filter_type_list'],
    [200303, 4029, 'tactic_aerial_landing'],
    [200307, 4227, 'whether_the_entity_has_the_specified_unit_status'],
    [200308, 4025, 'tactic_aerial_pursuit'],
    [200309, 4026, 'tactic_aerial_escape'],
    [200310, 4027, 'tactic_aerial_confrontation'],
    [200311, 4028, 'tactic_aerial_idling'],
    [200312, 1031, 'get_entity_type_list']
  ]
  const staticData = JSON.parse(
    fs.readFileSync(CLIENT_NODE_STATIC_METADATA_PATH, 'utf8')
  ) as ClientNodeStaticMetadata
  const editorNames = JSON.parse(fs.readFileSync('resources/mihoyo_editor_names.json', 'utf8')) as {
    nodes: Array<{ genericId: number; nameZh: string }>
  }
  for (const [genericId, concreteId, nodeType] of novemberSeeds) {
    const node = staticData.nodes.find((candidate) => candidate.genericId === genericId)!
    const pins: PinRecord[] = node.pins.map((pin) => ({
      index: pin.index,
      kind: pin.kind,
      clientVarType: pin.clientVarType,
      type: pin.clientVarType === undefined ? 'flow' : CLIENT_VAR_TYPE_NAMES[pin.clientVarType]
    }))
    staticSeeds.set(genericId, {
      nodeType,
      genericId,
      concreteId,
      displayName: editorNames.nodes.find((candidate) => candidate.genericId === genericId)!.nameZh,
      inputs: pins.filter((pin) => pin.kind === 'input'),
      outputs: pins.filter((pin) => pin.kind === 'output'),
      flows: pins.filter((pin) => pin.kind === 'in_flow' || pin.kind === 'out_flow'),
      sampleFile: `BeyondEditorStatic/${node.sourceFile}`
    })
  }

  for (const [subType, graph] of Object.entries(modeData.graphs) as Array<
    [ClientGraphSubType, ClientNodeModeData['graphs'][ClientGraphSubType]]
  >) {
    const supportedIds = new Set([...graph.beyond.genericIds, ...graph.classic.genericIds])
    for (const genericId of [...supportedIds].sort((a, b) => a - b)) {
      if (records.some((record) => record.subType === subType && record.genericId === genericId)) {
        continue
      }

      const seed = staticSeeds.get(genericId)
      const source = records
        .filter((record) => record.genericId === genericId)
        .sort((a, b) => a.subType.localeCompare(b.subType))[0]
      if (!seed && !source) {
        throw new Error(`[error] ${subType}:${genericId} has no sample or static metadata seed`)
      }

      const record: NodeRecord = seed
        ? { ...structuredClone(seed), subType, graphType: graphTypeBySubType[subType] }
        : {
            ...structuredClone(source!),
            subType,
            graphType: graphTypeBySubType[subType]
          }
      const conflict = records.find(
        (item) => item.subType === subType && item.nodeType === record.nodeType
      )
      if (conflict) {
        throw new Error(
          `[error] ${subType}.${record.nodeType} maps to both ${conflict.genericId} and ${genericId}`
        )
      }
      records.push(record)
      reused.push({
        subType,
        genericId,
        nodeType: record.nodeType,
        sourceSubType: source?.subType ?? 'static'
      })
    }
  }

  return reused
}

function applyStaticPinMetadata(records: NodeRecord[], aggregates: GidAggregate[]) {
  const data = JSON.parse(
    fs.readFileSync(CLIENT_NODE_STATIC_METADATA_PATH, 'utf8')
  ) as ClientNodeStaticMetadata
  if (data.formatVersion !== 2) {
    throw new Error(`[error] unsupported client static metadata v${data.formatVersion}`)
  }
  const staticByGenericId = new Map(data.nodes.map((node) => [node.genericId, node]))
  const observedPinsByGenericId = new Map<number, Set<string>>()
  const basePinsByGenericId = new Map<number, Set<string>>()
  const i2Corrections = new Map<
    string,
    { genericId: number; kind: PinRecord['kind']; index: number; from: number; to: number }
  >()
  const defaultValueCorrections = new Map<
    string,
    {
      genericId: number
      index: number
      clientVarType?: number
      from: PinRecord['defaultValue']
      to: StaticPinRecord['defaultValue']
    }
  >()
  let sampleConnectedInputs = 0
  const distinctSampleConnectedInputs = new Set<string>()
  const defaultValuesEqual = (
    sample: PinRecord['defaultValue'],
    editor: StaticPinRecord['defaultValue'],
    clientVarType: number | undefined
  ) => {
    if (clientVarType === 5) return Boolean(sample) === Boolean(editor)
    return JSON.stringify(sample) === JSON.stringify(editor)
  }

  const enrichPin = (genericId: number, pin: PinRecord, specialized = false) => {
    const staticNode = staticByGenericId.get(genericId)
    if (!staticNode) throw new Error(`[error] missing static metadata for genericId ${genericId}`)
    const staticPin = staticNode.pins.find(
      (candidate) => candidate.kind === pin.kind && candidate.index === pin.index
    )
    if (!staticPin) {
      throw new Error(`[error] static metadata misses ${genericId} ${pin.kind} pin #${pin.index}`)
    }
    const seen = observedPinsByGenericId.get(genericId) ?? new Set<string>()
    seen.add(`${pin.kind}:${pin.index}`)
    observedPinsByGenericId.set(genericId, seen)

    const staticVariant = specialized ? staticPin.variants?.[pin.indexOfConcrete ?? 0] : undefined
    const expectedClientVarType = staticVariant?.clientVarType ?? staticPin.clientVarType
    if (
      (!pin.reflective || specialized) &&
      pin.clientVarType !== undefined &&
      expectedClientVarType !== undefined &&
      pin.clientVarType !== expectedClientVarType
    ) {
      throw new Error(
        `[error] ${genericId} ${pin.kind} pin #${pin.index} type mismatch: ` +
          `samples=${pin.clientVarType}, static=${expectedClientVarType}`
      )
    }

    if (staticPin.variants?.length && !specialized) {
      pin.type = 'generic'
      pin.reflective = true
      delete pin.clientVarType
    }

    const oldI2 = pin.i2Index ?? pin.index
    const staticI2 = staticPin.i2Index ?? pin.index
    if (oldI2 !== staticI2) {
      i2Corrections.set(`${genericId}:${pin.kind}:${pin.index}`, {
        genericId,
        kind: pin.kind,
        index: pin.index,
        from: oldI2,
        to: staticI2
      })
    }
    if (staticI2 === pin.index) delete pin.i2Index
    else pin.i2Index = staticI2

    if (staticPin.name === undefined) delete pin.name
    else pin.name = staticPin.name
    if (pin.kind === 'input') pin.connectable = staticPin.connectable ?? false
    if (pin.kind === 'input' && staticPin.defaultValue !== undefined) {
      if (
        pin.defaultValue !== undefined &&
        !defaultValuesEqual(
          pin.defaultValue,
          staticPin.defaultValue,
          pin.clientVarType ?? staticPin.clientVarType
        )
      ) {
        defaultValueCorrections.set(`${genericId}:${pin.index}`, {
          genericId,
          index: pin.index,
          ...(pin.clientVarType !== undefined ? { clientVarType: pin.clientVarType } : {}),
          from: pin.defaultValue,
          to: staticPin.defaultValue
        })
      }
      pin.defaultValue = staticPin.defaultValue
    }
    const connectionTypes = (
      specialized
        ? [staticVariant?.connectionType ?? staticPin.connectionType]
        : [
            staticPin.connectionType,
            ...(staticPin.variants ?? [])
              .filter(
                (variant) =>
                  pin.clientVarType === undefined || variant.clientVarType === pin.clientVarType
              )
              .map((variant) => variant.connectionType)
          ]
    ).filter((value): value is number => value !== undefined)
    const uniqueConnectionTypes = [...new Set(connectionTypes)]
    if (uniqueConnectionTypes.length === 1) pin.connectionType = uniqueConnectionTypes[0]
    else delete pin.connectionType
  }

  for (const record of records) {
    const staticNode = staticByGenericId.get(record.genericId)
    if (!staticNode) {
      throw new Error(`[error] missing static metadata for genericId ${record.genericId}`)
    }
    const flows = (record.flows ??= [])
    // New fixed pins are absent from the older exported sample corpus.
    if ([200252, 200276, 200277, 200278, 200280, 200281, 200282].includes(record.genericId)) {
      for (const pin of staticNode.pins) {
        const target =
          pin.kind === 'input' ? record.inputs : pin.kind === 'output' ? record.outputs : undefined
        if (!target || target.some((candidate) => candidate.index === pin.index)) continue
        if (pin.clientVarType === undefined || pin.variants?.length) {
          throw new Error(`[error] expected a fixed static pin on ${record.genericId}:${pin.index}`)
        }
        target.push({
          index: pin.index,
          kind: pin.kind,
          clientVarType: pin.clientVarType,
          type: CLIENT_VAR_TYPE_NAMES[pin.clientVarType]
        })
      }
    }
    for (const staticPin of staticNode.pins) {
      if (staticPin.kind !== 'in_flow' && staticPin.kind !== 'out_flow') continue
      if (flows.some((pin) => pin.kind === staticPin.kind && pin.index === staticPin.index))
        continue
      flows.push({
        index: staticPin.index,
        kind: staticPin.kind,
        type: 'flow',
        ...(staticPin.i2Index === undefined ? {} : { i2Index: staticPin.i2Index })
      })
    }
    flows.sort((a, b) => a.kind.localeCompare(b.kind) || a.index - b.index)

    for (const pin of [...record.inputs, ...record.outputs, ...(record.flows ?? [])]) {
      const basePins = basePinsByGenericId.get(record.genericId) ?? new Set<string>()
      basePins.add(`${pin.kind}:${pin.index}`)
      basePinsByGenericId.set(record.genericId, basePins)
      enrichPin(record.genericId, pin)
    }
    for (const variant of record.reflectMap ?? []) {
      for (const pin of variant.pins ?? []) enrichPin(record.genericId, pin, true)
    }
  }

  for (const aggregate of aggregates) {
    const staticNode = staticByGenericId.get(aggregate.genericId)
    if (!staticNode) continue
    for (const instance of aggregate.instances) {
      for (const pin of instance.pins) {
        if (pin.kind !== 3 || !pin.connected) continue
        sampleConnectedInputs += 1
        distinctSampleConnectedInputs.add(`${aggregate.genericId}:${pin.index}`)
        const staticPin = staticNode.pins.find(
          (candidate) => candidate.kind === 'input' && candidate.index === pin.index
        )
        if (!staticPin) {
          throw new Error(
            `[error] sample connects missing static input ${aggregate.genericId} pin #${pin.index}`
          )
        }
        if (!staticPin.connectable) {
          // These July samples predate the November removal of the scale socket.
          if (
            ([200051, 200112].includes(aggregate.genericId) && pin.index === 9) ||
            ([200059, 200115].includes(aggregate.genericId) && pin.index === 10)
          )
            continue
          throw new Error(
            `[error] sample connects literal-only input ${aggregate.genericId} pin #${pin.index}`
          )
        }
        const staticI2 = staticPin.i2Index ?? pin.index
        if (pin.i2Index !== staticI2) {
          throw new Error(
            `[error] sample/static i2 mismatch for ${aggregate.genericId} input #${pin.index}: ` +
              `sample=${pin.i2Index}, static=${staticI2}`
          )
        }
      }
    }
  }

  const missingFromBaseMetadata = data.nodes.flatMap((node) => {
    const seen = basePinsByGenericId.get(node.genericId) ?? new Set<string>()
    return node.pins
      .filter((pin) => !seen.has(`${pin.kind}:${pin.index}`))
      .map((pin) => ({ genericId: node.genericId, kind: pin.kind, index: pin.index }))
  })
  const missingFromAnySample = data.nodes.flatMap((node) => {
    const seen = observedPinsByGenericId.get(node.genericId) ?? new Set<string>()
    return node.pins
      .filter((pin) => !seen.has(`${pin.kind}:${pin.index}`))
      .map((pin) => ({ genericId: node.genericId, kind: pin.kind, index: pin.index }))
  })
  return {
    source: CLIENT_NODE_STATIC_METADATA_PATH,
    ...data.source,
    ...data.summary,
    i2CorrectionCount: i2Corrections.size,
    i2Corrections: [...i2Corrections.values()].sort(
      (a, b) => a.genericId - b.genericId || a.kind.localeCompare(b.kind) || a.index - b.index
    ),
    defaultValueCorrectionCount: defaultValueCorrections.size,
    defaultValueCorrections: [...defaultValueCorrections.values()].sort(
      (a, b) => a.genericId - b.genericId || a.index - b.index
    ),
    pinsAbsentFromBaseMetadata: missingFromBaseMetadata.length,
    pinsAbsentFromAnySampleEvidence: missingFromAnySample.length,
    sampleConnectedInputs,
    distinctSampleConnectedInputs: distinctSampleConnectedInputs.size,
    absentFromBaseMetadata: missingFromBaseMetadata,
    absentFromAnySampleEvidence: missingFromAnySample
  }
}

function applyStaticConcreteVariants(records: NodeRecord[]) {
  const pinData = JSON.parse(
    fs.readFileSync(CLIENT_NODE_STATIC_METADATA_PATH, 'utf8')
  ) as ClientNodeStaticMetadata
  const variantData = JSON.parse(
    fs.readFileSync(CLIENT_NODE_CONCRETE_VARIANTS_PATH, 'utf8')
  ) as ClientNodeConcreteVariants
  if (variantData.formatVersion !== 1) {
    throw new Error(`[error] unsupported client concrete variants v${variantData.formatVersion}`)
  }
  if (variantData.sourceAggregateSha256 !== pinData.source.aggregateSha256) {
    throw new Error('[error] client static pin and concrete variant sources do not match')
  }

  const staticPinsByGenericId = new Map(pinData.nodes.map((node) => [node.genericId, node]))
  const variantGroupsByGenericId = new Map(
    variantData.nodes.map((node) => [node.genericId, node.groups])
  )
  const additions = new Map<
    number,
    {
      genericId: number
      nodeTypes: Set<string>
      before: Set<string>
      after: Set<string>
    }
  >()
  const concreteIdCorrections: Array<{
    subType: ClientGraphSubType
    nodeType: string
    genericId: number
    from: number | string | null
    to: number | null
  }> = []
  let recordsWithStaticVariants = 0
  let replacedRecords = 0
  let validatedSampleVariants = 0
  let customSpecializationRecords = 0

  const expandedBinding = (genericId: number, binding: StaticVariantBindingTuple): PinRecord => {
    const [encodedKind, index, indexOfConcrete] = binding
    const kind = PIN_KIND_NAMES[encodedKind]
    if (!kind) throw new Error(`[error] static variant ${genericId} has pin kind ${encodedKind}`)
    const staticNode = staticPinsByGenericId.get(genericId)
    const staticPin = staticNode?.pins.find(
      (candidate) => candidate.kind === kind && candidate.index === index
    )
    if (!staticPin) {
      throw new Error(`[error] static variant ${genericId} misses ${kind} pin #${index}`)
    }
    const resolved =
      staticPin.variants?.[indexOfConcrete] ?? (indexOfConcrete === 0 ? staticPin : undefined)
    if (!resolved) {
      throw new Error(
        `[error] static variant ${genericId} ${kind} pin #${index} has invalid ` +
          `indexOfConcrete ${indexOfConcrete}`
      )
    }
    const clientVarType = resolved.clientVarType
    return {
      index,
      kind,
      type:
        kind === 'in_flow' || kind === 'out_flow'
          ? 'flow'
          : clientVarType === undefined
            ? 'unknown'
            : (CLIENT_VAR_TYPE_NAMES[clientVarType] ?? `client_${clientVarType}`),
      indexOfConcrete,
      ...(clientVarType !== undefined ? { clientVarType } : {}),
      ...(staticPin.i2Index !== undefined ? { i2Index: staticPin.i2Index } : {}),
      ...(kind === 'input' ? { connectable: staticPin.connectable ?? false } : {}),
      ...(resolved.connectionType !== undefined ? { connectionType: resolved.connectionType } : {})
    }
  }

  for (const record of records) {
    const group = variantGroupsByGenericId
      .get(record.genericId)
      ?.find((candidate) => candidate.graphType === record.graphType)
    if (!group?.variants.length) continue
    recordsWithStaticVariants += 1

    const expanded = group.variants.map((variant) => ({
      concreteId: variant.concreteId,
      bindings: variant.bindings.map((binding) => expandedBinding(record.genericId, binding))
    }))

    // Every sample-derived pin specialization must occur verbatim in the
    // editor's static table. This validates old evidence before replacing it.
    for (const sampleVariant of record.reflectMap ?? []) {
      const matches = expanded.filter((variant) => variant.concreteId === sampleVariant.concreteId)
      const matched = matches.some((variant) =>
        (sampleVariant.pins ?? []).every((samplePin) => {
          const staticPin = variant.bindings.find(
            (pin) => pin.kind === samplePin.kind && pin.index === samplePin.index
          )
          return (
            staticPin !== undefined &&
            (samplePin.clientVarType === undefined ||
              staticPin.clientVarType === samplePin.clientVarType) &&
            (samplePin.indexOfConcrete === undefined ||
              staticPin.indexOfConcrete === samplePin.indexOfConcrete)
          )
        })
      )
      if (!matched) {
        throw new Error(
          `[error] sampled reflect variant is absent from static table: ` +
            `${record.subType}.${record.nodeType} cid=${sampleVariant.concreteId} ` +
            `key=${sampleVariant.variantKey}`
        )
      }
      validatedSampleVariants += 1
    }

    const concreteIds = new Set(group.variants.map((variant) => variant.concreteId))
    const staticConcreteId = concreteIds.size === 1 ? [...concreteIds][0] : null
    if (record.concreteId !== staticConcreteId) {
      concreteIdCorrections.push({
        subType: record.subType,
        nodeType: record.nodeType,
        genericId: record.genericId,
        from: record.concreteId,
        to: staticConcreteId
      })
      record.concreteId = staticConcreteId
    }

    if (CUSTOM_REFLECTIVE_PIN_SPECIALIZATION_NODE_TYPES.has(record.nodeType)) {
      customSpecializationRecords += 1
      continue
    }

    const reflectiveInputs = record.inputs
      .filter((pin) => pin.reflective)
      .map((pin) => pin.index)
      .sort((a, b) => a - b)
    const reflectiveOutputs = record.outputs
      .filter((pin) => pin.reflective)
      .map((pin) => pin.index)
      .sort((a, b) => a - b)
    if (!reflectiveInputs.length) continue

    const variantsByKey = new Map<string, ReflectVariant>()
    for (const variant of expanded) {
      const pins: PinRecord[] = []
      for (const [kind, indexes] of [
        ['input', reflectiveInputs],
        ['output', reflectiveOutputs]
      ] as const) {
        for (const index of indexes) {
          const pin = variant.bindings.find(
            (candidate) => candidate.kind === kind && candidate.index === index
          )
          if (!pin?.clientVarType) {
            throw new Error(
              `[error] static ${record.genericId} cid=${variant.concreteId} misses reflective ` +
                `${kind} pin #${index}`
            )
          }
          pins.push(pin)
        }
      }
      const variantKey = reflectiveInputs
        .map(
          (index) => pins.find((pin) => pin.kind === 'input' && pin.index === index)!.clientVarType!
        )
        .join(',')
      const normalized: ReflectVariant = {
        concreteId: variant.concreteId,
        variantKey,
        pins
      }
      const prior = variantsByKey.get(variantKey)
      if (prior) {
        const comparable = (value: ReflectVariant) =>
          JSON.stringify({
            concreteId: value.concreteId,
            pins: value.pins?.map((pin) => ({
              kind: pin.kind,
              index: pin.index,
              clientVarType: pin.clientVarType,
              indexOfConcrete: pin.indexOfConcrete
            }))
          })
        if (comparable(prior) !== comparable(normalized)) {
          throw new Error(
            `[error] static ${record.genericId} variant key "${variantKey}" is ambiguous`
          )
        }
        continue
      }
      variantsByKey.set(variantKey, normalized)
    }

    const before = new Set(
      (record.reflectMap ?? []).map((variant) => `${variant.variantKey}:${variant.concreteId}`)
    )
    const staticVariants = [...variantsByKey.values()].sort(
      (a, b) =>
        Number(a.concreteId) - Number(b.concreteId) || a.variantKey.localeCompare(b.variantKey)
    )
    record.reflectMap = staticVariants
    record.specialKind = 'reflect'
    replacedRecords += 1
    const after = new Set(
      staticVariants.map((variant) => `${variant.variantKey}:${variant.concreteId}`)
    )
    const entry = additions.get(record.genericId) ?? {
      genericId: record.genericId,
      nodeTypes: new Set<string>(),
      before: new Set<string>(),
      after: new Set<string>()
    }
    entry.nodeTypes.add(record.nodeType)
    before.forEach((value) => entry.before.add(value))
    after.forEach((value) => entry.after.add(value))
    additions.set(record.genericId, entry)
  }

  return {
    source: CLIENT_NODE_CONCRETE_VARIANTS_PATH,
    recordsWithStaticVariants,
    replacedRecords,
    customSpecializationRecords,
    validatedSampleVariants,
    concreteIdCorrectionCount: concreteIdCorrections.length,
    concreteIdCorrections,
    addedVariantCount: [...additions.values()].reduce(
      (count, entry) =>
        count + [...entry.after].filter((variant) => !entry.before.has(variant)).length,
      0
    ),
    additions: [...additions.values()]
      .map((entry) => ({
        genericId: entry.genericId,
        nodeTypes: [...entry.nodeTypes].sort(),
        before: entry.before.size,
        after: entry.after.size,
        added: [...entry.after].filter((variant) => !entry.before.has(variant)).sort()
      }))
      .filter((entry) => entry.added.length)
      .sort((a, b) => a.genericId - b.genericId)
  }
}

function familyFromFile(sampleRoot: string, file: string): ClientGraphSubType | undefined {
  const rel = path.relative(sampleRoot, file)
  const first = rel.split(path.sep)[0]
  return first ? FAMILY_BY_DIR[first] : undefined
}

function graphNodes(root: DecodedRoot) {
  return root.graph.graph?.inner.graph.nodes ?? []
}

function graphIdentity(root: DecodedRoot) {
  const graphUnit = root.graph
  const nodeGraph = graphUnit.graph?.inner.graph
  return {
    unitType: graphUnit.id.type,
    which: graphUnit.which,
    nodeGraphType: nodeGraph?.id.type
  }
}

function normalizeNodeType(name: string): string {
  return name
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}

// keep leading underscores: server method `_3dVectorDotProduct` -> `_3d_vector_dot_product`
function camelToSnake(name: string): string {
  return name.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
}

/** official doc en name -> snake nodeType, keeping the leading-digit underscore rule */
function docEnToSnake(name: string): string {
  const snake = normalizeNodeType(name)
  return /^\d/.test(snake) ? `_${snake}` : snake
}

type EnglishNodeTypeResult = {
  nodeType: string
  source: 'server_alias' | 'official_doc'
  /** set when both sources resolve but disagree; server alias wins for parity */
  docDivergence?: string
}

/**
 * Server alias names keep priority (server-parity method names for shared
 * nodes); official client doc names fill every remaining gap.
 */
function englishNodeType(
  alignment: DocAlignment,
  subType: string,
  displayName: string
): EnglishNodeTypeResult | undefined {
  const serverEn =
    (SERVER_F_ZH_TO_EN as Record<string, string>)[displayName] ??
    (SERVER_EVENT_ZH_TO_EN as Record<string, string>)[displayName]
  const doc = lookupDocNode(alignment, subType, displayName)
  if (serverEn) {
    const serverSnake = camelToSnake(serverEn)
    const docSnake = doc ? docEnToSnake(doc.enName) : undefined
    return {
      nodeType: serverSnake,
      source: 'server_alias',
      ...(docSnake && docSnake !== serverSnake ? { docDivergence: doc!.enName } : {})
    }
  }
  if (doc) return { nodeType: docEnToSnake(doc.enName), source: 'official_doc' }
  return undefined
}

// ---------------------------------------------------------------------------
// Observation aggregation
// ---------------------------------------------------------------------------

type PinInstance = {
  kind: number
  index: number
  i2Index: number
  type: number
  connected: boolean
  // ConcreteBase wrapper with indexOfConcrete === -1 marks an unresolved reflective pin
  unresolvedReflective: boolean
  wrappedConcrete: boolean
  /** editor dropdown row; omitted only for non-ConcreteBase pins */
  indexOfConcrete?: number
  /** scalar payload observed on this pin (unwrapped b* field) */
  literal?: { payload: PinLiteral; set: boolean }
}

type PinLiteral = number | string | boolean | [number, number, number]

/**
 * Extract the scalar payload carried by a pin value. Editor defaults are
 * stored with alreadySetVal=false but still carry the b* payload, so set-ness
 * is not required. Wrapped ConcreteBase and list payloads return undefined.
 */
function pinLiteralPayload(value: any): PinLiteral | undefined {
  if (!value || Number(value.class) === 10000) return undefined
  if (value.bInt !== undefined) return Number(value.bInt.val ?? 0)
  if (value.bFloat !== undefined) return Number(value.bFloat.val ?? 0)
  if (value.bString !== undefined) return String(value.bString.val ?? '')
  if (value.bEnum !== undefined) return Number(value.bEnum.val ?? 0)
  if (value.bId !== undefined) return Number(value.bId.val ?? 0)
  if (value.bVector !== undefined) {
    const v = value.bVector.val ?? {}
    return [Number(v.x ?? 0), Number(v.y ?? 0), Number(v.z ?? 0)]
  }
  return undefined
}

type NodeInstance = {
  concreteId: number | undefined
  pins: PinInstance[]
}

type GidAggregate = {
  subType: ClientGraphSubType
  genericId: number
  graphTypes: Set<number>
  baseNames: Set<string>
  exampleFile: string
  instances: NodeInstance[]
  ctxDecls: Set<string>
  statusExts: Set<string>
}

function pinInstances(node: DecodedNode): PinInstance[] {
  return (node.pins ?? []).map((pin) => {
    const ioc = pin.value?.bConcreteValue?.indexOfConcrete
    const payload = pinLiteralPayload(pin.value)
    const wrappedConcrete = Number(pin.value?.class) === 10000
    const indexOfConcrete = wrappedConcrete ? Number(ioc ?? 0) : undefined
    return {
      kind: Number(pin.i1?.kind ?? 0),
      index: Number(pin.i1?.index ?? 0),
      i2Index: Number(pin.i2?.index ?? pin.i1?.index ?? 0),
      type: Number(pin.type ?? 0),
      connected: Boolean(pin.connects?.length),
      unresolvedReflective: indexOfConcrete === -1,
      wrappedConcrete,
      ...(indexOfConcrete !== undefined ? { indexOfConcrete } : {}),
      ...(payload !== undefined
        ? { literal: { payload, set: Boolean(pin.value?.alreadySetVal) } }
        : {})
    }
  })
}

function mergePins(agg: GidAggregate): {
  records: Map<string, PinRecord>
  reflectiveInputIndexes: number[]
  reflectiveOutputIndexes: number[]
} {
  type Merged = {
    kind: number
    index: number
    types: Set<number>
    sawUnresolved: boolean
    sawConcreteWrapper: boolean
    /** payloads carried by pins the sample author did not touch (editor defaults) */
    unsetPayloads: Set<string>
  }
  const merged = new Map<string, Merged>()
  for (const inst of agg.instances) {
    for (const pin of inst.pins) {
      const key = `${pin.kind}:${pin.index}`
      const m = merged.get(key) ?? {
        kind: pin.kind,
        index: pin.index,
        types: new Set<number>(),
        sawUnresolved: false,
        sawConcreteWrapper: false,
        unsetPayloads: new Set<string>()
      }
      merged.set(key, m)
      if (pin.type !== 0) m.types.add(pin.type)
      if (pin.unresolvedReflective) m.sawUnresolved = true
      if (pin.wrappedConcrete) m.sawConcreteWrapper = true
      if (pin.literal !== undefined && !pin.literal.set) {
        m.unsetPayloads.add(JSON.stringify(pin.literal.payload))
      }
    }
  }

  const records = new Map<string, PinRecord>()
  const reflectiveInputIndexes: number[] = []
  const reflectiveOutputIndexes: number[] = []
  for (const [key, m] of merged) {
    const kind = PIN_KIND_NAMES[m.kind]
    if (!kind) {
      throw new Error(`[error] ${agg.subType}:${agg.genericId} unknown pin kind ${m.kind}`)
    }
    const isFlow = kind === 'in_flow' || kind === 'out_flow'
    const reflective = !isFlow && (m.sawUnresolved || m.sawConcreteWrapper || m.types.size > 1)
    const singleType = m.types.size === 1 ? [...m.types][0] : undefined
    const record: PinRecord = {
      index: m.index,
      kind,
      type: isFlow
        ? 'flow'
        : reflective
          ? 'generic'
          : singleType !== undefined
            ? (CLIENT_VAR_TYPE_NAMES[singleType] ?? `client_${singleType}`)
            : 'unknown'
    }
    if (reflective) record.reflective = true
    if (!isFlow && !reflective && singleType !== undefined) record.clientVarType = singleType
    // A pin whose untouched instances all carry the same payload documents the
    // editor default (e.g. hidden operator-selector enums: bEnum val 300/301).
    if (kind === 'input' && !reflective && m.unsetPayloads.size === 1) {
      record.defaultValue = JSON.parse([...m.unsetPayloads][0])
    }
    records.set(key, record)
    if (reflective && kind === 'input') reflectiveInputIndexes.push(m.index)
    if (reflective && kind === 'output') reflectiveOutputIndexes.push(m.index)
  }
  reflectiveInputIndexes.sort((a, b) => a - b)
  reflectiveOutputIndexes.sort((a, b) => a - b)
  return { records, reflectiveInputIndexes, reflectiveOutputIndexes }
}

type ReflectVariant = {
  concreteId: number
  variantKey: string
  pins?: PinRecord[]
}

function deriveReflectMap(
  agg: GidAggregate,
  reflectiveInputIndexes: number[],
  reflectiveOutputIndexes: number[]
): {
  variants: ReflectVariant[]
  conflicts: string[]
  underived: number[]
  outputDrifts: string[]
} {
  const byConcrete = new Map<number, Map<string, number>>()
  for (const inst of agg.instances) {
    if (inst.concreteId === undefined) continue
    const typed = new Map(inst.pins.filter((p) => p.kind === 3).map((p) => [p.index, p]))
    const keyParts: string[] = []
    let derivable = true
    for (const idx of reflectiveInputIndexes) {
      const pin = typed.get(idx)
      if (!pin || pin.type === 0) {
        derivable = false
        break
      }
      keyParts.push(String(pin.type))
    }
    if (!derivable) continue
    const key = keyParts.join(',')
    const byKey = byConcrete.get(inst.concreteId) ?? new Map<string, number>()
    byConcrete.set(inst.concreteId, byKey)
    byKey.set(key, (byKey.get(key) ?? 0) + 1)
  }

  const variants: ReflectVariant[] = []
  const conflicts: string[] = []
  const outputDrifts: string[] = []
  const keyToConcrete = new Map<string, number>()
  const underived: number[] = []

  const observedConcreteIds = new Set(
    agg.instances.map((i) => i.concreteId).filter((c): c is number => c !== undefined)
  )
  for (const cid of [...observedConcreteIds].sort((a, b) => a - b)) {
    const byKey = byConcrete.get(cid)
    if (!byKey || byKey.size === 0) {
      underived.push(cid)
      continue
    }
    if (byKey.size > 1) {
      conflicts.push(`concreteId ${cid} maps to multiple keys: ${[...byKey.keys()].join(' | ')}`)
      continue
    }
    const key = [...byKey.keys()][0]
    const prior = keyToConcrete.get(key)
    if (prior !== undefined && prior !== cid) {
      conflicts.push(`variant key "${key}" maps to concreteIds ${prior} and ${cid}`)
      continue
    }
    keyToConcrete.set(key, cid)
    const variantPins: PinRecord[] = []
    const candidates = agg.instances.filter(
      (i) =>
        i.concreteId === cid &&
        reflectiveInputIndexes.every((idx) =>
          i.pins.some((p) => p.kind === 3 && p.index === idx && p.type !== 0)
        )
    )
    const inst = candidates[0]
    if (inst) {
      const observedIoc = (kind: number, index: number, clientVarType: number) => {
        const values = new Set(
          candidates.flatMap((candidate) =>
            candidate.pins
              .filter(
                (pin) =>
                  pin.kind === kind &&
                  pin.index === index &&
                  pin.type === clientVarType &&
                  pin.indexOfConcrete !== undefined &&
                  pin.indexOfConcrete >= 0
              )
              .map((pin) => pin.indexOfConcrete!)
          )
        )
        if (values.size > 1) {
          conflicts.push(
            `concreteId ${cid} pin k${kind}#${index} has multiple indexOfConcrete values: ` +
              [...values].sort((a, b) => a - b).join(' | ')
          )
          return undefined
        }
        return [...values][0]
      }

      for (const idx of reflectiveInputIndexes) {
        const pin = inst.pins.find((p) => p.kind === 3 && p.index === idx)!
        const indexOfConcrete = observedIoc(3, idx, pin.type)
        variantPins.push({
          index: idx,
          kind: 'input',
          type: CLIENT_VAR_TYPE_NAMES[pin.type] ?? `client_${pin.type}`,
          ...(indexOfConcrete !== undefined ? { indexOfConcrete } : {}),
          clientVarType: pin.type
        })
      }
      for (const idx of reflectiveOutputIndexes) {
        // 输出类型必须在同 cid+同输入键的全部实例上一致；出现漂移（如字典节点的
        // 值类型不体现在 cid/输入引脚上）时记录任何一种都是假确定类型，直接不记录
        const observed = new Set<number>()
        for (const cand of candidates) {
          const pin = cand.pins.find((p) => p.kind === 4 && p.index === idx)
          if (pin && pin.type !== 0) observed.add(pin.type)
        }
        if (observed.size > 1) {
          outputDrifts.push(
            `concreteId ${cid} output pin #${idx} type drifts across samples: ` +
              `${[...observed]
                .sort((a, b) => a - b)
                .map((t) => CLIENT_VAR_TYPE_NAMES[t] ?? `client_${t}`)
                .join(' | ')}`
          )
          continue
        }
        const [type] = observed
        if (type === undefined) continue
        const indexOfConcrete = observedIoc(4, idx, type)
        variantPins.push({
          index: idx,
          kind: 'output',
          type: CLIENT_VAR_TYPE_NAMES[type] ?? `client_${type}`,
          ...(indexOfConcrete !== undefined ? { indexOfConcrete } : {}),
          clientVarType: type
        })
      }
    }
    variants.push({
      concreteId: cid,
      variantKey: key,
      pins: variantPins.length ? variantPins : undefined
    })
  }
  return { variants, conflicts, underived, outputDrifts }
}

// ---------------------------------------------------------------------------
// Literal value shape census (Task 12 evidence)
// ---------------------------------------------------------------------------

type ValueShape = {
  clientVarType: number
  typeName: string
  shape: unknown
  sampleFile: string
  genericId: number
  pinIndex: number
  count: number
}

function shapeOfVarBase(value: any): unknown {
  if (value === undefined || value === null) return undefined
  const shape: Record<string, unknown> = { class: Number(value.class) }
  if (value.alreadySetVal !== undefined) shape.alreadySetVal = Boolean(value.alreadySetVal)
  if (value.itemType) {
    const it: Record<string, unknown> = { classBase: Number(value.itemType.classBase) }
    const tc = value.itemType.type_client
    if (tc) {
      const tcs: Record<string, unknown> = { type: Number(tc.type) }
      if (tc.implKind !== undefined) tcs.implKind = Number(tc.implKind)
      if (tc.marker) tcs.marker = true
      if (tc.containerBinding) tcs.containerBinding = tc.containerBinding
      it.type_client = tcs
    }
    if (value.itemType.type_server) it.type_server = '(server)'
    shape.itemType = it
  }
  for (const field of [
    'bId',
    'bInt',
    'bFloat',
    'bString',
    'bEnum',
    'bVector',
    'bArray',
    'bStruct',
    'bMap',
    'bMapPair'
  ]) {
    if (value[field] !== undefined) shape[field] = `set(${typeof value[field]})`
  }
  if (value.bConcreteValue) {
    shape.bConcreteValue = {
      indexOfConcrete: Number(value.bConcreteValue.indexOfConcrete ?? 0),
      structs: value.bConcreteValue.structs ? true : undefined,
      value: shapeOfVarBase(value.bConcreteValue.value)
    }
  }
  return shape
}

function collectValueShapes(shapes: Map<string, ValueShape>, root: DecodedRoot, relFile: string) {
  for (const node of graphNodes(root)) {
    for (const pin of node.pins ?? []) {
      if (Number(pin.i1?.kind) !== 3) continue
      if (!pin.value?.alreadySetVal) continue
      const pinType = Number(pin.type ?? 0)
      if (pinType === 0) continue
      const shape = shapeOfVarBase(pin.value)
      const key = `${pinType}:${JSON.stringify(shape)}`
      const existing = shapes.get(key)
      if (existing) {
        existing.count += 1
      } else {
        shapes.set(key, {
          clientVarType: pinType,
          typeName: CLIENT_VAR_TYPE_NAMES[pinType] ?? `client_${pinType}`,
          shape,
          sampleFile: relFile,
          genericId: Number(node.genericId?.nodeId),
          pinIndex: Number(pin.i1?.index ?? 0),
          count: 1
        })
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Existing special-case reports
// ---------------------------------------------------------------------------

function findClientVarType25(root: DecodedRoot, relFile: string, subType: ClientGraphSubType) {
  const hits: Array<{
    file: string
    subType: ClientGraphSubType
    nodeIndex: number | undefined
    genericId: number | undefined
    concreteId: number | undefined
    pinKind: number | undefined
    pinIndex: number | undefined
    pinType: number | undefined
  }> = []

  for (const node of graphNodes(root)) {
    for (const pin of node.pins ?? []) {
      const concreteValue = pin.value?.bConcreteValue?.value
      const nestedClientType = concreteValue?.itemType?.type_client?.type
      if (Number(pin.type) !== 25 && Number(nestedClientType) !== 25) continue
      hits.push({
        file: relFile,
        subType,
        nodeIndex: node.nodeIndex,
        genericId: node.genericId?.nodeId,
        concreteId: node.concreteId?.nodeId,
        pinKind: pin.i1?.kind,
        pinIndex: pin.i1?.index,
        pinType: pin.type
      })
    }
  }

  return hits
}

function findStatusExtensions(root: DecodedRoot, relFile: string, subType: ClientGraphSubType) {
  return graphNodes(root)
    .filter((node) => node.statusNodeExtension !== undefined)
    .map((node) => ({
      file: relFile,
      subType,
      nodeIndex: node.nodeIndex,
      genericId: node.genericId?.nodeId,
      concreteId: node.concreteId?.nodeId,
      value: node.statusNodeExtension
    }))
}

type VarBaseField3Hit = {
  path: string
  byteOffset: number
  payloadLength: number
}

function loadGiaRootType() {
  const protoRoot = new protobuf.Root().loadSync(GIA_PROTO_PATH, { keepCase: true })
  protoRoot.resolveAll()
  return protoRoot.lookupType('Root')
}

function scanVarBaseField3Messages(rootType: protobuf.Type, bytes: Uint8Array): VarBaseField3Hit[] {
  const hits: VarBaseField3Hit[] = []
  scanMessageForVarBaseField3(rootType, bytes, '$', 0, hits)
  return hits
}

function scanMessageForVarBaseField3(
  type: protobuf.Type,
  bytes: Uint8Array,
  currentPath: string,
  baseOffset: number,
  hits: VarBaseField3Hit[]
) {
  const fieldsById = type.fieldsById as Record<number, protobuf.Field | undefined>
  const reader = protobuf.Reader.create(bytes)
  const repeatedIndexes = new Map<number, number>()

  while (reader.pos < reader.len) {
    const tagOffset = reader.pos
    const tag = reader.uint32()
    const fieldNo = tag >>> 3
    const wireType = tag & 7

    if (type.name === 'VarBase' && fieldNo === 3 && wireType === 2) {
      const payloadLength = reader.uint32()
      hits.push({
        path: `${currentPath}.#3`,
        byteOffset: baseOffset + tagOffset,
        payloadLength
      })
      reader.skip(payloadLength)
      continue
    }

    const field = fieldsById[fieldNo]
    if (wireType === 2 && field?.resolvedType instanceof protobuf.Type) {
      const payloadLength = reader.uint32()
      const payloadStart = reader.pos
      const payloadEnd = payloadStart + payloadLength
      let childPath = `${currentPath}.${field.name}`
      if (field.repeated) {
        const index = repeatedIndexes.get(fieldNo) ?? 0
        repeatedIndexes.set(fieldNo, index + 1)
        childPath += `[${index}]`
      }
      scanMessageForVarBaseField3(
        field.resolvedType,
        bytes.subarray(payloadStart, payloadEnd),
        childPath,
        baseOffset + payloadStart,
        hits
      )
      reader.pos = payloadEnd
      continue
    }

    reader.skipType(wireType)
  }
}

function annotateInlineVarTypeHintHits(
  rawHits: VarBaseField3Hit[],
  root: DecodedRoot,
  relFile: string,
  subType: ClientGraphSubType
) {
  return rawHits.map((hit) => {
    const match = hit.path.match(/\.nodes\[(\d+)](?:\.[^.]+)*\.pins\[(\d+)]/)
    const node = match ? graphNodes(root)[Number(match[1])] : undefined
    const pin = node && match ? (node.pins ?? [])[Number(match[2])] : undefined
    return {
      file: relFile,
      subType,
      path: hit.path,
      byteOffset: hit.byteOffset,
      payloadLength: hit.payloadLength,
      nodeIndex: node?.nodeIndex,
      genericId: node?.genericId?.nodeId,
      concreteId: node?.concreteId?.nodeId,
      pinKind: pin?.i1?.kind,
      pinIndex: pin?.i1?.index,
      pinType: pin?.type
    }
  })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const sampleRoot = path.resolve(process.argv[2] ?? DEFAULT_SAMPLE_ROOT)
  if (!fs.existsSync(sampleRoot)) {
    throw new Error(`[error] client sample root not found: ${sampleRoot}`)
  }
  const historicalNodeTypeByKey = new Map<string, string>()
  const historicalSampleByKey = new Map<string, string>()
  if (fs.existsSync(CLIENT_NODE_METADATA_PATH)) {
    const historicalRecords = JSON.parse(
      fs.readFileSync(CLIENT_NODE_METADATA_PATH, 'utf8')
    ) as NodeRecord[]
    for (const record of historicalRecords) {
      const key = `${record.subType}:${record.genericId}`
      const existing = historicalNodeTypeByKey.get(key)
      if (existing && existing !== record.nodeType) {
        throw new Error(
          `[error] conflicting historical nodeType for ${key}: ${existing}, ${record.nodeType}`
        )
      }
      historicalNodeTypeByKey.set(key, record.nodeType)
      historicalSampleByKey.set(key, record.sampleFile)
    }
  }
  const modeData = JSON.parse(fs.readFileSync(CLIENT_NODE_MODES_PATH, 'utf8')) as ClientNodeModeData

  const giaRootType = loadGiaRootType()
  const files = walkGiaFiles(sampleRoot).sort((a, b) => a.localeCompare(b))
  const familyCounts = new Map<ClientGraphSubType, number>()
  const graphIdentities = new Map<string, number>()
  const unknownFamily: string[] = []
  const decodeFailures: Array<{ file: string; error: string }> = []
  const clientVarType25Hits: ReturnType<typeof findClientVarType25> = []
  const statusExtensionHits: ReturnType<typeof findStatusExtensions> = []
  const inlineVarTypeHintHits: ReturnType<typeof annotateInlineVarTypeHintHits> = []
  const valueShapes = new Map<string, ValueShape>()

  const gidAggregates = new Map<string, GidAggregate>()
  const universalAggregates = new Map<ClientGraphSubType, GidAggregate>()

  for (const file of files) {
    const relFile = path.relative(sampleRoot, file)
    const subType = familyFromFile(sampleRoot, file)
    if (!subType) {
      unknownFamily.push(relFile)
      continue
    }
    familyCounts.set(subType, (familyCounts.get(subType) ?? 0) + 1)

    let root: DecodedRoot
    try {
      root = decode_gia_file(file, undefined, false)
    } catch (error) {
      decodeFailures.push({
        file: relFile,
        error: error instanceof Error ? error.message : String(error)
      })
      continue
    }

    const identityKey = JSON.stringify({ subType, ...graphIdentity(root) })
    graphIdentities.set(identityKey, (graphIdentities.get(identityKey) ?? 0) + 1)
    clientVarType25Hits.push(...findClientVarType25(root, relFile, subType))
    statusExtensionHits.push(...findStatusExtensions(root, relFile, subType))
    collectValueShapes(valueShapes, root, relFile)

    inlineVarTypeHintHits.push(
      ...annotateInlineVarTypeHintHits(
        scanVarBaseField3Messages(giaRootType, unwrap_gia(file, false)),
        root,
        relFile,
        subType
      )
    )

    const stem = path.basename(file, path.extname(file))
    const suffixMatch = stem.match(/^(.*?)(?:_(连线|填值))?$/u)
    const baseName = suffixMatch?.[1] ?? stem
    const isBaseSample = !suffixMatch?.[2]
    const universalGid = UNIVERSAL_NODE_BY_SUB_TYPE[subType].genericId

    // Name attribution: a suffix-less base sample demonstrates exactly one
    // non-universal node; only that node inherits the sample's base name.
    const residualGids = new Set(
      graphNodes(root)
        .map((node) => Number(node.genericId?.nodeId))
        .filter((gid) => gid !== universalGid && gid < DYNAMIC_GENERIC_ID_MIN)
    )
    const namedGid = isBaseSample && residualGids.size === 1 ? [...residualGids][0] : undefined

    for (const node of graphNodes(root)) {
      const gid = Number(node.genericId?.nodeId)
      if (gid >= DYNAMIC_GENERIC_ID_MIN) continue
      const isUniversal = gid === universalGid
      const key = `${subType}:${gid}`
      let agg = isUniversal ? universalAggregates.get(subType) : gidAggregates.get(key)
      if (!agg) {
        agg = {
          subType,
          genericId: gid,
          graphTypes: new Set(),
          baseNames: new Set(),
          exampleFile: relFile,
          instances: [],
          ctxDecls: new Set(),
          statusExts: new Set()
        }
        if (isUniversal) universalAggregates.set(subType, agg)
        else gidAggregates.set(key, agg)
      }
      agg.graphTypes.add(Number(node.genericId?.type))
      if (gid === namedGid) agg.baseNames.add(baseName)
      const rawCid = node.concreteId?.nodeId
      agg.instances.push({
        concreteId: rawCid === undefined || rawCid === null ? undefined : Number(rawCid),
        pins: pinInstances(node)
      })
      if (node.contextDeclaration) {
        agg.ctxDecls.add(
          JSON.stringify({
            kind: Number(node.contextDeclaration.kind),
            index: Number(node.contextDeclaration.index)
          })
        )
      }
      if (node.statusNodeExtension) {
        agg.statusExts.add(JSON.stringify(node.statusNodeExtension))
      }
    }
  }

  // -------------------------------------------------------------------------
  // Build metadata records
  // -------------------------------------------------------------------------

  const inlineHintGids = new Set(
    inlineVarTypeHintHits
      .filter((hit) => hit.genericId !== undefined)
      .map((hit) => `${hit.subType}:${hit.genericId}`)
  )

  const docAlignment = buildDocNameAlignment()
  const records: NodeRecord[] = []
  const nodeTypeSeen = new Map<string, string>()
  const missingEnglishNames: Array<{
    subType: string
    displayName: string
    nodeType: string
    genericId: number
  }> = []
  const nodeTypeSources: Record<string, number> = {}
  const serverAliasDivergences: Array<{
    subType: string
    displayName: string
    nodeType: string
    officialDocEnName: string
  }> = []
  const reflectReport: Array<{
    subType: string
    nodeType: string
    genericId: number
    variantKeys: Record<string, number | string>
    conflicts?: string[]
    /** 同 cid+输入键下输出类型漂移：输出不由变体决定，已从 variantPins 剔除 */
    outputTypeDrifts?: string[]
    underivedConcreteIds?: number[]
    provenance?: 'family' | 'generic_id_union'
    status: 'resolved' | 'needs_developer_confirmation'
  }> = []

  type ReflectDerivation = {
    record: NodeRecord
    reflectiveInputIndexes: number[]
    reflectiveOutputIndexes: number[]
    observedConcreteIds: number[]
    variants: ReflectVariant[]
    conflicts: string[]
    outputDrifts: string[]
  }
  const reflectDerivations: ReflectDerivation[] = []

  function buildRecord(agg: GidAggregate, fixedNodeType?: string): NodeRecord {
    // Prefer the non-minimal base name as the display name
    const bases = [...agg.baseNames].filter((b) => !b.startsWith('最小图')).sort()
    const displayName = bases[0] ?? [...agg.baseNames].sort()[0]
    if (!displayName && !fixedNodeType) {
      throw new Error(
        `[error] ${agg.subType}:${agg.genericId} has no demonstrating base sample (seen in ${agg.exampleFile})`
      )
    }
    const english = fixedNodeType
      ? undefined
      : englishNodeType(docAlignment, agg.subType, displayName)
    // nodeType is an internal compiler/GIA key. Public client method names are
    // generated separately from current editor names, so keep existing keys
    // stable when an already-known generic node is re-extracted.
    const nodeType =
      fixedNodeType ??
      historicalNodeTypeByKey.get(`${agg.subType}:${agg.genericId}`) ??
      english?.nodeType ??
      normalizeNodeType(displayName)
    if (!english && !fixedNodeType) {
      missingEnglishNames.push({
        subType: agg.subType,
        displayName,
        nodeType,
        genericId: agg.genericId
      })
    } else if (english) {
      nodeTypeSources[english.source] = (nodeTypeSources[english.source] ?? 0) + 1
      if (english.docDivergence) {
        serverAliasDivergences.push({
          subType: agg.subType,
          displayName,
          nodeType,
          officialDocEnName: english.docDivergence
        })
      }
    }

    const dupKey = `${agg.subType}:${nodeType}`
    const dup = nodeTypeSeen.get(dupKey)
    if (dup) {
      throw new Error(`[error] duplicate nodeType ${dupKey} from ${dup} and ${displayName}`)
    }
    nodeTypeSeen.set(dupKey, displayName)

    if (agg.graphTypes.size !== 1) {
      throw new Error(
        `[error] ${agg.subType}:${agg.genericId} inconsistent NodeProperty.type: ${[...agg.graphTypes].join(',')}`
      )
    }
    if (agg.ctxDecls.size > 1) {
      throw new Error(
        `[error] ${agg.subType}:${agg.genericId} inconsistent contextDeclaration: ${[...agg.ctxDecls].join(' | ')}`
      )
    }
    if (agg.statusExts.size > 1) {
      throw new Error(
        `[error] ${agg.subType}:${agg.genericId} inconsistent statusNodeExtension: ${[...agg.statusExts].join(' | ')}`
      )
    }

    const { records: pinRecords, reflectiveInputIndexes, reflectiveOutputIndexes } = mergePins(agg)
    const inputs: PinRecord[] = []
    const outputs: PinRecord[] = []
    const flows: PinRecord[] = []
    for (const record of pinRecords.values()) {
      if (record.kind === 'input') inputs.push(record)
      else if (record.kind === 'output') outputs.push(record)
      else flows.push(record)
    }
    inputs.sort((a, b) => a.index - b.index)
    outputs.sort((a, b) => a.index - b.index)
    flows.sort((a, b) => a.kind.localeCompare(b.kind) || a.index - b.index)

    const concreteIds = new Set(
      agg.instances.map((i) => i.concreteId).filter((c): c is number => c !== undefined)
    )

    const record: NodeRecord = {
      subType: agg.subType,
      nodeType,
      displayName,
      graphType: [...agg.graphTypes][0],
      genericId: agg.genericId,
      concreteId: concreteIds.size === 1 ? [...concreteIds][0] : null,
      inputs,
      outputs,
      ...(flows.length ? { flows } : {}),
      sampleFile: historicalSampleByKey.get(`${agg.subType}:${agg.genericId}`) ?? agg.exampleFile
    }

    if (concreteIds.size > 1 || reflectiveInputIndexes.length > 0) {
      const { variants, conflicts, outputDrifts } = deriveReflectMap(
        agg,
        reflectiveInputIndexes,
        reflectiveOutputIndexes
      )
      // Final reflectMap assignment happens in the cross-family union pass
      // below; concrete variant evidence for the same genericId is shared
      // between families (same node definition, same concrete id space).
      reflectDerivations.push({
        record,
        reflectiveInputIndexes,
        reflectiveOutputIndexes,
        observedConcreteIds: [...concreteIds].sort((a, b) => a - b),
        variants,
        conflicts,
        outputDrifts
      })
    }

    if (agg.ctxDecls.size === 1) {
      record.contextDeclaration = JSON.parse([...agg.ctxDecls][0])
    }
    if (inlineHintGids.has(`${agg.subType}:${agg.genericId}`) && !record.specialKind) {
      record.specialKind = 'inline_var_type_hint'
    }
    return record
  }

  for (const subType of Object.keys(UNIVERSAL_NODE_BY_SUB_TYPE) as ClientGraphSubType[]) {
    const agg = universalAggregates.get(subType)
    if (!agg) throw new Error(`[error] ${subType}: universal node not observed`)
    const spec = UNIVERSAL_NODE_BY_SUB_TYPE[subType]
    const record = buildRecord(agg, spec.nodeType)
    record.displayName = spec.nodeType
    if (spec.nodeType === 'node_graph_begins') {
      record.specialKind = 'start'
      record.isStart = true
    }
    if (subType.startsWith('creation_status')) {
      const observed = [...agg.statusExts][0]
      if (observed !== EXPECTED_STATUS_EXTENSION) {
        throw new Error(
          `[error] ${subType}: statusNodeExtension mismatch, observed ${observed}, expected ${EXPECTED_STATUS_EXTENSION}`
        )
      }
    }
    records.push(record)
  }

  for (const key of [...gidAggregates.keys()].sort()) {
    records.push(buildRecord(gidAggregates.get(key)!))
  }

  // -------------------------------------------------------------------------
  // Cross-family reflect union: the same genericId denotes the same node
  // definition in every family, so per-family variant evidence is merged and
  // validated globally before being attached to each family's record.
  // -------------------------------------------------------------------------

  const derivationsByGid = new Map<number, ReflectDerivation[]>()
  for (const derivation of reflectDerivations) {
    const list = derivationsByGid.get(derivation.record.genericId) ?? []
    list.push(derivation)
    derivationsByGid.set(derivation.record.genericId, list)
  }

  for (const [gid, group] of derivationsByGid) {
    // 这些节点的下拉行还依赖枚举类、目标类型或字典键值类型，转换器有独立
    // 处理；同一 variantKey 出现多个 ioc 在这里是预期行为。
    const customPinSpecialization = group.every((derivation) =>
      CUSTOM_REFLECTIVE_PIN_SPECIALIZATION_NODE_TYPES.has(derivation.record.nodeType)
    )
    const conflicts = group
      .flatMap((d) => d.conflicts)
      .filter((message) => !(customPinSpecialization && message.includes('indexOfConcrete')))
    const outputDrifts = group.flatMap((d) => d.outputDrifts)
    const indexSets = new Set(group.map((d) => d.reflectiveInputIndexes.join(',')))
    if (indexSets.size > 1) {
      conflicts.push(
        `genericId ${gid} reflective input indexes differ across families: ${[...indexSets].join(' | ')}`
      )
    }
    const outputIndexSets = new Set(group.map((d) => d.reflectiveOutputIndexes.join(',')))
    if (outputIndexSets.size > 1) {
      conflicts.push(
        `genericId ${gid} reflective output indexes differ across families: ${[...outputIndexSets].join(' | ')}`
      )
    }

    const union = new Map<string, ReflectVariant>()
    const cidToKey = new Map<number | string, string>()
    const contributors = new Set<string>()
    // 已判定跨族漂移的输出引脚（`${variantKey}#${index}`）：后续族不得重新引入
    const driftedOutputs = new Set<string>()
    for (const d of group) {
      for (const v of d.variants) {
        const priorCid = union.get(v.variantKey)?.concreteId
        if (priorCid !== undefined && priorCid !== v.concreteId) {
          conflicts.push(
            `genericId ${gid} key "${v.variantKey}" maps to concreteIds ${priorCid} and ${v.concreteId}`
          )
          continue
        }
        const priorKey = cidToKey.get(v.concreteId)
        if (priorKey !== undefined && priorKey !== v.variantKey) {
          conflicts.push(
            `genericId ${gid} concreteId ${v.concreteId} maps to keys "${priorKey}" and "${v.variantKey}"`
          )
          continue
        }
        cidToKey.set(v.concreteId, v.variantKey)
        const existing = union.get(v.variantKey)
        if (!existing) {
          union.set(v.variantKey, v)
        } else {
          // 同键变体跨族合并。类型和 indexOfConcrete 都属于具体引脚，不能用
          // concreteId 排名重新推导；某一族缺少的观测可由另一族补齐。
          const merged: PinRecord[] = []
          for (const kind of ['input', 'output'] as const) {
            const existingPins = (existing.pins ?? []).filter((p) => p.kind === kind)
            const incomingPins = (v.pins ?? []).filter((p) => p.kind === kind)
            const indexes = new Set([
              ...existingPins.map((p) => p.index),
              ...incomingPins.map((p) => p.index)
            ])
            for (const idx of [...indexes].sort((a, b) => a - b)) {
              const driftKey = `${v.variantKey}#${idx}`
              if (kind === 'output' && driftedOutputs.has(driftKey)) continue
              const a = existingPins.find((p) => p.index === idx)
              const b = incomingPins.find((p) => p.index === idx)
              if (a && b && a.clientVarType !== b.clientVarType) {
                if (kind === 'output') {
                  driftedOutputs.add(driftKey)
                  outputDrifts.push(
                    `genericId ${gid} key "${v.variantKey}" output pin #${idx} type drifts across families: ` +
                      `${a.type} | ${b.type}`
                  )
                } else {
                  conflicts.push(
                    `genericId ${gid} key "${v.variantKey}" input pin #${idx} type drifts across families: ` +
                      `${a.type} | ${b.type}`
                  )
                }
                continue
              }
              if (
                a?.indexOfConcrete !== undefined &&
                b?.indexOfConcrete !== undefined &&
                a.indexOfConcrete !== b.indexOfConcrete
              ) {
                conflicts.push(
                  `genericId ${gid} key "${v.variantKey}" ${kind} pin #${idx} ` +
                    `indexOfConcrete drifts across families: ` +
                    `${a.indexOfConcrete} | ${b.indexOfConcrete}`
                )
              }
              const base = a ?? b
              if (!base) continue
              const indexOfConcrete = a?.indexOfConcrete ?? b?.indexOfConcrete
              merged.push({
                ...base,
                ...(indexOfConcrete !== undefined ? { indexOfConcrete } : {})
              })
            }
          }
          union.set(v.variantKey, {
            concreteId: existing.concreteId,
            variantKey: existing.variantKey,
            pins: merged.length ? merged : undefined
          })
        }
        contributors.add(d.record.subType)
      }
    }

    const observedCids = [...new Set(group.flatMap((d) => d.observedConcreteIds))].sort(
      (a, b) => a - b
    )
    const underived = observedCids.filter((cid) => !cidToKey.has(cid))
    const unionVariants = [...union.values()].sort(
      (a, b) => Number(a.concreteId) - Number(b.concreteId)
    )
    if (!customPinSpecialization) {
      const reflectiveInputIndexes = group[0]?.reflectiveInputIndexes ?? []
      const reflectiveOutputIndexes = group[0]?.reflectiveOutputIndexes ?? []
      for (const variant of unionVariants) {
        for (const index of reflectiveInputIndexes) {
          if (!(variant.pins ?? []).some((pin) => pin.kind === 'input' && pin.index === index)) {
            conflicts.push(
              `genericId ${gid} key "${variant.variantKey}" is missing reflective input pin #${index}`
            )
          }
        }
        for (const index of reflectiveOutputIndexes) {
          if (!(variant.pins ?? []).some((pin) => pin.kind === 'output' && pin.index === index)) {
            conflicts.push(
              `genericId ${gid} key "${variant.variantKey}" is missing reflective output pin #${index}`
            )
          }
        }
        for (const pin of variant.pins ?? []) {
          if (pin.indexOfConcrete === undefined) {
            conflicts.push(
              `genericId ${gid} key "${variant.variantKey}" ${pin.kind} pin #${pin.index} ` +
                'has no observed indexOfConcrete'
            )
          }
        }
      }
    }

    for (const d of group) {
      const record = d.record
      const status =
        conflicts.length ||
        underived.length ||
        unionVariants.length === 0 ||
        d.reflectiveInputIndexes.length === 0
          ? 'needs_developer_confirmation'
          : 'resolved'
      const provenance =
        status !== 'resolved'
          ? undefined
          : d.variants.length === unionVariants.length
            ? ('family' as const)
            : ('generic_id_union' as const)
      // Unconfirmed variant rules must not be silently applied: publish an
      // empty reflectMap so the resolver rejects the node with a stable error.
      record.reflectMap =
        status === 'resolved'
          ? unionVariants.map((v) => ({
              concreteId: v.concreteId,
              variantKey: v.variantKey,
              ...(v.pins ? { pins: v.pins } : {})
            }))
          : []
      record.specialKind = 'reflect'
      reflectReport.push({
        subType: record.subType,
        nodeType: record.nodeType,
        genericId: gid,
        variantKeys: Object.fromEntries(unionVariants.map((v) => [v.variantKey, v.concreteId])),
        ...(conflicts.length ? { conflicts: [...new Set(conflicts)] } : {}),
        ...(outputDrifts.length ? { outputTypeDrifts: [...new Set(outputDrifts)] } : {}),
        ...(underived.length ? { underivedConcreteIds: underived } : {}),
        ...(provenance ? { provenance } : {}),
        status
      })
    }
  }

  const editorStaticReuse = applyEditorStaticMetadata(records, modeData)
  const staticPinMetadata = applyStaticPinMetadata(records, [
    ...gidAggregates.values(),
    ...universalAggregates.values()
  ])
  const staticConcreteVariants = applyStaticConcreteVariants(records)

  records.sort((a, b) => a.subType.localeCompare(b.subType) || a.nodeType.localeCompare(b.nodeType))

  // -------------------------------------------------------------------------
  // Reports
  // -------------------------------------------------------------------------

  const capability = Object.fromEntries(
    Object.entries(modeData.graphs).map(([subType, graph]) => [
      subType,
      {
        beyond: { status: graph.beyond.status, reason: graph.beyond.reason },
        classic: { status: graph.classic.status, reason: graph.classic.reason }
      }
    ])
  )

  const statusExtensionValues = [
    ...new Set(statusExtensionHits.map((hit) => JSON.stringify(hit.value)))
  ].map((raw) => JSON.parse(raw) as unknown)

  const inlineHintFiles = Object.values(
    inlineVarTypeHintHits.reduce<Record<string, { file: string; count: number }>>((acc, hit) => {
      acc[hit.file] ??= { file: hit.file, count: 0 }
      acc[hit.file].count += 1
      return acc
    }, {})
  )

  const report = {
    sampleRoot,
    sampleCount: files.length,
    familyCounts: Object.fromEntries([...familyCounts.entries()].sort()),
    graphIdentities: [...graphIdentities.entries()].map(([raw, count]) => ({
      ...JSON.parse(raw),
      count
    })),
    metadataCounts: {
      total: records.length,
      bySubType: records.reduce<Record<string, number>>((acc, r) => {
        acc[r.subType] = (acc[r.subType] ?? 0) + 1
        return acc
      }, {}),
      withReflectMap: records.filter((r) => r.reflectMap).length,
      missingEnglishName: missingEnglishNames.length,
      nodeTypeSources,
      serverAliasDivergenceCount: serverAliasDivergences.length
    },
    editorStaticReuse: {
      source: CLIENT_NODE_MODES_PATH,
      recoveredCount: editorStaticReuse.length,
      recovered: editorStaticReuse,
      correctedGenericIds: [
        {
          subType: 'creation_skill',
          nodeType: 'recover_creation_s_hp',
          from: 200075,
          to: 200249,
          source: 'BeyondEditorStatic/Node/9073923717836444300.mihoyobin'
        }
      ]
    },
    staticPinMetadata,
    staticConcreteVariants,
    unknownFamily,
    decodeFailures,
    clientVarType25: {
      conclusion: 'observed faction list type',
      hitCount: clientVarType25Hits.length,
      hits: clientVarType25Hits
    },
    statusNodeExtension: {
      requiredForSubTypes: ['creation_status', 'creation_status_decision'],
      hitCount: statusExtensionHits.length,
      uniqueValues: statusExtensionValues,
      bySubType: statusExtensionHits.reduce<Record<string, number>>((acc, hit) => {
        acc[hit.subType] = (acc[hit.subType] ?? 0) + 1
        return acc
      }, {})
    },
    inlineVarTypeHint: {
      status: 'observed unsupported detail; not a main-chain blocker',
      hitCount: inlineVarTypeHintHits.length,
      files: inlineHintFiles,
      hits: inlineVarTypeHintHits
    }
  }

  const valueShapeList = [...valueShapes.values()].sort(
    (a, b) => a.clientVarType - b.clientVarType || b.count - a.count
  )

  writeJson(CLIENT_NODE_METADATA_PATH, records)
  writeJson('resources/client_graph_capability.json', capability)
  writeJson('tests/client_generated/_doc_name_alignment.json', {
    description:
      'zh<->en alignment of resources/node_definitions.json client/detail pages (index-based pairing is forbidden; see doc_name_alignment.ts)',
    pagePairs: docAlignment.report.pagePairs,
    zhEntries: docAlignment.report.zhEntries,
    matchRate: docAlignment.report.matchRate,
    provenance: docAlignment.report.provenance,
    nodeTypeSources,
    serverAliasDivergences,
    spellingVariants: docAlignment.report.conflicts,
    unresolved: docAlignment.report.unresolved,
    sectionLeftovers: docAlignment.report.sectionLeftovers,
    seedMisses: docAlignment.report.seedMisses,
    zhOnlyPages: docAlignment.report.zhOnlyPages,
    zhToEn: Object.fromEntries(
      [...docAlignment.byZhName.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([zh, info]) => [zh, info.enName])
    )
  })
  writeJson('tests/client_generated/_value_shapes.json', {
    description:
      'Observed VarBase shapes for literal input pins (alreadySetVal=true) grouped by clientVarType',
    shapeCount: valueShapeList.length,
    byClientVarType: valueShapeList.reduce<Record<string, number>>((acc, s) => {
      acc[`${s.clientVarType}:${s.typeName}`] =
        (acc[`${s.clientVarType}:${s.typeName}`] ?? 0) + s.count
      return acc
    }, {}),
    shapes: valueShapeList
  })
  writeJson('tests/client_generated/_reflect_resolution.json', {
    description: 'Reflect/generic variant resolution coverage derived from samples',
    multiVariantGenericIds: reflectReport.length,
    needsDeveloperConfirmation: reflectReport.filter(
      (r) => r.status === 'needs_developer_confirmation'
    ).length,
    entries: reflectReport
  })
  writeJson('tests/client_generated/_coverage_gaps.json', {
    unsupportedSpecialKinds: ['inline_var_type_hint'],
    conditionalSpecialKinds: ['structure_list_unknown_binding'],
    inlineVarTypeHintFiles: inlineHintFiles,
    missingEnglishName: missingEnglishNames,
    reflectNeedsConfirmation: reflectReport.filter(
      (r) => r.status === 'needs_developer_confirmation'
    ),
    missingMetadata: []
  })
  writeJson('tests/client_generated/_report.json', report)

  console.log(`[ok] scanned ${files.length} client gia samples`)
  console.log(
    `[ok] extracted ${records.length} node metadata records (${records.filter((r) => r.reflectMap).length} with reflectMap, ${missingEnglishNames.length} without english name)`
  )
}

main()
