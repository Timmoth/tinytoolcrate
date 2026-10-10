import { useState } from 'react'
import TextField from '../fields/TextField'
import { fromRoman, ROMAN_MAX, toRoman } from '../tools/numbers'

function RomanNumeralUtil() {
  const [number, setNumber] = useState<string>('2026')
  const [numeral, setNumeral] = useState<string>(toRoman(2026))
  const [error, setError] = useState<string | null>(null)

  const fromNumber = (value: string) => {
    setNumber(value)
    if (value.trim() === '') {
      setNumeral('')
      setError(null)
      return
    }
    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > ROMAN_MAX) {
      setNumeral('')
      setError(`Enter a whole number between 1 and ${ROMAN_MAX}`)
      return
    }
    setNumeral(toRoman(parsed))
    setError(null)
  }

  const fromNumeral = (value: string) => {
    setNumeral(value)
    if (value.trim() === '') {
      setNumber('')
      setError(null)
      return
    }
    const parsed = fromRoman(value)
    if (parsed === null) {
      setNumber('')
      setError('Not a valid roman numeral')
      return
    }
    setNumber(String(parsed))
    setError(null)
  }

  return (
    <>
      <TextField
        label="number"
        content={number}
        onContentChange={fromNumber}
        isReadonly={false}
        isCopyable={true}
        isMultiline={false}
      />
      <TextField
        label="roman numeral"
        content={numeral}
        onContentChange={fromNumeral}
        isReadonly={false}
        isCopyable={true}
        isMultiline={false}
      />

      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <p className="text-[11px] text-faint">
        Roman numerals have no zero and no standard way to write past 3,999, so
        that is the range. Non-standard spellings such as IIII or IC are
        rejected rather than guessed at.
      </p>
    </>
  )
}

export default RomanNumeralUtil
