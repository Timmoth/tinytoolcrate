import { Token, TokenKind } from './types'
import { nextNonSpace, prevNonSpace, words } from './tokenize'

/**
 * Hand written scanners for the languages where a flat list of regex rules is
 * not good enough: javascript needs to know whether a "/" starts a regex or
 * divides, and whether a "<" opens jsx or compares, and css needs to know
 * whether a ":" introduces a pseudo-class or a declaration value.
 */

/* ------------------------------------------------------------------ *
 * JavaScript / TypeScript / JSX
 * ------------------------------------------------------------------ */

type Frame =
  | { type: 'code'; depth: number }
  | { type: 'template'; openedAt: number }
  | { type: 'jsxTag' }
  | { type: 'jsxChildren' }

const WS = /\s+/y
const LINE_COMMENT = /\/\/[^\n]*/y
const BLOCK_COMMENT = /\/\*(?:[\s\S]*?\*\/|[\s\S]*)/y
const DOUBLE = /"(?:\\[\s\S]|[^"\\\n])*"?/y
const SINGLE = /'(?:\\[\s\S]|[^'\\\n])*'?/y
const NUMBER =
  /0[xXbBoO][0-9a-fA-F_]*n?|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?n?/y
const IDENT = /[A-Za-z_$][\w$]*/y
/** Body is an escape, a character class, or any other non-delimiter. */
const REGEXP = /\/(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[dgimsuvy]*/y
const OPERATOR = /[+\-*/%=<>!&|^~?:]+/y
const PUNCTUATION = /[{}()[\].,;]/y
const TAG_NAME = /[A-Za-z_][\w.:-]*/y
const TEMPLATE_CHUNK = /(?:\\[\s\S]|\$(?!\{)|[^`\\$])+/y
const JSX_TEXT = /[^<{]+/y

/** Keywords that are values, so a following "/" divides and "<" compares. */
const VALUE_KEYWORDS = new Set([
  'this',
  'super',
  'true',
  'false',
  'null',
  'undefined',
  'NaN',
  'Infinity',
])

export function createJavascriptScanner(
  keywordList: string,
  typeList: string,
  { typescript = false } = {}
) {
  const keywords = words(keywordList)
  const types = words(typeList)

  return function scan(code: string): Token[] {
    const tokens: Token[] = []
    const frames: Frame[] = [{ type: 'code', depth: 0 }]
    let previous: Token | null = null
    let i = 0

    const emit = (kind: TokenKind, start: number, end: number) => {
      if (end <= start) return
      const token: Token = { kind, text: code.slice(start, end), start }
      tokens.push(token)
      if (kind !== 'comment' && token.text.trim() !== '') previous = token
      return token
    }

    /** True where a value may begin — so "/" is a regex and "<" opens jsx. */
    const atExpressionStart = () => {
      if (!previous) return true
      if (previous.kind === 'keyword') return !VALUE_KEYWORDS.has(previous.text)
      if (previous.kind === 'operator') return true
      if (previous.kind === 'punctuation') return !')]'.includes(previous.text)
      return false
    }

    const take = (pattern: RegExp, at: number) => {
      pattern.lastIndex = at
      return pattern.exec(code)
    }

    /**
     * "<T>(x: T) => x" and "<div>(a)</div>" start identically. A generic
     * parameter list is always followed by the call signature's "(", and
     * cannot contain a brace or span a statement, so that tells them apart.
     */
    const looksLikeGenerics = (from: number) => {
      if (!typescript) return false
      let depth = 0
      const limit = Math.min(code.length, from + 240)
      for (let j = from; j < limit; j++) {
        const c = code[j]
        if (c === '<') depth += 1
        else if (c === '>') {
          depth -= 1
          if (depth === 0) return nextNonSpace(code, j + 1) === '('
        } else if (c === '\n' || c === ';' || c === '{' || c === '}') return false
      }
      return false
    }

    while (i < code.length) {
      const frame = frames[frames.length - 1]
      const char = code[i]

      if (frame.type === 'template') {
        if (char === '`') {
          emit('string', i, i + 1)
          frames.pop()
          i += 1
          continue
        }
        if (char === '$' && code[i + 1] === '{') {
          emit('punctuation', i, i + 2)
          frames.push({ type: 'code', depth: 0 })
          i += 2
          continue
        }
        const chunk = take(TEMPLATE_CHUNK, i)
        const length = chunk ? chunk[0].length : 1
        emit('string', i, i + length)
        i += length
        continue
      }

      if (frame.type === 'jsxTag') {
        const space = take(WS, i)
        if (space) {
          emit('plain', i, i + space[0].length)
          i += space[0].length
          continue
        }
        if (char === '/' && code[i + 1] === '>') {
          emit('tag', i, i + 2)
          frames.pop()
          i += 2
          continue
        }
        if (char === '>') {
          emit('tag', i, i + 1)
          frames.pop()
          frames.push({ type: 'jsxChildren' })
          i += 1
          continue
        }
        if (char === '{') {
          emit('punctuation', i, i + 1)
          frames.push({ type: 'code', depth: 0 })
          i += 1
          continue
        }
        if (char === '"' || char === "'") {
          const quoted = take(char === '"' ? DOUBLE : SINGLE, i)!
          emit('string', i, i + quoted[0].length)
          i += quoted[0].length
          continue
        }
        if (char === '=') {
          emit('operator', i, i + 1)
          i += 1
          continue
        }
        const attribute = take(TAG_NAME, i)
        if (attribute) {
          emit('attr', i, i + attribute[0].length)
          i += attribute[0].length
          continue
        }
        emit('plain', i, i + 1)
        i += 1
        continue
      }

      if (frame.type === 'jsxChildren') {
        if (char === '{') {
          emit('punctuation', i, i + 1)
          frames.push({ type: 'code', depth: 0 })
          i += 1
          continue
        }
        if (char === '<') {
          if (code[i + 1] === '/') {
            const close = code.indexOf('>', i)
            const stop = close === -1 ? code.length : close + 1
            emit('tag', i, stop)
            frames.pop()
            i = stop
            continue
          }
          const name = take(TAG_NAME, i + 1)
          if (name) {
            emit('tag', i, i + 1 + name[0].length)
            frames.push({ type: 'jsxTag' })
            i += 1 + name[0].length
            continue
          }
          emit('plain', i, i + 1)
          i += 1
          continue
        }
        const text = take(JSX_TEXT, i)
        const length = text ? text[0].length : 1
        emit('plain', i, i + length)
        i += length
        continue
      }

      /* code frame */

      const space = take(WS, i)
      if (space) {
        emit('plain', i, i + space[0].length)
        i += space[0].length
        continue
      }

      if (char === '/' && code[i + 1] === '/') {
        const comment = take(LINE_COMMENT, i)!
        emit('comment', i, i + comment[0].length)
        i += comment[0].length
        continue
      }
      if (char === '/' && code[i + 1] === '*') {
        const comment = take(BLOCK_COMMENT, i)!
        emit('comment', i, i + comment[0].length)
        i += comment[0].length
        continue
      }
      if (char === '"' || char === "'") {
        const quoted = take(char === '"' ? DOUBLE : SINGLE, i)!
        emit('string', i, i + quoted[0].length)
        i += quoted[0].length
        continue
      }
      if (char === '`') {
        emit('string', i, i + 1)
        frames.push({ type: 'template', openedAt: tokens.length - 1 })
        i += 1
        continue
      }
      if (char === '/' && atExpressionStart()) {
        const pattern = take(REGEXP, i)
        if (pattern) {
          emit('regexp', i, i + pattern[0].length)
          i += pattern[0].length
          continue
        }
      }
      if (char === '<' && atExpressionStart() && !looksLikeGenerics(i)) {
        if (code[i + 1] === '>') {
          emit('tag', i, i + 2)
          frames.push({ type: 'jsxChildren' })
          i += 2
          continue
        }
        const name = take(TAG_NAME, i + 1)
        if (name) {
          emit('tag', i, i + 1 + name[0].length)
          frames.push({ type: 'jsxTag' })
          i += 1 + name[0].length
          continue
        }
      }
      if ((char >= '0' && char <= '9') || (char === '.' && /\d/.test(code[i + 1] ?? ''))) {
        const digits = take(NUMBER, i)
        if (digits) {
          emit('number', i, i + digits[0].length)
          i += digits[0].length
          continue
        }
      }

      const word = take(IDENT, i)
      if (word) {
        const text = word[0]
        let kind: TokenKind = 'plain'
        if (keywords.has(text)) kind = 'keyword'
        else if (types.has(text)) kind = 'type'
        else if (nextNonSpace(code, i + text.length) === '(') kind = 'function'
        else if (prevNonSpace(code, i) === '.') kind = 'property'
        else if (/^[A-Z]/.test(text)) kind = 'type'
        emit(kind, i, i + text.length)
        i += text.length
        continue
      }

      if (char === '{') {
        frame.depth += 1
        emit('punctuation', i, i + 1)
        i += 1
        continue
      }
      if (char === '}') {
        emit('punctuation', i, i + 1)
        if (frame.depth === 0 && frames.length > 1) frames.pop()
        else frame.depth = Math.max(0, frame.depth - 1)
        i += 1
        continue
      }
      if (take(PUNCTUATION, i)) {
        emit('punctuation', i, i + 1)
        i += 1
        continue
      }
      const operator = take(OPERATOR, i)
      if (operator) {
        emit('operator', i, i + operator[0].length)
        i += operator[0].length
        continue
      }

      emit('plain', i, i + 1)
      i += 1
    }

    // A template that never closed leaves its frame behind; its opening
    // backtick is the only evidence, so mark it for the validator.
    for (const frame of frames) {
      if (frame.type === 'template' && tokens[frame.openedAt]) {
        tokens[frame.openedAt].unterminated = true
      }
    }

    return tokens
  }
}

/* ------------------------------------------------------------------ *
 * CSS
 * ------------------------------------------------------------------ */

const CSS_AT_RULE = /@[\w-]+/y
const CSS_HEX = /#[0-9a-fA-F]{3,8}\b/y
const CSS_IMPORTANT = /!\s*important\b/y
const CSS_NUMBER = /-?\d*\.?\d+(?:[a-zA-Z%]+)?/y
const CSS_WORD = /[\w-]+/y
const CSS_CLASS = /[.#][\w-]+/y
const CSS_PSEUDO = /::?[\w-]+(?:\([^)\n]*\))?/y
const CSS_ATTRIBUTE = /\[[^\]\n]*\]?/y
const CSS_PUNCTUATION = /[{}()[\];:,]/y

/** At-rules whose block holds nested rules rather than declarations. */
const GROUP_AT_RULES = new Set([
  '@media',
  '@supports',
  '@document',
  '@layer',
  '@container',
  '@scope',
  '@else',
])

export function cssScanner(code: string): Token[] {
  const tokens: Token[] = []
  const blocks: ('rule' | 'group')[] = []
  let groupAhead = false
  // An at-rule's condition — @media (min-width: 40rem) — reads like a
  // declaration even though the block around it holds nested rules.
  let parens = 0
  let i = 0

  const emit = (kind: TokenKind, start: number, end: number) => {
    if (end > start) tokens.push({ kind, text: code.slice(start, end), start })
  }
  const take = (pattern: RegExp, at: number) => {
    pattern.lastIndex = at
    return pattern.exec(code)
  }

  while (i < code.length) {
    const char = code[i]
    const inDeclarations = blocks[blocks.length - 1] === 'rule' || parens > 0

    if (char === '(') parens += 1
    else if (char === ')') parens = Math.max(0, parens - 1)

    const space = take(WS, i)
    if (space) {
      emit('plain', i, i + space[0].length)
      i += space[0].length
      continue
    }

    if (char === '/' && code[i + 1] === '*') {
      const comment = take(BLOCK_COMMENT, i)!
      emit('comment', i, i + comment[0].length)
      i += comment[0].length
      continue
    }
    if (char === '"' || char === "'") {
      const quoted = take(char === '"' ? DOUBLE : SINGLE, i)!
      emit('string', i, i + quoted[0].length)
      i += quoted[0].length
      continue
    }
    if (char === '@') {
      const atRule = take(CSS_AT_RULE, i)
      if (atRule) {
        if (GROUP_AT_RULES.has(atRule[0].toLowerCase())) groupAhead = true
        emit('keyword', i, i + atRule[0].length)
        i += atRule[0].length
        continue
      }
    }
    if (char === '{') {
      blocks.push(groupAhead ? 'group' : 'rule')
      groupAhead = false
      emit('punctuation', i, i + 1)
      i += 1
      continue
    }
    if (char === '}') {
      blocks.pop()
      emit('punctuation', i, i + 1)
      i += 1
      continue
    }
    if (char === ';') {
      groupAhead = false
      emit('punctuation', i, i + 1)
      i += 1
      continue
    }
    if (char === '!') {
      const important = take(CSS_IMPORTANT, i)
      if (important) {
        emit('keyword', i, i + important[0].length)
        i += important[0].length
        continue
      }
    }
    if (char === '#') {
      const hex = take(CSS_HEX, i)
      if (hex) {
        emit('number', i, i + hex[0].length)
        i += hex[0].length
        continue
      }
    }

    if (!inDeclarations) {
      if (char === '.' || char === '#') {
        const selector = take(CSS_CLASS, i)
        if (selector) {
          emit('tag', i, i + selector[0].length)
          i += selector[0].length
          continue
        }
      }
      if (char === ':') {
        const pseudo = take(CSS_PSEUDO, i)
        if (pseudo) {
          emit('type', i, i + pseudo[0].length)
          i += pseudo[0].length
          continue
        }
      }
      if (char === '[') {
        const attribute = take(CSS_ATTRIBUTE, i)
        if (attribute) {
          emit('attr', i, i + attribute[0].length)
          i += attribute[0].length
          continue
        }
      }
      const element = take(CSS_WORD, i)
      if (element) {
        emit('tag', i, i + element[0].length)
        i += element[0].length
        continue
      }
    } else {
      if (char === '-' && code[i + 1] === '-') {
        const variable = take(CSS_WORD, i)
        if (variable) {
          emit('property', i, i + variable[0].length)
          i += variable[0].length
          continue
        }
      }
      const digits = take(CSS_NUMBER, i)
      if (digits && /\d/.test(digits[0])) {
        emit('number', i, i + digits[0].length)
        i += digits[0].length
        continue
      }
      const word = take(CSS_WORD, i)
      if (word) {
        const after = nextNonSpace(code, i + word[0].length)
        emit(after === ':' ? 'property' : after === '(' ? 'function' : 'plain', i, i + word[0].length)
        i += word[0].length
        continue
      }
    }

    if (take(CSS_PUNCTUATION, i)) {
      emit('punctuation', i, i + 1)
      i += 1
      continue
    }

    emit('plain', i, i + 1)
    i += 1
  }

  return tokens
}
