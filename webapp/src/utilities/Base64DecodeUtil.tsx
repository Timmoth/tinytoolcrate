import { useState, useEffect } from 'react'
import TextField from '../fields/TextField'

function Base64DecodeUtil() {
  const [encodedText, setEncodedText] = useState<string>('')
  const [decodedText, setDecodedText] = useState<string>('')

  const handleContentChange = (newContent: string) => {
    setEncodedText(newContent)
  }

  useEffect(() => {
    try {
      const decoded = atob(encodedText)
      setDecodedText(decoded)
    } catch (error) {
      setDecodedText('Error decoding from base64')
      console.error('Error decoding from base64:', error)
    }
  }, [encodedText])

  return (
    <>
      <TextField
        label="enter encoded"
        content={encodedText}
        onContentChange={handleContentChange}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="decoded"
        content={decodedText}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
    </>
  )
}

export default Base64DecodeUtil
