export type PrimitiveSpec =
  | 'bool'
  | 'int'
  | 'float'
  | 'str'
  | 'vec3'
  | 'guid'
  | 'entity'
  | 'PlayerEntity'
  | 'PlayerEntityList'
  | 'CharacterEntity'
  | 'CharacterEntityList'
  | 'prefabId'
  | 'configId'
  | 'faction'

export type TypeSpec =
  | { kind: 'primitive'; name: PrimitiveSpec }
  | { kind: 'list'; elem: TypeSpec }
  | { kind: 'dict'; key: TypeSpec; value: TypeSpec }
  | { kind: 'enumConcrete'; id: number } // e<10>
  | { kind: 'unknown'; raw: string }

function splitTopLevel(s: string, sep: string): string[] {
  const out: string[] = []
  let depth = 0
  let buf = ''
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!
    if (ch === '<') depth++
    if (ch === '>') depth--
    if (depth === 0 && ch === sep) {
      out.push(buf.trim())
      buf = ''
      continue
    }
    buf += ch
  }
  if (buf.trim()) out.push(buf.trim())
  return out
}

export function parseTypeSpec(raw: string): TypeSpec {
  const s = raw.trim()
  // unwrap TS string literal types: `'int'` / `'config_id'`
  const mQuoted = /^'([^']+)'$/.exec(s)
  if (mQuoted) return parseTypeSpec(mQuoted[1] ?? '')
  const mEnum = /^e<\s*(\d+)\s*>$/i.exec(s)
  if (mEnum) return { kind: 'enumConcrete', id: Number(mEnum[1]) }

  const prim: Record<string, PrimitiveSpec> = {
    bool: 'bool',
    int: 'int',
    float: 'float',
    str: 'str',
    vec3: 'vec3',
    guid: 'guid',
    entity: 'entity',
    prefabid: 'prefabId',
    configid: 'configId',
    // runtime/IR uses snake_case for these
    prefab_id: 'prefabId',
    config_id: 'configId',
    faction: 'faction'
  }
  const low = s.toLowerCase()
  if (low in prim) return { kind: 'primitive', name: prim[low]! }
  if (low === 'dict') {
    return {
      kind: 'dict',
      key: { kind: 'primitive', name: 'int' },
      value: { kind: 'primitive', name: 'int' }
    }
  }

  const listM = /^list<([\s\S]+)>$/i.exec(s)
  if (listM) return { kind: 'list', elem: parseTypeSpec(listM[1]!) }

  const dictM = /^dict<([\s\S]+)>$/i.exec(s)
  if (dictM) {
    const parts = splitTopLevel(dictM[1]!, ',')
    if (parts.length === 2)
      return { kind: 'dict', key: parseTypeSpec(parts[0]!), value: parseTypeSpec(parts[1]!) }
  }

  return { kind: 'unknown', raw: s }
}
