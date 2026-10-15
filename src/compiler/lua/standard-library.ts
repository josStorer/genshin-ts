import ts from 'typescript'

import { t } from '../../i18n/index.js'
import type { LuaBuiltins } from './builtins.js'
import { diagnostic } from './syntax.js'

/** 每个成员都有 tests/lua/standard-library.mjs 中的执行用例；新增能力先加测试。 */
export const luaStandardLibrary: Readonly<Record<string, readonly string[]>> = {
  Math: [
    'E',
    'LN10',
    'LN2',
    'LOG10E',
    'LOG2E',
    'PI',
    'SQRT1_2',
    'SQRT2',
    'abs',
    'acos',
    'asin',
    'atan',
    'atan2',
    'ceil',
    'cos',
    'exp',
    'floor',
    'log',
    'log10',
    'log2',
    'log1p',
    'max',
    'min',
    'pow',
    'random',
    'round',
    'sign',
    'sin',
    'sqrt',
    'tan',
    'trunc'
  ],
  NumberConstructor: [
    'MAX_SAFE_INTEGER',
    'MIN_SAFE_INTEGER',
    'MAX_VALUE',
    'MIN_VALUE',
    'EPSILON',
    'POSITIVE_INFINITY',
    'NEGATIVE_INFINITY',
    'NaN',
    'isInteger',
    'isNaN',
    'isFinite',
    'parseInt',
    'parseFloat'
  ],
  Number: ['toString', 'toFixed'],
  StringConstructor: ['fromCharCode'],
  String: [
    'length',
    'replace',
    'replaceAll',
    'concat',
    'indexOf',
    'substr',
    'substring',
    'slice',
    'toLowerCase',
    'toUpperCase',
    'trim',
    'trimEnd',
    'trimRight',
    'trimStart',
    'trimLeft',
    'split',
    'charAt',
    'charCodeAt',
    'startsWith',
    'endsWith',
    'includes',
    'repeat',
    'padStart',
    'padEnd',
    'toString'
  ],
  ArrayConstructor: ['from', 'isArray', 'of'],
  Array: [
    'length',
    'at',
    'concat',
    'entries',
    'fill',
    'push',
    'reverse',
    'shift',
    'unshift',
    'sort',
    'pop',
    'forEach',
    'find',
    'findIndex',
    'includes',
    'indexOf',
    'map',
    'filter',
    'reduce',
    'reduceRight',
    'some',
    'every',
    'slice',
    'splice',
    'join',
    'flat',
    'flatMap'
  ],
  ObjectConstructor: ['assign', 'defineProperty', 'entries', 'fromEntries', 'keys', 'values'],
  Object: ['hasOwnProperty'],
  MapConstructor: [],
  Map: ['size', 'clear', 'delete', 'entries', 'forEach', 'get', 'has', 'keys', 'set', 'values'],
  SetConstructor: [],
  Set: ['size', 'add', 'clear', 'delete', 'entries', 'forEach', 'has', 'keys', 'values']
}

export const unavailableLuaGlobals = [
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'queueMicrotask',
  'Promise',
  'WeakMap',
  'WeakSet',
  'Date',
  'RegExp',
  'JSON',
  'fetch',
  'window',
  'document',
  'process',
  'Buffer'
] as const

function valueReference(node: ts.Identifier) {
  const parent = node.parent
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return false
  if (ts.isPropertyAssignment(parent) && parent.name === node) return false
  if (
    ('name' in parent && parent.name === node && !ts.isShorthandPropertyAssignment(parent)) ||
    ts.isTypeReferenceNode(parent) ||
    ts.isImportSpecifier(parent)
  )
    return false
  return true
}

/** 与 getLuaDiagnostics 一起用于构建、ESLint 和编辑器；不加载 TSTL。 */
export function standardLibraryDiagnostic(
  node: ts.Node,
  checker: ts.TypeChecker,
  builtins: LuaBuiltins
) {
  if (
    ts.isIdentifier(node) &&
    valueReference(node) &&
    unavailableLuaGlobals.some((name) => name === node.text)
  ) {
    const symbol = builtins.symbolAt(node)
    // 未声明的宿主全局也报说明性错误；有局部声明时尊重用户代码。
    if (
      !symbol ||
      (builtins.global(node) === node.text &&
        symbol.declarations?.every((d) => d.getSourceFile().isDeclarationFile))
    )
      return {
        ...diagnostic(node, t('lua_unavailableGlobal', { arg0: node.text })),
        source: 'lua-unavailable-global'
      }
  }
  if (ts.isNewExpression(node) && builtins.standardType(node.expression) === 'BooleanConstructor')
    return { ...diagnostic(node, t('lua_booleanObject')), source: 'lua-standard-library' }
  if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
    if (
      ts.isPropertyAccessExpression(node) &&
      builtins.global(node.expression) === 'globalThis' &&
      unavailableLuaGlobals.some((name) => name === node.name.text)
    )
      return {
        ...diagnostic(node, t('lua_unavailableGlobal', { arg0: node.name.text })),
        source: 'lua-unavailable-global'
      }
    const member = builtins.standardMember(node)
    if (member && !member.supported)
      return {
        ...diagnostic(node, t('lua_unsupportedMember', { arg0: `${member.owner}.${member.name}` })),
        source: 'lua-standard-library'
      }
    if (
      member &&
      checker.getTypeAtLocation(node).getCallSignatures().length &&
      !(ts.isCallExpression(node.parent) && node.parent.expression === node)
    )
      return { ...diagnostic(node, t('lua_builtinMethodValue')), source: 'lua-standard-library' }
    if (ts.isElementAccessExpression(node)) {
      const owner = builtins.standardType(node.expression)
      const index = checker.getTypeAtLocation(node.argumentExpression)
      if (
        owner &&
        !((owner === 'Array' || owner === 'String') && !!(index.flags & ts.TypeFlags.NumberLike))
      )
        return { ...diagnostic(node, t('lua_builtinMethodValue')), source: 'lua-standard-library' }
    }
  }
  if (
    ts.isBindingElement(node) &&
    ts.isObjectBindingPattern(node.parent) &&
    ts.isVariableDeclaration(node.parent.parent) &&
    node.parent.parent.initializer
  ) {
    const receiver = checker.getTypeAtLocation(node.parent.parent.initializer)
    const name = node.propertyName ?? node.name
    if (ts.isIdentifier(name)) {
      const member = builtins.standardMemberSymbol(receiver.getProperty(name.text))
      if (member)
        return { ...diagnostic(node, t('lua_builtinMethodValue')), source: 'lua-standard-library' }
    }
  }
  return undefined
}
