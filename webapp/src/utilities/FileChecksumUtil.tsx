import { useMemo, useState } from 'react'
import TextField from '../fields/TextField'
import FileDrop from '../components/FileDrop'
import { md5 } from '../crypto'
import { formatBytes } from '../tools/download'

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function FileChecksumUtil() {
  const [hashes, setHashes] = useState<{ [key: string]: string }>({})
  const [fileMeta, setFileMeta] = useState<string>('')
  const [expected, setExpected] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<boolean>(false)

  const handleFiles = async (files: File[]) => {
    const file = files[0]
    setError(null)
    setBusy(true)
    setFileMeta(`${file.name} (${formatBytes(file.size)})`)

    try {
      const data = await file.arrayBuffer()
      const digests = await Promise.all(
        ALGORITHMS.map(async (algorithm) => [
          algorithm,
          toHex(await crypto.subtle.digest(algorithm, data)),
        ])
      )
      setHashes(
        Object.fromEntries([['MD5', md5(new Uint8Array(data))], ...digests])
      )
    } catch {
      setHashes({})
      setError('Could not read that file')
    } finally {
      setBusy(false)
    }
  }

  /** Matches the pasted checksum against whichever algorithm produced it. */
  const verdict = useMemo(() => {
    const candidate = expected.trim().toLowerCase().replace(/\s/g, '')
    if (candidate === '' || Object.keys(hashes).length === 0) return null

    const match = Object.entries(hashes).find(([, hash]) => hash === candidate)
    if (match) return { ok: true, message: `Matches the ${match[0]} checksum` }

    const sameLength = Object.entries(hashes).find(
      ([, hash]) => hash.length === candidate.length
    )
    return {
      ok: false,
      message: sameLength
        ? `Does not match — this file's ${sameLength[0]} is different`
        : 'Does not match any checksum of this file',
    }
  }, [expected, hashes])

  return (
    <>
      <FileDrop onFiles={handleFiles} hint="Drop a file to checksum" />

      {fileMeta && (
        <TextField
          label="file"
          content={busy ? `${fileMeta} — hashing…` : fileMeta}
          isReadonly={true}
          isCopyable={false}
          isMultiline={false}
        />
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {Object.keys(hashes).length > 0 && (
        <>
          <TextField
            label="expected checksum"
            content={expected}
            onContentChange={setExpected}
            isReadonly={false}
            isCopyable={false}
            isMultiline={false}
          />

          {verdict && (
            <div
              data-testid="checksum-verdict"
              data-match={verdict.ok}
              className={`rounded-lg border px-3 py-2 text-sm ${
                verdict.ok
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300'
              }`}
            >
              {verdict.message}
            </div>
          )}
        </>
      )}

      {['MD5', ...ALGORITHMS]
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

      <p className="text-[11px] text-faint">
        Hashed in your browser — the file is never uploaded. MD5 and SHA-1 are
        fine for spotting a corrupted download but are broken against a
        deliberate forgery; prefer SHA-256 when it is offered.
      </p>
    </>
  )
}

export default FileChecksumUtil
