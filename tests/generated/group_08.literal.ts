import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_08 (literal)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741837 }).on('whenEntityIsCreated', (_evt, f) => {
  // dataTypeConversion :: dict<bool, int>
  f.dataTypeConversion(true, "int")
  // dataTypeConversion :: dict<bool, str>
  f.dataTypeConversion(false, "int")
  // dataTypeConversion :: dict<entity, str>
  f.dataTypeConversion(f.getSelfEntity(), "int")
  // dataTypeConversion :: dict<float, int>
  f.dataTypeConversion(4.25, "int")
  // dataTypeConversion :: dict<float, str>
  f.dataTypeConversion(5.25, "int")
  // dataTypeConversion :: dict<guid, str>
  f.dataTypeConversion(new guid(6n), "int")
  // dataTypeConversion :: dict<int, bool>
  f.dataTypeConversion(7n, "int")
  // dataTypeConversion :: dict<int, float>
  f.dataTypeConversion(8n, "int")
  // dataTypeConversion :: dict<int, str>
  f.dataTypeConversion(9n, "int")
  // dataTypeConversion :: dict<vec3, str>
  f.dataTypeConversion(f.create3dVector(10, 11, 12), "int")
})

