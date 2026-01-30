import type { Rule } from 'eslint'

import { isIdentifier } from '../utils/ast.js'
import { formatMessage } from '../utils/messages.js'
import { readBaseOptions } from '../utils/options.js'
import { buildServerScopeIndex } from '../utils/scope.js'

type Options = {
  timerMethods?: string[]
  allowTopLevel?: boolean
  allowIdentifiers?: string[]
  allowOuterEventParam?: boolean
  lang?: 'zh' | 'en' | 'both'
  scope?: 'server' | 'all'
  includeNestedFunctions?: boolean
}

const DEFAULTS: Required<Options> = {
  timerMethods: ['setTimeout', 'setInterval'],
  allowTopLevel: true,
  allowIdentifiers: [],
  allowOuterEventParam: false,
  lang: 'both',
  scope: 'server',
  includeNestedFunctions: true
}

function isTimerCall(node: any, methods: Set<string>): boolean {
  const callee = node.callee
  if (!callee) return false
  if (callee.type === 'Identifier' && methods.has(callee.name)) return true
  if (callee.type === 'MemberExpression' && !callee.computed) {
    if (isIdentifier(callee.object, 'globalThis') && isIdentifier(callee.property)) {
      return methods.has(callee.property.name)
    }
  }
  return false
}

function resolveCallbackNode(arg: any, scope: any): any | null {
  if (!arg) return null
  if (arg.type === 'FunctionExpression' || arg.type === 'ArrowFunctionExpression') return arg
  if (arg.type !== 'Identifier') return null
  let cur = scope
  while (cur) {
    const variable = cur.set?.get(arg.name)
    if (variable) {
      for (const def of variable.defs ?? []) {
        if (def.type === 'FunctionName' && def.node?.type === 'FunctionDeclaration') {
          return def.node
        }
        if (def.type === 'Variable' && def.node?.type === 'VariableDeclarator') {
          const init = def.node.init
          if (init?.type === 'FunctionExpression' || init?.type === 'ArrowFunctionExpression') {
            return init
          }
        }
      }
      break
    }
    cur = cur.upper
  }
  return null
}

function findParentFunction(node: any): any | null {
  let cur = node?.parent
  while (cur) {
    if (
      cur.type === 'FunctionDeclaration' ||
      cur.type === 'FunctionExpression' ||
      cur.type === 'ArrowFunctionExpression'
    ) {
      return cur
    }
    cur = cur.parent
  }
  return null
}

function isFunctionNode(node: any): boolean {
  return (
    node?.type === 'FunctionDeclaration' ||
    node?.type === 'FunctionExpression' ||
    node?.type === 'ArrowFunctionExpression'
  )
}

function findNearestServerScopeFunction(
  node: any,
  scopeIndex: ReturnType<typeof buildServerScopeIndex>
) {
  let cur = node
  while (cur) {
    if (isFunctionNode(cur) && scopeIndex.isServerScopeFunction(cur)) return cur
    cur = cur.parent
  }
  return null
}

function getParamName(param: any): string | null {
  return param?.type === 'Identifier' ? param.name : null
}

function resolveDefaultTimerNames(
  callNode: any,
  scopeIndex: ReturnType<typeof buildServerScopeIndex>
) {
  const serverFn = findNearestServerScopeFunction(callNode, scopeIndex)
  const params = serverFn?.params ?? []
  const defaultEvt = getParamName(params[0]) ?? 'evt'
  const defaultF = getParamName(params[1]) ?? 'f'
  return { defaultEvt, defaultF }
}

function resolveServerEventParam(
  callNode: any,
  scopeIndex: ReturnType<typeof buildServerScopeIndex>,
  sourceCode: any
): { name: string; variable: any } | null {
  const serverFn = findNearestServerScopeFunction(callNode, scopeIndex)
  const param = serverFn?.params?.[0]
  const name = getParamName(param)
  if (!serverFn || !name) return null
  const serverScope = sourceCode.getScope(serverFn)
  const variable = serverScope?.set?.get(name)
  if (!variable) return null
  return { name, variable }
}

function getVisitorKeys(sourceCode: any): Record<string, string[]> {
  return sourceCode?.visitorKeys ?? {}
}

function resolveImplicitTimerNames(
  callback: any,
  callNode: any,
  scopeIndex: ReturnType<typeof buildServerScopeIndex>
): Set<string> {
  const { defaultEvt, defaultF } = resolveDefaultTimerNames(callNode, scopeIndex)
  const params = callback?.params ?? []
  const p0 = getParamName(params[0])
  const p1 = getParamName(params[1])

  let evtName = p0 ?? defaultEvt
  let fName = p1 ?? defaultF

  if (!p1 && p0 && p0 === defaultF) {
    evtName = defaultEvt
    fName = defaultF
  }

  const implicit = new Set<string>()
  if (!p0) implicit.add(evtName)
  if (!p1) {
    const fDeclaredAsP0 = p0 && p0 === fName
    if (!fDeclaredAsP0) implicit.add(fName)
  }
  return implicit
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          timerMethods: { type: 'array', items: { type: 'string' } },
          allowTopLevel: { type: 'boolean' },
          allowIdentifiers: { type: 'array', items: { type: 'string' } },
          allowOuterEventParam: { type: 'boolean' },
          lang: { enum: ['zh', 'en', 'both'] },
          scope: { enum: ['server', 'all'] },
          includeNestedFunctions: { type: 'boolean' }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const raw = (context.options[0] ?? {}) as Options
    const options = readBaseOptions(raw, DEFAULTS)
    const scopeIndex = buildServerScopeIndex(context)
    const sourceCode = context.sourceCode ?? context.getSourceCode()
    const scopeManager = sourceCode.scopeManager
    const methods = new Set(options.timerMethods)
    const message = formatMessage(
      options.lang,
      '定时器回调不能跨层级捕获外层局部变量, 仅限一层捕获, 如需要获取跨层变量, 请使用let赋值转存到本层',
      'Timer callbacks must not capture outer locals across multiple levels; only one-level capture is allowed. Use `let` to reassign and store values in the current level if needed.'
    )
    const outerEventMessage = formatMessage(
      options.lang,
      '定时器回调不应直接使用外层事件参数, 请先转存到局部变量, 或显式声明定时器回调参数',
      'Timer callbacks should not use the outer event parameter directly; store it in a local variable or declare timer callback parameters.'
    )
    const outerTimerEventMessage = formatMessage(
      options.lang,
      '定时器回调不应直接使用外层定时器事件参数, 请先转存到局部变量, 或显式声明定时器回调参数',
      'Timer callbacks should not use outer timer event parameters directly; store them in a local variable or declare timer callback parameters.'
    )

    const timerCallbackEvents = new Map<any, { name: string; variable: any }>()

    const registerTimerCallback = (callNode: any) => {
      const callback = resolveCallbackNode(callNode.arguments?.[0], sourceCode.getScope(callNode))
      if (!callback) return
      const params = callback?.params ?? []
      const name = getParamName(params[0])
      if (!name) return
      const cbScope = sourceCode.getScope(callback)
      const variable = cbScope?.set?.get(name)
      if (!variable) return
      timerCallbackEvents.set(callback, { name, variable })
    }

    const isTopLevelScope = (scope: any): boolean => {
      if (!scope) return false
      return scope.type === 'global' || scope.type === 'module'
    }

    const collectScopes = (root: any): Set<any> => {
      const result = new Set<any>()
      const stack = [root]
      while (stack.length) {
        const scope = stack.pop()
        if (!scope || result.has(scope)) continue
        result.add(scope)
        for (const child of scope.childScopes ?? []) {
          if (
            child.block !== root.block &&
            child.block?.type &&
            /Function/.test(child.block.type)
          ) {
            continue
          }
          stack.push(child)
        }
      }
      return result
    }

    const isScopeWithin = (scope: any, ancestor: any): boolean => {
      let cur = scope
      while (cur) {
        if (cur === ancestor) return true
        cur = cur.upper
      }
      return false
    }

    const reportOuterCaptures = (fnNode: any, implicitNames: Set<string>) => {
      if (!scopeManager) return
      const fnScope = sourceCode.getScope(fnNode)
      if (!fnScope) return
      const parentFn = findParentFunction(fnNode)
      const parentScope = parentFn ? sourceCode.getScope(parentFn) : null
      const reported = new Set<string>()
      const allowNames = new Set([...options.allowIdentifiers, ...implicitNames])

      for (const scope of collectScopes(fnScope)) {
        for (const ref of scope.through ?? []) {
          if (ref.identifier?.name && allowNames.has(ref.identifier.name)) continue
          const resolved = ref.resolved
          if (!resolved) continue
          const targetScope = resolved.scope
          if (options.allowTopLevel && isTopLevelScope(targetScope)) continue
          if (isScopeWithin(targetScope, fnScope)) continue
          if (parentScope && isScopeWithin(targetScope, parentScope)) continue
          const id = ref.identifier
          const key = `${id.range?.[0] ?? id.start}-${id.range?.[1] ?? id.end}`
          if (reported.has(key)) continue
          reported.add(key)
          context.report({ node: id, message })
        }
      }
    }

    const reportOuterEventParamUsage = (fnNode: any, callNode: any) => {
      if (options.allowOuterEventParam) return
      if (!scopeManager) return
      const info = resolveServerEventParam(callNode, scopeIndex, sourceCode)
      if (!info) return
      const fnScope = sourceCode.getScope(fnNode)
      if (!fnScope) return
      const reported = new Set<string>()
      for (const scope of collectScopes(fnScope)) {
        for (const ref of scope.through ?? []) {
          const id = ref.identifier
          if (!id || id.name !== info.name) continue
          if (ref.resolved !== info.variable) continue
          const key = `${id.range?.[0] ?? id.start}-${id.range?.[1] ?? id.end}`
          if (reported.has(key)) continue
          reported.add(key)
          context.report({ node: id, message: outerEventMessage })
        }
      }
    }

    const reportOuterTimerEventParamUsage = (fnNode: any) => {
      if (options.allowOuterEventParam) return
      if (!scopeManager) return
      const fnScope = sourceCode.getScope(fnNode)
      if (!fnScope) return
      const outerInfos: { name: string; variable: any }[] = []
      let cur = findParentFunction(fnNode)
      while (cur) {
        const info = timerCallbackEvents.get(cur)
        if (info) outerInfos.push(info)
        cur = findParentFunction(cur)
      }
      if (outerInfos.length === 0) return
      const reported = new Set<string>()
      for (const scope of collectScopes(fnScope)) {
        for (const ref of scope.through ?? []) {
          const id = ref.identifier
          if (!id) continue
          for (const info of outerInfos) {
            if (ref.resolved !== info.variable) continue
            const key = `${id.range?.[0] ?? id.start}-${id.range?.[1] ?? id.end}`
            if (reported.has(key)) continue
            reported.add(key)
            context.report({ node: id, message: outerTimerEventMessage })
          }
        }
      }
    }

    if (scopeManager) {
      const visitorKeys = getVisitorKeys(sourceCode)
      const stack: any[] = [sourceCode.ast as any]
      while (stack.length) {
        const node = stack.pop() as any
        if (!node || typeof node.type !== 'string') continue
        if (node.type === 'CallExpression' && isTimerCall(node, methods)) {
          registerTimerCallback(node)
        }
        const keys = visitorKeys[node.type] ?? []
        for (const key of keys) {
          const value = (node as any)[key]
          if (!value) continue
          if (Array.isArray(value)) {
            for (const child of value) {
              if (child && typeof child.type === 'string') stack.push(child)
            }
          } else if (value && typeof value.type === 'string') {
            stack.push(value)
          }
        }
      }
    }

    return {
      CallExpression(node) {
        if (!scopeIndex.isInServerScope(node, options)) return
        if (!isTimerCall(node, methods)) return
        const callback = resolveCallbackNode(node.arguments?.[0], sourceCode.getScope(node))
        if (!callback) return
        const implicitNames = resolveImplicitTimerNames(callback, node, scopeIndex)
        reportOuterCaptures(callback, implicitNames)
        reportOuterEventParamUsage(callback, node)
        reportOuterTimerEventParamUsage(callback)
      }
    }
  }
}

export default rule
