# 注入说明

- 目标图必须存在且符合安全规则。
- 注入后需要重载地图。
- 可设置 `inject.skipSafeCheck` 关闭安全检查。

## 信号定义提取

配置 `inject` 后，编译时会从目标地图中提取信号定义，默认写入 `src/resources/signals.ts`。该文件导出的 `Signal` 可用于 `sendSignal(Signal.xxx, ...)` 和 `onSignal(Signal.xxx, ...)` 的参数类型提示。

可通过 `inject.extractSignals: false` 关闭提取，或用 `inject.signalsPath` 修改输出路径。
