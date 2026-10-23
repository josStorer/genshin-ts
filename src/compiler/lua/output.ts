import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { t } from '../../i18n/index.js'
import { hasLuaMapMarker } from './source_maps.js'

const marker = '-- @gsts:lua'
const isArtifact = (name: string) => name.endsWith('.lua') || name.endsWith('.lua.map')
const owned = (name: string, text: string) =>
  name.endsWith('.lua.map') ? hasLuaMapMarker(text) : hasLuaMarker(text)
function luaManifestName(owner = 'default') {
  if (!/^(default|[a-f0-9]{12})$/.test(owner)) throw new Error(t('lua_manifestOwner'))
  return owner === 'default' ? '.gsts-lua-files.json' : `.gsts-lua-${owner}.json`
}
export interface LuaWriteResult {
  written: string[]
  unchanged: string[]
  removed: string[]
  conflicts: string[]
}
/** 仅记录本会话成功写出的内容；不同目录和项目各自维护。 */
export interface LuaOutputCache {
  key?: string
  files?: Map<string, string>
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
    [...relative].some((character) => character.charCodeAt(0) < 32) ||
    /[:<>"|?*]/.test(relative) ||
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
    throw new Error(t('lua_unsafePath', { arg0: relative }))
  const absolute = path.resolve(root, relative)
  const rel = path.relative(root, absolute)
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel))
    throw new Error(t('lua_outputOutsideTarget', { arg0: relative }))
  return absolute
}
function checkLinks(target: string, checkedParents?: Set<string>) {
  let current = target
  for (;;) {
    if (current !== target && checkedParents?.has(current)) break
    if (fs.lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink())
      throw new Error(t('lua_outputLink', { arg0: current }))
    checkedParents?.add(current)
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }
}
function checkOwnedFile(target: string) {
  checkLinks(target)
  if (
    fs.existsSync(target) &&
    (!fs.statSync(target).isFile() || !owned(target, fs.readFileSync(target, 'utf8')))
  )
    throw new Error(t('lua_fileChanged', { arg0: target }))
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
/** 逐个预检待更新文件；跳过未授权文件，其余照常写入和清理。缓存跳过未变产物，实际覆盖/删除仍检查标记。
 * complete 提供完整输出集合以清理旧文件；省略 cache 时检查全部目标，适用于主动构建。
 */
export function writeLuaFiles(
  rootDir: string,
  files: ReadonlyMap<string, string>,
  complete = false,
  owner = 'default',
  cache?: LuaOutputCache
): LuaWriteResult {
  // 只在本批预检中复用父目录检查；真正写入、删除前仍逐级重新检查。
  const checkedParents = new Set<string>()
  const root = path.resolve(rootDir)
  const cacheKey = JSON.stringify([root, owner])
  const previousFiles = cache?.key === cacheKey ? cache.files : undefined
  // 预检失败或写到一半失败后，下一次不能继续信任旧的磁盘快照。
  if (cache) cache.files = undefined
  checkLinks(root, checkedParents)
  const result: LuaWriteResult = { written: [], unchanged: [], removed: [], conflicts: [] }
  const manifestPath = path.join(root, luaManifestName(owner))
  checkLinks(manifestPath, checkedParents)
  const readManifest = (filename: string): string[] => {
    checkLinks(filename, checkedParents)
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
        (name: unknown): name is string => typeof name === 'string' && isArtifact(name)
      )
    )
      throw new Error(t('lua_invalidManifest', { arg0: filename }))
    for (const name of manifest.files) safePath(root, name)
    if (new Set(manifest.files.map((name) => name.toLowerCase())).size !== manifest.files.length)
      throw new Error(t('lua_duplicateManifest', { arg0: filename }))
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
    if (!isArtifact(name) || !owned(name, text))
      throw new Error(t('lua_missingMarker', { arg0: name }))
    if (names.has(name.toLowerCase())) throw new Error(t('lua_caseCollision', { arg0: name }))
    names.add(name.toLowerCase())
    const target = safePath(root, name)
    if (previousFiles?.get(name) === text) {
      result.unchanged.push(name)
      continue
    }
    checkLinks(target, checkedParents)
    if (fs.existsSync(target)) {
      if (!fs.statSync(target).isFile()) throw new Error(t('lua_targetNotFile', { arg0: name }))
      const old = fs.readFileSync(target, 'utf8')
      if (!owned(name, old)) result.conflicts.push(name)
      else if (old === text) result.unchanged.push(name)
      else writes.push([name, target, text])
    } else writes.push([name, target, text])
  }
  const stale: [string, string][] = []
  if (complete)
    for (const name of previous) {
      if (names.has(name.toLowerCase()) || usedElsewhere.has(name.toLowerCase())) continue
      const target = safePath(root, name)
      checkLinks(target, checkedParents)
      if (fs.existsSync(target)) {
        if (!fs.statSync(target).isFile() || !owned(name, fs.readFileSync(target, 'utf8')))
          result.conflicts.push(name)
        else stale.push([name, target])
      }
    }
  const conflicts = new Set(result.conflicts)
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
    // 未获授权的新文件不归本项目所有；旧冲突仍留在清单中，允许恢复标记后清理。
    const next = [
      ...new Set([
        ...previous.filter((name) => !complete || conflicts.has(name)),
        ...[...files.keys()].filter((name) => !conflicts.has(name))
      ])
    ].sort()
    const manifest = JSON.stringify({ format: 'gsts:lua:1', files: next }, null, 2) + '\n'
    if (!fs.existsSync(manifestPath) || fs.readFileSync(manifestPath, 'utf8') !== manifest)
      atomicWrite(manifestPath, manifest)
  } catch (error) {
    const pending = writes.slice(result.written.length).map(([name]) => name)
    throw new Error(
      t('lua_writeIncomplete', {
        arg0: error instanceof Error ? error.message : String(error),
        arg1: result.written.join(', ') || t('summary_none'),
        arg2: result.removed.join(', ') || t('summary_none'),
        arg3: pending.join(', ') || t('summary_none')
      }),
      { cause: error }
    )
  }
  if (cache) {
    cache.key = cacheKey
    cache.files = complete ? new Map(files) : new Map([...(previousFiles ?? []), ...files])
    for (const name of conflicts) cache.files.delete(name)
  }
  return result
}
/** 注入沿用节点图注入的跳过提示；本地输出目录不是注入，用"跳过写入"。 */
export function describeLuaConflicts(result: LuaWriteResult, injection: boolean) {
  const key = injection ? 'injectSkip' : 'lua_outputSkip'
  return result.conflicts
    .map((file) => t(key, { file, reason: t('lua_outputConflicts') }))
    .join('\n')
}
