import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'
import { atbash, caesar, vigenere, xorCipher } from '../crypto'

const SELECT =
  'text-xs rounded-md border border-border bg-input px-2 py-1 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'
const TOGGLE = 'px-2.5 py-1 text-xs font-medium rounded-md border transition-colors'

type Cipher = 'rot13' | 'caesar' | 'atbash' | 'vigenere' | 'xor'

const NEEDS_KEY: Cipher[] = ['vigenere', 'xor']

const LABELS: Record<Cipher, string> = {
  rot13: 'ROT13',
  caesar: 'Caesar shift',
  atbash: 'Atbash',
  vigenere: 'Vigenère',
  xor: 'XOR (hex)',
}

function ClassicCipherUtil() {
  const [cipher, setCipher] = useState<Cipher>('rot13')
  const [decode, setDecode] = useState<boolean>(false)
  const [shift, setShift] = useState<number>(3)
  const [key, setKey] = useState<string>('')
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
      switch (cipher) {
        case 'rot13':
          setOutput(caesar(input, 13))
          break
        case 'caesar':
          setOutput(caesar(input, decode ? -shift : shift))
          break
        case 'atbash':
          setOutput(atbash(input))
          break
        case 'vigenere':
          setOutput(vigenere(input, key, decode))
          break
        case 'xor':
          setOutput(xorCipher(input, key, decode))
          break
      }
      setError(null)
    } catch (caught) {
      setOutput('')
      setError((caught as Error).message)
    }
  }, [cipher, decode, shift, key, input])

  const symmetric = cipher === 'rot13' || cipher === 'atbash'

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Cipher"
          className={SELECT}
          value={cipher}
          onChange={(event) => setCipher(event.target.value as Cipher)}
        >
          {(Object.keys(LABELS) as Cipher[]).map((option) => (
            <option key={option} value={option}>
              {LABELS[option]}
            </option>
          ))}
        </select>

        {cipher === 'caesar' && (
          <input
            type="number"
            aria-label="Shift"
            min={1}
            max={25}
            value={shift}
            onChange={(event) => setShift(Number(event.target.value))}
            className={`${SELECT} w-16`}
          />
        )}

        {!symmetric && (
          <div className="flex items-center gap-1" role="group" aria-label="Direction">
            {[false, true].map((option) => (
              <button
                key={String(option)}
                type="button"
                aria-pressed={decode === option}
                onClick={() => setDecode(option)}
                className={`${TOGGLE} ${
                  decode === option
                    ? 'border-accent bg-accent/10 text-text'
                    : 'border-border text-subtle hover:bg-hover hover:text-text'
                }`}
              >
                {option ? 'decode' : 'encode'}
              </button>
            ))}
          </div>
        )}
      </div>

      {NEEDS_KEY.includes(cipher) && (
        <TextField
          label="key"
          content={key}
          onContentChange={setKey}
          isReadonly={false}
          isCopyable={false}
          isMultiline={false}
        />
      )}

      <TextField
        label="input"
        content={input}
        onContentChange={setInput}
        isReadonly={false}
        isCopyable={false}
        isMultiline={true}
      />

      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <TextField
        label="output"
        content={output}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />

      <p className="text-[11px] text-faint">
        Classic ciphers for puzzles and CTFs. None of these offer real security —
        use AES encrypt for anything that matters.
      </p>
    </>
  )
}

export default ClassicCipherUtil
