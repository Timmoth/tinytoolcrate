const ROMAN: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

export const ROMAN_MAX = 3999

export function toRoman(value: number): string {
  let left = Math.trunc(value)
  let out = ''
  for (const [amount, numeral] of ROMAN) {
    while (left >= amount) {
      out += numeral
      left -= amount
    }
  }
  return out
}

/**
 * Parses a numeral, then re-encodes it and compares. Anything written in a
 * non-standard way — IIII, IC, VV — fails that round trip.
 */
export function fromRoman(text: string): number | null {
  const clean = text.trim().toUpperCase()
  if (clean === '' || !/^[MDCLXVI]+$/.test(clean)) return null

  const VALUES: Record<string, number> = {
    M: 1000,
    D: 500,
    C: 100,
    L: 50,
    X: 10,
    V: 5,
    I: 1,
  }

  let total = 0
  for (let i = 0; i < clean.length; i++) {
    const current = VALUES[clean[i]]
    const next = VALUES[clean[i + 1]] ?? 0
    total += current < next ? -current : current
  }

  // MMMM round trips, but standard numerals stop at 3999.
  if (total > ROMAN_MAX) return null
  return toRoman(total) === clean ? total : null
}

/* ------------------------------------------------------------------ *
 * ULID
 * ------------------------------------------------------------------ */

/** Crockford base32: no I, L, O or U, so it cannot spell much by accident. */
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const TIME_CHARS = 10
const RANDOM_CHARS = 16

export function ulid(now: number = Date.now()): string {
  let time = ''
  let left = now
  for (let i = 0; i < TIME_CHARS; i++) {
    time = CROCKFORD[left % 32] + time
    left = Math.floor(left / 32)
  }

  // 256 is a whole number of 32s, so the modulo stays uniform.
  const bytes = crypto.getRandomValues(new Uint8Array(RANDOM_CHARS))
  const random = Array.from(bytes, (byte) => CROCKFORD[byte % 32]).join('')

  return time + random
}

export function ulidTime(value: string): Date | null {
  const clean = value.trim().toUpperCase()
  if (clean.length !== TIME_CHARS + RANDOM_CHARS) return null
  if ([...clean].some((char) => !CROCKFORD.includes(char))) return null

  let time = 0
  for (const char of clean.slice(0, TIME_CHARS)) {
    time = time * 32 + CROCKFORD.indexOf(char)
  }
  return new Date(time)
}
