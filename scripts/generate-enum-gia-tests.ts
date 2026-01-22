import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

import { parseEnumValue } from '../src/compiler/ir_to_gia_transform/mappings.js'

type EnumMembersMap = Map<string, string[]>
type EnumValueMap = Map<string, Map<string, string>>

function readText(p: string): string {
  return fs.readFileSync(p, 'utf8')
}

function writeText(p: string, text: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, text, 'utf8')
}

function createSourceFile(fileName: string, text: string): ts.SourceFile {
  return ts.createSourceFile(fileName, text, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
}

function extractEnumMembers(enumTsPath: string): EnumMembersMap {
  const text = readText(enumTsPath)
  const sf = createSourceFile(enumTsPath, text)
  const map: EnumMembersMap = new Map()

  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.text
      const members = node.members
        .filter(
          (m): m is ts.PropertyDeclaration =>
            ts.isPropertyDeclaration(m) &&
            m.modifiers?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword) === true &&
            ts.isIdentifier(m.name)
        )
        .map((m) => (m.name as ts.Identifier).text)
      if (members.length) map.set(className, members)
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(sf, visit)
  return map
}

function extractEnumerationTypeMapKeys(enumTsPath: string): Set<string> {
  const text = readText(enumTsPath)
  const sf = createSourceFile(enumTsPath, text)
  const keys = new Set<string>()

  const visit = (node: ts.Node) => {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === 'EnumerationTypeMap') {
      if (ts.isTypeLiteralNode(node.type)) {
        node.type.members.forEach((m) => {
          if (!ts.isPropertySignature(m) || !m.name) return
          if (ts.isIdentifier(m.name)) keys.add(m.name.text)
          else if (ts.isStringLiteral(m.name)) keys.add(m.name.text)
        })
      }
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(sf, visit)
  return keys
}

function extractEnumerationsEqualOverloadTypes(nodesTsPath: string): Set<string> {
  const text = readText(nodesTsPath)
  const sf = createSourceFile(nodesTsPath, text)
  const types = new Set<string>()

  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node) && node.name?.text === 'ServerExecutionFlowFunctions') {
      node.members.forEach((m) => {
        if (!ts.isMethodDeclaration(m) || !m.name || !ts.isIdentifier(m.name)) return
        if (m.name.text !== 'enumerationsEqual') return
        // overload 签名无 body，取它们的参数类型
        if (m.body) return
        const p0 = m.parameters[0]?.type
        const p1 = m.parameters[1]?.type
        if (!p0 || !p1) return
        const t0 = p0.getText(sf).trim()
        const t1 = p1.getText(sf).trim()
        if (t0 && t0 === t1) types.add(t0)
      })
      return
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(sf, visit)
  return types
}

function extractEnumValueStrings(enumTsPath: string): EnumValueMap {
  const text = readText(enumTsPath)
  const sf = createSourceFile(enumTsPath, text)
  const out: EnumValueMap = new Map()

  const unwrap = (e: ts.Expression): ts.Expression => {
    if (ts.isAsExpression(e)) return unwrap(e.expression)
    if (ts.isParenthesizedExpression(e)) return unwrap(e.expression)
    return e
  }

  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.text
      for (const mem of node.members) {
        if (
          !ts.isPropertyDeclaration(mem) ||
          !mem.initializer ||
          !mem.modifiers?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword) ||
          !ts.isIdentifier(mem.name)
        ) {
          continue
        }

        const init = unwrap(mem.initializer)
        if (!ts.isNewExpression(init) || !ts.isIdentifier(init.expression)) continue
        if (init.expression.text !== 'enumeration') continue
        const args = init.arguments ?? []
        const arg1 = args[1]
        if (!arg1 || !ts.isStringLiteral(arg1)) continue

        const valueStr = arg1.text
        const members = out.get(className) ?? new Map<string, string>()
        members.set(mem.name.text, valueStr)
        out.set(className, members)
      }
    }
    ts.forEachChild(node, visit)
  }

  ts.forEachChild(sf, visit)
  return out
}

type MethodSig = {
  name: string
  params: { typeText: string; rest: boolean }[]
}

function extractFMethods(nodesTsPath: string): MethodSig[] {
  const text = readText(nodesTsPath)
  const sf = createSourceFile(nodesTsPath, text)
  const methods: MethodSig[] = []

  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node) && node.name?.text === 'ServerExecutionFlowFunctions') {
      node.members.forEach((m) => {
        if (!ts.isMethodDeclaration(m)) return
        if (!m.body) return
        if (!m.name || !ts.isIdentifier(m.name)) return
        const params = m.parameters.map((p) => ({
          typeText: p.type ? p.type.getText(sf).trim() : 'any',
          rest: !!p.dotDotDotToken
        }))
        methods.push({ name: m.name.text, params })
      })
      return
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(sf, visit)
  return methods
}

function isFnType(t: string): boolean {
  return /^\([^)]*\)\s*=>/.test(t.replace(/\s+/g, ' ').trim())
}

function scoreMethodForEnum(m: MethodSig, enumType: string): number {
  let s = m.params.length * 2
  for (const p of m.params) {
    const t = p.typeText
    if (t === enumType) continue
    if (p.rest) s += 20
    if (isFnType(t)) s += 50
    if (/\bDictValue\b|\bdict\b/.test(t)) s += 40
    if (/\[\]$/.test(t)) s += 20
    if (/\bLocalVariableValue\b|\blocalVariable\b/.test(t)) s += 30
    if (/\bcustomVariableSnapshot\b|\bCustomVariableSnapshotValue\b/.test(t)) s += 9999
    if (/\bRecord<\s*(number|string)\s*,/.test(t)) s += 80
    if (/RuntimeParameterValueTypeMap\s*\[/.test(t)) s += 20
  }
  // 过滤极端复杂节点（避免在枚举测试中被其它参数拖累）
  if (m.params.length > 10) s += 30
  return s
}

function pickMethodForEnum(methods: MethodSig[], enumType: string): MethodSig | null {
  const candidates = methods.filter((m) => m.params.some((p) => p.typeText === enumType))
  if (!candidates.length) return null
  return [...candidates].sort(
    (a, b) => scoreMethodForEnum(a, enumType) - scoreMethodForEnum(b, enumType)
  )[0]
}

function litOfParam(t: string): string {
  const type = t.trim()
  if (type === 'EntityValue') return 'e'
  if (type === 'PlayerEntity') return 'pe'
  if (type === 'CharacterEntity') return 'ce'
  if (type === 'IntValue') return '1n'
  if (type === 'FloatValue') return '1.25'
  if (type === 'BoolValue' || type === 'boolean') return 'true'
  if (type === 'StrValue' || type === 'string') return JSON.stringify('s')
  if (type === 'GuidValue') return 'new guid(1n)'
  if (type === 'ConfigIdValue') return 'new configId(1n)'
  if (type === 'PrefabIdValue') return 'new prefabId(1n)'
  if (type === 'FactionValue') return 'new faction(1n)'
  if (type === 'Vec3Value') return '[1,2,3]'
  if (type.endsWith('[]')) {
    // 直接用普通数组，交给编译器/预处理处理
    const base = type.slice(0, -2).trim()
    if (base === 'ConfigIdValue') return `[new configId(1n), new configId(2n)]`
    if (base === 'IntValue') return `[1n, 2n, 3n]`
    if (base === 'FloatValue') return `[1.25, 2.25]`
    if (base === 'BoolValue') return `[true, false]`
    if (base === 'StrValue') return `["1", "2"]`
    if (base === 'GuidValue') return `[new guid(1n)]`
    if (base === 'FactionValue') return `[new faction(1n)]`
    if (base === 'PrefabIdValue') return `[new prefabId(1n)]`
    if (base === 'EntityValue') return `[e]`
    return `[1n, 2n] as any`
  }
  if (type === 'DictValue' || type === 'dict' || /^dict\s*</.test(type) || /^dict<.*>$/.test(type))
    return `f.assemblyDictionary([{ k: 1, v: 1 }]) as any`
  if (/^'[^']+'(\s*\|\s*'[^']+')+/.test(type)) {
    const hits = Array.from(type.matchAll(/'([^']+)'/g))
      .map((mm) => mm[1])
      .filter(Boolean)
    if (hits.includes('int')) return JSON.stringify('int')
    if (hits.includes('str')) return JSON.stringify('str')
    return JSON.stringify(hits[0] ?? 'int')
  }
  // fallback
  return '1 as any'
}

function isEnumTypeName(typeText: string, enums: EnumMembersMap): boolean {
  return enums.has(typeText.trim())
}

function renderEnumFile(
  enumType: string,
  members: string[],
  method: MethodSig,
  enums: EnumMembersMap,
  graphId: number
): string {
  const enumParamIndex = method.params.findIndex((p) => p.typeText === enumType)
  const buildCall = (member: string) => {
    const args: string[] = []
    method.params.forEach((p, idx) => {
      if (p.rest) return
      if (idx === enumParamIndex) {
        args.push(`E.${enumType}.${member}`)
        return
      }
      if (isEnumTypeName(p.typeText, enums)) {
        const otherType = p.typeText.trim()
        const list = enums.get(otherType)
        const first = list?.[0]
        args.push(first ? `E.${otherType}.${first}` : 'e')
        return
      }
      args.push(litOfParam(p.typeText))
    })
    return `  f.${method.name}(${args.join(', ')})`
  }

  return [
    `import { g } from 'genshin-ts/runtime/core'`,
    `import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'`,
    `import * as E from 'genshin-ts/definitions/enum'`,
    ``,
    `// AUTO-GENERATED enum coverage for ${enumType}`,
    `// Run: npx tsx scripts/generate-enum-gia-tests.ts`,
    ``,
    `g.server({ id: ${graphId} }).on('whenEntityIsCreated', (_evt, f) => {`,
    `  const e = f.getSelfEntity()`,
    `  const pe = f.getListOfPlayerEntitiesOnTheField()[0]`,
    `  const ce = f.getAllCharacterEntitiesOfSpecifiedPlayer(pe)[0]`,
    ...members.map(buildCall),
    `})`,
    ``
  ].join('\n')
}

function renderEnumerationsEqualFile(
  enumTypes: Array<[string, string[]]>,
  graphId: number
): string {
  const lines: string[] = []
  lines.push(`import { g } from 'genshin-ts/runtime/core'`)
  lines.push(`import * as E from 'genshin-ts/definitions/enum'`)
  lines.push(``)
  lines.push(`// AUTO-GENERATED enum coverage for enumerationsEqual`)
  lines.push(`// Run: npx tsx scripts/generate-enum-gia-tests.ts`)
  lines.push(``)
  lines.push(`g.server({ id: ${graphId} }).on('whenEntityIsCreated', (_evt, f) => {`)
  for (const [enumType, members] of enumTypes) {
    if (!members.length) continue
    const m1 = members[0]
    const m2 = members[1] ?? members[0]
    if (!m1 || !m2) continue
    lines.push(`  // ${enumType}`)
    lines.push(`  f.enumerationsEqual(E.${enumType}.${m1}, E.${enumType}.${m1})`)
    lines.push(`  f.enumerationsEqual(E.${enumType}.${m1}, E.${enumType}.${m2})`)
  }
  lines.push(`})`)
  lines.push(``)
  return lines.join('\n')
}

function main() {
  const repoRoot = process.cwd()
  const enumTsPath = path.join(repoRoot, 'src/definitions/enum.ts')
  const nodesTsPath = path.join(repoRoot, 'src/definitions/nodes.ts')

  const enums = extractEnumMembers(enumTsPath)
  const supportedForEqual = extractEnumerationTypeMapKeys(enumTsPath)
  const supportedByOverload = extractEnumerationsEqualOverloadTypes(nodesTsPath)
  const enumValueStrings = extractEnumValueStrings(enumTsPath)
  const methods = extractFMethods(nodesTsPath)

  const outDir = path.join(repoRoot, 'tests/enum_cases')
  const keep = new Set(['enum_nodes_second.ts', 'enum_enumerationsEqual_wired.ts'])
  if (fs.existsSync(outDir)) {
    for (const ent of fs.readdirSync(outDir, { withFileTypes: true })) {
      if (keep.has(ent.name)) continue
      fs.rmSync(path.join(outDir, ent.name), { recursive: true, force: true })
    }
  }
  fs.mkdirSync(outDir, { recursive: true })

  const BASE_GRAPH_ID = 1073741850
  let outFileIndex = 0
  const allocGraphId = () => BASE_GRAPH_ID + Math.floor(outFileIndex++ / 2)

  let fileCount = 0
  const enumList = Array.from(enums.entries())
  for (const [enumType, members] of enumList) {
    const method = pickMethodForEnum(methods, enumType)
    if (!method) continue
    const content = renderEnumFile(enumType, members, method, enums, allocGraphId())
    writeText(path.join(outDir, `enum_${enumType}.ts`), content)
    fileCount++
  }

  // 额外：覆盖 enumerationsEqual（对每个枚举类至少跑一对相等/不等比较）
  const blacklist = new Set<string>([])
  const equalList = enumList.filter(([name, members]) => {
    // 以 nodes.ts overload 列表为准（这会自然排除 DamagePopUpType 等不支持类型）
    if (!supportedByOverload.has(name)) return false
    if (!supportedForEqual.has(name) || blacklist.has(name)) return false
    const valueMap = enumValueStrings.get(name)
    if (!valueMap) return false
    const m1 = members[0]
    const m2 = members[1] ?? members[0]
    if (!m1 || !m2) return false
    const v1 = valueMap.get(m1)
    const v2 = valueMap.get(m2)
    if (!v1 || !v2) return false
    try {
      parseEnumValue(v1, 0, 'enumerations_equal')
      parseEnumValue(v2, 0, 'enumerations_equal')
      return true
    } catch {
      // 当前枚举值映射不全：enumerationsEqual 覆盖里先不包含（避免你提到的“某些类型不支持”）
      return false
    }
  })
  writeText(
    path.join(outDir, `enum__enumerationsEqual.ts`),
    renderEnumerationsEqualFile(equalList, allocGraphId())
  )
  fileCount++

  console.log(`[ok] generated enum cases: ${outDir}`)
  console.log(`[ok] files: ${fileCount}`)
}

try {
  main()
} catch (e) {
  console.error(e instanceof Error ? (e.stack ?? e.message) : e)
  process.exit(1)
}
