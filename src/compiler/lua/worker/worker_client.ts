import fs from 'node:fs'
import { URL } from 'node:url'
import { Worker } from 'node:worker_threads'

import { getCliLanguage, t } from '../../../i18n/index.js'
import type { LuaBuildOptions, LuaBuildResult, LuaPrepared } from '../ts_to_lua_pipeline.js'

export type LuaWorkerResult = Omit<LuaBuildResult, 'diagnostics'> & {
  diagnosticsText: string
  hasErrors: boolean
}
type Reply =
  | { kind: 'prepared'; prepared: LuaPrepared }
  | { kind: 'result'; result: LuaWorkerResult }
  | { kind: 'error'; message: string }

/** dev 期间保留一个 Lua 编译线程；空闲时不阻止命令退出。 */
export function createLuaWorker() {
  let worker: Worker | undefined
  let pending:
    | {
        resolve: (result: LuaWorkerResult) => void
        reject: (error: Error) => void
        onPrepared?: (prepared: LuaPrepared) => void
      }
    | undefined
  const fail = (error: Error) => {
    pending?.reject(error)
    pending = undefined
  }
  return {
    compile(input: LuaBuildOptions, onPrepared?: (prepared: LuaPrepared) => void) {
      if (pending) return Promise.reject(new Error(t('lua_workerBusy')))
      if (!worker) {
        let url = new URL('./worker.js', import.meta.url)
        // 仓库测试从 TS 源码导入时仍运行正式构建的 worker。
        if (!fs.existsSync(url))
          url = new URL('../../../../dist/src/compiler/lua/worker/worker.js', import.meta.url)
        const current = new Worker(url)
        worker = current
        current.on('message', (message: Reply) => {
          if (worker !== current || !pending) return
          if (message.kind === 'prepared') {
            pending.onPrepared?.(message.prepared)
            return
          }
          if (message.kind === 'result') pending.resolve(message.result)
          else pending.reject(new Error(message.message))
          pending = undefined
          current.unref()
        })
        current.on('error', (error) => {
          if (worker === current) {
            worker = undefined
            fail(error)
            void current.terminate()
          }
        })
        current.on('exit', (code) => {
          if (worker !== current) return
          fail(new Error(t('lua_workerExited', { arg0: code })))
          worker = undefined
        })
      }
      worker.ref()
      return new Promise<LuaWorkerResult>((resolve, reject) => {
        pending = { resolve, reject, onPrepared }
        try {
          worker!.postMessage({ ...input, lang: input.lang ?? getCliLanguage() })
        } catch (error) {
          fail(error instanceof Error ? error : new Error(String(error)))
          worker!.unref()
        }
      })
    },
    async close() {
      const current = worker
      worker = undefined
      fail(new Error(t('lua_cancelled')))
      if (current) await current.terminate()
    }
  }
}
export type LuaWorker = ReturnType<typeof createLuaWorker>
