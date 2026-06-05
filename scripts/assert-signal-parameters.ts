import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { emitIrJsonForEntries, resolveIrOutputPath } from '../src/compiler/gs_to_ir_json_transform/index.js'
import { writeGiaFromIrJsonFile } from '../src/compiler/ir_to_gia_pipeline.js'
import { compileTsToGs } from '../src/compiler/ts_to_gs_pipeline.js'
import type { Argument, IRDocument, ServerNode } from '../src/runtime/IR.js'
import { extract_value, get_nodes } from '../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/gia_gen/extract.js'
import { decode_gia_file } from '../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/decode.js'
import {
  NodePin_Index_Kind,
  type GraphNode,
  type NodePin
} from '../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto.js'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'dist-signal-parameter-assert')
const fixture = './tests/signal_parameters_test.ts'
const signalsResourcePath = path.join(repoRoot, 'src/resources/signals.ts')

const GRAPH_SEND_AND_WIRED_MONITOR = 1073741888
const SEND_SIGNAL_NODE_ID = 300000
const MONITOR_SIGNAL_NODE_ID = 300001

function normalizeGeneratedText(text: string) {
  return text.replace(/\r\n/g, '\n')
}

function toImportSpecifier(fromFile: string, targetFile: string) {
  let spec = path.relative(path.dirname(fromFile), targetFile).replace(/\\/g, '/')
  if (!spec.startsWith('.')) spec = `./${spec}`
  return spec
}

function assertContains(text: string, expected: string) {
  assert.ok(text.includes(expected), `Expected generated output to contain:\n${expected}`)
}

function assertNotContains(text: string, unexpected: string) {
  assert.ok(!text.includes(unexpected), `Expected generated output not to contain:\n${unexpected}`)
}

function assertValueArg(arg: Argument | undefined, type: string, value?: unknown) {
  assert.ok(arg, `Expected ${type} argument to exist`)
  assert.notEqual(arg.type, 'conn', `Expected literal ${type} argument, got connection`)
  assert.equal(arg.type, type)
  if (arguments.length >= 3) assert.deepEqual(arg.value, value)
}

function assertConnArg(arg: Argument | undefined, type: string) {
  assert.ok(arg, `Expected ${type} connection argument to exist`)
  assert.equal(arg.type, 'conn')
  assert.equal(arg.value.type, type)
}

function nodeSignalName(node: ServerNode): string | undefined {
  const signalArg = node.args?.[0]
  if (!signalArg || signalArg.type === 'conn' || signalArg.type !== 'str') return undefined
  return String(signalArg.value)
}

function nodesOf(doc: IRDocument): ServerNode[] {
  return (doc.nodes ?? []) as ServerNode[]
}

function readIrDocuments(irPath: string): IRDocument[] {
  const raw: unknown = JSON.parse(fs.readFileSync(irPath, 'utf8'))
  return (Array.isArray(raw) ? raw : [raw]) as IRDocument[]
}

function findDoc(docs: IRDocument[], graphId: number): IRDocument {
  const doc = docs.find((item) => item.graph?.id === graphId)
  assert.ok(doc, `Expected IR document for graph ${graphId}`)
  return doc
}

function findSignalNode(doc: IRDocument, type: string, signalName: string): ServerNode {
  const node = nodesOf(doc).find((item) => item.type === type && nodeSignalName(item) === signalName)
  assert.ok(node, `Expected ${type} node for ${signalName} in graph ${doc.graph?.id}`)
  return node
}

function countSignalNodes(doc: IRDocument, type: string) {
  return nodesOf(doc).filter((node) => node.type === type).length
}

function signalParamConnections(
  doc: IRDocument,
  sourceNodeId: number
): { node_id: number; index: number; type: string }[] {
  const connections: { node_id: number; index: number; type: string }[] = []
  for (const node of nodesOf(doc)) {
    for (const arg of node.args ?? []) {
      if (arg?.type === 'conn' && arg.value.node_id === sourceNodeId && arg.value.index >= 3) {
        connections.push({
          node_id: arg.value.node_id,
          index: arg.value.index,
          type: arg.value.type
        })
      }
    }
  }
  return connections.sort((a, b) => a.index - b.index)
}

function decodeGiaNodes(giaPath: string): GraphNode[] {
  const root = decode_gia_file(giaPath)
  const nodes = get_nodes(root)
  assert.ok(nodes, `Expected decoded GIA nodes for ${giaPath}`)
  return nodes
}

function isGiaNode(node: GraphNode, nodeId: number) {
  return node.concreteId?.nodeId === nodeId || node.genericId?.nodeId === nodeId
}

function findGiaSignalNode(nodes: GraphNode[], nodeId: number, signalName: string): GraphNode {
  const node = nodes.find((item) => {
    if (!isGiaNode(item, nodeId)) return false
    return item.pins.some(
      (pin) =>
        pin.i1.kind === NodePin_Index_Kind.ClientExecNode &&
        typeof pin.value?.bString?.val === 'string' &&
        pin.value.bString.val === signalName
    )
  })
  assert.ok(node, `Expected GIA signal node ${nodeId} for ${signalName}`)
  return node
}

function inParamPins(node: GraphNode): NodePin[] {
  return node.pins.filter((pin) => pin.i1.kind === NodePin_Index_Kind.InParam)
}

function inputPinValuesByIndex(node: GraphNode): Map<number, unknown> {
  const out = new Map<number, unknown>()
  for (const pin of inParamPins(node)) {
    const value = pin.value
    if (!value) continue
    if (value.alreadySetVal !== true) continue
    out.set(pin.i1.index, extract_value(value))
  }
  return out
}

function outParamPins(node: GraphNode): NodePin[] {
  return node.pins.filter((pin) => pin.i1.kind === NodePin_Index_Kind.OutParam)
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

  const outFile = result.outFiles.find((file) => file.endsWith('signal_parameters_test.gs.ts'))
  assert.ok(outFile, 'Expected fixture GS output file to be emitted')

  const sourceRuntimeImport = toImportSpecifier(outFile, path.join(repoRoot, 'src/runtime/core.js'))
  let generatedText = normalizeGeneratedText(fs.readFileSync(outFile, 'utf8')).replace(
    /from 'genshin-ts\/runtime\/core';/g,
    `from '${sourceRuntimeImport}';`
  )
  fs.writeFileSync(outFile, generatedText, 'utf8')

  assertContains(generatedText, 'defineSignal')
  assertContains(generatedText, 'f.sendSignal(Signal.signal_param_literal, int(')
  assertContains(generatedText, "'ready', true);")
  assertContains(generatedText, 'f.sendSignal(Signal.signal_param_wired,')
  assertContains(generatedText, "f.sendSignal('signal_param_none');")
  assertContains(generatedText, "signal_param_wired")
  assertContains(generatedText, "signal_param_literal")
  assertContains(generatedText, "signal_param_none")
  assertContains(generatedText, 'evt.params.参数_1')
  assertContains(generatedText, 'evt.params.参数_2')
  assertContains(generatedText, 'evt.params.参数_3')
  assertNotContains(generatedText, '}, 3)')
  assertNotContains(generatedText, 'signalParam0.asType')
  assertNotContains(generatedText, 'signalParam1.asType')
  assertNotContains(generatedText, 'signalParam2.asType')
  assertNotContains(generatedText, 'signalParam3')

  assert.ok(fs.existsSync(signalsResourcePath), 'Expected extracted signals.ts to exist')
  const signalsText = normalizeGeneratedText(fs.readFileSync(signalsResourcePath, 'utf8'))
  assertContains(signalsText, "信号_1_all_params1: defineSignal('信号_1_all_params1', [")
  assertContains(signalsText, "['参数_1', 'int']")
  assertContains(signalsText, "['参数_2', 'float']")
  assertContains(signalsText, "['参数_3', 'str']")
  assertContains(signalsText, "['参数_4', 'vec3']")
  assertContains(signalsText, "['参数_5', 'bool']")
  assertContains(signalsText, "['参数_6', 'guid']")
  assertContains(signalsText, "['参数_7', 'entity']")
  assertContains(signalsText, "['参数_8', 'prefab_id']")
  assertContains(signalsText, "['参数_9', 'config_id']")
  assertContains(signalsText, "['参数_10', 'float_list']")
  assertContains(signalsText, "信号_1_all_params2: defineSignal('信号_1_all_params2', [")
  assertContains(signalsText, "['参数_1', 'str_list']")
  assertContains(signalsText, "['参数_2', 'vec3_list']")
  assertContains(signalsText, "['参数_3', 'bool_list']")
  assertContains(signalsText, "['参数_4', 'guid_list']")
  assertContains(signalsText, "['参数_5', 'entity_list']")
  assertContains(signalsText, "['参数_6', 'prefab_id_list']")
  assertContains(signalsText, "['参数_7', 'config_id_list']")
  assertContains(signalsText, "['参数_8', 'int_list']")
  assertNotContains(signalsText, "['参数_10', 'unknown']")

  await emitIrJsonForEntries([outFile], {
    cwd: repoRoot,
    runtimeOptions: {
      precompileExpression: false,
      removeUnusedNodes: false
    }
  })

  const irPath = resolveIrOutputPath(outFile)
  const docs = readIrDocuments(irPath)
  assert.equal(docs.length, 1, 'Expected one server graph in signal parameter fixture')

  const sendDoc = findDoc(docs, GRAPH_SEND_AND_WIRED_MONITOR)

  const literalSend = findSignalNode(sendDoc, 'send_signal', 'signal_param_literal')
  assert.equal(literalSend.args?.length, 4)
  assertConnArg(literalSend.args?.[1], 'int')
  assertValueArg(literalSend.args?.[2], 'str', 'ready')
  assertValueArg(literalSend.args?.[3], 'bool', true)

  const wiredSend = findSignalNode(sendDoc, 'send_signal', 'signal_param_wired')
  assert.equal(wiredSend.args?.length, 4)
  assertConnArg(wiredSend.args?.[1], 'int')
  assertConnArg(wiredSend.args?.[2], 'str')
  assertConnArg(wiredSend.args?.[3], 'entity')

  const noParamSend = findSignalNode(sendDoc, 'send_signal', 'signal_param_none')
  assert.equal(noParamSend.args?.length, 1)

  const wiredMonitor = findSignalNode(sendDoc, 'monitor_signal', 'signal_param_wired')
  assert.equal(wiredMonitor.args?.length, 1)
  assert.equal(countSignalNodes(sendDoc, 'monitor_signal'), 3)
  const wiredParamConnections = signalParamConnections(sendDoc, wiredMonitor.id)
  assert.deepEqual(
    wiredParamConnections.map((conn) => conn.index),
    [3, 4, 5],
    'Expected wired monitor signal parameters to be consumed from IR output pins 3..5'
  )
  assert.deepEqual(
    wiredParamConnections.map((conn) => conn.node_id),
    [wiredMonitor.id, wiredMonitor.id, wiredMonitor.id],
    'Expected wired signal parameter connections to target the monitor_signal event node id'
  )

  const literalMonitor = findSignalNode(sendDoc, 'monitor_signal', 'signal_param_literal')
  assert.equal(literalMonitor.args?.length, 1)
  const literalParamConnections = signalParamConnections(sendDoc, literalMonitor.id)
  assert.deepEqual(
    literalParamConnections.map((conn) => conn.index),
    [3, 4, 5],
    'Expected literal monitor signal parameters to be consumed from IR output pins 3..5'
  )
  assert.deepEqual(
    literalParamConnections.map((conn) => conn.node_id),
    [literalMonitor.id, literalMonitor.id, literalMonitor.id],
    'Expected literal signal parameter connections to target the monitor_signal event node id'
  )

  const noParamMonitor = findSignalNode(sendDoc, 'monitor_signal', 'signal_param_none')
  assert.equal(noParamMonitor.args?.length, 1)
  assert.deepEqual(
    signalParamConnections(sendDoc, noParamMonitor.id),
    [],
    'Expected no-param monitor signal not to consume signal parameter output pins'
  )

  let giaResults
  try {
    giaResults = writeGiaFromIrJsonFile(irPath)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(
      `[signal-params] IR->GIA failed while converting signal parameter pins. ` +
        `The IR consumes monitor_signal output pins 3..5, so the GIA converter must expose matching monitor_signal output pins. ${message}`
    )
  }
  assert.equal(giaResults.length, 1, 'Expected one GIA file for the server graph')

  const sendGia = giaResults.find((item) => item.graphId === GRAPH_SEND_AND_WIRED_MONITOR)
  assert.ok(sendGia, 'Expected GIA output for sending graph')

  const sendGiaNodes = decodeGiaNodes(sendGia.giaPath)
  const literalSendGiaNode = findGiaSignalNode(
    sendGiaNodes,
    SEND_SIGNAL_NODE_ID,
    'signal_param_literal'
  )
  assert.deepEqual(
    inParamPins(literalSendGiaNode)
      .map((pin) => pin.i1.index)
      .sort((a, b) => a - b),
    [0, 1, 2],
    'Expected literal sendSignal parameters to map to data input pins 0..2'
  )
  assert.deepEqual(
    Object.fromEntries(inputPinValuesByIndex(literalSendGiaNode)),
    { 1: 'ready', 2: 1 },
    'Expected literal sendSignal values after a wired first parameter to stay on pins 1..2'
  )

  const wiredSendGiaNode = findGiaSignalNode(sendGiaNodes, SEND_SIGNAL_NODE_ID, 'signal_param_wired')
  assert.deepEqual(
    inParamPins(wiredSendGiaNode).map((pin) => pin.i1.index).sort((a, b) => a - b),
    [0, 1, 2],
    'Expected wired sendSignal parameters to map to data input pins 0..2'
  )
  assert.equal(
    findGiaSignalNode(sendGiaNodes, SEND_SIGNAL_NODE_ID, 'signal_param_none').pins.filter(
      (pin) => pin.i1.kind !== NodePin_Index_Kind.ClientExecNode
    ).length,
    0,
    'Expected no-param sendSignal to contain only the signal-name client exec pin'
  )

  const wiredMonitorGiaNode = findGiaSignalNode(sendGiaNodes, MONITOR_SIGNAL_NODE_ID, 'signal_param_wired')
  assert.deepEqual(
    outParamPins(wiredMonitorGiaNode)
      .map((pin) => pin.i1.index)
      .filter((index) => index >= 3)
      .sort((a, b) => a - b),
    [3, 4, 5],
    'Expected typed onSignal parameters to map to monitor output pins 3..5'
  )

  const literalMonitorGiaNode = findGiaSignalNode(
    sendGiaNodes,
    MONITOR_SIGNAL_NODE_ID,
    'signal_param_literal'
  )
  assert.deepEqual(
    outParamPins(literalMonitorGiaNode)
      .map((pin) => pin.i1.index)
      .filter((index) => index >= 3)
      .sort((a, b) => a - b),
    [3, 4, 5],
    'Expected typed literal onSignal parameters to map to monitor output pins 3..5'
  )

  const noParamMonitorGiaNode = findGiaSignalNode(
    sendGiaNodes,
    MONITOR_SIGNAL_NODE_ID,
    'signal_param_none'
  )
  assert.deepEqual(
    outParamPins(noParamMonitorGiaNode)
      .map((pin) => pin.i1.index)
      .filter((index) => index >= 3),
    [],
    'Expected string onSignal without SignalDefinition not to create signal parameter output pins'
  )

  console.log(`[ok] signal parameter output verified: ${outFile}`)
} finally {
  fs.rmSync(outDir, { recursive: true, force: true })
}
