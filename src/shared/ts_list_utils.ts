import ts from 'typescript'

import { isEntityLikeType } from './ts_type_utils.js'
import {
  inferConcreteTypeFromString,
  inferListTypeFromTypeString,
  type ListType
} from './type_string_utils.js'

export type { ListType }
export { inferConcreteTypeFromString, inferListTypeFromTypeString }

export function inferConcreteTypeFromType(
  checker: ts.TypeChecker,
  type: ts.Type,
  location?: ts.Node
): ListType | null {
  if (isEntityLikeType(checker, type, location)) return 'entity'
  const s = checker.typeToString(type)
  return inferConcreteTypeFromString(s)
}

export function inferListTypeFromType(
  checker: ts.TypeChecker,
  type: ts.Type,
  location?: ts.Node
): ListType | null {
  if (type.flags & ts.TypeFlags.Union) {
    const u = type as ts.UnionType
    let base: ListType | null = null
    for (const t of u.types) {
      const next = inferListTypeFromType(checker, t)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }
  if (type.flags & ts.TypeFlags.Intersection) {
    const i = type as ts.IntersectionType
    let base: ListType | null = null
    for (const t of i.types) {
      const next = inferListTypeFromType(checker, t)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }

  if (checker.isArrayType(type)) {
    const args = checker.getTypeArguments(type as ts.TypeReference)
    const elementType = args[0]
    if (elementType) {
      return inferListElementTypeFromType(checker, elementType, location)
    }
  }

  const s = checker.typeToString(type)
  return inferListTypeFromTypeString(s)
}

export function inferListElementTypeFromType(
  checker: ts.TypeChecker,
  type: ts.Type,
  location?: ts.Node
): ListType | null {
  if (type.flags & ts.TypeFlags.Union) {
    const u = type as ts.UnionType
    let base: ListType | null = null
    for (const t of u.types) {
      const next = inferListElementTypeFromType(checker, t, location)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }
  if (type.flags & ts.TypeFlags.Intersection) {
    const i = type as ts.IntersectionType
    let base: ListType | null = null
    for (const t of i.types) {
      const next = inferListElementTypeFromType(checker, t, location)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }

  if ((type.flags & ts.TypeFlags.BigIntLike) !== 0) return 'int'
  if ((type.flags & ts.TypeFlags.NumberLike) !== 0) return 'float'
  if ((type.flags & ts.TypeFlags.BooleanLike) !== 0) return 'bool'
  if ((type.flags & ts.TypeFlags.StringLike) !== 0) return 'str'
  return inferConcreteTypeFromType(checker, type, location)
}

export function isArrayLikeType(checker: ts.TypeChecker, type: ts.Type): boolean {
  if (checker.isArrayType(type) || checker.isTupleType(type)) return true
  const s = checker.typeToString(type)
  if (/\[\]\s*$/.test(s)) return true
  if (/^Array<.+>$/.test(s)) return true
  if (/^ReadonlyArray<.+>$/.test(s)) return true
  if (/^readonly\s+.+\[\]\s*$/i.test(s)) return true
  return false
}

export function inferListTypeFromExpression(
  checker: ts.TypeChecker,
  expr: ts.Node
): ListType | null {
  const type = checker.getTypeAtLocation(expr)
  return inferListTypeFromType(checker, type, expr)
}

export function inferListElementTypeFromExpression(
  checker: ts.TypeChecker,
  expr: ts.Node
): ListType | null {
  const type = checker.getTypeAtLocation(expr)
  return inferListElementTypeFromType(checker, type, expr)
}

export function inferListTypeFromArrayLiteral(
  checker: ts.TypeChecker,
  node: ts.ArrayLiteralExpression
): ListType | null {
  for (const el of node.elements) {
    if (ts.isSpreadElement(el)) {
      const spreadType = checker.getTypeAtLocation(el.expression)
      const inferred = inferListTypeFromType(checker, spreadType, el.expression)
      if (inferred) return inferred
      continue
    }

    const t = checker.getTypeAtLocation(el)
    if (checker.isTupleType(t)) {
      const tuple = t as ts.TupleType
      const elements = checker.getTypeArguments(tuple)
      if (
        elements.length === 3 &&
        elements.every((e) => (e.flags & ts.TypeFlags.NumberLike) !== 0)
      ) {
        return 'vec3'
      }
    }

    if ((t.flags & ts.TypeFlags.BigIntLike) !== 0) return 'int'
    if ((t.flags & ts.TypeFlags.NumberLike) !== 0) return 'float'
    if ((t.flags & ts.TypeFlags.BooleanLike) !== 0) return 'bool'
    if ((t.flags & ts.TypeFlags.StringLike) !== 0) return 'str'

    const inferred = inferConcreteTypeFromType(checker, t, el)
    if (inferred) return inferred
  }

  return null
}
