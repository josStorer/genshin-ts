# 版本节点例行维护手册

这份文档用于复盘并固化一次完整的 `resources/node_definitions.json` 例行维护流程，目标是让后续版本更新可以按固定步骤重复执行，而不是每次从头摸索。

当前文档相关工作基于v0.1.8 - v0.1.9之间的提交, 也可用于参考相关提交的改动

适用范围：

- `server` 节点与事件
- `classic` / `beyond` 模式可用性维护
- 定义层、编译器层、真值导出验证

不包含：

- `client` 节点
- 造物状态图等当前仓库未完整支持的体系
- 与本轮无关的重构

## 本轮维护目标

本轮维护围绕 `resources/node_definitions.json` 的更新，完成了以下事情：

- 补齐新增 `server` 节点与事件的定义
- 修正已有节点/事件的参数、注释、模式限制
- 基于编辑器真实导出的 `.gia` 反解具体 `node id`、`pin`、枚举值、`hole`
- 更新编译器映射和第三方节点数据
- 生成可导入编辑器的单文件验证脚本
- 统计两种模式下节点与事件总量，用于和编辑器列表对拍

## 先决条件

开始维护前，先确认以下输入已经具备：

- 更新后的 `resources/node_definitions.json`
- 至少一个可对照的历史提交
  这次实际参考了 `344f4f4e` 和 `7d6a91c5`
- 可以手动在编辑器里建图并导出 `.gia`
- 当前仓库可以正常执行 `npm run build`

## 总体流程

建议以后始终按这个顺序做：

1. 差分 `node_definitions.json`
2. 判断范围，只做当前仓库已支持的体系
3. 更新定义层
4. 识别“旧节点修订”与“新增节点”
5. 为需要真值的数据项生成建图清单
6. 收集用户从编辑器导出的 `.gia`
7. 反解 `id / pin / 枚举值 / hole`
8. 更新编译器与第三方节点数据
9. 生成导入验证脚本
10. 统计节点/事件数量并按模式分组
11. 最终和编辑器对拍

## 第一步：界定本轮范围

不要默认全量跟进 `node_definitions.json`。

先判断这次更新涉及的是：

- 已支持的 `server/beyond/classic`
- 仅文案变化
- 参数或返回值变化
- 新增节点/事件
- 当前仓库未覆盖的 `client` / 其他体系

本轮最终范围是：

- 只覆盖已经支持的 `server/beyond/classic`
- 不处理 `client`
- 不处理造物状态图等未支持体系

这个判断非常重要。否则很容易把“例行补点”做成“大范围半成品改造”。

## 第二步：先做定义层更新

定义层是第一落点，因为这里直接决定：

- TS API 是否暴露新节点
- 中英文名称和说明是否能对齐官方
- 参数类型是否正确
- 事件 payload 和 `.on(...)` 重载是否完整

本轮实际涉及的主要文件：

- `src/definitions/nodes.ts`
- `src/definitions/events.ts`
- `src/definitions/events-payload.ts`
- `src/definitions/server_on_overloads.d.ts`
- `src/definitions/entity_helpers.ts`
- `src/definitions/zh_aliases.ts`
- `src/definitions/enum.ts`
- `src/definitions/node_modes.ts`

### 定义层维护规则

- 中文名优先对齐官方中文，不要意译
- 英文说明与中文说明都尽量对齐 `node_definitions.json`
- 不要把旧节点改名，除非资源文件明确是重命名
- 若只是新增参数，不要顺手破坏旧签名
- 事件必须同时更新：
  - `events.ts`
  - `events-payload.ts`
  - `server_on_overloads.d.ts`

### 本轮补过的新增事件

- `whenFloatingInteractionPageIsTriggered`
- `whenEquipmentIsPurchased`
- `whenEquipmentIsSold`

### 本轮补过的新增节点

- `playUiAnimationOnControl`
- `setPlayerCameraToFollowEntity`
- `resetPlayerCameraToFollowEntity`
- `closeFloatingInteractionPage`
- `updateFloatingInteractionPageListData`
- `showFloatingInteractionPage`
- `setTextChatPermissions`
- `setVoiceChatScope`
- `setVoiceChatPermissions`
- `bindCustomSkillInstanceToSpecifiedSlot`
- `unbindSkillInstance`
- `unbindAllSkillInstancesOnTheSlot`
- `createCustomSkillInstance`
- `destroyCustomSkillInstance`
- `castSkillFromSpecifiedPanelSlot`
- `castSpecifiedSkillInstance`
- `removeEquipmentFromSpecifiedSlot`
- `querySkillConfigIdBySkillInstanceId`
- `queryAllSkillInstanceIdsBySkillConfigId`
- `queryAllSkillInstanceIdsBySkillSlot`
- `querySkillInstanceIdBySkillSlotAndSkillConfigId`
- `querySkillAttributeGroupValue`

## 第三步：把“旧节点修订”与“新增节点”分开处理

这一点必须单独做，不然很容易误判为“只有新增”。

本轮做法是：

- 先确认有没有删除或重命名
- 再单独找已有节点/事件的注释变化
- 再单独找已有节点/事件的参数变化

本轮结论是：

- 节点和事件集合层面：只有新增，没有删除，也没有重命名
- 但已有节点里存在两类变化：
  - 文案更新
  - 参数或返回值更新

### 本轮确认过的关键旧节点参数修订

- `changePlayerClass`
  - 新增 `existingSkillHandling`
- `addCharacterSkill`
  - 新增 `originalSlotSkillHandling`
  - 新增返回 `switchedSkillInstanceId`
- `setChatChannelSwitch`
  - 新增语音开关入参
- `queryCorrespondingGiftBoxQuantity`
  - 参数方向与说明修正
- `queryCorrespondingGiftBoxConsumption`
  - 参数方向与说明修正

### 本轮确认过的关键旧事件修订

- `whenUiControlGroupIsTriggered`
  - 触发来源说明扩展
- `whenTabIsSelected`
  - 参数说明微调

## 第四步：对“需要真值”的项目生成建图清单

定义层补完以后，不要立即假设 `.gia` 侧编码一定正确。

凡是涉及以下任一情况，都需要编辑器真值：

- 新增节点还没有现成 `node id`
- 新增节点还没有 `node_pin_records`
- 旧节点参数结构变了
- 新增枚举值
- 怀疑存在 `hole`
- 模式限制可能和资源说明不一致

本轮先后使用了两轮人工导出：

- `verify1.gia`
  用于验证旧节点参数变化
- `verify2.gia`
  用于验证新增节点与事件

建议以后固定做法：

- 给用户一份清单
- 要求按顺序创建节点，连续编号
- 每个枚举值都用明确的非默认值
- 关键出参要连出去，避免导出后 pin 看不见

本轮为此准备过的辅助文件：

- `tests/manual_verify_new_version_nodes.ts`
- `tests/manual_verify_all_new_server_nodes.ts`

## 第五步：反解 `.gia`，提取真值

反解目标不是“看起来能导入”，而是明确拿到：

- 具体 `concreteId`
- 输入 pin 顺序
- 输出 pin 顺序
- pin 类型
- 枚举值整数
- 是否存在 `hole`

本轮实践证明，直接从 protobuf 侧反解比走更高层封装更稳，尤其是在某些 pin 值为空或连接不完整时。

重点关注这些文件：

- `src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/protobuf/decode.ts`
- `src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/gia_gen/extract.ts`
- `src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/gia_gen/nodes.ts`

### 本轮验证出的关键真值

- `changePlayerClass`
  - `concreteId = 389`
  - 新枚举 pin 在 `input index = 2`
  - `2820 = 全部清理`
  - `2821 = 保留无关技能`
- `addCharacterSkill`
  - `concreteId = 395`
  - 新枚举 pin 在 `input index = 3`
  - `2810 = 销毁`
  - `2811 = 保留槽位关系`
  - `2812 = 脱离槽位关系`
  - 新增 `output index = 0(Int)` 为替换的技能实例 ID
- `setChatChannelSwitch`
  - `concreteId = 769`
  - 输入连续为 `0/1/2`
  - 原先怀疑的 hole 不存在

### 本轮新增的枚举真值

- `CharacterSkillSlot.DashSkill`
  - 编辑器中文：`冲刺技能`
  - 整数值：`3102`

### 本轮新增节点/事件真值记录

对应反解汇总文件：

- `docs/maintenance/2026-04-13-verify2-decoded.md`

这类反解文件建议以后每轮都留一份，避免同一套值重复手工确认。

## 第六步：更新编译器与第三方节点数据

拿到真值以后，再更新真正影响发射 `.gia` 的层。

本轮实际修改的关键文件：

- `src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_id.ts`
- `src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_pin_records.ts`
- `src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/enum_id.ts`
- `src/compiler/ir_to_gia_transform/mappings.ts`
- `src/compiler/ir_to_gia_transform/pins.ts`

### 更新顺序建议

1. 先补 `enum_id.ts`
2. 再补 `mappings.ts`
3. 再补 `node_id.ts`
4. 再补 `node_pin_records.ts`
5. 最后用生成脚本回编验证

### `E<0>` 的处理原则

这次维护里一个非常关键的经验是：

- 某些“语义上属于专用枚举”的参数
- 在编辑器真实导出里，pin 类型实际是 `E<0>`

也就是：

- `enumId = 0`
- `bEnum.val = 具体整数值`

因此像这些映射需要故意写成 `Generic`：

- `original_slot_skill_handling_*`
- `existing_skill_handling_*`

不要因为定义层里建了专门的 TS 枚举类，就想当然把发射层改成专门的枚举族。编译器应以编辑器真实 `.gia` 为准。

## 第七步：维护模式限制

模式限制必须作为单独步骤检查。

维护来源以 `src/definitions/node_modes.ts` 为准。

本轮明确确认：

- `setPlayerCameraToFollowEntity` 仅 `beyond`
- `resetPlayerCameraToFollowEntity` 仅 `beyond`
- 技能实例相关新增节点仅 `beyond`
- 其余这批新增节点/事件大多双模式可用

不要只看节点定义里的说明，要和：

- 资源文件文案
- 编辑器可创建情况
- 既有模式映射

三者一起核对。

## 第八步：生成导入验证脚本

每轮维护结束前都应该生成一份“给编辑器直接导入”的验证脚本。

本轮最终保留的是单文件单图版本：

- `tests/manual_verify_all_new_server_nodes.ts`

对应产物：

- `dist/tests/manual_verify_all_new_server_nodes.gia`

验证脚本的要求：

- 尽量放进一个 `.gia`
- 每个新节点至少调用一次
- 关键枚举值用非默认值
- 关键返回值接出去，确保导出后 pin 可观察
- 同时覆盖新增事件与新增执行/查询节点

## 第九步：统计节点总量与模式总量

为了和编辑器做最终列表对拍，需要统计仓库当前定义总量。

统计口径：

- 节点函数来源：
  `src/definitions/nodes.ts`
  的 `ServerExecutionFlowFunctions`
- 只算真正对外、带实现的方法
- 排除 `@gsts` 特殊方法
- 事件来源：
  `src/definitions/events.ts`
  的 `ServerEventMetadata`

### 当前统计结果

节点函数：

- 总量：`399`
- 双模式可用：`343`
- 仅经典模式：`5`
- 仅超限模式：`51`
- 经典模式可用总量：`348`
- 超限模式可用总量：`394`

事件：

- 总量：`62`
- 双模式可用：`52`
- 仅经典模式：`1`
- 仅超限模式：`9`
- 经典模式可用总量：`53`
- 超限模式可用总量：`61`

这个数字以后如果变化，优先怀疑：

- 新增了定义但没补模式映射
- 把 `@gsts` 辅助函数误算进节点
- 新增事件只补了 payload，没补 metadata

## 第十步：本轮实际产出清单

这次维护除代码改动外，还形成了几份可复用辅助资产：

- `tests/manual_verify_new_version_nodes.ts`
- `tests/manual_verify_all_new_server_nodes.ts`
- `docs/maintenance/2026-04-13-verify2-decoded.md`

未来如果要再做一轮类似维护，建议继续保留：

- 一份“人工建图清单”
- 一份“真值反解记录”
- 一份“最终导入验证脚本”

## 常见坑

### 1. 误把新增当成重命名

资源更新经常会带来文案波动，但节点集合未必真的重命名。

本轮就专门确认过：

- 无删除
- 无重命名
- 只有新增与已有项修订

### 2. 中文名被意译

维护清单和文档里最容易出现这个问题。

规则是：

- 节点中文名以 `node_definitions.json` 官方中文名为准
- 参数说明也尽量贴官方中文原文

### 3. 只改定义层，没改编译器层

这会导致：

- TS 能写
- `.gia` 发射错误
- 或者缺 id / pin 记录

定义层与发射层必须成对更新。

### 4. 忽略 `hole`

某些节点历史上存在 pin 空洞。

所以每次拿到编辑器真值，都要明确回答：

- pin 是否连续
- 哪个 index 上有 hole
- 旧 hole 是否在新版消失

### 5. 模式限制漏改

本轮就出现过：

- 技能相关新增节点已标 `beyond`
- 但两个镜头节点最初漏标

所以模式限制必须作为单独检查项存在。

### 6. 把专用语义枚举强行编码成专用枚举 pin

本轮已经证明：

- 某些枚举在 `.gia` 里实际就是 `E<0>`

因此必须以真实导出编码为准，不要只看语义名称。

## 未来复用时的执行模板

以后每轮维护都建议按下面这个模板开工：

### A. 差分与分类

- 比对 `resources/node_definitions.json`
- 列出：
  - 新增节点
  - 新增事件
  - 旧节点参数变化
  - 旧节点注释变化
  - 旧事件变化
  - 未支持体系

### B. 定义层落地

- 更新 `nodes.ts`
- 更新 `events.ts`
- 更新 `events-payload.ts`
- 更新 `server_on_overloads.d.ts`
- 更新 `entity_helpers.ts`
- 更新 `zh_aliases.ts`
- 必要时更新 `enum.ts`
- 必要时更新 `node_modes.ts`

### C. 需要真值的数据清单

- 列出需要手工建图验证的节点
- 指明每个节点：
  - 应填哪些参数
  - 哪些枚举值必须选非默认值
  - 哪些出参必须连出去

### D. 反解与编译器补齐

- 解析用户导出的 `.gia`
- 落真值记录
- 更新：
  - `enum_id.ts`
  - `mappings.ts`
  - `node_id.ts`
  - `node_pin_records.ts`

### E. 最终验证

- `npm run build`
- 生成导入验证脚本
- 导出单文件 `.gia`
- 导入编辑器
- 再导出回传做最终对拍

## 建议保留的交付物

每次例行维护结束后，最好都留下：

- 一份维护手册或记录文档
- 一份真值反解记录
- 一份人工验证脚本
- 一份模式统计结果

这样下一次更新时，可以直接复用而不是重新探索流程。

## 结论

这类节点版本维护，本质上不是“改几个定义文件”，而是一个固定流程：

- 先界定范围
- 再补定义
- 再拿编辑器真值
- 再补编译器
- 最后用模式统计和导入验证收口

只要以后继续沿用这份流程，新增节点、旧节点修订、模式限制、枚举真值、`E<0>` 编码、`hole` 检查这些高风险点就都不会漏。
