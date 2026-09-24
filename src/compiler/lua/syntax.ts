import ts from 'typescript'

export const hooks = new Map(
  ['Init', 'Start', 'Enable', 'Disable', 'Update', 'LevelUpdate', 'Destroy'].map((x) => [
    `on${x}`,
    `On${x}`
  ])
)
export function entryCall(source: ts.SourceFile): ts.CallExpression | undefined {
  // Discovery only. The compiler subsequently verifies the resolved declaration.
  for (const statement of source.statements) {
    if (ts.isExportAssignment(statement) && ts.isCallExpression(statement.expression)) {
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
