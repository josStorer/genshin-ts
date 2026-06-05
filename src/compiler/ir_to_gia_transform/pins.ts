import { Pin } from '../gia_vendor.js'
import { GiaNode } from './index.js'
import { parseEnumValue } from './mappings.js'

type BasicValue = number | string | boolean | [number, number, number]

type BaseTag = 'Bol' | 'Int' | 'Flt' | 'Str' | 'Vec' | 'Gid' | 'Ety' | 'Fct' | 'Cfg' | 'Pfb'
const CLIENT_EXEC_PIN_KIND = 5

function pinKind(p: Pin | undefined): number | undefined {
  if (!p) return undefined
  // @ts-ignore 强制访问私有变量
  return p.kind
}

function getPinIndex(p: Pin | undefined): number | undefined {
  if (!p) return undefined
  // @ts-ignore 强制访问私有变量
  return p.index
}

function toVendorBaseTag(argType: string): BaseTag | null {
  switch (argType) {
    case 'bool':
      return 'Bol'
    case 'int':
      return 'Int'
    case 'float':
      return 'Flt'
    case 'str':
      return 'Str'
    case 'vec3':
      return 'Vec'
    case 'guid':
      return 'Gid'
    case 'entity':
      return 'Ety'
    case 'faction':
      return 'Fct'
    case 'config_id':
      return 'Cfg'
    case 'prefab_id':
      return 'Pfb'
    default:
      return null
  }
}

function ensureInputPin(node: GiaNode, pinIndex: number): Pin {
  const existing = node.pins?.find((pin) => pinKind(pin) === 3 && pinIndex === getPinIndex(pin))
  if (existing) return existing

  const p = new Pin(node.ConcreteId!, 3, pinIndex)
  node.pins.push(p)
  return p
}

function ensureClientExecPin(node: GiaNode, pinIndex: number): Pin {
  const existing = node.pins?.find(
    (pin) => pinKind(pin) === CLIENT_EXEC_PIN_KIND && pinIndex === getPinIndex(pin)
  )
  if (existing) return existing

  const p = new Pin(node.GenericId, CLIENT_EXEC_PIN_KIND, pinIndex)
  node.pins.push(p)
  return p
}

export function setEnumArgValue(
  giaNode: GiaNode,
  pinIndex: number,
  argIndex: number,
  nodeType: string,
  value: string
) {
  const pin = ensureInputPin(giaNode, pinIndex)
  const { enumId, enumValue } = parseEnumValue(value, argIndex, nodeType)
  pin.setType({ t: 'e', e: enumId })
  pin.setVal(enumValue)
}

export function setLiteralArgValue(
  giaNode: GiaNode,
  pinIndex: number,
  argIndex: number,
  nodeType: string,
  argType: string,
  value: unknown
) {
  if (argType.endsWith('_list') && value == null) {
    return
  }
  if (argType === 'dict' && value == null) {
    return
  }
  if (argType === 'entity' && value === null && nodeType === 'get_local_variable') {
    const pin = ensureInputPin(giaNode, pinIndex)
    pin.setType({ t: 'b', b: 'Ety' })
    return
  }
  if (argType === 'entity' && value === null) {
    return
  }

  // 这些类型不应该作为字面量落在 IR JSON 中；出现直接报错
  if (
    argType === 'dict' ||
    argType === 'struct' ||
    argType === 'generic' ||
    argType === 'entity' ||
    argType === 'local_variable' ||
    argType === 'custom_variable_snapshot'
  ) {
    throw new Error(
      `[error] unsupported literal arg type "${argType}" at arg #${argIndex} of ${nodeType} (id=${giaNode.NodeIndex})`
    )
  }

  const pin = ensureInputPin(giaNode, pinIndex)

  if (argType.endsWith('_list')) {
    const listBase = argType.slice(0, -5)
    const itemBase = toVendorBaseTag(listBase)
    if (itemBase) {
      pin.setType({ t: 'l', i: { t: 'b', b: itemBase } })
    }
  } else {
    const base = toVendorBaseTag(argType)
    if (base) {
      pin.setType({ t: 'b', b: base })
    }
  }

  pin.setVal(value as BasicValue)
}

export function setClientExecLiteralArgValue(
  giaNode: GiaNode,
  pinIndex: number,
  argIndex: number,
  nodeType: string,
  argType: string,
  value: unknown
) {
  if (argType !== 'str') {
    throw new Error(
      `[error] ${nodeType} expects literal string, got "${argType}" at arg #${argIndex} (id=${giaNode.NodeIndex})`
    )
  }

  const pin = ensureClientExecPin(giaNode, pinIndex)
  pin.setType({ t: 'b', b: 'Str' })
  // Pin.setVal asserts kind === InParam; assign directly for ClientExec pins.
  pin.value = value as string
}
