import ts from 'typescript'

import { t } from '../../i18n/index.js'
import { unwrapExpression } from '../../shared/ts_ast_utils.js'
import { getClientOnCallInfo, isServerOnCall } from '../../shared/ts_graph_calls.js'
import { fail } from './errors.js'
import { isRawWrapperCall, shouldCaptureIdentifier } from './expr.js'
import { getFMethodCall, isFMethodCall } from './matcher.js'
import type { Env } from './types.js'

/** Block callbacks remain native JavaScript; expression callbacks follow expression lowering. */
function blockCallbacks(call: ts.CallExpression): ts.Block[] {
  const blocks: ts.Block[] = []
  for (const arg of call.arguments.slice(1, 3)) {
    const callback = unwrapExpression(arg)
    if (
      (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) &&
      ts.isBlock(callback.body)
    ) {
      blocks.push(callback.body)
    }
  }
  return blocks
}

function enclosingGraphScopes(env: Env, call: ts.CallExpression): Set<ts.Node> {
  const scopes = new Set<ts.Node>()
  for (let node: ts.Node | undefined = call.parent; node; node = node.parent) {
    if (!ts.isFunctionLike(node)) continue
    scopes.add(node)
    const parent = node.parent
    if (
      ts.isCallExpression(parent) &&
      (isServerOnCall(parent, env.checker) || getClientOnCallInfo(parent, env.checker))
    ) {
      break
    }
  }
  return scopes
}

function isStandardLibraryCall(env: Env, call: ts.CallExpression): boolean {
  // Graph globals augment Math's overloads without replacing its native implementation.
  return env.checker
    .getTypeAtLocation(call.expression)
    .getCallSignatures()
    .some((signature) => {
      const source = signature.declaration?.getSourceFile()
      return !!source?.isDeclarationFile && source.hasNoDefaultLib
    })
}

/** The const/let name that stores `node`; reads of it later in the block are graph values too. */
function storedBinding(node: ts.Expression): ts.Identifier | undefined {
  const parent = node.parent
  if (
    ts.isVariableDeclaration(parent) &&
    parent.initializer === node &&
    ts.isIdentifier(parent.name) &&
    ts.isVariableDeclarationList(parent.parent) &&
    parent.parent.flags & (ts.NodeFlags.Const | ts.NodeFlags.Let)
  ) {
    return parent.name
  }
  return undefined
}

function isAllowedGraphValuePosition(env: Env, node: ts.Expression): boolean {
  const parent = node.parent
  // Containers, wrappers and property reads hand the graph value on to the enclosing expression.
  if (ts.isArrayLiteralExpression(parent) || ts.isShorthandPropertyAssignment(parent)) return true
  if (ts.isPropertyAssignment(parent)) return parent.initializer === node
  if (ts.isExpression(parent) && unwrapExpression(parent) !== parent) return true
  if (ts.isPropertyAccessExpression(parent) && parent.expression === node) {
    return parent.name.text !== 'length'
  }
  if (ts.isCallExpression(parent)) {
    if (parent.expression === node) return getFMethodCall(env, parent) !== null
    return parent.arguments.includes(node) && !isStandardLibraryCall(env, parent)
  }
  if (storedBinding(node)) return true
  // Calling a node API for its side effect does not consume its result.
  return ts.isCallExpression(node) && ts.isExpressionStatement(parent)
}

/**
 * Block callbacks of `f.doubleBranch` are not lowered, so graph values inside them may only flow
 * into node API calls, user functions or block-local bindings.
 */
export function validateNativeBranchSyntax(env: Env, call: ts.CallExpression) {
  const graphScopes = enclosingGraphScopes(env, call)
  const isOuterGraphBinding = (symbol: ts.Symbol): boolean => {
    for (let node = symbol.valueDeclaration?.parent; node; node = node.parent) {
      if (ts.isFunctionLike(node)) return graphScopes.has(node)
    }
    return false
  }

  for (const block of blockCallbacks(call)) {
    const graphBindings = new Set<ts.Symbol>()
    const isGraphIdentifier = (id: ts.Identifier): boolean => {
      if (!shouldCaptureIdentifier(id)) return false
      const symbol = ts.isShorthandPropertyAssignment(id.parent)
        ? env.checker.getShorthandAssignmentValueSymbol(id.parent)
        : env.checker.getSymbolAtLocation(id)
      return !!symbol && (isOuterGraphBinding(symbol) || graphBindings.has(symbol))
    }

    /** Whether `node` hands a graph value to its parent. */
    const visit = (node: ts.Node): boolean => {
      if (ts.isTypeNode(node) || ts.isFunctionLike(node)) return false
      if (ts.isCallExpression(node)) {
        if (isRawWrapperCall(node)) return false
        // Nested native blocks share the same graph bindings, not a new compiled graph scope.
        if (isFMethodCall(env, node, ['doubleBranch'])) {
          for (const nested of blockCallbacks(node)) visit(nested)
        }
      }

      let usesGraphValue = ts.isIdentifier(node) && isGraphIdentifier(node)
      ts.forEachChild(node, (child) => {
        if (visit(child)) usesGraphValue = true
      })
      if (ts.isCallExpression(node) && getFMethodCall(env, node)) usesGraphValue = true
      if (!usesGraphValue) return false
      // Property values carry graph dependencies to their containing object literal.
      if (ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) return true
      if (!ts.isExpression(node)) return false

      if (!isAllowedGraphValuePosition(env, node)) fail(env, node.parent, t('nativeBranchSyntax'))
      const binding = storedBinding(node)
      const symbol = binding && env.checker.getSymbolAtLocation(binding)
      if (symbol) graphBindings.add(symbol)
      return true
    }
    visit(block)
  }
}
