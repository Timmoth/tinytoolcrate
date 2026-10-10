import React, { useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import TextField from '../fields/TextField'

const QRCodeGenerator: React.FC = () => {
  const [qrCodeContent, setQrCodeContent] = useState<string>(
    'https://tinytoolcrate.com/'
  )
  const [size, setSize] = useState<number>(256)
  const qrCodeId = useMemo(() => `QRCode-${Date.now()}-${Math.random()}`, [])

  const handleDownloadClicked = () => {
    const svg = document.getElementById(qrCodeId) as SVGElement | null

    if (!svg) {
      console.error('SVG element not found')
      return
    }

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = 'QRCode'
      downloadLink.href = `${pngFile}`
      downloadLink.click()
    }
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }
  return (
    <div className="flex flex-col items-center space-y-4">
      <TextField
        label="Content"
        content={qrCodeContent}
        onContentChange={(e) => setQrCodeContent(e)}
        isReadonly={false}
        isCopyable={true}
        isMultiline={false}
      />
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-subtle">
          size
        </span>
        <select
          data-testid="qr-size"
          aria-label="QR code size"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="text-sm rounded-lg border border-border bg-input px-2 py-1.5 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        >
          <option value={128}>128px</option>
          <option value={256}>256px</option>
          <option value={512}>512px</option>
        </select>
      </div>
      <div
        data-testid="qr-code"
        className="rounded-lg overflow-hidden ring-1 ring-border"
      >
        <QRCode id={qrCodeId} value={qrCodeContent} size={size} />
      </div>

      <button
        onClick={() => handleDownloadClicked()}
        type="button"
        className="text-sm font-medium rounded-lg border border-border px-3 py-1.5 text-subtle hover:bg-hover hover:text-text transition-colors"
      >
        Download
      </button>
    </div>
  )
}

export default QRCodeGenerator
