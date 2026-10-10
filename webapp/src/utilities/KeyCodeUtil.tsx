import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'

type Captured = {
  key: string
  code: string
  keyCode: number
  location: number
  modifiers: string
}

const LOCATIONS = ['standard', 'left', 'right', 'numpad']

function KeyCodeUtil() {
  const [captured, setCaptured] = useState<Captured | null>(null)
  const [listening, setListening] = useState<boolean>(false)

  useEffect(() => {
    if (!listening) return

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      const modifiers = [
        event.ctrlKey && 'ctrl',
        event.altKey && 'alt',
        event.shiftKey && 'shift',
        event.metaKey && 'meta',
      ].filter(Boolean)

      setCaptured({
        key: event.key === ' ' ? '(space)' : event.key,
        code: event.code,
        keyCode: event.keyCode,
        location: event.location,
        modifiers: modifiers.length ? modifiers.join(' + ') : 'none',
      })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [listening])

  return (
    <>
      <button
        type="button"
        onClick={() => setListening((current) => !current)}
        aria-pressed={listening}
        data-testid="keycode-listen"
        className={`w-full rounded-lg border-2 border-dashed px-3 py-6 text-sm transition-colors ${
          listening
            ? 'border-accent bg-accent/5 text-text'
            : 'border-border text-subtle hover:bg-hover'
        }`}
      >
        {listening ? 'Listening — press any key' : 'Click here, then press a key'}
      </button>

      {captured && (
        <>
          <p
            className="text-center font-mono text-3xl text-text py-2"
            data-testid="keycode-key"
          >
            {captured.key}
          </p>
          <TextField
            label="event.code"
            content={captured.code}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
          <TextField
            label="event.key"
            content={captured.key}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
          <TextField
            label="event.keyCode (deprecated)"
            content={String(captured.keyCode)}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
          <TextField
            label="location"
            content={`${captured.location} — ${LOCATIONS[captured.location] ?? 'unknown'}`}
            isReadonly={true}
            isCopyable={false}
            isMultiline={false}
          />
          <TextField
            label="modifiers"
            content={captured.modifiers}
            isReadonly={true}
            isCopyable={false}
            isMultiline={false}
          />
        </>
      )}

      <p className="text-[11px] text-faint">
        Use <span className="font-mono">event.code</span> for physical key
        positions such as game controls, and{' '}
        <span className="font-mono">event.key</span> for what the key actually
        types. <span className="font-mono">keyCode</span> is deprecated and
        differs between browsers.
      </p>
    </>
  )
}

export default KeyCodeUtil
