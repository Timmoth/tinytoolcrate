import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'

function UrlParserUtil() {
  const [input, setInput] = useState<string>('')
  const [parts, setParts] = useState<{ [key: string]: string }>({})
  const [params, setParams] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = input.trim()
    if (!trimmed) {
      setParts({})
      setParams('')
      setError(null)
      return
    }

    try {
      const url = new URL(trimmed)
      setParts({
        protocol: url.protocol,
        host: url.host,
        hostname: url.hostname,
        port: url.port || '(default)',
        path: url.pathname,
        hash: url.hash || '(none)',
      })
      setParams(
        [...url.searchParams.entries()]
          .map(([key, value]) => `${key} = ${value}`)
          .join('\n') || '(none)'
      )
      setError(null)
    } catch {
      setParts({})
      setParams('')
      setError('Invalid URL')
    }
  }, [input])

  return (
    <>
      <TextField
        label="url"
        content={input}
        onContentChange={setInput}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      {Object.entries(parts).map(([name, value]) => (
        <TextField
          key={name}
          label={name}
          content={value}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      ))}
      {params && (
        <TextField
          label="query params"
          content={params}
          isReadonly={true}
          isCopyable={true}
          isMultiline={true}
        />
      )}
    </>
  )
}

export default UrlParserUtil
