import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_06 (literal)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741835 }).on('whenEntityIsCreated', (_evt, f) => {
  // setLocalVariable :: bool
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, true)
  // setLocalVariable :: configId
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, new configId(2n))
  // setLocalVariable :: entity
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.getSelfEntity())
  // setLocalVariable :: faction
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, new faction(4n))
  // setLocalVariable :: float
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, 5.25)
  // setLocalVariable :: guid
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, new guid(6n))
  // setLocalVariable :: int
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, 7n)
  // setLocalVariable :: prefabId
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, new prefabId(8n))
  // setLocalVariable :: str
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, "9")
  // setLocalVariable :: vec3
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.create3dVector(10, 11, 12))
  // setLocalVariable :: list<bool>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([true, false, true], "bool"))
  // setLocalVariable :: list<configId>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([12n, 13n, 14n], "config_id"))
  // setLocalVariable :: list<entity>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // setLocalVariable :: list<faction>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([15n, 16n, 17n], "faction"))
  // setLocalVariable :: list<float>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([16.25, 17.25, 18.25], "float"))
  // setLocalVariable :: list<guid>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([17n, 18n, 19n], "guid"))
  // setLocalVariable :: list<int>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([18n, 19n, 20n], "int"))
  // setLocalVariable :: list<prefabId>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([19n, 20n, 21n], "prefab_id"))
  // setLocalVariable :: list<str>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList(["20", "21", "22"], "str"))
  // setLocalVariable :: list<vec3>
  f.setLocalVariable(f.getLocalVariable(1n).localVariable, f.assemblyList([[21, 22, 23], [22, 23, 24], [23, 24, 25]], "vec3"))
  // getLocalVariable :: bool
  f.getLocalVariable(true)
  // getLocalVariable :: configId
  f.getLocalVariable(new configId(2n))
  // getLocalVariable :: entity
  f.getLocalVariable(f.getSelfEntity())
  // getLocalVariable :: faction
  f.getLocalVariable(new faction(4n))
  // getLocalVariable :: float
  f.getLocalVariable(5.25)
  // getLocalVariable :: guid
  f.getLocalVariable(new guid(6n))
  // getLocalVariable :: int
  f.getLocalVariable(7n)
  // getLocalVariable :: prefabId
  f.getLocalVariable(new prefabId(8n))
  // getLocalVariable :: str
  f.getLocalVariable("9")
  // getLocalVariable :: vec3
  f.getLocalVariable(f.create3dVector(10, 11, 12))
  // getLocalVariable :: list<bool>
  f.getLocalVariable(f.assemblyList([true, false, true], "bool"))
  // getLocalVariable :: list<configId>
  f.getLocalVariable(f.assemblyList([12n, 13n, 14n], "config_id"))
  // getLocalVariable :: list<entity>
  f.getLocalVariable(f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // getLocalVariable :: list<faction>
  f.getLocalVariable(f.assemblyList([15n, 16n, 17n], "faction"))
  // getLocalVariable :: list<float>
  f.getLocalVariable(f.assemblyList([16.25, 17.25, 18.25], "float"))
  // getLocalVariable :: list<guid>
  f.getLocalVariable(f.assemblyList([17n, 18n, 19n], "guid"))
  // getLocalVariable :: list<int>
  f.getLocalVariable(f.assemblyList([18n, 19n, 20n], "int"))
  // getLocalVariable :: list<prefabId>
  f.getLocalVariable(f.assemblyList([19n, 20n, 21n], "prefab_id"))
  // getLocalVariable :: list<str>
  f.getLocalVariable(f.assemblyList(["20", "21", "22"], "str"))
  // getLocalVariable :: list<vec3>
  f.getLocalVariable(f.assemblyList([[21, 22, 23], [22, 23, 24], [23, 24, 25]], "vec3"))
})

