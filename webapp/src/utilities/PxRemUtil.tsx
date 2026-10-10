import { useState } from 'react'
import TextField from '../fields/TextField'
import { CssUnit, fromPixels, toPixels, trimNumber } from '../tools/text'

const SELECT =
  'text-xs rounded-md border border-border bg-input px-2 py-1 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'

const UNITS: CssUnit[] = ['px', 'rem', 'em', 'pt', '%']
const COMMON = [12, 14, 16, 18, 20, 24, 32, 48]

function PxRemUtil() {
  const [value, setValue] = useState<string>('24')
  const [unit, setUnit] = useState<CssUnit>('px')
  const [root, setRoot] = useState<string>('16')
  const [parent, setParent] = useState<string>('16')

  const rootSize = Number(root) || 16
  const parentSize = Number(parent) || 16
  const amount = Number(value)
  const valid = value.trim() !== '' && !Number.isNaN(amount)
  const pixels = valid ? toPixels(amount, unit, rootSize, parentSize) : NaN

  return (
    <>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <TextField
            label="value"
            content={value}
            onContentChange={setValue}
            isReadonly={false}
            isCopyable={false}
            isMultiline={false}
          />
        </div>
        <select
          aria-label="Unit"
          className={`${SELECT} h-9`}
          value={unit}
          onChange={(event) => setUnit(event.target.value as CssUnit)}
        >
          {UNITS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <TextField
            label="root font size (px)"
            content={root}
            onContentChange={setRoot}
            isReadonly={false}
            isCopyable={false}
            isMultiline={false}
          />
        </div>
        <div className="flex-1">
          <TextField
            label="parent font size (px)"
            content={parent}
            onContentChange={setParent}
            isReadonly={false}
            isCopyable={false}
            isMultiline={false}
          />
        </div>
      </div>

      {!valid && value.trim() !== '' && (
        <div className="text-sm text-red-600 dark:text-red-400">
          Enter a number
        </div>
      )}

      {UNITS.filter((option) => option !== unit).map((option) => (
        <TextField
          key={option}
          label={option}
          content={valid ? trimNumber(fromPixels(pixels, option, rootSize, parentSize)) : ''}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      ))}

      <div className="flex flex-wrap gap-1.5">
        {COMMON.map((px) => (
          <button
            key={px}
            type="button"
            onClick={() => {
              setValue(String(px))
              setUnit('px')
            }}
            className="px-2 py-0.5 text-[11px] font-mono rounded border border-border text-subtle hover:bg-hover hover:text-text transition-colors"
          >
            {px}px
          </button>
        ))}
      </div>
    </>
  )
}

export default PxRemUtil
