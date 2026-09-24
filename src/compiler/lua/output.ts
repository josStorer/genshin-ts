import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const marker = '-- @gsts:lua'
export function luaManifestName(owner = 'default') {
  if (!/^(default|[a-f0-9]{12})$/.test(owner)) throw new Error('Lua 输出清单标识无效。')
  return owner === 'default' ? '.gsts-lua-files.json' : `.gsts-lua-${owner}.json`
}
export interface LuaWriteResult {
  written: string[]
  unchanged: string[]
  removed: string[]
  conflicts: string[]
}
export function hasLuaMarker(text: string) {
  return (
    text
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .find((line) => line.trim())
      ?.trim() === marker
  )
}
function safePath(root: string, relative: string) {
  if (
    !relative ||
    /[\x00-\x1f:<>"|?*]/.test(relative) ||
    relative.includes('\\') ||
    relative
      .split('/')
      .some(
        (x) =>
          x === '..' ||
          x === '.' ||
          !x ||
          /[. ]$/.test(x) ||
          /^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(x)
      ) ||
    path.isAbsolute(relative)
  )
    throw new Error(`不安全的 Lua 输出路径：${relative}`)
  const absolute = path.resolve(root, relative)
  const rel = path.relative(root, absolute)
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel))
    throw new Error(`Lua 输出越过目标目录：${relative}`)
  return absolute
}
function checkLinks(target: string) {
  let current = target
  for (;;) {
    if (fs.lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink())
      throw new Error(`Lua 输出路径不能经过链接或 junction：${current}`)
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }
}
function checkOwnedFile(target: string) {
  checkLinks(target)
  if (
    fs.existsSync(target) &&
    (!fs.statSync(target).isFile() || !hasLuaMarker(fs.readFileSync(target, 'utf8')))
  )
    throw new Error(
      `文件已变更，停止覆盖或清理：${target}。确认允许覆盖后，请在文件头第一条非空行添加 -- @gsts:lua。`
    )
}
function atomicWrite(target: string, content: string, owned = false) {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  const temp = `${target}.${randomUUID()}.tmp`
  try {
    fs.writeFileSync(temp, content, { flag: 'wx' })
    checkLinks(target)
    if (owned) checkOwnedFile(target)
    fs.renameSync(temp, target)
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp)
  }
}
/** 先检查整个批次；有未授权文件时一份也不覆盖。complete 仅用于完整项目构建。 */
export function writeLuaFiles(
  rootDir: string,
  files: ReadonlyMap<string, string>,
  complete = false,
  owner = 'default'
): LuaWriteResult {
  const root = path.resolve(rootDir)
  checkLinks(root)
  const result: LuaWriteResult = { written: [], unchanged: [], removed: [], conflicts: [] }
  const manifestPath = path.join(root, luaManifestName(owner))
  checkLinks(manifestPath)
  const readManifest = (filename: string): string[] => {
    checkLinks(filename)
    if (!fs.existsSync(filename)) return []
    const manifest: unknown = JSON.parse(fs.readFileSync(filename, 'utf8'))
    if (
      !manifest ||
      typeof manifest !== 'object' ||
      !('format' in manifest) ||
      manifest.format !== 'gsts:lua:1' ||
      !('files' in manifest) ||
      !Array.isArray(manifest.files) ||
      !manifest.files.every(
        (name: unknown): name is string => typeof name === 'string' && name.endsWith('.lua')
      )
    )
      throw new Error(`Lua 输出清单无效，未修改文件：${filename}`)
    for (const name of manifest.files) safePath(root, name)
    if (new Set(manifest.files.map((name) => name.toLowerCase())).size !== manifest.files.length)
      throw new Error(`Lua 输出清单包含重复路径，未修改文件：${filename}`)
    return manifest.files
  }
  const previous = readManifest(manifestPath)
  const usedElsewhere = new Set<string>()
  if (complete && fs.existsSync(root)) {
    for (const name of fs.readdirSync(root)) {
      if (
        !/^\.gsts-lua-(?:files|[a-f0-9]{12})\.json$/.test(name) ||
        name === path.basename(manifestPath)
      )
        continue
      for (const file of readManifest(path.join(root, name))) usedElsewhere.add(file.toLowerCase())
    }
  }
  const names = new Set<string>()
  const writes: [string, string, string][] = []
  for (const [name, text] of files) {
    if (!name.endsWith('.lua') || !hasLuaMarker(text))
      throw new Error(`生成文件缺少 Lua 标记或扩展名：${name}`)
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
  if (complete)
    for (const name of previous) {
      const target = safePath(root, name)
      checkLinks(target)
      if (
        !names.has(name.toLowerCase()) &&
        !usedElsewhere.has(name.toLowerCase()) &&
        fs.existsSync(target)
      ) {
        if (!fs.statSync(target).isFile() || !hasLuaMarker(fs.readFileSync(target, 'utf8')))
          result.conflicts.push(name)
        else stale.push([name, target])
      }
    }
  if (result.conflicts.length) return result
  try {
    for (const [name, target, text] of writes) {
      atomicWrite(target, text, true)
      result.written.push(name)
    }
    for (const [name, target] of stale) {
      checkOwnedFile(target)
      if (fs.existsSync(target)) fs.unlinkSync(target)
      result.removed.push(name)
    }
    const next = [...new Set(complete ? files.keys() : [...previous, ...files.keys()])].sort()
    const manifest = JSON.stringify({ format: 'gsts:lua:1', files: next }, null, 2) + '\n'
    if (!fs.existsSync(manifestPath) || fs.readFileSync(manifestPath, 'utf8') !== manifest)
      atomicWrite(manifestPath, manifest)
  } catch (error) {
    const pending = writes.slice(result.written.length).map(([name]) => name)
    throw new Error(
      `Lua 写入未完成：${error instanceof Error ? error.message : String(error)}\n已更新：${result.written.join(', ') || '无'}；已移除：${result.removed.join(', ') || '无'}；尚未更新：${pending.join(', ') || '无'}。生成清单可能尚未更新，请修复原因后重新运行。`
    )
  }
  return result
}
export function describeLuaConflicts(result: LuaWriteResult, injection: boolean) {
  return `${injection ? 'Lua 注入未完成' : 'Lua 输出未完成'}：以下文件没有允许覆盖的文件头，已保留原文件，本批次未写入。\n${result.conflicts.map((x) => `  ${x}`).join('\n')}\n确认允许覆盖后，请在各文件头的第一条非空行添加 -- @gsts:lua，再重新运行。`
}
