import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { SourceMapConsumer, SourceMapGenerator, type RawSourceMap } from 'source-map'

import { t } from '../../i18n/index.js'

type LuaMap = RawSourceMap & { x_gsts: '@gsts:lua'; x_gsts_hash: string }
const hash = (text: string) => createHash('sha256').update(text).digest('hex')
const posix = (file: string) => file.replaceAll('\\', '/')

export function hasLuaMapMarker(text: string) {
  try {
    const data: unknown = JSON.parse(text)
    return !!data && typeof data === 'object' && 'x_gsts' in data && data.x_gsts === '@gsts:lua'
  } catch {
    return false
  }
}

/** Lua 文件已加标记；映射在这里补一行偏移，并绑定当前产物的内容 hash。 */
export function packageLuaMaps(files: Map<string, string>, root: string, outDir: string) {
  for (const [name, code] of files) {
    if (!name.endsWith('.lua')) continue
    const mapName = name + '.map'
    const existing = files.get(mapName)
    let data: RawSourceMap
    if (existing) {
      data = JSON.parse(existing) as RawSourceMap
      data.mappings = ';' + data.mappings
      // TSTL records source paths relative to the emitted file, so preserve that base.
    } else {
      const native = path.resolve(root, name)
      if (!fs.existsSync(native)) continue // Framework helpers have no user TS location.
      const source = fs.readFileSync(native, 'utf8')
      const generator = new SourceMapGenerator({ file: path.basename(name) })
      const offset =
        source.startsWith('-- @gsts:lua\n') || source.startsWith('-- @gsts:lua\r\n') ? 0 : 1
      const relative = posix(path.relative(path.dirname(path.resolve(outDir, mapName)), native))
      for (let line = 2; line <= code.split('\n').length; line++)
        generator.addMapping({
          generated: { line, column: 0 },
          original: { line: line - offset, column: 0 },
          source: relative
        })
      data = JSON.parse(generator.toString()) as RawSourceMap
    }
    data.file = path.basename(name)
    const mapped: LuaMap = { ...data, x_gsts: '@gsts:lua', x_gsts_hash: hash(code) }
    files.set(mapName, JSON.stringify(mapped) + '\n')
  }
}

/** 只读本地映射；产物变更后拒绝用旧映射猜位置。 */
export async function locateLua(file: string, line: number, column = 1) {
  const absolute = path.resolve(file)
  const mapFile = absolute + '.map'
  if (!fs.existsSync(mapFile)) throw new Error(t('lua_mapMissing', { arg0: file }))
  const raw: unknown = JSON.parse(fs.readFileSync(mapFile, 'utf8'))
  if (
    !raw ||
    typeof raw !== 'object' ||
    !('version' in raw) ||
    raw.version !== 3 ||
    !('mappings' in raw) ||
    typeof raw.mappings !== 'string' ||
    !('sources' in raw) ||
    !Array.isArray(raw.sources) ||
    !raw.sources.every((source) => typeof source === 'string') ||
    !('x_gsts_hash' in raw) ||
    typeof raw.x_gsts_hash !== 'string'
  )
    throw new Error(t('lua_mapInvalid', { arg0: mapFile }))
  const data = raw as LuaMap
  if (data.x_gsts_hash !== hash(fs.readFileSync(absolute, 'utf8')))
    throw new Error(t('lua_mapStale', { arg0: file }))
  return SourceMapConsumer.with(data, undefined, (consumer) => {
    const positions: { column: number; source: string; line: number; originalColumn: number }[] = []
    consumer.eachMapping((mapping) => {
      if (mapping.generatedLine === line && mapping.source && mapping.originalLine)
        positions.push({
          column: mapping.generatedColumn,
          source: mapping.source,
          line: mapping.originalLine,
          originalColumn: mapping.originalColumn
        })
    })
    positions.sort((a, b) => a.column - b.column)
    const position = positions.filter((p) => p.column <= column - 1).at(-1) ?? positions[0]
    return position
      ? {
          file: path.resolve(path.dirname(mapFile), position.source),
          line: position.line,
          column: position.originalColumn + 1,
          hash: data.x_gsts_hash
        }
      : undefined
  })
}
