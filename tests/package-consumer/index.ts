import {
  createInjector,
  type InjectGilBatchInput,
  type InjectGilBatchItemResult,
  type InjectGilBatchResult
} from 'genshin-ts'

const injector = createInjector()
const input: InjectGilBatchInput = {
  gilBytes: new Uint8Array(),
  items: []
}
const runBatch: (value: InjectGilBatchInput) => InjectGilBatchResult = injector.injectManyBytes

function readStatus(item: InjectGilBatchItemResult) {
  return item.status
}

void input
void runBatch
void readStatus
