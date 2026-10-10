import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'
import { slugify } from '../tools/text'

const TOGGLE = 'px-2.5 py-1 text-xs font-medium rounded-md border transition-colors'

function SlugUtil() {
  const [input, setInput] = useState<string>('')
  const [separator, setSeparator] = useState<'-' | '_'>('-')
  const [lowercase, setLowercase] = useState<boolean>(true)
  const [output, setOutput] = useState<string>('')

  useEffect(() => {
    setOutput(slugify(input, { separator, lowercase }))
  }, [input, separator, lowercase])

  return (
    <>
      <TextField
        label="text"
        content={input}
        onContentChange={setInput}
        isReadonly={false}
        isCopyable={false}
        isMultiline={true}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1" role="group" aria-label="Separator">
          {(['-', '_'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-label={option === '-' ? 'Hyphen' : 'Underscore'}
              aria-pressed={separator === option}
              onClick={() => setSeparator(option)}
              className={`${TOGGLE} font-mono ${
                separator === option
                  ? 'border-accent bg-accent/10 text-text'
                  : 'border-border text-subtle hover:bg-hover hover:text-text'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-subtle">
          <input
            type="checkbox"
            checked={lowercase}
            onChange={(event) => setLowercase(event.target.checked)}
          />
          lowercase
        </label>
      </div>

      <TextField
        label="slug"
        content={output}
        isReadonly={true}
        isCopyable={true}
        isMultiline={false}
      />
    </>
  )
}

export default SlugUtil
