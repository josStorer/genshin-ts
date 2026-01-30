import type { Rule } from 'eslint'
import ts from 'typescript'

import { inferConcreteTypeFromType, inferListTypeFromType } from '../utils/list.js'
import { formatMessage } from '../utils/messages.js'
import { readBaseOptions } from '../utils/options.js'
import { getParserServices } from '../utils/parser.js'
import { buildServerScopeIndex } from '../utils/scope.js'

type Options = {
  allowUnknown?: boolean
  lang?: 'zh' | 'en' | 'both'
  scope?: 'server' | 'all'
  includeNestedFunctions?: boolean
}

const DEFAULTS: Required<Options> = {
  allowUnknown: false,
  lang: 'both',
  scope: 'server',
  includeNestedFunctions: true
}

type LocalVarType = string

function inferLocalVarType(
  checker: ts.TypeChecker,
  type: ts.Type,
  location?: ts.Node
): LocalVarType | null {
  if (type.flags & ts.TypeFlags.Union) {
    const u = type as ts.UnionType
    let base: LocalVarType | null = null
    for (const t of u.types) {
      const next = inferLocalVarType(checker, t, location)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }
  if (type.flags & ts.TypeFlags.Intersection) {
    const i = type as ts.IntersectionType
    let base: LocalVarType | null = null
    for (const t of i.types) {
      const next = inferLocalVarType(checker, t, location)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }

  if ((type.flags & ts.TypeFlags.BigIntLike) !== 0) return 'int'
  if ((type.flags & ts.TypeFlags.NumberLike) !== 0) return 'float'
  if ((type.flags & ts.TypeFlags.BooleanLike) !== 0) return 'bool'
  if ((type.flags & ts.TypeFlags.StringLike) !== 0) return 'str'

  const listType = inferListTypeFromType(checker, type, location)
  if (listType) return `${listType}_list`
  const scalar = inferConcreteTypeFromType(checker, type, location)
  if (scalar) return scalar
  return null
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          allowUnknown: { type: 'boolean' },
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
      ConditionalExpression(node) {
        if (!scopeIndex.isInServerScope(node, options)) return
        const tsTrue = services.esTreeNodeToTSNodeMap.get(node.consequent)
        const tsFalse = services.esTreeNodeToTSNodeMap.get(node.alternate)
        if (!tsTrue || !tsFalse) return
        const tTrue = inferLocalVarType(checker, checker.getTypeAtLocation(tsTrue), tsTrue)
        const tFalse = inferLocalVarType(checker, checker.getTypeAtLocation(tsFalse), tsFalse)
        if (!tTrue || !tFalse) {
          if (!options.allowUnknown) {
            context.report({
              node,
              message: formatMessage(
                options.lang,
                '三目分支类型必须一致且可推断',
                'Ternary branches must have the same inferable type'
              )
            })
          }
          return
        }
        if (tTrue !== tFalse) {
          context.report({
            node,
            message: formatMessage(
              options.lang,
              '三目分支类型必须一致且可推断',
              'Ternary branches must have the same inferable type'
            )
          })
        }
      }
    }
  }
}

export default rule
