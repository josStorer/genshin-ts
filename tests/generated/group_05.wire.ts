import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_05 (wire)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741834 }).on('whenEntityIsCreated', (_evt, f) => {
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
  // createDictionary :: dict<configId, bool>
  f.createDictionary(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), f.assemblyList([vBool, vBool, vBool], "bool"))
  // createDictionary :: dict<configId, configId>
  f.createDictionary(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // createDictionary :: dict<configId, entity>
  f.createDictionary(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), f.assemblyList([e, e, e], "entity"))
  // createDictionary :: dict<configId, faction>
  f.createDictionary(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // createDictionary :: dict<configId, float>
  f.createDictionary(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // createDictionary :: dict<configId, guid>
  f.createDictionary(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // createDictionary :: dict<configId, int>
  f.createDictionary(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), f.assemblyList([vInt, vInt, vInt], "int"))
  // createDictionary :: dict<configId, prefabId>
  f.createDictionary(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"))
  // createDictionary :: dict<configId, str>
  f.createDictionary(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), f.assemblyList([vStr, vStr, vStr], "str"))
  // createDictionary :: dict<configId, vec3>
  f.createDictionary(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // createDictionary :: dict<entity, bool>
  f.createDictionary(f.assemblyList([e, e, e], "entity"), f.assemblyList([vBool, vBool, vBool], "bool"))
  // createDictionary :: dict<entity, configId>
  f.createDictionary(f.assemblyList([e, e, e], "entity"), f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // createDictionary :: dict<entity, entity>
  f.createDictionary(f.assemblyList([e, e, e], "entity"), f.assemblyList([e, e, e], "entity"))
  // createDictionary :: dict<entity, faction>
  f.createDictionary(f.assemblyList([e, e, e], "entity"), f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // createDictionary :: dict<entity, float>
  f.createDictionary(f.assemblyList([e, e, e], "entity"), f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // createDictionary :: dict<entity, guid>
  f.createDictionary(f.assemblyList([e, e, e], "entity"), f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // createDictionary :: dict<entity, int>
  f.createDictionary(f.assemblyList([e, e, e], "entity"), f.assemblyList([vInt, vInt, vInt], "int"))
  // createDictionary :: dict<entity, prefabId>
  f.createDictionary(f.assemblyList([e, e, e], "entity"), f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"))
  // createDictionary :: dict<entity, str>
  f.createDictionary(f.assemblyList([e, e, e], "entity"), f.assemblyList([vStr, vStr, vStr], "str"))
  // createDictionary :: dict<entity, vec3>
  f.createDictionary(f.assemblyList([e, e, e], "entity"), f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // createDictionary :: dict<faction, bool>
  f.createDictionary(f.assemblyList([vFaction, vFaction, vFaction], "faction"), f.assemblyList([vBool, vBool, vBool], "bool"))
  // createDictionary :: dict<faction, configId>
  f.createDictionary(f.assemblyList([vFaction, vFaction, vFaction], "faction"), f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // createDictionary :: dict<faction, entity>
  f.createDictionary(f.assemblyList([vFaction, vFaction, vFaction], "faction"), f.assemblyList([e, e, e], "entity"))
  // createDictionary :: dict<faction, faction>
  f.createDictionary(f.assemblyList([vFaction, vFaction, vFaction], "faction"), f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // createDictionary :: dict<faction, float>
  f.createDictionary(f.assemblyList([vFaction, vFaction, vFaction], "faction"), f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // createDictionary :: dict<faction, guid>
  f.createDictionary(f.assemblyList([vFaction, vFaction, vFaction], "faction"), f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // createDictionary :: dict<faction, int>
  f.createDictionary(f.assemblyList([vFaction, vFaction, vFaction], "faction"), f.assemblyList([vInt, vInt, vInt], "int"))
  // createDictionary :: dict<faction, prefabId>
  f.createDictionary(f.assemblyList([vFaction, vFaction, vFaction], "faction"), f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"))
  // createDictionary :: dict<faction, str>
  f.createDictionary(f.assemblyList([vFaction, vFaction, vFaction], "faction"), f.assemblyList([vStr, vStr, vStr], "str"))
  // createDictionary :: dict<faction, vec3>
  f.createDictionary(f.assemblyList([vFaction, vFaction, vFaction], "faction"), f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // createDictionary :: dict<guid, bool>
  f.createDictionary(f.assemblyList([vGuid, vGuid, vGuid], "guid"), f.assemblyList([vBool, vBool, vBool], "bool"))
  // createDictionary :: dict<guid, configId>
  f.createDictionary(f.assemblyList([vGuid, vGuid, vGuid], "guid"), f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // createDictionary :: dict<guid, entity>
  f.createDictionary(f.assemblyList([vGuid, vGuid, vGuid], "guid"), f.assemblyList([e, e, e], "entity"))
  // createDictionary :: dict<guid, faction>
  f.createDictionary(f.assemblyList([vGuid, vGuid, vGuid], "guid"), f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // createDictionary :: dict<guid, float>
  f.createDictionary(f.assemblyList([vGuid, vGuid, vGuid], "guid"), f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // createDictionary :: dict<guid, guid>
  f.createDictionary(f.assemblyList([vGuid, vGuid, vGuid], "guid"), f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // createDictionary :: dict<guid, int>
  f.createDictionary(f.assemblyList([vGuid, vGuid, vGuid], "guid"), f.assemblyList([vInt, vInt, vInt], "int"))
  // createDictionary :: dict<guid, prefabId>
  f.createDictionary(f.assemblyList([vGuid, vGuid, vGuid], "guid"), f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"))
  // createDictionary :: dict<guid, str>
  f.createDictionary(f.assemblyList([vGuid, vGuid, vGuid], "guid"), f.assemblyList([vStr, vStr, vStr], "str"))
  // createDictionary :: dict<guid, vec3>
  f.createDictionary(f.assemblyList([vGuid, vGuid, vGuid], "guid"), f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // createDictionary :: dict<int, bool>
  f.createDictionary(f.assemblyList([vInt, vInt, vInt], "int"), f.assemblyList([vBool, vBool, vBool], "bool"))
  // createDictionary :: dict<int, configId>
  f.createDictionary(f.assemblyList([vInt, vInt, vInt], "int"), f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // createDictionary :: dict<int, entity>
  f.createDictionary(f.assemblyList([vInt, vInt, vInt], "int"), f.assemblyList([e, e, e], "entity"))
  // createDictionary :: dict<int, faction>
  f.createDictionary(f.assemblyList([vInt, vInt, vInt], "int"), f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // createDictionary :: dict<int, float>
  f.createDictionary(f.assemblyList([vInt, vInt, vInt], "int"), f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // createDictionary :: dict<int, guid>
  f.createDictionary(f.assemblyList([vInt, vInt, vInt], "int"), f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // createDictionary :: dict<int, int>
  f.createDictionary(f.assemblyList([vInt, vInt, vInt], "int"), f.assemblyList([vInt, vInt, vInt], "int"))
  // createDictionary :: dict<int, prefabId>
  f.createDictionary(f.assemblyList([vInt, vInt, vInt], "int"), f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"))
  // createDictionary :: dict<int, str>
  f.createDictionary(f.assemblyList([vInt, vInt, vInt], "int"), f.assemblyList([vStr, vStr, vStr], "str"))
  // createDictionary :: dict<int, vec3>
  f.createDictionary(f.assemblyList([vInt, vInt, vInt], "int"), f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // createDictionary :: dict<prefabId, bool>
  f.createDictionary(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), f.assemblyList([vBool, vBool, vBool], "bool"))
  // createDictionary :: dict<prefabId, configId>
  f.createDictionary(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // createDictionary :: dict<prefabId, entity>
  f.createDictionary(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), f.assemblyList([e, e, e], "entity"))
  // createDictionary :: dict<prefabId, faction>
  f.createDictionary(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // createDictionary :: dict<prefabId, float>
  f.createDictionary(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // createDictionary :: dict<prefabId, guid>
  f.createDictionary(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // createDictionary :: dict<prefabId, int>
  f.createDictionary(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), f.assemblyList([vInt, vInt, vInt], "int"))
  // createDictionary :: dict<prefabId, prefabId>
  f.createDictionary(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"))
  // createDictionary :: dict<prefabId, str>
  f.createDictionary(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), f.assemblyList([vStr, vStr, vStr], "str"))
  // createDictionary :: dict<prefabId, vec3>
  f.createDictionary(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // createDictionary :: dict<str, bool>
  f.createDictionary(f.assemblyList([vStr, vStr, vStr], "str"), f.assemblyList([vBool, vBool, vBool], "bool"))
  // createDictionary :: dict<str, configId>
  f.createDictionary(f.assemblyList([vStr, vStr, vStr], "str"), f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // createDictionary :: dict<str, entity>
  f.createDictionary(f.assemblyList([vStr, vStr, vStr], "str"), f.assemblyList([e, e, e], "entity"))
  // createDictionary :: dict<str, faction>
  f.createDictionary(f.assemblyList([vStr, vStr, vStr], "str"), f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // createDictionary :: dict<str, float>
  f.createDictionary(f.assemblyList([vStr, vStr, vStr], "str"), f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // createDictionary :: dict<str, guid>
  f.createDictionary(f.assemblyList([vStr, vStr, vStr], "str"), f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // createDictionary :: dict<str, int>
  f.createDictionary(f.assemblyList([vStr, vStr, vStr], "str"), f.assemblyList([vInt, vInt, vInt], "int"))
  // createDictionary :: dict<str, prefabId>
  f.createDictionary(f.assemblyList([vStr, vStr, vStr], "str"), f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"))
  // createDictionary :: dict<str, str>
  f.createDictionary(f.assemblyList([vStr, vStr, vStr], "str"), f.assemblyList([vStr, vStr, vStr], "str"))
  // createDictionary :: dict<str, vec3>
  f.createDictionary(f.assemblyList([vStr, vStr, vStr], "str"), f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // queryIfDictionaryContainsSpecificValue :: dict<configId, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vConfig, v: vBool }, { k: vConfig, v: vBool }]), vBool)
  // queryIfDictionaryContainsSpecificValue :: dict<configId, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vConfig, v: vConfig }, { k: vConfig, v: vConfig }]), vConfig)
  // queryIfDictionaryContainsSpecificValue :: dict<configId, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vConfig, v: e }, { k: vConfig, v: e }]), e)
  // queryIfDictionaryContainsSpecificValue :: dict<configId, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vConfig, v: vFaction }, { k: vConfig, v: vFaction }]), vFaction)
  // queryIfDictionaryContainsSpecificValue :: dict<configId, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vConfig, v: vFloat }, { k: vConfig, v: vFloat }]), vFloat)
  // queryIfDictionaryContainsSpecificValue :: dict<configId, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vConfig, v: vGuid }, { k: vConfig, v: vGuid }]), vGuid)
  // queryIfDictionaryContainsSpecificValue :: dict<configId, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vConfig, v: vInt }, { k: vConfig, v: vInt }]), vInt)
  // queryIfDictionaryContainsSpecificValue :: dict<configId, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vConfig, v: new prefabId(1n) }, { k: vConfig, v: new prefabId(1n) }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificValue :: dict<configId, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vConfig, v: vStr }, { k: vConfig, v: vStr }]), vStr)
  // queryIfDictionaryContainsSpecificValue :: dict<configId, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vConfig, v: vVec3 }, { k: vConfig, v: vVec3 }]), vVec3)
  // queryIfDictionaryContainsSpecificValue :: dict<entity, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: e, v: vBool }, { k: e, v: vBool }]), vBool)
  // queryIfDictionaryContainsSpecificValue :: dict<entity, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: e, v: vConfig }, { k: e, v: vConfig }]), vConfig)
  // queryIfDictionaryContainsSpecificValue :: dict<entity, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: e, v: e }, { k: e, v: e }]), e)
  // queryIfDictionaryContainsSpecificValue :: dict<entity, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: e, v: vFaction }, { k: e, v: vFaction }]), vFaction)
  // queryIfDictionaryContainsSpecificValue :: dict<entity, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: e, v: vFloat }, { k: e, v: vFloat }]), vFloat)
  // queryIfDictionaryContainsSpecificValue :: dict<entity, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: e, v: vGuid }, { k: e, v: vGuid }]), vGuid)
  // queryIfDictionaryContainsSpecificValue :: dict<entity, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: e, v: vInt }, { k: e, v: vInt }]), vInt)
  // queryIfDictionaryContainsSpecificValue :: dict<entity, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: e, v: new prefabId(1n) }, { k: e, v: new prefabId(1n) }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificValue :: dict<entity, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: e, v: vStr }, { k: e, v: vStr }]), vStr)
  // queryIfDictionaryContainsSpecificValue :: dict<entity, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: e, v: vVec3 }, { k: e, v: vVec3 }]), vVec3)
  // queryIfDictionaryContainsSpecificValue :: dict<faction, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vFaction, v: vBool }, { k: vFaction, v: vBool }]), vBool)
  // queryIfDictionaryContainsSpecificValue :: dict<faction, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vFaction, v: vConfig }, { k: vFaction, v: vConfig }]), vConfig)
  // queryIfDictionaryContainsSpecificValue :: dict<faction, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vFaction, v: e }, { k: vFaction, v: e }]), e)
  // queryIfDictionaryContainsSpecificValue :: dict<faction, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vFaction, v: vFaction }, { k: vFaction, v: vFaction }]), vFaction)
  // queryIfDictionaryContainsSpecificValue :: dict<faction, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vFaction, v: vFloat }, { k: vFaction, v: vFloat }]), vFloat)
  // queryIfDictionaryContainsSpecificValue :: dict<faction, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vFaction, v: vGuid }, { k: vFaction, v: vGuid }]), vGuid)
  // queryIfDictionaryContainsSpecificValue :: dict<faction, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vFaction, v: vInt }, { k: vFaction, v: vInt }]), vInt)
  // queryIfDictionaryContainsSpecificValue :: dict<faction, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vFaction, v: new prefabId(1n) }, { k: vFaction, v: new prefabId(1n) }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificValue :: dict<faction, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vFaction, v: vStr }, { k: vFaction, v: vStr }]), vStr)
  // queryIfDictionaryContainsSpecificValue :: dict<faction, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vFaction, v: vVec3 }, { k: vFaction, v: vVec3 }]), vVec3)
  // queryIfDictionaryContainsSpecificValue :: dict<guid, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vGuid, v: vBool }, { k: vGuid, v: vBool }]), vBool)
  // queryIfDictionaryContainsSpecificValue :: dict<guid, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vGuid, v: vConfig }, { k: vGuid, v: vConfig }]), vConfig)
  // queryIfDictionaryContainsSpecificValue :: dict<guid, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vGuid, v: e }, { k: vGuid, v: e }]), e)
  // queryIfDictionaryContainsSpecificValue :: dict<guid, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vGuid, v: vFaction }, { k: vGuid, v: vFaction }]), vFaction)
  // queryIfDictionaryContainsSpecificValue :: dict<guid, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vGuid, v: vFloat }, { k: vGuid, v: vFloat }]), vFloat)
  // queryIfDictionaryContainsSpecificValue :: dict<guid, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vGuid, v: vGuid }, { k: vGuid, v: vGuid }]), vGuid)
  // queryIfDictionaryContainsSpecificValue :: dict<guid, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vGuid, v: vInt }, { k: vGuid, v: vInt }]), vInt)
  // queryIfDictionaryContainsSpecificValue :: dict<guid, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vGuid, v: new prefabId(1n) }, { k: vGuid, v: new prefabId(1n) }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificValue :: dict<guid, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vGuid, v: vStr }, { k: vGuid, v: vStr }]), vStr)
  // queryIfDictionaryContainsSpecificValue :: dict<guid, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vGuid, v: vVec3 }, { k: vGuid, v: vVec3 }]), vVec3)
  // queryIfDictionaryContainsSpecificValue :: dict<int, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vInt, v: vBool }, { k: vInt, v: vBool }]), vBool)
  // queryIfDictionaryContainsSpecificValue :: dict<int, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vInt, v: vConfig }, { k: vInt, v: vConfig }]), vConfig)
  // queryIfDictionaryContainsSpecificValue :: dict<int, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vInt, v: e }, { k: vInt, v: e }]), e)
  // queryIfDictionaryContainsSpecificValue :: dict<int, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vInt, v: vFaction }, { k: vInt, v: vFaction }]), vFaction)
  // queryIfDictionaryContainsSpecificValue :: dict<int, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vInt, v: vFloat }, { k: vInt, v: vFloat }]), vFloat)
  // queryIfDictionaryContainsSpecificValue :: dict<int, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vInt, v: vGuid }, { k: vInt, v: vGuid }]), vGuid)
  // queryIfDictionaryContainsSpecificValue :: dict<int, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }]), vInt)
  // queryIfDictionaryContainsSpecificValue :: dict<int, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vInt, v: new prefabId(1n) }, { k: vInt, v: new prefabId(1n) }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificValue :: dict<int, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vInt, v: vStr }, { k: vInt, v: vStr }]), vStr)
  // queryIfDictionaryContainsSpecificValue :: dict<int, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vInt, v: vVec3 }, { k: vInt, v: vVec3 }]), vVec3)
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(1n), v: vBool }, { k: new prefabId(1n), v: vBool }]), vBool)
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(1n), v: vConfig }, { k: new prefabId(1n), v: vConfig }]), vConfig)
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(1n), v: e }, { k: new prefabId(1n), v: e }]), e)
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(1n), v: vFaction }, { k: new prefabId(1n), v: vFaction }]), vFaction)
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(1n), v: vFloat }, { k: new prefabId(1n), v: vFloat }]), vFloat)
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(1n), v: vGuid }, { k: new prefabId(1n), v: vGuid }]), vGuid)
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(1n), v: vInt }, { k: new prefabId(1n), v: vInt }]), vInt)
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(1n), v: new prefabId(1n) }, { k: new prefabId(1n), v: new prefabId(1n) }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(1n), v: vStr }, { k: new prefabId(1n), v: vStr }]), vStr)
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(1n), v: vVec3 }, { k: new prefabId(1n), v: vVec3 }]), vVec3)
  // queryIfDictionaryContainsSpecificValue :: dict<str, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vStr, v: vBool }, { k: vStr, v: vBool }]), vBool)
  // queryIfDictionaryContainsSpecificValue :: dict<str, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vStr, v: vConfig }, { k: vStr, v: vConfig }]), vConfig)
  // queryIfDictionaryContainsSpecificValue :: dict<str, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vStr, v: e }, { k: vStr, v: e }]), e)
  // queryIfDictionaryContainsSpecificValue :: dict<str, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vStr, v: vFaction }, { k: vStr, v: vFaction }]), vFaction)
  // queryIfDictionaryContainsSpecificValue :: dict<str, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vStr, v: vFloat }, { k: vStr, v: vFloat }]), vFloat)
  // queryIfDictionaryContainsSpecificValue :: dict<str, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vStr, v: vGuid }, { k: vStr, v: vGuid }]), vGuid)
  // queryIfDictionaryContainsSpecificValue :: dict<str, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vStr, v: vInt }, { k: vStr, v: vInt }]), vInt)
  // queryIfDictionaryContainsSpecificValue :: dict<str, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vStr, v: new prefabId(1n) }, { k: vStr, v: new prefabId(1n) }]), new prefabId(1n))
  // queryIfDictionaryContainsSpecificValue :: dict<str, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vStr, v: vStr }, { k: vStr, v: vStr }]), vStr)
  // queryIfDictionaryContainsSpecificValue :: dict<str, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: vStr, v: vVec3 }, { k: vStr, v: vVec3 }]), vVec3)
  // getListOfValuesFromDictionary :: dict<configId, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vBool }, { k: vConfig, v: vBool }]))
  // getListOfValuesFromDictionary :: dict<configId, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vConfig }, { k: vConfig, v: vConfig }]))
  // getListOfValuesFromDictionary :: dict<configId, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vConfig, v: e }, { k: vConfig, v: e }]))
  // getListOfValuesFromDictionary :: dict<configId, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vFaction }, { k: vConfig, v: vFaction }]))
  // getListOfValuesFromDictionary :: dict<configId, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vFloat }, { k: vConfig, v: vFloat }]))
  // getListOfValuesFromDictionary :: dict<configId, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vGuid }, { k: vConfig, v: vGuid }]))
  // getListOfValuesFromDictionary :: dict<configId, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vInt }, { k: vConfig, v: vInt }]))
  // getListOfValuesFromDictionary :: dict<configId, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vConfig, v: new prefabId(1n) }, { k: vConfig, v: new prefabId(1n) }]))
  // getListOfValuesFromDictionary :: dict<configId, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vStr }, { k: vConfig, v: vStr }]))
  // getListOfValuesFromDictionary :: dict<configId, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vConfig, v: vVec3 }, { k: vConfig, v: vVec3 }]))
  // getListOfValuesFromDictionary :: dict<entity, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: e, v: vBool }, { k: e, v: vBool }]))
  // getListOfValuesFromDictionary :: dict<entity, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: e, v: vConfig }, { k: e, v: vConfig }]))
  // getListOfValuesFromDictionary :: dict<entity, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: e, v: e }, { k: e, v: e }]))
  // getListOfValuesFromDictionary :: dict<entity, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: e, v: vFaction }, { k: e, v: vFaction }]))
  // getListOfValuesFromDictionary :: dict<entity, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: e, v: vFloat }, { k: e, v: vFloat }]))
  // getListOfValuesFromDictionary :: dict<entity, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: e, v: vGuid }, { k: e, v: vGuid }]))
  // getListOfValuesFromDictionary :: dict<entity, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: e, v: vInt }, { k: e, v: vInt }]))
  // getListOfValuesFromDictionary :: dict<entity, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: e, v: new prefabId(1n) }, { k: e, v: new prefabId(1n) }]))
  // getListOfValuesFromDictionary :: dict<entity, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: e, v: vStr }, { k: e, v: vStr }]))
  // getListOfValuesFromDictionary :: dict<entity, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: e, v: vVec3 }, { k: e, v: vVec3 }]))
  // getListOfValuesFromDictionary :: dict<faction, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vBool }, { k: vFaction, v: vBool }]))
  // getListOfValuesFromDictionary :: dict<faction, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vConfig }, { k: vFaction, v: vConfig }]))
  // getListOfValuesFromDictionary :: dict<faction, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vFaction, v: e }, { k: vFaction, v: e }]))
  // getListOfValuesFromDictionary :: dict<faction, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vFaction }, { k: vFaction, v: vFaction }]))
  // getListOfValuesFromDictionary :: dict<faction, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vFloat }, { k: vFaction, v: vFloat }]))
  // getListOfValuesFromDictionary :: dict<faction, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vGuid }, { k: vFaction, v: vGuid }]))
  // getListOfValuesFromDictionary :: dict<faction, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vInt }, { k: vFaction, v: vInt }]))
  // getListOfValuesFromDictionary :: dict<faction, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vFaction, v: new prefabId(1n) }, { k: vFaction, v: new prefabId(1n) }]))
  // getListOfValuesFromDictionary :: dict<faction, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vStr }, { k: vFaction, v: vStr }]))
  // getListOfValuesFromDictionary :: dict<faction, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vFaction, v: vVec3 }, { k: vFaction, v: vVec3 }]))
  // getListOfValuesFromDictionary :: dict<guid, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vBool }, { k: vGuid, v: vBool }]))
  // getListOfValuesFromDictionary :: dict<guid, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vConfig }, { k: vGuid, v: vConfig }]))
  // getListOfValuesFromDictionary :: dict<guid, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vGuid, v: e }, { k: vGuid, v: e }]))
  // getListOfValuesFromDictionary :: dict<guid, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vFaction }, { k: vGuid, v: vFaction }]))
  // getListOfValuesFromDictionary :: dict<guid, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vFloat }, { k: vGuid, v: vFloat }]))
  // getListOfValuesFromDictionary :: dict<guid, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vGuid }, { k: vGuid, v: vGuid }]))
  // getListOfValuesFromDictionary :: dict<guid, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vInt }, { k: vGuid, v: vInt }]))
  // getListOfValuesFromDictionary :: dict<guid, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vGuid, v: new prefabId(1n) }, { k: vGuid, v: new prefabId(1n) }]))
  // getListOfValuesFromDictionary :: dict<guid, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vStr }, { k: vGuid, v: vStr }]))
  // getListOfValuesFromDictionary :: dict<guid, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vGuid, v: vVec3 }, { k: vGuid, v: vVec3 }]))
  // getListOfValuesFromDictionary :: dict<int, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vInt, v: vBool }, { k: vInt, v: vBool }]))
  // getListOfValuesFromDictionary :: dict<int, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vInt, v: vConfig }, { k: vInt, v: vConfig }]))
  // getListOfValuesFromDictionary :: dict<int, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vInt, v: e }, { k: vInt, v: e }]))
  // getListOfValuesFromDictionary :: dict<int, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vInt, v: vFaction }, { k: vInt, v: vFaction }]))
  // getListOfValuesFromDictionary :: dict<int, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vInt, v: vFloat }, { k: vInt, v: vFloat }]))
  // getListOfValuesFromDictionary :: dict<int, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vInt, v: vGuid }, { k: vInt, v: vGuid }]))
  // getListOfValuesFromDictionary :: dict<int, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vInt, v: vInt }, { k: vInt, v: vInt }]))
  // getListOfValuesFromDictionary :: dict<int, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vInt, v: new prefabId(1n) }, { k: vInt, v: new prefabId(1n) }]))
  // getListOfValuesFromDictionary :: dict<int, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vInt, v: vStr }, { k: vInt, v: vStr }]))
  // getListOfValuesFromDictionary :: dict<int, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vInt, v: vVec3 }, { k: vInt, v: vVec3 }]))
  // getListOfValuesFromDictionary :: dict<prefabId, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vBool }, { k: new prefabId(1n), v: vBool }]))
  // getListOfValuesFromDictionary :: dict<prefabId, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vConfig }, { k: new prefabId(1n), v: vConfig }]))
  // getListOfValuesFromDictionary :: dict<prefabId, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: e }, { k: new prefabId(1n), v: e }]))
  // getListOfValuesFromDictionary :: dict<prefabId, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vFaction }, { k: new prefabId(1n), v: vFaction }]))
  // getListOfValuesFromDictionary :: dict<prefabId, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vFloat }, { k: new prefabId(1n), v: vFloat }]))
  // getListOfValuesFromDictionary :: dict<prefabId, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vGuid }, { k: new prefabId(1n), v: vGuid }]))
  // getListOfValuesFromDictionary :: dict<prefabId, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vInt }, { k: new prefabId(1n), v: vInt }]))
  // getListOfValuesFromDictionary :: dict<prefabId, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: new prefabId(1n) }, { k: new prefabId(1n), v: new prefabId(1n) }]))
  // getListOfValuesFromDictionary :: dict<prefabId, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vStr }, { k: new prefabId(1n), v: vStr }]))
  // getListOfValuesFromDictionary :: dict<prefabId, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(1n), v: vVec3 }, { k: new prefabId(1n), v: vVec3 }]))
  // getListOfValuesFromDictionary :: dict<str, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vStr, v: vBool }, { k: vStr, v: vBool }]))
  // getListOfValuesFromDictionary :: dict<str, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vStr, v: vConfig }, { k: vStr, v: vConfig }]))
  // getListOfValuesFromDictionary :: dict<str, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vStr, v: e }, { k: vStr, v: e }]))
  // getListOfValuesFromDictionary :: dict<str, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vStr, v: vFaction }, { k: vStr, v: vFaction }]))
  // getListOfValuesFromDictionary :: dict<str, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vStr, v: vFloat }, { k: vStr, v: vFloat }]))
  // getListOfValuesFromDictionary :: dict<str, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vStr, v: vGuid }, { k: vStr, v: vGuid }]))
  // getListOfValuesFromDictionary :: dict<str, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vStr, v: vInt }, { k: vStr, v: vInt }]))
  // getListOfValuesFromDictionary :: dict<str, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vStr, v: new prefabId(1n) }, { k: vStr, v: new prefabId(1n) }]))
  // getListOfValuesFromDictionary :: dict<str, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vStr, v: vStr }, { k: vStr, v: vStr }]))
  // getListOfValuesFromDictionary :: dict<str, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: vStr, v: vVec3 }, { k: vStr, v: vVec3 }]))
})

