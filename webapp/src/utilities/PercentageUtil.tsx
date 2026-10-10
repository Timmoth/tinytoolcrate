import { useState } from 'react'
import TextField from '../fields/TextField'

const SELECT =
  'text-xs rounded-md border border-border bg-input px-2 py-1 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'

type Mode = 'of' | 'isWhatPercent' | 'change' | 'adjust'

const MODES: [Mode, string][] = [
  ['of', 'What is A% of B?'],
  ['isWhatPercent', 'A is what percent of B?'],
  ['change', 'Percent change from A to B'],
  ['adjust', 'Increase B by A%'],
]

function round(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return String(Math.round(value * 1e6) / 1e6)
}

function PercentageUtil() {
  const [mode, setMode] = useState<Mode>('of')
  const [a, setA] = useState<string>('15')
  const [b, setB] = useState<string>('200')

  const first = Number(a)
  const second = Number(b)
  const valid =
    a.trim() !== '' && b.trim() !== '' && !Number.isNaN(first) && !Number.isNaN(second)

  const answer = () => {
    if (!valid) return ''
    switch (mode) {
      case 'of':
        return round((first / 100) * second)
      case 'isWhatPercent':
        return second === 0 ? '—' : `${round((first / second) * 100)}%`
      case 'change': {
        if (first === 0) return '—'
        const delta = ((second - first) / Math.abs(first)) * 100
        return `${delta >= 0 ? '+' : ''}${round(delta)}%`
      }
      case 'adjust':
        return round(second * (1 + first / 100))
    }
  }

  const labels: Record<Mode, [string, string]> = {
    of: ['percent (A)', 'of value (B)'],
    isWhatPercent: ['value (A)', 'out of (B)'],
    change: ['from (A)', 'to (B)'],
    adjust: ['percent (A)', 'value (B)'],
  }

  return (
    <>
      <select
        aria-label="Calculation"
        className={SELECT}
        value={mode}
        onChange={(event) => setMode(event.target.value as Mode)}
      >
        {MODES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <TextField
        label={labels[mode][0]}
        content={a}
        onContentChange={setA}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />
      <TextField
        label={labels[mode][1]}
        content={b}
        onContentChange={setB}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />

      {!valid && (a.trim() !== '' || b.trim() !== '') && (
        <div className="text-sm text-red-600 dark:text-red-400">Enter two numbers</div>
      )}

      <TextField
        label="result"
        content={String(answer())}
        isReadonly={true}
        isCopyable={true}
        isMultiline={false}
      />
    </>
  )
}

export default PercentageUtil
