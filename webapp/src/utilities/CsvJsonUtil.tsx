import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((cell) => cell !== '')) rows.push(row)
      row = []
    } else {
      field += char
    }
  }
  row.push(field)
  if (row.some((cell) => cell !== '')) rows.push(row)
  return rows
}

function csvToJson(text: string): string {
  const rows = parseCsv(text)
  if (rows.length === 0) return ''
  const header = rows[0]
  const objects = rows.slice(1).map((row) =>
    Object.fromEntries(header.map((key, i) => [key, row[i] ?? '']))
  )
  return JSON.stringify(objects, null, 2)
}

function csvEscape(value: unknown): string {
  const str = String(value ?? '')
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

function jsonToCsv(text: string): string {
  const data = JSON.parse(text)
  const rows: unknown[] = Array.isArray(data) ? data : [data]
  const keys = [
    ...new Set(rows.flatMap((row) => (row && typeof row === 'object' ? Object.keys(row) : []))),
  ]
  const lines = [keys.map(csvEscape).join(',')]
  for (const row of rows) {
    if (row && typeof row === 'object') {
      lines.push(keys.map((key) => csvEscape((row as Record<string, unknown>)[key])).join(','))
    }
  }
  return lines.join('\n')
}

function CsvJsonUtil() {
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [direction, setDirection] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = input.trim()
    if (!trimmed) {
      setOutput('')
      setDirection('')
      setError(null)
      return
    }

    try {
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        setOutput(jsonToCsv(trimmed))
        setDirection('json → csv')
      } else {
        setOutput(csvToJson(trimmed))
        setDirection('csv → json')
      }
      setError(null)
    } catch {
      setOutput('')
      setDirection('')
      setError('Could not convert input')
    }
  }, [input])

  return (
    <>
      <TextField
        label="csv or json"
        content={input}
        onContentChange={setInput}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      {direction && (
        <div className="text-xs text-subtle text-right">{direction}</div>
      )}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      <TextField
        label="converted"
        content={output}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
    </>
  )
}

export default CsvJsonUtil
