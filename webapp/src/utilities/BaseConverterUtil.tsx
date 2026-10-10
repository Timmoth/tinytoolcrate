import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'

const BASES = [2, 8, 10, 16]

function fromBase10(n: bigint, base: number): string {
  return n.toString(base)
}

function BaseConverterUtil() {
  const [value, setValue] = useState<string>('')
  const [fromBase, setFromBase] = useState<number>(10)
  const [outputs, setOutputs] = useState<{ [key: string]: string }>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = value.trim()
    if (!trimmed) {
      setOutputs({})
      setError(null)
      return
    }

    const digits = trimmed.toLowerCase()
    if (!/^[0-9a-z]+$/.test(digits)) {
      setOutputs({})
      setError('Invalid number')
      return
    }

    let parsed = 0n
    for (const char of digits) {
      const digit = parseInt(char, 36)
      if (isNaN(digit) || digit >= fromBase) {
        setOutputs({})
        setError(`Invalid number for base ${fromBase}`)
        return
      }
      parsed = parsed * BigInt(fromBase) + BigInt(digit)
    }
    setOutputs({
      hex: fromBase10(parsed, 16),
      decimal: fromBase10(parsed, 10),
      octal: fromBase10(parsed, 8),
      binary: fromBase10(parsed, 2),
    })
    setError(null)
  }, [value, fromBase])

  return (
    <>
      <div className="flex space-x-2 w-full">
        <TextField
          label="value"
          content={value}
          onContentChange={setValue}
          isReadonly={false}
          isCopyable={false}
          isMultiline={false}
        />
        <div className="w-24">
          <div className="flex items-center justify-between mb-1 min-h-5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-subtle">
              base
            </label>
          </div>
          <select
            data-testid="base-select"
            value={fromBase}
            onChange={(e) => setFromBase(Number(e.target.value))}
            className="w-full text-sm rounded-lg border border-border bg-input px-2 py-2 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            {BASES.map((base) => (
              <option key={base} value={base}>
                {base}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      {['hex', 'decimal', 'octal', 'binary'].map((name) => (
        <TextField
          key={name}
          label={name}
          content={outputs[name] ?? ''}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      ))}
    </>
  )
}

export default BaseConverterUtil
