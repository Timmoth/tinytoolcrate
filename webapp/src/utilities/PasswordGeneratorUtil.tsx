import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'

const CHAR_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
} as const

type SetName = keyof typeof CHAR_SETS

const MIN_LENGTH = 4
const MAX_LENGTH = 128

function randomInt(max: number): number {
  if (max <= 0) return 0
  const limit = Math.floor(0xffffffff / max) * max
  const buffer = new Uint32Array(1)
  let value
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)
  return value % max
}

function generatePassword(
  length: number,
  enabled: Record<SetName, boolean>
): string {
  const activeSets = (Object.keys(CHAR_SETS) as SetName[]).filter(
    (name) => enabled[name]
  )
  if (activeSets.length === 0) return ''

  const pool = activeSets.map((name) => CHAR_SETS[name]).join('')
  const chars: string[] = activeSets.map(
    (name) => CHAR_SETS[name][randomInt(CHAR_SETS[name].length)]
  )

  while (chars.length < length) {
    chars.push(pool[randomInt(pool.length)])
  }
  chars.length = length

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}

function PasswordGeneratorUtil() {
  const [length, setLength] = useState<number>(20)
  const [enabled, setEnabled] = useState<Record<SetName, boolean>>({
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
  })
  const [password, setPassword] = useState<string>(() =>
    generatePassword(20, {
      lowercase: true,
      uppercase: true,
      digits: true,
      symbols: true,
    })
  )

  const adjustLength = (delta: number) => {
    setLength((prev) => Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, prev + delta)))
  }

  useEffect(() => {
    setPassword(generatePassword(length, enabled))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length])

  const toggleSet = (name: SetName) => {
    setEnabled((prev) => {
      const next = { ...prev, [name]: !prev[name] }
      if (!Object.values(next).some(Boolean)) return prev
      setPassword(generatePassword(length, next))
      return next
    })
  }

  const poolSize = (Object.keys(CHAR_SETS) as SetName[]).reduce(
    (total, name) => (enabled[name] ? total + CHAR_SETS[name].length : total),
    0
  )
  const entropy =
    poolSize > 0 ? Math.round(length * Math.log2(poolSize)) : 0

  return (
    <>
      <TextField
        label="password"
        content={password}
        isReadonly={true}
        isCopyable={true}
        isMultiline={false}
      />
      <TextField
        label="entropy"
        content={`${entropy} bits`}
        isReadonly={true}
        isCopyable={false}
        isMultiline={false}
      />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-subtle">
          length
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="pw-decrease"
            aria-label="Decrease length"
            onClick={() => adjustLength(-1)}
            disabled={length <= MIN_LENGTH}
            className="w-7 h-7 rounded-md border border-border text-subtle text-sm hover:bg-hover disabled:opacity-40 transition-colors"
          >
            −
          </button>
          <span
            data-testid="pw-length"
            className="tabular-nums text-sm text-text w-8 text-center"
          >
            {length}
          </span>
          <button
            type="button"
            data-testid="pw-increase"
            aria-label="Increase length"
            onClick={() => adjustLength(1)}
            disabled={length >= MAX_LENGTH}
            className="w-7 h-7 rounded-md border border-border text-subtle text-sm hover:bg-hover disabled:opacity-40 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(CHAR_SETS) as SetName[]).map((name) => (
          <label
            key={name}
            className="flex items-center gap-2 text-sm text-subtle cursor-pointer"
          >
            <input
              type="checkbox"
              checked={enabled[name]}
              onChange={() => toggleSet(name)}
              className="rounded border-border accent-accent"
            />
            {name}
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setPassword(generatePassword(length, enabled))}
        className="self-start text-sm font-medium rounded-lg border border-border px-3 py-1.5 text-subtle hover:bg-hover hover:text-text transition-colors"
      >
        Generate
      </button>
    </>
  )
}

export default PasswordGeneratorUtil
