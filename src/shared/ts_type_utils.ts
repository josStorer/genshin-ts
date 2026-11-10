import ts from 'typescript'

import { looksLikeEntityTypeString } from './type_string_utils.js'

export function unwrapExpression(expr: ts.Expression): ts.Expression {
  while (
    ts.isParenthesizedExpression(expr) ||
    ts.isAsExpression(expr) ||
    ts.isTypeAssertionExpression(expr) ||
    ts.isSatisfiesExpression(expr) ||
    ts.isNonNullExpression(expr)
  ) {
    expr = expr.expression
  }
  return expr
}

const CORE_RUNTIME_FILE = /[\\/]runtime[\\/]core\.(?:d\.)?ts$/
const CORE_RUNTIME_MODULE = /^genshin-ts\/runtime\/core(?:\.js)?$/

/** Module and imported name of a local import binding (`import { g as graph }` / `import * as core`). */
function importOf(symbol: ts.Symbol | undefined): { module: string; name?: string } | undefined {
  const decl = symbol?.declarations?.[0]
  if (decl && ts.isImportSpecifier(decl)) {
    const module = decl.parent.parent.parent.moduleSpecifier
    if (ts.isStringLiteral(module))
      return { module: module.text, name: (decl.propertyName ?? decl.name).text }
  }
  if (decl && ts.isNamespaceImport(decl)) {
    const module = decl.parent.parent.moduleSpecifier
    if (ts.isStringLiteral(module)) return { module: module.text }
  }
  return undefined
}

/**
 * Whether `expr` is the node-graph factory `g` exported by genshin-ts/runtime/core, also when
 * imported under another name (`import { g as graph }`) or through a namespace (`core.g`).
 */
export function isGraphFactory(expr: ts.Expression, checker: ts.TypeChecker): boolean {
  const name = ts.isPropertyAccessExpression(expr) ? expr.name : expr
  if (!ts.isIdentifier(name)) return false
  const local = checker.getSymbolAtLocation(name)
  const target =
    local && local.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(local) : local
  if (target?.declarations?.length) {
    return (
      target.name === 'g' &&
      target.declarations.some((decl) => CORE_RUNTIME_FILE.test(decl.getSourceFile().fileName))
    )
  }
  // The module did not resolve (no tsconfig, or a resolution mode without package exports): use the import itself.
  if (ts.isPropertyAccessExpression(expr)) {
    if (name.text !== 'g' || !ts.isIdentifier(expr.expression)) return false
    const source = importOf(checker.getSymbolAtLocation(expr.expression))
    return !!source && !source.name && CORE_RUNTIME_MODULE.test(source.module)
  }
  const source = importOf(local)
  return source?.name === 'g' && CORE_RUNTIME_MODULE.test(source.module)
}

const typeTextCache = new WeakMap<ts.TypeChecker, WeakMap<ts.Type, string>>()
const entityTypeCache = new WeakMap<ts.TypeChecker, WeakMap<ts.Node, ts.Type | null>>()
const entityLikeCache = new WeakMap<ts.TypeChecker, WeakMap<ts.Node, WeakMap<ts.Type, boolean>>>()

export function typeToStringCached(checker: ts.TypeChecker, type: ts.Type): string {
  let byType = typeTextCache.get(checker)
  if (!byType) {
    byType = new WeakMap()
    typeTextCache.set(checker, byType)
  }
  const cached = byType.get(type)
  if (cached !== undefined) return cached
  const text = checker.typeToString(type)
  byType.set(type, text)
  return text
}

function getFallbackLocation(type?: ts.Type): ts.Node | undefined {
  const sym = type?.symbol
  return sym?.valueDeclaration ?? sym?.declarations?.[0]
}

function resolveEntityType(checker: ts.TypeChecker, location: ts.Node | undefined): ts.Type | null {
  if (!location) return null
  let byLocation = entityTypeCache.get(checker)
  if (!byLocation) {
    byLocation = new WeakMap()
    entityTypeCache.set(checker, byLocation)
  }
  const cached = byLocation.get(location)
  if (cached !== undefined) return cached

  const typeSym = checker.resolveName('entity', location, ts.SymbolFlags.Type, false)
  if (typeSym) {
    const type = checker.getDeclaredTypeOfSymbol(typeSym)
    byLocation.set(location, type)
    return type
  }
  const valueSym = checker.resolveName('entity', location, ts.SymbolFlags.Value, false)
  if (!valueSym || !valueSym.declarations?.some((d) => d.getSourceFile().isDeclarationFile)) {
    byLocation.set(location, null)
    return null
  }
  const valueType = checker.getTypeOfSymbolAtLocation(valueSym, location)
  const sig = valueType.getCallSignatures()[0] ?? valueType.getConstructSignatures()[0]
  const type = sig ? checker.getReturnTypeOfSignature(sig) : null
  byLocation.set(location, type)
  return type
}

export function isEntityLikeType(
  checker: ts.TypeChecker,
  type: ts.Type,
  location?: ts.Node
): boolean {
  const resolvedLocation = location ?? getFallbackLocation(type)
  let byType: WeakMap<ts.Type, boolean> | undefined
  if (resolvedLocation) {
    let byLocation = entityLikeCache.get(checker)
    if (!byLocation) {
      byLocation = new WeakMap()
      entityLikeCache.set(checker, byLocation)
    }
    byType = byLocation.get(resolvedLocation)
    if (!byType) {
      byType = new WeakMap()
      byLocation.set(resolvedLocation, byType)
    }
    const cached = byType.get(type)
    if (cached !== undefined) return cached
  }

  const done = (result: boolean) => {
    byType?.set(type, result)
    return result
  }
  const aliasName = type.aliasSymbol?.getName() ?? type.symbol?.getName()
  if (aliasName && looksLikeEntityTypeString(aliasName)) return done(true)

  const text = typeToStringCached(checker, type)
  if (looksLikeEntityTypeString(text)) return done(true)

  const entityType = resolveEntityType(checker, resolvedLocation)
  if (
    entityType &&
    (checker.isTypeAssignableTo(type, entityType) || checker.isTypeAssignableTo(entityType, type))
  ) {
    return done(true)
  }

  const brand = checker.getPropertyOfType(type, '__entityRuntimeBrand')
  if (!brand) return done(false)
  const brandDecl = brand.valueDeclaration ?? brand.declarations?.[0]
  if (!brandDecl) return done(true)
  const brandType = checker.getTypeOfSymbolAtLocation(brand, brandDecl)
  if ((brandType.flags & ts.TypeFlags.StringLiteral) !== 0) {
    return done((brandType as ts.StringLiteralType).value === 'entity')
  }
  return done(true)
}
