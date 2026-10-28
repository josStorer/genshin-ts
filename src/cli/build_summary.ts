import { t } from '../i18n/index.js'
import { createUi } from './ui.js'

const ui = createUi()

/** 这一轮节点图的结果；ran 为 false 表示这一轮没有编译节点图（没有入口或没有改动）。 */
export interface GraphOutcome {
  ran: boolean
  ok: boolean
  gia: number
  injection?: { ok: number; skipped: number; fail: number }
}

/** 这一轮 Lua 的结果；ran 为 false 表示没有编译 Lua。 */
export interface LuaOutcome {
  ran: boolean
  ok: boolean
  files: number
  /** 注入时覆盖更新到游戏目录的文件数；没有注入时为 undefined。 */
  overwritten?: number
  /** 注入时从游戏目录删除的旧文件数（例如删掉了入口）。 */
  removed?: number
  /** 注入时因为不是 gsts 生成而跳过的同名文件数。 */
  skipped?: number
  compileFailed: boolean
}

export const idleGraph = (): GraphOutcome => ({ ran: false, ok: true, gia: 0 })

/**
 * 节点图和 Lua 都参与时，在最后用一行说明整体结果；只有一边时各自的输出已经足够，
 * 纯节点图项目的输出因此和以前一样。只有 Lua 且编译失败时补一行失败说明。
 */
export function printBuildSummary(graph: GraphOutcome, lua: LuaOutcome | undefined) {
  if (!lua?.ran) return
  if (!graph.ran) {
    if (lua.compileFailed) ui.error(t('lua_compileFailed'))
    return
  }
  const injection = graph.injection
  const graphText = !injection
    ? graph.ok
      ? t('build_graphGia', { count: graph.gia })
      : t('build_graphFailed')
    : injection.skipped || injection.fail
      ? t('build_graphInjectPartial', injection)
      : t('build_graphInjected', { count: injection.ok })
  const luaText = !lua.ok
    ? lua.compileFailed
      ? t('build_luaFailed')
      : t('build_luaWriteFailed')
    : lua.overwritten === undefined
      ? t('build_luaFiles', { count: lua.files })
      : lua.skipped
        ? t('build_luaInjectPartial', { written: lua.overwritten, skipped: lua.skipped })
        : lua.overwritten && lua.removed
          ? t('build_luaOverwrittenRemoved', { count: lua.overwritten, removed: lua.removed })
          : lua.overwritten
            ? t('build_luaOverwritten', { count: lua.overwritten })
            : lua.removed
              ? t('build_luaRemoved', { count: lua.removed })
              : t('build_luaUnchanged')
  if (graph.ok && lua.ok) ui.ok(t('build_allDone', { graph: graphText, lua: luaText }))
  else ui.error(t('build_notAllDone', { graph: graphText, lua: luaText }))
}
