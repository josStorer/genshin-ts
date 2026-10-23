import * as lua from 'typescript-to-lua'

import type { LuaEntryModel } from './entry_model.js'

/** 生命周期包装在产物中显式可见；运行库不读取或改写 _ENV 上的用户钩子。 */
export function generateScopeHooks(
  statements: lua.Statement[],
  scope: lua.Identifier,
  model: LuaEntryModel,
  context: lua.TransformationContext
) {
  const functions = new Map<string, lua.FunctionExpression>()
  for (const statement of statements) {
    if (!lua.isAssignmentStatement(statement)) continue
    const target = statement.left[0]
    const value = statement.right[0]
    if (
      lua.isTableIndexExpression(target) &&
      lua.isIdentifier(target.table) &&
      target.table.text === '_ENV' &&
      lua.isStringLiteral(target.index) &&
      lua.isFunctionExpression(value)
    )
      functions.set(target.index.value, value)
  }
  const hook = (name: string, update = false) => {
    let fn = functions.get(name)
    if (!fn) {
      fn = lua.createFunctionExpression(
        lua.createBlock([]),
        update ? [lua.createIdentifier('dt')] : [],
        undefined,
        lua.NodeFlags.Declaration
      )
      statements.push(
        lua.createAssignmentStatement(
          lua.createTableIndexExpression(
            lua.createIdentifier('_ENV'),
            lua.createStringLiteral(name)
          ),
          fn
        )
      )
      functions.set(name, fn)
    }
    return fn
  }
  const callScope = (name: string, args: lua.Expression[] = []) =>
    lua.createExpressionStatement(
      lua.createCallExpression(
        lua.createTableIndexExpression(scope, lua.createStringLiteral(name)),
        args
      )
    )

  // Start/Enable 的用户代码可以立即使用已激活的订阅。
  for (const name of ['OnStart', 'OnEnable'])
    hook(name).body.statements.unshift(callScope('activate'))
  // 即使用户清理代码抛错，也必须释放宿主资源；清理后重新抛出原错误。
  for (const [name, operation] of [
    ['OnDisable', 'deactivate'],
    ['OnDestroy', 'dispose']
  ]) {
    const fn = hook(name)
    if (!fn.body.statements.length) {
      fn.body.statements.push(callScope(operation))
      continue
    }
    const user = lua.createFunctionExpression(fn.body, fn.params, fn.dots)
    const ok = lua.createIdentifier(context.createTempName('ok'))
    const message = lua.createIdentifier(context.createTempName('error'))
    fn.body = lua.createBlock([
      lua.createVariableDeclarationStatement(
        [ok, message],
        lua.createCallExpression(lua.createIdentifier('xpcall'), [
          user,
          lua.createTableIndexExpression(scope, lua.createStringLiteral('traceback')),
          ...(fn.params ?? []),
          ...(fn.dots ? [lua.createDotsLiteral()] : [])
        ])
      ),
      callScope(operation),
      lua.createIfStatement(
        lua.createUnaryExpression(ok, lua.SyntaxKind.NotOperator),
        lua.createBlock([
          lua.createExpressionStatement(
            lua.createCallExpression(lua.createIdentifier('error'), [
              message,
              lua.createNumericLiteral(0)
            ])
          )
        ])
      )
    ])
  }
  const update = functions.get('OnUpdate')
  if (update)
    update.body = lua.createBlock([
      lua.createIfStatement(
        lua.createTableIndexExpression(scope, lua.createStringLiteral('wantsUpdate')),
        update.body
      )
    ])
  for (const clock of model.timerClocks) {
    const fn = hook(clock === 'real' ? 'OnUpdate' : 'OnLevelUpdate', true)
    // 用户可以省略未使用的 dt；调度器仍需接收宿主的第一个参数。
    const delta = fn.params?.[0] ?? lua.createIdentifier(context.createTempName('dt'))
    if (!fn.params?.length) fn.params = [delta]
    fn.body.statements.unshift(
      callScope(
        'tick',
        clock === model.options.timerClock ? [delta] : [delta, lua.createStringLiteral(clock)]
      )
    )
  }
}
