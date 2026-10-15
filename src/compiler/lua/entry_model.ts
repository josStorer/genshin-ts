import type ts from 'typescript'

/** 入口中可公开的函数；引用已有函数时保留引用节点，不复制函数体。 */
export interface LuaEntryFunction {
  member: ts.ObjectLiteralElementLike
  definition:
    | ts.FunctionDeclaration
    | ts.FunctionExpression
    | ts.ArrowFunction
    | ts.MethodDeclaration
  /** 内联对象方法可能由 TSTL 带上接收者；官方 Invoke 不传这个 self。 */
  removeSelf: boolean
}

/** Lua 入口的公共模型。分析负责合法性，后续阶段只负责生成和输出。 */
export interface LuaEntryModel {
  source: ts.SourceFile
  call: ts.CallExpression
  setup: ts.ArrowFunction | ts.FunctionExpression
  /** 只是用户选择的参数名；生成后指向当前脚本的 _ENV。 */
  environment?: ts.Identifier
  options: { timerClock: 'level' | 'real' }
  /** 保持源码声明顺序，键使用 TS 的 onStart/onUpdate 等名称。 */
  hooks: ReadonlyMap<string, LuaEntryFunction>
  methods: ReadonlyMap<string, LuaEntryFunction>
  /** 回调根部语句，不包含最后的生命周期对象 return。 */
  statements: readonly ts.Statement[]
  returned: ts.ReturnStatement
  /** 只记录实际引用的实例能力；没有能力时不生成作用域。 */
  scope: { signals: boolean; keys: boolean; timers: boolean }
}

export interface LuaEntryAnalysis {
  model?: LuaEntryModel
  diagnostics: readonly ts.Diagnostic[]
}
