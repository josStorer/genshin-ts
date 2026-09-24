import ts from 'typescript'

import { diagnostic, entryCall, hooks } from './syntax.js'

/** 编译器、ESLint 和编辑器共用的 Lua 规则，不加载 TSTL。 */
export function getLuaDiagnostics(source: ts.SourceFile, checker: ts.TypeChecker): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = []
  const call = entryCall(source)
  if (call) {
    const declaration = checker.getResolvedSignature(call)?.declaration
    if (!declaration?.getSourceFile().fileName.endsWith('lua-entry.d.ts'))
      diagnostics.push(
        diagnostic(call, '入口必须调用 genshin-ts/runtime/core 导出的 g.clientControlScript。')
      )
    const setup = call.arguments[call.arguments.length - 1]
    if (
      call.arguments.length < 1 ||
      call.arguments.length > 2 ||
      (call.arguments.length === 2 &&
        (!ts.isObjectLiteralExpression(call.arguments[0]) || call.arguments[0].properties.length))
    )
      diagnostics.push(diagnostic(call, '目前配置只支持空对象 {}，也可以只传回调。'))
    if (
      !setup ||
      !(ts.isArrowFunction(setup) || ts.isFunctionExpression(setup)) ||
      !ts.isBlock(setup.body) ||
      setup.parameters.length > 1 ||
      (setup.parameters[0] && !ts.isIdentifier(setup.parameters[0].name))
    )
      diagnostics.push(diagnostic(call, '请使用 (lua) => { …; return { … } } 形式声明脚本。'))
    else {
      const last = setup.body.statements.at(-1)
      if (
        !last ||
        !ts.isReturnStatement(last) ||
        !last.expression ||
        !ts.isObjectLiteralExpression(last.expression)
      )
        diagnostics.push(diagnostic(setup, '回调最后必须直接返回生命周期对象。'))
      else
        for (const member of last.expression.properties) {
          if (
            member.name &&
            ts.isIdentifier(member.name) &&
            member.name.text === 'methods' &&
            ts.isPropertyAssignment(member) &&
            ts.isObjectLiteralExpression(member.initializer)
          ) {
            for (const method of member.initializer.properties) {
              const fn = ts.isPropertyAssignment(method) ? method.initializer : method
              const checkThis = (node: ts.Node) => {
                if (
                  node !== fn &&
                  (ts.isClassLike(node) ||
                    ts.isFunctionDeclaration(node) ||
                    ts.isFunctionExpression(node))
                )
                  return
                if (node.kind === ts.SyntaxKind.ThisKeyword)
                  diagnostics.push(
                    diagnostic(
                      node,
                      '公开方法由官方作为普通函数调用，请通过闭包访问脚本状态；class 方法仍可正常使用 this。'
                    )
                  )
                ts.forEachChild(node, checkThis)
              }
              checkThis(fn)
              if (
                !method.name ||
                !ts.isIdentifier(method.name) ||
                !/^[A-Za-z_][A-Za-z0-9_]*$/.test(method.name.text) ||
                [...hooks.values()].includes(method.name.text) ||
                [
                  'script',
                  'game',
                  'Enum',
                  'Color',
                  'print',
                  'printerr',
                  'require',
                  'self',
                  '_ENV',
                  'math',
                  'string',
                  'table',
                  'os',
                  'debug'
                ].includes(method.name.text) ||
                !(
                  ts.isMethodDeclaration(method) ||
                  (ts.isPropertyAssignment(method) &&
                    (ts.isArrowFunction(method.initializer) ||
                      ts.isFunctionExpression(method.initializer)))
                )
              )
                diagnostics.push(
                  diagnostic(
                    method,
                    '公开方法请直接声明普通函数，名称不能覆盖官方生命周期或全局 API。'
                  )
                )
            }
          } else if (
            !member.name ||
            !ts.isIdentifier(member.name) ||
            !hooks.has(member.name.text) ||
            !(
              ts.isMethodDeclaration(member) ||
              (ts.isPropertyAssignment(member) &&
                (ts.isArrowFunction(member.initializer) ||
                  ts.isFunctionExpression(member.initializer)))
            )
          )
            diagnostics.push(
              diagnostic(
                member,
                '请直接声明 onStart、onUpdate 等生命周期函数，不支持展开或动态生成生命周期。'
              )
            )
        }
      const checkReturn = (node: ts.Node) => {
        if (node !== setup.body && ts.isFunctionLike(node)) return
        if (ts.isReturnStatement(node) && node !== last)
          diagnostics.push(diagnostic(node, '入口回调只能在结尾返回生命周期对象。'))
        ts.forEachChild(node, checkReturn)
      }
      checkReturn(setup.body)
    }
    for (const statement of source.statements) {
      if (
        ts.isImportDeclaration(statement) ||
        ts.isExportAssignment(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isEmptyStatement(statement) ||
        (ts.canHaveModifiers(statement) &&
          ts.getModifiers(statement)?.some((m) => m.kind === ts.SyntaxKind.DeclareKeyword))
      )
        continue
      diagnostics.push(
        diagnostic(
          statement,
          '入口的运行代码请放进 clientControlScript 回调；共享代码请移到普通模块。'
        )
      )
    }
  }
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      node !== call &&
      checker
        .getResolvedSignature(node)
        ?.declaration?.getSourceFile()
        .fileName.endsWith('lua-entry.d.ts')
    )
      diagnostics.push(
        diagnostic(
          node,
          'clientControlScript 只能在入口中使用 export default g.clientControlScript(...)，不能在函数或普通模块里创建脚本实例。'
        )
      )
    if (
      ts.isIdentifier(node) &&
      node.text === '_ENV' &&
      (ts.isVariableDeclaration(node.parent) ||
        ts.isParameter(node.parent) ||
        ts.isFunctionDeclaration(node.parent)) &&
      node.parent.name === node
    )
      diagnostics.push(diagnostic(node, '_ENV 是 Lua 运行环境的保留名称，请换一个变量名。'))
    if (
      (ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node) ||
        ts.isMethodDeclaration(node)) &&
      (('asteriskToken' in node && node.asteriskToken) ||
        ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword))
    )
      diagnostics.push(
        diagnostic(node, '客户端 Lua 不支持异步函数或生成器，请使用普通函数和生命周期。')
      )
    if (
      ts.isVariableDeclaration(node) &&
      ts.isObjectBindingPattern(node.name) &&
      node.initializer &&
      checker.getTypeAtLocation(node.initializer).getSymbol()?.name === 'ClientGlobals' &&
      (node.name.elements.some((e) => e.dotDotDotToken) || !ts.isIdentifier(node.initializer))
    )
      diagnostics.push(
        diagnostic(node, '请从 lua 或其局部别名做命名解构，不要展开整个 Lua 运行环境。')
      )
    if (
      ts.isIdentifier(node) &&
      ['Promise', 'WeakMap', 'WeakSet', 'Date', 'RegExp', 'JSON'].includes(node.text) &&
      checker
        .getSymbolAtLocation(node)
        ?.declarations?.some((d) => d.getSourceFile().hasNoDefaultLib)
    )
      diagnostics.push(
        diagnostic(
          node,
          `官方客户端 Lua 环境不提供 ${node.text}；请使用受支持的原生 API 或普通同步代码。`
        )
      )
    if (
      ts.isAwaitExpression(node) ||
      ts.isYieldExpression(node) ||
      ts.isBigIntLiteral(node) ||
      (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
    )
      diagnostics.push(
        diagnostic(
          node,
          '客户端 Lua 暂不支持异步调度、生成器、动态 import 或 bigint；请使用生命周期和普通 number。'
        )
      )
    if (ts.isIfStatement(node) || ts.isWhileStatement(node) || ts.isConditionalExpression(node)) {
      const condition = ts.isConditionalExpression(node) ? node.condition : node.expression
      const type = checker.getTypeAtLocation(condition)
      const parts = type.isUnion() ? type.types : [type]
      if (parts.some((t) => t.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.StringLike)))
        diagnostics.push(
          diagnostic(
            condition,
            'Lua 中 0 和空字符串也是真值。建议明确比较数值或字符串，避免依赖 JS 真值。',
            true
          )
        )
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      (ts.isElementAccessExpression(node.left) || ts.isPropertyAccessExpression(node.left))
    ) {
      const type = checker.getTypeAtLocation(node.right)
      const parts = type.isUnion() ? type.types : [type]
      if (parts.some((t) => t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)))
        diagnostics.push(
          diagnostic(
            node,
            'Lua 的 nil 会删除 table 中的字段；用于数组时可能形成空洞，影响长度与遍历。',
            true
          )
        )
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return diagnostics
}
