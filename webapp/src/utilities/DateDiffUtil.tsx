import { useMemo, useState } from 'react'
import TextField from '../fields/TextField'

const DAY = 86400000

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function parse(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Weekdays from start (inclusive) up to end (exclusive). */
function weekdaysBetween(start: Date, days: number): number {
  const fullWeeks = Math.floor(days / 7)
  let count = fullWeeks * 5
  let weekday = start.getUTCDay()

  for (let i = 0; i < days - fullWeeks * 7; i++) {
    if (weekday !== 0 && weekday !== 6) count++
    weekday = (weekday + 1) % 7
  }
  return count
}

function calendarBreakdown(from: Date, to: Date): string {
  let years = to.getUTCFullYear() - from.getUTCFullYear()
  let months = to.getUTCMonth() - from.getUTCMonth()
  let days = to.getUTCDate() - from.getUTCDate()

  if (days < 0) {
    months -= 1
    // Days in the month before the end date.
    days += new Date(
      Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 0)
    ).getUTCDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  const parts: string[] = []
  if (years) parts.push(`${years} year${years === 1 ? '' : 's'}`)
  if (months) parts.push(`${months} month${months === 1 ? '' : 's'}`)
  if (days || parts.length === 0) parts.push(`${days} day${days === 1 ? '' : 's'}`)
  return parts.join(', ')
}

function DateDiffUtil() {
  const [from, setFrom] = useState<string>(today())
  const [to, setTo] = useState<string>(today())

  const result = useMemo(() => {
    const start = parse(from)
    const end = parse(to)
    if (!start || !end) return null

    const signedDays = Math.round((end.getTime() - start.getTime()) / DAY)
    const days = Math.abs(signedDays)
    const earlier = signedDays < 0 ? end : start
    const later = signedDays < 0 ? start : end

    const weeks = Math.floor(days / 7)
    const business = weekdaysBetween(earlier, days)

    return {
      signedDays,
      rows: [
        ['total days', `${signedDays}`],
        ['weeks and days', `${weeks} weeks, ${days - weeks * 7} days`],
        ['calendar', calendarBreakdown(earlier, later)],
        ['weekdays', `${business}`],
        ['weekend days', `${days - business}`],
        ['hours', `${days * 24}`],
        ['minutes', `${days * 1440}`],
        ['seconds', `${days * 86400}`],
      ] as [string, string][],
    }
  }, [from, to])

  const shift = (days: number) => {
    const base = parse(to) ?? new Date()
    setTo(new Date(base.getTime() + days * DAY).toISOString().slice(0, 10))
  }

  return (
    <>
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-subtle mb-1">
            from
          </span>
          <input
            type="date"
            aria-label="From date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="w-full text-sm rounded-lg border border-border bg-input px-3 py-2 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>
        <label className="flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-subtle mb-1">
            to
          </span>
          <input
            type="date"
            aria-label="To date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="w-full text-sm rounded-lg border border-border bg-input px-3 py-2 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[7, 30, 90, 365].map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => shift(days)}
            className="px-2 py-0.5 text-[11px] rounded border border-border text-subtle hover:bg-hover hover:text-text transition-colors"
          >
            +{days}d
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setFrom(to)
            setTo(from)
          }}
          className="px-2 py-0.5 text-[11px] rounded border border-border text-subtle hover:bg-hover hover:text-text transition-colors"
        >
          swap
        </button>
      </div>

      {!result && (
        <div className="text-sm text-red-600 dark:text-red-400">
          Pick two valid dates
        </div>
      )}

      {result?.rows.map(([label, value]) => (
        <TextField
          key={label}
          label={label}
          content={value}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      ))}

      <p className="text-[11px] text-faint">
        Dates are compared in UTC, so daylight saving changes never shift the
        count. Weekdays exclude Saturday and Sunday but not public holidays.
      </p>
    </>
  )
}

export default DateDiffUtil
