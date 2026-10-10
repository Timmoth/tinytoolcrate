import { useState } from 'react'
import TextField from '../fields/TextField'

function JsonMinifyUtil() {
  const [input, setInput] = useState<string>('')
  const [minified, setMinified] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (newInput: string) => {
    setInput(newInput)
    setError(null)

    if (!newInput.trim()) {
      setMinified('')
      return
    }

    try {
      setMinified(JSON.stringify(JSON.parse(newInput)))
    } catch {
      setMinified('')
      setError('Invalid JSON')
    }
  }

  return (
    <>
      <TextField
        label="Input JSON"
        content={input}
        onContentChange={handleInputChange}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      <TextField
        label="Minified JSON"
        content={minified}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
    </>
  )
}

export default JsonMinifyUtil
