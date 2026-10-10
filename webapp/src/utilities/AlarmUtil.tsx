import { useState, useEffect } from 'react'
import alarm from '../assets/alarm.wav'

const alarmSound = new Audio(alarm)

function AlarmUtil() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [targetTime, setTargetTime] = useState<Date | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [remainingTime, setRemainingTime] = useState<string | null>(null)

  useEffect(() => {
    // Update the current time every second
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isRunning || !targetTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = targetTime.getTime() - now.getTime()

      if (diff <= 0) {
        clearInterval(interval)
        alarmSound.play().catch(() => {})
        setIsRunning(false)
        setRemainingTime(null)
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setRemainingTime(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        )
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, targetTime])

  const handleTimeChange = (
    type: 'hours' | 'minutes' | 'seconds',
    value: number
  ) => {
    setTargetTime((prev) => {
      const newTime = new Date(prev ?? currentTime)
      if (type === 'hours') newTime.setHours(value)
      if (type === 'minutes') newTime.setMinutes(value)
      if (type === 'seconds') newTime.setSeconds(value)
      return newTime
    })
  }

  const handleStart = () => {
    if (!targetTime || targetTime <= currentTime) return
    setIsRunning(true)
  }

  const handleStop = () => {
    setIsRunning(false)
    setRemainingTime(null)
    alarmSound.pause()
    alarmSound.currentTime = 0
  }

  const formatNumber = (num: number) => String(num).padStart(2, '0')

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Target Time Selection */}
      <div className="flex items-center space-x-4 text-2xl font-semibold">
        {['Hours', 'Minutes', 'Seconds'].map((label, index) => (
          <div
            key={index}
            data-testid="stepper"
            data-stepper={label.toLowerCase()}
            className="flex flex-col items-center space-y-1"
          >
            <button
              className="w-9 h-7 rounded-md border border-border text-subtle hover:bg-hover hover:text-text transition-colors"
              onClick={() => {
                const currentValue =
                  label === 'Hours'
                    ? targetTime?.getHours() ?? currentTime.getHours()
                    : label === 'Minutes'
                    ? targetTime?.getMinutes() ?? currentTime.getMinutes()
                    : targetTime?.getSeconds() ?? currentTime.getSeconds()
                handleTimeChange(
                  label.toLowerCase() as 'hours' | 'minutes' | 'seconds',
                  currentValue + 1
                )
              }}
            >
              ▲
            </button>
            <span
              data-testid="stepper-value"
              className="tabular-nums text-text"
            >
              {label === 'Hours'
                ? formatNumber(targetTime?.getHours() ?? currentTime.getHours())
                : label === 'Minutes'
                ? formatNumber(
                    targetTime?.getMinutes() ?? currentTime.getMinutes()
                  )
                : formatNumber(
                    targetTime?.getSeconds() ?? currentTime.getSeconds()
                  )}
            </span>
            <button
              className="w-9 h-7 rounded-md border border-border text-subtle hover:bg-hover hover:text-text transition-colors"
              onClick={() => {
                const currentValue =
                  label === 'Hours'
                    ? targetTime?.getHours() ?? currentTime.getHours()
                    : label === 'Minutes'
                    ? targetTime?.getMinutes() ?? currentTime.getMinutes()
                    : targetTime?.getSeconds() ?? currentTime.getSeconds()
                handleTimeChange(
                  label.toLowerCase() as 'hours' | 'minutes' | 'seconds',
                  currentValue - 1
                )
              }}
            >
              ▼
            </button>
          </div>
        ))}
      </div>

      {remainingTime && (
        <div
          data-testid="remaining-time"
          className="text-lg font-semibold tabular-nums text-text"
        >
          {remainingTime}
        </div>
      )}

      <div className="space-x-2">
        <button
          onClick={handleStart}
          disabled={isRunning || !targetTime || targetTime <= currentTime}
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
      </div>
    </div>
  )
}

export default AlarmUtil
