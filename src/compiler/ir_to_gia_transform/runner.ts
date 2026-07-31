import { writeGiaFromIrJsonFile } from './shared.js'

function parseIndicesCsv(csv: string | undefined): number[] | undefined {
  if (!csv) return undefined
  const trimmed = csv.trim()
  if (!trimmed) return undefined
  return trimmed
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n))
}

function main() {
  const [irPathArg, outFileArg, preserveFlag, indicesCsv] = process.argv.slice(2)
  if (!irPathArg) {
    console.error('[error] irPath is required')
    process.exit(1)
  }

  const irPath = irPathArg
  const outFile = outFileArg || undefined
  const preserveIndices = preserveFlag === '1'
  const includeIndices = parseIndicesCsv(indicesCsv)

  const profiling = process.env.GSTS_PIPELINE_PROFILE === '1'
  let profile: Parameters<NonNullable<Parameters<typeof writeGiaFromIrJsonFile>[4]>>[0] | undefined
  const outputs = writeGiaFromIrJsonFile(
    irPath,
    outFile,
    { includeIndices, preserveIndices },
    (x) => {
      // Print progress immediately (stderr is inherited by parent).
      process.stderr.write(`[ok] ${x.giaPath} (id=${x.graphId})\n`)
    },
    profiling ? (value) => (profile = value) : undefined
  )
  if (profile) {
    process.stderr.write(`[gsts-profile:ir-to-gia] ${JSON.stringify(profile)}\n`)
  }
  process.stdout.write(JSON.stringify(outputs))
}

try {
  main()
} catch (err) {
  console.error(err instanceof Error ? (err.stack ?? err.message) : String(err))
  process.exit(1)
}
