import type { Rule } from 'eslint'
import ts from 'typescript'

import {
  inferListTypeFromArrayLiteral,
  inferListTypeFromExpression,
  isArrayLikeType
} from '../utils/list.js'
import { formatMessage } from '../utils/messages.js'
import { readBaseOptions } from '../utils/options.js'
import { getParserServices } from '../utils/parser.js'
import { buildServerScopeIndex } from '../utils/scope.js'

type Options = {
  lang?: 'zh' | 'en' | 'both'
  scope?: 'server' | 'all'
  includeNestedFunctions?: boolean
}

const DEFAULTS: Required<Options> = {
  lang: 'both',
  scope: 'server',
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
          scope: { enum: ['server', 'all'] },
          includeNestedFunctions: { type: 'boolean' }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const raw = (context.options[0] ?? {}) as Options
    const options = readBaseOptions(raw, DEFAULTS)
    const services = getParserServices(context)
    if (!services) return {}
    const checker = services.program.getTypeChecker()
    const scopeIndex = buildServerScopeIndex(context)

    return {
      SpreadElement(node) {
        if (!scopeIndex.isInServerScope(node, options)) return
        if (node.parent?.type !== 'ArrayExpression') return
        const tsNode = services.esTreeNodeToTSNodeMap.get(node.argument)
        if (!tsNode) return
        const type = checker.getTypeAtLocation(tsNode)
        if (!isArrayLikeType(checker, type)) return
        const listType = inferListTypeFromExpression(checker, tsNode)
        if (listType) return
        const tsParent = services.esTreeNodeToTSNodeMap.get(node.parent)
        if (tsParent && ts.isArrayLiteralExpression(tsParent)) {
          const inferred = inferListTypeFromArrayLiteral(checker, tsParent)
          if (inferred) return
        }
        context.report({
          node,
          message: formatMessage(
            options.lang,
            '无法推断列表类型, 请补充类型注解',
            'Cannot infer list type; add a type annotation'
          )
        })
      }
    }
  }
}

export default rule
