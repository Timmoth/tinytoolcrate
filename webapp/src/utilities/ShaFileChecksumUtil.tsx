import { useState } from 'react'
import TextField from '../fields/TextField'

function ShaFileChecksumUtil() {
  const [hashes, setHashes] = useState<{ [key: string]: string }>({})
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) {
      setError('No file selected.')
      return
    }
    setError(null)

    const reader = new FileReader()

    reader.onload = async () => {
      const binaryData = reader.result as ArrayBuffer

      try {
        const sha1Hash = await computeHash(binaryData, 'SHA-1')
        const sha256Hash = await computeHash(binaryData, 'SHA-256')
        const sha384Hash = await computeHash(binaryData, 'SHA-384')
        const sha512Hash = await computeHash(binaryData, 'SHA-512')

        setHashes({
          'SHA-1': sha1Hash,
          'SHA-256': sha256Hash,
          'SHA-384': sha384Hash,
          'SHA-512': sha512Hash,
        })
      } catch (e) {
        console.error('Error computing hashes:', e)
        setError('Failed to compute hashes.')
      }
    }

    reader.onerror = () => {
      console.error('File reading failed.')
      setError('Failed to read the file.')
    }

    reader.readAsArrayBuffer(file)
  }

  const computeHash = async (
    data: ArrayBuffer,
    algorithm: string
  ): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest(algorithm, data)
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  return (
    <>
      <div
        className="flex items-center justify-center w-full"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            onChange={handleInputChange}
          />
        </label>
      </div>

      {error && (
        <p className="text-red-500">
          <strong>Error:</strong> {error}
        </p>
      )}
      {Object.entries(hashes).map(([algorithm, hash]) => (
        <TextField
          key={algorithm}
          label={`${algorithm} Hash`}
          content={hash}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      ))}
    </>
  )
}

export default ShaFileChecksumUtil
