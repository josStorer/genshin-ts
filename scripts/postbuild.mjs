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

fs.cpSync(path.join(repoRoot, "src/runtime/lua-assets"), path.join(repoRoot, "dist/src/runtime/lua-assets"), { recursive: true })
