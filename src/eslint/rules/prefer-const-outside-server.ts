import type { Rule } from 'eslint'

import { buildServerScopeIndex } from '../utils/scope.js'

const PATTERN_TYPE =
  /^(?:.+?Pattern|RestElement|SpreadProperty|ExperimentalRestProperty|Property)$/u
const DECLARATION_HOST_TYPE = /^(?:Program|BlockStatement|StaticBlock|SwitchCase)$/u
const DESTRUCTURING_HOST_TYPE = /^(?:VariableDeclarator|AssignmentExpression)$/u

function isInitOfForStatement(node: any) {
  return node.parent?.type === 'ForStatement' && node.parent.init === node
}

function canBecomeVariableDeclaration(identifier: any) {
  let node = identifier.parent
  while (node && PATTERN_TYPE.test(node.type)) {
    node = node.parent
  }
  return (
    node?.type === 'VariableDeclarator' ||
    (node?.type === 'AssignmentExpression' &&
      node.parent?.type === 'ExpressionStatement' &&
      DECLARATION_HOST_TYPE.test(node.parent.parent?.type))
  )
}

function getVariableByName(initScope: any, name: string) {
  let scope = initScope
  while (scope) {
    const variable = scope.set.get(name)
    if (variable) return variable
    scope = scope.upper
  }
  return null
}

function isOuterVariableInDestructing(name: string, initScope: any) {
  if (initScope.through.some((ref: any) => ref.resolved && ref.resolved.name === name)) {
    return true
  }
  const variable = getVariableByName(initScope, name)
  if (variable !== null) {
    return variable.defs.some((def: any) => def.type === 'Parameter')
  }
  return false
}

function getDestructuringHost(reference: any) {
  if (!reference.isWrite()) return null
  let node = reference.identifier.parent
  while (node && PATTERN_TYPE.test(node.type)) {
    node = node.parent
  }
  if (!node || !DESTRUCTURING_HOST_TYPE.test(node.type)) return null
  return node
}

function hasMemberExpressionAssignment(node: any): boolean {
  switch (node.type) {
    case 'ObjectPattern':
      return node.properties.some((prop: any) => {
        if (!prop) return false
        return hasMemberExpressionAssignment(prop.argument || prop.value)
      })
    case 'ArrayPattern':
      return node.elements.some((element: any) => element && hasMemberExpressionAssignment(element))
    case 'AssignmentPattern':
      return hasMemberExpressionAssignment(node.left)
    case 'MemberExpression':
      return true
    default:
      return false
  }
}

function getIdentifierIfShouldBeConst(variable: any, ignoreReadBeforeAssign: boolean) {
  if (variable.eslintUsed && variable.scope.type === 'global') return null

  let writer = null
  let isReadBeforeInit = false
  const references = variable.references

  for (let i = 0; i < references.length; ++i) {
    const reference = references[i]

    if (reference.isWrite()) {
      const isReassigned = writer !== null && writer.identifier !== reference.identifier
      if (isReassigned) return null

      const destructuringHost = getDestructuringHost(reference)
      if (destructuringHost !== null && destructuringHost.left !== void 0) {
        const leftNode = destructuringHost.left
        let hasOuterVariables = false
        let hasNonIdentifiers = false

        if (leftNode.type === 'ObjectPattern') {
          const properties = leftNode.properties
          hasOuterVariables = properties
            .filter((prop: any) => prop.value)
            .map((prop: any) => prop.value.name)
            .some((name: string) => isOuterVariableInDestructing(name, variable.scope))
          hasNonIdentifiers = hasMemberExpressionAssignment(leftNode)
        } else if (leftNode.type === 'ArrayPattern') {
          const elements = leftNode.elements
          hasOuterVariables = elements
            .map((element: any) => element && element.name)
            .some((name: string) => isOuterVariableInDestructing(name, variable.scope))
          hasNonIdentifiers = hasMemberExpressionAssignment(leftNode)
        }

        if (hasOuterVariables || hasNonIdentifiers) return null
      }

      writer = reference
    } else if (reference.isRead() && writer === null) {
      if (ignoreReadBeforeAssign) return null
      isReadBeforeInit = true
    }
  }

  const shouldBeConst =
    writer !== null &&
    writer.from === variable.scope &&
    canBecomeVariableDeclaration(writer.identifier)

  if (!shouldBeConst) return null
  if (isReadBeforeInit) return variable.defs[0].name
  return writer.identifier
}

function groupByDestructuring(variables: any[], ignoreReadBeforeAssign: boolean) {
  const identifierMap = new Map()

  for (let i = 0; i < variables.length; ++i) {
    const variable = variables[i]
    const references = variable.references
    const identifier = getIdentifierIfShouldBeConst(variable, ignoreReadBeforeAssign)
    let prevId = null

    for (let j = 0; j < references.length; ++j) {
      const reference = references[j]
      const id = reference.identifier
      if (id === prevId) continue
      prevId = id

      const group = getDestructuringHost(reference)
      if (group) {
        if (identifierMap.has(group)) {
          identifierMap.get(group).push(identifier)
        } else {
          identifierMap.set(group, [identifier])
        }
      }
    }
  }

  return identifierMap
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          destructuring: { enum: ['any', 'all'] },
          ignoreReadBeforeAssign: { type: 'boolean' }
        },
        additionalProperties: false
      }
    ],
    messages: {
      useConst: "'{{name}}' is never reassigned. Use 'const' instead."
    }
  },
  create(context) {
    const opt = (context.options[0] as any) ?? {
      destructuring: 'any',
      ignoreReadBeforeAssign: false
    }
    const { destructuring, ignoreReadBeforeAssign } = opt
    const shouldMatchAnyDestructuredVariable = destructuring !== 'all'
    const sourceCode = context.sourceCode
    const variables: any[] = []
    const scopeIndex = buildServerScopeIndex(context)

    function checkGroup(nodes: any[]) {
      const nodesToReport = nodes.filter(Boolean)

      if (
        nodes.length &&
        (shouldMatchAnyDestructuredVariable || nodesToReport.length === nodes.length)
      ) {
        nodesToReport.forEach((node: any) => {
          context.report({
            node,
            messageId: 'useConst',
            data: node
          })
        })
      }
    }

    return {
      'Program:exit'() {
        groupByDestructuring(variables, ignoreReadBeforeAssign).forEach(checkGroup)
      },
      VariableDeclaration(node: any) {
        if (node.kind !== 'let' || isInitOfForStatement(node)) return
        if (scopeIndex.isInServerScope(node, { scope: 'server', includeNestedFunctions: true }))
          return
        variables.push(...sourceCode.getDeclaredVariables(node))
      }
    }
  }
}

export default rule
