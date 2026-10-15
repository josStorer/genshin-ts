#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2)
const flags = new Set(args.filter((arg) => arg.startsWith('--')))
const nameArg = args.find((arg) => !arg.startsWith('--')) ?? ''
const force = flags.has('--force')
const withLua = flags.has('--with-lua')

const toPackageName = (input) => {
  const base = input.trim().toLowerCase()
  const sanitized = base
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-._]/g, '-')
    .replace(/^-+/g, '')
    .replace(/-+/g, '-')
    .replace(/^[_\.]+/g, '')
  return sanitized || 'gsts-project'
}

const prompt = async (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

const resolveTargetDir = async () => {
  if (nameArg) return nameArg
  const answer = await prompt('Project name: ')
  return answer.trim()
}

const replacePlaceholders = (content, values) => {
  return content
    .replace(/__PROJECT_NAME__/g, values.projectName)
    .replace(/__PACKAGE_NAME__/g, values.packageName)
}

const copyDir = async (sourceDir, targetDir, values) => {
  await fs.mkdir(targetDir, { recursive: true })
  const entries = await fs.readdir(sourceDir, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry.name)
    const targetName = entry.name === '_gitignore' ? '.gitignore' : entry.name
    const destPath = path.join(targetDir, targetName)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, values)
    } else {
      const raw = await fs.readFile(srcPath, 'utf8')
      const content = replacePlaceholders(raw, values)
      await fs.writeFile(destPath, content, 'utf8')
    }
  }
}

const run = async () => {
  const projectName = await resolveTargetDir()
  if (!projectName) {
    console.error('Project name is required.')
    process.exit(1)
  }

  const targetDir = path.resolve(process.cwd(), projectName)
  try {
    const stat = await fs.stat(targetDir)
    if (stat.isDirectory()) {
      const existing = await fs.readdir(targetDir)
      if (existing.length > 0 && !force) {
        console.error('Target directory is not empty. Use --force to overwrite.')
        process.exit(1)
      }
    }
  } catch (err) {
    if (err?.code !== 'ENOENT') throw err
  }

  const values = {
    projectName,
    packageName: toPackageName(path.basename(projectName))
  }

  const templateDir = path.resolve(__dirname, '../templates/start')
  await copyDir(templateDir, targetDir, values)
  if (withLua) {
    await copyDir(path.resolve(__dirname, '../templates/lua'), targetDir, values)
    const configPath = path.join(targetDir, 'tsconfig.json')
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'))
    config.exclude = [...(config.exclude ?? []), 'src/lua']
    await fs.writeFile(configPath, JSON.stringify(config, null, 2) + '\n')
    const packagePath = path.join(targetDir, 'package.json')
    const manifest = JSON.parse(await fs.readFile(packagePath, 'utf8'))
    manifest.scripts['typecheck:lua'] = 'tsc -p src/lua/tsconfig.json --noEmit'
    await fs.writeFile(packagePath, JSON.stringify(manifest, null, 2) + '\n')
    const guide = await fs.readFile(path.join(targetDir, 'docs/LUA.md'), 'utf8')
    for (const name of ['AGENTS.md', 'CLAUDE.md'])
      await fs.appendFile(path.join(targetDir, name), '\n\n' + guide)
  }

  console.log(`\nCreated ${values.projectName}`)
  console.log('\nNext steps:')
  console.log(`  cd ${values.projectName}`)
  console.log('  npm install')
  console.log('  npm run dev')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
