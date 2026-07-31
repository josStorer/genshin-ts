export type { GstsConfig } from './compiler/gsts_config.js'

export type {
  ClientEntity,
  ClientEntityFor,
  clientEntity
} from './definitions/client_entity_helpers.js'

export { compileTsToGs, compileTsToGsFromConfig } from './compiler/ts_to_gs_pipeline.js'

export {
  emitIrJsonForEntries,
  hasEntryMarker,
  resolveIrOutputPath
} from './compiler/gs_to_ir_json_transform/index.js'

export {
  resolveGiaOutputPath,
  writeGiaFromIrJsonFile,
  writeGiaFromIrJsonFiles
} from './compiler/ir_to_gia_pipeline.js'

export { createInjector, injectGilBytes, injectGilFile } from './injector/index.js'

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
  Injector,
  ParsedGilPayload
} from './injector/index.js'

export * from './definitions/prefabs.js'
