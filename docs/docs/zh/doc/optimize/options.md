# 优化选项

- `precompileExpression`
- `removeUnusedNodes`
- `timerPool`
- `timerDispatchAggregate`

可在 `gsts.config.ts` 中按需关闭。

同时启用 `precompileExpression` 和 `removeUnusedNodes` 时，服务端图还会绕过条件为
布尔字面量的 `double_branch` 节点，并删除不可达执行节点及其专用数据节点。运行时条件
保持不变。两个回调仍会在构图期执行，此优化仅改变生成的图，不改变 JavaScript 构图期
的副作用。调试时关闭任一选项即可保留原始分支结构。客户端图不受此项优化影响。

使用 `gsts analyze dist/example.json` 检查生成的 IR。报告包含节点类型和连线数量，
并列出分支、循环、局部变量、定时器、列表拼装、集合局部变量写入（可能涉及快照）
及共用数据输出的节点 ID。
这些是静态检查线索，不是实测执行次数或耗时。数据输出被多处共用，不保证游戏只计算
一次；后续 IR 到 GIA 的转换也可能改变最终节点数量。

自动布局会先预留 IR 中的显式 `position`，再排列其他节点。执行、数据和游离节点
共用保守的占位区域，输入参数越多，预留高度越大。相同 IR 的布局结果稳定。
占位区域是估算值，并非编辑器实测尺寸；显式坐标优先，包括手动坐标本身重叠的情况。
