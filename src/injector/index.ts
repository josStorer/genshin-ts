import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import { detectLang, initCliI18n } from '../i18n/index.js'
import { applyReplacements, buildFile, parseMessage, readUint32BE } from './binary.js'
import {
  collectFolderIndexes,
  findFolderEntryField,
  resolveGraphTypeForTypeValue
} from './folder.js'
import {
  buildGraphTypeMap,
  buildNodeGraphFieldIndex,
  extractGraphType,
  getGraphId,
  isClientGraphType,
  isNodeGraphEmptyForInjection,
  loadGiaGraph,
  setGraphId,
  setGraphType,
  type NodeGraphObj
} from './node_graph.js'
import { loadGiaProto } from './proto.js'
import {
  buildSignalNodeIdMapFromFields,
  hasSignalNodePlaceholders,
  patchSignalNodeIdsFromMap,
  type SignalNodeIdMap,
  type SignalPatchGraph
} from './signal_nodes.js'
import type {
  InjectGilBatchInput,
  InjectGilBatchItemTimings,
  InjectGilBatchResult,
  InjectGilBatchSkipReason,
  InjectGilFileOptions,
  InjectGilFileResult,
  InjectGilInput,
  InjectGilResult,
  LenField
} from './types.js'

export type Injector = {
  injectBytes: (input: InjectGilInput) => InjectGilResult
  injectManyBytes: (input: InjectGilBatchInput) => InjectGilBatchResult
  injectFile: (options: InjectGilFileOptions) => InjectGilFileResult
}

export type {
  InjectGilBatchInput,
  InjectGilBatchItem,
  InjectGilBatchItemResult,
  InjectGilBatchItemTimings,
  InjectGilBatchResult,
  InjectGilBatchSkipReason,
  InjectGilBatchTimings,
  InjectGilFileOptions,
  InjectGilFileResult,
  InjectGilInput,
  InjectGilResult,
  ParsedGilPayload
} from './types.js'

type TFunc = (key: string, options?: Record<string, unknown>) => string

type TargetState = {
  field: LenField
  obj: NodeGraphObj
}

function fmtGraphType(type: number | undefined, t: TFunc): string {
  if (typeof type !== 'number') return t('graphType_unknown')
  let name: string
  switch (type) {
    case 20000:
      name = t('graphType_entity')
      break
    case 20003:
      name = t('graphType_status')
      break
    case 20004:
      name = t('graphType_class')
      break
    case 20005:
      name = t('graphType_item')
      break
    default:
      name = t('graphType_unknown')
      break
  }
  return `${name}(${type})`
}

function emptyItemTimings(): InjectGilBatchItemTimings {
  return {
    decodeGiaMs: 0,
    patchSignalIdsMs: 0,
    validateTargetMs: 0,
    encodeGraphMs: 0,
    totalMs: 0
  }
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

const skippedInjectionReasons = new WeakMap<Error, InjectGilBatchSkipReason>()

function skippedInjectionError(reason: InjectGilBatchSkipReason, message: string): Error {
  const error = new Error(message)
  skippedInjectionReasons.set(error, reason)
  return error
}

function resultWithCause<T extends object>(result: T, cause: unknown): T & { cause: unknown } {
  return Object.defineProperty(result, 'cause', {
    value: cause,
    enumerable: false
  }) as T & { cause: unknown }
}

export function createInjector(options?: { protoPath?: string; lang?: string }): Injector {
  const proto = loadGiaProto(options?.protoPath)

  function injectManyBytes(input: InjectGilBatchInput): InjectGilBatchResult {
    const totalStart = performance.now()
    const { t } = initCliI18n(detectLang(input.lang ?? options?.lang))

    if (input.gilBytes.length < 24) {
      throw new Error('[error] invalid gil size')
    }
    const header = {
      schema: readUint32BE(input.gilBytes, 4),
      headTag: readUint32BE(input.gilBytes, 8),
      fileType: readUint32BE(input.gilBytes, 12),
      tailTag: readUint32BE(input.gilBytes, input.gilBytes.length - 4)
    }
    if (header.headTag !== 0x0326 || header.tailTag !== 0x0679) {
      throw new Error('[error] invalid gil header tags')
    }

    const parseStart = performance.now()
    const payload = input.gilBytes.subarray(20, input.gilBytes.length - 4)
    const fields: LenField[] = []
    const nodeGraphBlobFields: LenField[] = []
    parseMessage(payload, 0, payload.length, 0, 0, 0, 0, 0, 0, 0, fields, {
      nodeGraphBlobFields
    })
    const signalFields = fields.filter(
      (field) =>
        field.depth === 3 &&
        field.p0 === 10 &&
        field.p1 === 2 &&
        field.p2 === 1 &&
        field.field === 1
    )
    const parseGilMs = performance.now() - parseStart

    const indexedNodeGraphFields = nodeGraphBlobFields.length ? nodeGraphBlobFields : fields
    const indexStart = performance.now()
    const nodeGraphIndex = buildNodeGraphFieldIndex(payload, indexedNodeGraphFields)
    const indexNodeGraphsMs = performance.now() - indexStart

    const targetStates = new Map<number, TargetState>()
    const replacementByField = new Map<LenField, Uint8Array>()
    let folderIndexes: ReturnType<typeof collectFolderIndexes> | undefined
    let graphTypeMap: Map<number, number> | undefined
    let signalMap: SignalNodeIdMap | undefined
    let signalMapError: unknown
    let signalMapFailed = false
    let buildSignalMapMs = 0

    const getTargetState = (targetId: number): TargetState => {
      const cached = targetStates.get(targetId)
      if (cached) return cached

      const matches = nodeGraphIndex.get(targetId) ?? []
      if (matches.length > 1) {
        throw new Error('[error] multiple NodeGraph targets found; aborting to avoid corruption')
      }
      const match = matches[0]
      if (!match) {
        throw skippedInjectionError(
          'target-not-found',
          `[error] target NodeGraph not found: ${targetId}`
        )
      }
      if (
        targetId >= 1000000000 &&
        !(
          match.field.depth >= 3 &&
          match.field.p0 === 10 &&
          match.field.p1 === 1 &&
          match.field.p2 === 1
        )
      ) {
        throw new Error('[error] target NodeGraph path is unexpected')
      }

      const obj = proto.nodeGraphMessage.decode(
        payload.subarray(match.field.dataStart, match.field.dataEnd)
      ) as unknown as NodeGraphObj
      const state = { field: match.field, obj }
      targetStates.set(targetId, state)
      return state
    }

    const resolveGraphType = (targetId: number, target: NodeGraphObj): number => {
      const existingType = extractGraphType(target)
      if (existingType !== undefined) return existingType

      folderIndexes ??= collectFolderIndexes(payload, fields)
      graphTypeMap ??= buildGraphTypeMap(payload, indexedNodeGraphFields, proto.nodeGraphMessage)
      const entryField = findFolderEntryField(payload, fields, targetId)
      if (!entryField) {
        throw new Error('[error] target id not found in folder index')
      }
      return resolveGraphTypeForTypeValue(entryField.entry.typeValue, folderIndexes, graphTypeMap)
    }

    const prepareStart = performance.now()
    const itemResults: InjectGilBatchResult['items'] = []
    for (const item of input.items) {
      const itemStart = performance.now()
      const timings = emptyItemTimings()
      let targetId = item.targetId

      try {
        const decodeStart = performance.now()
        const newGraph = loadGiaGraph(
          item.giaBytes,
          proto.rootMessage,
          proto.nodeGraphMessage,
          item.targetId
        )
        timings.decodeGiaMs = performance.now() - decodeStart

        targetId = item.targetId ?? getGraphId(newGraph)
        if (typeof targetId !== 'number' || !Number.isFinite(targetId)) {
          throw new Error('[error] target id is required (missing in both options and GIA)')
        }

        const targetLookupStart = performance.now()
        const targetState = getTargetState(targetId)
        if (!input.skipNonEmptyCheck && !isNodeGraphEmptyForInjection(targetState.obj)) {
          const targetName = (targetState.obj as { name?: unknown }).name
          if (typeof targetName !== 'string' || !targetName.startsWith('_GSTS')) {
            throw skippedInjectionError(
              'unsafe-target',
              `[error] target NodeGraph not empty and name not _GSTS*: ${String(targetName)}`
            )
          }
        }
        timings.validateTargetMs = performance.now() - targetLookupStart

        const signalGraph = newGraph as SignalPatchGraph
        if (hasSignalNodePlaceholders(signalGraph)) {
          if (!signalMap && !signalMapFailed) {
            const signalMapStart = performance.now()
            try {
              signalMap = buildSignalNodeIdMapFromFields(payload, signalFields, t)
            } catch (error) {
              signalMapError = error
              signalMapFailed = true
            } finally {
              buildSignalMapMs += performance.now() - signalMapStart
            }
          }
          if (signalMapFailed) throw signalMapError

          const patchSignalStart = performance.now()
          patchSignalNodeIdsFromMap(signalGraph, signalMap!, t)
          timings.patchSignalIdsMs = performance.now() - patchSignalStart
        }

        const validateStart = performance.now()
        const graphType = resolveGraphType(targetId, targetState.obj)
        const incomingType = extractGraphType(newGraph)
        const hasClientGraphType = isClientGraphType(graphType) || isClientGraphType(incomingType)
        if (hasClientGraphType && incomingType !== graphType) {
          throw skippedInjectionError(
            'client-type-mismatch',
            t('injector_clientTypeMismatch', {
              id: targetId,
              current: incomingType ?? t('graphType_unknown'),
              expected: graphType
            })
          )
        }
        if (!hasClientGraphType && incomingType !== undefined && incomingType !== graphType) {
          console.warn(
            t('injector_incomingTypeMismatch', {
              id: targetId,
              current: fmtGraphType(incomingType, t),
              expected: fmtGraphType(graphType, t)
            })
          )
        }

        setGraphId(newGraph, targetId)
        setGraphType(newGraph, graphType)
        const verified = proto.nodeGraphMessage.verify(
          newGraph as unknown as Record<string, unknown>
        )
        if (verified) {
          throw new Error(`[error] updated NodeGraph invalid: ${verified}`)
        }
        timings.validateTargetMs += performance.now() - validateStart

        const encodeStart = performance.now()
        const newGraphBytes = proto.nodeGraphMessage.encode(newGraph as never).finish()
        timings.encodeGraphMs = performance.now() - encodeStart

        replacementByField.set(targetState.field, newGraphBytes)
        targetState.obj = newGraph
        timings.totalMs = performance.now() - itemStart
        itemResults.push({ status: 'ok', targetId, timings })
      } catch (error) {
        timings.totalMs = performance.now() - itemStart
        const skipReason = error instanceof Error ? skippedInjectionReasons.get(error) : undefined
        itemResults.push(
          skipReason && typeof targetId === 'number'
            ? resultWithCause(
                {
                  status: 'skipped',
                  targetId,
                  reason: skipReason,
                  message: errorText(error),
                  timings
                },
                error
              )
            : resultWithCause(
                {
                  status: 'failed',
                  targetId,
                  error: errorText(error),
                  timings
                },
                error
              )
        )
      }
    }
    const prepareItemsMs = performance.now() - prepareStart

    const applyStart = performance.now()
    const newPayload = applyReplacements(
      payload,
      fields,
      [...replacementByField].map(([field, data]) => ({ field, data }))
    )
    const applyReplacementsMs = performance.now() - applyStart

    const buildStart = performance.now()
    const bytes = replacementByField.size > 0 ? buildFile(newPayload, header) : input.gilBytes
    const buildFileMs = performance.now() - buildStart
    const totalMs = performance.now() - totalStart

    return {
      bytes,
      mode: 'replace',
      items: itemResults,
      parsed: { payload, fields },
      timings: {
        parseGilMs,
        indexNodeGraphsMs,
        buildSignalMapMs,
        prepareItemsMs,
        applyReplacementsMs,
        buildFileMs,
        totalMs
      },
      stats: {
        inputBytes: input.gilBytes.length,
        outputBytes: bytes.length,
        fieldCount: fields.length,
        nodeGraphFieldCount: [...nodeGraphIndex.values()].reduce(
          (count, matches) => count + matches.length,
          0
        ),
        signalFieldCount: signalFields.length,
        replacementCount: replacementByField.size
      }
    }
  }

  function injectBytes(input: InjectGilInput): InjectGilResult {
    const result = injectManyBytes({
      gilBytes: input.gilBytes,
      items: [{ giaBytes: input.giaBytes, targetId: input.targetId }],
      skipNonEmptyCheck: input.skipNonEmptyCheck,
      lang: input.lang
    })
    const item = result.items[0]
    if (!item) {
      throw new Error('[error] missing injection item')
    }
    if (item.status !== 'ok') throw item.cause
    return { bytes: result.bytes, mode: result.mode }
  }

  function injectFile(options: InjectGilFileOptions): InjectGilFileResult {
    const result = injectBytes({
      gilBytes: fs.readFileSync(options.gilPath),
      giaBytes: fs.readFileSync(options.giaPath),
      targetId: options.targetId,
      skipNonEmptyCheck: options.skipNonEmptyCheck,
      lang: options.lang
    })
    const outPath = options.outPath ?? options.gilPath
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, result.bytes)
    return { ...result, outPath }
  }

  return { injectBytes, injectManyBytes, injectFile }
}

export function injectGilBytes(
  input: InjectGilInput,
  options?: { protoPath?: string }
): InjectGilResult {
  return createInjector(options).injectBytes(input)
}

export function injectGilFile(options: InjectGilFileOptions): InjectGilFileResult {
  return createInjector({ protoPath: options.protoPath }).injectFile(options)
}
