import { ChangeEvent, useId, useState } from 'react'
import { showToast } from '../components/Toast'

function TextField({
  label,
  content,
  onContentChange,
  onContentKeyUp,
  isReadonly,
  isCopyable,
  isMultiline,
}: {
  label: string
  content: string
  onContentChange?: (newContent: string) => void
  onContentKeyUp?: (key: string) => void
  isReadonly: boolean
  isCopyable: boolean
  isMultiline: boolean
}) {
  const [copied, setCopied] = useState<boolean>(false)
  // Ties the visible label to the control so it has an accessible name.
  const id = useId()

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopied(true)
        showToast('Copied to clipboard')
        setTimeout(() => {
          setCopied(false)
        }, 1000)
      })
      .catch((err) => {
        console.error('Error copying to clipboard:', err)
      })
  }

  const handleChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (!isReadonly && onContentChange) {
      onContentChange(event.target.value)
    }
  }
  const handleKeyUp = (
    event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (onContentKeyUp) {
      onContentKeyUp(event.key)
    }
  }

  const inputClasses = `w-full text-sm rounded-lg border bg-input px-3 py-2 text-text placeholder-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors ${
    isReadonly
      ? 'border-border/60 text-subtle font-mono'
      : 'border-border'
  }`

  return (
    <div
      className="w-full"
      data-testid="field"
      data-field-label={label}
    >
      <div className="flex items-center justify-between mb-1 min-h-5">
        <label
          htmlFor={id}
          className="text-[11px] font-medium uppercase tracking-wider text-subtle"
        >
          {label}
        </label>

        {isCopyable && (
          <button
            onClick={copyToClipboard}
            aria-label="Copy to clipboard"
            className="p-1 rounded text-faint hover:text-text hover:bg-hover transition-colors"
          >
            {copied ? (
              <svg
                className="w-3.5 h-3.5 text-emerald-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 12"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5.917 5.724 10.5 15 1.5"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 20"
              >
                <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {isMultiline ? (
        <textarea
          id={id}
          className={inputClasses}
          data-testid="field-input"
          value={content}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          readOnly={isReadonly}
          rows={6}
        />
      ) : (
        <input
          type="text"
          id={id}
          className={inputClasses}
          data-testid="field-input"
          value={content}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          readOnly={isReadonly}
        />
      )}
    </div>
  )
}

export default TextField
