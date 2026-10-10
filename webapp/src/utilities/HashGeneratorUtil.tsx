import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'
import { md5 } from '../crypto'

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function HashGeneratorUtil() {
  const [input, setInput] = useState<string>('')
  const [key, setKey] = useState<string>('')
  const [hashes, setHashes] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!input) {
      setHashes({})
      return
    }

    let cancelled = false
    const encoded = new TextEncoder().encode(input)

    ;(async () => {
      const digests = await Promise.all(
        ALGORITHMS.map(async (algorithm) => {
          const digest = await crypto.subtle.digest(algorithm, encoded)
          return [algorithm, toHex(digest)] as [string, string]
        })
      )
      const entries: [string, string][] = [['MD5', md5(encoded)], ...digests]

      if (key) {
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(key),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        )
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoded)
        entries.push(['HMAC-SHA-256', toHex(signature)])
      }

      if (!cancelled) {
        setHashes(Object.fromEntries(entries))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [input, key])

  return (
    <>
      <TextField
        label="enter text"
        content={input}
        onContentChange={setInput}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="hmac key"
        content={key}
        onContentChange={setKey}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />
      {['MD5', ...ALGORITHMS, 'HMAC-SHA-256']
        .filter((algorithm) => hashes[algorithm])
        .map((algorithm) => (
          <TextField
            key={algorithm}
            label={`${algorithm} Hash`}
            content={hashes[algorithm]}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
        ))}
    </>
  )
}

export default HashGeneratorUtil
