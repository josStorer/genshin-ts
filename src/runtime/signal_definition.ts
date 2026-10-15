/** 信号的中立元数据；两侧只在参数值类型上各自映射。 */
export const luaSignalWriters = {
  int: 'AddInt',
  float: 'AddFloat',
  str: 'AddString',
  bool: 'AddBool',
  vec3: 'AddVector3',
  guid: 'AddGuid',
  entity: 'AddEntity',
  prefab_id: 'AddPrefabId',
  config_id: 'AddConfigId'
} as const
export type SignalScalarType = keyof typeof luaSignalWriters | 'faction'
export type SignalParamType = SignalScalarType | `${SignalScalarType}_list` | 'unknown'
export type SignalParamEntry = readonly [name: string, type: SignalParamType]
export type SignalParamEntries = readonly SignalParamEntry[]
export interface SignalDefinition<
  Name extends string = string,
  Params extends SignalParamEntries = SignalParamEntries
> {
  readonly __gstsSignal: true
  readonly name: Name
  readonly params: Params
}
export function defineSignal<const Name extends string, const Params extends SignalParamEntries>(
  this: void,
  name: Name,
  params: Params
): SignalDefinition<Name, Params> {
  return { __gstsSignal: true, name, params }
}
