import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'
import { ulid, ulidTime } from '../tools/numbers'

const BUTTON =
  'px-2.5 py-1 text-xs font-medium rounded-md border border-border text-subtle hover:bg-hover hover:text-text transition-colors'

function UlidUtil() {
  const [count, setCount] = useState<number>(1)
  const [values, setValues] = useState<string[]>([])
  const [inspect, setInspect] = useState<string>('')

  useEffect(() => {
    setValues(Array.from({ length: count }, () => ulid()))
  }, [count])

  const timestamp = inspect.trim() === '' ? null : ulidTime(inspect)

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={BUTTON}
          onClick={() => setValues(Array.from({ length: count }, () => ulid()))}
        >
          New
        </button>
        {[1, 5, 10].map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={count === option}
            onClick={() => setCount(option)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              count === option
                ? 'border-accent bg-accent/10 text-text'
                : 'border-border text-subtle hover:bg-hover hover:text-text'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <TextField
        label={count === 1 ? 'ulid' : `${count} ulids`}
        content={values.join('\n')}
        isReadonly={true}
        isCopyable={true}
        isMultiline={count > 1}
      />

      <TextField
        label="decode a ulid"
        content={inspect}
        onContentChange={setInspect}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />

      {inspect.trim() !== '' && (
        <TextField
          label="created"
          content={
            timestamp ? timestamp.toISOString() : 'Not a valid ulid'
          }
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      )}

      <p className="text-[11px] text-faint">
        A ULID packs a millisecond timestamp into its first 10 characters, so
        ids sort chronologically as plain text — handy as a database key where a
        random UUID would scatter writes across the index.
      </p>
    </>
  )
}

export default UlidUtil
