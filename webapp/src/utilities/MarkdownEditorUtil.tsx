import { useMemo, useRef, useState } from 'react'
import CodeEditor, { CodeEditorHandle } from '../components/CodeEditor'
import { DiagnosticsSummary } from '../components/Diagnostics'
import { showToast } from '../components/Toast'
import { tokensFor } from '../lang'
import { renderMarkdown } from '../lang/markdownRender'
import { validateMarkdown } from '../lang/validate/markdown'

const BUTTON =
  'px-2 py-1 text-xs font-medium rounded-md border border-border text-subtle hover:bg-hover hover:text-text transition-colors'
const TOGGLE =
  'px-2.5 py-1 text-xs font-medium rounded-md transition-colors border'

type View = 'split' | 'write' | 'preview'

const SAMPLE = `# Title

Write **markdown** on the left, see it rendered on the right.

- a list item
- another one

\`\`\`js
const greet = (name) => \`hello \${name}\`
\`\`\`
`

function MarkdownEditorUtil() {
  const [markdown, setMarkdown] = useState<string>(SAMPLE)
  const [view, setView] = useState<View>('split')
  const [wrap, setWrap] = useState<boolean>(true)
  const editor = useRef<CodeEditorHandle>(null)

  const tokens = useMemo(() => tokensFor('markdown', markdown), [markdown])
  const result = useMemo(() => validateMarkdown(markdown), [markdown])
  const html = useMemo(() => renderMarkdown(markdown), [markdown])

  const copy = (text: string, what: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast(`Copied ${what}`))
      .catch(() => showToast('Could not copy'))
  }

  const actions: [string, string, () => void][] = [
    ['B', 'Bold', () => editor.current?.wrap('**', '**', 'bold text')],
    ['I', 'Italic', () => editor.current?.wrap('_', '_', 'italic text')],
    ['S', 'Strikethrough', () => editor.current?.wrap('~~', '~~', 'struck out')],
    ['H1', 'Heading 1', () => editor.current?.prefixLines('# ')],
    ['H2', 'Heading 2', () => editor.current?.prefixLines('## ')],
    ['Link', 'Link', () => editor.current?.wrap('[', '](https://)', 'label')],
    ['Code', 'Inline code', () => editor.current?.wrap('`', '`', 'code')],
    ['Block', 'Code block', () => editor.current?.wrap('\n```\n', '\n```\n', 'code')],
    ['Quote', 'Blockquote', () => editor.current?.prefixLines('> ')],
    ['List', 'Bullet list', () => editor.current?.prefixLines('- ')],
    ['1.', 'Numbered list', () => editor.current?.prefixLines((index) => `${index + 1}. `)],
    ['Task', 'Task list', () => editor.current?.prefixLines('- [ ] ')],
    ['Table', 'Table', () =>
      editor.current?.insertBlock(
        '| Column | Column |\n| ------ | ------ |\n| Cell   | Cell   |'
      )],
    ['HR', 'Divider', () => editor.current?.insertBlock('---')],
  ]

  return (
    <>
      <div className="flex flex-wrap items-center gap-1">
        {actions.map(([label, title, run]) => (
          <button
            key={title}
            type="button"
            title={title}
            aria-label={title}
            onClick={run}
            className={BUTTON}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1" role="group" aria-label="View">
          {(['split', 'write', 'preview'] as View[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={`${TOGGLE} ${
                view === option
                  ? 'border-accent bg-accent/10 text-text'
                  : 'border-border text-subtle hover:bg-hover hover:text-text'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-pressed={wrap}
            onClick={() => setWrap((current) => !current)}
            className={`${TOGGLE} ${
              wrap
                ? 'border-accent bg-accent/10 text-text'
                : 'border-border text-subtle hover:bg-hover hover:text-text'
            }`}
          >
            wrap
          </button>
          <button
            type="button"
            className={BUTTON}
            onClick={() => copy(markdown, 'markdown')}
          >
            Copy md
          </button>
          <button type="button" className={BUTTON} onClick={() => copy(html, 'html')}>
            Copy html
          </button>
        </div>
      </div>

      <div
        className={`grid gap-3 ${view === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
      >
        {view !== 'preview' && (
          <CodeEditor
            value={markdown}
            onChange={setMarkdown}
            language="markdown"
            tokens={tokens}
            diagnostics={result.diagnostics}
            rows={18}
            wrap={wrap}
            ref={editor}
            placeholder="# Start writing…"
          />
        )}

        {view !== 'write' && (
          <div
            data-testid="markdown-preview"
            className="md-preview overflow-auto rounded-lg border border-border bg-surface p-3 text-sm text-text"
            style={{ height: 18 * 20 + 16 }}
            // renderMarkdown escapes every bit of source text and allowlists
            // urls, so only tags this app generated can reach the dom.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-subtle">
        <span>
          {markdown.trim() === '' ? 0 : markdown.trim().split(/\s+/).length} words
        </span>
        <span data-testid="validity">
          <DiagnosticsSummary result={result} hasContent={markdown.trim() !== ''} />
        </span>
      </div>
    </>
  )
}

export default MarkdownEditorUtil
