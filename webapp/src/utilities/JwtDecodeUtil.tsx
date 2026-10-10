import { useState, useEffect } from 'react'
import TextField from '../fields/TextField'

function decodeSegment(segment: string): Record<string, unknown> {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64)) as Record<string, unknown>
}

function humanizeTimestamp(value: unknown): string | null {
  if (typeof value !== 'number' || !isFinite(value)) return null
  const date = new Date(value * 1000)
  if (isNaN(date.getTime())) return null

  const diffMs = date.getTime() - Date.now()
  const abs = Math.abs(diffMs)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000000],
    ['month', 2592000000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
  ]
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  let relative = date.toLocaleString()
  for (const [unit, ms] of units) {
    if (abs >= ms) {
      relative = `${date.toLocaleString()} (${rtf.format(Math.round(diffMs / ms), unit)})`
      break
    }
  }
  return relative
}

function JwtDecodeUtil() {
  const [currentJwt, setCurrentJwt] = useState<string>("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
  const [header, setHeader] = useState<string>('')
  const [payload, setPayload] = useState<Record<string, unknown> | 'invalid jwt' | null>(null);
  const [expiry, setExpiry] = useState<string>('')

  const handleContentChange = (newContent: string) => {
    setCurrentJwt(newContent);
  };

  useEffect(() => {
    try {
      const parts = currentJwt.split('.')
      if (parts.length !== 3) throw new Error('Invalid JWT format')

      const decoded = decodeSegment(parts[1])
      setPayload(decoded)

      try {
        setHeader(JSON.stringify(decodeSegment(parts[0]), null, 2))
      } catch {
        setHeader('invalid header')
      }

      const exp = humanizeTimestamp(decoded.exp)
      const iat = humanizeTimestamp(decoded.iat)
      setExpiry(
        [
          exp ? `expires: ${exp}` : 'no expiry claim',
          iat ? `issued: ${iat}` : null,
        ]
          .filter(Boolean)
          .join('  |  ')
      )
    } catch (error) {
      setHeader('invalid jwt')
      setPayload('invalid jwt')
      setExpiry('')
      console.error('Error decoding JWT:', error);
    }
  }, [currentJwt]);

  const payloadContent =
    typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)

  return (
    <>
      <TextField
        label="Encoded jwt"
        content={currentJwt}
        onContentChange={handleContentChange}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="decoded header"
        content={header}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="decoded jwt"
        content={payloadContent}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
      {expiry && (
        <TextField
          label="validity"
          content={expiry}
          isReadonly={true}
          isCopyable={false}
          isMultiline={false}
        />
      )}
    </>
  );
}

export default JwtDecodeUtil;
