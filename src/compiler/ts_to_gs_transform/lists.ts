import ts from 'typescript'

import { fail } from './errors.js'
import type { Env } from './types.js'
import { makeFCall } from './utils.js'

export type ListType =
  | 'int'
  | 'float'
  | 'bool'
  | 'str'
  | 'vec3'
  | 'guid'
  | 'entity'
  | 'prefab_id'
  | 'config_id'
  | 'faction'

export function inferConcreteTypeFromString(s: string): ListType | null {
  const t = s.trim()
  if (t === 'number' || t === 'float' || t === 'FloatValue') return 'float'
  if (t === 'bigint' || t === 'int' || t === 'IntValue') return 'int'
  if (t === 'boolean' || t === 'bool' || t === 'BoolValue') return 'bool'
  if (t === 'string' || t === 'str' || t === 'StrValue') return 'str'
  if (
    t === 'vec3' ||
    t === 'Vec3Value' ||
    /^\[\s*number\s*,\s*number\s*,\s*number\s*\]\s*$/i.test(t) ||
    /^readonly\s*\[\s*number\s*,\s*number\s*,\s*number\s*\]\s*$/i.test(t)
  ) {
    return 'vec3'
  }
  if (t === 'guid' || t === 'GuidValue') return 'guid'
  if (t === 'entity' || t === 'EntityValue' || t === 'PlayerEntity' || t === 'CharacterEntity')
    return 'entity'
  if (t === 'prefabId' || t === 'PrefabIdValue') return 'prefab_id'
  if (t === 'configId' || t === 'ConfigIdValue') return 'config_id'
  if (t === 'faction' || t === 'FactionValue') return 'faction'
  return null
}

export function inferListTypeFromTypeString(s: string): ListType | null {
  const t = s.trim()

  // tuple array: [number, number, number][] / readonly [number, number, number][]
  if (
    /^readonly\s*\[\s*number\s*,\s*number\s*,\s*number\s*\]\s*\[\]\s*$/i.test(t) ||
    /^\[\s*number\s*,\s*number\s*,\s*number\s*\]\s*\[\]\s*$/i.test(t)
  ) {
    return 'vec3'
  }

  // readonly T[] -> treat as T[]
  const readonlyArray = /^readonly\s+(.+)\[\]\s*$/i.exec(t)
  if (readonlyArray) {
    return inferConcreteTypeFromString(readonlyArray[1])
  }

  // T[]
  if (t.endsWith('[]')) {
    return inferConcreteTypeFromString(t.slice(0, -2))
  }

  // Array<T>
  const arrayRef = /^Array<(.+)>$/i.exec(t)
  if (arrayRef) {
    const inner = arrayRef[1].trim()
    if (/^\[\s*number\s*,\s*number\s*,\s*number\s*\]$/i.test(inner)) return 'vec3'
    return inferConcreteTypeFromString(inner)
  }

  // ReadonlyArray<T>
  const roArrayRef = /^ReadonlyArray<(.+)>$/i.exec(t)
  if (roArrayRef) {
    const inner = roArrayRef[1].trim()
    if (/^\[\s*number\s*,\s*number\s*,\s*number\s*\]$/i.test(inner)) return 'vec3'
    return inferConcreteTypeFromString(inner)
  }

  return null
}

export function inferListTypeFromTypeNode(t: ts.TypeNode | undefined): ListType | null {
  if (!t) return null
  if (ts.isParenthesizedTypeNode(t)) return inferListTypeFromTypeNode(t.type)
  if (ts.isArrayTypeNode(t)) return inferListTypeFromTypeNode(t.elementType)

  // [number, number, number] -> vec3
  if (ts.isTupleTypeNode(t) && t.elements.length === 3) {
    const isNum = (n: ts.TypeNode) =>
      n.kind === ts.SyntaxKind.NumberKeyword ||
      (ts.isLiteralTypeNode(n) && ts.isNumericLiteral(n.literal))
    if (t.elements.every(isNum)) return 'vec3'
  }
  if (ts.isTypeReferenceNode(t)) {
    const rightMostName = (n: ts.EntityName): string =>
      ts.isIdentifier(n) ? n.text : rightMostName(n.right)
    const name = rightMostName(t.typeName)
    if (name === 'Array' && t.typeArguments?.length === 1)
      return inferListTypeFromTypeNode(t.typeArguments[0])
    if (name === 'vec3') return 'vec3'
    if (name === 'guid') return 'guid'
    if (name === 'entity') return 'entity'
    if (name === 'prefabId') return 'prefab_id'
    if (name === 'configId') return 'config_id'
    if (name === 'faction') return 'faction'
  }
  if (t.kind === ts.SyntaxKind.NumberKeyword) return 'float'
  if (t.kind === ts.SyntaxKind.BigIntKeyword) return 'int'
  if (t.kind === ts.SyntaxKind.BooleanKeyword) return 'bool'
  if (t.kind === ts.SyntaxKind.StringKeyword) return 'str'
  return null
}

export function inferArrayListType(env: Env, node: ts.ArrayLiteralExpression): ListType {
  const parent = node.parent
  if (
    ts.isAsExpression(parent) ||
    ts.isTypeAssertionExpression(parent) ||
    ts.isVariableDeclaration(parent)
  ) {
    const t = inferListTypeFromTypeNode(parent.type)
    if (t) return t
  }

  // 尝试用 contextual type 推断
  const ct = env.checker.getContextualType(node)
  if (ct) {
    const s = env.checker.typeToString(ct)
    const inferred = inferListTypeFromTypeString(s)
    if (inferred) return inferred
  }

  fail(env, node, 'cannot infer empty list type, please add type annotation')
}

export function makeEmptyListExpr(env: Env, node: ts.ArrayLiteralExpression): ts.Expression {
  if (!node.parent) {
    // synthesized empty array literal: keep as JS array (no list inference)
    return node
  }
  const listType = inferArrayListType(env, node)
  return makeFCall(env, 'emptyList', [ts.factory.createStringLiteral(listType)])
}
