import { useState, useEffect } from 'react'
import TextField from '../fields/TextField'

function ClockUtil() {
  const [unixTime, setUnixTime] = useState<Date>(new Date())
  const [utc, setUtc] = useState<boolean>(false)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setUnixTime(new Date())
    }, 100)

    return () => clearInterval(intervalId)
  }, [])

  const options: Intl.DateTimeFormatOptions = utc
    ? { timeZone: 'UTC' }
    : {}

  return (
    <>
      <div className="flex flex-col space-y-4">
        <TextField
          label="date"
          content={unixTime.toLocaleDateString(undefined, options)}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
        <TextField
          label="time"
          content={unixTime.toLocaleTimeString(undefined, options)}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
        <label className="flex items-center gap-2 text-sm text-subtle cursor-pointer">
          <input
            type="checkbox"
            checked={utc}
            onChange={(e) => setUtc(e.target.checked)}
            className="rounded border-border accent-accent"
          />
          show UTC
        </label>
      </div>
    </>
  )
}

export default ClockUtil
