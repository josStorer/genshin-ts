import fs from 'node:fs'

const DETAIL_ID = 'mh4imrrhzdzi'
const PREFABS_PATH = 'src/definitions/prefabs.ts'
const DETAIL_URLS = {
  zh: `https://act.mihoyo.com/ys/ugc/tutorial/detail/${DETAIL_ID}?lang=zh-cn`,
  en: `https://act.mihoyo.com/ys/ugc/tutorial/detail/${DETAIL_ID}?lang=en-us`
}
const headers = { 'User-Agent': 'Mozilla/5.0' }

async function fetchText(url) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`)
  return await res.text()
}

function htmlDecode(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function stripTags(html) {
  return htmlDecode(html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' '))
}

function parseRows(contentHtml) {
  const rows = []
  for (const tr of contentHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...tr[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
      stripTags(m[1])
    )
    if (cells.length >= 2 && /^\d+$/.test(cells[0])) rows.push([Number(cells[0]), cells[1]])
  }
  return rows
}

function parseExportedObject(source, exportName) {
  const start = source.indexOf(`export const ${exportName} = {`)
  if (start < 0) throw new Error(`missing export ${exportName}`)
  const open = source.indexOf('{', start)
  let depth = 0
  let end = -1
  for (let i = open; i < source.length; i++) {
    const ch = source[i]
    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  if (end < 0) throw new Error(`unterminated export ${exportName}`)
  return Function(`return (${source.slice(open, end + 1)});`)()
}

function keyForEnglishName(name) {
  return name.replace(/ /g, '_').replace(/[()]/g, '').replace(/[^\p{L}\p{N}_]/gu, '')
}

function compareRows(rows, object, keyForName) {
  const docs = new Map(rows.map(([id, name]) => [keyForName(name), { id, name }]))
  const current = new Map(Object.entries(object))
  const missing = []
  const extra = []
  const mismatched = []

  for (const [key, item] of docs) {
    if (!current.has(key)) missing.push({ key, ...item })
    else if (current.get(key) !== item.id)
      mismatched.push({ key, name: item.name, doc: item.id, current: current.get(key) })
  }
  for (const [key, id] of current) {
    if (!docs.has(key)) extra.push({ key, id })
  }

  return { docCount: rows.length, currentCount: current.size, missing, extra, mismatched }
}

async function resolveContent(lang, detailUrl) {
  const detailHtml = await fetchText(detailUrl)
  const assetUrls = [...detailHtml.matchAll(/(?:href|src)="([^"]+\.js)"/g)].map((m) =>
    new URL(m[1], detailUrl).href
  )
  const assetTexts = await Promise.all(
    [...new Set(assetUrls)].map(async (url) => [url, await fetchText(url)])
  )
  const indexJs = assetTexts.find(([, text]) =>
    text.includes('act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn')
  )
  if (!indexJs) throw new Error(`knowledge base not found from ${detailUrl}`)

  const knowledgeBase = indexJs[1].match(
    /"(https:\/\/act-webstatic\.mihoyo\.com\/ugc-tutorial\/knowledge\/cn)"/
  )?.[1]
  if (!knowledgeBase) throw new Error(`knowledge base regex failed from ${indexJs[0]}`)

  const catalogUrl = `${knowledgeBase}/${lang}/catalog.json`
  const catalog = JSON.parse(await fetchText(catalogUrl))
  const flat = []
  const walk = (items) =>
    items?.forEach((item) => {
      flat.push(item)
      walk(item.children)
    })
  walk(catalog)

  const doc = flat.find((item) => item.path_id === DETAIL_ID)
  if (!doc) throw new Error(`detail id ${DETAIL_ID} not found in ${catalogUrl}`)

  const contentUrl = `${knowledgeBase}/${lang}/${doc.real_id}/content.html?v=1016`
  const contentHtml = await fetchText(contentUrl)
  return {
    catalogUrl,
    contentUrl,
    title: doc.title,
    updatedAt: doc.updated_at,
    rows: parseRows(contentHtml)
  }
}

const [zhDoc, enDoc] = await Promise.all([
  resolveContent('zh-cn', DETAIL_URLS.zh),
  resolveContent('en-us', DETAIL_URLS.en)
])
const source = fs.readFileSync(PREFABS_PATH, 'utf8')
const zhCompare = compareRows(
  zhDoc.rows,
  parseExportedObject(source, 'CharacterPrefabZh'),
  (name) => name
)
const enCompare = compareRows(
  enDoc.rows,
  parseExportedObject(source, 'CharacterPrefab'),
  keyForEnglishName
)

const result = {
  zh: {
    title: zhDoc.title,
    updatedAt: zhDoc.updatedAt,
    catalogUrl: zhDoc.catalogUrl,
    contentUrl: zhDoc.contentUrl,
    ...zhCompare
  },
  en: {
    title: enDoc.title,
    updatedAt: enDoc.updatedAt,
    catalogUrl: enDoc.catalogUrl,
    contentUrl: enDoc.contentUrl,
    ...enCompare
  }
}

console.log(JSON.stringify(result, null, 2))

if ([zhCompare, enCompare].some((r) => r.missing.length || r.extra.length || r.mismatched.length)) {
  process.exitCode = 1
}
