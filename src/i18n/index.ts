import { match } from '@formatjs/intl-localematcher'
import i18next from 'i18next'
import { osLocaleSync } from 'os-locale'

// Static JSON imports also allow the Lua editor rules to be bundled as CommonJS.
import enUS from './locales/en-US/main.json' with { type: 'json' }
import zhCN from './locales/zh-CN/main.json' with { type: 'json' }

export type Lang = 'zh-CN' | 'en-US'

function normalizeLocale(s: string): string {
  return s.replace(/_/g, '-').trim()
}

function envLocaleCandidates(): string[] {
  const keys = ['LC_ALL', 'LC_MESSAGES', 'LANG', 'LANGUAGE']
  const out: string[] = []
  for (const k of keys) {
    const v = process.env[k]
    if (!v) continue
    // e.g. zh_CN.UTF-8
    out.push(normalizeLocale(v.split('.', 1)[0] ?? v))
  }
  return out
}

export function detectLang(raw?: string): Lang {
  if (raw && raw !== 'auto') {
    return raw.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US'
  }

  const supported = ['zh-CN', 'en-US'] as const
  const candidates: string[] = []

  candidates.push(...envLocaleCandidates())
  try {
    candidates.push(normalizeLocale(osLocaleSync()))
  } catch {
    // ignore
  }
  try {
    candidates.push(normalizeLocale(Intl.DateTimeFormat().resolvedOptions().locale))
  } catch {
    // ignore
  }

  const picked = match(candidates.filter(Boolean), supported, 'en-US')
  return picked as Lang
}

export function initCliI18n(lang: Lang) {
  if (!i18next.isInitialized) {
    void i18next.init({
      lng: lang,
      fallbackLng: 'en-US',
      initImmediate: false,
      showSupportNotice: false,
      interpolation: { escapeValue: false },
      resources: {
        'zh-CN': { translation: zhCN },
        'en-US': { translation: enUS }
      }
    })
  } else {
    void i18next.changeLanguage(lang)
  }
  return {
    lang,
    t: i18next.t.bind(i18next) as (key: string, options?: Record<string, unknown>) => string
  }
}

/**
 * Convenience translation helper for non-CLI modules.
 *
 * - If i18n is not initialized yet, it will auto-init with detected language.
 * - Safe to call multiple times.
 */
export function t(key: string, options?: Record<string, unknown>) {
  if (!i18next.isInitialized) {
    initCliI18n(getCliLanguage())
  }
  return i18next.t(key, options)
}

/** 当前命令选择的语言；工作线程也使用这一语言。 */
export function getCliLanguage(): Lang {
  if (i18next.resolvedLanguage) return i18next.resolvedLanguage as Lang
  // 编辑器直接使用规则时没有 CLI 初始化；C 等系统 locale 无法匹配时使用英文。
  try {
    return detectLang()
  } catch {
    return 'en-US'
  }
}
