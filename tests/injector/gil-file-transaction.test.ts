import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  assertGilFileUnchanged,
  getGilFileVersion,
  writeFileAtomic
} from '../../src/cli/gil_file_transaction.js'

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsts-gil-transaction-'))

try {
  const gilPath = path.join(tempDir, 'map.gil')
  fs.writeFileSync(gilPath, 'before')

  const initialVersion = getGilFileVersion(gilPath)
  assert.deepEqual(
    assertGilFileUnchanged(gilPath, initialVersion, 'unexpected change'),
    initialVersion
  )

  fs.writeFileSync(gilPath, 'changed-size')
  assert.throws(() => assertGilFileUnchanged(gilPath, initialVersion, 'map changed'), /map changed/)

  writeFileAtomic(gilPath, Buffer.from('after'))
  assert.equal(fs.readFileSync(gilPath, 'utf8'), 'after')
  assert.equal(
    fs.readdirSync(tempDir).filter((name) => name.startsWith('.map.gil.') && name.endsWith('.tmp'))
      .length,
    0
  )

  const directoryTarget = path.join(tempDir, 'directory-target')
  fs.mkdirSync(directoryTarget)
  assert.throws(() => writeFileAtomic(directoryTarget, Buffer.from('cannot replace directory')))
  assert.equal(
    fs
      .readdirSync(tempDir)
      .filter((name) => name.startsWith('.directory-target.') && name.endsWith('.tmp')).length,
    0
  )
  assert.equal(fs.statSync(directoryTarget).isDirectory(), true)
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true })
}

console.log('[ok] GIL file version checks and atomic write cleanup preserve the target')
