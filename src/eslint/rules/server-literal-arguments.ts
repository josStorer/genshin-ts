import type { Rule } from 'eslint'
import ts from 'typescript'

import { SERVER_LITERAL_ARGUMENT_INDEXES_BY_METHOD } from '../../definitions/server_node_metadata.js'
import { SERVER_F_ZH_TO_EN } from '../../definitions/zh_aliases.js'
import { isLiteralArgument } from '../utils/literal-arguments.js'
import { formatMessage } from '../utils/messages.js'
import { readBaseOptions } from '../utils/options.js'
import { getParserServices } from '../utils/parser.js'
import { buildNodeGraphScopeIndex } from '../utils/scope.js'

type Options = {
  lang?: 'zh' | 'en' | 'both'
}

const DEFAULTS: Required<Options> = { lang: 'both' }

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require source literals for server node inputs without connection sockets'
    },
    schema: [
      {
        type: 'object',
        properties: { lang: { enum: ['zh', 'en', 'both'] } },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const options = readBaseOptions((context.options[0] ?? {}) as Options, DEFAULTS)
    const services = getParserServices(context)
    if (!services) return {}
    const checker = services.program.getTypeChecker()
    const scopeIndex = buildNodeGraphScopeIndex(context)

    return {
      CallExpression(node: any) {
        if (
          !scopeIndex.isInServerScope(node, {
            scope: 'server',
            includeNestedFunctions: true
          })
        ) {
          return
        }

        const tsNode = services.esTreeNodeToTSNodeMap.get(node)
        if (!tsNode || !ts.isCallExpression(tsNode)) {
          return
        }

        const callee = tsNode.expression
        const globalSignal =
          ts.isIdentifier(callee) && ['sendLua', 'sendLuaAll'].includes(callee.text)
        if (!globalSignal && !ts.isPropertyAccessExpression(callee)) return
        const rawName = ts.isIdentifier(callee)
          ? callee.text
          : (callee as ts.PropertyAccessExpression).name.text
        const luaSignal = [
          'sendLua',
          'sendLuaAll',
          'sendClientScriptedServerSignal',
          '发送客户端脚本信号'
        ].includes(rawName)
        const methodName = (SERVER_F_ZH_TO_EN as Record<string, string>)[rawName] ?? rawName
        const indexes = luaSignal
          ? [rawName === 'sendLuaAll' ? 0 : 1]
          : (SERVER_LITERAL_ARGUMENT_INDEXES_BY_METHOD as Record<string, readonly number[]>)[
              methodName
            ]
        if (!indexes) return

        const receiverType = ts.isPropertyAccessExpression(callee)
          ? checker.getTypeAtLocation(callee.expression)
          : undefined
        const isEntityHelper = Boolean(
          receiverType && checker.getPropertyOfType(receiverType, '__entityRuntimeBrand')
        )
        const isServerFlowFunctions = Boolean(
          receiverType && checker.getPropertyOfType(receiverType, '__gstsEnsureVariable')
        )
        if (!globalSignal && !isEntityHelper && !isServerFlowFunctions) return

        for (const methodIndex of indexes) {
          const index = isEntityHelper ? methodIndex - 1 : methodIndex
          if (index < 0) continue
          const argument = tsNode.arguments[index]
          if (!argument || isLiteralArgument(argument, checker)) continue
          if (
            luaSignal &&
            checker.getPropertyOfType(checker.getTypeAtLocation(argument), '__gstsSignal')
          )
            continue
          context.report({
            node: node.arguments[index] ?? node,
            message: formatMessage(
              options.lang,
              `服务端方法 ${methodName} 的第 ${index + 1} 个参数仅支持字面量；编辑器没有对应的连接引脚`,
              `Argument ${index + 1} of server method ${methodName} must be a source literal because the editor exposes no connection socket`
            )
          })
        }
      }
    }
  }
}

export default rule
