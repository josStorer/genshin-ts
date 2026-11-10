import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const work = path.join(root, '.tmp/in-game-list')
const graphName = '_GSTS_ListRegression'

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', windowsHide: true })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`Command failed with exit code ${result.status}`)
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
      map: { type: 'string', default: '1073741825' },
      player: { type: 'string' },
      region: { type: 'string' },
      gil: { type: 'string' },
      tag: { type: 'string', default: '1073741825' },
      prefab: { type: 'string', default: '20001224' },
      go: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false }
    }
  })
  if (values.help) {
    console.log(
      'node scripts/inject-list-regression.mjs [--map ID] [--player ID] [--region China|Global] [--tag ID] [--prefab ID] [--gil COPY.gil] [--go]'
    )
    console.log('Builds the current compiler and graph. Without --go, validates in memory only.')
    console.log(
      'Save your map and open another map before --go. Backups: .tmp/in-game-list/backups'
    )
    return
  }
  const mapId = positiveId(values.map, 'map')
  const tagId = positiveId(values.tag, 'tag')
  const prefabId = positiveId(values.prefab, 'prefab')
  const playerId = values.player === undefined ? undefined : positiveId(values.player, 'player')
  if (values.region !== undefined && !['China', 'Global'].includes(values.region)) {
    throw new Error('--region must be China or Global')
  }

  if (process.platform === 'win32')
    run(process.env.ComSpec ?? 'cmd.exe', ['/d', '/c', 'npm run build'])
  else run('npm', ['run', 'build'])
  const { parseGilPayloadFields } = await import('../dist/src/cli/gil_extract_utils.js')
  const { resolveGilTarget } = await import('../dist/src/cli/gil_paths.js')
  const { writeFileAtomic } = await import('../dist/src/cli/gil_file_transaction.js')
  const { createInjector } = await import('../dist/src/injector/index.js')
  const { buildNodeGraphFieldIndex, extractGraphType, isNodeGraphEmptyForInjection } =
    await import('../dist/src/injector/node_graph.js')
  const { loadGiaProto } = await import('../dist/src/injector/proto.js')
  const gilPath = values.gil
    ? path.resolve(values.gil)
    : resolveGilTarget({ mapId, playerId, gameRegion: values.region }).gilPath
  const original = fs.readFileSync(gilPath)
  const proto = loadGiaProto()

  function readGraphs(bytes) {
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
  const existing = graphs.filter((graph) => graph.name === graphName)
  if (existing.length > 1 || existing.some((graph) => !graph.unique)) {
    throw new Error(`Multiple graphs named ${graphName} or duplicate graph IDs; resolve them first`)
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
  if (target.type !== 20000) throw new Error(`${graphName} is not an entity graph`)
  console.log(`Save: ${gilPath}\nTarget: ${target.id} (${target.name || 'unnamed'})`)

  fs.mkdirSync(work, { recursive: true })
  fs.writeFileSync(
    path.join(work, 'tsconfig.json'),
    JSON.stringify({ extends: '../../tsconfig.json', include: ['./check.ts'] })
  )
  const fixture = fs.readFileSync(
    path.join(root, 'tests/manual/graph-features/list-in-game.ts'),
    'utf8'
  )
  fs.writeFileSync(
    path.join(work, 'check.ts'),
    fixture
      .replace('const TEST_TAG = 1073741825n', `const TEST_TAG = ${tagId}n`)
      .replace('const TEST_PREFAB = 20001224', `const TEST_PREFAB = ${prefabId}`)
  )
  const config = path.join(work, 'gsts.config.mjs')
  fs.writeFileSync(
    config,
    `export default ${JSON.stringify({ compileRoot: '.', entries: ['./check.ts'], outDir: './out' })}\n`
  )
  run(process.execPath, [
    path.join(root, 'bin/gsts.mjs'),
    '-c',
    config,
    '--noinject',
    '--lang',
    'en'
  ])
  const { bytes } = createInjector({ lang: 'en' }).injectBytes({
    gilBytes: original,
    giaBytes: fs.readFileSync(path.join(work, 'out/check.gia')),
    targetId: target.id
  })
  function verify(bytesToCheck) {
    const found = readGraphs(bytesToCheck).filter((graph) => graph.id === target.id)
    if (found.length !== 1 || found[0].name !== graphName || found[0].empty) {
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
  const backups = path.join(work, 'backups')
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
    `[ok] Injected ${graphName} (ID ${target.id}). Reopen the map, attach this graph to ONE scene entity, then play.`
  )
  console.log(
    'Do not save stale editor contents before reopening. Repeated injection reuses this graph.'
  )
}

main().catch((error) => {
  console.error(`[error] ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
