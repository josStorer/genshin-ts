import * as lua from 'typescript-to-lua'

export const id = lua.createIdentifier
export const str = lua.createStringLiteral
export const field = (target: lua.Expression, name: string) =>
  lua.createTableIndexExpression(target, str(name))
export const requireModule = (name: string) =>
  lua.createCallExpression(id('require'), [str(`@NoResolution:${name}`)])
export const importModule = (name: string | undefined) =>
  name === undefined
    ? lua.createTableExpression()
    : name.startsWith('__gsts_shared/')
      ? field(requireModule(name), 'exports')
      : requireModule(name)
