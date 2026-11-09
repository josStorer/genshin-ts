import ts from 'typescript'

import { inferConcreteTypeFromType, type ListType } from './ts_list_utils.js'

type VariableTypeContext = { checker: ts.TypeChecker; file: ts.SourceFile }

export function isCollectionType(env: VariableTypeContext, t: ts.Type): boolean {
  // union/intersection：只要任一分支是 collection，就按 collection 处理（保守，避免漏判）
  if (t.flags & ts.TypeFlags.Union) {
    const u = t as ts.UnionType
    return u.types.some((tt) => isCollectionType(env, tt))
  }
  if (t.flags & ts.TypeFlags.Intersection) {
    const it = t as ts.IntersectionType
    return it.types.some((tt) => isCollectionType(env, tt))
  }

  if (env.checker.isArrayType(t) || env.checker.isTupleType(t)) return true
  const s = env.checker.typeToString(t)
  if (/\bRecord<.+>$/.test(s)) return true
  if (/\bMap<.+>$/.test(s)) return true
  return false
}

export function inferBasicType(env: VariableTypeContext, t: ts.Type): ListType | null {
  if (t.flags & ts.TypeFlags.Union) {
    const u = t as ts.UnionType
    let base: ListType | null = null
    for (const tt of u.types) {
      const next = inferBasicType(env, tt)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }
  if (t.flags & ts.TypeFlags.Intersection) {
    const it = t as ts.IntersectionType
    let base: ListType | null = null
    for (const tt of it.types) {
      const next = inferBasicType(env, tt)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }
  return inferConcreteTypeFromType(env.checker, env.checker.getBaseTypeOfLiteralType(t), env.file)
}

/** Whether a `let` of this type can get a node graph local variable (a dict, for example, cannot) */
export function canHaveLocalVariable(env: VariableTypeContext, t: ts.Type): boolean {
  return isCollectionType(env, t) || inferBasicType(env, t) !== null
}

/** Whether an assignment crosses control flow between its declaration and use. */
export function isBranchedAssignment(expr: ts.Expression, decl: ts.Declaration): boolean {
  const declAncestors = new Set<ts.Node>()
  let inFunction = false
  for (let node: ts.Node | undefined = decl; node; node = node.parent) {
    declAncestors.add(node)
    if (ts.isFunctionLike(node)) inFunction = true
  }
  if (!inFunction) return false

  let branched = false
  let cur: ts.Node = expr.parent
  while (!declAncestors.has(cur)) {
    if (
      ts.isIfStatement(cur) ||
      ts.isSwitchStatement(cur) ||
      ts.isIterationStatement(cur, false) ||
      ts.isConditionalExpression(cur) ||
      ts.isFunctionLike(cur)
    ) {
      branched = true
    }
    cur = cur.parent
  }
  // A loop variable assigned in its own loop body: the common ancestor is the loop itself
  if (ts.isIterationStatement(cur, false) && cur.statement.pos <= expr.pos) branched = true
  return branched
}
