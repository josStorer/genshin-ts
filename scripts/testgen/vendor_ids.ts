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
  if (
    lower === 'send_signal' ||
    lower === 'monitor_signal' ||
    lower === 'assemble_structure' ||
    lower === 'split_structure' ||
    lower === 'modify_structure'
  ) {
    return true
  }

  // SPECIAL_NODE_MAPPINGS mirror（与 ir_to_gia_transform/mappings.ts 保持一致，避免误跳过）
  const mappings: Record<string, string> = {
    enable_disable_pathfinding_obstacle: 'activate_disable_pathfinding_obstacle',
    enable_disable_pathfinding_obstacle_feature: 'activate_disable_pathfinding_obstacle_feature',
    player_plays_one_shot2d_sound_effect: 'player_plays_one_shot_2d_sound_effect',
    query_timestamp_utc0: 'query_timestamp_utc_0',
    split3d_vector: 'split_3d_vector',
    create3d_vector: 'create_3d_vector',
    get_entity_list_by_specified_prefab_id: 'get_entity_list_by_specified_prefab',
    get_all_items_from_loot_component: 'get_all_trophy_items',
    get_all_currency_from_loot_component: 'get_all_trophy_currency',
    increase_achievement_progress_tally: 'change_achievement_progress_tally',
    increase_character_skill_cd: 'modify_character_skill_cd',
    increase_global_timer_value: 'modify_global_timer',
    increase_inventory_currency_quantity: 'modify_inventory_currency_quantity',
    increase_inventory_item_quantity: 'modify_inventory_item_quantity',
    increase_loot_component_currency_quantity: 'modify_loot_component_currency_amount',
    increase_loot_component_item_quantity: 'modify_loot_item_component_quantity',
    increase_skill_resource_amount: 'modify_skill_resource_amount',
    revive_the_active_character: 'revive_active_character',
    set_character_skill_cd: 'modify_character_skill_cd',
    set_character_disruptor_device: 'modifying_character_disruptor_device',
    set_custom_shop_item_sales_info: 'modify_custom_shop_item_sales_info',
    set_entity_faction: 'modify_entity_faction',
    set_environment_configuration: 'modify_environment_settings',
    set_equipment_affix_value: 'modify_equipment_affix_value',
    set_inventory_shop_item_sales_info: 'modify_inventory_shop_item_sales_info',
    set_item_purchase_info_in_the_purchase_list: 'modify_item_purchase_info_in_the_purchase_list',
    set_list_value: 'modify_value_in_list',
    set_mini_map_marker_activation_status: 'modify_mini_map_marker_activation_status',
    set_mini_map_zoom: 'modify_mini_map_zoom',
    set_player_background_music: 'modify_player_background_music',
    set_player_channel_permissions: 'modify_player_channel_permission',
    set_player_list_for_tracking_mini_map_markers:
      'modify_player_list_for_tracking_mini_map_markers',
    set_player_list_for_visible_mini_map_markers: 'modify_player_list_for_visible_mini_map_markers',
    set_player_markers_on_the_mini_map: 'modify_player_markers_on_the_mini_map',
    set_skill_cd_based_on_maximum_cd_percentage: 'modify_skill_cd_percentage_based_on_max_cd',
    set_ui_control_group_status: 'modify_ui_control_status_within_the_interface_layout'
  }
  const mapped = mappings[lower]
  if (mapped) return canResolveNodeType(mapped, vendorKeysLower)
  return false
}
