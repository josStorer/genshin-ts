import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { parseMessage, readUint32BE } from '../injector/binary.js'
import type { LenField } from '../injector/types.js'

export {
  decodeUtf8,
  readFieldBytes,
  readFieldMessages,
  readFieldVarint
} from '../injector/binary.js'

export type ParsedGilPayload = {
  payload: Uint8Array
  fields: LenField[]
}

export type ExistingGeneratedFileCheck =
  | { status: 'skipped-existing'; outPath: string }
  | { status: 'failed'; outPath: string; error: string }

export function hasGeneratedHeader(text: string, header: string): boolean {
  const lines = text.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    return trimmed === header
  }
  return false
}

export function checkExistingGeneratedFile(
  outPath: string,
  header: string
): ExistingGeneratedFileCheck | null {
  if (!fs.existsSync(outPath)) return null
  try {
    const existing = fs.readFileSync(outPath, 'utf8')
    if (!hasGeneratedHeader(existing, header)) {
      return { status: 'skipped-existing', outPath }
    }
    return null
  } catch (e) {
    return {
      status: 'failed',
      outPath,
      error: e instanceof Error ? e.message : String(e)
    }
  }
}

export function readGilPayloadFields(gilPath: string): ParsedGilPayload {
  const bytes = new Uint8Array(fs.readFileSync(gilPath))
  if (bytes.length < 24) {
    throw new Error('[error] invalid gil size')
  }
  const headTag = readUint32BE(bytes, 8)
  const tailTag = readUint32BE(bytes, bytes.length - 4)
  if (headTag !== 0x0326 || tailTag !== 0x0679) {
    throw new Error('[error] invalid gil header tags')
  }

  const payload = bytes.slice(20, -4)
  const fields: LenField[] = []
  parseMessage(payload, 0, payload.length, 0, 0, 0, 0, 0, 0, 0, fields)
  return { payload, fields }
}

export function tryFormatWithPrettier(filePath: string) {
  try {
    const require = createRequire(import.meta.url)
    let prettierBin: string | undefined
    try {
      prettierBin = require.resolve('prettier/bin-prettier.cjs')
    } catch {
      try {
        prettierBin = require.resolve('prettier/bin/prettier.cjs')
      } catch {
        return
      }
    }
    const res = spawnSync(process.execPath, [prettierBin, '--write', filePath], {
      encoding: 'utf8',
      windowsHide: true
    })
    if (res.error || res.status !== 0) {
      // best-effort formatting; ignore failures
    }
  } catch {
    // prettier not installed; ignore
  }
}

export function writeGeneratedFile(outPath: string, source: string) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, source)
  tryFormatWithPrettier(outPath)
}
