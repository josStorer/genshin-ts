import type { g } from '../runtime/core.js'

/** g 上声明节点图的入口工厂（不含 Lua 的 clientControlScript）；Lua 编译据此识别节点图入口。 */
export const NODE_GRAPH_ENTRY_FACTORIES = [
  'server',
  'characterSkill',
  'characterControlSkill',
  'creationSkill',
  'creationStatus',
  'creationStatusDecision',
  'boolFilter',
  'intFilter'
] as const

type ListedFactory = (typeof NODE_GRAPH_ENTRY_FACTORIES)[number]
type GraphFactory = Exclude<keyof typeof g, 'clientControlScript'>
type SameKeys<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
type AssertTrue<T extends true> = T
/** g 增删入口工厂而未同步上面的列表时，这里会产生类型错误。 */
export type NodeGraphEntryFactoriesInSync = AssertTrue<SameKeys<ListedFactory, GraphFactory>>
