import { Token, TokenKind } from './types'
import {
  nextNonSpace,
  Rule,
  rule,
  rulesTokenizer,
  wordKind,
  words,
} from './tokenize'
import { createJavascriptScanner, cssScanner } from './scanners'

export type Tokenizer = (code: string) => Token[]

/* ------------------------------------------------------------------ *
 * Shared rules
 * ------------------------------------------------------------------ */

const slashComment = rule('//[^\\n]*', 'comment')
const hashComment = rule('#[^\\n]*', 'comment')
const dashComment = rule('--[^\\n]*', 'comment')
/** Matches to the closer, or to end of input when it is never closed. */
const blockComment = rule('/\\*(?:[\\s\\S]*?\\*/|[\\s\\S]*)', 'comment')
const doubleQuoted = rule('"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"?', 'string')
const singleQuoted = rule("'(?:\\\\[\\s\\S]|[^'\\\\\\n])*'?", 'string')
const templateQuoted = rule('`(?:\\\\[\\s\\S]|[^`\\\\])*`?', 'string')
const number = rule(
  '0[xXbBoO][0-9a-fA-F_]*n?|\\.\\d[\\d_]*(?:[eE][+-]?\\d+)?|\\d[\\d_]*(?:\\.[\\d_]*)?(?:[eE][+-]?\\d+)?[nlLfFdDuU]*',
  'number'
)
const operator = rule('[+\\-*/%=<>!&|^~?:]+', 'operator')
const punctuation = rule('[{}()\\[\\].,;]', 'punctuation')
const whitespace = rule('\\s+', 'plain')

function offsetTokens(tokens: Token[], delta: number): Token[] {
  return delta === 0
    ? tokens
    : tokens.map((token) => ({ ...token, start: token.start + delta }))
}

/* ------------------------------------------------------------------ *
 * C family
 * ------------------------------------------------------------------ */

function cFamily(
  keywordList: string,
  typeList = '',
  builtinList = '',
  extra: Rule[] = []
): Tokenizer {
  const keywords = words(keywordList)
  const types = words(typeList)
  const builtins = words(builtinList)
  return rulesTokenizer([
    slashComment,
    blockComment,
    ...extra,
    doubleQuoted,
    singleQuoted,
    number,
    rule('[A-Za-z_$][\\w$]*', wordKind(keywords, types, builtins)),
    operator,
    punctuation,
    whitespace,
  ])
}

const JS_KEYWORDS = `
  async await break case catch class const continue debugger default delete do
  else export extends finally for from function get if import in instanceof let
  new of return set static super switch this throw try typeof var void while
  with yield true false null undefined NaN Infinity
`
const TS_KEYWORDS = `
  ${JS_KEYWORDS} abstract as asserts declare enum implements infer interface is
  keyof namespace private protected public readonly satisfies type unique
  override out
`
const TS_TYPES = `any bigint boolean never number object string symbol unknown`
const JS_TYPES = `
  Array Object String Number Boolean Date Math JSON Promise Map Set WeakMap
  WeakSet RegExp Error TypeError Symbol BigInt Proxy Reflect ArrayBuffer
  Uint8Array Int32Array Float64Array
`

/** Both use the scanner, so regex literals, templates and jsx come out right. */
export const javascriptTokenizer = createJavascriptScanner(JS_KEYWORDS, JS_TYPES)
export const typescriptTokenizer = createJavascriptScanner(
  TS_KEYWORDS,
  `${JS_TYPES} ${TS_TYPES}`,
  { typescript: true }
)

export const javaTokenizer = cFamily(
  `abstract assert boolean break byte case catch char class const continue
   default do double else enum extends final finally float for goto if
   implements import instanceof int interface long native new package private
   protected public record return sealed short static strictfp super switch
   synchronized this throw throws transient try var void volatile while yield
   true false null`,
  `String Integer Boolean Double Float Long Character Object List Map Set
   ArrayList HashMap HashSet System Exception RuntimeException Optional Stream`
)

export const csharpTokenizer = cFamily(
  `abstract as async await base bool break byte case catch char checked class
   const continue decimal default delegate do double dynamic else enum event
   explicit extern finally fixed float for foreach goto if implicit in init int
   interface internal is lock long namespace new object operator out override
   params private protected public readonly record ref return sbyte sealed
   short sizeof stackalloc static string struct switch this throw try typeof
   uint ulong unchecked unsafe ushort using var virtual void volatile while
   true false null value when where yield`,
  `String Int32 Int64 Boolean Double Decimal DateTime Guid List Dictionary
   HashSet IEnumerable Task Exception Console Object Nullable Span`,
  '',
  [rule('[@$]{1,2}"(?:""|\\\\[\\s\\S]|[^"])*"?', 'string')]
)

export const goTokenizer = cFamily(
  `break case chan const continue default defer else fallthrough for func go
   goto if import interface map package range return select struct switch type
   var true false nil iota`,
  `bool byte complex64 complex128 error float32 float64 int int8 int16 int32
   int64 rune string uint uint8 uint16 uint32 uint64 uintptr any comparable`,
  `append cap close copy delete len make new panic print println recover`,
  [templateQuoted]
)

export const rustTokenizer = cFamily(
  `as async await break const continue crate dyn else enum extern fn for if
   impl in let loop match mod move mut pub ref return self Self static struct
   super trait type unsafe use where while true false`,
  `bool char f32 f64 i8 i16 i32 i64 i128 isize str u8 u16 u32 u64 u128 usize
   String Vec Option Result Box Rc Arc HashMap HashSet Some None Ok Err`,
  `println print format vec panic assert write writeln matches todo`,
  // A lifetime looks like the start of a char literal; the negative lookahead
  // keeps 'z' a char and &'a a lifetime.
  [rule("'[A-Za-z_]\\w*(?!')", 'type'), rule('r#*"(?:[\\s\\S]*?"#*|[\\s\\S]*)', 'string')]
)

export const cppTokenizer = cFamily(
  `alignas alignof asm auto bool break case catch char class concept const
   consteval constexpr constinit continue decltype default delete do double
   else enum explicit export extern false float for friend goto if inline int
   long mutable namespace new noexcept nullptr operator private protected
   public register requires return short signed sizeof static static_cast
   struct switch template this throw true try typedef typeid typename union
   unsigned using virtual void volatile wchar_t while`,
  `size_t string vector map set unordered_map shared_ptr unique_ptr ostream
   istream uint8_t uint32_t int32_t int64_t`,
  '',
  [rule('#[a-z_]+', 'keyword')]
)

export const phpTokenizer = cFamily(
  `abstract and array as break callable case catch class clone const continue
   declare default do echo else elseif empty enddeclare endfor endforeach endif
   endswitch endwhile enum extends final finally fn for foreach function global
   goto if implements include include_once instanceof insteadof interface isset
   list match namespace new or print private protected public readonly require
   require_once return static switch throw trait try unset use var while xor
   yield true false null`,
  `int float string bool array object mixed void never self parent`,
  '',
  [hashComment, rule('\\$[A-Za-z_]\\w*', 'property')]
)

/* ------------------------------------------------------------------ *
 * JSON
 * ------------------------------------------------------------------ */

export const jsonTokenizer = rulesTokenizer([
  rule('"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"?', (match, code, index) =>
    nextNonSpace(code, index + match.length) === ':' ? 'property' : 'string'
  ),
  rule('-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?', 'number'),
  rule('true|false|null', 'keyword'),
  slashComment,
  blockComment,
  rule('[{}\\[\\],:]', 'punctuation'),
  whitespace,
])

/* ------------------------------------------------------------------ *
 * Python
 * ------------------------------------------------------------------ */

export const pythonTokenizer = rulesTokenizer([
  hashComment,
  rule('[rRbBfFuU]{0,2}"""(?:[\\s\\S]*?"""|[\\s\\S]*)', 'string'),
  rule("[rRbBfFuU]{0,2}'''(?:[\\s\\S]*?'''|[\\s\\S]*)", 'string'),
  rule('[rRbBfFuU]{0,2}"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"?', 'string'),
  rule("[rRbBfFuU]{0,2}'(?:\\\\[\\s\\S]|[^'\\\\\\n])*'?", 'string'),
  rule('@[A-Za-z_]\\w*', 'function'),
  number,
  rule(
    '[A-Za-z_]\\w*',
    wordKind(
      words(`and as assert async await break class continue def del elif else
             except finally for from global if import in is lambda match
             nonlocal not or pass raise return try while with yield case True
             False None`),
      words(`int str float list dict set tuple bool bytes complex frozenset`),
      words(`print len range open type isinstance enumerate zip map filter sum
             min max abs sorted reversed input repr round any all super format
             getattr setattr hasattr`)
    )
  ),
  operator,
  punctuation,
  whitespace,
])

/* ------------------------------------------------------------------ *
 * Shell / SQL
 * ------------------------------------------------------------------ */

export const shellTokenizer = rulesTokenizer([
  rule('<<-?\\s*([\'"]?)(\\w+)\\1[^\\n]*\\n[\\s\\S]*?\\n[ \\t]*\\2\\b', 'string'),
  hashComment,
  doubleQuoted,
  singleQuoted,
  rule('\\$\\{[^}\\n]*\\}?|\\$[A-Za-z_]\\w*|\\$[?#@*!$0-9]', 'property'),
  rule('(?:^|(?<=\\s))-{1,2}[A-Za-z][\\w-]*', 'attr'),
  number,
  rule(
    '[A-Za-z_][\\w-]*',
    wordKind(
      words(`if then else elif fi for while until do done case esac function in
             return break continue local export readonly declare source select
             time coproc`),
      new Set(),
      words(`echo cd exit read set unset trap eval exec test printf pwd ls mkdir
             rm cp mv cat grep sed awk curl git docker kubectl npm yarn node`)
    )
  ),
  operator,
  punctuation,
  whitespace,
])

export const sqlTokenizer = rulesTokenizer([
  dashComment,
  blockComment,
  rule("'(?:''|[^'\\n])*'?", 'string'),
  rule('"[^"\\n]*"?|`[^`\\n]*`?|\\[[^\\]\\n]*\\]?', 'property'),
  number,
  rule(
    '[A-Za-z_]\\w*',
    wordKind(
      words(`SELECT FROM WHERE INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE
             ALTER DROP INDEX VIEW JOIN INNER LEFT RIGHT FULL OUTER CROSS ON
             GROUP BY ORDER HAVING LIMIT OFFSET UNION ALL DISTINCT AS AND OR NOT
             NULL IS IN BETWEEN LIKE ILIKE EXISTS CASE WHEN THEN ELSE END
             PRIMARY KEY FOREIGN REFERENCES DEFAULT CONSTRAINT UNIQUE CHECK WITH
             RETURNING ASC DESC TRUNCATE BEGIN COMMIT ROLLBACK TRANSACTION IF
             REPLACE GRANT REVOKE CASCADE USING OVER PARTITION WINDOW`),
      words(`INT INTEGER BIGINT SMALLINT DECIMAL NUMERIC REAL FLOAT DOUBLE CHAR
             VARCHAR TEXT DATE TIME TIMESTAMP BOOLEAN BLOB JSON JSONB UUID
             SERIAL`),
      words(`COUNT SUM AVG MIN MAX CAST COALESCE NULLIF NOW LENGTH UPPER LOWER
             SUBSTRING TRIM ROUND ABS ROW_NUMBER RANK DENSE_RANK`),
      { caseInsensitive: true }
    )
  ),
  operator,
  punctuation,
  whitespace,
])

/* ------------------------------------------------------------------ *
 * CSS
 * ------------------------------------------------------------------ */

export const cssTokenizer: Tokenizer = cssScanner

/* ------------------------------------------------------------------ *
 * Markup (html / xml)
 * ------------------------------------------------------------------ */

const TAG_START = /<\/?[A-Za-z][\w:.-]*/y
const ATTR_NAME = /[^\s=/>]+/y
const ATTR_VALUE = /"[^"]*"?|'[^']*'?|[^\s>]+/y
const WS = /\s+/y

/** Content of these elements is another language, not markup. */
const EMBEDDED: Record<string, Tokenizer> = {
  script: javascriptTokenizer,
  style: cssTokenizer,
}
const OPAQUE = new Set(['textarea', 'title'])

export function markupTokenizer(code: string): Token[] {
  const lower = code.toLowerCase()
  const tokens: Token[] = []
  const push = (kind: TokenKind, start: number, end: number) => {
    if (end > start) tokens.push({ kind, text: code.slice(start, end), start })
  }

  const until = (from: number, close: string, skip: number) => {
    const end = code.indexOf(close, from + skip)
    return end === -1 ? code.length : end + close.length
  }

  let i = 0
  while (i < code.length) {
    const lt = code.indexOf('<', i)
    if (lt === -1) {
      push('plain', i, code.length)
      break
    }
    push('plain', i, lt)
    i = lt

    if (code.startsWith('<!--', i)) {
      const stop = until(i, '-->', 4)
      push('comment', i, stop)
      i = stop
      continue
    }
    if (code.startsWith('<![CDATA[', i)) {
      const stop = until(i, ']]>', 9)
      push('string', i, stop)
      i = stop
      continue
    }
    if (code.startsWith('<?', i)) {
      const stop = until(i, '?>', 2)
      push('keyword', i, stop)
      i = stop
      continue
    }
    if (code.startsWith('<!', i)) {
      const stop = until(i, '>', 2)
      push('keyword', i, stop)
      i = stop
      continue
    }

    TAG_START.lastIndex = i
    const tag = TAG_START.exec(code)
    if (!tag) {
      push('punctuation', i, i + 1)
      i += 1
      continue
    }
    const closing = tag[0].startsWith('</')
    const name = tag[0].replace(/^<\/?/, '').toLowerCase()
    push('tag', i, i + tag[0].length)
    i += tag[0].length

    while (i < code.length && code[i] !== '>') {
      WS.lastIndex = i
      const gap = WS.exec(code)
      if (gap) {
        push('plain', i, i + gap[0].length)
        i += gap[0].length
        continue
      }
      if (code[i] === '/') {
        push('tag', i, i + 1)
        i += 1
        continue
      }
      ATTR_NAME.lastIndex = i
      const name = ATTR_NAME.exec(code)
      if (!name) {
        push('plain', i, i + 1)
        i += 1
        continue
      }
      push('attr', i, i + name[0].length)
      i += name[0].length

      WS.lastIndex = i
      const afterName = WS.exec(code)
      const equals = afterName ? i + afterName[0].length : i
      if (code[equals] !== '=') continue

      push('plain', i, equals)
      push('operator', equals, equals + 1)
      i = equals + 1

      WS.lastIndex = i
      const beforeValue = WS.exec(code)
      if (beforeValue) {
        push('plain', i, i + beforeValue[0].length)
        i += beforeValue[0].length
      }
      ATTR_VALUE.lastIndex = i
      const value = ATTR_VALUE.exec(code)
      if (value) {
        push('string', i, i + value[0].length)
        i += value[0].length
      }
    }

    const selfClosing = code[i - 1] === '/'
    if (code[i] === '>') {
      push('tag', i, i + 1)
      i += 1
    }

    if (closing || selfClosing) continue

    // Everything up to the end tag is opaque to the markup scanner, so "<" in
    // a script string is not mistaken for a tag.
    const embedded = EMBEDDED[name]
    if (embedded || OPAQUE.has(name)) {
      const end = lower.indexOf(`</${name}`, i)
      const stop = end === -1 ? code.length : end
      const inner = code.slice(i, stop)
      if (inner !== '') {
        if (embedded) {
          for (const token of embedded(inner)) {
            tokens.push({ ...token, start: token.start + i })
          }
        } else {
          push('plain', i, stop)
        }
      }
      i = stop
    }
  }

  return tokens
}

/* ------------------------------------------------------------------ *
 * YAML
 * ------------------------------------------------------------------ */

const yamlValue = rulesTokenizer([
  hashComment,
  doubleQuoted,
  singleQuoted,
  rule('[&*][\\w-]+', 'type'),
  rule('!!?[\\w:/.-]*', 'type'),
  rule('\\b(?:true|false|null|yes|no|on|off)\\b|~', 'keyword'),
  rule('-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b', 'number'),
  rule('[\\[\\]{},]', 'punctuation'),
  whitespace,
])

const YAML_KEY = /([ \t]*)((?:- +)*)((?:"[^"]*"|'[^']*'|[^:#\n]*?))(\s*:)(?=\s|$)/

export function yamlTokenizer(code: string): Token[] {
  const tokens: Token[] = []
  let offset = 0

  for (const line of code.split('\n')) {
    if (offset > 0) tokens.push({ kind: 'plain', text: '\n', start: offset - 1 })

    const trimmed = line.trim()
    if (trimmed.startsWith('#')) {
      tokens.push({ kind: 'comment', text: line, start: offset })
    } else if (trimmed === '---' || trimmed === '...') {
      tokens.push({ kind: 'keyword', text: line, start: offset })
    } else {
      const key = YAML_KEY.exec(line)
      let rest = offset
      if (key && key.index === 0) {
        const [, indent, dashes, name, colon] = key
        let at = offset
        if (indent) tokens.push({ kind: 'plain', text: indent, start: at })
        at += indent.length
        if (dashes) tokens.push({ kind: 'punctuation', text: dashes, start: at })
        at += dashes.length
        if (name) tokens.push({ kind: 'property', text: name, start: at })
        at += name.length
        tokens.push({ kind: 'punctuation', text: colon, start: at })
        rest = at + colon.length
      }
      tokens.push(
        ...offsetTokens(yamlValue(line.slice(rest - offset)), rest)
      )
    }
    offset += line.length + 1
  }

  return tokens
}

/* ------------------------------------------------------------------ *
 * Markdown
 * ------------------------------------------------------------------ */

const markdownInline = rulesTokenizer([
  rule('`+[^`\\n]*`+', 'string'),
  rule('!?\\[[^\\]\\n]*\\]\\([^)\\n]*\\)', 'attr'),
  rule('!?\\[[^\\]\\n]*\\]\\[[^\\]\\n]*\\]', 'attr'),
  rule('\\*\\*[^*\\n]+\\*\\*|__[^_\\n]+__', 'type'),
  rule('\\*[^*\\n]+\\*|_[^_\\n]+_', 'type'),
  rule('~~[^~\\n]+~~', 'comment'),
  rule('<https?://[^>\\s]+>|https?://[^\\s)]+', 'attr'),
  rule('\\|', 'punctuation'),
])

const MD_FENCE = /^\s*(```+|~~~+)/
const MD_HEADING = /^ {0,3}#{1,6}(?: |$)/
const MD_RULE = /^ {0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/
const MD_LIST = /^(\s*)([-*+]|\d+[.)])(\s+)/
const MD_QUOTE = /^(\s*>+\s?)/

export function markdownTokenizer(code: string): Token[] {
  const tokens: Token[] = []
  let offset = 0
  let fence: string | null = null

  for (const line of code.split('\n')) {
    if (offset > 0) tokens.push({ kind: 'plain', text: '\n', start: offset - 1 })

    const fenceMatch = MD_FENCE.exec(line)
    if (fence) {
      tokens.push({
        kind: fenceMatch && line.trim().startsWith(fence) ? 'keyword' : 'string',
        text: line,
        start: offset,
      })
      if (fenceMatch && line.trim().startsWith(fence)) fence = null
      offset += line.length + 1
      continue
    }
    if (fenceMatch) {
      fence = fenceMatch[1]
      tokens.push({ kind: 'keyword', text: line, start: offset })
      offset += line.length + 1
      continue
    }

    if (MD_HEADING.test(line)) {
      tokens.push({ kind: 'keyword', text: line, start: offset })
      offset += line.length + 1
      continue
    }
    if (MD_RULE.test(line)) {
      tokens.push({ kind: 'punctuation', text: line, start: offset })
      offset += line.length + 1
      continue
    }

    let at = offset
    let rest = line
    const quote = MD_QUOTE.exec(rest)
    if (quote) {
      tokens.push({ kind: 'comment', text: quote[1], start: at })
      at += quote[1].length
      rest = rest.slice(quote[1].length)
    }
    const list = MD_LIST.exec(rest)
    if (list) {
      const marker = list[1] + list[2] + list[3]
      tokens.push({ kind: 'punctuation', text: marker, start: at })
      at += marker.length
      rest = rest.slice(marker.length)
    }
    tokens.push(...offsetTokens(markdownInline(rest), at))

    offset += line.length + 1
  }

  return tokens
}

export const plainTokenizer: Tokenizer = (code) =>
  code ? [{ kind: 'plain', text: code, start: 0 }] : []
