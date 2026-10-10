import { useState } from 'react'
import TextField from '../fields/TextField'
import { aesDecrypt, aesEncrypt } from '../crypto'

const TOGGLE = 'px-2.5 py-1 text-xs font-medium rounded-md border transition-colors'

type Mode = 'encrypt' | 'decrypt'

function AesEncryptUtil() {
  const [mode, setMode] = useState<Mode>('encrypt')
  const [input, setInput] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<boolean>(false)

  const run = async () => {
    setError(null)
    if (!input.trim()) {
      setError('Nothing to ' + mode)
      return
    }
    if (password === '') {
      setError('A password is required')
      return
    }

    setBusy(true)
    try {
      setOutput(
        mode === 'encrypt'
          ? await aesEncrypt(input, password)
          : await aesDecrypt(input, password)
      )
    } catch (caught) {
      setOutput('')
      setError((caught as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1" role="group" aria-label="Mode">
        {(['encrypt', 'decrypt'] as Mode[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => {
              setMode(option)
              setOutput('')
              setError(null)
            }}
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

      <TextField
        label={mode === 'encrypt' ? 'plain text' : 'ciphertext (base64)'}
        content={input}
        onContentChange={(value) => {
          setInput(value)
          setError(null)
        }}
        isReadonly={false}
        isCopyable={false}
        isMultiline={true}
      />

      <TextField
        label="password"
        content={password}
        onContentChange={(value) => {
          setPassword(value)
          setError(null)
        }}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />

      <button
        type="button"
        onClick={run}
        disabled={busy}
        data-testid="aes-run"
        className="w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text hover:bg-hover transition-colors disabled:opacity-50"
      >
        {busy ? 'Working…' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
      </button>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400" data-testid="aes-error">
          {error}
        </div>
      )}

      <TextField
        label={mode === 'encrypt' ? 'ciphertext (base64)' : 'plain text'}
        content={output}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />

      <p className="text-[11px] text-faint">
        AES-256-GCM. The key is derived from your password with PBKDF2-SHA256
        (250,000 rounds) and a fresh random salt, so the same input encrypts
        differently every time.
      </p>
    </>
  )
}

export default AesEncryptUtil
