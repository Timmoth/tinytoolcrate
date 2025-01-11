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
      <div className="w-full relative">
        <div className="relative flex items-center">
          <label className="absolute text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-1 z-10 left-2.5 top-0 -translate-y-1/2">
            history
          </label>
        </div>

        <div
          ref={historyRef}
          className="w-full overflow-y-auto h-64 mb-4 p-2 border border-gray-300 rounded bg-gray-700"
        >
          {history.map((entry, index) => (
            <div key={index} className="text-sm dark:text-gray-400">
              {entry}
            </div>
          ))}
        </div>
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
