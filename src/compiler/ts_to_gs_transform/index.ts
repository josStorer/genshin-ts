import ts from 'typescript'

import {
  CLIENT_GRAPH_SUB_TYPE_BY_F_GLOBAL_NAME,
  getClientGraphSubTypeForGstsFunctionName
} from '../../definitions/client_graph_modes.js'
import { getClientOnCallInfo, isServerOnCall } from '../../shared/ts_graph_calls.js'
import type { ClientGraphSubType } from '../../thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/client_node_metadata.js'
import { fail } from './errors.js'
import { isAssignmentLikeOperator } from './ops.js'
import {
  transformGstsServerFunction,
  transformHandler,
  validateIterationSourceAssignments
} from './stmt.js'
import { buildFeatureFlags, type EnumImportInfo, type Env, type TransformCtx } from './types.js'

function hasTopLevelDeclName(block: ts.Block, name: string): boolean {
  for (const s of block.statements) {
    if (ts.isVariableStatement(s)) {
      for (const d of s.declarationList.declarations) {
        if (ts.isIdentifier(d.name) && d.name.text === name) return true
      }
      continue
    }
    if (ts.isFunctionDeclaration(s) && s.name?.text === name) return true
    if (ts.isClassDeclaration(s) && s.name?.text === name) return true
  }
  return false
}

const GSTS_SERVER_PREFIX = 'gstsServer'

function isGstsServerName(name: string | undefined): boolean {
  return !!name && name.startsWith(GSTS_SERVER_PREFIX)
}

function isFunctionInitializer(
  expr: ts.Expression | undefined
): expr is ts.FunctionExpression | ts.ArrowFunction {
  return !!expr && (ts.isFunctionExpression(expr) || ts.isArrowFunction(expr))
}

function resolveAliasedSymbol(sym: ts.Symbol, checker: ts.TypeChecker): ts.Symbol {
  if ((sym.flags & ts.SymbolFlags.Alias) !== 0) {
    return checker.getAliasedSymbol(sym)
  }
  return sym
}

function isGstsServerFunctionDecl(node: ts.Node): boolean {
  if (ts.isFunctionDeclaration(node)) return true
  if (ts.isFunctionExpression(node)) return true
  if (ts.isVariableDeclaration(node)) return isFunctionInitializer(node.initializer)
  return false
}

function isGstsServerTargetSymbol(target: ts.Symbol): boolean {
  if (!isGstsServerName(target.getName())) return false
  const decls = target.getDeclarations() ?? []
  if (!decls.length) return true
  return decls.some((d) => isGstsServerFunctionDecl(d))
}

function getCallSymbol(call: ts.CallExpression, checker: ts.TypeChecker): ts.Symbol | null {
  const callee = call.expression
  if (ts.isIdentifier(callee)) return checker.getSymbolAtLocation(callee) ?? null
  if (ts.isPropertyAccessExpression(callee)) {
    return checker.getSymbolAtLocation(callee.name) ?? checker.getSymbolAtLocation(callee) ?? null
  }
  return checker.getSymbolAtLocation(callee) ?? null
}

function getGstsClientTargetSubType(target: ts.Symbol): ClientGraphSubType | undefined {
  const subType = getClientGraphSubTypeForGstsFunctionName(target.getName())
  if (!subType) return undefined
  const decls = target.getDeclarations() ?? []
  if (!decls.length || decls.some((decl) => isGstsServerFunctionDecl(decl))) return subType
  return undefined
}

function getGstsClientNamespaceSubType(
  env: Env,
  node: ts.PropertyAccessExpression
): ClientGraphSubType | 'server' | undefined {
  const root = node.expression
  const isGstsRoot =
    (ts.isIdentifier(root) && (root.text === env.gstsIdent || root.text === 'gsts')) ||
    (ts.isPropertyAccessExpression(root) &&
      ts.isIdentifier(root.expression) &&
      root.expression.text === 'globalThis' &&
      root.name.text === 'gsts')
  if (!isGstsRoot) return undefined
  if (node.name.text === 'f' || node.name.text === 'fServer') return 'server'
  return CLIENT_GRAPH_SUB_TYPE_BY_F_GLOBAL_NAME[node.name.text]
}

function isTopLevelVarDeclaration(decl: ts.VariableDeclaration): boolean {
  const list = decl.parent
  if (!ts.isVariableDeclarationList(list)) return false
  const stmt = list.parent
  return ts.isVariableStatement(stmt) && ts.isSourceFile(stmt.parent)
}

const ENUM_MODULE_SPECS = new Set(['genshin-ts/definitions/enum', 'genshin-ts/definitions/enum.js'])

function findEnumImportInfo(sf: ts.SourceFile): EnumImportInfo | undefined {
  let fallbackNamed: EnumImportInfo | undefined
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt)) continue
    if (!ts.isStringLiteral(stmt.moduleSpecifier)) continue
    if (!ENUM_MODULE_SPECS.has(stmt.moduleSpecifier.text)) continue
    const clause = stmt.importClause
    if (!clause?.namedBindings) continue
    const isTypeOnly = clause.isTypeOnly === true
    if (ts.isNamespaceImport(clause.namedBindings)) {
      return { kind: 'namespace', name: clause.namedBindings.name.text, isTypeOnly }
    }
    if (ts.isNamedImports(clause.namedBindings)) {
      let hasRoundingMode = false
      let localName = 'RoundingMode'
      for (const element of clause.namedBindings.elements) {
        const importName = element.propertyName?.text ?? element.name.text
        if (importName === 'RoundingMode') {
          hasRoundingMode = true
          localName = element.name.text
          break
        }
      }
      const info: EnumImportInfo = {
        kind: 'named',
        name: localName,
        hasRoundingMode,
        isTypeOnly
      }
      if (hasRoundingMode) return info
      if (!fallbackNamed) fallbackNamed = info
    }
  }
  return fallbackNamed
}

function makeRoundingModeImport(moduleSpec: string): ts.ImportDeclaration {
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('RoundingMode')
        )
      ])
    ),
    ts.factory.createStringLiteral(moduleSpec),
    undefined
  )
}

function ensureEnumImport(sf: ts.SourceFile): ts.SourceFile {
  const statements = [...sf.statements]
  for (let i = 0; i < statements.length; i += 1) {
    const stmt = statements[i]
    if (!ts.isImportDeclaration(stmt)) continue
    if (!ts.isStringLiteral(stmt.moduleSpecifier)) continue
    if (!ENUM_MODULE_SPECS.has(stmt.moduleSpecifier.text)) continue

    const clause = stmt.importClause
    if (clause?.namedBindings) {
      if (ts.isNamespaceImport(clause.namedBindings)) {
        if (clause.isTypeOnly) {
          const newClause = ts.factory.updateImportClause(
            clause,
            false,
            clause.name,
            clause.namedBindings
          )
          statements[i] = ts.factory.updateImportDeclaration(
            stmt,
            stmt.modifiers,
            newClause,
            stmt.moduleSpecifier,
            stmt.attributes
          )
        }
        return ts.factory.updateSourceFile(sf, statements)
      }

      if (ts.isNamedImports(clause.namedBindings)) {
        const elements = clause.namedBindings.elements
        const hasRoundingMode = elements.some(
          (element) => (element.propertyName?.text ?? element.name.text) === 'RoundingMode'
        )
        const newElements = hasRoundingMode
          ? elements
          : ts.factory.createNodeArray([
              ...elements,
              ts.factory.createImportSpecifier(
                false,
                undefined,
                ts.factory.createIdentifier('RoundingMode')
              )
            ])
        const newClause = ts.factory.updateImportClause(
          clause,
          false,
          clause.name,
          ts.factory.createNamedImports(newElements)
        )
        statements[i] = ts.factory.updateImportDeclaration(
          stmt,
          stmt.modifiers,
          newClause,
          stmt.moduleSpecifier,
          stmt.attributes
        )
        return ts.factory.updateSourceFile(sf, statements)
      }
    }

    if (clause?.name && !clause.namedBindings) {
      const newClause = ts.factory.updateImportClause(
        clause,
        false,
        clause.name,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier('RoundingMode')
          )
        ])
      )
      statements[i] = ts.factory.updateImportDeclaration(
        stmt,
        stmt.modifiers,
        newClause,
        stmt.moduleSpecifier,
        stmt.attributes
      )
      return ts.factory.updateSourceFile(sf, statements)
    }
  }

  const insertAt = (() => {
    let lastImport = -1
    for (let i = 0; i < statements.length; i += 1) {
      if (ts.isImportDeclaration(statements[i])) lastImport = i
    }
    return lastImport + 1
  })()
  statements.splice(insertAt, 0, makeRoundingModeImport('genshin-ts/definitions/enum'))
  return ts.factory.updateSourceFile(sf, statements)
}

export function transformToGs(sf: ts.SourceFile, ctx: TransformCtx): ts.SourceFile {
  const loopMax = ctx.config.options?.loopMax ?? 999
  const features = buildFeatureFlags(ctx.config)
  const enumImport = findEnumImportInfo(sf)
  const needsEnumImportRef = { value: false }
  const checker = ctx.checker
  const makeEnv = (
    gstsIdent: string,
    eventName?: string,
    graph?: Pick<Env, 'graphDocumentType' | 'clientSubType'>
  ): Env => ({
    gstsIdent,
    config: ctx.config,
    file: sf,
    checker,
    loopMax,
    tempCounter: 1,
    timerCounterRef: ctx.timerCounterRef,
    features,
    eventName,
    timerHandleMeta: new Map(),
    enumImport,
    needsEnumImportRef,
    ...graph
  })

  const baseEnv = makeEnv('gsts')

  // Resolve actual symbols, including nested namespace/re-export aliases. Cache the checker
  // results across validation passes rather than filtering calls by their written names.
  const callSymbolCache = new WeakMap<ts.CallExpression, ts.Symbol | null>()
  const resolvedSymbolCache = new Map<ts.Symbol, ts.Symbol>()
  const serverSymbolCache = new Map<ts.Symbol, boolean>()
  const clientSymbolCache = new Map<ts.Symbol, ClientGraphSubType | undefined>()

  const getCachedCallSymbol = (call: ts.CallExpression): ts.Symbol | null => {
    const cached = callSymbolCache.get(call)
    if (cached !== undefined || callSymbolCache.has(call)) return cached ?? null
    const symbol = getCallSymbol(call, checker)
    callSymbolCache.set(call, symbol)
    return symbol
  }
  const getResolvedSymbol = (symbol: ts.Symbol): ts.Symbol => {
    const cached = resolvedSymbolCache.get(symbol)
    if (cached) return cached
    const resolved = resolveAliasedSymbol(symbol, checker)
    resolvedSymbolCache.set(symbol, resolved)
    return resolved
  }
  const isCachedGstsServerCall = (call: ts.CallExpression): boolean => {
    const symbol = getCachedCallSymbol(call)
    if (!symbol) return false
    const cached = serverSymbolCache.get(symbol)
    if (cached !== undefined || serverSymbolCache.has(symbol)) return cached === true
    const result = isGstsServerTargetSymbol(getResolvedSymbol(symbol))
    serverSymbolCache.set(symbol, result)
    return result
  }
  const getCachedClientCallSubType = (call: ts.CallExpression): ClientGraphSubType | undefined => {
    const symbol = getCachedCallSymbol(call)
    if (!symbol) return undefined
    const cached = clientSymbolCache.get(symbol)
    if (cached !== undefined || clientSymbolCache.has(symbol)) return cached
    const result = getGstsClientTargetSubType(getResolvedSymbol(symbol))
    clientSymbolCache.set(symbol, result)
    return result
  }
  const topLevelGstsServerDecls = (() => {
    const out: {
      name: string
      symbol: ts.Symbol | null
      decl: ts.FunctionDeclaration | ts.VariableDeclaration
      fn: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction
    }[] = []
    const seen = new Set<string>()
    for (const stmt of sf.statements) {
      if (ts.isFunctionDeclaration(stmt) && isGstsServerName(stmt.name?.text)) {
        if (!stmt.name) continue
        if (!stmt.body) {
          fail(baseEnv, stmt, 'gstsServer function must have an implementation body')
        }
        const name = stmt.name.text
        if (seen.has(name)) {
          fail(baseEnv, stmt, `duplicate gstsServer function name: ${name}`)
        }
        seen.add(name)
        const symbol = checker.getSymbolAtLocation(stmt.name) ?? null
        out.push({ name, symbol, decl: stmt, fn: stmt })
        continue
      }
      if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          if (!ts.isIdentifier(decl.name)) continue
          const name = decl.name.text
          if (!isGstsServerName(name)) continue
          if (!isFunctionInitializer(decl.initializer)) {
            fail(baseEnv, decl, 'gstsServer function must be declared with a function initializer')
          }
          if (seen.has(name)) {
            fail(baseEnv, decl, `duplicate gstsServer function name: ${name}`)
          }
          seen.add(name)
          const symbol = checker.getSymbolAtLocation(decl.name) ?? null
          out.push({
            name,
            symbol,
            decl,
            fn: decl.initializer
          })
        }
      }
    }
    return out
  })()

  const topLevelGstsClientDecls = (() => {
    const out: {
      name: string
      subType: ClientGraphSubType
      symbol: ts.Symbol | null
      decl: ts.FunctionDeclaration | ts.VariableDeclaration
      fn: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction
    }[] = []
    const seen = new Set<string>()
    for (const stmt of sf.statements) {
      if (ts.isFunctionDeclaration(stmt) && stmt.name) {
        const name = stmt.name.text
        const subType = getClientGraphSubTypeForGstsFunctionName(name)
        if (!subType) continue
        if (!stmt.body) {
          fail(baseEnv, stmt, 'client gsts function must have an implementation body')
        }
        if (seen.has(name)) {
          fail(baseEnv, stmt, `duplicate client gsts function name: ${name}`)
        }
        seen.add(name)
        out.push({
          name,
          subType,
          symbol: checker.getSymbolAtLocation(stmt.name) ?? null,
          decl: stmt,
          fn: stmt
        })
        continue
      }
      if (!ts.isVariableStatement(stmt)) continue
      for (const decl of stmt.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue
        const name = decl.name.text
        const subType = getClientGraphSubTypeForGstsFunctionName(name)
        if (!subType) continue
        if (!isFunctionInitializer(decl.initializer)) {
          fail(baseEnv, decl, 'client gsts function must be declared with a function initializer')
        }
        if (seen.has(name)) {
          fail(baseEnv, decl, `duplicate client gsts function name: ${name}`)
        }
        seen.add(name)
        out.push({
          name,
          subType,
          symbol: checker.getSymbolAtLocation(decl.name) ?? null,
          decl,
          fn: decl.initializer
        })
      }
    }
    return out
  })()

  const validateGstsServerUsage = () => {
    const visit = (node: ts.Node, inServerCtx: boolean) => {
      if (ts.isFunctionDeclaration(node) && isGstsServerName(node.name?.text)) {
        if (!ts.isSourceFile(node.parent)) {
          fail(baseEnv, node, 'gstsServer function must be declared at top-level')
        }
        ts.forEachChild(node, (c) => visit(c, true))
        return
      }
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
        if (isGstsServerName(node.name.text)) {
          if (!isTopLevelVarDeclaration(node)) {
            fail(baseEnv, node, 'gstsServer function must be declared at top-level')
          }
          if (isFunctionInitializer(node.initializer)) {
            visit(node.initializer, true)
            return
          }
        }
      }
      if (ts.isBinaryExpression(node) && isAssignmentLikeOperator(node.operatorToken.kind)) {
        if (ts.isIdentifier(node.left) && isGstsServerName(node.left.text)) {
          fail(
            baseEnv,
            node,
            'gstsServer assignment is not supported (declare a top-level function)'
          )
        }
      }
      if (ts.isCallExpression(node)) {
        const isServerFunctionCall = isCachedGstsServerCall(node)
        if (isServerFunctionCall && !inServerCtx) {
          fail(
            baseEnv,
            node,
            'gstsServer call is only allowed inside g.server().on/onSignal or another gstsServer* function'
          )
        }
      }
      if (
        ts.isCallExpression(node) &&
        isServerOnCall(node, checker) &&
        node.arguments.length >= 2
      ) {
        visit(node.expression, inServerCtx)
        node.arguments.forEach((arg, idx) => {
          if (idx === 1 && (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))) {
            visit(arg, true)
          } else {
            visit(arg, inServerCtx)
          }
        })
        return
      }
      ts.forEachChild(node, (c) => visit(c, inServerCtx))
    }
    visit(sf, false)
  }

  const validateGstsClientUsage = () => {
    const visit = (node: ts.Node, clientSubType: ClientGraphSubType | undefined) => {
      if (ts.isFunctionDeclaration(node) && node.name) {
        const subType = getClientGraphSubTypeForGstsFunctionName(node.name.text)
        if (subType) {
          if (!ts.isSourceFile(node.parent)) {
            fail(baseEnv, node, 'client gsts function must be declared at top-level')
          }
          ts.forEachChild(node, (child) => visit(child, subType))
          return
        }
      }

      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
        const subType = getClientGraphSubTypeForGstsFunctionName(node.name.text)
        if (subType) {
          if (!isTopLevelVarDeclaration(node)) {
            fail(baseEnv, node, 'client gsts function must be declared at top-level')
          }
          if (isFunctionInitializer(node.initializer)) {
            visit(node.initializer, subType)
            return
          }
        }
      }

      if (ts.isBinaryExpression(node) && isAssignmentLikeOperator(node.operatorToken.kind)) {
        if (
          ts.isIdentifier(node.left) &&
          getClientGraphSubTypeForGstsFunctionName(node.left.text)
        ) {
          fail(
            baseEnv,
            node,
            'client gsts function assignment is not supported (declare a top-level function)'
          )
        }
      }

      if (ts.isPropertyAccessExpression(node)) {
        const namespaceSubType = getGstsClientNamespaceSubType(baseEnv, node)
        if (namespaceSubType === 'server' && clientSubType) {
          fail(baseEnv, node, 'gsts.f/gsts.fServer is not available in client graph scope')
        }
        if (
          namespaceSubType &&
          namespaceSubType !== 'server' &&
          namespaceSubType !== clientSubType
        ) {
          fail(
            baseEnv,
            node,
            `gsts.${node.name.text} is only available in matching ${namespaceSubType} client graph scope`
          )
        }
      }

      if (ts.isCallExpression(node)) {
        const targetSubType = getCachedClientCallSubType(node)
        if (targetSubType && targetSubType !== clientSubType) {
          fail(
            baseEnv,
            node,
            `client gsts function for ${targetSubType} can only be called from the same client graph family`
          )
        }

        const clientInfo = getClientOnCallInfo(node, checker)
        if (clientInfo) {
          visit(node.expression, clientSubType)
          node.arguments.forEach((arg, index) => {
            if (index === 1 && arg === clientInfo.handler) {
              visit(arg, clientInfo.subType)
            } else {
              visit(arg, clientSubType)
            }
          })
          return
        }
      }

      ts.forEachChild(node, (child) => visit(child, clientSubType))
    }

    visit(sf, undefined)
  }

  const detectGstsServerRecursion = () => {
    const bySymbol = new Set<ts.Symbol>()
    for (const info of topLevelGstsServerDecls) {
      if (!info.symbol) continue
      bySymbol.add(info.symbol)
    }
    if (bySymbol.size === 0) return

    const edges = new Map<ts.Symbol, { target: ts.Symbol; call: ts.CallExpression }[]>()

    for (const info of topLevelGstsServerDecls) {
      if (!info.symbol) continue
      const calls: { target: ts.Symbol; call: ts.CallExpression }[] = []
      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const sym = getCachedCallSymbol(node)
          if (sym) {
            const target = getResolvedSymbol(sym)
            if (bySymbol.has(target)) {
              calls.push({ target, call: node })
            }
          }
        }
        ts.forEachChild(node, visit)
      }
      const body = info.fn.body
      if (body) visit(body)
      edges.set(info.symbol, calls)
    }

    const state = new Map<ts.Symbol, 0 | 1 | 2>()

    const dfs = (sym: ts.Symbol) => {
      state.set(sym, 1)
      const list = edges.get(sym) ?? []
      for (const edge of list) {
        const st = state.get(edge.target) ?? 0
        if (st === 1) {
          fail(baseEnv, edge.call, 'gstsServer recursion is not supported')
        }
        if (st === 0) dfs(edge.target)
      }
      state.set(sym, 2)
    }

    for (const sym of bySymbol.keys()) {
      const st = state.get(sym) ?? 0
      if (st === 0) dfs(sym)
    }
  }

  const detectGstsClientRecursion = () => {
    const bySymbol = new Set<ts.Symbol>()
    for (const info of topLevelGstsClientDecls) {
      if (info.symbol) bySymbol.add(info.symbol)
    }
    if (bySymbol.size === 0) return

    const edges = new Map<ts.Symbol, { target: ts.Symbol; call: ts.CallExpression }[]>()
    for (const info of topLevelGstsClientDecls) {
      if (!info.symbol) continue
      const calls: { target: ts.Symbol; call: ts.CallExpression }[] = []
      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const symbol = getCachedCallSymbol(node)
          if (symbol) {
            const target = getResolvedSymbol(symbol)
            if (bySymbol.has(target)) calls.push({ target, call: node })
          }
        }
        ts.forEachChild(node, visit)
      }
      if (info.fn.body) visit(info.fn.body)
      edges.set(info.symbol, calls)
    }

    const state = new Map<ts.Symbol, 0 | 1 | 2>()
    const dfs = (symbol: ts.Symbol) => {
      state.set(symbol, 1)
      for (const edge of edges.get(symbol) ?? []) {
        const targetState = state.get(edge.target) ?? 0
        if (targetState === 1) {
          fail(baseEnv, edge.call, 'client gsts function recursion is not supported')
        }
        if (targetState === 0) dfs(edge.target)
      }
      state.set(symbol, 2)
    }

    for (const symbol of bySymbol) {
      if ((state.get(symbol) ?? 0) === 0) dfs(symbol)
    }
  }

  validateGstsServerUsage()
  validateGstsClientUsage()
  detectGstsServerRecursion()
  detectGstsClientRecursion()

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visit = (node: ts.Node): ts.Node => {
      if (
        ts.isCallExpression(node) &&
        isServerOnCall(node, checker) &&
        node.arguments.length >= 2
      ) {
        const handler = node.arguments[1]
        if (ts.isArrowFunction(handler) || ts.isFunctionExpression(handler)) {
          const gstsIdent =
            ts.isBlock(handler.body) && hasTopLevelDeclName(handler.body, 'gsts')
              ? '__gsts'
              : 'gsts'
          const eventArg = node.arguments[0]
          const eventName =
            ts.isStringLiteral(eventArg) || ts.isNoSubstitutionTemplateLiteral(eventArg)
              ? eventArg.text
              : undefined
          const env = makeEnv(gstsIdent, eventName, { graphDocumentType: 'server' })
          validateIterationSourceAssignments(env, handler.body)
          const newHandler = transformHandler(env, context, handler)
          const newArgs = [...node.arguments]
          newArgs[1] = newHandler
          const newCallee = ts.visitNode(node.expression, visit) as ts.Expression
          return ts.factory.updateCallExpression(node, newCallee, node.typeArguments, newArgs)
        }
      }
      if (ts.isCallExpression(node)) {
        const clientInfo = getClientOnCallInfo(node, checker)
        if (clientInfo) {
          const handler = clientInfo.handler
          const gstsIdent =
            ts.isBlock(handler.body) && hasTopLevelDeclName(handler.body, 'gsts')
              ? '__gsts'
              : 'gsts'
          const eventArg = node.arguments[0]
          const eventName =
            ts.isStringLiteral(eventArg) || ts.isNoSubstitutionTemplateLiteral(eventArg)
              ? eventArg.text
              : undefined
          const env = makeEnv(gstsIdent, eventName, {
            graphDocumentType: 'client',
            clientSubType: clientInfo.subType
          })
          validateIterationSourceAssignments(env, handler.body)
          const newHandler = transformHandler(env, context, handler)
          const newArgs = [...node.arguments]
          newArgs[1] = newHandler
          const newCallee = ts.visitNode(node.expression, visit) as ts.Expression
          return ts.factory.updateCallExpression(node, newCallee, node.typeArguments, newArgs)
        }
      }
      if (ts.isFunctionDeclaration(node) && isGstsServerName(node.name?.text)) {
        if (!node.body) return node
        const gstsIdent =
          ts.isBlock(node.body) && hasTopLevelDeclName(node.body, 'gsts') ? '__gsts' : 'gsts'
        const env = makeEnv(gstsIdent, undefined, { graphDocumentType: 'server' })
        validateIterationSourceAssignments(env, node.body)
        return transformGstsServerFunction(env, context, node)
      }
      if (ts.isFunctionDeclaration(node) && node.name) {
        const clientSubType = getClientGraphSubTypeForGstsFunctionName(node.name.text)
        if (clientSubType) {
          if (!node.body) return node
          const gstsIdent = hasTopLevelDeclName(node.body, 'gsts') ? '__gsts' : 'gsts'
          const env = makeEnv(gstsIdent, undefined, {
            graphDocumentType: 'client',
            clientSubType
          })
          validateIterationSourceAssignments(env, node.body)
          return transformGstsServerFunction(env, context, node)
        }
      }
      if (ts.isVariableStatement(node) && ts.isSourceFile(node.parent)) {
        let changed = false
        const decls = node.declarationList.declarations.map((decl) => {
          if (!ts.isIdentifier(decl.name)) return decl
          const isServer = isGstsServerName(decl.name.text)
          const clientSubType = getClientGraphSubTypeForGstsFunctionName(decl.name.text)
          if (!isServer && !clientSubType) return decl
          const init = decl.initializer
          if (!isFunctionInitializer(init)) return decl
          const gstsIdent =
            ts.isBlock(init.body) && hasTopLevelDeclName(init.body, 'gsts') ? '__gsts' : 'gsts'
          const env = isServer
            ? makeEnv(gstsIdent, undefined, { graphDocumentType: 'server' })
            : makeEnv(gstsIdent, undefined, {
                graphDocumentType: 'client',
                clientSubType
              })
          validateIterationSourceAssignments(env, init.body)
          const nextInit = transformGstsServerFunction(env, context, init)
          changed = true
          return ts.factory.updateVariableDeclaration(
            decl,
            decl.name,
            decl.exclamationToken,
            decl.type,
            nextInit
          )
        })
        if (changed) {
          return ts.factory.updateVariableStatement(
            node,
            node.modifiers,
            ts.factory.updateVariableDeclarationList(node.declarationList, decls)
          )
        }
      }
      return ts.visitEachChild(node, visit, context)
    }
    return (root) => ts.visitNode(root, visit) as ts.SourceFile
  }

  const res = ts.transform(sf, [transformer])
  const transformed = res.transformed[0]
  return needsEnumImportRef.value ? ensureEnumImport(transformed) : transformed
}

export function hasServerEntryCall(sf: ts.SourceFile, checker: ts.TypeChecker): boolean {
  let found = false
  const visit = (node: ts.Node) => {
    if (found) return
    if (ts.isCallExpression(node) && isServerOnCall(node, checker) && node.arguments.length >= 2) {
      found = true
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return found
}

export function hasNodeGraphEntryCall(sf: ts.SourceFile, checker: ts.TypeChecker): boolean {
  let found = false
  const visit = (node: ts.Node) => {
    if (found) return
    if (ts.isCallExpression(node)) {
      if (isServerOnCall(node, checker) && node.arguments.length >= 2) {
        found = true
        return
      }
      if (getClientOnCallInfo(node, checker)) {
        found = true
        return
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return found
}
