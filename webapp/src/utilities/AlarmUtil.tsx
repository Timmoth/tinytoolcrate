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
        alarmSound.play()
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
      <div className="flex items-center space-x-4 text-3xl font-bold">
        {['Hours', 'Minutes', 'Seconds'].map((label, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <button
              className="text-sm"
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
            <span>
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
              className="text-sm"
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
        <div className="text-lg font-bold">{remainingTime}</div>
      )}

      <div className="space-x-4">
        <button
          onClick={handleStart}
          disabled={isRunning || !targetTime || targetTime <= currentTime}
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Start
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Stop
        </button>
      </div>
    </div>
  )
}

export default AlarmUtil
