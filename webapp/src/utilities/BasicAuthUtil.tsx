import { useMemo, useState } from 'react'
import TextField from '../fields/TextField'
import { fromBase64, fromUtf8, toBase64, utf8 } from '../crypto'

const TOGGLE = 'px-2.5 py-1 text-xs font-medium rounded-md border transition-colors'

type Mode = 'build' | 'decode'

type Decoded = { user: string; password: string } | { error: string } | null

function BasicAuthUtil() {
  const [mode, setMode] = useState<Mode>('build')
  const [user, setUser] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [header, setHeader] = useState<string>('')

  const encoded = useMemo(() => {
    if (user === '' && password === '') return ''
    return toBase64(utf8(`${user}:${password}`))
  }, [user, password])

  const decoded = useMemo((): Decoded => {
    const value = header.trim().replace(/^Authorization:\s*/i, '').replace(/^Basic\s+/i, '')
    if (value === '') return null
    try {
      const text = fromUtf8(fromBase64(value))
      const split = text.indexOf(':')
      if (split === -1) return { error: 'Decoded value has no ":" separator' }
      return { user: text.slice(0, split), password: text.slice(split + 1) }
    } catch {
      return { error: 'Not valid base64' }
    }
  }, [header])

  return (
    <>
      <div className="flex items-center gap-1" role="group" aria-label="Mode">
        {(['build', 'decode'] as Mode[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => setMode(option)}
            className={`${TOGGLE} ${
              mode === option
                ? 'border-accent bg-accent/10 text-text'
                : 'border-border text-subtle hover:bg-hover hover:text-text'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {mode === 'build' ? (
        <>
          <TextField
            label="username"
            content={user}
            onContentChange={setUser}
            isReadonly={false}
            isCopyable={false}
            isMultiline={false}
          />
          <TextField
            label="password"
            content={password}
            onContentChange={setPassword}
            isReadonly={false}
            isCopyable={false}
            isMultiline={false}
          />
          <TextField
            label="header"
            content={encoded && `Authorization: Basic ${encoded}`}
            isReadonly={true}
            isCopyable={true}
            isMultiline={true}
          />
          <TextField
            label="credentials only"
            content={encoded}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
        </>
      ) : (
        <>
          <TextField
            label="header or credentials"
            content={header}
            onContentChange={setHeader}
            isReadonly={false}
            isCopyable={false}
            isMultiline={true}
          />
          {decoded && 'error' in decoded && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {decoded.error}
            </div>
          )}
          {decoded && 'user' in decoded && (
            <>
              <TextField
                label="username"
                content={decoded.user}
                isReadonly={true}
                isCopyable={true}
                isMultiline={false}
              />
              <TextField
                label="password"
                content={decoded.password}
                isReadonly={true}
                isCopyable={true}
                isMultiline={false}
              />
            </>
          )}
        </>
      )}

      <p className="text-[11px] text-faint">
        Basic auth is base64, not encryption — anyone who sees the header can
        read the password. Only send it over https.
      </p>
    </>
  )
}

export default BasicAuthUtil
