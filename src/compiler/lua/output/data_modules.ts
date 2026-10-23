import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

type Data = string | number | boolean | Data[] | { [key: string]: Data }
const constants = new Map<string, Record<string, Data>>()
export function luaDataConstant(module: string, name: string, key: string) {
  let data = constants.get(module)
  if (!data) {
    let root = path.dirname(fileURLToPath(import.meta.url))
    while (!fs.existsSync(path.join(root, 'package.json'))) root = path.dirname(root)
    data = JSON.parse(
      fs.readFileSync(
        path.join(root, 'dist/src/runtime/lua_assets/data_modules', module + '.json'),
        'utf8'
      )
    ) as Record<string, Data>
    constants.set(module, data)
  }
  const table = data[name]
  const value =
    table && typeof table === 'object' ? (table as Record<string, Data>)[key] : undefined
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? value
    : undefined
}

function luaValue(value: Data): string {
  if (typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `{${value.map(luaValue).join(', ')}}`
  return `{${Object.entries(value)
    .map(([key, item]) => `[${JSON.stringify(key)}] = ${luaValue(item)}`)
    .join(', ')}}`
}

/** 只有字面量数据与类型声明。enum/client_enums 含节点图运行时类，不是宿主 Lua 枚举。 */
export const luaDataModules = ['prefabs'] as const

export function luaDataModule(name: string) {
  const key = name.replace(/^genshin-ts\/definitions\//, '').replace(/\.js$/, '')
  return name.startsWith('genshin-ts/definitions/') && luaDataModules.some((item) => item === key)
    ? key
    : undefined
}

/** 构建包时从 TS 字面量生成，绝不执行被读取模块的 JS。源文件不再是纯数据时直接阻止构建。 */
export function generateLuaDataModules(root: string) {
  const destination = path.join(root, 'dist/src/runtime/lua_assets/data_modules')
  fs.mkdirSync(destination, { recursive: true })
  for (const name of luaDataModules) {
    const source = ts.createSourceFile(
      name + '.ts',
      fs.readFileSync(path.join(root, 'src/definitions', name + '.ts'), 'utf8'),
      ts.ScriptTarget.Latest,
      true
    )
    function value(node: ts.Expression): Data {
      if (
        ts.isAsExpression(node) ||
        ts.isSatisfiesExpression(node) ||
        ts.isParenthesizedExpression(node)
      )
        return value(node.expression)
      if (ts.isStringLiteralLike(node)) return node.text
      if (ts.isNumericLiteral(node)) return Number(node.text)
      if (node.kind === ts.SyntaxKind.TrueKeyword) return true
      if (node.kind === ts.SyntaxKind.FalseKeyword) return false
      if (
        ts.isPrefixUnaryExpression(node) &&
        node.operator === ts.SyntaxKind.MinusToken &&
        ts.isNumericLiteral(node.operand)
      )
        return -Number(node.operand.text)
      if (ts.isArrayLiteralExpression(node)) return node.elements.map(value)
      if (ts.isObjectLiteralExpression(node))
        return Object.fromEntries(
          node.properties.map((property) => {
            if (
              !ts.isPropertyAssignment(property) ||
              !(
                ts.isIdentifier(property.name) ||
                ts.isStringLiteralLike(property.name) ||
                ts.isNumericLiteral(property.name)
              )
            )
              throw new Error(`${name}: only literal data properties are allowed`)
            return [property.name.text, value(property.initializer)]
          })
        )
      throw new Error(`${name}: unsupported data expression ${node.getText(source)}`)
    }
    const fields: string[] = []
    const data: Record<string, Data> = {}
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
        data[declaration.name.text] = value(declaration.initializer)
        const literal = luaValue(data[declaration.name.text])
        fields.push(`[${JSON.stringify(declaration.name.text)}] = ${literal}`)
        fs.mkdirSync(path.join(destination, name), { recursive: true })
        fs.writeFileSync(
          path.join(destination, name, declaration.name.text + '.lua'),
          `return ${literal}\n`
        )
      }
    }
    fs.writeFileSync(path.join(destination, name + '.lua'), `return {\n${fields.join(',\n')}\n}\n`)
    fs.writeFileSync(path.join(destination, name + '.json'), JSON.stringify(data))
  }
}
