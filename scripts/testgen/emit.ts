import fs from 'node:fs'
import path from 'node:path'

import type { Mode } from './values.js'

export type GeneratedCall = {
  fn: string
  typeCase?: string
  code: string
}

export function writeText(p: string, text: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, text, 'utf8')
}

export function cleanDir(dir: string) {
  const keep = new Set([
    'mismatch_only.literal.ts',
    'mismatch_only.wire.ts',
    'enum_nodes_second.ts',
    'final_all.ts'
  ])
  if (fs.existsSync(dir)) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isFile() && keep.has(ent.name)) continue
      fs.rmSync(path.join(dir, ent.name), { recursive: true, force: true })
    }
  }
  fs.mkdirSync(dir, { recursive: true })
}

type EmitOptions = {
  serverMode?: 'beyond' | 'classic'
}

export function header(
  mode: Mode,
  title: string,
  graphId: number,
  options: EmitOptions = {}
): string {
  const serverOptions =
    options.serverMode === 'classic' ? `{ id: ${graphId}, mode: 'classic' }` : `{ id: ${graphId} }`
  return [
    `import { g } from 'genshin-ts/runtime/core'`,
    `import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'`,
    `import * as E from 'genshin-ts/definitions/enum'`,
    ``,
    `// AUTO-GENERATED: ${title} (${mode})`,
    `// Run: npx tsx scripts/generate-node-gia-tests.ts`,
    ``,
    `g.server(${serverOptions}).on('whenEntityIsCreated', (_evt, f) => {`
  ].join('\n')
}

export function footer(): string {
  return `})`
}

export function emitFile(
  mode: Mode,
  title: string,
  graphId: number,
  producers: string | null,
  calls: GeneratedCall[],
  options: EmitOptions = {}
) {
  const lines: string[] = []
  lines.push(header(mode, title, graphId, options))
  if (producers) lines.push(producers)
  for (const c of calls) {
    if (c.typeCase) lines.push(`  // ${c.fn} :: ${c.typeCase}`)
    for (const line of c.code.split('\n')) lines.push(`  ${line}`)
  }
  lines.push(footer())
  return lines.join('\n') + '\n'
}
