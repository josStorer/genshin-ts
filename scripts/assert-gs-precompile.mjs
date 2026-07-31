import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import {
  emitIrJsonForEntries,
  resolveIrOutputPath
} from '../dist/src/compiler/gs_to_ir_json_transform/index.js'
import { compileGsModulesToJs } from '../dist/src/compiler/gs_to_js_pipeline.js'
import { compileTsToGs } from '../dist/src/compiler/ts_to_gs_pipeline.js'

const repoRoot = path.resolve(import.meta.dirname, '..')
const tempRoot = fs.mkdtempSync(path.join(repoRoot, '.gsts-precompile-test-'))
const sourceRoot = path.join(tempRoot, 'source')
const outDir = path.join(tempRoot, 'out')

try {
  fs.mkdirSync(sourceRoot, { recursive: true })
  fs.writeFileSync(
    path.join(tempRoot, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ESNext',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        baseUrl: './source',
        paths: { '@fixture/*': ['./*'] }
      }
    }),
    'utf8'
  )
  fs.writeFileSync(
    path.join(sourceRoot, 'entry.ts'),
    `import { g } from 'genshin-ts/runtime/core'
import '@fixture/helper'

await import(\`./dynamic\`)

g.server({ id: 1073742999 }).on('whenEntityIsCreated', (_evt, f) => {
  f.printString('precompile-ok')
})
`,
    'utf8'
  )
  fs.writeFileSync(
    path.join(sourceRoot, 'helper.ts'),
    `import { readHelperValue } from './cycle.js'

export const helperValue = 'helper'
export function readCycleValue() {
  return readHelperValue()
}
`,
    'utf8'
  )
  fs.writeFileSync(
    path.join(sourceRoot, 'cycle.ts'),
    `import { helperValue } from './helper.js'

export function readHelperValue() {
  return helperValue
}
`,
    'utf8'
  )
  fs.writeFileSync(path.join(sourceRoot, 'dynamic.ts'), `export const value = 'dynamic'\n`, 'utf8')

  const result = await compileTsToGs({
    cfgDir: tempRoot,
    cfg: {
      compileRoot: 'source',
      entries: ['entry.ts'],
      outDir: 'out'
    }
  })

  assert.equal(result.entryOutFiles.length, 1)
  assert.equal(result.sourceFiles.length, 4)
  assert.equal(result.runtimeSourceFiles.length, 4)
  assert.equal(result.moduleOutFiles.length, 4)
  assert.ok(result.sourceFiles.some((file) => file.endsWith('helper.ts')))
  assert.ok(result.sourceFiles.some((file) => file.endsWith('cycle.ts')))
  assert.ok(result.sourceFiles.some((file) => file.endsWith('dynamic.ts')))

  const entryFile = result.entryOutFiles[0]
  const generatedEntry = fs.readFileSync(entryFile, 'utf8')
  assert.match(generatedEntry, /['"]\.\/helper\.gs\.js['"];/)
  assert.match(generatedEntry, /import\(['"]\.\/dynamic\.gs\.js['"]\)/)

  let fallbackProfile
  await emitIrJsonForEntries(result.entryOutFiles, {
    cwd: repoRoot,
    profile: true,
    onProfile: (profile) => (fallbackProfile = profile),
    runtimeOptions: { precompileExpression: false, removeUnusedNodes: false }
  })
  assert.equal(fallbackProfile?.stats.runner, 'tsx')
  const irPath = resolveIrOutputPath(entryFile)
  const fallbackIr = fs.readFileSync(irPath, 'utf8')

  let directProfile
  await emitIrJsonForEntries(result.entryOutFiles, {
    cwd: repoRoot,
    moduleFiles: result.moduleOutFiles,
    moduleRoot: result.outDir,
    profile: true,
    onProfile: (profile) => (directProfile = profile),
    runtimeOptions: { precompileExpression: false, removeUnusedNodes: false }
  })
  assert.equal(directProfile?.stats.runner, 'node')
  assert.equal(directProfile?.stats.modules, 4)
  for (const gsFile of result.moduleOutFiles) {
    const jsFile = gsFile.replace(/\.gs\.ts$/i, '.gs.js')
    assert.ok(fs.existsSync(jsFile), `Expected ${jsFile}`)
    assert.ok(fs.existsSync(`${jsFile}.map`), `Expected ${jsFile}.map`)
  }

  const directIr = fs.readFileSync(irPath, 'utf8')
  const directDocs = JSON.parse(directIr)
  assert.equal(directDocs[0]?.graph?.name, '_GSTS_entry')
  assert.equal(directIr, fallbackIr)

  const failingGsFile = path.join(outDir, 'source-map-check.gs.ts')
  fs.writeFileSync(
    failingGsFile,
    `const lineOne = 1\nthrow new Error('source-map-check')\n`,
    'utf8'
  )
  await compileGsModulesToJs({
    moduleFiles: [failingGsFile],
    rootDir: outDir
  })
  const sourceMapRun = spawnSync(
    process.execPath,
    ['--enable-source-maps', failingGsFile.replace(/\.gs\.ts$/i, '.gs.js')],
    { encoding: 'utf8' }
  )
  assert.notEqual(sourceMapRun.status, 0)
  assert.match(sourceMapRun.stderr, /source-map-check\.gs\.ts:2/)

  console.log('[ok] GS dependency precompile, source maps, Node runner, and TSX equivalence')
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true })
}
