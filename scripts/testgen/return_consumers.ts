import ts from 'typescript'

import type { MethodInfo } from './methods.js'
import type { EnumPickMap } from './picks.js'
import { parseTypeSpec, type TypeSpec } from './typespec.js'
import { nextN, type Ctx } from './values.js'
import type { TypeParamAssignment } from './args_from_nodes.js'

type ReturnValueSpec =
  | { kind: 'type'; spec: TypeSpec }
  | { kind: 'enum'; name: string }
  | { kind: 'generic' }
  | { kind: 'localVariable' }
  | { kind: 'customVariableSnapshot' }
  | { kind: 'unknown'; raw: string }

type ReturnInfo =
  | { kind: 'void' }
  | { kind: 'value'; spec: ReturnValueSpec }
  | { kind: 'object'; props: { name: string; spec: ReturnValueSpec }[] }

function trimTypeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

function splitTopLevelComma(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let buf = ''
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!
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

function nextName(ctx: Ctx, prefix: string): string {
  return `${prefix}${nextN(ctx)}`
}

function runtimeStringToSpec(name: string): TypeSpec {
  const t = name.trim()
  if (t.endsWith('_list')) {
    const elem = parseTypeSpec(t.slice(0, -5))
    return { kind: 'list', elem }
  }
  return parseTypeSpec(t)
}

function resolveRuntimeReturnValueType(
  inner: string,
  assign: TypeParamAssignment
): TypeSpec | null {
  const t = inner.trim()
  const mTemplate = /^`\$\{([^}]+)\}(_list)?`$/.exec(t)
  if (mTemplate) {
    const param = mTemplate[1]?.trim()
    const listSuffix = mTemplate[2] === '_list'
    if (param) {
      const spec = assign.get(param) ?? parseTypeSpec(param)
      if (listSuffix) return spec.kind === 'list' ? spec : { kind: 'list', elem: spec }
      return spec
    }
  }

  const mQuoted = /^'([^']+)'$/.exec(t) ?? /^"([^"]+)"$/.exec(t)
  if (mQuoted) return runtimeStringToSpec(mQuoted[1] ?? '')

  if (assign.has(t)) return assign.get(t)!

  return runtimeStringToSpec(t)
}

function parseDictTypeSpec(text: string, assign: TypeParamAssignment): TypeSpec | null {
  const m = /^(ReadonlyDict|dict)\s*<([\s\S]+)>$/.exec(text)
  if (!m) return null
  const parts = splitTopLevelComma(m[2] ?? '')
  if (parts.length < 2) return null
  const key = parseTypeSpecFromReturnText(parts[0] ?? '', assign) ?? parseTypeSpec('int')
  const value = parseTypeSpecFromReturnText(parts[1] ?? '', assign) ?? parseTypeSpec('int')
  return { kind: 'dict', key, value }
}

function parseTypeSpecFromReturnText(text: string, assign: TypeParamAssignment): TypeSpec | null {
  const t = trimTypeText(text)
  if (!t) return null

  if (t.endsWith('[]')) {
    const base = t.slice(0, -2).trim()
    const elem = parseTypeSpecFromReturnText(base, assign) ?? parseTypeSpec(base)
    return { kind: 'list', elem }
  }

  if (t === 'boolean') return { kind: 'primitive', name: 'bool' }
  if (t === 'bigint') return { kind: 'primitive', name: 'int' }
  if (t === 'number') return { kind: 'primitive', name: 'float' }
  if (t === 'string') return { kind: 'primitive', name: 'str' }

  if (t === 'vec3') return { kind: 'primitive', name: 'vec3' }
  if (t === 'guid') return { kind: 'primitive', name: 'guid' }
  if (t === 'entity') return { kind: 'primitive', name: 'entity' }
  if (/^(Player|Character|Stage|Object|Creation)?Entity$/.test(t) || /^EntityOf\s*</.test(t)) {
    return { kind: 'primitive', name: 'entity' }
  }
  if (t === 'configId') return { kind: 'primitive', name: 'configId' }
  if (t === 'prefabId') return { kind: 'primitive', name: 'prefabId' }
  if (t === 'faction') return { kind: 'primitive', name: 'faction' }

  const dict = parseDictTypeSpec(t, assign)
  if (dict) return dict

  const mReturnMap = /^RuntimeReturnValueTypeMap\s*\[\s*([^\]]+)\s*\]$/.exec(t)
  if (mReturnMap) return resolveRuntimeReturnValueType(mReturnMap[1] ?? '', assign)

  return null
}

function parseReturnValueSpec(
  text: string,
  assign: TypeParamAssignment,
  enumPick: EnumPickMap
): ReturnValueSpec {
  const t = trimTypeText(text)
  if (enumPick.has(t.replace(/\s+/g, ''))) return { kind: 'enum', name: t.replace(/\s+/g, '') }
  if (t === 'generic') return { kind: 'generic' }
  if (t === 'localVariable') return { kind: 'localVariable' }
  if (t === 'customVariableSnapshot') return { kind: 'customVariableSnapshot' }

  const spec = parseTypeSpecFromReturnText(t, assign)
  if (spec) return { kind: 'type', spec }

  return { kind: 'unknown', raw: t }
}

function parseReturnInfo(
  returnText: string,
  assign: TypeParamAssignment,
  enumPick: EnumPickMap
): ReturnInfo {
  const t = returnText.trim()
  if (!t || t === 'void' || t === 'any' || t === 'string | null') return { kind: 'void' }

  const sf = ts.createSourceFile(
    'return.ts',
    `type __Return = ${returnText}`,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS
  )
  const alias = sf.statements.find(ts.isTypeAliasDeclaration)
  const typeNode = alias?.type
  if (typeNode && ts.isTypeLiteralNode(typeNode)) {
    const props: { name: string; spec: ReturnValueSpec }[] = []
    for (const member of typeNode.members) {
      if (!ts.isPropertySignature(member) || !member.type || !member.name) continue
      const name = ts.isIdentifier(member.name) ? member.name.text : member.name.getText(sf)
      props.push({ name, spec: parseReturnValueSpec(member.type.getText(sf), assign, enumPick) })
    }
    return props.length ? { kind: 'object', props } : { kind: 'void' }
  }

  return { kind: 'value', spec: parseReturnValueSpec(t, assign, enumPick) }
}

function emitConsumeType(lines: string[], ctx: Ctx, expr: string, spec: TypeSpec) {
  if (spec.kind === 'primitive') {
    if (spec.name === 'str') {
      lines.push(`f.printString(${expr})`)
      return
    }
    if (spec.name === 'configId' || spec.name === 'prefabId') {
      const eq = nextName(ctx, 'eq')
      lines.push(`const ${eq} = f.equal(${expr}, ${expr})`)
      emitConsumeType(lines, ctx, eq, { kind: 'primitive', name: 'bool' })
      return
    }
    const s = nextName(ctx, 's')
    lines.push(`const ${s} = f.dataTypeConversion(${expr}, 'str')`)
    lines.push(`f.printString(${s})`)
    return
  }

  if (spec.kind === 'list') {
    const len = nextName(ctx, 'len')
    lines.push(`const ${len} = f.getListLength(${expr})`)
    const s = nextName(ctx, 's')
    lines.push(`const ${s} = f.dataTypeConversion(${len}, 'str')`)
    lines.push(`f.printString(${s})`)
    return
  }

  if (spec.kind === 'dict') {
    const len = nextName(ctx, 'len')
    lines.push(`const ${len} = f.queryDictionarySLength(${expr})`)
    const s = nextName(ctx, 's')
    lines.push(`const ${s} = f.dataTypeConversion(${len}, 'str')`)
    lines.push(`f.printString(${s})`)
    return
  }

  if (spec.kind === 'enumConcrete') {
    const s = nextName(ctx, 's')
    lines.push(`const ${s} = f.dataTypeConversion(${expr} as unknown as bigint, 'str')`)
    lines.push(`f.printString(${s})`)
  }
}

function emitConsume(lines: string[], ctx: Ctx, expr: string, spec: ReturnValueSpec) {
  if (spec.kind === 'type') {
    emitConsumeType(lines, ctx, expr, spec.spec)
    return
  }
  if (spec.kind === 'enum') {
    const eq = nextName(ctx, 'enumEq')
    lines.push(`const ${eq} = f.enumerationsEqual(${expr}, ${expr})`)
    emitConsumeType(lines, ctx, eq, { kind: 'primitive', name: 'bool' })
    return
  }
  if (spec.kind === 'generic') {
    const cast = nextName(ctx, 'gen')
    lines.push(`const ${cast} = ${expr}.asType('int')`)
    emitConsumeType(lines, ctx, cast, { kind: 'primitive', name: 'int' })
    return
  }
  if (spec.kind === 'customVariableSnapshot') {
    const snap = nextName(ctx, 'snap')
    lines.push(`const ${snap} = f.queryCustomVariableSnapshot(${expr}, "snapshot_var")`)
    const cast = nextName(ctx, 'snapVal')
    lines.push(`const ${cast} = ${snap}.asType('int')`)
    emitConsumeType(lines, ctx, cast, { kind: 'primitive', name: 'int' })
    return
  }
  if (spec.kind === 'localVariable') {
    lines.push(`f.setLocalVariable(${expr}, 1n)`)
    return
  }
  const s = nextName(ctx, 's')
  lines.push(`const ${s} = f.dataTypeConversion(${expr} as unknown as bigint, 'str')`)
  lines.push(`f.printString(${s})`)
}

export function emitCallWithOutputConsumers(
  m: MethodInfo,
  callExpr: string,
  assign: TypeParamAssignment,
  enumPick: EnumPickMap,
  ctx: Ctx
): string {
  const retInfo = parseReturnInfo(m.returnText, assign, enumPick)
  if (retInfo.kind === 'void') return callExpr

  const lines: string[] = []
  const retName = nextName(ctx, 'ret')
  lines.push(`const ${retName} = ${callExpr}`)

  if (retInfo.kind === 'value') {
    emitConsume(lines, ctx, retName, retInfo.spec)
    return lines.join('\n')
  }

  const hasLocalVar = retInfo.props.find((p) => p.name === 'localVariable')
  const hasValue = retInfo.props.find((p) => p.name === 'value')
  if (hasLocalVar && hasValue) {
    lines.push(`f.setLocalVariable(${retName}.localVariable, ${retName}.value)`)
    for (const p of retInfo.props) {
      if (p.name === 'localVariable' || p.name === 'value') continue
      emitConsume(lines, ctx, `${retName}.${p.name}`, p.spec)
    }
    return lines.join('\n')
  }

  for (const p of retInfo.props) emitConsume(lines, ctx, `${retName}.${p.name}`, p.spec)
  return lines.join('\n')
}
