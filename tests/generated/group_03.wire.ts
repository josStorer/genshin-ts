import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_03 (wire)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741832 }).on('whenEntityIsCreated', (_evt, f) => {
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
  // setCustomVariable :: bool
  f.setCustomVariable(e, vStr, vBool, vBool)
  // setCustomVariable :: configId
  f.setCustomVariable(e, vStr, vConfig, vBool)
  // setCustomVariable :: entity
  f.setCustomVariable(e, vStr, e, vBool)
  // setCustomVariable :: faction
  f.setCustomVariable(e, vStr, vFaction, vBool)
  // setCustomVariable :: float
  f.setCustomVariable(e, vStr, vFloat, vBool)
  // setCustomVariable :: guid
  f.setCustomVariable(e, vStr, vGuid, vBool)
  // setCustomVariable :: int
  f.setCustomVariable(e, vStr, vInt, vBool)
  // setCustomVariable :: prefabId
  f.setCustomVariable(e, vStr, new prefabId(1n), vBool)
  // setCustomVariable :: str
  f.setCustomVariable(e, vStr, vStr, vBool)
  // setCustomVariable :: vec3
  f.setCustomVariable(e, vStr, vVec3, vBool)
  // setCustomVariable :: list<bool>
  f.setCustomVariable(e, vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setCustomVariable :: list<configId>
  f.setCustomVariable(e, vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setCustomVariable :: list<entity>
  f.setCustomVariable(e, vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setCustomVariable :: list<faction>
  f.setCustomVariable(e, vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setCustomVariable :: list<float>
  f.setCustomVariable(e, vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setCustomVariable :: list<guid>
  f.setCustomVariable(e, vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setCustomVariable :: list<int>
  f.setCustomVariable(e, vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setCustomVariable :: list<prefabId>
  f.setCustomVariable(e, vStr, f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), vBool)
  // setCustomVariable :: list<str>
  f.setCustomVariable(e, vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setCustomVariable :: list<vec3>
  f.setCustomVariable(e, vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setCustomVariable :: dict<configId, bool>
  f.setCustomVariable(e, vStr, vBool, vBool)
  // setCustomVariable :: dict<configId, configId>
  f.setCustomVariable(e, vStr, vConfig, vBool)
  // setCustomVariable :: dict<configId, entity>
  f.setCustomVariable(e, vStr, e, vBool)
  // setCustomVariable :: dict<configId, faction>
  f.setCustomVariable(e, vStr, vFaction, vBool)
  // setCustomVariable :: dict<configId, float>
  f.setCustomVariable(e, vStr, vFloat, vBool)
  // setCustomVariable :: dict<configId, guid>
  f.setCustomVariable(e, vStr, vGuid, vBool)
  // setCustomVariable :: dict<configId, int>
  f.setCustomVariable(e, vStr, vInt, vBool)
  // setCustomVariable :: dict<configId, list<bool>>
  f.setCustomVariable(e, vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setCustomVariable :: dict<configId, list<configId>>
  f.setCustomVariable(e, vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setCustomVariable :: dict<configId, list<entity>>
  f.setCustomVariable(e, vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setCustomVariable :: dict<configId, list<faction>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setCustomVariable :: dict<configId, list<float>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setCustomVariable :: dict<configId, list<guid>>
  f.setCustomVariable(e, vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setCustomVariable :: dict<configId, list<int>>
  f.setCustomVariable(e, vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setCustomVariable :: dict<configId, list<str>>
  f.setCustomVariable(e, vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setCustomVariable :: dict<configId, list<vec3>>
  f.setCustomVariable(e, vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setCustomVariable :: dict<configId, prefabId>
  f.setCustomVariable(e, vStr, new prefabId(1n), vBool)
  // setCustomVariable :: dict<configId, str>
  f.setCustomVariable(e, vStr, vStr, vBool)
  // setCustomVariable :: dict<configId, vec3>
  f.setCustomVariable(e, vStr, vVec3, vBool)
  // setCustomVariable :: dict<entity, bool>
  f.setCustomVariable(e, vStr, vBool, vBool)
  // setCustomVariable :: dict<entity, configId>
  f.setCustomVariable(e, vStr, vConfig, vBool)
  // setCustomVariable :: dict<entity, entity>
  f.setCustomVariable(e, vStr, e, vBool)
  // setCustomVariable :: dict<entity, faction>
  f.setCustomVariable(e, vStr, vFaction, vBool)
  // setCustomVariable :: dict<entity, float>
  f.setCustomVariable(e, vStr, vFloat, vBool)
  // setCustomVariable :: dict<entity, guid>
  f.setCustomVariable(e, vStr, vGuid, vBool)
  // setCustomVariable :: dict<entity, int>
  f.setCustomVariable(e, vStr, vInt, vBool)
  // setCustomVariable :: dict<entity, list<bool>>
  f.setCustomVariable(e, vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setCustomVariable :: dict<entity, list<configId>>
  f.setCustomVariable(e, vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setCustomVariable :: dict<entity, list<entity>>
  f.setCustomVariable(e, vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setCustomVariable :: dict<entity, list<faction>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setCustomVariable :: dict<entity, list<float>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setCustomVariable :: dict<entity, list<guid>>
  f.setCustomVariable(e, vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setCustomVariable :: dict<entity, list<int>>
  f.setCustomVariable(e, vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setCustomVariable :: dict<entity, list<str>>
  f.setCustomVariable(e, vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setCustomVariable :: dict<entity, list<vec3>>
  f.setCustomVariable(e, vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setCustomVariable :: dict<entity, prefabId>
  f.setCustomVariable(e, vStr, new prefabId(1n), vBool)
  // setCustomVariable :: dict<entity, str>
  f.setCustomVariable(e, vStr, vStr, vBool)
  // setCustomVariable :: dict<entity, vec3>
  f.setCustomVariable(e, vStr, vVec3, vBool)
  // setCustomVariable :: dict<faction, bool>
  f.setCustomVariable(e, vStr, vBool, vBool)
  // setCustomVariable :: dict<faction, configId>
  f.setCustomVariable(e, vStr, vConfig, vBool)
  // setCustomVariable :: dict<faction, entity>
  f.setCustomVariable(e, vStr, e, vBool)
  // setCustomVariable :: dict<faction, faction>
  f.setCustomVariable(e, vStr, vFaction, vBool)
  // setCustomVariable :: dict<faction, float>
  f.setCustomVariable(e, vStr, vFloat, vBool)
  // setCustomVariable :: dict<faction, guid>
  f.setCustomVariable(e, vStr, vGuid, vBool)
  // setCustomVariable :: dict<faction, int>
  f.setCustomVariable(e, vStr, vInt, vBool)
  // setCustomVariable :: dict<faction, list<bool>>
  f.setCustomVariable(e, vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setCustomVariable :: dict<faction, list<configId>>
  f.setCustomVariable(e, vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setCustomVariable :: dict<faction, list<entity>>
  f.setCustomVariable(e, vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setCustomVariable :: dict<faction, list<faction>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setCustomVariable :: dict<faction, list<float>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setCustomVariable :: dict<faction, list<guid>>
  f.setCustomVariable(e, vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setCustomVariable :: dict<faction, list<int>>
  f.setCustomVariable(e, vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setCustomVariable :: dict<faction, list<str>>
  f.setCustomVariable(e, vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setCustomVariable :: dict<faction, list<vec3>>
  f.setCustomVariable(e, vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setCustomVariable :: dict<faction, prefabId>
  f.setCustomVariable(e, vStr, new prefabId(1n), vBool)
  // setCustomVariable :: dict<faction, str>
  f.setCustomVariable(e, vStr, vStr, vBool)
  // setCustomVariable :: dict<faction, vec3>
  f.setCustomVariable(e, vStr, vVec3, vBool)
  // setCustomVariable :: dict<guid, bool>
  f.setCustomVariable(e, vStr, vBool, vBool)
  // setCustomVariable :: dict<guid, configId>
  f.setCustomVariable(e, vStr, vConfig, vBool)
  // setCustomVariable :: dict<guid, entity>
  f.setCustomVariable(e, vStr, e, vBool)
  // setCustomVariable :: dict<guid, faction>
  f.setCustomVariable(e, vStr, vFaction, vBool)
  // setCustomVariable :: dict<guid, float>
  f.setCustomVariable(e, vStr, vFloat, vBool)
  // setCustomVariable :: dict<guid, guid>
  f.setCustomVariable(e, vStr, vGuid, vBool)
  // setCustomVariable :: dict<guid, int>
  f.setCustomVariable(e, vStr, vInt, vBool)
  // setCustomVariable :: dict<guid, list<bool>>
  f.setCustomVariable(e, vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setCustomVariable :: dict<guid, list<configId>>
  f.setCustomVariable(e, vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setCustomVariable :: dict<guid, list<entity>>
  f.setCustomVariable(e, vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setCustomVariable :: dict<guid, list<faction>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setCustomVariable :: dict<guid, list<float>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setCustomVariable :: dict<guid, list<guid>>
  f.setCustomVariable(e, vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setCustomVariable :: dict<guid, list<int>>
  f.setCustomVariable(e, vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setCustomVariable :: dict<guid, list<str>>
  f.setCustomVariable(e, vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setCustomVariable :: dict<guid, list<vec3>>
  f.setCustomVariable(e, vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setCustomVariable :: dict<guid, prefabId>
  f.setCustomVariable(e, vStr, new prefabId(1n), vBool)
  // setCustomVariable :: dict<guid, str>
  f.setCustomVariable(e, vStr, vStr, vBool)
  // setCustomVariable :: dict<guid, vec3>
  f.setCustomVariable(e, vStr, vVec3, vBool)
  // setCustomVariable :: dict<int, bool>
  f.setCustomVariable(e, vStr, vBool, vBool)
  // setCustomVariable :: dict<int, configId>
  f.setCustomVariable(e, vStr, vConfig, vBool)
  // setCustomVariable :: dict<int, entity>
  f.setCustomVariable(e, vStr, e, vBool)
  // setCustomVariable :: dict<int, faction>
  f.setCustomVariable(e, vStr, vFaction, vBool)
  // setCustomVariable :: dict<int, float>
  f.setCustomVariable(e, vStr, vFloat, vBool)
  // setCustomVariable :: dict<int, guid>
  f.setCustomVariable(e, vStr, vGuid, vBool)
  // setCustomVariable :: dict<int, int>
  f.setCustomVariable(e, vStr, vInt, vBool)
  // setCustomVariable :: dict<int, list<bool>>
  f.setCustomVariable(e, vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setCustomVariable :: dict<int, list<configId>>
  f.setCustomVariable(e, vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setCustomVariable :: dict<int, list<entity>>
  f.setCustomVariable(e, vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setCustomVariable :: dict<int, list<faction>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setCustomVariable :: dict<int, list<float>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setCustomVariable :: dict<int, list<guid>>
  f.setCustomVariable(e, vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setCustomVariable :: dict<int, list<int>>
  f.setCustomVariable(e, vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setCustomVariable :: dict<int, list<str>>
  f.setCustomVariable(e, vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setCustomVariable :: dict<int, list<vec3>>
  f.setCustomVariable(e, vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setCustomVariable :: dict<int, prefabId>
  f.setCustomVariable(e, vStr, new prefabId(1n), vBool)
  // setCustomVariable :: dict<int, str>
  f.setCustomVariable(e, vStr, vStr, vBool)
  // setCustomVariable :: dict<int, vec3>
  f.setCustomVariable(e, vStr, vVec3, vBool)
  // setCustomVariable :: dict<prefabId, bool>
  f.setCustomVariable(e, vStr, vBool, vBool)
  // setCustomVariable :: dict<prefabId, configId>
  f.setCustomVariable(e, vStr, vConfig, vBool)
  // setCustomVariable :: dict<prefabId, entity>
  f.setCustomVariable(e, vStr, e, vBool)
  // setCustomVariable :: dict<prefabId, faction>
  f.setCustomVariable(e, vStr, vFaction, vBool)
  // setCustomVariable :: dict<prefabId, float>
  f.setCustomVariable(e, vStr, vFloat, vBool)
  // setCustomVariable :: dict<prefabId, guid>
  f.setCustomVariable(e, vStr, vGuid, vBool)
  // setCustomVariable :: dict<prefabId, int>
  f.setCustomVariable(e, vStr, vInt, vBool)
  // setCustomVariable :: dict<prefabId, list<bool>>
  f.setCustomVariable(e, vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setCustomVariable :: dict<prefabId, list<configId>>
  f.setCustomVariable(e, vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setCustomVariable :: dict<prefabId, list<entity>>
  f.setCustomVariable(e, vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setCustomVariable :: dict<prefabId, list<faction>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setCustomVariable :: dict<prefabId, list<float>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setCustomVariable :: dict<prefabId, list<guid>>
  f.setCustomVariable(e, vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setCustomVariable :: dict<prefabId, list<int>>
  f.setCustomVariable(e, vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setCustomVariable :: dict<prefabId, list<str>>
  f.setCustomVariable(e, vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setCustomVariable :: dict<prefabId, list<vec3>>
  f.setCustomVariable(e, vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setCustomVariable :: dict<prefabId, prefabId>
  f.setCustomVariable(e, vStr, new prefabId(1n), vBool)
  // setCustomVariable :: dict<prefabId, str>
  f.setCustomVariable(e, vStr, vStr, vBool)
  // setCustomVariable :: dict<prefabId, vec3>
  f.setCustomVariable(e, vStr, vVec3, vBool)
  // setCustomVariable :: dict<str, bool>
  f.setCustomVariable(e, vStr, vBool, vBool)
  // setCustomVariable :: dict<str, configId>
  f.setCustomVariable(e, vStr, vConfig, vBool)
  // setCustomVariable :: dict<str, entity>
  f.setCustomVariable(e, vStr, e, vBool)
  // setCustomVariable :: dict<str, faction>
  f.setCustomVariable(e, vStr, vFaction, vBool)
  // setCustomVariable :: dict<str, float>
  f.setCustomVariable(e, vStr, vFloat, vBool)
  // setCustomVariable :: dict<str, guid>
  f.setCustomVariable(e, vStr, vGuid, vBool)
  // setCustomVariable :: dict<str, int>
  f.setCustomVariable(e, vStr, vInt, vBool)
  // setCustomVariable :: dict<str, list<bool>>
  f.setCustomVariable(e, vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setCustomVariable :: dict<str, list<configId>>
  f.setCustomVariable(e, vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setCustomVariable :: dict<str, list<entity>>
  f.setCustomVariable(e, vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setCustomVariable :: dict<str, list<faction>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setCustomVariable :: dict<str, list<float>>
  f.setCustomVariable(e, vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setCustomVariable :: dict<str, list<guid>>
  f.setCustomVariable(e, vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setCustomVariable :: dict<str, list<int>>
  f.setCustomVariable(e, vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setCustomVariable :: dict<str, list<str>>
  f.setCustomVariable(e, vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setCustomVariable :: dict<str, list<vec3>>
  f.setCustomVariable(e, vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setCustomVariable :: dict<str, prefabId>
  f.setCustomVariable(e, vStr, new prefabId(1n), vBool)
  // setCustomVariable :: dict<str, str>
  f.setCustomVariable(e, vStr, vStr, vBool)
  // setCustomVariable :: dict<str, vec3>
  f.setCustomVariable(e, vStr, vVec3, vBool)
  // getCustomVariable :: bool
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: configId
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: entity
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: faction
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: float
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: guid
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: int
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: prefabId
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: str
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: vec3
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: list<bool>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: list<configId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: list<entity>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: list<faction>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: list<float>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: list<guid>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: list<int>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: list<prefabId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: list<str>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: list<vec3>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, bool>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, configId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, entity>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, faction>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, float>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, guid>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, int>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, list<bool>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, list<configId>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, list<entity>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, list<faction>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, list<float>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, list<guid>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, list<int>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, list<str>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, list<vec3>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, prefabId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, str>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<configId, vec3>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, bool>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, configId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, entity>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, faction>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, float>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, guid>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, int>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, list<bool>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, list<configId>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, list<entity>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, list<faction>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, list<float>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, list<guid>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, list<int>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, list<str>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, list<vec3>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, prefabId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, str>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<entity, vec3>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, bool>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, configId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, entity>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, faction>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, float>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, guid>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, int>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, list<bool>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, list<configId>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, list<entity>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, list<faction>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, list<float>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, list<guid>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, list<int>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, list<str>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, list<vec3>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, prefabId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, str>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<faction, vec3>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, bool>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, configId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, entity>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, faction>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, float>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, guid>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, int>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, list<bool>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, list<configId>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, list<entity>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, list<faction>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, list<float>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, list<guid>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, list<int>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, list<str>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, list<vec3>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, prefabId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, str>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<guid, vec3>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, bool>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, configId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, entity>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, faction>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, float>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, guid>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, int>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, list<bool>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, list<configId>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, list<entity>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, list<faction>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, list<float>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, list<guid>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, list<int>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, list<str>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, list<vec3>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, prefabId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, str>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<int, vec3>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, bool>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, configId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, entity>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, faction>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, float>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, guid>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, int>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, list<bool>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, list<configId>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, list<entity>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, list<faction>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, list<float>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, list<guid>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, list<int>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, list<str>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, list<vec3>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, prefabId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, str>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<prefabId, vec3>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, bool>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, configId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, entity>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, faction>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, float>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, guid>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, int>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, list<bool>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, list<configId>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, list<entity>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, list<faction>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, list<float>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, list<guid>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, list<int>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, list<str>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, list<vec3>>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, prefabId>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, str>
  f.getCustomVariable(e, vStr)
  // getCustomVariable :: dict<str, vec3>
  f.getCustomVariable(e, vStr)
  // setNodeGraphVariable :: bool
  f.setNodeGraphVariable(vStr, vBool, vBool)
  // setNodeGraphVariable :: configId
  f.setNodeGraphVariable(vStr, vConfig, vBool)
  // setNodeGraphVariable :: entity
  f.setNodeGraphVariable(vStr, e, vBool)
  // setNodeGraphVariable :: faction
  f.setNodeGraphVariable(vStr, vFaction, vBool)
  // setNodeGraphVariable :: float
  f.setNodeGraphVariable(vStr, vFloat, vBool)
  // setNodeGraphVariable :: guid
  f.setNodeGraphVariable(vStr, vGuid, vBool)
  // setNodeGraphVariable :: int
  f.setNodeGraphVariable(vStr, vInt, vBool)
  // setNodeGraphVariable :: prefabId
  f.setNodeGraphVariable(vStr, new prefabId(1n), vBool)
  // setNodeGraphVariable :: str
  f.setNodeGraphVariable(vStr, vStr, vBool)
  // setNodeGraphVariable :: vec3
  f.setNodeGraphVariable(vStr, vVec3, vBool)
  // setNodeGraphVariable :: list<bool>
  f.setNodeGraphVariable(vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setNodeGraphVariable :: list<configId>
  f.setNodeGraphVariable(vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setNodeGraphVariable :: list<entity>
  f.setNodeGraphVariable(vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setNodeGraphVariable :: list<faction>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setNodeGraphVariable :: list<float>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setNodeGraphVariable :: list<guid>
  f.setNodeGraphVariable(vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setNodeGraphVariable :: list<int>
  f.setNodeGraphVariable(vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setNodeGraphVariable :: list<prefabId>
  f.setNodeGraphVariable(vStr, f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), vBool)
  // setNodeGraphVariable :: list<str>
  f.setNodeGraphVariable(vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setNodeGraphVariable :: list<vec3>
  f.setNodeGraphVariable(vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setNodeGraphVariable :: dict<configId, bool>
  f.setNodeGraphVariable(vStr, vBool, vBool)
  // setNodeGraphVariable :: dict<configId, configId>
  f.setNodeGraphVariable(vStr, vConfig, vBool)
  // setNodeGraphVariable :: dict<configId, entity>
  f.setNodeGraphVariable(vStr, e, vBool)
  // setNodeGraphVariable :: dict<configId, faction>
  f.setNodeGraphVariable(vStr, vFaction, vBool)
  // setNodeGraphVariable :: dict<configId, float>
  f.setNodeGraphVariable(vStr, vFloat, vBool)
  // setNodeGraphVariable :: dict<configId, guid>
  f.setNodeGraphVariable(vStr, vGuid, vBool)
  // setNodeGraphVariable :: dict<configId, int>
  f.setNodeGraphVariable(vStr, vInt, vBool)
  // setNodeGraphVariable :: dict<configId, list<bool>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setNodeGraphVariable :: dict<configId, list<configId>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setNodeGraphVariable :: dict<configId, list<entity>>
  f.setNodeGraphVariable(vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setNodeGraphVariable :: dict<configId, list<faction>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setNodeGraphVariable :: dict<configId, list<float>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setNodeGraphVariable :: dict<configId, list<guid>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setNodeGraphVariable :: dict<configId, list<int>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setNodeGraphVariable :: dict<configId, list<str>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setNodeGraphVariable :: dict<configId, list<vec3>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setNodeGraphVariable :: dict<configId, prefabId>
  f.setNodeGraphVariable(vStr, new prefabId(1n), vBool)
  // setNodeGraphVariable :: dict<configId, str>
  f.setNodeGraphVariable(vStr, vStr, vBool)
  // setNodeGraphVariable :: dict<configId, vec3>
  f.setNodeGraphVariable(vStr, vVec3, vBool)
  // setNodeGraphVariable :: dict<entity, bool>
  f.setNodeGraphVariable(vStr, vBool, vBool)
  // setNodeGraphVariable :: dict<entity, configId>
  f.setNodeGraphVariable(vStr, vConfig, vBool)
  // setNodeGraphVariable :: dict<entity, entity>
  f.setNodeGraphVariable(vStr, e, vBool)
  // setNodeGraphVariable :: dict<entity, faction>
  f.setNodeGraphVariable(vStr, vFaction, vBool)
  // setNodeGraphVariable :: dict<entity, float>
  f.setNodeGraphVariable(vStr, vFloat, vBool)
  // setNodeGraphVariable :: dict<entity, guid>
  f.setNodeGraphVariable(vStr, vGuid, vBool)
  // setNodeGraphVariable :: dict<entity, int>
  f.setNodeGraphVariable(vStr, vInt, vBool)
  // setNodeGraphVariable :: dict<entity, list<bool>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setNodeGraphVariable :: dict<entity, list<configId>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setNodeGraphVariable :: dict<entity, list<entity>>
  f.setNodeGraphVariable(vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setNodeGraphVariable :: dict<entity, list<faction>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setNodeGraphVariable :: dict<entity, list<float>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setNodeGraphVariable :: dict<entity, list<guid>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setNodeGraphVariable :: dict<entity, list<int>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setNodeGraphVariable :: dict<entity, list<str>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setNodeGraphVariable :: dict<entity, list<vec3>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setNodeGraphVariable :: dict<entity, prefabId>
  f.setNodeGraphVariable(vStr, new prefabId(1n), vBool)
  // setNodeGraphVariable :: dict<entity, str>
  f.setNodeGraphVariable(vStr, vStr, vBool)
  // setNodeGraphVariable :: dict<entity, vec3>
  f.setNodeGraphVariable(vStr, vVec3, vBool)
  // setNodeGraphVariable :: dict<faction, bool>
  f.setNodeGraphVariable(vStr, vBool, vBool)
  // setNodeGraphVariable :: dict<faction, configId>
  f.setNodeGraphVariable(vStr, vConfig, vBool)
  // setNodeGraphVariable :: dict<faction, entity>
  f.setNodeGraphVariable(vStr, e, vBool)
  // setNodeGraphVariable :: dict<faction, faction>
  f.setNodeGraphVariable(vStr, vFaction, vBool)
  // setNodeGraphVariable :: dict<faction, float>
  f.setNodeGraphVariable(vStr, vFloat, vBool)
  // setNodeGraphVariable :: dict<faction, guid>
  f.setNodeGraphVariable(vStr, vGuid, vBool)
  // setNodeGraphVariable :: dict<faction, int>
  f.setNodeGraphVariable(vStr, vInt, vBool)
  // setNodeGraphVariable :: dict<faction, list<bool>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setNodeGraphVariable :: dict<faction, list<configId>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setNodeGraphVariable :: dict<faction, list<entity>>
  f.setNodeGraphVariable(vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setNodeGraphVariable :: dict<faction, list<faction>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setNodeGraphVariable :: dict<faction, list<float>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setNodeGraphVariable :: dict<faction, list<guid>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setNodeGraphVariable :: dict<faction, list<int>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setNodeGraphVariable :: dict<faction, list<str>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setNodeGraphVariable :: dict<faction, list<vec3>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setNodeGraphVariable :: dict<faction, prefabId>
  f.setNodeGraphVariable(vStr, new prefabId(1n), vBool)
  // setNodeGraphVariable :: dict<faction, str>
  f.setNodeGraphVariable(vStr, vStr, vBool)
  // setNodeGraphVariable :: dict<faction, vec3>
  f.setNodeGraphVariable(vStr, vVec3, vBool)
  // setNodeGraphVariable :: dict<guid, bool>
  f.setNodeGraphVariable(vStr, vBool, vBool)
  // setNodeGraphVariable :: dict<guid, configId>
  f.setNodeGraphVariable(vStr, vConfig, vBool)
  // setNodeGraphVariable :: dict<guid, entity>
  f.setNodeGraphVariable(vStr, e, vBool)
  // setNodeGraphVariable :: dict<guid, faction>
  f.setNodeGraphVariable(vStr, vFaction, vBool)
  // setNodeGraphVariable :: dict<guid, float>
  f.setNodeGraphVariable(vStr, vFloat, vBool)
  // setNodeGraphVariable :: dict<guid, guid>
  f.setNodeGraphVariable(vStr, vGuid, vBool)
  // setNodeGraphVariable :: dict<guid, int>
  f.setNodeGraphVariable(vStr, vInt, vBool)
  // setNodeGraphVariable :: dict<guid, list<bool>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setNodeGraphVariable :: dict<guid, list<configId>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setNodeGraphVariable :: dict<guid, list<entity>>
  f.setNodeGraphVariable(vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setNodeGraphVariable :: dict<guid, list<faction>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setNodeGraphVariable :: dict<guid, list<float>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setNodeGraphVariable :: dict<guid, list<guid>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setNodeGraphVariable :: dict<guid, list<int>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setNodeGraphVariable :: dict<guid, list<str>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setNodeGraphVariable :: dict<guid, list<vec3>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setNodeGraphVariable :: dict<guid, prefabId>
  f.setNodeGraphVariable(vStr, new prefabId(1n), vBool)
  // setNodeGraphVariable :: dict<guid, str>
  f.setNodeGraphVariable(vStr, vStr, vBool)
  // setNodeGraphVariable :: dict<guid, vec3>
  f.setNodeGraphVariable(vStr, vVec3, vBool)
  // setNodeGraphVariable :: dict<int, bool>
  f.setNodeGraphVariable(vStr, vBool, vBool)
  // setNodeGraphVariable :: dict<int, configId>
  f.setNodeGraphVariable(vStr, vConfig, vBool)
  // setNodeGraphVariable :: dict<int, entity>
  f.setNodeGraphVariable(vStr, e, vBool)
  // setNodeGraphVariable :: dict<int, faction>
  f.setNodeGraphVariable(vStr, vFaction, vBool)
  // setNodeGraphVariable :: dict<int, float>
  f.setNodeGraphVariable(vStr, vFloat, vBool)
  // setNodeGraphVariable :: dict<int, guid>
  f.setNodeGraphVariable(vStr, vGuid, vBool)
  // setNodeGraphVariable :: dict<int, int>
  f.setNodeGraphVariable(vStr, vInt, vBool)
  // setNodeGraphVariable :: dict<int, list<bool>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setNodeGraphVariable :: dict<int, list<configId>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setNodeGraphVariable :: dict<int, list<entity>>
  f.setNodeGraphVariable(vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setNodeGraphVariable :: dict<int, list<faction>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setNodeGraphVariable :: dict<int, list<float>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setNodeGraphVariable :: dict<int, list<guid>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setNodeGraphVariable :: dict<int, list<int>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setNodeGraphVariable :: dict<int, list<str>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setNodeGraphVariable :: dict<int, list<vec3>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setNodeGraphVariable :: dict<int, prefabId>
  f.setNodeGraphVariable(vStr, new prefabId(1n), vBool)
  // setNodeGraphVariable :: dict<int, str>
  f.setNodeGraphVariable(vStr, vStr, vBool)
  // setNodeGraphVariable :: dict<int, vec3>
  f.setNodeGraphVariable(vStr, vVec3, vBool)
  // setNodeGraphVariable :: dict<prefabId, bool>
  f.setNodeGraphVariable(vStr, vBool, vBool)
  // setNodeGraphVariable :: dict<prefabId, configId>
  f.setNodeGraphVariable(vStr, vConfig, vBool)
  // setNodeGraphVariable :: dict<prefabId, entity>
  f.setNodeGraphVariable(vStr, e, vBool)
  // setNodeGraphVariable :: dict<prefabId, faction>
  f.setNodeGraphVariable(vStr, vFaction, vBool)
  // setNodeGraphVariable :: dict<prefabId, float>
  f.setNodeGraphVariable(vStr, vFloat, vBool)
  // setNodeGraphVariable :: dict<prefabId, guid>
  f.setNodeGraphVariable(vStr, vGuid, vBool)
  // setNodeGraphVariable :: dict<prefabId, int>
  f.setNodeGraphVariable(vStr, vInt, vBool)
  // setNodeGraphVariable :: dict<prefabId, list<bool>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setNodeGraphVariable :: dict<prefabId, list<configId>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setNodeGraphVariable :: dict<prefabId, list<entity>>
  f.setNodeGraphVariable(vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setNodeGraphVariable :: dict<prefabId, list<faction>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setNodeGraphVariable :: dict<prefabId, list<float>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setNodeGraphVariable :: dict<prefabId, list<guid>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setNodeGraphVariable :: dict<prefabId, list<int>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setNodeGraphVariable :: dict<prefabId, list<str>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setNodeGraphVariable :: dict<prefabId, list<vec3>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setNodeGraphVariable :: dict<prefabId, prefabId>
  f.setNodeGraphVariable(vStr, new prefabId(1n), vBool)
  // setNodeGraphVariable :: dict<prefabId, str>
  f.setNodeGraphVariable(vStr, vStr, vBool)
  // setNodeGraphVariable :: dict<prefabId, vec3>
  f.setNodeGraphVariable(vStr, vVec3, vBool)
  // setNodeGraphVariable :: dict<str, bool>
  f.setNodeGraphVariable(vStr, vBool, vBool)
  // setNodeGraphVariable :: dict<str, configId>
  f.setNodeGraphVariable(vStr, vConfig, vBool)
  // setNodeGraphVariable :: dict<str, entity>
  f.setNodeGraphVariable(vStr, e, vBool)
  // setNodeGraphVariable :: dict<str, faction>
  f.setNodeGraphVariable(vStr, vFaction, vBool)
  // setNodeGraphVariable :: dict<str, float>
  f.setNodeGraphVariable(vStr, vFloat, vBool)
  // setNodeGraphVariable :: dict<str, guid>
  f.setNodeGraphVariable(vStr, vGuid, vBool)
  // setNodeGraphVariable :: dict<str, int>
  f.setNodeGraphVariable(vStr, vInt, vBool)
  // setNodeGraphVariable :: dict<str, list<bool>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // setNodeGraphVariable :: dict<str, list<configId>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vBool)
  // setNodeGraphVariable :: dict<str, list<entity>>
  f.setNodeGraphVariable(vStr, f.assemblyList([e, e, e], "entity"), vBool)
  // setNodeGraphVariable :: dict<str, list<faction>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFaction, vFaction, vFaction], "faction"), vBool)
  // setNodeGraphVariable :: dict<str, list<float>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vFloat, vFloat, vFloat], "float"), vBool)
  // setNodeGraphVariable :: dict<str, list<guid>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vGuid, vGuid, vGuid], "guid"), vBool)
  // setNodeGraphVariable :: dict<str, list<int>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vInt, vInt, vInt], "int"), vBool)
  // setNodeGraphVariable :: dict<str, list<str>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vStr, vStr, vStr], "str"), vBool)
  // setNodeGraphVariable :: dict<str, list<vec3>>
  f.setNodeGraphVariable(vStr, f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vBool)
  // setNodeGraphVariable :: dict<str, prefabId>
  f.setNodeGraphVariable(vStr, new prefabId(1n), vBool)
  // setNodeGraphVariable :: dict<str, str>
  f.setNodeGraphVariable(vStr, vStr, vBool)
  // setNodeGraphVariable :: dict<str, vec3>
  f.setNodeGraphVariable(vStr, vVec3, vBool)
  // getNodeGraphVariable :: bool
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: configId
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: entity
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: faction
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: float
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: guid
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: int
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: prefabId
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: str
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: vec3
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: list<bool>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: list<configId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: list<entity>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: list<faction>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: list<float>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: list<guid>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: list<int>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: list<prefabId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: list<str>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: list<vec3>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, bool>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, configId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, entity>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, faction>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, float>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, guid>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, int>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, list<bool>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, list<configId>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, list<entity>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, list<faction>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, list<float>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, list<guid>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, list<int>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, list<str>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, list<vec3>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, prefabId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, str>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<configId, vec3>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, bool>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, configId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, entity>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, faction>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, float>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, guid>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, int>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, list<bool>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, list<configId>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, list<entity>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, list<faction>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, list<float>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, list<guid>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, list<int>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, list<str>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, list<vec3>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, prefabId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, str>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<entity, vec3>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, bool>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, configId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, entity>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, faction>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, float>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, guid>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, int>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, list<bool>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, list<configId>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, list<entity>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, list<faction>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, list<float>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, list<guid>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, list<int>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, list<str>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, list<vec3>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, prefabId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, str>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<faction, vec3>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, bool>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, configId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, entity>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, faction>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, float>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, guid>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, int>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, list<bool>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, list<configId>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, list<entity>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, list<faction>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, list<float>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, list<guid>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, list<int>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, list<str>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, list<vec3>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, prefabId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, str>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<guid, vec3>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, bool>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, configId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, entity>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, faction>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, float>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, guid>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, int>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, list<bool>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, list<configId>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, list<entity>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, list<faction>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, list<float>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, list<guid>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, list<int>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, list<str>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, list<vec3>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, prefabId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, str>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<int, vec3>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, bool>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, configId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, entity>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, faction>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, float>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, guid>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, int>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, list<bool>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, list<configId>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, list<entity>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, list<faction>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, list<float>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, list<guid>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, list<int>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, list<str>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, list<vec3>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, prefabId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, str>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<prefabId, vec3>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, bool>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, configId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, entity>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, faction>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, float>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, guid>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, int>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, list<bool>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, list<configId>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, list<entity>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, list<faction>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, list<float>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, list<guid>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, list<int>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, list<str>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, list<vec3>>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, prefabId>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, str>
  f.getNodeGraphVariable(vStr)
  // getNodeGraphVariable :: dict<str, vec3>
  f.getNodeGraphVariable(vStr)
})

