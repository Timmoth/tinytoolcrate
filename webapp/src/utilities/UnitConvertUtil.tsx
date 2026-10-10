import { useMemo, useState } from 'react'
import TextField from '../fields/TextField'
import {
  convertMeasure,
  formatMeasure,
  MEASURE_CATEGORIES,
} from '../tools/measures'

const SELECT =
  'text-xs rounded-md border border-border bg-input px-2 py-1 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'

function UnitConvertUtil() {
  const [categoryId, setCategoryId] = useState<string>('length')
  const [unitId, setUnitId] = useState<string>('m')
  const [value, setValue] = useState<string>('1')

  const category =
    MEASURE_CATEGORIES.find((entry) => entry.id === categoryId) ?? MEASURE_CATEGORIES[0]
  const unit = category.units.find((entry) => entry.id === unitId) ?? category.units[0]

  const amount = Number(value)
  const valid = value.trim() !== '' && !Number.isNaN(amount)

  const results = useMemo(
    () =>
      category.units
        .filter((entry) => entry.id !== unit.id)
        .map((entry) => ({
          unit: entry,
          value: valid ? formatMeasure(convertMeasure(amount, unit, entry)) : '',
        })),
    [category, unit, amount, valid]
  )

  return (
    <>
      <select
        aria-label="Category"
        className={SELECT}
        value={categoryId}
        onChange={(event) => {
          const next = MEASURE_CATEGORIES.find(
            (entry) => entry.id === event.target.value
          )!
          setCategoryId(next.id)
          setUnitId(next.units[Math.min(2, next.units.length - 1)].id)
        }}
      >
        {MEASURE_CATEGORIES.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.label}
          </option>
        ))}
      </select>

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
          value={unit.id}
          onChange={(event) => setUnitId(event.target.value)}
        >
          {category.units.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.id} — {entry.label}
            </option>
          ))}
        </select>
      </div>

      {!valid && value.trim() !== '' && (
        <div className="text-sm text-red-600 dark:text-red-400">Enter a number</div>
      )}

      {results.map((result) => (
        <TextField
          key={result.unit.id}
          label={`${result.unit.id} — ${result.unit.label}`}
          content={result.value}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      ))}
    </>
  )
}

export default UnitConvertUtil
