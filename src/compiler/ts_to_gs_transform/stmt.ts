import ts from 'typescript'

import { CLIENT_LITERAL_ARGUMENT_INDEXES_BY_SUB_TYPE } from '../../definitions/client_method_modes.js'
import { inferConcreteTypeFromType, inferListTypeFromType } from '../../shared/ts_list_utils.js'
import { isEntityLikeType as isSharedEntityLikeType } from '../../shared/ts_type_utils.js'
import {
  isConstEvaluableExpression,
  isPureLiteralExpression,
  tryEvaluateConstExpression
} from './const_eval.js'
import { fail } from './errors.js'
import {
  extractTimerHandleMeta,
  isDeclarationName,
  propagateTimerHandleMeta,
  recordTimerHandleMeta,
  shouldCaptureIdentifier,
  transformExpression
} from './expr.js'
import { isArrayLikeExpression, SUPPORTED_LIST_METHODS } from './list_utils.js'
import { inferListTypeFromTypeNode, inferListTypeFromTypeString, type ListType } from './lists.js'
import {
  transformDoStatement,
  transformForOfStatement,
  transformForStatement,
  transformWhileStatement
} from './loops.js'
import { getFMethodCall, isFMethodCall } from './matcher.js'
import { isAssignmentLikeOperator } from './ops.js'
import type { CollectionSourceKind, Env, VarPlan, VarPlanEntry } from './types.js'
import { asBlock, isClientFMethodAvailable, makeFCall, withSameRange } from './utils.js'

function inferListConcreteType(env: Env, t: ts.Type, declTypeNode?: ts.TypeNode): ListType | null {
  const byNode = inferListTypeFromTypeNode(declTypeNode)
  if (byNode) return byNode

  return (
    inferListTypeFromType(env.checker, t, env.file) ??
    inferListTypeFromTypeString(env.checker.typeToString(t))
  )
}

function isCollectionType(env: Env, t: ts.Type): boolean {
  // union/intersection：只要任一分支是 collection，就按 collection 处理（保守，避免漏判）
  if (t.flags & ts.TypeFlags.Union) {
    const u = t as ts.UnionType
    return u.types.some((tt) => isCollectionType(env, tt))
  }
  if (t.flags & ts.TypeFlags.Intersection) {
    const it = t as ts.IntersectionType
    return it.types.some((tt) => isCollectionType(env, tt))
  }

  if (env.checker.isArrayType(t) || env.checker.isTupleType(t)) return true
  const s = env.checker.typeToString(t)
  if (/\bRecord<.+>$/.test(s)) return true
  if (/\bMap<.+>$/.test(s)) return true
  return false
}

function unwrapCollectionSourceExpression(expr: ts.Expression): ts.Expression {
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
    if (ts.isSatisfiesExpression(cur)) {
      cur = cur.expression
      continue
    }
    return cur
  }
}

function isListWrapperCallExpression(expr: ts.Expression): expr is ts.CallExpression {
  const unwrapped = unwrapCollectionSourceExpression(expr)
  return (
    ts.isCallExpression(unwrapped) &&
    ts.isIdentifier(unwrapped.expression) &&
    unwrapped.expression.text === 'list'
  )
}

function needsCollectionRebindSnapshot(env: Env, expr: ts.Expression): boolean {
  const unwrapped = unwrapCollectionSourceExpression(expr)
  if (isListWrapperCallExpression(unwrapped)) return true
  if (isFMethodCall(env, unwrapped, ['copyList', 'assemblyList'])) return true
  if (ts.isArrayLiteralExpression(unwrapped)) return true
  return false
}

function inferBasicType(env: Env, t: ts.Type): ListType | null {
  if (t.flags & ts.TypeFlags.Union) {
    const u = t as ts.UnionType
    let base: ListType | null = null
    for (const tt of u.types) {
      const next = inferBasicType(env, tt)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }
  if (t.flags & ts.TypeFlags.Intersection) {
    const it = t as ts.IntersectionType
    let base: ListType | null = null
    for (const tt of it.types) {
      const next = inferBasicType(env, tt)
      if (!next) return null
      if (!base) base = next
      else if (base !== next) return null
    }
    return base
  }
  return inferConcreteTypeFromType(env.checker, env.checker.getBaseTypeOfLiteralType(t), env.file)
}

function makeLocalVarTypeString(
  env: Env,
  decl: ts.VariableDeclaration,
  plan: VarPlanEntry
): string {
  if (decl.initializer && ts.isPropertyAccessExpression(decl.initializer)) {
    if (decl.initializer.name.text === 'length') {
      if (isArrayLikeExpression(env, decl.initializer.expression)) {
        return 'int'
      }
    }
  }
  const t = env.checker.getTypeAtLocation(decl.name)

  if (plan.isCollection) {
    const ct = inferListConcreteType(env, t, decl.type)
    if (!ct) {
      fail(env, decl, `cannot infer list type, please add type annotation`)
    }
    return `${ct}_list`
  }

  const base = inferBasicType(env, t)
  if (base) return base
  fail(env, decl, `cannot infer type, please add type annotation`)
}

function buildVarPlan(env: Env, body: ts.Block): VarPlan {
  type Decl = {
    decl: ts.VariableDeclaration
    symbol: ts.Symbol
    isLet: boolean
    isConst: boolean
    inLoop: boolean
  }
  type Usage = {
    // 变量是否发生了会改变后续观测结果的修改, 包括绑定赋值和集合元素修改。
    modified: boolean
    // 变量类型是否为列表或字典等集合类型。
    isCollection: boolean
    // 变量类型是否为可以映射到千星奇域局部变量的基础值类型。
    isBasic: boolean
    // 变量声明或后续代码中是否出现过对该变量的写入。
    hasWrite: boolean
    // 变量绑定本身是否被赋值或重新赋值, 例如 `x = ...`。
    // 集合元素修改, 例如 `x[idx] = ...` 或 `x.set(...)`, 不应设置该标记。
    hasBindingWrite: boolean
    // 变量是否在 exec 主体中被写入, 用于区分顶层初始化和运行期写入。
    wroteInExec: boolean
    // 变量写入表达式中是否包含随机值, 随机写入通常需要局部变量稳定结果。
    hasRandomWrite: boolean
    // 变量被读取的次数, 用于判断多次读取是否需要保持同一个快照。
    readCount: number
    // 变量是否在循环体内被读取, 循环读取通常需要保持单次迭代内的稳定语义。
    readInLoop: boolean
    // 集合变量的来源类型: 实时引用、显式复制、临时集合或未知来源。
    collectionSourceKind?: CollectionSourceKind
  }

  const decls = new Map<ts.Symbol, Decl>()
  const usage = new Map<ts.Symbol, Usage>()

  const ensureUsage = (symbol: ts.Symbol): Usage => {
    let u = usage.get(symbol)
    if (!u) {
      u = {
        modified: false,
        isCollection: false,
        isBasic: false,
        hasWrite: false,
        hasBindingWrite: false,
        wroteInExec: false,
        hasRandomWrite: false,
        readCount: 0,
        readInLoop: false
      }
      usage.set(symbol, u)
    }
    return u
  }

  // read-only 白名单：只有仅命中这些 gsts.f.* 的参数位，collection 才不会被判为“可能被修改”
  const readOnlyFAllArgs = new Set<string>([
    'createDictionary',
    'listIterationLoop',
    'searchListAndReturnValueId',
    'getListLength',
    'getCorrespondingValueFromList',
    'getMaximumValueFromList',
    'getMinimumValueFromList',
    'listIncludesThisValue',
    'setLocalVariable',
    'getLocalVariable',
    'createEntity',
    'createPrefab',
    'createPrefabGroup',
    'createProjectile',
    'invokeDeckSelector',
    'modifyMiniMapMarkerActivationStatus',
    'setPlayerLeaderboardScoreAsAFloat',
    'setPlayerLeaderboardScoreAsAnInteger',
    'setPlayerSCurrentChannel',
    'weightedRandom',

    // TODO type: 'data' 都是只读的, 但目前暂时无用
    'equal',
    'logicalNotOperation',
    'logicalAndOperation',
    'logicalOrOperation',
    'addition',
    'subtraction',
    'multiplication',
    'division',
    'moduloOperation',
    'exponentiation',
    'lessThan',
    'lessThanOrEqualTo',
    'greaterThan',
    'greaterThanOrEqualTo',
    'arithmeticSquareRootOperation',
    'absoluteValueOperation',
    'takeSmallerValue',
    'takeLargerValue',
    'leftShiftOperation',
    'rightShiftOperation',
    'bitwiseAnd',
    'bitwiseOr',
    'xorExclusiveOr',
    'bitwiseComplement'
  ])

  const isReadOnlyFArg = (method: string, argIndex: number): boolean => {
    if (readOnlyFAllArgs.has(method)) return true
    if (env.graphDocumentType === 'client' && env.clientSubType) {
      const literalIndexes = CLIENT_LITERAL_ARGUMENT_INDEXES_BY_SUB_TYPE[
        env.clientSubType
      ] as Readonly<Record<string, readonly number[]>>
      if (literalIndexes[method]?.includes(argIndex)) return true
    }
    // mutate 节点中只有部分参数是只读：concatenateList(target, input) 的 input
    if (method === 'concatenateList') return argIndex === 1
    return false
  }

  const isEntityReceiverType = (t: ts.Type, location: ts.Node): boolean => {
    if (t.flags & ts.TypeFlags.Union) {
      return (t as ts.UnionType).types.some((tt) => isEntityReceiverType(tt, location))
    }
    if (t.flags & ts.TypeFlags.Intersection) {
      return (t as ts.IntersectionType).types.some((tt) => isEntityReceiverType(tt, location))
    }
    return isSharedEntityLikeType(env.checker, t, location)
  }

  const isEntityCustomVariableGetCall = (expr: ts.Expression): expr is ts.CallExpression => {
    if (!ts.isCallExpression(expr)) return false
    if (!ts.isPropertyAccessExpression(expr.expression)) return false
    if (expr.expression.name.text !== 'get' && expr.expression.name.text !== 'getCustomVariable') {
      return false
    }
    const receiver = unwrapCollectionSourceExpression(expr.expression.expression)
    return isEntityReceiverType(env.checker.getTypeAtLocation(receiver), receiver)
  }

  const isListWrapperCall = (expr: ts.Expression): expr is ts.CallExpression => {
    return (
      ts.isCallExpression(expr) &&
      ts.isIdentifier(expr.expression) &&
      expr.expression.text === 'list'
    )
  }

  const classifyCollectionSource = (expr: ts.Expression | undefined): CollectionSourceKind => {
    if (!expr) return 'unknown'
    const unwrapped = unwrapCollectionSourceExpression(expr)

    if (ts.isIdentifier(unwrapped)) {
      const sourceSym = env.checker.getSymbolAtLocation(unwrapped)
      const sourceKind = sourceSym ? usage.get(sourceSym)?.collectionSourceKind : undefined
      if (sourceKind) return sourceKind
    }

    // `f.get(...)` 已经带有节点图变量元数据推断, 裸调用就应视为实时引用,
    // 不应依赖用户再手动追加 `.asType(...)` / `.asDict(...)`。
    if (isFMethodCall(env, unwrapped, ['get'])) return 'liveRef'

    if (ts.isCallExpression(unwrapped) && ts.isPropertyAccessExpression(unwrapped.expression)) {
      const method = unwrapped.expression.name.text
      if (method === 'asType' || method === 'asDict') {
        const base = unwrapCollectionSourceExpression(unwrapped.expression.expression)
        // `getNodeGraphVariable` / `getCustomVariable` 返回 generic, 需要通过 asType/asDict
        // 确认集合类型。这里保留 `get` 仅用于兼容 `f.get(...).asType(...)` 这种冗余写法。
        if (isFMethodCall(env, base, ['getNodeGraphVariable', 'get', 'getCustomVariable'])) {
          return 'liveRef'
        }
        if (isEntityCustomVariableGetCall(base)) return 'liveRef'
      }
    }

    if (isFMethodCall(env, unwrapped, ['copyList'])) {
      return 'copy'
    }

    if (isFMethodCall(env, unwrapped, ['assemblyList'])) {
      const firstArg = unwrapped.arguments[0]
      if (firstArg) {
        const firstArgType = env.checker.getTypeAtLocation(firstArg)
        if (isCollectionType(env, firstArgType)) return 'copy'
      }
      return 'temporary'
    }

    if (isFMethodCall(env, unwrapped, ['createDictionary', 'assemblyDictionary'])) {
      return 'temporary'
    }
    if (
      isListWrapperCall(unwrapped) ||
      ts.isArrayLiteralExpression(unwrapped) ||
      ts.isObjectLiteralExpression(unwrapped)
    ) {
      return 'temporary'
    }

    return 'unknown'
  }

  const hasRandomCall = (expr: ts.Expression): boolean => {
    let found = false
    const visitExpr = (node: ts.Node) => {
      if (found) return
      if (ts.isFunctionLike(node)) return
      if (ts.isCallExpression(node)) {
        const f = getFMethodCall(env, node)
        if (f) {
          const method = f.method.toLowerCase()
          if (method.includes('random') || method.includes('query')) {
            found = true
            return
          }
        }
      }
      ts.forEachChild(node, visitExpr)
    }
    visitExpr(expr)
    return found
  }

  const getSymbol = (id: ts.Identifier): ts.Symbol | null =>
    env.checker.getSymbolAtLocation(id) ?? null

  const collectDecls = (n: ts.Node, inLoop: boolean) => {
    if (ts.isFunctionLike(n)) return

    if (ts.isVariableStatement(n)) {
      const flags = n.declarationList.flags
      const isLet = (flags & ts.NodeFlags.Let) !== 0
      const isConst = (flags & ts.NodeFlags.Const) !== 0
      for (const d of n.declarationList.declarations) {
        if (!ts.isIdentifier(d.name)) continue
        const symbol = getSymbol(d.name)
        if (!symbol) continue
        if (decls.has(symbol)) continue
        decls.set(symbol, { decl: d, symbol, isLet, isConst, inLoop })
        const t = env.checker.getTypeAtLocation(d.name)
        const u = ensureUsage(symbol)
        u.isCollection = isCollectionType(env, t)
        if (u.isCollection) {
          u.collectionSourceKind = classifyCollectionSource(d.initializer)
        }
        u.isBasic = inferBasicType(env, t) !== null
        if (d.initializer) {
          u.hasWrite = true
          if (hasRandomCall(d.initializer)) u.hasRandomWrite = true
        }
      }
    }

    if (ts.isWhileStatement(n)) {
      collectDecls(n.expression, inLoop)
      collectDecls(n.statement, true)
      return
    }
    if (ts.isDoStatement(n)) {
      collectDecls(n.statement, true)
      collectDecls(n.expression, inLoop)
      return
    }
    if (ts.isForStatement(n)) {
      if (n.initializer) collectDecls(n.initializer, inLoop)
      if (n.condition) collectDecls(n.condition, inLoop)
      if (n.incrementor) collectDecls(n.incrementor, inLoop)
      collectDecls(n.statement, true)
      return
    }
    if (ts.isForOfStatement(n)) {
      collectDecls(n.initializer, inLoop)
      collectDecls(n.expression, inLoop)
      collectDecls(n.statement, true)
      return
    }

    ts.forEachChild(n, (c) => collectDecls(c, inLoop))
  }

  collectDecls(body, false)

  const markModified = (symbol: ts.Symbol | null) => {
    if (!symbol) return
    const u = ensureUsage(symbol)
    u.modified = true
  }

  const markWrite = (symbol: ts.Symbol | null, inExec: boolean, hasRandom: boolean) => {
    if (!symbol) return
    const u = ensureUsage(symbol)
    u.hasWrite = true
    u.hasBindingWrite = true
    if (inExec) u.wroteInExec = true
    if (hasRandom) u.hasRandomWrite = true
    u.modified = true
  }

  const markRead = (symbol: ts.Symbol | null, inLoop: boolean) => {
    if (!symbol) return
    const u = ensureUsage(symbol)
    u.readCount += 1
    if (inLoop) u.readInLoop = true
  }

  const isWriteIdentifier = (id: ts.Identifier): boolean => {
    const parent = id.parent
    if (!parent) return false
    if (ts.isBinaryExpression(parent)) {
      if (parent.left === id && isAssignmentLikeOperator(parent.operatorToken.kind)) return true
    }
    if (
      (ts.isPrefixUnaryExpression(parent) || ts.isPostfixUnaryExpression(parent)) &&
      (parent.operator === ts.SyntaxKind.PlusPlusToken ||
        parent.operator === ts.SyntaxKind.MinusMinusToken) &&
      parent.operand === id
    ) {
      return true
    }
    if (ts.isForOfStatement(parent) && parent.initializer === id) return true
    if (ts.isForInStatement(parent) && parent.initializer === id) return true
    if (ts.isBindingElement(parent) && parent.name === id) return true
    return false
  }

  const shouldCountRead = (id: ts.Identifier): boolean => {
    if (isDeclarationName(id)) return false
    const parent = id.parent
    if (!parent) return true
    if (ts.isTypeNode(parent)) return false
    if (ts.isPropertyAccessExpression(parent) && parent.name === id) return false
    if (ts.isPropertyAssignment(parent) && parent.name === id) return false
    if (ts.isMethodDeclaration(parent) && parent.name === id) return false
    if (ts.isMethodSignature(parent) && parent.name === id) return false
    if (ts.isPropertySignature(parent) && parent.name === id) return false
    if (ts.isPropertyDeclaration(parent) && parent.name === id) return false
    if (isWriteIdentifier(id)) return false
    return true
  }

  const visit = (n: ts.Node, inExec: boolean, inLoop: boolean) => {
    if (ts.isIdentifier(n)) {
      const sym = getSymbol(n)
      if (sym && decls.has(sym) && shouldCountRead(n)) {
        markRead(sym, inLoop)
      }
    }

    if (ts.isBinaryExpression(n)) {
      const op = n.operatorToken.kind
      if (isAssignmentLikeOperator(op)) {
        if (ts.isIdentifier(n.left)) {
          markWrite(getSymbol(n.left), inExec, hasRandomCall(n.right))
        } else if (op === ts.SyntaxKind.EqualsToken && ts.isElementAccessExpression(n.left)) {
          const base = n.left.expression
          if (ts.isIdentifier(base)) markModified(getSymbol(base))
        }
      }
    }

    // ++a / a++
    if (ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) {
      const op = n.operator
      if (op === ts.SyntaxKind.PlusPlusToken || op === ts.SyntaxKind.MinusMinusToken) {
        if (ts.isIdentifier(n.operand)) markWrite(getSymbol(n.operand), inExec, false)
      }
    }

    if (ts.isCallExpression(n)) {
      // arr.push(...) 这种：把 arr 视为修改
      if (ts.isPropertyAccessExpression(n.expression) && ts.isIdentifier(n.expression.expression)) {
        const base = n.expression.expression
        const sym = getSymbol(base)
        const u = sym ? usage.get(sym) : undefined
        if (u?.isCollection) markModified(sym)
      }

      const f = getFMethodCall(env, n)
      if (f) {
        n.arguments.forEach((arg, idx) => {
          if (!ts.isIdentifier(arg)) return
          const sym = getSymbol(arg)
          const u = sym ? usage.get(sym) : undefined
          if (!u?.isCollection) return
          if (!isReadOnlyFArg(f.method, idx)) markModified(sym)
        })
      } else {
        n.arguments.forEach((arg) => {
          if (!ts.isIdentifier(arg)) return
          const sym = getSymbol(arg)
          const u = sym ? usage.get(sym) : undefined
          if (u?.isCollection) markModified(sym)
        })
      }

      if (
        ts.isPropertyAccessExpression(n.expression) &&
        SUPPORTED_LIST_METHODS.has(n.expression.name.text)
      ) {
        // Scalar `let` declarations already require local variables. Visiting inline callbacks is
        // still necessary for collection mutations and non-pure `const` read/snapshot analysis.
        for (const arg of n.arguments) {
          if (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)) {
            visit(arg.body, true, true)
          }
        }
      }
    }

    if (ts.isFunctionLike(n)) return

    if (ts.isIfStatement(n)) {
      visit(n.expression, inExec, inLoop)
      visit(n.thenStatement, true, inLoop)
      if (n.elseStatement) visit(n.elseStatement, true, inLoop)
      return
    }
    if (ts.isWhileStatement(n)) {
      visit(n.expression, inExec, true)
      visit(n.statement, true, true)
      return
    }
    if (ts.isDoStatement(n)) {
      visit(n.statement, true, true)
      visit(n.expression, inExec, true)
      return
    }
    if (ts.isForStatement(n)) {
      if (n.initializer) visit(n.initializer, inExec, inLoop)
      if (n.condition) visit(n.condition, inExec, true)
      if (n.incrementor) visit(n.incrementor, inExec, true)
      visit(n.statement, true, true)
      return
    }
    if (ts.isForOfStatement(n)) {
      visit(n.initializer, inExec, inLoop)
      visit(n.expression, inExec, inLoop)
      visit(n.statement, true, true)
      return
    }
    if (ts.isSwitchStatement(n)) {
      visit(n.expression, inExec, inLoop)
      for (const clause of n.caseBlock.clauses) {
        if (ts.isCaseClause(clause)) {
          visit(clause.expression, inExec, inLoop)
        }
        clause.statements.forEach((stmt) => visit(stmt, true, inLoop))
      }
      return
    }

    ts.forEachChild(n, (c) => visit(c, inExec, inLoop))
  }

  visit(body, false, false)

  const out = new Map<ts.Symbol, VarPlanEntry>()
  for (const [symbol, decl] of decls) {
    const u = ensureUsage(symbol)
    let needsLocalVar = false
    if (u.isCollection) {
      if (u.collectionSourceKind === 'copy') {
        needsLocalVar = u.readCount > 0 || u.modified
      } else if (u.collectionSourceKind === 'liveRef') {
        // 顺序代码里的 live collection 绑定重赋值可以保持 JS 变量重绑定语义:
        //   let xs = f.get(...)
        //   xs[0] = 1n      // 写回原始 live list
        //   xs = list(...)
        //   xs[0] = 2n      // 写入新的 list
        //
        // 但如果绑定重赋值发生在 if/loop/switch 等运行期控制流中, 后续引用需要在运行期
        // 根据实际分支结果决定指向哪个集合, 只能用 LocalVariable 作为统一状态承载。
        needsLocalVar = u.modified && u.hasBindingWrite && u.wroteInExec
      } else {
        needsLocalVar = u.modified
      }
    } else if (u.isBasic) {
      if (decl.isLet || u.wroteInExec) {
        needsLocalVar = true
      } else {
        const initExpr = decl.decl.initializer
        const isPureInit = initExpr
          ? isPureLiteralExpression(initExpr) || isConstEvaluableExpression(env, initExpr)
          : false
        const readsMultiple = u.readCount > 1 || (u.readInLoop && !decl.inLoop)
        const promoteConstReads = decl.isConst && readsMultiple && !isPureInit
        const promoteRandom = u.hasRandomWrite && readsMultiple
        // 不支持局部变量的客户端图无法保存一次求值快照。这里保留直接节点连线，
        // 让 transform 成功，并由 gsts/client-repeated-evaluation 提醒重复求值的语义差异。
        needsLocalVar =
          isClientFMethodAvailable(env, 'initLocalVariable') && (promoteConstReads || promoteRandom)
      }
    }
    out.set(symbol, {
      needsLocalVar,
      isCollection: u.isCollection,
      collectionSourceKind: u.collectionSourceKind
    })
  }

  return out
}

type SwitchControlKind = 'int' | 'str'

function inferSwitchControlKind(env: Env, expr: ts.Expression): SwitchControlKind {
  const unwrapped = unwrapCaseExpression(tryEvaluateConstExpression(env, expr) ?? expr)
  if (ts.isStringLiteral(unwrapped) || ts.isNoSubstitutionTemplateLiteral(unwrapped)) {
    return 'str'
  }
  if (ts.isNumericLiteral(unwrapped)) {
    const raw = unwrapped.text.replace(/_/g, '')
    if (/[.eE]/.test(raw)) {
      fail(env, expr, 'switch control expression must be int or str')
    }
    return 'int'
  }
  if (ts.isBigIntLiteral(unwrapped)) return 'int'
  if (
    ts.isPrefixUnaryExpression(unwrapped) &&
    (unwrapped.operator === ts.SyntaxKind.PlusToken ||
      unwrapped.operator === ts.SyntaxKind.MinusToken)
  ) {
    const operand = unwrapCaseExpression(unwrapped.operand)
    if (ts.isNumericLiteral(operand)) {
      const raw = operand.text.replace(/_/g, '')
      if (/[.eE]/.test(raw)) {
        fail(env, expr, 'switch control expression must be int or str')
      }
      return 'int'
    }
    if (ts.isBigIntLiteral(operand)) return 'int'
  }

  const inferFromType = (t: ts.Type): SwitchControlKind | null => {
    if (t.flags & ts.TypeFlags.Union) {
      const u = t as ts.UnionType
      let base: SwitchControlKind | null = null
      for (const tt of u.types) {
        const next = inferFromType(tt)
        if (!next) return null
        if (!base) base = next
        else if (base !== next) return null
      }
      return base
    }
    if (t.flags & ts.TypeFlags.Intersection) {
      const it = t as ts.IntersectionType
      let base: SwitchControlKind | null = null
      for (const tt of it.types) {
        const next = inferFromType(tt)
        if (!next) return null
        if (!base) base = next
        else if (base !== next) return null
      }
      return base
    }
    if (t.flags & ts.TypeFlags.StringLike) return 'str'
    if (t.flags & ts.TypeFlags.BigIntLike) return 'int'
    if (t.flags & ts.TypeFlags.NumberLiteral) {
      const lit = t as ts.LiteralType
      if (typeof lit.value === 'number' && Number.isInteger(lit.value)) return 'int'
    }
    const s = env.checker.typeToString(t)
    if (s === 'IntValue') return 'int'
    if (s === 'StrValue') return 'str'
    const base = inferConcreteTypeFromType(env.checker, t, env.file)
    if (base === 'int' || base === 'str') return base
    return null
  }

  const t = env.checker.getTypeAtLocation(expr)
  const base = inferFromType(t)
  if (base) return base
  fail(env, expr, 'switch control expression must be int or str')
}

function unwrapCaseExpression(expr: ts.Expression): ts.Expression {
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

function caseKeyFromExpression(
  env: Env,
  expr: ts.Expression,
  controlKind: SwitchControlKind
): string {
  const n = unwrapCaseExpression(tryEvaluateConstExpression(env, expr) ?? expr)

  if (controlKind === 'str') {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text
    fail(env, expr, 'switch case expression must be a string literal')
  }

  const ensureIntText = (raw: string): string => {
    const trimmed = raw.replace(/_/g, '')
    if (/[.eE]/.test(trimmed)) {
      fail(env, expr, 'switch case expression must be an integer literal')
    }
    return trimmed
  }

  if (ts.isNumericLiteral(n)) {
    return ensureIntText(n.text)
  }
  if (ts.isBigIntLiteral(n)) {
    const raw = n.text.slice(0, -1)
    return ensureIntText(raw)
  }
  if (
    ts.isPrefixUnaryExpression(n) &&
    (n.operator === ts.SyntaxKind.PlusToken || n.operator === ts.SyntaxKind.MinusToken)
  ) {
    const sign = n.operator === ts.SyntaxKind.MinusToken ? '-' : ''
    const operand = unwrapCaseExpression(n.operand)
    if (ts.isNumericLiteral(operand)) {
      return sign + ensureIntText(operand.text)
    }
    if (ts.isBigIntLiteral(operand)) {
      const raw = operand.text.slice(0, -1)
      return sign + ensureIntText(raw)
    }
  }

  fail(env, expr, 'switch case expression must be an integer literal')
}

function lastNonEmptyStatement(stmts: readonly ts.Statement[]): ts.Statement | null {
  for (let i = stmts.length - 1; i >= 0; i--) {
    const s = stmts[i]
    if (ts.isEmptyStatement(s)) continue
    return s
  }
  return null
}

function nestReturnEnv(env: Env): Env {
  const depth = env.returnDepth ?? 0
  return { ...env, returnDepth: depth + 1 }
}

function collectBindingNames(name: ts.BindingName, out: Set<string>) {
  if (ts.isIdentifier(name)) {
    out.add(name.text)
    return
  }
  for (const el of name.elements) {
    if (!ts.isBindingElement(el)) continue
    collectBindingNames(el.name, out)
  }
}

function collectBindingSymbols(name: ts.BindingName, checker: ts.TypeChecker, out: Set<ts.Symbol>) {
  if (ts.isIdentifier(name)) {
    const sym = checker.getSymbolAtLocation(name)
    if (sym) out.add(sym)
    return
  }
  for (const el of name.elements) {
    if (!ts.isBindingElement(el)) continue
    collectBindingSymbols(el.name, checker, out)
  }
}

function collectLocalNames(
  body: ts.Block,
  params: ts.NodeArray<ts.ParameterDeclaration>
): Set<string> {
  const out = new Set<string>()
  params.forEach((p) => collectBindingNames(p.name, out))
  const visit = (node: ts.Node) => {
    if (node !== body && ts.isFunctionLike(node)) return
    if (ts.isVariableDeclaration(node)) {
      collectBindingNames(node.name, out)
    } else if (ts.isCatchClause(node) && node.variableDeclaration) {
      collectBindingNames(node.variableDeclaration.name, out)
    }
    ts.forEachChild(node, visit)
  }
  body.statements.forEach((s) => visit(s))
  return out
}

function collectLocalSymbols(
  body: ts.Block,
  params: ts.NodeArray<ts.ParameterDeclaration>,
  checker: ts.TypeChecker
): Set<ts.Symbol> {
  const out = new Set<ts.Symbol>()
  params.forEach((p) => collectBindingSymbols(p.name, checker, out))
  const visit = (node: ts.Node) => {
    if (node !== body && ts.isFunctionLike(node)) return
    if (ts.isVariableDeclaration(node)) {
      collectBindingSymbols(node.name, checker, out)
    } else if (ts.isCatchClause(node) && node.variableDeclaration) {
      collectBindingSymbols(node.variableDeclaration.name, checker, out)
    }
    ts.forEachChild(node, visit)
  }
  body.statements.forEach((s) => visit(s))
  return out
}

function collectLocalVarNames(plan: VarPlan): Set<string> {
  const out = new Set<string>()
  for (const [sym, entry] of plan.entries()) {
    if (!entry.needsLocalVar) continue
    const decls = sym.declarations ?? []
    for (const d of decls) {
      if (ts.isVariableDeclaration(d) && ts.isIdentifier(d.name)) {
        out.add(d.name.text)
      }
    }
  }
  return out
}

function collectLocalVarSymbols(plan: VarPlan): Set<ts.Symbol> {
  const out = new Set<ts.Symbol>()
  for (const [sym, entry] of plan.entries()) {
    if (entry.needsLocalVar) out.add(sym)
  }
  return out
}

function validateNoMutableOuterCaptures(env: Env, body: ts.ConciseBody): void {
  if (env.graphDocumentType !== 'client') return

  const isInsideBody = (node: ts.Node) => {
    let current: ts.Node | undefined = node
    while (current) {
      if (current === body) return true
      current = current.parent
    }
    return false
  }

  const visit = (node: ts.Node) => {
    if (
      ts.isIdentifier(node) &&
      node.text !== 'gsts' &&
      node.text !== env.gstsIdent &&
      shouldCaptureIdentifier(node)
    ) {
      const rawSymbol = env.checker.getSymbolAtLocation(node)
      const symbol =
        rawSymbol && (rawSymbol.flags & ts.SymbolFlags.Alias) !== 0
          ? env.checker.getAliasedSymbol(rawSymbol)
          : rawSymbol
      for (const declaration of symbol?.getDeclarations() ?? []) {
        if (!ts.isVariableDeclaration(declaration) || isInsideBody(declaration)) continue
        if (declaration.getSourceFile().isDeclarationFile) continue
        const list = declaration.parent
        if (!ts.isVariableDeclarationList(list)) continue
        if ((list.flags & ts.NodeFlags.Const) !== 0) continue
        fail(
          env,
          node,
          `client graph cannot capture mutable outer variable "${node.text}"; declare it inside the handler or use explicit client graph storage`
        )
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(body)
}

function collapseClientFilterReturns(statements: readonly ts.Statement[]): ts.Expression | null {
  const firstIndex = statements.findIndex((statement) => !ts.isEmptyStatement(statement))
  if (firstIndex < 0) return null
  const statement = statements[firstIndex]
  const rest = statements.slice(firstIndex + 1)

  if (ts.isReturnStatement(statement)) return statement.expression ?? null
  if (!ts.isIfStatement(statement)) return null

  const thenStatements = ts.isBlock(statement.thenStatement)
    ? statement.thenStatement.statements
    : [statement.thenStatement]
  const whenTrue = collapseClientFilterReturns(thenStatements)
  if (!whenTrue) return null

  const elseStatements = statement.elseStatement
    ? ts.isBlock(statement.elseStatement)
      ? statement.elseStatement.statements
      : [statement.elseStatement]
    : rest
  const whenFalse = collapseClientFilterReturns(elseStatements)
  if (!whenFalse) return null

  return ts.factory.createConditionalExpression(
    statement.expression,
    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    whenTrue,
    ts.factory.createToken(ts.SyntaxKind.ColonToken),
    whenFalse
  )
}

function flattenClientFilterReturns(body: ts.Block): ts.Block {
  for (let index = 0; index < body.statements.length; index += 1) {
    const expression = collapseClientFilterReturns(body.statements.slice(index))
    if (!expression) continue
    return ts.factory.updateBlock(body, [
      ...body.statements.slice(0, index),
      ts.factory.createReturnStatement(expression)
    ])
  }
  return body
}

function transformReturnExpression(
  env: Env,
  context: ts.TransformationContext,
  expression: ts.Expression
): ts.Expression {
  const transformed = transformExpression(env, context, expression)
  if (
    env.graphDocumentType === 'client' &&
    env.clientHandler &&
    env.clientSubType === 'int_filter' &&
    inferBasicType(env, env.checker.getTypeAtLocation(expression)) === 'float'
  ) {
    return makeFCall(env, 'dataTypeConversion', [
      transformed,
      ts.factory.createStringLiteral('int')
    ])
  }
  return transformed
}

function tryTransformCollectionRebindSnapshot(
  env: Env,
  context: ts.TransformationContext,
  stmt: ts.ExpressionStatement
): ts.Statement[] | null {
  const expr = stmt.expression
  if (!ts.isBinaryExpression(expr)) return null
  if (expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return null
  if (!ts.isIdentifier(expr.left)) return null

  const sym = env.checker.getSymbolAtLocation(expr.left)
  const plan = sym ? env.varPlan?.get(sym) : undefined
  const captureInfo = sym ? env.timerCaptureMap?.get(sym) : undefined
  if (captureInfo?.useLocalVar) return null
  if (!plan?.isCollection || plan.needsLocalVar) return null
  if (!needsCollectionRebindSnapshot(env, expr.right)) return null

  const concreteType = inferListConcreteType(env, env.checker.getTypeAtLocation(expr.left))
  if (!concreteType) return null

  const localId = ts.factory.createIdentifier(`__gsts_collection_rebind_${env.tempCounter++}`)
  const rhs = transformExpression(env, context, expr.right)

  return [
    withSameRange(
      ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
          [
            ts.factory.createVariableDeclaration(
              localId,
              undefined,
              undefined,
              makeFCall(env, 'initLocalVariable', [
                ts.factory.createStringLiteral(`${concreteType}_list`)
              ])
            )
          ],
          ts.NodeFlags.Const
        )
      ),
      stmt
    ),
    withSameRange(
      ts.factory.createExpressionStatement(
        makeFCall(env, 'setLocalVariable', [
          ts.factory.createPropertyAccessExpression(localId, 'localVariable'),
          rhs
        ])
      ),
      stmt
    ),
    withSameRange(
      ts.factory.createExpressionStatement(
        ts.factory.createAssignment(
          ts.factory.createIdentifier(expr.left.text),
          ts.factory.createPropertyAccessExpression(localId, 'value')
        )
      ),
      stmt
    )
  ]
}

export function transformBlockStatements(
  env: Env,
  context: ts.TransformationContext,
  stmts: readonly ts.Statement[]
): ts.Statement[] {
  const lastNonEmptyIdx = (() => {
    for (let i = stmts.length - 1; i >= 0; i -= 1) {
      if (!ts.isEmptyStatement(stmts[i])) return i
    }
    return -1
  })()
  const out: ts.Statement[] = []
  for (let i = 0; i < stmts.length; i += 1) {
    const s = stmts[i]
    if (ts.isTryStatement(s)) {
      fail(env, s, 'try/catch/finally is not supported (node graph has no JS exception semantics)')
    }
    if (ts.isThrowStatement(s)) {
      fail(env, s, 'throw is not supported (node graph has no JS exception semantics)')
    }
    if (ts.isForInStatement(s)) {
      fail(env, s, 'for...in is not supported')
    }
    if (ts.isBlock(s)) {
      fail(env, s, 'block is not supported')
    }
    if (ts.isLabeledStatement(s)) {
      fail(env, s, 'labeled statement is not supported')
    }
    if (ts.isWithStatement(s)) {
      fail(env, s, 'with is not supported')
    }
    if (ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s)) {
      fail(
        env,
        s,
        'function/class declarations inside callbacks are not supported (please declare functions outside the callback with the prefix "gsts")'
      )
    }

    if (ts.isIfStatement(s)) {
      const cond = transformExpression(env, context, s.expression)
      const tBlock = transformBlock(nestReturnEnv(env), context, asBlock(s.thenStatement))
      const fBlock = s.elseStatement
        ? transformBlock(nestReturnEnv(env), context, asBlock(s.elseStatement))
        : ts.factory.createBlock([], true)
      const call = makeFCall(env, 'doubleBranch', [
        cond,
        ts.factory.createArrowFunction(undefined, undefined, [], undefined, undefined, tBlock),
        ts.factory.createArrowFunction(undefined, undefined, [], undefined, undefined, fBlock)
      ])
      out.push(withSameRange(ts.factory.createExpressionStatement(call), s))
      continue
    }

    if (ts.isSwitchStatement(s)) {
      if (
        env.graphDocumentType === 'client' &&
        (env.clientSubType === 'bool_filter' || env.clientSubType === 'int_filter')
      ) {
        fail(
          env,
          s,
          'client filter graphs do not support switch; use if/return or a conditional expression'
        )
      }
      const controlKind = inferSwitchControlKind(env, s.expression)
      const controlExpr = transformExpression(env, context, s.expression)

      type ClauseInfo = {
        clause: ts.CaseOrDefaultClause
        key: string | null
        isDefault: boolean
        hasBody: boolean
        lastStmt: ts.Statement | null
      }

      const clauses = s.caseBlock.clauses
      const entries: ClauseInfo[] = []
      let sawDefault = false

      for (let i = 0; i < clauses.length; i++) {
        const clause = clauses[i]
        const isDefault = ts.isDefaultClause(clause)
        if (isDefault) {
          if (sawDefault) fail(env, clause, 'switch has multiple default clauses')
          sawDefault = true
        }
        const key = isDefault ? null : caseKeyFromExpression(env, clause.expression, controlKind)
        const lastStmt = lastNonEmptyStatement(clause.statements)
        const hasBody = lastStmt !== null

        if (hasBody && i < clauses.length - 1) {
          if (
            !lastStmt ||
            (!ts.isBreakStatement(lastStmt) &&
              !ts.isReturnStatement(lastStmt) &&
              !ts.isContinueStatement(lastStmt))
          ) {
            fail(
              env,
              clause,
              'switch fallthrough with body is not supported; add break/return/continue'
            )
          }
        }

        entries.push({ clause, key, isDefault, hasBody, lastStmt })
      }

      const findNextBodyTarget = (
        startIdx: number
      ): { kind: 'default' } | { kind: 'case'; key: string } | null => {
        for (let i = startIdx + 1; i < entries.length; i++) {
          const entry = entries[i]
          if (!entry.hasBody) continue
          if (entry.isDefault) return { kind: 'default' }
          if (entry.key) return { kind: 'case', key: entry.key }
        }
        return null
      }

      const makeAliasValue = (
        target: { kind: 'default' } | { kind: 'case'; key: string }
      ): ts.Expression => {
        if (target.kind === 'default') {
          return ts.factory.createStringLiteral('default')
        }
        if (controlKind === 'int') {
          if (target.key.startsWith('-')) {
            return ts.factory.createPrefixUnaryExpression(
              ts.SyntaxKind.MinusToken,
              ts.factory.createNumericLiteral(target.key.slice(1))
            )
          }
          return ts.factory.createNumericLiteral(target.key)
        }
        return ts.factory.createStringLiteral(target.key)
      }

      const makeBranchFn = (clause: ts.CaseOrDefaultClause): ts.ArrowFunction => {
        const clauseBlock = ts.factory.createBlock(clause.statements, true)
        const branchBlock = transformBlock(
          nestReturnEnv({ ...env, breakKind: 'switch' }),
          context,
          clauseBlock
        )
        return ts.factory.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          undefined,
          branchBlock
        )
      }

      const emptyBranchFn = ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.factory.createBlock([], true)
      )

      const props: ts.ObjectLiteralElementLike[] = []
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        const nextTarget = entry.hasBody ? null : findNextBodyTarget(i)

        if (entry.isDefault) {
          if (entry.hasBody) {
            props.push(ts.factory.createPropertyAssignment('default', makeBranchFn(entry.clause)))
          } else if (nextTarget) {
            props.push(ts.factory.createPropertyAssignment('default', makeAliasValue(nextTarget)))
          }
          continue
        }

        if (!entry.key) continue

        if (entry.hasBody) {
          props.push(
            ts.factory.createPropertyAssignment(
              ts.factory.createStringLiteral(entry.key),
              makeBranchFn(entry.clause)
            )
          )
          continue
        }

        if (nextTarget) {
          props.push(
            ts.factory.createPropertyAssignment(
              ts.factory.createStringLiteral(entry.key),
              makeAliasValue(nextTarget)
            )
          )
          continue
        }

        props.push(
          ts.factory.createPropertyAssignment(
            ts.factory.createStringLiteral(entry.key),
            emptyBranchFn
          )
        )
      }

      const useClientDoubleBranchFallback =
        env.graphDocumentType === 'client' &&
        !isClientFMethodAvailable(env, 'multipleBranches') &&
        isClientFMethodAvailable(env, 'doubleBranch') &&
        isClientFMethodAvailable(env, 'equal')

      if (useClientDoubleBranchFallback) {
        const controlName = `__gsts_switch_control_${env.tempCounter++}`
        const controlId = ts.factory.createIdentifier(controlName)
        out.push(
          ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
              [ts.factory.createVariableDeclaration(controlId, undefined, undefined, controlExpr)],
              ts.NodeFlags.Const
            )
          )
        )

        const resolveBodyClause = (startIndex: number): ts.CaseOrDefaultClause | null => {
          for (let index = startIndex; index < entries.length; index += 1) {
            if (entries[index].hasBody) return entries[index].clause
          }
          return null
        }
        const defaultIndex = entries.findIndex((entry) => entry.isDefault)
        const defaultClause = defaultIndex >= 0 ? resolveBodyClause(defaultIndex) : null
        let fallback = defaultClause ? makeBranchFn(defaultClause) : emptyBranchFn

        const caseEntries = entries
          .map((entry, index) => ({ entry, index }))
          .filter(({ entry }) => !entry.isDefault && entry.key !== null)

        for (let index = caseEntries.length - 1; index >= 0; index -= 1) {
          const { entry, index: entryIndex } = caseEntries[index]
          const caseValue = makeAliasValue({ kind: 'case', key: entry.key! })
          const targetClause = resolveBodyClause(entryIndex)
          const trueBranch = targetClause ? makeBranchFn(targetClause) : emptyBranchFn
          const nextCall = makeFCall(env, 'doubleBranch', [
            makeFCall(env, 'equal', [controlId, caseValue]),
            trueBranch,
            fallback
          ])
          fallback = ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            undefined,
            ts.factory.createBlock([ts.factory.createExpressionStatement(nextCall)], true)
          )
        }

        const firstStatement =
          fallback.body && ts.isBlock(fallback.body) ? fallback.body.statements[0] : undefined
        if (firstStatement && ts.isExpressionStatement(firstStatement)) {
          out.push(withSameRange(firstStatement, s))
        } else {
          out.push(
            withSameRange(
              ts.factory.createExpressionStatement(
                ts.factory.createCallExpression(fallback, undefined, [])
              ),
              s
            )
          )
        }
        continue
      }

      const call = makeFCall(env, 'multipleBranches', [
        controlExpr,
        ts.factory.createObjectLiteralExpression(props, true)
      ])
      out.push(withSameRange(ts.factory.createExpressionStatement(call), s))
      continue
    }

    if (ts.isForStatement(s)) {
      out.push(
        transformForStatement(env, context, s, (e, ctx, block) =>
          transformBlock(nestReturnEnv(e), ctx, block)
        )
      )
      continue
    }

    if (ts.isWhileStatement(s)) {
      out.push(
        transformWhileStatement(env, context, s, (e, ctx, block) =>
          transformBlock(nestReturnEnv(e), ctx, block)
        )
      )
      continue
    }

    if (ts.isDoStatement(s)) {
      out.push(
        transformDoStatement(env, context, s, (e, ctx, block) =>
          transformBlock(nestReturnEnv(e), ctx, block)
        )
      )
      continue
    }

    if (ts.isForOfStatement(s)) {
      out.push(
        transformForOfStatement(env, context, s, (e, ctx, block) =>
          transformBlock(nestReturnEnv(e), ctx, block)
        )
      )
      continue
    }

    if (ts.isBreakStatement(s)) {
      if (s.label) {
        fail(env, s, 'labeled break is not supported')
      }
      if (env.breakKind === 'switch') {
        break // switch case: end this branch without terminating the whole exec path
      }
      if (!env.breakName) {
        fail(env, s, 'break is only supported inside loop bodies')
      }
      out.push(
        withSameRange(
          ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
              ts.factory.createIdentifier(env.breakName),
              undefined,
              []
            )
          ),
          s
        )
      )
      break // 丢弃当前块内 break 后的不可达语句，避免生成错误连线
    }

    if (ts.isContinueStatement(s)) {
      if (s.label) {
        fail(env, s, 'labeled continue is not supported')
      }
      if (!env.breakName) {
        fail(env, s, 'continue is only supported inside loop bodies')
      }
      if (env.continueInfo?.kind === 'doWhile') {
        const cond = transformExpression(env, context, env.continueInfo.condition)
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
                  ts.factory.createCallExpression(
                    ts.factory.createIdentifier(env.breakName),
                    undefined,
                    []
                  )
                )
              ],
              true
            )
          )
        ])
        out.push(withSameRange(ts.factory.createExpressionStatement(check), s))
      }
      out.push(
        withSameRange(ts.factory.createExpressionStatement(makeFCall(env, 'continue', [])), s)
      )
      out.push(withSameRange(ts.factory.createReturnStatement(), s))
      break
    }

    if (ts.isReturnStatement(s)) {
      const returnMode = env.returnMode ?? 'handler'
      if (returnMode === 'value') {
        const label =
          env.graphDocumentType === 'client'
            ? env.clientHandler &&
              (env.clientSubType === 'bool_filter' || env.clientSubType === 'int_filter')
              ? 'client filter handler'
              : 'client gsts function'
            : 'gstsServer'
        if (!s.expression) {
          fail(env, s, `${label} return must return a value`)
        }
        if ((env.returnDepth ?? 0) > 0) {
          fail(env, s, `${label} return must be at top-level (not inside if/loop/switch)`)
        }
        if (i !== lastNonEmptyIdx) {
          fail(env, s, `${label} return must be the last statement in the function body`)
        }
        const expr = transformReturnExpression(env, context, s.expression)
        out.push(withSameRange(ts.factory.updateReturnStatement(s, expr), s))
        break
      }
      if (s.expression) {
        fail(
          env,
          s,
          'return <expr> is not supported (node graph return currently only supports terminating branches, not carrying return values)'
        )
      }
      out.push(withSameRange(ts.factory.createExpressionStatement(makeFCall(env, 'return', [])), s))
      out.push(withSameRange(ts.factory.createReturnStatement(), s))
      break
    }

    if (ts.isExpressionStatement(s)) {
      const collectionRebind = tryTransformCollectionRebindSnapshot(env, context, s)
      if (collectionRebind) {
        out.push(...collectionRebind)
        continue
      }
      out.push(
        withSameRange(
          ts.factory.updateExpressionStatement(s, transformExpression(env, context, s.expression)),
          s
        )
      )
      continue
    }

    if (ts.isVariableStatement(s)) {
      const flush = (buf: ts.VariableDeclaration[]) => {
        if (buf.length === 0) return
        out.push(
          withSameRange(
            ts.factory.updateVariableStatement(
              s,
              s.modifiers,
              ts.factory.updateVariableDeclarationList(s.declarationList, buf)
            ),
            s
          )
        )
      }

      const buf: ts.VariableDeclaration[] = []
      const plan = env.varPlan

      for (const d of s.declarationList.declarations) {
        if (!ts.isIdentifier(d.name)) {
          out.push(s)
          // 跳过解构
          continue
        }
        const name = d.name.text
        const sym = env.checker.getSymbolAtLocation(d.name)
        const p = sym ? plan?.get(sym) : undefined

        if (p?.needsLocalVar) {
          flush(buf.splice(0, buf.length))

          const typeStr = makeLocalVarTypeString(env, d, p)
          const initCall = makeFCall(env, 'initLocalVariable', [
            ts.factory.createStringLiteral(typeStr)
          ])
          out.push(
            withSameRange(
              ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                  [
                    ts.factory.createVariableDeclaration(
                      ts.factory.createIdentifier(name),
                      undefined,
                      undefined,
                      initCall
                    )
                  ],
                  ts.NodeFlags.Const
                )
              ),
              d
            )
          )

          if (d.initializer) {
            const rhs = transformExpression(env, context, d.initializer)
            const meta = extractTimerHandleMeta(rhs)
            if (meta && ts.isIdentifier(d.name)) {
              recordTimerHandleMeta(env, d.name, meta)
            } else if (ts.isIdentifier(d.initializer) && ts.isIdentifier(d.name)) {
              propagateTimerHandleMeta(env, d.name, d.initializer)
            }
            out.push(
              withSameRange(
                ts.factory.createExpressionStatement(
                  makeFCall(env, 'setLocalVariable', [
                    ts.factory.createPropertyAccessExpression(
                      ts.factory.createIdentifier(name),
                      'localVariable'
                    ),
                    rhs
                  ])
                ),
                d
              )
            )
          }
          continue
        }

        const init = d.initializer ? transformExpression(env, context, d.initializer) : undefined
        if (d.initializer && ts.isIdentifier(d.name)) {
          const meta = init ? extractTimerHandleMeta(init) : null
          if (meta) {
            recordTimerHandleMeta(env, d.name, meta)
          } else if (ts.isIdentifier(d.initializer)) {
            propagateTimerHandleMeta(env, d.name, d.initializer)
          }
        }
        buf.push(ts.factory.updateVariableDeclaration(d, d.name, d.exclamationToken, d.type, init))
      }

      flush(buf)
      continue
    }

    out.push(s)
  }
  return out
}

export function transformBlock(
  env: Env,
  context: ts.TransformationContext,
  block: ts.Block
): ts.Block {
  const stmts = transformBlockStatements(env, context, block.statements)
  return ts.factory.updateBlock(block, stmts)
}

export function transformGstsServerFunction<
  T extends ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction
>(env: Env, context: ts.TransformationContext, fn: T): T {
  const label = env.graphDocumentType === 'client' ? 'client gsts function' : 'gstsServer'
  const seen = new Set<string>()
  let evtIdent: string | undefined
  let fIdent: string | undefined
  fn.parameters.forEach((p) => {
    if (p.dotDotDotToken || p.initializer || !ts.isIdentifier(p.name)) {
      fail(env, p, `${label} parameters must be identifiers (no destructuring/default/rest)`)
    }
    const name = p.name.text
    if (seen.has(name)) {
      fail(env, p, `${label} parameters must be unique`)
    }
    seen.add(name)
    if (env.graphDocumentType !== 'client') {
      if (name === 'evt') evtIdent = name
      if (name === 'f') fIdent = name
    }
  })

  if (!fn.body) {
    fail(env, fn, `${label} must have an implementation body`)
  }

  let bodyBlock: ts.Block
  if (ts.isBlock(fn.body)) {
    bodyBlock = fn.body
  } else if (ts.isArrowFunction(fn)) {
    bodyBlock = ts.factory.createBlock([ts.factory.createReturnStatement(fn.body)], true)
  } else {
    fail(env, fn, `${label} body must be a block`)
  }

  const env2: Env = {
    ...env,
    evtIdent,
    fIdent,
    serverCtx: env.graphDocumentType !== 'client',
    clientHandler: false,
    returnMode: 'value',
    returnDepth: 0
  }
  validateNoMutableOuterCaptures(env2, bodyBlock)
  const varPlan = buildVarPlan(env2, bodyBlock)
  const localNames = collectLocalNames(bodyBlock, fn.parameters)
  const localVarNames = collectLocalVarNames(varPlan)
  const localSymbols = collectLocalSymbols(bodyBlock, fn.parameters, env.checker)
  const localVarSymbols = collectLocalVarSymbols(varPlan)
  const newBody = transformBlock(
    {
      ...env2,
      varPlan,
      localNames,
      localVarNames,
      localSymbols,
      localVarSymbols
    },
    context,
    bodyBlock
  )

  const prologue: ts.Statement[] = []
  prologue.push(
    ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier(env.gstsIdent),
            undefined,
            undefined,
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('globalThis'),
              'gsts'
            )
          )
        ],
        ts.NodeFlags.Const
      )
    )
  )

  const finalBody =
    prologue.length > 0
      ? ts.factory.updateBlock(newBody, [...prologue, ...newBody.statements])
      : newBody

  if (ts.isArrowFunction(fn)) {
    return ts.factory.updateArrowFunction(
      fn,
      fn.modifiers,
      fn.typeParameters,
      fn.parameters,
      fn.type,
      fn.equalsGreaterThanToken,
      finalBody
    ) as T
  }
  if (ts.isFunctionExpression(fn)) {
    return ts.factory.updateFunctionExpression(
      fn,
      fn.modifiers,
      fn.asteriskToken,
      fn.name,
      fn.typeParameters,
      fn.parameters,
      fn.type,
      finalBody
    ) as T
  }
  return ts.factory.updateFunctionDeclaration(
    fn,
    fn.modifiers,
    fn.asteriskToken,
    fn.name,
    fn.typeParameters,
    fn.parameters,
    fn.type,
    finalBody
  ) as T
}

export function transformHandler(
  env: Env,
  context: ts.TransformationContext,
  fn: ts.ArrowFunction | ts.FunctionExpression,
  override?: {
    fIdent?: string
    evtIdent?: string
    allowClientMutableOuterCaptures?: boolean
    inheritOuterScope?: boolean
  }
) {
  const originalBody = fn.body
  const paramFIdent =
    fn.parameters.length >= 2 && ts.isIdentifier(fn.parameters[1].name)
      ? fn.parameters[1].name.text
      : undefined
  const paramEvtIdent =
    fn.parameters.length >= 1 && ts.isIdentifier(fn.parameters[0].name)
      ? fn.parameters[0].name.text
      : undefined
  const fIdent = override?.fIdent ?? paramFIdent
  const evtIdent = override?.evtIdent ?? paramEvtIdent

  const env2: Env = {
    ...env,
    fIdent,
    evtIdent,
    serverCtx: env.graphDocumentType !== 'client',
    clientHandler: env.graphDocumentType === 'client',
    returnMode:
      env.graphDocumentType === 'client' &&
      (env.clientSubType === 'bool_filter' || env.clientSubType === 'int_filter')
        ? 'value'
        : 'handler',
    returnDepth: 0
  }
  if (!override?.allowClientMutableOuterCaptures) {
    validateNoMutableOuterCaptures(env2, originalBody)
  }
  if (!ts.isBlock(originalBody)) {
    if (env.graphDocumentType !== 'client' || !ts.isArrowFunction(fn)) return fn
    return ts.factory.updateArrowFunction(
      fn,
      fn.modifiers,
      fn.typeParameters,
      fn.parameters,
      fn.type,
      fn.equalsGreaterThanToken,
      transformReturnExpression(env2, context, originalBody)
    )
  }

  const body =
    env2.returnMode === 'value' && env.graphDocumentType === 'client'
      ? flattenClientFilterReturns(originalBody)
      : originalBody

  const ownVarPlan = buildVarPlan(env2, body)
  const varPlan =
    override?.inheritOuterScope && env.varPlan
      ? new Map<ts.Symbol, VarPlanEntry>([...env.varPlan, ...ownVarPlan])
      : ownVarPlan
  const ownLocalNames = collectLocalNames(body, fn.parameters)
  const localNames =
    override?.inheritOuterScope && env.localNames
      ? new Set([...env.localNames, ...ownLocalNames])
      : ownLocalNames
  const localVarNames = collectLocalVarNames(varPlan)
  const ownLocalSymbols = collectLocalSymbols(body, fn.parameters, env.checker)
  const localSymbols =
    override?.inheritOuterScope && env.localSymbols
      ? new Set([...env.localSymbols, ...ownLocalSymbols])
      : ownLocalSymbols
  const localVarSymbols = collectLocalVarSymbols(varPlan)
  const mergedVarPlan = env.varPlan ? new Map([...env.varPlan, ...varPlan]) : varPlan
  const newBody = transformBlock(
    {
      ...env2,
      varPlan: mergedVarPlan,
      localNames,
      localVarNames,
      localSymbols,
      localVarSymbols
    },
    context,
    body
  )

  const prologue: ts.Statement[] = []
  prologue.push(
    ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier(env.gstsIdent),
            undefined,
            undefined,
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('globalThis'),
              'gsts'
            )
          )
        ],
        ts.NodeFlags.Const
      )
    )
  )

  const finalBody =
    prologue.length > 0
      ? ts.factory.updateBlock(newBody, [...prologue, ...newBody.statements])
      : newBody

  if (ts.isArrowFunction(fn)) {
    return ts.factory.updateArrowFunction(
      fn,
      fn.modifiers,
      fn.typeParameters,
      fn.parameters,
      fn.type,
      fn.equalsGreaterThanToken,
      finalBody
    )
  }
  return ts.factory.updateFunctionExpression(
    fn,
    fn.modifiers,
    fn.asteriskToken,
    fn.name,
    fn.typeParameters,
    fn.parameters,
    fn.type,
    finalBody
  )
}
