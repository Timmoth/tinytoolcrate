import {
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { languageById, tokensFor } from '../lang'
import { Diagnostic, Token } from '../lang/types'

const LINE_HEIGHT = 20
const PAD_Y = 8
const PAD_X = 12
const GUTTER = 44

const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'

const CLOSER_OF: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  "'": "'",
  '`': '`',
}
const OPENER_OF: Record<string, string> = {
  ')': '(',
  ']': '[',
  '}': '{',
}

export type CodeEditorHandle = {
  /** Wraps the selection, or inserts the placeholder when nothing is selected. */
  wrap: (before: string, after: string, placeholder?: string) => void
  /** Adds the prefix to every selected line, or strips it when all lines have it. */
  prefixLines: (prefix: string | ((index: number) => string)) => void
  /** Inserts a block on its own lines at the caret. */
  insertBlock: (text: string) => void
}

type Props = {
  value: string
  onChange: (value: string) => void
  language: string
  diagnostics?: Diagnostic[]
  /** Pass pre-computed tokens to avoid tokenizing the same source twice. */
  tokens?: Token[]
  rows?: number
  indentSize?: number
  wrap?: boolean
  readOnly?: boolean
  placeholder?: string
  showStatus?: boolean
  label?: string
  ref?: React.Ref<CodeEditorHandle>
}

function lineStartOf(text: string, offset: number) {
  return text.lastIndexOf('\n', offset - 1) + 1
}

function lineEndOf(text: string, offset: number) {
  const end = text.indexOf('\n', offset)
  return end === -1 ? text.length : end
}

function CodeEditor({
  value,
  onChange,
  language,
  diagnostics = [],
  tokens,
  rows = 14,
  indentSize = 2,
  wrap = false,
  readOnly = false,
  placeholder,
  showStatus = true,
  label,
  ref,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const bandsRef = useRef<HTMLDivElement>(null)
  const pendingSelection = useRef<[number, number] | null>(null)

  const [caret, setCaret] = useState({ line: 1, column: 1 })

  const ownTokens = useMemo(
    () => (tokens ? [] : tokensFor(language, value)),
    [tokens, language, value]
  )
  const shownTokens = tokens ?? ownTokens
  const lineCount = useMemo(() => value.split('\n').length, [value])
  const unit = ' '.repeat(indentSize)

  const errorLines = useMemo(() => {
    const map = new Map<number, Diagnostic>()
    for (const diagnostic of diagnostics) {
      if (diagnostic.line < 1) continue
      const existing = map.get(diagnostic.line)
      if (!existing || existing.severity === 'warning') {
        map.set(diagnostic.line, diagnostic)
      }
    }
    return map
  }, [diagnostics])

  const syncScroll = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    if (preRef.current) {
      preRef.current.scrollTop = textarea.scrollTop
      preRef.current.scrollLeft = textarea.scrollLeft
    }
    const shift = `translateY(${-textarea.scrollTop}px)`
    if (gutterRef.current) gutterRef.current.style.transform = shift
    if (bandsRef.current) bandsRef.current.style.transform = shift
  }

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (textarea && pendingSelection.current) {
      const [start, end] = pendingSelection.current
      textarea.setSelectionRange(start, end)
      pendingSelection.current = null
    }
    syncScroll()
    reportCaret()
  })

  const reportCaret = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    // Read from the element rather than the prop, so this is correct even when
    // called from onChange, before the new value has been handed back to us.
    const text = textarea.value
    const offset = textarea.selectionStart
    const line = text.slice(0, offset).split('\n').length
    const column = offset - lineStartOf(text, offset) + 1
    setCaret((current) =>
      current.line === line && current.column === column
        ? current
        : { line, column }
    )
  }

  const applyEdit = (next: string, start: number, end = start) => {
    pendingSelection.current = [start, end]
    onChange(next)
  }

  useImperativeHandle(ref, () => ({
    wrap: (before: string, after: string, placeholder = '') => {
      const textarea = textareaRef.current
      if (!textarea) return
      const { selectionStart: from, selectionEnd: to } = textarea
      const selected = value.slice(from, to) || placeholder
      textarea.focus()
      applyEdit(
        value.slice(0, from) + before + selected + after + value.slice(to),
        from + before.length,
        from + before.length + selected.length
      )
    },

    prefixLines: (prefix: string | ((index: number) => string)) => {
      const textarea = textareaRef.current
      if (!textarea) return
      const from = lineStartOf(value, textarea.selectionStart)
      const to = lineEndOf(value, textarea.selectionEnd)
      const lines = value.slice(from, to).split('\n')

      const fixed = typeof prefix === 'string' ? prefix : null
      const present =
        fixed !== null && lines.every((line) => line.startsWith(fixed))
      const next = lines
        .map((line, index) =>
          present && fixed !== null
            ? line.slice(fixed.length)
            : (fixed ?? (prefix as (index: number) => string)(index)) + line
        )
        .join('\n')

      textarea.focus()
      applyEdit(
        value.slice(0, from) + next + value.slice(to),
        from,
        from + next.length
      )
    },

    insertBlock: (text: string) => {
      const textarea = textareaRef.current
      if (!textarea) return
      const at = lineEndOf(value, textarea.selectionEnd)
      const prefix = value.slice(0, at)
      const block = `${prefix === '' || prefix.endsWith('\n') ? '' : '\n'}${text}\n`
      textarea.focus()
      applyEdit(prefix + block + value.slice(at), at + block.length)
    },
  }))

  const indentBlock = (outdent: boolean) => {
    const textarea = textareaRef.current!
    const from = lineStartOf(value, textarea.selectionStart)
    const to = lineEndOf(value, textarea.selectionEnd)
    const block = value.slice(from, to)

    const lines = block.split('\n')
    let removedFirst = 0
    const next = lines
      .map((line, index) => {
        if (outdent) {
          const strip = /^[ \t]{1,2}/.exec(line)?.[0] ?? ''
          if (index === 0) removedFirst = strip.length
          return line.slice(strip.length)
        }
        if (index === 0) removedFirst = -unit.length
        return unit + line
      })
      .join('\n')

    const start = Math.max(from, textarea.selectionStart - removedFirst)
    const end = from + next.length
    applyEdit(value.slice(0, from) + next + value.slice(to), start, end)
  }

  const toggleComment = () => {
    const marker = languageById(language).lineComment
    const textarea = textareaRef.current!
    if (!marker) return

    const from = lineStartOf(value, textarea.selectionStart)
    const to = lineEndOf(value, textarea.selectionEnd)
    const lines = value.slice(from, to).split('\n')
    const meaningful = lines.filter((line) => line.trim() !== '')
    const commented =
      meaningful.length > 0 &&
      meaningful.every((line) => line.trimStart().startsWith(marker))

    const next = lines
      .map((line) => {
        if (line.trim() === '') return line
        if (commented) {
          const at = line.indexOf(marker)
          return line.slice(0, at) + line.slice(at + marker.length).replace(/^ /, '')
        }
        const indent = /^[ \t]*/.exec(line)![0]
        return `${indent}${marker} ${line.slice(indent.length)}`
      })
      .join('\n')

    applyEdit(value.slice(0, from) + next + value.slice(to), from, from + next.length)
  }

  const handleEnter = () => {
    const textarea = textareaRef.current!
    const at = textarea.selectionStart
    if (at !== textarea.selectionEnd) return false

    const start = lineStartOf(value, at)
    const current = value.slice(start, at)
    const indent = /^[ \t]*/.exec(current)![0]
    const previous = value[at - 1]
    const following = value[at]

    const blockLanguage = language === 'python' || language === 'yaml'
    const opens =
      (previous !== undefined && '([{'.includes(previous)) ||
      (blockLanguage && current.trimEnd().endsWith(':'))

    if (
      opens &&
      previous !== undefined &&
      following !== undefined &&
      CLOSER_OF[previous] === following
    ) {
      const inserted = `\n${indent}${unit}\n${indent}`
      applyEdit(
        value.slice(0, at) + inserted + value.slice(at),
        at + 1 + indent.length + unit.length
      )
      return true
    }

    const inserted = `\n${indent}${opens ? unit : ''}`
    applyEdit(value.slice(0, at) + inserted + value.slice(at), at + inserted.length)
    return true
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return
    const textarea = textareaRef.current
    if (!textarea) return
    const { selectionStart: from, selectionEnd: to } = textarea

    if ((event.metaKey || event.ctrlKey) && event.key === '/') {
      event.preventDefault()
      toggleComment()
      return
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return

    if (event.key === 'Tab') {
      event.preventDefault()
      if (event.shiftKey || value.slice(from, to).includes('\n')) {
        indentBlock(event.shiftKey)
      } else {
        applyEdit(value.slice(0, from) + unit + value.slice(to), from + unit.length)
      }
      return
    }

    if (event.key === 'Enter') {
      if (handleEnter()) event.preventDefault()
      return
    }

    if (event.key === 'Backspace' && from === to && from > 0) {
      const before = value[from - 1]
      if (CLOSER_OF[before] && value[from] === CLOSER_OF[before]) {
        event.preventDefault()
        applyEdit(value.slice(0, from - 1) + value.slice(from + 1), from - 1)
      }
      return
    }

    const closer = CLOSER_OF[event.key]
    if (closer) {
      const isQuote = event.key === closer
      const neighbour = value[to]
      // Leave apostrophes alone: don't turn "don't" into "don''t".
      if (isQuote && from === to) {
        const previous = value[from - 1]
        if (
          (previous !== undefined && /[\w'"`]/.test(previous)) ||
          (neighbour !== undefined && /[\w]/.test(neighbour))
        ) {
          return
        }
      }
      event.preventDefault()
      const selected = value.slice(from, to)
      const inserted = `${event.key}${selected}${closer}`
      applyEdit(
        value.slice(0, from) + inserted + value.slice(to),
        from + 1,
        from + 1 + selected.length
      )
      return
    }

    if (OPENER_OF[event.key] && from === to && value[from] === event.key) {
      event.preventDefault()
      applyEdit(value, from + 1)
    }
  }

  const gutterWidth = wrap ? 0 : GUTTER
  const surfaceStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: gutterWidth,
    right: 0,
    margin: 0,
    padding: `${PAD_Y}px ${PAD_X}px`,
    fontFamily: MONO,
    fontSize: 13,
    lineHeight: `${LINE_HEIGHT}px`,
    tabSize: indentSize,
    whiteSpace: wrap ? 'pre-wrap' : 'pre',
    overflowWrap: wrap ? 'break-word' : 'normal',
    border: 0,
  }

  return (
    <div
      className="w-full flex flex-col"
      data-testid="code-editor"
      data-language={language}
      data-field-label={label}
    >
      {label && (
        <label className="text-[11px] font-medium uppercase tracking-wider text-subtle mb-1">
          {label}
        </label>
      )}

      <div
        className="relative rounded-lg border border-border bg-input overflow-hidden focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-colors"
        style={{ height: rows * LINE_HEIGHT + PAD_Y * 2 }}
      >
        {!wrap && (
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 overflow-hidden border-r border-border bg-surface select-none"
            style={{ width: GUTTER }}
          >
            <div ref={gutterRef} style={{ paddingTop: PAD_Y }}>
              {Array.from({ length: lineCount }, (_, index) => {
                const diagnostic = errorLines.get(index + 1)
                return (
                  <div
                    key={index}
                    data-testid="gutter-line"
                    data-line={index + 1}
                    data-severity={diagnostic?.severity ?? ''}
                    title={diagnostic?.message}
                    className={`pr-2 text-right text-[11px] ${
                      diagnostic?.severity === 'error'
                        ? 'text-red-500 font-semibold'
                        : diagnostic
                          ? 'text-amber-500 font-semibold'
                          : 'text-faint'
                    }`}
                    style={{ height: LINE_HEIGHT, lineHeight: `${LINE_HEIGHT}px` }}
                  >
                    {index + 1}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!wrap && errorLines.size > 0 && (
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 overflow-hidden pointer-events-none"
            style={{ left: gutterWidth }}
          >
            <div ref={bandsRef} className="relative" style={{ paddingTop: PAD_Y }}>
              {[...errorLines.entries()].map(([line, diagnostic]) => (
                <div
                  key={line}
                  className={
                    diagnostic.severity === 'error'
                      ? 'absolute inset-x-0 bg-red-500/10'
                      : 'absolute inset-x-0 bg-amber-500/10'
                  }
                  style={{ top: (line - 1) * LINE_HEIGHT, height: LINE_HEIGHT }}
                />
              ))}
            </div>
          </div>
        )}

        <pre ref={preRef} aria-hidden style={surfaceStyle} className="pointer-events-none overflow-hidden text-text">
          {shownTokens.map((token, index) =>
            token.kind === 'plain' ? (
              token.text
            ) : (
              <span key={index} className={`tok-${token.kind}`}>
                {token.text}
              </span>
            )
          )}
          {'\n'}
        </pre>

        <textarea
          ref={textareaRef}
          data-testid="code-input"
          aria-label={label ?? 'Code'}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          readOnly={readOnly}
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            reportCaret()
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={reportCaret}
          onClick={reportCaret}
          onSelect={reportCaret}
          onScroll={syncScroll}
          style={{
            ...surfaceStyle,
            overflow: 'auto',
            overflowX: wrap ? 'hidden' : 'auto',
            resize: 'none',
            background: 'transparent',
            color: 'transparent',
            caretColor: 'rgb(var(--c-text))',
            outline: 'none',
          }}
          className="placeholder:text-faint"
        />
      </div>

      {showStatus && (
        <div
          className="flex items-center justify-between mt-1 text-[11px] text-faint"
          data-testid="editor-status"
        >
          <span>
            Ln {caret.line}, Col {caret.column}
          </span>
          <span>
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {value.length} chars
          </span>
        </div>
      )}
    </div>
  )
}

export default CodeEditor
