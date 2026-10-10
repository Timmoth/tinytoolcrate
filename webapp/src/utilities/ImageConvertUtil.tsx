import { useEffect, useState } from 'react'
import FileDrop from '../components/FileDrop'
import { downloadBlob, formatBytes } from '../tools/download'
import { convertImage, IMAGE_FORMATS, ImageFormat, loadImage } from '../tools/image'

const SELECT =
  'text-xs rounded-md border border-border bg-input px-2 py-1 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'

type Source = {
  name: string
  size: number
  width: number
  height: number
  bitmap: ImageBitmap
}

function ImageConvertUtil() {
  const [source, setSource] = useState<Source | null>(null)
  const [format, setFormat] = useState<ImageFormat>('image/webp')
  const [quality, setQuality] = useState<number>(80)
  const [scale, setScale] = useState<number>(100)
  const [preview, setPreview] = useState<{ url: string; size: number; blob: Blob } | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const open = async (files: File[]) => {
    const file = files[0]
    setError(null)
    try {
      const bitmap = await loadImage(file)
      setSource({
        name: file.name,
        size: file.size,
        width: bitmap.width,
        height: bitmap.height,
        bitmap,
      })
    } catch (caught) {
      setSource(null)
      setError((caught as Error).message)
    }
  }

  useEffect(() => {
    if (!source) {
      setPreview(null)
      return
    }

    let cancelled = false
    let url = ''

    ;(async () => {
      try {
        const blob = await convertImage(source.bitmap, {
          type: format,
          quality: quality / 100,
          width: (source.width * scale) / 100,
          height: (source.height * scale) / 100,
        })
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setPreview({ url, size: blob.size, blob })
        setError(null)
      } catch (caught) {
        if (!cancelled) setError((caught as Error).message)
      }
    })()

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [source, format, quality, scale])

  const extension = IMAGE_FORMATS.find((entry) => entry.type === format)!.extension
  const lossless = format === 'image/png'
  const width = source ? Math.max(1, Math.round((source.width * scale) / 100)) : 0
  const height = source ? Math.max(1, Math.round((source.height * scale) / 100)) : 0

  return (
    <>
      <FileDrop onFiles={open} accept="image/*" hint="Drop an image to convert" />

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400" data-testid="image-error">
          {error}
        </div>
      )}

      {source && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Format"
              className={SELECT}
              value={format}
              onChange={(event) => setFormat(event.target.value as ImageFormat)}
            >
              {IMAGE_FORMATS.map((entry) => (
                <option key={entry.type} value={entry.type}>
                  {entry.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-xs text-subtle">
              scale
              <input
                type="range"
                aria-label="Scale"
                min={5}
                max={200}
                value={scale}
                onChange={(event) => setScale(Number(event.target.value))}
                className="w-24"
              />
              <span className="tabular-nums w-10">{scale}%</span>
            </label>
            {!lossless && (
              <label className="flex items-center gap-1.5 text-xs text-subtle">
                quality
                <input
                  type="range"
                  aria-label="Quality"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(event) => setQuality(Number(event.target.value))}
                  className="w-24"
                />
                <span className="tabular-nums w-10">{quality}</span>
              </label>
            )}
          </div>

          <div className="text-xs text-subtle" data-testid="image-stats">
            {source.name} · {source.width}×{source.height} ·{' '}
            {formatBytes(source.size)}
            {preview && (
              <>
                {' → '}
                {width}×{height} · {formatBytes(preview.size)}
                {' · '}
                <span
                  className={
                    preview.size < source.size
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }
                >
                  {preview.size < source.size ? '−' : '+'}
                  {Math.abs(Math.round((1 - preview.size / source.size) * 100))}%
                </span>
              </>
            )}
          </div>

          {preview && (
            <img
              src={preview.url}
              alt="Converted preview"
              data-testid="image-preview"
              className="max-h-64 w-auto self-center rounded-lg border border-border"
            />
          )}

          <button
            type="button"
            disabled={!preview}
            onClick={() =>
              preview &&
              downloadBlob(
                preview.blob,
                `${source.name.replace(/\.[^.]+$/, '')}.${extension}`
              )
            }
            data-testid="image-download"
            className="w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text hover:bg-hover transition-colors disabled:opacity-50"
          >
            Download .{extension}
          </button>
        </>
      )}

      <p className="text-[11px] text-faint">
        Re-encoded with canvas, which always drops metadata such as EXIF and GPS.
        JPEG and WebP are lossy, so converting back and forth loses a little each
        time. AVIF cannot be written by the browser.
      </p>
    </>
  )
}

export default ImageConvertUtil
