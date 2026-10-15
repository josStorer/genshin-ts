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
  path.join(repoRoot, 'src', 'runtime', 'lua-globals.d.ts'),
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
  path.join(repoRoot, 'src/runtime/lua-assets'),
  path.join(repoRoot, 'dist/src/runtime/lua-assets'),
  { recursive: true }
)

// Keep the runtime writer table and TypeScript signal types on one data source.
const { luaSignalWriters } = await import('../dist/src/runtime/lua-signals.js')
const writerTable = (suffix = '') =>
  Object.entries(luaSignalWriters)
    .map(([name, method]) => `${name}="${method}${suffix}"`)
    .join(', ')
const helperPath = path.join(repoRoot, 'dist/src/runtime/lua-assets/helpers.lua')
const helperSource = fs.readFileSync(helperPath, 'utf8')
const helperNewline = helperSource.includes('\r\n') ? '\r\n' : '\n'
fs.writeFileSync(
  helperPath,
  helperSource.replace(
    '-- @gsts:signal-writers',
    `local writers = {${writerTable()}}${helperNewline}for name, method in pairs({${writerTable('List')}}) do writers[name .. "_list"] = method end`
  )
)

const { build } = await import('esbuild')
// CommonJS has no import.meta. The only user in this bundle is src/i18n/index.ts, which loads
// its locale JSON through createRequire, so point it at the compiled i18n module's location.
await build({
  entryPoints: [path.join(repoRoot, 'src/compiler/lua/diagnostics.ts')],
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
