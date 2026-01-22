import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_02 (literal)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741831 }).on('whenEntityIsCreated', (_evt, f) => {
  // equal :: bool
  f.equal(true, false)
  // equal :: configId
  f.equal(new configId(3n), new configId(4n))
  // equal :: entity
  f.equal(f.getSelfEntity(), f.getSelfEntity())
  // equal :: faction
  f.equal(new faction(7n), new faction(8n))
  // equal :: float
  f.equal(9.25, 10.25)
  // equal :: guid
  f.equal(new guid(11n), new guid(12n))
  // equal :: int
  f.equal(13n, 14n)
  // equal :: prefabId
  f.equal(new prefabId(15n), new prefabId(16n))
  // equal :: str
  f.equal("17", "18")
  // equal :: vec3
  f.equal(f.create3dVector(19, 20, 21), f.create3dVector(20, 21, 22))
  // assemblyList :: bool
  f.assemblyList(f.assemblyList([true, false, true], "bool"), "bool")
  // assemblyList :: configId
  f.assemblyList(f.assemblyList([2n, 3n, 4n], "config_id"), "config_id")
  // assemblyList :: entity
  f.assemblyList(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), "entity")
  // assemblyList :: faction
  f.assemblyList(f.assemblyList([5n, 6n, 7n], "faction"), "faction")
  // assemblyList :: float
  f.assemblyList(f.assemblyList([6.25, 7.25, 8.25], "float"), "float")
  // assemblyList :: guid
  f.assemblyList(f.assemblyList([7n, 8n, 9n], "guid"), "guid")
  // assemblyList :: int
  f.assemblyList(f.assemblyList([8n, 9n, 10n], "int"), "int")
  // assemblyList :: prefabId
  f.assemblyList(f.assemblyList([9n, 10n, 11n], "prefab_id"), "prefab_id")
  // assemblyList :: str
  f.assemblyList(f.assemblyList(["10", "11", "12"], "str"), "str")
  // assemblyList :: vec3
  f.assemblyList(f.assemblyList([[11, 12, 13], [12, 13, 14], [13, 14, 15]], "vec3"), "vec3")
  // listIterationLoop :: bool
  f.listIterationLoop(f.assemblyList([true, false, true], "bool"), () => { f.printString("literal_cb_listIterationLoop_1") })
  // listIterationLoop :: configId
  f.listIterationLoop(f.assemblyList([2n, 3n, 4n], "config_id"), () => { f.printString("literal_cb_listIterationLoop_1") })
  // listIterationLoop :: entity
  f.listIterationLoop(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), () => { f.printString("literal_cb_listIterationLoop_1") })
  // listIterationLoop :: faction
  f.listIterationLoop(f.assemblyList([5n, 6n, 7n], "faction"), () => { f.printString("literal_cb_listIterationLoop_1") })
  // listIterationLoop :: float
  f.listIterationLoop(f.assemblyList([6.25, 7.25, 8.25], "float"), () => { f.printString("literal_cb_listIterationLoop_1") })
  // listIterationLoop :: guid
  f.listIterationLoop(f.assemblyList([7n, 8n, 9n], "guid"), () => { f.printString("literal_cb_listIterationLoop_1") })
  // listIterationLoop :: int
  f.listIterationLoop(f.assemblyList([8n, 9n, 10n], "int"), () => { f.printString("literal_cb_listIterationLoop_1") })
  // listIterationLoop :: prefabId
  f.listIterationLoop(f.assemblyList([9n, 10n, 11n], "prefab_id"), () => { f.printString("literal_cb_listIterationLoop_1") })
  // listIterationLoop :: str
  f.listIterationLoop(f.assemblyList(["10", "11", "12"], "str"), () => { f.printString("literal_cb_listIterationLoop_1") })
  // listIterationLoop :: vec3
  f.listIterationLoop(f.assemblyList([[11, 12, 13], [12, 13, 14], [13, 14, 15]], "vec3"), () => { f.printString("literal_cb_listIterationLoop_1") })
  // insertValueIntoList :: bool
  f.insertValueIntoList(f.assemblyList([true, false, true], "bool"), 2n, true)
  // insertValueIntoList :: configId
  f.insertValueIntoList(f.assemblyList([4n, 5n, 6n], "config_id"), 5n, new configId(6n))
  // insertValueIntoList :: entity
  f.insertValueIntoList(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), 9n, f.getSelfEntity())
  // insertValueIntoList :: faction
  f.insertValueIntoList(f.assemblyList([11n, 12n, 13n], "faction"), 12n, new faction(13n))
  // insertValueIntoList :: float
  f.insertValueIntoList(f.assemblyList([14.25, 15.25, 16.25], "float"), 15n, 16.25)
  // insertValueIntoList :: guid
  f.insertValueIntoList(f.assemblyList([17n, 18n, 19n], "guid"), 18n, new guid(19n))
  // insertValueIntoList :: int
  f.insertValueIntoList(f.assemblyList([20n, 21n, 22n], "int"), 21n, 22n)
  // insertValueIntoList :: prefabId
  f.insertValueIntoList(f.assemblyList([23n, 24n, 25n], "prefab_id"), 24n, new prefabId(25n))
  // insertValueIntoList :: str
  f.insertValueIntoList(f.assemblyList(["26", "27", "28"], "str"), 27n, "28")
  // insertValueIntoList :: vec3
  f.insertValueIntoList(f.assemblyList([[29, 30, 31], [30, 31, 32], [31, 32, 33]], "vec3"), 30n, f.create3dVector(31, 32, 33))
  // modifyValueInList :: bool
  f.modifyValueInList(f.assemblyList([true, false, true], "bool"), 2n, true)
  // modifyValueInList :: configId
  f.modifyValueInList(f.assemblyList([4n, 5n, 6n], "config_id"), 5n, new configId(6n))
  // modifyValueInList :: entity
  f.modifyValueInList(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), 9n, f.getSelfEntity())
  // modifyValueInList :: faction
  f.modifyValueInList(f.assemblyList([11n, 12n, 13n], "faction"), 12n, new faction(13n))
  // modifyValueInList :: float
  f.modifyValueInList(f.assemblyList([14.25, 15.25, 16.25], "float"), 15n, 16.25)
  // modifyValueInList :: guid
  f.modifyValueInList(f.assemblyList([17n, 18n, 19n], "guid"), 18n, new guid(19n))
  // modifyValueInList :: int
  f.modifyValueInList(f.assemblyList([20n, 21n, 22n], "int"), 21n, 22n)
  // modifyValueInList :: prefabId
  f.modifyValueInList(f.assemblyList([23n, 24n, 25n], "prefab_id"), 24n, new prefabId(25n))
  // modifyValueInList :: str
  f.modifyValueInList(f.assemblyList(["26", "27", "28"], "str"), 27n, "28")
  // modifyValueInList :: vec3
  f.modifyValueInList(f.assemblyList([[29, 30, 31], [30, 31, 32], [31, 32, 33]], "vec3"), 30n, f.create3dVector(31, 32, 33))
  // removeValueFromList :: bool
  f.removeValueFromList(f.assemblyList([true, false, true], "bool"), 2n)
  // removeValueFromList :: configId
  f.removeValueFromList(f.assemblyList([3n, 4n, 5n], "config_id"), 4n)
  // removeValueFromList :: entity
  f.removeValueFromList(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), 7n)
  // removeValueFromList :: faction
  f.removeValueFromList(f.assemblyList([8n, 9n, 10n], "faction"), 9n)
  // removeValueFromList :: float
  f.removeValueFromList(f.assemblyList([10.25, 11.25, 12.25], "float"), 11n)
  // removeValueFromList :: guid
  f.removeValueFromList(f.assemblyList([12n, 13n, 14n], "guid"), 13n)
  // removeValueFromList :: int
  f.removeValueFromList(f.assemblyList([14n, 15n, 16n], "int"), 15n)
  // removeValueFromList :: prefabId
  f.removeValueFromList(f.assemblyList([16n, 17n, 18n], "prefab_id"), 17n)
  // removeValueFromList :: str
  f.removeValueFromList(f.assemblyList(["18", "19", "20"], "str"), 19n)
  // removeValueFromList :: vec3
  f.removeValueFromList(f.assemblyList([[20, 21, 22], [21, 22, 23], [22, 23, 24]], "vec3"), 21n)
  // concatenateList :: bool
  f.concatenateList(f.assemblyList([true, false, true], "bool"), f.assemblyList([false, true, false], "bool"))
  // concatenateList :: configId
  f.concatenateList(f.assemblyList([3n, 4n, 5n], "config_id"), f.assemblyList([4n, 5n, 6n], "config_id"))
  // concatenateList :: entity
  f.concatenateList(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // concatenateList :: faction
  f.concatenateList(f.assemblyList([9n, 10n, 11n], "faction"), f.assemblyList([10n, 11n, 12n], "faction"))
  // concatenateList :: float
  f.concatenateList(f.assemblyList([11.25, 12.25, 13.25], "float"), f.assemblyList([12.25, 13.25, 14.25], "float"))
  // concatenateList :: guid
  f.concatenateList(f.assemblyList([13n, 14n, 15n], "guid"), f.assemblyList([14n, 15n, 16n], "guid"))
  // concatenateList :: int
  f.concatenateList(f.assemblyList([15n, 16n, 17n], "int"), f.assemblyList([16n, 17n, 18n], "int"))
  // concatenateList :: prefabId
  f.concatenateList(f.assemblyList([17n, 18n, 19n], "prefab_id"), f.assemblyList([18n, 19n, 20n], "prefab_id"))
  // concatenateList :: str
  f.concatenateList(f.assemblyList(["19", "20", "21"], "str"), f.assemblyList(["20", "21", "22"], "str"))
  // concatenateList :: vec3
  f.concatenateList(f.assemblyList([[21, 22, 23], [22, 23, 24], [23, 24, 25]], "vec3"), f.assemblyList([[22, 23, 24], [23, 24, 25], [24, 25, 26]], "vec3"))
  // clearList :: bool
  f.clearList(f.assemblyList([true, false, true], "bool"))
  // clearList :: configId
  f.clearList(f.assemblyList([2n, 3n, 4n], "config_id"))
  // clearList :: entity
  f.clearList(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // clearList :: faction
  f.clearList(f.assemblyList([5n, 6n, 7n], "faction"))
  // clearList :: float
  f.clearList(f.assemblyList([6.25, 7.25, 8.25], "float"))
  // clearList :: guid
  f.clearList(f.assemblyList([7n, 8n, 9n], "guid"))
  // clearList :: int
  f.clearList(f.assemblyList([8n, 9n, 10n], "int"))
  // clearList :: prefabId
  f.clearList(f.assemblyList([9n, 10n, 11n], "prefab_id"))
  // clearList :: str
  f.clearList(f.assemblyList(["10", "11", "12"], "str"))
  // clearList :: vec3
  f.clearList(f.assemblyList([[11, 12, 13], [12, 13, 14], [13, 14, 15]], "vec3"))
  // searchListAndReturnValueId :: bool
  f.searchListAndReturnValueId(f.assemblyList([true, false, true], "bool"), false)
  // searchListAndReturnValueId :: configId
  f.searchListAndReturnValueId(f.assemblyList([3n, 4n, 5n], "config_id"), new configId(4n))
  // searchListAndReturnValueId :: entity
  f.searchListAndReturnValueId(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.getSelfEntity())
  // searchListAndReturnValueId :: faction
  f.searchListAndReturnValueId(f.assemblyList([8n, 9n, 10n], "faction"), new faction(9n))
  // searchListAndReturnValueId :: float
  f.searchListAndReturnValueId(f.assemblyList([10.25, 11.25, 12.25], "float"), 11.25)
  // searchListAndReturnValueId :: guid
  f.searchListAndReturnValueId(f.assemblyList([12n, 13n, 14n], "guid"), new guid(13n))
  // searchListAndReturnValueId :: int
  f.searchListAndReturnValueId(f.assemblyList([14n, 15n, 16n], "int"), 15n)
  // searchListAndReturnValueId :: prefabId
  f.searchListAndReturnValueId(f.assemblyList([16n, 17n, 18n], "prefab_id"), new prefabId(17n))
  // searchListAndReturnValueId :: str
  f.searchListAndReturnValueId(f.assemblyList(["18", "19", "20"], "str"), "19")
  // searchListAndReturnValueId :: vec3
  f.searchListAndReturnValueId(f.assemblyList([[20, 21, 22], [21, 22, 23], [22, 23, 24]], "vec3"), f.create3dVector(21, 22, 23))
  // getCorrespondingValueFromList :: bool
  f.getCorrespondingValueFromList(f.assemblyList([true, false, true], "bool"), 2n)
  // getCorrespondingValueFromList :: configId
  f.getCorrespondingValueFromList(f.assemblyList([3n, 4n, 5n], "config_id"), 4n)
  // getCorrespondingValueFromList :: entity
  f.getCorrespondingValueFromList(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), 7n)
  // getCorrespondingValueFromList :: faction
  f.getCorrespondingValueFromList(f.assemblyList([8n, 9n, 10n], "faction"), 9n)
  // getCorrespondingValueFromList :: float
  f.getCorrespondingValueFromList(f.assemblyList([10.25, 11.25, 12.25], "float"), 11n)
  // getCorrespondingValueFromList :: guid
  f.getCorrespondingValueFromList(f.assemblyList([12n, 13n, 14n], "guid"), 13n)
  // getCorrespondingValueFromList :: int
  f.getCorrespondingValueFromList(f.assemblyList([14n, 15n, 16n], "int"), 15n)
  // getCorrespondingValueFromList :: prefabId
  f.getCorrespondingValueFromList(f.assemblyList([16n, 17n, 18n], "prefab_id"), 17n)
  // getCorrespondingValueFromList :: str
  f.getCorrespondingValueFromList(f.assemblyList(["18", "19", "20"], "str"), 19n)
  // getCorrespondingValueFromList :: vec3
  f.getCorrespondingValueFromList(f.assemblyList([[20, 21, 22], [21, 22, 23], [22, 23, 24]], "vec3"), 21n)
  // getListLength :: bool
  f.getListLength(f.assemblyList([true, false, true], "bool"))
  // getListLength :: configId
  f.getListLength(f.assemblyList([2n, 3n, 4n], "config_id"))
  // getListLength :: entity
  f.getListLength(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // getListLength :: faction
  f.getListLength(f.assemblyList([5n, 6n, 7n], "faction"))
  // getListLength :: float
  f.getListLength(f.assemblyList([6.25, 7.25, 8.25], "float"))
  // getListLength :: guid
  f.getListLength(f.assemblyList([7n, 8n, 9n], "guid"))
  // getListLength :: int
  f.getListLength(f.assemblyList([8n, 9n, 10n], "int"))
  // getListLength :: prefabId
  f.getListLength(f.assemblyList([9n, 10n, 11n], "prefab_id"))
  // getListLength :: str
  f.getListLength(f.assemblyList(["10", "11", "12"], "str"))
  // getListLength :: vec3
  f.getListLength(f.assemblyList([[11, 12, 13], [12, 13, 14], [13, 14, 15]], "vec3"))
  // listIncludesThisValue :: bool
  f.listIncludesThisValue(f.assemblyList([true, false, true], "bool"), false)
  // listIncludesThisValue :: configId
  f.listIncludesThisValue(f.assemblyList([3n, 4n, 5n], "config_id"), new configId(4n))
  // listIncludesThisValue :: entity
  f.listIncludesThisValue(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.getSelfEntity())
  // listIncludesThisValue :: faction
  f.listIncludesThisValue(f.assemblyList([8n, 9n, 10n], "faction"), new faction(9n))
  // listIncludesThisValue :: float
  f.listIncludesThisValue(f.assemblyList([10.25, 11.25, 12.25], "float"), 11.25)
  // listIncludesThisValue :: guid
  f.listIncludesThisValue(f.assemblyList([12n, 13n, 14n], "guid"), new guid(13n))
  // listIncludesThisValue :: int
  f.listIncludesThisValue(f.assemblyList([14n, 15n, 16n], "int"), 15n)
  // listIncludesThisValue :: prefabId
  f.listIncludesThisValue(f.assemblyList([16n, 17n, 18n], "prefab_id"), new prefabId(17n))
  // listIncludesThisValue :: str
  f.listIncludesThisValue(f.assemblyList(["18", "19", "20"], "str"), "19")
  // listIncludesThisValue :: vec3
  f.listIncludesThisValue(f.assemblyList([[20, 21, 22], [21, 22, 23], [22, 23, 24]], "vec3"), f.create3dVector(21, 22, 23))
})

