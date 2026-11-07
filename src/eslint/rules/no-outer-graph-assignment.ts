import type { Rule, Scope } from 'eslint'

import { isIdentifier } from '../utils/ast.js'
import { formatMessage } from '../utils/messages.js'
import { readBaseOptions } from '../utils/options.js'
import { getParserServices } from '../utils/parser.js'
import { buildServerScopeIndex } from '../utils/scope.js'

type Options = {
  lang?: 'zh' | 'en' | 'both'
}

const DEFAULTS: Required<Options> = {
  lang: 'both'
}

const TIMER_METHODS = new Set(['setTimeout', 'setInterval'])

function isTimerCallback(fn: any): boolean {
  const call = fn.parent
  if (call?.type !== 'CallExpression' || call.arguments[0] !== fn) return false
  const callee = call.callee
  if (callee.type === 'Identifier') return TIMER_METHODS.has(callee.name)
  return (
    callee.type === 'MemberExpression' &&
    isIdentifier(callee.object, 'globalThis') &&
    isIdentifier(callee.property) &&
    TIMER_METHODS.has(callee.property.name)
  )
}

function isWithin(scope: Scope.Scope | null, ancestor: Scope.Scope): boolean {
  for (let cur = scope; cur; cur = cur.upper) if (cur === ancestor) return true
  return false
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          lang: { enum: ['zh', 'en', 'both'] }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const raw = (context.options[0] ?? {}) as Options
    const options = readBaseOptions(raw, DEFAULTS)
    if (!getParserServices(context)) return {}
    const scopeIndex = buildServerScopeIndex(context)

    return {
      'Program:exit'() {
        for (const scope of context.sourceCode.scopeManager?.scopes ?? []) {
          for (const ref of scope.references) {
            if (!ref.isWrite() || !ref.resolved) continue
            // The node-graph function (event handler or gstsServer*) the write happens in
            let graphScope: Scope.Scope | null = ref.from
            let inTimer = false
            while (graphScope && !scopeIndex.isServerScopeFunction(graphScope.block)) {
              inTimer ||= isTimerCallback(graphScope.block)
              graphScope = graphScope.upper
            }
            if (!graphScope || isWithin(ref.resolved.scope, graphScope)) continue
            // timer-outer-capture already reports outer locals inside timer callbacks
            const declaredAtTop = ['global', 'module'].includes(ref.resolved.scope.type)
            if (inTimer && !declaredAtTop) continue
            context.report({
              node: ref.identifier,
              message: formatMessage(
                options.lang,
                '给外层变量赋值只会在编译期让它指向节点输出，在其他事件里读取会连到错误的节点；请改用节点图变量（f.set / f.get 或 stage.set）',
                'Assigning to an outer variable only points it at a node output during compilation, so reading it in another event connects to the wrong node; use node graph variables (f.set / f.get or stage.set) instead'
              )
            })
          }
        }
      }
    }
  }
}

export default rule
