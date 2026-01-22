import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_02 (wire)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741831 }).on('whenEntityIsCreated', (_evt, f) => {
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
  // equal :: bool
  f.equal(vBool, vBool)
  // equal :: configId
  f.equal(vConfig, vConfig)
  // equal :: entity
  f.equal(e, e)
  // equal :: faction
  f.equal(vFaction, vFaction)
  // equal :: float
  f.equal(vFloat, vFloat)
  // equal :: guid
  f.equal(vGuid, vGuid)
  // equal :: int
  f.equal(vInt, vInt)
  // equal :: prefabId
  f.equal(new prefabId(1n), new prefabId(1n))
  // equal :: str
  f.equal(vStr, vStr)
  // equal :: vec3
  f.equal(vVec3, vVec3)
  // assemblyList :: bool
  f.assemblyList(f.assemblyList([vBool, vBool, vBool], "bool"), "bool")
  // assemblyList :: configId
  f.assemblyList(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), "config_id")
  // assemblyList :: entity
  f.assemblyList(f.assemblyList([e, e, e], "entity"), "entity")
  // assemblyList :: faction
  f.assemblyList(f.assemblyList([vFaction, vFaction, vFaction], "faction"), "faction")
  // assemblyList :: float
  f.assemblyList(f.assemblyList([vFloat, vFloat, vFloat], "float"), "float")
  // assemblyList :: guid
  f.assemblyList(f.assemblyList([vGuid, vGuid, vGuid], "guid"), "guid")
  // assemblyList :: int
  f.assemblyList(f.assemblyList([vInt, vInt, vInt], "int"), "int")
  // assemblyList :: prefabId
  f.assemblyList(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), "prefab_id")
  // assemblyList :: str
  f.assemblyList(f.assemblyList([vStr, vStr, vStr], "str"), "str")
  // assemblyList :: vec3
  f.assemblyList(f.assemblyList([vVec3, vVec3, vVec3], "vec3"), "vec3")
  // listIterationLoop :: bool
  f.listIterationLoop(f.assemblyList([vBool, vBool, vBool], "bool"), () => { f.printString("wire_cb_listIterationLoop_1") })
  // listIterationLoop :: configId
  f.listIterationLoop(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), () => { f.printString("wire_cb_listIterationLoop_1") })
  // listIterationLoop :: entity
  f.listIterationLoop(f.assemblyList([e, e, e], "entity"), () => { f.printString("wire_cb_listIterationLoop_1") })
  // listIterationLoop :: faction
  f.listIterationLoop(f.assemblyList([vFaction, vFaction, vFaction], "faction"), () => { f.printString("wire_cb_listIterationLoop_1") })
  // listIterationLoop :: float
  f.listIterationLoop(f.assemblyList([vFloat, vFloat, vFloat], "float"), () => { f.printString("wire_cb_listIterationLoop_1") })
  // listIterationLoop :: guid
  f.listIterationLoop(f.assemblyList([vGuid, vGuid, vGuid], "guid"), () => { f.printString("wire_cb_listIterationLoop_1") })
  // listIterationLoop :: int
  f.listIterationLoop(f.assemblyList([vInt, vInt, vInt], "int"), () => { f.printString("wire_cb_listIterationLoop_1") })
  // listIterationLoop :: prefabId
  f.listIterationLoop(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), () => { f.printString("wire_cb_listIterationLoop_1") })
  // listIterationLoop :: str
  f.listIterationLoop(f.assemblyList([vStr, vStr, vStr], "str"), () => { f.printString("wire_cb_listIterationLoop_1") })
  // listIterationLoop :: vec3
  f.listIterationLoop(f.assemblyList([vVec3, vVec3, vVec3], "vec3"), () => { f.printString("wire_cb_listIterationLoop_1") })
  // insertValueIntoList :: bool
  f.insertValueIntoList(f.assemblyList([vBool, vBool, vBool], "bool"), vInt, vBool)
  // insertValueIntoList :: configId
  f.insertValueIntoList(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vInt, vConfig)
  // insertValueIntoList :: entity
  f.insertValueIntoList(f.assemblyList([e, e, e], "entity"), vInt, e)
  // insertValueIntoList :: faction
  f.insertValueIntoList(f.assemblyList([vFaction, vFaction, vFaction], "faction"), vInt, vFaction)
  // insertValueIntoList :: float
  f.insertValueIntoList(f.assemblyList([vFloat, vFloat, vFloat], "float"), vInt, vFloat)
  // insertValueIntoList :: guid
  f.insertValueIntoList(f.assemblyList([vGuid, vGuid, vGuid], "guid"), vInt, vGuid)
  // insertValueIntoList :: int
  f.insertValueIntoList(f.assemblyList([vInt, vInt, vInt], "int"), vInt, vInt)
  // insertValueIntoList :: prefabId
  f.insertValueIntoList(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), vInt, new prefabId(1n))
  // insertValueIntoList :: str
  f.insertValueIntoList(f.assemblyList([vStr, vStr, vStr], "str"), vInt, vStr)
  // insertValueIntoList :: vec3
  f.insertValueIntoList(f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vInt, vVec3)
  // modifyValueInList :: bool
  f.modifyValueInList(f.assemblyList([vBool, vBool, vBool], "bool"), vInt, vBool)
  // modifyValueInList :: configId
  f.modifyValueInList(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vInt, vConfig)
  // modifyValueInList :: entity
  f.modifyValueInList(f.assemblyList([e, e, e], "entity"), vInt, e)
  // modifyValueInList :: faction
  f.modifyValueInList(f.assemblyList([vFaction, vFaction, vFaction], "faction"), vInt, vFaction)
  // modifyValueInList :: float
  f.modifyValueInList(f.assemblyList([vFloat, vFloat, vFloat], "float"), vInt, vFloat)
  // modifyValueInList :: guid
  f.modifyValueInList(f.assemblyList([vGuid, vGuid, vGuid], "guid"), vInt, vGuid)
  // modifyValueInList :: int
  f.modifyValueInList(f.assemblyList([vInt, vInt, vInt], "int"), vInt, vInt)
  // modifyValueInList :: prefabId
  f.modifyValueInList(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), vInt, new prefabId(1n))
  // modifyValueInList :: str
  f.modifyValueInList(f.assemblyList([vStr, vStr, vStr], "str"), vInt, vStr)
  // modifyValueInList :: vec3
  f.modifyValueInList(f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vInt, vVec3)
  // removeValueFromList :: bool
  f.removeValueFromList(f.assemblyList([vBool, vBool, vBool], "bool"), vInt)
  // removeValueFromList :: configId
  f.removeValueFromList(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vInt)
  // removeValueFromList :: entity
  f.removeValueFromList(f.assemblyList([e, e, e], "entity"), vInt)
  // removeValueFromList :: faction
  f.removeValueFromList(f.assemblyList([vFaction, vFaction, vFaction], "faction"), vInt)
  // removeValueFromList :: float
  f.removeValueFromList(f.assemblyList([vFloat, vFloat, vFloat], "float"), vInt)
  // removeValueFromList :: guid
  f.removeValueFromList(f.assemblyList([vGuid, vGuid, vGuid], "guid"), vInt)
  // removeValueFromList :: int
  f.removeValueFromList(f.assemblyList([vInt, vInt, vInt], "int"), vInt)
  // removeValueFromList :: prefabId
  f.removeValueFromList(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), vInt)
  // removeValueFromList :: str
  f.removeValueFromList(f.assemblyList([vStr, vStr, vStr], "str"), vInt)
  // removeValueFromList :: vec3
  f.removeValueFromList(f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vInt)
  // concatenateList :: bool
  f.concatenateList(f.assemblyList([vBool, vBool, vBool], "bool"), f.assemblyList([vBool, vBool, vBool], "bool"))
  // concatenateList :: configId
  f.concatenateList(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // concatenateList :: entity
  f.concatenateList(f.assemblyList([e, e, e], "entity"), f.assemblyList([e, e, e], "entity"))
  // concatenateList :: faction
  f.concatenateList(f.assemblyList([vFaction, vFaction, vFaction], "faction"), f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // concatenateList :: float
  f.concatenateList(f.assemblyList([vFloat, vFloat, vFloat], "float"), f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // concatenateList :: guid
  f.concatenateList(f.assemblyList([vGuid, vGuid, vGuid], "guid"), f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // concatenateList :: int
  f.concatenateList(f.assemblyList([vInt, vInt, vInt], "int"), f.assemblyList([vInt, vInt, vInt], "int"))
  // concatenateList :: prefabId
  f.concatenateList(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"))
  // concatenateList :: str
  f.concatenateList(f.assemblyList([vStr, vStr, vStr], "str"), f.assemblyList([vStr, vStr, vStr], "str"))
  // concatenateList :: vec3
  f.concatenateList(f.assemblyList([vVec3, vVec3, vVec3], "vec3"), f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // clearList :: bool
  f.clearList(f.assemblyList([vBool, vBool, vBool], "bool"))
  // clearList :: configId
  f.clearList(f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // clearList :: entity
  f.clearList(f.assemblyList([e, e, e], "entity"))
  // clearList :: faction
  f.clearList(f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // clearList :: float
  f.clearList(f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // clearList :: guid
  f.clearList(f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // clearList :: int
  f.clearList(f.assemblyList([vInt, vInt, vInt], "int"))
  // clearList :: prefabId
  f.clearList(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"))
  // clearList :: str
  f.clearList(f.assemblyList([vStr, vStr, vStr], "str"))
  // clearList :: vec3
  f.clearList(f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // searchListAndReturnValueId :: bool
  f.searchListAndReturnValueId(f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // searchListAndReturnValueId :: configId
  f.searchListAndReturnValueId(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vConfig)
  // searchListAndReturnValueId :: entity
  f.searchListAndReturnValueId(f.assemblyList([e, e, e], "entity"), e)
  // searchListAndReturnValueId :: faction
  f.searchListAndReturnValueId(f.assemblyList([vFaction, vFaction, vFaction], "faction"), vFaction)
  // searchListAndReturnValueId :: float
  f.searchListAndReturnValueId(f.assemblyList([vFloat, vFloat, vFloat], "float"), vFloat)
  // searchListAndReturnValueId :: guid
  f.searchListAndReturnValueId(f.assemblyList([vGuid, vGuid, vGuid], "guid"), vGuid)
  // searchListAndReturnValueId :: int
  f.searchListAndReturnValueId(f.assemblyList([vInt, vInt, vInt], "int"), vInt)
  // searchListAndReturnValueId :: prefabId
  f.searchListAndReturnValueId(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), new prefabId(1n))
  // searchListAndReturnValueId :: str
  f.searchListAndReturnValueId(f.assemblyList([vStr, vStr, vStr], "str"), vStr)
  // searchListAndReturnValueId :: vec3
  f.searchListAndReturnValueId(f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vVec3)
  // getCorrespondingValueFromList :: bool
  f.getCorrespondingValueFromList(f.assemblyList([vBool, vBool, vBool], "bool"), vInt)
  // getCorrespondingValueFromList :: configId
  f.getCorrespondingValueFromList(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vInt)
  // getCorrespondingValueFromList :: entity
  f.getCorrespondingValueFromList(f.assemblyList([e, e, e], "entity"), vInt)
  // getCorrespondingValueFromList :: faction
  f.getCorrespondingValueFromList(f.assemblyList([vFaction, vFaction, vFaction], "faction"), vInt)
  // getCorrespondingValueFromList :: float
  f.getCorrespondingValueFromList(f.assemblyList([vFloat, vFloat, vFloat], "float"), vInt)
  // getCorrespondingValueFromList :: guid
  f.getCorrespondingValueFromList(f.assemblyList([vGuid, vGuid, vGuid], "guid"), vInt)
  // getCorrespondingValueFromList :: int
  f.getCorrespondingValueFromList(f.assemblyList([vInt, vInt, vInt], "int"), vInt)
  // getCorrespondingValueFromList :: prefabId
  f.getCorrespondingValueFromList(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), vInt)
  // getCorrespondingValueFromList :: str
  f.getCorrespondingValueFromList(f.assemblyList([vStr, vStr, vStr], "str"), vInt)
  // getCorrespondingValueFromList :: vec3
  f.getCorrespondingValueFromList(f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vInt)
  // getListLength :: bool
  f.getListLength(f.assemblyList([vBool, vBool, vBool], "bool"))
  // getListLength :: configId
  f.getListLength(f.assemblyList([vConfig, vConfig, vConfig], "config_id"))
  // getListLength :: entity
  f.getListLength(f.assemblyList([e, e, e], "entity"))
  // getListLength :: faction
  f.getListLength(f.assemblyList([vFaction, vFaction, vFaction], "faction"))
  // getListLength :: float
  f.getListLength(f.assemblyList([vFloat, vFloat, vFloat], "float"))
  // getListLength :: guid
  f.getListLength(f.assemblyList([vGuid, vGuid, vGuid], "guid"))
  // getListLength :: int
  f.getListLength(f.assemblyList([vInt, vInt, vInt], "int"))
  // getListLength :: prefabId
  f.getListLength(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"))
  // getListLength :: str
  f.getListLength(f.assemblyList([vStr, vStr, vStr], "str"))
  // getListLength :: vec3
  f.getListLength(f.assemblyList([vVec3, vVec3, vVec3], "vec3"))
  // listIncludesThisValue :: bool
  f.listIncludesThisValue(f.assemblyList([vBool, vBool, vBool], "bool"), vBool)
  // listIncludesThisValue :: configId
  f.listIncludesThisValue(f.assemblyList([vConfig, vConfig, vConfig], "config_id"), vConfig)
  // listIncludesThisValue :: entity
  f.listIncludesThisValue(f.assemblyList([e, e, e], "entity"), e)
  // listIncludesThisValue :: faction
  f.listIncludesThisValue(f.assemblyList([vFaction, vFaction, vFaction], "faction"), vFaction)
  // listIncludesThisValue :: float
  f.listIncludesThisValue(f.assemblyList([vFloat, vFloat, vFloat], "float"), vFloat)
  // listIncludesThisValue :: guid
  f.listIncludesThisValue(f.assemblyList([vGuid, vGuid, vGuid], "guid"), vGuid)
  // listIncludesThisValue :: int
  f.listIncludesThisValue(f.assemblyList([vInt, vInt, vInt], "int"), vInt)
  // listIncludesThisValue :: prefabId
  f.listIncludesThisValue(f.assemblyList([new prefabId(1n), new prefabId(1n), new prefabId(1n)], "prefab_id"), new prefabId(1n))
  // listIncludesThisValue :: str
  f.listIncludesThisValue(f.assemblyList([vStr, vStr, vStr], "str"), vStr)
  // listIncludesThisValue :: vec3
  f.listIncludesThisValue(f.assemblyList([vVec3, vVec3, vVec3], "vec3"), vVec3)
})

