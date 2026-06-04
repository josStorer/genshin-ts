import { g } from 'genshin-ts/runtime/core'

// Expected:
// - nested const object members are accepted in switch case labels
// - ordinary expression positions keep const object member access unchanged
// - repeated const-evaluable aliases do not become LocalVariable nodes
// - repeated non-const-evaluable aliases still become LocalVariable nodes
// - non-const objects and non-literal initializers are not folded
// - shadowed const object names resolve to the nearest TypeScript symbol, then restore outer scope

const WorkflowCodes = {
  Route: {
    Start: 10n,
    Stop: 11n
  },
  Labels: {
    Ready: 'ready'
  },
  Metrics: {
    Bonus: 300n
  }
} as const

const OtherWorkflowCodes = {
  Route: {
    Start: 12n
  }
} as const

const DefaultRoute = WorkflowCodes.Route.Start
const ReadyLabel = WorkflowCodes.Labels.Ready
let AliasWorkflowCodes: typeof WorkflowCodes | typeof OtherWorkflowCodes = WorkflowCodes

let RuntimeCodes = {
  Route: {
    Start: 20n
  }
} as const

const ComputedCodes = {
  Route: {
    Start: 20n + 1n
  }
} as const

const ShadowedCodes = {
  Route: {
    Start: 30n
  }
} as const

g.server({
  id: 1073741878
}).on('whenEntityIsCreated', (_evt, f) => {
  const selectedRoute: bigint = DefaultRoute
  const selectedLabel: string = ReadyLabel
  const RepeatedBonus = WorkflowCodes.Metrics.Bonus
  const ComputedRoute = ComputedCodes.Route.Start

  switch (selectedRoute) {
    case WorkflowCodes.Route.Start:
      f.printString(str(WorkflowCodes.Metrics.Bonus))
      break
    case WorkflowCodes.Route.Stop:
      f.printString('stop')
      break
    default:
      f.printString('unknown route')
      break
  }

  switch (selectedLabel) {
    case WorkflowCodes.Labels.Ready:
      f.printString(WorkflowCodes.Labels.Ready)
      break
    default:
      f.printString('unknown label')
      break
  }

  f.printString(str(RepeatedBonus))
  f.printString(str(RepeatedBonus))
  if (selectedRoute > 0n) {
    AliasWorkflowCodes = OtherWorkflowCodes
  }
  f.printString(str(AliasWorkflowCodes.Route.Start))
  f.printString(str(RuntimeCodes.Route.Start))
  f.printString(str(ComputedCodes.Route.Start))
  f.printString(str(ComputedRoute))
  f.printString(str(ComputedRoute))
})

{
  const ShadowedCodes = {
    Route: {
      Start: 31n
    }
  } as const
  const ShadowedRoute = ShadowedCodes.Route.Start

  g.server({
    id: 1073741879
  }).on('whenEntityIsCreated', (_evt, f) => {
    f.printString(str(ShadowedRoute))
  })
}

g.server({
  id: 1073741880
}).on('whenEntityIsCreated', (_evt, f) => {
  f.printString(str(ShadowedCodes.Route.Start))
})
