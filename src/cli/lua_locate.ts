import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { locateLua } from '../compiler/lua/output/source_maps.js'
import { t } from '../i18n/index.js'

// 日志每条前有一行标题，文字随界面语言变化（"正常脚本日志 日志_…"、"Standard Script Logs log_…"），
// 但都带日期和时间（现在是 2026/10/24_12:38:53）。格式可能随版本或地区变化，只要求"日期 + 时:分"：
// 2026-10-24 12:38、10/24/2026 1:38 PM、2026年10月24日 12:38 都算。标题没认出来也不会定位错，
// 只是不能按条目分组：标题里的时间对应不到构建文件，会被跳过。
const ENTRY_HEADER = /\d{1,4}[/.\-年]\d{1,2}[/.\-月]\d{1,4}日?[\sT_]*\d{1,2}:\d{2}/
// 位置写法：调用栈 lua/hud:299、宿主报错开头 rt_probe: 23、[string "x.lua"]:12、本地 x.lua:42
const LOCATION = /(?:\[string ")?((?:[A-Za-z]:)?[^\s:"'<>[\]()]+?)(?:\.lua)?(?:"\])?: ?(\d+)/g

type Location = { label: string; file: string; line: number }

/** 只认能在本地找到的 Lua 文件；日志里其他 "x:数字" 自然被跳过。 */
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

/** 输入可以是报错文本、日志文件路径或 file.lua:行号；什么都不给时读剪贴板，剪贴板里也可以是文件路径。 */
function readInput(input: string[], log: string | undefined) {
  if (log) return fs.readFileSync(log, 'utf8')
  const text = (input.join(' ').trim() || readClipboard())?.trim()
  if (!text) return undefined
  const file = text.replace(/^"(.*)"$/, '$1')
  return !text.includes('\n') && fs.existsSync(file) && fs.statSync(file).isFile()
    ? fs.readFileSync(file, 'utf8')
    : text
}

function splitEntries(text: string) {
  const entries: string[][] = [[]]
  for (const line of text.split(/\r?\n/))
    if (ENTRY_HEADER.test(line)) entries.push([])
    else entries[entries.length - 1].push(line)
  return entries.map((lines) => lines.join('\n').trim()).filter(Boolean)
}

/**
 * 条目里能对应到构建产物的位置，按出现顺序去重。<x:12> 是函数定义处，不是出错行，跳过。
 * 对应不到的报错位置（行首的 "x:12:"）记进 missing，全都找不到时告诉用户找到了什么。
 */
function entryLocations(entry: string, outDir: string | undefined, missing: Set<string>) {
  const locations = new Map<string, Location>()
  for (const match of entry.matchAll(LOCATION)) {
    if (entry[match.index - 1] === '<') continue
    const file = resolveLuaFile(match[1], outDir)
    if (!file) {
      const lineStart = entry.lastIndexOf('\n', match.index) + 1
      const atLineStart = !entry.slice(lineStart, match.index).trim()
      if (atLineStart && entry[match.index + match[0].length] === ':')
        missing.add(`${match[1]}:${match[2]}`)
      continue
    }
    const line = Number(match[2])
    const key = `${path.resolve(file)}:${line}`
    if (!locations.has(key)) locations.set(key, { label: `${match[1]}:${line}`, file, line })
  }
  return [...locations.values()]
}

export async function runLuaLocate(
  input: string[],
  options: { column?: string; log?: string; outDir?: string }
) {
  const text = readInput(input, options.log)
  if (!text || !text.match(LOCATION)) throw new Error(t('lua_locateInput'))
  const column = Number(options.column ?? 1)
  if (!Number.isInteger(column) || column < 1) throw new Error(t('lua_locateInput'))
  const entries = splitEntries(text)
  const seen = new Set<string>()
  const missing = new Set<string>()
  let printed = false
  for (const entry of entries) {
    const locations = entryLocations(entry, options.outDir, missing)
    const key = locations.map((l) => `${l.file}:${l.line}`).join('|')
    if (!locations.length || seen.has(key)) continue // 同一个错误常在日志里重复出现
    seen.add(key)
    // 多行报错或整份日志先打印报错首行，便于对应是哪一条错误
    const grouped = entries.length > 1 || entry.includes('\n')
    const indent = grouped ? '  ' : ''
    if (grouped) console.log((printed ? '\n' : '') + entry.split('\n')[0].slice(0, 160))
    printed = true
    const user = locations.filter((l) => !isRuntimeFile(l.file))
    for (const { label, file, line } of user.length ? user : locations) {
      const position = user.length ? await locateLua(file, line, column) : undefined
      console.log(
        indent +
          (position
            ? t('lua_locateResult', {
                arg0: label,
                arg1: `${path.relative(process.cwd(), position.file)}:${position.line}:${position.column}`,
                arg2: position.hash.slice(0, 12)
              })
            : t('lua_locateGenerated', { arg0: label }))
      )
    }
    if (user.length && user.length < locations.length)
      console.log(indent + t('lua_locateRuntimeSkipped', { arg0: locations.length - user.length }))
  }
  if (printed) return
  if (!options.outDir || !missing.size) throw new Error(t('lua_locateNotFound'))
  throw new Error(
    t('lua_locateNotBuilt', {
      arg0: [...missing].slice(0, 5).join(', '),
      arg1: path.relative(process.cwd(), path.resolve(options.outDir, 'lua')) || '.'
    })
  )
}
