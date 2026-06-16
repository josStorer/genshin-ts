import fs from 'node:fs'
import path from 'node:path'

import { detectLang, initCliI18n } from '../i18n/index.js'
import { applyReplacement, buildFile, parseMessage, readUint32BE } from './binary.js'
import {
  collectFolderIndexes,
  findFolderEntryField,
  resolveGraphTypeForTypeValue
} from './folder.js'
import {
  buildGraphTypeMap,
  extractGraphType,
  findNodeGraphTargets,
  getGraphId,
  loadGiaGraph,
  setGraphId,
  setGraphType
} from './node_graph.js'
import { loadGiaProto } from './proto.js'
import { patchSignalNodeIds } from './signal_nodes.js'
import type {
  InjectGilFileOptions,
  InjectGilFileResult,
  InjectGilInput,
  InjectGilResult,
  LenField
} from './types.js'

export type Injector = {
  injectBytes: (input: InjectGilInput) => InjectGilResult
  injectFile: (options: InjectGilFileOptions) => InjectGilFileResult
}

export type { InjectGilFileOptions, InjectGilFileResult, InjectGilInput, InjectGilResult }

function fmtGraphType(
  type: number | undefined,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
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

export function createInjector(options?: { protoPath?: string; lang?: string }): Injector {
  const proto = loadGiaProto(options?.protoPath)

  function injectBytes(input: InjectGilInput): InjectGilResult {
    const { t } = initCliI18n(detectLang(input.lang ?? options?.lang))
    const newGraph = loadGiaGraph(
      input.giaBytes,
      proto.rootMessage,
      proto.nodeGraphMessage,
      input.targetId
    )
    const inferredId = getGraphId(newGraph)
    const targetId = input.targetId ?? inferredId
    if (typeof targetId !== 'number' || !Number.isFinite(targetId)) {
      throw new Error('[error] target id is required (missing in both options and GIA)')
    }

    const header = {
      leftSize: readUint32BE(input.gilBytes, 0),
      schema: readUint32BE(input.gilBytes, 4),
      headTag: readUint32BE(input.gilBytes, 8),
      fileType: readUint32BE(input.gilBytes, 12),
      protoSize: readUint32BE(input.gilBytes, 16),
      tailTag: readUint32BE(input.gilBytes, input.gilBytes.length - 4)
    }

    if (header.headTag !== 0x0326 || header.tailTag !== 0x0679) {
      throw new Error('[error] invalid gil header tags')
    }

    const payload = input.gilBytes.slice(20, -4)
    const fields: LenField[] = []
    const nodeGraphBlobFields: LenField[] = []
    parseMessage(payload, 0, payload.length, 0, 0, 0, 0, 0, 0, 0, fields, { nodeGraphBlobFields })
    const signalFields = fields.filter(function (f) {
      return f.depth === 3 && f.p0 === 10 && f.p1 === 2 && f.p2 === 1 && f.field === 1
    })
    patchSignalNodeIds(newGraph, input.gilBytes, { payload, fields: signalFields }, t)
    const matches = findNodeGraphTargets(
      payload,
      nodeGraphBlobFields.length ? nodeGraphBlobFields : fields,
      proto.nodeGraphMessage,
      targetId
    )

    if (matches.length === 1) {
      const target = matches[0]
      if (
        targetId >= 1000000000 &&
        !(
          target.field.depth >= 3 &&
          target.field.p0 === 10 &&
          target.field.p1 === 1 &&
          target.field.p2 === 1
        )
      ) {
        throw new Error('[error] target NodeGraph path is unexpected')
      }

      const folderIndexesBefore = collectFolderIndexes(payload, fields)
      const idToTypeBefore = buildGraphTypeMap(
        payload,
        nodeGraphBlobFields.length ? nodeGraphBlobFields : fields,
        proto.nodeGraphMessage
      )
      const entryFieldBefore = findFolderEntryField(payload, fields, targetId)
      if (!entryFieldBefore) {
        throw new Error('[error] target id not found in folder index')
      }
      const graphType = resolveGraphTypeForTypeValue(
        entryFieldBefore.entry.typeValue,
        folderIndexesBefore,
        idToTypeBefore
      )
      const existingType = extractGraphType(target.obj)
      if (existingType !== undefined && existingType !== graphType) {
        console.warn(
          t('injector_targetTypeMismatch', {
            id: targetId,
            current: fmtGraphType(existingType, t),
            expected: fmtGraphType(graphType, t)
          })
        )
      }
      const incomingType = extractGraphType(newGraph)
      if (incomingType !== undefined && incomingType !== graphType) {
        console.warn(
          t('injector_incomingTypeMismatch', {
            id: targetId,
            current: fmtGraphType(incomingType, t),
            expected: fmtGraphType(graphType, t)
          })
        )
      }

      if (!input.skipNonEmptyCheck) {
        const targetNodes = (target.obj as { nodes?: unknown }).nodes
        const nodeCount = Array.isArray(targetNodes) ? targetNodes.length : 0
        if (nodeCount > 0) {
          const targetName = (target.obj as { name?: unknown }).name
          if (typeof targetName !== 'string' || !targetName.startsWith('_GSTS')) {
            throw new Error(
              `[error] target NodeGraph not empty and name not _GSTS*: ${String(targetName)}`
            )
          }
        }
      }

      const name = (newGraph as { name?: unknown }).name
      if (typeof name === 'string' && name.length) {
        ;(target.obj as { name?: string }).name = name
      }
      setGraphId(newGraph, targetId)
      setGraphType(newGraph, graphType)

      const verified = proto.nodeGraphMessage.verify(newGraph as unknown as Record<string, unknown>)
      if (verified) {
        throw new Error(`[error] updated NodeGraph invalid: ${verified}`)
      }

      // 性能：newGraph 多数情况下已经是 protobufjs Message（来自 decode），直接 encode 避免 fromObject 的大开销
      const newGraphBytes = proto.nodeGraphMessage.encode(newGraph as never).finish()

      const newPayload = applyReplacement(payload, fields, target.field, newGraphBytes)
      const newFile = buildFile(newPayload, {
        schema: header.schema,
        headTag: header.headTag,
        fileType: header.fileType,
        tailTag: header.tailTag
      })

      return { bytes: newFile, mode: 'replace' }
    }

    if (matches.length > 1) {
      throw new Error('[error] multiple NodeGraph targets found; aborting to avoid corruption')
    }
    throw new Error(`[error] target NodeGraph not found: ${targetId}`)
  }

  function injectFile(options: InjectGilFileOptions): InjectGilFileResult {
    const gilBytes = new Uint8Array(fs.readFileSync(options.gilPath))
    const giaBytes = new Uint8Array(fs.readFileSync(options.giaPath))
    const result = injectBytes({
      gilBytes,
      giaBytes,
      targetId: options.targetId,
      skipNonEmptyCheck: options.skipNonEmptyCheck,
      lang: options.lang
    })
    const outPath = options.outPath ?? options.gilPath
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    // 性能：result.bytes 可能已经是 Buffer（Buffer 也是 Uint8Array），直接写避免二次拷贝
    fs.writeFileSync(outPath, result.bytes)
    return { ...result, outPath }
  }

  return { injectBytes, injectFile }
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
