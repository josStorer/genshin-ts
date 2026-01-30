export type ListType =
  | 'int'
  | 'float'
  | 'bool'
  | 'str'
  | 'vec3'
  | 'guid'
  | 'entity'
  | 'prefab_id'
  | 'config_id'
  | 'faction'

export function looksLikeEntityTypeString(s: string): boolean {
  const t = s.trim()
  if (
    t === 'entity' ||
    t === 'EntityValue' ||
    t === 'EntityBase' ||
    t === 'EntityAny' ||
    /^(Player|Character|Stage|Object|Creation)Entity$/.test(t)
  ) {
    return true
  }
  if (/^Entity(?:Value|Of)ByMode\s*<.+>$/.test(t)) return true
  if (/^EntityHelper(?:All|For)(?:ByMode)?\s*<.+>$/.test(t)) return true
  if (/^EntityKindMarker\s*<.+>$/.test(t)) return true
  if (t.includes('EntityBase') || t.includes('EntityHelperAllByMode')) return true
  return false
}

export function inferConcreteTypeFromString(s: string): ListType | null {
  const t = s.trim()
  if (t === 'number' || t === 'float' || t === 'FloatValue') return 'float'
  if (t === 'bigint' || t === 'int' || t === 'IntValue') return 'int'
  if (t === 'boolean' || t === 'bool' || t === 'BoolValue') return 'bool'
  if (t === 'string' || t === 'str' || t === 'StrValue') return 'str'
  if (
    t === 'vec3' ||
    t === 'Vec3Value' ||
    /^\[\s*number\s*,\s*number\s*,\s*number\s*\]\s*$/i.test(t) ||
    /^readonly\s*\[\s*number\s*,\s*number\s*,\s*number\s*\]\s*$/i.test(t)
  ) {
    return 'vec3'
  }
  if (t === 'guid' || t === 'GuidValue') return 'guid'
  if (looksLikeEntityTypeString(t)) return 'entity'
  if (t === 'prefabId' || t === 'PrefabIdValue') return 'prefab_id'
  if (t === 'configId' || t === 'ConfigIdValue') return 'config_id'
  if (t === 'faction' || t === 'FactionValue') return 'faction'
  return null
}

export function inferListTypeFromTypeString(s: string): ListType | null {
  const t = s.trim()

  if (
    /^readonly\s*\[\s*number\s*,\s*number\s*,\s*number\s*\]\s*\[\]\s*$/i.test(t) ||
    /^\[\s*number\s*,\s*number\s*,\s*number\s*\]\s*\[\]\s*$/i.test(t)
  ) {
    return 'vec3'
  }

  // readonly T[] -> treat as T[]
  const readonlyArray = /^readonly\s+(.+)\[\]\s*$/i.exec(t)
  if (readonlyArray) {
    return inferConcreteTypeFromString(readonlyArray[1])
  }

  if (t.endsWith('[]')) {
    return inferConcreteTypeFromString(t.slice(0, -2))
  }

  const arrayRef = /^Array<(.+)>$/i.exec(t)
  if (arrayRef) {
    const inner = arrayRef[1].trim()
    if (/^\[\s*number\s*,\s*number\s*,\s*number\s*\]$/i.test(inner)) return 'vec3'
    return inferConcreteTypeFromString(inner)
  }

  const roArrayRef = /^ReadonlyArray<(.+)>$/i.exec(t)
  if (roArrayRef) {
    const inner = roArrayRef[1].trim()
    if (/^\[\s*number\s*,\s*number\s*,\s*number\s*\]$/i.test(inner)) return 'vec3'
    return inferConcreteTypeFromString(inner)
  }

  return null
}
