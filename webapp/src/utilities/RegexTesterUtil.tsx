import { useEffect, useRef, useState } from 'react'
import TextField from '../fields/TextField'

const MATCH_TIMEOUT_MS = 500

function RegexTesterUtil() {
  const [pattern, setPattern] = useState<string>('')
  const [flags, setFlags] = useState<string>('g')
  const [text, setText] = useState<string>('')
  const [replacement, setReplacement] = useState<string>('')
  const [matchCount, setMatchCount] = useState<number>(0)
  const [matchValues, setMatchValues] = useState<string>('')
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    if (!pattern) {
      setMatchCount(0)
      setMatchValues('')
      setResult('')
      setError(null)
      return
    }

    workerRef.current?.terminate()

    const worker = new Worker(
      new URL('../workers/regexWorker.ts', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = worker

    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      worker.terminate()
      setMatchCount(0)
      setMatchValues('')
      setResult('')
      setError('Regex timed out (too complex)')
    }, MATCH_TIMEOUT_MS)

    worker.onmessage = (event: MessageEvent) => {
      if (timedOut) return
      clearTimeout(timeout)
      const result = event.data as {
        ok: boolean
        count?: number
        values?: string
        result?: string
      }
      if (result.ok) {
        setMatchCount(result.count ?? 0)
        setMatchValues(result.values ?? '')
        setResult(result.result ?? '')
        setError(null)
      } else {
        setMatchCount(0)
        setMatchValues('')
        setResult('')
        setError('Invalid regex')
      }
    }

    worker.postMessage({ pattern, flags, text, replacement })

    return () => {
      clearTimeout(timeout)
      worker.terminate()
    }
  }, [pattern, flags, text, replacement])

  return (
    <>
      <div className="flex space-x-2 w-full">
        <TextField
          label="pattern"
          content={pattern}
          onContentChange={setPattern}
          isReadonly={false}
          isCopyable={false}
          isMultiline={false}
        />
        <TextField
          label="flags"
          content={flags}
          onContentChange={setFlags}
          isReadonly={false}
          isCopyable={false}
          isMultiline={false}
        />
      </div>
      <TextField
        label="test string"
        content={text}
        onContentChange={setText}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      <div className="flex space-x-2 w-full">
        <TextField
          label="matches"
          content={matchCount.toString()}
          isReadonly={true}
          isCopyable={false}
          isMultiline={false}
        />
      </div>
      <TextField
        label="matched values"
        content={matchValues}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="replacement"
        content={replacement}
        onContentChange={setReplacement}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />
      {replacement && (
        <TextField
          label="result"
          content={result}
          isReadonly={true}
          isCopyable={true}
          isMultiline={true}
        />
      )}
    </>
  )
}

export default RegexTesterUtil
