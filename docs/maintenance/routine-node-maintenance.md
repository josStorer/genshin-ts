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

### 不要全量覆盖定义详情文件

`resources/node_definitions.json` 可以作为差分输入，但不应该直接全量生成覆盖以下详情文件：

- `src/definitions/nodes.ts`
- `src/definitions/events.ts`
- `src/definitions/events-payload.ts`
- `src/definitions/entity_helpers.ts`
- `src/definitions/zh_aliases.ts`

原因是资源文件的节点顺序、中文条目顺序、局部文案和类型粒度可能发生漂移。全量覆盖会造成：

- 原本存在的节点方法被删除或改名
- 事件中文注释错配到相邻事件
- `CharacterEntity` / `PlayerEntity` 等精细类型被退化成 `EntityValue`
- `zh_aliases.ts` 中稳定的中英文映射被清空或洗牌
- diff 被大规模重排淹没，无法审查真实维护点

推荐做法是：

1. 先用脚本只生成差分报告，不直接写入详情文件。
2. 将变更分类为：新增节点、疑似重命名、参数变化、返回值变化、仅注释变化。
3. 对新增节点/事件，从资源文件生成候选代码块，再手工插入到现有文件的对应位置。
4. 对已有节点/事件，只按字段更新必要的签名或注释，保留原方法名、顺序和精细类型。
5. 对中文注释使用 `zh_aliases.ts` 的既有映射校正，不能依赖中英文资源数组下标对齐。
6. 每次小块修改后运行无产物检查，例如 `npx tsc -p tsconfig.json --noEmit`。

除非本轮目标就是重建整套定义层，否则不要把 `npm run gen` 的输出直接作为最终改动提交。

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
- 对已有图导入验证，优先使用 `.on(...).on(...)` 链式声明，把不同风险点拆到不同事件里；这样只需注入一个图，导出后也便于按事件定位节点。

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

### 静态不一致报告的处理规则

`scripts/check-node-def-consistency.ts` 是发现风险的入口，但它只能做静态对账，不能直接判断编辑器里的 hidden pin 是否真实存在。

处理原则：

1. `nodes.ts` 的 `registerNode(args)` 数量和 `node_pin_records.ts` 的 `inputs` 数量不一致时，先列为风险，不要立即改 API。
2. 生成手工验证脚本，导入编辑器后再导出 `.gia`。
3. 反解导出的 `.gia`，确认实际 input pin index。
4. 如果编辑器导出本身跳过某个 index，例如 `0/1/2/4`，说明这是 editor-truth hole，可把节点加入 consistency checker allowlist，并在文档里记录导出文件路径和实际 pin index。
5. 如果编辑器导出存在该 pin 且有有效值，才考虑补 API 参数或编译器发射逻辑。

本轮 `2026-06-01-verify1.gia` 证明：

- `set_custom_variable`: 导出 input 为 `0/1/2/4`，pin `3` 是 hole。
- `activate_disable_pathfinding_obstacle`: 导出 input 为 `1/2/3`，pin `0` 是 leading hole。
- `activate_disable_pathfinding_obstacle_feature`: 导出 input 为 `0/2`，pin `1` 是 hole。
- `remove_unit_status`: 导出 input 为 `0/1/2/4`，pin `3` 是 hole。
- `exponentiation`: 导出 input 为 `0/1`，thirdparty 记录里的额外 enum pin 不由编辑器导出。

`data_type_conversion_*` 这类动态 node type 不应和 hidden pin 混为一谈。它属于 checker 展开策略问题：本地实现按目标类型动态生成 concrete node type，静态脚本无法枚举所有变体时可以保留单独的 `dynamic_node_type` finding。

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
- 对有返回值的节点，不能只调用方法；必须把返回值保存并连到消费节点，例如 `dataTypeConversion -> printString`，否则输出 pin 没有被测试。
- classic-only 节点和事件要单独生成 classic 图或 classic 事件文件；不要把 classic-only event 混进 beyond 默认事件覆盖。

### 生成测试的维护边界

自动生成测试可以帮助覆盖新增节点，但不应该把全量生成产物作为例行更新的主体 diff。

本轮形成的规则：

1. `scripts/generate-node-gia-tests.ts` 可以增强生成能力，例如 classic 覆盖、entity 参数推断、返回值消费。
2. `tests/generated` 只提交与本轮新增/修正直接相关的最小变化。
3. 不要因为重跑生成器而提交大量 `group_*` 重排、报告文件或无关快照。
4. 对新增节点补 literal 与 wire 两种调用；对有返回值节点同时补输出 pin 消费。
5. 增加轻量覆盖检查脚本，例如 `scripts/check-node-gia-test-coverage.mjs`，用来防止遗漏 classic 图、输出 pin 消费、错误 entity 参数等问题。
6. generated 临时报表，例如 `_node_def_consistency.json`、`_node_def_consistency.md`，一般属于检查产物，不应作为维护改动提交，除非本轮明确要保存报告。

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
- 不能只看 `node_pin_records.ts` 的 `inputs.length` 推断缺参；必须以编辑器导出 `.gia` 的实际 pin index 为准。

### 5. 模式限制漏改

本轮就出现过：

- 技能相关新增节点已标 `beyond`
- 但两个镜头节点最初漏标

所以模式限制必须作为单独检查项存在。

### 6. 把专用语义枚举强行编码成专用枚举 pin

本轮已经证明：

- 某些枚举在 `.gia` 里实际就是 `E<0>`

因此必须以真实导出编码为准，不要只看语义名称。

### 7. 生成测试只调用查询节点但不消费输出

查询节点、数学节点、转换节点等有输出 pin 的节点，如果生成测试只是：

```ts
f.querySomething(...)
```

那么只能证明方法可以调用，不能证明输出 pin 可以连线。

正确做法是：

```ts
const value = f.querySomething(...)
const text = f.dataTypeConversion(value, 'str')
f.printString(text)
```

对象、列表、字典返回值也要接到合适的消费节点，例如字段转换、`getListLength`、`queryDictionarySLength`。

### 8. 直接跑 `npm test` 会产生清理和生成副作用

`npm test` 当前会触发 `pretest` 清理、build、生成测试和 `.gia` 编译，容易扩大本地工作区改动。

例行维护中如果只是做类型或静态校验，优先使用无产物或低副作用命令：

- `npx tsc -p tsconfig.json --noEmit`
- `git diff --check`
- `node scripts/check-node-gia-test-coverage.mjs`
- `npx tsx scripts/check-node-def-consistency.ts`

最后一个命令会写 `tests/generated/_node_def_consistency.*` 报告；运行后如果只是临时核验，应删除这些产物或明确说明它们不进入提交。

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

推荐先运行只读差分报告：

```bash
node scripts/analyze-node-definitions-diff.mjs --full --stdout
```

这个命令只读取 `resources/node_definitions.json` 和当前定义文件，输出 Markdown 报告，不写入 `src/definitions/*`。报告中的重点分组是：

- `Rename Candidates`：疑似旧节点改名，必须人工确认后再决定是否保留旧 API、增加别名，或迁移到新 API。
- `New Node Candidates`：资源中存在但当前仓库还没有的节点，适合逐一手工补到 `nodes.ts`。
- `Removed Node Candidates`：当前仓库存在但资源中找不到的节点，通常不能直接删除，需要先确认是否是改名或资源遗漏。
- `Signature Changes`：同名节点/事件的参数或返回值差异，其中手写特殊节点可能需要按仓库现有实现判断。

本轮确认策略：

- 疑似改名节点保留旧 TypeScript API 名，不批量新增别名；只在 `SPECIAL_NODE_MAPPINGS` 和 `scripts/testgen/vendor_ids.ts` 中维护新资源名到既有 vendor 名的映射。
- `whenTheActiveCharacterChanges` 在编辑器中确认仍有参数，资源差异视为文档/解析漂移，保留现有事件 payload。

如果需要落地报告文件，可以去掉 `--stdout`，脚本会写入：

- `resources/node_definitions_diff_full.json`
- `resources/node_definitions_diff_full.md`

这些文件是维护辅助产物，不是定义层源码。

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

- `npx tsc -p tsconfig.json --noEmit`
- `git diff --check`
- 运行必要的轻量覆盖脚本
- 如确实需要完整产物验证，再运行 `npm run build` 或更高层命令
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
