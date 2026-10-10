import { useMemo } from 'react'
import ReferenceTable, { Column } from '../components/ReferenceTable'

type AsciiRow = {
  dec: string
  hex: string
  oct: string
  bin: string
  char: string
  name: string
}

const CONTROL_NAMES = [
  'NUL null',
  'SOH start of heading',
  'STX start of text',
  'ETX end of text',
  'EOT end of transmission',
  'ENQ enquiry',
  'ACK acknowledge',
  'BEL bell',
  'BS backspace',
  'TAB horizontal tab',
  'LF line feed',
  'VT vertical tab',
  'FF form feed',
  'CR carriage return',
  'SO shift out',
  'SI shift in',
  'DLE data link escape',
  'DC1 device control 1',
  'DC2 device control 2',
  'DC3 device control 3',
  'DC4 device control 4',
  'NAK negative acknowledge',
  'SYN synchronous idle',
  'ETB end of block',
  'CAN cancel',
  'EM end of medium',
  'SUB substitute',
  'ESC escape',
  'FS file separator',
  'GS group separator',
  'RS record separator',
  'US unit separator',
]

const NAMED: Record<number, string> = {
  32: 'space',
  33: 'exclamation mark',
  34: 'double quote',
  35: 'hash',
  36: 'dollar',
  37: 'percent',
  38: 'ampersand',
  39: 'single quote',
  40: 'left parenthesis',
  41: 'right parenthesis',
  42: 'asterisk',
  43: 'plus',
  44: 'comma',
  45: 'hyphen',
  46: 'full stop',
  47: 'forward slash',
  58: 'colon',
  59: 'semicolon',
  60: 'less than',
  61: 'equals',
  62: 'greater than',
  63: 'question mark',
  64: 'at sign',
  91: 'left square bracket',
  92: 'backslash',
  93: 'right square bracket',
  94: 'caret',
  95: 'underscore',
  96: 'backtick',
  123: 'left brace',
  124: 'pipe',
  125: 'right brace',
  126: 'tilde',
  127: 'DEL delete',
}

const COLUMNS: Column<AsciiRow>[] = [
  { key: 'dec', label: 'dec', mono: true, tight: true },
  { key: 'hex', label: 'hex', mono: true, tight: true },
  { key: 'oct', label: 'oct', mono: true, tight: true },
  { key: 'bin', label: 'binary', mono: true, tight: true },
  { key: 'char', label: 'char', mono: true, tight: true },
  { key: 'name', label: 'name' },
]

function describe(code: number): string {
  if (code < 32) return CONTROL_NAMES[code]
  if (NAMED[code]) return NAMED[code]
  if (code >= 48 && code <= 57) return `digit ${code - 48}`
  if (code >= 65 && code <= 90) return `uppercase ${String.fromCharCode(code)}`
  if (code >= 97 && code <= 122) return `lowercase ${String.fromCharCode(code)}`
  return ''
}

function AsciiTableUtil() {
  const rows = useMemo<AsciiRow[]>(
    () =>
      Array.from({ length: 128 }, (_, code) => ({
        dec: String(code),
        hex: code.toString(16).toUpperCase().padStart(2, '0'),
        oct: code.toString(8).padStart(3, '0'),
        bin: code.toString(2).padStart(8, '0'),
        char: code < 32 || code === 127 ? '·' : String.fromCharCode(code),
        name: describe(code),
      })),
    []
  )

  return (
    <ReferenceTable
      rows={rows}
      columns={COLUMNS}
      copyKey="char"
      placeholder="Search by character, code or name"
    />
  )
}

export default AsciiTableUtil
