import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import prettier from 'prettier'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
type Member = { name: string; doc: string } & (
  | { kind: 'field'; type: string; readonly: boolean }
  | { kind: 'method'; args: string; result: string }
)
const interfaces = new Map<string, Map<string, Member>>()
const enums = new Map<string, Map<string, string>>()
const rows: string[] = [],
  unresolved: string[] = []
let owner = '',
  table = ''
for (const line of fs
  .readFileSync(path.join(root, 'resources/lua/official-api.txt'), 'utf8')
  .replace(/^\uFEFF/, '')
  .split(/\r?\n/)) {
  const heading = /^\d+\.([A-Za-z][A-Za-z0-9]*)$/.exec(line)
  if (heading) owner = heading[1]
  if (!line.startsWith('|')) continue
  const cells = line
    .replace(/^\|+|\|+$/g, '')
    .split('|')
    .map((c) => c.trim())
  if (['字段', '方法', '函数', '枚举名'].includes(cells[0])) {
    table = cells[0]
    continue
  }
  if (cells[0].startsWith('Enum.') && cells.length >= 3) {
    const name = cells[0].slice(5)
    if (!enums.has(name)) enums.set(name, new Map())
    enums.get(name)!.set(cells[1], cells[2])
    continue
  }
  if (table === '字段' && owner && cells.length >= 4 && /^[\w, ]+$/.test(cells[0])) {
    if (!interfaces.has(owner)) interfaces.set(owner, new Map())
    for (const field of cells[0].split(',')) {
      const name = field.trim()
      interfaces.get(owner)!.set(name, {
        kind: 'field',
        name,
        type: cells[1],
        readonly: cells[2] === '只读',
        doc: cells[3]
      })
    }
  } else if (cells[0].includes('(') && cells.length >= 3) {
    const m = /^(?:(\w+)[.:])?(\w+)\((.*)\)$/.exec(cells[0])
    if (!m) {
      unresolved.push(line)
      continue
    }
    let scope = m[1] || owner
    if (
      ![
        'Script',
        'script',
        'game',
        'Color',
        'Tween',
        'TweenSequence',
        'ServerSignal',
        'CursorEventData'
      ].includes(scope) &&
      !scope.startsWith('ClientUI')
    )
      continue
    if (scope === 'script') scope = 'Script'
    if (!interfaces.has(scope)) interfaces.set(scope, new Map())
    interfaces
      .get(scope)!
      .set(m[2], { kind: 'method', name: m[2], args: m[3], result: cells[1], doc: cells[2] })
  }
}
// 官方表格省略的参数类型在这里补全；未知项会列入 coverage，不能静默丢弃。
const paramTypes: Record<string, string> = {
  eventType: 'CursorEventType',
  control: 'ClientUIBaseControl',
  itemCount: 'integer',
  index: 'integer',
  scrollAlignType: 'ScrollAlignType',
  name: 'string',
  callback: 'fun(event: CursorEventData)',
  refreshCallback: 'fun(control: ClientUIBaseControl, index: integer)',
  path: 'string',
  scriptPath: 'string',
  scriptMappingId: 'integer',
  active: 'boolean',
  visible: 'boolean',
  navigationDir: 'ControllerNavigationDir',
  navigationMode: 'ControllerNavigationMode',
  navigationTarget: 'ClientUIBaseControl?',
  fillAmount: 'number',
  fillHorizontalType: 'ImageFillHorizontalType',
  fillVerticalType: 'ImageFillVerticalType',
  fillRadialType: 'ImageFillRadialType',
  fillRadial90Type: 'ImageFillRadial90Type',
  imageId: 'integer',
  imageSource: 'ImageSource',
  widthX: 'number',
  widthY: 'number',
  x: 'number',
  y: 'number',
  z: 'number'
}
const nullable = new Set([
  'GetChild',
  'FindChild',
  'GetParent',
  'GetClientUIControl',
  'FindClientUIRoot',
  'GetControllerFocus',
  'GetScript',
  'GetScriptByPath',
  'InstantiateClientUIControl'
])
const known = new Set([
  ...interfaces.keys(),
  ...enums.keys(),
  'ColorValue',
  'EnumItem',
  'Vector3Value',
  'TweenProperties'
])
function split(text: string) {
  const result: string[] = []
  let start = 0,
    depth = 0
  for (let i = 0; i < text.length; i++) {
    if ('(<['.includes(text[i])) depth++
    if (')>]'.includes(text[i])) depth--
    if (text[i] === ',' && depth === 0) {
      result.push(text.slice(start, i).trim())
      start = i + 1
    }
  }
  if (text.slice(start).trim()) result.push(text.slice(start).trim())
  return result
}
function typ(input: string): string {
  const t = input.trim()
  if (t.endsWith('?')) return typ(t.slice(0, -1)) + ' | undefined'
  if (t.endsWith('[]')) return '(' + typ(t.slice(0, -2)) + ')[]'
  if (t.startsWith('fun(')) {
    const end = t.lastIndexOf(')'),
      ret = t
        .slice(end + 1)
        .trim()
        .replace(/^:/, '')
        .trim()
    return (
      '(this: void' +
      (t.slice(4, end) ? ', ' + args(t.slice(4, end)) : '') +
      ') => ' +
      (ret ? typ(ret) : 'void')
    )
  }
  const mapped: Record<string, string> = {
    integer: 'number',
    number: 'number',
    boolean: 'boolean',
    string: 'string',
    any: 'unknown',
    table: 'Record<string, unknown>',
    '—': 'void',
    '': 'void',
    nil: 'undefined'
  }
  if (t in mapped) return mapped[t]
  if (known.has(t)) return t
  unresolved.push('type: ' + t)
  return 'unknown'
}
function args(text: string, scope = '', name = ''): string {
  return split(text)
    .map((p) => {
      if (p.startsWith('...')) return '...args: unknown[]'
      const colon = p.indexOf(':')
      const k = (colon < 0 ? p : p.slice(0, colon)).trim()
      let t = colon < 0 ? paramTypes[k] : p.slice(colon + 1)
      if (!t) {
        unresolved.push(scope + '.' + name + ' parameter ' + k)
        t = 'any'
      }
      const optional = t.trim().endsWith('?') || k.endsWith('?')
      if (scope === 'ClientUIBaseControl' && k === 'eventType')
        t = name.includes('KeyEvent') ? 'KeyEventType' : 'ControllerNavigationEventType'
      if (k === 'callback' && name.includes('KeyEvent')) t = 'fun(): boolean'
      if (k === 'callback' && name.includes('NavigationEvent')) t = 'fun()'
      return k.replace(/\?$/, '') + (optional ? '?' : '') + ': ' + typ(t.replace(/\?$/, ''))
    })
    .join(', ')
}
const lines = [
  '// Generated by scripts/generate-lua-definitions.ts. Do not edit by hand.',
  '// Source: https://act.mihoyo.com/ys/ugc/tutorial/detail/mhtakr07vej4',
  "import type { LuaMultiReturn } from './lua_primitives.js'",
  'declare const enumBrand: unique symbol',
  'export interface EnumItem<K extends string = string> { readonly Name: string; readonly FullName: string; readonly EnumType: string; readonly [enumBrand]: K }',
  'declare const colorBrand: unique symbol',
  'export interface ColorValue { readonly [colorBrand]: true }',
  'export type RuntimeControlId = number & { readonly __gstsControlId?: "runtime" }',
  'export type ControlPrefabIndex = number & { readonly __gstsControlId?: "prefab" }',
  'export interface Vector3Value { x: number; y: number; z: number }',
  'export type TweenProperties = Partial<Record<TweenField, number | ColorValue>>'
]
for (const name of enums.keys()) lines.push(`export type ${name} = EnumItem<"${name}">`)
// 官方文档只给枚举名，没有中文标题；这里补一句用途，补全 lua.Enum. 时能看到。
const enumDocs: Record<string, string> = {
  EaseType: '补间动画的缓动曲线，例如 Tween:SetEase(lua.Enum.EaseType.OutQuad)。',
  CustomVariableEntityType:
    '自定义变量属于谁：关卡、玩家自身或角色自身；读取和监听自定义变量时使用。',
  Device: '玩家正在使用的输入设备：键鼠、移动端触屏、手柄等。',
  StageMode: '关卡模式：超限模式或经典模式。',
  LanguageType: '游戏语言，例如 game.GetLanguageType() === lua.Enum.LanguageType.LanguageChs。',
  ParamType: '服务器信号的参数类型，ServerSignal:AddParam 使用。',
  CursorEventType: '光标事件：按下、抬起、进入或离开检测区域等，AddCursorEventListener 使用。',
  ScrollDirection: '滚动方向：水平或垂直。',
  ScrollLayoutConstraint: '列表的排布方式：自动换行，或固定行数、列数。',
  ScrollAlignType: '滚动到某一项后的对齐位置，ScrollToItemAt 使用。',
  ControllerNavigationDir: '手柄导航的方向。',
  ControllerNavigationEventType: '手柄导航事件：确认、取消、获得或失去聚焦、摇杆方向等。',
  ControllerNavigationMode: '手柄导航方式：不导航、导航到最近的控件或指定控件。',
  TextHorizontalAlignment: '文本的水平对齐。',
  TextVerticalAlignment: '文本的垂直对齐。',
  ImageType: '图片的显示方式：基础或拉伸。',
  ImageSource: '图片来源：静态引用、道具、装备、技能等，SetImage 使用。',
  ImageFillType: '图片的填充方式：不填充、水平、垂直或环绕；配合 fillAmount 表示进度。',
  ImageFillHorizontalType: '水平填充从哪一侧开始。',
  ImageFillVerticalType: '垂直填充从哪一侧开始。',
  ImageFillRadial90Type: '90 度环绕填充从哪个角开始。',
  ImageFillRadialType: '180 度和 360 度环绕填充从哪一侧开始。',
  ImageMaskSoftEdgeMode: '遮罩边缘羽化按比例还是按像素设置。',
  UIAnimationLayer: '界面动画显示在所有控件之上还是之下。',
  KeyboardKeyCode: '键鼠按键。',
  ControllerKeyCode: '手柄按键。',
  KeyEventType:
    '按键事件：某个键鼠或手柄按键的按下、抬起，lua.helper.listenKey 和 AddKeyEventListener 使用。'
}
lines.push('export interface HostEnums {')
for (const [name, members] of enums) {
  if (enumDocs[name]) lines.push(`/** ${enumDocs[name]} */`)
  lines.push(`readonly ${name}: {`)
  for (const [member, doc] of members) {
    lines.push(`/** ${doc.replaceAll('*/', '* /')} */`, `readonly ${member}: ${name}`)
    rows.push(`Enum.${name}.${member}`)
  }
  lines.push('}')
}
lines.push('}')
const tween: string[] = []
for (const [scope, members] of interfaces) {
  if (scope === 'EnumItem') continue
  const exportName = scope === 'game' ? 'HostGame' : scope === 'Color' ? 'HostColor' : scope
  const parent =
    scope.startsWith('ClientUI') && scope !== 'ClientUIBaseControl'
      ? ' extends ClientUIBaseControl'
      : ''
  lines.push(`export interface ${exportName}${parent} {`)
  for (const [name, item] of members) {
    rows.push(`${scope}.${name}`)
    let doc = item.doc.replaceAll('*/', '* /')
    if (scope === 'game' && name === 'GetClientUIControl')
      doc += ' 参数是运行时 id，不是编辑器的控件索引。'
    if (name === 'prefabIndex') doc += ' 用于模板实例化，不是运行时 id。'
    if (scope === 'Script' && name === 'GetParam')
      doc += ' 返回值需检查类型；实测未观察到控件索引自动转对象，不作隐式转换。'
    lines.push(`/** ${doc} */`)
    if (item.kind === 'field') {
      let t = typ(item.type)
      if (scope === 'Script' && name === 'object') t = 'ClientUIBaseControl'
      if (scope === 'ClientUIBaseControl' && name === 'id') t = 'RuntimeControlId'
      if (name === 'prefabIndex') t = 'ControlPrefabIndex'
      if (name === 'parent') t = 'ClientUIBaseControl | undefined'
      if (doc.includes('Tweenable')) tween.push(name)
      lines.push(`${item.readonly ? 'readonly ' : ''}${name}: ${t}`)
    } else {
      let a = args(item.args, scope, name),
        r = item.result
      if (r === 'navigationMode, navigationTarget')
        r = 'LuaMultiReturn<[ControllerNavigationMode, ClientUIBaseControl | undefined]>'
      else if (/^[xyz](?:, [xyz])+$/.test(r))
        r = `LuaMultiReturn<[${r
          .split(',')
          .map(() => 'number')
          .join(', ')}]>`
      else if (/^[\w, ]+: number$/.test(r))
        r = `LuaMultiReturn<[${r
          .split(':')[0]
          .split(',')
          .map(() => 'number')
          .join(', ')}]>`
      else r = typ(r)
      if (nullable.has(name) && r !== 'unknown') r += ' | undefined'
      if (scope === 'Script' && name === 'Invoke') r = 'LuaMultiReturn<unknown[]>'
      if (name === 'AddVector3' || name === 'AddVector3List')
        a = 'value: Vector3Value' + (name.endsWith('List') ? '[]' : '')
      if (scope === 'game' && name === 'GetClientUIControl') a = 'controlId: RuntimeControlId'
      if (scope === 'game' && name === 'InstantiateClientUIControl')
        a = 'controlPrefabIndex: ControlPrefabIndex, parent: ClientUIBaseControl'
      if (scope === 'game' && name === 'Tween')
        a = 'object: ClientUIBaseControl, tweenDataTable: TweenProperties, duration: number'
      lines.push(
        `${scope === 'Color' && name === 'Color' ? '' : name}(this: ${scope === 'game' || scope === 'Color' ? 'void' : exportName}${a ? ', ' + a : ''}): ${r}`
      )
    }
  }
  lines.push('}')
}
lines.push(
  'export type TweenField = ' +
    [...new Set(tween)]
      .sort()
      .map((n) => JSON.stringify(n))
      .join(' | ')
)
const controls = [...interfaces.keys()].filter((n) => n.startsWith('ClientUI'))
const helperControls = [
  ...fs
    .readFileSync(path.join(root, 'src/runtime/lua_assets/helpers.lua'), 'utf8')
    .matchAll(/(ClientUI\w+Control)=true/g)
].map((m) => m[1])
if (JSON.stringify([...new Set(helperControls)].sort()) !== JSON.stringify([...controls].sort()))
  throw new Error('Lua helper base-control guard differs from SDK ControlTypes')
lines.push('export interface ControlTypes { ' + controls.map((n) => `${n}: ${n}`).join('; ') + ' }')
const coverage = {
  source: 'https://act.mihoyo.com/ys/ugc/tutorial/detail/mhtakr07vej4',
  members: [...new Set(rows)].sort(),
  unresolved: [...new Set(unresolved)].sort()
}
const config = await prettier.resolveConfig(path.join(root, 'src/runtime/lua_host.ts'))
const output = await prettier.format(lines.join('\n') + '\n', {
  ...config,
  filepath: path.join(root, 'src/runtime/lua_host.ts')
})
for (const [rel, data] of [
  ['src/runtime/lua_host.ts', output],
  ['resources/lua/api-coverage.json', JSON.stringify(coverage, null, 2) + '\n']
]) {
  const file = path.join(root, rel)
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n') !== data)
      throw new Error(`${rel} needs regeneration`)
  } else fs.writeFileSync(file, data)
}
console.log('Host API members:', coverage.members.length, 'unresolved:', coverage.unresolved.length)
if (unresolved.length) throw new Error(coverage.unresolved.join('\n'))
