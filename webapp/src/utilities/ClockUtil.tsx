import { useState, useEffect } from 'react'
import TextField from '../fields/TextField'

function ClockUtil() {
  const [unixTime, setUnixTime] = useState<Date>(new Date())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setUnixTime(new Date())
    }, 100)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <>
      <div className="flex flex-col space-y-4">
        <TextField
          label="date"
          content={unixTime.toLocaleDateString()}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
        <TextField
          label="time"
          content={unixTime.toLocaleTimeString()}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      </div>
    </>
  )
}

export default ClockUtil
