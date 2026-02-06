import type { Rule } from 'eslint'

import { getMemberName } from '../utils/ast.js'
import { CALLBACK_METHODS } from '../utils/list_methods.js'
import { inferListTypeFromExpression } from '../utils/list.js'
import { formatMessage } from '../utils/messages.js'
import { readBaseOptions } from '../utils/options.js'
import { getParserServices } from '../utils/parser.js'
import { buildServerScopeIndex } from '../utils/scope.js'

type Options = {
  enforceInline?: boolean
  enforceParamCount?: boolean
  lang?: 'zh' | 'en' | 'both'
  scope?: 'server' | 'all'
  includeNestedFunctions?: boolean
}

const DEFAULTS: Required<Options> = {
  enforceInline: true,
  enforceParamCount: true,
  lang: 'both',
  scope: 'server',
  includeNestedFunctions: true
}

const PARAM_COUNT: Record<string, number> = {
  forEach: 1,
  map: 1,
  filter: 1,
  reduce: 2,
  some: 1,
  every: 1,
  find: 1,
  findIndex: 1
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          enforceInline: { type: 'boolean' },
          enforceParamCount: { type: 'boolean' },
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

    const report = (node: any) => {
      context.report({
        node,
        message: formatMessage(
          options.lang,
          '列表回调签名不符合要求',
          'Invalid list callback signature'
        )
      })
    }

    return {
      CallExpression(node) {
        if (!scopeIndex.isInServerScope(node, options)) return
        if (!node.callee || node.callee.type !== 'MemberExpression') return
        const method = getMemberName(node.callee)
        if (!method || !CALLBACK_METHODS.has(method)) return
        const tsTarget = services.esTreeNodeToTSNodeMap.get(node.callee.object)
        if (!tsTarget) return
        const listType = inferListTypeFromExpression(checker, tsTarget)
        if (!listType) return
        const cb = node.arguments[0]
        if (!cb) return
        if (
          options.enforceInline &&
          cb.type !== 'FunctionExpression' &&
          cb.type !== 'ArrowFunctionExpression'
        ) {
          report(cb)
          return
        }
        if (cb.type !== 'FunctionExpression' && cb.type !== 'ArrowFunctionExpression') return
        const expectedCount = PARAM_COUNT[method]
        if (
          options.enforceParamCount &&
          expectedCount !== undefined &&
          cb.params.length !== expectedCount &&
          !(method === 'forEach' && cb.params.length === 0)
        ) {
          report(cb)
          return
        }
        const seen = new Set<string>()
        for (const param of cb.params) {
          if (param.type === 'RestElement' || param.type === 'AssignmentPattern') {
            report(param)
            return
          }
          if (param.type !== 'Identifier') {
            report(param)
            return
          }
          if (param.name === 'this') {
            report(param)
            return
          }
          if (seen.has(param.name)) {
            report(param)
            return
          }
          seen.add(param.name)
        }
      }
    }
  }
}

export default rule
