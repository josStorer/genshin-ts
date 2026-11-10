import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { buildServerGraphRegistriesIRDocuments } from 'genshin-ts/runtime/core'
import { setRuntimeOptions } from 'genshin-ts/runtime/runtime_config'

import { irToGia } from '../src/compiler/ir_to_gia_transform/index.js'
import { compileTsToGs } from '../src/compiler/ts_to_gs_pipeline.js'
import type { Argument, IRDocument, ServerNode } from '../src/runtime/IR.js'

const optimize = process.argv.includes('--optimize')
setRuntimeOptions({ optimize: { precompileExpression: optimize, removeUnusedNodes: optimize } })
const root = process.cwd()
const result = await compileTsToGs({
  cfgDir: root,
  cfg: {
    compileRoot: '.',
    entries: ['./tests/list_iteration_semantics_test.ts'],
    outDir: path.join(root, 'dist/list-iteration-semantics'),
    options: { optimize: { precompileExpression: optimize, removeUnusedNodes: optimize } }
  }
})
const output = result.outFiles.find((file) => file.endsWith('list_iteration_semantics_test.gs.ts'))
assert.ok(output)
const generated = fs.readFileSync(output, 'utf8')
assert.match(generated, /initLocalVariable\("entity_list", f\.getEntityListByUnitTag/)
console.log('[ok] inline list query is saved before iteration')
await import(pathToFileURL(output).href)
const documents = buildServerGraphRegistriesIRDocuments()

// Execute the emitted IR, deliberately reevaluating data connections on every read, as in #22.
// This models the nodes used by this fixture; it is not a substitute for an in-game test.
function execute(document: IRDocument) {
  assert.equal(document.graph.type, 'server')
  const nodes = new Map(document.nodes?.map((node) => [node.id, node]))
  const locals = new Map<number, unknown>()
  const iterations = new Map<number, unknown>()
  const variables = new Map<string, unknown>(
    document.variables?.map((variable) => [
      variable.name,
      globalThis.structuredClone(variable.value)
    ])
  )
  const entities = new Set([2, 3, 4, 5, 6])
  const destroyed: number[] = []
  const printed: string[] = []
  let queryCount = 0

  function getNode(id: number): ServerNode {
    const node = nodes.get(id)
    assert.ok(node, `missing node ${id}`)
    return node
  }

  function read(arg: Argument | undefined): unknown {
    assert.ok(arg, 'missing argument')
    if (arg.type !== 'conn') return globalThis.structuredClone(arg.value)
    const node = getNode(arg.value.node_id)
    const args = node.args ?? []
    switch (node.type) {
      case 'get_local_variable':
        if (arg.value.index === 0) return node.id
        if (!locals.has(node.id)) locals.set(node.id, read(args[0]))
        return locals.get(node.id)
      case 'get_node_graph_variable':
        return variables.get(String(read(args[0])))
      case 'finite_loop':
      case 'list_iteration_loop':
        assert.ok(iterations.has(node.id), 'iteration value read outside its loop')
        return iterations.get(node.id)
      case 'get_entity_list_by_unit_tag':
        queryCount++
        return [...entities]
      case 'assembly_list':
        return args.map(read)
      case 'get_list_length': {
        const list = read(args[0])
        assert.ok(Array.isArray(list))
        return list.length
      }
      case 'get_corresponding_value_from_list': {
        const list = read(args[0])
        assert.ok(Array.isArray(list))
        return list[Number(read(args[1]))]
      }
      case 'list_includes_this_value': {
        const list = read(args[0])
        assert.ok(Array.isArray(list))
        return list.includes(read(args[1]))
      }
      case 'subtraction':
        return Number(read(args[0])) - Number(read(args[1]))
      case 'addition':
        return Number(read(args[0])) + Number(read(args[1]))
      case 'equal':
        return read(args[0]) === read(args[1])
      case 'data_type_conversion_str':
        return String(read(args[0]))
      default:
        throw new Error(`unsupported data node ${node.type}`)
    }
  }

  function next(node: ServerNode, branch = 0): number | undefined {
    for (const edge of node.next ?? []) {
      if (typeof edge === 'number') {
        if (branch === 0) return edge
      } else if ((edge.source_index ?? 0) === branch) {
        return edge.node_id
      }
    }
    return undefined
  }

  function run(start: number | undefined): number | undefined {
    let id = start
    while (id !== undefined) {
      const node = getNode(id)
      const args = node.args ?? []
      switch (node.type) {
        case 'when_entity_is_created':
          break
        case 'set_local_variable': {
          const local = Number(read(args[0]))
          // Local-variable list assignment saves the list contents, not the producer connection.
          locals.set(local, globalThis.structuredClone(read(args[1])))
          break
        }
        case 'finite_loop': {
          for (let index = Number(read(args[0])); index <= Number(read(args[1])); index++) {
            iterations.set(node.id, index)
            const brokenLoop = run(next(node))
            if (brokenLoop !== undefined) {
              if (brokenLoop !== node.id) return brokenLoop
              break
            }
          }
          iterations.delete(node.id)
          id = next(node, 1)
          continue
        }
        case 'list_iteration_loop': {
          for (let index = 0; ; index++) {
            const list = read(args[0])
            assert.ok(Array.isArray(list))
            if (index >= list.length) break
            iterations.set(node.id, list[index])
            const brokenLoop = run(next(node))
            if (brokenLoop !== undefined) {
              if (brokenLoop !== node.id) return brokenLoop
              break
            }
          }
          iterations.delete(node.id)
          id = next(node, 1)
          continue
        }
        case 'double_branch':
          id = next(node, read(args[0]) ? 0 : 1)
          continue
        case 'break_loop':
          return next(node)
        case 'destroy_entity': {
          const target = Number(read(args[0]))
          assert.ok(entities.delete(target), `entity ${target} destroyed twice`)
          destroyed.push(target)
          break
        }
        case 'modify_value_in_list': {
          const list = read(args[0])
          assert.ok(Array.isArray(list))
          list[Number(read(args[1]))] = read(args[2])
          break
        }
        case 'insert_value_into_list': {
          const list = read(args[0])
          assert.ok(Array.isArray(list))
          list.splice(Number(read(args[1])), 0, read(args[2]))
          break
        }
        case 'print_string':
          printed.push(String(read(args[0])))
          break
        default:
          throw new Error(`unsupported exec node ${node.type}`)
      }
      id = next(node)
    }
    return undefined
  }

  const event = document.nodes?.find((node) => node.type === 'when_entity_is_created')
  assert.ok(event)
  assert.equal(run(event.id), undefined)
  assert.equal(iterations.size, 0)
  return { destroyed, printed, queryCount, variables }
}

function graph(id: number) {
  const document = documents.find((item) => item.graph.id === id)
  assert.ok(document, `missing graph ${id}`)
  return document
}

for (const id of [
  1073741910, 1073741911, 1073741912, 1073741919, 1073742423, 1073742409, 1073742416
]) {
  const document = graph(id)
  const actual = execute(document)
  assert.deepEqual(
    actual.destroyed,
    [2, 3, 4, 5, 6],
    `${id}: query iteration must not skip entities`
  )
  assert.equal(actual.queryCount, 1, `${id}: query must run once`)
  assert.equal(document.nodes?.filter((node) => node.type === 'set_local_variable').length, 1)
}

const printCases: [number, string[]][] = [
  ...[1073742404, 1073742405, 1073742406, 1073742407, 1073742408].map((id): [number, string[]] => [
    id,
    ['1', '9', '3']
  ]),
  [1073742418, ['1', '2']],
  [1073742431, ['1', '2']],
  [1073742432, ['1', '2', '3']],
  [1073742433, ['1', '2']],
  [1073742413, ['9']],
  [1073742414, ['9', '9', '2', '3']],
  [1073742415, ['9', '8']],
  [1073742410, ['1', '2', '3']],
  [1073742411, ['2']],
  [1073741913, ['1', '2']],
  [1073741914, ['1', '9', '3']],
  [1073741915, ['1', '9', '3']],
  [1073741916, ['1', '9', '3']],
  [1073741917, ['1', '2', '11', '12']],
  [1073741918, ['1', '3', 'done']],
  [1073742424, ['1', '9', '3']],
  [1073741924, ['1', '2']],
  [1073741925, ['1', '2']]
]
for (const [id, expected] of printCases) {
  assert.deepEqual(execute(graph(id)).printed, expected, `${id}: unexpected iteration values`)
}
for (const id of [
  1073741914, 1073742424, 1073742404, 1073742405, 1073742413, 1073742414, 1073742415, 1073742431,
  1073742432
]) {
  assert.equal(
    graph(id).nodes?.filter((node) => node.type === 'set_local_variable').length,
    1,
    `${id}: reuse existing storage instead of copying the iteration input`
  )
}
assert.equal(
  graph(1073741915).nodes?.some((node) => node.type === 'set_local_variable'),
  false
)
assert.deepEqual(execute(graph(1073741915)).variables.get('items'), [1, 9, 3])
assert.deepEqual(execute(graph(1073741916)).variables.get('items'), [1, 9, 3])

for (const id of [1073741916, 1073742406, 1073742407, 1073742408, 1073742410]) {
  assert.equal(
    graph(id).nodes?.some((node) => node.type === 'set_local_variable'),
    false
  )
}
for (const id of [1073742417, 1073742419]) {
  const actual = execute(graph(id))
  assert.deepEqual(actual.destroyed, [2])
  assert.deepEqual(actual.printed, ['5'])
  assert.equal(actual.queryCount, 1)
}
const native = execute(graph(1073742425))
assert.deepEqual(native.destroyed, [2, 4, 6], 'native node API should still reproduce issue #22')
assert.ok(native.queryCount > 1)
const mapped = execute(graph(1073741923))
assert.deepEqual(mapped.destroyed, [2, 3, 4, 5, 6])
assert.equal(mapped.queryCount, 1)
const protoPath = path.join(
  root,
  'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto'
)
for (const document of documents) {
  assert.ok(irToGia(document, { protoPath }).length > 0, `${document.graph.id}: empty GIA`)
}
console.log('[ok] emitted IR: queries run once, declaration timing and aliases are preserved')
console.log(
  '[ok] emitted IR: live references, nested loops, empty lists, break/continue and native API'
)
console.log('[ok] all list iteration regression graphs serialize to GIA')

const structs = await compileTsToGs({
  cfgDir: root,
  cfg: {
    compileRoot: '.',
    entries: ['./tests/manual/graph-features/struct-list-iteration.ts'],
    outDir: path.join(root, 'dist/struct-list-iteration')
  }
})
const structOutput = structs.entryOutFiles[0]
assert.ok(structOutput)
assert.doesNotMatch(fs.readFileSync(structOutput, 'utf8'), /initLocalVariable/)
assert.match(fs.readFileSync(structOutput, 'utf8'), /listIterationLoop\(xs,/)
console.log('[ok] inline, parameter and named struct lists keep direct iteration')

const captured = await compileTsToGs({
  cfgDir: root,
  cfg: {
    compileRoot: '.',
    entries: ['./tests/manual/graph-features/list-timer-capture.ts'],
    outDir: path.join(root, 'dist/list-timer-capture')
  }
})
const captureOutput = captured.entryOutFiles[0]
assert.ok(captureOutput)
assert.doesNotMatch(
  fs.readFileSync(captureOutput, 'utf8'),
  /initLocalVariable\("int_list", values\.value\)/
)
await import(pathToFileURL(captureOutput).href)
const captureGraph = buildServerGraphRegistriesIRDocuments().find(
  (item) => item.graph.id === 1073742412
)
assert.ok(captureGraph)
assert.ok(irToGia(captureGraph, { protoPath }).length > 0)
console.log('[ok] captured list iteration reuses the callback local variable')
