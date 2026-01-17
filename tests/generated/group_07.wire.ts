import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_07 (wire)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741836 }).on('whenEntityIsCreated', (_evt, f) => {
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
  // multipleBranches :: int
  f.multipleBranches(vInt, ({ 1: () => { f.printString("wire_b1_multipleBranches_1") }, default: () => { f.printString("wire_bd_multipleBranches_1") } }))
  // multipleBranches :: str
  f.multipleBranches(vStr, ({ 1: () => { f.printString("wire_b1_multipleBranches_1") }, default: () => { f.printString("wire_bd_multipleBranches_1") } }))
})

