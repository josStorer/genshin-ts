import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

const projects = new Map()
const mtime = (file) => (fs.existsSync(file) ? fs.statSync(file).mtimeMs : -1)

/** 与 parser 的 project:true 一样选择最近的 tsconfig，不要求目录名是 lua。 */
export function isLuaProjectFile(filename) {
  if (!/\.tsx?$/.test(filename)) return false
  const config = ts.findConfigFile(path.dirname(path.resolve(filename)), ts.sys.fileExists)
  if (!config) return false
  const previous = projects.get(config)
  if (previous && [...previous.reads].every(([file, time]) => mtime(file) === time))
    return previous.lua
  const reads = new Map()
  const parsed = ts.getParsedCommandLineOfConfigFile(
    config,
    {},
    {
      ...ts.sys,
      readDirectory: () => [],
      readFile(file) {
        reads.set(file, mtime(file))
        return ts.sys.readFile(file)
      },
      onUnRecoverableConfigFileDiagnostic: () => {}
    }
  )
  const lua =
    parsed?.options.types?.some((type) =>
      /(?:^|\/)lua_globals(?:\.d\.ts)?$/.test(type.replaceAll('\\', '/'))
    ) ?? false
  projects.set(config, { reads, lua })
  return lua
}
