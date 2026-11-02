import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)))
const repoRoot = path.resolve(root, '..')

const srcProto = path.join(
  repoRoot,
  'src',
  'thirdparty',
  'Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack',
  'protobuf',
  'gia.proto'
)

const distProto = path.join(
  repoRoot,
  'dist',
  'src',
  'thirdparty',
  'Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack',
  'protobuf',
  'gia.proto'
)

fs.mkdirSync(path.dirname(distProto), { recursive: true })
fs.copyFileSync(srcProto, distProto)
console.log('[ok] copied', srcProto, '->', distProto)

const extraDtsFiles = [
  path.join(repoRoot, 'src', 'runtime', 'lua_globals.d.ts'),
  path.join(repoRoot, 'src', 'definitions', 'server_on_overloads.d.ts'),
  path.join(repoRoot, 'src', 'runtime', 'IR.d.ts')
]

extraDtsFiles.forEach((srcFile) => {
  if (!fs.existsSync(srcFile)) return
  const rel = path.relative(path.join(repoRoot, 'src'), srcFile)
  const destFile = path.join(repoRoot, 'dist', 'src', rel)
  fs.mkdirSync(path.dirname(destFile), { recursive: true })
  fs.copyFileSync(srcFile, destFile)
  console.log('[ok] copied', srcFile, '->', destFile)
})

const serverGlobalsSrc = path.join(repoRoot, 'src', 'runtime', 'server_globals.d.ts')
const serverGlobalsDest = path.join(
  repoRoot,
  'dist',
  'src',
  'runtime',
  'server_globals.global.d.ts'
)
if (fs.existsSync(serverGlobalsSrc)) {
  fs.mkdirSync(path.dirname(serverGlobalsDest), { recursive: true })
  fs.copyFileSync(serverGlobalsSrc, serverGlobalsDest)
  console.log('[ok] copied', serverGlobalsSrc, '->', serverGlobalsDest)
}

fs.cpSync(
  path.join(repoRoot, 'src/runtime/lua_assets'),
  path.join(repoRoot, 'dist/src/runtime/lua_assets'),
  { recursive: true }
)

const { build } = await import('esbuild')
const { generateLuaDataModules } = await import('../dist/src/compiler/lua/output/data_modules.js')
generateLuaDataModules(repoRoot)
// CommonJS has no import.meta. Locale loading needs the i18n directory; SDK resolution
// uses the same package's package.json, so this base works for both createRequire calls.
await build({
  entryPoints: [path.join(repoRoot, 'src/compiler/lua/analysis/diagnostics.ts')],
  outfile: path.join(repoRoot, 'dist/src/compiler/lua/editor.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  external: ['typescript'],
  define: { 'import.meta.url': '__gstsI18nModuleUrl' },
  banner: {
    js: "'use strict';\nconst __gstsI18nModuleUrl = require('node:url').pathToFileURL(require('node:path').join(__dirname, '../../i18n/index.js')).href;"
  }
})

// npm create genshin-ts 的打包产物
await import('./build-create.mjs')
