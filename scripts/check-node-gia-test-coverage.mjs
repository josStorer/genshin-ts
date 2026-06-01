import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const GENERATED_DIR = path.join(ROOT, 'tests', 'generated')

const requiredNodeSnippets = [
  'f.refreshNotificationQueue(',
  'f.switchCustomMaps(',
  'f.noOfTasksConfigured(',
  'f.increaseTaskCount(',
  'f.querySpecifiedTaskCount(',
  'f.queryIfSpecifiedTaskIsCompleted('
]

const requiredClassicSnippets = [
  "mode: 'classic'",
  'f.teleportPlayer(',
  'f.reviveActiveCharacter(',
  'f.setCharacterSElementalEnergy(',
  'f.increasesCharacterSElementalEnergy(',
  'f.checkClassicModeCharacterId(',
  'f.getActiveCharacterOfSpecifiedPlayer('
]

const forbiddenClassicSnippets = [
  'f.teleportPlayer(1,',
  'f.reviveActiveCharacter(1)',
  'f.setCharacterSElementalEnergy(1,',
  'f.increasesCharacterSElementalEnergy(1,',
  'f.checkClassicModeCharacterId(1)',
  'f.getActiveCharacterOfSpecifiedPlayer(1)'
]

function readGeneratedFiles() {
  if (!fs.existsSync(GENERATED_DIR)) return []
  return fs
    .readdirSync(GENERATED_DIR, { withFileTypes: true })
    .filter((ent) => ent.isFile() && ent.name.endsWith('.ts'))
    .map((ent) => ({
      name: ent.name,
      text: fs.readFileSync(path.join(GENERATED_DIR, ent.name), 'utf8')
    }))
}

function requireAny(files, snippet, label) {
  if (!files.some((file) => file.text.includes(snippet))) {
    throw new Error(`[coverage] missing ${label}: ${snippet}`)
  }
}

function requireAnyMatch(files, pattern, label) {
  if (!files.some((file) => pattern.test(file.text))) {
    throw new Error(`[coverage] missing ${label}: ${pattern}`)
  }
}

const files = readGeneratedFiles()
for (const snippet of requiredNodeSnippets) requireAny(files, snippet, 'new-node coverage')
requireAnyMatch(
  files,
  /const\s+(\w+)\s*=\s*f\.querySpecifiedTaskCount\([^)]*\)[\s\S]*f\.dataTypeConversion\(\1,\s*'str'\)[\s\S]*f\.printString\(/,
  'querySpecifiedTaskCount output-pin consumption'
)
requireAnyMatch(
  files,
  /const\s+(\w+)\s*=\s*f\.queryIfSpecifiedTaskIsCompleted\([^)]*\)[\s\S]*f\.dataTypeConversion\(\1,\s*'str'\)[\s\S]*f\.printString\(/,
  'queryIfSpecifiedTaskIsCompleted output-pin consumption'
)

const classicFiles = files.filter((file) => file.name.startsWith('classic.'))
if (!classicFiles.length) {
  throw new Error('[coverage] missing classic generated test files')
}
for (const snippet of requiredClassicSnippets) {
  requireAny(classicFiles, snippet, 'classic coverage')
}
requireAnyMatch(
  classicFiles,
  /const\s+(\w+)\s*=\s*f\.checkClassicModeCharacterId\([^)]*\)[\s\S]*f\.dataTypeConversion\(\1,\s*'str'\)[\s\S]*f\.printString\(/,
  'checkClassicModeCharacterId output-pin consumption'
)
requireAnyMatch(
  classicFiles,
  /const\s+(\w+)\s*=\s*f\.getActiveCharacterOfSpecifiedPlayer\([^)]*\)[\s\S]*f\.dataTypeConversion\(\1,\s*'str'\)[\s\S]*f\.printString\(/,
  'getActiveCharacterOfSpecifiedPlayer output-pin consumption'
)
for (const snippet of forbiddenClassicSnippets) {
  if (classicFiles.some((file) => file.text.includes(snippet))) {
    throw new Error(`[coverage] invalid classic entity argument: ${snippet}`)
  }
}
requireAny(classicFiles, 'whenTheActiveCharacterChanges', 'classic event coverage')

console.log('[ok] node GIA generated-test coverage looks complete')
