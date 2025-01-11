import { useState, useEffect } from 'react'
import TextField from '../fields/TextField'

function EscapeStringUtil() {
  const [currentText, setCurrentText] = useState<string>('')
  const [encodedText, setEncodedText] = useState<string>('')

  const handleContentChange = (newContent: string) => {
    setCurrentText(newContent)
  }

  useEffect(() => {
    try {
      const encoded = JSON.stringify(currentText).slice(1, -1)
      setEncodedText(encoded)
    } catch (error) {
      setEncodedText('Error encoding string')
      console.error('Error encoding string:', error)
    }
  }, [currentText])

  return (
    <>
      <TextField
        label="Enter text"
        content={currentText}
        onContentChange={handleContentChange}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="Encoded string"
        content={encodedText}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
    </>
  )
}

export default EscapeStringUtil
