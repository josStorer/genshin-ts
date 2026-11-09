import type { Rule } from 'eslint'
import ts from 'typescript'

import { canHaveLocalVariable, isBranchedAssignment } from '../../shared/ts_variable_utils.js'
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

function isTimerCallback(node: ts.Node): boolean {
  if (!ts.isArrowFunction(node) && !ts.isFunctionExpression(node)) return false
  const call = node.parent
  if (!ts.isCallExpression(call) || call.arguments[0] !== node) return false
  const callee = call.expression
  const name = ts.isIdentifier(callee)
    ? callee.text
    : ts.isPropertyAccessExpression(callee) &&
        ts.isIdentifier(callee.expression) &&
        callee.expression.text === 'globalThis'
      ? callee.name.text
      : undefined
  return name === 'setTimeout' || name === 'setInterval'
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

    const check = (node: Rule.Node) => {
      if (!scopeIndex.isInNodeGraphScope(node, options)) return
      const expr = services.esTreeNodeToTSNodeMap.get(node)
      if (!expr) return
      const target = ts.isBinaryExpression(expr)
        ? expr.left
        : ts.isPrefixUnaryExpression(expr) || ts.isPostfixUnaryExpression(expr)
          ? expr.operand
          : undefined
      if (!target || !ts.isIdentifier(target) || !ts.isExpression(expr)) return
      const symbol = checker.getSymbolAtLocation(target)
      const decl = symbol?.valueDeclaration ?? symbol?.declarations?.[0]
      if (!decl || decl.getSourceFile() !== expr.getSourceFile()) return
      if (!ts.isParameter(decl) && !ts.isVariableDeclaration(decl)) return
      const declarationNode = services.tsNodeToESTreeNodeMap.get(decl)
      if (!declarationNode || !scopeIndex.isInNodeGraphScope(declarationNode, options)) return
      if (!isBranchedAssignment(expr, decl)) return

      const type = checker.getTypeAtLocation(target)
      if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Never)) return
      const supportsLocal = canHaveLocalVariable({ checker, file: expr.getSourceFile() }, type)
      if (supportsLocal) {
        if (
          ts.isVariableDeclaration(decl) &&
          ts.isVariableDeclarationList(decl.parent) &&
          ts.isVariableStatement(decl.parent.parent)
        )
          return
        const ancestors = new Set<ts.Node>()
        for (let current: ts.Node | undefined = decl; current; current = current.parent)
          ancestors.add(current)
        for (let current: ts.Node = expr; !ancestors.has(current); current = current.parent) {
          // Timer captures are restored into callback-local variables before the callback runs.
          if (isTimerCallback(current)) return
        }
      }
      context.report({
        node,
        message: supportsLocal
          ? formatMessage(
              options.lang,
              `“${target.text}”没有对应的节点图局部变量，不能在分支、循环体或回调里重新赋值；请先复制到新的 let 变量再修改，例如 let value = ${target.text}`,
              `“${target.text}” has no node graph local variable and cannot be reassigned inside a branch, loop body or callback; copy it into a new let variable first, for example let value = ${target.text}`
            )
          : formatMessage(
              options.lang,
              `“${target.text}”的类型不能存进节点图局部变量，不能在分支、循环体或回调里重新赋值；字典请直接修改内容（如 set），不要替换整个字典`,
              `The type of “${target.text}” cannot be stored in a node graph local variable or reassigned inside a branch, loop body or callback; for dictionaries, modify their contents (for example with set) instead of replacing the dictionary`
            )
      })
    }
    return { AssignmentExpression: check, UpdateExpression: check }
  }
}

export default rule
