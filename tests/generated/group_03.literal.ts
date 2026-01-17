import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_03 (literal)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741832 }).on('whenEntityIsCreated', (_evt, f) => {
  // setCustomVariable :: bool
  f.setCustomVariable(f.getSelfEntity(), "2", true, false)
  // setCustomVariable :: configId
  f.setCustomVariable(f.getSelfEntity(), "6", new configId(7n), false)
  // setCustomVariable :: entity
  f.setCustomVariable(f.getSelfEntity(), "10", f.getSelfEntity(), false)
  // setCustomVariable :: faction
  f.setCustomVariable(f.getSelfEntity(), "14", new faction(15n), false)
  // setCustomVariable :: float
  f.setCustomVariable(f.getSelfEntity(), "18", 19.25, false)
  // setCustomVariable :: guid
  f.setCustomVariable(f.getSelfEntity(), "22", new guid(23n), false)
  // setCustomVariable :: int
  f.setCustomVariable(f.getSelfEntity(), "26", 27n, false)
  // setCustomVariable :: prefabId
  f.setCustomVariable(f.getSelfEntity(), "30", new prefabId(31n), false)
  // setCustomVariable :: str
  f.setCustomVariable(f.getSelfEntity(), "34", "35", false)
  // setCustomVariable :: vec3
  f.setCustomVariable(f.getSelfEntity(), "38", f.create3dVector(39, 40, 41), false)
  // setCustomVariable :: list<bool>
  f.setCustomVariable(f.getSelfEntity(), "42", f.assemblyList([true, false, true], "bool"), false)
  // setCustomVariable :: list<configId>
  f.setCustomVariable(f.getSelfEntity(), "46", f.assemblyList([47n, 48n, 49n], "config_id"), false)
  // setCustomVariable :: list<entity>
  f.setCustomVariable(f.getSelfEntity(), "50", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), true)
  // setCustomVariable :: list<faction>
  f.setCustomVariable(f.getSelfEntity(), "55", f.assemblyList([56n, 57n, 58n], "faction"), true)
  // setCustomVariable :: list<float>
  f.setCustomVariable(f.getSelfEntity(), "59", f.assemblyList([60.25, 61.25, 62.25], "float"), true)
  // setCustomVariable :: list<guid>
  f.setCustomVariable(f.getSelfEntity(), "63", f.assemblyList([64n, 65n, 66n], "guid"), true)
  // setCustomVariable :: list<int>
  f.setCustomVariable(f.getSelfEntity(), "67", f.assemblyList([68n, 69n, 70n], "int"), true)
  // setCustomVariable :: list<prefabId>
  f.setCustomVariable(f.getSelfEntity(), "71", f.assemblyList([72n, 73n, 74n], "prefab_id"), true)
  // setCustomVariable :: list<str>
  f.setCustomVariable(f.getSelfEntity(), "75", f.assemblyList(["76", "77", "78"], "str"), true)
  // setCustomVariable :: list<vec3>
  f.setCustomVariable(f.getSelfEntity(), "79", f.assemblyList([[80, 81, 82], [81, 82, 83], [82, 83, 84]], "vec3"), true)
  // setCustomVariable :: dict<configId, bool>
  f.setCustomVariable(f.getSelfEntity(), "83", false, true)
  // setCustomVariable :: dict<configId, configId>
  f.setCustomVariable(f.getSelfEntity(), "87", new configId(88n), true)
  // setCustomVariable :: dict<configId, entity>
  f.setCustomVariable(f.getSelfEntity(), "91", f.getSelfEntity(), true)
  // setCustomVariable :: dict<configId, faction>
  f.setCustomVariable(f.getSelfEntity(), "95", new faction(96n), true)
  // setCustomVariable :: dict<configId, float>
  f.setCustomVariable(f.getSelfEntity(), "99", 100.25, true)
  // setCustomVariable :: dict<configId, guid>
  f.setCustomVariable(f.getSelfEntity(), "103", new guid(104n), true)
  // setCustomVariable :: dict<configId, int>
  f.setCustomVariable(f.getSelfEntity(), "107", 108n, true)
  // setCustomVariable :: dict<configId, list<bool>>
  f.setCustomVariable(f.getSelfEntity(), "111", f.assemblyList([false, true, false], "bool"), true)
  // setCustomVariable :: dict<configId, list<configId>>
  f.setCustomVariable(f.getSelfEntity(), "115", f.assemblyList([116n, 117n, 118n], "config_id"), true)
  // setCustomVariable :: dict<configId, list<entity>>
  f.setCustomVariable(f.getSelfEntity(), "119", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), false)
  // setCustomVariable :: dict<configId, list<faction>>
  f.setCustomVariable(f.getSelfEntity(), "124", f.assemblyList([125n, 126n, 127n], "faction"), false)
  // setCustomVariable :: dict<configId, list<float>>
  f.setCustomVariable(f.getSelfEntity(), "128", f.assemblyList([129.25, 130.25, 131.25], "float"), false)
  // setCustomVariable :: dict<configId, list<guid>>
  f.setCustomVariable(f.getSelfEntity(), "132", f.assemblyList([133n, 134n, 135n], "guid"), false)
  // setCustomVariable :: dict<configId, list<int>>
  f.setCustomVariable(f.getSelfEntity(), "136", f.assemblyList([137n, 138n, 139n], "int"), false)
  // setCustomVariable :: dict<configId, list<str>>
  f.setCustomVariable(f.getSelfEntity(), "140", f.assemblyList(["141", "142", "143"], "str"), false)
  // setCustomVariable :: dict<configId, list<vec3>>
  f.setCustomVariable(f.getSelfEntity(), "144", f.assemblyList([[145, 146, 147], [146, 147, 148], [147, 148, 149]], "vec3"), false)
  // setCustomVariable :: dict<configId, prefabId>
  f.setCustomVariable(f.getSelfEntity(), "148", new prefabId(149n), false)
  // setCustomVariable :: dict<configId, str>
  f.setCustomVariable(f.getSelfEntity(), "152", "153", false)
  // setCustomVariable :: dict<configId, vec3>
  f.setCustomVariable(f.getSelfEntity(), "156", f.create3dVector(157, 158, 159), false)
  // setCustomVariable :: dict<entity, bool>
  f.setCustomVariable(f.getSelfEntity(), "160", true, false)
  // setCustomVariable :: dict<entity, configId>
  f.setCustomVariable(f.getSelfEntity(), "164", new configId(165n), false)
  // setCustomVariable :: dict<entity, entity>
  f.setCustomVariable(f.getSelfEntity(), "168", f.getSelfEntity(), false)
  // setCustomVariable :: dict<entity, faction>
  f.setCustomVariable(f.getSelfEntity(), "172", new faction(173n), false)
  // setCustomVariable :: dict<entity, float>
  f.setCustomVariable(f.getSelfEntity(), "176", 177.25, false)
  // setCustomVariable :: dict<entity, guid>
  f.setCustomVariable(f.getSelfEntity(), "180", new guid(181n), false)
  // setCustomVariable :: dict<entity, int>
  f.setCustomVariable(f.getSelfEntity(), "184", 185n, false)
  // setCustomVariable :: dict<entity, list<bool>>
  f.setCustomVariable(f.getSelfEntity(), "188", f.assemblyList([true, false, true], "bool"), false)
  // setCustomVariable :: dict<entity, list<configId>>
  f.setCustomVariable(f.getSelfEntity(), "192", f.assemblyList([193n, 194n, 195n], "config_id"), false)
  // setCustomVariable :: dict<entity, list<entity>>
  f.setCustomVariable(f.getSelfEntity(), "196", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), true)
  // setCustomVariable :: dict<entity, list<faction>>
  f.setCustomVariable(f.getSelfEntity(), "201", f.assemblyList([202n, 203n, 204n], "faction"), true)
  // setCustomVariable :: dict<entity, list<float>>
  f.setCustomVariable(f.getSelfEntity(), "205", f.assemblyList([206.25, 207.25, 208.25], "float"), true)
  // setCustomVariable :: dict<entity, list<guid>>
  f.setCustomVariable(f.getSelfEntity(), "209", f.assemblyList([210n, 211n, 212n], "guid"), true)
  // setCustomVariable :: dict<entity, list<int>>
  f.setCustomVariable(f.getSelfEntity(), "213", f.assemblyList([214n, 215n, 216n], "int"), true)
  // setCustomVariable :: dict<entity, list<str>>
  f.setCustomVariable(f.getSelfEntity(), "217", f.assemblyList(["218", "219", "220"], "str"), true)
  // setCustomVariable :: dict<entity, list<vec3>>
  f.setCustomVariable(f.getSelfEntity(), "221", f.assemblyList([[222, 223, 224], [223, 224, 225], [224, 225, 226]], "vec3"), true)
  // setCustomVariable :: dict<entity, prefabId>
  f.setCustomVariable(f.getSelfEntity(), "225", new prefabId(226n), true)
  // setCustomVariable :: dict<entity, str>
  f.setCustomVariable(f.getSelfEntity(), "229", "230", true)
  // setCustomVariable :: dict<entity, vec3>
  f.setCustomVariable(f.getSelfEntity(), "233", f.create3dVector(234, 235, 236), true)
  // setCustomVariable :: dict<faction, bool>
  f.setCustomVariable(f.getSelfEntity(), "237", false, true)
  // setCustomVariable :: dict<faction, configId>
  f.setCustomVariable(f.getSelfEntity(), "241", new configId(242n), true)
  // setCustomVariable :: dict<faction, entity>
  f.setCustomVariable(f.getSelfEntity(), "245", f.getSelfEntity(), true)
  // setCustomVariable :: dict<faction, faction>
  f.setCustomVariable(f.getSelfEntity(), "249", new faction(250n), true)
  // setCustomVariable :: dict<faction, float>
  f.setCustomVariable(f.getSelfEntity(), "253", 254.25, true)
  // setCustomVariable :: dict<faction, guid>
  f.setCustomVariable(f.getSelfEntity(), "257", new guid(258n), true)
  // setCustomVariable :: dict<faction, int>
  f.setCustomVariable(f.getSelfEntity(), "261", 262n, true)
  // setCustomVariable :: dict<faction, list<bool>>
  f.setCustomVariable(f.getSelfEntity(), "265", f.assemblyList([false, true, false], "bool"), true)
  // setCustomVariable :: dict<faction, list<configId>>
  f.setCustomVariable(f.getSelfEntity(), "269", f.assemblyList([270n, 271n, 272n], "config_id"), true)
  // setCustomVariable :: dict<faction, list<entity>>
  f.setCustomVariable(f.getSelfEntity(), "273", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), false)
  // setCustomVariable :: dict<faction, list<faction>>
  f.setCustomVariable(f.getSelfEntity(), "278", f.assemblyList([279n, 280n, 281n], "faction"), false)
  // setCustomVariable :: dict<faction, list<float>>
  f.setCustomVariable(f.getSelfEntity(), "282", f.assemblyList([283.25, 284.25, 285.25], "float"), false)
  // setCustomVariable :: dict<faction, list<guid>>
  f.setCustomVariable(f.getSelfEntity(), "286", f.assemblyList([287n, 288n, 289n], "guid"), false)
  // setCustomVariable :: dict<faction, list<int>>
  f.setCustomVariable(f.getSelfEntity(), "290", f.assemblyList([291n, 292n, 293n], "int"), false)
  // setCustomVariable :: dict<faction, list<str>>
  f.setCustomVariable(f.getSelfEntity(), "294", f.assemblyList(["295", "296", "297"], "str"), false)
  // setCustomVariable :: dict<faction, list<vec3>>
  f.setCustomVariable(f.getSelfEntity(), "298", f.assemblyList([[299, 300, 301], [300, 301, 302], [301, 302, 303]], "vec3"), false)
  // setCustomVariable :: dict<faction, prefabId>
  f.setCustomVariable(f.getSelfEntity(), "302", new prefabId(303n), false)
  // setCustomVariable :: dict<faction, str>
  f.setCustomVariable(f.getSelfEntity(), "306", "307", false)
  // setCustomVariable :: dict<faction, vec3>
  f.setCustomVariable(f.getSelfEntity(), "310", f.create3dVector(311, 312, 313), false)
  // setCustomVariable :: dict<guid, bool>
  f.setCustomVariable(f.getSelfEntity(), "314", true, false)
  // setCustomVariable :: dict<guid, configId>
  f.setCustomVariable(f.getSelfEntity(), "318", new configId(319n), false)
  // setCustomVariable :: dict<guid, entity>
  f.setCustomVariable(f.getSelfEntity(), "322", f.getSelfEntity(), false)
  // setCustomVariable :: dict<guid, faction>
  f.setCustomVariable(f.getSelfEntity(), "326", new faction(327n), false)
  // setCustomVariable :: dict<guid, float>
  f.setCustomVariable(f.getSelfEntity(), "330", 331.25, false)
  // setCustomVariable :: dict<guid, guid>
  f.setCustomVariable(f.getSelfEntity(), "334", new guid(335n), false)
  // setCustomVariable :: dict<guid, int>
  f.setCustomVariable(f.getSelfEntity(), "338", 339n, false)
  // setCustomVariable :: dict<guid, list<bool>>
  f.setCustomVariable(f.getSelfEntity(), "342", f.assemblyList([true, false, true], "bool"), false)
  // setCustomVariable :: dict<guid, list<configId>>
  f.setCustomVariable(f.getSelfEntity(), "346", f.assemblyList([347n, 348n, 349n], "config_id"), false)
  // setCustomVariable :: dict<guid, list<entity>>
  f.setCustomVariable(f.getSelfEntity(), "350", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), true)
  // setCustomVariable :: dict<guid, list<faction>>
  f.setCustomVariable(f.getSelfEntity(), "355", f.assemblyList([356n, 357n, 358n], "faction"), true)
  // setCustomVariable :: dict<guid, list<float>>
  f.setCustomVariable(f.getSelfEntity(), "359", f.assemblyList([360.25, 361.25, 362.25], "float"), true)
  // setCustomVariable :: dict<guid, list<guid>>
  f.setCustomVariable(f.getSelfEntity(), "363", f.assemblyList([364n, 365n, 366n], "guid"), true)
  // setCustomVariable :: dict<guid, list<int>>
  f.setCustomVariable(f.getSelfEntity(), "367", f.assemblyList([368n, 369n, 370n], "int"), true)
  // setCustomVariable :: dict<guid, list<str>>
  f.setCustomVariable(f.getSelfEntity(), "371", f.assemblyList(["372", "373", "374"], "str"), true)
  // setCustomVariable :: dict<guid, list<vec3>>
  f.setCustomVariable(f.getSelfEntity(), "375", f.assemblyList([[376, 377, 378], [377, 378, 379], [378, 379, 380]], "vec3"), true)
  // setCustomVariable :: dict<guid, prefabId>
  f.setCustomVariable(f.getSelfEntity(), "379", new prefabId(380n), true)
  // setCustomVariable :: dict<guid, str>
  f.setCustomVariable(f.getSelfEntity(), "383", "384", true)
  // setCustomVariable :: dict<guid, vec3>
  f.setCustomVariable(f.getSelfEntity(), "387", f.create3dVector(388, 389, 390), true)
  // setCustomVariable :: dict<int, bool>
  f.setCustomVariable(f.getSelfEntity(), "391", false, true)
  // setCustomVariable :: dict<int, configId>
  f.setCustomVariable(f.getSelfEntity(), "395", new configId(396n), true)
  // setCustomVariable :: dict<int, entity>
  f.setCustomVariable(f.getSelfEntity(), "399", f.getSelfEntity(), true)
  // setCustomVariable :: dict<int, faction>
  f.setCustomVariable(f.getSelfEntity(), "403", new faction(404n), true)
  // setCustomVariable :: dict<int, float>
  f.setCustomVariable(f.getSelfEntity(), "407", 408.25, true)
  // setCustomVariable :: dict<int, guid>
  f.setCustomVariable(f.getSelfEntity(), "411", new guid(412n), true)
  // setCustomVariable :: dict<int, int>
  f.setCustomVariable(f.getSelfEntity(), "415", 416n, true)
  // setCustomVariable :: dict<int, list<bool>>
  f.setCustomVariable(f.getSelfEntity(), "419", f.assemblyList([false, true, false], "bool"), true)
  // setCustomVariable :: dict<int, list<configId>>
  f.setCustomVariable(f.getSelfEntity(), "423", f.assemblyList([424n, 425n, 426n], "config_id"), true)
  // setCustomVariable :: dict<int, list<entity>>
  f.setCustomVariable(f.getSelfEntity(), "427", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), false)
  // setCustomVariable :: dict<int, list<faction>>
  f.setCustomVariable(f.getSelfEntity(), "432", f.assemblyList([433n, 434n, 435n], "faction"), false)
  // setCustomVariable :: dict<int, list<float>>
  f.setCustomVariable(f.getSelfEntity(), "436", f.assemblyList([437.25, 438.25, 439.25], "float"), false)
  // setCustomVariable :: dict<int, list<guid>>
  f.setCustomVariable(f.getSelfEntity(), "440", f.assemblyList([441n, 442n, 443n], "guid"), false)
  // setCustomVariable :: dict<int, list<int>>
  f.setCustomVariable(f.getSelfEntity(), "444", f.assemblyList([445n, 446n, 447n], "int"), false)
  // setCustomVariable :: dict<int, list<str>>
  f.setCustomVariable(f.getSelfEntity(), "448", f.assemblyList(["449", "450", "451"], "str"), false)
  // setCustomVariable :: dict<int, list<vec3>>
  f.setCustomVariable(f.getSelfEntity(), "452", f.assemblyList([[453, 454, 455], [454, 455, 456], [455, 456, 457]], "vec3"), false)
  // setCustomVariable :: dict<int, prefabId>
  f.setCustomVariable(f.getSelfEntity(), "456", new prefabId(457n), false)
  // setCustomVariable :: dict<int, str>
  f.setCustomVariable(f.getSelfEntity(), "460", "461", false)
  // setCustomVariable :: dict<int, vec3>
  f.setCustomVariable(f.getSelfEntity(), "464", f.create3dVector(465, 466, 467), false)
  // setCustomVariable :: dict<prefabId, bool>
  f.setCustomVariable(f.getSelfEntity(), "468", true, false)
  // setCustomVariable :: dict<prefabId, configId>
  f.setCustomVariable(f.getSelfEntity(), "472", new configId(473n), false)
  // setCustomVariable :: dict<prefabId, entity>
  f.setCustomVariable(f.getSelfEntity(), "476", f.getSelfEntity(), false)
  // setCustomVariable :: dict<prefabId, faction>
  f.setCustomVariable(f.getSelfEntity(), "480", new faction(481n), false)
  // setCustomVariable :: dict<prefabId, float>
  f.setCustomVariable(f.getSelfEntity(), "484", 485.25, false)
  // setCustomVariable :: dict<prefabId, guid>
  f.setCustomVariable(f.getSelfEntity(), "488", new guid(489n), false)
  // setCustomVariable :: dict<prefabId, int>
  f.setCustomVariable(f.getSelfEntity(), "492", 493n, false)
  // setCustomVariable :: dict<prefabId, list<bool>>
  f.setCustomVariable(f.getSelfEntity(), "496", f.assemblyList([true, false, true], "bool"), false)
  // setCustomVariable :: dict<prefabId, list<configId>>
  f.setCustomVariable(f.getSelfEntity(), "500", f.assemblyList([501n, 502n, 503n], "config_id"), false)
  // setCustomVariable :: dict<prefabId, list<entity>>
  f.setCustomVariable(f.getSelfEntity(), "504", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), true)
  // setCustomVariable :: dict<prefabId, list<faction>>
  f.setCustomVariable(f.getSelfEntity(), "509", f.assemblyList([510n, 511n, 512n], "faction"), true)
  // setCustomVariable :: dict<prefabId, list<float>>
  f.setCustomVariable(f.getSelfEntity(), "513", f.assemblyList([514.25, 515.25, 516.25], "float"), true)
  // setCustomVariable :: dict<prefabId, list<guid>>
  f.setCustomVariable(f.getSelfEntity(), "517", f.assemblyList([518n, 519n, 520n], "guid"), true)
  // setCustomVariable :: dict<prefabId, list<int>>
  f.setCustomVariable(f.getSelfEntity(), "521", f.assemblyList([522n, 523n, 524n], "int"), true)
  // setCustomVariable :: dict<prefabId, list<str>>
  f.setCustomVariable(f.getSelfEntity(), "525", f.assemblyList(["526", "527", "528"], "str"), true)
  // setCustomVariable :: dict<prefabId, list<vec3>>
  f.setCustomVariable(f.getSelfEntity(), "529", f.assemblyList([[530, 531, 532], [531, 532, 533], [532, 533, 534]], "vec3"), true)
  // setCustomVariable :: dict<prefabId, prefabId>
  f.setCustomVariable(f.getSelfEntity(), "533", new prefabId(534n), true)
  // setCustomVariable :: dict<prefabId, str>
  f.setCustomVariable(f.getSelfEntity(), "537", "538", true)
  // setCustomVariable :: dict<prefabId, vec3>
  f.setCustomVariable(f.getSelfEntity(), "541", f.create3dVector(542, 543, 544), true)
  // setCustomVariable :: dict<str, bool>
  f.setCustomVariable(f.getSelfEntity(), "545", false, true)
  // setCustomVariable :: dict<str, configId>
  f.setCustomVariable(f.getSelfEntity(), "549", new configId(550n), true)
  // setCustomVariable :: dict<str, entity>
  f.setCustomVariable(f.getSelfEntity(), "553", f.getSelfEntity(), true)
  // setCustomVariable :: dict<str, faction>
  f.setCustomVariable(f.getSelfEntity(), "557", new faction(558n), true)
  // setCustomVariable :: dict<str, float>
  f.setCustomVariable(f.getSelfEntity(), "561", 562.25, true)
  // setCustomVariable :: dict<str, guid>
  f.setCustomVariable(f.getSelfEntity(), "565", new guid(566n), true)
  // setCustomVariable :: dict<str, int>
  f.setCustomVariable(f.getSelfEntity(), "569", 570n, true)
  // setCustomVariable :: dict<str, list<bool>>
  f.setCustomVariable(f.getSelfEntity(), "573", f.assemblyList([false, true, false], "bool"), true)
  // setCustomVariable :: dict<str, list<configId>>
  f.setCustomVariable(f.getSelfEntity(), "577", f.assemblyList([578n, 579n, 580n], "config_id"), true)
  // setCustomVariable :: dict<str, list<entity>>
  f.setCustomVariable(f.getSelfEntity(), "581", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), false)
  // setCustomVariable :: dict<str, list<faction>>
  f.setCustomVariable(f.getSelfEntity(), "586", f.assemblyList([587n, 588n, 589n], "faction"), false)
  // setCustomVariable :: dict<str, list<float>>
  f.setCustomVariable(f.getSelfEntity(), "590", f.assemblyList([591.25, 592.25, 593.25], "float"), false)
  // setCustomVariable :: dict<str, list<guid>>
  f.setCustomVariable(f.getSelfEntity(), "594", f.assemblyList([595n, 596n, 597n], "guid"), false)
  // setCustomVariable :: dict<str, list<int>>
  f.setCustomVariable(f.getSelfEntity(), "598", f.assemblyList([599n, 600n, 601n], "int"), false)
  // setCustomVariable :: dict<str, list<str>>
  f.setCustomVariable(f.getSelfEntity(), "602", f.assemblyList(["603", "604", "605"], "str"), false)
  // setCustomVariable :: dict<str, list<vec3>>
  f.setCustomVariable(f.getSelfEntity(), "606", f.assemblyList([[607, 608, 609], [608, 609, 610], [609, 610, 611]], "vec3"), false)
  // setCustomVariable :: dict<str, prefabId>
  f.setCustomVariable(f.getSelfEntity(), "610", new prefabId(611n), false)
  // setCustomVariable :: dict<str, str>
  f.setCustomVariable(f.getSelfEntity(), "614", "615", false)
  // setCustomVariable :: dict<str, vec3>
  f.setCustomVariable(f.getSelfEntity(), "618", f.create3dVector(619, 620, 621), false)
  // getCustomVariable :: bool
  f.getCustomVariable(f.getSelfEntity(), "2")
  // getCustomVariable :: configId
  f.getCustomVariable(f.getSelfEntity(), "4")
  // getCustomVariable :: entity
  f.getCustomVariable(f.getSelfEntity(), "6")
  // getCustomVariable :: faction
  f.getCustomVariable(f.getSelfEntity(), "8")
  // getCustomVariable :: float
  f.getCustomVariable(f.getSelfEntity(), "10")
  // getCustomVariable :: guid
  f.getCustomVariable(f.getSelfEntity(), "12")
  // getCustomVariable :: int
  f.getCustomVariable(f.getSelfEntity(), "14")
  // getCustomVariable :: prefabId
  f.getCustomVariable(f.getSelfEntity(), "16")
  // getCustomVariable :: str
  f.getCustomVariable(f.getSelfEntity(), "18")
  // getCustomVariable :: vec3
  f.getCustomVariable(f.getSelfEntity(), "20")
  // getCustomVariable :: list<bool>
  f.getCustomVariable(f.getSelfEntity(), "22")
  // getCustomVariable :: list<configId>
  f.getCustomVariable(f.getSelfEntity(), "24")
  // getCustomVariable :: list<entity>
  f.getCustomVariable(f.getSelfEntity(), "26")
  // getCustomVariable :: list<faction>
  f.getCustomVariable(f.getSelfEntity(), "28")
  // getCustomVariable :: list<float>
  f.getCustomVariable(f.getSelfEntity(), "30")
  // getCustomVariable :: list<guid>
  f.getCustomVariable(f.getSelfEntity(), "32")
  // getCustomVariable :: list<int>
  f.getCustomVariable(f.getSelfEntity(), "34")
  // getCustomVariable :: list<prefabId>
  f.getCustomVariable(f.getSelfEntity(), "36")
  // getCustomVariable :: list<str>
  f.getCustomVariable(f.getSelfEntity(), "38")
  // getCustomVariable :: list<vec3>
  f.getCustomVariable(f.getSelfEntity(), "40")
  // getCustomVariable :: dict<configId, bool>
  f.getCustomVariable(f.getSelfEntity(), "42")
  // getCustomVariable :: dict<configId, configId>
  f.getCustomVariable(f.getSelfEntity(), "44")
  // getCustomVariable :: dict<configId, entity>
  f.getCustomVariable(f.getSelfEntity(), "46")
  // getCustomVariable :: dict<configId, faction>
  f.getCustomVariable(f.getSelfEntity(), "48")
  // getCustomVariable :: dict<configId, float>
  f.getCustomVariable(f.getSelfEntity(), "50")
  // getCustomVariable :: dict<configId, guid>
  f.getCustomVariable(f.getSelfEntity(), "52")
  // getCustomVariable :: dict<configId, int>
  f.getCustomVariable(f.getSelfEntity(), "54")
  // getCustomVariable :: dict<configId, list<bool>>
  f.getCustomVariable(f.getSelfEntity(), "56")
  // getCustomVariable :: dict<configId, list<configId>>
  f.getCustomVariable(f.getSelfEntity(), "58")
  // getCustomVariable :: dict<configId, list<entity>>
  f.getCustomVariable(f.getSelfEntity(), "60")
  // getCustomVariable :: dict<configId, list<faction>>
  f.getCustomVariable(f.getSelfEntity(), "62")
  // getCustomVariable :: dict<configId, list<float>>
  f.getCustomVariable(f.getSelfEntity(), "64")
  // getCustomVariable :: dict<configId, list<guid>>
  f.getCustomVariable(f.getSelfEntity(), "66")
  // getCustomVariable :: dict<configId, list<int>>
  f.getCustomVariable(f.getSelfEntity(), "68")
  // getCustomVariable :: dict<configId, list<str>>
  f.getCustomVariable(f.getSelfEntity(), "70")
  // getCustomVariable :: dict<configId, list<vec3>>
  f.getCustomVariable(f.getSelfEntity(), "72")
  // getCustomVariable :: dict<configId, prefabId>
  f.getCustomVariable(f.getSelfEntity(), "74")
  // getCustomVariable :: dict<configId, str>
  f.getCustomVariable(f.getSelfEntity(), "76")
  // getCustomVariable :: dict<configId, vec3>
  f.getCustomVariable(f.getSelfEntity(), "78")
  // getCustomVariable :: dict<entity, bool>
  f.getCustomVariable(f.getSelfEntity(), "80")
  // getCustomVariable :: dict<entity, configId>
  f.getCustomVariable(f.getSelfEntity(), "82")
  // getCustomVariable :: dict<entity, entity>
  f.getCustomVariable(f.getSelfEntity(), "84")
  // getCustomVariable :: dict<entity, faction>
  f.getCustomVariable(f.getSelfEntity(), "86")
  // getCustomVariable :: dict<entity, float>
  f.getCustomVariable(f.getSelfEntity(), "88")
  // getCustomVariable :: dict<entity, guid>
  f.getCustomVariable(f.getSelfEntity(), "90")
  // getCustomVariable :: dict<entity, int>
  f.getCustomVariable(f.getSelfEntity(), "92")
  // getCustomVariable :: dict<entity, list<bool>>
  f.getCustomVariable(f.getSelfEntity(), "94")
  // getCustomVariable :: dict<entity, list<configId>>
  f.getCustomVariable(f.getSelfEntity(), "96")
  // getCustomVariable :: dict<entity, list<entity>>
  f.getCustomVariable(f.getSelfEntity(), "98")
  // getCustomVariable :: dict<entity, list<faction>>
  f.getCustomVariable(f.getSelfEntity(), "100")
  // getCustomVariable :: dict<entity, list<float>>
  f.getCustomVariable(f.getSelfEntity(), "102")
  // getCustomVariable :: dict<entity, list<guid>>
  f.getCustomVariable(f.getSelfEntity(), "104")
  // getCustomVariable :: dict<entity, list<int>>
  f.getCustomVariable(f.getSelfEntity(), "106")
  // getCustomVariable :: dict<entity, list<str>>
  f.getCustomVariable(f.getSelfEntity(), "108")
  // getCustomVariable :: dict<entity, list<vec3>>
  f.getCustomVariable(f.getSelfEntity(), "110")
  // getCustomVariable :: dict<entity, prefabId>
  f.getCustomVariable(f.getSelfEntity(), "112")
  // getCustomVariable :: dict<entity, str>
  f.getCustomVariable(f.getSelfEntity(), "114")
  // getCustomVariable :: dict<entity, vec3>
  f.getCustomVariable(f.getSelfEntity(), "116")
  // getCustomVariable :: dict<faction, bool>
  f.getCustomVariable(f.getSelfEntity(), "118")
  // getCustomVariable :: dict<faction, configId>
  f.getCustomVariable(f.getSelfEntity(), "120")
  // getCustomVariable :: dict<faction, entity>
  f.getCustomVariable(f.getSelfEntity(), "122")
  // getCustomVariable :: dict<faction, faction>
  f.getCustomVariable(f.getSelfEntity(), "124")
  // getCustomVariable :: dict<faction, float>
  f.getCustomVariable(f.getSelfEntity(), "126")
  // getCustomVariable :: dict<faction, guid>
  f.getCustomVariable(f.getSelfEntity(), "128")
  // getCustomVariable :: dict<faction, int>
  f.getCustomVariable(f.getSelfEntity(), "130")
  // getCustomVariable :: dict<faction, list<bool>>
  f.getCustomVariable(f.getSelfEntity(), "132")
  // getCustomVariable :: dict<faction, list<configId>>
  f.getCustomVariable(f.getSelfEntity(), "134")
  // getCustomVariable :: dict<faction, list<entity>>
  f.getCustomVariable(f.getSelfEntity(), "136")
  // getCustomVariable :: dict<faction, list<faction>>
  f.getCustomVariable(f.getSelfEntity(), "138")
  // getCustomVariable :: dict<faction, list<float>>
  f.getCustomVariable(f.getSelfEntity(), "140")
  // getCustomVariable :: dict<faction, list<guid>>
  f.getCustomVariable(f.getSelfEntity(), "142")
  // getCustomVariable :: dict<faction, list<int>>
  f.getCustomVariable(f.getSelfEntity(), "144")
  // getCustomVariable :: dict<faction, list<str>>
  f.getCustomVariable(f.getSelfEntity(), "146")
  // getCustomVariable :: dict<faction, list<vec3>>
  f.getCustomVariable(f.getSelfEntity(), "148")
  // getCustomVariable :: dict<faction, prefabId>
  f.getCustomVariable(f.getSelfEntity(), "150")
  // getCustomVariable :: dict<faction, str>
  f.getCustomVariable(f.getSelfEntity(), "152")
  // getCustomVariable :: dict<faction, vec3>
  f.getCustomVariable(f.getSelfEntity(), "154")
  // getCustomVariable :: dict<guid, bool>
  f.getCustomVariable(f.getSelfEntity(), "156")
  // getCustomVariable :: dict<guid, configId>
  f.getCustomVariable(f.getSelfEntity(), "158")
  // getCustomVariable :: dict<guid, entity>
  f.getCustomVariable(f.getSelfEntity(), "160")
  // getCustomVariable :: dict<guid, faction>
  f.getCustomVariable(f.getSelfEntity(), "162")
  // getCustomVariable :: dict<guid, float>
  f.getCustomVariable(f.getSelfEntity(), "164")
  // getCustomVariable :: dict<guid, guid>
  f.getCustomVariable(f.getSelfEntity(), "166")
  // getCustomVariable :: dict<guid, int>
  f.getCustomVariable(f.getSelfEntity(), "168")
  // getCustomVariable :: dict<guid, list<bool>>
  f.getCustomVariable(f.getSelfEntity(), "170")
  // getCustomVariable :: dict<guid, list<configId>>
  f.getCustomVariable(f.getSelfEntity(), "172")
  // getCustomVariable :: dict<guid, list<entity>>
  f.getCustomVariable(f.getSelfEntity(), "174")
  // getCustomVariable :: dict<guid, list<faction>>
  f.getCustomVariable(f.getSelfEntity(), "176")
  // getCustomVariable :: dict<guid, list<float>>
  f.getCustomVariable(f.getSelfEntity(), "178")
  // getCustomVariable :: dict<guid, list<guid>>
  f.getCustomVariable(f.getSelfEntity(), "180")
  // getCustomVariable :: dict<guid, list<int>>
  f.getCustomVariable(f.getSelfEntity(), "182")
  // getCustomVariable :: dict<guid, list<str>>
  f.getCustomVariable(f.getSelfEntity(), "184")
  // getCustomVariable :: dict<guid, list<vec3>>
  f.getCustomVariable(f.getSelfEntity(), "186")
  // getCustomVariable :: dict<guid, prefabId>
  f.getCustomVariable(f.getSelfEntity(), "188")
  // getCustomVariable :: dict<guid, str>
  f.getCustomVariable(f.getSelfEntity(), "190")
  // getCustomVariable :: dict<guid, vec3>
  f.getCustomVariable(f.getSelfEntity(), "192")
  // getCustomVariable :: dict<int, bool>
  f.getCustomVariable(f.getSelfEntity(), "194")
  // getCustomVariable :: dict<int, configId>
  f.getCustomVariable(f.getSelfEntity(), "196")
  // getCustomVariable :: dict<int, entity>
  f.getCustomVariable(f.getSelfEntity(), "198")
  // getCustomVariable :: dict<int, faction>
  f.getCustomVariable(f.getSelfEntity(), "200")
  // getCustomVariable :: dict<int, float>
  f.getCustomVariable(f.getSelfEntity(), "202")
  // getCustomVariable :: dict<int, guid>
  f.getCustomVariable(f.getSelfEntity(), "204")
  // getCustomVariable :: dict<int, int>
  f.getCustomVariable(f.getSelfEntity(), "206")
  // getCustomVariable :: dict<int, list<bool>>
  f.getCustomVariable(f.getSelfEntity(), "208")
  // getCustomVariable :: dict<int, list<configId>>
  f.getCustomVariable(f.getSelfEntity(), "210")
  // getCustomVariable :: dict<int, list<entity>>
  f.getCustomVariable(f.getSelfEntity(), "212")
  // getCustomVariable :: dict<int, list<faction>>
  f.getCustomVariable(f.getSelfEntity(), "214")
  // getCustomVariable :: dict<int, list<float>>
  f.getCustomVariable(f.getSelfEntity(), "216")
  // getCustomVariable :: dict<int, list<guid>>
  f.getCustomVariable(f.getSelfEntity(), "218")
  // getCustomVariable :: dict<int, list<int>>
  f.getCustomVariable(f.getSelfEntity(), "220")
  // getCustomVariable :: dict<int, list<str>>
  f.getCustomVariable(f.getSelfEntity(), "222")
  // getCustomVariable :: dict<int, list<vec3>>
  f.getCustomVariable(f.getSelfEntity(), "224")
  // getCustomVariable :: dict<int, prefabId>
  f.getCustomVariable(f.getSelfEntity(), "226")
  // getCustomVariable :: dict<int, str>
  f.getCustomVariable(f.getSelfEntity(), "228")
  // getCustomVariable :: dict<int, vec3>
  f.getCustomVariable(f.getSelfEntity(), "230")
  // getCustomVariable :: dict<prefabId, bool>
  f.getCustomVariable(f.getSelfEntity(), "232")
  // getCustomVariable :: dict<prefabId, configId>
  f.getCustomVariable(f.getSelfEntity(), "234")
  // getCustomVariable :: dict<prefabId, entity>
  f.getCustomVariable(f.getSelfEntity(), "236")
  // getCustomVariable :: dict<prefabId, faction>
  f.getCustomVariable(f.getSelfEntity(), "238")
  // getCustomVariable :: dict<prefabId, float>
  f.getCustomVariable(f.getSelfEntity(), "240")
  // getCustomVariable :: dict<prefabId, guid>
  f.getCustomVariable(f.getSelfEntity(), "242")
  // getCustomVariable :: dict<prefabId, int>
  f.getCustomVariable(f.getSelfEntity(), "244")
  // getCustomVariable :: dict<prefabId, list<bool>>
  f.getCustomVariable(f.getSelfEntity(), "246")
  // getCustomVariable :: dict<prefabId, list<configId>>
  f.getCustomVariable(f.getSelfEntity(), "248")
  // getCustomVariable :: dict<prefabId, list<entity>>
  f.getCustomVariable(f.getSelfEntity(), "250")
  // getCustomVariable :: dict<prefabId, list<faction>>
  f.getCustomVariable(f.getSelfEntity(), "252")
  // getCustomVariable :: dict<prefabId, list<float>>
  f.getCustomVariable(f.getSelfEntity(), "254")
  // getCustomVariable :: dict<prefabId, list<guid>>
  f.getCustomVariable(f.getSelfEntity(), "256")
  // getCustomVariable :: dict<prefabId, list<int>>
  f.getCustomVariable(f.getSelfEntity(), "258")
  // getCustomVariable :: dict<prefabId, list<str>>
  f.getCustomVariable(f.getSelfEntity(), "260")
  // getCustomVariable :: dict<prefabId, list<vec3>>
  f.getCustomVariable(f.getSelfEntity(), "262")
  // getCustomVariable :: dict<prefabId, prefabId>
  f.getCustomVariable(f.getSelfEntity(), "264")
  // getCustomVariable :: dict<prefabId, str>
  f.getCustomVariable(f.getSelfEntity(), "266")
  // getCustomVariable :: dict<prefabId, vec3>
  f.getCustomVariable(f.getSelfEntity(), "268")
  // getCustomVariable :: dict<str, bool>
  f.getCustomVariable(f.getSelfEntity(), "270")
  // getCustomVariable :: dict<str, configId>
  f.getCustomVariable(f.getSelfEntity(), "272")
  // getCustomVariable :: dict<str, entity>
  f.getCustomVariable(f.getSelfEntity(), "274")
  // getCustomVariable :: dict<str, faction>
  f.getCustomVariable(f.getSelfEntity(), "276")
  // getCustomVariable :: dict<str, float>
  f.getCustomVariable(f.getSelfEntity(), "278")
  // getCustomVariable :: dict<str, guid>
  f.getCustomVariable(f.getSelfEntity(), "280")
  // getCustomVariable :: dict<str, int>
  f.getCustomVariable(f.getSelfEntity(), "282")
  // getCustomVariable :: dict<str, list<bool>>
  f.getCustomVariable(f.getSelfEntity(), "284")
  // getCustomVariable :: dict<str, list<configId>>
  f.getCustomVariable(f.getSelfEntity(), "286")
  // getCustomVariable :: dict<str, list<entity>>
  f.getCustomVariable(f.getSelfEntity(), "288")
  // getCustomVariable :: dict<str, list<faction>>
  f.getCustomVariable(f.getSelfEntity(), "290")
  // getCustomVariable :: dict<str, list<float>>
  f.getCustomVariable(f.getSelfEntity(), "292")
  // getCustomVariable :: dict<str, list<guid>>
  f.getCustomVariable(f.getSelfEntity(), "294")
  // getCustomVariable :: dict<str, list<int>>
  f.getCustomVariable(f.getSelfEntity(), "296")
  // getCustomVariable :: dict<str, list<str>>
  f.getCustomVariable(f.getSelfEntity(), "298")
  // getCustomVariable :: dict<str, list<vec3>>
  f.getCustomVariable(f.getSelfEntity(), "300")
  // getCustomVariable :: dict<str, prefabId>
  f.getCustomVariable(f.getSelfEntity(), "302")
  // getCustomVariable :: dict<str, str>
  f.getCustomVariable(f.getSelfEntity(), "304")
  // getCustomVariable :: dict<str, vec3>
  f.getCustomVariable(f.getSelfEntity(), "306")
  // setNodeGraphVariable :: bool
  f.setNodeGraphVariable("1", false, true)
  // setNodeGraphVariable :: configId
  f.setNodeGraphVariable("4", new configId(5n), false)
  // setNodeGraphVariable :: entity
  f.setNodeGraphVariable("7", f.getSelfEntity(), true)
  // setNodeGraphVariable :: faction
  f.setNodeGraphVariable("10", new faction(11n), false)
  // setNodeGraphVariable :: float
  f.setNodeGraphVariable("13", 14.25, true)
  // setNodeGraphVariable :: guid
  f.setNodeGraphVariable("16", new guid(17n), false)
  // setNodeGraphVariable :: int
  f.setNodeGraphVariable("19", 20n, true)
  // setNodeGraphVariable :: prefabId
  f.setNodeGraphVariable("22", new prefabId(23n), false)
  // setNodeGraphVariable :: str
  f.setNodeGraphVariable("25", "26", true)
  // setNodeGraphVariable :: vec3
  f.setNodeGraphVariable("28", f.create3dVector(29, 30, 31), false)
  // setNodeGraphVariable :: list<bool>
  f.setNodeGraphVariable("31", f.assemblyList([false, true, false], "bool"), true)
  // setNodeGraphVariable :: list<configId>
  f.setNodeGraphVariable("34", f.assemblyList([35n, 36n, 37n], "config_id"), false)
  // setNodeGraphVariable :: list<entity>
  f.setNodeGraphVariable("37", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), false)
  // setNodeGraphVariable :: list<faction>
  f.setNodeGraphVariable("41", f.assemblyList([42n, 43n, 44n], "faction"), true)
  // setNodeGraphVariable :: list<float>
  f.setNodeGraphVariable("44", f.assemblyList([45.25, 46.25, 47.25], "float"), false)
  // setNodeGraphVariable :: list<guid>
  f.setNodeGraphVariable("47", f.assemblyList([48n, 49n, 50n], "guid"), true)
  // setNodeGraphVariable :: list<int>
  f.setNodeGraphVariable("50", f.assemblyList([51n, 52n, 53n], "int"), false)
  // setNodeGraphVariable :: list<prefabId>
  f.setNodeGraphVariable("53", f.assemblyList([54n, 55n, 56n], "prefab_id"), true)
  // setNodeGraphVariable :: list<str>
  f.setNodeGraphVariable("56", f.assemblyList(["57", "58", "59"], "str"), false)
  // setNodeGraphVariable :: list<vec3>
  f.setNodeGraphVariable("59", f.assemblyList([[60, 61, 62], [61, 62, 63], [62, 63, 64]], "vec3"), true)
  // setNodeGraphVariable :: dict<configId, bool>
  f.setNodeGraphVariable("62", true, false)
  // setNodeGraphVariable :: dict<configId, configId>
  f.setNodeGraphVariable("65", new configId(66n), true)
  // setNodeGraphVariable :: dict<configId, entity>
  f.setNodeGraphVariable("68", f.getSelfEntity(), false)
  // setNodeGraphVariable :: dict<configId, faction>
  f.setNodeGraphVariable("71", new faction(72n), true)
  // setNodeGraphVariable :: dict<configId, float>
  f.setNodeGraphVariable("74", 75.25, false)
  // setNodeGraphVariable :: dict<configId, guid>
  f.setNodeGraphVariable("77", new guid(78n), true)
  // setNodeGraphVariable :: dict<configId, int>
  f.setNodeGraphVariable("80", 81n, false)
  // setNodeGraphVariable :: dict<configId, list<bool>>
  f.setNodeGraphVariable("83", f.assemblyList([false, true, false], "bool"), true)
  // setNodeGraphVariable :: dict<configId, list<configId>>
  f.setNodeGraphVariable("86", f.assemblyList([87n, 88n, 89n], "config_id"), false)
  // setNodeGraphVariable :: dict<configId, list<entity>>
  f.setNodeGraphVariable("89", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), false)
  // setNodeGraphVariable :: dict<configId, list<faction>>
  f.setNodeGraphVariable("93", f.assemblyList([94n, 95n, 96n], "faction"), true)
  // setNodeGraphVariable :: dict<configId, list<float>>
  f.setNodeGraphVariable("96", f.assemblyList([97.25, 98.25, 99.25], "float"), false)
  // setNodeGraphVariable :: dict<configId, list<guid>>
  f.setNodeGraphVariable("99", f.assemblyList([100n, 101n, 102n], "guid"), true)
  // setNodeGraphVariable :: dict<configId, list<int>>
  f.setNodeGraphVariable("102", f.assemblyList([103n, 104n, 105n], "int"), false)
  // setNodeGraphVariable :: dict<configId, list<str>>
  f.setNodeGraphVariable("105", f.assemblyList(["106", "107", "108"], "str"), true)
  // setNodeGraphVariable :: dict<configId, list<vec3>>
  f.setNodeGraphVariable("108", f.assemblyList([[109, 110, 111], [110, 111, 112], [111, 112, 113]], "vec3"), false)
  // setNodeGraphVariable :: dict<configId, prefabId>
  f.setNodeGraphVariable("111", new prefabId(112n), true)
  // setNodeGraphVariable :: dict<configId, str>
  f.setNodeGraphVariable("114", "115", false)
  // setNodeGraphVariable :: dict<configId, vec3>
  f.setNodeGraphVariable("117", f.create3dVector(118, 119, 120), true)
  // setNodeGraphVariable :: dict<entity, bool>
  f.setNodeGraphVariable("120", true, false)
  // setNodeGraphVariable :: dict<entity, configId>
  f.setNodeGraphVariable("123", new configId(124n), true)
  // setNodeGraphVariable :: dict<entity, entity>
  f.setNodeGraphVariable("126", f.getSelfEntity(), false)
  // setNodeGraphVariable :: dict<entity, faction>
  f.setNodeGraphVariable("129", new faction(130n), true)
  // setNodeGraphVariable :: dict<entity, float>
  f.setNodeGraphVariable("132", 133.25, false)
  // setNodeGraphVariable :: dict<entity, guid>
  f.setNodeGraphVariable("135", new guid(136n), true)
  // setNodeGraphVariable :: dict<entity, int>
  f.setNodeGraphVariable("138", 139n, false)
  // setNodeGraphVariable :: dict<entity, list<bool>>
  f.setNodeGraphVariable("141", f.assemblyList([false, true, false], "bool"), true)
  // setNodeGraphVariable :: dict<entity, list<configId>>
  f.setNodeGraphVariable("144", f.assemblyList([145n, 146n, 147n], "config_id"), false)
  // setNodeGraphVariable :: dict<entity, list<entity>>
  f.setNodeGraphVariable("147", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), false)
  // setNodeGraphVariable :: dict<entity, list<faction>>
  f.setNodeGraphVariable("151", f.assemblyList([152n, 153n, 154n], "faction"), true)
  // setNodeGraphVariable :: dict<entity, list<float>>
  f.setNodeGraphVariable("154", f.assemblyList([155.25, 156.25, 157.25], "float"), false)
  // setNodeGraphVariable :: dict<entity, list<guid>>
  f.setNodeGraphVariable("157", f.assemblyList([158n, 159n, 160n], "guid"), true)
  // setNodeGraphVariable :: dict<entity, list<int>>
  f.setNodeGraphVariable("160", f.assemblyList([161n, 162n, 163n], "int"), false)
  // setNodeGraphVariable :: dict<entity, list<str>>
  f.setNodeGraphVariable("163", f.assemblyList(["164", "165", "166"], "str"), true)
  // setNodeGraphVariable :: dict<entity, list<vec3>>
  f.setNodeGraphVariable("166", f.assemblyList([[167, 168, 169], [168, 169, 170], [169, 170, 171]], "vec3"), false)
  // setNodeGraphVariable :: dict<entity, prefabId>
  f.setNodeGraphVariable("169", new prefabId(170n), true)
  // setNodeGraphVariable :: dict<entity, str>
  f.setNodeGraphVariable("172", "173", false)
  // setNodeGraphVariable :: dict<entity, vec3>
  f.setNodeGraphVariable("175", f.create3dVector(176, 177, 178), true)
  // setNodeGraphVariable :: dict<faction, bool>
  f.setNodeGraphVariable("178", true, false)
  // setNodeGraphVariable :: dict<faction, configId>
  f.setNodeGraphVariable("181", new configId(182n), true)
  // setNodeGraphVariable :: dict<faction, entity>
  f.setNodeGraphVariable("184", f.getSelfEntity(), false)
  // setNodeGraphVariable :: dict<faction, faction>
  f.setNodeGraphVariable("187", new faction(188n), true)
  // setNodeGraphVariable :: dict<faction, float>
  f.setNodeGraphVariable("190", 191.25, false)
  // setNodeGraphVariable :: dict<faction, guid>
  f.setNodeGraphVariable("193", new guid(194n), true)
  // setNodeGraphVariable :: dict<faction, int>
  f.setNodeGraphVariable("196", 197n, false)
  // setNodeGraphVariable :: dict<faction, list<bool>>
  f.setNodeGraphVariable("199", f.assemblyList([false, true, false], "bool"), true)
  // setNodeGraphVariable :: dict<faction, list<configId>>
  f.setNodeGraphVariable("202", f.assemblyList([203n, 204n, 205n], "config_id"), false)
  // setNodeGraphVariable :: dict<faction, list<entity>>
  f.setNodeGraphVariable("205", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), false)
  // setNodeGraphVariable :: dict<faction, list<faction>>
  f.setNodeGraphVariable("209", f.assemblyList([210n, 211n, 212n], "faction"), true)
  // setNodeGraphVariable :: dict<faction, list<float>>
  f.setNodeGraphVariable("212", f.assemblyList([213.25, 214.25, 215.25], "float"), false)
  // setNodeGraphVariable :: dict<faction, list<guid>>
  f.setNodeGraphVariable("215", f.assemblyList([216n, 217n, 218n], "guid"), true)
  // setNodeGraphVariable :: dict<faction, list<int>>
  f.setNodeGraphVariable("218", f.assemblyList([219n, 220n, 221n], "int"), false)
  // setNodeGraphVariable :: dict<faction, list<str>>
  f.setNodeGraphVariable("221", f.assemblyList(["222", "223", "224"], "str"), true)
  // setNodeGraphVariable :: dict<faction, list<vec3>>
  f.setNodeGraphVariable("224", f.assemblyList([[225, 226, 227], [226, 227, 228], [227, 228, 229]], "vec3"), false)
  // setNodeGraphVariable :: dict<faction, prefabId>
  f.setNodeGraphVariable("227", new prefabId(228n), true)
  // setNodeGraphVariable :: dict<faction, str>
  f.setNodeGraphVariable("230", "231", false)
  // setNodeGraphVariable :: dict<faction, vec3>
  f.setNodeGraphVariable("233", f.create3dVector(234, 235, 236), true)
  // setNodeGraphVariable :: dict<guid, bool>
  f.setNodeGraphVariable("236", true, false)
  // setNodeGraphVariable :: dict<guid, configId>
  f.setNodeGraphVariable("239", new configId(240n), true)
  // setNodeGraphVariable :: dict<guid, entity>
  f.setNodeGraphVariable("242", f.getSelfEntity(), false)
  // setNodeGraphVariable :: dict<guid, faction>
  f.setNodeGraphVariable("245", new faction(246n), true)
  // setNodeGraphVariable :: dict<guid, float>
  f.setNodeGraphVariable("248", 249.25, false)
  // setNodeGraphVariable :: dict<guid, guid>
  f.setNodeGraphVariable("251", new guid(252n), true)
  // setNodeGraphVariable :: dict<guid, int>
  f.setNodeGraphVariable("254", 255n, false)
  // setNodeGraphVariable :: dict<guid, list<bool>>
  f.setNodeGraphVariable("257", f.assemblyList([false, true, false], "bool"), true)
  // setNodeGraphVariable :: dict<guid, list<configId>>
  f.setNodeGraphVariable("260", f.assemblyList([261n, 262n, 263n], "config_id"), false)
  // setNodeGraphVariable :: dict<guid, list<entity>>
  f.setNodeGraphVariable("263", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), false)
  // setNodeGraphVariable :: dict<guid, list<faction>>
  f.setNodeGraphVariable("267", f.assemblyList([268n, 269n, 270n], "faction"), true)
  // setNodeGraphVariable :: dict<guid, list<float>>
  f.setNodeGraphVariable("270", f.assemblyList([271.25, 272.25, 273.25], "float"), false)
  // setNodeGraphVariable :: dict<guid, list<guid>>
  f.setNodeGraphVariable("273", f.assemblyList([274n, 275n, 276n], "guid"), true)
  // setNodeGraphVariable :: dict<guid, list<int>>
  f.setNodeGraphVariable("276", f.assemblyList([277n, 278n, 279n], "int"), false)
  // setNodeGraphVariable :: dict<guid, list<str>>
  f.setNodeGraphVariable("279", f.assemblyList(["280", "281", "282"], "str"), true)
  // setNodeGraphVariable :: dict<guid, list<vec3>>
  f.setNodeGraphVariable("282", f.assemblyList([[283, 284, 285], [284, 285, 286], [285, 286, 287]], "vec3"), false)
  // setNodeGraphVariable :: dict<guid, prefabId>
  f.setNodeGraphVariable("285", new prefabId(286n), true)
  // setNodeGraphVariable :: dict<guid, str>
  f.setNodeGraphVariable("288", "289", false)
  // setNodeGraphVariable :: dict<guid, vec3>
  f.setNodeGraphVariable("291", f.create3dVector(292, 293, 294), true)
  // setNodeGraphVariable :: dict<int, bool>
  f.setNodeGraphVariable("294", true, false)
  // setNodeGraphVariable :: dict<int, configId>
  f.setNodeGraphVariable("297", new configId(298n), true)
  // setNodeGraphVariable :: dict<int, entity>
  f.setNodeGraphVariable("300", f.getSelfEntity(), false)
  // setNodeGraphVariable :: dict<int, faction>
  f.setNodeGraphVariable("303", new faction(304n), true)
  // setNodeGraphVariable :: dict<int, float>
  f.setNodeGraphVariable("306", 307.25, false)
  // setNodeGraphVariable :: dict<int, guid>
  f.setNodeGraphVariable("309", new guid(310n), true)
  // setNodeGraphVariable :: dict<int, int>
  f.setNodeGraphVariable("312", 313n, false)
  // setNodeGraphVariable :: dict<int, list<bool>>
  f.setNodeGraphVariable("315", f.assemblyList([false, true, false], "bool"), true)
  // setNodeGraphVariable :: dict<int, list<configId>>
  f.setNodeGraphVariable("318", f.assemblyList([319n, 320n, 321n], "config_id"), false)
  // setNodeGraphVariable :: dict<int, list<entity>>
  f.setNodeGraphVariable("321", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), false)
  // setNodeGraphVariable :: dict<int, list<faction>>
  f.setNodeGraphVariable("325", f.assemblyList([326n, 327n, 328n], "faction"), true)
  // setNodeGraphVariable :: dict<int, list<float>>
  f.setNodeGraphVariable("328", f.assemblyList([329.25, 330.25, 331.25], "float"), false)
  // setNodeGraphVariable :: dict<int, list<guid>>
  f.setNodeGraphVariable("331", f.assemblyList([332n, 333n, 334n], "guid"), true)
  // setNodeGraphVariable :: dict<int, list<int>>
  f.setNodeGraphVariable("334", f.assemblyList([335n, 336n, 337n], "int"), false)
  // setNodeGraphVariable :: dict<int, list<str>>
  f.setNodeGraphVariable("337", f.assemblyList(["338", "339", "340"], "str"), true)
  // setNodeGraphVariable :: dict<int, list<vec3>>
  f.setNodeGraphVariable("340", f.assemblyList([[341, 342, 343], [342, 343, 344], [343, 344, 345]], "vec3"), false)
  // setNodeGraphVariable :: dict<int, prefabId>
  f.setNodeGraphVariable("343", new prefabId(344n), true)
  // setNodeGraphVariable :: dict<int, str>
  f.setNodeGraphVariable("346", "347", false)
  // setNodeGraphVariable :: dict<int, vec3>
  f.setNodeGraphVariable("349", f.create3dVector(350, 351, 352), true)
  // setNodeGraphVariable :: dict<prefabId, bool>
  f.setNodeGraphVariable("352", true, false)
  // setNodeGraphVariable :: dict<prefabId, configId>
  f.setNodeGraphVariable("355", new configId(356n), true)
  // setNodeGraphVariable :: dict<prefabId, entity>
  f.setNodeGraphVariable("358", f.getSelfEntity(), false)
  // setNodeGraphVariable :: dict<prefabId, faction>
  f.setNodeGraphVariable("361", new faction(362n), true)
  // setNodeGraphVariable :: dict<prefabId, float>
  f.setNodeGraphVariable("364", 365.25, false)
  // setNodeGraphVariable :: dict<prefabId, guid>
  f.setNodeGraphVariable("367", new guid(368n), true)
  // setNodeGraphVariable :: dict<prefabId, int>
  f.setNodeGraphVariable("370", 371n, false)
  // setNodeGraphVariable :: dict<prefabId, list<bool>>
  f.setNodeGraphVariable("373", f.assemblyList([false, true, false], "bool"), true)
  // setNodeGraphVariable :: dict<prefabId, list<configId>>
  f.setNodeGraphVariable("376", f.assemblyList([377n, 378n, 379n], "config_id"), false)
  // setNodeGraphVariable :: dict<prefabId, list<entity>>
  f.setNodeGraphVariable("379", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), false)
  // setNodeGraphVariable :: dict<prefabId, list<faction>>
  f.setNodeGraphVariable("383", f.assemblyList([384n, 385n, 386n], "faction"), true)
  // setNodeGraphVariable :: dict<prefabId, list<float>>
  f.setNodeGraphVariable("386", f.assemblyList([387.25, 388.25, 389.25], "float"), false)
  // setNodeGraphVariable :: dict<prefabId, list<guid>>
  f.setNodeGraphVariable("389", f.assemblyList([390n, 391n, 392n], "guid"), true)
  // setNodeGraphVariable :: dict<prefabId, list<int>>
  f.setNodeGraphVariable("392", f.assemblyList([393n, 394n, 395n], "int"), false)
  // setNodeGraphVariable :: dict<prefabId, list<str>>
  f.setNodeGraphVariable("395", f.assemblyList(["396", "397", "398"], "str"), true)
  // setNodeGraphVariable :: dict<prefabId, list<vec3>>
  f.setNodeGraphVariable("398", f.assemblyList([[399, 400, 401], [400, 401, 402], [401, 402, 403]], "vec3"), false)
  // setNodeGraphVariable :: dict<prefabId, prefabId>
  f.setNodeGraphVariable("401", new prefabId(402n), true)
  // setNodeGraphVariable :: dict<prefabId, str>
  f.setNodeGraphVariable("404", "405", false)
  // setNodeGraphVariable :: dict<prefabId, vec3>
  f.setNodeGraphVariable("407", f.create3dVector(408, 409, 410), true)
  // setNodeGraphVariable :: dict<str, bool>
  f.setNodeGraphVariable("410", true, false)
  // setNodeGraphVariable :: dict<str, configId>
  f.setNodeGraphVariable("413", new configId(414n), true)
  // setNodeGraphVariable :: dict<str, entity>
  f.setNodeGraphVariable("416", f.getSelfEntity(), false)
  // setNodeGraphVariable :: dict<str, faction>
  f.setNodeGraphVariable("419", new faction(420n), true)
  // setNodeGraphVariable :: dict<str, float>
  f.setNodeGraphVariable("422", 423.25, false)
  // setNodeGraphVariable :: dict<str, guid>
  f.setNodeGraphVariable("425", new guid(426n), true)
  // setNodeGraphVariable :: dict<str, int>
  f.setNodeGraphVariable("428", 429n, false)
  // setNodeGraphVariable :: dict<str, list<bool>>
  f.setNodeGraphVariable("431", f.assemblyList([false, true, false], "bool"), true)
  // setNodeGraphVariable :: dict<str, list<configId>>
  f.setNodeGraphVariable("434", f.assemblyList([435n, 436n, 437n], "config_id"), false)
  // setNodeGraphVariable :: dict<str, list<entity>>
  f.setNodeGraphVariable("437", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"), false)
  // setNodeGraphVariable :: dict<str, list<faction>>
  f.setNodeGraphVariable("441", f.assemblyList([442n, 443n, 444n], "faction"), true)
  // setNodeGraphVariable :: dict<str, list<float>>
  f.setNodeGraphVariable("444", f.assemblyList([445.25, 446.25, 447.25], "float"), false)
  // setNodeGraphVariable :: dict<str, list<guid>>
  f.setNodeGraphVariable("447", f.assemblyList([448n, 449n, 450n], "guid"), true)
  // setNodeGraphVariable :: dict<str, list<int>>
  f.setNodeGraphVariable("450", f.assemblyList([451n, 452n, 453n], "int"), false)
  // setNodeGraphVariable :: dict<str, list<str>>
  f.setNodeGraphVariable("453", f.assemblyList(["454", "455", "456"], "str"), true)
  // setNodeGraphVariable :: dict<str, list<vec3>>
  f.setNodeGraphVariable("456", f.assemblyList([[457, 458, 459], [458, 459, 460], [459, 460, 461]], "vec3"), false)
  // setNodeGraphVariable :: dict<str, prefabId>
  f.setNodeGraphVariable("459", new prefabId(460n), true)
  // setNodeGraphVariable :: dict<str, str>
  f.setNodeGraphVariable("462", "463", false)
  // setNodeGraphVariable :: dict<str, vec3>
  f.setNodeGraphVariable("465", f.create3dVector(466, 467, 468), true)
  // getNodeGraphVariable :: bool
  f.getNodeGraphVariable("1")
  // getNodeGraphVariable :: configId
  f.getNodeGraphVariable("2")
  // getNodeGraphVariable :: entity
  f.getNodeGraphVariable("3")
  // getNodeGraphVariable :: faction
  f.getNodeGraphVariable("4")
  // getNodeGraphVariable :: float
  f.getNodeGraphVariable("5")
  // getNodeGraphVariable :: guid
  f.getNodeGraphVariable("6")
  // getNodeGraphVariable :: int
  f.getNodeGraphVariable("7")
  // getNodeGraphVariable :: prefabId
  f.getNodeGraphVariable("8")
  // getNodeGraphVariable :: str
  f.getNodeGraphVariable("9")
  // getNodeGraphVariable :: vec3
  f.getNodeGraphVariable("10")
  // getNodeGraphVariable :: list<bool>
  f.getNodeGraphVariable("11")
  // getNodeGraphVariable :: list<configId>
  f.getNodeGraphVariable("12")
  // getNodeGraphVariable :: list<entity>
  f.getNodeGraphVariable("13")
  // getNodeGraphVariable :: list<faction>
  f.getNodeGraphVariable("14")
  // getNodeGraphVariable :: list<float>
  f.getNodeGraphVariable("15")
  // getNodeGraphVariable :: list<guid>
  f.getNodeGraphVariable("16")
  // getNodeGraphVariable :: list<int>
  f.getNodeGraphVariable("17")
  // getNodeGraphVariable :: list<prefabId>
  f.getNodeGraphVariable("18")
  // getNodeGraphVariable :: list<str>
  f.getNodeGraphVariable("19")
  // getNodeGraphVariable :: list<vec3>
  f.getNodeGraphVariable("20")
  // getNodeGraphVariable :: dict<configId, bool>
  f.getNodeGraphVariable("21")
  // getNodeGraphVariable :: dict<configId, configId>
  f.getNodeGraphVariable("22")
  // getNodeGraphVariable :: dict<configId, entity>
  f.getNodeGraphVariable("23")
  // getNodeGraphVariable :: dict<configId, faction>
  f.getNodeGraphVariable("24")
  // getNodeGraphVariable :: dict<configId, float>
  f.getNodeGraphVariable("25")
  // getNodeGraphVariable :: dict<configId, guid>
  f.getNodeGraphVariable("26")
  // getNodeGraphVariable :: dict<configId, int>
  f.getNodeGraphVariable("27")
  // getNodeGraphVariable :: dict<configId, list<bool>>
  f.getNodeGraphVariable("28")
  // getNodeGraphVariable :: dict<configId, list<configId>>
  f.getNodeGraphVariable("29")
  // getNodeGraphVariable :: dict<configId, list<entity>>
  f.getNodeGraphVariable("30")
  // getNodeGraphVariable :: dict<configId, list<faction>>
  f.getNodeGraphVariable("31")
  // getNodeGraphVariable :: dict<configId, list<float>>
  f.getNodeGraphVariable("32")
  // getNodeGraphVariable :: dict<configId, list<guid>>
  f.getNodeGraphVariable("33")
  // getNodeGraphVariable :: dict<configId, list<int>>
  f.getNodeGraphVariable("34")
  // getNodeGraphVariable :: dict<configId, list<str>>
  f.getNodeGraphVariable("35")
  // getNodeGraphVariable :: dict<configId, list<vec3>>
  f.getNodeGraphVariable("36")
  // getNodeGraphVariable :: dict<configId, prefabId>
  f.getNodeGraphVariable("37")
  // getNodeGraphVariable :: dict<configId, str>
  f.getNodeGraphVariable("38")
  // getNodeGraphVariable :: dict<configId, vec3>
  f.getNodeGraphVariable("39")
  // getNodeGraphVariable :: dict<entity, bool>
  f.getNodeGraphVariable("40")
  // getNodeGraphVariable :: dict<entity, configId>
  f.getNodeGraphVariable("41")
  // getNodeGraphVariable :: dict<entity, entity>
  f.getNodeGraphVariable("42")
  // getNodeGraphVariable :: dict<entity, faction>
  f.getNodeGraphVariable("43")
  // getNodeGraphVariable :: dict<entity, float>
  f.getNodeGraphVariable("44")
  // getNodeGraphVariable :: dict<entity, guid>
  f.getNodeGraphVariable("45")
  // getNodeGraphVariable :: dict<entity, int>
  f.getNodeGraphVariable("46")
  // getNodeGraphVariable :: dict<entity, list<bool>>
  f.getNodeGraphVariable("47")
  // getNodeGraphVariable :: dict<entity, list<configId>>
  f.getNodeGraphVariable("48")
  // getNodeGraphVariable :: dict<entity, list<entity>>
  f.getNodeGraphVariable("49")
  // getNodeGraphVariable :: dict<entity, list<faction>>
  f.getNodeGraphVariable("50")
  // getNodeGraphVariable :: dict<entity, list<float>>
  f.getNodeGraphVariable("51")
  // getNodeGraphVariable :: dict<entity, list<guid>>
  f.getNodeGraphVariable("52")
  // getNodeGraphVariable :: dict<entity, list<int>>
  f.getNodeGraphVariable("53")
  // getNodeGraphVariable :: dict<entity, list<str>>
  f.getNodeGraphVariable("54")
  // getNodeGraphVariable :: dict<entity, list<vec3>>
  f.getNodeGraphVariable("55")
  // getNodeGraphVariable :: dict<entity, prefabId>
  f.getNodeGraphVariable("56")
  // getNodeGraphVariable :: dict<entity, str>
  f.getNodeGraphVariable("57")
  // getNodeGraphVariable :: dict<entity, vec3>
  f.getNodeGraphVariable("58")
  // getNodeGraphVariable :: dict<faction, bool>
  f.getNodeGraphVariable("59")
  // getNodeGraphVariable :: dict<faction, configId>
  f.getNodeGraphVariable("60")
  // getNodeGraphVariable :: dict<faction, entity>
  f.getNodeGraphVariable("61")
  // getNodeGraphVariable :: dict<faction, faction>
  f.getNodeGraphVariable("62")
  // getNodeGraphVariable :: dict<faction, float>
  f.getNodeGraphVariable("63")
  // getNodeGraphVariable :: dict<faction, guid>
  f.getNodeGraphVariable("64")
  // getNodeGraphVariable :: dict<faction, int>
  f.getNodeGraphVariable("65")
  // getNodeGraphVariable :: dict<faction, list<bool>>
  f.getNodeGraphVariable("66")
  // getNodeGraphVariable :: dict<faction, list<configId>>
  f.getNodeGraphVariable("67")
  // getNodeGraphVariable :: dict<faction, list<entity>>
  f.getNodeGraphVariable("68")
  // getNodeGraphVariable :: dict<faction, list<faction>>
  f.getNodeGraphVariable("69")
  // getNodeGraphVariable :: dict<faction, list<float>>
  f.getNodeGraphVariable("70")
  // getNodeGraphVariable :: dict<faction, list<guid>>
  f.getNodeGraphVariable("71")
  // getNodeGraphVariable :: dict<faction, list<int>>
  f.getNodeGraphVariable("72")
  // getNodeGraphVariable :: dict<faction, list<str>>
  f.getNodeGraphVariable("73")
  // getNodeGraphVariable :: dict<faction, list<vec3>>
  f.getNodeGraphVariable("74")
  // getNodeGraphVariable :: dict<faction, prefabId>
  f.getNodeGraphVariable("75")
  // getNodeGraphVariable :: dict<faction, str>
  f.getNodeGraphVariable("76")
  // getNodeGraphVariable :: dict<faction, vec3>
  f.getNodeGraphVariable("77")
  // getNodeGraphVariable :: dict<guid, bool>
  f.getNodeGraphVariable("78")
  // getNodeGraphVariable :: dict<guid, configId>
  f.getNodeGraphVariable("79")
  // getNodeGraphVariable :: dict<guid, entity>
  f.getNodeGraphVariable("80")
  // getNodeGraphVariable :: dict<guid, faction>
  f.getNodeGraphVariable("81")
  // getNodeGraphVariable :: dict<guid, float>
  f.getNodeGraphVariable("82")
  // getNodeGraphVariable :: dict<guid, guid>
  f.getNodeGraphVariable("83")
  // getNodeGraphVariable :: dict<guid, int>
  f.getNodeGraphVariable("84")
  // getNodeGraphVariable :: dict<guid, list<bool>>
  f.getNodeGraphVariable("85")
  // getNodeGraphVariable :: dict<guid, list<configId>>
  f.getNodeGraphVariable("86")
  // getNodeGraphVariable :: dict<guid, list<entity>>
  f.getNodeGraphVariable("87")
  // getNodeGraphVariable :: dict<guid, list<faction>>
  f.getNodeGraphVariable("88")
  // getNodeGraphVariable :: dict<guid, list<float>>
  f.getNodeGraphVariable("89")
  // getNodeGraphVariable :: dict<guid, list<guid>>
  f.getNodeGraphVariable("90")
  // getNodeGraphVariable :: dict<guid, list<int>>
  f.getNodeGraphVariable("91")
  // getNodeGraphVariable :: dict<guid, list<str>>
  f.getNodeGraphVariable("92")
  // getNodeGraphVariable :: dict<guid, list<vec3>>
  f.getNodeGraphVariable("93")
  // getNodeGraphVariable :: dict<guid, prefabId>
  f.getNodeGraphVariable("94")
  // getNodeGraphVariable :: dict<guid, str>
  f.getNodeGraphVariable("95")
  // getNodeGraphVariable :: dict<guid, vec3>
  f.getNodeGraphVariable("96")
  // getNodeGraphVariable :: dict<int, bool>
  f.getNodeGraphVariable("97")
  // getNodeGraphVariable :: dict<int, configId>
  f.getNodeGraphVariable("98")
  // getNodeGraphVariable :: dict<int, entity>
  f.getNodeGraphVariable("99")
  // getNodeGraphVariable :: dict<int, faction>
  f.getNodeGraphVariable("100")
  // getNodeGraphVariable :: dict<int, float>
  f.getNodeGraphVariable("101")
  // getNodeGraphVariable :: dict<int, guid>
  f.getNodeGraphVariable("102")
  // getNodeGraphVariable :: dict<int, int>
  f.getNodeGraphVariable("103")
  // getNodeGraphVariable :: dict<int, list<bool>>
  f.getNodeGraphVariable("104")
  // getNodeGraphVariable :: dict<int, list<configId>>
  f.getNodeGraphVariable("105")
  // getNodeGraphVariable :: dict<int, list<entity>>
  f.getNodeGraphVariable("106")
  // getNodeGraphVariable :: dict<int, list<faction>>
  f.getNodeGraphVariable("107")
  // getNodeGraphVariable :: dict<int, list<float>>
  f.getNodeGraphVariable("108")
  // getNodeGraphVariable :: dict<int, list<guid>>
  f.getNodeGraphVariable("109")
  // getNodeGraphVariable :: dict<int, list<int>>
  f.getNodeGraphVariable("110")
  // getNodeGraphVariable :: dict<int, list<str>>
  f.getNodeGraphVariable("111")
  // getNodeGraphVariable :: dict<int, list<vec3>>
  f.getNodeGraphVariable("112")
  // getNodeGraphVariable :: dict<int, prefabId>
  f.getNodeGraphVariable("113")
  // getNodeGraphVariable :: dict<int, str>
  f.getNodeGraphVariable("114")
  // getNodeGraphVariable :: dict<int, vec3>
  f.getNodeGraphVariable("115")
  // getNodeGraphVariable :: dict<prefabId, bool>
  f.getNodeGraphVariable("116")
  // getNodeGraphVariable :: dict<prefabId, configId>
  f.getNodeGraphVariable("117")
  // getNodeGraphVariable :: dict<prefabId, entity>
  f.getNodeGraphVariable("118")
  // getNodeGraphVariable :: dict<prefabId, faction>
  f.getNodeGraphVariable("119")
  // getNodeGraphVariable :: dict<prefabId, float>
  f.getNodeGraphVariable("120")
  // getNodeGraphVariable :: dict<prefabId, guid>
  f.getNodeGraphVariable("121")
  // getNodeGraphVariable :: dict<prefabId, int>
  f.getNodeGraphVariable("122")
  // getNodeGraphVariable :: dict<prefabId, list<bool>>
  f.getNodeGraphVariable("123")
  // getNodeGraphVariable :: dict<prefabId, list<configId>>
  f.getNodeGraphVariable("124")
  // getNodeGraphVariable :: dict<prefabId, list<entity>>
  f.getNodeGraphVariable("125")
  // getNodeGraphVariable :: dict<prefabId, list<faction>>
  f.getNodeGraphVariable("126")
  // getNodeGraphVariable :: dict<prefabId, list<float>>
  f.getNodeGraphVariable("127")
  // getNodeGraphVariable :: dict<prefabId, list<guid>>
  f.getNodeGraphVariable("128")
  // getNodeGraphVariable :: dict<prefabId, list<int>>
  f.getNodeGraphVariable("129")
  // getNodeGraphVariable :: dict<prefabId, list<str>>
  f.getNodeGraphVariable("130")
  // getNodeGraphVariable :: dict<prefabId, list<vec3>>
  f.getNodeGraphVariable("131")
  // getNodeGraphVariable :: dict<prefabId, prefabId>
  f.getNodeGraphVariable("132")
  // getNodeGraphVariable :: dict<prefabId, str>
  f.getNodeGraphVariable("133")
  // getNodeGraphVariable :: dict<prefabId, vec3>
  f.getNodeGraphVariable("134")
  // getNodeGraphVariable :: dict<str, bool>
  f.getNodeGraphVariable("135")
  // getNodeGraphVariable :: dict<str, configId>
  f.getNodeGraphVariable("136")
  // getNodeGraphVariable :: dict<str, entity>
  f.getNodeGraphVariable("137")
  // getNodeGraphVariable :: dict<str, faction>
  f.getNodeGraphVariable("138")
  // getNodeGraphVariable :: dict<str, float>
  f.getNodeGraphVariable("139")
  // getNodeGraphVariable :: dict<str, guid>
  f.getNodeGraphVariable("140")
  // getNodeGraphVariable :: dict<str, int>
  f.getNodeGraphVariable("141")
  // getNodeGraphVariable :: dict<str, list<bool>>
  f.getNodeGraphVariable("142")
  // getNodeGraphVariable :: dict<str, list<configId>>
  f.getNodeGraphVariable("143")
  // getNodeGraphVariable :: dict<str, list<entity>>
  f.getNodeGraphVariable("144")
  // getNodeGraphVariable :: dict<str, list<faction>>
  f.getNodeGraphVariable("145")
  // getNodeGraphVariable :: dict<str, list<float>>
  f.getNodeGraphVariable("146")
  // getNodeGraphVariable :: dict<str, list<guid>>
  f.getNodeGraphVariable("147")
  // getNodeGraphVariable :: dict<str, list<int>>
  f.getNodeGraphVariable("148")
  // getNodeGraphVariable :: dict<str, list<str>>
  f.getNodeGraphVariable("149")
  // getNodeGraphVariable :: dict<str, list<vec3>>
  f.getNodeGraphVariable("150")
  // getNodeGraphVariable :: dict<str, prefabId>
  f.getNodeGraphVariable("151")
  // getNodeGraphVariable :: dict<str, str>
  f.getNodeGraphVariable("152")
  // getNodeGraphVariable :: dict<str, vec3>
  f.getNodeGraphVariable("153")
})

