import fs from 'node:fs'
import path from 'node:path'

import { locateLua } from '../compiler/lua/output/source_maps.js'
import { t } from '../i18n/index.js'

export async function runLuaLocate(
  location: string | undefined,
  options: { column?: string; log?: string; outDir?: string }
) {
  const text = options.log ? fs.readFileSync(options.log, 'utf8') : location
  if (!text) throw new Error(t('lua_locateInput'))
  const matches = [...text.matchAll(/(?:\[string ")?([^\r\n"[\]]+?\.lua)(?:"\])?:(\d+)/g)]
  if (!matches.length) throw new Error(t('lua_locateInput'))
  const column = Number(options.column ?? 1)
  if (!Number.isInteger(column) || column < 1) throw new Error(t('lua_locateInput'))
  for (const match of matches) {
    let file = match[1].trim()
    const line = Number(match[2])
    if (!path.isAbsolute(file) && options.outDir) file = path.resolve(options.outDir, 'lua', file)
    const position = await locateLua(file, line, column)
    console.log(
      position
        ? t('lua_locateResult', {
            arg0: `${file}:${line}`,
            arg1: `${path.relative(process.cwd(), position.file)}:${position.line}:${position.column}`,
            arg2: position.hash.slice(0, 12)
          })
        : t('lua_locateGenerated', { arg0: `${file}:${line}` })
    )
  }
}
