/**
 * gsts tsserver plugin:
 * suppress TS2538 ("Type X cannot be used as an index type")
 * only for bigint/int-like index expressions inside:
 * - g.server().on/onSignal handlers
 * - top-level gstsServer* function bodies
 */

function init(modules) {
  const ts = modules.typescript

  function collectGImportNames(sourceFile) {
    const names = new Set()
    for (const stmt of sourceFile.statements) {
      if (!ts.isImportDeclaration(stmt)) continue
      if (!stmt.moduleSpecifier || !ts.isStringLiteral(stmt.moduleSpecifier)) continue
      const spec = stmt.moduleSpecifier.text
      if (spec !== 'genshin-ts/runtime/core' && spec !== 'genshin-ts/runtime/core.js') continue
      const clause = stmt.importClause
      const bindings = clause && clause.namedBindings
      if (!bindings || !ts.isNamedImports(bindings)) continue
      for (const e of bindings.elements) {
        const importName = e.propertyName ? e.propertyName.text : e.name.text
        if (importName === 'g') names.add(e.name.text)
      }
    }
    if (!names.size) names.add('g')
    return names
  }

  function inRange(pos, node, sourceFile) {
    return pos >= node.getStart(sourceFile, false) && pos < node.getEnd()
  }

  function findNodeAtPos(sourceFile, pos) {
    let best = sourceFile
    const visit = (node) => {
      if (!inRange(pos, node, sourceFile)) return
      best = node
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
    return best
  }

  function findAncestor(node, pred) {
    let cur = node
    while (cur) {
      if (pred(cur)) return cur
      cur = cur.parent
    }
    return undefined
  }

  function hasBigIntLikeConstituent(type, checker) {
    if (!type) return false
    if (type.flags & ts.TypeFlags.Union) {
      return type.types.some((t) => hasBigIntLikeConstituent(t, checker))
    }
    if (type.flags & ts.TypeFlags.Intersection) {
      return type.types.some((t) => hasBigIntLikeConstituent(t, checker))
    }
    if ((type.flags & ts.TypeFlags.BigIntLike) !== 0) return true
    const s = checker.typeToString(type)
    return s === 'IntValue' || s === 'int' || s === 'bigint'
  }

  function unwrapChainBase(expr) {
    let cur = expr
    while (
      ts.isCallExpression(cur) &&
      ts.isPropertyAccessExpression(cur.expression) &&
      (cur.expression.name.text === 'on' || cur.expression.name.text === 'onSignal')
    ) {
      cur = cur.expression.expression
    }
    return cur
  }

  function isServerHandlerFunction(fnNode, gNames) {
    const parent = fnNode.parent
    if (!parent || !ts.isCallExpression(parent)) return false
    if (parent.arguments.length < 2 || parent.arguments[1] !== fnNode) return false
    if (!ts.isPropertyAccessExpression(parent.expression)) return false
    const method = parent.expression.name.text
    if (method !== 'on' && method !== 'onSignal') return false

    const base = unwrapChainBase(parent.expression.expression)
    if (!ts.isCallExpression(base)) return false
    if (!ts.isPropertyAccessExpression(base.expression)) return false
    if (base.expression.name.text !== 'server') return false
    if (!ts.isIdentifier(base.expression.expression)) return false
    return gNames.has(base.expression.expression.text)
  }

  function isInGServerScope(node, gNames) {
    let cur = node
    while (cur) {
      if (
        (ts.isArrowFunction(cur) ||
          ts.isFunctionExpression(cur) ||
          ts.isFunctionDeclaration(cur)) &&
        isServerHandlerFunction(cur, gNames)
      ) {
        return true
      }
      cur = cur.parent
    }
    return false
  }

  function isTopLevelFunctionDeclaration(node) {
    return ts.isFunctionDeclaration(node) && !!node.name && ts.isSourceFile(node.parent)
  }

  function isTopLevelGstsServerVarInitializer(node) {
    if (!(ts.isArrowFunction(node) || ts.isFunctionExpression(node))) return false
    const decl = node.parent
    if (!decl || !ts.isVariableDeclaration(decl)) return false
    if (decl.initializer !== node) return false
    if (!ts.isIdentifier(decl.name)) return false
    const list = decl.parent
    if (!list || !ts.isVariableDeclarationList(list)) return false
    const stmt = list.parent
    if (!stmt || !ts.isVariableStatement(stmt)) return false
    return ts.isSourceFile(stmt.parent)
  }

  function isGstsServerRootFunction(node) {
    if (isTopLevelFunctionDeclaration(node)) return node.name.text.startsWith('gstsServer')
    if (isTopLevelGstsServerVarInitializer(node)) {
      const decl = node.parent
      return ts.isIdentifier(decl.name) && decl.name.text.startsWith('gstsServer')
    }
    return false
  }

  function isInGstsServerScope(node) {
    let cur = node
    while (cur) {
      if (
        (ts.isArrowFunction(cur) ||
          ts.isFunctionExpression(cur) ||
          ts.isFunctionDeclaration(cur)) &&
        isGstsServerRootFunction(cur)
      ) {
        return true
      }
      cur = cur.parent
    }
    return false
  }

  function shouldSuppress2538(diagnostic, sourceFile, checker) {
    if (!diagnostic || diagnostic.code !== 2538) return false
    if (!diagnostic.file || typeof diagnostic.start !== 'number') return false
    const pos = diagnostic.start
    const gNames = collectGImportNames(sourceFile)
    const nodeAtPos = findNodeAtPos(sourceFile, pos)

    const elem = findAncestor(
      nodeAtPos,
      (n) =>
        ts.isElementAccessExpression(n) &&
        !!n.argumentExpression &&
        inRange(pos, n.argumentExpression, sourceFile)
    )
    if (!elem || !elem.argumentExpression) return false
    if (!isInGServerScope(elem, gNames) && !isInGstsServerScope(elem)) return false

    const indexType = checker.getTypeAtLocation(elem.argumentExpression)
    return hasBigIntLikeConstituent(indexType, checker)
  }

  function create(info) {
    const languageService = info.languageService
    const proxy = Object.create(null)
    for (const key of Object.keys(languageService)) {
      proxy[key] = languageService[key].bind(languageService)
    }

    proxy.getSemanticDiagnostics = (fileName) => {
      const base = languageService.getSemanticDiagnostics(fileName)
      if (!Array.isArray(base) || base.length === 0) return base
      const program = languageService.getProgram()
      if (!program) return base
      const sourceFile = program.getSourceFile(fileName)
      if (!sourceFile) return base
      const checker = program.getTypeChecker()
      return base.filter((d) => !shouldSuppress2538(d, sourceFile, checker))
    }

    return proxy
  }

  return { create }
}

module.exports = init
