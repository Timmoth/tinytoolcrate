import React, { useEffect, useRef, useState } from 'react'
import { create, all } from 'mathjs'
import TextField from '../fields/TextField'

const math = create(all)

const CalculatorUtil: React.FC = () => {
  const [history, setHistory] = useState<string[]>([])
  const [input, setInput] = useState<string>('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scope] = useState<Record<string, any>>({})
  const historyRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [history])

  const handleKeyPress = (key: string) => {
    if (key === 'Enter') {
      processInput(input)
    }
  }

  const processInput = (expression: string) => {
    try {
      const result = math.evaluate(expression, scope)
      setHistory((prevHistory) => [...prevHistory, expression, `= ${result}`])

      setInput('')
    } catch {
      setHistory((prevHistory) => [...prevHistory, `${expression} = error`])
      setInput('')
    }
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full">
        <div className="flex items-center justify-between mb-1 min-h-5">
          <label className="text-[11px] font-medium uppercase tracking-wider text-faint">
            history
          </label>
        </div>

        <div
          ref={historyRef}
          data-testid="calc-history"
          className="w-full overflow-y-auto h-64 mb-1 p-3 border border-border rounded-lg bg-input font-mono"
        >
          {history.map((entry, index) => (
            <div key={index} className="text-sm text-subtle">
              {entry}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end w-full mb-2">
        <button
          type="button"
          onClick={() => setHistory([])}
          disabled={history.length === 0}
          className="text-xs font-medium rounded-md border border-border px-2.5 py-1 text-subtle hover:bg-hover hover:text-text disabled:opacity-40 transition-colors"
        >
          Clear history
        </button>
      </div>
      <TextField
        label="input"
        content={input}
        onContentChange={(i) => setInput(i)}
        onContentKeyUp={handleKeyPress}
        isReadonly={false}
        isCopyable={true}
        isMultiline={false}
      />
    </div>
  )
}

export default CalculatorUtil
