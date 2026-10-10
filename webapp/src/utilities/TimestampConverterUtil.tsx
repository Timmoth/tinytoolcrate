import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'

function relativeToNow(millis: number): string {
  const diffMs = millis - Date.now()
  const abs = Math.abs(diffMs)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000000],
    ['month', 2592000000],
    ['week', 604800000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
    ['second', 1000],
  ]
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diffMs / ms), unit)
  }
  return 'just now'
}

function TimestampConverterUtil() {
  const [unix, setUnix] = useState<string>('')
  const [human, setHuman] = useState<string>('')
  const [iso, setIso] = useState<string>('')
  const [relative, setRelative] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const [dateInput, setDateInput] = useState<string>('')
  const [unixOut, setUnixOut] = useState<string>('')

  useEffect(() => {
    const trimmed = unix.trim()
    if (!trimmed) {
      setHuman('')
      setIso('')
      setError(null)
      return
    }

    if (!/^\d+$/.test(trimmed)) {
      setHuman('')
      setIso('')
      setRelative('')
      setError('Invalid timestamp')
      return
    }

    const value = Number(trimmed)
    const millis = trimmed.length > 12 ? value : value * 1000
    const date = new Date(millis)

    if (isNaN(date.getTime())) {
      setHuman('')
      setIso('')
      setRelative('')
      setError('Invalid timestamp')
      return
    }

    setHuman(date.toLocaleString())
    setIso(date.toISOString())
    setRelative(relativeToNow(date.getTime()))
    setError(null)
  }, [unix])

  useEffect(() => {
    if (!dateInput) {
      setUnixOut('')
      return
    }
    const date = new Date(dateInput)
    setUnixOut(isNaN(date.getTime()) ? '' : String(Math.floor(date.getTime() / 1000)))
  }, [dateInput])

  return (
    <>
      <TextField
        label="unix time (s or ms)"
        content={unix}
        onContentChange={setUnix}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      <TextField
        label="human date"
        content={human}
        isReadonly={true}
        isCopyable={true}
        isMultiline={false}
      />
      <TextField
        label="iso 8601"
        content={iso}
        isReadonly={true}
        isCopyable={true}
        isMultiline={false}
      />
      {relative && (
        <TextField
          label="relative"
          content={relative}
          isReadonly={true}
          isCopyable={false}
          isMultiline={false}
        />
      )}

      <div className="mt-2 border-t border-border pt-4">
        <div className="flex items-center justify-between mb-1 min-h-5">
          <label className="text-[11px] font-medium uppercase tracking-wider text-subtle">
            date to unix
          </label>
        </div>
        <input
          type="datetime-local"
          aria-label="Date and time"
          data-testid="date-input"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="w-full text-sm rounded-lg border border-border bg-input px-3 py-2 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <div className="mt-2">
          <TextField
            label="unix seconds"
            content={unixOut}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
        </div>
      </div>
    </>
  )
}

export default TimestampConverterUtil
