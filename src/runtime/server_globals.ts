import z from 'zod'

import {
  installEntityHelpers,
  type PlayerEntity,
  type StageEntity
} from '../definitions/entity_helpers.js'
import { EntityType, RoundingMode } from '../definitions/enum.js'
import { DataTypeConversionMap, parseValue } from '../definitions/nodes.js'
import type { MetaCallRegistry } from './core.js'
import {
  bool,
  BoolValue,
  configId,
  ConfigIdValue,
  dict,
  DictKeyType,
  dictLiteral,
  DictValueType,
  entity,
  entityLiteral,
  EntityValue,
  faction,
  FactionValue,
  float,
  FloatValue,
  generic,
  guid,
  GuidValue,
  int,
  IntValue,
  list as listClass,
  listLiteral,
  prefabId,
  PrefabIdValue,
  ReadonlyDict,
  RuntimeParameterValueTypeMap,
  RuntimeReturnValueTypeMap,
  str,
  StrValue,
  vec3,
  Vec3Value
} from './value.js'

type ConvertibleFrom = 'bool' | 'entity' | 'faction' | 'float' | 'guid' | 'int' | 'vec3'
type ConvertibleTo = 'bool' | 'int' | 'str' | 'float'

type ConvertToReturnTypeMap = {
  bool: boolean
  int: bigint
  str: string
  float: number
}

type TimerKind = 'timeout' | 'interval'
type TimerCaptureSpec = {
  name: string
  dictVar: string
  valueType: DictValueType
  value: unknown
}
type TimerCaptureDictMeta = { name: string; valueType: DictValueType }
type TimerOptions = {
  __gstsTimer: true
  kind: TimerKind
  poolNames: string[]
  indexVar?: string
  captures: TimerCaptureSpec[]
  __gstsTimerDedupKey: string
}

const TIMER_CAPTURE_META_KEY = '__gstsTimerCaptureDicts'

function attachTimerCaptureMeta(timerName: StrValue, dicts: TimerCaptureDictMeta[]): string {
  const handle = typeof timerName === 'string' ? new str(timerName) : timerName
  ;(handle as unknown as Record<string, TimerCaptureDictMeta[]>)[TIMER_CAPTURE_META_KEY] = dicts
  return handle as unknown as string
}

function readTimerCaptureMeta(timerName: StrValue): TimerCaptureDictMeta[] | null {
  if (!timerName || typeof timerName !== 'object') return null
  const meta = (timerName as unknown as Record<string, unknown>)[TIMER_CAPTURE_META_KEY]
  return Array.isArray(meta) ? (meta as TimerCaptureDictMeta[]) : null
}

const CONVERT: Record<ConvertibleFrom, ReadonlySet<ConvertibleTo>> = {
  bool: new Set(['int', 'str']),
  entity: new Set(['str']),
  faction: new Set(['str']),
  float: new Set(['int', 'str']),
  guid: new Set(['str']),
  int: new Set(['bool', 'float', 'str']),
  vec3: new Set(['str'])
}

function inServerCtx(): boolean {
  const root = globalThis as unknown as { gsts?: { ctx?: { isServerCtx?: () => boolean } } }
  return !!root.gsts?.ctx?.isServerCtx?.()
}

function ensureServerCtx(fnName: string): void {
  if (!inServerCtx()) {
    throw new Error(`[error] ${fnName}: only available in g.server().on handler`)
  }
}

const BOOTSTRAP_STAGE_INIT: unique symbol = Symbol('gstsStageBootstrapInit')
const TIMER_HANDLER_REGISTRY = new WeakMap<MetaCallRegistry, Set<string>>()

function getRegistry(fnName: string): MetaCallRegistry {
  ensureServerCtx(fnName)
  const registry = (gsts.f as unknown as { registry: MetaCallRegistry }).registry
  return registry
}

function registerTimerHandlerOnce(f: unknown, opts: TimerOptions, handler: unknown): void {
  const registry = (f as { registry?: MetaCallRegistry }).registry
  if (!registry) {
    ;(f as { __gstsRegisterTimerHandler: (h: unknown) => void }).__gstsRegisterTimerHandler(
      handler as never
    )
    return
  }
  let set = TIMER_HANDLER_REGISTRY.get(registry)
  if (!set) {
    set = new Set<string>()
    TIMER_HANDLER_REGISTRY.set(registry, set)
  }
  const key = opts.__gstsTimerDedupKey
  if (set.has(key)) return
  set.add(key)
  ;(f as { __gstsRegisterTimerHandler: (h: unknown) => void }).__gstsRegisterTimerHandler(
    handler as never
  )
}

function ensureStageBootstrap(): void {
  const registry = getRegistry('stage')
  const holder = registry as unknown as { [BOOTSTRAP_STAGE_INIT]?: boolean }
  if (holder[BOOTSTRAP_STAGE_INIT]) return
  registry.withFlow(registry.ensureBootstrapFlow(), () => {
    const varName = '__gsts_stage'
    gsts.f.__gstsEnsureVariable(varName, 'entity')
    const listValue = gsts.f.getSpecifiedTypeOfEntitiesOnTheField(EntityType.Stage)
    const stageValue = gsts.f.getCorrespondingValueFromList(listValue, 0n)
    gsts.f.setNodeGraphVariable(varName, stageValue, false)
  })
  holder[BOOTSTRAP_STAGE_INIT] = true
}

function detectFromType(v: unknown): ConvertibleFrom | null {
  if (v instanceof bool || typeof v === 'boolean') return 'bool'
  if (v instanceof float || typeof v === 'number') return 'float'
  if (v instanceof int || typeof v === 'bigint') return 'int'
  if (v instanceof guid) return 'guid'
  if (v instanceof vec3) return 'vec3'
  if (v instanceof entity) return 'entity'
  if (v instanceof faction) return 'faction'

  if (Array.isArray(v) && v.length === 3 && v.every((item) => typeof item === 'number'))
    return 'vec3'
  return null
}

function convertIfNeeded<T extends keyof DataTypeConversionMap, U extends DataTypeConversionMap[T]>(
  input: RuntimeParameterValueTypeMap[T],
  type: U
): RuntimeReturnValueTypeMap[U] | null {
  const from = detectFromType(input)
  if (!from) return null
  if (!CONVERT[from].has(type)) return null
  return gsts.f.dataTypeConversion(input, type)
}

function asFloatValue(value: FloatValue | IntValue, name: string): FloatValue {
  ensureServerCtx(name)
  return (convertIfNeeded(value as never, 'float') ?? value) as FloatValue
}

function asIntValue(value: IntValue | FloatValue, name: string): IntValue {
  ensureServerCtx(name)
  return (convertIfNeeded(value as never, 'int') ?? value) as IntValue
}

function isIntLike(value: unknown): boolean {
  return value instanceof int || typeof value === 'bigint'
}

function isFloatLike(value: unknown): boolean {
  return value instanceof float || typeof value === 'number'
}

function isNullishPlaceholder(value: unknown): boolean {
  return value === null || value === 0
}

function makeConvertibleFactory<T extends ConvertibleTo>(
  type: T
): (v: unknown) => ConvertToReturnTypeMap[T] {
  return (v: unknown) => {
    if (!inServerCtx()) {
      try {
        const parsed = parseValue(v, type)
        if (parsed instanceof bool && parsed.value !== undefined) {
          return parsed.value as ConvertToReturnTypeMap[T]
        }
        if (parsed instanceof int && parsed.value !== undefined) {
          return parsed.value as ConvertToReturnTypeMap[T]
        }
        if (parsed instanceof float && parsed.value !== undefined) {
          return parsed.value as ConvertToReturnTypeMap[T]
        }
        if (parsed instanceof str && parsed.value !== undefined) {
          return parsed.value as ConvertToReturnTypeMap[T]
        }
      } catch {
        // fall through to error below
      }
      throw new Error(`[error] ${type}(): unsupported input type`)
    }
    let value: ConvertToReturnTypeMap[T] | null = null
    try {
      value = parseValue(v, type) as unknown as ConvertToReturnTypeMap[T]
    } catch {
      // @ts-ignore allow
      value = convertIfNeeded(v, type)
    }
    if (value == null) {
      throw new Error(`[error] ${type}(): unsupported input type`)
    }
    return value
  }
}

function makeBasicFactory<T extends keyof RuntimeReturnValueTypeMap>(
  type: T
): (v: unknown) => RuntimeReturnValueTypeMap[T] {
  return (v: unknown) => {
    try {
      // @ts-ignore allow
      return parseValue(v, type)
    } catch {
      throw new Error(`[error] ${type}(): unsupported input type`)
    }
  }
}

function ensureTimerOptions(kind: TimerKind, fnName: string, arg: unknown): TimerOptions {
  if (!arg || typeof arg !== 'object') {
    throw new Error(`[error] ${fnName}(): missing compiler metadata`)
  }
  const opts = arg as TimerOptions
  if (opts.__gstsTimer !== true || opts.kind !== kind) {
    throw new Error(`[error] ${fnName}(): invalid compiler metadata`)
  }
  if (!Array.isArray(opts.poolNames) || !opts.poolNames.length) {
    throw new Error(`[error] ${fnName}(): invalid timer pool`)
  }
  if (!opts.poolNames.every((n) => typeof n === 'string')) {
    throw new Error(`[error] ${fnName}(): invalid timer pool`)
  }
  if (opts.poolNames.length > 1) {
    if (typeof opts.indexVar !== 'string' || !opts.indexVar.length) {
      throw new Error(`[error] ${fnName}(): invalid timer index variable`)
    }
  }
  if (!Array.isArray(opts.captures)) {
    throw new Error(`[error] ${fnName}(): invalid timer captures`)
  }
  if (typeof opts.__gstsTimerDedupKey !== 'string' || !opts.__gstsTimerDedupKey.length) {
    throw new Error(`[error] ${fnName}(): missing timer dedup key`)
  }
  for (const cap of opts.captures) {
    if (!cap || typeof cap !== 'object') {
      throw new Error(`[error] ${fnName}(): invalid timer capture`)
    }
    if (typeof cap.name !== 'string' || typeof cap.dictVar !== 'string') {
      throw new Error(`[error] ${fnName}(): invalid timer capture`)
    }
    if (typeof cap.valueType !== 'string') {
      throw new Error(`[error] ${fnName}(): invalid timer capture type`)
    }
  }
  return opts
}

function scheduleTimer(
  kind: TimerKind,
  fnName: string,
  handler: unknown,
  delayMs: unknown,
  meta: unknown
): string {
  if (!inServerCtx()) {
    throw new Error(`[error] ${fnName}(): only available in g.server().on handler`)
  }
  if (typeof handler !== 'function') {
    throw new Error(`[error] ${fnName}(): callback must be a function`)
  }
  const opts = ensureTimerOptions(kind, fnName, meta)
  const f = gsts.f

  for (const cap of opts.captures) {
    f.__gstsRegisterTimerCaptureDict(cap.dictVar, cap.valueType)
  }

  let timerName: string
  let nextIdx: IntValue | null = null
  if (opts.poolNames.length <= 1) {
    timerName = opts.poolNames[0] ?? ''
  } else {
    const indexVar = opts.indexVar as string
    f.__gstsEnsureVariable(indexVar, 'int', { value: 0 })
    const poolList = f.assemblyList(opts.poolNames)
    const idx = f.getNodeGraphVariable(indexVar).asType('int')
    timerName = f.getCorrespondingValueFromList(poolList, idx)
    nextIdx = f.moduloOperation(f.addition(idx, 1n), f.getListLength(poolList))
  }

  const dicts = opts.captures.map((cap) => ({ name: cap.dictVar, valueType: cap.valueType }))
  timerName = attachTimerCaptureMeta(timerName, dicts)

  for (const cap of opts.captures) {
    const dictObj = f.getNodeGraphVariable(cap.dictVar).asDict('str', cap.valueType)
    f.setOrAddKeyValuePairsToDictionary(dictObj, timerName, cap.value as never)
  }

  const delayValue = delayMs ?? 0
  let delayObj: FloatValue
  try {
    delayObj = parseValue(delayValue, 'float') as FloatValue
  } catch {
    const converted = convertIfNeeded(delayValue as never, 'float')
    if (!converted) {
      throw new Error(`[error] ${fnName}(): unsupported delay type`)
    }
    delayObj = parseValue(converted, 'float') as FloatValue
  }
  const seconds = f.division(delayObj, 1000)
  const sequence = f.assemblyList([seconds])
  f.startTimer(f.getSelfEntity(), timerName, kind === 'interval', sequence)
  if (nextIdx) {
    f.setNodeGraphVariable(opts.indexVar as string, nextIdx, false)
  }

  registerTimerHandlerOnce(f, opts, handler)
  return timerName
}

export type ServerGlobalFactories = {
  raw: <T>(v: T) => T
  bool: (v: BoolValue | IntValue) => boolean
  int: (v: IntValue | BoolValue | FloatValue) => bigint
  idx: (v: IntValue) => number
  float: (v: FloatValue | IntValue) => number
  str: (
    v:
      | StrValue
      | BoolValue
      | IntValue
      | FloatValue
      | GuidValue
      | EntityValue
      | FactionValue
      | Vec3Value
  ) => string
  vec3: (v: Vec3Value) => vec3
  guid: (v: GuidValue) => guid
  prefabId: (v: PrefabIdValue) => prefabId
  configId: (v: ConfigIdValue) => configId
  faction: (v: FactionValue) => faction
  entity: (guidOrEntity: GuidValue | EntityValue | null) => entity
  dict: (<K extends DictKeyType, V extends DictValueType>(
    keyType: K,
    valueType: V,
    value: null | 0
  ) => ReadonlyDict<K, V>) &
    ((value: null | 0) => ReadonlyDict) &
    (<V extends DictValueType>(
      obj: Record<string, RuntimeParameterValueTypeMap[V]>
    ) => ReadonlyDict<'str', V>) &
    (<K extends DictKeyType, V extends DictValueType>(
      pairs: {
        k: RuntimeParameterValueTypeMap[K]
        v: RuntimeParameterValueTypeMap[V]
      }[]
    ) => ReadonlyDict<K, V>)
  list: <
    T extends
      | 'bool'
      | 'config_id'
      | 'entity'
      | 'faction'
      | 'float'
      | 'guid'
      | 'int'
      | 'prefab_id'
      | 'str'
      | 'vec3'
  >(
    type: T | null | 0,
    items?: RuntimeParameterValueTypeMap[T][] | null | 0
  ) => RuntimeReturnValueTypeMap[`${T}_list`]
  print: (string: StrValue) => void
  send: (signalName: StrValue) => void
  player: (playerId: IntValue) => PlayerEntity
  setTimeout: (handler: (evt: unknown, f: unknown) => void, delayMs?: FloatValue) => string
  setInterval: (handler: (evt: unknown, f: unknown) => void, delayMs?: FloatValue) => string
  clearTimeout: (timerName: StrValue) => void
  clearInterval: (timerName: StrValue) => void
}

function makeFactories(): ServerGlobalFactories {
  return {
    raw: (v) => v,
    bool: makeConvertibleFactory('bool'),
    int: makeConvertibleFactory('int'),
    idx: (v: IntValue) => v as unknown as number,
    float: makeConvertibleFactory('float'),
    str: makeConvertibleFactory('str'),
    vec3: makeBasicFactory('vec3'),
    guid: makeBasicFactory('guid'),
    prefabId: makeBasicFactory('prefab_id'),
    configId: makeBasicFactory('config_id'),
    faction: makeBasicFactory('faction'),
    entity: (guidOrEntity: GuidValue | EntityValue | null) => {
      if (guidOrEntity === undefined) {
        throw new Error('[error] entity(): use entity(0) or entity(null) for type-only declaration')
      }
      if (guidOrEntity === null) {
        return new entityLiteral(0)
      }
      if (guidOrEntity instanceof entity) return guidOrEntity
      const isGuidLiteral = typeof guidOrEntity === 'bigint' || typeof guidOrEntity === 'number'
      if (inServerCtx()) {
        if (isGuidLiteral && Number(guidOrEntity) === 0) {
          return new entityLiteral(guidOrEntity)
        }
        return gsts.f.queryEntityByGuid(guidOrEntity as guid)
      }
      if (isGuidLiteral) {
        return new entityLiteral(guidOrEntity)
      }
      throw new Error('[error] entity(): unsupported input type')
    },
    // @ts-ignore allow
    dict: (arg1: unknown, arg2?: unknown, arg3?: unknown) => {
      if (isNullishPlaceholder(arg1) && arg2 === undefined) {
        // Use an untyped literal placeholder to emit `null`
        const placeholder = new generic()
        placeholder.markLiteral()
        return placeholder as unknown as ReadonlyDict
      }
      if (typeof arg1 === 'string' && typeof arg2 === 'string') {
        if (!isNullishPlaceholder(arg3)) {
          throw new Error('[error] dict(): expected null/0 placeholder for typed empty dict')
        }
        const placeholder = new ReadonlyDict(arg1 as DictKeyType, arg2 as DictValueType)
        placeholder.markLiteral()
        return placeholder
      }
      if (arg1 instanceof dict) return arg1
      if (arg1 instanceof dictLiteral) return arg1 as unknown as ReadonlyDict
      if (Array.isArray(arg1)) {
        if (!inServerCtx()) return new dictLiteral(arg1 as never) as unknown as ReadonlyDict
        return gsts.f.assemblyDictionary(arg1 as never)
      }
      if (arg1 && typeof arg1 === 'object') {
        const obj = arg1 as Record<string, unknown>
        const keys = Object.keys(obj)
        if (keys.length === 0) throw new Error('[error] dict(): object cannot be empty')
        const pairs = keys.map((k) => ({ k, v: obj[k] }))
        if (!inServerCtx()) return new dictLiteral(pairs as never) as unknown as ReadonlyDict
        return gsts.f.assemblyDictionary(pairs as never)
      }
      throw new Error('[error] dict(): unsupported input type')
    },
    list: <
      T extends
        | 'bool'
        | 'config_id'
        | 'entity'
        | 'faction'
        | 'float'
        | 'guid'
        | 'int'
        | 'prefab_id'
        | 'str'
        | 'vec3'
    >(
      type: T | null | 0,
      items?: RuntimeParameterValueTypeMap[T][] | null | 0
    ) => {
      if (isNullishPlaceholder(type)) {
        // Use an untyped literal placeholder to emit `null`
        const placeholder = new generic()
        placeholder.markLiteral()
        return placeholder as unknown as RuntimeReturnValueTypeMap[`${T}_list`]
      }
      const listType = type as T
      if (isNullishPlaceholder(items)) {
        return new listLiteral(listType, null) as unknown as RuntimeReturnValueTypeMap[`${T}_list`]
      }
      if (!inServerCtx()) {
        if (items === undefined) {
          return new listLiteral(listType, []) as unknown as RuntimeReturnValueTypeMap[`${T}_list`]
        }
        if (z.instanceof(listClass).safeParse(items).success) {
          if ((items as unknown as listClass).getConcreteType() === listType) {
            return items as RuntimeReturnValueTypeMap[`${T}_list`]
          }
          throw new Error(`[error] list(): cannot convert list type`)
        }
        if (Array.isArray(items)) {
          return new listLiteral(
            listType,
            items as unknown as RuntimeReturnValueTypeMap[T][]
          ) as unknown as RuntimeReturnValueTypeMap[`${T}_list`]
        }
        throw new Error('[error] list(): unsupported input type')
      }
      if (items === undefined) {
        return gsts.f.initLocalVariable(
          // @ts-ignore allow
          `${listType}_list`
          // @ts-ignore allow
        ).value as RuntimeReturnValueTypeMap[`${T}_list`]
      }
      if (z.instanceof(listClass).safeParse(items).success) {
        if ((items as unknown as listClass).getConcreteType() === listType) {
          return items as RuntimeReturnValueTypeMap[`${T}_list`]
        }
        throw new Error(`[error] list(): cannot convert list type`)
      }
      if (Array.isArray(items) && items.length === 0) {
        // @ts-ignore allow
        return gsts.f.initLocalVariable(
          // @ts-ignore allow
          `${listType}_list`
          // @ts-ignore allow
        ).value as RuntimeReturnValueTypeMap[`${T}_list`]
      }
      // @ts-ignore allow
      return gsts.f.initLocalVariable(
        // @ts-ignore allow
        `${listType}_list`,
        // @ts-ignore allow
        gsts.f.assemblyList(items, listType)
        // @ts-ignore allow
      ).value as RuntimeReturnValueTypeMap[`${T}_list`]
    },
    print: (string: StrValue) => {
      ensureServerCtx('print')
      gsts.f.printString(string)
    },
    send: (signalName: StrValue) => {
      ensureServerCtx('send')
      gsts.f.sendSignal(signalName)
    },
    player: (playerId: IntValue) => {
      ensureServerCtx('player')
      const guidValue = gsts.f.getPlayerGuidByPlayerId(playerId)
      return gsts.f.queryEntityByGuid(guidValue) as PlayerEntity
    },
    setTimeout: (
      handler: (evt: unknown, f: unknown) => void,
      delayMs?: FloatValue,
      meta?: unknown
    ) => scheduleTimer('timeout', 'setTimeout', handler, delayMs, meta),
    setInterval: (
      handler: (evt: unknown, f: unknown) => void,
      delayMs?: FloatValue,
      meta?: unknown
    ) => scheduleTimer('interval', 'setInterval', handler, delayMs, meta),
    clearTimeout: (timerName: StrValue) => {
      if (!inServerCtx()) {
        throw new Error('[error] clearTimeout(): only available in g.server().on handler')
      }
      gsts.f.stopTimer(gsts.f.getSelfEntity(), timerName)
      const dicts = readTimerCaptureMeta(timerName)
      if (!dicts) {
        throw new Error('[error] clearTimeout(): invalid timer handle')
      }
      gsts.f.__gstsClearTimerCaptures(timerName, dicts)
    },
    clearInterval: (timerName: StrValue) => {
      if (!inServerCtx()) {
        throw new Error('[error] clearInterval(): only available in g.server().on handler')
      }
      gsts.f.stopTimer(gsts.f.getSelfEntity(), timerName)
      const dicts = readTimerCaptureMeta(timerName)
      if (!dicts) {
        throw new Error('[error] clearInterval(): invalid timer handle')
      }
      gsts.f.__gstsClearTimerCaptures(timerName, dicts)
    }
  }
}

const BASE_NAMES: (keyof ServerGlobalFactories)[] = [
  'raw',
  'bool',
  'int',
  'idx',
  'float',
  'str',
  'vec3',
  'guid',
  'prefabId',
  'configId',
  'faction',
  'entity',
  'dict',
  'list'
]

const SCOPED_NAMES: (keyof ServerGlobalFactories)[] = [
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'print',
  'send',
  'player'
]

function installGlobals(names: (keyof ServerGlobalFactories)[]): () => void {
  const factories = makeFactories()
  const root = globalThis as unknown as Record<string, unknown>
  const prev = new Map<string, { existed: boolean; value: unknown }>()
  const factoryMap = factories as unknown as Record<string, unknown>

  for (const k of names) {
    const name = String(k)
    prev.set(name, { existed: Object.prototype.hasOwnProperty.call(root, name), value: root[name] })
    root[name] = factoryMap[name]
  }

  return () => {
    for (const k of names) {
      const name = String(k)
      const old = prev.get(name)
      if (!old) continue
      if (!old.existed) {
        // restore to "not present"
        delete root[name]
        continue
      }
      root[name] = old.value
    }
  }
}

export function installServerGlobals(): () => void {
  installEntityHelpers()
  return installGlobals(BASE_NAMES)
}

export function installScopedServerGlobals(): () => void {
  const restoreGlobals = installGlobals(SCOPED_NAMES)
  const restoreAliases = installScopedAliases()
  return () => {
    restoreAliases()
    restoreGlobals()
  }
}

function installScopedAliases(): () => void {
  const root = globalThis as unknown as Record<string, unknown>
  const prevSelf = Object.getOwnPropertyDescriptor(root, 'self')
  const canDefineSelf = !prevSelf || prevSelf.configurable
  const prevStage = Object.getOwnPropertyDescriptor(root, 'stage')
  const prevLevel = Object.getOwnPropertyDescriptor(root, 'level')
  const canDefineStage = !prevStage || prevStage.configurable
  const canDefineLevel = !prevLevel || prevLevel.configurable
  const prevMathf = Object.getOwnPropertyDescriptor(root, 'Mathf')
  const canDefineMathf = !prevMathf || prevMathf.configurable
  const prevRandom = Object.getOwnPropertyDescriptor(root, 'Random')
  const canDefineRandom = !prevRandom || prevRandom.configurable
  const prevVector3 = Object.getOwnPropertyDescriptor(root, 'Vector3')
  const canDefineVector3 = !prevVector3 || prevVector3.configurable
  const prevGameObject = Object.getOwnPropertyDescriptor(root, 'GameObject')
  const canDefineGameObject = !prevGameObject || prevGameObject.configurable

  if (canDefineSelf) {
    Object.defineProperty(root, 'self', {
      configurable: true,
      enumerable: true,
      get: () => {
        ensureServerCtx('self')
        return gsts.f.getSelfEntity()
      }
    })
  }
  if (canDefineStage) {
    Object.defineProperty(root, 'stage', {
      configurable: true,
      enumerable: true,
      get: () => {
        ensureStageBootstrap()
        return gsts.f.getNodeGraphVariable('__gsts_stage').asType('entity') as StageEntity
      }
    })
  }
  if (canDefineLevel) {
    Object.defineProperty(root, 'level', {
      configurable: true,
      enumerable: true,
      get: () => {
        ensureStageBootstrap()
        return gsts.f.getNodeGraphVariable('__gsts_stage').asType('entity') as StageEntity
      }
    })
  }

  if (canDefineMathf) {
    Object.defineProperty(root, 'Mathf', {
      configurable: true,
      enumerable: true,
      value: {
        Abs: (value: FloatValue | IntValue) => {
          ensureServerCtx('Mathf.Abs')
          if (isIntLike(value)) {
            return gsts.f.absoluteValueOperation(value as IntValue)
          }
          const input = asFloatValue(value, 'Mathf.Abs')
          return gsts.f.absoluteValueOperation(input)
        },
        FloorToInt: (value: FloatValue | IntValue) => {
          const input = asFloatValue(value, 'Mathf.FloorToInt')
          return gsts.f.roundToIntegerOperation(input, RoundingMode.RoundDown)
        },
        CeilToInt: (value: FloatValue | IntValue) => {
          const input = asFloatValue(value, 'Mathf.CeilToInt')
          return gsts.f.roundToIntegerOperation(input, RoundingMode.RoundUp)
        },
        RoundToInt: (value: FloatValue | IntValue) => {
          const input = asFloatValue(value, 'Mathf.RoundToInt')
          return gsts.f.roundToIntegerOperation(input, RoundingMode.RoundToNearest)
        },
        Sqrt: (value: FloatValue | IntValue) => {
          const input = asFloatValue(value, 'Mathf.Sqrt')
          return gsts.f.arithmeticSquareRootOperation(input)
        },
        Pow: (base: FloatValue | IntValue, exponent: FloatValue | IntValue) => {
          ensureServerCtx('Mathf.Pow')
          return gsts.f.exponentiation(base as never, exponent as never)
        },
        Log: (value: FloatValue | IntValue, base?: FloatValue | IntValue) => {
          const input = asFloatValue(value, 'Mathf.Log')
          const baseValue = base === undefined ? 2.718281828459045 : asFloatValue(base, 'Mathf.Log')
          return gsts.f.logarithmOperation(input, baseValue)
        },
        Sin: (radian: FloatValue | IntValue) => {
          const input = asFloatValue(radian, 'Mathf.Sin')
          return gsts.f.sineFunction(input)
        },
        Cos: (radian: FloatValue | IntValue) => {
          const input = asFloatValue(radian, 'Mathf.Cos')
          return gsts.f.cosineFunction(input)
        },
        Tan: (radian: FloatValue | IntValue) => {
          const input = asFloatValue(radian, 'Mathf.Tan')
          return gsts.f.tangentFunction(input)
        }
      }
    })
  }

  if (canDefineRandom) {
    Object.defineProperty(root, 'Random', {
      configurable: true,
      enumerable: true,
      value: {
        Range: (min: FloatValue | IntValue, max: FloatValue | IntValue) => {
          ensureServerCtx('Random.Range')
          const useInt = isIntLike(min) || isIntLike(max)
          if (useInt) {
            const minValue = asIntValue(min, 'Random.Range')
            const maxValue = asIntValue(max, 'Random.Range')
            return gsts.f.getRandomInteger(minValue, maxValue)
          }
          if (!isFloatLike(min) || !isFloatLike(max)) {
            throw new Error('[error] Random.Range: invalid number type')
          }
          return gsts.f.getRandomFloatingPointNumber(min as FloatValue, max as FloatValue)
        },
        get value() {
          ensureServerCtx('Random.value')
          return gsts.f.getRandomFloatingPointNumber(0, 1)
        }
      }
    })
  }

  if (canDefineVector3) {
    Object.defineProperty(root, 'Vector3', {
      configurable: true,
      enumerable: true,
      value: {
        get zero() {
          ensureServerCtx('Vector3.zero')
          return gsts.f._3dVectorZeroVector()
        },
        get one() {
          ensureServerCtx('Vector3.one')
          return gsts.f.create3dVector(1, 1, 1)
        },
        get up() {
          ensureServerCtx('Vector3.up')
          return gsts.f._3dVectorUp()
        },
        get down() {
          ensureServerCtx('Vector3.down')
          return gsts.f._3dVectorDown()
        },
        get left() {
          ensureServerCtx('Vector3.left')
          return gsts.f._3dVectorLeft()
        },
        get right() {
          ensureServerCtx('Vector3.right')
          return gsts.f._3dVectorRight()
        },
        get forward() {
          ensureServerCtx('Vector3.forward')
          return gsts.f._3dVectorForward()
        },
        get back() {
          ensureServerCtx('Vector3.back')
          return gsts.f._3dVectorBackward()
        },
        Dot: (a: Vec3Value, b: Vec3Value) => {
          ensureServerCtx('Vector3.Dot')
          return gsts.f._3dVectorDotProduct(a, b)
        },
        Cross: (a: Vec3Value, b: Vec3Value) => {
          ensureServerCtx('Vector3.Cross')
          return gsts.f._3dVectorCrossProduct(a, b)
        },
        Distance: (a: Vec3Value, b: Vec3Value) => {
          ensureServerCtx('Vector3.Distance')
          return gsts.f.distanceBetweenTwoCoordinatePoints(a, b)
        },
        Angle: (a: Vec3Value, b: Vec3Value) => {
          ensureServerCtx('Vector3.Angle')
          return gsts.f._3dVectorAngle(a, b)
        },
        Normalize: (v: Vec3Value) => {
          ensureServerCtx('Vector3.Normalize')
          return gsts.f._3dVectorNormalization(v)
        },
        Magnitude: (v: Vec3Value) => {
          ensureServerCtx('Vector3.Magnitude')
          return gsts.f._3dVectorModuloOperation(v)
        },
        Add: (a: Vec3Value, b: Vec3Value) => {
          ensureServerCtx('Vector3.Add')
          return gsts.f._3dVectorAddition(a, b)
        },
        Sub: (a: Vec3Value, b: Vec3Value) => {
          ensureServerCtx('Vector3.Sub')
          return gsts.f._3dVectorSubtraction(a, b)
        },
        Scale: (v: Vec3Value, s: FloatValue | IntValue) => {
          const scale = asFloatValue(s, 'Vector3.Scale')
          return gsts.f._3dVectorZoom(v, scale)
        },
        Rotation: (rotate: Vec3Value, v: Vec3Value) => {
          ensureServerCtx('Vector3.Rotation')
          return gsts.f._3dVectorRotation(rotate, v)
        },
        Lerp: (a: Vec3Value, b: Vec3Value, t: FloatValue | IntValue) => {
          const factor = asFloatValue(t, 'Vector3.Lerp')
          const diff = gsts.f._3dVectorSubtraction(b, a)
          const scaled = gsts.f._3dVectorZoom(diff, factor)
          return gsts.f._3dVectorAddition(a, scaled)
        },
        ClampMagnitude: (v: Vec3Value, max: FloatValue | IntValue) => {
          const maxValue = asFloatValue(max, 'Vector3.ClampMagnitude')
          const out = gsts.f.initLocalVariable('vec3', v)
          const len = gsts.f._3dVectorModuloOperation(v)
          const shouldClamp = gsts.f.greaterThan(len, maxValue)
          const norm = gsts.f._3dVectorNormalization(v)
          const scaled = gsts.f._3dVectorZoom(norm, maxValue)
          const setOut = () => {
            gsts.f.setLocalVariable(out.localVariable, scaled)
          }
          gsts.f.doubleBranch(
            shouldClamp,
            () => {
              setOut()
            },
            () => {}
          )
          return out.value
        }
      }
    })
  }

  if (canDefineGameObject) {
    Object.defineProperty(root, 'GameObject', {
      configurable: true,
      enumerable: true,
      value: {
        Find: (guidValue: GuidValue) => {
          ensureServerCtx('GameObject.Find')
          return gsts.f.queryEntityByGuid(guidValue)
        },
        FindWithTag: (tag: IntValue) => {
          ensureServerCtx('GameObject.FindWithTag')
          const listValue = gsts.f.getEntityListByUnitTag(tag)
          return gsts.f.getCorrespondingValueFromList(listValue, 0n)
        },
        FindGameObjectsWithTag: (tag: IntValue) => {
          ensureServerCtx('GameObject.FindGameObjectsWithTag')
          return gsts.f.getEntityListByUnitTag(tag)
        },
        FindByPrefabId: (prefab: PrefabIdValue) => {
          ensureServerCtx('GameObject.FindByPrefabId')
          return gsts.f.getEntitiesWithSpecifiedPrefabOnTheField(prefab)
        }
      }
    })
  }

  return () => {
    if (canDefineSelf) {
      if (prevSelf) {
        Object.defineProperty(root, 'self', prevSelf)
      } else {
        delete root.self
      }
    }
    if (canDefineStage) {
      if (prevStage) {
        Object.defineProperty(root, 'stage', prevStage)
      } else {
        delete root.stage
      }
    }
    if (canDefineLevel) {
      if (prevLevel) {
        Object.defineProperty(root, 'level', prevLevel)
      } else {
        delete root.level
      }
    }
    if (canDefineMathf) {
      if (prevMathf) {
        Object.defineProperty(root, 'Mathf', prevMathf)
      } else {
        delete root.Mathf
      }
    }
    if (canDefineRandom) {
      if (prevRandom) {
        Object.defineProperty(root, 'Random', prevRandom)
      } else {
        delete root.Random
      }
    }
    if (canDefineVector3) {
      if (prevVector3) {
        Object.defineProperty(root, 'Vector3', prevVector3)
      } else {
        delete root.Vector3
      }
    }
    if (canDefineGameObject) {
      if (prevGameObject) {
        Object.defineProperty(root, 'GameObject', prevGameObject)
      } else {
        delete root.GameObject
      }
    }
  }
}
