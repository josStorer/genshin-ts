import type { Rule } from 'eslint'
import ts from 'typescript'

export type ParserServices = {
  program: ts.Program
  esTreeNodeToTSNodeMap: Map<unknown, ts.Node>
  tsNodeToESTreeNodeMap: Map<ts.Node, unknown>
}

type RuleContext = Rule.RuleContext

export function getSourceCode(context: RuleContext) {
  return context.sourceCode
}

export function getParserServices(context: RuleContext): ParserServices | null {
  const sourceCode = getSourceCode(context)
  const services = ((context as any).parserServices ??
    sourceCode?.parserServices) as ParserServices | null
  if (!services?.program || !services.esTreeNodeToTSNodeMap || !services.tsNodeToESTreeNodeMap) {
    return null
  }
  return services
}

export function requireParserServices(context: RuleContext): ParserServices {
  const services = getParserServices(context)
  if (!services) {
    throw new Error(
      'gsts eslint rules require @typescript-eslint/parser with parserOptions.project'
    )
  }
  return services
}

export function getTypeChecker(context: RuleContext): ts.TypeChecker | null {
  const services = getParserServices(context)
  return services?.program.getTypeChecker() ?? null
}

export function getTsNode(context: RuleContext, node: unknown): ts.Node | null {
  const services = getParserServices(context)
  if (!services) return null
  return services.esTreeNodeToTSNodeMap.get(node as object) ?? null
}
