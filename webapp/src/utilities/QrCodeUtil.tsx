import React, { useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import TextField from '../fields/TextField'

const QRCodeGenerator: React.FC = () => {
  const [qrCodeContent, setQrCodeContent] = useState<string>(
    'https://tinytoolcrate.com/'
  )
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
      <QRCode id={qrCodeId} value={qrCodeContent} />

      <button
        onClick={() => handleDownloadClicked()}
        type="button"
        className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
      >
        Download
      </button>
    </div>
  )
}

export default QRCodeGenerator
