import { performance } from 'node:perf_hooks'

/** 不开启性能记录时不读时钟，也不写日志。每个计时器只用于一轮构建。 */
export function createBuildTimer(enabled: boolean) {
  const started = enabled ? performance.now() : 0
  let previous = started
  const timingsMs: Record<string, number> = {}
  const snapshot = () => ({ ...timingsMs, total: enabled ? performance.now() - started : 0 })
  return {
    mark(name: string) {
      if (!enabled) return
      const now = performance.now()
      timingsMs[name] = now - previous
      previous = now
    },
    snapshot,
    report(details: Record<string, unknown>, write: (...values: unknown[]) => void) {
      if (enabled)
        write(
          '[pipeline-profile]',
          JSON.stringify({
            kind: 'gsts-pipeline-profile',
            version: 1,
            lua: { phase: 'build', ...details, timingsMs: snapshot() }
          })
        )
    },
    prepared(dependencies: number) {
      if (enabled)
        console.log(
          '[pipeline-profile]',
          JSON.stringify({
            kind: 'gsts-pipeline-profile',
            version: 1,
            lua: { phase: 'prepared', dependencies }
          })
        )
    }
  }
}
export type BuildTimer = ReturnType<typeof createBuildTimer>
