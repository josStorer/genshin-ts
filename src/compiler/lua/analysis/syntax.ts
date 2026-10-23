import ts from 'typescript'

import { NODE_GRAPH_ENTRY_FACTORIES } from '../../../definitions/node_graph_entries.js'

export const hooks = new Map(
  ['Init', 'Start', 'Enable', 'Disable', 'Update', 'LevelUpdate', 'Destroy'].map((x) => [
    `on${x}`,
    `On${x}`
  ])
)

export function entryCall(source: ts.SourceFile): ts.CallExpression | undefined {
  // Discovery only. The compiler subsequently verifies the resolved declaration.
  for (const statement of source.statements) {
    if (
      (ts.isExportAssignment(statement) || ts.isExpressionStatement(statement)) &&
      ts.isCallExpression(statement.expression)
    ) {
      const call = statement.expression
      if (
        ts.isPropertyAccessExpression(call.expression) &&
        call.expression.name.text === 'clientControlScript'
      )
        return call
    }
  }
  return undefined
}
export function diagnostic(node: ts.Node, messageText: string, warning = false): ts.Diagnostic {
  return {
    file: node.getSourceFile(),
    start: node.getStart(),
    length: node.getWidth(),
    category: warning ? ts.DiagnosticCategory.Warning : ts.DiagnosticCategory.Error,
    code: 97001,
    messageText
  }
}

/** 只识别从 GSTS 导入的节点图工厂，避免把普通对象的 server() 当成节点图。 */
export function nodeGraphCalls(source: ts.SourceFile): ts.CallExpression[] {
  const imports = new Set<string>()
  const namespaces = new Set<string>()
  for (const statement of source.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !/^genshin-ts\/runtime\/core(?:\.js)?$/.test(statement.moduleSpecifier.text) ||
      statement.importClause?.isTypeOnly
    )
      continue
    const bindings = statement.importClause?.namedBindings
    if (bindings && ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text)
    if (bindings && ts.isNamedImports(bindings))
      for (const item of bindings.elements)
        if (!item.isTypeOnly && (item.propertyName ?? item.name).text === 'g')
          imports.add(item.name.text)
  }
  if (!imports.size && !namespaces.size) return []
  const methods = new Set<string>(NODE_GRAPH_ENTRY_FACTORIES)
  const calls: ts.CallExpression[] = []
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      methods.has(node.expression.name.text)
    ) {
      const receiver = node.expression.expression
      if (
        (ts.isIdentifier(receiver) && imports.has(receiver.text)) ||
        (ts.isPropertyAccessExpression(receiver) &&
          receiver.name.text === 'g' &&
          ts.isIdentifier(receiver.expression) &&
          namespaces.has(receiver.expression.text))
      )
        calls.push(node)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return calls
}

const nodeGraphEntryCache = new WeakMap<ts.SourceFile, boolean>()
/** 按 SourceFile 缓存；增量编译复用未改动的语法树时不再重复遍历。 */
export function isNodeGraphEntry(source: ts.SourceFile): boolean {
  let cached = nodeGraphEntryCache.get(source)
  if (cached === undefined) {
    cached = nodeGraphCalls(source).length > 0
    nodeGraphEntryCache.set(source, cached)
  }
  return cached
}
