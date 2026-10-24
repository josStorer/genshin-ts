import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import ts from 'typescript'

import { luaStandardLibrary, luaTimerGlobals, unavailableLuaGlobals } from './standard_library.js'

const tables = new WeakMap<ts.Program, LuaBuiltins>()
const packageRoot = path.dirname(createRequire(import.meta.url).resolve('genshin-ts/package.json'))
function realFile(file: string) {
  const resolved = fs.existsSync(file) ? fs.realpathSync.native(file) : path.resolve(file)
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved
}
const sdkFiles = new Map(
  [
    ['lua.d.ts', 'helpers'],
    ['lua_core.d.ts', 'core'],
    ['lua_entry.d.ts', 'entry']
  ].map(([file, kind]) => [realFile(path.join(packageRoot, 'dist/src/runtime', file)), kind])
)
const sdkFileNames = new Set(['lua.d.ts', 'lua_core.d.ts', 'lua_entry.d.ts'])

/** 实例 helper 的名称到作用域方法；声明 symbol 是唯一识别依据。 */
export const scopedHelperMethods: Readonly<Record<string, string>> = {
  listenKey: 'listenKey',
  listenCursor: 'listenCursor',
  clockTimeout: 'setTimeoutOnClock',
  clockInterval: 'setIntervalOnClock'
}
const helperMembers: Readonly<Record<string, string>> = {
  findScript: 'findScript',
  requireScript: 'requireScript',
  readParams: 'readParams',
  listenKey: 'listenKey',
  listenCursor: 'listenCursor',
  setTimeout: 'clockTimeout',
  setInterval: 'clockInterval'
}

export const numberConstants: Readonly<Record<string, number>> = {
  MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
  MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
  MAX_VALUE: Number.MAX_VALUE,
  MIN_VALUE: Number.MIN_VALUE,
  EPSILON: Number.EPSILON
}

function resolveBuiltins(program: ts.Program) {
  const checker = program.getTypeChecker()
  const globals = new Map<ts.Symbol, string>()
  for (const name of [
    'self',
    'send',
    'console',
    'Number',
    'Boolean',
    'BigInt',
    'Math',
    'String',
    'Array',
    'Object',
    'Map',
    'Set',
    'globalThis',
    ...luaTimerGlobals,
    ...unavailableLuaGlobals
  ]) {
    const symbol = checker.resolveName(name, undefined, ts.SymbolFlags.Value, false)
    if (symbol) globals.set(symbol, name)
  }
  const members = new Map<ts.Symbol, string>()
  const standardTypes = new Map<ts.Symbol, string>()
  const standardMembers = new Map<ts.Symbol, { owner: string; name: string; supported: boolean }>()
  for (const name of [
    ...Object.keys(luaStandardLibrary),
    'ReadonlyArray',
    'ReadonlyMap',
    'ReadonlySet',
    'BooleanConstructor'
  ]) {
    const symbol = checker.resolveName(name, undefined, ts.SymbolFlags.Type, false)
    if (!symbol?.declarations?.some((d) => d.getSourceFile().hasNoDefaultLib)) continue
    const owner = name.replace(/^Readonly/, '')
    standardTypes.set(symbol, owner)
    for (const property of checker.getDeclaredTypeOfSymbol(symbol).getProperties())
      standardMembers.set(property, {
        owner,
        name: property.name,
        supported: luaStandardLibrary[owner]?.includes(property.name) ?? false
      })
  }
  const modules = new Map<ts.Symbol, string>()
  let clientGlobals: ts.Symbol | undefined
  let entry: ts.Symbol | undefined
  // SDK 文件只在建表时定位一次；访问器比较 symbol，不依赖用户变量名或接口同名。
  for (const source of program.getSourceFiles()) {
    // 名称仅用于快速排除；候选仍必须通过下方的包内真实路径核验。
    if (!source.isDeclarationFile || !sdkFileNames.has(path.basename(source.fileName))) continue
    const kind = sdkFiles.get(realFile(source.fileName))
    if (!kind) continue
    const module = checker.getSymbolAtLocation(source)
    if (!module) continue
    modules.set(module, kind)
    for (const symbol of checker.getExportsOfModule(module)) {
      if (kind === 'helpers' && helperMembers[symbol.name])
        members.set(symbol, helperMembers[symbol.name])
      if (kind === 'entry' && symbol.name === 'clientControlScript') entry = symbol
      if (kind === 'helpers' && symbol.name === 'ClientGlobals') {
        clientGlobals = symbol
        const type = checker.getDeclaredTypeOfSymbol(symbol)
        for (const name of ['self', 'script', 'helper', 'require', 'onSignal', 'onVariable']) {
          const member = type.getProperty(name)
          if (member) members.set(member, name)
        }
        const script = type.getProperty('script')
        const handler =
          script &&
          checker
            .getTypeOfSymbolAtLocation(script, source)
            .getProperty('RegisterServerSignalHandler')
        if (handler) members.set(handler, 'rawSignalHandler')
        const variableHandler =
          script &&
          checker
            .getTypeOfSymbolAtLocation(script, source)
            .getProperty('RegisterCustomVariableChangedHandler')
        if (variableHandler) members.set(variableHandler, 'rawVariableHandler')
        const update =
          script && checker.getTypeOfSymbolAtLocation(script, source).getProperty('EnableUpdate')
        if (update) members.set(update, 'enableUpdate')
      }
      if (kind === 'helpers' && symbol.name === 'ClientHelpers') {
        for (const [name, key] of Object.entries(helperMembers)) {
          const member = checker.getDeclaredTypeOfSymbol(symbol).getProperty(name)
          if (member) members.set(member, key)
        }
      }
    }
  }
  function symbolAt(node: ts.Node) {
    let symbol = checker.getSymbolAtLocation(node)
    if (!symbol && ts.isElementAccessExpression(node)) {
      const key = checker.getTypeAtLocation(node.argumentExpression)
      if (key.isStringLiteral())
        symbol = checker.getTypeAtLocation(node.expression).getProperty(key.value)
    }
    return symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
  }
  function standardMemberSymbol(symbol: ts.Symbol | undefined) {
    if (!symbol) return undefined
    const direct = standardMembers.get(symbol)
    if (direct) return direct
    for (const declaration of symbol.declarations ?? []) {
      if (!('name' in declaration) || !declaration.name) continue
      const original = checker.getSymbolAtLocation(declaration.name as ts.Node)
      if (original && standardMembers.has(original)) return standardMembers.get(original)
      if (ts.isInterfaceDeclaration(declaration.parent)) {
        const ownerSymbol = checker.getSymbolAtLocation(declaration.parent.name)
        const owner = ownerSymbol && standardTypes.get(ownerSymbol)
        if (owner)
          return {
            owner,
            name: symbol.name,
            supported: luaStandardLibrary[owner]?.includes(symbol.name) ?? false
          }
      }
    }
    return undefined
  }
  return {
    globals,
    members,
    modules,
    clientGlobals,
    entry,
    symbolAt,
    standardMemberSymbol,
    standardMember(node: ts.PropertyAccessExpression | ts.ElementAccessExpression) {
      const name = ts.isPropertyAccessExpression(node)
        ? node.name.text
        : ts.isStringLiteralLike(node.argumentExpression)
          ? node.argumentExpression.text
          : undefined
      return standardMemberSymbol(
        symbolAt(node) ??
          (name ? checker.getTypeAtLocation(node.expression).getProperty(name) : undefined)
      )
    },
    /** 只接管当前入口的 script；查询到的其他脚本仍调用官方方法。 */
    isCurrentScript(node: ts.Expression): boolean {
      const seen = new Set<ts.Symbol>()
      let current = node
      while (true) {
        const symbol = symbolAt(current)
        if (symbol && members.get(symbol) === 'script') return true
        if (!symbol || seen.has(symbol)) return false
        seen.add(symbol)
        const declaration = symbol.valueDeclaration
        if (declaration && ts.isVariableDeclaration(declaration) && declaration.initializer) {
          current = declaration.initializer
          continue
        }
        if (
          declaration &&
          ts.isBindingElement(declaration) &&
          ts.isObjectBindingPattern(declaration.parent)
        ) {
          const initializer = declaration.parent.parent
          const key = declaration.propertyName ?? declaration.name
          if (
            ts.isVariableDeclaration(initializer) &&
            initializer.initializer &&
            ts.isIdentifier(key)
          ) {
            const type = checker.getTypeAtLocation(initializer.initializer)
            const property = type.getProperty(key.text)
            return property !== undefined && members.get(property) === 'script'
          }
        }
        return false
      }
    },
    standardType(node: ts.Expression) {
      const type = checker.getTypeAtLocation(node)
      return type.getSymbol() && standardTypes.get(type.getSymbol()!)
    },
    global(node: ts.Node) {
      const symbol = symbolAt(node)
      return symbol && globals.get(symbol)
    },
    member(node: ts.Node) {
      const symbol = symbolAt(node)
      return symbol && members.get(symbol)
    },
    isEntryCall(node: ts.CallExpression) {
      const declaration = checker.getResolvedSignature(node)?.declaration
      return (
        !!entry &&
        !!declaration &&
        'name' in declaration &&
        !!declaration.name &&
        symbolAt(declaration.name) === entry
      )
    }
  }
}
export type LuaBuiltins = ReturnType<typeof resolveBuiltins>

/** 每个 Program 一份；增量 Program 和编辑器的新类型检查器不会复用旧 symbol。 */
export function getLuaBuiltins(program: ts.Program): LuaBuiltins {
  let table = tables.get(program)
  if (!table) {
    table = resolveBuiltins(program)
    tables.set(program, table)
  }
  return table
}
