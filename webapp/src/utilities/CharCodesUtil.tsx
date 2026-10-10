import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'
import { CodeBase, codesToText, textToCodes } from '../tools/text'

const SELECT =
  'text-xs rounded-md border border-border bg-input px-2 py-1 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'
const TOGGLE = 'px-2.5 py-1 text-xs font-medium rounded-md border transition-colors'

type Mode = 'encode' | 'decode'

function CharCodesUtil() {
  const [mode, setMode] = useState<Mode>('encode')
  const [base, setBase] = useState<CodeBase>('hex')
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (input === '') {
      setOutput('')
      setError(null)
      return
    }
    try {
      setOutput(mode === 'encode' ? textToCodes(input, base) : codesToText(input, base))
      setError(null)
    } catch (caught) {
      setOutput('')
      setError((caught as Error).message)
    }
  }, [mode, base, input])

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1" role="group" aria-label="Mode">
          {(['encode', 'decode'] as Mode[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
              className={`${TOGGLE} ${
                mode === option
                  ? 'border-accent bg-accent/10 text-text'
                  : 'border-border text-subtle hover:bg-hover hover:text-text'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <select
          aria-label="Base"
          className={SELECT}
          value={base}
          onChange={(event) => setBase(event.target.value as CodeBase)}
        >
          <option value="hex">hex</option>
          <option value="binary">binary</option>
          <option value="decimal">decimal</option>
          <option value="octal">octal</option>
        </select>
      </div>

      <TextField
        label={mode === 'encode' ? 'text' : `${base} codes`}
        content={input}
        onContentChange={setInput}
        isReadonly={false}
        isCopyable={false}
        isMultiline={true}
      />

      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <TextField
        label={mode === 'encode' ? `${base} codes` : 'text'}
        content={output}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />

      <p className="text-[11px] text-faint">
        Characters are encoded as utf-8 bytes, so ascii matches the classic
        one-byte-per-character tables and accented or emoji characters take
        several bytes.
      </p>
    </>
  )
}

export default CharCodesUtil
