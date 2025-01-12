import { useState } from 'react'
import TextField from '../fields/TextField'

function EncodeBase64FileUtil() {
  const [base64, setBase64] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) {
      setError('No file selected.')
      return
    }
    setError(null)

    const reader = new FileReader()

    reader.onload = () => {
      const base64Data = reader.result as string
      setBase64(base64Data)
    }

    reader.onerror = () => {
      console.error('File reading failed.')
      setError('Failed to read the file.')
    }

    reader.readAsDataURL(file)
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
        className="flex flex-col items-center justify-center w-full space-y-4"
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

        {error && (
          <p className="text-red-500">
            <strong>Error:</strong> {error}
          </p>
        )}
        {base64 && (
          <TextField
            label="Base64 encoded file"
            content={base64}
            isReadonly={true}
            isCopyable={true}
            isMultiline={true}
          />
        )}
      </div>
    </>
  )
}

export default EncodeBase64FileUtil
