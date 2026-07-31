import ts from 'typescript'

import { looksLikeEntityTypeString } from './type_string_utils.js'

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

  const brand = checker.getPropertyOfType(type, '__brandEntity')
  if (!brand) return done(false)
  const brandDecl = brand.valueDeclaration ?? brand.declarations?.[0]
  if (!brandDecl) return done(true)
  const brandType = checker.getTypeOfSymbolAtLocation(brand, brandDecl)
  if ((brandType.flags & ts.TypeFlags.StringLiteral) !== 0) {
    return done((brandType as ts.StringLiteralType).value === 'entity')
  }
  return done(true)
}
