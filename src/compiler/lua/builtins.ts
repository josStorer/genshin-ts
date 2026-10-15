import ts from 'typescript'

import { luaStandardLibrary, unavailableLuaGlobals } from './standard-library.js'

const tables = new WeakMap<ts.Program, LuaBuiltins>()

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
  const sdkFiles: Record<string, string> = {
    'lua.d.ts': 'helpers',
    'lua_core.d.ts': 'core',
    'lua_entry.d.ts': 'entry'
  }
  for (const source of program.getSourceFiles()) {
    const kind = sdkFiles[source.fileName.replaceAll('\\', '/').split('/').at(-1)!]
    if (!kind) continue
    const module = checker.getSymbolAtLocation(source)
    if (!module) continue
    modules.set(module, kind)
    for (const symbol of checker.getExportsOfModule(module)) {
      if (kind === 'entry' && symbol.name === 'clientControlScript') entry = symbol
      if (kind === 'helpers' && symbol.name === 'ClientGlobals') {
        clientGlobals = symbol
        const type = checker.getDeclaredTypeOfSymbol(symbol)
        for (const name of ['self', 'helper', 'require']) {
          const member = type.getProperty(name)
          if (member) members.set(member, name)
        }
      }
    }
  }
  function symbolAt(node: ts.Node) {
    const symbol = checker.getSymbolAtLocation(node)
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
