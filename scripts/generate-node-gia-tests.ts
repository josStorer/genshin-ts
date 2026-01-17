import path from 'node:path'

import { ServerEventMetadata } from '../src/definitions/events.js'
import { assignTypeParamsFromCase, emitArgFromNodesTypeText } from './testgen/args_from_nodes.js'
import { cleanDir, emitFile, writeText, type GeneratedCall } from './testgen/emit.js'
import {
  buildGenericsMap,
  loadNodeGenerics,
  loadNodeGenericsSummary,
  parseGenericParamRef
} from './testgen/generics_data.js'
import { extractServerFMethods } from './testgen/methods.js'
import { loadEnumPicks } from './testgen/picks.js'
import { emitProducers, type Ctx } from './testgen/values.js'
import { canResolveNodeType, readVendorNodeIdKeysLower } from './testgen/vendor_ids.js'

type SkipRow = { name: string; nodeType?: string; why: string }

type Bucket = { literal: GeneratedCall[]; wire: GeneratedCall[] }

function main() {
  const repoRoot = process.cwd()
  const nodesTsPath = path.join(repoRoot, 'src/definitions/nodes.ts')
  const enumTsPath = path.join(repoRoot, 'src/definitions/enum.ts')
  const outDir = path.join(repoRoot, 'tests/generated')

  const vendorKeysLower = readVendorNodeIdKeysLower(repoRoot)
  const enumPick = loadEnumPicks(enumTsPath)
  const methods = extractServerFMethods(nodesTsPath)

  const generics = loadNodeGenerics(repoRoot)
  const summary = loadNodeGenericsSummary(repoRoot)
  const genericsMap = buildGenericsMap(generics)

  cleanDir(outDir)

  // 需求：每 4 个“生成文件”使用同一个 graph id，然后递增（便于合并后按 id 聚合查看）
  const BASE_GRAPH_ID = 1073741830
  let outFileIndex = 0
  const allocGraphId = () => BASE_GRAPH_ID + Math.floor(outFileIndex++ / 2)

  const skipped: SkipRow[] = []
  const included: Record<string, { cases: number }> = {}

  const groupCalls: Record<number, Bucket> = {}
  for (const g of summary) groupCalls[g.id] = { literal: [], wire: [] }
  const other: Bucket = { literal: [], wire: [] }

  const functionToGroup = new Map<string, number>()
  for (const g of summary) for (const fn of g.functions) functionToGroup.set(fn, g.id)

  for (const m of methods) {
    // 过滤：nodeType 无法解析，记录并跳过（否则 unknown node type 会阻塞整个批次）
    if (m.nodeType && !canResolveNodeType(m.nodeType, vendorKeysLower)) {
      skipped.push({ name: m.name, nodeType: m.nodeType, why: 'missing in vendor NODE_ID' })
      continue
    }
    // 过滤：当前缺少稳定的 snapshot producer（后续做事件泛型测试时再补）
    if (
      m.params.some((p) =>
        /\bCustomVariableSnapshotValue\b|\bcustomVariableSnapshot\b/.test(p.typeText)
      )
    ) {
      skipped.push({
        name: m.name,
        nodeType: m.nodeType,
        why: 'no stable CustomVariableSnapshotValue producer'
      })
      continue
    }
    // 过滤：暂不支持
    if (m.name === 'modifyStructure') {
      skipped.push({ name: m.name, nodeType: m.nodeType, why: 'modifyStructure not supported yet' })
      continue
    }

    if (['__gstsRegisterTimerCaptureDict', 'continue', 'return'].includes(m.name)) {
      skipped.push({
        name: m.name,
        nodeType: m.nodeType,
        why: 'need to design a separate testing process'
      })
      continue
    }

    const ginfo = genericsMap.get(m.name)
    const groupId = functionToGroup.get(m.name)
    const bucket = groupId ? groupCalls[groupId]! : other

    const ctxLit: Ctx = { n: 0 }
    const ctxWire: Ctx = { n: 0 }

    const buildOne = (mode: 'literal' | 'wire', typeCase: string | undefined): GeneratedCall => {
      const assign = typeCase ? assignTypeParamsFromCase(m, typeCase) : new Map()
      const args: string[] = []
      for (let i = 0; i < m.params.length; i++) {
        const p = m.params[i]!

        if (p.rest) {
          // rest: 展开 3 个值（同类型）
          const baseTypeText = p.typeText.trim().replace(/\[\]$/, '').trim()
          const e1 = emitArgFromNodesTypeText(
            mode,
            m,
            i,
            baseTypeText,
            mode === 'literal' ? ctxLit : ctxWire,
            enumPick,
            assign
          )
          const e2 = emitArgFromNodesTypeText(
            mode,
            m,
            i,
            baseTypeText,
            mode === 'literal' ? ctxLit : ctxWire,
            enumPick,
            assign
          )
          const e3 = emitArgFromNodesTypeText(
            mode,
            m,
            i,
            baseTypeText,
            mode === 'literal' ? ctxLit : ctxWire,
            enumPick,
            assign
          )
          args.push(e1, e2, e3)
          continue
        }

        const typeText = p.typeText
        args.push(
          emitArgFromNodesTypeText(
            mode,
            m,
            i,
            typeText,
            mode === 'literal' ? ctxLit : ctxWire,
            enumPick,
            assign
          )
        )
      }
      return { fn: m.name, typeCase, code: `f.${m.name}(${args.join(', ')})` }
    }

    // 有 generics 数据：对每个 availableType 生成（确保每个类型都覆盖）
    if (ginfo) {
      for (const tcase of ginfo.availableTypes) {
        const skipLiteral = m.name === 'dataTypeConversion' && /^dict<\s*faction\s*,/i.test(tcase)
        // 泛型类型由 typeCase + nodes.ts 方法签名推断，不再直接覆盖参数文本
        if (!skipLiteral) {
          bucket.literal.push(buildOne('literal', tcase))
        }
        bucket.wire.push(buildOne('wire', tcase))
        included[m.name] = { cases: (included[m.name]?.cases ?? 0) + 1 }
      }
      continue
    }

    // 无 generics 数据：只生成 1 次
    bucket.literal.push(buildOne('literal', undefined))
    bucket.wire.push(buildOne('wire', undefined))
    included[m.name] = { cases: (included[m.name]?.cases ?? 0) + 1 }
  }

  // 输出：按 group 拆分
  for (const g of summary) {
    const calls = groupCalls[g.id]!
    if (!calls.literal.length && !calls.wire.length) continue
    const base = `group_${String(g.id).padStart(2, '0')}`
    writeText(
      path.join(outDir, `${base}.literal.ts`),
      emitFile('literal', base, allocGraphId(), null, calls.literal)
    )
    writeText(
      path.join(outDir, `${base}.wire.ts`),
      emitFile('wire', base, allocGraphId(), emitProducers(), calls.wire)
    )
  }
  if (other.literal.length || other.wire.length) {
    writeText(
      path.join(outDir, `other.literal.ts`),
      emitFile('literal', 'other', allocGraphId(), null, other.literal)
    )
    writeText(
      path.join(outDir, `other.wire.ts`),
      emitFile('wire', 'other', allocGraphId(), emitProducers(), other.wire)
    )
  }

  // 事件节点：覆盖 ServerEventMetadata 的所有事件（对应 when_* 节点）
  {
    const events = Object.keys(ServerEventMetadata).sort()
    const lines: string[] = []
    const graphId = allocGraphId()
    lines.push(`import { g } from 'genshin-ts/runtime/core'`)
    lines.push(``)
    lines.push(`// AUTO-GENERATED: server events`)
    lines.push(`// Run: npx tsx scripts/generate-node-gia-tests.ts`)
    lines.push(``)
    for (const e of events) {
      if (e === 'monitorSignal') {
        // monitorSignal 事件需要额外的 signalName 输入（否则 pin 结构不匹配）
        // 与 sendSignal("monitor_signal") 配套
        lines.push(`g.server({ id: ${graphId} }).onSignal("monitor_signal", (_evt, f) => {`)
        lines.push(`  f.printString(${JSON.stringify(`event_${e}`)})`)
        lines.push(`})`)
      } else {
        lines.push(`g.server({ id: ${graphId} }).on(${JSON.stringify(e)}, (_evt, f) => {`)
        lines.push(`  f.printString(${JSON.stringify(`event_${e}`)})`)
        lines.push(`})`)
      }
      lines.push(``)
    }
    writeText(path.join(outDir, `events.ts`), lines.join('\n'))
  }

  // 报告：所有没纳入生成的函数都写清原因
  writeText(
    path.join(outDir, `_skipped_nodes.txt`),
    skipped.map((s) => `${s.name}\t${s.nodeType ?? ''}\t${s.why}`).join('\n') + '\n'
  )
  writeText(
    path.join(outDir, `_report.json`),
    JSON.stringify(
      {
        totalMethods: methods.length,
        includedMethods: Object.keys(included).length,
        skippedMethods: skipped.length,
        included,
        skipped,
        notes: {
          enumPickCount: enumPick.size,
          genericsFunctions: genericsMap.size,
          summaryGroups: summary.length
        }
      },
      null,
      2
    ) + '\n'
  )

  console.log(`[ok] generated: ${outDir}`)
  console.log(`[ok] included methods: ${Object.keys(included).length}/${methods.length}`)
  console.log(`[warn] skipped methods: ${skipped.length} (see tests/generated/_skipped_nodes.txt)`)
}

main()
