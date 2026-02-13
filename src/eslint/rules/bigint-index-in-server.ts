import type { Rule } from 'eslint'
import ts from 'typescript'

import { inferListTypeFromExpression } from '../utils/list.js'
import { formatMessage } from '../utils/messages.js'
import { readBaseOptions } from '../utils/options.js'
import { getParserServices } from '../utils/parser.js'
import { buildServerScopeIndex } from '../utils/scope.js'
import { isAnyOrUnknown } from '../utils/types.js'

type Options = {
  helperName?: string
  lang?: 'zh' | 'en' | 'both'
  scope?: 'server' | 'all'
  includeNestedFunctions?: boolean
}

const DEFAULTS: Required<Options> = {
  helperName: 'idx',
  lang: 'both',
  scope: 'server',
  includeNestedFunctions: true
}

function hasBigIntConstituent(checker: ts.TypeChecker, type: ts.Type): boolean {
  if (type.flags & ts.TypeFlags.Union) {
    const u = type as ts.UnionType
    return u.types.some((t) => hasBigIntConstituent(checker, t))
  }
  if (type.flags & ts.TypeFlags.Intersection) {
    const i = type as ts.IntersectionType
    return i.types.some((t) => hasBigIntConstituent(checker, t))
  }
  if ((type.flags & ts.TypeFlags.BigIntLike) !== 0) return true

  const s = checker.typeToString(type)
  return s === 'IntValue' || s === 'int' || s === 'bigint'
}

function isNode(value: unknown): value is Rule.Node {
  if (!value || typeof value !== 'object') return false
  return typeof (value as { type?: unknown }).type === 'string'
}

function isWrappedByHelper(node: Rule.Node, helperName: string): boolean {
  if (node.type !== 'CallExpression') return false
  if (node.arguments.length !== 1) return false
  return node.callee.type === 'Identifier' && node.callee.name === helperName
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          helperName: { type: 'string' },
          lang: { enum: ['zh', 'en', 'both'] },
          scope: { enum: ['server', 'all'] },
          includeNestedFunctions: { type: 'boolean' }
        },
        additionalProperties: false
      }
    ],
    messages: {
      wrapWithHelper: "Wrap this index with '{{helper}}(...)'."
    }
  },
  create(context) {
    const raw = (context.options[0] ?? {}) as Options
    const options = readBaseOptions(raw, DEFAULTS)
    const services = getParserServices(context)
    if (!services) return {}

    const helperName = options.helperName.trim() || 'idx'
    const checker = services.program.getTypeChecker()
    const sourceCode = context.sourceCode ?? context.getSourceCode()
    const scopeIndex = buildServerScopeIndex(context)

    return {
      MemberExpression(node) {
        if (!scopeIndex.isInServerScope(node, options)) return
        if (!node.computed || !isNode(node.property) || !isNode(node.object)) return
        if (isWrappedByHelper(node.property, helperName)) return

        const tsObj = services.esTreeNodeToTSNodeMap.get(node.object)
        if (!tsObj) return
        const listType = inferListTypeFromExpression(checker, tsObj)
        if (!listType) return

        const tsIndex = services.esTreeNodeToTSNodeMap.get(node.property)
        if (!tsIndex) return
        const indexType = checker.getTypeAtLocation(tsIndex)
        if (isAnyOrUnknown(indexType)) return
        if (!hasBigIntConstituent(checker, indexType)) return

        context.report({
          node: node.property,
          message: formatMessage(
            options.lang,
            `genshin-ts项目使用bigint表示运行时整数类型, 但bigint无法作为typescript索引, 为此, 你需要用一个${helperName}()函数进行包裹, 从而通过类型检查, ${helperName}()不产生实际作用, 仅用于通过检查, 你可以直接应用eslint修复自动执行此操作; 此外, 如果你看到此处显示的是警告, 而不是错误, 那么, 通常意味着本项目的typescript插件已经生效, 将bigint视作了正常的索引值, 此时, 你可以禁用gsts/bigint-index-in-server eslint规则; 如果你用的是vscode/cursor这类编辑器, 并且此处显示了一个错误, 提示bigint不可作为索引, 那么, 你可以为编辑器配置 "typescript.tsdk": "node_modules/typescript/lib" 和 "typescript.enablePromptUseWorkspaceTsdk": true (genshin-ts的项目模板已经自带了这些设置), 并设置"使用工作区的typescript版本", 这样你无需使用${helperName}()就可以通过类型检查`,
            `genshin-ts uses bigint for runtime integer values, but bigint cannot be used as a TypeScript index type. Wrap the index with ${helperName}() to pass type-checking. ${helperName}() has no runtime effect and is only for type checking. You can apply ESLint auto-fix directly. If this appears as a warning (not an error), the project TypeScript plugin is likely active and bigint is already treated as a valid index value, so you may disable gsts/bigint-index-in-server. If you use VSCode/Cursor and still see an error that bigint cannot be used as an index type, configure "typescript.tsdk": "node_modules/typescript/lib" and "typescript.enablePromptUseWorkspaceTsdk": true (the genshin-ts project template already includes these settings), then switch to the workspace TypeScript version. In that case, you can pass type-checking without ${helperName}().`
          ),
          fix(fixer) {
            const rawIndex = sourceCode.getText(node.property)
            return fixer.replaceText(node.property, `${helperName}(${rawIndex})`)
          },
          suggest: [
            {
              messageId: 'wrapWithHelper',
              data: { helper: helperName },
              fix(fixer) {
                const rawIndex = sourceCode.getText(node.property)
                return fixer.replaceText(node.property, `${helperName}(${rawIndex})`)
              }
            }
          ]
        })
      }
    }
  }
}

export default rule
