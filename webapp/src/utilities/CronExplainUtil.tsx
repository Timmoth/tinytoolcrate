import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'

type FieldSpec = { name: string; min: number; max: number }

const FIELD_SPECS: FieldSpec[] = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'day of month', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12 },
  { name: 'day of week', min: 0, max: 6 },
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function parseField(spec: string, { min, max }: FieldSpec): Set<number> | null {
  const values = new Set<number>()

  for (const part of spec.split(',')) {
    if (!part) return null
    const match = part.match(/^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/)
    if (!match) return null

    const step = match[2] ? parseInt(match[2], 10) : 1
    if (step < 1) return null

    let lo: number
    let hi: number
    if (match[1] === '*') {
      lo = min
      hi = max
    } else {
      const nums = match[1].split('-').map(Number)
      lo = nums[0]
      hi = nums.length > 1 ? nums[1] : nums[0]
      if (lo < min || hi > max || lo > hi) return null
    }

    for (let value = lo; value <= hi; value += step) {
      values.add(max === 6 && value === 7 ? 0 : value)
    }
  }

  return values
}

function formatValues(values: Set<number>, names?: string[]): string {
  const sorted = [...values].sort((a, b) => a - b)
  const label = (v: number) => (names ? names[v] : String(v))
  if (sorted.length > 8) return `${sorted.length} values`
  return sorted.map(label).join(', ')
}

function stepOf(values: Set<number>, min: number): number | null {
  const sorted = [...values].sort((a, b) => a - b)
  if (sorted.length < 2 || sorted[0] !== min) return null
  const step = sorted[1] - sorted[0]
  if (step < 2) return null
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] !== step) return null
  }
  return step
}

function describe(
  minute: Set<number>,
  hour: Set<number>,
  dom: Set<number>,
  month: Set<number>,
  dow: Set<number>
): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const all = (s: Set<number>, size: number) => s.size === size

  const minuteStep = stepOf(minute, 0)
  const hourStep = stepOf(hour, 0)

  let time: string
  if (all(minute, 60) && all(hour, 24)) {
    time = 'Every minute'
  } else if (minute.size === 1 && hour.size === 1) {
    time = `At ${pad([...hour][0])}:${pad([...minute][0])}`
  } else if (minuteStep && all(hour, 24)) {
    time = `Every ${minuteStep} minutes`
  } else if (all(minute, 60) && hourStep) {
    time = `Every ${hourStep} hours`
  } else if (minuteStep && hourStep) {
    time = `Every ${minuteStep} minutes past every ${hourStep} hours`
  } else if (minute.size === 1 && all(hour, 24)) {
    time = `At minute ${[...minute][0]} of every hour`
  } else if (all(minute, 60) && hour.size === 1) {
    time = `Every minute during hour ${[...hour][0]}`
  } else {
    time = `Minutes ${formatValues(minute)} of hours ${formatValues(hour)}`
  }

  const parts: string[] = [time]
  if (!all(dom, 31)) parts.push(`on day(s) ${formatValues(dom)}`)
  if (!all(month, 12)) parts.push(`in month(s) ${formatValues(month)}`)
  if (!all(dow, 7)) parts.push(`on ${formatValues(dow, DAY_NAMES)}`)

  if (all(dom, 31) && all(month, 12) && all(dow, 7)) parts.push('every day')

  return parts.join(', ')
}

function nextRuns(
  minute: Set<number>,
  hour: Set<number>,
  dom: Set<number>,
  month: Set<number>,
  dow: Set<number>
): string[] {
  const runs: string[] = []
  const date = new Date()
  date.setSeconds(0, 0)
  date.setMinutes(date.getMinutes() + 1)

  const domRestricted = dom.size !== 31
  const dowRestricted = dow.size !== 7

  for (let i = 0; i < 600 * 1440 && runs.length < 5; i++) {
    const dayOk =
      domRestricted && dowRestricted
        ? dom.has(date.getDate()) || dow.has(date.getDay())
        : dom.has(date.getDate()) && dow.has(date.getDay())

    if (
      minute.has(date.getMinutes()) &&
      hour.has(date.getHours()) &&
      month.has(date.getMonth() + 1) &&
      dayOk
    ) {
      runs.push(date.toLocaleString())
    }
    date.setMinutes(date.getMinutes() + 1)
  }

  return runs
}

const PRESETS: { label: string; expression: string }[] = [
  { label: 'Every minute', expression: '* * * * *' },
  { label: 'Every 5 minutes', expression: '*/5 * * * *' },
  { label: 'Every 15 minutes', expression: '*/15 * * * *' },
  { label: 'Every hour', expression: '0 * * * *' },
  { label: 'Every day at midnight', expression: '0 0 * * *' },
  { label: 'Every Monday 9am', expression: '0 9 * * 1' },
  { label: 'Weekdays 9am', expression: '0 9 * * 1-5' },
  { label: 'First of month', expression: '0 0 1 * *' },
]

function CronExplainUtil() {
  const [expression, setExpression] = useState<string>('*/5 * * * *')
  const [description, setDescription] = useState<string>('')
  const [runs, setRuns] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const parts = expression.trim().split(/\s+/)
    if (parts.length !== 5) {
      setError('Expected 5 fields')
      setDescription('')
      setRuns('')
      return
    }

    const parsed = FIELD_SPECS.map((spec, i) => parseField(parts[i], spec))
    if (parsed.some((values) => values === null)) {
      setError('Invalid cron expression')
      setDescription('')
      setRuns('')
      return
    }

    const [minute, hour, dom, month, dow] = parsed as Set<number>[]
    setError(null)
    setDescription(describe(minute, hour, dom, month, dow))
    setRuns(nextRuns(minute, hour, dom, month, dow).join('\n'))
  }, [expression])

  return (
    <>
      <div className="flex items-center justify-between mb-1 min-h-5">
        <label className="text-[11px] font-medium uppercase tracking-wider text-subtle">
          preset
        </label>
      </div>
      <select
        data-testid="cron-preset"
        aria-label="Cron preset"
        value={PRESETS.some((p) => p.expression === expression.trim()) ? expression.trim() : ''}
        onChange={(e) => e.target.value && setExpression(e.target.value)}
        className="w-full text-sm rounded-lg border border-border bg-input px-2 py-2 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      >
        <option value="">Custom...</option>
        {PRESETS.map((preset) => (
          <option key={preset.expression} value={preset.expression}>
            {preset.label}
          </option>
        ))}
      </select>
      <TextField
        label="cron expression"
        content={expression}
        onContentChange={setExpression}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      <TextField
        label="description"
        content={description}
        isReadonly={true}
        isCopyable={true}
        isMultiline={false}
      />
      <TextField
        label="next runs"
        content={runs}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
    </>
  )
}

export default CronExplainUtil
