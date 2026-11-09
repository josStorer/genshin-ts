import type { Rule } from 'eslint'

import { formatMessage } from '../utils/messages.js'
import { readBaseOptions } from '../utils/options.js'
import { buildServerScopeIndex } from '../utils/scope.js'

type Options = {
  allowElementAccessAssign?: boolean
  allowAssignmentExpression?: boolean
  allowedOperators?: string[]
  lang?: 'zh' | 'en' | 'both'
  scope?: 'server' | 'client' | 'nodegraph' | 'all'
  includeNestedFunctions?: boolean
}

const DEFAULTS: Required<Options> = {
  allowElementAccessAssign: true,
  allowAssignmentExpression: false,
  allowedOperators: ['=', '+=', '-=', '*=', '/=', '%='],
  lang: 'both',
  scope: 'nodegraph',
  includeNestedFunctions: true
}

function hasNestedAssignment(node: any): boolean {
  if (!node) return false
  if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') return true
  let found = false
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue
    const value = (node as any)[key]
    if (found) break
    if (Array.isArray(value)) {
      for (const child of value) {
        if (child && hasNestedAssignment(child)) {
          found = true
          break
        }
      }
    } else if (value && typeof value.type === 'string') {
      if (hasNestedAssignment(value)) found = true
    }
  }
  return found
}

function isAllowedContext(node: any): boolean {
  if (node.parent?.type === 'ExpressionStatement') return true
  if (
    node.parent?.type === 'ForStatement' &&
    (node.parent.init === node || node.parent.update === node)
  ) {
    return true
  }
  return false
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          allowElementAccessAssign: { type: 'boolean' },
          allowAssignmentExpression: { type: 'boolean' },
          allowedOperators: { type: 'array', items: { type: 'string' } },
          lang: { enum: ['zh', 'en', 'both'] },
          scope: { enum: ['server', 'client', 'nodegraph', 'all'] },
          includeNestedFunctions: { type: 'boolean' }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const raw = (context.options[0] ?? {}) as Options
    const options = readBaseOptions(raw, DEFAULTS)
    const scopeIndex = buildServerScopeIndex(context)
    const allowedOps = new Set(options.allowedOperators)

    return {
      VariableDeclarator(node) {
        if (node.id.type !== 'ObjectPattern' && node.id.type !== 'ArrayPattern') return
        if (!scopeIndex.isInServerScope(node, options)) return
        context.report({
          node: node.id,
          message: formatMessage(
            options.lang,
            '节点图中不支持解构声明。请先用普通变量保存结果，再通过属性或索引读取需要的值',
            'Destructuring declarations are not supported in node graphs. Store the result in a variable, then access its properties or indices'
          )
        })
      },
      AssignmentExpression(node) {
        if (!scopeIndex.isInServerScope(node, options)) return
        if (!allowedOps.has(node.operator)) {
          context.report({
            node,
            message: formatMessage(
              options.lang,
              '不支持的赋值运算符',
              'Unsupported assignment operator'
            )
          })
          return
        }

        const leftOk =
          node.left?.type === 'Identifier' ||
          (options.allowElementAccessAssign &&
            node.left?.type === 'MemberExpression' &&
            node.left.computed === true)
        if (!leftOk) {
          context.report({
            node: node.left,
            message: formatMessage(
              options.lang,
              '仅支持对标识符或列表元素赋值',
              'Only assignment to identifiers or list elements is supported'
            )
          })
          return
        }

        if (!options.allowAssignmentExpression && !isAllowedContext(node)) {
          context.report({
            node,
            message: formatMessage(
              options.lang,
              '赋值仅允许作为独立语句',
              'Assignment is only supported as a standalone statement'
            )
          })
        }

        if (hasNestedAssignment(node.right)) {
          context.report({
            node,
            message: formatMessage(
              options.lang,
              '不支持嵌套赋值',
              'Nested assignment is not supported'
            )
          })
        }
      }
    }
  }
}

export default rule
