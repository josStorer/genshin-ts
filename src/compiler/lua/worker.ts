import { parentPort } from 'node:worker_threads'

import {
  compileLua,
  createLuaCompileCache,
  formatLuaDiagnostics,
  type LuaBuildOptions
} from './build.js'

const port = parentPort!
const cache = createLuaCompileCache()
port.on('message', (input: LuaBuildOptions) => {
  try {
    const { diagnostics, ...result } = compileLua(input, cache, (dependencies) => {
      port.postMessage({ kind: 'prepared', dependencies })
    })
    port.postMessage({
      kind: 'result',
      result: {
        ...result,
        diagnosticsText: formatLuaDiagnostics(diagnostics),
        hasErrors: diagnostics.some((d) => d.category === 1)
      }
    })
  } catch (error) {
    port.postMessage({
      kind: 'error',
      message: error instanceof Error ? error.message : String(error)
    })
  }
})
