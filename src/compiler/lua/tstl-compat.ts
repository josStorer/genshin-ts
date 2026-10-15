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
