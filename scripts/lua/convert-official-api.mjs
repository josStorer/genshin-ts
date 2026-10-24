// 把官方《客户端控件 API》页面转成 resources/lua/official-api*.txt 的纯文本格式，供 generate-lua-definitions 读取：
// 表格行写成 "| 单元格 | 单元格"，其他段落各占一行。
// 中文页 mhtakr07vej4 → official-api.txt；英文页 mhn6th9wsw7e → official-api.en.txt。
// 页面地址：https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/<zh-cn|en-us>/<id>/content.html
// 用法：node scripts/lua/convert-official-api.mjs page.html resources/lua/official-api.txt

import fs from 'node:fs'

const [input, output] = process.argv.slice(2)
const html = fs.readFileSync(input, 'utf8').replace(/<colgroup>[\s\S]*?<\/colgroup>/g, '')
const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'", nbsp: ' ' }
const decode = (text) =>
  text
    .replace(/&(amp|lt|gt|quot|apos|#39|nbsp);/g, (_, name) => entities[name])
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
const strip = (fragment) =>
  decode(
    fragment
      .replace(/<\/(p|li|h\d)>/g, ' ')
      .replace(/<br\s*\/?>/g, ' ')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\s+/g, ' ')
    .trim()
const lines = []
const blocks = (fragment) => {
  for (const part of fragment.split(/<\/(?:p|li|h\d)>|<br\s*\/?>/)) {
    const text = strip(part)
    if (text) lines.push(text)
  }
}
let rest = html
for (;;) {
  const start = rest.search(/<table[\s>]/)
  if (start < 0) break
  blocks(rest.slice(0, start))
  const end = rest.indexOf('</table>', start)
  for (const row of rest.slice(start, end).match(/<tr[\s\S]*?<\/tr>/g) ?? []) {
    const cells = [...row.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((m) => strip(m[1]))
    lines.push('| ' + cells.join(' | '))
  }
  rest = rest.slice(end + '</table>'.length)
}
blocks(rest)
fs.writeFileSync(output, lines.join('\n'))
console.log(lines.length, 'lines')
