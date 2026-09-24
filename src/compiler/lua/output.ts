import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const marker = '-- @gsts:lua'
const manifestName = '.gsts-lua-files.json'
export interface LuaWriteResult { written: string[]; unchanged: string[]; removed: string[]; conflicts: string[] }
export function hasLuaMarker(text: string) { return text.replace(/^\uFEFF/, '').split(/\r?\n/).find(line => line.trim())?.trim() === marker }
function safePath(root: string, relative: string) {
  if (!relative || /[\x00-\x1f:]/.test(relative) || relative.includes('\\') || relative.split('/').some(x => x === '..' || x === '.' || !x || /[. ]$/.test(x) || /^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(x)) || path.isAbsolute(relative)) throw new Error(`不安全的 Lua 输出路径：${relative}`)
  const absolute = path.resolve(root, relative)
  const rel = path.relative(root, absolute)
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) throw new Error(`Lua 输出越过目标目录：${relative}`)
  return absolute
}
function checkLinks(target: string) {
  let current = target
  for (;;) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error(`Lua 输出路径不能经过链接或 junction：${current}`)
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }
}
function atomicWrite(target: string, content: string) {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  const temp = `${target}.${randomUUID()}.tmp`
  try { fs.writeFileSync(temp, content, { flag: 'wx' }); fs.renameSync(temp, target) }
  finally { if (fs.existsSync(temp)) fs.unlinkSync(temp) }
}
/** 先检查整个批次；有未授权文件时一份也不覆盖。complete 仅用于完整项目构建。 */
export function writeLuaFiles(rootDir: string, files: ReadonlyMap<string, string>, complete = false): LuaWriteResult {
  const root = path.resolve(rootDir)
  checkLinks(root)
  const result: LuaWriteResult = { written: [], unchanged: [], removed: [], conflicts: [] }
  const manifestPath = path.join(root, manifestName)
  checkLinks(manifestPath)
  let previous: string[] = []
  if (fs.existsSync(manifestPath)) {
    const manifest: unknown = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    if (!manifest || typeof manifest !== 'object' || !('format' in manifest) || manifest.format !== 'gsts:lua:1' || !('files' in manifest) || !Array.isArray(manifest.files) || !manifest.files.every((name: unknown): name is string => typeof name === 'string' && name.endsWith('.lua'))) throw new Error('Lua 输出清单无效，未修改文件。请检查 .gsts-lua-files.json。')
    previous = manifest.files
  }
  const names = new Set<string>()
  const writes: [string, string, string][] = []
  for (const [name, text] of files) {
    if (!name.endsWith('.lua') || !hasLuaMarker(text)) throw new Error(`生成文件缺少 Lua 标记或扩展名：${name}`)
    if (names.has(name.toLowerCase())) throw new Error(`Lua 输出文件名大小写冲突：${name}`)
    names.add(name.toLowerCase())
    const target = safePath(root, name)
    checkLinks(target)
    if (fs.existsSync(target)) {
      if (!fs.statSync(target).isFile()) throw new Error(`Lua 输出目标不是文件：${name}`)
      const old = fs.readFileSync(target, 'utf8')
      if (!hasLuaMarker(old)) result.conflicts.push(name)
      else if (old === text) result.unchanged.push(name)
      else writes.push([name, target, text])
    } else writes.push([name, target, text])
  }
  const stale: [string, string][] = []
  if (complete) for (const name of previous) {
    const target = safePath(root, name)
    checkLinks(target)
    if (!files.has(name) && fs.existsSync(target)) {
      if (!fs.statSync(target).isFile() || !hasLuaMarker(fs.readFileSync(target, 'utf8'))) result.conflicts.push(name)
      else stale.push([name, target])
    }
  }
  if (result.conflicts.length) return result
  for (const [name, target, text] of writes) { atomicWrite(target, text); result.written.push(name) }
  for (const [name, target] of stale) { fs.unlinkSync(target); result.removed.push(name) }
  const next = [...new Set(complete ? files.keys() : [...previous, ...files.keys()])].sort()
  const manifest = JSON.stringify({ format: 'gsts:lua:1', files: next }, null, 2) + '\n'
  if (!fs.existsSync(manifestPath) || fs.readFileSync(manifestPath, 'utf8') !== manifest) atomicWrite(manifestPath, manifest)
  return result
}
export function describeLuaConflicts(result: LuaWriteResult, injection: boolean) {
  return `${injection ? 'Lua 注入未完成' : 'Lua 输出未完成'}：以下文件没有允许覆盖的文件头，已保留原文件，本批次未写入。\n${result.conflicts.map(x => `  ${x}`).join('\n')}\n确认允许覆盖后，请在各文件头的第一条非空行添加 -- @gsts:lua，再重新运行。`
}
