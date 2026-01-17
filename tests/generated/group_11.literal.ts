import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_11 (literal)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741840 }).on('whenEntityIsCreated', (_evt, f) => {
  // sortDictionaryByKey :: dict<int, bool>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: 2n, v: true }, { k: 4n, v: true }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, configId>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: 7n, v: new configId(8n) }, { k: 9n, v: new configId(10n) }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, entity>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: 12n, v: f.getSelfEntity() }, { k: 14n, v: f.getSelfEntity() }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, faction>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: 17n, v: new faction(18n) }, { k: 19n, v: new faction(20n) }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, float>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: 22n, v: 23.25 }, { k: 24n, v: 25.25 }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, guid>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: 27n, v: new guid(28n) }, { k: 29n, v: new guid(30n) }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, int>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: 32n, v: 33n }, { k: 34n, v: 35n }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, prefabId>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: 37n, v: new prefabId(38n) }, { k: 39n, v: new prefabId(40n) }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, str>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: 42n, v: "43" }, { k: 44n, v: "45" }]), E.SortBy.Ascending)
  // sortDictionaryByKey :: dict<int, vec3>
  f.sortDictionaryByKey(f.assemblyDictionary([{ k: 47n, v: f.create3dVector(48, 49, 50) }, { k: 49n, v: f.create3dVector(50, 51, 52) }]), E.SortBy.Ascending)
})

