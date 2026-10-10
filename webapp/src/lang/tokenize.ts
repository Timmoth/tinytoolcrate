import { Token, TokenKind } from './types'

export type KindResolver =
  | TokenKind
  | ((match: string, code: string, index: number) => TokenKind)

export type Rule = { re: RegExp; kind: KindResolver }

/** Builds a sticky rule, so a match can only ever start at the cursor. */
export function rule(source: string, kind: KindResolver, flags = ''): Rule {
  return { re: new RegExp(source, flags + 'y'), kind }
}

export function nextNonSpace(code: string, from: number): string {
  for (let i = from; i < code.length; i++) {
    if (code[i].trim() !== '') return code[i]
  }
  return ''
}

export function prevNonSpace(code: string, before: number): string {
  for (let i = before - 1; i >= 0; i--) {
    if (code[i].trim() !== '') return code[i]
  }
  return ''
}

/**
 * Walks the source once, trying each rule at the cursor and emitting whatever
 * it could not classify as plain text. Rule order is precedence.
 */
export function rulesTokenizer(rules: Rule[]) {
  return (code: string): Token[] => {
    const tokens: Token[] = []
    let pos = 0
    let plainStart = 0

    const flushPlain = (end: number) => {
      if (plainStart < end) {
        tokens.push({
          kind: 'plain',
          text: code.slice(plainStart, end),
          start: plainStart,
        })
      }
    }

    while (pos < code.length) {
      let matched = false
      for (const r of rules) {
        r.re.lastIndex = pos
        const m = r.re.exec(code)
        if (m && m[0].length > 0) {
          flushPlain(pos)
          tokens.push({
            kind: typeof r.kind === 'function' ? r.kind(m[0], code, pos) : r.kind,
            text: m[0],
            start: pos,
          })
          pos += m[0].length
          plainStart = pos
          matched = true
          break
        }
      }
      if (!matched) pos++
    }

    flushPlain(code.length)
    return tokens
  }
}

/** A word resolver driven by keyword / type / builtin sets. */
export function wordKind(
  keywords: Set<string>,
  types: Set<string> = new Set(),
  builtins: Set<string> = new Set(),
  { caseInsensitive = false } = {}
): KindResolver {
  return (match, code, index) => {
    const word = caseInsensitive ? match.toUpperCase() : match
    if (keywords.has(word)) return 'keyword'
    if (types.has(word)) return 'type'
    if (builtins.has(word)) return 'function'
    if (nextNonSpace(code, index + match.length) === '(') return 'function'
    if (prevNonSpace(code, index) === '.') return 'property'
    if (/^[A-Z]/.test(match)) return 'type'
    return 'plain'
  }
}

export function words(list: string): Set<string> {
  return new Set(list.trim().split(/\s+/).filter(Boolean))
}
