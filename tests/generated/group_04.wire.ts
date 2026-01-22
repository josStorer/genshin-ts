import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_04 (wire)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741833 }).on('whenEntityIsCreated', (_evt, f) => {
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
  // assemblyDictionary :: dict<configId, bool>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, configId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, entity>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, faction>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, float>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, guid>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, int>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, list<bool>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, list<configId>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, list<entity>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, list<faction>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, list<float>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, list<guid>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, list<int>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, list<str>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, list<vec3>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, prefabId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, str>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<configId, vec3>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, bool>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, configId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, entity>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, faction>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, float>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, guid>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, int>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, list<bool>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, list<configId>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, list<entity>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, list<faction>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, list<float>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, list<guid>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, list<int>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, list<str>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, list<vec3>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, prefabId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, str>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<entity, vec3>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, bool>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, configId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, entity>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, faction>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, float>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, guid>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, int>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, list<bool>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, list<configId>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, list<entity>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, list<faction>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, list<float>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, list<guid>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, list<int>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, list<str>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, list<vec3>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, prefabId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, str>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<faction, vec3>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, bool>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, configId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, entity>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, faction>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, float>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, guid>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, int>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, list<bool>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, list<configId>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, list<entity>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, list<faction>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, list<float>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, list<guid>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, list<int>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, list<str>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, list<vec3>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, prefabId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, str>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<guid, vec3>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, bool>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, configId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, entity>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, faction>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, float>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, guid>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, int>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, list<bool>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, list<configId>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, list<entity>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, list<faction>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, list<float>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, list<guid>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, list<int>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, list<str>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, list<vec3>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, prefabId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, str>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<int, vec3>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, bool>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, configId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, entity>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, faction>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, float>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, guid>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, int>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, list<bool>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, list<configId>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, list<entity>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, list<faction>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, list<float>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, list<guid>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, list<int>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, list<str>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, list<vec3>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, prefabId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, str>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<prefabId, vec3>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, bool>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, configId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, entity>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, faction>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, float>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, guid>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, int>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, list<bool>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, list<configId>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, list<entity>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, list<faction>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, list<float>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, list<guid>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, list<int>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, list<str>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, list<vec3>>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, prefabId>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, str>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // assemblyDictionary :: dict<str, vec3>
  f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }])
  // queryDictionaryValueByKey :: dict<configId, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: vBool }, { k: vConfig, v: vBool }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: vConfig }, { k: vConfig, v: vConfig }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: e }, { k: vConfig, v: e }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: vFaction }, { k: vConfig, v: vFaction }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: vFloat }, { k: vConfig, v: vFloat }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: vGuid }, { k: vConfig, v: vGuid }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: vInt }, { k: vConfig, v: vInt }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vConfig, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vConfig, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([e, e, e], "entity") }, { k: vConfig, v: f.assemblyList([e, e, e], "entity") }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vConfig, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vConfig, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vConfig, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vConfig, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vConfig, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vConfig, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: new prefabId(1n) }, { k: vConfig, v: new prefabId(1n) }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: vStr }, { k: vConfig, v: vStr }]), vConfig)
  // queryDictionaryValueByKey :: dict<configId, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vConfig, v: vVec3 }, { k: vConfig, v: vVec3 }]), vConfig)
  // queryDictionaryValueByKey :: dict<entity, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: vBool }, { k: e, v: vBool }]), e)
  // queryDictionaryValueByKey :: dict<entity, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: vConfig }, { k: e, v: vConfig }]), e)
  // queryDictionaryValueByKey :: dict<entity, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: e }, { k: e, v: e }]), e)
  // queryDictionaryValueByKey :: dict<entity, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: vFaction }, { k: e, v: vFaction }]), e)
  // queryDictionaryValueByKey :: dict<entity, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: vFloat }, { k: e, v: vFloat }]), e)
  // queryDictionaryValueByKey :: dict<entity, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: vGuid }, { k: e, v: vGuid }]), e)
  // queryDictionaryValueByKey :: dict<entity, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: vInt }, { k: e, v: vInt }]), e)
  // queryDictionaryValueByKey :: dict<entity, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: e, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), e)
  // queryDictionaryValueByKey :: dict<entity, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: e, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), e)
  // queryDictionaryValueByKey :: dict<entity, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([e, e, e], "entity") }, { k: e, v: f.assemblyList([e, e, e], "entity") }]), e)
  // queryDictionaryValueByKey :: dict<entity, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: e, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), e)
  // queryDictionaryValueByKey :: dict<entity, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: e, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), e)
  // queryDictionaryValueByKey :: dict<entity, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: e, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), e)
  // queryDictionaryValueByKey :: dict<entity, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: e, v: f.assemblyList([vInt, vInt, vInt], "int") }]), e)
  // queryDictionaryValueByKey :: dict<entity, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: e, v: f.assemblyList([vStr, vStr, vStr], "str") }]), e)
  // queryDictionaryValueByKey :: dict<entity, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: e, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), e)
  // queryDictionaryValueByKey :: dict<entity, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: new prefabId(1n) }, { k: e, v: new prefabId(1n) }]), e)
  // queryDictionaryValueByKey :: dict<entity, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: vStr }, { k: e, v: vStr }]), e)
  // queryDictionaryValueByKey :: dict<entity, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: e, v: vVec3 }, { k: e, v: vVec3 }]), e)
  // queryDictionaryValueByKey :: dict<faction, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: vBool }, { k: vFaction, v: vBool }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: vConfig }, { k: vFaction, v: vConfig }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: e }, { k: vFaction, v: e }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: vFaction }, { k: vFaction, v: vFaction }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: vFloat }, { k: vFaction, v: vFloat }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: vGuid }, { k: vFaction, v: vGuid }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: vInt }, { k: vFaction, v: vInt }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vFaction, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vFaction, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([e, e, e], "entity") }, { k: vFaction, v: f.assemblyList([e, e, e], "entity") }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vFaction, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vFaction, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vFaction, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vFaction, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vFaction, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vFaction, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: new prefabId(1n) }, { k: vFaction, v: new prefabId(1n) }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: vStr }, { k: vFaction, v: vStr }]), vFaction)
  // queryDictionaryValueByKey :: dict<faction, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vFaction, v: vVec3 }, { k: vFaction, v: vVec3 }]), vFaction)
  // queryDictionaryValueByKey :: dict<guid, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: vBool }, { k: vGuid, v: vBool }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: vConfig }, { k: vGuid, v: vConfig }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: e }, { k: vGuid, v: e }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: vFaction }, { k: vGuid, v: vFaction }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: vFloat }, { k: vGuid, v: vFloat }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: vGuid }, { k: vGuid, v: vGuid }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: vInt }, { k: vGuid, v: vInt }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vGuid, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vGuid, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([e, e, e], "entity") }, { k: vGuid, v: f.assemblyList([e, e, e], "entity") }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vGuid, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vGuid, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vGuid, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vGuid, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vGuid, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vGuid, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: new prefabId(1n) }, { k: vGuid, v: new prefabId(1n) }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: vStr }, { k: vGuid, v: vStr }]), vGuid)
  // queryDictionaryValueByKey :: dict<guid, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vGuid, v: vVec3 }, { k: vGuid, v: vVec3 }]), vGuid)
  // queryDictionaryValueByKey :: dict<int, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: vBool }, { k: vInt, v: vBool }]), vInt)
  // queryDictionaryValueByKey :: dict<int, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: vConfig }, { k: vInt, v: vConfig }]), vInt)
  // queryDictionaryValueByKey :: dict<int, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: e }, { k: vInt, v: e }]), vInt)
  // queryDictionaryValueByKey :: dict<int, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: vFaction }, { k: vInt, v: vFaction }]), vInt)
  // queryDictionaryValueByKey :: dict<int, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: vFloat }, { k: vInt, v: vFloat }]), vInt)
  // queryDictionaryValueByKey :: dict<int, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: vGuid }, { k: vInt, v: vGuid }]), vInt)
  // queryDictionaryValueByKey :: dict<int, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }]), vInt)
  // queryDictionaryValueByKey :: dict<int, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vInt, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vInt)
  // queryDictionaryValueByKey :: dict<int, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vInt, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vInt)
  // queryDictionaryValueByKey :: dict<int, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([e, e, e], "entity") }, { k: vInt, v: f.assemblyList([e, e, e], "entity") }]), vInt)
  // queryDictionaryValueByKey :: dict<int, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vInt, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vInt)
  // queryDictionaryValueByKey :: dict<int, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vInt, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vInt)
  // queryDictionaryValueByKey :: dict<int, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vInt, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vInt)
  // queryDictionaryValueByKey :: dict<int, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vInt, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vInt)
  // queryDictionaryValueByKey :: dict<int, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vInt, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vInt)
  // queryDictionaryValueByKey :: dict<int, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vInt, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vInt)
  // queryDictionaryValueByKey :: dict<int, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: new prefabId(1n) }, { k: vInt, v: new prefabId(1n) }]), vInt)
  // queryDictionaryValueByKey :: dict<int, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: vStr }, { k: vInt, v: vStr }]), vInt)
  // queryDictionaryValueByKey :: dict<int, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vInt, v: vVec3 }, { k: vInt, v: vVec3 }]), vInt)
  // queryDictionaryValueByKey :: dict<prefabId, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vBool }, { k: new prefabId(1n), v: vBool }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vConfig }, { k: new prefabId(1n), v: vConfig }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: e }, { k: new prefabId(1n), v: e }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vFaction }, { k: new prefabId(1n), v: vFaction }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vFloat }, { k: new prefabId(1n), v: vFloat }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vGuid }, { k: new prefabId(1n), v: vGuid }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vInt }, { k: new prefabId(1n), v: vInt }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: new prefabId(1n), v: f.assemblyList([vBool, vBool, vBool], "bool") }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: new prefabId(1n), v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([e, e, e], "entity") }, { k: new prefabId(1n), v: f.assemblyList([e, e, e], "entity") }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: new prefabId(1n), v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: new prefabId(1n), v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: new prefabId(1n), v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: new prefabId(1n), v: f.assemblyList([vInt, vInt, vInt], "int") }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: new prefabId(1n), v: f.assemblyList([vStr, vStr, vStr], "str") }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: new prefabId(1n), v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: new prefabId(1n) }, { k: new prefabId(1n), v: new prefabId(1n) }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vStr }, { k: new prefabId(1n), v: vStr }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<prefabId, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vVec3 }, { k: new prefabId(1n), v: vVec3 }]), new prefabId(1n))
  // queryDictionaryValueByKey :: dict<str, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: vBool }, { k: vStr, v: vBool }]), vStr)
  // queryDictionaryValueByKey :: dict<str, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: vConfig }, { k: vStr, v: vConfig }]), vStr)
  // queryDictionaryValueByKey :: dict<str, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: e }, { k: vStr, v: e }]), vStr)
  // queryDictionaryValueByKey :: dict<str, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: vFaction }, { k: vStr, v: vFaction }]), vStr)
  // queryDictionaryValueByKey :: dict<str, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: vFloat }, { k: vStr, v: vFloat }]), vStr)
  // queryDictionaryValueByKey :: dict<str, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: vGuid }, { k: vStr, v: vGuid }]), vStr)
  // queryDictionaryValueByKey :: dict<str, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: vInt }, { k: vStr, v: vInt }]), vStr)
  // queryDictionaryValueByKey :: dict<str, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vStr, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vStr)
  // queryDictionaryValueByKey :: dict<str, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vStr, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vStr)
  // queryDictionaryValueByKey :: dict<str, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([e, e, e], "entity") }, { k: vStr, v: f.assemblyList([e, e, e], "entity") }]), vStr)
  // queryDictionaryValueByKey :: dict<str, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vStr, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vStr)
  // queryDictionaryValueByKey :: dict<str, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vStr, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vStr)
  // queryDictionaryValueByKey :: dict<str, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vStr, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vStr)
  // queryDictionaryValueByKey :: dict<str, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vStr, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vStr)
  // queryDictionaryValueByKey :: dict<str, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vStr, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vStr)
  // queryDictionaryValueByKey :: dict<str, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vStr, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vStr)
  // queryDictionaryValueByKey :: dict<str, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: new prefabId(1n) }, { k: vStr, v: new prefabId(1n) }]), vStr)
  // queryDictionaryValueByKey :: dict<str, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: vStr }, { k: vStr, v: vStr }]), vStr)
  // queryDictionaryValueByKey :: dict<str, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: vStr, v: vVec3 }, { k: vStr, v: vVec3 }]), vStr)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: vBool }, { k: vConfig, v: vBool }]), vConfig, vBool)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: vConfig }, { k: vConfig, v: vConfig }]), vConfig, vConfig)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: e }, { k: vConfig, v: e }]), vConfig, e)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: vFaction }, { k: vConfig, v: vFaction }]), vConfig, vFaction)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: vFloat }, { k: vConfig, v: vFloat }]), vConfig, vFloat)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: vGuid }, { k: vConfig, v: vGuid }]), vConfig, vGuid)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: vInt }, { k: vConfig, v: vInt }]), vConfig, vInt)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vConfig, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vConfig, f.assemblyList([vBool, vBool, vBool], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vConfig, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vConfig, f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([e, e, e], "entity") }, { k: vConfig, v: f.assemblyList([e, e, e], "entity") }]), vConfig, f.assemblyList([e, e, e], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vConfig, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vConfig, f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vConfig, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vConfig, f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vConfig, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vConfig, f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vConfig, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vConfig, f.assemblyList([vInt, vInt, vInt], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vConfig, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vConfig, f.assemblyList([vStr, vStr, vStr], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vConfig, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vConfig, f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: new prefabId(1n) }, { k: vConfig, v: new prefabId(1n) }]), vConfig, new prefabId(1n))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: vStr }, { k: vConfig, v: vStr }]), vConfig, vStr)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vConfig, v: vVec3 }, { k: vConfig, v: vVec3 }]), vConfig, vVec3)
  // setOrAddKeyValuePairsToDictionary :: dict<entity, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: vBool }, { k: e, v: vBool }]), e, vBool)
  // setOrAddKeyValuePairsToDictionary :: dict<entity, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: vConfig }, { k: e, v: vConfig }]), e, vConfig)
  // setOrAddKeyValuePairsToDictionary :: dict<entity, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: e }, { k: e, v: e }]), e, e)
  // setOrAddKeyValuePairsToDictionary :: dict<entity, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: vFaction }, { k: e, v: vFaction }]), e, vFaction)
  // setOrAddKeyValuePairsToDictionary :: dict<entity, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: vFloat }, { k: e, v: vFloat }]), e, vFloat)
  // setOrAddKeyValuePairsToDictionary :: dict<entity, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: vGuid }, { k: e, v: vGuid }]), e, vGuid)
  // setOrAddKeyValuePairsToDictionary :: dict<entity, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: vInt }, { k: e, v: vInt }]), e, vInt)
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: e, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), e, f.assemblyList([vBool, vBool, vBool], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: e, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), e, f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([e, e, e], "entity") }, { k: e, v: f.assemblyList([e, e, e], "entity") }]), e, f.assemblyList([e, e, e], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: e, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), e, f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: e, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), e, f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: e, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), e, f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: e, v: f.assemblyList([vInt, vInt, vInt], "int") }]), e, f.assemblyList([vInt, vInt, vInt], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: e, v: f.assemblyList([vStr, vStr, vStr], "str") }]), e, f.assemblyList([vStr, vStr, vStr], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: e, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), e, f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: new prefabId(1n) }, { k: e, v: new prefabId(1n) }]), e, new prefabId(1n))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: vStr }, { k: e, v: vStr }]), e, vStr)
  // setOrAddKeyValuePairsToDictionary :: dict<entity, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: e, v: vVec3 }, { k: e, v: vVec3 }]), e, vVec3)
  // setOrAddKeyValuePairsToDictionary :: dict<faction, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: vBool }, { k: vFaction, v: vBool }]), vFaction, vBool)
  // setOrAddKeyValuePairsToDictionary :: dict<faction, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: vConfig }, { k: vFaction, v: vConfig }]), vFaction, vConfig)
  // setOrAddKeyValuePairsToDictionary :: dict<faction, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: e }, { k: vFaction, v: e }]), vFaction, e)
  // setOrAddKeyValuePairsToDictionary :: dict<faction, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: vFaction }, { k: vFaction, v: vFaction }]), vFaction, vFaction)
  // setOrAddKeyValuePairsToDictionary :: dict<faction, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: vFloat }, { k: vFaction, v: vFloat }]), vFaction, vFloat)
  // setOrAddKeyValuePairsToDictionary :: dict<faction, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: vGuid }, { k: vFaction, v: vGuid }]), vFaction, vGuid)
  // setOrAddKeyValuePairsToDictionary :: dict<faction, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: vInt }, { k: vFaction, v: vInt }]), vFaction, vInt)
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vFaction, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vFaction, f.assemblyList([vBool, vBool, vBool], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vFaction, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vFaction, f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([e, e, e], "entity") }, { k: vFaction, v: f.assemblyList([e, e, e], "entity") }]), vFaction, f.assemblyList([e, e, e], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vFaction, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vFaction, f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vFaction, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vFaction, f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vFaction, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vFaction, f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vFaction, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vFaction, f.assemblyList([vInt, vInt, vInt], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vFaction, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vFaction, f.assemblyList([vStr, vStr, vStr], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vFaction, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vFaction, f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: new prefabId(1n) }, { k: vFaction, v: new prefabId(1n) }]), vFaction, new prefabId(1n))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: vStr }, { k: vFaction, v: vStr }]), vFaction, vStr)
  // setOrAddKeyValuePairsToDictionary :: dict<faction, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vFaction, v: vVec3 }, { k: vFaction, v: vVec3 }]), vFaction, vVec3)
  // setOrAddKeyValuePairsToDictionary :: dict<guid, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: vBool }, { k: vGuid, v: vBool }]), vGuid, vBool)
  // setOrAddKeyValuePairsToDictionary :: dict<guid, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: vConfig }, { k: vGuid, v: vConfig }]), vGuid, vConfig)
  // setOrAddKeyValuePairsToDictionary :: dict<guid, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: e }, { k: vGuid, v: e }]), vGuid, e)
  // setOrAddKeyValuePairsToDictionary :: dict<guid, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: vFaction }, { k: vGuid, v: vFaction }]), vGuid, vFaction)
  // setOrAddKeyValuePairsToDictionary :: dict<guid, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: vFloat }, { k: vGuid, v: vFloat }]), vGuid, vFloat)
  // setOrAddKeyValuePairsToDictionary :: dict<guid, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: vGuid }, { k: vGuid, v: vGuid }]), vGuid, vGuid)
  // setOrAddKeyValuePairsToDictionary :: dict<guid, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: vInt }, { k: vGuid, v: vInt }]), vGuid, vInt)
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vGuid, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vGuid, f.assemblyList([vBool, vBool, vBool], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vGuid, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vGuid, f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([e, e, e], "entity") }, { k: vGuid, v: f.assemblyList([e, e, e], "entity") }]), vGuid, f.assemblyList([e, e, e], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vGuid, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vGuid, f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vGuid, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vGuid, f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vGuid, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vGuid, f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vGuid, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vGuid, f.assemblyList([vInt, vInt, vInt], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vGuid, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vGuid, f.assemblyList([vStr, vStr, vStr], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vGuid, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vGuid, f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: new prefabId(1n) }, { k: vGuid, v: new prefabId(1n) }]), vGuid, new prefabId(1n))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: vStr }, { k: vGuid, v: vStr }]), vGuid, vStr)
  // setOrAddKeyValuePairsToDictionary :: dict<guid, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vGuid, v: vVec3 }, { k: vGuid, v: vVec3 }]), vGuid, vVec3)
  // setOrAddKeyValuePairsToDictionary :: dict<int, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: vBool }, { k: vInt, v: vBool }]), vInt, vBool)
  // setOrAddKeyValuePairsToDictionary :: dict<int, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: vConfig }, { k: vInt, v: vConfig }]), vInt, vConfig)
  // setOrAddKeyValuePairsToDictionary :: dict<int, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: e }, { k: vInt, v: e }]), vInt, e)
  // setOrAddKeyValuePairsToDictionary :: dict<int, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: vFaction }, { k: vInt, v: vFaction }]), vInt, vFaction)
  // setOrAddKeyValuePairsToDictionary :: dict<int, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: vFloat }, { k: vInt, v: vFloat }]), vInt, vFloat)
  // setOrAddKeyValuePairsToDictionary :: dict<int, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: vGuid }, { k: vInt, v: vGuid }]), vInt, vGuid)
  // setOrAddKeyValuePairsToDictionary :: dict<int, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }]), vInt, vInt)
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vInt, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vInt, f.assemblyList([vBool, vBool, vBool], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vInt, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vInt, f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([e, e, e], "entity") }, { k: vInt, v: f.assemblyList([e, e, e], "entity") }]), vInt, f.assemblyList([e, e, e], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vInt, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vInt, f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vInt, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vInt, f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vInt, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vInt, f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vInt, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vInt, f.assemblyList([vInt, vInt, vInt], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vInt, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vInt, f.assemblyList([vStr, vStr, vStr], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vInt, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vInt, f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: new prefabId(1n) }, { k: vInt, v: new prefabId(1n) }]), vInt, new prefabId(1n))
  // setOrAddKeyValuePairsToDictionary :: dict<int, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: vStr }, { k: vInt, v: vStr }]), vInt, vStr)
  // setOrAddKeyValuePairsToDictionary :: dict<int, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vInt, v: vVec3 }, { k: vInt, v: vVec3 }]), vInt, vVec3)
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vBool }, { k: new prefabId(1n), v: vBool }]), new prefabId(1n), vBool)
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vConfig }, { k: new prefabId(1n), v: vConfig }]), new prefabId(1n), vConfig)
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: e }, { k: new prefabId(1n), v: e }]), new prefabId(1n), e)
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vFaction }, { k: new prefabId(1n), v: vFaction }]), new prefabId(1n), vFaction)
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vFloat }, { k: new prefabId(1n), v: vFloat }]), new prefabId(1n), vFloat)
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vGuid }, { k: new prefabId(1n), v: vGuid }]), new prefabId(1n), vGuid)
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vInt }, { k: new prefabId(1n), v: vInt }]), new prefabId(1n), vInt)
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: new prefabId(1n), v: f.assemblyList([vBool, vBool, vBool], "bool") }]), new prefabId(1n), f.assemblyList([vBool, vBool, vBool], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: new prefabId(1n), v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), new prefabId(1n), f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([e, e, e], "entity") }, { k: new prefabId(1n), v: f.assemblyList([e, e, e], "entity") }]), new prefabId(1n), f.assemblyList([e, e, e], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: new prefabId(1n), v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), new prefabId(1n), f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: new prefabId(1n), v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), new prefabId(1n), f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: new prefabId(1n), v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), new prefabId(1n), f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: new prefabId(1n), v: f.assemblyList([vInt, vInt, vInt], "int") }]), new prefabId(1n), f.assemblyList([vInt, vInt, vInt], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: new prefabId(1n), v: f.assemblyList([vStr, vStr, vStr], "str") }]), new prefabId(1n), f.assemblyList([vStr, vStr, vStr], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: new prefabId(1n), v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), new prefabId(1n), f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: new prefabId(1n) }, { k: new prefabId(1n), v: new prefabId(1n) }]), new prefabId(1n), new prefabId(1n))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vStr }, { k: new prefabId(1n), v: vStr }]), new prefabId(1n), vStr)
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vVec3 }, { k: new prefabId(1n), v: vVec3 }]), new prefabId(1n), vVec3)
  // setOrAddKeyValuePairsToDictionary :: dict<str, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: vBool }, { k: vStr, v: vBool }]), vStr, vBool)
  // setOrAddKeyValuePairsToDictionary :: dict<str, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: vConfig }, { k: vStr, v: vConfig }]), vStr, vConfig)
  // setOrAddKeyValuePairsToDictionary :: dict<str, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: e }, { k: vStr, v: e }]), vStr, e)
  // setOrAddKeyValuePairsToDictionary :: dict<str, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: vFaction }, { k: vStr, v: vFaction }]), vStr, vFaction)
  // setOrAddKeyValuePairsToDictionary :: dict<str, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: vFloat }, { k: vStr, v: vFloat }]), vStr, vFloat)
  // setOrAddKeyValuePairsToDictionary :: dict<str, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: vGuid }, { k: vStr, v: vGuid }]), vStr, vGuid)
  // setOrAddKeyValuePairsToDictionary :: dict<str, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: vInt }, { k: vStr, v: vInt }]), vStr, vInt)
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vStr, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vStr, f.assemblyList([vBool, vBool, vBool], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vStr, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([e, e, e], "entity") }, { k: vStr, v: f.assemblyList([e, e, e], "entity") }]), vStr, f.assemblyList([e, e, e], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vStr, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vStr, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vStr, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vStr, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vStr, f.assemblyList([vInt, vInt, vInt], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vStr, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vStr, f.assemblyList([vStr, vStr, vStr], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vStr, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: new prefabId(1n) }, { k: vStr, v: new prefabId(1n) }]), vStr, new prefabId(1n))
  // setOrAddKeyValuePairsToDictionary :: dict<str, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: vStr }, { k: vStr, v: vStr }]), vStr, vStr)
  // setOrAddKeyValuePairsToDictionary :: dict<str, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: vStr, v: vVec3 }, { k: vStr, v: vVec3 }]), vStr, vVec3)
  // clearDictionary :: dict<configId, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: vBool }, { k: vConfig, v: vBool }]))
  // clearDictionary :: dict<configId, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: vConfig }, { k: vConfig, v: vConfig }]))
  // clearDictionary :: dict<configId, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: e }, { k: vConfig, v: e }]))
  // clearDictionary :: dict<configId, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: vFaction }, { k: vConfig, v: vFaction }]))
  // clearDictionary :: dict<configId, float>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: vFloat }, { k: vConfig, v: vFloat }]))
  // clearDictionary :: dict<configId, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: vGuid }, { k: vConfig, v: vGuid }]))
  // clearDictionary :: dict<configId, int>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: vInt }, { k: vConfig, v: vInt }]))
  // clearDictionary :: dict<configId, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vConfig, v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // clearDictionary :: dict<configId, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vConfig, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // clearDictionary :: dict<configId, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([e, e, e], "entity") }, { k: vConfig, v: f.assemblyList([e, e, e], "entity") }]))
  // clearDictionary :: dict<configId, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vConfig, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // clearDictionary :: dict<configId, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vConfig, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // clearDictionary :: dict<configId, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vConfig, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // clearDictionary :: dict<configId, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vConfig, v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // clearDictionary :: dict<configId, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vConfig, v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // clearDictionary :: dict<configId, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vConfig, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // clearDictionary :: dict<configId, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: new prefabId(1n) }, { k: vConfig, v: new prefabId(1n) }]))
  // clearDictionary :: dict<configId, str>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: vStr }, { k: vConfig, v: vStr }]))
  // clearDictionary :: dict<configId, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: vConfig, v: vVec3 }, { k: vConfig, v: vVec3 }]))
  // clearDictionary :: dict<entity, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: vBool }, { k: e, v: vBool }]))
  // clearDictionary :: dict<entity, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: vConfig }, { k: e, v: vConfig }]))
  // clearDictionary :: dict<entity, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: e }, { k: e, v: e }]))
  // clearDictionary :: dict<entity, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: vFaction }, { k: e, v: vFaction }]))
  // clearDictionary :: dict<entity, float>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: vFloat }, { k: e, v: vFloat }]))
  // clearDictionary :: dict<entity, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: vGuid }, { k: e, v: vGuid }]))
  // clearDictionary :: dict<entity, int>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: vInt }, { k: e, v: vInt }]))
  // clearDictionary :: dict<entity, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: e, v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // clearDictionary :: dict<entity, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: e, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // clearDictionary :: dict<entity, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([e, e, e], "entity") }, { k: e, v: f.assemblyList([e, e, e], "entity") }]))
  // clearDictionary :: dict<entity, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: e, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // clearDictionary :: dict<entity, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: e, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // clearDictionary :: dict<entity, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: e, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // clearDictionary :: dict<entity, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: e, v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // clearDictionary :: dict<entity, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: e, v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // clearDictionary :: dict<entity, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: e, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // clearDictionary :: dict<entity, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: new prefabId(1n) }, { k: e, v: new prefabId(1n) }]))
  // clearDictionary :: dict<entity, str>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: vStr }, { k: e, v: vStr }]))
  // clearDictionary :: dict<entity, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: e, v: vVec3 }, { k: e, v: vVec3 }]))
  // clearDictionary :: dict<faction, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: vBool }, { k: vFaction, v: vBool }]))
  // clearDictionary :: dict<faction, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: vConfig }, { k: vFaction, v: vConfig }]))
  // clearDictionary :: dict<faction, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: e }, { k: vFaction, v: e }]))
  // clearDictionary :: dict<faction, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: vFaction }, { k: vFaction, v: vFaction }]))
  // clearDictionary :: dict<faction, float>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: vFloat }, { k: vFaction, v: vFloat }]))
  // clearDictionary :: dict<faction, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: vGuid }, { k: vFaction, v: vGuid }]))
  // clearDictionary :: dict<faction, int>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: vInt }, { k: vFaction, v: vInt }]))
  // clearDictionary :: dict<faction, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vFaction, v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // clearDictionary :: dict<faction, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vFaction, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // clearDictionary :: dict<faction, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([e, e, e], "entity") }, { k: vFaction, v: f.assemblyList([e, e, e], "entity") }]))
  // clearDictionary :: dict<faction, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vFaction, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // clearDictionary :: dict<faction, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vFaction, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // clearDictionary :: dict<faction, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vFaction, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // clearDictionary :: dict<faction, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vFaction, v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // clearDictionary :: dict<faction, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vFaction, v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // clearDictionary :: dict<faction, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vFaction, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // clearDictionary :: dict<faction, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: new prefabId(1n) }, { k: vFaction, v: new prefabId(1n) }]))
  // clearDictionary :: dict<faction, str>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: vStr }, { k: vFaction, v: vStr }]))
  // clearDictionary :: dict<faction, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: vFaction, v: vVec3 }, { k: vFaction, v: vVec3 }]))
  // clearDictionary :: dict<guid, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: vBool }, { k: vGuid, v: vBool }]))
  // clearDictionary :: dict<guid, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: vConfig }, { k: vGuid, v: vConfig }]))
  // clearDictionary :: dict<guid, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: e }, { k: vGuid, v: e }]))
  // clearDictionary :: dict<guid, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: vFaction }, { k: vGuid, v: vFaction }]))
  // clearDictionary :: dict<guid, float>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: vFloat }, { k: vGuid, v: vFloat }]))
  // clearDictionary :: dict<guid, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: vGuid }, { k: vGuid, v: vGuid }]))
  // clearDictionary :: dict<guid, int>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: vInt }, { k: vGuid, v: vInt }]))
  // clearDictionary :: dict<guid, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vGuid, v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // clearDictionary :: dict<guid, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vGuid, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // clearDictionary :: dict<guid, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([e, e, e], "entity") }, { k: vGuid, v: f.assemblyList([e, e, e], "entity") }]))
  // clearDictionary :: dict<guid, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vGuid, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // clearDictionary :: dict<guid, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vGuid, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // clearDictionary :: dict<guid, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vGuid, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // clearDictionary :: dict<guid, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vGuid, v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // clearDictionary :: dict<guid, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vGuid, v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // clearDictionary :: dict<guid, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vGuid, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // clearDictionary :: dict<guid, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: new prefabId(1n) }, { k: vGuid, v: new prefabId(1n) }]))
  // clearDictionary :: dict<guid, str>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: vStr }, { k: vGuid, v: vStr }]))
  // clearDictionary :: dict<guid, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: vGuid, v: vVec3 }, { k: vGuid, v: vVec3 }]))
  // clearDictionary :: dict<int, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: vBool }, { k: vInt, v: vBool }]))
  // clearDictionary :: dict<int, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: vConfig }, { k: vInt, v: vConfig }]))
  // clearDictionary :: dict<int, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: e }, { k: vInt, v: e }]))
  // clearDictionary :: dict<int, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: vFaction }, { k: vInt, v: vFaction }]))
  // clearDictionary :: dict<int, float>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: vFloat }, { k: vInt, v: vFloat }]))
  // clearDictionary :: dict<int, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: vGuid }, { k: vInt, v: vGuid }]))
  // clearDictionary :: dict<int, int>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }]))
  // clearDictionary :: dict<int, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vInt, v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // clearDictionary :: dict<int, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vInt, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // clearDictionary :: dict<int, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([e, e, e], "entity") }, { k: vInt, v: f.assemblyList([e, e, e], "entity") }]))
  // clearDictionary :: dict<int, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vInt, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // clearDictionary :: dict<int, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vInt, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // clearDictionary :: dict<int, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vInt, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // clearDictionary :: dict<int, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vInt, v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // clearDictionary :: dict<int, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vInt, v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // clearDictionary :: dict<int, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vInt, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // clearDictionary :: dict<int, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: new prefabId(1n) }, { k: vInt, v: new prefabId(1n) }]))
  // clearDictionary :: dict<int, str>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: vStr }, { k: vInt, v: vStr }]))
  // clearDictionary :: dict<int, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: vInt, v: vVec3 }, { k: vInt, v: vVec3 }]))
  // clearDictionary :: dict<prefabId, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vBool }, { k: new prefabId(1n), v: vBool }]))
  // clearDictionary :: dict<prefabId, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vConfig }, { k: new prefabId(1n), v: vConfig }]))
  // clearDictionary :: dict<prefabId, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: e }, { k: new prefabId(1n), v: e }]))
  // clearDictionary :: dict<prefabId, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vFaction }, { k: new prefabId(1n), v: vFaction }]))
  // clearDictionary :: dict<prefabId, float>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vFloat }, { k: new prefabId(1n), v: vFloat }]))
  // clearDictionary :: dict<prefabId, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vGuid }, { k: new prefabId(1n), v: vGuid }]))
  // clearDictionary :: dict<prefabId, int>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vInt }, { k: new prefabId(1n), v: vInt }]))
  // clearDictionary :: dict<prefabId, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: new prefabId(1n), v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // clearDictionary :: dict<prefabId, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: new prefabId(1n), v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // clearDictionary :: dict<prefabId, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([e, e, e], "entity") }, { k: new prefabId(1n), v: f.assemblyList([e, e, e], "entity") }]))
  // clearDictionary :: dict<prefabId, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: new prefabId(1n), v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // clearDictionary :: dict<prefabId, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: new prefabId(1n), v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // clearDictionary :: dict<prefabId, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: new prefabId(1n), v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // clearDictionary :: dict<prefabId, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: new prefabId(1n), v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // clearDictionary :: dict<prefabId, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: new prefabId(1n), v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // clearDictionary :: dict<prefabId, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: new prefabId(1n), v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // clearDictionary :: dict<prefabId, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: new prefabId(1n) }, { k: new prefabId(1n), v: new prefabId(1n) }]))
  // clearDictionary :: dict<prefabId, str>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vStr }, { k: new prefabId(1n), v: vStr }]))
  // clearDictionary :: dict<prefabId, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vVec3 }, { k: new prefabId(1n), v: vVec3 }]))
  // clearDictionary :: dict<str, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: vBool }, { k: vStr, v: vBool }]))
  // clearDictionary :: dict<str, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: vConfig }, { k: vStr, v: vConfig }]))
  // clearDictionary :: dict<str, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: e }, { k: vStr, v: e }]))
  // clearDictionary :: dict<str, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: vFaction }, { k: vStr, v: vFaction }]))
  // clearDictionary :: dict<str, float>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: vFloat }, { k: vStr, v: vFloat }]))
  // clearDictionary :: dict<str, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: vGuid }, { k: vStr, v: vGuid }]))
  // clearDictionary :: dict<str, int>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: vInt }, { k: vStr, v: vInt }]))
  // clearDictionary :: dict<str, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vStr, v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // clearDictionary :: dict<str, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vStr, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // clearDictionary :: dict<str, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([e, e, e], "entity") }, { k: vStr, v: f.assemblyList([e, e, e], "entity") }]))
  // clearDictionary :: dict<str, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vStr, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // clearDictionary :: dict<str, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vStr, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // clearDictionary :: dict<str, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vStr, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // clearDictionary :: dict<str, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vStr, v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // clearDictionary :: dict<str, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vStr, v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // clearDictionary :: dict<str, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vStr, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // clearDictionary :: dict<str, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: new prefabId(1n) }, { k: vStr, v: new prefabId(1n) }]))
  // clearDictionary :: dict<str, str>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: vStr }, { k: vStr, v: vStr }]))
  // clearDictionary :: dict<str, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: vStr, v: vVec3 }, { k: vStr, v: vVec3 }]))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: vBool }, { k: vConfig, v: vBool }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: vConfig }, { k: vConfig, v: vConfig }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: e }, { k: vConfig, v: e }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: vFaction }, { k: vConfig, v: vFaction }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: vFloat }, { k: vConfig, v: vFloat }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: vGuid }, { k: vConfig, v: vGuid }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: vInt }, { k: vConfig, v: vInt }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vConfig, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vConfig, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([e, e, e], "entity") }, { k: vConfig, v: f.assemblyList([e, e, e], "entity") }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vConfig, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vConfig, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vConfig, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vConfig, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vConfig, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vConfig, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: new prefabId(1n) }, { k: vConfig, v: new prefabId(1n) }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: vStr }, { k: vConfig, v: vStr }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vConfig, v: vVec3 }, { k: vConfig, v: vVec3 }]), vConfig)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: vBool }, { k: e, v: vBool }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: vConfig }, { k: e, v: vConfig }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: e }, { k: e, v: e }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: vFaction }, { k: e, v: vFaction }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: vFloat }, { k: e, v: vFloat }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: vGuid }, { k: e, v: vGuid }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: vInt }, { k: e, v: vInt }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: e, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: e, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([e, e, e], "entity") }, { k: e, v: f.assemblyList([e, e, e], "entity") }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: e, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: e, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: e, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: e, v: f.assemblyList([vInt, vInt, vInt], "int") }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: e, v: f.assemblyList([vStr, vStr, vStr], "str") }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: e, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: new prefabId(1n) }, { k: e, v: new prefabId(1n) }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: vStr }, { k: e, v: vStr }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: e, v: vVec3 }, { k: e, v: vVec3 }]), e)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: vBool }, { k: vFaction, v: vBool }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: vConfig }, { k: vFaction, v: vConfig }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: e }, { k: vFaction, v: e }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: vFaction }, { k: vFaction, v: vFaction }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: vFloat }, { k: vFaction, v: vFloat }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: vGuid }, { k: vFaction, v: vGuid }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: vInt }, { k: vFaction, v: vInt }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vFaction, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vFaction, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([e, e, e], "entity") }, { k: vFaction, v: f.assemblyList([e, e, e], "entity") }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vFaction, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vFaction, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vFaction, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vFaction, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vFaction, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vFaction, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: new prefabId(1n) }, { k: vFaction, v: new prefabId(1n) }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: vStr }, { k: vFaction, v: vStr }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vFaction, v: vVec3 }, { k: vFaction, v: vVec3 }]), vFaction)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: vBool }, { k: vGuid, v: vBool }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: vConfig }, { k: vGuid, v: vConfig }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: e }, { k: vGuid, v: e }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: vFaction }, { k: vGuid, v: vFaction }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: vFloat }, { k: vGuid, v: vFloat }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: vGuid }, { k: vGuid, v: vGuid }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: vInt }, { k: vGuid, v: vInt }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vGuid, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vGuid, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([e, e, e], "entity") }, { k: vGuid, v: f.assemblyList([e, e, e], "entity") }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vGuid, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vGuid, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vGuid, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vGuid, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vGuid, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vGuid, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: new prefabId(1n) }, { k: vGuid, v: new prefabId(1n) }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: vStr }, { k: vGuid, v: vStr }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vGuid, v: vVec3 }, { k: vGuid, v: vVec3 }]), vGuid)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vBool }, { k: vInt, v: vBool }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vConfig }, { k: vInt, v: vConfig }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: e }, { k: vInt, v: e }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vFaction }, { k: vInt, v: vFaction }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vFloat }, { k: vInt, v: vFloat }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vGuid }, { k: vInt, v: vGuid }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vInt, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vInt, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([e, e, e], "entity") }, { k: vInt, v: f.assemblyList([e, e, e], "entity") }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vInt, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vInt, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vInt, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vInt, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vInt, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vInt, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: new prefabId(1n) }, { k: vInt, v: new prefabId(1n) }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vStr }, { k: vInt, v: vStr }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vInt, v: vVec3 }, { k: vInt, v: vVec3 }]), vInt)
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vBool }, { k: new prefabId(1n), v: vBool }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vConfig }, { k: new prefabId(1n), v: vConfig }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: e }, { k: new prefabId(1n), v: e }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vFaction }, { k: new prefabId(1n), v: vFaction }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vFloat }, { k: new prefabId(1n), v: vFloat }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vGuid }, { k: new prefabId(1n), v: vGuid }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vInt }, { k: new prefabId(1n), v: vInt }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: new prefabId(1n), v: f.assemblyList([vBool, vBool, vBool], "bool") }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: new prefabId(1n), v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([e, e, e], "entity") }, { k: new prefabId(1n), v: f.assemblyList([e, e, e], "entity") }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: new prefabId(1n), v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: new prefabId(1n), v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: new prefabId(1n), v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: new prefabId(1n), v: f.assemblyList([vInt, vInt, vInt], "int") }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: new prefabId(1n), v: f.assemblyList([vStr, vStr, vStr], "str") }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: new prefabId(1n), v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: new prefabId(1n) }, { k: new prefabId(1n), v: new prefabId(1n) }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vStr }, { k: new prefabId(1n), v: vStr }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vVec3 }, { k: new prefabId(1n), v: vVec3 }]), new prefabId(1n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: vBool }, { k: vStr, v: vBool }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: vConfig }, { k: vStr, v: vConfig }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: e }, { k: vStr, v: e }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: vFaction }, { k: vStr, v: vFaction }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: vFloat }, { k: vStr, v: vFloat }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: vGuid }, { k: vStr, v: vGuid }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: vInt }, { k: vStr, v: vInt }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vStr, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vStr, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([e, e, e], "entity") }, { k: vStr, v: f.assemblyList([e, e, e], "entity") }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vStr, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vStr, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vStr, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vStr, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vStr, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vStr, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: new prefabId(1n) }, { k: vStr, v: new prefabId(1n) }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: vStr }, { k: vStr, v: vStr }]), vStr)
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: vStr, v: vVec3 }, { k: vStr, v: vVec3 }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: vBool }, { k: vConfig, v: vBool }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: vConfig }, { k: vConfig, v: vConfig }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: e }, { k: vConfig, v: e }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: vFaction }, { k: vConfig, v: vFaction }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: vFloat }, { k: vConfig, v: vFloat }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: vGuid }, { k: vConfig, v: vGuid }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: vInt }, { k: vConfig, v: vInt }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vConfig, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vConfig, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([e, e, e], "entity") }, { k: vConfig, v: f.assemblyList([e, e, e], "entity") }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vConfig, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vConfig, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vConfig, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vConfig, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vConfig, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vConfig, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: new prefabId(1n) }, { k: vConfig, v: new prefabId(1n) }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: vStr }, { k: vConfig, v: vStr }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<configId, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vConfig, v: vVec3 }, { k: vConfig, v: vVec3 }]), vConfig)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: vBool }, { k: e, v: vBool }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: vConfig }, { k: e, v: vConfig }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: e }, { k: e, v: e }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: vFaction }, { k: e, v: vFaction }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: vFloat }, { k: e, v: vFloat }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: vGuid }, { k: e, v: vGuid }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: vInt }, { k: e, v: vInt }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: e, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: e, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([e, e, e], "entity") }, { k: e, v: f.assemblyList([e, e, e], "entity") }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: e, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: e, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: e, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: e, v: f.assemblyList([vInt, vInt, vInt], "int") }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: e, v: f.assemblyList([vStr, vStr, vStr], "str") }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: e, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: new prefabId(1n) }, { k: e, v: new prefabId(1n) }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: vStr }, { k: e, v: vStr }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<entity, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: e, v: vVec3 }, { k: e, v: vVec3 }]), e)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: vBool }, { k: vFaction, v: vBool }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: vConfig }, { k: vFaction, v: vConfig }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: e }, { k: vFaction, v: e }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: vFaction }, { k: vFaction, v: vFaction }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: vFloat }, { k: vFaction, v: vFloat }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: vGuid }, { k: vFaction, v: vGuid }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: vInt }, { k: vFaction, v: vInt }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vFaction, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vFaction, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([e, e, e], "entity") }, { k: vFaction, v: f.assemblyList([e, e, e], "entity") }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vFaction, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vFaction, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vFaction, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vFaction, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vFaction, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vFaction, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: new prefabId(1n) }, { k: vFaction, v: new prefabId(1n) }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: vStr }, { k: vFaction, v: vStr }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<faction, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vFaction, v: vVec3 }, { k: vFaction, v: vVec3 }]), vFaction)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: vBool }, { k: vGuid, v: vBool }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: vConfig }, { k: vGuid, v: vConfig }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: e }, { k: vGuid, v: e }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: vFaction }, { k: vGuid, v: vFaction }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: vFloat }, { k: vGuid, v: vFloat }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: vGuid }, { k: vGuid, v: vGuid }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: vInt }, { k: vGuid, v: vInt }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vGuid, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vGuid, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([e, e, e], "entity") }, { k: vGuid, v: f.assemblyList([e, e, e], "entity") }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vGuid, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vGuid, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vGuid, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vGuid, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vGuid, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vGuid, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: new prefabId(1n) }, { k: vGuid, v: new prefabId(1n) }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: vStr }, { k: vGuid, v: vStr }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<guid, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vGuid, v: vVec3 }, { k: vGuid, v: vVec3 }]), vGuid)
  // queryIfDictionaryContainsSpecificKey :: dict<int, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: vBool }, { k: vInt, v: vBool }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: vConfig }, { k: vInt, v: vConfig }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: e }, { k: vInt, v: e }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: vFaction }, { k: vInt, v: vFaction }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: vFloat }, { k: vInt, v: vFloat }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: vGuid }, { k: vInt, v: vGuid }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vInt, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vInt, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([e, e, e], "entity") }, { k: vInt, v: f.assemblyList([e, e, e], "entity") }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vInt, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vInt, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vInt, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vInt, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vInt, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vInt, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: new prefabId(1n) }, { k: vInt, v: new prefabId(1n) }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: vStr }, { k: vInt, v: vStr }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<int, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vInt, v: vVec3 }, { k: vInt, v: vVec3 }]), vInt)
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vBool }, { k: new prefabId(1n), v: vBool }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vConfig }, { k: new prefabId(1n), v: vConfig }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: e }, { k: new prefabId(1n), v: e }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vFaction }, { k: new prefabId(1n), v: vFaction }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vFloat }, { k: new prefabId(1n), v: vFloat }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vGuid }, { k: new prefabId(1n), v: vGuid }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vInt }, { k: new prefabId(1n), v: vInt }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: new prefabId(1n), v: f.assemblyList([vBool, vBool, vBool], "bool") }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: new prefabId(1n), v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([e, e, e], "entity") }, { k: new prefabId(1n), v: f.assemblyList([e, e, e], "entity") }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: new prefabId(1n), v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: new prefabId(1n), v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: new prefabId(1n), v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: new prefabId(1n), v: f.assemblyList([vInt, vInt, vInt], "int") }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: new prefabId(1n), v: f.assemblyList([vStr, vStr, vStr], "str") }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: new prefabId(1n), v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: new prefabId(1n) }, { k: new prefabId(1n), v: new prefabId(1n) }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vStr }, { k: new prefabId(1n), v: vStr }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(1n), v: vVec3 }, { k: new prefabId(1n), v: vVec3 }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificKey :: dict<str, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: vBool }, { k: vStr, v: vBool }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: vConfig }, { k: vStr, v: vConfig }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: e }, { k: vStr, v: e }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: vFaction }, { k: vStr, v: vFaction }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: vFloat }, { k: vStr, v: vFloat }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: vGuid }, { k: vStr, v: vGuid }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: vInt }, { k: vStr, v: vInt }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vStr, v: f.assemblyList([vBool, vBool, vBool], "bool") }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vStr, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([e, e, e], "entity") }, { k: vStr, v: f.assemblyList([e, e, e], "entity") }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vStr, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vStr, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vStr, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vStr, v: f.assemblyList([vInt, vInt, vInt], "int") }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vStr, v: f.assemblyList([vStr, vStr, vStr], "str") }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vStr, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: new prefabId(1n) }, { k: vStr, v: new prefabId(1n) }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: vStr }, { k: vStr, v: vStr }]), vStr)
  // queryIfDictionaryContainsSpecificKey :: dict<str, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: vStr, v: vVec3 }, { k: vStr, v: vVec3 }]), vStr)
  // getListOfKeysFromDictionary :: dict<configId, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vBool }, { k: vConfig, v: vBool }]))
  // getListOfKeysFromDictionary :: dict<configId, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vConfig }, { k: vConfig, v: vConfig }]))
  // getListOfKeysFromDictionary :: dict<configId, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: e }, { k: vConfig, v: e }]))
  // getListOfKeysFromDictionary :: dict<configId, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vFaction }, { k: vConfig, v: vFaction }]))
  // getListOfKeysFromDictionary :: dict<configId, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vFloat }, { k: vConfig, v: vFloat }]))
  // getListOfKeysFromDictionary :: dict<configId, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vGuid }, { k: vConfig, v: vGuid }]))
  // getListOfKeysFromDictionary :: dict<configId, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vInt }, { k: vConfig, v: vInt }]))
  // getListOfKeysFromDictionary :: dict<configId, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vConfig, v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vConfig, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([e, e, e], "entity") }, { k: vConfig, v: f.assemblyList([e, e, e], "entity") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vConfig, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vConfig, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vConfig, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vConfig, v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vConfig, v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vConfig, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<configId, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: new prefabId(1n) }, { k: vConfig, v: new prefabId(1n) }]))
  // getListOfKeysFromDictionary :: dict<configId, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vStr }, { k: vConfig, v: vStr }]))
  // getListOfKeysFromDictionary :: dict<configId, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vVec3 }, { k: vConfig, v: vVec3 }]))
  // getListOfKeysFromDictionary :: dict<entity, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: vBool }, { k: e, v: vBool }]))
  // getListOfKeysFromDictionary :: dict<entity, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: vConfig }, { k: e, v: vConfig }]))
  // getListOfKeysFromDictionary :: dict<entity, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: e }, { k: e, v: e }]))
  // getListOfKeysFromDictionary :: dict<entity, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: vFaction }, { k: e, v: vFaction }]))
  // getListOfKeysFromDictionary :: dict<entity, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: vFloat }, { k: e, v: vFloat }]))
  // getListOfKeysFromDictionary :: dict<entity, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: vGuid }, { k: e, v: vGuid }]))
  // getListOfKeysFromDictionary :: dict<entity, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: vInt }, { k: e, v: vInt }]))
  // getListOfKeysFromDictionary :: dict<entity, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: e, v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: e, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([e, e, e], "entity") }, { k: e, v: f.assemblyList([e, e, e], "entity") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: e, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: e, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: e, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: e, v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: e, v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: e, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<entity, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: new prefabId(1n) }, { k: e, v: new prefabId(1n) }]))
  // getListOfKeysFromDictionary :: dict<entity, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: vStr }, { k: e, v: vStr }]))
  // getListOfKeysFromDictionary :: dict<entity, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: e, v: vVec3 }, { k: e, v: vVec3 }]))
  // getListOfKeysFromDictionary :: dict<faction, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vBool }, { k: vFaction, v: vBool }]))
  // getListOfKeysFromDictionary :: dict<faction, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vConfig }, { k: vFaction, v: vConfig }]))
  // getListOfKeysFromDictionary :: dict<faction, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: e }, { k: vFaction, v: e }]))
  // getListOfKeysFromDictionary :: dict<faction, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vFaction }, { k: vFaction, v: vFaction }]))
  // getListOfKeysFromDictionary :: dict<faction, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vFloat }, { k: vFaction, v: vFloat }]))
  // getListOfKeysFromDictionary :: dict<faction, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vGuid }, { k: vFaction, v: vGuid }]))
  // getListOfKeysFromDictionary :: dict<faction, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vInt }, { k: vFaction, v: vInt }]))
  // getListOfKeysFromDictionary :: dict<faction, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vFaction, v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vFaction, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([e, e, e], "entity") }, { k: vFaction, v: f.assemblyList([e, e, e], "entity") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vFaction, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vFaction, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vFaction, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vFaction, v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vFaction, v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vFaction, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<faction, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: new prefabId(1n) }, { k: vFaction, v: new prefabId(1n) }]))
  // getListOfKeysFromDictionary :: dict<faction, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vStr }, { k: vFaction, v: vStr }]))
  // getListOfKeysFromDictionary :: dict<faction, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vVec3 }, { k: vFaction, v: vVec3 }]))
  // getListOfKeysFromDictionary :: dict<guid, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vBool }, { k: vGuid, v: vBool }]))
  // getListOfKeysFromDictionary :: dict<guid, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vConfig }, { k: vGuid, v: vConfig }]))
  // getListOfKeysFromDictionary :: dict<guid, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: e }, { k: vGuid, v: e }]))
  // getListOfKeysFromDictionary :: dict<guid, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vFaction }, { k: vGuid, v: vFaction }]))
  // getListOfKeysFromDictionary :: dict<guid, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vFloat }, { k: vGuid, v: vFloat }]))
  // getListOfKeysFromDictionary :: dict<guid, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vGuid }, { k: vGuid, v: vGuid }]))
  // getListOfKeysFromDictionary :: dict<guid, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vInt }, { k: vGuid, v: vInt }]))
  // getListOfKeysFromDictionary :: dict<guid, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vGuid, v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vGuid, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([e, e, e], "entity") }, { k: vGuid, v: f.assemblyList([e, e, e], "entity") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vGuid, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vGuid, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vGuid, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vGuid, v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vGuid, v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vGuid, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<guid, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: new prefabId(1n) }, { k: vGuid, v: new prefabId(1n) }]))
  // getListOfKeysFromDictionary :: dict<guid, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vStr }, { k: vGuid, v: vStr }]))
  // getListOfKeysFromDictionary :: dict<guid, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vVec3 }, { k: vGuid, v: vVec3 }]))
  // getListOfKeysFromDictionary :: dict<int, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: vBool }, { k: vInt, v: vBool }]))
  // getListOfKeysFromDictionary :: dict<int, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: vConfig }, { k: vInt, v: vConfig }]))
  // getListOfKeysFromDictionary :: dict<int, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: e }, { k: vInt, v: e }]))
  // getListOfKeysFromDictionary :: dict<int, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: vFaction }, { k: vInt, v: vFaction }]))
  // getListOfKeysFromDictionary :: dict<int, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: vFloat }, { k: vInt, v: vFloat }]))
  // getListOfKeysFromDictionary :: dict<int, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: vGuid }, { k: vInt, v: vGuid }]))
  // getListOfKeysFromDictionary :: dict<int, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }]))
  // getListOfKeysFromDictionary :: dict<int, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vInt, v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // getListOfKeysFromDictionary :: dict<int, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vInt, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<int, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([e, e, e], "entity") }, { k: vInt, v: f.assemblyList([e, e, e], "entity") }]))
  // getListOfKeysFromDictionary :: dict<int, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vInt, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // getListOfKeysFromDictionary :: dict<int, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vInt, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // getListOfKeysFromDictionary :: dict<int, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vInt, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // getListOfKeysFromDictionary :: dict<int, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vInt, v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // getListOfKeysFromDictionary :: dict<int, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vInt, v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // getListOfKeysFromDictionary :: dict<int, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vInt, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<int, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: new prefabId(1n) }, { k: vInt, v: new prefabId(1n) }]))
  // getListOfKeysFromDictionary :: dict<int, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: vStr }, { k: vInt, v: vStr }]))
  // getListOfKeysFromDictionary :: dict<int, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vInt, v: vVec3 }, { k: vInt, v: vVec3 }]))
  // getListOfKeysFromDictionary :: dict<prefabId, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vBool }, { k: new prefabId(1n), v: vBool }]))
  // getListOfKeysFromDictionary :: dict<prefabId, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vConfig }, { k: new prefabId(1n), v: vConfig }]))
  // getListOfKeysFromDictionary :: dict<prefabId, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: e }, { k: new prefabId(1n), v: e }]))
  // getListOfKeysFromDictionary :: dict<prefabId, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vFaction }, { k: new prefabId(1n), v: vFaction }]))
  // getListOfKeysFromDictionary :: dict<prefabId, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vFloat }, { k: new prefabId(1n), v: vFloat }]))
  // getListOfKeysFromDictionary :: dict<prefabId, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vGuid }, { k: new prefabId(1n), v: vGuid }]))
  // getListOfKeysFromDictionary :: dict<prefabId, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vInt }, { k: new prefabId(1n), v: vInt }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: new prefabId(1n), v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: new prefabId(1n), v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([e, e, e], "entity") }, { k: new prefabId(1n), v: f.assemblyList([e, e, e], "entity") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: new prefabId(1n), v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: new prefabId(1n), v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: new prefabId(1n), v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: new prefabId(1n), v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: new prefabId(1n), v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: new prefabId(1n), v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: new prefabId(1n) }, { k: new prefabId(1n), v: new prefabId(1n) }]))
  // getListOfKeysFromDictionary :: dict<prefabId, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vStr }, { k: new prefabId(1n), v: vStr }]))
  // getListOfKeysFromDictionary :: dict<prefabId, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vVec3 }, { k: new prefabId(1n), v: vVec3 }]))
  // getListOfKeysFromDictionary :: dict<str, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: vBool }, { k: vStr, v: vBool }]))
  // getListOfKeysFromDictionary :: dict<str, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: vConfig }, { k: vStr, v: vConfig }]))
  // getListOfKeysFromDictionary :: dict<str, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: e }, { k: vStr, v: e }]))
  // getListOfKeysFromDictionary :: dict<str, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: vFaction }, { k: vStr, v: vFaction }]))
  // getListOfKeysFromDictionary :: dict<str, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: vFloat }, { k: vStr, v: vFloat }]))
  // getListOfKeysFromDictionary :: dict<str, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: vGuid }, { k: vStr, v: vGuid }]))
  // getListOfKeysFromDictionary :: dict<str, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: vInt }, { k: vStr, v: vInt }]))
  // getListOfKeysFromDictionary :: dict<str, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vBool, vBool, vBool], "bool") }, { k: vStr, v: f.assemblyList([vBool, vBool, vBool], "bool") }]))
  // getListOfKeysFromDictionary :: dict<str, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }, { k: vStr, v: f.assemblyList([vConfig, vConfig, vConfig], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<str, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([e, e, e], "entity") }, { k: vStr, v: f.assemblyList([e, e, e], "entity") }]))
  // getListOfKeysFromDictionary :: dict<str, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }, { k: vStr, v: f.assemblyList([vFaction, vFaction, vFaction], "faction") }]))
  // getListOfKeysFromDictionary :: dict<str, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }, { k: vStr, v: f.assemblyList([vFloat, vFloat, vFloat], "float") }]))
  // getListOfKeysFromDictionary :: dict<str, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }, { k: vStr, v: f.assemblyList([vGuid, vGuid, vGuid], "guid") }]))
  // getListOfKeysFromDictionary :: dict<str, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vInt, vInt, vInt], "int") }, { k: vStr, v: f.assemblyList([vInt, vInt, vInt], "int") }]))
  // getListOfKeysFromDictionary :: dict<str, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vStr, vStr, vStr], "str") }, { k: vStr, v: f.assemblyList([vStr, vStr, vStr], "str") }]))
  // getListOfKeysFromDictionary :: dict<str, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }, { k: vStr, v: f.assemblyList([vVec3, vVec3, vVec3], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<str, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: new prefabId(1n) }, { k: vStr, v: new prefabId(1n) }]))
  // getListOfKeysFromDictionary :: dict<str, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: vStr }, { k: vStr, v: vStr }]))
  // getListOfKeysFromDictionary :: dict<str, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: vStr, v: vVec3 }, { k: vStr, v: vVec3 }]))
})

