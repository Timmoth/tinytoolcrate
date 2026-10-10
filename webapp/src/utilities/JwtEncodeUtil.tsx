import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'

function base64UrlEncode(input: string | ArrayBuffer): string {
  let binary = ''
  if (typeof input === 'string') {
    for (const byte of new TextEncoder().encode(input)) {
      binary += String.fromCharCode(byte)
    }
  } else {
    for (const byte of new Uint8Array(input)) {
      binary += String.fromCharCode(byte)
    }
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function JwtEncodeUtil() {
  const [payload, setPayload] = useState<string>(
    '{\n  "sub": "1234567890",\n  "name": "John Doe"\n}'
  )
  const [secret, setSecret] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        JSON.parse(payload)
        const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
        const body = base64UrlEncode(JSON.stringify(JSON.parse(payload)))
        const signingInput = `${header}.${body}`

        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(secret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        )
        const signature = await crypto.subtle.sign(
          'HMAC',
          cryptoKey,
          new TextEncoder().encode(signingInput)
        )

        if (!cancelled) {
          setToken(`${signingInput}.${base64UrlEncode(signature)}`)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setToken('')
          setError('Invalid JSON payload')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [payload, secret])

  return (
    <>
      <TextField
        label="payload json"
        content={payload}
        onContentChange={setPayload}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="secret"
        content={secret}
        onContentChange={setSecret}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      <TextField
        label="signed jwt (hs256)"
        content={token}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
    </>
  )
}

export default JwtEncodeUtil
