import ts from 'typescript'

import { looksLikeEntityTypeString } from './type_string_utils.js'

function getFallbackLocation(type?: ts.Type): ts.Node | null {
  const sym = type?.symbol
  return sym?.valueDeclaration ?? sym?.declarations?.[0] ?? null
}

function resolveEntityType(checker: ts.TypeChecker, location: ts.Node | null): ts.Type | null {
  if (!location) return null
  const typeSym = checker.resolveName('entity', location, ts.SymbolFlags.Type, false)
  if (typeSym) return checker.getDeclaredTypeOfSymbol(typeSym)
  const valueSym = checker.resolveName('entity', location, ts.SymbolFlags.Value, false)
  if (!valueSym) return null
  if (!valueSym.declarations?.some((d) => d.getSourceFile().isDeclarationFile)) return null
  const valueType = checker.getTypeOfSymbolAtLocation(valueSym, location)
  const sig = valueType.getCallSignatures()[0] ?? valueType.getConstructSignatures()[0]
  if (!sig) return null
  return checker.getReturnTypeOfSignature(sig)
}

export function isEntityLikeType(
  checker: ts.TypeChecker,
  type: ts.Type,
  location?: ts.Node
): boolean {
  const aliasName = type.aliasSymbol?.getName() ?? type.symbol?.getName()
  if (aliasName && looksLikeEntityTypeString(aliasName)) return true

  const text = checker.typeToString(type)
  if (looksLikeEntityTypeString(text)) return true

  const entityType = resolveEntityType(checker, location ?? getFallbackLocation(type))
  if (
    entityType &&
    (checker.isTypeAssignableTo(type, entityType) || checker.isTypeAssignableTo(entityType, type))
  ) {
    return true
  }

  const brand = checker.getPropertyOfType(type, '__brandEntity')
  if (!brand) return false
  const brandDecl = brand.valueDeclaration ?? brand.declarations?.[0]
  if (!brandDecl) return true
  const brandType = checker.getTypeOfSymbolAtLocation(brand, brandDecl)
  if ((brandType.flags & ts.TypeFlags.StringLiteral) !== 0) {
    return (brandType as ts.StringLiteralType).value === 'entity'
  }
  return true
}
