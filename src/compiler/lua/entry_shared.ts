import path from 'node:path'

import * as lua from 'typescript-to-lua'

import type { LuaEntryModel } from './entry_model.js'

/** 保留目录不能作为用户模块路径；入口的挂载路径不变。 */
export const sharedEntryModule = (module: string) => `__gsts_shared/${module}`
export const sharedEntryFile = (source: string, root: string) =>
  path.join(root, '__gsts_shared', path.relative(root, source))

/** 私有绑定通过访问器共享，普通具名导出保留独立的 exports 表。 */
export function finishSharedEntry(
  result: lua.File,
  model: LuaEntryModel,
  context: lua.TransformationContext
) {
  const id = lua.createIdentifier
  const str = lua.createStringLiteral
  const getters: lua.TableFieldExpression[] = []
  const setters: lua.TableFieldExpression[] = []
  const names = new Set<string>()
  for (const name of model.shared.bindings) {
    if (names.has(name.text)) continue
    names.add(name.text)
    const value = context.transformExpression(name)
    if (!lua.isAssignmentLeftHandSideExpression(value))
      throw new Error('Shared binding must be assignable')
    getters.push(
      lua.createTableFieldExpression(
        lua.createFunctionExpression(lua.createBlock([lua.createReturnStatement([value])]), []),
        str(name.text)
      )
    )
    setters.push(
      lua.createTableFieldExpression(
        lua.createFunctionExpression(
          lua.createBlock([lua.createAssignmentStatement(value, id('value'))]),
          [id('value')]
        ),
        str(name.text)
      )
    )
  }
  const get = id(context.createTempName('get'))
  const set = id(context.createTempName('set'))
  const bindings = lua.createCallExpression(id('setmetatable'), [
    lua.createTableExpression(),
    lua.createTableExpression([
      lua.createTableFieldExpression(
        lua.createFunctionExpression(
          lua.createBlock([
            lua.createReturnStatement([
              lua.createCallExpression(lua.createTableIndexExpression(get, id('key')), [])
            ])
          ]),
          [id('_'), id('key')]
        ),
        str('__index')
      ),
      lua.createTableFieldExpression(
        lua.createFunctionExpression(
          lua.createBlock([
            lua.createExpressionStatement(
              lua.createCallExpression(lua.createTableIndexExpression(set, id('key')), [
                id('value')
              ])
            )
          ]),
          [id('_'), id('key'), id('value')]
        ),
        str('__newindex')
      )
    ])
  ])
  const last = result.statements.at(-1)
  if (!last || !lua.isReturnStatement(last)) throw new Error('Shared entry must return its exports')
  result.statements.splice(
    result.statements.length - 1,
    0,
    lua.createVariableDeclarationStatement(get, lua.createTableExpression(getters)),
    lua.createVariableDeclarationStatement(set, lua.createTableExpression(setters))
  )
  last.expressions = [
    lua.createTableExpression([
      lua.createTableFieldExpression(id('____exports'), str('exports')),
      lua.createTableFieldExpression(bindings, str('bindings'))
    ])
  ]
}
