import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_01 (wire)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741830 }).on('whenEntityIsCreated', (_evt, f) => {
  const e = f.getSelfEntity()
  const pes = f.getListOfPlayerEntitiesOnTheField()
  const ces = f.getAllCharacterEntitiesOfSpecifiedPlayer(pes[0])
  const vInt = f.addition(1n, 2n)
  const vFloat = f.pi()
  const vBool = f.equal(1n, 1n)
  const vGuid = f.queryGuidByEntity(e)
  const vFaction = f.queryEntityFaction(e)
  const vVec3 = f.create3dVector(1, 2, 3)
  const vStr = f.dataTypeConversion(1n, 'str')
  const vConfig = f.queryPlayerClass(e)
  // listSorting :: float
  f.listSorting(f.assemblyList([vFloat, vFloat, vFloat], "float"), E.SortBy.Ascending)
  // listSorting :: int
  f.listSorting(f.assemblyList([vInt, vInt, vInt], "int"), E.SortBy.Ascending)
  // multiplication :: float
  f.multiplication(vFloat, vFloat)
  // multiplication :: int
  f.multiplication(vInt, vInt)
  // division :: float
  f.division(vFloat, vFloat)
  // division :: int
  f.division(vInt, vInt)
  // rangeLimitingOperation :: float
  f.rangeLimitingOperation(vFloat, vFloat, vFloat)
  // rangeLimitingOperation :: int
  f.rangeLimitingOperation(vInt, vInt, vInt)
  // addition :: float
  f.addition(vFloat, vFloat)
  // addition :: int
  f.addition(vInt, vInt)
  // subtraction :: float
  f.subtraction(vFloat, vFloat)
  // subtraction :: int
  f.subtraction(vInt, vInt)
  // takeLargerValue :: float
  f.takeLargerValue(vFloat, vFloat)
  // takeLargerValue :: int
  f.takeLargerValue(vInt, vInt)
  // takeSmallerValue :: float
  f.takeSmallerValue(vFloat, vFloat)
  // takeSmallerValue :: int
  f.takeSmallerValue(vInt, vInt)
  // absoluteValueOperation :: float
  f.absoluteValueOperation(vFloat)
  // absoluteValueOperation :: int
  f.absoluteValueOperation(vInt)
  // exponentiation :: float
  f.exponentiation(vFloat, vFloat)
  // exponentiation :: int
  f.exponentiation(vInt, vInt)
  // signOperation :: float
  f.signOperation(vFloat)
  // signOperation :: int
  f.signOperation(vInt)
  // greaterThan :: float
  f.greaterThan(vFloat, vFloat)
  // greaterThan :: int
  f.greaterThan(vInt, vInt)
  // greaterThanOrEqualTo :: float
  f.greaterThanOrEqualTo(vFloat, vFloat)
  // greaterThanOrEqualTo :: int
  f.greaterThanOrEqualTo(vInt, vInt)
  // lessThan :: float
  f.lessThan(vFloat, vFloat)
  // lessThan :: int
  f.lessThan(vInt, vInt)
  // lessThanOrEqualTo :: float
  f.lessThanOrEqualTo(vFloat, vFloat)
  // lessThanOrEqualTo :: int
  f.lessThanOrEqualTo(vInt, vInt)
  // getMaximumValueFromList :: float
  f.getMaximumValueFromList(f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // getMaximumValueFromList :: int
  f.getMaximumValueFromList(f.assemblyList([vInt, vInt, vInt], "int"))
  // getMinimumValueFromList :: float
  f.getMinimumValueFromList(f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // getMinimumValueFromList :: int
  f.getMinimumValueFromList(f.assemblyList([vInt, vInt, vInt], "int"))
})

