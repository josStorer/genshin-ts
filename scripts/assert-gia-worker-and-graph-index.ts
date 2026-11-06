import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  writeGiaFromIrJsonFiles,
  type IrToGiaBatchProfile
} from '../src/compiler/ir_to_gia_pipeline.js'
import {
  Connect,
  Graph,
  Node
} from '../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/gia_gen/graph.js'
import { NODE_ID } from '../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_id.js'

function document(graphId: number) {
  return {
    ir_version: 1,
    ir_type: 'node_graph',
    graph: {
      type: 'server',
      mode: 'beyond',
      sub_type: 'entity',
      id: graphId,
      name: `_GSTS_worker_${graphId}`
    },
    variables: [],
    nodes: [{ id: 1, type: 'when_entity_is_created' }]
  }
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsts-gia-worker-'))
try {
  // Reusing workers must preserve fresh-process file IDs, including multiple docs per file.
  const hook = path.join(tempDir, 'fixed-time.mjs')
  fs.writeFileSync(hook, 'Date.now = () => 1785715200000; Math.random = () => 0.3141592653589793\n')
  const previousNodeOptions = process.env.NODE_OPTIONS
  process.env.NODE_OPTIONS = `${previousNodeOptions ?? ''} --import=${pathToFileURL(hook).href}`
  try {
    const clientTasks = [0, 1, 2].map((i) => {
      const docs = [0, 1, 2].map((j) => ({
        ir_version: 1,
        ir_type: 'node_graph',
        graph: {
          id: 1082130601 + i * 3 + j,
          type: 'client',
          mode: 'beyond',
          sub_type: 'character_skill',
          name: `_GSTS_client_${i}_${j}`
        },
        nodes: [{ id: 1, type: 'node_graph_begins' }]
      }))
      const irPath = path.join(tempDir, `client-${i}.json`)
      fs.writeFileSync(irPath, JSON.stringify(i === 1 ? docs : docs[0]))
      return {
        irPath,
        ...(i === 1 ? { opts: { includeIndices: [0, 2], preserveIndices: true } } : {})
      }
    })
    const expected = new Map<string, Buffer>()
    for (const task of clientTasks) {
      const results = await writeGiaFromIrJsonFiles([task], { maxParallel: 1 })
      for (const result of results) expected.set(result.giaPath, fs.readFileSync(result.giaPath))
    }
    const pooled = await writeGiaFromIrJsonFiles(clientTasks, { maxParallel: 1 })
    assert.equal(pooled.length, 4)
    for (const result of pooled)
      assert.deepEqual(fs.readFileSync(result.giaPath), expected.get(result.giaPath))
  } finally {
    if (previousNodeOptions === undefined) delete process.env.NODE_OPTIONS
    else process.env.NODE_OPTIONS = previousNodeOptions
  }

  const pinNodeA = new Node(1, 'server', NODE_ID.Print_String)
  const pinNodeB = new Node(2, 'server', NODE_ID.Print_String)
  assert.ok(pinNodeA.pins[0].type?.t === 'b')
  pinNodeA.pins[0].type.b = 'Int'
  assert.deepEqual(pinNodeB.pins[0].type, { t: 'b', b: 'Str' })
  assert.deepEqual(new Node(3, 'server', NODE_ID.Print_String).pins[0].type, { t: 'b', b: 'Str' })

  // Nested list element types must be independent too, not only the outer descriptor.
  const listA = new Node(4, 'server', NODE_ID.Get_Local_Variable__List_Int)
  const listB = new Node(5, 'server', NODE_ID.Get_Local_Variable__List_Int)
  const listPin = listA.pins.findIndex((pin) => pin.type?.t === 'l')
  assert.ok(listPin >= 0)
  const listType = listA.pins[listPin].type
  assert.ok(listType?.t === 'l' && listType.i.t === 'b')
  listType.i.b = 'Str'
  assert.deepEqual(listB.pins[listPin].type, { t: 'l', i: { t: 'b', b: 'Int' } })

  const dictA = new Node(6, 'server', NODE_ID.Set_or_Add_Key_Value_Pairs_to_Dictionary__Entity_Int)
  const dictB = new Node(7, 'server', NODE_ID.Set_or_Add_Key_Value_Pairs_to_Dictionary__Entity_Int)
  const dictPin = dictA.pins.findIndex((pin) => pin.type?.t === 'd')
  assert.ok(dictPin >= 0)
  const dictType = dictA.pins[dictPin].type
  const expectedDictType = structuredClone(dictB.pins[dictPin].type)
  assert.ok(dictType?.t === 'd' && dictType.k.t === 'b' && dictType.v.t === 'b')
  dictType.k.b = 'Str'
  dictType.v.b = 'Flt'
  assert.deepEqual(dictB.pins[dictPin].type, expectedDictType)

  const inputs = [1073742501, 1073742502, 1073742503].map((graphId, index) => {
    const irPath = path.join(tempDir, `valid-${index}.json`)
    fs.writeFileSync(irPath, `${JSON.stringify(document(graphId), null, 2)}\n`)
    return { irPath }
  })
  let profile: IrToGiaBatchProfile | undefined
  const outputs = await writeGiaFromIrJsonFiles(inputs, {
    maxParallel: 1,
    profile: true,
    onProfile: (value) => (profile = value)
  })
  assert.equal(outputs.length, inputs.length)
  assert.equal(profile?.stats.workerProcesses, 1)
  assert.equal(profile?.tasks.length, inputs.length)
  const scheduledProfiles = [...(profile?.tasks ?? [])].sort(
    (a, b) => (a.schedule?.startedAtMs ?? 0) - (b.schedule?.startedAtMs ?? 0)
  )
  const protoLoads = scheduledProfiles.map(
    (task) => task.child?.items[0]?.transformProfile?.timingsMs.loadProto ?? 0
  )
  assert.ok(protoLoads[0] > protoLoads[1] + protoLoads[2], JSON.stringify(protoLoads))

  const invalidPath = path.join(tempDir, 'invalid.json')
  fs.writeFileSync(invalidPath, '{'.repeat(10_000))
  const afterErrorPath = path.join(tempDir, 'after-error.json')
  fs.writeFileSync(afterErrorPath, `${JSON.stringify(document(1073742504), null, 2)}\n`)
  await assert.rejects(
    writeGiaFromIrJsonFiles([{ irPath: invalidPath }, { irPath: afterErrorPath }], {
      maxParallel: 1
    }),
    /ir_to_gia failed/
  )
  assert.equal(fs.existsSync(afterErrorPath.replace(/\.json$/i, '.gia')), false)

  // A failed batch must close its workers; a later call can still run normally.
  const retried = await writeGiaFromIrJsonFiles([{ irPath: afterErrorPath }], { maxParallel: 1 })
  assert.equal(retried.length, 1)

  // With two slots, wait for the valid task already running, but do not dispatch the queued one.
  const inFlightPath = path.join(tempDir, 'in-flight.json')
  const largeDocument = {
    ...document(1073742505),
    nodes: Array.from({ length: 10_000 }, (_, index) => ({
      id: index + 1,
      type: 'print_string',
      args: [{ type: 'str', value: 'in-flight' }]
    }))
  }
  const largeJson = JSON.stringify(largeDocument)
  fs.writeFileSync(inFlightPath, largeJson)
  // Scheduling is largest-first. Start the failing task in the first worker
  // slot, so startup/transpilation timing cannot let the valid task drain the
  // queue before the failure worker has even loaded.
  fs.writeFileSync(invalidPath, '{'.repeat(Buffer.byteLength(largeJson) + 1))
  const queuedPath = path.join(tempDir, 'queued.json')
  fs.writeFileSync(queuedPath, JSON.stringify(document(1073742506)))
  await assert.rejects(
    writeGiaFromIrJsonFiles(
      [{ irPath: invalidPath }, { irPath: inFlightPath }, { irPath: queuedPath }],
      { maxParallel: 2 }
    ),
    /ir_to_gia failed/
  )
  assert.ok(fs.existsSync(inFlightPath.replace(/\.json$/i, '.gia')))
  assert.equal(fs.existsSync(queuedPath.replace(/\.json$/i, '.gia')), false)

  const graph = new Graph('server', 1, '_GSTS_connection_test', 1073742599)
  const first = graph.add_node(null, 999_991)
  const second = graph.add_node(null, 999_992)
  const third = graph.add_node(null, 999_993)
  const firstToSecond = graph.connect(first, second, 0, 0)
  const firstToThird = graph.connect(first, third, 0, 0)
  const thirdToSecond = graph.connect(third, second, 1, 1)
  assert.equal(graph.get_connect(first, second, 0, 0), firstToSecond)
  assert.deepEqual(graph.get_connect_from(first), [firstToSecond, firstToThird])
  assert.deepEqual(graph.get_connect_to(second), [firstToSecond, thirdToSecond])
  assert.equal(graph.connect(first, second, 0, 0), firstToSecond)
  assert.equal(graph.get_connects().length, 3)

  const replacement = graph.connect(third, second, 2, 0)
  assert.equal(graph.get_connect(first, second, 0, 0), null)
  assert.equal(graph.get_connect_to_index(second, 0), replacement)
  assert.deepEqual(graph.get_connect_to(second), [thirdToSecond, replacement])

  graph.disconnect(firstToThird)
  assert.equal(graph.get_connect(first, third, 0, 0), null)
  assert.deepEqual(graph.get_connect_from(first), [])
  const direct = new Connect(first, third, 3, 2)
  graph.add_connect(direct)
  graph.add_connect(direct)
  assert.equal(graph.get_connect(first, third, 3, 2), direct)
  assert.equal(graph.get_connects().filter((item) => item === direct).length, 1)
  const duplicateEndpoint = new Connect(first, third, 3, 2)
  graph.add_connect(duplicateEndpoint)
  assert.equal(graph.get_connect(first, third, 3, 2), direct)
  graph.disconnect(direct)
  assert.equal(graph.get_connect(first, third, 3, 2), duplicateEndpoint)

  // Public endpoints remain mutable: all queries must observe their current values.
  const mutableGraph = new Graph('server', 1, '_GSTS_mutable_connections', 1073742600)
  const a = mutableGraph.add_node(null, 999_991)
  const b = mutableGraph.add_node(null, 999_992)
  const c = mutableGraph.add_node(null, 999_993)
  const mutable = mutableGraph.connect(a, b, 0, 0)
  mutable.from = c
  mutable.to = a
  mutable.from_index = 2
  mutable.to_index = 3
  assert.equal(mutableGraph.get_connect(a, b, 0, 0), null)
  assert.equal(mutableGraph.get_connect(c, a, 2, 3), mutable)
  assert.deepEqual(mutableGraph.get_connect_from(a), [])
  assert.deepEqual(mutableGraph.get_connect_from(c), [mutable])
  assert.deepEqual(mutableGraph.get_connect_to(b), [])
  assert.deepEqual(mutableGraph.get_connect_to(a), [mutable])
  assert.equal(mutableGraph.get_connect_from_index(a, 0), null)
  assert.equal(mutableGraph.get_connect_from_index(c, 2), mutable)
  assert.equal(mutableGraph.get_connect_to_index(b, 0), null)
  assert.equal(mutableGraph.get_connect_to_index(a, 3), mutable)

  // Node indices in different graphs can coincide; object identity must still matter.
  const foreignGraph = new Graph('server', 1, '_GSTS_foreign_connections', 1073742601)
  const foreignA = foreignGraph.add_node(null, 999_991)
  foreignGraph.add_node(null, 999_992)
  const foreignC = foreignGraph.add_node(null, 999_993)
  assert.equal(foreignA.NodeIndex, a.NodeIndex)
  assert.equal(foreignC.NodeIndex, c.NodeIndex)
  assert.equal(mutableGraph.get_connect(foreignC, foreignA, 2, 3), null)
  assert.deepEqual(mutableGraph.get_connect_from(foreignC), [])
  assert.deepEqual(mutableGraph.get_connect_to(foreignA), [])
  mutableGraph.disconnect(mutable)
  assert.equal(mutableGraph.get_connect(c, a, 2, 3), null)
  assert.deepEqual(mutableGraph.get_connects(), [])

  console.log(
    '[ok] GIA worker counter isolation, protobuf reuse, Pin isolation and Graph connections'
  )
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true })
}
