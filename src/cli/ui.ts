import pc from 'picocolors'

export type Ui = {
  ok: (msg: string, ...rest: unknown[]) => void
  warn: (msg: string, ...rest: unknown[]) => void
  error: (msg: string, ...rest: unknown[]) => void
  info: (msg: string, ...rest: unknown[]) => void
  highlight: (s: string) => string
}

/** 与 createUi 相同的行首标签；先缓存、稍后统一输出的行也用它们。 */
export const uiTags = {
  ok: pc.green('[ok]'),
  warn: pc.yellow('[warn]'),
  error: pc.red('[error]'),
  info: pc.cyan('[info]')
}

export function createUi(): Ui {
  return {
    ok: (msg, ...rest) => console.log(uiTags.ok, msg, ...rest),
    warn: (msg, ...rest) => console.warn(uiTags.warn, msg, ...rest),
    error: (msg, ...rest) => console.error(uiTags.error, msg, ...rest),
    info: (msg, ...rest) => console.log(uiTags.info, msg, ...rest),
    highlight: (s) => pc.cyan(s)
  }
}
