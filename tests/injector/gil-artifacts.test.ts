import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { extractGilArtifacts } from '../../src/cli/gil_artifacts.js'
import { parseGilPayloadFields, tryFormatWithPrettier } from '../../src/cli/gil_extract_utils.js'
import { buildFile, encodeVarint } from '../../src/injector/binary.js'

function concat(...parts: Uint8Array[]): Uint8Array {
  return Buffer.concat(parts.map((part) => Buffer.from(part)))
}

function varintField(field: number, value: number): Uint8Array {
  return concat(encodeVarint(field << 3), encodeVarint(value))
}

function bytesField(field: number, value: Uint8Array): Uint8Array {
  return concat(encodeVarint((field << 3) | 2), encodeVarint(value.length), value)
}

const signalName = 'artifact_signal'
const customPrefabName = 'Artifact Prefab'
const signalId = concat(
  varintField(1, 10001),
  varintField(2, 20000),
  varintField(3, 22000),
  varintField(5, 456789)
)
const signalDefinition = bytesField(
  10,
  bytesField(
    2,
    bytesField(
      1,
      concat(
        bytesField(4, bytesField(1, signalId)),
        bytesField(107, bytesField(101, bytesField(1, Buffer.from(signalName, 'utf8'))))
      )
    )
  )
)
const customPrefab = bytesField(
  4,
  bytesField(
    1,
    concat(
      varintField(1, 987654),
      varintField(2, 1001),
      bytesField(6, bytesField(11, bytesField(1, Buffer.from(customPrefabName, 'utf8'))))
    )
  )
)
const gilBytes = buildFile(concat(customPrefab, signalDefinition), {
  schema: 1,
  headTag: 0x0326,
  fileType: 0,
  tailTag: 0x0679
})
const parsed = parseGilPayloadFields(gilBytes)
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsts-artifacts-'))
const resourcesPath = path.join(tempDir, 'prefabs.ts')
const signalsPath = path.join(tempDir, 'signals.ts')

try {
  const extracted = extractGilArtifacts({
    gilPath: path.join(tempDir, 'unused.gil'),
    parsed,
    resources: { outPath: resourcesPath, lang: 'en' },
    signals: { outPath: signalsPath }
  })
  assert.equal(extracted.resources?.status, 'ok')
  assert.equal(extracted.signals?.status, 'ok')
  assert.equal(extracted.profile.reusedParsed, true)
  assert.equal(extracted.profile.readGilMs, 0)
  assert.equal(extracted.profile.parseGilMs, 0)
  assert.equal(extracted.profile.formatAttempts, 1)
  assert.equal(extracted.profile.formatRuns, 1)
  assert.equal(extracted.profile.formatRequestedFiles, 2)
  assert.equal(extracted.profile.formattedFiles, 2)
  assert.equal(extracted.profile.formatError, undefined)
  assert.ok(extracted.profile.formatMs >= 0)
  assert.match(fs.readFileSync(resourcesPath, 'utf8'), /"Artifact Prefab": 987654/)
  assert.match(fs.readFileSync(signalsPath, 'utf8'), /"artifact_signal"/)

  const missingFormat = tryFormatWithPrettier(path.join(tempDir, 'missing-format-target.ts'))
  assert.equal(missingFormat.attempted, true)
  assert.equal(missingFormat.succeeded, false)
  assert.ok(missingFormat.error)
  assert.deepEqual(tryFormatWithPrettier([]), {
    attempted: false,
    succeeded: false
  })

  fs.writeFileSync(resourcesPath, '// user-maintained resources\n')
  fs.writeFileSync(signalsPath, '// user-maintained signals\n')
  const skipped = extractGilArtifacts({
    gilPath: path.join(tempDir, 'still-unused.gil'),
    resources: { outPath: resourcesPath, lang: 'en' },
    signals: { outPath: signalsPath }
  })
  assert.equal(skipped.resources?.status, 'skipped-existing')
  assert.equal(skipped.signals?.status, 'skipped-existing')
  assert.equal(skipped.profile.inputBytes, 0)
  assert.equal(skipped.profile.readGilMs, 0)
  assert.equal(skipped.profile.parseGilMs, 0)
  assert.equal(skipped.profile.formatAttempts, 0)
  assert.equal(skipped.profile.formatRuns, 0)
  assert.equal(skipped.profile.formatRequestedFiles, 0)
  assert.equal(skipped.profile.formattedFiles, 0)
  assert.equal(skipped.profile.formatError, undefined)
  assert.equal(skipped.profile.formatMs, 0)
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true })
}

console.log('[ok] resource and signal extraction share one parsed GIL payload')
