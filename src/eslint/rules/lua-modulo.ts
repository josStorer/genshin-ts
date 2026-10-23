import type { Rule } from 'eslint'

import { t } from '../../i18n/index.js'

/** 只作为 Lua ESLint 提醒，不进入编译器或 TS 插件的诊断。 */
const rule: Rule.RuleModule = {
  meta: { type: 'suggestion', schema: [] },
  create(context) {
    return {
      BinaryExpression(node) {
        if (node.operator === '%') context.report({ node, message: t('lua_modulo') })
      },
      AssignmentExpression(node) {
        if (node.operator === '%=') context.report({ node, message: t('lua_modulo') })
      }
    }
  }
}
export default rule
