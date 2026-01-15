import type { MethodInfo } from './methods.js'
import type { EnumPickMap } from './picks.js'
import { parseTypeSpec, type TypeSpec } from './typespec.js'
import { emitValueLiteral, emitValueUnknown, emitValueWire, type Ctx } from './values.js'

export type Mode = 'literal' | 'wire'

export type TypeParamAssignment = Map<string, TypeSpec>

function trim(s: string) {
  return s.trim().replace(/\s+/g, ' ')
}

function splitTopLevelComma(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let buf = ''
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (!ch) continue
    if (ch === '<') depth++
    if (ch === '>') depth--
    if (depth === 0 && ch === ',') {
      out.push(buf.trim())
      buf = ''
      continue
    }
    buf += ch
  }
  if (buf.trim()) out.push(buf.trim())
  return out
}

function isFuncType(typeText: string): boolean {
  const t = trim(typeText)
  return /^\([^)]*\)\s*=>/.test(t)
}

function isRecordBranches(typeText: string): boolean {
  // 处理多行和复杂类型定义
  const normalized = typeText.replace(/\s+/g, '') // 移除所有空白字符以简化匹配
  return (
    normalized.includes('Record<number,(()=>void)|number>&{default?:(()=>void)|number}') ||
    normalized.includes('Record<string,(()=>void)|string>&{default?:(()=>void)|string}')
  )
}

function pickFromStringUnion(t: string): string | null {
  // only treat as union when the entire type is a string-literal union
  // e.g. `'int' | 'str'`
  const s = t.trim().replace(/^\|+/, '').trim()
  if (!s.includes('|')) return null
  if (!/^'[^']+'/.test(s)) return null
  const hits = Array.from(s.matchAll(/'([^']+)'/g))
    .map((m) => m[1])
    .filter(Boolean)
  if (!hits.length) return null
  if (hits.includes('int')) return 'int'
  if (hits.includes('str')) return 'str'
  return hits[0] ?? null
}

function isEnumClassType(typeText: string, enumPick: EnumPickMap): boolean {
  const clean = typeText.replace(/\s+/g, '')
  return enumPick.has(clean)
}

function emitEnum(enumTypeName: string, enumPick: EnumPickMap): string {
  const pick = enumPick.get(enumTypeName) ?? 'Ascending'
  return `E.${enumTypeName}.${pick}`
}

function typeSpecFromNodesValueType(t: string): TypeSpec | null {
  switch (t) {
    case 'BoolValue':
    case 'boolean':
      return { kind: 'primitive', name: 'bool' }
    case 'IntValue':
    case 'bigint':
    case 'number':
      return { kind: 'primitive', name: 'int' }
    case 'FloatValue':
      return { kind: 'primitive', name: 'float' }
    case 'StrValue':
    case 'string':
      return { kind: 'primitive', name: 'str' }
    case 'Vec3Value':
      return { kind: 'primitive', name: 'vec3' }
    case 'GuidValue':
      return { kind: 'primitive', name: 'guid' }
    case 'EntityValue':
      return { kind: 'primitive', name: 'entity' }
    case 'ConfigIdValue':
      return { kind: 'primitive', name: 'configId' }
    case 'PrefabIdValue':
      return { kind: 'primitive', name: 'prefabId' }
    case 'FactionValue':
      return { kind: 'primitive', name: 'faction' }
    default:
      return null
  }
}

function normalizeRuntimeTypeString(s: string): string {
  // typespec 用的是 configId/prefabId，runtime/IR 的 type string 是 config_id/prefab_id
  if (s === 'configId') return 'config_id'
  if (s === 'prefabId') return 'prefab_id'
  return s
}

function tryParseKvObjectArray(typeText: string): { kType: string; vType: string } | null {
  if (!typeText.trim().endsWith('[]')) return null
  const base = typeText.trim().slice(0, -2)
  if (!/\bk\s*:/.test(base) || !/\bv\s*:/.test(base)) return null

  const km = /\bk\s*:\s*([^\n;]+)[;\n]/.exec(base + '\n')
  const vm = /\bv\s*:\s*([^\n;]+)[;\n]/.exec(base + '\n')
  const kType = km?.[1]?.trim()
  const vType = vm?.[1]?.trim()
  if (!kType || !vType) return null
  return { kType, vType }
}

export function assignTypeParamsFromCase(m: MethodInfo, typeCase: string): TypeParamAssignment {
  const out: TypeParamAssignment = new Map()
  const spec = parseTypeSpec(typeCase)

  if (!m.typeParams.length) return out

  // dict<k,v>：多数节点的 case 表示“键/值”或“输入/输出”的组合
  if (spec.kind === 'dict') {
    if (m.typeParams.length >= 2) {
      const t0 = m.typeParams[0]
      const t1 = m.typeParams[1]
      if (t0) out.set(t0.name, spec.key)
      if (t1) out.set(t1.name, spec.value)
      return out
    }
    // 只有一个类型参数时，通常关心的是 value 部分
    const t0 = m.typeParams[0]
    if (t0) out.set(t0.name, spec.value)
    return out
  }

  // 其他情况：按第一个类型参数赋值
  const t0 = m.typeParams[0]
  if (t0) out.set(t0.name, spec)
  return out
}

function resolveRuntimeParameterValueTypeMap(
  inner: string,
  assign: TypeParamAssignment
): TypeSpec | null {
  // RuntimeParameterValueTypeMap[T] / RuntimeParameterValueTypeMap['int'] ...
  const k = inner.trim()
  const mStr = /^'([^']+)'$/.exec(k)
  if (mStr) return parseTypeSpec(mStr[1] ?? '')

  const direct = assign.get(k)
  if (direct) return direct

  // fallback: treat as unknown
  return null
}

export function emitArgFromNodesTypeText(
  mode: Mode,
  m: MethodInfo,
  paramIndex: number,
  typeText: string,
  ctx: Ctx,
  enumPick: EnumPickMap,
  assign: TypeParamAssignment
): string {
  // sendSignal(signalName) requires a literal string (wired connections are rejected by ensureLiteralStr).
  if (m.name === 'sendSignal' && m.params[paramIndex]?.name === 'signalName') {
    return JSON.stringify(`${mode}_signal`)
  }

  const t = trim(typeText)

  // pairs array: must be a plain JS array for nodes.ts implementation (uses pairs.map)
  const kv = tryParseKvObjectArray(typeText)
  if (kv) {
    const k1 = emitArgFromNodesTypeText(mode, m, paramIndex, kv.kType, ctx, enumPick, assign)
    const v1 = emitArgFromNodesTypeText(mode, m, paramIndex, kv.vType, ctx, enumPick, assign)
    const k2 = emitArgFromNodesTypeText(mode, m, paramIndex, kv.kType, ctx, enumPick, assign)
    const v2 = emitArgFromNodesTypeText(mode, m, paramIndex, kv.vType, ctx, enumPick, assign)
    return `[{ k: ${k1}, v: ${v1} }, { k: ${k2}, v: ${v2} }]`
  }

  if (isFuncType(t)) {
    return `() => { f.printString(${JSON.stringify(`${mode}_cb_${m.name}_${paramIndex}`)}) }`
  }
  if (isRecordBranches(t)) {
    return `({ 1: () => { f.printString(${JSON.stringify(`${mode}_b1_${m.name}_${paramIndex}`)}) }, default: () => { f.printString(${JSON.stringify(`${mode}_bd_${m.name}_${paramIndex}`)}) } })`
  }

  // enum class (SortBy / DamagePopUpType / ...)
  if (isEnumClassType(t, enumPick)) return emitEnum(t.replace(/\s+/g, ''), enumPick)

  // LocalVariableValue
  if (t === 'LocalVariableValue') return `f.getLocalVariable(1n).localVariable`

  // string union for runtime type strings
  const pickUnion = pickFromStringUnion(t)
  if (pickUnion) return JSON.stringify(pickUnion)

  // plain generic param that represents runtime type string (e.g. U in dataTypeConversion)
  if (assign.has(t)) {
    const spec = assign.get(t)
    if (!spec) return JSON.stringify('int')
    if (spec.kind === 'primitive') return JSON.stringify(normalizeRuntimeTypeString(spec.name))
    if (spec.kind === 'enumConcrete') return `E.SortBy.Ascending`
    if (spec.kind === 'list' && spec.elem.kind === 'primitive')
      return JSON.stringify(normalizeRuntimeTypeString(spec.elem.name))
    return JSON.stringify('int')
  }

  // RuntimeParameterValueTypeMap[T] / ...[]
  const rpm = /^RuntimeParameterValueTypeMap\s*\[\s*([^\]]+)\s*\]$/.exec(t)
  const rpmArr = /^RuntimeParameterValueTypeMap\s*\[\s*([^\]]+)\s*\]\s*\[\]$/.exec(t)
  if (rpmArr) {
    const inner = rpmArr[1] ?? ''
    const spec = resolveRuntimeParameterValueTypeMap(inner, assign) ?? { kind: 'unknown', raw: t }
    const listSpec: TypeSpec = { kind: 'list', elem: spec }
    return mode === 'literal' ? emitValueLiteral(listSpec, ctx) : emitValueWire(listSpec, ctx)
  }
  if (rpm) {
    const inner = rpm[1] ?? ''
    const spec = resolveRuntimeParameterValueTypeMap(inner, assign) ?? { kind: 'unknown', raw: t }
    return mode === 'literal' ? emitValueLiteral(spec, ctx) : emitValueWire(spec, ctx)
  }

  // XxxValue[]
  if (t.endsWith('[]')) {
    const base = t.slice(0, -2).trim()
    const baseSpec = typeSpecFromNodesValueType(base) ?? { kind: 'unknown', raw: base }
    const listSpec: TypeSpec = { kind: 'list', elem: baseSpec }
    return mode === 'literal' ? emitValueLiteral(listSpec, ctx) : emitValueWire(listSpec, ctx)
  }

  // dict / dict<K,V> / DictValue
  if (t === 'DictValue' || t === 'dict' || t.startsWith('dict<')) {
    // 解析 dict<k,v> 仅用于更好的字面量生成；没有就用 int->int
    let keySpec: TypeSpec = { kind: 'primitive', name: 'int' }
    let valSpec: TypeSpec = { kind: 'primitive', name: 'int' }
    const dm = /^dict<([\s\S]+)>$/.exec(t)
    if (dm) {
      const parts = splitTopLevelComma(dm[1] ?? '')
      const k = parts[0]
      const v = parts[1]
      if (k) {
        const kk = k.trim().replace(/'([^']+)'/g, '$1')
        keySpec = assign.get(kk) ?? parseTypeSpec(kk)
      }
      if (v) {
        const vv = v.trim().replace(/'([^']+)'/g, '$1')
        valSpec = assign.get(vv) ?? parseTypeSpec(vv)
      }
    }
    const dictSpec: TypeSpec = { kind: 'dict', key: keySpec, value: valSpec }
    return mode === 'literal' ? emitValueLiteral(dictSpec, ctx) : emitValueWire(dictSpec, ctx)
  }

  // DictKeyType / DictValueType (string params)
  if (t === 'DictKeyType' || t === 'DictValueType') return JSON.stringify('int')

  // EnumerationTypeMap[...] / EnumerationType / enumeration
  if (/^EnumerationTypeMap\s*\[/.test(t) || t === 'EnumerationType' || t === 'enumeration') {
    return `E.SortBy.Ascending`
  }

  // primitives / wrappers
  const prim = typeSpecFromNodesValueType(t)
  if (prim) return mode === 'literal' ? emitValueLiteral(prim, ctx) : emitValueWire(prim, ctx)

  // fallback: unknown（避免把 as any 注入到数组参数里）
  return emitValueUnknown(mode, ctx)
}
