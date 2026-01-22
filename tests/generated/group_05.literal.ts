import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_05 (literal)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741834 }).on('whenEntityIsCreated', (_evt, f) => {
  // createDictionary :: dict<configId, bool>
  f.createDictionary(f.assemblyList([1n, 2n, 3n], "config_id"), f.assemblyList([false, true, false], "bool"))
  // createDictionary :: dict<configId, configId>
  f.createDictionary(f.assemblyList([3n, 4n, 5n], "config_id"), f.assemblyList([4n, 5n, 6n], "config_id"))
  // createDictionary :: dict<configId, entity>
  f.createDictionary(f.assemblyList([5n, 6n, 7n], "config_id"), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // createDictionary :: dict<configId, faction>
  f.createDictionary(f.assemblyList([8n, 9n, 10n], "config_id"), f.assemblyList([9n, 10n, 11n], "faction"))
  // createDictionary :: dict<configId, float>
  f.createDictionary(f.assemblyList([10n, 11n, 12n], "config_id"), f.assemblyList([11.25, 12.25, 13.25], "float"))
  // createDictionary :: dict<configId, guid>
  f.createDictionary(f.assemblyList([12n, 13n, 14n], "config_id"), f.assemblyList([13n, 14n, 15n], "guid"))
  // createDictionary :: dict<configId, int>
  f.createDictionary(f.assemblyList([14n, 15n, 16n], "config_id"), f.assemblyList([15n, 16n, 17n], "int"))
  // createDictionary :: dict<configId, prefabId>
  f.createDictionary(f.assemblyList([16n, 17n, 18n], "config_id"), f.assemblyList([17n, 18n, 19n], "prefab_id"))
  // createDictionary :: dict<configId, str>
  f.createDictionary(f.assemblyList([18n, 19n, 20n], "config_id"), f.assemblyList(["19", "20", "21"], "str"))
  // createDictionary :: dict<configId, vec3>
  f.createDictionary(f.assemblyList([20n, 21n, 22n], "config_id"), f.assemblyList([[21, 22, 23], [22, 23, 24], [23, 24, 25]], "vec3"))
  // createDictionary :: dict<entity, bool>
  f.createDictionary(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.assemblyList([false, true, false], "bool"))
  // createDictionary :: dict<entity, configId>
  f.createDictionary(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.assemblyList([27n, 28n, 29n], "config_id"))
  // createDictionary :: dict<entity, entity>
  f.createDictionary(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // createDictionary :: dict<entity, faction>
  f.createDictionary(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.assemblyList([34n, 35n, 36n], "faction"))
  // createDictionary :: dict<entity, float>
  f.createDictionary(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.assemblyList([37.25, 38.25, 39.25], "float"))
  // createDictionary :: dict<entity, guid>
  f.createDictionary(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.assemblyList([40n, 41n, 42n], "guid"))
  // createDictionary :: dict<entity, int>
  f.createDictionary(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.assemblyList([43n, 44n, 45n], "int"))
  // createDictionary :: dict<entity, prefabId>
  f.createDictionary(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.assemblyList([46n, 47n, 48n], "prefab_id"))
  // createDictionary :: dict<entity, str>
  f.createDictionary(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.assemblyList(["49", "50", "51"], "str"))
  // createDictionary :: dict<entity, vec3>
  f.createDictionary(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), f.assemblyList([[52, 53, 54], [53, 54, 55], [54, 55, 56]], "vec3"))
  // createDictionary :: dict<faction, bool>
  f.createDictionary(f.assemblyList([53n, 54n, 55n], "faction"), f.assemblyList([false, true, false], "bool"))
  // createDictionary :: dict<faction, configId>
  f.createDictionary(f.assemblyList([55n, 56n, 57n], "faction"), f.assemblyList([56n, 57n, 58n], "config_id"))
  // createDictionary :: dict<faction, entity>
  f.createDictionary(f.assemblyList([57n, 58n, 59n], "faction"), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // createDictionary :: dict<faction, faction>
  f.createDictionary(f.assemblyList([60n, 61n, 62n], "faction"), f.assemblyList([61n, 62n, 63n], "faction"))
  // createDictionary :: dict<faction, float>
  f.createDictionary(f.assemblyList([62n, 63n, 64n], "faction"), f.assemblyList([63.25, 64.25, 65.25], "float"))
  // createDictionary :: dict<faction, guid>
  f.createDictionary(f.assemblyList([64n, 65n, 66n], "faction"), f.assemblyList([65n, 66n, 67n], "guid"))
  // createDictionary :: dict<faction, int>
  f.createDictionary(f.assemblyList([66n, 67n, 68n], "faction"), f.assemblyList([67n, 68n, 69n], "int"))
  // createDictionary :: dict<faction, prefabId>
  f.createDictionary(f.assemblyList([68n, 69n, 70n], "faction"), f.assemblyList([69n, 70n, 71n], "prefab_id"))
  // createDictionary :: dict<faction, str>
  f.createDictionary(f.assemblyList([70n, 71n, 72n], "faction"), f.assemblyList(["71", "72", "73"], "str"))
  // createDictionary :: dict<faction, vec3>
  f.createDictionary(f.assemblyList([72n, 73n, 74n], "faction"), f.assemblyList([[73, 74, 75], [74, 75, 76], [75, 76, 77]], "vec3"))
  // createDictionary :: dict<guid, bool>
  f.createDictionary(f.assemblyList([74n, 75n, 76n], "guid"), f.assemblyList([true, false, true], "bool"))
  // createDictionary :: dict<guid, configId>
  f.createDictionary(f.assemblyList([76n, 77n, 78n], "guid"), f.assemblyList([77n, 78n, 79n], "config_id"))
  // createDictionary :: dict<guid, entity>
  f.createDictionary(f.assemblyList([78n, 79n, 80n], "guid"), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // createDictionary :: dict<guid, faction>
  f.createDictionary(f.assemblyList([81n, 82n, 83n], "guid"), f.assemblyList([82n, 83n, 84n], "faction"))
  // createDictionary :: dict<guid, float>
  f.createDictionary(f.assemblyList([83n, 84n, 85n], "guid"), f.assemblyList([84.25, 85.25, 86.25], "float"))
  // createDictionary :: dict<guid, guid>
  f.createDictionary(f.assemblyList([85n, 86n, 87n], "guid"), f.assemblyList([86n, 87n, 88n], "guid"))
  // createDictionary :: dict<guid, int>
  f.createDictionary(f.assemblyList([87n, 88n, 89n], "guid"), f.assemblyList([88n, 89n, 90n], "int"))
  // createDictionary :: dict<guid, prefabId>
  f.createDictionary(f.assemblyList([89n, 90n, 91n], "guid"), f.assemblyList([90n, 91n, 92n], "prefab_id"))
  // createDictionary :: dict<guid, str>
  f.createDictionary(f.assemblyList([91n, 92n, 93n], "guid"), f.assemblyList(["92", "93", "94"], "str"))
  // createDictionary :: dict<guid, vec3>
  f.createDictionary(f.assemblyList([93n, 94n, 95n], "guid"), f.assemblyList([[94, 95, 96], [95, 96, 97], [96, 97, 98]], "vec3"))
  // createDictionary :: dict<int, bool>
  f.createDictionary(f.assemblyList([95n, 96n, 97n], "int"), f.assemblyList([false, true, false], "bool"))
  // createDictionary :: dict<int, configId>
  f.createDictionary(f.assemblyList([97n, 98n, 99n], "int"), f.assemblyList([98n, 99n, 100n], "config_id"))
  // createDictionary :: dict<int, entity>
  f.createDictionary(f.assemblyList([99n, 100n, 101n], "int"), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // createDictionary :: dict<int, faction>
  f.createDictionary(f.assemblyList([102n, 103n, 104n], "int"), f.assemblyList([103n, 104n, 105n], "faction"))
  // createDictionary :: dict<int, float>
  f.createDictionary(f.assemblyList([104n, 105n, 106n], "int"), f.assemblyList([105.25, 106.25, 107.25], "float"))
  // createDictionary :: dict<int, guid>
  f.createDictionary(f.assemblyList([106n, 107n, 108n], "int"), f.assemblyList([107n, 108n, 109n], "guid"))
  // createDictionary :: dict<int, int>
  f.createDictionary(f.assemblyList([108n, 109n, 110n], "int"), f.assemblyList([109n, 110n, 111n], "int"))
  // createDictionary :: dict<int, prefabId>
  f.createDictionary(f.assemblyList([110n, 111n, 112n], "int"), f.assemblyList([111n, 112n, 113n], "prefab_id"))
  // createDictionary :: dict<int, str>
  f.createDictionary(f.assemblyList([112n, 113n, 114n], "int"), f.assemblyList(["113", "114", "115"], "str"))
  // createDictionary :: dict<int, vec3>
  f.createDictionary(f.assemblyList([114n, 115n, 116n], "int"), f.assemblyList([[115, 116, 117], [116, 117, 118], [117, 118, 119]], "vec3"))
  // createDictionary :: dict<prefabId, bool>
  f.createDictionary(f.assemblyList([116n, 117n, 118n], "prefab_id"), f.assemblyList([true, false, true], "bool"))
  // createDictionary :: dict<prefabId, configId>
  f.createDictionary(f.assemblyList([118n, 119n, 120n], "prefab_id"), f.assemblyList([119n, 120n, 121n], "config_id"))
  // createDictionary :: dict<prefabId, entity>
  f.createDictionary(f.assemblyList([120n, 121n, 122n], "prefab_id"), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // createDictionary :: dict<prefabId, faction>
  f.createDictionary(f.assemblyList([123n, 124n, 125n], "prefab_id"), f.assemblyList([124n, 125n, 126n], "faction"))
  // createDictionary :: dict<prefabId, float>
  f.createDictionary(f.assemblyList([125n, 126n, 127n], "prefab_id"), f.assemblyList([126.25, 127.25, 128.25], "float"))
  // createDictionary :: dict<prefabId, guid>
  f.createDictionary(f.assemblyList([127n, 128n, 129n], "prefab_id"), f.assemblyList([128n, 129n, 130n], "guid"))
  // createDictionary :: dict<prefabId, int>
  f.createDictionary(f.assemblyList([129n, 130n, 131n], "prefab_id"), f.assemblyList([130n, 131n, 132n], "int"))
  // createDictionary :: dict<prefabId, prefabId>
  f.createDictionary(f.assemblyList([131n, 132n, 133n], "prefab_id"), f.assemblyList([132n, 133n, 134n], "prefab_id"))
  // createDictionary :: dict<prefabId, str>
  f.createDictionary(f.assemblyList([133n, 134n, 135n], "prefab_id"), f.assemblyList(["134", "135", "136"], "str"))
  // createDictionary :: dict<prefabId, vec3>
  f.createDictionary(f.assemblyList([135n, 136n, 137n], "prefab_id"), f.assemblyList([[136, 137, 138], [137, 138, 139], [138, 139, 140]], "vec3"))
  // createDictionary :: dict<str, bool>
  f.createDictionary(f.assemblyList(["137", "138", "139"], "str"), f.assemblyList([false, true, false], "bool"))
  // createDictionary :: dict<str, configId>
  f.createDictionary(f.assemblyList(["139", "140", "141"], "str"), f.assemblyList([140n, 141n, 142n], "config_id"))
  // createDictionary :: dict<str, entity>
  f.createDictionary(f.assemblyList(["141", "142", "143"], "str"), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // createDictionary :: dict<str, faction>
  f.createDictionary(f.assemblyList(["144", "145", "146"], "str"), f.assemblyList([145n, 146n, 147n], "faction"))
  // createDictionary :: dict<str, float>
  f.createDictionary(f.assemblyList(["146", "147", "148"], "str"), f.assemblyList([147.25, 148.25, 149.25], "float"))
  // createDictionary :: dict<str, guid>
  f.createDictionary(f.assemblyList(["148", "149", "150"], "str"), f.assemblyList([149n, 150n, 151n], "guid"))
  // createDictionary :: dict<str, int>
  f.createDictionary(f.assemblyList(["150", "151", "152"], "str"), f.assemblyList([151n, 152n, 153n], "int"))
  // createDictionary :: dict<str, prefabId>
  f.createDictionary(f.assemblyList(["152", "153", "154"], "str"), f.assemblyList([153n, 154n, 155n], "prefab_id"))
  // createDictionary :: dict<str, str>
  f.createDictionary(f.assemblyList(["154", "155", "156"], "str"), f.assemblyList(["155", "156", "157"], "str"))
  // createDictionary :: dict<str, vec3>
  f.createDictionary(f.assemblyList(["156", "157", "158"], "str"), f.assemblyList([[157, 158, 159], [158, 159, 160], [159, 160, 161]], "vec3"))
  // queryIfDictionaryContainsSpecificValue :: dict<configId, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new configId(2n), v: true }, { k: new configId(4n), v: true }]), false)
  // queryIfDictionaryContainsSpecificValue :: dict<configId, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new configId(8n), v: new configId(9n) }, { k: new configId(10n), v: new configId(11n) }]), new configId(12n))
  // queryIfDictionaryContainsSpecificValue :: dict<configId, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new configId(14n), v: f.getSelfEntity() }, { k: new configId(16n), v: f.getSelfEntity() }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificValue :: dict<configId, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new configId(20n), v: new faction(21n) }, { k: new configId(22n), v: new faction(23n) }]), new faction(24n))
  // queryIfDictionaryContainsSpecificValue :: dict<configId, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new configId(26n), v: 27.25 }, { k: new configId(28n), v: 29.25 }]), 30.25)
  // queryIfDictionaryContainsSpecificValue :: dict<configId, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new configId(32n), v: new guid(33n) }, { k: new configId(34n), v: new guid(35n) }]), new guid(36n))
  // queryIfDictionaryContainsSpecificValue :: dict<configId, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new configId(38n), v: 39n }, { k: new configId(40n), v: 41n }]), 42n)
  // queryIfDictionaryContainsSpecificValue :: dict<configId, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new configId(44n), v: new prefabId(45n) }, { k: new configId(46n), v: new prefabId(47n) }]), new prefabId(48n))
  // queryIfDictionaryContainsSpecificValue :: dict<configId, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new configId(50n), v: "51" }, { k: new configId(52n), v: "53" }]), "54")
  // queryIfDictionaryContainsSpecificValue :: dict<configId, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new configId(56n), v: f.create3dVector(57, 58, 59) }, { k: new configId(58n), v: f.create3dVector(59, 60, 61) }]), f.create3dVector(60, 61, 62))
  // queryIfDictionaryContainsSpecificValue :: dict<entity, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: f.getSelfEntity(), v: true }, { k: f.getSelfEntity(), v: true }]), false)
  // queryIfDictionaryContainsSpecificValue :: dict<entity, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new configId(69n) }, { k: f.getSelfEntity(), v: new configId(71n) }]), new configId(72n))
  // queryIfDictionaryContainsSpecificValue :: dict<entity, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.getSelfEntity() }, { k: f.getSelfEntity(), v: f.getSelfEntity() }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificValue :: dict<entity, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new faction(81n) }, { k: f.getSelfEntity(), v: new faction(83n) }]), new faction(84n))
  // queryIfDictionaryContainsSpecificValue :: dict<entity, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 87.25 }, { k: f.getSelfEntity(), v: 89.25 }]), 90.25)
  // queryIfDictionaryContainsSpecificValue :: dict<entity, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new guid(93n) }, { k: f.getSelfEntity(), v: new guid(95n) }]), new guid(96n))
  // queryIfDictionaryContainsSpecificValue :: dict<entity, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 99n }, { k: f.getSelfEntity(), v: 101n }]), 102n)
  // queryIfDictionaryContainsSpecificValue :: dict<entity, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new prefabId(105n) }, { k: f.getSelfEntity(), v: new prefabId(107n) }]), new prefabId(108n))
  // queryIfDictionaryContainsSpecificValue :: dict<entity, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: f.getSelfEntity(), v: "111" }, { k: f.getSelfEntity(), v: "113" }]), "114")
  // queryIfDictionaryContainsSpecificValue :: dict<entity, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.create3dVector(117, 118, 119) }, { k: f.getSelfEntity(), v: f.create3dVector(119, 120, 121) }]), f.create3dVector(120, 121, 122))
  // queryIfDictionaryContainsSpecificValue :: dict<faction, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new faction(122n), v: true }, { k: new faction(124n), v: true }]), false)
  // queryIfDictionaryContainsSpecificValue :: dict<faction, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new faction(128n), v: new configId(129n) }, { k: new faction(130n), v: new configId(131n) }]), new configId(132n))
  // queryIfDictionaryContainsSpecificValue :: dict<faction, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new faction(134n), v: f.getSelfEntity() }, { k: new faction(136n), v: f.getSelfEntity() }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificValue :: dict<faction, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new faction(140n), v: new faction(141n) }, { k: new faction(142n), v: new faction(143n) }]), new faction(144n))
  // queryIfDictionaryContainsSpecificValue :: dict<faction, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new faction(146n), v: 147.25 }, { k: new faction(148n), v: 149.25 }]), 150.25)
  // queryIfDictionaryContainsSpecificValue :: dict<faction, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new faction(152n), v: new guid(153n) }, { k: new faction(154n), v: new guid(155n) }]), new guid(156n))
  // queryIfDictionaryContainsSpecificValue :: dict<faction, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new faction(158n), v: 159n }, { k: new faction(160n), v: 161n }]), 162n)
  // queryIfDictionaryContainsSpecificValue :: dict<faction, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new faction(164n), v: new prefabId(165n) }, { k: new faction(166n), v: new prefabId(167n) }]), new prefabId(168n))
  // queryIfDictionaryContainsSpecificValue :: dict<faction, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new faction(170n), v: "171" }, { k: new faction(172n), v: "173" }]), "174")
  // queryIfDictionaryContainsSpecificValue :: dict<faction, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new faction(176n), v: f.create3dVector(177, 178, 179) }, { k: new faction(178n), v: f.create3dVector(179, 180, 181) }]), f.create3dVector(180, 181, 182))
  // queryIfDictionaryContainsSpecificValue :: dict<guid, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new guid(182n), v: true }, { k: new guid(184n), v: true }]), false)
  // queryIfDictionaryContainsSpecificValue :: dict<guid, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new guid(188n), v: new configId(189n) }, { k: new guid(190n), v: new configId(191n) }]), new configId(192n))
  // queryIfDictionaryContainsSpecificValue :: dict<guid, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new guid(194n), v: f.getSelfEntity() }, { k: new guid(196n), v: f.getSelfEntity() }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificValue :: dict<guid, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new guid(200n), v: new faction(201n) }, { k: new guid(202n), v: new faction(203n) }]), new faction(204n))
  // queryIfDictionaryContainsSpecificValue :: dict<guid, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new guid(206n), v: 207.25 }, { k: new guid(208n), v: 209.25 }]), 210.25)
  // queryIfDictionaryContainsSpecificValue :: dict<guid, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new guid(212n), v: new guid(213n) }, { k: new guid(214n), v: new guid(215n) }]), new guid(216n))
  // queryIfDictionaryContainsSpecificValue :: dict<guid, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new guid(218n), v: 219n }, { k: new guid(220n), v: 221n }]), 222n)
  // queryIfDictionaryContainsSpecificValue :: dict<guid, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new guid(224n), v: new prefabId(225n) }, { k: new guid(226n), v: new prefabId(227n) }]), new prefabId(228n))
  // queryIfDictionaryContainsSpecificValue :: dict<guid, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new guid(230n), v: "231" }, { k: new guid(232n), v: "233" }]), "234")
  // queryIfDictionaryContainsSpecificValue :: dict<guid, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new guid(236n), v: f.create3dVector(237, 238, 239) }, { k: new guid(238n), v: f.create3dVector(239, 240, 241) }]), f.create3dVector(240, 241, 242))
  // queryIfDictionaryContainsSpecificValue :: dict<int, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: 242n, v: true }, { k: 244n, v: true }]), false)
  // queryIfDictionaryContainsSpecificValue :: dict<int, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: 248n, v: new configId(249n) }, { k: 250n, v: new configId(251n) }]), new configId(252n))
  // queryIfDictionaryContainsSpecificValue :: dict<int, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: 254n, v: f.getSelfEntity() }, { k: 256n, v: f.getSelfEntity() }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificValue :: dict<int, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: 260n, v: new faction(261n) }, { k: 262n, v: new faction(263n) }]), new faction(264n))
  // queryIfDictionaryContainsSpecificValue :: dict<int, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: 266n, v: 267.25 }, { k: 268n, v: 269.25 }]), 270.25)
  // queryIfDictionaryContainsSpecificValue :: dict<int, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: 272n, v: new guid(273n) }, { k: 274n, v: new guid(275n) }]), new guid(276n))
  // queryIfDictionaryContainsSpecificValue :: dict<int, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: 278n, v: 279n }, { k: 280n, v: 281n }]), 282n)
  // queryIfDictionaryContainsSpecificValue :: dict<int, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: 284n, v: new prefabId(285n) }, { k: 286n, v: new prefabId(287n) }]), new prefabId(288n))
  // queryIfDictionaryContainsSpecificValue :: dict<int, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: 290n, v: "291" }, { k: 292n, v: "293" }]), "294")
  // queryIfDictionaryContainsSpecificValue :: dict<int, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: 296n, v: f.create3dVector(297, 298, 299) }, { k: 298n, v: f.create3dVector(299, 300, 301) }]), f.create3dVector(300, 301, 302))
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(302n), v: true }, { k: new prefabId(304n), v: true }]), false)
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(308n), v: new configId(309n) }, { k: new prefabId(310n), v: new configId(311n) }]), new configId(312n))
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(314n), v: f.getSelfEntity() }, { k: new prefabId(316n), v: f.getSelfEntity() }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(320n), v: new faction(321n) }, { k: new prefabId(322n), v: new faction(323n) }]), new faction(324n))
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(326n), v: 327.25 }, { k: new prefabId(328n), v: 329.25 }]), 330.25)
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(332n), v: new guid(333n) }, { k: new prefabId(334n), v: new guid(335n) }]), new guid(336n))
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(338n), v: 339n }, { k: new prefabId(340n), v: 341n }]), 342n)
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(344n), v: new prefabId(345n) }, { k: new prefabId(346n), v: new prefabId(347n) }]), new prefabId(348n))
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(350n), v: "351" }, { k: new prefabId(352n), v: "353" }]), "354")
  // queryIfDictionaryContainsSpecificValue :: dict<prefabId, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: new prefabId(356n), v: f.create3dVector(357, 358, 359) }, { k: new prefabId(358n), v: f.create3dVector(359, 360, 361) }]), f.create3dVector(360, 361, 362))
  // queryIfDictionaryContainsSpecificValue :: dict<str, bool>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: "362", v: true }, { k: "364", v: true }]), false)
  // queryIfDictionaryContainsSpecificValue :: dict<str, configId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: "368", v: new configId(369n) }, { k: "370", v: new configId(371n) }]), new configId(372n))
  // queryIfDictionaryContainsSpecificValue :: dict<str, entity>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: "374", v: f.getSelfEntity() }, { k: "376", v: f.getSelfEntity() }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificValue :: dict<str, faction>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: "380", v: new faction(381n) }, { k: "382", v: new faction(383n) }]), new faction(384n))
  // queryIfDictionaryContainsSpecificValue :: dict<str, float>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: "386", v: 387.25 }, { k: "388", v: 389.25 }]), 390.25)
  // queryIfDictionaryContainsSpecificValue :: dict<str, guid>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: "392", v: new guid(393n) }, { k: "394", v: new guid(395n) }]), new guid(396n))
  // queryIfDictionaryContainsSpecificValue :: dict<str, int>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: "398", v: 399n }, { k: "400", v: 401n }]), 402n)
  // queryIfDictionaryContainsSpecificValue :: dict<str, prefabId>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: "404", v: new prefabId(405n) }, { k: "406", v: new prefabId(407n) }]), new prefabId(408n))
  // queryIfDictionaryContainsSpecificValue :: dict<str, str>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: "410", v: "411" }, { k: "412", v: "413" }]), "414")
  // queryIfDictionaryContainsSpecificValue :: dict<str, vec3>
  f.queryIfDictionaryContainsSpecificValue(f.assemblyDictionary([{ k: "416", v: f.create3dVector(417, 418, 419) }, { k: "418", v: f.create3dVector(419, 420, 421) }]), f.create3dVector(420, 421, 422))
  // getListOfValuesFromDictionary :: dict<configId, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new configId(2n), v: true }, { k: new configId(4n), v: true }]))
  // getListOfValuesFromDictionary :: dict<configId, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new configId(7n), v: new configId(8n) }, { k: new configId(9n), v: new configId(10n) }]))
  // getListOfValuesFromDictionary :: dict<configId, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new configId(12n), v: f.getSelfEntity() }, { k: new configId(14n), v: f.getSelfEntity() }]))
  // getListOfValuesFromDictionary :: dict<configId, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new configId(17n), v: new faction(18n) }, { k: new configId(19n), v: new faction(20n) }]))
  // getListOfValuesFromDictionary :: dict<configId, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new configId(22n), v: 23.25 }, { k: new configId(24n), v: 25.25 }]))
  // getListOfValuesFromDictionary :: dict<configId, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new configId(27n), v: new guid(28n) }, { k: new configId(29n), v: new guid(30n) }]))
  // getListOfValuesFromDictionary :: dict<configId, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new configId(32n), v: 33n }, { k: new configId(34n), v: 35n }]))
  // getListOfValuesFromDictionary :: dict<configId, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new configId(37n), v: new prefabId(38n) }, { k: new configId(39n), v: new prefabId(40n) }]))
  // getListOfValuesFromDictionary :: dict<configId, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new configId(42n), v: "43" }, { k: new configId(44n), v: "45" }]))
  // getListOfValuesFromDictionary :: dict<configId, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new configId(47n), v: f.create3dVector(48, 49, 50) }, { k: new configId(49n), v: f.create3dVector(50, 51, 52) }]))
  // getListOfValuesFromDictionary :: dict<entity, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: true }, { k: f.getSelfEntity(), v: true }]))
  // getListOfValuesFromDictionary :: dict<entity, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new configId(58n) }, { k: f.getSelfEntity(), v: new configId(60n) }]))
  // getListOfValuesFromDictionary :: dict<entity, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.getSelfEntity() }, { k: f.getSelfEntity(), v: f.getSelfEntity() }]))
  // getListOfValuesFromDictionary :: dict<entity, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new faction(68n) }, { k: f.getSelfEntity(), v: new faction(70n) }]))
  // getListOfValuesFromDictionary :: dict<entity, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 73.25 }, { k: f.getSelfEntity(), v: 75.25 }]))
  // getListOfValuesFromDictionary :: dict<entity, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new guid(78n) }, { k: f.getSelfEntity(), v: new guid(80n) }]))
  // getListOfValuesFromDictionary :: dict<entity, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 83n }, { k: f.getSelfEntity(), v: 85n }]))
  // getListOfValuesFromDictionary :: dict<entity, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new prefabId(88n) }, { k: f.getSelfEntity(), v: new prefabId(90n) }]))
  // getListOfValuesFromDictionary :: dict<entity, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: "93" }, { k: f.getSelfEntity(), v: "95" }]))
  // getListOfValuesFromDictionary :: dict<entity, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.create3dVector(98, 99, 100) }, { k: f.getSelfEntity(), v: f.create3dVector(100, 101, 102) }]))
  // getListOfValuesFromDictionary :: dict<faction, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new faction(102n), v: true }, { k: new faction(104n), v: true }]))
  // getListOfValuesFromDictionary :: dict<faction, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new faction(107n), v: new configId(108n) }, { k: new faction(109n), v: new configId(110n) }]))
  // getListOfValuesFromDictionary :: dict<faction, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new faction(112n), v: f.getSelfEntity() }, { k: new faction(114n), v: f.getSelfEntity() }]))
  // getListOfValuesFromDictionary :: dict<faction, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new faction(117n), v: new faction(118n) }, { k: new faction(119n), v: new faction(120n) }]))
  // getListOfValuesFromDictionary :: dict<faction, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new faction(122n), v: 123.25 }, { k: new faction(124n), v: 125.25 }]))
  // getListOfValuesFromDictionary :: dict<faction, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new faction(127n), v: new guid(128n) }, { k: new faction(129n), v: new guid(130n) }]))
  // getListOfValuesFromDictionary :: dict<faction, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new faction(132n), v: 133n }, { k: new faction(134n), v: 135n }]))
  // getListOfValuesFromDictionary :: dict<faction, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new faction(137n), v: new prefabId(138n) }, { k: new faction(139n), v: new prefabId(140n) }]))
  // getListOfValuesFromDictionary :: dict<faction, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new faction(142n), v: "143" }, { k: new faction(144n), v: "145" }]))
  // getListOfValuesFromDictionary :: dict<faction, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new faction(147n), v: f.create3dVector(148, 149, 150) }, { k: new faction(149n), v: f.create3dVector(150, 151, 152) }]))
  // getListOfValuesFromDictionary :: dict<guid, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new guid(152n), v: true }, { k: new guid(154n), v: true }]))
  // getListOfValuesFromDictionary :: dict<guid, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new guid(157n), v: new configId(158n) }, { k: new guid(159n), v: new configId(160n) }]))
  // getListOfValuesFromDictionary :: dict<guid, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new guid(162n), v: f.getSelfEntity() }, { k: new guid(164n), v: f.getSelfEntity() }]))
  // getListOfValuesFromDictionary :: dict<guid, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new guid(167n), v: new faction(168n) }, { k: new guid(169n), v: new faction(170n) }]))
  // getListOfValuesFromDictionary :: dict<guid, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new guid(172n), v: 173.25 }, { k: new guid(174n), v: 175.25 }]))
  // getListOfValuesFromDictionary :: dict<guid, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new guid(177n), v: new guid(178n) }, { k: new guid(179n), v: new guid(180n) }]))
  // getListOfValuesFromDictionary :: dict<guid, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new guid(182n), v: 183n }, { k: new guid(184n), v: 185n }]))
  // getListOfValuesFromDictionary :: dict<guid, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new guid(187n), v: new prefabId(188n) }, { k: new guid(189n), v: new prefabId(190n) }]))
  // getListOfValuesFromDictionary :: dict<guid, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new guid(192n), v: "193" }, { k: new guid(194n), v: "195" }]))
  // getListOfValuesFromDictionary :: dict<guid, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new guid(197n), v: f.create3dVector(198, 199, 200) }, { k: new guid(199n), v: f.create3dVector(200, 201, 202) }]))
  // getListOfValuesFromDictionary :: dict<int, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: 202n, v: true }, { k: 204n, v: true }]))
  // getListOfValuesFromDictionary :: dict<int, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: 207n, v: new configId(208n) }, { k: 209n, v: new configId(210n) }]))
  // getListOfValuesFromDictionary :: dict<int, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: 212n, v: f.getSelfEntity() }, { k: 214n, v: f.getSelfEntity() }]))
  // getListOfValuesFromDictionary :: dict<int, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: 217n, v: new faction(218n) }, { k: 219n, v: new faction(220n) }]))
  // getListOfValuesFromDictionary :: dict<int, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: 222n, v: 223.25 }, { k: 224n, v: 225.25 }]))
  // getListOfValuesFromDictionary :: dict<int, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: 227n, v: new guid(228n) }, { k: 229n, v: new guid(230n) }]))
  // getListOfValuesFromDictionary :: dict<int, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: 232n, v: 233n }, { k: 234n, v: 235n }]))
  // getListOfValuesFromDictionary :: dict<int, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: 237n, v: new prefabId(238n) }, { k: 239n, v: new prefabId(240n) }]))
  // getListOfValuesFromDictionary :: dict<int, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: 242n, v: "243" }, { k: 244n, v: "245" }]))
  // getListOfValuesFromDictionary :: dict<int, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: 247n, v: f.create3dVector(248, 249, 250) }, { k: 249n, v: f.create3dVector(250, 251, 252) }]))
  // getListOfValuesFromDictionary :: dict<prefabId, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(252n), v: true }, { k: new prefabId(254n), v: true }]))
  // getListOfValuesFromDictionary :: dict<prefabId, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(257n), v: new configId(258n) }, { k: new prefabId(259n), v: new configId(260n) }]))
  // getListOfValuesFromDictionary :: dict<prefabId, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(262n), v: f.getSelfEntity() }, { k: new prefabId(264n), v: f.getSelfEntity() }]))
  // getListOfValuesFromDictionary :: dict<prefabId, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(267n), v: new faction(268n) }, { k: new prefabId(269n), v: new faction(270n) }]))
  // getListOfValuesFromDictionary :: dict<prefabId, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(272n), v: 273.25 }, { k: new prefabId(274n), v: 275.25 }]))
  // getListOfValuesFromDictionary :: dict<prefabId, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(277n), v: new guid(278n) }, { k: new prefabId(279n), v: new guid(280n) }]))
  // getListOfValuesFromDictionary :: dict<prefabId, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(282n), v: 283n }, { k: new prefabId(284n), v: 285n }]))
  // getListOfValuesFromDictionary :: dict<prefabId, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(287n), v: new prefabId(288n) }, { k: new prefabId(289n), v: new prefabId(290n) }]))
  // getListOfValuesFromDictionary :: dict<prefabId, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(292n), v: "293" }, { k: new prefabId(294n), v: "295" }]))
  // getListOfValuesFromDictionary :: dict<prefabId, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: new prefabId(297n), v: f.create3dVector(298, 299, 300) }, { k: new prefabId(299n), v: f.create3dVector(300, 301, 302) }]))
  // getListOfValuesFromDictionary :: dict<str, bool>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: "302", v: true }, { k: "304", v: true }]))
  // getListOfValuesFromDictionary :: dict<str, configId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: "307", v: new configId(308n) }, { k: "309", v: new configId(310n) }]))
  // getListOfValuesFromDictionary :: dict<str, entity>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: "312", v: f.getSelfEntity() }, { k: "314", v: f.getSelfEntity() }]))
  // getListOfValuesFromDictionary :: dict<str, faction>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: "317", v: new faction(318n) }, { k: "319", v: new faction(320n) }]))
  // getListOfValuesFromDictionary :: dict<str, float>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: "322", v: 323.25 }, { k: "324", v: 325.25 }]))
  // getListOfValuesFromDictionary :: dict<str, guid>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: "327", v: new guid(328n) }, { k: "329", v: new guid(330n) }]))
  // getListOfValuesFromDictionary :: dict<str, int>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: "332", v: 333n }, { k: "334", v: 335n }]))
  // getListOfValuesFromDictionary :: dict<str, prefabId>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: "337", v: new prefabId(338n) }, { k: "339", v: new prefabId(340n) }]))
  // getListOfValuesFromDictionary :: dict<str, str>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: "342", v: "343" }, { k: "344", v: "345" }]))
  // getListOfValuesFromDictionary :: dict<str, vec3>
  f.getListOfValuesFromDictionary(f.assemblyDictionary([{ k: "347", v: f.create3dVector(348, 349, 350) }, { k: "349", v: f.create3dVector(350, 351, 352) }]))
})

