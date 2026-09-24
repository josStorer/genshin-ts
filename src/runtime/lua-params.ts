import type { ControlTypes, Script } from './lua-host.js'

export type LuaParam =
  | { type: 'number'; default?: number }
  | { type: 'string'; default?: string }
  | { type: 'boolean'; default?: boolean }
  | { type: 'control'; kind: keyof ControlTypes }
export type LuaParamValues<S extends Record<string, LuaParam>> = {
  [K in keyof S]: S[K] extends { type: 'number' }
    ? number
    : S[K] extends { type: 'string' }
      ? string
      : S[K] extends { type: 'boolean' }
        ? boolean
        : S[K] extends { kind: infer C extends keyof ControlTypes }
          ? ControlTypes[C]
          : never
}
/** 读取编辑器脚本变量并检查类型；未填写的基础值可使用 default，控件必须存在且类型正确。 */
export declare function readParams<const S extends Record<string, LuaParam>>(
  this: void,
  script: Script,
  schema: S
): LuaParamValues<S>
