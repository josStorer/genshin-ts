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
