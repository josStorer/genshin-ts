export type InjectionAttemptOutcome =
  | { status: 'ok'; wroteGil: boolean }
  | { status: 'failed'; wroteGil: false; error: unknown }

export type InjectionAttemptHooks = {
  onBeforeInject?: () => void
  onAfterInject?: (outcome: InjectionAttemptOutcome) => void
}

export function runInjectionAttempt<T extends { wroteGil: boolean }>(
  run: () => T,
  hooks?: InjectionAttemptHooks
): T {
  hooks?.onBeforeInject?.()
  let outcome: InjectionAttemptOutcome | undefined
  try {
    const result = run()
    outcome = { status: 'ok', wroteGil: result.wroteGil }
    return result
  } catch (error) {
    outcome = { status: 'failed', wroteGil: false, error }
    throw error
  } finally {
    if (outcome) hooks?.onAfterInject?.(outcome)
  }
}

export type InjectionTaskKind = 'code-change' | 'reinject'

export function createInjectionTaskQueue(callbacks: {
  runCodeChange: () => Promise<void>
  runReinject: () => Promise<void>
  onError: (error: unknown) => void
}): {
  schedule: (task: InjectionTaskKind) => Promise<void>
} {
  let pendingCodeChange = false
  let pendingReinject = false
  let running: Promise<void> | undefined

  const drain = async () => {
    while (pendingCodeChange || pendingReinject) {
      const task: InjectionTaskKind = pendingCodeChange ? 'code-change' : 'reinject'
      if (task === 'code-change') pendingCodeChange = false
      else pendingReinject = false

      try {
        if (task === 'code-change') await callbacks.runCodeChange()
        else await callbacks.runReinject()
      } catch (error) {
        callbacks.onError(error)
      }
    }
  }

  const schedule = (task: InjectionTaskKind): Promise<void> => {
    if (task === 'code-change') pendingCodeChange = true
    else pendingReinject = true

    if (!running) {
      running = drain().finally(() => {
        running = undefined
        if (pendingCodeChange || pendingReinject) {
          void schedule(pendingCodeChange ? 'code-change' : 'reinject')
        }
      })
    }
    return running
  }

  return { schedule }
}
