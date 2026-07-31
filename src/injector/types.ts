export type LenField = {
  field: number
  depth: number
  p0: number
  p1: number
  p2: number
  p3: number
  p4: number
  p5: number
  lenOffset: number
  lenSize: number
  dataStart: number
  dataEnd: number
}

export type Patch = {
  start: number
  end: number
  replacement: Uint8Array
}

export type FieldReplacement = {
  field: LenField
  data: Uint8Array
}

export type ParsedGilPayload = {
  payload: Uint8Array
  fields: LenField[]
}

export type FolderEntry = { typeValue?: number; id?: number }
export type FolderMetaList = { name?: string; entries: FolderEntry[] }
export type FolderIndex = {
  entryField: LenField
  folderId?: number
  contentField?: LenField
  contentName?: string
  contentEntries: FolderEntry[]
  metaLists: Array<{ field: LenField; list: FolderMetaList }>
}

export type InjectGilInput = {
  gilBytes: Uint8Array
  giaBytes: Uint8Array
  targetId?: number
  skipNonEmptyCheck?: boolean
  /**
   * i18n language for warnings/errors (e.g. 'zh-CN' | 'en-US' | 'auto')
   */
  lang?: string
}

export type InjectGilResult = {
  bytes: Uint8Array
  mode: 'replace'
}

export type InjectGilBatchItem = {
  giaBytes: Uint8Array
  targetId?: number
}

export type InjectGilBatchItemTimings = {
  decodeGiaMs: number
  patchSignalIdsMs: number
  validateTargetMs: number
  encodeGraphMs: number
  totalMs: number
}

export type InjectGilBatchSkipReason = 'target-not-found' | 'unsafe-target' | 'client-type-mismatch'

export type InjectGilBatchItemResult =
  | {
      status: 'ok'
      targetId: number
      timings: InjectGilBatchItemTimings
    }
  | {
      status: 'skipped'
      targetId: number
      reason: InjectGilBatchSkipReason
      message: string
      /** Original thrown value. Non-enumerable at runtime so batch results remain JSON-serializable. */
      cause: unknown
      timings: InjectGilBatchItemTimings
    }
  | {
      status: 'failed'
      targetId?: number
      error: string
      /** Original thrown value. Non-enumerable at runtime so batch results remain JSON-serializable. */
      cause: unknown
      timings: InjectGilBatchItemTimings
    }

export type InjectGilBatchTimings = {
  parseGilMs: number
  indexNodeGraphsMs: number
  buildSignalMapMs: number
  prepareItemsMs: number
  applyReplacementsMs: number
  buildFileMs: number
  totalMs: number
}

export type InjectGilBatchInput = {
  gilBytes: Uint8Array
  items: InjectGilBatchItem[]
  skipNonEmptyCheck?: boolean
  /**
   * i18n language for warnings/errors (e.g. 'zh-CN' | 'en-US' | 'auto')
   */
  lang?: string
}

/**
 * Best-effort batch result.
 *
 * Every item is processed in input order. An item-level `failed` or `skipped` result does not
 * roll back other `ok` items: `bytes` contains all successful replacements. Batch-global GIL
 * parse/index errors still throw instead of returning this result.
 *
 * When multiple successful items target the same NodeGraph, the last one wins. Those items are
 * all reported as `ok`, while `stats.replacementCount` counts distinct replaced target fields.
 */
export type InjectGilBatchResult = {
  bytes: Uint8Array
  mode: 'replace'
  items: InjectGilBatchItemResult[]
  parsed: ParsedGilPayload
  timings: InjectGilBatchTimings
  stats: {
    inputBytes: number
    outputBytes: number
    fieldCount: number
    nodeGraphFieldCount: number
    signalFieldCount: number
    /** Number of distinct target fields present in `bytes`, not the number of `ok` items. */
    replacementCount: number
  }
}

export type InjectGilFileOptions = {
  gilPath: string
  giaPath: string
  targetId?: number
  skipNonEmptyCheck?: boolean
  outPath?: string
  protoPath?: string
  /**
   * i18n language for warnings/errors (e.g. 'zh-CN' | 'en-US' | 'auto')
   */
  lang?: string
}

export type InjectGilFileResult = InjectGilResult & {
  outPath: string
}
