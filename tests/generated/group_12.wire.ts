import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_12 (wire)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741841 }).on('whenEntityIsCreated', (_evt, f) => {
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
  // sortDictionaryByValue :: dict<configId, float>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: vConfig, v: vFloat }, { k: vConfig, v: vFloat }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<configId, int>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: vConfig, v: vInt }, { k: vConfig, v: vInt }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<entity, float>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: e, v: vFloat }, { k: e, v: vFloat }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<entity, int>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: e, v: vInt }, { k: e, v: vInt }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<faction, float>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: vFaction, v: vFloat }, { k: vFaction, v: vFloat }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<faction, int>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: vFaction, v: vInt }, { k: vFaction, v: vInt }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<guid, float>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: vGuid, v: vFloat }, { k: vGuid, v: vFloat }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<guid, int>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: vGuid, v: vInt }, { k: vGuid, v: vInt }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<int, float>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: vInt, v: vFloat }, { k: vInt, v: vFloat }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<int, int>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<prefabId, float>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: new prefabId(1n), v: vFloat }, { k: new prefabId(1n), v: vFloat }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<prefabId, int>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: new prefabId(1n), v: vInt }, { k: new prefabId(1n), v: vInt }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<str, float>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: vStr, v: vFloat }, { k: vStr, v: vFloat }]), E.SortBy.Ascending)
  // sortDictionaryByValue :: dict<str, int>
  f.sortDictionaryByValue(f.assemblyDictionary([{ k: vStr, v: vInt }, { k: vStr, v: vInt }]), E.SortBy.Ascending)
})

