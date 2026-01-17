import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_06 (wire)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741835 }).on('whenEntityIsCreated', (_evt, f) => {
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
  // setLocalVariable :: bool
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, vBool)
  // setLocalVariable :: configId
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, vConfig)
  // setLocalVariable :: entity
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, e)
  // setLocalVariable :: faction
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, vFaction)
  // setLocalVariable :: float
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, vFloat)
  // setLocalVariable :: guid
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, vGuid)
  // setLocalVariable :: int
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, vInt)
  // setLocalVariable :: prefabId
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, new prefabId(1n))
  // setLocalVariable :: str
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, vStr)
  // setLocalVariable :: vec3
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, vVec3)
  // setLocalVariable :: list<bool>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([vBool, vBool, vBool], "bool"))
  // setLocalVariable :: list<configId>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // setLocalVariable :: list<entity>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([e, e, e], "entity"))
  // setLocalVariable :: list<faction>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // setLocalVariable :: list<float>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // setLocalVariable :: list<guid>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // setLocalVariable :: list<int>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([vInt, vInt, vInt], "int"))
  // setLocalVariable :: list<prefabId>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"))
  // setLocalVariable :: list<str>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([vStr, vStr, vStr], "str"))
  // setLocalVariable :: list<vec3>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // getLocalVariable :: bool
  f.getLocalVariable(vBool)
  // getLocalVariable :: configId
  f.getLocalVariable(vConfig)
  // getLocalVariable :: entity
  f.getLocalVariable(e)
  // getLocalVariable :: faction
  f.getLocalVariable(vFaction)
  // getLocalVariable :: float
  f.getLocalVariable(vFloat)
  // getLocalVariable :: guid
  f.getLocalVariable(vGuid)
  // getLocalVariable :: int
  f.getLocalVariable(vInt)
  // getLocalVariable :: prefabId
  f.getLocalVariable(new prefabId(1n))
  // getLocalVariable :: str
  f.getLocalVariable(vStr)
  // getLocalVariable :: vec3
  f.getLocalVariable(vVec3)
  // getLocalVariable :: list<bool>
  f.getLocalVariable(f.assemblyList([vBool, vBool, vBool], "bool"))
  // getLocalVariable :: list<configId>
  f.getLocalVariable(f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // getLocalVariable :: list<entity>
  f.getLocalVariable(f.assemblyList([e, e, e], "entity"))
  // getLocalVariable :: list<faction>
  f.getLocalVariable(f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // getLocalVariable :: list<float>
  f.getLocalVariable(f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // getLocalVariable :: list<guid>
  f.getLocalVariable(f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // getLocalVariable :: list<int>
  f.getLocalVariable(f.assemblyList([vInt, vInt, vInt], "int"))
  // getLocalVariable :: list<prefabId>
  f.getLocalVariable(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"))
  // getLocalVariable :: list<str>
  f.getLocalVariable(f.assemblyList([vStr, vStr, vStr], "str"))
  // getLocalVariable :: list<vec3>
  f.getLocalVariable(f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
})

