/** Latin-1 and common Latin Extended-A letters that fold to plain ascii. */
const FOLD: Record<string, string> = {
  æ: 'ae',
  Æ: 'AE',
  œ: 'oe',
  Œ: 'OE',
  ß: 'ss',
  ø: 'o',
  Ø: 'O',
  đ: 'd',
  Đ: 'D',
  ł: 'l',
  Ł: 'L',
  þ: 'th',
  Þ: 'TH',
  ð: 'd',
  Ð: 'D',
}

export function slugify(
  text: string,
  { separator = '-', lowercase = true } = {}
): string {
  const folded = text.replace(/[æÆœŒßøØđĐłŁþÞðÐ]/g, (char) => FOLD[char] ?? char)
  const stripped = folded.normalize('NFKD').replace(/[̀-ͯ]/g, '')
  const slug = stripped
    .replace(/['’]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, separator)
    .replace(
      new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'),
      ''
    )
    .replace(new RegExp(`\\${separator}{2,}`, 'g'), separator)

  return lowercase ? slug.toLowerCase() : slug
}

const WORDS = `lorem ipsum dolor sit amet consectetur adipiscing elit sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam
quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat
duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla
pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia
deserunt mollit anim id est laborum at vero eos accusamus iusto odio dignissimos
ducimus blanditiis praesentium voluptatum deleniti atque corrupti quos dolores
quas molestias excepturi occaecati provident similique culpa officiis animi`
  .trim()
  .split(/\s+/)

const OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'

function pick(random: () => number): string {
  return WORDS[Math.floor(random() * WORDS.length)]
}

function sentence(random: () => number): string {
  const length = 6 + Math.floor(random() * 10)
  const words = Array.from({ length }, () => pick(random))
  // A comma somewhere in the middle keeps the rhythm from reading as a list.
  if (length > 8) words[Math.floor(length / 2)] += ','
  const text = words.join(' ')
  return `${text[0].toUpperCase()}${text.slice(1)}.`
}

export type LoremUnit = 'paragraphs' | 'sentences' | 'words'

export function loremIpsum(
  count: number,
  unit: LoremUnit,
  startClassic: boolean,
  random: () => number = Math.random
): string {
  const amount = Math.max(1, Math.min(count, 200))

  if (unit === 'words') {
    const words = Array.from({ length: amount }, () => pick(random))
    if (startClassic) {
      const classic = OPENING.toLowerCase().replace(/,/g, '').split(' ')
      words.splice(0, Math.min(classic.length, words.length), ...classic.slice(0, amount))
    }
    const text = words.join(' ')
    return `${text[0].toUpperCase()}${text.slice(1)}`
  }

  if (unit === 'sentences') {
    const sentences = Array.from({ length: amount }, () => sentence(random))
    if (startClassic) sentences[0] = `${OPENING}.`
    return sentences.join(' ')
  }

  const paragraphs = Array.from({ length: amount }, (_, index) => {
    const length = 3 + Math.floor(random() * 3)
    const sentences = Array.from({ length }, () => sentence(random))
    if (index === 0 && startClassic) sentences[0] = `${OPENING}.`
    return sentences.join(' ')
  })
  return paragraphs.join('\n\n')
}

/* ------------------------------------------------------------------ *
 * Character codes
 * ------------------------------------------------------------------ */

export type CodeBase = 'hex' | 'binary' | 'decimal' | 'octal'

const RADIX: Record<CodeBase, number> = {
  hex: 16,
  binary: 2,
  decimal: 10,
  octal: 8,
}
const WIDTH: Record<CodeBase, number> = {
  hex: 2,
  binary: 8,
  decimal: 0,
  octal: 0,
}

/** Encodes to utf-8 bytes, which is what "text to hex" normally means. */
export function textToCodes(text: string, base: CodeBase): string {
  return Array.from(new TextEncoder().encode(text))
    .map((byte) => byte.toString(RADIX[base]).padStart(WIDTH[base], '0'))
    .join(' ')
}

export function codesToText(input: string, base: CodeBase): string {
  const tokens = input.trim().split(/[\s,]+/).filter(Boolean)
  if (tokens.length === 0) return ''

  const bytes: number[] = []
  for (const token of tokens) {
    const clean = token.replace(/^0[xbo]/i, '')
    const value = parseInt(clean, RADIX[base])
    if (Number.isNaN(value) || value < 0 || value > 255) {
      throw new Error(`"${token}" is not a valid ${base} byte`)
    }
    bytes.push(value)
  }
  return new TextDecoder().decode(new Uint8Array(bytes))
}

/* ------------------------------------------------------------------ *
 * Units
 * ------------------------------------------------------------------ */

export type CssUnit = 'px' | 'rem' | 'em' | 'pt' | '%'

export function toPixels(value: number, unit: CssUnit, root: number, parent: number): number {
  switch (unit) {
    case 'px':
      return value
    case 'rem':
      return value * root
    case 'em':
      return value * parent
    case 'pt':
      return (value * 96) / 72
    case '%':
      return (value / 100) * parent
  }
}

export function fromPixels(px: number, unit: CssUnit, root: number, parent: number): number {
  switch (unit) {
    case 'px':
      return px
    case 'rem':
      return px / root
    case 'em':
      return px / parent
    case 'pt':
      return (px * 72) / 96
    case '%':
      return (px / parent) * 100
  }
}

export function trimNumber(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return String(Math.round(value * 10000) / 10000)
}
