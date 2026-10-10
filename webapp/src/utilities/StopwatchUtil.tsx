import { useEffect, useRef, useState } from 'react'

const BUTTON =
  'px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text hover:bg-hover transition-colors disabled:opacity-40 disabled:hover:bg-transparent'

function format(ms: number): string {
  const hundredths = Math.floor((ms % 1000) / 10)
  const seconds = Math.floor(ms / 1000) % 60
  const minutes = Math.floor(ms / 60000) % 60
  const hours = Math.floor(ms / 3600000)
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${hours > 0 ? `${pad(hours)}:` : ''}${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`
}

function StopwatchUtil() {
  const [elapsed, setElapsed] = useState<number>(0)
  const [running, setRunning] = useState<boolean>(false)
  const [laps, setLaps] = useState<number[]>([])
  // Anchored to a timestamp rather than accumulated, so a throttled tab does
  // not make the stopwatch drift.
  const startedAt = useRef<number>(0)
  const before = useRef<number>(0)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(
      () => setElapsed(before.current + (Date.now() - startedAt.current)),
      50
    )
    return () => window.clearInterval(id)
  }, [running])

  const start = () => {
    startedAt.current = Date.now()
    setRunning(true)
  }

  const stop = () => {
    before.current += Date.now() - startedAt.current
    setElapsed(before.current)
    setRunning(false)
  }

  const reset = () => {
    before.current = 0
    startedAt.current = Date.now()
    setElapsed(0)
    setLaps([])
  }

  return (
    <>
      <p
        className="text-center font-mono tabular-nums text-4xl text-text py-4"
        data-testid="stopwatch-time"
      >
        {format(elapsed)}
      </p>

      <div className="flex justify-center gap-2">
        <button
          type="button"
          className={BUTTON}
          onClick={running ? stop : start}
          data-testid="stopwatch-toggle"
        >
          {running ? 'Stop' : elapsed > 0 ? 'Resume' : 'Start'}
        </button>
        <button
          type="button"
          className={BUTTON}
          disabled={!running}
          onClick={() => setLaps((current) => [elapsed, ...current])}
        >
          Lap
        </button>
        <button
          type="button"
          className={BUTTON}
          disabled={elapsed === 0 && laps.length === 0}
          onClick={reset}
        >
          Reset
        </button>
      </div>

      {laps.length > 0 && (
        <ul className="space-y-1 max-h-48 overflow-y-auto" data-testid="laps">
          {laps.map((lap, index) => {
            const previous = laps[index + 1] ?? 0
            return (
              <li
                key={laps.length - index}
                data-testid="lap"
                className="flex justify-between rounded-md border border-border px-2 py-1 text-xs font-mono"
              >
                <span className="text-subtle">lap {laps.length - index}</span>
                <span className="text-subtle">+{format(lap - previous)}</span>
                <span className="text-text">{format(lap)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

export default StopwatchUtil
