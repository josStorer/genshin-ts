import ts from 'typescript'

import { fail } from './errors.js'
import { transformExpression } from './expr.js'
import { stabilizeListIterationSource } from './list_utils.js'
import type { Env } from './types.js'
import { asBlock, isTrueLike, makeFCall, withSameRange } from './utils.js'

type TransformBlockFn = (env: Env, context: ts.TransformationContext, block: ts.Block) => ts.Block

function unwrapExpression(expr: ts.Expression): ts.Expression {
  let cur = expr
  while (true) {
    if (ts.isParenthesizedExpression(cur)) {
      cur = cur.expression
      continue
    }
    if (ts.isAsExpression(cur)) {
      cur = cur.expression
      continue
    }
    if (ts.isTypeAssertionExpression(cur)) {
      cur = cur.expression
      continue
    }
    return cur
  }
}

function isIntOneLiteral(expr: ts.Expression): boolean {
  const unwrapped = unwrapExpression(expr)
  if (ts.isNumericLiteral(unwrapped)) {
    const raw = unwrapped.text.replace(/_/g, '')
    return raw === '1'
  }
  if (ts.isBigIntLiteral(unwrapped)) {
    const raw = unwrapped.text.slice(0, -1).replace(/_/g, '')
    return raw === '1'
  }
  if (ts.isPrefixUnaryExpression(unwrapped) && unwrapped.operator === ts.SyntaxKind.PlusToken) {
    return isIntOneLiteral(unwrapped.operand)
  }
  return false
}

function loopBodyArrow(loopVarName: string, bodyBlock: ts.Block) {
  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(undefined, undefined, loopVarName),
      ts.factory.createParameterDeclaration(undefined, undefined, 'breakLoop')
    ],
    undefined,
    undefined,
    bodyBlock
  )
}

export function transformForStatement(
  env: Env,
  context: ts.TransformationContext,
  s: ts.ForStatement,
  transformBlock: TransformBlockFn
): ts.Statement {
  // for(;;) / for(i=...; i<...; i++)
  let loopVar = '_i'
  let startExpr: ts.Expression = ts.factory.createNumericLiteral(0)
  let endExpr: ts.Expression = ts.factory.createNumericLiteral(env.loopMax)
  let loopVarSymbol: ts.Symbol | null = null

  const isBigIntExpr = (expr: ts.Expression): boolean => {
    const t = env.checker.getTypeAtLocation(expr)
    return (t.flags & ts.TypeFlags.BigIntLike) !== 0
  }

  // init: let i = start
  if (s.initializer && ts.isVariableDeclarationList(s.initializer)) {
    const decl = s.initializer.declarations[0]
    if (decl && ts.isIdentifier(decl.name)) {
      loopVar = decl.name.text
      loopVarSymbol = env.checker.getSymbolAtLocation(decl.name) ?? null
      if (decl.initializer) startExpr = decl.initializer
    }
  }

  // incrementor: 仅支持 i++ / ++i / i += 1 / i = i + 1（否则 finiteLoop 语义会偏离）
  if (s.incrementor) {
    const inc = s.incrementor
    const ok =
      (ts.isPostfixUnaryExpression(inc) &&
        inc.operator === ts.SyntaxKind.PlusPlusToken &&
        ts.isIdentifier(inc.operand) &&
        inc.operand.text === loopVar) ||
      (ts.isPrefixUnaryExpression(inc) &&
        inc.operator === ts.SyntaxKind.PlusPlusToken &&
        ts.isIdentifier(inc.operand) &&
        inc.operand.text === loopVar) ||
      (ts.isBinaryExpression(inc) &&
        inc.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken &&
        ts.isIdentifier(inc.left) &&
        inc.left.text === loopVar &&
        isIntOneLiteral(inc.right)) ||
      (ts.isBinaryExpression(inc) &&
        inc.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isIdentifier(inc.left) &&
        inc.left.text === loopVar &&
        ts.isBinaryExpression(inc.right) &&
        inc.right.operatorToken.kind === ts.SyntaxKind.PlusToken &&
        ((ts.isIdentifier(inc.right.left) &&
          inc.right.left.text === loopVar &&
          isIntOneLiteral(inc.right.right)) ||
          (ts.isIdentifier(inc.right.right) &&
            inc.right.right.text === loopVar &&
            isIntOneLiteral(inc.right.left))))
    if (!ok) {
      fail(env, inc, 'for incrementor must be i++ or ++i or i += 1 or i = i + 1')
    }
  }

  // condition: i < end / i <= end
  if (s.condition && ts.isBinaryExpression(s.condition) && ts.isIdentifier(s.condition.left)) {
    const leftId = s.condition.left.text
    if (leftId === loopVar) {
      const op = s.condition.operatorToken.kind
      if (op === ts.SyntaxKind.LessThanToken || op === ts.SyntaxKind.LessThanEqualsToken) {
        const rawEnd = s.condition.right
        if (op === ts.SyntaxKind.LessThanEqualsToken) {
          endExpr = rawEnd
        } else {
          if (ts.isNumericLiteral(rawEnd)) {
            endExpr = ts.factory.createNumericLiteral(Number(rawEnd.text) - 1)
          } else if (ts.isBigIntLiteral(rawEnd)) {
            const v = BigInt(rawEnd.text.slice(0, -1)) - 1n
            endExpr = ts.factory.createBigIntLiteral(`${v}n`)
          } else {
            endExpr = ts.factory.createBinaryExpression(
              rawEnd,
              ts.SyntaxKind.MinusToken,
              isBigIntExpr(rawEnd)
                ? ts.factory.createBigIntLiteral('1n')
                : ts.factory.createNumericLiteral(1)
            )
          }
        }
      } else {
        fail(
          env,
          s.condition,
          'condition expression must be a binary expression with the loop variable < or <=, ' +
            'if you need to use other expressions, please use a while loop or use if statement in the loop body'
        )
      }
    } else {
      fail(
        env,
        s.condition,
        'condition expression must be a binary expression with the loop variable, ' +
          'if you need to use other expressions, please use a while loop or use if statement in the loop body'
      )
    }
  }

  const loopIndexSymbols = loopVarSymbol
    ? new Set([...(env.loopIndexSymbols ?? []), loopVarSymbol])
    : env.loopIndexSymbols
  const bodyBlock = transformBlock(
    {
      ...env,
      breakName: 'breakLoop',
      breakKind: 'loop',
      continueInfo: undefined,
      loopIndexSymbols
    },
    context,
    asBlock(s.statement)
  )

  const call = makeFCall(env, 'finiteLoop', [
    transformExpression(env, context, startExpr),
    transformExpression(env, context, endExpr),
    loopBodyArrow(loopVar, bodyBlock)
  ])
  return withSameRange(ts.factory.createExpressionStatement(call), s)
}

export function transformWhileStatement(
  env: Env,
  context: ts.TransformationContext,
  s: ts.WhileStatement,
  transformBlock: TransformBlockFn
): ts.Statement {
  if (isTrueLike(s.expression)) {
    const bodyBlock = transformBlock(
      { ...env, breakName: 'breakLoop', breakKind: 'loop', continueInfo: undefined },
      context,
      asBlock(s.statement)
    )
    const call = makeFCall(env, 'finiteLoop', [
      ts.factory.createNumericLiteral(0),
      ts.factory.createNumericLiteral(env.loopMax),
      loopBodyArrow('_i', bodyBlock)
    ])
    return withSameRange(ts.factory.createExpressionStatement(call), s)
  }

  // while(cond) -> finiteLoop(0, loopMax, (..., breakLoop)=> doubleBranch(cond, () => { body }, () => { breakLoop() }))
  const bodyBlock = transformBlock(
    { ...env, breakName: 'breakLoop', breakKind: 'loop', continueInfo: undefined },
    context,
    asBlock(s.statement)
  )
  const cond = transformExpression(env, context, s.expression)
  const gated = makeFCall(env, 'doubleBranch', [
    cond,
    ts.factory.createArrowFunction(undefined, undefined, [], undefined, undefined, bodyBlock),
    ts.factory.createArrowFunction(
      undefined,
      undefined,
      [],
      undefined,
      undefined,
      ts.factory.createBlock(
        [
          ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(ts.factory.createIdentifier('breakLoop'), undefined, [])
          )
        ],
        true
      )
    )
  ])
  const loopBody = ts.factory.createBlock([ts.factory.createExpressionStatement(gated)], true)
  const call = makeFCall(env, 'finiteLoop', [
    ts.factory.createNumericLiteral(0),
    ts.factory.createNumericLiteral(env.loopMax),
    loopBodyArrow('_i', loopBody)
  ])
  return withSameRange(ts.factory.createExpressionStatement(call), s)
}

export function transformDoStatement(
  env: Env,
  context: ts.TransformationContext,
  s: ts.DoStatement,
  transformBlock: TransformBlockFn
): ts.Statement {
  // do { body } while(cond) -> finiteLoop(0, loopMax, (..., breakLoop)=> { body; doubleBranch(cond, ()=>{}, ()=>breakLoop()) })
  const bodyBlock = transformBlock(
    {
      ...env,
      breakName: 'breakLoop',
      breakKind: 'loop',
      continueInfo: { kind: 'doWhile', condition: s.expression }
    },
    context,
    asBlock(s.statement)
  )
  const cond = transformExpression(env, context, s.expression)
  const check = makeFCall(env, 'doubleBranch', [
    cond,
    ts.factory.createArrowFunction(
      undefined,
      undefined,
      [],
      undefined,
      undefined,
      ts.factory.createBlock([], true)
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
            ts.factory.createCallExpression(ts.factory.createIdentifier('breakLoop'), undefined, [])
          )
        ],
        true
      )
    )
  ])
  const loopBody = ts.factory.createBlock(
    [...bodyBlock.statements, ts.factory.createExpressionStatement(check)],
    true
  )
  const call = makeFCall(env, 'finiteLoop', [
    ts.factory.createNumericLiteral(0),
    ts.factory.createNumericLiteral(env.loopMax),
    loopBodyArrow('_i', loopBody)
  ])
  return withSameRange(ts.factory.createExpressionStatement(call), s)
}

export function transformForOfStatement(
  env: Env,
  context: ts.TransformationContext,
  s: ts.ForOfStatement,
  transformBlock: TransformBlockFn
): ts.Statement {
  let itemName = '_v'
  if (ts.isVariableDeclarationList(s.initializer)) {
    const decl = s.initializer.declarations[0]
    if (decl && ts.isIdentifier(decl.name)) itemName = decl.name.text
  } else if (ts.isIdentifier(s.initializer)) {
    itemName = s.initializer.text
  }
  const bodyBlock = transformBlock(
    { ...env, breakName: 'breakLoop', breakKind: 'loop', continueInfo: undefined },
    context,
    asBlock(s.statement)
  )
  const call = makeFCall(env, 'listIterationLoop', [
    stabilizeListIterationSource(
      env,
      s.expression,
      transformExpression(env, context, s.expression)
    ),
    ts.factory.createArrowFunction(
      undefined,
      undefined,
      [
        ts.factory.createParameterDeclaration(undefined, undefined, itemName),
        ts.factory.createParameterDeclaration(undefined, undefined, 'breakLoop')
      ],
      undefined,
      undefined,
      bodyBlock
    )
  ])
  return withSameRange(ts.factory.createExpressionStatement(call), s)
}
