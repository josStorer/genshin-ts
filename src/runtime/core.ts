import { CLIENT_GRAPH_ENTRY_SPEC_BY_SUB_TYPE } from '../definitions/client_graph_modes.js'
import { isClientNodeTypeAvailable } from '../definitions/client_method_modes.js'
import { registerClientEntityHelperContext } from '../definitions/entity_helpers.js'
import { EnumerationType } from '../definitions/enum.js'
import type { ServerEventPayloadsByMode } from '../definitions/events-payload-mode.js'
import type { ServerEventPayloads } from '../definitions/events-payload.js'
import {
  ServerEventMetadata,
  ServerEventMetadataType,
  ServerEventName
} from '../definitions/events.js'
import { NODE_TYPE_BY_METHOD } from '../definitions/node_modes.js'
import {
  ServerExecutionFlowFunctions,
  type ServerExecutionFlowFunctionsByMode
} from '../definitions/nodes.js'
import type { ServerOnOverloads } from '../definitions/server_on_overloads.js'
import {
  SERVER_EVENT_ZH_TO_EN,
  SERVER_F_ZH_TO_EN,
  type ServerEventNameZh
} from '../definitions/zh_aliases.js'
import { CLIENT_ERROR_CODES, clientNodegraphError } from '../shared/client_capability_errors.js'
import {
  applyClientFlowFunctionZhAliases,
  assertClientGraphMode,
  assertClientGraphModeCompatible,
  assertClientGraphSubType,
  CLIENT_FILTER_END_NODE_TYPES,
  createClientFlowFunctions,
  normalizeClientBoolFilterReturn,
  normalizeClientIntFilterReturn,
  type ClientFilterGraphApi,
  type ClientFilterGraphOptions,
  type ClientFilterGraphOptionsForSubType,
  type ClientFlowFunctionClass,
  type ClientFlowFunctionClassForLang,
  type ClientGraphOptions,
  type ClientGraphOptionsForSubType,
  type ClientLang,
  type ClientOrderedStartEventName,
  type ClientStartEvent,
  type ClientStartEventName,
  type ClientStartEventNameForSubType,
  type ClientStartGraphApi
} from './client_graph_support.js'
import { installScopedClientGlobals } from './client_scoped_globals.js'
import type { ExecContext, ExecTailEndpoint, ExecutionFlow } from './execution_flow_types.js'
import { foldLiteralBranches } from './fold_literal_branches.js'
import {
  CLIENT_FILTER_DEFAULT_EVALUATION_INTERVAL,
  resolveGraphIdForGraph
} from './graph_defaults.js'
import { buildIRDocument } from './ir_builder.js'
import type {
  ClientGraphMode,
  ClientGraphSubType,
  GraphMode,
  IRDocument,
  NextConnection,
  ServerGraphMode,
  ServerGraphSubType,
  Variable
} from './IR.js'
import type { MetaCallRecord, MetaCallRecordRef } from './meta_call_types.js'
import { getRuntimeOptions } from './runtime_config.js'
import { installScopedServerGlobals, installServerGlobals } from './server_globals.js'
import {
  bool,
  dict,
  ensureLiteralStr,
  enumeration,
  generic,
  int,
  list,
  localVariable,
  value,
  type DictValueType,
  type RuntimeParameterValueTypeMap,
  type RuntimeReturnValueTypeMap
} from './value.js'
import {
  parseVariableDefinitions,
  type NodeGraphVarApi,
  type NodeGraphVariableMeta,
  type VariablesDefinition
} from './variables.js'

export type { MetaCallRecord, MetaCallRecordRef, MetaCallRecordType } from './meta_call_types.js'

export type SignalParamType =
  | 'bool'
  | 'int'
  | 'float'
  | 'str'
  | 'vec3'
  | 'guid'
  | 'entity'
  | 'prefab_id'
  | 'config_id'
  | 'faction'
  | 'bool_list'
  | 'int_list'
  | 'float_list'
  | 'str_list'
  | 'vec3_list'
  | 'guid_list'
  | 'entity_list'
  | 'prefab_id_list'
  | 'config_id_list'
  | 'faction_list'
  | 'unknown'

export type SignalParamEntry = readonly [name: string, type: SignalParamType]
export type SignalParamEntries = readonly SignalParamEntry[]

export type SignalDefinition<
  Name extends string = string,
  Params extends SignalParamEntries = SignalParamEntries
> = {
  readonly __gstsSignal: true
  readonly name: Name
  readonly params: Params
}

export type SignalParamValue<T extends SignalParamType> =
  T extends keyof RuntimeParameterValueTypeMap ? RuntimeParameterValueTypeMap[T] : unknown

export type SignalParamReturnValue<T extends SignalParamType> =
  T extends keyof RuntimeReturnValueTypeMap ? RuntimeReturnValueTypeMap[T] : unknown

type SignalParamValuesFromEntries<Params extends SignalParamEntries> =
  number extends Params['length']
    ? SignalParamValue<Params[number][1]>[]
    : Params extends readonly [infer First, ...infer Rest]
      ? First extends readonly [string, infer T extends SignalParamType]
        ? Rest extends SignalParamEntries
          ? [SignalParamValue<T>, ...SignalParamValuesFromEntries<Rest>]
          : [SignalParamValue<T>]
        : []
      : []

export type SignalParamValues<S extends SignalDefinition> = SignalParamValuesFromEntries<
  S['params']
>

export type SignalParamObject<S extends SignalDefinition> = {
  [P in S['params'][number] as P[0]]: SignalParamReturnValue<P[1]>
}

export type SignalEventPayload<
  Mode extends ServerGraphMode,
  S extends SignalDefinition
> = ServerEventPayloadsByMode<Mode>['monitorSignal'] & {
  params: SignalParamObject<S>
}

export function defineSignal<const Name extends string, const Params extends SignalParamEntries>(
  name: Name,
  params: Params
): SignalDefinition<Name, Params> {
  return {
    __gstsSignal: true,
    name,
    params
  }
}

export function isSignalDefinition(value: unknown): value is SignalDefinition {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { __gstsSignal?: unknown }).__gstsSignal === true &&
    typeof (value as { name?: unknown }).name === 'string' &&
    Array.isArray((value as { params?: unknown }).params)
  )
}

function resolveSignalInput(signal: string | SignalDefinition): {
  name: string
  params: SignalParamEntries
  typed: boolean
} {
  if (isSignalDefinition(signal)) {
    return { name: signal.name, params: signal.params, typed: true }
  }
  return { name: signal, params: [], typed: false }
}

function asSignalParamValue(paramValue: generic, type: SignalParamType): unknown {
  switch (type) {
    case 'bool':
      return paramValue.asType('bool')
    case 'int':
      return paramValue.asType('int')
    case 'float':
      return paramValue.asType('float')
    case 'str':
      return paramValue.asType('str')
    case 'vec3':
      return paramValue.asType('vec3')
    case 'guid':
      return paramValue.asType('guid')
    case 'entity':
      return paramValue.asType('entity')
    case 'prefab_id':
      return paramValue.asType('prefab_id')
    case 'config_id':
      return paramValue.asType('config_id')
    case 'faction':
      return paramValue.asType('faction')
    case 'bool_list':
      return paramValue.asType('bool_list')
    case 'int_list':
      return paramValue.asType('int_list')
    case 'float_list':
      return paramValue.asType('float_list')
    case 'str_list':
      return paramValue.asType('str_list')
    case 'vec3_list':
      return paramValue.asType('vec3_list')
    case 'guid_list':
      return paramValue.asType('guid_list')
    case 'entity_list':
      return paramValue.asType('entity_list')
    case 'prefab_id_list':
      return paramValue.asType('prefab_id_list')
    case 'config_id_list':
      return paramValue.asType('config_id_list')
    case 'faction_list':
      return paramValue.asType('faction_list')
    case 'unknown':
      return paramValue
  }
}

export type IRBuildOptions = {
  optimizeA?: boolean
  /**
   * [ZH] 默认图名（当 g.server 未指定 name 时使用；通常由 runner 传入入口文件名）
   *
   * [EN] Default graph name when g.server() doesn't provide one (usually from runner entry filename)
   */
  defaultName?: string
}

export type ServerLang = 'en' | 'zh'

type ServerGraphOptionsBase<Vars extends VariablesDefinition = VariablesDefinition> = {
  /**
   * [ZH] 节点图 ID（NodeGraph.id）。
   *
   * 对应要注入/替换的目标 NodeGraph ID。服务器节点图默认值为 1073741825。
   *
   * [EN] Node graph id (NodeGraph.id).
   *
   * The target NodeGraph id to inject/replace. The server graph default value is 1073741825.
   */
  id?: number
  /**
   * [ZH] 节点图显示名称（NodeGraph.name）。
   *
   * 若不指定：默认使用入口文件名（由 gsts runner 注入 defaultName）。
   *
   * [EN] Display name inside the node editor (NodeGraph.name).
   *
   * If omitted: defaults to the entry file name (provided by gsts runner as defaultName).
   */
  name?: string
  /**
   * [ZH] 是否自动加 `_GSTS` 前缀（默认 true）。
   * - true: 若 name/defaultName 不以 `_GSTS` 开头，则自动补 `_GSTS_` 前缀
   * - false: 不做任何前缀处理
   *
   * [EN] Whether to auto prefix with `_GSTS` (default true).
   */
  prefix?: boolean
  /**
   * [ZH] 节点图变量声明
   *
   * [EN] Node graph variable definitions
   */
  variables?: Vars
  /**
   * [ZH] 语言偏好（仅影响类型提示与中文别名解析）
   *
   * [EN] Language hint (affects type hints and zh alias resolution only)
   */
  lang?: ServerLang
}

export type ServerGraphOptions<Vars extends VariablesDefinition = VariablesDefinition> =
  | (ServerGraphOptionsBase<Vars> & {
      /**
       * [ZH] 节点图模式（默认超限模式 Beyond Mode）。
       *
       * [EN] Graph mode (default: Beyond Mode).
       */
      mode?: 'beyond'
      /**
       * [ZH] 服务器节点图子类型（默认 `实体节点图`）。
       *
       * [EN] Server graph sub type (default: `entity`).
       */
      type?: ServerGraphSubType
    })
  | (ServerGraphOptionsBase<Vars> & {
      /**
       * [ZH] 节点图模式（经典模式 Classic Mode）。
       *
       * [EN] Graph mode (Classic Mode).
       */
      mode: 'classic'
      /**
       * [ZH] 服务器节点图子类型（默认 `实体节点图`；经典模式不允许 `class`）。
       *
       * [EN] Server graph sub type (default: `entity`; Classic Mode disallows `class`).
       */
      type?: Exclude<ServerGraphSubType, 'class'>
    })

export type ServerExecutionFlowFunctionsWithVars<
  Vars extends VariablesDefinition,
  Mode extends ServerGraphMode
> = Omit<ServerExecutionFlowFunctionsByMode<Mode>, 'get' | 'set'> & NodeGraphVarApi<Vars>

export type ServerExecutionFlowFunctionsWithVarsZh<
  Vars extends VariablesDefinition,
  Mode extends ServerGraphMode
> = ServerExecutionFlowFunctionsWithVars<Vars, Mode> & {
  [K in keyof typeof SERVER_F_ZH_TO_EN as Extract<
    (typeof SERVER_F_ZH_TO_EN)[K],
    keyof ServerExecutionFlowFunctionsWithVars<Vars, Mode>
  > extends never
    ? never
    : K]: ServerExecutionFlowFunctionsWithVars<Vars, Mode>[Extract<
    (typeof SERVER_F_ZH_TO_EN)[K],
    keyof ServerExecutionFlowFunctionsWithVars<Vars, Mode>
  >]
}

type ServerExecutionFlowFunctionsForLang<
  Vars extends VariablesDefinition,
  Lang extends ServerLang,
  Mode extends ServerGraphMode
> = Lang extends 'zh'
  ? ServerExecutionFlowFunctionsWithVarsZh<Vars, Mode>
  : ServerExecutionFlowFunctionsWithVars<Vars, Mode>

type ServerEventNameAny = ServerEventName | ServerEventNameZh

type ServerEventNameToEn<E> = E extends ServerEventName
  ? E
  : E extends ServerEventNameZh
    ? (typeof SERVER_EVENT_ZH_TO_EN)[E]
    : never

export type ServerGraphApi<
  Vars extends VariablesDefinition,
  Lang extends ServerLang = 'en',
  Mode extends ServerGraphMode = 'beyond'
> = (Lang extends 'zh'
  ? ServerOnOverloads<Vars, Mode, ServerExecutionFlowFunctionsForLang<Vars, 'zh', Mode>, true>
  : ServerOnOverloads<Vars, Mode, ServerExecutionFlowFunctionsForLang<Vars, 'en', Mode>>) & {
  /**
   * Monitors Signal trigger events defined in the Signal Manager; The Signal name to monitor must be selected first
   *
   * 监听信号: 监听已在信号管理器中定义的信号触发事件; 需先选择需要监听的信号名
   *
   * GSTS Note: You still need to register the signal in the signal manager in the editor; Using signal distribution can avoid some large loop triggering load limits, which can be used for performance optimization
   *
   * GSTS 注: 你仍然需要在编辑器内的信号管理器注册信号; 使用信号分发能够避免一些大循环触发负载限制, 可用于性能优化
   *
   * @param signalName Signal name literal or extracted Signal.xxx definition. Signal.xxx enables typed evt.params access.
   *
   * 信号名字面量或提取出的 Signal.xxx 定义。使用 Signal.xxx 时可通过 evt.params 获取类型化参数。
   */
  onSignal<S extends SignalDefinition>(
    signalName: S,
    handler: (
      evt: SignalEventPayload<Mode, S>,
      f: ServerExecutionFlowFunctionsForLang<Vars, Lang, Mode>
    ) => void
  ): ServerGraphApi<Vars, Lang, Mode>
  onSignal(
    signalName: string,
    handler: (
      evt: ServerEventPayloadsByMode<Mode>['monitorSignal'],
      f: ServerExecutionFlowFunctionsForLang<Vars, Lang, Mode>
    ) => void
  ): ServerGraphApi<Vars, Lang, Mode>
}

const SERVER_GRAPH_TYPES = new Set<ServerGraphSubType>(['entity', 'status', 'class', 'item'])
const SERVER_GRAPH_MODES = new Set<ServerGraphMode>(['beyond', 'classic'])

function resolveServerGraphType(type?: ServerGraphSubType): ServerGraphSubType {
  const resolved = type ?? 'entity'
  if (!SERVER_GRAPH_TYPES.has(resolved)) {
    throw new Error(`[error] invalid server graph sub type: ${String(type)}`)
  }
  return resolved
}

function resolveServerGraphMode(mode?: ServerGraphMode): ServerGraphMode {
  const resolved = mode ?? 'beyond'
  if (!SERVER_GRAPH_MODES.has(resolved)) {
    throw new Error(`[error] invalid server graph mode: ${String(mode)}`)
  }
  return resolved
}

function assertServerGraphModeCompatible(mode: ServerGraphMode, type: ServerGraphSubType) {
  if (mode === 'classic' && type === 'class') {
    throw new Error('[error] classic mode does not allow class graph type')
  }
}

export type ClientGstsCtxKind = 'handler' | 'if' | 'loop' | 'switch'
export type ClientGstsCtxType = `client_${ClientGraphSubType}_${ClientGstsCtxKind}`

export type GstsCtxType =
  | 'javascript'
  | ClientGstsCtxType
  | 'server_handler'
  | 'server_if'
  | 'server_loop'
  | 'server_switch'

export type GstsCtxApi = {
  readonly ctxType: GstsCtxType
  withCtx<T>(ctxType: GstsCtxType, fn: () => T): T
  isServerCtx(): boolean
  isClientCtx(): boolean
  isClientGraphCtx(subType: ClientGraphSubType): boolean
  assertServerCtx(): void
  assertClientCtx(): void
  assertClientGraphCtx(subType: ClientGraphSubType): void
  assertCtx(expected: GstsCtxType): void
}

export type GstsPublic = {
  /**
   * context tools entry
   *
   * 上下文工具统一入口
   */
  readonly ctx: GstsCtxApi
  /**
   * Server node graph function namespace shorthand.
   *
   * This is equivalent to `gsts.fServer`. It is only available inside `g.server().on(...)`
   * handlers.
   *
   * 服务器节点图函数命名空间简写。
   *
   * 等价于 `gsts.fServer`。仅允许在 `g.server().on(...)` handler 内访问，否则 throw。
   */
  readonly f: ServerExecutionFlowFunctions
  /**
   * Server node graph function namespace.
   *
   * Only available inside `g.server().on(...)` handlers.
   *
   * 服务器节点图函数命名空间。
   *
   * 仅允许在 `g.server().on(...)` handler 内访问，否则 throw。
   */
  readonly fServer: ServerExecutionFlowFunctions
  /**
   * Character skill client node graph function namespace.
   *
   * Only available inside `g.characterSkill(...).on(...)` handlers.
   *
   * 角色技能客户端节点图函数命名空间。
   *
   * 仅允许在 `g.characterSkill(...).on(...)` handler 内访问，否则 throw。
   */
  readonly fCharacterSkill: ClientFlowFunctionClass<'character_skill'>
  /**
   * Character control skill client node graph function namespace.
   *
   * Only available inside `g.characterControlSkill(...).on(...)` handlers.
   *
   * 角色操控技能客户端节点图函数命名空间。
   *
   * 仅允许在 `g.characterControlSkill(...).on(...)` handler 内访问，否则 throw。
   */
  readonly fCharacterControlSkill: ClientFlowFunctionClass<'character_control_skill'>
  /**
   * Creation skill client node graph function namespace.
   *
   * Only available inside `g.creationSkill(...).on(...)` handlers.
   *
   * 造物技能客户端节点图函数命名空间。
   *
   * 仅允许在 `g.creationSkill(...).on(...)` handler 内访问，否则 throw。
   */
  readonly fCreationSkill: ClientFlowFunctionClass<'creation_skill'>
  /**
   * Creation status client node graph function namespace.
   *
   * Only available inside `g.creationStatus(...).on(...)` handlers.
   *
   * 造物状态客户端节点图函数命名空间。
   *
   * 仅允许在 `g.creationStatus(...).on(...)` handler 内访问，否则 throw。
   */
  readonly fCreationStatus: ClientFlowFunctionClass<'creation_status'>
  /**
   * Creation status decision client node graph function namespace.
   *
   * Only available inside `g.creationStatusDecision(...).on(...)` handlers.
   *
   * 造物状态决策客户端节点图函数命名空间。
   *
   * 仅允许在 `g.creationStatusDecision(...).on(...)` handler 内访问，否则 throw。
   */
  readonly fCreationStatusDecision: ClientFlowFunctionClass<'creation_status_decision'>
  /**
   * Boolean filter client node graph function namespace.
   *
   * Only available inside `g.boolFilter(...).on(...)` handlers.
   *
   * 布尔过滤器客户端节点图函数命名空间。
   *
   * 仅允许在 `g.boolFilter(...).on(...)` handler 内访问，否则 throw。
   */
  readonly fBoolFilter: ClientFlowFunctionClass<'bool_filter'>
  /**
   * Integer filter client node graph function namespace.
   *
   * Only available inside `g.intFilter(...).on(...)` handlers.
   *
   * 整数过滤器客户端节点图函数命名空间。
   *
   * 仅允许在 `g.intFilter(...).on(...)` handler 内访问，否则 throw。
   */
  readonly fIntFilter: ClientFlowFunctionClass<'int_filter'>
}

declare global {
  var gsts: GstsPublic
  interface GlobalThis {
    gsts: GstsPublic
  }
}

const kCtxStack: unique symbol = Symbol('gsts_ctxStack')
const kServerF: unique symbol = Symbol('gsts_serverF')
const kClientF: unique symbol = Symbol('gsts_clientF')

type GstsInternal = GstsPublic & {
  [kCtxStack]?: GstsCtxType[]
  [kServerF]?: ServerExecutionFlowFunctions
  [kClientF]?: Partial<Record<ClientGraphSubType, unknown>>
}

const CLIENT_F_GLOBAL_NAMES = {
  character_skill: 'fCharacterSkill',
  character_control_skill: 'fCharacterControlSkill',
  creation_skill: 'fCreationSkill',
  creation_status: 'fCreationStatus',
  creation_status_decision: 'fCreationStatusDecision',
  bool_filter: 'fBoolFilter',
  int_filter: 'fIntFilter'
} as const satisfies Record<ClientGraphSubType, keyof GstsPublic>

function getBoundServerF(g: GstsInternal, ctx: GstsCtxApi, name: 'gsts.f' | 'gsts.fServer') {
  ctx.assertServerCtx()
  if (!g[kServerF]) {
    throw new Error(`[error] ${name} is not bound (did you call it outside g.server().on handler?)`)
  }
  return g[kServerF]
}

function getBoundClientF<T extends ClientGraphSubType>(
  g: GstsInternal,
  ctx: GstsCtxApi,
  subType: T
): ClientFlowFunctionClass<T> {
  ctx.assertClientGraphCtx(subType)
  const value = g[kClientF]?.[subType]
  if (!value) {
    const name = CLIENT_F_GLOBAL_NAMES[subType]
    throw new Error(
      `[error] gsts.${name} is not bound (did you call it outside matching client graph handler?)`
    )
  }
  return value as ClientFlowFunctionClass<T>
}

function ensureGsts(): GstsPublic {
  // @ts-ignore 友好打印bigint
  BigInt.prototype.toJSON = function () {
    return `${Number(this)}n`
  }

  const root = globalThis as unknown as { gsts?: GstsInternal }
  const g = (root.gsts ??= { ctx: {} as unknown as GstsCtxApi } as GstsInternal)

  const stack = (g[kCtxStack] ??= [])

  const ctx: GstsCtxApi = {
    get ctxType() {
      return stack[stack.length - 1] ?? 'javascript'
    },
    withCtx<T>(ctxType: GstsCtxType, fn: () => T): T {
      stack.push(ctxType)
      try {
        return fn()
      } finally {
        stack.pop()
      }
    },
    isServerCtx() {
      return this.ctxType.startsWith('server_')
    },
    isClientCtx() {
      return this.ctxType.startsWith('client_')
    },
    isClientGraphCtx(subType: ClientGraphSubType) {
      return (
        this.ctxType === `client_${subType}_handler` ||
        this.ctxType === `client_${subType}_if` ||
        this.ctxType === `client_${subType}_loop` ||
        this.ctxType === `client_${subType}_switch`
      )
    },
    assertServerCtx() {
      if (!this.isServerCtx()) {
        throw new Error(
          `[error] gsts.f is only available in server_* ctxType (current: ${this.ctxType})`
        )
      }
    },
    assertClientCtx() {
      if (!this.isClientCtx()) {
        throw new Error(
          `[error] client scoped f is only available in client_* ctxType (current: ${this.ctxType})`
        )
      }
    },
    assertClientGraphCtx(subType: ClientGraphSubType) {
      if (!this.isClientGraphCtx(subType)) {
        throw new Error(
          `[error] gsts.${CLIENT_F_GLOBAL_NAMES[subType]} is only available in client_${subType}_* ctxType (current: ${this.ctxType})`
        )
      }
    },
    assertCtx(expected: GstsCtxType) {
      if (this.ctxType !== expected) {
        throw new Error(`[error] invalid ctxType: expected ${expected}, got ${this.ctxType}`)
      }
    }
  }
  // @ts-ignore force assign ctx to gsts
  g.ctx = ctx

  if (!Object.getOwnPropertyDescriptor(g, 'f')) {
    Object.defineProperty(g, 'f', {
      configurable: false,
      enumerable: true,
      get() {
        return getBoundServerF(g, ctx, 'gsts.f')
      }
    })
  }

  if (!Object.getOwnPropertyDescriptor(g, 'fServer')) {
    Object.defineProperty(g, 'fServer', {
      configurable: false,
      enumerable: true,
      get() {
        return getBoundServerF(g, ctx, 'gsts.fServer')
      }
    })
  }

  const installClientFGetter = <T extends ClientGraphSubType>(subType: T) => {
    const name = CLIENT_F_GLOBAL_NAMES[subType]
    if (Object.getOwnPropertyDescriptor(g, name)) return
    Object.defineProperty(g, name, {
      configurable: false,
      enumerable: true,
      get() {
        return getBoundClientF(g, ctx, subType)
      }
    })
  }

  installClientFGetter('character_skill')
  installClientFGetter('character_control_skill')
  installClientFGetter('creation_skill')
  installClientFGetter('creation_status')
  installClientFGetter('creation_status_decision')
  installClientFGetter('bool_filter')
  installClientFGetter('int_filter')

  return g
}

ensureGsts()
installServerGlobals()

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

const NODE_MODE_BY_NODE_TYPE = new Map<string, ServerGraphMode>(
  Object.entries(NODE_TYPE_BY_METHOD).map(([methodName, mode]) => [camelToSnake(methodName), mode])
)

function processDictParam(param: ServerEventMetadataType[ServerEventName][number]): value {
  switch (param.name) {
    case 'purchaseItemDictionary':
      return new dict('config_id', 'int')
    default:
      throw new Error(`Unknown dict param: ${param.name}`)
  }
}

export interface ExecutionFlowRegistry {
  registerNode(record: MetaCallRecord): MetaCallRecordRef
  withExecBranch(
    fromNodeId: number,
    sourceIndex: number,
    fn: () => void
  ): {
    tailEndpoints: ExecTailEndpoint[]
    headNodeId?: number
    terminatedByReturn?: boolean
  }
  markLinkNextExecFrom(fromNodeId: number, sourceIndex: number): void
  setCurrentExecTailEndpoints(tailEndpoints: ExecTailEndpoint[]): void
  returnFromCurrentExecPath(opts?: { countReturn?: boolean }): void
  getOrCreateReturnGateLocalVariable(): { localVariable: localVariable; value: bool }
  withLoop(loopNodeId: number, fn: () => void): void
  getActiveLoopNodeIds(): number[]
  getReturnCallCounter(): number
  ensureVariable(variable: Variable, meta?: NodeGraphVariableMeta): void
  getVariableMeta(name: string): NodeGraphVariableMeta | undefined
  registerTimerCaptureDict(name: string, valueType: DictValueType): void
  runServerHandler<E extends ServerEventName>(
    eventName: E,
    handler: (evt: ServerEventPayloads[E], f: ServerExecutionFlowFunctions) => void,
    inputArgs?: value[]
  ): void
  connectExecBranchOutput(fromNodeId: number, sourceIndex: number, headNodeId: number): void
}

type ServerEventPrelude = {
  eventName: ServerEventName
  build: (f: ServerExecutionFlowFunctions) => void
  createFallback: boolean
}

export class MetaCallRegistry implements ExecutionFlowRegistry {
  private recordCounter = 1
  private flows: ExecutionFlow[] = []
  private flowStack: number[] = []
  private readonly graphDocumentType: 'server' | 'client'
  private readonly graphType: ServerGraphSubType | ClientGraphSubType
  private readonly graphMode: GraphMode
  private readonly graphId?: number
  private readonly graphName?: string
  private readonly clientEvaluationInterval?: number
  private readonly prefixName: boolean
  private readonly variables: Variable[]
  private readonly variableMetaByName: Map<string, NodeGraphVariableMeta>
  private readonly serverEventPreludes = new Map<string, ServerEventPrelude>()
  private readonly appliedServerEventPreludes = new WeakMap<ExecutionFlow, Set<string>>()
  /**
   * return调用计数, 通过回调前后比对确认是否调用过return
   */
  private returnCallCounter = 0
  /**
   * 用于记录当前活跃的循环体节点, 方便return时全部break
   */
  private loopNodeStack: number[] = []

  constructor(
    graphType: ServerGraphSubType | ClientGraphSubType = 'entity',
    graphMode: GraphMode = 'beyond',
    graphId?: number,
    graphName?: string,
    prefixName: boolean = true,
    variables: Variable[] = [],
    variableMetaByName: Map<string, NodeGraphVariableMeta> = new Map(),
    graphDocumentType: 'server' | 'client' = 'server',
    clientEvaluationInterval?: number
  ) {
    this.graphDocumentType = graphDocumentType
    this.graphType = graphType
    this.graphMode = graphMode
    this.graphId = graphId
    this.graphName = graphName
    this.clientEvaluationInterval = clientEvaluationInterval
    this.prefixName = prefixName
    this.variables = variables
    this.variableMetaByName = variableMetaByName
  }

  /**
   * 为指定服务器事件的每一条执行流前置同一段节点。
   *
   * 节点会在构建 IR 前统一插入，因此不依赖处理器的声明顺序。
   */
  ensureServerEventPrelude(
    eventName: ServerEventName,
    key: string,
    build: (f: ServerExecutionFlowFunctions) => void,
    options?: { createFallback?: boolean }
  ): void {
    const existing = this.serverEventPreludes.get(key)
    if (existing) {
      if (existing.eventName !== eventName) {
        throw new Error(
          `[error] server event prelude "${key}" is already registered for ${existing.eventName}`
        )
      }
      return
    }

    const prelude = { eventName, build, createFallback: options?.createFallback === true }
    this.serverEventPreludes.set(key, prelude)
  }

  ensureVariable(variable: Variable, meta?: NodeGraphVariableMeta) {
    const existing = this.variables.find((v) => v.name === variable.name)
    if (existing) {
      if (existing.type !== variable.type) {
        throw new Error(
          `[error] variable "${variable.name}" already exists with different type (${existing.type} vs ${variable.type})`
        )
      }
      if (existing.type === 'dict') {
        const a = existing.dict
        const b = (variable as Extract<Variable, { type: 'dict' }>).dict
        if (!a || !b || a.k !== b.k || a.v !== b.v) {
          throw new Error(
            `[error] variable "${variable.name}" already exists with different dict types`
          )
        }
      }
      return
    }
    this.variables.push(variable)
    if (meta) this.variableMetaByName.set(variable.name, meta)
  }

  registerTimerCaptureDict(name: string, valueType: DictValueType) {
    this.ensureVariable(
      { name, type: 'dict', dict: { k: 'str', v: valueType } },
      { type: 'dict', dict: { k: 'str', v: valueType } }
    )
  }

  runServerHandler<E extends ServerEventName>(
    eventName: E,
    handler: (
      evt: ServerEventPayloads[E],
      f: ServerExecutionFlowFunctions,
      eventNode: MetaCallRecord
    ) => void,
    inputArgs: value[] = []
  ) {
    const evt = this.registerEvent(eventName, ServerEventMetadata, inputArgs)
    const fns = new ServerExecutionFlowFunctions(this)
    const gsts = ensureGsts() as unknown as GstsInternal
    const prevF = gsts[kServerF]
    const prevFlowStack = this.flowStack
    const prevLoopStack = this.loopNodeStack
    const prevReturnCounter = this.returnCallCounter
    const flowIndex = this.flows.length - 1
    const eventNode = this.flows[flowIndex].eventNode
    const restoreScopedGlobals = installScopedServerGlobals()
    this.flowStack = [...prevFlowStack, flowIndex]
    this.loopNodeStack = []
    this.returnCallCounter = 0
    gsts[kServerF] = fns
    try {
      gsts.ctx.withCtx('server_handler', () => handler(evt, fns as never, eventNode))
    } finally {
      restoreScopedGlobals()
      gsts[kServerF] = prevF
      this.flowStack = prevFlowStack
      this.loopNodeStack = prevLoopStack
      this.returnCallCounter = prevReturnCounter
    }
  }

  runClientStartHandler<F, R>(
    startNodeType: string,
    handler: (evt: ClientStartEvent, f: F) => R,
    fns: F,
    normalizeReturn?: (value: R) => value,
    endNodeType?: string,
    entry?: { sourceIndex: number; reuseStartNode: boolean }
  ) {
    const sourceIndex = entry?.sourceIndex ?? 0
    let flowIndex = entry?.reuseStartNode
      ? this.flows.findIndex((flow) => flow.eventNode.nodeType === startNodeType)
      : -1
    if (flowIndex < 0) {
      const eventNode: MetaCallRecord = {
        id: this.currentRecordId,
        type: 'event',
        nodeType: startNodeType,
        args: []
      }
      this.flows.push({
        eventNode,
        eventArgs: [],
        execNodes: [],
        dataNodes: [],
        edges: {},
        execContextStack: [{ tailEndpoints: [{ nodeId: eventNode.id, sourceIndex }] }]
      })
      flowIndex = this.flows.length - 1
    }

    const prevFlowStack = this.flowStack
    const prevLoopStack = this.loopNodeStack
    const prevReturnCounter = this.returnCallCounter
    const flow = this.flows[flowIndex]
    const prevExecContextStack = flow.execContextStack
    flow.execContextStack = [{ tailEndpoints: [{ nodeId: flow.eventNode.id, sourceIndex }] }]
    const clientSubType = this.graphType as ClientGraphSubType
    const gsts = ensureGsts() as unknown as GstsInternal
    const clientBindings = (gsts[kClientF] ??= {})
    const prevClientF = clientBindings[clientSubType]
    this.flowStack = [...prevFlowStack, flowIndex]
    this.loopNodeStack = []
    this.returnCallCounter = 0
    clientBindings[clientSubType] = fns
    const restoreScopedGlobals = installScopedClientGlobals(
      clientSubType,
      this.graphMode as ClientGraphMode
    )
    try {
      gsts.ctx.withCtx(`client_${clientSubType}_handler`, () => {
        const result = handler({}, fns)
        if (normalizeReturn && endNodeType) {
          const normalized = normalizeReturn(result)
          this.registerNode({
            id: 0,
            type: 'exec',
            nodeType: endNodeType,
            args: [normalized]
          })
        }
      })
    } finally {
      restoreScopedGlobals()
      if (prevClientF === undefined) {
        delete clientBindings[clientSubType]
      } else {
        clientBindings[clientSubType] = prevClientF
      }
      this.flowStack = prevFlowStack
      this.loopNodeStack = prevLoopStack
      this.returnCallCounter = prevReturnCounter
      flow.execContextStack = prevExecContextStack
    }
  }

  getGraphId(): number | undefined {
    return this.graphId
  }

  getGraphName(): string | undefined {
    return this.graphName
  }

  getClientEvaluationInterval(): number | undefined {
    return this.clientEvaluationInterval
  }

  shouldPrefixName(): boolean {
    return this.prefixName
  }

  private getCurrentExecContext(flow: ExecutionFlow) {
    return flow.execContextStack[flow.execContextStack.length - 1]
  }

  private addEdge(flow: ExecutionFlow, fromNodeId: number, toNodeId: number, sourceIndex?: number) {
    const list = (flow.edges[fromNodeId] ??= [])
    if (sourceIndex === undefined) {
      list.push(toNodeId)
    } else {
      list.push({ node_id: toNodeId, source_index: sourceIndex })
    }
  }

  private connectFromEndpointsToConnection(
    flow: ExecutionFlow,
    endpoints: ExecTailEndpoint[],
    next: NextConnection
  ): void {
    const targetNodeId = typeof next === 'number' ? next : next.node_id
    for (const endpoint of endpoints) {
      if (typeof next === 'number' && endpoint.sourceIndex === undefined) {
        this.addEdge(flow, endpoint.nodeId, targetNodeId)
        continue
      }

      const connections = (flow.edges[endpoint.nodeId] ??= [])
      connections.push({
        node_id: targetNodeId,
        ...(endpoint.sourceIndex === undefined ? {} : { source_index: endpoint.sourceIndex }),
        ...(typeof next === 'number' || next.target_index === undefined
          ? {}
          : { target_index: next.target_index }),
        ...(typeof next === 'number' || next.target_sub_index === undefined
          ? {}
          : { target_sub_index: next.target_sub_index })
      })
    }
  }

  private getAppliedServerEventPreludes(flow: ExecutionFlow): Set<string> {
    let applied = this.appliedServerEventPreludes.get(flow)
    if (!applied) {
      applied = new Set<string>()
      this.appliedServerEventPreludes.set(flow, applied)
    }
    return applied
  }

  private prependServerEventPrelude(
    flow: ExecutionFlow,
    key: string,
    prelude: ServerEventPrelude
  ): void {
    const applied = this.getAppliedServerEventPreludes(flow)
    if (applied.has(key)) return
    applied.add(key)

    const flowIndex = this.flows.indexOf(flow)
    if (flowIndex < 0) {
      throw new Error('[error] flow not found')
    }

    const eventNodeId = flow.eventNode.id
    const originalNext = [...(flow.edges[eventNodeId] ?? [])]
    const originalContextStack = flow.execContextStack
    const preludeContext: ExecContext = { tailEndpoints: [{ nodeId: eventNodeId }] }
    const previousFlowStack = this.flowStack

    delete flow.edges[eventNodeId]
    flow.execContextStack = [preludeContext]
    this.flowStack = [...previousFlowStack, flowIndex]
    try {
      prelude.build(new ServerExecutionFlowFunctions(this))
    } catch (error) {
      flow.edges[eventNodeId] = originalNext
      applied.delete(key)
      throw error
    } finally {
      flow.execContextStack = originalContextStack
      this.flowStack = previousFlowStack
    }

    if (!preludeContext.headNodeId) {
      flow.edges[eventNodeId] = originalNext
      return
    }

    for (const next of originalNext) {
      this.connectFromEndpointsToConnection(flow, preludeContext.tailEndpoints, next)
    }
  }

  private connectFromEndpoints(
    flow: ExecutionFlow,
    endpoints: ExecTailEndpoint[],
    toNodeId: number
  ) {
    endpoints.forEach((ep) => this.addEdge(flow, ep.nodeId, toNodeId, ep.sourceIndex))
  }

  connectExecBranchOutput(fromNodeId: number, sourceIndex: number, headNodeId: number) {
    this.addEdge(this.currentFlow, fromNodeId, headNodeId, sourceIndex)
  }

  private get currentFlow(): ExecutionFlow {
    const idx =
      this.flowStack.length > 0 ? this.flowStack[this.flowStack.length - 1] : this.flows.length - 1
    return this.flows[idx]
  }

  /**
   * 获取当前记录的 ID，每次调用后递增
   */
  private get currentRecordId(): number {
    return this.recordCounter++
  }

  registerEvent<E extends ServerEventName>(
    eventName: E,
    metadata: ServerEventMetadataType,
    inputArgs: value[] = []
  ): ServerEventPayloads[E] {
    const eventParams = metadata[eventName]

    if (!eventParams) {
      throw new Error(`Unknown event: ${eventName}`)
    }

    const eventNode: MetaCallRecord = {
      id: this.currentRecordId,
      type: 'event',
      nodeType: camelToSnake(eventName),
      args: inputArgs
    }

    const eventArgs: value[] = []
    const eventObj = {} as unknown as ServerEventPayloads[E]

    eventParams.forEach((param) => {
      const makePin = () => {
        if (param.typeBase === dict) {
          const v = processDictParam(param)
          v.markPin(eventNode, param.name, eventArgs.length)
          return v
        }
        if (param.typeBase === enumeration) {
          const v = new enumeration(param.typeName as EnumerationType)
          v.markPin(eventNode, param.name, eventArgs.length)
          return v
        }
        const v = new (param.typeBase as Exclude<typeof param.typeBase, typeof dict>)()
        v.markPin(eventNode, param.name, eventArgs.length)
        return v
      }
      if (param.isArray) {
        const l = new list(param.typeName)
        l.markPin(eventNode, param.name, eventArgs.length)
        eventArgs.push(l)
        // @ts-ignore 强制允许
        eventObj[param.name] = l
      } else {
        const arg = makePin()
        eventArgs.push(arg)
        // @ts-ignore 强制允许
        eventObj[param.name] = arg
      }
    })

    this.flows.push({
      eventNode,
      eventArgs,
      execNodes: [],
      dataNodes: [],
      edges: {},
      execContextStack: [
        {
          // 默认根执行链从事件节点出发
          tailEndpoints: [{ nodeId: eventNode.id }]
        }
      ]
    })

    return eventObj
  }

  /**
   * 在指定节点的某个执行输出引脚下注册一段执行链（用于循环体/条件分支）。
   * 回调内注册的 exec 节点会形成一条独立链，结束后自动把该链的 head 挂到 fromNodeId 的 sourceIndex 上。
   */
  withExecBranch(fromNodeId: number, sourceIndex: number, fn: () => void) {
    const current = this.currentFlow
    current.execContextStack.push({ tailEndpoints: [] })

    fn()

    const ctx = current.execContextStack.pop()!
    // fn注册过节点, 则headNodeId才会有值
    if (ctx.headNodeId) {
      this.addEdge(current, fromNodeId, ctx.headNodeId, sourceIndex)
    }

    return {
      tailEndpoints: ctx.tailEndpoints,
      headNodeId: ctx.headNodeId,
      terminatedByReturn: ctx.terminatedByReturn
    }
  }

  /**
   * 标记, 将“接下来注册到的第一个 exec 节点”挂到指定节点的某个执行输出引脚上（一次性）。
   * 用于像 Finite Loop 的 Loop Complete：循环节点后的顺序代码应连接到 complete 分支。
   */
  markLinkNextExecFrom(fromNodeId: number, sourceIndex: number) {
    const current = this.currentFlow
    const ctx = this.getCurrentExecContext(current)
    ctx.tailEndpoints = [{ nodeId: fromNodeId, sourceIndex }]
    ctx.pendingSourceIndex = sourceIndex
  }

  /**
   * 设置当前执行链 tail (多路时用)
   */
  setCurrentExecTailEndpoints(tailEndpoints: ExecTailEndpoint[]) {
    const current = this.currentFlow
    const ctx = this.getCurrentExecContext(current)
    ctx.tailEndpoints = tailEndpoints
    ctx.pendingSourceIndex = undefined
  }

  /**
   * 终止当前执行路径（return / continue / break 语义）：该分支后续不再产生执行连线
   */
  returnFromCurrentExecPath(opts?: { countReturn?: boolean }) {
    const current = this.currentFlow
    const ctx = this.getCurrentExecContext(current)
    ctx.terminatedByReturn = true
    ctx.tailEndpoints = []
    ctx.pendingSourceIndex = undefined
    if (opts?.countReturn !== false) this.returnCallCounter += 1
  }

  registerNode(record: MetaCallRecord): MetaCallRecordRef {
    const current = this.currentFlow
    if (!record.id) {
      record.id = this.currentRecordId
    }

    if (this.graphDocumentType === 'client') {
      if (
        !isClientNodeTypeAvailable(
          this.graphType as ClientGraphSubType,
          this.graphMode as ClientGraphMode,
          record.nodeType
        )
      ) {
        throw clientNodegraphError(
          CLIENT_ERROR_CODES.NODE_UNAVAILABLE,
          `${this.graphType}.${record.nodeType} is not available in ${this.graphMode} mode`
        )
      }
    } else {
      const nodeMode = NODE_MODE_BY_NODE_TYPE.get(record.nodeType)
      if (nodeMode && nodeMode !== this.graphMode) {
        throw new Error(
          `[error] node "${record.nodeType}" is ${nodeMode} mode only (current: ${this.graphMode})`
        )
      }
    }

    if (record.type === 'exec') {
      current.execNodes.push(record)
      const ctx = this.getCurrentExecContext(current)
      if (!ctx.headNodeId) ctx.headNodeId = record.id
      const tails = ctx.tailEndpoints
      if (ctx.pendingSourceIndex !== undefined && tails.length > 1) {
        throw new Error('pendingSourceIndex cannot be used with multiple tail endpoints')
      }
      if (tails.length) {
        const sourceIndex = ctx.pendingSourceIndex
        if (sourceIndex !== undefined) {
          this.connectFromEndpoints(current, [{ nodeId: tails[0].nodeId, sourceIndex }], record.id)
        } else {
          this.connectFromEndpoints(current, tails, record.id)
        }
        ctx.pendingSourceIndex = undefined
      }
      ctx.tailEndpoints = [{ nodeId: record.id }]
    } else if (record.type === 'data') {
      current.dataNodes.push(record)
    } else {
      throw new Error(`registerNode: unknown record type: ${record.type}`)
    }
    return record
  }

  /** 在服务器 IR 构建前应用事件前置逻辑；重复调用不会重复插入。 */
  finalizeServerFlows(): void {
    for (const [key, prelude] of this.serverEventPreludes) {
      const nodeType = camelToSnake(prelude.eventName)
      let matchingFlows = this.flows.filter((flow) => flow.eventNode.nodeType === nodeType)
      if (matchingFlows.length === 0 && prelude.createFallback) {
        this.registerEvent(prelude.eventName, ServerEventMetadata, [])
        matchingFlows = [this.flows[this.flows.length - 1]]
      }
      for (const flow of matchingFlows) {
        this.prependServerEventPrelude(flow, key, prelude)
      }
    }
  }

  getFlows(): ExecutionFlow[] {
    return this.flows
  }

  getVariables() {
    return this.variables
  }

  getVariableMeta(name: string): NodeGraphVariableMeta | undefined {
    return this.variableMetaByName.get(name)
  }

  getGraphDocumentType(): 'server' | 'client' {
    return this.graphDocumentType
  }

  getGraphType(): ServerGraphSubType | ClientGraphSubType {
    return this.graphType
  }

  getGraphMode(): GraphMode {
    return this.graphMode
  }

  /**
   * 获取当前 flow 的 return gate 局部变量（不存在则创建：Get Local Variable(false)）。
   * 用于：return() 标记 + 循环 complete 处的 return gate。
   */
  getOrCreateReturnGateLocalVariable(): { localVariable: localVariable; value: bool } {
    const flow = this.currentFlow
    if (flow.returnGateLocalVariable && flow.returnGateValue) {
      return {
        localVariable: flow.returnGateLocalVariable as localVariable,
        value: flow.returnGateValue as bool
      }
    }

    const ref = this.registerNode({
      id: 0,
      type: 'data',
      nodeType: 'get_local_variable',
      args: [new bool(false)]
    })
    const lv = new localVariable()
    lv.markPin(ref, 'localVariable', 0)
    const v = new bool()
    v.markPin(ref, 'value', 1)

    flow.returnGateLocalVariable = lv
    flow.returnGateValue = v
    return { localVariable: lv, value: v }
  }

  withLoop(loopNodeId: number, fn: () => void) {
    this.loopNodeStack.push(loopNodeId)

    fn()

    this.loopNodeStack.pop()
  }

  getActiveLoopNodeIds(): number[] {
    return [...this.loopNodeStack]
  }

  getReturnCallCounter(): number {
    return this.returnCallCounter
  }
}

const serverRegistries: MetaCallRegistry[] = []
const clientRegistries: MetaCallRegistry[] = []

type ServerGraphOptionsClassic<Vars extends VariablesDefinition> = Extract<
  ServerGraphOptions<Vars>,
  { mode: 'classic' }
>

type ServerGraphOptionsBeyond<Vars extends VariablesDefinition> = Exclude<
  ServerGraphOptions<Vars>,
  { mode: 'classic' }
>

function server<Vars extends VariablesDefinition = VariablesDefinition>(
  options: ServerGraphOptionsClassic<Vars> & { lang: 'zh' }
): ServerGraphApi<Vars, 'zh', 'classic'>
function server<Vars extends VariablesDefinition = VariablesDefinition>(
  options: ServerGraphOptionsClassic<Vars>
): ServerGraphApi<Vars, 'en', 'classic'>
function server<Vars extends VariablesDefinition = VariablesDefinition>(
  options: ServerGraphOptionsBeyond<Vars> & { lang: 'zh' }
): ServerGraphApi<Vars, 'zh', 'beyond'>
function server<Vars extends VariablesDefinition = VariablesDefinition>(
  options?: ServerGraphOptionsBeyond<Vars>
): ServerGraphApi<Vars, 'en', 'beyond'>
function server<Vars extends VariablesDefinition = VariablesDefinition>(
  options?: ServerGraphOptions<Vars>
): ServerGraphApi<Vars, ServerLang, ServerGraphMode>
function server<Vars extends VariablesDefinition = VariablesDefinition>(
  options?: ServerGraphOptions<Vars>
): any {
  type ResolvedLang = ServerLang
  type ResolvedMode = ServerGraphMode
  const graphType = resolveServerGraphType(options?.type)
  const graphMode = resolveServerGraphMode(options?.mode)
  assertServerGraphModeCompatible(graphMode, graphType)
  const lang = options?.lang ?? 'en'
  const useZhAliases = lang === 'zh'
  const { variables, metaByName } = parseVariableDefinitions(options?.variables)
  const registry = new MetaCallRegistry(
    graphType,
    graphMode,
    options?.id,
    options?.name,
    options?.prefix !== false,
    variables,
    metaByName
  )
  serverRegistries.push(registry)
  const resolveEventName = (eventName: ServerEventNameAny): ServerEventName => {
    if (!useZhAliases) return eventName as ServerEventName
    return (
      (SERVER_EVENT_ZH_TO_EN as Record<string, ServerEventName>)[eventName as string] ??
      (eventName as ServerEventName)
    )
  }

  const applyZhAliases = (fns: ServerExecutionFlowFunctions) => {
    const target = fns as unknown as Record<string, unknown>
    for (const [zhName, enName] of Object.entries(SERVER_F_ZH_TO_EN)) {
      if (Object.prototype.hasOwnProperty.call(target, zhName)) continue
      const fn = (target[enName] as (...args: unknown[]) => unknown) ?? undefined
      if (typeof fn !== 'function') continue
      Object.defineProperty(target, zhName, {
        value: fn,
        writable: false,
        configurable: false,
        enumerable: false
      })
    }
  }

  const runHandler = <E extends ServerEventNameAny>(
    eventName: E,
    handler: (
      evt: ServerEventPayloadsByMode<ResolvedMode>[ServerEventNameToEn<E>],
      f: ServerExecutionFlowFunctionsForLang<Vars, ResolvedLang, ResolvedMode>,
      eventNode: MetaCallRecord
    ) => void,
    inputArgs: value[] = []
  ) => {
    const resolvedEventName = resolveEventName(eventName) as ServerEventNameToEn<E>
    const wrappedHandler = (
      evt: ServerEventPayloadsByMode<ResolvedMode>[ServerEventNameToEn<E>],
      f: ServerExecutionFlowFunctions,
      eventNode: MetaCallRecord
    ) => {
      if (useZhAliases) applyZhAliases(f)
      handler(
        evt,
        f as unknown as ServerExecutionFlowFunctionsForLang<Vars, ResolvedLang, ResolvedMode>,
        eventNode
      )
    }
    registry.runServerHandler(resolvedEventName, wrappedHandler, inputArgs)
  }

  const api = {
    on<E extends ServerEventNameAny>(
      eventName: E,
      handler: (
        evt: ServerEventPayloadsByMode<ResolvedMode>[ServerEventNameToEn<E>],
        f: ServerExecutionFlowFunctionsForLang<Vars, ResolvedLang, ResolvedMode>
      ) => void
    ) {
      runHandler(eventName, handler)
      return this
    },
    onSignal(
      signalName: string | SignalDefinition,
      handler: (
        evt: ServerEventPayloadsByMode<ResolvedMode>['monitorSignal'],
        f: ServerExecutionFlowFunctionsForLang<Vars, ResolvedLang, ResolvedMode>
      ) => void
    ) {
      const signalInfo = resolveSignalInput(signalName)
      const signalNameObj = ensureLiteralStr(signalInfo.name, 'signalName')
      const wrappedHandler = signalInfo.typed
        ? (
            evt: ServerEventPayloadsByMode<ResolvedMode>['monitorSignal'],
            f: ServerExecutionFlowFunctionsForLang<Vars, ResolvedLang, ResolvedMode>,
            eventNode: MetaCallRecord
          ) => {
            const params: Record<string, unknown> = {}
            signalInfo.params.forEach(([paramName, paramType], i) => {
              const paramValue = new generic()
              paramValue.markPin(eventNode, paramName, 3 + i)
              params[paramName] = asSignalParamValue(paramValue, paramType)
            })
            ;(evt as any).params = params
            handler(evt, f)
          }
        : handler
      runHandler('monitorSignal', wrappedHandler, [signalNameObj])
      return this
    }
  }
  return api as ServerGraphApi<Vars, ResolvedLang, ResolvedMode>
}

type ClientStartApi<
  T extends ClientGraphSubType,
  Lang extends ClientLang = 'en',
  Mode extends ClientGraphMode = 'beyond'
> = Mode extends ClientGraphMode
  ? ClientStartGraphApi<
      ClientFlowFunctionClassForLang<T, Lang, Mode>,
      Lang,
      Mode,
      ClientStartEventNameForSubType<T>
    >
  : never
type ClientBoolFilterApi<
  Lang extends ClientLang = 'en',
  Mode extends ClientGraphMode = 'beyond'
> = Mode extends ClientGraphMode
  ? ClientFilterGraphApi<
      ClientFlowFunctionClassForLang<'bool_filter', Lang, Mode>,
      boolean | bool,
      Lang,
      Mode
    >
  : never
type ClientIntFilterApi<
  Lang extends ClientLang = 'en',
  Mode extends ClientGraphMode = 'beyond'
> = Mode extends ClientGraphMode
  ? ClientFilterGraphApi<
      ClientFlowFunctionClassForLang<'int_filter', Lang, Mode>,
      bigint | number | int,
      Lang,
      Mode
    >
  : never

type ClientGraphOptionsInput = ClientGraphOptions<ClientGraphMode>
type ClientFilterGraphOptionsInput = ClientFilterGraphOptions<ClientGraphMode>
type ClientRuntimeStartEventName = ClientStartEventName | ClientOrderedStartEventName

type ResolvedClientLang<Options> = Options extends { lang: infer Lang extends ClientLang }
  ? Lang
  : 'en'

type ResolvedClientMode<Options> = Options extends { mode: infer Mode extends ClientGraphMode }
  ? Mode
  : 'beyond'

type ClientGraphApiForSubType<
  T extends ClientGraphSubType,
  Lang extends ClientLang,
  Mode extends ClientGraphMode
> = T extends 'bool_filter'
  ? ClientBoolFilterApi<Lang, Mode>
  : T extends 'int_filter'
    ? ClientIntFilterApi<Lang, Mode>
    : ClientStartApi<T, Lang, Mode>

type ClientGraphApiForOptions<T extends ClientGraphSubType, Options> = ClientGraphApiForSubType<
  T,
  ResolvedClientLang<Options>,
  ResolvedClientMode<Options>
>

function createClientGraphApi<T extends ClientGraphSubType>(
  subType: T
): ClientGraphApiForSubType<T, 'en', 'beyond'>
function createClientGraphApi<
  T extends ClientGraphSubType,
  Options extends ClientFilterGraphOptionsInput
>(subType: T, options: Options): ClientGraphApiForOptions<T, Options>
function createClientGraphApi<T extends ClientGraphSubType>(
  subType: T,
  options?: ClientFilterGraphOptionsInput
): ClientGraphApiForSubType<T, ClientLang, ClientGraphMode> {
  const graphType = assertClientGraphSubType(subType)
  const graphMode = assertClientGraphMode(options?.mode)
  assertClientGraphModeCompatible(graphType, graphMode)
  const isFilter = graphType === 'bool_filter' || graphType === 'int_filter'
  const clientEvaluationInterval = isFilter
    ? (options?.evaluationInterval ?? CLIENT_FILTER_DEFAULT_EVALUATION_INTERVAL)
    : undefined
  if (
    clientEvaluationInterval !== undefined &&
    (!Number.isFinite(clientEvaluationInterval) || clientEvaluationInterval < 0)
  ) {
    throw clientNodegraphError(
      CLIENT_ERROR_CODES.NODE_SYNTAX_UNAVAILABLE,
      `filter evaluationInterval must be a finite non-negative number, got ${String(clientEvaluationInterval)}`
    )
  }
  const registry = new MetaCallRegistry(
    graphType,
    graphMode,
    options?.id,
    options?.name,
    options?.prefix !== false,
    [],
    new Map(),
    'client',
    clientEvaluationInterval
  )
  clientRegistries.push(registry)
  const entrySpec = CLIENT_GRAPH_ENTRY_SPEC_BY_SUB_TYPE[graphType]
  const fns = createClientFlowFunctions(graphType, registry)
  registerClientEntityHelperContext(fns, graphType, graphMode)
  if (options?.lang === 'zh') applyClientFlowFunctionZhAliases(graphType, graphMode, fns)
  const registeredEvents = new Set<string>()
  const usesOrderedStart =
    graphType === 'creation_status' || graphType === 'creation_status_decision'

  const api = {
    on(
      eventName: ClientRuntimeStartEventName,
      handler: (evt: ClientStartEvent, f: typeof fns) => unknown
    ) {
      let sourceIndex = 0
      if (usesOrderedStart) {
        const match = /^start([1-9]|10)$/.exec(eventName)
        if (!match) {
          throw clientNodegraphError(
            CLIENT_ERROR_CODES.NODE_SYNTAX_UNAVAILABLE,
            `client ${graphType} uses start1...start10 for the ordered-exclusive entry pins; got ${eventName}`
          )
        }
        sourceIndex = Number(match[1]) - 1
      } else if (eventName !== entrySpec.event) {
        throw clientNodegraphError(
          CLIENT_ERROR_CODES.NODE_SYNTAX_UNAVAILABLE,
          `unsupported client event: ${eventName}`
        )
      }
      if (registeredEvents.has(eventName)) {
        throw clientNodegraphError(
          CLIENT_ERROR_CODES.NODE_SYNTAX_UNAVAILABLE,
          `client ${graphType} graph may only register one ${eventName} handler`
        )
      }
      if (!usesOrderedStart && registeredEvents.size > 0) {
        throw clientNodegraphError(
          CLIENT_ERROR_CODES.NODE_SYNTAX_UNAVAILABLE,
          `client ${graphType} graph may only register one ${entrySpec.event} handler`
        )
      }
      registeredEvents.add(eventName)

      if (graphType === 'bool_filter') {
        registry.runClientStartHandler(
          entrySpec.startNodeType,
          handler as (evt: ClientStartEvent, f: typeof fns) => boolean | bool,
          fns,
          normalizeClientBoolFilterReturn,
          CLIENT_FILTER_END_NODE_TYPES.bool_filter
        )
      } else if (graphType === 'int_filter') {
        registry.runClientStartHandler(
          entrySpec.startNodeType,
          handler as (evt: ClientStartEvent, f: typeof fns) => bigint | number | int,
          fns,
          normalizeClientIntFilterReturn,
          CLIENT_FILTER_END_NODE_TYPES.int_filter
        )
      } else {
        registry.runClientStartHandler(
          entrySpec.startNodeType,
          handler,
          fns,
          undefined,
          undefined,
          usesOrderedStart ? { sourceIndex, reuseStartNode: true } : undefined
        )
      }
      return this
    }
  }
  return api as unknown as ClientGraphApiForSubType<T, ClientLang, ClientGraphMode>
}

/** Register a character-skill client graph with the default options. / 使用默认配置注册角色技能客户端节点图。 */
function characterSkill(): ClientStartApi<'character_skill', 'en', 'beyond'>
/**
 * Register a character-skill client graph. / 注册角色技能客户端节点图。
 *
 * @param options Client graph options. / 客户端节点图配置。
 * @param options.id Target NodeGraph ID; defaults to `1082130433`. / 目标节点图 ID；默认 `1082130433`。
 * @param options.name Editor display name; defaults to the entry filename. / 编辑器显示名称；默认使用入口文件名。
 * @param options.prefix Whether to add the `_GSTS_` prefix; defaults to `true`. / 是否添加 `_GSTS_` 前缀；默认 `true`。
 * @param options.mode Graph mode; character skills currently support only `'beyond'`. / 节点图模式；角色技能目前仅支持 `'beyond'`。
 * @param options.lang API language; `'zh'` enables Chinese f-function aliases, defaults to `'en'`. / API 语言；`'zh'` 启用中文 f 函数别名，默认 `'en'`。
 */
function characterSkill<Options extends ClientGraphOptionsForSubType<'character_skill'>>(
  options: Options & ClientGraphOptionsForSubType<'character_skill'>
): ClientGraphApiForOptions<'character_skill', Options>
function characterSkill(
  options?: ClientGraphOptionsInput
): ClientStartApi<'character_skill', ClientLang, ClientGraphMode> {
  return options === undefined
    ? createClientGraphApi('character_skill')
    : createClientGraphApi('character_skill', options)
}

/** Register a character-control-skill client graph with the default options. / 使用默认配置注册角色控制技能客户端节点图。 */
function characterControlSkill(): ClientStartApi<'character_control_skill', 'en', 'beyond'>
/**
 * Register a character-control-skill client graph. / 注册角色控制技能客户端节点图。
 *
 * @param options Client graph options. / 客户端节点图配置。
 * @param options.id Target NodeGraph ID; defaults to `1082130433`. / 目标节点图 ID；默认 `1082130433`。
 * @param options.name Editor display name; defaults to the entry filename. / 编辑器显示名称；默认使用入口文件名。
 * @param options.prefix Whether to add the `_GSTS_` prefix; defaults to `true`. / 是否添加 `_GSTS_` 前缀；默认 `true`。
 * @param options.mode Graph mode; character control skills currently support only `'beyond'`. / 节点图模式；角色控制技能目前仅支持 `'beyond'`。
 * @param options.lang API language; `'zh'` enables Chinese f-function aliases, defaults to `'en'`. / API 语言；`'zh'` 启用中文 f 函数别名，默认 `'en'`。
 */
function characterControlSkill<
  Options extends ClientGraphOptionsForSubType<'character_control_skill'>
>(
  options: Options & ClientGraphOptionsForSubType<'character_control_skill'>
): ClientGraphApiForOptions<'character_control_skill', Options>
function characterControlSkill(
  options?: ClientGraphOptionsInput
): ClientStartApi<'character_control_skill', ClientLang, ClientGraphMode> {
  return options === undefined
    ? createClientGraphApi('character_control_skill')
    : createClientGraphApi('character_control_skill', options)
}

/** Register a creation-skill client graph with the default options. / 使用默认配置注册造物技能客户端节点图。 */
function creationSkill(): ClientStartApi<'creation_skill', 'en', 'beyond'>
/**
 * Register a creation-skill client graph. / 注册造物技能客户端节点图。
 *
 * @param options Client graph options. / 客户端节点图配置。
 * @param options.id Target NodeGraph ID; defaults to `1082130433`. / 目标节点图 ID；默认 `1082130433`。
 * @param options.name Editor display name; defaults to the entry filename. / 编辑器显示名称；默认使用入口文件名。
 * @param options.prefix Whether to add the `_GSTS_` prefix; defaults to `true`. / 是否添加 `_GSTS_` 前缀；默认 `true`。
 * @param options.mode Graph mode (`'beyond'` by default, or `'classic'`). / 节点图模式（默认 `'beyond'`，也可使用 `'classic'`）。
 * @param options.lang API language; `'zh'` enables Chinese f-function aliases, defaults to `'en'`. / API 语言；`'zh'` 启用中文 f 函数别名，默认 `'en'`。
 */
function creationSkill<Options extends ClientGraphOptionsForSubType<'creation_skill'>>(
  options: Options & ClientGraphOptionsForSubType<'creation_skill'>
): ClientGraphApiForOptions<'creation_skill', Options>
function creationSkill(
  options?: ClientGraphOptionsInput
): ClientStartApi<'creation_skill', ClientLang, ClientGraphMode> {
  return options === undefined
    ? createClientGraphApi('creation_skill')
    : createClientGraphApi('creation_skill', options)
}

/**
 * Register a creation-status client graph with the default options.
 *
 * GSTS Note: `start1`…`start10` map to the editor's ordered-exclusive output pins 1…10 and
 * execute in pin order. They only split and organize code; they do not represent switchable
 * behavior states. Writing the same statements sequentially in one `start1` handler produces
 * the same behavior.
 *
 * GSTS Note: In one status graph, connect different conditions to each action's [Execute] input
 * to control attack, target acquisition, and other logic. Alternatively, split different
 * behaviors into separate status graphs and let a Creation Status Decision graph select the
 * required status graph.
 *
 * GSTS Note: Although action calls are written as sequential TypeScript statements, the next
 * statement is not executed unconditionally. It is connected to the preceding action's [Failure]
 * output and runs only if that action fails. For example, a statement after `executeSkill` runs
 * when the skill cannot execute because it is on cooldown, but not when the skill succeeds or
 * remains active.
 *
 * 使用默认配置注册造物状态客户端节点图。
 *
 * GSTS 注: `start1`…`start10` 分别对应编辑器【按顺序唯一执行】的 1…10 号执行引脚，
 * 并按引脚顺序执行。这些入口仅用于拆分和组织代码，不表示可切换的行为状态。
 * 将相同语句全部写在单一 `start1` 中按顺序串联，也能得到相同效果。
 *
 * GSTS 注: 可以在一个造物状态图中，把不同条件连接到各行为节点的【是否执行】参数，
 * 控制造物的攻击、索敌等不同逻辑；也可以把不同行为拆分到不同的造物状态图，
 * 再由造物状态决策图选择需要执行的状态图。
 *
 * GSTS 注: 这是一个容易误解的特殊行为：虽然 TypeScript 代码按顺序书写，但下一条
 * 语句并不是无条件执行，而是连接到前一个行为节点的【失败执行】引脚；只有前面的行为
 * 执行失败，才会执行后面的语句。例如技能处于 CD 导致 `executeSkill` 失败时才会继续，
 * 技能成功或仍在执行时不会继续。
 *
 * @example
 * g.creationStatus().on('start1', (_evt, f) => {
 *   f.executeSkill(f.checkTheHorizontalDistanceFromSelfToTarget() < 1.5, 1n)
 *   f.tacticMoveToTheTargetEntity(
 *     f.checkTheHorizontalDistanceFromSelfToTarget() >= 1.5,
 *     f.getTargetEntity(),
 *     1,
 *     TacticSpeed.Run,
 *     360,
 *     'pursuit',
 *     false
 *   )
 * })
 */
function creationStatus(): ClientStartApi<'creation_status', 'en', 'beyond'>
/**
 * Register a creation-status client graph. / 注册造物状态客户端节点图。
 *
 * GSTS Note: `start1`…`start10` map to the editor's ordered-exclusive output pins 1…10 and
 * execute in pin order. They only split and organize code; they do not represent switchable
 * behavior states. Writing the same statements sequentially in one `start1` handler produces
 * the same behavior.
 *
 * GSTS Note: In one status graph, connect different conditions to each action's [Execute] input
 * to control attack, target acquisition, and other logic. Alternatively, split different
 * behaviors into separate status graphs and let a Creation Status Decision graph select the
 * required status graph.
 *
 * GSTS Note: Although action calls are written as sequential TypeScript statements, the next
 * statement is not executed unconditionally. It is connected to the preceding action's [Failure]
 * output and runs only if that action fails. For example, a statement after `executeSkill` runs
 * when the skill cannot execute because it is on cooldown, but not when the skill succeeds or
 * remains active.
 *
 * GSTS 注: `start1`…`start10` 分别对应编辑器【按顺序唯一执行】的 1…10 号执行引脚，
 * 并按引脚顺序执行。这些入口仅用于拆分和组织代码，不表示可切换的行为状态。
 * 将相同语句全部写在单一 `start1` 中按顺序串联，也能得到相同效果。
 *
 * GSTS 注: 可以在一个造物状态图中，把不同条件连接到各行为节点的【是否执行】参数，
 * 控制造物的攻击、索敌等不同逻辑；也可以把不同行为拆分到不同的造物状态图，
 * 再由造物状态决策图选择需要执行的状态图。
 *
 * GSTS 注: 这是一个容易误解的特殊行为：虽然 TypeScript 代码按顺序书写，但下一条
 * 语句并不是无条件执行，而是连接到前一个行为节点的【失败执行】引脚；只有前面的行为
 * 执行失败，才会执行后面的语句。例如技能处于 CD 导致 `executeSkill` 失败时才会继续，
 * 技能成功或仍在执行时不会继续。
 *
 * @example
 * g.creationStatus({ id: CREATION_STATUS_GRAPH_ID }).on('start1', (_evt, f) => {
 *   f.executeSkill(f.checkTheHorizontalDistanceFromSelfToTarget() < 1.5, 1n)
 *   f.tacticMoveToTheTargetEntity(
 *     f.checkTheHorizontalDistanceFromSelfToTarget() >= 1.5,
 *     f.getTargetEntity(),
 *     1,
 *     TacticSpeed.Run,
 *     360,
 *     'pursuit',
 *     false
 *   )
 * })
 *
 * @param options Client graph options. / 客户端节点图配置。
 * @param options.id Target NodeGraph ID; defaults to `1082130433`. / 目标节点图 ID；默认 `1082130433`。
 * @param options.name Editor display name; defaults to the entry filename. / 编辑器显示名称；默认使用入口文件名。
 * @param options.prefix Whether to add the `_GSTS_` prefix; defaults to `true`. / 是否添加 `_GSTS_` 前缀；默认 `true`。
 * @param options.mode Graph mode (`'beyond'` by default, or `'classic'`). / 节点图模式（默认 `'beyond'`，也可使用 `'classic'`）。
 * @param options.lang API language; `'zh'` enables Chinese f-function aliases, defaults to `'en'`. / API 语言；`'zh'` 启用中文 f 函数别名，默认 `'en'`。
 */
function creationStatus<Options extends ClientGraphOptionsForSubType<'creation_status'>>(
  options: Options & ClientGraphOptionsForSubType<'creation_status'>
): ClientGraphApiForOptions<'creation_status', Options>
function creationStatus(
  options?: ClientGraphOptionsInput
): ClientStartApi<'creation_status', ClientLang, ClientGraphMode> {
  return options === undefined
    ? createClientGraphApi('creation_status')
    : createClientGraphApi('creation_status', options)
}

/**
 * Register a creation-status-decision client graph with the default options.
 *
 * GSTS Note: `start1`…`start10` map to the editor's ordered-exclusive output pins 1…10 and
 * execute in pin order. They only split and organize code; they do not represent switchable
 * behavior states. Writing the same statements sequentially in one `start1` handler produces
 * the same behavior.
 *
 * GSTS Note: The Autonomous Logic Parameter ID of `switchToSelfExecutionStatus` is used only to
 * switch an autonomous-logic configuration defined in the Creation Properties panel, such as
 * combat-entry perception, leaving combat, or territory settings.
 *
 * GSTS Note: To switch between attack, target acquisition, or other behaviors with a decision
 * graph, place those behaviors in separate Creation Status graphs and pass different Status
 * Node Graph Configuration IDs. Within one status graph, conditions can instead be connected
 * directly to each action's [Execute] input.
 *
 * GSTS Note: Sequential action statements also use [Failure] outputs. Although they are written
 * in order, the following statement is not executed unconditionally and runs only if the
 * preceding action fails.
 *
 * 使用默认配置注册造物状态决策客户端节点图。
 *
 * GSTS 注: `start1`…`start10` 分别对应编辑器【按顺序唯一执行】的 1…10 号执行引脚，
 * 并按引脚顺序执行。这些入口仅用于拆分和组织代码，不表示可切换的行为状态。
 * 将相同语句全部写在单一 `start1` 中按顺序串联，也能得到相同效果。
 *
 * GSTS 注: `switchToSelfExecutionStatus` 的【自主逻辑参数序号】仅用于切换
 * 造物属性面板中配置的自主逻辑，例如入战感知、脱战、领地设置。
 *
 * GSTS 注: 若要用状态决策图在攻击、索敌等逻辑之间切换，应将这些行为拆分到不同的
 * 造物状态图，并传入不同的【状态节点图配置 ID】。若只使用一个状态图，也可以直接
 * 把不同条件连接到各行为节点的【是否执行】参数。
 *
 * GSTS 注: 顺序行为语句同样连接【失败执行】引脚。虽然 TypeScript 代码按顺序书写，
 * 但下一条语句并不是无条件执行；只有前面的行为执行失败，才会执行后面的语句。
 *
 * @example
 * g.creationStatusDecision().on('start1', (_evt, f) => {
 *   if (f.checkTheHorizontalDistanceFromSelfToTarget() < 1.5) {
 *     f.switchToSelfExecutionStatus(
 *       true,
 *       ATTACK_STATUS_GRAPH_ID,
 *       1
 *     )
 *   } else {
 *     f.switchToSelfExecutionStatus(
 *       true,
 *       TARGET_ACQUISITION_STATUS_GRAPH_ID,
 *       1
 *     )
 *   }
 * })
 */
function creationStatusDecision(): ClientStartApi<'creation_status_decision', 'en', 'beyond'>
/**
 * Register a creation-status-decision client graph. / 注册造物状态决策客户端节点图。
 *
 * GSTS Note: `start1`…`start10` map to the editor's ordered-exclusive output pins 1…10 and
 * execute in pin order. They only split and organize code; they do not represent switchable
 * behavior states. Writing the same statements sequentially in one `start1` handler produces
 * the same behavior.
 *
 * GSTS Note: The Autonomous Logic Parameter ID of `switchToSelfExecutionStatus` is used only to
 * switch an autonomous-logic configuration defined in the Creation Properties panel, such as
 * combat-entry perception, leaving combat, or territory settings.
 *
 * GSTS Note: To switch between attack, target acquisition, or other behaviors with a decision
 * graph, place those behaviors in separate Creation Status graphs and pass different Status
 * Node Graph Configuration IDs. Within one status graph, conditions can instead be connected
 * directly to each action's [Execute] input.
 *
 * GSTS Note: Sequential action statements also use [Failure] outputs. Although they are written
 * in order, the following statement is not executed unconditionally and runs only if the
 * preceding action fails.
 *
 * GSTS 注: `start1`…`start10` 分别对应编辑器【按顺序唯一执行】的 1…10 号执行引脚，
 * 并按引脚顺序执行。这些入口仅用于拆分和组织代码，不表示可切换的行为状态。
 * 将相同语句全部写在单一 `start1` 中按顺序串联，也能得到相同效果。
 *
 * GSTS 注: `switchToSelfExecutionStatus` 的【自主逻辑参数序号】仅用于切换
 * 造物属性面板中配置的自主逻辑，例如入战感知、脱战、领地设置。
 *
 * GSTS 注: 若要用状态决策图在攻击、索敌等逻辑之间切换，应将这些行为拆分到不同的
 * 造物状态图，并传入不同的【状态节点图配置 ID】。若只使用一个状态图，也可以直接
 * 把不同条件连接到各行为节点的【是否执行】参数。
 *
 * GSTS 注: 顺序行为语句同样连接【失败执行】引脚。虽然 TypeScript 代码按顺序书写，
 * 但下一条语句并不是无条件执行；只有前面的行为执行失败，才会执行后面的语句。
 *
 * @example
 * g.creationStatusDecision({ id: CREATION_STATUS_DECISION_GRAPH_ID }).on('start1', (_evt, f) => {
 *   if (f.checkTheHorizontalDistanceFromSelfToTarget() < 1.5) {
 *     f.switchToSelfExecutionStatus(
 *       true,
 *       ATTACK_STATUS_GRAPH_ID,
 *       1
 *     )
 *   } else {
 *     f.switchToSelfExecutionStatus(
 *       true,
 *       TARGET_ACQUISITION_STATUS_GRAPH_ID,
 *       1
 *     )
 *   }
 * })
 *
 * @param options Client graph options. / 客户端节点图配置。
 * @param options.id Target NodeGraph ID; defaults to `1082130433`. / 目标节点图 ID；默认 `1082130433`。
 * @param options.name Editor display name; defaults to the entry filename. / 编辑器显示名称；默认使用入口文件名。
 * @param options.prefix Whether to add the `_GSTS_` prefix; defaults to `true`. / 是否添加 `_GSTS_` 前缀；默认 `true`。
 * @param options.mode Graph mode (`'beyond'` by default, or `'classic'`). / 节点图模式（默认 `'beyond'`，也可使用 `'classic'`）。
 * @param options.lang API language; `'zh'` enables Chinese f-function aliases, defaults to `'en'`. / API 语言；`'zh'` 启用中文 f 函数别名，默认 `'en'`。
 */
function creationStatusDecision<
  Options extends ClientGraphOptionsForSubType<'creation_status_decision'>
>(
  options: Options & ClientGraphOptionsForSubType<'creation_status_decision'>
): ClientGraphApiForOptions<'creation_status_decision', Options>
function creationStatusDecision(
  options?: ClientGraphOptionsInput
): ClientStartApi<'creation_status_decision', ClientLang, ClientGraphMode> {
  return options === undefined
    ? createClientGraphApi('creation_status_decision')
    : createClientGraphApi('creation_status_decision', options)
}

/** Register a bool-filter client graph with the default options. / 使用默认配置注册布尔过滤器客户端节点图。 */
function boolFilter(): ClientBoolFilterApi<'en', 'beyond'>
/**
 * Register a bool-filter client graph. / 注册布尔过滤器客户端节点图。
 *
 * @param options Client filter graph options. / 客户端过滤器节点图配置。
 * @param options.id Target NodeGraph ID; defaults to `1082130433`. / 目标节点图 ID；默认 `1082130433`。
 * @param options.name Editor display name; defaults to the entry filename. / 编辑器显示名称；默认使用入口文件名。
 * @param options.prefix Whether to add the `_GSTS_` prefix; defaults to `true`. / 是否添加 `_GSTS_` 前缀；默认 `true`。
 * @param options.mode Graph mode (`'beyond'` by default, or `'classic'`). / 节点图模式（默认 `'beyond'`，也可使用 `'classic'`）。
 * @param options.lang API language; `'zh'` enables Chinese f-function aliases, defaults to `'en'`. / API 语言；`'zh'` 启用中文 f 函数别名，默认 `'en'`。
 * @param options.evaluationInterval Evaluation interval in seconds; defaults to `0.3`. / 执行时间间隔（秒）；默认 `0.3`。
 */
function boolFilter<Options extends ClientFilterGraphOptionsForSubType<'bool_filter'>>(
  options: Options & ClientFilterGraphOptionsForSubType<'bool_filter'>
): ClientGraphApiForOptions<'bool_filter', Options>
function boolFilter(
  options?: ClientFilterGraphOptionsInput
): ClientBoolFilterApi<ClientLang, ClientGraphMode> {
  return options === undefined
    ? createClientGraphApi('bool_filter')
    : createClientGraphApi('bool_filter', options)
}

/** Register an int-filter client graph with the default options. / 使用默认配置注册整数过滤器客户端节点图。 */
function intFilter(): ClientIntFilterApi<'en', 'beyond'>
/**
 * Register an int-filter client graph. / 注册整数过滤器客户端节点图。
 *
 * @param options Client filter graph options. / 客户端过滤器节点图配置。
 * @param options.id Target NodeGraph ID; defaults to `1082130433`. / 目标节点图 ID；默认 `1082130433`。
 * @param options.name Editor display name; defaults to the entry filename. / 编辑器显示名称；默认使用入口文件名。
 * @param options.prefix Whether to add the `_GSTS_` prefix; defaults to `true`. / 是否添加 `_GSTS_` 前缀；默认 `true`。
 * @param options.mode Graph mode (`'beyond'` by default, or `'classic'`). / 节点图模式（默认 `'beyond'`，也可使用 `'classic'`）。
 * @param options.lang API language; `'zh'` enables Chinese f-function aliases, defaults to `'en'`. / API 语言；`'zh'` 启用中文 f 函数别名，默认 `'en'`。
 * @param options.evaluationInterval Evaluation interval in seconds; defaults to `0.3`. / 执行时间间隔（秒）；默认 `0.3`。
 */
function intFilter<Options extends ClientFilterGraphOptionsForSubType<'int_filter'>>(
  options: Options & ClientFilterGraphOptionsForSubType<'int_filter'>
): ClientGraphApiForOptions<'int_filter', Options>
function intFilter(
  options?: ClientFilterGraphOptionsInput
): ClientIntFilterApi<ClientLang, ClientGraphMode> {
  return options === undefined
    ? createClientGraphApi('int_filter')
    : createClientGraphApi('int_filter', options)
}

export const g = {
  server,
  characterSkill,
  characterControlSkill,
  creationSkill,
  creationStatus,
  creationStatusDecision,
  boolFilter,
  intFilter
}

export function printServerGraphRegistries() {
  console.log(JSON.stringify(serverRegistries, null, 2))
}

function removeUnusedNodesFromFlow(flow: ExecutionFlow): ExecutionFlow | null {
  const execById = new Map<number, MetaCallRecord>()
  const dataById = new Map<number, MetaCallRecord>()
  flow.execNodes.forEach((n) => execById.set(n.id, n))
  flow.dataNodes.forEach((n) => dataById.set(n.id, n))

  const reachableExecIds = new Set<number>()
  const visited = new Set<number>([flow.eventNode.id])
  const queue: number[] = [flow.eventNode.id]

  while (queue.length) {
    const current = queue.shift()!
    const nextList = flow.edges[current] ?? []
    nextList.forEach((conn) => {
      const targetId = typeof conn === 'number' ? conn : conn.node_id
      if (!visited.has(targetId)) {
        visited.add(targetId)
        queue.push(targetId)
      }
      if (execById.has(targetId)) reachableExecIds.add(targetId)
    })
  }

  if (reachableExecIds.size === 0) {
    return null
  }

  const usedDataIds = new Set<number>()
  const dataQueue: number[] = []
  const enqueueData = (id: number) => {
    if (usedDataIds.has(id)) return
    usedDataIds.add(id)
    dataQueue.push(id)
  }

  const collectDataDeps = (record: MetaCallRecord) => {
    for (const arg of record.args) {
      const meta = arg.getMetadata()
      if (!meta || meta.kind !== 'pin') continue
      const depId = meta.record.id
      if (dataById.has(depId)) enqueueData(depId)
    }
  }

  reachableExecIds.forEach((id) => {
    const record = execById.get(id)
    if (record) collectDataDeps(record)
  })

  while (dataQueue.length) {
    const id = dataQueue.shift()!
    const record = dataById.get(id)
    if (record) collectDataDeps(record)
  }

  const filteredExecNodes = flow.execNodes.filter((n) => reachableExecIds.has(n.id))
  const filteredDataNodes = flow.dataNodes.filter((n) => usedDataIds.has(n.id))
  const allowedFromIds = new Set<number>([flow.eventNode.id, ...reachableExecIds])
  const filteredEdges: typeof flow.edges = {}

  for (const [fromIdRaw, nextList] of Object.entries(flow.edges)) {
    const fromId = Number(fromIdRaw)
    if (!allowedFromIds.has(fromId)) continue
    const filteredNext = nextList.filter((conn) =>
      reachableExecIds.has(typeof conn === 'number' ? conn : conn.node_id)
    )
    if (filteredNext.length) filteredEdges[fromId] = filteredNext
  }

  return {
    ...flow,
    execNodes: filteredExecNodes,
    dataNodes: filteredDataNodes,
    edges: filteredEdges
  }
}

export function buildServerGraphRegistriesIRDocuments(opts: IRBuildOptions = {}) {
  const removeUnusedNodes = getRuntimeOptions().optimize.removeUnusedNodes
  const foldConstants = getRuntimeOptions().optimize.precompileExpression
  const prefixName = (raw: string, enable: boolean) => {
    if (!enable) return raw
    if (raw.startsWith('_GSTS')) return raw
    return `_GSTS_${raw}`
  }

  const resolveName = (registry: MetaCallRegistry): string | undefined => {
    const raw = registry.getGraphName()
    if (typeof raw === 'string' && raw.length) return prefixName(raw, registry.shouldPrefixName())
    const def = opts.defaultName
    if (typeof def === 'string' && def.length) return prefixName(def, registry.shouldPrefixName())
    return '_GSTS_Generated_Graph'
  }

  const list = serverRegistries.map((registry) => {
    registry.finalizeServerFlows()
    const flows = registry.getFlows()
    const optimizedFlows = removeUnusedNodes
      ? flows
          .map((flow) =>
            removeUnusedNodesFromFlow(foldConstants ? foldLiteralBranches(flow) : flow)
          )
          .filter((flow) => flow !== null)
      : flows
    return buildIRDocument({
      flows: optimizedFlows,
      variables: registry.getVariables(),
      serverSubType: registry.getGraphType() as ServerGraphSubType,
      serverMode: registry.getGraphMode() as ServerGraphMode,
      graphId: registry.getGraphId(),
      graphName: resolveName(registry)
    })
  })
  return list
}

function assertUniqueClientGraphIds(docs: IRDocument[]) {
  const ids = new Set<number>()
  for (const doc of docs) {
    const id = resolveGraphIdForGraph(doc.graph)
    if (ids.has(id)) {
      throw new Error(`[error] client graph id may only be declared once: id=${id}`)
    }
    ids.add(id)
  }
}

export function buildClientGraphRegistriesIRDocuments(opts: IRBuildOptions = {}) {
  const removeUnusedNodes = getRuntimeOptions().optimize.removeUnusedNodes
  const prefixName = (raw: string, enable: boolean) => {
    if (!enable) return raw
    if (raw.startsWith('_GSTS')) return raw
    return `_GSTS_${raw}`
  }

  const resolveName = (registry: MetaCallRegistry): string | undefined => {
    const raw = registry.getGraphName()
    if (typeof raw === 'string' && raw.length) return prefixName(raw, registry.shouldPrefixName())
    const def = opts.defaultName
    if (typeof def === 'string' && def.length) return prefixName(def, registry.shouldPrefixName())
    return '_GSTS_Generated_Client_Graph'
  }

  const docs = clientRegistries.map((registry) => {
    const flows = registry.getFlows()
    const optimizedFlows = removeUnusedNodes
      ? flows.map(removeUnusedNodesFromFlow).filter((flow) => flow !== null)
      : flows
    return buildIRDocument({
      flows: optimizedFlows,
      variables: registry.getVariables(),
      clientSubType: registry.getGraphType() as ClientGraphSubType,
      clientMode: registry.getGraphMode() as ClientGraphMode,
      clientEvaluationInterval: registry.getClientEvaluationInterval(),
      graphId: registry.getGraphId(),
      graphName: resolveName(registry)
    })
  })
  assertUniqueClientGraphIds(docs)
  return docs
}

function assertNoServerClientGraphIdCollisions(docs: IRDocument[]) {
  const typeById = new Map<number, 'server' | 'client'>()
  for (const doc of docs) {
    const id = resolveGraphIdForGraph(doc.graph)
    const existingType = typeById.get(id)
    if (existingType && existingType !== doc.graph.type) {
      throw new Error(
        `[error] server/client graph id cannot be duplicated: id=${id}, ${existingType} vs ${doc.graph.type}`
      )
    }
    typeById.set(id, doc.graph.type)
  }
}

export function buildAllGraphRegistriesIRDocuments(opts: IRBuildOptions = {}) {
  const docs = [
    ...buildServerGraphRegistriesIRDocuments(opts),
    ...buildClientGraphRegistriesIRDocuments(opts)
  ]
  assertNoServerClientGraphIdCollisions(docs)
  return docs
}
