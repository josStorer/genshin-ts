import ts from 'typescript'

import { t } from '../../../i18n/index.js'
import { LocatedLuaError } from './tstl_compat.js'

const PRIVATE_PREFIX = '__private_'

/**
 * Lua 不做访问控制，#x 改成普通字段 `__private_<类名>_<字段名>`；该前缀保留给编译器。
 * 只有同一实例继承链上的同名类会撞名，按链上同名祖先的数量追加序号，结果与编辑位置无关。
 */
export function lowerPrivateFields(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  const checker = program.getTypeChecker()
  const names = new Map<ts.Symbol, string>()

  function baseClass(node: ts.ClassLikeDeclaration): ts.ClassLikeDeclaration | undefined {
    const extended = node.heritageClauses?.find(
      (clause) => clause.token === ts.SyntaxKind.ExtendsKeyword
    )?.types[0]
    const declaration =
      extended && checker.getTypeAtLocation(extended.expression).getSymbol()?.valueDeclaration
    return declaration && ts.isClassLike(declaration) ? declaration : undefined
  }

  function privateName(node: ts.PrivateIdentifier) {
    const symbol = checker.getSymbolAtLocation(node)
    const owner = symbol?.valueDeclaration?.parent
    if (!symbol || !owner || !ts.isClassLike(owner))
      throw new LocatedLuaError(node, new Error(t('lua_unsupportedSyntax')))
    let name = names.get(symbol)
    if (name) return name
    const className = owner.name?.text ?? 'anonymous'
    let sameNamedAncestors = 0
    for (let base = baseClass(owner); base; base = baseClass(base))
      if ((base.name?.text ?? 'anonymous') === className) sameNamedAncestors++
    name = `${PRIVATE_PREFIX}${className}_${node.text.slice(1)}`
    if (sameNamedAncestors) name += `_${sameNamedAncestors}`
    names.set(symbol, name)
    return name
  }

  return (context) => (source) => {
    if (!source.text.includes('#')) return source
    let lowered = false
    const visit: ts.Visitor = (node) => {
      if (ts.isPrivateIdentifier(node)) {
        lowered = true
        const replacement = context.factory.createIdentifier(privateName(node))
        return ts.setTextRange(ts.setOriginalNode(replacement, node), node)
      }
      return ts.visitEachChild(node, visit, context)
    }
    const transformed = ts.visitEachChild(source, visit, context)
    if (!lowered) return source
    // TSTL 会沿 parent 向上查找上下文，而 visitEachChild 新建的祖先节点没有 parent；
    // 只为新建节点补上新树中的父节点，原解析树节点的 parent 保持不变，供类型检查器使用。
    const link = (node: ts.Node, parent: ts.Node) => {
      if (ts.getOriginalNode(node) !== node)
        Object.defineProperty(node, 'parent', { value: parent, writable: true, configurable: true })
      ts.forEachChild(node, (child) => link(child, node))
    }
    ts.forEachChild(transformed, (child) => link(child, transformed))
    return transformed
  }
}
