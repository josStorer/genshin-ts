import type { PrimitiveSpec, TypeSpec } from './typespec.js'

export type Mode = 'literal' | 'wire'

export type Ctx = {
  n: number
}

export function nextN(ctx: Ctx): number {
  ctx.n += 1
  return ctx.n
}

function listConcreteOfPrimitive(name: PrimitiveSpec): string | null {
  switch (name) {
    case 'bool':
    case 'int':
    case 'float':
    case 'str':
    case 'vec3':
    case 'guid':
    case 'faction':
      return name
    case 'configId':
      return 'config_id'
    case 'prefabId':
      return 'prefab_id'
    case 'entity':
    case 'PlayerEntity':
    case 'CharacterEntity':
      // entity_list 字面量无法可靠 JSON 化（元素是 entity 对象），用 assemblyList 走连线
      return null
    default:
      return null
  }
}

function listItemExprOfPrimitive(name: string, n: number): string {
  // assemblyList 会在运行期 parseValue(v, type)，所以这里允许 bigint / class instance
  switch (name) {
    case 'bool':
      return n % 2 ? 'true' : 'false'
    case 'int':
      return `${n}n`
    case 'float':
      return `${n}.25`
    case 'str':
      return JSON.stringify(String(n))
    case 'vec3':
      return `[${n}, ${n + 1}, ${n + 2}]`
    case 'guid':
    case 'faction':
    case 'configId':
    case 'prefabId':
      return `${n}n`
    default:
      return String(n)
  }
}

export function emitValueLiteral(spec: TypeSpec, ctx: Ctx): string {
  const n = nextN(ctx)
  switch (spec.kind) {
    case 'primitive': {
      switch (spec.name) {
        case 'bool':
          return n % 2 ? 'true' : 'false'
        case 'int':
          return `${n}n`
        case 'float':
          return `${n}.25`
        case 'str':
          return JSON.stringify(String(n))
        case 'vec3':
          return `f.create3dVector(${n}, ${n + 1}, ${n + 2})`
        case 'guid':
          return `new guid(${n}n)`
        case 'entity':
          return `f.getSelfEntity()`
        case 'PlayerEntityList':
          return `f.getListOfPlayerEntitiesOnTheField()`
        case 'PlayerEntity':
          return `f.getListOfPlayerEntitiesOnTheField()[0]`
        case 'CharacterEntityList':
          return `f.getAllCharacterEntitiesOfSpecifiedPlayer(f.getListOfPlayerEntitiesOnTheField()[0])`
        case 'CharacterEntity':
          return `f.getAllCharacterEntitiesOfSpecifiedPlayer(f.getListOfPlayerEntitiesOnTheField()[0])[0]`
        case 'configId':
          return `new configId(${n}n)`
        case 'prefabId':
          return `new prefabId(${n}n)`
        case 'faction':
          return `new faction(${n}n)`
      }
      break
    }
    case 'list': {
      // nodes.ts 运行期把 `*_list` 识别为 list 实例（而不是 JS array）
      // 统一用 assemblyList + 显式指定类型（更贴近真实节点连线，也便于你检查 IR->GIA）
      const elem = spec.elem
      if (elem.kind === 'primitive') {
        const concrete = listConcreteOfPrimitive(elem.name)
        if (concrete) {
          const i1 = listItemExprOfPrimitive(elem.name, n)
          const i2 = listItemExprOfPrimitive(elem.name, n + 1)
          const i3 = listItemExprOfPrimitive(elem.name, n + 2)
          return `f.assemblyList([${i1}, ${i2}, ${i3}], ${JSON.stringify(concrete)})`
        }
        // entity_list 等：用 assemblyList（需要 f）
        const e1 = emitValueLiteral(elem, ctx)
        return `f.assemblyList([${e1}, ${e1}, ${e1}], ${JSON.stringify(elem.name)})`
      }
      // fallback：用 assemblyList
      const x = emitValueLiteral(elem, ctx)
      return `f.assemblyList([${x}, ${x}, ${x}], "int")`
    }
    case 'dict': {
      // 用 assemblyDictionary 构造 dict（带 pin metadata，更接近真实连线）
      const k1 = emitValueLiteral(spec.key, ctx)
      const v1 = emitValueLiteral(spec.value, ctx)
      const k2 = emitValueLiteral(spec.key, ctx)
      const v2 = emitValueLiteral(spec.value, ctx)
      return `f.assemblyDictionary([{ k: ${k1}, v: ${v1} }, { k: ${k2}, v: ${v2} }])`
    }
    case 'enumConcrete': {
      // 先用 SortBy 兜底（真正的 e<id> 映射在 enum 专用测试里做）
      return `E.SortBy.Ascending`
    }
    case 'unknown':
      return String(n)
  }
  return String(n)
}

export function emitValueUnknown(mode: Mode, ctx: Ctx): string {
  const n = nextN(ctx)
  // 仅用于极少数无法推断的类型；避免影响“数组参数不要 as any”的目标
  return mode === 'literal' ? String(n) : `vInt`
}

export function emitValueWire(spec: TypeSpec, ctx: Ctx): string {
  // 连线模式：尽量使用已有 producer；缺失时退化为 literal（并在 report 标记）
  switch (spec.kind) {
    case 'primitive': {
      switch (spec.name) {
        case 'bool':
          return `vBool`
        case 'int':
          return `vInt`
        case 'float':
          return `vFloat`
        case 'str':
          return `vStr`
        case 'vec3':
          return `vVec3`
        case 'guid':
          return `vGuid`
        case 'entity':
          return `e`
        case 'PlayerEntityList':
          return `pes`
        case 'PlayerEntity':
          return `pes[0]`
        case 'CharacterEntityList':
          return `ces`
        case 'CharacterEntity':
          return `ces[0]`
        case 'configId':
          return `vConfig`
        case 'prefabId':
          return `new prefabId(1n)`
        case 'faction':
          return `vFaction`
      }
      break
    }
    case 'list': {
      const elemExpr = emitValueWire(spec.elem, ctx)
      const concrete =
        spec.elem.kind === 'primitive'
          ? spec.elem.name === 'prefabId'
            ? 'prefab_id'
            : spec.elem.name === 'configId'
              ? 'config_id'
              : spec.elem.name
          : 'int'
      return `f.assemblyList([${elemExpr}, ${elemExpr}, ${elemExpr}], ${JSON.stringify(concrete)})`
    }
    case 'dict': {
      const k = emitValueWire(spec.key, ctx)
      const v = emitValueWire(spec.value, ctx)
      return `f.assemblyDictionary([{ k: ${k}, v: ${v} }, { k: ${k}, v: ${v} }])`
    }
    case 'enumConcrete': {
      return `E.SortBy.Ascending`
    }
    case 'unknown':
      break
  }
  return emitValueLiteral(spec, ctx)
}

export function emitProducers(): string {
  return [
    `const e = f.getSelfEntity()`,
    `const pes = f.getListOfPlayerEntitiesOnTheField()`,
    `const ces = f.getAllCharacterEntitiesOfSpecifiedPlayer(pes[0])`,
    `const vInt = f.addition(1n, 2n)`,
    `const vFloat = f.pi()`,
    `const vBool = f.equal(1n, 1n)`,
    `const vGuid = f.queryGuidByEntity(e)`,
    `const vFaction = f.queryEntityFaction(e)`,
    `const vVec3 = f.create3dVector(1, 2, 3)`,
    `const vStr = f.dataTypeConversion(1n, 'str')`,
    `const vConfig = f.queryPlayerClass(e)`
  ]
    .map((s) => `  ${s}`) // 缩进
    .join('\n')
}
