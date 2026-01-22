import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_11 (wire)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741840 }).on('whenEntityIsCreated', (_evt, f) => {
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
  // sortDictionaryByKey :: dict<int, bool>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vBool }, { k: vInt, v: vBool }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, configId>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vConfig }, { k: vInt, v: vConfig }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, entity>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: e }, { k: vInt, v: e }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, faction>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vFaction }, { k: vInt, v: vFaction }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, float>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vFloat }, { k: vInt, v: vFloat }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, guid>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vGuid }, { k: vInt, v: vGuid }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, int>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, prefabId>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: new prefabId(1n) }, { k: vInt, v: new prefabId(1n) }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, str>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vStr }, { k: vInt, v: vStr }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, vec3>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vVec3 }, { k: vInt, v: vVec3 }]), E.SortBy.Ascending)
})

