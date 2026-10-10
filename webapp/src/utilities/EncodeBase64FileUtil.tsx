import { useState } from 'react'
import TextField from '../fields/TextField'
import FileDrop from '../components/FileDrop'

function EncodeBase64FileUtil() {
  const [base64, setBase64] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileMeta, setFileMeta] = useState<string>('')

  const handleFileUpload = async (file: File) => {
    if (!file) {
      setError('No file selected.')
      return
    }
    setError(null)
    setFileMeta(`${file.name} (${file.size} bytes)`)

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

  return (
    <>
      <FileDrop onFiles={(files) => handleFileUpload(files[0])} />

      <div className="flex flex-col items-center justify-center w-full space-y-4">
        {fileMeta && (
          <TextField
            label="file"
            content={fileMeta}
            isReadonly={true}
            isCopyable={false}
            isMultiline={false}
          />
        )}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
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
