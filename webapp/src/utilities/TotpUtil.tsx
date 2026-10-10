import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Decode(input: string): Uint8Array {
  const clean = input.replace(/=|\s/g, '').toUpperCase()
  let bits = 0
  let value = 0
  const output: number[] = []

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char)
    if (index === -1) throw new Error('Invalid base32')
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      bits -= 8
      output.push((value >> bits) & 0xff)
    }
  }

  return new Uint8Array(output)
}

async function totp(secret: string, timestamp: number): Promise<string> {
  const keyBytes = base32Decode(secret)
  let counter = Math.floor(timestamp / 30000)

  const counterBytes = new Uint8Array(8)
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff
    counter = Math.floor(counter / 256)
  }

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  const hmac = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, counterBytes)
  )

  const offset = hmac[hmac.length - 1] & 0x0f
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)

  return String(binary % 1000000).padStart(6, '0')
}

function TotpUtil() {
  const [secret, setSecret] = useState<string>('')
  const [code, setCode] = useState<string>('')
  const [secondsLeft, setSecondsLeft] = useState<number>(30)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const update = async () => {
      if (!secret) {
        setCode('')
        setError(null)
        return
      }
      try {
        const now = Date.now()
        const value = await totp(secret, now)
        if (!cancelled) {
          setCode(value)
          setSecondsLeft(30 - (Math.floor(now / 1000) % 30))
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setCode('')
          setError('Invalid base32 secret')
        }
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [secret])

  return (
    <>
      <TextField
        label="base32 secret"
        content={secret}
        onContentChange={setSecret}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      {code && (
        <div className="flex items-center justify-between">
          <span
            data-testid="totp-code"
            className="text-3xl font-semibold tabular-nums tracking-widest text-text"
          >
            {code}
          </span>
          <span
            data-testid="totp-seconds"
            className="text-sm text-subtle tabular-nums"
          >
            {secondsLeft}s
          </span>
        </div>
      )}
    </>
  )
}

export default TotpUtil
