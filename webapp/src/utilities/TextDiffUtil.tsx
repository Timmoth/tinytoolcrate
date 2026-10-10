import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'

const MAX_LINES = 400

function diffLines(left: string, right: string): string {
  const a = left.split('\n').slice(0, MAX_LINES)
  const b = right.split('\n').slice(0, MAX_LINES)

  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  )
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
    }
  }

  const lines: string[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      lines.push(`  ${a[i]}`)
      i++
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      lines.push(`- ${a[i]}`)
      i++
    } else {
      lines.push(`+ ${b[j]}`)
      j++
    }
  }
  while (i < a.length) {
    lines.push(`- ${a[i]}`)
    i++
  }
  while (j < b.length) {
    lines.push(`+ ${b[j]}`)
    j++
  }

  return lines.join('\n')
}

function TextDiffUtil() {
  const [left, setLeft] = useState<string>('')
  const [right, setRight] = useState<string>('')
  const [diff, setDiff] = useState<string>('')
  const [summary, setSummary] = useState<string>('')

  useEffect(() => {
    if (!left && !right) {
      setDiff('')
      setSummary('')
      return
    }
    const result = diffLines(left, right)
    setDiff(result)
    const added = result.split('\n').filter((l) => l.startsWith('+ ')).length
    const removed = result.split('\n').filter((l) => l.startsWith('- ')).length
    setSummary(`+${added} −${removed}`)
  }, [left, right])

  return (
    <>
      <TextField
        label="original"
        content={left}
        onContentChange={setLeft}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="changed"
        content={right}
        onContentChange={setRight}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="diff"
        content={diff}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="summary"
        content={summary}
        isReadonly={true}
        isCopyable={false}
        isMultiline={false}
      />
    </>
  )
}

export default TextDiffUtil
