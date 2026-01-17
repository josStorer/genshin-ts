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
  // 处理字符串字面量类型，包括联合类型（如 `'int' | 'str'`）和单个字面量（如 `'hello'`）
  // 同时处理泛型约束类型（如 `T extends 'bool' | 'int' | ...`）
  const s = t.trim().replace(/^\|+/, '').trim()

  // 检查是否包含联合类型分隔符 '|'
  if (s.includes('|')) {
    if (!/^'[^']+'.*('|.*)*'[^']+'/.test(s)) return null
  } else {
    // 单个字符串字面量类型，例如 'hello'
    if (!/^'[^']+'$/.test(s)) return null
  }

  const hits = Array.from(s.matchAll(/'([^']+)'/g))
    .map((m) => m[1])
    .filter(Boolean)
  if (!hits.length) return null
  if (hits.includes('int')) return 'int'
  if (hits.includes('str')) return 'str'
  return hits[0] ?? null
}

// 添加辅助函数来处理泛型约束中的字符串字面量类型
function tryExtractStringLiteralFromConstraint(t: string): string | null {
  const trimmed = t.trim()

  // 检查是否是泛型约束类型，如 "T extends 'bool' | 'int' | ..."
  const constraintMatch = /^T\s+extends\s+(.+)$/.exec(trimmed)
  if (constraintMatch) {
    const constraintType = constraintMatch[1]
    const result = pickFromStringUnion(constraintType)
    if (result) return result
  }

  // 检查是否是其他泛型约束形式，如 "keyof SomeTypeMap" 或类似的类型表达式
  if (trimmed.includes("'") && (trimmed.includes('|') || trimmed.startsWith("'"))) {
    const result = pickFromStringUnion(trimmed)
    if (result) return result
  }
  return null
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
  // 使用trim移除可能的前后空格
  const trimmedType = t.trim()

  switch (trimmedType) {
    case 'BoolValue':
    case 'boolean':
      return { kind: 'primitive', name: 'bool' }
    case 'IntValue':
    case 'bigint':
      return { kind: 'primitive', name: 'int' }
    case 'number':
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
    case 'ObjectEntity':
    case 'CreationEntity':
      return { kind: 'primitive', name: 'entity' }
    case 'PlayerEntity':
      return { kind: 'primitive', name: 'PlayerEntity' }
    case 'CharacterEntity':
      return { kind: 'primitive', name: 'CharacterEntity' }
    case 'ConfigIdValue':
      return { kind: 'primitive', name: 'configId' }
    case 'PrefabIdValue':
      return { kind: 'primitive', name: 'prefabId' }
    case 'Vector3Value':
      return { kind: 'primitive', name: 'vec3' }
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

// 新增函数处理通用对象数组类型
function tryParseObjectArrayType(typeText: string): { fields: Record<string, string> } | null {
  const base = typeText.trim().slice(0, -2) // remove []

  // 检查是否为对象类型
  if (!base.startsWith('{') || !base.endsWith('}')) return null

  // 提取对象内容
  const content = base.substring(1, base.length - 1).trim()
  const fields: Record<string, string> = {}

  // 使用正则表达式解析字段，支持 "name: type" 和 "name?: type" 格式
  // 重要：需要考虑分隔符（; 或 ,）并正确分割各个字段
  let braceDepth = 0
  let fieldStart = 0
  let colonPos = -1
  let fieldEnd = -1

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (char === '{') {
      braceDepth++
    } else if (char === '}') {
      braceDepth--
    } else if (char === ':' && braceDepth === 0 && colonPos === -1) {
      colonPos = i
    } else if ((char === ';' || char === ',') && braceDepth === 0) {
      fieldEnd = i
    }

    // 当找到一个完整的字段定义时
    if (colonPos !== -1 && fieldEnd !== -1) {
      const fieldPart = content.substring(fieldStart, colonPos).trim()
      const typePart = content.substring(colonPos + 1, fieldEnd).trim()

      // 提取字段名（去除可能的 ? 修饰符）
      const fieldNameMatch = /^(\w+)(\?)?$/.exec(fieldPart)
      if (fieldNameMatch) {
        const fieldName = fieldNameMatch[1]
        if (fieldName) {
          fields[fieldName] = typePart
        }
      }

      // 重置状态以处理下一个字段
      fieldStart = fieldEnd + 1
      colonPos = -1
      fieldEnd = -1
    }
  }

  // 处理最后一个字段（如果没有以分号或逗号结尾）
  if (colonPos !== -1 && fieldStart < content.length) {
    const fieldPart = content.substring(fieldStart, colonPos).trim()
    const typePart = content.substring(colonPos + 1).trim()

    const fieldNameMatch = /^(\w+)(\?)?$/.exec(fieldPart)
    if (fieldNameMatch) {
      const fieldName = fieldNameMatch[1]
      if (fieldName) {
        fields[fieldName] = typePart
      }
    }
  }

  if (Object.keys(fields).length === 0) return null
  return { fields }
}

// 新增函数处理普通对象类型（非数组）
function tryParseObjectType(typeText: string): { fields: Record<string, string> } | null {
  const base = typeText.trim()

  // 检查是否为对象类型
  if (!base.startsWith('{') || !base.endsWith('}')) return null

  // 提取对象内容
  const content = base.substring(1, base.length - 1).trim()
  const fields: Record<string, string> = {}

  // 手动遍历内容，处理嵌套的大括号，正确分割字段
  let braceDepth = 0
  let fieldStart = 0
  let colonPos = -1
  let fieldEnd = -1

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (char === '{') {
      braceDepth++
    } else if (char === '}') {
      braceDepth--
    } else if (char === ':' && braceDepth === 0 && colonPos === -1) {
      colonPos = i
    } else if ((char === ';' || char === ',') && braceDepth === 0) {
      fieldEnd = i
    }

    // 当找到一个完整的字段定义时
    if (colonPos !== -1 && fieldEnd !== -1) {
      const fieldPart = content.substring(fieldStart, colonPos).trim()
      const typePart = content.substring(colonPos + 1, fieldEnd).trim()

      // 提取字段名（去除可能的 ? 修饰符）
      const fieldNameMatch = /^(\w+)(\?)?$/.exec(fieldPart)
      if (fieldNameMatch) {
        const fieldName = fieldNameMatch[1]
        if (fieldName) {
          fields[fieldName] = typePart
        }
      }

      // 重置状态以处理下一个字段
      fieldStart = fieldEnd + 1
      colonPos = -1
      fieldEnd = -1
    }
  }

  // 处理最后一个字段（如果没有以分号或逗号结尾）
  if (colonPos !== -1 && fieldStart < content.length) {
    const fieldPart = content.substring(fieldStart, colonPos).trim()
    const typePart = content.substring(colonPos + 1).trim()

    const fieldNameMatch = /^(\w+)(\?)?$/.exec(fieldPart)
    if (fieldNameMatch) {
      const fieldName = fieldNameMatch[1]
      if (fieldName) {
        fields[fieldName] = typePart
      }
    }
  }

  if (Object.keys(fields).length === 0) return null
  return { fields }
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
  const kv = tryParseKvObjectArray(t)
  if (kv) {
    const k1 = emitArgFromNodesTypeText(mode, m, paramIndex, kv.kType, ctx, enumPick, assign)
    const v1 = emitArgFromNodesTypeText(mode, m, paramIndex, kv.vType, ctx, enumPick, assign)
    const k2 = emitArgFromNodesTypeText(mode, m, paramIndex, kv.kType, ctx, enumPick, assign)
    const v2 = emitArgFromNodesTypeText(mode, m, paramIndex, kv.vType, ctx, enumPick, assign)
    return `[{ k: ${k1}, v: ${v1} }, { k: ${k2}, v: ${v2} }]`
  }

  // 处理对象类型: { name: string; valueType: DictValueType } 或 { name: string; valueType: DictValueType }[]
  const obj = tryParseObjectArrayType(t)
  if (obj) {
    const fieldEntries: string[] = []
    for (const [fieldName, fieldType] of Object.entries(obj.fields)) {
      // 为每个字段生成对应的值，使用正确的类型
      const fieldValue = emitArgFromNodesTypeText(
        mode,
        m,
        paramIndex,
        fieldType,
        ctx,
        enumPick,
        assign
      )
      fieldEntries.push(`${fieldName}: ${fieldValue}`)
    }

    // 如果原始类型是数组形式，则返回数组，否则返回单个对象
    if (typeText.trim().endsWith('[]')) {
      // 创建两个示例对象
      const obj1 = `{ ${fieldEntries.join(', ')} }`
      const obj2 = `{ ${fieldEntries.join(', ')} }`

      return `[${obj1}, ${obj2}]`
    } else {
      // 返回单个对象
      return `{ ${fieldEntries.join(', ')} }`
    }
  }

  // 处理普通对象类型（非数组）
  const objType = tryParseObjectType(typeText)
  if (objType) {
    const fieldEntries: string[] = []
    for (const [fieldName, fieldType] of Object.entries(objType.fields)) {
      // 为每个字段生成对应的值，使用正确的类型
      const fieldValue = emitArgFromNodesTypeText(
        mode,
        m,
        paramIndex,
        fieldType,
        ctx,
        enumPick,
        assign
      )
      fieldEntries.push(`${fieldName}: ${fieldValue}`)
    }

    // 返回单个对象
    return `{ ${fieldEntries.join(', ')} }`
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

  // try to extract string literal from generic constraints (e.g. T extends 'bool' | 'int' | ...)
  const extractedFromConstraint = tryExtractStringLiteralFromConstraint(t)
  if (extractedFromConstraint) return JSON.stringify(extractedFromConstraint)

  // Check if this parameter is a generic type parameter by examining its context
  // In initLocalVariable<T extends 'bool' | 'int' | ...>, the first parameter has type 'T'
  // We can detect this by checking if the parameter corresponds to a method type parameter
  if (t.length > 0 && t === m.typeParams?.[paramIndex]?.name) {
    // This parameter corresponds to a method type parameter
    // Attempt to extract the constraint from the type parameter definition
    // If we can't extract the specific constraint, default to a common type string
    return JSON.stringify('int')
  }

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
    // 特殊处理使生成的代码更简洁
    const listSpec: TypeSpec = (
      {
        PlayerEntity: { kind: 'primitive', name: 'PlayerEntityList' },
        CharacterEntity: { kind: 'primitive', name: 'CharacterEntityList' }
      } satisfies Record<string, TypeSpec>
    )[base] ?? { kind: 'list', elem: baseSpec }
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

  // string params
  if (['DictKeyType', 'DictValueType', 'LiteralValueType'].includes(t)) return JSON.stringify('int')

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
