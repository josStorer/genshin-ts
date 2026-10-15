import { createRequire } from 'node:module'

import ts from 'typescript'
import type { Plugin, TransformationContext } from 'typescript-to-lua'
import {
  ContextType,
  getFunctionContextType
} from 'typescript-to-lua/dist/transformation/utils/function-context.js'

/**
 * TSTL 1.34.0 没有公开导出这两个转换工具。
 * 原生 Lua 回调需要用它们保持 self 参数和表达式求值顺序；集中在这里便于升级时核对。
 * package.json 锁定 1.34.0，升级时需同时验证 class、回调和多参数调用的产物。
 */
export {
  ContextType,
  getFunctionContextType
} from 'typescript-to-lua/dist/transformation/utils/function-context.js'
const require = createRequire(import.meta.url)
/** 只有实际生成 Lua 时才加载访问器，编辑器的入口分析不加载整条转译链。 */
export const transformOrderedExpressions: typeof import('typescript-to-lua/dist/transformation/visitors/expression-list.js').transformOrderedExpressions =
  (...args) => {
    const visitors =
      require('typescript-to-lua/dist/transformation/visitors/expression-list.js') as typeof import('typescript-to-lua/dist/transformation/visitors/expression-list.js')
    return visitors.transformOrderedExpressions(...args)
  }

/** 1.34.0 的 self 分析只读取 Program/checker/options，不需要生成器的可变状态。 */
export function functionNeedsSelf(program: ts.Program, node: ts.Node) {
  const checker = program.getTypeChecker()
  const classify = getFunctionContextType as (
    context: { program: ts.Program; checker: ts.TypeChecker; options: ts.CompilerOptions },
    type: ts.Type
  ) => ContextType
  return (
    classify(
      { program, checker, options: program.getCompilerOptions() },
      checker.getTypeAtLocation(node)
    ) === ContextType.NonVoid
  )
}

export class LocatedLuaError extends Error {
  constructor(
    readonly node: ts.Node,
    cause: unknown
  ) {
    super(cause instanceof Error ? cause.message : String(cause), { cause })
  }
}

/** 包住 TSTL 和本插件的访问器，异常只记最内层位置，不修改 TSTL 或吞掉异常。 */
export function withLuaErrorLocations(plugin: Plugin): Plugin {
  const { standardVisitors } =
    require('typescript-to-lua/dist/transformation/visitors/index.js') as typeof import('typescript-to-lua/dist/transformation/visitors/index.js')
  const kinds = new Set([...Object.keys(standardVisitors), ...Object.keys(plugin.visitors ?? {})])
  return {
    visitors: Object.fromEntries(
      [...kinds].map((kind) => [
        kind,
        {
          priority: 100,
          transform(node: ts.Node, context: TransformationContext) {
            try {
              return context.superTransformNode(node)
            } catch (error) {
              if (error instanceof LocatedLuaError) throw error
              throw new LocatedLuaError(ts.getOriginalNode(node), error)
            }
          }
        }
      ])
    )
  }
}
