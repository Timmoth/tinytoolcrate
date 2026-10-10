import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'
import { loremIpsum, LoremUnit } from '../tools/text'

const SELECT =
  'text-xs rounded-md border border-border bg-input px-2 py-1 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'

function LoremIpsumUtil() {
  const [count, setCount] = useState<number>(3)
  const [unit, setUnit] = useState<LoremUnit>('paragraphs')
  const [classic, setClassic] = useState<boolean>(true)
  const [seed, setSeed] = useState<number>(0)
  const [output, setOutput] = useState<string>('')

  useEffect(() => {
    setOutput(loremIpsum(count, unit, classic))
    // seed is only here to let the regenerate button force a new draw
  }, [count, unit, classic, seed])

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          aria-label="Amount"
          min={1}
          max={200}
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
          className={`${SELECT} w-20`}
        />
        <select
          aria-label="Unit"
          className={SELECT}
          value={unit}
          onChange={(event) => setUnit(event.target.value as LoremUnit)}
        >
          <option value="paragraphs">paragraphs</option>
          <option value="sentences">sentences</option>
          <option value="words">words</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-subtle">
          <input
            type="checkbox"
            checked={classic}
            onChange={(event) => setClassic(event.target.checked)}
          />
          start with &ldquo;Lorem ipsum&rdquo;
        </label>
        <button
          type="button"
          onClick={() => setSeed((value) => value + 1)}
          className="px-2.5 py-1 text-xs font-medium rounded-md border border-border text-subtle hover:bg-hover hover:text-text transition-colors"
        >
          Regenerate
        </button>
      </div>

      <TextField
        label="lorem ipsum"
        content={output}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
    </>
  )
}

export default LoremIpsumUtil
