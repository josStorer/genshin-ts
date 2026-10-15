import { t } from '../i18n/index.js'

/** 两种编译目标用同一种格式显示最终结果。 */
export function formatBuildSummary(
  target: 'graph' | 'lua',
  result: { compilation: string; injection: string }
) {
  return t('build_summary', {
    target: target === 'graph' ? t('build_graphTarget') : 'TS→Lua',
    ...result
  })
}
