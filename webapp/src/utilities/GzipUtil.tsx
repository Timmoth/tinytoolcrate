import { useState } from 'react'
import TextField from '../fields/TextField'
import Unsupported from '../components/Unsupported'
import FileDrop from '../components/FileDrop'
import {
  CompressionFormat,
  compress,
  decompress,
  FORMAT_LABELS,
  sniffFormat,
  COMPRESSION_SUPPORTED,
} from '../tools/compress'
import { downloadBlob, formatBytes } from '../tools/download'
import { fromBase64, toBase64 } from '../crypto'

const SELECT =
  'text-xs rounded-md border border-border bg-input px-2 py-1 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'
const TOGGLE = 'px-2.5 py-1 text-xs font-medium rounded-md border transition-colors'

type Mode = 'compress' | 'decompress'

function GzipUtil() {
  const [mode, setMode] = useState<Mode>('compress')
  const [format, setFormat] = useState<CompressionFormat>('gzip')
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [stats, setStats] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<boolean>(false)

  const run = async () => {
    setError(null)
    if (input.trim() === '') {
      setError('Nothing to ' + mode)
      return
    }

    setBusy(true)
    try {
      if (mode === 'compress') {
        const raw = new TextEncoder().encode(input)
        const packed = await compress(raw, format)
        setOutput(toBase64(packed))
        setStats(
          `${formatBytes(raw.length)} → ${formatBytes(packed.length)} · ${Math.round(
            (1 - packed.length / raw.length) * 100
          )}% smaller`
        )
      } else {
        const packed = fromBase64(input.trim())
        const detected = sniffFormat(packed) ?? format
        const raw = await decompress(packed, detected)
        setOutput(new TextDecoder().decode(raw))
        setStats(
          `${formatBytes(packed.length)} → ${formatBytes(raw.length)} · read as ${
            FORMAT_LABELS[detected]
          }`
        )
      }
    } catch {
      setOutput('')
      setStats('')
      setError(
        mode === 'compress'
          ? 'Could not compress that input'
          : 'Could not decompress — check the data is base64 and the format matches'
      )
    } finally {
      setBusy(false)
    }
  }

  const handleFile = async (files: File[]) => {
    const file = files[0]
    setError(null)
    setBusy(true)
    try {
      const raw = new Uint8Array(await file.arrayBuffer())
      if (mode === 'compress') {
        const packed = await compress(raw, format)
        setStats(
          `${file.name}: ${formatBytes(raw.length)} → ${formatBytes(packed.length)}`
        )
        downloadBlob(new Blob([packed as BlobPart]), `${file.name}.gz`)
      } else {
        const detected = sniffFormat(raw) ?? format
        const unpacked = await decompress(raw, detected)
        setStats(
          `${file.name}: ${formatBytes(raw.length)} → ${formatBytes(unpacked.length)}`
        )
        downloadBlob(
          new Blob([unpacked as BlobPart]),
          file.name.replace(/\.(gz|zz|deflate)$/i, '') || 'decompressed'
        )
      }
    } catch {
      setError(`Could not ${mode} that file`)
    } finally {
      setBusy(false)
    }
  }

  if (!COMPRESSION_SUPPORTED) {
    return (
      <Unsupported
        feature="the browser compression api"
        available="It is available in Chrome 80, Safari 16.4 and Firefox 113 or newer."
      />
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1" role="group" aria-label="Mode">
          {(['compress', 'decompress'] as Mode[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => {
                setMode(option)
                setOutput('')
                setStats('')
                setError(null)
              }}
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
          aria-label="Format"
          className={SELECT}
          value={format}
          onChange={(event) => setFormat(event.target.value as CompressionFormat)}
        >
          {(Object.keys(FORMAT_LABELS) as CompressionFormat[]).map((option) => (
            <option key={option} value={option}>
              {FORMAT_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <TextField
        label={mode === 'compress' ? 'text' : 'compressed (base64)'}
        content={input}
        onContentChange={(value) => {
          setInput(value)
          setError(null)
        }}
        isReadonly={false}
        isCopyable={false}
        isMultiline={true}
      />

      <button
        type="button"
        onClick={run}
        disabled={busy}
        data-testid="gzip-run"
        className="w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text hover:bg-hover transition-colors disabled:opacity-50"
      >
        {busy ? 'Working…' : mode === 'compress' ? 'Compress' : 'Decompress'}
      </button>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400" data-testid="gzip-error">
          {error}
        </div>
      )}
      {stats && (
        <div className="text-xs text-subtle" data-testid="gzip-stats">
          {stats}
        </div>
      )}

      <TextField
        label={mode === 'compress' ? 'compressed (base64)' : 'text'}
        content={output}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />

      <FileDrop
        onFiles={handleFile}
        hint={`Or drop a file to ${mode} and download`}
      />

      <p className="text-[11px] text-faint">
        Uses the browser&rsquo;s own compression, so gzip, zlib and raw deflate are
        supported. Brotli and zstd are not available without a library.
      </p>
    </>
  )
}

export default GzipUtil
