import ts from 'typescript'
import { entryCall, diagnostic, hooks } from './syntax.js'

/** 编译器、ESLint 和编辑器共用的 Lua 规则，不加载 TSTL。 */
export function getLuaDiagnostics(source: ts.SourceFile, checker: ts.TypeChecker): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = []
    const call = entryCall(source)
    if (call) {
      const declaration = checker.getResolvedSignature(call)?.declaration
      if (!declaration?.getSourceFile().fileName.endsWith('lua.d.ts')) diagnostics.push(diagnostic(call, '入口必须调用 genshin-ts/runtime/core 导出的 g.clientControlScript。'))
      const setup = call.arguments[call.arguments.length - 1]
      if (call.arguments.length < 1 || call.arguments.length > 2 || call.arguments.length === 2 && (!ts.isObjectLiteralExpression(call.arguments[0]) || call.arguments[0].properties.length)) diagnostics.push(diagnostic(call, '目前配置只支持空对象 {}，也可以只传回调。'))
      if (!setup || !(ts.isArrowFunction(setup) || ts.isFunctionExpression(setup)) || !ts.isBlock(setup.body) || setup.parameters.length > 1 || setup.parameters[0] && !ts.isIdentifier(setup.parameters[0].name)) diagnostics.push(diagnostic(call, '请使用 (lua) => { …; return { … } } 形式声明脚本。'))
      else {
        const last = setup.body.statements.at(-1)
        if (!last || !ts.isReturnStatement(last) || !last.expression || !ts.isObjectLiteralExpression(last.expression)) diagnostics.push(diagnostic(setup, '回调最后必须直接返回生命周期对象。'))
        else for (const member of last.expression.properties) {
          if (!member.name || !ts.isIdentifier(member.name) || !hooks.has(member.name.text) || !(ts.isMethodDeclaration(member) || ts.isPropertyAssignment(member) && (ts.isArrowFunction(member.initializer) || ts.isFunctionExpression(member.initializer)))) diagnostics.push(diagnostic(member, '请直接声明 onStart、onUpdate 等生命周期函数，不支持展开或动态生成生命周期。'))
        }
        const checkReturn = (node: ts.Node) => {
          if (node !== setup.body && ts.isFunctionLike(node)) return
          if (ts.isReturnStatement(node) && node !== last) diagnostics.push(diagnostic(node, '入口回调只能在结尾返回生命周期对象。'))
          ts.forEachChild(node, checkReturn)
        }
        checkReturn(setup.body)
      }
      for (const statement of source.statements) {
        if (ts.isImportDeclaration(statement) || ts.isExportAssignment(statement) || ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isEmptyStatement(statement) || ts.canHaveModifiers(statement) && ts.getModifiers(statement)?.some(m => m.kind === ts.SyntaxKind.DeclareKeyword)) continue
        diagnostics.push(diagnostic(statement, '入口的运行代码请放进 clientControlScript 回调；共享代码请移到普通模块。'))
      }
    }
    const visit = (node: ts.Node) => {
      if (ts.isAwaitExpression(node) || ts.isYieldExpression(node) || ts.isBigIntLiteral(node) || ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) diagnostics.push(diagnostic(node, '客户端 Lua 暂不支持异步调度、生成器、动态 import 或 bigint；请使用生命周期和普通 number。'))
      if (ts.isIfStatement(node) || ts.isWhileStatement(node) || ts.isConditionalExpression(node)) {
        const condition = ts.isConditionalExpression(node) ? node.condition : node.expression
        const type = checker.getTypeAtLocation(condition)
        const parts = type.isUnion() ? type.types : [type]
        if (parts.some(t => t.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.StringLike))) diagnostics.push(diagnostic(condition, 'Lua 中 0 和空字符串也是真值。建议明确比较数值或字符串，避免依赖 JS 真值。', true))
      }
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && (ts.isElementAccessExpression(node.left) || ts.isPropertyAccessExpression(node.left))) {
        const type = checker.getTypeAtLocation(node.right)
        const parts = type.isUnion() ? type.types : [type]
        if (parts.some(t => t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null))) diagnostics.push(diagnostic(node, 'Lua 的 nil 会删除 table 中的字段；用于数组时可能形成空洞，影响长度与遍历。', true))
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  return diagnostics
}
