import { LanguageId, tokensFor } from './index'

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char])
}

/**
 * Allowlist for hrefs. Anything that is not plainly a web, mail or relative
 * link is dropped, which keeps javascript: and friends out of the preview.
 */
function safeUrl(url: string, allowImageData = false): string {
  const trimmed = url.trim()
  if (allowImageData && /^data:image\/[\w+.-]+;base64,[\w+/=\s]*$/i.test(trimmed)) {
    return trimmed
  }
  if (/^(?:https?:\/\/|mailto:|tel:|#|\/|\.{1,2}\/|[\w-]+\.[\w-]+)/i.test(trimmed)) {
    return trimmed
  }
  return ''
}

const FENCE_ALIAS: Record<string, LanguageId> = {
  js: 'javascript',
  javascript: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  node: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  tsx: 'typescript',
  py: 'python',
  python: 'python',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  shell: 'shell',
  console: 'shell',
  yml: 'yaml',
  yaml: 'yaml',
  json: 'json',
  html: 'html',
  xml: 'xml',
  svg: 'xml',
  css: 'css',
  scss: 'css',
  less: 'css',
  md: 'markdown',
  markdown: 'markdown',
  sql: 'sql',
  java: 'java',
  cs: 'csharp',
  csharp: 'csharp',
  go: 'go',
  golang: 'go',
  rs: 'rust',
  rust: 'rust',
  c: 'cpp',
  cpp: 'cpp',
  h: 'cpp',
  hpp: 'cpp',
  php: 'php',
}

function highlight(code: string, hint: string): string {
  const id = FENCE_ALIAS[hint.toLowerCase()]
  if (!id) return escapeHtml(code)
  return tokensFor(id, code)
    .map((token) =>
      token.kind === 'plain'
        ? escapeHtml(token.text)
        : `<span class="tok-${token.kind}">${escapeHtml(token.text)}</span>`
    )
    .join('')
}

/**
 * Code spans are lifted out before escaping, then put back at the end. The
 * marker is a private-use code point, so it cannot collide with real text.
 */
const GUARD = '\uE000'

function renderInline(text: string): string {
  const codeSpans: string[] = []

  let html = text.replace(/(`+)([\s\S]*?)\1/g, (_match, _ticks, body: string) => {
    codeSpans.push(`<code>${escapeHtml(body.replace(/^ | $/g, ''))}</code>`)
    return `${GUARD}${codeSpans.length - 1}${GUARD}`
  })

  html = escapeHtml(html)

  html = html.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+[^)]*)?\)/g,
    (match, alt: string, url: string) => {
      const src = safeUrl(url, true)
      return src ? `<img src="${src}" alt="${alt}" loading="lazy">` : match
    }
  )

  html = html.replace(
    /\[([^\]]*)\]\(([^)\s]*)(?:\s+[^)]*)?\)/g,
    (match, label: string, url: string) => {
      const href = safeUrl(url)
      return href
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
        : match
    }
  )

  html = html
    .replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, (_match, url: string) => {
      const href = safeUrl(url)
      return href
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${href}</a>`
        : `&lt;${url}&gt;`
    })
    .replace(/\*\*([^\s*][^*]*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^\s_][^_]*?)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^\s*][^*\n]*?)\*/g, '$1<em>$2</em>')
    .replace(/(^|[^\w_])_([^\s_][^_\n]*?)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~([^~\n]+)~~/g, '<del>$1</del>')
    .replace(/ {2,}\n/g, '<br>\n')

  return html.replace(
    new RegExp(`${GUARD}(\\d+)${GUARD}`, 'g'),
    (_match, index: string) => codeSpans[Number(index)]
  )
}

const FENCE = /^\s{0,3}(```+|~~~+)\s*([\w+#.-]*)\s*$/
const HEADING = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/
const THEMATIC_BREAK = /^ {0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/
const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/
const QUOTE = /^ {0,3}>\s?(.*)$/
const DELIMITER_ROW = /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/
const TASK = /^\[([ xX])\]\s+(.*)$/

type Item = {
  indent: number
  ordered: boolean
  lines: string[]
}

function splitRow(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function renderItemBody(lines: string[]): string {
  const task = TASK.exec(lines[0] ?? '')
  const head = task ? task[2] : (lines[0] ?? '')
  const checkbox = task
    ? `<input type="checkbox" disabled${task[1] === ' ' ? '' : ' checked'}>`
    : ''

  const rest = lines.slice(1)
  if (rest.some((line) => line.trim() === '')) {
    return checkbox + renderBlocks([head, ...rest])
  }
  return checkbox + renderInline([head, ...rest].join('\n'))
}

function renderItems(items: Item[], from: number): [string, number] {
  const indent = items[from].indent
  const ordered = items[from].ordered
  const parts: string[] = []
  let i = from

  while (i < items.length && items[i].indent >= indent) {
    if (items[i].indent > indent) {
      const [nested, next] = renderItems(items, i)
      if (parts.length > 0) {
        parts[parts.length - 1] = parts[parts.length - 1].replace(
          /<\/li>$/,
          `${nested}</li>`
        )
      } else {
        parts.push(`<li>${nested}</li>`)
      }
      i = next
      continue
    }
    parts.push(`<li>${renderItemBody(items[i].lines)}</li>`)
    i++
  }

  const tag = ordered ? 'ol' : 'ul'
  const isTaskList = items[from].lines.some((line) => TASK.test(line))
  return [
    `<${tag}${isTaskList ? ' class="task-list"' : ''}>${parts.join('')}</${tag}>`,
    i,
  ]
}

function renderBlocks(lines: string[]): string {
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i++
      continue
    }

    const fence = FENCE.exec(line)
    if (fence) {
      const marker = fence[1]
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith(marker)) {
        body.push(lines[i])
        i++
      }
      i++
      out.push(`<pre><code>${highlight(body.join('\n'), fence[2])}</code></pre>`)
      continue
    }

    const heading = HEADING.exec(line)
    if (heading) {
      const level = heading[1].length
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
      i++
      continue
    }

    if (THEMATIC_BREAK.test(line)) {
      out.push('<hr>')
      i++
      continue
    }

    if (QUOTE.test(line)) {
      const body: string[] = []
      while (i < lines.length && QUOTE.test(lines[i])) {
        body.push(QUOTE.exec(lines[i])![1])
        i++
      }
      out.push(`<blockquote>${renderBlocks(body)}</blockquote>`)
      continue
    }

    if (
      line.includes('|') &&
      lines[i + 1] !== undefined &&
      DELIMITER_ROW.test(lines[i + 1]) &&
      lines[i + 1].includes('|')
    ) {
      const header = splitRow(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(splitRow(lines[i]))
        i++
      }
      const head = header.map((cell) => `<th>${renderInline(cell)}</th>`).join('')
      const body = rows
        .map(
          (row) =>
            `<tr>${header
              .map((_, index) => `<td>${renderInline(row[index] ?? '')}</td>`)
              .join('')}</tr>`
        )
        .join('')
      out.push(`<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`)
      continue
    }

    if (LIST_ITEM.test(line)) {
      const items: Item[] = []
      while (i < lines.length) {
        const current = lines[i]
        const match = LIST_ITEM.exec(current)
        if (match) {
          items.push({
            indent: match[1].length,
            ordered: /\d/.test(match[2]),
            lines: [match[3]],
          })
          i++
          continue
        }
        if (current.trim() === '') {
          const next = lines[i + 1]
          if (next === undefined) break
          if (!LIST_ITEM.test(next) && !/^\s{2,}\S/.test(next)) break
          items[items.length - 1]?.lines.push('')
          i++
          continue
        }
        if (items.length === 0 || !/^\s{2,}\S/.test(current)) break
        items[items.length - 1].lines.push(current.trim())
        i++
      }
      out.push(renderItems(items, 0)[0])
      continue
    }

    const paragraph: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !FENCE.test(lines[i]) &&
      !HEADING.test(lines[i]) &&
      !THEMATIC_BREAK.test(lines[i]) &&
      !QUOTE.test(lines[i]) &&
      !LIST_ITEM.test(lines[i])
    ) {
      paragraph.push(lines[i])
      i++
    }
    if (paragraph.length > 0) {
      out.push(`<p>${renderInline(paragraph.join('\n'))}</p>`)
    }
  }

  return out.join('\n')
}

/** Renders markdown to html. Raw html in the source is escaped, never emitted. */
export function renderMarkdown(source: string): string {
  return renderBlocks(source.replace(/\r\n?/g, '\n').split('\n'))
}
