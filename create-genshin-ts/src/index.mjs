// npm create genshin-ts 的源码。发布前由 scripts/build-create.mjs 打包成 bin/create-genshin-ts.mjs，
// 依赖一起打进去，用户安装时不需要额外依赖。

import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import * as p from '@clack/prompts'

import { listLocalSaves } from '../../src/cli/gil_paths.ts'
import { detectLang, messages } from './messages.mjs'

// 源码在 src/、打包结果在 bin/，模板都在上一级的 templates/
const templatesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../templates')
const TEMPLATES = ['graph-lua', 'graph']
const REGIONS = ['China', 'Global']
// 区服对应的存档目录名（见 src/cli/gil_paths.ts），选择时作为提示显示
const REGION_FOLDERS = {
  China: 'LocalLow\\miHoYo\\原神',
  Global: 'LocalLow\\miHoYo\\Genshin Impact'
}

function parseArgs(argv) {
  const options = { inject: true, positional: [] }
  for (let i = 0; i < argv.length; i++) {
    const [flag, inline] = argv[i].startsWith('--') ? argv[i].split(/=(.*)/s) : [argv[i]]
    const value = () => inline ?? argv[++i]
    if (flag === '--template') options.template = value()
    else if (flag === '--lang') options.lang = value()
    else if (flag === '--region') options.region = value()
    else if (flag === '--player') options.player = value()
    else if (flag === '--map') options.map = value()
    else if (flag === '--no-inject') options.inject = false
    else if (flag === '--install') options.install = true
    else if (flag === '--no-install') options.install = false
    else if (flag === '-y' || flag === '--yes') options.yes = true
    else if (flag === '--force') options.force = true
    else if (flag === '-h' || flag === '--help') options.help = true
    else if (flag.startsWith('-')) options.unknown = flag
    else options.positional.push(flag)
  }
  return options
}

const toPackageName = (input) =>
  input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-._]/g, '-')
    .replace(/^-+/g, '')
    .replace(/-+/g, '-')
    .replace(/^[_.]+/g, '') || 'gsts-project'

/** 命令前缀跟随调用 create 的包管理器（npm / pnpm / yarn / bun）。 */
function packageManager() {
  const agent = process.env.npm_config_user_agent ?? ''
  const name = ['pnpm', 'yarn', 'bun'].find((pm) => agent.startsWith(pm)) ?? 'npm'
  return {
    name,
    run: (script) =>
      name === 'npm' || name === 'bun' ? `${name} run ${script}` : `${name} ${script}`
  }
}

function isNonEmptyDir(dir) {
  try {
    return fs.readdirSync(dir).length > 0
  } catch {
    return false
  }
}

/** _shared 与模板目录依次复制；_ 开头的是模板自身的资料（_gitignore 除外），不复制。 */
function copyTemplate(sourceDir, targetDir, replace) {
  fs.mkdirSync(targetDir, { recursive: true })
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') && entry.name !== '_gitignore') continue
    const from = path.join(sourceDir, entry.name)
    const to = path.join(targetDir, entry.name === '_gitignore' ? '.gitignore' : entry.name)
    if (entry.isDirectory()) copyTemplate(from, to, replace)
    // 生成的项目统一用 LF（与模板的 .editorconfig 一致），Windows 检出的 CRLF 模板也一样
    else
      fs.writeFileSync(
        to,
        replace(entry.name, fs.readFileSync(from, 'utf8').replace(/\r\n/g, '\n'))
      )
  }
}

/**
 * 共用文档里 `<!-- snippet:KEY -->…<!-- /snippet -->` 之间是推荐模板（graph-lua）的内容，在 GitHub 上也能完整阅读。
 * 模板的 _snippets/ 里有 KEY.md（*_ZH.md 文件用 KEY_ZH.md）时替换这一段；标记行本身不写进生成的项目。
 */
function snippetReplacer(template, values) {
  const dir = path.join(templatesDir, template, '_snippets')
  return (fileName, content) =>
    content
      .replace(/__PROJECT_NAME__/g, values.projectName)
      .replace(/__PACKAGE_NAME__/g, values.packageName)
      .replace(
        /<!-- snippet:([A-Z_]+) -->\n([\s\S]*?)\n<!-- \/snippet -->/g,
        (_, key, fallback) => {
          const names = /_ZH\.md$/.test(fileName) ? [`${key}_ZH.md`, `${key}.md`] : [`${key}.md`]
          const file = names.map((name) => path.join(dir, name)).find((name) => fs.existsSync(name))
          return file ? fs.readFileSync(file, 'utf8').trimEnd() : fallback
        }
      )
}

function withInject(config, inject) {
  const block = [
    "  outDir: './dist',",
    '  inject: {',
    `    gameRegion: '${inject.gameRegion}',`,
    `    playerId: ${inject.playerId},`,
    `    mapId: ${inject.mapId}`,
    '  }'
  ].join('\n')
  return config.replace("  outDir: './dist'", block)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const lang = detectLang(options.lang)
  const t = messages(lang)
  const interactive = !options.yes && process.stdin.isTTY && process.stdout.isTTY
  const fail = (message) => {
    if (interactive) p.cancel(message)
    else console.error(message)
    process.exit(1)
  }
  const ask = async (prompt) => {
    const value = await prompt
    if (p.isCancel(value)) fail(t('cancelled'))
    return value
  }
  // clack 自带的按键提示只有英文、显示在列表下方；两种语言都隐藏它，统一在问题后面写说明
  const keys = { showInstructions: false }

  if (options.help) return console.log(t('help'))
  if (options.unknown) fail(`${options.unknown}\n\n${t('help')}`)
  if (options.template && !TEMPLATES.includes(options.template))
    fail(t('unknownTemplate', { template: options.template }))
  if (options.region && !REGIONS.includes(options.region)) fail(t('help'))
  if (
    (options.player && !/^\d+$/.test(options.player)) ||
    (options.map && !/^\d+$/.test(options.map))
  )
    fail(t('playerInvalid'))

  p.updateSettings({ messages: { cancel: t('cancelled'), error: t('error') } })
  if (interactive) p.intro(t('intro'))

  let name = options.positional[0]
  if (!name) {
    if (!interactive) fail(`${t('nameRequired')}\n\n${t('help')}`)
    name = await ask(
      p.text({ message: t('name'), placeholder: 'my-world', defaultValue: 'my-world' })
    )
  }
  const targetDir = path.resolve(name)
  if (isNonEmptyDir(targetDir) && !options.force) {
    if (!interactive) fail(t('dirNotEmptyError', { dir: name }))
    if (!(await ask(p.confirm({ message: t('dirNotEmpty', { dir: name }), initialValue: false }))))
      fail(t('cancelled'))
  }

  const template =
    options.template ??
    (interactive
      ? await ask(
          p.select({
            ...keys,
            message: t('template') + t('keys'),
            initialValue: 'graph-lua',
            options: [
              { value: 'graph-lua', label: t('templateGraphLua'), hint: t('templateGraphLuaHint') },
              { value: 'graph', label: t('templateGraph'), hint: t('templateGraphHint') }
            ]
          })
        )
      : 'graph-lua')

  const pm = packageManager()
  const inject = await chooseInject({ options, interactive, t, lang, ask, fail, keys, pm })

  const values = { projectName: name, packageName: toPackageName(path.basename(targetDir)) }
  const replace = snippetReplacer(template, values)
  copyTemplate(path.join(templatesDir, '_shared'), targetDir, replace)
  copyTemplate(path.join(templatesDir, template), targetDir, replace)
  if (inject) {
    const configPath = path.join(targetDir, 'gsts.config.ts')
    fs.writeFileSync(configPath, withInject(fs.readFileSync(configPath, 'utf8'), inject))
  }

  const install =
    options.install ??
    (interactive
      ? await ask(
          p.confirm({
            message: t('install', { command: `${pm.name} install` }),
            initialValue: true
          })
        )
      : false)
  const installed = install && (await installDependencies(pm, targetDir, interactive, t))

  const cd = /\s/.test(name) ? `cd "${name}"` : `cd ${name}`
  const steps = [cd, ...(installed ? [] : [`${pm.name} install`]), pm.run('dev')].join('\n')
  if (interactive) {
    p.note(steps, t('nextSteps'))
    if (template === 'graph-lua') p.log.info(t('luaSetup'))
    p.outro(t('created', { name }))
  } else {
    console.log(`${t('created', { name })}\n\n${t('nextSteps')}\n${steps.replace(/^/gm, '  ')}`)
  }
}

/**
 * 交互模式下显示带计时的转圈，结束时给出包管理器的结果行（例如 added 213 packages in 35s），失败时打印它的输出；
 * 非交互模式（CI 等）直接把包管理器的输出接到终端。
 */
async function installDependencies(pm, cwd, interactive, t) {
  // Windows 上 npm 等是 .cmd，必须经过 shell 启动；整条命令写成一个字符串（只有固定的包管理器名和 install），
  // 不用"参数数组 + shell"，否则 Node 24 起会出现 DEP0190 警告
  const command = `${pm.name} install`
  const shell = true
  if (!interactive) {
    const ok = spawnSync(command, { cwd, stdio: 'inherit', shell }).status === 0
    if (!ok) console.error(t('installFailed', { command }))
    return ok
  }
  const spin = p.spinner({ indicator: 'timer' })
  spin.start(t('installing', { command }))
  let output = ''
  const code = await new Promise((resolve) => {
    const child = spawn(command, { cwd, shell, stdio: ['ignore', 'pipe', 'pipe'] })
    child.stdout.on('data', (chunk) => (output += chunk))
    child.stderr.on('data', (chunk) => (output += chunk))
    child.on('error', (error) => {
      output += String(error)
      resolve(1)
    })
    child.on('close', resolve)
  })
  const lines = output.trim().split(/\r?\n/).filter(Boolean)
  if (code === 0) {
    const summary = lines.find((line) => /^(added|up to date|changed|removed)\b/.test(line))
    spin.stop(summary ? `${t('installed')} · ${summary}` : t('installed'))
    return true
  }
  spin.error(t('installFailed', { command }))
  if (lines.length) p.log.message(lines.slice(-20).join('\n'))
  return false
}

/** 先用参数；没给 --map 时在交互模式下按本机存档依次选区服、账号和地图。返回 undefined 表示不配置注入。 */
async function chooseInject({ options, interactive, t, lang, ask, fail, keys, pm }) {
  if (!options.inject) return undefined
  const saves = listLocalSaves()
  const regionName = (region) => t(region === 'China' ? 'regionChina' : 'regionGlobal')
  const only = (items) => (new Set(items).size === 1 ? items[0] : undefined)

  if (options.map) {
    const matching = saves.filter(
      (save) =>
        (!options.region || save.region === options.region) &&
        (!options.player || save.playerId === Number(options.player))
    )
    const gameRegion = options.region ?? only(matching.map((save) => save.region))
    const playerId = options.player
      ? Number(options.player)
      : only(matching.map((save) => save.playerId))
    if (!gameRegion || playerId === undefined) fail(t('injectFlagsIncomplete'))
    return { gameRegion, playerId, mapId: Number(options.map) }
  }
  if (!interactive) return undefined
  if (!saves.length) {
    p.log.info(t('injectNoSaves', { maps: pm.run('maps') }))
    return undefined
  }

  const regions = [...new Set(saves.map((save) => save.region))]
  const gameRegion =
    options.region ??
    (regions.length === 1
      ? regions[0]
      : await ask(
          p.select({
            ...keys,
            message: t('region') + t('keys'),
            options: regions.map((region) => ({
              value: region,
              label: regionName(region),
              hint: t('regionSaves', { folder: REGION_FOLDERS[region] })
            }))
          })
        ))

  const accounts = saves.filter((save) => save.region === gameRegion)
  let playerId = options.player ? Number(options.player) : undefined
  if (playerId === undefined && accounts.length === 1) {
    playerId = accounts[0].playerId
    p.log.info(t('playerUsed', { player: playerId, region: regionName(gameRegion) }))
  }
  if (playerId === undefined) {
    const choice = await ask(
      p.select({
        ...keys,
        message: t('player') + t('keys'),
        options: [
          ...accounts.map((save) => ({
            value: save.playerId,
            label: String(save.playerId),
            hint: t('playerMaps', { count: save.maps.length })
          })),
          { value: 'other', label: t('playerOther') }
        ]
      })
    )
    playerId =
      choice === 'other'
        ? Number(
            await ask(
              p.text({
                message: t('playerInput'),
                validate: (value) => (/^\d+$/.test(value ?? '') ? undefined : t('playerInvalid'))
              })
            )
          )
        : choice
  }

  const maps = accounts.find((save) => save.playerId === playerId)?.maps ?? []
  if (!maps.length) {
    p.log.info(t('mapNone', { player: playerId }))
    return undefined
  }
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'
  const mapId = await ask(
    p.select({
      ...keys,
      message: t('map') + t('keys'),
      maxItems: 8,
      options: [
        ...maps.map((map) => ({
          value: map.mapId,
          label: String(map.mapId),
          hint: `${t('mapRecent')} ${new Date(map.mtimeMs).toLocaleString(locale)}`
        })),
        { value: 'skip', label: t('mapSkip') }
      ]
    })
  )
  if (mapId === 'skip') return undefined
  p.log.info(
    t('injectConfigured', { map: mapId, player: playerId, region: regionName(gameRegion) })
  )
  return { gameRegion, playerId, mapId }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
