import { useState } from 'react'
import TextField from '../fields/TextField'
import {
  bytesToSize,
  formatSize,
  SIZE_UNITS,
  SizeUnit,
  sizeToBytes,
} from '../tools/system'

const SELECT =
  'text-xs rounded-md border border-border bg-input px-2 py-1 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'

function FileSizeUtil() {
  const [value, setValue] = useState<string>('1')
  const [unit, setUnit] = useState<SizeUnit>('GB')

  const amount = Number(value)
  const valid = value.trim() !== '' && !Number.isNaN(amount)
  const bytes = valid ? sizeToBytes(amount, unit) : NaN

  return (
    <>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <TextField
            label="size"
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
          onChange={(event) => setUnit(event.target.value as SizeUnit)}
        >
          {SIZE_UNITS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {!valid && value.trim() !== '' && (
        <div className="text-sm text-red-600 dark:text-red-400">Enter a number</div>
      )}

      {SIZE_UNITS.filter((option) => option !== unit).map((option) => (
        <TextField
          key={option}
          label={option}
          content={valid ? formatSize(bytesToSize(bytes, option)) : ''}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      ))}

      <p className="text-[11px] text-faint">
        KB, MB and GB step by 1000 — what drive manufacturers and network speeds
        use. KiB, MiB and GiB step by 1024, which is what operating systems
        usually report. That gap is why a &ldquo;1 TB&rdquo; drive shows as 931 GiB.
      </p>
    </>
  )
}

export default FileSizeUtil
