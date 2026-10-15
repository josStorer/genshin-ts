import ts from 'typescript'

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
    'Math',
    'String',
    'Array',
    'Object',
    'Map',
    'Set'
  ]) {
    const symbol = checker.resolveName(name, undefined, ts.SymbolFlags.Value, false)
    if (symbol) globals.set(symbol, name)
  }
  const members = new Map<ts.Symbol, string>()
  const modules = new Map<ts.Symbol, string>()
  let clientGlobals: ts.Symbol | undefined
  let entry: ts.Symbol | undefined
  // SDK 文件只在建表时定位一次；访问器比较 symbol，不依赖用户变量名或接口同名。
  const sdkFiles: Record<string, string> = {
    'lua.d.ts': 'helpers',
    'lua-core.d.ts': 'core',
    'lua-entry.d.ts': 'entry'
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
  return {
    globals,
    members,
    modules,
    clientGlobals,
    entry,
    symbolAt,
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
