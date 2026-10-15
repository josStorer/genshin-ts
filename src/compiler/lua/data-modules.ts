import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

/** 只有字面量数据与类型声明。enum/client_enums 含节点图运行时类，不是宿主 Lua 枚举。 */
export const luaDataModules = [
  'prefabs',
  'zh_aliases',
  'node_modes',
  'node_graph_entries',
  'server_node_metadata',
  'client_scoped_globals'
] as const

export function luaDataModule(name: string) {
  const key = name.replace(/^genshin-ts\/definitions\//, '').replace(/\.js$/, '')
  return name.startsWith('genshin-ts/definitions/') && luaDataModules.some((item) => item === key)
    ? key
    : undefined
}

/** 构建包时从 TS 字面量生成，绝不执行被读取模块的 JS。源文件不再是纯数据时直接阻止构建。 */
export function generateLuaDataModules(root: string) {
  const destination = path.join(root, 'dist/src/runtime/lua-assets/data_modules')
  fs.mkdirSync(destination, { recursive: true })
  for (const name of luaDataModules) {
    const source = ts.createSourceFile(
      name + '.ts',
      fs.readFileSync(path.join(root, 'src/definitions', name + '.ts'), 'utf8'),
      ts.ScriptTarget.Latest,
      true
    )
    function value(node: ts.Expression): string {
      if (
        ts.isAsExpression(node) ||
        ts.isSatisfiesExpression(node) ||
        ts.isParenthesizedExpression(node)
      )
        return value(node.expression)
      if (ts.isStringLiteralLike(node)) return JSON.stringify(node.text)
      if (ts.isNumericLiteral(node)) return node.text
      if (node.kind === ts.SyntaxKind.TrueKeyword) return 'true'
      if (node.kind === ts.SyntaxKind.FalseKeyword) return 'false'
      if (
        ts.isPrefixUnaryExpression(node) &&
        node.operator === ts.SyntaxKind.MinusToken &&
        ts.isNumericLiteral(node.operand)
      )
        return '-' + node.operand.text
      if (ts.isArrayLiteralExpression(node)) return `{${node.elements.map(value).join(', ')}}`
      if (ts.isObjectLiteralExpression(node))
        return `{${node.properties
          .map((property) => {
            if (
              !ts.isPropertyAssignment(property) ||
              !(
                ts.isIdentifier(property.name) ||
                ts.isStringLiteralLike(property.name) ||
                ts.isNumericLiteral(property.name)
              )
            )
              throw new Error(`${name}: only literal data properties are allowed`)
            return `[${JSON.stringify(property.name.text)}] = ${value(property.initializer)}`
          })
          .join(', ')}}`
      throw new Error(`${name}: unsupported data expression ${node.getText(source)}`)
    }
    const fields: string[] = []
    for (const statement of source.statements) {
      if (
        ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isEmptyStatement(statement)
      )
        continue
      if (ts.isImportDeclaration(statement) && statement.importClause?.isTypeOnly) continue
      if (
        !ts.isVariableStatement(statement) ||
        !(statement.declarationList.flags & ts.NodeFlags.Const) ||
        !statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      )
        throw new Error(`${name}: only exported constant data is allowed`)
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer)
          throw new Error(`${name}: invalid data declaration`)
        fields.push(
          `[${JSON.stringify(declaration.name.text)}] = ${value(declaration.initializer)}`
        )
      }
    }
    fs.writeFileSync(path.join(destination, name + '.lua'), `return {\n${fields.join(',\n')}\n}\n`)
  }
}
