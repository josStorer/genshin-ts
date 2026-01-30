# 注入与地图

## 注入配置
`gsts.config.ts` 中配置 `inject` 字段：
- `gameRegion` / `playerId`
- `mapId` / `nodeGraphId`
- `reinjectOnMapChange`（dev 模式下地图保存自动重注入，默认启用）
- `extractResources`（自动提取自定义资源，默认启用）
- `resourcesPath`（自定义资源提取路径，默认 `src/resources/prefabs.ts`）

## 安全检查
- 目标节点图必须存在，且为空或名称以 `_GSTS` 开头。
- 可设置 `inject.skipSafeCheck = true` 跳过检查（谨慎）。

## 生效方式
- 注入后必须重新加载地图。
- 建议准备一个“临时空地图”用于快速切换触发重载。
- 注入后如未重新加载即保存地图，注入内容会被覆盖；dev 模式会自动重注入（默认开启），否则需手动再注入。
- dev 模式下会检测地图文件保存并自动重注入，可用 `inject.reinjectOnMapChange = false` 关闭。
