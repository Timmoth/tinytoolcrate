import { useMemo, useState } from 'react'
import TextField from '../fields/TextField'

function ListCompareUtil() {
  const [left, setLeft] = useState<string>('')
  const [right, setRight] = useState<string>('')
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false)
  const [trim, setTrim] = useState<boolean>(true)

  const result = useMemo(() => {
    const split = (text: string) =>
      text
        .split('\n')
        .map((line) => (trim ? line.trim() : line))
        .filter((line) => line !== '')

    const key = (line: string) => (ignoreCase ? line.toLowerCase() : line)

    const a = split(left)
    const b = split(right)
    const aKeys = new Set(a.map(key))
    const bKeys = new Set(b.map(key))

    const unique = (lines: string[]) => [...new Map(lines.map((l) => [key(l), l])).values()]

    return {
      both: unique(a.filter((line) => bKeys.has(key(line)))),
      onlyLeft: unique(a.filter((line) => !bKeys.has(key(line)))),
      onlyRight: unique(b.filter((line) => !aKeys.has(key(line)))),
      combined: unique([...a, ...b]),
    }
  }, [left, right, ignoreCase, trim])

  const outputs: [string, string[]][] = [
    ['in both (intersection)', result.both],
    ['only in A (difference)', result.onlyLeft],
    ['only in B', result.onlyRight],
    ['all, deduped (union)', result.combined],
  ]

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextField
          label="list A"
          content={left}
          onContentChange={setLeft}
          isReadonly={false}
          isCopyable={false}
          isMultiline={true}
        />
        <TextField
          label="list B"
          content={right}
          onContentChange={setRight}
          isReadonly={false}
          isCopyable={false}
          isMultiline={true}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-1.5 text-xs text-subtle">
          <input
            type="checkbox"
            checked={trim}
            onChange={(event) => setTrim(event.target.checked)}
          />
          trim whitespace
        </label>
        <label className="flex items-center gap-1.5 text-xs text-subtle">
          <input
            type="checkbox"
            checked={ignoreCase}
            onChange={(event) => setIgnoreCase(event.target.checked)}
          />
          ignore case
        </label>
      </div>

      {outputs.map(([label, lines]) => (
        <TextField
          key={label}
          label={`${label} — ${lines.length}`}
          content={lines.join('\n')}
          isReadonly={true}
          isCopyable={true}
          isMultiline={true}
        />
      ))}
    </>
  )
}

export default ListCompareUtil
