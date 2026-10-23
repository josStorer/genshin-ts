import { parentPort } from 'node:worker_threads'

import ts from 'typescript'

import {
  compileLua,
  createLuaCompileCache,
  formatLuaDiagnostics,
  type LuaBuildOptions
} from '../ts_to_lua_pipeline.js'

const port = parentPort!
const cache = createLuaCompileCache()
port.on('message', (input: LuaBuildOptions) => {
  try {
    const { diagnostics, ...result } = compileLua(input, cache, (prepared) => {
      port.postMessage({ kind: 'prepared', prepared })
    })
    port.postMessage({
      kind: 'result',
      result: {
        ...result,
        diagnosticsText: formatLuaDiagnostics(diagnostics),
        hasErrors: diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error)
      }
    })
  } catch (error) {
    port.postMessage({
      kind: 'error',
      message: error instanceof Error ? error.message : String(error)
    })
  }
})
