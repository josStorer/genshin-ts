import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const CASES = {
  promotion: {
    source: 'tests/manual/parity/list-promotion-parity.ts',
    graphName: '_GSTS_ListPromotionParity',
    patch: (text) => text
  },
  budget: {
    source: 'tests/manual/parity/execution-budget.ts',
    graphName: '_GSTS_ExecutionBudget',
    patch: (text) => text
  },
  complex: {
    source: 'tests/other/complex_feature_demo.ts',
    graphName: '_GSTS_ComplexFeatureDemo',
    patch: (text) =>
      text.replace(/id: 1073741872\r?\n/, "id: 1073741872,\n  name: '_GSTS_ComplexFeatureDemo'\n")
  }
}

function run(command, args, cwd, capture = false) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    encoding: 'utf8',
    windowsHide: true
  })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`Command failed with exit code ${result.status}`)
  return result.stdout
}

function positiveId(value, option) {
  const id = Number(value)
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0) {
    throw new Error(`--${option} requires a positive integer`)
  }
  return id
}

async function main() {
  const { values } = parseArgs({
    options: {
      case: { type: 'string', default: 'promotion' },
      compiler: { type: 'string' },
      map: { type: 'string', default: '1073741825' },
      player: { type: 'string' },
      region: { type: 'string' },
      gil: { type: 'string' },
      go: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false }
    }
  })
  if (values.help) {
    console.log(
      'node scripts/inject-parity.mjs --case promotion|complex [--compiler WORKTREE] [--map ID] [--player ID] [--region China|Global] [--gil COPY.gil] [--go]'
    )
    console.log('Compiles the case, prints the expected log from Node.js, then injects it.')
    console.log('--compiler compiles with another genshin-ts checkout that already has dist built.')
    console.log('Without --go the save is only validated in memory.')
    return
  }
  const testCase = CASES[values.case]
  if (!testCase) throw new Error(`--case must be one of: ${Object.keys(CASES).join(', ')}`)
  const compilerRoot = path.resolve(values.compiler ?? root)
  const mapId = positiveId(values.map, 'map')
  const playerId = values.player === undefined ? undefined : positiveId(values.player, 'player')
  if (values.region !== undefined && !['China', 'Global'].includes(values.region)) {
    throw new Error('--region must be China or Global')
  }

  if (compilerRoot === root) {
    if (process.platform === 'win32')
      run(process.env.ComSpec ?? 'cmd.exe', ['/d', '/c', 'npm run build'], root)
    else run('npm', ['run', 'build'], root)
  } else if (!fs.existsSync(path.join(compilerRoot, 'dist/src/cli/gsts.js'))) {
    throw new Error(`${compilerRoot} has no dist build; run npm run build there first`)
  }

  const load = (file) => import(pathToFileURL(path.join(root, 'dist/src', file)).href)
  const { parseGilPayloadFields } = await load('cli/gil_extract_utils.js')
  const { resolveGilTarget } = await load('cli/gil_paths.js')
  const { writeFileAtomic } = await load('cli/gil_file_transaction.js')
  const { createInjector } = await load('injector/index.js')
  const { buildNodeGraphFieldIndex, extractGraphType, isNodeGraphEmptyForInjection } =
    await load('injector/node_graph.js')
  const { loadGiaProto } = await load('injector/proto.js')

  const gilPath = values.gil
    ? path.resolve(values.gil)
    : resolveGilTarget({ mapId, playerId, gameRegion: values.region }).gilPath
  const original = fs.readFileSync(gilPath)
  const proto = loadGiaProto()
  const readGraphs = (bytes) => {
    const parsed = parseGilPayloadFields(bytes)
    const graphs = []
    for (const [id, matches] of buildNodeGraphFieldIndex(parsed.payload, parsed.fields)) {
      for (const { field } of matches) {
        const graph = proto.nodeGraphMessage.decode(
          parsed.payload.subarray(field.dataStart, field.dataEnd)
        )
        graphs.push({
          id,
          name: graph.name ?? '',
          type: extractGraphType(graph),
          empty: isNodeGraphEmptyForInjection(graph),
          unique: matches.length === 1
        })
      }
    }
    return graphs
  }
  const graphs = readGraphs(original)
  const existing = graphs.filter((graph) => graph.name === testCase.graphName)
  if (existing.length > 1 || existing.some((graph) => !graph.unique)) {
    throw new Error(`Multiple graphs named ${testCase.graphName}; resolve them first`)
  }
  const target =
    existing[0] ??
    graphs
      .filter((graph) => graph.unique && graph.type === 20000 && graph.empty)
      .sort((a, b) => a.id - b.id)[0]
  if (!target)
    throw new Error(
      'No empty entity graph. Create an empty server entity graph and save the map first.'
    )
  if (target.type !== 20000) throw new Error(`${testCase.graphName} is not an entity graph`)
  console.log(`Save: ${gilPath}\nTarget: ${target.id} (${target.name || 'unnamed'})`)

  // The fixture is compiled inside the chosen checkout so `genshin-ts/*` resolves to that version.
  const work = path.join(compilerRoot, '.tmp/in-game-parity', values.case)
  fs.mkdirSync(work, { recursive: true })
  fs.writeFileSync(
    path.join(work, 'tsconfig.json'),
    JSON.stringify({ extends: '../../../tsconfig.json', include: ['./check.ts'] })
  )
  const fixture = testCase.patch(fs.readFileSync(path.join(root, testCase.source), 'utf8'))
  if (!fixture.includes(testCase.graphName)) throw new Error('Could not name the test graph')
  fs.writeFileSync(path.join(work, 'check.ts'), fixture)
  fs.writeFileSync(
    path.join(work, 'gsts.config.mjs'),
    `export default ${JSON.stringify({ compileRoot: '.', entries: ['./check.ts'], outDir: './out' })}\n`
  )
  run(
    process.execPath,
    [
      path.join(compilerRoot, 'bin/gsts.mjs'),
      '-c',
      'gsts.config.mjs',
      '--noinject',
      '--lang',
      'en'
    ],
    work
  )

  const expected = run(
    process.execPath,
    [path.join(root, 'scripts/parity/run-node.mjs'), path.join(work, 'check.ts')],
    root,
    true
  )
  fs.writeFileSync(path.join(work, 'expected.txt'), expected)
  console.log(`\nExpected game log (Node.js), saved to ${path.join(work, 'expected.txt')}:`)
  console.log(expected)

  const { bytes } = createInjector({ lang: 'en' }).injectBytes({
    gilBytes: original,
    giaBytes: fs.readFileSync(path.join(work, 'out/check.gia')),
    targetId: target.id
  })
  const verify = (bytesToCheck) => {
    const found = readGraphs(bytesToCheck).filter((graph) => graph.id === target.id)
    if (found.length !== 1 || found[0].name !== testCase.graphName || found[0].empty) {
      throw new Error('Injected graph verification failed; retain the backup and logs')
    }
  }
  verify(bytes)
  if (!values.go) {
    console.log(
      '[ok] Dry run passed. Save unchanged. Add --go after opening another map in the editor.'
    )
    return
  }
  const backups = path.join(root, '.tmp/in-game-parity/backups')
  fs.mkdirSync(backups, { recursive: true })
  const backup = path.join(
    backups,
    `${path.basename(gilPath, '.gil')}-${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}.gil`
  )
  fs.writeFileSync(backup, original, { flag: 'wx' })
  console.log(`Backup: ${backup}`)
  if (!fs.readFileSync(gilPath).equals(original)) {
    throw new Error(
      'Save changed during compilation; no injection performed. Open another map and retry.'
    )
  }
  writeFileAtomic(gilPath, bytes)
  verify(fs.readFileSync(gilPath))
  console.log(
    `[ok] Injected ${testCase.graphName} (ID ${target.id}). Reopen the map, attach this graph to ONE scene entity, then play.`
  )
}

main().catch((error) => {
  console.error(`[error] ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
