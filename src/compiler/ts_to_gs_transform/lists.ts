import ts from 'typescript'

import { inferListTypeFromType as inferListTypeFromTypeShared } from '../../shared/ts_list_utils.js'
import {
  inferConcreteTypeFromString,
  inferListTypeFromTypeString,
  type ListType
} from '../../shared/type_string_utils.js'
import { fail } from './errors.js'
import type { Env } from './types.js'
import { makeFCall } from './utils.js'

export type { ListType }
export { inferConcreteTypeFromString, inferListTypeFromTypeString }

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
    const inferred = inferListTypeFromTypeShared(env.checker, ct, node)
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
