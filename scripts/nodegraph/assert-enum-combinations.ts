import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

import { irToGia } from '../../src/compiler/ir_to_gia_transform/index.js'
import {
  ENUM_VALUE_MAPPINGS,
  parseEnumValue
} from '../../src/compiler/ir_to_gia_transform/mappings.js'
import * as ClientEnums from '../../src/definitions/client_enums.js'
import * as ServerEnums from '../../src/definitions/enum.js'
import type {
  ClientIRDocument,
  ClientNode,
  ConnectionArgument,
  ServerIRDocument,
  ServerNode
} from '../../src/runtime/IR.js'
import { enumeration } from '../../src/runtime/value.js'
import {
  CLIENT_ENUM_VALUES,
  ENUM_MATCH_CLASS_KEYS_BY_GENERIC_ID,
  ENUM_MATCH_ROWS_BY_GENERIC_ID
} from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_enum_values.js'
import {
  ENUM_ID,
  ENUM_VALUE
} from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/enum_id.js'
import { NODE_PIN_RECORDS } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_pin_records.js'
import { decode_gia_file } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/decode.js'
import type {
  GraphNode,
  NodePin
} from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto.js'

const PROTO_PATH =
  'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/gia.proto'

type PublicEnumValue = {
  classKey: string
  className: string
  expression: string
  raw: string
  numeric: number
  enumId?: number
}

type ExpectedNode = {
  concreteId: number
  ioc: number
  left?: number
  right?: number
}

function camelToSnake(value: string) {
  return value.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`).replace(/^_/, '')
}

function collectPublicEnumValues(): PublicEnumValue[] {
  const result: PublicEnumValue[] = []
  const seen = new Set<string>()
  const modules = [
    { alias: 'ServerEnums', exports: ServerEnums as Record<string, unknown> },
    { alias: 'ClientEnums', exports: ClientEnums as Record<string, unknown> }
  ]

  for (const module of modules) {
    for (const [exportName, exported] of Object.entries(module.exports)) {
      if (typeof exported !== 'function') continue
      for (const [memberName, candidate] of Object.entries(exported)) {
        if (!(candidate instanceof enumeration)) continue
        const literal = candidate.toIRLiteral()
        if (!literal || literal.type !== 'enum') continue
        const className = candidate.getClassName()
        const raw = literal.value
        const key = `${className}\0${raw}`
        if (seen.has(key)) continue
        seen.add(key)

        let enumId: number | undefined
        let numeric = CLIENT_ENUM_VALUES[raw]
        try {
          const parsed = parseEnumValue(raw, 0, 'enum_exhaustive_verifier')
          enumId = parsed.enumId
          numeric ??= parsed.enumValue
        } catch {
          // Client-only enum values are intentionally absent from the server enum table.
        }
        assert.notEqual(numeric, undefined, `missing numeric enum value for ${className}.${raw}`)
        result.push({
          classKey: camelToSnake(className),
          className,
          expression: `${module.alias}.${exportName}.${memberName}`,
          raw,
          numeric,
          enumId
        })
      }
    }
  }
  return result
}

function inputPin(node: GraphNode, index: number): NodePin {
  const pin = (node.pins ?? []).find(
    (candidate) => Number(candidate.i1.kind) === 3 && Number(candidate.i1.index) === index
  )
  assert.ok(pin, `node ${node.nodeIndex} missing input pin ${index}`)
  return pin
}

function assertEncodedNodes(bytes: Uint8Array, expected: Map<number, ExpectedNode>) {
  const decoded = decode_gia_file(bytes.slice(20, -4), PROTO_PATH)
  const nodes = decoded.graph.graph?.inner.graph?.nodes ?? []
  for (const node of nodes) {
    const exp = expected.get(Number(node.nodeIndex))
    if (!exp) continue
    assert.equal(
      Number(node.concreteId?.nodeId),
      exp.concreteId,
      `node ${node.nodeIndex} concrete id`
    )
    for (const [index, value] of [exp.left, exp.right].entries()) {
      const wrapped = inputPin(node, index).value?.bConcreteValue
      assert.equal(wrapped?.indexOfConcrete, exp.ioc, `node ${node.nodeIndex} pin ${index} ioc`)
      if (value !== undefined) {
        assert.equal(wrapped?.value?.bEnum?.val, value, `node ${node.nodeIndex} pin ${index} value`)
      }
    }
    expected.delete(Number(node.nodeIndex))
  }
  assert.equal(expected.size, 0, `encoded graph is missing ${expected.size} expected nodes`)
}

function enumConnection(sourceId: number, classKey: string, sourceIndex = 0): ConnectionArgument {
  return {
    type: 'conn',
    value: {
      node_id: sourceId,
      index: sourceIndex,
      type: 'enum',
      enum: classKey
    }
  }
}

const publicValues = collectPublicEnumValues()
const typeScriptCalls = {
  server: [] as string[],
  clientCharacter: [] as string[],
  clientStatus: [] as string[]
}

function serverEqualityClassNames(): Set<string> {
  const fileName = 'src/definitions/nodes.ts'
  const source = ts.createSourceFile(
    fileName,
    fs.readFileSync(fileName, 'utf8'),
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS
  )
  const overloadTypes = new Set<string>()
  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node) && node.name?.text === 'ServerExecutionFlowFunctions') {
      for (const member of node.members) {
        if (
          !ts.isMethodDeclaration(member) ||
          member.body ||
          !ts.isIdentifier(member.name) ||
          member.name.text !== 'enumerationsEqual'
        ) {
          continue
        }
        const left = member.parameters[0]?.type
        const right = member.parameters[1]?.type
        if (!left || !right || left.getText(source) !== right.getText(source)) continue
        overloadTypes.add(left.getText(source))
      }
      return
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(source, visit)

  const classNames = new Set<string>()
  for (const typeName of overloadTypes) {
    const exported = (ServerEnums as Record<string, unknown>)[typeName]
    if (typeof exported !== 'function') {
      throw new Error(`missing server enum export ${typeName}`)
    }
    for (const candidate of Object.values(exported)) {
      if (candidate instanceof enumeration) classNames.add(candidate.getClassName())
    }
  }
  assert.equal(overloadTypes.size, 42, 'unexpected server equality overload count')
  return classNames
}

function verifyServer() {
  const record = NODE_PIN_RECORDS.find((candidate) => candidate.id === 475)
  assert.ok(record && 'reflectMap' in record && record.reflectMap)
  const concreteByEnumId = new Map<number, number>()
  for (const [concreteId, reflectType] of record.reflectMap) {
    const match = /^S<T:E<(\d+)>>$/.exec(reflectType)
    assert.ok(match, `invalid server equality reflect type ${reflectType}`)
    concreteByEnumId.set(Number(match[1]), concreteId)
  }

  const valuesByEnumId = new Map<number, PublicEnumValue[]>()
  const supportedClassNames = serverEqualityClassNames()
  for (const value of publicValues) {
    if (!supportedClassNames.has(value.className)) continue
    if (value.enumId === undefined || !concreteByEnumId.has(value.enumId)) continue
    const values = valuesByEnumId.get(value.enumId) ?? []
    if (!values.some((candidate) => candidate.raw === value.raw)) values.push(value)
    valuesByEnumId.set(value.enumId, values)
  }
  assert.deepEqual(
    [...valuesByEnumId.keys()].sort((a, b) => a - b),
    [...concreteByEnumId.keys()].sort((a, b) => a - b),
    'server public enum families do not match equality reflect map'
  )

  const enumIdByLowerKey = new Map(
    Object.entries(ENUM_ID).map(([key, id]) => [key.toLowerCase(), id])
  )
  const officialValuesByEnumId = new Map<number, Set<number>>()
  for (const [key, value] of Object.entries(ENUM_VALUE)) {
    if (key === 'Default' || key === 'True') continue
    const prefix = key.split('_')[0]
    const enumIdKey = prefix.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
    const enumId =
      enumIdByLowerKey.get(enumIdKey) ??
      [...enumIdByLowerKey].find(
        ([candidate]) => candidate.replace(/_/g, '') === enumIdKey.replace(/_/g, '')
      )?.[1]
    assert.notEqual(enumId, undefined, `official enum value ${key} has no enum id`)
    if (!concreteByEnumId.has(enumId!)) continue
    const values = officialValuesByEnumId.get(enumId!) ?? new Set<number>()
    values.add(value)
    officialValuesByEnumId.set(enumId!, values)
  }
  for (const [enumId, values] of valuesByEnumId) {
    const publicNumbers = [...new Set(values.map((value) => value.numeric))].sort((a, b) => a - b)
    const officialNumbers = [...(officialValuesByEnumId.get(enumId) ?? [])].sort((a, b) => a - b)
    assert.deepEqual(
      publicNumbers,
      officialNumbers,
      `server enum id ${enumId} public values differ from the official table`
    )
  }

  const nodes: ServerNode[] = []
  const expected = new Map<number, ExpectedNode>()
  let nextId = 1
  let literalPairs = 0
  let mixedCases = 0

  for (const [enumId, values] of [...valuesByEnumId].sort(([a], [b]) => a - b)) {
    const concreteId = concreteByEnumId.get(enumId)!
    for (const left of values) {
      for (const right of values) {
        const id = nextId++
        nodes.push({
          id,
          type: 'enumerations_equal',
          args: [
            { type: 'enum', value: left.raw },
            { type: 'enum', value: right.raw }
          ]
        })
        expected.set(id, {
          concreteId,
          ioc: enumId,
          left: left.numeric,
          right: right.numeric
        })
        typeScriptCalls.server.push(
          `server.enumerationsEqual(${left.expression}, ${right.expression})`
        )
        literalPairs++
      }
    }

    const sourceId = nextId++
    nodes.push({
      id: sourceId,
      type: 'when_character_movement_spd_meets_condition'
    })
    const classKey = camelToSnake(values[0].className)
    for (const value of values) {
      for (const connectionOnLeft of [true, false]) {
        const id = nextId++
        nodes.push({
          id,
          type: 'enumerations_equal',
          args: connectionOnLeft
            ? [enumConnection(sourceId, classKey, 3), { type: 'enum', value: value.raw }]
            : [{ type: 'enum', value: value.raw }, enumConnection(sourceId, classKey, 3)]
        })
        expected.set(id, {
          concreteId,
          ioc: enumId,
          left: connectionOnLeft ? 0 : value.numeric,
          right: connectionOnLeft ? value.numeric : 0
        })
        mixedCases++
      }
    }
    const id = nextId++
    nodes.push({
      id,
      type: 'enumerations_equal',
      args: [enumConnection(sourceId, classKey, 3), enumConnection(sourceId, classKey, 3)]
    })
    expected.set(id, { concreteId, ioc: enumId, left: 0, right: 0 })
    mixedCases++
  }

  const document: ServerIRDocument = {
    ir_version: 1,
    ir_type: 'node_graph',
    graph: {
      type: 'server',
      sub_type: 'entity',
      mode: 'beyond',
      id: 1073741824,
      name: '_GSTS_EnumExhaustiveServer'
    },
    nodes
  }
  assertEncodedNodes(irToGia(document, { protoPath: PROTO_PATH }), expected)
  return {
    families: valuesByEnumId.size,
    values: [...valuesByEnumId.values()].reduce((sum, values) => sum + values.length, 0),
    officialValues: [...officialValuesByEnumId.values()].reduce(
      (sum, values) => sum + values.size,
      0
    ),
    literalPairs,
    mixedCases
  }
}

function valueByClassAndNumber(classKey: string, numeric: number): PublicEnumValue | undefined {
  return publicValues.find(
    (candidate) => candidate.classKey === classKey && candidate.numeric === numeric
  )
}

function verifyClientFamily(genericId: 200005 | 200178) {
  const subType = genericId === 200005 ? 'character_skill' : 'creation_status'
  const allowedClasses = ENUM_MATCH_CLASS_KEYS_BY_GENERIC_ID[genericId]
  const rowsByClass = ENUM_MATCH_ROWS_BY_GENERIC_ID[genericId]
  assert.ok(allowedClasses)
  assert.ok(rowsByClass)
  const nodes: ClientNode[] = []
  const expected = new Map<number, ExpectedNode>()
  let nextId = 1
  const selfEntitySourceId =
    subType === 'character_skill'
      ? (() => {
          const id = nextId++
          nodes.push({ id, type: 'get_self_entity' })
          return id
        })()
      : undefined
  let literalPairs = 0
  let mixedCases = 0
  let rejectedCrossRowPairs = 0
  let rowsChecked = 0
  let selectableValues = 0
  let officialValues = 0
  const missingValues: string[] = []
  let rejectedPublicValues = 0

  for (const classKey of allowedClasses) {
    const rows = rowsByClass[classKey]
    assert.ok(rows, `missing client rows for ${classKey}`)
    rowsChecked += rows.length
    const valuesByIoc = new Map<number, PublicEnumValue[]>()
    const seenNumbers = new Set<number>()
    for (const row of rows) {
      for (const numeric of row.values) {
        if (seenNumbers.has(numeric)) continue
        seenNumbers.add(numeric)
        const effectiveIoc = rows.find((candidate) => candidate.values.includes(numeric))!.ioc
        const value = valueByClassAndNumber(classKey, numeric)
        if (!value) {
          missingValues.push(`${classKey}=${numeric}`)
          continue
        }
        const values = valuesByIoc.get(effectiveIoc) ?? []
        values.push(value)
        valuesByIoc.set(effectiveIoc, values)
      }
    }
    officialValues += seenNumbers.size
    selectableValues += [...valuesByIoc.values()].reduce((sum, values) => sum + values.length, 0)
    const publicNumbers = [
      ...new Set(
        publicValues
          .filter((candidate) => candidate.classKey === classKey)
          .map((candidate) => candidate.numeric)
      )
    ].sort((a, b) => a - b)
    const officialNumbers = [...seenNumbers].sort((a, b) => a - b)
    const extraPublicNumbers = publicNumbers.filter((numeric) => !seenNumbers.has(numeric))
    for (const numeric of extraPublicNumbers) {
      const value = valueByClassAndNumber(classKey, numeric)
      assert.ok(value)
      const invalidDocument: ClientIRDocument = {
        ir_version: 1,
        ir_type: 'node_graph',
        graph: {
          type: 'client',
          sub_type: subType,
          mode: 'beyond',
          id: genericId === 200005 ? 1082130433 : 1082130434
        },
        nodes: [
          {
            id: 1,
            type: 'enumeration_match',
            args: [
              { type: 'enum', value: value.raw },
              { type: 'enum', value: value.raw }
            ]
          }
        ]
      }
      assert.throws(
        () => irToGia(invalidDocument, { protoPath: PROTO_PATH }),
        /not selectable in this node/
      )
      rejectedPublicValues++
    }
    assert.ok(
      officialNumbers.every((numeric) => publicNumbers.includes(numeric)),
      `client ${genericId} enum class ${classKey} misses an official value`
    )

    for (const [ioc, values] of valuesByIoc) {
      for (const left of values) {
        for (const right of values) {
          const id = nextId++
          nodes.push({
            id,
            type: 'enumeration_match',
            args: [
              { type: 'enum', value: left.raw },
              { type: 'enum', value: right.raw }
            ]
          })
          expected.set(id, {
            concreteId: 10,
            ioc,
            left: left.numeric,
            right: right.numeric
          })
          const calls =
            genericId === 200005 ? typeScriptCalls.clientCharacter : typeScriptCalls.clientStatus
          const target = genericId === 200005 ? 'clientCharacter' : 'clientStatus'
          calls.push(`${target}.enumerationMatch(${left.expression}, ${right.expression})`)
          literalPairs++
        }
      }
    }

    const sourceId = nextId++
    nodes.push(
      subType === 'character_skill'
        ? {
            id: sourceId,
            type: 'get_entity_s_type',
            args: [
              {
                type: 'conn',
                value: {
                  node_id: selfEntitySourceId!,
                  index: 0,
                  type: 'entity'
                }
              }
            ]
          }
        : {
            id: sourceId,
            type: 'get_entity_s_type',
            args: [{ type: 'enum', value: 'target_entity_self' }]
          }
    )
    for (const [ioc, values] of valuesByIoc) {
      for (const value of values) {
        for (const connectionOnLeft of [true, false]) {
          const id = nextId++
          nodes.push({
            id,
            type: 'enumeration_match',
            args: connectionOnLeft
              ? [enumConnection(sourceId, classKey), { type: 'enum', value: value.raw }]
              : [{ type: 'enum', value: value.raw }, enumConnection(sourceId, classKey)]
          })
          expected.set(id, {
            concreteId: 10,
            ioc,
            left: connectionOnLeft ? undefined : value.numeric,
            right: connectionOnLeft ? value.numeric : undefined
          })
          mixedCases++
        }
      }
    }
    const id = nextId++
    nodes.push({
      id,
      type: 'enumeration_match',
      args: [enumConnection(sourceId, classKey), enumConnection(sourceId, classKey)]
    })
    expected.set(id, {
      concreteId: 10,
      ioc: rows[0].ioc,
      left: undefined,
      right: undefined
    })
    mixedCases++

    const groups = [...valuesByIoc.values()]
    for (let leftGroup = 0; leftGroup < groups.length; leftGroup++) {
      for (let rightGroup = 0; rightGroup < groups.length; rightGroup++) {
        if (leftGroup === rightGroup) continue
        for (const left of groups[leftGroup]) {
          for (const right of groups[rightGroup]) {
            const invalidDocument: ClientIRDocument = {
              ir_version: 1,
              ir_type: 'node_graph',
              graph: {
                type: 'client',
                sub_type: subType,
                mode: 'beyond',
                id: genericId === 200005 ? 1082130433 : 1082130434
              },
              nodes: [
                {
                  id: 1,
                  type: 'enumeration_match',
                  args: [
                    { type: 'enum', value: left.raw },
                    { type: 'enum', value: right.raw }
                  ]
                }
              ]
            }
            assert.throws(
              () => irToGia(invalidDocument, { protoPath: PROTO_PATH }),
              /different editor dropdown rows/
            )
            rejectedCrossRowPairs++
          }
        }
      }
    }
  }

  assert.deepEqual(missingValues, [], `client ${genericId} has missing official enum values`)
  assert.equal(rowsChecked, 43, `client ${genericId} enum dropdown row count`)

  const document: ClientIRDocument = {
    ir_version: 1,
    ir_type: 'node_graph',
    graph: {
      type: 'client',
      sub_type: subType,
      mode: 'beyond',
      id: genericId === 200005 ? 1082130433 : 1082130434,
      name: `_GSTS_EnumExhaustive${genericId}`
    },
    nodes
  }
  const bytes = irToGia(document, { protoPath: PROTO_PATH })
  const decoded = decode_gia_file(bytes.slice(20, -4), PROTO_PATH)
  const graphNodes = decoded.graph.graph?.inner.graph?.nodes ?? []
  for (const node of graphNodes) {
    const exp = expected.get(Number(node.nodeIndex))
    if (!exp) continue
    assert.equal(Number(node.genericId?.nodeId), genericId, `node ${node.nodeIndex} generic id`)
  }
  assertEncodedNodes(bytes, expected)
  return {
    genericId,
    families: allowedClasses.length,
    rows: rowsChecked,
    values: selectableValues,
    officialValues,
    missingValues,
    literalPairs,
    mixedCases,
    rejectedCrossRowPairs,
    rejectedPublicValues
  }
}

function verifyTypeScriptCombinations() {
  const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json')
  assert.ok(configPath, 'tsconfig.json not found')
  const config = ts.readConfigFile(configPath, ts.sys.readFile)
  if (config.error) {
    assert.fail(
      ts.formatDiagnosticsWithColorAndContext([config.error], {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => process.cwd(),
        getNewLine: () => '\n'
      })
    )
  }
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath))
  const virtualFile = path.resolve('scripts/nodegraph/.enum-combinations.typecheck.ts')
  const sourceText = [
    "import * as ClientEnums from '../../src/definitions/client_enums.js'",
    "import * as ServerEnums from '../../src/definitions/enum.js'",
    "import type { ClientCharacterSkillExecutionFlowFunctions, ClientCreationStatusExecutionFlowFunctions } from '../../src/definitions/client_nodes.js'",
    "import type { ServerExecutionFlowFunctions } from '../../src/definitions/nodes.js'",
    'declare const server: ServerExecutionFlowFunctions',
    'declare const clientCharacter: ClientCharacterSkillExecutionFlowFunctions',
    'declare const clientStatus: ClientCreationStatusExecutionFlowFunctions',
    ...typeScriptCalls.server,
    ...typeScriptCalls.clientCharacter,
    ...typeScriptCalls.clientStatus
  ].join('\n')
  const host = ts.createCompilerHost(parsed.options)
  const originalFileExists = host.fileExists.bind(host)
  const originalReadFile = host.readFile.bind(host)
  const originalGetSourceFile = host.getSourceFile.bind(host)
  const normalizedVirtualFile = virtualFile.toLowerCase()
  const isVirtualFile = (fileName: string) =>
    path.resolve(fileName).toLowerCase() === normalizedVirtualFile
  host.fileExists = (fileName) => isVirtualFile(fileName) || originalFileExists(fileName)
  host.readFile = (fileName) => (isVirtualFile(fileName) ? sourceText : originalReadFile(fileName))
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) =>
    isVirtualFile(fileName)
      ? ts.createSourceFile(fileName, sourceText, languageVersion, true, ts.ScriptKind.TS)
      : originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile)

  const program = ts.createProgram({
    rootNames: [virtualFile],
    options: { ...parsed.options, composite: false, incremental: false, noEmit: true },
    host
  })
  const diagnostics = ts.getPreEmitDiagnostics(program)
  if (diagnostics.length > 0) {
    assert.fail(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => process.cwd(),
        getNewLine: () => '\n'
      })
    )
  }

  return {
    serverPairs: typeScriptCalls.server.length,
    clientCharacterPairs: typeScriptCalls.clientCharacter.length,
    clientStatusPairs: typeScriptCalls.clientStatus.length
  }
}

const server = verifyServer()
const clientCharacter = verifyClientFamily(200005)
const clientStatus = verifyClientFamily(200178)
const typeScript = verifyTypeScriptCombinations()

console.log(JSON.stringify({ server, clientCharacter, clientStatus, typeScript }, null, 2))
