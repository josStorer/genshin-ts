import type { Rule } from 'eslint'
import ts from 'typescript'

import { getClientGraphSubTypeForGstsFunctionName } from '../../definitions/client_graph_modes.js'
import {
  getClientOnCallInfo,
  isServerOnCall,
  type ClientOnCallInfo
} from '../../shared/ts_graph_calls.js'
import { getSourceCode, requireParserServices } from './parser.js'
import { DEFAULT_GSTS_SERVER_PREFIX, isGstsServerName } from './ts_matchers.js'

type RuleContext = Rule.RuleContext

export type ClientScopeInfo = Pick<ClientOnCallInfo, 'subType'> & {
  kind: 'handler' | 'helper'
  /** Handler's client flow-function parameter, when one was declared. */
  fName?: string
}

export type NodeGraphScopeIndex = {
  serverScopeRoots: WeakSet<object>
  clientScopeRoots: WeakMap<object, ClientScopeInfo>
  isServerScopeFunction(node: unknown): boolean
  isClientScopeFunction(node: unknown): boolean
  getClientScopeInfo(node: unknown): ClientScopeInfo | undefined
  getEnclosingClientScope(
    node: unknown,
    options?: { includeNestedFunctions?: boolean }
  ): ClientScopeInfo | undefined
  isInNodeGraphScope(node: unknown, options: NodeGraphScopeOptions): boolean
  isInServerScope(node: unknown, options: ServerScopeOptions): boolean
}

export type NodeGraphScopeOptions = {
  scope: 'server' | 'client' | 'nodegraph' | 'all'
  includeNestedFunctions: boolean
}

export type ServerScopeIndex = NodeGraphScopeIndex
export type ServerScopeOptions = NodeGraphScopeOptions

function isFunctionNode(node: any): boolean {
  return (
    node &&
    (node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression')
  )
}

export function buildNodeGraphScopeIndex(
  context: RuleContext,
  prefixes = [DEFAULT_GSTS_SERVER_PREFIX]
): NodeGraphScopeIndex {
  const services = requireParserServices(context)
  const sourceCode = getSourceCode(context)
  const tsRoot = services.esTreeNodeToTSNodeMap.get(sourceCode.ast) as ts.SourceFile
  const serverScopeRoots = new WeakSet<object>()
  const clientScopeRoots = new WeakMap<object, ClientScopeInfo>()

  const addRoot = (node: ts.Node | undefined) => {
    if (!node) return
    const esNode = services.tsNodeToESTreeNodeMap.get(node)
    if (esNode) serverScopeRoots.add(esNode)
  }

  const addClientRoot = (info: ClientOnCallInfo) => {
    const esNode = services.tsNodeToESTreeNodeMap.get(info.handler)
    if (esNode) {
      const fParam = info.handler.parameters[1]
      clientScopeRoots.set(esNode, {
        subType: info.subType,
        kind: 'handler',
        ...(fParam && ts.isIdentifier(fParam.name) ? { fName: fParam.name.text } : {})
      })
    }
  }

  const addClientFunctionRoot = (node: ts.Node | undefined, name: string | undefined) => {
    const subType = getClientGraphSubTypeForGstsFunctionName(name)
    if (!node || !subType) return false
    const esNode = services.tsNodeToESTreeNodeMap.get(node)
    if (esNode) clientScopeRoots.set(esNode, { subType, kind: 'helper' })
    return true
  }

  for (const stmt of tsRoot.statements) {
    if (ts.isFunctionDeclaration(stmt)) {
      if (addClientFunctionRoot(stmt, stmt.name?.text)) continue
      if (isGstsServerName(stmt.name?.text, prefixes)) addRoot(stmt)
      continue
    }
    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue
        if (
          decl.initializer &&
          (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))
        ) {
          if (addClientFunctionRoot(decl.initializer, decl.name.text)) continue
          if (isGstsServerName(decl.name.text, prefixes)) addRoot(decl.initializer)
        }
      }
    }
  }

  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const checker = services.program.getTypeChecker()
      if (isServerOnCall(node, checker)) {
        const handler = node.arguments[1]
        if (handler && (ts.isArrowFunction(handler) || ts.isFunctionExpression(handler))) {
          addRoot(handler)
        }
      }
      const clientInfo = getClientOnCallInfo(node, checker)
      if (clientInfo) addClientRoot(clientInfo)
    }
    ts.forEachChild(node, visit)
  }
  visit(tsRoot)

  const isServerScopeFunction = (node: unknown) => serverScopeRoots.has(node as object)
  const isClientScopeFunction = (node: unknown) => clientScopeRoots.has(node as object)
  const getClientScopeInfo = (node: unknown) => clientScopeRoots.get(node as object)

  const getEnclosingClientScope = (
    node: unknown,
    options: { includeNestedFunctions?: boolean } = {}
  ): ClientScopeInfo | undefined => {
    let cur: any = node
    let firstFn: any | null = null
    while (cur) {
      if (isFunctionNode(cur)) {
        if (!firstFn) firstFn = cur
        const info = clientScopeRoots.get(cur)
        if (info && (options.includeNestedFunctions !== false || cur === firstFn)) return info
      }
      cur = cur.parent
    }
    return undefined
  }

  const isInNodeGraphScope = (node: unknown, options: NodeGraphScopeOptions): boolean => {
    if (options.scope === 'all') return true
    let cur: any = node
    let firstFn: any | null = null
    while (cur) {
      if (isFunctionNode(cur)) {
        if (!firstFn) firstFn = cur
        const matchesServer = options.scope !== 'client' && serverScopeRoots.has(cur)
        const matchesClient = options.scope !== 'server' && clientScopeRoots.has(cur)
        if (matchesServer || matchesClient) return options.includeNestedFunctions || cur === firstFn
      }
      cur = cur.parent
    }
    return false
  }

  return {
    serverScopeRoots,
    clientScopeRoots,
    isServerScopeFunction,
    isClientScopeFunction,
    getClientScopeInfo,
    getEnclosingClientScope,
    isInNodeGraphScope,
    isInServerScope: isInNodeGraphScope
  }
}

export const buildServerScopeIndex = buildNodeGraphScopeIndex
