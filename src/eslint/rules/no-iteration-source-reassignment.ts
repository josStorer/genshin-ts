import type { Rule } from 'eslint'
import ts from 'typescript'

import {
  ITERATING_LIST_METHODS,
  unwrapListSource
} from '../../compiler/ts_to_gs_transform/list_utils.js'
import { formatMessage } from '../utils/messages.js'
import { readBaseOptions } from '../utils/options.js'
import { requireParserServices } from '../utils/parser.js'
import { buildNodeGraphScopeIndex } from '../utils/scope.js'

type Options = {
  lang?: 'zh' | 'en' | 'both'
  scope?: 'server' | 'client' | 'nodegraph' | 'all'
  includeNestedFunctions?: boolean
}

const DEFAULTS: Required<Options> = {
  lang: 'both',
  scope: 'nodegraph',
  includeNestedFunctions: true
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          lang: { enum: ['zh', 'en', 'both'] },
          scope: { enum: ['server', 'client', 'nodegraph', 'all'] },
          includeNestedFunctions: { type: 'boolean' }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const options = readBaseOptions((context.options[0] ?? {}) as Options, DEFAULTS)
    const services = requireParserServices(context)
    const checker = services.program.getTypeChecker()
    const scopeIndex = buildNodeGraphScopeIndex(context)

    return {
      AssignmentExpression(node) {
        if (!scopeIndex.isInNodeGraphScope(node, options)) return
        const assignment = services.esTreeNodeToTSNodeMap.get(node)
        if (!assignment || !ts.isBinaryExpression(assignment)) return
        const target = unwrapListSource(assignment.left)
        if (!ts.isIdentifier(target)) return
        const symbol = checker.getSymbolAtLocation(target)
        if (!symbol) return

        for (let current: ts.Node = assignment; current.parent; current = current.parent) {
          const parent = current.parent
          let source: ts.Expression | undefined
          if (ts.isForOfStatement(parent) && current === parent.statement) {
            source = parent.expression
          } else if (ts.isFunctionLike(current)) {
            if (
              ts.isCallExpression(parent) &&
              ts.isPropertyAccessExpression(parent.expression) &&
              ITERATING_LIST_METHODS.has(parent.expression.name.text) &&
              parent.arguments[0] === current
            ) {
              source = parent.expression.expression
            } else {
              break
            }
          }
          if (!source) continue
          source = unwrapListSource(source)
          if (!ts.isIdentifier(source) || checker.getSymbolAtLocation(source) !== symbol) continue
          context.report({
            node,
            message: formatMessage(
              options.lang,
              `遍历“${target.text}”时不要给它重新赋值为另一份列表；节点图不能保证继续遍历原列表。请在循环结束后赋值。修改元素或 push/pop 不受此限制。`,
              `Do not reassign “${target.text}” to another list while iterating it; the node graph cannot guarantee that iteration stays on the original list. Assign after the loop. Element updates and push/pop are allowed.`
            )
          })
          return
        }
      }
    }
  }
}

export default rule
