import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_09 (wire)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741838 }).on('whenEntityIsCreated', (_evt, f) => {
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
  // enumerationsEqual :: e<10>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<11>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<12>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<13>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<14>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<16>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<17>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<18>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<19>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<1>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<20>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<21>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<22>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<23>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<24>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<25>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<26>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<27>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<28>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<29>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<2>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<30>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<31>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<32>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<33>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<35>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<36>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<37>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<38>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<39>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<3>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<40>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<41>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<4>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<5>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<6>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<7>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<8>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
  // enumerationsEqual :: e<9>
  f.enumerationsEqual(E.SortBy.Ascending, E.SortBy.Ascending)
})

