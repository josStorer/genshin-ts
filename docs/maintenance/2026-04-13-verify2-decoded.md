# 2026-04-13 verify2 反解记录

来源文件：

- `%USERPROFILE%\AppData\LocalLow\miHoYo\原神\BeyondLocal\Beyond_Local_Export\2026-04-13-verify2.gia`

用途：

- 验证本轮新增 `server` 节点与事件的真实 `concreteId`
- 验证输入/输出 pin 顺序
- 验证枚举值
- 检查是否存在 `hole`

创建约定：

- 用户按顺序创建了新增节点，编号 `1-25`
- `绑定自定义技能实例到指定槽位` 选择了额外枚举 `冲刺技能`

## 结论

- 本轮 25 项新增节点/事件都已成功定位到真实 `concreteId`
- 未发现新的 `hole`
- 技能槽位相关节点在编辑器真值中多处表现为 `E<0>` 通用枚举 pin
- 额外确认出枚举值：
  - `CharacterSkillSlot.DashSkill = 3102`

## 事件

### 1. `whenFloatingInteractionPageIsTriggered`

- `concreteId = 826`
- outputs:
  - `0:Ety`
  - `1:Gid`
  - `2:Int`
  - `3:Int`
  - `4:L<Int>`
  - `5:L<Int>`
- `hole`: 无

### 2. `whenEquipmentIsPurchased`

- `concreteId = 820`
- outputs:
  - `0:Ety`
  - `1:Gid`
  - `2:L<Int>`
- `hole`: 无

### 3. `whenEquipmentIsSold`

- `concreteId = 821`
- outputs:
  - `0:Ety`
  - `1:Gid`
  - `2:L<Int>`
- `hole`: 无

## 新增节点

### 4. `playUiAnimationOnControl`

- `concreteId = 827`
- inputs:
  - `0:Ety`
  - `1:Int`

### 5. `setPlayerCameraToFollowEntity`

- `concreteId = 818`
- inputs:
  - `0:Ety`
  - `1:Ety`
  - `2:Str`

### 6. `resetPlayerCameraToFollowEntity`

- `concreteId = 819`
- inputs:
  - `0:Ety`

### 7. `closeFloatingInteractionPage`

- `concreteId = 824`
- inputs:
  - `0:Ety`
  - `1:Int`

### 8. `updateFloatingInteractionPageListData`

- `concreteId = 825`
- inputs:
  - `0:Ety`
  - `1:Int`
  - `2:L<Int>`
  - `3:Bol`

### 9. `showFloatingInteractionPage`

- `concreteId = 828`
- inputs:
  - `0:Ety`
  - `1:Int`
  - `2:D<Int,L<Int>>`
- `hole`: 无

### 10. `setTextChatPermissions`

- `concreteId = 801`
- inputs:
  - `0:Ety`
  - `1:L<Int>`
  - `2:Bol`

### 11. `setVoiceChatScope`

- `concreteId = 800`
- inputs:
  - `0:Ety`
  - `1:L<Int>`
  - `2:Int`
  - `3:Bol`

### 12. `setVoiceChatPermissions`

- `concreteId = 802`
- inputs:
  - `0:Ety`
  - `1:L<Int>`
  - `2:Bol`
  - `3:Bol`

### 13. `bindCustomSkillInstanceToSpecifiedSlot`

- `concreteId = 806`
- inputs:
  - `0:Ety`
  - `1:Int`
  - `2:E<0> = 3102`
  - `3:E<0> = 2811`
- outputs:
  - `0:Int`
- `hole`: 无

说明：

- `input 2` 对应技能槽位，用户选择的是 `冲刺技能`
- `input 3` 对应 `OriginalSlotSkillHandling.KeepSlotRelation`

### 14. `unbindSkillInstance`

- `concreteId = 807`
- inputs:
  - `0:Ety`
  - `1:Int`

### 15. `unbindAllSkillInstancesOnTheSlot`

- `concreteId = 808`
- inputs:
  - `0:Ety`
  - `1:E<0> = 3122`
- outputs:
  - `0:L<Int>`

### 16. `createCustomSkillInstance`

- `concreteId = 809`
- inputs:
  - `0:Ety`
  - `1:Cfg`
- outputs:
  - `0:Int`

### 17. `destroyCustomSkillInstance`

- `concreteId = 810`
- inputs:
  - `0:Ety`
  - `1:Int`

### 18. `castSkillFromSpecifiedPanelSlot`

- `concreteId = 816`
- inputs:
  - `0:Ety`
  - `1:E<0> = 3121`
  - `2:Bol`

### 19. `castSpecifiedSkillInstance`

- `concreteId = 817`
- inputs:
  - `0:Ety`
  - `1:Int`
  - `2:Bol`

### 20. `removeEquipmentFromSpecifiedSlot`

- `concreteId = 822`
- inputs:
  - `0:Ety`
  - `1:Int`
  - `2:Int`

### 21. `querySkillConfigIdBySkillInstanceId`

- `concreteId = 811`
- inputs:
  - `0:Ety`
  - `1:Int`
- outputs:
  - `0:Cfg`

### 22. `queryAllSkillInstanceIdsBySkillConfigId`

- `concreteId = 812`
- inputs:
  - `0:Ety`
  - `1:Cfg`
- outputs:
  - `0:L<Int>`

### 23. `queryAllSkillInstanceIdsBySkillSlot`

- `concreteId = 813`
- inputs:
  - `0:Ety`
  - `1:E<0> = 3130`
- outputs:
  - `0:L<Int>`

### 24. `querySkillInstanceIdBySkillSlotAndSkillConfigId`

- `concreteId = 814`
- inputs:
  - `0:Ety`
  - `1:E<0> = 3123`
  - `2:Cfg`
- outputs:
  - `0:Int`

### 25. `querySkillAttributeGroupValue`

- `concreteId = 815`
- inputs:
  - `0:Ety`
  - `1:Cfg`
- outputs:
  - `0:Flt`

## 额外确认

### 技能槽位新增枚举

- 编辑器中文：`冲刺技能`
- 真实整数值：`3102`
- 代码侧对应：
  - `CharacterSkillSlot.DashSkill`
  - `character_skill_slot_dash_skill`

### `hole` 检查

本轮 25 项新增节点/事件未发现新的 `hole`。

尤其确认过：

- `showFloatingInteractionPage`
- `bindCustomSkillInstanceToSpecifiedSlot`
- `setVoiceChatPermissions`

这些节点的输入/输出 pin 均为连续索引。

### 编译器更新影响点

基于本文件，后续补齐了这些位置：

- `src/thirdparty/.../node_data/node_id.ts`
- `src/thirdparty/.../node_data/node_pin_records.ts`
- `src/thirdparty/.../node_data/enum_id.ts`
- `src/compiler/ir_to_gia_transform/mappings.ts`

这份文件的角色是“真值档案”，以后若再次核对新增节点真实编码，应优先参考本文件，而不是只看定义层签名。
