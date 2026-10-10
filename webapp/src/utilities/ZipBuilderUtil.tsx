import { useState } from 'react'
import FileDrop from '../components/FileDrop'
import TextField from '../fields/TextField'
import Unsupported from '../components/Unsupported'
import { COMPRESSION_SUPPORTED } from '../tools/compress'
import { downloadBlob, formatBytes } from '../tools/download'
import { createZip } from '../tools/zip'

type Pending = { name: string; size: number; file: File }

function ZipBuilderUtil() {
  const [files, setFiles] = useState<Pending[]>([])
  const [name, setName] = useState<string>('archive.zip')
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<boolean>(false)

  const add = (incoming: File[]) => {
    setError(null)
    setFiles((current) => {
      const names = new Set(current.map((entry) => entry.name))
      const next = [...current]
      for (const file of incoming) {
        // Two files with the same name would make an ambiguous archive.
        let candidate = file.name
        let suffix = 1
        while (names.has(candidate)) {
          const dot = file.name.lastIndexOf('.')
          candidate =
            dot === -1
              ? `${file.name} (${suffix})`
              : `${file.name.slice(0, dot)} (${suffix})${file.name.slice(dot)}`
          suffix += 1
        }
        names.add(candidate)
        next.push({ name: candidate, size: file.size, file })
      }
      return next
    })
  }

  const build = async () => {
    if (files.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const entries = await Promise.all(
        files.map(async (entry) => ({
          name: entry.name,
          data: new Uint8Array(await entry.file.arrayBuffer()),
          date: new Date(entry.file.lastModified),
        }))
      )
      const blob = await createZip(entries)
      const total = entries.reduce((sum, entry) => sum + entry.data.length, 0)
      setStatus(
        `${entries.length} file${entries.length === 1 ? '' : 's'} · ${formatBytes(
          total
        )} → ${formatBytes(blob.size)}`
      )
      downloadBlob(blob, name.trim().endsWith('.zip') ? name.trim() : `${name.trim()}.zip`)
    } catch (caught) {
      setError((caught as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const total = files.reduce((sum, entry) => sum + entry.size, 0)

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
      <FileDrop onFiles={add} multiple hint="Drop files to add to the archive" />

      {files.length > 0 && (
        <ul className="space-y-1" data-testid="zip-files">
          {files.map((entry, index) => (
            <li
              key={`${entry.name}-${index}`}
              data-testid="zip-file"
              className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1 text-xs"
            >
              <span className="truncate text-text font-mono">{entry.name}</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-subtle">{formatBytes(entry.size)}</span>
                <button
                  type="button"
                  aria-label={`Remove ${entry.name}`}
                  onClick={() =>
                    setFiles((current) => current.filter((_, i) => i !== index))
                  }
                  className="rounded px-1 text-faint hover:bg-hover hover:text-text transition-colors"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <div className="flex items-center justify-between text-xs text-subtle">
          <span data-testid="zip-total">
            {files.length} file{files.length === 1 ? '' : 's'} · {formatBytes(total)}
          </span>
          <button
            type="button"
            onClick={() => {
              setFiles([])
              setStatus('')
            }}
            className="px-2 py-0.5 rounded border border-border hover:bg-hover hover:text-text transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      <TextField
        label="archive name"
        content={name}
        onContentChange={setName}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />

      <button
        type="button"
        onClick={build}
        disabled={busy || files.length === 0}
        data-testid="zip-build"
        className="w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text hover:bg-hover transition-colors disabled:opacity-50"
      >
        {busy ? 'Zipping…' : 'Create zip'}
      </button>

      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
      {status && (
        <div className="text-xs text-subtle" data-testid="zip-status">
          {status}
        </div>
      )}

      <p className="text-[11px] text-faint">
        Built in your browser — nothing is uploaded. Entries that do not shrink
        are stored uncompressed. No encryption, and no single file over 4GB.
      </p>
    </>
  )
}

export default ZipBuilderUtil
