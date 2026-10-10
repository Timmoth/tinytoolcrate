import { useEffect, useState } from 'react'
import alarm from '../assets/alarm.wav'

const alarmSound = new Audio(alarm)

type Timer = {
  hours: number
  minutes: number
  seconds: number
}

const ZERO: Timer = { hours: 0, minutes: 0, seconds: 0 }

function CountdownTimer() {
  const [time, setTime] = useState<Timer>(ZERO)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const intervalId = setInterval(() => {
      setTime(({ hours, minutes, seconds }) => {
        if (seconds > 0) return { hours, minutes, seconds: seconds - 1 }
        if (minutes > 0) return { hours, minutes: minutes - 1, seconds: 59 }
        if (hours > 0) return { hours: hours - 1, minutes: 59, seconds: 59 }
        return ZERO
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isRunning])

  useEffect(() => {
    if (
      isRunning &&
      time.hours === 0 &&
      time.minutes === 0 &&
      time.seconds === 0
    ) {
      alarmSound.play().catch(() => {})
      setIsRunning(false)
    }
  }, [isRunning, time])

  const adjust = (field: keyof Timer, delta: number, max: number) => {
    setTime((prev) => ({
      ...prev,
      [field]: (prev[field] + delta + max + 1) % (max + 1),
    }))
  }

  const handleStart = () => {
    if (isRunning || (time.hours === 0 && time.minutes === 0 && time.seconds === 0))
      return

    setIsRunning(true)
  }

  const handleStop = () => {
    alarmSound.pause()
    alarmSound.currentTime = 0
    setIsRunning(false)
  }

  const handleReset = () => {
    alarmSound.pause()
    alarmSound.currentTime = 0
    setIsRunning(false)
    setTime(ZERO)
  }

  const formatNumber = (num: number) => String(num).padStart(2, '0')

  const presets = [1, 3, 5, 10, 25]

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center gap-2">
        {presets.map((mins) => (
          <button
            key={mins}
            type="button"
            data-testid={`preset-${mins}`}
            disabled={isRunning}
            onClick={() =>
              setTime({
                hours: Math.floor(mins / 60),
                minutes: mins % 60,
                seconds: 0,
              })
            }
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-border text-subtle hover:bg-hover hover:text-text disabled:opacity-40 transition-colors"
          >
            {mins}m
          </button>
        ))}
      </div>
      <div className="flex items-center space-x-4 text-2xl font-semibold">
        {(
          [
            ['Hours', 'hours', 23],
            ['Minutes', 'minutes', 59],
            ['Seconds', 'seconds', 59],
          ] as const
        ).map(([label, field, max]) => (
          <div
            key={label}
            data-testid="stepper"
            data-stepper={field}
            className="flex flex-col items-center space-y-1"
          >
            <button
              className="w-9 h-7 rounded-md border border-border text-subtle hover:bg-hover hover:text-text transition-colors"
              onClick={() => adjust(field, 1, max)}
            >
              ▲
            </button>
            <span
              data-testid="stepper-value"
              className="tabular-nums text-text"
            >
              {formatNumber(time[field])}
            </span>
            <button
              className="w-9 h-7 rounded-md border border-border text-subtle hover:bg-hover hover:text-text transition-colors"
              onClick={() => adjust(field, -1, max)}
            >
              ▼
            </button>
          </div>
        ))}
      </div>
      <div className="space-x-2">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-40 transition-colors"
        >
          Start
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className="px-4 py-1.5 text-sm font-medium text-text border border-border rounded-lg hover:bg-hover disabled:opacity-40 transition-colors"
        >
          Stop
        </button>
        <button
          onClick={handleReset}
          disabled={time.hours === 0 && time.minutes === 0 && time.seconds === 0}
          className="px-4 py-1.5 text-sm font-medium text-text border border-border rounded-lg hover:bg-hover disabled:opacity-40 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default CountdownTimer
