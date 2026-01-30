export type GstsFeatureFlags = {
  whileCondition: boolean
  doWhile: boolean
  continue: boolean
  switch: boolean
  destructuring: boolean
  ternary: boolean
  nullishCoalesce: boolean
}

export type GstsOptimizeOptions = {
  /**
   * [ZH] 预编译纯字面量表达式，避免运行期节点计算, 默认启用。
   *
   * [EN] Precompute literal-only expressions to skip runtime nodes, enabled by default.
   */
  precompileExpression?: boolean
  /**
   * [ZH] 移除未使用的节点（未接入事件的 exec、未被有效 exec 使用的 data），默认启用。
   *
   * [EN] Remove unused nodes (exec not connected to events, data not used by effective exec), enabled by default.
   */
  removeUnusedNodes?: boolean
  /**
   * [ZH] 定时器名称池大小（用于 setTimeout/setInterval）, 由于节点图系统的switch case限制上限10个, 因此池不建议大于10, 否则闭包捕获功能将失效
   * 如果确定需要超过10, 请不要使用闭包捕获, 并开启timerDispatchAggregate优化。
   *
   * - setTimeout 默认 5
   * - setInterval 默认 1
   *
   * [EN] Timer name pool size (for setTimeout/setInterval). Because the node graph system has a limit of 10 switch cases, the pool is not recommended to be greater than 10, otherwise the closure capture function will fail.
   * If you need to exceed 10, please do not use closure capture, and enable timerDispatchAggregate optimization.
   *
   * - setTimeout default: 5
   * - setInterval default: 1
   */
  timerPool?: {
    setTimeout?: number
    setInterval?: number
  }
  /**
   * [ZH] 定时器事件分发聚合：合并多个 whenTimerIsTriggered 的纯分发逻辑为单一 switch。
   *
   * - 默认启用
   * - 仅在 IR -> GIA 阶段生效
   * - 可能导致节点图更难读, debug时按需禁用此优化
   *
   * [EN] Aggregate timer dispatch handlers into a single switch on timerName.
   *
   * - Enabled by default
   * - Applies only during IR -> GIA
   * - May make node graph harder to read, disable this optimization when debugging
   */
  timerDispatchAggregate?: boolean
}

// loopMax应用场景通常会有另外的控制条件, 一般只有需要更长的情况, 因此不列入优化项
export type GstsTransformOptions = {
  /**
   * [ZH] for(;;) / while(true) 等“无限循环”的最大迭代次数（用于 finiteLoop(0, loopMax)）。
   *
   * - 默认：999（即最多循环 1000 次）
   * - 用途：避免节点图在运行期达到性能限制
   *
   * [EN] Max iteration count for “infinite loops” like for(;;) / while(true)
   * (used by finiteLoop(0, loopMax)).
   *
   * - Default: 999 (i.e. up to 1000 iterations)
   * - Purpose: Avoids node graph performance issues at runtime caused by infinite loops
   */
  loopMax?: number
  /**
   * [ZH] 功能特性开关：默认只开“安全且高频”的部分。
   *
   * [EN] Feature flags. By default only a safe & commonly-used part is enabled.
   */
  features?: Partial<GstsFeatureFlags>
  /**
   * [ZH] 优化配置。
   *
   * [EN] Optimization options.
   */
  optimize?: Partial<GstsOptimizeOptions>
}

export type GstsLang = 'auto' | 'zh-CN' | 'en-US'

export type GstsGameRegion = 'China' | 'Global'

export type GstsInjectConfig = {
  /**
   * [ZH] 游戏区域：
   *
   * - China: `%LocalAppData%\\..\\LocalLow\\miHoYo\\原神\\BeyondLocal`
   * - Global: `%LocalAppData%\\..\\LocalLow\\miHoYo\\Genshin Impact\\BeyondLocal`
   *
   * 若只检测到其中一个目录，可省略；若两个都存在，会要求你填写。
   *
   * [EN] Game region.
   *
   * - China: `%LocalAppData%\\..\\LocalLow\\miHoYo\\原神\\BeyondLocal`
   * - Global: `%LocalAppData%\\..\\LocalLow\\miHoYo\\Genshin Impact\\BeyondLocal`
   *
   * If only one folder exists on this PC, it can be omitted.
   */
  gameRegion?: GstsGameRegion
  /**
   * [ZH] 玩家 ID（BeyondLocal 下的数字目录名）。
   *
   * 若该目录下只有一个纯数字目录，可省略。
   *
   * [EN] Player ID (numeric folder name under BeyondLocal).
   *
   * If only one numeric folder exists, it can be omitted.
   */
  playerId?: number
  /**
   * [ZH] 地图 ID（例如 `1073741849`），最终注入目标为 `<mapId>.gil`。
   *
   * 提示：可用 `gsts maps` 列出近期编辑的地图文件，辅助填写。
   *
   * [EN] Map ID (e.g. `1073741849`), injection target is `<mapId>.gil`.
   *
   * Tip: run `gsts maps` to list recently edited map files and help you pick the correct mapId.
   */
  mapId?: number
  /**
   * [ZH] 目标节点图 ID（用于替换地图里的哪个节点图）。
   *
   * - 若不填：会尝试从 `.gia` 内的 graph id 推断。
   * - 找不到会报错（需先在编辑器里新建并保存对应节点图）。
   * - 仅对 `gsts <file>` 单文件模式生效（批量模式会忽略该字段）。
   *
   * [EN] Target NodeGraph id.
   *
   * - If omitted, inferred from `.gia` when possible.
   * - If not found, will throw an error (need to create and save the corresponding node graph first in the editor).
   * - Only takes effect in `gsts <file>` (single-file) mode. Batch mode ignores this field.
   */
  nodeGraphId?: number
  /**
   * [ZH] 跳过注入安全检查（允许替换非空图、允许名称不是 `_GSTS*`）。
   *
   * [EN] Skip safety checks during injection (allow replacing non-empty graph, allow name not starting with `_GSTS*`).
   */
  skipSafeCheck?: boolean
  /**
   * [ZH] dev 模式下检测地图文件被外部保存时，自动重新注入已生成的 GIA。
   *
   * - 默认启用
   *
   * [EN] In dev mode, re-inject generated GIA when the map file is saved externally.
   *
   * - Enabled by default
   */
  reinjectOnMapChange?: boolean
  /**
   * [ZH] 自动提取自定义资源（Custom Prefab）到文件。
   *
   * - 默认启用
   *
   * [EN] Auto extract custom resources (Custom Prefab) to file.
   *
   * - Enabled by default
   */
  extractResources?: boolean
  /**
   * [ZH] 自定义资源提取路径（相对 config 所在目录）。
   *
   * - 默认：`src/resources/prefabs.ts`
   *
   * [EN] Custom resources output path (relative to the config file).
   *
   * - Default: `src/resources/prefabs.ts`
   */
  resourcesPath?: string
}

export type GstsConfig = {
  /**
   * [ZH] 源码根目录（entries 相对该目录解析）
   *
   * [EN] Source root (entries are resolved relative to this directory)
   */
  compileRoot: string
  /**
   * [ZH] 入口（相对 compileRoot）。
   *
   * - 支持 glob：如 `src/**` + `/*.ts`
   * - 目录仍可写成 `src`，会自动展开成 `src/**` + `/*.ts`
   * - 支持 `!` 反选（fast-glob 语义），用于排除匹配
   *
   * [EN] Entries (relative to compileRoot).
   *
   * - Supports glob patterns
   * - A directory like `src` will be expanded to `src/**` + `/*.ts`
   * - Supports negation with `!` (fast-glob semantics)
   */
  entries: string[]
  /**
   * [ZH] 输出根目录（保持相对路径结构，文件名追加 .gs.ts）
   *
   * [EN] Output root (keeps relative structure, appends .gs.ts)
   */
  outDir: string
  options?: GstsTransformOptions
  /**
   * [ZH] CLI 语言：默认 `auto`（自动检测系统语言）。
   *
   * [EN] CLI language: default `auto` (detect from system language).
   */
  lang?: GstsLang
  /**
   * [ZH] 注入设置：配置后将尝试把生成的 `.gia` 注入到对应的 `.gil` 地图中。
   *
   * 提示：可用 `gsts maps` 找到最近编辑过的地图文件，辅助填写 mapId。
   *
   * [EN] Injection settings. If provided, `.gia` will be injected into the target `.gil` map.
   *
   * Tip: use `gsts maps` to locate recently edited map files and fill in mapId.
   */
  inject?: GstsInjectConfig
}
