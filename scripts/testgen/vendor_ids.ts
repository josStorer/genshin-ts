import fs from 'node:fs'
import path from 'node:path'

export type LowerKeySet = Set<string>

function readText(p: string): string {
  return fs.readFileSync(p, 'utf8')
}

export function readVendorNodeIdKeysLower(repoRoot: string): LowerKeySet {
  const p = path.join(
    repoRoot,
    'src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_id.ts'
  )
  const text = readText(p)
  const keys: LowerKeySet = new Set()
  // parse "Key_Name: 123,"
  for (const m of text.matchAll(/^\s*([A-Za-z0-9_]+)\s*:\s*\d+\s*,/gm)) {
    const key = m[1]
    if (key) keys.add(key.toLowerCase())
  }
  return keys
}

export function canResolveNodeType(nodeType: string, vendorKeysLower: LowerKeySet): boolean {
  const lower = nodeType.toLowerCase()
  if (vendorKeysLower.has(lower)) return true
  // typed variants (Equal__Int, Get_Local_Variable__List_Int, etc.)
  for (const k of vendorKeysLower) {
    if (k.startsWith(lower + '__')) return true
  }
  // local fallbacks implemented in ir_to_gia_transform/node_id.ts
  if (lower === 'assemble_structure' || lower === 'split_structure') return true
  // SPECIAL_NODE_IDS mirror
  if (lower === 'send_signal') return true

  // SPECIAL_NODE_MAPPINGS mirror（与 ir_to_gia_transform/mappings.ts 保持一致，避免误跳过）
  const mapped = {
    player_plays_one_shot2d_sound_effect: 'player_plays_one_shot_2d_sound_effect',
    query_timestamp_utc0: 'query_timestamp_utc_0',
    split3d_vector: 'split_3d_vector',
    create3d_vector: 'create_3d_vector',
    get_entity_list_by_specified_prefab_id: 'get_entity_list_by_specified_prefab',
    get_all_items_from_loot_component: 'get_all_trophy_items',
    get_all_currency_from_loot_component: 'get_all_trophy_currency'
  }[lower]
  if (mapped) return canResolveNodeType(mapped, vendorKeysLower)
  return false
}
