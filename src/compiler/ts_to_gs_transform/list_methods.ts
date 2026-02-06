import ts from 'typescript'

import { fail } from './errors.js'
import {
  assertBoolResult,
  assertMapReturnType,
  ensureDefaultSupported,
  extractSimpleEqualityMatch,
  hasReturnStatement,
  inferListElementTypeFromExpression,
  inferListTypeFromExpression,
  inferReduceAccumulatorType,
  isArrayLikeExpression,
  makeConst,
  makeDefaultValueExpr,
  makeIife,
  makeLocalVarInit,
  readInlineCallbackBlock,
  readInlineCallbackExpression,
  SUPPORTED_LIST_METHODS
} from './list_utils.js'
import type { Env } from './types.js'
import { makeFCall, withSameRange } from './utils.js'

export type ExpressionTransformer = (
  env: Env,
  context: ts.TransformationContext,
  expr: ts.Expression
) => ts.Expression

export type HandlerTransformer = (
  env: Env,
  context: ts.TransformationContext,
  fn: ts.ArrowFunction | ts.FunctionExpression
) => ts.ArrowFunction | ts.FunctionExpression

export function tryTransformListMethodCall(
  env: Env,
  context: ts.TransformationContext,
  expr: ts.CallExpression,
  transformExpression: ExpressionTransformer,
  transformHandler: HandlerTransformer
): ts.Expression | null {
  const callee = expr.expression
  if (!ts.isPropertyAccessExpression(callee)) return null
  if (!ts.isIdentifier(callee.name)) return null

  const method = callee.name.text
  const target = callee.expression
  const listType = inferListTypeFromExpression(env, target)

  if (!listType) {
    if (isArrayLikeExpression(env, target) && SUPPORTED_LIST_METHODS.has(method)) {
      fail(env, callee.name, `cannot infer list element type for ${method}(), add type annotation`)
    }
    return null
  }

  if (!SUPPORTED_LIST_METHODS.has(method)) {
    fail(env, callee.name, `Unsupported list method "${method}"`)
  }

  const args = expr.arguments.slice()
  const listExpr = transformExpression(env, context, target)
  const tempId = env.tempCounter++

  const listVarName = `__gsts_list_${tempId}`
  const listVarId = ts.factory.createIdentifier(listVarName)
  const listValue = listVarId

  const listInit = makeConst(listVarName, listExpr)
  const coerceIndexArg = (arg: ts.Expression, label: string): ts.Expression => {
    const argType = inferListElementTypeFromExpression(env, arg)
    if (argType === 'int') return transformExpression(env, context, arg)
    if (argType === 'float') {
      const argExpr = transformExpression(env, context, arg)
      return makeFCall(env, 'dataTypeConversion', [argExpr, ts.factory.createStringLiteral('int')])
    }
    const raw = env.checker.typeToString(env.checker.getTypeAtLocation(arg))
    fail(env, arg, `${label} must be a number or bigint (${raw})`)
  }

  if (method === 'forEach') {
    if (args.length !== 1) {
      fail(env, expr, 'forEach() does not support thisArg or extra arguments')
    }
    const cb = readInlineCallbackBlock(env, method, args[0], 1, { allowZero: true })
    if (hasReturnStatement(cb.body)) {
      fail(env, cb.body, 'forEach() callback must not use return')
    }
    const transformedCb = transformHandler(env, context, cb.fn)
    return withSameRange(makeFCall(env, 'listIterationLoop', [listExpr, transformedCb]), expr)
  }

  if (method === 'includes') {
    if (args.length !== 1) {
      fail(env, expr, 'includes() does not support fromIndex or extra arguments')
    }
    const valueExpr = transformExpression(env, context, args[0])
    const outName = `__gsts_includes_out_${tempId}`
    const outId = ts.factory.createIdentifier(outName)
    const outDecl = makeLocalVarInit(env, outName, 'bool')
    const setOut = makeFCall(env, 'setLocalVariable', [
      ts.factory.createPropertyAccessExpression(outId, 'localVariable'),
      makeFCall(env, 'listIncludesThisValue', [listValue, valueExpr])
    ])
    const stmts = [listInit, outDecl, ts.factory.createExpressionStatement(setOut)]
    return withSameRange(
      makeIife(stmts, ts.factory.createPropertyAccessExpression(outId, 'value')),
      expr
    )
  }

  if (method === 'indexOf') {
    if (args.length !== 1) {
      fail(env, expr, 'indexOf() does not support fromIndex or extra arguments')
    }
    const valueExpr = transformExpression(env, context, args[0])
    const matchesName = `__gsts_indexof_matches_${tempId}`
    const matchesId = ts.factory.createIdentifier(matchesName)
    const matchesDecl = makeConst(
      matchesName,
      makeFCall(env, 'searchListAndReturnValueId', [listValue, valueExpr])
    )
    const lenName = `__gsts_indexof_len_${tempId}`
    const lenId = ts.factory.createIdentifier(lenName)
    const lenDecl = makeConst(lenName, makeFCall(env, 'getListLength', [matchesId]))
    const outName = `__gsts_indexof_out_${tempId}`
    const outId = ts.factory.createIdentifier(outName)
    const outDecl = makeLocalVarInit(
      env,
      outName,
      'int',
      ts.factory.createPrefixUnaryExpression(
        ts.SyntaxKind.MinusToken,
        ts.factory.createBigIntLiteral('1n')
      )
    )
    const hasAny = makeFCall(env, 'greaterThan', [lenId, ts.factory.createBigIntLiteral('0n')])
    const firstIndex = makeFCall(env, 'getCorrespondingValueFromList', [
      matchesId,
      ts.factory.createNumericLiteral(0)
    ])
    const setOut = makeFCall(env, 'setLocalVariable', [
      ts.factory.createPropertyAccessExpression(outId, 'localVariable'),
      firstIndex
    ])
    const branch = makeFCall(env, 'doubleBranch', [
      hasAny,
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([ts.factory.createExpressionStatement(setOut)], true)
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([], true)
      )
    ])
    const stmts = [
      listInit,
      matchesDecl,
      lenDecl,
      outDecl,
      ts.factory.createExpressionStatement(branch)
    ]
    return withSameRange(
      makeIife(stmts, ts.factory.createPropertyAccessExpression(outId, 'value')),
      expr
    )
  }

  if (method === 'concat') {
    const argDecls: ts.VariableStatement[] = []
    const argIds: ts.Identifier[] = []
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      const argType = inferListTypeFromExpression(env, arg)
      if (!argType) {
        fail(env, arg, `concat() argument #${i + 1} must be a list`)
      }
      if (argType !== listType) {
        fail(env, arg, `concat() argument #${i + 1} must be a ${listType} list`)
      }
      const argExpr = transformExpression(env, context, arg)
      const argName = `__gsts_concat_arg_${tempId}_${i}`
      const argId = ts.factory.createIdentifier(argName)
      argIds.push(argId)
      argDecls.push(makeConst(argName, argExpr))
    }

    const outName = `__gsts_concat_out_${tempId}`
    const outId = ts.factory.createIdentifier(outName)
    const outDecl = makeConst(
      outName,
      makeFCall(env, 'emptyList', [ts.factory.createStringLiteral(listType)])
    )
    const stmts: ts.Statement[] = [listInit, ...argDecls, outDecl]
    stmts.push(
      ts.factory.createExpressionStatement(makeFCall(env, 'concatenateList', [outId, listValue]))
    )
    for (const argId of argIds) {
      stmts.push(
        ts.factory.createExpressionStatement(makeFCall(env, 'concatenateList', [outId, argId]))
      )
    }
    return withSameRange(makeIife(stmts, outId), expr)
  }

  if (method === 'map') {
    if (args.length !== 1) {
      fail(env, expr, 'map() does not support thisArg or extra arguments')
    }
    const cb = readInlineCallbackExpression(env, method, args[0], 1)
    const mappedExpr = transformExpression(env, context, cb.expr)
    const outType = assertMapReturnType(env, cb.expr, cb.expr)
    const outName = `__gsts_map_out_${tempId}`
    const outId = ts.factory.createIdentifier(outName)
    const outDecl = makeLocalVarInit(env, outName, `${outType}_list`)
    const insertCall = makeFCall(env, 'insertValueIntoList', [
      ts.factory.createPropertyAccessExpression(outId, 'value'),
      makeFCall(env, 'getListLength', [ts.factory.createPropertyAccessExpression(outId, 'value')]),
      mappedExpr
    ])
    const loopBody = ts.factory.createBlock(
      [ts.factory.createExpressionStatement(insertCall)],
      true
    )
    const loopFn = ts.factory.createArrowFunction(
      undefined,
      undefined,
      [
        ts.factory.createParameterDeclaration(undefined, undefined, cb.params[0]),
        ts.factory.createParameterDeclaration(undefined, undefined, 'breakLoop')
      ],
      undefined,
      undefined,
      loopBody
    )
    const loopCall = makeFCall(env, 'listIterationLoop', [listValue, loopFn])
    const stmts = [listInit, outDecl, ts.factory.createExpressionStatement(loopCall)]
    return withSameRange(
      makeIife(stmts, ts.factory.createPropertyAccessExpression(outId, 'value')),
      expr
    )
  }

  if (method === 'filter') {
    if (args.length !== 1) {
      fail(env, expr, 'filter() does not support thisArg or extra arguments')
    }
    const cb = readInlineCallbackExpression(env, method, args[0], 1)
    const predExpr = transformExpression(env, context, cb.expr)
    assertBoolResult(env, cb.expr, method, cb.expr)
    const outName = `__gsts_filter_out_${tempId}`
    const outId = ts.factory.createIdentifier(outName)
    const outDecl = makeLocalVarInit(env, outName, `${listType}_list`)
    const insertCall = makeFCall(env, 'insertValueIntoList', [
      ts.factory.createPropertyAccessExpression(outId, 'value'),
      makeFCall(env, 'getListLength', [ts.factory.createPropertyAccessExpression(outId, 'value')]),
      ts.factory.createIdentifier(cb.params[0])
    ])
    const branch = makeFCall(env, 'doubleBranch', [
      predExpr,
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([ts.factory.createExpressionStatement(insertCall)], true)
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([], true)
      )
    ])
    const loopBody = ts.factory.createBlock([ts.factory.createExpressionStatement(branch)], true)
    const loopFn = ts.factory.createArrowFunction(
      undefined,
      undefined,
      [
        ts.factory.createParameterDeclaration(undefined, undefined, cb.params[0]),
        ts.factory.createParameterDeclaration(undefined, undefined, 'breakLoop')
      ],
      undefined,
      undefined,
      loopBody
    )
    const loopCall = makeFCall(env, 'listIterationLoop', [listValue, loopFn])
    const stmts = [listInit, outDecl, ts.factory.createExpressionStatement(loopCall)]
    return withSameRange(
      makeIife(stmts, ts.factory.createPropertyAccessExpression(outId, 'value')),
      expr
    )
  }

  if (method === 'reduce') {
    if (args.length !== 2) {
      fail(env, expr, 'reduce() requires a callback and an initial value')
    }
    const cb = readInlineCallbackExpression(env, method, args[0], 2)
    const initExpr = transformExpression(env, context, args[1])
    const callbackExpr = transformExpression(env, context, cb.expr)
    const accType = inferReduceAccumulatorType(env, expr, args[1], cb.expr)
    const accName = `__gsts_reduce_acc_${tempId}`
    const accId = ts.factory.createIdentifier(accName)
    const accDecl = makeLocalVarInit(env, accName, accType, initExpr)
    const accAlias = cb.params[0]
    const accAliasDecl = makeConst(
      accAlias,
      ts.factory.createPropertyAccessExpression(accId, 'value')
    )
    const setAcc = makeFCall(env, 'setLocalVariable', [
      ts.factory.createPropertyAccessExpression(accId, 'localVariable'),
      callbackExpr
    ])
    const loopBody = ts.factory.createBlock(
      [accAliasDecl, ts.factory.createExpressionStatement(setAcc)],
      true
    )
    const loopFn = ts.factory.createArrowFunction(
      undefined,
      undefined,
      [
        ts.factory.createParameterDeclaration(undefined, undefined, cb.params[1]),
        ts.factory.createParameterDeclaration(undefined, undefined, 'breakLoop')
      ],
      undefined,
      undefined,
      loopBody
    )
    const loopCall = makeFCall(env, 'listIterationLoop', [listValue, loopFn])
    const stmts = [listInit, accDecl, ts.factory.createExpressionStatement(loopCall)]
    return withSameRange(
      makeIife(stmts, ts.factory.createPropertyAccessExpression(accId, 'value')),
      expr
    )
  }

  if (method === 'some' || method === 'every') {
    if (args.length !== 1) {
      fail(env, expr, `${method}() does not support thisArg or extra arguments`)
    }
    const cb = readInlineCallbackExpression(env, method, args[0], 1)
    if (method === 'some') {
      const matchExpr = extractSimpleEqualityMatch(cb.expr, cb.params[0])
      if (matchExpr) {
        const matchType = inferListElementTypeFromExpression(env, matchExpr)
        if (matchType === listType) {
          const valueExpr = transformExpression(env, context, matchExpr)
          const outName = `__gsts_some_out_${tempId}`
          const outId = ts.factory.createIdentifier(outName)
          const outDecl = makeLocalVarInit(env, outName, 'bool')
          const setOut = makeFCall(env, 'setLocalVariable', [
            ts.factory.createPropertyAccessExpression(outId, 'localVariable'),
            makeFCall(env, 'listIncludesThisValue', [listValue, valueExpr])
          ])
          const stmts = [listInit, outDecl, ts.factory.createExpressionStatement(setOut)]
          return withSameRange(
            makeIife(stmts, ts.factory.createPropertyAccessExpression(outId, 'value')),
            expr
          )
        }
      }
    }
    const predExpr = transformExpression(env, context, cb.expr)
    assertBoolResult(env, cb.expr, method, cb.expr)
    const flagName = `__gsts_${method}_flag_${tempId}`
    const flagId = ts.factory.createIdentifier(flagName)
    const initValue = method === 'every' ? ts.factory.createTrue() : ts.factory.createFalse()
    const flagDecl = makeLocalVarInit(env, flagName, 'bool', initValue)
    const nextValue = method === 'every' ? ts.factory.createFalse() : ts.factory.createTrue()
    const setFlag = makeFCall(env, 'setLocalVariable', [
      ts.factory.createPropertyAccessExpression(flagId, 'localVariable'),
      nextValue
    ])
    const branch = makeFCall(env, 'doubleBranch', [
      predExpr,
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        method === 'every'
          ? ts.factory.createBlock([], true)
          : ts.factory.createBlock(
              [
                ts.factory.createExpressionStatement(setFlag),
                ts.factory.createExpressionStatement(
                  ts.factory.createCallExpression(
                    ts.factory.createIdentifier('breakLoop'),
                    undefined,
                    []
                  )
                )
              ],
              true
            )
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        method === 'every'
          ? ts.factory.createBlock(
              [
                ts.factory.createExpressionStatement(setFlag),
                ts.factory.createExpressionStatement(
                  ts.factory.createCallExpression(
                    ts.factory.createIdentifier('breakLoop'),
                    undefined,
                    []
                  )
                )
              ],
              true
            )
          : ts.factory.createBlock([], true)
      )
    ])
    const loopBody = ts.factory.createBlock([ts.factory.createExpressionStatement(branch)], true)
    const loopFn = ts.factory.createArrowFunction(
      undefined,
      undefined,
      [
        ts.factory.createParameterDeclaration(undefined, undefined, cb.params[0]),
        ts.factory.createParameterDeclaration(undefined, undefined, 'breakLoop')
      ],
      undefined,
      undefined,
      loopBody
    )
    const loopCall = makeFCall(env, 'listIterationLoop', [listValue, loopFn])
    const stmts = [listInit, flagDecl, ts.factory.createExpressionStatement(loopCall)]
    return withSameRange(
      makeIife(stmts, ts.factory.createPropertyAccessExpression(flagId, 'value')),
      expr
    )
  }

  if (method === 'find' || method === 'findIndex') {
    if (args.length !== 1) {
      fail(env, expr, `${method}() does not support thisArg or extra arguments`)
    }
    const cb = readInlineCallbackExpression(env, method, args[0], 1)
    const matchExpr = extractSimpleEqualityMatch(cb.expr, cb.params[0])
    if (matchExpr) {
      const matchType = inferListElementTypeFromExpression(env, matchExpr)
      if (matchType === listType) {
        const valueExpr = transformExpression(env, context, matchExpr)
        const valueName = `__gsts_${method}_match_${tempId}`
        const valueId = ts.factory.createIdentifier(valueName)
        const valueDecl = makeConst(valueName, valueExpr)

        if (method === 'find') {
          ensureDefaultSupported(env, expr, listType, method)
          const outName = `__gsts_find_out_${tempId}`
          const outId = ts.factory.createIdentifier(outName)
          const defaultExpr = makeDefaultValueExpr(listType) as ts.Expression
          const outDecl = makeLocalVarInit(env, outName, listType, defaultExpr)
          const hasMatch = makeFCall(env, 'listIncludesThisValue', [listValue, valueId])
          const setOut = makeFCall(env, 'setLocalVariable', [
            ts.factory.createPropertyAccessExpression(outId, 'localVariable'),
            valueId
          ])
          const branch = makeFCall(env, 'doubleBranch', [
            hasMatch,
            ts.factory.createArrowFunction(
              undefined,
              undefined,
              [],
              undefined,
              undefined,
              ts.factory.createBlock([ts.factory.createExpressionStatement(setOut)], true)
            ),
            ts.factory.createArrowFunction(
              undefined,
              undefined,
              [],
              undefined,
              undefined,
              ts.factory.createBlock([], true)
            )
          ])
          const stmts = [listInit, valueDecl, outDecl, ts.factory.createExpressionStatement(branch)]
          return withSameRange(
            makeIife(stmts, ts.factory.createPropertyAccessExpression(outId, 'value')),
            expr
          )
        }

        const matchesName = `__gsts_findindex_matches_${tempId}`
        const matchesId = ts.factory.createIdentifier(matchesName)
        const matchesDecl = makeConst(
          matchesName,
          makeFCall(env, 'searchListAndReturnValueId', [listValue, valueId])
        )
        const lenName = `__gsts_findindex_len_${tempId}`
        const lenId = ts.factory.createIdentifier(lenName)
        const lenDecl = makeConst(lenName, makeFCall(env, 'getListLength', [matchesId]))
        const outName = `__gsts_findindex_out_${tempId}`
        const outId = ts.factory.createIdentifier(outName)
        const outDecl = makeLocalVarInit(
          env,
          outName,
          'int',
          ts.factory.createPrefixUnaryExpression(
            ts.SyntaxKind.MinusToken,
            ts.factory.createBigIntLiteral('1n')
          )
        )
        const hasAny = makeFCall(env, 'greaterThan', [lenId, ts.factory.createBigIntLiteral('0n')])
        const firstIndex = makeFCall(env, 'getCorrespondingValueFromList', [
          matchesId,
          ts.factory.createNumericLiteral(0)
        ])
        const setOut = makeFCall(env, 'setLocalVariable', [
          ts.factory.createPropertyAccessExpression(outId, 'localVariable'),
          firstIndex
        ])
        const branch = makeFCall(env, 'doubleBranch', [
          hasAny,
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            undefined,
            ts.factory.createBlock([ts.factory.createExpressionStatement(setOut)], true)
          ),
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            undefined,
            ts.factory.createBlock([], true)
          )
        ])
        const stmts = [
          listInit,
          valueDecl,
          matchesDecl,
          lenDecl,
          outDecl,
          ts.factory.createExpressionStatement(branch)
        ]
        return withSameRange(
          makeIife(stmts, ts.factory.createPropertyAccessExpression(outId, 'value')),
          expr
        )
      }
    }
    const predExpr = transformExpression(env, context, cb.expr)
    assertBoolResult(env, cb.expr, method, cb.expr)

    if (method === 'find') {
      ensureDefaultSupported(env, expr, listType, method)
      const outName = `__gsts_find_out_${tempId}`
      const outId = ts.factory.createIdentifier(outName)
      const defaultExpr = makeDefaultValueExpr(listType) as ts.Expression
      const outDecl = makeLocalVarInit(env, outName, listType, defaultExpr)
      const setOut = makeFCall(env, 'setLocalVariable', [
        ts.factory.createPropertyAccessExpression(outId, 'localVariable'),
        ts.factory.createIdentifier(cb.params[0])
      ])
      const branch = makeFCall(env, 'doubleBranch', [
        predExpr,
        ts.factory.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          undefined,
          ts.factory.createBlock(
            [
              ts.factory.createExpressionStatement(setOut),
              ts.factory.createExpressionStatement(
                ts.factory.createCallExpression(
                  ts.factory.createIdentifier('breakLoop'),
                  undefined,
                  []
                )
              )
            ],
            true
          )
        ),
        ts.factory.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          undefined,
          ts.factory.createBlock([], true)
        )
      ])
      const loopBody = ts.factory.createBlock([ts.factory.createExpressionStatement(branch)], true)
      const loopFn = ts.factory.createArrowFunction(
        undefined,
        undefined,
        [
          ts.factory.createParameterDeclaration(undefined, undefined, cb.params[0]),
          ts.factory.createParameterDeclaration(undefined, undefined, 'breakLoop')
        ],
        undefined,
        undefined,
        loopBody
      )
      const loopCall = makeFCall(env, 'listIterationLoop', [listValue, loopFn])
      const stmts = [listInit, outDecl, ts.factory.createExpressionStatement(loopCall)]
      return withSameRange(
        makeIife(stmts, ts.factory.createPropertyAccessExpression(outId, 'value')),
        expr
      )
    }

    const idxName = `__gsts_find_idx_${tempId}`
    const idxId = ts.factory.createIdentifier(idxName)
    const idxDecl = makeLocalVarInit(
      env,
      idxName,
      'int',
      ts.factory.createPrefixUnaryExpression(
        ts.SyntaxKind.MinusToken,
        ts.factory.createBigIntLiteral('1n')
      )
    )
    const curName = `__gsts_find_cur_${tempId}`
    const curId = ts.factory.createIdentifier(curName)
    const curDecl = makeLocalVarInit(env, curName, 'int', ts.factory.createBigIntLiteral('0n'))
    const setIdx = makeFCall(env, 'setLocalVariable', [
      ts.factory.createPropertyAccessExpression(idxId, 'localVariable'),
      ts.factory.createPropertyAccessExpression(curId, 'value')
    ])
    const incCur = makeFCall(env, 'setLocalVariable', [
      ts.factory.createPropertyAccessExpression(curId, 'localVariable'),
      makeFCall(env, 'addition', [
        ts.factory.createPropertyAccessExpression(curId, 'value'),
        ts.factory.createBigIntLiteral('1n')
      ])
    ])
    const branch = makeFCall(env, 'doubleBranch', [
      predExpr,
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock(
          [
            ts.factory.createExpressionStatement(setIdx),
            ts.factory.createExpressionStatement(
              ts.factory.createCallExpression(
                ts.factory.createIdentifier('breakLoop'),
                undefined,
                []
              )
            )
          ],
          true
        )
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([ts.factory.createExpressionStatement(incCur)], true)
      )
    ])
    const loopBody = ts.factory.createBlock([ts.factory.createExpressionStatement(branch)], true)
    const loopFn = ts.factory.createArrowFunction(
      undefined,
      undefined,
      [
        ts.factory.createParameterDeclaration(undefined, undefined, cb.params[0]),
        ts.factory.createParameterDeclaration(undefined, undefined, 'breakLoop')
      ],
      undefined,
      undefined,
      loopBody
    )
    const loopCall = makeFCall(env, 'listIterationLoop', [listValue, loopFn])
    const stmts = [listInit, idxDecl, curDecl, ts.factory.createExpressionStatement(loopCall)]
    return withSameRange(
      makeIife(stmts, ts.factory.createPropertyAccessExpression(idxId, 'value')),
      expr
    )
  }

  if (method === 'push' || method === 'unshift') {
    if (args.length !== 1) {
      fail(env, expr, `${method}() requires exactly one argument`)
    }
    const valueExpr = transformExpression(env, context, args[0])
    const lenName = `__gsts_${method}_len_${tempId}`
    const lenId = ts.factory.createIdentifier(lenName)
    const lenDecl = makeLocalVarInit(env, lenName, 'int')
    const lenVal = ts.factory.createPropertyAccessExpression(lenId, 'value')
    const setLen = makeFCall(env, 'setLocalVariable', [
      ts.factory.createPropertyAccessExpression(lenId, 'localVariable'),
      makeFCall(env, 'getListLength', [listValue])
    ])
    const insertIndex = method === 'push' ? lenVal : ts.factory.createNumericLiteral(0)
    const insertCall = makeFCall(env, 'insertValueIntoList', [listValue, insertIndex, valueExpr])
    const setNextLen = makeFCall(env, 'setLocalVariable', [
      ts.factory.createPropertyAccessExpression(lenId, 'localVariable'),
      makeFCall(env, 'addition', [lenVal, ts.factory.createBigIntLiteral('1n')])
    ])
    const stmts = [
      listInit,
      lenDecl,
      ts.factory.createExpressionStatement(setLen),
      ts.factory.createExpressionStatement(insertCall),
      ts.factory.createExpressionStatement(setNextLen)
    ]
    return withSameRange(makeIife(stmts, lenVal), expr)
  }

  if (method === 'pop' || method === 'shift') {
    if (args.length !== 0) {
      fail(env, expr, `${method}() does not accept arguments`)
    }
    ensureDefaultSupported(env, expr, listType, method)
    const outName = `__gsts_${method}_out_${tempId}`
    const outId = ts.factory.createIdentifier(outName)
    const defaultExpr = makeDefaultValueExpr(listType) as ts.Expression
    const outDecl = makeLocalVarInit(env, outName, listType, defaultExpr)
    const lenName = `__gsts_${method}_len_${tempId}`
    const lenId = ts.factory.createIdentifier(lenName)
    const lenDecl = makeConst(lenName, makeFCall(env, 'getListLength', [listValue]))
    const hasAny = makeFCall(env, 'greaterThan', [lenId, ts.factory.createBigIntLiteral('0n')])
    const idxExpr =
      method === 'pop'
        ? makeFCall(env, 'subtraction', [lenId, ts.factory.createBigIntLiteral('1n')])
        : ts.factory.createNumericLiteral(0)
    const valExpr = makeFCall(env, 'getCorrespondingValueFromList', [listValue, idxExpr])
    const setOut = makeFCall(env, 'setLocalVariable', [
      ts.factory.createPropertyAccessExpression(outId, 'localVariable'),
      valExpr
    ])
    const removeCall = makeFCall(env, 'removeValueFromList', [listValue, idxExpr])
    const branch = makeFCall(env, 'doubleBranch', [
      hasAny,
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock(
          [
            ts.factory.createExpressionStatement(setOut),
            ts.factory.createExpressionStatement(removeCall)
          ],
          true
        )
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([], true)
      )
    ])
    const stmts = [listInit, lenDecl, outDecl, ts.factory.createExpressionStatement(branch)]
    return withSameRange(
      makeIife(stmts, ts.factory.createPropertyAccessExpression(outId, 'value')),
      expr
    )
  }

  if (method === 'splice') {
    if (args.length !== 2) {
      fail(env, expr, 'splice() only supports (start, deleteCount)')
    }
    const startExpr = coerceIndexArg(args[0], 'splice() start')
    const deleteExpr = coerceIndexArg(args[1], 'splice() deleteCount')
    const startName = `__gsts_splice_start_${tempId}`
    const startId = ts.factory.createIdentifier(startName)
    const startDecl = makeConst(startName, startExpr)
    const countName = `__gsts_splice_count_${tempId}`
    const countId = ts.factory.createIdentifier(countName)
    const countDecl = makeConst(countName, deleteExpr)
    const removedName = `__gsts_splice_out_${tempId}`
    const removedId = ts.factory.createIdentifier(removedName)
    const removedDecl = makeLocalVarInit(env, removedName, `${listType}_list`)
    const shouldLoop = makeFCall(env, 'greaterThan', [
      countId,
      ts.factory.createBigIntLiteral('0n')
    ])
    const loopEnd = makeFCall(env, 'subtraction', [countId, ts.factory.createBigIntLiteral('1n')])
    const breakCall = ts.factory.createExpressionStatement(
      ts.factory.createCallExpression(ts.factory.createIdentifier('breakLoop'), undefined, [])
    )
    const lenExpr = makeFCall(env, 'getListLength', [listValue])
    const hasIndex = makeFCall(env, 'logicalAndOperation', [
      makeFCall(env, 'greaterThanOrEqualTo', [startId, ts.factory.createBigIntLiteral('0n')]),
      makeFCall(env, 'lessThan', [startId, lenExpr])
    ])
    const takeValue = makeFCall(env, 'getCorrespondingValueFromList', [listValue, startId])
    const insertRemoved = makeFCall(env, 'insertValueIntoList', [
      ts.factory.createPropertyAccessExpression(removedId, 'value'),
      makeFCall(env, 'getListLength', [
        ts.factory.createPropertyAccessExpression(removedId, 'value')
      ]),
      takeValue
    ])
    const removeValue = makeFCall(env, 'removeValueFromList', [listValue, startId])
    const spliceBranch = makeFCall(env, 'doubleBranch', [
      hasIndex,
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock(
          [
            ts.factory.createExpressionStatement(insertRemoved),
            ts.factory.createExpressionStatement(removeValue)
          ],
          true
        )
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([breakCall], true)
      )
    ])
    const loopBody = ts.factory.createBlock(
      [ts.factory.createExpressionStatement(spliceBranch)],
      true
    )
    const loopFn = ts.factory.createArrowFunction(
      undefined,
      undefined,
      [
        ts.factory.createParameterDeclaration(undefined, undefined, `_i`),
        ts.factory.createParameterDeclaration(undefined, undefined, 'breakLoop')
      ],
      undefined,
      undefined,
      loopBody
    )
    const loopCall = makeFCall(env, 'finiteLoop', [
      ts.factory.createNumericLiteral(0),
      loopEnd,
      loopFn
    ])
    const loopBranch = makeFCall(env, 'doubleBranch', [
      shouldLoop,
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([ts.factory.createExpressionStatement(loopCall)], true)
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([], true)
      )
    ])
    const stmts = [
      listInit,
      startDecl,
      countDecl,
      removedDecl,
      ts.factory.createExpressionStatement(loopBranch)
    ]
    return withSameRange(
      makeIife(stmts, ts.factory.createPropertyAccessExpression(removedId, 'value')),
      expr
    )
  }

  if (method === 'slice') {
    if (args.length > 2) {
      fail(env, expr, 'slice() supports at most two arguments')
    }
    const lenName = `__gsts_slice_len_${tempId}`
    const lenId = ts.factory.createIdentifier(lenName)
    const lenDecl = makeLocalVarInit(env, lenName, 'int')
    const lenVal = ts.factory.createPropertyAccessExpression(lenId, 'value')
    const setLen = makeFCall(env, 'setLocalVariable', [
      ts.factory.createPropertyAccessExpression(lenId, 'localVariable'),
      makeFCall(env, 'getListLength', [listValue])
    ])

    const startName = `__gsts_slice_start_${tempId}`
    const startId = ts.factory.createIdentifier(startName)
    const startInit = args[0]
      ? coerceIndexArg(args[0], 'slice() start')
      : ts.factory.createBigIntLiteral('0n')
    const startDecl = makeLocalVarInit(env, startName, 'int')
    const setStart = makeFCall(env, 'setLocalVariable', [
      ts.factory.createPropertyAccessExpression(startId, 'localVariable'),
      startInit
    ])
    const startVal = ts.factory.createPropertyAccessExpression(startId, 'value')

    const endName = `__gsts_slice_end_${tempId}`
    const endId = ts.factory.createIdentifier(endName)
    const endInit = args[1] ? coerceIndexArg(args[1], 'slice() end') : lenVal
    const endDecl = makeLocalVarInit(env, endName, 'int')
    const setEnd = makeFCall(env, 'setLocalVariable', [
      ts.factory.createPropertyAccessExpression(endId, 'localVariable'),
      endInit
    ])
    const endVal = ts.factory.createPropertyAccessExpression(endId, 'value')

    const zero = ts.factory.createBigIntLiteral('0n')
    const one = ts.factory.createBigIntLiteral('1n')

    const clampStart = makeFCall(env, 'doubleBranch', [
      makeFCall(env, 'lessThan', [startVal, zero]),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock(
          [
            ts.factory.createExpressionStatement(
              makeFCall(env, 'setLocalVariable', [
                ts.factory.createPropertyAccessExpression(startId, 'localVariable'),
                zero
              ])
            )
          ],
          true
        )
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([], true)
      )
    ])

    const clampEnd = makeFCall(env, 'doubleBranch', [
      makeFCall(env, 'lessThan', [endVal, zero]),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock(
          [
            ts.factory.createExpressionStatement(
              makeFCall(env, 'setLocalVariable', [
                ts.factory.createPropertyAccessExpression(endId, 'localVariable'),
                zero
              ])
            )
          ],
          true
        )
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([], true)
      )
    ])

    const clampEndToLen = makeFCall(env, 'doubleBranch', [
      makeFCall(env, 'greaterThan', [endVal, lenVal]),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock(
          [
            ts.factory.createExpressionStatement(
              makeFCall(env, 'setLocalVariable', [
                ts.factory.createPropertyAccessExpression(endId, 'localVariable'),
                lenVal
              ])
            )
          ],
          true
        )
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([], true)
      )
    ])

    const outName = `__gsts_slice_out_${tempId}`
    const outId = ts.factory.createIdentifier(outName)
    const outDecl = makeLocalVarInit(env, outName, `${listType}_list`)

    const shouldLoop = makeFCall(env, 'logicalAndOperation', [
      makeFCall(env, 'greaterThan', [endVal, startVal]),
      makeFCall(env, 'greaterThan', [lenVal, zero])
    ])
    const loopEnd = makeFCall(env, 'subtraction', [endVal, one])
    const idxName = `_i`
    const idxId = ts.factory.createIdentifier(idxName)
    const hasIndex = makeFCall(env, 'logicalAndOperation', [
      makeFCall(env, 'greaterThanOrEqualTo', [idxId, zero]),
      makeFCall(env, 'lessThan', [idxId, lenVal])
    ])
    const valueExpr = makeFCall(env, 'getCorrespondingValueFromList', [listValue, idxId])
    const insertCall = makeFCall(env, 'insertValueIntoList', [
      ts.factory.createPropertyAccessExpression(outId, 'value'),
      makeFCall(env, 'getListLength', [ts.factory.createPropertyAccessExpression(outId, 'value')]),
      valueExpr
    ])
    const loopBranch = makeFCall(env, 'doubleBranch', [
      hasIndex,
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([ts.factory.createExpressionStatement(insertCall)], true)
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock(
          [
            ts.factory.createExpressionStatement(
              ts.factory.createCallExpression(
                ts.factory.createIdentifier('breakLoop'),
                undefined,
                []
              )
            )
          ],
          true
        )
      )
    ])
    const loopFn = ts.factory.createArrowFunction(
      undefined,
      undefined,
      [
        ts.factory.createParameterDeclaration(undefined, undefined, idxName),
        ts.factory.createParameterDeclaration(undefined, undefined, 'breakLoop')
      ],
      undefined,
      undefined,
      ts.factory.createBlock([ts.factory.createExpressionStatement(loopBranch)], true)
    )
    const loopCall = makeFCall(env, 'finiteLoop', [startVal, loopEnd, loopFn])
    const loopGuard = makeFCall(env, 'doubleBranch', [
      shouldLoop,
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([ts.factory.createExpressionStatement(loopCall)], true)
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([], true)
      )
    ])

    const stmts = [
      listInit,
      lenDecl,
      startDecl,
      endDecl,
      ts.factory.createExpressionStatement(setLen),
      ts.factory.createExpressionStatement(setStart),
      ts.factory.createExpressionStatement(setEnd),
      ts.factory.createExpressionStatement(clampStart),
      ts.factory.createExpressionStatement(clampEnd),
      ts.factory.createExpressionStatement(clampEndToLen),
      outDecl,
      ts.factory.createExpressionStatement(loopGuard)
    ]
    return withSameRange(
      makeIife(stmts, ts.factory.createPropertyAccessExpression(outId, 'value')),
      expr
    )
  }

  return null
}
