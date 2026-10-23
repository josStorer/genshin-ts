import type { Script } from './lua_host.js'

export type LuaParam =
  | { type: 'number'; default?: number }
  | { type: 'string'; default?: string }
  | { type: 'boolean'; default?: boolean }
export type LuaParamValues<S extends Record<string, LuaParam>> = {
  [K in keyof S]: S[K] extends { type: 'number' }
    ? number
    : S[K] extends { type: 'string' }
      ? string
      : S[K] extends { type: 'boolean' }
        ? boolean
        : never
}
/** 读取编辑器脚本变量并检查类型。编辑器里没有这个变量时用 default；变量建了但留空，字符串会读到空串，不会用 default。控件请用 findControl/requireControl 按名称路径查找。 */
export declare function readParams<const S extends Record<string, LuaParam>>(
  this: void,
  script: Script,
  schema: S
): LuaParamValues<S>
