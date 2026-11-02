// 把 create-genshin-ts/src 打包成单个 bin/create-genshin-ts.mjs，依赖一起打进去，发布后用户不用安装额外依赖。
// 同时按实际打进去的第三方包生成 bin/THIRD_PARTY_LICENSES.md（MIT 等协议要求随附版权声明）。

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { build } from 'esbuild'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageDir = path.join(repoRoot, 'create-genshin-ts')
const outfile = path.join(packageDir, 'bin', 'create-genshin-ts.mjs')

const result = await build({
  entryPoints: [path.join(packageDir, 'src', 'index.mjs')],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  banner: { js: '#!/usr/bin/env node' },
  legalComments: 'none',
  metafile: true,
  logLevel: 'warning'
})

// metafile 里 node_modules 下的输入文件对应实际打包的第三方包
const packages = new Set()
for (const input of Object.keys(result.metafile.inputs)) {
  const match = /node_modules\/((?:@[^/]+\/)?[^/]+)\//.exec(input.replaceAll('\\', '/'))
  if (match) packages.add(match[1])
}
const sections = [...packages].sort().map((name) => {
  const dir = path.join(repoRoot, 'node_modules', name)
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
  const licenseFile = fs.readdirSync(dir).find((file) => /^licen[cs]e/i.test(file))
  if (!licenseFile) throw new Error(`${name} has no license file to bundle`)
  const text = fs.readFileSync(path.join(dir, licenseFile), 'utf8').trim()
  return `## ${name}@${pkg.version} (${pkg.license})\n\n${text}\n`
})
fs.writeFileSync(
  path.join(packageDir, 'bin', 'THIRD_PARTY_LICENSES.md'),
  `# Third-party licenses\n\nbin/create-genshin-ts.mjs bundles the following packages.\n\n${sections.join('\n')}`
)
console.log('[ok] bundled', path.relative(repoRoot, outfile), `(${[...packages].join(', ')})`)
