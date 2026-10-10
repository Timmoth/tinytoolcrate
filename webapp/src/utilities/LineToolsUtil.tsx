import { useState } from 'react'
import TextField from '../fields/TextField'

function LineToolsUtil() {
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<string>('')

  const source = () => (output !== '' ? output.split('\n') : input.split('\n'))

  const apply = (transform: (lines: string[]) => string[]) => {
    setOutput(transform(source()).join('\n'))
  }

  const buttons: [string, (lines: string[]) => string[]][] = [
    ['Sort', (ls) => [...ls].sort((a, b) => a.localeCompare(b))],
    ['Sort desc', (ls) => [...ls].sort((a, b) => b.localeCompare(a))],
    ['Reverse', (ls) => [...ls].reverse()],
    [
      'Unique',
      (ls) => [...new Set(ls)],
    ],
    ['Trim', (ls) => ls.map((line) => line.trim())],
    ['Remove blanks', (ls) => ls.filter((line) => line.trim() !== '')],
    ['Shuffle', (ls) => [...ls].sort(() => Math.random() - 0.5)],
  ]

  return (
    <>
      <TextField
        label="lines"
        content={input}
        onContentChange={(value) => {
          setInput(value)
          setOutput('')
        }}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      <div className="flex flex-wrap gap-2">
        {buttons.map(([label, transform]) => (
          <button
            key={label}
            type="button"
            onClick={() => apply(transform)}
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-border text-subtle hover:bg-hover hover:text-text transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
      <TextField
        label="result"
        content={output}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
    </>
  )
}

export default LineToolsUtil
