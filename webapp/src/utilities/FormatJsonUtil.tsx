import { useState } from 'react'
import TextField from '../fields/TextField'

function FormatJsonUtil() {
  const [inputJson, setInputJson] = useState<string>('')
  const [formattedJson, setFormattedJson] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (newInput: string) => {
    setInputJson(newInput)
    setError(null)

    try {
      const parsed = JSON.parse(newInput)
      setFormattedJson(JSON.stringify(parsed, null, 2))
    } catch {
      setFormattedJson('')
      setError('Invalid JSON')
    }
  }

  return (
    <>
      <TextField
        label="Input JSON"
        content={inputJson}
        onContentChange={handleInputChange}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />

      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <TextField
        label="Formatted JSON"
        content={formattedJson}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
    </>
  )
}

export default FormatJsonUtil
