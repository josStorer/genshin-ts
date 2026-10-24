import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { locateLua } from '../compiler/lua/output/source_maps.js'
import { t } from '../i18n/index.js'

// 游戏日志写模块名（lua/hud:299、lualib_bundle:682）；本地路径带 .lua，也可能是 [string "x.lua"]:12。
const LOCATION = /(?:\[string ")?((?:[A-Za-z]:)?[^\s:"'[\]()]+?)(?:\.lua)?(?:"\])?:(\d+)/g

/** 只认能在本地找到的 Lua 文件；日志里的时间戳等其他 "x:数字" 自然被跳过。 */
function resolveLuaFile(name: string, outDir: string | undefined) {
  const candidates = [`${name}.lua`]
  if (outDir && !path.isAbsolute(name)) {
    candidates.push(path.resolve(outDir, 'lua', `${name}.lua`))
    // require 用点分模块名时，报错位置也可能是 lua.layout 这种写法
    if (!/[\\/]/.test(name))
      candidates.push(path.resolve(outDir, 'lua', `${name.replaceAll('.', '/')}.lua`))
  }
  return candidates.find((file) => fs.existsSync(file) && fs.statSync(file).isFile())
}

/** lualib_bundle 和 __gsts_* 运行库没有映射，也没有对应的 TS 源码。 */
function isRuntimeFile(file: string) {
  const name = path.basename(file)
  return (
    (name === 'lualib_bundle.lua' || name.startsWith('__gsts')) && !fs.existsSync(file + '.map')
  )
}

function readClipboard() {
  try {
    if (process.platform === 'win32')
      return execFileSync(
        'powershell.exe',
        [
          '-NoProfile',
          '-Command',
          '[Console]::OutputEncoding=[Text.Encoding]::UTF8; Get-Clipboard -Raw'
        ],
        { encoding: 'utf8' }
      )
    if (process.platform === 'darwin') return execFileSync('pbpaste', { encoding: 'utf8' })
  } catch {
    return undefined
  }
  return undefined
}

/** 输入可以是报错文本、日志文件路径或 file.lua:行号；什么都不给时读剪贴板。 */
function readInput(input: string[], log: string | undefined) {
  if (log) return fs.readFileSync(log, 'utf8')
  const text = input.join(' ').trim()
  if (!text) return readClipboard()
  return fs.existsSync(text) && fs.statSync(text).isFile() ? fs.readFileSync(text, 'utf8') : text
}

export async function runLuaLocate(
  input: string[],
  options: { column?: string; log?: string; outDir?: string }
) {
  const text = readInput(input, options.log)
  if (!text) throw new Error(t('lua_locateInput'))
  const matches = [...text.matchAll(LOCATION)]
  if (!matches.length) throw new Error(t('lua_locateInput'))
  const column = Number(options.column ?? 1)
  if (!Number.isInteger(column) || column < 1) throw new Error(t('lua_locateInput'))
  const seen = new Set<string>()
  const runtime: string[] = []
  let located = 0
  for (const match of matches) {
    const file = resolveLuaFile(match[1], options.outDir)
    if (!file) continue
    const line = Number(match[2])
    const key = `${path.resolve(file)}:${line}`
    if (seen.has(key)) continue // 同一个错误常在日志里重复出现
    seen.add(key)
    const label = `${match[1]}:${line}`
    if (isRuntimeFile(file)) {
      runtime.push(label)
      continue
    }
    const position = await locateLua(file, line, column)
    located++
    console.log(
      position
        ? t('lua_locateResult', {
            arg0: label,
            arg1: `${path.relative(process.cwd(), position.file)}:${position.line}:${position.column}`,
            arg2: position.hash.slice(0, 12)
          })
        : t('lua_locateGenerated', { arg0: label })
    )
  }
  if (!located && !runtime.length) throw new Error(t('lua_locateNotFound'))
  if (!located) for (const label of runtime) console.log(t('lua_locateGenerated', { arg0: label }))
  else if (runtime.length) console.log(t('lua_locateRuntimeSkipped', { arg0: runtime.length }))
}
