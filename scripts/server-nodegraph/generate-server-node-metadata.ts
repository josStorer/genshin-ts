import fs from 'node:fs'

import { format, resolveConfig } from 'prettier'
import ts from 'typescript'

import {
  getNodeIdLowerMap,
  SPECIAL_NODE_MAPPINGS
} from '../../src/compiler/ir_to_gia_transform/mappings.js'
import { NODE_PIN_RECORDS } from '../../src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_pin_records.js'

type StaticMetadata = {
  nodes: Array<{
    genericId: number
    pins: Array<{
      kind: string
      index: number
      connectable?: boolean
    }>
  }>
}

type ServerNodeRegistration = {
  methodName: string
  nodeType: string
  argumentCount: number
}

const STATIC_METADATA_PATH = 'resources/server_node_static_metadata.json'
const SERVER_NODES_PATH = 'src/definitions/nodes.ts'
const OUTPUT_PATH = 'src/definitions/server_node_metadata.ts'

function readStaticMetadata(): StaticMetadata {
  return JSON.parse(fs.readFileSync(STATIC_METADATA_PATH, 'utf8')) as StaticMetadata
}

function propertyName(node: ts.PropertyName): string | undefined {
  return ts.isIdentifier(node) || ts.isStringLiteral(node) ? node.text : undefined
}

function extractServerNodeRegistrations(): ServerNodeRegistration[] {
  const source = ts.createSourceFile(
    SERVER_NODES_PATH,
    fs.readFileSync(SERVER_NODES_PATH, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  )
  const serverClass = source.statements.find(
    (statement): statement is ts.ClassDeclaration =>
      ts.isClassDeclaration(statement) && statement.name?.text === 'ServerExecutionFlowFunctions'
  )
  if (!serverClass) throw new Error('[error] ServerExecutionFlowFunctions not found')

  const registrations: ServerNodeRegistration[] = []
  for (const member of serverClass.members) {
    if (!ts.isMethodDeclaration(member) || !member.body) continue
    const methodName = propertyName(member.name)
    if (!methodName || methodName.startsWith('__')) continue

    const visit = (node: ts.Node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === 'registerNode'
      ) {
        const object = node.arguments[0]
        if (object && ts.isObjectLiteralExpression(object)) {
          const nodeTypeProperty = object.properties.find(
            (property): property is ts.PropertyAssignment =>
              ts.isPropertyAssignment(property) && propertyName(property.name) === 'nodeType'
          )
          const argsProperty = object.properties.find(
            (property): property is ts.PropertyAssignment =>
              ts.isPropertyAssignment(property) && propertyName(property.name) === 'args'
          )
          if (
            nodeTypeProperty &&
            ts.isStringLiteral(nodeTypeProperty.initializer) &&
            argsProperty &&
            ts.isArrayLiteralExpression(argsProperty.initializer)
          ) {
            registrations.push({
              methodName,
              nodeType: nodeTypeProperty.initializer.text,
              argumentCount: argsProperty.initializer.elements.length
            })
          }
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(member.body)
  }
  return registrations
}

function resolveGenericId(nodeType: string): number | undefined {
  const vendorKey = SPECIAL_NODE_MAPPINGS[nodeType] ?? nodeType
  const nodeIds = getNodeIdLowerMap()
  return nodeIds.get(vendorKey) ?? nodeIds.get(`${vendorKey}__generic`)
}

function publicInputPinIndexes(genericId: number, argumentCount: number): number[] {
  const record = NODE_PIN_RECORDS.find((candidate) => candidate.id === genericId)
  if (!record) throw new Error(`[error] missing NODE_PIN_RECORDS entry for node ${genericId}`)

  if (record.inputs.length === argumentCount) {
    return record.inputs.map((_, index) => index)
  }

  const visibleIndexes = record.inputs.flatMap((type, index) => (type === 'Unk' ? [] : [index]))
  if (visibleIndexes.length === argumentCount) return visibleIndexes

  throw new Error(
    `[error] node ${genericId} exposes ${argumentCount} IR arguments, but vendor inputs are ` +
      `[${record.inputs.join(', ')}]`
  )
}

function addIndexes(target: Map<string, Set<number>>, key: string, indexes: number[]): void {
  if (!indexes.length) return
  const current = target.get(key) ?? new Set<number>()
  for (const index of indexes) current.add(index)
  target.set(key, current)
}

function sortedIndexRecord(source: Map<string, Set<number>>): Record<string, number[]> {
  return Object.fromEntries(
    [...source.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, indexes]) => [key, [...indexes].sort((left, right) => left - right)])
  )
}

async function generateSource(): Promise<string> {
  const staticMetadata = readStaticMetadata()
  const registrations = extractServerNodeRegistrations()
  const registrationsByGenericId = new Map<number, ServerNodeRegistration[]>()
  for (const registration of registrations) {
    const genericId = resolveGenericId(registration.nodeType)
    if (genericId === undefined) continue
    const current = registrationsByGenericId.get(genericId) ?? []
    current.push(registration)
    registrationsByGenericId.set(genericId, current)
  }

  const byMethod = new Map<string, Set<number>>()
  const byNodeType = new Map<string, Set<number>>()
  // The signal selector is a client_exec literal rather than a data input.
  addIndexes(byMethod, 'sendClientScriptedServerSignal', [1])
  addIndexes(byNodeType, 'send_client_scripted_server_signal', [1])
  for (const node of staticMetadata.nodes) {
    const literalInputIndexes = node.pins
      .filter((pin) => pin.kind === 'input' && pin.connectable === false)
      .map((pin) => pin.index)
      .sort((left, right) => left - right)
    if (!literalInputIndexes.length) continue

    const nodeRegistrations = registrationsByGenericId.get(node.genericId)
    if (!nodeRegistrations?.length) {
      throw new Error(
        `[error] static node ${node.genericId} has literal-only inputs but no server method registration`
      )
    }

    for (const registration of nodeRegistrations) {
      const argumentPins = publicInputPinIndexes(node.genericId, registration.argumentCount)
      const literalArgumentIndexes = literalInputIndexes.flatMap((pinIndex) => {
        const argumentIndex = argumentPins.indexOf(pinIndex)
        return argumentIndex === -1 ? [] : [argumentIndex]
      })
      addIndexes(byMethod, registration.methodName, literalArgumentIndexes)
      addIndexes(byNodeType, registration.nodeType, literalArgumentIndexes)
    }
  }

  const methodRecord = sortedIndexRecord(byMethod)
  const nodeTypeRecord = sortedIndexRecord(byNodeType)

  const raw = `// This file is generated by scripts/server-nodegraph/generate-server-node-metadata.ts.
// Sources: resources/server_node_static_metadata.json, src/definitions/nodes.ts, and vendor pin records.

/** Public server method arguments whose editor input pins cannot be connected. */
export const SERVER_LITERAL_ARGUMENT_INDEXES_BY_METHOD = ${JSON.stringify(methodRecord, null, 2)} as const

/** IR argument indexes keyed by server node type; consumed before physical pin remapping. */
export const SERVER_LITERAL_ARGUMENT_INDEXES_BY_NODE_TYPE = ${JSON.stringify(nodeTypeRecord, null, 2)} as const
`
  const prettierConfig = (await resolveConfig(OUTPUT_PATH)) ?? {}
  return format(raw, { ...prettierConfig, filepath: OUTPUT_PATH })
}

async function main(): Promise<void> {
  const generated = await generateSource()
  if (process.argv.includes('--check')) {
    const current = fs.readFileSync(OUTPUT_PATH, 'utf8')
    if (current !== generated) {
      throw new Error(
        `[error] ${OUTPUT_PATH} is stale; run npm run gen:server:metadata and commit the result`
      )
    }
    console.log(`[ok] ${OUTPUT_PATH} matches static server node metadata`)
    return
  }

  fs.writeFileSync(OUTPUT_PATH, generated, 'utf8')
  console.log(`[ok] generated ${OUTPUT_PATH}`)
}

await main()
