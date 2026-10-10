import { useMemo, useState } from 'react'
import TextField from '../fields/TextField'
import { formatIpv4, formatIpv6, parseIpv4, parseIpv6 } from '../tools/ip'

function IpConvertUtil() {
  const [input, setInput] = useState<string>('192.168.1.1')

  const result = useMemo((): { rows: [string, string][]; error: string | null } => {
    const text = input.trim()
    if (text === '') return { rows: [], error: null }

    if (text.includes(':')) {
      const value = parseIpv6(text)
      if (value === null) return { rows: [], error: 'Not a valid IPv6 address' }
      return {
        rows: [
          ['ipv6', formatIpv6(value)],
          ['decimal', value.toString()],
          ['hex', `0x${value.toString(16)}`],
        ],
        error: null,
      }
    }

    // A bare number is an integer the user wants turned back into an address.
    if (/^\d+$/.test(text)) {
      const value = Number(text)
      if (value > 0xffffffff) {
        const big = BigInt(text)
        return {
          rows: [
            ['ipv6', formatIpv6(big)],
            ['decimal', big.toString()],
            ['hex', `0x${big.toString(16)}`],
          ],
          error: null,
        }
      }
      return { rows: rowsForIpv4(value), error: null }
    }

    if (/^0x[0-9a-f]+$/i.test(text)) {
      return { rows: rowsForIpv4(parseInt(text, 16) >>> 0), error: null }
    }

    const value = parseIpv4(text)
    if (value === null) return { rows: [], error: 'Not a valid IP address' }
    return { rows: rowsForIpv4(value), error: null }
  }, [input])

  return (
    <>
      <TextField
        label="ip address, decimal or hex"
        content={input}
        onContentChange={setInput}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />

      {result.error && (
        <div className="text-sm text-red-600 dark:text-red-400">{result.error}</div>
      )}

      {result.rows.map(([label, value]) => (
        <TextField
          key={label}
          label={label}
          content={value}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      ))}

      <p className="text-[11px] text-faint">
        Works in both directions — paste an address to get its numeric forms, or
        paste a number to get the address back. Useful when a log or database
        column stores addresses as integers.
      </p>
    </>
  )
}

function rowsForIpv4(value: number): [string, string][] {
  const octets = [24, 16, 8, 0].map((shift) => (value >>> shift) & 255)
  return [
    ['ipv4', formatIpv4(value)],
    ['decimal', String(value >>> 0)],
    ['hex', `0x${(value >>> 0).toString(16).padStart(8, '0')}`],
    ['octal', octets.map((o) => o.toString(8).padStart(3, '0')).join('.')],
    ['binary', octets.map((o) => o.toString(2).padStart(8, '0')).join('.')],
    ['ipv6 mapped', `::ffff:${formatIpv4(value)}`],
  ]
}

export default IpConvertUtil
