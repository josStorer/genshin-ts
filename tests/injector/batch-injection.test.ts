import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { createInjectionTaskQueue, runInjectionAttempt } from '../../src/cli/injection_lifecycle.js'
import {
  applyReplacements,
  buildFile,
  encodeVarint,
  parseMessage
} from '../../src/injector/binary.js'
import { createInjector } from '../../src/injector/index.js'
import { buildNodeGraphFieldIndex, type NodeGraphObj } from '../../src/injector/node_graph.js'
import { loadGiaProto } from '../../src/injector/proto.js'
import type { LenField } from '../../src/injector/types.js'
import { client_signal_name_value } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/gia_gen/client_basic.js'

const successfulLifecycle: string[] = []
const successfulAttempt = runInjectionAttempt(
  () => {
    successfulLifecycle.push('run')
    return { wroteGil: true, value: 42 }
  },
  {
    onBeforeInject: () => successfulLifecycle.push('before'),
    onAfterInject: (outcome) => successfulLifecycle.push(`after:${outcome.status}`)
  }
)
assert.equal(successfulAttempt.value, 42)
assert.deepEqual(successfulLifecycle, ['before', 'run', 'after:ok'])

const originalLifecycleError = new RangeError('global injection failure')
let failedLifecycleOutcome: unknown
assert.throws(
  () =>
    runInjectionAttempt(
      () => {
        throw originalLifecycleError
      },
      {
        onAfterInject: (outcome) => {
          failedLifecycleOutcome = outcome
        }
      }
    ),
  (error: unknown) => error === originalLifecycleError
)
assert.deepEqual(failedLifecycleOutcome, {
  status: 'failed',
  wroteGil: false,
  error: originalLifecycleError
})

let releaseFirstCodeChange!: () => void
const firstCodeChangeBlocked = new Promise<void>((resolve) => {
  releaseFirstCodeChange = resolve
})
const taskEvents: string[] = []
let codeChangeRuns = 0
let activeTasks = 0
let maxActiveTasks = 0
const injectionTasks = createInjectionTaskQueue({
  runCodeChange: async () => {
    codeChangeRuns++
    activeTasks++
    maxActiveTasks = Math.max(maxActiveTasks, activeTasks)
    taskEvents.push(`code:${codeChangeRuns}:start`)
    if (codeChangeRuns === 1) await firstCodeChangeBlocked
    taskEvents.push(`code:${codeChangeRuns}:end`)
    activeTasks--
  },
  runReinject: async () => {
    activeTasks++
    maxActiveTasks = Math.max(maxActiveTasks, activeTasks)
    taskEvents.push('reinject:start')
    await Promise.resolve()
    taskEvents.push('reinject:end')
    activeTasks--
  },
  onError: (error) => {
    throw error
  }
})
const firstTaskRun = injectionTasks.schedule('code-change')
const queuedReinject = injectionTasks.schedule('reinject')
const coalescedReinject = injectionTasks.schedule('reinject')
const queuedCodeChange = injectionTasks.schedule('code-change')
assert.equal(activeTasks, 1)
releaseFirstCodeChange()
await Promise.all([firstTaskRun, queuedReinject, coalescedReinject, queuedCodeChange])
assert.equal(maxActiveTasks, 1)
assert.deepEqual(taskEvents, [
  'code:1:start',
  'code:1:end',
  'code:2:start',
  'code:2:end',
  'reinject:start',
  'reinject:end'
])

function concat(...parts: Uint8Array[]): Uint8Array {
  return Buffer.concat(parts.map((part) => Buffer.from(part)))
}

function varintField(field: number, value: number): Uint8Array {
  return concat(encodeVarint(field << 3), encodeVarint(value))
}

function bytesField(field: number, value: Uint8Array): Uint8Array {
  return concat(encodeVarint((field << 3) | 2), encodeVarint(value.length), value)
}

function parsePayload(payload: Uint8Array) {
  const fields: LenField[] = []
  const nodeGraphBlobFields: LenField[] = []
  parseMessage(payload, 0, payload.length, 0, 0, 0, 0, 0, 0, 0, fields, {
    nodeGraphBlobFields
  })
  return { fields, nodeGraphBlobFields }
}

const nestedPayload = bytesField(
  9,
  concat(bytesField(1, varintField(1, 1)), bytesField(2, varintField(1, 2)))
)
const nestedFields = parsePayload(nestedPayload).fields
const firstNested = nestedFields.find((field) => field.depth === 2 && field.field === 1)
const secondNested = nestedFields.find((field) => field.depth === 2 && field.field === 2)
assert.ok(firstNested)
assert.ok(secondNested)

const firstReplacement = Buffer.alloc(130, 1)
const secondReplacement = Buffer.alloc(140, 2)
const replacedNested = applyReplacements(nestedPayload, nestedFields, [
  { field: firstNested, data: firstReplacement },
  { field: secondNested, data: secondReplacement }
])
const replacedNestedFields = parsePayload(replacedNested).fields
const replacedFirst = replacedNestedFields.find((field) => field.depth === 2 && field.field === 1)
const replacedSecond = replacedNestedFields.find((field) => field.depth === 2 && field.field === 2)
assert.ok(replacedFirst)
assert.ok(replacedSecond)
assert.deepEqual(
  replacedNested.subarray(replacedFirst.dataStart, replacedFirst.dataEnd),
  firstReplacement
)
assert.deepEqual(
  replacedNested.subarray(replacedSecond.dataStart, replacedSecond.dataEnd),
  secondReplacement
)

const proto = loadGiaProto()
const targetA = 1073741901
const targetB = 1073741902
const unsafeTarget = 1073741903
const missingTarget = 1073741999
const signalName = 'batch_signal'
const signalNodeId = 456789
const clientSignalNodeId = 456790
const header = {
  schema: 1,
  headTag: 0x0326,
  fileType: 0,
  tailTag: 0x0679
}

function graph(id: number, name: string, nodes: object[] = [], graphType = 20000) {
  return proto.nodeGraphMessage.create({
    id: { class: 10000, type: graphType, kind: 21001, id },
    name,
    nodes
  })
}

function nodeGraphField(
  id: number,
  name: string,
  graphType = 20000,
  nodes: object[] = []
): Uint8Array {
  return bytesField(
    10,
    bytesField(
      1,
      bytesField(1, proto.nodeGraphMessage.encode(graph(id, name, nodes, graphType)).finish())
    )
  )
}

function signalDefinition(nodeId: number, nodeType: number): Uint8Array {
  const id = concat(
    varintField(1, 10001),
    varintField(2, nodeType),
    varintField(3, 22000),
    varintField(5, nodeId)
  )
  const composite = concat(
    bytesField(4, bytesField(1, id)),
    bytesField(107, bytesField(101, bytesField(1, Buffer.from(signalName, 'utf8'))))
  )
  return bytesField(10, bytesField(2, bytesField(1, composite)))
}

function makeGiaBytes(
  id: number,
  name: string,
  nodes: object[] = [],
  graphType = 20000
): Uint8Array {
  const root = proto.rootMessage.create({
    graph: {
      id: { class: 1, type: 3, id },
      name,
      which: 9,
      graph: { inner: { graph: graph(id, name, nodes, graphType) } }
    }
  })
  return buildFile(proto.rootMessage.encode(root).finish(), header)
}

function decodeGraph(gilBytes: Uint8Array, id: number): NodeGraphObj {
  const payload = gilBytes.subarray(20, gilBytes.length - 4)
  const parsed = parsePayload(payload)
  const matches = buildNodeGraphFieldIndex(payload, parsed.nodeGraphBlobFields).get(id) ?? []
  assert.equal(matches.length, 1)
  return proto.nodeGraphMessage.decode(
    payload.subarray(matches[0].field.dataStart, matches[0].field.dataEnd)
  ) as unknown as NodeGraphObj
}

const sendSignalNode = {
  nodeIndex: 1,
  genericId: { class: 10001, type: 20000, kind: 22000, nodeId: 300000 },
  concreteId: { class: 10001, type: 20000, kind: 22000, nodeId: 300000 },
  pins: [
    {
      i1: { kind: 5, index: 0 },
      value: client_signal_name_value(signalName)
    }
  ]
}
const sendSignalToServerNode = {
  nodeIndex: 1,
  genericId: { class: 10001, type: 20002, kind: 22000, nodeId: 300002 },
  concreteId: { class: 10001, type: 20002, kind: 22000, nodeId: 2000 },
  pins: [
    {
      i1: { kind: 5, index: 0 },
      value: client_signal_name_value(signalName)
    }
  ]
}

const gilBytes = buildFile(
  concat(
    nodeGraphField(targetA, 'empty A'),
    nodeGraphField(targetB, 'empty B', 20002),
    nodeGraphField(unsafeTarget, '车', 20000, [sendSignalNode]),
    signalDefinition(signalNodeId, 20000),
    signalDefinition(clientSignalNodeId, 20002)
  ),
  header
)
const giaA = makeGiaBytes(targetA, '_GSTS_batch_A', [sendSignalNode])
const giaB = makeGiaBytes(
  targetB,
  `_GSTS_batch_${'B'.repeat(180)}`,
  [sendSignalToServerNode],
  20002
)
const injector = createInjector({ lang: 'en' })

let sequentialBytes: Uint8Array = gilBytes
for (const giaBytes of [giaA, giaB]) {
  sequentialBytes = injector.injectBytes({ gilBytes: sequentialBytes, giaBytes }).bytes
}

const batch = injector.injectManyBytes({
  gilBytes,
  items: [{ giaBytes: giaA }, { giaBytes: giaB }]
})
assert.deepEqual(Buffer.from(batch.bytes), Buffer.from(sequentialBytes))
assert.deepEqual(
  batch.items.map((item) => item.status),
  ['ok', 'ok']
)
assert.equal(batch.stats.replacementCount, 2)
assert.equal(batch.stats.signalFieldCount, 2)
assert.ok(batch.timings.parseGilMs >= 0)
assert.ok(batch.timings.indexNodeGraphsMs >= 0)
assert.ok(batch.timings.totalMs >= batch.timings.parseGilMs)

const injectedA = decodeGraph(batch.bytes, targetA) as {
  nodes?: Array<{
    genericId?: { nodeId?: number }
    concreteId?: { nodeId?: number }
  }>
}
assert.equal(injectedA.nodes?.[0]?.genericId?.nodeId, signalNodeId)
assert.equal(injectedA.nodes?.[0]?.concreteId?.nodeId, signalNodeId)
const injectedB = decodeGraph(batch.bytes, targetB) as {
  nodes?: Array<{
    genericId?: { nodeId?: number }
    concreteId?: { nodeId?: number }
  }>
}
assert.equal(injectedB.nodes?.[0]?.genericId?.nodeId, clientSignalNodeId)
assert.equal(injectedB.nodes?.[0]?.concreteId?.nodeId, 2000)

const missingGia = makeGiaBytes(missingTarget, '_GSTS_missing', [
  {
    ...sendSignalNode,
    pins: [
      {
        i1: { kind: 5, index: 0 },
        value: client_signal_name_value('undefined_signal_on_missing_target')
      }
    ]
  }
])
const unsafeGia = makeGiaBytes(unsafeTarget, '_GSTS_unsafe_replacement', [
  {
    ...sendSignalNode,
    pins: [
      {
        i1: { kind: 5, index: 0 },
        value: client_signal_name_value('undefined_signal_on_unsafe_target')
      }
    ]
  }
])
const mismatchedClientGia = makeGiaBytes(targetB, '_GSTS_mismatched_client_type', [], 20009)
const partial = injector.injectManyBytes({
  gilBytes,
  items: [
    { giaBytes: giaA },
    { giaBytes: missingGia },
    { giaBytes: unsafeGia },
    { giaBytes: mismatchedClientGia },
    { giaBytes: giaB }
  ]
})
assert.deepEqual(
  partial.items.map((item) => item.status),
  ['ok', 'skipped', 'skipped', 'skipped', 'ok']
)
const missingResult = partial.items[1]
const unsafeResult = partial.items[2]
const clientMismatchResult = partial.items[3]
assert.equal(missingResult.status, 'skipped')
assert.equal(unsafeResult.status, 'skipped')
assert.equal(clientMismatchResult.status, 'skipped')
assert.equal(missingResult.reason, 'target-not-found')
assert.equal(unsafeResult.reason, 'unsafe-target')
assert.equal(clientMismatchResult.reason, 'client-type-mismatch')
assert.match(missingResult.message, /target NodeGraph not found/)
assert.match(unsafeResult.message, /target NodeGraph not empty and name not _GSTS\*: 车/)
assert.match(clientMismatchResult.message, /Client NodeGraph type mismatch/)
assert.ok(missingResult.cause instanceof Error)
assert.equal(Object.prototype.propertyIsEnumerable.call(missingResult, 'cause'), false)
assert.doesNotMatch(JSON.stringify(missingResult), /cause/)
assert.equal(partial.stats.replacementCount, 2)
assert.equal((decodeGraph(partial.bytes, targetA) as { name?: string }).name, '_GSTS_batch_A')
assert.equal(
  (decodeGraph(partial.bytes, targetB) as { name?: string }).name,
  `_GSTS_batch_${'B'.repeat(180)}`
)

const invalidGia = Buffer.concat([Buffer.alloc(20), Buffer.from([0xff]), Buffer.alloc(4)])
const failedBatch = injector.injectManyBytes({
  gilBytes,
  items: [{ giaBytes: invalidGia }, { giaBytes: giaA }]
})
assert.deepEqual(
  failedBatch.items.map((item) => item.status),
  ['failed', 'ok']
)
const failedResult = failedBatch.items[0]
assert.equal(failedResult.status, 'failed')
assert.ok(failedResult.cause instanceof RangeError)
assert.equal(failedResult.error, failedResult.cause.message)
assert.equal(Object.prototype.propertyIsEnumerable.call(failedResult, 'cause'), false)
assert.doesNotMatch(JSON.stringify(failedResult), /cause/)
assert.match(failedResult.cause.stack?.split('\n')[1] ?? '', /indexOutOfRange/)
assert.throws(
  () => injector.injectBytes({ gilBytes, giaBytes: invalidGia }),
  (error: unknown) => {
    assert.ok(error instanceof RangeError)
    assert.match(error.stack?.split('\n')[1] ?? '', /indexOutOfRange/)
    return true
  }
)

const firstDuplicate = makeGiaBytes(targetA, '_GSTS_duplicate_first')
const lastDuplicate = makeGiaBytes(targetA, '_GSTS_duplicate_last')
const duplicateBatch = injector.injectManyBytes({
  gilBytes,
  items: [{ giaBytes: firstDuplicate }, { giaBytes: lastDuplicate }]
})
const firstSequential = injector.injectBytes({ gilBytes, giaBytes: firstDuplicate }).bytes
const lastSequential = injector.injectBytes({
  gilBytes: firstSequential,
  giaBytes: lastDuplicate
}).bytes
assert.deepEqual(Buffer.from(duplicateBatch.bytes), Buffer.from(lastSequential))
assert.equal(duplicateBatch.stats.replacementCount, 1)
assert.equal(
  (decodeGraph(duplicateBatch.bytes, targetA) as { name?: string }).name,
  '_GSTS_duplicate_last'
)

const benchmarkDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsts-inject-benchmark-'))
try {
  const gilPath = path.join(benchmarkDir, 'map.gil')
  const giaDir = path.join(benchmarkDir, 'gia')
  fs.mkdirSync(giaDir)
  fs.writeFileSync(gilPath, gilBytes)
  fs.writeFileSync(path.join(giaDir, 'a.gia'), giaA)
  fs.writeFileSync(path.join(giaDir, 'b.gia'), giaB)
  fs.writeFileSync(path.join(giaDir, 'missing.gia'), missingGia)
  fs.writeFileSync(path.join(giaDir, 'unsafe.gia'), unsafeGia)
  fs.writeFileSync(path.join(giaDir, 'client-mismatch.gia'), mismatchedClientGia)
  const benchmark = spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      path.resolve('scripts/benchmark-injector.ts'),
      gilPath,
      giaDir,
      '--repeat',
      '2',
      '--warmup',
      '0',
      '--lang',
      'en-US'
    ],
    { cwd: process.cwd(), encoding: 'utf8', windowsHide: true }
  )
  assert.equal(benchmark.status, 0, benchmark.stderr)
  assert.match(benchmark.stdout, /\[inject-benchmark\]/)
  assert.match(benchmark.stdout, /"skippedTargetNotFound":\{"count":1/)
  assert.match(benchmark.stdout, /"skippedUnsafeTarget":\{"count":1/)
  assert.match(benchmark.stdout, /"skippedClientTypeMismatch":\{"count":1/)
  assert.match(benchmark.stdout, /"outputVerifiedEqual":true/)

  const localAppData = path.join(benchmarkDir, 'AppData', 'Local')
  const saveDir = path.join(
    benchmarkDir,
    'AppData',
    'LocalLow',
    'miHoYo',
    '原神',
    'BeyondLocal',
    '123',
    'Beyond_Local_Save_Level'
  )
  fs.mkdirSync(saveDir, { recursive: true })
  const configuredGilPath = path.join(saveDir, '456.gil')
  fs.writeFileSync(configuredGilPath, gilBytes)
  const configPath = path.join(benchmarkDir, 'gsts.config.ts')
  fs.writeFileSync(
    configPath,
    `export default ${JSON.stringify({
      compileRoot: '.',
      entries: ['./src'],
      outDir: './gia',
      lang: 'zh-CN',
      inject: {
        gameRegion: 'China',
        playerId: 123,
        mapId: 456
      }
    })}\n`
  )
  const configBenchmark = spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      path.resolve('scripts/benchmark-injector.ts'),
      '--config',
      configPath,
      '--repeat',
      '1',
      '--warmup',
      '0'
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      windowsHide: true,
      env: { ...process.env, LOCALAPPDATA: localAppData }
    }
  )
  assert.equal(configBenchmark.status, 0, configBenchmark.stderr)
  assert.match(configBenchmark.stdout, /"inputMode":"config"/)
  assert.match(configBenchmark.stdout, /"configFile":"gsts.config.ts"/)
  assert.match(configBenchmark.stdout, /"skippedTargetNotFound":\{"count":1/)
  assert.match(configBenchmark.stdout, /"skippedUnsafeTarget":\{"count":1/)
  assert.match(configBenchmark.stdout, /"skippedClientTypeMismatch":\{"count":1/)
  assert.match(configBenchmark.stdout, /"outputVerifiedEqual":true/)

  const appData = path.join(benchmarkDir, 'AppData', 'Roaming')
  const cliStateDir = path.join(appData, 'genshin-ts')
  fs.mkdirSync(cliStateDir, { recursive: true })
  fs.writeFileSync(
    path.join(cliStateDir, 'state.json'),
    JSON.stringify({
      updateCheck: { lastAt: Date.now(), streak: 1 },
      noticeCheck: { lastAt: Date.now(), streak: 1 }
    })
  )
  const cliEnv = { ...process.env, APPDATA: appData, LOCALAPPDATA: localAppData, NO_COLOR: '1' }
  const beforeSkippedBytes = fs.readFileSync(configuredGilPath)
  const beforeSkippedMtime = fs.statSync(configuredGilPath).mtimeMs
  const skippedCli = spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      path.resolve('src/cli/gsts.ts'),
      '--config',
      configPath,
      '--lang',
      'en-US',
      '--inject-profile',
      path.join(giaDir, 'missing.gia')
    ],
    { cwd: process.cwd(), encoding: 'utf8', windowsHide: true, env: cliEnv }
  )
  assert.equal(skippedCli.status, 0, skippedCli.stderr)
  assert.match(skippedCli.stderr, /Skipped injection missing\.gia/)
  assert.match(skippedCli.stdout, /ok 0, skipped 1, fail 0/)
  assert.match(skippedCli.stdout, /"kind":"gsts-inject-profile","version":2/)
  assert.match(skippedCli.stdout, /"status":"skipped"/)
  assert.match(skippedCli.stdout, /"reason":"target-not-found"/)
  assert.doesNotMatch(skippedCli.stdout, /"cause":/)
  assert.deepEqual(fs.readFileSync(configuredGilPath), beforeSkippedBytes)
  assert.equal(fs.statSync(configuredGilPath).mtimeMs, beforeSkippedMtime)

  const invalidGiaPath = path.join(giaDir, 'invalid.gia')
  fs.writeFileSync(invalidGiaPath, invalidGia)
  const failedCli = spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      path.resolve('src/cli/gsts.ts'),
      '--config',
      configPath,
      '--lang',
      'en-US',
      invalidGiaPath
    ],
    { cwd: process.cwd(), encoding: 'utf8', windowsHide: true, env: cliEnv }
  )
  assert.equal(failedCli.status, 1, `${failedCli.stdout}\n${failedCli.stderr}`)
  assert.match(failedCli.stderr, /Injection failed invalid\.gia/)
  assert.match(failedCli.stdout, /ok 0, skipped 0, fail 1/)

  const invalidGilBytes = Buffer.alloc(24)
  fs.writeFileSync(configuredGilPath, invalidGilBytes)
  const globalFailedCli = spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      path.resolve('src/cli/gsts.ts'),
      '--config',
      configPath,
      '--lang',
      'en-US',
      '--inject-profile',
      path.join(giaDir, 'a.gia')
    ],
    { cwd: process.cwd(), encoding: 'utf8', windowsHide: true, env: cliEnv }
  )
  assert.equal(globalFailedCli.status, 1, `${globalFailedCli.stdout}\n${globalFailedCli.stderr}`)
  assert.match(globalFailedCli.stderr, /invalid gil header tags/)
  assert.match(globalFailedCli.stdout, /"status":"failed","fatal":true/)
  assert.match(globalFailedCli.stdout, /"error":"\[error\] invalid gil header tags"/)
  assert.deepEqual(fs.readFileSync(configuredGilPath), invalidGilBytes)
} finally {
  fs.rmSync(benchmarkDir, { recursive: true, force: true })
}

console.log('[ok] batch injection matches sequential output and applies shared patches once')
