# 编译期问题

- `gstsServer` return 规则错误
- 使用了不支持的 API（JSON/Object/Promise）
- 条件表达式不是 boolean
- 一张图的节点图变量超过 100 个（编辑器上限，含 gsts 为定时器等自动生成的 `__gsts` 变量）
- 数据连线跨越了事件处理函数，见[作用域划分](../writing/scope.md)
- 合并到同一张图的多个文件共用了一个启动定时器的函数，见[多入口与合并](../events/merge.md)
- 警告：暴露的变量含有实体，编辑器里无法填写，请改用 GUID，见 [g.server 参数与入口](../events/gserver.md)
