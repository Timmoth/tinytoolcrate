import { useState } from 'react'
import alarm from '../assets/alarm.wav'

const alarmSound = new Audio(alarm)

function CountdownTimer() {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)

  const increment = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
    max: number
  ) => {
    setter((prev) => (prev + value + max + 1) % (max + 1))
  }

  const decrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
    max: number
  ) => {
    setter((prev) => (prev - value + max + 1) % (max + 1))
  }

  const handleStart = () => {
    if (isRunning || (hours === 0 && minutes === 0 && seconds === 0)) return

    setIsRunning(true)
    setTimerId(
      setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            setMinutes((m) => {
              if (m === 0) {
                setHours((h) => {
                  if (h === 0) {
                    alarmSound.play()
                    setHours(0)
                    setMinutes(0)
                    setSeconds(0)
                    return h
                  }
                  return h - 1
                })
                return 59
              }
              return m - 1
            })
            return 59
          }
          return prev - 1
        })
      }, 1000)
    )
  }

  const handleStop = () => {
    alarmSound.pause()
    alarmSound.currentTime = 0
    if (timerId) clearInterval(timerId)
    setIsRunning(false)
    setTimerId(null)
  }

  const handleReset = () => {
    alarmSound.pause()
    alarmSound.currentTime = 0
    if (timerId) clearInterval(timerId)
    setIsRunning(false)
    setTimerId(null)
    setHours(0)
    setMinutes(0)
    setSeconds(0)
  }

  const formatNumber = (num: number) => String(num).padStart(2, '0')

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center space-x-4 text-3xl font-bold">
        {['Hours', 'Minutes', 'Seconds'].map((label, index) => (
          <div key={label} className="flex flex-col items-center space-y-2">
            <button
              className="text-sm"
              onClick={() => {
                if (label === 'Hours') increment(setHours, 1, 23)
                else if (label === 'Minutes') increment(setMinutes, 1, 59)
                else increment(setSeconds, 1, 59)
              }}
            >
              ▲
            </button>
            <span>
              {label === 'Hours'
                ? formatNumber(hours)
                : label === 'Minutes'
                ? formatNumber(minutes)
                : formatNumber(seconds)}
            </span>
            <button
              className="text-sm"
              onClick={() => {
                if (label === 'Hours') decrement(setHours, 1, 23)
                else if (label === 'Minutes') decrement(setMinutes, 1, 59)
                else decrement(setSeconds, 1, 59)
              }}
            >
              ▼
            </button>
          </div>
        ))}
      </div>
      <div className="space-x-4">
        <button
          onClick={handleStart}
          disabled={isRunning}
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
        <button
          onClick={handleReset}
          disabled={hours == 0 && minutes == 0 && seconds == 0}
          className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default CountdownTimer
