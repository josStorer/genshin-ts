import ts from 'typescript'
import type { Plugin, TransformationContext } from 'typescript-to-lua'
import { standardVisitors } from 'typescript-to-lua/dist/transformation/visitors/index.js'

/**
 * TSTL 1.34.0 没有公开导出这两个转换工具。
 * 原生 Lua 回调需要用它们保持 self 参数和表达式求值顺序；集中在这里便于升级时核对。
 * package.json 锁定 1.34.0，升级时需同时验证 class、回调和多参数调用的产物。
 */
export {
  ContextType,
  getFunctionContextType
} from 'typescript-to-lua/dist/transformation/utils/function-context.js'
export { transformOrderedExpressions } from 'typescript-to-lua/dist/transformation/visitors/expression-list.js'

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
