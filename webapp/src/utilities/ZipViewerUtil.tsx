import { useState } from 'react'
import FileDrop from '../components/FileDrop'
import Unsupported from '../components/Unsupported'
import { COMPRESSION_SUPPORTED } from '../tools/compress'
import { downloadBlob, formatBytes } from '../tools/download'
import { extractEntry, readZip, ZipEntry } from '../tools/zip'

const METHODS: Record<number, string> = { 0: 'stored', 8: 'deflate' }

function ZipViewerUtil() {
  const [archive, setArchive] = useState<Uint8Array | null>(null)
  const [entries, setEntries] = useState<ZipEntry[]>([])
  const [name, setName] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const open = async (files: File[]) => {
    const file = files[0]
    setError(null)
    try {
      const data = new Uint8Array(await file.arrayBuffer())
      const found = readZip(data)
      setArchive(data)
      setEntries(found)
      setName(file.name)
    } catch (caught) {
      setArchive(null)
      setEntries([])
      setName('')
      setError((caught as Error).message)
    }
  }

  const save = async (entry: ZipEntry) => {
    if (!archive) return
    setError(null)
    try {
      const data = await extractEntry(archive, entry)
      downloadBlob(
        new Blob([data as BlobPart]),
        entry.name.split('/').pop() || 'file'
      )
    } catch (caught) {
      setError((caught as Error).message)
    }
  }

  const visible = entries.filter((entry) => !entry.directory)
  const total = visible.reduce((sum, entry) => sum + entry.size, 0)
  const packed = visible.reduce((sum, entry) => sum + entry.compressedSize, 0)

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
      <FileDrop onFiles={open} accept=".zip,application/zip" hint="Drop a .zip to look inside" />

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400" data-testid="zip-error">
          {error}
        </div>
      )}

      {name && (
        <div className="text-xs text-subtle" data-testid="zip-summary">
          {name} · {visible.length} file{visible.length === 1 ? '' : 's'} ·{' '}
          {formatBytes(packed)} packed, {formatBytes(total)} unpacked
          {total > 0 && ` · ${Math.round((1 - packed / total) * 100)}% saved`}
        </div>
      )}

      {visible.length > 0 && (
        <div
          className="overflow-auto rounded-lg border border-border"
          style={{ maxHeight: 300 }}
        >
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-subtle">
                <th className="px-2 py-1.5 font-medium">name</th>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">size</th>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">packed</th>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">method</th>
                <th className="px-2 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {visible.map((entry) => (
                <tr
                  key={entry.name}
                  data-testid="zip-entry"
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="px-2 py-1.5 font-mono text-text break-all">
                    {entry.name}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-subtle">
                    {formatBytes(entry.size)}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-subtle">
                    {formatBytes(entry.compressedSize)}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-subtle">
                    {METHODS[entry.method] ?? `method ${entry.method}`}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <button
                      type="button"
                      aria-label={`Extract ${entry.name}`}
                      onClick={() => save(entry)}
                      className="rounded border border-border px-1.5 py-0.5 text-[11px] text-subtle hover:bg-hover hover:text-text transition-colors"
                    >
                      save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-faint">
        Read entirely in your browser. Encrypted archives and anything beyond
        stored or deflated entries cannot be extracted here.
      </p>
    </>
  )
}

export default ZipViewerUtil
