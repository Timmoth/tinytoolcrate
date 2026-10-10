import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'

function toWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
}

const capitalize = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()

function CaseConverterUtil() {
  const [input, setInput] = useState<string>('')
  const [outputs, setOutputs] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const words = toWords(input)
    if (words.length === 0) {
      setOutputs({})
      return
    }

    setOutputs({
      camelCase: words
        .map((word, i) => (i === 0 ? word.toLowerCase() : capitalize(word)))
        .join(''),
      snake_case: words.map((word) => word.toLowerCase()).join('_'),
      'kebab-case': words.map((word) => word.toLowerCase()).join('-'),
      'Title Case': words.map(capitalize).join(' '),
      UPPERCASE: words.map((word) => word.toUpperCase()).join(' '),
      lowercase: words.map((word) => word.toLowerCase()).join(' '),
    })
  }, [input])

  return (
    <>
      <TextField
        label="enter text"
        content={input}
        onContentChange={setInput}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      {Object.entries(outputs).map(([name, value]) => (
        <TextField
          key={name}
          label={name}
          content={value}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      ))}
    </>
  )
}

export default CaseConverterUtil
