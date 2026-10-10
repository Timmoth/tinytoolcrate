import { useState } from 'react'
import FileDrop from '../components/FileDrop'
import { downloadBlob, formatBytes } from '../tools/download'
import { ExifTag, hasLocation, readExif } from '../tools/exif'
import { convertImage, loadImage } from '../tools/image'

function ExifUtil() {
  const [tags, setTags] = useState<ExifTag[] | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<boolean>(false)

  const open = async (files: File[]) => {
    const picked = files[0]
    setError(null)
    setFile(picked)
    try {
      setTags(readExif(new Uint8Array(await picked.arrayBuffer())))
    } catch (caught) {
      setTags(null)
      setError((caught as Error).message)
    }
  }

  const strip = async () => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const bitmap = await loadImage(file)
      const blob = await convertImage(bitmap, {
        type: 'image/jpeg',
        quality: 0.92,
        width: bitmap.width,
        height: bitmap.height,
      })
      downloadBlob(blob, file.name.replace(/\.[^.]+$/, '') + '-clean.jpg')
    } catch (caught) {
      setError((caught as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const groups = [...new Set((tags ?? []).map((tag) => tag.group))]

  return (
    <>
      <FileDrop onFiles={open} accept="image/jpeg" hint="Drop a JPEG to inspect" />

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400" data-testid="exif-error">
          {error}
        </div>
      )}

      {file && !error && (
        <div className="text-xs text-subtle" data-testid="exif-summary">
          {file.name} · {formatBytes(file.size)} ·{' '}
          {tags && tags.length > 0
            ? `${tags.length} tag${tags.length === 1 ? '' : 's'}`
            : 'no exif metadata'}
        </div>
      )}

      {tags && hasLocation(tags) && (
        <div
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300"
          data-testid="exif-gps-warning"
        >
          This photo carries GPS coordinates. Anyone you send it to can see where
          it was taken.
        </div>
      )}

      {groups.map((group) => (
        <div key={group}>
          <p className="text-[11px] font-medium uppercase tracking-wider text-subtle mb-1">
            {group}
          </p>
          <table className="w-full text-xs" data-testid="exif-table">
            <tbody>
              {(tags ?? [])
                .filter((tag) => tag.group === group)
                .map((tag) => (
                  <tr
                    key={`${group}-${tag.name}`}
                    data-testid="exif-row"
                    className="border-t border-border/60"
                  >
                    <td className="py-1 pr-2 text-subtle whitespace-nowrap align-top">
                      {tag.name}
                    </td>
                    <td className="py-1 text-text font-mono break-all">{tag.value}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}

      {file && !error && (
        <button
          type="button"
          onClick={strip}
          disabled={busy}
          data-testid="exif-strip"
          className="w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text hover:bg-hover transition-colors disabled:opacity-50"
        >
          {busy ? 'Working…' : 'Download a copy with metadata removed'}
        </button>
      )}

      <p className="text-[11px] text-faint">
        Read in your browser; the photo is never uploaded. Stripping re-encodes
        the image as JPEG at quality 92, which discards every tag above along
        with a little image quality.
      </p>
    </>
  )
}

export default ExifUtil
