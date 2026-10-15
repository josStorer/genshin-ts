import { createHash } from 'node:crypto'
import path from 'node:path'

import ts from 'typescript'

import { t } from '../../i18n/index.js'
import { LocatedLuaError } from './tstl-compat.js'

/** Lua 不做访问控制；按声明身份改名，避免不同类的 #value 与普通字段互相覆盖。 */
export function lowerPrivateFields(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  const checker = program.getTypeChecker()
  const names = new Map<ts.Symbol, string>()
  let occupied: Set<string> | undefined
  function privateName(node: ts.PrivateIdentifier) {
    const symbol = checker.getSymbolAtLocation(node)
    if (!symbol?.valueDeclaration)
      throw new LocatedLuaError(node, new Error(t('lua_unsupportedSyntax')))
    let name = names.get(symbol)
    if (name) return name
    if (!occupied) {
      occupied = new Set()
      const collect = (n: ts.Node) => {
        if (ts.isIdentifier(n) || ts.isStringLiteralLike(n)) occupied!.add(n.text)
        ts.forEachChild(n, collect)
      }
      for (const source of program.getSourceFiles()) if (!source.isDeclarationFile) collect(source)
    }
    const declaration = symbol.valueDeclaration
    const file = path
      .relative(program.getCompilerOptions().rootDir ?? '.', declaration.getSourceFile().fileName)
      .replaceAll('\\', '/')
    const identity = `${file}:${declaration.pos}:${node.text}`
    name = `__gsts_private_${createHash('sha256').update(identity).digest('hex').slice(0, 16)}`
    while (occupied.has(name)) name += '_'
    occupied.add(name)
    names.set(symbol, name)
    return name
  }
  return (context) => (source) => {
    if (!source.text.includes('#')) return source
    const visit: ts.Visitor = (node) => {
      if (ts.isPrivateIdentifier(node)) {
        const replacement = context.factory.createIdentifier(privateName(node))
        return ts.setTextRange(ts.setOriginalNode(replacement, node), node)
      }
      return ts.visitEachChild(node, visit, context)
    }
    const transformed = ts.visitEachChild(source, visit, context)
    const parents = (node: ts.Node, parent: ts.Node) => {
      // Keep original parse-tree parents intact for TypeScript's checker.
      if (ts.getOriginalNode(node) !== node)
        Object.defineProperty(node, 'parent', { value: parent, writable: true, configurable: true })
      ts.forEachChild(node, (child) => parents(child, node))
    }
    ts.forEachChild(transformed, (child) => parents(child, transformed))
    return transformed
  }
}
