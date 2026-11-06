import fs from 'node:fs'

type ClientGraphSubType =
  | 'character_skill'
  | 'character_control_skill'
  | 'creation_skill'
  | 'creation_status'
  | 'creation_status_decision'
  | 'bool_filter'
  | 'int_filter'

type ExtractedGroup = {
  key: number
  name: string
  count: number
  nodes: Array<{ genericId: number }>
}

type ExtractedReport = {
  source: unknown
  groups: ExtractedGroup[]
}

const reportPath = 'resources/client_node_pools_extracted.json'
const outputPath = 'resources/client_node_modes.json'
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as ExtractedReport

const specs: Record<
  ClientGraphSubType,
  { entryGenericId: number; beyondGroup: number; classicGroup?: number; classicReason?: string }
> = {
  bool_filter: { entryGenericId: 200000, beyondGroup: 3, classicGroup: 13 },
  int_filter: { entryGenericId: 200122, beyondGroup: 3, classicGroup: 13 },
  character_skill: {
    entryGenericId: 200042,
    beyondGroup: 4,
    classicGroup: 14,
    classicReason: 'BeyondEditor exposes an explicitly empty classic character skill group'
  },
  character_control_skill: {
    entryGenericId: 200042,
    beyondGroup: 18,
    classicReason: 'BeyondEditor exposes no classic character control skill group'
  },
  creation_skill: { entryGenericId: 200042, beyondGroup: 10, classicGroup: 16 },
  creation_status_decision: { entryGenericId: 200126, beyondGroup: 9, classicGroup: 15 },
  creation_status: { entryGenericId: 200126, beyondGroup: 11, classicGroup: 17 }
}

const groups = new Map(report.groups.map((group) => [group.key, group]))
const staticNodeEvidence = [
  {
    genericId: 200242,
    relativePath: 'Resource/Json/Beyond/Node/16783183026819652111.mihoyobin',
    sha256: '1578caf1ac26d4c8acfb3431e83de3cda19fd8f21a016344c5ab0b88aaabf417'
  },
  {
    genericId: 200251,
    relativePath: 'Resource/Json/Beyond/Node/17432833879509313657.mihoyobin',
    sha256: '4c3d3e0a992b4af1b83017faad0f0f323dac90f737154fafac9d4506deeba143'
  },
  {
    genericId: 200254,
    relativePath: 'Resource/Json/Beyond/Node/279208459246344190.mihoyobin',
    sha256: '3b46be73d29be1c0809f3002f8a964867108d3f5e54c08902af10b57d6618388'
  },
  {
    genericId: 200249,
    relativePath: 'Resource/Json/Beyond/Node/9073923717836444300.mihoyobin',
    sha256: 'b7357cec4fa89fa901f5d8ffae0f0bdb8e7685b8568e2188a2efa52ecdddd3e0'
  }
]
const graphs = Object.fromEntries(
  Object.entries(specs).map(([subType, spec]) => {
    const beyond = groups.get(spec.beyondGroup)
    if (!beyond?.count) throw new Error(`${subType}: missing BeyondEditor beyond group`)

    const classic = spec.classicGroup === undefined ? undefined : groups.get(spec.classicGroup)
    const classicAvailable = Boolean(classic?.count)
    return [
      subType,
      {
        entryGenericId: spec.entryGenericId,
        beyond: {
          status: 'available',
          reason: '',
          groupKey: beyond.key,
          groupName: beyond.name,
          genericIds: beyond.nodes.map((node) => node.genericId).sort((a, b) => a - b)
        },
        classic: {
          status: classicAvailable ? 'available' : 'unavailable',
          reason: classicAvailable
            ? ''
            : (spec.classicReason ?? 'classic client graph unavailable'),
          groupKey: classic?.key ?? null,
          groupName: classic?.name ?? null,
          genericIds: classicAvailable
            ? classic!.nodes.map((node) => node.genericId).sort((a, b) => a - b)
            : []
        }
      }
    ]
  })
)

fs.writeFileSync(
  outputPath,
  `${JSON.stringify({ format: 1, source: report.source, staticNodeEvidence, graphs }, null, 2)}\n`,
  'utf8'
)

console.log(`[ok] wrote ${outputPath}`)
