import { useEffect, useRef, useState } from 'react'

/** The little (i) in a panel corner, explaining what the tool does. */
function InfoButton({ title, info }: { title: string; info: string }) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleMouseDown = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="relative" ref={container}>
      <button
        type="button"
        data-testid="info-button"
        aria-label={`About ${title}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="p-1.5 rounded-md text-faint hover:text-text hover:bg-hover transition-colors"
      >
        <svg
          className="w-4 h-4"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 11v5" />
          <path strokeLinecap="round" d="M12 7.75h.01" />
        </svg>
      </button>

      {open && (
        <div
          role="tooltip"
          data-testid="info-popover"
          className="absolute right-0 top-full mt-1 z-30 w-64 rounded-lg border border-border bg-surface p-3 shadow-xl"
        >
          <p className="text-xs font-semibold text-text mb-1">{title}</p>
          <p className="text-xs text-subtle leading-relaxed">{info}</p>
        </div>
      )}
    </div>
  )
}

export default InfoButton
