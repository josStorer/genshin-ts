// 脚手架的中英文提示。{name} 形式的占位符由 format 填入。

const zh = {
  intro: '创建 Genshin-TS 项目',
  name: '项目名称',
  nameRequired: '需要项目名称。',
  dirNotEmpty: '目录 {dir} 不为空，继续会覆盖其中的同名文件。要继续吗？',
  dirNotEmptyError: '目标目录 {dir} 不为空。加 --force 才会覆盖。',
  template: '选择模板',
  keys: '（↑/↓ 选择，回车确认）',
  templateGraphLua: '节点图 + Lua（推荐）',
  templateGraphLuaHint: '服务器节点图加客户端控件 Lua 脚本，两边共用信号和常量',
  templateGraph: '仅节点图',
  templateGraphHint: '只有服务器节点图，之后可以按文档加入 Lua',
  unknownTemplate: '未知模板 {template}，可选：graph-lua、graph。',
  injectNoSaves:
    '没有找到本地地图存档（先在编辑器里保存一次地图）。之后可以在 gsts.config.ts 里填写 inject，或运行 {maps} 查看地图。',
  region: '选择游戏区服',
  regionChina: '国服',
  regionGlobal: '国际服',
  regionSaves: '存档在 {folder}',
  player: '选择账号（用户 ID）',
  playerMaps: '{count} 张地图',
  playerOther: '其他 ID（手动输入）',
  playerInput: '输入用户 ID',
  playerInvalid: '用户 ID 只能是数字。',
  playerUsed: '使用账号 {player}（{region}）',
  map: '选择要注入的地图',
  mapRecent: '最近修改',
  mapSkip: '暂不配置，之后在 gsts.config.ts 里填写',
  mapNone: '账号 {player} 下还没有地图存档，先跳过注入配置。',
  injectFlagsIncomplete:
    '用 --map 配置注入时，找到了多个区服或账号，请再加上 --region 和 --player。',
  injectConfigured: '注入目标：地图 {map}（账号 {player}，{region}）',
  install: '现在安装依赖吗？（{command}）',
  installing: '正在安装依赖（{command}），通常需要一两分钟',
  installed: '依赖安装完成',
  installFailed: '依赖安装失败，可以稍后在项目目录里运行 {command}。',
  created: '已创建 {name}',
  nextSteps: '接下来：',
  luaSetup: '使用 Lua 前，按 README_ZH.md 里的"首次运行前"在编辑器中添加控件、信号并挂载脚本。',
  cancelled: '已取消。',
  error: '出错了',
  help: `用法：npm create genshin-ts@latest [项目名] -- [选项]

选项：
  --template <graph-lua|graph>  模板，默认 graph-lua（节点图 + Lua）
  --lang <zh|en>                提示语言，默认跟随系统
  --region <China|Global>       注入用的游戏区服
  --player <id>                 注入用的用户 ID
  --map <id>                    注入用的地图 ID
  --no-inject                   不配置注入
  --install / --no-install      创建后是否安装依赖
  -y, --yes                     不提问，未给出的选项用默认值（不配置注入、不安装依赖）
  --force                       目标目录不为空时也写入
  -h, --help                    显示帮助`
}

const en = {
  intro: 'Create a Genshin-TS project',
  name: 'Project name',
  nameRequired: 'A project name is required.',
  dirNotEmpty: '{dir} is not empty; files with the same names will be overwritten. Continue?',
  dirNotEmptyError: 'Target directory {dir} is not empty. Use --force to overwrite.',
  template: 'Choose a template',
  keys: ' (↑/↓ to move, Enter to confirm)',
  templateGraphLua: 'Node graphs + Lua (recommended)',
  templateGraphLuaHint:
    'Server node graphs plus client control Lua scripts, sharing signals and constants',
  templateGraph: 'Node graphs only',
  templateGraphHint: 'Server node graphs only; add Lua later by following the docs',
  unknownTemplate: 'Unknown template {template}. Use graph-lua or graph.',
  injectNoSaves:
    'No local map saves found (save a map in the editor first). Fill in inject in gsts.config.ts later, or run {maps} to list maps.',
  region: 'Choose the game region',
  regionChina: 'China',
  regionGlobal: 'Global',
  regionSaves: 'saves in {folder}',
  player: 'Choose the account (user ID)',
  playerMaps: '{count} maps',
  playerOther: 'Another ID (type it)',
  playerInput: 'User ID',
  playerInvalid: 'The user ID must be a number.',
  playerUsed: 'Using account {player} ({region})',
  map: 'Choose the map to inject into',
  mapRecent: 'last modified',
  mapSkip: 'Skip for now; fill it in gsts.config.ts later',
  mapNone: 'Account {player} has no map saves yet; skipping the inject setup.',
  injectFlagsIncomplete:
    'Several regions or accounts were found for --map; add --region and --player as well.',
  injectConfigured: 'Inject target: map {map} (account {player}, {region})',
  install: 'Install dependencies now? ({command})',
  installing: 'Installing dependencies ({command}); this usually takes a minute or two',
  installed: 'Dependencies installed',
  installFailed: 'Installing dependencies failed; run {command} in the project folder later.',
  created: 'Created {name}',
  nextSteps: 'Next steps:',
  luaSetup:
    'Before using Lua, add the controls and the signal in the editor and mount the scripts, as described under "Before the first run" in README.md.',
  cancelled: 'Cancelled.',
  error: 'Something went wrong',
  help: `Usage: npm create genshin-ts@latest [project-name] -- [options]

Options:
  --template <graph-lua|graph>  Template; graph-lua (node graphs + Lua) by default
  --lang <zh|en>                Prompt language; follows the system by default
  --region <China|Global>       Game region for injection
  --player <id>                 User ID for injection
  --map <id>                    Map ID for injection
  --no-inject                   Do not set up injection
  --install / --no-install      Install dependencies after creating
  -y, --yes                     Ask nothing; options not given use defaults (no inject, no install)
  --force                       Write into a directory that is not empty
  -h, --help                    Show this help`
}

/** --lang 优先，其次是 LANG 等环境变量，最后是系统区域设置；中文以外都用英文。 */
export function detectLang(flag) {
  const locale =
    flag ||
    process.env.LC_ALL ||
    process.env.LC_MESSAGES ||
    process.env.LANG ||
    Intl.DateTimeFormat().resolvedOptions().locale
  return /^zh/i.test(locale) ? 'zh' : 'en'
}

export function messages(lang) {
  const table = lang === 'zh' ? zh : en
  return (key, values = {}) =>
    table[key].replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`))
}
