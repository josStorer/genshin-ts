// gsts lua check 的独立入口：bin/gsts.mjs 直接加载它，不加载完整命令行和编译器。
// 先只看项目里有没有 Lua 子项目（tsconfig 用了 Lua 类型）；纯 TS 项目到这里就结束，几乎没有额外开销。

import fs from 'node:fs'
import path from 'node:path'

import fg from 'fast-glob'

// 继承 genshin-ts/tsconfig/lua.json，或直接引用 lua_globals 类型的 tsconfig 属于 Lua 子项目
const LUA_TSCONFIG = /tsconfig\/lua(?:\.json)?["']|runtime\/lua_globals/

/** 只读 tsconfig 文本；项目内相对路径的 extends 继续向上查，覆盖自定义基础配置的写法。 */
export function hasLuaProject(dir: string) {
  const seen = new Set<string>()
  const isLua = (file: string): boolean => {
    if (seen.has(file) || !fs.existsSync(file)) return false
    seen.add(file)
    const text = fs.readFileSync(file, 'utf8')
    if (LUA_TSCONFIG.test(text)) return true
    const parent = /"extends"\s*:\s*"(\.{1,2}\/[^"]+)"/.exec(text)?.[1]
    if (!parent) return false
    const target = path.resolve(path.dirname(file), parent)
    return isLua(target.endsWith('.json') ? target : target + '.json')
  }
  return fg
    .sync('**/tsconfig*.json', {
      cwd: dir,
      absolute: true,
      ignore: ['**/node_modules/**', '**/.git/**'],
      suppressErrors: true
    })
    .some(isLua)
}

function option(argv: string[], name: string, short?: string) {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === name || argv[i] === short) return argv[i + 1]
    if (argv[i].startsWith(name + '=')) return argv[i].slice(name.length + 1)
  }
  return undefined
}

/** 返回退出码：0 表示通过或没有 Lua，1 表示发现错误。 */
export async function runLuaCheck(argv: string[]) {
  const configPath = path.resolve(process.cwd(), option(argv, '--config', '-c') ?? 'gsts.config.ts')
  const projectDir = path.dirname(configPath)
  if (!hasLuaProject(projectDir)) return 0
  const { detectLang, initCliI18n } = await import('../i18n/index.js')
  const { loadGstsConfig } = await import('../compiler/config_loader.js')
  const { checkClientLua } = await import('./lua.js')
  const cfg = await loadGstsConfig(configPath)
  const { t } = initCliI18n(detectLang(option(argv, '--lang') ?? cfg.lang))
  const result = await checkClientLua(projectDir, cfg)
  if (!result.entries) console.log(t('lua_checkNoEntries'))
  else
    console.log(
      result.hasErrors ? t('lua_checkFailed') : t('lua_checkPassed', { arg0: result.entries })
    )
  return result.hasErrors ? 1 : 0
}
