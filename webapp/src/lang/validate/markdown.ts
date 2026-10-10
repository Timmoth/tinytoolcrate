import { Diagnostic, Validation } from '../types'

const FENCE = /^\s{0,3}(```+|~~~+)/
const TIGHT_HEADING = /^ {0,3}(#{1,6})([^\s#])/
const LINK_OPEN = /!?\[[^\]\n]*\]\(/g
const DELIMITER_ROW = /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/

function cellCount(line: string): number {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|').length
}

/** Lint-style checks for the mistakes that silently render wrong. */
export function validateMarkdown(code: string): Validation {
  if (!code.trim()) return { diagnostics: [], depth: 'structural' }

  const diagnostics: Diagnostic[] = []
  const lines = code.split('\n')
  let fence: { marker: string; line: number } | null = null
  let comment: number | null = null

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const lineNumber = index + 1
    const fenceMatch = FENCE.exec(line)

    if (fence) {
      if (fenceMatch && line.trim().startsWith(fence.marker)) fence = null
      continue
    }
    if (fenceMatch) {
      fence = { marker: fenceMatch[1], line: lineNumber }
      continue
    }

    if (comment === null && line.includes('<!--')) {
      comment = lineNumber
    }
    if (comment !== null && line.includes('-->')) {
      comment = null
    }

    const heading = TIGHT_HEADING.exec(line)
    if (heading) {
      diagnostics.push({
        line: lineNumber,
        column: heading[1].length + 1,
        message: 'Headings need a space after the # to render',
        severity: 'warning',
      })
    }

    LINK_OPEN.lastIndex = 0
    let link: RegExpExecArray | null
    while ((link = LINK_OPEN.exec(line)) !== null) {
      if (line.indexOf(')', link.index + link[0].length) === -1) {
        diagnostics.push({
          line: lineNumber,
          column: link.index + 1,
          message: 'Unterminated link — no closing ")"',
          severity: 'error',
        })
      }
    }

    const previous = lines[index - 1]
    if (
      previous !== undefined &&
      line.includes('|') &&
      line.includes('-') &&
      DELIMITER_ROW.test(line) &&
      previous.includes('|')
    ) {
      const header = cellCount(previous)
      const divider = cellCount(line)
      if (header !== divider) {
        diagnostics.push({
          line: lineNumber,
          column: 1,
          message: `Table has ${header} header columns but ${divider} in the separator row`,
          severity: 'warning',
        })
      }
    }
  }

  if (fence) {
    diagnostics.push({
      line: fence.line,
      column: 1,
      message: `Unclosed code fence — no closing ${fence.marker}`,
      severity: 'error',
    })
  }
  if (comment !== null) {
    diagnostics.push({
      line: comment,
      column: 1,
      message: 'Unterminated comment — no closing -->',
      severity: 'warning',
    })
  }

  return { diagnostics, depth: 'structural' }
}
